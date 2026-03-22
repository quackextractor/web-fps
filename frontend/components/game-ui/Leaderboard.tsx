import React, { useEffect, useState } from "react";
import { MenuButton } from "./MenuButton";
import { ScanlinesOverlay } from "./ScanlinesOverlay";

interface LeaderboardProps {
    onBack: () => void;
}

interface LeaderboardEntry {
    username: string;
    netWorth: number;
    kills: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

    useEffect(() => {
        const run = async () => {
            setStatus("loading");
            try {
                const response = await fetch("/api/leaderboard", { method: "GET" });
                if (!response.ok) {
                    setStatus("error");
                    return;
                }

                const data = await response.json();
                if (Array.isArray(data.leaderboard)) {
                    setEntries(data.leaderboard);
                } else {
                    setEntries([]);
                }
                setStatus("ready");
            } catch {
                setStatus("error");
            }
        };

        void run();
    }, []);

    return (
        <div className="fixed xl:absolute inset-0 flex flex-col items-center justify-start xl:justify-center bg-black p-2 xl:p-4 select-none pointer-events-auto overflow-y-auto overflow-x-hidden">
            <ScanlinesOverlay />

            <div className="relative z-10 w-full max-w-4xl bg-black retro-border p-4 xl:p-8 overflow-y-auto max-h-[calc(100dvh-1rem)] xl:max-h-[calc(100dvh-2rem)]">
                <h1 className="retro-text text-3xl xl:text-5xl text-red-600 mb-3 text-center tracking-tighter" style={{ textShadow: "4px 4px 0px #300000" }}>
                    GLOBAL LEADERBOARD
                </h1>

                {status === "loading" && (
                    <p className="retro-text text-xs text-center text-gray-400 mb-8">LOADING SCORES</p>
                )}

                {status === "error" && (
                    <p className="retro-text text-xs text-center text-yellow-500 mb-8">FAILED TO LOAD LEADERBOARD</p>
                )}

                <h2 className="retro-text text-2xl xl:text-2xl text-red-600 mb-3 tracking-tighter" style={{ textShadow: "4px 4px 0px #300000" }}>
                    TOP NET WORTH
                </h2>
                {status === "ready" && (
                    <div className="retro-border bg-gray-950 mb-8 overflow-hidden">
                        <div className="grid grid-cols-11 border-b border-gray-800 px-3 py-2 retro-text text-[10px] text-red-400">
                            <div className="col-span-2">RANK</div>
                            <div className="col-span-5">PLAYER</div>
                            <div className="col-span-3 text-right">NET WORTH</div>
                        </div>

                        {entries.length === 0 && (
                            <div className="px-3 py-4 retro-text text-xs text-gray-400 text-center">NO RECORDS FOUND</div>
                        )}

                        {[...entries].sort((left, right) => (right.netWorth - left.netWorth)).map((entry, idx) => (
                            <div key={`${entry.username}-${idx}`} className="grid grid-cols-11 px-3 py-2 border-b border-gray-900 retro-text text-xs text-white">
                                <div className="col-span-2">#{idx + 1}</div>
                                <div className="col-span-5 truncate">{entry.username}</div>
                                <div className="col-span-3 text-right">${entry.netWorth}</div>
                            </div>
                        ))}


                    </div>
                )}
                <h2 className="retro-text text-2xl xl:text-2xl text-red-600 mb-3 tracking-tighter" style={{ textShadow: "4px 4px 0px #300000" }}>
                    MOST KILLS
                </h2>
                {status === "ready" && (
                    <div className="retro-border bg-gray-950 mb-8 overflow-hidden">
                        <div className="grid grid-cols-11 border-b border-gray-800 px-3 py-2 retro-text text-[10px] text-red-400">
                            <div className="col-span-2">RANK</div>
                            <div className="col-span-5">PLAYER</div>
                            <div className="col-span-3 text-right">KILLS</div>
                        </div>

                        {entries.length === 0 && (
                            <div className="px-3 py-4 retro-text text-xs text-gray-400 text-center">NO RECORDS FOUND</div>
                        )}

                        {[...entries].sort((left, right) => (right.kills - left.kills)).map((entry, idx) => (
                            <div key={`${entry.username}-${idx}`} className="grid grid-cols-11 px-3 py-2 border-b border-gray-900 retro-text text-xs text-white">
                                <div className="col-span-2">#{idx + 1}</div>
                                <div className="col-span-5 truncate">{entry.username}</div>
                                <div className="col-span-3 text-right">{entry.kills}</div>
                            </div>
                        ))}


                    </div>
                )}

                <div className="w-full xl:w-1/3 mx-auto">
                    <MenuButton onClick={onBack} variant="primary">CLOSE TERMINAL</MenuButton>
                </div>
            </div>
        </div>
    );
};
