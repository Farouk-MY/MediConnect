import { useState } from 'react';
import * as Location from 'expo-location';

interface LocationCoords {
    latitude: number;
    longitude: number;
}

interface UseLocationReturn {
    loading: boolean;
    error: string | null;
    getCurrentLocation: () => Promise<LocationCoords | null>;
}

/**
 * Hook for handling device GPS location.
 * Requests permissions and retrieves current coordinates.
 */
export function useLocation(): UseLocationReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getCurrentLocation = async (): Promise<LocationCoords | null> => {
        setLoading(true);
        setError(null);

        try {
            // Request permission
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                setError('Location permission denied. Please enable it in settings.');
                setLoading(false);
                return null;
            }

            // Get current position
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            setLoading(false);
            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
        } catch (err: any) {
            setError(err.message || 'Failed to get location');
            setLoading(false);
            return null;
        }
    };

    return {
        loading,
        error,
        getCurrentLocation,
    };
}
