import { Enemy } from "@/lib/fps-engine";

// Helper extracted from main file
export function shadeColor(color: string, factor: number): string {
  const hex = color.replace("#", "");
  const r = Math.min(255, Math.max(0, Math.floor(Number.parseInt(hex.slice(0, 2), 16) * factor)));
  const g = Math.min(255, Math.max(0, Math.floor(Number.parseInt(hex.slice(2, 4), 16) * factor)));
  const b = Math.min(255, Math.max(0, Math.floor(Number.parseInt(hex.slice(4, 6), 16) * factor)));
  return `rgb(${r}, ${g}, ${b})`;
}

// ============================================
// RETRO PIXEL-ART HELPER FUNCTIONS
// ============================================

// Draw a blocky rectangle with optional outline
function drawBlockyRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  fillColor: string, outlineColor: string = "#000", outlineWidth: number = 2
) {
  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, w, h);
  if (outlineWidth > 0) {
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = outlineWidth;
    ctx.strokeRect(x, y, w, h);
  }
}

// Draw a stepped/pixelated ellipse for retro look
function drawRetroEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, rx: number, ry: number,
  fillColor: string, outlineColor: string = "#000", outlineWidth: number = 2
) {
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  if (outlineWidth > 0) {
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = outlineWidth;
    ctx.stroke();
  }
}

// Draw retro-style glowing eyes
function drawGlowingEyes(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  eyeColor: string, eyeSpacing: number = 0.15, eyeSize: number = 0.06
) {
  ctx.save();
  ctx.fillStyle = eyeColor;
  ctx.shadowColor = eyeColor;
  ctx.shadowBlur = 8;
  // Left eye
  ctx.beginPath();
  ctx.ellipse(x - w * eyeSpacing, y, w * eyeSize, h * eyeSize * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Right eye
  ctx.beginPath();
  ctx.ellipse(x + w * eyeSpacing, y, w * eyeSize, h * eyeSize * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Draw triangular teeth
function drawTeeth(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  count: number, toothHeight: number = 0.08, mouthWidth: number = 0.3
) {
  ctx.fillStyle = "#fff";
  const toothWidth = (w * mouthWidth * 2) / count;
  const startX = x - w * mouthWidth;
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.moveTo(startX + i * toothWidth, y);
    ctx.lineTo(startX + i * toothWidth + toothWidth / 2, y + h * toothHeight);
    ctx.lineTo(startX + (i + 1) * toothWidth, y);
    ctx.closePath();
    ctx.fill();
  }
}

// Draw horns
function drawHorns(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  hornColor: string, hornSpread: number = 0.25, hornHeight: number = 0.2
) {
  ctx.fillStyle = hornColor;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  // Left horn
  ctx.beginPath();
  ctx.moveTo(x - w * hornSpread, y);
  ctx.lineTo(x - w * (hornSpread + 0.15), y - h * hornHeight);
  ctx.lineTo(x - w * (hornSpread - 0.08), y + h * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Right horn
  ctx.beginPath();
  ctx.moveTo(x + w * hornSpread, y);
  ctx.lineTo(x + w * (hornSpread + 0.15), y - h * hornHeight);
  ctx.lineTo(x + w * (hornSpread - 0.08), y + h * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

// ============================================
// ENEMY SPRITE DRAWING FUNCTIONS
// ============================================

export const drawImp = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) => {
  const bounce = enemy.state === "chasing" ? Math.sin(enemy.animFrame * 0.3) * h * 0.05 : 0;
  const baseColor = enemy.state === "dead" ? "#333" : enemy.state === "hurt" ? "#fff" : shadeColor("#8B4513", shade);
  const darkColor = enemy.state === "dead" ? "#222" : shadeColor("#5a2d0a", shade);

  // Body - blocky torso
  ctx.fillStyle = baseColor;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.35, y + h * 0.9 + bounce);
  ctx.lineTo(x - w * 0.4, y + h * 0.35 + bounce);
  ctx.lineTo(x - w * 0.25, y + h * 0.25 + bounce);
  ctx.lineTo(x + w * 0.25, y + h * 0.25 + bounce);
  ctx.lineTo(x + w * 0.4, y + h * 0.35 + bounce);
  ctx.lineTo(x + w * 0.35, y + h * 0.9 + bounce);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Head
  drawRetroEllipse(ctx, x, y + h * 0.15 + bounce, w * 0.28, h * 0.18, baseColor);

  // Spikes on head
  if (enemy.state !== "dead") {
    ctx.fillStyle = darkColor;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * w * 0.08, y + h * 0.02 + bounce);
      ctx.lineTo(x + i * w * 0.08 - w * 0.03, y + h * 0.12 + bounce);
      ctx.lineTo(x + i * w * 0.08 + w * 0.03, y + h * 0.12 + bounce);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Glowing eyes
    drawGlowingEyes(ctx, x, y + h * 0.12 + bounce, w, h, "#ff0", 0.1, 0.05);

    // Mouth
    ctx.fillStyle = "#200";
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.22 + bounce, w * 0.12, h * 0.04, 0, 0, Math.PI);
    ctx.fill();
    drawTeeth(ctx, x, y + h * 0.19 + bounce, w, h, 5, 0.04, 0.1);
  }

  // Attack fireball
  if (enemy.state === "attacking") {
    ctx.save();
    ctx.fillStyle = "#f80";
    ctx.shadowColor = "#f80";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(x, y + h * 0.6 + bounce, w * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff0";
    ctx.beginPath();
    ctx.arc(x, y + h * 0.6 + bounce, w * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
};

export const drawDemon = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) => {
  const bounce = enemy.state === "chasing" ? Math.sin(enemy.animFrame * 0.4) * h * 0.08 : 0;
  const baseColor = enemy.state === "dead" ? "#333" : enemy.state === "hurt" ? "#fff" : shadeColor("#FF1493", shade);
  const darkColor = enemy.state === "dead" ? "#222" : shadeColor("#a00050", shade);

  // Muscular body
  ctx.fillStyle = baseColor;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.45, y + h * 0.95 + bounce);
  ctx.lineTo(x - w * 0.5, y + h * 0.5 + bounce);
  ctx.lineTo(x - w * 0.45, y + h * 0.3 + bounce);
  ctx.lineTo(x - w * 0.3, y + h * 0.2 + bounce);
  ctx.lineTo(x + w * 0.3, y + h * 0.2 + bounce);
  ctx.lineTo(x + w * 0.45, y + h * 0.3 + bounce);
  ctx.lineTo(x + w * 0.5, y + h * 0.5 + bounce);
  ctx.lineTo(x + w * 0.45, y + h * 0.95 + bounce);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Head
  drawRetroEllipse(ctx, x, y + h * 0.12 + bounce, w * 0.32, h * 0.15, baseColor);

  if (enemy.state !== "dead") {
    // Horns
    drawHorns(ctx, x, y + h * 0.08 + bounce, w, h, darkColor, 0.22, 0.18);

    // Glowing green eyes
    drawGlowingEyes(ctx, x, y + h * 0.1 + bounce, w, h, "#0f0", 0.12, 0.06);

    // Wide mouth with teeth
    ctx.fillStyle = "#200";
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.2 + bounce, w * 0.18, h * 0.06, 0, 0, Math.PI);
    ctx.fill();
    drawTeeth(ctx, x, y + h * 0.16 + bounce, w, h, 7, 0.05, 0.15);

    // Muscle definition
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.35 + bounce);
    ctx.lineTo(x, y + h * 0.7 + bounce);
    ctx.stroke();
  }

  // Melee attack - open jaws
  if (enemy.state === "melee" || enemy.state === "attacking") {
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(x - w * 0.18, y + h * 0.22 + bounce, w * 0.36, h * 0.08);
    ctx.fill();
    ctx.stroke();
  }
};

export const drawSoldier = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) => {
  const bounce = enemy.state === "chasing" ? Math.sin(enemy.animFrame * 0.25) * h * 0.03 : 0;
  const baseColor = enemy.state === "dead" ? "#333" : enemy.state === "hurt" ? "#fff" : shadeColor("#556B2F", shade);
  const darkColor = enemy.state === "dead" ? "#222" : shadeColor("#2F4F2F", shade);

  // Body - military uniform
  drawBlockyRect(ctx, x - w * 0.28, y + h * 0.28 + bounce, w * 0.56, h * 0.55, baseColor);

  // Belt
  drawBlockyRect(ctx, x - w * 0.3, y + h * 0.5 + bounce, w * 0.6, h * 0.08, darkColor, "#000", 1);

  // Head
  drawRetroEllipse(ctx, x, y + h * 0.18 + bounce, w * 0.22, h * 0.16, baseColor);

  if (enemy.state !== "dead") {
    // Helmet
    ctx.fillStyle = darkColor;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.1 + bounce, w * 0.25, h * 0.1, 0, Math.PI, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Red visor/goggles
    ctx.fillStyle = "#f00";
    ctx.shadowColor = "#f00";
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.rect(x - w * 0.15, y + h * 0.14 + bounce, w * 0.3, h * 0.04);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Rifle
    ctx.fillStyle = "#222";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.fillRect(x + w * 0.22, y + h * 0.35 + bounce, w * 0.35, h * 0.06);
    ctx.strokeRect(x + w * 0.22, y + h * 0.35 + bounce, w * 0.35, h * 0.06);

    if (enemy.state === "attacking") {
      ctx.save();
      ctx.fillStyle = "#ff0";
      ctx.shadowColor = "#ff0";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(x + w * 0.58, y + h * 0.38 + bounce, w * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
};

export const drawCacodemon = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) => {
  const float = Math.sin(enemy.animFrame * 0.1) * h * 0.05;
  const baseColor = enemy.state === "dead" ? "#333" : enemy.state === "hurt" ? "#fff" : shadeColor("#DC143C", shade);
  const darkColor = enemy.state === "dead" ? "#222" : shadeColor("#8B0000", shade);
  const radius = Math.min(w, h) * 0.45;

  // Main body - layered circles for depth
  ctx.fillStyle = darkColor;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y + h * 0.5 + float, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.arc(x, y + h * 0.48 + float, radius * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.fillStyle = shadeColor(baseColor, 1.2);
  ctx.beginPath();
  ctx.arc(x - radius * 0.3, y + h * 0.35 + float, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  if (enemy.state !== "dead") {
    // Large central eye
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.4 + float, w * 0.22, h * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Iris
    ctx.fillStyle = "#0f0";
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.4 + float, w * 0.12, h * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.4 + float, w * 0.06, h * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x - w * 0.06, y + h * 0.36 + float, w * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // Horns around perimeter
    ctx.fillStyle = darkColor;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const hx = x + Math.cos(angle) * radius * 0.85;
      const hy = y + h * 0.5 + float + Math.sin(angle) * radius * 0.85;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx + Math.cos(angle) * w * 0.12, hy + Math.sin(angle) * h * 0.12);
      ctx.lineTo(hx + Math.cos(angle + 0.3) * w * 0.05, hy + Math.sin(angle + 0.3) * h * 0.05);
      ctx.closePath();
      ctx.fill();
    }

    // Mouth
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.65 + float, w * 0.2, h * 0.1, 0, 0, Math.PI);
    ctx.fill();
    drawTeeth(ctx, x, y + h * 0.58 + float, w, h, 7, 0.08, 0.18);
  }

  // Attack projectile
  if (enemy.state === "attacking") {
    ctx.save();
    ctx.fillStyle = "#00f";
    ctx.shadowColor = "#00f";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(x, y + h * 0.88 + float, w * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#88f";
    ctx.beginPath();
    ctx.arc(x, y + h * 0.88 + float, w * 0.07, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
};

export const drawBaron = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) => {
  const bounce = enemy.state === "chasing" ? Math.sin(enemy.animFrame * 0.2) * h * 0.04 : 0;
  const baseColor = enemy.state === "dead" ? "#333" : enemy.state === "hurt" ? "#fff" : shadeColor("#228B22", shade);
  const darkColor = enemy.state === "dead" ? "#222" : shadeColor("#145214", shade);

  // Imposing trapezoidal body
  ctx.fillStyle = baseColor;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.35, y + h * 0.95 + bounce);
  ctx.lineTo(x - w * 0.5, y + h * 0.4 + bounce);
  ctx.lineTo(x - w * 0.4, y + h * 0.25 + bounce);
  ctx.lineTo(x + w * 0.4, y + h * 0.25 + bounce);
  ctx.lineTo(x + w * 0.5, y + h * 0.4 + bounce);
  ctx.lineTo(x + w * 0.35, y + h * 0.95 + bounce);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Muscle shading
  ctx.fillStyle = darkColor;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.1, y + h * 0.3 + bounce);
  ctx.lineTo(x - w * 0.15, y + h * 0.7 + bounce);
  ctx.lineTo(x, y + h * 0.75 + bounce);
  ctx.lineTo(x + w * 0.15, y + h * 0.7 + bounce);
  ctx.lineTo(x + w * 0.1, y + h * 0.3 + bounce);
  ctx.closePath();
  ctx.fill();

  // Head
  drawRetroEllipse(ctx, x, y + h * 0.15 + bounce, w * 0.28, h * 0.15, baseColor);

  if (enemy.state !== "dead") {
    // Large curved horns
    ctx.fillStyle = "#8B4513";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    // Left horn
    ctx.beginPath();
    ctx.moveTo(x - w * 0.18, y + h * 0.08 + bounce);
    ctx.quadraticCurveTo(x - w * 0.55, y - h * 0.1 + bounce, x - w * 0.4, y - h * 0.15 + bounce);
    ctx.lineTo(x - w * 0.12, y + h * 0.05 + bounce);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Right horn
    ctx.beginPath();
    ctx.moveTo(x + w * 0.18, y + h * 0.08 + bounce);
    ctx.quadraticCurveTo(x + w * 0.55, y - h * 0.1 + bounce, x + w * 0.4, y - h * 0.15 + bounce);
    ctx.lineTo(x + w * 0.12, y + h * 0.05 + bounce);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing red eyes
    ctx.save();
    ctx.fillStyle = "#f00";
    ctx.shadowColor = "#f00";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(x - w * 0.1, y + h * 0.12 + bounce, w * 0.06, h * 0.035, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.1, y + h * 0.12 + bounce, w * 0.06, h * 0.035, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Mouth
    ctx.fillStyle = "#200";
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.22 + bounce, w * 0.12, h * 0.04, 0, 0, Math.PI);
    ctx.fill();
  }

  // Clawed feet
  ctx.fillStyle = enemy.state === "dead" ? "#222" : darkColor;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x - w * 0.25, y + h * 0.95 + bounce, w * 0.15, h * 0.06, 0, 0, Math.PI * 2);
  ctx.ellipse(x + w * 0.25, y + h * 0.95 + bounce, w * 0.15, h * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Attack - green plasma
  if (enemy.state === "attacking") {
    ctx.save();
    ctx.fillStyle = "#0f0";
    ctx.shadowColor = "#0f0";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(x - w * 0.45, y + h * 0.5 + bounce, w * 0.14, 0, Math.PI * 2);
    ctx.arc(x + w * 0.45, y + h * 0.5 + bounce, w * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8f8";
    ctx.beginPath();
    ctx.arc(x - w * 0.45, y + h * 0.5 + bounce, w * 0.07, 0, Math.PI * 2);
    ctx.arc(x + w * 0.45, y + h * 0.5 + bounce, w * 0.07, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
};

export const drawZombie = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) => {
  const shamble = enemy.state === "chasing" ? Math.sin(enemy.animFrame * 0.15) * h * 0.04 : 0;
  const baseColor = enemy.state === "dead" ? "#222" : enemy.state === "hurt" ? "#fff" : shadeColor("#4a4a2a", shade);
  const clothColor = enemy.state === "dead" ? "#1a1a1a" : shadeColor("#3a3a1a", shade);
  const fleshColor = enemy.state === "dead" ? "#333" : shadeColor("#5a4a3a", shade);

  // Tattered body
  ctx.fillStyle = clothColor;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.22, y + h * 0.32 + shamble);
  ctx.lineTo(x - w * 0.25, y + h * 0.85 + shamble);
  // Torn edge
  ctx.lineTo(x - w * 0.18, y + h * 0.82 + shamble);
  ctx.lineTo(x - w * 0.12, y + h * 0.88 + shamble);
  ctx.lineTo(x - w * 0.05, y + h * 0.83 + shamble);
  ctx.lineTo(x + w * 0.05, y + h * 0.88 + shamble);
  ctx.lineTo(x + w * 0.12, y + h * 0.82 + shamble);
  ctx.lineTo(x + w * 0.18, y + h * 0.87 + shamble);
  ctx.lineTo(x + w * 0.25, y + h * 0.85 + shamble);
  ctx.lineTo(x + w * 0.22, y + h * 0.32 + shamble);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Exposed flesh wound
  ctx.fillStyle = fleshColor;
  ctx.beginPath();
  ctx.ellipse(x - w * 0.08, y + h * 0.5 + shamble, w * 0.08, h * 0.1, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Head
  drawRetroEllipse(ctx, x, y + h * 0.2 + shamble, w * 0.2, h * 0.18, baseColor);

  if (enemy.state !== "dead") {
    // Messy hair
    ctx.fillStyle = clothColor;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * w * 0.06, y + h * 0.05 + shamble);
      ctx.lineTo(x + i * w * 0.06 - w * 0.02, y + h * 0.12 + shamble);
      ctx.lineTo(x + i * w * 0.06 + w * 0.02, y + h * 0.12 + shamble);
      ctx.closePath();
      ctx.fill();
    }

    // Orange glowing eyes
    drawGlowingEyes(ctx, x, y + h * 0.17 + shamble, w, h, "#ff6600", 0.08, 0.04);

    // Open mouth
    ctx.fillStyle = "#200";
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.26 + shamble, w * 0.08, h * 0.04, 0, 0, Math.PI);
    ctx.fill();

    // Arms
    ctx.fillStyle = baseColor;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    const armReach = enemy.state === "melee" ? w * 0.2 : 0;
    // Left arm
    ctx.fillRect(x - w * 0.42 - armReach, y + h * 0.38 + shamble, w * 0.2, h * 0.08);
    ctx.strokeRect(x - w * 0.42 - armReach, y + h * 0.38 + shamble, w * 0.2, h * 0.08);
    // Right arm
    ctx.fillRect(x + w * 0.22 + armReach, y + h * 0.38 + shamble, w * 0.2, h * 0.08);
    ctx.strokeRect(x + w * 0.22 + armReach, y + h * 0.38 + shamble, w * 0.2, h * 0.08);

    // Claw hands
    ctx.fillStyle = fleshColor;
    for (let i = 0; i < 3; i++) {
      // Left hand claws
      ctx.beginPath();
      ctx.moveTo(x - w * 0.42 - armReach - w * 0.02, y + h * 0.4 + shamble + i * h * 0.02);
      ctx.lineTo(x - w * 0.5 - armReach, y + h * 0.41 + shamble + i * h * 0.02);
      ctx.lineTo(x - w * 0.42 - armReach - w * 0.02, y + h * 0.42 + shamble + i * h * 0.02);
      ctx.fill();
      // Right hand claws
      ctx.beginPath();
      ctx.moveTo(x + w * 0.42 + armReach + w * 0.02, y + h * 0.4 + shamble + i * h * 0.02);
      ctx.lineTo(x + w * 0.5 + armReach, y + h * 0.41 + shamble + i * h * 0.02);
      ctx.lineTo(x + w * 0.42 + armReach + w * 0.02, y + h * 0.42 + shamble + i * h * 0.02);
      ctx.fill();
    }
  }
};

export const drawHellKnight = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) => {
  const bounce = enemy.state === "chasing" ? Math.sin(enemy.animFrame * 0.25) * h * 0.05 : 0;
  const baseColor = enemy.state === "dead" ? "#333" : enemy.state === "hurt" ? "#fff" : shadeColor("#8B7355", shade);
  const darkColor = enemy.state === "dead" ? "#222" : shadeColor("#5a4030", shade);

  // Leaner body than Baron
  ctx.fillStyle = baseColor;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.3, y + h * 0.95 + bounce);
  ctx.lineTo(x - w * 0.42, y + h * 0.4 + bounce);
  ctx.lineTo(x - w * 0.32, y + h * 0.25 + bounce);
  ctx.lineTo(x + w * 0.32, y + h * 0.25 + bounce);
  ctx.lineTo(x + w * 0.42, y + h * 0.4 + bounce);
  ctx.lineTo(x + w * 0.3, y + h * 0.95 + bounce);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Muscle definition
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.3 + bounce);
  ctx.lineTo(x, y + h * 0.65 + bounce);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - w * 0.15, y + h * 0.35 + bounce);
  ctx.lineTo(x - w * 0.2, y + h * 0.55 + bounce);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + w * 0.15, y + h * 0.35 + bounce);
  ctx.lineTo(x + w * 0.2, y + h * 0.55 + bounce);
  ctx.stroke();

  // Head
  drawRetroEllipse(ctx, x, y + h * 0.15 + bounce, w * 0.24, h * 0.14, baseColor);

  if (enemy.state !== "dead") {
    // Curved horns
    ctx.fillStyle = "#654321";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    // Left
    ctx.beginPath();
    ctx.moveTo(x - w * 0.14, y + h * 0.08 + bounce);
    ctx.quadraticCurveTo(x - w * 0.4, y + bounce, x - w * 0.32, y - h * 0.1 + bounce);
    ctx.lineTo(x - w * 0.1, y + h * 0.04 + bounce);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Right
    ctx.beginPath();
    ctx.moveTo(x + w * 0.14, y + h * 0.08 + bounce);
    ctx.quadraticCurveTo(x + w * 0.4, y + bounce, x + w * 0.32, y - h * 0.1 + bounce);
    ctx.lineTo(x + w * 0.1, y + h * 0.04 + bounce);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing green eyes
    ctx.save();
    ctx.fillStyle = "#0f0";
    ctx.shadowColor = "#0f0";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(x - w * 0.08, y + h * 0.12 + bounce, w * 0.05, h * 0.03, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.08, y + h * 0.12 + bounce, w * 0.05, h * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Mouth
    ctx.fillStyle = "#200";
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.2 + bounce, w * 0.1, h * 0.035, 0, 0, Math.PI);
    ctx.fill();
  }

  // Attack - green energy ball
  if (enemy.state === "attacking") {
    ctx.save();
    ctx.fillStyle = "#00ff66";
    ctx.shadowColor = "#00ff66";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(x, y + h * 0.5 + bounce, w * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#aaffaa";
    ctx.beginPath();
    ctx.arc(x, y + h * 0.5 + bounce, w * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
};

export const drawCyberdemon = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, enemy: Enemy, shade: number) => {
  const baseColor = enemy.state === "dead" ? "#333" : enemy.state === "hurt" ? "#fff" : shadeColor("#8B0000", shade);
  const metalColor = enemy.state === "dead" ? "#222" : shadeColor("#4a4a4a", shade);
  const darkMetal = enemy.state === "dead" ? "#111" : shadeColor("#2a2a2a", shade);

  // Large imposing body
  ctx.fillStyle = baseColor;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.35, y + h * 0.95);
  ctx.lineTo(x - w * 0.45, y + h * 0.35);
  ctx.lineTo(x - w * 0.35, y + h * 0.2);
  ctx.lineTo(x + w * 0.35, y + h * 0.2);
  ctx.lineTo(x + w * 0.45, y + h * 0.35);
  ctx.lineTo(x + w * 0.35, y + h * 0.95);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Head
  drawRetroEllipse(ctx, x, y + h * 0.12, w * 0.22, h * 0.12, baseColor);

  // Mechanical leg
  ctx.fillStyle = metalColor;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  // Leg segments
  ctx.fillRect(x - w * 0.18, y + h * 0.7, w * 0.14, h * 0.28);
  ctx.strokeRect(x - w * 0.18, y + h * 0.7, w * 0.14, h * 0.28);
  // Joints
  ctx.fillStyle = darkMetal;
  ctx.beginPath();
  ctx.arc(x - w * 0.11, y + h * 0.72, w * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - w * 0.11, y + h * 0.85, w * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Arm cannon
  ctx.fillStyle = metalColor;
  ctx.fillRect(x + w * 0.28, y + h * 0.28, w * 0.35, h * 0.15);
  ctx.strokeRect(x + w * 0.28, y + h * 0.28, w * 0.35, h * 0.15);
  // Barrel
  ctx.fillStyle = darkMetal;
  ctx.fillRect(x + w * 0.55, y + h * 0.3, w * 0.15, h * 0.1);
  ctx.strokeRect(x + w * 0.55, y + h * 0.3, w * 0.15, h * 0.1);
  // Barrel hole
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(x + w * 0.7, y + h * 0.35, w * 0.04, 0, Math.PI * 2);
  ctx.fill();

  if (enemy.state !== "dead") {
    // Metallic horns
    ctx.fillStyle = metalColor;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.12, y + h * 0.05);
    ctx.lineTo(x - w * 0.32, y - h * 0.18);
    ctx.lineTo(x - w * 0.08, y + h * 0.02);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w * 0.12, y + h * 0.05);
    ctx.lineTo(x + w * 0.32, y - h * 0.18);
    ctx.lineTo(x + w * 0.08, y + h * 0.02);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red glowing eyes
    ctx.save();
    ctx.fillStyle = "#f00";
    ctx.shadowColor = "#f00";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.ellipse(x - w * 0.07, y + h * 0.08, w * 0.045, h * 0.025, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.07, y + h * 0.08, w * 0.045, h * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Mouth/jaw
    ctx.fillStyle = "#200";
    ctx.beginPath();
    ctx.rect(x - w * 0.1, y + h * 0.15, w * 0.2, h * 0.04);
    ctx.fill();
  }

  // Attack - rocket/muzzle flash
  if (enemy.state === "attacking") {
    ctx.save();
    ctx.fillStyle = "#ff0";
    ctx.shadowColor = "#ff0";
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(x + w * 0.72, y + h * 0.35, w * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f80";
    ctx.beginPath();
    ctx.arc(x + w * 0.72, y + h * 0.35, w * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f00";
    ctx.beginPath();
    ctx.arc(x + w * 0.72, y + h * 0.35, w * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
};

// ============================================
// WEAPON SPRITE DRAWING FUNCTIONS
// ============================================

export const drawFist = (ctx: CanvasRenderingContext2D, x: number, y: number, flash: number) => {
  const punchExtend = flash > 0 ? Math.min(flash * 8, 40) : 0;
  const skinBase = "#d4a574";
  const skinDark = "#b8956a";
  const skinLight = "#e8c4a0";

  ctx.save();

  // Arm (extends when punching)
  ctx.fillStyle = skinBase;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 30, y + 150);
  ctx.lineTo(x - 20, y + 60 - punchExtend);
  ctx.lineTo(x + 80, y + 50 - punchExtend);
  ctx.lineTo(x + 90, y + 150);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Forearm shading
  ctx.fillStyle = skinDark;
  ctx.beginPath();
  ctx.ellipse(x + 30, y + 100 - punchExtend * 0.3, 35, 20, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Back of hand
  ctx.fillStyle = skinBase;
  ctx.beginPath();
  ctx.ellipse(x + 35, y + 45 - punchExtend, 45, 35, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hand highlight
  ctx.fillStyle = skinLight;
  ctx.beginPath();
  ctx.ellipse(x + 25, y + 35 - punchExtend, 20, 15, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Knuckle row
  ctx.fillStyle = skinDark;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    const kx = x + 20 + i * 16;
    const ky = y + 15 - punchExtend;
    ctx.beginPath();
    ctx.arc(kx, ky, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Knuckle highlight
    ctx.fillStyle = skinLight;
    ctx.beginPath();
    ctx.arc(kx - 2, ky - 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = skinDark;
  }

  // Finger segments (curled fist)
  ctx.fillStyle = skinBase;
  for (let i = 0; i < 4; i++) {
    const fx = x + 20 + i * 16;
    const fy = y + 5 - punchExtend;
    ctx.beginPath();
    ctx.ellipse(fx, fy, 7, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Thumb
  ctx.fillStyle = skinBase;
  ctx.beginPath();
  ctx.ellipse(x + 75, y + 35 - punchExtend, 12, 20, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Wrist band/glove edge
  ctx.fillStyle = "#4a3020";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.fillRect(x - 25, y + 130, 120, 20);
  ctx.strokeRect(x - 25, y + 130, 120, 20);

  // Impact effect
  if (flash > 4) {
    ctx.fillStyle = "rgba(255, 255, 200, 0.5)";
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(x + 40, y - punchExtend, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

export const drawChainsaw = (ctx: CanvasRenderingContext2D, x: number, y: number, flash: number) => {
  const time = performance.now();
  const vibration = flash > 0 ? Math.sin(time * 0.1) * 3 : 0;
  const teethSpeed = flash > 0 ? 0.15 : 0.03;

  ctx.save();
  ctx.translate(vibration, vibration * 0.5);

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;

  // Chain teeth (animated) - drawn FIRST so they appear behind everything
  ctx.fillStyle = "#444";
  const teethOffset = (time * teethSpeed) % 12;
  for (let i = 0; i < 12; i++) {
    const ty = y - 105 + i * 12 + teethOffset;
    if (ty > y - 115 && ty < y - 15) {
      // Left teeth
      ctx.beginPath();
      ctx.moveTo(x - 10, ty);
      ctx.lineTo(x - 22, ty + 6);
      ctx.lineTo(x - 10, ty + 12);
      ctx.fill();
      // Right teeth
      ctx.beginPath();
      ctx.moveTo(x + 20, ty);
      ctx.lineTo(x + 32, ty + 6);
      ctx.lineTo(x + 20, ty + 12);
      ctx.fill();
    }
  }

  // Handle grip (wood)
  const woodGrain = (yPos: number) => {
    return Math.sin(yPos * 0.1) > 0 ? "#8B4513" : "#7a3c10";
  };
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = woodGrain(y + 40 + i * 10);
    ctx.fillRect(x - 20, y + 40 + i * 10, 60, 10);
  }
  ctx.strokeRect(x - 20, y + 40, 60, 100);

  // Handle grip lines
  ctx.strokeStyle = "#5a2a08";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(x - 15, y + 50 + i * 18);
    ctx.lineTo(x + 35, y + 50 + i * 18);
    ctx.stroke();
  }

  // Main body (orange housing)
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  const gradient = ctx.createLinearGradient(x - 30, y - 20, x + 50, y + 50);
  gradient.addColorStop(0, "#ff8800");
  gradient.addColorStop(0.5, "#ff6600");
  gradient.addColorStop(1, "#cc4400");
  ctx.fillStyle = gradient;
  ctx.fillRect(x - 30, y - 20, 80, 70);
  ctx.strokeRect(x - 30, y - 20, 80, 70);

  // Engine details
  ctx.fillStyle = "#333";
  ctx.fillRect(x - 25, y - 10, 30, 25);
  ctx.strokeRect(x - 25, y - 10, 30, 25);

  // Pull cord
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(x + 35, y + 10, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#555";
  ctx.beginPath();
  ctx.arc(x + 35, y + 10, 4, 0, Math.PI * 2);
  ctx.fill();

  // Exhaust
  ctx.fillStyle = "#444";
  ctx.fillRect(x + 40, y - 5, 15, 20);
  ctx.strokeRect(x + 40, y - 5, 15, 20);
  if (flash > 0) {
    // Exhaust smoke
    ctx.fillStyle = "rgba(100, 100, 100, 0.4)";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(x + 55 + i * 8, y + 5 - i * 5 + Math.sin(time * 0.01 + i) * 3, 6 + i * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Blade guard
  ctx.fillStyle = "#666";
  ctx.fillRect(x - 15, y - 30, 40, 15);
  ctx.strokeRect(x - 15, y - 30, 40, 15);

  // Blade (silver) - drawn AFTER teeth so blade is on top
  const bladeGradient = ctx.createLinearGradient(x - 10, y - 100, x + 20, y - 20);
  bladeGradient.addColorStop(0, "#ccc");
  bladeGradient.addColorStop(0.3, "#aaa");
  bladeGradient.addColorStop(0.7, "#ddd");
  bladeGradient.addColorStop(1, "#999");
  ctx.fillStyle = bladeGradient;
  ctx.fillRect(x - 10, y - 110, 30, 95);
  ctx.strokeRect(x - 10, y - 110, 30, 95);

  // Blade tip
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 110);
  ctx.lineTo(x + 5, y - 125);
  ctx.lineTo(x + 20, y - 110);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Blood splatter when hitting
  if (flash > 0) {
    ctx.fillStyle = "rgba(180, 0, 0, 0.6)";
    for (let i = 0; i < 5; i++) {
      const bx = x - 15 + Math.sin(time * 0.02 + i) * 20;
      const by = y - 80 + Math.cos(time * 0.03 + i * 2) * 30;
      ctx.beginPath();
      ctx.arc(bx, by, 4 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
};

export const drawPistol = (ctx: CanvasRenderingContext2D, x: number, y: number, flash: number) => {
  const recoil = flash > 0 ? Math.min(flash * 3, 15) : 0;
  const time = performance.now();

  ctx.save();
  ctx.translate(0, recoil);

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;

  // Grip (wood texture)
  const gripGradient = ctx.createLinearGradient(x - 12, y + 50, x + 12, y + 130);
  gripGradient.addColorStop(0, "#5a4030");
  gripGradient.addColorStop(0.3, "#4a3020");
  gripGradient.addColorStop(0.6, "#5a4030");
  gripGradient.addColorStop(1, "#3a2010");
  ctx.fillStyle = gripGradient;
  ctx.fillRect(x - 14, y + 50, 28, 85);
  ctx.strokeRect(x - 14, y + 50, 28, 85);

  // Grip texture lines
  ctx.strokeStyle = "#3a2010";
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 60 + i * 9);
    ctx.lineTo(x + 10, y + 60 + i * 9);
    ctx.stroke();
  }

  // Frame/receiver
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  const frameGradient = ctx.createLinearGradient(x - 18, y + 20, x + 18, y + 60);
  frameGradient.addColorStop(0, "#3a3a3a");
  frameGradient.addColorStop(0.5, "#2a2a2a");
  frameGradient.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = frameGradient;
  ctx.fillRect(x - 18, y + 20, 36, 40);
  ctx.strokeRect(x - 18, y + 20, 36, 40);

  // Trigger guard
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y + 58, 14, 0, Math.PI);
  ctx.stroke();

  // Trigger
  ctx.fillStyle = "#222";
  ctx.fillRect(x - 3, y + 50, 6, 15);

  // Slide
  const slideGradient = ctx.createLinearGradient(x - 12, y - 50, x + 12, y + 30);
  slideGradient.addColorStop(0, "#2a2a2a");
  slideGradient.addColorStop(0.3, "#1a1a1a");
  slideGradient.addColorStop(0.7, "#2a2a2a");
  slideGradient.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = slideGradient;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.fillRect(x - 12, y - 50, 24, 80);
  ctx.strokeRect(x - 12, y - 50, 24, 80);

  // Slide serrations
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 45 + i * 5);
    ctx.lineTo(x + 10, y - 45 + i * 5);
    ctx.stroke();
  }

  // Barrel
  ctx.fillStyle = "#111";
  ctx.fillRect(x - 6, y - 70, 12, 25);
  ctx.strokeStyle = "#000";
  ctx.strokeRect(x - 6, y - 70, 12, 25);

  // Front sight
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 70);
  ctx.lineTo(x, y - 78);
  ctx.lineTo(x + 4, y - 70);
  ctx.closePath();
  ctx.fill();

  // Rear sight
  ctx.fillStyle = "#222";
  ctx.fillRect(x - 8, y - 52, 4, 6);
  ctx.fillRect(x + 4, y - 52, 4, 6);

  // Hammer
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(x, y + 15, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ejecting shell (during fire)
  if (flash > 3 && flash < 8) {
    ctx.fillStyle = "#d4a020";
    ctx.strokeStyle = "#a08010";
    ctx.lineWidth = 1;
    const shellX = x + 25 + (8 - flash) * 5;
    const shellY = y + 10 - (8 - flash) * 8;
    ctx.save();
    ctx.translate(shellX, shellY);
    ctx.rotate((8 - flash) * 0.3);
    ctx.fillRect(-3, -8, 6, 16);
    ctx.strokeRect(-3, -8, 6, 16);
    ctx.restore();
  }

  // Muzzle flash
  if (flash > 4) {
    ctx.save();
    // Outer flash
    ctx.fillStyle = "#ff8800";
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(x, y - 80, 25, 0, Math.PI * 2);
    ctx.fill();
    // Inner flash
    ctx.fillStyle = "#ffff00";
    ctx.shadowColor = "#ffff00";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(x, y - 80, 15, 0, Math.PI * 2);
    ctx.fill();
    // Core
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y - 80, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
};

export const drawShotgun = (ctx: CanvasRenderingContext2D, x: number, y: number, flash: number) => {
  const recoil = flash > 0 ? Math.min(flash * 5, 25) : 0;
  const pumpOffset = flash > 2 && flash < 6 ? (flash - 2) * 8 : 0;

  ctx.save();
  ctx.translate(0, recoil);

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;

  // Stock (wood grain)
  const stockGradient = ctx.createLinearGradient(x - 20, y + 60, x + 20, y + 160);
  stockGradient.addColorStop(0, "#6a4a30");
  stockGradient.addColorStop(0.2, "#5a4030");
  stockGradient.addColorStop(0.4, "#7a5a40");
  stockGradient.addColorStop(0.6, "#5a4030");
  stockGradient.addColorStop(0.8, "#6a4a30");
  stockGradient.addColorStop(1, "#4a3020");
  ctx.fillStyle = stockGradient;
  ctx.fillRect(x - 18, y + 60, 36, 105);
  ctx.strokeRect(x - 18, y + 60, 36, 105);

  // Wood grain lines
  ctx.strokeStyle = "#4a3020";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 12; i++) {
    const offset = Math.sin(i * 0.8) * 5;
    ctx.beginPath();
    ctx.moveTo(x - 15 + offset, y + 65 + i * 8);
    ctx.quadraticCurveTo(x + offset, y + 69 + i * 8, x + 15 + offset, y + 65 + i * 8);
    ctx.stroke();
  }

  // Receiver - extended to connect with stock (no gap)
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  const receiverGradient = ctx.createLinearGradient(x - 22, y + 15, x + 22, y + 65);
  receiverGradient.addColorStop(0, "#4a4a4a");
  receiverGradient.addColorStop(0.5, "#3a3a3a");
  receiverGradient.addColorStop(1, "#2a2a2a");
  ctx.fillStyle = receiverGradient;
  ctx.fillRect(x - 22, y + 15, 44, 50);
  ctx.strokeRect(x - 22, y + 15, 44, 50);

  // Ejection port
  ctx.fillStyle = "#111";
  ctx.fillRect(x + 8, y + 20, 12, 10);

  // Pump/forend (moves during reload)
  ctx.fillStyle = "#5a4a3a";
  ctx.fillRect(x - 16, y - 15 + pumpOffset, 32, 35);
  ctx.strokeRect(x - 16, y - 15 + pumpOffset, 32, 35);
  // Pump ridges
  ctx.strokeStyle = "#3a3020";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x - 14, y - 10 + i * 8 + pumpOffset);
    ctx.lineTo(x + 14, y - 10 + i * 8 + pumpOffset);
    ctx.stroke();
  }

  // Barrel/tube
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  const barrelGradient = ctx.createLinearGradient(x - 14, y - 90, x + 14, y);
  barrelGradient.addColorStop(0, "#3a3a3a");
  barrelGradient.addColorStop(0.4, "#2a2a2a");
  barrelGradient.addColorStop(0.6, "#3a3a3a");
  barrelGradient.addColorStop(1, "#2a2a2a");
  ctx.fillStyle = barrelGradient;
  ctx.fillRect(x - 14, y - 90, 28, 85);
  ctx.strokeRect(x - 14, y - 90, 28, 85);

  // Magazine tube (underneath)
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.ellipse(x, y - 50, 8, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Barrel holes (double barrel look)
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(x - 5, y - 92, 7, 0, Math.PI * 2);
  ctx.arc(x + 5, y - 92, 7, 0, Math.PI * 2);
  ctx.fill();

  // Front bead sight
  ctx.fillStyle = "#ff0000";
  ctx.beginPath();
  ctx.arc(x, y - 95, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.stroke();

  // Shell ejecting
  if (flash > 4 && flash < 8) {
    ctx.fillStyle = "#cc3300";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    const shellX = x + 25 + (8 - flash) * 6;
    const shellY = y + 25 - (8 - flash) * 10;
    ctx.save();
    ctx.translate(shellX, shellY);
    ctx.rotate((8 - flash) * 0.4);
    // Shell body
    ctx.fillRect(-5, -12, 10, 24);
    ctx.strokeRect(-5, -12, 10, 24);
    // Brass base
    ctx.fillStyle = "#d4a020";
    ctx.fillRect(-5, 8, 10, 4);
    ctx.restore();
  }

  // Muzzle flash (spread pattern)
  if (flash > 4) {
    ctx.save();
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 35;

    // Main flash
    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    ctx.arc(x, y - 105, 40, 0, Math.PI * 2);
    ctx.fill();

    // Spread rays
    ctx.fillStyle = "#ff8800";
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(x, y - 105);
      ctx.lineTo(x + Math.cos(angle - 0.1) * 50, y - 105 + Math.sin(angle - 0.1) * 50);
      ctx.lineTo(x + Math.cos(angle + 0.1) * 50, y - 105 + Math.sin(angle + 0.1) * 50);
      ctx.closePath();
      ctx.fill();
    }

    // Inner flash
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.arc(x, y - 105, 25, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y - 105, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
};

export const drawChaingun = (ctx: CanvasRenderingContext2D, x: number, y: number, flash: number) => {
  const time = performance.now();
  const isSpinning = flash > 0;
  const spinAngle = isSpinning ? (time * 0.015) % (Math.PI * 2) : 0;
  const vibration = isSpinning ? Math.sin(time * 0.2) * 2 : 0;

  ctx.save();
  ctx.translate(vibration, 0);

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;

  // Main body housing
  ctx.fillStyle = "#3a3a3a";
  ctx.fillRect(x - 30, y + 10, 60, 90);
  ctx.strokeRect(x - 30, y + 10, 60, 90);

  // Body details
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(x - 25, y + 20, 50, 20);
  ctx.fillRect(x - 25, y + 80, 50, 15);

  // Handle grip
  ctx.fillStyle = "#4a3020";
  ctx.fillRect(x - 15, y + 95, 30, 60);
  ctx.strokeRect(x - 15, y + 95, 30, 60);

  // Grip lines
  ctx.strokeStyle = "#3a2510";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(x - 12, y + 105 + i * 10);
    ctx.lineTo(x + 12, y + 105 + i * 10);
    ctx.stroke();
  }

  // Barrel shroud (covers the barrel bases)
  ctx.fillStyle = "#333";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Draw 6 rotating barrels
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const angle = spinAngle + (i / 6) * Math.PI * 2;
    const barrelX = x + Math.cos(angle) * 16;

    // Each barrel is a simple vertical rectangle
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(barrelX - 5, y - 90, 10, 90);
    ctx.strokeRect(barrelX - 5, y - 90, 10, 90);

    // Barrel hole
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(barrelX, y - 92, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Center hub (on top of barrels)
  ctx.fillStyle = "#4a4a4a";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hub center bolt
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Muzzle flash
  if (flash > 2) {
    ctx.save();
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 25;
    ctx.globalAlpha = 0.8;

    ctx.fillStyle = "#ff8800";
    ctx.beginPath();
    ctx.arc(x, y - 100, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.arc(x, y - 100, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x, y - 100, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
};

