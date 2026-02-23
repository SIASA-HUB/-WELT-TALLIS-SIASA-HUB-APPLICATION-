import React, { useState, useLayoutEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import styled from "styled-components";
import "bootstrap/dist/css/bootstrap.min.css";

import GlobalHeader from "./utils/globalheader";
import NavMenu from "./utils/navMenu";
import LandingPage from "./components/home/homePage";

const LeaderInsightPage = lazy(
  () => import("./components/leaders/leaderInsights"),
);
const NotificationsPage = lazy(
  () => import("./components/notifications/notificationsPage"),
);

const ProfilePage = lazy(() => import("./components/userProfile/profilePage"));
const LeadersPage = lazy(() => import("./components/leaders/leadersPage"));

const RegistrationPage = lazy(() => import("./components/auth/registerPage"));
const LoginPage = lazy(() => import("./components/auth/loginPage"));
const CreateManifesto = lazy(
  () => import("./components/leaders/createManifesto"),
);
const LeaderRegistration = lazy(
  () => import("./components/leaders/createLeader"),
);
const MarketplacePage = lazy(
  () => import("./components/marketplace/marketPage"),
);
const ProductDetailPage = lazy(
  () => import("./components/marketplace/productdetailsPage"),
);
const PollsPage = lazy(() => import("./components/polls/poll"));
import PollCreator from "./components/polls/createPoll";

const MainContainer = styled.main`
  padding-top: 60px;
  padding-bottom: 80px;
  min-height: 100vh;
  background: #f8fafc;
`;

// Helper to ensure page starts at the top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

//  fallback for lazy components
const PageLoader = () => (
  <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
    Loading...
  </div>
);

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [notifCount, setNotifCount] = useState(5);

  return (
    <Router>
      <ScrollToTop />

      <GlobalHeader
        notifCount={notifCount}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
      />

      <MainContainer>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/"
              element={
                <LandingPage
                  searchQuery={searchQuery}
                  onClearSearch={() => setSearchQuery("")}
                />
              }
            />
            <Route path="/leaders" element={<LeadersPage />} />
            <Route
              path="/admin/create-leader"
              element={<LeaderRegistration />}
            />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route
              path="/marketplace/product/:id"
              element={<ProductDetailPage />}
            />
            <Route path="/leader/:id" element={<LeaderInsightPage />} />

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/manifesto" element={<CreateManifesto />} />
            <Route path="/polls" element={<PollsPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/create-poll" element={<PollCreator />} />

            <Route
              path="/notifications"
              element={
                <NotificationsPage
                  onBack={() => window.history.back()}
                  clearCount={() => setNotifCount(0)}
                />
              }
            />
          </Routes>
        </Suspense>
      </MainContainer>

      <NavMenu />
    </Router>
  );
};

export default App;
