import React, { useState, useEffect, useCallback } from "react";
import { GameSettings, DEFAULT_SETTINGS } from "@/hooks/use-settings";
import { useGameActions } from "@/context/GameActionContext";
import { MenuButton } from "./game-ui/MenuButton";
import { ScanlinesOverlay } from "./game-ui/ScanlinesOverlay";
import { ConfirmationModal } from "./game-ui/ConfirmationModal";

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
    const { clearRagdolls } = useGameActions();

    // Local state for pending changes
    const [localSettings, setLocalSettings] = useState<GameSettings>(settings);
    const [hasChanges, setHasChanges] = useState(false);
    const [showResetProgressModal, setShowResetProgressModal] = useState(false);

    // Sync local settings when props change (e.g., after reset)
    useEffect(() => {
        setLocalSettings(settings);
        setHasChanges(false);
    }, [settings]);

    const updateLocalSetting = useCallback(<K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    }, []);

    const updateLocalSettings = useCallback((partial: Partial<GameSettings>) => {
        setLocalSettings((prev) => ({ ...prev, ...partial }));
        setHasChanges(true);
    }, []);

    const handleSfxVolumeChange = useCallback((value: number) => {
        const isEnabled = value > 0;
        updateLocalSettings({ sfxVolume: value, soundEnabled: isEnabled });
    }, [updateLocalSettings]);

    const handleMusicVolumeChange = useCallback((value: number) => {
        const isEnabled = value > 0;
        updateLocalSettings({ musicVolume: value, musicEnabled: isEnabled });
    }, [updateLocalSettings]);

    const handleMusicToggle = useCallback((enabled: boolean) => {
        if (enabled) {
            const restoredVolume = localSettings.musicVolume > 0 ? localSettings.musicVolume : 0.5;
            updateLocalSettings({ musicEnabled: true, musicVolume: restoredVolume });
            return;
        }

        updateLocalSettings({ musicEnabled: false, musicVolume: 0 });
    }, [localSettings.musicVolume, updateLocalSettings]);

    const handleSfxToggle = useCallback((enabled: boolean) => {
        if (enabled) {
            const restoredVolume = localSettings.sfxVolume > 0 ? localSettings.sfxVolume : 0.5;
            updateLocalSettings({ soundEnabled: true, sfxVolume: restoredVolume });
            return;
        }

        updateLocalSettings({ soundEnabled: false, sfxVolume: 0 });
    }, [localSettings.sfxVolume, updateLocalSettings]);

    const applySettings = useCallback(() => {
        setSettings(localSettings);
        setHasChanges(false);
    }, [localSettings, setSettings]);

    const discardChanges = useCallback(() => {
        setLocalSettings(settings);
        setHasChanges(false);
        onBack();
    }, [settings, onBack]);

    const handleResetDefaults = useCallback(() => {
        setLocalSettings(DEFAULT_SETTINGS);
        setHasChanges(true);
    }, []);

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

    const KeyBinder = ({ label, keys, onBindingChange }: { label: string; keys: string[]; onBindingChange: (newKeys: string[]) => void }) => {
        const [isBinding, setIsBinding] = useState(false);

        useEffect(() => {
            if (!isBinding) return;

            const handleKeyDown = (e: KeyboardEvent) => {
                e.preventDefault();
                const key = e.key.toLowerCase();
                if (key === "escape") {
                    setIsBinding(false);
                    return;
                }

                // Toggle key in the array
                const newKeys = keys.includes(key)
                    ? keys.filter(k => k !== key)
                    : [...keys, key];

                onBindingChange(newKeys);
                setIsBinding(false);
            };

            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
        }, [isBinding, keys, onBindingChange]);

        return (
            <div className="flex items-center justify-between bg-gray-900 p-2 retro-border">
                <label className="text-white retro-text text-[10px] md:text-xs uppercase">{label}</label>
                <button
                    type="button"
                    onClick={() => setIsBinding(true)}
                    className={`min-w-[80px] px-2 py-1 retro-border text-[10px] retro-text transition-colors ${isBinding ? "bg-yellow-600 text-black border-white" : "bg-black text-gray-400 border-gray-700 hover:border-gray-500"}`}
                >
                    {isBinding ? "PRESS ANY KEY" : (keys?.join(" / ").toUpperCase() || "NONE")}
                </button>
            </div>
        );
    };

    return (
        <div className="fixed xl:absolute inset-0 flex flex-col items-center justify-start xl:justify-center bg-black p-2 xl:p-4 z-50 overflow-y-auto overflow-x-hidden select-none pointer-events-auto">
            <ScanlinesOverlay enabled={localSettings.scanlinesEnabled} size={localSettings.scanlineSize} />

            <div className="relative z-10 w-full max-w-4xl bg-black retro-border p-4 xl:p-6 shadow-2xl max-h-[calc(100dvh-1rem)] xl:max-h-[calc(100dvh-2rem)] overflow-y-auto">
                <h2 className="retro-text text-2xl xl:text-4xl text-red-600 mb-8 text-center tracking-tighter" style={{ textShadow: "4px 4px 0px #300000" }}>
                    OPTIONS
                    {hasChanges && <span className="text-yellow-500 text-sm ml-4">*</span>}
                </h2>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8 text-xs">
                    {/* Audio Section */}
                    <div className="space-y-4">
                        <h3 className="retro-text text-lg text-yellow-500 border-b-4 border-gray-800 pb-2 mb-4">AUDIO</h3>
                        <Slider
                            label="MASTER VOLUME"
                            value={localSettings.volume}
                            min={0}
                            max={1}
                            step={0.05}
                            onChange={(v) => updateLocalSetting("volume", v)}
                            format={(v) => `${Math.round(v * 100)}%`}
                        />
                        <Slider
                            label="SFX VOLUME"
                            value={localSettings.sfxVolume}
                            min={0}
                            max={1}
                            step={0.05}
                            onChange={handleSfxVolumeChange}
                            format={(v) => `${Math.round(v * 100)}%`}
                        />
                        <Toggle
                            label="SOUND EFFECTS"
                            value={localSettings.soundEnabled}
                            onChange={handleSfxToggle}
                        />
                        <Slider
                            label="MUSIC VOLUME"
                            value={localSettings.musicVolume}
                            min={0}
                            max={1}
                            step={0.05}
                            onChange={handleMusicVolumeChange}
                            format={(v) => `${Math.round(v * 100)}%`}
                        />
                        <Toggle
                            label="MUSIC"
                            value={localSettings.musicEnabled}
                            onChange={handleMusicToggle}
                        />
                    </div>

                    {/* Gameplay Section */}
                    <div className="space-y-4">
                        <h3 className="retro-text text-lg text-yellow-500 border-b-4 border-gray-800 pb-2 mb-4">GAMEPLAY</h3>
                        <Slider
                            label="SENSITIVITY"
                            value={localSettings.mouseSensitivity}
                            min={0.2}
                            max={3.0}
                            step={0.1}
                            onChange={(v) => updateLocalSetting("mouseSensitivity", v)}
                            format={(v) => `${v.toFixed(1)}x`}
                        />
                        <Slider
                            label="GAME SPEED"
                            value={localSettings.timeScale}
                            min={0.1}
                            max={3}
                            step={0.1}
                            onChange={(v) => updateLocalSetting("timeScale", v)}
                            format={(v) => `${v.toFixed(1)}x`}
                        />
                        <Slider
                            label="TURN SPEED"
                            value={localSettings.turnSpeed}
                            min={0.1}
                            max={3.0}
                            step={0.1}
                            onChange={(v) => updateLocalSetting("turnSpeed", v)}
                            format={(v) => `${v.toFixed(1)}x`}
                        />
                        <div className="flex flex-col gap-2 bg-gray-900 p-2 retro-border">
                            <label className="text-white retro-text text-xs">DIFFICULTY</label>
                            <div className="flex gap-2">
                                {(["easy", "normal", "hard"] as const).map((diff) => (
                                    <button
                                        key={diff}
                                        type="button"
                                        onClick={() => updateLocalSetting("difficulty", diff)}
                                        className={`flex-1 py-2 retro-text text-[10px] retro-border transition-colors uppercase ${localSettings.difficulty === diff
                                            ? "bg-red-600 text-white border-white"
                                            : "bg-black text-gray-500 border-gray-700 hover:border-gray-500"
                                            }`}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Toggle
                            label="RAGDOLLS"
                            value={localSettings.ragdollEnabled}
                            onChange={(v) => updateLocalSetting("ragdollEnabled", v)}
                        />
                        {localSettings.ragdollEnabled && (
                            <Slider
                                label="GORE MULTIPLIER"
                                value={localSettings.ragdollMultiplier}
                                min={1}
                                max={20}
                                step={1}
                                onChange={(v) => updateLocalSetting("ragdollMultiplier", v)}
                                format={(v) => `${v}x`}
                            />
                        )}
                        <Toggle
                            label="AUTO-CLEAR"
                            value={localSettings.ragdollAutoClear}
                            onChange={(v) => updateLocalSetting("ragdollAutoClear", v)}
                        />
                        <button
                            type="button"
                            onClick={clearRagdolls}
                            className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white retro-text text-[10px] retro-border transition-colors uppercase mt-2"
                        >
                            CLEAR ALL PARTS
                        </button>
                    </div>

                    {/* Display Section */}
                    <div className="space-y-4">
                        <h3 className="retro-text text-lg text-yellow-500 border-b-4 border-gray-800 pb-2 mb-4">DISPLAY</h3>
                        <div className="flex flex-col gap-2 bg-gray-900 p-2 retro-border">
                            <label className="text-white retro-text text-xs">RESOLUTION</label>
                            <select
                                value={localSettings.resolution}
                                onChange={(e) => updateLocalSetting("resolution", e.target.value as any)}
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
                            label="SCANLINES"
                            value={localSettings.scanlinesEnabled}
                            onChange={(v) => updateLocalSetting("scanlinesEnabled", v)}
                        />
                        {localSettings.scanlinesEnabled && (
                            <Slider
                                label="SCANLINE SIZE"
                                value={localSettings.scanlineSize}
                                min={2}
                                max={8}
                                step={1}
                                onChange={(v) => updateLocalSetting("scanlineSize", v)}
                                format={(v) => `${v}px`}
                            />
                        )}
                        <Toggle
                            label="SMOOTHING"
                            value={localSettings.imageSmoothingEnabled}
                            onChange={(v) => updateLocalSetting("imageSmoothingEnabled", v)}
                        />
                        <Toggle
                            label="FULLSCREEN"
                            value={localSettings.fullscreen}
                            onChange={(v) => updateLocalSetting("fullscreen", v)}
                        />
                        <Toggle
                            label="SHOW FPS"
                            value={localSettings.showFPS}
                            onChange={(v) => updateLocalSetting("showFPS", v)}
                        />
                        <div className="flex flex-col gap-2 bg-gray-900 p-2 retro-border">
                            <label className="text-white retro-text text-xs">CROSSHAIR</label>
                            <div className="flex gap-2">
                                {(["cross", "dot", "circle"] as const).map((style) => (
                                    <button
                                        key={style}
                                        type="button"
                                        onClick={() => updateLocalSetting("crosshairStyle", style)}
                                        className={`flex-1 py-2 retro-text text-[10px] retro-border transition-colors uppercase ${localSettings.crosshairStyle === style
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
                        {process.env.NODE_ENV !== 'production' && (
                            <Toggle
                                label="DEBUG MODE (P)"
                                value={localSettings.debugMode}
                                onChange={(v) => updateLocalSetting("debugMode", v)}
                            />
                        )}
                        <Toggle
                            label="FORCE MOBILE CONTROLS"
                            value={localSettings.forceMobileControls}
                            onChange={(v) => updateLocalSetting("forceMobileControls", v)}
                        />

                        <h3 className="retro-text text-lg text-yellow-500 border-b-4 border-gray-800 pb-2 mb-4 mt-8">DATA</h3>
                        <button
                            type="button"
                            onClick={() => setShowResetProgressModal(true)}
                            className="w-full py-3 bg-red-900/50 hover:bg-red-600 hover:text-white text-red-200 retro-text text-[10px] retro-border transition-colors uppercase"
                        >
                            CLEAR PROGRESS
                        </button>

                        <h3 className="retro-text text-lg text-yellow-500 border-b-4 border-gray-800 pb-2 mb-4 mt-8 uppercase">MOBILE</h3>
                        <Slider
                            label="TOUCH SENSITIVITY"
                            value={localSettings.touchSensitivity}
                            min={0.5}
                            max={5.0}
                            step={0.1}
                            onChange={(v) => updateLocalSetting("touchSensitivity", v)}
                            format={(v) => `${v.toFixed(1)}x`}
                        />
                        <Toggle
                            label="AUTO-FIRE"
                            value={localSettings.autoFire}
                            onChange={(v) => updateLocalSetting("autoFire", v)}
                        />
                        <Toggle
                            label="INVERT LOOK"
                            value={localSettings.invertLook}
                            onChange={(v) => updateLocalSetting("invertLook", v)}
                        />
                    </div>

                    {/* Controls Section */}
                    <div className="md:col-span-2 mt-8">
                        <h3 className="retro-text text-lg text-yellow-500 border-b-4 border-gray-800 pb-2 mb-4 uppercase">CONTROLS</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <KeyBinder
                                label="FORWARD"
                                keys={localSettings.controls?.forward}
                                onBindingChange={(k) => updateLocalSetting("controls", { ...localSettings.controls, forward: k })}
                            />
                            <KeyBinder
                                label="BACKWARD"
                                keys={localSettings.controls?.backward}
                                onBindingChange={(k) => updateLocalSetting("controls", { ...localSettings.controls, backward: k })}
                            />
                            <KeyBinder
                                label="STRAFE LEFT"
                                keys={localSettings.controls?.strafeLeft}
                                onBindingChange={(k) => updateLocalSetting("controls", { ...localSettings.controls, strafeLeft: k })}
                            />
                            <KeyBinder
                                label="STRAFE RIGHT"
                                keys={localSettings.controls?.strafeRight}
                                onBindingChange={(k) => updateLocalSetting("controls", { ...localSettings.controls, strafeRight: k })}
                            />
                            <KeyBinder
                                label="TURN LEFT"
                                keys={localSettings.controls?.left}
                                onBindingChange={(k) => updateLocalSetting("controls", { ...localSettings.controls, left: k })}
                            />
                            <KeyBinder
                                label="TURN RIGHT"
                                keys={localSettings.controls?.right}
                                onBindingChange={(k) => updateLocalSetting("controls", { ...localSettings.controls, right: k })}
                            />
                            <KeyBinder
                                label="ATTACK"
                                keys={localSettings.controls?.attack}
                                onBindingChange={(k) => updateLocalSetting("controls", { ...localSettings.controls, attack: k })}
                            />
                            <KeyBinder
                                label="RESTART"
                                keys={localSettings.controls?.restart}
                                onBindingChange={(k) => updateLocalSetting("controls", { ...localSettings.controls, restart: k })}
                            />
                            <KeyBinder
                                label="PAUSE / CANCEL"
                                keys={localSettings.controls?.pause}
                                onBindingChange={(k) => updateLocalSetting("controls", { ...localSettings.controls, pause: k })}
                            />
                        </div>
                    </div>
                </div>

                <ConfirmationModal
                    isOpen={showResetProgressModal}
                    title="CLEAR PROGRESS?"
                    message="Are you sure you want to clear your game progress? This cannot be undone."
                    onConfirm={() => {
                        clearProgress();
                        setShowResetProgressModal(false);
                    }}
                    onCancel={() => setShowResetProgressModal(false)}
                    confirmText="CLEAR ALL"
                    cancelText="CANCEL"
                />

                <div className="mt-8 flex flex-col md:flex-row items-center gap-4 border-t-4 border-gray-800 pt-6">
                    <div className="w-full md:w-1/3">
                        <MenuButton onClick={handleResetDefaults} variant="danger">
                            RESET DEFAULTS
                        </MenuButton>
                    </div>
                    <div className="w-full md:w-1/3">
                        <MenuButton onClick={applySettings} variant="primary">
                            APPLY
                        </MenuButton>
                    </div>
                    <div className="w-full md:w-1/3">
                        <MenuButton onClick={discardChanges} variant="secondary">
                            {hasChanges ? "CANCEL" : "BACK"}
                        </MenuButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
