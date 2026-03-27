import React, { useState } from "react";
import { MenuButton } from "./MenuButton";
import { ScanlinesOverlay } from "./ScanlinesOverlay";

interface MainMenuProps {
    onStartGame: (levelIndex: number) => void;
    onSelectLevel: () => void;
    onOptions: () => void;
    onChangelog: () => void;
    onCredits: () => void;
    onSource: () => void;
    onLogin: () => void;
    onLogout: () => void;
    isAuthenticated: boolean;
    onFactory: () => void;
    onArmory: () => void;
    onLeaderboard: () => void;
    onQAForm: () => void;
}


export const MainMenu: React.FC<MainMenuProps> = ({
    onStartGame,
    onSelectLevel,
    onOptions,
    onChangelog,
    onCredits,
    onSource,
    onLogin,
    onLogout,
    isAuthenticated,
    onFactory,
    onArmory,
    onLeaderboard,
    onQAForm,
}) => {

    const [currentPage, setCurrentPage] = useState(0);

    const buttonPages = [
        [
            { label: "PLAY", onClick: () => onStartGame(0), variant: "primary" as const },
            { label: "SELECT LEVEL", onClick: onSelectLevel, variant: "secondary" as const },
        ],
        [
            { label: "GLOBAL LEADERBOARD", onClick: onLeaderboard, variant: "secondary" as const },
            {
                label: null,
                onClick: null,
                variant: "secondary" as const,
                isRow: true,
                children: [
                    { label: "FACTORY HUB", mobileLabel: "FACTORY", onClick: onFactory, variant: "secondary" as const },
                    { label: "ARMORY", onClick: onArmory, variant: "secondary" as const },
                ]
            },
        ],
        [
            { label: isAuthenticated ? "LOGOUT" : "LOGIN TERMINAL", onClick: isAuthenticated ? onLogout : onLogin, variant: "secondary" as const },
            { label: "OPTIONS", onClick: onOptions, variant: "secondary" as const },
        ],
        [
            { label: "CREDITS", onClick: onCredits, variant: "secondary" as const },
            { label: "QA TESTING FORM", onClick: onQAForm, variant: "secondary" as const },
        ],
        [
            { label: "CHANGELOG", onClick: onChangelog, variant: "secondary" as const },
            { label: "SOURCE", onClick: onSource, variant: "secondary" as const },
        ],

    ];

    const totalPages = buttonPages.length;
    const canGoNext = currentPage < totalPages - 1;
    const canGoPrev = currentPage > 0;

    return (
        <div className="fixed xl:absolute inset-0 flex flex-col items-center justify-center bg-black overflow-y-auto overflow-x-hidden select-none pointer-events-auto p-0 xl:p-4"
            style={{ margin: 0 }}>
            <ScanlinesOverlay />

            <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-2 sm:px-4 py-4">
                <h1 className="retro-text text-2xl sm:text-4xl xl:text-6xl text-red-600 mb-2 sm:mb-4 text-center animate-pulse leading-snug tracking-tighter"
                    style={{ textShadow: "2px 2px 0px #300000" }}>
                    INDUSTRIALIST
                </h1>
                <p className="retro-text text-red-400 text-[10px] sm:text-xs xl:text-sm mb-4 sm:mb-6 xl:mb-12 tracking-widest text-center opacity-80">
                    DESCENT INTO DARKNESS
                </p>

                {/* Mobile carousel view */}
                <div className="xl:hidden flex flex-col gap-2 sm:gap-4 w-full max-w-sm">
                    {buttonPages[currentPage].map((button, idx) => {
                        if ("children" in button && Array.isArray(button.children)) {
                            return (
                                <div key={idx} className="flex gap-3">
                                    {button.children?.map((childBtn, childIdx) => (
                                        <MenuButton
                                            key={childIdx}
                                            onClick={childBtn.onClick}
                                            variant={childBtn.variant}
                                        >
                                            {childBtn.mobileLabel && (
                                                <>
                                                    <span className="xl:hidden">{childBtn.mobileLabel}</span>
                                                    <span className="hidden xl:inline">{childBtn.label}</span>
                                                </>
                                            )}
                                            {!childBtn.mobileLabel && childBtn.label}
                                        </MenuButton>
                                    ))}
                                </div>
                            );
                        }
                        if (!button.onClick) {
                            return <div key={idx} />;
                        }
                        return (
                            <MenuButton
                                key={idx}
                                onClick={button.onClick}
                                variant={button.variant}
                            >
                                {button.label}
                            </MenuButton>
                        );
                    })}

                    <div className="flex justify-center items-center gap-2 sm:gap-4 mt-4 sm:mt-6 w-full px-2"
                    style={{ margin: 0, padding: 0 }}>
                        <button
                            type="button"
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={!canGoPrev}
                            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base font-bold transition-all duration-75 transform active:translate-y-1 retro-text retro-border uppercase tracking-widest bg-gray-800 hover:bg-white hover:text-black text-white border-black disabled:bg-gray-900 disabled:text-gray-700 disabled:opacity-50"
                        >
                            &lt;
                        </button>
                        <div className="text-[8px] sm:text-[10px] text-gray-600 font-mono whitespace-nowrap">
                            {currentPage + 1} / {totalPages}
                        </div>
                        <button
                            type="button"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                            disabled={!canGoNext}
                            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base font-bold transition-all duration-75 transform active:translate-y-1 retro-text retro-border uppercase tracking-widest bg-gray-800 hover:bg-white hover:text-black text-white border-black disabled:bg-gray-900 disabled:text-gray-700 disabled:opacity-50"
                        >
                            &gt;
                        </button>
                    </div>
                </div>

                {/* Desktop full view */}
                <div className="hidden xl:flex flex-col gap-6 w-full max-w-sm">
                    <MenuButton onClick={() => onStartGame(0)}>
                        PLAY
                    </MenuButton>
                    <MenuButton onClick={onSelectLevel} variant="secondary">
                        SELECT LEVEL
                    </MenuButton>
                    <MenuButton onClick={onLeaderboard} variant="secondary">
                        GLOBAL LEADERBOARD
                    </MenuButton>
                    <div className="flex gap-3">
                        <MenuButton onClick={onFactory} variant="secondary">
                            FACTORY HUB
                        </MenuButton>
                        <MenuButton onClick={onArmory} variant="secondary">
                            ARMORY
                        </MenuButton>
                    </div>
                    <MenuButton onClick={isAuthenticated ? onLogout : onLogin} variant="secondary">
                        {isAuthenticated ? "LOGOUT" : "LOGIN TERMINAL"}
                    </MenuButton>
                    <MenuButton onClick={onOptions} variant="secondary">
                        OPTIONS
                    </MenuButton>
                    <MenuButton onClick={onQAForm} variant="secondary">
                        QA TESTING FORM
                    </MenuButton>
                </div>


                <div className="hidden xl:block mt-4 sm:mt-8 xl:mt-16 text-gray-500 text-center text-[8px] sm:text-[10px] xl:text-xs font-mono retro-text opacity-50">
                    <p className="text-yellow-600 mb-2">DEFAULT CONTROLS</p>
                    <div className="flex flex-col gap-1">
                        <p>WASD: MOVE  •  MOUSE: LOOK</p>
                        <p>CLICK: FIRE •  1-5: WEAPON</p>
                        <p>SPACE: CONFIRM •  CTRL: CANCEL</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onChangelog}
                    className="hidden xl:block absolute bottom-4 left-4 text-[8px] sm:text-[10px] text-gray-700 hover:text-red-600 font-mono retro-text transition-colors uppercase"
                >
                    CHANGELOG
                </button>

                <div className="hidden xl:flex absolute bottom-4 right-4 flex-col items-end gap-2">
                    <button
                        type="button"
                        onClick={onCredits}
                        className="text-[8px] sm:text-[10px] text-gray-700 hover:text-red-600 font-mono retro-text transition-colors uppercase"
                    >
                        CREDITS
                    </button>
                    <button
                        type="button"
                        onClick={onSource}
                        className="text-[8px] sm:text-[10px] text-gray-700 hover:text-red-600 font-mono retro-text transition-colors uppercase"
                    >
                        SOURCE
                    </button>
                    <div className="text-[8px] sm:text-[10px] text-gray-800 font-mono">
                        v{process.env.NEXT_PUBLIC_GAME_VERSION || "0.0.0"}
                    </div>
                </div>
            </div>
        </div>
    );
};
