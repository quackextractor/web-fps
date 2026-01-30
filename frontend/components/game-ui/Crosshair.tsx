import React from "react";

export const Crosshair: React.FC = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 mix-blend-difference">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="2" fill="#0f0" className="drop-shadow-md" />
                <path d="M12 4V10M12 14V20M4 12H10M14 12H20" stroke="#0f0" strokeWidth="2" strokeLinecap="round" className="drop-shadow-md" />
            </svg>
        </div>
    );
};
