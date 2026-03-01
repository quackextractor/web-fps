import React from "react";
import { MenuButton } from "./MenuButton";
import { ScanlinesOverlay } from "./ScanlinesOverlay";
import { useEconomy } from "@/context/EconomyContext";
import type { EconomyMachine } from "@/context/EconomyContext";

const TOTAL_PLOTS = 6;
const SILO_CAPACITY_BASE = 100;

interface FactoryHubProps {
    onBack: () => void;
    onOpenArmory: () => void;
    onOpenLeaderboard?: () => void;
    onDeploy?: () => void;
}

function SiloCard({ oreTotal, capacity, level }: { oreTotal: number; capacity: number; level: number }) {
    const fillPercent = capacity > 0 ? Math.min(Math.round((oreTotal / capacity) * 100), 100) : 0;

    return (
        <div className="retro-border bg-gray-950 p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
                <p className="retro-text text-sm text-white tracking-wide">ORE SILO</p>
                <p className="retro-text text-[10px] text-gray-400">LVL {level}</p>
            </div>
            <p className="retro-text text-[10px] text-gray-400 mb-2">Capacity: {fillPercent}% Full</p>
            <div className="w-full h-4 retro-border bg-black mb-3">
                <div
                    className="h-full bg-green-500"
                    style={{ width: `${fillPercent}%` }}
                />
            </div>
            <div className="opacity-50 pointer-events-none">
                <MenuButton onClick={() => {}} variant="secondary">
                    UPGRADE ($500)
                </MenuButton>
            </div>
        </div>
    );
}

function SmelterCard({ machine, index, onCollect }: { machine: EconomyMachine; index: number; onCollect: () => void }) {
    const stateText = machine.active ? "WORKING" : "IDLE";
    let outputText = "Iron Bar";
    if (machine.type === "smelter_green") {
        outputText = "Plasmoid Bar";
    }

    return (
        <div className="retro-border bg-gray-950 p-4 flex flex-col justify-between h-full">
            <div>
                <p className="retro-text text-sm text-white tracking-wide mb-2">SMELTER LINE {index + 1}</p>
                <p className="retro-text text-[10px] text-gray-400">State: {stateText}</p>
                <p className="retro-text text-[10px] text-gray-400 mb-3">Output: {outputText}</p>
            </div>
            <MenuButton onClick={onCollect} variant="secondary">
                COLLECT
            </MenuButton>
        </div>
    );
}

function EmptyPlot() {
    return (
        <div className="border-2 border-dashed border-gray-600 bg-gray-950 p-4 flex flex-col items-center justify-center h-full min-h-[160px]">
            <p className="retro-text text-sm text-gray-600 mb-3">[ EMPTY PLOT ]</p>
            <div className="opacity-50 pointer-events-none">
                <MenuButton onClick={() => {}} variant="secondary">
                    EXPAND
                </MenuButton>
            </div>
        </div>
    );
}

function LockedPlot({ requiredLevel }: { requiredLevel: number }) {
    return (
        <div className="retro-border bg-gray-950 p-4 flex items-center justify-center h-full min-h-[160px] opacity-50">
            <p className="retro-text text-sm text-gray-500">LOCKED (LVL {requiredLevel})</p>
        </div>
    );
}

export const FactoryHub: React.FC<FactoryHubProps> = ({
    onBack,
    onOpenArmory,
    onOpenLeaderboard,
    onDeploy,
}) => {
    const { saveData, username, cloudStatus, refreshFromCloud, convertOreToBar, forceCloudSave } = useEconomy();

    let operatorName = "GUEST";
    if (username.length > 0) {
        operatorName = username.toUpperCase();
    }

    let cloudStatusText = "IDLE";
    if (cloudStatus === "syncing") {
        cloudStatusText = "SYNCING";
    }
    if (cloudStatus === "synced") {
        cloudStatusText = "SYNCED";
    }
    if (cloudStatus === "error") {
        cloudStatusText = "ERROR";
    }

    const oreRed = saveData.inventory.ore_red ?? 0;
    const oreGreen = saveData.inventory.ore_green ?? 0;
    const ironBar = saveData.inventory.iron_bar ?? 0;
    const oreTotal = oreRed + oreGreen;
    const siloLevel = 1;
    const siloCapacity = SILO_CAPACITY_BASE * siloLevel;

    const machines = saveData.machines;
    const usedSlots = 1 + machines.length;
    const emptySlots = Math.max(TOTAL_PLOTS - usedSlots - 2, 0);
    const lockedSlots = TOTAL_PLOTS - usedSlots - emptySlots;

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-4 select-none pointer-events-auto">
            <ScanlinesOverlay />

            <div className="relative z-10 w-full max-w-4xl bg-black retro-border p-4 md:p-8 overflow-y-auto max-h-full">

                {/* Step A: top resource bar */}
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 mb-4 px-1">
                    <p className="retro-text text-xs text-gray-400 tracking-widest">
                        EMP: <span className="text-white">{operatorName}</span>
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <p className="retro-text text-xs text-gray-400 tracking-widest">
                            CREDITS: <span className="text-green-400">${saveData.credits}</span>
                        </p>
                        <p className="retro-text text-xs text-gray-400 tracking-widest">
                            IRON: <span className="text-white">{ironBar}</span>
                        </p>
                        <p className="retro-text text-xs text-gray-400 tracking-widest">
                            ORE: <span className="text-green-400">{oreTotal}</span>
                        </p>
                    </div>
                </div>

                <div className="w-full h-px bg-gray-700 mb-4" />

                <p className="retro-text text-[9px] text-gray-500 text-right mb-6 tracking-widest">
                    CLOUD {cloudStatusText}
                </p>

                {/* Step B: plot grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <SiloCard oreTotal={oreTotal} capacity={siloCapacity} level={siloLevel} />

                    {machines.map((machine, idx) => (
                        <SmelterCard
                            key={machine.id}
                            machine={machine}
                            index={idx}
                            onCollect={() => { convertOreToBar("ore_red", "iron_bar", 2, 1); }}
                        />
                    ))}

                    {Array.from({ length: emptySlots }).map((_, idx) => (
                        <EmptyPlot key={`empty-${idx}`} />
                    ))}

                    {Array.from({ length: lockedSlots }).map((_, idx) => (
                        <LockedPlot key={`locked-${idx}`} requiredLevel={idx + 2} />
                    ))}
                </div>

                {/* Action bar */}
                <div className="flex gap-3 mb-4">
                    <MenuButton onClick={async () => { await forceCloudSave(); }} variant="secondary">
                        SAVE
                    </MenuButton>
                    <MenuButton onClick={async () => { await refreshFromCloud(); }} variant="secondary">
                        LOAD
                    </MenuButton>
                </div>

                <div className="flex gap-3">
                    <MenuButton onClick={onOpenArmory} variant="secondary">ARMORY</MenuButton>
                    {onDeploy && (
                        <MenuButton onClick={onDeploy} variant="danger">DEPLOY MISSION</MenuButton>
                    )}
                    <MenuButton onClick={onBack} variant="primary">MAIN MENU</MenuButton>
                </div>
            </div>
        </div>
    );
};
