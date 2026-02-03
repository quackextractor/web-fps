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

        // Mock pointer capture
        lookZone.setPointerCapture = vi.fn();
        lookZone.releasePointerCapture = vi.fn();

        fireEvent.pointerDown(lookZone, {
            pointerId: 1, clientX: 500, clientY: 300
        });

        fireEvent.pointerMove(lookZone, {
            pointerId: 1, clientX: 550, clientY: 300
        });

        expect(onLook).toHaveBeenCalledWith(50);

        fireEvent.pointerUp(lookZone, {
            pointerId: 1
        });
        expect(lookZone.releasePointerCapture).toHaveBeenCalledWith(1);
    });

    it('calls onLook when swiping multiple times', () => {
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
        lookZone.setPointerCapture = vi.fn();

        // pointer on the left side (e.g., clientX: 100)
        fireEvent.pointerDown(lookZone, {
            pointerId: 1, clientX: 100, clientY: 300
        });

        fireEvent.pointerMove(lookZone, {
            pointerId: 1, clientX: 150, clientY: 300
        });

        expect(onLook).toHaveBeenCalledWith(50);

        fireEvent.pointerMove(lookZone, {
            pointerId: 1, clientX: 120, clientY: 300
        });
        expect(onLook).toHaveBeenCalledWith(-30);
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
        fireButton.setPointerCapture = vi.fn();
        fireButton.releasePointerCapture = vi.fn();

        fireEvent.pointerDown(fireButton, { pointerId: 1 });
        expect(onFire).toHaveBeenCalledWith(true);

        fireEvent.pointerUp(fireButton, { pointerId: 1 });
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

    it('calls onMove when using the joystick', () => {
        const onMove = vi.fn();
        const { container } = render(
            <MobileControls
                onMove={onMove}
                onLook={() => { }}
                onFire={() => { }}
                onPause={() => { }}
                onNextWeapon={() => { }}
                onPrevWeapon={() => { }}
            />
        );

        // Find joystick by its style/structure since it doesn't have a data-testid or label
        const joystickOuter = container.querySelector('.rounded-full.border-2.border-white\\/20');
        expect(joystickOuter).toBeTruthy();
        if (!joystickOuter) return;

        joystickOuter.setPointerCapture = vi.fn();
        joystickOuter.releasePointerCapture = vi.fn();

        // Mock getBoundingClientRect
        vi.spyOn(joystickOuter, 'getBoundingClientRect').mockReturnValue({
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            bottom: 200,
            right: 200,
            x: 100,
            y: 100,
            toJSON: () => { }
        });

        // Center is 150, 150. Move to 150, 100 (Forward)
        fireEvent.pointerDown(joystickOuter, { pointerId: 1, clientX: 150, clientY: 150 });
        fireEvent.pointerMove(joystickOuter, { pointerId: 1, clientX: 150, clientY: 100 });

        // updateJoystick: dy = 100 - 150 = -50. y = (-50)/50 = -1. onMove({x, y: -(-1)}) => onMove({x:0, y:1})
        // We look for the call that has the moving values
        const moveCall = onMove.mock.calls.find(call => Math.abs(call[0].y) > 0.5);
        expect(moveCall).toBeTruthy();
        if (moveCall) {
            expect(moveCall[0].x).toBeCloseTo(0);
            expect(moveCall[0].y).toBeCloseTo(1);
        }

        fireEvent.pointerUp(joystickOuter, { pointerId: 1 });
        expect(onMove).toHaveBeenLastCalledWith({ x: 0, y: 0 });
    });
});
