// controllers/userController.js - With Automatic Role Assignment
const asyncHandler = require("express-async-handler");
const {
  UserModel,
  ROLES,
  VALID_ROLES,
  ROLE_HIERARCHY,
} = require("../models/userModel");

// ============================================
// HELPER FUNCTIONS
// ============================================
function maskEmail(email) {
  if (!email) return null;
  const [localPart, domain] = email.split("@");
  if (localPart.length <= 2) return email;
  const maskedLocal =
    localPart[0] +
    "*".repeat(localPart.length - 2) +
    localPart[localPart.length - 1];
  return `${maskedLocal}@${domain}`;
}

const createUser = asyncHandler(async (req, res) => {
  const {
    real_name,
    username,
    gender,
    age_bracket,
    county,
    ward,
    voter_card,
    will_vote,
    password,
    political_party,
    employment_status,
    political_leanings,
    vote_frequency,
    personal_email,
    role,
  } = req.body;

  // Required fields validation
  if (!password) {
    return res
      .status(400)
      .json({ success: false, message: "Password is required" });
  }
  if (!real_name) {
    return res
      .status(400)
      .json({ success: false, message: "Real name is required" });
  }
  if (real_name.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: "Real name must be at least 3 characters",
    });
  }
  if (!gender) {
    return res
      .status(400)
      .json({ success: false, message: "Gender is required" });
  }
  if (!age_bracket) {
    return res
      .status(400)
      .json({ success: false, message: "Age bracket is required" });
  }
  if (!county) {
    return res
      .status(400)
      .json({ success: false, message: "County is required" });
  }
  if (!voter_card) {
    return res
      .status(400)
      .json({ success: false, message: "Voter card status is required" });
  }
  if (!will_vote) {
    return res
      .status(400)
      .json({ success: false, message: "Voting intention is required" });
  }

  // Validate role if provided (must be a valid role)
  let userRole = "user"; // Default role
  if (role) {
    if (!UserModel.isValidRole(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: user, admin, market_admin, super_admin, ceo`,
      });
    }
    userRole = role;
  }

  // Validate personal email if provided
  if (personal_email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personal_email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Check if email already exists
    const existingEmail = await UserModel.findByEmail(personal_email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }
  }

  // Validate political leanings if provided
  const validLeanings = [
    "Pro-Government",
    "Opposition",
    "Undecided",
    "Prefer not to say",
  ];
  if (political_leanings && !validLeanings.includes(political_leanings)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid political leaning. Must be: Pro-Government, Opposition, Undecided, or Prefer not to say",
    });
  }

  // Validate vote frequency if provided
  const validFrequencies = [
    "Always",
    "Sometimes",
    "Rarely",
    "Never",
    "First-time voter",
    "Prefer not to say",
  ];
  if (vote_frequency && !validFrequencies.includes(vote_frequency)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid vote frequency. Must be: Always, Sometimes, Rarely, Never, First-time voter, or Prefer not to say",
    });
  }

  // Validate username
  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Username is required",
    });
  }

  if (username.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Username is too long (max 100 characters)",
    });
  }

  // Validate county
  if (!UserModel.isValidCounty(county)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid county name" });
  }

  // Validate age bracket
  if (!UserModel.isValidAgeBracket(age_bracket)) {
    return res.status(400).json({
      success: false,
      message: "Invalid age bracket. Must be: 18-25, 26-35, 36-45, 46-55, 56+",
    });
  }

  try {
    // Handle username
    let finalUsername = username;
    if (!finalUsername) {
      finalUsername = await UserModel.generateAnonymousUserName();
    } else {
      const existingUser = await UserModel.findByUsername(finalUsername);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already taken. Please choose another one.",
        });
      }
    }

    const generation = UserModel.getGenerationLabel(age_bracket);
    const password_hash = await UserModel.hashPassword(password);

    // Convert form values
    const voterCardInt = voter_card === "Yes" ? 1 : 0;
    const willVoteVal = will_vote === "Yes" ? 1 : will_vote === "No" ? 0 : 2;

    // Create user with all fields including role
    const user_id = await UserModel.create({
      real_name: real_name.trim(),
      anonymous_username: finalUsername,
      gender,
      age_bracket,
      generation,
      county,
      ward: ward || null,
      voter_card: voterCardInt,
      will_vote: willVoteVal,
      password_hash,
      role: userRole, // This will be "user" by default
      political_party: political_party || "Undecided",
      employment_status: employment_status || "Prefer not to say",
      political_leanings: political_leanings || "Prefer not to say",
      vote_frequency: vote_frequency || "Prefer not to say",
      personal_email: personal_email || null,
    });

    console.log(
      `[User Created] ${finalUsername} - ${user_id} - Role: ${userRole}`,
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user_id,
        username: finalUsername,
        real_name: real_name.trim(),
        role: userRole,
      },
    });
  } catch (error) {
    console.error("[createUser] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create user. Please try again.",
    });
  }
});

// ============================================
// GET USER BY ID
// ============================================
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "User ID is required" });
  }

  try {
    const user = await UserModel.findByIdWithRole(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const stats = await UserModel.getUserStats(userId);

    const userData = {
      user_id: user.user_id,
      username: user.anonymous_username,
      real_name: user.real_name,
      role: user.role || "user",
      gender: user.gender,
      age_bracket: user.age_bracket,
      generation: user.generation,
      county: user.county,
      ward: user.ward,
      voter_card: user.voter_card === 1,
      will_vote:
        user.will_vote === 1 ? true : user.will_vote === 0 ? false : null,
      political_party: user.political_party,
      employment_status: user.employment_status,
      political_leanings: user.political_leanings,
      vote_frequency: user.vote_frequency,
      personal_email: user.personal_email
        ? maskEmail(user.personal_email)
        : null,
      is_verified: user.is_verified === 1,
      member_since: user.created_at,
      stats,
    };

    return res.status(200).json({ success: true, data: userData });
  } catch (error) {
    console.error("[getUserById] Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch user" });
  }
});

// ============================================
// UPDATE USER
// ============================================
const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const {
    real_name,
    username,
    county,
    ward,
    gender,
    age_bracket,
    political_party,
    employment_status,
    voter_card,
    will_vote,
    political_leanings,
    vote_frequency,
    personal_email,
  } = req.body;

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "User ID is required" });
  }

  // Validate fields if provided
  if (real_name && real_name.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: "Real name must be at least 3 characters",
    });
  }

  if (username && username.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Username is too long (max 100 characters)",
    });
  }

  if (county && !UserModel.isValidCounty(county)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid county name" });
  }

  if (age_bracket && !UserModel.isValidAgeBracket(age_bracket)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid age bracket" });
  }

  // Validate email if updating
  if (personal_email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personal_email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }
  }

  // Validate political leanings if updating
  if (political_leanings) {
    const validLeanings = [
      "Pro-Government",
      "Opposition",
      "Undecided",
      "Prefer not to say",
    ];
    if (!validLeanings.includes(political_leanings)) {
      return res.status(400).json({
        success: false,
        message: "Invalid political leaning",
      });
    }
  }

  // Validate vote frequency if updating
  if (vote_frequency) {
    const validFrequencies = [
      "Always",
      "Sometimes",
      "Rarely",
      "Never",
      "First-time voter",
      "Prefer not to say",
    ];
    if (!validFrequencies.includes(vote_frequency)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vote frequency",
      });
    }
  }

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check username availability if changing
    if (username && username !== user.anonymous_username) {
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "Username already taken" });
      }
    }

    // Check email availability if changing
    if (personal_email && personal_email !== user.personal_email) {
      const existingEmail = await UserModel.findByEmail(personal_email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already registered to another account",
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (real_name) updateData.real_name = real_name.trim();
    if (username) updateData.anonymous_username = username.trim();
    if (county) updateData.county = county.trim();
    if (ward) updateData.ward = ward.trim();
    if (gender) updateData.gender = gender;
    if (political_party) updateData.political_party = political_party;
    if (employment_status) updateData.employment_status = employment_status;
    if (voter_card) updateData.voter_card = voter_card === "Yes" ? 1 : 0;
    if (will_vote)
      updateData.will_vote =
        will_vote === "Yes" ? 1 : will_vote === "No" ? 0 : 2;
    if (political_leanings) updateData.political_leanings = political_leanings;
    if (vote_frequency) updateData.vote_frequency = vote_frequency;
    if (personal_email) updateData.personal_email = personal_email;

    if (age_bracket) {
      updateData.age_bracket = age_bracket;
      updateData.generation = UserModel.getGenerationLabel(age_bracket);
    }

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No fields to update" });
    }

    await UserModel.update(userId, updateData);

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("[updateUser] Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update user" });
  }
});

// ============================================
// UPDATE USER ROLE (Admin only)
// ============================================
const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  const authenticatedUser = req.user;

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "User ID is required" });
  }

  if (!role) {
    return res
      .status(400)
      .json({ success: false, message: "Role is required" });
  }

  // Check if authenticated user exists and has permission
  if (!authenticatedUser || !authenticatedUser.user_id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    // Get the current user's role
    const currentUser = await UserModel.findById(authenticatedUser.user_id);
    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "Current user not found" });
    }

    // Update the role with permission check
    await UserModel.updateUserRole(
      userId,
      role,
      authenticatedUser.user_id,
      currentUser.role,
    );

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`,
    });
  } catch (error) {
    console.error("[updateUserRole] Error:", error);
    return res.status(403).json({
      success: false,
      message: error.message || "Failed to update user role",
    });
  }
});

// ============================================
// GET ALL USERS WITH ROLES (Admin only)
// ============================================
const getAllUsers = asyncHandler(async (req, res) => {
  const { limit = 100, offset = 0 } = req.query;

  try {
    const users = await UserModel.getAllWithRoles(
      parseInt(limit),
      parseInt(offset),
    );

    const totalUsers = await UserModel.getTotalCount();

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: totalUsers,
        },
      },
    });
  } catch (error) {
    console.error("[getAllUsers] Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch users" });
  }
});

// ============================================
// GET ROLE DISTRIBUTION (Admin only)
// ============================================
const getRoleDistribution = asyncHandler(async (req, res) => {
  try {
    const distribution = await UserModel.getRoleDistribution();

    return res.status(200).json({
      success: true,
      data: distribution,
    });
  } catch (error) {
    console.error("[getRoleDistribution] Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch role distribution" });
  }
});

// ============================================
// CHECK USERNAME AVAILABILITY
// ============================================
const checkUsernameAvailability = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Username is required",
    });
  }

  if (username.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Username is too long (max 100 characters)",
    });
  }

  try {
    const existingUser = await UserModel.findByUsername(username);

    const reservedUsernames = [
      "admin",
      "root",
      "system",
      "support",
      "help",
      "info",
    ];
    const isReserved = reservedUsernames.includes(username.toLowerCase());

    const available = !existingUser && !isReserved;

    return res.status(200).json({
      success: true,
      available: available,
      message: available
        ? "Username is available"
        : existingUser
          ? "Username is already taken"
          : "Username is reserved",
    });
  } catch (error) {
    console.error("[checkUsernameAvailability] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check username availability",
    });
  }
});

// ============================================
// GET ANALYTICS (Demographic Stats)
// ============================================
const getAnalytics = asyncHandler(async (req, res) => {
  try {
    const stats = await UserModel.getDemographicStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("[getAnalytics] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
});

// ============================================
// GET COUNTY STATS
// ============================================
const getCountyStats = asyncHandler(async (req, res) => {
  try {
    const countyStats = await UserModel.getCountyStats();

    const totalUsers = countyStats.reduce(
      (sum, county) => sum + county.total_users,
      0,
    );

    const countyStatsWithPercentage = countyStats.map((county) => ({
      ...county,
      percentage: totalUsers > 0 ? (county.total_users / totalUsers) * 100 : 0,
    }));

    countyStatsWithPercentage.sort((a, b) => b.total_users - a.total_users);

    return res.status(200).json({
      success: true,
      data: {
        countyStats: countyStatsWithPercentage,
        totalUsers,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[getCountyStats] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch county statistics",
    });
  }
});

module.exports = {
  createUser,
  getUserById,
  updateUser,
  updateUserRole,
  getAllUsers,
  getRoleDistribution,
  checkUsernameAvailability,
  getAnalytics,
  getCountyStats,
};
