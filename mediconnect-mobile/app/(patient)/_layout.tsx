import { Stack } from 'expo-router';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';

export default function PatientLayout() {
    // Redirect to login if user becomes unauthenticated (e.g., token expired)
    useProtectedRoute();

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
        </Stack>
    );
}