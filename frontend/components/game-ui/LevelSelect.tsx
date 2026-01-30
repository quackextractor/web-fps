import React from "react";
import { MenuButton } from "./MenuButton";
import { type Level } from "@/lib/fps-engine";

export interface SavedProgress {
    unlockedLevels: Set<number>;
    unlockedWeapons: Set<number>; // Using number for WeaponType enum
    highestLevel: number;
}

interface LevelSelectProps {
    levels: Level[];
    savedProgress: SavedProgress;
    onStartGame: (levelIndex: number) => void;
    onBack: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
    levels,
    savedProgress,
    onStartGame,
    onBack
}) => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black p-8">
            <h2 className="text-4xl font-bold text-red-500 mb-8" style={{ fontFamily: "Impact, sans-serif" }}>
                SELECT LEVEL
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-8">
                {levels.map((level, index) => {
                    const isUnlocked = savedProgress.unlockedLevels.has(index);
                    return (
                        <button
                            key={level.name}
                            type="button"
                            onClick={() => isUnlocked && onStartGame(index)}
                            disabled={!isUnlocked}
                            className={`w-48 h-32 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center ${isUnlocked
                                ? "bg-gray-800 border-red-600 hover:bg-gray-700 hover:border-red-400 cursor-pointer transform hover:scale-105"
                                : "bg-gray-900 border-gray-700 cursor-not-allowed opacity-50"
                                }`}
                        >
                            <span className="text-3xl font-bold text-red-500 mb-1">{index + 1}</span>
                            <span className="text-white text-sm font-bold">{level.name.split(":")[1]?.trim() || level.name}</span>
                            {!isUnlocked && <span className="text-gray-500 text-xs mt-1">LOCKED</span>}
                        </button>
                    );
                })}
            </div>

            <MenuButton onClick={onBack} variant="secondary">
                BACK
            </MenuButton>
        </div>
    );
};
