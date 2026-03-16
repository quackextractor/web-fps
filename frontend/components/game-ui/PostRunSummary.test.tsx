import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
    PostRunSummary,
    calculateEstimatedCalories,
    calculateRunSummary,
    type RunSummaryMetrics,
    type PricingParameters,
} from "./PostRunSummary";

vi.mock("./ScanlinesOverlay", () => ({
    ScanlinesOverlay: () => <div data-testid="scanlines" />,
}));

describe("PostRunSummary", () => {
    afterEach(() => {
        cleanup();
    });

    it("calculates summary values from run metrics and pricing", () => {
        const metrics: RunSummaryMetrics = {
            totalDistanceMeters: 5000,
            totalDurationSeconds: 1800,
            totalCaloriesBurned: 320,
        };
        const pricing: PricingParameters = {
            baseRateUsd: 1,
            perKilometerUsd: 2,
            perMinuteUsd: 0.1,
            perCalorieUsd: 0.02,
            paceBonusPerMinPerKmUsd: 0.5,
        };

        const summary = calculateRunSummary(metrics, pricing);

        expect(summary.totalDistanceKm).toBeCloseTo(5);
        expect(summary.totalDurationMinutes).toBeCloseTo(30);
        expect(summary.averagePaceMinutesPerKm).toBeCloseTo(6);
        expect(summary.totalCaloriesBurned).toBe(320);
        expect(summary.estimatedDollarValue).toBeCloseTo(21.4);
    });

    it("estimates calories when explicit calories are missing", () => {
        const estimated = calculateEstimatedCalories(3.2, 24);
        expect(estimated).toBeGreaterThan(0);
        const summary = calculateRunSummary({
            totalDistanceMeters: 3200,
            totalDurationSeconds: 1440,
        });
        expect(summary.totalCaloriesBurned).toBe(estimated);
    });

    it("renders loading state", () => {
        render(
            <PostRunSummary
                title="RUN SUMMARY"
                metrics={null}
                isLoading
                primaryActionLabel="CONTINUE"
                onPrimaryAction={() => { }}
            />
        );

        expect(screen.getByText("PROCESSING RUN METRICS...")).toBeTruthy();
    });

    it("renders error state", () => {
        render(
            <PostRunSummary
                title="RUN SUMMARY"
                metrics={null}
                error="METRICS FAILED TO LOAD"
                primaryActionLabel="RETRY"
                onPrimaryAction={() => { }}
            />
        );

        expect(screen.getByText("METRICS FAILED TO LOAD")).toBeTruthy();
    });

    it("renders summary values and action buttons", () => {
        const primary = vi.fn();
        const secondary = vi.fn();

        render(
            <PostRunSummary
                title="RUN SUMMARY"
                metrics={{
                    totalDistanceMeters: 2500,
                    totalDurationSeconds: 900,
                    totalCaloriesBurned: 180,
                }}
                primaryActionLabel="NEXT LEVEL"
                secondaryActionLabel="MAIN MENU"
                onPrimaryAction={primary}
                onSecondaryAction={secondary}
            />
        );

        expect(screen.getByText("2.50 km")).toBeTruthy();
        expect(screen.getByText("15m 00s")).toBeTruthy();
        expect(screen.getByText("180 kcal")).toBeTruthy();
        expect(screen.getByText(/\$/)).toBeTruthy();

        fireEvent.click(screen.getByText("NEXT LEVEL"));
        fireEvent.click(screen.getByText("MAIN MENU"));
        expect(primary).toHaveBeenCalledTimes(1);
        expect(secondary).toHaveBeenCalledTimes(1);
    });
});
