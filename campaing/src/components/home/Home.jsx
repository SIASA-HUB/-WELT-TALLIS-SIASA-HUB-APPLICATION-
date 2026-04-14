import React, { Suspense, memo, lazy, useEffect, useState } from "react";
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
  background: #ffffff;
`;

const MainContent = styled.main`
  padding-top: 0px;
  min-height: 100vh;
`;

// --- FALLBACK COMPONENTS ---
const LoadingFallback = () => (
  <div style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: "16px"
  }}>
    <TopLoader />
    <div style={{
      width: 48,
      height: 48,
      border: "3px solid #f0f0f0",
      borderTopColor: theme.colors.primary || "#bb0000",
      borderRadius: "50%",
      animation: "spin 1s linear infinite"
    }} />
    <p style={{ color: "#94a3b8", fontSize: "14px" }}>Loading SiasaHub...</p>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const ErrorFallback = ({ error }) => (
  <div style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: "16px",
    textAlign: "center",
    padding: "20px"
  }}>
    <div style={{
      width: 64,
      height: 64,
      background: "#fee2e2",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <span style={{ fontSize: 32 }}>⚠️</span>
    </div>
    <h3 style={{ color: "#1e293b", margin: 0 }}>Something went wrong</h3>
    <p style={{ color: "#64748b", fontSize: "14px", maxWidth: 400 }}>
      {error?.message || "Unable to load content. Please try again later."}
    </p>
    <button
      onClick={() => window.location.reload()}
      style={{
        padding: "10px 24px",
        background: theme.colors.primary || "#bb0000",
        color: "white",
        border: "none",
        borderRadius: "30px",
        cursor: "pointer",
        fontWeight: 600
      }}
    >
      Refresh Page
    </button>
  </div>
);

const EmptyFallback = () => (
  <div style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: "12px"
  }}>
    <TopLoader />
    <div style={{
      width: 80,
      height: 80,
      background: "#f8fafc",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <span style={{ fontSize: 40 }}>🇰🇪</span>
    </div>
    <p style={{ color: "#94a3b8", fontSize: "14px" }}>Welcome to SiasaHub</p>
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

const SiasaApp = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Simulate minimum loading time to prevent flash
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "instant" });

    // Signal to index.html that React is ready
    if (window.markAsLoaded) {
      window.markAsLoaded();
    }

    return () => clearTimeout(timer);
  }, []);

  // Show loading state
  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <ErrorBoundary>
      <HomePageWrapper>
        <MainContent>
          <Suspense fallback={<LoadingFallback />}>
            <TrendingSection />
          </Suspense>
        </MainContent>
      </HomePageWrapper>
    </ErrorBoundary>
  );
};

export default memo(SiasaApp);
