// src/routes/users.js
const express = require("express");
const router = express.Router();

// User controllers
const {
  createUser,
  getUserById,
  updateUser,
  getUserStats,
  getAllUsers,
  getUsersByCountyCount,
  getDemographicStats,
  getAllUserCountsByCounty,
} = require("../controllers/userController");

// Auth controllers
const {
  loginUser,
  refreshToken,
  logoutUser,
  verifyToken,
} = require("../controllers/loginAuthController");

// ------------------ AUTH ROUTES ------------------ //
router.post("/auth/login", loginUser);
router.post("/auth/refresh", refreshToken);
router.post("/auth/logout", logoutUser);
router.get("/auth/verify", verifyToken);

// ------------------ USER ROUTES ------------------ //
// Create a new user
router.post("/users/register", createUser);

// Get user stats
router.get("/users/:userId/stats", getUserStats);
router.get("/analytics", getAllUserCountsByCounty);

// Get total number of users in a county (count-only)
router.get("/county", getUsersByCountyCount);

// Get demographic stats
router.get("/demographics/stats", getDemographicStats);

// Dynamic route to get a single user by ID (must be AFTER specific routes!)
router.get("/:userId", getUserById);

// Update user
router.put("/:userId", updateUser);

// Get all users
router.get("/", getAllUsers);

module.exports = router;
