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

/**
 * Check if URL is a video file
 */
const isVideoFile = (url) => {
  if (!url) return false;
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
  const extension = url.split('.').pop()?.toLowerCase();
  return videoExtensions.includes(extension);
};

/**
 * Build URL for images and videos
 * Videos use streaming endpoint for instant playback
 */
export const buildImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl === "null" || imageUrl === "" || imageUrl === undefined) return null;

  // First, clean the URL
  let processedUrl = fixUrl(imageUrl);

  if (!processedUrl) return null;

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
  let baseUrl = 'https://siasahub.co.ke';

  // Ensure path starts with /
  const imagePath = processedUrl.startsWith("/") ? processedUrl : `/${processedUrl}`;

  return `${baseUrl}${imagePath}`;
};

/**
 * Build video URL with streaming support for instant playback
 * Uses the streaming endpoint which supports range requests
 */
export const buildVideoUrl = (videoUrl) => {
  if (!videoUrl || videoUrl === "null" || videoUrl === "" || videoUrl === undefined) return null;

  // First, clean the URL
  let processedUrl = fixUrl(videoUrl);

  if (!processedUrl) return null;

  // Fix localhost URLs
  if (typeof processedUrl === 'string' && processedUrl.includes('localhost:8006')) {
    processedUrl = processedUrl.replace(/http:\/\/localhost:8006/g, 'https://siasahub.co.ke');
  } else if (typeof processedUrl === 'string' && processedUrl.includes('localhost:5000')) {
    processedUrl = processedUrl.replace(/http:\/\/localhost:5000/g, 'https://siasahub.co.ke');
  }

  // If it's already a full URL and doesn't need streaming
  if (processedUrl.startsWith("data:")) {
    return processedUrl;
  }

  // If it's already a streaming URL, return as is
  if (processedUrl.includes('/api/videos/stream/')) {
    return processedUrl;
  }

  // Extract just the path for streaming
  let pathForStreaming = processedUrl;

  // Remove domain if present
  if (pathForStreaming.startsWith("http://") || pathForStreaming.startsWith("https://")) {
    const urlObj = new URL(pathForStreaming);
    pathForStreaming = urlObj.pathname;
  }

  // Ensure path starts with /
  const videoPath = pathForStreaming.startsWith("/") ? pathForStreaming : `/${pathForStreaming}`;

  // Return streaming URL for instant playback
  return `https://siasahub.co.ke/api/videos/stream${videoPath}`;
};

/**
 * Get avatar fallback URL
 */
export const getAvatarFallback = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=dc2626&color=fff&size=200&bold=true`;
};

/**
 * Get video thumbnail/poster URL
 */
export const getVideoThumbnail = (videoUrl, thumbnailUrl = null) => {
  if (thumbnailUrl) return buildImageUrl(thumbnailUrl);
  return null;
};

/**
 * Check if URL is an image
 */
export const isImageUrl = (url) => {
  if (!url) return false;
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const extension = url.split('.').pop()?.toLowerCase();
  return imageExtensions.includes(extension);
};

/**
 * Check if URL is a video
 */
export const isVideoUrl = (url) => {
  if (!url) return false;
  return isVideoFile(url) || url.includes('/api/videos/stream/');
};

/**
 * Get file extension from URL
 */
export const getFileExtension = (url) => {
  if (!url) return '';
  const match = url.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : '';
};

/**
 * Get optimized image URL with dimensions
 */
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

/**
 * Get media URL (auto-detects image vs video)
 */
export const getMediaUrl = (item) => {
  if (!item) return null;

  const url = item.image_url || item.video_url;
  if (!url) return null;

  if (isVideoFile(url) || item.media_type === 'video') {
    return buildVideoUrl(url);
  }

  return buildImageUrl(url);
};

export default {
  buildImageUrl,
  buildVideoUrl,
  getAvatarFallback,
  getVideoThumbnail,
  isImageUrl,
  isVideoUrl,
  getFileExtension,
  getOptimizedImageUrl,
  getMediaUrl,
};