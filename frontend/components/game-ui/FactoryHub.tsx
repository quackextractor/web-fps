import React from "react";
import { MenuButton } from "./MenuButton";
import { ScanlinesOverlay } from "./ScanlinesOverlay";
import { useEconomy } from "@/context/EconomyContext";

interface FactoryHubProps {
    onBack: () => void;
    onOpenArmory: () => void;
    onOpenLeaderboard: () => void;
    onDeploy: () => void;
}

export const FactoryHub: React.FC<FactoryHubProps> = ({
    onBack,
    onOpenArmory,
    onOpenLeaderboard,
    onDeploy,
}) => {
    const { saveData, username, netWorth, kills, cloudStatus, refreshFromCloud, convertOreToBar, forceCloudSave } = useEconomy();

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

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-4 select-none pointer-events-auto">
            <ScanlinesOverlay />

            <div className="relative z-10 w-full max-w-4xl bg-black retro-border p-4 md:p-8 overflow-y-auto max-h-full">
                <h2 className="retro-text text-3xl md:text-5xl text-red-600 mb-3 text-center tracking-tighter" style={{ textShadow: "4px 4px 0px #300000" }}>
                    FACTORY HUB
                </h2>

                <p className="retro-text text-xs text-center text-gray-400 mb-8 tracking-widest">
                    OPERATOR {operatorName} | CLOUD {cloudStatusText}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="retro-border bg-gray-950 p-4">
                        <p className="retro-text text-[10px] text-red-400 mb-2">CREDITS</p>
                        <p className="retro-text text-2xl text-white">${saveData.credits}</p>
                    </div>

                    <div className="retro-border bg-gray-950 p-4">
                        <p className="retro-text text-[10px] text-red-400 mb-2">NET WORTH</p>
                        <p className="retro-text text-2xl text-white">${netWorth}</p>
                    </div>

                    <div className="retro-border bg-gray-950 p-4">
                        <p className="retro-text text-[10px] text-red-400 mb-2">KILLS</p>
                        <p className="retro-text text-2xl text-white">{kills}</p>
                    </div>

                    <div className="retro-border bg-gray-950 p-4">
                        <p className="retro-text text-[10px] text-red-400 mb-2">ACTIVE SMELTERS</p>
                        <p className="retro-text text-2xl text-white">{saveData.machines.length}</p>
                    </div>

                    <div className="retro-border bg-gray-950 p-4">
                        <p className="retro-text text-[10px] text-red-400 mb-2">ORE RED</p>
                        <p className="retro-text text-2xl text-white">{saveData.inventory.ore_red ?? 0}</p>
                    </div>

                    <div className="retro-border bg-gray-950 p-4">
                        <p className="retro-text text-[10px] text-red-400 mb-2">ORE GREEN</p>
                        <p className="retro-text text-2xl text-white">{saveData.inventory.ore_green ?? 0}</p>
                    </div>

                    <div className="retro-border bg-gray-950 p-4 md:col-span-2">
                        <p className="retro-text text-[10px] text-red-400 mb-2">IRON BAR STOCK</p>
                        <p className="retro-text text-2xl text-white">{saveData.inventory.iron_bar ?? 0}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    <MenuButton onClick={() => convertOreToBar("ore_red", "iron_bar", 2, 1)} variant="secondary">
                        SMELT RED ORE (2 TO 1 BAR)
                    </MenuButton>
                    <MenuButton onClick={async () => { await forceCloudSave(); }} variant="secondary">
                        FORCE CLOUD SAVE
                    </MenuButton>
                    <MenuButton onClick={async () => { await refreshFromCloud(); }} variant="secondary">
                        REFRESH CLOUD DATA
                    </MenuButton>
                    <MenuButton onClick={onDeploy}>
                        DEPLOY TO MISSION
                    </MenuButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <MenuButton onClick={onOpenArmory} variant="secondary">ARMORY</MenuButton>
                    <MenuButton onClick={onOpenLeaderboard} variant="secondary">LEADERBOARD</MenuButton>
                    <MenuButton onClick={onBack} variant="danger">MAIN MENU</MenuButton>
                </div>
            </div>
        </div>
    );
};
