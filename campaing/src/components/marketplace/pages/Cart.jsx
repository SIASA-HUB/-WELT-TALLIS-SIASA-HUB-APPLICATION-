import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import { getCart, addToCart, updateCartItem, removeFromCart, placeOrder } from "../components/api"; // adjust path as needed
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { Trash2, ShoppingCart, ArrowLeft, Minus, Plus, Truck, CreditCard, MapPin } from "lucide-react";
import { useAuth } from "@/components/hooks/useAuth";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";

// ======================== STYLED COMPONENTS ========================
const Container = styled.div`
  padding: 40px 30px;
  min-height: 100vh;
  background: #f8fafc;
  @media (max-width: 768px) {
    padding: 20px 12px;
  }
`;

const Section = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Title = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
  width: fit-content;
  &:hover {
    background: #f8fafc;
    color: #e11d48;
    transform: translateX(-2px);
  }
`;

const Wrapper = styled.div`
  display: flex;
  gap: 30px;
  width: 100%;
  @media (max-width: 1000px) {
    flex-direction: column;
  }
`;

const Left = styled.div`
  flex: 1.5;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #eef2f6;
`;

const ItemHeader = styled.div`
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr 1fr 0.2fr;
  padding: 0 10px 16px 10px;
  border-bottom: 1px solid #eef2f6;
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  @media (max-width: 600px) {
    display: none;
  }
`;

const CartItemRow = styled.div`
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr 1fr 0.2fr;
  align-items: center;
  padding: 20px 10px;
  border-bottom: 1px solid #f8fafc;
  &:last-child {
    border-bottom: none;
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  background: #f8fafc;
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ProductTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
`;

const ProductSub = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
`;

const Price = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
`;

const Counter = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  padding: 6px 12px;
  border-radius: 10px;
  width: fit-content;
  font-weight: 700;
  color: #1a1a2e;
`;

const CounterBtn = styled.div`
  cursor: pointer;
  color: #64748b;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  &:hover {
    color: #e11d48;
  }
`;

const Right = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SummaryCard = styled(Card)`
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border: none;
  position: sticky;
  top: 20px;
`;

const SummaryTitle = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: white;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${({ total }) => (total ? "22px" : "14px")};
  font-weight: ${({ total }) => (total ? "800" : "500")};
  color: ${({ total }) => (total ? "white" : "#cbd5e1")};
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
`;

const EmptyCart = styled(Card)`
  text-align: center;
  padding: 80px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const EmptyTitle = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin-top: 20px;
`;

const EmptyText = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const SectionTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 2px solid #eef2f6;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const DeleteIcon = styled(Trash2)`
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  width: 18px;
  height: 18px;
  &:hover {
    color: #e11d48;
    transform: scale(1.1);
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const InputLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// ======================== COMPONENT ========================
const Cart = () => {
  const navigate = useNavigate();
  const { user, leader, isAuthenticated, isLeaderAuthenticated } = useAuth();
  const { cartItems, clearCart: clearContext, addToCart: addToContext, removeFromCart: removeFromContext, updateQuantity } = useCart();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [buttonLoad, setButtonLoad] = useState(false);
  const [backendSummary, setBackendSummary] = useState({ subtotal: 0, shipping: 0, total: 0 });

  const [deliveryDetails, setDeliveryDetails] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    phoneNumber: "",
    completeAddress: "",
  });

  // Pre-fill from user data when available
  useEffect(() => {
    const activeUser = user || leader;
    if (activeUser) {
      setDeliveryDetails({
        firstName: activeUser?.real_name?.split(" ")[0] || activeUser?.name?.split(" ")[0] || "",
        lastName: activeUser?.real_name?.split(" ")[1] || activeUser?.name?.split(" ")[1] || "",
        emailAddress: activeUser?.email || activeUser?.personal_email || "",
        phoneNumber: activeUser?.phone || activeUser?.personal_phone || "",
        completeAddress: activeUser?.address || "",
      });
    }
  }, [user, leader]);

  // Fetch cart – no token needed, api interceptor adds it
  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await getCart();
      if (response?.success === true) {
        setBackendSummary(response.summary || { subtotal: 0, shipping: 0, total: 0 });
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item) => {
    try {
      await addToCart(null, { productId: item.product_id, quantity: 1 });
      toast.success("Item quantity increased");
      setReload(!reload);
    } catch (err) {
      toast.error(err.message || "Failed to add item");
    }
  };

  const updateItem = async (item, newQuantity, type = "update") => {
    if (newQuantity <= 0) type = "full";
    try {
      if (type === "full" || newQuantity <= 0) {
        await removeFromCart(null, item.id);
        toast.success("Item removed");
      } else {
        await updateCartItem(null, item.id, newQuantity);
        toast.success("Quantity updated");
      }
      setReload(!reload);
    } catch (err) {
      toast.error(err.message || "Failed to update cart");
    }
  };

  const getPrice = (item) => parseFloat(item.price) || 0;

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (getPrice(item) * (item.quantity || 0)), 0);
  };

  useEffect(() => {
    fetchCart();
  }, [reload]);




  const [paymentMethod, setPaymentMethod] = useState("mpesa");

  const placeOrderHandler = async () => {
    if (
      !deliveryDetails.firstName ||
      !deliveryDetails.lastName ||
      !deliveryDetails.completeAddress ||
      !deliveryDetails.phoneNumber ||
      !deliveryDetails.emailAddress
    ) {
      toast.error("Please fill in all delivery details");
      return;
    }

    setButtonLoad(true);
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token") || localStorage.getItem("leaderToken");
      if (!token) {
        toast.error("Please log in to place order");
        return;
      }

      // ✅ Get userId from multiple sources
      const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
      const leaderDataRaw = JSON.parse(localStorage.getItem("leaderData") || "{}");
      const leaderData = leaderDataRaw.leader || leaderDataRaw;
      const userId = user?.user_id || user?.id || leader?.leader_id || leader?.id || userData?.user_id || leaderData?.leader_id || leaderData?.id || null;

      const totalAmount = calculateSubtotal();

      const orderDetails = {
        userId: userId,
        guestName: `${deliveryDetails.firstName} ${deliveryDetails.lastName}`,
        guestEmail: deliveryDetails.emailAddress,
        guestPhone: deliveryDetails.phoneNumber,
        address: deliveryDetails.completeAddress,
        totalAmount,
        payment_method: paymentMethod,
        items: cartItems.map((item) => ({
          productId: item.product_id || item.id,
          name: item.name || item.title,
          quantity: item.quantity,
          price: getPrice(item),
        })),
      };

      toast.info("Placing your order...");
      const orderRes = await placeOrder(token, orderDetails);
      
      if (!orderRes?.success) {
        throw new Error(orderRes?.message || "Failed to place order");
      }

      const orderId = orderRes.data?.id;

      // If M-Pesa, trigger STK Push and POLL
      if (paymentMethod === "mpesa") {
        try {
          toast.info("Initiating M-Pesa payment... Please check your phone.");
          
          // Call marketplace payment endpoint
          const API_MARKETPLACE = `${localStorage.getItem('VITE_API_URL') || '/api/v1'}/marketplace`;
          const mpesaRes = await axios.post(`${API_MARKETPLACE}/payments/mpesa/stkpush`, {
            orderId: orderId,
            phoneNumber: deliveryDetails.phoneNumber.startsWith('254') ? deliveryDetails.phoneNumber : '254' + deliveryDetails.phoneNumber.replace(/^0/, '')
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (mpesaRes.data?.success) {
            const checkoutId = mpesaRes.data.data.checkoutRequestId;
            
            // Polling for status
            let attempts = 0;
            const pollInterval = setInterval(async () => {
              attempts++;
              try {
                const statusRes = await axios.get(`${API_MARKETPLACE}/payments/status/${checkoutId}`);
                if (statusRes.data?.status === "paid") {
                  clearInterval(pollInterval);
                  toast.success("Payment successful! Order confirmed.");
                  clearContext();
                  navigate("/marketplace");
                } else if (statusRes.data?.status === "failed") {
                  clearInterval(pollInterval);
                  toast.error("Payment failed. Please try again.");
                }
              } catch (e) {
                console.error("Polling error:", e);
              }

              if (attempts >= 20) {
                clearInterval(pollInterval);
                toast.warn("Payment verification is taking longer than usual. We'll update your order status soon.");
                navigate("/marketplace");
              }
            }, 5000);
            
            return; // Exit handler, polling will handle navigation
          } else {
             throw new Error(mpesaRes.data?.message || "Failed to initiate M-Pesa payment");
          }
        } catch (stkErr) {
          console.error("STK Push error:", stkErr);
          toast.error("M-Pesa initiation failed: " + (stkErr.response?.data?.message || stkErr.message));
          return;
        }
      }

      // For non-mpesa or if already paid (unlikely here)
      toast.success("Order placed successfully!");
      clearContext();
      navigate("/marketplace");
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to place order. Please try again.");
    } finally {
      setButtonLoad(false);
    }
  };


  const clearCart = () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      cartItems.forEach((item) => updateItem(item, 0, "full"));
    }
  };

  // Updated auth check: check context state OR direct token/registration flag
  const loggedIn = isAuthenticated || isLeaderAuthenticated || (localStorage.getItem("isRegistered") === "true") || !!localStorage.getItem("access_token") || !!localStorage.getItem("leaderToken");

  if (!loggedIn) {
    return (
      <Container>
        <EmptyCart>
          <ShoppingCart size={64} color="#cbd5e1" />
          <EmptyTitle>Please log in</EmptyTitle>
          <EmptyText>You need to be logged in to view your cart.</EmptyText>
          <Button
            text="Go to Login"
            onClick={() => navigate("/login")}
            style={{ background: "#1a1a2e", border: "none" }}
          />
        </EmptyCart>
      </Container>
    );
  }

  return (
    <Container>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <Spinner animation="border" style={{ color: "#e11d48", width: "40px", height: "40px" }} />
        </div>
      ) : (
        <Section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <Title>
              <ShoppingCart size={28} /> Shopping Cart
            </Title>
            <BackButton onClick={() => navigate("/marketplace")}>
              <ArrowLeft size={14} />
              Continue Shopping
            </BackButton>
          </div>

          {cartItems.length === 0 ? (
            <EmptyCart>
              <ShoppingCart size={64} color="#cbd5e1" />
              <EmptyTitle>Your cart is empty</EmptyTitle>
              <EmptyText>
                Looks like you haven't added any items to your cart yet.
              </EmptyText>
              <Button
                text="Browse Products"
                onClick={() => navigate("/marketplace")}
                style={{ background: "#e11d48", border: "none", padding: "10px 24px" }}
              />
            </EmptyCart>
          ) : (
            <Wrapper>
              <Left>
                <Card>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <SectionTitle>
                      <ShoppingCart size={16} />
                      Cart Items (
                      {cartItems.reduce((acc, i) => acc + (i.quantity || 0), 0)})
                    </SectionTitle>
                    <button
                      onClick={clearCart}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#e11d48",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Clear Cart
                    </button>
                  </div>

                  <ItemHeader>
                    <div>Product</div>
                    <div>Price</div>
                    <div>Quantity</div>
                    <div>Subtotal</div>
                    <div></div>
                  </ItemHeader>

                  {cartItems.map((item) => (
                    <CartItemRow key={item.id}>
                      <ProductInfo>
                        <ProductImage
                          src={item.image || "https://ui-avatars.com/api/?name=P&background=1e3c72&color=fff"}
                          alt={item.name}
                        />
                        <ProductDetails>
                          <ProductTitle>{item.name}</ProductTitle>
                          <ProductSub>{item.category || "Premium Collection"}</ProductSub>
                        </ProductDetails>
                      </ProductInfo>

                      <Price>KES {getPrice(item).toLocaleString()}</Price>

                      <Counter>
                        <CounterBtn
                          onClick={() => updateItem(item, (item.quantity || 0) - 1)}
                        >
                          <Minus size={14} />
                        </CounterBtn>
                        <span style={{ minWidth: "24px", textAlign: "center" }}>
                          {item.quantity || 0}
                        </span>
                        <CounterBtn onClick={() => addItem(item)}>
                          <Plus size={14} />
                        </CounterBtn>
                      </Counter>

                      <Price>
                        KES {((item.quantity || 0) * getPrice(item)).toLocaleString()}
                      </Price>

                      <DeleteIcon onClick={() => updateItem(item, 0, "full")} />
                    </CartItemRow>
                  ))}
                </Card>

                <Card>
                  <SectionTitle>
                    <MapPin size={16} />
                    Delivery Information
                  </SectionTitle>

                  <FormGroup>
                    <FormRow>
                      <InputWrapper>
                        <InputLabel>First Name</InputLabel>
                        <TextInput
                          placeholder="Enter first name"
                          value={deliveryDetails.firstName}
                          handelChange={(e) =>
                            setDeliveryDetails({ ...deliveryDetails, firstName: e.target.value })
                          }
                        />
                      </InputWrapper>
                      <InputWrapper>
                        <InputLabel>Last Name</InputLabel>
                        <TextInput
                          placeholder="Enter last name"
                          value={deliveryDetails.lastName}
                          handelChange={(e) =>
                            setDeliveryDetails({ ...deliveryDetails, lastName: e.target.value })
                          }
                        />
                      </InputWrapper>
                    </FormRow>

                    <InputWrapper>
                      <InputLabel>Email Address</InputLabel>
                      <TextInput
                        value={deliveryDetails.emailAddress}
                        handelChange={(e) =>
                          setDeliveryDetails({ ...deliveryDetails, emailAddress: e.target.value })
                        }
                        placeholder="Enter email address"
                      />
                    </InputWrapper>

                    <InputWrapper>
                      <InputLabel>Phone Number</InputLabel>
                      <TextInput
                        value={deliveryDetails.phoneNumber}
                        handelChange={(e) =>
                          setDeliveryDetails({ ...deliveryDetails, phoneNumber: e.target.value })
                        }
                        placeholder="Enter phone number"
                      />
                    </InputWrapper>

                    <InputWrapper>
                      <InputLabel>Complete Shipping Address</InputLabel>
                      <TextInput
                        textArea
                        rows="3"
                        handelChange={(e) =>
                          setDeliveryDetails({ ...deliveryDetails, completeAddress: e.target.value })
                        }
                        value={deliveryDetails.completeAddress}
                        placeholder="Enter your full shipping address"
                      />
                    </InputWrapper>
                  </FormGroup>
                </Card>
              </Left>

              <Right>
                <SummaryCard>
                  <SummaryTitle>Order Summary</SummaryTitle>

                  <SummaryRow>
                    <span>
                      Subtotal (
                      {cartItems.reduce((acc, i) => acc + (i.quantity || 0), 0)} items)
                    </span>
                    <span>
                      KES {calculateSubtotal().toLocaleString()}
                    </span>
                  </SummaryRow>

                  <SummaryRow>
                    <span>Shipping</span>
                    <span style={{ color: "#22c55e", fontWeight: "600" }}>
                      Free in Nairobi only
                    </span>
                  </SummaryRow>

                  <Divider />

                  <SummaryRow total>
                    <span>Total</span>
                    <span>
                      KES {calculateSubtotal().toLocaleString()}
                    </span>
                  </SummaryRow>

                  <div style={{ marginTop: '10px' }}>
                    <SectionTitle style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '14px' }}>
                      Payment Method
                    </SectionTitle>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <label style={{ flex: 1, cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="payment" 
                          value="mpesa" 
                          checked={paymentMethod === 'mpesa'} 
                          onChange={() => setPaymentMethod('mpesa')}
                          style={{ marginRight: '8px' }}
                        />
                        <span style={{ fontSize: '13px', color: paymentMethod === 'mpesa' ? '#fff' : '#94a3b8' }}>M-Pesa</span>
                      </label>
                      <label style={{ flex: 1, cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="payment" 
                          value="cod" 
                          checked={paymentMethod === 'cod'} 
                          onChange={() => setPaymentMethod('cod')}
                          style={{ marginRight: '8px' }}
                        />
                        <span style={{ fontSize: '13px', color: paymentMethod === 'cod' ? '#fff' : '#94a3b8' }}>Cash</span>
                      </label>
                    </div>
                  </div>

                  <Button
                    text={buttonLoad ? "Processing..." : "Place Order"}
                    isLoading={buttonLoad}
                    isDisabled={buttonLoad}
                    onClick={placeOrderHandler}
                    full
                    style={{ background: "#e11d48", border: "none", fontWeight: "600", padding: "12px" }}
                  />

                  <div
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <Truck size={12} />
                    Powered by Welt Tallis SiasaHub Division
                    <CreditCard size={12} />
                    Secure payment
                  </div>
                </SummaryCard>
              </Right>
            </Wrapper>
          )}
        </Section>
      )}
    </Container>
  );
};

export default Cart;