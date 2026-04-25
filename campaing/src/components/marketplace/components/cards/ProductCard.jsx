import React, { useEffect, useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  ShoppingCart,
} from "lucide-react";

import {
  addToCart as addToCartApi,
} from "../api/index";
import { toast } from "react-toastify";
import API from "../../../../api/config";
import { buildImageUrl } from "../../../../utils/imageUtils";
import { useCart } from "../../context/CartContext";

const Card = styled.div`
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
  }

  @media (max-width: 600px) {
    width: 180px;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 350px;
  border-radius: 10px;
  overflow: hidden;
  background: #f1f5f9;
  
  @media (max-width: 600px) {
    height: 230px;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
  
  ${Card}:hover & {
    transform: scale(1.08);
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${Card}:hover & {
    opacity: 1;
  }
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transform: translateX(10px);
  opacity: 0;
  transition: all 0.3s ease;
  
  ${Card}:hover & {
    transform: translateX(0);
    opacity: 1;
  }
`;

const IconButton = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  color: #1e293b;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e11d48;
    color: white;
    transform: scale(1.1);
  }
`;

const Badge = styled.div`
  position: absolute;
  bottom: 12px;
  left: 12px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 10px;
  font-size: 8px;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 4px;
`;

const Category = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #e11d48;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ProductName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PriceTag = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 2px;
`;

const CurrentPrice = styled.span`
  font-size: 17px;
  font-weight: 700;
  color: #1e293b;
`;

const OldPrice = styled.span`
  font-size: 13px;
  color: #94a3b8;
  text-decoration: line-through;
  font-weight: 500;
`;

const Discount = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #22c55e;
`;

// Simple custom Star component for rating
const StarRating = ({ value }) => {
  return (
    <div style={{ display: "flex", color: "#fbce1f" }}>
      {[...Array(5)].map((_, i) => (
        <span key={i} style={{ fontSize: "10px" }}>
          {i < Math.floor(value) ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
};

const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const { addToCart: addToCartContext } = useCart();

  // Check if user is authenticated by checking token
  const isAuthenticated = () => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    const user = localStorage.getItem("user_data");
    return !!(token && user);
  };

  const getAuthToken = () => localStorage.getItem("access_token") || localStorage.getItem("token");

  const addCart = async (e) => {
    e.stopPropagation();

    // Always add to CartContext for reactive UI update (count badge)
    addToCartContext({ ...product, id: product?.id || product?._id, quantity: 1 });
    toast.success("🛒 Added to cart!");

    // Additionally persist to server if user is logged in
    if (isAuthenticated()) {
      try {
        const productId = product?.id || product?._id;
        await addToCartApi(getAuthToken(), { productId, quantity: 1 });
      } catch (err) {
        console.error("Cart API sync failed:", err);
        // Don't show error — local cart update already succeeded
      }
    }
  };

  // Build the correct navigation URL using slug (SEO) or fall back to ID
  const productId = product?.id || product?._id;
  const productUrl = product?.slug ? `/product/${product.slug}` : `/product/${productId}`;

  // Build the full image URL using centralized utility
  const imgUrl = buildImageUrl(product?.img || product?.image || product?.image_url) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(product?.title || product?.name || 'P')}&background=e11d48&color=fff&size=400&bold=true`;

  // Handle image error - try fallback or placeholder
  const handleImageError = (e) => {
    if (!imageError) {
      setImageError(true);
      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product?.title || product?.name || 'P')}&background=e11d48&color=fff&size=400&bold=true`;
    }
  };

  return (
    <Card onClick={() => navigate(productUrl)}>
      <ImageContainer>
        <Image
          src={imgUrl}
          alt={product?.title || product?.name || "Product"}
          loading="lazy"
          width="280"
          height="350"
          onError={handleImageError}
        />

        <Overlay />
        <ActionButtons>
          <IconButton onClick={addCart}>
            <ShoppingCart size={18} />
          </IconButton>
        </ActionButtons>
        <Badge>
          <StarRating value={product?.rating || 4} />
          <span>{product?.rating || "4.0"}</span>
        </Badge>
      </ImageContainer>

      <Content>
        <Category>{product?.category || "Essential"}</Category>
        <ProductName>{product?.title || product?.name}</ProductName>
        <PriceTag>
          <CurrentPrice>KSH {Number(product?.price?.org || product?.price || 0).toLocaleString()}</CurrentPrice>
          {product?.price?.mrp && product.price.mrp > (product.price.org || 0) && (
            <>
              <OldPrice>KSH {Number(product?.price?.mrp).toLocaleString()}</OldPrice>
              <Discount>{product?.price?.off}% Off</Discount>
            </>
          )}
        </PriceTag>
      </Content>
    </Card>
  );
};

export default memo(ProductCard);
