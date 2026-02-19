import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Shield, UserPlus, LogIn, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import components
import HeroSection from './heroSection';
import CampaignProgressCard from './campaingProcessCard';
import StatsGrid from './statsGrid';
import EarningsBreakdown from './earningBreakdown';
import PinnedVideos from './pinnedVideos';
import EngagementStats from './engegemnetStats';
import AvatarPicker from './avarterPicker';
import Footer from './footer';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const ProfileWrapper = styled.div`
  background: #f8fafc;
  min-height: 100vh;
  padding-bottom: 100px;
  animation: ${fadeIn} 0.6s ease-out;
`;

const ActionButtons = styled.div`
  background: white;
  margin: 20px 15px;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
  border: 1px solid #f1f5f9;
  animation: ${fadeIn} 1s ease-out;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
  @media (max-width: 768px) { flex-direction: column; }
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 16px 24px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: none;
  &:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
`;

const RegisterButton = styled(ActionButton)`
  background: linear-gradient(135deg, #BB0000, #FF4444);
  color: white;
  &:hover { box-shadow: 0 10px 25px rgba(187, 0, 0, 0.3); }
`;

const LoginButton = styled(ActionButton)`
  background: linear-gradient(135deg, #006600, #00AA44);
  color: white;
  &:hover { box-shadow: 0 10px 25px rgba(0, 102, 0, 0.3); }
`;

const SectionTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 10px;
`;

// Main Component
const ProfilePage = () => {
  const navigate = useNavigate();
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [profilePic, setProfilePic] = useState({
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    isEmoji: false,
    emoji: ''
  });

  const [userData, setUserData] = useState({
    name: 'Guest User',
    location: 'Nairobi, Kenya',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    userId: null
  });

  const [stats, setStats] = useState({
    earnings: 0,
    timeSpent: 0,
    shares: 0,
    likes: 0,
    dislikes: 0,
    campaignProgress: 0
  });

  useEffect(() => {
    const fetchProfile = () => {
      try {
        // 1. GET REAL NAME & ID FROM LOCAL STORAGE
        const storedName = localStorage.getItem('current_username');
        const storedId = localStorage.getItem('user_id');

        // 2. PROTECTED ROUTE CHECK: Redirect if not logged in
        if (!storedId) {
          navigate('/login');
          return;
        }

        // 3. UPDATE STATE WITH REAL DATA
        setUserData(prev => ({
          ...prev,
          name: storedName || 'Wananchi User',
          userId: storedId,
          location: 'Nairobi, Kenya' // This can also be fetched from an API
        }));

        // Fetch user stats (This would usually be an Axios call to your backend)
        setStats({
          earnings: 4250,
          timeSpent: 128,
          shares: 45,
          likes: 312,
          dislikes: 18,
          campaignProgress: 82
        });

      } catch (err) {
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const currentRank = { label: 'Active Member', color: '#006600', icon: Shield };
  const RankIcon = currentRank.icon;

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('current_username');
    navigate('/login');
  };

  const generateRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}`;
    setProfilePic({ url: newAvatar, isEmoji: false, emoji: '' });
    setUserData(prev => ({ ...prev, avatar: newAvatar }));
    setShowPicker(false);
  };

  const selectEmoji = (emoji) => {
    setProfilePic({ url: '', isEmoji: true, emoji: emoji });
    setUserData(prev => ({ ...prev, avatar: '' }));
    setShowPicker(false);
  };

  if (loading) {
    return (
      <ProfileWrapper>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #f1f5f9', borderTop: '4px solid #006600', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#64748b', fontWeight: 600 }}>Syncing account data...</p>
        </div>
      </ProfileWrapper>
    );
  }

  return (
    <ProfileWrapper>
      <HeroSection
        profilePic={profilePic}
        setShowPicker={setShowPicker}
        currentRank={currentRank}
        userData={userData}
        RankIcon={RankIcon}
      />

      <CampaignProgressCard campaignProgress={stats.campaignProgress} />
      <StatsGrid stats={stats} />
      <EarningsBreakdown />
      <PinnedVideos />
      <EngagementStats stats={stats} />

      <ActionButtons>
        <SectionTitle>
          <UserPlus size={20} />
          Account Management
        </SectionTitle>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
          Manage your campaign identity or switch accounts securely.
        </p>

        <ButtonGroup>
          <RegisterButton onClick={() => navigate('/register')}>
            <UserPlus size={18} />
            New Account
          </RegisterButton>
          
          <LoginButton onClick={handleLogout} style={{ background: '#1e293b' }}>
            <LogOut size={18} />
            Sign Out
          </LoginButton>
        </ButtonGroup>
      </ActionButtons>

      <Footer />

      <AvatarPicker
        showPicker={showPicker}
        setShowPicker={setShowPicker}
        profilePic={profilePic}
        generateRandomAvatar={generateRandomAvatar}
        selectEmoji={selectEmoji}
      />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </ProfileWrapper>
  );
};

export default ProfilePage;