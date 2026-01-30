import React from "react";
import { useSettings } from "@/hooks/use-settings";

interface EffectsLayerProps {
    hurtFlash: number; // 0 to >0 value
}

export const EffectsLayer: React.FC<EffectsLayerProps> = ({ hurtFlash }) => {
    const { settings } = useSettings();

    const scanlineStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 50,
        background: `linear-gradient(to bottom, rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)`,
        backgroundSize: `100% ${settings.scanlineSize}px`,
    };

    return (
        <>
            {settings.scanlinesEnabled && <div style={scanlineStyle} />}

            {/* Damage flash overlay */}
            <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-75"
                style={{
                    backgroundColor: 'red',
                    opacity: Math.min(0.5, hurtFlash / 20),
                    boxShadow: hurtFlash > 0 ? "inset 0 0 100px 50px rgba(255, 0, 0, 0.5)" : "none"
                }}
            />
        </>
    );
};
