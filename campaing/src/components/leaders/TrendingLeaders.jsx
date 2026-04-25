// components/trending/trendingLeaders.jsx
import React, { useState, useEffect, useRef, memo } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { Flame, ChevronRight, ShieldCheck, MapPin, ArrowRight, Zap, User } from "lucide-react";
import AppLoadingBar from "../../utils/LoadingBar";
import theme from "../../utils/theme";

const COLORS = theme?.COLORS || { success: "#10b981", primary: "#ff4500" };
const TRANSITIONS = theme?.TRANSITIONS || { default: "0.3s ease" };

// API Configuration
import API from "../../api/config";
import api from "../../api/api";
import { buildImageUrl } from "../../utils/imageUtils";

// ========== ANIMATIONS ==========
const glow = keyframes`
  0% { filter: drop-shadow(0 0 2px rgba(220, 38, 38, 0.4)); }
  50% { filter: drop-shadow(0 0 8px rgba(220, 38, 38, 0.7)); }
  100% { filter: drop-shadow(0 0 2px rgba(220, 38, 38, 0.4)); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ========== STYLED COMPONENTS ==========
const SectionWrapper = styled.section`
  margin: 0px 0 0px 0;
`;



const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 16px;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .main-title {
    font-size: 18px;
    font-weight: 800;
    color: #000000ff;
    letter-spacing: -0.5px;
  }

  .fire-icon {
    animation: ${glow} 2s ease-in-out infinite;
  }
`;

const ViewAllLink = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #a1a1aa;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: ${TRANSITIONS.default};

  &:hover {
    color: #dc2626;
  }
`;

const CardsContainer = styled.div`
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding: 4px 16px 20px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

// Updated Leader Card to match LeaderCard component style
const LeaderCard = styled.div`
  position: relative;
  width: 230px;
  min-width: 230px;
  height: 350px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: #000;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: ${fadeUp} 0.5s ease-out forwards;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 35px rgba(220, 38, 38, 0.15);
    border-color: rgba(220, 38, 38, 0.5);
  }
`;

const ImageWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.2) 50%,
      rgba(0, 0, 0, 0.9) 90%,
      #000000 100%
    );
  }
`;

const LeaderImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1s ease-out;

  ${LeaderCard}:hover & {
    transform: scale(1.1);
  }
`;

const FallbackImage = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: white;

  svg {
    width: 48px;
    height: 48px;
    opacity: 0.5;
    margin-bottom: 8px;
  }

  span {
    font-size: 12px;
    opacity: 0.6;
  }
`;

const TopBar = styled.div`
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  display: flex;
  justify-content: space-between;
  z-index: 10;
`;

const PartyBadge = styled.div`
  background: #1efd0eff;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 4px;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PositionBadge = styled.div`
  backdrop-filter: blur(20px);
  background: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const InfoSection = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 18px;
  z-index: 5;
`;

const Name = styled.h3`
  font-size: 19px;
  font-weight: 800;
  color: white;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #a1a1aa;
  font-size: 12px;
  margin-bottom: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
  margin-bottom: 8px;
  font-size: 10px;
  color: #a1a1aa;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const SmallViewButton = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 4px 0px;
  transition: all 0.3s ease;

  ${LeaderCard}:hover & {
    color: #dc2626;
    gap: 10px;
  }
`;

const RankBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: ${(props) =>
    props.$rank === 1 ? "#ffca28" : "rgba(0, 0, 0, 0.6)"};
  color: ${(props) => (props.$rank === 1 ? "#1e293b" : "white")};
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  z-index: 12;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

// Helper function to normalize position
const normalizePosition = (position) => {
  if (!position) return null;
  const lower = position.toLowerCase();
  if (lower.includes("governor")) return "Governor";
  if (lower.includes("women rep") || lower.includes("woman rep")) return "Women Rep";
  if (lower.includes("mp") || lower.includes("member of parliament")) return "MP";
  if (lower.includes("mca") || lower.includes("member of county assembly")) return "MCA";
  if (lower.includes("senator")) return "Senator";
  if (lower.includes("president")) return "President";
  if (lower.includes("deputy president")) return "Deputy President";
  return position.length > 15 ? position.substring(0, 12) + "..." : position;
};

// Helper to get display location based on position
const getDisplayLocation = (leader) => {
  const position = leader.position_running_for || leader.position || "";
  const lowerPosition = position.toLowerCase();

  if (lowerPosition.includes("governor") || lowerPosition.includes("senator") || lowerPosition.includes("women rep")) {
    return leader.county || "Kenya";
  }
  if (lowerPosition.includes("mp") || lowerPosition.includes("member of parliament")) {
    return leader.constituency || leader.county || "Kenya";
  }
  if (lowerPosition.includes("mca") || lowerPosition.includes("member of county assembly")) {
    return leader.ward || leader.constituency || leader.county || "Kenya";
  }
  return leader.county || leader.constituency || "Kenya";
};

// Individual Trending Leader Card Component
const TrendingLeaderCard = memo(({ leader, rank }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const {
    leader_id,
    name = "Candidate",
    party = "IND",
    position,
    position_running_for,
    image_url,
    verification = 0,
    views = 0,
    followers = 0,
    endorsement_count = 0,
  } = leader || {};

  const imageUrl = buildImageUrl(image_url);
  const displayLocation = getDisplayLocation(leader);
  const displayPosition = normalizePosition(position_running_for || position);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleClick = () => {
    if (leader?.slug) {
      navigate(`/leader/${leader.slug}`);
    } else if (leader_id) {
      navigate(`/leader/${leader_id}`);
    }
  };

  return (
    <LeaderCard onClick={handleClick}>
      {/* Rank Badge */}
      <RankBadge $rank={rank}>
        {rank === 1 ? "👑" : rank}
      </RankBadge>

      <ImageWrapper>
        {imageUrl && !imageError ? (
          <LeaderImage
            src={imageUrl}
            alt={name}
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <FallbackImage>
            <User size={40} />
            <span>{name?.charAt(0) || "?"}</span>
          </FallbackImage>
        )}
      </ImageWrapper>

      <TopBar>
        <PartyBadge title={party}>
          <Zap size={11} fill="white" color="white" />
          {party?.length > 15 ? `${party.substring(0, 12)}...` : party}
        </PartyBadge>
        {displayPosition && (
          <PositionBadge>
            {displayPosition}
          </PositionBadge>
        )}
      </TopBar>

      <InfoSection>
        <Name title={name}>
          {name?.length > 20 ? `${name.substring(0, 18)}...` : name}
          {verification === 1 && (
            <ShieldCheck
              size={18}
              color="#dc2626"
              fill="rgba(220, 38, 38, 0.1)"
            />
          )}
        </Name>

        <Location title={displayLocation}>
          <MapPin size={13} />{" "}
          {displayLocation?.length > 25
            ? `${displayLocation.substring(0, 22)}...`
            : displayLocation}
        </Location>

        {(views > 0 || followers > 0 || endorsement_count > 0) && (
          <StatsRow>
            {views > 0 && <span>👁️ {views.toLocaleString()}</span>}
            {followers > 0 && <span>❤️ {followers.toLocaleString()}</span>}
            {endorsement_count > 0 && (
              <span>⭐ {endorsement_count.toLocaleString()}</span>
            )}
          </StatsRow>
        )}

        <SmallViewButton>
          Profile <ArrowRight size={14} strokeWidth={3} />
        </SmallViewButton>
      </InfoSection>
    </LeaderCard>
  );
});

TrendingLeaderCard.displayName = "TrendingLeaderCard";

// Main TrendingLeaders Component
const TrendingLeaders = ({ title }) => {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadingBarRef = useRef(null);

  useEffect(() => {
    const fetchPopularLeaders = async () => {
      loadingBarRef.current?.continuousStart();
      try {
        await api.getWithCache("/leaders/popular", (data) => {
          if (data && data.success) {
            setLeaders(data.data || []);
          }
        });
      } catch (error) {
        console.error("Error fetching leaders:", error);
      } finally {
        setLoading(false);
        loadingBarRef.current?.complete();
      }
    };
    fetchPopularLeaders();
  }, []);

  if (loading && !leaders.length) return <AppLoadingBar ref={loadingBarRef} />;
  if (!leaders.length) return null;

  return (
    <SectionWrapper>
      <AppLoadingBar ref={loadingBarRef} />
      <HeaderRow>
        <TitleSection>
          <Flame
            size={20}
            fill="#dc2626"
            className="fire-icon"
            color="#dc2626"
          />
          <div className="main-title">{title || "Trending Aspirants"}</div>
        </TitleSection>
        <ViewAllLink onClick={() => navigate("/leaders")}>
          SEE ALL <ChevronRight size={14} />
        </ViewAllLink>
      </HeaderRow>

      <CardsContainer>
        {leaders.map((leader, index) => (
          <TrendingLeaderCard
            key={leader.leader_id}
            leader={leader}
            rank={index + 1}
          />
        ))}
      </CardsContainer>
    </SectionWrapper>
  );
};

export default memo(TrendingLeaders);