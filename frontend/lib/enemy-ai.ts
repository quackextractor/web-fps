import { Enemy, Player, Point, ENEMY_CONFIG, checkCollision, findPath, hasLineOfSight, getDistance, Projectile, EnemyType, getProjectileColor, normalizeAngle, PickupType } from './fps-engine';

const ENEMY_RADIUS = 0.3;
const SEPARATION_RADIUS = 0.8;
const SEPARATION_FORCE = 2.0; // Stronger separation
const PATH_RECALC_INTERVAL = 1000;

export interface AIResult {
    spawnProjectile?: Projectile;
    playSound?: 'hurt' | 'shoot';
    damagePlayer?: number;
    dropType?: PickupType;
}

export function updateEnemyAI(
    enemy: Enemy,
    player: Player,
    map: number[][],
    allEnemies: Enemy[],
    dt: number,
    time: number,
    nextProjectileId: number
): AIResult {
    const result: AIResult = {};

    // 1. Dead Check
    if (enemy.state === 'dead') {
        if (enemy.animFrame === 0) {
            // Drop logic on first frame of death
            if (enemy.type === EnemyType.IMP) {
                result.dropType = PickupType.ORE_RED;
            } else if (enemy.type === EnemyType.DEMON) {
                result.dropType = PickupType.ORE_GREEN;
            }
        }
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
                // hardcoded speed 0.18
                const projSpeed = 0.18;
                const projectile: Projectile = {
                    id: nextProjectileId,
                    x: enemy.x,
                    y: enemy.y,
                    dx: Math.cos(angle) * projSpeed,
                    dy: Math.sin(angle) * projSpeed,
                    damage: config.damage,
                    fromEnemy: true,
                    color: config.color,
                    size: enemy.type === EnemyType.CYBERDEMON ? 0.4 : 0.2, // Simple size logic
                };

                result.spawnProjectile = projectile;
                return result; // Stop moving to shoot
            }
        }
    }

    // Animation for attacking/melee (simple frame counter)
    if (enemy.state === 'attacking' || enemy.state === 'melee') {
        enemy.animFrame++;
        if (enemy.animFrame > 20) { // arbitrary animation length
            enemy.state = 'chasing';
            enemy.animFrame = 0;
        }
        return result;
    }

    if (enemy.state !== 'chasing') return result;

    // 5. Stuck Detection
    const distMoved = Math.sqrt(Math.pow(enemy.x - enemy.lastX, 2) + Math.pow(enemy.y - enemy.lastY, 2));
    if (enemy.state === 'chasing' && distMoved < 0.01) {
        enemy.stuckFrameCount++;
    } else {
        enemy.stuckFrameCount = 0;
    }

    // Update last pos
    enemy.lastX = enemy.x;
    enemy.lastY = enemy.y;

    // Force recalc if stuck for > 0.5s (approx 30 frames at 60fps)
    const isStuck = enemy.stuckFrameCount > 30;

    // 6. Pathfinding Update
    // Only recalc path if: 
    // a) Enough time passed
    // b) Target moved significantly (optimization, optional)
    // c) No current path
    // d) We can't see the player (if we can see, we might DIRECT seek, but careful of walls)
    // e) WE ARE STUCK

    const shouldRecalc = (time - enemy.lastPathTime > PATH_RECALC_INTERVAL) || (enemy.path.length === 0) || isStuck;

    if (shouldRecalc) {
        const startNode = { x: Math.floor(enemy.x), y: Math.floor(enemy.y) };
        const endNode = { x: Math.floor(player.x), y: Math.floor(player.y) };

        // Only A* if start/end different
        if (startNode.x !== endNode.x || startNode.y !== endNode.y) {
            // Passing map, start, end. Ensure findPath signature is correct.
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
        // Follow path
        const nextNode = enemy.path[0];
        targetX = nextNode.x; // + 0.5? findPath typically returns center points now?
        targetY = nextNode.y; // + 0.5?

        // Check if findPath return integers or float centers.
        // If our findPath implementation returns simple integers, we should aim for +0.5 to be in center.
        // In doom-engine.ts, lines 797: `path.push({ x: curr.x + 0.5, y: curr.y + 0.5 });`
        // So it ALREADY returns centers. Good.

        hasTarget = true;

        // Arrival Logic
        const distToNode = getDistance(enemy.x, enemy.y, nextNode.x, nextNode.y); // Euclidean distance
        if (distToNode < 0.2) { // Strict arrival for nodes
            enemy.path.shift();
            if (enemy.path.length > 0) {
                targetX = enemy.path[0].x;
                targetY = enemy.path[0].y;
            }
        }
    } else if (canSeePlayer) {
        // Direct seek if no path but visible
        targetX = player.x;
        targetY = player.y;
        hasTarget = true;
    }

    if (hasTarget) {
        const dx = targetX - enemy.x;
        const dy = targetY - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0.01) {
            // Simple normalize
            const dirX = dx / dist;
            const dirY = dy / dist;

            moveX += dirX * enemy.speed * (dt / 16);
            moveY += dirY * enemy.speed * (dt / 16);
        }
    }

    // B. Separation Behavior
    for (const other of allEnemies) {
        if (other === enemy || other.state === 'dead') continue;

        const sdx = enemy.x - other.x;
        const sdy = enemy.y - other.y;
        const sdist = Math.sqrt(sdx * sdx + sdy * sdy);

        if (sdist < SEPARATION_RADIUS && sdist > 0.01) {
            const forceStr = (SEPARATION_RADIUS - sdist) / SEPARATION_RADIUS;
            // Push away!
            moveX += (sdx / sdist) * forceStr * enemy.speed * (dt / 16) * SEPARATION_FORCE;
            moveY += (sdy / sdist) * forceStr * enemy.speed * (dt / 16) * SEPARATION_FORCE;
        }
    }

    // 7. Collision Resolution (Slide)
    const nextX = enemy.x + moveX;
    const nextY = enemy.y + moveY;

    // Try moving X
    if (!checkCollision(map, nextX, enemy.y, ENEMY_RADIUS)) {
        enemy.x = nextX;
    }
    // Try moving Y
    if (!checkCollision(map, enemy.x, nextY, ENEMY_RADIUS)) {
        enemy.y = nextY;
    }

    enemy.animFrame = (enemy.animFrame + 1) % 120;
    return result;
}
