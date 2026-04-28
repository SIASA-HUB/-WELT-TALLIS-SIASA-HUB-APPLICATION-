import React, { useState, useEffect, memo } from "react";
import { Helmet } from "react-helmet-async";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  TrendingUp,
  MapPin,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import api from "../../../api/api";
import { buildImageUrl } from "../../../utils/imageUtils";



const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;


const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
`;

const Sparkline = ({ data, width = 40, height = 20, color = "#22c55e" }) => {
  // If no data, generate random upward trend
  const points = data && data.length > 0 ? data : [10, 15, 22, 30, 35, 42, 48];
  const maxVal = Math.max(...points);
  const minVal = Math.min(...points);
  const range = maxVal - minVal || 1;

  const step = width / (points.length > 1 ? points.length - 1 : 1);
  const pathPoints = points.map((val, idx) => {
    const x = idx * step;
    const cleanVal = isNaN(val) ? minVal : val;
    const y = height - ((cleanVal - minVal) / range) * height;
    return `${isNaN(x) ? 0 : x},${isNaN(y) ? 0 : y}`;
  }).join(" ");

  const areaPoints = `0,${height} ${pathPoints} ${width},${height}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#sparkGradient)" stroke="none" />
      <polyline points={pathPoints} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// --- STYLED COMPONENTS ---
const Section = styled.div`
  padding: 12px 1px;
  background: #000;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  h2 {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: #e4e4e7;
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
  }

  .badge {
    background: rgba(34, 197, 94, 0.15);
    padding: 2px 0px;
    border-radius: 12px;
    font-size: 8px;
    font-weight: 600;
    color: #22c55e;
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .location-badge {
    background: rgba(34, 197, 94, 0.2);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 8px;
    font-weight: 600;
    color: #22c55e;
    display: flex;
    align-items: center;
    gap: 3px;
  }
`;

const ManifestosContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SkeletonRow = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 10px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0px;
  animation: ${pulse} 1.5s infinite;
  gap: 12px;

  .skeleton-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s infinite;
  }

  .skeleton-content {
    flex: 1;
  }

  .skeleton-name {
    width: 50%;
    height: 10px;
    background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s infinite;
    border-radius: 4px;
    margin-bottom: 6px;
  }

  .skeleton-title {
    width: 70%;
    height: 8px;
    background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s infinite;
    border-radius: 4px;
  }
`;

const ManifestoCard = styled.div`
  background: ${(props) =>
    props.$isLocal ? "rgba(34, 197, 94, 0.04)" : "rgba(255, 255, 255, 0.01)"};
  border-radius: 12px;
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${(props) => (props.$isLocal ? "rgba(34, 197, 94, 0.15)" : "rgba(255,255,255,0.03)")};

  &:hover {
    background: ${(props) =>
    props.$isLocal ? "rgba(34, 197, 94, 0.08)" : "rgba(255, 255, 255, 0.03)"};
    border-color: ${(props) => (props.$isLocal ? "#22c55e" : "rgba(255,255,255,0.08)")};
    
    .action-icon {
      color: #22c55e;
      transform: translateX(4px);
    }
  }
`;

const CardContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RankBadge = styled.div`
  font-size: 11px;
  font-weight: 800;
  color: ${(props) => (props.$top3 ? "#22c55e" : "rgba(255,255,255,0.3)")};
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.$top3 ? "rgba(34, 197, 94, 0.1)" : "transparent")};
  border-radius: 50%;
  font-family: 'Outfit', sans-serif;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
`;

const LeaderName = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #a1a1aa;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;

  .party {
    color: #22c55e;
    background: rgba(34, 197, 94, 0.1);
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 8px;
    font-weight: 600;
  }

  .local-tag {
    color: #22c55e;
    background: rgba(34, 197, 94, 0.2);
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 7px;
    font-weight: 700;
  }
`;

const ManifestoText = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #f4f4f6;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrendWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
  margin-left: 0px;
  
  .trend-icon {
    width: 14px;
    height: 14px;
    color: #22c55e;
  }

  .vote-badge {
    font-size: 10px;
    font-weight: 900;
    color: #ffffff;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 3px 8px;
    border-radius: 6px;
    white-space: nowrap;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    animation: ${(props) => props.$isRising ? css`${pulseGlow} 2s infinite` : 'none'};
  }

  .vote-badge-new {
    font-size: 10px;
    font-weight: 900;
    color: #ffffff;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 3px 8px;
    border-radius: 6px;
    white-space: nowrap;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .active-tag {
    font-size: 8px;
    font-weight: 900;
    color: #10b981;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-top: 2px;
    display: flex;
    align-items: center;
    gap: 3px;
    
    &::before {
      content: '';
      width: 4px;
      height: 4px;
      background: #10b981;
      border-radius: 50%;
      animation: ${pulse} 1s infinite;
    }
  }
`;

const ActionIcon = styled.div`
  color: rgba(255, 255, 255, 0.15);
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 4px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 30px 20px;
  color: #71717a;
  svg { margin-bottom: 10px; opacity: 0.5; }
  p { font-size: 11px; margin: 0; }
  .sub { font-size: 9px; margin-top: 4px; color: #22c55e; }
`;

const SeeAllLink = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  padding-top: 6px;
  border-top: 1px solid rgba(255,255,255,0.05);
  
  button {
    background: none;
    border: none;
    color: #22c55e;
    font-size: 9px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 1;
    }
  }
`;

// Generate random upward trend data
const generateSparkData = () => {
  let val = 20 + Math.random() * 20;
  const points = [];
  for (let i = 0; i < 5; i++) {
    val += Math.random() * 8 + 1; // always rising
    val = Math.min(80, val);
    points.push(Math.floor(val));
  }
  return points;
};

const TrendingManifestos = ({ userId, currentUser, limit = 5, onEmpty }) => {
  const [manifestos, setManifestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGeneralTrending = async () => {
      try {
        await api.getWithCache(`/leaders/manifestos/trending?limit=${limit * 2}`, (data) => {
          if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
            const shuffled = [...data.data].sort(() => 0.5 - Math.random());
            setManifestos(shuffled.slice(0, limit));
          } else {
            if (onEmpty) onEmpty();
            setManifestos([]);
          }
        });
      } catch (e) {
        console.error("Fallback error:", e);
        if (onEmpty) onEmpty();
      }
    };

    const fetchManifestos = async () => {
      try {
        setLoading(true);
        setError(null);
        const finalUserId = userId || currentUser?.user_id || localStorage.getItem("user_id");

        let url = finalUserId
          ? `/leaders/manifestos/personalized?user_id=${finalUserId}&limit=${limit * 3}`
          : `/leaders/manifestos/trending?limit=${limit * 3}`;

        await api.getWithCache(url, (data) => {
          if (!data) return;
          const fetchedData = Array.isArray(data.data) ? data.data : [];

          if (data.success && fetchedData.length > 0) {
            // Shuffle and take requested limit
            const shuffled = [...fetchedData].sort(() => 0.5 - Math.random());
            const sliced = shuffled.slice(0, limit);
            setManifestos(sliced);
            if (data.meta?.user_location) setUserLocation(data.meta.user_location);
          } else if (finalUserId) {
            // If personalized was tried and was empty, fallback to general trending
            fetchGeneralTrending();
          } else {
            if (onEmpty) onEmpty();
            setManifestos([]);
          }
        });
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to connect");
        // Don't call onEmpty yet, let the user see the error state first
      } finally {
        setLoading(false);
      }
    };
    fetchManifestos();
  }, [userId, currentUser, limit, onEmpty]);

  const getAvatarUrl = (leaderName, imageUrl, manifestoImage) => {
    const preferredImage = manifestoImage || imageUrl;
    const builtUrl = buildImageUrl(preferredImage);
    if (builtUrl) return builtUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(leaderName?.charAt(0) || "C")}&background=22c55e&color=fff&size=64&bold=true&length=1`;
  };

  const isLocalLeader = (manifesto) => {
    if (!userLocation) return false;
    if (userLocation.ward && manifesto.leader_ward === userLocation.ward) return true;
    if (userLocation.constituency && manifesto.leader_constituency === userLocation.constituency) return true;
    if (userLocation.county && manifesto.leader_county === userLocation.county) return true;
    return false;
  };

  const getDisplayText = (manifesto) => {
    // 1. Check main_agenda first
    if (typeof manifesto.main_agenda === "string" && manifesto.main_agenda.length > 10) {
      return manifesto.main_agenda.substring(0, 80);
    }

    // 2. Try parsing agenda_items
    if (manifesto.agenda_items) {
      try {
        const items = typeof manifesto.agenda_items === "string"
          ? JSON.parse(manifesto.agenda_items)
          : manifesto.agenda_items;

        if (Array.isArray(items) && items.length > 0) {
          const firstItem = items[0];
          return typeof firstItem === "string"
            ? firstItem
            : (firstItem.title || firstItem.description || "Policy Agenda");
        }

        if (typeof items === "object" && items !== null) {
          return items.title || items.description || "📜 View Policy";
        }

        if (typeof items === "string") return items;
      } catch (e) {
        console.warn("Manifesto parse error", e);
      }
    }

    return "📜 New Policy Agenda";
  };

  const handleCardClick = (leaderSlug, leaderId) => {
    if (leaderSlug) {
      navigate(`/leader/${leaderSlug}`);
    } else if (leaderId) {
      navigate(`/leader/${leaderId}`);
    }
  };

  const handleViewAll = () => {
    navigate("/manifestos");
  };

  // SEO: dynamic meta for this section (optional)
  const sectionTitle = "Trending Manifestos | SiasaHub";
  const sectionDescription = "Explore the latest and most popular political manifestos from aspirants across Kenya. See who is rising in the polls.";

  if (loading) {
    return (
      <Section>
        <Helmet>
          <title>{sectionTitle}</title>
          <meta name="description" content={sectionDescription} />
        </Helmet>
        <Header>
          <h2>📈 TRENDING MANIFESTOS</h2>
          <span className="badge">LOADING</span>
        </Header>
        <LoadingState>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonRow key={i}>
              <div className="skeleton-avatar" />
              <div className="skeleton-content">
                <div className="skeleton-name" />
                <div className="skeleton-title" />
              </div>
            </SkeletonRow>
          ))}
        </LoadingState>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <Helmet>
          <title>{sectionTitle}</title>
        </Helmet>
        <Header><h2>📈 TRENDING MANIFESTOS</h2></Header>
        <EmptyState><AlertCircle size={20} /><p>{error}</p></EmptyState>
      </Section>
    );
  }

  if (!manifestos.length) {
    return (
      <Section>
        <Helmet>
          <title>{sectionTitle}</title>
        </Helmet>
        <Header><h2>📈 TRENDING MANIFESTOS</h2></Header>
        <EmptyState>
          <Sparkles size={20} />
          <p>No trending manifestos yet</p>
          <p className="sub">Check back soon</p>
        </EmptyState>
      </Section>
    );
  }

  return (
    <Section>
      <Helmet>
        <title>{sectionTitle}</title>
        <meta name="description" content={sectionDescription} />
      </Helmet>
      <Header>
        <h2>📈 TRENDING MANIFESTOS</h2>
        <div style={{ display: "flex", gap: "6px" }}>
          {userLocation?.county && (
            <span className="location-badge">
              <MapPin size={8} /> {userLocation.ward || userLocation.constituency || userLocation.county}
            </span>
          )}
          <span className="badge">TOP {manifestos.length}</span>
        </div>
      </Header>

      <ManifestosContainer>
        {manifestos.map((m, i) => {
          const local = isLocalLeader(m);
          const displayText = getDisplayText(m);
          const sparkData = generateSparkData();
          const leaderSlug = m.leader_slug || m.slug;
          const leaderId = m.leader_id;

          return (
            <ManifestoCard
              key={m.manifesto_id || i}
              $isLocal={local}
              onClick={() => handleCardClick(leaderSlug, leaderId)}
            >
              <CardContent>
                <RankBadge $top3={i < 3}>
                  {String(i + 1).padStart(2, '0')}
                </RankBadge>
                <Avatar>
                  <img
                    src={getAvatarUrl(m.leader_name, m.leader_image, m.cover_image || m.image)}
                    alt={m.leader_name}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.leader_name?.charAt(0) || "C")}&background=22c55e&color=fff&size=64&bold=true&length=1`;
                    }}
                  />
                </Avatar>
                <Info>
                  <LeaderName>
                    {m.leader_name || "Candidate"}
                    {m.leader_party && <span className="party">{m.leader_party}</span>}
                    {local && <span className="local-tag">YOUR AREA</span>}
                  </LeaderName>
                  <ManifestoText>{displayText}</ManifestoText>
                </Info>
                <TrendWrapper>
                  {(() => {
                    const votes = m.total_votes || m.approve_count || m.vote_count || 0;
                    const isRising = votes >= 5;
                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <TrendingUp className="trend-icon" style={{ color: isRising ? '#22c55e' : '#f59e0b' }} />
                          <Sparkline
                            data={isRising ? generateSparkData() : [10, 12, 11, 13, 14]}
                            width={32} height={14}
                            color={isRising ? '#22c55e' : '#f59e0b'}
                          />
                        </div>
                        <span className={isRising ? 'vote-badge' : 'vote-badge-new'} $isRising={isRising}>
                          {votes} {votes === 1 ? 'Vote' : 'Votes'}
                        </span>
                        {votes > 0 && <span className="active-tag">Active</span>}
                      </>
                    );
                  })()}
                </TrendWrapper>
                <ActionIcon className="action-icon">
                  <ChevronRight size={14} />
                </ActionIcon>
              </CardContent>
            </ManifestoCard>
          );
        })}
      </ManifestosContainer>
      <SeeAllLink>
        <button onClick={handleViewAll}>
          View all manifestos <ChevronRight size={10} />
        </button>
      </SeeAllLink>
    </Section>
  );
};

export default memo(TrendingManifestos);