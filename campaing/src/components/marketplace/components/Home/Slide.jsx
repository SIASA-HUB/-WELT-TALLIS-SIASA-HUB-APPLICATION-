// Slide.js - Sleek & Compact Product Cards with Navy Blue Theme
import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  ShoppingCart,
  Eye,
  Heart,
  Star,
  Truck,
} from "lucide-react";

import   API_BASE_URL   from  '../../apiConfig'


// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

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
const Container = styled.div`
  margin: 0px 0;
  background: ${COLORS.white};
  border-radius: 16px;
  padding: 20px;
  animation: ${fadeInUp} 0.4s ease-out;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: ${COLORS.text};
`;

const Timer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${COLORS.primary}10;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: ${COLORS.primary};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-color: ${COLORS.primary};

    .hover-actions {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ImageWrapper = styled(Link)`
  position: relative;
  display: block;
  overflow: hidden;
  aspect-ratio: 1 / 1.1;
  background: #fdfdfd;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;

  ${ProductCard}:hover & {
    transform: scale(1.1);
  }
`;

const HoverActions = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  display: flex;
  justify-content: center;
  gap: 10px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  z-index: 3;
`;

const ActionButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: ${COLORS.primary};

  &:hover {
    background: ${COLORS.primary};
    color: white;
    transform: scale(1.1);
  }
`;

const ProductInfo = styled.div`
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const ProductName = styled.h4`
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: ${COLORS.text};
  line-height: 1.4;
  height: 2.8em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;

  .stars {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .reviews {
    font-size: 11px;
    color: ${COLORS.textLight};
    font-weight: 500;
  }
`;

const PriceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
`;

const CurrentPrice = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: ${COLORS.primary};
`;

const OriginalPrice = styled.span`
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
`;

const OrderButton = styled.button`
  margin-top: 12px;
  width: 100%;
  background: ${COLORS.primary};
  color: white;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: #000;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ViewAllLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${COLORS.primary};
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;

  &:hover {
    gap: 8px;
  }
`;

const SkeletonCard = styled.div`
  background: ${COLORS.white};
  border-radius: 12px;
  border: 1px solid ${COLORS.border};

  .skeleton-image {
    aspect-ratio: 1;
    background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s infinite;
  }

  .skeleton-text {
    height: 10px;
    background: #f0f0f0;
    margin: 10px;
    border-radius: 4px;
  }

  .skeleton-text.short {
    width: 60%;
  }

  .skeleton-button {
    height: 32px;
    background: #f0f0f0;
    margin: 10px;
    border-radius: 8px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${COLORS.textLight};

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  p {
    margin: 4px 0;
    font-size: 13px;
  }
`;

// Helper function to render stars
const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={`star-${i}`} size={10} fill="#ffcc00" color="#ffcc00" />,
    );
  }

  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`star-empty-${i}`} size={10} color="#ddd" />);
  }

  return stars;
};

// Image URL helper
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  if (imagePath.startsWith("/")) {
    return `${API_BASE_URL}${imagePath}`;
  }
  return `${API_BASE_URL}/${imagePath}`;
};

const Slide = ({ data, title, timer, multi, onAddToCart, loading = false }) => {
  const [wishlist, setWishlist] = useState(new Set());
  const [timerDisplay, setTimerDisplay] = useState(null);

  React.useEffect(() => {
    if (!timer) return;

    const updateTimer = () => {
      const endTime = new Date();
      endTime.setHours(23, 59, 59);
      const now = new Date();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimerDisplay("00:00:00");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimerDisplay(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const toggleWishlist = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      const cart = JSON.parse(localStorage.getItem("marketplace_cart") || "[]");
      const existing = cart.find((item) => item.id === product.id);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      localStorage.setItem("marketplace_cart", JSON.stringify(cart));
    }
  };

  const displayProducts = multi ? data?.slice(0, 8) : data?.slice(0, 4);
  const hasMore = data && data.length > (multi ? 8 : 4);

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>{title || "Loading..."}</Title>
        </Header>
        <ProductsGrid>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i}>
              <div className="skeleton-image" />
              <div className="skeleton-text" />
              <div className="skeleton-text short" />
              <div className="skeleton-button" />
            </SkeletonCard>
          ))}
        </ProductsGrid>
      </Container>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Container>
      <Header>
        <Title>{title}</Title>
        {timer && timerDisplay && <Timer>Ends: {timerDisplay}</Timer>}
        {hasMore && (
          <ViewAllLink to="/marketplace">
            View All <ChevronRight size={14} />
          </ViewAllLink>
        )}
      </Header>

      <ProductsGrid>
        {displayProducts.map((product) => {
          const imageUrl = getImageUrl(product.image);
          const discount =
            product.mrp && product.mrp > product.price
              ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
              : 0;
          const rating = product.avg_rating || 4;
          const reviewCount = product.review_count || 0;
          const isWishlisted = wishlist.has(product.id);

          return (
            <ProductCard key={product.id}>
              <ImageWrapper to={`/marketplace/product/${product.id}`}>
                {discount > 0 && <DiscountBadge>-{discount}%</DiscountBadge>}
                <ProductImage
                  src={
                    imageUrl ||
                    "https://placehold.co/300x300/f5f5f5/ccc?text=No+Image"
                  }
                  alt={product.name}
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/300x300/f5f5f5/ccc?text=No+Image";
                  }}
                />
                <HoverActions className="hover-actions">
                  <ActionButton onClick={(e) => toggleWishlist(product.id, e)}>
                    <Heart size={18} fill={isWishlisted ? COLORS.primary : "none"} />
                  </ActionButton>
                  <ActionButton onClick={(e) => handleAddToCart(product, e)}>
                    <ShoppingCart size={18} />
                  </ActionButton>
                </HoverActions>
              </ImageWrapper>

              <ProductInfo>
                <ProductName>{product.name}</ProductName>

                <Rating>
                  <div className="stars">{renderStars(rating)}</div>
                  <span className="reviews">({reviewCount} reviews)</span>
                </Rating>

                <PriceSection>
                  <CurrentPrice>
                    KES {product.price.toLocaleString()}
                  </CurrentPrice>
                  {product.mrp && product.mrp > product.price && (
                    <OriginalPrice>
                      KES {product.mrp.toLocaleString()}
                    </OriginalPrice>
                  )}
                </PriceSection>

                <OrderButton onClick={(e) => handleAddToCart(product, e)}>
                  <ShoppingCart size={16} /> Add to Cart
                </OrderButton>
              </ProductInfo>
            </ProductCard>
          );
        })}
      </ProductsGrid>
    </Container>
  );
};

export default Slide;
