import React from "react";
import { ScanlinesOverlay } from "./ScanlinesOverlay";

interface EffectsLayerProps {
    hurtFlash: number; // 0 to >0 value
}

export const EffectsLayer: React.FC<EffectsLayerProps> = ({ hurtFlash }) => {
    return (
        <>
            <ScanlinesOverlay />

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
