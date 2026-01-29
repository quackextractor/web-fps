"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { GameEngine } from "@/engine/GameEngine"; // The Refactored Engine
import { LEVELS, WeaponType } from "@/lib/fps-engine";
import { SettingsMenu } from "./settings-menu";
import { useSettings } from "@/hooks/use-settings";
import { usePointerLock } from "@/hooks/use-pointer-lock";


type GameState = "mainMenu" | "levelSelect" | "settings" | "playing" | "paused" | "dead" | "victory" | "levelComplete";


interface SavedProgress {
  unlockedLevels: Set<number>;
  unlockedWeapons: Set<WeaponType>;
  highestLevel: number;
}

export default function FPSGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // UI State
  const [gameState, setGameState] = useState<GameState>("mainMenu");
  const [previousGameState, setPreviousGameState] = useState<GameState>("mainMenu");

  // Settings Hook
  const { settings, setSettings, updateSetting, resetSettings, isLoaded } = useSettings();

  // Persistence State
  const [savedProgress, setSavedProgress] = useState<SavedProgress>({
    unlockedLevels: new Set(),
    unlockedWeapons: new Set([WeaponType.FIST, WeaponType.PISTOL]),
    highestLevel: 0,
  });

  // Pointer Lock Hook
  const { lock, unlock, isLocked } = usePointerLock(canvasRef as React.RefObject<HTMLElement>, gameState === "playing");

  // --- Engine Initialization ---
  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize the engine with a callback for game events
    engineRef.current = new GameEngine(canvasRef.current, (event) => {
      if (event === "levelComplete") {
        handleLevelComplete();
      } else if (event === "dead") {
        setGameState("dead");
        unlock();
      } else if (event === "victory") {
        setGameState("victory");
        unlock();
      }
    });

    return () => {
      if (canvasRef.current) {
        engineRef.current?.destroy(canvasRef.current);
      }
    };
  }, []);

  // --- Settings Synchronization ---
  // Push React settings into the Vanilla JS Engine whenever they change
  useEffect(() => {
    if (!engineRef.current || !isLoaded) return;

    // Update Engine Settings
    engineRef.current.mouseSensitivity = settings.mouseSensitivity;
    engineRef.current.turnSpeed = settings.turnSpeed;

    // Update Renderer Settings (if renderer exposes them, or via subsequent render calls)
    // Note: The GameEngine loop passes settings to render() every frame.

    // Update Resolution
    if (canvasRef.current) {
      const [w, h] = settings.resolution.split("x").map(Number);
      engineRef.current.renderer.resize(w, h);
    }
  }, [settings, isLoaded]);

  // --- Persistence Logic ---
  useEffect(() => {
    const saved = localStorage.getItem("doom-savegame");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedProgress({
          unlockedLevels: new Set(parsed.unlockedLevels),
          unlockedWeapons: new Set(parsed.unlockedWeapons),
          highestLevel: parsed.highestLevel
        });
      } catch (e) {
        console.error("Failed to load savegame", e);
      }
    }
  }, []);

  useEffect(() => {
    const toSave = {
      unlockedLevels: Array.from(savedProgress.unlockedLevels),
      unlockedWeapons: Array.from(savedProgress.unlockedWeapons),
      highestLevel: savedProgress.highestLevel
    };
    localStorage.setItem("doom-savegame", JSON.stringify(toSave));
  }, [savedProgress]);

  // --- Game Control Actions ---

  const startGame = useCallback((levelIdx: number) => {
    if (!engineRef.current) return;

    // Load level into engine
    engineRef.current.state.loadLevel(levelIdx, settings.difficulty);

    // Sync unlocked weapons from save to engine state
    engineRef.current.state.unlockedWeapons = new Set(savedProgress.unlockedWeapons);

    engineRef.current.start();
    setGameState("playing");
    lock();
  }, [settings.difficulty, savedProgress.unlockedWeapons, lock]);

  const resumeGame = () => {
    engineRef.current?.start();
    setGameState("playing");
    lock();
  };

  const restartLevel = useCallback(() => {
    if (!engineRef.current) return;
    // Reload current level index
    const currentIdx = engineRef.current.state.currentLevelIdx;
    startGame(currentIdx);
  }, [startGame]);

  const handleLevelComplete = () => {
    if (!engineRef.current) return;

    const currentIdx = engineRef.current.state.currentLevelIdx;
    const nextIdx = currentIdx + 1;

    // Update Progress
    setSavedProgress(prev => {
      const newUnlocked = new Set(prev.unlockedLevels);
      newUnlocked.add(nextIdx);

      // Capture weapons found during level
      const currentWeapons = engineRef.current!.state.unlockedWeapons;
      const newWeapons = new Set([...prev.unlockedWeapons, ...currentWeapons]);

      return {
        unlockedLevels: newUnlocked,
        unlockedWeapons: newWeapons,
        highestLevel: Math.max(prev.highestLevel, nextIdx)
      };
    });

    if (nextIdx < LEVELS.length) {
      setGameState("levelComplete");
    } else {
      setGameState("victory");
    }
    unlock();
    engineRef.current.stop();
  };

  const nextLevel = () => {
    if (!engineRef.current) return;
    const nextIdx = engineRef.current.state.currentLevelIdx + 1;
    if (nextIdx < LEVELS.length) {
      startGame(nextIdx);
    }
  };

  const unlockAllLevels = useCallback(() => {
    setSavedProgress(prev => ({
      ...prev,
      unlockedLevels: new Set(LEVELS.map((_, i) => i)),
      highestLevel: LEVELS.length - 1,
    }));
  }, []);

  const unlockAllWeapons = useCallback(() => {
    const allWeapons = new Set([
      WeaponType.FIST, WeaponType.CHAINSAW, WeaponType.PISTOL,
      WeaponType.SHOTGUN, WeaponType.CHAINGUN
    ]);
    setSavedProgress(prev => ({ ...prev, unlockedWeapons: allWeapons }));
  }, []);

  // --- Global Key Listeners (UI only) ---
  // The Engine handles WASD/Shooting. We handle ESC here.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === "escape") {
        if (gameState === "playing") {
          engineRef.current?.stop();
          setGameState("paused");
          unlock();
        } else if (gameState === "paused") {
          resumeGame();
        } else if (gameState === "settings") {
          setGameState(previousGameState);
        } else if (gameState === "levelSelect") {
          setGameState("mainMenu");
        }
      }

      // Debug toggle
      if (key === "p") {
        updateSetting("debugMode", !settings.debugMode);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, previousGameState, settings.debugMode, updateSetting, unlock]);

  // --- Helper UI Components ---
  const MenuButton = ({ onClick, children, variant = "primary" }: any) => {
    const baseClasses = "w-full px-6 py-3 text-lg font-bold rounded transition-all duration-200 transform hover:scale-105 active:scale-95";
    const variantClasses = {
      primary: "bg-red-700 hover:bg-red-600 text-white border-2 border-red-500",
      secondary: "bg-gray-700 hover:bg-gray-600 text-white border-2 border-gray-500",
      danger: "bg-yellow-600 hover:bg-yellow-500 text-black border-2 border-yellow-400",
    };
    // @ts-ignore
    return <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]}`}>{children}</button>;
  };

  // --- Render ---
  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-video shadow-2xl bg-black">
      {/* 
          THE CANVAS 
          Rendered by GameEngine -> Renderer.ts 
      */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain border-4 border-red-900 rounded-lg cursor-none block"
        style={{ imageRendering: "pixelated" }}
        // Click to capture mouse if playing but lost focus
        onMouseDown={() => {
          if (gameState === "playing" && !isLocked) lock();
        }}
      />

      {/* --- UI OVERLAYS --- */}

      {/* Main Menu */}
      {gameState === "mainMenu" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-red-600 font-mono z-10 backdrop-blur-sm">
          <h1 className="text-6xl font-bold mb-8 tracking-widest text-shadow-red animate-pulse">INFERNO</h1>
          <h2 className="text-xl text-gray-400 mb-8 tracking-widest">DESCENT INTO DARKNESS</h2>

          <div className="flex flex-col gap-4 w-64">
            <MenuButton onClick={() => startGame(0)}>NEW GAME</MenuButton>
            <MenuButton variant="secondary" onClick={() => setGameState("levelSelect")}>SELECT LEVEL</MenuButton>
            <MenuButton variant="secondary" onClick={() => {
              setPreviousGameState("mainMenu");
              setGameState("settings");
            }}>OPTIONS</MenuButton>
          </div>

          <div className="mt-8 text-gray-500 text-xs font-mono text-center">
            WASD - Move | Mouse - Look | Click - Shoot<br />
            1-5 - Weapons | ESC - Pause
          </div>
        </div>
      )}

      {/* Level Select */}
      {gameState === "levelSelect" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white font-mono z-10 p-8">
          <h2 className="text-4xl font-bold mb-8 text-red-600">SELECT LEVEL</h2>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {LEVELS.map((level, index) => {
              const isUnlocked = savedProgress.unlockedLevels.has(index);
              return (
                <button
                  key={level.name}
                  onClick={() => isUnlocked && startGame(index)}
                  disabled={!isUnlocked}
                  className={`w-40 h-24 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${isUnlocked
                      ? "bg-gray-800 border-red-600 hover:bg-gray-700 hover:scale-105"
                      : "bg-gray-900 border-gray-800 opacity-50 cursor-not-allowed"
                    }`}
                >
                  <span className="text-2xl font-bold">{index + 1}</span>
                  <span className="text-xs">{level.name.split(":")?.trim() || level.name}</span>
                  {!isUnlocked && <span className="text-xs text-red-500 mt-1">LOCKED</span>}
                </button>
              );
            })}
          </div>
          <div className="w-64">
            <MenuButton variant="secondary" onClick={() => setGameState("mainMenu")}>BACK</MenuButton>
          </div>
        </div>
      )}

      {/* Settings Menu */}
      {gameState === "settings" && (
        <div className="absolute inset-0 bg-black/95 z-20 overflow-y-auto">
          <SettingsMenu
            onBack={() => setGameState(previousGameState)}
            settings={settings}
            setSettings={setSettings}
            unlockAllLevels={unlockAllLevels}
            unlockAllWeapons={unlockAllWeapons}
            resetSettings={resetSettings}
          />
        </div>
      )}

      {/* Pause Menu */}
      {gameState === "paused" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white font-mono z-10">
          <h2 className="text-5xl font-bold mb-8 text-red-600 tracking-widest">PAUSED</h2>
          <div className="flex flex-col gap-4 w-72">
            <MenuButton onClick={resumeGame}>RESUME</MenuButton>
            <MenuButton variant="secondary" onClick={() => {
              setPreviousGameState("paused");
              setGameState("settings");
            }}>OPTIONS</MenuButton>
            <MenuButton variant="secondary" onClick={restartLevel}>RESTART LEVEL</MenuButton>
            <MenuButton variant="danger" onClick={() => setGameState("mainMenu")}>EXIT TO MAIN MENU</MenuButton>
          </div>
        </div>
      )}

      {/* Death Screen */}
      {gameState === "dead" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/40 backdrop-blur-md text-white font-mono z-10">
          <h2 className="text-6xl font-bold mb-4 text-red-500 text-shadow-black">YOU DIED</h2>
          <p className="mb-8 text-xl">Level: {LEVELS[engineRef.current?.state.currentLevelIdx || 0]?.name}</p>
          <div className="flex flex-col gap-4 w-64">
            <MenuButton onClick={restartLevel}>RESTART LEVEL (R)</MenuButton>
            <MenuButton variant="secondary" onClick={() => setGameState("mainMenu")}>MAIN MENU</MenuButton>
          </div>
        </div>
      )}

      {/* Level Complete */}
      {gameState === "levelComplete" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-900/30 backdrop-blur-md text-white font-mono z-10">
          <h2 className="text-5xl font-bold mb-6 text-green-500">LEVEL COMPLETE!</h2>
          <div className="mb-8 text-center">
            <p className="text-2xl">{LEVELS[engineRef.current?.state.currentLevelIdx || 0]?.name}</p>
            <p className="text-gray-300 mt-2">
              Kills: {engineRef.current?.state.kills}
            </p>
          </div>
          <div className="flex flex-col gap-4 w-72">
            <MenuButton onClick={nextLevel}>NEXT LEVEL</MenuButton>
            <MenuButton variant="secondary" onClick={() => setGameState("mainMenu")}>MAIN MENU</MenuButton>
          </div>
        </div>
      )}

      {/* Victory Screen */}
      {gameState === "victory" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white font-mono z-10">
          <h2 className="text-6xl font-bold mb-6 text-yellow-500 animate-bounce">VICTORY!</h2>
          <p className="text-2xl mb-8">You have conquered the Inferno.</p>
          <p className="mb-8 text-gray-400">Total Kills: {engineRef.current?.state.totalKills}</p>
          <div className="w-64">
            <MenuButton onClick={() => setGameState("mainMenu")}>MAIN MENU</MenuButton>
          </div>
        </div>
      )}
    </div>
  );
}