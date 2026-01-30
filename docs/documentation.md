# INFERNO Technical Documentation

## Overview
INFERNO is a 2.5D retro FPS engine built with React and Next.js, utilizing a custom raycasting implementation for rendering and a decoupled architecture for game logic and UI.

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

## Assets
- **Preloading**: `AssetPreloader` ensures all required textures and sounds are cached before gameplay begins.
- **Ragdolls**: Procedural physics system for enemy deaths, fully configurable via settings.
