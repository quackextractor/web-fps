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
    <div className="fixed xl:absolute inset-0 flex flex-col items-center justify-start bg-black p-0 xl:p-4 select-none pointer-events-auto overflow-y-auto">
      <ScanlinesOverlay />

      <div className="relative z-10 w-full xl:max-w-2xl bg-black mt-4 xl:mt-0">
        <div className="border-4 border-gray-800 bg-black p-3 xl:p-6 m-4 xl:m-0">
          <h1
            className="retro-text text-lg xl:text-4xl text-red-600"
            style={{ textShadow: "2px 2px 0px #300000" }}
          >
            CORPORATE EMPLOYEE MANAGEMENT
          </h1>
          <p className="retro-text mt-2 xl:mt-4 text-xs xl:text-xs leading-relaxed text-gray-300">
            PERSONNEL LISTING
          </p>
          <div className="mt-4 xl:mt-5">
            <MenuButton onClick={onBack} variant="secondary">
              BACK TO MENU
            </MenuButton>
          </div>
        </div>

        <section className="space-y-2 xl:space-y-3 pb-4 xl:pb-8">
          {employees.length === 0 ? (
            <div className="border-4 border-gray-800 bg-gray-950 p-4 xl:p-6 text-center m-4 xl:m-0">
              <p className="retro-text text-gray-500 text-xs xl:text-xs">NO PERSONNEL DATA AVAILABLE</p>
            </div>
          ) : (
            employees.map((employee, index) => (
              <article
                key={`${employee.name}-${index}`}
                className="border-4 border-gray-800 bg-gray-950 p-3 xl:p-4 flex items-center gap-3 xl:gap-4 shadow-[0_0_0_2px_#000] m-4 xl:m-0"
              >
                <div className="w-12 h-12 xl:w-20 xl:h-20 flex-shrink-0 flex items-center justify-center border-4 border-gray-700 bg-black">
                  <div className="retro-text text-xl xl:text-3xl text-gray-500">👤</div>
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="retro-text text-xs xl:text-base text-gray-300 truncate">
                    {employee.name.toUpperCase()}
                  </h2>
                  <p className="retro-text mt-1 text-[9px] xl:text-[10px] text-gray-500">
                    {employee.role}
                  </p>
                </div>
              </article>
            ))
          )}

          <article className="border-4 border-gray-800 bg-gray-950 p-3 xl:p-4 flex items-center gap-3 xl:gap-4 shadow-[0_0_0_2px_#000] m-4 xl:m-0">
            <div className="w-12 h-12 xl:w-20 xl:h-20 flex-shrink-0 flex items-center justify-center border-4 border-gray-700 bg-black">
              <div className="retro-text text-xl xl:text-3xl text-gray-500">👤</div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="retro-text text-xs xl:text-base text-gray-300 truncate">KITSUNE</h2>
              <p className="retro-text mt-1 text-[9px] xl:text-[10px] text-gray-500">
                Music composition and production
              </p>
            </div>
          </article>
        </section>

        <div className="border-4 border-gray-800 bg-gray-950 p-3 xl:p-4 m-4 xl:m-0">
          <p className="retro-text text-gray-500 text-xs xl:text-xs mb-2">SOURCE</p>
          <a
            href="https://github.com/quackextractor/web-fps"
            target="_blank"
            rel="noopener noreferrer"
            className="retro-text text-red-600 hover:text-red-400 text-xs xl:text-xs break-all"
          >
            https://github.com/quackextractor/web-fps
          </a>
        </div>
      </div>
    </div>
  );
};
