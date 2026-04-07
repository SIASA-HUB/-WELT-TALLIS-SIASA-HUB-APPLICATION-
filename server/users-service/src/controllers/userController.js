const asyncHandler = require("express-async-handler");
const UserModel = require("../models/userModel");

// ============================================
// CREATE USER
// ============================================
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

  // ✅ NO USERNAME RESTRICTIONS - Just check it exists
  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Username is required",
    });
  }

  // Only check length (database limit)
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

    // Create user with all fields
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
      political_party: political_party || "Undecided",
      employment_status: employment_status || "Prefer not to say",
    });

    console.log(`[User Created] ${finalUsername} - ${user_id}`);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user_id,
        username: finalUsername,
        real_name: real_name.trim(),
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
    const user = await UserModel.findById(userId);

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

  // ✅ NO USERNAME RESTRICTIONS - Just check length
  if (username) {
    if (username.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Username is too long (max 100 characters)",
      });
    }
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
// CHECK USERNAME AVAILABILITY - NO RESTRICTIONS!
// ============================================
const checkUsernameAvailability = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Username is required",
    });
  }

  // ✅ NO REGEX VALIDATION - Just check length
  if (username.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Username is too long (max 100 characters)",
    });
  }

  try {
    // Check if username exists in database
    const existingUser = await UserModel.findByUsername(username);

    // Check reserved usernames (optional, can remove if not needed)
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

// In your userController.js - Add this function
const getCountyStats = asyncHandler(async (req, res) => {
  try {
    // Get county-wise user statistics
    const countyStats = await UserModel.getCountyStats();

    // Calculate total users
    const totalUsers = countyStats.reduce(
      (sum, county) => sum + county.total_users,
      0,
    );

    // Add percentage to each county
    const countyStatsWithPercentage = countyStats.map((county) => ({
      ...county,
      percentage: totalUsers > 0 ? (county.total_users / totalUsers) * 100 : 0,
    }));

    // Sort by total_users descending
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
  checkUsernameAvailability,
  getAnalytics,
  getCountyStats,
};
