// DetailView.jsx - Complete E-commerce Product Detail with Manifestos at Bottom
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  Heart,
  Share2,
  ShoppingCart,
  Loader2,
  ArrowLeft,
  Truck,
  Shield,
  Clock,
  ImageOff,
  Star,
  CheckCircle,
  Zap,
  FileText,
  TrendingUp,
  Award,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import TrendingManifestos from "../../../leaders/manifestos/TredingManifestos";
import AdBanner from "./AdBanner";

const API_URL = "/api/v1/marketplace";

// Modern Color Theme
const COLORS = {
  primary: "#e74c3c",
  primaryDark: "#c0392b",
  primaryLight: "#ec7063",
  secondary: "#2c3e50",
  text: "#2c3e50",
  textLight: "#7f8c8d",
  border: "#ecf0f1",
  background: "#f9f9f9",
  white: "#ffffff",
  success: "#27ae60",
  warning: "#f39c12",
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px;
  min-height: calc(100vh - 80px);
  animation: ${fadeIn} 0.3s ease-out;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: ${COLORS.textLight};
  cursor: pointer;
  margin-bottom: 16px;
  padding: 6px 0;
  font-size: 13px;
  transition: all 0.2s;

  &:hover {
    color: ${COLORS.primary};
    gap: 8px;
  }
`;

// Sleek Product Card - Mobile Optimized
const ProductCard = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  background: ${COLORS.white};
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
    border-radius: 16px;
  }
`;

const ImageSection = styled.div`
  text-align: center;
  position: relative;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${COLORS.background};
  border-radius: 16px;
  overflow: hidden;

  @media (max-width: 768px) {
    min-height: 220px;
    border-radius: 12px;
  }
`;

const ProductImage = styled.img`
  max-width: 100%;
  max-height: 280px;
  object-fit: contain;
  border-radius: 12px;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }

  @media (max-width: 768px) {
    max-height: 200px;
  }
`;

const Badge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background: ${(props) => (props.$discount ? COLORS.primary : COLORS.success)};
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  z-index: 2;
`;

const InfoSection = styled.div``;

const ProductTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: ${COLORS.text};
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const ProductDescription = styled.div`
  font-size: 14px;
  color: ${COLORS.textLight};
  line-height: 1.6;
  margin: 12px 0;
  padding: 12px 0;
  border-top: 1px solid ${COLORS.border};
  border-bottom: 1px solid ${COLORS.border};

  @media (max-width: 768px) {
    font-size: 13px;
    margin: 8px 0;
    padding: 8px 0;
  }
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const RatingBadge = styled.div`
  background: ${COLORS.success};
  color: white;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const Stars = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const ReviewCount = styled.span`
  color: ${COLORS.textLight};
  font-size: 11px;
`;

const PriceSection = styled.div`
  margin: 12px 0;
  padding: 12px 0;
  border-top: 1px solid ${COLORS.border};
  border-bottom: 1px solid ${COLORS.border};
`;

const CurrentPrice = styled.span`
  font-size: 28px;
  font-weight: 700;
  color: ${COLORS.primary};
  margin-right: 10px;

  @media (max-width: 768px) {
    font-size: 24px;
  }

  small {
    font-size: 13px;
    font-weight: 500;
  }
`;

const OriginalPrice = styled.span`
  font-size: 15px;
  color: ${COLORS.textLight};
  text-decoration: line-through;
  margin-right: 10px;
`;

const Discount = styled.span`
  font-size: 12px;
  color: ${COLORS.success};
  font-weight: 600;
  background: ${COLORS.success}15;
  padding: 2px 10px;
  border-radius: 20px;
`;

const DeliveryInfo = styled.div`
  display: flex;
  gap: 16px;
  margin: 12px 0;
  padding: 10px;
  background: ${COLORS.background};
  border-radius: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 12px;
    padding: 8px;
  }
`;

const DeliveryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: ${COLORS.textLight};

  svg {
    width: 12px;
    height: 12px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin: 16px 0;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const AddToCartButton = styled.button`
  flex: 1;
  background: ${COLORS.primary};
  color: white;
  border: none;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${COLORS.primaryDark};
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }
`;

const BuyNowButton = styled.button`
  flex: 1;
  background: ${COLORS.secondary};
  color: white;
  border: none;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: #1a252f;
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  flex: 1;
  background: white;
  border: 1px solid ${COLORS.border};
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
  font-size: 12px;
  color: ${COLORS.textLight};

  &:hover {
    background: ${COLORS.background};
    border-color: ${COLORS.primary};
    color: ${COLORS.primary};
  }
`;

// Manifestos Section - Full width at bottom
const ManifestosSection = styled.div`
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid ${COLORS.border};
`;

const ManifestosTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: ${COLORS.text};
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ManifestosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const ManifestoCard = styled.div`
  background: ${COLORS.white};
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid ${COLORS.border};
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border-color: ${COLORS.primary}30;
  }
`;

const ManifestoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const ManifestoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${COLORS.primary}10;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLORS.primary};
`;

const ManifestoName = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: ${COLORS.text};
`;

const ManifestoParty = styled.div`
  font-size: 11px;
  color: ${COLORS.textLight};
`;

const ManifestoExcerpt = styled.p`
  font-size: 12px;
  color: ${COLORS.textLight};
  line-height: 1.5;
  margin: 12px 0;
`;

const ReadMoreLink = styled.button`
  background: none;
  border: none;
  color: ${COLORS.primary};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  margin-top: 8px;

  &:hover {
    gap: 8px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  gap: 12px;
  flex-direction: column;
`;

const Spinner = styled(Loader2)`
  animation: spin 1s linear infinite;
  color: ${COLORS.primary};
`;

const Toast = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: ${COLORS.success};
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  font-size: 13px;
  animation: ${fadeIn} 0.3s ease;
`;

// Helper function to render stars
const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);

  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={i} size={12} fill="#f39c12" color="#f39c12" />);
  }

  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} size={12} color="#ddd" />);
  }

  return stars;
};

// Image URL helper
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/")) return `${API_URL}${imagePath}`;
  return `${API_URL}/${imagePath}`;
};

const DetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [manifestos, setManifestos] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/products/${id}`);

        if (response.data.success) {
          setProduct(response.data.data);
          setImageError(false);

          const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
          setIsWishlisted(wishlist.includes(response.data.data.id));
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // Fetch trending manifestos
  useEffect(() => {
    const fetchManifestos = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/manifestos/trending?limit=3`,
        );
        if (response.data.success) {
          setManifestos(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching manifestos:", err);
      }
    };
    fetchManifestos();
  }, []);

  const handleAddToCart = () => {
    if (product) {
      const cart = JSON.parse(localStorage.getItem("marketplace_cart") || "[]");
      const existing = cart.find((item) => item.id === product.id);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      localStorage.setItem("marketplace_cart", JSON.stringify(cart));
      setToastMessage(`${product.name} added to cart!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };

  const handleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    if (isWishlisted) {
      const newWishlist = wishlist.filter((item) => item !== product.id);
      localStorage.setItem("wishlist", JSON.stringify(newWishlist));
      setToastMessage("Removed from wishlist");
    } else {
      wishlist.push(product.id);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      setToastMessage("Added to wishlist");
    }
    setIsWishlisted(!isWishlisted);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner size={36} />
        <div style={{ fontSize: "14px", color: COLORS.textLight }}>
          Loading...
        </div>
      </LoadingContainer>
    );
  }

  if (error || !product) {
    return (
      <LoadingContainer>
        <p style={{ color: COLORS.primary }}>{error || "Product not found"}</p>
        <BackButton onClick={() => navigate("/marketplace")}>
          <ArrowLeft size={16} />
          Back to Store
        </BackButton>
      </LoadingContainer>
    );
  }

  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const imageUrl = getImageUrl(product.image);
  const rating = product.avg_rating || 4.5;
  const reviewCount = product.review_count || 234;

  return (
    <>
      <Container>
        <BackButton onClick={() => navigate("/marketplace")}>
          <ArrowLeft size={16} />
          Back to Store
        </BackButton>

        {/* Product Card - Sleek on Mobile */}
        <ProductCard>
          <ImageSection>
            {!imageError && imageUrl ? (
              <>
                {discount > 0 && <Badge $discount>-{discount}%</Badge>}
                <ProductImage
                  src={imageUrl}
                  alt={product.name}
                  onError={() => setImageError(true)}
                />
              </>
            ) : (
              <ImageOff size={48} color={COLORS.textLight} />
            )}
          </ImageSection>

          <InfoSection>
            <ProductTitle>{product.name}</ProductTitle>

            <RatingContainer>
              <RatingBadge>{rating.toFixed(1)} ★</RatingBadge>
              <Stars>{renderStars(rating)}</Stars>
              <ReviewCount>({reviewCount} reviews)</ReviewCount>
            </RatingContainer>

            <ProductDescription>
              {product.description || "No description available"}
            </ProductDescription>

            <PriceSection>
              <CurrentPrice>
                KES {product.price?.toLocaleString()}
                <small>/item</small>
              </CurrentPrice>
              {product.mrp && product.mrp > product.price && (
                <>
                  <OriginalPrice>
                    KES {product.mrp?.toLocaleString()}
                  </OriginalPrice>
                  <Discount>-{discount}%</Discount>
                </>
              )}
            </PriceSection>

            <DeliveryInfo>
              <DeliveryItem>
                <Truck size={12} /> Free delivery
              </DeliveryItem>
              <DeliveryItem>
                <Shield size={12} /> 10 days replacement
              </DeliveryItem>
              <DeliveryItem>
                <Clock size={12} /> In stock
              </DeliveryItem>
            </DeliveryInfo>

            <ButtonGroup>
              <AddToCartButton onClick={handleAddToCart}>
                <ShoppingCart size={16} />
                Add to Cart
              </AddToCartButton>
              <BuyNowButton onClick={handleBuyNow}>
                <Zap size={16} />
                Buy Now
              </BuyNowButton>
            </ButtonGroup>

            <ActionButtons>
              <ActionButton onClick={handleWishlist}>
                <Heart
                  size={14}
                  fill={isWishlisted ? COLORS.primary : "none"}
                />
                {isWishlisted ? "Wishlisted" : "Wishlist"}
              </ActionButton>
              <ActionButton
                onClick={() => setToastMessage("Share feature coming soon!")}
              >
                <Share2 size={14} />
                Share
              </ActionButton>
            </ActionButtons>
          </InfoSection>
        </ProductCard>

        {/* Ad Banner */}
        <AdBanner />

        {/* Manifestos Section - At the bottom */}
        <ManifestosSection>
          <ManifestosTitle>
            <TrendingUp size={20} color={COLORS.primary} />
            Trending Manifestos
            <Award size={16} color={COLORS.warning} />
          </ManifestosTitle>

          <ManifestosGrid>
            {manifestos.length > 0 ? (
              manifestos.map((manifesto) => (
                <ManifestoCard key={manifesto.id}>
                  <ManifestoHeader>
                    <ManifestoIcon>
                      <FileText size={20} />
                    </ManifestoIcon>
                    <div>
                      <ManifestoName>{manifesto.title}</ManifestoName>
                      <ManifestoParty>
                        {manifesto.party} • {manifesto.aspirant}
                      </ManifestoParty>
                    </div>
                  </ManifestoHeader>
                  <ManifestoExcerpt>
                    {manifesto.excerpt ||
                      manifesto.description?.substring(0, 100)}
                  </ManifestoExcerpt>
                  <ReadMoreLink
                    onClick={() => navigate(`/manifestos/${manifesto.id}`)}
                  >
                    Read Full Manifesto <ChevronRight size={12} />
                  </ReadMoreLink>
                </ManifestoCard>
              ))
            ) : (
              <TrendingManifestos limit={3} />
            )}
          </ManifestosGrid>
        </ManifestosSection>
      </Container>

      {/* Toast Notification */}
      {showToast && (
        <Toast>
          <CheckCircle size={14} />
          {toastMessage}
        </Toast>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default DetailView;
