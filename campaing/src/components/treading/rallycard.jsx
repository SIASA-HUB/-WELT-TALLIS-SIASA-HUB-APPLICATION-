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
} from "lucide-react";

// --- ANIMATIONS ---
const heartBeat = keyframes`
  0% { transform: scale(1); }
  25% { transform: scale(1.2); }
  50% { transform: scale(1); }
  100% { transform: scale(1); }
`;

const livePulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
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
  font-size: 15px; /* Smaller, cleaner font */
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
  margin-bottom: 12px;
`;

const TikTokStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.04);
  padding: 6px 10px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const SupportAction = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${(props) => (props.$active ? "#ff0050" : "#fff")};
  font-size: 10px;
  font-weight: 800;
  .count-label {
    color: #64748b;
    font-size: 8px;
    margin-left: -2px;
  }
  svg {
    animation: ${(props) => (props.$active ? heartBeat : "none")} 0.4s ease-out;
    fill: ${(props) => (props.$active ? "#ff0050" : "none")};
    stroke: ${(props) => (props.$active ? "#ff0050" : "currentColor")};
  }
`;

const AttendBtn = styled.button`
  background: ${(props) => (props.$active ? "#bb0000" : "#fff")};
  border: none;
  padding: 5px 10px;
  border-radius: 8px;
  color: ${(props) => (props.$active ? "#fff" : "#000")};
  font-size: 9px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
`;

const RallyCard = ({ rally, rank }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [attending, setAttending] = useState(false);
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

  return (
    <Card onClick={() => navigate(`/rally/${rally.rally_id}`)}>
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

        <TikTokStats>
          <SupportAction
            $active={liked}
            onClick={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
          >
            <Heart size={15} />
            <span>
              {rally.likes_count || "24K"}{" "}
              <span className="count-label">SUPPORTS</span>
            </span>
          </SupportAction>

          <AttendBtn
            $active={attending}
            onClick={(e) => {
              e.stopPropagation();
              setAttending(!attending);
            }}
          >
            {attending ? <Check size={11} /> : <Users size={11} />}
            {attending ? "GOING" : "ATTEND"}
          </AttendBtn>
        </TikTokStats>
      </Content>
    </Card>
  );
};

export default memo(RallyCard);
