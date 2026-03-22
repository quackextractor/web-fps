import React, { useEffect, useState } from "react";
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
    const [loginToken, setLoginToken] = useState("");
    const [localError, setLocalError] = useState("");

    const fetchLoginToken = async () => {
        try {
            const response = await fetch("/api/auth/login-token", {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                setLocalError("FAILED TO PREPARE LOGIN TOKEN");
                return;
            }

            const data = await response.json();
            if (typeof data.loginToken === "string" && data.loginToken.length > 0) {
                setLoginToken(data.loginToken);
                setLocalError("");
                return;
            }

            setLocalError("FAILED TO PREPARE LOGIN TOKEN");
        } catch {
            setLocalError("FAILED TO PREPARE LOGIN TOKEN");
        }
    };

    useEffect(() => {
        void fetchLoginToken();
    }, []);

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

        if (loginToken.trim().length === 0) {
            setLocalError("LOGIN TOKEN NOT READY");
            return;
        }

        const ok = await login(username.trim(), password, loginToken);
        await fetchLoginToken();
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
        <div className="fixed xl:absolute inset-0 flex flex-col items-center justify-start xl:justify-center bg-black p-2 xl:p-4 select-none pointer-events-auto overflow-y-auto overflow-x-hidden">
            <ScanlinesOverlay />

            <div className="relative z-10 w-full xl:max-w-xl bg-black retro-border p-4 xl:p-8 max-h-[calc(100dvh-1rem)] xl:max-h-[calc(100dvh-2rem)] overflow-y-auto">
                <h1
                    className="retro-text text-xl xl:text-4xl text-red-600 mb-2 xl:mb-4 text-center tracking-tighter"
                    style={{ textShadow: "2px 2px 0px #300000" }}
                >
                    INDUSTRIALIST CORP.
                </h1>
                <h2 className="retro-text text-[10px] xl:text-xs text-gray-400 text-center mb-2 xl:mb-4" style={{ marginTop: "0.25rem" }}>
                    AUTHORIZED ACCESS TERMINAL
                </h2>

                <div className="flex flex-col gap-2 xl:gap-4 mb-4 xl:mb-6">
                    <label className="retro-text text-[10px] xl:text-xs text-red-400" htmlFor="login-username">&gt; WORKER ID / USERNAME:</label>
                    <input
                        id="login-username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        className="retro-border bg-black text-white px-2 xl:px-4 py-2 xl:py-3 text-[10px] xl:text-base outline-none focus:ring-0"
                        autoComplete="username"
                    />

                    <label className="retro-text text-[10px] xl:text-xs text-red-400" htmlFor="login-password">&gt; ENCRYPTED PASSWORD:</label>
                    <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="retro-border bg-black text-white px-2 xl:px-4 py-2 xl:py-3 text-[10px] xl:text-base outline-none focus:ring-0"
                        autoComplete="current-password"
                    />
                </div>

                <div className="text-center mb-4 xl:mb-6 min-h-5">
                    {localError.length > 0 && <p className="retro-text text-[10px] xl:text-xs text-yellow-500">{localError}</p>}
                    {localError.length === 0 && cloudError.length > 0 && <p className="retro-text text-[10px] xl:text-xs text-yellow-500">{cloudError}</p>}
                    {localError.length === 0 && cloudError.length === 0 && (
                        <p className="retro-text text-[10px] xl:text-xs text-gray-500">STATUS {statusText}</p>
                    )}
                </div>

                <div className="flex flex-col gap-2 xl:gap-3">
                    <div className="flex gap-2 xl:gap-3">
                        <MenuButton onClick={handleLogin}>PUNCH IN</MenuButton>
                        {/* <MenuButton onClick={handleRegister} variant="secondary">REGISTER</MenuButton> */}
                    </div>
                    <MenuButton onClick={onBack} variant="secondary">BACK TO MAIN MENU</MenuButton>
                </div>
            </div>
        </div>
    );
};
