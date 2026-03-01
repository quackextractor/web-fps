/**
 * Centralized configuration for Backend & Network systems (Person 4).
 * This file contains settings for API routes, JWT authentication, and database defaults.
 */
export const BACKEND_CONFIG = {
    // Leaderboard settings
    LEADERBOARD: {
        LIMIT: 10,
    },

    // Authentication settings
    AUTH: {
        JWT_EXPIRATION: '30d',
        COOKIE_NAME: 'auth_token',
        COOKIE_MAX_AGE: 30 * 24 * 60 * 60, // 30 days in seconds
        SALT_ROUNDS: 10,
    },

    // Default values for new user accounts
    PLAYER_DEFAULTS: {
        CREDITS: 0,
        INVENTORY: {},
        MACHINES: [],
        UNLOCKED_WEAPONS: [],
        HIGHEST_LEVEL_COMPLETED: 0,
        NET_WORTH: 0,
        KILLS: 0,
    }
};
