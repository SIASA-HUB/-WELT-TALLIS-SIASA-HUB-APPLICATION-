// DashboardOverview.jsx - Real Backend Data with Modern Design
import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import {
  Users,
  TrendingUp,
  MessageSquare,
  Eye,
  Heart,
  Sparkles,
  Crown,
  Target,
  Clock,
  Zap,
  Award,
  Flame,
  ShieldCheck,
  ChevronRight,
  Activity,
} from "lucide-react";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import CompetitorsSection from "./CompetitorsSection";

const COLORS = ["#1e3c72", "#10b981", "#ea580c", "#dc2626", "#6366f1"];

const LEADER_API_URL = "http://localhost:8006/api/v1";
const ENDORSEMENT_API_URL = "http://localhost:8003/api/v1";
// Note: If you see double /api/v1 in logs, ensure axios baseURL isn't also adding it.

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(30, 60, 114, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(30, 60, 114, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(30, 60, 114, 0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

// Styled Components
const Container = styled.div`
  animation: ${fadeInUp} 0.4s ease-out;
`;

const WelcomeBanner = styled.div`
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  padding: 32px;
  border-radius: 24px;
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 50%;
  }

  .text {
    position: relative;
    z-index: 2;

    h1 {
      font-size: 28px;
      margin: 0;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    p {
      margin-top: 8px;
      opacity: 0.9;
      font-size: 14px;
    }
  }

  .emoji {
    font-size: 64px;
    position: relative;
    z-index: 2;
    animation: ${pulseGlow} 2s infinite;
  }

  @media (max-width: 600px) {
    padding: 24px;
    .text h1 {
      font-size: 20px;
    }
    .emoji {
      font-size: 48px;
    }
  }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .stat-value {
    font-size: 32px;
    font-weight: 800;
    color: #1a1a2e;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
  }

  .stat-trend {
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 20px;
    background: ${(props) => (props.$trend === "up" ? "#d4edda" : "#fee2e2")};
    color: ${(props) => (props.$trend === "up" ? "#155724" : "#991b1b")};
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const MainContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 24px;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const ActivityCard = styled.div`
  background: white;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #eef2f6;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #1a1a2e;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .badge {
    background: #f0f4ff;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: #1e3c72;
  }
`;

const EndorsementList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const EndorsementItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f2f5;
  transition: background 0.2s;

  &:hover {
    background: #fafbfc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const EndorsementAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2px;
`;

const EndorsementContent = styled.div`
  flex: 1;

  .user {
    font-weight: 700;
    font-size: 14px;
    color: #1a1a2e;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .message {
    font-size: 13px;
    color: #475569;
    margin-top: 4px;
    line-height: 1.4;
  }

  .time {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const EndorsementAmount = styled.div`
  text-align: right;
  min-width: 80px;

  .amount {
    font-weight: 800;
    font-size: 16px;
    color: ${(props) => (props.$isFree ? "#10b981" : "#ea580c")};
  }

  .type {
    font-size: 10px;
    color: #94a3b8;
    margin-top: 2px;
  }
`;

const StatsSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 20px 24px;
  background: #fafbfc;
  border-bottom: 1px solid #eef2f6;

  .summary-item {
    text-align: center;

    .value {
      font-size: 24px;
      font-weight: 800;
      color: #1e3c72;
    }

    .label {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 24px;

  svg {
    opacity: 0.3;
    margin-bottom: 16px;
  }

  p {
    color: #94a3b8;
    margin: 0;
  }
`;

const LoadingCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;

  .shimmer {
    background: linear-gradient(90deg, #f0f4ff 25%, #e8edf5 50%, #f0f4ff 75%);
    background-size: 1000px 100%;
    animation: ${shimmer} 2s infinite;
    border-radius: 12px;
    height: 80px;
    margin-bottom: 16px;
  }
`;

const DashboardOverview = ({ leader }) => {
  const [stats, setStats] = useState({
    endorsement_count: 0,
    unique_supporters: 0,
    total_likes: 0,
    total_comments: 0,
    total_boosts: 0,
    total_shares: 0,
    manifestos_count: 0,
    free_endorsements: 0,
    paid_endorsements: 0,
  });
  const [recentEndorsements, setRecentEndorsements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileViews, setProfileViews] = useState(0);
  const [trendingScore, setTrendingScore] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState(false);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [trialActive, setTrialActive] = useState(false);
  const [demographics, setDemographics] = useState({ gender: {}, generations: {} });
  const [wardReach, setWardReach] = useState([]);
  const [growthRate, setGrowthRate] = useState(0);

  const fetchDashboardData = useCallback(async () => {
    if (!leader?.leader_id) return;

    setLoading(true);
    try {
      // 1. Fetch from the NEW unified analytics endpoint
      const dashboardRes = await axios.get(`${LEADER_API_URL}/leaders/analytics/dashboard`, {
        params: { leader_id: leader.leader_id }
      });

      if (dashboardRes.data.success) {
        const d = dashboardRes.data.data;
        setProfileViews(d.overview.reach || 0);
        setStats(prev => ({
          ...prev,
          endorsement_count: d.overview.endorsements || 0,
          unique_supporters: d.overview.followers || 0,
          total_shares: d.overview.shares || 0,
        }));
        setAnalyticsData(d.daily_reach || []);
        setTrialActive(d.overview.trial_active);
        setVerificationStatus(d.overview.is_verified);
        setDemographics(d.demographics || { gender: {}, generations: {} });
        setWardReach(d.ward_reach || []);
        setGrowthRate(d.overview.growth_rate || 0);
      }

      // 2. Fetch recent endorsements (KEEPING EXISTING)
      const endorsementsRes = await axios.get(
        `${ENDORSEMENT_API_URL}/endorsements/leader/${leader.leader_id}/recent?limit=10`,
      );

      if (endorsementsRes.data.success) {
        setRecentEndorsements(endorsementsRes.data.data || []);
      }

    } catch (error) {
      console.error("❌ Dashboard data error:", error);
    } finally {
      setLoading(false);
    }
  }, [leader?.leader_id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getAvatarUrl = (item) => {
    if (item?.image_url) {
      return item.image_url.startsWith("http")
        ? item.image_url
        : `${ENDORSEMENT_API_URL}${item.image_url}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      item?.user_name || "Supporter",
    )}&background=1e3c72&color=fff&size=80&bold=true`;
  };

  const totalEngagement =
    stats.total_likes + stats.total_comments + stats.total_boosts + stats.total_shares;
  const engagementRate =
    stats.unique_supporters > 0
      ? ((totalEngagement / stats.unique_supporters) * 100).toFixed(1)
      : 0;

  if (loading) {
    return (
      <Container>
        <LoadingCard>
          <div className="shimmer" style={{ height: "120px" }} />
          <div className="shimmer" style={{ height: "80px" }} />
          <div className="shimmer" style={{ height: "80px" }} />
        </LoadingCard>
      </Container>
    );
  }

  return (
    <Container>
      <WelcomeBanner>
        <div className="text">
          <h1>
            Welcome back, {leader?.name?.split(" ")[0] || "Leader"}!
            {verificationStatus && (
              <ShieldCheck
                size={20}
                style={{
                  display: "inline",
                  marginLeft: "8px",
                  color: "#ffd700",
                }}
              />
            )}
          </h1>
          <p>
            Managing campaign for <strong>{leader?.position}</strong> •{" "}
            {leader?.county || leader?.constituency || "Kenya"}
          </p>
        </div>
        <div className="emoji">{verificationStatus ? "⭐" : "🇰🇪"}</div>
      </WelcomeBanner>

      <StatGrid>
        <StatCard $trend="up">
          <div className="stat-icon" style={{ background: "#e8f0fe" }}>
            <Users size={24} color="#1e3c72" />
          </div>
          <div className="stat-value">
            {stats.unique_supporters.toLocaleString() || 0}
          </div>
          <div className="stat-label">Unique Supporters</div>
          <div className="stat-trend">
            <TrendingUp size={12} />+{stats.endorsement_count || 0} total
          </div>
        </StatCard>

        <StatCard>
          <div className="stat-icon" style={{ background: "#e6f7e6" }}>
            <Eye size={24} color="#16a34a" />
          </div>
          <div className="stat-value">{profileViews.toLocaleString() || 0}</div>
          <div className="stat-label">Profile Views</div>
        </StatCard>

        <StatCard $trend="up">
          <div className="stat-icon" style={{ background: "#fff3e0" }}>
            <Heart size={24} color="#ea580c" />
          </div>
          <div className="stat-value">
            {totalEngagement.toLocaleString() || 0}
          </div>
          <div className="stat-label">Total Engagement</div>
          <div className="stat-trend">
            <Zap size={12} />
            {engagementRate}% rate
          </div>
        </StatCard>

        <StatCard>
          <div className="stat-icon" style={{ background: "#fce4ec" }}>
            <Flame size={24} color="#dc2626" />
          </div>
          <div className="stat-value">
            {trendingScore.toLocaleString() || 0}
          </div>
          <div className="stat-label">Trending Score</div>
        </StatCard>
      </StatGrid>

      <MainContentGrid>
        {/* Campaign Analytics Chart */}
        <ActivityCard style={{ gridColumn: "1 / -1" }}>
          <CardHeader>
            <h3>
              <TrendingUp size={18} />
              Daily Reach (Views & Shares)
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {growthRate !== 0 && (
                <div className="badge" style={{ background: growthRate > 0 ? '#dcfce7' : '#fee2e2', color: growthRate > 0 ? '#166534' : '#991b1b' }}>
                  {growthRate > 0 ? '+' : ''}{growthRate}% Growth
                </div>
              )}
              {trialActive && <div className="badge">Trial Active</div>}
            </div>
          </CardHeader>
          <div style={{ padding: "24px", height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3c72" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1e3c72" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickFormatter={(str) => {
                    const d = new Date(str);
                    return d.toLocaleDateString("en-US", { weekday: "short" });
                  }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#1e3c72" 
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                  strokeWidth={3}
                />
                <Area 
                  type="monotone" 
                  dataKey="shares" 
                  stroke="#10b981" 
                  fillOpacity={0.1} 
                  fill="#10b981" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ActivityCard>

        {/* Demographics & Reach Section */}
        <ActivityCard>
          <CardHeader>
            <h3><Users size={18} /> Audience Demographics</h3>
          </CardHeader>
          <div style={{ padding: "24px", display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ height: '200px' }}>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>Gender Distribution</p>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(demographics.gender).map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {Object.entries(demographics.gender).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div style={{ height: '200px' }}>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>Generational Reach</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(demographics.generations).map(([name, value]) => ({ name, value }))}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {Object.entries(demographics.generations).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ActivityCard>

        <ActivityCard>
          <CardHeader>
            <h3><Target size={18} /> Top Performing Wards</h3>
          </CardHeader>
          <div style={{ padding: "0 24px 24px 24px" }}>
            {wardReach.length === 0 ? (
              <EmptyState style={{ padding: '40px 0' }}>
                <Activity size={24} />
                <p>No location data yet</p>
              </EmptyState>
            ) : (
              wardReach.map((ward, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '16px 0',
                  borderBottom: i === wardReach.length - 1 ? 'none' : '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '8px', 
                      background: '#f8fafc', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#1e3c72'
                    }}>#{i + 1}</div>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{ward.ward}</span>
                  </div>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{ward.count} views</span>
                </div>
              ))
            )}
          </div>
        </ActivityCard>

        {/* Recent Activity */}
        <ActivityCard>
          <CardHeader>
            <h3>
              <Activity size={18} />
              Recent Supporters
            </h3>
            <div className="badge">Live</div>
          </CardHeader>

          <StatsSummary>
            <div className="summary-item">
              <div className="value">{stats.free_endorsements || 0}</div>
              <div className="label">Free Support</div>
            </div>
            <div className="summary-item">
              <div className="value">{stats.total_shares || 0}</div>
              <div className="label">Shares</div>
            </div>
            <div className="summary-item">
              <div className="value">{stats.manifestos_count || 0}</div>
              <div className="label">Manifestos</div>
            </div>
          </StatsSummary>

          {recentEndorsements.length === 0 ? (
            <EmptyState>
              <MessageSquare size={48} />
              <p>No supporter activity yet</p>
              <p style={{ fontSize: "12px", marginTop: "8px" }}>
                Share your campaign to get started
              </p>
            </EmptyState>
          ) : (
            <EndorsementList>
              {recentEndorsements.map((endorsement) => {
                const isFree = parseInt(endorsement.amount || 0) === 0;
                return (
                  <EndorsementItem key={endorsement.id}>
                    <EndorsementAvatar
                      src={getAvatarUrl(endorsement)}
                      alt={endorsement.user_name}
                    />
                    <EndorsementContent>
                      <div className="user">
                        {endorsement.user_name || "Anonymous Supporter"}
                        {isFree && <Award size={12} color="#10b981" />}
                      </div>
                      <div className="message">
                        {endorsement.phrase ||
                          endorsement.message?.substring(0, 80) ||
                          "Showing support"}
                      </div>
                      <div className="time">
                        <Clock size={10} />
                        {formatDate(endorsement.created_at)}
                      </div>
                    </EndorsementContent>
                    <EndorsementAmount $isFree={isFree}>
                      <div className="amount">
                        {isFree ? "FREE" : `KES ${endorsement.amount}`}
                      </div>
                      <div className="type">{isFree ? "Free" : "Paid"}</div>
                    </EndorsementAmount>
                  </EndorsementItem>
                );
              })}
            </EndorsementList>
          )}
        </ActivityCard>

        {/* Quick Stats & Insights */}
        <ActivityCard>
          <CardHeader>
            <h3>
              <Sparkles size={18} />
              Campaign Insights
            </h3>
          </CardHeader>

          <div style={{ padding: "24px" }}>
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Engagement Rate
                </span>
                <span style={{ fontWeight: 700, color: "#1e3c72" }}>
                  {engagementRate}%
                </span>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "#eef2f6",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(engagementRate, 100)}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #1e3c72, #2a5298)",
                    borderRadius: "4px",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "#1e3c72",
                  }}
                >
                  {stats.endorsement_count || 0}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  Total Endorsements
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "#1e3c72",
                  }}
                >
                  {stats.total_likes || 0}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  Total Likes
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#f0f4ff",
                borderRadius: "16px",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <Target size={20} color="#1e3c72" />
                <span style={{ fontWeight: 700, color: "#1e3c72" }}>
                  Next Milestone
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
                {stats.unique_supporters < 100
                  ? `${100 - stats.unique_supporters} more supporters needed to reach 100!`
                  : stats.unique_supporters < 500
                    ? `${500 - stats.unique_supporters} more supporters to reach 500!`
                    : "You're crushing it! Keep up the momentum!"}
              </p>
            </div>

            {stats.total_boosts > 0 && (
              <div
                style={{
                  background: "#fef3c7",
                  borderRadius: "16px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <Zap size={20} color="#d97706" />
                  <span style={{ fontWeight: 700, color: "#92400e" }}>
                    Boosted Campaign
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "#78350f" }}>
                  Your campaign has been boosted {stats.total_boosts} times!
                  This increases visibility by 5x.
                </p>
              </div>
            )}
          </div>
        </ActivityCard>

        <div style={{ gridColumn: "1 / -1", marginTop: "24px" }}>
          <CompetitorsSection leader={leader} />
        </div>
      </MainContentGrid>
    </Container>
  );
};

export default DashboardOverview;
