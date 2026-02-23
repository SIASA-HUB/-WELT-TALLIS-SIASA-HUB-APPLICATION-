import React, { useState } from "react";
import styled from "styled-components";
import {
  CheckCircle2,
  Info,
  UserPlus,
  LogOut,
  ChevronRight,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- COMPONENTS ---
import HeroSection from "./heroSection";
import RegistrationCenters from "./registrationCentres";
import CampaignProgressCard from "./campaingProcessCard";
import StatsGrid from "./statsGrid";
import PinnedVideos from "./pinnedVideos";
import EngagementStats from "./engegemnetStats";
import Footer from "./footer";

const ProfileWrapper = styled.div`
  background: #f1f5f9; /* Slightly darker background to make white cards pop */
  min-height: 100vh;
  padding-bottom: 110px;
`;

const SectionContainer = styled.div`
  background: white;
  margin: 12px 16px;
  border-radius: 28px;
  padding: 24px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  background: ${(props) => (props.$active ? "#dcfce7" : "#fff7ed")};
  color: ${(props) => (props.$active ? "#15803d" : "#ea580c")};
  border: 1px solid ${(props) => (props.$active ? "#bbf7d0" : "#ffedd5")};
`;

const VerifiedBanner = styled.div`
  margin-top: 15px;
  padding: 16px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 18px;
  border: 1px solid #bbf7d0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 15px;
`;

const SleekButton = styled.button`
  background: ${(props) => (props.$danger ? "#fff1f2" : "#f8fafc")};
  color: ${(props) => (props.$danger ? "#e11d48" : "#1e293b")};
  padding: 16px;
  border-radius: 18px;
  font-weight: 700;
  border: 1px solid ${(props) => (props.$danger ? "#ffe4e6" : "#e2e8f0")};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
    background: #f1f5f9;
  }

  span {
    font-size: 11px;
    opacity: 0.7;
    font-weight: 500;
  }
`;

const ProfilePage = () => {
  const navigate = useNavigate();

  // State for all user data
  const [userData, setUserData] = useState({
    username: "Anon-KE-4RYP",
    county: "Machakos",
    ward: "Machakos Town",
    voter_status: "Not Registered", // Toggle to "Registered" to see verified view
    will_vote: false,
    gender: "Female",
    age_bracket: "18-25",
    generation: "Gen Z",
  });

  const isRegistered = userData.voter_status === "Registered";

  return (
    <ProfileWrapper>
      {/* 1. HERO - Profile Identity */}
      <HeroSection userData={userData} setUserData={setUserData} />

      {/* 2. STATS OVERVIEW - Earnings & Engagement */}
      <StatsGrid stats={{ earnings: 4250, shares: 45, likes: 312 }} />

      {/* 3. VOTER REGISTRY - The Core Analysis Component */}
      <SectionContainer>
        <SectionHeader>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 900,
                color: "#0f172a",
              }}
            >
              Voter Power
            </h3>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
              Registry & Analytics
            </p>
          </div>
          <StatusBadge $active={isRegistered}>
            {isRegistered ? <CheckCircle2 size={14} /> : <Info size={14} />}
            {userData.voter_status.toUpperCase()}
          </StatusBadge>
        </SectionHeader>

        {!isRegistered ? (
          /* This shows the sleek click-counter and generation progress bars we built */
          <RegistrationCenters county={userData.county} />
        ) : (
          <VerifiedBanner>
            <div
              style={{
                background: "white",
                padding: "10px",
                borderRadius: "12px",
              }}
            >
              <ShieldCheck size={24} color="#15803d" />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  color: "#166534",
                  fontSize: "14px",
                  fontWeight: 800,
                }}
              >
                Mission Complete
              </p>
              <p
                style={{
                  margin: 0,
                  color: "#166534",
                  fontSize: "12px",
                  opacity: 0.8,
                }}
              >
                You are registered in {userData.ward}, {userData.county}.
              </p>
            </div>
          </VerifiedBanner>
        )}
      </SectionContainer>

      {/* 4. CAMPAIGN PROGRESS - Gamification */}
      <CampaignProgressCard campaignProgress={82} />

      {/* 5. MEDIA - Pinned Content */}
      <div style={{ padding: "0 16px" }}>
        <h4
          style={{
            margin: "10px 0",
            fontSize: "13px",
            fontWeight: 800,
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          PINNED CONTENT <ChevronRight size={14} />
        </h4>
      </div>
      <PinnedVideos />

      {/* 6. ENGAGEMENT - Detailed Feedback */}
      <EngagementStats stats={{ likes: 312, dislikes: 18 }} />

      {/* 7. ACCOUNT MANAGEMENT */}
      <SectionContainer>
        <SectionHeader>
          <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800 }}>
            Settings
          </h3>
          <Settings size={18} color="#94a3b8" />
        </SectionHeader>

        <ActionGrid>
          <SleekButton onClick={() => navigate("/register")}>
            <UserPlus size={20} />
            Add User
            <span>Multi-account</span>
          </SleekButton>

          <SleekButton
            $danger
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
          >
            <LogOut size={20} />
            Sign Out
            <span>Exit Session</span>
          </SleekButton>
        </ActionGrid>
      </SectionContainer>

      {/* 8. FOOTER - Navigation */}
      <Footer />
    </ProfileWrapper>
  );
};

export default ProfilePage;
