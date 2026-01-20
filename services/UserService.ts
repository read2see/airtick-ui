import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/apiRoutes";
import { AuthenticatedUserResponse } from "@/types/auth";

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  profile_img?: string;
}

export const UserService = {
  /**
   * Get user profile
   * GET /auth/users/me
   */
  async getProfile(): Promise<AuthenticatedUserResponse> {
    const { data } = await apiClient.get(API_ROUTES.auth.me);
    return data;
  },

  /**
   * Update user profile
   * PUT /api/users/me/profile
   */
  async updateProfile(payload: UpdateProfileRequest): Promise<AuthenticatedUserResponse> {
    const { data } = await apiClient.put(API_ROUTES.users.updateProfile, payload);
    return data;
  },

  /**
   * Update user profile with image upload
   * PUT /api/users/me/profile/upload
   */
  async updateProfileWithImage(
    payload: UpdateProfileRequest,
    file?: File
  ): Promise<AuthenticatedUserResponse> {
    const formData = new FormData();
    
    if (payload.first_name) {
      formData.append("first_name", payload.first_name);
    }
    if (payload.last_name) {
      formData.append("last_name", payload.last_name);
    }
    if (payload.profile_img) {
      formData.append("profile_img", payload.profile_img);
    }
    if (file) {
      formData.append("file", file);
    }

    const { data } = await apiClient.put(API_ROUTES.users.uploadProfileImage, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
};
