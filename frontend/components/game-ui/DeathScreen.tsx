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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/95 p-4 select-none overflow-hidden">
            <ScanlinesOverlay />

            <div className="relative z-10 w-full max-w-sm text-center flex flex-col items-center h-full justify-center">
                <h2 className="retro-text text-[clamp(2rem,10vw,4rem)] text-red-600 mb-2 animate-pulse tracking-tighter" style={{ textShadow: "4px 4px 0px #000" }}>
                    YOU DIED
                </h2>
                <p className="retro-text text-red-400 text-[clamp(0.5rem,2vw,0.875rem)] mb-12 tracking-widest opacity-80">
                    PRESS 'R' TO RESTART
                </p>

                <div className="flex flex-col gap-4 w-full">
                    <MenuButton onClick={onRestart}>
                        TRY AGAIN
                    </MenuButton>
                    <MenuButton onClick={onMainMenu} variant="secondary">
                        MAIN MENU
                    </MenuButton>
                </div>

                <p className="mt-8 text-red-500/50 text-[clamp(8px,1.5vw,10px)] retro-text">
                    WEAPONS PRESERVED
                </p>
            </div>
        </div>
    );
};
