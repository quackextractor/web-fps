import React from "react";
import { MenuButton } from "./MenuButton";

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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black via-red-950/80 to-black">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fillRule=\"evenodd\"%3E%3Cg fill=\"%23ff0000\" fillOpacity=\"0.1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />

            <div className="relative z-10 flex flex-col items-center">
                <h1 className="text-7xl font-black text-red-600 mb-2 tracking-widest drop-shadow-lg" style={{ fontFamily: "Impact, sans-serif", textShadow: "0 0 30px rgba(255,0,0,0.5)" }}>
                    INFERNO
                </h1>
                <p className="text-red-400 text-xl mb-12 tracking-wider">DESCENT INTO DARKNESS</p>

                <div className="flex flex-col gap-4 w-64">
                    <MenuButton onClick={() => onStartGame(0)}>
                        NEW GAME
                    </MenuButton>
                    <MenuButton onClick={onSelectLevel} variant="secondary">
                        SELECT LEVEL
                    </MenuButton>
                    <MenuButton onClick={onOptions} variant="secondary">
                        OPTIONS
                    </MenuButton>
                </div>

                <div className="mt-10 text-gray-500 text-center">
                    <p className="text-yellow-500 font-bold mb-2">CONTROLS</p>
                    <p className="text-sm">WASD - Move | Mouse - Look | Click - Shoot</p>
                    <p className="text-sm">1-5 - Weapons | R - Restart | ESC - Pause</p>
                </div>
            </div>
        </div>
    );
};
