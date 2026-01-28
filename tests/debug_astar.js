
// Mock logic from doom-engine.ts

function findPath(map, startX, startY, endX, endY) {
    const startNode = { x: Math.floor(startX), y: Math.floor(startY) };
    const endNode = { x: Math.floor(endX), y: Math.floor(endY) };

    if (startNode.x === endNode.x && startNode.y === endNode.y) {
        return [];
    }

    // BUG FIX: If endNode is in a wall, find the nearest free node
    if (
        endNode.y >= 0 && endNode.y < map.length &&
        endNode.x >= 0 && endNode.x < map[0].length &&
        (map[endNode.y][endNode.x] > 0 && map[endNode.y][endNode.x] !== 9)
    ) {
        let found = false;
        for (let radius = 1; radius <= 3; radius++) {
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const ny = endNode.y + dy;
                    const nx = endNode.x + dx;
                    if (ny >= 0 && ny < map.length && nx >= 0 && nx < map[0].length && (map[ny][nx] === 0 || map[ny][nx] === 9)) {
                        endNode.x = nx;
                        endNode.y = ny;
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
            if (found) break;
        }
    }

    const openList = [];
    const closedList = Array(map.length).fill(false).map(() => Array(map[0].length).fill(false));

    openList.push({
        x: startNode.x,
        y: startNode.y,
        f: 0,
        g: 0,
        h: 0,
        parent: null,
    });

    const neighbors = [
        { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 },
        { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: 1 },
    ];

    let iterations = 0;
    while (openList.length > 0 && iterations < 500) {
        iterations++;
        let lowInd = 0;
        for (let i = 0; i < openList.length; i++) {
            if (openList[i].f < openList[lowInd].f) lowInd = i;
        }
        const currentNode = openList[lowInd];

        if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
            // Path found
            const path = [];
            let curr = currentNode;
            while (curr.parent) {
                path.push({ x: curr.x + 0.5, y: curr.y + 0.5 });
                curr = curr.parent;
            }
            return path.reverse();
        }

        openList.splice(lowInd, 1);

        if (currentNode.y >= 0 && currentNode.y < map.length && currentNode.x >= 0 && currentNode.x < map[0].length) {
            closedList[currentNode.y][currentNode.x] = true;
        }

        for (const neighbor of neighbors) {
            const neighborX = currentNode.x + neighbor.x;
            const neighborY = currentNode.y + neighbor.y;

            if (neighborY < 0 || neighborY >= map.length || neighborX < 0 || neighborX >= map[0].length) continue;

            // BLOCK CHECK
            if (map[neighborY][neighborX] > 0 && map[neighborY][neighborX] !== 9) continue;

            if (closedList[neighborY][neighborX]) continue;

            // Corner check skipped for brevity in repro, assuming it's not the issue here

            const gScore = currentNode.g + 1;
            let gScoreIsBest = false;
            const existingNode = openList.find(n => n.x === neighborX && n.y === neighborY);

            if (!existingNode) {
                gScoreIsBest = true;
                const h = Math.sqrt(Math.pow(neighborX - endNode.x, 2) + Math.pow(neighborY - endNode.y, 2));
                openList.push({ x: neighborX, y: neighborY, g: gScore, h: h, f: gScore + h, parent: currentNode });
            }
        }
    }
    return [];
}


// Mock hasLineOfSight
function hasLineOfSight(map, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(distance * 8); // 8 steps per unit

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = x1 + dx * t;
        const y = y1 + dy * t;
        const mapX = Math.floor(x);
        const mapY = Math.floor(y);

        if (mapY >= 0 && mapY < map.length && mapX >= 0 && mapX < map[0].length) {
            if (map[mapY][mapX] > 0 && map[mapY][mapX] !== 9) return false;
        }
    }
    return true;
}

function hasClearWalkingPath(map, x1, y1, x2, y2, radius) {
    // Check center line
    if (!hasLineOfSight(map, x1, y1, x2, y2)) return false;

    // Calculate perpendicular offset vector
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist === 0) return true;

    // Normalized perpendicular vector (-y, x)
    const px = (-dy / dist) * radius;
    const py = (dx / dist) * radius;

    // Check left edge
    if (!hasLineOfSight(map, x1 + px, y1 + py, x2 + px, y2 + py)) return false;

    // Check right edge
    if (!hasLineOfSight(map, x1 - px, y1 - py, x2 - px, y2 - py)) return false;

    return true;
}

// TEST CASES
const map = Array(10).fill(0).map(() => Array(10).fill(0));
map[5][5] = 1; // Wall at 5,5

console.log("Test 1: Normal path");
const p1 = findPath(map, 1, 1, 8, 8);
console.log("Path length:", p1.length);

console.log("Test 2: Target is inside wall (5,5)");
const p2 = findPath(map, 1, 1, 5, 5);
console.log("Path length (with spiral fix):", p2.length);

console.log("Test 3: Width Awareness (Gap check)");
// Create a narrow gap at y=5, x=5 is OPEN. x=4 and x=6 are WALLS.
const gapMap = Array(10).fill(0).map(() => Array(10).fill(0));
gapMap[5][4] = 1;
gapMap[5][6] = 1;
// Try to walk from 5,4 to 5,6 (Through 5,5) - Wait, 5,4 is wall
// Walk from 5, 2 to 5, 8. Through 5,5.
const startX = 5.5, startY = 2.5;
const endX = 5.5, endY = 8.5;

console.log("Gap is 1.0 wide (Tile 5).");
console.log("Radius 0.3 (Width 0.6) -> Should Pass:", hasClearWalkingPath(gapMap, startX, startY, endX, endY, 0.3));
console.log("Radius 0.6 (Width 1.2) -> Should Fail:", hasClearWalkingPath(gapMap, startX, startY, endX, endY, 0.6));
