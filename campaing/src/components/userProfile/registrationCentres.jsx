import React, { useState } from "react";
import styled from "styled-components";
import {
  ExternalLink,
  MousePointer2,
  ShieldCheck,
  Users,
  UserMinus,
  Globe,
  Search,
  MapPinned,
  BarChart3,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

const Container = styled.div`
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatsHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 5px;
`;

const StatCard = styled.div`
  background: ${(props) => props.$bg || "#f8fafc"};
  padding: 10px 8px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 9px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 2px;
`;

const StatValue = styled.div`
  font-size: 13px;
  font-weight: 900;
  color: #1e293b;
`;

/* --- GENERATION ANALYSIS STYLES --- */
const AnalysisSection = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
`;

const GenRow = styled.div`
  margin-bottom: 14px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const GenInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const GenLabel = styled.div`
  font-size: 11px;
  font-weight: 800;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const GenPercent = styled.div`
  font-size: 11px;
  font-weight: 900;
  color: ${(props) => props.$color};
`;

const ProgressBar = styled.div`
  height: 10px;
  background: #f1f5f9;
  border-radius: 20px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  width: ${(props) => props.$width}%;
  background: ${(props) => props.$color};
  height: 100%;
  border-radius: 20px;
  transition: width 1s ease-in-out;
`;

const ActionCard = styled.div`
  background: ${(props) => (props.$primary ? "#1e293b" : "white")};
  border-radius: 16px;
  padding: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid ${(props) => (props.$primary ? "#1e293b" : "#e2e8f0")};
  cursor: pointer;
  transition: transform 0.2s;
  &:active {
    transform: scale(0.98);
  }
`;

const ClickBadge = styled.div`
  font-size: 10px;
  background: ${(props) => (props.$primary ? "#334155" : "#f1f5f9")};
  color: ${(props) => (props.$primary ? "#cbd5e1" : "#475569")};
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 700;
  margin-top: 6px;
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RegistrationCenters = () => {
  const [centreClicks, setCentreClicks] = useState(42150);
  const [verifyClicks, setVerifyClicks] = useState(12840);

  // Mapped directly from your backend generation labels
  const generations = [
    { label: "Gen Z", range: "18-25", percent: 42, color: "#ef4444" }, // Red (Failing)
    { label: "Millennial", range: "26-35", percent: 68, color: "#f59e0b" }, // Orange (Medium)
    { label: "Gen X", range: "36-55", percent: 85, color: "#3b82f6" }, // Blue (Good)
    { label: "Boomer", range: "56+", percent: 94, color: "#10b981" }, // Green (Leading)
  ];

  return (
    <Container>
      {/* 1. PLATFORM HUD */}
      <StatsHeader>
        <StatCard>
          <StatLabel>With Card</StatLabel>
          <StatValue style={{ color: "#10b981" }}>820</StatValue>
        </StatCard>
        <StatCard $bg="#fff1f2">
          <StatLabel>No Card</StatLabel>
          <StatValue style={{ color: "#ef4444" }}>630</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Total Users</StatLabel>
          <StatValue>1,450</StatValue>
        </StatCard>
      </StatsHeader>

      {/* 2. ALL GENERATIONS ANALYSIS */}
      <AnalysisSection>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <TrendingUp size={16} color="#1e293b" />
            <span style={{ fontSize: "13px", fontWeight: 900 }}>
              Voter Ready by Generation
            </span>
          </div>
          <AlertCircle size={16} color="#94a3b8" />
        </div>

        {generations.map((gen, index) => (
          <GenRow key={index}>
            <GenInfo>
              <GenLabel>
                {gen.label}{" "}
                <span style={{ fontWeight: 400, color: "#94a3b8" }}>
                  ({gen.range})
                </span>
              </GenLabel>
              <GenPercent $color={gen.color}>{gen.percent}%</GenPercent>
            </GenInfo>
            <ProgressBar>
              <ProgressFill $width={gen.percent} $color={gen.color} />
            </ProgressBar>
          </GenRow>
        ))}

        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            background: "#f8fafc",
            borderRadius: "10px",
            fontSize: "10px",
            color: "#64748b",
            textAlign: "center",
          }}
        >
          <b>Insight:</b> Gen Z is at the highest risk. Target your campaigns to
          the 18-25 bracket.
        </div>
      </AnalysisSection>

      {/* 3. EXTERNAL ACTIONS */}
      <ActionCard
        $primary
        onClick={() => {
          setCentreClicks((c) => c + 1);
          window.open("https://www.iebc.or.ke/registration/?where");
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: "15px",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <MapPinned size={18} color="#ef4444" /> Official Centres
          </div>
          <ClickBadge $primary>
            <MousePointer2 size={10} /> {centreClicks.toLocaleString()} Searches
          </ClickBadge>
        </div>
        <ExternalLink size={20} color="white" />
      </ActionCard>

      <ActionCard
        onClick={() => {
          setVerifyClicks((v) => v + 1);
          window.open("https://verify.iebc.or.ke/");
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: "15px",
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ShieldCheck size={18} color="#10b981" /> Verify My Status
          </div>
          <ClickBadge>
            <MousePointer2 size={10} /> {verifyClicks.toLocaleString()} Checks
          </ClickBadge>
        </div>
        <Search size={20} color="#64748b" />
      </ActionCard>
    </Container>
  );
};

export default RegistrationCenters;
