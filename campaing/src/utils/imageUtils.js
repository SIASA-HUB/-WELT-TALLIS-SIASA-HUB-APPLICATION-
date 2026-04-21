import API from '../api/config';

/**
 * Utility to build full image URLs from relative paths.
 * Handles production vs development environments and various path formats.
 * 
 * @param {string} imageUrl - The relative or absolute image URL
 * @returns {string|null} - The formatted full URL or null if invalid
 */
export const buildImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl === "null" || imageUrl === "" || imageUrl === undefined) return null;
  
  // If it's already a full URL (http, https) or a data URI
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  // Get base URL from config
  let baseUrl = API.IMAGES || API.UPLOAD_BASE;
  
  // If no base URL is defined in config, fall back to current window origin
  if (!baseUrl && typeof window !== "undefined") {
    baseUrl = window.location.origin;
  }
  
  if (!baseUrl) return null;

  // Clean up the base URL
  // Strip trailing slashes and /api/v1 if accidentally included
  baseUrl = baseUrl.replace(/\/$/, "");
  if (baseUrl.endsWith("/api/v1")) {
    baseUrl = baseUrl.substring(0, baseUrl.length - 7);
  }
  
  // Clean up the image path (ensure it starts with a single slash)
  const imagePath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  
  return `${baseUrl}${imagePath}`;
};

/**
 * Utility to get a consistent avatar fallback
 * 
 * @param {string} name - Name to generate initials for
 * @returns {string} - UI Avatars URL
 */
export const getAvatarFallback = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=dc2626&color=fff&size=200&bold=true`;
};
