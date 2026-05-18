// src/utils/imageUtils.js

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

  // If it's already an absolute URL, return as is
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
 * Utility to build full video URLs from relative paths.
 * EXACTLY the same logic as buildImageUrl - no streaming, just direct file access.
 * 
 * @param {string} videoUrl - The relative or absolute video URL
 * @returns {string|null} - The formatted full URL or null if invalid
 */
export const buildVideoUrl = (videoUrl) => {
  if (!videoUrl || videoUrl === "null" || videoUrl === "" || videoUrl === undefined) return null;

  let processedUrl = videoUrl;

  // Fix for production: replace localhost with production domain if detected
  if (typeof processedUrl === 'string' && processedUrl.includes('localhost:8006')) {
    processedUrl = processedUrl.replace(/http:\/\/localhost:8006/g, 'https://siasahub.co.ke');
  } else if (typeof processedUrl === 'string' && processedUrl.includes('localhost:5000')) {
    processedUrl = processedUrl.replace(/http:\/\/localhost:5000/g, 'https://siasahub.co.ke');
  }

  // If it's already an absolute URL, return as is
  if (processedUrl.startsWith("http://") || processedUrl.startsWith("https://") || processedUrl.startsWith("data:")) {
    return processedUrl;
  }

  let baseUrl = API.IMAGES || API.UPLOAD_BASE;
  if (!baseUrl && typeof window !== "undefined") {
    baseUrl = window.location.origin; // fallback: same domain
  }
  if (!baseUrl) return null;

  baseUrl = baseUrl.replace(/\/$/, "").replace(/\/api\/v1\/?$/, "");

  // Clean the path - remove any double slashes or encoding
  let cleanPath = processedUrl;
  // Remove any /api/videos/stream/ prefix if it exists (from old data)
  if (cleanPath.includes('/api/videos/stream/')) {
    cleanPath = cleanPath.split('/api/videos/stream/').pop();
  }
  // Remove any double encoding
  cleanPath = decodeURIComponent(cleanPath);

  const videoPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

  return `${baseUrl}${videoPath}`;
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

/**
 * Utility to get video thumbnail/poster URL
 * Can be used if you have separate thumbnail images for videos
 * 
 * @param {string} videoUrl - The video URL
 * @param {string} thumbnailUrl - Optional thumbnail URL
 * @returns {string|null} - The thumbnail URL or null
 */
export const getVideoThumbnail = (videoUrl, thumbnailUrl = null) => {
  if (thumbnailUrl) {
    return buildImageUrl(thumbnailUrl);
  }
  // If no thumbnail provided, return null (video will show play button)
  return null;
};

/**
 * Utility to check if a URL is an image
 * 
 * @param {string} url - The URL to check
 * @returns {boolean} - True if it's an image
 */
export const isImageUrl = (url) => {
  if (!url) return false;
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  const extension = url.split('.').pop()?.toLowerCase();
  return imageExtensions.includes(extension);
};

/**
 * Utility to check if a URL is a video
 * 
 * @param {string} url - The URL to check
 * @returns {boolean} - True if it's a video
 */
export const isVideoUrl = (url) => {
  if (!url) return false;
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv'];
  const extension = url.split('.').pop()?.toLowerCase();
  return videoExtensions.includes(extension);
};

/**
 * Utility to get file extension from URL
 * 
 * @param {string} url - The URL
 * @returns {string} - The file extension
 */
export const getFileExtension = (url) => {
  if (!url) return '';
  const match = url.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : '';
};

/**
 * Utility to get optimized image URL with dimensions
 * Useful for responsive images
 * 
 * @param {string} imageUrl - The image URL
 * @param {number} width - Desired width
 * @param {number} height - Desired height
 * @returns {string|null} - Optimized image URL
 */
export const getOptimizedImageUrl = (imageUrl, width = null, height = null) => {
  const url = buildImageUrl(imageUrl);
  if (!url) return null;

  // If no dimensions requested, return the original URL
  if (!width && !height) return url;

  // Add query parameters for optimization
  const params = new URLSearchParams();
  if (width) params.append('w', width);
  if (height) params.append('h', height);

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
};

export default {
  buildImageUrl,
  buildVideoUrl,
  getAvatarFallback,
  getVideoThumbnail,
  isImageUrl,
  isVideoUrl,
  getFileExtension,
  getOptimizedImageUrl
};