import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  ShieldCheck,
  LogOut,
  AtSign,
  Award,
  MapPin,
  User,
  Mail,
  Calendar,
  Briefcase,
  Flag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import walletApi from "./ApiConfig"; // Import the wallet API
import userApi from "./userApiConfig"; // Create this for user API calls

// Components
import Header from "./Wallet";

const ProfileWrapper = styled.div`
  background: #000000;
  min-height: 100vh;
  padding-bottom: 40px;
  color: white;
`;

const SectionContainer = styled.div`
  margin: 12px 16px;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.03);
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);

  .stat-value {
    font-size: 20px;
    font-weight: 800;
    color: #10b981;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
  }

  svg {
    color: #10b981;
    flex-shrink: 0;
  }

  .info-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    min-width: 100px;
  }

  .info-value {
    font-size: 13px;
    font-weight: 500;
    color: white;
  }
`;

// Auth Service to get current user
const getCurrentUser = () => {
  const userData = localStorage.getItem("user_data");
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (e) {
      return null;
    }
  }
  return null;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    endorsements: 0,
    supporters: 0,
    points: 0,
  });

  // Get logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        // First try localStorage
        const localUser = getCurrentUser();
        if (localUser && localUser.user_id) {
          setUserData(localUser);
          fetchUserStats(localUser.user_id);
          setLoading(false);
          return;
        }

        // If not in localStorage, try cookie using walletApi
        const response = await walletApi.get("/user-info");

        if (response.data.success) {
          const user = response.data.user;
          const userInfo = {
            user_id: user.user_id,
            username: user.username,
            real_name: user.real_name,
            county: user.county,
            ward: user.ward,
            voter_status: user.voter_card
              ? "Registered Voter"
              : "Not Registered",
            role: user.role,
            political_party: user.political_party,
            employment_status: user.employment_status,
            age_bracket: user.age_bracket,
            email: user.email,
          };

          setUserData(userInfo);
          localStorage.setItem("user_data", JSON.stringify(userInfo));
          fetchUserStats(user.user_id);
        } else {
          setError("No user data found");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    const fetchUserStats = async (userId) => {
      try {
        const response = await walletApi.get(`/users/${userId}/stats`);
        if (response.data.success) {
          setStats({
            endorsements: response.data.data.endorsements_given || 0,
            supporters: response.data.data.endorsements_received || 0,
            points: response.data.data.total_points || 0,
          });
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const csrfToken = localStorage.getItem("csrf_token");
      await walletApi.post(
        "/auth/logout",
        {},
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        },
      );
      // Clear local storage
      localStorage.removeItem("user_data");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("csrf_token");
      // Redirect to login
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      // Still clear local data
      localStorage.removeItem("user_data");
      localStorage.removeItem("isAuthenticated");
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <ProfileWrapper>
        <Header />
        <SectionContainer>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <LoadingSpinner />
            <p style={{ marginTop: 12, color: "rgba(255,255,255,0.5)" }}>
              Loading profile...
            </p>
          </div>
        </SectionContainer>
      </ProfileWrapper>
    );
  }

  if (error || !userData) {
    return (
      <ProfileWrapper>
        <Header />
        <SectionContainer>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <ShieldCheck size={48} color="#ef4444" />
            <p style={{ marginTop: 12, color: "rgba(255,255,255,0.7)" }}>
              {error || "User not found"}
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{
                marginTop: 20,
                background: "#10b981",
                border: "none",
                padding: "10px 24px",
                borderRadius: "8px",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Go to Login
            </button>
          </div>
        </SectionContainer>
      </ProfileWrapper>
    );
  }

  return (
    <ProfileWrapper>
      {/* Wallet & Header */}
      <Header />

      {/* Profile Section */}
      <SectionContainer>
        {/* Username Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 800,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Profile
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "4px",
              }}
            >
              <AtSign size={16} color="#10b981" />
              <span
                style={{ fontSize: "18px", fontWeight: 800, color: "#fff" }}
              >
                {userData.username || userData.real_name || "User"}
              </span>
            </div>
          </div>
          <div
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "10px",
              fontWeight: 700,
              color: "#10b981",
            }}
          >
            {userData.role === "verified"
              ? "VERIFIED"
              : userData.role === "admin"
                ? "ADMIN"
                : "ACTIVE"}
          </div>
        </div>

        {/* User Full Name */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            padding: "12px",
            borderRadius: "12px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <User size={14} color="#10b981" />
            <span style={{ fontSize: "14px", fontWeight: 600, color: "white" }}>
              {userData.real_name || userData.username}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "8px",
              fontSize: "11px",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <MapPin size={10} /> {userData.ward || userData.county || "Kenya"}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Award size={10} /> {userData.voter_status || "Voter"}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <StatsGrid>
          <StatCard>
            <div className="stat-value">{stats.endorsements}</div>
            <div className="stat-label">Endorsements</div>
          </StatCard>
          <StatCard>
            <div className="stat-value">{stats.supporters}</div>
            <div className="stat-label">Supporters</div>
          </StatCard>
          <StatCard>
            <div className="stat-value">{stats.points}</div>
            <div className="stat-label">Points</div>
          </StatCard>
        </StatsGrid>

        {/* Additional Information */}
        <div style={{ marginTop: "20px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "1px",
              marginBottom: "12px",
              textTransform: "uppercase",
            }}
          >
            Personal Information
          </div>

          {userData.political_party && (
            <InfoRow>
              <Flag size={14} />
              <span className="info-label">Political Party</span>
              <span className="info-value">{userData.political_party}</span>
            </InfoRow>
          )}

          {userData.age_bracket && (
            <InfoRow>
              <Calendar size={14} />
              <span className="info-label">Age Bracket</span>
              <span className="info-value">{userData.age_bracket}</span>
            </InfoRow>
          )}

          {userData.employment_status && (
            <InfoRow>
              <Briefcase size={14} />
              <span className="info-label">Employment</span>
              <span className="info-value">{userData.employment_status}</span>
            </InfoRow>
          )}

          {userData.email && (
            <InfoRow>
              <Mail size={14} />
              <span className="info-label">Email</span>
              <span className="info-value">{userData.email}</span>
            </InfoRow>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            background: "rgba(239,68,68,0.08)",
            border: "none",
            marginTop: "24px",
            padding: "14px",
            borderRadius: "12px",
            color: "#f87171",
            fontSize: "13px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.08)";
          }}
        >
          <LogOut size={16} /> Log-Out Siasa-Hub
        </button>
      </SectionContainer>
    </ProfileWrapper>
  );
};

export default ProfilePage;
