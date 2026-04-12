import React, { useEffect, useState, useCallback, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import ProductCategoryCard from "../components/cards/ProductCategoryCard";
import ProductCard from "../components/cards/ProductCard";
import { getAllProducts } from "../components/api";
import { Spinner } from "react-bootstrap";
import { ChevronLeft, ChevronRight, Sparkles, ShieldCheck } from "lucide-react";

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

// --- STYLED COMPONENTS ---
const Container = styled.div`
  padding-bottom: 0px;
  background: ${({ theme }) => theme.bg};
  height: 100%;
  overflow-x: hidden;
  position: relative;
`;

const Blob = styled.div`
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
`;

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

const Slide = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${({ active }) => (active ? 1 : 0)};
  z-index: ${({ active }) => (active ? 1 : 0)};
  transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.5;
  ${({ active }) => active && css`animation: ${kenBurns} 10s ease-out forwards;`}
`;

const SlideContent = styled.div`
  position: absolute;
  z-index: 10;
  text-align: center;
  color: white;
  max-width: 900px;
  padding: 0 40px;
  opacity: ${({ active }) => (active ? 1 : 0)};
  transform: translateY(${({ active }) => (active ? "0" : "40px")});
  transition: all 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s;
`;

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

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #e11d48, #fb7185);
  width: ${({ progress }) => progress}%;
  box-shadow: 0 0 10px rgba(225, 29, 72, 0.8);
  transition: width 0.1s linear;
`;

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  ${({ $direction }) => ($direction === "left" ? "left: 20px" : "right: 20px")};
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: #e11d48;
    border-color: #e11d48;
    transform: translateY(-50%) scale(1.05);
  }
  
  @media (max-width: 768px) { display: none; }
`;

const RevealSection = styled.div`
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: translateY(${({ $visible }) => ($visible ? "0" : "40px")});
  transition: all 1s cubic-bezier(0.22, 1, 0.36, 1);
`;

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

// Responsive grid: 2 cards on mobile, 3 on tablet, 4 on desktop
const CardWrapper = styled.div`
  display: grid;

  gap: 10px;
  padding: 0 10px;
  
  // Mobile: 2 columns
  grid-template-columns: repeat(2, 1fr);
  
  // Tablet: 3 columns
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  // Desktop: 4 columns
  @media (min-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
  }
  
  // Large screens: 4 columns with max width
  @media (min-width: 1600px) {
    grid-template-columns: repeat(4, minmax(280px, 320px));
    justify-content: center;
  }
`;

const FloatWrapper = styled.div`
  animation: ${float} 6s ease-in-out infinite;
  animation-delay: ${({ delay }) => delay || "0s"};
  width: 100%;
  display: flex;
  justify-content: center;
  
  > * {
    width: 100%;
  }
`;

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

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visibleSections, setVisibleSections] = useState({});
  
  const SLIDE_DURATION = 6000;
  const sectionRefs = useRef([]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, SLIDE_DURATION);
    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.min(prev + (100 / (SLIDE_DURATION / 100)), 100));
    }, 100);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => ({ ...prev, [entry.target.id]: true }));
        }
      });
    }, { threshold: 0.1 });

    sectionRefs.current.forEach((ref) => ref && observer.observe(ref));

    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
      observer.disconnect();
    };
  }, [nextSlide]);

  const getProducts = async () => {
    setLoading(true);
    try {
      const res = await getAllProducts();
      setProducts(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <Container>
      <Blob top="-100px" right="-100px" />
      <Blob top="40%" left="-200px" />
      <Blob top="70%" right="-100px" />

      <CarouselContainer>
        {carouselData.map((slide, index) => (
          <Slide key={index} active={currentSlide === index}>
            <SlideImage 
              src={slide.image} 
              alt={slide.title} 
              active={currentSlide === index}
            />
            <SlideContent active={currentSlide === index}>
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
        <NavButton $direction="left" onClick={() => { setCurrentSlide((prev) => (prev - 1 + carouselData.length) % carouselData.length); setProgress(0); }}>
          <ChevronLeft size={28} />
        </NavButton>
        <NavButton $direction="right" onClick={nextSlide}>
          <ChevronRight size={28} />
        </NavButton>
      </CarouselContainer>

      <RevealSection 
        id="categories" 
        ref={(el) => (sectionRefs.current[0] = el)} 
        $visible={visibleSections.categories}
      >
        <Section>
          <HeaderGroup>
            <SectionSubtitle>Official Gear</SectionSubtitle>
            <Title>Shop By Category</Title>
          </HeaderGroup>
          <CardWrapper>
            {categories.map((cat, index) => (
              <FloatWrapper key={index} delay={cat.delay}>
                <ProductCategoryCard category={cat} />
              </FloatWrapper>
            ))}
          </CardWrapper>
        </Section>
      </RevealSection>

      <RevealSection 
        id="trending" 
        ref={(el) => (sectionRefs.current[1] = el)} 
        $visible={visibleSections.trending}
      >
        <Section>
          <HeaderGroup>
            <SectionSubtitle>Hot Right Now</SectionSubtitle>
            <Title style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={28} color="#e11d48" /> Trending Merchandise
            </Title>
          </HeaderGroup>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
              <Spinner animation="border" style={{ color: "#e11d48" }} />
            </div>
          ) : (
            <CardWrapper>
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <div style={{ textAlign: "center", gridColumn: "1/-1", color: "#64748b", fontSize: "18px", padding: "60px" }}>
                  New merchandise arriving soon. Stay tuned!
                </div>
              )}
            </CardWrapper>
          )}
        </Section>
      </RevealSection>
    </Container>
  );
};

export default Home;