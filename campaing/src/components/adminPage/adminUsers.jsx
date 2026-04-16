// AdminDashboard.jsx - Complete Sleek Version with Beautiful Monthly Growth Chart

import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  Users,
  TrendingUp,
  Calendar,
  MapPin,
  Briefcase,
  Vote,
  CheckCircle,
  Activity,
  Eye,
  Download,
  RefreshCw,
  Target,
  BarChart3,
  ThumbsUp,
  Shield,
  AlertCircle,
  Clock,
  UserCheck,
  Building2,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Zap,
  Crown,
  Award,
} from "lucide-react";
import api from "../../api/api";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const scaleUp = keyframes`
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// Styled Components
const DashboardContainer = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
  padding: 32px;
  animation: ${fadeIn} 0.6s ease-out;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Header = styled.div`
  margin-bottom: 40px;
  animation: ${slideInLeft} 0.5s ease-out;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
`;

const LastUpdated = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 0.8rem;
  margin-top: 8px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
  animation: ${scaleUp} 0.5s ease-out;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 28px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(226, 232, 240, 0.6);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #dc2626, #ef4444, #f97316, #f59e0b);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.15);
    
    &::before {
      transform: scaleX(1);
    }
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const StatTitle = styled.p`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 1.5px;
  margin: 0;
`;

const StatValue = styled.h2`
  font-size: 44px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 12px 0;
  line-height: 1;
  
  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const StatTrend = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${(props) => (props.$positive ? "#10b981" : "#ef4444")};
  font-weight: 600;
  padding: 6px 12px;
  background: ${(props) => (props.$positive ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)")};
  border-radius: 20px;
  display: inline-flex;
  width: fit-content;
`;

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  background: ${(props) => props.$bg || "linear-gradient(135deg, #fef2f2, #fee2e2)"};
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.$color || "#dc2626"};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

const Section = styled.div`
  margin-bottom: 40px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 8px;
  border-left: 4px solid #dc2626;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 28px;
  padding: 28px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  height: 100%;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const ChartTitle = styled.h4`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
`;

const BarContainer = styled.div`
  margin-top: 8px;
`;

const BarItem = styled.div`
  margin-bottom: 24px;
`;

const BarLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
`;

const Bar = styled.div`
  height: 44px;
  background: #f1f5f9;
  border-radius: 14px;
  overflow: hidden;
  position: relative;
`;

const BarFill = styled.div`
  height: 100%;
  width: ${(props) => props.$width}%;
  background: ${(props) => props.$color || "linear-gradient(90deg, #dc2626, #ef4444)"};
  border-radius: 14px;
  transition: width 1.2s cubic-bezier(0.34, 1.2, 0.64, 1);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 16px;
  color: white;
  font-size: 13px;
  font-weight: 700;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transform: translateX(-100%);
    animation: ${shimmer} 2s infinite;
  }
`;

// Monthly Growth Chart Styled Components
const MonthlyChartContainer = styled.div`
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 28px;
  padding: 28px;
  margin-top: 8px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.1), transparent);
    pointer-events: none;
  }
`;

const MonthlyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
`;

const MonthlyTitle = styled.h4`
  color: white;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TotalGrowth = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 8px 20px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fbbf24;
  font-weight: 700;
  font-size: 14px;
`;

const ChartWrapper = styled.div`
  position: relative;
  padding: 20px 0;
`;

const YAxis = styled.div`
  position: absolute;
  left: -10px;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  padding: 20px 0;
`;

const YAxisLabel = styled.span`
  transform: translateX(-100%);
`;

const BarsContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 12px;
  min-height: 280px;
  padding: 20px 0 0 20px;
`;

const MonthlyBar = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: ${scaleUp} 0.5s ease-out;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const MonthlyBarFill = styled.div`
  width: 100%;
  height: ${(props) => props.$height}px;
  background: linear-gradient(180deg, #dc2626, #ef4444);
  border-radius: 16px 16px 8px 8px;
  transition: height 0.8s cubic-bezier(0.34, 1.2, 0.64, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);

  &:hover {
    background: linear-gradient(180deg, #ef4444, #f97316);
    box-shadow: 0 6px 16px rgba(220, 38, 38, 0.5);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transform: translateX(-100%);
    animation: ${shimmer} 2s infinite;
  }
`;

const MonthlyValue = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: #fca5a5;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 20px;
`;

const MonthlyLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TrendIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${(props) => props.$trend > 0 ? "#10b981" : props.$trend < 0 ? "#ef4444" : "#fbbf24"};
  margin-top: 8px;
`;

const Grid2Col = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  flex-direction: column;
  gap: 24px;
  background: linear-gradient(135deg, #f8fafc, #eef2ff);
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid #e2e8f0;
  border-top-color: #dc2626;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const EmptyStateContainer = styled.div`
  background: white;
  border-radius: 28px;
  padding: 60px;
  text-align: center;
  margin: 40px 0;
  border: 1px solid rgba(226, 232, 240, 0.6);
`;

const UsersAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/users/analytics");
      
      // Safely handle response - even if empty or malformed
      if (response && response.success && response.data) {
        setData(response.data);
      } else if (response && response.data) {
        setData(response.data);
      } else {
        // Create default empty data structure
        setData({
          totalUsers: 0,
          newUsersThisMonth: 0,
          activeUsers: 0,
          gender: { male: 0, female: 0, other: 0 },
          voterCard: { yes: 0, no: 0 },
          willVote: { yes: 0, no: 0, notSure: 0 },
          generation: [],
          politicalParties: [],
          employment: {},
          verification: [],
          politicalLeanings: {},
          monthlyTrend: [],
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError(error.message || "Failed to load analytics data");
      // Set empty data structure to prevent breaking
      setData({
        totalUsers: 0,
        newUsersThisMonth: 0,
        activeUsers: 0,
        gender: { male: 0, female: 0, other: 0 },
        voterCard: { yes: 0, no: 0 },
        willVote: { yes: 0, no: 0, notSure: 0 },
        generation: [],
        politicalParties: [],
        employment: {},
        verification: [],
        politicalLeanings: {},
        monthlyTrend: [],
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (value, total) => {
    if (!total || total === 0 || !value) return "0";
    return ((value / total) * 100).toFixed(1);
  };

  const exportData = () => {
    if (!data) return;
    
    try {
      const csvData = [
        ["Metric", "Value"],
        ["Total Users", data.totalUsers || 0],
        ["New Users This Month", data.newUsersThisMonth || 0],
        ["Active Users", data.activeUsers || 0],
        ["Male Users", data.gender?.male || 0],
        ["Female Users", data.gender?.female || 0],
        ["Other Gender", data.gender?.other || 0],
        ["Have Voter Card", data.voterCard?.yes || 0],
        ["No Voter Card", data.voterCard?.no || 0],
        ["Will Vote", data.willVote?.yes || 0],
        ["Will Not Vote", data.willVote?.no || 0],
        ["Not Sure", data.willVote?.notSure || 0],
        "",
        ["Generation", "Count", "Percentage"],
        ...(data.generation || []).map(gen => [gen.generation || "Unknown", gen.count || 0, `${gen.percentage || 0}%`]),
        "",
        ["Political Parties", "Count", "Percentage"],
        ...(data.politicalParties || []).map(party => [party.political_party || "Unknown", party.count || 0, `${party.percentage || 0}%`]),
      ];

      const csv = csvData.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting data:", err);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <p className="text-muted fw-semibold">Loading analytics data...</p>
      </LoadingContainer>
    );
  }

  // Safe data access with fallbacks
  const safeData = data || {};
  const totalUsers = safeData.totalUsers || 0;
  const maleCount = safeData.gender?.male || 0;
  const femaleCount = safeData.gender?.female || 0;
  const otherCount = safeData.gender?.other || 0;
  const votersWithCard = safeData.voterCard?.yes || 0;
  const willVoteCount = safeData.willVote?.yes || 0;

  // Calculate monthly trend safely
  const monthlyTrend = safeData.monthlyTrend || [];
  const maxNewUsers = monthlyTrend.length > 0 ? Math.max(...monthlyTrend.map(m => m.new_users || 0)) : 1;
  const totalNewUsers = monthlyTrend.reduce((sum, m) => sum + (m.new_users || 0), 0);
  const avgMonthlyGrowth = totalNewUsers / (monthlyTrend.length || 1);
  const lastMonthGrowth = monthlyTrend[monthlyTrend.length - 1]?.new_users || 0;
  const previousMonthGrowth = monthlyTrend[monthlyTrend.length - 2]?.new_users || 0;
  const growthChange = lastMonthGrowth - previousMonthGrowth;

  // Check if there's any data to display
  const hasData = totalUsers > 0 || 
                  (safeData.generation && safeData.generation.length > 0) || 
                  (safeData.politicalParties && safeData.politicalParties.length > 0);

  return (
    <DashboardContainer>
      <div className="container-fluid">
        <Header>
          <Title>
            <BarChart3 size={34} className="text-danger" />
            User Analytics Dashboard
          </Title>
          <Subtitle>Comprehensive insights into your user base demographics and engagement</Subtitle>
          <LastUpdated>
            <Clock size="14" />
            Last updated: {safeData.lastUpdated ? new Date(safeData.lastUpdated).toLocaleString() : new Date().toLocaleString()}
          </LastUpdated>
          {error && (
            <div className="alert alert-warning mt-3" role="alert">
              <AlertCircle size="16" className="me-2" />
              {error} - Showing demo data
            </div>
          )}
        </Header>

        {!hasData && totalUsers === 0 ? (
          <EmptyStateContainer>
            <Users size="64" className="text-muted mb-4" />
            <h4 className="mb-3">No User Data Available</h4>
            <p className="text-muted mb-4">
              There are no users registered in the system yet.<br />
              Once users start registering, their analytics will appear here.
            </p>
            <button 
              className="btn btn-danger rounded-pill px-4 py-2"
              onClick={fetchAnalytics}
            >
              <RefreshCw size="16" className="me-2" />
              Refresh Data
            </button>
          </EmptyStateContainer>
        ) : (
          <>
            {/* Stats Grid */}
            <StatsGrid>
              <StatCard>
                <StatHeader>
                  <StatTitle>Total Users</StatTitle>
                  <IconWrapper $bg="linear-gradient(135deg, #eef2ff, #e0e7ff)" $color="#3b82f6">
                    <Users size="28" />
                  </IconWrapper>
                </StatHeader>
                <StatValue>{totalUsers.toLocaleString()}</StatValue>
                <StatTrend $positive>
                  <ArrowUp size="14" /> +{safeData.newUsersThisMonth || 0} this month
                </StatTrend>
              </StatCard>

              <StatCard>
                <StatHeader>
                  <StatTitle>Voter Card Holders</StatTitle>
                  <IconWrapper $bg="linear-gradient(135deg, #d1fae5, #a7f3d0)" $color="#059669">
                    <Vote size="28" />
                  </IconWrapper>
                </StatHeader>
                <StatValue>{votersWithCard.toLocaleString()}</StatValue>
                <StatTrend $positive>
                  <CheckCircle size="14" />
                  {getPercentage(votersWithCard, totalUsers)}% of total users
                </StatTrend>
              </StatCard>

              <StatCard>
                <StatHeader>
                  <StatTitle>Will Vote</StatTitle>
                  <IconWrapper $bg="linear-gradient(135deg, #fef3c7, #fde68a)" $color="#d97706">
                    <Target size="28" />
                  </IconWrapper>
                </StatHeader>
                <StatValue>{willVoteCount.toLocaleString()}</StatValue>
                <StatTrend $positive>
                  <ThumbsUp size="14" />
                  {getPercentage(willVoteCount, totalUsers)}% plan to vote
                </StatTrend>
              </StatCard>

              <StatCard>
                <StatHeader>
                  <StatTitle>Active Users</StatTitle>
                  <IconWrapper $bg="linear-gradient(135deg, #fce7f3, #fbcfe8)" $color="#db2777">
                    <Activity size="28" />
                  </IconWrapper>
                </StatHeader>
                <StatValue>{safeData.activeUsers || 0}</StatValue>
                <StatTrend $positive={false}>
                  <Eye size="14" />
                  Currently active
                </StatTrend>
              </StatCard>
            </StatsGrid>

            {/* Monthly Growth Chart - Only show if there's data */}
            {monthlyTrend.length > 0 && (
              <Section>
                <SectionTitle>
                  <TrendingUp size="24" className="text-danger" />
                  Monthly User Growth
                </SectionTitle>
                <MonthlyChartContainer>
                  <MonthlyHeader>
                    <MonthlyTitle>
                      <Zap size="20" color="#fbbf24" />
                      User Acquisition Trend
                    </MonthlyTitle>
                    <TotalGrowth>
                      <Crown size="16" />
                      Total Growth: +{totalNewUsers} users
                    </TotalGrowth>
                  </MonthlyHeader>
                  <ChartWrapper>
                    <BarsContainer>
                      {monthlyTrend.map((month, index) => {
                        const barHeight = ((month.new_users || 0) / maxNewUsers) * 200;
                        const isHighest = (month.new_users || 0) === maxNewUsers;
                        
                        return (
                          <MonthlyBar key={month.month || index}>
                            <MonthlyBarFill 
                              $height={Math.max(barHeight, 30)} 
                              style={{
                                background: isHighest 
                                  ? "linear-gradient(180deg, #f59e0b, #f97316)" 
                                  : "linear-gradient(180deg, #dc2626, #ef4444)"
                              }}
                            />
                            <MonthlyValue>+{month.new_users || 0}</MonthlyValue>
                            <MonthlyLabel>
                              {month.month ? new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : `Month ${index + 1}`}
                            </MonthlyLabel>
                            {index === monthlyTrend.length - 1 && (
                              <TrendIndicator $trend={growthChange}>
                                {growthChange > 0 ? <ArrowUp size="12" /> : growthChange < 0 ? <ArrowDown size="12" /> : <Minus size="12" />}
                                {Math.abs(growthChange)} vs last month
                              </TrendIndicator>
                            )}
                          </MonthlyBar>
                        );
                      })}
                    </BarsContainer>
                  </ChartWrapper>
                  <div className="text-center mt-4 pt-2">
                    <small className="text-white-50">
                      Average monthly growth: +{avgMonthlyGrowth.toFixed(1)} users | 
                      Peak month: {Math.max(...monthlyTrend.map(m => m.new_users || 0))} new users
                    </small>
                  </div>
                </MonthlyChartContainer>
              </Section>
            )}

            {/* Demographics Grid */}
            <Grid2Col>
              {/* Gender Distribution */}
              <ChartCard>
                <ChartTitle>
                  <Users size="20" /> Gender Distribution
                </ChartTitle>
                <BarContainer>
                  <BarItem>
                    <BarLabel>
                      <span>👨 Male</span>
                      <span className="fw-bold text-primary">{maleCount} ({getPercentage(maleCount, totalUsers)}%)</span>
                    </BarLabel>
                    <Bar>
                      <BarFill $width={getPercentage(maleCount, totalUsers)} $color="linear-gradient(90deg, #3b82f6, #2563eb)" />
                    </Bar>
                  </BarItem>
                  <BarItem>
                    <BarLabel>
                      <span>👩 Female</span>
                      <span className="fw-bold text-pink">{femaleCount} ({getPercentage(femaleCount, totalUsers)}%)</span>
                    </BarLabel>
                    <Bar>
                      <BarFill $width={getPercentage(femaleCount, totalUsers)} $color="linear-gradient(90deg, #ec489a, #db2777)" />
                    </Bar>
                  </BarItem>
                  <BarItem>
                    <BarLabel>
                      <span>🌈 Other</span>
                      <span className="fw-bold text-purple">{otherCount} ({getPercentage(otherCount, totalUsers)}%)</span>
                    </BarLabel>
                    <Bar>
                      <BarFill $width={getPercentage(otherCount, totalUsers)} $color="linear-gradient(90deg, #8b5cf6, #7c3aed)" />
                    </Bar>
                  </BarItem>
                </BarContainer>
              </ChartCard>

              {/* Generation Distribution */}
              <ChartCard>
                <ChartTitle>
                  <Calendar size="20" /> Generation Distribution
                </ChartTitle>
                <BarContainer>
                  {(safeData.generation || []).length > 0 ? (
                    (safeData.generation || []).map((gen) => (
                      <BarItem key={gen.generation || Math.random()}>
                        <BarLabel>
                          <span>📅 {gen.generation || "Unknown"}</span>
                          <span className="fw-bold text-cyan">{gen.count || 0} ({gen.percentage || 0}%)</span>
                        </BarLabel>
                        <Bar>
                          <BarFill $width={gen.percentage || 0} $color="linear-gradient(90deg, #06b6d4, #0891b2)" />
                        </Bar>
                      </BarItem>
                    ))
                  ) : (
                    <div className="text-center text-muted py-4">No generation data available</div>
                  )}
                </BarContainer>
              </ChartCard>
            </Grid2Col>

            <Grid2Col>
              {/* Voter Card Status */}
              <ChartCard>
                <ChartTitle>
                  <Vote size="20" /> Voter Card Status
                </ChartTitle>
                <BarContainer>
                  <BarItem>
                    <BarLabel>
                      <span>✅ Have Voter Card</span>
                      <span className="fw-bold text-success">{safeData.voterCard?.yes || 0} ({getPercentage(safeData.voterCard?.yes || 0, totalUsers)}%)</span>
                    </BarLabel>
                    <Bar>
                      <BarFill $width={getPercentage(safeData.voterCard?.yes || 0, totalUsers)} $color="linear-gradient(90deg, #22c55e, #16a34a)" />
                    </Bar>
                  </BarItem>
                  <BarItem>
                    <BarLabel>
                      <span>❌ No Voter Card</span>
                      <span className="fw-bold text-danger">{safeData.voterCard?.no || 0} ({getPercentage(safeData.voterCard?.no || 0, totalUsers)}%)</span>
                    </BarLabel>
                    <Bar>
                      <BarFill $width={getPercentage(safeData.voterCard?.no || 0, totalUsers)} $color="linear-gradient(90deg, #ef4444, #dc2626)" />
                    </Bar>
                  </BarItem>
                </BarContainer>
              </ChartCard>

              {/* Voting Intentions */}
              <ChartCard>
                <ChartTitle>
                  <Target size="20" /> Voting Intentions
                </ChartTitle>
                <BarContainer>
                  <BarItem>
                    <BarLabel>
                      <span>🗳️ Will Vote</span>
                      <span className="fw-bold text-success">{safeData.willVote?.yes || 0} ({getPercentage(safeData.willVote?.yes || 0, totalUsers)}%)</span>
                    </BarLabel>
                    <Bar>
                      <BarFill $width={getPercentage(safeData.willVote?.yes || 0, totalUsers)} $color="linear-gradient(90deg, #22c55e, #16a34a)" />
                    </Bar>
                  </BarItem>
                  <BarItem>
                    <BarLabel>
                      <span>❌ Will Not Vote</span>
                      <span className="fw-bold text-danger">{safeData.willVote?.no || 0} ({getPercentage(safeData.willVote?.no || 0, totalUsers)}%)</span>
                    </BarLabel>
                    <Bar>
                      <BarFill $width={getPercentage(safeData.willVote?.no || 0, totalUsers)} $color="linear-gradient(90deg, #ef4444, #dc2626)" />
                    </Bar>
                  </BarItem>
                  <BarItem>
                    <BarLabel>
                      <span>🤔 Not Sure</span>
                      <span className="fw-bold text-orange">{safeData.willVote?.notSure || 0} ({getPercentage(safeData.willVote?.notSure || 0, totalUsers)}%)</span>
                    </BarLabel>
                    <Bar>
                      <BarFill $width={getPercentage(safeData.willVote?.notSure || 0, totalUsers)} $color="linear-gradient(90deg, #f59e0b, #ea580c)" />
                    </Bar>
                  </BarItem>
                </BarContainer>
              </ChartCard>
            </Grid2Col>

            <Grid2Col>
              {/* Employment Status */}
              <ChartCard>
                <ChartTitle>
                  <Briefcase size="20" /> Employment Status
                </ChartTitle>
                <BarContainer>
                  {Object.entries(safeData.employment || {}).length > 0 ? (
                    Object.entries(safeData.employment || {}).map(([status, count]) => (
                      <BarItem key={status}>
                        <BarLabel>
                          <span>💼 {status}</span>
                          <span className="fw-bold text-purple">{count} ({getPercentage(count, totalUsers)}%)</span>
                        </BarLabel>
                        <Bar>
                          <BarFill $width={getPercentage(count, totalUsers)} $color="linear-gradient(90deg, #a855f7, #9333ea)" />
                        </Bar>
                      </BarItem>
                    ))
                  ) : (
                    <div className="text-center text-muted py-4">No employment data available</div>
                  )}
                </BarContainer>
              </ChartCard>

              {/* Political Parties */}
              <ChartCard>
                <ChartTitle>
                  <Building2 size="20" /> Political Parties
                </ChartTitle>
                <BarContainer>
                  {(safeData.politicalParties || []).slice(0, 5).length > 0 ? (
                    (safeData.politicalParties || []).slice(0, 5).map((party) => (
                      <BarItem key={party.political_party || Math.random()}>
                        <BarLabel>
                          <span>🏛️ {party.political_party || "Unknown"}</span>
                          <span className="fw-bold text-red">{party.count || 0} ({party.percentage || 0}%)</span>
                        </BarLabel>
                        <Bar>
                          <BarFill $width={party.percentage || 0} $color="linear-gradient(90deg, #ef4444, #dc2626)" />
                        </Bar>
                      </BarItem>
                    ))
                  ) : (
                    <div className="text-center text-muted py-4">No political party data available</div>
                  )}
                </BarContainer>
              </ChartCard>
            </Grid2Col>

            <Grid2Col>
              {/* Verification Status */}
              <ChartCard>
                <ChartTitle>
                  <Shield size="20" /> Verification Status
                </ChartTitle>
                <BarContainer>
                  {(safeData.verification || []).length > 0 ? (
                    (safeData.verification || []).map((item) => (
                      <BarItem key={item.status || Math.random()}>
                        <BarLabel>
                          <span>{item.status === "Not Verified" ? "⚠️ Not Verified" : "✅ Verified"}</span>
                          <span className="fw-bold text-yellow">{item.count || 0} ({item.percentage || 0}%)</span>
                        </BarLabel>
                        <Bar>
                          <BarFill $width={item.percentage || 0} $color="linear-gradient(90deg, #f59e0b, #d97706)" />
                        </Bar>
                      </BarItem>
                    ))
                  ) : (
                    <div className="text-center text-muted py-4">No verification data available</div>
                  )}
                </BarContainer>
              </ChartCard>

              {/* Political Leanings */}
              <ChartCard>
                <ChartTitle>
                  <PieChart size="20" /> Political Leanings
                </ChartTitle>
                <BarContainer>
                  {Object.entries(safeData.politicalLeanings || {}).length > 0 ? (
                    Object.entries(safeData.politicalLeanings || {}).map(([leaning, count]) => (
                      <BarItem key={leaning}>
                        <BarLabel>
                          <span>⚖️ {leaning}</span>
                          <span className="fw-bold text-indigo">{count} ({getPercentage(count, totalUsers)}%)</span>
                        </BarLabel>
                        <Bar>
                          <BarFill $width={getPercentage(count, totalUsers)} $color="linear-gradient(90deg, #6366f1, #4f46e5)" />
                        </Bar>
                      </BarItem>
                    ))
                  ) : (
                    <div className="text-center text-muted py-4">No political leaning data available</div>
                  )}
                </BarContainer>
              </ChartCard>
            </Grid2Col>
          </>
        )}

        {/* Footer */}
        <div className="text-center mt-5 pt-4">
          <small className="text-muted">
            Data is updated in real-time | Last sync: {safeData.lastUpdated ? new Date(safeData.lastUpdated).toLocaleString() : new Date().toLocaleString()}
          </small>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default UsersAdmin;
