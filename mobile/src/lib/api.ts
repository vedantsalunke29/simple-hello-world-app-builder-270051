import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// Create axios instance
export const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:9000',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor (for future auth if needed, keeps format standard)
api.interceptors.request.use(
    async config => {
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch {
            // SecureStore is not initialized or failed, proceed without token
        }
        return config;
    },
    error => Promise.reject(error)
);
