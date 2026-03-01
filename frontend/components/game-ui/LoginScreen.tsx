import React, { useState } from "react";
import { MenuButton } from "./MenuButton";
import { ScanlinesOverlay } from "./ScanlinesOverlay";
import { useEconomy } from "@/context/EconomyContext";

interface LoginScreenProps {
    onBack: () => void;
    onSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBack, onSuccess }) => {
    const { login, cloudStatus, cloudError } = useEconomy();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [localError, setLocalError] = useState("");

    const handleLogin = async () => {
        setLocalError("");

        if (username.trim().length === 0) {
            setLocalError("USERNAME REQUIRED");
            return;
        }

        if (password.trim().length === 0) {
            setLocalError("PASSWORD REQUIRED");
            return;
        }

        const ok = await login(username.trim(), password);
        if (!ok) {
            return;
        }

        onSuccess();
    };

    let statusText = "READY";
    if (cloudStatus === "syncing") {
        statusText = "AUTHORIZING";
    }

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-4 select-none pointer-events-auto">
            <ScanlinesOverlay />

            <div className="relative z-10 w-full max-w-xl bg-black retro-border p-6 md:p-8">
                <h2
                    className="retro-text text-2xl md:text-4xl text-red-600 mb-4 text-center tracking-tighter"
                    style={{ textShadow: "4px 4px 0px #300000" }}
                >
                    <p>INFERNO CORP.</p>
                    <p className="text-xs text-gray-400" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>AUTHORIZED ACCESS TERMINAL</p>
                </h2>

                <div className="flex flex-col gap-4 mb-6">
                    <label className="retro-text text-xs text-red-400" htmlFor="login-username">&gt; WORKER ID / USERNAME:</label>
                    <input
                        id="login-username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        className="retro-border bg-black text-white px-4 py-3 outline-none focus:ring-0"
                        autoComplete="username"
                    />

                    <label className="retro-text text-xs text-red-400" htmlFor="login-password">&gt; ENCRYPTED PASSWORD:</label>
                    <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="retro-border bg-black text-white px-4 py-3 outline-none focus:ring-0"
                        autoComplete="current-password"
                    />
                </div>

                <div className="text-center mb-6 min-h-5">
                    {localError.length > 0 && <p className="retro-text text-xs text-yellow-500">{localError}</p>}
                    {localError.length === 0 && cloudError.length > 0 && <p className="retro-text text-xs text-yellow-500">{cloudError}</p>}
                    {localError.length === 0 && cloudError.length === 0 && (
                        <p className="retro-text text-xs text-gray-500">STATUS {statusText}</p>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                        <MenuButton onClick={handleLogin}>PUNCH IN</MenuButton>
                        {/* <MenuButton onClick={handleRegister} variant="secondary">REGISTER</MenuButton> */}
                    </div>
                    <MenuButton onClick={onBack} variant="secondary">BACK TO MAIN MENU</MenuButton>
                </div>
            </div>
        </div>
    );
};
