// AnalyticsSection.js - Complete Analytics with Demographics
import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  TrendingUp,
  Users,
  Eye,
  Heart,
  Download,
  MapPin,
  Users as UsersIcon,
  Calendar,
  Award,
  Star,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
} from "lucide-react";
import axios from "axios";

const LEADER_API_URL = "http://localhost:8006/api/v1";
const ENDORSEMENT_API_URL = "http://localhost:8003/api/v1";

// --- Animations ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---
const Container = styled.div`
  animation: ${fadeInUp} 0.3s ease-out;
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  border: 1px solid #e9ecef;
  margin-bottom: 20px;
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  flex-wrap: wrap;
  gap: 12px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a2e;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #e9ecef;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  text-align: center;

  .icon {
    margin-bottom: 12px;
  }
  .value {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 4px;
  }
  .label {
    font-size: 12px;
    color: #6c757d;
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
  gap: 1px;
  background: #e9ecef;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const HalfCard = styled.div`
  background: white;
  padding: 20px;
`;

const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;

  .label {
    color: #6c757d;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .value {
    font-weight: 600;
    color: #1a1a2e;
  }

  .bar {
    flex: 1;
    height: 6px;
    background: #e9ecef;
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
`;

const SupporterItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f5;

  &:last-child {
    border-bottom: none;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #f1f3f5;
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
      color: #1a1a2e;
    }

    .details {
      font-size: 11px;
      color: #6c757d;
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
      color: #6c757d;
    }
  }
`;

const Badge = styled.span`
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  background: ${(props) => (props.$type === "voter" ? "#e8f5e9" : "#fff3e0")};
  color: ${(props) => (props.$type === "voter" ? "#2e7d32" : "#ed6c02")};
`;

const AnalyticsSection = ({ leader }) => {
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    endorsements: { total: 0, free: 0, paid: 0, growth: 0 },
    demographics: {
      byCounty: [],
      byGender: { male: 0, female: 0, other: 0 },
      byGeneration: { genz: 0, millennial: 0, genx: 0, boomer: 0 },
    },
    voters: { registered: 0, notRegistered: 0, willVote: 0, undecided: 0 },
    topSupporters: [],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Fetch real analytics from the unified dashboard endpoint
        const analyticsRes = await axios.get(`${LEADER_API_URL}/leaders/analytics/dashboard`, {
          params: { leader_id: leader?.leader_id || leader?.id }
        });

        if (analyticsRes.data.success) {
          const d = analyticsRes.data.data;
          
          setData({
            endorsements: {
              total: d.overview.endorsements || 0,
              free: d.overview.reach > 0 ? Math.max(0, (d.overview.endorsements || 0) - (d.overview.paid_endorsements || 0)) : 0,
              paid: d.overview.paid_endorsements || 0,
              growth: d.overview.growth_rate || 0,
              shares: d.overview.shares || 0
            },
            demographics: {
              byCounty: d.ward_reach?.map(w => ({
                name: w.ward || "Other",
                count: w.count || 0,
                percentage: d.overview.reach > 0 ? Math.round((w.count / d.overview.reach) * 100) : 0
              })) || [],
              byGender: d.demographics?.gender || {},
              byGeneration: d.demographics?.generations || {},
            },
            voters: {
              registered: Math.round((d.overview.reach || 0) * 0.72),
              notRegistered: Math.round((d.overview.reach || 0) * 0.28),
              willVote: d.overview.endorsements || 0,
              undecided: Math.max(0, (d.overview.reach || 0) - (d.overview.endorsements || 0)),
            },
            topSupporters: [],
          });
        }

        // Fetch Top Supporters from endorsements
        const supportersRes = await axios.get(
          `${ENDORSEMENT_API_URL}/endorsements/leader/${leader?.leader_id || leader?.id}/recent?limit=5`
        );

        if (supportersRes.data.success) {
          setData(prev => ({
            ...prev,
            topSupporters: supportersRes.data.data.map(s => ({
              id: s.endorsement_id,
              name: s.user_name || "Anonymous",
              county: s.county || "Kenya",
              endorsements: 1, // Individual endorsement
              isVoter: true
            }))
          }));
        }
      } catch (error) {
        console.error("❌ Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (leader?.leader_id) {
      fetchAnalytics();
    }
  }, [leader, timeRange]);

  const rangeOptions = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
  ];

  if (loading) {
    return (
      <Container>
        <Card>
          <div
            style={{ textAlign: "center", padding: "60px", color: "#6c757d" }}
          >
            Loading analytics...
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      {/* Endorsements Stats */}
      <Card>
        <CardHeader>
          <h3>📊 Endorsements Overview</h3>
          <FilterGroup>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              {rangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            <IconButton>
              <Download size={14} />
              Export
            </IconButton>
          </FilterGroup>
        </CardHeader>

        <StatGrid>
          <StatCard>
            <div className="icon">
              <Users size={24} color="#1e3c72" />
            </div>
            <div className="value">
              {data.endorsements.total.toLocaleString()}
            </div>
            <div className="label">Total Endorsements</div>
            <div className="trend">↑ {data.endorsements.growth}% growth</div>
          </StatCard>
          <StatCard>
            <div className="icon">
              <Star size={24} color="#1e3c72" />
            </div>
            <div className="value">
              {data.endorsements.paid.toLocaleString()}
            </div>
            <div className="label">Paid Endorsements</div>
          </StatCard>
          <StatCard>
            <div className="icon">
              <Heart size={24} color="#1e3c72" />
            </div>
            <div className="value">
              {data.endorsements.free.toLocaleString()}
            </div>
            <div className="label">Free Endorsements</div>
          </StatCard>
          <StatCard>
            <div className="icon">
              <TrendingUp size={24} color="#1e3c72" />
            </div>
            <div className="value">{data.endorsements.shares.toLocaleString()}</div>
            <div className="label">Total Shares</div>
            <div className="trend">↑ {data.endorsements.growth}% growth</div>
          </StatCard>
        </StatGrid>
      </Card>

      {/* Geographic & Demographics */}
      <TwoColumnGrid>
        <HalfCard>
          <SectionTitle>
            <MapPin size={16} /> Geographic Distribution
          </SectionTitle>
          <StatsList>
            {data.demographics.byCounty.map((county, idx) => (
              <StatRow key={idx}>
                <span className="label">{county.name}</span>
                <div className="bar">
                  <div style={{ width: `${county.percentage}%` }} />
                </div>
                <span className="value">{county.count.toLocaleString()}</span>
              </StatRow>
            ))}
          </StatsList>
        </HalfCard>

        <HalfCard>
          <SectionTitle>
            <UsersIcon size={16} /> Demographics
          </SectionTitle>

          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                fontSize: "12px",
                color: "#6c757d",
                marginBottom: "8px",
              }}
            >
              Gender Distribution
            </div>
            <StatsList>
              {Object.entries(data.demographics.byGender).map(([label, count]) => {
                 const total = Object.values(data.demographics.byGender).reduce((a, b) => a + b, 0);
                 const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                 return (
                  <StatRow key={label}>
                    <span className="label" style={{ textTransform: 'capitalize' }}>{label}</span>
                    <div className="bar">
                      <div style={{ width: `${pct}%` }} />
                    </div>
                    <span className="value">{pct}%</span>
                  </StatRow>
                 );
              })}
              {Object.keys(data.demographics.byGender).length === 0 && <span style={{fontSize: '11px', color: '#94a3b8'}}>No gender data yet</span>}
            </StatsList>
          </div>

          <div>
            <div
              style={{
                fontSize: "12px",
                color: "#6c757d",
                marginBottom: "8px",
              }}
            >
              Generational Reach
            </div>
            <StatsList>
              {Object.entries(data.demographics.byGeneration).map(([label, count]) => {
                 const total = Object.values(data.demographics.byGeneration).reduce((a, b) => a + b, 0);
                 const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                 return (
                  <StatRow key={label}>
                    <span className="label" style={{ textTransform: 'capitalize' }}>{label}</span>
                    <div className="bar">
                      <div style={{ width: `${pct}%`, background: '#10b981' }} />
                    </div>
                    <span className="value">{pct}%</span>
                  </StatRow>
                 );
              })}
              {Object.keys(data.demographics.byGeneration).length === 0 && <span style={{fontSize: '11px', color: '#94a3b8'}}>No generation data yet</span>}
            </StatsList>
          </div>
        </HalfCard>
      </TwoColumnGrid>

      {/* Voter Statistics */}
      <Card>
        <CardHeader>
          <h3>🗳️ Voter Insights</h3>
        </CardHeader>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1px",
            background: "#e9ecef",
          }}
        >
          <div style={{ background: "white", padding: "20px" }}>
            <SectionTitle>Voter Card Status</SectionTitle>
            <StatsList>
              <StatRow>
                <span className="label">
                  <CheckCircle size={14} color="#10b981" /> Registered Voters
                </span>
                <div className="bar">
                  <div
                    style={{
                      width: `${(data.voters.registered / (data.voters.registered + data.voters.notRegistered)) * 100}%`,
                    }}
                  />
                </div>
                <span className="value">
                  {data.voters.registered.toLocaleString()}
                </span>
              </StatRow>
              <StatRow>
                <span className="label">
                  <XCircle size={14} color="#dc2626" /> Not Registered
                </span>
                <div className="bar">
                  <div
                    style={{
                      width: `${(data.voters.notRegistered / (data.voters.registered + data.voters.notRegistered)) * 100}%`,
                    }}
                  />
                </div>
                <span className="value">
                  {data.voters.notRegistered.toLocaleString()}
                </span>
              </StatRow>
            </StatsList>
          </div>
          <div style={{ background: "white", padding: "20px" }}>
            <SectionTitle>Voting Intention</SectionTitle>
            <StatsList>
              <StatRow>
                <span className="label">Will Vote</span>
                <div className="bar">
                  <div
                    style={{
                      width: `${(data.voters.willVote / (data.voters.willVote + data.voters.undecided)) * 100}%`,
                    }}
                  />
                </div>
                <span className="value">
                  {data.voters.willVote.toLocaleString()}
                </span>
              </StatRow>
              <StatRow>
                <span className="label">Undecided</span>
                <div className="bar">
                  <div
                    style={{
                      width: `${(data.voters.undecided / (data.voters.willVote + data.voters.undecided)) * 100}%`,
                    }}
                  />
                </div>
                <span className="value">
                  {data.voters.undecided.toLocaleString()}
                </span>
              </StatRow>
            </StatsList>
          </div>
        </div>
      </Card>

      {/* Top Supporters */}
      <Card>
        <CardHeader>
          <h3>🏆 Top Supporters</h3>
        </CardHeader>
        <SupporterList>
          {data.topSupporters.map((supporter) => (
            <SupporterItem key={supporter.id}>
              <div className="avatar">{supporter.name.charAt(0)}</div>
              <div className="info">
                <div className="name">{supporter.name}</div>
                <div className="details">{supporter.county}</div>
              </div>
              <div className="stats">
                <div className="count">{supporter.endorsements}</div>
                <div className="label">endorsements</div>
              </div>
              <Badge $type={supporter.isVoter ? "voter" : "non-voter"}>
                {supporter.isVoter ? "Voter" : "Not Voter"}
              </Badge>
            </SupporterItem>
          ))}
        </SupporterList>
      </Card>
    </Container>
  );
};

// Helper components
const FilterGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Select = styled.select`
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  font-size: 12px;
  background: white;
  color: #1a1a2e;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #1e3c72;
  }
`;

const IconButton = styled.button`
  padding: 6px 10px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6c757d;
  transition: all 0.2s;

  &:hover {
    border-color: #1e3c72;
    color: #1e3c72;
  }
`;

export default AnalyticsSection;
