# INDUSTRIALIST Technical Documentation

## Overview
INDUSTRIALIST is a 2.5D retro FPS engine built with React and Next.js, utilizing a custom raycasting implementation for rendering and a decoupled architecture for game logic and UI.

## Architecture

### Core Engine (`frontend/lib/fps-engine.ts`)
- **Raycaster**: Implements the Digital Differential Analyzer (DDA) algorithm for fast wall intersection.
- **Physics**: Simple AABB collision detection for the player and circle-based collision for entities.
- **AI**: State-machine based enemies with A* pathfinding.
- **State Management**: Orchestrated via `FPSGame` component using `useRef` for high-frequency mutable state to bypass React's render cycle for core logic.

### Rendering (`frontend/engine/graphics/GameRenderer.ts`)
- **GameRenderer Class**: Decoupled from React, handles raw Canvas operations.
- **Texture Mapping**: Supports procedural and bitmap textures.
- **Sprites**: Billboarded sprites for enemies and items.
- **Post-Processing**: Integrated scanlines and flash overlays.

### Communication & State
- **SettingsProvider**: React Context for application-wide persistent settings (localStorage).
- **GameActionContext**: Event-bus style context for triggering specific game actions (e.g., clearing ragdolls) from detached UI components.

## Implementation Details

### Game Loop
- **Fixed Timestep**: 60Hz tick rate for physics and AI to ensure deterministic behavior regardless of display refresh rate.
- **Interpolation**: Renders as fast as possible using `requestAnimationFrame`, with logic decoupled from frame rate.

### Performance Optimizations
- **Projectile Management**: Uses an in-place "swap-and-pop" removal strategy to minimize garbage collection.
- **Offscreen Rendering**: Employs a secondary offscreen canvas for complex world rendering before blitting to the main display.

### Input System
- **Remappable Controls**: All keyboard inputs are mapped via the `ControlScheme` interface and can be reassigned in the options menu.
- **Pointer Lock**: Custom hook `usePointerLock` ensures high-precision mouse look.
- **Mobile Support**: Full touch-based overlay with a virtual joystick for movement, a trackpad zone for looking, and dedicated action buttons. Analog touch input is merged with keyboard inputs in the game loop. Detection logic combines touch capability with User Agent strings and iPad-specific signatures to exclude desktop touchscreens.

### UI & Layout
- **HUD Adaptability**: The HUD dynamically switches between a desktop layout (bottom status bar) and a mobile layout (top corner widgets) to avoid obstruction by touch controls. Recent updates use `clamp()` and relative scaling for perfect legibility across all resolutions.
- **Orientation Lock**: Automatically prompts users to switch to landscape mode on mobile devices for optimal FOV.
- **Responsive Container**: The game uses a dynamic aspect-ratio container that aligns perfectly with the internal rendering resolution, ensuring overlay alignment remains consistent.
- **Viewmodel Scaling**: Weapon sprites are automatically scaled based on vertical resolution to maintain a consistent visual weight across different screen heights.
- **Standalone Mode**: Includes a web manifest for an app-like fullscreen experience when added to the home screen.

## Assets
- **Preloading**: `AssetPreloader` ensures all required textures and sounds are cached before gameplay begins.
- **Ragdolls**: Procedural physics system for enemy deaths, fully configurable via settings.
