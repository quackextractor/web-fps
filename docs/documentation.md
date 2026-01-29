# Web FPS Engine Documentation

## Overview
This project is a modern, web-based retro FPS engine built with React, TypeScript, and the HTML5 Canvas API. It recreates the look and feel of 90s raycasting shooters (like Doom or Wolfenstein 3D) while using modern web technologies.

## Architecture

The engine uses a component-based architecture with a clear separation of concerns between game logic, rendering, and state management.

### Core Components

#### 1. Game Container (`components/fps-game.tsx`)
The main React component that initializes the game engine.
- **Responsibilities**:
  - Manages the React lifecycle and component state (Menu, Playing, Paused).
  - Handles user input (Keyboard, Mouse Pointer Lock).
  - Orchestrates the game loop (60Hz fixed timestep).
  - Integrates the Rendering and Engine modules.
- **Key Features**:
  - *Stale Closure Protection*: Uses `useRef` heavily to ensure the requestAnimationFrame loop always has access to the latest state.
  - *React Integration*: Hooks like `usePointerLock` and `useSettings` bridge the gap between React's declarative nature and the imperative game loop.

#### 2. Rendering Engine (`lib/canvas-renderer.ts`)
A dedicated module handling all 2D Canvas drawing operations.
- **Responsibilities**:
  - `drawFrame`: Computed raycasting columns (walls).
  - `renderEnemy` / `renderProjectile` / `renderPickup`: Sprite rendering with depth buffering (Z-Buffer).
  - `drawWeapon`: First-person weapon animations and bobbing.
  - `drawHUD`: Heads-up display overlay.
- **Implementation**:
  - Pure functions where possible, taking a Canvas Context and Game State as input.
  - Efficient sprite scaling and tinting using `shadeColor`.

#### 3. Physics & Logic Engine (`lib/fps-engine.ts`)
Handles the core raycasting mathematics and collision logic.
- **Responsibilities**:
  - **Raycasting**: Calculates wall distances and texture coordinates.
  - **Collision Detection**: Circle-vs-Map collision for smooth movement.
  - **Pathfinding**: A* algorithm implementation for enemy navigation.

#### 4. Enemy AI (`lib/enemy-ai.ts`)
Manages enemy behavior using state machines and spatial partitioning.
- **Features**:
  - **Spatial Grid**: O(1) broad-phase spatial lookups for entity interactions (collision, targeting).
  - **State Machine**: Enemies transition between Idle, Chasing, Attacking, Hurt, and Dead states.
  - **Pathfinding**: Hybrid A* pathfinding with smoothing to navigate complex level geometry.

#### 5. Configuration (`lib/game-config.ts`)
Central repository for game assets and constants.
- Defines Wall textures, Enemy stats, Weapon attributes, and Sound file paths.
- Allows for easy tuning of gameplay balance (damage, speed, etc.).

## Development Guide

### Directory Structure
```
frontend/
├── components/         # React UI Components
│   ├── fps-game.tsx    # Main Entry Point
│   ├── settings-menu.tsx
│   └── ui/             # Reusable UI (Buttons, Sliders)
├── lib/                # Core Logic Modules
│   ├── canvas-renderer.ts  # Drawing Logic
│   ├── fps-engine.ts       # Raycasting & Physics
│   ├── enemy-ai.ts         # AI & Spatial Grid
│   ├── game-config.ts      # Constants & Assets
│   └── sound-manager.ts    # Audio System
└── public/             # Static Assets (Sounds, Textures)
```

### Adding Content

#### Adding a New Enemy
1. Add the Enemy Type enum in `lib/fps-engine.ts`.
2. Define stats and sprites in `lib/game-config.ts`.
3. Implement drawing logic in `lib/canvas-renderer.ts` (or add to existing sprite renderers if standardized).

#### Adding a New Weapon
1. Add the Weapon Type enum.
2. Configure recoil, damage, and ammo in `lib/game-config.ts`.
3. Add drawing logic for the weapon view model in `lib/canvas-renderer.ts`.

## Performance Notes
- **Raycasting Resolution**: The engine casts rays based on `screenWidth / resolution`. Lower verification or "Retro" modes reduce this for performance.
- **Sprite Batching**: Sprites are z-sorted and rendered back-to-front or depth-tested against the wall Z-Buffer.
- **React Optimization**: The generic UI (menus) is separate from the high-frequency game loop to prevent React re-renders from causing frame drops.

## Testing Guide

The project uses [Vitest](https://vitest.dev/) for unit and component testing.

### Running Tests
- `npm test`: Runs all tests in headless mode using JSDOM. Ideal for quick verification.
- `npm run test:ui`: Opens the Vitest UI in your browser. Perfect for debugging and inspecting component states.

### Test Structure
- `lib/*.test.ts`: Pure logic tests (engine, pathfinding, AI).
- `tests/components/*.test.tsx`: React component tests.
    - **Note**: The `FPSGame` component test mocks the pure canvas renderer to focus on game loop initialization and React lifecycle, rather than actual pixel output.
