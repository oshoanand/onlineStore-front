/**
 * Converts a stored database image path into a fully qualified, accessible URL.
 * Handles full URLs, temporary blobs, relative paths, and safe fallbacks.
 */
export function getImageUrl(path?: string | null): string {
  // 1. Safe Fallback: If no image is provided, return a default placeholder
  if (!path) {
    return "/images/no-image.png"; // Make sure to place a default placeholder in your /public folder
  }

  // 2. Full URLs & Blobs: If it's already a valid HTTP link or a local preview blob, return as-is
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:") ||
    path.startsWith("data:image") // For base64 encoded images
  ) {
    return path;
  }

  // 3. Relative Paths: Prepend your Storage/CDN/API base URL
  // Ideally, define NEXT_PUBLIC_IMAGE_HOST in your .env.local file
  // Example: NEXT_PUBLIC_IMAGE_HOST="https://cdn.maachhexpress.com" or "http://localhost:5000/uploads"
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

  // Sanitize slashes to prevent double slashes (e.g., domain.com//path)
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${cleanBaseUrl}${cleanPath}`;
}
