import {
    Enemy, Player, Projectile, Pickup, Level,
    EnemyType, WeaponType, AmmoType, PickupType,
    ENEMY_CONFIG, WEAPON_CONFIG, PICKUP_CONFIG,
    normalizeAngle, castRay, WALL_COLORS, getDistance
} from './fps-engine';
import { GAME_CONFIG } from './game-config';

// Helper for shading
export function shadeColor(color: string, factor: number): string {
    const f = parseInt(color.slice(1), 16);
    const t = factor < 0 ? 0 : 255;
    const p = factor < 0 ? factor * -1 : factor;
    const R = f >> 16;
    const G = (f >> 8) & 0x00ff;
    const B = f & 0x0000ff;

    return (
        "#" +
        (
            0x1000000 +
            (Math.round((t - R) * p) + R) * 0x10000 +
            (Math.round((t - G) * p) + G) * 0x100 +
            (Math.round((t - B) * p) + B)
        )
            .toString(16)
            .slice(1)
    );
}

export const renderProjectile = (
    ctx: CanvasRenderingContext2D,
    player: Player,
    proj: Projectile,
    dist: number,
    zBuffer: number[],
    screenWidth: number,
    screenHeight: number,
    numRays: number,
    fov: number
) => {
    const dx = proj.x - player.x;
    const dy = proj.y - player.y;

    const angleToProj = Math.atan2(dy, dx);
    const relAngle = normalizeAngle(angleToProj - player.angle);

    if (Math.abs(relAngle) > fov / 2 + 0.2) return;

    const screenX = screenWidth / 2 + (relAngle / fov) * screenWidth;
    const size = Math.max(4, (screenHeight / dist) * proj.size);

    const spriteScreenWidth = size * 2;
    const startRay = Math.floor(((screenX - spriteScreenWidth / 2) / screenWidth) * numRays);
    const endRay = Math.ceil(((screenX + spriteScreenWidth / 2) / screenWidth) * numRays);

    let visible = false;
    for (let r = Math.max(0, startRay); r <= Math.min(numRays - 1, endRay); r++) {
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
    ctx.arc(screenX, screenHeight / 2, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(screenX, screenHeight / 2, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
};

export const renderPickup = (
    ctx: CanvasRenderingContext2D,
    player: Player,
    pickup: Pickup,
    dist: number,
    zBuffer: number[],
    screenWidth: number,
    screenHeight: number,
    numRays: number,
    fov: number
) => {
    const dx = pickup.x - player.x;
    const dy = pickup.y - player.y;

    const angleToPickup = Math.atan2(dy, dx);
    const relAngle = normalizeAngle(angleToPickup - player.angle);

    if (Math.abs(relAngle) > fov / 2 + 0.2) return;

    const screenX = screenWidth / 2 + (relAngle / fov) * screenWidth;
    const size = Math.max(8, (screenHeight / dist) * 0.3);

    const startRay = Math.floor(((screenX - size) / screenWidth) * numRays);
    const endRay = Math.ceil(((screenX + size) / screenWidth) * numRays);

    let visible = false;
    for (let r = Math.max(0, startRay); r <= Math.min(numRays - 1, endRay); r++) {
        if (zBuffer[r] > dist - 0.3) {
            visible = true;
            break;
        }
    }
    if (!visible) return;

    const config = PICKUP_CONFIG[pickup.type];
    const bob = Math.sin(performance.now() * 0.003) * size * 0.2;
    const screenY = screenHeight / 2 + (screenHeight / dist) * 0.2 + bob;

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
};



const drawImp = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) => {
    const bounce = enemy.state === "chasing" ? Math.sin(enemy.animFrame * 0.3) * h * 0.05 : 0;
    ctx.fillStyle = enemy.state === "dead" ? "#333" : enemy.state === "hurt" ? "#fff" : shadeColor("#8B4513", shade);
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.5 + bounce, w * 0.4, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.2 + bounce, w * 0.25, h * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    if (enemy.state !== "dead") {
        ctx.fillStyle = "#ff0";
        ctx.beginPath();
        ctx.ellipse(x - w * 0.08, y + h * 0.15 + bounce, w * 0.06, h * 0.04, 0, 0, Math.PI * 2);
        ctx.ellipse(x + w * 0.08, y + h * 0.15 + bounce, w * 0.06, h * 0.04, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = shadeColor("#654321", shade);
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(x + i * w * 0.1, y + h * 0.05 + bounce);
            ctx.lineTo(x + i * w * 0.1 - w * 0.03, y + h * 0.15 + bounce);
            ctx.lineTo(x + i * w * 0.1 + w * 0.03, y + h * 0.15 + bounce);
            ctx.fill();
        }
    }
    if (enemy.state === "attacking") {
        ctx.fillStyle = "#f80";
        ctx.beginPath();
        ctx.arc(x, y + h * 0.6, w * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }
};

const drawDemon = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) => {
    const bounce = enemy.state === "chasing" ? Math.sin(enemy.animFrame * 0.4) * h * 0.08 : 0;
    ctx.fillStyle = enemy.state === "dead" ? "#333" : enemy.state === "hurt" ? "#fff" : shadeColor("#FF1493", shade);
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.55 + bounce, w * 0.5, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.2 + bounce, w * 0.3, h * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    if (enemy.state !== "dead") {
        ctx.fillStyle = shadeColor("#8B0000", shade);
        ctx.beginPath();
        ctx.moveTo(x - w * 0.2, y + h * 0.15 + bounce);
        ctx.lineTo(x - w * 0.35, y - h * 0.1 + bounce);
        ctx.lineTo(x - w * 0.15, y + h * 0.1 + bounce);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.2, y + h * 0.15 + bounce);
        ctx.lineTo(x + w * 0.35, y - h * 0.1 + bounce);
        ctx.lineTo(x + w * 0.15, y + h * 0.1 + bounce);
        ctx.fill();
        ctx.fillStyle = "#0f0";
        ctx.beginPath();
        ctx.ellipse(x - w * 0.1, y + h * 0.15 + bounce, w * 0.07, h * 0.05, 0, 0, Math.PI * 2);
        ctx.ellipse(x + w * 0.1, y + h * 0.15 + bounce, w * 0.07, h * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    if (enemy.state === "melee" || enemy.state === "attacking") {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.rect(x - w * 0.15, y + h * 0.28 + bounce, w * 0.3, h * 0.08);
        ctx.fill();
    }
};

const drawSoldier = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) => {
    const bounce = enemy.state === "chasing" ? Math.sin(enemy.animFrame * 0.25) * h * 0.03 : 0;
    ctx.fillStyle = enemy.state === "dead" ? "#333" : enemy.state === "hurt" ? "#fff" : shadeColor("#556B2F", shade);
    ctx.beginPath();
    ctx.rect(x - w * 0.25, y + h * 0.3 + bounce, w * 0.5, h * 0.5);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.2 + bounce, w * 0.2, h * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    if (enemy.state !== "dead") {
        ctx.fillStyle = shadeColor("#2F4F2F", shade);
        ctx.beginPath();
        ctx.ellipse(x, y + h * 0.12 + bounce, w * 0.22, h * 0.12, 0, Math.PI, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "#f00";
        ctx.beginPath();
        ctx.rect(x - w * 0.12, y + h * 0.17 + bounce, w * 0.24, h * 0.04);
        ctx.fill();
        ctx.fillStyle = "#222";
        ctx.beginPath();
        ctx.rect(x + w * 0.2, y + h * 0.4 + bounce, w * 0.3, h * 0.06);
        ctx.fill();
        if (enemy.state === "attacking") {
            ctx.fillStyle = "#ff0";
            ctx.beginPath();
            ctx.arc(x + w * 0.5, y + h * 0.43 + bounce, w * 0.1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};

const drawCacodemon = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) => {
    const float = Math.sin(enemy.animFrame * 0.1) * h * 0.05;
    ctx.fillStyle = enemy.state === "dead" ? "#333" : enemy.state === "hurt" ? "#fff" : shadeColor("#DC143C", shade);
    ctx.beginPath();
    ctx.arc(x, y + h * 0.5 + float, Math.min(w, h) * 0.45, 0, Math.PI * 2);
    ctx.fill();
    if (enemy.state !== "dead") {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(x, y + h * 0.4 + float, w * 0.2, h * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0f0";
        ctx.beginPath();
        ctx.ellipse(x, y + h * 0.4 + float, w * 0.1, h * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.ellipse(x, y + h * 0.4 + float, w * 0.05, h * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = shadeColor("#8B0000", shade);
        ctx.beginPath();
        ctx.moveTo(x - w * 0.3, y + h * 0.3 + float);
        ctx.lineTo(x - w * 0.5, y + h * 0.1 + float);
        ctx.lineTo(x - w * 0.25, y + h * 0.35 + float);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.3, y + h * 0.3 + float);
        ctx.lineTo(x + w * 0.5, y + h * 0.1 + float);
        ctx.lineTo(x + w * 0.25, y + h * 0.35 + float);
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.ellipse(x, y + h * 0.65 + float, w * 0.2, h * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x + i * w * 0.05, y + h * 0.6 + float);
            ctx.lineTo(x + i * w * 0.05 - w * 0.02, y + h * 0.7 + float);
            ctx.lineTo(x + i * w * 0.05 + w * 0.02, y + h * 0.7 + float);
            ctx.fill();
        }
    }
    if (enemy.state === "attacking") {
        ctx.save();
        ctx.fillStyle = "#00f";
        ctx.shadowColor = "#00f";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(x, y + h * 0.85, w * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
};

const drawBaron = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) => {
    const bounce = enemy.state === "chasing" ? Math.sin(enemy.animFrame * 0.2) * h * 0.04 : 0;
    ctx.fillStyle = enemy.state === "dead" ? "#333" : enemy.state === "hurt" ? "#fff" : shadeColor("#228B22", shade);
    ctx.beginPath();
    ctx.moveTo(x - w * 0.4, y + h * 0.95 + bounce);
    ctx.lineTo(x - w * 0.5, y + h * 0.4 + bounce);
    ctx.lineTo(x - w * 0.3, y + h * 0.25 + bounce);
    ctx.lineTo(x + w * 0.3, y + h * 0.25 + bounce);
    ctx.lineTo(x + w * 0.5, y + h * 0.4 + bounce);
    ctx.lineTo(x + w * 0.4, y + h * 0.95 + bounce);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.15 + bounce, w * 0.25, h * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    if (enemy.state !== "dead") {
        ctx.fillStyle = shadeColor("#8B4513", shade);
        ctx.beginPath();
        ctx.moveTo(x - w * 0.15, y + h * 0.1 + bounce);
        ctx.lineTo(x - w * 0.45, y - h * 0.15 + bounce);
        ctx.lineTo(x - w * 0.1, y + h * 0.05 + bounce);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.15, y + h * 0.1 + bounce);
        ctx.lineTo(x + w * 0.45, y - h * 0.15 + bounce);
        ctx.lineTo(x + w * 0.1, y + h * 0.05 + bounce);
        ctx.fill();
        ctx.save();
        ctx.fillStyle = "#f00";
        ctx.shadowColor = "#f00";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(x - w * 0.1, y + h * 0.12 + bounce, w * 0.06, h * 0.04, 0, 0, Math.PI * 2);
        ctx.ellipse(x + w * 0.1, y + h * 0.12 + bounce, w * 0.06, h * 0.04, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    ctx.fillStyle = enemy.state === "dead" ? "#222" : shadeColor("#1a1a1a", shade);
    ctx.beginPath();
    ctx.ellipse(x - w * 0.25, y + h * 0.95 + bounce, w * 0.15, h * 0.06, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.25, y + h * 0.95 + bounce, w * 0.15, h * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    if (enemy.state === "attacking") {
        ctx.save();
        ctx.fillStyle = "#0f0";
        ctx.shadowColor = "#0f0";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(x - w * 0.4, y + h * 0.5, w * 0.12, 0, Math.PI * 2);
        ctx.arc(x + w * 0.4, y + h * 0.5, w * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
};

const drawZombie = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) => {
    const shamble = enemy.state === "chasing" ? Math.sin(enemy.animFrame * 0.15) * h * 0.04 : 0;
    ctx.fillStyle = enemy.state === "dead" ? "#222" : enemy.state === "hurt" ? "#fff" : shadeColor("#4a4a2a", shade);
    ctx.beginPath();
    ctx.rect(x - w * 0.2, y + h * 0.35 + shamble, w * 0.4, h * 0.45);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.22 + shamble, w * 0.18, h * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    if (enemy.state !== "dead") {
        ctx.fillStyle = shadeColor("#3a3a1a", shade);
        ctx.beginPath();
        ctx.rect(x - w * 0.15, y + h * 0.4 + shamble, w * 0.3, h * 0.15);
        ctx.fill();
        ctx.fillStyle = "#ff6600";
        ctx.beginPath();
        ctx.ellipse(x - w * 0.06, y + h * 0.18 + shamble, w * 0.04, h * 0.03, 0, 0, Math.PI * 2);
        ctx.ellipse(x + w * 0.06, y + h * 0.18 + shamble, w * 0.04, h * 0.03, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = shadeColor("#4a4a2a", shade);
        const armReach = enemy.state === "melee" ? w * 0.15 : 0;
        ctx.beginPath();
        ctx.rect(x - w * 0.35 - armReach, y + h * 0.4 + shamble, w * 0.15, h * 0.1);
        ctx.rect(x + w * 0.2 + armReach, y + h * 0.4 + shamble, w * 0.15, h * 0.1);
        ctx.fill();
    }
};

const drawHellKnight = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) => {
    const bounce = enemy.state === "chasing" ? Math.sin(enemy.animFrame * 0.25) * h * 0.05 : 0;
    ctx.fillStyle = enemy.state === "dead" ? "#333" : enemy.state === "hurt" ? "#fff" : shadeColor("#8B7355", shade);
    ctx.beginPath();
    ctx.moveTo(x - w * 0.35, y + h * 0.95 + bounce);
    ctx.lineTo(x - w * 0.45, y + h * 0.4 + bounce);
    ctx.lineTo(x - w * 0.25, y + h * 0.25 + bounce);
    ctx.lineTo(x + w * 0.25, y + h * 0.25 + bounce);
    ctx.lineTo(x + w * 0.45, y + h * 0.4 + bounce);
    ctx.lineTo(x + w * 0.35, y + h * 0.95 + bounce);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.15 + bounce, w * 0.22, h * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    if (enemy.state !== "dead") {
        ctx.fillStyle = shadeColor("#654321", shade);
        ctx.beginPath();
        ctx.moveTo(x - w * 0.12, y + h * 0.1 + bounce);
        ctx.lineTo(x - w * 0.35, y - h * 0.1 + bounce);
        ctx.lineTo(x - w * 0.08, y + h * 0.05 + bounce);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.12, y + h * 0.1 + bounce);
        ctx.lineTo(x + w * 0.35, y - h * 0.1 + bounce);
        ctx.lineTo(x + w * 0.08, y + h * 0.05 + bounce);
        ctx.fill();
        ctx.save();
        ctx.fillStyle = "#0f0";
        ctx.shadowColor = "#0f0";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(x - w * 0.08, y + h * 0.12 + bounce, w * 0.05, h * 0.03, 0, 0, Math.PI * 2);
        ctx.ellipse(x + w * 0.08, y + h * 0.12 + bounce, w * 0.05, h * 0.03, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    if (enemy.state === "attacking") {
        ctx.save();
        ctx.fillStyle = "#00ff66";
        ctx.shadowColor = "#00ff66";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(x, y + h * 0.5, w * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
};

const drawCyberdemon = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) => {
    ctx.fillStyle = enemy.state === "dead" ? "#333" : enemy.state === "hurt" ? "#fff" : shadeColor("#8B0000", shade);
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.12, w * 0.2, h * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - w * 0.35, y + h * 0.95);
    ctx.lineTo(x - w * 0.4, y + h * 0.25);
    ctx.lineTo(x + w * 0.4, y + h * 0.25);
    ctx.lineTo(x + w * 0.35, y + h * 0.95);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = shadeColor("#4a4a4a", shade);
    ctx.fillRect(x + w * 0.3, y + h * 0.3, w * 0.3, h * 0.15);
    ctx.fillRect(x - w * 0.15, y + h * 0.7, w * 0.12, h * 0.25);
    if (enemy.state !== "dead") {
        ctx.fillStyle = shadeColor("#4a4a4a", shade);
        ctx.beginPath();
        ctx.moveTo(x - w * 0.1, y + h * 0.05);
        ctx.lineTo(x - w * 0.3, y - h * 0.15);
        ctx.lineTo(x - w * 0.05, y);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.1, y + h * 0.05);
        ctx.lineTo(x + w * 0.3, y - h * 0.15);
        ctx.lineTo(x + w * 0.05, y);
        ctx.fill();
        ctx.save();
        ctx.fillStyle = "#f00";
        ctx.shadowColor = "#f00";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.ellipse(x - w * 0.06, y + h * 0.08, w * 0.04, h * 0.025, 0, 0, Math.PI * 2);
        ctx.ellipse(x + w * 0.06, y + h * 0.08, w * 0.04, h * 0.025, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    if (enemy.state === "attacking") {
        ctx.save();
        ctx.fillStyle = "#ff0";
        ctx.shadowColor = "#ff0";
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(x + w * 0.6, y + h * 0.35, w * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f00";
        ctx.beginPath();
        ctx.arc(x + w * 0.6, y + h * 0.35, w * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
};

export const drawWeapon = (
    ctx: CanvasRenderingContext2D,
    player: Player,
    flash: number,
    screenWidth: number,
    screenHeight: number,

) => {
    const bob = player.isMoving ? Math.sin(player.bobPhase) * 10 : 0;
    const weaponX = screenWidth / 2;
    const weaponY = screenHeight - 150 + bob;
    const meleeSwing = player.isMeleeing ? Math.sin(player.meleeFrame * Math.PI) * 50 : 0;

    switch (player.weapon) {
        case WeaponType.FIST:
            drawFist(ctx, weaponX + meleeSwing, weaponY, flash);
            break;
        case WeaponType.CHAINSAW:
            drawChainsaw(ctx, weaponX + meleeSwing * 0.5, weaponY, flash);
            break;
        case WeaponType.PISTOL:
            drawPistol(ctx, weaponX, weaponY, flash);
            break;
        case WeaponType.SHOTGUN:
            drawShotgun(ctx, weaponX, weaponY, flash);
            break;
        case WeaponType.CHAINGUN:
            drawChaingun(ctx, weaponX, weaponY, flash);
            break;
    }
};

const drawFist = (ctx: CanvasRenderingContext2D, x: number, y: number, flash: number) => {
    ctx.fillStyle = "#c9a67a";
    ctx.beginPath();
    ctx.ellipse(x + 30, y + 80, 40, 60, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c9a67a";
    ctx.beginPath();
    ctx.ellipse(x + 50, y + 30, 35, 40, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#b8956a";
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(x + 35 + i * 12, y + 10, 8, 0, Math.PI * 2);
        ctx.fill();
    }
    if (flash > 4) {
        ctx.fillStyle = "rgba(255, 255, 200, 0.3)";
        ctx.beginPath();
        ctx.arc(x + 50, y + 20, 30, 0, Math.PI * 2);
        ctx.fill();
    }
};

const drawChainsaw = (ctx: CanvasRenderingContext2D, x: number, y: number, flash: number) => {
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(x - 20, y + 40, 60, 100);
    ctx.fillStyle = "#ff6600";
    ctx.fillRect(x - 30, y - 20, 80, 70);
    ctx.fillStyle = "#aaa";
    ctx.fillRect(x - 10, y - 100, 30, 90);
    ctx.fillStyle = "#666";
    const teethOffset = (performance.now() * 0.05) % 10;
    for (let i = 0; i < 8; i++) {
        const ty = y - 90 + i * 10 + teethOffset;
        ctx.beginPath();
        ctx.moveTo(x - 10, ty);
        ctx.lineTo(x - 20, ty + 5);
        ctx.lineTo(x - 10, ty + 10);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 20, ty);
        ctx.lineTo(x + 30, ty + 5);
        ctx.lineTo(x + 20, ty + 10);
        ctx.fill();
    }
    if (flash > 0) {
        ctx.fillStyle = "rgba(255, 100, 100, 0.4)";
        ctx.fillRect(x - 15, y - 105, 40, 100);
    }
};

const drawPistol = (ctx: CanvasRenderingContext2D, x: number, y: number, flash: number) => {
    ctx.fillStyle = "#4a3020";
    ctx.fillRect(x - 12, y + 50, 24, 80);
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(x - 15, y + 20, 30, 40);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(x - 8, y - 40, 16, 70);
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y + 55, 12, 0, Math.PI);
    ctx.stroke();
    if (flash > 4) {
        ctx.save();
        ctx.fillStyle = "#ff0";
        ctx.shadowColor = "#ff0";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(x, y - 50, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
};

const drawShotgun = (ctx: CanvasRenderingContext2D, x: number, y: number, flash: number) => {
    ctx.fillStyle = "#5a4030";
    ctx.fillRect(x - 15, y + 60, 30, 100);
    ctx.fillStyle = "#4a3525";
    ctx.fillRect(x - 20, y + 20, 40, 25);
    ctx.fillStyle = "#3a3a3a";
    ctx.fillRect(x - 18, y - 10, 36, 40);
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(x - 12, y - 80, 24, 80);
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(x - 4, y - 82, 6, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 82, 6, 0, Math.PI * 2);
    ctx.fill();
    if (flash > 4) {
        ctx.save();
        ctx.fillStyle = "#f80";
        ctx.shadowColor = "#f80";
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(x, y - 95, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff0";
        ctx.beginPath();
        ctx.arc(x, y - 95, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
};

const drawChaingun = (ctx: CanvasRenderingContext2D, x: number, y: number, flash: number) => {
    const rotation = (performance.now() * 0.01) % (Math.PI * 2);
    ctx.fillStyle = "#3a3a3a";
    ctx.fillRect(x - 30, y + 20, 60, 80);
    ctx.fillStyle = "#4a3020";
    ctx.fillRect(x - 15, y + 90, 30, 60);
    ctx.save();
    ctx.translate(x, y - 20);
    ctx.rotate(flash > 0 ? rotation : 0);
    ctx.fillStyle = "#2a2a2a";
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const bx = Math.cos(angle) * 15;
        const by = Math.sin(angle) * 15;
        ctx.fillRect(bx - 4, by - 80, 8, 80);
    }
    ctx.restore();
    ctx.fillStyle = "#4a4a4a";
    ctx.beginPath();
    ctx.arc(x, y - 20, 20, 0, Math.PI * 2);
    ctx.fill();
    if (flash > 2) {
        ctx.save();
        ctx.fillStyle = "#ff0";
        ctx.shadowColor = "#ff0";
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(x, y - 100, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
};

import { GameSettings } from '../hooks/use-settings';

export const drawHUD = (
    ctx: CanvasRenderingContext2D,
    player: Player,
    enemies: Enemy[],
    level: Level,
    pickups: Pickup[], // Added pickups argument
    unlockedWeapons: Set<WeaponType>,
    settings: GameSettings,
    screenWidth: number,
    screenHeight: number
) => {
    const deadEnemies = enemies.filter((e) => e.state === "dead").length;
    const totalEnemies = enemies.length;

    ctx.fillStyle = "rgba(40, 40, 40, 0.9)";
    ctx.fillRect(0, screenHeight - 70, screenWidth, 70);

    ctx.fillStyle = "#333";
    ctx.fillRect(15, screenHeight - 55, 180, 22);
    const healthColor = player.health > 50 ? "#00aa00" : player.health > 25 ? "#ffaa00" : "#ff0000";
    ctx.fillStyle = healthColor;
    ctx.fillRect(15, screenHeight - 55, (player.health / player.maxHealth) * 180, 22);
    ctx.strokeStyle = "#666";
    ctx.strokeRect(15, screenHeight - 55, 180, 22);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px monospace";
    ctx.fillText(`HP: ${Math.ceil(player.health)}`, 20, screenHeight - 40);

    if (player.armor > 0) {
        ctx.fillStyle = "#333";
        ctx.fillRect(15, screenHeight - 28, 180, 12);
        ctx.fillStyle = "#0088ff";
        ctx.fillRect(15, screenHeight - 28, (player.armor / 100) * 180, 12);
        ctx.strokeStyle = "#666";
        ctx.strokeRect(15, screenHeight - 28, 180, 12);
        ctx.fillStyle = "#88ccff";
        ctx.font = "bold 10px monospace";
        ctx.fillText(`ARMOR: ${Math.ceil(player.armor)}`, 20, screenHeight - 19);
    }

    const weapon = WEAPON_CONFIG[player.weapon];
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px monospace";
    ctx.fillText(weapon.name.toUpperCase(), 220, screenHeight - 45);

    if (weapon.ammoType) {
        ctx.fillStyle = "#ffcc00";
        ctx.font = "bold 24px monospace";
        ctx.fillText(`${player.ammo[weapon.ammoType]}`, 220, screenHeight - 18);
        ctx.fillStyle = "#888";
        ctx.font = "12px monospace";
        ctx.fillText(weapon.ammoType.toUpperCase(), 280, screenHeight - 20);
    } else {
        ctx.fillStyle = "#888";
        ctx.font = "14px monospace";
        ctx.fillText("MELEE", 220, screenHeight - 20);
    }

    ctx.fillStyle = "#ff4444";
    ctx.font = "bold 16px monospace";
    ctx.fillText(`KILLS: ${deadEnemies}/${totalEnemies}`, 380, screenHeight - 35);

    ctx.fillStyle = "#aaa";
    ctx.font = "12px monospace";
    ctx.fillText(level.name, 380, screenHeight - 18);

    ctx.fillStyle = "#222";
    ctx.fillRect(520, screenHeight - 60, 130, 45);
    ctx.strokeStyle = "#444";
    ctx.strokeRect(520, screenHeight - 60, 130, 45);

    const weapons = [WeaponType.FIST, WeaponType.CHAINSAW, WeaponType.PISTOL, WeaponType.SHOTGUN, WeaponType.CHAINGUN];
    weapons.forEach((w, i) => {
        const hasWeapon = unlockedWeapons.has(w);
        const isActive = player.weapon === w;
        const slotX = 525 + i * 25;
        const slotY = screenHeight - 55;

        ctx.fillStyle = isActive ? "#ff6600" : hasWeapon ? "#444" : "#222";
        ctx.fillRect(slotX, slotY, 22, 35);

        if (hasWeapon) {
            ctx.fillStyle = isActive ? "#fff" : "#888";
            ctx.font = "bold 10px monospace";
            ctx.fillText(`${i + 1}`, slotX + 7, slotY + 22);
        }
    });

    // Crosshair based on settings
    ctx.strokeStyle = "#0f0";
    ctx.fillStyle = "#0f0";
    ctx.lineWidth = 2;

    if (settings.crosshairStyle === "cross") {
        ctx.beginPath();
        ctx.moveTo(screenWidth / 2 - 15, screenHeight / 2);
        ctx.lineTo(screenWidth / 2 - 5, screenHeight / 2);
        ctx.moveTo(screenWidth / 2 + 5, screenHeight / 2);
        ctx.lineTo(screenWidth / 2 + 15, screenHeight / 2);
        ctx.moveTo(screenWidth / 2, screenHeight / 2 - 15);
        ctx.lineTo(screenWidth / 2, screenHeight / 2 - 5);
        ctx.moveTo(screenWidth / 2, screenHeight / 2 + 5);
        ctx.lineTo(screenWidth / 2, screenHeight / 2 + 15);
        ctx.stroke();
    } else if (settings.crosshairStyle === "dot") {
        ctx.beginPath();
        ctx.arc(screenWidth / 2, screenHeight / 2, 3, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.arc(screenWidth / 2, screenHeight / 2, 10, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.lineWidth = 1;

    // Minimap
    const mapSize = 90;
    const mapX = screenWidth - mapSize - 15;
    const mapY = screenHeight - mapSize - 80;
    const cellWidth = mapSize / level.map[0].length;
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

    ctx.fillStyle = "#0f0";
    ctx.beginPath();
    ctx.arc(mapX + player.x * cellWidth, mapY + player.y * cellHeight, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#0f0";
    ctx.beginPath();
    ctx.moveTo(mapX + player.x * cellWidth, mapY + player.y * cellHeight);
    ctx.lineTo(
        mapX + player.x * cellWidth + Math.cos(player.angle) * 8,
        mapY + player.y * cellHeight + Math.sin(player.angle) * 8
    );
    ctx.stroke();

    enemies.forEach((enemy) => {
        if (enemy.state !== "dead") {
            ctx.fillStyle = "#f00";
            ctx.beginPath();
            ctx.arc(mapX + enemy.x * cellWidth, mapY + enemy.y * cellHeight, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    pickups.forEach((pickup) => {
        if (!pickup.collected) {
            ctx.fillStyle = PICKUP_CONFIG[pickup.type].color;
            ctx.beginPath();
            ctx.rect(mapX + pickup.x * cellWidth - 1, mapY + pickup.y * cellHeight - 1, 3, 3);
            ctx.fill();
        }
    });
};


export const renderEnemy = (
    ctx: CanvasRenderingContext2D,
    player: Player,
    enemy: Enemy,
    dist: number,
    zBuffer: number[],
    screenWidth: number,
    screenHeight: number,
    numRays: number,
    fov: number
) => {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;

    const angleToEnemy = Math.atan2(dy, dx);
    const relAngle = normalizeAngle(angleToEnemy - player.angle);

    if (Math.abs(relAngle) > fov / 2 + 0.15) return;

    const screenX = screenWidth / 2 + (relAngle / fov) * screenWidth;
    const config = ENEMY_CONFIG[enemy.type];
    const spriteHeight = (screenHeight / dist) * config.size * 1.5;
    const spriteWidth = spriteHeight * 0.8;
    const spriteTop = (screenHeight - spriteHeight) / 2;

    const spriteLeft = screenX - spriteWidth / 2;
    const spriteRight = screenX + spriteWidth / 2;
    const startRay = Math.floor((spriteLeft / screenWidth) * numRays);
    const endRay = Math.ceil((spriteRight / screenWidth) * numRays);

    let visibleRays = 0;
    let totalRays = 0;
    for (let r = startRay; r <= endRay; r++) {
        if (r >= 0 && r < numRays) {
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
        if (r >= 0 && r < numRays && zBuffer[r] > dist - 0.3) {
            const rayX = (r / numRays) * screenWidth;
            const rayWidth = screenWidth / numRays;
            ctx.rect(rayX, 0, rayWidth + 1, screenHeight);
        }
    }
    ctx.clip();

    switch (enemy.type) {
        case EnemyType.IMP:
            drawImp(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade);
            break;
        case EnemyType.DEMON:
            drawDemon(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade);
            break;
        case EnemyType.SOLDIER:
            drawSoldier(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade);
            break;
        case EnemyType.CACODEMON:
            drawCacodemon(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade);
            break;
        case EnemyType.BARON:
            drawBaron(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade);
            break;
        case EnemyType.ZOMBIE:
            drawZombie(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade);
            break;
        case EnemyType.HELLKNIGHT:
            drawHellKnight(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade);
            break;
        case EnemyType.CYBERDEMON:
            drawCyberdemon(ctx, screenX, spriteTop, spriteWidth, spriteHeight, enemy, shade);
            break;
    }

    ctx.restore();
};

export const renderDebugView = (ctx: CanvasRenderingContext2D, level: Level, player: Player, enemies: Enemy[], screenWidth: number, screenHeight: number) => {
    // Basic top-down debug view
    const scale = 20;
    const offsetX = 50;
    const offsetY = 50;

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // Draw map
    for (let y = 0; y < level.map.length; y++) {
        for (let x = 0; x < level.map[y].length; x++) {
            if (level.map[y][x] > 0) {
                ctx.fillStyle = "#555";
                ctx.fillRect(x * scale, y * scale, scale, scale);
            } else {
                ctx.strokeStyle = "#333";
                ctx.strokeRect(x * scale, y * scale, scale, scale);
            }
        }
    }

    // Draw player
    ctx.fillStyle = "#0f0";
    ctx.beginPath();
    ctx.arc(player.x * scale, player.y * scale, 5, 0, Math.PI * 2);
    ctx.fill();
    // Angle
    ctx.strokeStyle = "#0f0";
    ctx.beginPath();
    ctx.moveTo(player.x * scale, player.y * scale);
    ctx.lineTo((player.x + Math.cos(player.angle) * 2) * scale, (player.y + Math.sin(player.angle) * 2) * scale);
    ctx.stroke();

    // Draw enemies
    enemies.forEach(e => {
        ctx.fillStyle = e.state === 'dead' ? "#444" : "#f00";
        ctx.beginPath();
        ctx.arc(e.x * scale, e.y * scale, 5, 0, Math.PI * 2);
        ctx.fill();
        // Path
        if (e.path.length > 0) {
            ctx.strokeStyle = "#ff0";
            ctx.beginPath();
            ctx.moveTo(e.x * scale, e.y * scale);
            e.path.forEach(p => ctx.lineTo(p.x * scale, p.y * scale));
            ctx.stroke();
        }
    });

    ctx.restore();
};

export const renderScene = (
    ctx: CanvasRenderingContext2D,
    player: Player,
    level: Level,
    enemies: Enemy[],
    projectiles: Projectile[],
    pickups: Pickup[],
    screenWidth: number,
    screenHeight: number,
    numRays: number,
    fov: number
) => {
    // 1. Background (Floor & Ceiling)
    const gradient = ctx.createLinearGradient(0, 0, 0, screenHeight / 2);
    gradient.addColorStop(0, "#1a0505");
    gradient.addColorStop(1, "#3d0a0a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, screenWidth, screenHeight / 2);

    const floorGradient = ctx.createLinearGradient(0, screenHeight / 2, 0, screenHeight);
    floorGradient.addColorStop(0, "#2a2a2a");
    floorGradient.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = floorGradient;
    ctx.fillRect(0, screenHeight / 2, screenWidth, screenHeight / 2);

    // 2. Raycasting (Walls)
    const zBuffer: number[] = new Array(numRays).fill(0);
    const rayWidth = screenWidth / numRays;

    for (let i = 0; i < numRays; i++) {
        const rayAngle = player.angle - fov / 2 + (i / numRays) * fov;
        const { distance, wallType, side } = castRay(level.map, player.x, player.y, rayAngle);

        const correctedDist = distance * Math.cos(rayAngle - player.angle);
        zBuffer[i] = correctedDist;

        const wallHeight = Math.min((screenHeight / correctedDist) * 1.2, screenHeight);
        const wallTop = (screenHeight - wallHeight) / 2;

        const colors = WALL_COLORS[wallType] || WALL_COLORS[1];
        const baseColor = side === 0 ? colors.light : colors.dark;

        const shade = Math.max(0.2, 1 - correctedDist / 15);
        ctx.fillStyle = shadeColor(baseColor, shade);
        ctx.fillRect(Math.floor(i * rayWidth), Math.floor(wallTop), Math.ceil(rayWidth) + 1, Math.ceil(wallHeight));
    }

    // 3. Sprites (Enemies, Projectiles, Pickups)
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
            renderEnemy(ctx, player, sprite.data as Enemy, sprite.dist, zBuffer, screenWidth, screenHeight, numRays, fov);
        } else if (sprite.type === 'projectile') {
            renderProjectile(ctx, player, sprite.data as Projectile, sprite.dist, zBuffer, screenWidth, screenHeight, numRays, fov);
        } else {
            renderPickup(ctx, player, sprite.data as Pickup, sprite.dist, zBuffer, screenWidth, screenHeight, numRays, fov);
        }
    }
};