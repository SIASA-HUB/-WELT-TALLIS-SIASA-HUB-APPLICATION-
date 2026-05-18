// src/utils/imageUtils.js

import API from '../api/config';

/**
 * Clean corrupted video URLs - removes /api/videos/stream/ garbage
 */
const fixVideoUrl = (url) => {
  if (!url) return url;

  let cleanUrl = url;

  // Remove all /api/videos/stream/ occurrences
  while (cleanUrl.includes('/api/videos/stream/')) {
    cleanUrl = cleanUrl.replace('/api/videos/stream/', '');
  }

  // Remove all /api/v1/ occurrences
  while (cleanUrl.includes('/api/v1/')) {
    cleanUrl = cleanUrl.replace('/api/v1/', '');
  }

  // Decode URI encoding
  try {
    cleanUrl = decodeURIComponent(cleanUrl);
  } catch (e) { }

  // Remove query parameters
  cleanUrl = cleanUrl.split('?')[0];

  // Ensure it starts with /uploads/
  if (cleanUrl.includes('/uploads/')) {
    const uploadsIndex = cleanUrl.indexOf('/uploads/');
    cleanUrl = cleanUrl.substring(uploadsIndex);
  } else if (!cleanUrl.startsWith('/uploads/') && !cleanUrl.startsWith('uploads/')) {
    // Add /uploads/ if missing
    cleanUrl = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
  } else {
    cleanUrl = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
  }

  return cleanUrl;
};

export const buildImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl === "null" || imageUrl === "" || imageUrl === undefined) return null;

  let processedUrl = imageUrl;

  // Fix for production: replace localhost with production domain
  if (typeof processedUrl === 'string' && processedUrl.includes('localhost:8006')) {
    processedUrl = processedUrl.replace(/http:\/\/localhost:8006/g, 'https://siasahub.co.ke');
  } else if (typeof processedUrl === 'string' && processedUrl.includes('localhost:5000')) {
    processedUrl = processedUrl.replace(/http:\/\/localhost:5000/g, 'https://siasahub.co.ke');
  }

  // If it's already an absolute URL, return as is (but still clean it if it's a video)
  if (processedUrl.startsWith("http://") || processedUrl.startsWith("https://") || processedUrl.startsWith("data:")) {
    // Check if this is a corrupted video URL
    if (processedUrl.includes('/api/videos/stream/') || processedUrl.includes('%2Fapi%2Fvideos%2Fstream%2F')) {
      const cleaned = fixVideoUrl(processedUrl);
      let baseUrl = API.IMAGES || API.UPLOAD_BASE;
      if (!baseUrl && typeof window !== "undefined") {
        baseUrl = window.location.origin;
      }
      if (baseUrl) {
        baseUrl = baseUrl.replace(/\/$/, "").replace(/\/api\/v1\/?$/, "");
        return `${baseUrl}${cleaned}`;
      }
    }
    return processedUrl;
  }

  // Clean the URL first
  processedUrl = fixVideoUrl(processedUrl);

  let baseUrl = API.IMAGES || API.UPLOAD_BASE;
  if (!baseUrl && typeof window !== "undefined") {
    baseUrl = window.location.origin;
  }
  if (!baseUrl) return null;

  baseUrl = baseUrl.replace(/\/$/, "").replace(/\/api\/v1\/?$/, "");
  const imagePath = processedUrl.startsWith("/") ? processedUrl : `/${processedUrl}`;

  return `${baseUrl}${imagePath}`;
};

// buildVideoUrl - just uses the same function
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