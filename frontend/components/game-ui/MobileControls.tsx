"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useSettings } from "@/hooks/use-settings";
import { Crosshair, Pause, ChevronLeft, ChevronRight } from "lucide-react";

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

    const handleJoystickStart = (e: React.PointerEvent) => {
        setIsMoving(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        updateJoystick(e);
    };

    const handleJoystickMove = (e: React.PointerEvent) => {
        if (!isMoving) return;
        updateJoystick(e);
    };

    const handleJoystickEnd = (e: React.PointerEvent) => {
        setIsMoving(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
        setJoystickPos({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 });
    };

    const updateJoystick = (e: React.PointerEvent) => {
        if (!joystickRef.current) return;
        const rect = joystickRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const pointerX = e.clientX;
        const pointerY = e.clientY;

        const dx = pointerX - centerX;
        const dy = pointerY - centerY;
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

    const handleLookStart = (e: React.PointerEvent) => {
        // Only grab the first pointer that touches this zone if we aren't already tracking one
        if (lookFingerId.current === null) {
            lookFingerId.current = e.pointerId;
            lastLookX.current = e.clientX;
            e.currentTarget.setPointerCapture(e.pointerId);
        }
    };

    const handleLookMove = (e: React.PointerEvent) => {
        if (lookFingerId.current === null || e.pointerId !== lookFingerId.current) return;

        const deltaX = e.clientX - lastLookX.current;
        onLook(deltaX); // Send delta to Game Loop
        lastLookX.current = e.clientX;
    };

    const handleLookEnd = (e: React.PointerEvent) => {
        if (lookFingerId.current === null || e.pointerId !== lookFingerId.current) return;

        lookFingerId.current = null;
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    return (
        <div
            className="fixed inset-0 z-50 pointer-events-none select-none touch-none"
        >
            {/* Full screen Look Zone */}
            {/* Covers the entire screen, sits behind buttons (z-auto or explicit lower z) */}
            <div
                data-testid="look-zone"
                className="absolute inset-0 pointer-events-auto opacity-0"
                onPointerDown={handleLookStart}
                onPointerMove={handleLookMove}
                onPointerUp={handleLookEnd}
                onPointerCancel={handleLookEnd}
            />

            {/* Movement Joystick (Left Side) */}
            <div
                className="absolute bottom-8 left-8 w-32 h-32 bg-white/10 rounded-full border-2 border-white/20 pointer-events-auto flex items-center justify-center"
                ref={joystickRef}
                onPointerDown={handleJoystickStart}
                onPointerMove={handleJoystickMove}
                onPointerUp={handleJoystickEnd}
                onPointerCancel={handleJoystickEnd}
            >
                <div
                    className="w-12 h-12 bg-white/40 rounded-full border-2 border-white/60 transition-transform duration-75"
                    style={{
                        transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`
                    }}
                />
            </div>

            {/* Fire Button (Right Side) */}
            <button
                aria-label="Fire"
                className="absolute bottom-8 right-24 w-24 h-24 bg-red-600/30 rounded-full border-4 border-red-600/50 pointer-events-auto flex items-center justify-center active:bg-red-600/60 active:scale-95 transition-all z-10"
                onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    onFire(true);
                }}
                onPointerUp={(e) => {
                    e.currentTarget.releasePointerCapture(e.pointerId);
                    onFire(false);
                }}
                onPointerCancel={(e) => {
                    e.currentTarget.releasePointerCapture(e.pointerId);
                    onFire(false);
                }}
            >
                <Crosshair className="w-12 h-12 text-white" />
            </button>

            {/* Top Bar (Pause & Weapons) */}
            <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                <button
                    aria-label="Pause Game"
                    className="w-12 h-12 bg-white/10 rounded-full border border-white/20 flex items-center justify-center pointer-events-auto active:bg-white/30"
                    onClick={onPause}
                >
                    <Pause className="w-6 h-6 text-white fill-current" />
                </button>

                <div className="flex gap-4 pointer-events-auto">
                    <button
                        aria-label="Previous Weapon"
                        className="w-12 h-12 bg-white/10 rounded border border-white/20 flex items-center justify-center active:bg-white/30"
                        onClick={onPrevWeapon}
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                        aria-label="Next Weapon"
                        className="w-12 h-12 bg-white/10 rounded border border-white/20 flex items-center justify-center active:bg-white/30"
                        onClick={onNextWeapon}
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};
