"use client";

import React, { createContext, useContext, useRef, useCallback } from "react";

interface GameActionContextType {
    registerClearRagdolls: (fn: () => void) => void;
    clearRagdolls: () => void;
}

const GameActionContext = createContext<GameActionContextType | null>(null);

export function GameActionProvider({ children }: { children: React.ReactNode }) {
    const clearRagdollsRef = useRef<(() => void) | null>(null);

    const registerClearRagdolls = useCallback((fn: () => void) => {
        clearRagdollsRef.current = fn;
    }, []);

    const clearRagdolls = useCallback(() => {
        if (clearRagdollsRef.current) {
            clearRagdollsRef.current();
        }
    }, []);

    return (
        <GameActionContext.Provider value={{ registerClearRagdolls, clearRagdolls }}>
            {children}
        </GameActionContext.Provider>
    );
}

export function useGameActions() {
    const context = useContext(GameActionContext);
    if (!context) {
        throw new Error("useGameActions must be used within a GameActionProvider");
    }
    return context;
}
