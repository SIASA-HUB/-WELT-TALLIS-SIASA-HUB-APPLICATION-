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

    // Clear ALL cache keys related to rallies
    try {
      const keys = await redis.keys("rallies:*");
      if (keys.length > 0) {
        await redis.del(keys);
        Logger.info(`[CACHE CLEAR] Cleared ${keys.length} rally cache keys`);
      }
      await redis.del("rallies:all");
      await redis.del("rallies:upcoming");
      Logger.info("[CACHE CLEAR] Cleared specific rally cache keys");
    } catch (cacheError) {
      Logger.error("[CACHE CLEAR ERROR]", cacheError);
    }

    res.status(201).json({
      success: true,
      message: "Rally created successfully",
      data: rally,
    });
  } catch (error) {
    Logger.error("[CREATE RALLY] Error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// ===== GET ALL RALLIES =====
const getAllRallies = asyncHandler(async (req, res) => {
  try {
    Logger.info("[GET ALL RALLIES] Request received", req.query);

    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      county: req.query.county,
      party: req.query.party,
      type: req.query.type,
      search: req.query.search,
    };

    const result = await RallyModel.getAll(filters);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    Logger.error("[GET ALL RALLIES] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rallies",
    });
  }
});

// ===== GET UPCOMING RALLIES =====
const getUpcomingRallies = asyncHandler(async (req, res) => {
  try {
    Logger.info("[GET UPCOMING RALLIES] Request received");

    const limit = req.query.limit || 10;
    const rallies = await RallyModel.getUpcoming(limit);

    res.status(200).json({
      success: true,
      count: rallies.length,
      data: rallies,
    });
  } catch (error) {
    Logger.error("[GET UPCOMING RALLIES] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming rallies",
    });
  }
});

// ===== GET RALLY BY ID =====
const getRallyById = asyncHandler(async (req, res) => {
  try {
    const { rallyId } = req.params;
    Logger.info(`[GET RALLY BY ID] Request for ${rallyId}`);

    const rally = await RallyModel.getById(rallyId);

    if (!rally) {
      return res.status(404).json({
        success: false,
        message: "Rally not found",
      });
    }

    res.status(200).json({
      success: true,
      data: rally,
    });
  } catch (error) {
    Logger.error("[GET RALLY BY ID] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rally",
    });
  }
});

// ===== UPDATE RALLY WITH IMAGE =====
const updateRally = asyncHandler(async (req, res) => {
  try {
    const { rallyId } = req.params;
    Logger.info(`[UPDATE RALLY] Request for ${rallyId}`, req.body);

    const existingRally = await RallyModel.getById(rallyId);

    if (!existingRally) {
      return res.status(404).json({
        success: false,
        message: "Rally not found",
      });
    }

    const updateData = { ...req.body };

    if (req.body.image?.url) {
      updateData.image = req.body.image.url;
      updateData.image_public_id = req.body.image.public_id;

      if (existingRally.image_public_id) {
        try {
          await deleteMediaFromCloudinary(existingRally.image_public_id);
          Logger.info(`Deleted old image for rally ${rallyId}`);
        } catch (deleteError) {
          Logger.error(
            `Failed to delete old image for rally ${rallyId}:`,
            deleteError,
          );
        }
      }
    }

    const updated = await RallyModel.update(
      rallyId,
      updateData,
      getKenyaTimeISO,
    );

    try {
      const keys = await redis.keys("rallies:*");
      if (keys.length > 0) {
        await redis.del(keys);
        Logger.info(
          `[CACHE CLEAR] Cleared ${keys.length} rally cache keys after update`,
        );
      }
    } catch (cacheError) {
      Logger.error("[CACHE CLEAR ERROR]", cacheError);
    }

    res.status(200).json({
      success: true,
      message: "Rally updated successfully",
      data: updated,
    });
  } catch (error) {
    Logger.error("[UPDATE RALLY] Error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// ===== DELETE RALLY =====
const deleteRally = asyncHandler(async (req, res) => {
  try {
    const { rallyId } = req.params;
    Logger.info(`[DELETE RALLY] Request for ${rallyId}`);

    const rally = await RallyModel.getById(rallyId);

    if (!rally) {
      return res.status(404).json({
        success: false,
        message: "Rally not found",
      });
    }

    if (rally.image_public_id) {
      try {
        await deleteMediaFromCloudinary(rally.image_public_id);
        Logger.info(`Deleted image for rally ${rallyId}`);
      } catch (deleteError) {
        Logger.error(
          `Failed to delete image for rally ${rallyId}:`,
          deleteError,
        );
      }
    }

    await RallyModel.delete(rallyId);

    try {
      const keys = await redis.keys("rallies:*");
      if (keys.length > 0) {
        await redis.del(keys);
        Logger.info(
          `[CACHE CLEAR] Cleared ${keys.length} rally cache keys after delete`,
        );
      }
    } catch (cacheError) {
      Logger.error("[CACHE CLEAR ERROR]", cacheError);
    }

    res.status(200).json({
      success: true,
      message: "Rally deleted successfully",
    });
  } catch (error) {
    Logger.error("[DELETE RALLY] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete rally",
    });
  }
});

// ===== TOGGLE LIKE - FIXED CACHE =====
const toggleLike = asyncHandler(async (req, res) => {
  try {
    const { rallyId } = req.params;
    const anonymousId = getAnonymousId(req);

    Logger.info(`[TOGGLE LIKE] Rally: ${rallyId}, Anonymous: ${anonymousId}`);

    const result = await RallyModel.toggleLike(
      rallyId,
      anonymousId,
      getKenyaTimeISO,
    );

    // FIXED: Clear ALL rally list caches so the counts update everywhere
    try {
      const keys = await redis.keys("rallies:*");
      if (keys.length > 0) await redis.del(keys);
      await redis.del(`rally:${rallyId}`);
      Logger.info(`[CACHE CLEAR] Cleared caches for Like update`);
    } catch (cacheError) {
      Logger.error("[CACHE CLEAR ERROR]", cacheError);
    }

    res.status(200).json({
      success: true,
      liked: result.liked,
      likes_count: result.likes_count,
      message: result.liked ? "Rally liked" : "Rally unliked",
    });
  } catch (error) {
    Logger.error("[TOGGLE LIKE] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle like",
    });
  }
});

// ===== TOGGLE ATTEND - FIXED CACHE =====
const toggleAttend = asyncHandler(async (req, res) => {
  try {
    const { rallyId } = req.params;
    const anonymousId = getAnonymousId(req);

    Logger.info(`[TOGGLE ATTEND] Rally: ${rallyId}, Anonymous: ${anonymousId}`);

    const result = await RallyModel.toggleAttend(
      rallyId,
      anonymousId,
      getKenyaTimeISO,
    );

    // FIXED: Clear ALL rally list caches so the counts update everywhere
    try {
      const keys = await redis.keys("rallies:*");
      if (keys.length > 0) await redis.del(keys);
      await redis.del(`rally:${rallyId}`);
      Logger.info(`[CACHE CLEAR] Cleared caches for Attend update`);
    } catch (cacheError) {
      Logger.error("[CACHE CLEAR ERROR]", cacheError);
    }

    res.status(200).json({
      success: true,
      attending: result.attending,
      attendees_count: result.attendees_count,
      message: result.attending ? "You are attending" : "Attendance cancelled",
    });
  } catch (error) {
    Logger.error("[TOGGLE ATTEND] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle attendance",
    });
  }
});

// ===== GET RALLIES BY PARTY =====
const getRalliesByParty = asyncHandler(async (req, res) => {
  try {
    const { party } = req.params;
    const limit = req.query.limit || 20;

    Logger.info(`[GET RALLIES BY PARTY] Party: ${party}`);

    const rallies = await RallyModel.getByParty(party, limit);

    res.status(200).json({
      success: true,
      count: rallies.length,
      data: rallies,
    });
  } catch (error) {
    Logger.error("[GET RALLIES BY PARTY] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rallies by party",
    });
  }
});

// ===== GET RALLIES BY COUNTY =====
const getRalliesByCounty = asyncHandler(async (req, res) => {
  try {
    const { county } = req.params;
    const limit = req.query.limit || 20;

    Logger.info(`[GET RALLIES BY COUNTY] County: ${county}`);

    const rallies = await RallyModel.getByCounty(county, limit);

    res.status(200).json({
      success: true,
      count: rallies.length,
      data: rallies,
    });
  } catch (error) {
    Logger.error("[GET RALLIES BY COUNTY] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rallies by county",
    });
  }
});

// ===== CLEAR CACHE =====
const clearCache = asyncHandler(async (req, res) => {
  try {
    const keys = await redis.keys("rallies:*");
    if (keys.length > 0) {
      await redis.del(keys);
      Logger.info(
        `[CACHE CLEAR] Manually cleared ${keys.length} rally cache keys`,
      );
    }

    res.status(200).json({
      success: true,
      message: "Rally caches cleared",
    });
  } catch (error) {
    Logger.error("[CLEAR CACHE] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cache",
    });
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
