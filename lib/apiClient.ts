import axios, { AxiosError } from "axios";

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_REST_API_URL,
    withCredentials: true,
});

apiClient.interceptors.request.use(
    (config) => {
        // Add Bearer token to Authorization header from sessionStorage
        if (typeof window !== "undefined") {
            const token = sessionStorage.getItem("auth_token");
            if (token) {
                if (!config.headers) {
                    config.headers = {} as any;
                }
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            const isAuthPage = typeof window !== "undefined" && 
                (window.location.pathname.startsWith("/login") || 
                 window.location.pathname.startsWith("/register") ||
                 window.location.pathname.startsWith("/forgot-password") ||
                 window.location.pathname.startsWith("/resend-verification"));
            
            const isAuthCheckEndpoint = error.config?.url?.includes("/auth/users/me");
            // Don't redirect for admin API endpoints - let the component handle the error
            const isAdminApiEndpoint = error.config?.url?.includes("/api/admin");
            // Don't redirect for logout endpoint - let the logout handler manage navigation
            const isLogoutEndpoint = error.config?.url?.includes("/auth/users/logout");
            
            if (!isAuthPage && !isAuthCheckEndpoint && !isAdminApiEndpoint && !isLogoutEndpoint) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);