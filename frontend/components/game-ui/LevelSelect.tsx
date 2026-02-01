import React from "react";
import { MenuButton } from "./MenuButton";
import { ScanlinesOverlay } from "./ScanlinesOverlay";
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-4 select-none overflow-y-auto">
            <ScanlinesOverlay />

            <div className="relative z-10 w-full max-w-5xl bg-black retro-border p-4 md:p-8 shadow-2xl overflow-y-auto max-h-[95vh] flex flex-col">
                <h2 className="retro-text text-[clamp(1.5rem,6vw,3.5rem)] text-red-600 mb-8 text-center tracking-tighter shrink-0" style={{ textShadow: "4px 4px 0px #300000" }}>
                    AWAITING ORDERS
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 overflow-y-auto pr-2 custom-scrollbar">
                    {levels.map((level, index) => {
                        const isUnlocked = savedProgress.unlockedLevels.has(index);
                        return (
                            <button
                                key={level.name}
                                type="button"
                                onClick={() => isUnlocked && onStartGame(index)}
                                disabled={!isUnlocked}
                                className={`
                                    relative p-4 md:p-6 retro-border text-left transition-all duration-75 group
                                    ${isUnlocked
                                        ? "bg-gray-900 hover:bg-red-900 hover:text-white cursor-pointer active:translate-y-1"
                                        : "bg-black text-gray-700 cursor-not-allowed border-gray-800"
                                    }
                                `}
                            >
                                <div className="flex justify-between items-start mb-2 md:mb-4">
                                    <span className={`retro-text text-2xl md:text-4xl font-bold ${isUnlocked ? "text-red-600 group-hover:text-white" : "text-gray-800"}`}>
                                        {(index + 1).toString().padStart(2, '0')}
                                    </span>
                                    {!isUnlocked && <span className="retro-text text-[8px] bg-gray-900 p-1 border border-gray-800">LOCKED</span>}
                                </div>

                                <span className={`retro-text text-[10px] md:text-xs font-bold block truncate ${isUnlocked ? "text-white" : "text-gray-600"}`}>
                                    {level.name.split(":")[1]?.trim() || level.name}
                                </span>

                                <div className={`mt-2 text-[8px] retro-text uppercase ${isUnlocked ? "text-gray-400 group-hover:text-red-200" : "text-gray-800"}`}>
                                    {isUnlocked ? "DEPLOY TO SECTOR" : "ACCESS DENIED"}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="w-full md:w-1/3 mx-auto shrink-0">
                    <MenuButton onClick={onBack} variant="secondary">
                        ABORT MISSION
                    </MenuButton>
                </div>
            </div>
        </div>
    );
};
