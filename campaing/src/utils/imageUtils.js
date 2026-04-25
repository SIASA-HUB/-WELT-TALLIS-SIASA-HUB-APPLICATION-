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

  let processedUrl = imageUrl;
  
  // Fix for production: replace localhost with production domain if detected
  if (typeof processedUrl === 'string' && processedUrl.includes('localhost:8006')) {
    processedUrl = processedUrl.replace(/http:\/\/localhost:8006/g, 'https://siasahub.co.ke');
  } else if (typeof processedUrl === 'string' && processedUrl.includes('localhost:5000')) {
    processedUrl = processedUrl.replace(/http:\/\/localhost:5000/g, 'https://siasahub.co.ke');
  }

  if (processedUrl.startsWith("http://") || processedUrl.startsWith("https://") || processedUrl.startsWith("data:")) {
    return processedUrl;
  }

  let baseUrl = API.IMAGES || API.UPLOAD_BASE;
  if (!baseUrl && typeof window !== "undefined") {
    baseUrl = window.location.origin; // fallback: same domain
  }
  if (!baseUrl) return null;

  baseUrl = baseUrl.replace(/\/$/, "").replace(/\/api\/v1\/?$/, "");
  const imagePath = processedUrl.startsWith("/") ? processedUrl : `/${processedUrl}`;

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
