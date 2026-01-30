"use client";

import React from "react"

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type Player,
  type Enemy,
  type Projectile,
  type Pickup,
  EnemyType,
  WeaponType,
  AmmoType,
  PickupType,
  ENEMY_CONFIG,
  WEAPON_CONFIG,
  PICKUP_CONFIG,
  LEVELS,
  castRay,
  checkCollision,
  hasLineOfSight,
  getDistance,
  normalizeAngle,
} from "@/lib/fps-engine";
import { soundManager } from "@/lib/sound-manager";
import { updateEnemyAI } from "@/lib/enemy-ai";
import { RagdollManager } from "@/lib/Ragdoll";
import { SettingsMenu } from "./settings-menu";
import { useSettings } from "@/hooks/use-settings";
import { usePointerLock } from "@/hooks/use-pointer-lock";
import { GameRenderer, type RenderState } from "@/engine/graphics/GameRenderer";
import { MainMenu } from "./game-ui/MainMenu";
import { LevelSelect, type SavedProgress } from "./game-ui/LevelSelect";
import { PauseMenu } from "./game-ui/PauseMenu";
import { DeathScreen } from "./game-ui/DeathScreen";
import { LevelCompleteScreen } from "./game-ui/LevelCompleteScreen";
import { VictoryScreen } from "./game-ui/VictoryScreen";
import { HUD } from "./game-ui/HUD";
import { EffectsLayer } from "./game-ui/EffectsLayer";
import { Crosshair } from "./game-ui/Crosshair";

const MOVE_SPEED = 0.08;
const ROTATION_SPEED = 0.003;
const TICK_RATE = 1000 / 60;

type GameState = "mainMenu" | "levelSelect" | "settings" | "playing" | "paused" | "dead" | "victory" | "levelComplete";

export default function FPSGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<GameState>("mainMenu");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [previousGameState, setPreviousGameState] = useState<GameState>("mainMenu");

  const previousGameStateRef = useRef<GameState>("mainMenu");
  const { settings, setSettings, updateSetting, isLoaded, resetSettings } = useSettings();

  const rendererRef = useRef<GameRenderer | null>(null);

  // Sync ref with state for event listeners
  useEffect(() => {
    previousGameStateRef.current = previousGameState;
  }, [previousGameState]);

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
  const ragdollManagerRef = useRef(new RagdollManager());

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

    // Initialize renderer
    rendererRef.current = new GameRenderer(800, 600, 200);
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

    if (rendererRef.current) {
      rendererRef.current.loadLevelTextures(level);
    }
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
      lock(true);
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

  const clearProgress = useCallback(() => {
    const initialWeapons = new Set([WeaponType.FIST, WeaponType.PISTOL]);
    setSavedProgress({
      unlockedLevels: new Set([0]),
      unlockedWeapons: initialWeapons,
      highestLevel: 0,
    });
    weaponsUnlockedRef.current = initialWeapons;
    // Reset internal refs for consistency if currently playing/in-between
    previousLevelWeaponsRef.current = new Set(initialWeapons);
    previousLevelAmmoRef.current = { [AmmoType.BULLETS]: 50, [AmmoType.SHELLS]: 0 };
    totalKillsRef.current = 0;
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
              ragdollManagerRef.current.spawnRagdoll(enemy, player.x, player.y);
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
            ragdollManagerRef.current.spawnRagdoll(enemy, player.x, player.y);
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

      if (mouseMovementRef.current !== 0) {
        newAngle += mouseMovementRef.current * ROTATION_SPEED * settings.mouseSensitivity;
        mouseMovementRef.current = 0;
      }

      const moveX = Math.cos(newAngle);
      const moveY = Math.sin(newAngle);
      const strafeX = Math.cos(newAngle - Math.PI / 2);
      const strafeY = Math.sin(newAngle - Math.PI / 2);

      let moveForward = 0;
      let moveStrafe = 0;

      if (keysRef.current.has("w") || keysRef.current.has("arrowup")) moveForward += 1;
      if (keysRef.current.has("s") || keysRef.current.has("arrowdown")) moveForward -= 1;
      if (keysRef.current.has("a")) moveStrafe += 1;
      if (keysRef.current.has("d")) moveStrafe -= 1;

      if (moveForward !== 0 || moveStrafe !== 0) {
        // Normalize vector
        const length = Math.sqrt(moveForward * moveForward + moveStrafe * moveStrafe);
        moveForward /= length;
        moveStrafe /= length;

        // Calculate deltas
        // moveX/moveY is direction vector for forward
        // strafeX/strafeY is direction vector for strafe (left)
        // newX += (forward * moveX + strafe * strafeX) * speed
        // newY += (forward * moveY + strafe * strafeY) * speed

        const deltaX = (moveForward * moveX + moveStrafe * strafeX) * MOVE_SPEED;
        const deltaY = (moveForward * moveY + moveStrafe * strafeY) * MOVE_SPEED;

        // Apply collision
        const testX = newX + deltaX;
        const testY = newY + deltaY;

        // Try move X then Y (sliding)
        if (!checkCollision(level.map, testX, newY)) newX = testX;
        if (!checkCollision(level.map, newX, testY)) newY = testY;
        isMoving = true;
      }

      if (keysRef.current.has("arrowleft")) newAngle -= 0.05 * settings.turnSpeed;
      if (keysRef.current.has("arrowright")) newAngle += 0.05 * settings.turnSpeed;
      if (keysRef.current.has("q")) newAngle -= 0.05 * settings.turnSpeed;
      if (keysRef.current.has("e")) newAngle += 0.05 * settings.turnSpeed;

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
        bobPhase: isMoving ? player.bobPhase + dt * 0.012 : 0,
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

        const now = performance.now();

        const result = updateEnemyAI(
          enemy,
          currentPlayer,
          level.map,
          enemiesRef.current,
          dt, // ensure dt is available, yes fixedUpdate(dt)
          now,
          projectileIdRef.current
        );

        if (result.spawnProjectile) {
          projectileIdRef.current++;
          projectilesRef.current.push(result.spawnProjectile);
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

      // Update ragdoll physics
      ragdollManagerRef.current.update(dt);
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

      accumulatorRef.current += cappedDeltaTime * settings.timeScale;

      while (accumulatorRef.current >= TICK_RATE) {
        fixedUpdate(TICK_RATE);
        accumulatorRef.current -= TICK_RATE;
      }

      const canvas = canvasRef.current;
      const offscreen = offscreenCanvasRef.current;
      const ctx = canvas?.getContext("2d");
      const offCtx = offscreen?.getContext("2d");

      if (ctx && offCtx && canvas && offscreen && rendererRef.current) {
        const player = playerRef.current;
        const level = LEVELS[currentLevelRef.current];

        const renderState: RenderState = {
          player,
          enemies: enemiesRef.current,
          projectiles: projectilesRef.current,
          pickups: pickupsRef.current,
          ragdollParts: ragdollManagerRef.current.getParts(),
          level,
          shootFlash: shootFlashRef.current,
          hurtFlash: hurtFlashRef.current,
          weaponsUnlocked: weaponsUnlockedRef.current,
          settings: {
            debugMode: settings.debugMode,
            showFPS: settings.showFPS,
            crosshairStyle: settings.crosshairStyle,
            imageSmoothingEnabled: settings.imageSmoothingEnabled,
          },
          fps: fpsRef.current
        };

        rendererRef.current.render(offCtx, renderState);
        ctx.drawImage(offscreen, 0, 0);
      }

      forceUpdate((n) => n + 1);
      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [gameState, settings.mouseSensitivity, settings.timeScale, settings.debugMode]);


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

      // Space to proceed to next level (when level complete)
      if (key === " " && gameStateRef.current === "levelComplete") {
        nextLevel();
      }

      // ESC to pause/return to menu
      if (key === "escape" || key === "control") {
        if (gameStateRef.current === "playing") {
          setGameState("paused");
        } else if (gameStateRef.current === "paused") {
          setGameState("playing");
          lock(true);
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
    };
  }, [attack, restartCurrentLevel, nextLevel, switchWeapon, startGame, settings, updateSetting]);

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

      // Update renderer dimensions
      if (rendererRef.current) {
        rendererRef.current.updateDimensions(w, h, Math.floor(w / 4));
      }
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
    const saved = localStorage.getItem("fps-savegame");
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
    localStorage.setItem("fps-savegame", JSON.stringify(toSave));
  }, [savedProgress]);


  const player = playerRef.current;

  return (
    <div className="flex flex-col items-center justify-center bg-black w-screen h-screen overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center aspect-video">
        <canvas
          ref={canvasRef}
          className="border-4 border-red-900 rounded-lg cursor-none w-full h-full object-contain"
          style={{ imageRendering: "pixelated" }}
        />

        {/* Retro Effects Layer */}
        <EffectsLayer hurtFlash={hurtFlashRef.current} />

        {/* HUD Overlay */}
        {gameState === "playing" && (
          <>
            <Crosshair />
            <HUD
              health={player.health}
              armor={player.armor}
              ammo={player.ammo}
              weapon={player.weapon}
              kills={killsRef.current}
              totalKills={totalKillsRef.current}
              levelName={LEVELS[currentLevel]?.name || "Unknown"}
              weaponsUnlocked={weaponsUnlockedRef.current}
            />
          </>
        )}

        {/* Main Menu */}
        {gameState === "mainMenu" && (
          <MainMenu
            onStartGame={startGame}
            onSelectLevel={() => setGameState("levelSelect")}
            onOptions={() => {
              setPreviousGameState("mainMenu");
              setGameState("settings");
            }}
          />
        )}

        {/* Level Select */}
        {gameState === "levelSelect" && (
          <LevelSelect
            levels={LEVELS}
            savedProgress={savedProgress}
            onStartGame={startGame}
            onBack={() => setGameState("mainMenu")}
          />
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
            clearProgress={clearProgress}
          />
        )}

        {/* Paused */}
        {gameState === "paused" && (
          <PauseMenu
            onResume={() => setGameState("playing")}
            onOptions={() => {
              setPreviousGameState("paused");
              setGameState("settings");
            }}
            onRestart={restartCurrentLevel}
            onExit={() => setGameState("mainMenu")}
          />
        )}

        {/* Dead */}
        {gameState === "dead" && (
          <DeathScreen
            levelName={LEVELS[currentLevel]?.name}
            kills={killsRef.current}
            onRestart={restartCurrentLevel}
            onMainMenu={() => setGameState("mainMenu")}
          />
        )}

        {/* Level Complete */}
        {gameState === "levelComplete" && (
          <LevelCompleteScreen
            levelName={LEVELS[currentLevel].name}
            kills={killsRef.current}
            health={player.health}
            isLastLevel={currentLevel >= LEVELS.length - 1}
            onNextLevel={nextLevel}
            onMainMenu={() => setGameState("mainMenu")}
          />
        )}

        {/* Victory */}
        {gameState === "victory" && (
          <VictoryScreen
            totalKills={totalKillsRef.current + killsRef.current}
            health={player.health}
            onPlayAgain={() => startGame(0)}
            onMainMenu={() => setGameState("mainMenu")}
          />
        )}
      </div>
    </div>
  );
}
