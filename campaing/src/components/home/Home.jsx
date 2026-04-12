import React, { Suspense, memo, lazy, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import theme from "../../utils/theme";

// 1. LAZY LOAD TRENDING
const TrendingSection = lazy(() => import("../treading/treading"));

const progressMove = keyframes`
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
`;

// --- CLEAN TOP LOADER ---
const TopLoader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  background: ${theme.colors.primary || "#bb0000"};
  z-index: 9999;
  animation: ${progressMove} 2s ease-in-out infinite;
  box-shadow: 0 0 10px ${theme.colors.primary || "#bb0000"};
`;

const HomePageWrapper = styled.div`
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  font-family:
    "Inter",
    -apple-system,
    sans-serif;
  overflow-x: hidden;
  width: 100%;
  position: relative;
`;

const MainContent = styled.main`
  padding-top: 0px;
`;

// --- EMPTY FALLBACK ---
const EmptyFallback = () => <TopLoader />;

const SiasaApp = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    // Signal to index.html that React is ready
    if (window.markAsLoaded) {
      window.markAsLoaded();
    }
  }, []);

  return (
    <HomePageWrapper>
      <MainContent>
    
        <Suspense fallback={<EmptyFallback />}>
          <TrendingSection />
        </Suspense>
      </MainContent>
    </HomePageWrapper>
  );
};

export default memo(SiasaApp);
