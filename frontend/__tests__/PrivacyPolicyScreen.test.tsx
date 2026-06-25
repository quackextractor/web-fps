import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PrivacyPolicyScreen } from "@/components/game-ui/PrivacyPolicyScreen";
import { useEconomy } from "@/context/EconomyContext";

// Mock the EconomyContext
vi.mock("@/context/EconomyContext", () => ({
    useEconomy: vi.fn(),
}));

// Mock ScanlinesOverlay to avoid requiring SettingsProvider
vi.mock("@/components/game-ui/ScanlinesOverlay", () => ({
    ScanlinesOverlay: () => <div data-testid="scanlines-mock" />,
}));

describe("PrivacyPolicyScreen", () => {
    const mockOnBack = vi.fn();
    const mockLogout = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it("renders the privacy policy title and content", () => {
        (useEconomy as any).mockReturnValue({
            isAuthenticated: false,
            logout: mockLogout,
        });

        render(<PrivacyPolicyScreen onBack={mockOnBack} />);

        expect(screen.getByText("DATA PRIVACY & COMPLIANCE")).toBeTruthy();
        expect(screen.getByText(/DATA HARVESTING & COLLECTION/i)).toBeTruthy();
        expect(screen.queryByText("RIGHT TO BE FORGOTTEN (ERASURE)")).toBeNull();
    });

    it("renders delete account button when user is authenticated", () => {
        (useEconomy as any).mockReturnValue({
            isAuthenticated: true,
            logout: mockLogout,
        });

        render(<PrivacyPolicyScreen onBack={mockOnBack} />);

        expect(screen.getByText("RIGHT TO BE FORGOTTEN (ERASURE)")).toBeTruthy();
        expect(screen.getByText("PURGE CENTRAL RECORDS (DELETE ACCOUNT)")).toBeTruthy();
    });

    it("calls onBack when the back button is clicked", () => {
        (useEconomy as any).mockReturnValue({
            isAuthenticated: false,
            logout: mockLogout,
        });

        render(<PrivacyPolicyScreen onBack={mockOnBack} />);

        const backButton = screen.getByText("BACK TO MENU");
        fireEvent.click(backButton);

        expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
});
