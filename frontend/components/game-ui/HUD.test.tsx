import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { HUD } from "./HUD";
import { AmmoType, EnemyType, LEVELS, WeaponType, type Enemy, type Player } from "@/lib/fps-engine";
import { drawDebugMinimap } from "@/engine/graphics/GameRenderer";

vi.mock("@/engine/graphics/GameRenderer", () => ({
    drawDebugMinimap: vi.fn(),
}));

describe("HUD minimap", () => {
    const level = LEVELS[0];

    const player: Player = {
        x: 1.5,
        y: 1.5,
        angle: 0,
        health: 100,
        maxHealth: 100,
        armor: 0,
        ammo: { [AmmoType.BULLETS]: 50, [AmmoType.SHELLS]: 10 },
        weapon: WeaponType.PISTOL,
        bobPhase: 0,
        isMoving: false,
        isMeleeing: false,
        meleeFrame: 0,
    };

    const enemies: Enemy[] = [
        {
            id: 1,
            type: EnemyType.IMP,
            x: 2,
            y: 2,
            health: 10,
            maxHealth: 10,
            speed: 0.1,
            damage: 5,
            state: "idle",
            animFrame: 0,
            lastAttack: 0,
            attackCooldown: 0,
            sightRange: 5,
            attackRange: 1,
            meleeRange: 0.5,
            isMelee: false,
            path: [],
            lastPathTime: 0,
            stuckFrameCount: 0,
            lastX: 2,
            lastY: 2,
        },
    ];

    const baseProps = {
        health: 100,
        armor: 50,
        ammo: { [AmmoType.BULLETS]: 50, [AmmoType.SHELLS]: 10 },
        weapon: WeaponType.PISTOL,
        kills: 3,
        levelName: "Test",
        weaponsUnlocked: new Set([WeaponType.FIST, WeaponType.PISTOL]),
        runLoot: { ore_red: 0, ore_green: 0 },
        credits: 100,
        level,
        player,
        enemies,
    };

    const setTransformMock = vi.fn();
    const mockContext = {
        setTransform: setTransformMock,
    } as unknown as CanvasRenderingContext2D;

    const originalDpr = window.devicePixelRatio;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(mockContext);
    });

    afterEach(() => {
        cleanup();
        Object.defineProperty(window, "devicePixelRatio", {
            configurable: true,
            value: originalDpr,
        });
        vi.restoreAllMocks();
    });

    it("renders minimap in desktop HUD and draws using canvas bounds", () => {
        vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({
            width: 220,
            height: 220,
            top: 0,
            left: 0,
            right: 220,
            bottom: 220,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        } as DOMRect);

        const { container } = render(<HUD {...baseProps} isMobile={false} />);
        const canvas = container.querySelector("canvas");

        expect(canvas).toBeTruthy();
        expect(drawDebugMinimap).toHaveBeenCalledWith(mockContext, level, player, enemies, 220, 220);
    });

    it("renders minimap in mobile HUD and applies DPR scaling", () => {
        Object.defineProperty(window, "devicePixelRatio", {
            configurable: true,
            value: 2,
        });
        vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({
            width: 120,
            height: 96,
            top: 0,
            left: 0,
            right: 120,
            bottom: 96,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        } as DOMRect);

        const { container } = render(<HUD {...baseProps} isMobile />);
        const canvas = container.querySelector("canvas") as HTMLCanvasElement;

        expect(canvas).toBeTruthy();
        expect(canvas.width).toBe(240);
        expect(canvas.height).toBe(192);
        expect(setTransformMock).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
        expect(drawDebugMinimap).toHaveBeenCalledWith(mockContext, level, player, enemies, 120, 96);
    });

    it("draws minimap correctly for wide and tall canvas aspect ratios", () => {
        const bounds = [
            { width: 320, height: 120 },
            { width: 120, height: 320 },
        ];
        const boundsSpy = vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect");

        for (const { width, height } of bounds) {
            boundsSpy.mockReturnValue({
                width,
                height,
                top: 0,
                left: 0,
                right: width,
                bottom: height,
                x: 0,
                y: 0,
                toJSON: () => ({}),
            } as DOMRect);

            const { unmount } = render(<HUD {...baseProps} isMobile={false} />);
            expect(drawDebugMinimap).toHaveBeenLastCalledWith(mockContext, level, player, enemies, width, height);
            unmount();
        }
    });
});
