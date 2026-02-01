import React from "react";
import { MenuButton } from "./MenuButton";

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: "primary" | "danger";
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "YES",
    cancelText = "NO",
    variant = "danger",
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-hidden">
            <div className="w-full max-w-sm bg-black retro-border p-4 md:p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse" />

                <h2 className="retro-text text-[clamp(1rem,4vw,1.5rem)] text-red-600 mb-4 text-center tracking-tighter">
                    {title}
                </h2>

                <p className="retro-text text-[clamp(10px,2vw,12px)] text-gray-300 mb-8 text-center leading-relaxed opacity-80">
                    {message}
                </p>

                <div className="flex flex-col gap-3 w-full">
                    <MenuButton onClick={onConfirm} variant={variant}>
                        {confirmText}
                    </MenuButton>
                    <MenuButton onClick={onCancel} variant="secondary">
                        {cancelText}
                    </MenuButton>
                </div>
            </div>
        </div>
    );
};
