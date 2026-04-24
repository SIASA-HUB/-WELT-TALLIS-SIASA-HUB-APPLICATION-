import React, { useEffect, useState, useCallback, useRef, useMemo, memo, lazy, Suspense } from "react";
import styled, { keyframes, css } from "styled-components";
import { Helmet } from "react-helmet-async";
import { getAllProducts } from "../components/api";
import { ChevronLeft, ChevronRight, Sparkles, ShieldCheck } from "lucide-react";

// Lazy load non-critical components
const ProductCategoryCard = lazy(() => import("../components/cards/ProductCategoryCard"));
const ProductCard = lazy(() => import("../components/cards/ProductCard"));

// --- ANIMATIONS ---
const kenBurns = keyframes`
  0% { transform: scale(1) translate(0, 0); }
  100% { transform: scale(1.15) translate(-1%, -1%); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

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
  padding-bottom: 0px;
  background: ${({ theme }) => theme.bg};
  height: 100%;
  overflow-x: hidden;
  position: relative;
`;

const Blob = React.memo(styled.div`
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

const CarouselContainer = styled.div`
  width: 100%;
  height: 60vh;
  position: relative;
  overflow: hidden;
  background: #020617;
  @media (max-width: 768px) {
    height: 480px;
  }
`;

const Slide = React.memo(({ $active, children }) => (
  <div style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: $active ? 1 : 0,
    zIndex: $active ? 1 : 0,
    transition: "opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }}>
    {children}
  </div>
));

const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.5;
  ${({ $active }) => $active && css`animation: ${kenBurns} 10s ease-out forwards;`}
`;

const SlideContent = React.memo(({ $active, children }) => (
  <div style={{
    position: "absolute",
    zIndex: 10,
    textAlign: "center",
    color: "white",
    maxWidth: "900px",
    padding: "0 40px",
    opacity: $active ? 1 : 0,
    transform: $active ? "translateY(0)" : "translateY(40px)",
    transition: "all 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s"
  }}>
    {children}
  </div>
));

const PartyBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(225, 29, 72, 0.2);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 100px;
  border: 1px solid rgba(225, 29, 72, 0.3);
  font-size: 14px;
  font-weight: 600;
  color: #fb7185;
  margin-bottom: 24px;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const SlideTitle = styled.h1`
  font-size: 32px;
  font-weight: 900;
  margin-bottom: 20px;
  line-height: 1.1;
  background: linear-gradient(to bottom, #ffffff 30%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const SlideSubtitle = styled.p`
  font-size: 17px;
  color: #94a3b8;
  margin-bottom: 32px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const ProgressTrack = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  z-index: 100;
`;

const ProgressBar = React.memo(({ progress }) => (
  <div style={{
    height: "100%",
    background: "linear-gradient(90deg, #e11d48, #fb7185)",
    width: `${progress}%`,
    boxShadow: "0 0 10px rgba(225, 29, 72, 0.8)",
    transition: "width 0.1s linear"
  }} />
));

const NavButton = React.memo(({ direction, onClick }) => (
  <button onClick={onClick} style={{
    position: "absolute",
    top: "50%",
    [direction === "left" ? "left" : "right"]: "20px",
    transform: "translateY(-50%)",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.04)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 100,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  }}>
    {direction === "left" ? <ChevronLeft size={28} /> : <ChevronRight size={28} />}
  </button>
));

const RevealSection = React.memo(({ id, visible, children, setRef }) => (
  <div
    id={id}
    ref={setRef}
    style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(40px)",
      transition: "all 1s cubic-bezier(0.22, 1, 0.36, 1)"
    }}
  >
    {children}
  </div>
));

const Section = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 5px 0px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  position: relative;
  z-index: 1;
`;

const HeaderGroup = styled.div`
  text-align: left;
  max-width: 100%;
  margin: 0;
  padding-left: 10px;
`;

const SectionSubtitle = styled.div`
  color: #e11d48;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 14px;
  margin-bottom: 12px;
`;

const Title = styled.h2`
  font-size: 32px;
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
    background: linear-gradient(90deg, #e11d48 0%, #e11d48 50%, transparent 100%);
    border-radius: 3px;
  }
`;

const CardWrapper = styled.div`
  display: grid;
  gap: 10px;
  padding: 0 10px;
  grid-template-columns: repeat(2, 1fr);
  contain: layout style paint;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
  }
  
  @media (min-width: 1600px) {
    grid-template-columns: repeat(4, minmax(280px, 320px));
    justify-content: center;
  }
`;

const FloatWrapperStyled = styled.div`
  animation: ${float} 6s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay || "0s"};
  width: 100%;
  display: flex;
  justify-content: center;
  
  > div {
    width: 100%;
  }
`;

const FloatWrapper = memo(({ delay, children }) => (
  <FloatWrapperStyled $delay={delay}>
    {children}
  </FloatWrapperStyled>
));

// Skeleton Components
const SkeletonCard = styled.div`
  background: #1e293b;
  border-radius: 16px;
  overflow: hidden;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const SkeletonImage = styled.div`
  height: 200px;
  background: #334155;
  border-radius: 16px 16px 0 0;
`;

const SkeletonContent = styled.div`
  padding: 16px;
`;

const SkeletonLine = styled.div`
  height: 20px;
  background: #334155;
  border-radius: 8px;
  margin-bottom: 12px;
  width: ${({ $width }) => $width || '100%'};
`;

const SkeletonLineSmall = styled.div`
  height: 16px;
  background: #334155;
  border-radius: 8px;
  margin-bottom: 8px;
  width: ${({ $width }) => $width || '100%'};
`;

const SkeletonPrice = styled.div`
  height: 24px;
  background: #334155;
  border-radius: 8px;
  margin-top: 12px;
  width: 40%;
`;

const CategorySkeletonCard = styled.div`
  background: #1e293b;
  border-radius: 16px;
  overflow: hidden;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const CategorySkeletonImage = styled.div`
  height: 160px;
  background: #334155;
  border-radius: 16px 16px 0 0;
`;

const CategorySkeletonContent = styled.div`
  padding: 16px;
  text-align: center;
`;

const CategorySkeletonTitle = styled.div`
  height: 20px;
  background: #334155;
  border-radius: 8px;
  width: 70%;
  margin: 0 auto;
`;

const ProductCardSkeleton = memo(() => (
  <SkeletonCard>
    <SkeletonImage />
    <SkeletonContent>
      <SkeletonLine $width="80%" />
      <SkeletonLineSmall $width="60%" />
      <SkeletonPrice />
    </SkeletonContent>
  </SkeletonCard>
));

const CategoryCardSkeleton = memo(() => (
  <CategorySkeletonCard>
    <CategorySkeletonImage />
    <CategorySkeletonContent>
      <CategorySkeletonTitle />
    </CategorySkeletonContent>
  </CategorySkeletonCard>
));

// Memoized carousel data
const carouselData = [
  {
    image: "https://wiper.co.ke/static/assets/img/why-choose-us.jpg",
    party: "Wiper Movement",
    title: "Unity In Diversity",
    subtitle: "Committed to social justice, equality, and national unity for all Kenyans in every corner of the nation.",
  },
  {
    image: "https://uda.ke/wp-content/uploads/2026/01/1769487997746.jpg",
    party: "UDA Alliance",
    title: "Kazi Ni Kazi",
    subtitle: "Empowering every Kenyan through strategic economic transformation and bottom-up inclusion.",
  },
  {
    image: "https://global-uploads.webflow.com/61fa0db307d4e6dbea95b2ec/61fa40e5ff1ddf56c033e13b_FCsm-H6WYBEGnlX.jpg",
    party: "Jubilee Pride",
    title: "Tuko Pamoja",
    subtitle: "Building a stronger, more united future through shared progress and regional stability.",
  },
  {
    image: "https://www.president.go.ke/wp-content/uploads/CLOSING-CEREMONY-KWALE-2048x1365.jpeg",
    party: "National Progress",
    title: "A Future Built Together",
    subtitle: "Celebrating milestones of community development and local engagement across the republic.",
  }
];

const categories = [
  { name: "Campaign Reflectors", slug: "Reflector", img: "/images/halfcoat.jpeg", delay: "0s" },
  { name: "Political Caps", slug: "caps", img: "/images/cap.jpg", delay: "0.5s" },
  { name: "Campaign Tshirts", slug: "posters", img: "/images/tshirts.jpg", delay: "1s" },
  { name: "Handheld Flags", slug: "flags", img: "/images/flag.jpg", delay: "1.5s" },
];

const MemoizedCategoryCard = memo(ProductCategoryCard);
const MemoizedProductCard = memo(ProductCard);

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visibleSections, setVisibleSections] = useState({});

  const SLIDE_DURATION = 6000;
  const sectionRefs = useRef([]);
  const progressIntervalRef = useRef(null);
  const slideIntervalRef = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    setProgress(0);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + carouselData.length) % carouselData.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    slideIntervalRef.current = setInterval(nextSlide, SLIDE_DURATION);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => Math.min(prev + (100 / (SLIDE_DURATION / 100)), 100));
    }, 100);

    return () => {
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [nextSlide]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const updates = {};
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            updates[entry.target.id] = true;
          }
        });
        if (Object.keys(updates).length > 0) {
          setVisibleSections((prev) => ({ ...prev, ...updates }));
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    sectionRefs.current.forEach((ref) => ref && observer.observe(ref));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setCategoriesLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getProducts = useCallback(async () => {
    setLoading(true);
    try {
      const cacheKey = "siasahub_products_cache";
      const cachedData = sessionStorage.getItem(cacheKey);
      const cacheTimestamp = sessionStorage.getItem(`${cacheKey}_timestamp`);

      if (cachedData && cacheTimestamp && Date.now() - parseInt(cacheTimestamp) < 300000) {
        setProducts(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 10000)
      );

      const productsPromise = getAllProducts();
      const productsData = await Promise.race([productsPromise, timeoutPromise]);
      const normalizedProducts = Array.isArray(productsData) ? productsData : [];
      setProducts(normalizedProducts);

      sessionStorage.setItem(cacheKey, JSON.stringify(normalizedProducts));
      sessionStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const preloadLink = document.createElement("link");
    preloadLink.rel = "preload";
    preloadLink.as = "image";
    preloadLink.href = carouselData[0].image;
    document.head.appendChild(preloadLink);

    getProducts();

    return () => {
      if (preloadLink.parentNode) document.head.removeChild(preloadLink);
    };
  }, [getProducts]);

  const categoryList = useMemo(() => {
    if (!categoriesLoaded) {
      return Array(4)
        .fill()
        .map((_, i) => <CategoryCardSkeleton key={`cat-skeleton-${i}`} />);
    }

    return categories.map((cat, index) => (
      <FloatWrapper key={index} delay={cat.delay}>
        <MemoizedCategoryCard category={cat} />
      </FloatWrapper>
    ));
  }, [categoriesLoaded]);

  const productList = useMemo(() => {
    if (loading) {
      return Array(8)
        .fill()
        .map((_, i) => <ProductCardSkeleton key={`product-skeleton-${i}`} />);
    }

    if (products.length === 0) {
      return (
        <div
          style={{
            textAlign: "center",
            gridColumn: "1/-1",
            color: "#64748b",
            fontSize: "18px",
            padding: "60px",
          }}
        >
          New merchandise arriving soon. Stay tuned!
        </div>
      );
    }

    return products.slice(0, 8).map((product) => (
      <MemoizedProductCard key={product.id || product._id} product={product} />
    ));
  }, [products, loading]);

  // Build dynamic SEO content from carousel and categories
  const currentCarousel = carouselData[currentSlide];
  const categoriesText = categories.map((c) => c.name).join(", ");
  const description = `Shop official Kenyan campaign merchandise: ${categoriesText}. ${currentCarousel.party}: "${currentCarousel.title}". Trending political gear, t-shirts, caps, flags, and reflectors. Support your candidate with authentic merch.`;
  const siteTitle = "SiasaHub Marketplace – Official Kenyan Campaign Merchandise";
  const siteUrl = "https://siasahub.com/";

  // JSON-LD structured data for the marketplace
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": siteTitle,
    "description": description,
    "url": siteUrl,
    "image": carouselData[0].image,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "Product",
            "name": "Campaign Merchandise",
            "description": categoriesText,
            "url": siteUrl
          }
        }
      ]
    }
  };

  return (
    <>
      <Helmet>
        <html lang="en" />
        <title>{siteTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="campaign merchandise, political t-shirts, Kenya election gear, SiasaHub, party merchandise, campaign flags, political caps, reflector jackets, 2027 elections" />
        <link rel="canonical" href={siteUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="SiasaHub – Official Campaign Merchandise Store" />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={carouselData[0].image} />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:site_name" content="SiasaHub" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SiasaHub Marketplace – Kenyan Election Gear" />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={carouselData[0].image} />

        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="SiasaHub" />
        <meta name="geo.region" content="KE" />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <Container>
        <Blob top="-100px" right="-100px" />
        <Blob top="40%" left="-200px" />
        <Blob top="70%" right="-100px" />

        <CarouselContainer>
          {carouselData.map((slide, index) => (
            <Slide key={index} $active={currentSlide === index}>
              <SlideImage
                src={slide.image}
                alt={slide.title}
                $active={currentSlide === index}
                loading={index === 0 ? "eager" : "lazy"}
              />
              <SlideContent $active={currentSlide === index}>
                <PartyBadge>
                  <Sparkles size={14} />
                  {slide.party}
                </PartyBadge>
                <SlideTitle>{slide.title}</SlideTitle>
                <SlideSubtitle>{slide.subtitle}</SlideSubtitle>
              </SlideContent>
            </Slide>
          ))}
          <ProgressTrack>
            <ProgressBar progress={progress} />
          </ProgressTrack>
          <NavButton direction="left" onClick={prevSlide} />
          <NavButton direction="right" onClick={nextSlide} />
        </CarouselContainer>

        <Suspense fallback={<div style={{ height: "400px" }} />}>
          <RevealSection
            id="categories"
            visible={visibleSections.categories}
            setRef={(el) => (sectionRefs.current[0] = el)}
          >
            <Section>
              <HeaderGroup>

                <Title>Shop By Category</Title>
              </HeaderGroup>
              <CardWrapper>{categoryList}</CardWrapper>
            </Section>
          </RevealSection>

          <RevealSection
            id="trending"
            visible={visibleSections.trending}
            setRef={(el) => (sectionRefs.current[1] = el)}
          >
            <Section>
              <HeaderGroup>

                <Title style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <ShieldCheck size={28} color="#e11d48" /> Trending Merchandise
                </Title>
              </HeaderGroup>
              <CardWrapper>{productList}</CardWrapper>
            </Section>
          </RevealSection>
        </Suspense>
      </Container>
    </>
  );
};

export default memo(Home);