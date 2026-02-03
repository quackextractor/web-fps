import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { MobileControls } from './MobileControls';
import React from 'react';

// Mock useSettings hook
vi.mock('@/hooks/use-settings', () => ({
    useSettings: () => ({
        settings: {
            touchSensitivity: 1,
        },
    }),
}));

describe('MobileControls', () => {
    it('calls onLook when swiping in the look zone', () => {
        const onLook = vi.fn();
        const { getByTestId, container } = render(
            <MobileControls
                onMove={() => { }}
                onLook={onLook}
                onFire={() => { }}
                onNextWeapon={() => { }}
                onPrevWeapon={() => { }}
            />
        );

        // Finding the look zone. It's the second div child of the main container based on our implementation.
        // Or we can add a data-testid to it.
        const lookZone = getByTestId('look-zone');
        expect(lookZone).toBeTruthy();

        if (lookZone) {
            fireEvent.touchStart(lookZone, {
                changedTouches: [{ identifier: 1, clientX: 500, clientY: 300 }]
            });

            fireEvent.touchMove(lookZone, {
                changedTouches: [{ identifier: 1, clientX: 550, clientY: 300 }]
            });

            expect(onLook).toHaveBeenCalledWith(50);
        }
    });

    it('calls onFire when pressing the FIRE button', () => {
        const onFire = vi.fn();
        const { getByText } = render(
            <MobileControls
                onMove={() => { }}
                onLook={() => { }}
                onFire={onFire}
                onNextWeapon={() => { }}
                onPrevWeapon={() => { }}
            />
        );

        const fireButton = getByText('FIRE');
        fireEvent.touchStart(fireButton);
        expect(onFire).toHaveBeenCalledWith(true);

        fireEvent.touchEnd(fireButton);
        expect(onFire).toHaveBeenCalledWith(false);
    });
});
