export const API_ROUTES = {
  auth: {
    login: "/auth/users/login",
    register: "/auth/users/register",
    me: "/auth/users/me",
    logout: "/auth/users/logout",
    resendVerification: "/auth/users/resend-verification",
    forgotPassword: "/auth/users/forgot-password",
    resetPasswordByToken: "/auth/users/reset-password/token",
    changePassword: "/auth/users/change-password",

    reactivateUser: (userId: number | string) =>
      `/auth/users/${userId}/reactivate`,

    deleteUser: (userId: number | string) =>
      `/auth/users/${userId}`,
  },

  users: {
    updateProfile: "/api/users/me/profile",
    uploadProfileImage: "/api/users/me/profile/upload",
  },

  airports: {
    base: "/api/airports",

    byId: (airportId: number | string) =>
      `/api/airports/${airportId}`,

    flights: (airportId: number | string) =>
      `/api/airports/${airportId}/flights`,

    departures: (airportId: number | string) =>
      `/api/airports/${airportId}/departures`,

    arrivals: (airportId: number | string) =>
      `/api/airports/${airportId}/arrivals`,

    createFlightByOrigin: (originAirportId: number | string) =>
      `/api/airports/${originAirportId}/flights`,

    flightByAirport: (
      airportId: number | string,
      flightId: number | string
    ) =>
      `/api/airports/${airportId}/flights/${flightId}`,
  },

  flights: {
    base: "/api/flights",

    byId: (flightId: number | string) =>
      `/api/flights/${flightId}`,
  },

  bookings: {
    base: "/api/bookings",

    byId: (bookingId: number | string) =>
      `/api/bookings/${bookingId}`,

    verifyOtp: (bookingId: number | string) =>
      `/api/bookings/booking/${bookingId}/verify`,
  },

  payments: {
    pay: "/payment",
  },

  images: {
    upload: "/api/images/upload",

    all: "/api/images/all",

    byId: (id: number | string) =>
      `/api/images/${id}`,

    info: (fileName: string) =>
      `/api/images/${fileName}`,

    download: (fileName: string) =>
      `/api/images/download/${fileName}`,
  },

  test: {
    whatsapp: "/api/test/whatsapp",
    config: "/api/test/config",
  },

  admin: {
    stats: "/api/admin/stats",
  },
} as const;