import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  ArrowLeft, MessageSquare, Heart, Info, 
  MapPin, UserPlus, Flame, Users, Bell, ExternalLink,
  Calendar, TrendingUp, Award, Users as Team,
  Megaphone, Vote, AlertCircle, CheckCircle,
  Star, Flag, Shield, Target, BarChart
} from 'lucide-react';

// --- Kenyan Color Scheme ---
const KENYA_THEME = {
  primary: '#BB0000',        // Kenyan flag red
  secondary: '#000000',      // Black
  accent: '#006600',         // Green
  highlight: '#FFFFFF',      // White
  support: '#00A86B',        // Green for support
  opposition: '#FF6B6B',     // Red for opposition
  neutral: '#6B7280',        // Gray
  trending: '#F59E0B',       // Amber for trending
  background: '#F8FAFC',
  border: '#E2E8F0',
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    light: '#94A3B8'
  },
  gradients: {
    kenya: 'linear-gradient(135deg, #BB0000, #000000, #006600)',
    support: 'linear-gradient(135deg, #00A86B, #34D399)',
    opposition: 'linear-gradient(135deg, #FF6B6B, #EF4444)',
    neutral: 'linear-gradient(135deg, #6B7280, #9CA3AF)'
  },
  partyColors: {
    'UDA': '#BB0000',
    'ODM': '#006600',
    'WIPER': '#8B5CF6',
    'FORD-KENYA': '#10B981',
    'NARC-KENYA': '#EC4899',
    'INDEPENDENT': '#6B7280',
    'NARC': '#8B5CF6'
  }
};

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-10px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
`;

// --- Styled Components ---
const PageWrapper = styled.div`
  background: ${KENYA_THEME.background};
  min-height: 100vh;
  animation: ${fadeIn} 0.4s ease-out;
  position: relative;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 120px;
    background: ${KENYA_THEME.gradients.kenya};
    opacity: 0.1;
    z-index: 0;
  }
`;

const Header = styled.div`
  background: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid ${KENYA_THEME.border};
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 12px rgba(187, 0, 0, 0.05);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${KENYA_THEME.text.primary};
  margin: 0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 40px;
    height: 3px;
    background: ${KENYA_THEME.gradients.kenya};
    border-radius: 2px;
  }
`;

const MarkAllRead = styled.button`
  background: transparent;
  border: 2px solid ${KENYA_THEME.primary};
  color: ${KENYA_THEME.primary};
  font-size: 12px;
  font-weight: 700;
  padding: 6px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background: ${KENYA_THEME.primary};
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(187, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const BackButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 2px solid ${KENYA_THEME.border};
  background: white;
  color: ${KENYA_THEME.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${KENYA_THEME.primary};
    color: ${KENYA_THEME.primary};
    transform: translateX(-2px);
  }
`;

const NotifCard = styled.div`
  background: ${props => props.$unread ? 'white' : KENYA_THEME.background};
  padding: 20px;
  margin-bottom: 2px;
  display: flex;
  gap: 16px;
  border-left: 4px solid ${props => props.$unread ? 
    KENYA_THEME.primary : 
    'transparent'};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  animation: ${slideIn} 0.3s ease-out;
  animation-delay: ${props => props.$delay || '0s'};
  animation-fill-mode: both;
  
  &:hover {
    background: ${props => props.$unread ? 
      'rgba(187, 0, 0, 0.02)' : 
      KENYA_THEME.background};
    transform: translateX(4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    
    .icon-box {
      transform: rotate(5deg) scale(1.05);
    }
  }
  
  &:active {
    transform: translateX(2px);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      ${KENYA_THEME.border} 20%, 
      ${KENYA_THEME.border} 80%, 
      transparent 100%
    );
  }
`;

const IconBox = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$bg || KENYA_THEME.gradients.kenya};
  color: white;
  flex-shrink: 0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.6s ease;
  }
  
  &:hover::after {
    left: 100%;
  }
`;

const UnreadDot = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${KENYA_THEME.primary};
  animation: ${pulse} 2s infinite;
`;

const CategoryTag = styled.span`
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 1px;
  color: ${props => props.$color};
  display: inline-block;
  padding: 3px 10px;
  background: ${props => props.$color}10;
  border-radius: 12px;
  margin-bottom: 8px;
  border: 1px solid ${props => props.$color}30;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationText = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: ${KENYA_THEME.text.primary};
  margin-bottom: 12px;
  
  strong {
    color: ${KENYA_THEME.primary};
  }
`;

const NotificationMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NotificationTime = styled.div`
  font-size: 12px;
  color: ${KENYA_THEME.text.light};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ActionButton = styled.button`
  border: 2px solid ${KENYA_THEME.primary};
  background: transparent;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${KENYA_THEME.primary};
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background: ${KENYA_THEME.primary};
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(187, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${KENYA_THEME.text.light};
  
  .icon {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.3;
    animation: ${pulse} 3s infinite;
  }
  
  h6 {
    font-size: 18px;
    font-weight: 700;
    color: ${KENYA_THEME.text.primary};
    margin-bottom: 8px;
  }
  
  p {
    font-size: 14px;
    max-width: 280px;
    margin: 0 auto;
    line-height: 1.5;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  background: white;
  border-bottom: 2px solid ${KENYA_THEME.border};
  overflow-x: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: 2px solid ${props => props.$active ? KENYA_THEME.primary : KENYA_THEME.border};
  background: ${props => props.$active ? KENYA_THEME.primary : 'white'};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$active ? 'white' : KENYA_THEME.text.secondary};
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    border-color: ${KENYA_THEME.primary};
    color: ${props => props.$active ? 'white' : KENYA_THEME.primary};
  }
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-bottom: 2px solid ${KENYA_THEME.border};
`;

const StatItem = styled.div`
  text-align: center;
  padding: 12px;
  background: ${KENYA_THEME.background};
  border-radius: 12px;
  border: 1px solid ${KENYA_THEME.border};
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${KENYA_THEME.primary};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: ${KENYA_THEME.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

// --- Mock Notifications ---
const MOCK_NOTIFICATIONS = [
  { 
    id: 1, 
    type: 'rally', 
    user: 'Nairobi HQ', 
    text: '🇰🇪 URGENT: Presidential campaign rally at Kamukunji Grounds this Saturday 10 AM. Special guest: William Ruto.', 
    time: 'Just now', 
    unread: true,
    actionLabel: 'View on Map',
    party: 'UDA',
    location: 'Nairobi'
  },
  { 
    id: 2, 
    type: 'trending', 
    user: 'Trending Now', 
    text: '🔥 Martha Karua is TRENDING in Central Kenya with 8.2k mentions. Support increased by 12% in 24 hours.', 
    time: '10m ago', 
    unread: true,
    actionLabel: 'See Analytics',
    party: 'NARC-KENYA',
    location: 'Nyeri'
  },
  { 
    id: 3, 
    type: 'candidate', 
    user: 'New Candidate Alert', 
    text: '🎯 Dr. Emily Chemutai (INDEPENDENT) has declared candidacy for MCA Kileleshwa. 3,200 supporters joined in 2 hours.', 
    time: '1h ago', 
    unread: true,
    actionLabel: 'View Profile',
    party: 'INDEPENDENT',
    location: 'Nairobi'
  },
  { 
    id: 4, 
    type: 'group', 
    user: 'Youth for Change', 
    text: '🤝 INVITATION: Join "Nairobi Digital Strategy" private campaign group. 450+ youth members discussing tech policies.', 
    time: '3h ago', 
    unread: true,
    actionLabel: 'Join Group',
    party: null,
    location: null
  },
  { 
    id: 5, 
    type: 'poll', 
    user: 'Poll Update', 
    text: '📊 NEW POLL: UDA leads in Nakuru County (42%) vs ODM (38%). Undecided voters at 20%. Key issues: Economy (65%), Healthcare (22%).', 
    time: '5h ago', 
    unread: false,
    actionLabel: 'View Poll',
    party: 'UDA',
    location: 'Nakuru'
  },
  { 
    id: 6, 
    type: 'support', 
    user: 'Mike Mwangi', 
    text: '❤️ Liked your post "Why we need SME tax reforms in Kenya". 245 others also engaged with this post.', 
    time: '1d ago', 
    unread: false,
    actionLabel: 'Go to Post',
    party: null,
    location: 'Kisumu'
  },
  { 
    id: 7, 
    type: 'debate', 
    user: 'Debate Alert', 
    text: '🎤 LIVE NOW: Presidential debate on economic policies. Tune in to Citizen TV. #KenyaDebates2023', 
    time: '2d ago', 
    unread: false,
    actionLabel: 'Watch Live',
    party: null,
    location: 'Nationwide'
  },
  { 
    id: 8, 
    type: 'election', 
    user: 'Election Commission', 
    text: '🗳️ Voter registration extended by 1 week. Last chance to register at your local IEBC office. Bring ID card.', 
    time: '3d ago', 
    unread: false,
    actionLabel: 'Find Office',
    party: null,
    location: 'Countrywide'
  },
  { 
    id: 9, 
    type: 'achievement', 
    user: 'Campaign Milestone', 
    text: '🏆 CONGRATULATIONS! You reached Level 5 Political Analyst. You are now in top 10% of engaged citizens.', 
    time: '1w ago', 
    unread: false,
    actionLabel: 'View Badge',
    party: null,
    location: null
  }
];

const NotificationsPage = ({ onBack, clearCount }) => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (clearCount) clearCount();
  }, [clearCount]);

  const getNotificationDetails = (type) => {
    const details = {
      rally: { 
        icon: <Megaphone size={24} />, 
        bg: KENYA_THEME.primary, 
        label: 'RALLY ALERT', 
        color: KENYA_THEME.primary 
      },
      trending: { 
        icon: <TrendingUp size={24} />, 
        bg: KENYA_THEME.trending, 
        label: 'TRENDING NOW', 
        color: KENYA_THEME.trending 
      },
      candidate: { 
        icon: <UserPlus size={24} />, 
        bg: KENYA_THEME.support, 
        label: 'NEW CANDIDATE', 
        color: KENYA_THEME.support 
      },
      group: { 
        icon: <Team size={24} />, 
        bg: KENYA_THEME.partyColors['WIPER'], 
        label: 'GROUP INVITE', 
        color: KENYA_THEME.partyColors['WIPER'] 
      },
      poll: { 
        icon: <BarChart size={24} />, 
        bg: KENYA_THEME.partyColors['ODM'], 
        label: 'POLL UPDATE', 
        color: KENYA_THEME.partyColors['ODM'] 
      },
      support: { 
        icon: <Heart size={24} />, 
        bg: '#EC4899', 
        label: 'SOCIAL', 
        color: '#EC4899' 
      },
      debate: { 
        icon: <MessageSquare size={24} />, 
        bg: '#6366F1', 
        label: 'DEBATE', 
        color: '#6366F1' 
      },
      election: { 
        icon: <Vote size={24} />, 
        bg: KENYA_THEME.partyColors['FORD-KENYA'], 
        label: 'ELECTION', 
        color: KENYA_THEME.partyColors['FORD-KENYA'] 
      },
      achievement: { 
        icon: <Award size={24} />, 
        bg: KENYA_THEME.trending, 
        label: 'ACHIEVEMENT', 
        color: KENYA_THEME.trending 
      }
    };
    
    return details[type] || { 
      icon: <Info size={24} />, 
      bg: KENYA_THEME.neutral, 
      label: 'SYSTEM', 
      color: KENYA_THEME.neutral 
    };
  };

  const handleMarkAllRead = () => {
    setMarkingAll(true);
    setTimeout(() => {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, unread: false }))
      );
      setMarkingAll(false);
    }, 500);
  };

  const handleNotificationClick = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return notif.unread;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter(n => n.unread).length;
  const totalCount = notifications.length;

  const filters = [
    { id: 'all', label: 'All', count: totalCount },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'rally', label: 'Rallies', icon: <Megaphone size={14} /> },
    { id: 'trending', label: 'Trending', icon: <TrendingUp size={14} /> },
    { id: 'poll', label: 'Polls', icon: <BarChart size={14} /> }
  ];

  return (
    <PageWrapper>
      {/* Header */}
      <Header>
        <HeaderLeft>
          <BackButton onClick={onBack}>
            <ArrowLeft size={20} />
          </BackButton>
          <HeaderTitle>Political Updates</HeaderTitle>
        </HeaderLeft>
        <MarkAllRead onClick={handleMarkAllRead} disabled={markingAll}>
          {markingAll ? 'Marking...' : 'Mark All Read'}
        </MarkAllRead>
      </Header>

      {/* Stats Bar */}
      <StatsBar>
        <StatItem>
          <StatValue>{unreadCount}</StatValue>
          <StatLabel>Unread</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{totalCount}</StatValue>
          <StatLabel>Total</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{filteredNotifications.length}</StatValue>
          <StatLabel>Filtered</StatLabel>
        </StatItem>
      </StatsBar>

      {/* Filter Bar */}
      <FilterBar>
        {filters.map(filterItem => (
          <FilterButton
            key={filterItem.id}
            $active={filter === filterItem.id}
            onClick={() => setFilter(filterItem.id)}
          >
            {filterItem.icon}
            {filterItem.label}
            {filterItem.count !== undefined && (
              <span style={{ 
                marginLeft: '4px',
                background: filter === filterItem.id ? 'white' : KENYA_THEME.primary,
                color: filter === filterItem.id ? KENYA_THEME.primary : 'white',
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '10px',
                fontWeight: '700'
              }}>
                {filterItem.count}
              </span>
            )}
          </FilterButton>
        ))}
      </FilterBar>

      {/* Notifications List */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification, index) => {
            const details = getNotificationDetails(notification.type);
            
            return (
              <NotifCard 
                key={notification.id} 
                $unread={notification.unread}
                $delay={`${index * 0.05}s`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <IconBox 
                  className="icon-box"
                  $bg={details.bg}
                >
                  {details.icon}
                </IconBox>
                
                <NotificationContent>
                  <CategoryTag $color={details.color}>
                    {details.label}
                    {notification.party && (
                      <span style={{ 
                        marginLeft: '6px',
                        padding: '1px 6px',
                        background: 'white',
                        color: details.color,
                        borderRadius: '8px',
                        fontSize: '9px',
                        fontWeight: '700'
                      }}>
                        {notification.party}
                      </span>
                    )}
                  </CategoryTag>
                  
                  <NotificationText>
                    <strong>{notification.user}</strong> {notification.text}
                    {notification.location && (
                      <span style={{ 
                        fontSize: '12px',
                        color: KENYA_THEME.text.light,
                        marginTop: '4px',
                        display: 'block',
                        fontWeight: '600'
                      }}>
                        📍 {notification.location}
                      </span>
                    )}
                  </NotificationText>
                  
                  <NotificationMeta>
                    <ActionButton>
                      {notification.actionLabel}
                      <ExternalLink size={12} />
                    </ActionButton>
                    <NotificationTime>
                      <Calendar size={12} />
                      {notification.time}
                    </NotificationTime>
                  </NotificationMeta>
                </NotificationContent>
                
                {notification.unread && <UnreadDot />}
              </NotifCard>
            );
          })
        ) : (
          <EmptyState>
            <div className="icon">
              <Bell size={64} />
            </div>
            <h6>No Updates Found</h6>
            <p>You're all caught up! New political updates will appear here when available.</p>
            <ActionButton 
              onClick={() => setFilter('all')}
              style={{ marginTop: '20px' }}
            >
              Show All Updates
            </ActionButton>
          </EmptyState>
        )}
      </div>

      {/* Bottom Info */}
      <div style={{ 
        padding: '20px',
        textAlign: 'center',
        fontSize: '11px',
        color: KENYA_THEME.text.light,
        background: 'white',
        borderTop: `2px solid ${KENYA_THEME.border}`,
        marginTop: '20px'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '4px'
        }}>
          <Shield size={12} />
          <span>All notifications are end-to-end encrypted</span>
        </div>
        <div style={{ fontSize: '10px', opacity: 0.7 }}>
          Last updated: Just now • 🇰🇪 Kenyan Political Hub
        </div>
      </div>
    </PageWrapper>
  );
};

export default NotificationsPage;