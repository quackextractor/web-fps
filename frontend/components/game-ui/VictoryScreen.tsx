import React from "react";
import { MenuButton } from "./MenuButton";

interface VictoryScreenProps {
    totalKills: number;
    health: number;
    onPlayAgain: () => void;
    onMainMenu: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
    totalKills,
    health,
    onPlayAgain,
    onMainMenu
}) => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-green-900/80 to-black/90">
            <h1 className="text-6xl font-bold text-yellow-400 mb-4" style={{ fontFamily: "Impact, sans-serif" }}>
                VICTORY!
            </h1>
            <p className="text-green-200 text-xl mb-2">All levels completed!</p>
            <p className="text-green-300 text-lg mb-2">Total Kills: {totalKills}</p>
            <p className="text-green-300 text-lg mb-8">Final Health: {Math.ceil(health)}%</p>
            <div className="flex flex-col gap-4 w-64">
                <MenuButton onClick={onPlayAgain}>
                    PLAY AGAIN
                </MenuButton>
                <MenuButton onClick={onMainMenu} variant="secondary">
                    MAIN MENU
                </MenuButton>
            </div>
        </div>
    );
};
