import React, { useState, useEffect, memo } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ChevronRight,
  Zap,
  Flame,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react";

// --- API CONSTANT ---
const API_BASE_URL = "";

// --- ANIMATIONS ---
const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
`;

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
`;

const ScrollContainer = styled.div`
  max-height: 480px;
  overflow-y: auto;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #22c55e;
    border-radius: 10px;
  }
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

    .skeleton-stats {
      width: 120px;
      height: 7px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
      margin-top: 3px;
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
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  gap: 10px;

  &:hover {
    background: rgba(34, 197, 94, 0.05);
    transform: translateX(2px);

    .action-icon {
      color: #22c55e;
      transform: translateX(2px);
    }
  }
`;

const Index = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.25);
  min-width: 28px;
  font-family: monospace;

  ${ManifestoRow}:hover & {
    color: #22c55e;
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
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
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  color: #71717a;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;

  .party {
    color: #22c55e;
    background: rgba(34, 197, 94, 0.1);
    padding: 1px 5px;
    border-radius: 8px;
    font-size: 6px;
    font-weight: 600;
  }

  .position {
    color: #e11d48;
    background: rgba(225, 29, 72, 0.1);
    padding: 1px 5px;
    border-radius: 8px;
    font-size: 6px;
    font-weight: 600;
  }
`;

const ManifestoTitle = styled.h4`
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const EngagementPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 3px;
  flex-wrap: wrap;

  span {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 7px;
    color: #5a5a66;
  }

  .trend-score {
    color: #22c55e;
    background: rgba(34, 197, 94, 0.1);
    padding: 1px 6px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 7px;
  }
`;

const ActionIcon = styled.div`
  color: rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 14px;
    height: 14px;
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

const TrendingManifestos = () => {
  const [manifestos, setManifestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          `${API_BASE_URL}/api/v1/leaders/manifestos/trending?limit=20`,
        );

        if (res.data?.success) {
          let manifestosData = [];

          if (res.data?.data?.manifestos) {
            manifestosData = res.data.data.manifestos;
          } else if (Array.isArray(res.data?.data)) {
            manifestosData = res.data.data;
          } else if (res.data?.data) {
            manifestosData = [res.data.data];
          }

          if (manifestosData.length > 0) {
            setManifestos(manifestosData);
          } else {
            setError("No manifestos available");
          }
        } else {
          setError(res.data?.message || "Failed to fetch manifestos");
        }
      } catch (err) {
        console.error("Backend Error:", err);
        setError(err.response?.data?.message || "Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getAvatarUrl = (leaderName, imageUrl) => {
    if (imageUrl) return imageUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(leaderName?.charAt(0) || "C")}&background=22c55e&color=fff&size=64&bold=true&length=1`;
  };

  if (loading) {
    return (
      <Section>
        <Header>
          <h2>
            <Zap size={10} fill="#e11d48" /> TRENDING AGENDA
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
                <div className="skeleton-stats" />
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
            <Zap size={10} fill="#e11d48" /> TRENDING AGENDA
          </h2>
        </Header>
        <EmptyState>
          <TrendingUp size={24} />
          <p>{error}</p>
          <p className="sub">Pull to refresh</p>
        </EmptyState>
      </Section>
    );
  }

  if (!manifestos.length) {
    return (
      <Section>
        <Header>
          <h2>
            <Zap size={10} fill="#e11d48" /> TRENDING AGENDA
          </h2>
        </Header>
        <EmptyState>
          <Flame size={24} />
          <p>No manifestos yet</p>
          <p className="sub">Check back soon</p>
        </EmptyState>
      </Section>
    );
  }

  return (
    <Section>
      <Header>
        <h2>
          <Zap size={10} fill="#e11d48" /> TRENDING AGENDA
        </h2>
        <div style={{ display: "flex", gap: "6px" }}>
          <span className="badge">
            <Flame size={8} /> HOT
          </span>
          <span className="count-badge">{manifestos.length}</span>
        </div>
      </Header>

      <ScrollContainer>
        {manifestos.slice(0, 20).map((m, i) => (
          <ManifestoRow
            key={m.id || m.manifesto_id || i}
            onClick={() => navigate(`/leaders/${m.leader_id}`)}
          >
            <Index>#{i + 1}</Index>

            <Avatar>
              <img
                src={getAvatarUrl(m.leader_name, m.leader_image)}
                alt={m.leader_name}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.leader_name?.charAt(0) || "C")}&background=22c55e&color=fff&size=64&bold=true&length=1`;
                }}
              />
            </Avatar>

            <Content>
              <LeaderName>
                {m.leader_name || "Candidate"}
                {m.position && <span className="position">{m.position}</span>}
                {m.party && <span className="party">{m.party}</span>}
              </LeaderName>
              <ManifestoTitle>
                {m.title || m.main_agenda || "Policy Agenda 2027"}
              </ManifestoTitle>
              <EngagementPreview>
                {m.likes > 0 && (
                  <span>
                    <Heart size={7} /> {formatNumber(m.likes)}
                  </span>
                )}
                {m.views > 0 && (
                  <span>
                    <Eye size={7} /> {formatNumber(m.views)}
                  </span>
                )}
                {m.comments > 0 && (
                  <span>
                    <MessageCircle size={7} /> {formatNumber(m.comments)}
                  </span>
                )}
                {m.trending_score > 0 && (
                  <span className="trend-score">
                    <Flame size={6} /> {m.trending_score}
                  </span>
                )}
              </EngagementPreview>
            </Content>

            <ActionIcon className="action-icon">
              <ChevronRight size={12} />
            </ActionIcon>
          </ManifestoRow>
        ))}
      </ScrollContainer>
    </Section>
  );
};

export default memo(TrendingManifestos);
