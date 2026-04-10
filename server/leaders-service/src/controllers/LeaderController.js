// controllers/leaderController.js - Clean Version

const Logger = require("../utils/logger/logger");
const LeaderModel = require("../models/LeadersModel");
const {
  asyncHandler,
  bcrypt,
  jwt,
  crypto,
  redis,
  db: { safeQuery, safeQueryOne },
  utils: { getKenyaTimeISO },
} = require("../../../global/index");

const LeaderService = require("../services/leadersService");
const {
  connectRabbitMQ,
  consumeMessages,
  QUEUES,
  publishMessage,
} = require("../Qeues/rabbit");

const memoryCache = new Map();

// ============================================
// QUEUE WORKERS
// ============================================

const startLeaderWorkers = async () => {
  try {
    await connectRabbitMQ();

    consumeMessages(QUEUES.LEADER_IMAGE_UPLOAD, async (msg) => {
      const { leaderId, imageBuffer, imageMeta, now } = msg;
      try {
        const fs = require("fs");
        const path = require("path");
        const sharp = require("sharp");
        const UPLOAD_DIR = path.join(__dirname, "../../uploads/leaders");
        
        if (!fs.existsSync(UPLOAD_DIR)) {
          fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }

        const leaderDir = path.join(UPLOAD_DIR, leaderId);
        if (!fs.existsSync(leaderDir)) {
          fs.mkdirSync(leaderDir, { recursive: true });
        }

        const buffer = Buffer.from(imageBuffer, "base64");
        const baseName = `${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
        
        const originalFileName = `${baseName}_original.webp`;
        const thumbFileName = `${baseName}_thumb.webp`;
        const mediumFileName = `${baseName}_medium.webp`;
        const largeFileName = `${baseName}_large.webp`;

        await sharp(buffer)
          .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(path.join(leaderDir, originalFileName));

        await sharp(buffer)
          .resize(800, 800, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(path.join(leaderDir, largeFileName));

        await sharp(buffer)
          .resize(400, 400, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(path.join(leaderDir, mediumFileName));

        await sharp(buffer)
          .resize(150, 150, { fit: "cover", position: "attention" })
          .webp({ quality: 75 })
          .toFile(path.join(leaderDir, thumbFileName));

        const imageUrl = `/uploads/leaders/${leaderId}/${originalFileName}`;
        const thumbnailUrl = `/uploads/leaders/${leaderId}/${thumbFileName}`;
        const mediumUrl = `/uploads/leaders/${leaderId}/${mediumFileName}`;
        const socialUrl = `/uploads/leaders/${leaderId}/${largeFileName}`;

        const metadata = await sharp(buffer).metadata();
        const imageId = `IMG_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
        
        await safeQuery(
          `INSERT INTO leader_images (
            image_id, leader_id, image_url, public_id,
            is_primary, sort_order, width, height, format, bytes,
            thumbnail_url, medium_url, social_url, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            imageId, leaderId, imageUrl, `${leaderId}/${baseName}`,
            1, 0, metadata.width || null, metadata.height || null,
            "webp", imageMeta.size || null, thumbnailUrl, mediumUrl, socialUrl, now
          ]
        );

        await safeQuery(`UPDATE leaders SET image_url = ? WHERE leader_id = ?`, [imageUrl, leaderId]);
        Logger.info(`[QUEUE] Image uploaded for leader ${leaderId}`);
      } catch (err) {
        Logger.error(`[QUEUE] Image upload failed:`, err);
      }
    });

    consumeMessages(QUEUES.LEADER_CACHE_CLEAR, async (msg) => {
      const { leaderId, county, constituency, ward } = msg;
      try {
        const keys = [
          `leader:${leaderId}`, "global:all_leaders", "leaders:most_boosted",
          county && `county:${county}:leaders`,
          constituency && `constituency:${constituency}:leaders`,
          ward && `ward:${ward}:leaders`, `personalized_feed:*`
        ].filter(Boolean);
        await Promise.all(keys.map((k) => redis.del(k)));
      } catch (err) {
        Logger.error("[QUEUE] Cache clear failed:", err);
      }
    });

    consumeMessages(QUEUES.LEADER_BOOST_STATS, async (msg) => {
      const { leaderId, boostAmount } = msg;
      try {
        await safeQuery(
          `UPDATE leaders SET boost_count = COALESCE(boost_count, 0) + 1,
           total_boost_amount = COALESCE(total_boost_amount, 0) + ?,
           boost_score = COALESCE(boost_score, 0) + ?, updated_at = NOW()
           WHERE leader_id = ?`,
          [boostAmount, boostAmount, leaderId]
        );
      } catch (err) {
        Logger.error("[QUEUE] Boost stats update failed:", err);
      }
    });

    Logger.info("✅ Leader RabbitMQ workers started");
  } catch (err) {
    Logger.error("Failed to start leader workers:", err);
  }
};

// ============================================
// CREATE LEADER (Admin)
// ============================================
const createLeader = async (req, res) => {
  try {
    const leader = await LeaderService.createLeader(
      req.body, req.files, redis, Logger, getKenyaTimeISO
    );
    publishMessage(QUEUES.LEADER_CACHE_CLEAR, { leaderId: leader.leader_id, county: leader.county }).catch(() => {});
    res.status(201).json({ success: true, message: "Leader registered successfully", leader });
  } catch (error) {
    Logger.error("Create leader error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ============================================
// GET LEADER BY ID
// ============================================
const getLeaderById = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  if (!leaderId) {
    return res.status(400).json({ success: false, message: "Leader ID is required" });
  }

  const safeLeaderId = String(leaderId).trim();
  const cacheKey = `leader:${safeLeaderId}`;

  try {
    let cached = null;
    try {
      cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
    } catch (redisErr) {
      Logger.warn(`Redis get failed: ${redisErr.message}`);
    }

    const leader = await safeQueryOne(
      `SELECT l.leader_id, l.name, l.email, l.phone, l.party, l.slogan, l.motto,
        l.position, l.position_running_for, l.county, l.constituency, l.ward,
        l.location, l.education, l.experience, l.tags,
        COALESCE(l.image_url, li.image_url) as image_url,
        l.verification, l.views, l.boost_score, l.total_boost_amount,
        l.followers, l.status, l.created_at, l.updated_at
      FROM leaders l
      LEFT JOIN leader_images li ON l.leader_id = li.leader_id AND li.is_primary = 1
      WHERE l.leader_id = ? AND l.status != 'deleted'`,
      [safeLeaderId]
    );

    if (!leader) {
      return res.status(404).json({ success: false, message: "Leader not found" });
    }

    const images = await safeQuery(
      `SELECT image_id, image_url, thumbnail_url, medium_url, social_url, is_primary, sort_order
       FROM leader_images WHERE leader_id = ? ORDER BY is_primary DESC, sort_order ASC`,
      [safeLeaderId]
    );

    const endorsements = await safeQueryOne(`SELECT COUNT(*) as count FROM endorsements WHERE leader_id = ? AND status = 'active'`, [safeLeaderId]);
    const followers = await safeQueryOne(`SELECT COUNT(*) as count FROM leader_followers WHERE leader_id = ?`, [safeLeaderId]);
    const boosts = await safeQueryOne(`SELECT COUNT(*) as count, SUM(amount) as total_amount FROM leaders_boosts WHERE leader_id = ?`, [safeLeaderId]);
    const socialLinks = await safeQuery(`SELECT id, type, url FROM leader_portfolio WHERE leader_id = ?`, [safeLeaderId]);

    const imageBaseUrl = process.env.IMAGE_BASE_URL || `http://localhost:${process.env.PORT || 8002}`;
    const formatImageUrl = (url) => url ? (url.startsWith('http') ? url : `${imageBaseUrl}${url}`) : null;

    const responseData = {
      success: true,
      data: {
        ...leader,
        image_url: formatImageUrl(leader.image_url),
        images: images.map(img => ({
          ...img,
          image_url: formatImageUrl(img.image_url),
          thumbnail_url: formatImageUrl(img.thumbnail_url),
          medium_url: formatImageUrl(img.medium_url),
          social_url: formatImageUrl(img.social_url)
        })),
        stats: {
          endorsements: endorsements?.count || 0,
          followers: followers?.count || 0,
          views: leader.views || 0,
          boost_score: leader.boost_score || 0,
          boost_count: boosts?.count || 0,
          total_boost_amount: boosts?.total_amount || 0
        },
        social_links: socialLinks
      }
    };

    try {
      await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 300);
    } catch (redisErr) {
      Logger.warn(`Redis set failed: ${redisErr.message}`);
    }

    res.status(200).json(responseData);
  } catch (error) {
    Logger.error(`[GET LEADER] Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ============================================
// REGISTER ASPIRANT
// ============================================
const registerAspirant = asyncHandler(async (req, res) => {
  try {
    const { name, password, email, party, slogan, position, county, constituency, ward, experience, education } = req.body;
    const image = req.file;

    if (!name) return res.status(400).json({ success: false, message: "Name is required" });
    if (!password) return res.status(400).json({ success: false, message: "Password is required" });
    if (password.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    if (!position) return res.status(400).json({ success: false, message: "Position is required" });
    if (!county) return res.status(400).json({ success: false, message: "County is required" });
    if (!image) return res.status(400).json({ success: false, message: "Profile image is required" });

    const existingName = await safeQueryOne(`SELECT leader_id FROM leaders WHERE name = ? AND status != 'deleted'`, [name]);
    if (existingName) return res.status(400).json({ success: false, message: "Name already registered" });

    if (email) {
      const existingEmail = await LeaderModel.findByEmail(email);
      if (existingEmail) return res.status(400).json({ success: false, message: "Email already registered" });
    }

    let parsedExperience = [], parsedEducation = [];
    try {
      if (experience) parsedExperience = typeof experience === "string" ? JSON.parse(experience) : experience;
      if (education) parsedEducation = typeof education === "string" ? JSON.parse(education) : education;
    } catch (e) {}

    const leaderId = `LDR_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const now = getKenyaTimeISO();
    const password_hash = await bcrypt.hash(password, 10);

    await safeQuery(
      `INSERT INTO leaders (
        leader_id, name, email, password_hash, party, slogan,
        position, position_running_for, county, constituency, ward,
        education, experience, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [leaderId, name, email || null, password_hash, party || null, slogan || null,
       position, position, county, constituency || null, ward || null,
       parsedEducation.length > 0 ? JSON.stringify(parsedEducation) : null,
       parsedExperience.length > 0 ? JSON.stringify(parsedExperience) : null,
       "active", now, now]
    );

    let imageUrl = null, thumbnailUrl = null;
    try {
      const fs = require("fs"), path = require("path"), sharp = require("sharp");
      const UPLOAD_DIR = path.join(__dirname, "../../uploads/leaders");
      if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      const leaderDir = path.join(UPLOAD_DIR, leaderId);
      if (!fs.existsSync(leaderDir)) fs.mkdirSync(leaderDir, { recursive: true });

      const buffer = image.buffer;
      const baseName = `${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      const originalFileName = `${baseName}_original.webp`;
      const thumbFileName = `${baseName}_thumb.webp`;

      await sharp(buffer).resize(1200, 1200, { fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toFile(path.join(leaderDir, originalFileName));
      await sharp(buffer).resize(150, 150, { fit: "cover", position: "attention" }).webp({ quality: 75 }).toFile(path.join(leaderDir, thumbFileName));

      imageUrl = `/uploads/leaders/${leaderId}/${originalFileName}`;
      thumbnailUrl = `/uploads/leaders/${leaderId}/${thumbFileName}`;
      const metadata = await sharp(buffer).metadata();
      const imageId = `IMG_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

      await safeQuery(
        `INSERT INTO leader_images (image_id, leader_id, image_url, public_id, is_primary, sort_order, width, height, format, bytes, thumbnail_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [imageId, leaderId, imageUrl, `${leaderId}/${baseName}`, 1, 0, metadata.width, metadata.height, "webp", image.size, thumbnailUrl, now]
      );

      await safeQuery(`UPDATE leaders SET image_url = ? WHERE leader_id = ?`, [imageUrl, leaderId]);
    } catch (imgError) {
      console.error("Image processing error:", imgError);
    }

    // Clear caches
    try {
      await redis.del('leaders:featured:10');
      await redis.del('leaders:popular');
      await redis.del('global:all_leaders');
    } catch (cacheErr) {}

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      data: { leader_id: leaderId, name, email: email || null, position, county, status: "active", image_url: imageUrl }
    });
  } catch (error) {
    Logger.error("Register aspirant error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to register" });
  }
});

// ============================================
// LOGIN ASPIRANT
// ============================================
const loginAspirant = asyncHandler(async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) return res.status(400).json({ success: false, message: "Name and password required" });

    const normalizedInput = name.trim().toLowerCase();
    const leader = await safeQueryOne(
      `SELECT leader_id, name, email, password_hash, party, slogan, position, county, constituency, ward, image_url, status, verification
       FROM leaders WHERE status != 'deleted' AND (LOWER(name) = ? OR LOWER(email) = ?)`,
      [normalizedInput, normalizedInput]
    );

    if (!leader) return res.status(401).json({ success: false, message: "Invalid credentials" });
    if (leader.status !== "active") return res.status(401).json({ success: false, message: "Account not active" });

    const isValid = await bcrypt.compare(password, leader.password_hash);
    if (!isValid) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { leaderId: leader.leader_id, name: leader.name, email: leader.email, role: "aspirant" },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    const { password_hash, ...leaderData } = leader;
    res.status(200).json({ success: true, message: "Login successful", data: { token, leader: leaderData } });
  } catch (error) {
    Logger.error("Login error:", error);
    res.status(500).json({ success: false, message: "Failed to login" });
  }
});

// ============================================
// GET MY PROFILE
// ============================================
const getMyProfile = asyncHandler(async (req, res) => {
  try {
    const leader = await LeaderModel.getById(req.user.leaderId);
    if (!leader) return res.status(404).json({ success: false, message: "Leader not found" });
    res.status(200).json({ success: true, data: leader });
  } catch (error) {
    Logger.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
});

// ============================================
// UPDATE MY PROFILE
// ============================================
const updateMyProfile = asyncHandler(async (req, res) => {
  try {
    await LeaderModel.updateProfile(req.user.leaderId, req.body);
    publishMessage(QUEUES.LEADER_CACHE_CLEAR, { leaderId: req.user.leaderId }).catch(() => {});
    res.status(200).json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    Logger.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
});

// ============================================
// UPDATE LEADER (Admin)
// ============================================
const updateLeader = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  if (!leaderId) return res.status(400).json({ success: false, message: "Leader ID required" });

  try {
    const existingLeader = await LeaderModel.getById(leaderId);
    if (!existingLeader) return res.status(404).json({ success: false, message: "Leader not found" });

    await LeaderModel.update(leaderId, req.body);
    publishMessage(QUEUES.LEADER_CACHE_CLEAR, { leaderId, county: existingLeader.county }).catch(() => {});
    res.status(200).json({ success: true, message: "Leader updated successfully" });
  } catch (error) {
    Logger.error("Update leader error:", error);
    res.status(500).json({ success: false, message: "Error updating leader" });
  }
});

// ============================================
// GET POPULAR LEADERS
// ============================================
const getPopularLeaders = asyncHandler(async (req, res) => {
  try {
    const leaders = await safeQuery(
      `SELECT l.leader_id, l.name, l.party, l.position, l.county, COALESCE(l.image_url, li.image_url) as image_url,
        l.verification, l.views, l.boost_score, l.followers
       FROM leaders l LEFT JOIN leader_images li ON l.leader_id = li.leader_id AND li.is_primary = 1
       WHERE l.status = 'active'
       ORDER BY l.boost_score DESC, l.views DESC LIMIT 20`,
      []
    );
    res.status(200).json({ success: true, data: leaders });
  } catch (error) {
    Logger.error("Get popular leaders error:", error);
    res.status(200).json({ success: true, data: [] });
  }
});

// ============================================
// BOOST LEADER
// ============================================
const boostLeader = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const { user_id, amount } = req.body;
  const finalUserId = req.user?.user_id || user_id;
  const boostAmount = parseInt(amount) || 10;
  const allowedAmounts = [10, 50, 100, 500];

  if (!leaderId || !finalUserId) return res.status(400).json({ success: false, message: "Missing required fields" });
  if (!allowedAmounts.includes(boostAmount)) return res.status(400).json({ success: false, message: "Invalid boost amount" });

  try {
    await safeQuery("START TRANSACTION");

    const wallet = await safeQueryOne(`SELECT balance FROM user_wallets WHERE user_id = ? FOR UPDATE`, [finalUserId]);
    if (!wallet || wallet.balance < boostAmount) {
      await safeQuery("ROLLBACK");
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    await safeQuery(`UPDATE user_wallets SET balance = balance - ? WHERE user_id = ?`, [boostAmount, finalUserId]);

    const transactionId = `BOOST-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    await safeQuery(
      `INSERT INTO wallet_transactions (transaction_id, user_id, amount, type, reference_id, description, status, completed_at)
       VALUES (?, ?, ?, 'endorsement', ?, ?, 'completed', NOW())`,
      [transactionId, finalUserId, boostAmount, leaderId, `Boost payment for leader ${leaderId}`]
    );

    await safeQuery(
      `UPDATE leaders SET boost_count = COALESCE(boost_count, 0) + 1,
       total_boost_amount = COALESCE(total_boost_amount, 0) + ?,
       boost_score = COALESCE(boost_score, 0) + ?, updated_at = NOW()
       WHERE leader_id = ?`,
      [boostAmount, boostAmount, leaderId]
    );

    await safeQuery("COMMIT");
    res.status(200).json({ success: true, message: `Successfully boosted with KES ${boostAmount}!` });
  } catch (error) {
    await safeQuery("ROLLBACK");
    Logger.error("Error boosting leader:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to boost leader" });
  }
});

// ============================================
// GET PERSONALIZED FEED
// ============================================

// ============================================
// GET PERSONALIZED FEED - Working Version
// ============================================
const getPersonalizedFeed = asyncHandler(async (req, res) => {
  try {
    // Get user context from query params
    const userCounty = req.query.county || req.query.user_county || req.user?.county || null;
    const userWard = req.query.ward || req.query.user_ward || req.user?.ward || null;
    const userConstituency = req.query.constituency || req.user?.constituency || null;
    const userParty = req.query.party || req.query.user_party || req.user?.political_party || null;
    const limit = parseInt(req.query.limit) || 100;

    console.log(`📊 Building personalized feed for:`, {
      county: userCounty,
      ward: userWard,
      constituency: userConstituency,
      party: userParty
    });

    // Get ALL active leaders
    const allActiveLeaders = await safeQuery(
      `SELECT 
        l.leader_id, 
        l.name, 
        l.party, 
        l.position, 
        l.position_running_for,
        l.slogan, 
        l.county, 
        l.constituency, 
        l.ward, 
        COALESCE(l.image_url, li.image_url) as image_url,
        l.verification, 
        l.views, 
        l.boost_score, 
        l.followers, 
        l.status, 
        l.created_at
      FROM leaders l
      LEFT JOIN leader_images li ON l.leader_id = li.leader_id AND li.is_primary = 1
      WHERE l.status = 'active'
      ORDER BY l.created_at DESC
      LIMIT ?`,
      [limit]
    );

    if (!allActiveLeaders || allActiveLeaders.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        userContext: { county: userCounty, ward: userWard, party: userParty },
        totalLeaders: 0
      });
    }

    // Calculate scores for each leader
    const leadersWithScores = allActiveLeaders.map((leader) => {
      try {
        const boost_score = leader.boost_score || 0;
        const views = leader.views || 0;
        const verification = leader.verification || 0;
        const created_at = leader.created_at;
        
        // Base metrics (0-60 points)
        const boostScore = Math.min((boost_score / 100) * 30, 30);
        const viewScore = Math.min(Math.log10(views + 1) * 10, 20);
        const verificationScore = verification === 1 ? 10 : 0;
        
        // Recency score (0-10 points)
        let recencyScore = 0;
        if (created_at) {
          const daysSinceCreation = (Date.now() - new Date(created_at).getTime()) / (1000 * 60 * 60 * 24);
          recencyScore = Math.max(0, 10 - (daysSinceCreation / 30) * 10);
        }
        
        // Personalization bonuses (0-40 points)
        let personalizationScore = 0;
        
        if (userCounty && leader.county && leader.county.toLowerCase() === userCounty.toLowerCase()) {
          personalizationScore += 25;
        }
        if (userWard && leader.ward && leader.ward.toLowerCase() === userWard.toLowerCase()) {
          personalizationScore += 35;
        }
        if (userConstituency && leader.constituency && leader.constituency.toLowerCase() === userConstituency.toLowerCase()) {
          personalizationScore += 20;
        }
        if (userParty && leader.party && leader.party.toLowerCase() === userParty.toLowerCase()) {
          personalizationScore += 15;
        }
        
        const totalScore = boostScore + viewScore + verificationScore + recencyScore + personalizationScore;
        
        return {
          ...leader,
          personalization_score: personalizationScore,
          score: Math.min(Math.round(totalScore), 100)
        };
      } catch (err) {
        return { ...leader, personalization_score: 0, score: 0 };
      }
    });

    // Sort by score descending
    leadersWithScores.sort((a, b) => b.score - a.score);

    // Separate presidential candidates
    const presidentialCandidates = leadersWithScores.filter(
      (l) => (l.position && l.position.toLowerCase() === "president") ||
             (l.position_running_for && l.position_running_for.toLowerCase() === "president")
    );

    // High match leaders (user's county, ward, or party)
    const highMatchLeaders = leadersWithScores.filter(l => 
      l.personalization_score >= 20 && 
      l.leader_id !== (presidentialCandidates[0]?.leader_id)
    );

    // Other leaders
    const otherLeaders = leadersWithScores.filter(l => 
      l.personalization_score < 20 && 
      l.leader_id !== (presidentialCandidates[0]?.leader_id) &&
      !highMatchLeaders.find(hm => hm.leader_id === l.leader_id)
    );

    // Build response groups
    const responseGroups = [];

    // 1. Presidential Candidates
    if (presidentialCandidates.length > 0) {
      responseGroups.push({
        id: "presidential",
        title: "🇰🇪 Presidential Candidates",
        subtitle: "National Leadership",
        type: "presidential",
        leaders: presidentialCandidates.slice(0, 10),
        count: presidentialCandidates.length,
        total: presidentialCandidates.length
      });
    }

    // 2. Your Local Leaders
    if (highMatchLeaders.length > 0) {
      const wardMatches = highMatchLeaders.filter(l => userWard && l.ward === userWard);
      const countyMatches = highMatchLeaders.filter(l => userCounty && l.county === userCounty && !wardMatches.find(w => w.leader_id === l.leader_id));
      const partyMatches = highMatchLeaders.filter(l => userParty && l.party === userParty && !wardMatches.find(w => w.leader_id === l.leader_id) && !countyMatches.find(c => c.leader_id === l.leader_id));
      
      if (wardMatches.length > 0) {
        responseGroups.push({
          id: "your_ward",
          title: `📍 Your Ward: ${userWard}`,
          subtitle: `${wardMatches.length} local aspirant${wardMatches.length !== 1 ? "s" : ""} in your area`,
          type: "ward",
          leaders: wardMatches.slice(0, 15),
          count: wardMatches.length,
          total: wardMatches.length
        });
      }
      
      if (countyMatches.length > 0) {
        responseGroups.push({
          id: "your_county",
          title: `🏛️ Your County: ${userCounty}`,
          subtitle: `${countyMatches.length} aspirant${countyMatches.length !== 1 ? "s" : ""} in your county`,
          type: "county",
          leaders: countyMatches.slice(0, 15),
          count: countyMatches.length,
          total: countyMatches.length
        });
      }
      
      if (partyMatches.length > 0) {
        responseGroups.push({
          id: "your_party",
          title: `🎯 Your Party: ${userParty}`,
          subtitle: `${partyMatches.length} aspirant${partyMatches.length !== 1 ? "s" : ""} from your party`,
          type: "party",
          leaders: partyMatches.slice(0, 15),
          count: partyMatches.length,
          total: partyMatches.length
        });
      }
    }

    // 3. Trending Leaders
    const trendingLeaders = [...leadersWithScores]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 12);
    
    if (trendingLeaders.length > 0 && !responseGroups.some(g => g.id === "trending")) {
      responseGroups.push({
        id: "trending",
        title: "🔥 Trending Now",
        subtitle: "Most viewed leaders",
        type: "trending",
        leaders: trendingLeaders,
        count: trendingLeaders.length,
        total: trendingLeaders.length
      });
    }

    // 4. Other Leaders by County
    const countyMap = new Map();
    for (const leader of otherLeaders) {
      const county = leader.county || "Other";
      if (!countyMap.has(county)) {
        countyMap.set(county, {
          name: county,
          leaders: []
        });
      }
      countyMap.get(county).leaders.push(leader);
    }

    const sortedCounties = Array.from(countyMap.values())
      .sort((a, b) => b.leaders.length - a.leaders.length)
      .slice(0, 8);

    for (const county of sortedCounties) {
      if (county.leaders.length > 0) {
        responseGroups.push({
          id: `county_${county.name.replace(/\s/g, '_')}`,
          title: county.name,
          subtitle: `${county.leaders.length} aspirant${county.leaders.length !== 1 ? "s" : ""}`,
          type: "county",
          leaders: county.leaders.slice(0, 12),
          count: county.leaders.length,
          total: county.leaders.length
        });
      }
    }

    const responseData = {
      success: true,
      data: responseGroups,
      userContext: {
        county: userCounty,
        ward: userWard,
        constituency: userConstituency,
        party: userParty,
        isAuthenticated: !!(userCounty || userParty)
      },
      totalLeaders: allActiveLeaders.length,
      personalizedCount: highMatchLeaders.length,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Personalized feed built: ${responseGroups.length} groups, ${allActiveLeaders.length} leaders`);
    res.status(200).json(responseData);
    
  } catch (error) {
    console.error("Get personalized feed error:", error);
    Logger.error("Get personalized feed error:", error);

    // Always return a valid response even on error
    res.status(200).json({
      success: true,
      data: [],
      userContext: {
        county: req.query.county || null,
        ward: req.query.ward || null,
        party: req.query.party || null,
        isAuthenticated: false
      },
      totalLeaders: 0,
      message: "Unable to load personalized feed at this time"
    });
  }
});

// ============================================
// ANALYTICS FUNCTIONS
// ============================================
const getLeaderAnalyticsByCounty = asyncHandler(async (req, res) => {
  const countyStats = await safeQuery(`
    SELECT county, COUNT(*) as total_leaders,
      SUM(CASE WHEN position = 'President' OR position_running_for = 'President' THEN 1 ELSE 0 END) as presidential,
      SUM(CASE WHEN position = 'Governor' OR position_running_for = 'Governor' THEN 1 ELSE 0 END) as governors,
      SUM(CASE WHEN position = 'MP' OR position_running_for = 'MP' THEN 1 ELSE 0 END) as mps,
      SUM(CASE WHEN position = 'MCA' OR position_running_for = 'MCA' THEN 1 ELSE 0 END) as mcas
    FROM leaders WHERE status = 'active' GROUP BY county ORDER BY total_leaders DESC
  `);
  res.status(200).json({ success: true, data: countyStats });
});

const getLeaderAnalyticsByConstituency = asyncHandler(async (req, res) => {
  const { county } = req.query;
  let query = `SELECT constituency, county, COUNT(*) as total_leaders FROM leaders WHERE status = 'active' AND constituency IS NOT NULL`;
  if (county) query += ` AND county = '${county}'`;
  query += ` GROUP BY constituency ORDER BY total_leaders DESC`;
  const stats = await safeQuery(query);
  res.status(200).json({ success: true, data: stats });
});

const getLeaderAnalyticsByWard = asyncHandler(async (req, res) => {
  const { constituency } = req.query;
  let query = `SELECT ward, constituency, COUNT(*) as total_leaders FROM leaders WHERE status = 'active' AND ward IS NOT NULL`;
  if (constituency) query += ` AND constituency = '${constituency}'`;
  query += ` GROUP BY ward ORDER BY total_leaders DESC`;
  const stats = await safeQuery(query);
  res.status(200).json({ success: true, data: stats });
});

const getLeaderAnalyticsByPosition = asyncHandler(async (req, res) => {
  const stats = await safeQuery(`
    SELECT 
      CASE 
        WHEN position = 'President' OR position_running_for = 'President' THEN 'President'
        WHEN position = 'Governor' OR position_running_for = 'Governor' THEN 'Governor'
        WHEN position = 'MP' OR position_running_for = 'MP' THEN 'MP'
        WHEN position = 'MCA' OR position_running_for = 'MCA' THEN 'MCA'
        ELSE 'Other'
      END as position_category,
      COUNT(*) as total_leaders
    FROM leaders WHERE status = 'active' GROUP BY position_category ORDER BY total_leaders DESC
  `);
  res.status(200).json({ success: true, data: stats });
});

const getLeaderDashboardAnalytics = asyncHandler(async (req, res) => {
  const totalLeaders = await safeQueryOne("SELECT COUNT(*) as count FROM leaders WHERE status = 'active'");
  res.status(200).json({ success: true, data: { overview: { total_leaders: totalLeaders?.count || 0 } } });
});



// ============================================
// GET LEADER STATS
// ============================================
const getLeaderStats = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  if (!leaderId) {
    return res.status(400).json({ success: false, message: "Leader ID is required" });
  }

  try {
    const followers = await safeQueryOne(
      `SELECT COUNT(*) as count FROM leader_followers WHERE leader_id = ?`,
      [leaderId]
    );
    
    const endorsements = await safeQueryOne(
      `SELECT COUNT(*) as count FROM endorsements WHERE leader_id = ? AND status = 'active'`,
      [leaderId]
    );
    
    const views = await safeQueryOne(
      `SELECT COUNT(*) as count FROM leader_views WHERE leader_id = ?`,
      [leaderId]
    );

    res.status(200).json({
      success: true,
      data: {
        followers: followers?.count || 0,
        endorsements: endorsements?.count || 0,
        views: views?.count || 0
      }
    });
  } catch (error) {
    Logger.error("Get leader stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leader stats",
      data: { followers: 0, endorsements: 0, views: 0 }
    });
  }
});

module.exports = {
  startLeaderWorkers,
  createLeader,
  getLeaderById,
  registerAspirant,
  loginAspirant,
  getMyProfile,
  updateMyProfile,
  updateLeader,
  boostLeader,
  getPersonalizedFeed,
  getPopularLeaders,
  getLeaderAnalyticsByCounty,
  getLeaderAnalyticsByConstituency,
  getLeaderAnalyticsByWard,
  getLeaderAnalyticsByPosition,
  getLeaderDashboardAnalytics,
  getLeaderStats
};