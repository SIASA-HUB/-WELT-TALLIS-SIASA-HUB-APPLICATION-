// services/productService.js
import api from "../../../../api/api";

// ============================================
// HELPERS
// ============================================

const parsePrice = (val) => {
  if (typeof val === "number") return val;
  if (typeof val === "string") return parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
  return 0;
};

const normalizeProduct = (product) => {
  if (!product) return null;

  const orgPrice = parsePrice(product.price);
  const mrpPrice = parsePrice(product.mrp) || orgPrice;

  return {
    ...product,
    _id: product._id || product.id,
    title: product.title || product.name || "Product",
    name: product.name || product.title || "Product",
    img: product.img || product.image || product.image_url,
    slug: product.slug || null,
    rating: Number(product.rating) || 4.5,
    stock: Number(product.stock) || 0,
    category: product.category || "Uncategorized",
    sizes: typeof product.sizes === "string"
      ? product.sizes.split(",").map(s => s.trim()).filter(Boolean)
      : (Array.isArray(product.sizes) ? product.sizes : []),
    price: {
      org: orgPrice,
      mrp: mrpPrice,
      off: mrpPrice > orgPrice ? Math.round(((mrpPrice - orgPrice) / mrpPrice) * 100) : 0,
    },
  };
};

const extractData = (response) => {
  const raw = response?.data ?? response;
  
  if (raw && Array.isArray(raw.data)) {
    return {
      data: raw.data.map(normalizeProduct),
      pagination: raw.pagination || {}
    };
  }

  if (Array.isArray(raw)) {
    return raw.map(normalizeProduct);
  }

  if (raw && typeof raw === "object" && (raw.id || raw._id)) {
    return normalizeProduct(raw);
  }

  return raw;
};

// ============================================
// PRODUCTS
// ============================================

export const getAllProducts = async (filter = "") => {
  const url = filter ? `/products?${filter}` : "/products";
  const response = await api.getWithCache(url);
  return extractData(response);
};

export const getProductsByCategory = async (category, limit = 12) => {
  const response = await api.getWithCache(`/products?category=${category}&limit=${limit}&sort=price_desc`);
  return extractData(response);
};

export const getProductsBySegment = async (segment, limit = 12) => {
  const response = await api.getWithCache(`/products?segment=${segment}&limit=${limit}&sort=price_desc`);
  return extractData(response);
};

export const getProductsBySort = async (sort, limit = 12) => {
  const response = await api.getWithCache(`/products?sort=${sort}&limit=${limit}`);
  return extractData(response);
};

export const searchProducts = async (query, limit = 24) => {
  const response = await api.getWithCache(`/products?search=${encodeURIComponent(query)}&limit=${limit}`);
  return extractData(response);
};

export const getProductDetails = async (idOrSlug) => {
  const isSlug = idOrSlug && isNaN(idOrSlug);
  const url = isSlug ? `/products/slug/${idOrSlug}` : `/products/${idOrSlug}`;
  const response = await api.getWithCache(url);
  return normalizeProduct(response?.data ?? response);
};

export const getHotProducts = async (limit = 10) => {
  const response = await api.getWithCache(`/products/hot?limit=${limit}`);
  return extractData(response);
};

export const getFeaturedProducts = async (limit = 10) => {
  const response = await api.getWithCache(`/products/featured?limit=${limit}`);
  return extractData(response);
};

export const getLatestProducts = async (limit = 10) => {
  const response = await api.getWithCache(`/products/latest?limit=${limit}`);
  return extractData(response);
};

export const getMarketplaceCategories = async () => {
  const response = await api.getWithCache("/products/categories");
  return response?.data || [];
};

// ============================================
// CART
// ============================================

export const getCart = async () => {
  return await api.get("/cart");
};

export const addToCart = async (token, data) => {
  return await api.post("/cart", data);
};

export const updateCartItem = async (token, recordId, quantity) => {
  return await api.put(`/cart/${recordId}`, { quantity });
};

export const removeFromCart = async (token, recordId) => {
  return await api.delete(`/cart/${recordId}`);
};

// ============================================
// ORDERS
// ============================================

export const placeOrder = async (token, data) => {
  return await api.post("/orders/place", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const directOrder = async (token, data) => {
  return await api.post("/orders/direct", data, {
    headers: { Authorization: token ? `Bearer ${token}` : undefined },
  });
};

export const getOrders = async (token) => {
  return await api.get("/orders", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ============================================
// ADMIN
// ============================================

export const getAdminOrders = async () => {
  return await api.get("/orders");
};

export const getAdminStats = async () => {
  return await api.get("/orders/stats");
};

export const updateOrderStatus = async (orderId, status) => {
  return await api.patch(`/orders/${orderId}/status`, { status });
};

export const adminCreateProduct = async (data) => {
  return await api.post("/products", data);
};

export const adminUpdateProduct = async (productId, data) => {
  return await api.put(`/products/${productId}`, data);
};

export const adminDeleteProduct = async (productId) => {
  return await api.delete(`/products/${productId}`);
};
