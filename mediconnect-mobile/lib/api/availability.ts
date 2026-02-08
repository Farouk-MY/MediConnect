/**
 * Availability API Client
 * 
 * API functions for managing doctor availability schedules,
 * including weekly recurring slots and one-off exceptions.
 */

import { apiClient } from './client';

// ========== Types ==========

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type ConsultationTypeAvailability = 'presentiel' | 'online' | 'both';

export interface AvailabilitySlot {
    id: string;
    doctor_id: string;
    day_of_week: DayOfWeek;
    start_time: string;
    end_time: string;
    consultation_type: ConsultationTypeAvailability;
    slot_duration_minutes: number;
    break_start?: string;
    break_end?: string;
    is_active: boolean;
    slot_count: number;
    created_at: string;
}

export interface DaySchedule {
    day_of_week: DayOfWeek;
    day_name: string;
    is_working_day: boolean;
    slots: AvailabilitySlot[];
    total_hours: number;
    total_slots: number;
}

export interface WeeklySchedule {
    doctor_id: string;
    schedule: DaySchedule[];
    default_slot_duration: number;
    default_consultation_type: ConsultationTypeAvailability;
}

export interface AvailabilityException {
    id: string;
    doctor_id: string;
    exception_date: string;
    start_time?: string;
    end_time?: string;
    is_available: boolean;
    is_full_day: boolean;
    consultation_type?: ConsultationTypeAvailability;
    reason?: string;
    created_at: string;
}

export interface ComputedTimeSlot {
    start_time: string;
    end_time: string;
    is_available: boolean;
    is_booked: boolean;
    appointment_id?: string;
    consultation_type: ConsultationTypeAvailability;
}

export interface ComputedDayAvailability {
    date: string;
    day_of_week: number;
    day_name: string;
    is_working_day: boolean;
    is_blocked: boolean;
    block_reason?: string;
    slots: ComputedTimeSlot[];
    available_slot_count: number;
    booked_slot_count: number;
}

export interface ComputedAvailability {
    doctor_id: string;
    start_date: string;
    end_date: string;
    days: ComputedDayAvailability[];
}

// ========== Request Types ==========

export interface CreateSlotRequest {
    day_of_week: DayOfWeek;
    start_time: string;
    end_time: string;
    consultation_type?: ConsultationTypeAvailability;
    slot_duration_minutes?: number;
    break_start?: string;
    break_end?: string;
}

export interface UpdateSlotRequest {
    start_time?: string;
    end_time?: string;
    consultation_type?: ConsultationTypeAvailability;
    slot_duration_minutes?: number;
    break_start?: string;
    break_end?: string;
    is_active?: boolean;
}

export interface DayScheduleRequest {
    day_of_week: DayOfWeek;
    is_working_day: boolean;
    slots: CreateSlotRequest[];
}

export interface WorkingHoursRequest {
    schedule: DayScheduleRequest[];
    default_slot_duration?: number;
    default_consultation_type?: ConsultationTypeAvailability;
}

export interface CreateExceptionRequest {
    exception_date: string;
    start_time?: string;
    end_time?: string;
    is_available?: boolean;
    consultation_type?: ConsultationTypeAvailability;
    reason?: string;
}

// ========== API Functions ==========

export const availabilityApi = {
    // Get my weekly schedule
    getMySchedule: async (): Promise<WeeklySchedule> => {
        const response = await apiClient.get<WeeklySchedule>('/doctors/me/schedule');
        return response.data;
    },

    // Create availability slot
    createSlot: async (data: CreateSlotRequest): Promise<AvailabilitySlot> => {
        const response = await apiClient.post<AvailabilitySlot>('/doctors/me/schedule', data);
        return response.data;
    },

    // Update availability slot
    updateSlot: async (slotId: string, data: UpdateSlotRequest): Promise<AvailabilitySlot> => {
        const response = await apiClient.put<AvailabilitySlot>(`/doctors/me/schedule/${slotId}`, data);
        return response.data;
    },

    // Delete availability slot
    deleteSlot: async (slotId: string): Promise<void> => {
        await apiClient.delete(`/doctors/me/schedule/${slotId}`);
    },

    // Set working hours (bulk operation)
    setWorkingHours: async (data: WorkingHoursRequest): Promise<WeeklySchedule> => {
        const response = await apiClient.put<WeeklySchedule>('/doctors/me/schedule/working-hours', data);
        return response.data;
    },

    // Create exception
    createException: async (data: CreateExceptionRequest): Promise<AvailabilityException> => {
        const response = await apiClient.post<AvailabilityException>('/doctors/me/schedule/exception', data);
        return response.data;
    },

    // Get exceptions for date range
    getExceptions: async (startDate?: string, endDate?: string): Promise<AvailabilityException[]> => {
        const response = await apiClient.get<AvailabilityException[]>('/doctors/me/schedule/exceptions', {
            params: { start_date: startDate, end_date: endDate }
        });
        return response.data;
    },

    // Get computed availability
    getComputedAvailability: async (startDate: string, endDate: string): Promise<ComputedAvailability> => {
        const response = await apiClient.get<ComputedAvailability>('/doctors/me/schedule/availability', {
            params: { start_date: startDate, end_date: endDate }
        });
        return response.data;
    },

    // Get doctor availability (public - for patients)
    getDoctorAvailability: async (doctorId: string, startDate: string, endDate: string): Promise<ComputedAvailability> => {
        const response = await apiClient.get<ComputedAvailability>(`/doctors/${doctorId}/availability`, {
            params: { start_date: startDate, end_date: endDate }
        });
        return response.data;
    }
};
