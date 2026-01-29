import { Enemy, Player, Point, ENEMY_CONFIG, checkCollision, findPath, hasLineOfSight, getDistance, Projectile, EnemyType, getProjectileColor, normalizeAngle } from './fps-engine';
import { GAME_CONFIG } from './game-config';

// Spatial Grid for optimized queries
export class SpatialGrid {
    private grid: Map<string, Enemy[]> = new Map();
    private cellSize: number;

    constructor(cellSize: number = GAME_CONFIG.AI.SPATIAL_GRID_SIZE) {
        this.cellSize = cellSize;
    }

    clear() {
        this.grid.clear();
    }

    update(enemies: Enemy[]) {
        this.clear();
        for (const enemy of enemies) {
            if (enemy.state === 'dead') continue;
            const cellX = Math.floor(enemy.x / this.cellSize);
            const cellY = Math.floor(enemy.y / this.cellSize);
            const key = `${cellX},${cellY}`;

            if (!this.grid.has(key)) {
                this.grid.set(key, []);
            }
            this.grid.get(key)!.push(enemy);
        }
    }

    getNearby(x: number, y: number, radius: number): Enemy[] {
        const enemies: Enemy[] = [];
        const startX = Math.floor((x - radius) / this.cellSize);
        const endX = Math.floor((x + radius) / this.cellSize);
        const startY = Math.floor((y - radius) / this.cellSize);
        const endY = Math.floor((y + radius) / this.cellSize);

        for (let gridY = startY; gridY <= endY; gridY++) {
            for (let gridX = startX; gridX <= endX; gridX++) {
                const key = `${gridX},${gridY}`;
                const cellEnemies = this.grid.get(key);
                if (cellEnemies) {
                    enemies.push(...cellEnemies);
                }
            }
        }
        return enemies;
    }
}

export interface AIResult {
    spawnProjectile?: Projectile;
    playSound?: 'hurt' | 'shoot';
    damagePlayer?: number;
}

export function updateEnemyAI(
    enemy: Enemy,
    player: Player,
    map: number[][],
    spatialGrid: SpatialGrid, // Changed from allEnemies
    dt: number,
    time: number,
    nextProjectileId: number
): AIResult {
    const result: AIResult = {};

    // 1. Dead Check
    if (enemy.state === 'dead') {
        enemy.animFrame++;
        return result;
    }

    // 2. Hurt State
    if (enemy.state === 'hurt') {
        enemy.animFrame++;
        if (enemy.animFrame > 10) {
            enemy.state = 'chasing';
            enemy.animFrame = 0;
        }
        return result;
    }

    const distToPlayer = getDistance(enemy.x, enemy.y, player.x, player.y);
    const canSeePlayer = hasLineOfSight(map, enemy.x, enemy.y, player.x, player.y);
    const config = ENEMY_CONFIG[enemy.type];

    // 3. State Transitions
    if (canSeePlayer && distToPlayer < enemy.sightRange) {
        enemy.state = 'chasing';
    } else if (enemy.state !== 'chasing' && enemy.state !== 'attacking' && enemy.state !== 'melee') {
        enemy.state = 'idle';
    }

    // 4. Combat Logic
    if (enemy.state === 'chasing' && canSeePlayer) {
        // Melee Attack
        if (config.isMelee && distToPlayer < config.meleeRange) {
            if (time - enemy.lastAttack > config.attackCooldown) {
                enemy.lastAttack = time;
                enemy.state = 'melee';
                result.damagePlayer = config.damage;
                result.playSound = 'hurt';
                return result;
            }
        }
        // Ranged Attack
        else if (!config.isMelee && distToPlayer < config.attackRange) {
            if (time - enemy.lastAttack > config.attackCooldown) {
                enemy.lastAttack = time;
                enemy.state = 'attacking';

                const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                const projectile: Projectile = {
                    id: nextProjectileId,
                    x: enemy.x,
                    y: enemy.y,
                    dx: Math.cos(angle) * GAME_CONFIG.MOVEMENT.PROJECTILE_SPEED,
                    dy: Math.sin(angle) * GAME_CONFIG.MOVEMENT.PROJECTILE_SPEED,
                    damage: config.damage,
                    fromEnemy: true,
                    color: config.color,
                    size: enemy.type === EnemyType.CYBERDEMON ? 0.4 : 0.2,
                };

                result.spawnProjectile = projectile;
                return result;
            }
        }
    }

    // Animation for attacking/melee
    if (enemy.state === 'attacking' || enemy.state === 'melee') {
        enemy.animFrame++;
        if (enemy.animFrame > 20) {
            enemy.state = 'chasing';
            enemy.animFrame = 0;
        }
        return result;
    }

    if (enemy.state !== 'chasing') return result;

    // 5. Pathfinding Update
    const shouldRecalc = (time - enemy.lastPathTime > GAME_CONFIG.AI.PATH_RECALC_INTERVAL) || (enemy.path.length === 0);

    if (shouldRecalc) {
        const startNode = { x: Math.floor(enemy.x), y: Math.floor(enemy.y) };
        const endNode = { x: Math.floor(player.x), y: Math.floor(player.y) };

        if (startNode.x !== endNode.x || startNode.y !== endNode.y) {
            enemy.path = findPath(map, startNode.x, startNode.y, endNode.x, endNode.y);
            enemy.lastPathTime = time;
        }
    }

    // 6. Movement (Steering Behaviors)
    let moveX = 0;
    let moveY = 0;
    let targetX = player.x;
    let targetY = player.y;
    let hasTarget = false;

    // A. Seek Behavior
    if (enemy.path.length > 0) {
        const nextNode = enemy.path[0];
        targetX = nextNode.x;
        targetY = nextNode.y;
        hasTarget = true;

        const distToNode = getDistance(enemy.x, enemy.y, nextNode.x, nextNode.y);
        if (distToNode < 0.2) {
            enemy.path.shift();
            if (enemy.path.length > 0) {
                targetX = enemy.path[0].x;
                targetY = enemy.path[0].y;
            }
        }
    } else if (canSeePlayer) {
        targetX = player.x;
        targetY = player.y;
        hasTarget = true;
    }

    if (hasTarget) {
        const dx = targetX - enemy.x;
        const dy = targetY - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0.01) {
            const dirX = dx / dist;
            const dirY = dy / dist;

            moveX += dirX * enemy.speed * (dt / 16);
            moveY += dirY * enemy.speed * (dt / 16);
        }
    }

    // B. Separation Behavior (Optimized using Spatial Grid)
    // Only check enemies in nearby cells
    const nearbyEnemies = spatialGrid.getNearby(enemy.x, enemy.y, GAME_CONFIG.AI.SEPARATION_RADIUS);

    for (const other of nearbyEnemies) {
        if (other === enemy || other.state === 'dead') continue;

        const sdx = enemy.x - other.x;
        const sdy = enemy.y - other.y;
        const sdist = Math.sqrt(sdx * sdx + sdy * sdy);

        if (sdist < GAME_CONFIG.AI.SEPARATION_RADIUS && sdist > 0.01) {
            const forceStr = (GAME_CONFIG.AI.SEPARATION_RADIUS - sdist) / GAME_CONFIG.AI.SEPARATION_RADIUS;
            moveX += (sdx / sdist) * forceStr * enemy.speed * (dt / 16) * GAME_CONFIG.AI.SEPARATION_FORCE;
            moveY += (sdy / sdist) * forceStr * enemy.speed * (dt / 16) * GAME_CONFIG.AI.SEPARATION_FORCE;
        }
    }

    // 7. Collision Resolution
    const nextX = enemy.x + moveX;
    const nextY = enemy.y + moveY;

    if (!checkCollision(map, nextX, enemy.y, GAME_CONFIG.AI.ENEMY_RADIUS)) {
        enemy.x = nextX;
    }
    if (!checkCollision(map, enemy.x, nextY, GAME_CONFIG.AI.ENEMY_RADIUS)) {
        enemy.y = nextY;
    }

    enemy.animFrame = (enemy.animFrame + 1) % 120;
    return result;
}
