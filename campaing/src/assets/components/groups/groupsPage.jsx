import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { 
  Plus, Users, ArrowLeft, Mic, 
  Hand, MessageCircle, MoreVertical, Radio,
  Calendar, BookOpen, Heart, ThumbsUp, Flame, Smile, Send,
  Volume2, MapPin, Globe, Target, TrendingUp, Shield, Award,
  CheckCircle, Clock, UserPlus, Star, Crown, Trophy, Zap
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
const floatUp = keyframes`
  0% { 
    transform: translateY(0) scale(1); 
    opacity: 1; 
  }
  100% { 
    transform: translateY(-150px) scale(1.5); 
    opacity: 0; 
  }
`;

const pulse = keyframes`
  0% { 
    transform: scale(0.95); 
    box-shadow: 0 0 0 0 ${KENYA_THEME.primary}50; 
  }
  70% { 
    transform: scale(1); 
    box-shadow: 0 0 0 10px ${KENYA_THEME.primary}00; 
  }
  100% { 
    transform: scale(0.95); 
    box-shadow: 0 0 0 0 ${KENYA_THEME.primary}00; 
  }
`;

const audioWave = keyframes`
  0% { 
    height: 4px; 
  } 
  50% { 
    height: 24px; 
  } 
  100% { 
    height: 4px; 
  }
`;

const slideIn = keyframes`
  from { 
    transform: translateY(20px); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0); 
    opacity: 1; 
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

const float = keyframes`
  0%, 100% { 
    transform: translateY(0) rotate(0deg); 
  }
  50% { 
    transform: translateY(-10px) rotate(5deg); 
  }
`;

const glow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(187, 0, 0, 0.3); 
  }
  50% { 
    box-shadow: 0 0 40px rgba(187, 0, 0, 0.5); 
  }
`;

// --- Styled Components ---
const PageContainer = styled.div`
  background: ${KENYA_THEME.background};
  min-height: 100vh;
  padding: 20px;
  position: relative;
  overflow-x: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 120px;
    background: ${KENYA_THEME.gradients.kenya};
    opacity: 0.05;
    z-index: 0;
  }
`;

const PageHeader = styled.div`
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
  
  h1 {
    font-size: 28px;
    font-weight: 800;
    color: ${KENYA_THEME.text.primary};
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 12px;
    
    &::before {
      content: '🗣️';
      font-size: 32px;
    }
    
    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 60px;
      height: 4px;
      background: ${KENYA_THEME.gradients.kenya};
      border-radius: 2px;
    }
  }
  
  .subtitle {
    font-size: 14px;
    color: ${KENYA_THEME.text.secondary};
    margin: 0;
  }
`;

const LiveIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$color || KENYA_THEME.primary};
  animation: ${css`${pulse} 1.5s infinite`};
  position: absolute;
  top: 12px;
  right: 12px;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 2;
`;

const FloatingEmoji = styled.div`
  position: absolute;
  font-size: 32px;
  pointer-events: none;
  animation: ${css`${floatUp} 2s ease-out forwards`};
  z-index: 4000;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
`;

const GroupCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
  border: 2px solid ${props => props.$color}20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: ${css`${slideIn} 0.4s ease-out`};
  animation-delay: ${props => props.$delay || '0s'};
  animation-fill-mode: both;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.$color || KENYA_THEME.gradients.kenya};
  }
  
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
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.6s ease;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.$color}40;
    
    &::after {
      left: 100%;
    }
    
    .group-icon {
      transform: scale(1.1) rotate(5deg);
    }
  }
`;

const AudioOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0F172A, #1E293B);
  z-index: 3000;
  display: flex;
  flex-direction: column;
  color: white;
  animation: ${css`${slideIn} 0.4s ease-out`};
`;

const CommentBubble = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 18px;
  margin-bottom: 12px;
  font-size: 14px;
  width: fit-content;
  max-width: 85%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(2px);
  }
  
  &.own {
    background: ${KENYA_THEME.primary}20;
    border-color: ${KENYA_THEME.primary}40;
    margin-left: auto;
  }
`;

const WaveBar = styled.div`
  width: 4px;
  background: ${KENYA_THEME.primary};
  border-radius: 10px;
  ${props => css`
    animation: ${audioWave} 0.6s infinite ease-in-out;
    animation-delay: ${props.$delay}s;
  `}
`;

const SectionHeader = styled.div`
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 800;
  color: ${KENYA_THEME.text.secondary};
  margin: 24px 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${KENYA_THEME.border};
    margin-left: 12px;
  }
`;

const JoinButton = styled.button`
  background: ${props => props.$color || KENYA_THEME.gradients.kenya};
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${props => props.$color ? `${props.$color}40` : 'rgba(187, 0, 0, 0.3)'};
    
    &::after {
      left: 100%;
    }
  }
  
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
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.6s ease;
  }
`;

const ReactionButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 20px;
  
  &:hover {
    background: ${KENYA_THEME.primary};
    transform: scale(1.2) rotate(10deg);
    box-shadow: 0 4px 16px rgba(187, 0, 0, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const StatsBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: ${props => props.$color || KENYA_THEME.text.primary};
  background: ${props => props.$color ? `${props.$color}10` : KENYA_THEME.background};
  padding: 4px 10px;
  border-radius: 12px;
  border: 1px solid ${props => props.$color ? `${props.$color}20` : KENYA_THEME.border};
`;

const SpeakerCard = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 20px;
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: ${css`${glow} 2s infinite ease-in-out`};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      transparent 0%,
      ${KENYA_THEME.primary}10 50%,
      transparent 100%
    );
    animation: ${css`${shimmer} 3s infinite`};
  }
`;

const KenyattaTowerCard = styled.div`
  background: ${KENYA_THEME.gradients.kenya};
  color: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  animation: ${css`${float} 3s infinite ease-in-out`};
  
  &::before {
    content: '🇰🇪';
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 40px;
    opacity: 0.2;
  }
`;

const GroupIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: ${props => props.$color ? props.$color : KENYA_THEME.gradients.kenya};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
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
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.6s ease;
  }
  
  &:hover::after {
    left: 100%;
  }
`;

const GroupsPage = () => {
  const [activeSpace, setActiveSpace] = useState(null);
  const [reactions, setReactions] = useState([]);
  const [comment, setComment] = useState("");
  const [commentsList, setCommentsList] = useState([
    { user: "Mike M.", text: "This point on VAT is crucial for SMEs!", timestamp: "2m ago", party: "UDA" },
    { user: "Sarah W.", text: "Wait, so when does this implementation start?", timestamp: "1m ago", party: "ODM" },
    { user: "James K.", text: "The agriculture sector needs more attention 🇰🇪", timestamp: "Just now", party: "INDEPENDENT" }
  ]);
  const [userReaction, setUserReaction] = useState(null);

  // Enhanced Kenyan political groups
  const groups = [
    { 
      id: 1, 
      name: "Nairobi Tax Debate", 
      active: 450, 
      color: KENYA_THEME.primary, 
      topic: "Finance Bill 2024 Analysis",
      host: "Hon. Kimani",
      location: "Nairobi",
      party: "UDA",
      intensity: "high",
      emoji: "💰"
    },
    { 
      id: 2, 
      name: "Youth Jobs Hub", 
      active: 320, 
      color: KENYA_THEME.trending, 
      topic: "Digital Freelancing Opportunities",
      host: "Youth Empowerment",
      location: "Mombasa",
      party: "ODM",
      intensity: "medium",
      emoji: "💼"
    },
    { 
      id: 3, 
      name: "Agriculture Summit", 
      active: 280, 
      color: KENYA_THEME.accent, 
      topic: "Farmers' Subsidy Programs",
      host: "Farmers Union",
      location: "Nakuru",
      party: "FORD-KENYA",
      intensity: "medium",
      emoji: "🚜"
    },
    { 
      id: 4, 
      name: "Healthcare Reform", 
      active: 190, 
      color: KENYA_THEME.support, 
      topic: "Universal Healthcare Coverage",
      host: "Medical Association",
      location: "Kisumu",
      party: "WIPER",
      intensity: "low",
      emoji: "🏥"
    }
  ];

  const upcoming = [
    { 
      time: "8:00 PM", 
      title: "Housing Fund Discussion", 
      host: "CS. Moses", 
      guests: 3,
      color: KENYA_THEME.primary 
    },
    { 
      time: "9:30 PM", 
      title: "Crypto Policy Forum", 
      host: "Tech Innovators", 
      guests: 5,
      color: KENYA_THEME.trending 
    },
    { 
      time: "11:00 PM", 
      title: "County Revenue Sharing", 
      host: "Governors Council", 
      guests: 8,
      color: KENYA_THEME.accent 
    }
  ];

  const addReaction = (emoji) => {
    const id = Date.now();
    setReactions([...reactions, { id, emoji }]);
    setUserReaction(emoji);
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 2000);
  };

  const handleSendComment = () => {
    if(!comment.trim()) return;
    const newComment = { 
      user: "You", 
      text: comment, 
      timestamp: "Now",
      party: "USER"
    };
    setCommentsList([newComment, ...commentsList]);
    setComment("");
  };

  const reactionEmojis = ['❤️', '🔥', '👏', '🇰🇪', '💪', '🎯', '🗳️', '⚖️'];

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader>
        <h1>Political Spaces</h1>
        <p className="subtitle">Live audio discussions on Kenyan politics & policies</p>
      </PageHeader>

      {/* Kenyatta Tower Feature Card */}
      <KenyattaTowerCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '16px', 
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px'
          }}>
            🏛️
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Featured: Parliament Live</h3>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
              Live parliamentary proceedings with expert commentary
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <StatsBadge style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            <Users size={14} /> 1.2k listening
          </StatsBadge>
          <StatsBadge style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            <TrendingUp size={14} /> Trending
          </StatsBadge>
        </div>
      </KenyattaTowerCard>

      {/* Upcoming Events Section */}
      <SectionHeader>
        <Calendar size={16} />
        Upcoming Tonight
      </SectionHeader>

      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
        {upcoming.map((item, i) => (
          <div 
            key={i} 
            style={{
              minWidth: '200px',
              background: 'white',
              borderRadius: '20px',
              padding: '20px',
              border: `2px solid ${item.color}20`,
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            <div style={{ 
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '4px',
              background: item.color
            }} />
            <div style={{ 
              fontSize: '10px',
              fontWeight: '800',
              color: item.color,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px'
            }}>
              {item.time}
            </div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: KENYA_THEME.text.primary }}>
              {item.title}
            </h4>
            <div style={{ fontSize: '12px', color: KENYA_THEME.text.secondary, marginBottom: '12px' }}>
              Host: {item.host}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={12} />
              <span style={{ fontSize: '11px', color: KENYA_THEME.text.light }}>{item.guests} speakers</span>
              <button style={{ 
                marginLeft: 'auto',
                background: item.color,
                color: 'white',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}>
                Remind Me
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Groups Section */}
      <SectionHeader>
        <Radio size={16} color={KENYA_THEME.primary} />
        LIVE NOW - Join the Conversation
      </SectionHeader>

      {groups.map((group, index) => (
        <GroupCard 
          key={group.id} 
          $color={group.color}
          $delay={`${index * 0.1}s`}
          onClick={() => setActiveSpace(group)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <GroupIcon className="group-icon" $color={group.color}>
              {group.emoji}
            </GroupIcon>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h4 style={{ margin: 0, fontSize: '16px', color: KENYA_THEME.text.primary }}>
                  {group.name}
                </h4>
                <span style={{ 
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  background: `${group.color}10`,
                  color: group.color,
                  borderRadius: '12px',
                  border: `1px solid ${group.color}30`
                }}>
                  {group.party}
                </span>
              </div>
              
              <p style={{ margin: '4px 0', fontSize: '13px', color: KENYA_THEME.text.secondary }}>
                {group.topic}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <StatsBadge $color={group.color}>
                  <Users size={12} /> {group.active} online
                </StatsBadge>
                <StatsBadge>
                  <MapPin size={12} /> {group.location}
                </StatsBadge>
                <StatsBadge>
                  <Mic size={12} /> {group.host}
                </StatsBadge>
              </div>
            </div>
          </div>
          
          <JoinButton $color={group.color}>
            Join Live
          </JoinButton>
          
          <LiveIndicator $color={group.color} />
        </GroupCard>
      ))}

      {/* Live Audio Space Overlay */}
      {activeSpace && (
        <AudioOverlay>
          {/* Floating Reactions */}
          {reactions.map(r => (
            <FloatingEmoji 
              key={r.id} 
              style={{ 
                right: `${20 + Math.random() * 60}px`,
                bottom: `${100 + Math.random() * 200}px`
              }}
            >
              {r.emoji}
            </FloatingEmoji>
          ))}

          {/* Header */}
          <div style={{ 
            padding: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <button 
              onClick={() => setActiveSpace(null)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={20} />
            </button>
            
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>{activeSpace.name}</h2>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                <span style={{ color: activeSpace.color }}>●</span> LIVE • {activeSpace.active} listening
              </div>
            </div>
            
            <MoreVertical size={20} color="rgba(255, 255, 255, 0.7)" />
          </div>

          {/* Speaker Area */}
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <SpeakerCard>
              <img 
                src={`https://i.pravatar.cc/120?u=${activeSpace.host}`} 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%',
                  border: `3px solid ${activeSpace.color}`,
                  marginBottom: '16px'
                }} 
                alt="Speaker" 
              />
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '16px' }}>
                {[0.1, 0.3, 0.5, 0.7, 0.2, 0.4, 0.6].map((d, i) => (
                  <WaveBar key={i} $delay={d} />
                ))}
              </div>
              
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Hon. {activeSpace.host}</h3>
              <p style={{ margin: '0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                Currently discussing: {activeSpace.topic}
              </p>
            </SpeakerCard>
          </div>

          {/* Comment Feed */}
          <div style={{ 
            flex: 1, 
            padding: '20px', 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column-reverse',
            maxHeight: '30vh'
          }}>
            <div style={{ paddingBottom: '20px' }}>
              {commentsList.map((c, i) => (
                <CommentBubble 
                  key={i} 
                  className={c.user === "You" ? "own" : ""}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '12px', color: c.user === "You" ? KENYA_THEME.primary : '#60A5FA' }}>
                      {c.user}
                    </strong>
                    {c.party && (
                      <span style={{ 
                        fontSize: '10px',
                        padding: '1px 6px',
                        background: `${KENYA_THEME.primary}20`,
                        color: KENYA_THEME.primary,
                        borderRadius: '8px',
                        fontWeight: '700'
                      }}>
                        {c.party}
                      </span>
                    )}
                    <span style={{ 
                      marginLeft: 'auto', 
                      fontSize: '10px', 
                      color: 'rgba(255, 255, 255, 0.5)' 
                    }}>
                      {c.timestamp}
                    </span>
                  </div>
                  <div>{c.text}</div>
                </CommentBubble>
              ))}
            </div>
          </div>

          {/* Reactions Bar */}
          <div style={{ 
            padding: '16px 20px', 
            display: 'flex', 
            justifyContent: 'space-around',
            background: 'rgba(255, 255, 255, 0.05)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {reactionEmojis.map(emoji => (
              <ReactionButton 
                key={emoji}
                onClick={() => addReaction(emoji)}
                style={{
                  background: userReaction === emoji ? KENYA_THEME.primary : 'rgba(255, 255, 255, 0.1)',
                  transform: userReaction === emoji ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {emoji}
              </ReactionButton>
            ))}
          </div>

          {/* Interaction Controls */}
          <div style={{ padding: '24px', background: 'rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <input 
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add your comment..."
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  padding: '12px 20px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
              />
              <button 
                onClick={handleSendComment}
                style={{
                  background: KENYA_THEME.primary,
                  color: 'white',
                  border: 'none',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Send size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={() => setActiveSpace(null)}
                style={{
                  background: KENYA_THEME.opposition,
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '20px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Leave Space
              </button>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}>
                  <Hand size={20} />
                </button>
                <button style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: KENYA_THEME.primary,
                  border: 'none',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}>
                  <Mic size={20} />
                </button>
              </div>
            </div>
          </div>
        </AudioOverlay>
      )}
    </PageContainer>
  );
};

export default GroupsPage;