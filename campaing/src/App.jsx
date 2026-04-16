// src/App.jsx - SEO-First Routing with Slugs, Leader Listings & Shopping History

import React, { lazy, Suspense, useEffect, useState } from "react";
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
import NavMenu from "./utils/navMenu";

// --- Lazy Loaded Components ---
const LandingPage = lazy(() => import("./components/home/Home"));
const SloganSection = lazy(() => import("./components/footer/Footer"));
const LeaderInsightPage = lazy(() => import("./components/leaders/leaderInsights"));
const RegistrationPage = lazy(() => import("./components/auth/Register"));
const RegisterAspirant = lazy(() => import("./components/leaders/registerAspirant"));
const LoginAspirant = lazy(() => import("./components/leaders/loginAspirant"));
const NotFound = lazy(() => import("./components/404"));
const Unauthorized = lazy(() => import("./components/Unothourized"));

// --- Lazy Loaded Components ---
const AspirantDashboard = lazy(() => import("./components/leaders/dashboard/aspirantDashboard"));
const AdminPanel = lazy(() => import("./components/marketplace/admin/adminPanel"));
const UsersAdmin = lazy(() => import("./components/adminPage/adminUsers"));
const AdminDashboard = lazy(() => import("./components/adminPage/AdminDashboard"));
const ProfilePage = lazy(() => import("./components/wallet/WalletPage"));
const LeadersPage = lazy(() => import("./components/leaders/leadersPage"));
const LeaderListingPage = lazy(() => import("./components/leaders/LeaderListingPage"));
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

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #1a1a1a; border-radius: 10px; }
  ::-webkit-scrollbar-thumb { background: #e11d48; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #be123c; }
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

// Check both key names — leaderToken (set by loginAspirant.jsx) and aspirant_token (legacy)
const getAspirantToken = () =>
  localStorage.getItem("aspirant_token") || localStorage.getItem("leaderToken");

// Check if user has admin or marketadmin role from normal login
const hasAdminRole = () => {
  const user = getCurrentUser();
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");
  return user && token && (user.role === "admin" || user.role === "marketadmin");
};

const isAuthenticated = () => {
  const user = getCurrentUser();
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");
  return !!(user && token);
};

// --- Protected Route Component ---
const ProtectedRoute = ({ children, requiredRole, redirectTo = "/login" }) => {
  const [authState, setAuthState] = useState({ isAuthenticated: null, userRole: null });

  useEffect(() => {
    const checkAuth = () => {
      // Check for aspirant role
      const aspirantToken = getAspirantToken();
      if (aspirantToken && requiredRole === "aspirant") {
        setAuthState({ isAuthenticated: true, userRole: "aspirant" });
        return;
      }

      // Check for admin/marketadmin from normal login
      const user = getCurrentUser();
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      
      if (requiredRole === "admin" || requiredRole === "marketadmin") {
        if (user && token && (user.role === "admin" || user.role === "marketadmin")) {
          setAuthState({ isAuthenticated: true, userRole: user.role });
          return;
        }
        setAuthState({ isAuthenticated: false, userRole: null });
        return;
      }

      // Check for regular user routes
      if (user && token && requiredRole === "user") {
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
    "/admin/dashboard", "/admin/users",
    "/marketplace-admin", "/login-aspirant", "/register-aspirant",
    "/aspirant-dashboard", "/login", "/register"
  ];

  const shouldHideNav = hideNavPaths.some(path => location.pathname.startsWith(path));

  const shouldShowSlogan = !location.pathname.startsWith("/marketplace") &&
                           !location.pathname.startsWith("/product") &&
                           !location.pathname.startsWith("/account") &&
                           !shouldHideNav &&
                           location.pathname !== "/";

  return (
    <>
      <MainContent>
        <Suspense fallback={<LoadingSpinner><div className="spinner" /></LoadingSpinner>}>
          <Routes>
            {/* ===== PUBLIC ROUTES ===== */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* ===== ADMIN ROUTES - Using normal login ===== */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="admin" redirectTo="/login">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="admin" redirectTo="/login">
                <UsersAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/aspirants" element={
              <ProtectedRoute requiredRole="admin" redirectTo="/login">
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* ===== MARKETPLACE ADMIN ROUTES - Using normal login ===== */}
            <Route path="/marketplace-admin" element={
              <ProtectedRoute requiredRole="marketadmin" redirectTo="/login">
                <AdminPanel />
              </ProtectedRoute>
            } />

            {/* ===== MARKETPLACE ROUTES ===== */}
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/marketplace/shop" element={<MarketplacePage />} />
            <Route path="/marketplace/checkout" element={
              <ProtectedRoute requiredRole="user" redirectTo="/login">
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/marketplace/*" element={<MarketplacePage />} />
            <Route path="/shop" element={<Navigate to="/marketplace" replace />} />

            {/* ===== SEO PRODUCT ROUTES ===== */}
            {/* Clean slug-based product URL — primary route for SEO */}
            <Route path="/product/:slug" element={<ProductDetails />} />
            {/* Legacy route redirects — keeps old links working */}
            <Route path="/marketplace/shop/:id" element={<Navigate to="/marketplace" replace />} />
            <Route path="/shop/:id" element={<Navigate to="/marketplace" replace />} />

            {/* ===== USER ACCOUNT ROUTES ===== */}
            {/* /account/history — SEO-friendly shopping history */}
            <Route path="/account/history" element={
              <ProtectedRoute requiredRole="user" redirectTo="/login">
                <MyOrders />
              </ProtectedRoute>
            } />
            {/* Redirect old /marketplace/orders to clean /account/history */}
            <Route path="/marketplace/orders" element={<Navigate to="/account/history" replace />} />
            <Route path="/profile" element={
              <ProtectedRoute requiredRole="user" redirectTo="/login">
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/me/profile" element={<Navigate to="/profile" replace />} />

            {/* ===== ASPIRANT ROUTES ===== */}
            <Route path="/register-aspirant" element={<RegisterAspirant />} />
            <Route path="/login-aspirant" element={<LoginAspirant />} />
            <Route path="/aspirant-dashboard" element={
              <ProtectedRoute requiredRole="aspirant" redirectTo="/login-aspirant">
                <AspirantDashboard />
              </ProtectedRoute>
            } />

            {/* ===== SEO LEADER ROUTES ===== */}
            {/* Primary clean leader page */}
            <Route path="/leader/:slug" element={<LeaderInsightPage />} />
            {/* /aspirants/:slug — keep working, same component */}
            <Route path="/aspirants/:slug" element={<LeaderInsightPage />} />
            {/* Legacy numeric ID route */}
            <Route path="/leaders/:id" element={<LeaderInsightPage />} />
            {/* Leaders listing */}
            <Route path="/leaders" element={<LeadersPage />} />

            <Route path="/county/:county/position/:position" element={<LeaderListingPage />} />
            <Route path="/county/:county" element={<LeadersPage />} />

            {/* ===== LEGACY LOCATION-BASED SEO ROUTES ===== */}
            {/* These must come LAST before 404 */}
            <Route path="/:county/:constituency/:ward" element={<LeadersPage />} />
            <Route path="/:county/:constituency" element={<LeadersPage />} />
            <Route path="/:county" element={<LeadersPage />} />

            {/* ===== 404 — MUST BE ABSOLUTELY LAST ===== */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </MainContent>

      {/* NavMenu */}
      {!shouldHideNav && <NavMenu />}

      {/* SloganSection */}
      {shouldShowSlogan && <SloganSection />}
    </>
  );
};

export default App;
