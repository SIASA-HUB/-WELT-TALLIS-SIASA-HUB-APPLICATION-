import React, { useState, memo, useEffect, useRef, lazy, Suspense, useMemo, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import LoadingBar from "react-top-loading-bar";

import TopFypHeader from "./fyp";
import TrendingStoriesRow from "../stories/tredingStoriesRow";
import TrendingManifestos from "../leaders/manifestos/TredingManifestos";
import RalliesSection from "../rallies/ralliessection";
import TrendingLeaders from "../leaders/TrendingLeaders";
import SloganSection from "../footer/Footer";

// ─── Lazy-loaded sections ───
const MerchAdsCarousel = lazy(() => import("../marketplace/components/MerchAdsCarousel"));

// ─── Animations ───
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const TrendingContainer = styled.div`
  background: #ffffff;
  min-height: 100vh;
  padding-bottom: 0;
  animation: ${fadeIn} 0.5s ease-out;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  gap: 0;
`;

const SectionWrapper = styled.div`
  width: 100%;
  background: #ffffff;
`;

const DarkWrapper = styled.div`
  width: 100%;
  background: #0a0a0a;
`;

const Divider = styled.hr`
  height: 1px;
  background: #f0f0f0;
  border: none;
  margin: 0;
  width: 100%;
`;

const BottomCarouselWrapper = styled.div`
  width: 100%;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  padding: 30px 0;
  margin-top: 30px;
  margin-bottom: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

// Loading component for carousel
const CarouselSkeleton = () => (
  <div style={{ 
    padding: "40px 20px", 
    textAlign: "center",
    background: "linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite"
  }}>
    <style>{`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `}</style>
  </div>
);

// Loading skeleton for sections
const SectionSkeleton = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
`;

// Empty state message
const EmptyMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
  font-size: 14px;
  
  svg {
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

const TrendingSection = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [hasStories, setHasStories] = useState(true);
  const [hasLeaders, setHasLeaders] = useState(true);
  const [hasManifestos, setHasManifestos] = useState(true);
  const [hasRallies, setHasRallies] = useState(true);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [merchHasData, setMerchHasData] = useState(true);
  const loadingBarRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);
    
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try { setCurrentUser(JSON.parse(userData)); } catch {}
    }
    loadingBarRef.current?.complete();
    
    return () => clearTimeout(timer);
  }, []);

  // Memoize current user to prevent unnecessary re-renders
  const memoizedCurrentUser = useMemo(() => currentUser, [currentUser]);

  // Callback handlers
  const handleStoriesEmpty = useCallback(() => setHasStories(false), []);
  const handleLeadersEmpty = useCallback(() => setHasLeaders(false), []);
  const handleManifestosEmpty = useCallback(() => setHasManifestos(false), []);
  const handleRalliesEmpty = useCallback(() => setHasRallies(false), []);
  const handleMerchEmpty = useCallback(() => setMerchHasData(false), []);

  if (!isPageLoaded) {
    return (
      <TrendingContainer>
        <LoadingBar ref={loadingBarRef} color="#ff5c01" height={3} />
        <TopFypHeader />
        <ContentWrapper>
          <SectionSkeleton>Loading...</SectionSkeleton>
        </ContentWrapper>
      </TrendingContainer>
    );
  }

  // Check if any content exists
  const hasAnyContent = hasStories || hasLeaders || hasManifestos || hasRallies || merchHasData;

  if (!hasAnyContent) {
    return (
      <TrendingContainer>
        <LoadingBar ref={loadingBarRef} color="#ff5c01" height={3} />
        <TopFypHeader />
        <ContentWrapper>
          <EmptyMessage>
            <span style={{ fontSize: 48 }}>🇰🇪</span>
            <p>No content available at the moment.</p>
            <p style={{ fontSize: "12px", marginTop: "8px" }}>Check back later for updates!</p>
          </EmptyMessage>
        </ContentWrapper>
        <SloganSection />
      </TrendingContainer>
    );
  }

  return (
    <TrendingContainer>
      <LoadingBar ref={loadingBarRef} color="#ff5c01" height={3} />
      <TopFypHeader />

      <ContentWrapper>

        {/* ── 1. TRENDING STORIES ── */}
        {hasStories && (
          <SectionWrapper>
            <TrendingStoriesRow
              currentUser={memoizedCurrentUser}
              limit={50}
              onEmpty={handleStoriesEmpty}
            />
          </SectionWrapper>
        )}

        {hasStories && hasLeaders && <Divider />}

        {/* ── 2. TRENDING LEADERS ── */}
        {hasLeaders && (
          <SectionWrapper>
            <TrendingLeaders
              limit={8}
              compact={true}
              onEmpty={handleLeadersEmpty}
            />
          </SectionWrapper>
        )}

        {hasLeaders && hasManifestos && <Divider />}

        {/* ── 3. TRENDING MANIFESTOS ── */}
        {hasManifestos && (
          <SectionWrapper>
            <TrendingManifestos
              limit={6}
              onEmpty={handleManifestosEmpty}
            />
          </SectionWrapper>
        )}

        {hasManifestos && <Divider />}

     
        {/* ── 5. BOTTOM MERCH ADS CAROUSEL ── */}
        {merchHasData && (
          <BottomCarouselWrapper>
            <Suspense fallback={<CarouselSkeleton />}>
              <MerchAdsCarousel onEmpty={handleMerchEmpty} />
            </Suspense>
          </BottomCarouselWrapper>
        )}

      </ContentWrapper>


      <SloganSection />
    </TrendingContainer>
  );
};

export default memo(TrendingSection);
