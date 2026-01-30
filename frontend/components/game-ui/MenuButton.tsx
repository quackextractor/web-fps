import React from "react";

interface MenuButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "danger";
}

export const MenuButton: React.FC<MenuButtonProps> = ({
    onClick,
    children,
    variant = "primary"
}) => {
    const baseClasses = "w-full px-6 py-3 text-lg font-bold rounded transition-all duration-200 transform hover:scale-105 active:scale-95";
    const variantClasses = {
        primary: "bg-red-700 hover:bg-red-600 text-white border-2 border-red-500",
        secondary: "bg-gray-700 hover:bg-gray-600 text-white border-2 border-gray-500",
        danger: "bg-yellow-600 hover:bg-yellow-500 text-black border-2 border-yellow-400",
    };
    return (
        <button type="button" onClick={onClick} className={`${baseClasses} ${variantClasses[variant]}`}>
            {children}
        </button>
    );
};
