import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Bell, Search, X, Loader2 } from 'lucide-react';
import axios from 'axios';

const KENYA_THEME = {
  primary: '#BB0000',
  border: '#E2E8F0',
  background: '#F8FAFC',
};

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const SpinningLoader = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
  color: ${KENYA_THEME.primary};
`;

const HeaderWrapper = styled.header`
  padding: 12px 20px;
  background: white;
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${KENYA_THEME.border};
  min-height: 64px;
`;

const SearchContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  margin-right: 10px;
`;

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: ${KENYA_THEME.background};
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid ${props => props.$isSearching ? KENYA_THEME.primary : KENYA_THEME.border};
  transition: border-color 0.3s ease;
  position: relative;
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  padding: 4px 8px;
  font-size: 14px;
  color: #333;
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const SearchProgressBar = styled.div`
  position: absolute;
  bottom: -1px; /* Position at the bottom border */
  left: 0;
  right: 0;
  height: 2px;
  background: ${KENYA_THEME.primary};
  border-radius: 0 0 20px 20px;
  transform: scaleX(${props => props.$progress || 0});
  transform-origin: ${props => props.$rightToLeft ? 'right' : 'left'};
  transition: transform 0.3s ease;
  opacity: ${props => props.$visible ? 1 : 0};
`;

const LoaderContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: white;
  border-radius: 0 0 12px 12px;
  border: 1px solid ${KENYA_THEME.border};
  border-top: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 999;
  opacity: ${props => props.$visible ? 1 : 0};
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  transform: ${props => props.$visible ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.3s ease;
`;

const IconButton = styled.div`
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const GlobalHeader = ({ notifCount, onSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearching, setIsSearching] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingProgress, setTypingProgress] = useState(0);
  const [lastSearchTime, setLastSearchTime] = useState(null);
  
  const timerRef = useRef(null);
  const lastQueryRef = useRef('');
  const typingTimeoutRef = useRef(null);

  const recordSearchToBackend = async (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    // Avoid recording duplicate searches within 30 seconds
    const now = Date.now();
    if (lastSearchTime && now - lastSearchTime < 30000 && lastQueryRef.current === searchTerm) {
      console.log('📝 Skipping duplicate search recording');
      return;
    }
    
    try {
      console.log('📝 Recording search to backend:', searchTerm);
      
      await axios.post('http://localhost:9002/api/v1/searches/post', {
        search_input: searchTerm
      }, {
        timeout: 3000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      lastQueryRef.current = searchTerm;
      setLastSearchTime(now);
      console.log('✅ Search recorded successfully');
      
    } catch (error) {
      console.warn('⚠️ Could not record search to backend:', error.message);
      // Don't show error to user - this is just analytics
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalQuery(value);

    // Update typing progress (visual feedback while typing)
    if (value.length > 0) {
      // Progress goes from 0 to 1 as user types
      const progress = Math.min(value.length / 30, 1);
      setTypingProgress(progress);
    } else {
      setTypingProgress(0);
    }

    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // If input is cleared, immediately trigger empty search
    if (!value.trim()) {
      if (onSearch) onSearch('');
      setTypingProgress(0);
      return;
    }

    // Set timer for debouncing - wait 1 second after user stops typing
    timerRef.current = setTimeout(async () => {
      await executeSearch(value);
    }, 1000);
  };

  const executeSearch = async (query) => {
    setIsLoading(true);
    console.log("🔍 Executing search for:", query);

    try {
      // 1. Record search to analytics backend (fire and forget)
      recordSearchToBackend(query);
      
      // 2. Send search analysis request to main backend
      try {
        const response = await axios.post('http://localhost:8006/api/v1/search/analysis', {
          searchTerm: query,
          timestamp: new Date().toISOString()
        }, {
          timeout: 5000
        });
        
        console.log("✅ Search analysis response:", response.data);
      } catch (err) {
        console.warn("⚠️ Search analysis endpoint not available:", err.message);
      }
      
      // 3. Trigger the filter in your app (main functionality)
      if (onSearch) onSearch(query);
      
    } catch (err) {
      console.error("❌ Error during search:", err.message);
      
      // Still trigger local search even if analytics fails
      if (onSearch) onSearch(query);
      
    } finally {
      setIsLoading(false);
      setTypingProgress(0);
    }
  };

  const handleSearchClick = () => {
    setIsSearching(true);
    // Focus the input after a small delay
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]');
      if (input) input.focus();
    }, 50);
  };

  const handleCloseSearch = () => {
    // Clear any pending timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Reset states
    setLocalQuery('');
    setTypingProgress(0);
    setIsSearching(false);
    setIsLoading(false);
    
    // Clear search in parent component
    if (onSearch) onSearch('');
  };

  const handleKeyPress = (e) => {
    // Allow user to press Enter to search immediately
    if (e.key === 'Enter' && localQuery.trim()) {
      if (timerRef.current) clearTimeout(timerRef.current);
      executeSearch(localQuery);
    }
    
    // Allow Escape to close search
    if (e.key === 'Escape') {
      handleCloseSearch();
    }
  };

  // Handle search submission when clicking search icon
  const handleSubmitSearch = () => {
    if (localQuery.trim()) {
      if (timerRef.current) clearTimeout(timerRef.current);
      executeSearch(localQuery);
    }
  };

  return (
    <HeaderWrapper>
      {!isSearching ? (
        <h2 
          onClick={() => navigate('/')} 
          style={{ 
            color: KENYA_THEME.primary, 
            cursor: 'pointer', 
            margin: 0, 
            fontSize: '18px', 
            fontWeight: 900,
            userSelect: 'none'
          }}
        >
          Siasa Hub 🇰🇪
        </h2>
      ) : (
        <SearchContainer>
          <SearchInputWrapper $isSearching={isSearching}>
            <Search 
              size={18} 
              color="#64748B" 
              style={{ flexShrink: 0, cursor: localQuery.trim() ? 'pointer' : 'default' }}
              onClick={localQuery.trim() ? handleSubmitSearch : undefined}
            />
            <SearchInput 
              type="text"
              autoFocus
              placeholder="Search leaders, parties, or topics..." 
              value={localQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
            />
            {localQuery && (
              <X 
                size={20} 
                color="#64748B" 
                style={{ 
                  cursor: 'pointer',
                  flexShrink: 0,
                  marginLeft: '8px'
                }} 
                onClick={handleCloseSearch}
              />
            )}
            {/* Progress bar now starts from left (beginning) */}
            <SearchProgressBar 
              $progress={typingProgress}
              $visible={localQuery.length > 0 && !isLoading}
              $rightToLeft={false}
            />
          </SearchInputWrapper>
          
          {/* Loader below search field */}
          <LoaderContainer $visible={isLoading}>
            <SpinningLoader size={20} />
            <span style={{ marginLeft: '8px', fontSize: '14px', color: '#64748B' }}>
              Searching for "{localQuery.substring(0, 20)}..."
            </span>
          </LoaderContainer>
        </SearchContainer>
      )}
      
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {!isSearching ? (
          <IconButton onClick={handleSearchClick}>
            <Search size={22} color="#64748B" />
          </IconButton>
        ) : (
          <IconButton onClick={handleSubmitSearch} disabled={!localQuery.trim()}>
            <Search size={22} color={localQuery.trim() ? KENYA_THEME.primary : '#64748B'} />
          </IconButton>
        )}
        <IconButton 
          onClick={() => navigate('/notifications')} 
          style={{ position: 'relative' }}
        >
          <Bell 
            size={22} 
            color={location.pathname === '/notifications' ? KENYA_THEME.primary : '#64748B'} 
          />
          {notifCount > 0 && (
            <div style={{
              position: 'absolute',
              top: 5,
              right: 5,
              background: KENYA_THEME.primary,
              color: 'white',
              fontSize: '10px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: 'bold'
            }}>
              {notifCount > 9 ? '9+' : notifCount}
            </div>
          )}
        </IconButton>
      </div>
    </HeaderWrapper>
  );
};

export default GlobalHeader;