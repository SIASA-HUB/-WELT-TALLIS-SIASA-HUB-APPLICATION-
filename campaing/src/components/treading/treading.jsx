import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Eye,
  MapPin,
  CheckCircle,
  BarChart2,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  margin: 10px 0px;
  padding: 0 5px;
  animation: ${slideIn} 0.4s ease-out;
  position: relative;
`;

// Sticky header that stays on top when scrolling - FIXED
const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  padding: 10px 5px;
  margin-bottom: 12px;
  border-bottom: 1px solid
    ${(props) => (props.$isSticky ? "#e2e8f0" : "transparent")};
  box-shadow: ${(props) =>
    props.$isSticky ? "0 4px 12px rgba(0,0,0,0.05)" : "none"};
  transition: all 0.3s ease;
  width: 100%;
  left: 0;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const Title = styled.div`
  font-size: 18px;
  line-height: 1;
  font-weight: 700;
  display: flex;
  align-items: center;
  color: #0f172a;
`;

const NavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const PillButton = styled.div`
  background: #f8fafc;
  padding: 4px 6px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  svg {
    width: 12px;
    height: 12px;
  }

  span {
    font-size: 10px;
    font-weight: 700;
    color: #1e293b;
  }
`;

const CountBadge = styled.div`
  background: #bb0000;
  color: white;
  font-size: 7px;
  font-weight: 900;
  padding: 1px 3px;
  border-radius: 6px;
  min-width: 12px;
  text-align: center;
  line-height: 10px;
`;

const ActionLink = styled.div`
  color: #bb0000;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  padding-left: 4px;
  display: flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;

  &:hover {
    opacity: 0.7;
  }

  svg {
    width: 10px;
    height: 10px;
  }
`;

const CardsContainer = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 12px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const BaseCard = styled.div`
  min-width: 140px; /* Even smaller for mobile */
  height: 200px; /* Even shorter for mobile */
  border-radius: 18px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
  background: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  &:active {
    transform: scale(0.96);
  }
`;

const VideoFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  pointer-events: none;
  transform: scale(2.5);
`;

const Badge = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  background: #000;
  color: white;
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 8px;
  font-weight: 900;
  z-index: 10;
`;

const LeaderImageContainer = styled.div`
  width: 100%;
  height: 110px;
  overflow: hidden;
  background: #f1f5f9;
`;

const StyledImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
`;

const VideoCard = ({ videoId, label }) => (
  <BaseCard>
    <Badge>{label || "Watch"}</Badge>
    <VideoFrame
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`}
      allow="autoplay"
    />
  </BaseCard>
);

const TrendingSection = ({ onSelect }) => {
  const [leaders, setLeaders] = useState([]);
  const [pollCount, setPollCount] = useState(5);
  const [storeCount, setStoreCount] = useState(8);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef(null);
  const navigate = useNavigate();

  const endVideos = ["RFnfBf4qT5U", "fZMRc-UyPm0", "vPqeafmzYAY"];

  useEffect(() => {
    fetchLeaders();
    fetchCounts();

    // Better scroll listener for sticky header
    const handleScroll = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        // If the header's top is less than or equal to 0, it's sticky
        setIsSticky(rect.top <= 0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchLeaders = async () => {
    try {
      const response = await fetch(
        "https://bundle-unexpected-sustainability-idol.trycloudflare.com/api/v1/leaders/leaders",
      );
      const res = await response.json();
      if (res.success) setLeaders(res.data || []);
    } catch (error) {
      console.error("Error fetching leaders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      // Fetch poll count
      const pollRes = await fetch(
        "https://bundle-unexpected-sustainability-idol.trycloudflare.com/api/v1/polls",
      );
      const pollData = await pollRes.json();
      if (pollData.success) setPollCount(pollData.data?.length || 5);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaders();
    await fetchCounts();
    setRefreshing(false);
  };

  const formatNum = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : n || 0);

  if (loading) return null;

  return (
    <>
      {/* Sticky Header - using a separate element outside Container for better sticky behavior */}
      <StickyHeader ref={headerRef} $isSticky={isSticky}>
        <HeaderContent>
          <Title>🔥 Treding</Title>
          <NavGroup>
            <PillButton onClick={() => navigate("/marketplace")}>
              <ShoppingBag color="#bb0000" />
              <span>Store</span>
              {storeCount > 0 && <CountBadge>{storeCount}</CountBadge>}
            </PillButton>

            <PillButton onClick={() => navigate("/polls")}>
              <BarChart2 color="#bb0000" />
              <span>Polls</span>
              {pollCount > 0 && <CountBadge>{pollCount}</CountBadge>}
            </PillButton>

            <ActionLink onClick={handleRefresh}>
              <RefreshCw
                style={{
                  animation: refreshing ? "spin 1s linear infinite" : "none",
                }}
              />
              {refreshing ? "" : "All"}
            </ActionLink>
          </NavGroup>
        </HeaderContent>
      </StickyHeader>

      <Container>
        {/* Cards - These scroll normally */}
        <CardsContainer>
          <VideoCard videoId="vPqeafmzYAY" label="Spotlight" />

          {leaders.slice(0, 6).map((leader, index) => {
            const handleNav = () => {
              const id = leader.leader_id || leader.id;
              if (onSelect) onSelect(leader);
              if (id) navigate(`/leader/${id}`);
            };

            const displayImage =
              leader.image_url ||
              (leader.images && leader.images.length > 0
                ? leader.images[0].image_url
                : null) ||
              leader.image;

            return (
              <BaseCard key={leader.leader_id || index} onClick={handleNav}>
                <div
                  style={{
                    position: "absolute",
                    top: 6,
                    left: 6,
                    background: "#bb0000",
                    color: "white",
                    padding: "2px 5px",
                    borderRadius: "4px",
                    fontSize: "8px",
                    fontWeight: "900",
                    zIndex: 5,
                  }}
                >
                  {leader.party || "IND"}
                </div>

                <LeaderImageContainer>
                  <StyledImg
                    src={displayImage}
                    alt={leader.name}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&background=f1f5f9&color=BB0000&bold=true`;
                    }}
                  />
                </LeaderImageContainer>

                <div
                  style={{
                    padding: "6px 8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "800",
                      color: "#0f172a",
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "80px",
                      }}
                    >
                      {leader.name}
                    </span>
                    {leader.verification && (
                      <CheckCircle size={10} color="#3b82f6" fill="#3b82f644" />
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1px",
                        fontSize: "9px",
                        fontWeight: "700",
                        color: "#64748b",
                      }}
                    >
                      <Users size={8} /> {formatNum(leader.followers || 0)}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1px",
                        fontSize: "9px",
                        fontWeight: "700",
                        color: "#64748b",
                      }}
                    >
                      <Eye size={8} /> {formatNum(leader.views || 0)}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "1px",
                      paddingTop: "2px",
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "9px",
                        fontWeight: "800",
                        color: "#bb0000",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "60px",
                      }}
                    >
                      {leader.current_position || "Ldr"}
                    </div>
                    <div
                      style={{
                        fontSize: "8px",
                        fontWeight: "600",
                        color: "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        gap: "1px",
                      }}
                    >
                      <MapPin size={6} /> {leader.county?.slice(0, 3) || "Ken"}
                    </div>
                  </div>
                </div>
              </BaseCard>
            );
          })}

          {endVideos.map((vid, i) => (
            <VideoCard key={`end-vid-${i}`} videoId={vid} label="Trending" />
          ))}
        </CardsContainer>
      </Container>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default TrendingSection;
