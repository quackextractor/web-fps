import React from "react";

interface CrosshairProps {
    style?: "cross" | "dot" | "circle";
}

export const Crosshair: React.FC<CrosshairProps> = ({ style = "cross" }) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 mix-blend-difference">
            <svg aria-label="Crosshair" role="img" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <title>Crosshair</title>
                {style === "dot" ? (
                    <circle cx="12" cy="12" r="3" fill="#0f0" className="drop-shadow-md" />
                ) : style === "circle" ? (
                    <circle cx="12" cy="12" r="8" stroke="#0f0" strokeWidth="2" className="drop-shadow-md" />
                ) : (
                    <>
                        <circle cx="12" cy="12" r="2" fill="#0f0" className="drop-shadow-md" />
                        <path d="M12 4V10M12 14V20M4 12H10M14 12H20" stroke="#0f0" strokeWidth="2" strokeLinecap="round" className="drop-shadow-md" />
                    </>
                )}
            </svg>
        </div>
    );
};
