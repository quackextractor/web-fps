# INFERNO - Descent Into Darkness

A high-performance retro raycasting 3D FPS built with React, Next.js, and a custom Canvas engine.

## Features
-   **Proprietary Raycasting Engine**: Custom-built engine with texture mapping, sprite rendering, and distance shading.
-   **Advanced AI**: 8 unique enemy types with pathfinding, state-based behavior, and distinct attack patterns.
-   **Arsenal of Weapons**: Fist, Chainsaw, Pistol, Shotgun, and Chaingun.
-   **Physics-Based Ragdolls**: Dynamic gore system with adjustable multipliers and auto-clear functionality.
-   **Visual Effects**: Scanlines, CRT effects, hurt flashes, and blood splatters.
-   **Customizable Experience**: Adjustable resolution (up to 1440p), FOV, mouse sensitivity, and game speed.
-   **Asset Preloading**: Integrated preloader to ensure smooth gameplay from the first frame.
-   **Precise Mobile Controls**: Dedicated joystick and right-half swipe zone for looking.
-   **Keyboard Remapping**: Fully customizable controls for all layouts.

## Getting Started

1.  **Clone and Install**:
    ```bash
    git clone https://github.com/quackextractor/web-fps.git
    cd web-fps/frontend
    npm install
    ```

2.  **Database Setup (New in 0.5.4)**:
    Since the application now features an online Tycoon progression system, you must initialize the local SQLite database via Prisma before starting the game:
    ```bash
    npx prisma db push
    ```

3.  **Launch Developer Server**:
    ```bash
    npm run dev
    ```

3.  **Venture Forth**:
    Open [http://localhost:3000](http://localhost:3000) with your browser.

## Controls
-   **Remappable**: All controls can be customized in the OPTIONS menu.
-   **DEFAULT WASD**: Move & Strafe
-   **Mouse**: View rotation
-   **Left Click / Space**: Attack
-   **1-5**: Select Weapon
-   **R**: Restart Level
-   **ESC**: Pause / Options
-   **P**: Toggle Debug Mode
