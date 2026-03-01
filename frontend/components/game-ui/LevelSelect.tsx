import React, { useState } from "react";
import { MenuButton } from "./MenuButton";
import { ScanlinesOverlay } from "./ScanlinesOverlay";
import { type Level, EnemyType } from "@/lib/fps-engine";

export interface SavedProgress {
    unlockedLevels: Set<number>;
    unlockedWeapons: Set<number>;
    highestLevel: number;
}

interface LevelSelectProps {
    levels: Level[];
    savedProgress: SavedProgress;
    onStartGame: (levelIndex: number) => void;
    onBack: () => void;
}

interface MissionInfo {
    hazard: number;
    hazardLabel: string;
    enemyCount: number;
    oreRedYield: number;
    oreGreenYield: number;
    sectorName: string;
}

function getMissionInfo(level: Level, index: number): MissionInfo {
    const enemies = level.enemies;
    const enemyCount = enemies.length;

    let oreRedYield = 0;
    let oreGreenYield = 0;
    let hazardScore = 0;

    for (const enemy of enemies) {
        if (enemy.type === EnemyType.IMP) {
            oreRedYield += 1;
            hazardScore += 1;
        } else if (enemy.type === EnemyType.DEMON) {
            oreGreenYield += 1;
            hazardScore += 2;
        } else if (enemy.type === EnemyType.ZOMBIE) {
            hazardScore += 1;
        } else if (enemy.type === EnemyType.SOLDIER) {
            hazardScore += 2;
        } else if (enemy.type === EnemyType.CACODEMON) {
            hazardScore += 3;
        } else if (enemy.type === EnemyType.HELLKNIGHT) {
            hazardScore += 4;
        } else if (enemy.type === EnemyType.BARON) {
            hazardScore += 5;
        } else if (enemy.type === EnemyType.CYBERDEMON) {
            hazardScore += 6;
        }
    }

    let hazard = 1;
    if (hazardScore >= 30) {
        hazard = 5;
    } else if (hazardScore >= 20) {
        hazard = 4;
    } else if (hazardScore >= 12) {
        hazard = 3;
    } else if (hazardScore >= 6) {
        hazard = 2;
    }

    const hazardLabels = ["MINIMAL", "LOW", "MODERATE", "HIGH", "EXTREME"];
    const sectorName = level.name.split(":")[1]?.trim() || level.name;

    return {
        hazard,
        hazardLabel: hazardLabels[hazard - 1],
        enemyCount,
        oreRedYield,
        oreGreenYield,
        sectorName,
    };
}

function getHazardColor(hazard: number): string {
    if (hazard >= 5) {
        return "text-red-500";
    }
    if (hazard >= 4) {
        return "text-orange-400";
    }
    if (hazard >= 3) {
        return "text-yellow-400";
    }
    if (hazard >= 2) {
        return "text-green-400";
    }
    return "text-gray-400";
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
    levels,
    savedProgress,
    onStartGame,
    onBack
}) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const selectedLevel = selectedIndex !== null ? levels[selectedIndex] : null;
    const selectedInfo = (selectedLevel && (selectedIndex !== null))
        ? getMissionInfo(selectedLevel, selectedIndex)
        : null;
    const isSelectedUnlocked = selectedIndex !== null && savedProgress.unlockedLevels.has(selectedIndex);

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-4 select-none pointer-events-auto">
            <ScanlinesOverlay />

            <div className="relative z-10 w-full max-w-5xl bg-black retro-border p-4 md:p-8 shadow-2xl overflow-y-auto max-h-full">
                <h2 className="retro-text text-3xl md:text-5xl text-red-600 mb-2 text-center tracking-tighter" style={{ textShadow: "4px 4px 0px #300000" }}>
                    EXPEDITION SELECT
                </h2>
                <p className="retro-text text-[9px] text-gray-500 text-center mb-6 tracking-widest">
                    SELECT A SECTOR FOR DEPLOYMENT
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Mission list */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {levels.map((level, index) => {
                            const isUnlocked = savedProgress.unlockedLevels.has(index);
                            const info = getMissionInfo(level, index);
                            const isSelected = selectedIndex === index;

                            return (
                                <button
                                    key={level.name}
                                    type="button"
                                    onClick={() => {
                                        if (isUnlocked) {
                                            setSelectedIndex(index);
                                        }
                                    }}
                                    className={`
                                        relative p-4 retro-border text-left transition-all duration-75
                                        ${!isUnlocked
                                            ? "bg-black text-gray-700 cursor-not-allowed border-gray-800 opacity-40"
                                            : isSelected
                                                ? "bg-red-950 border-red-600 cursor-pointer"
                                                : "bg-gray-950 hover:bg-gray-900 cursor-pointer active:translate-y-1"
                                        }
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`retro-text text-2xl font-bold ${isUnlocked ? (isSelected ? "text-red-400" : "text-red-600") : "text-gray-800"}`}>
                                            {(index + 1).toString().padStart(2, "0")}
                                        </span>
                                        {!isUnlocked && (
                                            <span className="retro-text text-[8px] bg-gray-900 p-1 border border-gray-800">LOCKED</span>
                                        )}
                                        {isUnlocked && (
                                            <span className={`retro-text text-[8px] ${getHazardColor(info.hazard)}`}>
                                                HAZARD {info.hazard}/5
                                            </span>
                                        )}
                                    </div>

                                    <p className={`retro-text text-xs font-bold truncate mb-1 ${isUnlocked ? "text-white" : "text-gray-700"}`}>
                                        {info.sectorName}
                                    </p>

                                    {isUnlocked && (
                                        <div className="flex gap-3 mt-2">
                                            {info.oreRedYield > 0 && (
                                                <span className="retro-text text-[8px] text-red-400">
                                                    RED ORE x{info.oreRedYield}
                                                </span>
                                            )}
                                            {info.oreGreenYield > 0 && (
                                                <span className="retro-text text-[8px] text-green-400">
                                                    GRN ORE x{info.oreGreenYield}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Briefing panel */}
                    <div className="retro-border bg-gray-950 p-4 flex flex-col justify-between min-h-[280px]">
                        {selectedInfo && (selectedIndex !== null) ? (
                            <>
                                <div>
                                    <p className="retro-text text-[10px] text-red-400 mb-3 tracking-widest">MISSION BRIEFING</p>

                                    <p className="retro-text text-lg text-white mb-1">{selectedInfo.sectorName}</p>
                                    <p className="retro-text text-[9px] text-gray-500 mb-4">SECTOR {(selectedIndex + 1).toString().padStart(2, "0")}</p>

                                    <div className="w-full h-px bg-gray-800 mb-3" />

                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4">
                                        <div>
                                            <p className="retro-text text-[8px] text-gray-500">HAZARD LEVEL</p>
                                            <p className={`retro-text text-sm ${getHazardColor(selectedInfo.hazard)}`}>
                                                {selectedInfo.hazardLabel}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="retro-text text-[8px] text-gray-500">HOSTILES</p>
                                            <p className="retro-text text-sm text-white">{selectedInfo.enemyCount}</p>
                                        </div>
                                        <div>
                                            <p className="retro-text text-[8px] text-gray-500">RED ORE YIELD</p>
                                            <p className="retro-text text-sm text-red-400">{selectedInfo.oreRedYield > 0 ? `x${selectedInfo.oreRedYield}` : "NONE"}</p>
                                        </div>
                                        <div>
                                            <p className="retro-text text-[8px] text-gray-500">GREEN ORE YIELD</p>
                                            <p className="retro-text text-sm text-green-400">{selectedInfo.oreGreenYield > 0 ? `x${selectedInfo.oreGreenYield}` : "NONE"}</p>
                                        </div>
                                    </div>
                                </div>

                                <MenuButton
                                    onClick={() => { if (isSelectedUnlocked) { onStartGame(selectedIndex); } }}
                                    variant="danger"
                                >
                                    DEPLOY
                                </MenuButton>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                                <p className="retro-text text-[10px] text-gray-600 tracking-widest">SELECT A SECTOR</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full md:w-1/3 mx-auto">
                    <MenuButton onClick={onBack} variant="secondary">
                        ABORT MISSION
                    </MenuButton>
                </div>
            </div>
        </div>
    );
};
