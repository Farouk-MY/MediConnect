import { apiClient } from './client';

// ========== Types ==========

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'rescheduled';
export type ConsultationType = 'presentiel' | 'online';

export interface DoctorBrief {
    id: string;
    first_name: string;
    last_name: string;
    specialty: string;
    avatar_url?: string;
    cabinet_address?: string;
    cabinet_city?: string;
}

export interface PatientBrief {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth?: string;
    phone?: string;
}

export interface Appointment {
    id: string;
    patient_id: string;
    doctor_id: string;
    appointment_date: string;
    duration_minutes: number;
    consultation_type: ConsultationType;
    status: AppointmentStatus;
    confirmation_code?: string;
    consultation_fee: number;
    currency: string;
    is_paid: boolean;
    notes?: string;
    video_call_link?: string;
    cancelled_at?: string;
    cancelled_by?: string;
    cancellation_reason?: string;
    created_at: string;
    updated_at: string;
    confirmed_at?: string;
    is_cancellable: boolean;
    is_modifiable: boolean;
    can_join_video: boolean;
    doctor?: DoctorBrief;
    patient?: PatientBrief;
}

export interface AppointmentListResponse {
    appointments: Appointment[];
    total: number;
    page: number;
    page_size: number;
    has_next: boolean;
}

export interface BookingConfirmation {
    appointment_id: string;
    confirmation_code: string;
    appointment_date: string;
    consultation_type: ConsultationType;
    doctor_name: string;
    consultation_fee: number;
    currency: string;
    message: string;
}

export interface TimeSlot {
    start_time: string;
    end_time: string;
    is_available: boolean;
}

export interface DayAvailability {
    date: string;
    slots: TimeSlot[];
}

export interface DoctorAvailability {
    doctor_id: string;
    availability: DayAvailability[];
}

export interface CreateAppointmentRequest {
    doctor_id: string;
    appointment_date: string;
    consultation_type: ConsultationType;
    notes?: string;
}

export interface RescheduleRequest {
    new_date: string;
    notes?: string;
}

// ========== API Functions ==========

export const appointmentsApi = {
    // Create a new appointment
    createAppointment: async (data: CreateAppointmentRequest): Promise<BookingConfirmation> => {
        const response = await apiClient.post<BookingConfirmation>('/appointments', data);
        return response.data;
    },

    // Get my appointments
    getMyAppointments: async (params?: {
        status_filter?: string;
        upcoming_only?: boolean;
        page?: number;
        page_size?: number;
    }): Promise<AppointmentListResponse> => {
        const response = await apiClient.get<AppointmentListResponse>('/appointments/me', {
            params: {
                status_filter: params?.status_filter,
                upcoming_only: params?.upcoming_only ?? false,
                page: params?.page ?? 1,
                page_size: params?.page_size ?? 20
            }
        });
        return response.data;
    },

    // Get appointment by ID
    getAppointmentById: async (appointmentId: string): Promise<Appointment> => {
        const response = await apiClient.get<Appointment>(`/appointments/${appointmentId}`);
        return response.data;
    },

    // Cancel appointment
    cancelAppointment: async (appointmentId: string, reason?: string): Promise<Appointment> => {
        const response = await apiClient.delete<Appointment>(
            `/appointments/${appointmentId}`,
            { data: reason ? { reason } : undefined }
        );
        return response.data;
    },

    // Reschedule appointment
    rescheduleAppointment: async (
        appointmentId: string,
        data: RescheduleRequest
    ): Promise<Appointment> => {
        const response = await apiClient.put<Appointment>(
            `/appointments/${appointmentId}/reschedule`,
            data
        );
        return response.data;
    },

    // Confirm appointment (doctor only)
    confirmAppointment: async (appointmentId: string): Promise<Appointment> => {
        const response = await apiClient.post<Appointment>(
            `/appointments/${appointmentId}/confirm`
        );
        return response.data;
    },

    // Mark completed (doctor only)
    completeAppointment: async (
        appointmentId: string,
        doctorNotes?: string
    ): Promise<Appointment> => {
        const response = await apiClient.post<Appointment>(
            `/appointments/${appointmentId}/complete`,
            null,
            { params: { doctor_notes: doctorNotes } }
        );
        return response.data;
    },

    // Mark no-show (doctor only)
    markNoShow: async (appointmentId: string): Promise<Appointment> => {
        const response = await apiClient.post<Appointment>(
            `/appointments/${appointmentId}/no-show`
        );
        return response.data;
    },

    // Get doctor availability
    getDoctorAvailability: async (
        doctorId: string,
        startDate: string,
        endDate?: string
    ): Promise<DoctorAvailability> => {
        const response = await apiClient.get<DoctorAvailability>(
            `/appointments/doctors/${doctorId}/availability`,
            { params: { start_date: startDate, end_date: endDate } }
        );
        return response.data;
    }
};
