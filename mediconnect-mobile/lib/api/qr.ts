import { apiClient } from './client';

export interface QRCodeResponse {
    qr_data: string;
    generated_at: string;
    patient_id: string;
}

export interface QRStatusResponse {
    has_qr_code: boolean;
    last_updated: string | null;
    needs_regeneration: boolean;
    recommendation: string;
}

export const qrApi = {
    // Generate QR code for current patient
    generateMyQR: async (): Promise<QRCodeResponse> => {
        const response = await apiClient.get<QRCodeResponse>('/qr/generate');
        return response.data;
    },

    // Get QR code status
    getMyQRStatus: async (): Promise<QRStatusResponse> => {
        const response = await apiClient.get<QRStatusResponse>('/qr/my-qr-status');
        return response.data;
    },
};