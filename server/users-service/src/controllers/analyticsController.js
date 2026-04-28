const asyncHandler = require("express-async-handler");
const { safeQuery, safeQueryOne } = require("../configurations/db");
const Logger = require("../utils/logger/logger");

/**
 * @desc    Track a click on an application element
 * @route   POST /api/v1/users/analytics/click
 * @access  Public
 */
const trackClick = asyncHandler(async (req, res) => {
  const { 
    element_id, 
    element_class, 
    element_tag, 
    page_url, 
    text_content, 
    user_id 
  } = req.body;
  
  const ip = req.ip;

  try {
    // Sanitize inputs to ensure they are strings or null
    const clean_id = element_id ? String(element_id).substring(0, 100) : null;
    const clean_class = element_class ? String(element_class).substring(0, 255) : null;
    const clean_tag = element_tag ? String(element_tag).substring(0, 50) : null;
    const clean_url = page_url ? String(page_url).substring(0, 255) : null;
    const clean_text = text_content ? String(text_content).substring(0, 255) : null;
    const clean_user = user_id ? String(user_id).substring(0, 50) : null;
    const clean_ip = ip ? String(ip).substring(0, 45) : "0.0.0.0";

    await safeQuery(
      `INSERT INTO app_clicks (
        element_id, element_class, element_tag, page_url, text_content, user_id, ip_address, clicked_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        clean_id,
        clean_class,
        clean_tag,
        clean_url,
        clean_text,
        clean_user,
        clean_ip
      ]
    );

    res.status(200).json({ success: true, message: "Click tracked" });
  } catch (error) {
    Logger.error("Error tracking click:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

/**
 * @desc    Get click statistics for admin
 * @route   GET /api/v1/users/analytics/clicks
 * @access  Admin
 */
const getClickStats = asyncHandler(async (req, res) => {
  const { limit = 20, period = 'all' } = req.query;
  
  try {
    let timeFilter = '';
    if (period === 'day') {
      timeFilter = 'WHERE clicked_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)';
    } else if (period === 'week') {
      timeFilter = 'WHERE clicked_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (period === 'month') {
      timeFilter = 'WHERE clicked_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }

    // Top clicked elements by ID
    const topElementsById = await safeQuery(
      `SELECT element_id, text_content, COUNT(*) as click_count 
       FROM app_clicks 
       ${timeFilter}
       WHERE element_id IS NOT NULL AND element_id != ''
       GROUP BY element_id, text_content
       ORDER BY click_count DESC 
       LIMIT ?`,
      [parseInt(limit)]
    );

    // Top clicked pages
    const topPages = await safeQuery(
      `SELECT page_url, COUNT(*) as click_count 
       FROM app_clicks 
       ${timeFilter}
       GROUP BY page_url
       ORDER BY click_count DESC 
       LIMIT ?`,
      [parseInt(limit)]
    );

    // Click distribution by tag
    const tagDistribution = await safeQuery(
      `SELECT element_tag, COUNT(*) as count 
       FROM app_clicks 
       ${timeFilter}
       GROUP BY element_tag
       ORDER BY count DESC`
    );

    res.status(200).json({
      success: true,
      data: {
        topElementsById,
        topPages,
        tagDistribution
      }
    });
  } catch (error) {
    Logger.error("Error fetching click stats:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = {
  trackClick,
  getClickStats
};
