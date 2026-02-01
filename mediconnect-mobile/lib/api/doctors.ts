import { apiClient } from './client';

// ========== Types ==========

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

export interface DoctorPublicProfile {
    id: string;
    first_name: string;
    last_name: string;
    specialty: string;
    years_experience: number;
    bio?: string;
    avatar_url?: string;
    cabinet_city?: string;
    cabinet_country?: string;
    latitude?: number;
    longitude?: number;
    consultation_fee_presentiel: number;
    consultation_fee_online: number;
    currency: string;
    offers_presentiel: boolean;
    offers_online: boolean;
    average_rating: number;
    total_consultations: number;
    is_accepting_patients: boolean;
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

export interface DoctorSearchParams {
    specialty?: string;
    city?: string;
    doctor_name?: string;
    consultation_type?: 'presentiel' | 'online';
    max_fee?: number;
    min_rating?: number;
    sort_by?: 'rating' | 'price_asc' | 'price_desc' | 'experience';
    accepting_patients?: boolean;
    limit?: number;
    offset?: number;
}

// ========== API Functions ==========

export const doctorsApi = {
    // Get my profile (for doctors)
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

    // Search doctors with filters
    searchDoctors: async (params: DoctorSearchParams = {}): Promise<DoctorPublicProfile[]> => {
        const response = await apiClient.get<DoctorPublicProfile[]>('/doctors/search', {
            params: {
                specialty: params.specialty,
                city: params.city,
                doctor_name: params.doctor_name,
                consultation_type: params.consultation_type,
                max_fee: params.max_fee,
                min_rating: params.min_rating,
                sort_by: params.sort_by,
                accepting_patients: params.accepting_patients ?? true,
                limit: params.limit ?? 20,
                offset: params.offset ?? 0
            }
        });
        return response.data;
    },

    // List all doctors (for map)
    listDoctors: async (limit: number = 100): Promise<DoctorPublicProfile[]> => {
        const response = await apiClient.get<DoctorPublicProfile[]>('/doctors/list', {
            params: { limit }
        });
        return response.data;
    },

    // Get doctor by ID
    getDoctorById: async (doctorId: string): Promise<DoctorPublicProfile> => {
        const response = await apiClient.get<DoctorPublicProfile>(`/doctors/${doctorId}`);
        return response.data;
    }
};