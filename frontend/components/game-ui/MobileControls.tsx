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
    onInteract: () => void;
    onNextWeapon: () => void;
    onPrevWeapon: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
    onMove,
    onLook,
    onFire,
    onInteract,
    onNextWeapon,
    onPrevWeapon
}) => {
    const joystickRef = useRef<HTMLDivElement>(null);
    const [joystickPos, setJoystickPos] = useState<TouchPosition>({ x: 0, y: 0 });
    const [isMoving, setIsMoving] = useState(false);

    const lastLookX = useRef<number | null>(null);
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

    const handleLookMove = (e: React.TouchEvent) => {
        // Find the touch that is NOT the joystick touch (if any)
        const touches = Array.from(e.touches);
        const lookTouch = touches.find(t => t.clientX > window.innerWidth / 2);

        if (lookTouch) {
            if (lastLookX.current !== null) {
                const deltaX = lookTouch.clientX - lastLookX.current;
                onLook(deltaX);
            }
            lastLookX.current = lookTouch.clientX;
        } else {
            lastLookX.current = null;
        }
    };

    const handleLookEnd = (e: React.TouchEvent) => {
        const touches = Array.from(e.touches);
        const lookTouch = touches.find(t => t.clientX > window.innerWidth / 2);
        if (!lookTouch) {
            lastLookX.current = null;
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 pointer-events-none select-none touch-none"
            onTouchMove={handleLookMove}
            onTouchEnd={handleLookEnd}
        >
            {/* Movement Joystick (Left Side) */}
            <div
                className="absolute bottom-12 left-12 w-32 h-32 bg-white/10 rounded-full border-2 border-white/20 pointer-events-auto flex items-center justify-center"
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
                className="absolute bottom-12 right-12 w-24 h-24 bg-red-600/30 rounded-full border-4 border-red-600/50 pointer-events-auto flex items-center justify-center active:bg-red-600/60 active:scale-95 transition-all"
                onTouchStart={() => onFire(true)}
                onTouchEnd={() => onFire(false)}
            >
                <span className="text-white font-bold text-xl uppercase tracking-tighter">FIRE</span>
            </div>

            {/* Weapon Switch & Interact (Top Right Side) */}
            <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-4 pointer-events-auto">
                <button
                    className="p-4 bg-white/10 rounded-lg border border-white/20 active:bg-white/30"
                    onClick={onNextWeapon}
                >
                    <span className="text-white text-sm font-bold">NEXT</span>
                </button>
                <button
                    className="p-4 bg-white/10 rounded-lg border border-white/20 active:bg-white/30"
                    onClick={onPrevWeapon}
                >
                    <span className="text-white text-sm font-bold">PREV</span>
                </button>
                <button
                    className="p-4 bg-yellow-600/30 rounded-lg border border-yellow-600/50 active:bg-yellow-600/60"
                    onClick={onInteract}
                >
                    <span className="text-white text-sm font-bold">USE</span>
                </button>
            </div>
        </div>
    );
};
