import { apiClient } from './client';

// Types
export interface EducationItem {
    degree: string;
    institution: string;
    year: number;
    country?: string;
}

export interface DoctorProfile {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    specialty: string;
    license_number: string;
    years_experience: number;
    bio?: string;
    avatar_url?: string;
    education: EducationItem[];
    languages: string[];

    // Cabinet Info
    cabinet_address?: string;
    cabinet_city?: string;
    cabinet_country?: string;
    cabinet_postal_code?: string;
    cabinet_phone?: string;
    cabinet_email?: string;
    latitude?: number;
    longitude?: number;

    // Pricing
    consultation_fee_presentiel: number;
    consultation_fee_online: number;
    currency: string;
    payment_methods: string[];

    // Consultation Types
    offers_presentiel: boolean;
    offers_online: boolean;

    // Statistics
    total_patients: number;
    total_consultations: number;
    average_rating: number;
    is_accepting_patients: boolean;

    created_at: string;
    updated_at: string;
}

export interface DoctorUpdateRequest {
    first_name?: string;
    last_name?: string;
    specialty?: string;
    years_experience?: number;
    bio?: string;
    avatar_url?: string;
    education?: EducationItem[];
    languages?: string[];

    cabinet_address?: string;
    cabinet_city?: string;
    cabinet_country?: string;
    cabinet_postal_code?: string;
    cabinet_phone?: string;
    cabinet_email?: string;
    latitude?: number;
    longitude?: number;

    consultation_fee_presentiel?: number;
    consultation_fee_online?: number;
    currency?: string;
    payment_methods?: string[];

    offers_presentiel?: boolean;
    offers_online?: boolean;
    is_accepting_patients?: boolean;
}

export interface ConsultationTypeConfig {
    offers_presentiel: boolean;
    offers_online: boolean;
    consultation_fee_presentiel?: number;
    consultation_fee_online?: number;
}

// API Functions
export const doctorsApi = {
    // Get my profile
    getMyProfile: async (): Promise<DoctorProfile> => {
        const response = await apiClient.get<DoctorProfile>('/doctors/me');
        return response.data;
    },

    // Update my profile
    updateMyProfile: async (data: DoctorUpdateRequest): Promise<DoctorProfile> => {
        const response = await apiClient.put<DoctorProfile>('/doctors/me', data);
        return response.data;
    },

    // Configure consultation types
    configureConsultationTypes: async (data: ConsultationTypeConfig): Promise<DoctorProfile> => {
        const response = await apiClient.put<DoctorProfile>(
            '/doctors/me/consultation-types',
            data
        );
        return response.data;
    },
};