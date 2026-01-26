import { useState, useCallback, useEffect, useRef } from 'react';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

interface ToastState {
    visible: boolean;
    message: string;
    type: ToastType;
}

export function useToast() {
    const [toast, setToast] = useState<ToastState>({
        visible: false,
        message: '',
        type: 'info',
    });

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Show the toast
        setToast({
            visible: true,
            message,
            type,
        });

        // Auto-hide after duration
        timeoutRef.current = setTimeout(() => {
            hideToast();
        }, duration);
    }, []);

    const hideToast = useCallback(() => {
        setToast((prev) => ({ ...prev, visible: false }));
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        toast,
        showToast,
        hideToast,
    };
}
