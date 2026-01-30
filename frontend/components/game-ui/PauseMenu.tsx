import React from "react";
import { MenuButton } from "./MenuButton";

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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <h2 className="text-5xl font-bold text-yellow-500 mb-8" style={{ fontFamily: "Impact, sans-serif" }}>
                PAUSED
            </h2>
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
            <p className="mt-6 text-gray-500">Press ESC to resume</p>
        </div>
    );
};
