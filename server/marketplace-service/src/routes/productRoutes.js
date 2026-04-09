const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  createProduct,
  getLatestProducts,
  updateProduct,
  deleteProduct,
  getCategories,
} = require("../controller/product-controller");

// Public routes
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/categories", getCategories);
// In your products routes file
router.get("/latest", getLatestProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/:id", getProductById);

// Admin routes (add auth middleware later)
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
