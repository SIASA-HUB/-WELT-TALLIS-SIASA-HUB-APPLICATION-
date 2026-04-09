import React, { useState, useEffect, memo, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Flame, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import RallyCard from "./rallycard";

import { API_BASE_URL } from "./apiConfig";

// --- ANIMATIONS ---
const slideIn = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const glow = keyframes`
  0% { filter: drop-shadow(0 0 2px rgba(187, 0, 0, 0.4)); }
  50% { filter: drop-shadow(0 0 6px rgba(187, 0, 0, 0.7)); }
  100% { filter: drop-shadow(0 0 2px rgba(187, 0, 0, 0.4)); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// --- STYLED COMPONENTS ---
const SectionWrapper = styled.section`
  margin: 8px 0 24px 0;
`;

const CompactHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  margin-bottom: 12px;
`;

const LeftStack = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .fire-icon {
    color: #bb0000;
    animation: ${glow} 2s infinite;
  }

  .main-title {
    font-size: 16px;
    font-weight: 900;
    color: #000;
    letter-spacing: -0.2px;
    text-transform: uppercase;
  }
`;

const ViewAllAction = styled.button`
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #bb0000;
    border-color: #bb0000;
    background: rgba(187, 0, 0, 0.05);
  }
`;

const CardsContainer = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 0 16px 10px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const SnapItem = styled.div`
  flex-shrink: 0;
  animation: ${slideIn} 0.4s ease-out both;
  animation-delay: ${(props) => props.$index * 0.08}s;
`;

const MoreCircle = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(187, 0, 0, 0.05);
    border-color: #bb0000;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ErrorContainer = styled.div`
  margin: 20px 16px;
  padding: 20px;
  background: rgba(187, 0, 0, 0.05);
  border: 1px solid rgba(187, 0, 0, 0.2);
  border-radius: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  p {
    color: #666;
    font-size: 13px;
    margin: 0;
  }
`;

const RetryButton = styled.button`
  background: #bb0000;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: #dd0000;
    transform: translateY(-2px);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 20px 16px;
  padding: 20px;

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(187, 0, 0, 0.2);
    border-top-color: #bb0000;
    border-radius: 50%;
    animation: ${pulse} 1s linear infinite;
  }

  p {
    color: #666;
    font-size: 12px;
  }
`;

const RalliesSection = ({ limit = 6 }) => {
  const navigate = useNavigate();
  const [rallies, setRallies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchedRef = useRef(false);

  const fetchRallies = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("📡 Fetching rallies from:", `${API_BASE_URL}/rallies`);

      const res = await axios.get(`${API_BASE_URL}/rallies`, {
        timeout: 15000,
        headers: {
          Accept: "application/json",
        },
      });

      console.log("✅ Rallies response:", res.data);

      if (res.data?.success && Array.isArray(res.data?.data)) {
        const sorted = res.data.data.sort(
          (a, b) => (b.likes_count || 0) - (a.likes_count || 0),
        );
        setRallies(sorted);
        localStorage.setItem("siasa_rallies_cache", JSON.stringify(sorted));
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        const sorted = res.data.data.sort(
          (a, b) => (b.likes_count || 0) - (a.likes_count || 0),
        );
        setRallies(sorted);
        localStorage.setItem("siasa_rallies_cache", JSON.stringify(sorted));
      } else if (Array.isArray(res.data)) {
        const sorted = res.data.sort(
          (a, b) => (b.likes_count || 0) - (a.likes_count || 0),
        );
        setRallies(sorted);
        localStorage.setItem("siasa_rallies_cache", JSON.stringify(sorted));
      } else {
        throw new Error("Invalid data format");
      }
    } catch (err) {
      console.error("Error fetching rallies:", err);

      let errorMessage = "Failed to load rallies";
      if (err.response) {
        errorMessage = `Server error: ${err.response.status}`;
        console.error("Response data:", err.response.data);
      } else if (err.request) {
        errorMessage =
          "No response from server. Please check if server is running.";
        console.error("No response received");
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);

      // Try to load from cache
      const cached = localStorage.getItem("siasa_rallies_cache");
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          if (cachedData.length) {
            setRallies(cachedData);
            setError(null);
            console.log("📦 Loaded from cache:", cachedData.length, "items");
          }
        } catch (e) {
          console.error("Cache parse error:", e);
        }
      }
    } finally {
      setLoading(false);
      fetchedRef.current = true;
    }
  };

  useEffect(() => {
    if (!fetchedRef.current) {
      // Try to load from cache first for instant display
      const cached = localStorage.getItem("siasa_rallies_cache");
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          if (cachedData.length) {
            setRallies(cachedData);
            setLoading(false);
            console.log(
              "📦 Loaded from cache on mount:",
              cachedData.length,
              "items",
            );
          }
        } catch (e) {
          console.error("Cache parse error:", e);
        }
      }

      fetchRallies();
    }
  }, []);

  // Loading state
  if (loading && !rallies.length) {
    return (
      <SectionWrapper>
        <CompactHeader>
          <LeftStack>
            <Flame size={18} fill="#bb0000" className="fire-icon" />
            <div className="main-title">Upcoming Rallies</div>
          </LeftStack>
        </CompactHeader>
        <LoadingContainer>
          <div className="spinner" />
          <p>Loading rallies...</p>
        </LoadingContainer>
      </SectionWrapper>
    );
  }

  // Error state with retry
  if (error && !rallies.length) {
    return (
      <SectionWrapper>
        <CompactHeader>
          <LeftStack>
            <Flame size={18} fill="#bb0000" className="fire-icon" />
            <div className="main-title">Upcoming Rallies</div>
          </LeftStack>
        </CompactHeader>
        <ErrorContainer>
          <AlertCircle size={24} color="#bb0000" />
          <p>{error}</p>
          <p style={{ fontSize: 11, color: "#999" }}>
            Server may be down. Try again or check back later.
          </p>
          <RetryButton onClick={fetchRallies}>
            <RefreshCw size={14} /> Try Again
          </RetryButton>
        </ErrorContainer>
      </SectionWrapper>
    );
  }

  // No data state
  if (!rallies.length) {
    return null;
  }

  return (
    <SectionWrapper>
      <CompactHeader>
        <LeftStack>
          <Flame size={18} fill="#bb0000" className="fire-icon" />
          <div className="main-title">Upcoming Rallies</div>
        </LeftStack>
        <ViewAllAction onClick={() => navigate("/rallies")}>
          VIEW ALL <ChevronRight size={12} />
        </ViewAllAction>
      </CompactHeader>

      <CardsContainer>
        {rallies.slice(0, limit).map((rally, index) => (
          <SnapItem key={rally.rally_id || index} $index={index}>
            <RallyCard rally={rally} rank={index} />
          </SnapItem>
        ))}

        <SnapItem
          $index={rallies.length}
          onClick={() => navigate("/rallies")}
          style={{ alignSelf: "center", paddingRight: "24px" }}
        >
          <MoreCircle>
            <ChevronRight size={22} color="#475569" />
          </MoreCircle>
        </SnapItem>
      </CardsContainer>
    </SectionWrapper>
  );
};

export default memo(RalliesSection);
