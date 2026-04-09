// AdminDashboard.jsx - Fixed to use only public analytics endpoints

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
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
  Search,
} from "lucide-react";
import API_BASE_URL from "./apiConfig";

// Import Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";

// Styled Components
const DashboardContainer = styled.div`
  background: #f8fafc;
  min-height: 100vh;
  padding: 24px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  height: 100%;

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

const ChartCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  height: 100%;
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

const UsersAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    gender: { male: 0, female: 0, other: 0 },
    ageBrackets: { "18-25": 0, "26-35": 0, "36-45": 0, "46-55": 0, "56+": 0 },
    counties: [],
    voterCard: { yes: 0, no: 0 },
    willVote: { yes: 0, no: 0, notSure: 0 },
    employmentStatus: {},
  });
  const [countyStats, setCountyStats] = useState([]);

  useEffect(() => {
    fetchAnalytics();
    fetchCountyStats();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Fetch from public analytics endpoint (no auth needed)
      const response = await API_BASE_URL.get("/analytics");
      console.log("Analytics response:", response.data);

      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountyStats = async () => {
    try {
      // Fetch from public county stats endpoint (no auth needed)
      const response = await API_BASE_URL.get("/county/stats");
      console.log("County stats response:", response.data);

      if (response.data.success) {
        setCountyStats(response.data.data?.countyStats || []);
      }
    } catch (error) {
      console.error("Error fetching county stats:", error);
    }
  };

  const getPercentage = (value, total) => {
    if (!total || total === 0) return "0";
    return ((value / total) * 100).toFixed(1);
  };

  const exportData = () => {
    const csvData = [
      ["Metric", "Value"],
      ["Total Users", analytics.totalUsers],
      ["Male Users", analytics.gender?.male || 0],
      ["Female Users", analytics.gender?.female || 0],
      ["Other Gender", analytics.gender?.other || 0],
      ["Have Voter Card", analytics.voterCard?.yes || 0],
      ["No Voter Card", analytics.voterCard?.no || 0],
      ["Will Vote", analytics.willVote?.yes || 0],
      ["Will Not Vote", analytics.willVote?.no || 0],
      ["Not Sure", analytics.willVote?.notSure || 0],
      "",
      ["County", "User Count"],
      ...countyStats.map((county) => [county.county, county.total_users || 0]),
    ];

    const csv = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <p className="text-muted">Loading analytics data...</p>
      </LoadingContainer>
    );
  }

  const totalUsers = analytics.totalUsers || 0;
  const maleCount = analytics.gender?.male || 0;
  const femaleCount = analytics.gender?.female || 0;
  const otherCount = analytics.gender?.other || 0;
  const votersWithCard = analytics.voterCard?.yes || 0;
  const willVoteCount = analytics.willVote?.yes || 0;

  return (
    <DashboardContainer>
      <div className="container-fluid">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h1 className="display-6 fw-bold mb-2 d-flex align-items-center gap-2">
              <Users size={32} className="text-danger" />
              User Analytics Dashboard
            </h1>
            <p className="text-muted">
              Comprehensive insights into your user base demographics
            </p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light border" onClick={fetchAnalytics}>
              <RefreshCw size={16} className="me-2" />
              Refresh
            </button>
            <button className="btn btn-light border" onClick={exportData}>
              <Download size={16} className="me-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <StatCard>
              <StatHeader>
                <StatTitle>Total Users</StatTitle>
                <IconWrapper $bg="#eef2ff" $color="#3b82f6">
                  <Users size={24} />
                </IconWrapper>
              </StatHeader>
              <StatValue>{totalUsers.toLocaleString()}</StatValue>
              <StatTrend $positive>
                <TrendingUp size={14} /> Registered users
              </StatTrend>
            </StatCard>
          </div>

          <div className="col-md-4">
            <StatCard>
              <StatHeader>
                <StatTitle>Voter Card Holders</StatTitle>
                <IconWrapper $bg="#e0f2fe" $color="#0284c7">
                  <Vote size={24} />
                </IconWrapper>
              </StatHeader>
              <StatValue>{votersWithCard.toLocaleString()}</StatValue>
              <StatTrend $positive>
                <CheckCircle size={14} />
                {getPercentage(votersWithCard, totalUsers)}% of total users
              </StatTrend>
            </StatCard>
          </div>

          <div className="col-md-4">
            <StatCard>
              <StatHeader>
                <StatTitle>Will Vote</StatTitle>
                <IconWrapper $bg="#fef3c7" $color="#f59e0b">
                  <Activity size={24} />
                </IconWrapper>
              </StatHeader>
              <StatValue>{willVoteCount.toLocaleString()}</StatValue>
              <StatTrend $positive>
                <Eye size={14} />
                {getPercentage(willVoteCount, totalUsers)}% plan to vote
              </StatTrend>
            </StatCard>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
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
                      {maleCount.toLocaleString()} (
                      {getPercentage(maleCount, totalUsers)}%)
                    </span>
                  </BarLabel>
                  <Bar>
                    <BarFill
                      $width={getPercentage(maleCount, totalUsers)}
                      $color="#3b82f6"
                    />
                  </Bar>
                </BarItem>
                <BarItem>
                  <BarLabel>
                    <span>Female</span>
                    <span>
                      {femaleCount.toLocaleString()} (
                      {getPercentage(femaleCount, totalUsers)}%)
                    </span>
                  </BarLabel>
                  <Bar>
                    <BarFill
                      $width={getPercentage(femaleCount, totalUsers)}
                      $color="#ec489a"
                    />
                  </Bar>
                </BarItem>
                <BarItem>
                  <BarLabel>
                    <span>Other</span>
                    <span>
                      {otherCount.toLocaleString()} (
                      {getPercentage(otherCount, totalUsers)}%)
                    </span>
                  </BarLabel>
                  <Bar>
                    <BarFill
                      $width={getPercentage(otherCount, totalUsers)}
                      $color="#8b5cf6"
                    />
                  </Bar>
                </BarItem>
              </BarContainer>
            </ChartCard>
          </div>

          <div className="col-lg-6">
            <ChartCard>
              <ChartTitle>
                <Vote size={18} />
                Voter Card Status
              </ChartTitle>
              <BarContainer>
                <BarItem>
                  <BarLabel>
                    <span>Have Voter Card</span>
                    <span>
                      {votersWithCard.toLocaleString()} (
                      {getPercentage(votersWithCard, totalUsers)}%)
                    </span>
                  </BarLabel>
                  <Bar>
                    <BarFill
                      $width={getPercentage(votersWithCard, totalUsers)}
                      $color="#22c55e"
                    />
                  </Bar>
                </BarItem>
                <BarItem>
                  <BarLabel>
                    <span>No Voter Card</span>
                    <span>
                      {(analytics.voterCard?.no || 0).toLocaleString()} (
                      {getPercentage(analytics.voterCard?.no || 0, totalUsers)}
                      %)
                    </span>
                  </BarLabel>
                  <Bar>
                    <BarFill
                      $width={getPercentage(
                        analytics.voterCard?.no || 0,
                        totalUsers,
                      )}
                      $color="#ef4444"
                    />
                  </Bar>
                </BarItem>
              </BarContainer>
            </ChartCard>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <ChartCard>
              <ChartTitle>
                <Calendar size={18} />
                Age Distribution
              </ChartTitle>
              <BarContainer>
                {Object.entries(analytics.ageBrackets || {}).map(
                  ([bracket, count]) => (
                    <BarItem key={bracket}>
                      <BarLabel>
                        <span>{bracket}</span>
                        <span>
                          {count.toLocaleString()} (
                          {getPercentage(count, totalUsers)}%)
                        </span>
                      </BarLabel>
                      <Bar>
                        <BarFill
                          $width={getPercentage(count, totalUsers)}
                          $color="#06b6d4"
                        />
                      </Bar>
                    </BarItem>
                  ),
                )}
              </BarContainer>
            </ChartCard>
          </div>

          <div className="col-lg-6">
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
                      {(analytics.willVote?.yes || 0).toLocaleString()} (
                      {getPercentage(analytics.willVote?.yes || 0, totalUsers)}
                      %)
                    </span>
                  </BarLabel>
                  <Bar>
                    <BarFill
                      $width={getPercentage(
                        analytics.willVote?.yes || 0,
                        totalUsers,
                      )}
                      $color="#22c55e"
                    />
                  </Bar>
                </BarItem>
                <BarItem>
                  <BarLabel>
                    <span>Will Not Vote</span>
                    <span>
                      {(analytics.willVote?.no || 0).toLocaleString()} (
                      {getPercentage(analytics.willVote?.no || 0, totalUsers)}%)
                    </span>
                  </BarLabel>
                  <Bar>
                    <BarFill
                      $width={getPercentage(
                        analytics.willVote?.no || 0,
                        totalUsers,
                      )}
                      $color="#ef4444"
                    />
                  </Bar>
                </BarItem>
                <BarItem>
                  <BarLabel>
                    <span>Not Sure</span>
                    <span>
                      {(analytics.willVote?.notSure || 0).toLocaleString()} (
                      {getPercentage(
                        analytics.willVote?.notSure || 0,
                        totalUsers,
                      )}
                      %)
                    </span>
                  </BarLabel>
                  <Bar>
                    <BarFill
                      $width={getPercentage(
                        analytics.willVote?.notSure || 0,
                        totalUsers,
                      )}
                      $color="#f59e0b"
                    />
                  </Bar>
                </BarItem>
              </BarContainer>
            </ChartCard>
          </div>
        </div>

        {/* County Stats Section */}
        {countyStats.length > 0 && (
          <div className="row g-4 mb-4">
            <div className="col-12">
              <ChartCard>
                <ChartTitle>
                  <MapPin size={18} />
                  Top Counties by User Count
                </ChartTitle>
                <BarContainer>
                  {countyStats.slice(0, 10).map((county, idx) => (
                    <BarItem key={idx}>
                      <BarLabel>
                        <span>{county.county || county.name}</span>
                        <span>
                          {(
                            county.total_users ||
                            county.count ||
                            0
                          ).toLocaleString()}{" "}
                          (
                          {getPercentage(
                            county.total_users || county.count || 0,
                            totalUsers,
                          )}
                          %)
                        </span>
                      </BarLabel>
                      <Bar>
                        <BarFill
                          $width={getPercentage(
                            county.total_users || county.count || 0,
                            totalUsers,
                          )}
                          $color="#f97316"
                        />
                      </Bar>
                    </BarItem>
                  ))}
                </BarContainer>
              </ChartCard>
            </div>
          </div>
        )}
      </div>
    </DashboardContainer>
  );
};

export default UsersAdmin;
