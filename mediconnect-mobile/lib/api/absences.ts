/**
 * Absences API Client
 * 
 * API functions for managing doctor absences including
 * vacations, sick leave, training, and recurring unavailability.
 */

import { apiClient } from './client';

// ========== Types ==========

export type AbsenceType = 'vacation' | 'sick' | 'training' | 'conference' | 'personal' | 'other';
export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface AffectedAppointment {
    id: string;
    appointment_date: string;
    patient_name: string;
    patient_phone?: string;
    consultation_type: string;
    status: string;
}

export interface Absence {
    id: string;
    doctor_id: string;
    start_date: string;
    end_date: string;
    start_time?: string;
    end_time?: string;
    absence_type: AbsenceType;
    title?: string;
    reason?: string;
    is_recurring: boolean;
    recurrence_pattern: RecurrencePattern;
    recurrence_end_date?: string;
    notify_patients: boolean;
    patients_notified_at?: string;
    affected_appointments_count: number;
    is_active: boolean;
    is_full_day: boolean;
    duration_days: number;
    is_past: boolean;
    is_current: boolean;
    is_future: boolean;
    created_at: string;
    updated_at: string;
}

export interface AbsenceListResponse {
    absences: Absence[];
    total: number;
    upcoming_count: number;
    past_count: number;
}

export interface ConflictCheckResponse {
    has_conflicts: boolean;
    affected_count: number;
    affected_appointments: AffectedAppointment[];
    recommendation: string;
}

export interface AbsenceCreateResponse {
    absence: Absence;
    conflicts: ConflictCheckResponse;
    message: string;
}

// ========== Request Types ==========

export interface CreateAbsenceRequest {
    start_date: string;
    end_date: string;
    start_time?: string;
    end_time?: string;
    absence_type?: AbsenceType;
    title?: string;
    reason?: string;
    is_recurring?: boolean;
    recurrence_pattern?: RecurrencePattern;
    recurrence_end_date?: string;
    notify_patients?: boolean;
}

export interface UpdateAbsenceRequest {
    start_date?: string;
    end_date?: string;
    start_time?: string;
    end_time?: string;
    absence_type?: AbsenceType;
    title?: string;
    reason?: string;
    is_recurring?: boolean;
    recurrence_pattern?: RecurrencePattern;
    recurrence_end_date?: string;
    notify_patients?: boolean;
    is_active?: boolean;
}

export interface ConflictCheckRequest {
    start_date: string;
    end_date: string;
    start_time?: string;
    end_time?: string;
}

// ========== API Functions ==========

export const absencesApi = {
    // Get my absences
    getMyAbsences: async (params?: {
        include_past?: boolean;
        include_cancelled?: boolean;
    }): Promise<AbsenceListResponse> => {
        const response = await apiClient.get<AbsenceListResponse>('/doctors/me/absences', {
            params: {
                include_past: params?.include_past ?? false,
                include_cancelled: params?.include_cancelled ?? false
            }
        });
        return response.data;
    },

    // Create absence
    createAbsence: async (data: CreateAbsenceRequest): Promise<AbsenceCreateResponse> => {
        const response = await apiClient.post<AbsenceCreateResponse>('/doctors/me/absences', data);
        return response.data;
    },

    // Get absence by ID
    getAbsence: async (absenceId: string): Promise<Absence> => {
        const response = await apiClient.get<Absence>(`/doctors/me/absences/${absenceId}`);
        return response.data;
    },

    // Update absence
    updateAbsence: async (absenceId: string, data: UpdateAbsenceRequest): Promise<Absence> => {
        const response = await apiClient.put<Absence>(`/doctors/me/absences/${absenceId}`, data);
        return response.data;
    },

    // Delete/cancel absence
    deleteAbsence: async (absenceId: string): Promise<void> => {
        await apiClient.delete(`/doctors/me/absences/${absenceId}`);
    },

    // Check conflicts before creating absence
    checkConflicts: async (data: ConflictCheckRequest): Promise<ConflictCheckResponse> => {
        const response = await apiClient.post<ConflictCheckResponse>('/doctors/me/absences/check-conflicts', data);
        return response.data;
    }
};

// ========== Helpers ==========

export const ABSENCE_TYPE_LABELS: Record<AbsenceType, string> = {
    vacation: 'Vacances',
    sick: 'Maladie',
    training: 'Formation',
    conference: 'Conférence',
    personal: 'Personnel',
    other: 'Autre'
};

export const ABSENCE_TYPE_ICONS: Record<AbsenceType, string> = {
    vacation: 'airplane',
    sick: 'medkit',
    training: 'school',
    conference: 'people',
    personal: 'person',
    other: 'ellipsis-horizontal'
};

export const ABSENCE_TYPE_COLORS: Record<AbsenceType, string> = {
    vacation: '#10B981',
    sick: '#EF4444',
    training: '#3B82F6',
    conference: '#8B5CF6',
    personal: '#F59E0B',
    other: '#6B7280'
};

export const RECURRENCE_LABELS: Record<RecurrencePattern, string> = {
    none: 'Une seule fois',
    daily: 'Tous les jours',
    weekly: 'Chaque semaine',
    biweekly: 'Toutes les 2 semaines',
    monthly: 'Chaque mois'
};
