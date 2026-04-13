import React, { useEffect, useState, memo } from "react";

import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  ShoppingCart,
} from "lucide-react";
import { Spinner } from "react-bootstrap";
import {
  addToCart,
} from "../api/index";
import { useAuth } from "@/components/hooks/useAuth";

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
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getAuthToken = () => localStorage.getItem("access_token");

  const addCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      // Guest Cart Implementation
      const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
      const existingItemIndex = guestCart.findIndex(item => item.product._id === product._id);
      
      if (existingItemIndex > -1) {
        guestCart[existingItemIndex].quantity += 1;
      } else {
        guestCart.push({ product, quantity: 1 });
      }
      
      localStorage.setItem("guest_cart", JSON.stringify(guestCart));
      alert("Added to cart as guest!");
      navigate("/marketplace/cart");
      return;
    }
    
    try {
      await addToCart(getAuthToken(), { productId: product?._id, quantity: 1 });
      navigate("/marketplace/cart");
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart");
    }
  };

  const checkFavourite = async () => {
    if (!isAuthenticated || !product) return;
    try {
      const res = await getFavourite(getAuthToken(), { productId: product?._id });
      const isFavorite = res.data?.some(fav => fav._id === product?._id);
      setFavorite(isFavorite);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkFavourite();
  }, [isAuthenticated, product]);

  // Build the correct navigation URL using slug (SEO) or fall back to ID
  const productUrl = product?.slug ? `/product/${product.slug}` : `/product/${product._id || product.id}`;
  
  // Build the full image URL (handle relative paths from server)
  const imgUrl = (() => {
    const raw = product?.img || product?.image || product?.image_url;
    if (!raw) return `https://ui-avatars.com/api/?name=${encodeURIComponent(product?.title || 'P')}&background=e11d48&color=fff&size=400`;
    if (raw.startsWith('http')) return raw;
    return `http://localhost:8009${raw.startsWith('/') ? '' : '/'}${raw}`;
  })();

  return (
    <Card onClick={() => navigate(productUrl)}>
      <ImageContainer>
        <Image 
          src={imgUrl} 
          alt={product?.title || product?.name}
          loading="lazy"
          width="280"
          height="350"
          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product?.title || 'P')}&background=e11d48&color=fff`; }}
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

