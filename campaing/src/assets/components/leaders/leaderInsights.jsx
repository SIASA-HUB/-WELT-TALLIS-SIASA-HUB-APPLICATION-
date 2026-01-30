// LeaderInsightPage.jsx - Fixed version
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  ThumbsUp, ThumbsDown, MessageSquare, GraduationCap, 
  FileText, History, CheckCircle, TrendingUp, User,
  ArrowLeft, MapPin, Award, BarChart2, Bookmark, Share2,
  Eye, Calendar, Shield, TrendingDown, Download,
  Globe, Target, AlertTriangle, Users, Map, Star,
  Flag, CheckSquare, XSquare, Heart, Zap,
  PieChart as PieChartIcon, 
  MessageCircle, TrendingUp as UpTrend, TrendingDown as DownTrend
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
  LineChart, Line, Legend, ScatterChart, Scatter, 
  ZAxis, AreaChart, Area
} from 'recharts';

// Import separate components
import LeaderHistorySwahili from   './leaderHistory'
import LeaderStats from './leaderStatistics';
import LeaderSupportMap from './leadersSuportMap';

// KENYAN THEME
const KENYA_THEME = {
  primary: '#BB0000',
  secondary: '#000000',
  accent: '#006600',
  highlight: '#FFFFFF',
  support: '#00A86B',
  opposition: '#FF6B6B',
  neutral: '#6B7280',
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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
`;

const ProfileHero = styled.div`
  background: ${props => props.$color || KENYA_THEME.primary};
  padding: 25px 20px;
  color: white;
  position: relative;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
`;

const Section = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  border: 1px solid #eef2f7;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  }
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
  background: ${props => props.$active ? props.$activecolor || KENYA_THEME.primary : KENYA_THEME.background};
  color: ${props => props.$active ? 'white' : KENYA_THEME.text.primary};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.$active ? 'transparent' : KENYA_THEME.border};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    background: ${props => props.$active ? props.$activecolor || '#990000' : '#f1f5f9'};
  }
`;

// Main Component
const LeaderInsightPage = ({ leaderId, onBack, onLike, onDislike, onComment, onView }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [comment, setComment] = useState('');
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leader, setLeader] = useState(null);
  const [error, setError] = useState(null);
  
  // Fetch leader data by ID
  useEffect(() => {
    const fetchLeaderData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:5004/leaders/${leaderId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch leader: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setLeader(processLeaderData(data.data));
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Error fetching leader:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (leaderId) {
      fetchLeaderData();
    }
  }, [leaderId]);
  
  const processLeaderData = (data) => {
    // Process data similar to your existing function
    const totalVotes = (data.likes || 0) + (data.dislikes || 0);
    const approval = totalVotes > 0 ? Math.round(((data.likes || 0) / totalVotes) * 100) : 50;
    
    return {
      id: data.id,
      name: data.name || 'Kiongozi asiyejulikana',
      party: data.party || 'INDEPENDENT',
      position: data.position || 'Kiongozi wa Kisiasa',
      county: data.county || 'Kenya',
      profilePhoto: data.profilePhoto || '',
      approval: approval,
      likes: data.likes || 0,
      dislikes: data.dislikes || 0,
      views: data.views || 0,
      comments: data.comments || [],
      education: data.education || 'Elimu haijasajiliwa',
      verification: data.verification === 1,
      trustScore: data.trustScore || Math.floor(approval * 0.8),
      manifestoApprovals: data.manifesto_approvals || 0,
      // Add other fields as needed
    };
  };
  
  const handleLike = () => {
    if (!hasLiked) {
      setHasLiked(true);
      setHasDisliked(false);
      if (onLike && leader) onLike(leader.id);
    }
  };
  
  const handleDislike = () => {
    if (!hasDisliked) {
      setHasDisliked(true);
      setHasLiked(false);
      if (onDislike && leader) onDislike(leader.id);
    }
  };
  
  const handleComment = () => {
    if (comment.trim() && onComment && leader) {
      onComment(leader.id, comment);
      setComment('');
    }
  };
  
  if (loading) {
    return (
      <PageContainer>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', color: KENYA_THEME.text.secondary }}>
            Inapakia taarifa za kiongozi...
          </div>
        </div>
      </PageContainer>
    );
  }
  
  if (error || !leader) {
    return (
      <PageContainer>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', color: KENYA_THEME.opposition, marginBottom: '20px' }}>
            {error || 'Kiongozi huyo hajapatikana'}
          </div>
          <button
            onClick={onBack}
            style={{
              padding: '12px 24px',
              background: KENYA_THEME.primary,
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <ArrowLeft size={16} style={{ marginRight: '8px' }} />
            Rudi Nyuma
          </button>
        </div>
      </PageContainer>
    );
  }
  
  const partyColor = KENYA_THEME.partyColors[leader.party] || KENYA_THEME.neutral;
  const tabs = [
    { id: 'overview', label: 'Maelezo ya Jumla', icon: FileText },
    { id: 'history', label: 'Historia', icon: History },
    { id: 'stats', label: 'Takwimu', icon: BarChart2 },
    { id: 'support', label: 'Usaidizi', icon: Map },
    { id: 'comments', label: 'Maoni', icon: MessageSquare }
  ];
  
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
          Rudi kwenye Orodha ya Watawala
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '20px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }}>
            {leader.profilePhoto ? (
              <img 
                src={leader.profilePhoto} 
                alt={leader.name}
                style={{ width: '100%', height: '100%', borderRadius: '20px', objectFit: 'cover' }}
              />
            ) : (
              <User size={48} color={partyColor} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: '800' }}>
              {leader.name}
            </h2>
            <p style={{ margin: '0 0 15px 0', fontSize: '18px', opacity: 0.95 }}>
              {leader.position} • <span style={{ fontWeight: '700' }}>{leader.party}</span>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} />
                {leader.county}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} />
                {leader.views.toLocaleString()} machapisho
              </span>
              <span style={{ 
                background: leader.approval > 70 ? 'rgba(16, 185, 129, 0.2)' : 
                          leader.approval > 50 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: leader.approval > 70 ? '#10b981' : 
                       leader.approval > 50 ? '#d97706' : '#dc2626',
                padding: '8px 16px',
                borderRadius: '20px',
                fontWeight: '800',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <BarChart2 size={18} />
                {leader.approval}% Ridhaa
              </span>
            </div>
          </div>
        </div>
      </ProfileHero>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '25px', flexWrap: 'wrap' }}>
          <ActionButton 
            $active={hasLiked}
            $activecolor={KENYA_THEME.support}
            onClick={handleLike}
          >
            <ThumbsUp size={20} />
            Unga Mkono ({leader.likes.toLocaleString()})
          </ActionButton>
          
          <ActionButton 
            $active={hasDisliked}
            $activecolor={KENYA_THEME.opposition}
            onClick={handleDislike}
          >
            <ThumbsDown size={20} />
            Kosa ({leader.dislikes.toLocaleString()})
          </ActionButton>
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
        {activeTab === 'history' ? (
          <LeaderHistorySwahili leaderId={leaderId} leaderData={leader} />
        ) : activeTab === 'stats' ? (
          <LeaderStats leaderData={leader} />
        ) : activeTab === 'support' ? (
          <LeaderSupportMap leaderData={leader} />
        ) : activeTab === 'overview' && (
          <Section>
            <h3 style={{ margin: '0 0 20px 0', color: KENYA_THEME.text.primary }}>
              Maelezo ya Kiongozi
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
                Elimu
              </h4>
              <div style={{
                background: KENYA_THEME.background,
                padding: '15px',
                borderRadius: '12px',
                borderLeft: `4px solid ${KENYA_THEME.accent}`
              }}>
                {leader.education}
              </div>
            </div>
            
            {/* Trust Score */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                color: KENYA_THEME.text.secondary,
                marginBottom: '15px'
              }}>
                <Shield size={20} />
                Alama ya Uaminifu
              </h4>
              <div style={{
                background: '#f0fdf4',
                padding: '15px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', fontWeight: '800', color: KENYA_THEME.support }}>
                  {leader.trustScore}%
                </div>
                <div style={{ fontSize: '14px', color: KENYA_THEME.text.secondary }}>
                  Kulingana na utendaji na ukaguzi wa jamii
                </div>
              </div>
            </div>
          </Section>
        )}
      </div>
    </PageContainer>
  );
};

export default LeaderInsightPage;