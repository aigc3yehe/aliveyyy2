
import { api } from './api';

export interface CreateNonceDto {
    address: string;
}

export interface LoginDto {
    address: string;
    nonce: string;
    signature: string;
}

export interface AuthNonceResponse {
    nonce: string;
    message: string;
}

export interface AuthLoginResponse {
    accessToken: string;
    expiresIn: number;
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

export const authService = {
    createNonce: async (address: string): Promise<AuthNonceResponse> => {
        const response = await api.post<ApiResponse<AuthNonceResponse>>('/auth/nonce', { address });
        return response.data.data;
    },

    login: async (address: string, nonce: string, signature: string): Promise<AuthLoginResponse> => {
        const response = await api.post<ApiResponse<AuthLoginResponse>>('/auth/login', {
            address,
            nonce,
            signature,
        });
        return response.data.data;
    },
};
