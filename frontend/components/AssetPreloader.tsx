"use client";

import React, { useState, useEffect } from "react";
import type { Level } from "@/lib/fps-engine";
import { logger } from "@/lib/logger";

interface AssetPreloaderProps {
    onComplete: () => void;
    level: Level;
    sounds?: string[];
}

export function AssetPreloader({ onComplete, level, sounds = [] }: AssetPreloaderProps) {
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;
        let loaded = 0;
        const imageSet = new Set<string>();

        Object.values(level.wallTextures).forEach((src) => {
            if (!src.startsWith("generated:")) {
                imageSet.add(src);
            }
        });

        if (level.floorTexture && !level.floorTexture.startsWith("generated:")) {
            imageSet.add(level.floorTexture);
        }

        if (level.ceilingTexture && !level.ceilingTexture.startsWith("generated:")) {
            imageSet.add(level.ceilingTexture);
        }

        const images = Array.from(imageSet);
        const total = images.length + sounds.length;

        if (total === 0) {
            onComplete();
            return;
        }

        const updateProgress = () => {
            if (isCancelled) {
                return;
            }
            loaded++;
            setProgress(Math.floor((loaded / total) * 100));
            if (loaded === total) {
                // Small delay for visual polish
                setTimeout(() => {
                    if (!isCancelled) {
                        onComplete();
                    }
                }, 500);
            }
        };

        const handleError = (src: string) => {
            logger.error(`Failed to load asset: ${src}`);
            setError("Some assets failed to load");
            // We still continue even if one asset fails to load
            updateProgress();
        };

        // Preload images
        images.forEach((src) => {
            const img = new Image();
            img.src = src;
            img.onload = updateProgress;
            img.onerror = () => handleError(src);
        });

        // Preload sounds
        sounds.forEach((src) => {
            // Using fetch instead of Audio object to avoid browser autoplay policy suspensions
            // which can cause oncanplaythrough to never fire and block loading indefinitely
            fetch(src)
                .then((res) => {
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    return res.blob();
                })
                .then(updateProgress)
                .catch(() => handleError(src));
        });

        // Safety timeout to ensure game loads even if some assets hang silently
        const fallbackTimeout = setTimeout(() => {
            if (!isCancelled && loaded < total) {
                logger.warn("Asset preloader timed out, forcing completion");
                onComplete();
            }
        }, 10000);

        return () => {
            isCancelled = true;
            clearTimeout(fallbackTimeout);
        };
    }, [level, sounds, onComplete]);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-md retro-border p-8 bg-gray-900 shadow-2xl">
                <h2 className="retro-text text-2xl text-red-600 mb-8 text-center animate-pulse">
                    LOADING ASSETS
                </h2>

                <div className="w-full h-8 bg-black retro-border p-1 mb-4">
                    <div
                        className="h-full bg-red-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex justify-between items-center">
                    <span className="retro-text text-[10px] text-gray-500 uppercase">
                        {progress < 100 ? "Initializing..." : "Complete"}
                    </span>
                    <span className="retro-text text-[10px] text-yellow-500">
                        {progress}%
                    </span>
                </div>

                {error && (
                    <div className="mt-4 p-2 bg-red-900/50 border border-red-500 text-red-200 retro-text text-[8px] text-center uppercase">
                        Warning: Some assets failed to load
                    </div>
                )}
            </div>

            <div className="mt-8 retro-text text-[8px] text-gray-700 uppercase tracking-widest animate-pulse">
                Descent into Darkness...
            </div>
        </div>
    );
}
