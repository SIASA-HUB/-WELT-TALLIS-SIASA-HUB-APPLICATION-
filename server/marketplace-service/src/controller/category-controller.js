const { safeQuery, safeQueryOne } = require("../configurations/db");
const { sanitizeString } = require("../../../global");

// ==========================================
// CATEGORY CONTROLLER
// ==========================================

const getCategories = async (req, res) => {
  try {
    const { include_subcategories = "true" } = req.query;

    const categories = await safeQuery(`
      SELECT c.*, 
        COUNT(p.id) as actual_product_count 
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    if (include_subcategories === "true") {
      const subcategories = await safeQuery(`
        SELECT s.*, 
          COUNT(p.id) as actual_product_count
        FROM subcategories s
        LEFT JOIN products p ON p.subcategory_id = s.id
        GROUP BY s.id
      `);

      // Nest subcategories into their parent categories
      categories.forEach((cat) => {
        cat.subcategories = subcategories.filter((sub) => sub.category_id === cat.id);
      });
    }

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: "Error fetching categories" });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, image, status = "active" } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });

    const cleanName = sanitizeString(name);
    // Generate slug from name
    let slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    // Ensure slug uniqueness
    const existing = await safeQueryOne("SELECT id FROM categories WHERE slug = ?", [slug]);
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const result = await safeQuery(
      "INSERT INTO categories (name, slug, image, status) VALUES (?, ?, ?, ?)",
      [cleanName, slug, image || null, status]
    );

    const newCategory = await safeQueryOne("SELECT * FROM categories WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, message: "Category created", data: newCategory });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, message: "Error creating category" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, status } = req.body;

    const existing = await safeQueryOne("SELECT * FROM categories WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ success: false, message: "Category not found" });

    const updates = [];
    const values = [];

    if (name) {
      const cleanName = sanitizeString(name);
      updates.push("name = ?");
      values.push(cleanName);
      // optionally update slug here if strictly desired, but usually slugs should remain constant
    }
    if (image !== undefined) {
      updates.push("image = ?");
      values.push(image);
    }
    if (status) {
      updates.push("status = ?");
      values.push(status);
    }

    if (updates.length > 0) {
      values.push(id);
      await safeQuery(`UPDATE categories SET ${updates.join(", ")} WHERE id = ?`, values);
    }

    const updatedCategory = await safeQueryOne("SELECT * FROM categories WHERE id = ?", [id]);
    res.status(200).json({ success: true, message: "Category updated", data: updatedCategory });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ success: false, message: "Error updating category" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { fallback_category_id } = req.body;

    // Check if category exists
    const existing = await safeQueryOne("SELECT id FROM categories WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ success: false, message: "Category not found" });

    if (fallback_category_id) {
      // Reassign products to another category
      await safeQuery("UPDATE products SET category_id = ? WHERE category_id = ?", [fallback_category_id, id]);
    } else {
      // Unassign category
      await safeQuery("UPDATE products SET category_id = NULL WHERE category_id = ?", [id]);
    }

    // Subcategories will be cascading deleted by foreign key setup (or you can explicitly move them)
    await safeQuery("DELETE FROM categories WHERE id = ?", [id]);

    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ success: false, message: "Error deleting category" });
  }
};

// ==========================================
// SUBCATEGORY CONTROLLER
// ==========================================

const createSubcategory = async (req, res) => {
  try {
    const { category_id, name, image, status = "active" } = req.body;
    if (!category_id || !name) {
      return res.status(400).json({ success: false, message: "Category ID and Name are required" });
    }

    const parentExists = await safeQueryOne("SELECT id FROM categories WHERE id = ?", [category_id]);
    if (!parentExists) return res.status(404).json({ success: false, message: "Parent category not found" });

    const cleanName = sanitizeString(name);
    let slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const existing = await safeQueryOne("SELECT id FROM subcategories WHERE slug = ?", [slug]);
    if (existing) slug = `${slug}-${Date.now()}`;

    const result = await safeQuery(
      "INSERT INTO subcategories (category_id, name, slug, image, status) VALUES (?, ?, ?, ?, ?)",
      [category_id, cleanName, slug, image || null, status]
    );

    const newSub = await safeQueryOne("SELECT * FROM subcategories WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, message: "Subcategory created", data: newSub });
  } catch (error) {
    console.error("Error creating subcategory:", error);
    res.status(500).json({ success: false, message: "Error creating subcategory" });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
};
