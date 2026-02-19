import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this for smoother navigation
import styled from 'styled-components';
import { Container, Row, Col, Dropdown, Button, Spinner, Alert, Modal, Badge } from 'react-bootstrap';
import { Search, ChevronDown, MapPin, Briefcase, Flag, Sparkles, Clock, X, User, LogIn, Eye, AlertCircle } from 'lucide-react';
import axios from 'axios';

// Import your custom components
import LeaderCard from './leadersCard';
import LeaderInsightPage from './leaderInsights';

// ============================================
// STYLED COMPONENTS (Kept from your original)
// ============================================
const SearchSection = styled.div`
  padding: 2rem 0;
  background: #ffffff;
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 8px 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);

  &:focus-within {
    background: #ffffff;
    border-color: #BB0000;
    box-shadow: 0 10px 25px rgba(187, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const StyledInput = styled.input`
  border: none;
  background: transparent;
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  color: #1e293b;
  outline: none;
  &::placeholder { color: #94a3b8; }
`;

const FilterGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
  align-items: center;
`;

const CustomDropdown = styled(Dropdown)`
  .dropdown-toggle {
    background: ${props => props.active ? '#1e293b' : '#ffffff'} !important;
    color: ${props => props.active ? '#ffffff' : '#64748b'} !important;
    border: 1px solid ${props => props.active ? '#1e293b' : '#e2e8f0'} !important;
    border-radius: 12px;
    padding: 8px 16px;
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;

    &:hover {
      border-color: #BB0000;
      color: #BB0000;
    }
    &::after { display: none; }
  }

  .dropdown-menu {
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    padding: 8px;
    min-width: 200px;
  }

  .dropdown-item {
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 0.85rem;
    &:hover { background: #f1f5f9; color: #BB0000; }
    &.active { background: #BB0000; }
  }
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
`;

const CountBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e293b;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 8px;
`;

const DateText = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const UserStatus = styled.div`
  display: inline-flex;
  align-items: center;
  background: ${props => props.loggedIn ? '#D1FAE5' : '#FEE2E2'};
  color: ${props => props.loggedIn ? '#065F46' : '#991B1B'};
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 500;
  
  .icon {
    margin-right: 0.4rem;
  }
`;

const LoginButton = styled(Button)`
  border-radius: 8px;
  padding: 0.4rem 1rem;
  background: white;
  color: #BB0000;
  border: 1px solid #BB0000;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: #BB0000;
    color: white;
  }
`;

// ============================================
// MAIN LEADERS PAGE COMPONENT
// ============================================
const LeadersPage = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [leaders, setLeaders] = useState([]);
  const [filteredLeaders, setFilteredLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('All');
  const [selectedCounty, setSelectedCounty] = useState('All');
  const [selectedParty, setSelectedParty] = useState('All');
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  
  const [likedLeaders, setLikedLeaders] = useState(new Set());
  const [dislikedLeaders, setDislikedLeaders] = useState(new Set());

  const API_BASE_URL = 'http://localhost:8006/api/v1/leaders';

  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 8000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
  });

  // 1. CHECK AUTHENTICATION
  useEffect(() => {
    const checkAuth = () => {
      try {
        const cookies = document?.cookie?.split?.(';')?.reduce?.((acc, cookie) => {
          const [key, value] = cookie?.trim?.()?.split?.('=') || [];
          if (key && value) acc[key] = value;
          return acc;
        }, {}) || {};
        
        const isAuthenticated = cookies?.isAuthenticated === 'true' || localStorage?.getItem?.('isAuthenticated') === 'true';
        setIsLoggedIn(!!isAuthenticated);
        
        if (isAuthenticated) {
          const username = localStorage?.getItem?.('current_username') || 'User';
          const userId = localStorage?.getItem?.('user_id');
          setCurrentUser({ username, userId });
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
    };
    checkAuth();
  }, []);

  // 2. FETCH LEADERS
  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/leaders');
        if (res?.data?.success) {
          setLeaders(res.data.data || []);
          setFilteredLeaders(res.data.data || []);
        }
      } catch (err) {
        setError('Unable to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  // 3. FILTER LOGIC
  useEffect(() => {
    let results = [...leaders];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      results = results.filter(l => 
        l.name?.toLowerCase().includes(lower) || 
        l.county?.toLowerCase().includes(lower)
      );
    }
    if (selectedPosition !== 'All') results = results.filter(l => l.position === selectedPosition);
    if (selectedCounty !== 'All') results = results.filter(l => l.county === selectedCounty);
    if (selectedParty !== 'All') results = results.filter(l => l.party === selectedParty);
    setFilteredLeaders(results);
  }, [searchTerm, selectedPosition, selectedCounty, selectedParty, leaders]);

  // ============================================
  // HANDLE VIEW INSIGHTS (AUTO-LOGIN REDIRECT)
  // ============================================
  const handleViewInsights = (leader) => {
    if (!isLoggedIn) {
      // Option A: Navigate using React Router (Preferred)
      navigate('/login');
      
      // Option B: Hard redirect if not using Router
      // window.location.href = '/login';
      return;
    }
    
    if (leader?.id) {
      setSelectedLeader(leader);
      setShowInsights(true);
      window.scrollTo(0, 0);
    }
  };

  const handleLike = async (id) => {
    try {
      const response = await api.post('/leaders/like', { leaderId: id });
      if (response?.data?.success) {
        const newLiked = new Set(likedLeaders);
        newLiked.has(id) ? newLiked.delete(id) : newLiked.add(id);
        setLikedLeaders(newLiked);
      }
    } catch (err) { console.error(err); }
  };

  const handleDislike = async (id) => {
    try {
      const response = await api.post('/leaders/dislike', { leaderId: id });
      if (response?.data?.success) {
        const newDisliked = new Set(dislikedLeaders);
        newDisliked.has(id) ? newDisliked.delete(id) : newDisliked.add(id);
        setDislikedLeaders(newDisliked);
      }
    } catch (err) { console.error(err); }
  };

  const positions = ['All', ...new Set(leaders.map(l => l.position).filter(Boolean))];
  const counties = ['All', ...new Set(leaders.map(l => l.county).filter(Boolean))];
  const parties = ['All', ...new Set(leaders.map(l => l.party).filter(Boolean))];

  if (showInsights && selectedLeader) {
    return (
      <LeaderInsightPage
        leaderId={selectedLeader.id}
        onBack={() => setShowInsights(false)}
        onLike={() => handleLike(selectedLeader.id)}
        onDislike={() => handleDislike(selectedLeader.id)}
      />
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-end mb-3">
        {isLoggedIn ? (
          <UserStatus loggedIn>
            <User size={14} className="icon" />
            {currentUser?.username}
          </UserStatus>
        ) : (
          <LoginButton onClick={() => navigate('/login')}>
            <LogIn size={14} className="me-1" />
            Login for Insights
          </LoginButton>
        )}
      </div>

      <SearchSection>
        <SearchWrapper>
          <Search size={20} color="#94a3b8" />
          <StyledInput 
            placeholder="Search leader by name or county..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && <X size={18} onClick={() => setSearchTerm('')} style={{cursor:'pointer'}} />}
        </SearchWrapper>

        <FilterGrid>
          <CustomDropdown active={selectedPosition !== 'All'}>
            <Dropdown.Toggle><Briefcase size={16} /> {selectedPosition === 'All' ? 'Position' : selectedPosition} <ChevronDown size={14} /></Dropdown.Toggle>
            <Dropdown.Menu>
              {positions.map(p => <Dropdown.Item key={p} onClick={() => setSelectedPosition(p)}>{p}</Dropdown.Item>)}
            </Dropdown.Menu>
          </CustomDropdown>

          <CustomDropdown active={selectedCounty !== 'All'}>
            <Dropdown.Toggle><MapPin size={16} /> {selectedCounty === 'All' ? 'County' : selectedCounty} <ChevronDown size={14} /></Dropdown.Toggle>
            <Dropdown.Menu>
              {counties.map(c => <Dropdown.Item key={c} onClick={() => setSelectedCounty(c)}>{c}</Dropdown.Item>)}
            </Dropdown.Menu>
          </CustomDropdown>

          <CustomDropdown active={selectedParty !== 'All'}>
            <Dropdown.Toggle><Flag size={16} /> {selectedParty === 'All' ? 'Party' : selectedParty} <ChevronDown size={14} /></Dropdown.Toggle>
            <Dropdown.Menu>
              {parties.map(p => <Dropdown.Item key={p} onClick={() => setSelectedParty(p)}>{p}</Dropdown.Item>)}
            </Dropdown.Menu>
          </CustomDropdown>
        </FilterGrid>

        <StatsRow>
          <CountBadge>
            <Sparkles size={14} color="#BB0000" />
            Showing {filteredLeaders.length} Leaders
          </CountBadge>
          <DateText><Clock size={12} /> Updated: Feb 2026</DateText>
        </StatsRow>
      </SearchSection>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Row className="g-4">
          {filteredLeaders.map((leader) => (
            <Col key={leader.id} xs={12} sm={6} lg={4} xl={3}>
              <LeaderCard 
                leader={leader}
                onLike={() => handleLike(leader.id)}
                onDislike={() => handleDislike(leader.id)}
                onViewInsights={() => handleViewInsights(leader)}
                isLiked={likedLeaders.has(leader.id)}
                isDisliked={dislikedLeaders.has(leader.id)}
                showLockIcon={!isLoggedIn}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default LeadersPage;