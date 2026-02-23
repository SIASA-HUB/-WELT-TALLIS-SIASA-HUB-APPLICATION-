// PostHeader.js - FIXED VERSION
import React from 'react';
import styled from 'styled-components';
import { User, MapPin, Clock, Wifi } from 'lucide-react';

const KENYA_COLORS = {
  primary: '#BB0000',
  accent: '#006600',
  highlight: '#FFFFFF',
  neutral: '#6B7280',
};

const HeaderContainer = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-bottom: 1px solid rgba(187, 0, 0, 0.1);
  background: linear-gradient(to right, ${KENYA_COLORS.primary}08, ${KENYA_COLORS.accent}08);
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${KENYA_COLORS.primary}, ${KENYA_COLORS.accent});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: bold;
  color: #333;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const PartyBadge = styled.span`
  background: ${props => {
    switch(props.party) {
      case 'ODM': return '#FF0000';
      case 'UDA': return '#0000FF';
      case 'ANC': return '#FFA500';
      default: return KENYA_COLORS.neutral;
    }
  }};
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
  text-transform: uppercase;
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: ${KENYA_COLORS.neutral};
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
`;

const LiveBadge = styled.div`
  background: ${KENYA_COLORS.primary};
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const PostTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PostHeader = ({ author, party, title, timestamp, location, isLive }) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Safely handle title - it might be string or React element
  const renderTitle = () => {
    if (!title) return null;
    
    if (typeof title === 'string') {
      return title.trim() ? <PostTitle>{title}</PostTitle> : null;
    }
    
    // If title is a React element/JSX
    return <PostTitle>{title}</PostTitle>;
  };

  return (
    <HeaderContainer>
      <Avatar>
        {getInitials(typeof author === 'string' ? author : '')}
      </Avatar>
      
      <UserInfo>
        {/* Render title safely */}
        {renderTitle()}

        <UserName>
          {typeof author === 'string' ? author : ''}
          <PartyBadge party={typeof party === 'string' ? party : ''}>
            {typeof party === 'string' ? party : 'Independent'}
          </PartyBadge>
        </UserName>
        
        <PostMeta>
          <MetaItem>
            <Clock size={10} />
            {timestamp || 'Just now'}
          </MetaItem>
          
          <MetaItem>
            <MapPin size={10} />
            {location || 'Kenya'}
          </MetaItem>
          
          {isLive && (
            <LiveBadge>
              <Wifi size={10} />
              LIVE
            </LiveBadge>
          )}
        </PostMeta>
      </UserInfo>
    </HeaderContainer>
  );
};

export default PostHeader;