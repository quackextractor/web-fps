import { StateManager } from "../StateManager";
import {
    castRay,
    getDistance,
    normalizeAngle,
    WALL_COLORS,
    LEVELS,
    ENEMY_CONFIG,
    PICKUP_CONFIG,
    WEAPON_CONFIG,
    WeaponType,
    EnemyType,
    PickupType,
    type Enemy,
    type Projectile,
    type Pickup,
    type Level
} from "@/lib/fps-engine";
import {
    shadeColor,
    drawWeapon,
    drawImp,
    drawDemon,
    drawSoldier,
    drawCacodemon,
    drawBaron,
    drawZombie,
    drawHellKnight,
    drawCyberdemon
} from "./Sprites"; // Assumes Sprites.ts exports these from previous step

export class Renderer {
    ctx: CanvasRenderingContext2D;
    offscreen: HTMLCanvasElement;
    offCtx: CanvasRenderingContext2D;

    // Viewport Settings
    width: number = 800;
    height: number = 600;
    numRays: number = 200;
    readonly FOV = Math.PI / 3;

    constructor(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d", { alpha: false })!;

        // Create offscreen buffer for smoother rendering
        this.offscreen = document.createElement("canvas");
        this.offCtx = this.offscreen.getContext("2d", { alpha: false })!;

        // Initial size
        this.resize(800, 600);
    }

    resize(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.offscreen.width = w;
        this.offscreen.height = h;
        // Maintain aspect ratio of rays (approx 1 ray per 4 pixels width default)
        this.numRays = Math.floor(w / 4);
    }

    // Main Render Loop
    render(state: StateManager, settings: { showFPS?: boolean; debugMode?: boolean; crosshairStyle?: string } = {}) {
        const ctx = this.offCtx;
        const { player, enemies, projectiles, pickups, shootFlash, hurtFlash, currentLevelIdx } = state;
        const level = LEVELS[currentLevelIdx];

        // 1. Draw Floor and Ceiling
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, this.width, this.height);

        // Ceiling Gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height / 2);
        gradient.addColorStop(0, "#1a0505");
        gradient.addColorStop(1, "#3d0a0a");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height / 2);

        // Floor Gradient
        const floorGradient = ctx.createLinearGradient(0, this.height / 2, 0, this.height);
        floorGradient.addColorStop(0, "#2a2a2a");
        floorGradient.addColorStop(1, "#1a1a1a");
        ctx.fillStyle = floorGradient;
        ctx.fillRect(0, this.height / 2, this.width, this.height / 2);

        // 2. Raycasting Wall Loop
        const zBuffer: number[] = new Array(this.numRays);
        const rayWidth = this.width / this.numRays;

        for (let i = 0; i < this.numRays; i++) {
            const rayAngle = player.angle - this.FOV / 2 + (i / this.numRays) * this.FOV;
            const { distance, wallType, side } = castRay(level.map, player.x, player.y, rayAngle);

            // Fish-eye correction
            const correctedDist = distance * Math.cos(rayAngle - player.angle);
            zBuffer[i] = correctedDist;

            const wallHeight = Math.min((this.height / correctedDist) * 1.2, this.height);
            const wallTop = (this.height - wallHeight) / 2;

            const colors = WALL_COLORS[wallType] || WALL_COLORS;
            const baseColor = side === 0 ? colors.light : colors.dark;

            // Distance shading
            const shade = Math.max(0.2, 1 - correctedDist / 15);

            ctx.fillStyle = shadeColor(baseColor, shade);
            // Draw wall strip (adding +1 to width to prevent sub-pixel gaps)
            ctx.fillRect(Math.floor(i * rayWidth), Math.floor(wallTop), Math.ceil(rayWidth) + 1, Math.ceil(wallHeight));
        }

        // 3. Sprite Sorting (Painter's Algorithm)
        // Combine all renderable entities into one list and sort by distance descending
        const sprites = [
            ...enemies.filter(e => e.state !== "dead" || e.animFrame < 30).map(e => ({
                type: 'enemy',
                data: e,
                dist: getDistance(e.x, e.y, player.x, player.y)
            })),
            ...projectiles.map(p => ({
                type: 'projectile',
                data: p,
                dist: getDistance(p.x, p.y, player.x, player.y)
            })),
            ...pickups.filter(p => !p.collected).map(p => ({
                type: 'pickup',
                data: p,
                dist: getDistance(p.x, p.y, player.x, player.y)
            }))
        ].sort((a, b) => b.dist - a.dist);

        // 4. Render Sprites
        for (const sprite of sprites) {
            if (sprite.type === 'enemy') {
                this.renderEnemy(ctx, player, sprite.data as Enemy, sprite.dist, zBuffer);
            } else if (sprite.type === 'projectile') {
                this.renderProjectile(ctx, player, sprite.data as Projectile, sprite.dist, zBuffer);
            } else {
                this.renderPickup(ctx, player, sprite.data as Pickup, sprite.dist, zBuffer);
            }
        }

        // 5. Weapon & HUD
        drawWeapon(ctx, player, this.width, this.height, shootFlash);
        this.drawHUD(ctx, state, level, settings.crosshairStyle || "cross");

        // 6. Blit Offscreen to Main Canvas
        this.ctx.drawImage(this.offscreen, 0, 0);

        // 7. Post-Processing Effects (Flash)
        if (hurtFlash > 0) {
            const hurtAlpha = hurtFlash / 10;
            this.ctx.save();
            this.ctx.fillStyle = `rgba(255, 0, 0, ${hurtAlpha * 0.5})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.restore();
        }

        if (shootFlash > 0) {
            this.ctx.save();
            this.ctx.fillStyle = `rgba(255, 200, 100, ${shootFlash / 20})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.restore();
        }

        // 8. Debug View Overlay
        if (settings.debugMode) {
            this.renderDebugView(this.ctx, level, player, enemies);
        }
    }

    // --- Entity Renderers ---

    private renderEnemy(ctx: CanvasRenderingContext2D, player: any, enemy: Enemy, dist: number, zBuffer: number[]) {
        // Logic from
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const angleToEnemy = Math.atan2(dy, dx);
        const relAngle = normalizeAngle(angleToEnemy - player.angle);

        if (Math.abs(relAngle) > this.FOV / 2 + 0.15) return;

        const screenX = this.width / 2 + (relAngle / this.FOV) * this.width;
        const config = ENEMY_CONFIG[enemy.type];
        const spriteHeight = (this.height / dist) * config.size * 1.5;
        const spriteWidth = spriteHeight * 0.8;
        const spriteTop = (this.height - spriteHeight) / 2;
        const spriteLeft = screenX - spriteWidth / 2;
        const spriteRight = screenX + spriteWidth / 2;

        // Z-Buffer Check (Optimization: Check random rays or edges)
        const startRay = Math.floor((spriteLeft / this.width) * this.numRays);
        const endRay = Math.ceil((spriteRight / this.width) * this.numRays);
        let visible = false;

        for (let r = startRay; r <= endRay; r++) {
            if (r >= 0 && r < this.numRays && zBuffer[r] > dist - 0.3) {
                visible = true;
                break;
            }
        }
        if (!visible) return;

        const shade = Math.max(0.3, 1 - dist / 12);

        ctx.save();

        // Clip mask to hide sprite behind walls
        ctx.beginPath();
        for (let r = startRay; r <= endRay; r++) {
            if (r >= 0 && r < this.numRays && zBuffer[r] > dist - 0.3) {
                const rayX = (r / this.numRays) * this.width;
                const rWidth = this.width / this.numRays;
                ctx.rect(rayX, 0, rWidth + 1, this.height);
            }
        }
        ctx.clip();

        // Delegate specific drawing to Sprites.ts helper functions
        switch (enemy.type) {
            case EnemyType.IMP: drawImp(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade); break;
            case EnemyType.DEMON: drawDemon(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade); break;
            case EnemyType.SOLDIER: drawSoldier(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade); break;
            case EnemyType.CACODEMON: drawCacodemon(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade); break;
            case EnemyType.BARON: drawBaron(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade); break;
            case EnemyType.ZOMBIE: drawZombie(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade); break;
            case EnemyType.HELLKNIGHT: drawHellKnight(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade); break;
            case EnemyType.CYBERDEMON: drawCyberdemon(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade); break;
        }

        ctx.restore();
    }

    private renderProjectile(ctx: CanvasRenderingContext2D, player: any, proj: Projectile, dist: number, zBuffer: number[]) {
        // Logic from
        const dx = proj.x - player.x;
        const dy = proj.y - player.y;
        const angleToProj = Math.atan2(dy, dx);
        const relAngle = normalizeAngle(angleToProj - player.angle);

        if (Math.abs(relAngle) > this.FOV / 2 + 0.2) return;

        const screenX = this.width / 2 + (relAngle / this.FOV) * this.width;
        const size = Math.max(4, (this.height / dist) * proj.size);

        // Simple Z-buffer check at center
        const centerRay = Math.floor((screenX / this.width) * this.numRays);
        if (centerRay >= 0 && centerRay < this.numRays && zBuffer[centerRay] < dist - 0.3) return;

        ctx.save();
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = proj.color;
        ctx.beginPath();
        ctx.arc(screenX, this.height / 2, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(screenX, this.height / 2, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    private renderPickup(ctx: CanvasRenderingContext2D, player: any, pickup: Pickup, dist: number, zBuffer: number[]) {
        // Logic from
        const dx = pickup.x - player.x;
        const dy = pickup.y - player.y;
        const angleToPickup = Math.atan2(dy, dx);
        const relAngle = normalizeAngle(angleToPickup - player.angle);

        if (Math.abs(relAngle) > this.FOV / 2 + 0.2) return;

        const screenX = this.width / 2 + (relAngle / this.FOV) * this.width;
        const size = Math.max(8, (this.height / dist) * 0.3);

        const centerRay = Math.floor((screenX / this.width) * this.numRays);
        if (centerRay >= 0 && centerRay < this.numRays && zBuffer[centerRay] < dist - 0.3) return;

        const config = PICKUP_CONFIG[pickup.type];
        const bob = Math.sin(performance.now() * 0.003) * size * 0.2;
        const screenY = this.height / 2 + (this.height / dist) * 0.2 + bob;

        ctx.save();
        ctx.shadowColor = config.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = config.color;

        if (pickup.type === PickupType.HEALTH || pickup.type === PickupType.MEGAHEALTH) {
            ctx.fillRect(screenX - size / 4, screenY - size, size / 2, size * 2);
            ctx.fillRect(screenX - size, screenY - size / 4, size * 2, size / 2);
        } else if (pickup.type === PickupType.ARMOR) {
            ctx.beginPath();
            ctx.moveTo(screenX, screenY - size);
            ctx.lineTo(screenX + size, screenY - size / 2);
            ctx.lineTo(screenX + size * 0.8, screenY + size);
            ctx.lineTo(screenX, screenY + size * 0.7);
            ctx.lineTo(screenX - size * 0.8, screenY + size);
            ctx.lineTo(screenX - size, screenY - size / 2);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillRect(screenX - size, screenY - size, size * 2, size * 2);
            ctx.fillStyle = "#fff";
            ctx.fillRect(screenX - size * 0.3, screenY - size * 0.3, size * 0.6, size * 0.6);
        }
        ctx.restore();
    }

    // --- UI & Debug Renderers ---

    private drawHUD(ctx: CanvasRenderingContext2D, state: StateManager, level: Level, crosshairStyle: string) {
        const { player, enemies, unlockedWeapons, currentLevelIdx } = state;
        const SCREEN_HEIGHT = this.height;
        const SCREEN_WIDTH = this.width;

        // Background Bar
        ctx.fillStyle = "rgba(40, 40, 40, 0.9)";
        ctx.fillRect(0, SCREEN_HEIGHT - 70, SCREEN_WIDTH, 70);

        // Health Bar
        ctx.fillStyle = "#333";
        ctx.fillRect(15, SCREEN_HEIGHT - 55, 180, 22);
        const healthColor = player.health > 50 ? "#00aa00" : player.health > 25 ? "#ffaa00" : "#ff0000";
        ctx.fillStyle = healthColor;
        ctx.fillRect(15, SCREEN_HEIGHT - 55, (player.health / player.maxHealth) * 180, 22);
        ctx.strokeStyle = "#666";
        ctx.strokeRect(15, SCREEN_HEIGHT - 55, 180, 22);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px monospace";
        ctx.fillText(`HP: ${Math.ceil(player.health)}`, 20, SCREEN_HEIGHT - 40);

        // Armor Bar
        if (player.armor > 0) {
            ctx.fillStyle = "#333";
            ctx.fillRect(15, SCREEN_HEIGHT - 28, 180, 12);
            ctx.fillStyle = "#0088ff";
            ctx.fillRect(15, SCREEN_HEIGHT - 28, (player.armor / 100) * 180, 12);
            ctx.strokeStyle = "#666";
            ctx.strokeRect(15, SCREEN_HEIGHT - 28, 180, 12);
            ctx.fillStyle = "#88ccff";
            ctx.font = "bold 10px monospace";
            ctx.fillText(`ARMOR: ${Math.ceil(player.armor)}`, 20, SCREEN_HEIGHT - 19);
        }

        // Weapon Info
        const weapon = WEAPON_CONFIG[player.weapon];
        ctx.fillStyle = "#fff";
        ctx.font = "bold 16px monospace";
        ctx.fillText(weapon.name.toUpperCase(), 220, SCREEN_HEIGHT - 45);

        if (weapon.ammoType) {
            ctx.fillStyle = "#ffcc00";
            ctx.font = "bold 24px monospace";
            ctx.fillText(`${player.ammo[weapon.ammoType]}`, 220, SCREEN_HEIGHT - 18);
            ctx.fillStyle = "#888";
            ctx.font = "12px monospace";
            ctx.fillText(weapon.ammoType.toUpperCase(), 280, SCREEN_HEIGHT - 20);
        } else {
            ctx.fillStyle = "#888";
            ctx.font = "14px monospace";
            ctx.fillText("MELEE", 220, SCREEN_HEIGHT - 20);
        }

        // Stats
        const deadEnemies = enemies.filter(e => e.state === "dead").length;
        ctx.fillStyle = "#ff4444";
        ctx.font = "bold 16px monospace";
        ctx.fillText(`KILLS: ${deadEnemies}/${enemies.length}`, 380, SCREEN_HEIGHT - 35);
        ctx.fillStyle = "#aaa";
        ctx.font = "12px monospace";
        ctx.fillText(level.name, 380, SCREEN_HEIGHT - 18);

        // Weapon Inventory Slots
        const weapons = [WeaponType.FIST, WeaponType.CHAINSAW, WeaponType.PISTOL, WeaponType.SHOTGUN, WeaponType.CHAINGUN];
        weapons.forEach((w, i) => {
            const hasWeapon = unlockedWeapons.has(w);
            const isActive = player.weapon === w;
            const slotX = 525 + i * 25;
            const slotY = SCREEN_HEIGHT - 55;

            ctx.fillStyle = isActive ? "#ff6600" : hasWeapon ? "#444" : "#222";
            ctx.fillRect(slotX, slotY, 22, 35);
            if (hasWeapon) {
                ctx.fillStyle = isActive ? "#fff" : "#888";
                ctx.font = "bold 10px monospace";
                ctx.fillText(`${i + 1}`, slotX + 7, slotY + 22);
            }
        });

        // Minimap
        this.drawMinimap(ctx, state, level);

        // Crosshair
        ctx.strokeStyle = "#0f0";
        ctx.fillStyle = "#0f0";
        ctx.lineWidth = 2;
        const cx = SCREEN_WIDTH / 2;
        const cy = SCREEN_HEIGHT / 2;

        if (crosshairStyle === "cross") {
            ctx.beginPath();
            ctx.moveTo(cx - 15, cy); ctx.lineTo(cx - 5, cy);
            ctx.moveTo(cx + 5, cy); ctx.lineTo(cx + 15, cy);
            ctx.moveTo(cx, cy - 15); ctx.lineTo(cx, cy - 5);
            ctx.moveTo(cx, cy + 5); ctx.lineTo(cx, cy + 15);
            ctx.stroke();
        } else if (crosshairStyle === "dot") {
            ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
        } else { // circle
            ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.stroke();
        }
    }

    private drawMinimap(ctx: CanvasRenderingContext2D, state: StateManager, level: Level) {
        // Logic from
        const mapSize = 90;
        const mapX = this.width - mapSize - 15;
        const mapY = this.height - mapSize - 80;
        const cellWidth = mapSize / level.map.length;
        const cellHeight = mapSize / level.map.length;

        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(mapX - 2, mapY - 2, mapSize + 4, mapSize + 4);

        for (let row = 0; row < level.map.length; row++) {
            for (let col = 0; col < level.map[row].length; col++) {
                const cell = level.map[row][col];
                if (cell > 0) {
                    ctx.fillStyle = cell === 9 ? "#ffaa00" : "#555";
                    ctx.fillRect(
                        Math.floor(mapX + col * cellWidth),
                        Math.floor(mapY + row * cellHeight),
                        Math.ceil(cellWidth) + 1,
                        Math.ceil(cellHeight) + 1
                    );
                }
            }
        }

        // Player
        ctx.fillStyle = "#0f0";
        ctx.beginPath();
        ctx.arc(mapX + state.player.x * cellWidth, mapY + state.player.y * cellHeight, 3, 0, Math.PI * 2);
        ctx.fill();

        // Enemies
        state.enemies.forEach(enemy => {
            if (enemy.state !== "dead") {
                ctx.fillStyle = "#f00";
                ctx.beginPath();
                ctx.arc(mapX + enemy.x * cellWidth, mapY + enemy.y * cellHeight, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    private renderDebugView(ctx: CanvasRenderingContext2D, level: Level, player: any, enemies: Enemy[]) {
        // Logic from
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, this.width, this.height);
        const scale = Math.min(this.width, this.height) / Math.max(level.map.length, level.map.length) * 0.8;
        const offsetX = this.width / 2 - (level.map.length * scale) / 2;
        const offsetY = this.height / 2 - (level.map.length * scale) / 2;

        // Draw Map Walls
        for (let y = 0; y < level.map.length; y++) {
            for (let x = 0; x < level.map[y].length; x++) {
                if (level.map[y][x] > 0) {
                    ctx.fillStyle = level.map[y][x] === 9 ? "#0f0" : "#888";
                    ctx.fillRect(offsetX + x * scale, offsetY + y * scale, scale, scale);
                }
                ctx.strokeStyle = "#333";
                ctx.strokeRect(offsetX + x * scale, offsetY + y * scale, scale, scale);
            }
        }

        // Draw Player
        ctx.fillStyle = "#0af";
        ctx.beginPath();
        ctx.arc(offsetX + player.x * scale, offsetY + player.y * scale, 0.3 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Player Direction
        ctx.strokeStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(offsetX + player.x * scale, offsetY + player.y * scale);
        ctx.lineTo(
            offsetX + (player.x + Math.cos(player.angle) * 2) * scale,
            offsetY + (player.y + Math.sin(player.angle) * 2) * scale
        );
        ctx.stroke();

        // Draw Enemies
        for (const enemy of enemies) {
            if (enemy.state === "dead") continue;
            ctx.fillStyle = enemy.state === "chasing" ? "#f00" : "#ff0";
            ctx.beginPath();
            ctx.arc(offsetX + enemy.x * scale, offsetY + enemy.y * scale, 0.3 * scale, 0, Math.PI * 2);
            ctx.fill();

            if (enemy.path && enemy.path.length > 0) {
                ctx.strokeStyle = "#0f0";
                ctx.beginPath();
                ctx.moveTo(offsetX + enemy.x * scale, offsetY + enemy.y * scale);
                for (const pt of enemy.path) {
                    ctx.lineTo(offsetX + pt.x * scale, offsetY + pt.y * scale);
                }
                ctx.stroke();
            }
        }
    }
}