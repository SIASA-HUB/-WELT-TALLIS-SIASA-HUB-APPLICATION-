import React from 'react';
import styled from 'styled-components';
import { Card, Badge, Button } from 'react-bootstrap';
import {
  MapPin,
  Users,
  Award,
  TrendingUp,
  BarChart2,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  FileText
} from 'react-feather';

const KENYA_THEME = {
  primary: '#BB0000',
  secondary: '#000000',
  accent: '#006600',
  background: '#F8FAFC',
  border: '#E2E8F0',
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
  },
  support: '#008F59',
  opposition: '#E05555',
  neutral: '#6B7280',
  
  partyColors: {
    'UDA': '#BB0000',
    'ODM': '#006600',
    'WIPER': '#8B5CF6',
    'FORD-KENYA': '#10B981',
    'JUBILEE': '#FFD700',
    'NARC-KENYA': '#EC4899',
    'INDEPENDENT': '#6B7280',
  },
  
  gradients: {
    support: 'linear-gradient(90deg, #008F59 0%, #00C853 100%)',
    opposition: 'linear-gradient(90deg, #E05555 0%, #FF5252 100%)',
    kenya: 'linear-gradient(135deg, #BB0000 0%, #006600 100%)',
  }
};

// Styled components for LeaderCard
const StyledLeaderCard = styled(Card)`
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  height: 100%;
  cursor: pointer;
  overflow: hidden;
  border-top: 4px solid ${props => KENYA_THEME.partyColors[props.party] || KENYA_THEME.primary};
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(187, 0, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    border-radius: 12px;
  }
`;

const CardHeader = styled.div`
  position: relative;
  padding: 2rem 1.5rem 1.5rem;
  min-height: 200px;
  background: ${props => props.bgImage ? 
    `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6)), url(${props.bgImage})` : 
    `linear-gradient(135deg, ${KENYA_THEME.primary}80 0%, ${KENYA_THEME.accent}80 100%)`};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1.25rem 1.25rem;
    min-height: 180px;
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0.4) 50%,
      rgba(0, 0, 0, 0.7) 100%
    );
    z-index: 1;
  }
`;

const ContentOverlay = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const VerificationBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: ${KENYA_THEME.accent};
  background: white;
  border-radius: 50%;
  padding: 0.4rem;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  
  @media (max-width: 768px) {
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.3rem;
  }
`;

const ProfileImage = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${props => props.src ? `url(${props.src})` : `url('https://ui-avatars.com/api/?name=${props.name || 'Leader'}&background=${KENYA_THEME.primary.replace('#', '')}&color=fff&bold=true&size=100')`};
  background-size: cover;
  background-position: center;
  border: 4px solid white;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    border: 2px solid ${props => KENYA_THEME.partyColors[props.party] || KENYA_THEME.primary};
  }
  
  @media (max-width: 768px) {
    width: 90px;
    height: 90px;
  }
`;

const LeaderName = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.25rem;
  text-align: center;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const PositionText = styled.p`
  color: rgba(255, 255, 255, 0.95);
  font-weight: 700;
  font-size: 1rem;
  text-align: center;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const PartyBadge = styled(Badge)`
  background-color: ${props => {
    const color = KENYA_THEME.partyColors[props.party] || KENYA_THEME.neutral;
    return `${color}FF`;
  }};
  color: white;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 0.4rem 1.2rem;
  border-radius: 20px;
  display: inline-block;
  border: 2px solid white;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  margin-bottom: 0.75rem;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 0.3rem 1rem;
  }
`;

const LocationText = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    gap: 0.25rem;
  }
`;

const ApprovalMeter = styled.div`
  background: ${KENYA_THEME.background};
  border-radius: 12px;
  padding: 1rem;
  margin: 1rem 0;
  border: 1px solid ${KENYA_THEME.border};
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    margin: 0.75rem 0;
  }
`;

const ApprovalBar = styled.div`
  height: 10px;
  background: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const ApprovalFill = styled.div`
  height: 100%;
  width: ${props => props.percentage}%;
  background: ${props => props.percentage > 50 ? 
    KENYA_THEME.gradients.support : 
    KENYA_THEME.gradients.opposition};
  border-radius: 5px;
`;

const ApprovalText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
`;

const ApprovalPercent = styled.span`
  font-weight: 800;
  color: ${KENYA_THEME.text.primary};
  font-size: 1rem;
`;

const ApprovalLabel = styled.span`
  color: ${KENYA_THEME.text.secondary};
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin: 1.25rem 0;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
    margin: 1rem 0;
  }
`;

const StatItem = styled.div`
  text-align: center;
  padding: 0.75rem 0.5rem;
  background: ${props => props.highlight ? `${KENYA_THEME.support}15` : KENYA_THEME.background};
  border-radius: 10px;
  border: 1px solid ${props => props.highlight ? `${KENYA_THEME.support}30` : KENYA_THEME.border};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const StatValue = styled.div`
  font-weight: 800;
  font-size: 1rem;
  color: ${props => props.highlight ? KENYA_THEME.support : KENYA_THEME.text.primary};
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  color: ${KENYA_THEME.text.secondary};
  margin-top: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 0.65rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
    margin-top: 1rem;
  }
`;

const LikeButton = styled(Button)`
  flex: 1;
  border-radius: 10px;
  padding: 0.65rem 0.5rem;
  background-color: ${props => props.active ? KENYA_THEME.support : KENYA_THEME.background};
  border-color: ${props => props.active ? KENYA_THEME.support : KENYA_THEME.border};
  color: ${props => props.active ? 'white' : KENYA_THEME.text.secondary};
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.active ? '#008F59' : KENYA_THEME.background};
    border-color: ${props => props.active ? '#008F59' : KENYA_THEME.primary};
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.5rem;
  }
`;

const DislikeButton = styled(Button)`
  flex: 1;
  border-radius: 10px;
  padding: 0.65rem 0.5rem;
  background-color: ${props => props.active ? KENYA_THEME.opposition : KENYA_THEME.background};
  border-color: ${props => props.active ? KENYA_THEME.opposition : KENYA_THEME.border};
  color: ${props => props.active ? 'white' : KENYA_THEME.text.secondary};
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.active ? '#E05555' : KENYA_THEME.background};
    border-color: ${props => props.active ? '#E05555' : KENYA_THEME.primary};
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.5rem;
  }
`;

const ViewInsightsButton = styled(Button)`
  flex: 2;
  border-radius: 10px;
  padding: 0.65rem 0.5rem;
  background: ${KENYA_THEME.gradients.kenya};
  border: none;
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(187, 0, 0, 0.25);
  }
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.5rem;
  }
`;

const CardBody = styled(Card.Body)`
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

// Main LeaderCard Component
const LeaderCard = ({ 
  leader, 
  onLike, 
  onDislike, 
  onViewInsights,
  isLiked,
  isDisliked 
}) => {
  const {
    id,
    name,
    position,
    party,
    county,
    approval_rating: approvalRating = 0,
    verified = false,
    image_url: imageUrl,
    // Optional stats
    engagements = 0,
    followers = 0,
    performance = 0,
    likes = 0,
    dislikes = 0
  } = leader;

  return (
    <StyledLeaderCard party={party}>
      <CardHeader bgImage={imageUrl}>
        {verified && (
          <VerificationBadge>
            <Award size={18} />
          </VerificationBadge>
        )}
        
        <ContentOverlay>
          <ProfileImage 
            src={imageUrl} 
            name={name}
            party={party}
          />
          
          <LeaderName>{name}</LeaderName>
          <PositionText>{position}</PositionText>
          
          <div className="d-flex justify-content-center mb-1">
            <PartyBadge party={party}>
              {party || 'Independent'}
            </PartyBadge>
          </div>
          
          <LocationText>
            <MapPin size={14} />
            {county || 'Kenya'}
          </LocationText>
        </ContentOverlay>
      </CardHeader>
      
      <CardBody>
        {/* Approval Meter */}
        <ApprovalMeter>
          <ApprovalBar>
            <ApprovalFill percentage={approvalRating} />
          </ApprovalBar>
          <ApprovalText>
            <ApprovalLabel>Approval Rating</ApprovalLabel>
            <ApprovalPercent>{approvalRating}%</ApprovalPercent>
          </ApprovalText>
        </ApprovalMeter>
        
        {/* Quick Stats */}
        <QuickStats>
          <StatItem>
            <StatValue>
              <TrendingUp size={14} style={{ marginRight: '4px' }} />
              {performance}%
            </StatValue>
            <StatLabel>Performance</StatLabel>
          </StatItem>
          
          <StatItem highlight>
            <StatValue highlight>
              <Users size={14} style={{ marginRight: '4px' }} />
              {followers}
            </StatValue>
            <StatLabel>Followers</StatLabel>
          </StatItem>
          
          <StatItem>
            <StatValue>
              <BarChart2 size={14} style={{ marginRight: '4px' }} />
              {engagements}
            </StatValue>
            <StatLabel>Engagements</StatLabel>
          </StatItem>
        </QuickStats>
        
        {/* Action Buttons */}
        <ActionButtons>
          <LikeButton
            active={isLiked}
            onClick={(e) => {
              e.stopPropagation();
              onLike(id);
            }}
          >
            <ThumbsUp size={16} />
            {likes}
          </LikeButton>
          
          <DislikeButton
            active={isDisliked}
            onClick={(e) => {
              e.stopPropagation();
              onDislike(id);
            }}
          >
            <ThumbsDown size={16} />
            {dislikes}
          </DislikeButton>
          
          <ViewInsightsButton
            onClick={(e) => {
              e.stopPropagation();
              onViewInsights(id);
            }}
          >
            <FileText size={16} />
            Insights
          </ViewInsightsButton>
        </ActionButtons>
      </CardBody>
    </StyledLeaderCard>
  );
};

export default LeaderCard;