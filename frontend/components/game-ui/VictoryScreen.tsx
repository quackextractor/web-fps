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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 p-4 select-none overflow-hidden">
            <ScanlinesOverlay />

            <div className="relative z-10 w-full max-w-sm p-4 md:p-8 bg-black retro-border text-center flex flex-col h-full max-h-[90vh] justify-center">
                <h2 className="retro-text text-[clamp(2rem,8vw,3.5rem)] text-yellow-500 mb-6 animate-pulse tracking-tight shrink-0" style={{ textShadow: "4px 4px 0px #303000" }}>
                    VICTORY!
                </h2>

                <p className="retro-text text-white text-[clamp(10px,2vw,12px)] mb-8 leading-relaxed opacity-80">
                    CONGRATULATIONS!
                    <br /><br />
                    YOU HAVE CONQUERED THE DUNGEON.
                </p>

                <div className="mb-10 space-y-3 retro-text text-[clamp(10px,2vw,12px)] text-green-400">
                    <p className="flex justify-between border-b border-green-900/30 pb-1">TOTAL KILLS: <span>{totalKills}</span></p>
                    <p className="flex justify-between border-b border-green-900/30 pb-1">FINAL HEALTH: <span>{Math.ceil(health)}%</span></p>
                </div>

                <div className="flex flex-col gap-4 w-full shrink-0">
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
