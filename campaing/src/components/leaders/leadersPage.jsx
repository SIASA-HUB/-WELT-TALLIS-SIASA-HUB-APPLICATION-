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
import { useCounty } from "../../context/countyContext";
import theme from "../../utils/theme";
import stringSimilarity from "string-similarity";
import { Search, X, TrendingUp, UserPlus, Clock } from "lucide-react";
import BattleArena from "./battle/batlleArena";
import TrendingManifestos from "./manifestos/TredingManifestos";

// Lazy load non-critical components
const LeaderCard = lazy(() => import("./leadersCard"));

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  padding-bottom: 60px;
`;

const LoadingWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99999;
  pointer-events: none;
`;

// Sticky Search Bar
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

  svg {
    width: 16px;
    height: 16px;
  }
`;

const FilterChips = styled.div`
  display: flex;
  gap: 8px;
  padding: 10px 20px 12px 20px;
  max-width: 800px;
  margin: 0 auto;
  overflow-x: auto;
  scrollbar-width: none;
  border-top: 1px solid rgba(0, 0, 0, 0.05);

  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterChip = styled.button`
  padding: 5px 14px;
  background: ${(props) => (props.$active ? "#000" : "#f3f4f6")};
  color: ${(props) => (props.$active ? "#fff" : "#4b5563")};
  border: none;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.$active ? "#000" : "#e5e7eb")};
    transform: translateY(-1px);
  }
`;

const SearchResult = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 12px 20px;
  background: #f9fafb;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const ResultText = styled.div`
  font-size: 13px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  strong {
    color: #000;
    font-weight: 700;
  }

  .highlight {
    background: #fef3c7;
    color: #92400e;
    padding: 2px 8px;
    border-radius: 20px;
    font-weight: 500;
  }
`;

const FeedContainer = styled.div`
  max-width: 1200px;
  padding-bottom: 80px;
  margin: 0 auto;
`;

const Section = styled.div`
  margin-bottom: 30px;
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
    font-size: 15px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #000;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 6px;
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

  p {
    margin: 8px 0;
  }

  .suggestion {
    font-size: 12px;
    color: #aaa;
    margin-top: 8px;
  }
`;

const PendingBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fef3c7;
  color: #92400e;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  margin-left: 8px;
`;

// Position categories
const POSITION_CATEGORIES = [
  { name: "President", keywords: ["president", "presidential"], order: 1 },
  { name: "Governor", keywords: ["governor", "gov"], order: 2 },
  { name: "Senator", keywords: ["senator", "senate"], order: 3 },
  {
    name: "Women Rep",
    keywords: ["women rep", "woman rep", "women representative"],
    order: 4,
  },
  { name: "MP", keywords: ["mp", "member of parliament"], order: 5 },
  { name: "MCA", keywords: ["mca", "county assembly"], order: 6 },
  { name: "Other", keywords: [], order: 7 },
];

const findCategory = (str) => {
  if (!str) return { name: "Other", order: 7 };
  const clean = str.toLowerCase().trim();

  for (const category of POSITION_CATEGORIES) {
    for (const keyword of category.keywords) {
      if (clean.includes(keyword)) {
        return { name: category.name, order: category.order };
      }
    }
  }
  return { name: "Other", order: 7 };
};

const getDisplayName = (category) => {
  if (category === "President") return "Presidential Candidates";
  if (category === "Other") return "Other Aspirants";
  return category + "s";
};

// Search function
const searchLeaders = (leaders, searchTerm) => {
  if (!searchTerm.trim()) return leaders;

  const term = searchTerm.toLowerCase().trim();

  return leaders.filter((leader) => {
    const name = (leader.name || "").toLowerCase();
    if (name.includes(term)) return true;
    if (leader.party?.toLowerCase().includes(term)) return true;
    const position = (
      leader.position_running_for ||
      leader.position ||
      ""
    ).toLowerCase();
    if (position.includes(term)) return true;
    if (leader.county?.toLowerCase().includes(term)) return true;
    const similarity = stringSimilarity.compareTwoStrings(name, term);
    if (similarity > 0.65) return true;
    return false;
  });
};

const LeadersPage = () => {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("All");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const loadingBarRef = useRef(null);
  const { selectedCounty } = useCounty();
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch leaders
  // Fetch leaders - Show ALL aspirants (no status filter)
  useEffect(() => {
    const fetchLeaders = async () => {
      if (dataFetchedRef.current) return;

      if (loadingBarRef.current) {
        loadingBarRef.current.continuousStart(30);
      }

      try {
        const res = await axios.get("http://localhost:8002/api/v1/leaders", {
          timeout: 8000,
        });

        if (res.data?.data) {
          // Show ALL leaders - no status filter
          setLeaders(res.data.data);
          setError(null);
        } else {
          setLeaders([]);
          setError("No data available");
        }

        dataFetchedRef.current = true;
      } catch (err) {
        console.error("Error fetching leaders:", err);
        setError(err.message || "Failed to load leaders");
        setLeaders([]);
      } finally {
        setLoading(false);
        if (loadingBarRef.current) {
          loadingBarRef.current.complete();
        }
      }
    };

    fetchLeaders();
  }, []);

  // Get unique positions from active leaders only
  const uniquePositions = useMemo(() => {
    const positions = new Set();
    leaders.forEach((leader) => {
      const pos = leader.position_running_for || leader.position;
      if (pos) {
        const category = findCategory(pos).name;
        if (category !== "Other") {
          positions.add(category);
        }
      }
    });
    return ["All", ...Array.from(positions).sort()];
  }, [leaders]);

  // Filter leaders
  const filteredLeaders = useMemo(() => {
    if (!leaders.length) return [];

    const isNational =
      !selectedCounty || ["Kenya", "All"].includes(selectedCounty);

    let filtered = isNational
      ? leaders
      : leaders.filter(
          (l) => l.county?.toLowerCase() === selectedCounty.toLowerCase(),
        );

    filtered = searchLeaders(filtered, searchTerm);

    if (selectedPosition !== "All") {
      filtered = filtered.filter((leader) => {
        const pos = leader.position_running_for || leader.position;
        return findCategory(pos).name === selectedPosition;
      });
    }

    return filtered;
  }, [leaders, selectedCounty, searchTerm, selectedPosition]);

  // Group by position
  const groupedData = useMemo(() => {
    if (!filteredLeaders.length) return [];

    const groups = {};

    filteredLeaders.forEach((leader) => {
      const position = leader.position_running_for || leader.position || "";
      const category = findCategory(position);

      if (!groups[category.name]) {
        groups[category.name] = {
          title: category.name,
          list: [],
          order: category.order,
          displayName: getDisplayName(category.name),
        };
      }
      groups[category.name].list.push(leader);
    });

    return Object.values(groups).sort((a, b) => a.order - b.order);
  }, [filteredLeaders]);

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedPosition("All");
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
        <FeedContainer>
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
        </FeedContainer>
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
              type="text"
              placeholder="Search aspirant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

        <TrendingManifestos leaders={leaders} compact={true} />

        {uniquePositions.length > 1 && (
          <FilterChips>
            {uniquePositions.map((pos) => (
              <FilterChip
                key={pos}
                $active={selectedPosition === pos}
                onClick={() => setSelectedPosition(pos)}
              >
                {pos === "All" ? "All" : pos}
              </FilterChip>
            ))}
          </FilterChips>
        )}
      </StickySearchWrapper>

      {searchTerm && (
        <SearchResult>
          <ResultText>
            <TrendingUp size={14} />
            Found <strong>{filteredLeaders.length}</strong> aspirant
            {filteredLeaders.length !== 1 ? "s" : ""} matching "
            <strong>{searchTerm}</strong>"
          </ResultText>
        </SearchResult>
      )}

      <FeedContainer>
        {groupedData.length > 0 ? (
          groupedData.map((group, index) => (
            <Section key={group.title} $delay={`${index * 0.1}s`}>
              <SectionHeader>
                <h2>
                  {group.displayName}
                  {group.list.some((l) => l.status === "pending") && (
                    <PendingBadge>
                      <Clock size={10} /> Pending Approval
                    </PendingBadge>
                  )}
                </h2>
                <span className="count">{group.list.length}</span>
              </SectionHeader>

              <Tray>
                <Suspense fallback={<SkeletonCard />}></Suspense>

                {group.list.map((leader) => (
                  <Suspense
                    key={leader.leader_id}
                    fallback={<SkeletonLeaderCard />}
                  >
                    <LeaderCard leader={leader} />
                  </Suspense>
                ))}
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
                <p className="suggestion">
                  Try checking the spelling or use just first/last name
                </p>
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
                    fontSize: "13px",
                  }}
                >
                  Clear search
                </button>
              </>
            )}
          </EmptyState>
        )}
      </FeedContainer>
    </PageWrapper>
  );
};

export default LeadersPage;
