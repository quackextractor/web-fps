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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950 p-4 select-none">
            <div className="scanlines" />

            <div className="relative z-10 w-full max-w-md text-center">
                <h2 className="retro-text text-4xl md:text-6xl text-red-600 mb-4 animate-pulse tracking-tighter" style={{ textShadow: "4px 4px 0px #000" }}>
                    YOU DIED
                </h2>
                <p className="retro-text text-red-400 text-xs md:text-sm mb-12 tracking-widest opacity-80">
                    PRESS 'R' TO RESTART
                </p>

                <div className="flex flex-col gap-4">
                    <MenuButton onClick={onRestart}>
                        TRY AGAIN
                    </MenuButton>
                    <MenuButton onClick={onMainMenu} variant="secondary">
                        MAIN MENU
                    </MenuButton>
                </div>

                <p className="mt-8 text-red-500/50 text-[10px] retro-text">
                    WEAPONS PRESERVED
                </p>
            </div>
        </div>
    );
};
