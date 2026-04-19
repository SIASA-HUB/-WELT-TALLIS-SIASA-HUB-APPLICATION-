const asyncHandler = require("express-async-handler");
const RallyModel = require("../model/rallyModel");
const Logger = require("../utils/logger/logger");
const redis = require("../utils/redis/redis");
const { getKenyaTimeISO } = require("../utils/timestamps/timeStamp");
const {
  deleteMediaFromCloudinary,
} = require("../utils/uploder/imageProceesing");

// Helper to generate anonymous ID from request
const getAnonymousId = (req) => {
  // Use IP + User Agent as anonymous identifier
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const userAgent = req.headers["user-agent"] || "unknown";
  const fingerprint = `${ip}-${userAgent}`;

  // Create a hash
  const crypto = require("crypto");
  return crypto
    .createHash("md5")
    .update(fingerprint)
    .digest("hex")
    .substring(0, 16);
};

// Helper to format image URLs for the UI
const formatImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  
  // Use gateway URL if possible, or fallback to the service itself
  const imageBaseUrl = process.env.IMAGE_BASE_URL || `http://localhost:${process.env.PORT || 8001}`;
  return `${imageBaseUrl.replace(/\/$/, '')}${url.startsWith('/') ? url : `/${url}`}`;
};

// Helper to format a rally object
const formatRally = (rally) => {
  if (!rally) return null;
  return {
    ...rally,
    image: formatImageUrl(rally.image),
    // Ensure thumbnails/medium sizes exist if we implement them later
    thumbnail_url: formatImageUrl(rally.image),
    medium_url: formatImageUrl(rally.image)
  };
};

// ===== CREATE RALLY WITH IMAGE =====
const createRally = asyncHandler(async (req, res) => {
  try {
    Logger.info("[CREATE RALLY] Request received", req.body);

    const rallyData = {
      ...req.body,
      image: req.body.image?.url || req.body.image_url || "",
      image_public_id: req.body.image?.public_id || null,
    };

    const rally = await RallyModel.create(rallyData, getKenyaTimeISO);

    // Clear caching
    try {
      const keys = await redis.keys("rallies:*");
      if (keys.length > 0) await redis.del(keys);
    } catch (cacheError) {
      Logger.error("[CACHE CLEAR ERROR]", cacheError);
    }

    res.status(201).json({
      success: true,
      message: "Rally created successfully",
      data: formatRally(rally),
    });
  } catch (error) {
    Logger.error("[CREATE RALLY] Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// ===== GET ALL RALLIES =====
const getAllRallies = asyncHandler(async (req, res) => {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      county: req.query.county,
      party: req.query.party,
      type: req.query.type,
      search: req.query.search,
    };

    const cacheKey = `rallies:list:${JSON.stringify(filters)}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return res.status(200).json(JSON.parse(cached));
    } catch (e) {}

    const result = await RallyModel.getAll(filters);
    const formattedData = (result.data || []).map(formatRally);

    const response = {
      success: true,
      data: formattedData,
      pagination: result.pagination,
    };

    try {
      await redis.set(cacheKey, JSON.stringify(response), "EX", 300);
    } catch (e) {}

    res.status(200).json(response);
  } catch (error) {
    Logger.error("[GET ALL RALLIES] Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch rallies" });
  }
});

// ===== GET UPCOMING RALLIES =====
const getUpcomingRallies = asyncHandler(async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const cacheKey = `rallies:upcoming:${limit}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) return res.status(200).json(JSON.parse(cached));
    } catch (e) {}

    const rallies = await RallyModel.getUpcoming(limit);
    const formattedRallies = rallies.map(formatRally);

    const response = {
      success: true,
      count: formattedRallies.length,
      data: formattedRallies,
    };

    try {
      await redis.set(cacheKey, JSON.stringify(response), "EX", 300);
    } catch (e) {}

    res.status(200).json(response);
  } catch (error) {
    Logger.error("[GET UPCOMING RALLIES] Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch upcoming rallies" });
  }
});

// ===== GET RALLY BY ID =====
const getRallyById = asyncHandler(async (req, res) => {
  try {
    const { rallyId } = req.params;
    const rally = await RallyModel.getById(rallyId);

    if (!rally) return res.status(404).json({ success: false, message: "Rally not found" });

    res.status(200).json({
      success: true,
      data: formatRally(rally),
    });
  } catch (error) {
    Logger.error("[GET RALLY BY ID] Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch rally" });
  }
});

// ===== UPDATE RALLY =====
const updateRally = asyncHandler(async (req, res) => {
  try {
    const { rallyId } = req.params;
    const existingRally = await RallyModel.getById(rallyId);

    if (!existingRally) return res.status(404).json({ success: false, message: "Rally not found" });

    const updateData = { ...req.body };
    if (req.body.image?.url) {
      updateData.image = req.body.image.url;
      updateData.image_public_id = req.body.image.public_id;
    }

    const updated = await RallyModel.update(rallyId, updateData, getKenyaTimeISO);

    try {
      const keys = await redis.keys("rallies:*");
      if (keys.length > 0) await redis.del(keys);
    } catch (e) {}

    res.status(200).json({
      success: true,
      message: "Rally updated successfully",
      data: formatRally(updated),
    });
  } catch (error) {
    Logger.error("[UPDATE RALLY] Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// ===== DELETE RALLY =====
const deleteRally = asyncHandler(async (req, res) => {
  try {
    const { rallyId } = req.params;
    const rally = await RallyModel.getById(rallyId);
    if (!rally) return res.status(404).json({ success: false, message: "Rally not found" });

    await RallyModel.delete(rallyId);

    try {
      const keys = await redis.keys("rallies:*");
      if (keys.length > 0) await redis.del(keys);
    } catch (e) {}

    res.status(200).json({ success: true, message: "Rally deleted successfully" });
  } catch (error) {
    Logger.error("[DELETE RALLY] Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete rally" });
  }
});

// ===== TOGGLE LIKE =====
const toggleLike = asyncHandler(async (req, res) => {
  try {
    const { rallyId } = req.params;
    const anonymousId = getAnonymousId(req);
    const result = await RallyModel.toggleLike(rallyId, anonymousId, getKenyaTimeISO);

    try {
      const keys = await redis.keys("rallies:*");
      if (keys.length > 0) await redis.del(keys);
      await redis.del(`rally:${rallyId}`);
    } catch (e) {}

    res.status(200).json({
      success: true,
      liked: result.liked,
      likes_count: result.likes_count,
      message: result.liked ? "Rally liked" : "Rally unliked",
    });
  } catch (error) {
    Logger.error("[TOGGLE LIKE] Error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle like" });
  }
});

// ===== TOGGLE ATTEND =====
const toggleAttend = asyncHandler(async (req, res) => {
  try {
    const { rallyId } = req.params;
    const anonymousId = getAnonymousId(req);
    const result = await RallyModel.toggleAttend(rallyId, anonymousId, getKenyaTimeISO);

    try {
      const keys = await redis.keys("rallies:*");
      if (keys.length > 0) await redis.del(keys);
      await redis.del(`rally:${rallyId}`);
    } catch (e) {}

    res.status(200).json({
      success: true,
      attending: result.attending,
      attendees_count: result.attendees_count,
      message: result.attending ? "You are attending" : "Attendance cancelled",
    });
  } catch (error) {
    Logger.error("[TOGGLE ATTEND] Error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle attendance" });
  }
});

// ===== GET RALLIES BY PARTY =====
const getRalliesByParty = asyncHandler(async (req, res) => {
  try {
    const { party } = req.params;
    const limit = req.query.limit || 20;
    const rallies = await RallyModel.getByParty(party, limit);

    res.status(200).json({
      success: true,
      count: rallies.length,
      data: rallies.map(formatRally),
    });
  } catch (error) {
    Logger.error("[GET RALLIES BY PARTY] Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch rallies by party" });
  }
});

// ===== GET RALLIES BY COUNTY =====
const getRalliesByCounty = asyncHandler(async (req, res) => {
  try {
    const { county } = req.params;
    const limit = req.query.limit || 20;
    const rallies = await RallyModel.getByCounty(county, limit);

    res.status(200).json({
      success: true,
      count: rallies.length,
      data: rallies.map(formatRally),
    });
  } catch (error) {
    Logger.error("[GET RALLIES BY COUNTY] Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch rallies by county" });
  }
});

// ===== CLEAR CACHE =====
const clearCache = asyncHandler(async (req, res) => {
  try {
    const keys = await redis.keys("rallies:*");
    if (keys.length > 0) await redis.del(keys);
    res.status(200).json({ success: true, message: "Rally caches cleared" });
  } catch (error) {
    Logger.error("[CLEAR CACHE] Error:", error);
    res.status(500).json({ success: false, message: "Failed to clear cache" });
  }
});

module.exports = {
  createRally,
  getAllRallies,
  getUpcomingRallies,
  getRallyById,
  updateRally,
  deleteRally,
  toggleLike,
  toggleAttend,
  getRalliesByParty,
  getRalliesByCounty,
  clearCache,
};
