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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-900/80">
            <h1 className="text-5xl font-bold text-yellow-400 mb-4" style={{ fontFamily: "Impact, sans-serif" }}>
                LEVEL COMPLETE!
            </h1>
            <p className="text-blue-200 text-xl mb-2">{levelName}</p>
            <p className="text-green-400 text-lg mb-6">Kills: {kills} | Health: {Math.ceil(health)}%</p>
            <div className="flex flex-col gap-4 w-64">
                <MenuButton onClick={onNextLevel}>
                    {!isLastLevel ? "NEXT LEVEL (E)" : "FINAL VICTORY"}
                </MenuButton>
                <MenuButton onClick={onMainMenu} variant="secondary">
                    MAIN MENU
                </MenuButton>
            </div>
        </div>
    );
};
