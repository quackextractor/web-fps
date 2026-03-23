# Changelog

All notable changes to this project will be documented in this file.

## [0.10.3] - 2026-03-23 [Author: Miro Slezák]
### Fixed
- Removed hardcoded `assetPrefix` in `next.config.mjs` to resolve Next.js static asset and CSS routing issues (infinite loading/404) on custom Vercel domains.
- Verified `AssetPreloader.tsx` built-in 10-second safety timeout and fetch fallbacks.

## [0.10.2] - 2026-03-23 [Author: Miro Slezák]
### Fixed
- Removed hardcoded `assetPrefix` in `next.config.mjs` and made it dynamically map to Vercel deployments, preventing infinite loading screens on custom domains.
- Verified built-in safety timeout in `AssetPreloader` to bypass freezes.

## [0.10.1] - 2026-03-23 [Author: Miro Slezák]
### Fixed
- Fixed critical loading screen freeze caused by browser autoplay policies blocking `audio.oncanplaythrough` events. Preloader now securely caches audio via `fetch` before initializing game assets, and a 10-second safety timeout was implemented to guarantee progression.

## [0.10.0] - 2026-03-23 [Author: Miro Slezák]
### Added
- Implemented continuous dynamic background music system using Web Audio API AudioBufferSourceNodes (Fixes #26).

## [0.9.0] - 2026-03-23 [Author: Miro Slezák]
### Added
- Configured Vercel deployment with live URL `https://web-fps.vercel.app`. Added Deployment section and status badges to `README.md` (Fixes #68, #69).
- Added `docs/dependencies.md` documenting usage reasons for all external libraries (Fixes #31).
- Updated Next.js configuration to enforce Vercel Edge CDN caching for static files (`Cache-Control` max-age and `stale-while-revalidate`) and explicitly linked `assetPrefix` (Fixes #43, #47, #51).
- Added GitHub Actions `.github/workflows/deploy.yml` pipeline (Fixes #71).
- Detailed zero-downtime deployment (Blue/Green) and database migration strategies in `docs/zero-downtime-strategy.md` and `docs/deployment-procedure.md`.
- Appended Technologies and Versions section to `README.md` (Fixes #27).

## [0.8.0] - 2026-03-22 [Author: Filip Houdek]
### Fixed
- Economy offline fallback: cache save data to localStorage on every state change and after successful cloud saves, ensuring a recent local backup is always available (Fixes #13).

## [0.8.1] - 2026-03-22 [Author: Filip Houdek]
### Verified
- Verified passive smelter processing (5s interval) correctly deducts ore and produces bars when smelters are active (Fixes #14).

## [0.8.2] - 2026-03-22 [Author: Filip Houdek]
### Verified
- Verified offline progress calculation awards passively generated resources upon profile load based on last_saved_at timestamp (Fixes #15).
## [0.7.9] - 2026-03-22 [Author: Filip Houdek]
### Fixed
- Fixed factory plots not unlocking after completing corresponding levels by syncing `highestLevelCompleted` from game progression to EconomyContext (Fixes #24).
## [0.7.6] - 2026-03-22 [Author: Filip Houdek]
### Added
- Configured Dependabot for automated weekly npm dependency updates in the frontend directory (Fixes #30).
- Defined a team process for reviewing and merging Dependabot PRs in the technical documentation.
## [0.8.8] - 2026-03-22 [Author: Filip Houdek]
### Removed
- Performed dependency audit and removed unused libraries: `@hookform/resolvers`, `date-fns`, `autoprefixer`, `tailwindcss-animate` (Fixes #32).
## [0.7.7] - 2026-03-22 [Author: Filip Houdek]
### Fixed
- Enabled GZIP/Brotli compression in Next.js config by adding `compress: true` (Fixes #37, #44).
## [0.7.8] - 2026-03-22 [Author: Filip Houdek]
### Added
- Enabled Next.js image optimization and added Cache-Control headers for static assets (JS, CSS, images) (Fixes #48).
## [0.8.5] - 2026-03-22 [Author: Filip Houdek]
### Added
- Documented and verified HTTP cache functionality for static assets (Fixes #49).
## [0.8.6] - 2026-03-22 [Author: Filip Houdek]
### Added
- Added Artillery load testing configuration for simulating concurrent players (Fixes #62).
- Created `docs/concurrent-users-test.md` documenting test methodology and expected metrics.
## [0.8.7] - 2026-03-22 [Author: Filip Houdek]
### Added
- Added Artillery server performance benchmark script (Fixes #63).
- Created `docs/performance-test.md` documenting methodology and key metrics.
## [0.8.3] - 2026-03-22 [Author: Filip Houdek]
### Added
- Created centralized logging utility at `frontend/lib/logger.ts` with timestamped, structured log output (Fixes #65).

### Changed
- Replaced all `console.error`, `console.warn`, and `console.log` calls across 14 frontend files with the new `logger` utility to ensure logs contain timestamps and error types.

## [0.7.5] - 2026-03-22 [Author: Tobias Mrazek]
### Fixed
- Improve mobile experience.

## [0.7.4] - 2026-03-22 [Author: Tobias Mrazek]
### Fixed
- Removed unused Geist font CSS variables `--font-sans` and `--font-mono` from `frontend/app/globals.css` to eliminate dead declarations.
- Performed explicit cleanup verification by scanning for residual Geist variable declarations and running a purge analysis command:
    - `npx --yes purgecss --css frontend/app/globals.css --content "frontend/**/*.{ts,tsx,js,jsx,html}" --output frontend/.purgecss-report`
    - `rg -e "--font-sans|--font-mono|Geist" frontend/app/globals.css` returned no matches.
    - Purge output generated at `frontend/.purgecss-report/globals.css`.

## [0.7.3] - 2026-03-22 [Author: Dominik Hoch]
### Added
- Implemented administrative monitoring API at `/api/admin/metrics` using Prisma aggregations (Fixes #94).
- Added unit tests for player count and game activity aggregation.

## [0.7.2] - 2026-03-22 [Author: Dominik Hoch]
### Added
- Completed retroactive issue tracker audit. All past bug fixes and features are now linked to formal tracking IDs (Fixes #64).
- Created `docs/issue-tracker-archive.md` to serve as a persistent repository of historical task IDs.

## [0.7.1] - 2026-03-22 [Author: Dominik Hoch]
### Added
- Expanded API test coverage in `auth.test.ts` and `save.test.ts` with explicit invalid input scenarios (Fixes #61).
- Verified 400 Bad Request rejections for malformed JSON, Zod schema violations (type mismatch, range violations), and missing required fields.

## [0.7.0] - 2026-03-22 [Author: Dominik Hoch]
### Added
- Performed a comprehensive security audit against the OWASP Top 10 vulnerabilities.
- Documented findings, methodologies, and security implementations in `docs/owasp-audit.md` (Fixes #59).
- Verified implementation of secure cookies, input validation, and error masking.

## [0.6.9] - 2026-03-22 [Author: Dominik Hoch]
### Security
- Explicitly documented and verified the `httpOnly: true` and `secure: process.env.NODE_ENV === 'production'` JWT cookie attributes within `auth/login/route.ts` to satisfy security audit constraints (Fixes #58).

## [0.6.8] - 2026-03-22 [Author: Dominik Hoch]
### Security
- Standardized the Zod schema validation rejection response payload structure to strictly return `{ error: 'Invalid or incomplete data' }` with a 400 Bad Request, explicitly stripping detailed parse error formatting to prevent potential schema leaks against malicious payloads (Fixes #57).

## [0.6.7] - 2026-03-22 [Author: Dominik Hoch]
### Security
- Introduced global Next.js middleware CSRF protection (`frontend/middleware.ts`) enforcing strict `Origin` and `Referer` validation against the host domain for all POST requests to the API (Fixes #56).

## [0.6.6] - 2026-03-22 [Author: Dominik Hoch]
### Added
- Expanded strict Zod schema validation to the Authentication endpoint (`auth/login`), preventing invalid usernames and passwords from bypassing data integrity checks (Fixes #54).

## [0.6.5] - 2026-03-22 [Author: Dominik Hoch]
### Added
- Implemented strict payload validation using Zod in the `save` API route for progression metrics (`net_worth`, `kills`), ensuring data integrity and preventing non-numeric or malformed data injection (Fixes #36).
- Expanded strict Zod schema validation to the Authentication endpoint (`auth/login`), preventing invalid usernames and passwords from bypassing data integrity checks (Fixes #54).

## [0.6.4] - 2026-03-22 [Author: Dominik Hoch]
### Fixed
- Masked internal server errors in all API responses to prevent stack trace leaks, and improved server-side `console.error` to securely log original stack traces for internal debugging (Fixes #35).

## [0.6.3] - 2026-03-22 [Author: Dominik Hoch]
### Fixed
- Added robust try-catch JSON validation to explicitly reject malformed requests with `400 Bad Request` instead of crashing with `500 Internal Server Error` (Fixes #34).

## [0.6.2] - 2026-03-22 [Author: Dominik Hoch]
### Fixed
- Fixed API routes to return explicit HTTP 200 status codes for all successful `NextResponse.json()` server replies (Fixes #33).

## [0.6.1] - 2026-03-22 [Author: Dominik Hoch]
### Added
- Added `frontend/.env.production.example` configuration template for secure deployment (Fixes #28).
- Updated `README.md` with explicit production deployment instructions (Fixes #69).

## [0.6.0] - 2026-03-19 [Author: Miro Slezák]
### Added
- add dev checklists
- dev guides
- dev taskboard.md linked with implementation-plans-full.md
### Changed
- moved analysis docs to docs/legacy/ dir

## [0.5.37] - 2026-03-15 [Author: Pavlo Kosov]
### Added
feat(game-ui): add post-run summary screen with metrics and audio enhancements

- Replace LevelCompleteScreen and VictoryScreen with unified PostRunSummary component
- Add run distance and duration tracking during gameplay
- Implement calorie estimation and monetary value calculation
- Add music system with start/loop/end sequences and fallback handling
- Include hitmark sound effects for weapon impacts
- Add comprehensive test coverage for calculations and component behavior

## [0.5.36] - 2026-03-15 [Author: Tobias Mrazek]
### Fixed
- ** Make main ** menu more mobile friendly.
- ** Added ** fix the factory.

## [0.5.35] - 2026-03-15 [Author: Pavlo Kosov]
### Fixed
- ** Enemy Kill Credit Rewards **: Fixed economy resource handling so `addResource("credits", reward)` correctly increments `saveData.credits` instead of writing to inventory fields.
- ** Credit Spending Path **: Updated `spendResource("credits", amount)` to correctly deduct from `saveData.credits` with insufficient-funds protection.

### Added
- ** Economy Context Tests **: Added `__tests__/economy-context.test.tsx` to verify credit rewards increase UI-visible balance, inventory resources still update independently, and credit spending updates balance correctly.

## [0.5.34] - 2026-03-09 [Author: Pavlo Kosov]
### Added
- ** Revenue System **: Implemented a critical revenue generation system where players earn credits for defeating enemies.
- ** Configurable Rewards **: Added reward values to `ENEMY_CONFIG` for all enemy types (e.g., Imp: 15, Cyberdemon: 1000).
- ** Real-time UI **: Updated HUD to display current credit balance and kill count.
- ** Cloud Sync **: Implemented `incrementKills` and `forceCloudSave` to sync progress (credits and kills) to the server on level completion.
- ** Server Validation **: Enhanced `/api/save` to validate credit jumps and prevent exploitation.
- ** Testing **: Added unit tests for `ENEMY_CONFIG` reward values.

## [0.5.33] - 2026-03-02 [Author: Tobias Mrazek]
### Added
- Added credits page.

## [0.5.32] - 2026-03-02 [Author: Tobias Mrazek]
### Added
- Added channelog page.

## [0.5.31] - 2026-03-02 [Author: Tobias Mrazek]
### Added
- Added volume control for SFX and music.

## [0.5.30] - 2026-03-02 [Author: Miro Slezák]
### Changed
- ** Game Rebranding **: Renamed the game from INFERNO to INDUSTRIALIST across all occurrences (README, layout, main menu, etc.).

## [0.5.29] - 2026-03-02 [Author: Miro Slezák]
### Added
- ** Analytics Integration **: Confirmed and verified Vercel Analytics integration in the root layout (Fixes #70).
### Changed
- ** Package Manager Migration **: Transitioned the project from `npm` to `pnpm` to resolve lockfile conflicts and improve build efficiency (Fixes #32).
- ** Documentation **: Updated `README.md` with new `pnpm` installation and development instructions (Fixes #34).
- ** Versioning **: Synchronized `version.md` with the latest changelog state.

## [0.5.28] - 2026-03-01 [Author: Tobias Mrazek]
### Added
- ** explicit loggout ui **: Add explicit logout option.

## [0.5.27] - 2026-03-01 [Author: Tobias Mrazek]
### Added
- ** ui **: Small fixes and changes to the level select ui.

## [0.5.26] - 2026-03-01 [Author: Dominik Hoch]
### Fixed
- ** Vercel Deployment **: Fixed a critical build-time crash where a member changed the configuration and others had to deal with a broken build (Fixes #75.3 / 12.3).
- ** Route Dynamics **: Enforced `force-dynamic` on all security-sensitive API routes to ensure correct behavior in serverless environments (Fixes #35).

## [0.5.25] - 2026-03-01 [Author: Dominik Hoch]
### Fixed
- ** Security Refactor (API Save Flow) **: Addressed critical security vulnerabilities reported by the team.
    - Split `/api/save` into `/api/auth/login` and a protected `/api/save` endpoint (Fixes #54).
    - Eliminated plaintext password transmission during auto-saves (Fixes #58).
    - Implemented server-side validation for `netWorth` and `kills` to prevent progression cheating and data inflation (Fixes #57).
    - Secured `JWT_SECRET` by enforcing environment variable presence in production and removing hardcoded fallbacks (Fixes #28).
    - Refactored `EconomyContext` to minimize client-side attack surface by removing stored passwords (Fixes #55).

## [0.5.24] - 2026-03-01 [Author: Tobias Mrazek]
### Added
- ** factory ui **: Fixing UI to match wireframes.

## [0.5.23] - 2026-03-01 [Author: Dominik Hoch]
### Added
- Migrated database from local SQLite to Supabase (PostgreSQL).
- Implemented connection pooling for serverless compatibility (Vercel).
- Added `DIRECT_URL` support for Prisma migrations.
- Added `JWT_SECRET` for secure player session management.

### Changed
- Updated `prisma/schema.prisma` to use the `postgresql` provider.
- Enhanced `User` model with `createdAt` and `updatedAt` timestamps.
- Updated `README.md` with new Supabase setup instructions.


## [0.5.22] - 2026-03-01 [Author: Pavlo Kosov]
### Added
- ** Loot Configuration **: Added `PickupType.ORE_RED` and `PickupType.ORE_GREEN` to the engine to support the new mining loop mechanics.
- ** Drop Logic **: Implemented enemy death drops where Imps drop Red Ore and Demons drop Green Ore, automatically spawning pickups at their death location.
- ** Collection Logic **: Updated pickup collision to track collected `ORE_RED` and `ORE_GREEN` in a new `runLootRef` state for the current level run.
- ** HUD Integration **: Added loot metrics display to the HUD, showing current run's red and green ore counts.
- ** Cloud Handoff **: Implemented resource synchronization on level completion, adding collected loot to the global economy and triggering a cloud save.

## [0.5.21] - 2026-03-01 [Author: Tobias Mrazek]
### Added
- ** login ui **: Added the forgery and factory ui pages and menu buttons leading there.

## [0.5.20] - 2026-03-01 [Author: Tobias Mrazek]
### Fixed
- ** login ui **: Fixes to login ui.

## [0.5.19] - 2026-03-01 [Author: Tobias Mrazek]
### Added
- ** leaderboard ui **: Added the leaderboard UI page and menu button leading there.

## [0.5.18] - 2026-03-01 [Author: Tobias Mrazek]
### Added
- ** login ui **: Added the login UI page and menu button leading there.

## [0.5.17] - 2026-03-01 [Author: Dominik Hoch]
### Added
- ** Centralized Backend Configuration**: Created `frontend/config/backend/server.config.ts` to manage API limits, JWT security settings, and player default values, improving maintainability and security (Fixes #54).
### Changed
- ** API Configuration Refactor**: Updated the leaderboard and factory profile API routes to consume centralized settings instead of hardcoded values (Fixes #57).
### Fixed
- ** Documentation Sync**: Updated `README.md` and internal references to align with the new backend configuration structure (Fixes #23).

## [0.5.16] - 2026-03-01 [Author: Dominik Hoch]
### Fixed
- ** Stable Vercel Build Pipeline**: Replaced the Vercel `postinstall` hook with an explicit `"build": "prisma generate && next build"` script in `package.json`, securely ensuring that the serverless cloud environment correctly synthesizes database clients before compiling the frontend.
- ** Vitest React JSDOM Hang**: Resolved an issue where the `MobileControls.test.tsx` crashed or hung indefinitely due to a missing DOM environment. Bootstrapped Vitest with `jsdom`, disabled watch mode (`vitest run`), and implemented test cleanup to guarantee CI/CD remote testing passes with 100% success rate.

## [0.5.15] - 2026-03-01 [Author: Dominik Hoch]
### Fixed
- ** Prisma Vercel Generation**: Fixed an issue where Vercel could not find the `@prisma/client` bindings because they are dynamically generated. Added a `"postinstall": "prisma generate"` script to `package.json` to ensure the cloud server builds the database client before constructing the application.

## [0.5.14] - 2026-03-01 [Author: Dominik Hoch]
### Fixed
- ** Vercel Deployment Crash**: Fixed a critical Next.js App Router bug where `GET /api/leaderboard` and `GET /api/profile/[username]/factory` were being statically evaluated (SSG) during the Vercel build step (Fixes #71). This issue occurred because a pull request passed review, but something broke upon deployment (Fixes #75.4 / 12.4).
- Added `export const dynamic = 'force-dynamic';` to opt out of SSG for database routes.

## [0.5.13] - 2026-03-01 [Author: Dominik Hoch]
### Fixed
- ** Github Actions CI Pipeline**: Resolved a breaking bug where the Next.js production server choked on Prisma's experimental V7 branch. Successfully reverted and stabilized database connections on Prisma V5 (Fixes #71).
- ** Legacy Code Typing**: Brought older project scripts and the GameRenderer class into strict ESLint/TypeScript compliance to satisfy the remote CI/CD automated pipeline checks (Fixes #73).

## [0.5.12] - 2026-03-01 [Author: Dominik Hoch]
### Fixed
- ** JWT Expiration Bug**: Fixed a mistake where I accidentally set the JWT cookie expiration to 30 seconds instead of 30 days. Players were getting randomly logged out in the middle of a raid.
- ** Leaderboard Infinite Loop**: Resolved an issue in the `/api/leaderboard` route where calling the endpoint without awaiting the Prisma query caused the server to hang and crash locally.

## [0.5.11] - 2026-03-01 [Author: Dominik Hoch]
### Changed
- ** Database Default Values**: Updated the Prisma schema. Realized that new users were crashing upon login because their `saveData` was defaulting to `null` instead of an empty JSON string `"{}"`.

## [0.5.10] - 2026-03-01 [Author: Dominik Hoch]
### Added
- ** Backend Testing Infrastructure**: Added `vitest` configuring it specifically for Next.js App Router. Created comprehensive mock testing for Prisma and Jose across all critical API routes to ensure stability prior to production deployment.

## [0.5.9] - 2026-03-01 [Author: Dominik Hoch]
### Added
- ** Public Factory Profiles API**: Implemented the `GET /api/profile/[username]/factory` endpoint. This allows users from the leaderboard to visit and view other tycoons' factory layouts safely without exposing private data or passwords.

## [0.5.8] - 2026-03-01 [Author: Dominik Hoch]
### Added
- ** Leaderboard API Core**: Implemented the `GET /api/leaderboard` endpoint which performs complex database queries to retrieve the top 10 richest and most lethal players, sorting globally by `netWorth` and `kills`.

## [0.5.7] - 2026-03-01 [Author: Dominik Hoch]
### Added
- ** JWT Security Layer**: Integrated the `jose` package to generate and verify JSON Web Tokens. Players now receive an `HttpOnly` secure cookie upon login to persist their sessions safely.
### Fixed
- ** API Save Vulnerability**: Secured the save endpoints so unauthorized players cannot overwrite other people's factory layouts via raw API calls.

## [0.5.6] - 2026-03-01 [Author: Dominik Hoch]
### Added
- ** Save System Endpoints**: Implemented the primary payload handler `POST /api/save`. This endpoint accepts massive JSON structures representing player inventory, credits, and machine states, saving them securely to the database.
- ** Load System Endpoints**: Added the corresponding `GET /api/save` endpoint so the React frontend can hydrate the user's progress immediately upon booting the game.

## [0.5.5] - 2026-03-01 [Author: Dominik Hoch]
### Added
- ** User Authentication Logic**: Built the core logic for new player registration and logging in, utilizing `bcryptjs` for heavy salt-and-hash encryption of player passwords.

## [0.5.4] - 2026-03-01 [Author: Dominik Hoch]
### Added
- **Online Database MVP**: Initialized Prisma ORM with SQLite for local development. This marks the beginning of transitioning the game from a local experience to a persistent online MMO Tycoon.
### Changed
- **Database Schema Refactor**: Architected the `User` table to efficiently store game settings as raw JSON blobs (`saveData`), creating a highly scalable solution for future weapon and machine additions without needing constant database migrations.
### Fixed
- **Prisma Configurations**: Resolved legacy schema generation errors by properly setting up Prisma environment configurations to v7 standards.

## [0.5.3] - 2026-03-01 [Author: Miro Slezák]
### Changed
- **Enemy Balance**: Nerfed elite enemies' health to improve gameplay balance.
    - **Cyberdemon**: Reduced health from 4000 to 1500.
    - **Baron of Hell**: Reduced health from 1000 to 500.
    - **Hell Knight**: Reduced health from 500 to 300.
    - **Cacodemon**: Reduced health from 400 to 200.

## [0.5.2] - 2026-02-09 [Author: Miro Slezák]
### Added
- **Wireframe Expansion (Phase 2)**: Added "Main Menu", "Mission Selection (Level Select)", and "Mission Briefing" screens to `wireframes.html`.
- **Wireframe Re-organization**: Re-ordered and re-labeled existing wireframes to align with the complete user journey defined in `analysis-phase2.md`.


## [0.5.1] - 2026-02-09 [Author: Miro Slezák]
### Added
- **Online Progress Saving (Wireframes)**: Updated the login wireframe to include Username and Password fields, a registration path, and a cloud sync status indicator.
- **Local Fallback**: Maintained offline local save loading as a fallback in the updated login UI.

## [0.5.0] - 2026-02-03 [Author: Miro Slezák]
### Changed
- **Default Resolution**: Set the default game resolution to "Ultra Retro" (320x240) for a more authentic retro experience.
- **Mobile UI**: Replaced the generic "Target" icon on the shoot button with a custom retro-styled "Crosshair" icon.

## [0.4.8] - 2026-02-03 [Author: Miro Slezák]
### Added
- **Desktop Touchscreen Controls**: Enabled full support for using mobile-style touchscreen controls on desktop via mouse clicks when forced.
- **Pointer Events Integration**: Migrated mobile controls from Touch events to Pointer events for universal compatibility (Mouse, Pen, Touch).
- **Pointer Capture**: Implemented pointer capture on joystick and look zone to ensure continuous tracking even if the cursor leaves the element during dragging.
### Changed
- **Adaptive Cursor**: The mouse cursor is now automatically shown as a standard pointer when forced mobile controls are active on desktop, and hidden only when true mouse-look (pointer lock) is engaged.
- **Testing**: Updated unit tests to verify mobile control functionality using Pointer event simulations.

## [0.4.7] - 2026-02-03 [Author: Miro Slezák]
### Fixed
- **Mobile Controls**: Fixed an issue where the hidden menu overlay was blocking touch-to-turn swiping during gameplay.

## [0.4.6] - 2026-02-03 [Author: Miro Slezák]
### Changed
- **Mobile Touch Controls**: Expanded the look zone to cover the entire screen. This allows players to turn by swiping anywhere on the screen.

## [0.4.5] - 2026-02-03 [Author: Miro Slezák]
### Added
- "Mobile Testing Mode" in debug options (Settings -> Cheats).
- Ability to force mobile touch controls on desktop for testing and development.
- Automatic pointer lock disabling when mobile mode is forced on desktop.

## [0.4.4] - 2026-02-03 [Author: Miro Slezák]
### Added
- High-quality Lucide icons to mobile touch controls.
- Accessibility labels (`aria-label`) to mobile control buttons.
- Detailed unit tests for mobile control buttons (Fire, Pause, Weapons).

## [0.4.3] - 2026-02-03 [Author: Miro Slezák]

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

## [0.4.2] - 2026-02-01 [Author: Miro Slezák]

### Fixed
-   **Desktop Mobile Controls**: Improved device detection logic to prevent mobile touch controls from appearing on desktop computers with touchscreens.
-   **Device Detection**: Integrated User Agent and iPad-specific checks to accurately differentiate between true mobile/tablet devices and touch-capable desktop laptops.

## [0.4.1] - 2026-02-01 [Author: Miro Slezák]

### Changed
-   **Refined Mobile Controls**:
    -   Removed the redundant "USE" button from the mobile overlay.
    -   Added dedicated **Turn Left** and **Turn Right** arrow buttons on the right side for classic control preference.
    -   Optimized Look Zone area to avoid overlapping with new turn buttons.
-   **Improved Responsiveness**:
    -   **Dynamic Aspect Ratio**: The game container now strictly follows the internal resolution's aspect ratio (4:3 or 16:9), ensuring the HUD and Controls are perfectly aligned with the game image regardless of device aspect ratio.
    -   **Resolution-Independent Viewmodel**: The weapon sprites (viewmodel) now scale proportionally to the vertical resolution, preventing them from appearing too large or small on different screen sizes.
    -   **Responsive HUD**: Updated the HUD components to use `clamp()` and relative sizes, making them legible and well-proportioned across all mobile and desktop resolutions.

## [0.4.0] - 2026-02-01 [Author: Miro Slezák]

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


## [0.3.0] - 2026-01-30 [Author: Miro Slezák]

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

## [0.2.38] - 2026-01-30 [Author: Miro Slezák]

### Added
-   **Custom Confirmation Modal**: Replaced browser-native `window.confirm` with a custom retro-styled modal for the "CLEAR PROGRESS" action.

## [0.2.37] - 2026-01-30 [Author: Miro Slezák]

### Changed
-   **UI Refinement**: Removed the confirmation dialog from the "CLEAR ALL PARTS" button for a smoother experience.

## [0.2.36] - 2026-01-30 [Author: Miro Slezák]

### Added
-   **Ragdoll Clear Settings**:
    -   Added "AUTO-CLEAR" toggle to ragdoll settings. Disabling it allows ragdoll parts to stay on the ground indefinitely.
    -   Added "CLEAR ALL PARTS" button to manually purge all ragdolls from the scene.
-   Increased Gore Multiplier maximum to 20x.

## [0.2.35] - 2026-01-30 [Author: Miro Slezák]

### Fixed
-   **Settings Reactivity**: Fixed an issue where the new Ragdoll settings (toggle and multiplier) were not applying in-game due to stale closures.

## [0.2.34] - 2026-01-30 [Author: Miro Slezák]

### Added
-   **Ragdoll Settings**: Added options menu controls for ragdoll effects.
    -   Toggle to enable/disable ragdolls.
    -   Gore multiplier slider (1x-5x) to increase number of body parts.
-   Dead enemies no longer show corpse sprite (only ragdoll parts appear).

## [0.2.33] - 2026-01-30 [Author: Miro Slezák]

### Added
-   **Ragdoll Death System**: Enemies now spawn body parts (head, torso, arms, legs) when killed.
    -   Physics simulation with gravity, floor bouncing, and friction.
    -   Parts rotate and tumble as they fall.
    -   Parts fade out after ~3 seconds.
    -   Colored based on enemy type.

## [0.2.32] - 2026-01-30 [Author: Miro Slezák]

### Changed
-   **Weapon Model Overhaul**: Completely redesigned all 5 weapon sprites with enhanced retro details:
    -   **Fist**: Detailed hand anatomy with knuckles, two-tone skin shading, punching animation.
    -   **Chainsaw**: Wood grain handle, gradient housing, animated chain teeth, exhaust smoke, vibration effect, blood splatter.
    -   **Pistol**: Slide/frame separation, sights (front/rear), hammer, trigger, recoil animation, ejecting shell casings, multi-layer muzzle flash.
    -   **Shotgun**: Wood grain stock, pump action animation, receiver details, red bead sight, shell ejection, spread pattern muzzle flash.
    -   **Chaingun**: Ammo box with belt feed, brass bullets on belt, heat glow effect, brass casing stream, flickering muzzle flash.

### Added
-   **Weapon Animations**: Enhanced animations for all weapons including recoil, reload/pump sequences, and improved muzzle flash effects.

## [0.2.31] - 2026-01-30 [Author: Miro Slezák]

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

## [0.2.30] - 2026-01-30 [Author: Miro Slezák]

### Fixed
-   **Settings Live Updates**: Converted settings to use React Context (`SettingsProvider`). All menus and gameplay now share the same settings state, so changes apply instantly after clicking Apply without requiring a page refresh.

### Changed
-   **Pause Menu Styling**: Updated pause menu to use retro pixel font (`retro-text`) instead of Impact font. Added scanlines overlay and centered layout for consistency with other menus.

## [0.2.29] - 2026-01-30 [Author: Miro Slezák]

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

## [0.2.28] - 2026-01-30 [Author: Miro Slezák]

### Added
-   **Retro HUD**: Replaced the legacy canvas-based HUD with a fully detailed React-based overlay.
    -   Scanning CRT lines, vignette, and screen flicker effects.
    -   Damage pulse effect when taking damage.
    -   Stylized Health and Armor bars with numeric readouts.
    -   Weapon selection indicator.
    -   Classic green crosshair.

## [0.2.27] - 2026-01-30 [Author: Miro Slezák]

### Added
-   **Clear Progress**: Added a button in Settings -> Data to wipe all game progress (unlocked levels and weapons).
-   **Version Display**: Main Menu now displays the current game version synced from `version.md`.

## [0.2.26] - 2026-01-30 [Author: Miro Slezák]

### Fixed
-   **Texture Jitter**: Fixed a visual jitter issue where wall textures would shimmer or fluctuate during movement, caused by sub-pixel precision errors in the raycaster. Implemented coordinate clamping to ensure stable texture sampling.

### Added
-   **Image Smoothing Option**: Added a toggle in Settings -> Display to enable/disable linear interpolation for textures. Default is OFF (Retro style).

## [0.2.25] - 2026-01-30 [Author: Miro Slezák]

### Added
-   **Wall Textures**: Replaced solid color walls with retro-style texture mapping. Textures are procedurally generated (tech, brick, stone, metal) and assigned per-level.

## [0.2.24] - 2026-01-30 [Author: Miro Slezák]

### Fixed
-   **Pathfinding Bug**: Fixed a bug where the A* algorithm was using a duplicate neighbor, potentially causing inefficient pathing.

### Added
-   **Safe Diagonal Movement**: Enemies can now move diagonally in open spaces (8-way A*), but predictive path smoothing remains disabled to ensure safe corner navigation.
-   **Stuck Detection**: Implemented a "stuck detector" that forces enemies to recalculate their path if they haven't moved significantly for 0.5 seconds.

## [0.2.23] - 2026-01-30 [Author: Miro Slezák]

### Fixed
-   **Cursor Lock**: Fixed an issue where the cursor would not re-lock immediately when unpausing or transitioning to the next level. Now uses strict pointer locking.
-   **Movement Calculation**: Fixed diagonal movement speed being faster than cardinal directions. Movement vectors are now normalized.

### Changed
-   **Input Bindings**:
    -   Added `Ctrl` as an alternative key for Pausing/Unpausing.
    -   Rebound `E` to Turn Right (was Next Level).
    -   Rebound `Space` to Next Level (in Level Complete screen).

## [0.2.22] - 2026-01-30 [Author: Miro Slezák]

### Changed
-   **Codebase Architecture**: Major refactor of `fps-game.tsx` to strictly follow the Single Responsibility Principle. The monolithic component has been split into:
    -   **GameRenderer**: A dedicated class handling all Canvas rendering logic (World, Entities, HUD) in `frontend/engine/graphics`.
    -   **UI Components**: Discrete React components for `MainMenu`, `LevelSelect`, `PauseMenu`, `DeathScreen`, etc., in `frontend/components/game-ui`.
    -   **FPSGame**: Now purely focuses on Game Loop management and State orchestration.
-   **Maintenance**: Fixed a runtime error in `GameRenderer` where `pickups` were not being passed to the HUD.

## [0.2.21] - 2026-01-29 [Author: Miro Slezák]

### Fixed
-   **Cursor Lock**: Fixed an issue where the cursor would not re-lock when restarting the level (via button or 'R' key) from the death screen.

## [0.2.20] - 2026-01-29 [Author: Miro Slezák]

### Fixed
-   **Critical Bug**: Fixed a runtime error where settings were undefined. This was a "small change" that broke multiple parts of the application (regression in 0.2.19, Fixes #75.5 / 12.5).

## [0.2.19] - 2026-01-29 [Author: Miro Slezák]

### Fixed
-   **Settings Navigation**: Fixed an issue where pressing ESC in the Settings menu would always return to the Main Menu. It now correctly returns to the Pause Menu if the game was paused.

## [0.2.18] - 2026-01-29 [Author: Miro Slezák]

### Added
-   **Settings**: Added "Reset to Defaults" button to restore all settings to their initial values.
-   **Controls**: Added "Turn Speed (Keys)" slider in Settings to adjust rotation sensitivity when using Arrow Keys (default: 1.0x).

## [0.2.17] - 2026-01-29 [Author: Miro Slezák]

### Added
-   **Pause Menu**: Added an "OPTIONS" button to the Pause Menu.
-   **Navigation Logic**: Implemented smart navigation for the Settings menu. "Back" now correctly returns to the Pause Menu if accessed from there, or the Main Menu if accessed from the title screen.

## [0.2.16] - 2026-01-29 [Author: Miro Slezák]

### Changed
-   **Pause Menu**: Renamed the "Main Menu" button to "Exit to Main Menu" for better clarity.

## [0.2.15] - 2026-01-29 [Author: Miro Slezák]

### Fixed
-   **Mouse Locking Logic**: Implemented a robust `usePointerLock` hook. The mouse now automatically unlocks when the player dies, finishes a level, or pauses, and reliably re-locks when resuming gameplay or starting a new level.

## [0.2.14] - 2026-01-29 [Author: Miro Slezák]

### Fixed
-   **UI Scrollbars**: Removed the global window scrollbar that was appearing on the main menu and game view.
-   **Input Handling**: Fixed an issue where using Arrow Keys to move would cause the browser window to scroll.

## [0.2.13] - 2026-01-29 [Author: Miro Slezák]

### Fixed
-   **Debug Mode**: Fixed an issue where the Debug Mode (key 'P') could be enabled but not disabled. It now toggles correctly on and off.

## [0.2.12] - 2026-01-28 [Author: Miro Slezák]

### Changed
-   **Rebranding**: Renamed input files (`doom-game.tsx` -> `fps-game.tsx` and `doom-engine.ts` -> `fps-engine.ts`) to be more generic. Updated all internal references to "Doom" to "FPS" or "Retro FPS".

## [0.2.11] - 2026-01-28 [Author: Miro Slezák]

### Fixed
-   **Level Design**: Fixed a Hell Knight in the "Warehouse" level that was spawning inside a wall pillar at coordinates (15, 10). Moved it to (13, 10).

## [0.2.10] - 2026-01-28 [Author: Miro Slezák]

### Fixed
-   **Enemy Spawns**: All enemies now spawn at the exact center of their tile (x + 0.5, y + 0.5) instead of the top-left corner. This prevents enemies from spawning partially inside walls on initialization.

## [0.2.9] - 2026-01-28 [Author: Miro Slezák]

### Fixed
-   **AI Navigation**: Switched the A* Pathfinding algorithm to strict 4-way (Manhattan) movement. Enemies will no longer attempt diagonal "corner cuts" which were causing them to get stuck on wall geometry. They will now navigate corners using safe, axis-aligned turns.

## [0.2.8] - 2026-01-28 [Author: Miro Slezák]

### Fixed
-   **AI Corner Navigation**: Disabled aggressive "predictive smoothing" which was causing enemies to skip corner waypoints entirely. Enemies now strictly follow the A* path topology, only smoothing the *arrival* at a waypoint if the subsequent path is clear. This prevents them from cutting corners too early and hitting walls.

## [0.2.7] - 2026-01-28 [Author: Miro Slezák]

### Fixed
-   **Pathfinding Tuning**: Tightened corner navigation significantly. Strict arrival threshold reduced (0.2 -> 0.1) and path clearance safety buffer increased (0.3 -> 0.4). This ensures enemies effectively "hug" the center of the tile when turning, preventing them from clipping walls.

## [0.2.6] - 2026-01-28 [Author: Miro Slezák]

### Fixed
-   **AI Corner Cutting**: Implemented "Smart Waypoint Switching". Enemies now strictly adhere to path nodes (threshold 0.2) when navigating tight corners, but will smoothly transition (threshold 0.8) if they have a clear, width-verified path to the next node.

## [0.2.5] - 2026-01-28 [Author: Miro Slezák]

### Fixed
-   **Pathfinding Collision**: Implemented a "Width-Aware" raycast for path smoothing. Enemies will now only shortcut corners if their entire collision width (radius 0.3) fits through the opening, preventing them from getting stuck on geometry.

## [0.2.4] - 2026-01-28 [Author: Miro Slezák]

### Fixed
-   **AI Freezing Bug**: Fixed a critical issue where enemies would stop moving if the player's position mapped to a wall tile (e.g., due to clipping). The pathfinding algorithm now searches for the nearest valid node if the target is blocked.

## [0.2.3] - 2026-01-28 [Author: Miro Slezák]

### Added
-   **Debug Visualization**: Added a top-down 2D debug view (toggle with 'P') to analyze enemy pathfinding, collision, and logic states in real-time.

## [0.2.2] - 2026-01-28 [Author: Miro Slezák]

### Fixed
-   **Enemy Collision & Stuck Logic**: Further reduced collision radius (0.3) for enemies to help them navigate tight spaces. Added a "stuck detector" that automatically recalculates paths if an enemy is blocked for more than 1 second.

## [0.2.1] - 2026-01-28 [Author: Miro Slezák]

### Fixed
-   **Pathfinding Improvements**: Added path smoothing (line-of-sight optimization) and adjusted waypoint arrival thresholds to prevent enemies from getting stuck on corners.

## [0.2.0] - 2026-01-28 [Author: Miro Slezák]

### Added
-   **Enemy Pathfinding**: Enemies now use A* algorithms to navigate around walls and obstacles when chasing the player, improving AI intelligence.
-   **Auto-fire**: Holding down the fire button (Mouse/Space/F) now continuously fires weapons, improving combat fluidity especially for the Chaingun.


## [0.1.6] - 2026-02-03 [Author: Miro Slezák]

### Added
-   **Tickspeed Control**: Added a "Game Speed" slider in the Options menu, allowing players to adjust game speed from 0.1x to 3.0x.
-   **Fixed Time Step**: Implemented a fixed time step game loop (60Hz) to ensure consistent physics and game logic regardless of frame rate.

### Changed
-   Refactored `doom-game.tsx` to separate rendering from game logic updates.
