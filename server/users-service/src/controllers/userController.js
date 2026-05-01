// controllers/userController.js - Fixed (added missing catch blocks)

const asyncHandler = require("express-async-handler");
const {
  UserModel,
  ROLES,
  VALID_ROLES,
  ROLE_HIERARCHY,
} = require("../models/userModel");

const { safeQuery, safeQueryOne } = require("../configurations/db");
const crypto = require("crypto");
const Logger = require("../utils/logger/logger");

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

// Generate a random username
const generateRandomUsername = () => {
  const adjectives = [
    "Brave",
    "Clever",
    "Wise",
    "Swift",
    "Bold",
    "Calm",
    "Eager",
    "Fair",
    "Good",
    "Kind",
    "Neat",
    "Real",
    "True",
    "Warm",
    "Deep",
    "Pure",
  ];
  const nouns = [
    "Citizen",
    "Voter",
    "Leader",
    "Change",
    "Voice",
    "Hope",
    "Unity",
    "Peace",
    "Power",
    "Dream",
    "Future",
    "Action",
    "Spirit",
    "Vision",
  ];
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `${randomAdj}${randomNoun}${randomNum}`;
};

// Generate crypto-secure username
const generateSecureUsername = () => {
  const prefix = "KE";
  const randomBytes = crypto.randomBytes(6).toString("hex").toUpperCase();
  return `${prefix}_${randomBytes}`;
};

const generateUsernameFromName = (realName) => {
  if (!realName) return generateRandomUsername();

  const cleanName = realName.toLowerCase().replace(/[^a-z]/g, "");

  const namePart = cleanName.substring(0, 5);

  const randomNum = Math.floor(Math.random() * 9999) + 1;

  return `${namePart}${randomNum}`;
};

// Main createUser function
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
    phone_number,
    constituency,
    role,
  } = req.body;

    Logger.info(`[Registration] Starting registration for: ${personal_email || "no-email"}`);

    if (!real_name || !password) {
      Logger.warn("[Registration] Missing required fields: real_name or password");
      return res.status(400).json({
        success: false,
        message: "Real name and password are required",
      });
    }

    if (!UserModel.isValidRealName(real_name)) {
      Logger.warn(`[Registration] Invalid real name format: ${real_name}`);
      return res.status(400).json({
        success: false,
        message: "Invalid name format. Please use only letters, spaces, hyphens, dots, and apostrophes.",
      });
    }

  if (real_name.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: "Real name must be at least 3 characters",
    });
  }

  // Validate role if provided (must be a valid role)
  let userRole = "user"; // Default role
  if (role) {
    if (!UserModel.isValidRole(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: user, admin, market_admin, administrator`,
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
      Logger.warn(`[Registration] Email already registered: ${personal_email}`);
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
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

  // Validate county if provided
  if (county && !UserModel.isValidCounty(county)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid county name" });
  }

  // Validate age bracket if provided
  if (age_bracket && !UserModel.isValidAgeBracket(age_bracket)) {
    return res.status(400).json({
      success: false,
      message: "Invalid age bracket. Must be: 18-30, 31-40, 41-50, 51-60, 61+",
    });
  }

  try {
    // SMART USERNAME GENERATION
    let finalUsername = username;
    let usernameGenerated = false;

    if (!finalUsername || finalUsername.trim() === "") {
      finalUsername = generateUsernameFromName(real_name);
      usernameGenerated = true;

      let existingUser = await UserModel.findByUsername(finalUsername);
      let attempt = 0;
      const maxAttempts = 5;

      while (existingUser && attempt < maxAttempts) {
        const randomSuffix = Math.floor(Math.random() * 9999) + 1;
        finalUsername = `${generateUsernameFromName(real_name)}${randomSuffix}`;
        existingUser = await UserModel.findByUsername(finalUsername);
        attempt++;
      }

      if (existingUser) {
        finalUsername = generateSecureUsername();
        existingUser = await UserModel.findByUsername(finalUsername);
        if (existingUser) {
          finalUsername = `${generateSecureUsername()}_${Date.now()}`;
        }
      }
    } else {
      const existingUser = await UserModel.findByUsername(finalUsername);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already taken. Please choose another one.",
        });
      }
    }

    const generation = age_bracket ? UserModel.getGenerationLabel(age_bracket) : null;
    const password_hash = await UserModel.hashPassword(password);

    const voterCardInt = voter_card === "Yes" ? 1 : 0;
    const willVoteVal = will_vote === "Yes" ? 1 : will_vote === "No" ? 0 : 2;

    const user_id = await UserModel.create({
      real_name: real_name.trim(),
      anonymous_username: finalUsername,
      gender: (gender === "Prefer not to say" || !gender) ? null : gender,
      age_bracket: (age_bracket === "Prefer not to say" || !age_bracket) ? null : age_bracket,
      generation,
      county: (county === "Nairobi" || !county) ? "Nairobi" : county,
      ward: ward || null,
      voter_card: voterCardInt,
      will_vote: willVoteVal,
      password_hash,
      role: userRole,
      political_party: political_party || "Undecided",
      employment_status: employment_status || "Prefer not to say",
      political_leanings: political_leanings || "Prefer not to say",
      vote_frequency: vote_frequency || "Prefer not to say",
      personal_email: personal_email || null,
      phone_number: phone_number || null,
      constituency: constituency || null,
    });

    Logger.info(`[Registration] User created successfully: ${user_id} (${finalUsername})`);

    // ADD WELCOME BONUS: 100 points to wallet
    let welcomeBonusAdded = false;
    try {
      const { db } = require("../../../global/index");

      await db.safeQuery("START TRANSACTION");

      const existingWallet = await db.safeQuery(
        "SELECT * FROM user_wallets WHERE user_id = ?",
        [user_id],
      );

      if (!existingWallet || existingWallet.length === 0) {
        await db.safeQuery(
          `INSERT INTO user_wallets (user_id, balance, total_deposited, total_bonus, created_at, updated_at) 
           VALUES (?, 100, 0, 100, NOW(), NOW())`,
          [user_id],
        );
      } else {
        await db.safeQuery(
          `UPDATE user_wallets 
           SET balance = balance + 100, 
               total_bonus = total_bonus + 100, 
               updated_at = NOW() 
           WHERE user_id = ?`,
          [user_id],
        );
      }

      const transactionId = `WELCOME-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      await db.safeQuery(
        `INSERT INTO wallet_transactions 
         (transaction_id, user_id, amount, type, description, status, completed_at, created_at)
         VALUES (?, ?, 100, 'bonus', 'Welcome bonus for new user registration', 'completed', NOW(), NOW())`,
        [transactionId, user_id],
      );

      await db.safeQuery("COMMIT");
      welcomeBonusAdded = true;
    } catch (walletError) {
      try {
        const { db } = require("../../../global/index");
        await db.safeQuery("ROLLBACK");
      } catch (rollbackError) {
        // Ignore rollback error
      }
      Logger.error(`[Welcome Bonus Failed] User ${user_id}:`, { error: walletError.message });
    }

    return res.status(201).json({
      success: true,
      message: welcomeBonusAdded
        ? `User created successfully! Username: ${finalUsername}. 100 welcome points added to your wallet.`
        : `User created successfully! Username: ${finalUsername}. Welcome bonus failed. Please contact support.`,
      data: {
        user_id,
        username: finalUsername,
        username_auto_generated: usernameGenerated,
        real_name: real_name.trim(),
        role: userRole,
        welcome_bonus: welcomeBonusAdded ? 100 : 0,
      },
    });
  } catch (error) {
    Logger.error("[Registration] Critical failure:", {
      message: error.message,
      stack: error.stack,
      body: { ...req.body, password: "[REDACTED]" }
    });
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create user account. Please try again.",
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
      will_vote: user.will_vote === 1 ? true : user.will_vote === 0 ? false : null,
      political_party: user.political_party,
      employment_status: user.employment_status,
      political_leanings: user.political_leanings,
      vote_frequency: user.vote_frequency,
      personal_email: user.personal_email ? maskEmail(user.personal_email) : null,
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
    phone_number,
    constituency,
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
      updateData.will_vote = will_vote === "Yes" ? 1 : will_vote === "No" ? 0 : 2;
    if (political_leanings) updateData.political_leanings = political_leanings;
    if (vote_frequency) updateData.vote_frequency = vote_frequency;
    if (personal_email) updateData.personal_email = personal_email;
    if (phone_number) updateData.phone_number = phone_number;
    if (constituency) updateData.constituency = constituency;

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

  if (!authenticatedUser || !authenticatedUser.user_id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const currentUser = await UserModel.findById(authenticatedUser.user_id);
    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "Current user not found" });
    }

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
    const totalResult = await safeQueryOne("SELECT COUNT(*) as total FROM users");
    const totalUsers = totalResult?.total || 0;

    if (totalUsers === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalUsers: 0,
          newUsersThisMonth: 0,
          activeUsers: 0,
          gender: { male: 0, female: 0, other: 0 },
          ageBrackets: {},
          voterCard: { yes: 0, no: 0 },
          willVote: { yes: 0, no: 0, notSure: 0 },
          employment: {},
          politicalLeanings: {},
          voteFrequency: {},
          politicalParties: [],
          roles: [],
          monthlyTrend: [],
          verification: [],
          lastUpdated: new Date().toISOString(),
        },
      });
    }

    // Gender distribution
    const genderStats = await safeQuery(
      `SELECT gender, COUNT(*) as count, ROUND((COUNT(*) / ?) * 100, 2) as percentage
       FROM users WHERE gender IS NOT NULL GROUP BY gender`,
      [totalUsers],
    );

    // Age bracket distribution
    const ageStats = await safeQuery(
      `SELECT age_bracket, COUNT(*) as count, ROUND((COUNT(*) / ?) * 100, 2) as percentage
       FROM users WHERE age_bracket IS NOT NULL GROUP BY age_bracket
       ORDER BY FIELD(age_bracket, '18-30', '31-40', '41-50', '51-60', '61+')`,
      [totalUsers],
    );

    // Generation distribution
    const generationStats = await safeQuery(
      `SELECT generation, COUNT(*) as count, ROUND((COUNT(*) / ?) * 100, 2) as percentage
       FROM users WHERE generation IS NOT NULL GROUP BY generation`,
      [totalUsers],
    );

    // Voter card status
    const voterCardStats = await safeQuery(
      `SELECT CASE WHEN voter_card = 1 THEN 'Yes' WHEN voter_card = 0 THEN 'No' ELSE 'Not specified' END as status,
              COUNT(*) as count, ROUND((COUNT(*) / ?) * 100, 2) as percentage
       FROM users GROUP BY voter_card`,
      [totalUsers],
    );

    // Voting intention
    const votingIntentionStats = await safeQuery(
      `SELECT CASE WHEN will_vote = 1 THEN 'Will Vote' WHEN will_vote = 0 THEN 'Will Not Vote'
              WHEN will_vote = 2 THEN 'Not Sure' ELSE 'Not specified' END as intention,
              COUNT(*) as count, ROUND((COUNT(*) / ?) * 100, 2) as percentage
       FROM users GROUP BY will_vote`,
      [totalUsers],
    );

    // Employment status
    const employmentStats = await safeQuery(
      `SELECT employment_status, COUNT(*) as count, ROUND((COUNT(*) / ?) * 100, 2) as percentage
       FROM users WHERE employment_status IS NOT NULL GROUP BY employment_status ORDER BY count DESC`,
      [totalUsers],
    );

    // Political leanings
    const politicalLeaningsStats = await safeQuery(
      `SELECT political_leanings, COUNT(*) as count, ROUND((COUNT(*) / ?) * 100, 2) as percentage
       FROM users WHERE political_leanings IS NOT NULL GROUP BY political_leanings`,
      [totalUsers],
    );

    // Vote frequency
    const voteFrequencyStats = await safeQuery(
      `SELECT vote_frequency, COUNT(*) as count, ROUND((COUNT(*) / ?) * 100, 2) as percentage
       FROM users WHERE vote_frequency IS NOT NULL GROUP BY vote_frequency`,
      [totalUsers],
    );

    // Political party
    const partyStats = await safeQuery(
      `SELECT political_party, COUNT(*) as count, ROUND((COUNT(*) / ?) * 100, 2) as percentage
       FROM users WHERE political_party IS NOT NULL GROUP BY political_party ORDER BY count DESC LIMIT 10`,
      [totalUsers],
    );

    // Role distribution
    const roleStats = await safeQuery(
      `SELECT role, COUNT(*) as count, ROUND((COUNT(*) / ?) * 100, 2) as percentage
       FROM users GROUP BY role`,
      [totalUsers],
    );

    // Monthly trend
    const monthlyTrend = await safeQuery(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as new_users
      FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month DESC
    `);

    // Verification stats
    const verificationStats = await safeQuery(
      `SELECT CASE WHEN is_verified = 1 THEN 'Verified' ELSE 'Not Verified' END as status,
              COUNT(*) as count, ROUND((COUNT(*) / ?) * 100, 2) as percentage
       FROM users GROUP BY is_verified`,
      [totalUsers],
    );

    const gender = { male: 0, female: 0, other: 0 };
    if (genderStats && genderStats.length) {
      genderStats.forEach((g) => {
        if (g.gender === "Male") gender.male = parseInt(g.count);
        if (g.gender === "Female") gender.female = parseInt(g.count);
        if (g.gender === "Other") gender.other = parseInt(g.count);
      });
    }

    const ageBrackets = {};
    if (ageStats && ageStats.length) {
      ageStats.forEach((a) => {
        ageBrackets[a.age_bracket] = parseInt(a.count);
      });
    }

    const voterCard = { yes: 0, no: 0 };
    if (voterCardStats && voterCardStats.length) {
      voterCardStats.forEach((v) => {
        if (v.status === "Yes") voterCard.yes = parseInt(v.count);
        if (v.status === "No") voterCard.no = parseInt(v.count);
      });
    }

    const willVote = { yes: 0, no: 0, notSure: 0 };
    if (votingIntentionStats && votingIntentionStats.length) {
      votingIntentionStats.forEach((v) => {
        if (v.intention === "Will Vote") willVote.yes = parseInt(v.count);
        if (v.intention === "Will Not Vote") willVote.no = parseInt(v.count);
        if (v.intention === "Not Sure") willVote.notSure = parseInt(v.count);
      });
    }

    const employment = {};
    if (employmentStats && employmentStats.length) {
      employmentStats.forEach((e) => {
        employment[e.employment_status] = parseInt(e.count);
      });
    }

    const politicalLeanings = {};
    if (politicalLeaningsStats && politicalLeaningsStats.length) {
      politicalLeaningsStats.forEach((p) => {
        politicalLeanings[p.political_leanings] = parseInt(p.count);
      });
    }

    const voteFrequency = {};
    if (voteFrequencyStats && voteFrequencyStats.length) {
      voteFrequencyStats.forEach((v) => {
        voteFrequency[v.vote_frequency] = parseInt(v.count);
      });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonthResult = await safeQueryOne(
      "SELECT COUNT(*) as count FROM users WHERE created_at >= ?",
      [startOfMonth],
    );
    const newUsersThisMonth = newThisMonthResult?.count || 0;

    const activeUsersResult = await safeQueryOne(
      "SELECT COUNT(*) as count FROM users WHERE is_verified = 1",
    );
    const activeUsers = activeUsersResult?.count || 0;

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        newUsersThisMonth,
        activeUsers,
        gender,
        ageBrackets,
        generation: generationStats || [],
        voterCard,
        willVote,
        employment,
        politicalLeanings,
        voteFrequency,
        politicalParties: partyStats || [],
        roles: roleStats || [],
        monthlyTrend: monthlyTrend || [],
        verification: verificationStats || [],
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[getAnalytics] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
});

// ============================================
// GET COUNTY STATS - FIXED with proper try-catch
// ============================================
const getCountyStats = asyncHandler(async (req, res) => {
  try {
    const totalResult = await safeQueryOne(
      "SELECT COUNT(*) as total FROM users WHERE status = 'active' OR status IS NULL"
    );
    const totalUsers = totalResult?.total || 0;

    if (totalUsers === 0) {
      return res.status(200).json({
        success: true,
        data: {
          countyStats: [],
          topCounties: [],
          countiesWithVoters: [],
          totalUsers: 0,
          lastUpdated: new Date().toISOString(),
        },
      });
    }

    const countyStats = await safeQuery(
      `SELECT county, COUNT(*) as total_users, ROUND((COUNT(*) / ?) * 100, 2) as percentage
       FROM users WHERE county IS NOT NULL AND county != '' AND (status = 'active' OR status IS NULL)
       GROUP BY county ORDER BY total_users DESC`,
      [totalUsers],
    );

    const topCounties = countyStats && countyStats.length > 0 ? countyStats.slice(0, 10) : [];

    const countiesWithVoters = await safeQuery(`
      SELECT county, SUM(CASE WHEN voter_card = 1 THEN 1 ELSE 0 END) as voters_with_card,
             COUNT(*) as total, ROUND((SUM(CASE WHEN voter_card = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as voter_percentage
      FROM users WHERE county IS NOT NULL AND county != '' AND (status = 'active' OR status IS NULL)
      GROUP BY county HAVING voters_with_card > 0 ORDER BY voters_with_card DESC LIMIT 10
    `);

    const formattedCountyStats = countyStats && countyStats.length > 0
      ? countyStats.map((c) => ({
          county: c.county,
          total_users: parseInt(c.total_users) || 0,
          percentage: parseFloat(c.percentage) || 0,
        }))
      : [];

    const formattedTopCounties = topCounties.map((c) => ({
      county: c.county,
      total_users: parseInt(c.total_users) || 0,
      percentage: parseFloat(c.percentage) || 0,
    }));

    const formattedCountiesWithVoters = countiesWithVoters && countiesWithVoters.length > 0
      ? countiesWithVoters.map((c) => ({
          county: c.county,
          voters_with_card: parseInt(c.voters_with_card) || 0,
          total: parseInt(c.total) || 0,
          voter_percentage: parseFloat(c.voter_percentage) || 0,
        }))
      : [];

    return res.status(200).json({
      success: true,
      data: {
        countyStats: formattedCountyStats,
        topCounties: formattedTopCounties,
        countiesWithVoters: formattedCountiesWithVoters,
        totalUsers: parseInt(totalUsers),
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

// ============================================
// TRACK APP INSTALL (PWA)
// ============================================
const trackAppInstall = asyncHandler(async (req, res) => {
  try {
    const { user_id } = req.body;

    const existing = await safeQueryOne(
      `SELECT id FROM app_stats WHERE stat_key = 'install_count' LIMIT 1`
    );

    if (!existing) {
      await safeQuery(
        `INSERT INTO app_stats (stat_key, stat_value, updated_at) VALUES ('install_count', 1, NOW())`
      );
    } else {
      await safeQuery(
        `UPDATE app_stats SET stat_value = stat_value + 1, updated_at = NOW() WHERE stat_key = 'install_count'`
      );
    }

    if (user_id) {
      try {
        await safeQuery(
          `INSERT IGNORE INTO app_installs (user_id, installed_at) VALUES (?, NOW())`,
          [user_id]
        );
      } catch (e) {
        // table may not exist yet
      }
    }

    const count = await safeQueryOne(
      `SELECT stat_value FROM app_stats WHERE stat_key = 'install_count'`
    );

    res.status(200).json({
      success: true,
      message: "Install tracked successfully",
      data: { install_count: count?.stat_value || 1 }
    });
  } catch (error) {
    console.error("[trackAppInstall] Error:", error);
    res.status(500).json({ success: false, message: "Failed to track install" });
  }
});

// ============================================
// GET INSTALL COUNT
// ============================================
const getInstallCount = asyncHandler(async (req, res) => {
  try {
    const count = await safeQueryOne(
      `SELECT stat_value FROM app_stats WHERE stat_key = 'install_count'`
    );

    res.status(200).json({
      success: true,
      data: { install_count: count?.stat_value || 0 }
    });
  } catch (error) {
    console.error("[getInstallCount] Error:", error);
    res.status(200).json({ success: true, data: { install_count: 0 } });
  }
});

// ============================================
// EXPORTS
// ============================================
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
  trackAppInstall,
  getInstallCount,
};