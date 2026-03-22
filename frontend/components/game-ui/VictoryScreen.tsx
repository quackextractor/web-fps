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
        <div className="fixed xl:absolute inset-0 flex flex-col items-center justify-center bg-black overflow-y-auto overflow-x-hidden p-0 xl:p-4 select-none pointer-events-auto">
            <ScanlinesOverlay />

            <div className="relative z-10 w-full max-w-lg my-4 p-3 sm:p-6 bg-black retro-border text-center">
                <h2 className="retro-text text-xl sm:text-3xl xl:text-5xl text-yellow-500 mb-4 sm:mb-8 animate-pulse tracking-tight" style={{ textShadow: "2px 2px 0px #303000" }}>
                    VICTORY!
                </h2>

                <p className="retro-text text-white text-[10px] sm:text-xs xl:text-sm mb-4 sm:mb-8 leading-relaxed">
                    CONGRATULATIONS!
                    <br /><br />
                    YOU HAVE CONQUERED THE DUNGEON.
                </p>

                <div className="mb-4 sm:mb-8 space-y-2 retro-text text-[10px] sm:text-xs text-green-400">
                    <p>TOTAL KILLS: {totalKills}</p>
                    <p>FINAL HEALTH: {Math.ceil(health)}%</p>
                </div>

                <div className="flex flex-col gap-2 sm:gap-4">
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
