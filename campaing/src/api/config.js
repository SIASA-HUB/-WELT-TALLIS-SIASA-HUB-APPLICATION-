/**
 * Gateway (port 8009) handles routing to all microservices.
 */

// Detect environment
const isProduction = process.env.NODE_ENV === 'production';
// For development, use localhost
const BASE_URL = isProduction 
  ? '/api/v1'  // Relative path in production
  : "http://localhost:8009/api/v1";

const IMAGE_BASE_URL = isProduction
  ? ''  
  : "http://localhost:8009";

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
