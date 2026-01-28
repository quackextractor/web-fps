"use client";

import React from "react"

import { useCallback, useEffect, useRef, useState } from "react";
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
  LEVELS,
  castRay,
  checkCollision,
  hasLineOfSight,
  getDistance,
  normalizeAngle,
} from "@/lib/doom-engine";
import { soundManager } from "@/lib/sound-manager";

const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;
const FOV = Math.PI / 3;
const NUM_RAYS = 200;
const MOVE_SPEED = 0.08;
const ROTATION_SPEED = 0.003;
const PROJECTILE_SPEED = 0.18;

type GameState = "mainMenu" | "levelSelect" | "settings" | "playing" | "paused" | "dead" | "victory" | "levelComplete";

interface GameSettings {
  mouseSensitivity: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  showFPS: boolean;
  crosshairStyle: "cross" | "dot" | "circle";
  difficulty: "easy" | "normal" | "hard";
}

interface SavedProgress {
  unlockedLevels: Set<number>;
  unlockedWeapons: Set<WeaponType>;
  highestLevel: number;
}

const DEFAULT_SETTINGS: GameSettings = {
  mouseSensitivity: 1,
  soundEnabled: true,
  musicEnabled: true,
  showFPS: false,
  crosshairStyle: "cross",
  difficulty: "normal",
};

export default function DoomGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<GameState>("mainMenu");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [savedProgress, setSavedProgress] = useState<SavedProgress>({
    unlockedLevels: new Set([0]),
    unlockedWeapons: new Set([WeaponType.FIST, WeaponType.PISTOL]),
    highestLevel: 0,
  });

  // Weapons collected from PREVIOUS levels (not current)
  const previousLevelWeaponsRef = useRef<Set<WeaponType>>(new Set([WeaponType.FIST, WeaponType.PISTOL]));
  const previousLevelAmmoRef = useRef<{ [AmmoType.BULLETS]: number;[AmmoType.SHELLS]: number }>({ [AmmoType.BULLETS]: 50, [AmmoType.SHELLS]: 0 });

  const playerRef = useRef<Player>(createInitialPlayer());
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const pickupsRef = useRef<Pickup[]>([]);
  const killsRef = useRef(0);
  const totalKillsRef = useRef(0);
  const shootFlashRef = useRef(0);
  const hurtFlashRef = useRef(0);
  const projectileIdRef = useRef(0);
  const lastShotTimeRef = useRef(0);
  const weaponsUnlockedRef = useRef<Set<WeaponType>>(new Set([WeaponType.FIST, WeaponType.PISTOL]));
  const currentLevelRef = useRef(0);
  const fpsRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastFPSTimeRef = useRef(0);

  const [, forceUpdate] = useState(0);
  const keysRef = useRef<Set<string>>(new Set());
  const mouseMovementRef = useRef(0);
  const lastTimeRef = useRef(0);
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    soundManager.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  useEffect(() => {
    offscreenCanvasRef.current = document.createElement('canvas');
    offscreenCanvasRef.current.width = SCREEN_WIDTH;
    offscreenCanvasRef.current.height = SCREEN_HEIGHT;
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  function createInitialPlayer(): Player {
    return {
      x: 2,
      y: 2,
      angle: 0,
      health: 100,
      maxHealth: 100,
      armor: 0,
      ammo: { [AmmoType.BULLETS]: 50, [AmmoType.SHELLS]: 0 },
      weapon: WeaponType.PISTOL,
      bobPhase: 0,
      isMoving: false,
      isMeleeing: false,
      meleeFrame: 0,
    };
  }

  const getDifficultyMultiplier = useCallback(() => {
    switch (settings.difficulty) {
      case "easy": return { damage: 0.5, health: 0.75, speed: 0.8 };
      case "hard": return { damage: 1.5, health: 1.25, speed: 1.2 };
      default: return { damage: 1, health: 1, speed: 1 };
    }
  }, [settings.difficulty]);

  const loadLevel = useCallback((levelIndex: number, preservePlayer = false) => {
    const level = LEVELS[levelIndex];
    if (!level) return;

    currentLevelRef.current = levelIndex;

    if (!preservePlayer) {
      playerRef.current = createInitialPlayer();
      weaponsUnlockedRef.current = new Set(savedProgress.unlockedWeapons);
      totalKillsRef.current = 0;
      // Store initial state for restart
      previousLevelWeaponsRef.current = new Set(savedProgress.unlockedWeapons);
      previousLevelAmmoRef.current = { [AmmoType.BULLETS]: 50, [AmmoType.SHELLS]: 0 };
    } else {
      // Store weapons/ammo from previous level completion
      previousLevelWeaponsRef.current = new Set(weaponsUnlockedRef.current);
      previousLevelAmmoRef.current = { ...playerRef.current.ammo };
    }

    playerRef.current.x = level.startX;
    playerRef.current.y = level.startY;
    playerRef.current.angle = level.startAngle;

    const diffMult = getDifficultyMultiplier();
    enemiesRef.current = level.enemies.map((e, i) => ({
      ...e,
      id: i,
      health: e.health * diffMult.health,
      damage: e.damage * diffMult.damage,
      speed: e.speed * diffMult.speed,
    }));
    pickupsRef.current = level.pickups.map((p, i) => ({ ...p, id: i, collected: false }));
    projectilesRef.current = [];
    killsRef.current = 0;
    shootFlashRef.current = 0;
  }, [savedProgress.unlockedWeapons, getDifficultyMultiplier]);

  const restartCurrentLevel = useCallback(() => {
    // Restore weapons and ammo from before current level started
    weaponsUnlockedRef.current = new Set(previousLevelWeaponsRef.current);
    playerRef.current = createInitialPlayer();
    playerRef.current.ammo = { ...previousLevelAmmoRef.current };

    // If we had a better weapon from previous levels, equip it
    if (previousLevelWeaponsRef.current.has(WeaponType.SHOTGUN)) {
      playerRef.current.weapon = WeaponType.SHOTGUN;
    } else if (previousLevelWeaponsRef.current.has(WeaponType.CHAINGUN)) {
      playerRef.current.weapon = WeaponType.CHAINGUN;
    }

    loadLevel(currentLevelRef.current, false);
    setGameState("playing");
  }, [loadLevel]);

  const startGame = useCallback((levelIndex: number) => {
    setCurrentLevel(levelIndex);
    loadLevel(levelIndex, false);
    setGameState("playing");
  }, [loadLevel]);

  const nextLevel = useCallback(() => {
    const next = currentLevelRef.current + 1;
    if (next < LEVELS.length) {
      // Unlock next level in progress
      setSavedProgress(prev => ({
        ...prev,
        unlockedLevels: new Set([...prev.unlockedLevels, next]),
        unlockedWeapons: new Set([...prev.unlockedWeapons, ...weaponsUnlockedRef.current]),
        highestLevel: Math.max(prev.highestLevel, next),
      }));
      setCurrentLevel(next);
      totalKillsRef.current += killsRef.current;
      loadLevel(next, true);
      setGameState("playing");
    } else {
      setGameState("victory");
    }
  }, [loadLevel]);

  const unlockAllLevels = useCallback(() => {
    setSavedProgress(prev => ({
      ...prev,
      unlockedLevels: new Set(LEVELS.map((_, i) => i)),
      highestLevel: LEVELS.length - 1,
    }));
  }, []);

  const unlockAllWeapons = useCallback(() => {
    const allWeapons = new Set([
      WeaponType.FIST,
      WeaponType.CHAINSAW,
      WeaponType.PISTOL,
      WeaponType.SHOTGUN,
      WeaponType.CHAINGUN,
    ]);
    setSavedProgress(prev => ({
      ...prev,
      unlockedWeapons: allWeapons,
    }));
    weaponsUnlockedRef.current = allWeapons;
  }, []);

  const attack = useCallback(() => {
    const player = playerRef.current;
    const weapon = WEAPON_CONFIG[player.weapon];
    const now = performance.now();

    if (now - lastShotTimeRef.current < weapon.fireRate) return;

    if (weapon.ammoType !== null) {
      if (player.ammo[weapon.ammoType] < weapon.ammoCost) return;
      playerRef.current.ammo[weapon.ammoType] -= weapon.ammoCost;
    }

    lastShotTimeRef.current = now;
    shootFlashRef.current = weapon.isMelee ? 4 : 8;
    soundManager.playShoot(player.weapon);

    if (weapon.isMelee) {
      playerRef.current.isMeleeing = true;
      playerRef.current.meleeFrame = 0;
    }

    const level = LEVELS[currentLevelRef.current];

    for (let p = 0; p < weapon.pellets; p++) {
      const spreadAngle = player.angle + (Math.random() - 0.5) * weapon.spread;

      if (weapon.isMelee) {
        for (const enemy of enemiesRef.current) {
          if (enemy.state === "dead") continue;

          const dist = getDistance(enemy.x, enemy.y, player.x, player.y);
          if (dist > weapon.range) continue;

          const angleToEnemy = Math.atan2(enemy.y - player.y, enemy.x - player.x);
          const angleDiff = normalizeAngle(angleToEnemy - player.angle);

          if (Math.abs(angleDiff) < 0.6) {
            const damage = weapon.damage * (0.8 + Math.random() * 0.4);
            enemy.health -= damage;
            enemy.state = "hurt";

            if (enemy.health <= 0) {
              enemy.state = "dead";
              enemy.animFrame = 0;
              killsRef.current += 1;
              soundManager.playEnemyDeath(enemy.type);
            }
          }
        }
      } else {
        const hitResult = castRay(level.map, player.x, player.y, spreadAngle);

        let closestHitIndex = -1;
        let closestDist = Math.min(hitResult.distance, weapon.range);

        for (let i = 0; i < enemiesRef.current.length; i++) {
          const enemy = enemiesRef.current[i];
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
          const damage = weapon.damage * (0.8 + Math.random() * 0.4);
          const enemy = enemiesRef.current[closestHitIndex];
          enemy.health -= damage;

          if (enemy.health <= 0) {
            enemy.state = "dead";
            enemy.animFrame = 0;
            killsRef.current += 1;
            soundManager.playEnemyDeath(enemy.type);
          } else {
            enemy.state = "hurt";
          }
        }
      }
    }
  }, []);

  const switchWeapon = useCallback((delta: number) => {
    const weapons = Array.from(weaponsUnlockedRef.current).sort((a, b) => a - b);
    const currentIdx = weapons.indexOf(playerRef.current.weapon);
    let newIdx = currentIdx + delta;
    if (newIdx < 0) newIdx = weapons.length - 1;
    if (newIdx >= weapons.length) newIdx = 0;
    playerRef.current.weapon = weapons[newIdx];
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    const offscreen = offscreenCanvasRef.current;
    if (!canvas || !offscreen) return;
    const ctx = canvas.getContext("2d");
    const offCtx = offscreen.getContext("2d");
    if (!ctx || !offCtx) return;

    let animationId: number;

    const gameLoop = (time: number) => {
      if (gameStateRef.current !== "playing") return;

      const deltaTime = Math.min(time - lastTimeRef.current, 50);
      lastTimeRef.current = time;

      // FPS calculation
      frameCountRef.current++;
      if (time - lastFPSTimeRef.current >= 1000) {
        fpsRef.current = frameCountRef.current;
        frameCountRef.current = 0;
        lastFPSTimeRef.current = time;
      }

      const player = playerRef.current;
      const level = LEVELS[currentLevelRef.current];

      let newX = player.x;
      let newY = player.y;
      let newAngle = player.angle;
      let isMoving = false;

      newAngle += mouseMovementRef.current * ROTATION_SPEED * settings.mouseSensitivity;
      mouseMovementRef.current = 0;

      const moveX = Math.cos(newAngle);
      const moveY = Math.sin(newAngle);
      const strafeX = Math.cos(newAngle - Math.PI / 2);
      const strafeY = Math.sin(newAngle - Math.PI / 2);

      if (keysRef.current.has("w") || keysRef.current.has("arrowup")) {
        const testX = newX + moveX * MOVE_SPEED;
        const testY = newY + moveY * MOVE_SPEED;
        if (!checkCollision(level.map, testX, newY)) newX = testX;
        if (!checkCollision(level.map, newX, testY)) newY = testY;
        isMoving = true;
      }
      if (keysRef.current.has("s") || keysRef.current.has("arrowdown")) {
        const testX = newX - moveX * MOVE_SPEED;
        const testY = newY - moveY * MOVE_SPEED;
        if (!checkCollision(level.map, testX, newY)) newX = testX;
        if (!checkCollision(level.map, newX, testY)) newY = testY;
        isMoving = true;
      }
      if (keysRef.current.has("a")) {
        const testX = newX + strafeX * MOVE_SPEED;
        const testY = newY + strafeY * MOVE_SPEED;
        if (!checkCollision(level.map, testX, newY)) newX = testX;
        if (!checkCollision(level.map, newX, testY)) newY = testY;
        isMoving = true;
      }
      if (keysRef.current.has("d")) {
        const testX = newX - strafeX * MOVE_SPEED;
        const testY = newY - strafeY * MOVE_SPEED;
        if (!checkCollision(level.map, testX, newY)) newX = testX;
        if (!checkCollision(level.map, newX, testY)) newY = testY;
        isMoving = true;
      }

      if (keysRef.current.has("arrowleft")) newAngle -= 0.05;
      if (keysRef.current.has("arrowright")) newAngle += 0.05;
      if (keysRef.current.has("q")) newAngle -= 0.05;

      if (player.isMeleeing) {
        player.meleeFrame += deltaTime * 0.02;
        if (player.meleeFrame > 1) {
          player.isMeleeing = false;
          player.meleeFrame = 0;
        }
      }

      playerRef.current = {
        ...player,
        x: newX,
        y: newY,
        angle: newAngle,
        bobPhase: isMoving ? player.bobPhase + deltaTime * 0.012 : 0,
        isMoving,
      };

      if (shootFlashRef.current > 0) shootFlashRef.current--;
      if (hurtFlashRef.current > 0) hurtFlashRef.current -= 0.5;

      // Check pickups
      for (const pickup of pickupsRef.current) {
        if (pickup.collected) continue;
        const dist = getDistance(pickup.x, pickup.y, newX, newY);
        if (dist < 0.8) {
          const config = PICKUP_CONFIG[pickup.type];
          pickup.collected = true;
          soundManager.playPickup(pickup.type);

          switch (pickup.type) {
            case PickupType.HEALTH:
              playerRef.current.health = Math.min(player.maxHealth, player.health + config.value);
              break;
            case PickupType.MEGAHEALTH:
              playerRef.current.health = Math.min(200, player.health + config.value);
              playerRef.current.maxHealth = Math.max(player.maxHealth, playerRef.current.health);
              break;
            case PickupType.ARMOR:
              playerRef.current.armor = Math.min(100, player.armor + config.value);
              break;
            case PickupType.AMMO_BULLETS:
              playerRef.current.ammo[AmmoType.BULLETS] += config.value;
              break;
            case PickupType.AMMO_SHELLS:
              playerRef.current.ammo[AmmoType.SHELLS] += config.value;
              break;
            case PickupType.WEAPON_SHOTGUN:
              weaponsUnlockedRef.current.add(WeaponType.SHOTGUN);
              playerRef.current.weapon = WeaponType.SHOTGUN;
              playerRef.current.ammo[AmmoType.SHELLS] += 8;
              break;
            case PickupType.WEAPON_CHAINGUN:
              weaponsUnlockedRef.current.add(WeaponType.CHAINGUN);
              playerRef.current.weapon = WeaponType.CHAINGUN;
              playerRef.current.ammo[AmmoType.BULLETS] += 40;
              break;
            case PickupType.WEAPON_CHAINSAW:
              weaponsUnlockedRef.current.add(WeaponType.CHAINSAW);
              playerRef.current.weapon = WeaponType.CHAINSAW;
              break;
          }
        }
      }

      // Check exit
      const exitDist = getDistance(level.exitX, level.exitY, newX, newY);
      const aliveEnemies = enemiesRef.current.filter((e) => e.state !== "dead").length;
      if (exitDist < 1 && aliveEnemies === 0) {
        setGameState("levelComplete");
        return;
      }

      // Update enemies AI
      const currentPlayer = playerRef.current;
      for (const enemy of enemiesRef.current) {
        if (enemy.state === "dead") {
          enemy.animFrame++;
          continue;
        }

        const dist = getDistance(enemy.x, enemy.y, currentPlayer.x, currentPlayer.y);
        const canSee = hasLineOfSight(level.map, enemy.x, enemy.y, currentPlayer.x, currentPlayer.y);

        if (enemy.state === "hurt") {
          enemy.animFrame++;
          if (enemy.animFrame > 10) {
            enemy.state = "chasing";
            enemy.animFrame = 0;
          }
          continue;
        }

        if (canSee && dist < enemy.sightRange) {
          if (dist < enemy.meleeRange && time - enemy.lastAttack > enemy.attackCooldown * 0.5) {
            enemy.state = "melee";
            enemy.lastAttack = time;
            let damage = enemy.damage * 1.5;
            if (currentPlayer.armor > 0) {
              const armorAbsorb = Math.min(currentPlayer.armor, damage * 0.5);
              playerRef.current.armor -= armorAbsorb;
              damage -= armorAbsorb;
            }
            playerRef.current.health = Math.max(0, currentPlayer.health - damage);
            hurtFlashRef.current = 10;
            soundManager.playHurt();
          } else if (!enemy.isMelee && dist < enemy.attackRange && time - enemy.lastAttack > enemy.attackCooldown) {
            enemy.state = "attacking";
            enemy.lastAttack = time;

            const angle = Math.atan2(currentPlayer.y - enemy.y, currentPlayer.x - enemy.x);
            const projectile: Projectile = {
              id: projectileIdRef.current++,
              x: enemy.x,
              y: enemy.y,
              dx: Math.cos(angle) * PROJECTILE_SPEED,
              dy: Math.sin(angle) * PROJECTILE_SPEED,
              damage: enemy.damage,
              fromEnemy: true,
              color: getProjectileColor(enemy.type),
              size: enemy.type === EnemyType.CYBERDEMON ? 0.4 : 0.25,
            };
            projectilesRef.current.push(projectile);
          } else if (dist > enemy.meleeRange * 1.2) {
            enemy.state = "chasing";
          } else {
            enemy.state = "idle";
          }
        } else {
          enemy.state = "idle";
        }

        if (enemy.state === "chasing") {
          const angle = Math.atan2(currentPlayer.y - enemy.y, currentPlayer.x - enemy.x);
          const speed = enemy.speed * (deltaTime / 16);
          const moveEnemyX = Math.cos(angle) * speed;
          const moveEnemyY = Math.sin(angle) * speed;

          if (!checkCollision(level.map, enemy.x + moveEnemyX, enemy.y + moveEnemyY, 0.4)) {
            enemy.x += moveEnemyX;
            enemy.y += moveEnemyY;
          } else if (!checkCollision(level.map, enemy.x + moveEnemyX, enemy.y, 0.4)) {
            enemy.x += moveEnemyX;
          } else if (!checkCollision(level.map, enemy.x, enemy.y + moveEnemyY, 0.4)) {
            enemy.y += moveEnemyY;
          }
        }

        enemy.animFrame = (enemy.animFrame + 1) % 120;
      }

      // Update projectiles
      projectilesRef.current = projectilesRef.current.filter((proj) => {
        proj.x += proj.dx;
        proj.y += proj.dy;

        if (checkCollision(level.map, proj.x, proj.y, 0.1)) return false;

        if (proj.fromEnemy) {
          const distToPlayer = getDistance(proj.x, proj.y, currentPlayer.x, currentPlayer.y);
          if (distToPlayer < 0.5) {
            let damage = proj.damage;
            if (currentPlayer.armor > 0) {
              const armorAbsorb = Math.min(currentPlayer.armor, damage * 0.5);
              playerRef.current.armor -= armorAbsorb;
              damage -= armorAbsorb;
            }
            playerRef.current.health = Math.max(0, playerRef.current.health - damage);
            hurtFlashRef.current = 10;
            soundManager.playHurt();
            return false;
          }
        }

        return getDistance(proj.x, proj.y, currentPlayer.x, currentPlayer.y) < 40;
      });

      if (playerRef.current.health <= 0) {
        setGameState("dead");
        return;
      }

      render(offCtx, playerRef.current, enemiesRef.current, projectilesRef.current, pickupsRef.current, shootFlashRef.current, level);
      ctx.drawImage(offscreen, 0, 0);

      const hurtAlpha = hurtFlashRef.current / 10;
      if (hurtAlpha > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 0, 0, ${hurtAlpha * 0.5})`;
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        ctx.restore();
      }

      forceUpdate((n) => n + 1);
      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [gameState, settings.mouseSensitivity]);

  function getProjectileColor(type: EnemyType): string {
    switch (type) {
      case EnemyType.IMP: return "#ff6600";
      case EnemyType.SOLDIER: return "#ffff00";
      case EnemyType.CACODEMON: return "#0066ff";
      case EnemyType.BARON: return "#00ff00";
      case EnemyType.HELLKNIGHT: return "#00ff66";
      case EnemyType.CYBERDEMON: return "#ff0000";
      default: return "#ffffff";
    }
  }

  const render = (
    ctx: CanvasRenderingContext2D,
    player: Player,
    enemies: Enemy[],
    projectiles: Projectile[],
    pickups: Pickup[],
    flash: number,
    level: Level
  ) => {
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

    // FPS counter
    if (settings.showFPS) {
      ctx.fillStyle = "#0f0";
      ctx.font = "14px monospace";
      ctx.fillText(`FPS: ${fpsRef.current}`, 10, 20);
    }
  };

  const renderProjectile = (
    ctx: CanvasRenderingContext2D,
    player: Player,
    proj: Projectile,
    dist: number,
    zBuffer: number[]
  ) => {
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
  };

  const renderPickup = (
    ctx: CanvasRenderingContext2D,
    player: Player,
    pickup: Pickup,
    dist: number,
    zBuffer: number[]
  ) => {
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
  };

  const renderEnemy = (
    ctx: CanvasRenderingContext2D,
    player: Player,
    enemy: Enemy,
    dist: number,
    zBuffer: number[]
  ) => {
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

  // All enemy drawing functions remain the same
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

  const drawWeapon = (ctx: CanvasRenderingContext2D, player: Player, flash: number) => {
    const bob = player.isMoving ? Math.sin(player.bobPhase) * 10 : 0;
    const weaponX = SCREEN_WIDTH / 2;
    const weaponY = SCREEN_HEIGHT - 150 + bob;
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

  const drawHUD = (ctx: CanvasRenderingContext2D, player: Player, enemies: Enemy[], level: Level) => {
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
      const hasWeapon = weaponsUnlockedRef.current.has(w);
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

    pickupsRef.current.forEach((pickup) => {
      if (!pickup.collected) {
        ctx.fillStyle = PICKUP_CONFIG[pickup.type].color;
        ctx.beginPath();
        ctx.rect(mapX + pickup.x * cellWidth - 1, mapY + pickup.y * cellHeight - 1, 3, 3);
        ctx.fill();
      }
    });
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current.add(key);

      if ((key === " " || key === "f") && gameStateRef.current === "playing") {
        e.preventDefault();
        attack();
      }

      // R to restart current level
      if (key === "r") {
        if (gameStateRef.current === "dead") {
          restartCurrentLevel();
        } else if (gameStateRef.current === "playing") {
          restartCurrentLevel();
        }
      }

      // E to proceed to next level (when level complete)
      if (key === "e" && gameStateRef.current === "levelComplete") {
        nextLevel();
      }

      // ESC to pause/return to menu
      if (key === "escape") {
        if (gameStateRef.current === "playing") {
          setGameState("paused");
        } else if (gameStateRef.current === "paused") {
          setGameState("playing");
        } else if (gameStateRef.current === "settings" || gameStateRef.current === "levelSelect") {
          setGameState("mainMenu");
        }
      }

      if (key === "enter") {
        if (gameStateRef.current === "dead") {
          restartCurrentLevel();
        } else if (gameStateRef.current === "levelComplete") {
          nextLevel();
        }
      }

      if (key >= "1" && key <= "5" && gameStateRef.current === "playing") {
        const weaponIndex = Number.parseInt(key) - 1;
        const weapons = [WeaponType.FIST, WeaponType.CHAINSAW, WeaponType.PISTOL, WeaponType.SHOTGUN, WeaponType.CHAINGUN];
        if (weaponsUnlockedRef.current.has(weapons[weaponIndex])) {
          playerRef.current.weapon = weapons[weaponIndex];
        }
      }

      if (key === "[" || key === "-") switchWeapon(-1);
      if (key === "]" || key === "=") switchWeapon(1);

      if (key === "t") {
        const testLevelIndex = LEVELS.length - 1;
        startGame(testLevelIndex);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [attack, restartCurrentLevel, nextLevel, switchWeapon, startGame]);

  // Mouse controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = () => {
      if (gameStateRef.current === "playing") {
        canvas.requestPointerLock();
        attack();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === canvas) {
        mouseMovementRef.current += e.movementX;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (gameStateRef.current === "playing") {
        e.preventDefault();
        switchWeapon(e.deltaY > 0 ? 1 : -1);
      }
    };

    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("wheel", handleWheel);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [attack, switchWeapon]);

  const player = playerRef.current;

  // Menu button component
  const MenuButton = ({ onClick, children, variant = "primary" }: { onClick: () => void; children: React.ReactNode; variant?: "primary" | "secondary" | "danger" }) => {
    const baseClasses = "w-full px-6 py-3 text-lg font-bold rounded transition-all duration-200 transform hover:scale-105 active:scale-95";
    const variantClasses = {
      primary: "bg-red-700 hover:bg-red-600 text-white border-2 border-red-500",
      secondary: "bg-gray-700 hover:bg-gray-600 text-white border-2 border-gray-500",
      danger: "bg-yellow-600 hover:bg-yellow-500 text-black border-2 border-yellow-400",
    };
    return (
      <button type="button" onClick={onClick} className={`${baseClasses} ${variantClasses[variant]}`}>
        {children}
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          className="border-4 border-red-900 rounded-lg cursor-none"
        />

        {/* Main Menu */}
        {gameState === "mainMenu" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black via-red-950/80 to-black">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fillRule=\"evenodd\"%3E%3Cg fill=\"%23ff0000\" fillOpacity=\"0.1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />

            <div className="relative z-10 flex flex-col items-center">
              <h1 className="text-7xl font-black text-red-600 mb-2 tracking-widest drop-shadow-lg" style={{ fontFamily: "Impact, sans-serif", textShadow: "0 0 30px rgba(255,0,0,0.5)" }}>
                INFERNO
              </h1>
              <p className="text-red-400 text-xl mb-12 tracking-wider">DESCENT INTO DARKNESS</p>

              <div className="flex flex-col gap-4 w-64">
                <MenuButton onClick={() => startGame(0)}>
                  NEW GAME
                </MenuButton>
                <MenuButton onClick={() => setGameState("levelSelect")} variant="secondary">
                  SELECT LEVEL
                </MenuButton>
                <MenuButton onClick={() => setGameState("settings")} variant="secondary">
                  OPTIONS
                </MenuButton>
              </div>

              <div className="mt-10 text-gray-500 text-center">
                <p className="text-yellow-500 font-bold mb-2">CONTROLS</p>
                <p className="text-sm">WASD - Move | Mouse - Look | Click - Shoot</p>
                <p className="text-sm">1-5 - Weapons | R - Restart | ESC - Pause</p>
              </div>
            </div>
          </div>
        )}

        {/* Level Select */}
        {gameState === "levelSelect" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black p-8">
            <h2 className="text-4xl font-bold text-red-500 mb-8" style={{ fontFamily: "Impact, sans-serif" }}>
              SELECT LEVEL
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {LEVELS.map((level, index) => {
                const isUnlocked = savedProgress.unlockedLevels.has(index);
                return (
                  <button
                    key={level.name}
                    type="button"
                    onClick={() => isUnlocked && startGame(index)}
                    disabled={!isUnlocked}
                    className={`w-48 h-32 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center ${isUnlocked
                      ? "bg-gray-800 border-red-600 hover:bg-gray-700 hover:border-red-400 cursor-pointer transform hover:scale-105"
                      : "bg-gray-900 border-gray-700 cursor-not-allowed opacity-50"
                      }`}
                  >
                    <span className="text-3xl font-bold text-red-500 mb-1">{index + 1}</span>
                    <span className="text-white text-sm font-bold">{level.name.split(":")[1]?.trim() || level.name}</span>
                    {!isUnlocked && <span className="text-gray-500 text-xs mt-1">LOCKED</span>}
                  </button>
                );
              })}
            </div>

            <MenuButton onClick={() => setGameState("mainMenu")} variant="secondary">
              BACK
            </MenuButton>
          </div>
        )}

        {/* Settings */}
        {gameState === "settings" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black p-8">
            <h2 className="text-4xl font-bold text-red-500 mb-8" style={{ fontFamily: "Impact, sans-serif" }}>
              OPTIONS
            </h2>

            <div className="w-96 space-y-6 mb-8">
              {/* Mouse Sensitivity */}
              <div className="flex flex-col gap-2">
                <label className="text-white font-bold">Mouse Sensitivity</label>
                <input
                  type="range"
                  min="0.2"
                  max="3"
                  step="0.1"
                  value={settings.mouseSensitivity}
                  onChange={(e) => setSettings({ ...settings, mouseSensitivity: parseFloat(e.target.value) })}
                  className="w-full accent-red-600"
                />
                <span className="text-gray-400 text-sm">{settings.mouseSensitivity.toFixed(1)}x</span>
              </div>

              {/* Difficulty */}
              <div className="flex flex-col gap-2">
                <label className="text-white font-bold">Difficulty</label>
                <div className="flex gap-2">
                  {(["easy", "normal", "hard"] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSettings({ ...settings, difficulty: diff })}
                      className={`flex-1 py-2 rounded font-bold transition-colors ${settings.difficulty === diff
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                    >
                      {diff.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Crosshair Style */}
              <div className="flex flex-col gap-2">
                <label className="text-white font-bold">Crosshair Style</label>
                <div className="flex gap-2">
                  {(["cross", "dot", "circle"] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setSettings({ ...settings, crosshairStyle: style })}
                      className={`flex-1 py-2 rounded font-bold transition-colors ${settings.crosshairStyle === style
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                    >
                      {style.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show FPS */}
              <div className="flex items-center justify-between">
                <label className="text-white font-bold">Show FPS</label>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, showFPS: !settings.showFPS })}
                  className={`w-16 h-8 rounded-full transition-colors ${settings.showFPS ? "bg-red-600" : "bg-gray-600"
                    }`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full transition-transform ${settings.showFPS ? "translate-x-9" : "translate-x-1"
                    }`} />
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-700 pt-4">
                <p className="text-yellow-500 font-bold mb-4">CHEATS</p>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={unlockAllLevels}
                    className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded transition-colors"
                  >
                    UNLOCK LEVELS
                  </button>
                  <button
                    type="button"
                    onClick={unlockAllWeapons}
                    className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded transition-colors"
                  >
                    UNLOCK WEAPONS
                  </button>
                </div>
              </div>
            </div>

            <MenuButton onClick={() => setGameState("mainMenu")} variant="secondary">
              BACK
            </MenuButton>
          </div>
        )}

        {/* Paused */}
        {gameState === "paused" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <h2 className="text-5xl font-bold text-yellow-500 mb-8" style={{ fontFamily: "Impact, sans-serif" }}>
              PAUSED
            </h2>
            <div className="flex flex-col gap-4 w-64">
              <MenuButton onClick={() => setGameState("playing")}>
                RESUME
              </MenuButton>
              <MenuButton onClick={restartCurrentLevel} variant="secondary">
                RESTART LEVEL
              </MenuButton>
              <MenuButton onClick={() => setGameState("mainMenu")} variant="danger">
                MAIN MENU
              </MenuButton>
            </div>
            <p className="mt-6 text-gray-500">Press ESC to resume</p>
          </div>
        )}

        {/* Dead */}
        {gameState === "dead" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80">
            <h1 className="text-6xl font-bold text-black mb-4" style={{ fontFamily: "Impact, sans-serif" }}>
              YOU DIED
            </h1>
            <p className="text-red-200 text-xl mb-2">Level: {LEVELS[currentLevel]?.name}</p>
            <p className="text-red-200 text-xl mb-6">Kills this level: {killsRef.current}</p>
            <div className="flex flex-col gap-4 w-64">
              <MenuButton onClick={restartCurrentLevel}>
                RESTART LEVEL (R)
              </MenuButton>
              <MenuButton onClick={() => setGameState("mainMenu")} variant="secondary">
                MAIN MENU
              </MenuButton>
            </div>
            <p className="mt-4 text-red-300 text-sm">Your weapons from previous levels are preserved</p>
          </div>
        )}

        {/* Level Complete */}
        {gameState === "levelComplete" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-900/80">
            <h1 className="text-5xl font-bold text-yellow-400 mb-4" style={{ fontFamily: "Impact, sans-serif" }}>
              LEVEL COMPLETE!
            </h1>
            <p className="text-blue-200 text-xl mb-2">{LEVELS[currentLevel].name}</p>
            <p className="text-green-400 text-lg mb-6">Kills: {killsRef.current} | Health: {Math.ceil(player.health)}%</p>
            <div className="flex flex-col gap-4 w-64">
              <MenuButton onClick={nextLevel}>
                {currentLevel < LEVELS.length - 1 ? "NEXT LEVEL (E)" : "FINAL VICTORY"}
              </MenuButton>
              <MenuButton onClick={() => setGameState("mainMenu")} variant="secondary">
                MAIN MENU
              </MenuButton>
            </div>
          </div>
        )}

        {/* Victory */}
        {gameState === "victory" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-green-900/80 to-black/90">
            <h1 className="text-6xl font-bold text-yellow-400 mb-4" style={{ fontFamily: "Impact, sans-serif" }}>
              VICTORY!
            </h1>
            <p className="text-green-200 text-xl mb-2">All levels completed!</p>
            <p className="text-green-300 text-lg mb-2">Total Kills: {totalKillsRef.current + killsRef.current}</p>
            <p className="text-green-300 text-lg mb-8">Final Health: {Math.ceil(player.health)}%</p>
            <div className="flex flex-col gap-4 w-64">
              <MenuButton onClick={() => startGame(0)}>
                PLAY AGAIN
              </MenuButton>
              <MenuButton onClick={() => setGameState("mainMenu")} variant="secondary">
                MAIN MENU
              </MenuButton>
            </div>
          </div>
        )}
      </div>

      <p className="text-gray-600 text-sm mt-4">
        Click to capture mouse | Press ESC to pause
      </p>
    </div>
  );
}

function shadeColor(color: string, factor: number): string {
  const hex = color.replace("#", "");
  const r = Math.min(255, Math.max(0, Math.floor(Number.parseInt(hex.slice(0, 2), 16) * factor)));
  const g = Math.min(255, Math.max(0, Math.floor(Number.parseInt(hex.slice(2, 4), 16) * factor)));
  const b = Math.min(255, Math.max(0, Math.floor(Number.parseInt(hex.slice(4, 6), 16) * factor)));
  return `rgb(${r}, ${g}, ${b})`;
}
