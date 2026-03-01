import React from "react";
import { useSettings } from "@/hooks/use-settings";

interface ScanlinesOverlayProps {
    /** Override the enabled state (e.g., for live preview in settings menu) */
    enabled?: boolean;
    /** Override the scanline size (e.g., for live preview in settings menu) */
    size?: number;
}

/**
 * ScanlinesOverlay - A reusable scanlines effect that respects user settings.
 * Can be used in any component (menus, gameplay, etc.)
 * Pass optional props to override settings for live preview.
 */
export const ScanlinesOverlay: React.FC<ScanlinesOverlayProps> = ({ enabled, size }) => {
    const { settings } = useSettings();

    // Use prop overrides if provided, otherwise fall back to settings
    const isEnabled = enabled !== undefined ? enabled : settings.scanlinesEnabled;
    const scanlineSize = size !== undefined ? size : settings.scanlineSize;

    if (!isEnabled) {
        return null;
    }

    const scanlineStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 50,
        background: `linear-gradient(to bottom, rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)`,
        backgroundSize: `100% ${scanlineSize}px`,
    };

    return <div style={scanlineStyle} />;
};
