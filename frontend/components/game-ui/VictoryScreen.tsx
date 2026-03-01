import React from "react";
import { MenuButton } from "./MenuButton";
import { ScanlinesOverlay } from "./ScanlinesOverlay";

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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-4 select-none pointer-events-auto">
            <ScanlinesOverlay />

            <div className="relative z-10 w-full max-w-lg p-6 bg-black retro-border text-center">
                <h2 className="retro-text text-3xl md:text-5xl text-yellow-500 mb-8 animate-pulse tracking-tight" style={{ textShadow: "4px 4px 0px #303000" }}>
                    VICTORY!
                </h2>

                <p className="retro-text text-white text-xs md:text-sm mb-8 leading-relaxed">
                    CONGRATULATIONS!
                    <br /><br />
                    YOU HAVE CONQUERED THE DUNGEON.
                </p>

                <div className="mb-8 space-y-2 retro-text text-xs text-green-400">
                    <p>TOTAL KILLS: {totalKills}</p>
                    <p>FINAL HEALTH: {Math.ceil(health)}%</p>
                </div>

                <div className="flex flex-col gap-4">
                    <MenuButton onClick={onPlayAgain}>
                        PLAY AGAIN
                    </MenuButton>
                    <MenuButton onClick={onMainMenu} variant="secondary">
                        RETURN TO MENU
                    </MenuButton>
                </div>
            </div>
        </div>
    );
};
