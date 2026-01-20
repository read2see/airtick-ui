/**
 * Get the full URL for a profile image
 * @param imagePath - The image path from the API (filename or relative path)
 * @returns The full URL to the image, or null if no image path is provided
 */
export function getImagePath(imagePath: string | null | undefined): string | null {
  if (!imagePath) {
    return null;
  }

  // If it's already a data URL (for previews), return as is
  if (imagePath.startsWith("data:")) {
    return imagePath;
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Construct the full URL using the API base URL
  const apiUrl = process.env.NEXT_PUBLIC_REST_API_URL;
  if (apiUrl) {
    // Remove trailing slash from API URL if present
    const baseUrl = apiUrl.replace(/\/$/, "");
    // Normalize path: remove leading slash if present, then add it
    const normalizedPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
    return `${baseUrl}/api/images/${normalizedPath}`;
  }

  // Fallback to relative path
  const normalizedPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  return `/api/images/${normalizedPath}`;
}
