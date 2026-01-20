import axios, { AxiosError } from "axios";

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_REST_API_URL,
    withCredentials: true,
});

apiClient.interceptors.request.use(
    (config) => {
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
            
            if (!isAuthPage && !isAuthCheckEndpoint) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);