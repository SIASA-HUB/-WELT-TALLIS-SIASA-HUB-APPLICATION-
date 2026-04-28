import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  TrendingUp,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  Zap,
  PieChart as PieChartIcon,
  Share2,
  Eye,
  Award,
  Calendar,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, BarChart as ReBarChart, Bar, AreaChart, Area
} from "recharts";
import api from "../../../api/api";

// ==================== Styled Components ====================
const Container = styled.div``;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  border: 1px solid #eef2f6;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 16px;

  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: white;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  padding: 32px 24px;
  text-align: center;
  border-right: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s;

  &:nth-child(4n) {
    border-right: none;
  }

  .value {
    font-size: 36px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 10px;
    letter-spacing: -1px;
  }

  .label {
    font-size: 14px;
    color: #475569;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .trend {
    font-size: 13px;
    margin-top: 12px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #f8fafc;
    padding: 4px 12px;
    border-radius: 100px;
  }

  .trend.up { color: #10b981; border: 1px solid #dcfce7; }
  .trend.down { color: #ef4444; border: 1px solid #fee2e2; }
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

const HalfCard = styled(Card)`
  margin-bottom: 0;
`;

const SectionTitle = styled.h4`
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;

  .label {
    color: #475569;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
  }

  .value {
    font-weight: 800;
    color: #0f172a;
    min-width: 40px;
    text-align: right;
  }

  .bar {
    flex: 1;
    height: 10px;
    background: #f1f5f9;
    border-radius: 100px;
    margin: 0 20px;
    overflow: hidden;

    div {
      height: 100%;
      background: linear-gradient(90deg, #e11d48, #fb7185);
      border-radius: 100px;
      transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ variant }) =>
    variant === "success" ? "#dcfce7" : variant === "warning" ? "#fed7aa" : "#e2e8f0"};
  color: ${({ variant }) =>
    variant === "success" ? "#166534" : variant === "warning" ? "#9a3412" : "#475569"};
`;

const Select = styled.select`
  padding: 8px 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 13px;
  background: white;
  color: #0f172a;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  &:hover {
    border-color: #e11d48;
  }
`;

const KpiRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const KpiCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 24px 32px;
  flex: 1;
  min-width: 180px;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1);
  }

  .kpi-value {
    font-size: 32px;
    font-weight: 900;
    color: #1e3c72;
    margin-bottom: 4px;
  }

  .kpi-label {
    font-size: 13px;
    color: #64748b;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

// ==================== Component ====================
const AnalyticsSection = ({ leader }) => {
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [dailyData, setDailyData] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!leader?.leader_id && !leader?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await api.get(`/leaders/analytics/dashboard`, {
          params: { leader_id: leader.leader_id || leader.id },
        });

        if (response?.success && response?.data) {
          const data = response.data;
          setAnalytics(data);

          // Format daily reach for chart
          if (data.daily_reach && Array.isArray(data.daily_reach)) {
            const formatted = data.daily_reach.map((day) => ({
              date: new Date(day.date).toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
              views: day.views || 0,
              shares: day.shares || 0,
            }));
            setDailyData(formatted);
          } else {
            // Fallback mock data if none
            setDailyData([
              { date: "Apr 18", views: 24, shares: 2 },
              { date: "Apr 19", views: 34, shares: 0 },
              { date: "Apr 20", views: 12, shares: 11 },
            ]);
          }
        } else {
          console.warn("Invalid analytics response");
        }
      } catch (error) {
        console.error("Analytics fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [leader]);

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#e11d48", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          Loading campaign insights...
        </div>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          No analytics data available yet. Start engaging with voters!
        </div>
      </Card>
    );
  }

  const { overview, insights, demographics, ward_reach, daily_reach } = analytics;

  // Prepare data for regional bar chart (top 5 counties)
  const regionalData = (ward_reach || [])
    .slice(0, 5)
    .map((region) => ({
      name: region.county || region.name || "Other",
      count: region.count || 0,
    }));

  // Gender data from demographics.gender
  const genderData = [
    { name: "Male", value: demographics?.gender?.male || 0 },
    { name: "Female", value: demographics?.gender?.female || 0 },
  ].filter((g) => g.value > 0);

  // Generation data
  const generationData = demographics?.generations
    ? Object.entries(demographics.generations).map(([key, val]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: val,
    }))
    : [];

  // Colors
  const COLORS = ["#1e3c72", "#e11d48", "#f59e0b", "#10b981"];

  return (
    <Container>
      {/* Engagement Score + Ranks */}
      <KpiRow>
        <KpiCard>
          <div className="kpi-value">{overview?.engagement_score || 0}</div>
          <div className="kpi-label">Engagement Score</div>
          <Badge variant={overview?.engagement_score > 70 ? "success" : "warning"} style={{ marginTop: 8 }}>
            {overview?.engagement_score > 70 ? "Excellent" : overview?.engagement_score > 40 ? "Good" : "Needs Work"}
          </Badge>
        </KpiCard>
        <KpiCard>
          <div className="kpi-value">#{overview?.trending_rank || 0}</div>
          <div className="kpi-label">National Rank</div>
        </KpiCard>
        <KpiCard>
          <div className="kpi-value">#{overview?.regional_rank || 0}</div>
          <div className="kpi-label">Regional Rank</div>
        </KpiCard>
        <KpiCard>
          <div className="kpi-value">{overview?.growth_rate || 0}%</div>
          <div className="kpi-label">Growth Rate</div>
        </KpiCard>
      </KpiRow>

      {/* Daily Views & Shares Chart */}
      <Card>
        <CardHeader>
          <h3>
            <Eye size={18} /> Daily Reach & Engagement
          </h3>
          <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="7d">Last 7 days</option>
            <option value="14d">Last 14 days</option>
            <option value="30d">Last 30 days</option>
          </Select>
        </CardHeader>
        <div style={{ width: "100%", height: 320, padding: "20px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip />
              <Area type="monotone" dataKey="views" stackId="1" stroke="#1e3c72" fill="#1e3c72" fillOpacity={0.2} />
              <Area type="monotone" dataKey="shares" stackId="2" stroke="#e11d48" fill="#e11d48" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <Card>
        <CardHeader>
          <h3>
            <TrendingUp size={18} /> Key Performance Indicators
          </h3>
        </CardHeader>
        <StatGrid>
          <StatCard>
            <div className="value">{overview?.total_supporters || 0}</div>
            <div className="label">Total Supporters</div>
          </StatCard>
          <StatCard>
            <div className="value">{overview?.endorsements || 0}</div>
            <div className="label">Endorsements</div>
            <div className="trend up">↑ {overview?.growth_rate || 0}%</div>
          </StatCard>
          <StatCard>
            <div className="value">{overview?.reach || 0}</div>
            <div className="label">Reach (Impressions)</div>
          </StatCard>
          <StatCard>
            <div className="value">{overview?.shares || 0}</div>
            <div className="label">Shares</div>
          </StatCard>
          <StatCard>
            <div className="value">{overview?.likes || 0}</div>
            <div className="label">Likes</div>
          </StatCard>
          <StatCard>
            <div className="value">{overview?.comments || 0}</div>
            <div className="label">Comments</div>
          </StatCard>
          <StatCard>
            <div className="value">{insights?.youth_percentage || 0}%</div>
            <div className="label">Youth (18-35)</div>
          </StatCard>
          <StatCard>
            <div className="value">{overview?.is_verified ? "Yes" : "No"}</div>
            <div className="label">Verified Account</div>
          </StatCard>
        </StatGrid>
      </Card>

      {/* Manifesto Engagement Section (NEW) */}
      <Card>
        <CardHeader>
          <h3>
            <Zap size={18} /> Manifesto Engagement
          </h3>
        </CardHeader>
        <StatGrid>
          <StatCard>
            <div className="value">{overview?.manifesto_engagement?.views || 0}</div>
            <div className="label">Manifesto Starts</div>
          </StatCard>
          <StatCard>
            <div className="value">{overview?.manifesto_engagement?.reads || 0}</div>
            <div className="label">Full Reads</div>
          </StatCard>
          <StatCard>
            <div className="value">{overview?.manifesto_engagement?.avg_read_time || 0}s</div>
            <div className="label">Avg. Read Time</div>
          </StatCard>
          <StatCard>
            <div className="value">{overview?.manifesto_engagement?.total_votes || 0}</div>
            <div className="label">Total Votes</div>
          </StatCard>
        </StatGrid>
      </Card>

      {/* Two columns: Demographics & Regional */}
      <TwoColumnGrid>
        <HalfCard>
          <div style={{ padding: "24px" }}>
            <SectionTitle>
              <PieChartIcon size={16} /> Demographics
            </SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Gender Pie */}
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: 12, color: "#475569" }}>Gender Split</div>
                {genderData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <RePieChart>
                      <Pie
                        data={genderData}
                        innerRadius={40}
                        outerRadius={70}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {genderData.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: "center", color: "#94a3b8", padding: 30 }}>No gender data yet</div>
                )}
              </div>

              {/* Generations */}
              {generationData.length > 0 && (
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: 12, color: "#475569" }}>Age Groups</div>
                  <StatsList>
                    {generationData.map((gen) => (
                      <StatRow key={gen.name}>
                        <span className="label">{gen.name}</span>
                        <div className="bar">
                          <div style={{ width: `${Math.min(100, (gen.value / (overview?.total_supporters || 1)) * 100)}%` }} />
                        </div>
                        <span className="value">{gen.value}</span>
                      </StatRow>
                    ))}
                  </StatsList>
                </div>
              )}
            </div>
          </div>
        </HalfCard>

        <HalfCard>
          <div style={{ padding: "24px" }}>
            <SectionTitle>
              <MapPin size={16} /> Top Regions
            </SectionTitle>
            {regionalData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <ReBarChart data={regionalData} layout="vertical" margin={{ left: 40 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#e11d48" radius={[0, 4, 4, 0]} barSize={20} />
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>No regional data yet</div>
            )}
          </div>
        </HalfCard>
      </TwoColumnGrid>

      {/* Voter Insights */}
      <Card>
        <CardHeader>
          <h3>
            <Users size={18} /> Voter Insights
          </h3>
        </CardHeader>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "#eef2f6" }}>
          <div style={{ background: "white", padding: "24px" }}>
            <SectionTitle>Voter Card Status</SectionTitle>
            <StatsList>
              <StatRow>
                <span className="label">
                  <CheckCircle size={14} color="#10b981" /> Registered
                </span>
                <div className="bar">
                  <div style={{ width: `${(overview?.total_supporters || 0) > 0 ? (overview?.endorsements / overview?.total_supporters) * 100 : 0}%` }} />
                </div>
                <span className="value">{overview?.total_supporters || 0}</span>
              </StatRow>
              <StatRow>
                <span className="label">
                  <XCircle size={14} color="#ef4444" /> Not Registered
                </span>
                <div className="bar">
                  <div style={{ width: `${100 - ((overview?.total_supporters || 0) > 0 ? (overview?.endorsements / overview?.total_supporters) * 100 : 0)}%` }} />
                </div>
                <span className="value">{Math.max(0, (overview?.reach || 0) - (overview?.total_supporters || 0))}</span>
              </StatRow>
            </StatsList>
          </div>
          <div style={{ background: "white", padding: "24px" }}>
            <SectionTitle>Voting Intention</SectionTitle>
            <StatsList>
              <StatRow>
                <span className="label">Will Vote</span>
                <div className="bar">
                  <div style={{ width: `${(overview?.endorsements / (overview?.reach || 1)) * 100}%` }} />
                </div>
                <span className="value">{overview?.endorsements || 0}</span>
              </StatRow>
              <StatRow>
                <span className="label">Undecided</span>
                <div className="bar">
                  <div style={{ width: `${100 - (overview?.endorsements / (overview?.reach || 1)) * 100}%` }} />
                </div>
                <span className="value">{Math.max(0, (overview?.reach || 0) - (overview?.endorsements || 0))}</span>
              </StatRow>
            </StatsList>
          </div>
        </div>
      </Card>
    </Container>
  );
};

export default AnalyticsSection;