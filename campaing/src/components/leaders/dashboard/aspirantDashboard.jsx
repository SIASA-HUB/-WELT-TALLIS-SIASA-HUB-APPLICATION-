import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Bell,
  Menu,
  X,
  FileText,
  CreditCard,
  CheckCircle,
  Wallet,
  BarChart3,
  UserCheck,
  Calendar,
  Megaphone,
} from "lucide-react";
import axios from "axios";

import CreateManifesto from "../manifestos/createManifesto";
import CreateRally from "../../rallies/createRally";
import DashboardOverview from "./DashboardOverview";
import SupportersSection from "./SuportersSection";
import AnalyticsSection from "./AnalyticsSection";
import AccountBillingSection from "./AccountBilling";
import ProfileSettingsSection from "./ProfileSetting";

// --- Styled Components ---
const DashboardWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f4f7fe;
  font-family: "Inter", sans-serif;
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
  background: linear-gradient(180deg, #1e3c72 0%, #0f2b4f 100%);
  color: white;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    position: fixed;
    left: ${(props) => (props.isOpen ? "0" : "-280px")};
  }
`;

const Logo = styled.div`
  padding: 24px;
  font-size: 20px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  letter-spacing: -0.5px;
`;

const NavSection = styled.div`
  margin-top: 20px;
  flex: 1;
`;

const NavItem = styled.div`
  padding: 12px 24px;
  margin: 4px 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: ${(props) => (props.active ? "white" : "rgba(255, 255, 255, 0.7)")};
  background: ${(props) =>
    props.active ? "rgba(255, 255, 255, 0.15)" : "transparent"};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
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
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 80;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
`;

const MenuButton = styled.button`
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 10px;
  transition: background 0.2s;

  &:hover {
    background: #f0f2f5;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  .text {
    text-align: right;

    .name {
      font-weight: 800;
      font-size: 14px;
      color: #1a1a2e;
    }

    .party {
      font-size: 12px;
      color: #64748b;
    }
  }

  .avatar {
    width: 45px;
    height: 45px;
    border-radius: 12px;
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
  font-size: 16px;
  color: #1e3c72;
`;

const RallyBadge = styled.div`
  background: linear-gradient(135deg, #10b981, #059669);
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  color: white;
  margin-left: 8px;
`;

const AspirantDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [leader, setLeader] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rallyCount, setRallyCount] = useState(0);

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
      fetchRallyCount(parsedData.leader_id || parsedData._id);
    } catch (error) {
      console.error("Error parsing leader data:", error);
      navigate("/login-aspirant");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchRallyCount = async (leaderId) => {
    try {
      const response = await axios.get(
        `http://localhost:8002/api/v1/rallies/leader/${leaderId}/count`,
      );
      if (response.data?.success) {
        setRallyCount(response.data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching rally count:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("leaderToken");
    localStorage.removeItem("leaderData");
    navigate("/login-aspirant");
  };

  const handleRallyCreated = () => {
    setRallyCount((prev) => prev + 1);
  };

  if (loading) {
    return <LoadingSpinner>Loading dashboard...</LoadingSpinner>;
  }

  if (!leader) {
    return (
      <LoadingSpinner>No leader data found. Redirecting...</LoadingSpinner>
    );
  }

  const leaderId = leader.leader_id || leader._id;

  const renderContent = () => {
    switch (activeTab) {
      case "manifesto":
        return <CreateManifesto leaderId={leaderId} />;
      case "rally":
        return (
          <CreateRally
            leaderId={leaderId}
            onRallyCreated={handleRallyCreated}
          />
        );
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
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { id: "manifesto", label: "My Manifesto", icon: <FileText size={20} /> },
    {
      id: "rally",
      label: "Create Rally",
      icon: <MapPin size={20} />,
      badge: rallyCount > 0 ? rallyCount : null,
      badgeColor: "#10b981",
    },
    { id: "supporters", label: "Supporters", icon: <Users size={20} /> },
    { id: "analytics", label: "Analytics", icon: <TrendingUp size={20} /> },
    {
      id: "account",
      label: "Account & Billing",
      icon: <CreditCard size={20} />,
    },
    { id: "settings", label: "Profile Settings", icon: <Settings size={20} /> },
  ];

  return (
    <DashboardWrapper>
      <SidebarOverlay
        isOpen={sidebarOpen}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar isOpen={sidebarOpen}>
        <Logo>
          <ShieldCheck size={28} color="#3b82f6" />
          <span>
            Siasa<span style={{ color: "#3b82f6" }}>Hub</span>
          </span>
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
              {item.badge && (
                <RallyBadge style={{ background: item.badgeColor }}>
                  {item.badge}
                </RallyBadge>
              )}
            </NavItem>
          ))}
        </NavSection>

        <NavItem
          onClick={handleLogout}
          style={{ margin: "12px", color: "#fda4af" }}
        >
          <LogOut size={20} /> Logout
        </NavItem>
      </Sidebar>

      <MainContent>
        <TopNav>
          <MenuButton onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
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

        <ContentBody>{renderContent()}</ContentBody>
      </MainContent>
    </DashboardWrapper>
  );
};

export default AspirantDashboard;
