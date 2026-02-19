import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TrendingUp, Users, MapPin, Star, Target, Hash, Search } from 'lucide-react';
import TrendingHashtagsModal from './tredingHashtagModal';
import TrendingSearchesModal from './treadingSearchModal';

// Kenyan-themed colors
const KENYA_COLORS = {
  primary: '#BB0000',
  accent: '#006600',
  highlight: '#FFFFFF',
  neutral: '#6B7280',
  background: '#F8FAFC'
};

// Party colors
const PARTY_COLORS = {
  'UDA': '#BB0000',
  'ODM': '#006600',
  'WIPER': '#8B5CF6',
  'INDEPENDENT': '#6B7280',
  'JUBILEE': '#FFD700'
};

const Container = styled.div`
  margin: 20px 0;
  padding: 0 15px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid ${KENYA_COLORS.primary}20;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${KENYA_COLORS.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const TrendsButton = styled.button`
  background: ${props => props.$variant === 'search' ? KENYA_COLORS.primary : KENYA_COLORS.accent};
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$variant === 'search' ? '#990000' : '#004400'};
    transform: translateY(-1px);
  }
`;

const CardsContainer = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 10px 5px 20px;
  scrollbar-width: thin;
  scrollbar-color: ${KENYA_COLORS.primary}40 transparent;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${KENYA_COLORS.primary}40;
    border-radius: 2px;

    &:hover {
      background: ${KENYA_COLORS.primary}60;
    }
  }
`;

const TrendingCard = styled.div`
  min-width: 200px;
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    border-color: ${props => PARTY_COLORS[props.$party] || KENYA_COLORS.neutral}40;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const AvatarContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid ${props => {
    const color = PARTY_COLORS[props.$party] || KENYA_COLORS.neutral;
    return color;
  }};
  background: ${props => props.$image ? `url("${props.$image}") center/cover no-repeat` : '#f3f4f6'};
`;

const PartyBadge = styled.div`
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
  background: ${props => {
    const color = PARTY_COLORS[props.$party] || KENYA_COLORS.neutral;
    return `${color}15`;
  }};
  color: ${props => PARTY_COLORS[props.$party] || KENYA_COLORS.neutral};
  border: 1px solid ${props => {
    const color = PARTY_COLORS[props.$party] || KENYA_COLORS.neutral;
    return `${color}30`;
  }};
`;

const RankBadge = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${props => {
    if (props.$rank === 1) return KENYA_COLORS.primary;
    if (props.$rank === 2) return KENYA_COLORS.accent;
    if (props.$rank === 3) return '#8B4513';
    return KENYA_COLORS.neutral;
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  position: absolute;
  top: -8px;
  left: -8px;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
`;

const LeaderInfo = styled.div`
  flex: 1;
  margin-bottom: 15px;
`;

const LeaderName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #333;
  margin-bottom: 6px;
  line-height: 1.3;
`;

const Position = styled.div`
  font-size: 11px;
  color: ${KENYA_COLORS.neutral};
  margin-bottom: 8px;
  font-weight: 500;
`;

const Location = styled.div`
  font-size: 10px;
  color: ${KENYA_COLORS.neutral}90;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 15px;
`;

const StatItem = styled.div`
  text-align: center;
  background: #f9fafb;
  border-radius: 8px;
  padding: 8px 4px;
  border: 1px solid #e5e7eb;
`;

const StatValue = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 9px;
  color: ${KENYA_COLORS.neutral};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PositionStatus = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: ${props => props.$status === 'incumbent' ? KENYA_COLORS.accent : KENYA_COLORS.primary};
  background: ${props => props.$status === 'incumbent' ? 'rgba(0, 102, 0, 0.1)' : 'rgba(187, 0, 0, 0.1)'};
  padding: 4px 8px;
  border-radius: 10px;
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const LoadingCard = styled.div`
  min-width: 200px;
  height: 240px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 12px;
  flex-shrink: 0;

  @keyframes loading {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: ${KENYA_COLORS.primary};
  font-size: 14px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${KENYA_COLORS.neutral};
  font-size: 14px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  min-width: 100%;

  p {
    margin-bottom: 15px;
  }
`;

const TrendingSection = ({ 
  onSelect, 
  title = "Trending Leaders",
  showTrendsButton = true,
  postId = null,
  onSearchSelect
}) => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHashtagsModal, setShowHashtagsModal] = useState(false);
  const [showSearchesModal, setShowSearchesModal] = useState(false);

  const fetchLeaders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:8006/api/v1/leaders/leaders');
      const data = await response.json();

      if (data && Array.isArray(data.data)) {
        const formattedLeaders = data.data.map((leader, index) => {
          let imageUrl = leader.profilePhoto || leader.image_url || '';
          if (!imageUrl && leader.name) {
            const nameForAvatar = encodeURIComponent(leader.name.split(' ').slice(0, 2).join(' '));
            const partyColor = PARTY_COLORS[leader.party]?.replace('#', '') || '6B7280';
            imageUrl = `https://ui-avatars.com/api/?name=${nameForAvatar}&background=${partyColor}&color=fff&size=200&bold=true`;
          }

          const position = leader.position || '';
          const isIncumbent = position.toLowerCase().includes('member of parliament') || 
                            position.toLowerCase().includes('senator') ||
                            position.toLowerCase().includes('governor');
          const isContesting = position.toLowerCase().includes('aspiring') || 
                             position.toLowerCase().includes('candidate');

          return {
            id: leader.id || `leader-${index}`,
            name: leader.name || 'Unknown Leader',
            party: leader.party || 'INDEPENDENT',
            position: position || 'Political Leader',
            county: leader.county || 'Kenya',
            image_url: imageUrl,
            approval_rating: leader.approval || Math.floor(Math.random() * 30) + 50,
            followers: leader.followers || Math.floor(Math.random() * 50000) + 10000,
            views: leader.views || Math.floor(Math.random() * 50000) + 10000,
            status: isIncumbent ? 'incumbent' : isContesting ? 'contesting' : 'politician'
          };
        });

        const sortedLeaders = formattedLeaders
          .sort((a, b) => b.followers - a.followers)
          .slice(0, 6)
          .map((leader, index) => ({
            ...leader,
            rank: index + 1
          }));

        setLeaders(sortedLeaders);
      } else {
        setLeaders([]);
      }
    } catch (err) {
      console.error('Error fetching leaders:', err);
      setError('Failed to load trending leaders');
      setLeaders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  const handleLeaderClick = (leader) => {
    if (onSelect) {
      onSelect(leader);
    }
  };

  const handleHashtagsClick = () => {
    setShowHashtagsModal(true);
  };

  const handleSearchesClick = () => {
    setShowSearchesModal(true);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>{title}</Title>
          {showTrendsButton && (
            <ButtonGroup>
              <TrendsButton disabled $variant="hashtag">
                <Hash size={12} />
                #Trends
              </TrendsButton>
              <TrendsButton disabled $variant="search">
                <Search size={12} />
                Searches
              </TrendsButton>
            </ButtonGroup>
          )}
        </Header>
        <CardsContainer>
          {[1, 2, 3, 4].map(i => <LoadingCard key={i} />)}
        </CardsContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>{title}</Title>
          {showTrendsButton && (
            <ButtonGroup>
              <TrendsButton onClick={handleHashtagsClick} $variant="hashtag">
                <Hash size={12} />
                #Trends
              </TrendsButton>
              <TrendsButton onClick={handleSearchesClick} $variant="search">
                <Search size={12} />
                Searches
              </TrendsButton>
            </ButtonGroup>
          )}
        </Header>
        <ErrorMessage>
          {error}
        </ErrorMessage>
      </Container>
    );
  }

  if (leaders.length === 0) {
    return (
      <Container>
        <Header>
          <Title>
            <TrendingUp size={16} />
            {title}
          </Title>
          {showTrendsButton && (
            <ButtonGroup>
              <TrendsButton onClick={handleHashtagsClick} $variant="hashtag">
                <Hash size={12} />
                #Trends
              </TrendsButton>
              <TrendsButton onClick={handleSearchesClick} $variant="search">
                <Search size={12} />
                Searches
              </TrendsButton>
            </ButtonGroup>
          )}
        </Header>
        <NoDataMessage>
          <p>No trending leaders data available yet.</p>
          <p style={{ fontSize: '12px', color: KENYA_COLORS.neutral }}>
            Be the first to engage with political leaders!
          </p>
        </NoDataMessage>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <Header>
          <Title>
            <TrendingUp size={16} />
            {title}
          </Title>
          {showTrendsButton && (
            <ButtonGroup>
              <TrendsButton onClick={handleHashtagsClick} $variant="hashtag">
                <Hash size={12} />
                #Trends
              </TrendsButton>
              <TrendsButton onClick={handleSearchesClick} $variant="search">
                <Search size={12} />
                Searches
              </TrendsButton>
            </ButtonGroup>
          )}
        </Header>

        <CardsContainer>
          {leaders.map((leader) => (
            <TrendingCard 
              key={leader.id} 
              $party={leader.party}
              onClick={() => handleLeaderClick(leader)}
            >
              <CardHeader>
                <AvatarContainer>
                  <Avatar 
                    $image={leader.image_url} 
                    $party={leader.party}
                  >
                    <RankBadge $rank={leader.rank}>
                      {leader.rank}
                    </RankBadge>
                  </Avatar>
                  <LeaderInfo>
                    <LeaderName>
                      {leader.name}
                    </LeaderName>
                    <Position>{leader.position}</Position>
                    <Location>
                      <MapPin size={10} />
                      {leader.county}
                    </Location>
                    <PositionStatus $status={leader.status}>
                      <Target size={8} />
                      {leader.status === 'incumbent' ? 'Incumbent' : 
                       leader.status === 'contesting' ? 'Contesting' : 'Politician'}
                    </PositionStatus>
                  </LeaderInfo>
                </AvatarContainer>
                <PartyBadge $party={leader.party}>
                  {leader.party}
                </PartyBadge>
              </CardHeader>

              <Stats>
                <StatItem>
                  <StatValue>
                    <Star size={10} />
                    {leader.approval_rating}%
                  </StatValue>
                  <StatLabel>Approval</StatLabel>
                </StatItem>

                <StatItem>
                  <StatValue>
                    <Users size={10} />
                    {formatNumber(leader.followers)}
                  </StatValue>
                  <StatLabel>Followers</StatLabel>
                </StatItem>

                <StatItem>
                  <StatValue>
                    {formatNumber(leader.views)}
                  </StatValue>
                  <StatLabel>Views</StatLabel>
                </StatItem>
              </Stats>
            </TrendingCard>
          ))}
        </CardsContainer>
      </Container>

      {/* Trending Hashtags Modal */}
      <TrendingHashtagsModal 
        isOpen={showHashtagsModal}
        onClose={() => setShowHashtagsModal(false)}
        postId={postId}
      />

      {/* Trending Searches Modal */}
      <TrendingSearchesModal
        isOpen={showSearchesModal}
        onClose={() => setShowSearchesModal(false)}
        onSearchSelect={onSearchSelect}
      />
    </>
  );
};

export default TrendingSection;