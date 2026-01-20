import axios, { AxiosError } from "axios";

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_REST_API_URL,
    withCredentials: true,
});

// Request interceptor (if needed for auth tokens)
apiClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        // Handle 401/403 errors - redirect to login
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Only redirect if not already on auth pages
            if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);