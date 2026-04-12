import React, { useEffect, useState } from "react";
import styled from "styled-components";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import { addToCart, deleteFromCart, getCart, placeOrder } from "../components/api";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { Trash2, ShoppingCart } from "lucide-react";
import { useAuth } from "@/components/hooks/useAuth";

const Container = styled.div`
  padding: 40px 30px;
  min-height: 100vh;
  background: ${({ theme }) => theme.bg};
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
  gap: 40px;
`;
const Title = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme.text_primary};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Wrapper = styled.div`
  display: flex;
  gap: 40px;
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
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
`;

const ItemHeader = styled.div`
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr 1fr 0.2fr;
  padding: 0 10px 20px 10px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
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
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const ProductImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 16px;
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProductTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.text_primary};
`;

const ProductSub = styled.div`
  font-size: 13px;
  color: #64748b;
`;

const Price = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.text_primary};
`;

const Counter = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
  padding: 6px 14px;
  border-radius: 12px;
  width: fit-content;
  font-weight: 600;
`;

const CounterBtn = styled.div`
  cursor: pointer;
  color: #64748b;
  font-size: 20px;
  transition: all 0.2s ease;
  &:hover {
    color: #e11d48;
  }
`;

const Right = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SummaryCard = styled(Card)`
  background: #1e293b;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${({ total }) => (total ? "24px" : "16px")};
  font-weight: ${({ total }) => (total ? "800" : "500")};
  color: ${({ total }) => (total ? "white" : "#94a3b8")};
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255,255,255,0.1);
  margin: 10px 0;
`;

const Cart = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [products, setProducts] = useState([]);
  const [buttonLoad, setButtonLoad] = useState(false);

  // Parse cookie helper
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
  }

  // Check for existing session via cookie if not authenticated via regular state
  const isSessionValid = isAuthenticated || !!getCookie("user_info");

  const [deliveryDetails, setDeliveryDetails] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    phoneNumber: "",
    completeAddress: "",
  });

  const getProducts = async () => {
    if (!isAuthenticated) {
      const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
      setProducts(guestCart);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await getCart(token);
      const cartItems = res.data.data || [];
      const formattedData = cartItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        _id: item._id
      }));
      setProducts(formattedData);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addCart = async (product) => {
    if (!isAuthenticated) {
        const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
        const existingItemIndex = guestCart.findIndex(item => item.product._id === product._id);
        if (existingItemIndex > -1) {
            guestCart[existingItemIndex].quantity += 1;
        } else {
            guestCart.push({ product, quantity: 1 });
        }
        localStorage.setItem("guest_cart", JSON.stringify(guestCart));
        setReload(!reload);
        return;
    }

    const token = localStorage.getItem("access_token");
    try {
      await addToCart(token, { productId: product._id, quantity: 1 });
      setReload(!reload);
    } catch (err) {
      alert(err.message || "Failed to add to cart");
    }
  };

  const removeCart = async (product, quantity, type) => {
    if (!isAuthenticated) {
        let guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
        const existingItemIndex = guestCart.findIndex(item => item.product._id === product._id);
        
        if (existingItemIndex > -1) {
            if (type === "full" || quantity <= 0) {
                guestCart = guestCart.filter(item => item.product._id !== product._id);
            } else {
                guestCart[existingItemIndex].quantity = quantity;
            }
        }
        localStorage.setItem("guest_cart", JSON.stringify(guestCart));
        setReload(!reload);
        return;
    }

    const token = localStorage.getItem("access_token");
    let qnt = quantity > 0 ? 1 : null;
    if (type === "full") qnt = null;
    try {
      await deleteFromCart(token, {
        productId: product._id,
        quantity: qnt,
      });
      setReload(!reload);
    } catch (err) {
      alert(err.message || "Failed to remove from cart");
    }
  };

  // Safe price extractor — handles { org, mrp } objects AND plain numbers/strings
  const getPrice = (product) => {
    if (!product) return 0;
    if (product.price && typeof product.price === 'object') {
      return parseFloat(product.price.org) || parseFloat(product.price.mrp) || 0;
    }
    return parseFloat(product.price) || 0;
  };

  const calculateSubtotal = () => {
    return products.reduce((total, item) => {
      const price = getPrice(item?.product);
      const qty = parseInt(item.quantity || 0);
      return total + (price * qty);
    }, 0);
  };

  useEffect(() => {
    getProducts();
  }, [reload, isAuthenticated]);

  const convertAddressToString = (addressObj) => {
    return `${addressObj.firstName} ${addressObj.lastName}, ${addressObj.completeAddress}, ${addressObj.phoneNumber}, ${addressObj.emailAddress}`;
  };

  const PlaceOrder = async () => {
    setButtonLoad(true);
    try {
      const isDeliveryDetailsFilled =
        deliveryDetails.firstName &&
        deliveryDetails.lastName &&
        deliveryDetails.completeAddress &&
        deliveryDetails.phoneNumber &&
        deliveryDetails.emailAddress;

      if (!isDeliveryDetailsFilled) {
        alert("Please fill in all required delivery details.");
        setButtonLoad(false);
        return;
      }

      const token = localStorage.getItem("access_token");
      const totalAmount = calculateSubtotal().toFixed(2);
      
      const orderDetails = {
        userId: user?._id || null,
        guestName: `${deliveryDetails.firstName} ${deliveryDetails.lastName}`,
        guestEmail: deliveryDetails.emailAddress,
        guestPhone: deliveryDetails.phoneNumber,
        address: deliveryDetails.completeAddress,
        totalAmount,
        payment_method: 'cod',
        items: products.map(p => ({
          productId: p.product._id || p.product.id,
          name: p.product.title || p.product.name,
          quantity: p.quantity,
          price: getPrice(p.product)
        })),
      };

      await placeOrder(token, orderDetails);
      alert("Order placed successfully!");
      localStorage.removeItem("guest_cart");
      setReload(!reload);
      navigate("/marketplace");
    } catch (error) {
      console.error("Order error:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setButtonLoad(false);
    }
  };

  return (
    <Container>
      {loading ? (
        <Spinner animation="border" style={{ color: "#e11d48", margin: "100px auto", display: "block" }} />
      ) : (
        <Section>
          <Title>
            <ShoppingCart size={32} /> Your Shopping Bag
          </Title>
          
          {products.length === 0 ? (
            <Card style={{ textAlign: "center", padding: "80px" }}>
              <div style={{ fontSize: "20px", color: "#64748b", marginBottom: "20px" }}>Your bag is empty. Start shopping for amazing deals!</div>
              <Button text="Browse Products" onClick={() => navigate("/marketplace/shop")} />
            </Card>
          ) : (
            <Wrapper>
              <Left>
                <Card>
                  <ItemHeader>
                    <div>Product</div>
                    <div>Price</div>
                    <div>Quantity</div>
                    <div>Subtotal</div>
                    <div></div>
                  </ItemHeader>
                  
                  {products?.map((item) => (
                    <CartItemRow key={item?.product?._id}>
                      <ProductInfo>
                        <ProductImage src={item?.product?.img} />
                        <ProductDetails>
                          <ProductTitle>{item?.product?.title}</ProductTitle>
                          <ProductSub>{item?.product?.category || "Premium"}</ProductSub>
                        </ProductDetails>
                      </ProductInfo>
                      
                      <Price>KES {getPrice(item?.product).toLocaleString('en-KE')}</Price>
                      
                      <Counter>
                        <CounterBtn onClick={() => removeCart(item?.product, item?.quantity - 1)}>-</CounterBtn>
                        {item?.quantity}
                        <CounterBtn onClick={() => addCart(item?.product)}>+</CounterBtn>
                      </Counter>
                      
                      <Price>KES {(item.quantity * getPrice(item?.product)).toLocaleString('en-KE')}</Price>
                      
                      <Trash2
                        size={20}
                        style={{ color: "#94a3b8", cursor: "pointer", transition: "color 0.2s" }}
                        className="trash-hover"
                        onClick={() => removeCart(item?.product, 0, "full")}
                      />
                    </CartItemRow>
                  ))}
                </Card>
                
                <Card>
                  <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>Delivery Information</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <TextInput
                      placeholder="First Name"
                      value={deliveryDetails.firstName}
                      handelChange={(e) => setDeliveryDetails({ ...deliveryDetails, firstName: e.target.value })}
                    />
                    <TextInput
                      placeholder="Last Name"
                      value={deliveryDetails.lastName}
                      handelChange={(e) => setDeliveryDetails({ ...deliveryDetails, lastName: e.target.value })}
                    />
                  </div>
                  <div style={{ marginTop: "16px" }}>
                    <TextInput
                      value={deliveryDetails.emailAddress}
                      handelChange={(e) => setDeliveryDetails({ ...deliveryDetails, emailAddress: e.target.value })}
                      placeholder="Email Address"
                    />
                  </div>
                  <div style={{ marginTop: "16px" }}>
                    <TextInput
                      value={deliveryDetails.phoneNumber}
                      handelChange={(e) => setDeliveryDetails({ ...deliveryDetails, phoneNumber: e.target.value })}
                      placeholder="Phone Number"
                    />
                  </div>
                  <div style={{ marginTop: "16px" }}>
                    <TextInput
                      textArea
                      rows="3"
                      handelChange={(e) => setDeliveryDetails({ ...deliveryDetails, completeAddress: e.target.value })}
                      value={deliveryDetails.completeAddress}
                      placeholder="Shipping Address"
                    />
                  </div>
                </Card>
              </Left>

              <Right>
                <SummaryCard>
                  <div style={{ fontSize: "20px", fontWeight: 800 }}>Order Summary</div>
                  
                  <SummaryRow>
                    <span>Items ({products.reduce((acc, i) => acc + i.quantity, 0)})</span>
                    <span>KSH {calculateSubtotal().toFixed(2)}</span>
                  </SummaryRow>
                  
                  <SummaryRow>
                    <span>Shipping</span>
                    <span style={{ color: "#22c55e" }}>Free</span>
                  </SummaryRow>
                  
                  <Divider />
                  
                  <SummaryRow total>
                    <span>Total Amount</span>
                    <span>KSH {calculateSubtotal().toFixed(2)}</span>
                  </SummaryRow>
                  
                  <Button
                    text="Complete Checkout"
                    isLoading={buttonLoad}
                    isDisabled={buttonLoad}
                    onClick={PlaceOrder}
                    full
                    style={{ background: "#e11d48", border: "none" }}
                  />
                  
                  <div style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
                    Taxes and shipping calculated at checkout
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
