import api from "../../../../api/api";
import CONFIG from "../../../../api/config";

// Use the global api instance and point to the marketplace prefix in the gateway
// Note: api instance already has baseURL set to GATEWAY/api/v1
const API = api;

//  interceptor to map backend data to frontend expected format
API.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success) {
      const transformProduct = (product) => {
        if (!product) return product;
        
   
        const parsePrice = (priceVal) => {
          if (typeof priceVal === "number") return priceVal;
          if (typeof priceVal === "string") {
            const cleaned = priceVal.replace(/[^0-9.]/g, "");
            return parseFloat(cleaned) || 0;
          }
          return 0;
        };

        const orgPrice = parsePrice(product.price);
        const mrpPrice = parsePrice(product.mrp) || orgPrice;

        return {
          ...product,
          _id: product._id || product.id,
          title: product.title || product.name || "Product",
          img: product.img || product.image || product.image_url,
          rating: Number(product.rating) || 4.5,
          sizes: typeof product.sizes === "string" ? product.sizes.split(",").map(s => s.trim()) : (Array.isArray(product.sizes) ? product.sizes : []),
          price: (product.price && typeof product.price === "object") ? product.price : {
            org: orgPrice,
            mrp: mrpPrice,
            off: mrpPrice > orgPrice ? Math.round(((mrpPrice - orgPrice) / mrpPrice) * 100) : 0
          }
        };
      };

      if (Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map(transformProduct);
      } else if (typeof response.data.data === "object") {
        response.data.data = transformProduct(response.data.data);
      }
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//Products
export const getAllProducts = async (filter) => {
  const url = `/products${filter ? `?${filter}` : ""}`;
  return await api.getWithCache(url, (data) => {
    // This allows components to potentially use the cached data immediately
    // however most components here use the returned promise.
  });
};

export const getProductDetails = async (id) => {
  const url = `/products/${id}`;
  return await api.getWithCache(url);
};

//Cart

export const getCart = async (token) =>
  await API.get("/user/cart", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addToCart = async (token, data) =>
  await API.post(`/user/cart/`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteFromCart = async (token, data) =>
  await API.patch(`/user/cart/`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

//Favourites

export const getFavourite = async (token) =>
  await API.get(`/user/favorite`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addToFavourite = async (token, data) =>
  await API.post(`/user/favorite/`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteFromFavourite = async (token, data) =>
  await API.patch(`/user/favorite/`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

//Orders

export const placeOrder = async (token, data) =>
  await API.post(`/user/order/`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getOrders = async (token) =>
  await API.get(`/user/order/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Admin Orders & Stats
export const getAdminOrders = async () => 
  await API.get(`/user/order/`);

export const getAdminStats = async () =>
  await API.get(`/user/order/stats`);

export const updateOrderStatus = async (id, status) =>
  await API.patch(`/user/order/${id}/status`, { status });
// Admin Products
export const adminCreateProduct = async (data) =>
  await API.post(`/products`, data);

export const adminUpdateProduct = async (id, data) =>
  await API.put(`/products/${id}`, data);

export const adminDeleteProduct = async (id) =>
  await API.delete(`/products/${id}`);

// Hot products for trending carousel
export const getHotProducts = async (limit = 10) => {
  const url = `/products/hot?limit=${limit}`;
  return await api.getWithCache(url);
};

// Direct order (single product, no cart required)
export const directOrder = async (token, data) =>
  await API.post(`/user/order/direct`, data, {
    headers: { Authorization: token ? `Bearer ${token}` : undefined },
  });
