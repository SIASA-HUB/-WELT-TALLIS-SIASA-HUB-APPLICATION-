/**
 * Gateway (port 8009) handles routing to all microservices.
 */

// Determine base URL based on environment
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return '/api/v1';
  }
  
  // Development
  return "http://localhost:8009/api/v1";
};

const getImageBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  return "http://localhost:8009";
};

const BASE_URL = getBaseUrl();
const IMAGE_BASE_URL = getImageBaseUrl();

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
