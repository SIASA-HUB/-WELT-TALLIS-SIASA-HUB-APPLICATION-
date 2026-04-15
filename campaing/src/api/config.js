
const getBaseUrl = () => {
 
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || '/api/v1';
  }
  // Development -localhost
  return "http://localhost:8009/api/v1";
};

const getImageBaseUrl = () => {

  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_IMAGE_URL || '';
  }
  // Development  localhost
  return "http://localhost:8009";
};

const BASE_URL = getBaseUrl();
const IMAGE_BASE_URL = getImageBaseUrl();

const API = {
  // Base endpoints
  BASE: BASE_URL,
  UPLOAD_BASE: IMAGE_BASE_URL,
  IMAGES: IMAGE_BASE_URL,

  // API endpoints
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
};

export default API;
