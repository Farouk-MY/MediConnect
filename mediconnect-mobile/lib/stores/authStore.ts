import { create } from 'zustand';
import { secureStorage } from '../utils/storage';

interface User {
    id: string;
    email: string;
    role: 'patient' | 'doctor';
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
    clearAuth: () => Promise<void>;
    loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
    isAuthenticated: false,

    setAuth: async (user, accessToken, refreshToken) => {
        await secureStorage.setItem('accessToken', accessToken);
        await secureStorage.setItem('refreshToken', refreshToken);
        await secureStorage.setItem('user', JSON.stringify(user));

        set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
        });
    },

    clearAuth: async () => {
        await secureStorage.deleteItem('accessToken');
        await secureStorage.deleteItem('refreshToken');
        await secureStorage.deleteItem('user');

        set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
        });
    },

    loadAuth: async () => {
        try {
            const accessToken = await secureStorage.getItem('accessToken');
            const refreshToken = await secureStorage.getItem('refreshToken');
            const userStr = await secureStorage.getItem('user');

            if (accessToken && refreshToken && userStr) {
                const user = JSON.parse(userStr);
                set({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            console.error('Error loading auth:', error);
            set({ isLoading: false });
        }
    },
}));