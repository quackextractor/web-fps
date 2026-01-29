import { useState, useEffect, useCallback } from "react";

export interface GameSettings {
    mouseSensitivity: number;
    soundEnabled: boolean;
    musicEnabled: boolean;
    volume: number;
    showFPS: boolean;
    crosshairStyle: "cross" | "dot" | "circle";
    difficulty: "easy" | "normal" | "hard";
    timeScale: number;
    debugMode: boolean;
    resolution: "320x240" | "640x480" | "800x600" | "1024x768" | "1280x720" | "1366x768" | "1600x900" | "1920x1080" | "2560x1440";
    fullscreen: boolean;
    turnSpeed: number;
}

export const DEFAULT_SETTINGS: GameSettings = {
    mouseSensitivity: 1,
    soundEnabled: true,
    musicEnabled: true,
    volume: 0.5,
    showFPS: false,
    crosshairStyle: "cross",
    difficulty: "normal",
    timeScale: 1.0,
    debugMode: false,
    resolution: "800x600",
    fullscreen: false,
    turnSpeed: 1.0,
};

const STORAGE_KEY = "doom-settings";

export function useSettings() {
    const [settings, setSettingsState] = useState<GameSettings>(DEFAULT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge with default to ensure new fields are present
                setSettingsState({ ...DEFAULT_SETTINGS, ...parsed });
            }
        } catch (e) {
            console.warn("Failed to load settings from localStorage", e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save to localStorage whenever settings change
    const setSettings = useCallback((newSettings: GameSettings) => {
        setSettingsState(newSettings);
        if (typeof window !== "undefined") {
            try {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
            } catch (e) {
                console.warn("Failed to save settings to localStorage", e);
            }
        }
    }, []);

    const updateSetting = useCallback(<K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
        setSettingsState((prev) => {
            const next = { ...prev, [key]: value };
            if (typeof window !== "undefined") {
                try {
                    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                } catch (e) {
                    console.warn("Failed to save settings to localStorage", e);
                }
            }
            return next;
        });
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
    }, [setSettings]);

    return {
        settings,
        setSettings,
        updateSetting,
        resetSettings,
        isLoaded,
    };
}
