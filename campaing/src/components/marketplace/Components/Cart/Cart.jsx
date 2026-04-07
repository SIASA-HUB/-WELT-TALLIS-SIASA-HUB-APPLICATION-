// Cart.js - Complete Fixed Cart Component
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  ShoppingCart,
  CreditCard,
  Loader2,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:8007";

// Color Theme
const COLORS = {
  primary: "#1e3c72",
  primaryDark: "#152c54",
  primaryLight: "#2a4a8a",
  accent: "#e74c3c",
  text: "#1a1a1a",
  textLight: "#666",
  border: "#e0e0e0",
  background: "#f8f9fa",
  white: "#ffffff",
  success: "#27ae60",
};

// Styled Components
const CartWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
  min-height: calc(100vh - 200px);
  background: ${COLORS.background};
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${COLORS.textLight};
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 24px;
  transition: all 0.2s;

  &:hover {
    color: ${COLORS.primary};
    gap: 12px;
  }
`;

const CartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const CartItemsSection = styled.div`
  background: ${COLORS.white};
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 20px 24px;
  background: ${COLORS.white};
  border-bottom: 1px solid ${COLORS.border};
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${COLORS.text};
`;

const CartFooter = styled.div`
  padding: 20px 24px;
  background: ${COLORS.white};
  border-top: 1px solid ${COLORS.border};
  display: flex;
  justify-content: flex-end;
`;

const CheckoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: ${COLORS.primary};
  color: ${COLORS.white};
  border: none;
  padding: 14px 32px;
  border-radius: 40px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${COLORS.primaryDark};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(30, 60, 114, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  flex-direction: column;
  gap: 16px;
`;

const Spinner = styled(Loader2)`
  animation: spin 1s linear infinite;
  color: ${COLORS.primary};
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: ${COLORS.accent};
  padding: 12px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
`;

// CartItem Component (inline for completeness)
const CartItemWrapper = styled.div`
  display: flex;
  padding: 20px 24px;
  border-bottom: 1px solid ${COLORS.border};
  gap: 16px;
  transition: background 0.2s;

  &:hover {
    background: ${COLORS.background};
  }

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const ItemImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
  background: ${COLORS.background};
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.h4`
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: ${COLORS.text};
`;

const ItemPrice = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${COLORS.primary};
  margin-bottom: 8px;
`;

const ItemOriginalPrice = styled.span`
  font-size: 12px;
  color: ${COLORS.textLight};
  text-decoration: line-through;
  margin-left: 8px;
  font-weight: normal;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
`;

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${COLORS.background};
  border: 1px solid ${COLORS.border};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: ${COLORS.text};

  &:hover {
    background: ${COLORS.primary};
    border-color: ${COLORS.primary};
    color: ${COLORS.white};
  }
`;

const Quantity = styled.span`
  font-size: 14px;
  font-weight: 600;
  min-width: 30px;
  text-align: center;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${COLORS.textLight};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    color: ${COLORS.accent};
    background: rgba(231, 76, 60, 0.1);
  }
`;

const ItemTotal = styled.div`
  text-align: right;
  min-width: 100px;

  @media (max-width: 768px) {
    text-align: left;
    margin-left: 0;
    width: 100%;
  }
`;

const TotalLabel = styled.div`
  font-size: 12px;
  color: ${COLORS.textLight};
  margin-bottom: 4px;
`;

const TotalAmount = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${COLORS.primary};
`;

// CartItem Component
const CartItem = ({ item, removeItemFromCart, updateQuantity }) => {
  const totalPrice = (item.price || 0) * (item.quantity || 1);

  return (
    <CartItemWrapper>
      <Link to={`/marketplace/product/${item.id}`}>
        <ItemImage
          src={
            item.image ||
            "https://placehold.co/100x100/f5f5f5/ccc?text=No+Image"
          }
          alt={item.name}
          onError={(e) => {
            e.target.src =
              "https://placehold.co/100x100/f5f5f5/ccc?text=No+Image";
          }}
        />
      </Link>

      <ItemDetails>
        <Link
          to={`/marketplace/product/${item.id}`}
          style={{ textDecoration: "none" }}
        >
          <ItemName>{item.name}</ItemName>
        </Link>
        <ItemPrice>
          KES {item.price?.toLocaleString() || 0}
          {item.mrp && item.mrp > item.price && (
            <ItemOriginalPrice>
              KES {item.mrp.toLocaleString()}
            </ItemOriginalPrice>
          )}
        </ItemPrice>

        <QuantityControls>
          <QuantityButton
            onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
          >
            <Minus size={14} />
          </QuantityButton>
          <Quantity>{item.quantity || 1}</Quantity>
          <QuantityButton
            onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
          >
            <Plus size={14} />
          </QuantityButton>
          <RemoveButton onClick={() => removeItemFromCart(item.id)}>
            <Trash2 size={14} />
            Remove
          </RemoveButton>
        </QuantityControls>
      </ItemDetails>

      <ItemTotal>
        <TotalLabel>Total</TotalLabel>
        <TotalAmount>KES {totalPrice.toLocaleString()}</TotalAmount>
      </ItemTotal>
    </CartItemWrapper>
  );
};

// TotalView Component
const TotalViewWrapper = styled.div`
  background: ${COLORS.white};
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 20px;
`;

const TotalTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid ${COLORS.border};
  color: ${COLORS.text};
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  color: ${COLORS.textLight};
`;

const TotalRowBold = styled(TotalRow)`
  font-size: 18px;
  font-weight: 700;
  color: ${COLORS.text};
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${COLORS.border};
`;

const DeliveryInfo = styled.div`
  background: ${COLORS.background};
  padding: 12px;
  border-radius: 12px;
  margin: 16px 0;
  font-size: 12px;
  color: ${COLORS.success};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TotalView = ({ cartItems }) => {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0,
  );
  const deliveryFee = subtotal >= 2000 ? 0 : 200;
  const total = subtotal + deliveryFee;

  return (
    <TotalViewWrapper>
      <TotalTitle>Order Summary</TotalTitle>

      <TotalRow>
        <span>Subtotal ({cartItems.length} items)</span>
        <span>KES {subtotal.toLocaleString()}</span>
      </TotalRow>

      <TotalRow>
        <span>Delivery Fee</span>
        <span>
          {deliveryFee === 0 ? "FREE" : `KES ${deliveryFee.toLocaleString()}`}
        </span>
      </TotalRow>

      {deliveryFee === 0 && (
        <DeliveryInfo>✨ Free delivery on orders over KES 2,000</DeliveryInfo>
      )}

      <TotalRowBold>
        <span>Total</span>
        <span>KES {total.toLocaleString()}</span>
      </TotalRowBold>
    </TotalViewWrapper>
  );
};

// EmptyCart Component
const EmptyCartWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 40px 20px;
`;

const EmptyIcon = styled.div`
  width: 120px;
  height: 120px;
  background: ${COLORS.background};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;

  svg {
    width: 60px;
    height: 60px;
    color: ${COLORS.textLight};
  }
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: ${COLORS.text};
`;

const EmptyText = styled.p`
  color: ${COLORS.textLight};
  margin-bottom: 24px;
`;

const ShopButton = styled(Link)`
  background: ${COLORS.primary};
  color: ${COLORS.white};
  border: none;
  padding: 12px 32px;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${COLORS.primaryDark};
    transform: translateY(-2px);
  }
`;

const EmptyCart = () => (
  <EmptyCartWrapper>
    <EmptyIcon>
      <ShoppingCart size={60} />
    </EmptyIcon>
    <EmptyTitle>Your cart is empty</EmptyTitle>
    <EmptyText>
      Looks like you haven't added any items to your cart yet
    </EmptyText>
    <ShopButton to="/marketplace">
      Start Shopping <ChevronRight size={16} />
    </ShopButton>
  </EmptyCartWrapper>
);

// Main Cart Component
const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load cart from localStorage
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem("marketplace_cart");
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) {
            setCartItems(parsed);
          } else {
            setCartItems([]);
          }
        } else {
          setCartItems([]);
        }
      } catch (e) {
        console.error("Error loading cart:", e);
        setError("Failed to load your cart");
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("marketplace_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, loading]);

  const removeItemFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeItemFromCart(id);
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
      );
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return total + price * quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  // In Cart.js - handleCheckout function
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    // Store cart data for checkout
    localStorage.setItem(
      "checkout_cart",
      JSON.stringify({
        items: cartItems,
        total: getTotalPrice(),
        timestamp: new Date().toISOString(),
      }),
    );

    // Navigate to checkout - use the same path as in Routes
    navigate("/checkout");
  };
  if (loading) {
    return (
      <LoadingWrapper>
        <Spinner size={40} />
        <div>Loading your cart...</div>
      </LoadingWrapper>
    );
  }

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <CartWrapper>
      <BackButton to="/marketplace">
        <ArrowLeft size={18} />
        Continue Shopping
      </BackButton>

      {error && (
        <ErrorMessage>
          <AlertCircle size={16} />
          {error}
        </ErrorMessage>
      )}

      <CartGrid>
        <CartItemsSection>
          <SectionHeader>
            <SectionTitle>
              <ShoppingCart size={20} />
              My Cart ({getTotalItems()}{" "}
              {getTotalItems() === 1 ? "item" : "items"})
            </SectionTitle>
          </SectionHeader>

          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              removeItemFromCart={removeItemFromCart}
              updateQuantity={updateQuantity}
            />
          ))}

          <CartFooter>
            <CheckoutButton onClick={handleCheckout}>
              <CreditCard size={18} />
              Checkout · KES {getTotalPrice().toLocaleString()}
            </CheckoutButton>
          </CartFooter>
        </CartItemsSection>

        <TotalView cartItems={cartItems} />
      </CartGrid>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </CartWrapper>
  );
};;

export default Cart;
