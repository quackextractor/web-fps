import { describe, it, expect } from "vitest";
import { 
    calculateRunSummary, 
    calculateEstimatedCalories, 
    formatDuration,
    DEFAULT_PRICING_PARAMETERS 
} from "../components/game-ui/PostRunSummary";

describe("PostRunSummary Calculations", () => {
    describe("calculateEstimatedCalories", () => {
        it("should return 0 for zero distance", () => {
            expect(calculateEstimatedCalories(0, 30)).toBe(0);
        });

        it("should calculate baseline calories for standard distance", () => {
            // 10km at normal intensity (10km / (30min/10) = 3.33)
            // baseline = 10 * 62 = 620
            // intensity = min(1.35, max(0.8, 3.33)) = 1.35
            // 620 * 1.35 = 837
            expect(calculateEstimatedCalories(10, 30)).toBe(837);
        });

        it("should handle invalid inputs gracefully", () => {
            expect(calculateEstimatedCalories(-1, -1)).toBe(0);
            expect(calculateEstimatedCalories(NaN as any, 10)).toBe(0);
        });
    });

    describe("calculateRunSummary", () => {
        const mockMetrics = {
            totalDistanceMeters: 5000, // 5km
            totalDurationSeconds: 1800, // 30min
            totalRuns: 1,
            targetDistanceMeters: 10000
        };

        it("should calculate basic metrics correctly", () => {
            const summary = calculateRunSummary(mockMetrics);
            
            expect(summary.totalDistanceKm).toBe(5);
            expect(summary.totalDistanceMiles).toBeCloseTo(3.106855, 6);
            expect(summary.totalDurationMinutes).toBe(30);
            expect(summary.averagePaceMinutesPerKm).toBe(6); // 30 / 5
            expect(summary.progressPercentage).toBe(50);
        });

        it("should calculate estimated dollar value with default pricing", () => {
            const summary = calculateRunSummary(mockMetrics);
            
            // base: 0.5
            // distance (5km * 1.1): 5.5
            // duration (30min * 0.2): 6.0
            // calories (5km * 62 * intensity): 
            //   intensity = min(1.35, max(0.8, 5/(30/10))) = min(1.35, 1.66) = 1.35
            //   cals = 5 * 62 * 1.35 = 418.5 -> 419
            //   cal value (419 * 0.01): 4.19
            // pace bonus (8 - 6) * 0.12 = 0.24
            // total: 0.5 + 5.5 + 6.0 + 4.19 + 0.24 = 16.43
            
            expect(summary.estimatedDollarValue).toBe(16.43);
        });

        it("should use custom pricing when provided", () => {
            const customPricing = {
                ...DEFAULT_PRICING_PARAMETERS,
                baseRateUsd: 1.0,
                perKilometerUsd: 2.0
            };
            const summary = calculateRunSummary(mockMetrics, customPricing);
            
            // Diff from default: +0.5 base, +4.5 distance (5 * (2.0-1.1))
            // 16.43 + 0.5 + 4.5 = 21.43
            expect(summary.estimatedDollarValue).toBe(21.43);
        });

        it("should handle zero distance gracefully", () => {
            const zeroMetrics = {
                totalDistanceMeters: 0,
                totalDurationSeconds: 60
            };
            const summary = calculateRunSummary(zeroMetrics);
            expect(summary.averagePaceMinutesPerKm).toBeNull();
            expect(summary.estimatedDollarValue).toBeGreaterThan(0); // Should still have base rate + duration
        });
    });

    describe("formatDuration", () => {
        it("should format seconds correctly", () => {
            expect(formatDuration(45)).toBe("0m 45s");
        });

        it("should format minutes correctly", () => {
            expect(formatDuration(600)).toBe("10m 00s");
        });

        it("should format hours correctly", () => {
            expect(formatDuration(3661)).toBe("1h 01m 01s");
        });

        it("should handle zero/negative seconds", () => {
            expect(formatDuration(0)).toBe("0m 00s");
            expect(formatDuration(-10)).toBe("0m 00s");
        });
    });
});
