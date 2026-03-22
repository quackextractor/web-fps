import React, { useState, useEffect } from "react";
import { MenuButton } from "./MenuButton";
import { ScanlinesOverlay } from "./ScanlinesOverlay";

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

        const entryMatch = line.match(/^##\s+\[([^\]]+)\]\s*-\s*([^\[]+?)(?:\s*\[Author:\s*([^\]]+)\])?\s*$/);
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

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const response = await fetch("/api/changelog");
                const data = await response.json();
                setEntries(data);
            } catch (error) {
                console.error("Failed to fetch changelog:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEntries();
    }, []);

    const totalPages = Math.ceil(entries.length / entriesPerPage);
    const startIdx = (currentPage - 1) * entriesPerPage;
    const paginatedEntries = entries.slice(startIdx, startIdx + entriesPerPage);

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
                        {paginatedEntries.map((entry) => {
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
                        })}
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
