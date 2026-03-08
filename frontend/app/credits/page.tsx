import Link from "next/link";

export const dynamic = "force-dynamic";

interface Employee {
  name: string;
  role: string;
}

const TEAM_MEMBERS: Employee[] = [
  { name: "Pavlo Kosov", role: "Gameplay & Systems (FPS Engine)" },
  { name: "Filip Houdek", role: "Economy & State (Game Logic)" },
  { name: "Tobiáš Mrázek", role: "Frontend Developer (Factory & Armory UI)" },
  { name: "Dominik Hoch", role: "Network & Backend Systems (Next.js APIs)" },
  { name: "Miro Slezák", role: "Team Leader & Core Engine Dev" },
].sort((a, b) => a.name.localeCompare(b.name));

function getTeamMembers(): Employee[] {
  return TEAM_MEMBERS;
}

export default async function CreditsPage() {
  const employees = getTeamMembers();

  return (
    <main className="min-h-screen bg-black px-4 py-8 md:px-8 md:py-10 overflow-y-auto">
      <div
        className="pointer-events-none fixed inset-0 opacity-35"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(10, 10, 10, 0) 50%, rgba(0, 0, 0, 0.28) 50%)",
          backgroundSize: "100% 4px",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <header className="mb-8 border-4 border-gray-800 bg-black p-4 md:p-6">
          <h1
            className="retro-text text-2xl text-red-600 md:text-4xl"
            style={{ textShadow: "4px 4px 0px #300000" }}
          >
            CORPORATE EMPLOYEE MANAGEMENT
          </h1>
          <p className="retro-text mt-4 text-[10px] leading-relaxed text-gray-300 md:text-xs">
            PERSONNEL LISTING
          </p>
          <Link
            href="/"
            className="retro-text mt-5 inline-flex border-4 border-black bg-gray-800 px-4 py-3 text-[10px] text-white transition-colors hover:bg-white hover:text-black md:text-xs"
          >
            BACK TO MENU
          </Link>
        </header>

        {employees.length === 0 ? (
          <div className="border-4 border-gray-800 bg-gray-950 p-6 text-center">
            <p className="retro-text text-gray-500 text-xs">NO PERSONNEL DATA AVAILABLE</p>
          </div>
        ) : (
          <section className="space-y-3 pb-8">
            {employees.map((employee, index) => (
              <article
                key={`${employee.name}-${index}`}
                className="border-4 border-gray-800 bg-gray-950 p-4 flex items-center gap-4 shadow-[0_0_0_2px_#000]"
              >
                <div
                  className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 flex items-center justify-center border-4 border-gray-700 bg-black"
                >
                  <div className="retro-text text-2xl md:text-3xl text-gray-500">
                    👤
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="retro-text text-sm md:text-base text-gray-300 truncate">
                    {employee.name.toUpperCase()}
                  </h2>
                  <p className="retro-text mt-1 text-[9px] md:text-[10px] text-gray-500">
                    {employee.role}
                  </p>
                </div>
              </article>
            ))}
          </section>
        )}

          <section className="space-y-3 pb-8">
              <article
                key="Kitsune"
                className="border-4 border-gray-800 bg-gray-950 p-4 flex items-center gap-4 shadow-[0_0_0_2px_#000]"
              >
                <div
                  className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 flex items-center justify-center border-4 border-gray-700 bg-black"
                >
                  <div className="retro-text text-2xl md:text-3xl text-gray-500">
                    👤
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="retro-text text-sm md:text-base text-gray-300 truncate">
                    KITSUNE
                  </h2>
                  <p className="retro-text mt-1 text-[9px] md:text-[10px] text-gray-500">
                    Music composition and production
                  </p>
                </div>
              </article>
          </section>

        <footer className="mt-10 border-4 border-gray-800 bg-gray-950 p-4">
          <p className="retro-text text-gray-500 text-[10px] mb-2">SOURCE</p>
          <Link
            href="https://github.com/quackextractor/web-fps"
            target="_blank"
            rel="noopener noreferrer"
            className="retro-text text-red-600 hover:text-red-400 text-[10px] break-all"
          >
            https://github.com/quackextractor/web-fps
          </Link>
        </footer>
      </div>
    </main>
  );
}
