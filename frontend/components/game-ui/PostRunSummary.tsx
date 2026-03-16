import React, { useMemo } from "react";
import { MenuButton } from "./MenuButton";
import { ScanlinesOverlay } from "./ScanlinesOverlay";

export interface RunSummaryMetrics {
    totalDistanceMeters: number;
    totalDurationSeconds: number;
    totalCaloriesBurned?: number;
    totalRuns?: number;
    targetDistanceMeters?: number;
}

export interface PricingParameters {
    baseRateUsd: number;
    perKilometerUsd: number;
    perMileUsd: number;
    perMinuteUsd: number;
    perCalorieUsd: number;
    paceBonusPerMinPerKmUsd: number;
}

export interface ComputedRunSummary {
    totalDistanceKm: number;
    totalDistanceMiles: number;
    totalDurationMinutes: number;
    averagePaceMinutesPerKm: number | null;
    averagePaceMinutesPerMile: number | null;
    totalCaloriesBurned: number;
    estimatedDollarValue: number;
    totalRuns: number;
    progressPercentage: number;
}

export interface PostRunSummaryProps {
    title: string;
    metrics: RunSummaryMetrics | null;
    onPrimaryAction: () => void;
    primaryActionLabel: string;
    onSecondaryAction?: () => void;
    secondaryActionLabel?: string;
    pricing?: Partial<PricingParameters>;
    isLoading?: boolean;
    error?: string | null;
    locale?: string;
    currency?: string;
    unitSystem?: "metric" | "imperial";
}

export const DEFAULT_PRICING_PARAMETERS: PricingParameters = {
    baseRateUsd: 0.5,
    perKilometerUsd: 1.1,
    perMileUsd: 1.77, // Approx 1.1 * 1.609
    perMinuteUsd: 0.2,
    perCalorieUsd: 0.01,
    paceBonusPerMinPerKmUsd: 0.12,
};

const METERS_TO_MILES = 0.000621371;
const KM_TO_MILES = 0.621371;

export function calculateEstimatedCalories(distanceKm: number, durationMinutes: number): number {
    const safeDistance = Number.isFinite(distanceKm) && distanceKm > 0 ? distanceKm : 0;
    const safeMinutes = Number.isFinite(durationMinutes) && durationMinutes > 0 ? durationMinutes : 0;
    const baseline = safeDistance * 62;
    const intensity = safeMinutes > 0 ? Math.min(1.35, Math.max(0.8, safeDistance / (safeMinutes / 10))) : 1;
    return Math.max(0, Math.round(baseline * intensity));
}

export function calculateRunSummary(
    metrics: RunSummaryMetrics,
    pricing: PricingParameters = DEFAULT_PRICING_PARAMETERS
): ComputedRunSummary {
    const totalDistanceMeters = Number.isFinite(metrics.totalDistanceMeters) ? Math.max(0, metrics.totalDistanceMeters) : 0;
    const totalDurationSeconds = Number.isFinite(metrics.totalDurationSeconds) ? Math.max(0, metrics.totalDurationSeconds) : 0;
    const totalDistanceKm = totalDistanceMeters / 1000;
    const totalDistanceMiles = totalDistanceMeters * METERS_TO_MILES;
    const totalDurationMinutes = totalDurationSeconds / 60;
    
    const averagePaceMinutesPerKm = totalDistanceKm > 0 ? totalDurationMinutes / totalDistanceKm : null;
    const averagePaceMinutesPerMile = totalDistanceMiles > 0 ? totalDurationMinutes / totalDistanceMiles : null;
    
    const totalCaloriesBurned = metrics.totalCaloriesBurned !== undefined
        ? Math.max(0, Math.round(metrics.totalCaloriesBurned))
        : calculateEstimatedCalories(totalDistanceKm, totalDurationMinutes);
    
    const paceBonus = averagePaceMinutesPerKm !== null
        ? Math.max(0, (8 - averagePaceMinutesPerKm) * pricing.paceBonusPerMinPerKmUsd)
        : 0;

    // Use KM rate for internal consistency or miles if preferred
    const estimatedDollarValueRaw =
        pricing.baseRateUsd +
        totalDistanceKm * pricing.perKilometerUsd +
        totalDurationMinutes * pricing.perMinuteUsd +
        totalCaloriesBurned * pricing.perCalorieUsd +
        paceBonus;
        
    const estimatedDollarValue = Math.round(Math.max(0, estimatedDollarValueRaw) * 100) / 100;

    const totalRuns = metrics.totalRuns || 1;
    const targetDistance = metrics.targetDistanceMeters || 5000; // Default 5km target
    const progressPercentage = Math.min(100, (totalDistanceMeters / targetDistance) * 100);

    return {
        totalDistanceKm,
        totalDistanceMiles,
        totalDurationMinutes,
        averagePaceMinutesPerKm,
        averagePaceMinutesPerMile,
        totalCaloriesBurned,
        estimatedDollarValue,
        totalRuns,
        progressPercentage,
    };
}

export function formatDuration(totalSeconds: number): string {
    const safe = Math.max(0, Math.round(totalSeconds));
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const seconds = safe % 60;
    if (hours > 0) {
        return `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
    }
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function formatPace(paceMinutes: number | null, unit: "km" | "mi"): string {
    if (paceMinutes === null || !Number.isFinite(paceMinutes)) {
        return "--";
    }
    const minutes = Math.floor(paceMinutes);
    const seconds = Math.round((paceMinutes - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")} /${unit}`;
}

function formatCurrency(value: number, locale: string, currency: string): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(value);
}

export const PostRunSummary: React.FC<PostRunSummaryProps> = ({
    title,
    metrics,
    onPrimaryAction,
    primaryActionLabel,
    onSecondaryAction,
    secondaryActionLabel,
    pricing,
    isLoading = false,
    error = null,
    locale = "en-US",
    currency = "USD",
    unitSystem = "metric",
}) => {
    const mergedPricing: PricingParameters = useMemo(
        () => ({
            ...DEFAULT_PRICING_PARAMETERS,
            ...pricing,
        }),
        [pricing]
    );

    const summary = useMemo(() => {
        if (!metrics) return null;
        return calculateRunSummary(metrics, mergedPricing);
    }, [metrics, mergedPricing]);

    const hasError = Boolean(error) || !summary;

    const distanceLabel = unitSystem === "metric" ? "km" : "mi";
    const distanceValue = summary ? (unitSystem === "metric" ? summary.totalDistanceKm : summary.totalDistanceMiles) : 0;
    const paceValue = summary ? (unitSystem === "metric" ? summary.averagePaceMinutesPerKm : summary.averagePaceMinutesPerMile) : null;

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-4 select-none pointer-events-auto overflow-y-auto">
            <ScanlinesOverlay />
            <div className="relative z-10 w-full max-w-3xl p-4 sm:p-6 md:p-8 bg-black/90 retro-border text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] my-auto">
                <h2 className="retro-text text-2xl sm:text-3xl md:text-5xl text-yellow-500 mb-6 md:mb-8 animate-pulse tracking-tight" style={{ textShadow: "4px 4px 0px #303000" }}>
                    {title}
                </h2>

                {isLoading ? (
                    <div className="retro-text text-white text-sm sm:text-base mb-8 py-12 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                        <div className="animate-pulse">ANALYZING RUN PERFORMANCE...</div>
                    </div>
                ) : hasError ? (
                    <div className="retro-text text-red-500 text-sm sm:text-base mb-8 py-12 border-2 border-red-900 bg-red-900/10">
                        <div className="text-2xl mb-2">⚠ ERROR</div>
                        {error || "RUN DATA CORRUPTED OR UNAVAILABLE"}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
                            <div className="bg-black/70 border-2 border-gray-700 p-3 md:p-4 text-left hover:border-green-500/50 transition-colors group">
                                <div className="retro-text text-gray-400 text-[10px] mb-1 group-hover:text-green-400 transition-colors">DISTANCE</div>
                                <div className="retro-text text-green-400 text-lg sm:text-2xl">{distanceValue.toFixed(2)} <span className="text-xs text-gray-500 uppercase">{distanceLabel}</span></div>
                            </div>
                            <div className="bg-black/70 border-2 border-gray-700 p-3 md:p-4 text-left hover:border-green-500/50 transition-colors group">
                                <div className="retro-text text-gray-400 text-[10px] mb-1 group-hover:text-green-400 transition-colors">DURATION</div>
                                <div className="retro-text text-green-400 text-lg sm:text-2xl">{formatDuration(summary.totalDurationMinutes * 60)}</div>
                            </div>
                            <div className="bg-black/70 border-2 border-gray-700 p-3 md:p-4 text-left hover:border-green-500/50 transition-colors group">
                                <div className="retro-text text-gray-400 text-[10px] mb-1 group-hover:text-green-400 transition-colors">AVERAGE PACE</div>
                                <div className="retro-text text-green-400 text-lg sm:text-2xl">{formatPace(paceValue, distanceLabel)}</div>
                            </div>
                            <div className="bg-black/70 border-2 border-gray-700 p-3 md:p-4 text-left hover:border-green-500/50 transition-colors group">
                                <div className="retro-text text-gray-400 text-[10px] mb-1 group-hover:text-green-400 transition-colors">CALORIES</div>
                                <div className="retro-text text-green-400 text-lg sm:text-2xl">{summary.totalCaloriesBurned.toLocaleString(locale)} <span className="text-xs text-gray-500 uppercase">KCAL</span></div>
                            </div>
                            <div className="bg-black/70 border-2 border-gray-700 p-3 md:p-4 text-left hover:border-green-500/50 transition-colors group">
                                <div className="retro-text text-gray-400 text-[10px] mb-1 group-hover:text-green-400 transition-colors">TOTAL RUNS</div>
                                <div className="retro-text text-green-400 text-lg sm:text-2xl">{summary.totalRuns}</div>
                            </div>
                            <div className="bg-black/70 border-2 border-yellow-700 p-3 md:p-4 text-left hover:border-yellow-500/50 transition-colors group relative overflow-hidden">
                                <div className="retro-text text-yellow-500 text-[10px] mb-1 group-hover:text-yellow-400 transition-colors">ESTIMATED VALUE</div>
                                <div className="retro-text text-yellow-400 text-2xl sm:text-3xl font-bold">{formatCurrency(summary.estimatedDollarValue, locale, currency)}</div>
                                <div className="absolute top-0 right-0 p-1 opacity-20">
                                    <div className="text-yellow-500 text-[40px] leading-none">$</div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Visualization */}
                        <div className="mb-8 p-4 bg-gray-900/30 border-2 border-gray-800 rounded-sm">
                            <div className="flex justify-between items-end mb-2">
                                <div className="retro-text text-gray-400 text-[10px]">GOAL PROGRESS</div>
                                <div className="retro-text text-green-400 text-xs">{summary.progressPercentage.toFixed(1)}%</div>
                            </div>
                            <div className="w-full h-4 bg-black border border-gray-700 overflow-hidden p-[2px]">
                                <div 
                                    className="h-full bg-gradient-to-r from-green-900 via-green-500 to-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-1000 ease-out"
                                    style={{ width: `${summary.progressPercentage}%` }}
                                />
                            </div>
                            <div className="mt-2 retro-text text-gray-500 text-[8px] text-right uppercase tracking-widest">
                                {summary.progressPercentage >= 100 ? "TARGET REACHED" : "REMAINING ACTIVE"}
                            </div>
                        </div>
                    </>
                )}

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                    <div className="flex-1 max-w-xs mx-auto sm:mx-0">
                        <MenuButton onClick={onPrimaryAction}>
                            {primaryActionLabel}
                        </MenuButton>
                    </div>
                    {onSecondaryAction && secondaryActionLabel && (
                        <div className="flex-1 max-w-xs mx-auto sm:mx-0">
                            <MenuButton onClick={onSecondaryAction} variant="secondary">
                                {secondaryActionLabel}
                            </MenuButton>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
