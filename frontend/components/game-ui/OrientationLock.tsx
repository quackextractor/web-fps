"use client";

import React, { useEffect, useState } from "react";

export const OrientationLock: React.FC = () => {
    const [isPortrait, setIsPortrait] = useState(false);

    useEffect(() => {
        const checkOrientation = () => {
            setIsPortrait(window.innerHeight > window.innerWidth);
        };

        checkOrientation();
        window.addEventListener("resize", checkOrientation);
        return () => window.removeEventListener("resize", checkOrientation);
    }, []);

    if (!isPortrait) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center text-white font-mono select-none pointer-events-auto">
            <div className="w-24 h-40 border-4 border-white rounded-xl mb-8 animate-bounce flex items-center justify-center relative">
                <div className="w-16 h-1 bg-white absolute bottom-4 rounded-full" />
                <div className="w-2 h-2 bg-white absolute top-4 rounded-full" />
            </div>

            <h2 className="text-2xl font-bold mb-4 retro-text text-red-600">PLEASE ROTATE DEVICE</h2>
            <p className="text-gray-400 max-w-xs">
                INFERNO is best played in LANDSCAPE mode.
                Please turn your phone/tablet to continue.
            </p>

            <div className="mt-8 flex gap-4">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-ping" />
                <div className="w-3 h-3 bg-red-600 rounded-full animate-ping delay-100" />
                <div className="w-3 h-3 bg-red-600 rounded-full animate-ping delay-200" />
            </div>
        </div>
    );
};
