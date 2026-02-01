import React from "react";
import { MenuButton } from "./MenuButton";
import { ScanlinesOverlay } from "./ScanlinesOverlay";

interface LevelCompleteScreenProps {
    levelName: string;
    kills: number;
    health: number;
    isLastLevel: boolean;
    onNextLevel: () => void;
    onMainMenu: () => void;
}

export const LevelCompleteScreen: React.FC<LevelCompleteScreenProps> = ({
    levelName,
    kills,
    health,
    isLastLevel,
    onNextLevel,
    onMainMenu
}) => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 p-4 select-none overflow-hidden">
            <ScanlinesOverlay />

            <div className="relative z-10 w-full max-w-sm p-4 md:p-8 bg-black retro-border text-center flex flex-col h-full max-h-[85vh] justify-center">
                <h2 className="retro-text text-[clamp(1.5rem,6vw,3rem)] text-yellow-500 mb-8 animate-pulse tracking-tight shrink-0" style={{ textShadow: "4px 4px 0px #303000" }}>
                    LEVEL COMPLETE
                </h2>

                <div className="space-y-4 mb-10 text-white retro-text text-[clamp(10px,2.5vw,14px)]">
                    <p className="flex justify-between border-b border-gray-800 pb-2">KILLS: <span className="text-red-500">{kills}</span></p>
                    <p className="flex justify-between border-b border-gray-800 pb-2">HEALTH: <span className="text-green-500">{Math.ceil(health)}%</span></p>
                </div>

                <div className="flex flex-col gap-4 w-full shrink-0">
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
