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
    opacity: 0.7;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      #000 8%,
      rgba(0, 0, 0, 0.2) 60%,
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
    color: #bb0000;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const LiveBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  background: #bb0000;
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

// Instagram-style Add Story Button
const AddStoryRing = styled.div`
  position: fixed;
  bottom: ${(props) => (props.$visible ? "82px" : "-88px")};
  right: 12px;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff5c01, #ff8c01, #ffcc00);
  padding: 3px;
  z-index: 98;
  transition: all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
  opacity: ${(props) => (props.$visible ? 0.6 : 0)};
  pointer-events: none;
  animation: ${pulse} 2s infinite;
`;

const AddStoryButton = styled.button`
  position: fixed;
  bottom: ${(props) => (props.$visible ? "90px" : "-80px")};
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #25d366, #128c7e);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
  z-index: 99;
  transition: all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  animation: ${(props) => (props.$visible ? fadeInUp : fadeOutDown)} 0.3s
    ease-out;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 25px rgba(37, 211, 102, 0.5);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const RallyCard = ({ rally, rank, onAddStory }) => {
  const navigate = useNavigate();
  const [daysLeft, setDaysLeft] = useState("");
  const [addButtonVisible, setAddButtonVisible] = useState(true);
  const scrollTimeoutRef = React.useRef(null);
  const lastScrollYRef = React.useRef(0);

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

  // Handle scroll to show/hide add button
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingUp = currentScrollY < lastScrollYRef.current;

      if (isScrollingUp) {
        setAddButtonVisible(true);
      } else if (currentScrollY > 50) {
        setAddButtonVisible(false);
      }

      if (currentScrollY <= 10) {
        setAddButtonVisible(true);
      }

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleAddStoryClick = (e) => {
    e.stopPropagation();
    if (onAddStory) {
      onAddStory(rally);
    }
  };

  const handleCardClick = () => {
    navigate(`/rally/${rally.rally_id}`);
  };

  return (
    <>
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
            <MapPin size={9} color="#bb0000" /> {rally.location || "Kenya"}
          </Location>
        </Content>
      </Card>

      {/* Instagram-style Add Story Button */}
      <AddStoryRing $visible={addButtonVisible} />
      <AddStoryButton onClick={handleAddStoryClick} $visible={addButtonVisible}>
        <Plus size={24} color="white" />
      </AddStoryButton>
    </>
  );
};

export default memo(RallyCard);
