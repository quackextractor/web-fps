"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

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

export default function ChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 1;

  useEffect(() => {
    const fetchEntries = async () => {
      const response = await fetch("/api/changelog");
      const data = await response.json();
      setEntries(data);
    };
    fetchEntries();
  }, []);

  const totalPages = Math.ceil(entries.length / entriesPerPage);
  const startIdx = (currentPage - 1) * entriesPerPage;
  const paginatedEntries = entries.slice(startIdx, startIdx + entriesPerPage);

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 opacity-35 z-0"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(10, 10, 10, 0) 50%, rgba(0, 0, 0, 0.28) 50%)",
          backgroundSize: "100% 4px",
        }}
      />
      <main className="relative z-10 min-h-screen bg-black px-4 py-8 md:px-8 md:py-10 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 border-4 border-gray-800 bg-black p-4 md:p-6">
          <h1
            className="retro-text text-2xl text-red-600 md:text-4xl"
            style={{ textShadow: "4px 4px 0px #300000" }}
          >
            CORPORATE OPERATION ARCHIVES
          </h1>
          <p className="retro-text mt-4 text-[10px] leading-relaxed text-gray-300 md:text-xs">
            INTERNAL CHANGE REPORT SYSTEM.
          </p>
          <Link
            href="/"
            className="retro-text mt-5 inline-flex border-4 border-black bg-gray-800 px-4 py-3 text-[10px] text-white transition-colors hover:bg-white hover:text-black md:text-xs"
          >
            BACK TO MENU
          </Link>
        </header>

        <div className="mb-8 flex flex-col items-center gap-4">
          <p className="retro-text text-gray-300 text-[10px]">
            PAGE {currentPage} OF {totalPages || 1}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                window.scrollTo(0, 0);
              }}
              disabled={currentPage === 1}
              className="retro-text border-4 border-black bg-gray-800 px-4 py-3 text-[10px] text-white transition-colors hover:enabled:bg-white hover:enabled:text-black disabled:opacity-50 disabled:cursor-not-allowed md:text-xs"
            >
              PREVIOUS
            </button>
            <button
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo(0, 0);
              }}
              disabled={currentPage === totalPages}
              className="retro-text border-4 border-black bg-gray-800 px-4 py-3 text-[10px] text-white transition-colors hover:enabled:bg-white hover:enabled:text-black disabled:opacity-50 disabled:cursor-not-allowed md:text-xs"
            >
              NEXT
            </button>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4 pb-8">
          {paginatedEntries.map((entry) => {
            const addedSection = entry.sections.find(s => s.title.toLowerCase() === "added");
            const changedSection = entry.sections.find(s => s.title.toLowerCase() === "changed");
            
            const addedText = addedSection
              ? addedSection.items.map(item => `• ${item}`).join("\n")
              : "DOES NOT APPLY";
            
            const changedText = changedSection
              ? changedSection.items.map(item => `• ${item}`).join("\n")
              : "DOES NOT APPLY";

            return (
              <article
                key={`${entry.version}-${entry.date}`}
                className="border-4 border-gray-900 p-5 shadow-[0_0_0_2px_rgba(0,0,0,0.3)] md:p-6" style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #111 100%)" }}
              >
                <div className="space-y-3 text-[9px] md:text-[10px]">
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
                    <div className="border-2 border-gray-800 p-3" style={{ background: "linear-gradient(135deg, #301010 0%, #000000 100%)" }}>
                      <p className={`retro-text font-mono whitespace-pre-wrap leading-relaxed text-[8px] md:text-[9px] ${!addedSection ? "line-through text-gray-600" : "text-white"}`}>
                        {addedText}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="retro-text text-red-700 mb-1">&gt; CHANGED</p>
                    <div className="border-2 border-gray-800 p-3" style={{ background: "linear-gradient(135deg, #301010 0%, #000000 100%)" }}>
                      <p className={`retro-text font-mono whitespace-pre-wrap leading-relaxed text-[8px] md:text-[9px] ${!changedSection ? "line-through text-gray-600" : "text-white"}`}>
                        {changedText}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
        </div>
      </main>
    </>
  );
}
