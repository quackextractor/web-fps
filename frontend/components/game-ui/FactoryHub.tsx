import React, { useState, useEffect, useRef } from "react";
import { MenuButton } from "./MenuButton";
import { ScanlinesOverlay } from "./ScanlinesOverlay";
import {
    useEconomy,
    FACTORY_LEVELS,
    SMELTER_CATEGORIES,
    SMELTER_LEVEL_INTERVALS,
    SMELTER_UPGRADE_FACTORS,
    FACTORY_COST,
    NUM_SLOTS,
} from "@/context/EconomyContext";
import type { EconomyMachine } from "@/context/EconomyContext";

interface FactoryHubProps {
    onBack: () => void;
    onOpenArmory: () => void;
    onOpenLeaderboard?: () => void;
    onDeploy?: () => void;
}

type CardFeedback = { type: "success"; text: string } | { type: "error"; text: string } | null;

function formatTime(ms: number): string {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function FactoryCard({ machine, onUpgrade, onCollect }: {
    machine: EconomyMachine;
    onUpgrade: () => boolean;
    onCollect: () => boolean;
}) {
    const lvl = FACTORY_LEVELS[machine.level - 1];
    const isMaxLevel = machine.level >= FACTORY_LEVELS.length;
    const nextLvl = isMaxLevel ? null : FACTORY_LEVELS[machine.level];
    const [feedback, setFeedback] = useState<CardFeedback>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!lvl) {
            return;
        }
        const tick = () => {
            const elapsed = Date.now() - (machine.lastProducedAt ?? Date.now());
            const remaining = Math.max(0, lvl.intervalMs - (elapsed % lvl.intervalMs));
            setTimeLeft(remaining);
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [machine.lastProducedAt, lvl]);

    const progress = lvl ? Math.min(100, Math.round(((lvl.intervalMs - timeLeft) / lvl.intervalMs) * 100)) : 0;

    const showFeedback = (fb: CardFeedback) => {
        if (feedbackTimer.current) {
            clearTimeout(feedbackTimer.current);
        }
        setFeedback(fb);
        feedbackTimer.current = setTimeout(() => {
            setFeedback(null);
            feedbackTimer.current = null;
        }, 1500);
    };

    const handleUpgrade = () => {
        const result = onUpgrade();
        if (result) {
            showFeedback({ type: "success", text: "UPGRADED" });
        } else {
            showFeedback({ type: "error", text: "INSUFFICIENT CREDITS" });
        }
    };

    const handleCollect = () => {
        const result = onCollect();
        if (result) {
            showFeedback({ type: "success", text: `+${lvl?.amount ?? 1} ${(lvl?.output ?? "ore").toUpperCase().replace("_", " ")}` });
        } else {
            showFeedback({ type: "error", text: "NOT READY" });
        }
    };

    return (
        <div className="retro-border bg-gray-950 p-4 flex flex-col justify-between h-full">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <p className="retro-text text-sm text-white tracking-wide">FACTORY</p>
                    <p className="retro-text text-[10px] text-gray-400">LVL {machine.level}/{FACTORY_LEVELS.length}</p>
                </div>
                {lvl && (
                    <p className="retro-text text-[10px] text-gray-400 mb-1">
                        {lvl.amount} {lvl.output.replace("_", " ").toUpperCase()} / {Math.round(lvl.intervalMs / 60000)} MIN
                    </p>
                )}
                <p className="retro-text text-[10px] text-yellow-400 mb-2">NEXT: {formatTime(timeLeft)}</p>
                <div className="w-full h-2 retro-border bg-black mb-3">
                    <div className="h-full bg-yellow-500" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {feedback && (
                <p className={`retro-text text-[10px] mb-2 ${feedback.type === "success" ? "text-green-400" : "text-red-400"}`}>
                    {feedback.text}
                </p>
            )}

            <div className="flex flex-col gap-2">
                <MenuButton onClick={handleCollect} variant="secondary">
                    COLLECT
                </MenuButton>
                {isMaxLevel ? (
                    <div className="opacity-50 pointer-events-none">
                        <MenuButton onClick={() => {}} variant="secondary">MAX</MenuButton>
                    </div>
                ) : (
                    <MenuButton onClick={handleUpgrade} variant="secondary">
                        UPGRADE (${nextLvl?.upgradeCost ?? 0})
                    </MenuButton>
                )}
            </div>
        </div>
    );
}

function SmelterCard({ machine, inputCount, onUpgrade, onCollect }: {
    machine: EconomyMachine;
    inputCount: number;
    onUpgrade: () => boolean;
    onCollect: () => boolean;
}) {
    const cat = SMELTER_CATEGORIES.find((c) => c.id === machine.category);
    const interval = SMELTER_LEVEL_INTERVALS[machine.level - 1];
    const maxLevel = SMELTER_LEVEL_INTERVALS.length;
    const isMaxLevel = machine.level >= maxLevel;
    const [feedback, setFeedback] = useState<CardFeedback>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!interval) {
            return;
        }
        const tick = () => {
            const elapsed = Date.now() - (machine.lastProducedAt ?? Date.now());
            const remaining = Math.max(0, interval - (elapsed % interval));
            setTimeLeft(remaining);
        };
        tick();
        const iv = setInterval(tick, 1000);
        return () => clearInterval(iv);
    }, [machine.lastProducedAt, interval]);

    const progress = interval ? Math.min(100, Math.round(((interval - timeLeft) / interval) * 100)) : 0;
    const canConvert = inputCount > 0;

    let stateText = "CONVERTING";
    let stateColor = "text-yellow-400";
    if (!canConvert) {
        stateText = "NO INPUT";
        stateColor = "text-red-400";
    }

    const showFeedback = (fb: CardFeedback) => {
        if (feedbackTimer.current) {
            clearTimeout(feedbackTimer.current);
        }
        setFeedback(fb);
        feedbackTimer.current = setTimeout(() => {
            setFeedback(null);
            feedbackTimer.current = null;
        }, 1500);
    };

    const handleUpgrade = () => {
        const result = onUpgrade();
        if (result) {
            showFeedback({ type: "success", text: "UPGRADED" });
        } else {
            showFeedback({ type: "error", text: "INSUFFICIENT CREDITS" });
        }
    };

    const handleCollect = () => {
        const result = onCollect();
        if (result) {
            showFeedback({ type: "success", text: `+1 ${(cat?.output ?? "").toUpperCase().replace("_", " ")}` });
        } else {
            showFeedback({ type: "error", text: canConvert ? "NOT READY" : "NO INPUT" });
        }
    };

    const getUpgradeCost = (): number => {
        if (isMaxLevel || !cat) {
            return 0;
        }
        const factorIdx = SMELTER_CATEGORIES.indexOf(cat);
        const baseCost = cat.baseCost * (machine.level + 1);
        return baseCost * SMELTER_UPGRADE_FACTORS[factorIdx];
    };

    return (
        <div className="retro-border bg-gray-950 p-4 flex flex-col justify-between h-full">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <p className="retro-text text-sm text-white tracking-wide">SMELTER</p>
                    <p className={`retro-text text-[10px] ${stateColor}`}>{stateText}</p>
                </div>
                {cat && (
                    <>
                        <p className="retro-text text-[10px] text-gray-400">
                            {cat.input.replace("_", " ").toUpperCase()} &gt; {cat.output.replace("_", " ").toUpperCase()}
                        </p>
                        <p className="retro-text text-[10px] text-gray-400 mb-1">
                            LVL {machine.level}/{maxLevel} | {Math.round((interval ?? 0) / 60000)} MIN/CYCLE
                        </p>
                    </>
                )}
                <p className="retro-text text-[10px] text-gray-400 mb-1">INPUT: {inputCount}</p>
                <p className="retro-text text-[10px] text-yellow-400 mb-2">NEXT: {formatTime(timeLeft)}</p>
                <div className="w-full h-2 retro-border bg-black mb-3">
                    <div className={`h-full ${canConvert ? "bg-yellow-500" : "bg-gray-700"}`} style={{ width: `${canConvert ? progress : 0}%` }} />
                </div>
            </div>

            {feedback && (
                <p className={`retro-text text-[10px] mb-2 ${feedback.type === "success" ? "text-green-400" : "text-red-400"}`}>
                    {feedback.text}
                </p>
            )}

            <div className="flex flex-col gap-2">
                <MenuButton onClick={handleCollect} variant="secondary">
                    COLLECT
                </MenuButton>
                {isMaxLevel ? (
                    <div className="opacity-50 pointer-events-none">
                        <MenuButton onClick={() => {}} variant="secondary">MAX</MenuButton>
                    </div>
                ) : (
                    <MenuButton onClick={handleUpgrade} variant="secondary">
                        UPGRADE (${getUpgradeCost()})
                    </MenuButton>
                )}
            </div>
        </div>
    );
}

function EmptySlot({ slotIndex, onBuild }: {
    slotIndex: number;
    onBuild: (slotIndex: number, type: "factory" | "smelter", category?: string) => boolean;
}) {
    const [showMenu, setShowMenu] = useState(false);
    const [feedback, setFeedback] = useState<CardFeedback>(null);
    const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleBuild = (type: "factory" | "smelter", category?: string) => {
        if (feedbackTimer.current) {
            clearTimeout(feedbackTimer.current);
        }
        const result = onBuild(slotIndex, type, category);
        if (result) {
            setShowMenu(false);
        } else {
            setFeedback({ type: "error", text: "INSUFFICIENT CREDITS" });
            feedbackTimer.current = setTimeout(() => {
                setFeedback(null);
                feedbackTimer.current = null;
            }, 1500);
        }
    };

    if (showMenu) {
        return (
            <div className="border-2 border-dashed border-gray-600 bg-gray-950 p-4 flex flex-col justify-between h-full min-h-[160px]">
                <p className="retro-text text-sm text-white tracking-wide mb-3">BUILD:</p>
                {feedback && (
                    <p className="retro-text text-[10px] text-red-400 mb-2">{feedback.text}</p>
                )}
                <div className="flex flex-col gap-2">
                    <MenuButton onClick={() => handleBuild("factory")} variant="secondary">
                        FACTORY (${FACTORY_COST})
                    </MenuButton>
                    {SMELTER_CATEGORIES.map((cat, idx) => (
                        <MenuButton key={cat.id} onClick={() => handleBuild("smelter", cat.id)} variant="secondary">
                            SMELTER: {cat.input.replace("_", " ").toUpperCase()} &gt; {cat.output.replace("_", " ").toUpperCase()} (${cat.baseCost * SMELTER_UPGRADE_FACTORS[idx]})
                        </MenuButton>
                    ))}
                    <MenuButton onClick={() => setShowMenu(false)} variant="primary">
                        CANCEL
                    </MenuButton>
                </div>
            </div>
        );
    }

    return (
        <div className="border-2 border-dashed border-gray-600 bg-gray-950 p-4 flex flex-col items-center justify-center h-full min-h-[160px]">
            <p className="retro-text text-sm text-gray-600 mb-3">[ EMPTY SLOT ]</p>
            <MenuButton onClick={() => setShowMenu(true)} variant="secondary">
                BUILD
            </MenuButton>
        </div>
    );
}

function LockedSlot({ requiredLevel }: { requiredLevel: number }) {
    return (
        <div className="retro-border bg-gray-950 p-4 flex items-center justify-center h-full min-h-[160px] opacity-50">
            <p className="retro-text text-sm text-gray-500">LOCKED (CLEAR LVL {requiredLevel})</p>
        </div>
    );
}

export const FactoryHub: React.FC<FactoryHubProps> = ({
    onBack,
    onOpenArmory,
    onOpenLeaderboard,
    onDeploy,
}) => {
    const { saveData, username, cloudStatus, refreshFromCloud, forceCloudSave, buySlotMachine, upgradeMachine, collectMachine } = useEconomy();

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
    const plasmoidBar = saveData.inventory.plasmoid_bar ?? 0;

    const slots: (EconomyMachine | null)[] = [];
    for (let idx = 0; idx < NUM_SLOTS; idx++) {
        const machine = saveData.machines.find((m) => m.id === `slot_${idx}`);
        slots.push(machine ?? null);
    }

    const getInputCount = (machine: EconomyMachine): number => {
        if (machine.type === "smelter") {
            const cat = SMELTER_CATEGORIES.find((c) => c.id === machine.category);
            if (cat) {
                return saveData.inventory[cat.input] ?? 0;
            }
        }
        return 0;
    };

    return (
        <div className="fixed md:absolute inset-0 flex flex-col items-center justify-center bg-black p-0 md:p-4 select-none pointer-events-auto">
            <ScanlinesOverlay />

            <div className="relative z-10 w-full max-w-4xl bg-black retro-border p-4 md:p-8 overflow-y-auto max-h-full">
                <h1 className="retro-text text-3xl md:text-5xl text-red-600 mb-3 text-center tracking-tighter" style={{ textShadow: "4px 4px 0px #300000" }}>
                    FACTORY HUB
                </h1>
                <h2 className="retro-text text-[9px] md:text-[10px] text-gray-500 text-center mb-4 tracking-widest">
                    PRODUCTION CONTROL TERMINAL
                </h2>

                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 mb-4 px-1">
                    <p className="retro-text text-xs text-gray-400 tracking-widest">
                        EMP: <span className="text-white">{operatorName}</span>
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <p className="retro-text text-xs text-gray-400 tracking-widest">
                            CREDITS: <span className="text-green-400">${saveData.credits}</span>
                        </p>
                        <p className="retro-text text-xs text-gray-400 tracking-widest">
                            RED ORE: <span className="text-red-400">{oreRed}</span>
                        </p>
                        <p className="retro-text text-xs text-gray-400 tracking-widest">
                            GREEN ORE: <span className="text-emerald-400">{oreGreen}</span>
                        </p>
                        <p className="retro-text text-xs text-gray-400 tracking-widest">
                            IRON: <span className="text-white">{ironBar}</span>
                        </p>
                        <p className="retro-text text-xs text-gray-400 tracking-widest">
                            PLASMOID: <span className="text-purple-400">{plasmoidBar}</span>
                        </p>
                    </div>
                </div>

                <div className="w-full h-px bg-gray-700 mb-4" />

                <p className="retro-text text-[9px] text-gray-500 text-right mb-6 tracking-widest">
                    CLOUD {cloudStatusText}
                </p>

                <h3 className="retro-text text-xs text-gray-400 tracking-widest mb-3">ACTIVE SLOTS</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {slots.map((machine, idx) => {
                        const isUnlocked = idx <= saveData.highestLevelCompleted;
                        if (!isUnlocked) {
                            return <LockedSlot key={`locked-${idx}`} requiredLevel={idx + 1} />;
                        }
                        if (!machine) {
                            return <EmptySlot key={`empty-${idx}`} slotIndex={idx} onBuild={buySlotMachine} />;
                        }
                        if (machine.type === "factory") {
                            return (
                                <FactoryCard
                                    key={machine.id}
                                    machine={machine}
                                    onUpgrade={() => upgradeMachine(machine.id)}
                                    onCollect={() => collectMachine(machine.id)}
                                />
                            );
                        }
                        if (machine.type === "smelter") {
                            return (
                                <SmelterCard
                                    key={machine.id}
                                    machine={machine}
                                    inputCount={getInputCount(machine)}
                                    onUpgrade={() => upgradeMachine(machine.id)}
                                    onCollect={() => collectMachine(machine.id)}
                                />
                            );
                        }
                        return null;
                    })}
                </div>

                <h3 className="retro-text text-xs text-gray-400 tracking-widest mb-3">SYNC OPERATIONS</h3>
                <div className="flex gap-3 mb-4">
                    <MenuButton onClick={async () => { await forceCloudSave(); }} variant="secondary">
                        SAVE
                    </MenuButton>
                    <MenuButton onClick={async () => { await refreshFromCloud(); }} variant="secondary">
                        LOAD
                    </MenuButton>
                </div>

                <h3 className="retro-text text-xs text-gray-400 tracking-widest mb-3">NAVIGATION</h3>
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
