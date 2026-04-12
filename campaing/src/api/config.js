/**
 * Gateway (port 8009) handles routing to all microservices.
 */


const BASE_URL = "http://localhost:8009/api/v1";

const API = {
  // Base endpoints
  BASE:         BASE_URL,
  UPLOAD_BASE:  "http://localhost:8009", 

  
  USERS:        `${BASE_URL}/users`,
  LEADERS:      `${BASE_URL}/leaders`,
  MANIFESTOS:   `${BASE_URL}/leaders`, 
  ENDORSEMENTS: `${BASE_URL}/endorsements`,
  STORIES:      `${BASE_URL}/endorsements`,
  RALLIES:      `${BASE_URL}/rallies`,
  MARKETPLACE:  `${BASE_URL}/marketplace`,
  PRODUCTS:     `${BASE_URL}/products`,
  ORDERS:       `${BASE_URL}/orders`,
  CART:         `${BASE_URL}/cart`,
  WALLET:       `${BASE_URL}/wallet`,
  REACTIONS:    `${BASE_URL}/reactions`,

  
  IMAGES:       "http://localhost:8009", 
};

export default API;
