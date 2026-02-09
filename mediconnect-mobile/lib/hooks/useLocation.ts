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
 * Uses timeout and fallback to last known position for reliability.
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
                setError('Permission de localisation refusée. Veuillez l\'activer dans les paramètres.');
                setLoading(false);
                return null;
            }

            // Check if location services are enabled
            const providerStatus = await Location.getProviderStatusAsync();
            if (!providerStatus.locationServicesEnabled) {
                setError('Les services de localisation sont désactivés. Veuillez les activer.');
                setLoading(false);
                return null;
            }

            // Try to get current position with timeout (5 seconds max)
            const timeoutPromise = new Promise<null>((resolve) => 
                setTimeout(() => resolve(null), 5000)
            );

            const locationPromise = Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced, // Balanced is faster than High
                timeInterval: 5000,
            }).then(loc => ({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            })).catch(() => null);

            let coords = await Promise.race([locationPromise, timeoutPromise]);

            // Fallback to last known position if current position fails
            if (!coords) {
                console.log('Current position timed out, trying last known position...');
                const lastKnown = await Location.getLastKnownPositionAsync();
                if (lastKnown) {
                    coords = {
                        latitude: lastKnown.coords.latitude,
                        longitude: lastKnown.coords.longitude,
                    };
                }
            }

            if (!coords) {
                setError('Impossible d\'obtenir la position. Assurez-vous que le GPS est activé et réessayez.');
                setLoading(false);
                return null;
            }

            setLoading(false);
            return coords;
        } catch (err: any) {
            console.error('Location error:', err);
            setError(err.message || 'Échec de l\'obtention de la localisation');
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
