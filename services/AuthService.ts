import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/apiRoutes";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  AuthenticatedUserResponse,
  EmailVerificationRequest,
  EmailPasswordResetRequest,
  PasswordResetTokenRequest,
  PasswordResetRequest,
} from "@/types/auth";

export const AuthService = {
  /**
   * Login user
   * POST /auth/users/login
   */
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post(
      API_ROUTES.auth.login,
      payload
    );
    return data;
  },

  /**
   * Register new user
   * POST /auth/users/register
   */
  async register(payload: RegisterRequest) {
    const { data } = await apiClient.post(
      API_ROUTES.auth.register,
      payload
    );
    return data;
  },

  /**
   * Get currently authenticated user
   * GET /auth/users/me
   */
  async me(): Promise<AuthenticatedUserResponse> {
    const { data } = await apiClient.get(
      API_ROUTES.auth.me
    );
    return data;
  },

  /**
   * Logout user
   * POST /auth/users/logout
   */
  async logout(): Promise<void> {
    await apiClient.post(API_ROUTES.auth.logout);
  },

  /**
   * Resend verification email
   * POST /auth/users/resend-verification
   */
  async resendVerification(
    payload: EmailVerificationRequest
  ) {
    const { data } = await apiClient.post(
      API_ROUTES.auth.resendVerification,
      payload
    );
    return data;
  },

  /**
   * Request password reset
   * POST /auth/users/forgot-password
   */
  async forgotPassword(
    payload: EmailPasswordResetRequest
  ) {
    const { data } = await apiClient.post(
      API_ROUTES.auth.forgotPassword,
      payload
    );
    return data;
  },

  /**
   * Reset password using token
   * POST /auth/users/reset-password/token
   */
  async resetPasswordByToken(
    payload: PasswordResetTokenRequest
  ) {
    const { data } = await apiClient.post(
      API_ROUTES.auth.resetPasswordByToken,
      payload
    );
    return data;
  },

  /**
   * Change password (authenticated)
   * PATCH /auth/users/change-password
   */
  async changePassword(
    payload: PasswordResetRequest
  ) {
    const { data } = await apiClient.patch(
      API_ROUTES.auth.changePassword,
      payload
    );
    return data;
  },

  /**
   * Reactivate user
   * PATCH /auth/users/{userId}/reactivate
   */
  async reactivateUser(userId: number | string) {
    const { data } = await apiClient.patch(
      API_ROUTES.auth.reactivateUser(userId)
    );
    return data;
  },

  /**
   * Soft delete user
   * DELETE /auth/users/{userId}
   */
  async deleteUser(userId: number | string) {
    const { data } = await apiClient.delete(
      API_ROUTES.auth.deleteUser(userId)
    );
    return data;
  },
};
