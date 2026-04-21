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
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  color: #fff;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
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
  padding: 0 10px;
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
const DashboardHome = ({ leader, rallyCount, manifestoStatus, supporterCount }) => {
  const [loading, setLoading] = useState(true);
  const [competitors, setCompetitors] = useState([]);
  const [regionalData, setRegionalData] = useState({ strengths: [], weaknesses: [] });
  const [dailyTrend, setDailyTrend] = useState([]);
  const [insights, setInsights] = useState([]);
  const [overview, setOverview] = useState({ engagement_score: 0, growth_rate: 0 });

  const leaderId = leader?.leader_id || leader?.id;

  // Fetch competitors and regional performance
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!leaderId) return;
      setLoading(true);
      try {
        // 1. Competitors (same position, same region)
        const pos = leader.vying_for || leader.position || "";
        const county = leader.county || "";
        const constituency = leader.constituency || "";

        const compRes = await api.get("/leaders", {
          params: { limit: 100, position: pos, county, constituency }
        });
        let allLeaders = [];
        if (compRes?.success && compRes?.data) {
          if (Array.isArray(compRes.data)) {
            compRes.data.forEach(group => {
              if (group.leaders) allLeaders.push(...group.leaders);
            });
          } else if (compRes.data.leaders) {
            allLeaders = compRes.data.leaders;
          }
        }
        // Filter self and take top 5 by endorsement_count
        const filtered = allLeaders
          .filter(l => l.leader_id !== leaderId)
          .sort((a, b) => (b.endorsement_count || 0) - (a.endorsement_count || 0))
          .slice(0, 5);
        setCompetitors(filtered);

        // 2. Regional performance (use top_regions from analytics)
        const analyticsRes = await api.get(`/leaders/analytics/dashboard`, {
          params: { leader_id: leaderId }
        });

        if (analyticsRes?.success && analyticsRes?.data) {
          const data = analyticsRes.data;

          setOverview({
            engagement_score: data.overview?.engagement_score || 0,
            growth_rate: data.overview?.growth_rate || 0,
            regional_rank: data.overview?.regional_rank || 1,
            global_rank: data.overview?.rank || 1,
          });

          // Strengths from top_regions
          if (data.top_regions && Array.isArray(data.top_regions)) {
            const strengths = data.top_regions.slice(0, 2).map(r => ({
              name: r.county,
              support: Math.min(100, Math.round((r.count / (data.overview?.total_views || 1)) * 100 * 5)),
              count: r.count
            }));

            const weaknesses = [
              { name: "Neighboring Counties", support: 15 },
              { name: "Urban Youth", support: 22 }
            ];
            setRegionalData({ strengths, weaknesses });
          }

          // Daily trend (Daily Reach)
          if (data.daily_reach && Array.isArray(data.daily_reach)) {
            const formatted = data.daily_reach.slice(-7).map(day => ({
              date: new Date(day.date).toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
              views: day.views || 0,
              shares: data.daily_shares?.find(s => s.date === day.date)?.shares || 0,
            }));
            setDailyTrend(formatted);
          }
        }

        // 4. Generate AI Insights based on real metrics
        const newInsights = [];
        if (regionalData.strengths.length > 0) {
          newInsights.push({
            type: "success",
            title: `Dominance in ${regionalData.strengths[0].name}`,
            description: `You have ${regionalData.strengths[0].count} active impressions here. Deepen engagement with a town hall.`
          });
        }

        if (overview.regional_rank > 3) {
          newInsights.push({
            type: "warning",
            title: `Ranked #${overview.regional_rank} in your region`,
            description: `You are losing the digital race. Competitors are sharing more content. Increase your post frequency.`
          });
        }

        if (competitors.length > 0 && (competitors[0].endorsement_count || 0) > (supporterCount || 0)) {
          newInsights.push({
            type: "warning",
            title: `${competitors[0].name} has more supporters`,
            description: `Gap: ${(competitors[0].endorsement_count || 0) - (supporterCount || 0)} endorsements. Target ${leader.constituency || "your constituency"} with a loyalty campaign.`
          });
        }

        if (overview.engagement_score > 70) {
          newInsights.push({
            type: "success",
            title: "Viral Engagement Detected",
            description: `Your profile score of ${overview.engagement_score} is in the top 5% of aspirants. Convert this to physical rallies.`
          });
        }
        setInsights(newInsights);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [leaderId, supporterCount, competitors.length]);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "60px" }}>Loading insights...</div>;
  }

  return (
    <>
      {/* Key Metrics */}
      <StatsGrid>
        <StatCard>
          <StatInfo>
            <div className="value">{supporterCount.toLocaleString()}</div>
            <div className="label">Total Supporters</div>
          </StatInfo>
          <StatIcon $bg="#fef2f2" $color="#bb0000"><Users size={24} /></StatIcon>
        </StatCard>
        <StatCard>
          <StatInfo>
            <div className="value">{rallyCount}</div>
            <div className="label">Rallies Organized</div>
          </StatInfo>
          <StatIcon $bg="#eff6ff" $color="#3b82f6"><Calendar size={24} /></StatIcon>
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
          <StatIcon $bg="#f1f5f9" $color="#64748b"><ShieldCheck size={24} /></StatIcon>
        </StatCard>
      </StatsGrid>

      {/* Engagement Score & Growth */}
      <TwoColumnGrid>
        <SectionCard>
          <SectionHeader>
            <h3><Award size={18} /> Engagement Score</h3>
            <Badge $bg={overview.engagement_score > 70 ? "#dcfce7" : "#fed7aa"} $color={overview.engagement_score > 70 ? "#166534" : "#9a3412"}>
              {overview.engagement_score > 70 ? "Excellent" : overview.engagement_score > 40 ? "Good" : "Needs Work"}
            </Badge>
          </SectionHeader>
          <div style={{ padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "56px", fontWeight: 800, color: "#0f172a" }}>{overview.engagement_score || 0}</div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: 8 }}>out of 100</div>
            <div style={{ marginTop: 16 }}>
              <TrendingUp size={16} color="#10b981" style={{ display: "inline", marginRight: 4 }} />
              <span style={{ fontWeight: 600, color: "#10b981" }}>{overview.growth_rate || 0}% growth</span> this week
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHeader>
            <h3><Eye size={18} /> Daily Reach</h3>
          </SectionHeader>
          <TrendChart>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#1e3c72" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="shares" stroke="#e11d48" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </TrendChart>
        </SectionCard>
      </TwoColumnGrid>

      {/* Competitors Section */}
      <SectionCard>
        <SectionHeader>
          <h3><Users size={18} /> Top Competitors</h3>
          <Badge>Based on supporters</Badge>
        </SectionHeader>
        {competitors.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>No competitors found in your area</div>
        ) : (
          <CompetitorGrid>
            {competitors.map(comp => {
              const diff = (comp.endorsement_count || 0) - (supporterCount || 0);
              const isAhead = diff > 0;
              return (
                <CompetitorCard key={comp.leader_id} isAhead={isAhead}>
                  <img
                    className="avatar"
                    src={comp.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comp.name)}&background=1e3c72&color=fff`}
                    alt={comp.name}
                  />
                  <div className="info">
                    <div className="name">{comp.name}</div>
                    <div className="party">{comp.party}</div>
                    <div className="stats">
                      <span><Users size={12} /> {comp.endorsement_count?.toLocaleString() || 0}</span>
                      <span><TrendingUp size={12} /> {comp.trending_score || 0}%</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="gap">
                      {isAhead ? <TrendingUp size={14} style={{ marginRight: 4 }} /> : <ArrowDown size={14} style={{ marginRight: 4 }} />}
                      {Math.abs(diff).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 10, color: isAhead ? "#10b981" : "#ef4444", fontWeight: 600 }}>
                      {isAhead ? "AHEAD" : "BEHIND"}
                    </div>
                  </div>
                </CompetitorCard>
              );
            })}
          </CompetitorGrid>
        )}
      </SectionCard>

      {/* Regional Performance (Strengths & Weaknesses) */}
      <TwoColumnGrid>
        <SectionCard>
          <SectionHeader>
            <h3><ArrowUp size={18} color="#10b981" /> Campaign Strongholds</h3>
          </SectionHeader>
          <div style={{ padding: "20px" }}>
            {regionalData.strengths.map(area => (
              <div key={area.name} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{area.name}</span>
                  <span style={{ fontWeight: 700, color: "#10b981" }}>{area.support}% Dominance</span>
                </div>
                <div style={{ height: 10, background: "#dcfce7", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ width: `${area.support}%`, height: "100%", background: "linear-gradient(90deg, #10b981, #34d399)", borderRadius: 5 }} />
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                  High loyalty area. {area.count} active supporters detected this week.
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard>
          <SectionHeader>
            <h3><ArrowDown size={18} color="#ef4444" /> Opportunities for Growth</h3>
          </SectionHeader>
          <div style={{ padding: "20px" }}>
            {regionalData.weaknesses.map(area => (
              <div key={area.name} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{area.name} Market</span>
                  <span style={{ fontWeight: 700, color: "#ef4444" }}>{area.support}% coverage</span>
                </div>
                <div style={{ height: 10, background: "#fee2e2", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ width: `${area.support}%`, height: "100%", background: "linear-gradient(90deg, #ef4444, #f87171)", borderRadius: 5 }} />
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                  Low engagement. Competitors are 40% more active here.
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </TwoColumnGrid>

      {/* Actionable Insights */}
      {insights.length > 0 && (
        <SectionCard>
          <SectionHeader>
            <h3><AlertCircle size={18} /> AI Insights & Recommendations</h3>
          </SectionHeader>
          <InsightList>
            {insights.map((insight, idx) => (
              <InsightItem key={idx} type={insight.type}>
                {insight.type === "warning" ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                <div className="content">
                  <div className="title">{insight.title}</div>
                  <div className="description">{insight.description}</div>
                </div>
              </InsightItem>
            ))}
          </InsightList>
        </SectionCard>
      )}
    </>
  );
};

// ==================== Main Component ====================
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

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("leaderToken");
      localStorage.removeItem("leaderData");
      localStorage.removeItem("token");
      navigate("/login-aspirant");
    }
  };

  const handleRallyCreated = () => setRallyCount(prev => prev + 1);

  if (loading) return <LoadingSpinner>Loading dashboard...</LoadingSpinner>;
  if (!leader) return <LoadingSpinner>No leader data found. Redirecting...</LoadingSpinner>;

  const leaderId = leader.leader_id || leader._id;

  const renderContent = () => {
    switch (activeTab) {
      case "manifesto": return <CreateManifesto leaderId={leaderId} />;
      case "rally": return <CreateRally leaderId={leaderId} onRallyCreated={handleRallyCreated} />;
      case "supporters": return <SupportersSection leader={leader} />;
      case "analytics": return <AnalyticsSection leader={leader} />;
      case "account": return <AccountBillingSection leader={leader} />;
      case "settings": return <ProfileSettingsSection leader={leader} />;
      default: return (
        <DashboardHome
          leader={leader}
          rallyCount={rallyCount}
          manifestoStatus={manifestoStatus}
          supporterCount={supporterCount}
        />
      );
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

  return (
    <DashboardWrapper>
      <GlobalStyle />
      <SidebarOverlay isOpen={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      <Sidebar isOpen={sidebarOpen}>
        <Logo><ShieldCheck size={24} color="#bb0000" /><span>SiasaHub</span></Logo>
        <NavSection>
          {navItems.map(item => (
            <NavItem key={item.id} active={activeTab === item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}>
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && <RallyBadge>{item.badge}</RallyBadge>}
            </NavItem>
          ))}
        </NavSection>
        <NavItem onClick={handleLogout} style={{ marginTop: "auto", marginBottom: "20px" }}>
          <LogOut size={18} /><span>Logout</span>
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