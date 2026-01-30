import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Home, UserCheck, BarChart3, Users, User, Bell, TrendingUp, Map, Target, DollarSign } from 'lucide-react';

// Sub-components (Separation of Concerns)
import LandingPage from './assets/components/landingPage';
import LeaderInsightPage from './assets/components/leaders/leaderInsights';
import NotificationsPage from './assets/notifications/notificationsPage';
import GroupsPage from './assets/components/groups/groupsPage';
import ProfilePage from './assets/components/profile/profilePage';
import LeadersPage from './assets/components/leaders/leadersPage';
import BettingPage from './assets/bets/bettingPage'; // Add the betting page import

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
    'NARC': '#8B5cf6'
  }
};

// --- Animations ---
const slideUp = keyframes`
  from { 
    transform: translateY(20px); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0); 
    opacity: 1; 
  }
`;

const pulse = keyframes`
  0% { 
    transform: scale(1); 
  }
  50% { 
    transform: scale(1.1); 
  }
  100% { 
    transform: scale(1); 
  }
`;

const float = keyframes`
  0%, 100% { 
    transform: translateY(0); 
  }
  50% { 
    transform: translateY(-3px); 
  }
`;

const wave = keyframes`
  0% { 
    background-position: 0% 0; 
  }
  100% { 
    background-position: 200% 0; 
  }
`;

// --- Styled Components ---
const NavContainer = styled.nav`
  position: fixed; 
  bottom: 0; 
  left: 0; 
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  display: flex; 
  justify-content: space-around;
  padding: 8px 0 10px 0;
  border-top: 2px solid ${KENYA_THEME.border};
  z-index: 1000;
  animation: ${slideUp} 0.4s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: 0;
    right: 0;
    height: 3px;
    background: ${KENYA_THEME.gradients.kenya};
    background-size: 200% 100%;
    animation: ${css`${wave} 3s linear infinite`};
  }
`;

const NavItem = styled.div`
  display: flex; 
  flex-direction: column; 
  align-items: center;
  color: ${props => props.active ? KENYA_THEME.primary : KENYA_THEME.text.secondary};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  padding: 8px;
  border-radius: 12px;
  min-width: 64px;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30px;
    height: 38px;
    border-radius: 12px;
    background: ${props => props.$active ? `${KENYA_THEME.primary}15` : 'transparent'};
    transition: all 0.3s ease;
    z-index: -1;
  }
  
  span { 
    font-size: 8px; 
    font-weight: 700; 
    margin-top: 6px; 
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
  
  .icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  &:hover {
    color: ${KENYA_THEME.primary};
    transform: translateY(-2px);
    
    .icon-wrapper {
      animation: ${css`${float} 1s ease-in-out infinite`};
    }
  }
  
  &:active {
    transform: translateY(0);
  }
  
  ${props => props.$active && css`
    font-weight: 700;
    
    .icon-wrapper {
      animation: ${css`${float} 1s ease-in-out infinite`};
    }
    
    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 3px;
      background: ${KENYA_THEME.gradients.kenya};
      border-radius: 2px;
    }
  `}
`;

const NotificationBadge = styled.div`
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  
  .count {
    position: absolute; 
    top: -6px; 
    right: -6px;
    background: ${KENYA_THEME.opposition};
    color: white;
    font-size: 9px; 
    height: 18px; 
    width: 18px;
    border-radius: 50%; 
    display: flex; 
    align-items: center; 
    justify-content: center;
    border: 2px solid white;
    font-weight: 800;
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
    animation: ${css`${pulse} 1.5s infinite`};
    z-index: 1;
  }
  
  &:hover {
    transform: scale(1.05);
    
    .count {
      transform: scale(1.1);
    }
  }
`;

const Header = styled.header`
  padding: 16px 20px;
  background: white;
  position: sticky;
  top: 0;
  z-index: 999;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid ${KENYA_THEME.border};
  box-shadow: 0 2px 12px rgba(187, 0, 0, 0.05);
`;

const AppTitle = styled.h1`
  font-size: 22px;
  font-weight: 800;
  margin: 0;
  background: ${KENYA_THEME.gradients.kenya};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: '🇰🇪';
    font-size: 24px;
    background: none;
    -webkit-background-clip: initial;
    -webkit-text-fill-color: initial;
  }
`;

const MainContainer = styled.main`
  padding-bottom: 80px;
  min-height: calc(100vh - 80px);
  background: ${KENYA_THEME.background};
  position: relative;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(187, 0, 0, 0.03) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
`;

const FloatingActionButton = styled.button`
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${KENYA_THEME.gradients.kenya};
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(187, 0, 0, 0.3);
  z-index: 999;
  animation: ${css`${float} 2s ease-in-out infinite`};
  
  &:hover {
    transform: scale(1.1) rotate(15deg);
    box-shadow: 0 12px 32px rgba(187, 0, 0, 0.4);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const App = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [notifCount, setNotifCount] = useState(5);
  const [showFAB, setShowFAB] = useState(true);

  const renderContent = () => {
    if (selectedLeader) {
      return <LeaderInsightPage 
        leaderData={selectedLeader} 
        onBack={() => {
          setSelectedLeader(null);
          setShowFAB(true);
        }} 
      />;
    }

    switch(activeTab) {
      case 'feed': 
        return <LandingPage />;
      case 'leaders': 
        return <LeadersPage onLeaderSelect={(leader) => {
          setSelectedLeader(leader);
          setShowFAB(false);
        }} />;
      case 'groups': 
        return <GroupsPage />;
      case 'profile': 
        return <ProfilePage />;
      case 'notifications': 
        return <NotificationsPage 
          onBack={() => setActiveTab('feed')} 
          clearCount={() => setNotifCount(0)} 
        />;
      case 'insights': 
        return <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Analytics Dashboard Coming Soon</h2>
          <p>Detailed political insights and trends</p>
        </div>;
      case 'betting': 
        return <BettingPage />; // Add betting page render
      default: 
        return <LandingPage />;
    }
  };

  const handleCreatePost = () => {
    alert('Create new political post coming soon! 🇰🇪');
    // In real app, this would open a post creation modal
  };

  const getIconSize = () => {
    return activeTab === 'profile' ? 20 : 22;
  };

  // Updated navigation items with betting
  const navItems = [
    { id: 'feed', label: 'Home', icon: Home, color: KENYA_THEME.primary },
    { id: 'leaders', label: 'Leaders', icon: UserCheck, color: KENYA_THEME.partyColors['ODM'] },
    { id: 'betting', label: 'Bets', icon: DollarSign, color: '#F59E0B' }, // Added betting tab
    { id: 'profile', label: 'Profile', icon: User, color: KENYA_THEME.accent },
    { id: 'insights', label: 'Insights', icon: BarChart3, color: KENYA_THEME.trending }
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* Header */}
      {!selectedLeader && (
        <Header>
          <AppTitle>Siasa Hub</AppTitle>
          <NotificationBadge onClick={() => setActiveTab('notifications')}>
            <Bell 
              size={24} 
              color={activeTab === 'notifications' ? KENYA_THEME.primary : KENYA_THEME.text.secondary}
              fill={activeTab === 'notifications' ? KENYA_THEME.primary : 'none'}
            />
            {notifCount > 0 && <div className="count">{notifCount}</div>}
          </NotificationBadge>
        </Header>
      )}

      {/* Main Content */}
      <MainContainer>
        {renderContent()}
      </MainContainer>

      {/* Floating Action Button */}
      {showFAB && activeTab === 'feed' && !selectedLeader && (
        <FloatingActionButton onClick={handleCreatePost}>
          <Target size={24} />
        </FloatingActionButton>
      )}

      {/* Bottom Navigation */}
      {!selectedLeader && (
        <NavContainer>
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <NavItem 
                key={item.id}
                $active={isActive}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'notifications') {
                    setNotifCount(0);
                  }
                }}
              >
                <div className="icon-wrapper">
                  <IconComponent 
                    size={getIconSize()} 
                    color={isActive ? item.color : KENYA_THEME.text.secondary}
                    fill={isActive ? item.color : 'none'}
                  />
                </div>
                <span>{item.label}</span>
              </NavItem>
            );
          })}
        </NavContainer>
      )}

      {/* Bottom Gradient Overlay */}
      {!selectedLeader && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100px',
          background: 'linear-gradient(to top, rgba(248, 250, 252, 0.9), transparent)',
          pointerEvents: 'none',
      
          }} />
      )}
      
      
    </div>
  );
};

export default App;