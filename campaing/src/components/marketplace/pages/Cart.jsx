import React, { useEffect, useState } from "react";
import styled from "styled-components";
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
  const { user, isAuthenticated } = useAuth();
  const { clearCart: clearContext, addToCart: addToContext, removeFromCart: removeFromContext } = useCart();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [buttonLoad, setButtonLoad] = useState(false);
  const [summary, setSummary] = useState({ subtotal: 0, shipping: 0, total: 0 });

  const [deliveryDetails, setDeliveryDetails] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    phoneNumber: "",
    completeAddress: "",
  });

  // Pre-fill from user data when available
  useEffect(() => {
    if (user) {
      setDeliveryDetails({
        firstName: user?.real_name?.split(" ")[0] || "",
        lastName: user?.real_name?.split(" ")[1] || "",
        emailAddress: user?.email || "",
        phoneNumber: user?.phone || "",
        completeAddress: user?.address || "",
      });
    }
  }, [user]);

  // Fetch cart – no token needed, api interceptor adds it
  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await getCart();
      // The response is already the data from your API: { success, data, summary }
      // (assuming the api instance unwraps axios.data)
      if (response?.success === true && Array.isArray(response.data)) {
        setCartItems(response.data);
        setSummary(response.summary || { subtotal: 0, shipping: 0, total: 0 });
      } else if (Array.isArray(response)) {
        // fallback if response is directly the array
        setCartItems(response);
      } else {
        console.warn("Unexpected cart response:", response);
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Could not load cart. Please try again.");
      setCartItems([]);
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
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to place order");
        return;
      }

      // ✅ Get userId from multiple sources
      const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
      const userId = user?.user_id || user?.id || userData?.user_id || null;

      console.log("User from auth:", user);
      console.log("User from localStorage:", userData);
      console.log("Final userId being sent:", userId);

      const totalAmount = summary.total || calculateSubtotal();

      const orderDetails = {
        userId: userId,  // Now correctly includes USR-cb90a8db-afc9
        guestName: `${deliveryDetails.firstName} ${deliveryDetails.lastName}`,
        guestEmail: deliveryDetails.emailAddress,
        guestPhone: deliveryDetails.phoneNumber,
        address: deliveryDetails.completeAddress,
        totalAmount,
        payment_method: "cod",
        items: cartItems.map((item) => ({
          productId: item.product_id,
          name: item.name,
          quantity: item.quantity,
          price: getPrice(item),
        })),
      };

      console.log("Placing order with details:", orderDetails);
      await placeOrder(token, orderDetails);
      toast.success("Order placed successfully!");
      setCartItems([]);
      setReload(!reload);
      navigate("/marketplace");
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setButtonLoad(false);
    }
  };


  const clearCart = () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      cartItems.forEach((item) => updateItem(item, 0, "full"));
    }
  };

  if (!isAuthenticated) {
    return (
      <Container>
        <EmptyCart>
          <ShoppingCart size={64} color="#cbd5e1" />
          <EmptyTitle>Please log in</EmptyTitle>
          <EmptyText>You need to be logged in to view your cart.</EmptyText>
          <Button
            text="Go to Login"
            onClick={() => navigate("/login")}
            style={{ background: "#e11d48", border: "none" }}
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
                          src={item.image || "https://via.placeholder.com/80"}
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
                      KES {summary.subtotal?.toLocaleString() || calculateSubtotal().toLocaleString()}
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
                      KES {summary.total?.toLocaleString() || calculateSubtotal().toLocaleString()}
                    </span>
                  </SummaryRow>

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