import React, { useState, memo, useEffect, useRef, lazy, Suspense, useMemo, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import LoadingBar from "react-top-loading-bar";

import TopFypHeader from "./fyp";

import TrendingManifestos from "../leaders/manifestos/TredingManifestos";
import RalliesSection from "../rallies/ralliessection";
import TrendingLeaders from "../leaders/TrendingLeaders";
import SloganSection from "../footer/Footer";


const MerchAdsCarousel = lazy(() => import("../marketplace/components/MerchAdsCarousel"));


const preloadMerch = () => {
  const script = document.createElement('link');
  script.rel = 'prefetch';
  script.as = 'script';
  script.href = '../marketplace/components/MerchAdsCarousel';
  document.head.appendChild(script);
};

// ─── Animations ───
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const TrendingContainer = styled.div`
  background: #ffffff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.5s ease-out;
  position: relative;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  gap: 0;
  flex: 1;
`;

const SectionWrapper = styled.div`
  width: 100%;
  background: #ffffff;
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
  padding: 0; 
  margin: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: none;
`;

// Sticky Footer Wrapper
const StickyFooterWrapper = styled.div`
  width: 100%;
  margin-top: auto;
  background: #ffffff;
  padding: 0;
  margin-bottom: 0;
`;

// Minimal loading component
const CarouselSkeleton = memo(() => (
  <div style={{
    padding: "0",
    minHeight: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }} />
));

// Loading skeleton for sections
const SectionSkeleton = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
`;

// Empty state message
const EmptyMessage = memo(() => (
  <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8", fontSize: "14px" }}>
    <span style={{ fontSize: 48 }}>🇰🇪</span>
    <p>No content available at the moment.</p>
    <p style={{ fontSize: "12px", marginTop: "8px" }}>Check back later for updates!</p>
  </div>
));

// Memoized section components to prevent re-renders
const MemoizedTrendingLeaders = memo(TrendingLeaders);
const MemoizedTrendingManifestos = memo(TrendingManifestos);
const MemoizedSloganSection = memo(SloganSection);

const TrendingSection = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [hasLeaders, setHasLeaders] = useState(true);
  const [hasManifestos, setHasManifestos] = useState(true);
  const [hasRallies, setHasRallies] = useState(true);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [merchHasData, setMerchHasData] = useState(true);
  const [shouldLoadMerch, setShouldLoadMerch] = useState(false);
  const loadingBarRef = useRef(null);

  // Preload merch 
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        preloadMerch();
        setShouldLoadMerch(true);
      });
    } else {
      setTimeout(() => {
        preloadMerch();
        setShouldLoadMerch(true);
      }, 100);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 50);

    const userData = localStorage.getItem("user_data");
    if (userData) {
      try { setCurrentUser(JSON.parse(userData)); } catch { }
    }
    loadingBarRef.current?.complete();

    return () => clearTimeout(timer);
  }, []);

  // Memoize current user 
  const memoizedCurrentUser = useMemo(() => currentUser, [currentUser]);

  // Callback handlers with useCallback
  const handleLeadersEmpty = useCallback(() => setHasLeaders(false), []);
  const handleManifestosEmpty = useCallback(() => setHasManifestos(false), []);
  const handleRalliesEmpty = useCallback(() => setHasRallies(false), []);

  const handleMerchEmpty = useCallback(() => {
    setMerchHasData(false);
  }, []);

  // Memoize content check
  const hasAnyContent = useMemo(() => {
    return hasLeaders || hasManifestos || hasRallies;
  }, [hasLeaders, hasManifestos, hasRallies]);

  // Memoize empty state check
  const showEmptyState = useMemo(() => {
    return !hasAnyContent && !merchHasData;
  }, [hasAnyContent, merchHasData]);

  // Early return for loading state
  if (!isPageLoaded) {
    return (
      <TrendingContainer>
        <LoadingBar ref={loadingBarRef} color="#ff5c01" height={3} />
        <TopFypHeader />
        <ContentWrapper>
          <SectionSkeleton>Loading...</SectionSkeleton>
        </ContentWrapper>
        <StickyFooterWrapper>
          <MemoizedSloganSection />
        </StickyFooterWrapper>
      </TrendingContainer>
    );
  }

  // Early return for empty state
  if (showEmptyState) {
    return (
      <TrendingContainer>
        <LoadingBar ref={loadingBarRef} color="#ff5c01" height={3} />
        <TopFypHeader />
        <ContentWrapper>
          <EmptyMessage />
        </ContentWrapper>
        <StickyFooterWrapper>
          <MemoizedSloganSection />
        </StickyFooterWrapper>
      </TrendingContainer>
    );
  }

  return (
    <TrendingContainer>
      <LoadingBar ref={loadingBarRef} color="#ff5c01" height={3} />
      <TopFypHeader />

      <ContentWrapper>
        {/* ── 1. TRENDING LEADERS ── */}
        {hasLeaders && (
          <SectionWrapper>
            <MemoizedTrendingLeaders
              limit={8}
              compact={true}
              onEmpty={handleLeadersEmpty}
            />
          </SectionWrapper>
        )}

        {hasLeaders && hasManifestos && <Divider />}

        {/* ── 2. TRENDING MANIFESTOS ── */}
        {hasManifestos && (
          <SectionWrapper>
            <MemoizedTrendingManifestos
              limit={6}
              onEmpty={handleManifestosEmpty}
              currentUser={memoizedCurrentUser}
            />
          </SectionWrapper>
        )}

        {hasManifestos && <Divider />}

        {/* ── 3. MERCH ADS CAROUSEL  ── */}
        {merchHasData && shouldLoadMerch && (
          <BottomCarouselWrapper>
            <Suspense fallback={<CarouselSkeleton />}>
              <MerchAdsCarousel
                onEmpty={handleMerchEmpty}
              />
            </Suspense>
          </BottomCarouselWrapper>
        )}
      </ContentWrapper>

      {/* ── 4. STICKY FOOTER - ALWAYS AT BOTTOM ── */}
      <StickyFooterWrapper>
        <MemoizedSloganSection />
      </StickyFooterWrapper>
    </TrendingContainer>
  );
};


export default memo(TrendingSection);