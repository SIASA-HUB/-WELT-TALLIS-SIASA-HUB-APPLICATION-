import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  ThumbsUp, ThumbsDown, MessageSquare, GraduationCap, 
  FileText, History, CheckCircle, TrendingUp, User,
  ArrowLeft, MapPin, Award, BarChart2, Bookmark, Share2,
  Eye, Calendar, Shield, TrendingDown,
  Globe, Target, AlertTriangle, Users, Map as MapIcon, Star,
  Flag, CheckSquare, XSquare, Heart, Zap, Bell,
  PieChart as PieChartIcon, 
  MessageCircle, AlertCircle,
  Sparkles, Building, Briefcase, Clock,
  Info, BarChart3, Users as UsersIcon,
  Link as LinkIcon,
  ExternalLink,
  Facebook,
  Instagram,
  Twitter,
  Globe as GlobeIcon,
  Briefcase as BriefcaseIcon,
  Target as TargetIcon,
  Heart as HeartIcon
} from 'lucide-react';
import axios from 'axios';
import LeaderHistory from './leaderHistory.jsx';
import LeaderStats from './leaderStatistics.jsx';
import LeaderSupportMap from './leadersSuportMap.jsx';
import ManifestoComments from './manifestoComents.jsx';

// ============================================
// KENYAN THEME
// ============================================
const KENYA_THEME = {
  primary: '#BB0000',
  secondary: '#000000',
  accent: '#006600',
  highlight: '#FFFFFF',
  support: '#00A86B',
  opposition: '#FF6B6B',
  neutral: '#1e293b',
  trending: '#F59E0B',
  background: '#F8FAFC',
  border: '#E2E8F0',
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    light: '#94A3B8'
  },
  partyColors: {
    'UDA': '#BB0000',
    'ODM': '#006600',
    'WIPER': '#8B5CF6',
    'FORD-KENYA': '#10B981',
    'JUBILEE': '#FFD700',
    'NARC-KENYA': '#EC4899',
    'INDEPENDENT': '#6B7280'
  }
};

// Styled Components
const PageContainer = styled.div`
  background: #F8FAFC;
  min-height: 100vh;
`;

const ProfileHero = styled.div`
  background: ${props => props.$color || KENYA_THEME.primary};
  padding: 25px 0px;
  color: white;
  position: relative;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
`;

const Section = styled.div`
  background: white;
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  border: 1px solid #eef2f7;
`;

const TabButton = styled.button`
  padding: 12px 24px;
  border: none;
  background: ${props => props.$active ? KENYA_THEME.primary : KENYA_THEME.background};
  color: ${props => props.$active ? 'white' : KENYA_THEME.text.primary};
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.$active ? '#990000' : '#f1f5f9'};
    transform: translateY(-1px);
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: ${props => {
    if (props.$active) {
      return props.$activecolor || KENYA_THEME.primary;
    }
    if (props.$type === 'like') return '#f0fdf4';
    if (props.$type === 'dislike') return '#fef2f2';
    if (props.$type === 'follow') return '#eff6ff';
    if (props.$type === 'share') return '#faf5ff';
    return KENYA_THEME.background;
  }};
  color: ${props => {
    if (props.$active) return 'white';
    if (props.$type === 'like') return KENYA_THEME.support;
    if (props.$type === 'dislike') return KENYA_THEME.opposition;
    if (props.$type === 'follow') return KENYA_THEME.primary;
    if (props.$type === 'share') return '#8B5CF6';
    return KENYA_THEME.text.primary;
  }};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid ${props => {
    if (props.$active) return 'transparent';
    if (props.$type === 'like') return KENYA_THEME.support;
    if (props.$type === 'dislike') return KENYA_THEME.opposition;
    if (props.$type === 'follow') return KENYA_THEME.primary;
    if (props.$type === 'share') return '#8B5CF6';
    return KENYA_THEME.border;
  }};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    background: ${props => {
      if (props.$active) return props.$activecolor || '#990000';
      if (props.$type === 'like') return KENYA_THEME.support;
      if (props.$type === 'dislike') return KENYA_THEME.opposition;
      if (props.$type === 'follow') return KENYA_THEME.primary;
      if (props.$type === 'share') return '#8B5CF6';
      return '#f1f5f9';
    }};
    color: white;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: ${KENYA_THEME.text.secondary};
  
  .icon {
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  .message {
    font-size: 16px;
    margin-bottom: 8px;
  }
  
  .submessage {
    font-size: 14px;
    color: ${KENYA_THEME.text.light};
  }
`;

const StatCard = styled.div`
  background: ${props => props.$color || KENYA_THEME.background};
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid ${props => props.$borderColor || KENYA_THEME.primary};
  margin-bottom: 15px;
  
  .stat-value {
    font-size: 28px;
    font-weight: 800;
    color: ${props => props.$textColor || KENYA_THEME.text.primary};
    margin-bottom: 5px;
  }
  
  .stat-label {
    font-size: 14px;
    color: ${KENYA_THEME.text.secondary};
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const AchievementTag = styled.span`
  background: ${props => {
    const tags = {
      'experienced': '#fef3c7',
      'politician': '#e0f2fe',
      'EALA member': '#fce7f3',
      'ODM nominee': '#dcfce7',
      'East African Community representative': '#f3e8ff',
      'default': '#f1f5f9'
    };
    return tags[props.$tag] || tags.default;
  }};
  color: ${props => {
    const tags = {
      'experienced': '#92400e',
      'politician': '#0369a1',
      'EALA member': '#be185d',
      'ODM nominee': '#065f46',
      'East African Community representative': '#7c3aed',
      'default': '#475569'
    };
    return tags[props.$tag] || tags.default;
  }};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 4px;
`;

// Main Component
const LeaderInsightPage = ({ leaderId, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [leader, setLeader] = useState(null);
  const [userActions, setUserActions] = useState({
    hasLiked: false,
    hasDisliked: false,
    isFollowing: false
  });
  const [manifestos, setManifestos] = useState([]);
  const [selectedManifesto, setSelectedManifesto] = useState(null);
  const [leaderComments, setLeaderComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  
  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      // Try to get userData from localStorage (your format)
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        if (userData.user_id) {
          return {
            id: userData.user_id,
            name: userData.user_name || 'Anonymous User',
            email: userData.email || ''
          };
        }
      }
      
      // Try to get currentUser from localStorage (alternative format)
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser.id) {
          return {
            id: currentUser.id,
            name: currentUser.name || 'Anonymous User',
            email: currentUser.email || ''
          };
        }
      }
      
      // Create anonymous user if no data exists
      const randomId = `USR-${Math.random().toString(36).substr(2, 9)}`;
      const randomName = `Anon-KE-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      // Save to localStorage for future use
      localStorage.setItem('userData', JSON.stringify({
        user_id: randomId,
        user_name: randomName,
        email: ''
      }));
      
      return {
        id: randomId,
        name: randomName,
        email: ''
      };
    } catch (error) {
      console.error('Error getting user data:', error);
      
      // Fallback anonymous user
      return {
        id: `USR-${Math.random().toString(36).substr(2, 9)}`,
        name: `Anon-KE-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        email: ''
      };
    }
  };
  
  const currentUser = getCurrentUser();
  
  // API configuration
  const API_BASE_URL = 'http://localhost:8006';
  
  // Initialize axios
  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Fetch leader data dynamically from API
  useEffect(() => {
    const fetchLeaderData = async () => {
      if (!leaderId) {
        console.error('No leader ID provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // 1. Fetch leader details from your API
        const leaderResponse = await api.get(`/api/v1/leaders/${leaderId}`);
        
        if (leaderResponse?.data?.success && leaderResponse.data.data) {
          const leaderData = leaderResponse.data.data;
          console.log('Leader data fetched:', leaderData);
          setLeader(processLeaderData(leaderData));
        } else {
          console.error('Invalid API response format:', leaderResponse.data);
          setLeader(createEmptyData(leaderId));
        }
        
        // 2. Fetch leader's manifestos
        try {
          const manifestosResponse = await api.get(`/api/v1/leaders/${leaderId}/manifestos`);
          if (manifestosResponse?.data) {
            const manifestosData = Array.isArray(manifestosResponse.data) 
              ? manifestosResponse.data 
              : manifestosResponse.data.manifestos || [];
            setManifestos(manifestosData);
            
            // Select first manifesto by default
            if (manifestosData.length > 0 && !selectedManifesto) {
              setSelectedManifesto(manifestosData[0].id || manifestosData[0]._id || manifestosData[0].manifesto_id);
            }
          }
        } catch (manifestosError) {
          console.log('Manifestos fetch error:', manifestosError.message);
          setManifestos([]);
        }
        
        // 3. Fetch user interaction status
        try {
          const interactionResponse = await api.get(
            `/api/v1/leaders/${leaderId}/interactions/${currentUser.id}`
          );
          
          if (interactionResponse?.data) {
            setUserActions({
              hasLiked: interactionResponse.data.hasLiked || false,
              hasDisliked: interactionResponse.data.hasDisliked || false,
              isFollowing: interactionResponse.data.isFollowing || false
            });
          }
        } catch (interactionError) {
          console.log('Interaction fetch error:', interactionError.message);
        }
        
        // 4. Track view
        try {
          await api.post('/api/v1/leaders/view', {
            leader_id: leaderId,
            user_id: currentUser.id,
            user_name: currentUser.name
          });
        } catch (viewError) {
          console.log('View tracking error:', viewError.message);
        }
        
      } catch (error) {
        console.error('Error fetching leader data:', error);
        setLeader(createEmptyData(leaderId));
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderData();
  }, [leaderId]);
  
  // Fetch leader comments
  useEffect(() => {
    const fetchLeaderComments = async () => {
      if (!leaderId) return;
      
      try {
        setLoadingComments(true);
        const response = await api.get(`/api/v1/leaders/${leaderId}/comments`);
        if (response?.data) {
          setLeaderComments(Array.isArray(response.data) ? response.data : response.data.comments || []);
        }
      } catch (error) {
        console.log('Error fetching comments:', error.message);
        setLeaderComments([]);
      } finally {
        setLoadingComments(false);
      }
    };
    
    if (activeTab === 'comments') {
      fetchLeaderComments();
    }
  }, [leaderId, activeTab]);
  
  const processLeaderData = (apiData) => {
    if (!apiData) return createEmptyData();
    
    // Extract stats from API response
    const stats = apiData.stats || {};
    const likes = stats.likes || 0;
    const dislikes = stats.dislikes || 0;
    const totalVotes = likes + dislikes;
    const approval = totalVotes > 0 ? Math.round((likes / totalVotes) * 100) : 0;
    
    // Process education data
    const education = apiData.education || 
                    (apiData.parsed_tags && apiData.parsed_tags.find(tag => tag.education)?.education) || 
                    'Education information not available';
    
    // Process achievements/experience tags
    const achievementTags = apiData.parsed_tags ? 
      apiData.parsed_tags.filter(tag => typeof tag === 'string' && tag !== 'education') : 
      [];
    
    // Process portfolio/social links
    const portfolio = apiData.portfolio || [];
    const socialLinks = {
      website: portfolio.find(p => p.type === 'website')?.url,
      facebook: portfolio.find(p => p.type === 'facebook')?.url,
      instagram: portfolio.find(p => p.type === 'instagram')?.url,
      twitter: portfolio.find(p => p.type === 'twitter')?.url
    };
    
    return {
      id: apiData.leader_id || leaderId,
      name: apiData.name || 'Unknown Leader',
      party: apiData.party || 'INDEPENDENT',
      position: apiData.position || 'Political Leader',
      county: apiData.county || apiData.location || 'Kenya',
      profilePhoto: apiData.image_url || '',
      approval: approval,
      likes: likes,
      dislikes: dislikes,
      views: stats.views || 0,
      followers: stats.followers || 0,
      comments: [],
      education: Array.isArray(education) ? education.join(', ') : education,
      verification: apiData.verification === 1,
      trustScore: Math.floor(approval * 0.8),
      manifestoApprovals: 0,
      bio: `${apiData.name} is a ${apiData.position || 'political leader'} from ${apiData.county || apiData.location || 'Kenya'}. Member of ${apiData.party || 'INDEPENDENT'} party.`,
      achievements: achievementTags,
      experience: achievementTags, // Same as achievements for now
      contact: socialLinks,
      status: apiData.status || 'active',
      portfolio: portfolio,
      socialLinks: socialLinks,
      createdAt: apiData.created_at,
      updatedAt: apiData.updated_at
    };
  };
  
  const createEmptyData = (id = null) => {
    return {
      id: id || 'empty',
      name: 'Loading Leader Information',
      party: 'INFORMATION',
      position: 'Details Pending',
      county: 'Kenya',
      profilePhoto: '',
      approval: 0,
      likes: 0,
      dislikes: 0,
      views: 0,
      followers: 0,
      comments: [],
      education: 'Education details to be added',
      verification: false,
      trustScore: 0,
      manifestoApprovals: 0,
      bio: 'Leader information is being compiled and will be available shortly.',
      achievements: ['Information coming soon'],
      experience: [],
      contact: {},
      status: 'loading'
    };
  };
  
  // Handle like
  const handleLike = async () => {
    if (!leaderId || userActions.hasLiked) return;
    
    try {
      const response = await api.post('/api/v1/leaders/like', {
        leader_id: leaderId,
        user_id: currentUser.id,
        user_name: currentUser.name
      });
      
      if (response.data.success) {
        setUserActions(prev => ({
          ...prev,
          hasLiked: true,
          hasDisliked: false
        }));
        
        setLeader(prev => ({
          ...prev,
          likes: (prev.likes || 0) + 1,
          dislikes: prev.hasDisliked ? Math.max(0, (prev.dislikes || 0) - 1) : prev.dislikes
        }));
      }
    } catch (err) {
      console.log('Like failed:', err.message);
      alert('Failed to like. Please try again.');
    }
  };
  
  // Handle dislike
  const handleDislike = async () => {
    if (!leaderId || userActions.hasDisliked) return;
    
    try {
      const response = await api.post('/api/v1/leaders/dislike', {
        leader_id: leaderId,
        user_id: currentUser.id,
        user_name: currentUser.name
      });
      
      if (response.data.success) {
        setUserActions(prev => ({
          ...prev,
          hasLiked: false,
          hasDisliked: true
        }));
        
        setLeader(prev => ({
          ...prev,
          dislikes: (prev.dislikes || 0) + 1,
          likes: prev.hasLiked ? Math.max(0, (prev.likes || 0) - 1) : prev.likes
        }));
      }
    } catch (err) {
      console.log('Dislike failed:', err.message);
      alert('Failed to dislike. Please try again.');
    }
  };
  
  // Handle follow - Make button red when following
  const handleFollowToggle = async () => {
    if (!leaderId) return;
    
    try {
      if (userActions.isFollowing) {
        // Unfollow
        const response = await api.post('/api/v1/leaders/unfollow', {
          leader_id: leaderId,
          user_id: currentUser.id
        });
        
        if (response.data.success) {
          setUserActions(prev => ({ ...prev, isFollowing: false }));
          setLeader(prev => ({
            ...prev,
            followers: Math.max(0, (prev.followers || 0) - 1)
          }));
          alert('You have unfollowed this leader.');
        }
      } else {
        // Follow
        const response = await api.post('/api/v1/leaders/follow', {
          leader_id: leaderId,
          user_id: currentUser.id,
          user_name: currentUser.name
        });
        
        if (response.data.success) {
          setUserActions(prev => ({ ...prev, isFollowing: true }));
          setLeader(prev => ({
            ...prev,
            followers: (prev.followers || 0) + 1
          }));
          alert('You are now following this leader!');
        }
      }
    } catch (err) {
      console.log('Follow toggle failed:', err.message);
      alert('Failed to update follow status. Please try again.');
    }
  };
  
  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!comment.trim() || !leaderId) return;
    
    try {
      const response = await api.post('/api/v1/leaders/comment', {
        leader_id: leaderId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        comment: comment.trim()
      });
      
      if (response.data.success) {
        // Add comment to local state
        const newComment = {
          id: Date.now(),
          user_name: currentUser.name,
          comment: comment.trim(),
          timestamp: new Date().toISOString()
        };
        
        setLeaderComments(prev => [newComment, ...prev]);
        setComment('');
        alert('Comment posted successfully!');
      }
    } catch (err) {
      console.log('Comment failed:', err.message);
      alert('Failed to post comment. Please try again.');
    }
  };
  
  // Render social links
  const renderSocialLinks = () => {
    if (!leader?.socialLinks) return null;
    
    const { website, facebook, instagram, twitter } = leader.socialLinks;
    const links = [];
    
    if (website) links.push({ icon: <GlobeIcon size={16} />, url: website, label: 'Website' });
    if (facebook) links.push({ icon: <Facebook size={16} />, url: facebook, label: 'Facebook' });
    if (instagram) links.push({ icon: <Instagram size={16} />, url: instagram, label: 'Instagram' });
    if (twitter) links.push({ icon: <Twitter size={16} />, url: twitter, label: 'Twitter' });
    
    if (links.length === 0) return null;
    
    return (
      <div style={{ marginTop: '20px' }}>
        <h4 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          color: KENYA_THEME.text.secondary,
          marginBottom: '15px'
        }}>
          <LinkIcon size={20} />
          Connect
        </h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: KENYA_THEME.background,
                border: `1px solid ${KENYA_THEME.border}`,
                borderRadius: '8px',
                color: KENYA_THEME.text.primary,
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = KENYA_THEME.background;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {link.icon}
              {link.label}
              <ExternalLink size={12} />
            </a>
          ))}
        </div>
      </div>
    );
  };
  
  // Render achievement/experience tags with better visibility
  const renderAchievementTags = () => {
    if (!leader?.achievements || leader.achievements.length === 0) return null;
    
    return (
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          color: KENYA_THEME.text.secondary,
          marginBottom: '15px'
        }}>
          <TargetIcon size={20} />
          Experience & Expertise
        </h4>
        <div style={{
          background: KENYA_THEME.background,
          padding: '20px',
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {leader.achievements.map((achievement, index) => (
              <AchievementTag key={index} $tag={achievement.toLowerCase()}>
                {achievement.includes('experienced') && <BriefcaseIcon size={14} />}
                {achievement.includes('politician') && <User size={14} />}
                {achievement.includes('EALA') && <GlobeIcon size={14} />}
                {achievement.includes('ODM') && <Flag size={14} />}
                {achievement.includes('East African') && <HeartIcon size={14} />}
                {achievement}
              </AchievementTag>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Always show the component
  const partyColor = leader?.party ? (KENYA_THEME.partyColors[leader.party] || KENYA_THEME.neutral) : KENYA_THEME.neutral;
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'history', label: 'History', icon: History },
    { id: 'stats', label: 'Statistics', icon: BarChart2 },
    { id: 'support', label: 'Support Map', icon: MapIcon },
    { id: 'manifestos', label: 'Manifestos', icon: FileText },
    { id: 'comments', label: 'Comments', icon: MessageSquare }
  ];
  
  // Default leader data if none exists
  const displayLeader = leader || createEmptyData();
  
  return (
    <PageContainer>
      {/* Header */}
      <ProfileHero $color={partyColor}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '25px',
            cursor: 'pointer',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '600',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s'
          }}
        >
          <ArrowLeft size={18} />
          Back to Leaders List
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px', flexWrap: 'wrap' }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '20px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }}>
            {displayLeader.profilePhoto ? (
              <img 
                src={displayLeader.profilePhoto} 
                alt={displayLeader.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<User size={48} color="${partyColor}" />`;
                }}
              />
            ) : (
              <User size={48} color={partyColor} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: '800' }}>
              {displayLeader.name}
              {displayLeader.verification && (
                <CheckCircle 
                  size={20} 
                  color="#10B981" 
                  style={{ marginLeft: '8px', verticalAlign: 'middle' }}
                />
              )}
            </h2>
            <p style={{ margin: '0 0 15px 0', fontSize: '18px', opacity: 0.95 }}>
              {displayLeader.position} • <span style={{ fontWeight: '700' }}>{displayLeader.party}</span>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} />
                {displayLeader.county}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} />
                {displayLeader.views?.toLocaleString?.() || '0'} views
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UsersIcon size={18} />
                {displayLeader.followers?.toLocaleString?.() || '0'} followers
              </span>
              <span style={{ 
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontWeight: '600',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Star size={14} />
                {displayLeader.status?.toUpperCase() || 'ACTIVE'}
              </span>
              {displayLeader.approval > 0 && (
                <span style={{ 
                  background: displayLeader.approval > 70 ? 'rgba(16, 185, 129, 0.2)' : 
                            displayLeader.approval > 50 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: displayLeader.approval > 70 ? '#10b981' : 
                         displayLeader.approval > 50 ? '#d97706' : '#dc2626',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontWeight: '800',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <BarChart2 size={18} />
                  {displayLeader.approval}% Approval
                </span>
              )}
            </div>
          </div>
        </div>
      </ProfileHero>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Loading indicator */}
        {loading && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '40px',
            color: KENYA_THEME.text.secondary,
            fontSize: '16px'
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: `4px solid ${KENYA_THEME.background}`,
              borderTop: `4px solid ${partyColor}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '20px'
            }} />
            Loading {displayLeader.name}'s profile...
          </div>
        )}
        
        {!loading && displayLeader && (
          <>
            {/* Action Buttons with different background colors */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '25px', flexWrap: 'wrap' }}>
              <ActionButton 
                $active={userActions.hasLiked}
                $activecolor={KENYA_THEME.support}
                $type="like"
                onClick={handleLike}
                disabled={userActions.hasLiked}
              >
                <ThumbsUp size={20} />
                {userActions.hasLiked ? 'Liked' : 'Like'} ({displayLeader.likes?.toLocaleString?.() || '0'})
              </ActionButton>
              
              <ActionButton 
                $active={userActions.hasDisliked}
                $activecolor={KENYA_THEME.opposition}
                $type="dislike"
                onClick={handleDislike}
                disabled={userActions.hasDisliked}
              >
                <ThumbsDown size={20} />
                {userActions.hasDisliked ? 'Disliked' : 'Dislike'} ({displayLeader.dislikes?.toLocaleString?.() || '0'})
              </ActionButton>
              
              {/* Follow button - Red when following */}
              <ActionButton 
                $active={userActions.isFollowing}
                $activecolor="#dc2626" // Red color for following
                $type="follow"
                onClick={handleFollowToggle}
              >
                {userActions.isFollowing ? <CheckCircle size={20} /> : <Bell size={20} />}
                {userActions.isFollowing ? 'Following' : 'Follow'} ({displayLeader.followers?.toLocaleString?.() || '0'})
              </ActionButton>
              
              {/* Share button only - Download button removed */}
              <ActionButton 
                $type="share"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ 
                      title: displayLeader.name, 
                      text: `Check out ${displayLeader.name}'s profile on Kenyan Leaders Platform`, 
                      url: window.location.href 
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
              >
                <Share2 size={20} />
                Share
              </ActionButton>
            </div>
            
            {/* Quick Stats Bar */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px', 
              marginBottom: '25px' 
            }}>
              <StatCard 
                $color="#f0fdf4" 
                $borderColor={KENYA_THEME.support}
                $textColor={KENYA_THEME.support}
              >
                <div className="stat-value">{displayLeader.likes}</div>
                <div className="stat-label">
                  <ThumbsUp size={16} />
                  Likes
                </div>
              </StatCard>
              
              <StatCard 
                $color="#fef2f2" 
                $borderColor={KENYA_THEME.opposition}
                $textColor={KENYA_THEME.opposition}
              >
                <div className="stat-value">{displayLeader.dislikes}</div>
                <div className="stat-label">
                  <ThumbsDown size={16} />
                  Dislikes
                </div>
              </StatCard>
              
              <StatCard 
                $color="#eff6ff" 
                $borderColor={KENYA_THEME.primary}
                $textColor={KENYA_THEME.primary}
              >
                <div className="stat-value">{displayLeader.views}</div>
                <div className="stat-label">
                  <Eye size={16} />
                  Views
                </div>
              </StatCard>
              
              <StatCard 
                $color="#faf5ff" 
                $borderColor="#8B5CF6"
                $textColor="#8B5CF6"
              >
                <div className="stat-value">{displayLeader.followers}</div>
                <div className="stat-label">
                  <UsersIcon size={16} />
                  Followers
                </div>
              </StatCard>
            </div>
            
            {/* Tabs */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '25px',
              overflowX: 'auto',
              padding: '10px 0'
            }}>
              {tabs.map(tab => (
                <TabButton
                  key={tab.id}
                  $active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </TabButton>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <Section>
                <h3 style={{ margin: '0 0 20px 0', color: KENYA_THEME.text.primary, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={20} />
                  Leader Overview
                </h3>
                
                {/* Education */}
                <div style={{ marginBottom: '25px' }}>
                  <h4 style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    color: KENYA_THEME.text.secondary,
                    marginBottom: '15px'
                  }}>
                    <GraduationCap size={20} />
                    Education
                  </h4>
                  <div style={{
                    background: KENYA_THEME.background,
                    padding: '20px',
                    borderRadius: '12px',
                    borderLeft: `4px solid ${KENYA_THEME.accent}`,
                    color: KENYA_THEME.text.primary,
                    lineHeight: '1.6',
                    fontSize: '15px'
                  }}>
                    {displayLeader.education}
                  </div>
                </div>
                
                {/* Experience/Achievement Tags - Made more visible */}
                {renderAchievementTags()}
                
                {/* Bio */}
                <div style={{ marginBottom: '25px' }}>
                  <h4 style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    color: KENYA_THEME.text.secondary,
                    marginBottom: '15px'
                  }}>
                    <FileText size={20} />
                    Biography
                  </h4>
                  <div style={{
                    background: KENYA_THEME.background,
                    padding: '20px',
                    borderRadius: '12px',
                    lineHeight: '1.6',
                    color: KENYA_THEME.text.primary,
                    fontSize: '15px'
                  }}>
                    {displayLeader.bio}
                  </div>
                </div>
                
                {/* Social Links */}
                {renderSocialLinks()}
              </Section>
            )}
            
            {/* History Tab */}
            {activeTab === 'history' && (
              <Section>
                <h3 style={{ margin: '0 0 20px 0', color: KENYA_THEME.text.primary, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <History size={20} />
                  Political History & Timeline
                </h3>
                <LeaderHistory 
                  leaderId={leaderId}
                  leaderData={displayLeader}
                  theme={KENYA_THEME}
                />
              </Section>
            )}
            
            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <Section>
                <h3 style={{ margin: '0 0 20px 0', color: KENYA_THEME.text.primary, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BarChart3 size={20} />
                  Statistics & Analytics
                </h3>
                <LeaderStats 
                  leaderId={leaderId}
                  leaderData={displayLeader}
                  theme={KENYA_THEME}
                />
              </Section>
            )}
            
            {/* Support Map Tab */}
            {activeTab === 'support' && (
              <Section>
                <h3 style={{ margin: '0 0 20px 0', color: KENYA_THEME.text.primary, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapIcon size={20} />
                  Support Map & Regional Analysis
                </h3>
                <LeaderSupportMap 
                  leaderId={leaderId}
                  leaderData={displayLeader}
                  theme={KENYA_THEME}
                />
              </Section>
            )}
            
            {/* Manifestos Tab */}
            {activeTab === 'manifestos' && (
              <Section>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ margin: '0 0 20px 0', color: KENYA_THEME.text.primary, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={20} />
                    {displayLeader.name}'s Manifestos
                  </h3>
                  
                  {/* Manifesto Selection */}
                  {manifestos.length > 0 ? (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        {manifestos.map(manifesto => (
                          <button
                            key={manifesto.id || manifesto._id || manifesto.manifesto_id}
                            onClick={() => setSelectedManifesto(manifesto.id || manifesto._id || manifesto.manifesto_id)}
                            style={{
                              padding: '12px 24px',
                              background: (manifesto.id || manifesto._id || manifesto.manifesto_id) === selectedManifesto ? partyColor : KENYA_THEME.background,
                              color: (manifesto.id || manifesto._id || manifesto.manifesto_id) === selectedManifesto ? 'white' : KENYA_THEME.text.primary,
                              border: `2px solid ${(manifesto.id || manifesto._id || manifesto.manifesto_id) === selectedManifesto ? partyColor : KENYA_THEME.border}`,
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '14px',
                              transition: 'all 0.3s'
                            }}
                          >
                            {manifesto.title || `Manifesto ${manifesto.id}`}
                          </button>
                        ))}
                      </div>
                      
                      {/* Show selected manifesto content */}
                      {selectedManifesto && (
                        <div>
                          {manifestos.map(manifesto => {
                            if ((manifesto.id || manifesto._id || manifesto.manifesto_id) === selectedManifesto) {
                              return (
                                <div key={manifesto.id || manifesto._id || manifesto.manifesto_id}>
                                  <h4 style={{ color: KENYA_THEME.text.primary, marginBottom: '10px', fontSize: '18px' }}>
                                    {manifesto.title || 'Manifesto'}
                                  </h4>
                                  <p style={{ color: KENYA_THEME.text.secondary, marginBottom: '20px', lineHeight: '1.6', fontSize: '15px' }}>
                                    {manifesto.description || 'No description available.'}
                                  </p>
                                  
                                  {/* Comments for this manifesto */}
                                  <ManifestoComments 
                                    manifestoId={selectedManifesto}
                                    leaderId={leaderId}
                                    leaderName={displayLeader.name}
                                  />
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState>
                      <FileText size={48} className="icon" />
                      <div className="message">No manifestos available</div>
                      <div className="submessage">{displayLeader.name} has not published any manifestos yet.</div>
                    </EmptyState>
                  )}
                </div>
              </Section>
            )}
            
            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <Section>
                <h3 style={{ margin: '0 0 20px 0', color: KENYA_THEME.text.primary, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MessageSquare size={20} />
                  Comments & Feedback
                </h3>
                
                {/* Comment Input */}
                <div style={{ marginBottom: '30px' }}>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={`Share your thoughts about ${displayLeader.name}...`}
                    style={{
                      width: '100%',
                      padding: '15px',
                      borderRadius: '12px',
                      border: `2px solid ${KENYA_THEME.border}`,
                      fontSize: '14px',
                      minHeight: '100px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      marginBottom: '15px',
                      transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = partyColor;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = KENYA_THEME.border;
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: KENYA_THEME.text.light }}>
                      Your comment will be visible to everyone
                    </span>
                    <button
                      onClick={handleCommentSubmit}
                      disabled={!comment.trim()}
                      style={{
                        padding: '12px 28px',
                        background: comment.trim() ? partyColor : KENYA_THEME.border,
                        color: comment.trim() ? 'white' : KENYA_THEME.text.light,
                        border: 'none',
                        borderRadius: '8px',
                        cursor: comment.trim() ? 'pointer' : 'not-allowed',
                        fontWeight: '600',
                        fontSize: '14px',
                        opacity: comment.trim() ? 1 : 0.6,
                        transition: 'all 0.3s'
                      }}
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
                
                {/* Comments List */}
                <div>
                  <h5 style={{ margin: '0 0 15px 0', color: KENYA_THEME.text.secondary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={16} />
                    Recent Comments ({leaderComments.length})
                  </h5>
                  
                  {loadingComments ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: KENYA_THEME.text.secondary }}>
                      Loading comments...
                    </div>
                  ) : leaderComments.length > 0 ? (
                    <div>
                      {leaderComments.map((commentItem, index) => (
                        <div 
                          key={commentItem.id || index}
                          style={{
                            padding: '20px',
                            background: index % 2 === 0 ? KENYA_THEME.background : 'white',
                            borderRadius: '12px',
                            marginBottom: '15px',
                            border: `1px solid ${KENYA_THEME.border}`,
                            transition: 'transform 0.3s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <User size={14} />
                              {commentItem.user_name || 'Anonymous User'}
                            </div>
                            <div style={{ fontSize: '12px', color: KENYA_THEME.text.light }}>
                              {commentItem.timestamp ? new Date(commentItem.timestamp).toLocaleDateString() : 'Recently'}
                            </div>
                          </div>
                          <div style={{ color: KENYA_THEME.text.primary, lineHeight: '1.6', fontSize: '14px' }}>
                            {commentItem.comment || commentItem.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState>
                      <MessageSquare size={48} className="icon" />
                      <div className="message">No comments yet</div>
                      <div className="submessage">Be the first to share your thoughts about {displayLeader.name}</div>
                    </EmptyState>
                  )}
                </div>
              </Section>
            )}
          </>
        )}
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </PageContainer>
  );
};

export default LeaderInsightPage;