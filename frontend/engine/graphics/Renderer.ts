import { StateManager } from "../StateManager";
import {
    castRay, getDistance, normalizeAngle, WALL_COLORS,
    LEVELS, ENEMY_CONFIG, PICKUP_CONFIG, WEAPON_CONFIG
} from "@/lib/fps-engine";
import { shadeColor, drawWeapon, drawImp, drawDemon } from "./Sprites"; // Import all specific drawers
import { Enemy, Projectile, Pickup, WeaponType, EnemyType, PickupType } from "@/lib/fps-engine";

export class Renderer {
    ctx: CanvasRenderingContext2D;
    offscreen: HTMLCanvasElement;
    offCtx: CanvasRenderingContext2D;
    width: number = 800;
    height: number = 600;
    numRays: number = 200;
    FOV = Math.PI / 3;

    constructor(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d")!;
        this.offscreen = document.createElement("canvas");
        this.offCtx = this.offscreen.getContext("2d")!;
        this.resize(800, 600);
    }

    resize(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.offscreen.width = w;
        this.offscreen.height = h;
        this.numRays = Math.floor(w / 4);
    }

    // [Source 65]
    render(state: StateManager, settings: any) {
        const ctx = this.offCtx;
        const { player, enemies, projectiles, pickups, shootFlash, currentLevelIdx } = state;
        const level = LEVELS[currentLevelIdx];

        // 1. Draw Floor/Ceiling
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, this.width, this.height);
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height / 2);
        gradient.addColorStop(0, "#1a0505");
        gradient.addColorStop(1, "#3d0a0a");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height / 2);

        const floorGradient = ctx.createLinearGradient(0, this.height / 2, 0, this.height);
        floorGradient.addColorStop(0, "#2a2a2a");
        floorGradient.addColorStop(1, "#1a1a1a");
        ctx.fillStyle = floorGradient;
        ctx.fillRect(0, this.height / 2, this.width, this.height / 2);

        // 2. Raycasting [Source 66]
        const zBuffer: number[] = [];
        const rayWidth = this.width / this.numRays;

        for (let i = 0; i < this.numRays; i++) {
            const rayAngle = player.angle - this.FOV / 2 + (i / this.numRays) * this.FOV;
            const { distance, wallType, side } = castRay(level.map, player.x, player.y, rayAngle);
            const correctedDist = distance * Math.cos(rayAngle - player.angle);
            zBuffer[i] = correctedDist;

            const wallHeight = Math.min((this.height / correctedDist) * 1.2, this.height);
            const wallTop = (this.height - wallHeight) / 2;
            const colors = WALL_COLORS[wallType] || WALL_COLORS;
            const baseColor = side === 0 ? colors.light : colors.dark;
            const shade = Math.max(0.2, 1 - correctedDist / 15);

            ctx.fillStyle = shadeColor(baseColor, shade);
            ctx.fillRect(Math.floor(i * rayWidth), Math.floor(wallTop), Math.ceil(rayWidth) + 1, Math.ceil(wallHeight));
        }

        // 3. Sprites Sorting [Source 68]
        const sprites = [
            ...enemies.filter(e => e.state !== "dead" || e.animFrame < 30).map(e => ({ type: 'enemy', data: e, dist: getDistance(e.x, e.y, player.x, player.y) })),
            ...projectiles.map(p => ({ type: 'projectile', data: p, dist: getDistance(p.x, p.y, player.x, player.y) })),
            ...pickups.filter(p => !p.collected).map(p => ({ type: 'pickup', data: p, dist: getDistance(p.x, p.y, player.x, player.y) }))
        ].sort((a, b) => b.dist - a.dist);

        for (const sprite of sprites) {
            if (sprite.type === 'enemy') this.renderEnemy(ctx, player, sprite.data as Enemy, sprite.dist, zBuffer);
            // Implement renderProjectile and renderPickup similarly to Source 70-76
        }

        // 4. Weapon & HUD
        drawWeapon(ctx, player, this.width, this.height, shootFlash);
        this.drawHUD(ctx, state, level);

        // 5. Blit
        this.ctx.drawImage(this.offscreen, 0, 0);

        // 6. Flash Effects
        if (state.hurtFlash > 0) {
            this.ctx.save();
            this.ctx.fillStyle = `rgba(255, 0, 0, ${state.hurtFlash / 20})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.restore();
        }
    }

    // [Source 113]
    drawHUD(ctx: CanvasRenderingContext2D, state: StateManager, level: any) {
        const { player, enemies, unlockedWeapons } = state;
        const SCREEN_HEIGHT = this.height;

        // Background
        ctx.fillStyle = "rgba(40, 40, 40, 0.9)";
        ctx.fillRect(0, SCREEN_HEIGHT - 70, this.width, 70);

        // Health Bar
        const healthColor = player.health > 50 ? "#00aa00" : player.health > 25 ? "#ffaa00" : "#ff0000";
        ctx.fillStyle = healthColor;
        ctx.fillRect(15, SCREEN_HEIGHT - 55, (player.health / player.maxHealth) * 180, 22);
        ctx.strokeStyle = "#666";
        ctx.strokeRect(15, SCREEN_HEIGHT - 55, 180, 22);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px monospace";
        ctx.fillText(`HP: ${Math.ceil(player.health)}`, 20, SCREEN_HEIGHT - 40);

        // Weapon Info
        const weapon = WEAPON_CONFIG[player.weapon];
        ctx.fillText(weapon.name.toUpperCase(), 220, SCREEN_HEIGHT - 45);
        if (weapon.ammoType) {
            ctx.fillStyle = "#ffcc00";
            ctx.font = "bold 24px monospace";
            ctx.fillText(`${player.ammo[weapon.ammoType]}`, 220, SCREEN_HEIGHT - 18);
        }

        // Weapon slots [Source 118]
        const weapons = [WeaponType.FIST, WeaponType.CHAINSAW, WeaponType.PISTOL, WeaponType.SHOTGUN, WeaponType.CHAINGUN];
        weapons.forEach((w, i) => {
            const hasWeapon = unlockedWeapons.has(w);
            const isActive = player.weapon === w;
            const slotX = 525 + i * 25;
            ctx.fillStyle = isActive ? "#ff6600" : hasWeapon ? "#444" : "#222";
            ctx.fillRect(slotX, SCREEN_HEIGHT - 55, 22, 35);
            if (hasWeapon) {
                ctx.fillStyle = isActive ? "#fff" : "#888";
                ctx.fillText(`${i + 1}`, slotX + 7, SCREEN_HEIGHT - 33);
            }
        });
    }

    renderEnemy(ctx: CanvasRenderingContext2D, player: Player, enemy: Enemy, dist: number, zBuffer: number[]) {
        // Logic from [Source 77-80] 
        // Calculates sprite projection and calls drawImp/drawDemon based on enemy.type
        const config = ENEMY_CONFIG[enemy.type];
        const spriteHeight = (this.height / dist) * config.size * 1.5;
        const spriteWidth = spriteHeight * 0.8;
        const screenX = this.width / 2 + (normalizeAngle(Math.atan2(enemy.y - player.y, enemy.x - player.x) - player.angle) / this.FOV) * this.width;

        // Simple visibility check
        if (dist < 0.5) return;

        // Call specific sprite drawer
        const shade = Math.max(0.3, 1 - dist / 12);
        ctx.save();
        // Clip to ZBuffer (simplified for brevity)
        if (enemy.type === EnemyType.IMP) drawImp(ctx, screenX, (this.height - spriteHeight) / 2, spriteWidth, spriteHeight, enemy, shade);
        else drawDemon(ctx, screenX, (this.height - spriteHeight) / 2, spriteWidth, spriteHeight, enemy, shade);
        ctx.restore();
    }
}