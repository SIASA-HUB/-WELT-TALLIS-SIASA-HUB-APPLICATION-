import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  ThumbsUp, ThumbsDown, BarChart2, Users, Calendar, 
  ArrowLeft, Target, Heart, Award, Shield, BookOpen,
  TrendingUp, CheckCircle, XCircle, Loader2, Eye,
  Clock, MessageSquare, Star, Zap, ExternalLink,
  FileText, CheckSquare, XSquare, AlertCircle,
  PieChart, TrendingDown, Download
} from 'lucide-react';
import axios from 'axios';
import ManifestoComments from './manifestoComents';

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
  warning: '#F59E0B',
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

// ============================================
// STYLED COMPONENTS
// ============================================
const PageContainer = styled.div`
  background: ${KENYA_THEME.background};
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Header = styled.div`
  background: ${props => props.$color || KENYA_THEME.primary};
  color: white;
  padding: 1.5rem 1rem;
  
  @media (min-width: 768px) {
    padding: 2rem 2rem;
  }
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  
  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }
`;

const ManifestoCard = styled.div`
  background: ${props => props.$isEven ? 'white' : KENYA_THEME.background};
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid ${props => props.$isEven ? KENYA_THEME.border : 'transparent'};
  box-shadow: ${props => props.$isEven 
    ? '0 1px 3px rgba(0,0,0,0.05)'
    : '0 4px 6px rgba(0,0,0,0.03)'
  };
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 12px;
  }
`;

const StatsBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  flex-wrap: wrap;
  
  @media (max-width: 640px) {
    gap: 0.75rem;
  }
`;

const StatBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  
  &.approve {
    background: ${KENYA_THEME.support}15;
    color: ${KENYA_THEME.support};
  }
  
  &.reject {
    background: ${KENYA_THEME.opposition}15;
    color: ${KENYA_THEME.opposition};
  }
  
  &.neutral {
    background: ${KENYA_THEME.neutral}10;
    color: ${KENYA_THEME.neutral};
  }
`;

const ProgressContainer = styled.div`
  margin: 2rem 0;
  
  .progress-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    
    span {
      font-size: 0.875rem;
      font-weight: 500;
      
      &.label {
        color: ${KENYA_THEME.text.secondary};
      }
      
      &.value {
        color: ${props => props.$color};
        font-weight: 600;
      }
    }
  }
  
  .progress-track {
    height: 8px;
    background: ${KENYA_THEME.neutral}10;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    border-radius: 4px;
    background: ${props => `linear-gradient(90deg, ${props.$color}, ${props.$color}CC)`};
    transition: width 0.6s ease;
  }
`;

const AgendaItem = styled.div`
  background: ${props => props.$isEven ? KENYA_THEME.background : 'white'};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-left: 3px solid ${props => {
    const icons = [KENYA_THEME.primary, KENYA_THEME.support, KENYA_THEME.warning, KENYA_THEME.accent];
    return icons[props.$index % icons.length];
  }};
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  
  @media (min-width: 640px) {
    width: auto;
    min-width: 180px;
  }
  
  &.approve {
    background: ${props => props.$active ? KENYA_THEME.support : 'white'};
    color: ${props => props.$active ? 'white' : KENYA_THEME.support};
    border: 2px solid ${KENYA_THEME.support};
    
    &:hover:not(:disabled) {
      background: ${KENYA_THEME.support};
      color: white;
    }
  }
  
  &.reject {
    background: ${props => props.$active ? KENYA_THEME.neutral : 'white'};
    color: ${props => props.$active ? 'white' : KENYA_THEME.neutral};
    border: 2px solid ${KENYA_THEME.neutral};
    
    &:hover:not(:disabled) {
      background: ${KENYA_THEME.neutral};
      color: white;
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem 1rem;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid ${KENYA_THEME.primary}20;
    border-top-color: ${KENYA_THEME.primary};
    border-radius: 50%;
    margin: 0 auto 1.5rem;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const StatCard = styled.div`
  background: ${props => props.$color || KENYA_THEME.background};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  border-left: 4px solid ${props => props.$borderColor || KENYA_THEME.primary};
  
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

const ErrorState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  border: 1px solid ${KENYA_THEME.border};
  
  .error-icon {
    margin-bottom: 1rem;
    color: ${KENYA_THEME.opposition};
  }
  
  .error-message {
    color: ${KENYA_THEME.text.primary};
    margin-bottom: 0.5rem;
  }
  
  .error-submessage {
    color: ${KENYA_THEME.text.secondary};
    margin-bottom: 1.5rem;
  }
`;

// ============================================
// MAIN COMPONENT
// ============================================
const ManifestoPage = ({ leaderId, onBack, leaderData }) => {
  const [manifestos, setManifestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voting, setVoting] = useState({});
  const [userVotes, setUserVotes] = useState({});
  const [manifestoStats, setManifestoStats] = useState({});
  const [leaderDetails, setLeaderDetails] = useState(null);

  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
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
      
      const randomId = `USR-${Math.random().toString(36).substr(2, 9)}`;
      const randomName = `Anon-KE-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
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
  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Fetch leader details to get party color
  useEffect(() => {
    const fetchLeaderDetails = async () => {
      if (!leaderId) return;
      
      try {
        const response = await api.get(`/api/v1/leaders/${leaderId}`);
        if (response.data?.success && response.data.data) {
          setLeaderDetails(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching leader details:', error);
      }
    };
    
    fetchLeaderDetails();
  }, [leaderId]);

  // Fetch manifestos dynamically by leader ID - NO DUMMY DATA
  useEffect(() => {
    const fetchManifestos = async () => {
      if (!leaderId) {
        setLoading(false);
        setError('No leader ID provided');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // 1. Fetch manifestos for this leader using the dynamic endpoint
        const response = await api.get(`/api/v1/leaders/manifestos/leader/${leaderId}`);
          console.log(response)
        if (!response.data?.success) {
          throw new Error('API response not successful');
        }
        
        const manifestosData = response.data.data;
        
        if (!Array.isArray(manifestosData) || manifestosData.length === 0) {
          setManifestos([]);
          setLoading(false);
          return;
        }
        
        // Process each manifesto with its stats
        const processedManifestos = [];
        
        for (const manifesto of manifestosData) {
          let stats = {};
          let userVoteStatus = null;
          const manifestoId = manifesto.manifesto_id || manifesto.id;
          
          // 2. Fetch stats for this specific manifesto
          try {
            const statsResponse = await api.get(`/api/v1/leaders/manifestos/${manifestoId}/stats`);
            
            if (statsResponse.data?.success && statsResponse.data.data) {
              stats = statsResponse.data.data;
              
              setManifestoStats(prev => ({
                ...prev,
                [manifestoId]: stats
              }));
            }
          } catch (statsError) {
            console.log(`Could not fetch stats for manifesto ${manifestoId}:`, statsError.message);
          }
          
          // 3. Check if user has already voted on this manifesto
          try {
            const voteResponse = await api.get(`/api/v1/leaders/manifestos/${manifestoId}/vote/check/${currentUser.id}`);
            
            if (voteResponse.data?.success && voteResponse.data.data?.has_voted) {
              userVoteStatus = voteResponse.data.data.vote_type;
            }
          } catch (voteError) {
            console.log('Could not check user vote:', voteError.message);
          }
          
          // 4. Parse agenda items
          let agendaItems = [];
          if (manifesto.agenda_items) {
            try {
              agendaItems = Array.isArray(manifesto.agenda_items) 
                ? manifesto.agenda_items 
                : JSON.parse(manifesto.agenda_items);
            } catch (parseError) {
              console.log('Error parsing agenda items:', parseError);
              agendaItems = [];
            }
          }
          
          // Add processed manifesto to list
          processedManifestos.push({
            id: manifestoId.toString(),
            manifesto_id: manifestoId,
            title: manifesto.main_agenda || manifesto.title || "Policy Manifesto",
            description: manifesto.description || "",
            agenda_items: agendaItems,
            created_at: manifesto.created_at || new Date().toISOString(),
            updated_at: manifesto.updated_at,
            stats: stats,
            userVote: userVoteStatus
          });
        }
        
        setManifestos(processedManifestos);
        
        // Set user votes from processed data
        const votes = {};
        processedManifestos.forEach(manifesto => {
          if (manifesto.userVote) {
            votes[manifesto.id] = manifesto.userVote;
          }
        });
        setUserVotes(votes);
        
      } catch (error) {
        console.error('Error fetching manifestos:', error);
        setError(`Failed to load manifestos: ${error.message}`);
        setManifestos([]); // Empty array instead of dummy data
      } finally {
        setLoading(false);
      }
    };

    fetchManifestos();
  }, [leaderId, currentUser.id]);

  // Handle vote submission
  const handleVote = async (manifestoId, voteType) => {
    try {
      setVoting(prev => ({ ...prev, [manifestoId]: true }));
      
      const voteData = {
        leader_id: leaderId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        vote_type: voteType,
        manifesto_id: manifestoId
      };
      
      const response = await api.post(`/api/v1/leaders/manifestos/${manifestoId}/vote`, voteData);
      
      if (response.data?.success) {
        // Update user vote
        setUserVotes(prev => ({
          ...prev,
          [manifestoId]: voteType
        }));
        
        // Refresh stats for this manifesto
        try {
          const statsResponse = await api.get(`/api/v1/leaders/manifestos/${manifestoId}/stats`);
          if (statsResponse.data?.success && statsResponse.data.data) {
            setManifestos(prev => prev.map(m => 
              m.id === manifestoId.toString() 
                ? { ...m, stats: statsResponse.data.data }
                : m
            ));
            
            // Update manifesto stats state
            setManifestoStats(prev => ({
              ...prev,
              [manifestoId]: statsResponse.data.data
            }));
          }
        } catch (statsError) {
          console.log('Error refreshing stats:', statsError.message);
        }
        
        // Show success message
        setTimeout(() => {
          alert(`You ${voteType === 'approve' ? 'approved' : 'rejected'} this manifesto.`);
        }, 300);
      } else {
        alert('Failed to submit vote. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setVoting(prev => ({ ...prev, [manifestoId]: false }));
    }
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  // Get agenda icon
  const getAgendaIcon = (index) => {
    const icons = [
      { icon: TrendingUp, color: KENYA_THEME.primary },
      { icon: BookOpen, color: KENYA_THEME.support },
      { icon: Target, color: KENYA_THEME.warning },
      { icon: Heart, color: '#EC4899' },
      { icon: Shield, color: KENYA_THEME.accent },
      { icon: Award, color: '#8B5CF6' }
    ];
    return icons[index % icons.length];
  };

  // Calculate approval/rejection rates from stats
  const calculateRates = (stats) => {
    if (!stats) return { approvalRate: 0, rejectionRate: 0, neutralRate: 0 };
    
    // Extract counts from stats object
    const approveCount = parseInt(stats.approve_count || stats.approvals || 0);
    const rejectCount = parseInt(stats.reject_count || stats.rejections || 0);
    const neutralCount = parseInt(stats.neutral_count || stats.neutrals || 0);
    const totalVotes = approveCount + rejectCount + neutralCount;
    
    const approvalRate = totalVotes > 0 ? Math.round((approveCount / totalVotes) * 100) : 0;
    const rejectionRate = totalVotes > 0 ? Math.round((rejectCount / totalVotes) * 100) : 0;
    const neutralRate = totalVotes > 0 ? Math.round((neutralCount / totalVotes) * 100) : 0;
    
    return { approvalRate, rejectionRate, neutralRate, totalVotes };
  };

  // Get party color for header
  const getPartyColor = () => {
    if (leaderDetails?.party) {
      return KENYA_THEME.partyColors[leaderDetails.party] || KENYA_THEME.primary;
    }
    if (leaderData?.party) {
      return KENYA_THEME.partyColors[leaderData.party] || KENYA_THEME.primary;
    }
    return KENYA_THEME.primary;
  };

  const partyColor = getPartyColor();
  const leaderName = leaderData?.name || leaderDetails?.name || 'Political Leader';

  if (loading) {
    return (
      <PageContainer>
        <Header $color={partyColor}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <BackButton onClick={onBack}>
              <ArrowLeft size={18} />
              Back to Leader
            </BackButton>
            <h1 style={{ 
              margin: '0', 
              fontSize: '1.75rem', 
              fontWeight: '600',
              color: 'white'
            }}>
              Loading Manifestos...
            </h1>
          </div>
        </Header>
        <MainContent>
          <LoadingState>
            <div className="spinner"></div>
            <p style={{ color: KENYA_THEME.text.secondary }}>
              Loading policy proposals for {leaderName}...
            </p>
          </LoadingState>
        </MainContent>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Header $color={partyColor}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <BackButton onClick={onBack}>
              <ArrowLeft size={18} />
              Back to Leader
            </BackButton>
            <h1 style={{ 
              margin: '0', 
              fontSize: '1.75rem', 
              fontWeight: '600',
              color: 'white'
            }}>
              Policy Manifestos
            </h1>
          </div>
        </Header>
        <MainContent>
          <ErrorState>
            <AlertCircle size={48} className="error-icon" />
            <h3 className="error-message">Unable to Load Manifestos</h3>
            <p className="error-submessage">{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                background: partyColor,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </ErrorState>
        </MainContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <Header $color={partyColor}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <BackButton onClick={onBack}>
            <ArrowLeft size={18} />
            Back to Leader
          </BackButton>
          
          <div>
            <h1 style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: '1.75rem', 
              fontWeight: '600',
              color: 'white'
            }}>
              Policy Manifestos
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <p style={{ 
                margin: '0', 
                fontSize: '1rem', 
                opacity: 0.9,
                color: 'white'
              }}>
                Read and vote on detailed policy proposals from {leaderName}
              </p>
              {leaderDetails?.party && (
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {leaderDetails.party}
                </span>
              )}
            </div>
          </div>
        </div>
      </Header>

      {/* Main Content */}
      <MainContent>
        {/* Quick Stats Bar */}
        {manifestos.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '15px', 
            marginBottom: '25px' 
          }}>
            <StatCard 
              $color="#f0fdf4" 
              $borderColor={KENYA_THEME.support}
              $textColor={KENYA_THEME.support}
            >
              <div className="stat-value">{manifestos.length}</div>
              <div className="stat-label">
                <FileText size={16} />
                Total Manifestos
              </div>
            </StatCard>
            
            <StatCard 
              $color="#eff6ff" 
              $borderColor={KENYA_THEME.primary}
              $textColor={KENYA_THEME.primary}
            >
              <div className="stat-value">
                {manifestos.reduce((total, m) => {
                  const { totalVotes } = calculateRates(m.stats);
                  return total + totalVotes;
                }, 0)}
              </div>
              <div className="stat-label">
                <Users size={16} />
                Total Votes
              </div>
            </StatCard>
            
            <StatCard 
              $color="#fef2f2" 
              $borderColor={KENYA_THEME.opposition}
              $textColor={KENYA_THEME.opposition}
            >
              <div className="stat-value">
                {manifestos.filter(m => userVotes[m.id]).length}
              </div>
              <div className="stat-label">
                <CheckSquare size={16} />
                Your Votes
              </div>
            </StatCard>
            
            <StatCard 
              $color="#faf5ff" 
              $borderColor="#8B5CF6"
              $textColor="#8B5CF6"
            >
              <div className="stat-value">
                {manifestos.length > 0 
                  ? Math.round(manifestos.reduce((avg, m) => {
                      const { approvalRate } = calculateRates(m.stats);
                      return avg + approvalRate;
                    }, 0) / manifestos.length)
                  : 0}%
              </div>
              <div className="stat-label">
                <BarChart2 size={16} />
                Avg. Approval
              </div>
            </StatCard>
          </div>
        )}
        
        {manifestos.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            background: 'white',
            borderRadius: '12px',
            border: `1px solid ${KENYA_THEME.border}`
          }}>
            <BookOpen size={48} color={KENYA_THEME.text.light} style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: KENYA_THEME.text.primary }}>
              No Manifestos Available
            </h3>
            <p style={{ color: KENYA_THEME.text.secondary, marginBottom: '1.5rem' }}>
              {leaderName} hasn't published any policy proposals yet.
            </p>
            <button
              onClick={onBack}
              style={{
                padding: '0.75rem 1.5rem',
                background: partyColor,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Return to Leader Profile
            </button>
          </div>
        ) : (
          <div>
            {manifestos.map((manifesto, index) => {
              const isEven = index % 2 === 0;
              const stats = manifesto.stats || {};
              const { approvalRate, rejectionRate, neutralRate, totalVotes } = calculateRates(stats);
              
              return (
                <div key={manifesto.id}>
                  <ManifestoCard $isEven={isEven}>
                    {/* Manifesto Header */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          color: KENYA_THEME.text.secondary,
                          fontSize: '0.875rem'
                        }}>
                          <Calendar size={16} />
                          {formatDate(manifesto.created_at)}
                        </div>
                        
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          color: KENYA_THEME.text.secondary,
                          fontSize: '0.875rem'
                        }}>
                          <FileText size={16} />
                          Manifesto ID: {manifesto.manifesto_id}
                        </div>
                      </div>
                      
                      <h2 style={{ 
                        margin: '0 0 1rem 0', 
                        fontSize: '1.5rem', 
                        color: KENYA_THEME.text.primary,
                        lineHeight: '1.3'
                      }}>
                        {manifesto.title}
                      </h2>
                      
                      <StatsBar>
                        <StatBadge className="approve">
                          <ThumbsUp size={16} />
                          {stats.approve_count || 0} Approve
                        </StatBadge>
                        
                        <StatBadge className="reject">
                          <ThumbsDown size={16} />
                          {stats.reject_count || 0} Reject
                        </StatBadge>
                        
                        {neutralRate > 0 && (
                          <StatBadge className="neutral">
                            <Eye size={16} />
                            {stats.neutral_count || 0} Undecided
                          </StatBadge>
                        )}
                        
                        <StatBadge className="neutral">
                          <Users size={16} />
                          {totalVotes} Total Votes
                        </StatBadge>
                      </StatsBar>
                    </div>

                    {/* Progress Bars */}
                    {approvalRate > 0 && (
                      <ProgressContainer $color={KENYA_THEME.support}>
                        <div className="progress-row">
                          <span className="label">Public Approval</span>
                          <span className="value">{approvalRate}%</span>
                        </div>
                        <div className="progress-track">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${approvalRate}%` }}
                          />
                        </div>
                      </ProgressContainer>
                    )}
                    
                    {rejectionRate > 0 && (
                      <ProgressContainer $color={KENYA_THEME.opposition} style={{ marginTop: '1.5rem' }}>
                        <div className="progress-row">
                          <span className="label">Public Rejection</span>
                          <span className="value">{rejectionRate}%</span>
                        </div>
                        <div className="progress-track">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${rejectionRate}%` }}
                          />
                        </div>
                      </ProgressContainer>
                    )}
                    
                    {neutralRate > 0 && (
                      <ProgressContainer $color={KENYA_THEME.warning} style={{ marginTop: '1.5rem' }}>
                        <div className="progress-row">
                          <span className="label">Undecided</span>
                          <span className="value">{neutralRate}%</span>
                        </div>
                        <div className="progress-track">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${neutralRate}%` }}
                          />
                        </div>
                      </ProgressContainer>
                    )}

                    {/* Agenda Items */}
                    {manifesto.agenda_items && manifesto.agenda_items.length > 0 && (
                      <div style={{ margin: '2.5rem 0' }}>
                        <h3 style={{ 
                          margin: '0 0 1.25rem 0', 
                          fontSize: '1.25rem', 
                          color: KENYA_THEME.text.primary,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <Target size={20} />
                          Policy Agenda
                        </h3>
                        
                        <div>
                          {manifesto.agenda_items.map((item, idx) => {
                            const iconInfo = getAgendaIcon(idx);
                            const Icon = iconInfo.icon;
                            
                            return (
                              <AgendaItem key={idx} $isEven={idx % 2 === 0} $index={idx}>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'flex-start', 
                                  gap: '1rem'
                                }}>
                                  <div style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '8px',
                                    background: `${iconInfo.color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}>
                                    <Icon size={20} color={iconInfo.color} />
                                  </div>
                                  
                                  <div style={{ flex: 1 }}>
                                    <h4 style={{ 
                                      margin: '0 0 0.5rem 0', 
                                      fontSize: '1.125rem', 
                                      color: KENYA_THEME.text.primary,
                                      fontWeight: '600'
                                    }}>
                                      {item.title}
                                    </h4>
                                    <p style={{ 
                                      margin: '0', 
                                      color: KENYA_THEME.text.secondary,
                                      lineHeight: '1.6',
                                      fontSize: '0.95rem'
                                    }}>
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                              </AgendaItem>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Voting Section */}
                    <div style={{ 
                      background: KENYA_THEME.background,
                      padding: '2rem',
                      borderRadius: '12px',
                      border: `1px solid ${KENYA_THEME.border}`,
                      marginTop: '2rem'
                    }}>
                      <h3 style={{ 
                        margin: '0 0 1.5rem 0', 
                        fontSize: '1.125rem', 
                        color: KENYA_THEME.text.primary,
                        textAlign: 'center'
                      }}>
                        Cast Your Vote
                      </h3>
                      
                      <p style={{ 
                        margin: '0 0 2rem 0', 
                        color: KENYA_THEME.text.secondary,
                        textAlign: 'center',
                        fontSize: '0.95rem',
                        maxWidth: '500px',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                      }}>
                        Do you support or reject this policy proposal? Your vote helps shape public opinion.
                      </p>
                      
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '1rem',
                        alignItems: 'center'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          gap: '1rem',
                          width: '100%',
                          maxWidth: '400px'
                        }}>
                          <ActionButton
                            className="approve"
                            $active={userVotes[manifesto.id] === 'approve'}
                            onClick={() => handleVote(manifesto.id, 'approve')}
                            disabled={voting[manifesto.id]}
                          >
                            {voting[manifesto.id] && userVotes[manifesto.id] === 'approve' ? (
                              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <ThumbsUp size={18} />
                            )}
                            {userVotes[manifesto.id] === 'approve' ? 'Approved' : 'Approve'}
                          </ActionButton>
                          
                          <ActionButton
                            className="reject"
                            $active={userVotes[manifesto.id] === 'reject'}
                            onClick={() => handleVote(manifesto.id, 'reject')}
                            disabled={voting[manifesto.id]}
                          >
                            {voting[manifesto.id] && userVotes[manifesto.id] === 'reject' ? (
                              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <ThumbsDown size={18} />
                            )}
                            {userVotes[manifesto.id] === 'reject' ? 'Rejected' : 'Reject'}
                          </ActionButton>
                        </div>
                        
                        {userVotes[manifesto.id] && (
                          <div style={{
                            marginTop: '1rem',
                            padding: '0.75rem 1.25rem',
                            background: userVotes[manifesto.id] === 'approve' 
                              ? `${KENYA_THEME.support}15`
                              : `${KENYA_THEME.neutral}15`,
                            border: `1px solid ${userVotes[manifesto.id] === 'approve' 
                              ? KENYA_THEME.support
                              : KENYA_THEME.neutral}`,
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            color: userVotes[manifesto.id] === 'approve' 
                              ? KENYA_THEME.support 
                              : KENYA_THEME.neutral,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: '500'
                          }}>
                            {userVotes[manifesto.id] === 'approve' 
                              ? <CheckCircle size={16} /> 
                              : <XCircle size={16} />
                            }
                            You voted to {userVotes[manifesto.id]} this manifesto
                          </div>
                        )}
                      </div>
                      
                      <div style={{ 
                        marginTop: '2rem', 
                        paddingTop: '1rem', 
                        borderTop: `1px solid ${KENYA_THEME.border}`,
                        textAlign: 'center'
                      }}>
                        <p style={{ 
                          margin: '0', 
                          color: KENYA_THEME.text.light,
                          fontSize: '0.875rem'
                        }}>
                          {leaderName}'s policy proposal • Updated {formatDate(manifesto.updated_at || manifesto.created_at)}
                        </p>
                      </div>
                    </div>
                  </ManifestoCard>

                  {/* Comments Section - External Component */}
                  <ManifestoComments 
                    manifestoId={manifesto.manifesto_id}
                    leaderId={leaderId}
                    leaderName={leaderName}
                  />
                </div>
              );
            })}
          </div>
        )}
      </MainContent>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </PageContainer>
  );
};

export default ManifestoPage;