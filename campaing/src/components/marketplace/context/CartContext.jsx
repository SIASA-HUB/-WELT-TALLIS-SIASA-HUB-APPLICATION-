import React, { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      const marketCart = localStorage.getItem("marketplace_cart");
      
      let items = [];
      if (savedCart) items = JSON.parse(savedCart);
      
      if (marketCart) {
        const parsedMarket = JSON.parse(marketCart);
        if (Array.isArray(parsedMarket)) {
          parsedMarket.forEach(mItem => {
            const mid = mItem.product_id || mItem._id || mItem.id;
            if (!items.find(i => (i.product_id || i._id || i.id) === mid)) {
              items.push(mItem);
            }
          });
        }
        // Defer removal to an effect or just do it here
        setTimeout(() => localStorage.removeItem("marketplace_cart"), 0);
      }
      return items;
    } catch (e) {
      console.error("Error initializing cart:", e);
      return [];
    }
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const productId = product.product_id || product._id || product.id;
      const existingItem = prevItems.find((item) => (item.product_id || item._id || item.id) === productId);

      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map((item) =>
          (item.product_id || item._id || item.id) === productId
            ? {
                ...item,
                quantity: (item.quantity || 1) + (product.quantity || 1),
              }
            : item,
        );
      } else {
        // Add new item
        return [...prevItems, { ...product, quantity: product.quantity || 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId),
    );
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item,
        ),
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || item.cost || 0;
      const quantity = item.quantity || 1;
      return total + price * quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
