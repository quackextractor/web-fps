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
  findPath,
  hasClearWalkingPath,
} from "@/lib/fps-engine";
import { soundManager } from "@/lib/sound-manager";
import { updateEnemyAI, SpatialGrid } from "@/lib/enemy-ai";
import { GAME_CONFIG } from "@/lib/game-config";
import { renderEnemy, renderProjectile, renderPickup, drawWeapon, drawHUD, renderDebugView, shadeColor } from "@/lib/canvas-renderer";
import { SettingsMenu } from "./settings-menu";
import { useSettings } from "@/hooks/use-settings";
import { usePointerLock } from "@/hooks/use-pointer-lock";

const FOV = GAME_CONFIG.RENDERING.FOV;
const TICK_RATE = GAME_CONFIG.PHYSICS.TICK_RATE;

type GameState = "mainMenu" | "levelSelect" | "settings" | "playing" | "paused" | "dead" | "victory" | "levelComplete";

interface SavedProgress {
  unlockedLevels: Set<number>;
  unlockedWeapons: Set<WeaponType>;
  highestLevel: number;
}

export default function DoomGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<GameState>("mainMenu");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [previousGameState, setPreviousGameState] = useState<GameState>("mainMenu");

  const previousGameStateRef = useRef<GameState>("mainMenu");
  const { settings, setSettings, updateSetting, isLoaded, resetSettings } = useSettings();

  // Sync ref with state for event listeners
  useEffect(() => {
    previousGameStateRef.current = previousGameState;
  }, [previousGameState]);

  // Fix for stale closure in game loop
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

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
  const spatialGridRef = useRef<SpatialGrid>(new SpatialGrid());
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
  const mouseDownRef = useRef(false);
  const mouseMovementRef = useRef(0);
  const lastTimeRef = useRef(0);
  const accumulatorRef = useRef(0);
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    if (isLoaded) {
      soundManager.setEnabled(settings.soundEnabled);
      soundManager.setVolume(settings.volume);
    }
  }, [settings.soundEnabled, settings.volume, isLoaded]);

  useEffect(() => {
    offscreenCanvasRef.current = document.createElement('canvas');
    // Dimensions will be set by resolution effect
  }, []);

  const screenWidthRef = useRef(800);
  const screenHeightRef = useRef(600);
  const numRaysRef = useRef(200);

  // Mouse controls hook - moved up so it can be used in callbacks
  const { lock, unlock, isLocked } = usePointerLock(canvasRef as React.RefObject<HTMLElement>, gameState === "playing");

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
      x: e.x + 0.5, // Center in tile
      y: e.y + 0.5, // Center in tile
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
    lock(true);
  }, [loadLevel, lock]);

  const startGame = useCallback((levelIndex: number) => {
    setCurrentLevel(levelIndex);
    loadLevel(levelIndex, false);
    setGameState("playing");
    lock(true);
  }, [loadLevel, lock]);

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

    const fixedUpdate = (dt: number) => {
      const player = playerRef.current;
      const level = LEVELS[currentLevelRef.current];

      let newX = player.x;
      let newY = player.y;
      let newAngle = player.angle;
      let isMoving = false;

      // Update spatial grid for this tick
      spatialGridRef.current.update(enemiesRef.current);

      if (mouseMovementRef.current !== 0) {
        newAngle += mouseMovementRef.current * GAME_CONFIG.MOVEMENT.ROTATION_SPEED * settingsRef.current.mouseSensitivity;
        mouseMovementRef.current = 0;
      }

      const moveX = Math.cos(newAngle);
      const moveY = Math.sin(newAngle);
      const strafeX = Math.cos(newAngle - Math.PI / 2);
      const strafeY = Math.sin(newAngle - Math.PI / 2);

      const speed = GAME_CONFIG.MOVEMENT.PLAYER_SPEED;

      if (keysRef.current.has("w") || keysRef.current.has("arrowup")) {
        const testX = newX + moveX * speed;
        const testY = newY + moveY * speed;
        if (!checkCollision(level.map, testX, newY)) newX = testX;
        if (!checkCollision(level.map, newX, testY)) newY = testY;
        isMoving = true;
      }
      if (keysRef.current.has("s") || keysRef.current.has("arrowdown")) {
        const testX = newX - moveX * speed;
        const testY = newY - moveY * speed;
        if (!checkCollision(level.map, testX, newY)) newX = testX;
        if (!checkCollision(level.map, newX, testY)) newY = testY;
        isMoving = true;
      }
      if (keysRef.current.has("a")) {
        const testX = newX + strafeX * speed;
        const testY = newY + strafeY * speed;
        if (!checkCollision(level.map, testX, newY)) newX = testX;
        if (!checkCollision(level.map, newX, testY)) newY = testY;
        isMoving = true;
      }
      if (keysRef.current.has("d")) {
        const testX = newX - strafeX * speed;
        const testY = newY - strafeY * speed;
        if (!checkCollision(level.map, testX, newY)) newX = testX;
        if (!checkCollision(level.map, newX, testY)) newY = testY;
        isMoving = true;
      }

      if (keysRef.current.has("arrowleft")) newAngle -= 0.05 * settingsRef.current.turnSpeed;
      if (keysRef.current.has("arrowright")) newAngle += 0.05 * settingsRef.current.turnSpeed;
      if (keysRef.current.has("q")) newAngle -= 0.05 * settingsRef.current.turnSpeed;

      if (keysRef.current.has(" ") || keysRef.current.has("f") || mouseDownRef.current) {
        attack();
      }

      if (player.isMeleeing) {
        player.meleeFrame += dt * 0.02;
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
        bobPhase: isMoving ? player.bobPhase + dt * GAME_CONFIG.MOVEMENT.BOB_SPEED : 0,
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

        // Update Spatial Grid once per frame/tick
        // Optimization: Updating grid inside the loop is bad?
        // We should update it BEFORE the loop.
        // But fixedUpdate might run multiple times.
        // Let's update it at start of fixedUpdate? 
        // Or here?
        // Let's do it at start of fixedUpdate actually.

        const now = performance.now();

        const result = updateEnemyAI(
          enemy,
          currentPlayer,
          level.map,
          spatialGridRef.current, // Use grid
          dt,
          now,
          projectileIdRef.current
        );

        if (result.spawnProjectile) {
          projectileIdRef.current++;
          projectilesRef.current.push(result.spawnProjectile);
          // No sound trigger in result? We can add it if we want.
        }

        if (result.damagePlayer) {
          let damage = result.damagePlayer;
          if (currentPlayer.armor > 0) {
            const armorAbsorb = Math.min(currentPlayer.armor, damage * 0.5);
            playerRef.current.armor -= armorAbsorb;
            damage -= armorAbsorb;
          }
          playerRef.current.health = Math.max(0, currentPlayer.health - damage);
          hurtFlashRef.current = 10;
          soundManager.playHurt();
        }

        enemy.animFrame = (enemy.animFrame + 1) % 120;
      }

      // Update projectiles
      projectilesRef.current = projectilesRef.current.filter((proj) => {
        proj.x += proj.dx; // Projectile speed is per-tick currently? No, previously per frame? 
        // Wait, previously: proj.x += proj.dx;
        // proj.dx was calculated as: Math.cos(angle) * PROJECTILE_SPEED
        // PROJECTILE_SPEED = 0.18
        // This was running once per frame. 
        // Now it runs once per tick (16ms).
        // If previous frame rate was 60fps, it's consistent.
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
    };

    const gameLoop = (time: number) => {
      if (gameStateRef.current !== "playing") return;

      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Cap deltaTime to prevent spiral of death if tab is backgrounded
      const cappedDeltaTime = Math.min(deltaTime, 100);

      // FPS calculation
      frameCountRef.current++;
      if (time - lastFPSTimeRef.current >= 1000) {
        fpsRef.current = frameCountRef.current;
        frameCountRef.current = 0;
        lastFPSTimeRef.current = time;
      }

      accumulatorRef.current += cappedDeltaTime * settingsRef.current.timeScale;

      while (accumulatorRef.current >= TICK_RATE) {
        fixedUpdate(TICK_RATE);
        accumulatorRef.current -= TICK_RATE;
      }

      const canvas = canvasRef.current;
      const offscreen = offscreenCanvasRef.current;
      const ctx = canvas?.getContext("2d");
      const offCtx = offscreen?.getContext("2d");

      if (ctx && offCtx && canvas && offscreen) {
        const player = playerRef.current;
        const level = LEVELS[currentLevelRef.current];
        render(offCtx, player, enemiesRef.current, projectilesRef.current, pickupsRef.current, shootFlashRef.current, level);
        ctx.drawImage(offscreen, 0, 0);

        const hurtAlpha = hurtFlashRef.current / 10;
        if (hurtAlpha > 0) {
          ctx.save();
          ctx.fillStyle = `rgba(255, 0, 0, ${hurtAlpha * 0.5})`;
          ctx.fillRect(0, 0, screenWidthRef.current, screenHeightRef.current);
          ctx.restore();
        }
      }

      forceUpdate((n) => n + 1);
      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [gameState, settings.mouseSensitivity, settings.timeScale, settings.debugMode]);

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
    const SCREEN_WIDTH = screenWidthRef.current;
    const SCREEN_HEIGHT = screenHeightRef.current;
    const NUM_RAYS = numRaysRef.current;

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
        renderEnemy(ctx, player, sprite.data as Enemy, sprite.dist, zBuffer, screenWidthRef.current, screenHeightRef.current, numRaysRef.current, FOV);
      } else if (sprite.type === 'projectile') {
        renderProjectile(ctx, player, sprite.data as Projectile, sprite.dist, zBuffer, screenWidthRef.current, screenHeightRef.current, numRaysRef.current, FOV);
      } else {
        renderPickup(ctx, player, sprite.data as Pickup, sprite.dist, zBuffer, screenWidthRef.current, screenHeightRef.current, numRaysRef.current, FOV);
      }
    }

    if (flash > 0) {
      ctx.fillStyle = `rgba(255, 200, 100, ${flash / 20})`;
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }

    drawWeapon(ctx, player, flash, screenWidthRef.current, screenHeightRef.current, weaponsUnlockedRef.current);
    drawHUD(ctx, player, enemiesRef.current, LEVELS[currentLevel], pickupsRef.current, weaponsUnlockedRef.current, settingsRef.current, screenWidthRef.current, screenHeightRef.current);

    if (settingsRef.current.debugMode) {
      renderDebugView(ctx, LEVELS[currentLevel], player, enemiesRef.current, screenWidthRef.current, screenHeightRef.current);
    }

    // FPS counter
    if (settings.showFPS) {
      ctx.fillStyle = "#0f0";
      ctx.font = "14px monospace";
      ctx.fillText(`FPS: ${fpsRef.current}`, 10, 20);
    }
  };











  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current.add(key);

      if ((key === " " || key === "f" || key.startsWith("arrow")) && gameStateRef.current === "playing") {
        e.preventDefault();
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
        } else if (gameStateRef.current === "settings") {
          setGameState(previousGameStateRef.current);
        } else if (gameStateRef.current === "levelSelect") {
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

      if (key === "p") {
        updateSetting("debugMode", !settings.debugMode);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [attack, restartCurrentLevel, nextLevel, switchWeapon, startGame, settings, updateSetting]);

  // Mouse controls
  // const { lock, unlock, isLocked } = usePointerLock(canvasRef as React.RefObject<HTMLElement>, gameState === "playing");
  // Hook moved to top of component

  // Re-lock on click if we are supposed to be playing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left click
        mouseDownRef.current = true;
        if (gameStateRef.current === "playing" && !isLocked) {
          lock();
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        mouseDownRef.current = false;
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

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("wheel", handleWheel);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [switchWeapon, lock, isLocked]);

  // Handle Resolution
  useEffect(() => {
    const canvas = offscreenCanvasRef.current;
    const visibleCanvas = canvasRef.current;
    if (canvas && visibleCanvas) {
      const [w, h] = settings.resolution.split("x").map(Number);
      canvas.width = w;
      canvas.height = h;
      visibleCanvas.width = w;
      visibleCanvas.height = h;
      screenWidthRef.current = w;
      screenHeightRef.current = h;
      numRaysRef.current = Math.floor(w / 4); // maintain aspect of "rays"
    }
  }, [settings.resolution]);

  // Handle Fullscreen
  useEffect(() => {
    if (settings.fullscreen) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn(`Error attempting to enable fullscreen: ${err.message}`);
          updateSetting("fullscreen", false);
        });
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.warn(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  }, [settings.fullscreen, updateSetting]);

  // Handle Savegame Persistence
  useEffect(() => {
    const saved = localStorage.getItem("doom-savegame");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedProgress({
          unlockedLevels: new Set(parsed.unlockedLevels),
          unlockedWeapons: new Set(parsed.unlockedWeapons),
          highestLevel: parsed.highestLevel
        });
        weaponsUnlockedRef.current = new Set(parsed.unlockedWeapons);
      } catch (e) {
        console.error("Failed to load savegame", e);
      }
    }
  }, []);

  useEffect(() => {
    const toSave = {
      unlockedLevels: Array.from(savedProgress.unlockedLevels),
      unlockedWeapons: Array.from(savedProgress.unlockedWeapons),
      highestLevel: savedProgress.highestLevel
    };
    localStorage.setItem("doom-savegame", JSON.stringify(toSave));
  }, [savedProgress]);


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
    <div className="flex flex-col items-center justify-center bg-black w-screen h-screen overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center aspect-video">
        <canvas
          ref={canvasRef}
          className="border-4 border-red-900 rounded-lg cursor-none w-full h-full object-contain"
          style={{ imageRendering: "pixelated" }}
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
                <MenuButton onClick={() => {
                  setPreviousGameState("mainMenu");
                  setGameState("settings");
                }} variant="secondary">
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
          <SettingsMenu
            onBack={() => setGameState(previousGameState)}
            settings={settings}
            setSettings={setSettings}
            unlockAllLevels={unlockAllLevels}
            unlockAllWeapons={unlockAllWeapons}
            resetSettings={resetSettings}
          />
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
              <MenuButton onClick={() => {
                setPreviousGameState("paused");
                setGameState("settings");
              }} variant="secondary">
                OPTIONS
              </MenuButton>
              <MenuButton onClick={restartCurrentLevel} variant="secondary">
                RESTART LEVEL
              </MenuButton>
              <MenuButton onClick={() => setGameState("mainMenu")} variant="danger">
                EXIT TO MAIN MENU
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


