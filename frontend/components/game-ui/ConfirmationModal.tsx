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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-black retro-border p-6 shadow-2xl relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse" />

                <h2 className="retro-text text-xl md:text-2xl text-red-600 mb-4 text-center tracking-tighter">
                    {title}
                </h2>

                <p className="retro-text text-xs md:text-sm text-gray-300 mb-8 text-center leading-relaxed">
                    {message}
                </p>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <MenuButton onClick={onConfirm} variant={variant}>
                            {confirmText}
                        </MenuButton>
                    </div>
                    <div className="flex-1">
                        <MenuButton onClick={onCancel} variant="secondary">
                            {cancelText}
                        </MenuButton>
                    </div>
                </div>
            </div>
        </div>
    );
};
