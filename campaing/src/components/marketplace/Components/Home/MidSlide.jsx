import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import Slide from "./Slide";

const Container = styled.div`
  display: flex;
  gap: 15px;
  margin: 20px 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const LeftComponent = styled.div`
  width: 83%;
  transition: all 0.3s;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const RightComponent = styled.div`
  width: 17%;
  margin-top: 12px;
  background: #ffffff;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const AdImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  border-radius: 6px;
  transition: transform 0.3s;

  ${RightComponent}:hover & {
    transform: scale(1.02);
  }
`;

const AdContainer = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 6px;
`;

const AdOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 20px 12px 12px;
  transform: translateY(100%);
  transition: transform 0.3s;
  color: white;

  ${RightComponent}:hover & {
    transform: translateY(0);
  }
`;

const AdTitle = styled.h4`
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
`;

const AdSubtitle = styled.p`
  margin: 0;
  font-size: 12px;
  opacity: 0.9;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  min-height: 200px;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 40px;
  color: #ff4444;
`;

// Campaign-themed ads
const campaignAds = [
  {
    url: "https://images.unsplash.com/photo-1556742049-0cfed2f52a45?w=400",
    title: "Limited Edition",
    subtitle: "Campaign Merchandise",
    link: "/limited-edition",
  },
  {
    url: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400",
    title: "New Arrivals",
    subtitle: "Fresh Campaign Gear",
    link: "/new-arrivals",
  },
];

const API_URL = "http://localhost:8000";

const MidSlide = ({ products: propProducts }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If products are passed as props, use them
    if (propProducts && propProducts.length > 0) {
      setProducts(propProducts);
      setLoading(false);
      return;
    }

    // Otherwise fetch from API
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/products?limit=20`);
        if (response.data.success) {
          setProducts(response.data.data);
        } else {
          setError("Failed to load products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [propProducts]);

  const adURL = campaignAds[0].url;

  if (loading) {
    return (
      <Container>
        <LeftComponent>
          <LoadingContainer>
            <div style={{ textAlign: "center" }}>
              <div>Loading products...</div>
            </div>
          </LoadingContainer>
        </LeftComponent>
        <RightComponent>
          <AdContainer>
            <AdImage src={adURL} alt="Campaign Merchandise" />
            <AdOverlay>
              <AdTitle>Campaign Gear</AdTitle>
              <AdSubtitle>Shop Now →</AdSubtitle>
            </AdOverlay>
          </AdContainer>
        </RightComponent>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <LeftComponent>
          <ErrorContainer>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                background: "#bb0000",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </ErrorContainer>
        </LeftComponent>
        <RightComponent>
          <AdContainer>
            <AdImage src={adURL} alt="Campaign Merchandise" />
            <AdOverlay>
              <AdTitle>Campaign Gear</AdTitle>
              <AdSubtitle>Shop Now →</AdSubtitle>
            </AdOverlay>
          </AdContainer>
        </RightComponent>
      </Container>
    );
  }

  return (
    <Container>
      <LeftComponent>
        <Slide
          data={products}
          title="Campaign Specials"
          timer={true}
          multi={true}
        />
      </LeftComponent>

      <RightComponent>
        <AdContainer>
          <AdImage src={adURL} alt="Campaign Merchandise" />
          <AdOverlay>
            <AdTitle>Campaign Gear</AdTitle>
            <AdSubtitle>Shop Now →</AdSubtitle>
          </AdOverlay>
        </AdContainer>
      </RightComponent>
    </Container>
  );
};

export default MidSlide;
