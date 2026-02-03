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
        const { getByTestId } = render(
            <MobileControls
                onMove={() => { }}
                onLook={onLook}
                onFire={() => { }}
                onPause={() => { }}
                onNextWeapon={() => { }}
                onPrevWeapon={() => { }}
            />
        );

        const lookZone = getByTestId('look-zone');
        expect(lookZone).toBeTruthy();

        fireEvent.touchStart(lookZone, {
            changedTouches: [{ identifier: 1, clientX: 500, clientY: 300 }]
        });

        fireEvent.touchMove(lookZone, {
            changedTouches: [{ identifier: 1, clientX: 550, clientY: 300 }]
        });

        expect(onLook).toHaveBeenCalledWith(50);
    });

    it('calls onFire when pressing the FIRE button', () => {
        const onFire = vi.fn();
        const { getByLabelText } = render(
            <MobileControls
                onMove={() => { }}
                onLook={() => { }}
                onFire={onFire}
                onPause={() => { }}
                onNextWeapon={() => { }}
                onPrevWeapon={() => { }}
            />
        );

        const fireButton = getByLabelText('Fire');
        fireEvent.touchStart(fireButton);
        expect(onFire).toHaveBeenCalledWith(true);

        fireEvent.touchEnd(fireButton);
        expect(onFire).toHaveBeenCalledWith(false);
    });

    it('calls onPause when pressing the PAUSE button', () => {
        const onPause = vi.fn();
        const { getByLabelText } = render(
            <MobileControls
                onMove={() => { }}
                onLook={() => { }}
                onFire={() => { }}
                onPause={onPause}
                onNextWeapon={() => { }}
                onPrevWeapon={() => { }}
            />
        );

        const pauseButton = getByLabelText('Pause Game');
        fireEvent.click(pauseButton);
        expect(onPause).toHaveBeenCalled();
    });

    it('calls onNextWeapon and onPrevWeapon when pressing weapon buttons', () => {
        const onNextWeapon = vi.fn();
        const onPrevWeapon = vi.fn();
        const { getByLabelText } = render(
            <MobileControls
                onMove={() => { }}
                onLook={() => { }}
                onFire={() => { }}
                onPause={() => { }}
                onNextWeapon={onNextWeapon}
                onPrevWeapon={onPrevWeapon}
            />
        );

        const nextButton = getByLabelText('Next Weapon');
        const prevButton = getByLabelText('Previous Weapon');

        fireEvent.click(nextButton);
        expect(onNextWeapon).toHaveBeenCalled();

        fireEvent.click(prevButton);
        expect(onPrevWeapon).toHaveBeenCalled();
    });
});
