import React from "react";
import { GameSettings } from "@/hooks/use-settings";

interface SettingsMenuProps {
    onBack: () => void;
    settings: GameSettings;
    setSettings: (settings: GameSettings) => void;
    unlockAllLevels: () => void;
    unlockAllWeapons: () => void;
}

import { MenuButton } from "./game-ui/MenuButton";

interface SettingsMenuProps {
    onBack: () => void;
    settings: GameSettings;
    setSettings: (settings: GameSettings) => void;
    unlockAllLevels: () => void;
    unlockAllWeapons: () => void;
    resetSettings: () => void;
    clearProgress: () => void;
}

export function SettingsMenu({
    onBack,
    settings,
    setSettings,
    unlockAllLevels,
    unlockAllWeapons,
    resetSettings,
    clearProgress,
}: SettingsMenuProps) {
    const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
        setSettings({ ...settings, [key]: value });
    };

    const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (val: boolean) => void }) => (
        <div className="flex items-center justify-between bg-gray-900 p-2 retro-border">
            <label className="text-white retro-text text-xs md:text-sm">{label}</label>
            <button
                type="button"
                onClick={() => onChange(!value)}
                className={`w-8 h-8 flex items-center justify-center retro-border transition-colors ${value ? "bg-red-600" : "bg-black"}`}
            >
                {value && <div className="w-4 h-4 bg-white" />}
            </button>
        </div>
    );

    const Slider = ({ label, value, min, max, step, onChange, format = (v) => v.toString() }: { label: string; value: number; min: number; max: number; step: number; onChange: (val: number) => void; format?: (v: number) => string }) => (
        <div className="flex flex-col gap-2 bg-gray-900 p-2 retro-border">
            <div className="flex justify-between items-end">
                <label className="text-white retro-text text-xs md:text-sm">{label}</label>
                <span className="text-yellow-500 retro-text text-xs">{format(value)}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full accent-red-600 cursor-pointer h-4 bg-black border border-gray-600 appearance-none"
            />
        </div>
    );

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-4 z-50 overflow-y-auto select-none">
            <div className="scanlines" />

            <div className="relative z-10 w-full max-w-4xl bg-black retro-border p-4 md:p-6 shadow-2xl h-full md:h-auto overflow-y-auto">
                <h2 className="retro-text text-2xl md:text-4xl text-red-600 mb-8 text-center tracking-tighter" style={{ textShadow: "4px 4px 0px #300000" }}>
                    OPTIONS
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-xs">
                    {/* Audio Section */}
                    <div className="space-y-4">
                        <h3 className="retro-text text-lg text-yellow-500 border-b-4 border-gray-800 pb-2 mb-4">AUDIO</h3>
                        <Slider
                            label="MASTER VOLUME"
                            value={settings.volume}
                            min={0}
                            max={1}
                            step={0.05}
                            onChange={(v) => updateSetting("volume", v)}
                            format={(v) => `${Math.round(v * 100)}%`}
                        />
                        <Toggle
                            label="SOUND EFFECTS"
                            value={settings.soundEnabled}
                            onChange={(v) => updateSetting("soundEnabled", v)}
                        />
                        <Toggle
                            label="MUSIC (SOON)"
                            value={settings.musicEnabled}
                            onChange={(v) => updateSetting("musicEnabled", v)}
                        />
                    </div>

                    {/* Gameplay Section */}
                    <div className="space-y-4">
                        <h3 className="retro-text text-lg text-yellow-500 border-b-4 border-gray-800 pb-2 mb-4">GAMEPLAY</h3>
                        <Slider
                            label="SENSITIVITY"
                            value={settings.mouseSensitivity}
                            min={0.2}
                            max={3.0}
                            step={0.1}
                            onChange={(v) => updateSetting("mouseSensitivity", v)}
                            format={(v) => `${v.toFixed(1)}x`}
                        />
                        <Slider
                            label="GAME SPEED"
                            value={settings.timeScale}
                            min={0.1}
                            max={3}
                            step={0.1}
                            onChange={(v) => updateSetting("timeScale", v)}
                            format={(v) => `${v.toFixed(1)}x`}
                        />
                        <Slider
                            label="TURN SPEED"
                            value={settings.turnSpeed}
                            min={0.1}
                            max={3.0}
                            step={0.1}
                            onChange={(v) => updateSetting("turnSpeed", v)}
                            format={(v) => `${v.toFixed(1)}x`}
                        />
                        <div className="flex flex-col gap-2 bg-gray-900 p-2 retro-border">
                            <label className="text-white retro-text text-xs">DIFFICULTY</label>
                            <div className="flex gap-2">
                                {(["easy", "normal", "hard"] as const).map((diff) => (
                                    <button
                                        key={diff}
                                        type="button"
                                        onClick={() => updateSetting("difficulty", diff)}
                                        className={`flex-1 py-2 retro-text text-[10px] retro-border transition-colors uppercase ${settings.difficulty === diff
                                            ? "bg-red-600 text-white border-white"
                                            : "bg-black text-gray-500 border-gray-700 hover:border-gray-500"
                                            }`}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Display The Section */}
                    <div className="space-y-4">
                        <h3 className="retro-text text-lg text-yellow-500 border-b-4 border-gray-800 pb-2 mb-4">DISPLAY</h3>
                        <div className="flex flex-col gap-2 bg-gray-900 p-2 retro-border">
                            <label className="text-white retro-text text-xs">RESOLUTION</label>
                            <select
                                value={settings.resolution}
                                onChange={(e) => updateSetting("resolution", e.target.value as any)}
                                className="bg-black text-white p-2 retro-border retro-text text-[10px] outline-none"
                            >
                                <option value="320x240">320x240 (ULTRA)</option>
                                <option value="640x480">640x480 (RETRO)</option>
                                <option value="800x600">800x600 (VGA)</option>
                                <option value="1024x768">1024x768 (XGA)</option>
                                <option value="1280x720">1280x720 (HD)</option>
                                <option value="1366x768">1366x768 (LAPTOP)</option>
                                <option value="1600x900">1600x900 (HD+)</option>
                                <option value="1920x1080">1920x1080 (FHD)</option>
                                <option value="2560x1440">2560x1440 (2K)</option>
                            </select>
                        </div>
                        <Toggle
                            label="SMOOTHING"
                            value={settings.imageSmoothingEnabled}
                            onChange={(v) => updateSetting("imageSmoothingEnabled", v)}
                        />
                        <Toggle
                            label="FULLSCREEN"
                            value={settings.fullscreen}
                            onChange={(v) => updateSetting("fullscreen", v)}
                        />
                        <Toggle
                            label="SHOW FPS"
                            value={settings.showFPS}
                            onChange={(v) => updateSetting("showFPS", v)}
                        />
                        <div className="flex flex-col gap-2 bg-gray-900 p-2 retro-border">
                            <label className="text-white retro-text text-xs">CROSSHAIR</label>
                            <div className="flex gap-2">
                                {(["cross", "dot", "circle"] as const).map((style) => (
                                    <button
                                        key={style}
                                        type="button"
                                        onClick={() => updateSetting("crosshairStyle", style)}
                                        className={`flex-1 py-2 retro-text text-[10px] retro-border transition-colors uppercase ${settings.crosshairStyle === style
                                            ? "bg-red-600 text-white border-white"
                                            : "bg-black text-gray-500 border-gray-700 hover:border-gray-500"
                                            }`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cheats & Data Section */}
                    <div className="space-y-4">
                        <h3 className="retro-text text-lg text-yellow-500 border-b-4 border-gray-800 pb-2 mb-4">CHEATS</h3>
                        <button
                            type="button"
                            onClick={unlockAllLevels}
                            className="w-full py-3 bg-gray-900 hover:bg-yellow-600 hover:text-black text-white retro-text text-[10px] retro-border transition-colors uppercase"
                        >
                            UNLOCK ALL LEVELS
                        </button>
                        <button
                            type="button"
                            onClick={unlockAllWeapons}
                            className="w-full py-3 bg-gray-900 hover:bg-yellow-600 hover:text-black text-white retro-text text-[10px] retro-border transition-colors uppercase"
                        >
                            UNLOCK ALL WEAPONS
                        </button>
                        <Toggle
                            label="DEBUG MODE (P)"
                            value={settings.debugMode}
                            onChange={(v) => updateSetting("debugMode", v)}
                        />

                        <h3 className="retro-text text-lg text-yellow-500 border-b-4 border-gray-800 pb-2 mb-4 mt-8">DATA</h3>
                        <button
                            type="button"
                            onClick={() => {
                                if (window.confirm("Are you sure you want to clear your game progress? This cannot be undone.")) {
                                    clearProgress();
                                }
                            }}
                            className="w-full py-3 bg-red-900/50 hover:bg-red-600 hover:text-white text-red-200 retro-text text-[10px] retro-border transition-colors uppercase"
                        >
                            CLEAR PROGRESS
                        </button>
                    </div>
                </div>

                <div className="mt-8 flex flex-col md:flex-row items-center gap-4 border-t-4 border-gray-800 pt-6">
                    <div className="w-full md:w-1/2">
                        <MenuButton onClick={resetSettings} variant="danger">
                            RESET DEFAULTS
                        </MenuButton>
                    </div>
                    <div className="w-full md:w-1/2">
                        <MenuButton onClick={onBack} variant="secondary">
                            BACK
                        </MenuButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
