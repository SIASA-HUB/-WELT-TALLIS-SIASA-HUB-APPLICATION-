/**
 * Gateway (port 8009) handles routing to all microservices.
 */

// Detect environment
const isProduction = import.meta.env.PROD;

// For development/production, use environment variables if provided
const BASE_URL = import.meta.env.VITE_API_URL || (isProduction ? '/api/v1' : 'http://localhost:8009/api/v1');

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || (isProduction ? '' : 'http://localhost:8009');

const API = {
  // Base endpoints
  BASE: BASE_URL,
  UPLOAD_BASE: IMAGE_BASE_URL,

  USERS: `${BASE_URL}/users`,
  LEADERS: `${BASE_URL}/leaders`,
  MANIFESTOS: `${BASE_URL}/leaders`,
  ENDORSEMENTS: `${BASE_URL}/endorsements`,
  STORIES: `${BASE_URL}/endorsements`,
  RALLIES: `${BASE_URL}/rallies`,
  MARKETPLACE: `${BASE_URL}/marketplace`,
  PRODUCTS: `${BASE_URL}/products`,
  ORDERS: `${BASE_URL}/orders`,
  CART: `${BASE_URL}/cart`,
  WALLET: `${BASE_URL}/wallet`,
  REACTIONS: `${BASE_URL}/reactions`,

  IMAGES: IMAGE_BASE_URL,
};

export default API;
