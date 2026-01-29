Based on the analysis of the source code, specifically the monolithic `fps-game.tsx` and the functional-but-scattered logic in `fps-engine.ts`, the current architecture suffers from **tight coupling between the React render cycle and the game loop**.

This implementation plan refactors the codebase into a **Clean Architecture** suited for a web-based game, separating the **Engine (Logic)**, **Renderer (Canvas)**, and **View (React UI)**.

### **Phase 1: Architectural Restructuring**

The first step is to break the physical file structure. Currently, `fps-game.tsx` handles input, state, rendering, and UI. We will move to a class-based system for the game logic to persist state outside the React lifecycle.

**New Directory Structure:**
```text
frontend/
├── app/
├── components/
│   ├── game/               <-- New Directory
│   │   ├── game-canvas.tsx <-- Wrapper for the canvas element only
│   │   ├── game-ui.tsx     <-- React UI overlay (HUD, Menus)
│   │   └── fps-game.tsx    <-- Main container (State Orchestrator)
│   └── ui/                 <-- Shadcn UI components (Keep as is)
├── engine/                 <-- New Core Directory
│   ├── core/
│   │   ├── GameLoop.ts     <-- Manages the requestAnimationFrame cycle
│   │   └── InputSystem.ts  <-- Decoupled input listener
│   ├── entities/
│   │   ├── Player.ts       <-- Player class (logic only)
│   │   └── Enemy.ts        <-- Enemy AI class
│   ├── graphics/
│   │   ├── Renderer.ts     <-- The Raycasting logic (pure Canvas API)
│   │   └── Sprites.ts      <-- Sprite drawing functions
│   └── StateManager.ts     <-- Holds the "Source of Truth"
└── lib/
    └── utils.ts
```

---

### **Phase 2: Decoupling the Game Engine (The Logic Layer)**

The current implementation uses `useRef` hooks to hold mutable game data. This works but makes the code difficult to test or extend. We will move this into a vanilla TypeScript class.

#### **Action Items:**
1.  **Create `engine/StateManager.ts`**:
    *   Move the `Player`, `Enemy[]`, `Level`, and `Projectile[]` interfaces here.
    *   This class holds the "state" of the world purely in memory, without React knowing about it.
2.  **Create `engine/core/GameLoop.ts`**:
    *   Extract the `fixedUpdate` and `gameLoop` logic found in `fps-game.tsx`.
    *   Instead of calling `forceUpdate`, this class will emit events or provide a callback that the Renderer subscribes to.
    *   **Key Change**: The loop should accept a `delta` time and pass it to an `update()` method on the entities.

**Implementation Concept:**
```typescript
// engine/core/GameLoop.ts
export class GameLoop {
    private lastTime: number = 0;
    private accumulator: number = 0;
    private readonly TICK_RATE = 1000 / 60;

    constructor(private onUpdate: (dt: number) => void, private onRender: () => void) {}

    public start() {
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop);
    }

    private loop = (time: number) => {
        const dt = time - this.lastTime;
        this.lastTime = time;
        this.accumulator += dt;

        while (this.accumulator >= this.TICK_RATE) {
            this.onUpdate(this.TICK_RATE); // Fixed time step
            this.accumulator -= this.TICK_RATE;
        }
        this.onRender(); // Render interpolation
        requestAnimationFrame(this.loop);
    };
}
```

---

### **Phase 3: Extracting the Renderer (The Visual Layer)**

The `render` function in `fps-game.tsx` is over 500 lines long, mixing raycasting math with sprite drawing. This must be isolated.

#### **Action Items:**
1.  **Create `engine/graphics/Renderer.ts`**:
    *   Move `castRay`, `renderEnemy`, `drawWeapon`, and the `zBuffer` logic here.
    *   Pass the HTMLCanvasElement to the constructor.
    *   **Optimization**: The renderer should read from `StateManager` but never write to it.
2.  **Create `engine/graphics/Sprites.ts`**:
    *   Extract all specific enemy drawing functions (e.g., `drawImp`, `drawCacodemon`) into this utility class.
    *   This reduces the "God component" size significantly and allows for easier addition of new enemies.

---

### **Phase 4: Input Management**

Currently, keyboard listeners are attached inside a `useEffect` in the main component, mixing UI controls ("P" for debug) with Game controls ("WASD").

#### **Action Items:**
1.  **Create `engine/core/InputSystem.ts`**:
    *   Move `keysRef` and `mouseMovementRef` logic here.
    *   Expose methods like `isKeyDown(key: string)` and `getMouseDelta()`.
    *   Separate **Game Actions** (Shoot, Move) from **System Actions** (Pause, Menu). System actions should emit events to React; Game actions should be consumed by the `GameLoop`.

---

### **Phase 5: React Integration (The View Layer)**

Once the logic is extracted, `fps-game.tsx` becomes a thin wrapper that initializes the engine and displays UI.

#### **Action Items:**
1.  **Refactor `fps-game.tsx`**:
    *   It should initialize the `GameLoop` inside a `useEffect` **once**.
    *   It should **not** re-render 60 times a second.
2.  **The HUD Problem**:
    *   React needs to know when health/ammo changes to update the HUD.
    *   **Best Practice**: Do not re-render the whole game component. Use a custom hook `useGameStateSync` that subscribes to the `GameLoop` explicitly for HUD updates (throttled to 10-20 FPS or only on value change), or render the HUD onto the Canvas if performance is paramount (though React UI is easier to style).

**Refactored Component Structure:**
```tsx
// components/game/fps-game.tsx
export default function FPSGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<GameState>("mainMenu");

    // Initialize Engine
    useEffect(() => {
        if (!canvasRef.current) return;
        const engine = new GameEngine(canvasRef.current);
        
        // Subscribe only to necessary state changes for UI
        engine.on('playerDied', () => setGameState("dead"));
        engine.on('levelComplete', () => setGameState("levelComplete"));
        
        engine.start();
        return () => engine.destroy();
    }, []);

    return (
        <div className="relative">
            <canvas ref={canvasRef} />
            
            {/* UI Overlay Layers */}
            {gameState === "playing" && <HUD />}
            {gameState === "paused" && <PauseMenu />}
            {gameState === "settings" && <SettingsMenu />}
        </div>
    );
}
```

### **Summary of Refactoring Benefits**

1.  **Performance**: Removing `forceUpdate` prevents React's reconciliation process from running every frame, freeing up JS execution time for the Raycaster.
2.  **Maintainability**: `render` logic is separated from `update` logic. You can modify how an enemy looks (`Sprites.ts`) without risking breaking their pathfinding (`Enemy.ts`).
3.  **Scalability**: Adding a new weapon or enemy currently requires editing the giant switch statements in `fps-game.tsx`. In the new system, you would simply create a new class implementing an `IRenderable` interface.