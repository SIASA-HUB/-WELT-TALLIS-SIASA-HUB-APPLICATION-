// pages/LeadersPage.jsx - Fixed version with proper error handling and image URLs

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  Suspense,
  lazy,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import LoadingBar from "react-top-loading-bar";
import { Helmet } from "react-helmet-async";
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
  User,
  Shield,
  Briefcase,
  Users,
  Award,
} from "lucide-react";
import TrendingManifestos from "./manifestos/TredingManifestos";

const LeaderCard = lazy(() => import("./leadersCard"));

// API Configuration
import API from "../../api/config";
import api from "../../api/api";

// ============================================
// IMAGE URL BUILDER - Fix for production
// ============================================
const buildImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl === "null" || imageUrl === "undefined") return null;
  
  // If it's already an absolute URL (http/https), return as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  
  // Get base URL from API config (no hardcoded localhost for production)
  let baseUrl = API.IMAGES || API.BASE;
  
  // If no base URL configured, return null
  if (!baseUrl) return null;
  
  // Remove /api/v1 if present in the base URL
  if (baseUrl.includes("/api/v1")) {
    baseUrl = baseUrl.replace(/\/api\/v1\/?$/, "");
  }
  
  // Remove trailing slash
  baseUrl = baseUrl.replace(/\/$/, "");
  
  // Ensure image path has leading slash
  let imagePath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  
  return `${baseUrl}${imagePath}`;
};

// Helper to get avatar with fallback
const getLeaderAvatar = (leader) => {
  const imageUrl = leader.image || leader.profile_image || leader.avatar;
  const builtUrl = buildImageUrl(imageUrl);
  
  if (builtUrl) return builtUrl;
  
  // Fallback to UI Avatars API
  const name = leader.name || leader.full_name || "Leader";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name.charAt(0))}&background=000&color=fff&size=80&bold=true&length=1`;
};

// ============================================

const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// PageWrapper
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
  font-size: 12px;
  font-weight: 500;
  border: 1.5px solid ${(props) => (props.$focused ? "#000" : "#e5e7eb")};
  border-radius: 10px;
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
  font-size: 12px;
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

const UserInfoBar = styled.div`
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
  color: white;

  .user-details {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .info-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.15);
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: 500;

    svg {
      opacity: 0.8;
    }
  }

  .greeting {
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .personalized-note {
    font-size: 11px;
    opacity: 0.8;
    display: flex;
    align-items: center;
    gap: 6px;
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
    font-size: 13px;
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
    props.$type === "presidential"
      ? "#ff000010"
      : props.$type === "your-county"
        ? "#10b98110"
        : props.$type === "your-party"
          ? "#3b82f610"
          : "#f0f0f0"};
  color: ${(props) =>
    props.$type === "presidential"
      ? "#ff0000"
      : props.$type === "your-county"
        ? "#10b981"
        : props.$type === "your-party"
          ? "#3b82f6"
          : "#666"};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 9px;
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
  const { county: urlCounty, constituency: urlConstituency, ward: urlWard } = useParams();
  const [feedGroups, setFeedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const loadingBarRef = useRef(null);
  const dataFetchedRef = useRef(false);

  // Get user data from localStorage (from login response)
  useEffect(() => {
    const getUserData = () => {
      try {
        const storedUser = localStorage.getItem("user_data");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          setUserData(parsedUser);
          setIsUserLoggedIn(true);
          return;
        }

        const fetchUserFromCookie = async () => {
          try {
            const response = await api.get("/users/me", {
              withCredentials: true,
            });
            if (response.data?.success && response.data?.user) {
              setUserData(response.data.user);
              setIsUserLoggedIn(true);
              localStorage.setItem(
                "user_data",
                JSON.stringify(response.data.user),
              );
            }
          } catch (err) {
            
            setIsUserLoggedIn(false);
          }
        };

        fetchUserFromCookie();
      } catch (err) {
        console.error("Error loading user data:", err);
        setIsUserLoggedIn(false);
      }
    };

    getUserData();
  }, []);

  // SEO: Push location to URL if user is logged in and URL is generic /leaders
  useEffect(() => {
    if (isUserLoggedIn && userData && !urlCounty) {
      const county = userData.county || userData.user_county;
      const constituency = userData.constituency || userData.user_constituency;
      const ward = userData.ward || userData.user_ward;
      
      if (county) {
        let path = `/${county.toLowerCase()}`;
        if (constituency) path += `/${constituency.toLowerCase()}`;
        if (ward) path += `/${ward.toLowerCase()}`;
        
        navigate(path, { replace: true });
      }
    }
  }, [isUserLoggedIn, userData, urlCounty, navigate]);

  // Fetch personalized feed
  useEffect(() => {
    const fetchPersonalizedFeed = async () => {
      if (dataFetchedRef.current) return;
      
      setLoading(true);
      setError(null);
      
      if (loadingBarRef.current) {
        loadingBarRef.current.continuousStart(30);
      }

      try {
        const params = { limit: 300 };

        if (userData) {
          params.user_id = userData.user_id;
          params.user_party = userData.party || userData.political_party;
          params.user_county = userData.county || userData.user_county;
          params.user_constituency = userData.constituency || userData.user_constituency;
          params.user_ward = userData.ward || userData.user_ward;
        }

        if (urlCounty) params.user_county = urlCounty;
        if (urlConstituency) params.user_constituency = urlConstituency;
        if (urlWard) params.user_ward = urlWard;

        params.county = params.user_county;
        params.ward = params.user_ward;

        const response = await api.get("/leaders", { params });

        if (response && response.success) {
          const groups = Array.isArray(response.data) ? response.data : [];
          
          // Process leaders to add image URLs
          const processedGroups = groups.map(group => ({
            ...group,
            leaders: (group.leaders || []).map(leader => ({
              ...leader,
              imageUrl: getLeaderAvatar(leader)
            }))
          }));
          
          setFeedGroups(processedGroups);

          const cacheKey = `feed_cache_${userData?.user_id || "guest"}`;
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              timestamp: Date.now(),
              data: processedGroups,
            })
          );
        } else {
          setFeedGroups([]);
          setError(response?.message || "No leaders found for this criteria");
        }

        dataFetchedRef.current = true;
      } catch (err) {
        console.error("❌ Leader Feed Error:", err);
        setError("Unable to load the leaders feed. Please try again later.");
      } finally {
        setLoading(false);
        if (loadingBarRef.current) {
          loadingBarRef.current.complete();
        }
      }
    };

    fetchPersonalizedFeed();
  }, [userData, urlCounty, urlConstituency, urlWard]);

  const filteredGroups = useMemo(() => {
    if (!Array.isArray(feedGroups) || feedGroups.length === 0) return [];
    if (!searchTerm.trim()) return feedGroups;

    const term = searchTerm.toLowerCase().trim();

    return feedGroups
      .map((group) => {
        const leaders = Array.isArray(group.leaders) ? group.leaders : [];
        return {
          ...group,
          leaders: leaders.filter(
            (leader) =>
              leader.name?.toLowerCase().includes(term) ||
              leader.party?.toLowerCase().includes(term) ||
              leader.position?.toLowerCase().includes(term) ||
              leader.county?.toLowerCase().includes(term) ||
              leader.constituency?.toLowerCase().includes(term) ||
              leader.ward?.toLowerCase().includes(term),
          ),
        };
      })
      .filter((group) => group.leaders.length > 0);
  }, [feedGroups, searchTerm]);

  const totalLeaders = useMemo(() => {
    if (!Array.isArray(filteredGroups)) return 0;
    return filteredGroups.reduce(
      (sum, group) => sum + (group.leaders?.length || 0),
      0,
    );
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

  const locationTitle = urlCounty
    ? `${urlWard ? urlWard + ' Ward' : ''} ${urlConstituency ? urlConstituency + ' Constituency' : ''} ${urlCounty} County Aspirants 2027 | Siasahub`.replace(/\s+/g, ' ').trim()
    : 'All Aspirants & Candidates 2027 | Siasahub';
  const locationDescription = urlCounty
    ? `Browse 2027 election aspirants in ${urlCounty} County${urlConstituency ? ', ' + urlConstituency + ' Constituency' : ''}${urlWard ? ', ' + urlWard + ' Ward' : ''}. View their manifestos, endorsements, and campaign profiles.`
    : 'Discover all 2027 Kenyan election aspirants. View their manifestos, endorsements, and campaign profiles on Siasahub.';

  return (
    <PageWrapper>
      <Helmet>
        <title>{locationTitle}</title>
        <meta name="description" content={locationDescription} />
        <meta property="og:title" content={locationTitle} />
        <meta property="og:description" content={locationDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Siasahub" />
      </Helmet>
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
              placeholder="Search aspirant by name, party, county, constituency, ward..."
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
        {Array.isArray(filteredGroups) && filteredGroups.length > 0 ? (
          filteredGroups.map((group, index) => (
            <Section
              key={group.id || group.title || index}
              $delay={`${index * 0.05}s`}
            >
              <SectionHeader>
                <h2>
                  {group.type === "presidential" && (
                    <Star size={14} color="#ff0000" />
                  )}
                  {group.type === "county" && <MapPin size={14} />}
                  {group.type === "party" && <Users size={14} />}
                  {group.title || "Leaders"}
                  {group.type === "presidential" && (
                    <SectionBadge $type="presidential">
                      🇰🇪 National
                    </SectionBadge>
                  )}
                  {group.type === "county" &&
                    userData?.county === group.title && (
                      <SectionBadge $type="your-county">
                        📍 Your County
                      </SectionBadge>
                    )}
                  {group.type === "party" &&
                    userData?.political_party === group.title && (
                      <SectionBadge $type="your-party">
                        🎯 Your Party
                      </SectionBadge>
                    )}
                </h2>
                <span className="count">
                  {group.leaders?.length || 0} /{" "}
                  {group.total || group.leaders?.length || 0}
                </span>
              </SectionHeader>
              <Tray>
                <Suspense fallback={<SkeletonLeaderCard />}>
                  {(group.leaders || []).map((leader) => (
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
            {!searchTerm && !isUserLoggedIn && (
              <>
                <p>
                  Login to see personalized feed based on your location and
                  preferences
                </p>
                <button
                  onClick={() => navigate("/login")}
                  style={{
                    marginTop: 20,
                    padding: "8px 20px",
                    background: "#1e3c72",
                    color: "#fff",
                    border: "none",
                    borderRadius: 20,
                    cursor: "pointer",
                  }}
                >
                  Login Now
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
