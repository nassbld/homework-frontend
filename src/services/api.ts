// src/services/api.ts
import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ✅ Intercepteur REQUEST : Ajouter le token JWT
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ✅ Intercepteur RESPONSE : Gérer l'expiration du JWT
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // ⚠️ NE PAS rediriger si c'est une erreur sur /auth/login ou /auth/register
        const isAuthEndpoint = error.config?.url?.includes('/auth/login') ||
            error.config?.url?.includes('/auth/register');

        if ((error.response?.status === 401 || error.response?.status === 403) && !isAuthEndpoint) {
            console.warn('🔒 Session expirée, redirection vers login...');
            localStorage.removeItem('token');
            window.location.href = '/login?expired=true';
        }

        return Promise.reject(error);
    }
);

export default apiClient;
