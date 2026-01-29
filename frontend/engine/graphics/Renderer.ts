import { 
    Player, Enemy, Projectile, Pickup, Level, 
    castRay, getDistance, normalizeAngle, 
    WALL_COLORS, ENEMY_CONFIG, PICKUP_CONFIG, WEAPON_CONFIG,
    WeaponType, AmmoType
} from "@/lib/fps-engine";
import * as Sprites from "./Sprites";
import { shadeColor } from "./Sprites"; // Re-export from Sprites if needed

// Rendering Constants
const FOV = Math.PI / 3;

export function renderDebugView (
    ctx: CanvasRenderingContext2D,
    level: Level,
    player: Player,
    enemies: Enemy[]
  ) => {
    const SCREEN_WIDTH = this.width;
    const SCREEN_HEIGHT = this.height;

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

export function renderProjectile (
    ctx: CanvasRenderingContext2D,
    player: Player,
    proj: Projectile,
    dist: number,
    zBuffer: number[]
  ) => {
    const SCREEN_WIDTH = this.width;
    const SCREEN_HEIGHT = this.height;
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

export function renderPickup (
    ctx: CanvasRenderingContext2D,
    player: Player,
    pickup: Pickup,
    dist: number,
    zBuffer: number[]
  ) => {
    const SCREEN_WIDTH = this.width;
    const SCREEN_HEIGHT = this.height;
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

export function renderEnemy (
    ctx: CanvasRenderingContext2D,
    player: Player,
    enemy: Enemy,
    dist: number,
    zBuffer: number[]
  ) => {
    const SCREEN_WIDTH = this.width;
    const SCREEN_HEIGHT = this.height;
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

export function drawWeapon (ctx: CanvasRenderingContext2D, player: Player, flash: number) => {
    const SCREEN_WIDTH = this.width;
    const SCREEN_HEIGHT = this.height;

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

export function drawHUD (ctx: CanvasRenderingContext2D, player: Player, enemies: Enemy[], level: Level) => {
    const SCREEN_WIDTH = this.width;
    const SCREEN_HEIGHT = this.height;

    const deadEnemies = enemies.filter((e) => e.state === "dead").length;
    const totalEnemies = enemies.length;

    ctx.fillStyle = "rgba(40, 40, 40, 0.9)";
    ctx.fillRect(0, SCREEN_HEIGHT - 70, SCREEN_WIDTH, 70);

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

    ctx.fillStyle = "#ff4444";
    ctx.font = "bold 16px monospace";
    ctx.fillText(`KILLS: ${deadEnemies}/${totalEnemies}`, 380, SCREEN_HEIGHT - 35);

    ctx.fillStyle = "#aaa";
    ctx.font = "12px monospace";
    ctx.fillText(level.name, 380, SCREEN_HEIGHT - 18);

    ctx.fillStyle = "#222";
    ctx.fillRect(520, SCREEN_HEIGHT - 60, 130, 45);
    ctx.strokeStyle = "#444";
    ctx.strokeRect(520, SCREEN_HEIGHT - 60, 130, 45);

    const weapons = [WeaponType.FIST, WeaponType.CHAINSAW, WeaponType.PISTOL, WeaponType.SHOTGUN, WeaponType.CHAINGUN];
    weapons.forEach((w, i) => {
      const hasWeapon = state.progress.unlockedWeapons.has(w);
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

    // Crosshair based on settings
    ctx.strokeStyle = "#0f0";
    ctx.fillStyle = "#0f0";
    ctx.lineWidth = 2;

    if (settings.crosshairStyle === "cross") {
      ctx.beginPath();
      ctx.moveTo(SCREEN_WIDTH / 2 - 15, SCREEN_HEIGHT / 2);
      ctx.lineTo(SCREEN_WIDTH / 2 - 5, SCREEN_HEIGHT / 2);
      ctx.moveTo(SCREEN_WIDTH / 2 + 5, SCREEN_HEIGHT / 2);
      ctx.lineTo(SCREEN_WIDTH / 2 + 15, SCREEN_HEIGHT / 2);
      ctx.moveTo(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 15);
      ctx.lineTo(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 5);
      ctx.moveTo(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 5);
      ctx.lineTo(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 15);
      ctx.stroke();
    } else if (settings.crosshairStyle === "dot") {
      ctx.beginPath();
      ctx.arc(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 10, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.lineWidth = 1;

    // Minimap
    const mapSize = 90;
    const mapX = SCREEN_WIDTH - mapSize - 15;
    const mapY = SCREEN_HEIGHT - mapSize - 80;
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

    state.pickups.forEach((pickup) => {
      if (!pickup.collected) {
        ctx.fillStyle = PICKUP_CONFIG[pickup.type].color;
        ctx.beginPath();
        ctx.rect(mapX + pickup.x * cellWidth - 1, mapY + pickup.y * cellHeight - 1, 3, 3);
        ctx.fill();
      }
    });
  }

export function render (
    ctx: CanvasRenderingContext2D,
    player: Player,
    enemies: Enemy[],
    projectiles: Projectile[],
    pickups: Pickup[],
    flash: number,
    level: Level
  ) => {
    const SCREEN_WIDTH = this.width;
    const SCREEN_HEIGHT = this.height;
    const NUM_RAYS = this.numRays;

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

    const zBuffer: number[] = [];
    const rayWidth = SCREEN_WIDTH / NUM_RAYS;

    for (let i = 0; i < NUM_RAYS; i++) {
      const rayAngle = player.angle - FOV / 2 + (i / NUM_RAYS) * FOV;
      const { distance, wallType, side } = castRay(level.map, player.x, player.y, rayAngle);

      const correctedDist = distance * Math.cos(rayAngle - player.angle);
      zBuffer[i] = correctedDist;

      const wallHeight = Math.min((SCREEN_HEIGHT / correctedDist) * 1.2, SCREEN_HEIGHT);
      const wallTop = (SCREEN_HEIGHT - wallHeight) / 2;

      const colors = WALL_COLORS[wallType] || WALL_COLORS[1];
      const baseColor = side === 0 ? colors.light : colors.dark;

      const shade = Math.max(0.2, 1 - correctedDist / 15);
      ctx.fillStyle = shadeColor(baseColor, shade);
      ctx.fillRect(Math.floor(i * rayWidth), Math.floor(wallTop), Math.ceil(rayWidth) + 1, Math.ceil(wallHeight));
    }

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
        renderEnemy(ctx, player, sprite.data as Enemy, sprite.dist, zBuffer);
      } else if (sprite.type === 'projectile') {
        renderProjectile(ctx, player, sprite.data as Projectile, sprite.dist, zBuffer);
      } else {
        renderPickup(ctx, player, sprite.data as Pickup, sprite.dist, zBuffer);
      }
    }

    if (flash > 0) {
      ctx.fillStyle = `rgba(255, 200, 100, ${flash / 20})`;
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }

    drawWeapon(ctx, player, flash);
    drawHUD(ctx, player, enemies, level);

    if (settings.debugMode) {
      renderDebugView(ctx, level, player, enemies);
    }

    // FPS counter
    if (settings.showFPS) {
      ctx.fillStyle = "#0f0";
      ctx.font = "14px monospace";
      ctx.fillText(`FPS: ${fpsRef.current}`, 10, 20);
    }
  }