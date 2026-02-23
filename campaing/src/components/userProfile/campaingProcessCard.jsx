import React from "react";
import styled, { keyframes } from "styled-components";
import { Target, Trophy, ChevronRight } from "lucide-react";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const InfoCard = styled.div`
  background: white;
  margin: 20px 15px;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  animation: ${fadeIn} 0.8s ease-out;
`;

const ProgressBarContainer = styled.div`
  height: 12px;
  background: #f1f5f9;
  border-radius: 20px;
  margin: 16px 0;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #bb0000, #ff4444);
  border-radius: 20px;
  width: ${(props) => props.$progress || 0}%;
  transition: width 1s cubic-bezier(0.1, 0.5, 0.5, 1);
`;

const RankBadge = styled.div`
  background: #fef2f2;
  color: #bb0000;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CampaignProgressCard = ({ campaignProgress = 82 }) => {
  // Logic to determine level based on progress
  const level = Math.floor(campaignProgress / 10) || 1;
  const nextLevelProgress = campaignProgress % 100;

  return (
    <InfoCard>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h4
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 900,
              color: "#0f172a",
            }}
          >
            Level {level}
          </h4>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "13px",
              color: "#64748b",
              fontWeight: 600,
            }}
          >
            {campaignProgress}% to Campaign Master
          </p>
        </div>
        <RankBadge>
          <Trophy size={14} />
          PRO ADVOCATE
        </RankBadge>
      </div>

      <ProgressBarContainer>
        <ProgressFill $progress={campaignProgress} />
      </ProgressBarContainer>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Target size={16} color="white" />
          </div>
          <div>
            <div
              style={{
                fontSize: "11px",
                color: "#94a3b8",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Current Goal
            </div>
            <div
              style={{ fontSize: "13px", color: "#1e293b", fontWeight: 800 }}
            >
              Reach Level {level + 1}
            </div>
          </div>
        </div>

        <button
          style={{
            background: "none",
            border: "none",
            color: "#BB0000",
            fontWeight: 800,
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          Details <ChevronRight size={16} />
        </button>
      </div>
    </InfoCard>
  );
};

export default CampaignProgressCard;
