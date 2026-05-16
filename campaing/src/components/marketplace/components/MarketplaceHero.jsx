import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroContainer = styled.section`
  min-height: 85vh;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  background: #0a0a0a;
  border-radius: 32px;
  margin-bottom: 40px;
  padding: 0 80px;

  @media (max-width: 768px) {
    padding: 0 24px;
    min-height: 70vh;
    border-radius: 0;
  }
`;

const CarouselImage = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: 1;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(10, 10, 10, 0.85) 0%, rgba(10, 10, 10, 0.5) 50%, rgba(10, 10, 10, 0.2) 100%);
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 3;
  max-width: 600px;
  width: 100%;
`;

const Headline = styled(motion.h1)`
  font-size: clamp(42px, 6vw, 78px);
  font-weight: 900;
  color: #ffffff;
  line-height: 1.05;
  margin-bottom: 20px;
  letter-spacing: -0.03em;
  
  span {
    color: #ff4757;
    display: block;
  }
`;

const Subline = styled(motion.p)`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  max-width: 500px;
  margin-bottom: 40px;
  line-height: 1.5;
  font-weight: 400;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    
    button {
      width: 100%;
      justify-content: center;
    }
  }
`;

const PrimaryButton = styled(motion.button)`
  padding: 18px 40px;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;

  &:hover {
    background: #000;
    transform: translateY(-2px);
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.2);
  }
`;

const SecondaryButton = styled(motion.button)`
  padding: 18px 40px;
  background: transparent;
  color: #ffffff;
  border: 2px solid #ffffff;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const CarouselControls = styled.div`
  position: absolute;
  bottom: 30px;
  right: 80px;
  display: flex;
  gap: 12px;
  z-index: 10;
  
  @media (max-width: 768px) {
    right: 24px;
    bottom: 20px;
  }
`;

const ControlDot = styled.button`
  width: 40px;
  height: 4px;
  background: ${props => props.$active ? '#ff4757' : 'rgba(255,255,255,0.4)'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #ff4757;
  }
`;

const images = [
  {
    url: "https://kickskenya.com/cdn/shop/files/LebronWitness8UG3.png?v=1757517225&width=375",
    headline: "Premium <span>Collection.</span>",
    subline: "Exclusive campaign gear designed for leaders who demand excellence. Stand out with quality."
  },
  {
    url: "https://eru.ecitizen.go.ke/assets/bomayangu/hero-2.jpeg",
    headline: "Empower Your <span>Vision.</span>",
    subline: "From grassroots to greatness. Get the official merchandise that speaks to your movement."
  },
  {
    url: "https://www.president.go.ke/wp-content/uploads/AIM2030.jpeg",
    headline: "Lead with <span>Style.</span>",
    subline: "Premium apparel for aspirants and supporters. Make your mark with confidence."
  }
];

const MarketplaceHero = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentImage = images[currentIndex];

  return (
    <HeroContainer>
      <AnimatePresence mode="wait">
        <CarouselImage
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6 }}
          style={{ backgroundImage: `url(${currentImage.url})` }}
        />
      </AnimatePresence>

      <Content>
        <Headline
          key={`headline-${currentIndex}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          dangerouslySetInnerHTML={{ __html: currentImage.headline }}
        />

        <Subline
          key={`subline-${currentIndex}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {currentImage.subline}
        </Subline>

        <ButtonGroup>
          <PrimaryButton
            onClick={() => navigate('/marketplace/shop')}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Shop Collection <ShoppingBag size={20} />
          </PrimaryButton>

          <SecondaryButton
            onClick={() => navigate('/marketplace/shop?segment=governor')}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            Aspirant Kits <ArrowRight size={18} />
          </SecondaryButton>
        </ButtonGroup>
      </Content>

      <CarouselControls>
        {images.map((_, idx) => (
          <ControlDot
            key={idx}
            $active={idx === currentIndex}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </CarouselControls>
    </HeroContainer>
  );
};

export default MarketplaceHero;