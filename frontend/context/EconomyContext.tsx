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
}

const initialSaveData: EconomySaveData = {
    credits: 0,
    inventory: {
        ore_red: 0,
        ore_green: 0,
        iron_bar: 0,
    },
    machines: [],
    unlockedWeapons: ["fist", "pistol"],
    highestLevelCompleted: 0,
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
            }

            const nextMachines = incoming.machines ?? previous.machines;
            const nextWeapons = incoming.unlockedWeapons ?? previous.unlockedWeapons;
            const nextHighest = incoming.highestLevelCompleted ?? previous.highestLevelCompleted;
            const nextCredits = incoming.credits ?? previous.credits;

            return {
                credits: nextCredits,
                inventory: nextInventory,
                machines: nextMachines,
                unlockedWeapons: nextWeapons,
                highestLevelCompleted: nextHighest,
            };
        });
    }, []);

    const forceCloudSave = useCallback(async (netWorth?: number, kills?: number) => {
        if (credentialsRef.current.username.length === 0) {
            setCloudStatus("error");
            setCloudError("You must log in before syncing");
            return false;
        }

        setCloudStatus("syncing");
        setCloudError("");

        try {
            const payload: Record<string, unknown> = {
                credits: saveData.credits,
                inventory: saveData.inventory,
                machines: saveData.machines,
                unlockedWeapons: saveData.unlockedWeapons,
                highestLevelCompleted: saveData.highestLevelCompleted,
            };

            if (netWorth !== undefined) {
                payload.net_worth = netWorth;
            }
            if (kills !== undefined) {
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
            setCloudStatus("error");
            setCloudError("Network error while saving");
            return false;
        }
    }, [applySaveData, saveData]);

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
            if (typeof data.netWorth === "number") {
                setNetWorth(data.netWorth);
            }
            if (typeof data.kills === "number") {
                setKills(data.kills);
            }
            setCloudStatus("synced");
            return true;
        } catch {
            setCloudStatus("error");
            setCloudError("Network error during login");
            return false;
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

    const addResource = useCallback((resource: string, amount: number) => {
        if (amount <= 0) {
            return;
        }

        setSaveData((previous) => {
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
