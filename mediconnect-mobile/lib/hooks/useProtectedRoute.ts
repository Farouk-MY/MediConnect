import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

/**
 * Hook that protects routes by redirecting to login when user is not authenticated.
 * Should be used in protected layout components (e.g., patient and doctor layouts).
 */
export function useProtectedRoute() {
    const router = useRouter();
    const segments = useSegments();
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
        // Don't do anything while still loading auth state
        if (isLoading) return;

        // Check if we're on a protected route (patient or doctor)
        const inProtectedGroup = segments[0] === '(patient)' || segments[0] === '(doctor)';

        if (!isAuthenticated && inProtectedGroup) {
            // Redirect to login if not authenticated but trying to access protected route
            router.replace('/(auth)/login');
        }
    }, [isAuthenticated, isLoading, segments]);
}
