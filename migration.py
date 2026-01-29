
import os
import re

# Configuration: Paths relative to the project root
SOURCE_FILE = "frontend/components/fps-game.tsx"
TARGET_DIR = "frontend/engine"

# Mappings for variable renaming during migration
# (React Refs -> Class Properties)
REF_REPLACEMENTS = {
    r"playerRef\.current": "state.player",
    r"enemiesRef\.current": "state.enemies",
    r"projectilesRef\.current": "state.projectiles",
    r"pickupsRef\.current": "state.pickups",
    r"shootFlashRef\.current": "state.shootFlash",
    r"hurtFlashRef\.current": "state.hurtFlash",
    r"killsRef\.current": "state.levelStats.kills",
    r"screenWidthRef\.current": "this.width",
    r"screenHeightRef\.current": "this.height",
    r"numRaysRef\.current": "this.numRays",
    r"weaponsUnlockedRef\.current": "state.progress.unlockedWeapons",
    r"gameStateRef\.current": "state.gameState",
}

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def extract_block(source, start_pattern):
    """
    Extracts a code block (function/variable) starting with a pattern 
    and matching opening/closing braces.
    """
    match = re.search(start_pattern, source)
    if not match:
        return None
    
    start_idx = match.start()
    # Find the first opening brace
    brace_start = source.find("{", start_idx)
    if brace_start == -1:
        return None

    count = 1
    i = brace_start + 1
    while count > 0 and i < len(source):
        if source[i] == "{":
            count += 1
        elif source[i] == "}":
            count -= 1
        i += 1
    
    return source[start_idx:i]

def replace_refs(code):
    """Replaces React ref patterns with State/Class patterns."""
    for pattern, replacement in REF_REPLACEMENTS.items():
        code = re.sub(pattern, replacement, code)
    return code

def generate_sprites_ts(content):
    """Generates engine/graphics/Sprites.ts containing drawing logic."""
    print("Generating Sprites.ts...")
    
    # 1. Extract helper functions
    shade_color = extract_block(content, r"function shadeColor")
    
    # 2. Extract all draw functions
    draw_funcs = []
    patterns = [
        r"const drawImp", r"const drawDemon", r"const drawSoldier", 
        r"const drawCacodemon", r"const drawBaron", r"const drawZombie",
        r"const drawHellKnight", r"const drawCyberdemon", 
        r"const drawFist", r"const drawChainsaw", r"const drawPistol",
        r"const drawShotgun", r"const drawChaingun"
    ]
    
    for p in patterns:
        block = extract_block(content, p)
        if block:
            # Export these functions
            block = block.replace("const draw", "export const draw")
            draw_funcs.append(block)

    # 3. Construct file
    output = """import { Enemy, EnemyType } from "@/lib/fps-engine";
import { Player, WeaponType } from "@/lib/fps-engine";

// Helper extracted from main file
export """ + (shade_color if shade_color else "") + "\n\n"
    
    output += "\n\n".join(draw_funcs)
    return output

def generate_renderer_ts(content):
    """Generates engine/graphics/Renderer.ts containing the render loop."""
    print("Generating Renderer.ts...")
    
    # Extract functions
    render_func = extract_block(content, r"const render =")
    render_proj = extract_block(content, r"const renderProjectile =")
    render_pickup = extract_block(content, r"const renderPickup =")
    render_enemy = extract_block(content, r"const renderEnemy =")
    draw_weapon = extract_block(content, r"const drawWeapon =")
    draw_hud = extract_block(content, r"const drawHUD =")
    render_debug = extract_block(content, r"const renderDebugView =")

    # Clean up 'const' to class methods or exports
    def clean(func_str):
        if not func_str: return ""
        # Remove "const name =" and arrow syntax to make it a method-like or standalone
        # For simplicity in this script, we'll keep them as exported constants or modify strict syntax
        # But per plan, we want a Class. Let's make them standalone functions we import, 
        # or methods of a Renderer class.
        # Simplest migration: Standalone exported functions.
        func_str = func_str.replace("const render =", "export function render")
        func_str = func_str.replace("const renderProjectile =", "export function renderProjectile")
        func_str = func_str.replace("const renderPickup =", "export function renderPickup")
        func_str = func_str.replace("const renderEnemy =", "export function renderEnemy")
        func_str = func_str.replace("const drawWeapon =", "export function drawWeapon")
        func_str = func_str.replace("const drawHUD =", "export function drawHUD")
        func_str = func_str.replace("const renderDebugView =", "export function renderDebugView")
        
        # Remove the arrow "=>" and fix syntax for function definition
        func_str = re.sub(r"=\s*\((.*?)\)\s*=>", r"(\1)", func_str)
        return replace_refs(func_str)

    output = """import { 
    Player, Enemy, Projectile, Pickup, Level, 
    castRay, getDistance, normalizeAngle, 
    WALL_COLORS, ENEMY_CONFIG, PICKUP_CONFIG, WEAPON_CONFIG,
    WeaponType, AmmoType
} from "@/lib/fps-engine";
import * as Sprites from "./Sprites";
import { shadeColor } from "./Sprites"; // Re-export from Sprites if needed

// Rendering Constants
const FOV = Math.PI / 3;

"""
    output += clean(render_debug) + "\n\n"
    output += clean(render_proj) + "\n\n"
    output += clean(render_pickup) + "\n\n"
    
    # We need to fix Sprites calls inside renderEnemy and drawWeapon
    enemy_code = clean(render_enemy)
    # Replace calls like drawImp(...) with Sprites.drawImp(...)
    enemy_code = re.sub(r"draw(Imp|Demon|Soldier|Cacodemon|Baron|Zombie|HellKnight|Cyberdemon)\(", r"Sprites.draw\1(", enemy_code)
    output += enemy_code + "\n\n"

    weapon_code = clean(draw_weapon)
    weapon_code = re.sub(r"draw(Fist|Chainsaw|Pistol|Shotgun|Chaingun)\(", r"Sprites.draw\1(", weapon_code)
    output += weapon_code + "\n\n"
    
    output += clean(draw_hud) + "\n\n"
    
    # Main Render Function
    main_render = clean(render_func)
    # The render function in source calls sub-functions. 
    output += main_render

    return output

def generate_game_loop_ts(content):
    """Generates engine/core/GameLoop.ts from fixedUpdate."""
    print("Generating GameLoop.ts...")
    
    fixed_update = extract_block(content, r"const fixedUpdate =")
    
    if fixed_update:
        # Convert to class method logic
        code = fixed_update
        code = replace_refs(code)
        # Remove the wrapper
        code = code.replace("const fixedUpdate = (dt: number) => {", "")
        code = code[:-1] # Remove closing brace
        
        # Fix imports of collision/logic
        body = code
    else:
        body = "// Could not extract fixedUpdate automatically."

    output = """import { 
    checkCollision, updateEnemyAI, getDistance, 
    PICKUP_CONFIG, PickupType, AmmoType, WeaponType, 
    LEVELS 
} from "@/lib/fps-engine";
import { soundManager } from "@/lib/sound-manager";

export class GameLoop {
    constructor(private state: any) {} // state should be typed as StateManager

    public update(dt: number) {
        const state = this.state;
        const player = state.player;
        const level = LEVELS[state.currentLevel];
        
        // --- Extracted Logic ---
        """ + body + """
        // -----------------------
    }
}
"""
    return output

def generate_input_system_ts():
    """Generates engine/core/InputSystem.ts."""
    print("Generating InputSystem.ts...")
    return """import { Settings } from "@/hooks/use-settings";

export class InputSystem {
    keys: Set<string> = new Set();
    mouseMovement: number = 0;
    mouseDown: boolean = false;
    
    constructor() {
        this.bindEvents();
    }

    private bindEvents() {
        if (typeof window === "undefined") return;

        window.addEventListener("keydown", (e) => {
            this.keys.add(e.key.toLowerCase());
        });

        window.addEventListener("keyup", (e) => {
            this.keys.delete(e.key.toLowerCase());
        });
        
        document.addEventListener("mousemove", (e) => {
             if (document.pointerLockElement) {
                this.mouseMovement += e.movementX;
             }
        });

        window.addEventListener("mousedown", () => this.mouseDown = true);
        window.addEventListener("mouseup", () => this.mouseDown = false);
    }

    public getRotationDelta(sensitivity: number): number {
        const delta = this.mouseMovement * sensitivity;
        this.mouseMovement = 0;
        return delta;
    }
    
    public isKeyDown(key: string): boolean {
        return this.keys.has(key);
    }
}
"""

def generate_state_manager_ts():
    """Generates engine/StateManager.ts."""
    print("Generating StateManager.ts...")
    return """import { Player, Enemy, Projectile, Pickup, WeaponType, AmmoType } from "@/lib/fps-engine";

export interface GameStateData {
    player: Player;
    enemies: Enemy[];
    projectiles: Projectile[];
    pickups: Pickup[];
    gameState: "mainMenu" | "playing" | "paused" | "dead" | "victory";
    currentLevel: number;
    shootFlash: number;
    hurtFlash: number;
    levelStats: { kills: number; totalKills: number };
    progress: { unlockedWeapons: Set<WeaponType> };
}

export class StateManager {
    public state: GameStateData;

    constructor() {
        this.reset();
    }

    reset() {
        this.state = {
            player: this.createInitialPlayer(),
            enemies: [],
            projectiles: [],
            pickups: [],
            gameState: "mainMenu",
            currentLevel: 0,
            shootFlash: 0,
            hurtFlash: 0,
            levelStats: { kills: 0, totalKills: 0 },
            progress: { unlockedWeapons: new Set([WeaponType.FIST, WeaponType.PISTOL]) }
        };
    }

    createInitialPlayer(): Player {
        return {
            x: 2, y: 2, angle: 0,
            health: 100, maxHealth: 100, armor: 0,
            ammo: { [AmmoType.BULLETS]: 50, [AmmoType.SHELLS]: 0 },
            weapon: WeaponType.PISTOL,
            bobPhase: 0, isMoving: false, isMeleeing: false, meleeFrame: 0
        };
    }
}
"""

def main():
    if not os.path.exists(SOURCE_FILE):
        print(f"Error: Source file {SOURCE_FILE} not found. Run this from the project root.")
        return

    with open(SOURCE_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    # Create Directory Structure
    ensure_dir(os.path.join(TARGET_DIR, "core"))
    ensure_dir(os.path.join(TARGET_DIR, "graphics"))

    # Generate Files
    files = {
        os.path.join(TARGET_DIR, "graphics/Sprites.ts"): generate_sprites_ts(content),
        os.path.join(TARGET_DIR, "graphics/Renderer.ts"): generate_renderer_ts(content),
        os.path.join(TARGET_DIR, "core/GameLoop.ts"): generate_game_loop_ts(content),
        os.path.join(TARGET_DIR, "core/InputSystem.ts"): generate_input_system_ts(),
        os.path.join(TARGET_DIR, "StateManager.ts"): generate_state_manager_ts(),
    }

    # Write Files
    for path, code in files.items():
        with open(path, "w", encoding="utf-8") as f:
            f.write(code)
        print(f"Created {path}")

    print("\nRefactoring extraction complete.")
    print("Next steps: Manually update imports in fps-game.tsx to use these new classes.")

if __name__ == "__main__":
    main()