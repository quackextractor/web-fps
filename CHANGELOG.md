# Changelog

All notable changes to this project will be documented in this file.

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
