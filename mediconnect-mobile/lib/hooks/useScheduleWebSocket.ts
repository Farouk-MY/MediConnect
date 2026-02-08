/**
 * useScheduleWebSocket - Real-time schedule updates via WebSocket
 * 
 * Establishes a WebSocket connection to receive real-time schedule updates
 * including availability changes, absence events, and appointment updates.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthStore } from '../stores/authStore';

// Get WebSocket URL from API URL (replace http with ws)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const WS_BASE_URL = API_URL.replace('/api/v1', '').replace('http', 'ws');

// Event types
export type ScheduleEventType = 
    | 'schedule_updated'
    | 'absence_created'
    | 'absence_updated'
    | 'absence_cancelled'
    | 'appointment_created'
    | 'appointment_confirmed'
    | 'appointment_cancelled'
    | 'appointment_completed';

export interface ScheduleEvent {
    type: 'schedule_update' | 'absence_update' | 'appointment_update';
    event: ScheduleEventType;
    doctor_id: string;
    data: Record<string, any>;
}

interface UseScheduleWebSocketOptions {
    doctorId: string;
    onScheduleUpdate?: (event: ScheduleEvent) => void;
    onAbsenceUpdate?: (event: ScheduleEvent) => void;
    onAppointmentUpdate?: (event: ScheduleEvent) => void;
    enabled?: boolean;
}

interface UseScheduleWebSocketReturn {
    isConnected: boolean;
    reconnect: () => void;
    disconnect: () => void;
}

export function useScheduleWebSocket({
    doctorId,
    onScheduleUpdate,
    onAbsenceUpdate,
    onAppointmentUpdate,
    enabled = true
}: UseScheduleWebSocketOptions): UseScheduleWebSocketReturn {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { accessToken } = useAuthStore();

    const connect = useCallback(() => {
        if (!doctorId || !accessToken || !enabled) {
            return;
        }

        // Close existing connection if any
        if (wsRef.current) {
            wsRef.current.close();
        }

        const wsUrl = `${WS_BASE_URL}/ws/schedule/${doctorId}?token=${accessToken}`;

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('[Schedule WS] Connected for real-time updates');
                setIsConnected(true);
                
                // Start ping interval to keep connection alive
                pingIntervalRef.current = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send('ping');
                    }
                }, 30000); // Ping every 30 seconds
            };

            ws.onmessage = (event) => {
                try {
                    // Handle pong response
                    if (event.data === 'pong') {
                        return;
                    }

                    const message: ScheduleEvent = JSON.parse(event.data);
                    console.log('[Schedule WS] Event received:', message.type, message.event);

                    // Route to appropriate handler
                    switch (message.type) {
                        case 'schedule_update':
                            onScheduleUpdate?.(message);
                            break;
                        case 'absence_update':
                            onAbsenceUpdate?.(message);
                            break;
                        case 'appointment_update':
                            onAppointmentUpdate?.(message);
                            break;
                    }
                } catch (error) {
                    console.error('[Schedule WS] Error parsing message:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('[Schedule WS] Error:', error);
            };

            ws.onclose = (event) => {
                console.log('[Schedule WS] Connection closed:', event.code);
                wsRef.current = null;
                setIsConnected(false);

                // Clear ping interval
                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current);
                    pingIntervalRef.current = null;
                }

                // Reconnect after 5 seconds if not a normal close
                if (event.code !== 1000 && enabled) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log('[Schedule WS] Attempting to reconnect...');
                        connect();
                    }, 5000);
                }
            };
        } catch (error) {
            console.error('[Schedule WS] Failed to connect:', error);
        }
    }, [doctorId, accessToken, enabled, onScheduleUpdate, onAbsenceUpdate, onAppointmentUpdate]);

    const disconnect = useCallback(() => {
        // Clear reconnect timeout
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        
        // Clear ping interval
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }
        
        // Close WebSocket
        if (wsRef.current) {
            wsRef.current.close(1000, 'Component unmounting');
            wsRef.current = null;
        }
        
        setIsConnected(false);
    }, []);

    const reconnect = useCallback(() => {
        disconnect();
        // Small delay before reconnecting
        setTimeout(() => {
            connect();
        }, 100);
    }, [connect, disconnect]);

    // Connect on mount, disconnect on unmount
    useEffect(() => {
        connect();
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        isConnected,
        reconnect,
        disconnect,
    };
}

/**
 * Hook for patients to receive schedule updates from their doctors
 */
interface UsePatientScheduleWebSocketOptions {
    doctorIds: string[];
    onDoctorAbsenceCreated?: (doctorId: string, absenceData: any) => void;
    onAppointmentStatusChanged?: (appointmentId: string, newStatus: string) => void;
    enabled?: boolean;
}

export function usePatientScheduleWebSocket({
    doctorIds,
    onDoctorAbsenceCreated,
    onAppointmentStatusChanged,
    enabled = true
}: UsePatientScheduleWebSocketOptions) {
    const { accessToken, user } = useAuthStore();
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const connect = useCallback(() => {
        if (!user?.id || !accessToken || !enabled || doctorIds.length === 0) {
            return;
        }

        // For now, connect to a general patient updates endpoint
        // This could be enhanced to subscribe to specific doctors
        const wsUrl = `${WS_BASE_URL}/ws/patient-updates/${user.id}?token=${accessToken}`;

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('[Patient Schedule WS] Connected');
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    if (event.data === 'pong') return;
                    
                    const message = JSON.parse(event.data);
                    
                    if (message.type === 'absence_update' && message.event === 'absence_created') {
                        onDoctorAbsenceCreated?.(message.doctor_id, message.data);
                    }
                    
                    if (message.type === 'appointment_update') {
                        onAppointmentStatusChanged?.(message.data.appointment_id, message.data.status);
                    }
                } catch (error) {
                    console.error('[Patient Schedule WS] Error:', error);
                }
            };

            ws.onclose = () => {
                setIsConnected(false);
            };
        } catch (error) {
            console.error('[Patient Schedule WS] Failed to connect:', error);
        }
    }, [user?.id, accessToken, enabled, doctorIds, onDoctorAbsenceCreated, onAppointmentStatusChanged]);

    useEffect(() => {
        connect();
        return () => {
            if (wsRef.current) {
                wsRef.current.close(1000);
                wsRef.current = null;
            }
        };
    }, [connect]);

    return { isConnected };
}
