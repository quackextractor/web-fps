@echo off
setlocal DisableDelayedExpansion

echo Creating Issue 1: Resolution ^& FOV Settings...
echo ### Description > issue1.md
echo The game's resolution and Field of View (FOV) settings fail to apply correctly upon initially loading the page. The user must manually toggle the resolution in the settings menu to fix the FOV, and this fix does not persist across page reloads. >> issue1.md
echo. >> issue1.md
echo ### Root Cause >> issue1.md
echo The resolution is managed by the `useSettings` hook, which hydrates state from `localStorage` asynchronously. However, the `useEffect` hook in `frontend/components/fps-game.tsx` that handles canvas resizing based on `settings.resolution` currently fires before the settings are fully loaded from local storage, causing the engine to initialize with default resolution values. >> issue1.md
echo. >> issue1.md
echo ### Implementation Plan >> issue1.md
echo 1. **Update the Resolution Effect:** Open `frontend/components/fps-game.tsx`. Locate the `useEffect` responsible for handling resolution (where `offscreenCanvasRef` and `canvasRef` widths and heights are set). >> issue1.md
echo 2. **Add Load State Dependency:** Introduce the `isLoaded` flag from the `useSettings` hook as a dependency to this `useEffect`. >> issue1.md
echo 3. **Prevent Premature Execution:** Add an early return (`if (!isLoaded) return;`) at the top of this `useEffect` to ensure the canvas dimensions and FOV calculations are only applied *after* the user's `localStorage` preferences have successfully hydrated. >> issue1.md

gh issue create --title "Bug: Resolution & FOV Settings Do Not Persist on Page Load" --assignee "@me" --label "bug" --body-file issue1.md


echo.
echo Creating Issue 2: Redundant Asset Preloading...
echo ### Description > issue2.md
echo The `AssetPreloader` loads heavy game assets twice: once immediately when entering the page (Main Menu), and a second time when the user clicks "Start Game". >> issue2.md
echo. >> issue2.md
echo ### Root Cause >> issue2.md
echo The visibility of the preloader in `fps-game.tsx` is controlled by the logic `shouldShowAssetPreloader = isSceneTransitioning ^|^| preloadedLevelIndex !== currentLevel`. When the user clicks "Start Game", the `startGame` function calls `beginLevelTransition`. This function forcefully executes `setPreloadedLevelIndex(null)`, which resets the preloader state and mounts the `AssetPreloader` component again, even if the assets for that level were already cached on the main menu. >> issue2.md
echo. >> issue2.md
echo ### Implementation Plan >> issue2.md
echo 1. **Modify Transition Logic:** Open `frontend/components/fps-game.tsx` and locate the `beginLevelTransition` function. >> issue2.md
echo 2. **Implement Cache Check:** Add a conditional check before resetting the preloader state. If `preloadedLevelIndex === levelIndex` (meaning the assets for the target level are already loaded in the browser's active memory), skip calling `setPreloadedLevelIndex(null)`. >> issue2.md
echo 3. **Bypass Preloader:** In the same condition, immediately execute `loadLevel(levelIndex)` and `setIsSceneTransitioning(false)` to jump straight into the game without remounting the `AssetPreloader`. >> issue2.md

gh issue create --title "Optimization: Redundant Asset Preloading on Game Start" --assignee "@me" --label "enhancement" --body-file issue2.md


echo.
echo Creating Issue 3: Implement HTTP Caching...
echo ### Description > issue3.md
echo The game fetches static assets (like `.bmp` or `.webp` textures) on every refresh. Assets should be properly cached by the browser/CDN, and a cache invalidation mechanism must be implemented so that returning users automatically download new assets when the game is updated. >> issue3.md
echo. >> issue3.md
echo ### Root Cause >> issue3.md
echo Next.js does not automatically apply long-term `Cache-Control` headers to files served from the public directory. Furthermore, the texture paths in `fps-engine.ts` are hardcoded strings (e.g., `'/textures/wall_tech.bmp'`), meaning there is no cache-busting mechanism if the file contents change. >> issue3.md
echo. >> issue3.md
echo ### Implementation Plan >> issue3.md
echo 1. **Configure Cache Headers:** Open `frontend/next.config.mjs` and add an asynchronous `headers()` function. Configure this function to return strict `Cache-Control` HTTP headers (e.g., `public, max-age=31536000, immutable`) specifically targeting paths under `/textures/`. >> issue3.md
echo 2. **Implement Cache Invalidation:** Open `frontend/lib/fps-engine.ts`. Locate the `wallTextures` property defined inside the `LEVELS` array. >> issue3.md
echo 3. **Append Version Query Strings:** Update the hardcoded texture paths to include the game's version as a query parameter (e.g., `1: '/textures/wall_tech.bmp?v=' + process.env.NEXT_PUBLIC_GAME_VERSION`). Because `next.config.mjs` exposes the current game version, updating the game version will automatically alter the URL and force the browser to invalidate the stale cache. >> issue3.md
echo 4. **Verification:** Test the implementation locally using browser DevTools (Network tab) to ensure the `Cache-Control` headers are present and the `?v=` parameter successfully triggers cache busts on version bumps. >> issue3.md

gh issue create --title "Feature: Implement HTTP Caching and Cache Invalidation for Static Assets" --assignee "@me" --label "enhancement,performance" --body-file issue3.md


echo.
echo Cleaning up temporary files...
del issue1.md issue2.md issue3.md

echo All 3 issues have been created and assigned to you!