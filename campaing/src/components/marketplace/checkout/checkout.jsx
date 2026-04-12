// checkout.jsx — Real backend order submission + order confirmation
import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  CreditCard, ArrowLeft, CheckCircle, Loader2,
  MapPin, Phone, Mail, User, Truck, Clock,
  Shield, Package, ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../../../api/config";

const COLORS = {
  primary: "#1e3c72", primaryDark: "#152c54", primaryLight: "#2a4a8a",
  accent: "#e74c3c", text: "#1a1a1a", textLight: "#666",
  border: "#e0e0e0", background: "#f8f9fa", white: "#ffffff", success: "#27ae60",
};

const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const fadeUp = keyframes`from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`;
const modalIn = keyframes`from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); }`;

const CheckoutWrapper = styled.div`max-width: 1200px; margin: 0 auto; padding: 24px 20px; min-height: calc(100vh - 200px); background: ${COLORS.background};`;
const BackButton = styled(Link)`display: inline-flex; align-items: center; gap: 8px; color: ${COLORS.textLight}; text-decoration: none; font-size: 14px; margin-bottom: 24px; transition: all 0.2s; &:hover { color: ${COLORS.primary}; gap: 12px; }`;
const CheckoutGrid = styled.div`display: grid; grid-template-columns: 1fr 380px; gap: 24px; @media (max-width: 768px) { grid-template-columns: 1fr; }`;
const LeftColumn = styled.div`display: flex; flex-direction: column; gap: 24px;`;
const Card = styled.div`background: ${COLORS.white}; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow: hidden;`;
const CardHeader = styled.div`padding: 20px 24px; border-bottom: 1px solid ${COLORS.border}; display: flex; align-items: center; gap: 12px;`;
const CardIcon = styled.div`width: 40px; height: 40px; background: ${COLORS.background}; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: ${COLORS.primary};`;
const CardTitle = styled.h3`font-size: 18px; font-weight: 600; margin: 0; color: ${COLORS.text};`;
const CardSub = styled.p`font-size: 13px; color: ${COLORS.textLight}; margin: 4px 0 0;`;
const CardBody = styled.div`padding: 20px 24px;`;
const FormGroup = styled.div`margin-bottom: 16px;`;
const Label = styled.label`display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: ${COLORS.text};`;
const Input = styled.input`width: 100%; padding: 12px 16px; border: 1px solid ${COLORS.border}; border-radius: 12px; font-size: 14px; background: ${COLORS.white}; transition: all 0.2s; &:focus { outline: none; border-color: ${COLORS.primary}; box-shadow: 0 0 0 3px rgba(30,60,114,0.1); } &::placeholder { color: ${COLORS.textLight}; } box-sizing: border-box;`;
const TextArea = styled.textarea`width: 100%; padding: 12px 16px; border: 1px solid ${COLORS.border}; border-radius: 12px; font-size: 14px; background: ${COLORS.white}; resize: vertical; min-height: 80px; transition: all 0.2s; &:focus { outline: none; border-color: ${COLORS.primary}; box-shadow: 0 0 0 3px rgba(30,60,114,0.1); } box-sizing: border-box;`;
const InputRow = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 16px;`;
const RadioGroup = styled.div`display: flex; gap: 16px; flex-wrap: wrap;`;
const RadioLabel = styled.label`display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 12px 16px; border: 1px solid ${p => p.$selected ? COLORS.primary : COLORS.border}; border-radius: 12px; background: ${p => p.$selected ? `${COLORS.primary}08` : COLORS.white}; transition: all 0.2s; flex: 1; min-width: 120px; &:hover { border-color: ${COLORS.primary}; }`;
const RadioInput = styled.input`accent-color: ${COLORS.primary}; width: 18px; height: 18px;`;
const RadioText = styled.div`.title { font-weight: 600; font-size: 14px; color: ${COLORS.text}; } .subtitle { font-size: 11px; color: ${COLORS.textLight}; }`;

const SummaryCard = styled(Card)`position: sticky; top: 20px;`;
const SummaryItems = styled.div`max-height: 280px; overflow-y: auto; padding: 0 24px;`;
const SummaryItem = styled.div`display: flex; gap: 12px; padding: 14px 0; border-bottom: 1px solid ${COLORS.border}; &:last-child { border-bottom: none; }`;
const ItemImg = styled.img`width: 56px; height: 56px; object-fit: cover; border-radius: 8px; background: ${COLORS.background};`;
const ItemName = styled.div`font-size: 13px; font-weight: 600; color: ${COLORS.text}; margin-bottom: 4px;`;
const ItemMeta = styled.div`font-size: 12px; color: ${COLORS.textLight};`;
const ItemPrice = styled.div`font-size: 13px; color: ${COLORS.primary}; font-weight: 600;`;
const Totals = styled.div`padding: 20px 24px; border-top: 1px solid ${COLORS.border};`;
const TRow = styled.div`display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: ${COLORS.textLight};`;
const TRowBold = styled(TRow)`font-size: 17px; font-weight: 700; color: ${COLORS.text}; margin-top: 14px; padding-top: 14px; border-top: 1px solid ${COLORS.border};`;
const PlaceOrderBtn = styled.button`width: 100%; background: ${COLORS.primary}; color: white; border: none; padding: 16px; border-radius: 40px; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s; &:hover { background: ${COLORS.primaryDark}; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(30,60,114,0.3); } &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }`;
const SpinnerIcon = styled(Loader2)`animation: ${spin} 1s linear infinite;`;

const ErrorBox = styled.div`background: #fef2f2; border-left: 3px solid #ef4444; color: #991b1b; padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; font-size: 14px;`;

const Overlay = styled.div`position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center;`;
const SuccessBox = styled.div`background: white; border-radius: 24px; padding: 40px; text-align: center; max-width: 400px; margin: 20px; animation: ${modalIn} 0.4s ease;`;
const SuccessCircle = styled.div`width: 80px; height: 80px; background: ${COLORS.success}15; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: ${COLORS.success};`;
const OrdNum = styled.div`background: ${COLORS.background}; padding: 12px; border-radius: 10px; font-family: monospace; font-size: 14px; font-weight: 700; color: ${COLORS.primary}; margin: 16px 0 24px;`;
const ContinueBtn = styled.button`background: ${COLORS.primary}; color: white; border: none; padding: 12px 32px; border-radius: 40px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; &:hover { background: ${COLORS.primaryDark}; }`;
const ViewOrdersBtn = styled.button`background: transparent; color: ${COLORS.primary}; border: 1px solid ${COLORS.primary}; padding: 10px 24px; border-radius: 40px; font-size: 14px; font-weight: 600; cursor: pointer; margin-right: 12px; transition: all 0.2s; &:hover { background: ${COLORS.primary}; color: white; }`;

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", address: "", city: "",
    deliveryMethod: "standard", paymentMethod: "mpesa", notes: "",
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("marketplace_cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCartItems(parsed);
        } else {
          navigate("/marketplace");
        }
      } catch { navigate("/marketplace"); }
    } else {
      navigate("/marketplace");
    }
    setLoading(false);

    // Auto-fill user data
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        const u = JSON.parse(userData);
        setFormData(prev => ({
          ...prev,
          fullName: u.real_name || u.name || "",
          email: u.email || u.personal_email || "",
          phone: u.phone || "",
        }));
      } catch {}
    }
  }, [navigate]);

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const getPrice = item => {
    if (item.price && typeof item.price === "object") return item.price.org || item.price.mrp || 0;
    return parseFloat(item.price) || 0;
  };

  const subtotal = cartItems.reduce((s, i) => s + getPrice(i) * (i.quantity || 1), 0);
  const deliveryFee = formData.deliveryMethod === "express" ? 500 : subtotal >= 2000 ? 0 : 200;
  const total = subtotal + deliveryFee;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      setError("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
      const userId = userData.user_id || null;

      const orderPayload = {
        user_id: userId,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        address: `${formData.address}, ${formData.city}`,
        total_amount: total,
        items: cartItems.map(i => ({
          productId: i.id || i._id,
          name: i.title || i.name,
          quantity: i.quantity || 1,
          price: getPrice(i),
          image: i.image || i.img,
          size: i.selectedSize || null,
        })),
        delivery_method: formData.deliveryMethod,
        payment_method: formData.paymentMethod,
        notes: formData.notes,
      };

      const res = await axios.post(`${API.ORDERS}`, orderPayload, { withCredentials: true });

      if (res.data.success) {
        const order = res.data.data;
        setPlacedOrder(order);

        // Save to localStorage for quick access
        const existing = JSON.parse(localStorage.getItem("my_orders") || "[]");
        existing.unshift(order);
        localStorage.setItem("my_orders", JSON.stringify(existing.slice(0, 50)));

        // Clear cart
        localStorage.removeItem("marketplace_cart");
        window.dispatchEvent(new Event("cartUpdated"));

        setShowSuccess(true);
      } else {
        throw new Error(res.data.message || "Order failed");
      }
    } catch (err) {
      console.error("Order error:", err);
      setError(err.response?.data?.message || err.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <Overlay><SpinnerIcon size={40} color={COLORS.primary} /></Overlay>
  );

  return (
    <>
      <CheckoutWrapper>
        <BackButton to="/marketplace/cart">
          <ArrowLeft size={18} /> Back to Cart
        </BackButton>

        {error && <ErrorBox>{error}</ErrorBox>}

        <CheckoutGrid>
          <LeftColumn>
            <form onSubmit={handleSubmit}>
              {/* Delivery Info */}
              <Card>
                <CardHeader>
                  <CardIcon><MapPin size={20} /></CardIcon>
                  <div>
                    <CardTitle>Delivery Information</CardTitle>
                    <CardSub>Where should we send your order?</CardSub>
                  </div>
                </CardHeader>
                <CardBody>
                  <FormGroup>
                    <Label>Full Name *</Label>
                    <Input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" required />
                  </FormGroup>
                  <InputRow>
                    <FormGroup>
                      <Label>Email *</Label>
                      <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required />
                    </FormGroup>
                    <FormGroup>
                      <Label>Phone *</Label>
                      <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="0712345678" required />
                    </FormGroup>
                  </InputRow>
                  <FormGroup>
                    <Label>Delivery Address *</Label>
                    <TextArea name="address" value={formData.address} onChange={handleChange} placeholder="Street address, building, apartment" required />
                  </FormGroup>
                  <FormGroup>
                    <Label>City / Town *</Label>
                    <Input name="city" value={formData.city} onChange={handleChange} placeholder="Nairobi" required />
                  </FormGroup>
                </CardBody>
              </Card>

              {/* Delivery Method */}
              <Card>
                <CardHeader>
                  <CardIcon><Truck size={20} /></CardIcon>
                  <div>
                    <CardTitle>Delivery Method</CardTitle>
                    <CardSub>Choose how you want to receive your order</CardSub>
                  </div>
                </CardHeader>
                <CardBody>
                  <RadioGroup>
                    <RadioLabel $selected={formData.deliveryMethod === "standard"}>
                      <RadioInput type="radio" name="deliveryMethod" value="standard" checked={formData.deliveryMethod === "standard"} onChange={handleChange} />
                      <RadioText><div className="title">Standard Delivery</div><div className="subtitle">3-5 days · Free over KES 2,000</div></RadioText>
                    </RadioLabel>
                    <RadioLabel $selected={formData.deliveryMethod === "express"}>
                      <RadioInput type="radio" name="deliveryMethod" value="express" checked={formData.deliveryMethod === "express"} onChange={handleChange} />
                      <RadioText><div className="title">Express Delivery</div><div className="subtitle">1-2 days · KES 500</div></RadioText>
                    </RadioLabel>
                  </RadioGroup>
                </CardBody>
              </Card>

              {/* Payment */}
              <Card>
                <CardHeader>
                  <CardIcon><CreditCard size={20} /></CardIcon>
                  <div>
                    <CardTitle>Payment Method</CardTitle>
                    <CardSub>Select your preferred payment</CardSub>
                  </div>
                </CardHeader>
                <CardBody>
                  <RadioGroup>
                    {[
                      { val: "mpesa", label: "M-Pesa", sub: "Pay with M-Pesa" },
                      { val: "card", label: "Card", sub: "Visa, Mastercard" },
                      { val: "bank", label: "Bank Transfer", sub: "Direct deposit" },
                    ].map(opt => (
                      <RadioLabel key={opt.val} $selected={formData.paymentMethod === opt.val}>
                        <RadioInput type="radio" name="paymentMethod" value={opt.val} checked={formData.paymentMethod === opt.val} onChange={handleChange} />
                        <RadioText><div className="title">{opt.label}</div><div className="subtitle">{opt.sub}</div></RadioText>
                      </RadioLabel>
                    ))}
                  </RadioGroup>
                </CardBody>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardIcon><Shield size={20} /></CardIcon>
                  <div><CardTitle>Order Notes</CardTitle><CardSub>Special instructions (optional)</CardSub></div>
                </CardHeader>
                <CardBody>
                  <TextArea name="notes" value={formData.notes} onChange={handleChange} placeholder="e.g. Leave at gate, call before delivery..." />
                </CardBody>
              </Card>

              <PlaceOrderBtn type="submit" disabled={submitting}>
                {submitting ? <><SpinnerIcon size={18} /> Processing...</> : <><CreditCard size={18} /> Place Order</>}
              </PlaceOrderBtn>
            </form>
          </LeftColumn>

          {/* Order Summary */}
          <SummaryCard>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <SummaryItems>
              {cartItems.map((item, i) => (
                <SummaryItem key={i}>
                  <ItemImg src={item.image || item.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title || item.name)}&background=1e3c72&color=fff`} alt={item.title || item.name} />
                  <div style={{ flex: 1 }}>
                    <ItemName>{item.title || item.name}</ItemName>
                    <ItemMeta>Qty: {item.quantity || 1}{item.selectedSize ? ` · ${item.selectedSize}` : ""}</ItemMeta>
                    <ItemPrice>KES {(getPrice(item) * (item.quantity || 1)).toLocaleString("en-KE")}</ItemPrice>
                  </div>
                </SummaryItem>
              ))}
            </SummaryItems>
            <Totals>
              <TRow><span>Subtotal</span><span>KES {subtotal.toLocaleString("en-KE")}</span></TRow>
              <TRow><span>Delivery</span><span>{deliveryFee === 0 ? "FREE" : `KES ${deliveryFee.toLocaleString("en-KE")}`}</span></TRow>
              <TRowBold><span>Total</span><span>KES {total.toLocaleString("en-KE")}</span></TRowBold>
            </Totals>
          </SummaryCard>
        </CheckoutGrid>
      </CheckoutWrapper>

      {/* Success Modal */}
      {showSuccess && placedOrder && (
        <Overlay>
          <SuccessBox>
            <SuccessCircle><CheckCircle size={40} /></SuccessCircle>
            <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 700, color: COLORS.text }}>Order Placed! 🎉</h2>
            <p style={{ color: COLORS.textLight, margin: "0 0 8px" }}>Thank you for your order. We'll notify you when it ships.</p>
            <OrdNum>📦 {placedOrder.order_number}</OrdNum>
            <div>
              <ViewOrdersBtn onClick={() => navigate("/marketplace/orders")}>
                <Package size={16} style={{ marginRight: 6 }} /> View My Orders
              </ViewOrdersBtn>
              <ContinueBtn onClick={() => navigate("/marketplace")}>
                Continue Shopping
              </ContinueBtn>
            </div>
          </SuccessBox>
        </Overlay>
      )}
    </>
  );
};

export default Checkout;
