import { StateManager } from "./StateManager";
import { InputSystem } from "./core/InputSystem";
import { Renderer } from "./graphics/Renderer";
import {
    checkCollision,
    LEVELS,
    getDistance,
    normalizeAngle,
    castRay,
    hasLineOfSight,
    WEAPON_CONFIG,
    ENEMY_CONFIG,
    PICKUP_CONFIG,
    WeaponType,
    AmmoType,
    PickupType,
    type Enemy,
    type Projectile
} from "@/lib/fps-engine";
import { updateEnemyAI } from "@/lib/enemy-ai";
import { soundManager } from "@/lib/sound-manager";

// Callback type for communicating high-level state changes to React
type GameEvent = "victory" | "dead" | "levelComplete";

export class GameEngine {
    state: StateManager;
    input: InputSystem;
    renderer: Renderer;
    private onEvent: (event: GameEvent) => void;

    // Loop Variables
    private lastTime = 0;
    private accumulator = 0;
    private readonly TICK_RATE = 1000 / 60; // Fixed 60hz update
    private animationId: number = 0;
    private isRunning = false;
    private lastShotTime = 0;

    // Settings
    mouseSensitivity = 1.0;
    turnSpeed = 1.0;

    constructor(canvas: HTMLCanvasElement, onEvent: (event: GameEvent) => void) {
        this.state = new StateManager();
        this.input = new InputSystem();
        this.renderer = new Renderer(canvas);
        this.onEvent = onEvent;

        // Attach input listeners to the canvas/window
        this.input.attach(canvas);
    }

    // --- Game Loop Management ---

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }

    stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);
    }

    destroy(canvas: HTMLCanvasElement) {
        this.stop();
        this.input.detach(canvas);
    }

    // The main loop driver
    private loop = (time: number) => {
        if (!this.isRunning) return;

        // Calculate delta time
        const deltaTime = Math.min(time - this.lastTime, 100); // Cap to prevent death spiral
        this.lastTime = time;
        this.accumulator += deltaTime;

        // Fixed Update Step (Physics/Logic)
        while (this.accumulator >= this.TICK_RATE) {
            this.fixedUpdate(this.TICK_RATE);
            this.accumulator -= this.TICK_RATE;
        }

        // Render Step (Interpolation could be added here)
        this.renderer.render(this.state, {}); // Pass settings if needed
        this.animationId = requestAnimationFrame(this.loop);
    };

    // --- Core Game Logic ---

    // Replaces the huge fixedUpdate function in fps-game.tsx
    private fixedUpdate(dt: number) {
        const { player } = this.state;
        const level = LEVELS[this.state.currentLevelIdx];

        // 1. Movement Logic
        let newX = player.x;
        let newY = player.y;
        let newAngle = player.angle;
        let isMoving = false;

        // Mouse Rotation
        const mouseMove = this.input.getAndResetMouseMovement();
        if (mouseMove !== 0) {
            newAngle += mouseMove * 0.003 * this.mouseSensitivity;
        }

        // Keyboard Rotation (Arrow Keys)
        if (this.input.keys.has("arrowleft")) newAngle -= 0.05 * this.turnSpeed;
        if (this.input.keys.has("arrowright")) newAngle += 0.05 * this.turnSpeed;
        if (this.input.keys.has("q")) newAngle -= 0.05 * this.turnSpeed;

        // Movement Vectors
        const moveX = Math.cos(newAngle);
        const moveY = Math.sin(newAngle);
        const strafeX = Math.cos(newAngle - Math.PI / 2);
        const strafeY = Math.sin(newAngle - Math.PI / 2);
        const SPEED = 0.08;

        // WASD / Arrow Movement with Collision
        if (this.input.keys.has("w") || this.input.keys.has("arrowup")) {
            const testX = newX + moveX * SPEED;
            const testY = newY + moveY * SPEED;
            if (!checkCollision(level.map, testX, newY)) newX = testX;
            if (!checkCollision(level.map, newX, testY)) newY = testY;
            isMoving = true;
        }
        if (this.input.keys.has("s") || this.input.keys.has("arrowdown")) {
            const testX = newX - moveX * SPEED;
            const testY = newY - moveY * SPEED;
            if (!checkCollision(level.map, testX, newY)) newX = testX;
            if (!checkCollision(level.map, newX, testY)) newY = testY;
            isMoving = true;
        }
        if (this.input.keys.has("a")) {
            const testX = newX + strafeX * SPEED;
            const testY = newY + strafeY * SPEED;
            if (!checkCollision(level.map, testX, newY)) newX = testX;
            if (!checkCollision(level.map, newX, testY)) newY = testY;
            isMoving = true;
        }
        if (this.input.keys.has("d")) {
            const testX = newX - strafeX * SPEED;
            const testY = newY - strafeY * SPEED;
            if (!checkCollision(level.map, testX, newY)) newX = testX;
            if (!checkCollision(level.map, newX, testY)) newY = testY;
            isMoving = true;
        }

        // 2. Attack Handling
        if (this.input.keys.has(" ") || this.input.keys.has("f") || this.input.mouseDown) {
            this.handleAttack();
        }

        // 3. Update Player State
        this.state.player.x = newX;
        this.state.player.y = newY;
        this.state.player.angle = newAngle;
        this.state.player.isMoving = isMoving;

        // Bobbing logic
        if (isMoving) this.state.player.bobPhase += dt * 0.012;

        // Melee Animation
        if (this.state.player.isMeleeing) {
            this.state.player.meleeFrame += dt * 0.02;
            if (this.state.player.meleeFrame > 1) {
                this.state.player.isMeleeing = false;
                this.state.player.meleeFrame = 0;
            }
        }

        // Weapon Switching
        if (this.input.keys.has("1")) this.switchWeapon(WeaponType.FIST);
        if (this.input.keys.has("2")) this.switchWeapon(WeaponType.CHAINSAW);
        if (this.input.keys.has("3")) this.switchWeapon(WeaponType.PISTOL);
        if (this.input.keys.has("4")) this.switchWeapon(WeaponType.SHOTGUN);
        if (this.input.keys.has("5")) this.switchWeapon(WeaponType.CHAINGUN);

        // 4. Update Enemies (AI)
        const now = performance.now();
        for (const enemy of this.state.enemies) {
            if (enemy.state === "dead") {
                enemy.animFrame++; // Continue death animation
                continue;
            }

            // AI Logic from library
            const result = updateEnemyAI(
                enemy, this.state.player, level.map,
                this.state.enemies, dt, now, this.state.projectileId
            );

            // Handle AI outputs
            if (result.damagePlayer) this.damagePlayer(result.damagePlayer);
            if (result.spawnProjectile) {
                this.state.projectiles.push(result.spawnProjectile);
                this.state.projectileId++;
            }

            enemy.animFrame = (enemy.animFrame + 1) % 120;
        }

        // 5. Update Projectiles
        this.updateProjectiles(level);

        // 6. Handle Pickups
        this.handlePickups();

        // 7. Flash Effects Decay
        if (this.state.shootFlash > 0) this.state.shootFlash--;
        if (this.state.hurtFlash > 0) this.state.hurtFlash -= 0.5;

        // 8. Check Level Exit
        const exitDist = getDistance(level.exitX, level.exitY, player.x, player.y);
        const aliveEnemies = this.state.enemies.filter(e => e.state !== "dead").length;

        if (exitDist < 1 && aliveEnemies === 0) {
            this.onEvent("levelComplete");
            this.stop();
        }
    }

    // --- Helper Logic Methods ---

    private handleAttack() {
        const { player } = this.state;
        const weapon = WEAPON_CONFIG[player.weapon];
        const now = performance.now();

        // Fire Rate Check
        if (now - this.lastShotTime < weapon.fireRate) return;

        // Ammo Check
        if (weapon.ammoType !== null) {
            if (player.ammo[weapon.ammoType] < weapon.ammoCost) return;
            player.ammo[weapon.ammoType] -= weapon.ammoCost;
        }

        this.lastShotTime = now;
        this.state.shootFlash = weapon.isMelee ? 4 : 8;
        soundManager.playShoot(player.weapon);

        // Animation triggers
        if (weapon.isMelee) {
            player.isMeleeing = true;
            player.meleeFrame = 0;
        }

        const level = LEVELS[this.state.currentLevelIdx];

        // Pellet Loop (Shotguns shoot multiple, Pistols shoot 1)
        for (let p = 0; p < weapon.pellets; p++) {
            const spreadAngle = player.angle + (Math.random() - 0.5) * weapon.spread;

            if (weapon.isMelee) {
                // Melee Hit Logic
                for (const enemy of this.state.enemies) {
                    if (enemy.state === "dead") continue;

                    const dist = getDistance(enemy.x, enemy.y, player.x, player.y);
                    if (dist > weapon.range) continue;

                    const angleToEnemy = Math.atan2(enemy.y - player.y, enemy.x - player.x);
                    const angleDiff = normalizeAngle(angleToEnemy - player.angle);

                    if (Math.abs(angleDiff) < 0.6) {
                        this.damageEnemy(enemy, weapon.damage);
                    }
                }
            } else {
                // Raycast / Hitscan Logic
                const hitResult = castRay(level.map, player.x, player.y, spreadAngle);

                let closestHitIndex = -1;
                let closestDist = Math.min(hitResult.distance, weapon.range);

                // Check intersections with all enemies
                for (let i = 0; i < this.state.enemies.length; i++) {
                    const enemy = this.state.enemies[i];
                    if (enemy.state === "dead") continue;

                    const dx = enemy.x - player.x;
                    const dy = enemy.y - player.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const angleToEnemy = Math.atan2(dy, dx);
                    const angleDiff = normalizeAngle(angleToEnemy - spreadAngle);

                    const enemySize = ENEMY_CONFIG[enemy.type].size;
                    const hitAngle = Math.atan2(enemySize / 2, dist);

                    if (Math.abs(angleDiff) < hitAngle && dist < closestDist) {
                        if (hasLineOfSight(level.map, player.x, player.y, enemy.x, enemy.y)) {
                            closestHitIndex = i;
                            closestDist = dist;
                        }
                    }
                }

                if (closestHitIndex !== -1) {
                    this.damageEnemy(this.state.enemies[closestHitIndex], weapon.damage);
                }
            }
        }
    }

    private damageEnemy(enemy: Enemy, baseDamage: number) {
        // Randomized damage
        const damage = baseDamage * (0.8 + Math.random() * 0.4);
        enemy.health -= damage;

        if (enemy.health <= 0) {
            enemy.state = "dead";
            enemy.animFrame = 0;
            this.state.kills++;
            this.state.totalKills++;
            soundManager.playEnemyDeath(enemy.type);
        } else {
            enemy.state = "hurt";
        }
    }

    private damagePlayer(amount: number) {
        // Armor reduction logic
        if (this.state.player.armor > 0) {
            const armorAbsorb = Math.min(this.state.player.armor, amount * 0.5);
            this.state.player.armor -= armorAbsorb;
            amount -= armorAbsorb;
        }

        this.state.player.health = Math.max(0, this.state.player.health - amount);
        this.state.hurtFlash = 10; // Trigger red screen
        soundManager.playHurt();

        if (this.state.player.health <= 0) {
            this.onEvent("dead");
            this.stop();
        }
    }

    private updateProjectiles(level: any) {
        // Filter returns true to keep, false to remove
        this.state.projectiles = this.state.projectiles.filter(proj => {
            proj.x += proj.dx;
            proj.y += proj.dy;

            // Wall collision
            if (checkCollision(level.map, proj.x, proj.y, 0.1)) return false;

            // Player collision (if from enemy)
            if (proj.fromEnemy) {
                const distToPlayer = getDistance(proj.x, proj.y, this.state.player.x, this.state.player.y);
                if (distToPlayer < 0.5) {
                    this.damagePlayer(proj.damage);
                    return false;
                }
            }

            // Cull if too far
            return getDistance(proj.x, proj.y, this.state.player.x, this.state.player.y) < 40;
        });
    }

    private handlePickups() {
        for (const pickup of this.state.pickups) {
            if (pickup.collected) continue;

            const dist = getDistance(pickup.x, pickup.y, this.state.player.x, this.state.player.y);
            if (dist < 0.8) {
                pickup.collected = true;
                soundManager.playPickup(pickup.type);

                const config = PICKUP_CONFIG[pickup.type];
                const { player } = this.state;

                // Apply pickup effects
                switch (pickup.type) {
                    case PickupType.HEALTH:
                        player.health = Math.min(player.maxHealth, player.health + config.value);
                        break;
                    case PickupType.MEGAHEALTH:
                        player.health = Math.min(200, player.health + config.value);
                        player.maxHealth = Math.max(player.maxHealth, player.health);
                        break;
                    case PickupType.ARMOR:
                        player.armor = Math.min(100, player.armor + config.value);
                        break;
                    case PickupType.AMMO_BULLETS:
                        player.ammo[AmmoType.BULLETS] += config.value;
                        break;
                    case PickupType.AMMO_SHELLS:
                        player.ammo[AmmoType.SHELLS] += config.value;
                        break;
                    case PickupType.WEAPON_SHOTGUN:
                        this.state.unlockedWeapons.add(WeaponType.SHOTGUN);
                        player.weapon = WeaponType.SHOTGUN;
                        player.ammo[AmmoType.SHELLS] += 8;
                        break;
                    case PickupType.WEAPON_CHAINGUN:
                        this.state.unlockedWeapons.add(WeaponType.CHAINGUN);
                        player.weapon = WeaponType.CHAINGUN;
                        player.ammo[AmmoType.BULLETS] += 40;
                        break;
                    case PickupType.WEAPON_CHAINSAW:
                        this.state.unlockedWeapons.add(WeaponType.CHAINSAW);
                        player.weapon = WeaponType.CHAINSAW;
                        break;
                }
            }
        }
    }

    private switchWeapon(w: WeaponType) {
        if (this.state.unlockedWeapons.has(w)) {
            this.state.player.weapon = w;
        }
    }
}