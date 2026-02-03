# Changelog

All notable changes to this project will be documented in this file.

## [0.4.9] - 2026-02-03
### Changed
- **Default Resolution**: Set the default game resolution to "Ultra Retro" (320x240) for a more authentic retro experience.
- **Mobile UI**: Replaced the generic "Target" icon on the shoot button with a custom retro-styled "Crosshair" icon.

## [0.4.8] - 2026-02-03
### Added
- **Desktop Touchscreen Controls**: Enabled full support for using mobile-style touchscreen controls on desktop via mouse clicks when forced.
- **Pointer Events Integration**: Migrated mobile controls from Touch events to Pointer events for universal compatibility (Mouse, Pen, Touch).
- **Pointer Capture**: Implemented pointer capture on joystick and look zone to ensure continuous tracking even if the cursor leaves the element during dragging.
### Changed
- **Adaptive Cursor**: The mouse cursor is now automatically shown as a standard pointer when forced mobile controls are active on desktop, and hidden only when true mouse-look (pointer lock) is engaged.
- **Testing**: Updated unit tests to verify mobile control functionality using Pointer event simulations.

## [0.4.7] - 2026-02-03
### Fixed
- **Mobile Controls**: Fixed an issue where the hidden menu overlay was blocking touch-to-turn swiping during gameplay.

## [0.4.6] - 2026-02-03
### Changed
- **Mobile Touch Controls**: Expanded the look zone to cover the entire screen. This allows players to turn by swiping anywhere on the screen.

## [0.4.5] - 2026-02-03
### Added
- "Mobile Testing Mode" in debug options (Settings -> Cheats).
- Ability to force mobile touch controls on desktop for testing and development.
- Automatic pointer lock disabling when mobile mode is forced on desktop.

## [0.4.4] - 2026-02-03
### Added
- High-quality Lucide icons to mobile touch controls.
- Accessibility labels (`aria-label`) to mobile control buttons.
- Detailed unit tests for mobile control buttons (Fire, Pause, Weapons).

## [0.4.3] - 2026-02-03

### Changed
-   **Mobile Controls Restructuring**: 
    -   Removed legacy discrete Turn Left/Right buttons.
    -   Implemented a full right-half swipe zone for camera rotation.
    -   Added a dedicated Mobile Pause button (⏸) in the top-left corner.
    -   Added ID-based touch tracking to support multi-touch "claw" grips.
    -   Improved z-index layering to allow simultaneous looking and firing.

### Added
-   **Testing Infrastructure**:
    -   Integrated ESLint with TypeScript support for code quality.
    -   Added unit tests for `MobileControls` component using Vitest and React Testing Library.

## [0.4.2] - 2026-02-01

### Fixed
-   **Desktop Mobile Controls**: Improved device detection logic to prevent mobile touch controls from appearing on desktop computers with touchscreens.
-   **Device Detection**: Integrated User Agent and iPad-specific checks to accurately differentiate between true mobile/tablet devices and touch-capable desktop laptops.

## [0.4.1] - 2026-02-01

### Changed
-   **Refined Mobile Controls**:
    -   Removed the redundant "USE" button from the mobile overlay.
    -   Added dedicated **Turn Left** and **Turn Right** arrow buttons on the right side for classic control preference.
    -   Optimized Look Zone area to avoid overlapping with new turn buttons.
-   **Improved Responsiveness**:
    -   **Dynamic Aspect Ratio**: The game container now strictly follows the internal resolution's aspect ratio (4:3 or 16:9), ensuring the HUD and Controls are perfectly aligned with the game image regardless of device aspect ratio.
    -   **Resolution-Independent Viewmodel**: The weapon sprites (viewmodel) now scale proportionally to the vertical resolution, preventing them from appearing too large or small on different screen sizes.
    -   **Responsive HUD**: Updated the HUD components to use `clamp()` and relative sizes, making them legible and well-proportioned across all mobile and desktop resolutions.

## [0.4.0] - 2026-02-01

### Added
-   **Full Mobile Support**: Implemented a comprehensive touch-based control system for playing on mobile devices.
    -   **Virtual Joystick**: Integrated a left-side joystick for movement (WASD equivalent).
    -   **Look Zone**: Enabled high-precision camera rotation via a right-side trackpad zone.
    -   **Action Buttons**: Floating buttons for Fire, Interact/Use, and Weapon Switching.
-   **Adaptive HUD**: The HUD now dynamically adjusts its layout for mobile screens, moving status indicators to the top corners to avoid finger obstruction.
-   **Orientation Lock**: Added a specialized overlay that prompts mobile users to switch to Landscape mode for the best visual experience.
-   **Standalone Mode (PWA)**: Added a web manifest (`manifest.json`) enabling the game to be "Added to Home Screen" and run in fullscreen standalone mode.
-   **Mobile Settings**: New options added to the Settings menu:
    -   **Touch Sensitivity** slider.
    -   **Auto-Fire** and **Invert Look** toggles.

### Changed
-   **Engine Input Refactor**: The core `FPSGame` loop now handles analog touch vectors alongside digital keyboard states for seamless movement integration.
-   **Pointer Lock Adaptation**: The game now skips pointer lock handshakes on touch-capable devices, allowing immediate gameplay without browser warnings.
-   **Viewport Optimization**: Applied `touch-action: none` to the game canvas to prevent accidental browser gestures (zoom, swipe-to-refresh) during gameplay.


## [0.3.0] - 2026-01-30

### Added
-   **Keyboard Remapping**: Fully customizable control scheme via the Options menu. Supports multiple key bindings per action.
-   **Asset Preloader**: New loading screen system ensuring all heavy assets (textures, sounds) are cached before gameplay starts.
-   **Robust Settings Architecture**: Implemented deep-merge logic for persistent settings to prevent app crashes when loading legacy configurations.
-   **GameActionContext**: Introduced a decoupled communication layer for internal game events, removing reliance on global `window` objects.

### Changed
-   **Performance Optimization**: Optimized the game loop by implementing in-place "swap-and-pop" removal for projectiles, significantly reducing Garbage Collection pressure.
-   **Architecture Refactor**: Improved separation of concerns between game logic and UI state.
-   **Updated Documentation**: Overhauled README and created technical documentation in `docs/documentation.md`.

### Fixed
-   **Control Logic Safety**: Added optional chaining and safe accessors for all critical control paths to handle undefined or corrupted configuration states.

## [0.2.38] - 2026-01-30

### Added
-   **Custom Confirmation Modal**: Replaced browser-native `window.confirm` with a custom retro-styled modal for the "CLEAR PROGRESS" action.

## [0.2.37] - 2026-01-30

### Changed
-   **UI Refinement**: Removed the confirmation dialog from the "CLEAR ALL PARTS" button for a smoother experience.

## [0.2.36] - 2026-01-30

### Added
-   **Ragdoll Clear Settings**:
    -   Added "AUTO-CLEAR" toggle to ragdoll settings. Disabling it allows ragdoll parts to stay on the ground indefinitely.
    -   Added "CLEAR ALL PARTS" button to manually purge all ragdolls from the scene.
-   Increased Gore Multiplier maximum to 20x.

## [0.2.35] - 2026-01-30

### Fixed
-   **Settings Reactivity**: Fixed an issue where the new Ragdoll settings (toggle and multiplier) were not applying in-game due to stale closures.

## [0.2.34] - 2026-01-30

### Added
-   **Ragdoll Settings**: Added options menu controls for ragdoll effects.
    -   Toggle to enable/disable ragdolls.
    -   Gore multiplier slider (1x-5x) to increase number of body parts.
-   Dead enemies no longer show corpse sprite (only ragdoll parts appear).

## [0.2.33] - 2026-01-30

### Added
-   **Ragdoll Death System**: Enemies now spawn body parts (head, torso, arms, legs) when killed.
    -   Physics simulation with gravity, floor bouncing, and friction.
    -   Parts rotate and tumble as they fall.
    -   Parts fade out after ~3 seconds.
    -   Colored based on enemy type.

## [0.2.32] - 2026-01-30

### Changed
-   **Weapon Model Overhaul**: Completely redesigned all 5 weapon sprites with enhanced retro details:
    -   **Fist**: Detailed hand anatomy with knuckles, two-tone skin shading, punching animation.
    -   **Chainsaw**: Wood grain handle, gradient housing, animated chain teeth, exhaust smoke, vibration effect, blood splatter.
    -   **Pistol**: Slide/frame separation, sights (front/rear), hammer, trigger, recoil animation, ejecting shell casings, multi-layer muzzle flash.
    -   **Shotgun**: Wood grain stock, pump action animation, receiver details, red bead sight, shell ejection, spread pattern muzzle flash.
    -   **Chaingun**: Ammo box with belt feed, brass bullets on belt, heat glow effect, brass casing stream, flickering muzzle flash.

### Added
-   **Weapon Animations**: Enhanced animations for all weapons including recoil, reload/pump sequences, and improved muzzle flash effects.

## [0.2.31] - 2026-01-30

### Changed
-   **Retro Enemy Sprites**: Completely redesigned all 8 enemy types with a polished retro aesthetic:
    -   Added black outlines around all enemy silhouettes for better definition.
    -   Glowing eyes for all enemies (yellow for Imp, green for Demon/HellKnight, red for Baron/Cyberdemon, orange for Zombie).
    -   Blocky angular shapes reminiscent of classic 90s shooters.
    -   Visible triangular teeth and curved horns.
    -   Enhanced attack effects with glowing projectiles.
    -   Improved muscle/body shading with darker color gradients.
-   **Weapon Sprites**: Added black outlines to all weapon sprites for visual consistency.

### Added
-   **Sprite Helpers**: New pixel-art style rendering functions (`drawBlockyRect`, `drawRetroEllipse`, `drawGlowingEyes`, `drawTeeth`, `drawHorns`) for consistent retro look.

## [0.2.30] - 2026-01-30

### Fixed
-   **Settings Live Updates**: Converted settings to use React Context (`SettingsProvider`). All menus and gameplay now share the same settings state, so changes apply instantly after clicking Apply without requiring a page refresh.

### Changed
-   **Pause Menu Styling**: Updated pause menu to use retro pixel font (`retro-text`) instead of Impact font. Added scanlines overlay and centered layout for consistency with other menus.

## [0.2.29] - 2026-01-30

### Added
-   **Scanline Options**: Added customizable scanline settings in Options -> Display:
    -   Toggle scanlines on/off.
    -   Adjust scanline size (2-8px).
-   **Apply Button**: Settings now require clicking "Apply" to save. Unsaved changes are discarded on Cancel/Back.
-   **Live Preview**: Scanline settings show a live preview in the settings menu before applying.

### Changed
-   **ScanlinesOverlay Component**: Created a reusable `ScanlinesOverlay` component used across all menus and gameplay.

### Removed
-   **Vignette Effect**: Removed the CRT vignette dark corners effect.
-   **Random Glitch Effect**: Removed the random screen glitch effect.

## [0.2.28] - 2026-01-30

### Added
-   **Retro HUD**: Replaced the legacy canvas-based HUD with a fully detailed React-based overlay.
    -   Scanning CRT lines, vignette, and screen flicker effects.
    -   Damage pulse effect when taking damage.
    -   Stylized Health and Armor bars with numeric readouts.
    -   Weapon selection indicator.
    -   Classic green crosshair.

## [0.2.27] - 2026-01-30

### Added
-   **Clear Progress**: Added a button in Settings -> Data to wipe all game progress (unlocked levels and weapons).
-   **Version Display**: Main Menu now displays the current game version synced from `version.md`.

## [0.2.26] - 2026-01-30

### Fixed
-   **Texture Jitter**: Fixed a visual jitter issue where wall textures would shimmer or fluctuate during movement, caused by sub-pixel precision errors in the raycaster. Implemented coordinate clamping to ensure stable texture sampling.

### Added
-   **Image Smoothing Option**: Added a toggle in Settings -> Display to enable/disable linear interpolation for textures. Default is OFF (Retro style).

## [0.2.25] - 2026-01-30

### Added
-   **Wall Textures**: Replaced solid color walls with retro-style texture mapping. Textures are procedurally generated (tech, brick, stone, metal) and assigned per-level.

## [0.2.24] - 2026-01-30

### Fixed
-   **Pathfinding Bug**: Fixed a bug where the A* algorithm was using a duplicate neighbor, potentially causing inefficient pathing.

### Added
-   **Safe Diagonal Movement**: Enemies can now move diagonally in open spaces (8-way A*), but predictive path smoothing remains disabled to ensure safe corner navigation.
-   **Stuck Detection**: Implemented a "stuck detector" that forces enemies to recalculate their path if they haven't moved significantly for 0.5 seconds.

## [0.2.23] - 2026-01-30

### Fixed
-   **Cursor Lock**: Fixed an issue where the cursor would not re-lock immediately when unpausing or transitioning to the next level. Now uses strict pointer locking.
-   **Movement Calculation**: Fixed diagonal movement speed being faster than cardinal directions. Movement vectors are now normalized.

### Changed
-   **Input Bindings**:
    -   Added `Ctrl` as an alternative key for Pausing/Unpausing.
    -   Rebound `E` to Turn Right (was Next Level).
    -   Rebound `Space` to Next Level (in Level Complete screen).

## [0.2.22] - 2026-01-30

### Changed
-   **Codebase Architecture**: Major refactor of `fps-game.tsx` to strictly follow the Single Responsibility Principle. The monolithic component has been split into:
    -   **GameRenderer**: A dedicated class handling all Canvas rendering logic (World, Entities, HUD) in `frontend/engine/graphics`.
    -   **UI Components**: Discrete React components for `MainMenu`, `LevelSelect`, `PauseMenu`, `DeathScreen`, etc., in `frontend/components/game-ui`.
    -   **FPSGame**: Now purely focuses on Game Loop management and State orchestration.
-   **Maintenance**: Fixed a runtime error in `GameRenderer` where `pickups` were not being passed to the HUD.

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


## [0.1.6] - 2026-02-03

### Added
-   **Tickspeed Control**: Added a "Game Speed" slider in the Options menu, allowing players to adjust game speed from 0.1x to 3.0x.
-   **Fixed Time Step**: Implemented a fixed time step game loop (60Hz) to ensure consistent physics and game logic regardless of frame rate.

### Changed
-   Refactored `doom-game.tsx` to separate rendering from game logic updates.
