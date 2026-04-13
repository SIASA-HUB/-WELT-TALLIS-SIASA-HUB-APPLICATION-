import api from "../../../../api/api";
import CONFIG from "../../../../api/config";

// Use the global api instance (baseURL already set to GATEWAY/api/v1)
const API = api;

// Helper: normalize a single product to the shape the UI expects
const normalizeProduct = (product) => {
  if (!product) return product;

  const parsePrice = (val) => {
    if (typeof val === "number") return val;
    if (typeof val === "string") return parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
    return 0;
  };

  const orgPrice = parsePrice(product.price);
  const mrpPrice = parsePrice(product.mrp) || orgPrice;

  return {
    ...product,
    _id: product._id || product.id,
    title: product.title || product.name || "Product",
    img:   product.img || product.image || product.image_url,
    slug:  product.slug || null,
    rating: Number(product.rating) || 4.5,
    sizes: typeof product.sizes === "string"
      ? product.sizes.split(",").map(s => s.trim()).filter(Boolean)
      : (Array.isArray(product.sizes) ? product.sizes : []),
    // Normalise price to { org, mrp, off } shape expected by UI
    price: (product.price && typeof product.price === "object") ? product.price : {
      org: orgPrice,
      mrp: mrpPrice,
      off: mrpPrice > orgPrice ? Math.round(((mrpPrice - orgPrice) / mrpPrice) * 100) : 0,
    },
  };
};

// Wrap a raw API response (already unwrapped by global interceptor) into data list
const extractAndNormalize = (response) => {
  // The global api.js interceptor returns response.data directly
  const raw = response;
  if (!raw) return [];
  // Response could be { success, data: [...] } or { success, data: {...} } or just [...]
  const items = raw.data ?? raw;
  if (Array.isArray(items)) return items.map(normalizeProduct);
  if (typeof items === "object") return normalizeProduct(items);
  return [];
};

// ─── Products ────────────────────────────────────────────────────────────────

export const getAllProducts = async (filter) => {
  const url = `/products${filter ? `?${filter}` : ""}`;
  const res = await api.getWithCache(url);
  return extractAndNormalize(res);
};

export const getProductDetails = async (idOrSlug) => {
  const isSlug = idOrSlug && isNaN(idOrSlug);
  const url = isSlug ? `/products/slug/${idOrSlug}` : `/products/${idOrSlug}`;
  const res = await api.getWithCache(url);
  // single product — may come as { success, data: {...} }
  const raw = res?.data ?? res;
  return normalizeProduct(raw);
};


//Cart

export const getCart = async (token) =>
  await API.get("/cart", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addToCart = async (token, data) =>
  await API.post(`/cart/add`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteFromCart = async (token, data) =>
  await API.post(`/cart/remove`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

//Orders

export const placeOrder = async (token, data) =>
  await API.post(`/orders/place`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getOrders = async (token) =>
  await API.get(`/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Admin Orders & Stats
export const getAdminOrders = async () => 
  await API.get(`/orders`);

export const getAdminStats = async () =>
  await API.get(`/orders/stats`);

export const updateOrderStatus = async (id, status) =>
  await API.patch(`/orders/${id}/status`, { status });
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
  await API.post(`/orders/direct`, data, {
    headers: { Authorization: token ? `Bearer ${token}` : undefined },
  });
