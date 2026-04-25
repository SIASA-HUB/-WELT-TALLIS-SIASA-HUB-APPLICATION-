import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Flame, ArrowRight } from "lucide-react";
import api from "../../../api/api";
import API from "../../../api/config";
import { buildImageUrl } from "../../../utils/imageUtils";

// --- ANIMATIONS ---
// ... existing animations ...
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ... existing styles ...
const Section = styled.div`
  padding: 48px 0;
  background: #ffffff;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
`;

const HeaderGroup = styled.div`
  text-align: left;
  margin-bottom: 32px;
`;

const SectionSubtitle = styled.div`
  color: #e11d48;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 12px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  position: relative;
  display: inline-block;

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 60px;
    height: 3px;
    background: #e11d48;
    border-radius: 2px;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`;

const ProductCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  animation: ${fadeInUp} 0.5s ease-out;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.1);
    border-color: #e11d48;
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  background: #f8fafc;
  overflow: hidden;
`;

const ProductImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
  
  ${ProductCard}:hover & {
    transform: scale(1.05);
  }
`;

const ProductName = styled.h3`
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  margin: 12px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SkeletonCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
  
  .skeleton-image {
    width: 100%;
    padding-bottom: 100%;
    background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s infinite;
  }
  
  .skeleton-text {
    height: 16px;
    margin: 12px;
    background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s infinite;
    border-radius: 4px;
  }
`;

const ViewAllButton = styled.div`
  text-align: center;
  margin-top: 40px;
  
  button {
    background: transparent;
    border: 1px solid #e5e7eb;
    color: #e11d48;
    padding: 10px 28px;
    border-radius: 40px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    
    &:hover {
      background: #e11d48;
      color: white;
      border-color: #e11d48;
    }
  }
`;

// Helper to get image from various possible fields
const getProductImage = (product) => {
  if (product.image_url && product.image_url !== "null") return buildImageUrl(product.image_url);
  if (product.images?.[0]) return buildImageUrl(product.images[0]);
  if (product.image && product.image !== "null") return buildImageUrl(product.image);
  return null;
};

const DEFAULT_PLACEHOLDER = "https://placehold.co/600x600/1e293b/ffffff?text=No+Image";
const FALLBACK_PLACEHOLDER = "https://placehold.co/600x600/f0f0f0/999999?text=Image+Not+Found";

const MerchAdsCarousel = ({ title = "Trending Merchandise", limit = 8, onEmpty }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const navigate = useNavigate();

  const fetchProducts = async () => {
    let mounted = true;
    setLoading(true);
    try {
      await api.getWithCache(`/products?featured=true&limit=${limit}`, (data) => {
        if (!mounted) return;
        const productsList = Array.isArray(data) ? data : (data?.data || []);
        if (productsList.length > 0) {
          setProducts(productsList);
          setLoading(false);
        } else {
          api.getWithCache(`/products?limit=${limit}`, (fallbackData) => {
            if (!mounted) return;
            const fallbackList = Array.isArray(fallbackData) ? fallbackData : (fallbackData?.data || []);
            if (fallbackList.length > 0) {
              setProducts(fallbackList);
            } else if (onEmpty) {
              onEmpty();
            }
            setLoading(false);
          });
        }
      });
    } catch (error) {
      console.error("Error fetching ads:", error);
      if (mounted && onEmpty) onEmpty();
    } finally {
      if (mounted) setLoading(false);
    }
    return () => { mounted = false; };
  };

  useEffect(() => {
    const cleanup = fetchProducts();
    return () => { if (typeof cleanup === 'function') cleanup(); };
  }, [limit]);

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const getDisplayImage = (product) => {
    if (imageErrors[product._id || product.id]) return FALLBACK_PLACEHOLDER;
    return getProductImage(product) || DEFAULT_PLACEHOLDER;
  };

  if (loading) {
    return (
      <Section>
        <Container>
          <HeaderGroup>
            <SectionSubtitle><Flame size={14} /> HOT RIGHT NOW</SectionSubtitle>
            <Title>{title}</Title>
          </HeaderGroup>
          <GridContainer>
            {[...Array(Math.min(limit, 8))].map((_, i) => (
              <SkeletonCard key={i}>
                <div className="skeleton-image" />
                <div className="skeleton-text" />
              </SkeletonCard>
            ))}
          </GridContainer>
        </Container>
      </Section>
    );
  }

  if (!products.length) return null;

  return (
    <Section>
      <Container>
        <HeaderGroup>
          <SectionSubtitle><Flame size={14} /> HOT RIGHT NOW</SectionSubtitle>
          <Title>{title}</Title>
        </HeaderGroup>

        <GridContainer>
          {products.slice(0, limit).map((product) => (
            <ProductCard
              key={product._id || product.id}
              onClick={() => navigate(`/marketplace/shop/${product._id || product.id}`)}
            >
              <ImageWrapper>
                <ProductImage
                  src={getDisplayImage(product)}
                  alt={product.name || "Product image"}
                  onError={() => handleImageError(product._id || product.id)}
                  loading="lazy"
                />
              </ImageWrapper>
              <ProductName>{product.name || "Unnamed Product"}</ProductName>
            </ProductCard>
          ))}
        </GridContainer>

        <ViewAllButton>
          <button onClick={() => navigate("/marketplace/shop")}>
            Shop All <ArrowRight size={14} />
          </button>
        </ViewAllButton>
      </Container>
    </Section>
  );
};

export default MerchAdsCarousel;