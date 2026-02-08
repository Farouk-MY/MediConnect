import { Stack } from 'expo-router';

export default function AbsencesLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="create" />
        </Stack>
    );
}
