import React, { useState, memo, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Heart,
  Users,
  Flame,
  Trophy,
  Radio,
  Check,
  Plus,
} from "lucide-react";

// --- ANIMATIONS ---
const livePulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeOutDown = keyframes`
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(30px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
`;

const Card = styled.div`
  min-width: 200px;
  height: 290px;
  background: #000;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.97);
  }
`;

const ImageLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.9;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(0,0,0,0.9) 0%,
      rgba(0, 0, 0, 0.4) 40%,
      transparent 100%
    );
  }
`;

const DateBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  padding: 5px 10px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;

  .days {
    font-size: 11px;
    font-weight: 900;
    color: #fff;
    display: block;
  }

  .label {
    font-size: 6px;
    font-weight: 800;
    color: #ff3333;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const LiveBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  background: #ff3333;
  color: #fff;
  font-size: 8px;
  font-weight: 900;
  padding: 3px 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 3px;

  .dot {
    width: 4px;
    height: 4px;
    background: #fff;
    border-radius: 50%;
    animation: ${livePulse} 1s infinite;
  }
`;

const Content = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 14px;
  z-index: 5;
`;

const Title = styled.h3`
  font-size: 15px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: -0.2px;
`;

const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 0;
`;

const RallyCard = ({ rally, rank }) => {
  const navigate = useNavigate();
  const [daysLeft, setDaysLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const diff = new Date(rally.date || Date.now() + 86400000) - new Date();
      if (diff <= 0) return setDaysLeft("LIVE");
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      setDaysLeft(days > 0 ? `${days}D ${hours}H` : `${hours}H LEFT`);
    };
    calculateTime();
  }, [rally.date]);

  const handleCardClick = () => {
    navigate(`/rally/${rally.rally_id}`);
  };

  return (
    <Card onClick={handleCardClick}>
      <ImageLayer>
        <img
          src={
            rally.image ||
            "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?w=400"
          }
          alt="rally"
        />
      </ImageLayer>

      <LiveBadge>
        <div className="dot" /> {rank === 0 ? "TOP" : "HOT"}
      </LiveBadge>

      <DateBadge>
        <span className="days">{daysLeft}</span>
        <span className="label">Starts</span>
      </DateBadge>

      <Content>
        <Title>{rally.name || "Mega Rally"}</Title>
        <Location>
          <MapPin size={9} color="#ff3333" /> {rally.location || "Kenya"}
        </Location>
      </Content>
    </Card>
  );
};

export default memo(RallyCard);
