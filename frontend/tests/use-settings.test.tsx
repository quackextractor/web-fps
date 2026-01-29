import { renderHook, act } from '@testing-library/react';
import { useSettings, DEFAULT_SETTINGS } from '../hooks/use-settings';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        clear: () => {
            store = {};
        },
        removeItem: (key: string) => {
            delete store[key];
        }
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('useSettings', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('should return default settings when no local storage exists', () => {
        const { result } = renderHook(() => useSettings());
        expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should load settings from local storage if present', () => {
        const customSettings = {
            ...DEFAULT_SETTINGS,
            mouseSensitivity: 2.5,
            soundEnabled: false
        };
        window.localStorage.setItem('doom-settings', JSON.stringify(customSettings));

        const { result } = renderHook(() => useSettings());
        expect(result.current.settings).toEqual(customSettings);
    });

    it('should update settings and save to local storage', () => {
        const { result } = renderHook(() => useSettings());

        act(() => {
            result.current.setSettings({
                ...result.current.settings,
                mouseSensitivity: 3.0
            });
        });

        expect(result.current.settings.mouseSensitivity).toBe(3.0);
        expect(JSON.parse(window.localStorage.getItem('doom-settings')!)).toEqual({
            ...DEFAULT_SETTINGS,
            mouseSensitivity: 3.0
        });
    });

    it('should update individual setting', () => {
        const { result } = renderHook(() => useSettings());

        act(() => {
            result.current.updateSetting('volume', 0.5);
        });

        expect(result.current.settings.volume).toBe(0.5);
    });

    it('should reset settings to default', () => {
        const { result } = renderHook(() => useSettings());

        act(() => {
            result.current.setSettings({
                ...DEFAULT_SETTINGS,
                mouseSensitivity: 5.0
            });
        });

        act(() => {
            result.current.resetSettings();
        });

        expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    });
});
