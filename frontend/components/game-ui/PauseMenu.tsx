import React from "react";
import { MenuButton } from "./MenuButton";
import { ScanlinesOverlay } from "./ScanlinesOverlay";

interface PauseMenuProps {
    onResume: () => void;
    onOptions: () => void;
    onRestart: () => void;
    onExit: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
    onResume,
    onOptions,
    onRestart,
    onExit
}) => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/98 select-none p-4 overflow-y-auto">
            <ScanlinesOverlay />

            <div className="relative z-10 flex flex-col items-center w-full max-w-sm h-full max-h-[90vh] justify-center">
                <h2 className="retro-text text-[clamp(2rem,8vw,3rem)] text-yellow-500 mb-8 text-center tracking-tighter animate-pulse" style={{ textShadow: "4px 4px 0px #303000" }}>
                    PAUSED
                </h2>
                <div className="flex flex-col gap-[clamp(0.5rem,2vh,1rem)] w-full">
                    <MenuButton onClick={onResume}>
                        RESUME
                    </MenuButton>
                    <MenuButton onClick={onOptions} variant="secondary">
                        OPTIONS
                    </MenuButton>
                    <MenuButton onClick={onRestart} variant="secondary">
                        RESTART LEVEL
                    </MenuButton>
                    <MenuButton onClick={onExit} variant="danger">
                        EXIT TO MENU
                    </MenuButton>
                </div>
                <p className="mt-6 text-gray-500 retro-text text-[clamp(8px,1.5vw,10px)] text-center">Press ESC to resume</p>
            </div>
        </div>
    );
};

