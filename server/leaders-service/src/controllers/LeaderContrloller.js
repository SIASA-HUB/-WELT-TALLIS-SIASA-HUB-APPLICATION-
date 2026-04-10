// controllers/leaderController.js - Complete Fixed Version

const Logger = require("../utils/logger/logger");
const LeaderModel = require("../models/leadersModel");
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
} = require("../Qeues/Rabbit");

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
        let imageUrl = null;
        let imagePublicId = null;
        let thumbnailUrl = null;
        let mediumUrl = null;
        let socialUrl = null;

        const fs = require("fs");
        const path = require("path");
        const sharp = require("sharp");
        const UPLOAD_DIR = path.join(__dirname, "../../../public/uploads/leaders");
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(UPLOAD_DIR)) {
          fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }

        // Create leader subdirectory
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

        // Process Original (max 1200px)
        await sharp(buffer)
          .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(path.join(leaderDir, originalFileName));

        // Process Large (800px)
        await sharp(buffer)
          .resize(800, 800, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(path.join(leaderDir, largeFileName));

        // Process Medium (400px)
        await sharp(buffer)
          .resize(400, 400, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(path.join(leaderDir, mediumFileName));

        // Process Thumbnail (150px, cover)
        await sharp(buffer)
          .resize(150, 150, { fit: "cover", position: "attention" })
          .webp({ quality: 75 })
          .toFile(path.join(leaderDir, thumbFileName));

        imageUrl = `/uploads/leaders/${leaderId}/${originalFileName}`;
        imagePublicId = `${leaderId}/${baseName}`;
        thumbnailUrl = `/uploads/leaders/${leaderId}/${thumbFileName}`;
        mediumUrl = `/uploads/leaders/${leaderId}/${mediumFileName}`;
        socialUrl = `/uploads/leaders/${leaderId}/${largeFileName}`;

        // Get image metadata
        const metadata = await sharp(buffer).metadata();

        const imageId = `IMG_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
        await safeQuery(
          `INSERT INTO leader_images (
            image_id, leader_id, image_url, public_id,
            is_primary, sort_order, width, height, format, bytes,
            thumbnail_url, medium_url, social_url, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            imageId,
            leaderId,
            imageUrl,
            imagePublicId,
            1,
            0,
            metadata.width || null,
            metadata.height || null,
            "webp",
            imageMeta.size || null,
            thumbnailUrl,
            mediumUrl,
            socialUrl,
            now,
          ],
        );

        // Update leader with primary image URL
        await safeQuery(
          `UPDATE leaders SET image_url = ? WHERE leader_id = ?`,
          [imageUrl, leaderId],
        );
        
        Logger.info(`[QUEUE] Image uploaded for leader ${leaderId}: ${imageUrl}`);
      } catch (err) {
        Logger.error(`[QUEUE] Image upload failed for ${leaderId}:`, err);
      }
    });

    consumeMessages(QUEUES.LEADER_CACHE_CLEAR, async (msg) => {
      const { leaderId, county, constituency, ward } = msg;
      try {
        const keys = [
          `leader:${leaderId}`,
          "global:all_leaders",
          "leaders:most_boosted",
          county && `county:${county}:leaders`,
          constituency && `constituency:${constituency}:leaders`,
          ward && `ward:${ward}:leaders`,
          `personalized_feed:*`,
        ].filter(Boolean);
        await Promise.all(keys.map((k) => redis.del(k)));
        Logger.info(`[QUEUE] Cache cleared for leader ${leaderId}`);
      } catch (err) {
        Logger.error("[QUEUE] Cache clear failed:", err);
      }
    });

    consumeMessages(QUEUES.LEADER_BOOST_STATS, async (msg) => {
      const { leaderId, boostAmount } = msg;
      try {
        await safeQuery(
          `UPDATE leaders
           SET boost_count = COALESCE(boost_count, 0) + 1,
               total_boost_amount = COALESCE(total_boost_amount, 0) + ?,
               boost_score = COALESCE(boost_score, 0) + ?,
               updated_at = NOW()
           WHERE leader_id = ?`,
          [boostAmount, boostAmount, leaderId],
        );
        Logger.info(`[QUEUE] Boost stats updated for leader ${leaderId}`);
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
// HELPER FUNCTIONS
// ============================================

function calculateStringSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;

  const matrix = Array(len2 + 1)
    .fill(null)
    .map(() => Array(len1 + 1).fill(null));
  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost,
      );
    }
  }
  return 1 - matrix[len2][len1] / Math.max(len1, len2);
}

function parseArrayField(value) {
  if (!value) return [];
  try {
    if (typeof value === "string") {
      if (value.startsWith("[")) return JSON.parse(value);
      if (value.includes("|"))
        return value
          .split("|")
          .map((e) => e.trim())
          .filter(Boolean);
      return [value];
    }
    return value;
  } catch {
    return [value];
  }
}

// ============================================
// CREATE LEADER (Admin)
// ============================================
const createLeader = async (req, res) => {
  try {
    const leader = await LeaderService.createLeader(
      req.body,
      req.files,
      redis,
      Logger,
      getKenyaTimeISO,
    );
    publishMessage(QUEUES.LEADER_CACHE_CLEAR, {
      leaderId: leader.leader_id,
      county: leader.county,
    }).catch(() => {});
    res.status(201).json({
      success: true,
      message: "Leader registered successfully",
      leader,
    });
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
  if (!leaderId)
    return res
      .status(400)
      .json({ success: false, message: "Leader ID is required" });

  const safeLeaderId = String(leaderId).trim();
  const cacheKey = `leader:${safeLeaderId}`;

  try {
    let cached = null;
    try {
      cached = await redis.get(cacheKey);
    } catch (redisErr) {
      Logger.warn(`Redis get failed: ${redisErr.message}`);
    }
    if (cached) return res.status(200).json(JSON.parse(cached));

    const leader = await LeaderModel.getById(safeLeaderId);
    if (!leader)
      return res
        .status(404)
        .json({ success: false, message: "Leader not found" });

    // Get stats from endorsements table instead of non-existent column
    const endorsements = await safeQueryOne(
      `SELECT COUNT(*) as count FROM endorsements WHERE leader_id = ? AND status = 'active'`,
      [safeLeaderId]
    );
    
    const stats = {
      endorsements: endorsements?.count || 0,
      followers: leader.followers || 0,
      views: leader.views || 0,
      boost_score: leader.boost_score || 0
    };
    
    const payload = { success: true, data: { ...leader, stats } };

    try {
      await redis.set(cacheKey, JSON.stringify(payload), "EX", 300);
    } catch (redisErr) {
      Logger.warn(`Redis set failed: ${redisErr.message}`);
    }
    res.status(200).json(payload);
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
      name,
      password,
      email,
      party,
      slogan,
      position,
      county,
      constituency,
      ward,
      experience,
      education,
    } = req.body;
    const image = req.file;

    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    if (!password)
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    if (password.length < 6)
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    if (!position)
      return res.status(400).json({
        success: false,
        message: "Position you are vying for is required",
      });
    if (!county)
      return res
        .status(400)
        .json({ success: false, message: "County is required" });
    if (!image)
      return res
        .status(400)
        .json({ success: false, message: "Profile image is required" });

    const existingName = await safeQueryOne(
      `SELECT leader_id FROM leaders WHERE name = ? AND status != 'deleted'`,
      [name],
    );
    if (existingName)
      return res.status(400).json({
        success: false,
        message:
          "This name is already registered. Please use a different name.",
      });

    if (email) {
      const existingEmail = await LeaderModel.findByEmail(email);
      if (existingEmail)
        return res
          .status(400)
          .json({ success: false, message: "Email already registered" });
    }

    let parsedExperience = [],
      parsedEducation = [];
    try {
      if (experience)
        parsedExperience =
          typeof experience === "string" ? JSON.parse(experience) : experience;
      if (education)
        parsedEducation =
          typeof education === "string" ? JSON.parse(education) : education;
    } catch (e) {
      Logger.error("Error parsing experience/education:", e);
    }

    const leaderId = `LDR_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const now = getKenyaTimeISO();
    const password_hash = await bcrypt.hash(password, 10);

    await safeQuery(
      `INSERT INTO leaders (
        leader_id, name, email, password_hash, party, slogan,
        position, position_running_for,
        county, constituency, ward, education, experience,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        leaderId,
        name,
        email || null,
        password_hash,
        party || null,
        slogan || null,
        position,
        position,
        county,
        constituency || null,
        ward || null,
        parsedEducation.length > 0 ? JSON.stringify(parsedEducation) : null,
        parsedExperience.length > 0 ? JSON.stringify(parsedExperience) : null,
        "pending",
        now,
        now,
      ],
    );

    res.status(201).json({
      success: true,
      message:
        "Registration successful! Your profile image is being processed.",
      data: {
        leader_id: leaderId,
        name,
        email: email || null,
        position,
        county,
        status: "pending",
        image_url: null,
      },
    });

    publishMessage(QUEUES.LEADER_IMAGE_UPLOAD, {
      leaderId,
      imageBuffer: image.buffer.toString("base64"),
      imageMeta: {
        originalname: image.originalname,
        mimetype: image.mimetype,
        size: image.size,
      },
      now,
    }).catch((err) => Logger.error("Failed to queue image upload:", err));

    publishMessage(QUEUES.LEADER_CACHE_CLEAR, {
      leaderId,
      county,
      constituency,
      ward,
    }).catch(() => {});
    Logger.info(`New aspirant registered: ${name} (${leaderId})`);
  } catch (error) {
    Logger.error("Register aspirant error:", error);
    if (!res.headersSent)
      res.status(500).json({
        success: false,
        message: error.message || "Failed to register aspirant",
      });
  }
});

// ============================================
// LOGIN ASPIRANT
// ============================================
const loginAspirant = asyncHandler(async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password)
      return res
        .status(400)
        .json({ success: false, message: "Name and password are required" });

    const normalizedInput = name.trim().toLowerCase();
    
    const leaders = await safeQuery(
      `SELECT leader_id, name, email, phone, password_hash, party, slogan,
              position, county, constituency, ward, image_url, status, verification
       FROM leaders WHERE status != 'deleted' AND (LOWER(name) = ? OR LOWER(email) = ?) LIMIT 1`,
       [normalizedInput, normalizedInput]
    );

    if (!leaders || leaders.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials or account not found." });
    }

    const bestMatch = leaders[0];

    if (bestMatch.status !== "active" && bestMatch.status !== "pending") {
      return res.status(401).json({
        success: false,
        message: "Account is not active. Please contact support.",
      });
    }

    const isValid = await bcrypt.compare(password, bestMatch.password_hash);
    if (!isValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        leaderId: bestMatch.leader_id,
        name: bestMatch.name,
        email: bestMatch.email,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    );

    const { password_hash, ...leaderData } = bestMatch;
    Logger.info(`Login successful for ${bestMatch.name}`);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { token, leader: leaderData },
    });
  } catch (error) {
    Logger.error("Login aspirant error:", error);
    res.status(500).json({ success: false, message: "Failed to login" });
  }
});

// ============================================
// GET MY PROFILE
// ============================================
const getMyProfile = asyncHandler(async (req, res) => {
  try {
    const leaderId = req.user.leaderId;
    const leader = await LeaderModel.getById(leaderId);
    if (!leader)
      return res
        .status(404)
        .json({ success: false, message: "Leader not found" });
    res.status(200).json({ success: true, data: leader });
  } catch (error) {
    Logger.error("Get profile error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch profile" });
  }
});

// ============================================
// UPDATE MY PROFILE
// ============================================
const updateMyProfile = asyncHandler(async (req, res) => {
  try {
    const leaderId = req.user.leaderId;
    await LeaderModel.updateProfile(leaderId, req.body);
    publishMessage(QUEUES.LEADER_CACHE_CLEAR, { leaderId }).catch(() => {});
    res
      .status(200)
      .json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    Logger.error("Update profile error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update profile" });
  }
});

// ============================================
// SEARCH LEADERS
// ============================================
const searchLeaders = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  if (!q?.trim())
    return res
      .status(400)
      .json({ success: false, message: "Search query is required" });

  const offset = (page - 1) * limit;
  const searchTerm = `%${q}%`;
  const params = [
    searchTerm,
    searchTerm,
    searchTerm,
    searchTerm,
    searchTerm,
    searchTerm,
  ];

  try {
    const [countResult, leaders] = await Promise.all([
      safeQueryOne(
        `SELECT COUNT(*) as total FROM leaders WHERE status = 'active' AND (name LIKE ? OR party LIKE ? OR position LIKE ? OR county LIKE ? OR constituency LIKE ? OR ward LIKE ?)`,
        params,
      ),
      safeQuery(
        `SELECT leader_id, name, party, position, slogan, county, constituency, ward, image_url,
          (SELECT COUNT(*) FROM leader_followers WHERE leader_id = leaders.leader_id) as followers,
          (SELECT image_url FROM leader_images WHERE leader_id = leaders.leader_id AND is_primary = 1 LIMIT 1) as primary_image
         FROM leaders WHERE status = 'active' AND (name LIKE ? OR party LIKE ? OR position LIKE ? OR county LIKE ? OR constituency LIKE ? OR ward LIKE ?)
         ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), parseInt(offset)],
      ),
    ]);

    const total = countResult?.total || 0;
    res.status(200).json({
      success: true,
      query: q,
      data: leaders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    Logger.error("Search leaders error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error searching leaders" });
  }
});

// ============================================
// GET LEADERS BY PARTY
// ============================================
const getLeadersByParty = asyncHandler(async (req, res) => {
  const { party } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  if (!party)
    return res
      .status(400)
      .json({ success: false, message: "Party is required" });

  try {
    const [countResult, leaders] = await Promise.all([
      safeQueryOne(
        `SELECT COUNT(*) as total FROM leaders WHERE status = 'active' AND party = ?`,
        [party],
      ),
      safeQuery(
        `SELECT leader_id, name, party, position, county, constituency, ward, image_url,
          (SELECT COUNT(*) FROM leader_followers WHERE leader_id = leaders.leader_id) as followers,
          (SELECT image_url FROM leader_images WHERE leader_id = leaders.leader_id AND is_primary = 1 LIMIT 1) as primary_image
         FROM leaders WHERE status = 'active' AND party = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [party, parseInt(limit), parseInt(offset)],
      ),
    ]);
    res.status(200).json({
      success: true,
      party,
      data: leaders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult?.total || 0,
        pages: Math.ceil((countResult?.total || 0) / limit),
      },
    });
  } catch (error) {
    Logger.error("Get leaders by party error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching leaders by party" });
  }
});

// ============================================
// GET LEADERS BY COUNTY
// ============================================
const getLeadersByCounty = asyncHandler(async (req, res) => {
  const { county } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const cacheKey = `county:${county}:leaders:${page}:${limit}`;
    const cached = await redis.get(cacheKey);
    if (cached) return res.status(200).json(JSON.parse(cached));

    const [countResult, leaders] = await Promise.all([
      safeQueryOne(
        `SELECT COUNT(*) as total FROM leaders WHERE status = 'active' AND county = ?`,
        [county],
      ),
      safeQuery(
        `SELECT leader_id, name, party, position, constituency, ward, image_url,
          (SELECT COUNT(*) FROM leader_followers WHERE leader_id = leaders.leader_id) as followers,
          (SELECT image_url FROM leader_images WHERE leader_id = leaders.leader_id AND is_primary = 1 LIMIT 1) as primary_image
         FROM leaders WHERE status = 'active' AND county = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [county, parseInt(limit), parseInt(offset)],
      ),
    ]);

    const payload = {
      success: true,
      county,
      data: leaders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult?.total || 0,
        pages: Math.ceil((countResult?.total || 0) / limit),
      },
    };
    await redis.set(cacheKey, JSON.stringify(payload), "EX", 120);
    res.status(200).json(payload);
  } catch (error) {
    Logger.error("Get leaders by county error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching leaders by county" });
  }
});

// ============================================
// GET LEADERS BY CONSTITUENCY
// ============================================
const getLeadersByConstituency = asyncHandler(async (req, res) => {
  const { constituency } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const [countResult, leaders] = await Promise.all([
      safeQueryOne(
        `SELECT COUNT(*) as total FROM leaders WHERE status = 'active' AND constituency = ?`,
        [constituency],
      ),
      safeQuery(
        `SELECT leader_id, name, party, position, county, ward, image_url,
          (SELECT COUNT(*) FROM leader_followers WHERE leader_id = leaders.leader_id) as followers,
          (SELECT image_url FROM leader_images WHERE leader_id = leaders.leader_id AND is_primary = 1 LIMIT 1) as primary_image
         FROM leaders WHERE status = 'active' AND constituency = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [constituency, parseInt(limit), parseInt(offset)],
      ),
    ]);
    res.status(200).json({
      success: true,
      constituency,
      data: leaders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult?.total || 0,
        pages: Math.ceil((countResult?.total || 0) / limit),
      },
    });
  } catch (error) {
    Logger.error("Get leaders by constituency error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leaders by constituency",
    });
  }
});

// ============================================
// GET LEADERS BY WARD
// ============================================
const getLeadersByWard = asyncHandler(async (req, res) => {
  const { ward } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const [countResult, leaders] = await Promise.all([
      safeQueryOne(
        `SELECT COUNT(*) as total FROM leaders WHERE status = 'active' AND ward = ?`,
        [ward],
      ),
      safeQuery(
        `SELECT leader_id, name, party, position, county, constituency, image_url,
          (SELECT COUNT(*) FROM leader_followers WHERE leader_id = leaders.leader_id) as followers,
          (SELECT image_url FROM leader_images WHERE leader_id = leaders.leader_id AND is_primary = 1 LIMIT 1) as primary_image
         FROM leaders WHERE status = 'active' AND ward = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [ward, parseInt(limit), parseInt(offset)],
      ),
    ]);
    res.status(200).json({
      success: true,
      ward,
      data: leaders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult?.total || 0,
        pages: Math.ceil((countResult?.total || 0) / limit),
      },
    });
  } catch (error) {
    Logger.error("Get leaders by ward error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching leaders by ward" });
  }
});

// ============================================
// GET POPULAR LEADERS
// ============================================
const getPopularLeaders = asyncHandler(async (req, res) => {
  try {
    let cached = null;
    try {
      cached = await redis.get("leaders:popular");
    } catch (redisErr) {
      Logger.warn("Redis get error:", redisErr.message);
    }
    if (cached) return res.status(200).json(JSON.parse(cached));

    const leaders = await safeQuery(
      `SELECT l.leader_id, l.name, l.party, l.position, l.county, l.constituency, l.ward, COALESCE(l.image_url, li.image_url) as image_url,
        l.slogan, l.verification, l.views, l.boost_score, l.total_boost_amount, l.followers, l.created_at
       FROM leaders l LEFT JOIN leader_images li ON l.leader_id = li.leader_id AND li.is_primary = 1
       WHERE l.status = 'active'
       ORDER BY COALESCE(l.boost_score, 0) DESC, COALESCE(l.total_boost_amount, 0) DESC, COALESCE(l.views, 0) DESC, l.created_at DESC LIMIT 50`,
      [],
    );

    if (!leaders || leaders.length === 0)
      return res.status(200).json({ success: true, data: [] });

    const verified = leaders.filter((l) => l.verification === 1);
    const unverified = leaders.filter((l) => l.verification !== 1);

    for (let i = verified.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [verified[i], verified[j]] = [verified[j], verified[i]];
    }
    for (let i = unverified.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unverified[i], unverified[j]] = [unverified[j], unverified[i]];
    }

    const rotatedLeaders = [...verified.slice(0, 7), ...unverified.slice(0, 5)];
    const payload = { success: true, data: rotatedLeaders };

    try {
      await redis.set("leaders:popular", JSON.stringify(payload));
      await redis.expire("leaders:popular", 60);
    } catch (redisErr) {
      Logger.warn("Redis set error:", redisErr.message);
    }
    res.status(200).json(payload);
  } catch (error) {
    Logger.error("Get popular leaders error:", error);
    res.status(200).json({ success: true, data: [] });
  }
});

// ============================================
// GET FEATURED LEADERS
// ============================================
const getFeaturedLeaders = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  try {
    const cacheKey = `leaders:featured:${limit}`;
    const cached = await redis.get(cacheKey);
    if (cached) return res.status(200).json(JSON.parse(cached));

    const leaders = await safeQuery(
      `SELECT l.leader_id, l.name, l.party, l.position, l.slogan, l.county, l.constituency, l.ward, l.image_url,
        (SELECT image_url FROM leader_images WHERE leader_id = l.leader_id AND is_primary = 1 LIMIT 1) as primary_image,
        (SELECT COUNT(*) FROM leader_followers WHERE leader_id = l.leader_id) as followers
       FROM leaders l WHERE l.status = 'active' ORDER BY followers DESC LIMIT ?`,
      [parseInt(limit)],
    );

    const payload = { success: true, data: leaders };
    await redis.set(cacheKey, JSON.stringify(payload), "EX", 300);
    res.status(200).json(payload);
  } catch (error) {
    Logger.error("Get featured leaders error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching featured leaders" });
  }
});

// ============================================
// GET LEADER STATS
// ============================================
const getLeaderStats = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  try {
    const followers = await safeQueryOne(
      `SELECT COUNT(*) as count FROM leader_followers WHERE leader_id = ?`,
      [leaderId],
    );
    const endorsements = await safeQueryOne(
      `SELECT COUNT(*) as count FROM endorsements WHERE leader_id = ? AND status = 'active'`,
      [leaderId],
    );
    res
      .status(200)
      .json({ 
        success: true, 
        data: { 
          followers: followers?.count || 0,
          endorsements: endorsements?.count || 0
        } 
      });
  } catch (error) {
    Logger.error("Get leader stats error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching leader stats" });
  }
});

// ============================================
// UPDATE LEADER (Admin)
// ============================================
const updateLeader = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  if (!leaderId)
    return res
      .status(400)
      .json({ success: false, message: "Leader ID is required" });

  try {
    const existingLeader = await LeaderModel.getById(leaderId);
    if (!existingLeader)
      return res
        .status(404)
        .json({ success: false, message: "Leader not found" });

    await LeaderModel.update(leaderId, req.body);
    publishMessage(QUEUES.LEADER_CACHE_CLEAR, {
      leaderId,
      county: existingLeader.county,
      constituency: existingLeader.constituency,
      ward: existingLeader.ward,
    }).catch(() => {});
    Logger.info(`Leader ${leaderId} updated`);
    res
      .status(200)
      .json({ success: true, message: "Leader updated successfully" });
  } catch (error) {
    Logger.error("Update leader error:", error);
    res.status(500).json({ success: false, message: "Error updating leader" });
  }
});

// ============================================
// DELETE LEADER (soft delete)
// ============================================
const deleteLeader = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  if (!leaderId)
    return res
      .status(400)
      .json({ success: false, message: "Leader ID is required" });

  try {
    const existingLeader = await LeaderModel.getById(leaderId);
    if (!existingLeader)
      return res
        .status(404)
        .json({ success: false, message: "Leader not found" });

    await safeQuery(
      `UPDATE leaders SET status = 'deleted', updated_at = ? WHERE leader_id = ?`,
      [getKenyaTimeISO(), leaderId],
    );
    publishMessage(QUEUES.LEADER_CACHE_CLEAR, {
      leaderId,
      county: existingLeader.county,
      constituency: existingLeader.constituency,
      ward: existingLeader.ward,
    }).catch(() => {});
    Logger.info(`Leader ${leaderId} deleted`);
    res
      .status(200)
      .json({ success: true, message: "Leader deleted successfully" });
  } catch (error) {
    Logger.error("Delete leader error:", error);
    res.status(500).json({ success: false, message: "Error deleting leader" });
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

  if (!leaderId || !finalUserId)
    return res.status(400).json({
      success: false,
      message: "Missing required fields: leaderId and user_id are required",
    });
  const allowedAmounts = [10, 50, 100, 500];
  if (!allowedAmounts.includes(boostAmount))
    return res.status(400).json({
      success: false,
      message: "Invalid boost amount. Allowed: 10, 50, 100, 500 KES",
    });

  try {
    await safeQuery("START TRANSACTION");

    const wallet = await safeQueryOne(
      `SELECT balance FROM user_wallets WHERE user_id = ? FOR UPDATE`,
      [finalUserId],
    );
    if (!wallet) {
      await safeQuery("ROLLBACK");
      return res
        .status(404)
        .json({ success: false, message: "Wallet not found for this user" });
    }
    if (wallet.balance < boostAmount) {
      await safeQuery("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. You have KES ${wallet.balance} but need KES ${boostAmount}`,
      });
    }

    await safeQuery(
      `UPDATE user_wallets SET balance = balance - ?, updated_at = NOW() WHERE user_id = ?`,
      [boostAmount, finalUserId],
    );

    const transactionId = `BOOST-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    await safeQuery(
      `INSERT INTO wallet_transactions (transaction_id, user_id, amount, type, reference_id, description, status, completed_at) VALUES (?, ?, ?, 'endorsement', ?, ?, 'completed', NOW())`,
      [
        transactionId,
        finalUserId,
        boostAmount,
        leaderId,
        `Boost payment for leader ${leaderId}`,
      ],
    );

    const leader = await safeQueryOne(
      `SELECT leader_id, name, county FROM leaders WHERE leader_id = ?`,
      [leaderId],
    );
    if (!leader) {
      await safeQuery("ROLLBACK");
      return res
        .status(404)
        .json({ success: false, message: "Leader not found" });
    }

    await safeQuery(
      `CREATE TABLE IF NOT EXISTS leaders_boosts (
        id INT PRIMARY KEY AUTO_INCREMENT, 
        leader_id VARCHAR(255) NOT NULL, 
        user_id VARCHAR(255) NOT NULL, 
        amount INT NOT NULL DEFAULT 10, 
        boost_score INT DEFAULT 10, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        INDEX idx_leader (leader_id), 
        INDEX idx_user (user_id), 
        INDEX idx_created (created_at)
      )`,
    );

    await safeQuery(
      `INSERT INTO leaders_boosts (leader_id, user_id, amount, boost_score, created_at) VALUES (?, ?, ?, ?, NOW())`,
      [leaderId, finalUserId, boostAmount, boostAmount],
    );

    memoryCache.delete(`wallet_${finalUserId}`);
    const cacheKeys = [
      `wallet_${finalUserId}`,
      `wallet_balance_${finalUserId}`,
      `user_wallet_${finalUserId}`,
    ];
    cacheKeys.forEach((key) => memoryCache.delete(key));

    await safeQuery(
      `UPDATE leaders SET boost_count = COALESCE(boost_count, 0) + 1, total_boost_amount = COALESCE(total_boost_amount, 0) + ?, boost_score = COALESCE(boost_score, 0) + ?, updated_at = NOW() WHERE leader_id = ?`,
      [boostAmount, boostAmount, leaderId],
    );

    await safeQuery("COMMIT");

    const updatedWallet = await safeQueryOne(
      `SELECT balance FROM user_wallets WHERE user_id = ?`,
      [finalUserId],
    );
    res.status(200).json({
      success: true,
      message: `Successfully boosted ${leader.name} with KES ${boostAmount}!`,
      data: {
        leader_id: leaderId,
        leader_name: leader.name,
        amount: boostAmount,
        new_balance: updatedWallet?.balance || 0,
        transaction_id: transactionId,
      },
    });

    publishMessage(QUEUES.LEADER_CACHE_CLEAR, {
      leaderId,
      county: leader.county,
    }).catch(() => {});
  } catch (error) {
    await safeQuery("ROLLBACK");
    Logger.error("Error boosting leader:", error);
    if (!res.headersSent)
      res.status(500).json({
        success: false,
        message: error.message || "Failed to boost leader",
      });
  }
});

// ============================================
// GET PERSONALIZED FEED (With Ranking Algorithm)
// ============================================
const getPersonalizedFeed = asyncHandler(async (req, res) => {
  try {
    const userCounty = req.user?.county || null;
    const userConstituency = req.user?.constituency || null;
    const { limit = 100 } = req.query;

    const cacheKey = `personalized_feed:${userCounty || "public"}:${userConstituency || "none"}:${limit}`;

    // Try cache first
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log(`[CACHE HIT] Returning cached personalized feed`);
        return res.status(200).json(JSON.parse(cachedData));
      }
    } catch (cacheErr) {
      Logger.warn(`Redis cache error: ${cacheErr.message}`);
    }

    // Get ALL active leaders with their images
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
        l.total_boost_amount,
        l.followers, 
        l.status, 
        l.created_at,
        (SELECT COUNT(*) FROM leader_followers WHERE leader_id = l.leader_id) as follower_count,
        (SELECT COUNT(*) FROM leaders_boosts WHERE leader_id = l.leader_id) as boost_count,
        (SELECT COUNT(*) FROM endorsements WHERE leader_id = l.leader_id AND status = 'active') as endorsement_count
      FROM leaders l
      LEFT JOIN leader_images li ON l.leader_id = li.leader_id AND li.is_primary = 1
      WHERE l.status = 'active'
      ORDER BY l.created_at DESC
      LIMIT ?`,
      [parseInt(limit) || 100],
    );

    // If no leaders, return empty array
    if (!allActiveLeaders || allActiveLeaders.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        userContext: {
          county: userCounty,
          constituency: userConstituency,
          isAuthenticated: !!req.user,
        },
        totalLeaders: 0,
        message: "No leaders found",
      });
    }

    // Calculate scores for each leader
    const leadersWithScores = allActiveLeaders.map((leader) => {
      try {
        const endorsementCount = leader.endorsement_count || 0;
        const boost_score = leader.boost_score || 0;
        const views = leader.views || 0;
        const verification = leader.verification || 0;
        const followers = leader.followers || 0;
        const created_at = leader.created_at;

        // Calculate score (0-100)
        const endorsementScore = Math.min(
          Math.log10(endorsementCount + 1) * 11.67,
          35,
        );
        const boostScore = Math.min((boost_score / 100) * 25, 25);
        const viewScore = Math.min(Math.log10(views + 1) * 5, 15);
        const verificationScore = verification === 1 ? 10 : 0;
        
        let recencyScore = 0;
        if (created_at) {
          const daysSinceCreation =
            (Date.now() - new Date(created_at).getTime()) /
            (1000 * 60 * 60 * 24);
          recencyScore = Math.max(0, 10 - (daysSinceCreation / 30) * 10);
        }
        
        const engagementRate =
          followers > 0 ? (endorsementCount / followers) * 100 : 0;
        const engagementScore = Math.min(engagementRate / 20, 5);

        const totalScore =
          endorsementScore +
          boostScore +
          viewScore +
          verificationScore +
          recencyScore +
          engagementScore;

        return {
          ...leader,
          endorsement_count: endorsementCount,
          score: Math.min(Math.round(totalScore * 10) / 10, 100),
        };
      } catch (err) {
        console.error("Error calculating score for leader:", err);
        return { ...leader, endorsement_count: 0, score: 0 };
      }
    });

    // Sort by score descending
    leadersWithScores.sort((a, b) => b.score - a.score);

    // Separate presidential candidates
    const presidentialCandidates = leadersWithScores.filter(
      (l) =>
        (l.position && l.position.toLowerCase() === "president") ||
        (l.position_running_for &&
          l.position_running_for.toLowerCase() === "president"),
    );

    const otherLeaders = leadersWithScores.filter(
      (l) =>
        l.position &&
        l.position.toLowerCase() !== "president" &&
        (!l.position_running_for ||
          l.position_running_for.toLowerCase() !== "president"),
    );

    // Group by county
    const countyMap = new Map();

    for (const leader of otherLeaders) {
      const county = leader.county || "Other";
      if (!countyMap.has(county)) {
        countyMap.set(county, {
          name: county,
          leaders: [],
          isUserCounty: county === userCounty,
        });
      }
      countyMap.get(county).leaders.push(leader);
    }

    // Sort leaders within each county by score
    for (const [_, county] of countyMap) {
      county.leaders.sort((a, b) => b.score - a.score);
    }

    // Build response groups
    const responseGroups = [];

    // 1. Presidential Candidates
    if (presidentialCandidates.length > 0) {
      responseGroups.push({
        id: "presidential",
        title: "Presidential Candidates",
        subtitle: "National Leadership",
        type: "national",
        leaders: presidentialCandidates,
        count: presidentialCandidates.length,
      });
    }

    // 2. User's County Leaders
    if (userCounty && countyMap.has(userCounty)) {
      const userCountyData = countyMap.get(userCounty);
      responseGroups.push({
        id: `county_${userCounty}`,
        title: userCounty,
        subtitle: `${userCountyData.leaders.length} aspirant${userCountyData.leaders.length !== 1 ? "s" : ""}`,
        type: "county",
        leaders: userCountyData.leaders.slice(0, 15),
        count: userCountyData.leaders.length,
      });
      countyMap.delete(userCounty);
    }

    // 3. Other Counties
    const sortedCounties = Array.from(countyMap.values())
      .sort((a, b) => b.leaders.length - a.leaders.length)
      .slice(0, 10);

    for (const county of sortedCounties) {
      responseGroups.push({
        id: `county_${county.name}`,
        title: county.name,
        subtitle: `${county.leaders.length} aspirant${county.leaders.length !== 1 ? "s" : ""}`,
        type: "county",
        leaders: county.leaders.slice(0, 12),
        count: county.leaders.length,
      });
    }

    const responseData = {
      success: true,
      data: responseGroups,
      userContext: {
        county: userCounty,
        constituency: userConstituency,
        isAuthenticated: !!req.user,
      },
      totalLeaders: allActiveLeaders.length,
      timestamp: new Date().toISOString(),
    };

    // Cache for 5 minutes
    try {
      await redis.set(cacheKey, JSON.stringify(responseData), "EX", 300);
    } catch (cacheErr) {
      Logger.warn(`Redis cache set error: ${cacheErr.message}`);
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Get personalized feed error:", error);
    Logger.error("Get personalized feed error:", error);

    res.status(200).json({
      success: true,
      data: [],
      userContext: {
        county: req.user?.county || null,
        constituency: req.user?.constituency || null,
        isAuthenticated: !!req.user,
      },
      totalLeaders: 0,
      message: "Unable to load personalized feed at this time",
    });
  }
});

// ============================================
// INVALIDATE FEED CACHE
// ============================================
const invalidateFeedCache = asyncHandler(async (req, res) => {
  try {
    const keys = await redis.keys("personalized_feed:*");
    if (keys.length > 0) {
      await Promise.all(keys.map((key) => redis.del(key)));
    }
    res.status(200).json({
      success: true,
      message: `Cleared ${keys.length} cache entries`,
    });
  } catch (error) {
    Logger.error("Cache invalidation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cache",
    });
  }
});

// ============================================
// LEADER ANALYTICS - COUNT PER LOCATION & POSITION
// ============================================

/**
 * Get leader analytics by county
 */
const getLeaderAnalyticsByCounty = asyncHandler(async (req, res) => {
  try {
    const countyStats = await safeQuery(`
      SELECT 
        county,
        COUNT(*) as total_leaders,
        SUM(CASE WHEN position = 'President' OR position_running_for = 'President' THEN 1 ELSE 0 END) as presidential,
        SUM(CASE WHEN position = 'Governor' OR position_running_for = 'Governor' THEN 1 ELSE 0 END) as governors,
        SUM(CASE WHEN position = 'Senator' OR position_running_for = 'Senator' THEN 1 ELSE 0 END) as senators,
        SUM(CASE WHEN position = 'MP' OR position = 'Member of Parliament' OR position_running_for = 'MP' THEN 1 ELSE 0 END) as mps,
        SUM(CASE WHEN position = 'MCA' OR position = 'Member of County Assembly' OR position_running_for = 'MCA' THEN 1 ELSE 0 END) as mcas,
        SUM(CASE WHEN position = 'Women Rep' OR position_running_for = 'Women Rep' THEN 1 ELSE 0 END) as women_reps
      FROM leaders 
      WHERE status = 'active'
      GROUP BY county
      ORDER BY total_leaders DESC
    `);

    const totalStats = await safeQueryOne(`
      SELECT 
        COUNT(*) as total_leaders,
        COUNT(DISTINCT county) as counties_with_leaders,
        SUM(CASE WHEN position = 'President' OR position_running_for = 'President' THEN 1 ELSE 0 END) as total_presidential,
        SUM(CASE WHEN position = 'Governor' OR position_running_for = 'Governor' THEN 1 ELSE 0 END) as total_governors,
        SUM(CASE WHEN position = 'Senator' OR position_running_for = 'Senator' THEN 1 ELSE 0 END) as total_senators,
        SUM(CASE WHEN position = 'MP' OR position = 'Member of Parliament' OR position_running_for = 'MP' THEN 1 ELSE 0 END) as total_mps,
        SUM(CASE WHEN position = 'MCA' OR position = 'Member of County Assembly' OR position_running_for = 'MCA' THEN 1 ELSE 0 END) as total_mcas,
        SUM(CASE WHEN position = 'Women Rep' OR position_running_for = 'Women Rep' THEN 1 ELSE 0 END) as total_women_reps
      FROM leaders 
      WHERE status = 'active'
    `);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total_leaders: totalStats?.total_leaders || 0,
          counties_with_leaders: totalStats?.counties_with_leaders || 0,
          total_presidential: totalStats?.total_presidential || 0,
          total_governors: totalStats?.total_governors || 0,
          total_senators: totalStats?.total_senators || 0,
          total_mps: totalStats?.total_mps || 0,
          total_mcas: totalStats?.total_mcas || 0,
          total_women_reps: totalStats?.total_women_reps || 0,
        },
        counties: countyStats || [],
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[getLeaderAnalyticsByCounty] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leader analytics by county",
      error: error.message,
    });
  }
});

/**
 * Get leader analytics by constituency
 */
const getLeaderAnalyticsByConstituency = asyncHandler(async (req, res) => {
  try {
    const { county } = req.query;

    let query = `
      SELECT 
        constituency,
        county,
        COUNT(*) as total_leaders,
        SUM(CASE WHEN position = 'MP' OR position = 'Member of Parliament' OR position_running_for = 'MP' THEN 1 ELSE 0 END) as mps,
        SUM(CASE WHEN position = 'MCA' OR position = 'Member of County Assembly' OR position_running_for = 'MCA' THEN 1 ELSE 0 END) as mcas
      FROM leaders 
      WHERE status = 'active' AND constituency IS NOT NULL AND constituency != ''
    `;

    const params = [];
    if (county) {
      query += ` AND county = ?`;
      params.push(county);
    }

    query += ` GROUP BY constituency, county ORDER BY total_leaders DESC`;

    const constituencyStats = await safeQuery(query, params);

    let summaryQuery = `
      SELECT 
        COUNT(DISTINCT constituency) as total_constituencies,
        COUNT(*) as total_leaders,
        SUM(CASE WHEN position = 'MP' OR position = 'Member of Parliament' OR position_running_for = 'MP' THEN 1 ELSE 0 END) as total_mps
      FROM leaders 
      WHERE status = 'active' AND constituency IS NOT NULL AND constituency != ''
    `;

    if (county) {
      summaryQuery += ` AND county = ?`;
    }

    const summary = await safeQueryOne(summaryQuery, county ? [county] : []);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total_constituencies: summary?.total_constituencies || 0,
          total_leaders: summary?.total_leaders || 0,
          total_mps: summary?.total_mps || 0,
        },
        constituencies: constituencyStats || [],
        filter: { county: county || "all" },
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[getLeaderAnalyticsByConstituency] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leader analytics by constituency",
      error: error.message,
    });
  }
});

/**
 * Get leader analytics by ward
 */
const getLeaderAnalyticsByWard = asyncHandler(async (req, res) => {
  try {
    const { constituency, county } = req.query;

    let query = `
      SELECT 
        ward,
        constituency,
        county,
        COUNT(*) as total_leaders,
        SUM(CASE WHEN position = 'MCA' OR position = 'Member of County Assembly' OR position_running_for = 'MCA' THEN 1 ELSE 0 END) as mcas,
        GROUP_CONCAT(DISTINCT name) as leader_names
      FROM leaders 
      WHERE status = 'active' AND ward IS NOT NULL AND ward != ''
    `;

    const params = [];
    if (constituency) {
      query += ` AND constituency = ?`;
      params.push(constituency);
    }
    if (county) {
      query += ` AND county = ?`;
      params.push(county);
    }

    query += ` GROUP BY ward, constituency, county ORDER BY total_leaders DESC`;

    const wardStats = await safeQuery(query, params);

    let summaryQuery = `
      SELECT 
        COUNT(DISTINCT ward) as total_wards,
        COUNT(*) as total_leaders,
        SUM(CASE WHEN position = 'MCA' OR position = 'Member of County Assembly' OR position_running_for = 'MCA' THEN 1 ELSE 0 END) as total_mcas
      FROM leaders 
      WHERE status = 'active' AND ward IS NOT NULL AND ward != ''
    `;

    if (constituency) {
      summaryQuery += ` AND constituency = ?`;
    } else if (county) {
      summaryQuery += ` AND county = ?`;
    }

    const summary = await safeQueryOne(summaryQuery, params);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total_wards: summary?.total_wards || 0,
          total_leaders: summary?.total_leaders || 0,
          total_mcas: summary?.total_mcas || 0,
        },
        wards: wardStats || [],
        filter: {
          constituency: constituency || "all",
          county: county || "all",
        },
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[getLeaderAnalyticsByWard] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leader analytics by ward",
      error: error.message,
    });
  }
});

/**
 * Get leader analytics by position
 */
const getLeaderAnalyticsByPosition = asyncHandler(async (req, res) => {
  try {
    const positionStats = await safeQuery(`
      SELECT 
        CASE 
          WHEN position = 'President' OR position_running_for = 'President' THEN 'President'
          WHEN position = 'Governor' OR position_running_for = 'Governor' THEN 'Governor'
          WHEN position = 'Senator' OR position_running_for = 'Senator' THEN 'Senator'
          WHEN position = 'MP' OR position = 'Member of Parliament' OR position_running_for = 'MP' THEN 'Member of Parliament'
          WHEN position = 'Women Rep' OR position_running_for = 'Women Rep' THEN 'Women Representative'
          WHEN position = 'MCA' OR position = 'Member of County Assembly' OR position_running_for = 'MCA' THEN 'MCA'
          ELSE 'Other'
        END as position_category,
        COUNT(*) as total_leaders,
        COUNT(DISTINCT county) as counties_covered,
        GROUP_CONCAT(DISTINCT name) as candidate_names
      FROM leaders 
      WHERE status = 'active'
      GROUP BY position_category
      ORDER BY total_leaders DESC
    `);

    const detailedStats = await safeQuery(`
      SELECT 
        county,
        SUM(CASE WHEN position = 'President' OR position_running_for = 'President' THEN 1 ELSE 0 END) as presidential,
        SUM(CASE WHEN position = 'Governor' OR position_running_for = 'Governor' THEN 1 ELSE 0 END) as governors,
        SUM(CASE WHEN position = 'Senator' OR position_running_for = 'Senator' THEN 1 ELSE 0 END) as senators,
        SUM(CASE WHEN position = 'MP' OR position = 'Member of Parliament' OR position_running_for = 'MP' THEN 1 ELSE 0 END) as mps,
        SUM(CASE WHEN position = 'MCA' OR position = 'Member of County Assembly' OR position_running_for = 'MCA' THEN 1 ELSE 0 END) as mcas,
        SUM(CASE WHEN position = 'Women Rep' OR position_running_for = 'Women Rep' THEN 1 ELSE 0 END) as women_reps
      FROM leaders 
      WHERE status = 'active'
      GROUP BY county
      ORDER BY county
    `);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total_positions: positionStats.length,
          total_leaders: positionStats.reduce(
            (sum, p) => sum + p.total_leaders,
            0,
          ),
        },
        by_position: positionStats,
        by_county_detailed: detailedStats,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[getLeaderAnalyticsByPosition] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leader analytics by position",
      error: error.message,
    });
  }
});

/**
 * Get complete leader dashboard analytics
 */
const getLeaderDashboardAnalytics = asyncHandler(async (req, res) => {
  try {
    const [
      totalLeaders,
      totalCounties,
      totalConstituencies,
      totalWards,
      verifiedLeaders,
      pendingLeaders,
      partyStats,
      topCounty,
      recentLeaders,
    ] = await Promise.all([
      safeQueryOne(
        "SELECT COUNT(*) as count FROM leaders WHERE status = 'active'",
      ),
      safeQueryOne(
        "SELECT COUNT(DISTINCT county) as count FROM leaders WHERE status = 'active' AND county IS NOT NULL",
      ),
      safeQueryOne(
        "SELECT COUNT(DISTINCT constituency) as count FROM leaders WHERE status = 'active' AND constituency IS NOT NULL",
      ),
      safeQueryOne(
        "SELECT COUNT(DISTINCT ward) as count FROM leaders WHERE status = 'active' AND ward IS NOT NULL",
      ),
      safeQueryOne(
        "SELECT COUNT(*) as count FROM leaders WHERE status = 'active' AND verification = 1",
      ),
      safeQueryOne(
        "SELECT COUNT(*) as count FROM leaders WHERE status = 'pending'",
      ),
      safeQuery(`
        SELECT 
          party,
          COUNT(*) as count
        FROM leaders 
        WHERE status = 'active' AND party IS NOT NULL
        GROUP BY party
        ORDER BY count DESC
        LIMIT 10
      `),
      safeQueryOne(`
        SELECT 
          county,
          COUNT(*) as count
        FROM leaders 
        WHERE status = 'active' AND county IS NOT NULL
        GROUP BY county
        ORDER BY count DESC
        LIMIT 1
      `),
      safeQuery(`
        SELECT 
          leader_id,
          name,
          party,
          position,
          county,
          created_at
        FROM leaders 
        WHERE status = 'active'
        ORDER BY created_at DESC
        LIMIT 10
      `),
    ]);

    const positionBreakdown = await safeQuery(`
      SELECT 
        CASE 
          WHEN position = 'President' OR position_running_for = 'President' THEN 'President'
          WHEN position = 'Governor' OR position_running_for = 'Governor' THEN 'Governor'
          WHEN position = 'Senator' OR position_running_for = 'Senator' THEN 'Senator'
          WHEN position = 'MP' OR position = 'Member of Parliament' OR position_running_for = 'MP' THEN 'MP'
          WHEN position = 'Women Rep' OR position_running_for = 'Women Rep' THEN 'Women Representative'
          WHEN position = 'MCA' OR position = 'Member of County Assembly' OR position_running_for = 'MCA' THEN 'MCA'
          ELSE 'Other'
        END as position,
        COUNT(*) as count
      FROM leaders 
      WHERE status = 'active'
      GROUP BY position
      ORDER BY count DESC
    `);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          total_leaders: totalLeaders?.count || 0,
          total_counties: totalCounties?.count || 0,
          total_constituencies: totalConstituencies?.count || 0,
          total_wards: totalWards?.count || 0,
          verified_leaders: verifiedLeaders?.count || 0,
          pending_leaders: pendingLeaders?.count || 0,
          top_county: topCounty?.county || "N/A",
          top_county_count: topCounty?.count || 0,
        },
        position_breakdown: positionBreakdown,
        top_parties: partyStats,
        recent_leaders: recentLeaders,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[getLeaderDashboardAnalytics] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leader dashboard analytics",
      error: error.message,
    });
  }
});

// ============================================
// EXPORTS
// ============================================
module.exports = {
  startLeaderWorkers,
  createLeader,
  getLeaderById,
  registerAspirant,
  loginAspirant,
  getMyProfile,
  updateMyProfile,
  searchLeaders,
  getLeadersByParty,
  getLeadersByCounty,
  getLeadersByConstituency,
  getLeadersByWard,
  updateLeader,
  deleteLeader,
  getLeaderStats,
  getPopularLeaders,
  getFeaturedLeaders,
  boostLeader,
  getPersonalizedFeed,
  invalidateFeedCache,
  getLeaderAnalyticsByCounty,
  getLeaderAnalyticsByConstituency,
  getLeaderAnalyticsByWard,
  getLeaderAnalyticsByPosition,
  getLeaderDashboardAnalytics,
};