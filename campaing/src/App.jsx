// src/App.jsx - Fixed route ordering

import React, { lazy, Suspense, useEffect, useState, useCallback, useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";

// --- Utils & Theme ---
import theme from "./utils/theme";

// --- Components (Eager loaded - critical for initial render) ---
import LandingPage from "./components/home/Home";
import SloganSection from "./components/footer/Footer";
import LeaderInsightPage from "./components/leaders/leaderInsights";
import RegistrationPage from "./components/auth/Register";
import RegisterAspirant from "./components/leaders/registerAspirant";
import LoginAspirant from "./components/leaders/loginAspirant";
import NotFound from "./components/404";
import Unauthorized from "./components/Unothourized";
import AdminLogin from "./components/adminPage/adminLogin";
import NavMenu from "./utils/navMenu";

// --- Lazy Loaded Components (Non-critical) ---
const AspirantDashboard = lazy(() => import("./components/leaders/dashboard/aspirantDashboard"));
const AdminPanel = lazy(() => import("./components/marketplace/admin/adminPanel"));
const UsersAdmin = lazy(() => import("./components/adminPage/adminUsers"));
const AdminDashboard = lazy(() => import("./components/adminPage/AdminDashboard"));
const ProfilePage = lazy(() => import("./components/wallet/WalletPage"));
const LeadersPage = lazy(() => import("./components/leaders/leadersPage"));
const MarketplacePage = lazy(() => import("./components/marketplace/marketPage"));
const LoginPage = lazy(() => import("./components/auth/Login"));
const ProductDetails = lazy(() => import("./components/marketplace/pages/ProductDetails"));
const Checkout = lazy(() => import("./components/marketplace/checkout/checkout"));
const MyOrders = lazy(() => import("./components/marketplace/pages/MyOrders"));

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #000;
    color: #fff;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: #1a1a1a;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: #e11d48;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #be123c;
  }
`;

const MainContent = styled.main`
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 100vh;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #0a0a0f;
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(225, 29, 72, 0.1);
    border-top: 3px solid #e11d48;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
};

// --- Auth Helper Functions ---
const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

const getAspirantToken = () => localStorage.getItem("aspirant_token");
const getAdminToken = () => localStorage.getItem("admin_token");

// --- Protected Route Component ---
const ProtectedRoute = ({ children, requiredRole, redirectTo = "/login" }) => {
  const [authState, setAuthState] = useState({ isAuthenticated: null, userRole: null });

  useEffect(() => {
    const checkAuth = () => {
      const adminToken = getAdminToken();
      if (adminToken && requiredRole === "admin") {
        setAuthState({ isAuthenticated: true, userRole: "admin" });
        return;
      }

      const aspirantToken = getAspirantToken();
      if (aspirantToken && requiredRole === "aspirant") {
        setAuthState({ isAuthenticated: true, userRole: "aspirant" });
        return;
      }

      const user = getCurrentUser();
      if (user && requiredRole === "marketadmin" && user.role === "marketadmin") {
        setAuthState({ isAuthenticated: true, userRole: "marketadmin" });
        return;
      }

      if (user && requiredRole === "user") {
        setAuthState({ isAuthenticated: true, userRole: "user" });
        return;
      }

      setAuthState({ isAuthenticated: false, userRole: null });
    };

    checkAuth();
  }, [requiredRole]);

  if (authState.isAuthenticated === null) {
    return <LoadingSpinner><div className="spinner" /></LoadingSpinner>;
  }

  if (!authState.isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

// --- MAIN APP COMPONENT ---
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <GlobalStyle />
        <ScrollToTop />
        <AppLayout />
      </Router>
    </ThemeProvider>
  );
};

// --- LAYOUT WRAPPER ---
const AppLayout = () => {
  const location = useLocation();
  
  // Pages where NavMenu should be hidden
  const hideNavPaths = [
    "/admin", "/admin/login", "/admin/dashboard", "/admin/users",
    "/marketplace-admin", "/login-aspirant", "/register-aspirant",
    "/aspirant-dashboard", "/login", "/register"
  ];
  
  // Check if current path should hide navigation
  const shouldHideNav = hideNavPaths.some(path => location.pathname.startsWith(path));
  
  // Check if slogan should be shown
  const shouldShowSlogan = !location.pathname.startsWith("/marketplace") && 
                           !shouldHideNav && 
                           location.pathname !== "/";

  return (
    <>
      <MainContent>
        <Suspense fallback={<LoadingSpinner><div className="spinner" /></LoadingSpinner>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                  <UsersAdmin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/aspirants" 
              element={
                <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* ==================== MARKETPLACE ROUTES (MUST COME BEFORE SEO ROUTES) ==================== */}
            <Route 
              path="/marketplace-admin" 
              element={
                <ProtectedRoute requiredRole="marketadmin" redirectTo="/login">
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            {/* Marketplace main routes */}
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/marketplace/shop" element={<MarketplacePage />} />
            {/* Product details - specific pattern */}
            <Route path="/marketplace/shop/:id" element={<ProductDetails />} />
            <Route path="/marketplace/checkout" element={<Checkout />} />
            <Route path="/marketplace/orders" element={<MyOrders />} />
            {/* Catch all marketplace routes */}
            <Route path="/marketplace/*" element={<MarketplacePage />} />
            <Route path="/shop" element={<Navigate to="/marketplace/shop" replace />} />
            <Route path="/shop/:id" element={<Navigate to="/marketplace/shop/:id" replace />} />
            
            {/* Aspirant Routes */}
            <Route path="/register-aspirant" element={<RegisterAspirant />} />
            <Route path="/login-aspirant" element={<LoginAspirant />} />
            <Route 
              path="/aspirant-dashboard" 
              element={
                <ProtectedRoute requiredRole="aspirant" redirectTo="/login-aspirant">
                  <AspirantDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Leader/Public Routes */}
            <Route path="/leaders" element={<LeadersPage />} />
            <Route path="/aspirants/:slug" element={<LeaderInsightPage />} />
            <Route path="/leaders/:id" element={<LeaderInsightPage />} />
            
            {/* User Profile */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute requiredRole="user" redirectTo="/login">
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route path="/me/profile" element={<Navigate to="/profile" replace />} />
            
            {/* ==================== SEO ROUTES (MUST COME LAST, BEFORE 404) ==================== */}
            {/* These capture location-based URLs like /Nairobi, /Nairobi/Makadara, etc. */}
            <Route path="/:county/:constituency/:ward" element={<LeadersPage />} />
            <Route path="/:county/:constituency" element={<LeadersPage />} />
            <Route path="/:county" element={<LeadersPage />} />
            
            {/* 404 Page - MUST BE ABSOLUTELY LAST */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </MainContent>

      {/* NavMenu - Always show except on admin/auth pages */}
      {!shouldHideNav && <NavMenu />}
      
      {/* SloganSection - Show on appropriate pages */}
      {shouldShowSlogan && <SloganSection />}
    </>
  );
};

export default App;