"use client";
import React, { useEffect, useRef, useState } from "react";
import { GameEngine } from "@/engine/GameEngine";
import { LEVELS } from "@/lib/fps-engine";
import { SettingsMenu } from "./settings-menu";
import { useSettings } from "@/hooks/use-settings";

export default function FPSGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState("mainMenu");
  const { settings, setSettings } = useSettings();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Engine with callbacks for Game Over/Victory
    engineRef.current = new GameEngine(canvasRef.current, (event) => {
      setGameState(event);
      if (event === "dead" || event === "levelComplete") {
        document.exitPointerLock();
      }
    });

    return () => {
      if (canvasRef.current) {
        engineRef.current?.destroy(canvasRef.current);
      }
    };
  }, []);

  const startGame = (levelIdx: number) => {
    if (!engineRef.current) return;
    engineRef.current.state.loadLevel(levelIdx, settings.difficulty || "normal");
    engineRef.current.start();
    setGameState("playing");
    canvasRef.current?.requestPointerLock();
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-video">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain border-4 border-red-900 rounded-lg cursor-none"
        style={{ imageRendering: "pixelated" }}
      />

      {/* UI Overlays */}
      {gameState === "mainMenu" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-red-600 font-mono z-10">
          <h1 className="text-6xl font-bold mb-8 tracking-widest text-shadow-red">INFERNO</h1>
          <button onClick={() => startGame(0)} className="px-6 py-3 bg-red-700 text-white font-bold rounded hover:scale-105">
            NEW GAME
          </button>
          <button onClick={() => setGameState("settings")} className="mt-4 text-gray-400 hover:text-white">
            OPTIONS
          </button>
        </div>
      )}

      {gameState === "settings" && (
        <SettingsMenu
          onBack={() => setGameState("mainMenu")}
          settings={settings}
          setSettings={setSettings}
          // Add other props as needed
          unlockAllLevels={() => { }}
          unlockAllWeapons={() => { }}
          resetSettings={() => { }}
        />
      )}

      {gameState === "dead" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/50 text-white font-mono z-10">
          <h1 className="text-5xl font-bold mb-4">YOU DIED</h1>
          <button onClick={() => startGame(engineRef.current?.state.currentLevelIdx || 0)} className="bg-black px-4 py-2 border border-white">
            RESTART LEVEL
          </button>
        </div>
      )}
    </div>
  );
}