import React from "react";
import { MenuButton } from "./MenuButton";

interface DeathScreenProps {
    levelName: string;
    kills: number;
    onRestart: () => void;
    onMainMenu: () => void;
}

export const DeathScreen: React.FC<DeathScreenProps> = ({
    levelName,
    kills,
    onRestart,
    onMainMenu
}) => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80">
            <h1 className="text-6xl font-bold text-black mb-4" style={{ fontFamily: "Impact, sans-serif" }}>
                YOU DIED
            </h1>
            <p className="text-red-200 text-xl mb-2">Level: {levelName}</p>
            <p className="text-red-200 text-xl mb-6">Kills this level: {kills}</p>
            <div className="flex flex-col gap-4 w-64">
                <MenuButton onClick={onRestart}>
                    RESTART LEVEL (R)
                </MenuButton>
                <MenuButton onClick={onMainMenu} variant="secondary">
                    MAIN MENU
                </MenuButton>
            </div>
            <p className="mt-4 text-red-300 text-sm">Your weapons from previous levels are preserved</p>
        </div>
    );
};
