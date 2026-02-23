const asyncHandler = require("express-async-handler");
const UserModel = require("../models/useModel");

/**
 * @desc    Create a new user
 * @route   POST /api/v1/users
 * @access  Public
 */
const createUser = asyncHandler(async (req, res) => {
  const { gender, age_bracket, county, ward, voter_card, will_vote, password } =
    req.body;

  // ===== VALIDATION =====
  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }

  if (age_bracket && !UserModel.isValidAgeBracket(age_bracket)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid age bracket. Must be one of: 18-25, 26-35, 36-45, 46-55, 56+",
    });
  }

  if (!UserModel.isValidCounty(county)) {
    return res.status(400).json({
      success: false,
      message: "Invalid county name",
    });
  }

  try {
    // Generate unique username
    const anonymous_username = await UserModel.generateAnonymousUserName();

    // Get generation label
    const generation = age_bracket
      ? UserModel.getGenerationLabel(age_bracket)
      : null;

    // Hash password
    const password_hash = await UserModel.hashPassword(password);

    // Convert form values to DB format
    const voterCardInt = voter_card === "Yes" ? 1 : 0;
    const willVoteVal = will_vote === "Yes" ? 1 : will_vote === "No" ? 0 : 2;

    // Create user
    const user_id = await UserModel.create({
      anonymous_username,
      gender,
      age_bracket,
      generation,
      county,
      ward,
      voter_card: voterCardInt,
      will_vote: willVoteVal,
      password_hash,
    });

    // Log user creation (optional)
    console.log(`[User Created] ${anonymous_username} (${user_id})`);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user_id,
        username: anonymous_username,
        message: "Please save your username for future logins",
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

/**
 * @desc    Get user by ID
 * @route   GET /api/v1/users/:userId
 * @access  Private
 */
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    const user = await UserModel.findByIdWithDetails(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user stats
    const stats = await UserModel.getUserStats(userId);

    // Prepare response
    const userData = {
      user_id: user.user_id,
      username: user.anonymous_username,
      gender: user.gender,
      age_bracket: user.age_bracket,
      generation: user.generation,
      county: user.county,
      ward: user.ward,
      voter_card: user.voter_card === 1,
      will_vote:
        user.will_vote === 1 ? true : user.will_vote === 0 ? false : null,
      voter_status:
        user.voter_card === 1 ? "Registered Voter" : "Not Registered",
      voting_intention:
        user.will_vote === 1
          ? "Will Vote"
          : user.will_vote === 0
            ? "Will Not Vote"
            : "Undecided",
      is_verified: user.is_verified === 1,
      member_since: user.created_at,
      stats,
    };

    return res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("[getUserById] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
});

/**
 * @desc    Update user
 * @route   PUT /api/v1/users/:userId
 * @access  Private
 */
const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { anonymous_username, county, ward, gender, age_bracket } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  // Validate county if provided
  if (county && !UserModel.isValidCounty(county)) {
    return res.status(400).json({
      success: false,
      message: "Invalid county name",
    });
  }

  // Validate age bracket if provided
  if (age_bracket && !UserModel.isValidAgeBracket(age_bracket)) {
    return res.status(400).json({
      success: false,
      message: "Invalid age bracket",
    });
  }

  try {
    // Check if user exists
    const exists = await UserModel.exists(userId);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prepare update data
    const updateData = {};
    if (anonymous_username)
      updateData.anonymous_username = anonymous_username.trim();
    if (county) updateData.county = county.trim();
    if (ward) updateData.ward = ward.trim();
    if (gender) updateData.gender = gender;
    if (age_bracket) {
      updateData.age_bracket = age_bracket;
      updateData.generation = UserModel.getGenerationLabel(age_bracket);
    }

    // Check if username is already taken (if updating)
    if (updateData.anonymous_username) {
      const existingUser = await UserModel.findByUsername(
        updateData.anonymous_username,
      );
      if (existingUser && existingUser.user_id !== userId) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }
    }

    // Perform update
    const updated = await UserModel.update(userId, updateData);

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("[updateUser] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
});

/**
 * @desc    Get user statistics
 * @route   GET /api/v1/users/:userId/stats
 * @access  Private
 */
const getUserStats = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const stats = await UserModel.getUserStats(userId);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("[getUserStats] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user stats",
    });
  }
});

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0 } = req.query;

  try {
    const users = await UserModel.getAll(parseInt(limit), parseInt(offset));

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: users.length,
      },
    });
  } catch (error) {
    console.error("[getAllUsers] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

/**
 * @desc    Get users by county
 * @route   GET /api/v1/users/county/:county
 * @access  Public
 */

const getUsersByCountyCount = asyncHandler(async (req, res) => {
  // read county from query param
  const { county } = req.query;

  if (!county) {
    return res.status(400).json({
      success: false,
      message: "County is required",
    });
  }

  if (!UserModel.isValidCounty(county)) {
    return res.status(400).json({
      success: false,
      message: "Invalid county name",
    });
  }

  const totalUsers = await UserModel.getCountByCounty(county);

  return res.status(200).json({
    success: true,
    county,
    count: totalUsers,
  });
});

//  get  all users   count by e cah county

const getAllUserCountsByCounty = asyncHandler(async (req, res) => {
  const counts = await UserModel.getUserCountsByCounty();

  return res.status(200).json({
    success: true,
    data: counts,
    totalCounties: counts.length,
  });
});

/**
 * @desc    Get demographic statistics
 * @route   GET /api/v1/users/stats/demographics
 * @access  Public
 */
const getDemographicStats = asyncHandler(async (req, res) => {
  try {
    const stats = await UserModel.getDemographicStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("[getDemographicStats] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch demographic stats",
    });
  }
});

module.exports = {
  createUser,
  getUserById,
  updateUser,
  getUserStats,
  getAllUsers,
  getUsersByCountyCount,
  getDemographicStats,
  getAllUserCountsByCounty,
};
