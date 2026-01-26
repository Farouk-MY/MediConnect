import { apiClient } from './client';

// Types
export interface EmergencyContact {
    id?: number;
    name: string;
    relationship: string;
    phone: string;
    email?: string;
}

export interface MedicalHistoryItem {
    condition: string;
    diagnosed_date?: string;
    notes?: string;
}

export interface AllergyItem {
    allergen: string;
    severity: 'mild' | 'moderate' | 'severe';
    reaction?: string;
}

export interface MedicationItem {
    name: string;
    dosage: string;
    frequency: string;
    prescribed_by?: string;
}

export interface PatientProfile {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'other';
    blood_type?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    postal_code?: string;
    bio?: string;
    avatar_url?: string;
    medical_history: MedicalHistoryItem[];
    allergies: AllergyItem[];
    current_medications: MedicationItem[];
    emergency_contacts: EmergencyContact[];
    created_at: string;
    updated_at: string;
}

export interface PatientUpdateRequest {
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'other';
    blood_type?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    postal_code?: string;
    bio?: string;
    avatar_url?: string;
    medical_history?: MedicalHistoryItem[];
    allergies?: AllergyItem[];
    current_medications?: MedicationItem[];
    emergency_contacts?: EmergencyContact[];
}

export interface AddEmergencyContactRequest {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
}

// API Functions
export const patientsApi = {
    // Get my profile
    getMyProfile: async (): Promise<PatientProfile> => {
        const response = await apiClient.get<PatientProfile>('/patients/me');
        return response.data;
    },

    // Update my profile
    updateMyProfile: async (data: PatientUpdateRequest): Promise<PatientProfile> => {
        const response = await apiClient.put<PatientProfile>('/patients/me', data);
        return response.data;
    },

    // Add emergency contact
    addEmergencyContact: async (contact: AddEmergencyContactRequest): Promise<PatientProfile> => {
        const response = await apiClient.post<PatientProfile>(
            '/patients/me/emergency-contacts',
            contact
        );
        return response.data;
    },

    // Update emergency contact
    updateEmergencyContact: async (
        index: number,
        contact: Partial<AddEmergencyContactRequest>
    ): Promise<PatientProfile> => {
        const response = await apiClient.put<PatientProfile>(
            `/patients/me/emergency-contacts/${index}`,
            contact
        );
        return response.data;
    },

    // Delete emergency contact
    deleteEmergencyContact: async (index: number): Promise<PatientProfile> => {
        const response = await apiClient.delete<PatientProfile>(
            `/patients/me/emergency-contacts/${index}`
        );
        return response.data;
    },
};