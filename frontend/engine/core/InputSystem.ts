import { Settings } from "@/hooks/use-settings";

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
