import React, { useState } from "react";
import { MenuButton } from "./MenuButton";
import { ScanlinesOverlay } from "./ScanlinesOverlay";
import { useEconomy } from "@/context/EconomyContext";
import { ConfirmationModal } from "./ConfirmationModal";

interface PrivacyPolicyScreenProps {
    onBack: () => void;
}

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onBack }) => {
    const { isAuthenticated, logout } = useEconomy();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        setStatusMessage("");
        try {
            const response = await fetch("/api/profile", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });
            if (response.ok) {
                setStatusMessage("RECORDS PURGED. LOGGING OUT...");
                setTimeout(() => {
                    logout();
                    onBack();
                }, 2000);
            } else {
                const data = await response.json().catch(() => ({}));
                setStatusMessage(`ERROR: ${data.error || "FAILED TO PURGE RECORDS"}`);
            }
        } catch {
            setStatusMessage("ERROR: CONNECTION FAILED");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="fixed xl:absolute inset-0 flex flex-col items-center justify-start bg-black p-0 xl:p-4 select-none pointer-events-auto overflow-y-auto">
            <ScanlinesOverlay />
            <div className="relative z-10 w-full xl:max-w-3xl bg-black mt-4 xl:mt-0 p-4">
                <div className="border-4 border-gray-800 bg-black p-4 xl:p-6 mb-4">
                    <h1
                        className="retro-text text-lg xl:text-4xl text-red-600 animate-pulse"
                        style={{ textShadow: "2px 2px 0px #300000" }}
                    >
                        DATA PRIVACY & COMPLIANCE
                    </h1>
                    <p className="retro-text mt-2 text-xs text-gray-300">
                        INDUSTRIALIST CORPORATION DIRECTIVE GDPR-2026
                    </p>
                    <div className="mt-4">
                        <MenuButton onClick={onBack} variant="secondary">
                            BACK TO MENU
                        </MenuButton>
                    </div>
                </div>

                <div className="border-4 border-gray-800 bg-black p-4 xl:p-6 mb-4 max-h-[50vh] overflow-y-auto">
                    <div className="retro-text text-[10px] xl:text-xs text-gray-400 space-y-4 leading-relaxed whitespace-pre-line">
                        {`... [AUTHENTICATION PROTOCOL ACTIVE] ...\n
1. DATA HARVESTING & COLLECTION
We collect minimal personal data required to sync progress:
- Username: Used as your Worker ID.
- Encrypted Password: Hashed via bcrypt. Plain text is never saved.
- Game Metrics: Kills, Net Worth, inventory state, and unlocked weapons.
- Web Analytics: IP-anonymized traffic metrics via Vercel.

2. COOKIES & LOCAL STORAGE
- LocalStorage is utilized to cache game settings and offline game saves.
- An HttpOnly, Secure cookie ('auth_token') is processed for session authentication.
- A transient cookie ('industrialist_login_form_token') is used for CSRF protection.

3. GDPR COMPLIANCE & USER RIGHTS
Under the General Data Protection Regulation (GDPR), you possess:
- Right to Access: View the data stored on our servers.
- Right to Rectification: Rectify inaccuracies in your registration information.
- Right to Erasure: Permanent deletion of your user account and all saved game progress from the central database.`}
                    </div>
                </div>

                {isAuthenticated && (
                    <div className="border-4 border-gray-800 bg-black p-4 xl:p-6 mb-4">
                        <h2 className="retro-text text-sm text-yellow-500 mb-2">RIGHT TO BE FORGOTTEN (ERASURE)</h2>
                        <p className="retro-text text-[10px] text-gray-400 mb-4 leading-relaxed">
                            Clicking the button below will permanently purge your worker record from the database.
                            This will immediately delete your account, saved inventory, unlocked items, and leaderboard entries.
                            This operation cannot be undone.
                        </p>
                        <MenuButton onClick={() => setShowDeleteModal(true)} variant="danger" disabled={isDeleting}>
                            PURGE CENTRAL RECORDS (DELETE ACCOUNT)
                        </MenuButton>
                        {statusMessage && (
                            <p className="retro-text text-[10px] mt-2 text-yellow-500">{statusMessage}</p>
                        )}
                    </div>
                )}

                <ConfirmationModal
                    isOpen={showDeleteModal}
                    title="PURGE ALL RECORDS?"
                    message="Are you sure you want to permanently delete your account and all progression data? This action is irreversible."
                    onConfirm={handleDeleteAccount}
                    onCancel={() => setShowDeleteModal(false)}
                    confirmText="PURGE ALL"
                    cancelText="ABORT"
                />
            </div>
        </div>
    );
};
