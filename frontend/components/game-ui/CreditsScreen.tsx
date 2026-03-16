import React from "react";
import { MenuButton } from "./MenuButton";
import { ScanlinesOverlay } from "./ScanlinesOverlay";

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

interface CreditsScreenProps {
  onBack: () => void;
}

export const CreditsScreen: React.FC<CreditsScreenProps> = ({ onBack }) => {
  const employees = TEAM_MEMBERS;

  return (
    <div className="fixed md:absolute inset-0 flex flex-col items-center justify-start bg-black p-0 md:p-4 select-none pointer-events-auto overflow-y-auto">
      <ScanlinesOverlay />

      <div className="relative z-10 w-full md:max-w-2xl bg-black mt-4 md:mt-0">
        <div className="border-4 border-gray-800 bg-black p-3 md:p-6 m-4 md:m-0">
          <h1
            className="retro-text text-lg md:text-4xl text-red-600"
            style={{ textShadow: "2px 2px 0px #300000" }}
          >
            CORPORATE EMPLOYEE MANAGEMENT
          </h1>
          <p className="retro-text mt-2 md:mt-4 text-xs md:text-xs leading-relaxed text-gray-300">
            PERSONNEL LISTING
          </p>
          <div className="mt-4 md:mt-5">
            <MenuButton onClick={onBack} variant="secondary">
              BACK TO MENU
            </MenuButton>
          </div>
        </div>

        <section className="space-y-2 md:space-y-3 pb-4 md:pb-8">
          {employees.length === 0 ? (
            <div className="border-4 border-gray-800 bg-gray-950 p-4 md:p-6 text-center m-4 md:m-0">
              <p className="retro-text text-gray-500 text-xs md:text-xs">NO PERSONNEL DATA AVAILABLE</p>
            </div>
          ) : (
            employees.map((employee, index) => (
              <article
                key={`${employee.name}-${index}`}
                className="border-4 border-gray-800 bg-gray-950 p-3 md:p-4 flex items-center gap-3 md:gap-4 shadow-[0_0_0_2px_#000] m-4 md:m-0"
              >
                <div className="w-12 h-12 md:w-20 md:h-20 flex-shrink-0 flex items-center justify-center border-4 border-gray-700 bg-black">
                  <div className="retro-text text-xl md:text-3xl text-gray-500">👤</div>
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="retro-text text-xs md:text-base text-gray-300 truncate">
                    {employee.name.toUpperCase()}
                  </h2>
                  <p className="retro-text mt-1 text-[9px] md:text-[10px] text-gray-500">
                    {employee.role}
                  </p>
                </div>
              </article>
            ))
          )}

          <article className="border-4 border-gray-800 bg-gray-950 p-3 md:p-4 flex items-center gap-3 md:gap-4 shadow-[0_0_0_2px_#000] m-4 md:m-0">
            <div className="w-12 h-12 md:w-20 md:h-20 flex-shrink-0 flex items-center justify-center border-4 border-gray-700 bg-black">
              <div className="retro-text text-xl md:text-3xl text-gray-500">👤</div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="retro-text text-xs md:text-base text-gray-300 truncate">KITSUNE</h2>
              <p className="retro-text mt-1 text-[9px] md:text-[10px] text-gray-500">
                Music composition and production
              </p>
            </div>
          </article>
        </section>

        <div className="border-4 border-gray-800 bg-gray-950 p-3 md:p-4 m-4 md:m-0">
          <p className="retro-text text-gray-500 text-xs md:text-xs mb-2">SOURCE</p>
          <a
            href="https://github.com/quackextractor/web-fps"
            target="_blank"
            rel="noopener noreferrer"
            className="retro-text text-red-600 hover:text-red-400 text-xs md:text-xs break-all"
          >
            https://github.com/quackextractor/web-fps
          </a>
        </div>
      </div>
    </div>
  );
};
