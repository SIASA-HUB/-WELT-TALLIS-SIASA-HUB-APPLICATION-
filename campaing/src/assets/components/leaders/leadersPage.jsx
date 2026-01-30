import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Dropdown,
  Badge,
  Spinner,
  Alert
} from 'react-bootstrap';
import {
  Search,
  Filter,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  FileText,
  MapPin,
  Users,
  Award,
  ChevronDown,
  TrendingUp,
  BarChart2,
  MessageSquare,
  Flag,
  Home
} from 'react-feather';
import axios from 'axios';
import LeaderInsightPage from './leaderInsights';
import LeaderCard from './leadersCard';

// ============================================
// KENYAN THEME
// ============================================

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
    'JUBILEE': '#FFD700',
    'NARC-KENYA': '#EC4899',
    'INDEPENDENT': '#6B7280',
    'NARC': '#8B5CF6',
    'TSP': '#3B82F6',
    'DAP-K': '#EF4444',
    'CCM': '#8B4513',
    'KANU': '#4B0082'
  }
};

// ============================================
// STYLED COMPONENTS WITH KENYAN THEME
// ============================================

const StyledContainer = styled(Container)`
  padding-top: 1rem;
  padding-bottom: 2rem;
  min-height: 100vh;
  background-color: ${KENYA_THEME.background};
  
  @media (max-width: 768px) {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const Title = styled.h1`
  color: ${KENYA_THEME.primary};
  font-weight: 800;
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  position: relative;
  display: inline-block;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 60px;
    height: 4px;
    background: ${KENYA_THEME.accent};
    border-radius: 2px;
  }
  
  @media (min-width: 768px) {
    font-size: 2.25rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  color: ${KENYA_THEME.text.secondary};
  font-size: 0.95rem;
  margin-top: 0.75rem;
  max-width: 800px;
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const FilterSection = styled(Card)`
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
  background: white;
  overflow: hidden;
  
  @media (max-width: 768px) {
    border-radius: 10px;
    margin-bottom: 1rem;
  }
`;

const FilterRow = styled(Row)`
  padding: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

const SearchInput = styled(Form.Control)`
  border-radius: 25px;
  border: 2px solid ${KENYA_THEME.border};
  padding-left: 3rem;
  font-size: 0.95rem;
  height: 48px;
  
  &:focus {
    border-color: ${KENYA_THEME.primary};
    box-shadow: 0 0 0 0.2rem rgba(187, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    height: 44px;
    font-size: 0.9rem;
  }
`;

const FilterChip = styled(Button)`
  border-radius: 25px;
  padding: 0.5rem 1.25rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid ${props => props.active ? KENYA_THEME.primary : KENYA_THEME.border};
  background-color: ${props => props.active ? KENYA_THEME.primary : 'white'};
  color: ${props => props.active ? 'white' : KENYA_THEME.text.secondary};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.active ? '#990000' : KENYA_THEME.background};
    border-color: ${props => props.active ? '#990000' : KENYA_THEME.primary};
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 0.4rem 1rem;
    font-size: 0.8rem;
    margin-right: 0.4rem;
    margin-bottom: 0.4rem;
  }
`;

const LeaderGrid = styled(Row)`
  margin-top: 1rem;
  margin-left: -0.5rem;
  margin-right: -0.5rem;
  
  @media (max-width: 768px) {
    margin-left: -0.25rem;
    margin-right: -0.25rem;
  }
`;

const LeaderCardWrapper = styled(Col)`
  margin-bottom: 1.5rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  color: ${KENYA_THEME.text.secondary};
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 1rem;
  color: ${KENYA_THEME.text.secondary};
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const ResetFiltersButton = styled(Button)`
  border-radius: 25px;
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  background-color: white;
  border: 2px solid ${KENYA_THEME.border};
  color: ${KENYA_THEME.text.secondary};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${KENYA_THEME.background};
    border-color: ${KENYA_THEME.primary};
    color: ${KENYA_THEME.primary};
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 0.4rem 1rem;
    font-size: 0.8rem;
  }
`;

const MobileMenuButton = styled(Button)`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    border-radius: 12px;
    padding: 0.75rem;
    background: ${KENYA_THEME.gradients.kenya};
    border: none;
    color: white;
    font-weight: 700;
    margin-top: 1rem;
  }
`;

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Parse tags from API response
const parseTags = (tagsString) => {
  if (!tagsString) return [];
  
  try {
    // Try to parse the JSON string
    const parsed = JSON.parse(tagsString);
    
    // Handle different formats from your API data
    if (Array.isArray(parsed)) {
      return parsed.filter(tag => typeof tag === 'string');
    } else if (typeof parsed === 'object') {
      // Extract all string values from the object
      const allTags = [];
      Object.values(parsed).forEach(value => {
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (typeof item === 'string') allTags.push(item);
          });
        } else if (typeof value === 'string') {
          allTags.push(value);
        }
      });
      return allTags;
    }
  } catch (error) {
    console.error('Error parsing tags:', error);
  }
  
  return [];
};

// Sample data for fallback (remove or keep as needed)
const sampleData = [
  {
    id: 1,
    name: 'Sample Leader',
    position: 'Governor',
    party: 'UDA',
    county: 'Nairobi',
    approval: 65,
    likes: 1500,
    dislikes: 200,
    comments: 45,
    views: 5000,
    profilePhoto: 'https://via.placeholder.com/150'
  }
];

// ============================================
// MAIN LEADERS COMPONENT
// ============================================

const LeadersPage = () => {
  // State management
  const [leaders, setLeaders] = useState([]);
  const [filteredLeaders, setFilteredLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('All');
  const [selectedCounty, setSelectedCounty] = useState('All');
  const [selectedParty, setSelectedParty] = useState('All');
  const [likedLeaders, setLikedLeaders] = useState(new Set());
  const [dislikedLeaders, setDislikedLeaders] = useState(new Set());
  const [viewedLeaders, setViewedLeaders] = useState(new Set());
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch from your backend API
        const response = await axios.get('https://decide-building-indicator-world.trycloudflare.com/leaders/get');
        
        if (response.data.success && response.data.data) {
          // Use the data directly from API (it's already transformed)
          setLeaders(response.data.data);
          setFilteredLeaders(response.data.data);
        } else {
          throw new Error('Invalid API response structure');
        }
      } catch (error) {
        console.error('Error fetching leaders:', error);
        setError('Failed to load leaders data. Please try again later.');
        
        // Fallback to sample data if API fails
        setLeaders(sampleData);
        setFilteredLeaders(sampleData);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, []);

  // Extract unique parties, counties, and positions from API data
  const parties = ['All', ...new Set(leaders.map(l => l.party).filter(Boolean))].sort();
  const counties = ['All', ...new Set(leaders.map(l => l.county).filter(Boolean))].sort();
  const positions = ['All', ...new Set(leaders.map(l => l.position).filter(Boolean))].sort();

  // Apply filters
  useEffect(() => {
    let results = [...leaders];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(leader =>
        leader.name.toLowerCase().includes(term) ||
        (leader.party && leader.party.toLowerCase().includes(term)) ||
        (leader.manifesto && leader.manifesto.toLowerCase().includes(term)) ||
        (leader.tags && leader.tags.some(tag => tag.toLowerCase().includes(term))) ||
        (leader.education && leader.education.toLowerCase().includes(term))
      );
    }

    // Position filter
    if (selectedPosition !== 'All') {
      results = results.filter(leader => leader.position === selectedPosition);
    }

    // County filter
    if (selectedCounty !== 'All') {
      results = results.filter(leader => leader.county === selectedCounty);
    }

    // Party filter
    if (selectedParty !== 'All') {
      results = results.filter(leader => leader.party === selectedParty);
    }

    setFilteredLeaders(results);
  }, [searchTerm, selectedPosition, selectedCounty, selectedParty, leaders]);

  // Handle like/dislike (frontend only for now)
  const handleLike = (leaderId) => {
    const newLiked = new Set(likedLeaders);
    const newDisliked = new Set(dislikedLeaders);

    if (likedLeaders.has(leaderId)) {
      newLiked.delete(leaderId);
    } else {
      newLiked.add(leaderId);
      newDisliked.delete(leaderId);
      
      // Update leader likes count locally
      setLeaders(prev => prev.map(leader => 
        leader.id === leaderId 
          ? { ...leader, likes: (leader.likes || 0) + 1, dislikes: Math.max(0, (leader.dislikes || 0) - (dislikedLeaders.has(leaderId) ? 1 : 0)) }
          : leader
      ));
    }

    setLikedLeaders(newLiked);
    setDislikedLeaders(newDisliked);
  };

  const handleDislike = (leaderId) => {
    const newLiked = new Set(likedLeaders);
    const newDisliked = new Set(dislikedLeaders);

    if (dislikedLeaders.has(leaderId)) {
      newDisliked.delete(leaderId);
    } else {
      newDisliked.add(leaderId);
      newLiked.delete(leaderId);
      
      // Update leader dislikes count locally
      setLeaders(prev => prev.map(leader => 
        leader.id === leaderId 
          ? { ...leader, dislikes: (leader.dislikes || 0) + 1, likes: Math.max(0, (leader.likes || 0) - (likedLeaders.has(leaderId) ? 1 : 0)) }
          : leader
      ));
    }

    setLikedLeaders(newLiked);
    setDislikedLeaders(newDisliked);
  };

  // Handle view insights
  const handleViewInsights = (leader) => {
    setSelectedLeader(leader);
    setShowInsights(true);
    
    // Track view locally
    if (!viewedLeaders.has(leader.id)) {
      setViewedLeaders(prev => new Set([...prev, leader.id]));
      setLeaders(prev => prev.map(l => 
        l.id === leader.id ? { ...l, views: (l.views || 0) + 1 } : l
      ));
    }
  };

  // Handle back from insights
  const handleBackFromInsights = () => {
    setShowInsights(false);
    setSelectedLeader(null);
  };

  // Handle comment from insights
  const handleComment = (leaderId, comment) => {
    // In real app, this would be API call
    console.log(`Comment on leader ${leaderId}: ${comment}`);
    setLeaders(prev => prev.map(leader => 
      leader.id === leaderId 
        ? { 
            ...leader, 
            comments: (leader.comments || 0) + 1,
            topComment: comment.length > 50 ? comment.substring(0, 50) + "..." : comment
          }
        : leader
    ));
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedPosition('All');
    setSelectedCounty('All');
    setSelectedParty('All');
    setShowMobileFilters(false);
  };

  // If showing insights, render the insights page
  if (showInsights && selectedLeader) {
    return (
      <LeaderInsightPage
        leaderData={selectedLeader}
        onBack={handleBackFromInsights}
        onLike={() => handleLike(selectedLeader.id)}
        onDislike={() => handleDislike(selectedLeader.id)}
        onComment={handleComment}
        onView={() => {
          if (!viewedLeaders.has(selectedLeader.id)) {
            setViewedLeaders(prev => new Set([...prev, selectedLeader.id]));
          }
        }}
        theme={KENYA_THEME}
      />
    );
  }

  return (
    <StyledContainer fluid="md">
      {/* Page Header */}
      <PageHeader>
        <Title>Kenyan Political Leaders</Title>
        <Subtitle>
          Comprehensive analysis of political leaders across Kenya. Track performance, manifesto promises, 
          community support, and engagement metrics.
        </Subtitle>
      </PageHeader>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-3" onClose={() => setError(null)} dismissible>
          <Alert.Heading>Error Loading Data</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* Filter Section */}
      <FilterSection>
        <FilterRow>
          <Col md={5} className="mb-3 mb-md-0">
            <InputGroup>
              <InputGroup.Text style={{ 
                borderRight: 'none',
                background: 'white',
                borderColor: KENYA_THEME.border,
                borderTopLeftRadius: '25px',
                borderBottomLeftRadius: '25px'
              }}>
                <Search size={18} color={KENYA_THEME.text.secondary} />
              </InputGroup.Text>
              <SearchInput
                placeholder="Search by name, party, or manifesto promises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderLeft: 'none' }}
              />
            </InputGroup>
          </Col>

          <Col md={7} className="d-none d-md-block">
            <Row>
              <Col xs={12} className="mb-2">
                <div className="d-flex align-items-center">
                  <Filter size={16} className="me-2" color={KENYA_THEME.text.secondary} />
                  <strong className="me-2" style={{ color: KENYA_THEME.text.primary }}>
                    Position:
                  </strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {positions.slice(0, 6).map((position) => (
                      <FilterChip
                        key={position}
                        active={selectedPosition === position}
                        onClick={() => setSelectedPosition(position)}
                        variant="outline"
                      >
                        {position}
                      </FilterChip>
                    ))}
                    {positions.length > 6 && (
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="outline-secondary"
                          size="sm"
                          style={{
                            borderRadius: '25px',
                            padding: '0.4rem 1.25rem',
                            borderColor: KENYA_THEME.border,
                            color: KENYA_THEME.text.secondary,
                            fontWeight: '600',
                            background: 'white',
                            marginBottom: '0.5rem'
                          }}
                        >
                          More <ChevronDown size={14} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {positions.slice(6).map((position) => (
                            <Dropdown.Item
                              key={position}
                              onClick={() => setSelectedPosition(position)}
                            >
                              {position}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  </div>
                </div>
              </Col>

              <Col xs={12}>
                <Row>
                  <Col xs={6}>
                    <div className="d-flex align-items-center">
                      <MapPin size={16} className="me-2" color={KENYA_THEME.text.secondary} />
                      <strong className="me-2" style={{ color: KENYA_THEME.text.primary }}>
                        County:
                      </strong>
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="outline-secondary"
                          size="sm"
                          style={{
                            borderRadius: '25px',
                            padding: '0.4rem 1.25rem',
                            borderColor: KENYA_THEME.border,
                            color: KENYA_THEME.text.secondary,
                            fontWeight: '600',
                            background: 'white'
                          }}
                        >
                          {selectedCounty} <ChevronDown size={14} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {counties.map((county) => (
                            <Dropdown.Item
                              key={county}
                              active={selectedCounty === county}
                              onClick={() => setSelectedCounty(county)}
                              style={{
                                color: selectedCounty === county ? KENYA_THEME.primary : KENYA_THEME.text.primary,
                                fontWeight: selectedCounty === county ? '600' : '400'
                              }}
                            >
                              {county}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </Col>
                  
                  <Col xs={6}>
                    <div className="d-flex align-items-center">
                      <Flag size={16} className="me-2" color={KENYA_THEME.text.secondary} />
                      <strong className="me-2" style={{ color: KENYA_THEME.text.primary }}>
                        Party:
                      </strong>
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="outline-secondary"
                          size="sm"
                          style={{
                            borderRadius: '25px',
                            padding: '0.4rem 1.25rem',
                            borderColor: KENYA_THEME.border,
                            color: KENYA_THEME.text.secondary,
                            fontWeight: '600',
                            background: 'white'
                          }}
                        >
                          {selectedParty} <ChevronDown size={14} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {parties.map((party) => (
                            <Dropdown.Item
                              key={party}
                              active={selectedParty === party}
                              onClick={() => setSelectedParty(party)}
                              style={{
                                color: selectedParty === party ? KENYA_THEME.primary : KENYA_THEME.text.primary,
                                fontWeight: selectedParty === party ? '600' : '400'
                              }}
                            >
                              {party}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>

          {/* Mobile Filters Toggle */}
          <Col xs={12} className="d-block d-md-none">
            <Button
              variant="outline-primary"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              style={{
                width: '100%',
                borderRadius: '25px',
                borderColor: KENYA_THEME.primary,
                color: KENYA_THEME.primary,
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Filter size={16} />
              {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Col>
        </FilterRow>

        {/* Mobile Filters Dropdown */}
        {showMobileFilters && (
          <div className="p-3 border-top" style={{ borderColor: KENYA_THEME.border }}>
            <div className="mb-3">
              <strong className="d-block mb-2" style={{ color: KENYA_THEME.text.primary }}>
                Position:
              </strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {positions.slice(0, 5).map((position) => (
                  <FilterChip
                    key={position}
                    active={selectedPosition === position}
                    onClick={() => setSelectedPosition(position)}
                    variant="outline"
                    style={{ margin: '0' }}
                  >
                    {position}
                  </FilterChip>
                ))}
                {positions.length > 5 && (
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      size="sm"
                      style={{
                        borderRadius: '25px',
                        padding: '0.4rem 1.25rem',
                        borderColor: KENYA_THEME.border,
                        color: KENYA_THEME.text.secondary,
                        fontWeight: '600',
                        background: 'white',
                        marginBottom: '0.5rem'
                      }}
                    >
                      More <ChevronDown size={14} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {positions.slice(5).map((position) => (
                        <Dropdown.Item
                          key={position}
                          onClick={() => setSelectedPosition(position)}
                        >
                          {position}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>
            </div>
            
            <Row>
              <Col xs={6} className="mb-3">
                <strong className="d-block mb-2" style={{ color: KENYA_THEME.text.primary }}>
                  County:
                </strong>
                <Dropdown className="w-100">
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    size="sm"
                    style={{
                      borderRadius: '25px',
                      padding: '0.5rem 1.25rem',
                      borderColor: KENYA_THEME.border,
                      color: KENYA_THEME.text.secondary,
                      fontWeight: '600',
                      background: 'white',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    {selectedCounty} <ChevronDown size={14} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{ 
                    maxHeight: '250px', 
                    overflowY: 'auto',
                    width: '100%'
                  }}>
                    {counties.map((county) => (
                      <Dropdown.Item
                        key={county}
                        active={selectedCounty === county}
                        onClick={() => setSelectedCounty(county)}
                        style={{
                          color: selectedCounty === county ? KENYA_THEME.primary : KENYA_THEME.text.primary,
                          fontWeight: selectedCounty === county ? '600' : '400'
                        }}
                      >
                        {county}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
              
              <Col xs={6} className="mb-3">
                <strong className="d-block mb-2" style={{ color: KENYA_THEME.text.primary }}>
                  Party:
                </strong>
                <Dropdown className="w-100">
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    size="sm"
                    style={{
                      borderRadius: '25px',
                      padding: '0.5rem 1.25rem',
                      borderColor: KENYA_THEME.border,
                      color: KENYA_THEME.text.secondary,
                      fontWeight: '600',
                      background: 'white',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    {selectedParty} <ChevronDown size={14} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{ 
                    maxHeight: '250px', 
                    overflowY: 'auto',
                    width: '100%'
                  }}>
                    {parties.map((party) => (
                      <Dropdown.Item
                        key={party}
                        active={selectedParty === party}
                        onClick={() => setSelectedParty(party)}
                        style={{
                          color: selectedParty === party ? KENYA_THEME.primary : KENYA_THEME.text.primary,
                          fontWeight: selectedParty === party ? '600' : '400'
                        }}
                      >
                        {party}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            </Row>
          </div>
        )}

        {/* Active Filters & Reset */}
        {(searchTerm || selectedPosition !== 'All' || selectedCounty !== 'All' || selectedParty !== 'All') && (
          <div className="px-3 pb-3 border-top" style={{ borderColor: KENYA_THEME.border }}>
            <div className="d-flex justify-content-between align-items-center pt-3">
              <small className="text-muted" style={{ color: KENYA_THEME.text.secondary }}>
                Active filters: 
                {searchTerm && ` Search: "${searchTerm}"`}
                {selectedPosition !== 'All' && ` Position: ${selectedPosition}`}
                {selectedCounty !== 'All' && ` County: ${selectedCounty}`}
                {selectedParty !== 'All' && ` Party: ${selectedParty}`}
              </small>
              <ResetFiltersButton
                variant="outline"
                size="sm"
                onClick={resetFilters}
              >
                Clear All Filters
              </ResetFiltersButton>
            </div>
          </div>
        )}
      </FilterSection>

      {/* Loading State */}
      {loading && (
        <LoadingSpinner>
          <Spinner animation="border" variant="primary" className="mb-3" style={{ color: KENYA_THEME.primary }} />
          <p>Loading leaders and analysis...</p>
        </LoadingSpinner>
      )}

      {/* Empty State */}
      {!loading && filteredLeaders.length === 0 && (
        <EmptyState>
          <Users size={48} className="mb-3" color={KENYA_THEME.border} />
          <h5 style={{ color: KENYA_THEME.text.primary, marginBottom: '1rem' }}>
            No leaders found
          </h5>
          <p className="mb-3" style={{ color: KENYA_THEME.text.secondary }}>
            Try adjusting your search or filters
          </p>
          <Button 
            variant="outline-primary" 
            onClick={resetFilters}
            style={{
              borderColor: KENYA_THEME.primary,
              color: KENYA_THEME.primary,
              fontWeight: '600'
            }}
          >
            Clear All Filters
          </Button>
        </EmptyState>
      )}

      {/* Leaders Grid */}
      {!loading && filteredLeaders.length > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0" style={{ color: KENYA_THEME.text.primary }}>
              Showing {filteredLeaders.length} leader{filteredLeaders.length !== 1 ? 's' : ''}
            </h6>
            <small className="text-muted" style={{ color: KENYA_THEME.text.secondary }}>
              Click any card for detailed analysis
            </small>
          </div>
          
          <LeaderGrid>
            {filteredLeaders.map((leader) => (
              <LeaderCardWrapper key={leader.id} xs={12} sm={6} lg={4} xl={3}>
                <LeaderCard
                  leader={leader}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  onViewInsights={() => handleViewInsights(leader)}
                  isLiked={likedLeaders.has(leader.id)}
                  isDisliked={dislikedLeaders.has(leader.id)}
                />
              </LeaderCardWrapper>
            ))}
          </LeaderGrid>

          {/* Mobile Menu Button */}
          <MobileMenuButton onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Home size={18} className="me-2" />
            Back to Top
          </MobileMenuButton>

          {/* Load More Button (for pagination if needed) */}
          <div className="text-center mt-4 d-none d-md-block">
            <Button 
              variant="outline-primary"
              style={{
                borderColor: KENYA_THEME.primary,
                color: KENYA_THEME.primary,
                fontWeight: '600',
                borderRadius: '25px',
                padding: '0.75rem 2rem'
              }}
              onClick={() => {
                // TODO: Implement pagination if your API supports it
                console.log('Load more leaders - implement pagination');
              }}
            >
              Load More Leaders
            </Button>
          </div>
        </>
      )}

      {/* Trust & Safety Footer Note */}
      <Alert variant="light" className="mt-4" style={{ 
        fontSize: '0.85rem',
        background: KENYA_THEME.background,
        borderColor: KENYA_THEME.border,
        color: KENYA_THEME.text.secondary
      }}>
        <div className="d-flex align-items-start">
          <Award size={16} className="me-2 mt-1" color={KENYA_THEME.primary} />
          <div>
            <strong style={{ color: KENYA_THEME.text.primary }}>Transparency Features:</strong> 
            <ul className="mb-0 mt-1" style={{ fontSize: '0.85rem' }}>
              <li>Geographic support mapping shows where leaders have genuine backing</li>
              <li>Manifesto promise tracking helps identify unfulfilled commitments</li>
              <li>Community feedback highlights discrepancies with false claims</li>
              <li>All data is crowdsourced and community-verified</li>
            </ul>
          </div>
        </div>
      </Alert>
    </StyledContainer>
  );
};

export default LeadersPage;