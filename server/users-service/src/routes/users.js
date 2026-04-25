// src/routes/users.js
const express = require("express");
const router = express.Router();

// User controllers
const {
  createUser,
  getUserById,
  updateUser,
  checkUsernameAvailability,
  getAnalytics,
  getCountyStats,
  trackAppInstall,
  getInstallCount,
} = require("../controllers/userController");

const {
  trackClick,
  getClickStats
} = require("../controllers/analyticsController");

// Auth controllers
const {
  loginUser,
  refreshToken,
  logoutUser,
  verifyToken: verifyTokenController,
  getUserFromCookie,
  checkAuthStatus,
  getCsrfToken,
} = require("../controllers/loginAuthController");

// Import UserModel for the /me route
const { UserModel } = require("../models/userModel");

// Import global auth middleware
const {
  authenticate,
  authorize,
  csrfProtection,
} = require("../../../global/index");

// ============================================
// AUTH ROUTES (Public)
// ============================================
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.get("/verify", verifyTokenController);
router.get("/status", checkAuthStatus);

// ============================================
// PROTECTED AUTH ROUTES (With CSRF)
// ============================================
router.post("/logout", csrfProtection, logoutUser);
router.get("/csrf-token", authenticate, getCsrfToken);

// ============================================
// PUBLIC ROUTES (No auth required)
// ============================================

// Check username availability
router.get("/check-username/:username", checkUsernameAvailability);

// Register new user
router.post("/register", createUser);

// Get analytics/demographics (public data)
router.get("/analytics", getAnalytics);
router.get("/county/stats", getCountyStats);

// PWA Install Tracking
router.post("/install/track", trackAppInstall);
router.get("/install/count", getInstallCount);

// Analytics Routes
router.post("/analytics/click", trackClick);
router.get("/analytics/clicks", authenticate, authorize("admin"), getClickStats);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

router.get("/me", authenticate, async (req, res) => {
  try {
    // req.userId is set by the authenticate middleware from the token's userId claim
    const effectiveUserId = req.userId || req.user?.userId;
    
    if (!effectiveUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user ID in token" });
    }

    const user = await UserModel.findById(effectiveUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        user_id: user.user_id,
        username: user.anonymous_username,
        real_name: user.real_name,
        gender: user.gender,
        age_bracket: user.age_bracket,
        county: user.county,
        ward: user.ward,
        voter_card: user.voter_card === 1,
        will_vote: user.will_vote,
        political_party: user.political_party,
        employment_status: user.employment_status,
        role: user.role,
        is_verified: user.is_verified === 1,
        member_since: user.created_at,
      },
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user data",
    });
  }
});

// (CSRF protection)
router.put("/me", authenticate, csrfProtection, async (req, res) => {
  try {
    const updateData = req.body;
    const userId = req.user.userId;

    if (updateData.username) {
      const existingUser = await UserModel.findByUsername(updateData.username);
      if (existingUser && existingUser.user_id !== userId) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }
    }

    await UserModel.update(userId, updateData);

    res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
});

// ============================================
// PROTECTED ROUTES (Admin only)
// ============================================

// Get all users (admin only)
router.get("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const users = await UserModel.getAll(req.query.limit, req.query.offset);
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

// ============================================
// STATIC ASSETS
// ============================================
// Serve leader and user uploads - mapped to the leaders-service uploads folder
// for consistency with the requested URLs
const path = require("path");
router.use("/uploads", express.static(path.join(__dirname, "../../../leaders-service/uploads")));

// ============================================
// DYNAMIC ROUTES (Must be at the end)
// ============================================

// Get user by ID (public - limited data)
router.get("/:userId", getUserById);

// Update user by ID (admin only or self with CSRF)
router.put("/:userId", authenticate, csrfProtection, async (req, res) => {
  const { userId } = req.params;
  const currentUser = req.user;

  if (currentUser.userId !== userId && currentUser.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to update this user",
    });
  }

  await updateUser(req, res);
});

module.exports = router;
