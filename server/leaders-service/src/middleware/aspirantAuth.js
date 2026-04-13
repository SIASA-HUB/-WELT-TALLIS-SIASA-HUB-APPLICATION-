
// Middleware that verifies a user is an authenticated aspirant (leader)

const { verifyAccessToken } = require("../../../global/auth/tokens");
const { getTokenFromRequest: getTokenHelper } = require("../../../global/auth/cookies");


/**
 * verifyAspirantToken — only allows users with role 'leader' or 'aspirant'
 */
const verifyAspirantToken = (req, res, next) => {
  try {
    const token = getTokenHelper(req);
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required. Please login as an aspirant." });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: "Invalid or expired token. Please login again." });
    }

    const allowedRoles = ["leader", "aspirant", "admin"];
    if (!allowedRoles.includes(decoded.role)) {
      return res.status(403).json({ success: false, message: "Access denied. Only aspirants can access this resource." });
    }

    req.user = decoded;
    req.userId = decoded.userId;
    req.leaderId = decoded.leaderId || decoded.leader_id || decoded.userId;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: "Authentication error" });
  }
};

/**
 * verifyOwnsManifesto — ensures the aspirant owns the manifesto they're modifying
 * Must be called after verifyAspirantToken
 */
const verifyOwnsManifesto = async (req, res, next) => {
  try {
    const { manifestoId } = req.params;
    const userId = req.user?.userId;

    if (!manifestoId || !userId) {
      return res.status(400).json({ success: false, message: "Manifesto ID and auth required" });
    }

    const { safeQueryOne } = require("../../../global/index").db;
    const manifesto = await safeQueryOne(
      `SELECT id, leader_id FROM manifestos WHERE id = ?`,
      [manifestoId]
    );

    if (!manifesto) {
      return res.status(404).json({ success: false, message: "Manifesto not found" });
    }

    const isAdmin = req.user?.role === "admin";
    if (!isAdmin && manifesto.leader_id !== userId) {
      return res.status(403).json({ success: false, message: "You can only modify your own manifestos" });
    }

    req.manifesto = manifesto;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: "Authorization error" });
  }
};

module.exports = { verifyAspirantToken, verifyOwnsManifesto };
