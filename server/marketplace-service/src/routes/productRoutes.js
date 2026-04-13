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
  getCategories,
} = require("../controller/product-controller");

// Public routes
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/categories", getCategories);
router.get("/latest", getLatestProducts);
router.get("/hot", getHotProducts);             // Trending store carousel
router.get("/category/:category", getProductsByCategory);
router.get("/slug/:slug", getProductBySlug);    // SEO slug route — MUST be before /:id
router.get("/:id", getProductById);             // Numeric ID or fallback slug lookup

// Admin routes (add auth middleware later)
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
