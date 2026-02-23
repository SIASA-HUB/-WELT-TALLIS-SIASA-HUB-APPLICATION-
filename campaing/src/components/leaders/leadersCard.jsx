import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Target,
  Sparkles,
  TrendingUp,
  MapPin,
  Share2,
} from "lucide-react";

// --- GLOBAL CSS FIX (Prevents the "Whole App Refresh" on mobile pull) ---
// Add this to your index.css or a GlobalStyle component:
// body { overscroll-behavior-y: contain; }

const INTERACTION_URL = "http://localhost:8006/api/v1/leaders/interact";

const THEME = {
  primary: "#BB0000",
  glassBorder: "rgba(255, 255, 255, 0.15)",
  success: "#10b981",
  danger: "#ef4444",
};

// --- STYLED COMPONENTS ---
const CardWrapper = styled.div`
  --party-color: ${(props) => props.$color || THEME.primary};
  width: 100%;
  max-width: 360px;
  height: 480px;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  margin: 0 auto;
  background: #000;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  /* Modern touch smoothing */
  -webkit-tap-highlight-color: transparent;
`;

const HeroImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const DarkBottomStage = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0.85) 30%,
    rgba(0, 0, 0, 0) 50%
  );
`;

const TopBadge = styled.div`
  position: absolute;
  top: 15px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  padding: 5px 12px;
  border-radius: 8px;
  color: white;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 5px;
  z-index: 5;
`;

const VyingBadge = styled(TopBadge)`
  left: 15px;
`;
const TrendingBadge = styled(TopBadge)`
  right: 15px;
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
`;
const CardBody = styled.div`
  padding: 20px;
  z-index: 2;
`;
const NameRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 10px;
`;
const Name = styled.h3`
  color: white;
  font-size: 1.7rem;
  font-weight: 200;
  margin: 0;
  line-height: 1.1;
  span {
    font-weight: 900;
  }
`;
const LocationTag = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--party-color);
  font-size: 10px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.05);
  padding: 3px 8px;
  border-radius: 6px;
  margin-bottom: 3px;
`;
const SloganRow = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin: 8px 0 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
`;
const ActionGrid = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const FlatButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 700;
  font-size: 12px;
  border: 1px solid ${THEME.glassBorder};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const VoteBtn = styled(FlatButton)`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  &:hover:not(:disabled) {
    background: ${(props) =>
      props.$type === "up" ? THEME.success : THEME.danger};
    border-color: transparent;
  }
  svg {
    fill: ${(props) => (props.$active ? "white" : "none")};
    transition: fill 0.2s;
  }
`;

const ProfileBtn = styled(FlatButton)`
  flex: 2;
  background: white;
  color: black;
  border: none;
  text-transform: uppercase;
  &:hover:not(:disabled) {
    background: var(--party-color);
    color: white;
  }
`;

// --- MAIN COMPONENT ---
const LeaderCard = ({
  leader,
  onLike,
  onDislike,
  onViewInsights,
  isLiked,
  isDisliked,
  userId = "Guest_User",
}) => {
  const [loading, setLoading] = useState(false);

  const {
    leader_id,
    name,
    party,
    position_running_for,
    location,
    primary_image,
    slogan,
    verification,
    views = 0,
    likes = 0,
    dislikes = 0,
    shares = 0,
  } = leader;

  const partyColor =
    party === "ODM" ? "#FF4500" : party === "UDA" ? "#ffd700" : THEME.primary;

  const handleInteraction = async (type) => {
    // 1. Logic Gates: Prevent double clicks or clicking already active states
    if (loading) return;
    if (type === "like" && isLiked) return;
    if (type === "dislike" && isDisliked) return;

    setLoading(true);

    // 2. Optimistic UI: Notify parent to update count immediately
    if (type === "like") onLike(leader_id);
    if (type === "dislike") onDislike(leader_id);
    if (type === "view") onViewInsights(leader);

    // 3. Special Case: Share API
    if (type === "share") {
      try {
        if (navigator.share) {
          await navigator.share({
            title: `Support ${name}`,
            text: slogan,
            url: window.location.href,
          });
        }
      } catch (err) {
        console.log("Share cancelled or not supported");
      }
    }

    try {
      // 4. Background Network Sync (No whole page refresh)
      await axios.post(INTERACTION_URL, {
        leader_id,
        user_id: userId,
        type,
      });
    } catch (err) {
      console.error(`Interaction Sync Error:`, err.message);
    } finally {
      setLoading(false);
    }
  };

  const nameParts = (name || "").split(" ");

  return (
    <CardWrapper $color={partyColor}>
      <VyingBadge>
        <Target size={11} color={partyColor} />{" "}
        {position_running_for || "Candidate"}
      </VyingBadge>
      <TrendingBadge>
        <TrendingUp size={11} /> {views.toLocaleString()}
      </TrendingBadge>
      <HeroImage src={primary_image} alt={name} loading="lazy" />

      <DarkBottomStage>
        <CardBody>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              marginBottom: "6px",
            }}
          >
            <span
              style={{ fontSize: "10px", color: partyColor, fontWeight: 900 }}
            >
              {party}
            </span>
            {verification === 1 && (
              <CheckCircle2 size={12} fill={partyColor} color="black" />
            )}
          </div>

          <NameRow>
            <Name>
              {nameParts[0]} <span>{nameParts.slice(1).join(" ")}</span>
            </Name>
            <LocationTag>
              <MapPin size={10} /> {location}
            </LocationTag>
          </NameRow>

          <SloganRow>
            <Sparkles size={12} color={partyColor} /> "{slogan}"
          </SloganRow>

          <ActionGrid>
            {/* LIKE */}
            <VoteBtn
              $type="up"
              $active={isLiked}
              disabled={loading || isLiked}
              onClick={() => handleInteraction("like")}
            >
              <ThumbsUp size={16} /> {likes}
            </VoteBtn>

            {/* PROFILE */}
            <ProfileBtn
              disabled={loading}
              onClick={() => handleInteraction("view")}
            >
              PROFILE
            </ProfileBtn>

            {/* DISLIKE */}
            <VoteBtn
              $type="down"
              $active={isDisliked}
              disabled={loading || isDisliked}
              onClick={() => handleInteraction("dislike")}
            >
              <ThumbsDown size={16} /> {dislikes}
            </VoteBtn>

            {/* SHARE */}
            <VoteBtn
              disabled={loading}
              onClick={() => handleInteraction("share")}
            >
              <Share2 size={14} /> {shares}
            </VoteBtn>
          </ActionGrid>
        </CardBody>
      </DarkBottomStage>
    </CardWrapper>
  );
};

export default LeaderCard;
