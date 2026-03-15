import React from "react";
import { MenuButton } from "./MenuButton";
import { ScanlinesOverlay } from "./ScanlinesOverlay";

interface LevelCompleteScreenProps {
    levelName: string;
    kills: number;
    health: number;
    oreRed?: number;
    oreGreen?: number;
    creditBonus?: number;
    isLastLevel: boolean;
    onNextLevel: () => void;
    onMainMenu: () => void;
}

export const LevelCompleteScreen: React.FC<LevelCompleteScreenProps> = ({
    levelName,
    kills,
    health,
    oreRed = 0,
    oreGreen = 0,
    creditBonus = 0,
    isLastLevel,
    onNextLevel,
    onMainMenu
}) => {
    return (
        <div className="fixed md:absolute inset-0 flex flex-col items-center justify-center bg-black overflow-y-auto overflow-x-hidden p-0 md:p-4 select-none pointer-events-auto">
            <ScanlinesOverlay />

            <div className="relative z-10 w-full max-w-lg my-4 p-3 sm:p-6 bg-black retro-border text-center">
                <h2 className="retro-text text-xl sm:text-3xl md:text-5xl text-yellow-500 mb-4 sm:mb-8 animate-pulse tracking-tight" style={{ textShadow: "2px 2px 0px #303000" }}>
                    LEVEL COMPLETE
                </h2>

                <div className="space-y-2 mb-4 sm:mb-8 text-white retro-text text-[10px] sm:text-sm md:text-base">
                    <p>KILLS: <span className="text-red-500">{kills}</span></p>
                    <p>HEALTH: <span className="text-green-500">{Math.ceil(health)}%</span></p>
                </div>

                {(oreRed > 0 || oreGreen > 0 || creditBonus > 0) && (
                    <div className="retro-border bg-gray-950 p-3 sm:p-4 mb-4 sm:mb-8">
                        <p className="retro-text text-[10px] sm:text-xs text-gray-400 mb-2 tracking-widest">LOOT SECURED (100%)</p>
                        {oreRed > 0 && (
                            <p className="retro-text text-[10px] sm:text-sm text-red-400">RED ORE: +{oreRed}</p>
                        )}
                        {oreGreen > 0 && (
                            <p className="retro-text text-[10px] sm:text-sm text-emerald-400">GREEN ORE: +{oreGreen}</p>
                        )}
                        {creditBonus > 0 && (
                            <p className="retro-text text-[10px] sm:text-sm text-yellow-400 mt-1">CLEAR BONUS: +${creditBonus}</p>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-2 sm:gap-4">
                    <MenuButton onClick={onNextLevel}>
                        {!isLastLevel ? "NEXT LEVEL" : "FINAL VICTORY"}
                    </MenuButton>
                    <MenuButton onClick={onMainMenu} variant="secondary">
                        MAIN MENU
                    </MenuButton>
                </div>
            </div>
        </div>
    );
};
