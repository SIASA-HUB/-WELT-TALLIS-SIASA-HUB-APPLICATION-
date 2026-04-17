import React, { useState, useEffect, useRef, memo } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { Flame, ChevronRight, Trophy, Verified } from "lucide-react";
import AppLoadingBar from "../../utils/LoadingBar";
import theme from "../../utils/theme";

const COLORS = theme?.COLORS || { success: "#10b981", primary: "#ff4500" };
const TRANSITIONS = theme?.TRANSITIONS || { default: "0.3s ease" };

// API Configuration
import API from "../../api/config";
import api from "../../api/api";

const glow = keyframes`
  0% { filter: drop-shadow(0 0 2px rgba(16, 185, 129, 0.4)); }
  50% { filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.7)); }
  100% { filter: drop-shadow(0 0 2px rgba(16, 185, 129, 0.4)); }
`;

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
  transition: ${TRANSITIONS.default};

  &:hover {
    color: ${COLORS.success};
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
  height: 200px;
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
      rgba(0, 0, 0, 0.75) 100%
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
    props.$rank === 1 ? "#ffca28" : "rgba(0, 0, 0, 0.6)"};
  color: ${(props) => (props.$rank === 1 ? "#1e293b" : "white")};
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  z-index: 3;
  backdrop-filter: blur(4px);
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
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
`;

const Party = styled.div`
  font-size: 9px;
  opacity: 0.85;
  font-weight: 600;
  letter-spacing: 0.2px;
  text-transform: uppercase;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

// Helper: Build correct image URL without double slashes
const buildImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl === "null" || imageUrl === "undefined") return null;

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  let baseUrl = API.IMAGES || API.BASE || '';
  if (baseUrl && baseUrl.includes("/api/v1")) {
    baseUrl = baseUrl.replace(/\/api\/v1\/?$/, "");
  }
  if (baseUrl) {
    baseUrl = baseUrl.replace(/\/$/, "");
  }

  let cleanPath = imageUrl;
  if (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.substring(1);
  }

  if (!baseUrl) {
    return `/${cleanPath}`;
  }
  return `${baseUrl}/${cleanPath}`;
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
        const responseData = await api.get("/leaders/popular");
        if (responseData.success) {
          setLeaders(responseData.data || []);
        }
      } catch (error) {
        console.error("Error fetching leaders:", error);
      } finally {
        setLoading(false);
        loadingBarRef.current?.complete();
      }
    };
    fetchPopularLeaders();
  }, []);

  // Navigation uses slug only – no fallback to ID
  const handleLeaderClick = (leader) => {
    if (leader.slug) {
      navigate(`/leaders/${leader.slug}`);
    } else {
      console.error("Leader missing slug, cannot navigate:", leader);
      // Optionally show a toast or ignore
    }
  };

  if (loading && !leaders.length) return <AppLoadingBar ref={loadingBarRef} />;
  if (!leaders.length) return null;

  return (
    <SectionWrapper>
      <AppLoadingBar ref={loadingBarRef} />
      <HeaderRow>
        <TitleSection>
          <Flame
            size={20}
            fill={COLORS.success}
            className="fire-icon"
            color={COLORS.success}
          />
          <div className="main-title">Trending Aspirants</div>
        </TitleSection>
        <ViewAllLink onClick={() => navigate("/leaders")}>
          SEE ALL <ChevronRight size={14} />
        </ViewAllLink>
      </HeaderRow>

      <CardsContainer>
        {leaders.map((leader, index) => {
          const imageSrc = buildImageUrl(
            leader.image_url || leader.primary_image || leader.image
          );

          return (
            <LeaderCard
              key={leader.leader_id}
              onClick={() => handleLeaderClick(leader)}
            >
              <RankBadge $rank={index + 1}>
                {index === 0 ? <Trophy size={12} /> : index + 1}
              </RankBadge>

              <ImageWrapper>
                <LeaderImage
                  src={
                    imageSrc ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&background=10b981&color=fff&bold=true&size=150`
                  }
                  alt={leader.name}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&background=10b981&color=fff&bold=true&size=150`;
                  }}
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
              </ContentOverlay>
            </LeaderCard>
          );
        })}
      </CardsContainer>
    </SectionWrapper>
  );
};

export default memo(TrendingLeaders);