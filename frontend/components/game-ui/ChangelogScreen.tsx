import React, { useState, useEffect, useRef } from "react";
import { MenuButton } from "./MenuButton";
import { ScanlinesOverlay } from "./ScanlinesOverlay";
import { useEconomy } from "@/context/EconomyContext";
import { logger } from "@/lib/logger";

const EASTER_EGG_CREDITS = 1000;
const EASTER_EGG_SKIP_RECENT = 20;

interface ChangelogSection {
    title: string;
    items: string[];
}

interface ChangelogEntry {
    version: string;
    date: string;
    author: string;
    sections: ChangelogSection[];
}

interface ChangelogScreenProps {
    onBack: () => void;
}

function stripMarkdownEmphasis(value: string): string {
    return value
        .replace(/^\*\*\s*/, "")
        .replace(/\s*\*\*$/, "")
        .trim();
}

function parseChangelog(markdown: string): ChangelogEntry[] {
    const lines = markdown.split(/\r?\n/);
    const entries: ChangelogEntry[] = [];
    let currentEntry: ChangelogEntry | null = null;
    let currentSection: ChangelogSection | null = null;

    for (const rawLine of lines) {
        const line = rawLine.trim();

        const entryMatch = line.match(/^##\s+\[([^\]]+)\]\s*-\s*([^[]+?)(?:\s*\[Author:\s*([^\]]+)\])?\s*$/);
        if (entryMatch) {
            if (currentEntry !== null) {
                entries.push(currentEntry);
            }

            const version = entryMatch[1].trim();
            const date = entryMatch[2].trim();
            const author = (entryMatch[3] || "Unknown").trim();

            currentEntry = {
                version,
                date,
                author,
                sections: [],
            };
            currentSection = null;
            continue;
        }

        const sectionMatch = line.match(/^###\s+(.+)$/);
        if (sectionMatch && currentEntry !== null) {
            currentSection = {
                title: sectionMatch[1].trim(),
                items: [],
            };
            currentEntry.sections.push(currentSection);
            continue;
        }

        const bulletMatch = line.match(/^-\s+(.+)$/);
        if (bulletMatch && currentSection !== null) {
            currentSection.items.push(stripMarkdownEmphasis(bulletMatch[1]));
            continue;
        }

        if (line.length > 0 && currentSection !== null && currentSection.items.length > 0) {
            const lastIdx = currentSection.items.length - 1;
            currentSection.items[lastIdx] = `${currentSection.items[lastIdx]} ${line}`.trim();
        }
    }

    if (currentEntry !== null) {
        entries.push(currentEntry);
    }

    return entries;
}

export const ChangelogScreen: React.FC<ChangelogScreenProps> = ({ onBack }) => {
    const [entries, setEntries] = useState<ChangelogEntry[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const entriesPerPage = 1;

    const { isAuthenticated, username, refreshFromCloud } = useEconomy();

    const easterEggIndexRef = useRef<number | null>(null);
    const [easterEggClaimed, setEasterEggClaimed] = useState(false);
    const [easterEggClaiming, setEasterEggClaiming] = useState(false);
    const [easterEggError, setEasterEggError] = useState("");

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const response = await fetch("/api/changelog");
                const data = await response.json();
                setEntries(data);

                if (Array.isArray(data) && data.length > EASTER_EGG_SKIP_RECENT) {
                    const eligible = data.length - EASTER_EGG_SKIP_RECENT;
                    easterEggIndexRef.current = EASTER_EGG_SKIP_RECENT + Math.floor(Math.random() * eligible);
                }
            } catch (error) {
                logger.error("Failed to fetch changelog:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEntries();
    }, []);

    useEffect(() => {
        if (!isAuthenticated || easterEggIndexRef.current === null) {
            return;
        }
        const checkClaimed = async () => {
            try {
                const res = await fetch("/api/changelog/easter-egg", { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    setEasterEggClaimed(data.claimed === true);
                }
            } catch {
                // silent
            }
        };
        void checkClaimed();
    }, [isAuthenticated]);

    const handleClaimEasterEgg = async () => {
        setEasterEggClaiming(true);
        setEasterEggError("");
        try {
            const res = await fetch("/api/changelog/easter-egg", {
                method: "POST",
                credentials: "include",
            });
            if (res.status === 409) {
                setEasterEggClaimed(true);
                return;
            }
            if (!res.ok) {
                setEasterEggError("TRANSMISSION FAILED");
                return;
            }
            setEasterEggClaimed(true);
            await refreshFromCloud();
        } catch {
            setEasterEggError("TRANSMISSION FAILED");
        } finally {
            setEasterEggClaiming(false);
        }
    };

    const totalPages = Math.ceil(entries.length / entriesPerPage);
    const startIdx = (currentPage - 1) * entriesPerPage;
    const paginatedEntries = entries.slice(startIdx, startIdx + entriesPerPage);
    const isEasterEggPage = easterEggIndexRef.current !== null && currentPage - 1 === easterEggIndexRef.current;

    return (
        <div className="fixed xl:absolute inset-0 flex flex-col items-center justify-start bg-black p-0 xl:p-4 select-none pointer-events-auto overflow-y-auto">
            <ScanlinesOverlay />

            <div className="relative z-10 w-full xl:max-w-3xl bg-black mt-4 xl:mt-0">
                <div className="border-4 border-gray-800 bg-black p-3 xl:p-6 m-4 xl:m-0">
                    <h1
                        className="retro-text text-lg xl:text-4xl text-red-600"
                        style={{ textShadow: "2px 2px 0px #300000" }}
                    >
                        CORPORATE OPERATION ARCHIVES
                    </h1>
                    <p className="retro-text mt-2 xl:mt-4 text-xs xl:text-xs leading-relaxed text-gray-300">
                        INTERNAL CHANGE REPORT SYSTEM.
                    </p>
                    <div className="mt-4 xl:mt-5">
                        <MenuButton onClick={onBack} variant="secondary">
                            BACK TO MENU
                        </MenuButton>
                    </div>
                </div>


                {loading ? (
                    <div className="text-center p-4 xl:p-6 m-4 xl:m-0">
                        <p className="retro-text text-gray-500 text-xs xl:text-xs">LOADING CHANGELOG...</p>
                    </div>
                ) : (
                    <section className="grid grid-cols-1 gap-2 xl:gap-4 pb-4 xl:pb-8">
                        {isEasterEggPage ? (
                            <article
                                className="border-4 border-yellow-900 p-3 xl:p-6 shadow-[0_0_0_2px_rgba(0,0,0,0.3)] m-4 xl:m-0"
                                style={{ background: "linear-gradient(135deg, #1a1200 0%, #0d0900 100%)" }}
                            >
                                <div className="space-y-2 xl:space-y-3 text-xs xl:text-[10px]">
                                    <div>
                                        <p className="retro-text text-yellow-700 mb-1 animate-pulse">&gt; TRANSMISSION TYPE</p>
                                        <div className="border-2 border-yellow-900 p-2" style={{ background: "linear-gradient(135deg, #302000 0%, #000000 100%)" }}>
                                            <p className="retro-text text-yellow-400 font-mono tracking-widest">CLASSIFIED // LEVEL 9 CLEARANCE</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="retro-text text-yellow-700 mb-1">&gt; RECIPIENT</p>
                                        <div className="border-2 border-yellow-900 p-2" style={{ background: "linear-gradient(135deg, #302000 0%, #000000 100%)" }}>
                                            <p className="retro-text text-yellow-300 font-mono uppercase">
                                                {isAuthenticated ? username : "UNIDENTIFIED WORKER"}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="retro-text text-yellow-700 mb-1">&gt; CORPORATE DIRECTIVE</p>
                                        <div className="border-2 border-yellow-900 p-2 xl:p-3" style={{ background: "linear-gradient(135deg, #302000 0%, #000000 100%)" }}>
                                            <p className="retro-text font-mono whitespace-pre-wrap leading-relaxed text-[9px] xl:text-[9px] text-yellow-200">
                                                {`ATTENTION: EMPLOYEE LOYALTY REWARD PROGRAM\n\nYOU HAVE DEMONSTRATED EXCEPTIONAL DEDICATION\nTO THE INDUSTRIALIST CORPORATION BY REVIEWING\nOUR ARCHIVED OPERATIONAL RECORDS.\n\nAS PER INTERNAL POLICY REF. IC-7749-B, A\nONE-TIME WELFARE DISPENSATION OF ${EASTER_EGG_CREDITS} CR\nHAS BEEN AUTHORIZED FOR YOUR ACCOUNT.`}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="retro-text text-yellow-700 mb-1">&gt; DISPENSATION STATUS</p>
                                        <div className="border-2 border-yellow-900 p-2" style={{ background: "linear-gradient(135deg, #302000 0%, #000000 100%)" }}>
                                            {easterEggClaimed ? (
                                                <p className="retro-text text-green-400 font-mono">REWARD CLAIMED // BALANCE UPDATED</p>
                                            ) : (
                                                <p className="retro-text text-yellow-500 font-mono animate-pulse">PENDING AUTHORIZATION</p>
                                            )}
                                        </div>
                                    </div>

                                    {!easterEggClaimed && (
                                        <div className="pt-1">
                                            {!isAuthenticated ? (
                                                <p className="retro-text text-gray-500 text-[9px] text-center tracking-widest">LOGIN REQUIRED TO CLAIM</p>
                                            ) : (
                                                <div className="flex flex-col gap-2">
                                                    <MenuButton
                                                        onClick={() => { void handleClaimEasterEgg(); }}
                                                        variant="primary"
                                                    >
                                                        {easterEggClaiming ? "PROCESSING..." : `CLAIM ${EASTER_EGG_CREDITS} CR`}
                                                    </MenuButton>
                                                    {easterEggError.length > 0 && (
                                                        <p className="retro-text text-red-500 text-[9px] text-center">{easterEggError}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </article>
                        ) : (
                            paginatedEntries.map((entry) => {
                                const addedSection = entry.sections.find(s => s.title.toLowerCase() === "added");
                                const changedSection = entry.sections.find(s => s.title.toLowerCase() === "changed");
                                const fixedSection = entry.sections.find(s => s.title.toLowerCase() === "fixed");

                                const addedText = addedSection
                                    ? addedSection.items.map(item => `• ${item}`).join("\n")
                                    : "DOES NOT APPLY";

                                const changedText = changedSection
                                    ? changedSection.items.map(item => `• ${item}`).join("\n")
                                    : "DOES NOT APPLY";

                                const fixedText = fixedSection
                                    ? fixedSection.items.map(item => `• ${item}`).join("\n")
                                    : "DOES NOT APPLY";

                                return (
                                    <article
                                        key={`${entry.version}-${entry.date}`}
                                        className="border-4 border-gray-900 p-3 xl:p-6 shadow-[0_0_0_2px_rgba(0,0,0,0.3)] m-4 xl:m-0"
                                        style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #111 100%)" }}
                                    >
                                        <div className="space-y-2 xl:space-y-3 text-xs xl:text-[10px]">
                                            <div>
                                                <p className="retro-text text-red-700 mb-1">&gt; REPORT ID</p>
                                                <div className="border-2 border-gray-800 p-2" style={{ background: "linear-gradient(135deg, #301010 0%, #000000 100%)" }}>
                                                    <p className="retro-text text-white font-mono">{entry.version}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="retro-text text-red-700 mb-1">&gt; RESPONSIBLE EMPLOYEE</p>
                                                <div className="border-2 border-gray-800 p-2" style={{ background: "linear-gradient(135deg, #301010 0%, #000000 100%)" }}>
                                                    <p className="retro-text text-white font-mono uppercase">{entry.author}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="retro-text text-red-700 mb-1">&gt; DATE</p>
                                                <div className="border-2 border-gray-800 p-2" style={{ background: "linear-gradient(135deg, #301010 0%, #000000 100%)" }}>
                                                    <p className="retro-text text-white font-mono">{entry.date}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="retro-text text-red-700 mb-1">&gt; ADDED</p>
                                                <div className="border-2 border-gray-800 p-2 xl:p-3" style={{ background: "linear-gradient(135deg, #301010 0%, #000000 100%)" }}>
                                                    <p className={`retro-text font-mono whitespace-pre-wrap leading-relaxed text-[9px] xl:text-[9px] ${!addedSection ? "line-through text-gray-600" : "text-white"}`}>
                                                        {addedText}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="retro-text text-red-700 mb-1">&gt; CHANGED</p>
                                                <div className="border-2 border-gray-800 p-2 xl:p-3" style={{ background: "linear-gradient(135deg, #301010 0%, #000000 100%)" }}>
                                                    <p className={`retro-text font-mono whitespace-pre-wrap leading-relaxed text-[9px] xl:text-[9px] ${!changedSection ? "line-through text-gray-600" : "text-white"}`}>
                                                        {changedText}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="retro-text text-red-700 mb-1">&gt; FIXED</p>
                                                <div className="border-2 border-gray-800 p-2 xl:p-3" style={{ background: "linear-gradient(135deg, #301010 0%, #000000 100%)" }}>
                                                    <p className={`retro-text font-mono whitespace-pre-wrap leading-relaxed text-[9px] xl:text-[9px] ${!fixedSection ? "line-through text-gray-600" : "text-white"}`}>
                                                        {fixedText}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </section>
                )}

                <div className="mb-4 xl:mb-8 flex flex-col items-center gap-2 xl:gap-4 p-4 xl:p-0">
                    <p className="retro-text text-gray-300 text-xs xl:text-[10px]">
                        PAGE {currentPage} OF {totalPages || 1}
                    </p>
                    <div className="flex gap-2 xl:gap-3 w-full xl:w-auto">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="flex-1 xl:flex-initial retro-text border-4 border-black bg-gray-800 px-3 xl:px-4 py-2 xl:py-3 text-xs xl:text-xs text-white transition-colors hover:enabled:bg-white hover:enabled:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            PREV
                        </button>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="flex-1 xl:flex-initial retro-text border-4 border-black bg-gray-800 px-3 xl:px-4 py-2 xl:py-3 text-xs xl:text-xs text-white transition-colors hover:enabled:bg-white hover:enabled:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            NEXT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
