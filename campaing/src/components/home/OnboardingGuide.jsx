import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, MapPin, Upload, X, ArrowRight } from 'lucide-react';

// --- Styled Components (Stay the same) ---
const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Card = styled(motion.div)`
  background: #0a0a0a;
  width: 100%;
  max-width: 340px;
  border-radius: 24px;
  position: relative;
  border: 1px solid #222;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
`;

const Content = styled.div`
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const OrbitBox = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
`;

const IconCircle = styled.div`
  width: 56px;
  height: 56px;
  background: #111;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border: 1px solid #333;
  z-index: 2;
`;

const OrbitRing = styled(motion.div)`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: #6366f1;
`;

const Title = styled(motion.h2)`
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px 0;
`;

const Desc = styled(motion.p)`
  font-size: 14px;
  color: #888;
  line-height: 1.5;
  margin: 0;
`;

const Footer = styled.div`
  padding: 0 24px 32px;
`;

const NextBtn = styled(motion.button)`
  width: 100%;
  background: #fff;
  color: #000;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const Dots = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 24px;
`;

const Dot = styled(motion.div)`
  height: 4px;
  border-radius: 2px;
  background: ${props => props.$active ? '#6366f1' : '#222'};
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #444;
  cursor: pointer;
  &:hover { color: #fff; }
`;

const STEPS = [
  { title: "Aspirant Entry", desc: "Start your political journey with a professional profile.", icon: User },
  { title: "Constituency", desc: "Pinpoint your region to connect with local voters.", icon: MapPin },
  { title: "Manifesto", desc: "Upload your vision and broadcast it to the people.", icon: Upload },
  { title: "Verification", desc: "Get verified to unlock elite campaign features.", icon: ShieldCheck }
];

// --- Component with Persistence Logic ---
const OnboardingGuide = () => {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false); // Default to false to prevent "flicker"

  useEffect(() => {
    // 1. Get the current count from local storage
    const viewCount = parseInt(localStorage.getItem('onboarding_views') || '0');

    // 2. If they've seen it less than twice, show it and increment the count
    if (viewCount < 2) {
      setShow(true);
      localStorage.setItem('onboarding_views', (viewCount + 1).toString());
    }
  }, []);

  if (!show) return null;

  return (
    <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <CloseBtn onClick={() => setShow(false)}><X size={18} /></CloseBtn>

        <AnimatePresence mode="wait">
          <Content key={index}>
            <OrbitBox>
              <OrbitRing
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              />
              <IconCircle>
                {React.createElement(STEPS[index].icon, { size: 24 })}
              </IconCircle>
            </OrbitBox>

            <Title initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {STEPS[index].title}
            </Title>

            <Desc initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              {STEPS[index].desc}
            </Desc>

            <Dots>
              {STEPS.map((_, i) => (
                <Dot
                  key={i}
                  $active={i === index}
                  animate={{ width: i === index ? 24 : 6 }}
                />
              ))}
            </Dots>
          </Content>
        </AnimatePresence>

        <Footer>
          <NextBtn
            whileTap={{ scale: 0.97 }}
            onClick={() => index < STEPS.length - 1 ? setIndex(index + 1) : setShow(false)}
          >
            {index === STEPS.length - 1 ? "Get Started" : "Continue"}
            <ArrowRight size={16} />
          </NextBtn>
        </Footer>
      </Card>
    </Overlay>
  );
};

export default OnboardingGuide;