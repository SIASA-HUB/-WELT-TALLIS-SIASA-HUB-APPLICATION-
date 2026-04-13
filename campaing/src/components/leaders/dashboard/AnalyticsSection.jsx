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
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, BarChart as ReBarChart, Bar
} from "recharts";
import api from "../../../api/api"; // Import your configured api

const Container = styled.div``;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 12px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 8px;
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
  padding: 20px;
  text-align: center;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;

  &:nth-child(4n) {
    border-right: none;
  }

  .value {
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 4px;
  }
  
  .label {
    font-size: 12px;
    color: #64748b;
  }
  
  .trend {
    font-size: 11px;
    margin-top: 8px;
    color: #10b981;
  }
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const HalfCard = styled(Card)`
  margin-bottom: 0;
`;

const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
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
  font-size: 13px;

  .label {
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .value {
    font-weight: 600;
    color: #1e293b;
  }

  .bar {
    flex: 1;
    height: 6px;
    background: #e2e8f0;
    border-radius: 3px;
    margin: 0 12px;
    overflow: hidden;

    div {
      height: 100%;
      background: #1e3c72;
      border-radius: 3px;
    }
  }
`;

const SupporterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 20px 20px;
`;

const SupporterItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: #1e3c72;
  }

  .info {
    flex: 1;

    .name {
      font-weight: 600;
      font-size: 14px;
      color: #1e293b;
    }

    .details {
      font-size: 11px;
      color: #64748b;
    }
  }

  .stats {
    text-align: right;

    .count {
      font-weight: 700;
      font-size: 14px;
      color: #1e3c72;
    }

    .label {
      font-size: 10px;
      color: #64748b;
    }
  }
`;

const Badge = styled.span`
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  background: ${(props) => (props.$type === "voter" ? "#dcfce7" : "#fed7aa")};
  color: ${(props) => (props.$type === "voter" ? "#166534" : "#9a3412")};
`;

const Select = styled.select`
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  background: white;
  color: #1e293b;
  cursor: pointer;
`;

const AnalyticsSection = ({ leader }) => {
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    engagement: { score: 0, rank: 0, regionalRank: 0 },
    insights: { youth: 0, male: 0, female: 0, topRegions: [] },
    endorsements: { total: 0, free: 0, paid: 0, growth: 0, shares: 0 },
    demographics: { byCounty: [], byGender: {} },
    voters: { registered: 0, notRegistered: 0, willVote: 0, undecided: 0 },
    topSupporters: [],
  });

  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    const generateTrend = () => {
      const days = ["7d", "14d", "21d", "30d"];
      const total = data.endorsements.total || 850;
      const growth = data.endorsements.growth || 12;
      return days.map((d, i) => ({
        name: d,
        supporters: Math.round(total * (1 - (growth / 100) * (1 - i / 3)))
      }));
    };
    setTrendData(generateTrend());
  }, [data.endorsements]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Using configured api instance
        const response = await api.get(`/leaders/analytics/dashboard`, {
          params: { leader_id: leader?.leader_id || leader?.id }
        });

        if (response?.success) {
          const d = response.data;
          
          setData({
            engagement: {
              score: d.overview?.engagement_score || 0,
              rank: d.overview?.trending_rank || 0,
              regionalRank: d.overview?.regional_rank || 0
            },
            insights: {
              youth: d.insights?.youth_percentage || 0,
              male: d.insights?.male_percentage || 0,
              female: d.insights?.female_percentage || 0,
              topRegions: d.insights?.top_regions || []
            },
            endorsements: {
              total: d.overview?.endorsements || 0,
              free: d.overview?.reach > 0 ? Math.max(0, (d.overview?.endorsements || 0) - (d.overview?.paid_endorsements || 0)) : 0,
              paid: d.overview?.paid_endorsements || 0,
              growth: d.overview?.growth_rate || 0,
              shares: d.overview?.shares || 0
            },
            demographics: {
              byCounty: d.ward_reach?.map(w => ({ name: w.name || w.county || "Other", count: w.count || 0 })) || [],
              byGender: d.demographics?.gender || {},
            },
            voters: {
              registered: Math.round((d.overview?.reach || 0) * 0.72),
              notRegistered: Math.round((d.overview?.reach || 0) * 0.28),
              willVote: d.overview?.endorsements || 0,
              undecided: Math.max(0, (d.overview?.reach || 0) - (d.overview?.endorsements || 0)),
            },
            topSupporters: [],
          });
        }

        // Fetch top supporters
        const supportersRes = await api.get(`/endorsements/leader/${leader?.leader_id || leader?.id}/recent?limit=5`);
        
        if (supportersRes?.success) {
          setData(prev => ({
            ...prev,
            topSupporters: supportersRes.data.map(s => ({
              id: s.endorsement_id,
              name: s.user_name || "Anonymous",
              county: s.county || "Kenya",
              endorsements: 1,
              isVoter: true
            }))
          }));
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (leader?.leader_id || leader?.id) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [leader, timeRange]);

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading analytics...</div>
      </Card>
    );
  }

  return (
    <Container>
      <Card>
        <CardHeader>
          <h3>📈 Support Trend</h3>
          <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </Select>
        </CardHeader>
        <div style={{ width: "100%", height: 300, padding: "20px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip />
              <Line type="monotone" dataKey="supporters" stroke="#1e3c72" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <h3>Endorsements Overview</h3>
        </CardHeader>
        <StatGrid>
          <StatCard>
            <div className="value">{data.endorsements.total.toLocaleString()}</div>
            <div className="label">Total Endorsements</div>
            <div className="trend">↑ {data.endorsements.growth}%</div>
          </StatCard>
          <StatCard>
            <div className="value">{data.endorsements.paid.toLocaleString()}</div>
            <div className="label">Paid</div>
          </StatCard>
          <StatCard>
            <div className="value">{data.endorsements.free.toLocaleString()}</div>
            <div className="label">Free</div>
          </StatCard>
          <StatCard>
            <div className="value">{data.endorsements.shares.toLocaleString()}</div>
            <div className="label">Shares</div>
          </StatCard>
        </StatGrid>
      </Card>

      <TwoColumnGrid>
        <HalfCard>
          <div style={{ padding: "20px" }}>
            <SectionTitle><MapPin size={14} /> Regional Performance</SectionTitle>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={data.demographics.byCounty.slice(0, 5)}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1e3c72" radius={[4, 4, 0, 0]} barSize={30} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </HalfCard>

        <HalfCard>
          <div style={{ padding: "20px" }}>
            <SectionTitle><PieChartIcon size={14} /> Demographic Split</SectionTitle>
            <div style={{ width: "100%", height: 260, display: "flex", justifyContent: "center" }}>
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={[
                      { name: 'Male', value: data.insights.male || 50 },
                      { name: 'Female', value: data.insights.female || 50 }
                    ]}
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label
                  >
                    <Cell key="male" fill="#1e3c72" />
                    <Cell key="female" fill="#e11d48" />
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </HalfCard>
      </TwoColumnGrid>

      <Card>
        <CardHeader>
          <h3>Voter Insights</h3>
        </CardHeader>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "#e2e8f0" }}>
          <div style={{ background: "white", padding: "20px" }}>
            <SectionTitle>Voter Card Status</SectionTitle>
            <StatsList>
              <StatRow>
                <span className="label"><CheckCircle size={14} color="#10b981" /> Registered</span>
                <div className="bar"><div style={{ width: `${(data.voters.registered / (data.voters.registered + data.voters.notRegistered)) * 100}%` }} /></div>
                <span className="value">{data.voters.registered.toLocaleString()}</span>
              </StatRow>
              <StatRow>
                <span className="label"><XCircle size={14} color="#ef4444" /> Not Registered</span>
                <div className="bar"><div style={{ width: `${(data.voters.notRegistered / (data.voters.registered + data.voters.notRegistered)) * 100}%` }} /></div>
                <span className="value">{data.voters.notRegistered.toLocaleString()}</span>
              </StatRow>
            </StatsList>
          </div>
          <div style={{ background: "white", padding: "20px" }}>
            <SectionTitle>Voting Intention</SectionTitle>
            <StatsList>
              <StatRow>
                <span className="label">Will Vote</span>
                <div className="bar"><div style={{ width: `${(data.voters.willVote / (data.voters.willVote + data.voters.undecided)) * 100}%` }} /></div>
                <span className="value">{data.voters.willVote.toLocaleString()}</span>
              </StatRow>
              <StatRow>
                <span className="label">Undecided</span>
                <div className="bar"><div style={{ width: `${(data.voters.undecided / (data.voters.willVote + data.voters.undecided)) * 100}%` }} /></div>
                <span className="value">{data.voters.undecided.toLocaleString()}</span>
              </StatRow>
            </StatsList>
          </div>
        </div>
      </Card>
    </Container>
  );
};

export default AnalyticsSection;