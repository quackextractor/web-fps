import {
    type Player,
    type Enemy,
    type Projectile,
    type Pickup,
    type Level,
    EnemyType,
    WeaponType,
    AmmoType,
    PickupType,
    ENEMY_CONFIG,
    WEAPON_CONFIG,
    PICKUP_CONFIG,
    WALL_COLORS,
    castRay,
    getDistance,
    normalizeAngle,
} from "@/lib/fps-engine";
import { shadeColor } from "@/engine/graphics/Sprites";
import * as Sprites from "@/engine/graphics/Sprites";

const FOV = Math.PI / 3;

export interface RenderState {
    player: Player;
    enemies: Enemy[];
    projectiles: Projectile[];
    pickups: Pickup[];
    level: Level;
    shootFlash: number;
    hurtFlash: number;
    weaponsUnlocked: Set<WeaponType>;
    settings: {
        debugMode: boolean;
        showFPS: boolean;
        crosshairStyle: string;
        imageSmoothingEnabled: boolean;
    };
    fps: number;
}

export class GameRenderer {
    constructor(
        private screenWidth: number,
        private screenHeight: number,
        private numRays: number
    ) { }

    updateDimensions(width: number, height: number, numRays: number) {
        this.screenWidth = width;
        this.screenHeight = height;
        this.numRays = numRays;
    }

    render(ctx: CanvasRenderingContext2D, state: RenderState) {
        this.renderWorld(ctx, state);

        // Draw Weapon (on top of world)
        this.drawWeapon(ctx, state.player, state.shootFlash);

        // HUD is now rendered via React in fps-game.tsx
        // Only drawing Minimap if strictly needed here, but plan is to move/keep visuals separate
        // this.drawHUD... REMOVED

        // Flashes
        const hurtAlpha = state.hurtFlash / 10;
        if (hurtAlpha > 0) {
            ctx.save();
            ctx.fillStyle = `rgba(255, 0, 0, ${hurtAlpha * 0.5})`;
            ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
            ctx.restore();
        }

        if (state.shootFlash > 0) {
            ctx.fillStyle = `rgba(255, 200, 100, ${state.shootFlash / 20})`;
            ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
        }

        if (state.settings.debugMode) {
            this.renderDebugView(ctx, state.level, state.player, state.enemies);
        }

        if (state.settings.showFPS) {
            ctx.fillStyle = "#0f0";
            ctx.font = "14px monospace";
            ctx.fillText(`FPS: ${state.fps}`, 10, 20);
        }
    }

    private textures: Map<string, HTMLImageElement | HTMLCanvasElement> = new Map();

    loadLevelTextures(level: Level) {
        if (!level.wallTextures) return;
        Object.entries(level.wallTextures).forEach(([_, path]) => {
            if (!this.textures.has(path)) {
                if (path.startsWith("generated:")) {
                    if (path === "generated:exit") {
                        const tex = this.generateExitTexture();
                        this.textures.set(path, tex as unknown as HTMLImageElement);
                    }
                } else {
                    const img = new Image();
                    img.src = path;
                    this.textures.set(path, img);
                }
            }
        });
    }

    private generateExitTexture(): HTMLCanvasElement {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext("2d");
        if (!ctx) return canvas;

        // Background - Hazard stripes
        ctx.fillStyle = "#333";
        ctx.fillRect(0, 0, 64, 64);

        ctx.fillStyle = "#e00";
        ctx.beginPath();
        for (let i = -64; i < 128; i += 16) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 8, 0);
            ctx.lineTo(i - 24, 64);
            ctx.lineTo(i - 32, 64);
            ctx.fill();
        }

        // Metal border
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, 64, 64);

        // Inner plaque
        ctx.fillStyle = "#111";
        ctx.fillRect(8, 20, 48, 24);
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 20, 48, 24);

        // Text
        ctx.fillStyle = "#0f0";
        ctx.font = "bold 16px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("EXIT", 32, 32);

        // LED glow
        ctx.shadowColor = "#0f0";
        ctx.shadowBlur = 5;
        ctx.fillText("EXIT", 32, 32);

        return canvas;
    }

    private renderWorld(ctx: CanvasRenderingContext2D, state: RenderState) {
        const { player, level, enemies, projectiles, pickups } = state;
        const SCREEN_WIDTH = this.screenWidth;
        const SCREEN_HEIGHT = this.screenHeight;
        const NUM_RAYS = this.numRays;

        // Sky and Floor
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        const gradient = ctx.createLinearGradient(0, 0, 0, SCREEN_HEIGHT / 2);
        gradient.addColorStop(0, "#1a0505");
        gradient.addColorStop(1, "#3d0a0a");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT / 2);

        const floorGradient = ctx.createLinearGradient(0, SCREEN_HEIGHT / 2, 0, SCREEN_HEIGHT);
        floorGradient.addColorStop(0, "#2a2a2a");
        floorGradient.addColorStop(1, "#1a1a1a");
        ctx.fillStyle = floorGradient;
        ctx.fillRect(0, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT / 2);

        // Raycasting
        const zBuffer: number[] = [];
        const rayWidth = SCREEN_WIDTH / NUM_RAYS;

        if (state.settings.imageSmoothingEnabled) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
        } else {
            ctx.imageSmoothingEnabled = false;
        }

        for (let i = 0; i < NUM_RAYS; i++) {
            const rayAngle = player.angle - FOV / 2 + (i / NUM_RAYS) * FOV;
            const { distance, wallType, side, hitX, hitY } = castRay(level.map, player.x, player.y, rayAngle);

            const correctedDist = distance * Math.cos(rayAngle - player.angle);
            zBuffer[i] = correctedDist;

            const wallHeight = Math.min((SCREEN_HEIGHT / correctedDist) * 1.2, SCREEN_HEIGHT);
            const wallTop = (SCREEN_HEIGHT - wallHeight) / 2;

            // Texture Mapping
            let texturePath = level.wallTextures?.[wallType];
            let texture: any = texturePath ? this.textures.get(texturePath) : null;

            if (texture && texture.complete) {
                let wallX;
                if (side === 0) wallX = hitY; // If hit vertical wall, use Y
                else wallX = hitX;            // If hit horizontal wall, use X

                wallX -= Math.floor(wallX);

                // Flip texture if facing specific directions
                if (side === 0 && Math.cos(rayAngle) > 0) wallX = 1 - wallX;
                if (side === 1 && Math.sin(rayAngle) < 0) wallX = 1 - wallX;

                // Fix jitter: Clamp and ensure precision
                wallX = Math.max(0, Math.min(1, wallX));

                const texX = Math.floor(wallX * texture.width);

                // Darken sides for depth perception
                if (side === 1) {
                    ctx.filter = 'brightness(0.7)';
                } else {
                    ctx.filter = 'none';
                }

                // Draw texture strip
                // We draw using drawImage to scale the 1px wide strip to rayWidth
                ctx.drawImage(
                    texture,
                    texX, 0, 1, texture.height,
                    Math.floor(i * rayWidth), Math.floor(wallTop), Math.ceil(rayWidth) + 1, Math.ceil(wallHeight)
                );

                ctx.filter = 'none';

                // Distance shading (fog)
                const shade = Math.max(0, Math.min(0.8, correctedDist / 15));
                if (shade > 0) {
                    ctx.fillStyle = `rgba(0, 0, 0, ${shade})`;
                    ctx.fillRect(Math.floor(i * rayWidth), Math.floor(wallTop), Math.ceil(rayWidth) + 1, Math.ceil(wallHeight));
                }

            } else {
                // Fallback to solid colors
                const colors = WALL_COLORS[wallType] || WALL_COLORS[1];
                const baseColor = side === 0 ? colors.light : colors.dark;
                const shade = Math.max(0.2, 1 - correctedDist / 15);
                ctx.fillStyle = shadeColor(baseColor, shade);
                ctx.fillRect(Math.floor(i * rayWidth), Math.floor(wallTop), Math.ceil(rayWidth) + 1, Math.ceil(wallHeight));
            }
        }

        // Sprites
        const sprites: { type: 'enemy' | 'projectile' | 'pickup'; data: Enemy | Projectile | Pickup; dist: number }[] = [];

        for (const enemy of enemies) {
            if (enemy.state !== "dead" || enemy.animFrame < 30) {
                sprites.push({
                    type: 'enemy',
                    data: enemy,
                    dist: getDistance(enemy.x, enemy.y, player.x, player.y),
                });
            }
        }

        for (const proj of projectiles) {
            sprites.push({
                type: 'projectile',
                data: proj,
                dist: getDistance(proj.x, proj.y, player.x, player.y),
            });
        }

        for (const pickup of pickups) {
            if (!pickup.collected) {
                sprites.push({
                    type: 'pickup',
                    data: pickup,
                    dist: getDistance(pickup.x, pickup.y, player.x, player.y),
                });
            }
        }

        sprites.sort((a, b) => b.dist - a.dist);

        for (const sprite of sprites) {
            if (sprite.type === 'enemy') {
                this.renderEnemy(ctx, player, sprite.data as Enemy, sprite.dist, zBuffer);
            } else if (sprite.type === 'projectile') {
                this.renderProjectile(ctx, player, sprite.data as Projectile, sprite.dist, zBuffer);
            } else {
                this.renderPickup(ctx, player, sprite.data as Pickup, sprite.dist, zBuffer);
            }
        }
    }

    private renderEnemy(
        ctx: CanvasRenderingContext2D,
        player: Player,
        enemy: Enemy,
        dist: number,
        zBuffer: number[]
    ) {
        const SCREEN_WIDTH = this.screenWidth;
        const SCREEN_HEIGHT = this.screenHeight;
        const NUM_RAYS = this.numRays;

        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;

        const angleToEnemy = Math.atan2(dy, dx);
        const relAngle = normalizeAngle(angleToEnemy - player.angle);

        if (Math.abs(relAngle) > FOV / 2 + 0.15) return;

        const screenX = SCREEN_WIDTH / 2 + (relAngle / FOV) * SCREEN_WIDTH;
        const config = ENEMY_CONFIG[enemy.type];
        const spriteHeight = (SCREEN_HEIGHT / dist) * config.size * 1.5;
        const spriteWidth = spriteHeight * 0.8;
        const spriteTop = (SCREEN_HEIGHT - spriteHeight) / 2;

        const spriteLeft = screenX - spriteWidth / 2;
        const spriteRight = screenX + spriteWidth / 2;
        const startRay = Math.floor((spriteLeft / SCREEN_WIDTH) * NUM_RAYS);
        const endRay = Math.ceil((spriteRight / SCREEN_WIDTH) * NUM_RAYS);

        let visibleRays = 0;
        let totalRays = 0;
        for (let r = startRay; r <= endRay; r++) {
            if (r >= 0 && r < NUM_RAYS) {
                totalRays++;
                if (zBuffer[r] > dist - 0.3) {
                    visibleRays++;
                }
            }
        }

        if (totalRays === 0 || visibleRays === 0) return;

        const shade = Math.max(0.3, 1 - dist / 12);

        ctx.save();

        ctx.beginPath();
        for (let r = startRay; r <= endRay; r++) {
            if (r >= 0 && r < NUM_RAYS && zBuffer[r] > dist - 0.3) {
                const rayX = (r / NUM_RAYS) * SCREEN_WIDTH;
                const rayWidth = SCREEN_WIDTH / NUM_RAYS;
                ctx.rect(rayX, 0, rayWidth + 1, SCREEN_HEIGHT);
            }
        }
        ctx.clip();

        switch (enemy.type) {
            case EnemyType.IMP:
                Sprites.drawImp(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade);
                break;
            case EnemyType.DEMON:
                Sprites.drawDemon(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade);
                break;
            case EnemyType.SOLDIER:
                Sprites.drawSoldier(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade);
                break;
            case EnemyType.CACODEMON:
                Sprites.drawCacodemon(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade);
                break;
            case EnemyType.BARON:
                Sprites.drawBaron(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade);
                break;
            case EnemyType.ZOMBIE:
                Sprites.drawZombie(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade);
                break;
            case EnemyType.HELLKNIGHT:
                Sprites.drawHellKnight(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade);
                break;
            case EnemyType.CYBERDEMON:
                Sprites.drawCyberdemon(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade);
                break;
        }

        ctx.restore();
    }

    private renderProjectile(
        ctx: CanvasRenderingContext2D,
        player: Player,
        proj: Projectile,
        dist: number,
        zBuffer: number[]
    ) {
        const SCREEN_WIDTH = this.screenWidth;
        const SCREEN_HEIGHT = this.screenHeight;
        const NUM_RAYS = this.numRays;

        const dx = proj.x - player.x;
        const dy = proj.y - player.y;

        const angleToProj = Math.atan2(dy, dx);
        const relAngle = normalizeAngle(angleToProj - player.angle);

        if (Math.abs(relAngle) > FOV / 2 + 0.2) return;

        const screenX = SCREEN_WIDTH / 2 + (relAngle / FOV) * SCREEN_WIDTH;
        const size = Math.max(4, (SCREEN_HEIGHT / dist) * proj.size);

        const spriteScreenWidth = size * 2;
        const startRay = Math.floor(((screenX - spriteScreenWidth / 2) / SCREEN_WIDTH) * NUM_RAYS);
        const endRay = Math.ceil(((screenX + spriteScreenWidth / 2) / SCREEN_WIDTH) * NUM_RAYS);

        let visible = false;
        for (let r = Math.max(0, startRay); r <= Math.min(NUM_RAYS - 1, endRay); r++) {
            if (zBuffer[r] > dist - 0.3) {
                visible = true;
                break;
            }
        }
        if (!visible) return;

        ctx.save();
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = proj.color;
        ctx.beginPath();
        ctx.arc(screenX, SCREEN_HEIGHT / 2, size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(screenX, SCREEN_HEIGHT / 2, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    private renderPickup(
        ctx: CanvasRenderingContext2D,
        player: Player,
        pickup: Pickup,
        dist: number,
        zBuffer: number[]
    ) {
        const SCREEN_WIDTH = this.screenWidth;
        const SCREEN_HEIGHT = this.screenHeight;
        const NUM_RAYS = this.numRays;

        const dx = pickup.x - player.x;
        const dy = pickup.y - player.y;

        const angleToPickup = Math.atan2(dy, dx);
        const relAngle = normalizeAngle(angleToPickup - player.angle);

        if (Math.abs(relAngle) > FOV / 2 + 0.2) return;

        const screenX = SCREEN_WIDTH / 2 + (relAngle / FOV) * SCREEN_WIDTH;
        const size = Math.max(8, (SCREEN_HEIGHT / dist) * 0.3);

        const startRay = Math.floor(((screenX - size) / SCREEN_WIDTH) * NUM_RAYS);
        const endRay = Math.ceil(((screenX + size) / SCREEN_WIDTH) * NUM_RAYS);

        let visible = false;
        for (let r = Math.max(0, startRay); r <= Math.min(NUM_RAYS - 1, endRay); r++) {
            if (zBuffer[r] > dist - 0.3) {
                visible = true;
                break;
            }
        }
        if (!visible) return;

        const config = PICKUP_CONFIG[pickup.type];
        const bob = Math.sin(performance.now() * 0.003) * size * 0.2;
        const screenY = SCREEN_HEIGHT / 2 + (SCREEN_HEIGHT / dist) * 0.2 + bob;

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

    private drawWeapon(ctx: CanvasRenderingContext2D, player: Player, flash: number) {
        const SCREEN_WIDTH = this.screenWidth;
        const SCREEN_HEIGHT = this.screenHeight;

        const bob = player.isMoving ? Math.sin(player.bobPhase) * 10 : 0;
        const weaponX = SCREEN_WIDTH / 2;
        const weaponY = SCREEN_HEIGHT - 150 + bob;
        const meleeSwing = player.isMeleeing ? Math.sin(player.meleeFrame * Math.PI) * 50 : 0;

        switch (player.weapon) {
            case WeaponType.FIST:
                Sprites.drawFist(ctx, weaponX + meleeSwing, weaponY, flash);
                break;
            case WeaponType.CHAINSAW:
                Sprites.drawChainsaw(ctx, weaponX + meleeSwing * 0.5, weaponY, flash);
                break;
            case WeaponType.PISTOL:
                Sprites.drawPistol(ctx, weaponX, weaponY, flash);
                break;
            case WeaponType.SHOTGUN:
                Sprites.drawShotgun(ctx, weaponX, weaponY, flash);
                break;
            case WeaponType.CHAINGUN:
                Sprites.drawChaingun(ctx, weaponX, weaponY, flash);
                break;
        }
    }

    // drawHUD removed in favor of React HUD

    private renderDebugView(
        ctx: CanvasRenderingContext2D,
        level: Level,
        player: Player,
        enemies: Enemy[]
    ) {
        const SCREEN_WIDTH = this.screenWidth;
        const SCREEN_HEIGHT = this.screenHeight;

        // Semi-transparent background
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        const scale = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) / Math.max(level.map.length, level.map[0].length) * 0.8;
        const offsetX = SCREEN_WIDTH / 2 - (level.map[0].length * scale) / 2;
        const offsetY = SCREEN_HEIGHT / 2 - (level.map.length * scale) / 2;

        // Draw Map
        for (let y = 0; y < level.map.length; y++) {
            for (let x = 0; x < level.map[y].length; x++) {
                const cell = level.map[y][x];
                if (cell > 0) {
                    ctx.fillStyle = cell === 9 ? "#0f0" : "#888";
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
        // Direction
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
            // Actual collision radius (0.3)
            ctx.beginPath();
            ctx.arc(offsetX + enemy.x * scale, offsetY + enemy.y * scale, 0.3 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.stroke();

            // Stuck indicator
            if (enemy.stuckFrameCount > 30) {
                ctx.fillStyle = "#fff";
                ctx.font = "12px monospace";
                ctx.fillText("STUCK", offsetX + enemy.x * scale - 10, offsetY + enemy.y * scale - 10);
            }

            // Draw Path
            if (enemy.path && enemy.path.length > 0) {
                ctx.strokeStyle = "#0f0";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(offsetX + enemy.x * scale, offsetY + enemy.y * scale);
                for (const pt of enemy.path) {
                    ctx.lineTo(offsetX + pt.x * scale, offsetY + pt.y * scale);
                }
                ctx.stroke();
                ctx.lineWidth = 1;

                // Draw Nodes
                ctx.fillStyle = "#0f0";
                for (const pt of enemy.path) {
                    ctx.fillRect(offsetX + pt.x * scale - 2, offsetY + pt.y * scale - 2, 4, 4);
                }
            }
        }
    }
}
