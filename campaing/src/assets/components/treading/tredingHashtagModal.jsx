import React, { useState } from 'react';
import styled from 'styled-components';
import { X, TrendingUp, Hash, ArrowUp, ArrowDown, MessageCircle, Share2 } from 'lucide-react';

const KENYA_COLORS = {
  primary: '#BB0000',
  accent: '#006600',
  highlight: '#FFFFFF',
  neutral: '#6B7280',
  background: '#F8FAFC'
};

// Modal Overlay
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

// Modal Container
const ModalContainer = styled.div`
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Modal Header
const ModalHeader = styled.div`
  background: linear-gradient(135deg, ${KENYA_COLORS.primary}, ${KENYA_COLORS.accent});
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
`;

// Modal Content
const ModalContent = styled.div`
  padding: 20px;
  overflow-y: auto;
  max-height: calc(90vh - 80px);
`;

// Stats Container
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 25px;
`;

const StatCard = styled.div`
  background: ${KENYA_COLORS.background};
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  border: 1px solid #e5e7eb;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 900;
  color: ${props => props.$color || KENYA_COLORS.primary};
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${KENYA_COLORS.neutral};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatTrend = styled.div`
  font-size: 11px;
  color: ${props => props.$trend === 'up' ? KENYA_COLORS.accent : '#DC2626'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  margin-top: 5px;
`;

// Hashtag List
const HashtagList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const HashtagItem = styled.div`
  background: white;
  border-radius: 12px;
  padding: 15px;
  border: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: ${KENYA_COLORS.primary}30;
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${props => props.$sentiment === 'positive' ? KENYA_COLORS.accent : 
                         props.$sentiment === 'negative' ? '#DC2626' : KENYA_COLORS.primary};
    border-radius: 4px 0 0 4px;
  }
`;

const HashtagContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HashtagRank = styled.div`
  width: 30px;
  height: 30px;
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
  font-size: 14px;
  font-weight: 800;
`;

const HashtagInfo = styled.div`
  flex: 1;
`;

const HashtagText = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HashtagTopic = styled.div`
  font-size: 12px;
  color: ${KENYA_COLORS.neutral};
`;

const HashtagStats = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const HashtagCount = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${KENYA_COLORS.primary};
`;

const HashtagTrend = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$trend === 'up' ? KENYA_COLORS.accent : '#DC2626'};
`;

// Action Buttons
const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 25px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:first-child {
    background: ${KENYA_COLORS.primary};
    color: white;
    
    &:hover {
      background: #990000;
    }
  }

  &:last-child {
    background: ${KENYA_COLORS.background};
    color: ${KENYA_COLORS.primary};
    border: 1px solid #e5e7eb;
    
    &:hover {
      background: #f1f5f9;
    }
  }
`;

// Trending Hashtags Data
const trendingHashtags = [
  { 
    id: 1, 
    rank: 1,
    tag: '#RutoMustGo', 
    count: '1.4K', 
    trend: '+42%', 
    sentiment: 'negative',
    topic: 'Presidential Term Limits'
  },
  { 
    id: 2, 
    rank: 2,
    tag: '#2TermLimit', 
    count: '892', 
    trend: '+28%', 
    sentiment: 'neutral',
    topic: 'Constitutional Reforms'
  },
  { 
    id: 3, 
    rank: 3,
    tag: '#OneTermPresidency', 
    count: '756', 
    trend: '+15%', 
    sentiment: 'positive',
    topic: 'Governance Structure'
  },
  { 
    id: 4, 
    rank: 4,
    tag: '#IEBCReforms', 
    count: '623', 
    trend: '+35%', 
    sentiment: 'neutral',
    topic: 'Electoral Reforms'
  },
  { 
    id: 5, 
    rank: 5,
    tag: '#YouthInPolitics', 
    count: '512', 
    trend: '+22%', 
    sentiment: 'positive',
    topic: 'Youth Representation'
  },
  { 
    id: 6, 
    rank: 6,
    tag: '#FixTheEconomy', 
    count: '487', 
    trend: '+18%', 
    sentiment: 'negative',
    topic: 'Economic Issues'
  },
  { 
    id: 7, 
    rank: 7,
    tag: '#StopCorruption', 
    count: '423', 
    trend: '+12%', 
    sentiment: 'neutral',
    topic: 'Anti-Corruption'
  },
  { 
    id: 8, 
    rank: 8,
    tag: '#DevolutionWorks', 
    count: '389', 
    trend: '+8%', 
    sentiment: 'positive',
    topic: 'County Governance'
  },
];

const TrendingHashtagsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleHashtagClick = (hashtag) => {
    console.log('Hashtag clicked:', hashtag);
    // You can navigate to hashtag page or show more details
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Trending Hashtags on Siasa Hub',
        text: 'Check out the latest trending political hashtags in Kenya!',
        url: window.location.href,
      });
    } else {
      alert('Share feature not supported in your browser');
    }
  };

  const handleDiscuss = () => {
    alert('Discussion feature coming soon!');
  };

  // Calculate stats
  const stats = {
    totalMentions: trendingHashtags.reduce((sum, tag) => sum + parseInt(tag.count.replace('K', '000')) || 0, 0),
    trendingToday: trendingHashtags.filter(tag => parseInt(tag.trend.replace('+', '').replace('%', '')) > 20).length,
    topHashtag: trendingHashtags[0]?.tag || '#RutoMustGo'
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <TrendingUp size={24} />
            Today's Trending Hashtags
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalContent>
          <StatsContainer>
            <StatCard>
              <StatValue $color={KENYA_COLORS.primary}>
                {formatNumber(stats.totalMentions)}
              </StatValue>
              <StatLabel>Total Mentions</StatLabel>
              <StatTrend $trend="up">
                <ArrowUp size={12} />
                +24% Today
              </StatTrend>
            </StatCard>

            <StatCard>
              <StatValue $color={KENYA_COLORS.accent}>
                {stats.trendingToday}
              </StatValue>
              <StatLabel>Trending Now</StatLabel>
              <StatTrend $trend="up">
                <ArrowUp size={12} />
                +3 New
              </StatTrend>
            </StatCard>

            <StatCard>
              <StatValue $color="#8B5CF6">
                {trendingHashtags[0]?.count}
              </StatValue>
              <StatLabel>Top Hashtag</StatLabel>
              <StatTrend $trend="up">
                {trendingHashtags[0]?.trend}
              </StatTrend>
            </StatCard>
          </StatsContainer>

          <HashtagList>
            {trendingHashtags.map((hashtag) => (
              <HashtagItem 
                key={hashtag.id} 
                $sentiment={hashtag.sentiment}
                onClick={() => handleHashtagClick(hashtag)}
              >
                <HashtagContent>
                  <HashtagRank $rank={hashtag.rank}>
                    {hashtag.rank}
                  </HashtagRank>
                  <HashtagInfo>
                    <HashtagText>
                      <Hash size={14} />
                      {hashtag.tag}
                    </HashtagText>
                    <HashtagTopic>
                      {hashtag.topic}
                    </HashtagTopic>
                  </HashtagInfo>
                </HashtagContent>

                <HashtagStats>
                  <HashtagCount>
                    {hashtag.count}
                  </HashtagCount>
                  <HashtagTrend $trend={hashtag.trend.startsWith('+') ? 'up' : 'down'}>
                    {hashtag.trend.startsWith('+') ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    {hashtag.trend}
                  </HashtagTrend>
                </HashtagStats>
              </HashtagItem>
            ))}
          </HashtagList>

          <ActionButtons>
            <ActionButton onClick={handleDiscuss}>
              <MessageCircle size={16} />
              Join Discussion
            </ActionButton>
            <ActionButton onClick={handleShare}>
              <Share2 size={16} />
              Share Trends
            </ActionButton>
          </ActionButtons>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default TrendingHashtagsModal;