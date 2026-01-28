import React from "react";
import { GameSettings, useSettings } from "@/hooks/use-settings";

interface SettingsMenuProps {
    onBack: () => void;
    settings: GameSettings;
    setSettings: (settings: GameSettings) => void;
    unlockAllLevels: () => void;
    unlockAllWeapons: () => void;
}

export function SettingsMenu({
    onBack,
    settings,
    setSettings,
    unlockAllLevels,
    unlockAllWeapons,
}: SettingsMenuProps) {
    const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
        setSettings({ ...settings, [key]: value });
    };

    const MenuButton = ({ onClick, children, variant = "primary" }: { onClick: () => void; children: React.ReactNode; variant?: "primary" | "secondary" | "danger" }) => {
        const baseClasses = "w-full px-6 py-3 text-lg font-bold rounded transition-all duration-200 transform hover:scale-105 active:scale-95";
        const variantClasses = {
            primary: "bg-red-700 hover:bg-red-600 text-white border-2 border-red-500",
            secondary: "bg-gray-700 hover:bg-gray-600 text-white border-2 border-gray-500",
            danger: "bg-yellow-600 hover:bg-yellow-500 text-black border-2 border-yellow-400",
        };
        return (
            <button type="button" onClick={onClick} className={`${baseClasses} ${variantClasses[variant]}`}>
                {children}
            </button>
        );
    };

    const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (val: boolean) => void }) => (
        <div className="flex items-center justify-between bg-gray-800 p-3 rounded border border-gray-700">
            <label className="text-white font-bold">{label}</label>
            <button
                type="button"
                onClick={() => onChange(!value)}
                className={`w-12 h-6 rounded-full transition-colors relative ${value ? "bg-red-600" : "bg-gray-600"}`}
            >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${value ? "left-7" : "left-1"}`} />
            </button>
        </div>
    );

    const Slider = ({ label, value, min, max, step, onChange, format = (v) => v.toString() }: { label: string; value: number; min: number; max: number; step: number; onChange: (val: number) => void; format?: (v: number) => string }) => (
        <div className="flex flex-col gap-2 bg-gray-800 p-3 rounded border border-gray-700">
            <div className="flex justify-between">
                <label className="text-white font-bold">{label}</label>
                <span className="text-gray-400 text-sm">{format(value)}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
            />
        </div>
    );

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black p-4 z-50 overflow-y-auto">
            <div className="w-full max-w-2xl bg-black/80 border-2 border-red-900 rounded-lg p-6 shadow-2xl backdrop-blur-sm">
                <h2 className="text-5xl font-bold text-red-500 mb-8 text-center" style={{ fontFamily: "Impact, sans-serif" }}>
                    OPTIONS
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Audio Section */}
                    <div className="space-y-4">
                        <h3 className="text-xl text-yellow-500 font-bold border-b border-gray-700 pb-2">AUDIO</h3>
                        <Slider
                            label="Master Volume"
                            value={settings.volume}
                            min={0}
                            max={1}
                            step={0.05}
                            onChange={(v) => updateSetting("volume", v)}
                            format={(v) => `${Math.round(v * 100)}%`}
                        />
                        <Toggle
                            label="Sound Effects"
                            value={settings.soundEnabled}
                            onChange={(v) => updateSetting("soundEnabled", v)}
                        />
                        <Toggle
                            label="Music (Coming Soon)"
                            value={settings.musicEnabled}
                            onChange={(v) => updateSetting("musicEnabled", v)}
                        />
                    </div>

                    {/* Gameplay Section */}
                    <div className="space-y-4">
                        <h3 className="text-xl text-yellow-500 font-bold border-b border-gray-700 pb-2">GAMEPLAY</h3>
                        <Slider
                            label="Mouse Sensitivity"
                            value={settings.mouseSensitivity}
                            min={0.2}
                            max={3.0}
                            step={0.1}
                            onChange={(v) => updateSetting("mouseSensitivity", v)}
                            format={(v) => `${v.toFixed(1)}x`}
                        />
                        <Slider
                            label="Game Speed"
                            value={settings.timeScale}
                            min={0.1}
                            max={3}
                            step={0.1}
                            onChange={(v) => updateSetting("timeScale", v)}
                            format={(v) => `${v.toFixed(1)}x`}
                        />
                        <div className="flex flex-col gap-2 bg-gray-800 p-3 rounded border border-gray-700">
                            <label className="text-white font-bold">Difficulty</label>
                            <div className="flex gap-2">
                                {(["easy", "normal", "hard"] as const).map((diff) => (
                                    <button
                                        key={diff}
                                        type="button"
                                        onClick={() => updateSetting("difficulty", diff)}
                                        className={`flex-1 py-1 rounded font-bold text-sm transition-colors ${settings.difficulty === diff
                                            ? "bg-red-600 text-white"
                                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                            }`}
                                    >
                                        {diff.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Display The Section */}
                    <div className="space-y-4">
                        <h3 className="text-xl text-yellow-500 font-bold border-b border-gray-700 pb-2">DISPLAY</h3>
                        <div className="flex flex-col gap-2 bg-gray-800 p-3 rounded border border-gray-700">
                            <label className="text-white font-bold">Resolution</label>
                            <select
                                value={settings.resolution}
                                onChange={(e) => updateSetting("resolution", e.target.value as any)}
                                className="bg-gray-900 text-white p-2 rounded border border-gray-600"
                            >
                                <option value="640x480">640x480 (Performance)</option>
                                <option value="800x600">800x600 (Classic)</option>
                                <option value="1024x768">1024x768 (High)</option>
                                <option value="1280x720">1280x720 (HD)</option>
                            </select>
                        </div>
                        <Toggle
                            label="Fullscreen"
                            value={settings.fullscreen}
                            onChange={(v) => updateSetting("fullscreen", v)}
                        />
                        <Toggle
                            label="Show FPS"
                            value={settings.showFPS}
                            onChange={(v) => updateSetting("showFPS", v)}
                        />
                        <div className="flex flex-col gap-2 bg-gray-800 p-3 rounded border border-gray-700">
                            <label className="text-white font-bold">Crosshair</label>
                            <div className="flex gap-2">
                                {(["cross", "dot", "circle"] as const).map((style) => (
                                    <button
                                        key={style}
                                        type="button"
                                        onClick={() => updateSetting("crosshairStyle", style)}
                                        className={`flex-1 py-1 rounded font-bold text-sm transition-colors ${settings.crosshairStyle === style
                                            ? "bg-red-600 text-white"
                                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                            }`}
                                    >
                                        {style.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cheats Section */}
                    <div className="space-y-4">
                        <h3 className="text-xl text-yellow-500 font-bold border-b border-gray-700 pb-2">CHEATS</h3>
                        <button
                            type="button"
                            onClick={unlockAllLevels}
                            className="w-full py-2 bg-gray-700 hover:bg-yellow-600 hover:text-black text-white font-bold rounded transition-colors border border-gray-600"
                        >
                            UNLOCK ALL LEVELS
                        </button>
                        <button
                            type="button"
                            onClick={unlockAllWeapons}
                            className="w-full py-2 bg-gray-700 hover:bg-yellow-600 hover:text-black text-white font-bold rounded transition-colors border border-gray-600"
                        >
                            UNLOCK ALL WEAPONS
                        </button>
                        <Toggle
                            label="Debug Mode (P)"
                            value={settings.debugMode}
                            onChange={(v) => updateSetting("debugMode", v)}
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <div className="w-1/2">
                        <MenuButton onClick={onBack} variant="secondary">
                            BACK TO MENU
                        </MenuButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
