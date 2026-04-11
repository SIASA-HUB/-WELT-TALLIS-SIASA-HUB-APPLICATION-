// Cart.js - Complete Fixed Cart Component with M-Pesa Only
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
  Phone,
  User,
  LogIn,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../../api/api";
import AdBanner from "../ItemDetails/AdBanner";

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
  mpesa: "#00a859",
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
  background: ${COLORS.mpesa};
  color: ${COLORS.white};
  border: none;
  padding: 14px 32px;
  border-radius: 40px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${COLORS.mpesa}dd;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 168, 89, 0.3);
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

// CartItem Component
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

// M-Pesa Modal Component
const MpesaModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 24px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  text-align: center;
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: ${COLORS.text};
`;

const ModalSubtitle = styled.p`
  font-size: 13px;
  color: ${COLORS.textLight};
  margin-bottom: 24px;
`;

const InputGroup = styled.div`
  text-align: left;
  margin-bottom: 20px;
`;

const InputLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${COLORS.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid ${COLORS.border};
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: ${COLORS.mpesa};
    box-shadow: 0 0 0 3px rgba(0, 168, 89, 0.1);
  }
`;

const MpesaButton = styled.button`
  width: 100%;
  background: ${COLORS.mpesa};
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 12px;
  transition: all 0.2s;

  &:hover {
    background: ${COLORS.mpesa}dd;
    transform: translateY(-1px);
  }
`;

const CancelButton = styled.button`
  width: 100%;
  background: none;
  border: 1px solid ${COLORS.border};
  padding: 14px;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  color: ${COLORS.textLight};
  transition: all 0.2s;

  &:hover {
    background: ${COLORS.background};
  }
`;

const MpesaIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${COLORS.mpesa}15;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: ${COLORS.mpesa};
  font-size: 30px;
  font-weight: bold;
`;

// Helper function to decode token
const getUserFromToken = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("leaderToken");
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const decoded = JSON.parse(jsonPayload);
    // Standardize user ID field (some use id, some use userId)
    return {
      ...decoded,
      id: decoded.id || decoded.userId || decoded.sub,
      name: decoded.name || decoded.fullName || decoded.username
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Main Cart Component
const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check authentication and load user
  useEffect(() => {
    const checkAuth = () => {
      const userData = getUserFromToken();
      if (!userData) {
        // Redirect to login if not authenticated
        localStorage.setItem("redirectAfterLogin", "/cart");
        navigate("/login");
        return;
      }
      setUser(userData);
      // Set phone number from user data if available
      if (userData.phone) {
        setPhoneNumber(userData.phone);
      }
    };
    checkAuth();
  }, [navigate]);

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

  const handleMpesaPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid M-Pesa phone number");
      return;
    }

    setProcessing(true);
    const total = getTotalPrice();

    try {
      // Call your backend M-Pesa STK Push endpoint via global api
      const response = await api.post("/wallet/mpesa/stkpush", {
        phoneNumber: phoneNumber.replace(/^0/, "254"), // Convert to international format
        amount: total,
        accountReference: `CART-${Date.now()}`,
        transactionDesc: `Payment for ${getTotalItems()} items`,
        userId: user?.id,
      });

      if (response.success) {
        setError(null);
        alert(
          `M-Pesa STK Push sent to ${phoneNumber}. Please check your phone and enter PIN to complete payment.`,
        );

        // Clear cart after successful payment (in real scenario, wait for webhook confirmation)
        localStorage.removeItem("marketplace_cart");
        setCartItems([]);
        setShowMpesaModal(false);
        navigate("/marketplace");
      } else {
        setError(response.message || "Payment failed. Please try again.");
      }
    } catch (err) {
      console.error("M-Pesa payment error:", err);
      setError(
        err.response?.data?.message ||
          "Payment processing failed. Please try again.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }
    setShowMpesaModal(true);
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
    return (
      <>
        <EmptyCart />
        <AdBanner />
      </>
    );
  }

  return (
    <>
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
                Pay with M-Pesa · KES {getTotalPrice().toLocaleString()}
              </CheckoutButton>
            </CartFooter>
          </CartItemsSection>

          <TotalView cartItems={cartItems} />
        </CartGrid>
      </CartWrapper>

      {/* Ad Banner at the bottom */}
      <AdBanner />

      {/* M-Pesa Modal */}
      {showMpesaModal && (
        <MpesaModal onClick={() => !processing && setShowMpesaModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <MpesaIcon>
              <span>💳</span>
            </MpesaIcon>
            <ModalTitle>M-Pesa Payment</ModalTitle>
            <ModalSubtitle>
              You will receive a prompt on your phone to complete payment
            </ModalSubtitle>

            <InputGroup>
              <InputLabel>
                <Phone size={14} />
                M-Pesa Phone Number
              </InputLabel>
              <Input
                type="tel"
                placeholder="0712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={processing}
              />
            </InputGroup>

            <InputGroup>
              <InputLabel>
                <User size={14} />
                Name
              </InputLabel>
              <Input
                type="text"
                value={user?.name || user?.email || "Customer"}
                disabled
                style={{ background: COLORS.background }}
              />
            </InputGroup>

            <InputGroup>
              <InputLabel>Amount to Pay</InputLabel>
              <Input
                type="text"
                value={`KES ${getTotalPrice().toLocaleString()}`}
                disabled
                style={{ background: COLORS.background, fontWeight: "bold" }}
              />
            </InputGroup>

            <MpesaButton onClick={handleMpesaPayment} disabled={processing}>
              {processing ? (
                <>
                  <Spinner size={18} />
                  Processing...
                </>
              ) : (
                <>
                  <span>💳</span>
                  Pay with M-Pesa
                </>
              )}
            </MpesaButton>

            <CancelButton
              onClick={() => setShowMpesaModal(false)}
              disabled={processing}
            >
              Cancel
            </CancelButton>
          </ModalContent>
        </MpesaModal>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default Cart;
