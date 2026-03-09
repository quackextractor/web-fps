import React from "react";
import { WeaponType, AmmoType, WEAPON_CONFIG, type Pickup, type Level } from "@/lib/fps-engine";

interface HUDProps {
    health: number;
    armor: number;
    ammo: { [key in AmmoType]: number };
    weapon: WeaponType;
    kills: number;
    totalKills?: number;
    levelName: string;
    weaponsUnlocked: Set<WeaponType>;
    isMobile?: boolean;
    runLoot?: { ore_red: number; ore_green: number };
    credits: number;
}

export const HUD: React.FC<HUDProps> = ({
    health,
    armor,
    ammo,
    weapon,
    kills,
    totalKills = 0,
    levelName,
    weaponsUnlocked,
    isMobile = false,
    runLoot = { ore_red: 0, ore_green: 0 },
    credits,
}) => {
    const currentWeapon = WEAPON_CONFIG[weapon];
    const currentAmmo = currentWeapon.ammoType !== null ? ammo[currentWeapon.ammoType] : null;

    const getHealthColor = (h: number) => {
        if (h > 50) return "text-green-500";
        if (h > 25) return "text-yellow-500";
        return "text-red-500 animate-pulse";
    };

    if (isMobile) {
        return (
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-2 z-40 font-mono text-white retro-text select-none overflow-hidden">
                {/* Mobile Top Bar: Health(Left) and Ammo(Right) */}
                <div className="flex justify-between items-start w-full gap-2">
                    {/* Health & Armor */}
                    <div className="flex flex-col gap-1 w-[30%] max-w-[140px] bg-black/60 p-1 border-2 border-gray-700 retro-border">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[clamp(8px,1.5vw,10px)] text-gray-400">HP</span>
                            <span className={`text-[clamp(10px,2vw,14px)] font-bold ${getHealthColor(health)}`}>{Math.ceil(health)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-900 border border-gray-600">
                            <div
                                className={`h-full ${health > 50 ? 'bg-green-600' : health > 25 ? 'bg-yellow-600' : 'bg-red-600'}`}
                                style={{ width: `${Math.min(100, health)}%` }}
                            />
                        </div>
                        {armor > 0 && (
                            <div className="w-full h-1 bg-gray-900 border border-blue-900/50 mt-1">
                                <div
                                    className="h-full bg-blue-500"
                                    style={{ width: `${Math.min(100, armor)}%` }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Level & Kills (Center) */}
                    <div className="flex flex-col items-center opacity-70 flex-1">
                        <span className="text-[clamp(8px,1.2vw,10px)] bg-black/40 px-1 rounded truncate max-w-full">{levelName}</span>
                        <div className="flex gap-2">
                            <span className="text-[clamp(8px,1.2vw,10px)] text-yellow-400 font-bold">${credits}</span>
                            <span className="text-[clamp(8px,1.2vw,10px)] text-red-400 font-bold">KILLS: {kills}</span>
                        </div>
                    </div>

                    {/* Weapon & Ammo */}
                    <div className="flex flex-col items-end gap-1 w-[30%] max-w-[140px] bg-black/60 p-1 border-2 border-gray-700 retro-border text-right">
                        <span className="text-[clamp(8px,1.2vw,10px)] text-yellow-500 font-bold truncate w-full">{currentWeapon.name.toUpperCase()}</span>
                        <div className="flex items-baseline gap-1">
                            {currentAmmo !== null ? (
                                <>
                                    <span className="text-[clamp(14px,3vw,20px)] font-bold">{currentAmmo}</span>
                                    <span className="text-[clamp(6px,1vw,8px)] text-gray-400">{currentWeapon.ammoType?.toUpperCase()}</span>
                                </>
                            ) : (
                                <span className="text-gray-500 text-xs">---</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom area kept clear for mobile controls */}
                <div className="flex-1" />
            </div>
        );
    }

    return (
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-[min(4vw,1rem)] z-40 font-mono text-white retro-text select-none overflow-hidden">
            {/* Top Bar */}
            <div className="flex justify-between items-start opacity-80 w-full">
                <div className="flex flex-col gap-1">
                    <span className="text-[clamp(12px,2vw,20px)] bg-black/50 px-2 py-1 rounded border-2 border-white/20">
                        {levelName}
                    </span>
                </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[clamp(12px,2vw,20px)] bg-black/50 px-2 py-1 rounded border-2 border-white/20 text-yellow-400">
                            ${credits}
                        </span>
                        <span className="text-[clamp(12px,2vw,20px)] bg-black/50 px-2 py-1 rounded border-2 border-white/20 text-red-400">
                            KILLS: {kills}
                        </span>
                        {/* Run Loot Display */}
                        {(runLoot.ore_red > 0 || runLoot.ore_green > 0) && (
                            <div className="flex gap-2 mt-1">
                                {runLoot.ore_red > 0 && (
                                    <span className="text-[clamp(10px,1.5vw,14px)] bg-black/50 px-2 py-1 rounded border border-red-500/50 text-red-400">
                                        RED: {runLoot.ore_red}
                                    </span>
                                )}
                                {runLoot.ore_green > 0 && (
                                    <span className="text-[clamp(10px,1.5vw,14px)] bg-black/50 px-2 py-1 rounded border border-green-500/50 text-green-400">
                                        GREEN: {runLoot.ore_green}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
            </div>

            {/* Bottom Bar - Status */}
            <div className="flex items-end justify-between gap-4 w-full">
                {/* Left: Health & Armor */}
                <div className="flex flex-col gap-2 w-[30%] min-w-[180px] max-w-[300px]">
                    <div className="bg-black/70 border-4 border-gray-700 p-2 relative retro-border">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[clamp(10px,1.5vw,16px)] font-bold tracking-wider text-shadow-sm text-gray-400">HEALTH</span>
                            <span className={`text-[clamp(16px,2.5vw,24px)] font-bold ${getHealthColor(health)}`}>{Math.ceil(health)}%</span>
                        </div>
                        <div className="w-full h-4 bg-gray-900 border border-gray-600">
                            <div
                                className={`h-full transition-all duration-200 ${health > 50 ? 'bg-green-600' : health > 25 ? 'bg-yellow-600' : 'bg-red-600'}`}
                                style={{ width: `${Math.min(100, health)}%` }}
                            />
                        </div>
                    </div>

                    {armor > 0 && (
                        <div className="bg-black/70 border-4 border-blue-900/50 p-2 relative retro-border">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-[clamp(8px,1.2vw,12px)] font-bold tracking-widest text-blue-300">ARMOR</span>
                                <span className="text-[clamp(12px,2vw,20px)] font-bold text-blue-400">{Math.ceil(armor)}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-900 border border-blue-900/50">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-200"
                                    style={{ width: `${Math.min(100, armor)}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Center: Weapons Array */}
                <div className="flex gap-2 items-end mb-2 opacity-90 hidden sm:flex">
                    {[WeaponType.FIST, WeaponType.CHAINSAW, WeaponType.PISTOL, WeaponType.SHOTGUN, WeaponType.CHAINGUN].map((w, i) => {
                        const isUnlocked = weaponsUnlocked.has(w);
                        const isSelected = weapon === w;
                        return (
                            <div
                                key={w}
                                className={`
                            w-[clamp(20px,4vw,32px)] h-[clamp(30px,6vw,48px)] border-2 flex items-center justify-center font-bold text-[clamp(8px,1.5vw,14px)] transition-all
                            ${isSelected ? 'border-yellow-400 bg-yellow-900/50 -translate-y-2' : isUnlocked ? 'border-gray-500 bg-gray-900/50' : 'border-gray-800 bg-black/50 text-gray-700'}
                        `}
                            >
                                {i + 1}
                            </div>
                        );
                    })}
                </div>

                {/* Right: Ammo & Weapon Info */}
                <div className="bg-black/70 border-4 border-gray-700 p-4 w-[30%] min-w-[160px] max-w-[280px] relative retro-border">
                    <div className="text-right">
                        <h2 className="text-[clamp(8px,1vw,12px)] text-gray-400 mb-1 tracking-widest">WEAPON</h2>
                        <div className="text-[clamp(12px,2.2vw,22px)] text-yellow-500 font-bold mb-2 truncate">{currentWeapon.name.toUpperCase()}</div>

                        <div className="flex justify-end items-end gap-2">
                            {currentAmmo !== null ? (
                                <>
                                    <span className="text-[clamp(24px,5vw,48px)] font-bold text-white leading-none">{currentAmmo}</span>
                                    <span className="text-[clamp(8px,1.2vw,14px)] text-gray-400 mb-1">{currentWeapon.ammoType?.toUpperCase()}</span>
                                </>
                            ) : (
                                <span className="text-gray-500 text-[clamp(10px,2vw,20px)] overflow-hidden">---</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
