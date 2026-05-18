// src/utils/imageUtils.js

import API from '../api/config';

/**
 * Clean video URL - remove /api/videos/stream/ and fix encoding
 * This restores the original working URL format: /uploads/endorsements/...mp4
 */
const cleanVideoUrl = (url) => {
  if (!url) return url;

  let cleaned = url;

  // Remove ALL /api/videos/stream/ occurrences
  while (cleaned.includes('/api/videos/stream/')) {
    cleaned = cleaned.replace('/api/videos/stream/', '');
  }

  // Remove any remaining /api/ prefixes
  while (cleaned.includes('/api/')) {
    cleaned = cleaned.replace('/api/', '/');
  }

  // Decode URL encoding (%2F -> /, %2f -> /)
  try {
    cleaned = decodeURIComponent(cleaned);
  } catch (e) { }

  // Remove query parameters
  cleaned = cleaned.split('?')[0];

  // Ensure it starts with /uploads/
  if (cleaned.includes('/uploads/')) {
    const uploadsIndex = cleaned.indexOf('/uploads/');
    cleaned = cleaned.substring(uploadsIndex);
  }

  return cleaned;
};

/**
 * Build image URL - works for both images and videos
 * Now returns direct /uploads/ paths like before
 */
export const buildImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl === "null" || imageUrl === "" || imageUrl === undefined) return null;

  let processedUrl = imageUrl;

  // Clean the URL first - remove streaming nonsense
  processedUrl = cleanVideoUrl(processedUrl);

  // Fix localhost URLs
  if (typeof processedUrl === 'string' && processedUrl.includes('localhost:8006')) {
    processedUrl = processedUrl.replace(/http:\/\/localhost:8006/g, 'https://siasahub.co.ke');
  } else if (typeof processedUrl === 'string' && processedUrl.includes('localhost:5000')) {
    processedUrl = processedUrl.replace(/http:\/\/localhost:5000/g, 'https://siasahub.co.ke');
  }

  // If it's already a full URL, return it
  if (processedUrl.startsWith("http://") || processedUrl.startsWith("https://") || processedUrl.startsWith("data:")) {
    return processedUrl;
  }

  // Get base URL
  let baseUrl = API.IMAGES || API.UPLOAD_BASE;
  if (!baseUrl && typeof window !== "undefined") {
    baseUrl = window.location.origin;
  }
  if (!baseUrl) return null;

  baseUrl = baseUrl.replace(/\/$/, "").replace(/\/api\/v1\/?$/, "");

  // Ensure path starts with /
  const imagePath = processedUrl.startsWith("/") ? processedUrl : `/${processedUrl}`;

  return `${baseUrl}${imagePath}`;
};

// buildVideoUrl - same as buildImageUrl
export const buildVideoUrl = (videoUrl) => {
  return buildImageUrl(videoUrl);
};

export const getAvatarFallback = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=dc2626&color=fff&size=200&bold=true`;
};

export const getVideoThumbnail = (videoUrl, thumbnailUrl = null) => {
  if (thumbnailUrl) {
    return buildImageUrl(thumbnailUrl);
  }
  return null;
};

export const isImageUrl = (url) => {
  if (!url) return false;
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  const extension = url.split('.').pop()?.toLowerCase();
  return imageExtensions.includes(extension);
};

export const isVideoUrl = (url) => {
  if (!url) return false;
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv'];
  const extension = url.split('.').pop()?.toLowerCase();
  return videoExtensions.includes(extension);
};

export const getFileExtension = (url) => {
  if (!url) return '';
  const match = url.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : '';
};

export const getOptimizedImageUrl = (imageUrl, width = null, height = null) => {
  const url = buildImageUrl(imageUrl);
  if (!url) return null;
  if (!width && !height) return url;
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