import React, { useEffect, useState, useCallback, useRef, useMemo, memo, lazy, Suspense } from "react";
import styled, { keyframes } from "styled-components";
import { Helmet } from "react-helmet-async";
import { getAllProducts } from "../components/api";
import { ShieldCheck } from "lucide-react";

// Lazy load components
const ProductCategoryCard = lazy(() => import("../components/cards/ProductCategoryCard"));
const ProductCard = lazy(() => import("../components/cards/ProductCard"));

// --- ANIMATIONS ---
const rotateBlob = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// --- STYLED COMPONENTS ---
const Container = styled.div`
  background: ${({ theme }) => theme.bg};
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
  padding-top: 10px;
  padding-bottom: 50px;

`;

const Blob = memo(styled.div`
  position: absolute;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(225, 29, 72, 0.03) 0%, rgba(225, 29, 72, 0) 70%);
  filter: blur(80px);
  z-index: 0;
  pointer-events: none;
  animation: ${rotateBlob} 20s linear infinite;
  ${(props) => props.top && `top: ${props.top};`}
  ${(props) => props.left && `left: ${props.left};`}
  ${(props) => props.right && `right: ${props.right};`}
`);

const Section = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0px 10px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  position: relative;
  z-index: 1;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
  margin-bottom: 10px;
  position: relative;
  display: inline-block;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 3px;
    background: #e11d48;
    border-radius: 3px;
  }
`;

const CardGrid = styled.div`
  display: grid;
  gap: 15px;
  grid-template-columns: repeat(2, 1fr);
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 25px;
  }
`;

// --- SKELETONS ---
const SkeletonBase = styled.div`
  background: #1e293b;
  border-radius: 16px;
  animation: ${pulse} 1.5s ease-in-out infinite;
  height: 300px;
`;

// --- DATA ---
const categories = [
  { name: "Campaign Reflectors", slug: "Reflector", img: "/images/halfcoat.jpeg" },
  { name: "Political Caps", slug: "caps", img: "/images/cap.jpg" },
  { name: "Campaign Tshirts", slug: "posters", img: "/images/tshirts.jpg" },
  { name: "Handheld Flags", slug: "flags", img: "/images/flag.jpg" },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef([]);

  const getProducts = useCallback(async () => {
    setLoading(true);
    try {
      const cacheKey = "siasahub_products_cache";
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        setProducts(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      const res = await getAllProducts();
      const normalizedProducts = res?.data || res || [];
      setProducts(normalizedProducts);
      sessionStorage.setItem(cacheKey, JSON.stringify(normalizedProducts));
    } catch (error) {
      console.error("Product Load Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  const productList = useMemo(() => {
    if (loading) return Array(8).fill().map((_, i) => <SkeletonBase key={i} />);
    if (products.length === 0) return <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "#64748b" }}>New arrivals coming soon.</div>;

    return products.slice(0, 20).map((product) => (
      <ProductCard key={product.id || product._id} product={product} />
    ));
  }, [products, loading]);

  const seoDescription = "Shop official Kenyan campaign merchandise: Reflectors, T-shirts, Caps, and Flags. Authentic political gear for your favorite candidates.";

  return (
    <>
      <Helmet>
        <title>SiasaHub Marketplace | Official Campaign Merchandise</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content="campaign merchandise, political gear Kenya, reflectors, campaign tshirts" />
      </Helmet>

      <Container>
        <Blob top="-100px" right="-100px" />
        <Blob top="60%" left="-200px" />

        <Suspense fallback={<Section><SkeletonBase /></Section>}>
          {/* CATEGORIES SECTION */}
          <Section>
            <Title>Shop By Category</Title>
            <CardGrid>
              {categories.map((cat, index) => (
                <ProductCategoryCard key={index} category={cat} />
              ))}
            </CardGrid>
          </Section>

          {/* TRENDING SECTION */}
          <Section>
            <Title style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <ShieldCheck size={28} color="#e11d48" /> Trending Merchandise
            </Title>
            <CardGrid>
              {productList}
            </CardGrid>
          </Section>
        </Suspense>
      </Container>
    </>
  );
};

export default memo(Home);