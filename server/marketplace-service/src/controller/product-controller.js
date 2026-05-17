// productController.js - PRODUCTION READY (Redis Caching Fixed)

const { safeQuery, safeQueryOne } = require("../configurations/db");
const Logger = require("../utils/logger/logger");
const slugify = require("slugify");

// Redis client - handle both ioredis and node-redis safely
let redis;
try {
  redis = require("../../../global/index").redis;
} catch (err) {
  Logger.warn("Redis not available, caching disabled");
  redis = null;
}

// Cache TTL (Time To Live) in seconds
const CACHE_TTL = {
  PRODUCTS_LIST: 300,      // 5 minutes
  PRODUCT_DETAIL: 600,     // 10 minutes
  CATEGORIES: 3600,        // 1 hour
  HOT_PRODUCTS: 180,       // 3 minutes
  LATEST_PRODUCTS: 300     // 5 minutes
};

// ============================================
// SLUG GENERATION
// ============================================
const generateSlug = (name, id = null) => {
  let slug = slugify(name, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
    replacement: '-'
  });
  if (id) slug = `${slug}-${id}`;
  return slug;
};

const cleanUndefined = (value) => (value === undefined ? null : value);

// ============================================
// TITLE CLEANER & FORMATTER
// ============================================
const cleanProductTitle = (title) => {
  if (!title) return title;
  
  // Basic capitalization helper
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  
  // List of words to completely filter out or replace
  let clean = title.replace(/presidential taste/gi, "Premium Edition")
                   .replace(/aspirant taste/gi, "Classic Edition")
                   .replace(/sample data/gi, "")
                   .replace(/campaign taste/gi, "Campaign Edition")
                   .replace(/rep taste/gi, "Standard Edition");

  // Remove multiple spaces
  clean = clean.replace(/\s+/g, " ").trim();

  // Capitalize each word properly
  clean = clean.split(" ").map(capitalize).join(" ");
  
  return clean || "Premium Campaign Product";
};

// ============================================
// REDIS HELPERS (FIXED: no double-stringify)
// ============================================
const getCacheKey = (prefix, params) => `${prefix}:${JSON.stringify(params)}`;

const redisSet = async (key, value, ttl) => {
  if (!redis) return false;
  try {
    // Global redis.set already handles JSON.stringify and TTL conversion
    await redis.set(key, value, ttl);
    return true;
  } catch (err) {
    Logger.error("Redis set error:", { error: err.message, key });
    return false;
  }
};

const redisGet = async (key) => {
  if (!redis) return null;
  try {
    // Global redis.get already returns parsed object (if stored as JSON)
    return await redis.get(key);
  } catch (err) {
    Logger.error("Redis get error:", { error: err.message, key });
    return null;
  }
};

const redisDel = async (key) => {
  if (!redis) return false;
  try {
    await redis.del(key);
    return true;
  } catch (err) {
    Logger.error("Redis del error:", { error: err.message, key });
    return false;
  }
};

const redisKeys = async (pattern) => {
  if (!redis) return [];
  try {
    return await redis.keys(pattern);
  } catch (err) {
    Logger.error("Redis keys error:", { error: err.message, pattern });
    return [];
  }
};

// ============================================
// CACHE CLEARING (FIXED: await all deletions)
// ============================================
const clearProductCache = async (productId = null, slug = null) => {
  if (!redis) return;

  try {
    const keysToDelete = [];

    // Find all keys to delete
    const [listKeys, hotKeys, latestKeys, featuredKeys, categoryKeys] = await Promise.all([
      redisKeys("products:list:*"),
      redisKeys("products:hot:*"),
      redisKeys("products:latest:*"),
      redisKeys("products:featured:*"),
      redisKeys("products:category:*")
    ]);

    keysToDelete.push(...listKeys);
    keysToDelete.push(...hotKeys);
    keysToDelete.push(...latestKeys);
    keysToDelete.push(...featuredKeys);
    keysToDelete.push(...categoryKeys);

    // Static keys
    keysToDelete.push("products:hot", "products:latest", "products:categories");

    // Specific product/slug keys
    if (productId) {
      keysToDelete.push(`product:${productId}`);
      const slugKeys = await redisKeys(`product:slug:*`);
      keysToDelete.push(...slugKeys);
    }

    if (slug) keysToDelete.push(`product:slug:${slug}`);

    // Remove duplicates and filter empty keys
    const uniqueKeys = [...new Set(keysToDelete)].filter(Boolean);

    // Delete all keys in parallel
    if (uniqueKeys.length > 0) {
      await Promise.all(uniqueKeys.map(key => redisDel(key)));
    }

    Logger.info(`✅ Product cache cleared (${uniqueKeys.length} keys)`);
  } catch (error) {
    Logger.error("Error clearing cache:", { error: error.message });
  }
};

// ============================================
// GET ALL PRODUCTS (with filters, pagination, caching)
// ============================================
const getProducts = async (req, res) => {
  try {
    const {
      category,
      categories,
      featured,
      limit = 50,
      offset = 0,
      search,
      minPrice,
      maxPrice,
      sizes,
      sort = "newest",
      segment,
      county
    } = req.query;

    const cacheKey = getCacheKey("products:list", req.query);

    // Try cache
    if (redis) {
      const cached = await redisGet(cacheKey);
      if (cached) {
        Logger.info("📦 Returning cached products");
        return res.json(cached);
      }
    }

    let sql = `SELECT * FROM products WHERE status = 'active'`;
    const params = [];

    if (category) {
      sql += ` AND LOWER(category) = LOWER(?)`;
      params.push(category);
    } else if (categories) {
      const categoryList = categories.split(",");
      if (categoryList.length) {
        sql += ` AND LOWER(category) IN (${categoryList.map(() => "LOWER(?)").join(",")})`;
        params.push(...categoryList);
      }
    }

    if (featured === "true") sql += ` AND featured = 1`;

    if (search) {
      sql += ` AND (LOWER(name) LIKE LOWER(?) OR LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Segment-based price tiers (aspirant levels)
    const segmentPrices = {
      presidential: { min: 8000 },
      governor: { min: 5000 },
      senator: { min: 3500 },
      mp: { min: 2500 },
      mca: { min: 1500 },
      supporter: { max: 2000 },
    };

    if (segment && segmentPrices[segment]) {
      const tier = segmentPrices[segment];
      if (tier.min) { sql += ` AND price >= ?`; params.push(tier.min); }
      if (tier.max) { sql += ` AND price <= ?`; params.push(tier.max); }
    } else {
      if (minPrice) { sql += ` AND price >= ?`; params.push(parseFloat(minPrice)); }
      if (maxPrice) { sql += ` AND price <= ?`; params.push(parseFloat(maxPrice)); }
    }

    if (sizes) {
      const sizeList = sizes.split(",");
      if (sizeList.length) {
        sql += ` AND (${sizeList.map(() => "LOWER(sizes) LIKE LOWER(?)").join(" OR ")})`;
        sizeList.forEach(s => params.push(`%${s.trim()}%`));
      }
    }

    // Sorting
    switch (sort) {
      case "price_asc": sql += ` ORDER BY price ASC`; break;
      case "price_desc": sql += ` ORDER BY price DESC`; break;
      case "popular": sql += ` ORDER BY rating DESC, created_at DESC`; break;
      case "trending": sql += ` ORDER BY featured DESC, created_at DESC`; break;
      case "bestselling": sql += ` ORDER BY stock ASC, created_at DESC`; break;
      case "top_rated": sql += ` ORDER BY rating DESC`; break;
      case "new": sql += ` ORDER BY created_at DESC`; break;
      default: sql += ` ORDER BY created_at DESC`;
    }

    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const products = await safeQuery(sql, params);

    // Count query (same filters)
    let countSql = `SELECT COUNT(*) as total FROM products WHERE status = 'active'`;
    const countParams = [];
    if (category) {
      countSql += ` AND LOWER(category) = LOWER(?)`;
      countParams.push(category);
    } else if (categories) {
      const categoryList = categories.split(",");
      if (categoryList.length) {
        countSql += ` AND LOWER(category) IN (${categoryList.map(() => "LOWER(?)").join(",")})`;
        countParams.push(...categoryList);
      }
    }
    if (featured === "true") countSql += ` AND featured = 1`;
    if (search) {
      countSql += ` AND (LOWER(name) LIKE LOWER(?) OR LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (minPrice) {
      countSql += ` AND price >= ?`;
      countParams.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      countSql += ` AND price <= ?`;
      countParams.push(parseFloat(maxPrice));
    }

    const totalResult = await safeQueryOne(countSql, countParams);

    const response = {
      success: true,
      data: products,
      pagination: {
        total: totalResult?.total || 0,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    };

    // Cache response (already an object)
    if (redis) await redisSet(cacheKey, response, CACHE_TTL.PRODUCTS_LIST);
    res.json(response);
  } catch (error) {
    Logger.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Error fetching products: " + error.message });
  }
};

// ============================================
// GET PRODUCT BY ID OR SLUG (CACHED)
// ============================================
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    let cacheKey = `product:${id}`;
    let product = null;

    if (redis) {
      const cached = await redisGet(cacheKey);
      if (cached) {
        Logger.info("📦 Returning cached product by ID");
        return res.json(cached);
      }
    }

    if (isNaN(id)) {
      cacheKey = `product:slug:${id}`;
      if (redis) {
        const cachedBySlug = await redisGet(cacheKey);
        if (cachedBySlug) return res.json(cachedBySlug);
      }
      product = await safeQueryOne(
        `SELECT * FROM products WHERE slug = ? AND status = 'active'`,
        [id]
      );
    } else {
      product = await safeQueryOne(
        `SELECT * FROM products WHERE id = ? AND status = 'active'`,
        [id]
      );
    }

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const response = { success: true, data: product };
    if (redis) await redisSet(cacheKey, response, CACHE_TTL.PRODUCT_DETAIL);
    res.json(response);
  } catch (error) {
    Logger.error("Error fetching product:", error);
    res.status(500).json({ success: false, message: "Error fetching product" });
  }
};

// ============================================
// GET PRODUCT BY SLUG (SEO)
// ============================================
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const cacheKey = `product:slug:${slug}`;

    if (redis) {
      const cached = await redisGet(cacheKey);
      if (cached) return res.json(cached);
    }

    const product = await safeQueryOne(
      `SELECT * FROM products WHERE slug = ? AND status = 'active'`,
      [slug]
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const response = { success: true, data: product };
    if (redis) await redisSet(cacheKey, response, CACHE_TTL.PRODUCT_DETAIL);
    res.json(response);
  } catch (error) {
    Logger.error("Error fetching product by slug:", error);
    res.status(500).json({ success: false, message: "Error fetching product" });
  }
};

// ============================================
// CREATE PRODUCT (Admin)
// ============================================
const createProduct = async (req, res) => {
  try {
    const {
      name, title, description, price, mrp, category, stock, image,
      seller, featured, sizes, rating
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, price, category",
      });
    }

    // Clean names to prevent junk sample titles
    const cleanedName = cleanProductTitle(name);
    const cleanedTitle = title ? cleanProductTitle(title) : cleanedName;

    let slug = generateSlug(cleanedName);
    const existingSlug = await safeQueryOne(`SELECT id FROM products WHERE slug = ?`, [slug]);
    if (existingSlug) slug = `${slug}-${Date.now()}`;

    const sql = `
      INSERT INTO products (
        name, title, description, price, mrp, category, stock, image, seller, featured,
        sizes, rating, slug, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
    `;

    const result = await safeQuery(sql, [
      cleanedName,
      cleanUndefined(cleanedTitle),
      cleanUndefined(description),
      parseFloat(price),
      mrp ? parseFloat(mrp) : null,
      category,
      stock ? parseInt(stock) : 0,
      cleanUndefined(image),
      cleanUndefined(seller) || "Campaign Store",
      featured ? 1 : 0,
      cleanUndefined(sizes),
      rating ? parseFloat(rating) : 4.5,
      slug
    ]);

    const newProduct = await safeQueryOne(`SELECT * FROM products WHERE id = ?`, [result.insertId]);

    await clearProductCache(newProduct.id, slug);

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    Logger.error("Error creating product:", error);
    res.status(500).json({ success: false, message: "Error creating product: " + error.message });
  }
};

// ============================================
// UPDATE PRODUCT (Admin)
// ============================================
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Resolve product ID if slug was provided
    let productId = parseInt(id);
    let originalProduct = null;
    
    if (isNaN(productId)) {
      originalProduct = await safeQueryOne(`SELECT id, slug FROM products WHERE slug = ?`, [id]);
      if (!originalProduct) return res.status(404).json({ success: false, message: "Product not found" });
      productId = originalProduct.id;
    } else {
      originalProduct = await safeQueryOne(`SELECT id, slug FROM products WHERE id = ?`, [productId]);
      if (!originalProduct) return res.status(404).json({ success: false, message: "Product not found" });
    }

    const fields = [];
    const values = [];

    const allowedFields = [
      "name", "title", "description", "price", "mrp", "category",
      "stock", "image", "seller", "featured", "status", "sizes", "rating"
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        if (field === "price") values.push(parseFloat(updates[field]));
        else if (field === "mrp") values.push(updates[field] ? parseFloat(updates[field]) : null);
        else if (field === "stock") values.push(updates[field] !== null ? parseInt(updates[field]) : 0);
        else if (field === "featured") values.push(updates[field] ? 1 : 0);
        else if (field === "rating") values.push(parseFloat(updates[field]));
        else if (field === "name") {
          const cleanedName = cleanProductTitle(updates[field]);
          values.push(cleanedName);
          let newSlug = generateSlug(cleanedName);
          const existing = await safeQueryOne(`SELECT id FROM products WHERE slug = ? AND id != ?`, [newSlug, productId]);
          if (existing) newSlug = `${newSlug}-${productId}`;
          fields.push(`slug = ?`);
          values.push(newSlug);
        } else if (field === "title") {
          values.push(cleanUndefined(cleanProductTitle(updates[field])));
        } else {
          values.push(cleanUndefined(updates[field]));
        }
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    values.push(productId);
    const sql = `UPDATE products SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`;
    await safeQuery(sql, values);

    const updatedProduct = await safeQueryOne(`SELECT * FROM products WHERE id = ?`, [productId]);
    await clearProductCache(productId, originalProduct.slug);
    if (updatedProduct.slug !== originalProduct.slug) {
       await clearProductCache(null, updatedProduct.slug);
    }

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    Logger.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Error updating product: " + error.message });
  }
};

// ============================================
// DELETE PRODUCT (soft delete)
// ============================================
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let productId = parseInt(id);
    let originalProduct = null;

    if (isNaN(productId)) {
      originalProduct = await safeQueryOne(`SELECT id, slug FROM products WHERE slug = ?`, [id]);
      if (!originalProduct) return res.status(404).json({ success: false, message: "Product not found" });
      productId = originalProduct.id;
    } else {
      originalProduct = await safeQueryOne(`SELECT id, slug FROM products WHERE id = ?`, [productId]);
      if (!originalProduct) return res.status(404).json({ success: false, message: "Product not found" });
    }

    await safeQuery(`UPDATE products SET status = 'inactive', updated_at = NOW() WHERE id = ?`, [productId]);
    await clearProductCache(productId, originalProduct.slug);
    
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    Logger.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Error deleting product" });
  }
};

// ============================================
// GET CATEGORIES (CACHED)
// ============================================
const getCategories = async (req, res) => {
  try {
    if (redis) {
      const cached = await redisGet("products:categories");
      if (cached) return res.json(cached);
    }

    const categories = await safeQuery(
      `SELECT DISTINCT category, COUNT(*) as count FROM products WHERE status = 'active' GROUP BY category`
    );

    const response = { success: true, data: categories };
    if (redis) await redisSet("products:categories", response, CACHE_TTL.CATEGORIES);
    res.json(response);
  } catch (error) {
    Logger.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: "Error fetching categories" });
  }
};

// ============================================
// GET LATEST PRODUCTS (CACHED)
// ============================================
const getLatestProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const cacheKey = `products:latest:${limit}`;

    if (redis) {
      const cached = await redisGet(cacheKey);
      if (cached) return res.json(cached);
    }

    const products = await safeQuery(
      `SELECT id, name, title, price, mrp, image, seller, category, slug, created_at
       FROM products
       WHERE status = 'active'
       ORDER BY created_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    const response = { success: true, data: products };
    if (redis) await redisSet(cacheKey, response, CACHE_TTL.LATEST_PRODUCTS);
    res.json(response);
  } catch (error) {
    Logger.error("Error fetching latest products:", error);
    res.status(500).json({ success: false, message: "Error fetching latest products" });
  }
};

// ============================================
// GET HOT PRODUCTS (CACHED)
// ============================================
const getHotProducts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 20);
    const cacheKey = `products:hot:${limit}`;

    if (redis) {
      const cached = await redisGet(cacheKey);
      if (cached) return res.json(cached);
    }

    const products = await safeQuery(
      `SELECT id, name, title, price, mrp, image, seller, category, slug
       FROM products
       WHERE status = 'active'
       ORDER BY created_at DESC
       LIMIT ?`,
      [limit]
    );

    const response = { success: true, data: products };
    if (redis) await redisSet(cacheKey, response, CACHE_TTL.HOT_PRODUCTS);
    res.json(response);
  } catch (error) {
    Logger.error("Error fetching hot products:", error);
    res.status(500).json({ success: false, message: "Error fetching hot products" });
  }
};

// ============================================
// GET PRODUCTS BY CATEGORY (CACHED - FIXED DOUBLE STRINGIFY)
// ============================================
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;
    const cacheKey = `products:category:${category}:${limit}`;

    if (redis) {
      const cached = await redisGet(cacheKey);
      if (cached) return res.json(cached);
    }

    const products = await safeQuery(
      `SELECT * FROM products WHERE category = ? AND status = 'active' ORDER BY featured DESC, created_at DESC LIMIT ?`,
      [category, parseInt(limit)]
    );

    const response = { success: true, data: products };
    // FIXED: Pass object directly, not JSON.stringify (redisSet handles it)
    if (redis) await redisSet(cacheKey, response, CACHE_TTL.PRODUCTS_LIST);
    res.json(response);
  } catch (error) {
    Logger.error("Error fetching products by category:", error);
    res.status(500).json({ success: false, message: "Error fetching products" });
  }
};

// ============================================
// GET FEATURED PRODUCTS (CACHED - FIXED DOUBLE STRINGIFY)
// ============================================
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const cacheKey = `products:featured:${limit}`;

    if (redis) {
      const cached = await redisGet(cacheKey);
      if (cached) return res.json(cached);
    }

    const products = await safeQuery(
      `SELECT * FROM products WHERE featured = 1 AND status = 'active' ORDER BY created_at DESC LIMIT ?`,
      [parseInt(limit)]
    );

    const response = { success: true, data: products };
    // FIXED: Pass object directly
    if (redis) await redisSet(cacheKey, response, CACHE_TTL.PRODUCTS_LIST);
    res.json(response);
  } catch (error) {
    Logger.error("Error fetching featured products:", error);
    res.status(500).json({ success: false, message: "Error fetching featured products" });
  }
};

// ============================================
// GET PERSONALIZED FEED (NEW)
// ============================================
const getPersonalizedFeed = async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    // In a real scenario, this would use user_id to query 'recommendations' table or 'user_activity'
    // For now, we will mix trending products, latest products, and randomly selected products 
    // to simulate a highly active feed.
    
    // Fallback: Just fetch a mix for the personalized feed
    const products = await safeQuery(
      `SELECT id, name, title, price, mrp, image, seller, category, slug, rating, stock, featured 
       FROM products 
       WHERE status = 'active' 
       ORDER BY featured DESC, RAND() 
       LIMIT ?`,
      [parseInt(limit)]
    );

    res.json({ success: true, data: products });
  } catch (error) {
    Logger.error("Error fetching personalized feed:", error);
    res.status(500).json({ success: false, message: "Error fetching personalized feed" });
  }
};

module.exports = {
  getProducts,
  getLatestProducts,
  getHotProducts,
  getProductById,
  getProductBySlug,
  getProductsByCategory,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  clearProductCache,
  getPersonalizedFeed
};
