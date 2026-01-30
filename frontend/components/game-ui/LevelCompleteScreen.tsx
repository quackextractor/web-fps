import React from "react";
import { MenuButton } from "./MenuButton";

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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-4 select-none">
            <div className="scanlines" />

            <div className="relative z-10 w-full max-w-lg p-6 bg-black retro-border text-center">
                <h2 className="retro-text text-3xl md:text-5xl text-yellow-500 mb-8 animate-pulse tracking-tight" style={{ textShadow: "4px 4px 0px #303000" }}>
                    LEVEL COMPLETE
                </h2>

                <div className="space-y-4 mb-8 text-white retro-text text-sm md:text-base">
                    <p>KILLS: <span className="text-red-500">{kills}</span></p>
                    <p>HEALTH: <span className="text-green-500">{Math.ceil(health)}%</span></p>
                </div>

                <div className="flex flex-col gap-4">
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
