import React, { useState, useEffect, useRef, useCallback, memo, lazy, Suspense } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { 
  ChevronRight, ChevronLeft, MapPin, Star, TrendingUp, Zap,
  Package, Award, ShoppingBag, Crown, Shield, Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MarketplaceHero from "../components/MarketplaceHero";
import ProductCard from "../components/cards/ProductCard";
import { 
  getAllProducts, getProductsByCategory, getProductsBySegment,
  getHotProducts, getFeaturedProducts, getLatestProducts,
  getMarketplaceCategories
} from "../components/api";
import { SEGMENTS } from "../components/utils/data";

gsap.registerPlugin(ScrollTrigger);

// ======================== ANIMATIONS ========================
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ======================== STYLED COMPONENTS ========================
const Container = styled.div`
  background-color: #ffffff;
  min-height: 100vh;
  color: #1a1a2e;
  font-family: 'Inter', -apple-system, sans-serif;
  overflow-x: hidden;
`;

const ContentWrapper = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 40px;
  @media (max-width: 768px) { padding: 0 20px; }
`;

const CategoryNav = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #f1f5f9;
  padding: 14px 0;
`;

const CategoryList = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 40px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar { display: none; }
  @media (max-width: 768px) { padding: 4px 20px; }
`;

const CategoryPill = styled.button`
  padding: 10px 22px;
  border-radius: 50px;
  border: 1.5px solid ${p => p.active ? '#1a1a2e' : '#e2e8f0'};
  background: ${p => p.active ? '#1a1a2e' : 'transparent'};
  color: ${p => p.active ? '#fff' : '#64748b'};
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover {
    border-color: #1a1a2e;
    transform: translateY(-1px);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 28px;
  margin-top: 56px;
  opacity: 0;
  transform: translateY(20px);
`;

const SectionTitle = styled.div`
  h2 {
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -0.02em;
    margin: 0;
    color: #1a1a2e;
    @media (max-width: 768px) { font-size: 22px; }
  }
  span {
    color: #ef4444;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 6px;
  }
`;

const ViewAll = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: #64748b;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 8px;
  transition: all 0.2s;
  &:hover { color: #1a1a2e; background: #f1f5f9; }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
  @media (max-width: 1200px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  @media (max-width: 500px) { grid-template-columns: 1fr; }
`;

// Horizontal Scroll Section
const HorizontalSection = styled.div`
  position: relative;
  margin-bottom: 32px;
`;

const HorizontalTrack = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 8px 0 16px 0;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar { display: none; }
`;

const HorizontalCard = styled.div`
  min-width: 280px;
  max-width: 280px;
  flex-shrink: 0;
  @media (max-width: 768px) { min-width: 240px; max-width: 240px; }
`;

const ScrollButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${p => p.direction === 'left' ? 'left: -16px;' : 'right: -16px;'}
  z-index: 10;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: all 0.2s;
  color: #1a1a2e;
  &:hover { background: #1a1a2e; color: #fff; transform: translateY(-50%) scale(1.05); }
  @media (max-width: 768px) { display: none; }
`;

const PersonalizationBanner = styled.div`
  background: #f8fafc;
  border-radius: 20px;
  padding: 36px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 48px 0;
  border: 1px solid #f1f5f9;
  opacity: 0;
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 16px;
    padding: 28px 20px;
  }
`;

const BannerContent = styled.div`
  h3 { font-size: 22px; font-weight: 800; margin: 0 0 6px 0; }
  p { color: #64748b; font-size: 15px; margin: 0; }
`;

const LocationButton = styled.button`
  background: #fff;
  border: 1px solid #e2e8f0;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.2s;
  &:hover { background: #f1f5f9; transform: translateY(-1px); }
`;

// Skeleton Loader
const SkeletonCard = styled.div`
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
  .skel-img {
    width: 100%;
    padding-top: 110%;
    background: linear-gradient(90deg, #f1f5f9 25%, #f8fafc 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s infinite;
  }
  .skel-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
  .skel-line {
    height: 14px;
    border-radius: 4px;
    background: linear-gradient(90deg, #f1f5f9 25%, #f8fafc 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s infinite;
    &.w80 { width: 80%; }
    &.w50 { width: 50%; }
  }
`;

// ======================== CONSTANTS ========================
const CATEGORIES = [
  { id: 'all', label: 'Everything', icon: <Package size={14} /> },
  { id: 'shoes', label: 'Shoes', icon: <TrendingUp size={14} /> },
  { id: 'caps', label: 'Caps', icon: <Award size={14} /> },
  { id: 'hoodies', label: 'Hoodies', icon: <ShoppingBag size={14} /> },
  { id: 'tshirts', label: 'T-Shirts', icon: <Zap size={14} /> },
  { id: 'jackets', label: 'Jackets', icon: <Shield size={14} /> },
  { id: 'kits', label: 'Supporter Kits', icon: <Star size={14} /> },
  { id: 'presidential', label: 'Presidential Taste', icon: <Crown size={14} /> },
  { id: 'governor', label: 'Governor Taste', icon: <Crown size={14} /> },
  { id: 'senator', label: 'Senator Taste', icon: <Shield size={14} /> },
  { id: 'mca', label: 'MCA Taste', icon: <Users size={14} /> },
];

const SEGMENT_ICONS = {
  presidential: <Crown size={14} />,
  governor: <Crown size={14} />,
  senator: <Shield size={14} />,
  mp: <Shield size={14} />,
  mca: <Users size={14} />,
  supporter: <Star size={14} />,
};

// ======================== HORIZONTAL SLIDER ========================
const HorizontalSlider = memo(({ products, loading }) => {
  const trackRef = useRef(null);

  const scroll = (dir) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir * 310, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <HorizontalTrack>
        {[1,2,3,4].map(i => (
          <HorizontalCard key={i}>
            <SkeletonCard>
              <div className="skel-img" />
              <div className="skel-body"><div className="skel-line w80" /><div className="skel-line w50" /></div>
            </SkeletonCard>
          </HorizontalCard>
        ))}
      </HorizontalTrack>
    );
  }

  return (
    <HorizontalSection>
      <ScrollButton direction="left" onClick={() => scroll(-1)}><ChevronLeft size={20} /></ScrollButton>
      <HorizontalTrack ref={trackRef}>
        {products.map(p => (
          <HorizontalCard key={p._id || p.id}>
            <ProductCard product={p} />
          </HorizontalCard>
        ))}
      </HorizontalTrack>
      <ScrollButton direction="right" onClick={() => scroll(1)}><ChevronRight size={20} /></ScrollButton>
    </HorizontalSection>
  );
});

// ======================== MAIN COMPONENT ========================
const Home = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedCounty] = useState(localStorage.getItem('user_county') || 'Nairobi');

  // Data states
  const [hotProducts, setHotProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [segmentData, setSegmentData] = useState({});
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  
  // Loading states
  const [loadingHot, setLoadingHot] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingSegments, setLoadingSegments] = useState({});
  const [loadingCategory, setLoadingCategory] = useState(false);

  // Refs for GSAP
  const sectionRefs = useRef([]);
  const bannerRef = useRef(null);

  // ---- GSAP Section Reveals ----
  useEffect(() => {
    const ctx = gsap.context(() => {
      sectionRefs.current.forEach((el) => {
        if (!el) return;
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        });
      });

      if (bannerRef.current) {
        gsap.to(bannerRef.current, {
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: bannerRef.current,
            start: "top 85%",
          },
        });
      }
    });
    return () => ctx.revert();
  }, [hotProducts, latestProducts, featuredProducts]);

  // ---- Fetch core data ----
  useEffect(() => {
    const fetchCore = async () => {
      try {
        const [hot, latest, featured] = await Promise.allSettled([
          getHotProducts(12),
          getLatestProducts(12),
          getFeaturedProducts(8),
        ]);

        const extractResult = (r) => {
          if (r.status !== 'fulfilled') return [];
          const d = r.value;
          return d?.data || (Array.isArray(d) ? d : []);
        };

        setHotProducts(extractResult(hot));
        setLoadingHot(false);
        setLatestProducts(extractResult(latest));
        setLoadingLatest(false);
        setFeaturedProducts(extractResult(featured));
        setLoadingFeatured(false);
      } catch (e) {
        console.error("Error fetching core products:", e);
        setLoadingHot(false);
        setLoadingLatest(false);
        setLoadingFeatured(false);
      }
    };
    fetchCore();

    // Fetch dynamic categories
    const fetchCats = async () => {
      try {
        const cats = await getMarketplaceCategories();
        if (Array.isArray(cats)) {
          setDynamicCategories(cats.map(c => c.category?.toLowerCase()));
        }
      } catch (e) { console.error("Error fetching cats:", e); }
    };
    fetchCats();
  }, []);

  // ---- Fetch segments lazily ----
  const fetchSegment = useCallback(async (segmentId) => {
    if (segmentData[segmentId]) return;
    setLoadingSegments(prev => ({ ...prev, [segmentId]: true }));
    try {
      const res = await getProductsBySegment(segmentId, 10);
      const products = res?.data || (Array.isArray(res) ? res : []);
      setSegmentData(prev => ({ ...prev, [segmentId]: products }));
    } catch (e) {
      console.error(`Error fetching segment ${segmentId}:`, e);
      setSegmentData(prev => ({ ...prev, [segmentId]: [] }));
    }
    setLoadingSegments(prev => ({ ...prev, [segmentId]: false }));
  }, [segmentData]);

  // Fetch first 3 segments on mount
  useEffect(() => {
    SEGMENTS.slice(0, 3).forEach(s => fetchSegment(s.id));
  }, []);

  // ---- Category filter ----
  useEffect(() => {
    if (activeCategory === 'all') { setCategoryProducts([]); return; }
    // Check if it's a segment
    const seg = SEGMENTS.find(s => s.id === activeCategory);
    if (seg) {
      fetchSegment(seg.id);
      return;
    }
    // Otherwise fetch by category
    const fetchCat = async () => {
      setLoadingCategory(true);
      try {
        const res = await getProductsByCategory(activeCategory, 24);
        setCategoryProducts(res?.data || (Array.isArray(res) ? res : []));
      } catch (e) { setCategoryProducts([]); }
      setLoadingCategory(false);
    };
    fetchCat();
  }, [activeCategory]);

  const handleViewAll = (cat) => {
    navigate(`/marketplace/shop?category=${cat}`);
  };

  const handleSegmentViewAll = (segmentId) => {
    navigate(`/marketplace/shop?segment=${segmentId}`);
  };

  const addSectionRef = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  // Skeletons
  const renderSkeletons = (count = 4) => (
    <ProductGrid>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i}>
          <div className="skel-img" />
          <div className="skel-body"><div className="skel-line w80" /><div className="skel-line w50" /></div>
        </SkeletonCard>
      ))}
    </ProductGrid>
  );

  // ---- Active category view ----
  const isSegmentActive = SEGMENTS.some(s => s.id === activeCategory);

  return (
    <Container>
      <MarketplaceHero />

      <CategoryNav>
        <CategoryList>
          {CATEGORIES.filter(c => 
            c.id === 'all' || 
            ['presidential', 'governor', 'senator', 'mca'].includes(c.id) || 
            dynamicCategories.includes(c.id.toLowerCase())
          ).map(cat => (
            <CategoryPill
              key={cat.id}
              active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.icon}
              {cat.label}
            </CategoryPill>
          ))}
        </CategoryList>
      </CategoryNav>

      <ContentWrapper>

        {/* ---- Category / Segment filtered view ---- */}
        {activeCategory !== 'all' && (
          <>
            <SectionHeader ref={addSectionRef} style={{ opacity: 1, transform: 'none' }}>
              <SectionTitle>
                <span>{SEGMENT_ICONS[activeCategory] || <Package size={14} />} Filtered</span>
                <h2>{CATEGORIES.find(c => c.id === activeCategory)?.label || activeCategory}</h2>
              </SectionTitle>
              <ViewAll onClick={() => isSegmentActive ? handleSegmentViewAll(activeCategory) : handleViewAll(activeCategory)}>
                View All <ChevronRight size={16} />
              </ViewAll>
            </SectionHeader>

            {loadingCategory ? renderSkeletons(4) : (
              <ProductGrid>
                {(isSegmentActive ? (segmentData[activeCategory] || []) : categoryProducts).map(p => (
                  <ProductCard key={p._id || p.id} product={p} />
                ))}
              </ProductGrid>
            )}
          </>
        )}

        {/* ---- Default homepage sections ---- */}
        {activeCategory === 'all' && (
          <>
            {/* Trending Now */}
            <SectionHeader ref={addSectionRef}>
              <SectionTitle>
                <span><TrendingUp size={14} /> Hot Right Now</span>
                <h2>Trending Merchandise</h2>
              </SectionTitle>
              <ViewAll onClick={() => handleViewAll('all')}>
                Explore All <ChevronRight size={16} />
              </ViewAll>
            </SectionHeader>
            {loadingHot ? renderSkeletons(4) : (
              <ProductGrid>
                {hotProducts.slice(0, 8).map(p => (
                  <ProductCard key={p._id || p.id} product={p} />
                ))}
              </ProductGrid>
            )}

            {/* Personalization Banner */}
            <PersonalizationBanner ref={bannerRef}>
              <BannerContent>
                <h3>Shop {selectedCounty} Movement Gear</h3>
                <p>Collections trending in your local constituency</p>
              </BannerContent>
              <LocationButton>
                <MapPin size={18} /> {selectedCounty}
              </LocationButton>
            </PersonalizationBanner>

            {/* Aspirant Segment Sections */}
            {SEGMENTS.slice(0, 4).map(seg => {
              const products = segmentData[seg.id] || [];
              const isLoading = loadingSegments[seg.id] ?? !segmentData[seg.id];
              
              // Only show if loading OR has products
              if (!isLoading && products.length === 0) return null;

              return (
                <React.Fragment key={seg.id}>
                  <SectionHeader ref={addSectionRef}>
                    <SectionTitle>
                      <span>{SEGMENT_ICONS[seg.id]} {seg.label}</span>
                      <h2>{seg.label}</h2>
                    </SectionTitle>
                    <ViewAll onClick={() => handleSegmentViewAll(seg.id)}>
                      View Collection <ChevronRight size={16} />
                    </ViewAll>
                  </SectionHeader>
                  <HorizontalSlider
                    products={products}
                    loading={isLoading}
                  />
                </React.Fragment>
              );
            })}

            {/* New Arrivals */}
            <SectionHeader ref={addSectionRef}>
              <SectionTitle>
                <span><Zap size={14} /> Just Dropped</span>
                <h2>New Arrivals</h2>
              </SectionTitle>
              <ViewAll onClick={() => navigate('/marketplace/shop?sort=new')}>
                View All New <ChevronRight size={16} />
              </ViewAll>
            </SectionHeader>
            {loadingLatest ? renderSkeletons(4) : (
              <ProductGrid>
                {latestProducts.slice(0, 8).map(p => (
                  <ProductCard key={p._id || p.id} product={p} />
                ))}
              </ProductGrid>
            )}

            {/* Featured / Editor Picks */}
            {featuredProducts.length > 0 && (
              <>
                <SectionHeader ref={addSectionRef}>
                  <SectionTitle>
                    <span><Star size={14} /> Editor's Pick</span>
                    <h2>Featured Collection</h2>
                  </SectionTitle>
                  <ViewAll onClick={() => navigate('/marketplace/shop?featured=true')}>
                    View Featured <ChevronRight size={16} />
                  </ViewAll>
                </SectionHeader>
                <HorizontalSlider products={featuredProducts} loading={loadingFeatured} />
              </>
            )}
          </>
        )}

      </ContentWrapper>

      <div style={{ height: 80 }} />
    </Container>
  );
};

export default Home;