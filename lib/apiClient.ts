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
            // Exclude endpoints where components handle errors instead of redirecting
            const isAdminApiEndpoint = error.config?.url?.includes("/api/admin");
            const isLogoutEndpoint = error.config?.url?.includes("/auth/users/logout");
            const isFlightsEndpoint = error.config?.url?.includes("/flights");
            const isBookingsEndpoint = error.config?.url?.includes("/bookings");
            const isUsersEndpoint = error.config?.url?.includes("/auth/users/") && 
              (error.config?.url?.includes("/auth/users/search") || 
               error.config?.url?.match(/\/auth\/users\/\d+$/));
            const isAirportsEndpoint = error.config?.url?.includes("/api/airports");
            
            if (!isAuthPage && !isAuthCheckEndpoint && !isAdminApiEndpoint && !isLogoutEndpoint && !isFlightsEndpoint && !isBookingsEndpoint && !isUsersEndpoint && !isAirportsEndpoint) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);