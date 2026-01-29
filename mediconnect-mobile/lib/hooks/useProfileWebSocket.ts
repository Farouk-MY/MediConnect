/**
 * useProfileWebSocket - Real-time profile updates via WebSocket
 * 
 * Establishes a WebSocket connection to receive real-time profile updates.
 * Automatically reconnects on connection drops.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { PatientProfile } from '../api/patients';
import { DoctorProfile } from '../api/doctors';

// Get WebSocket URL from API URL (replace http with ws)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const WS_BASE_URL = API_URL.replace('/api/v1', '').replace('http', 'ws');

type ProfileData = PatientProfile | DoctorProfile;

interface ProfileUpdateMessage {
    type: 'profile_update';
    data: ProfileData;
}

interface UseProfileWebSocketOptions {
    onProfileUpdate: (profile: ProfileData) => void;
    enabled?: boolean;
}

export function useProfileWebSocket({
    onProfileUpdate,
    enabled = true
}: UseProfileWebSocketOptions) {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { user, accessToken } = useAuthStore();

    const connect = useCallback(() => {
        if (!user?.id || !accessToken || !enabled) {
            return;
        }

        // Close existing connection if any
        if (wsRef.current) {
            wsRef.current.close();
        }

        const wsUrl = `${WS_BASE_URL}/ws/profile/${user.id}?token=${accessToken}`;

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('[WebSocket] Connected for real-time profile updates');
            };

            ws.onmessage = (event) => {
                try {
                    const message: ProfileUpdateMessage = JSON.parse(event.data);
                    if (message.type === 'profile_update' && message.data) {
                        console.log('[WebSocket] Profile update received');
                        onProfileUpdate(message.data);
                    }
                } catch (error) {
                    console.error('[WebSocket] Error parsing message:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('[WebSocket] Error:', error);
            };

            ws.onclose = (event) => {
                console.log('[WebSocket] Connection closed:', event.code);
                wsRef.current = null;

                // Reconnect after 3 seconds if not a normal close
                if (event.code !== 1000 && enabled) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log('[WebSocket] Attempting to reconnect...');
                        connect();
                    }, 3000);
                }
            };
        } catch (error) {
            console.error('[WebSocket] Failed to connect:', error);
        }
    }, [user?.id, accessToken, enabled, onProfileUpdate]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (wsRef.current) {
            wsRef.current.close(1000, 'Component unmounting');
            wsRef.current = null;
        }
    }, []);

    useEffect(() => {
        connect();
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        isConnected: wsRef.current?.readyState === WebSocket.OPEN,
        reconnect: connect,
        disconnect,
    };
}
