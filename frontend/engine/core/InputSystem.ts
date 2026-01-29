export class InputSystem {
    keys = new Set<string>();
    mouseMovement = 0;
    mouseDown = false;

    private handleKeyDown = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        this.keys.add(key);
        // Prevent scrolling for game keys
        if ((key === " " || key === "f" || key.startsWith("arrow"))) {
            e.preventDefault();
        }
    };

    private handleKeyUp = (e: KeyboardEvent) => {
        this.keys.delete(e.key.toLowerCase());
    };

    private handleMouseMove = (e: MouseEvent) => {
        // Only track movement if pointer is locked
        if (document.pointerLockElement) {
            this.mouseMovement += e.movementX;
        }
    };

    private handleMouseDown = (e: MouseEvent) => {
        if (e.button === 0) this.mouseDown = true;
    };

    private handleMouseUp = (e: MouseEvent) => {
        if (e.button === 0) this.mouseDown = false;
    };

    attach(canvas: HTMLCanvasElement) {
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
        document.addEventListener("mousemove", this.handleMouseMove);
        canvas.addEventListener("mousedown", this.handleMouseDown);
        window.addEventListener("mouseup", this.handleMouseUp);
    }

    detach(canvas: HTMLCanvasElement) {
        window.removeEventListener("keydown", this.handleKeyDown);
        window.removeEventListener("keyup", this.handleKeyUp);
        document.removeEventListener("mousemove", this.handleMouseMove);
        canvas.removeEventListener("mousedown", this.handleMouseDown);
        window.removeEventListener("mouseup", this.handleMouseUp);
    }

    getAndResetMouseMovement(): number {
        const movement = this.mouseMovement;
        this.mouseMovement = 0;
        return movement;
    }

    resetKeys() {
        this.keys.clear();
        this.mouseDown = false;
    }
}