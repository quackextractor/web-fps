import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { EconomyProvider, useEconomy } from "@/context/EconomyContext";

function EconomyHarness() {
    const { saveData, addResource, spendResource } = useEconomy();

    return (
        <div>
            <div data-testid="credits">{saveData.credits}</div>
            <div data-testid="ore-red">{saveData.inventory.ore_red ?? 0}</div>
            <button onClick={() => addResource("credits", 25)} type="button">add-credits</button>
            <button onClick={() => addResource("ore_red", 2)} type="button">add-ore</button>
            <button onClick={() => spendResource("credits", 100)} type="button">spend-credits</button>
        </div>
    );
}

describe("EconomyContext resource updates", () => {
    afterEach(() => {
        cleanup();
    });

    it("adds kill-style credit rewards into saveData.credits", () => {
        render(
            <EconomyProvider>
                <EconomyHarness />
            </EconomyProvider>
        );

        expect(screen.getByTestId("credits").textContent).toBe("500");
        fireEvent.click(screen.getByText("add-credits"));
        expect(screen.getByTestId("credits").textContent).toBe("525");
    });

    it("keeps inventory resource updates unchanged", () => {
        render(
            <EconomyProvider>
                <EconomyHarness />
            </EconomyProvider>
        );

        expect(screen.getByTestId("ore-red").textContent).toBe("0");
        fireEvent.click(screen.getByText("add-ore"));
        expect(screen.getByTestId("ore-red").textContent).toBe("2");
        expect(screen.getByTestId("credits").textContent).toBe("500");
    });

    it("spends credits through spendResource when requested", () => {
        render(
            <EconomyProvider>
                <EconomyHarness />
            </EconomyProvider>
        );

        fireEvent.click(screen.getByText("spend-credits"));
        expect(screen.getByTestId("credits").textContent).toBe("400");
    });
});
