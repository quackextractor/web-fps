"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export interface EconomyInventory {
    [resource: string]: number;
}

export interface EconomyMachine {
    id: string;
    type: string;
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
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    refreshFromCloud: () => Promise<boolean>;
    forceCloudSave: (netWorth?: number, kills?: number) => Promise<boolean>;
    addResource: (resource: string, amount: number) => void;
    spendResource: (resource: string, amount: number) => boolean;
    convertOreToBar: (oreType: string, barType: string, oreAmount: number, barAmount: number) => boolean;
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
        { id: "smelter_1", type: "smelter_red", active: true },
        { id: "smelter_2", type: "smelter_green", active: true },
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

    const processSmeltersTick = useCallback(() => {
        setSaveData((prev) => {
            if (!prev.machines || prev.machines.length === 0) {
                return prev;
            }
            const next = { ...prev, inventory: { ...prev.inventory } };
            for (const m of prev.machines) {
                if (!m.active) {
                    continue;
                }
                if (m.type === "smelter_red") {
                    const ore = next.inventory.ore_red ?? 0;
                    if (ore >= 2) {
                        next.inventory.ore_red = ore - 2;
                        next.inventory.iron_bar = (next.inventory.iron_bar ?? 0) + 1;
                    }
                } else if (m.type === "smelter_green") {
                    const ore = next.inventory.ore_green ?? 0;
                    if (ore >= 2) {
                        next.inventory.ore_green = ore - 2;
                        next.inventory.plasmoid_bar = (next.inventory.plasmoid_bar ?? 0) + 1;
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
        if (!last || last >= now) {
            setSaveData((p) => ({ ...p, last_saved_at: now }));
            return;
        }
        const dt = Math.floor((now - last) / 5000);
        if (dt <= 0) {
            setSaveData((p) => ({ ...p, last_saved_at: now }));
            return;
        }
        setSaveData((prev) => {
            const redSmelters = prev.machines.filter((m) => m.active && m.type === "smelter_red").length;
            const greenSmelters = prev.machines.filter((m) => m.active && m.type === "smelter_green").length;
            if (redSmelters === 0 && greenSmelters === 0) {
                return { ...prev, last_saved_at: now };
            }
            const next = { ...prev, inventory: { ...prev.inventory }, last_saved_at: now };
            if (redSmelters > 0) {
                const maxCycles = dt * redSmelters;
                const possible = Math.min(maxCycles, Math.floor((next.inventory.ore_red ?? 0) / 2));
                if (possible > 0) {
                    next.inventory.ore_red = (next.inventory.ore_red ?? 0) - possible * 2;
                    next.inventory.iron_bar = (next.inventory.iron_bar ?? 0) + possible;
                }
            }
            if (greenSmelters > 0) {
                const maxCycles = dt * greenSmelters;
                const possible = Math.min(maxCycles, Math.floor((next.inventory.ore_green ?? 0) / 2));
                if (possible > 0) {
                    next.inventory.ore_green = (next.inventory.ore_green ?? 0) - possible * 2;
                    next.inventory.plasmoid_bar = (next.inventory.plasmoid_bar ?? 0) + possible;
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

    const login = useCallback(async (nextUsername: string, nextPassword: string) => {
        setCloudStatus("syncing");
        setCloudError("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: nextUsername,
                    password: nextPassword,
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
            processSmeltersTick();
        }, 5000);
        return () => clearInterval(interval);
    }, [isAuthenticated, processSmeltersTick]);

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
            unlockWeapon,
            incrementKills,
        };
    }, [
        addResource,
        cloudError,
        cloudStatus,
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
