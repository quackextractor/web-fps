import React from "react";
import { MenuButton } from "./MenuButton";
import { ScanlinesOverlay } from "./ScanlinesOverlay";

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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950 overflow-y-auto overflow-x-hidden p-2 sm:p-4 select-none pointer-events-auto">
            <ScanlinesOverlay />

            <div className="relative z-10 w-full max-w-md my-4 text-center">
                <h2 className="retro-text text-2xl sm:text-4xl md:text-6xl text-red-600 mb-2 sm:mb-4 animate-pulse tracking-tighter" style={{ textShadow: "2px 2px 0px #000" }}>
                    YOU DIED
                </h2>
                <p className="retro-text text-red-400 text-[10px] sm:text-xs md:text-sm mb-4 sm:mb-8 md:mb-12 tracking-widest opacity-80">
                    PRESS 'R' TO RESTART
                </p>

                <div className="flex flex-col gap-2 sm:gap-4">
                    <MenuButton onClick={onRestart}>
                        TRY AGAIN
                    </MenuButton>
                    <MenuButton onClick={onMainMenu} variant="secondary">
                        MAIN MENU
                    </MenuButton>
                </div>

                <p className="mt-4 sm:mt-8 text-red-500/50 text-[8px] sm:text-[10px] retro-text">
                    WEAPONS PRESERVED
                </p>
            </div>
        </div>
    );
};
