import { promises as fs } from "fs";
import path from "path";

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

export async function GET(): Promise<Response> {
  const changelogPath = path.join(process.cwd(), "..", "CHANGELOG.md");
  const markdown = await fs.readFile(changelogPath, "utf8");
  const entries = parseChangelog(markdown);
  return Response.json(entries);
}
