import React from "react";

interface MenuButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "danger";
    disabled?: boolean;
}

export const MenuButton: React.FC<MenuButtonProps> = ({
    onClick,
    children,
    variant = "primary",
    disabled = false,
}) => {
    const baseClasses = "w-full px-3 py-2 sm:px-4 sm:py-3 xl:px-6 xl:py-4 text-xs sm:text-sm xl:text-base font-bold transition-all duration-75 transform active:translate-y-1 retro-text retro-border uppercase tracking-widest";
    const variantClasses = {
        primary: "bg-red-700 hover:bg-white hover:text-red-700 text-white border-black",
        secondary: "bg-gray-800 hover:bg-white hover:text-black text-white border-black",
        danger: "bg-yellow-600 hover:bg-red-600 hover:text-white text-black border-black",
    };
    const disabledClasses = "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:translate-y-0";
    return (
        <button type="button" onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses}`}>
            {children}
        </button>
    );
};
