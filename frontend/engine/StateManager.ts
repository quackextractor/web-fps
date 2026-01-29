import {
    type Player, type Enemy, type Projectile, type Pickup,
    WeaponType, AmmoType, LEVELS, createInitialPlayer // Assuming createInitialPlayer helper is available or we define inline
} from "@/lib/fps-engine";

export class StateManager {
    player: Player;
    enemies: Enemy[] = [];
    projectiles: Projectile[] = [];
    pickups: Pickup[] = [];

    // Game Stats
    currentLevelIdx = 0;
    kills = 0;
    totalKills = 0;

    // Visual FX State
    shootFlash = 0;
    hurtFlash = 0;
    projectileId = 0;

    // Unlock Progress [Source 28]
    unlockedWeapons = new Set<WeaponType>([WeaponType.FIST, WeaponType.PISTOL]);

    constructor() {
        this.player = this.createDefaultPlayer();
    }

    createDefaultPlayer(): Player {
        return {
            x: 2, y: 2, angle: 0, health: 100, maxHealth: 100,
            armor: 0, ammo: { [AmmoType.BULLETS]: 50, [AmmoType.SHELLS]: 0 },
            weapon: WeaponType.PISTOL, bobPhase: 0, isMoving: false,
            isMeleeing: false, meleeFrame: 0
        };
    }

    loadLevel(levelIndex: number, difficulty: string, preservePlayer = false) {
        const level = LEVELS[levelIndex];
        if (!level) return;

        this.currentLevelIdx = levelIndex;

        // Logic from [Source 32-34]
        if (!preservePlayer) {
            this.player = this.createDefaultPlayer();
            this.kills = 0; // Reset kills if new game
        }

        this.player.x = level.startX;
        this.player.y = level.startY;
        this.player.angle = level.startAngle;

        // Difficulty multipliers [Source 32]
        let mult = { damage: 1, health: 1, speed: 1 };
        if (difficulty === "easy") mult = { damage: 0.5, health: 0.75, speed: 0.8 };
        if (difficulty === "hard") mult = { damage: 1.5, health: 1.25, speed: 1.2 };

        // Initialize enemies centered in tiles [Source 34]
        this.enemies = level.enemies.map((e, i) => ({
            ...e,
            x: e.x + 0.5,
            y: e.y + 0.5,
            id: i,
            health: e.health * mult.health,
            damage: e.damage * mult.damage,
            speed: e.speed * mult.speed,
            stuckFrameCount: 0, // Ensure strictly typed
            path: []
        }));

        this.pickups = level.pickups.map((p, i) => ({ ...p, id: i, collected: false }));
        this.projectiles = [];
        this.shootFlash = 0;
        // Don't reset totalKills here, handled by Engine
    }
}