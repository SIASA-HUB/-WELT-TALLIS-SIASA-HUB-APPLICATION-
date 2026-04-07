// src/App.jsx
import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";

// --- Utils & Theme ---
import theme from "./utils/theme";
import { CountyProvider } from "./context/countyContext";

// --- Components ---
import LandingPage from "./components/home/homePage";
import SloganSection from "./components/slogans/slogan";
import LeaderInsightPage from "./components/leaders/leaderInsights";
import RegistrationPage from "./components/auth/registerPage";
import CompetitionPage from "./components/boost/competitionPage";
import RegisterAspirant from "./components/leaders/registerAspirant";
import LoginAspirant from "./components/leaders/loginAspirant";
import AspirantDashboard from "./components/leaders/dashboard/aspirantDashboard";

// Merch store components
import AdminPanel from "./components/marketplace/admin/AdminPanel";
import Cart from "./components/marketplace/components/Cart/Cart";
import NavMenu from "./utils/navMenu";
import Checkout from "./components/marketplace/checkout/checkout";

// --- Optimized Lazy Loading ---
const lazyWithPreload = (importFn) => {
  const Component = lazy(importFn);
  Component.preload = importFn;
  return Component;
};

const ProfilePage = lazyWithPreload(
  () => import("./components/userProfile/profilePage"),
);
const LeadersPage = lazyWithPreload(
  () => import("./components/leaders/leadersPage"),
);
const MarketplacePage = lazyWithPreload(
  () => import("./components/marketplace/marketPage"),
);

const LoginPage = lazyWithPreload(() => import("./components/auth/loginPage"));

const DetailView = lazyWithPreload(
  () => import("./components/marketplace/Components/ItemDetails/DetailView"),
);

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: ${theme?.colors?.background || "#f5f5f5"};
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: #bb0000;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #8b0000;
  }
`;

const MainContent = styled.main`
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 100vh;
`;

// ScrollToTop component - resets scroll position on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
};

// --- MAIN APP COMPONENT ---
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CountyProvider>
        <Router>
          <GlobalStyle />
          <ScrollToTop />
          <AppLayout />
        </Router>
      </CountyProvider>
    </ThemeProvider>
  );
};

// --- LAYOUT WRAPPER ---

// --- LAYOUT WRAPPER ---
const AppLayout = () => {
  const location = useLocation();
  const isAdminPage =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/marketplace-admin");
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  // Only hide NavMenu on admin and auth pages
  // SHOW on trending and leaders pages
  const shouldShowNavMenu = !isAdminPage && !isAuthPage;

  return (
    <>
      <MainContent>
        <Suspense
          fallback={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                background: "#0a0a0f",
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  border: "3px solid rgba(225, 29, 72, 0.2)",
                  borderTop: "3px solid #e11d48",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          }
        >
          <Routes>
            {/* Main Routes */}
            <Route path="/" element={<LandingPage />} />

            {/* Marketplace Routes */}
            <Route path="/marketplace/*" element={<MarketplacePage />} />
            <Route path="/marketplace/product/:id" element={<DetailView />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/marketplace-admin" element={<AdminPanel />} />

            {/* Leader/Aspirant Routes */}
            <Route path="/register-aspirant" element={<RegisterAspirant />} />
            <Route path="/login-aspirant" element={<LoginAspirant />} />
            <Route path="/leaders" element={<LeadersPage />} />
            <Route path="/aspirant-dashboard" element={<AspirantDashboard />} />
            <Route path="/leaders/:id" element={<LeaderInsightPage />} />

            {/* Social Routes */}
            <Route path="/profile" element={<ProfilePage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />

            {/* Other Routes */}
            <Route path="/boost" element={<CompetitionPage />} />
          </Routes>
        </Suspense>
      </MainContent>

      {/* NavMenu - only hidden on admin and auth pages */}
      {shouldShowNavMenu && (
        <>
          <SloganSection />
          <NavMenu />
        </>
      )}
    </>
  );
};

export default App;
