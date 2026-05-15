const { safeQuery, safeQueryOne } = require("../configurations/db");
const Logger = require("../utils/logger/logger");

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.userId || req.query.userId;
    Logger.info(`[CART] Fetching cart for userId: ${userId}`);
    
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User ID required. Please log in." });
    }

    const cartItems = await safeQuery(
      `SELECT c.*, p.name, p.price, p.image, p.detail_url, p.category 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ? AND c.status = 'active'`,
      [userId],
    );

    // Calculate totals
    let subtotal = 0;
    cartItems.forEach((item) => {
      subtotal += item.price * item.quantity;
    });

    res.json({
      success: true,
      data: cartItems,
      summary: {
        subtotal,
        shipping: subtotal > 500 ? 0 : 40,
        tax: subtotal * 0.05,
        total: subtotal + (subtotal > 500 ? 0 : 40) + subtotal * 0.05,
      },
    });
  } catch (error) {
    Logger.error("Error fetching cart:", error);
    res.status(500).json({ success: false, message: "Error fetching cart" });
  }
};

// Add to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.userId || req.body.userId;
    const { productId, quantity = 1 } = req.body;
    Logger.info(`[CART] Adding to cart: userId=${userId}, productId=${productId}, quantity=${quantity}`);

    if (!userId || !productId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID and Product ID required" });
    }

    // Check if product exists
    const product = await safeQueryOne(
      `SELECT * FROM products WHERE id = ? AND status = 'active'`,
      [productId],
    );
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check if already in cart
    const existing = await safeQueryOne(
      `SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND status = 'active'`,
      [userId, productId],
    );

    if (existing) {
      // Update quantity
      await safeQuery(
        `UPDATE cart SET quantity = quantity + ?, updated_at = NOW() WHERE id = ?`,
        [quantity, existing.id],
      );
    } else {
      // Add new item
      await safeQuery(
        `INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)`,
        [userId, productId, quantity],
      );
    }

    res.json({ success: true, message: "Added to cart" });
  } catch (error) {
    Logger.error("Error adding to cart:", error);
    res.status(500).json({ success: false, message: "Error adding to cart" });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      await safeQuery(
        `UPDATE cart SET status = 'inactive', updated_at = NOW() WHERE id = ?`,
        [id],
      );
    } else {
      await safeQuery(
        `UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ?`,
        [quantity, id],
      );
    }

    res.json({ success: true, message: "Cart updated" });
  } catch (error) {
    Logger.error("Error updating cart:", error);
    res.status(500).json({ success: false, message: "Error updating cart" });
  }
};

// Remove from cart
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    await safeQuery(
      `UPDATE cart SET status = 'inactive', updated_at = NOW() WHERE id = ?`,
      [id],
    );

    res.json({ success: true, message: "Removed from cart" });
  } catch (error) {
    Logger.error("Error removing from cart:", error);
    res
      .status(500)
      .json({ success: false, message: "Error removing from cart" });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
};
