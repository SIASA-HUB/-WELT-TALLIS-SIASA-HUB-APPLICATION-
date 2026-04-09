// pages/LeadersPage.jsx - Complete Personalized Feed with Images Fixed
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  Suspense,
  lazy,
} from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import LoadingBar from "react-top-loading-bar";
import axios from "axios";
import {
  Search,
  X,
  TrendingUp,
  UserPlus,
  Clock,
  MapPin,
  Star,
  Flame,
} from "lucide-react";
import { useAuth } from "../Hooks/useAuth";
import TrendingManifestos from "./manifestos/TredingManifestos";

const LeaderCard = lazy(() => import("./leadersCard"));

const API_BASE_URL = "http://localhost:8002/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  padding-bottom: 60px;
  background: #ffffff;
`;

const LoadingWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99999;
  pointer-events: none;
`;

const StickySearchWrapper = styled.div`
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: ${(props) =>
    props.$hasScroll ? "0 2px 8px rgba(0, 0, 0, 0.05)" : "none"};
  transition: box-shadow 0.2s ease;
`;

const SearchContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  gap: 12px;
  align-items: center;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 35px 8px 32px;
  font-size: 13px;
  font-weight: 500;
  border: 1.5px solid ${(props) => (props.$focused ? "#000" : "#e5e7eb")};
  border-radius: 20px;
  background: ${(props) => (props.$focused ? "#ffffff" : "#f9fafb")};
  transition: all 0.2s ease;
  outline: none;

  &::placeholder {
    color: #9ca3af;
    font-weight: 400;
    font-size: 12px;
  }

  &:focus {
    background: #ffffff;
    border-color: #000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  transition: all 0.2s;
  border-radius: 50%;

  &:hover {
    color: #000;
    background: rgba(0, 0, 0, 0.05);
  }
`;

const RegisterButton = styled.button`
  background: #000;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background: #333;
    transform: translateY(-1px);
  }
`;

const Section = styled.div`
  margin-bottom: 32px;
  animation: ${fadeIn} 0.5s ease-out both;
  animation-delay: ${(props) => props.$delay || "0s"};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  margin-bottom: 12px;
  margin-top: 16px;

  h2 {
    font-size: 16px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #000;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .count {
    font-size: 13px;
    color: #666;
    font-weight: 500;
    background: #f5f5f5;
    padding: 4px 10px;
    border-radius: 20px;
  }
`;

const SectionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${(props) =>
    props.$type === "presidential" ? "#ff000010" : "#f0f0f0"};
  color: ${(props) => (props.$type === "presidential" ? "#ff0000" : "#666")};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
`;

const Tray = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 0 20px 10px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  & > * {
    flex-shrink: 0;
  }
`;

const SkeletonCard = styled.div`
  width: 260px;
  height: 140px;
  background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${pulse} 1.5s ease-in-out infinite;
  border-radius: 12px;
  flex-shrink: 0;
`;

const SkeletonLeaderCard = styled.div`
  width: 200px;
  height: 120px;
  background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${pulse} 1.5s ease-in-out infinite;
  border-radius: 10px;
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  padding: 80px 20px;
  text-align: center;
  color: #999;
  font-size: 14px;

  svg {
    margin-bottom: 16px;
    color: #ccc;
  }
`;

const LeadersPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [feedGroups, setFeedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const loadingBarRef = useRef(null);
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch personalized feed
  useEffect(() => {
    const fetchPersonalizedFeed = async () => {
      if (dataFetchedRef.current) return;

      if (loadingBarRef.current) {
        loadingBarRef.current.continuousStart(30);
      }

      try {
        const response = await api.get("/leaders", {
          params: { limit: 300 },
          withCredentials: true,
        });

        if (response.data?.success) {
          setFeedGroups(response.data.data || []);
          setUserInfo(response.data.userInfo);
          setError(null);
        } else {
          setFeedGroups([]);
          setError("No data available");
        }

        dataFetchedRef.current = true;
      } catch (err) {
        console.error("Error fetching personalized feed:", err);
        setError(err.message || "Failed to load leaders");
        setFeedGroups([]);
      } finally {
        setLoading(false);
        if (loadingBarRef.current) {
          loadingBarRef.current.complete();
        }
      }
    };

    fetchPersonalizedFeed();
  }, []);

  // Filter leaders based on search term
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return feedGroups;

    const term = searchTerm.toLowerCase().trim();

    return feedGroups
      .map((group) => ({
        ...group,
        leaders: group.leaders.filter(
          (leader) =>
            leader.name?.toLowerCase().includes(term) ||
            leader.party?.toLowerCase().includes(term) ||
            leader.position?.toLowerCase().includes(term) ||
            leader.county?.toLowerCase().includes(term) ||
            leader.constituency?.toLowerCase().includes(term),
        ),
      }))
      .filter((group) => group.leaders.length > 0);
  }, [feedGroups, searchTerm]);

  const totalLeaders = useMemo(() => {
    return filteredGroups.reduce((sum, group) => sum + group.leaders.length, 0);
  }, [filteredGroups]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleRegisterClick = () => {
    navigate("/register-aspirant");
  };

  if (loading) {
    return (
      <PageWrapper>
        <LoadingWrapper>
          <LoadingBar ref={loadingBarRef} color="#000" height={2} />
        </LoadingWrapper>
        <StickySearchWrapper>
          <SearchContainer>
            <SearchInputWrapper>
              <SearchIcon>
                <Search size={14} />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search aspirant..."
                disabled
                style={{ background: "#f0f0f0" }}
              />
            </SearchInputWrapper>
            <RegisterButton disabled style={{ opacity: 0.5 }}>
              <UserPlus size={14} /> Register
            </RegisterButton>
          </SearchContainer>
        </StickySearchWrapper>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {[1, 2, 3].map((i) => (
            <Section key={i}>
              <SectionHeader>
                <h2>Loading...</h2>
                <span className="count">—</span>
              </SectionHeader>
              <Tray>
                <SkeletonCard />
                <SkeletonLeaderCard />
                <SkeletonLeaderCard />
              </Tray>
            </Section>
          ))}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <LoadingWrapper>
        <LoadingBar ref={loadingBarRef} color="#000" height={2} />
      </LoadingWrapper>

      <StickySearchWrapper $hasScroll={hasScrolled}>
        <SearchContainer>
          <SearchInputWrapper>
            <SearchIcon>
              <Search size={14} />
            </SearchIcon>
            <SearchInput
              key="search-input"
              type="text"
              placeholder="Search aspirant by name, party, county, constituency..."
              value={searchTerm || ""}
              onChange={(e) => setSearchTerm(e.target.value || "")}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              $focused={isSearchFocused}
            />
            {searchTerm && (
              <ClearButton onClick={clearSearch}>
                <X size={12} />
              </ClearButton>
            )}
          </SearchInputWrapper>
          <RegisterButton onClick={handleRegisterClick}>
            <UserPlus size={14} /> Register Aspirant
          </RegisterButton>
        </SearchContainer>

        <TrendingManifestos leaders={[]} compact={true} />
      </StickySearchWrapper>

      {searchTerm && (
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "12px 20px",
            background: "#f9fafb",
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <TrendingUp size={14} />
            Found <strong>{totalLeaders}</strong> aspirant
            {totalLeaders !== 1 ? "s" : ""} matching "
            <strong>{searchTerm}</strong>"
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group, index) => (
            <Section key={group.title} $delay={`${index * 0.05}s`}>
              <SectionHeader>
                <h2>
                  {group.type === "presidential" && (
                    <Star size={14} color="#ff0000" />
                  )}
                  {group.type === "county" && <MapPin size={14} />}
                  {group.type === "constituency" && <MapPin size={14} />}
                  {group.title}
                  {group.type === "presidential" && (
                    <SectionBadge $type="presidential">
                      🇰🇪 National
                    </SectionBadge>
                  )}
                </h2>
                <span className="count">
                  {group.leaders.length} / {group.total}
                </span>
              </SectionHeader>
              <Tray>
                <Suspense fallback={<SkeletonLeaderCard />}>
                  {group.leaders.map((leader) => (
                    <LeaderCard key={leader.leader_id} leader={leader} />
                  ))}
                </Suspense>
              </Tray>
            </Section>
          ))
        ) : (
          <EmptyState>
            <Search size={48} strokeWidth={1.5} />
            <p>No aspirant found</p>
            {searchTerm && (
              <>
                <p>We couldn't find "{searchTerm}"</p>
                <button
                  onClick={clearSearch}
                  style={{
                    marginTop: 20,
                    padding: "8px 20px",
                    background: "#000",
                    color: "#fff",
                    border: "none",
                    borderRadius: 20,
                    cursor: "pointer",
                  }}
                >
                  Clear search
                </button>
              </>
            )}
          </EmptyState>
        )}
      </div>
    </PageWrapper>
  );
};

export default LeadersPage;
