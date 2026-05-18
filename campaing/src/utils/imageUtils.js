// src/utils/imageUtils.js

import API from '../api/config';

/**
 * Clean and fix video URLs - removes /api/videos/stream/ and returns direct URL
 */
const fixUrl = (url) => {
  if (!url) return url;

  let cleaned = url;

  // Remove any /api/videos/stream/ prefix
  if (cleaned.includes('/api/videos/stream/')) {
    cleaned = cleaned.replace('/api/videos/stream/', '');
  }

  // Decode %2F to /
  if (cleaned.includes('%2F')) {
    try {
      cleaned = decodeURIComponent(cleaned);
    } catch (e) { }
  }

  // Extract the /uploads/ path
  if (cleaned.includes('/uploads/')) {
    const match = cleaned.match(/\/uploads\/[^\s?]+/);
    if (match) {
      cleaned = match[0];
    }
  } else if (cleaned.includes('uploads/')) {
    const match = cleaned.match(/uploads\/[^\s?]+/);
    if (match) {
      cleaned = '/' + match[0];
    }
  }

  // Remove query parameters
  cleaned = cleaned.split('?')[0];

  return cleaned;
};

export const buildImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl === "null" || imageUrl === "" || imageUrl === undefined) return null;

  // First, clean the URL
  let processedUrl = fixUrl(imageUrl);

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

  // Get base URL (your production domain)
  let baseUrl = 'https://siasahub.co.ke';

  // Ensure path starts with /
  const imagePath = processedUrl.startsWith("/") ? processedUrl : `/${processedUrl}`;

  return `${baseUrl}${imagePath}`;
};

export const buildVideoUrl = (videoUrl) => {
  return buildImageUrl(videoUrl);
};

export const getAvatarFallback = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=dc2626&color=fff&size=200&bold=true`;
};

export const getVideoThumbnail = (videoUrl, thumbnailUrl = null) => {
  if (thumbnailUrl) return buildImageUrl(thumbnailUrl);
  return null;
};

export const isImageUrl = (url) => {
  if (!url) return false;
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const extension = url.split('.').pop()?.toLowerCase();
  return imageExtensions.includes(extension);
};

export const isVideoUrl = (url) => {
  if (!url) return false;
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
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