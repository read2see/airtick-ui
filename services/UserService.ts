import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/apiRoutes";
import { AuthenticatedUserResponse } from "@/types/auth";
import { UserResponse } from "@/types/user";
import { PaginatedResponse } from "@/types/pagination";
import { PaginationParams } from "@/types/PaginationParams";

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  profile_img?: string;
}

export interface UserSearchParams extends PaginationParams {
  id?: number;
  email?: string;
  search?: string;
  active?: boolean;
  emailVerified?: boolean;
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
   * Get paginated list of users
   * GET /auth/users/search
   */
  async getUsers(
    params?: UserSearchParams
  ): Promise<PaginatedResponse<UserResponse>> {
    const response = await apiClient.get(API_ROUTES.users.search, {
      params,
    });
    const data = response.data;

    if (data && typeof data === "object" && !Array.isArray(data)) {
      if (data.data && Array.isArray(data.data)) {
        return data;
      }
      if (data.data && typeof data.data === "object" && !Array.isArray(data.data)) {
        const usersArray = Object.values(data.data).filter(
          (item): item is UserResponse => typeof item === "object" && item !== null && "id" in item
        ) as UserResponse[];
        return {
          data: usersArray,
          meta: data.meta || {
            currentPage: 0,
            perPage: 10,
            total: usersArray.length,
            totalPages: 1,
            nextPage: null,
            prevPage: null,
          },
        };
      }
      const usersArray = Object.values(data).filter(
        (item): item is UserResponse => typeof item === "object" && item !== null && "id" in item
      ) as UserResponse[];
      return {
        data: usersArray,
        meta: data.meta || {
          currentPage: 0,
          perPage: 10,
          total: usersArray.length,
          totalPages: 1,
          nextPage: null,
          prevPage: null,
        },
      };
    }

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
      formData.append("firstName", payload.first_name);
    }
    if (payload.last_name) {
      formData.append("lastName", payload.last_name);
    }
    if (payload.profile_img) {
      formData.append("profileImg", payload.profile_img);
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

  /**
   * Reactivate user
   * PATCH /auth/users/:userId/reactivate
   */
  async reactivateUser(userId: number | string): Promise<void> {
    await apiClient.patch(API_ROUTES.users.reactivate(userId));
  },

  /**
   * Delete user (soft delete)
   * DELETE /auth/users/:userId
   */
  async deleteUser(userId: number | string): Promise<void> {
    await apiClient.delete(API_ROUTES.users.byId(userId));
  },
};
