# Changelog

All notable changes to this project will be documented in this file.


## [0.2.21] - 2026-01-29

### Fixed
-   **Cursor Lock**: Fixed an issue where the cursor would not re-lock when restarting the level (via button or 'R' key) from the death screen.

## [0.2.20] - 2026-01-29

### Fixed
-   **Critical Bug**: Fixed a runtime error where settings were undefined due to a missing hook call (regression in 0.2.19).

## [0.2.19] - 2026-01-29

### Fixed
-   **Settings Navigation**: Fixed an issue where pressing ESC in the Settings menu would always return to the Main Menu. It now correctly returns to the Pause Menu if the game was paused.

## [0.2.18] - 2026-01-29

### Added
-   **Settings**: Added "Reset to Defaults" button to restore all settings to their initial values.
-   **Controls**: Added "Turn Speed (Keys)" slider in Settings to adjust rotation sensitivity when using Arrow Keys (default: 1.0x).

## [0.2.17] - 2026-01-29

### Added
-   **Pause Menu**: Added an "OPTIONS" button to the Pause Menu.
-   **Navigation Logic**: Implemented smart navigation for the Settings menu. "Back" now correctly returns to the Pause Menu if accessed from there, or the Main Menu if accessed from the title screen.

## [0.2.16] - 2026-01-29

### Changed
-   **Pause Menu**: Renamed the "Main Menu" button to "Exit to Main Menu" for better clarity.

## [0.2.15] - 2026-01-29

### Fixed
-   **Mouse Locking Logic**: Implemented a robust `usePointerLock` hook. The mouse now automatically unlocks when the player dies, finishes a level, or pauses, and reliably re-locks when resuming gameplay or starting a new level.

## [0.2.14] - 2026-01-29

### Fixed
-   **UI Scrollbars**: Removed the global window scrollbar that was appearing on the main menu and game view.
-   **Input Handling**: Fixed an issue where using Arrow Keys to move would cause the browser window to scroll.

## [0.2.13] - 2026-01-29

### Fixed
-   **Debug Mode**: Fixed an issue where the Debug Mode (key 'P') could be enabled but not disabled. It now toggles correctly on and off.

## [0.2.12] - 2026-01-28

### Changed
-   **Rebranding**: Renamed input files (`doom-game.tsx` -> `fps-game.tsx` and `doom-engine.ts` -> `fps-engine.ts`) to be more generic. Updated all internal references to "Doom" to "FPS" or "Retro FPS".

## [0.2.11] - 2026-01-28

### Fixed
-   **Level Design**: Fixed a Hell Knight in the "Warehouse" level that was spawning inside a wall pillar at coordinates (15, 10). Moved it to (13, 10).

## [0.2.10] - 2026-01-28

### Fixed
-   **Enemy Spawns**: All enemies now spawn at the exact center of their tile (x + 0.5, y + 0.5) instead of the top-left corner. This prevents enemies from spawning partially inside walls on initialization.

## [0.2.9] - 2026-01-28

### Fixed
-   **AI Navigation**: Switched the A* Pathfinding algorithm to strict 4-way (Manhattan) movement. Enemies will no longer attempt diagonal "corner cuts" which were causing them to get stuck on wall geometry. They will now navigate corners using safe, axis-aligned turns.

## [0.2.8] - 2026-01-28

### Fixed
-   **AI Corner Navigation**: Disabled aggressive "predictive smoothing" which was causing enemies to skip corner waypoints entirely. Enemies now strictly follow the A* path topology, only smoothing the *arrival* at a waypoint if the subsequent path is clear. This prevents them from cutting corners too early and hitting walls.

## [0.2.7] - 2026-01-28

### Fixed
-   **Pathfinding Tuning**: Tightened corner navigation significantly. Strict arrival threshold reduced (0.2 -> 0.1) and path clearance safety buffer increased (0.3 -> 0.4). This ensures enemies effectively "hug" the center of the tile when turning, preventing them from clipping walls.

## [0.2.6] - 2026-01-28

### Fixed
-   **AI Corner Cutting**: Implemented "Smart Waypoint Switching". Enemies now strictly adhere to path nodes (threshold 0.2) when navigating tight corners, but will smoothly transition (threshold 0.8) if they have a clear, width-verified path to the next node.

## [0.2.5] - 2026-01-28

### Fixed
-   **Pathfinding Collision**: Implemented a "Width-Aware" raycast for path smoothing. Enemies will now only shortcut corners if their entire collision width (radius 0.3) fits through the opening, preventing them from getting stuck on geometry.

## [0.2.4] - 2026-01-28

### Fixed
-   **AI Freezing Bug**: Fixed a critical issue where enemies would stop moving if the player's position mapped to a wall tile (e.g., due to clipping). The pathfinding algorithm now searches for the nearest valid node if the target is blocked.

## [0.2.3] - 2026-01-28

### Added
-   **Debug Visualization**: Added a top-down 2D debug view (toggle with 'P') to analyze enemy pathfinding, collision, and logic states in real-time.

## [0.2.2] - 2026-01-28

### Fixed
-   **Enemy Collision & Stuck Logic**: Further reduced collision radius (0.3) for enemies to help them navigate tight spaces. Added a "stuck detector" that automatically recalculates paths if an enemy is blocked for more than 1 second.

## [0.2.1] - 2026-01-28

### Fixed
-   **Pathfinding Improvements**: Added path smoothing (line-of-sight optimization) and adjusted waypoint arrival thresholds to prevent enemies from getting stuck on corners.

## [0.2.0] - 2026-01-28

### Added
-   **Enemy Pathfinding**: Enemies now use A* algorithms to navigate around walls and obstacles when chasing the player, improving AI intelligence.
-   **Auto-fire**: Holding down the fire button (Mouse/Space/F) now continuously fires weapons, improving combat fluidity especially for the Chaingun.

## [0.1.0] - 2026-01-28

### Added
-   **Tickspeed Control**: Added a "Game Speed" slider in the Options menu, allowing players to adjust game speed from 0.1x to 3.0x.
-   **Fixed Time Step**: Implemented a fixed time step game loop (60Hz) to ensure consistent physics and game logic regardless of frame rate.

### Changed
-   Refactored `doom-game.tsx` to separate rendering from game logic updates.
