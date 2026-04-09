const { safeQuery, safeQueryOne } = require("../configurations/db");
const Logger = require("../utils/logger/logger");

// Helper function to clean undefined values and convert to null
const cleanUndefined = (value) => {
  return value === undefined ? null : value;
};

// Get all products with filters
const getProducts = async (req, res) => {
  try {
    console.log("--- DEBUG: Fetching Products ---");

    const { category, featured, limit = 50, offset = 0, search } = req.query;

    let sql = `SELECT * FROM products WHERE status = 'active'`;
    const params = [];

    if (category) {
      sql += ` AND category = ?`;
      params.push(category);
    }

    if (featured === "true") {
      sql += ` AND featured = 1`;
    }

    if (search) {
      sql += ` AND (name LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const products = await safeQuery(sql, params);

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM products WHERE status = 'active'`;
    const total = await safeQueryOne(countSql);

    res.json({
      success: true,
      data: products,
      pagination: {
        total: total?.total || 0,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    Logger.error("Error fetching products:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching products" });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await safeQueryOne(
      `SELECT * FROM products WHERE id = ? AND status = 'active'`,
      [id],
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    Logger.error("Error fetching product:", error);
    res.status(500).json({ success: false, message: "Error fetching product" });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;

    const products = await safeQuery(
      `SELECT * FROM products WHERE category = ? AND status = 'active' ORDER BY featured DESC, created_at DESC LIMIT ?`,
      [category, parseInt(limit)],
    );

    res.json({ success: true, data: products });
  } catch (error) {
    Logger.error("Error fetching products by category:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching products" });
  }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await safeQuery(
      `SELECT * FROM products WHERE featured = 1 AND status = 'active' ORDER BY created_at DESC LIMIT ?`,
      [parseInt(limit)],
    );

    res.json({ success: true, data: products });
  } catch (error) {
    Logger.error("Error fetching featured products:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching featured products" });
  }
};

// Create new product (Admin only)
const createProduct = async (req, res) => {
  try {
    const {
      name,
      title,
      price,
      mrp,
      category,
      stock,
      image,
      seller,
      featured,
    } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, price, category",
      });
    }

    // Clean undefined values and convert to null
    const sql = `
      INSERT INTO products (
        name, title, price, mrp, category, stock, image, seller, featured, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
    `;

    const result = await safeQuery(sql, [
      name,
      cleanUndefined(title),
      parseFloat(price),
      mrp ? parseFloat(mrp) : null,
      category,
      stock ? parseInt(stock) : 0,
      cleanUndefined(image),
      cleanUndefined(seller) || "Campaign Store",
      featured ? 1 : 0,
    ]);

    const newProduct = await safeQueryOne(
      `SELECT * FROM products WHERE id = ?`,
      [result.insertId],
    );

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

    // Build dynamic update query
    const fields = [];
    const values = [];

    const allowedFields = [
      "name",
      "title",
      "price",
      "mrp",
      "category",
      "stock",
      "image",
      "seller",
      "featured",
      "status",
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        // Handle special cases
        if (field === "price") {
          values.push(parseFloat(updates[field]));
        } else if (field === "mrp") {
          values.push(updates[field] ? parseFloat(updates[field]) : null);
        } else if (field === "stock") {
          values.push(updates[field] ? parseInt(updates[field]) : 0);
        } else if (field === "featured") {
          values.push(updates[field] ? 1 : 0);
        } else {
          values.push(cleanUndefined(updates[field]));
        }
      }
    }

    if (fields.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No fields to update" });
    }

    values.push(id);
    const sql = `UPDATE products SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`;

    await safeQuery(sql, values);
    const updatedProduct = await safeQueryOne(
      `SELECT * FROM products WHERE id = ?`,
      [id],
    );

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    Logger.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product: " + error.message,
    });
  }
};

// Delete product (Soft delete - set status to inactive)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await safeQuery(
      `UPDATE products SET status = 'inactive', updated_at = NOW() WHERE id = ?`,
      [id],
    );

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    Logger.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Error deleting product" });
  }
};

// Get product categories (for filter)
const getCategories = async (req, res) => {
  try {
    const categories = await safeQuery(
      `SELECT DISTINCT category, COUNT(*) as count FROM products WHERE status = 'active' GROUP BY category`,
    );

    res.json({ success: true, data: categories });
  } catch (error) {
    Logger.error("Error fetching categories:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching categories" });
  }
};

const getLatestProducts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const products = await safeQuery(
      `SELECT id, name, title, price, mrp, image, seller, category, created_at 
       FROM products 
       WHERE status = 'active' 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [parseInt(limit)],
    );

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    Logger.error("Error fetching latest products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching latest products",
    });
  }
};

module.exports = {
  getProducts,
  getLatestProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
};
