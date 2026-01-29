
export const GAME_CONFIG = {
    MOVEMENT: {
        PLAYER_SPEED: 0.08,
        ROTATION_SPEED: 0.003,
        PROJECTILE_SPEED: 0.18,
        BOB_SPEED: 0.012,
    },
    RENDERING: {
        FOV: Math.PI / 3,
        DEFAULT_RAYS: 200,
        MAX_RENDER_DISTANCE: 15, // Used for shading
        RESOLUTIONS: {
            'LOW': { rays: 80 },
            'MEDIUM': { rays: 200 },
            'HIGH': { rays: 400 },
        },
    },
    AI: {
        ENEMY_RADIUS: 0.3,
        SEPARATION_RADIUS: 0.8,
        SEPARATION_FORCE: 2.0,
        PATH_RECALC_INTERVAL: 1000,
        SPATIAL_GRID_SIZE: 5,
        STUCK_THRESHOLD: 30,
    },
    PHYSICS: {
        TICK_RATE: 1000 / 60,
        GRAVITY: 0, // Not used yet but good to have
        COLLISION_PADDING: 0.1,
    },
    AUDIO: {
        MAX_DISTANCE: 15,
    }
} as const;
