import { Player, Enemy, Projectile, Pickup, WeaponType, AmmoType } from "@/lib/fps-engine";

export interface GameStateData {
    player: Player;
    enemies: Enemy[];
    projectiles: Projectile[];
    pickups: Pickup[];
    gameState: "mainMenu" | "playing" | "paused" | "dead" | "victory";
    currentLevel: number;
    shootFlash: number;
    hurtFlash: number;
    levelStats: { kills: number; totalKills: number };
    progress: { unlockedWeapons: Set<WeaponType> };
}

export class StateManager {
    public state: GameStateData;

    constructor() {
        this.reset();
    }

    reset() {
        this.state = {
            player: this.createInitialPlayer(),
            enemies: [],
            projectiles: [],
            pickups: [],
            gameState: "mainMenu",
            currentLevel: 0,
            shootFlash: 0,
            hurtFlash: 0,
            levelStats: { kills: 0, totalKills: 0 },
            progress: { unlockedWeapons: new Set([WeaponType.FIST, WeaponType.PISTOL]) }
        };
    }

    createInitialPlayer(): Player {
        return {
            x: 2, y: 2, angle: 0,
            health: 100, maxHealth: 100, armor: 0,
            ammo: { [AmmoType.BULLETS]: 50, [AmmoType.SHELLS]: 0 },
            weapon: WeaponType.PISTOL,
            bobPhase: 0, isMoving: false, isMeleeing: false, meleeFrame: 0
        };
    }
}
