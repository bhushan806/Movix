import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 15000, // 15s request timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor to attach JWT token
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Centralized response error interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401: redirect to login
        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/auth/login';
            }
        }

        // Handle 429: rate limit
        if (error.response && error.response.status === 429) {
            const message = error.response.data?.message || 'Too many requests. Please wait.';
            console.warn('[API] Rate limited:', message);
        }

        // Handle timeout
        if (error.code === 'ECONNABORTED') {
            console.error('[API] Request timed out');
        }

        // Handle network errors
        if (!error.response) {
            console.error('[API] Network error — server may be down');
        }

        return Promise.reject(error);
    }
);

export default api;
