import React, { useState, useEffect, memo } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Eye,
  Heart,
  MessageCircle,
  Clock,
  MapPin,
  Sparkles,
  Flame,
  Zap,
  AlertCircle
} from "lucide-react";
import api from "../../../api/api";
import API from "../../../api/config";

// --- ANIMATIONS ---
const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// HELPER: Build image 
const buildImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl === "null") return null;

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Clean the path
  const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;

  return `${API.IMAGES}${cleanPath}`;
};

// --- STYLED COMPONENTS ---
const Section = styled.div`
  padding: 16px 12px;
  background: #000;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 8px;

  h2 {
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 6px;
    opacity: 0.8;
  }

  .badge {
    background: rgba(34, 197, 94, 0.15);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 8px;
    font-weight: 600;
    color: #22c55e;
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .trending-badge {
    background: rgba(255, 255, 255, 0.05);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 8px;
    font-weight: 600;
    color: #f8fafc;
    display: flex;
    align-items: center;
    gap: 3px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .location-badge {
    background: rgba(34, 197, 94, 0.2);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 7px;
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
  gap: 8px;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SkeletonRow = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  animation: ${pulse} 1.5s infinite;
  gap: 12px;

  .skeleton-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s infinite;
  }

  .skeleton-content {
    flex: 1;
  }

  .skeleton-name {
    width: 60%;
    height: 10px;
    background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s infinite;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .skeleton-title {
    width: 80%;
    height: 8px;
    background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s infinite;
    border-radius: 4px;
  }
`;

const ManifestoCard = styled.div`
  background: ${(props) =>
    props.$isLocal ? "linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(34, 197, 94, 0.01))" : "rgba(255, 255, 255, 0.01)"};
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${(props) => (props.$isLocal ? "rgba(34, 197, 94, 0.2)" : "rgba(255,255,255,0.03)")};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: none;
    background: ${(props) =>
    props.$isLocal ? "rgba(34, 197, 94, 0.08)" : "rgba(255, 255, 255, 0.03)"};
    border-color: ${(props) => (props.$isLocal ? "#22c55e" : "rgba(255,255,255,0.1)")};
    
    &::before {
      left: 100%;
    }
    
    .action-icon {
      color: #22c55e;
      transform: translateX(4px);
    }
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
`;

const RankBadge = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: ${(props) => (props.$top3 ? "#f8fafc" : "rgba(255,255,255,0.15)")};
  min-width: 20px;
  font-family: inherit;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  border: 1px solid rgba(255,255,255,0.1);

  .card-avatar {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    padding: 2px;
    background: linear-gradient(135deg, #22c55e, transparent);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }

  ${ManifestoCard}:hover &::after {
    opacity: 1;
  }
`;

const LiveBadge = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: #22c55e;
  border-radius: 50%;
  width: 10px;
  height: 10px;
  border: 2px solid #000;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const LeaderName = styled.div`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #71717a;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;

  .party {
    color: #22c55e;
    background: rgba(34, 197, 94, 0.1);
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 7px;
    font-weight: 600;
  }

  .position {
    color: #e11d48;
    background: rgba(225, 29, 72, 0.1);
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 7px;
    font-weight: 600;
  }

  .local-tag {
    color: #22c55e;
    background: rgba(34, 197, 94, 0.2);
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 6px;
    font-weight: 700;
    text-transform: uppercase;
  }
`;

const ManifestoText = styled.h4`
  font-size: 12px;
  font-weight: 500;
  color: #e4e4e7;
  margin: 0 0 4px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const HotIndicator = styled.div`
  background: rgba(34, 197, 94, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 7px;
  font-weight: 600;
  color: #22c55e;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: 6px;
  border: 1px solid rgba(34, 197, 94, 0.2);
`;

const ActionIcon = styled.div`
  color: rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #71717a;
  svg { margin-bottom: 12px; opacity: 0.5; }
  p { font-size: 11px; margin: 0; }
  .sub { font-size: 9px; margin-top: 6px; color: #22c55e; }
`;

const TrendingManifestos = ({ userId, currentUser }) => {
  const [manifestos, setManifestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchManifestos = async () => {
      try {
        setLoading(true);
        setError(null);
        const finalUserId = userId || currentUser?.user_id || localStorage.getItem("user_id");

        // Try personalized first if user is logged in
        let url = finalUserId
          ? `/leaders/manifestos/personalized?user_id=${finalUserId}&limit=15`
          : `/leaders/manifestos/trending?limit=30`; // Fetch more for randomization

        await api.getWithCache(url, (data) => {
          if (data.success && data.data) {
            let fetchedData = data.data || [];

            // Randomize for guests or to keep it fresh
            if (!finalUserId || fetchedData.length > 5) {
              fetchedData = [...fetchedData].sort(() => 0.5 - Math.random());
            }

            setManifestos(fetchedData.slice(0, 15));
            if (data.meta?.user_location) setUserLocation(data.meta.user_location);
          }
        });
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to connect");
      } finally {
        setLoading(false);
      }
    };
    fetchManifestos();
  }, [userId, currentUser]);

  const getAvatarUrl = (leaderName, imageUrl, manifestoImage) => {
    const preferredImage = manifestoImage || imageUrl;
    const builtUrl = buildImageUrl(preferredImage);
    if (builtUrl) return builtUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(leaderName?.charAt(0) || "C")}&background=22c55e&color=fff&size=80&bold=true&length=2`;
  };

  const isLocalLeader = (manifesto) => {
    if (!userLocation) return false;
    if (userLocation.ward && manifesto.leader_ward === userLocation.ward) return true;
    if (userLocation.constituency && manifesto.leader_constituency === userLocation.constituency) return true;
    if (userLocation.county && manifesto.leader_county === userLocation.county) return true;
    return false;
  };

  const getDisplayText = (manifesto) => {
    if (manifesto.main_agenda && manifesto.main_agenda.length > 10) {
      return manifesto.main_agenda.substring(0, 100);
    }
    if (manifesto.agenda_items) {
      try {
        const items = JSON.parse(manifesto.agenda_items);
        if (Array.isArray(items) && items.length > 0) {
          const firstItem = items[0];
          return firstItem.title || firstItem.description || "Policy Agenda";
        }
      } catch (e) {
        return manifesto.agenda_items;
      }
    }
    return "📜New Policy Agenda Announced";
  };

  const getRandomStats = () => ({
    views: Math.floor(Math.random() * 5000) + 100,
    likes: Math.floor(Math.random() * 500) + 10,
    comments: Math.floor(Math.random() * 100) + 5,
  });

  // FIX: Use slug for navigation, fallback to leader_id if slug missing
  const handleCardClick = (leaderSlug, leaderId) => {
    if (leaderSlug) {
      navigate(`/leaders/${leaderSlug}`);
    } else if (leaderId) {
      navigate(`/leaders/${leaderId}`);
    } else {
      console.warn("No slug or leader_id available");
    }
  };

  if (loading) {
    return (
      <Section>
        <Header>
          <h2>MANIFESTO HIGHLIGHTS</h2>
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
        <Header><h2>MANIFESTO HIGHLIGHTS</h2></Header>
        <EmptyState><AlertCircle size={24} /><p>{error}</p></EmptyState>
      </Section>
    );
  }

  if (!manifestos.length) {
    return (
      <Section>
        <Header><h2>MANIFESTO HIGHLIGHTS</h2></Header>
        <EmptyState><p>No manifesto highlights yet</p><p className="sub">Check back soon</p></EmptyState>
      </Section>
    );
  }

  return (
    <Section>
      <Header>
        <h2>MANIFESTO HIGHLIGHTS</h2>
        <div style={{ display: "flex", gap: "6px" }}>
          {userLocation?.county && <span className="location-badge"><MapPin size={8} /> {userLocation.ward || userLocation.constituency || userLocation.county}</span>}
          <span className="trending-badge">FEED</span>
          <span className="badge">TOP {manifestos.length}</span>
        </div>
      </Header>

      <ManifestosContainer>
        {manifestos.map((m, i) => {
          const local = isLocalLeader(m);
          const displayText = getDisplayText(m);
          const imageUrl = m.leader_image;
          const stats = getRandomStats();
          const isHot = i < 3;
          const timeAgo = i === 0 ? "2 min ago" : i === 1 ? "1 hour ago" : i === 2 ? "3 hours ago" : `${i + 5} hours ago`;

          // Use leader_slug if available, otherwise fallback to leader_id
          const leaderSlug = m.leader_slug || m.slug;
          const leaderId = m.leader_id;

          return (
            <ManifestoCard
              key={m.manifesto_id || i}
              $isLocal={local}
              onClick={() => handleCardClick(leaderSlug, leaderId)}
            >
              <CardHeader>
                <RankBadge $top3={i < 3}>
                  {String(i + 1).padStart(2, '0')}
                </RankBadge>
                <Avatar>
                  <div className="card-avatar">
                    <img
                      src={getAvatarUrl(m.leader_name, m.leader_image, m.cover_image || m.image)}
                      alt={m.leader_name}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.leader_name?.charAt(0) || "C")}&background=22c55e&color=fff&size=80&bold=true&length=2`;
                      }}
                    />
                  </div>
                  {isHot && <LiveBadge />}
                </Avatar>
                <Content>
                  <LeaderName>
                    {m.leader_name || "Candidate"}
                    {m.leader_position && <span className="position">{m.leader_position}</span>}
                    {m.leader_party && <span className="party">{m.leader_party}</span>}
                    {local && <span className="local-tag">YOUR AREA</span>}
                    {isHot && <HotIndicator>FEATURED</HotIndicator>}
                  </LeaderName>
                  <ManifestoText>{displayText}</ManifestoText>
                  <StatsRow>
                    <Stat><Eye size={10} /> {stats.views.toLocaleString()}</Stat>
                    <Stat><Heart size={10} /> {stats.likes.toLocaleString()}</Stat>
                    <Stat><MessageCircle size={10} /> {stats.comments}</Stat>
                    <Stat><Clock size={10} /> {timeAgo}</Stat>
                  </StatsRow>
                </Content>
                <ActionIcon className="action-icon">
                  <ChevronRight size={16} />
                </ActionIcon>
              </CardHeader>
            </ManifestoCard>
          );
        })}
      </ManifestosContainer>
    </Section>
  );
};

export default memo(TrendingManifestos);