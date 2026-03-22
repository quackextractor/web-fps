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
        <div className="fixed md:absolute inset-0 flex flex-col items-center justify-center bg-black/90 select-none pointer-events-auto">
            <ScanlinesOverlay />

            <div className="relative z-10 flex flex-col items-center">
                <h1 className="retro-text text-3xl md:text-5xl text-yellow-500 mb-8 text-center tracking-tighter animate-pulse" style={{ textShadow: "4px 4px 0px #303000" }}>
                    PAUSED
                </h1>
                <div className="flex flex-col gap-4 w-64">
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
                        EXIT TO MAIN MENU
                    </MenuButton>
                </div>
                <p className="mt-6 text-gray-500 retro-text text-xs text-center">Press ESC to resume</p>
            </div>
        </div>
    );
};

