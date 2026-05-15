// TopFypHeader.js - Fixed clickable Je uko Kadi link
import React, { memo } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  Fingerprint,
  TrendingUp,
  MessageCircle,
  UsersRound,
  Megaphone,
} from "lucide-react";

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const StickyWrapper = styled.div`
  position: sticky;
  top: 0;
  background: #000;
  border-bottom: 1px solid #111;
  z-index: 100;
`;

const MainHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  position: relative;
`;

const FYPLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  .text {
    font-size: 20px;
    font-weight: 900;
    color: #ff3b3b;
    letter-spacing: -0.5px;
  }
`;

const CenteredLogo = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;

  .logo-img {
    height: 36px;
    width: auto;
    object-fit: contain;
  }
`;

const SiasaHubBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 59, 59, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 59, 59, 0.2);
    transform: scale(0.98);
  }

  .text {
    font-size: 11px;
    font-weight: 700;
    color: #ff3b3b;
    letter-spacing: 0.5px;
  }
`;

const InteractiveBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #050505;
  overflow-x: auto;
  border-top: 1px solid #111;

  &::-webkit-scrollbar {
    display: none;
  }
`;

/* FIXED HERE */
const CTABadge = styled.a`
  background: #ff3b3b;
  color: #fff;
  padding: 5px 12px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;

  &:hover {
    transform: scale(0.98);
    opacity: 0.9;
  }
`;

const WhatsAppButton = styled.a`
  background: rgba(37, 211, 102, 0.15);
  border: 1px solid rgba(37, 211, 102, 0.3);
  color: #25d366;
  padding: 5px 12px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;

  &:hover {
    background: rgba(37, 211, 102, 0.25);
    transform: scale(0.98);
  }
`;

const AspirantsTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: #22c55e;
  white-space: nowrap;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 10px;
  background: rgba(34, 197, 94, 0.1);

  svg {
    color: #22c55e;
  }
`;

const TrendingTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: #fbbf24;
  white-space: nowrap;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 10px;
  background: rgba(251, 191, 36, 0.1);
`;

const AboutTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: #a855f7;
  white-space: nowrap;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 10px;
  background: rgba(168, 85, 247, 0.1);
`;

const TopFypHeader = memo(() => {
  const navigate = useNavigate();

  const whatsappGroupLink =
    "https://chat.whatsapp.com/DPLfiPjZSc7JX55U01wcHz";

  return (
    <StickyWrapper>
      <MainHeader>
        <FYPLogo onClick={() => navigate("/")}>
          <Flame size={18} fill="#ff3b3b" color="#ff3b3b" />
          <span className="text">FYP</span>
        </FYPLogo>

        <CenteredLogo>
          <img
            src="/image/siasa.png"
            alt="SiasaHub"
            className="logo-img"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </CenteredLogo>

        <SiasaHubBadge onClick={() => navigate("/")}>
          <span className="text">SiasaHub</span>
        </SiasaHubBadge>
      </MainHeader>

      <InteractiveBar>

        <CTABadge
          href="https://verify.iebc.or.ke/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Je uko Kadi?</span>
        </CTABadge>

        <AspirantsTag onClick={() => navigate("/leaders")}>
          <span>Aspirants</span>
        </AspirantsTag>

        <TrendingTag onClick={() => navigate("/trending")}>
          <span>Trending</span>
        </TrendingTag>

        <WhatsAppButton
          href="https://afyayangu.go.ke/#/registration"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>SHA Register</span>
        </WhatsAppButton>

        <WhatsAppButton
          href="https://www.bomayangu.go.ke/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Boma Yangu</span>
        </WhatsAppButton>

        <WhatsAppButton
          href={whatsappGroupLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Join WhatsApp</span>
        </WhatsAppButton>

        <AboutTag onClick={() => navigate("/about")}>
          <span>About</span>
        </AboutTag>

      </InteractiveBar>
    </StickyWrapper>
  );
});

export default TopFypHeader;