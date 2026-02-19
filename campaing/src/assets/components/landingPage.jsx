import React, { Suspense, lazy } from 'react';
import styled from 'styled-components';

// --- Critical (IMMEDIATE) Imports ---
import PostCard from './posts/postCard';
import TrendingSection from './treading/treading';

// --- Lazy (NON-CRITICAL) Imports ---
const HeatMaps = lazy(() => import('./heatMaps/HeatMaps'));

// --- Theme ---
const theme = {
  colors: {
    primary: '#197fe6',
    secondary: '#94a3b8',
    text: '#0f172a',
    background: '#f8fafc',
    border: 'rgba(226, 232, 240, 0.8)',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b'
  },
  fonts: {
    main: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  }
};

// --- Styled Components ---
const Container = styled.div`
  background: ${theme.colors.background};
  min-height: 100vh;
  font-family: ${theme.fonts.main};
  max-width: 480px;
  margin: 0 auto;
`;

const MainContent = styled.main`
  padding-bottom: 20px;
`;

// Search Header Component for when search is active
const SearchHeader = styled.div`
  padding: 12px 16px;
  background: #E8F5E9;
  border-bottom: 2px solid #2E7D32;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const SearchTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: #2E7D32;
`;

const SearchQuery = styled.span`
  color: #333;
  font-weight: normal;
  margin-left: 8px;
`;

const ClearSearchButton = styled.button`
  background: none;
  border: none;
  color: #2E7D32;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  padding: 4px 8px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(46, 125, 50, 0.1);
  }
`;

// --- Skeletons (VERY IMPORTANT) ---
const SectionSkeleton = styled.div`
  height: 180px;
  background: #e5e7eb;
  border-radius: 10px;
  margin: 16px;
`;

const HeatMapSkeleton = styled.div`
  height: 240px;
  background: #e5e7eb;
  border-radius: 10px;
  margin: 16px;
`;

// --- App ---
export default function SiasaApp({ searchQuery = '', onClearSearch }) {
  const hasSearchQuery = searchQuery && searchQuery.trim().length > 0;

  return (
    <Container>
      <MainContent>
        {/* Show search header when searching */}
        {hasSearchQuery && (
          <SearchHeader>
            <SearchTitle>
              🔍 Search Results: 
              <SearchQuery>"{searchQuery}"</SearchQuery>
            </SearchTitle>
            {onClearSearch && (
              <ClearSearchButton onClick={onClearSearch}>
                Clear Search
              </ClearSearchButton>
            )}
          </SearchHeader>
        )}

        {/* 🔥 LCP SECTION (LOAD IMMEDIATELY) */}
        <TrendingSection />

        {/* 🔥 FIRST POSTS (TEXT + HEADER ONLY) */}
        {/* Pass searchQuery to PostCard */}
        <PostCard searchQuery={searchQuery} />

        {/* 💤 NON-CRITICAL SECTION (LAZY LOADED) */}
        <Suspense fallback={<HeatMapSkeleton />}>
          <HeatMaps />
        </Suspense>

      </MainContent>
    </Container>
  );
}