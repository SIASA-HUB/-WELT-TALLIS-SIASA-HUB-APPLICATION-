import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronRight } from 'lucide-react';

const HeroContainer = styled.section`
  height: 70vh;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  background: #f8fafc;
  border-radius: 32px;
  margin-bottom: 40px;
  padding: 0 80px;

  @media (max-width: 768px) {
    padding: 0 40px;
    height: 60vh;
    border-radius: 0;
  }
`;

const BackgroundVisual = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, #f8fafc 0%, rgba(248, 250, 252, 0) 100%),
              url('https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=80') no-repeat center center;
  background-size: cover;
  z-index: 1;
`;

const Content = styled.div`
  position: relative;
  z-index: 3;
  max-width: 650px;
`;

const Badge = styled(motion.span)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #ef4444;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

const Headline = styled(motion.h1)`
  font-size: clamp(48px, 6vw, 82px);
  font-weight: 900;
  color: #1a1a2e;
  line-height: 0.95;
  margin-bottom: 24px;
  letter-spacing: -0.04em;
  
  span {
    color: #ef4444;
    display: block;
  }
`;

const Subline = styled(motion.p)`
  font-size: 20px;
  color: #64748b;
  max-width: 500px;
  margin-bottom: 48px;
  line-height: 1.6;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  @media (max-width: 480px) {
    flex-direction: column;
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
  color: #1a1a2e;
  border: 2px solid #1a1a2e;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
  }
`;

const MarketplaceHero = () => {
  return (
    <HeroContainer>
      <BackgroundVisual />
      <Content>
        <Badge
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
          Premium Collection 2024
        </Badge>
        <Headline
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Elevate Your <span>Movement.</span>
        </Headline>
        <Subline
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Luxury campaign gear for aspirants and supporters. 
          Unmatched quality, designed for leadership.
        </Subline>
        <ButtonGroup>
          <PrimaryButton
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Shop Collection <ShoppingBag size={20} />
          </PrimaryButton>
          <SecondaryButton
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Aspirant Kits
          </SecondaryButton>
        </ButtonGroup>
      </Content>
    </HeroContainer>
  );
};

export default MarketplaceHero;
