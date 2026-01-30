import React, { useEffect, useState } from "react";

interface EffectsLayerProps {
    hurtFlash: number; // 0 to >0 value
}

export const EffectsLayer: React.FC<EffectsLayerProps> = ({ hurtFlash }) => {
    const [glitchActive, setGlitchActive] = useState(false);

    // Random glitch effect
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.98) {
                setGlitchActive(true);
                setTimeout(() => setGlitchActive(false), 150);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div className="scanlines" />
            <div className="crt-vignette" />

            {/* Damage Pulse detected via prop or just CSS class trigger if needed, but here we use the prop to render a red overlay */}
            <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-75"
                style={{
                    backgroundColor: 'red',
                    opacity: Math.min(0.5, hurtFlash / 20),
                    boxShadow: hurtFlash > 0 ? "inset 0 0 100px 50px rgba(255, 0, 0, 0.5)" : "none"
                }}
            />

            {glitchActive && (
                <div className="pointer-events-none absolute inset-0 bg-white/5 mix-blend-overlay z-50">
                    <div className="absolute top-1/4 left-0 w-full h-2 bg-white/20" />
                    <div className="absolute bottom-1/3 left-0 w-full h-4 bg-white/10" />
                </div>
            )}
        </>
    );
};
