import { 
    checkCollision, updateEnemyAI, getDistance, 
    PICKUP_CONFIG, PickupType, AmmoType, WeaponType, 
    LEVELS 
} from "@/lib/fps-engine";
import { soundManager } from "@/lib/sound-manager";

export class GameLoop {
    constructor(private state: any) {} // state should be typed as StateManager

    public update(dt: number) {
        const state = this.state;
        const player = state.player;
        const level = LEVELS[state.currentLevel];
        
        // --- Extracted Logic ---
        
      const player = state.player;
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

      if (keysRef.current.has("arrowleft")) newAngle -= 0.05 * settings.turnSpeed;
      if (keysRef.current.has("arrowright")) newAngle += 0.05 * settings.turnSpeed;
      if (keysRef.current.has("q")) newAngle -= 0.05 * settings.turnSpeed;

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

      state.player = {
        ...player,
        x: newX,
        y: newY,
        angle: newAngle,
        bobPhase: isMoving ? player.bobPhase + dt * 0.012 : 0,
        isMoving,
      };

      if (state.shootFlash > 0) state.shootFlash--;
      if (state.hurtFlash > 0) state.hurtFlash -= 0.5;

      // Check pickups
      for (const pickup of state.pickups) {
        if (pickup.collected) continue;
        const dist = getDistance(pickup.x, pickup.y, newX, newY);
        if (dist < 0.8) {
          const config = PICKUP_CONFIG[pickup.type];
          pickup.collected = true;
          soundManager.playPickup(pickup.type);

          switch (pickup.type) {
            case PickupType.HEALTH:
              state.player.health = Math.min(player.maxHealth, player.health + config.value);
              break;
            case PickupType.MEGAHEALTH:
              state.player.health = Math.min(200, player.health + config.value);
              state.player.maxHealth = Math.max(player.maxHealth, state.player.health);
              break;
            case PickupType.ARMOR:
              state.player.armor = Math.min(100, player.armor + config.value);
              break;
            case PickupType.AMMO_BULLETS:
              state.player.ammo[AmmoType.BULLETS] += config.value;
              break;
            case PickupType.AMMO_SHELLS:
              state.player.ammo[AmmoType.SHELLS] += config.value;
              break;
            case PickupType.WEAPON_SHOTGUN:
              state.progress.unlockedWeapons.add(WeaponType.SHOTGUN);
              state.player.weapon = WeaponType.SHOTGUN;
              state.player.ammo[AmmoType.SHELLS] += 8;
              break;
            case PickupType.WEAPON_CHAINGUN:
              state.progress.unlockedWeapons.add(WeaponType.CHAINGUN);
              state.player.weapon = WeaponType.CHAINGUN;
              state.player.ammo[AmmoType.BULLETS] += 40;
              break;
            case PickupType.WEAPON_CHAINSAW:
              state.progress.unlockedWeapons.add(WeaponType.CHAINSAW);
              state.player.weapon = WeaponType.CHAINSAW;
              break;
          }
        }
      }

      // Check exit
      const exitDist = getDistance(level.exitX, level.exitY, newX, newY);
      const aliveEnemies = state.enemies.filter((e) => e.state !== "dead").length;
      if (exitDist < 1 && aliveEnemies === 0) {
        setGameState("levelComplete");
        return;
      }

      // Update enemies AI
      const currentPlayer = state.player;
      for (const enemy of state.enemies) {
        if (enemy.state === "dead") {
          enemy.animFrame++;
          continue;
        }

        const now = performance.now();

        const result = updateEnemyAI(
          enemy,
          currentPlayer,
          level.map,
          state.enemies,
          dt, // ensure dt is available, yes fixedUpdate(dt)
          now,
          projectileIdRef.current
        );

        if (result.spawnProjectile) {
          projectileIdRef.current++;
          state.projectiles.push(result.spawnProjectile);
          // No sound trigger in result? We can add it if we want.
        }

        if (result.damagePlayer) {
          let damage = result.damagePlayer;
          if (currentPlayer.armor > 0) {
            const armorAbsorb = Math.min(currentPlayer.armor, damage * 0.5);
            state.player.armor -= armorAbsorb;
            damage -= armorAbsorb;
          }
          state.player.health = Math.max(0, currentPlayer.health - damage);
          state.hurtFlash = 10;
          soundManager.playHurt();
        }

        enemy.animFrame = (enemy.animFrame + 1) % 120;
      }

      // Update projectiles
      state.projectiles = state.projectiles.filter((proj) => {
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
              state.player.armor -= armorAbsorb;
              damage -= armorAbsorb;
            }
            state.player.health = Math.max(0, state.player.health - damage);
            state.hurtFlash = 10;
            soundManager.playHurt();
            return false;
          }
        }

        return getDistance(proj.x, proj.y, currentPlayer.x, currentPlayer.y) < 40;
      });

      if (state.player.health <= 0) {
        setGameState("dead");
        return;
      }
    
        // -----------------------
    }
}
