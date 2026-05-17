const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  getProductBySlug,
  getProductsByCategory,
  getFeaturedProducts,
  createProduct,
  getLatestProducts,
  getHotProducts,
  updateProduct,
  deleteProduct,
  getPersonalizedFeed,
} = require("../controller/product-controller");

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
} = require("../controller/category-controller");

// Public routes
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);
router.post("/subcategories", createSubcategory);

router.get("/latest", getLatestProducts);
router.get("/hot", getHotProducts);             // Trending store carousel
router.get("/feed", getPersonalizedFeed);       // Personalized recommendations feed
router.get("/category/:category", getProductsByCategory);
router.get("/slug/:slug", getProductBySlug);    // SEO slug route — MUST be before /:id
router.get("/:id", getProductById);             // Numeric ID or fallback slug lookup

// Admin routes (add auth middleware later)
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
