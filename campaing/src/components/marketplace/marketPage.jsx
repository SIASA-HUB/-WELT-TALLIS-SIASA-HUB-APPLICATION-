import styled, { ThemeProvider } from "styled-components";
import { lightTheme } from "./components/utils/Themes";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ShopListing from "./pages/ShopListing";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./checkout/checkout";
import { useAuth } from "@/components/hooks/useAuth";

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  color: #1e293b;

  overflow-x: hidden;
  overflow-y: hidden;
  padding-bottom:   70px;
  transition: all 0.3s ease;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
`;

function marketPage() {
  const { user, leader } = useAuth();

  return (
    <ThemeProvider theme={lightTheme}>
      <Container>
        <Navbar currentUser={user} currentLeader={leader} />
        <Content>
          <Routes>
            <Route path="/" exact element={<Home />} />
            <Route path="/shop" exact element={<ShopListing />} />
            <Route path="/cart" exact element={<Cart />} />
            <Route path="/checkout" exact element={<Checkout />} />
            <Route path="/shop/:id" exact element={<ProductDetails />} />
            <Route path="/product/:slug" exact element={<ProductDetails />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Content>
      </Container>
    </ThemeProvider>
  );
}

export default marketPage;
