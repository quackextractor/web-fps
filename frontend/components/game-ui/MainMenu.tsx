import React from "react";
import { MenuButton } from "./MenuButton";
import { ScanlinesOverlay } from "./ScanlinesOverlay";

interface MainMenuProps {
    onStartGame: (levelIndex: number) => void;
    onSelectLevel: () => void;
    onOptions: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
    onStartGame,
    onSelectLevel,
    onOptions
}) => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black overflow-hidden select-none">
            <ScanlinesOverlay />

            <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4">
                <h1 className="retro-text text-4xl md:text-6xl text-red-600 mb-4 text-center animate-pulse leading-snug tracking-tighter"
                    style={{ textShadow: "4px 4px 0px #300000" }}>
                    INFERNO
                </h1>
                <p className="retro-text text-red-400 text-xs md:text-sm mb-12 tracking-widest text-center opacity-80">
                    DESCENT INTO DARKNESS
                </p>

                <div className="flex flex-col gap-6 w-full max-w-sm">
                    <MenuButton onClick={() => onStartGame(0)}>
                        PLAY
                    </MenuButton>
                    <MenuButton onClick={onSelectLevel} variant="secondary">
                        SELECT LEVEL
                    </MenuButton>
                    <MenuButton onClick={onOptions} variant="secondary">
                        OPTIONS
                    </MenuButton>
                </div>

                <div className="mt-16 text-gray-500 text-center text-[10px] md:text-xs font-mono retro-text opacity-50">
                    <p className="text-yellow-600 mb-2">CONTROLS</p>
                    <div className="flex flex-col gap-1">
                        <p>WASD: MOVE  •  MOUSE: LOOK</p>
                        <p>CLICK: FIRE •  1-5: WEAPON</p>
                    </div>
                </div>

                <div className="absolute bottom-4 right-4 text-[10px] text-gray-800 font-mono">
                    v{process.env.NEXT_PUBLIC_GAME_VERSION || "0.0.0"}
                </div>
            </div>
        </div>
    );
};
