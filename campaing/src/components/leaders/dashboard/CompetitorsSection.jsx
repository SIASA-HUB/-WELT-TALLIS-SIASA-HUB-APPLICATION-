// components/leaders/CompetitorsSection.jsx - Top Supporters Version
import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { 
  Users, 
  ShieldCheck, 
  MapPin, 
  Crown, 
  Star, 
  Heart, 
  Medal, 
  Award,
  Mail,
  ThumbsUp,
  TrendingUp
} from "lucide-react";
import axios from "axios";
import API from "../../../api/config";

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const glowGold = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(234, 179, 8, 0); }
  100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); }
`;

const Container = styled.div`
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 24px;
  padding: 24px;
  margin: 20px 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: white;
    display: flex;
    align-items: center;
    gap: 10px;
    
    svg {
      color: #fbbf24;
    }
  }

  .badge {
    background: rgba(245, 158, 11, 0.2);
    padding: 6px 12px;
    border-radius: 30px;
    font-size: 0.75rem;
    color: #fbbf24;
    font-weight: 600;
  }
`;

const SupportersGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SupporterCard = styled.div`
  background: ${props => {
    if (props.$rank === 1) return 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05))';
    if (props.$rank === 2) return 'linear-gradient(135deg, rgba(156, 163, 175, 0.15), rgba(156, 163, 175, 0.05))';
    if (props.$rank === 3) return 'linear-gradient(135deg, rgba(205, 127, 50, 0.15), rgba(205, 127, 50, 0.05))';
    return 'rgba(255, 255, 255, 0.03)';
  }};
  border: 1px solid ${props => {
    if (props.$rank === 1) return 'rgba(234, 179, 8, 0.3)';
    if (props.$rank === 2) return 'rgba(156, 163, 175, 0.3)';
    if (props.$rank === 3) return 'rgba(205, 127, 50, 0.3)';
    return 'rgba(255, 255, 255, 0.08)';
  }};
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.4s ease-out;
  animation-delay: ${props => props.$delay}s;

  &:hover {
    transform: translateX(4px);
    border-color: ${props => {
      if (props.$rank === 1) return 'rgba(234, 179, 8, 0.6)';
      return 'rgba(255, 255, 255, 0.2)';
    }};
    background: ${props => {
      if (props.$rank === 1) return 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(234, 179, 8, 0.08))';
      return 'rgba(255, 255, 255, 0.06)';
    }};
  }
`;

const RankBadge = styled.div`
  width: 50px;
  text-align: center;
  flex-shrink: 0;

  .rank-number {
    font-size: 1.5rem;
    font-weight: 800;
    background: ${props => {
      if (props.$rank === 1) return 'linear-gradient(135deg, #fbbf24, #f59e0b)';
      if (props.$rank === 2) return 'linear-gradient(135deg, #9ca3af, #6b7280)';
      if (props.$rank === 3) return 'linear-gradient(135deg, #cd7f32, #b87333)';
      return 'linear-gradient(135deg, #475569, #334155)';
    }};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .rank-icon {
    width: 32px;
    height: 32px;
    margin: 0 auto;
  }
`;

const Avatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  box-shadow: ${props => props.$rank === 1 ? '0 0 20px rgba(234, 179, 8, 0.4)' : 'none'};
  animation: ${props => props.$rank === 1 ? glowGold : 'none'} 2s infinite;
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;

  .name {
    font-weight: 700;
    font-size: 1rem;
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 4px;
  }

  .email {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 6px;
    
    svg {
      width: 12px;
      height: 12px;
    }
  }

  .location {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const Stats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;

  .score {
    font-size: 1.1rem;
    font-weight: 800;
    color: #fbbf24;
  }

  .interactions {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .verified-badge {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
    padding: 2px 8px;
    border-radius: 20px;
    font-size: 0.65rem;
    font-weight: 600;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.5);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.5);
  
  svg {
    margin-bottom: 12px;
    opacity: 0.5;
  }
`;

const CompetitorsSection = ({ leader }) => {
  const [supporters, setSupporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSupporters, setTotalSupporters] = useState(0);

  useEffect(() => {
    const fetchTopSupporters = async () => {
      const leaderId = leader?.leader_id || leader?.id;
      if (!leaderId) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API.LEADERS}/${leaderId}/top-supporters`, {
          params: { limit: 10 }
        });
        
        if (res.data.success) {
          setSupporters(res.data.data || []);
          setTotalSupporters(res.data.total || 0);
        }
      } catch (err) {
        console.error("Error fetching top supporters:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSupporters();
  }, [leader]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={28} fill="#fbbf24" color="#fbbf24" />;
    if (rank === 2) return <Medal size={28} color="#9ca3af" />;
    if (rank === 3) return <Medal size={28} color="#cd7f32" />;
    return <Award size={24} color="#475569" />;
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const formatScore = (score) => {
    if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
    return score.toString();
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <TrendingUp size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
          <div>Loading top supporters...</div>
        </LoadingState>
      </Container>
    );
  }

  if (supporters.length === 0) {
    return (
      <Container>
        <EmptyState>
          <Heart size={40} />
          <div>No supporters yet. Be the first to support!</div>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <SectionHeader>
        <h3>
          <Crown size={20} fill="#fbbf24" />
          Top Supporters
        </h3>
        <div className="badge">
          {totalSupporters} Total Supporters
        </div>
      </SectionHeader>

      <SupportersGrid>
        {supporters.map((supporter, index) => (
          <SupporterCard 
            key={supporter.user_id || index} 
            $rank={index + 1}
            $delay={index * 0.05}
          >
            <RankBadge $rank={index + 1}>
              {index < 3 ? (
                <div className="rank-icon">{getRankIcon(index + 1)}</div>
              ) : (
                <div className="rank-number">#{index + 1}</div>
              )}
            </RankBadge>

            <Avatar $rank={index + 1}>
              {supporter.avatar_url ? (
                <img src={supporter.avatar_url} alt={supporter.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                getInitials(supporter.name || supporter.email)
              )}
            </Avatar>

            <Info>
              <div className="name">
                {supporter.name || "Anonymous Supporter"}
                {index === 0 && <Star size={14} fill="#fbbf24" color="#fbbf24" />}
              </div>
              {supporter.email && (
                <div className="email">
                  <Mail size={12} />
                  {supporter.email}
                </div>
              )}
              {supporter.location && (
                <div className="location">
                  <MapPin size={12} />
                  {supporter.location}
                </div>
              )}
            </Info>

            <Stats>
              <div className="score">
                {formatScore(supporter.interaction_score)}
              </div>
              <div className="interactions">
                <ThumbsUp size={10} />
                {supporter.total_interactions} interactions
              </div>
              {supporter.is_verified === 1 && (
                <div className="verified-badge">
                  <ShieldCheck size={10} style={{ display: 'inline', marginRight: 2 }} />
                  Verified
                </div>
              )}
            </Stats>
          </SupporterCard>
        ))}
      </SupportersGrid>
    </Container>
  );
};

export default CompetitorsSection;
