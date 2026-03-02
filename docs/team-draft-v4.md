# INDUSTRIALIST: Online Tycoon Expansion - Team Implementation Plan


## Project Overview

This document outlines the roles, responsibilities, and implementation plan for transforming the existing INDUSTRIALIST retro FPS into a persistent online game featuring a "Mining Loop" (FPS gameplay) and a "Factory Loop" (Tycoon mechanics). The team will collaborate via a shared Git repository, ensuring all tasks are tracked and authorship is recorded in the `CHANGELOG.md`.
> Note: This document may be subject to changes in the future and information documented here may not be 100% accurate.


---


### **Pavlo Kosov: Gameplay & Systems (FPS Engine)**

**Focus:** Modifying the core `fps-engine.ts` raycasting engine to handle the new "Mining Loop" and bridging the engine state to the UI layer. 

**Clean Pathway:** Data layer (`PICKUP_CONFIG`) → Engine Logic (AI Death) → State Management (React) → UI (HUD).


#### MVP (Must Have)

*   **Loot Configuration:** Add `PickupType.ORE_RED` and `PickupType.ORE_GREEN` to `PICKUP_CONFIG` in `lib/fps-engine.ts`.

*   **Drop Logic:** Modify `updateEnemyAI` so that upon death, Imps drop Red Ore and Demons drop Green Ore. Push a new pickup object into the active `pickupsRef.current` array instead of just despawning the enemy.

*   **Collection Logic:** Update pickup collision logic in `fps-game.tsx` to detect the new ore types. Create a temporary React state to hold loot during an active run.

*   **HUD Integration:** Pass run inventory into the existing `HUD.tsx` component to display "Loot Collected" metrics alongside health and ammo.

*   **Cloud Handoff:** When a level is completed, push the run inventory totals into Person 2's `EconomyContext.addResource()` method and explicitly trigger `forceCloudSave()` to back up the loot to the database.


#### Should Have

*   **Summary Screen:** Create a `PostRunSummary.tsx` screen that displays the run totals and calculates the estimated dollar value before finalizing the run.

*   **Assets:** Create distinct 32x32 pixel art sprites for Red Ore and Green Ore pickups.


#### Nice to Have

*   **Risk Mechanic:** Modify the dead game state handler to halve the run inventory values before sending them to the global inventory, penalizing the player for dying versus exiting safely.


---


### **Filip Houdek: Economy & State (Game Logic)**

**Focus:** The global economy math, central state, and the network-sync architecture. 

**Clean Pathway:** Define Data Structures → Build Context Provider → Implement API Sync Hook.


#### MVP (Must Have)

*   **Data Model:** Define the TypeScript interfaces to match the required JSON schema (`credits`, `inventory`, `machines`, `unlockedWeapons`, `highestLevelCompleted`). This structure will be the payload for API requests.

*   **Context Provider:** Create `context/EconomyContext.tsx`. Expose functions like `addResource()`, `spendResource()`, and `convertOreToBar()`.

*   **Cloud Sync Hook:** Implement a custom `useCloudSync()` hook inside the provider. Implement an **auto-save mechanism** that fires a `POST /api/save` request every 30-60 seconds, or immediately upon critical events.


#### Should Have

*   **Offline Fallback:** If the `POST` request fails due to network errors, cache the JSON state temporarily to `localStorage` and flag a "Sync Error" in the UI.

*   **Passive Processing:** Implement a `setInterval` hook inside `EconomyContext.tsx`. Every 5 seconds, check if machines includes active Smelters and if `inventory.ore_red >= 2`. If so, deduct 2 Red Ore and add 1 Iron Bar.


#### Nice to Have

*   **Offline Progress Calculation:** Save a `last_saved_at` timestamp. When the profile is loaded, calculate the time difference and instantly award the resources the smelters would have passively generated while the game was closed.


---


### **Tobiáš Mrázek: Frontend Developer (Factory & Armory UI)**

**Focus:** Building the React UI components for the Tycoon dashboard, Login overlays, and progression screens. 

**Clean Pathway:** Login Flow → Fetch Data → Populate Factory Hub → Interact with Context.


#### MVP (Must Have)

*   **Login Flow:** Build the "Authorized Access Terminal" login screen wireframe. On submit, call Person 4's `GET /api/save` endpoint. 

*   **Routing:** Add new states to the `GameState` type in `fps-game.tsx` (`"factory"`, `"armory"`, `"login"`, `"leaderboard"`).

*   **Factory Hub (Dashboard):** Create `components/game-ui/FactoryHub.tsx`. Consume the `EconomyContext` to display current credits, raw ore silos, and active smelting lines. Include visual indicators for cloud status.

*   **Armory UI:** Create `components/game-ui/Armory.tsx`. Add "Fabricate" buttons that call `EconomyContext.spendResource()`. For example, unlocking the Shotgun requires 50 Iron Bars and $2000. 


#### Should Have

*   **Mission Select UI:** Overhaul the existing `LevelSelect.tsx` to match the "Expedition Select" wireframes, adding a modal that shows hazard levels, yield multipliers, and the "Deploy" button.


#### Nice to Have

*   **Visual Feedback:** Add CSS animations to the `FactoryHub.tsx` (e.g., a filling progress bar or spinning gear) when a smelter is actively converting ore to bars.


---


### **Dominik Hoch: Network & Backend Systems (Next.js APIs)**

**Focus:** Database infrastructure, CRUD API endpoints, and Deployment. 

**Clean Pathway:** Setup DB → Create Auth/Save Routes → Build Leaderboard → Deploy.


#### MVP (Must Have)

*   **Database Infrastructure:** Provision a cloud database (e.g., Vercel Postgres, Supabase). Create a `Users` table with columns: `id`, `username`, `password_hash`, `net_worth`, `kills`, and a JSONB column named `save_data` to hold the exact JSON schema required by Person 2.

*   **Save/Load Endpoints:** 

    *   `GET /api/save`: Fetches the user's JSON `save_data` upon successful login.

    *   `POST /api/save`: Accepts the JSON payload from Person 2's `EconomyContext` auto-save function and overwrites the `save_data` column.

*   **Leaderboard Integration:** Create a `GET /api/leaderboard` route that returns the top 10 users sorted by `net_worth` and `kills`, and create `Leaderboard.tsx` to fetch and render this data.

*   **Deployment:** Ensure the Next.js app is deployed correctly to Vercel and has a functional public URL for the assignment submission.


#### Should Have

* **Monitoring & Validation:** Integrate `@vercel/analytics` to track page views. Implement basic authentication/session tokens (JWT) on the `POST /api/save` route to prevent players from overwriting each other's saves. Add a public UptimeRobot page for logging runtime errors and monitoring server uptime.


#### Nice to Have

*   **Visiting Tycoons:** Create a `GET /api/profile/[username]/factory` endpoint to view other players' Tycoon setups from the Global Leaderboard in a read-only state.


---


### **Slezák: Team Leader & Core Engine Dev**

**Focus:** Project management, Git repository orchestration, core engine maintenance, and final deployment quality assurance. 


**Prior Contributions (Already Implemented in Core Engine v0.5.2):**

*   Built the proprietary 2.5D Raycasting engine with fixed timestep physics and decoupled React/Canvas rendering.

*   Implemented 8 unique AI enemies with A* pathfinding and state-based behavior.

*   Built the comprehensive input systems, including fully customizable keyboard remapping, pointer lock functionality, and dynamic mobile touch controls (joystick/look zone).

*   Created procedural ragdoll physics, asset preloading, and dynamic responsive scaling.


#### MVP (Must Have - Current Sprint)

*   **Repository & Workflow Management:** Setup the central GitHub repository. Establish branching strategies and manage pull requests to ensure continuous, non-conflicting integration.

* **Task Backlog & Work Tracking:** Create and monitor a shared task board (GitHub Issues). The task list must track exact statuses: planned, in progress, and done. Ensure all team members are logging their completed work accurately in the `CHANGELOG.md` file so authorship and contributions are highly traceable.


#### Should Have

*   **Performance Optimization:** Profile the React re-renders when the new `EconomyContext` updates during active gameplay to ensure the 60Hz tick rate and frame rendering do not drop.

*   **Code Review:** Enforce TypeScript strictness and ensure ESLint rules (`pnpm run lint`) are passing across all new UI and API additions before merging.


#### Nice to Have

*   **Bug Resolution Pipeline:** Act as the primary responder for rapid hot-fixing if deployment bugs arise or if the new features break legacy engine functionalities.


## Workload estimation for each person

| Team Member | Phase | Task Description | Estimated Hours |
| :--- | :--- | :--- | :--- |
| **Kosov: Gameplay & Systems** | **MVP** | Loot Dropping Logic (5h), Connecting Factory to FPS (6h). | 11h |
| | **Should Have** | Summary/Loot Screen (4h), Draw Ore/Bar Sprites (3h). | 7h |
| | **Nice to Have** | Death risk mechanic penalty to halve run inventory. | 2h |
| | **PERSON 1 TOTAL** | | **20h** |
| **Houdek: Economy & State** | **MVP** | Economy System Context (8h), Save System/Migration (4h). | 12h |
| | **Should Have** | Offline fallbacks to local storage, Passive ore processing logic. | 5h |
| | **Nice to Have** | Offline progress calculation based on time elapsed. | 3h |
| | **PERSON 2 TOTAL** | | **20h** |
| **Mrázek: Frontend Developer** | **MVP** | Factory Hub (6h), Login/Profile (4h), Leaderboard (3h), Armory UI. | 17h |
| | **Should Have** | Mission Select UI overhaul with hazard levels. | 4h |
| | **Nice to Have** | CSS visual feedback animations (e.g., spinning gears). | 2h |
| | **PERSON 3 TOTAL**| | **23h** |
| **Hoch: Network & Backend** | **MVP** | DB provisioning, user schema, CRUD endpoints (Overlaps w/ Save System). | 6h |
| | **Should Have** | Vercel analytics, JWT authentication, UptimeRobot. | 4h |
| | **Nice to Have** | "Visiting Tycoons" read-only profile endpoint. | 3h |
| | **PERSON 4 TOTAL** | | **13h** |
| **Slezák: Team Leader** | **MVP** | Balancing Costs vs. Drop Rates (4h), Repository & Backlog tracking. | 6h |
| | **Should Have** | Performance optimization profiling, Code reviews (TypeScript/ESLint). | 5h |
| | **Nice to Have** | Primary responder for hot-fixing and bug resolution. | 4h |
| | **LEADER TOTAL** | | **15h** |
| **PROJECT GRAND TOTAL** | | | **91h** |