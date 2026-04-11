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

    const imageBaseUrl = process.env.IMAGE_BASE_URL || `http://localhost:${process.env.PORT || 8006}`;
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
    const { 
      name, password, email, party, slogan, position, county, constituency, ward, experience, education,
      facebook, twitter, linkedin, instagram, website 
    } = req.body;
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

    // Save Social Links to leader_portfolio
    try {
      const socialLinks = [
        { type: 'facebook', url: facebook },
        { type: 'twitter', url: twitter },
        { type: 'linkedin', url: linkedin },
        { type: 'instagram', url: instagram },
        { type: 'website', url: website }
      ].filter(link => link.url && link.url.trim() !== "");

      for (const link of socialLinks) {
        await safeQuery(
          `INSERT INTO leader_portfolio (leader_id, type, url, created_at)
           VALUES (?, ?, ?, NOW())`,
          [leaderId, link.type, link.url]
        );
      }
    } catch (socialError) {
      console.error("Social links save error:", socialError);
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
    
    console.log("Login attempt for:", name);
    
    // Validate input
    if (!name || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Name and password are required" 
      });
    }

    // Normalize input for case-insensitive search (trim and lowercase)
    const normalizedInput = name.trim().toLowerCase();
    
    // Search by name (case-insensitive) - also check both raw and normalized
    const leader = await safeQueryOne(
      `SELECT leader_id, name, password_hash, party, slogan, 
              position, position_running_for, county, constituency, ward, 
              image_url, status, verification, created_at
       FROM leaders 
       WHERE status = 'active' 
       AND (LOWER(name) = LOWER(?) OR name = ?)`,
      [normalizedInput, name]
    );

    // Check if leader exists
    if (!leader) {
      console.log("Leader not found for name:", name);
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials. Account not found." 
      });
    }

    console.log("Found leader:", leader.name);
    console.log("Stored password hash:", leader.password_hash ? "Exists" : "MISSING");

    // Check if password_hash exists
    if (!leader.password_hash) {
      console.error("No password hash found for leader:", leader.leader_id);
      return res.status(401).json({ 
        success: false, 
        message: "Account has no password set. Please contact support." 
      });
    }

    // Verify password using bcrypt
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, leader.password_hash);
      console.log("Password validation result:", isValidPassword);
    } catch (bcryptError) {
      console.error("Bcrypt error:", bcryptError);
      return res.status(500).json({ 
        success: false, 
        message: "Error validating password" 
      });
    }
    
    if (!isValidPassword) {
      console.log("Password mismatch for:", leader.name);
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials. Wrong password." 
      });
    }

    // Generate JWT token with 25 minutes expiration
    const token = jwt.sign(
      { 
        leaderId: leader.leader_id,
        name: leader.name,
        role: "aspirant",
        position: leader.position_running_for || leader.position,
        party: leader.party
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "25m" }
    );

    // Remove sensitive data before sending response
    const { password_hash, ...leaderData } = leader;

    res.status(200).json({ 
      success: true, 
      message: "Login successful",
      data: { 
        token,
        leader: leaderData,
        expiresIn: 1500
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    Logger.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to login. Please try again." 
    });
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
// ============================================
// GET POPULAR LEADERS - WITH CACHING & FULL URLs
// ============================================
const getPopularLeaders = asyncHandler(async (req, res) => {
  const cacheKey = 'popular_leaders_v2';
  const limit = parseInt(req.query.limit) || 20;
  
  try {
    // Try to get from cache first
    let cachedLeaders = null;
    try {
      cachedLeaders = await redis.get(cacheKey);
      if (cachedLeaders) {
        console.log("📊 Returning cached popular leaders");
        return res.status(200).json({ 
          success: true, 
          data: JSON.parse(cachedLeaders),
          count: JSON.parse(cachedLeaders).length,
          cached: true
        });
      }
    } catch (redisErr) {
      Logger.warn(`Redis get failed: ${redisErr.message}`);
    }

    // Get leaders from database
    const leaders = await safeQuery(
      `SELECT 
        l.leader_id, 
        l.name, 
        l.party, 
        l.position, 
        l.position_running_for,
        l.county, 
        l.constituency, 
        l.ward,
        l.image_url as leader_image_url,
        li.image_url,
        li.thumbnail_url,
        li.medium_url,
        li.social_url,
        l.verification, 
        l.views, 
        l.boost_score, 
        l.followers,
        l.slogan,
        l.status,
        l.created_at,
        (SELECT COUNT(*) FROM endorsements WHERE leader_id = l.leader_id AND status = 'active') as endorsement_count
      FROM leaders l 
      LEFT JOIN leader_images li ON l.leader_id = li.leader_id AND li.is_primary = 1
      WHERE l.status = 'active'
      ORDER BY 
        (l.boost_score * 10 + l.views * 2 + l.followers * 3) DESC,
        l.created_at DESC
      LIMIT ?`,
      [limit]
    );

    // Get image base URL
    const imageBaseUrl = process.env.IMAGE_BASE_URL || `http://localhost:${process.env.PORT || 8006}`;
    
    // Helper to format image URLs
    const formatImageUrl = (url) => {
      if (!url) return null;
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      if (url.startsWith('data:')) return url;
      return `${imageBaseUrl}${url.startsWith('/') ? url : `/${url}`}`;
    };

    // Format leaders with proper image URLs
    const formattedLeaders = leaders.map(leader => {
      // Get the best available image
      const bestImage = leader.image_url || leader.leader_image_url;
      
      return {
        leader_id: leader.leader_id,
        name: leader.name,
        party: leader.party || "Independent",
        position: leader.position_running_for || leader.position || "Candidate",
        county: leader.county,
        constituency: leader.constituency,
        ward: leader.ward,
        image_url: formatImageUrl(bestImage),
        thumbnail_url: formatImageUrl(leader.thumbnail_url),
        medium_url: formatImageUrl(leader.medium_url),
        social_url: formatImageUrl(leader.social_url),
        avatar: formatImageUrl(bestImage) || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&background=dc2626&color=fff&size=200&bold=true`,
        verification: leader.verification === 1,
        verification_status: leader.verification === 1 ? "verified" : "pending",
        views: leader.views || 0,
        boost_score: leader.boost_score || 0,
        followers: leader.followers || 0,
        endorsement_count: leader.endorsement_count || 0,
        slogan: leader.slogan,
        created_at: leader.created_at
      };
    });

    console.log(`📊 Popular leaders fetched: ${formattedLeaders.length} leaders`);
    if (formattedLeaders.length > 0) {
      console.log(`📊 First leader: ${formattedLeaders[0].name}, Image: ${formattedLeaders[0].image_url?.substring(0, 50)}...`);
    }

    // Cache for 5 minutes
    try {
      await redis.set(cacheKey, JSON.stringify(formattedLeaders), 'EX', 300);
    } catch (redisErr) {
      Logger.warn(`Redis set failed: ${redisErr.message}`);
    }

    res.status(200).json({ 
      success: true, 
      data: formattedLeaders,
      count: formattedLeaders.length,
      cached: false
    });
    
  } catch (error) {
    Logger.error("Get popular leaders error:", error);
    console.error("Popular leaders error:", error);
    
    // Return empty array with success true to prevent frontend errors
    res.status(200).json({ 
      success: true, 
      data: [],
      count: 0,
      message: "Unable to fetch popular leaders at this time"
    });
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
// GET PERSONALIZED FEED - DEBUG & FIXED
// ============================================
const getPersonalizedFeed = asyncHandler(async (req, res) => {
  try {
    // Get user context from query params
    const userCounty = req.query.user_county || req.query.county || null;
    const userWard = req.query.user_ward || req.query.ward || null;
    const userConstituency = req.query.user_constituency || req.query.constituency || null;
    const userParty = req.query.user_party || req.query.party || null;
    
    console.log("📊 Building feed with:", { userCounty, userWard, userConstituency, userParty });
    
    // Get ALL active leaders - NO FILTERING
    const allLeaders = await safeQuery(
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
        l.status, 
        l.created_at,
        l.endorsement_count
      FROM leaders l
      LEFT JOIN leader_images li ON l.leader_id = li.leader_id AND li.is_primary = 1
      WHERE l.status = 'active'
      ORDER BY l.created_at DESC
      LIMIT 1000`,
      []
    );

    console.log(`📊 Total leaders in DB: ${allLeaders.length}`);
    
    // Log sample leaders to debug
    if (allLeaders.length > 0) {
      console.log("📊 Sample leader:", {
        name: allLeaders[0].name,
        county: allLeaders[0].county,
        constituency: allLeaders[0].constituency,
        ward: allLeaders[0].ward,
        party: allLeaders[0].party
      });
    }

    if (!allLeaders || allLeaders.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        userContext: { county: userCounty, ward: userWard },
        totalLeaders: 0
      });
    }

    // Helper to get position
    const getPosition = (leader) => {
      const pos = leader.position_running_for || leader.position || "";
      if (!pos) return "Other";
      const lowerPos = pos.toLowerCase();
      if (lowerPos.includes("president")) return "President";
      if (lowerPos.includes("governor")) return "Governor";
      if (lowerPos.includes("senator")) return "Senator";
      if (lowerPos.includes("women")) return "Women Representative";
      if (lowerPos.includes("mp")) return "Member of Parliament";
      if (lowerPos.includes("mca")) return "Member of County Assembly";
      return pos;
    };

    const responseGroups = [];
    const usedIds = new Set();
    
    // Helper to add unique leaders
    const addUnique = (leaders, maxCount = 30) => {
      const result = [];
      for (const l of leaders) {
        if (!usedIds.has(l.leader_id) && result.length < maxCount) {
          result.push(l);
          usedIds.add(l.leader_id);
        }
      }
      return result;
    };
    
    // 1. PRESIDENTIAL CANDIDATES
    const presidential = allLeaders.filter(l => getPosition(l) === "President");
    const presList = addUnique(presidential, 30);
    if (presList.length > 0) {
      responseGroups.push({
        id: "presidential",
        title: "👑 Presidential Candidates",
        subtitle: `${presList.length} candidates running for President`,
        type: "presidential",
        leaders: presList,
        count: presList.length,
        total: presidential.length
      });
    }
    
    // 2. HOT & NEW (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const hotNewLeaders = allLeaders.filter(l => {
      if (!l.created_at) return false;
      return new Date(l.created_at) > sevenDaysAgo;
    });
    const hotList = addUnique(hotNewLeaders, 30);
    if (hotList.length > 0) {
      responseGroups.push({
        id: "hot_new",
        title: "🔥 Hot & New",
        subtitle: `${hotList.length} leaders joined in last 7 days`,
        type: "hot",
        leaders: hotList,
        count: hotList.length,
        total: hotNewLeaders.length
      });
    }
    
    // 3. YOUR COUNTY - SHOW ALL LEADERS IN COUNTY (case insensitive)
    if (userCounty) {
      const countyLeaders = allLeaders.filter(l => 
        l.county && l.county.toLowerCase().trim() === userCounty.toLowerCase().trim()
      );
      console.log(`📊 County ${userCounty}: Found ${countyLeaders.length} leaders`);
      const countyList = addUnique(countyLeaders, 50);
      responseGroups.push({
        id: "your_county",
        title: `🏛️ ${userCounty}`,
        subtitle: countyList.length > 0 ? `${countyList.length} aspirant${countyList.length !== 1 ? "s" : ""} in your county` : "No aspirants in your county yet",
        type: "county",
        leaders: countyList,
        count: countyList.length,
        total: countyLeaders.length
      });
    }
    
    // 4. YOUR WARD - SHOW ALL LEADERS IN WARD
    if (userWard) {
      const wardLeaders = allLeaders.filter(l => 
        l.ward && l.ward.toLowerCase().trim() === userWard.toLowerCase().trim()
      );
      console.log(`📊 Ward ${userWard}: Found ${wardLeaders.length} leaders`);
      const wardList = addUnique(wardLeaders, 50);
      responseGroups.push({
        id: "your_ward",
        title: `🏘️ ${userWard}`,
        subtitle: wardList.length > 0 ? `${wardList.length} aspirant${wardList.length !== 1 ? "s" : ""} in your ward` : "No aspirants in your ward yet",
        type: "ward",
        leaders: wardList,
        count: wardList.length,
        total: wardLeaders.length
      });
    }
    
    // 5. YOUR CONSTITUENCY
    if (userConstituency) {
      const constLeaders = allLeaders.filter(l => 
        l.constituency && l.constituency.toLowerCase().trim() === userConstituency.toLowerCase().trim()
      );
      console.log(`📊 Constituency ${userConstituency}: Found ${constLeaders.length} leaders`);
      const constList = addUnique(constLeaders, 50);
      responseGroups.push({
        id: "your_constituency",
        title: `📍 ${userConstituency}`,
        subtitle: constList.length > 0 ? `${constList.length} aspirant${constList.length !== 1 ? "s" : ""} in your constituency` : "No aspirants in your constituency yet",
        type: "constituency",
        leaders: constList,
        count: constList.length,
        total: constLeaders.length
      });
    }
    
    // 6. YOUR PARTY - SHOW ALL LEADERS FROM YOUR PARTY
    if (userParty) {
      const partyLeaders = allLeaders.filter(l => 
        l.party && l.party.toLowerCase().trim() === userParty.toLowerCase().trim()
      );
      console.log(`📊 Party ${userParty}: Found ${partyLeaders.length} leaders`);
      const partyList = addUnique(partyLeaders, 50);
      responseGroups.push({
        id: "your_party",
        title: `🎯 ${userParty}`,
        subtitle: partyList.length > 0 ? `${partyList.length} ${userParty} aspirant${partyList.length !== 1 ? "s" : ""}` : `No ${userParty} aspirants yet`,
        type: "party",
        leaders: partyList,
        count: partyList.length,
        total: partyLeaders.length
      });
    }
    
    // 7. GOVERNORS
    const governors = allLeaders.filter(l => getPosition(l) === "Governor");
    const govList = addUnique(governors, 30);
    if (govList.length > 0) {
      responseGroups.push({
        id: "governors",
        title: "🏛️ Governors",
        subtitle: `${govList.length} candidates for Governor`,
        type: "governors",
        leaders: govList,
        count: govList.length,
        total: governors.length
      });
    }
    
    // 8. SENATORS
    const senators = allLeaders.filter(l => getPosition(l) === "Senator");
    const senList = addUnique(senators, 30);
    if (senList.length > 0) {
      responseGroups.push({
        id: "senators",
        title: "⚖️ Senators",
        subtitle: `${senList.length} candidates for Senator`,
        type: "senators",
        leaders: senList,
        count: senList.length,
        total: senators.length
      });
    }
    
    // 9. WOMEN REPRESENTATIVES
    const womenReps = allLeaders.filter(l => getPosition(l) === "Women Representative");
    const womenList = addUnique(womenReps, 30);
    if (womenList.length > 0) {
      responseGroups.push({
        id: "women_reps",
        title: "👩‍⚖️ Women Representatives",
        subtitle: `${womenList.length} candidates for Women Rep`,
        type: "women_reps",
        leaders: womenList,
        count: womenList.length,
        total: womenReps.length
      });
    }
    
    // 10. MEMBERS OF PARLIAMENT (MPs)
    const mps = allLeaders.filter(l => getPosition(l) === "Member of Parliament");
    const mpList = addUnique(mps, 30);
    if (mpList.length > 0) {
      responseGroups.push({
        id: "mps",
        title: "🏛️ Members of Parliament",
        subtitle: `${mpList.length} MP candidates`,
        type: "mps",
        leaders: mpList,
        count: mpList.length,
        total: mps.length
      });
    }
    
    // 11. MCAs
    const mcas = allLeaders.filter(l => getPosition(l) === "Member of County Assembly");
    const mcaList = addUnique(mcas, 30);
    if (mcaList.length > 0) {
      responseGroups.push({
        id: "mcas",
        title: "🏘️ MCAs",
        subtitle: `${mcaList.length} MCA candidates`,
        type: "mcas",
        leaders: mcaList,
        count: mcaList.length,
        total: mcas.length
      });
    }
    
    // 12. VERIFIED LEADERS
    const verifiedLeaders = allLeaders.filter(l => l.verification === 1 && !usedIds.has(l.leader_id));
    const verifiedList = addUnique(verifiedLeaders, 30);
    if (verifiedList.length > 0) {
      responseGroups.push({
        id: "verified",
        title: "⭐ Verified Leaders",
        subtitle: `${verifiedList.length} trusted and verified aspirants`,
        type: "verified",
        leaders: verifiedList,
        count: verifiedList.length,
        total: verifiedLeaders.length
      });
    }
    
    // 13. FOR YOU (Random remaining)
    const remaining = allLeaders.filter(l => !usedIds.has(l.leader_id));
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
    const forYouList = addUnique(remaining, 40);
    if (forYouList.length > 0) {
      responseGroups.push({
        id: "for_you",
        title: "📱 For You",
        subtitle: `${forYouList.length} personalized recommendations`,
        type: "for_you",
        leaders: forYouList,
        count: forYouList.length,
        total: remaining.length
      });
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
      totalLeaders: allLeaders.length,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Feed built: ${responseGroups.length} groups with ${allLeaders.length} total leaders`);
    res.status(200).json(responseData);
    
  } catch (error) {
    console.error("Get personalized feed error:", error);
    Logger.error("Get personalized feed error:", error);

    res.status(200).json({
      success: true,
      data: [],
      userContext: { isAuthenticated: false },
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

// ============================================
// VERIFICATION REQUESTS
// ============================================
const requestVerification = asyncHandler(async (req, res) => {
  const leaderId = req.user?.leaderId;
  if (!leaderId) {
    return res.status(401).json({ success: false, message: "Not authenticated as a leader" });
  }

  try {
    const leader = await safeQueryOne(`SELECT status FROM leaders WHERE leader_id = ?`, [leaderId]);
    if (!leader) return res.status(404).json({ success: false, message: "Leader not found" });

    if (leader.status === "verified") {
      return res.status(400).json({ success: false, message: "Account is already verified" });
    }

    await safeQuery(`UPDATE leaders SET status = 'pending', updated_at = NOW() WHERE leader_id = ?`, [leaderId]);
    
    // Clear cache
    await redis.del(`leader:${leaderId}`);

    res.status(200).json({ 
      success: true, 
      message: "Verification request submitted successfully. Our team will review your profile." 
    });
  } catch (error) {
    Logger.error("Verification request error:", error);
    res.status(500).json({ success: false, message: "Failed to submit verification request" });
  }
});

// ============================================
// ADMIN ACTIONS
// ============================================
const verifyLeader = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  try {
    await safeQuery(`UPDATE leaders SET verification = 1, updated_at = NOW() WHERE leader_id = ?`, [leaderId]);
    await redis.del(`leader:${leaderId}`);
    await redis.del('global:all_leaders');
    res.status(200).json({ success: true, message: "Leader verified successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const rejectLeader = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  try {
    await safeQuery(`UPDATE leaders SET verification = 0, updated_at = NOW() WHERE leader_id = ?`, [leaderId]);
    await redis.del(`leader:${leaderId}`);
    res.status(200).json({ success: true, message: "Leader status set to pending/rejected" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const deleteLeader = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  try {
    await safeQuery(`UPDATE leaders SET status = 'deleted', updated_at = NOW() WHERE leader_id = ?`, [leaderId]);
    await redis.del(`leader:${leaderId}`);
    await redis.del('global:all_leaders');
    res.status(200).json({ success: true, message: "Leader deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
  getLeaderStats,
  requestVerification,
  verifyLeader,
  rejectLeader,
  deleteLeader
};