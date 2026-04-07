// VoterRegistrationCompetition.js - Shows registered users count, navigates to /register
import React, { useEffect, useState, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Trophy,
  Zap,
  TrendingUp,
  Crown,
  Star,
  ArrowRight,
  Users,
  Medal,
} from "lucide-react";
import theme from "../../utils/theme";
import AppLoadingBar from "../../utils/LoadingBar";

const API_URL = "http://localhost:8004/api/v1/users";

// --- ANIMATIONS ---
const numberPop = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); color: ${theme.colors.primary}; }
  100% { transform: scale(1); }
`;

const pulse = keyframes`
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// --- STYLED COMPONENTS ---
const Container = styled.div`
  padding: ${theme.spacing.md} 0;
  border-top: 1px solid rgba(187, 0, 0, 0.2);
  border-bottom: 1px solid rgba(187, 0, 0, 0.2);
  width: 100%;
  cursor: pointer;
  transition: all 0.2s;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
  padding: 0 ${theme.spacing.md};
  pointer-events: none;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  span {
    font-size: ${theme.fontSize.sm};
    font-weight: ${theme.fontWeight.extraBold};
    color: ${theme.colors.primary};
    letter-spacing: 0.5px;
  }
`;

const LiveBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  background: rgba(187, 0, 0, 0.1);
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.xl};

  .dot {
    width: 6px;
    height: 6px;
    background: ${theme.colors.primary};
    border-radius: ${theme.borderRadius.full};
    animation: ${pulse} 1s infinite;
  }

  span {
    font-size: ${theme.fontSize.xs};
    font-weight: ${theme.fontWeight.bold};
    color: ${theme.colors.primary};
  }
`;

const Track = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  overflow-x: auto;
  scrollbar-width: none;
  padding: 0 ${theme.spacing.md} ${theme.spacing.xs};
  pointer-events: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Card = styled.div`
  min-width: 140px;
  background: #000;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm};
  position: relative;
  border: 1px solid
    ${(props) =>
      props.$isTop ? theme.colors.primary : "rgba(255,255,255,0.1)"};
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Rank = styled.div`
  position: absolute;
  top: -0px;
  left: -6px;
  width: 22px;
  height: 22px;
  border-radius: ${theme.borderRadius.full};
  background: ${(props) =>
    props.$rank === 1
      ? "#ffd700"
      : props.$rank === 2
        ? "#c0c0c0"
        : props.$rank === 3
          ? "#cd7f32"
          : theme.colors.muted};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: ${theme.fontWeight.black};
  color: ${(props) => (props.$rank <= 3 ? "#000" : "#fff")};
  border: 1px solid #000;
`;

const County = styled.div`
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.bold};
  margin-left: 10px;
  color: ${theme.colors.muted};
  margin-bottom: ${theme.spacing.xs};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Value = styled.div`
  font-size: ${theme.fontSize.xl};
  font-weight: ${theme.fontWeight.black};
  color: ${(props) => (props.$isTop ? theme.colors.primary : "#fff")};
  margin: ${theme.spacing.xs} 0;
  ${(props) =>
    props.$active &&
    css`
      animation: ${numberPop} 0.3s ease-out;
    `}
`;

const Progress = styled.div`
  height: 3px;
  border-radius: ${theme.borderRadius.xs};
  overflow: hidden;
  margin: ${theme.spacing.sm} 0;

  div {
    width: ${(props) => props.$width}%;
    height: 100%;
    background: ${(props) => (props.$isTop ? theme.colors.primary : "#fff")};
  }
`;

const Button = styled.button`
  width: 100%;
  background: ${(props) =>
    props.$isTop ? theme.colors.primary : "rgba(187, 0, 0, 0.15)"};
  border: none;
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.xs};
  margin-top: ${theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.extraBold};
  color: ${(props) => (props.$isTop ? "#000" : theme.colors.primary)};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    background: ${(props) =>
      props.$isTop ? "#cc0000" : "rgba(187, 0, 0, 0.25)"};
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md} 0;
  pointer-events: auto;
`;

const TotalCount = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.muted};

  strong {
    color: ${theme.colors.primary};
    font-size: ${theme.fontSize.md};
  }
`;

const JoinButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  background: ${theme.colors.primary};
  border: none;
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.bold};
  color: #000;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    gap: ${theme.spacing.md};
    background: #cc0000;
    transform: translateX(2px);
  }
`;

const LoadingCard = styled.div`
  min-width: 140px;
  background: #000;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm};
  border: 1px solid rgba(255, 255, 255, 0.1);

  .skeleton {
    background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s infinite;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .skeleton-title {
    height: 16px;
    width: 70%;
    margin-left: 10px;
  }

  .skeleton-value {
    height: 24px;
    width: 60%;
    margin: 8px 0;
  }

  .skeleton-progress {
    height: 3px;
    width: 100%;
  }

  .skeleton-button {
    height: 28px;
    width: 100%;
    margin-top: 8px;
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 20px;
  color: ${theme.colors.muted};

  svg {
    margin-bottom: 8px;
  }
`;

const VoterRegistrationCompetition = () => {
  const navigate = useNavigate();
  const [countiesData, setCountiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const loadingBarRef = useRef(null);

  // Fetch real data from backend
  useEffect(() => {
    const fetchCountyStats = async () => {
      try {
        setLoading(true);
        loadingBarRef.current?.continuousStart();

        const response = await axios.get(`${API_URL}/county/stats`);

        if (response.data.success) {
          const { countyStats } = response.data.data;

          // Transform data for display
          const transformedData = countyStats
            .filter((c) => c.county && c.county !== "Unknown")
            .map((county, index) => ({
              id: index + 1,
              name: county.county,
              registered: county.total_users,
              percentage: county.percentage || 0,
            }));

          // Sort by registered descending
          const sortedData = transformedData.sort(
            (a, b) => b.registered - a.registered,
          );

          // Calculate total registered users
          const total = sortedData.reduce((sum, c) => sum + c.registered, 0);
          setTotalUsers(total);

          // Get top counties
          const topCounties = sortedData.slice(0, 6);
          setCountiesData(topCounties);
        } else {
          setError("Failed to load county data");
        }
      } catch (err) {
        console.error("Error fetching county stats:", err);
        setError("Could not load registration data");
      } finally {
        setLoading(false);
        loadingBarRef.current?.complete();
      }
    };

    fetchCountyStats();

    // Refresh every 30 seconds
    const interval = setInterval(fetchCountyStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const handleCardClick = () => {
    navigate("/register");
  };

  const handleJoinClick = (e) => {
    e.stopPropagation();
    navigate("/register");
  };

  const handleContainerClick = () => {
    navigate("/register");
  };

  if (loading) {
    return (
      <>
        <AppLoadingBar ref={loadingBarRef} />
        <Container>
          <Header>
            <Title>
              <Trophy
                size={14}
                color={theme.colors.primary}
                fill={theme.colors.primary}
              />
              <span>Join the Movement</span>
            </Title>
            <LiveBadge>
              <div className="dot" />
              <span>LIVE</span>
            </LiveBadge>
          </Header>
          <Track>
            {[1, 2, 3, 4].map((i) => (
              <LoadingCard key={i}>
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-value" />
                <div className="skeleton skeleton-progress" />
                <div className="skeleton skeleton-button" />
              </LoadingCard>
            ))}
          </Track>
        </Container>
      </>
    );
  }

  if (error || countiesData.length === 0) {
    return (
      <>
        <AppLoadingBar ref={loadingBarRef} />
        <Container>
          <Header>
            <Title>
              <Trophy
                size={14}
                color={theme.colors.primary}
                fill={theme.colors.primary}
              />
              <span>Join the Movement</span>
            </Title>
            <LiveBadge>
              <div className="dot" />
              <span>LIVE</span>
            </LiveBadge>
          </Header>
          <ErrorContainer>
            <Users size={32} />
            <p>{error || "No data available"}</p>
          </ErrorContainer>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppLoadingBar ref={loadingBarRef} />
      <Container onClick={handleContainerClick}>
        <Header>
          <Title>
            <Trophy
              size={14}
              color={theme.colors.primary}
              fill={theme.colors.primary}
            />
            <span>Join the Movement</span>
          </Title>
          <LiveBadge>
            <div className="dot" />
            <span>LIVE</span>
          </LiveBadge>
        </Header>

        <Track>
          {countiesData.map((county, i) => (
            <Card
              key={county.id}
              $isTop={i === 0}
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
            >
              <Rank $rank={i + 1}>
                {i === 0 ? (
                  <Crown size={10} />
                ) : i === 1 ? (
                  <Star size={8} />
                ) : i === 2 ? (
                  <Medal size={8} />
                ) : (
                  i + 1
                )}
              </Rank>

              <County>
                {county.name}
                <span style={{ color: "#22c55e", fontSize: 9 }}>
                  <TrendingUp size={8} /> #{i + 1}
                </span>
              </County>

              <Value $isTop={i === 0}>
                {i === 0
                  ? formatNumber(county.registered)
                  : county.registered.toLocaleString()}
              </Value>

              <Progress $width={county.percentage} $isTop={i === 0}>
                <div />
              </Progress>

              <div
                style={{
                  fontSize: theme.fontSize.xs,
                  color: theme.colors.muted,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{Math.round(county.percentage || 0)}%</span>
              </div>

              <Button
                $isTop={i === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
              >
                <Zap size={10} />
                JOIN
              </Button>
            </Card>
          ))}
        </Track>

        <Footer>
          <TotalCount>
            <Users size={12} color={theme.colors.primary} />
            <span>
              <strong>{formatNumber(totalUsers)}</strong> Joined Nationwide
            </span>
          </TotalCount>
          <JoinButton onClick={handleJoinClick}>
            JOIN NOW <ArrowRight size={12} />
          </JoinButton>
        </Footer>
      </Container>
    </>
  );
};

export default VoterRegistrationCompetition;
