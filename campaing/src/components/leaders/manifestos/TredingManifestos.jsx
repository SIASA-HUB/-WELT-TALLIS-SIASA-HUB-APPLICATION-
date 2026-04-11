import React, { useState, useEffect, memo } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronRight, Zap, Flame, Sparkles } from "lucide-react";
import API_BASE_URL from "./apiConfig";

// --- HELPER: Build image URL ---
const buildImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  if (imageUrl.startsWith("/uploads")) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  if (imageUrl.startsWith("uploads")) {
    return `${API_BASE_URL}/${imageUrl}`;
  }
  return `${API_BASE_URL}/${imageUrl}`;
};

// --- ANIMATIONS ---
const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

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
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #e11d48;
    display: flex;
    align-items: center;
    gap: 6px;
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

  .count-badge {
    background: rgba(225, 29, 72, 0.15);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 8px;
    font-weight: 600;
    color: #e11d48;
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

// NO SCROLL - just normal flow
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
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  animation: ${pulse} 1.5s infinite;
  gap: 10px;

  .skeleton-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
  }

  .skeleton-index {
    width: 24px;
    height: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  .skeleton-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .skeleton-name {
      width: 80px;
      height: 8px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
    }

    .skeleton-title {
      width: 160px;
      height: 11px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
    }
  }

  .skeleton-action {
    width: 24px;
    height: 24px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
  }
`;

const ManifestoRow = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background: ${(props) =>
    props.$isLocal ? "rgba(34, 197, 94, 0.08)" : "rgba(255, 255, 255, 0.02)"};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 12px;
  border-left: ${(props) => (props.$isLocal ? "3px solid #22c55e" : "none")};

  &:hover {
    background: rgba(34, 197, 94, 0.1);
    transform: translateX(4px);

    .action-icon {
      color: #22c55e;
      transform: translateX(4px);
    }
  }
`;

const Index = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.3);
  min-width: 30px;
  font-family: monospace;

  ${ManifestoRow}:hover & {
    color: #22c55e;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const LeaderName = styled.div`
  font-size: 9px;
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
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #71717a;

  svg {
    margin-bottom: 12px;
    opacity: 0.5;
    width: 28px;
    height: 28px;
  }

  p {
    font-size: 11px;
    margin: 0;
  }

  .sub {
    font-size: 9px;
    margin-top: 6px;
    color: #22c55e;
  }
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

        const finalUserId =
          userId || currentUser?.user_id || localStorage.getItem("user_id");
        // Limit to 10 items
        let url = `/manifestos/trending?limit=10`;
        if (finalUserId) {
          url += `&user_id=${finalUserId}`;
        }

        const res = await axios.get(`${API_BASE_URL}${url}`, {
          withCredentials: true,
        });

        if (res.data.success) {
          setManifestos(res.data.data || []);
          if (res.data.meta?.user_location) {
            setUserLocation(res.data.meta.user_location);
          }
        } else {
          setError("No manifestos available");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to connect");
      } finally {
        setLoading(false);
      }
    };

    fetchManifestos();
  }, [userId, currentUser]);

  const getAvatarUrl = (leaderName, imageUrl) => {
    const builtUrl = buildImageUrl(imageUrl);
    if (builtUrl) {
      return builtUrl;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(leaderName?.charAt(0) || "C")}&background=22c55e&color=fff&size=80&bold=true&length=2`;
  };

  const isLocalLeader = (manifesto) => {
    if (!userLocation) return false;
    if (userLocation.ward && manifesto.ward === userLocation.ward) return true;
    if (
      userLocation.constituency &&
      manifesto.constituency === userLocation.constituency
    )
      return true;
    if (userLocation.county && manifesto.county === userLocation.county)
      return true;
    return false;
  };

  const getDisplayText = (manifesto) => {
    if (manifesto.main_agenda && manifesto.main_agenda.length > 10) {
      return manifesto.main_agenda;
    }
    if (manifesto.agenda_items) {
      try {
        const items =
          typeof manifesto.agenda_items === "string"
            ? JSON.parse(manifesto.agenda_items)
            : manifesto.agenda_items;
        if (Array.isArray(items) && items.length > 0) {
          return items[0];
        }
      } catch (e) {
        return manifesto.agenda_items;
      }
    }
    return "Policy Agenda 2027";
  };

  if (loading) {
    return (
      <Section>
        <Header>
          <h2>
            <Sparkles size={10} fill="#e11d48" /> MANIFESTO HIGHLIGHTS
          </h2>
          <span className="badge">
            <Flame size={8} /> LOADING
          </span>
        </Header>
        <LoadingState>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonRow key={i}>
              <div className="skeleton-avatar" />
              <div className="skeleton-index" />
              <div className="skeleton-content">
                <div className="skeleton-name" />
                <div className="skeleton-title" />
              </div>
              <div className="skeleton-action" />
            </SkeletonRow>
          ))}
        </LoadingState>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <Header>
          <h2>
            <Sparkles size={10} fill="#e11d48" /> MANIFESTO HIGHLIGHTS
          </h2>
        </Header>
        <EmptyState>
          <Zap size={24} />
          <p>{error}</p>
        </EmptyState>
      </Section>
    );
  }

  if (!manifestos.length) {
    return (
      <Section>
        <Header>
          <h2>
            <Sparkles size={10} fill="#e11d48" /> MANIFESTO HIGHLIGHTS
          </h2>
        </Header>
        <EmptyState>
          <Flame size={24} />
          <p>No manifesto highlights yet</p>
          <p className="sub">Check back soon</p>
        </EmptyState>
      </Section>
    );
  }

  return (
    <Section>
      <Header>
        <h2>
          <Sparkles size={10} fill="#e11d48" /> MANIFESTO HIGHLIGHTS
        </h2>
        <div style={{ display: "flex", gap: "6px" }}>
          {userLocation && userLocation.county && (
            <span className="location-badge">
              📍{" "}
              {userLocation.ward ||
                userLocation.constituency ||
                userLocation.county}
            </span>
          )}
          <span className="badge">
            <Flame size={8} /> TOP {manifestos.length}
          </span>
        </div>
      </Header>

      <ManifestosContainer>
        {manifestos.map((m, i) => {
          const local = isLocalLeader(m);
          const displayText = getDisplayText(m);
          const imageUrl = m.leader_image || m.image_url;

          return (
            <ManifestoRow
              key={m.id || m.manifesto_id || i}
              $isLocal={local}
              onClick={() => navigate(`/leaders/${m.leader_id}`)}
            >
              <Index>#{i + 1}</Index>

              <Avatar>
                <img
                  src={getAvatarUrl(m.leader_name, imageUrl)}
                  alt={m.leader_name}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.leader_name?.charAt(0) || "C")}&background=22c55e&color=fff&size=80&bold=true&length=2`;
                  }}
                />
              </Avatar>

              <Content>
                <LeaderName>
                  {m.leader_name || "Candidate"}
                  {m.position && <span className="position">{m.position}</span>}
                  {m.party && <span className="party">{m.party}</span>}
                  {local && <span className="local-tag">📍 LOCAL</span>}
                </LeaderName>
                <ManifestoText>{displayText}</ManifestoText>
              </Content>

              <ActionIcon className="action-icon">
                <ChevronRight size={16} />
              </ActionIcon>
            </ManifestoRow>
          );
        })}
      </ManifestosContainer>
    </Section>
  );
};

export default memo(TrendingManifestos);
