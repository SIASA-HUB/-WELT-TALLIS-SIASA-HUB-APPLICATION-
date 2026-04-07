import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ShoppingBag, Loader2 } from "lucide-react";

// Import local category images
import capsImg from "../assets/caps.jpg";
import tshirtsImg from "../assets/tshirts.jpg";
import hoodiesImg from "../assets/hoodie.jpg";
import postersImg from "../assets/posters.png";
import badgesImg from "../assets/caps.jpg";
import stickersImg from "../assets/stickers.png";
import bannersImg from "../assets/banners.jpg";

const API_URL = "http;//localhost:8007";

const Wrapper = styled.div`
  margin-top: 10px;
  padding: 0 4px;
`;

// Loading Skeleton
const SkeletonSlider = styled.div`
  width: 100%;
  height: 350px;
  border-radius: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-bottom: 30px;

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  @media (max-width: 768px) {
    height: 220px;
  }
`;

const SkeletonCard = styled.div`
  flex: 0 0 240px;
  height: 150px;
  border-radius: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
`;

// --- High Profile Hero Slider ---
const HeroSlider = styled.div`
  position: relative;
  width: 100%;
  height: 350px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 30px;
  background: #111;

  @media (max-width: 768px) {
    height: 220px;
  }
`;

const Slide = styled.div`
  position: absolute;
  inset: 0;
  opacity: ${(props) => (props.active ? 1 : 0)};
  transition: opacity 0.8s ease-in-out;
  display: flex;
  align-items: center;
`;

const HeroImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.6);
`;

const HeroContent = styled.div`
  position: absolute;
  left: 50px;
  max-width: 500px;
  color: white;
  z-index: 2;

  @media (max-width: 768px) {
    left: 20px;
    right: 20px;
  }
`;

const Badge = styled.span`
  background: #bb0000;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 12px;
  display: inline-block;
`;

const HeroTitle = styled.h2`
  font-size: 42px;
  font-weight: 800;
  margin: 10px 0;
  line-height: 1.1;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const ShopButton = styled.button`
  background: #bb0000;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s;

  &:hover {
    background: #990000;
    transform: scale(1.05);
  }
`;

// --- Category Scroll Logic ---
const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 0 10px;
`;

const SliderContainer = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 10px 5px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CategoryCard = styled.div`
  flex: 0 0 240px;
  position: relative;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;

  &:hover img {
    transform: scale(1.1);
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const CategoryImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
`;

const CategoryOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent 60%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 15px;
  color: white;
`;

// Local category images mapping - all categories included
const localCategoryImages = {
  caps: capsImg,
  tshirts: tshirtsImg,
  hoodies: hoodiesImg,
  posters: postersImg,
  badges: badgesImg,
  stickers: stickersImg,
  banners: bannersImg,
};

const categoryDisplayNames = {
  caps: "Premium Caps",
  tshirts: "Elite T-Shirts",
  hoodies: "Signature Hoodies",
  posters: "Limited Posters",
  badges: "Collector Badges",
  stickers: "Vinyl Stickers",
  banners: "Event Banners",
  wristbands: "Campaign Bands",
  bags: "Heritage Bags",
};

// All categories list for fallback
const allCategories = [
  "caps",
  "tshirts",
  "hoodies",
  "posters",
  "badges",
  "stickers",
  "banners",
  "wristbands",
  "bags",
];

const MidSection = () => {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, featRes] = await Promise.all([
          axios.get(`${API_URL}/api/products/categories`),
          axios.get(`${API_URL}/api/products/featured?limit=5`),
        ]);
        if (catRes.data.success) setCategories(catRes.data.data);
        if (featRes.data.success) setFeatured(featRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-play Hero Slider
  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev === featured.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [featured]);

  const getImageUrl = useMemo(
    () => (path) => {
      if (!path)
        return "https://images.unsplash.com/photo-1556742049-0cfed2f52a45?w=1200";
      if (path.startsWith("http")) return path;
      return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
    },
    [],
  );

  const getCategoryImage = (category) => {
    // Try local image first
    if (localCategoryImages[category]) {
      return localCategoryImages[category];
    }
    // Default fallback
    return "https://images.unsplash.com/photo-1556742049-0cfed2f52a45?w=600";
  };

  // Create category list with proper counts
  const categoryList =
    categories.length > 0
      ? categories
      : allCategories.map((cat) => ({ category: cat, count: 0 }));

  // Sort to show categories with products first
  const sortedCategories = useMemo(() => {
    return [...categoryList].sort((a, b) => b.count - a.count);
  }, [categoryList]);

  // Show loading skeletons while fetching data
  if (loading) {
    return (
      <Wrapper>
        <SkeletonSlider />
        <SectionHeader>
          <h3 style={{ fontSize: "18px", fontWeight: "700" }}>
            Explore Categories
          </h3>
        </SectionHeader>
        <SliderContainer>
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </SliderContainer>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {/* High Profile Hero Slider */}
      <HeroSlider>
        {(featured.length > 0
          ? featured
          : [{ id: "def", name: "Premium Campaign Gear", price: "250" }]
        ).map((item, idx) => (
          <Slide key={item.id} active={idx === activeIndex}>
            <HeroImage src={getImageUrl(item.image)} alt={item.name} />
            <HeroContent>
              <Badge>Featured Merchandise</Badge>
              <HeroTitle>{item.name}</HeroTitle>
              <p style={{ opacity: 0.9 }}>
                Official high-quality gear for the movement.
              </p>
              <ShopButton
                onClick={() => navigate(`/marketplace/product/${item.id}`)}
              >
                <ShoppingBag size={18} />
                Order Now — KES {item.price?.toLocaleString()}
              </ShopButton>
            </HeroContent>
          </Slide>
        ))}
      </HeroSlider>

      {/* Categories Horizontal Slider */}
      <SectionHeader>
        <h3 style={{ fontSize: "18px", fontWeight: "700" }}>
          Explore Categories
        </h3>
        <span style={{ color: "#2874f0", fontSize: "12px", fontWeight: "700" }}>
          SCROLL →
        </span>
      </SectionHeader>

      <SliderContainer>
        {sortedCategories.map((cat) => (
          <CategoryCard
            key={cat.category}
            onClick={() => navigate(`/marketplace?category=${cat.category}`)}
          >
            <CategoryImg
              src={getCategoryImage(cat.category)}
              alt={cat.category}
              loading="eager"
            />
            <CategoryOverlay>
              <h4
                style={{
                  margin: 0,
                  textTransform: "uppercase",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                {categoryDisplayNames[cat.category] || cat.category}
              </h4>
              <p style={{ margin: "4px 0 0", fontSize: "11px", opacity: 0.8 }}>
                {cat.count} Items Available
              </p>
            </CategoryOverlay>
          </CategoryCard>
        ))}
      </SliderContainer>
    </Wrapper>
  );
};

export default MidSection;
