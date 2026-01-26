import { apiClient } from './client';

export interface RegisterData {
    email: string;
    password: string;
    role: 'patient' | 'doctor';
    first_name: string;
    last_name: string;
    specialty?: string;
    license_number?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface UserResponse {
    id: string;
    email: string;
    role: 'patient' | 'doctor';
}

export const authApi = {
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    login: async (data: LoginData): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    // FIXED: Accept token as parameter
    getCurrentUser: async (token: string): Promise<UserResponse> => {
        const response = await apiClient.get<UserResponse>('/auth/me', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
    },
};