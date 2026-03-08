import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

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

async function getChangelogEntries(): Promise<ChangelogEntry[]> {
  const changelogPath = path.join(process.cwd(), "..", "CHANGELOG.md");
  const markdown = await fs.readFile(changelogPath, "utf8");
  return parseChangelog(markdown);
}

export default async function ChangelogPage() {
  const entries = await getChangelogEntries();

  return (
    <main className="relative min-h-screen overflow-y-auto bg-black px-4 py-8 md:px-8 md:py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(10, 10, 10, 0) 50%, rgba(0, 0, 0, 0.28) 50%)",
          backgroundSize: "100% 4px",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <header className="mb-8 border-4 border-gray-800 bg-black p-4 md:p-6">
          <h1
            className="retro-text text-2xl text-red-600 md:text-4xl"
            style={{ textShadow: "4px 4px 0px #300000" }}
          >
            CORPORATE CHANGELOG ARCHIVE
          </h1>
          <p className="retro-text mt-4 text-[10px] leading-relaxed text-gray-300 md:text-xs">
            INTERNAL REPORT STREAM. EACH CARD DOCUMENTS APPROVED CHANGES TO INDUSTRIALIST SYSTEMS.
          </p>
          <Link
            href="/"
            className="retro-text mt-5 inline-flex border-4 border-black bg-gray-800 px-4 py-3 text-[10px] text-white transition-colors hover:bg-white hover:text-black md:text-xs"
          >
            BACK TO MENU
          </Link>
        </header>

        <section className="grid grid-cols-1 gap-4 pb-8 md:grid-cols-2 md:gap-6">
          {entries.map((entry) => (
            <article
              key={`${entry.version}-${entry.date}`}
              className="border-4 border-gray-800 bg-gray-950 p-4 shadow-[0_0_0_2px_#000] md:p-5"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b-4 border-gray-800 pb-3">
                <div>
                  <h2 className="retro-text text-sm text-yellow-500 md:text-base">REPORT {entry.version}</h2>
                  <p className="retro-text mt-2 text-[10px] text-gray-300 md:text-xs">DATE: {entry.date}</p>
                </div>
                <p className="retro-text border-2 border-red-900 bg-black px-2 py-1 text-[9px] text-red-400 md:text-[10px]">
                  AUTHOR: {entry.author.toUpperCase()}
                </p>
              </div>

              <div className="space-y-4">
                {entry.sections.map((section) => (
                  <div key={`${entry.version}-${section.title}`} className="bg-black p-3 border-2 border-gray-800">
                    <h3 className="retro-text mb-2 text-[10px] text-red-500 md:text-xs">{section.title.toUpperCase()}</h3>
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li
                          key={`${entry.version}-${section.title}-${item.slice(0, 30)}`}
                          className="retro-text text-[9px] leading-relaxed text-gray-200 md:text-[10px]"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
