import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
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
} from "lucide-react";
import api from "../../../api/api";

import CreateManifesto from "../manifestos/createManifesto";
import CreateRally from "../../rallies/createRally";
import DashboardOverview from "./DashboardOverview";
import SupportersSection from "./SuportersSection";
import AnalyticsSection from "./AnalyticsSection";
import AccountBillingSection from "./AccountBilling";
import ProfileSettingsSection from "./ProfileSetting";

const DashboardWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
  width: 260px;
  background: #1a1a2e;
  color: #fff;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 100;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    position: fixed;
    left: ${(props) => (props.isOpen ? "0" : "-260px")};
  }
`;

const Logo = styled.div`
  padding: 24px 20px;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
`;

const NavSection = styled.div`
  margin-top: 20px;
  flex: 1;
  padding: 0 12px;
`;

const NavItem = styled.div`
  padding: 10px 16px;
  margin: 4px 0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: ${(props) => (props.active ? "#fff" : "rgba(255, 255, 255, 0.7)")};
  background: ${(props) => (props.active ? "#bb0000" : "transparent")};
  font-weight: ${(props) => (props.active ? "600" : "400")};

  &:hover {
    background: ${(props) => (props.active ? "#bb0000" : "rgba(255, 255, 255, 0.1)")};
    color: #fff;
  }
`;

const RallyBadge = styled.span`
  background: #10b981;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  margin-left: auto;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: hidden;
`;

const TopNav = styled.nav`
  background: white;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 80;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid #e2e8f0;
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
  padding: 24px;

  @media (min-width: 768px) {
    padding: 32px;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: 14px;
  color: #64748b;
`;

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
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;

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

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 16px;

  &:hover {
    border-color: #bb0000;
    box-shadow: 0 4px 12px rgba(187, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const ActionContent = styled.div`
  flex: 1;
  
  .title {
    font-weight: 600;
    font-size: 16px;
    color: #1e293b;
    margin-bottom: 4px;
  }
  
  .description {
    font-size: 12px;
    color: #64748b;
  }
`;

const ActionIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #fef2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bb0000;
`;

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
      setLeader(parsedData);
      const leaderId = parsedData.leader_id || parsedData._id;
      fetchRallyCount(leaderId);
      fetchManifestoStatus(leaderId);
      fetchSupporterCount(leaderId);
    } catch (error) {
      console.error("Error parsing leader data:", error);
      navigate("/login-aspirant");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchRallyCount = async (leaderId) => {
    try {
      // Using centralized API - the interceptor handles response.data extraction
      const response = await api.get(`/rallies/leader/${leaderId}/count`);
      // api interceptor already returns response.data, so response is the data object
      if (response?.success) {
        setRallyCount(response.count || 0);
      } else {
        setRallyCount(0);
      }
    } catch (error) {
      console.error("Error fetching rally count:", error);
      setRallyCount(0);
    }
  };

  const fetchManifestoStatus = async (leaderId) => {
    try {
      // Using centralized API for manifestos
      const response = await api.get(`/leaders/manifestos/leader/${leaderId}`);
      if (response?.success && response?.data) {
        setManifestoStatus("completed");
      } else if (Array.isArray(response) && response.length > 0) {
        setManifestoStatus("completed");
      } else {
        setManifestoStatus("not_started");
      }
    } catch (error) {
      setManifestoStatus("not_started");
    }
  };

  const fetchSupporterCount = async (leaderId) => {
    try {
      // Using centralized API for endorsements
      const response = await api.get(`/endorsements/leader/${leaderId}/count`);
      if (response?.success) {
        setSupporterCount(response.count || 0);
      } else {
        setSupporterCount(0);
      }
    } catch (error) {
      console.error("Error fetching supporter count:", error);
      setSupporterCount(0);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("leaderToken");
      localStorage.removeItem("leaderData");
      localStorage.removeItem("token");
      navigate("/login-aspirant");
    }
  };

  const handleRallyCreated = () => {
    setRallyCount((prev) => prev + 1);
  };

  if (loading) {
    return <LoadingSpinner>Loading dashboard...</LoadingSpinner>;
  }

  if (!leader) {
    return <LoadingSpinner>No leader data found. Redirecting...</LoadingSpinner>;
  }

  const leaderId = leader.leader_id || leader._id;

  const renderContent = () => {
    switch (activeTab) {
      case "manifesto":
        return <CreateManifesto leaderId={leaderId} />;
      case "rally":
        return <CreateRally leaderId={leaderId} onRallyCreated={handleRallyCreated} />;
      case "supporters":
        return <SupportersSection leader={leader} />;
      case "analytics":
        return <AnalyticsSection leader={leader} />;
      case "account":
        return <AccountBillingSection leader={leader} />;
      case "settings":
        return <ProfileSettingsSection leader={leader} />;
      default:
        return <DashboardOverview leader={leader} />;
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "manifesto", label: "My Manifesto", icon: <FileText size={18} /> },
    { id: "rally", label: "Create Rally", icon: <MapPin size={18} />, badge: rallyCount },
    { id: "supporters", label: "Supporters", icon: <Users size={18} /> },
    { id: "analytics", label: "Analytics", icon: <TrendingUp size={18} /> },
    { id: "account", label: "Account & Billing", icon: <CreditCard size={18} /> },
    { id: "settings", label: "Profile Settings", icon: <Settings size={18} /> },
  ];

  const DashboardHome = () => (
    <>
      <StatsGrid>
        <StatCard>
          <StatInfo>
            <div className="value">{supporterCount.toLocaleString()}</div>
            <div className="label">Total Supporters</div>
          </StatInfo>
          <StatIcon $bg="#fef2f2" $color="#bb0000">
            <Users size={24} />
          </StatIcon>
        </StatCard>

        <StatCard>
          <StatInfo>
            <div className="value">{rallyCount}</div>
            <div className="label">Rallies Organized</div>
          </StatInfo>
          <StatIcon $bg="#eff6ff" $color="#3b82f6">
            <Calendar size={24} />
          </StatIcon>
        </StatCard>

        <StatCard>
          <StatInfo>
            <div className="value">{manifestoStatus === "completed" ? "Done" : "Pending"}</div>
            <div className="label">Manifesto Status</div>
          </StatInfo>
          <StatIcon $bg={manifestoStatus === "completed" ? "#dcfce7" : "#fef2f2"} $color={manifestoStatus === "completed" ? "#16a34a" : "#bb0000"}>
            <Target size={24} />
          </StatIcon>
        </StatCard>

        <StatCard>
          <StatInfo>
            <div className="value">{leader.party || "Independent"}</div>
            <div className="label">Political Party</div>
          </StatInfo>
          <StatIcon $bg="#f1f5f9" $color="#64748b">
            <ShieldCheck size={24} />
          </StatIcon>
        </StatCard>
      </StatsGrid>

      <ActionGrid>
        <ActionCard onClick={() => setActiveTab("manifesto")}>
          <ActionIcon>
            <FileText size={24} />
          </ActionIcon>
          <ActionContent>
            <div className="title">
              {manifestoStatus === "completed" ? "Update Manifesto" : "Create Manifesto"}
            </div>
            <div className="description">
              {manifestoStatus === "completed" 
                ? "Share your vision and campaign promises" 
                : "Tell voters what you stand for"}
            </div>
          </ActionContent>
        </ActionCard>

        <ActionCard onClick={() => setActiveTab("rally")}>
          <ActionIcon>
            <MapPin size={24} />
          </ActionIcon>
          <ActionContent>
            <div className="title">Create Rally</div>
            <div className="description">Organize a campaign rally or event</div>
          </ActionContent>
        </ActionCard>

        <ActionCard onClick={() => setActiveTab("supporters")}>
          <ActionIcon>
            <UserPlus size={24} />
          </ActionIcon>
          <ActionContent>
            <div className="title">Connect with Supporters</div>
            <div className="description">Engage with people who support you</div>
          </ActionContent>
        </ActionCard>
      </ActionGrid>
    </>
  );

  return (
    <DashboardWrapper>
      <SidebarOverlay isOpen={sidebarOpen} onClick={() => setSidebarOpen(false)} />

      <Sidebar isOpen={sidebarOpen}>
        <Logo>
          <ShieldCheck size={24} color="#bb0000" />
          <span>SiasaHub</span>
        </Logo>

        <NavSection>
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              active={activeTab === item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
            >
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && <RallyBadge>{item.badge}</RallyBadge>}
            </NavItem>
          ))}
        </NavSection>

        <NavItem onClick={handleLogout} style={{ marginTop: "auto", marginBottom: "20px" }}>
          <LogOut size={18} />
          <span>Logout</span>
        </NavItem>
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
            <img
              className="avatar"
              src={
                leader.image_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name || "Leader")}&background=1e3c72&color=fff&size=80`
              }
              alt="profile"
            />
          </UserInfo>
        </TopNav>

        <ContentBody>
          {activeTab === "dashboard" ? <DashboardHome /> : renderContent()}
        </ContentBody>
      </MainContent>
    </DashboardWrapper>
  );
};

export default AspirantDashboard;