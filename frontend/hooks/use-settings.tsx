"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

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
    imageSmoothingEnabled: boolean;
    scanlinesEnabled: boolean;
    scanlineSize: number;
    ragdollEnabled: boolean;
    ragdollMultiplier: number;
    ragdollAutoClear: boolean;
    controls: ControlScheme;
    touchSensitivity: number;
    autoFire: boolean;
    invertLook: boolean;
    forceMobileControls: boolean;
}

export interface ControlScheme {
    forward: string[];
    backward: string[];
    left: string[];
    right: string[];
    strafeLeft: string[];
    strafeRight: string[];
    attack: string[];
    weapon1: string[];
    weapon2: string[];
    weapon3: string[];
    weapon4: string[];
    weapon5: string[];
    pause: string[];
    nextWeapon: string[];
    prevWeapon: string[];
    restart: string[];
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
    resolution: "320x240",
    fullscreen: false,
    turnSpeed: 1.0,
    imageSmoothingEnabled: false,
    scanlinesEnabled: true,
    scanlineSize: 2,
    ragdollEnabled: true,
    ragdollMultiplier: 1,
    ragdollAutoClear: true,
    controls: {
        forward: ["w", "arrowup"],
        backward: ["s", "arrowdown"],
        left: ["q", "arrowleft"],
        right: ["e", "arrowright"],
        strafeLeft: ["a"],
        strafeRight: ["d"],
        attack: [" ", "f"],
        weapon1: ["1"],
        weapon2: ["2"],
        weapon3: ["3"],
        weapon4: ["4"],
        weapon5: ["5"],
        pause: ["escape", "control"],
        nextWeapon: ["]", "="],
        prevWeapon: ["[", "-"],
        restart: ["r"],
    },
    touchSensitivity: 2.0,
    autoFire: false,
    invertLook: false,
    forceMobileControls: false,
};

const STORAGE_KEY = "doom-settings";

interface SettingsContextType {
    settings: GameSettings;
    setSettings: (settings: GameSettings) => void;
    updateSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
    resetSettings: () => void;
    isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

interface SettingsProviderProps {
    children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
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
                // We do a manual deep merge for controls to be safe
                const merged = {
                    ...DEFAULT_SETTINGS,
                    ...parsed,
                    controls: {
                        ...DEFAULT_SETTINGS.controls,
                        ...(parsed.controls || {})
                    }
                };
                setSettingsState(merged);
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

    return (
        <SettingsContext.Provider value={{ settings, setSettings, updateSetting, resetSettings, isLoaded }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}
