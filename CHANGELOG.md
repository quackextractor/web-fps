# Changelog

All notable changes to this project will be documented in this file.

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
