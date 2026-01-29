import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import DoomGame from '@/components/fps-game';

// Mock dependencies
vi.mock('@/lib/sound-manager', () => ({
    soundManager: {
        init: vi.fn(),
        play: vi.fn(),
    },
}));

vi.mock('@/lib/canvas-renderer', () => ({
    renderEnemy: vi.fn(),
    renderProjectile: vi.fn(),
    renderPickup: vi.fn(),
    drawWeapon: vi.fn(),
    drawHUD: vi.fn(),
    renderDebugView: vi.fn(),
    shadeColor: vi.fn(),
}));

vi.mock('@/hooks/use-settings', () => ({
    useSettings: () => ({
        settings: {
            mouseSensitivity: 1,
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
            turnSpeed: 1.0,
        },
        updateSettings: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-pointer-lock', () => ({
    usePointerLock: () => ({
        isLocked: false,
        lock: vi.fn(),
        unlock: vi.fn(),
    }),
}));

describe('FPSGame', () => {
    it('renders the game canvas', () => {
        render(<DoomGame />);
        // Checking for text that appears in the initial render (e.g., overlay instructions)
        expect(screen.getByText(/Click to capture mouse/i)).toBeInTheDocument();
    });
});
