const { safeQuery, safeQueryOne } = require("../configurations/db");
const {
  processAndUploadImages,
  uploadToCloudinary,
  deleteMediaFromCloudinary,
  bulkDeleteFromCloudinary,
  optimizeExistingImage,
  getImageInfo,
} = require("../utils/images/imageProcessing");

// IMPORTANT: You need to import cloudinary if you're using it directly
const cloudinary = require("cloudinary").v2;

const LeaderService = {
  // ===== CREATE LEADER =====
  async createLeader(data, files, redisClient, Logger, getKenyaTimeISO) {
    const {
      name,
      party,
      slogan,
      motto,
      position,
      position_running_for,
      county,
      constituency,
      ward,
      location,
      education,
      experience,
      tags,
      facebook,
      twitter,
      instagram,
      tiktok,
      linkedin,
      youtube,
      website,
      primary_image = 0,
      images: processedImages, // This will come from the image processing middleware
    } = data;

    // Validate required fields
    if (!name) throw new Error("Name is required");

    // Prepare tags data
    let tagsData = [];
    try {
      if (tags) {
        tagsData = JSON.parse(tags);
      } else {
        const eduArray = education
          ? education.split("|").map((e) => e.trim())
          : [];
        const expArray = experience
          ? experience.split("|").map((e) => e.trim())
          : [];

        if (eduArray.length > 0) tagsData.push({ education: eduArray });
        if (expArray.length > 0) tagsData.push({ experience: expArray });
        if (slogan) tagsData.push({ slogan });
        if (motto) tagsData.push({ motto });
      }
    } catch (err) {
      Logger.error("Error parsing tags:", err);
    }

    // Generate leader_id
    const leader_id = `ldr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Insert leader into database
    const query = `
      INSERT INTO leaders (
        leader_id, name, party, slogan, motto, position, position_running_for,
        county, constituency, ward, location,
        tags, education, experience, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const now = getKenyaTimeISO();
    await safeQuery(query, [
      leader_id,
      name,
      party || null,
      slogan || null,
      motto || null,
      position || null,
      position_running_for || null,
      county || null,
      constituency || null,
      ward || null,
      location || null,
      JSON.stringify(tagsData),
      education || null,
      experience || null,
      "active",
      now,
      now,
    ]);

    // Handle image uploads - USING THE PROCESSED IMAGES FROM MIDDLEWARE
    const imageUrls = [];
    if (processedImages && processedImages.length > 0) {
      for (let i = 0; i < processedImages.length; i++) {
        const img = processedImages[i];
        try {
          imageUrls.push(img.url);

          const isPrimary =
            img.is_primary || i === parseInt(primary_image) ? 1 : 0;
          const imageId = `img_${Date.now()}_${i}`;

          // Store all image versions and metadata
          await safeQuery(
            `INSERT INTO leader_images (
              image_id, leader_id, image_url, public_id, 
              is_primary, sort_order, width, height, format, bytes,
              thumbnail_url, medium_url, social_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              imageId,
              leader_id,
              img.url,
              img.public_id,
              isPrimary,
              i,
              img.metadata?.width || null,
              img.metadata?.height || null,
              img.format || null,
              img.bytes || null,
              img.versions?.thumbnail || null,
              img.versions?.medium || null,
              img.versions?.social || null,
            ],
          );
        } catch (uploadError) {
          Logger.error("Image upload error:", uploadError);
        }
      }
    }
    // FALLBACK: If no processed images but files exist (direct upload without middleware)
    else if (files && files.length > 0) {
      Logger.warn(
        "Files provided but not processed by middleware - using fallback upload",
      );
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          // Upload to cloudinary using your enhanced function
          const result = await uploadToCloudinary(file.buffer);

          imageUrls.push(result.url);

          const isPrimary = i === parseInt(primary_image) ? 1 : 0;
          const imageId = `img_${Date.now()}_${i}`;

          await safeQuery(
            `INSERT INTO leader_images (
              image_id, leader_id, image_url, public_id, 
              is_primary, sort_order, width, height, format, bytes,
              thumbnail_url, medium_url, social_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              imageId,
              leader_id,
              result.url,
              result.public_id,
              isPrimary,
              i,
              result.width || null,
              result.height || null,
              result.format || null,
              result.bytes || null,
              result.versions?.thumbnail || null,
              result.versions?.medium || null,
              result.versions?.social || null,
            ],
          );
        } catch (uploadError) {
          Logger.error("Fallback image upload error:", uploadError);
        }
      }
    }

    // Handle social links
    const socialLinks = [
      { type: "website", url: website },
      { type: "facebook", url: facebook },
      { type: "twitter", url: twitter },
      { type: "instagram", url: instagram },
      { type: "tiktok", url: tiktok },
      { type: "linkedin", url: linkedin },
      { type: "youtube", url: youtube },
    ];

    for (const link of socialLinks) {
      if (link.url && link.url.trim() !== "") {
        await safeQuery(
          `INSERT INTO leader_portfolio (leader_id, type, url) VALUES (?, ?, ?)`,
          [leader_id, link.type, link.url.trim()],
        );
      }
    }

    // Clear relevant caches
    await redisClient.del("global:all_leaders");
    await redisClient.del("leaders:featured:*");
    await redisClient.del("leaders:list:*");

    Logger.info(`Leader created: ${leader_id} - ${name}`);

    return {
      leader_id,
      name,
      party,
      slogan,
      position,
      image_url: imageUrls.length > 0 ? imageUrls[0] : null,
      images: processedImages || [],
    };
  },

  // ===== GET ALL LEADERS WITH CACHE =====

  async getAllLeaders(redisClient, Logger) {
    const cacheKey = `leaders:all:simple`;

    try {
      // Try to get from cache first
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        Logger.info(`[CACHE HIT] getAllLeaders`);
        return JSON.parse(cachedData);
      }

      Logger.info(`[CACHE MISS] getAllLeaders`);

      // Simple query - get ALL leaders, no filters, no pagination
      const leaders = await safeQuery(
        `SELECT 
        leader_id, name, party, position, slogan, 
        county, constituency, ward, location,
        image_url, verification, education, status, created_at
      FROM leaders
      ORDER BY created_at DESC`,
        [],
      );

      // Optional: Add like counts if tables exist (but don't break if they don't)
      try {
        // Get like counts for all leaders in one query
        const leaderIds = leaders.map((l) => l.leader_id);

        if (leaderIds.length > 0) {
          const placeholders = leaderIds.map(() => "?").join(",");

          const likeCounts = await safeQuery(
            `SELECT leader_id, COUNT(*) as count 
           FROM leader_likes 
           WHERE leader_id IN (${placeholders})
           GROUP BY leader_id`,
            leaderIds,
          );

          const likesMap = {};
          likeCounts.forEach((item) => {
            likesMap[item.leader_id] = item.count;
          });

          leaders.forEach((leader) => {
            leader.likes = likesMap[leader.leader_id] || 0;
          });
        }
      } catch (err) {
        // If likes table doesn't exist, just set to 0
        Logger.warn("Could not fetch like counts:", err.message);
        leaders.forEach((leader) => {
          leader.likes = 0;
        });
      }

      const result = {
        data: leaders,
        count: leaders.length,
      };

      // Cache for 10 minutes
      await redisClient.set(cacheKey, JSON.stringify(result), { EX: 600 });

      return result;
    } catch (error) {
      Logger.error("Error in getAllLeaders service:", error);
      throw error;
    }
  },

  // ===== GET LEADER BY ID WITH CACHE =====
  async getLeaderById(leaderId, redisClient, Logger) {
    const cacheKey = `leader:${leaderId}`;

    try {
      // Try to get from cache first
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        Logger.info(`[CACHE HIT] getLeaderById: ${leaderId}`);
        return JSON.parse(cachedData);
      }

      Logger.info(`[CACHE MISS] getLeaderById: ${leaderId}`);

      // Get leader details
      const leader = await safeQueryOne(
        `SELECT 
          leader_id, name, party, slogan, motto, position, position_running_for,
          county, constituency, ward, location, tags, education, experience,
          image_url, verification, status, created_at, updated_at
        FROM leaders 
        WHERE leader_id = ?`,
        [leaderId],
      );

      if (!leader) {
        return null;
      }

      // Get stats
      const [likes, dislikes, views, followers] = await Promise.all([
        safeQueryOne(
          `SELECT COUNT(*) as count FROM leader_likes WHERE leader_id = ?`,
          [leaderId],
        ),
        safeQueryOne(
          `SELECT COUNT(*) as count FROM leader_dislikes WHERE leader_id = ?`,
          [leaderId],
        ),
        safeQueryOne(
          `SELECT COUNT(*) as count FROM leader_views WHERE leader_id = ?`,
          [leaderId],
        ),
        safeQueryOne(
          `SELECT COUNT(*) as count FROM leader_followers WHERE leader_id = ?`,
          [leaderId],
        ),
      ]);

      // Get all images with all versions
      const images = await safeQuery(
        `SELECT image_id, image_url, thumbnail_url, medium_url, social_url,
                public_id, is_primary, sort_order
         FROM leader_images 
         WHERE leader_id = ? 
         ORDER BY is_primary DESC, sort_order ASC`,
        [leaderId],
      );

      // Get social links
      const socialLinks = await safeQuery(
        `SELECT id, type, url FROM leader_portfolio WHERE leader_id = ?`,
        [leaderId],
      );

      // Parse tags if exists
      let parsedTags = [];
      let education = [];
      let experience = [];

      try {
        if (leader.tags) {
          parsedTags = JSON.parse(leader.tags);
          parsedTags.forEach((item) => {
            if (item.education) education = item.education;
            if (item.experience) experience = item.experience;
          });
        }
      } catch (err) {
        Logger.error("Tags parse error:", err);
      }

      // Use explicit education/experience fields if tags parsing failed
      if (education.length === 0 && leader.education) {
        education = leader.education.split("|").map((e) => e.trim());
      }
      if (experience.length === 0 && leader.experience) {
        experience = leader.experience.split("|").map((e) => e.trim());
      }

      const result = {
        ...leader,
        stats: {
          likes: likes?.count || 0,
          dislikes: dislikes?.count || 0,
          views: views?.count || 0,
          followers: followers?.count || 0,
        },
        images,
        social_links: socialLinks,
        education,
        experience,
        parsed_tags: parsedTags,
      };

      // Cache for 10 minutes (600 seconds)
      await redisClient.set(cacheKey, JSON.stringify(result), { EX: 600 });

      return result;
    } catch (error) {
      Logger.error("Error in getLeaderById service:", error);
      throw error;
    }
  },

  // ===== SEARCH LEADERS =====
  async searchLeaders(query, page = 1, limit = 20, redisClient, Logger) {
    const offset = (page - 1) * limit;
    const searchTerm = `%${query}%`;
    const cacheKey = `leaders:search:${query}:page=${page}`;

    try {
      // Try cache first
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        Logger.info(`[CACHE HIT] searchLeaders: ${query}`);
        return JSON.parse(cachedData);
      }

      // Get total count
      const countResult = await safeQueryOne(
        `SELECT COUNT(*) as total FROM leaders 
         WHERE status = 'active' 
         AND (name LIKE ? OR party LIKE ? OR position LIKE ? 
              OR county LIKE ? OR constituency LIKE ? OR ward LIKE ?
              OR education LIKE ? OR experience LIKE ? OR tags LIKE ?)`,
        [
          searchTerm,
          searchTerm,
          searchTerm,
          searchTerm,
          searchTerm,
          searchTerm,
          searchTerm,
          searchTerm,
          searchTerm,
        ],
      );
      const total = countResult?.total || 0;

      // Search leaders with relevance ranking
      const leaders = await safeQuery(
        `SELECT 
          l.leader_id, l.name, l.party, l.position, l.slogan,
          l.county, l.constituency, l.ward, l.image_url,
          l.verification, l.created_at,
          (SELECT thumbnail_url FROM leader_images WHERE leader_id = l.leader_id AND is_primary = 1 LIMIT 1) as thumbnail_image,
          (SELECT COUNT(*) FROM leader_likes WHERE leader_id = l.leader_id) as likes,
          CASE 
            WHEN l.name LIKE ? THEN 3
            WHEN l.party LIKE ? THEN 2
            WHEN l.position LIKE ? THEN 2
            WHEN l.county LIKE ? OR l.constituency LIKE ? OR l.ward LIKE ? THEN 1
            ELSE 0
          END as relevance
        FROM leaders l
        WHERE l.status = 'active' 
        AND (l.name LIKE ? OR l.party LIKE ? OR l.position LIKE ? 
             OR l.county LIKE ? OR l.constituency LIKE ? OR l.ward LIKE ?
             OR l.education LIKE ? OR l.experience LIKE ? OR l.tags LIKE ?)
        ORDER BY relevance DESC, l.created_at DESC
        LIMIT ? OFFSET ?`,
        [
          `${query}%`,
          `${query}%`,
          `${query}%`,
          `${query}%`,
          `${query}%`,
          `${query}%`,
          searchTerm,
          searchTerm,
          searchTerm,
          searchTerm,
          searchTerm,
          searchTerm,
          searchTerm,
          searchTerm,
          searchTerm,
          parseInt(limit),
          parseInt(offset),
        ],
      );

      const result = {
        data: leaders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };

      // Cache for 5 minutes
      await redisClient.set(cacheKey, JSON.stringify(result), { EX: 300 });

      return result;
    } catch (error) {
      Logger.error("Error in searchLeaders service:", error);
      throw error;
    }
  },

  // ===== GET LEADERS BY PARTY =====
  async getLeadersByParty(party, page = 1, limit = 20, redisClient, Logger) {
    const offset = (page - 1) * limit;
    const cacheKey = `leaders:party:${party}:page=${page}`;

    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const countResult = await safeQueryOne(
        `SELECT COUNT(*) as total FROM leaders WHERE status = 'active' AND party = ?`,
        [party],
      );
      const total = countResult?.total || 0;

      const leaders = await safeQuery(
        `SELECT 
          leader_id, name, party, position, county, constituency,
          image_url, verification, created_at,
          (SELECT thumbnail_url FROM leader_images WHERE leader_id = leaders.leader_id AND is_primary = 1 LIMIT 1) as thumbnail_image,
          (SELECT COUNT(*) FROM leader_likes WHERE leader_id = leaders.leader_id) as likes
        FROM leaders
        WHERE status = 'active' AND party = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`,
        [party, parseInt(limit), parseInt(offset)],
      );

      const result = {
        data: leaders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };

      await redisClient.set(cacheKey, JSON.stringify(result), { EX: 300 });

      return result;
    } catch (error) {
      Logger.error("Error in getLeadersByParty service:", error);
      throw error;
    }
  },

  // ===== GET LEADERS BY COUNTY =====
  async getLeadersByCounty(county, page = 1, limit = 20, redisClient, Logger) {
    const offset = (page - 1) * limit;
    const cacheKey = `leaders:county:${county}:page=${page}`;

    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const countResult = await safeQueryOne(
        `SELECT COUNT(*) as total FROM leaders WHERE status = 'active' AND county = ?`,
        [county],
      );
      const total = countResult?.total || 0;

      const leaders = await safeQuery(
        `SELECT 
          leader_id, name, party, position, constituency, ward,
          image_url, verification, created_at,
          (SELECT thumbnail_url FROM leader_images WHERE leader_id = leaders.leader_id AND is_primary = 1 LIMIT 1) as thumbnail_image
        FROM leaders
        WHERE status = 'active' AND county = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`,
        [county, parseInt(limit), parseInt(offset)],
      );

      const result = {
        data: leaders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };

      await redisClient.set(cacheKey, JSON.stringify(result), { EX: 300 });

      return result;
    } catch (error) {
      Logger.error("Error in getLeadersByCounty service:", error);
      throw error;
    }
  },

  // ===== UPDATE LEADER =====
  async updateLeader(
    leaderId,
    updateData,
    redisClient,
    Logger,
    getKenyaTimeISO,
  ) {
    try {
      const existingLeader = await safeQueryOne(
        `SELECT * FROM leaders WHERE leader_id = ?`,
        [leaderId],
      );

      if (!existingLeader) {
        throw new Error("Leader not found");
      }

      const updates = [];
      const values = [];

      // Allowed fields for update
      const allowedFields = [
        "name",
        "party",
        "slogan",
        "motto",
        "position",
        "position_running_for",
        "county",
        "constituency",
        "ward",
        "location",
        "education",
        "experience",
        "tags",
        "status",
        "verification",
        "image_url",
      ];

      allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
          updates.push(`${field} = ?`);
          if (field === "tags" && typeof updateData[field] === "object") {
            values.push(JSON.stringify(updateData[field]));
          } else {
            values.push(updateData[field]);
          }
        }
      });

      if (updates.length === 0) {
        throw new Error("No fields to update");
      }

      updates.push("updated_at = ?");
      values.push(getKenyaTimeISO());
      values.push(leaderId);

      const query = `UPDATE leaders SET ${updates.join(", ")} WHERE leader_id = ?`;
      await safeQuery(query, values);

      // Clear all related caches
      await this.clearLeaderCaches(leaderId, redisClient);

      return { leader_id: leaderId, ...updateData };
    } catch (error) {
      Logger.error("Error in updateLeader service:", error);
      throw error;
    }
  },

  // ===== DELETE LEADER (Soft Delete) =====
  async deleteLeader(leaderId, redisClient, Logger, getKenyaTimeISO) {
    try {
      const existingLeader = await safeQueryOne(
        `SELECT * FROM leaders WHERE leader_id = ?`,
        [leaderId],
      );

      if (!existingLeader) {
        throw new Error("Leader not found");
      }

      await safeQuery(
        `UPDATE leaders SET status = 'deleted', updated_at = ? WHERE leader_id = ?`,
        [getKenyaTimeISO(), leaderId],
      );

      // Clear all related caches
      await this.clearLeaderCaches(leaderId, redisClient);

      return true;
    } catch (error) {
      Logger.error("Error in deleteLeader service:", error);
      throw error;
    }
  },

  // ===== ADD SOCIAL LINK =====
  async addSocialLink(leaderId, type, url, redisClient, Logger) {
    try {
      const result = await safeQuery(
        `INSERT INTO leader_portfolio (leader_id, type, url) VALUES (?, ?, ?)`,
        [leaderId, type, url],
      );

      // Clear leader cache
      await redisClient.del(`leader:${leaderId}`);

      return {
        id: result.insertId,
        leader_id: leaderId,
        type,
        url,
      };
    } catch (error) {
      Logger.error("Error in addSocialLink service:", error);
      throw error;
    }
  },

  // ===== REMOVE SOCIAL LINK =====
  async removeSocialLink(leaderId, linkId, redisClient, Logger) {
    try {
      await safeQuery(
        `DELETE FROM leader_portfolio WHERE leader_id = ? AND id = ?`,
        [leaderId, linkId],
      );

      // Clear leader cache
      await redisClient.del(`leader:${leaderId}`);

      return true;
    } catch (error) {
      Logger.error("Error in removeSocialLink service:", error);
      throw error;
    }
  },

  // ===== GET LEADER STATS =====
  async getLeaderStats(leaderId, redisClient, Logger) {
    const cacheKey = `leader:stats:${leaderId}`;

    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const [likes, dislikes, views, followers] = await Promise.all([
        safeQueryOne(
          `SELECT COUNT(*) as count FROM leader_likes WHERE leader_id = ?`,
          [leaderId],
        ),
        safeQueryOne(
          `SELECT COUNT(*) as count FROM leader_dislikes WHERE leader_id = ?`,
          [leaderId],
        ),
        safeQueryOne(
          `SELECT COUNT(*) as count FROM leader_views WHERE leader_id = ?`,
          [leaderId],
        ),
        safeQueryOne(
          `SELECT COUNT(*) as count FROM leader_followers WHERE leader_id = ?`,
          [leaderId],
        ),
      ]);

      const stats = {
        likes: likes?.count || 0,
        dislikes: dislikes?.count || 0,
        views: views?.count || 0,
        followers: followers?.count || 0,
      };

      await redisClient.set(cacheKey, JSON.stringify(stats), { EX: 300 });

      return stats;
    } catch (error) {
      Logger.error("Error in getLeaderStats service:", error);
      throw error;
    }
  },

  // ===== GET FEATURED LEADERS =====
  async getFeaturedLeaders(limit = 10, redisClient, Logger) {
    const cacheKey = `leaders:featured:${limit}`;

    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const leaders = await safeQuery(
        `SELECT 
          l.leader_id, l.name, l.party, l.position, l.slogan,
          l.county,
          (SELECT thumbnail_url FROM leader_images WHERE leader_id = l.leader_id AND is_primary = 1 LIMIT 1) as thumbnail_image,
          (SELECT image_url FROM leader_images WHERE leader_id = l.leader_id AND is_primary = 1 LIMIT 1) as image_url,
          (SELECT COUNT(*) FROM leader_likes WHERE leader_id = l.leader_id) as likes,
          (SELECT COUNT(*) FROM leader_views WHERE leader_id = l.leader_id) as views
        FROM leaders l
        WHERE l.status = 'active'
        ORDER BY 
          (SELECT COUNT(*) FROM leader_views WHERE leader_id = l.leader_id) DESC,
          (SELECT COUNT(*) FROM leader_likes WHERE leader_id = l.leader_id) DESC
        LIMIT ?`,
        [parseInt(limit)],
      );

      await redisClient.set(cacheKey, JSON.stringify(leaders), { EX: 3600 });

      return leaders;
    } catch (error) {
      Logger.error("Error in getFeaturedLeaders service:", error);
      throw error;
    }
  },

  // ===== ADD IMAGE TO LEADER =====
  async addLeaderImage(leaderId, file, isPrimary = false, Logger) {
    try {
      // Upload to cloudinary using enhanced function
      const result = await uploadToCloudinary(file.buffer);

      const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      // Get next sort order
      const maxOrder = await safeQueryOne(
        `SELECT MAX(sort_order) as max_order FROM leader_images WHERE leader_id = ?`,
        [leaderId],
      );
      const sortOrder = (maxOrder?.max_order || -1) + 1;

      await safeQuery(
        `INSERT INTO leader_images (
          image_id, leader_id, image_url, public_id, 
          is_primary, sort_order, width, height, format, bytes,
          thumbnail_url, medium_url, social_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          imageId,
          leaderId,
          result.url,
          result.public_id,
          isPrimary ? 1 : 0,
          sortOrder,
          result.width || null,
          result.height || null,
          result.format || null,
          result.bytes || null,
          result.versions?.thumbnail || null,
          result.versions?.medium || null,
          result.versions?.social || null,
        ],
      );

      return {
        image_id: imageId,
        image_url: result.url,
        thumbnail_url: result.versions?.thumbnail,
        medium_url: result.versions?.medium,
        social_url: result.versions?.social,
        is_primary: isPrimary,
        sort_order: sortOrder,
      };
    } catch (error) {
      Logger.error("Error in addLeaderImage service:", error);
      throw error;
    }
  },

  // ===== REMOVE LEADER IMAGE =====
  async removeLeaderImage(imageId, redisClient, Logger) {
    try {
      // Get leader_id and public_id before deletion
      const image = await safeQueryOne(
        `SELECT leader_id, public_id FROM leader_images WHERE image_id = ?`,
        [imageId],
      );

      if (!image) {
        throw new Error("Image not found");
      }

      // Delete from Cloudinary
      if (image.public_id) {
        await deleteMediaFromCloudinary(image.public_id);
      }

      // Delete from database
      await safeQuery(`DELETE FROM leader_images WHERE image_id = ?`, [
        imageId,
      ]);

      // Clear leader cache
      await redisClient.del(`leader:${image.leader_id}`);

      return true;
    } catch (error) {
      Logger.error("Error in removeLeaderImage service:", error);
      throw error;
    }
  },

  // ===== SET PRIMARY IMAGE =====
  async setPrimaryImage(leaderId, imageId, redisClient, Logger) {
    try {
      // Remove primary flag from all images
      await safeQuery(
        `UPDATE leader_images SET is_primary = 0 WHERE leader_id = ?`,
        [leaderId],
      );

      // Set new primary image
      await safeQuery(
        `UPDATE leader_images SET is_primary = 1 WHERE image_id = ? AND leader_id = ?`,
        [imageId, leaderId],
      );

      // Clear leader cache
      await redisClient.del(`leader:${leaderId}`);

      return true;
    } catch (error) {
      Logger.error("Error in setPrimaryImage service:", error);
      throw error;
    }
  },

  // ===== CLEAR ALL LEADER CACHES =====
  async clearLeaderCaches(leaderId, redisClient) {
    try {
      const cacheKeys = await redisClient.keys("leaders:*");
      const deletePromises = [
        redisClient.del(`leader:${leaderId}`),
        redisClient.del(`leader:stats:${leaderId}`),
        ...cacheKeys.map((key) => redisClient.del(key)),
      ];

      await Promise.all(deletePromises);
    } catch (error) {
      // If redis doesn't support keys with wildcards, fallback to deleting known patterns
      const deletePromises = [
        redisClient.del(`leader:${leaderId}`),
        redisClient.del(`leader:stats:${leaderId}`),
      ];
      await Promise.all(deletePromises);
    }
  },

  // ===== BULK CREATE LEADERS (for importing many leaders) =====
  async bulkCreateLeaders(leadersData, redisClient, Logger, getKenyaTimeISO) {
    const results = [];
    const errors = [];

    for (const data of leadersData) {
      try {
        const leader = await this.createLeader(
          data,
          [], // No files for bulk import
          redisClient,
          Logger,
          getKenyaTimeISO,
        );
        results.push(leader);
      } catch (error) {
        errors.push({ data, error: error.message });
      }
    }

    return { results, errors };
  },

  // ===== GET IMAGE INFO =====
  async getImageInfo(publicId, Logger) {
    try {
      const info = await getImageInfo(publicId);
      return info;
    } catch (error) {
      Logger.error("Error in getImageInfo service:", error);
      throw error;
    }
  },

  // ===== OPTIMIZE EXISTING IMAGE =====
  async optimizeExistingImage(publicId, Logger) {
    try {
      const result = await optimizeExistingImage(publicId);
      return result;
    } catch (error) {
      Logger.error("Error in optimizeExistingImage service:", error);
      throw error;
    }
  },
};

module.exports = LeaderService;
