import { Enemy, WeaponType, Player } from "@/lib/fps-engine";

// Utility to darken colors based on distance
export const shadeColor = (color: string, factor: number): string => {
    const hex = color.replace("#", "");
    const r = Math.min(255, Math.max(0, Math.floor(parseInt(hex.slice(0, 2), 16) * factor)));
    const g = Math.min(255, Math.max(0, Math.floor(parseInt(hex.slice(2, 4), 16) * factor)));
    const b = Math.min(255, Math.max(0, Math.floor(parseInt(hex.slice(4, 6), 16) * factor)));
    return `rgb(${r}, ${g}, ${b})`;
};

// --- Enemy Drawers ---

export function drawImp(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) {
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
}

export function drawDemon(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) {
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
}

export function drawSoldier(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) {
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
}

export function drawCacodemon(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) {
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
}

export function drawBaron(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) {
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
}

export function drawZombie(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) {
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
}

export function drawHellKnight(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) {
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
}

export function drawCyberdemon(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) {
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
}

// --- Weapon Drawers ---

export function drawWeapon(ctx: CanvasRenderingContext2D, player: Player, screenW: number, screenH: number, flash: number) {
    const bob = player.isMoving ? Math.sin(player.bobPhase) * 10 : 0;
    const weaponX = screenW / 2;
    const weaponY = screenH - 150 + bob;
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
}

function drawFist(ctx: CanvasRenderingContext2D, x: number, y: number, flash: number) {
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
}

function drawChainsaw(ctx: CanvasRenderingContext2D, x: number, y: number, flash: number) {
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
}

function drawPistol(ctx: CanvasRenderingContext2D, x: number, y: number, flash: number) {
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
}

function drawShotgun(ctx: CanvasRenderingContext2D, x: number, y: number, flash: number) {
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
}

function drawChaingun(ctx: CanvasRenderingContext2D, x: number, y: number, flash: number) {
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
}