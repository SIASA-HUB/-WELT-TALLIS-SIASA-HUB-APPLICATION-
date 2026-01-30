import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import axios from 'axios';
import { TrendingUp, Users, FileText, Zap, MapPin, Award, ChevronRight, Flag, Star    } from 'react-feather';

// --- Animations ---
const slideIn = keyframes`
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
  }
  50% {
    box-shadow: 0 0 25px rgba(255, 255, 255, 0.4);
  }
`;

// --- Kenyan Theme Colors ---
const KENYA_THEME = {
  primary: '#BB0000',
  secondary: '#000000',
  accent: '#006600',
  background: '#F8FAFC',
  border: '#E2E8F0',
  white: '#FFFFFF'
};

// --- Party Colors with Better Gradients ---
const PARTY_COLORS = {
  'UDA': {
    primary: '#BB0000',
    gradient: 'linear-gradient(135deg, #BB0000 0%, #FF4444 100%)',
    light: 'rgba(187, 0, 0, 0.15)'
  },
  'ODM': {
    primary: '#006600',
    gradient: 'linear-gradient(135deg, #006600 0%, #00AA44 100%)',
    light: 'rgba(0, 102, 0, 0.15)'
  },
  'WIPER': {
    primary: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
    light: 'rgba(139, 92, 246, 0.15)'
  },
  'FORD-KENYA': {
    primary: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    light: 'rgba(16, 185, 129, 0.15)'
  },
  'INDEPENDENT': {
    primary: '#6B7280',
    gradient: 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)',
    light: 'rgba(107, 114, 128, 0.15)'
  },
  'JUBILEE': {
    primary: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFE55C 100%)',
    light: 'rgba(255, 215, 0, 0.15)'
  }
};

// --- Styled Components ---
const TrendingContainer = styled.div`
  margin: 20px 0;
  padding: 0 20px;
  position: relative;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 800;
  color: ${KENYA_THEME.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 60px;
    height: 3px;
    background: ${KENYA_THEME.primary};
    border-radius: 3px;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${KENYA_THEME.primary};
  color: white;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 25px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #E05555;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(187, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CardsContainer = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 10px 5px 25px;
  scrollbar-width: thin;
  scrollbar-color: ${KENYA_THEME.primary}20 transparent;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${KENYA_THEME.primary}40;
    border-radius: 3px;
    
    &:hover {
      background: ${KENYA_THEME.primary}60;
    }
  }
`;

// --- Kenyan Flag Ad Card Component ---
const KenyaAdCard = styled.div`
  min-width: 200px;
  background: 
    linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7)),
    url('/image/flag.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 20px;
  padding: 20px;
  color: white;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 260px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.5);
    
    &:before {
      opacity: 0.3;
    }
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 70%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 3s infinite;
    opacity: 0.2;
    transition: opacity 0.3s ease;
  }
`;

const AdBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1));
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 20px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  gap: 5px;
  z-index: 2;
`;

const AdTitle = styled.h4`
  font-size: 24px;
  font-weight: 900;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: white;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
  position: relative;
  z-index: 2;
`;

const AdSubtitle = styled.p`
  font-size: 13px;
  margin: 0 0 20px 0;
  opacity: 0.95;
  line-height: 1.5;
  font-weight: 500;
  position: relative;
  z-index: 2;
  max-width: 180px;
`;

const AdButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(20px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 15px;
  padding: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  z-index: 2;
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.2));
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.6);
  }
`;

// --- IMPROVED Leader Card with Better Image Background ---
const LeaderCard = styled.div`
  min-width: 200px;
  background: ${props => {
    if (props.$image) {
      return `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7)), url(${props.$image})`;
    }
    const partyColor = PARTY_COLORS[props.$party] || PARTY_COLORS.INDEPENDENT;
    return partyColor.gradient;
  }};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 20px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  animation: ${slideIn} 0.5s ease-out;
  animation-delay: ${props => props.$delay || '0s'};
  animation-fill-mode: both;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 260px;
  border: 2px solid ${props => {
    const partyColor = PARTY_COLORS[props.$party] || PARTY_COLORS.INDEPENDENT;
    return props.$rank <= 3 ? `${partyColor.primary}80` : 'rgba(255, 255, 255, 0.1)';
  }};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);

  /* Subtle shine effect */
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 60%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left 0.7s ease;
  }

  &:hover {
    transform: translateY(-8px) scale(1.03);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    
    &:before {
      left: 100%;
    }
    
    .party-badge {
      transform: scale(1.1);
      background: rgba(255, 255, 255, 0.25);
    }
    
    .rank-badge {
      animation: ${glow} 1.5s infinite;
    }
  }

  /* Top 3 cards get special treatment */
  ${props => props.$rank === 1 && css`
    border: 3px solid #FFD700;
    animation: ${float} 3s ease-in-out infinite;
    box-shadow: 0 15px 40px rgba(255, 215, 0, 0.3);
  `}
  
  ${props => props.$rank === 2 && css`
    border: 3px solid #C0C0C0;
    box-shadow: 0 15px 40px rgba(192, 192, 192, 0.2);
  `}
  
  ${props => props.$rank === 3 && css`
    border: 3px solid #CD7F32;
    box-shadow: 0 15px 40px rgba(205, 127, 50, 0.2);
  `}
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  position: relative;
  z-index: 2;
`;

const PartyBadge = styled.div`
  font-size: 11px;
  font-weight: 800;
  padding: 6px 14px;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
`;

const RankBadge = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => {
    if (props.$rank === 1) return 'radial-gradient(circle at 30% 30%, #FFD700, #FFAA00)';
    if (props.$rank === 2) return 'radial-gradient(circle at 30% 30%, #C0C0C0, #A0A0A0)';
    if (props.$rank === 3) return 'radial-gradient(circle at 30% 30%, #CD7F32, #B3692B)';
    return 'rgba(255, 255, 255, 0.2)';
  }};
  color: ${props => props.$rank <= 3 ? 'white' : '#1a202c'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 900;
  backdrop-filter: blur(10px);
  border: 2px solid ${props => {
    if (props.$rank === 1) return 'rgba(255, 255, 255, 0.5)';
    if (props.$rank === 2) return 'rgba(255, 255, 255, 0.4)';
    if (props.$rank === 3) return 'rgba(255, 255, 255, 0.4)';
    return 'rgba(255, 255, 255, 0.2)';
  }};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
`;

const LeaderInfo = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
`;

const LeaderName = styled.div`
  font-size: 18px;
  font-weight: 900;
  margin-bottom: 8px;
  line-height: 1.3;
  text-shadow: 0 3px 10px rgba(0, 0, 0, 0.8);
  letter-spacing: 0.5px;
`;

const Position = styled.div`
  font-size: 12px;
  margin-bottom: 15px;
  opacity: 0.95;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.6);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 15px;
  position: relative;
  z-index: 2;
`;

const StatItem = styled.div`
  text-align: center;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 10px 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
`;

const StatValue = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-bottom: 3px;
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 600;
`;

const ViewButton = styled.button`
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 15px;
  color: white;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 0.5px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
`;

const LoadingCard = styled.div`
  min-width: 200px;
  height: 260px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 20px;
  flex-shrink: 0;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${KENYA_THEME.primary};
  font-size: 14px;
  
  button {
    margin-top: 12px;
    padding: 12px 24px;
    background: ${KENYA_THEME.primary};
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
    
    &:hover {
      background: #E05555;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(187, 0, 0, 0.2);
    }
  }
`;

// --- Main Component ---
export default function TrendingSection({ 
  onSelect, 
  title = "🔥 Trending Leaders",
  showRefresh = true
}) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  // Fetch leaders from backend API using axios
  const fetchLeaders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('https://decide-building-indicator-world.trycloudflare.com/leaders/get', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      if (response.data && Array.isArray(response.data.data)) {
        console.log('API Response:', response.data.data);
        
        const leadersWithTrending = response.data.data.map((leader, index) => {
          const trendingScore = calculateTrendingScore(leader);
          
          // Ensure we have an image URL
          let imageUrl = leader.profilePhoto || leader.image_url || '';
          if (!imageUrl && leader.name) {
            // Generate avatar based on name
            const nameForAvatar = encodeURIComponent(leader.name);
            const partyColor = leader.party || 'INDEPENDENT';
            const colorMap = {
              'UDA': 'BB0000',
              'ODM': '006600',
              'WIPER': '8B5CF6',
              'INDEPENDENT': '6B7280'
            };
            const color = colorMap[partyColor] || '6B7280';
            imageUrl = `https://ui-avatars.com/api/?name=${nameForAvatar}&background=${color}&color=fff&size=400&bold=true`;
          }

          return {
            id: leader.id || `leader-${index}`,
            name: leader.name || 'Unknown Leader',
            party: leader.party || 'INDEPENDENT',
            position: leader.position || 'Political Leader',
            county: leader.county || 'Kenya',
            image_url: imageUrl,
            approval_rating: leader.approval || Math.floor(Math.random() * 30) + 50,
            followers: leader.followers || Math.floor(Math.random() * 50000) + 10000,
            engagements: leader.engagements || leader.views || Math.floor(Math.random() * 200) + 50,
            trending_score: trendingScore
          };
        });

        const sortedLeaders = leadersWithTrending
          .sort((a, b) => b.trending_score - a.trending_score)
          .map((leader, index) => ({ 
            ...leader, 
            rank: index + 1,
            // Add trending indicator for top 3
            trending: index < 3
          }))
          .slice(0, 8);

        console.log('Sorted leaders:', sortedLeaders);
        setLeaders(sortedLeaders);
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching leaders:', err);
      setError(err.message || 'Failed to load trending leaders');
    } finally {
      setLoading(false);
    }
  };

  // Calculate trending score
  const calculateTrendingScore = (leader) => {
    let score = 0;
    score += (leader.approval || 50) * 0.4;
    const followerScore = Math.min(100, (leader.followers || 0) / 50000 * 100);
    score += followerScore * 0.3;
    const engagementScore = Math.min(100, (leader.engagements || 0) / 200 * 100);
    score += engagementScore * 0.2;
    score += Math.random() * 10;
    return Math.min(100, score);
  };

  useEffect(() => {
    fetchLeaders();
    const interval = setInterval(fetchLeaders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLeaderClick = (leader) => {
    if (onSelect) {
      onSelect(leader);
    }
  };

  const handleAdClick = () => {
    window.open('https://www.president.go.ke/', '_blank');
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num;
  };

  if (loading && leaders.length === 0) {
    return (
      <TrendingContainer>
        <SectionHeader>
          <SectionTitle>{title}</SectionTitle>
          {showRefresh && <RefreshButton disabled>Loading...</RefreshButton>}
        </SectionHeader>
        <CardsContainer ref={containerRef}>
          {[1, 2, 3, 4].map(i => <LoadingCard key={i} />)}
        </CardsContainer>
      </TrendingContainer>
    );
  }

  if (error && leaders.length === 0) {
    return (
      <TrendingContainer>
        <SectionHeader>
          <SectionTitle>{title}</SectionTitle>
          {showRefresh && (
            <RefreshButton onClick={fetchLeaders}>
              <Zap size={14} />
              Retry
            </RefreshButton>
          )}
        </SectionHeader>
        <ErrorMessage>
          <div>Failed to load trending leaders</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {error}
          </div>
          <button onClick={fetchLeaders}>Try Again</button>
        </ErrorMessage>
      </TrendingContainer>
    );
  }

  return (
    <TrendingContainer>
      <SectionHeader>
        <SectionTitle>
          <Users size={20} color="#FF6B35" />
          {title}
        </SectionTitle>
        {showRefresh && (
          <RefreshButton onClick={fetchLeaders}>
            <Zap size={14} />
            Refresh
          </RefreshButton>
        )}
      </SectionHeader>
      
      <CardsContainer ref={containerRef}>
        {/* Kenyan Flag Ad Card */}
        <KenyaAdCard onClick={handleAdClick}>
          <AdBadge>
            <Flag size={12} />
            National Unity
          </AdBadge>
          <div>
            <AdTitle>YES WE CAN</AdTitle>
            <AdSubtitle>
              Building a united, prosperous Kenya together through civic participation
            </AdSubtitle>
          </div>
          <AdButton>Join the Movement</AdButton>
        </KenyaAdCard>

        {/* Trending Leaders with Improved Cards */}
        {leaders.map((leader, index) => {
          const partyData = PARTY_COLORS[leader.party] || PARTY_COLORS.INDEPENDENT;
          
          return (
            <LeaderCard
              key={leader.id}
              $image={leader.image_url}
              $party={leader.party}
              $rank={leader.rank}
              $delay={`${(index + 1) * 0.1}s`}
              onClick={() => handleLeaderClick(leader)}
            >
              <CardHeader>
                <PartyBadge className="party-badge">
                  {leader.party}
                </PartyBadge>
                <RankBadge className="rank-badge" $rank={leader.rank}>
                  {leader.rank}
                </RankBadge>
              </CardHeader>
              
              <LeaderInfo>
                <LeaderName>
                  {leader.name}
                  {leader.rank <= 3 && (
                    <span style={{ 
                      marginLeft: '6px',
                      fontSize: '12px',
                      color: leader.rank === 1 ? '#FFD700' : 
                            leader.rank === 2 ? '#C0C0C0' : '#CD7F32'
                    }}>
                      {leader.rank === 1 ? '🥇' : leader.rank === 2 ? '🥈' : '🥉'}
                    </span>
                  )}
                </LeaderName>
                
                <Position>
                  <MapPin size={12} />
                  {leader.position}, {leader.county}
                </Position>
                
                <StatsGrid>
                  <StatItem>
                    <StatValue>
                      <TrendingUp size={12} />
                      {leader.approval_rating}%
                    </StatValue>
                    <StatLabel>Approval</StatLabel>
                  </StatItem>
                  
                  <StatItem>
                    <StatValue>
                      <Users size={12} />
                      {formatNumber(leader.followers)}
                    </StatValue>
                    <StatLabel>Followers</StatLabel>
                  </StatItem>
                  
                  <StatItem>
                    <StatValue>
                      <FileText size={12} />
                      {leader.engagements}
                    </StatValue>
                    <StatLabel>Posts</StatLabel>
                  </StatItem>
                </StatsGrid>
              </LeaderInfo>
              
              <ViewButton>
                View Profile
                <ChevronRight size={14} />
              </ViewButton>
            </LeaderCard>
          );
        })}
      </CardsContainer>
    </TrendingContainer>
  );
}