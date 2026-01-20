import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/apiRoutes";

export interface ImageUploadResponse {
  url?: string;
  path?: string;
  fileName?: string;
  [key: string]: any;
}

export const ImageService = {
  /**
   * Upload image
   * POST /api/images/upload
   */
  async uploadImage(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post(API_ROUTES.images.upload, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
};
