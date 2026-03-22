import { useCallback, useEffect, useRef, useState } from "react";
import { logger } from "@/lib/logger";

export function usePointerLock(
    elementRef: React.RefObject<HTMLElement>,
    isEnabled: boolean,
    onLockChange?: (isLocked: boolean) => void
) {
    const [isLocked, setIsLocked] = useState(false);
    // Track if we *should* be locked to prevent fighting with browser events
    const shouldBeLockedRef = useRef(isEnabled);

    useEffect(() => {
        shouldBeLockedRef.current = isEnabled;
        if (!isEnabled && isLocked) {
            document.exitPointerLock();
        }
    }, [isEnabled, isLocked]);

    const lock = useCallback((force = false) => {
        if (!elementRef.current || (!shouldBeLockedRef.current && !force)) return;
        try {
            elementRef.current.requestPointerLock();
        } catch (e) {
            logger.error("Failed to request pointer lock:", e);
        }
    }, [elementRef]);

    const unlock = useCallback(() => {
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }, []);

    useEffect(() => {
        const handleLockChange = () => {
            const locked = document.pointerLockElement === elementRef.current;
            setIsLocked(locked);
            if (onLockChange) {
                onLockChange(locked);
            }
        };

        const handleError = (e: Event) => {
            logger.warn("Pointer lock error:", e);
        };

        document.addEventListener("pointerlockchange", handleLockChange);
        document.addEventListener("pointerlockerror", handleError);

        return () => {
            document.removeEventListener("pointerlockchange", handleLockChange);
            document.removeEventListener("pointerlockerror", handleError);
        };
    }, [elementRef, onLockChange]);

    return { isLocked, lock, unlock };
}
