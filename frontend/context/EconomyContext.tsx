"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export const FACTORY_LEVELS = [
    { output: "ore_red", amount: 1, intervalMs: 20 * 60 * 1000, upgradeCost: 0 },
    { output: "ore_red", amount: 1, intervalMs: 15 * 60 * 1000, upgradeCost: 500 },
    { output: "ore_red", amount: 1, intervalMs: 5 * 60 * 1000, upgradeCost: 1500 },
    { output: "ore_red", amount: 1, intervalMs: 15 * 60 * 1000, upgradeCost: 2500 },
    { output: "ore_green", amount: 1, intervalMs: 10 * 60 * 1000, upgradeCost: 4500 },
    { output: "ore_green", amount: 2, intervalMs: 5 * 60 * 1000, upgradeCost: 10000 },
] as const;

export const SMELTER_CATEGORIES = [
    { id: "red_to_green", input: "ore_red", output: "ore_green", baseCost: 100 },
    { id: "green_to_iron", input: "ore_green", output: "iron_bar", baseCost: 200 },
    { id: "iron_to_plasmoid", input: "iron_bar", output: "plasmoid_bar", baseCost: 300 },
] as const;

export const SMELTER_LEVEL_INTERVALS = [
    20 * 60 * 1000,
    15 * 60 * 1000,
    10 * 60 * 1000,
    5 * 60 * 1000,
] as const;

export const SMELTER_UPGRADE_FACTORS = [1, 2, 4] as const;

export const FACTORY_COST = 200;
export const NUM_SLOTS = 3;

export interface EconomyInventory {
    [resource: string]: number;
}

export interface EconomyMachine {
    id: string;
    type: "factory" | "smelter";
    level: number;
    category?: string;
    lastProducedAt?: number;
    active: boolean;
}

export interface EconomySaveData {
    credits: number;
    inventory: EconomyInventory;
    machines: EconomyMachine[];
    unlockedWeapons: string[];
    highestLevelCompleted: number;
    last_saved_at?: number;
}

interface EconomyContextType {
    saveData: EconomySaveData;
    username: string;
    netWorth: number;
    kills: number;
    cloudStatus: "idle" | "syncing" | "synced" | "error";
    cloudError: string;
    isAuthenticated: boolean;
    login: (username: string, password: string, loginToken: string) => Promise<boolean>;
    logout: () => void;
    refreshFromCloud: () => Promise<boolean>;
    forceCloudSave: (netWorth?: number, kills?: number) => Promise<boolean>;
    addResource: (resource: string, amount: number) => void;
    spendResource: (resource: string, amount: number) => boolean;
    convertOreToBar: (oreType: string, barType: string, oreAmount: number, barAmount: number) => boolean;
    buySlotMachine: (slotIndex: number, machineType: "factory" | "smelter", category?: string) => boolean;
    upgradeMachine: (machineId: string) => boolean;
    collectMachine: (machineId: string) => boolean;
    unlockWeapon: (weapon: string, barCost: number, creditCost: number) => boolean;
    incrementKills: (amount: number) => void;
}

const initialSaveData: EconomySaveData = {
    credits: 500,
    inventory: {
        ore_red: 0,
        ore_green: 0,
        iron_bar: 0,
        plasmoid_bar: 0,
    },
    machines: [
        { id: "factory_slot0", type: "factory", level: 1, lastProducedAt: Date.now(), active: true },
    ],
    unlockedWeapons: ["fist", "pistol"],
    highestLevelCompleted: 0,
    last_saved_at: Date.now(),
};

const EconomyContext = createContext<EconomyContextType | null>(null);

export function EconomyProvider({ children }: { children: React.ReactNode }) {
    const [saveData, setSaveData] = useState<EconomySaveData>(initialSaveData);
    const [username, setUsername] = useState("");
    const [netWorth, setNetWorth] = useState(0);
    const [kills, setKills] = useState(0);
    const [cloudStatus, setCloudStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");
    const [cloudError, setCloudError] = useState("");
    const credentialsRef = useRef<{ username: string }>({ username: "" });

    const isAuthenticated = useMemo(() => {
        if (username.length === 0) {
            return false;
        }
        return true;
    }, [username]);

    const applySaveData = useCallback((incoming: Partial<EconomySaveData> | null | undefined) => {
        if (!incoming) {
            return;
        }

        setSaveData((previous) => {
            const nextInventory: EconomyInventory = { ...previous.inventory };
            if (incoming.inventory) {
                nextInventory.ore_red = incoming.inventory.ore_red ?? nextInventory.ore_red ?? 0;
                nextInventory.ore_green = incoming.inventory.ore_green ?? nextInventory.ore_green ?? 0;
                nextInventory.iron_bar = incoming.inventory.iron_bar ?? nextInventory.iron_bar ?? 0;
                nextInventory.plasmoid_bar = incoming.inventory.plasmoid_bar ?? nextInventory.plasmoid_bar ?? 0;
            }

            const nextMachines = incoming.machines ?? previous.machines;
            const nextWeapons = incoming.unlockedWeapons ?? previous.unlockedWeapons;
            const nextHighest = incoming.highestLevelCompleted ?? previous.highestLevelCompleted;
            const nextCredits = incoming.credits ?? previous.credits;
            const nextLast = incoming.last_saved_at ?? previous.last_saved_at;

            return {
                credits: nextCredits,
                inventory: nextInventory,
                machines: nextMachines,
                unlockedWeapons: nextWeapons,
                highestLevelCompleted: nextHighest,
                last_saved_at: nextLast,
            };
        });
    }, []);

    const processProductionTick = useCallback(() => {
        const now = Date.now();
        setSaveData((prev) => {
            if (!prev.machines || prev.machines.length === 0) {
                return prev;
            }
            const next = { ...prev, inventory: { ...prev.inventory }, machines: prev.machines.map((m) => ({ ...m })) };
            for (const m of next.machines) {
                if (!m.active) {
                    continue;
                }
                const lastProduced = m.lastProducedAt ?? now;
                if (m.type === "factory") {
                    const lvl = FACTORY_LEVELS[m.level - 1];
                    if (!lvl) {
                        continue;
                    }
                    const elapsed = now - lastProduced;
                    const cycles = Math.floor(elapsed / lvl.intervalMs);
                    if (cycles > 0) {
                        next.inventory[lvl.output] = (next.inventory[lvl.output] ?? 0) + (lvl.amount * cycles);
                        m.lastProducedAt = lastProduced + (cycles * lvl.intervalMs);
                    }
                } else if (m.type === "smelter") {
                    const cat = SMELTER_CATEGORIES.find((c) => c.id === m.category);
                    if (!cat) {
                        continue;
                    }
                    const interval = SMELTER_LEVEL_INTERVALS[m.level - 1];
                    if (!interval) {
                        continue;
                    }
                    const elapsed = now - lastProduced;
                    const cycles = Math.floor(elapsed / interval);
                    if (cycles > 0) {
                        const inputAvailable = next.inventory[cat.input] ?? 0;
                        const actualCycles = Math.min(cycles, inputAvailable);
                        if (actualCycles > 0) {
                            next.inventory[cat.input] = inputAvailable - actualCycles;
                            next.inventory[cat.output] = (next.inventory[cat.output] ?? 0) + actualCycles;
                        }
                        m.lastProducedAt = lastProduced + (cycles * interval);
                    }
                }
            }
            return next;
        });
    }, []);

    const incrementKills = useCallback((amount: number) => {
        setKills(prev => prev + amount);
    }, []);

    const awardOfflineProgress = useCallback((lastSavedAt?: number) => {
        const now = Date.now();
        const last = typeof lastSavedAt === "number" ? lastSavedAt : undefined;
        if (!last || (last >= now)) {
            setSaveData((p) => ({ ...p, last_saved_at: now }));
            return;
        }
        setSaveData((prev) => {
            const next = { ...prev, inventory: { ...prev.inventory }, machines: prev.machines.map((m) => ({ ...m })), last_saved_at: now };
            for (const m of next.machines) {
                if (!m.active) {
                    continue;
                }
                const machineLastProduced = m.lastProducedAt ?? last;
                if (m.type === "factory") {
                    const lvl = FACTORY_LEVELS[m.level - 1];
                    if (!lvl) {
                        continue;
                    }
                    const elapsed = now - machineLastProduced;
                    const cycles = Math.floor(elapsed / lvl.intervalMs);
                    if (cycles > 0) {
                        next.inventory[lvl.output] = (next.inventory[lvl.output] ?? 0) + (lvl.amount * cycles);
                        m.lastProducedAt = machineLastProduced + (cycles * lvl.intervalMs);
                    }
                } else if (m.type === "smelter") {
                    const cat = SMELTER_CATEGORIES.find((c) => c.id === m.category);
                    if (!cat) {
                        continue;
                    }
                    const interval = SMELTER_LEVEL_INTERVALS[m.level - 1];
                    if (!interval) {
                        continue;
                    }
                    const elapsed = now - machineLastProduced;
                    const cycles = Math.floor(elapsed / interval);
                    if (cycles > 0) {
                        const inputAvailable = next.inventory[cat.input] ?? 0;
                        const actualCycles = Math.min(cycles, inputAvailable);
                        if (actualCycles > 0) {
                            next.inventory[cat.input] = inputAvailable - actualCycles;
                            next.inventory[cat.output] = (next.inventory[cat.output] ?? 0) + actualCycles;
                        }
                        m.lastProducedAt = machineLastProduced + (cycles * interval);
                    }
                }
            }
            return next;
        });
    }, []);

    const forceCloudSave = useCallback(async (netWorthOverride?: number, killsOverride?: number) => {
        if (!isAuthenticated) return false;
        
        try {
            setCloudStatus("syncing");
            setCloudError("");
            
            const payload: any = {
                credits: saveData.credits,
                inventory: saveData.inventory,
                machines: saveData.machines,
                unlockedWeapons: saveData.unlockedWeapons,
                highestLevelCompleted: saveData.highestLevelCompleted,
                last_saved_at: Date.now(),
            };

            if (netWorthOverride !== undefined) {
                payload.net_worth = netWorthOverride;
            } else {
                payload.net_worth = netWorth;
            }

            if (killsOverride !== undefined) {
                payload.kills = killsOverride;
            } else {
                payload.kills = kills;
            }

            const response = await fetch("/api/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                setCloudStatus("error");
                setCloudError(data.error || "Failed to save");
                return false;
            }

            const data = await response.json();
            applySaveData(data.saveData);
            setCloudStatus("synced");
            try {
                const key = `industrialist_save_${credentialsRef.current.username || "guest"}`;
                if (typeof window !== "undefined" && window.localStorage) {
                    window.localStorage.setItem(key, JSON.stringify(payload));
                }
            } catch { void 0; }
            return true;
        } catch {
            try {
                const offlinePayload = {
                    credits: saveData.credits,
                    inventory: saveData.inventory,
                    machines: saveData.machines,
                    unlockedWeapons: saveData.unlockedWeapons,
                    highestLevelCompleted: saveData.highestLevelCompleted,
                    last_saved_at: Date.now(),
                };
                const key = `industrialist_save_${credentialsRef.current.username || "guest"}`;
                if (typeof window !== "undefined" && window?.localStorage) {
                    window.localStorage.setItem(key, JSON.stringify(offlinePayload));
                }
            } catch { void 0; }
            setCloudStatus("error");
            setCloudError("Sync Error - saved locally");
            return false;
        }
    }, [applySaveData, saveData, netWorth, kills, isAuthenticated]);

    const refreshFromCloud = useCallback(async () => {
        if (credentialsRef.current.username.length === 0) {
            setCloudStatus("error");
            setCloudError("You must log in first");
            return false;
        }

        setCloudStatus("syncing");
        setCloudError("");

        try {
            const response = await fetch("/api/save", { method: "GET" });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                setCloudStatus("error");
                setCloudError(data.error || "Failed to load");
                return false;
            }

            const data = await response.json();
            applySaveData(data.saveData);
            if (data?.saveData?.last_saved_at !== undefined) {
                awardOfflineProgress(data.saveData.last_saved_at);
            } else {
                awardOfflineProgress(undefined);
            }
            if (typeof data.username === "string") {
                setUsername(data.username);
            }
            if (typeof data.net_worth === "number") {
                setNetWorth(data.net_worth);
            }
            if (typeof data.kills === "number") {
                setKills(data.kills);
            }
            setCloudStatus("synced");
            return true;
        } catch {
            setCloudStatus("error");
            setCloudError("Network error while loading");
            return false;
        }
    }, [applySaveData]);

    const login = useCallback(async (nextUsername: string, nextPassword: string, loginToken: string) => {
        setCloudStatus("syncing");
        setCloudError("");

        if (loginToken.trim().length === 0) {
            setCloudStatus("error");
            setCloudError("Missing login token");
            return false;
        }

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: nextUsername,
                    password: nextPassword,
                    loginToken,
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                setCloudStatus("error");
                setCloudError(data.error || "Invalid credentials");
                return false;
            }

            const data = await response.json();
            credentialsRef.current = { username: nextUsername };
            setUsername(nextUsername);
            applySaveData(data.saveData);
            if (data?.saveData?.last_saved_at !== undefined) {
                awardOfflineProgress(data.saveData.last_saved_at);
            } else {
                awardOfflineProgress(undefined);
            }
            if (typeof data.netWorth === "number") {
                setNetWorth(data.netWorth);
            }
            if (typeof data.kills === "number") {
                setKills(data.kills);
            }
            setCloudStatus("synced");
            return true;
        } catch {
            console.log("Network error, falling back to offline mode for testing");
            credentialsRef.current = { username: nextUsername };
            setUsername(nextUsername);
            setCloudStatus("error");
            setCloudError("Offline Mode");
            // Try to load from local storage if available
            if (typeof window !== "undefined" && window.localStorage) {
                const key = `industrialist_save_${nextUsername}`;
                const stored = window.localStorage.getItem(key);
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        applySaveData(parsed);
                        if (parsed.last_saved_at) {
                            awardOfflineProgress(parsed.last_saved_at);
                        }
                    } catch { void 0; }
                }
            }
            return true;
        }
    }, [applySaveData]);

    const logout = useCallback(() => {
        credentialsRef.current = { username: "" };
        setUsername("");
        setNetWorth(0);
        setKills(0);
        setSaveData(initialSaveData);
        setCloudStatus("idle");
        setCloudError("");
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        const interval = setInterval(() => {
            void forceCloudSave();
        }, 45000);

        return () => {
            clearInterval(interval);
        };
    }, [forceCloudSave, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }
        const interval = setInterval(() => {
            processProductionTick();
        }, 5000);
        return () => clearInterval(interval);
    }, [isAuthenticated, processProductionTick]);

    useEffect(() => {
        if (!isAuthenticated) return;
        try {
            const key = `industrialist_save_${credentialsRef.current.username || "guest"}`;
            if (typeof window !== "undefined" && window.localStorage) {
                window.localStorage.setItem(key, JSON.stringify({
                    ...saveData,
                    last_saved_at: Date.now(),
                }));
            }
        } catch { void 0; }
    }, [saveData, isAuthenticated]);

    const addResource = useCallback((resource: string, amount: number) => {
        if (amount <= 0) {
            return;
        }

        setSaveData((previous) => {
            if (resource === "credits") {
                return {
                    ...previous,
                    credits: previous.credits + amount,
                };
            }

            const currentAmount = previous.inventory[resource] ?? 0;
            return {
                ...previous,
                inventory: {
                    ...previous.inventory,
                    [resource]: currentAmount + amount,
                },
            };
        });
    }, []);

    const spendResource = useCallback((resource: string, amount: number) => {
        if (amount <= 0) {
            return false;
        }

        let spent = false;
        setSaveData((previous) => {
            if (resource === "credits") {
                if (previous.credits < amount) {
                    spent = false;
                    return previous;
                }
                spent = true;
                return {
                    ...previous,
                    credits: previous.credits - amount,
                };
            }
            const currentAmount = previous.inventory[resource] ?? 0;
            if (currentAmount < amount) {
                spent = false;
                return previous;
            }

            spent = true;
            return {
                ...previous,
                inventory: {
                    ...previous.inventory,
                    [resource]: currentAmount - amount,
                },
            };
        });

        return spent;
    }, []);

    const convertOreToBar = useCallback((oreType: string, barType: string, oreAmount: number, barAmount: number) => {
        if (oreAmount <= 0 || barAmount <= 0) {
            return false;
        }

        let converted = false;
        setSaveData((previous) => {
            const currentOre = previous.inventory[oreType] ?? 0;
            const currentBar = previous.inventory[barType] ?? 0;
            if (currentOre < oreAmount) {
                converted = false;
                return previous;
            }

            converted = true;
            return {
                ...previous,
                inventory: {
                    ...previous.inventory,
                    [oreType]: currentOre - oreAmount,
                    [barType]: currentBar + barAmount,
                },
            };
        });

        return converted;
    }, []);

    const buySlotMachine = useCallback((slotIndex: number, machineType: "factory" | "smelter", category?: string): boolean => {
        let bought = false;
        setSaveData((prev) => {
            if (slotIndex < 0 || slotIndex >= NUM_SLOTS) {
                return prev;
            }
            if (slotIndex > prev.highestLevelCompleted) {
                return prev;
            }
            const existingInSlot = prev.machines.find((m) => m.id === `slot_${slotIndex}`);
            if (existingInSlot) {
                return prev;
            }

            let cost = 0;
            if (machineType === "factory") {
                cost = FACTORY_COST;
            } else if ((machineType === "smelter") && category) {
                const cat = SMELTER_CATEGORIES.find((c) => c.id === category);
                if (!cat) {
                    return prev;
                }
                const factorIdx = SMELTER_CATEGORIES.indexOf(cat);
                cost = cat.baseCost * SMELTER_UPGRADE_FACTORS[factorIdx];
            } else {
                return prev;
            }

            if (prev.credits < cost) {
                return prev;
            }

            bought = true;
            const newMachine: EconomyMachine = {
                id: `slot_${slotIndex}`,
                type: machineType,
                level: 1,
                category: machineType === "smelter" ? category : undefined,
                lastProducedAt: Date.now(),
                active: true,
            };
            return {
                ...prev,
                credits: prev.credits - cost,
                machines: [...prev.machines, newMachine],
            };
        });
        return bought;
    }, []);

    const upgradeMachine = useCallback((machineId: string): boolean => {
        let upgraded = false;
        setSaveData((prev) => {
            const machine = prev.machines.find((m) => m.id === machineId);
            if (!machine || !machine.active) {
                return prev;
            }

            let cost = 0;
            let maxLevel = 0;
            if (machine.type === "factory") {
                maxLevel = FACTORY_LEVELS.length;
                if (machine.level >= maxLevel) {
                    return prev;
                }
                cost = FACTORY_LEVELS[machine.level].upgradeCost;
            } else if (machine.type === "smelter") {
                maxLevel = SMELTER_LEVEL_INTERVALS.length;
                if (machine.level >= maxLevel) {
                    return prev;
                }
                const cat = SMELTER_CATEGORIES.find((c) => c.id === machine.category);
                if (!cat) {
                    return prev;
                }
                const factorIdx = SMELTER_CATEGORIES.indexOf(cat);
                const baseCost = cat.baseCost * (machine.level + 1);
                cost = baseCost * SMELTER_UPGRADE_FACTORS[factorIdx];
            } else {
                return prev;
            }

            if (prev.credits < cost) {
                return prev;
            }

            upgraded = true;
            return {
                ...prev,
                credits: prev.credits - cost,
                machines: prev.machines.map((m) => {
                    if (m.id === machineId) {
                        return { ...m, level: m.level + 1 };
                    }
                    return m;
                }),
            };
        });
        return upgraded;
    }, []);

    const collectMachine = useCallback((machineId: string): boolean => {
        const now = Date.now();
        let collected = false;
        setSaveData((prev) => {
            const machine = prev.machines.find((m) => m.id === machineId);
            if (!machine || !machine.active) {
                return prev;
            }

            const next = { ...prev, inventory: { ...prev.inventory }, machines: prev.machines.map((m) => ({ ...m })) };
            const mRef = next.machines.find((m) => m.id === machineId);
            if (!mRef) {
                return prev;
            }
            const lastProduced = mRef.lastProducedAt ?? now;

            if (mRef.type === "factory") {
                const lvl = FACTORY_LEVELS[mRef.level - 1];
                if (!lvl) {
                    return prev;
                }
                const elapsed = now - lastProduced;
                const cycles = Math.floor(elapsed / lvl.intervalMs);
                if (cycles <= 0) {
                    return prev;
                }
                collected = true;
                next.inventory[lvl.output] = (next.inventory[lvl.output] ?? 0) + (lvl.amount * cycles);
                mRef.lastProducedAt = lastProduced + (cycles * lvl.intervalMs);
            } else if (mRef.type === "smelter") {
                const cat = SMELTER_CATEGORIES.find((c) => c.id === mRef.category);
                if (!cat) {
                    return prev;
                }
                const interval = SMELTER_LEVEL_INTERVALS[mRef.level - 1];
                if (!interval) {
                    return prev;
                }
                const elapsed = now - lastProduced;
                const cycles = Math.floor(elapsed / interval);
                if (cycles <= 0) {
                    return prev;
                }
                const inputAvailable = next.inventory[cat.input] ?? 0;
                const actualCycles = Math.min(cycles, inputAvailable);
                if (actualCycles <= 0) {
                    mRef.lastProducedAt = now;
                    return next;
                }
                collected = true;
                next.inventory[cat.input] = inputAvailable - actualCycles;
                next.inventory[cat.output] = (next.inventory[cat.output] ?? 0) + actualCycles;
                mRef.lastProducedAt = lastProduced + (cycles * interval);
            }
            return next;
        });
        return collected;
    }, []);

    const unlockWeapon = useCallback((weapon: string, barCost: number, creditCost: number) => {
        if (barCost < 0 || creditCost < 0) {
            return false;
        }

        let unlocked = false;

        setSaveData((previous) => {
            if (previous.unlockedWeapons.includes(weapon)) {
                unlocked = false;
                return previous;
            }

            const bars = previous.inventory.iron_bar ?? 0;
            if (bars < barCost) {
                unlocked = false;
                return previous;
            }

            if (previous.credits < creditCost) {
                unlocked = false;
                return previous;
            }

            unlocked = true;
            return {
                ...previous,
                credits: previous.credits - creditCost,
                inventory: {
                    ...previous.inventory,
                    iron_bar: bars - barCost,
                },
                unlockedWeapons: [...previous.unlockedWeapons, weapon],
            };
        });

        return unlocked;
    }, []);

    const value = useMemo(() => {
        return {
            saveData,
            username,
            netWorth,
            kills,
            cloudStatus,
            cloudError,
            isAuthenticated,
            login,
            logout,
            refreshFromCloud,
            forceCloudSave,
            addResource,
            spendResource,
            convertOreToBar,
            buySlotMachine,
            upgradeMachine,
            collectMachine,
            unlockWeapon,
            incrementKills,
        };
    }, [
        addResource,
        buySlotMachine,
        cloudError,
        cloudStatus,
        collectMachine,
        convertOreToBar,
        forceCloudSave,
        isAuthenticated,
        kills,
        login,
        logout,
        netWorth,
        refreshFromCloud,
        saveData,
        spendResource,
        unlockWeapon,
        upgradeMachine,
        username,
        incrementKills,
    ]);

    return <EconomyContext.Provider value={value}>{children}</EconomyContext.Provider>;
}

export function useEconomy() {
    const context = useContext(EconomyContext);
    if (!context) {
        throw new Error("useEconomy must be used within EconomyProvider");
    }
    return context;
}
