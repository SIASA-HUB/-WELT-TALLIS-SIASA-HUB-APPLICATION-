// Banner.js - Clean Banner with No Button & Better Mobile Fonts
import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { ChevronLeft, ChevronRight } from "lucide-react";

// --- Animations ---
const fadeInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const zoomSlow = keyframes`
  0% { transform: scale(1); }
  100% { transform: scale(1.08); }
`;

// Navy Blue Color Theme
const COLORS = {
  primary: "#1e3c72",
  accent: "#ff8c42",
  text: "#ffffff",
  textLight: "rgba(255,255,255,0.9)",
};

// --- Styled Components ---
const Container = styled.div`
  position: relative;
  width: 100%;
  height: 80vh;
  min-height: 500px;
  max-height: 700px;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  margin: 0;
  padding: 0;

  @media (max-width: 1024px) {
    height: 70vh;
    min-height: 450px;
  }

  @media (max-width: 768px) {
    height: 65vh;
    min-height: 400px;
  }

  @media (max-width: 480px) {
    height: 60vh;
    min-height: 350px;
  }
`;

const Slide = styled.div`
  position: absolute;
  inset: 0;
  opacity: ${(props) => (props.$active ? 1 : 0)};
  z-index: ${(props) => (props.$active ? 2 : 1)};
  transition: opacity 0.6s ease-in-out;
  pointer-events: ${(props) => (props.$active ? "auto" : "none")};
`;

const ImageWrapper = styled.div`
  position: absolute;
  inset: 0;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.75) 0%,
      rgba(0, 0, 0, 0.4) 50%,
      rgba(30, 60, 114, 0.3) 100%
    );
    z-index: 1;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: ${(props) =>
    props.$active
      ? css`
          ${zoomSlow} 10s ease-out forwards
        `
      : "none"};
`;

const Content = styled.div`
  position: absolute;
  left: 5%;
  right: 5%;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  color: white;
  max-width: 600px;

  @media (max-width: 768px) {
    max-width: 85%;
    text-align: center;
    left: 50%;
    right: auto;
    transform: translate(-50%, -50%);
  }

  @media (max-width: 480px) {
    max-width: 90%;
  }

  & > * {
    opacity: 0;
    animation: ${(props) =>
      props.$active &&
      css`
        ${fadeInLeft} 0.5s ease forwards
      `};
  }

  h1 {
    animation-delay: 0.1s;
  }
  p {
    animation-delay: 0.2s;
  }

  @media (max-width: 768px) {
    & > * {
      animation-name: ${fadeInUp};
    }
  }
`;

const Title = styled.h1`
  font-size: 64px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 20px;
  letter-spacing: -2px;

  span {
    color: ${COLORS.accent};
  }

  @media (max-width: 1024px) {
    font-size: 52px;
  }

  @media (max-width: 768px) {
    font-size: 40px;
    letter-spacing: -1px;
    margin-bottom: 15px;
  }

  @media (max-width: 480px) {
    font-size: 32px;
    letter-spacing: -0.5px;
    margin-bottom: 12px;
  }
`;

const Description = styled.p`
  font-size: 18px;
  line-height: 1.5;
  margin-bottom: 0;
  color: ${COLORS.textLight};
  max-width: 550px;

  @media (max-width: 1024px) {
    font-size: 16px;
  }

  @media (max-width: 768px) {
    font-size: 15px;
    max-width: 100%;
    margin: 0 auto;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    line-height: 1.4;
  }
`;

// Dots Navigation
const DotsContainer = styled.div`
  position: absolute;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 30;

  @media (max-width: 768px) {
    bottom: 20px;
    gap: 10px;
  }
`;

const Dot = styled.button`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${(props) =>
    props.$active ? COLORS.accent : "rgba(255, 255, 255, 0.4)"};
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;

  &:hover {
    transform: scale(1.3);
    background: ${COLORS.accent};
  }

  @media (max-width: 768px) {
    width: 8px;
    height: 8px;
  }
`;

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 40;

  &:hover {
    background: ${COLORS.primary};
    transform: translateY(-50%) scale(1.05);
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  @media (max-width: 480px) {
    display: none;
  }

  ${(props) => (props.$direction === "left" ? "left: 15px;" : "right: 15px;")}
`;

const Banner = () => {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const banners = [
    {
      title: "The People's <span>Movement</span>",
      description:
        "Premium quality gear for the frontline warriors of democracy. Every purchase fuels the fight for change.",
      image:
        "https://images.unsplash.com/photo-1570126688035-1e6adbd61053?auto=format&fit=crop&q=80&w=1400",
    },
    {
      title: "Wear Your <span>Voice</span>",
      description:
        "Limited release movement apparel. Built for those who lead from the ground up.",
      image:
        "https://images.unsplash.com/photo-1551817958-c11933cc4981?auto=format&fit=crop&q=80&w=1400",
    },
    {
      title: "Unapologetic <span>Unity</span>",
      description:
        "Official Siasa Hub movement apparel. Join the movement and make your voice heard.",
      image:
        "https://images.unsplash.com/photo-1540910419892-f0c74b0e8967?auto=format&fit=crop&q=80&w=1400",
    },
  ];

  const next = useCallback(
    () => setCurrent((p) => (p + 1) % banners.length),
    [banners.length],
  );

  const prev = useCallback(
    () => setCurrent((p) => (p === 0 ? banners.length - 1 : p - 1)),
    [banners.length],
  );

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [next, isHovered]);

  return (
    <Container
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {banners.map((item, i) => (
        <Slide key={i} $active={i === current}>
          <ImageWrapper>
            <Image src={item.image} $active={i === current} />
          </ImageWrapper>

          <Content $active={i === current}>
            <Title dangerouslySetInnerHTML={{ __html: item.title }} />
            <Description>{item.description}</Description>
          </Content>
        </Slide>
      ))}

      {/* Dots Navigation */}
      <DotsContainer>
        {banners.map((_, i) => (
          <Dot key={i} $active={i === current} onClick={() => setCurrent(i)} />
        ))}
      </DotsContainer>

      <NavButton $direction="left" onClick={prev}>
        <ChevronLeft size={22} />
      </NavButton>

      <NavButton $direction="right" onClick={next}>
        <ChevronRight size={22} />
      </NavButton>
    </Container>
  );
};

export default Banner;
