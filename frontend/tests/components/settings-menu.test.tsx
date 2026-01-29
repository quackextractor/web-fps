import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsMenu } from '@/components/settings-menu';
import { vi } from 'vitest';
import { GameSettings } from '@/hooks/use-settings';

const defaultSettings: GameSettings = {
    mouseSensitivity: 1.5,
    soundEnabled: true,
    musicEnabled: true,
    volume: 0.5,
    showFPS: true,
    crosshairStyle: 'cross',
    difficulty: 'normal',
    timeScale: 1.0,
    debugMode: false,
    resolution: "800x600",
    fullscreen: false,
    turnSpeed: 2.0,
};

describe('SettingsMenu', () => {
    const mockOnClose = vi.fn();
    const mockOnUpdate = vi.fn();
    const mockOnReset = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(
            <SettingsMenu
                settings={defaultSettings}
                setSettings={mockOnUpdate}
                onBack={mockOnClose}
                unlockAllLevels={vi.fn()}
                unlockAllWeapons={vi.fn()}
                resetSettings={mockOnReset}
            />
        );

        expect(screen.getByText('OPTIONS')).toBeInTheDocument();
        expect(screen.getByText('AUDIO')).toBeInTheDocument();
        expect(screen.getByText('GAMEPLAY')).toBeInTheDocument();
    });

    it('renders with correct default values', () => {
        render(
            <SettingsMenu
                settings={defaultSettings}
                setSettings={mockOnUpdate}
                onBack={mockOnClose}
                unlockAllLevels={vi.fn()}
                unlockAllWeapons={vi.fn()}
                resetSettings={mockOnReset}
            />
        );

        // Checks are now unique
        expect(screen.getByText('1.0x')).toBeInTheDocument(); // Game Speed
        expect(screen.getByText('1.5x')).toBeInTheDocument(); // Mouse Sensitivity
        expect(screen.getByText('2.0x')).toBeInTheDocument(); // Turn Speed
    });

    it('calls onBack when "BACK TO MENU" is clicked', () => {
        render(
            <SettingsMenu
                settings={defaultSettings}
                setSettings={mockOnUpdate}
                onBack={mockOnClose}
                unlockAllLevels={vi.fn()}
                unlockAllWeapons={vi.fn()}
                resetSettings={mockOnReset}
            />
        );

        fireEvent.click(screen.getByText('BACK TO MENU'));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls resetSettings when "RESET TO DEFAULTS" is clicked', () => {
        render(
            <SettingsMenu
                settings={defaultSettings}
                setSettings={mockOnUpdate}
                onBack={mockOnClose}
                unlockAllLevels={vi.fn()}
                unlockAllWeapons={vi.fn()}
                resetSettings={mockOnReset}
            />
        );

        fireEvent.click(screen.getByText('RESET TO DEFAULTS'));
        expect(mockOnReset).toHaveBeenCalled();
    });
});
