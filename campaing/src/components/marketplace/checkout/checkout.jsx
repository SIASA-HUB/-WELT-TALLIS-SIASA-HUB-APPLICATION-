// Checkout.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  CreditCard,
  ArrowLeft,
  CheckCircle,
  Loader2,
  MapPin,
  Phone,
  Mail,
  User,
  Truck,
  Clock,
  Shield,
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
const CheckoutWrapper = styled.div`
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

const CheckoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  background: ${COLORS.white};
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 20px 24px;
  background: ${COLORS.white};
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${COLORS.background};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLORS.primary};
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: ${COLORS.text};
`;

const SectionSubtitle = styled.p`
  font-size: 13px;
  color: ${COLORS.textLight};
  margin: 4px 0 0;
`;

const SectionContent = styled.div`
  padding: 20px 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: ${COLORS.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${COLORS.border};
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s;
  background: ${COLORS.white};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px rgba(30, 60, 114, 0.1);
  }

  &::placeholder {
    color: ${COLORS.textLight};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${COLORS.border};
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s;
  background: ${COLORS.white};
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px rgba(30, 60, 114, 0.1);
  }
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 12px 16px;
  border: 1px solid
    ${(props) => (props.$selected ? COLORS.primary : COLORS.border)};
  border-radius: 12px;
  background: ${(props) =>
    props.$selected ? `${COLORS.primary}08` : COLORS.white};
  transition: all 0.2s;
  flex: 1;
  min-width: 120px;

  &:hover {
    border-color: ${COLORS.primary};
  }
`;

const RadioInput = styled.input`
  accent-color: ${COLORS.primary};
  width: 18px;
  height: 18px;
`;

const RadioText = styled.div`
  .title {
    font-weight: 600;
    font-size: 14px;
    color: ${COLORS.text};
  }
  .subtitle {
    font-size: 11px;
    color: ${COLORS.textLight};
  }
`;

const OrderSummary = styled.div`
  background: ${COLORS.white};
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: sticky;
  top: 20px;
`;

const SummaryHeader = styled.div`
  padding: 20px 24px;
  background: ${COLORS.white};
  border-bottom: 1px solid ${COLORS.border};
`;

const SummaryTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: ${COLORS.text};
`;

const OrderItems = styled.div`
  max-height: 300px;
  overflow-y: auto;
  padding: 0 24px;
`;

const OrderItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid ${COLORS.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  background: ${COLORS.background};
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${COLORS.text};
  margin-bottom: 4px;
`;

const ItemPrice = styled.div`
  font-size: 13px;
  color: ${COLORS.primary};
  font-weight: 600;
`;

const ItemQuantity = styled.div`
  font-size: 12px;
  color: ${COLORS.textLight};
`;

const SummaryTotals = styled.div`
  padding: 20px 24px;
  border-top: 1px solid ${COLORS.border};
  background: ${COLORS.white};
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

const PlaceOrderButton = styled.button`
  width: 100%;
  background: ${COLORS.primary};
  color: ${COLORS.white};
  border: none;
  padding: 16px;
  border-radius: 40px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover {
    background: ${COLORS.primaryDark};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(30, 60, 114, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
`;

const SuccessContent = styled.div`
  background: ${COLORS.white};
  border-radius: 24px;
  padding: 40px;
  text-align: center;
  max-width: 400px;
  margin: 20px;
  animation: slideUp 0.4s ease;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: ${COLORS.success}15;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: ${COLORS.success};
`;

const SuccessTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
  color: ${COLORS.text};
`;

const SuccessMessage = styled.p`
  color: ${COLORS.textLight};
  margin-bottom: 24px;
`;

const OrderNumber = styled.div`
  background: ${COLORS.background};
  padding: 12px;
  border-radius: 12px;
  font-family: monospace;
  font-size: 14px;
  font-weight: 600;
  color: ${COLORS.primary};
  margin-bottom: 24px;
`;

const ContinueButton = styled.button`
  background: ${COLORS.primary};
  color: ${COLORS.white};
  border: none;
  padding: 12px 32px;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${COLORS.primaryDark};
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    deliveryMethod: "standard",
    paymentMethod: "mpesa",
    notes: "",
  });

  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem("marketplace_cart");
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCartItems(parsed);
          } else {
            navigate("/marketplace");
          }
        } else {
          navigate("/marketplace");
        }
      } catch (e) {
        console.error("Error loading cart:", e);
        navigate("/marketplace");
      } finally {
        setLoading(false);
      }
    };
    loadCart();

    // Load user data if available
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setFormData((prev) => ({
          ...prev,
          fullName: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
        }));
      } catch (e) {}
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0,
    );
    const deliveryFee =
      formData.deliveryMethod === "express" ? 500 : subtotal >= 2000 ? 0 : 200;
    const total = subtotal + deliveryFee;
    return { subtotal, deliveryFee, total };
  };

  const { subtotal, deliveryFee, total } = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.address
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setError("");

    // Simulate order processing
    setTimeout(() => {
      const newOrderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setOrderNumber(newOrderNumber);

      // Save order to localStorage
      const orders = JSON.parse(
        localStorage.getItem("marketplace_orders") || "[]",
      );
      orders.push({
        id: newOrderNumber,
        items: cartItems,
        customer: formData,
        totals: { subtotal, deliveryFee, total },
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("marketplace_orders", JSON.stringify(orders));

      // Clear cart
      localStorage.removeItem("marketplace_cart");

      setShowSuccess(true);
      setSubmitting(false);
    }, 2000);
  };

  const handleContinue = () => {
    navigate("/marketplace");
  };

  if (loading) {
    return (
      <LoadingOverlay>
        <Loader2
          size={40}
          style={{
            animation: "spin 1s linear infinite",
            color: COLORS.primary,
          }}
        />
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </LoadingOverlay>
    );
  }

  return (
    <>
      <CheckoutWrapper>
        <BackButton to="/cart">
          <ArrowLeft size={18} />
          Back to Cart
        </BackButton>

        <CheckoutGrid>
          <LeftColumn>
            <form onSubmit={handleSubmit}>
              {/* Delivery Information */}
              <Section>
                <SectionHeader>
                  <SectionIcon>
                    <MapPin size={20} />
                  </SectionIcon>
                  <div>
                    <SectionTitle>Delivery Information</SectionTitle>
                    <SectionSubtitle>
                      Where should we send your order?
                    </SectionSubtitle>
                  </div>
                </SectionHeader>
                <SectionContent>
                  <FormGroup>
                    <Label>Full Name *</Label>
                    <Input
                      name="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>

                  <InputRow>
                    <FormGroup>
                      <Label>Email *</Label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Phone Number *</Label>
                      <Input
                        name="phone"
                        placeholder="0712345678"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                  </InputRow>

                  <FormGroup>
                    <Label>Delivery Address *</Label>
                    <TextArea
                      name="address"
                      placeholder="Street address, building, apartment"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>

                  <InputRow>
                    <FormGroup>
                      <Label>City/Town *</Label>
                      <Input
                        name="city"
                        placeholder="Nairobi"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                  </InputRow>
                </SectionContent>
              </Section>

              {/* Delivery Method */}
              <Section>
                <SectionHeader>
                  <SectionIcon>
                    <Truck size={20} />
                  </SectionIcon>
                  <div>
                    <SectionTitle>Delivery Method</SectionTitle>
                    <SectionSubtitle>
                      Choose how you want to receive your order
                    </SectionSubtitle>
                  </div>
                </SectionHeader>
                <SectionContent>
                  <RadioGroup>
                    <RadioLabel
                      $selected={formData.deliveryMethod === "standard"}
                    >
                      <RadioInput
                        type="radio"
                        name="deliveryMethod"
                        value="standard"
                        checked={formData.deliveryMethod === "standard"}
                        onChange={handleInputChange}
                      />
                      <RadioText>
                        <div className="title">Standard Delivery</div>
                        <div className="subtitle">3-5 business days</div>
                      </RadioText>
                    </RadioLabel>
                    <RadioLabel
                      $selected={formData.deliveryMethod === "express"}
                    >
                      <RadioInput
                        type="radio"
                        name="deliveryMethod"
                        value="express"
                        checked={formData.deliveryMethod === "express"}
                        onChange={handleInputChange}
                      />
                      <RadioText>
                        <div className="title">Express Delivery</div>
                        <div className="subtitle">1-2 business days</div>
                      </RadioText>
                    </RadioLabel>
                  </RadioGroup>
                </SectionContent>
              </Section>

              {/* Payment Method */}
              <Section>
                <SectionHeader>
                  <SectionIcon>
                    <CreditCard size={20} />
                  </SectionIcon>
                  <div>
                    <SectionTitle>Payment Method</SectionTitle>
                    <SectionSubtitle>
                      Select your preferred payment method
                    </SectionSubtitle>
                  </div>
                </SectionHeader>
                <SectionContent>
                  <RadioGroup>
                    <RadioLabel $selected={formData.paymentMethod === "mpesa"}>
                      <RadioInput
                        type="radio"
                        name="paymentMethod"
                        value="mpesa"
                        checked={formData.paymentMethod === "mpesa"}
                        onChange={handleInputChange}
                      />
                      <RadioText>
                        <div className="title">M-Pesa</div>
                        <div className="subtitle">Pay with M-Pesa</div>
                      </RadioText>
                    </RadioLabel>
                    <RadioLabel $selected={formData.paymentMethod === "card"}>
                      <RadioInput
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === "card"}
                        onChange={handleInputChange}
                      />
                      <RadioText>
                        <div className="title">Card Payment</div>
                        <div className="subtitle">Visa, Mastercard</div>
                      </RadioText>
                    </RadioLabel>
                    <RadioLabel $selected={formData.paymentMethod === "bank"}>
                      <RadioInput
                        type="radio"
                        name="paymentMethod"
                        value="bank"
                        checked={formData.paymentMethod === "bank"}
                        onChange={handleInputChange}
                      />
                      <RadioText>
                        <div className="title">Bank Transfer</div>
                        <div className="subtitle">Direct bank deposit</div>
                      </RadioText>
                    </RadioLabel>
                  </RadioGroup>
                </SectionContent>
              </Section>

              {/* Order Notes */}
              <Section>
                <SectionHeader>
                  <SectionIcon>
                    <Shield size={20} />
                  </SectionIcon>
                  <div>
                    <SectionTitle>Order Notes (Optional)</SectionTitle>
                    <SectionSubtitle>
                      Special instructions for delivery
                    </SectionSubtitle>
                  </div>
                </SectionHeader>
                <SectionContent>
                  <TextArea
                    name="notes"
                    placeholder="Any special delivery instructions or notes..."
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </SectionContent>
              </Section>
            </form>
          </LeftColumn>

          {/* Order Summary */}
          <div>
            <OrderSummary>
              <SummaryHeader>
                <SummaryTitle>Order Summary</SummaryTitle>
              </SummaryHeader>

              <OrderItems>
                {cartItems.map((item) => (
                  <OrderItem key={item.id}>
                    <ItemImage
                      src={
                        item.image ||
                        "https://placehold.co/60x60/f5f5f5/ccc?text=No+Image"
                      }
                      alt={item.name}
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/60x60/f5f5f5/ccc?text=No+Image";
                      }}
                    />
                    <ItemDetails>
                      <ItemName>{item.name}</ItemName>
                      <ItemPrice>KES {item.price?.toLocaleString()}</ItemPrice>
                      <ItemQuantity>Qty: {item.quantity || 1}</ItemQuantity>
                    </ItemDetails>
                    <div style={{ fontWeight: 600, color: COLORS.primary }}>
                      KES{" "}
                      {(
                        (item.price || 0) * (item.quantity || 1)
                      ).toLocaleString()}
                    </div>
                  </OrderItem>
                ))}
              </OrderItems>

              <SummaryTotals>
                <TotalRow>
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>KES {subtotal.toLocaleString()}</span>
                </TotalRow>

                <TotalRow>
                  <span>Delivery Fee</span>
                  <span>
                    {deliveryFee === 0
                      ? "FREE"
                      : `KES ${deliveryFee.toLocaleString()}`}
                  </span>
                </TotalRow>

                {deliveryFee === 0 && (
                  <DeliveryInfo>
                    ✨ Free delivery on orders over KES 2,000
                  </DeliveryInfo>
                )}

                <TotalRowBold>
                  <span>Total</span>
                  <span>KES {total.toLocaleString()}</span>
                </TotalRowBold>

                <PlaceOrderButton onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2
                        size={18}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      Place Order · KES {total.toLocaleString()}
                    </>
                  )}
                </PlaceOrderButton>

                {error && (
                  <div
                    style={{
                      marginTop: 12,
                      color: COLORS.accent,
                      fontSize: 13,
                      textAlign: "center",
                    }}
                  >
                    {error}
                  </div>
                )}
              </SummaryTotals>
            </OrderSummary>
          </div>
        </CheckoutGrid>
      </CheckoutWrapper>

      {/* Success Modal */}
      {showSuccess && (
        <SuccessModal>
          <SuccessContent>
            <SuccessIcon>
              <CheckCircle size={48} />
            </SuccessIcon>
            <SuccessTitle>Order Placed!</SuccessTitle>
            <SuccessMessage>
              Your order has been successfully placed
            </SuccessMessage>
            <OrderNumber>Order #{orderNumber}</OrderNumber>
            <ContinueButton onClick={handleContinue}>
              Continue Shopping
            </ContinueButton>
          </SuccessContent>
        </SuccessModal>
      )}
    </>
  );
};

export default Checkout;
