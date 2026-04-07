// DetailView.jsx - Awesome Product Detail Page
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
  StarHalf,
  CheckCircle,
  Zap,
  Package,
  RefreshCw,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
} from "lucide-react";
import axios from "axios";
import ProductDetail from "./ProductDetail";
import AdBanner from "./AdBanner";

const API_URL = "http://localhost:8007";

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
  warning: "#f39c12",
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
  min-height: calc(100vh - 80px);
  animation: ${fadeIn} 0.5s ease-out;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: ${COLORS.textLight};
  cursor: pointer;
  margin-bottom: 24px;
  padding: 8px 0;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    color: ${COLORS.primary};
    gap: 12px;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  background: ${COLORS.white};
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 24px;
  }
`;

const ImageSection = styled.div`
  text-align: center;
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    ${COLORS.background} 0%,
    ${COLORS.white} 100%
  );
  border-radius: 20px;
  overflow: hidden;
`;

const ProductImage = styled.img`
  max-width: 100%;
  max-height: 450px;
  object-fit: contain;
  border-radius: 16px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const Badge = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background: ${(props) => (props.$discount ? COLORS.accent : COLORS.success)};
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  z-index: 2;
`;

const NoImagePlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: ${COLORS.textLight};
  padding: 40px;

  svg {
    width: 64px;
    height: 64px;
    stroke-width: 1;
  }
`;

const InfoSection = styled.div``;

const ProductTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: ${COLORS.text};
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const ProductSubtitle = styled.p`
  font-size: 14px;
  color: ${COLORS.textLight};
  margin: 0 0 20px 0;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const RatingBadge = styled.div`
  background: ${COLORS.success};
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const Stars = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const ReviewCount = styled.span`
  color: ${COLORS.textLight};
  font-size: 13px;
`;

const PriceSection = styled.div`
  margin: 24px 0;
  padding: 20px 0;
  border-top: 1px solid ${COLORS.border};
  border-bottom: 1px solid ${COLORS.border};
`;

const CurrentPrice = styled.span`
  font-size: 42px;
  font-weight: 700;
  color: ${COLORS.primary};
  margin-right: 12px;

  @media (max-width: 768px) {
    font-size: 32px;
  }

  small {
    font-size: 16px;
    font-weight: 500;
  }
`;

const OriginalPrice = styled.span`
  font-size: 20px;
  color: ${COLORS.textLight};
  text-decoration: line-through;
  margin-right: 12px;
`;

const Discount = styled.span`
  font-size: 16px;
  color: ${COLORS.success};
  font-weight: 600;
  background: ${COLORS.success}15;
  padding: 4px 12px;
  border-radius: 20px;
`;

const DeliveryInfo = styled.div`
  display: flex;
  gap: 20px;
  margin: 20px 0;
  padding: 20px;
  background: ${COLORS.background};
  border-radius: 16px;
  flex-wrap: wrap;
`;

const DeliveryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: ${COLORS.textLight};

  svg {
    color: ${COLORS.primary};
    width: 18px;
    height: 18px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  margin: 24px 0;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const AddToCartButton = styled.button`
  flex: 1;
  background: ${COLORS.primary};
  color: ${COLORS.white};
  border: none;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;

  &:hover {
    background: ${COLORS.primaryDark};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(30, 60, 114, 0.3);
  }
`;

const BuyNowButton = styled.button`
  flex: 1;
  background: linear-gradient(
    135deg,
    ${COLORS.primary},
    ${COLORS.primaryLight}
  );
  color: ${COLORS.white};
  border: none;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(30, 60, 114, 0.3);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 20px;
`;

const ActionButton = styled.button`
  flex: 1;
  background: ${COLORS.white};
  border: 1px solid ${COLORS.border};
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  color: ${COLORS.textLight};

  &:hover {
    background: ${COLORS.background};
    border-color: ${COLORS.primary};
    color: ${COLORS.primary};
    transform: translateY(-1px);
  }
`;

const ShareModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.2s ease;
`;

const ShareContent = styled.div`
  background: ${COLORS.white};
  border-radius: 24px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
`;

const ShareTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: ${COLORS.text};
`;

const ShareButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
`;

const ShareOption = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: ${COLORS.background};
  border: 1px solid ${COLORS.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  color: ${COLORS.text};

  &:hover {
    background: ${COLORS.primary};
    color: ${COLORS.white};
    border-color: ${COLORS.primary};
  }
`;

const CopyLinkButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: ${COLORS.primary};
  color: ${COLORS.white};
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;

  &:hover {
    background: ${COLORS.primaryDark};
  }
`;

const Toast = styled.div`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: ${COLORS.success};
  color: white;
  padding: 12px 24px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1001;
  animation: ${fadeIn} 0.3s ease;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  gap: 16px;
  flex-direction: column;
`;

const Spinner = styled(Loader2)`
  animation: spin 1s linear infinite;
  color: ${COLORS.primary};
`;

const SkeletonImage = styled.div`
  width: 100%;
  height: 400px;
  background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 20px;
`;

const SkeletonText = styled.div`
  height: ${(props) => props.$height || "20px"};
  width: ${(props) => props.$width || "100%"};
  background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 8px;
  margin-bottom: 12px;
`;

// Helper function to render stars
const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={i} size={16} fill="#ffcc00" color="#ffcc00" />);
  }

  if (hasHalfStar) {
    stars.push(
      <StarHalf key="half" size={16} fill="#ffcc00" color="#ffcc00" />,
    );
  }

  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} size={16} color="#ddd" />);
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
    return `${API_URL}${imagePath}`;
  }
  return `${API_URL}/${imagePath}`;
};

const DetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/products/${id}`);

        if (response.data.success) {
          setProduct(response.data.data);
          setImageError(false);

          // Check if product is in wishlist
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

    if (id) {
      fetchProduct();
    }
  }, [id]);

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

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out ${product.name} on Campaign Marketplace!`;

    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
        break;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
    setShowShareModal(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToastMessage("Link copied to clipboard!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setShowShareModal(false);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner size={48} />
        <div>Loading product details...</div>
      </LoadingContainer>
    );
  }

  if (error || !product) {
    return (
      <LoadingContainer>
        <p style={{ color: COLORS.accent }}>{error || "Product not found"}</p>
        <BackButton onClick={() => navigate("/marketplace")}>
          <ArrowLeft size={18} />
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
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const rating = product.avg_rating || 4.5;
  const reviewCount = product.review_count || 1234;

  return (
    <>
      <Container>
        <BackButton onClick={() => navigate("/marketplace")}>
          <ArrowLeft size={18} />
          Back to Store
        </BackButton>

        <ProductGrid>
          <ImageSection>
            {!imageError && imageUrl ? (
              <>
                {discount > 0 && <Badge $discount>-{discount}% OFF</Badge>}
                <ProductImage
                  src={imageUrl}
                  alt={product.name}
                  onError={() => setImageError(true)}
                />
              </>
            ) : (
              <NoImagePlaceholder>
                <ImageOff size={64} />
                <p>No image available</p>
              </NoImagePlaceholder>
            )}
          </ImageSection>

          <InfoSection>
            <ProductTitle>{product.name}</ProductTitle>
            {product.description && (
              <ProductSubtitle>
                {product.description.substring(0, 100)}
              </ProductSubtitle>
            )}

            <RatingContainer>
              <RatingBadge>{rating.toFixed(1)} ★</RatingBadge>
              <Stars>{renderStars(rating)}</Stars>
              <ReviewCount>{reviewCount.toLocaleString()} reviews</ReviewCount>
              <ReviewCount>• {product.stock || 50} in stock</ReviewCount>
            </RatingContainer>

            <PriceSection>
              <CurrentPrice>
                KES {product.price?.toLocaleString()}
                <small>/unit</small>
              </CurrentPrice>
              {product.mrp && product.mrp > product.price && (
                <>
                  <OriginalPrice>
                    KES {product.mrp?.toLocaleString()}
                  </OriginalPrice>
                  <Discount>{discount}% off</Discount>
                </>
              )}
            </PriceSection>

            <DeliveryInfo>
              <DeliveryItem>
                <Truck size={16} />
                <span>
                  Free delivery by {deliveryDate.toLocaleDateString()}
                </span>
              </DeliveryItem>
              <DeliveryItem>
                <Shield size={16} />
                <span>10 days replacement</span>
              </DeliveryItem>
              <DeliveryItem>
                <Clock size={16} />
                <span>In stock • {product.stock || 50} items left</span>
              </DeliveryItem>
            </DeliveryInfo>

            <ButtonGroup>
              <AddToCartButton onClick={handleAddToCart}>
                <ShoppingCart size={18} />
                Add to Cart
              </AddToCartButton>
              <BuyNowButton onClick={handleBuyNow}>
                <Zap size={18} />
                Buy Now
              </BuyNowButton>
            </ButtonGroup>

            <ActionButtons>
              <ActionButton onClick={handleWishlist}>
                <Heart
                  size={18}
                  fill={isWishlisted ? COLORS.primary : "none"}
                />
                {isWishlisted ? "Wishlisted" : "Wishlist"}
              </ActionButton>
              <ActionButton onClick={() => setShowShareModal(true)}>
                <Share2 size={18} />
                Share
              </ActionButton>
            </ActionButtons>
          </InfoSection>
        </ProductGrid>

        <ProductDetail product={product} />

        {/* Political Party Advertisement */}
        <AdBanner
          party="UDA Party"
          slogan="Together we can build a better Kenya 🇰🇪"
          link="/party/uda"
          icon="🇰🇪"
        />
      </Container>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal onClick={() => setShowShareModal(false)}>
          <ShareContent onClick={(e) => e.stopPropagation()}>
            <ShareTitle>Share this product</ShareTitle>
            <ShareButtons>
              <ShareOption onClick={() => handleShare("facebook")}>
                <Facebook size={18} /> Facebook
              </ShareOption>
              <ShareOption onClick={() => handleShare("twitter")}>
                <Twitter size={18} /> Twitter
              </ShareOption>
              <ShareOption onClick={() => handleShare("linkedin")}>
                <Linkedin size={18} /> LinkedIn
              </ShareOption>
              <ShareOption onClick={() => handleShare("whatsapp")}>
                <MessageCircle size={18} /> WhatsApp
              </ShareOption>
            </ShareButtons>
            <CopyLinkButton onClick={handleCopyLink}>
              <Copy size={16} />
              Copy Link
            </CopyLinkButton>
          </ShareContent>
        </ShareModal>
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast>
          <CheckCircle size={18} />
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
