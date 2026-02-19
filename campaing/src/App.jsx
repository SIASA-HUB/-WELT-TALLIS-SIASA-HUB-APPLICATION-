import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import styled from 'styled-components';

// Shared Layout Component
import GlobalHeader from './assets/utils/globalheader';
import NavMenu from './assets/utils/navMenu';

// Pages
import LandingPage from './assets/components/landingPage';
import LeaderInsightPage from './assets/components/leaders/leaderInsights';
import NotificationsPage from './assets/notifications/notificationsPage';
import GroupsPage from './assets/components/groups/groupsPage';
import ProfilePage from './assets/components/profile/profilePage';
import LeadersPage from './assets/components/leaders/leadersPage';
import BettingPage from './assets/bets/bettingPage';
import RegistrationPage from './assets/components/auth/registerPage';
import LoginPage from './assets/components/auth/loginPage';
import   CreateManifesto   from  './assets/components/leaders/createManifesto'
import ManifestoPage from './assets/components/leaders/manifestoPage';

const MainContainer = styled.main`
  padding-bottom: 70px; 
  min-height: 100vh;
  background: #F8FAFC;
`;

const Layout = ({ notifCount, children, onSearch, searchQuery }) => {
  const location = useLocation();
  const isLeaderDetail = location.pathname.startsWith('/leader/');

  return (
    <>
      {/* 1. Header is now external and much cleaner */}
      {!isLeaderDetail && (
        <GlobalHeader 
          notifCount={notifCount} 
          onSearch={onSearch}
          searchQuery={searchQuery}
        />
      )}

      <MainContainer>{children}</MainContainer>

      {/* 2. NavMenu is preserved below */}
      {!isLeaderDetail && <NavMenu />} 
    </>
  );
};

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifCount, setNotifCount] = useState(5);

  // Handler for search from GlobalHeader
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <Router>
      <Layout 
        notifCount={notifCount} 
        onSearch={handleSearch}
        searchQuery={searchQuery}
      >
        <Routes>
          <Route 
            path="/" 
            element={
              <LandingPage 
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery('')}
              />
            } 
          />
          <Route path="/leaders" element={<LeadersPage />} />
          <Route path="/leader/:id" element={<LeaderInsightPage />} />
          <Route path="/betting" element={<BettingPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/manifesto" element={<CreateManifesto />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/notifications" element={
            <NotificationsPage 
              onBack={() => window.history.back()} 
              clearCount={() => setNotifCount(0)} 
            />
          } />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;