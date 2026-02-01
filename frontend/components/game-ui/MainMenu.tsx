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

            <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4 py-8 h-full justify-between">
                <div className="flex flex-col items-center">
                    <h1 className="retro-text text-[clamp(2rem,10vw,4rem)] text-red-600 mb-2 text-center animate-pulse leading-none tracking-tighter"
                        style={{ textShadow: "4px 4px 0px #300000" }}>
                        INFERNO
                    </h1>
                    <p className="retro-text text-red-400 text-[clamp(0.5rem,2vw,0.875rem)] mb-8 tracking-[0.3em] text-center opacity-80">
                        DESCENT INTO DARKNESS
                    </p>

                    <div className="flex flex-col gap-[clamp(0.5rem,2vh,1.5rem)] w-full max-w-[min(100%,320px)]">
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
                </div>

                <div className="flex flex-col items-center">
                    <div className="mt-8 text-gray-500 text-center text-[clamp(8px,1.5vw,10px)] font-mono retro-text opacity-50">
                        <p className="text-yellow-600 mb-2">DEFAULT CONTROLS</p>
                        <div className="flex flex-col gap-1">
                            <p>WASD: MOVE  •  MOUSE: LOOK</p>
                            <p>CLICK: FIRE •  1-5: WEAPON</p>
                            <p>SPACE: CONFIRM •  CTRL: CANCEL</p>
                        </div>
                    </div>

                    <div className="mt-4 text-[10px] text-gray-800 font-mono">
                        v{process.env.NEXT_PUBLIC_GAME_VERSION || "0.0.0"}
                    </div>
                </div>
            </div>
        </div>
    );
};
