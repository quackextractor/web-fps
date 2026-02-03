"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useSettings } from "@/hooks/use-settings";

interface TouchPosition {
    x: number;
    y: number;
}

interface MobileControlsProps {
    onMove: (vector: { x: number; y: number }) => void;
    onLook: (delta: number) => void;
    onFire: (firing: boolean) => void;
    onPause: () => void;
    onNextWeapon: () => void;
    onPrevWeapon: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
    onMove,
    onLook,
    onFire,
    onPause,
    onNextWeapon,
    onPrevWeapon
}) => {
    const joystickRef = useRef<HTMLDivElement>(null);
    const [joystickPos, setJoystickPos] = useState<TouchPosition>({ x: 0, y: 0 });
    const [isMoving, setIsMoving] = useState(false);

    const lookFingerId = useRef<number | null>(null);
    const lastLookX = useRef<number>(0);
    const { settings } = useSettings();

    const handleJoystickStart = (e: React.TouchEvent) => {
        setIsMoving(true);
        updateJoystick(e);
    };

    const handleJoystickMove = (e: React.TouchEvent) => {
        if (!isMoving) return;
        updateJoystick(e);
    };

    const handleJoystickEnd = () => {
        setIsMoving(false);
        setJoystickPos({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 });
    };

    const updateJoystick = (e: React.TouchEvent) => {
        if (!joystickRef.current) return;
        const rect = joystickRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const touch = e.touches[0];

        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = rect.width / 2;

        const normalizedDist = Math.min(distance, maxDist);
        const angle = Math.atan2(dy, dx);

        const x = (Math.cos(angle) * normalizedDist) / maxDist;
        const y = (Math.sin(angle) * normalizedDist) / maxDist;

        setJoystickPos({
            x: Math.cos(angle) * normalizedDist,
            y: Math.sin(angle) * normalizedDist
        });

        onMove({ x, y: -y }); // Invert Y for forward movement
    };

    const handleLookStart = (e: React.TouchEvent) => {
        // Only grab the first finger that touches this zone if we aren't already tracking one
        if (lookFingerId.current === null) {
            const touch = e.changedTouches[0];
            lookFingerId.current = touch.identifier;
            lastLookX.current = touch.clientX;
        }
    };

    const handleLookMove = (e: React.TouchEvent) => {
        if (lookFingerId.current === null) return;

        // Find the specific finger we are tracking
        const touch = Array.from(e.changedTouches).find(t => t.identifier === lookFingerId.current);

        if (touch) {
            const deltaX = touch.clientX - lastLookX.current;
            onLook(deltaX); // Send delta to Game Loop
            lastLookX.current = touch.clientX;
        }
    };

    const handleLookEnd = (e: React.TouchEvent) => {
        if (lookFingerId.current === null) return;

        const touch = Array.from(e.changedTouches).find(t => t.identifier === lookFingerId.current);
        if (touch) {
            lookFingerId.current = null;
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 pointer-events-none select-none touch-none"
        >
            {/* RIGHT: Swipe Look Zone (NEW) */}
            {/* Covers right half, sits behind buttons (z-auto or explicit lower z) */}
            <div
                data-testid="look-zone"
                className="absolute top-0 right-0 w-1/2 h-full pointer-events-auto opacity-0"
                onTouchStart={handleLookStart}
                onTouchMove={handleLookMove}
                onTouchEnd={handleLookEnd}
            />

            {/* Movement Joystick (Left Side) */}
            <div
                className="absolute bottom-8 left-8 w-32 h-32 bg-white/10 rounded-full border-2 border-white/20 pointer-events-auto flex items-center justify-center"
                ref={joystickRef}
                onTouchStart={handleJoystickStart}
                onTouchMove={handleJoystickMove}
                onTouchEnd={handleJoystickEnd}
            >
                <div
                    className="w-12 h-12 bg-white/40 rounded-full border-2 border-white/60 transition-transform duration-75"
                    style={{
                        transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`
                    }}
                />
            </div>

            {/* Fire Button (Right Side) */}
            <div
                className="absolute bottom-8 right-24 w-24 h-24 bg-red-600/30 rounded-full border-4 border-red-600/50 pointer-events-auto flex items-center justify-center active:bg-red-600/60 active:scale-95 transition-all z-10"
                onTouchStart={() => onFire(true)}
                onTouchEnd={() => onFire(false)}
            >
                <span className="text-white font-bold text-xl uppercase tracking-tighter">FIRE</span>
            </div>

            {/* Top Bar (Pause & Weapons) */}
            <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                <button
                    className="w-12 h-12 bg-white/10 rounded-full border border-white/20 flex items-center justify-center pointer-events-auto active:bg-white/30"
                    onClick={onPause}
                >
                    <span className="text-white text-xl">⏸</span>
                </button>

                <div className="flex gap-4 pointer-events-auto">
                    <button
                        className="px-4 py-2 bg-white/10 rounded border border-white/20 active:bg-white/30"
                        onClick={onPrevWeapon}
                    >
                        <span className="text-white text-xs font-bold font-mono">PREV</span>
                    </button>
                    <button
                        className="px-4 py-2 bg-white/10 rounded border border-white/20 active:bg-white/30"
                        onClick={onNextWeapon}
                    >
                        <span className="text-white text-xs font-bold font-mono">NEXT</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
