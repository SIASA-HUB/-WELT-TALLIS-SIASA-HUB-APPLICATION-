// src/components/leaders/dashboard/aspirantDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Menu,
  X,
  FileText,
  CreditCard,
  Target,
  UserPlus,
  Calendar,
  Eye,
  Share2,
  AlertCircle,
  Award,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  BarChart2,
  CheckCircle,
} from "lucide-react";
import api from "../../../api/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";

import CreateManifesto from "../manifestos/createManifesto";
import CreateRally from "../../rallies/createRally";
import DashboardOverview from "./DashboardOverview";
import SupportersSection from "./SuportersSection";
import AnalyticsSection from "./AnalyticsSection";
import AccountBillingSection from "./AccountBilling";
import ProfileSettingsSection from "./ProfileSetting";
import DashboardSEO from "./DashboardSEO";

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
  
  body {
    margin: 0;
    padding: 0;
    font-family: 'Outfit', sans-serif;
  }
`;

// ==================== Styled Components ====================
const DashboardWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: #000000ff;

  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const SidebarOverlay = styled.div`
  @media (max-width: 768px) {
    display: ${(props) => (props.isOpen ? "block" : "none")};
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 90;
  }
`;

const Sidebar = styled.aside`
  width: 280px;
  background: #0f172a;
  color: #fff;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 100;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    position: fixed;
    left: ${(props) => (props.isOpen ? "0" : "-280px")};
  }
`;

const Logo = styled.div`
  padding: 32px 24px;
  font-size: 20px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  letter-spacing: -0.5px;
  
  span {
    background: linear-gradient(135deg, #ff4d4d 0%, #bb0000 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const NavSection = styled.div`
  margin-top: 20px;
  flex: 1;
  padding: 0 16px;
`;

const NavItem = styled.div`
  padding: 14px 20px;
  margin: 8px 0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: ${(props) => (props.$active ? "#fff" : "#94a3b8")};
  background: ${(props) => (props.$active ? "linear-gradient(135deg, #bb0000 0%, #880000 100%)" : "transparent")};
  box-shadow: ${(props) => (props.$active ? "0 10px 20px rgba(187, 0, 0, 0.2)" : "none")};
  font-weight: ${(props) => (props.$active ? "700" : "500")};
  font-size: 15px;

  &:hover {
    background: ${(props) => (props.$active ? "linear-gradient(135deg, #bb0000 0%, #880000 100%)" : "rgba(255, 255, 255, 0.05)")};
    color: #fff;
    transform: ${(props) => (props.$active ? "none" : "translateX(4px)")};
  }

  svg {
    transition: all 0.3s;
    transform: ${(props) => (props.$active ? "scale(1.1)" : "scale(1)")};
  }
`;

const RallyBadge = styled.span`
  background: #10b981;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  margin-left: auto;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: hidden;
`;

const TopNav = styled.nav`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 80;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
`;

const MenuButton = styled.button`
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  color: #1e293b;

  &:hover {
    background: #f1f5f9;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .text {
    text-align: right;

    .name {
      font-weight: 600;
      font-size: 14px;
      color: #1e293b;
    }

    .party {
      font-size: 11px;
      color: #64748b;
    }
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e2e8f0;
  }
`;

const ContentBody = styled.div`
  padding: 10px;

  @media (min-width: 768px) {
    padding: 20px;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  background: #0f172a;
`;

// ========== Dashboard Home Styled Components ==========
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
`;

const StatInfo = styled.div`
  .value {
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
  }
  .label {
    font-size: 13px;
    color: #64748b;
    margin-top: 4px;
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${(props) => props.$bg || "#f1f5f9"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.$color || "#1e293b"};
`;

const SectionCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  margin-bottom: 24px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid #eef2f6;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const CompetitorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 20px;
`;

const CompetitorCard = styled.div`
  background: rgba(248, 250, 252, 0.6);
  backdrop-filter: blur(2px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 18px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    background: #f1f5f9;
    transform: translateX(4px);
  }

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    background: #e2e8f0;
  }

  .info {
    flex: 1;
    .name {
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .party {
      font-size: 12px;
      color: #64748b;
    }
    .stats {
      display: flex;
      gap: 12px;
      margin-top: 6px;
      font-size: 11px;
      color: #475569;
      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .gap {
    font-weight: 800;
    font-size: 18px;
    color: ${(props) => (props.isAhead ? "#10b981" : "#ef4444")};
    white-space: nowrap;
  }
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InsightList = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InsightItem = styled.div`
  background: ${(props) => (props.type === "warning" ? "#fef2f2" : "#ecfdf5")};
  border-left: 3px solid ${(props) => (props.type === "warning" ? "#ef4444" : "#10b981")};
  padding: 14px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: ${(props) => (props.type === "warning" ? "#ef4444" : "#10b981")};
    flex-shrink: 0;
  }

  .content {
    flex: 1;
    .title {
      font-weight: 700;
      font-size: 14px;
      color: #0f172a;
    }
    .description {
      font-size: 12px;
      color: #475569;
      margin-top: 2px;
    }
  }
`;

const TrendChart = styled.div`
  padding: 20px;
  height: 300px;
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: ${(props) => props.$bg || "#e2e8f0"};
  color: ${(props) => props.$color || "#475569"};
`;

// ==================== DashboardHome Enhanced ====================
// DashboardHome removed in favor of DashboardOverview

const AspirantDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [leader, setLeader] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rallyCount, setRallyCount] = useState(0);
  const [manifestoStatus, setManifestoStatus] = useState("not_started");
  const [supporterCount, setSupporterCount] = useState(0);

  useEffect(() => {
    const storedData = localStorage.getItem("leaderData");
    const token = localStorage.getItem("leaderToken");

    if (!token || !storedData) {
      navigate("/login-aspirant");
      return;
    }

    try {
      const parsedData = JSON.parse(storedData);
      const actualLeader = parsedData.leader || parsedData;
      setLeader(actualLeader);
      const leaderId = actualLeader.leader_id || actualLeader._id || actualLeader.id;
      fetchRallyCount(leaderId);
      fetchManifestoStatus(leaderId);
      fetchSupporterCount(leaderId);
    } catch (error) {
      navigate("/login-aspirant");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchRallyCount = async (leaderId) => {
    try {
      const response = await api.get(`/rallies/leader/${leaderId}/count`);
      if (response?.success) setRallyCount(response.count || 0);
    } catch (error) {
      console.warn("Rally service unavailable, defaulting count to 0");
      setRallyCount(0);
    }
  };

  const fetchManifestoStatus = async (leaderId) => {
    try {
      const response = await api.get(`/leaders/manifestos/leader/${leaderId}`);
      if (response?.success && response?.data) setManifestoStatus("completed");
      else setManifestoStatus("not_started");
    } catch (error) {
      setManifestoStatus("not_started");
    }
  };

  const fetchSupporterCount = async (leaderId) => {
    try {
      const response = await api.get(`/endorsements/leader/${leaderId}/stats`);
      if (response?.success && response?.data) setSupporterCount(response.data.total_endorsements || 0);
    } catch (error) {
      setSupporterCount(0);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      // Call server logout to clear session cookies
      try {
        await api.post("/users/logout").catch(() => { });
        await api.post("/leaders/logout").catch(() => { });
      } catch (e) { }

      // Manual cleanup to ensure only leader session ends
      localStorage.removeItem("leaderToken");
      localStorage.removeItem("leaderData");
      localStorage.removeItem("currentLeaderId");
      localStorage.setItem("was_aspirant", "true");

      // Force reload to clear all React states and go to login
      window.location.href = "/login-aspirant";
    }
  };

  const handleRallyCreated = () => setRallyCount(prev => prev + 1);

  if (loading) return <LoadingSpinner>Loading dashboard...</LoadingSpinner>;
  if (!leader) return <LoadingSpinner>No leader data found. Redirecting...</LoadingSpinner>;

  const leaderId = leader.leader_id || leader._id || leader.id;

  const renderContent = () => {
    switch (activeTab) {
      case "manifesto": return <CreateManifesto leaderId={leaderId} />;
      case "rally": return <CreateRally leaderId={leaderId} onRallyCreated={handleRallyCreated} />;
      case "supporters": return <SupportersSection leader={leader} />;
      case "analytics": return <AnalyticsSection leader={leader} />;
      case "billing": return <AccountBillingSection leader={leader} />;
      case "settings": return <ProfileSettingsSection leader={leader} />;
      default: return (
        <>
          <DashboardSEO leader={leader} activeTab={activeTab} />
          <DashboardOverview leader={leader} />
        </>
      );
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "manifesto", label: "My Manifesto", icon: <FileText size={18} /> },
    { id: "rally", label: "Create Rally", icon: <MapPin size={18} />, badge: rallyCount },
    { id: "supporters", label: "Supporters", icon: <Users size={18} /> },
    { id: "analytics", label: "Analytics", icon: <TrendingUp size={18} /> },
    { id: "billing", label: "Billing & Payments", icon: <CreditCard size={18} /> },
    { id: "settings", label: "Profile & Settings", icon: <Settings size={18} /> },
  ];

  return (
    <DashboardWrapper>
      <GlobalStyle />
      <SidebarOverlay isOpen={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      <Sidebar isOpen={sidebarOpen}>
        <Logo><ShieldCheck size={24} color="#bb0000" /><span>SiasaHub</span></Logo>
        <NavSection>
          {navItems.map(item => (
            <NavItem key={item.id} $active={activeTab === item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}>
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && <RallyBadge>{item.badge}</RallyBadge>}
            </NavItem>
          ))}
          <NavItem onClick={handleLogout} style={{ marginTop: "20px" }}>
            <LogOut size={18} /><span>Logout</span>
          </NavItem>
        </NavSection>
      </Sidebar>

      <MainContent>
        <TopNav>
          <MenuButton onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </MenuButton>
          <UserInfo>
            <div className="text">
              <div className="name">{leader.name || "Leader"}</div>
              <div className="party">{leader.party || "Independent"}</div>
            </div>
            <img className="avatar" src={leader.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name || "Leader")}&background=1e3c72&color=fff&size=80`} alt="profile" />
          </UserInfo>
        </TopNav>
        <ContentBody>
          {renderContent()}
        </ContentBody>
      </MainContent>
    </DashboardWrapper>
  );
};

export default AspirantDashboard;