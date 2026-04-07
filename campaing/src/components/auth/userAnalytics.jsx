import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import {
  Users,
  TrendingUp,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Vote,
  CheckCircle,
  XCircle,
  BarChart2,
  PieChart,
  Activity,
  Eye,
  DollarSign,
  ShoppingBag,
  UserCheck,
  UserX,
} from "lucide-react";

const API_BASE_URL = "https://grass-solaris-sas-hosts.trycloudflare.com/api/v1";

// Styled Components
const DashboardContainer = styled.div`
  background: #f8fafc;
  min-height: 100vh;
  padding: 24px;
  font-family: "Inter", sans-serif;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Subtitle = styled.p`
  color: #475569;
  margin-top: 8px;
  font-size: 14px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const StatTitle = styled.p`
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.5px;
  margin: 0;
`;

const StatValue = styled.h2`
  font-size: 36px;
  font-weight: 800;
  color: #0f172a;
  margin: 8px 0;
`;

const StatTrend = styled.p`
  font-size: 13px;
  color: ${(props) => (props.$positive ? "#10b981" : "#ef4444")};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  background: ${(props) => props.$bg || "#fef2f2"};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.$color || "#bb0000"};
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 24px 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const ChartTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BarContainer = styled.div`
  margin-top: 16px;
`;

const BarItem = styled.div`
  margin-bottom: 16px;
`;

const BarLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13px;
  color: #475569;
`;

const Bar = styled.div`
  height: 32px;
  background: #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  width: ${(props) => props.$width}%;
  background: ${(props) => props.$color || "#bb0000"};
  border-radius: 8px;
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  color: white;
  font-size: 12px;
  font-weight: 600;
`;

const CountyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
`;

const CountyItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const CountyName = styled.span`
  font-weight: 500;
  font-size: 13px;
  color: #334155;
`;

const CountyCount = styled.span`
  font-weight: 700;
  color: #bb0000;
  font-size: 14px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  flex-direction: column;
  gap: 16px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #bb0000;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const UserAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/users/analytics`);
      setAnalytics(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <p>Loading analytics data...</p>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <LoadingContainer>
        <p style={{ color: "#ef4444" }}>{error}</p>
        <button onClick={fetchAnalytics}>Retry</button>
      </LoadingContainer>
    );
  }

  // Sample data structure - replace with actual API response
  const data = analytics || {
    totalUsers: 12543,
    newUsersThisMonth: 2341,
    activeUsers: 8765,
    totalSpend: 3456789,
    avgSpendPerUser: 275,

    gender: {
      male: 6240,
      female: 5890,
      other: 413,
    },

    employment: {
      employed: 4560,
      selfEmployed: 2340,
      student: 3980,
      unemployed: 1240,
      retired: 423,
    },

    votingIntentions: {
      willVote: 9870,
      willNotVote: 1560,
      notSure: 1113,
    },

    ageBrackets: {
      "18-25": 3420,
      "26-35": 4560,
      "36-45": 2340,
      "46-55": 1230,
      "56+": 993,
    },

    voterCard: {
      yes: 8760,
      no: 3783,
    },

    counties: [
      { name: "Nairobi", count: 2340 },
      { name: "Kiambu", count: 1250 },
      { name: "Mombasa", count: 890 },
      { name: "Kisumu", count: 780 },
      { name: "Nakuru", count: 670 },
      { name: "Machakos", count: 540 },
      { name: "Uasin Gishu", count: 430 },
      { name: "Kajiado", count: 390 },
    ],
  };

  const total = data.totalUsers;
  const getPercentage = (value) => ((value / total) * 100).toFixed(1);

  return (
    <DashboardContainer>
      <Header>
        <Title>
          <BarChart2 size={28} />
          User Analytics Dashboard
        </Title>
        <Subtitle>
          Comprehensive insights into your user base and engagement
        </Subtitle>
      </Header>

      {/* Key Stats */}
      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatTitle>Total Users</StatTitle>
            <IconWrapper $bg="#eef2ff" $color="#3b82f6">
              <Users size={24} />
            </IconWrapper>
          </StatHeader>
          <StatValue>{data.totalUsers.toLocaleString()}</StatValue>
          <StatTrend $positive>
            <TrendingUp size={14} />+{data.newUsersThisMonth.toLocaleString()}{" "}
            this month
          </StatTrend>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>Active Users</StatTitle>
            <IconWrapper $bg="#e0f2fe" $color="#0284c7">
              <Activity size={24} />
            </IconWrapper>
          </StatHeader>
          <StatValue>{data.activeUsers.toLocaleString()}</StatValue>
          <StatTrend $positive>
            <Eye size={14} />
            {((data.activeUsers / data.totalUsers) * 100).toFixed(1)}%
            engagement rate
          </StatTrend>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>Total Spend</StatTitle>
            <IconWrapper $bg="#fef3c7" $color="#f59e0b">
              <DollarSign size={24} />
            </IconWrapper>
          </StatHeader>
          <StatValue>KES {data.totalSpend.toLocaleString()}</StatValue>
          <StatTrend $positive>
            <ShoppingBag size={14} />
            Avg. KES {data.avgSpendPerUser.toLocaleString()} per user
          </StatTrend>
        </StatCard>
      </StatsGrid>

      {/* Charts Grid */}
      <ChartGrid>
        {/* Gender Distribution */}
        <ChartCard>
          <ChartTitle>
            <Users size={18} />
            Gender Distribution
          </ChartTitle>
          <BarContainer>
            <BarItem>
              <BarLabel>
                <span>Male</span>
                <span>
                  {data.gender.male.toLocaleString()} (
                  {getPercentage(data.gender.male)}%)
                </span>
              </BarLabel>
              <Bar>
                <BarFill
                  $width={getPercentage(data.gender.male)}
                  $color="#3b82f6"
                />
              </Bar>
            </BarItem>
            <BarItem>
              <BarLabel>
                <span>Female</span>
                <span>
                  {data.gender.female.toLocaleString()} (
                  {getPercentage(data.gender.female)}%)
                </span>
              </BarLabel>
              <Bar>
                <BarFill
                  $width={getPercentage(data.gender.female)}
                  $color="#ec489a"
                />
              </Bar>
            </BarItem>
            <BarItem>
              <BarLabel>
                <span>Other</span>
                <span>
                  {data.gender.other.toLocaleString()} (
                  {getPercentage(data.gender.other)}%)
                </span>
              </BarLabel>
              <Bar>
                <BarFill
                  $width={getPercentage(data.gender.other)}
                  $color="#8b5cf6"
                />
              </Bar>
            </BarItem>
          </BarContainer>
        </ChartCard>

        {/* Employment Status */}
        <ChartCard>
          <ChartTitle>
            <Briefcase size={18} />
            Employment Status
          </ChartTitle>
          <BarContainer>
            {Object.entries(data.employment).map(([key, value]) => (
              <BarItem key={key}>
                <BarLabel>
                  <span>
                    {key === "selfEmployed"
                      ? "Self-Employed"
                      : key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                  <span>
                    {value.toLocaleString()} ({getPercentage(value)}%)
                  </span>
                </BarLabel>
                <Bar>
                  <BarFill $width={getPercentage(value)} $color="#10b981" />
                </Bar>
              </BarItem>
            ))}
          </BarContainer>
        </ChartCard>

        {/* Voting Intentions */}
        <ChartCard>
          <ChartTitle>
            <Vote size={18} />
            Voting Intentions
          </ChartTitle>
          <BarContainer>
            <BarItem>
              <BarLabel>
                <span>Will Vote</span>
                <span>
                  {data.votingIntentions.willVote.toLocaleString()} (
                  {getPercentage(data.votingIntentions.willVote)}%)
                </span>
              </BarLabel>
              <Bar>
                <BarFill
                  $width={getPercentage(data.votingIntentions.willVote)}
                  $color="#22c55e"
                />
              </Bar>
            </BarItem>
            <BarItem>
              <BarLabel>
                <span>Will Not Vote</span>
                <span>
                  {data.votingIntentions.willNotVote.toLocaleString()} (
                  {getPercentage(data.votingIntentions.willNotVote)}%)
                </span>
              </BarLabel>
              <Bar>
                <BarFill
                  $width={getPercentage(data.votingIntentions.willNotVote)}
                  $color="#ef4444"
                />
              </Bar>
            </BarItem>
            <BarItem>
              <BarLabel>
                <span>Not Sure</span>
                <span>
                  {data.votingIntentions.notSure.toLocaleString()} (
                  {getPercentage(data.votingIntentions.notSure)}%)
                </span>
              </BarLabel>
              <Bar>
                <BarFill
                  $width={getPercentage(data.votingIntentions.notSure)}
                  $color="#f59e0b"
                />
              </Bar>
            </BarItem>
          </BarContainer>
        </ChartCard>

        {/* Age Distribution */}
        <ChartCard>
          <ChartTitle>
            <Calendar size={18} />
            Age Distribution
          </ChartTitle>
          <BarContainer>
            {Object.entries(data.ageBrackets).map(([bracket, count]) => (
              <BarItem key={bracket}>
                <BarLabel>
                  <span>{bracket}</span>
                  <span>
                    {count.toLocaleString()} (
                    {((count / total) * 100).toFixed(1)}%)
                  </span>
                </BarLabel>
                <Bar>
                  <BarFill $width={(count / total) * 100} $color="#8b5cf6" />
                </Bar>
              </BarItem>
            ))}
          </BarContainer>
        </ChartCard>

        {/* Voter Card Ownership */}
        <ChartCard>
          <ChartTitle>
            <CheckCircle size={18} />
            Voter Card Status
          </ChartTitle>
          <BarContainer>
            <BarItem>
              <BarLabel>
                <span>Has Voter Card</span>
                <span>
                  {data.voterCard.yes.toLocaleString()} (
                  {((data.voterCard.yes / total) * 100).toFixed(1)}%)
                </span>
              </BarLabel>
              <Bar>
                <BarFill
                  $width={(data.voterCard.yes / total) * 100}
                  $color="#22c55e"
                />
              </Bar>
            </BarItem>
            <BarItem>
              <BarLabel>
                <span>No Voter Card</span>
                <span>
                  {data.voterCard.no.toLocaleString()} (
                  {((data.voterCard.no / total) * 100).toFixed(1)}%)
                </span>
              </BarLabel>
              <Bar>
                <BarFill
                  $width={(data.voterCard.no / total) * 100}
                  $color="#ef4444"
                />
              </Bar>
            </BarItem>
          </BarContainer>
        </ChartCard>
      </ChartGrid>

      {/* County Distribution */}
      <SectionTitle>
        <MapPin size={20} />
        County Distribution
      </SectionTitle>
      <ChartCard>
        <CountyGrid>
          {data.counties.map((county) => (
            <CountyItem key={county.name}>
              <CountyName>{county.name}</CountyName>
              <CountyCount>{county.count.toLocaleString()} users</CountyCount>
            </CountyItem>
          ))}
        </CountyGrid>
      </ChartCard>
    </DashboardContainer>
  );
};

export default UserAnalytics;
