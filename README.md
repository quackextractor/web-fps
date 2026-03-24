# INDUSTRIALIST - Descent Into Darkness

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.10.7-blue.svg)](https://github.com/quackextractor/web-fps)

Play the game live at: `https://web-fps.vercel.app`

A high-performance retro raycasting 3D FPS built with React, Next.js, and a custom Canvas engine.

## Deployment
This application is automatically deployed via Vercel ensuring high availability and zero-downtime edge caching.
[![Deployment Status](https://img.shields.io/badge/Vercel-Deployed-green.svg)](https://web-fps-sigma.vercel.app/)

## Technologies and Versions
- **Next.js**: v16.1.6
- **React** (and React DOM): v19.2.0
- **Prisma** (and Prisma Client): v5.22.0
- **Tailwind CSS**: v4.1.9
- **Supabase / PostgreSQL**: (Version managed via the Supabase platform, as noted in the database setup).

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
-   **Centralized Backend Config**: Externalized all network and server settings (Person 4 role) to `config/backend/server.config.ts` for easy maintenance.

## Getting Started

1.  **Clone and Install**:
    ```bash
    git clone https://github.com/quackextractor/web-fps.git
    cd web-fps/frontend
    pnpm install
    ```

2.  **Database Setup (Supabase)**:
    The application now uses Supabase (PostgreSQL) for the online Tycoon progression system.
    - Create a `.env` file in the `frontend` directory based on the Supabase dashboard (ORMs -> Prisma tab).
    - Ensure you have `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) configured.
    - Initialize the database schema:
    ```bash
    pnpm exec prisma generate
    pnpm exec prisma db push
    ```

3.  **Deployment to Production**:
    - When deploying to a live server, copy the `frontend/.env.production.example` file to create your production environment variables (or set them in your hosting provider's dashboard).
    - Ensure `DATABASE_URL`, `DIRECT_URL`, and `JWT_SECRET` are securely set.

3.  **Launch Developer Server**:
    ```bash
    pnpm run dev
    ```

### New APIs (v0.5.4+)
The game now supports a public Tycoon/Factory saving system powered by Prisma and JWTs:
- `POST /api/save` - Save player progress (JSON, requires hash on first attempt, JWT on updates)
- `GET /api/save` - Load protected player progress (JSON, requires JWT cookie)
- `GET /api/leaderboard` - Fetch the top 10 players based on Net Worth and Kills
- `GET /api/profile/[username]/factory` - Fetch a public view of a player's factory layout

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

## Issue Tracking

Formal bug reports and task tracking for this repository are managed via the [Industrialist Public Issue Tracker](https://github.com/quackextractor/web-fps/issues). All security fixes and feature milestones are formally logged and linked to corresponding tracking IDs.
