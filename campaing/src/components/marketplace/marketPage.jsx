// marketPage.jsx - Main Marketplace Component with Styled Components
import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { CartProvider } from "./context/CartContext";

// Import components
import Header from "./components/Header/Header";
import Home from "./components/Home";
import Cart from "./components/cart/cart";
import DetailView from "./components/ItemDetails/DetailView";
import Checkout from "./checkout/checkout";
import API_BASE_URL from "./apiConfig"


// Animations
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Styled Components
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  #root {
    margin: 0;
    padding: 0;
  }
`;

const Content = styled.div`
  margin-top: 0px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
  width: 100%;
  padding: 0;
  margin: 0;
`;

const Container = styled.div`
  max-width: 100%;
  margin: 0;
  padding: 0;
  width: 100%;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  flex-direction: column;
  gap: 16px;
  background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
`;

const LoadingText = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0;
`;

const Spinner = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
  color: #1e3c72;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 60px 40px;
  color: #ff4444;
  background: white;
  border-radius: 12px;
  margin: 40px auto;
  max-width: 500px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const ErrorText = styled.p`
  margin-bottom: 20px;
  font-size: 16px;
`;

const RetryButton = styled.button`
  padding: 10px 24px;
  background: #1e3c72;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: #2a4a8a;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(30, 60, 114, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Components
const LoadingSpinner = () => (
  <LoadingContainer>
    <Spinner size={48} />
    <LoadingText>Loading campaign store...</LoadingText>
  </LoadingContainer>
);

const ErrorDisplay = ({ error, onRetry }) => (
  <ErrorContainer>
    <ErrorText>Error: {error}</ErrorText>
    <RetryButton onClick={onRetry}>Retry</RetryButton>
  </ErrorContainer>
);

const MarketplacePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_BASE_URL}/products`, {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.data && response.data.success) {
          setProducts(response.data.data || []);
        } else if (Array.isArray(response.data)) {
          setProducts(response.data);
        } else if (response.data && response.data.products) {
          setProducts(response.data.products);
        } else {
          setProducts([]);
          setError("No products found");
        }
      } catch (err) {
        console.error("Error loading products:", err);

        if (err.code === "ECONNABORTED") {
          setError("Request timeout - Server is taking too long to respond");
        } else if (err.response) {
          setError(
            err.response.data?.message ||
              `Server error: ${err.response.status}`,
          );
        } else if (err.request) {
          setError(
            "Cannot connect to server. Please check if the backend is running.",
          );
        } else {
          setError(err.message || "Failed to load products");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <CartProvider>
        <GlobalStyle />
        <Header />
        <Content>
          <Container>
            <LoadingSpinner />
          </Container>
        </Content>
      </CartProvider>
    );
  }

  if (error) {
    return (
      <CartProvider>
        <GlobalStyle />
        <Header />
        <Content>
          <Container>
            <ErrorDisplay error={error} onRetry={handleRetry} />
          </Container>
        </Content>
      </CartProvider>
    );
  }

  return (
    <CartProvider>
      <GlobalStyle />
      <Header />
      <Content>
        <Container>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home products={products} />} />
            <Route path="/cart" element={<Cart />} />
            <Route
              path="/product/:id"
              element={<DetailView products={products} />}
            />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </Container>
      </Content>
    </CartProvider>
  );
};

export default MarketplacePage;
