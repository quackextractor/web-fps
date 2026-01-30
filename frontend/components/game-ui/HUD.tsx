import React from "react";
import { WeaponType, AmmoType, WEAPON_CONFIG, type Pickup, type Level } from "@/lib/fps-engine";

interface HUDProps {
    health: number;
    armor: number;
    ammo: { [key in AmmoType]: number };
    weapon: WeaponType;
    kills: number;
    totalKills: number | undefined; // Optional depending on how we pass it
    levelName: string;
    weaponsUnlocked: Set<WeaponType>;
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
}) => {
    const currentWeapon = WEAPON_CONFIG[weapon];
    const currentAmmo = currentWeapon.ammoType !== null ? ammo[currentWeapon.ammoType] : null;

    const getHealthColor = (h: number) => {
        if (h > 50) return "text-green-500";
        if (h > 25) return "text-yellow-500";
        return "text-red-500 animate-pulse";
    };

    return (
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 z-40 font-mono text-white retro-text select-none">
            {/* Top Bar - Score? Or maybe just Level Name and Kills */}
            <div className="flex justify-between items-start opacity-80">
                <div className="flex flex-col gap-1">
                    <span className="text-xl bg-black/50 px-2 py-1 rounded border-2 border-white/20">
                        {levelName}
                    </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-xl bg-black/50 px-2 py-1 rounded border-2 border-white/20 text-red-400">
                        KILLS: {kills}
                    </span>
                </div>
            </div>

            {/* Center - Crosshair is drawn separately or can be here? Let's leave currently as CSS/Canvas or add here if needed. 
          The GameRenderer draws it currently. We can move it here later if we want React crosshair. */}

            {/* Bottom Bar - Status */}
            <div className="flex items-end justify-between gap-4">

                {/* Left: Health & Armor */}
                <div className="flex flex-col gap-2 w-[260px]">
                    <div className="bg-black/70 border-4 border-gray-700 p-2 relative retro-border">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-lg font-bold tracking-wider text-shadow-sm text-gray-400">HEALTH</span>
                            <span className={`text-2xl font-bold ${getHealthColor(health)}`}>{Math.ceil(health)}%</span>
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
                                <span className="text-sm font-bold tracking-widest text-blue-300">ARMOR</span>
                                <span className="text-xl font-bold text-blue-400">{Math.ceil(armor)}</span>
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
                <div className="flex gap-2 items-end mb-2 opacity-90 hidden md:flex">
                    {[WeaponType.FIST, WeaponType.CHAINSAW, WeaponType.PISTOL, WeaponType.SHOTGUN, WeaponType.CHAINGUN].map((w, i) => {
                        const isUnlocked = weaponsUnlocked.has(w);
                        const isSelected = weapon === w;
                        return (
                            <div
                                key={w}
                                className={`
                            w-8 h-12 border-2 flex items-center justify-center font-bold text-sm transition-all
                            ${isSelected ? 'border-yellow-400 bg-yellow-900/50 -translate-y-2' : isUnlocked ? 'border-gray-500 bg-gray-900/50' : 'border-gray-800 bg-black/50 text-gray-700'}
                        `}
                            >
                                {i + 1}
                            </div>
                        );
                    })}
                </div>

                {/* Right: Ammo & Weapon Info */}
                <div className="bg-black/70 border-4 border-gray-700 p-4 w-[240px] relative retro-border">
                    <div className="text-right">
                        <h2 className="text-sm text-gray-400 mb-1 tracking-widest">WEAPON</h2>
                        <div className="text-2xl text-yellow-500 font-bold mb-2">{currentWeapon.name.toUpperCase()}</div>

                        <div className="flex justify-end items-end gap-2">
                            {currentAmmo !== null ? (
                                <>
                                    <span className="text-5xl font-bold text-white leading-none">{currentAmmo}</span>
                                    <span className="text-sm text-gray-400 mb-1">{currentWeapon.ammoType?.toUpperCase()}</span>
                                </>
                            ) : (
                                <span className="text-gray-500 text-xl overflow-hidden">---</span>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
