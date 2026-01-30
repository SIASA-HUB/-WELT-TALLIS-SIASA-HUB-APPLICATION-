import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  Settings, Award, History, Clock, 
  DollarSign, MapPin, Star, Flag, Edit3, X, Check, Shield, 
  Camera, RefreshCw, Share2, ThumbsUp, ThumbsDown,
  User, Target, TrendingUp, Globe, CheckCircle,
  BarChart, Heart, MessageCircle, Download,
  Bell, HelpCircle, LogOut
} from 'lucide-react';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled Components
const ProfileWrapper = styled.div`
  background: #f8fafc;
  min-height: 100vh;
  padding-bottom: 100px;
  animation: ${fadeIn} 0.6s ease-out;
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 20px 80px;
  text-align: center;
  position: relative;
  color: white;
`;

const Avatar = styled.div`
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: ${props => props.$isEmoji ? '#f1f5f9' : `url(${props.$url})`} center/cover;
  border: 5px solid rgba(255, 255, 255, 0.3);
  margin: 0 auto 20px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const RankBadge = styled.div`
  background: linear-gradient(135deg, ${props => props.$color || '#667eea'}, #764ba2);
  color: white;
  font-size: 12px;
  font-weight: 800;
  padding: 8px 20px;
  border-radius: 50px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: -25px;
  z-index: 2;
  position: relative;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  text-transform: uppercase;
  animation: ${pulse} 2s infinite;
`;

const InfoCard = styled.div`
  background: white;
  margin: -40px 20px 25px;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.08);
  border: 1px solid #f1f5f9;
  animation: ${fadeIn} 0.8s ease-out;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  padding: 0 20px 25px;
`;

const MiniCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    border-color: #667eea;
  }
  
  h4 { 
    margin: 0; 
    font-weight: 800; 
    color: #1e293b;
    font-size: 22px;
  }
  
  small { 
    color: #64748b; 
    font-weight: 600; 
    font-size: 12px;
    letter-spacing: 0.5px;
  }
`;

const EngagementStats = styled.div`
  background: white;
  margin: 0 20px 25px;
  border-radius: 24px;
  padding: 25px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.06);
  border: 1px solid #f1f5f9;
  animation: ${fadeIn} 1s ease-out;
`;

const TopPicksSection = styled.div`
  background: white;
  margin: 0 20px 25px;
  border-radius: 24px;
  padding: 25px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.06);
  border: 1px solid #f1f5f9;
  animation: ${fadeIn} 1.2s ease-out;
`;

const SettingsList = styled.div`
  background: white;
  margin: 0 20px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0,0,0,0.06);
  border: 1px solid #f1f5f9;
  animation: ${fadeIn} 1.4s ease-out;
`;

const PickerModal = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  z-index: 1000;
  border-radius: 30px 30px 0 0;
  padding: 30px 25px;
  box-shadow: 0 -20px 50px rgba(0,0,0,0.25);
  animation: ${slideUp} 0.4s ease-out;
  max-height: 85vh;
  overflow-y: auto;
`;

const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  margin-top: 20px;
`;

const EmojiItem = styled.div`
  font-size: 36px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    background: #e2e8f0;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #f1f5f9;
  border-radius: 10px;
  margin: 15px 0;
  overflow: hidden;
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 10px;
    width: ${props => props.$progress || 0}%;
    transition: width 0.6s ease-out;
  }
`;

// Main Component
const ProfilePage = () => {
  const [showPicker, setShowPicker] = useState(false);
  const [profilePic, setProfilePic] = useState({
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    isEmoji: false,
    emoji: ''
  });
  const [stats] = useState({
    earnings: 4250,
    timeSpent: 128,
    shares: 45,
    likes: 312,
    dislikes: 18,
    campaignProgress: 82
  });

  const emojis = ['🇰🇪', '🦁', '🔥', '✊', '💎', '🎯', '⭐', '🛡️', '🌍', '🤝', '✌️', '💪', '👑', '🗳️', '📈'];
  
  const generateRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setProfilePic({
      url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}`,
      isEmoji: false,
      emoji: ''
    });
    setShowPicker(false);
  };

  const selectEmoji = (emoji) => {
    setProfilePic({ 
      url: '', 
      isEmoji: true, 
      emoji: emoji 
    });
    setShowPicker(false);
  };

  const ranks = {
    platinum: { label: 'Platinum Ambassador', color: '#667eea', icon: Shield }
  };
  const currentRank = ranks.platinum;
  const RankIcon = currentRank.icon;

  const settingsOptions = [
    { icon: Bell, label: 'Notifications', color: '#667eea' },
    { icon: History, label: 'Activity History', color: '#10b981' },
    { icon: Award, label: 'Earned Badges', color: '#f59e0b' },
    { icon: Download, label: 'Export Data', color: '#3b82f6' },
    { icon: HelpCircle, label: 'Help & Support', color: '#8b5cf6' },
    { icon: Settings, label: 'Account Settings', color: '#64748b' },
    { icon: LogOut, label: 'Logout', color: '#ef4444', isLast: true }
  ];

  return (
    <ProfileWrapper>
      {/* 1. HERO SECTION WITH AVATAR */}
      <HeroSection>
        <button 
          onClick={() => setShowPicker(true)}
          style={{ 
            position: 'absolute', 
            top: 30, 
            right: 20, 
            background: 'rgba(255,255,255,0.15)', 
            border: 'none', 
            borderRadius: '50%', 
            padding: 12, 
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.25)'}
          onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.15)'}
        >
          <Edit3 size={20} />
        </button>
        
        <Avatar 
          $url={profilePic.url} 
          $isEmoji={profilePic.isEmoji}
          onClick={() => setShowPicker(true)}
        >
          {profilePic.isEmoji ? profilePic.emoji : null}
          <div style={{
            position: 'absolute', 
            bottom: 5, 
            right: 5, 
            background: '#667eea', 
            padding: 8, 
            borderRadius: '50%', 
            border: '4px solid rgba(255,255,255,0.3)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            <Camera size={16} color="white" />
          </div>
        </Avatar>
        
        <RankBadge $color={currentRank.color}>
          <RankIcon size={16} fill="white" /> {currentRank.label}
        </RankBadge>
        
        <h2 style={{ margin: '20px 0 8px', fontWeight: 800 }}>Jane Wateti</h2>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 8,
          fontSize: '15px',
          opacity: 0.9
        }}>
          <MapPin size={18} />
          Nairobi, Kileleshwa • Active Member
        </div>
      </HeroSection>

      {/* 2. CAMPAIGN PROGRESS CARD */}
      <InfoCard>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 15 
        }}>
          <div>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: 800, 
              textTransform: 'uppercase',
              color: '#64748b',
              letterSpacing: '1px'
            }}>
              Campaign Participation
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#667eea',
              fontWeight: 700,
              marginTop: 4
            }}>
              {stats.campaignProgress}% Complete
            </div>
          </div>
          <Target size={24} color="#667eea" />
        </div>
        
        <ProgressBar $progress={stats.campaignProgress}>
          <div className="progress-fill" />
        </ProgressBar>
        
        <p style={{ 
          margin: '20px 0 0', 
          fontSize: '13px', 
          color: '#64748b',
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          Only {100 - stats.campaignProgress}% more participation needed for{' '}
          <strong style={{ color: '#667eea' }}>Ultimate Rank</strong>
        </p>
      </InfoCard>

      {/* 3. CORE ANALYTICS STATS */}
      <StatGrid>
        <MiniCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #10b981, #34d399)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={20} color="white" />
            </div>
            <div>
              <small>EARNINGS</small>
              <h4>KES {stats.earnings.toLocaleString()}</h4>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            From 15 completed tasks
          </div>
        </MiniCard>

        <MiniCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={20} color="white" />
            </div>
            <div>
              <small>TIME INVESTED</small>
              <h4>{stats.timeSpent}h</h4>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            Average 8h/week
          </div>
        </MiniCard>
      </StatGrid>

      {/* 4. ENGAGEMENT STATISTICS */}
      <EngagementStats>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 20
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
            Engagement Stats
          </h3>
          <TrendingUp size={20} color="#667eea" />
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          textAlign: 'center'
        }}>
          <div>
            <div style={{ 
              fontSize: '28px', 
              fontWeight: 800, 
              color: '#1e293b',
              marginBottom: 4
            }}>
              {stats.shares}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#64748b',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              justifyContent: 'center'
            }}>
              <Share2 size={14} />
              Shares
            </div>
          </div>
          
          <div style={{ width: '1px', background: '#f1f5f9' }} />
          
          <div>
            <div style={{ 
              fontSize: '28px', 
              fontWeight: 800, 
              color: '#10b981',
              marginBottom: 4
            }}>
              {stats.likes}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#64748b',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              justifyContent: 'center'
            }}>
              <ThumbsUp size={14} />
              Likes
            </div>
          </div>
          
          <div style={{ width: '1px', background: '#f1f5f9' }} />
          
          <div>
            <div style={{ 
              fontSize: '28px', 
              fontWeight: 800, 
              color: '#ef4444',
              marginBottom: 4
            }}>
              {stats.dislikes}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#64748b',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              justifyContent: 'center'
            }}>
              <ThumbsDown size={14} />
              Dislikes
            </div>
          </div>
        </div>
      </EngagementStats>

      {/* 5. TOP PICKS SECTION */}
      <TopPicksSection>
        <h3 style={{ 
          margin: '0 0 20px', 
          fontSize: '16px', 
          fontWeight: 800, 
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          My Top Picks
        </h3>
        
        <div style={{ display: 'flex', gap: 15 }}>
          <div style={{ 
            flex: 1, 
            padding: 20, 
            background: 'linear-gradient(135deg, #fff7ed, #fed7aa)',
            borderRadius: 20,
            border: '1px solid #fdba74'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12,
              marginBottom: 15
            }}>
              <div style={{
                width: 45,
                height: 45,
                borderRadius: 12,
                background: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Star size={24} color="white" fill="white" />
              </div>
              <div>
                <div style={{ 
                  fontSize: '11px', 
                  textTransform: 'uppercase',
                  color: '#92400e',
                  fontWeight: 800
                }}>
                  Top Candidate
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 800,
                  color: '#1e293b'
                }}>
                  Dr. W. Kimani
                </div>
              </div>
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#92400e',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <CheckCircle size={14} />
              92% Approval Rate
            </div>
          </div>

          <div style={{ 
            flex: 1, 
            padding: 20, 
            background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
            borderRadius: 20,
            border: '1px solid #38bdf8'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12,
              marginBottom: 15
            }}>
              <div style={{
                width: 45,
                height: 45,
                borderRadius: 12,
                background: '#0ea5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Flag size={24} color="white" fill="white" />
              </div>
              <div>
                <div style={{ 
                  fontSize: '11px', 
                  textTransform: 'uppercase',
                  color: '#0369a1',
                  fontWeight: 800
                }}>
                  Preferred Party
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 800,
                  color: '#1e293b'
                }}>
                  UDA Party
                </div>
              </div>
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#0369a1',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Globe size={14} />
              National Coverage
            </div>
          </div>
        </div>
      </TopPicksSection>

      {/* 6. SETTINGS & ACTIVITY LIST */}
      <SettingsList>
        {settingsOptions.map((item, index) => (
          <div
            key={item.label}
            style={{
              padding: '20px 25px',
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderBottom: item.isLast ? 'none' : '1px solid #f1f5f9',
              backgroundColor: '#fff',
              ':hover': {
                backgroundColor: '#f8fafc'
              }
            }}
            onClick={() => {
              if (item.label === 'Logout') {
                if (window.confirm('Are you sure you want to logout?')) {
                  console.log('Logging out...');
                }
              }
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `${item.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <item.icon size={20} color={item.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 600,
                color: '#1e293b'
              }}>
                {item.label}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#94a3b8',
                marginTop: 2
              }}>
                {item.label === 'Notifications' && 'Manage your alerts'}
                {item.label === 'Activity History' && 'View your activity log'}
                {item.label === 'Earned Badges' && 'See all your achievements'}
                {item.label === 'Export Data' && 'Download your information'}
                {item.label === 'Help & Support' && 'Get help and contact support'}
                {item.label === 'Account Settings' && 'Manage account preferences'}
                {item.label === 'Logout' && 'Sign out of your account'}
              </div>
            </div>
            <div style={{ color: '#cbd5e1' }}>
              →
            </div>
          </div>
        ))}
      </SettingsList>

      {/* AVATAR PICKER MODAL */}
      {showPicker && (
        <>
          <div 
            style={{ 
              position: 'fixed', 
              inset: 0, 
              background: 'rgba(0,0,0,0.7)', 
              zIndex: 999,
              animation: 'fadeIn 0.3s ease-out'
            }} 
            onClick={() => setShowPicker(false)}
          />
          <PickerModal>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 25 
            }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 800, color: '#1e293b' }}>
                  Choose Your Identity
                </h3>
                <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '14px' }}>
                  Select an avatar or emoji to represent you
                </p>
              </div>
              <button
                onClick={() => setShowPicker(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 8,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: '#64748b',
                  ':hover': { background: '#f1f5f9' }
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ 
              marginBottom: 25,
              padding: 20,
              background: '#f8fafc',
              borderRadius: 20,
              border: '2px dashed #cbd5e1'
            }}>
              <h4 style={{ 
                margin: '0 0 15px', 
                fontSize: '14px', 
                fontWeight: 800,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Current Selection
              </h4>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 15,
                padding: 15,
                background: 'white',
                borderRadius: 16,
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: profilePic.isEmoji ? '#f1f5f9' : `url(${profilePic.url}) center/cover`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30
                }}>
                  {profilePic.isEmoji ? profilePic.emoji : null}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1e293b' }}>
                    {profilePic.isEmoji ? 'Emoji Avatar' : 'Generated Avatar'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: 4 }}>
                    {profilePic.isEmoji ? 
                      `Selected emoji: ${profilePic.emoji}` : 
                      'Randomly generated character'
                    }
                  </div>
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, #667eea, #764ba2)', 
              padding: 20, 
              borderRadius: 20,
              marginBottom: 25,
              cursor: 'pointer'
            }}
            onClick={generateRandomAvatar}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: 15,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <RefreshCw size={24} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: 'white', fontSize: '16px' }}>
                    Generate Random Avatar
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: 4 }}>
                    Get a unique, computer-generated character
                  </div>
                </div>
              </div>
            </div>

            <h4 style={{ 
              margin: '0 0 15px', 
              fontSize: '14px', 
              fontWeight: 800,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Emoji Selection
            </h4>
            
            <EmojiGrid>
              {emojis.map(emoji => (
                <EmojiItem 
                  key={emoji} 
                  onClick={() => selectEmoji(emoji)}
                  style={{
                    background: profilePic.emoji === emoji ? '#e2e8f0' : '#f8fafc',
                    border: profilePic.emoji === emoji ? '2px solid #667eea' : 'none'
                  }}
                >
                  {emoji}
                </EmojiItem>
              ))}
            </EmojiGrid>

            <button 
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                padding: '18px',
                borderRadius: '16px',
                width: '100%',
                fontWeight: 800,
                fontSize: '16px',
                marginTop: 30,
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
                ':hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)'
                },
                ':active': {
                  transform: 'translateY(0)'
                }
              }}
              onClick={() => setShowPicker(false)}
            >
              Save Changes
            </button>
          </PickerModal>
        </>
      )}

      {/* Bottom Padding */}
      <div style={{ height: 50 }} />
    </ProfileWrapper>
  );
};

export default ProfilePage;