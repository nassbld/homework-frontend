// src/services/api.ts
import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
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
        const status = error.response?.status;
        const requestUrl = error.config?.url ?? '';
        const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

        // Only treat 401 (unauthorized) as an expired session. 403 can be a legit permission issue.
        if (status === 401 && !isAuthEndpoint) {
            console.warn('🔒 Session expirée, redirection vers login...');
            localStorage.removeItem('token');
            delete apiClient.defaults.headers.common['Authorization'];
            window.location.href = '/login?expired=true';
        }

        return Promise.reject(error);
    }
);

export default apiClient;
