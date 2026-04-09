import React, { useState, useEffect, useRef, memo } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Heart,
  Eye,
  Flame,
  ChevronRight,
  Trophy,
  Verified,
} from "lucide-react";
import AppLoadingBar from "../../utils/LoadingBar";
import theme from "../../utils/Theme";

// Added fallbacks to prevent "Cannot read properties of undefined"
const COLORS = theme?.COLORS || { success: "#10b981", primary: "#ff4500" };
const TRANSITIONS = theme?.TRANSITIONS || { default: "0.3s ease" };

const API_BASE_URL = "http://localhost:8002/api/v1";

// --- ANIMATIONS ---
const glow = keyframes`
  0% { filter: drop-shadow(0 0 2px rgba(16, 185, 129, 0.4)); }
  50% { filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.7)); }
  100% { filter: drop-shadow(0 0 2px rgba(16, 185, 129, 0.4)); }
`;

// --- STYLED COMPONENTS ---
const SectionWrapper = styled.section`
  margin: 16px 0 24px 0;
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
    color: #1e293b;
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
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  /* Added optional chaining here */
  transition: ${TRANSITIONS?.default || "0.3s ease"};

  &:hover {
    color: ${COLORS?.success || "#10b981"};
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

const LeaderCard = styled.div`
  position: relative;
  width: 150px;
  min-width: 150px;
  height: 220px;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
  }
`;

const ImageWrapper = styled.div`
  position: absolute;
  inset: 0;
  background: #f1f5f9;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      transparent 40%,
      rgba(0, 0, 0, 0.85) 100%
    );
    z-index: 1;
  }
`;

const LeaderImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;

  ${LeaderCard}:hover & {
    transform: scale(1.1);
  }
`;

const RankBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: ${(props) =>
    props.$rank === 1 ? "#ffca28" : "rgba(255,255,255,0.9)"};
  color: #1e293b;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 900;
  z-index: 3;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
`;

const ContentOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  z-index: 2;
  color: white;
`;

const Name = styled.div`
  font-size: 14px;
  font-weight: 800;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Party = styled.div`
  font-size: 9px;
  opacity: 0.85;
  font-weight: 600;
  letter-spacing: 0.2px;
  margin-bottom: 8px;
  text-transform: uppercase;
`;

const StatsPill = styled.div`
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  width: fit-content;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  .stat {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 9px;
    font-weight: 700;
  }
`;

const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const TrendingLeaders = () => {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadingBarRef = useRef(null);

  useEffect(() => {
    const fetchPopularLeaders = async () => {
      loadingBarRef.current?.continuousStart();
      try {
        const { data } = await axios.get(`${API_BASE_URL}/leaders/popular`);
        if (data.success) setLeaders(data.data || []);
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
            fill={COLORS?.success || "#10b981"}
            className="fire-icon"
            color={COLORS?.success || "#10b981"}
          />
          <div className="main-title">Trending Aspirants</div>
        </TitleSection>
        <ViewAllLink onClick={() => navigate("/leaders")}>
          SEE ALL <ChevronRight size={14} />
        </ViewAllLink>
      </HeaderRow>

      <CardsContainer>
        {leaders.map((leader, index) => (
          <LeaderCard
            key={leader.leader_id}
            onClick={() => navigate(`/leader/${leader.leader_id}`)}
          >
            <RankBadge $rank={index + 1}>
              {index === 0 ? <Trophy size={12} /> : index + 1}
            </RankBadge>

            <ImageWrapper>
              <LeaderImage
                src={
                  leader.primary_image ||
                  leader.image_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&background=10b981&color=fff&bold=true`
                }
                alt={leader.name}
              />
            </ImageWrapper>

            <ContentOverlay>
              <Name>
                {leader.name?.split(" ").slice(0, 2).join(" ") || "Leader"}
                {leader.verification === 1 && (
                  <Verified size={12} fill="#3b82f6" color="white" />
                )}
              </Name>
              <Party>{leader.party || "Independent"}</Party>
              <StatsPill>
                <div className="stat">
                  <Heart size={10} fill="#ff4b4b" color="#ff4b4b" />
                  {formatNumber(leader.likes || 0)}
                </div>
                <div className="stat">
                  <Eye size={10} color="white" />
                  {formatNumber(leader.views || 0)}
                </div>
              </StatsPill>
            </ContentOverlay>
          </LeaderCard>
        ))}
      </CardsContainer>
    </SectionWrapper>
  );
};

export default memo(TrendingLeaders);
