// productController.js - Complete with Redis Cache & Slug Support (Redis Fixed)

const { safeQuery, safeQueryOne } = require("../configurations/db");
const Logger = require("../utils/logger/logger");
const slugify = require("slugify");

// Redis client - handle both ioredis and node-redis
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

// Helper function to generate slug
const generateSlug = (name, id = null) => {
  let slug = slugify(name, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
    replacement: '-'
  });
  
  if (id) {
    slug = `${slug}-${id}`;
  }
  
  return slug;
};

// Helper function to clean undefined values
const cleanUndefined = (value) => {
  return value === undefined ? null : value;
};

// Cache helper functions
const getCacheKey = (prefix, params) => {
  return `${prefix}:${JSON.stringify(params)}`;
};

// Redis set helper - works with both ioredis and node-redis
const redisSet = async (key, value, ttl) => {
  if (!redis) return false;
  try {
    // The global redis.set already handles JSON.stringify and TTL conversion
    return await redis.set(key, value, ttl);
  } catch (err) {
    Logger.error("Redis set error:", { error: err.message });
    return false;
  }
};

// Redis get helper
const redisGet = async (key) => {
  if (!redis) return null;
  try {
    // The global redis.get already handles JSON.parse
    return await redis.get(key);
  } catch (err) {
    Logger.error("Redis get error:", { error: err.message });
    return null;
  }
};

// Redis del helper
const redisDel = async (key) => {
  if (!redis) return false;
  try {
    await redis.del(key);
    return true;
  } catch (err) {
    Logger.error("Redis del error:", { error: err.message });
    return false;
  }
};

// Redis keys helper
const redisKeys = async (pattern) => {
  if (!redis) return [];
  try {
    return await redis.keys(pattern);
  } catch (err) {
    Logger.error("Redis keys error:", { error: err.message });
    return [];
  }
};

const clearProductCache = async (productId = null, slug = null) => {
  if (!redis) return;
  
  try {
    // Clear products list cache
    const keys = await redisKeys("products:list:*");
    if (keys && keys.length > 0) {
      for (const key of keys) {
        await redisDel(key);
      }
    }
    
    // Clear hot products cache
    await redisDel("products:hot");
    await redisDel("products:hot:*");
    
    // Clear latest products cache
    await redisDel("products:latest");
    await redisDel("products:latest:*");
    
    // Clear categories cache
    await redisDel("products:categories");
    
    // Clear specific product cache if ID provided
    if (productId) {
      await redisDel(`product:${productId}`);
      const slugKeys = await redisKeys(`product:slug:*`);
      if (slugKeys && slugKeys.length > 0) {
        for (const key of slugKeys) {
          await redisDel(key);
        }
      }
    }
    
    if (slug) {
      await redisDel(`product:slug:${slug}`);
    }
    
    Logger.info("✅ Product cache cleared");
  } catch (error) {
    Logger.error("Error clearing cache:", { error: error.message });
  }
};

// Get all products with filters (CACHED)
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
      sort = "newest"
    } = req.query;

    // Create cache key based on all query params
    const cacheKey = getCacheKey("products:list", req.query);
    
    // Try to get from cache
    if (redis) {
      try {
        const cachedData = await redisGet(cacheKey);
        if (cachedData) {
          Logger.info("📦 Returning cached products");
          return res.json(cachedData); // No JSON.parse() needed
        }
      } catch (cacheErr) {
        Logger.warn("Cache read error, continuing to database:", { error: cacheErr.message });
      }
    }

    let sql = `SELECT * FROM products WHERE status = 'active'`;
    const params = [];

    if (category) {
      sql += ` AND LOWER(category) = LOWER(?)`;
      params.push(category);
    } else if (categories) {
      const categoryList = categories.split(",");
      if (categoryList.length > 0) {
        sql += ` AND LOWER(category) IN (${categoryList.map(() => "LOWER(?)").join(",")})`;
        params.push(...categoryList);
      }
    }

    if (featured === "true") {
      sql += ` AND featured = 1`;
    }

    if (search) {
      sql += ` AND (LOWER(name) LIKE LOWER(?) OR LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (minPrice) {
      sql += ` AND price >= ?`;
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      sql += ` AND price <= ?`;
      params.push(parseFloat(maxPrice));
    }

    if (sizes) {
      const sizeList = sizes.split(",");
      if (sizeList.length > 0) {
        sql += ` AND (${sizeList.map(() => "LOWER(sizes) LIKE LOWER(?)").join(" OR ")})`;
        sizeList.forEach(s => params.push(`%${s.trim()}%`));
      }
    }

    // Sorting
    switch(sort) {
      case "price_asc":
        sql += ` ORDER BY price ASC`;
        break;
      case "price_desc":
        sql += ` ORDER BY price DESC`;
        break;
      default:
        sql += ` ORDER BY created_at DESC`;
    }
    
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const products = await safeQuery(sql, params);

    // Get total count
    let countSql = `SELECT COUNT(*) as total FROM products WHERE status = 'active'`;
    const countParams = [];
    
    if (category) {
      countSql += ` AND LOWER(category) = LOWER(?)`;
      countParams.push(category);
    } else if (categories) {
      const categoryList = categories.split(",");
      if (categoryList.length > 0) {
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

    // Store in cache
    if (redis) {
      await redisSet(cacheKey, response, CACHE_TTL.PRODUCTS_LIST); // No JSON.stringify() needed
      Logger.info("💾 Products cached");
    }

    res.json(response);
  } catch (error) {
    Logger.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Error fetching products: " + error.message });
  }
};

// Get single product by ID or Slug (CACHED)
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    let cacheKey = `product:${id}`;
    let product = null;
    
    // Try to get from cache
    if (redis) {
      try {
        const cachedProduct = await redisGet(cacheKey);
        if (cachedProduct) {
          Logger.info("📦 Returning cached product");
          return res.json(cachedProduct);
        }
      } catch (cacheErr) {
        Logger.warn("Cache read error:", { error: cacheErr.message });
      }
    }
    
    // Check if id is a slug or numeric
    if (isNaN(id)) {
      cacheKey = `product:slug:${id}`;
      if (redis) {
        try {
          const cachedBySlug = await redisGet(cacheKey);
          if (cachedBySlug) {
            return res.json(cachedBySlug);
          }
        } catch (cacheErr) {}
      }
      
      product = await safeQueryOne(
        `SELECT * FROM products WHERE slug = ? AND status = 'active'`,
        [id],
      );
    } else {
      product = await safeQueryOne(
        `SELECT * FROM products WHERE id = ? AND status = 'active'`,
        [id],
      );
    }

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Store in cache
    if (redis) {
      await redisSet(cacheKey, { success: true, data: product }, CACHE_TTL.PRODUCT_DETAIL);
    }

    res.json({ success: true, data: product });
  } catch (error) {
    Logger.error("Error fetching product:", error);
    res.status(500).json({ success: false, message: "Error fetching product" });
  }
};

// Get product by slug (SEO friendly)
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const cacheKey = `product:slug:${slug}`;
    
    if (redis) {
      try {
        const cachedProduct = await redisGet(cacheKey);
        if (cachedProduct) {
          return res.json(cachedProduct);
        }
      } catch (cacheErr) {}
    }
    
    const product = await safeQueryOne(
      `SELECT * FROM products WHERE slug = ? AND status = 'active'`,
      [slug],
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (redis) {
      await redisSet(cacheKey, { success: true, data: product }, CACHE_TTL.PRODUCT_DETAIL);
    }

    res.json({ success: true, data: product });
  } catch (error) {
    Logger.error("Error fetching product by slug:", error);
    res.status(500).json({ success: false, message: "Error fetching product" });
  }
};

// Create new product (Admin only)
const createProduct = async (req, res) => {
  try {
    const {
      name,
      title,
      description,
      price,
      mrp,
      category,
      stock,
      image,
      seller,
      featured,
      sizes,
      rating
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, price, category",
      });
    }

    let slug = generateSlug(name);
    const existingSlug = await safeQueryOne(`SELECT id FROM products WHERE slug = ?`, [slug]);
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const sql = `
      INSERT INTO products (
        name, title, description, price, mrp, category, stock, image, seller, featured, 
        sizes, rating, slug, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
    `;

    const result = await safeQuery(sql, [
      name,
      cleanUndefined(title),
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

    const newProduct = await safeQueryOne(
      `SELECT * FROM products WHERE id = ?`,
      [result.insertId],
    );

    await clearProductCache(newProduct.id, slug);

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    Logger.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Error creating product: " + error.message,
    });
  }
};

// Update product (Admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = [];
    const values = [];

    const allowedFields = [
      "name", "title", "description", "price", "mrp", "category",
      "stock", "image", "seller", "featured", "status", "sizes", "rating"
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        if (field === "price") {
          values.push(parseFloat(updates[field]));
        } else if (field === "mrp") {
          values.push(updates[field] ? parseFloat(updates[field]) : null);
        } else if (field === "stock") {
          values.push(updates[field] ? parseInt(updates[field]) : 0);
        } else if (field === "featured") {
          values.push(updates[field] ? 1 : 0);
        } else if (field === "rating") {
          values.push(parseFloat(updates[field]));
        } else if (field === "name") {
          values.push(updates[field]);
          let newSlug = generateSlug(updates[field]);
          const existingSlug = await safeQueryOne(`SELECT id FROM products WHERE slug = ? AND id != ?`, [newSlug, id]);
          if (existingSlug) {
            newSlug = `${newSlug}-${id}`;
          }
          fields.push(`slug = ?`);
          values.push(newSlug);
        } else {
          values.push(cleanUndefined(updates[field]));
        }
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    values.push(id);
    const sql = `UPDATE products SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`;

    await safeQuery(sql, values);
    const updatedProduct = await safeQueryOne(`SELECT * FROM products WHERE id = ?`, [id]);

    await clearProductCache(id, updatedProduct?.slug);

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    Logger.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Error updating product: " + error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await safeQueryOne(`SELECT slug FROM products WHERE id = ?`, [id]);
    
    await safeQuery(`UPDATE products SET status = 'inactive', updated_at = NOW() WHERE id = ?`, [id]);

    await clearProductCache(id, product?.slug);

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    Logger.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Error deleting product" });
  }
};

// Get product categories (CACHED)
const getCategories = async (req, res) => {
  try {
    if (redis) {
      try {
        const cached = await redisGet("products:categories");
        if (cached) {
          return res.json(cached);
        }
      } catch (cacheErr) {}
    }
    
    const categories = await safeQuery(
      `SELECT DISTINCT category, COUNT(*) as count FROM products WHERE status = 'active' GROUP BY category`,
    );

    const response = { success: true, data: categories };
    if (redis) {
      await redisSet("products:categories", response, CACHE_TTL.CATEGORIES);
    }

    res.json(response);
  } catch (error) {
    Logger.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: "Error fetching categories" });
  }
};

// Get latest products (CACHED)
const getLatestProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const cacheKey = `products:latest:${limit}`;
    
    if (redis) {
      try {
        const cached = await redisGet(cacheKey);
        if (cached) {
          return res.json(cached);
        }
      } catch (cacheErr) {}
    }
    
    const products = await safeQuery(
      `SELECT id, name, title, price, mrp, image, seller, category, slug, created_at 
       FROM products 
       WHERE status = 'active' 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [parseInt(limit)],
    );

    const response = { success: true, data: products };
    if (redis) {
      await redisSet(cacheKey, response, CACHE_TTL.LATEST_PRODUCTS);
    }

    res.json(response);
  } catch (error) {
    Logger.error("Error fetching latest products:", error);
    res.status(500).json({ success: false, message: "Error fetching latest products" });
  }
};

// Get HOT products (CACHED)
const getHotProducts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 20);
    const cacheKey = `products:hot:${limit}`;
    
    if (redis) {
      try {
        const cached = await redisGet(cacheKey);
        if (cached) {
          return res.json(cached);
        }
      } catch (cacheErr) {}
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
    if (redis) {
      await redisSet(cacheKey, response, CACHE_TTL.HOT_PRODUCTS);
    }

    res.json(response);
  } catch (error) {
    Logger.error("Error fetching hot products:", error);
    res.status(500).json({ success: false, message: "Error fetching hot products" });
  }
};

// Get products by category (CACHED)
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;
    const cacheKey = `products:category:${category}:${limit}`;
    
    if (redis) {
      try {
        const cached = await redisGet(cacheKey);
        if (cached) {
          return res.json(cached);
        }
      } catch (cacheErr) {}
    }
    
    const products = await safeQuery(
      `SELECT * FROM products WHERE category = ? AND status = 'active' ORDER BY featured DESC, created_at DESC LIMIT ?`,
      [category, parseInt(limit)],
    );

    const response = { success: true, data: products };
    if (redis) {
      await redisSet(cacheKey, JSON.stringify(response), CACHE_TTL.PRODUCTS_LIST);
    }

    res.json(response);
  } catch (error) {
    Logger.error("Error fetching products by category:", error);
    res.status(500).json({ success: false, message: "Error fetching products" });
  }
};

// Get featured products (CACHED)
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const cacheKey = `products:featured:${limit}`;
    
    if (redis) {
      try {
        const cached = await redisGet(cacheKey);
        if (cached) {
          return res.json(cached);
        }
      } catch (cacheErr) {}
    }
    
    const products = await safeQuery(
      `SELECT * FROM products WHERE featured = 1 AND status = 'active' ORDER BY created_at DESC LIMIT ?`,
      [parseInt(limit)],
    );

    const response = { success: true, data: products };
    if (redis) {
      await redisSet(cacheKey, JSON.stringify(response), CACHE_TTL.PRODUCTS_LIST);
    }

    res.json(response);
  } catch (error) {
    Logger.error("Error fetching featured products:", error);
    res.status(500).json({ success: false, message: "Error fetching featured products" });
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
  clearProductCache
};