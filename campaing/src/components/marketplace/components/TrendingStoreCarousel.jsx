// TrendingStoreCarousel.jsx - Hot products carousel for trending feed
import React, { useEffect, useState, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { ShoppingBag, ChevronLeft, ChevronRight, Zap, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "./utils/formatting";
import API from "../../../api/config";
import api from "../../../api/api";

const MARKETPLACE_API = API.PRODUCTS;



const slideIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Section = styled.section`
  padding: 24px 0 32px;
  background: linear-gradient(135deg, #0a0a0a 0%, #111 100%);
  animation: ${slideIn} 0.5s ease;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 16px;

  .title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 800;
    color: white;
    letter-spacing: -0.3px;
  }
  .badge {
    background: linear-gradient(135deg, #ff4d4d, #ff6b35);
    color: white;
    font-size: 10px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 99px;
    letter-spacing: 1px;
  }
  .nav-btns {
    display: flex;
    gap: 8px;
  }
`;

const NavBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.05);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.3); }
  &:disabled { opacity: 0.3; cursor: not-allowed; }
`;

const ScrollContainer = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 0 20px 8px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const ProductCard = styled.div`
  flex-shrink: 0;
  width: 160px;
  background: #1a1a1a;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(255,107,53,0.4);
  }
`;

const ProductImg = styled.div`
  width: 100%;
  height: 140px;
  overflow: hidden;
  background: #252525;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  ${ProductCard}:hover & img { transform: scale(1.04); }

  .hot-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: linear-gradient(135deg, #ff4d4d, #ff6b35);
    color: white;
    font-size: 9px;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: 99px;
    letter-spacing: 0.5px;
  }
`;

const ProductBody = styled.div`
  padding: 12px;

  .name {
    font-size: 13px;
    font-weight: 700;
    color: white;
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .price {
    font-size: 14px;
    font-weight: 800;
    color: #ff6b35;
    margin-bottom: 10px;
  }
`;

const BuyBtn = styled.button`
  width: 100%;
  padding: 8px;
  background: linear-gradient(135deg, #ff4d4d, #ff6b35);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: opacity 0.2s;
  &:hover { opacity: 0.88; }
`;

const EmptyState = styled.div`
  padding: 20px;
  color: #555;
  font-size: 14px;
`;

const TrendingStoreCarousel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchHotProducts = async () => {
      try {
        await api.getWithCache("/products/hot?limit=10", (data) => {
          if (mounted && data?.success) {
            setProducts(data.data || []);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Hot products error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchHotProducts();
    return () => { mounted = false; };
  }, []);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 190, behavior: 'smooth' });
    }
  };

  const getProductImage = (p) => p.img || p.image || p.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || p.title || 'P')}&background=252525&color=fff`;
  const getProductPrice = (p) => {
    if (p.price && typeof p.price === 'object') return p.price.org || p.price.mrp || 0;
    return parseFloat(p.price) || 0;
  };
  const getProductTier = (price) => {
    if (price >= 5000) return { label: "👑 Governor's Taste", bg: "linear-gradient(135deg, #f59e0b, #d97706)" };
    if (price >= 3500) return { label: "🏛️ Senator's Choice", bg: "linear-gradient(135deg, #8b5cf6, #6d28d9)" };
    if (price >= 2500) return { label: "🎖️ MP's Choice", bg: "linear-gradient(135deg, #3b82f6, #1d4ed8)" };
    if (price >= 1500) return { label: "💼 MCA's Pick", bg: "linear-gradient(135deg, #10b981, #059669)" };
    return { label: "✊ Supporter's Gear", bg: "linear-gradient(135deg, #ef4444, #b91c1c)" };
  };

  if (loading || products.length === 0) return null;

  return (
    <Section>
      <Header>
        <div className="title">
          <Zap size={18} color="#ff6b35" />
          <span>Hot Merch</span>
          <span className="badge">🔥 TRENDING</span>
        </div>
        <div className="nav-btns">
          <NavBtn onClick={() => scroll(-1)}><ChevronLeft size={16} /></NavBtn>
          <NavBtn onClick={() => scroll(1)}><ChevronRight size={16} /></NavBtn>
        </div>
      </Header>

      <ScrollContainer ref={scrollRef}>
        {products.map((product, i) => {
          const price = getProductPrice(product);
          const tier = getProductTier(price);
          const slugOrId = product.slug || product._id || product.id;
          
          return (
            <ProductCard key={slugOrId} onClick={() => navigate(`/marketplace/product/${slugOrId}`)}>
              <ProductImg>
                <img src={getProductImage(product)} alt={product.title || product.name} loading="lazy" />
                <span className="hot-badge" style={{ background: tier.bg }}>{tier.label}</span>
              </ProductImg>
              <ProductBody>
                <div className="name">{product.title || product.name}</div>
                <div className="price">KES {price.toLocaleString('en-KE')}</div>
                <BuyBtn onClick={(e) => { e.stopPropagation(); navigate(`/marketplace/product/${slugOrId}`); }}>
                  <ShoppingBag size={12} /> Buy Now
                </BuyBtn>
              </ProductBody>
            </ProductCard>
          );
        })}
      </ScrollContainer>
    </Section>
  );
};

export default TrendingStoreCarousel;
