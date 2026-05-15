import React, { useEffect, useState, useCallback } from "react";
import ProductCard from "../components/cards/ProductCard";
import styled, { keyframes } from "styled-components";
import {
  category,
  filter,
  SEGMENTS,
} from "../components/utils/data";
import { Spinner, Form } from "react-bootstrap";
import { getAllProducts } from "../components/api";
import { useLocation, useNavigate } from "react-router-dom";
import SEO from "../../../utils/SEO";
import { Filter, ChevronDown, LayoutGrid, SlidersHorizontal, PackageSearch } from "lucide-react";

// --- ANIMATIONS ---
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- STYLED COMPONENTS ---
const Container = styled.div`
  padding: 10px 0px;
  min-height: 100vh;
  display: flex;
  gap: 40px;
 
  max-width: 1600px;
  margin: 0 auto;
  
  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 20px 16px;
    gap: 24px;
  }
`;

const Sidebar = styled.div`
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  
  @media (max-width: 1024px) {
    width: 100%;
    display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  }
`;

const FilterCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f5f9;
`;

const FilterSection = styled.div`
  margin-bottom: 24px;
  &:last-child { margin-bottom: 0; }
`;

const FilterTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CategoryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${({ selected }) => (selected ? "#e11d48" : "#64748b")};
  font-weight: ${({ selected }) => (selected ? "600" : "500")};
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 10px;
  background: ${({ selected }) => (selected ? "#fff1f2" : "transparent")};
  transition: all 0.2s ease;
  font-size: 14px;
  
  &:hover {
    background: ${({ selected }) => (selected ? "#fff1f2" : "#f8fafc")};
    color: #e11d48;
  }
`;

const SizeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
`;

const SizeBox = styled.div`
  height: 38px;
  border: 1.5px solid ${({ selected }) => (selected ? "#e11d48" : "#e2e8f0")};
  background: ${({ selected }) => (selected ? "#fff1f2" : "white")};
  color: ${({ selected }) => (selected ? "#e11d48" : "#64748b")};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #e11d48;
    color: #e11d48;
  }
`;

const MainContent = styled.div`
  flex: 1;
`;

const ShopHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 20px 24px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f5f9;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
`;

const ResultCount = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const MobileFilterToggle = styled.button`
  display: none;
  width: 100%;
  padding: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 16px;
  font-weight: 600;
  color: #1e293b;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  @media (max-width: 1024px) {
    display: flex;
  }
`;

const CardWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
  animation: ${fadeInUp} 0.5s ease-out;

  @media (max-width: 640px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
`;

const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 48px;
  margin-bottom: 40px;
`;

const LoadMoreButton = styled.button`
  background: white;
  border: 2px solid #e2e8f0;
  color: #1e293b;
  padding: 12px 32px;
  border-radius: 40px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &:hover:not(:disabled) {
    border-color: #e11d48;
    color: #e11d48;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SocialProofBanner = styled.div`
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
  padding: 32px;
  border-radius: 24px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  position: relative;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 20px;
    padding: 24px;
  }
`;

const SocialProofContent = styled.div`
  position: relative;
  z-index: 2;
  
  h2 {
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    @media (max-width: 768px) { justify-content: center; }
  }
  
  p {
    font-size: 15px;
    color: #94a3b8;
    margin: 0;
    font-weight: 500;
  }
`;

const StatsGroup = styled.div`
  display: flex;
  gap: 32px;
  position: relative;
  z-index: 2;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  
  .value {
    font-size: 20px;
    font-weight: 800;
    color: #e11d48;
  }
  
  .label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #64748b;
  }
`;

// --- SKELETON COMPONENTS ---
const SkeletonCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
  
  .skeleton-image {
    width: 100%;
    height: 320px;
    background: linear-gradient(90deg, #f1f5f9 25%, #f8fafc 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s infinite;
    @media (max-width: 600px) { height: 220px; }
  }
  
  .skeleton-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .skeleton-text {
    height: 14px;
    background: linear-gradient(90deg, #f1f5f9 25%, #f8fafc 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s infinite;
    border-radius: 4px;
    &.title { width: 80%; }
    &.price { width: 40%; }
  }
`;

const ShopListing = () => {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [products, setProducts] = useState([]);
  const [priceRange, setPriceRange] = useState(5000);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const limit = 24;

  // Helper to parse URL parameters
  const getFiltersFromUrl = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    return {
      category: searchParams.get("category"),
      segment: searchParams.get("segment"),
      sort: searchParams.get("sort"),
      search: searchParams.get("search"),
      county: searchParams.get("county"),
      featured: searchParams.get("featured"),
    };
  }, [location.search]);

  useEffect(() => {
    const urlFilters = getFiltersFromUrl();
    if (urlFilters.category) {
      const match = category.find(c =>
        c.slug.toLowerCase() === urlFilters.category.toLowerCase() ||
        c.name.toLowerCase() === urlFilters.category.toLowerCase()
      );
      setSelectedCategories(match ? [match.name] : [urlFilters.category]);
    }
  }, [getFiltersFromUrl]);

  const fetchProducts = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const urlFilters = getFiltersFromUrl();
      const params = new URLSearchParams();
      params.append("limit", limit);
      params.append("offset", (pageNum - 1) * limit);
      params.append("maxPrice", priceRange);

      if (selectedCategories.length > 0) {
        params.append("categories", selectedCategories.join(","));
      } else if (urlFilters.category) {
        params.append("category", urlFilters.category);
      }

      if (urlFilters.segment) params.append("segment", urlFilters.segment);
      if (urlFilters.sort) params.append("sort", urlFilters.sort);
      if (urlFilters.search) params.append("search", urlFilters.search);
      if (urlFilters.featured) params.append("featured", urlFilters.featured);

      if (selectedSizes.length > 0) {
        params.append("sizes", selectedSizes.join(","));
      }

      const res = await getAllProducts(params.toString());
      const newProducts = res.data || (Array.isArray(res) ? res : []);
      const pagination = res.pagination || {};

      if (append) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }

      setTotal(pagination.total || 0);
      setHasMore(newProducts.length === limit);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [priceRange, selectedSizes, selectedCategories, limit, getFiltersFromUrl]);

  useEffect(() => {
    // Reset page and fetch when filters change
    setPage(1);
    fetchProducts(1, false);
  }, [fetchProducts]);

  // URL category sync handled by getCategoriesFromUrl useEffect

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, true);
    }
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleSize = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  return (
    <Container>
      <SEO
        title="Campaign Shop | Official Merchandise"
        description="Official SiasaHub campaign merchandise. Browse our collection of high-quality t-shirts, caps, and promotional items."
        canonical="/marketplace/shop"
      />

      <Sidebar isOpen={mobileFiltersOpen}>
        <FilterCard>
          <FilterSection>
            <FilterTitle>
              Categories <LayoutGrid size={14} />
            </FilterTitle>
            <CategoryList>
              {filter[0].items.map((cat) => (
                <CategoryItem
                  key={cat}
                  selected={selectedCategories.includes(cat)}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </CategoryItem>
              ))}
            </CategoryList>
          </FilterSection>

          <FilterSection>
            <FilterTitle>
              Max Price <SlidersHorizontal size={14} />
            </FilterTitle>
            <div style={{ padding: "0 4px" }}>
              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "#e11d48" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
                <span>KSH 0</span>
                <span style={{ color: "#e11d48" }}>KSH {priceRange.toLocaleString()}</span>
              </div>
            </div>
          </FilterSection>

          <FilterSection>
            <FilterTitle>
              Sizes <ChevronDown size={14} />
            </FilterTitle>
            <SizeGrid>
              {filter[2].items.map((size) => (
                <SizeBox
                  key={size}
                  selected={selectedSizes.includes(size)}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </SizeBox>
              ))}
            </SizeGrid>
          </FilterSection>
        </FilterCard>
      </Sidebar>

      <MainContent>
        <MobileFilterToggle onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}>
          <Filter size={18} /> {mobileFiltersOpen ? "Hide Filters" : "Show Filters"}
        </MobileFilterToggle>

        <SocialProofBanner>
          <SocialProofContent>
            <h2>🔥 Gear Up for Victory</h2>
            <p>Join thousands of supporters wearing their passion. Premium political merchandise.</p>
          </SocialProofContent>
          <StatsGroup>
            <StatItem>
              <div className="value">5K+</div>
              <div className="label">Orders Today</div>
            </StatItem>
            <StatItem>
              <div className="value">12K+</div>
              <div className="label">Supporters</div>
            </StatItem>
          </StatsGroup>
          <div style={{
            position: "absolute",
            right: "-20px",
            top: "-20px",
            width: "150px",
            height: "150px",
            background: "radial-gradient(circle, rgba(225, 29, 72, 0.1) 0%, transparent 70%)",
            borderRadius: "50%"
          }} />
        </SocialProofBanner>

        <ShopHeader>
          <TitleGroup>
            <Title>Official Merchandise</Title>
            <ResultCount>Found {total} premium items</ResultCount>
          </TitleGroup>
          <div style={{ display: "flex", gap: "12px" }}>
            {/* Could add sorting here later */}
          </div>
        </ShopHeader>

        {loading ? (
          <CardWrapper>
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i}>
                <div className="skeleton-image" />
                <div className="skeleton-content">
                  <div className="skeleton-text title" />
                  <div className="skeleton-text price" />
                </div>
              </SkeletonCard>
            ))}
          </CardWrapper>
        ) : products.length > 0 ? (
          <>
            <CardWrapper>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </CardWrapper>

            {hasMore && (
              <LoadMoreContainer>
                <LoadMoreButton onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      Loading...
                    </>
                  ) : (
                    "Load More Items"
                  )}
                </LoadMoreButton>
              </LoadMoreContainer>
            )}
          </>
        ) : (
          <div style={{
            textAlign: "center",
            padding: "100px 20px",
            background: "white",
            borderRadius: "24px",
            border: "1px dashed #e2e8f0"
          }}>
            <PackageSearch size={48} color="#cbd5e1" style={{ marginBottom: "16px" }} />
            <h3 style={{ color: "#1e293b", fontSize: "20px" }}>No Products Found</h3>
            <p style={{ color: "#64748b" }}>Try adjusting your filters to find what you're looking for.</p>
            <LoadMoreButton
              style={{ margin: "24px auto 0" }}
              onClick={() => {
                setSelectedCategories([]);
                setSelectedSizes([]);
                setPriceRange(10000);
              }}
            >
              Clear All Filters
            </LoadMoreButton>
          </div>
        )}
      </MainContent>
    </Container>
  );
};

export default ShopListing;

