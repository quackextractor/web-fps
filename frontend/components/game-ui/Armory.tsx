import React, { useState } from "react";
import { MenuButton } from "./MenuButton";
import { ScanlinesOverlay } from "./ScanlinesOverlay";
import { useEconomy } from "@/context/EconomyContext";

interface ArmoryProps {
    onBack: () => void;
}

interface WeaponRecipe {
    weapon: string;
    title: string;
    description: string;
    barCost: number;
    creditCost: number;
}

const recipes: WeaponRecipe[] = [
    {
        weapon: "shotgun",
        title: "SHOTGUN",
        description: "CLOSE RANGE HEAVY WEAPON",
        barCost: 50,
        creditCost: 2000,
    },
    {
        weapon: "chaingun",
        title: "CHAINGUN",
        description: "HIGH RATE BALLISTIC PLATFORM",
        barCost: 90,
        creditCost: 4500,
    },
];

export const Armory: React.FC<ArmoryProps> = ({ onBack }) => {
    const { saveData, unlockWeapon, forceCloudSave } = useEconomy();
    const [message, setMessage] = useState("");

    const tryFabricate = async (recipe: WeaponRecipe) => {
        const success = unlockWeapon(recipe.weapon, recipe.barCost, recipe.creditCost);
        if (!success) {
            setMessage("INSUFFICIENT MATERIALS OR ALREADY UNLOCKED");
            return;
        }

        setMessage(`${recipe.title} FABRICATION COMPLETE`);
        await forceCloudSave();
    };

    return (
        <div className="fixed md:absolute inset-0 flex flex-col items-center justify-center bg-black p-0 md:p-4 select-none pointer-events-auto">
            <ScanlinesOverlay />

            <div className="relative z-10 w-full max-w-4xl bg-black retro-border p-4 md:p-8 overflow-y-auto max-h-full">
                <h2 className="retro-text text-3xl md:text-5xl text-red-600 mb-3 text-center tracking-tighter" style={{ textShadow: "4px 4px 0px #300000" }}>
                    ARMORY FABRICATION
                </h2>

                <p className="retro-text text-xs text-center text-gray-400 mb-8 tracking-widest">
                    IRON BARS {saveData.inventory.iron_bar ?? 0} | CREDITS ${saveData.credits}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {recipes.map((recipe) => {
                        const unlocked = saveData.unlockedWeapons.includes(recipe.weapon);
                        return (
                            <div key={recipe.weapon} className="retro-border bg-gray-950 p-4 flex flex-col gap-3">
                                <p className="retro-text text-lg text-white">{recipe.title}</p>
                                <p className="retro-text text-[10px] text-gray-400">{recipe.description}</p>
                                <p className="retro-text text-[10px] text-red-400">
                                    COST {recipe.barCost} IRON BARS + ${recipe.creditCost}
                                </p>
                                {!unlocked && (
                                    <MenuButton onClick={async () => { await tryFabricate(recipe); }}>
                                        FABRICATE
                                    </MenuButton>
                                )}
                                {unlocked && (
                                    <MenuButton onClick={() => { setMessage(`${recipe.title} ALREADY DEPLOYED`); }} variant="secondary">
                                        UNLOCKED
                                    </MenuButton>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="text-center min-h-5 mb-6">
                    {message.length > 0 && <p className="retro-text text-xs text-yellow-500">{message}</p>}
                    {message.length === 0 && <p className="retro-text text-xs text-gray-500">SELECT A FABRICATION TARGET</p>}
                </div>

                <div className="w-full md:w-1/3 mx-auto">
                    <MenuButton onClick={onBack} variant="danger">BACK TO FACTORY</MenuButton>
                </div>
            </div>
        </div>
    );
};
