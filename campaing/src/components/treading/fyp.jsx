// TopFypHeader.js - Updated with SiasaHub badge
import React, { memo } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { Flame, Fingerprint, MapPin, ShoppingBag, Users } from "lucide-react";

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

const StatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SiasaHubBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 59, 59, 0.15);
  padding: 4px 10px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 59, 59, 0.25);
    transform: scale(0.98);
  }

  .fingerprint {
    width: 12px;
    height: 12px;
    color: #ff3b3b;
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

const CTABadge = styled.div`
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

  &:hover {
    transform: scale(0.98);
    opacity: 0.9;
  }
`;

const ShopButton = styled.div`
  background: linear-gradient(135deg, #1e3c72, #2a4a8a);
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

  &:hover {
    transform: scale(0.98);
    opacity: 0.9;
    background: linear-gradient(135deg, #152c54, #1e3c72);
  }
`;

const RallyTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: #eee;
  white-space: nowrap;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 10px;
  background: rgba(255, 59, 59, 0.1);

  &::after {
    content: "●";
    color: #ff3b3b;
    font-size: 8px;
    margin-left: 4px;
    animation: ${pulse} 1s infinite;
  }
`;

const CountyTag = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 500;
  color: #aaa;
  white-space: nowrap;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);

  .badge {
    color: #22c55e;
    font-weight: 600;
  }
`;

const TopFypHeader = memo(() => {
  const navigate = useNavigate();

  return (
    <StickyWrapper>
      <MainHeader>
        <FYPLogo onClick={() => navigate("/")}>
          <Flame size={18} fill="#ff3b3b" color="#ff3b3b" />
          <span className="text">FYP</span>
        </FYPLogo>

        <StatRow>
          <SiasaHubBadge onClick={() => navigate("/")}>
            <Fingerprint size={12} className="fingerprint" />
            <span className="text">SiasaHub</span>
          </SiasaHubBadge>
        </StatRow>
      </MainHeader>

      <InteractiveBar>
        <CTABadge onClick={() => navigate("/voter-registration")}>
          <Fingerprint size={10} />
          <span>Je uko Kadi?</span>
        </CTABadge>

        <ShopButton onClick={() => navigate("/marketplace")}>
          <ShoppingBag size={10} />
          <span>Shop Merchandise</span>
        </ShopButton>

        <RallyTag onClick={() => navigate("/rallies")}>Youth Rally</RallyTag>

        <CountyTag onClick={() => navigate("/counties")}>
          <MapPin size={10} />
          Nairobi <span className="badge">#1</span>
        </CountyTag>
      </InteractiveBar>
    </StickyWrapper>
  );
});

export default TopFypHeader;
