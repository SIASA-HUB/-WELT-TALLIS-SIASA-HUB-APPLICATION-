import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Container,
  Row,
  Col,
  Dropdown,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  Search,
  ChevronDown,
  MapPin,
  Briefcase,
  Flag,
  Sparkles,
  Clock,
  X,
  LogIn,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
} from "lucide-react";
import axios from "axios";
import LeaderCard from "./leadersCard";
import LeaderInsightPage from "./leaderInsights";
import CampaignMarketplace from "../marketplace/market";

// ============================================
// NEW STYLED COMPONENTS FOR MARKETPLACE POSITIONING
// ============================================

const MarketplaceHeader = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  background: #000;

  overflow: hidden;
  border: 1px solid #1e293b;
`;

// ============================================
// EXISTING STYLED COMPONENTS
// ============================================

const FilterBar = styled.div`
  background: white;
  border-radius: 20px;
  padding: 1.2rem 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  margin-bottom: 2rem;
  border: 1px solid #f1f5f9;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
`;

const SearchWrapper = styled.div`
  flex: 2;
  min-width: 280px;
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 0 12px;
  transition: all 0.2s ease;
  &:focus-within {
    border-color: #ff5c01;
    background: white;
    box-shadow: 0 0 0 3px rgba(255, 92, 1, 0.1);
  }
`;

const StyledInput = styled.input`
  border: none;
  background: transparent;
  width: 100%;
  padding: 12px 8px;
  font-size: 0.95rem;
  color: #1e293b;
  outline: none;
  &::placeholder {
    color: #94a3b8;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterChip = styled.button`
  background: ${(props) => (props.active ? "#FF5C01" : "white")};
  color: ${(props) => (props.active ? "white" : "#64748b")};
  border: 1px solid ${(props) => (props.active ? "#FF5C01" : "#e2e8f0")};
  border-radius: 40px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  cursor: pointer;
  &:hover {
    border-color: #ff5c01;
    transform: translateY(-1px);
  }
`;

const StyledDropdown = styled(Dropdown)`
  .dropdown-toggle {
    display: none !important;
  }
  .dropdown-menu {
    border-radius: 16px !important;
    border: 1px solid #e2e8f0 !important;
    padding: 8px !important;
    min-width: 200px !important;
    max-height: 300px;
    overflow-y: auto;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActiveFiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed #e2e8f0;
`;

const ActiveFilterBadge = styled.div`
  background: #fff1e6;
  color: #ff5c01;
  padding: 4px 12px;
  border-radius: 40px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  button {
    background: none;
    border: none;
    color: #ff5c01;
  }
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0 1.5rem;
`;

const CountBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
  background: #f8fafc;
  padding: 6px 14px;
  border-radius: 40px;
  border: 1px solid #e2e8f0;
  svg {
    color: #ff5c01;
  }
`;

const TrendingSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background: #fff9f5;
  border-radius: 40px;
  width: fit-content;
`;

const TrendingBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ff5c01;
  font-size: 0.8rem;
  font-weight: 600;
`;

const TrendingTag = styled.button`
  background: white;
  border: 1px solid #ffe4d6;
  border-radius: 30px;
  padding: 4px 12px;
  font-size: 0.75rem;
  color: #64748b;
  &:hover {
    background: #ff5c01;
    color: white;
  }
`;

const LoginButton = styled(Button)`
  border-radius: 40px;
  padding: 0.4rem 1.2rem;
  background: white;
  color: #ff5c01;
  border: 1px solid #ff5c01;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  &:hover {
    background: #ff5c01;
    color: white;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 2.5rem;
`;

const PageButton = styled(Button)`
  background: ${(props) => (props.active ? "#FF5C01" : "white")};
  color: ${(props) => (props.active ? "white" : "#64748b")};
  border: 1px solid ${(props) => (props.active ? "#FF5C01" : "#e2e8f0")};
  border-radius: 10px;
  padding: 6px 12px;
`;

// ============================================
// MAIN COMPONENT
// ============================================

const LeadersPage = () => {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState([]);
  const [filteredLeaders, setFilteredLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("All");
  const [selectedCounty, setSelectedCounty] = useState("All");
  const [selectedParty, setSelectedParty] = useState("All");

  const [trendingSearches, setTrendingSearches] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [likedLeaders, setLikedLeaders] = useState(new Set());
  const [dislikedLeaders, setDislikedLeaders] = useState(new Set());

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const API_BASE_URL =
    "https://bundle-unexpected-sustainability-idol.trycloudflare.com/api/v1/leaders";

  // Fetch Logic
  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/leaders`);
        const data = response.data.data || response.data;
        setLeaders(data);
        setFilteredLeaders(data);
      } catch (err) {
        setError("Unable to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
    setIsLoggedIn(localStorage.getItem("isAuthenticated") === "true");
  }, []);

  // Filter Logic
  useEffect(() => {
    let results = [...leaders];
    if (searchTerm) {
      results = results.filter((l) =>
        l.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (selectedPosition !== "All")
      results = results.filter((l) => l.position === selectedPosition);
    if (selectedCounty !== "All")
      results = results.filter((l) => l.county === selectedCounty);
    if (selectedParty !== "All")
      results = results.filter((l) => l.party === selectedParty);
    setFilteredLeaders(results);
  }, [searchTerm, selectedPosition, selectedCounty, selectedParty, leaders]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  if (showInsights && selectedLeader) {
    return (
      <LeaderInsightPage
        leaderId={selectedLeader.id}
        onBack={() => setShowInsights(false)}
      />
    );
  }

  return (
    <Container className="py-4" style={{ position: "relative" }}>
      {!isLoggedIn && (
        <LoginButton onClick={() => navigate("/login")}>
          <LogIn size={14} className="me-1" /> Login
        </LoginButton>
      )}

      {/* 1. CAMPAIGN MARKETPLACE AT THE TOP */}
      <MarketplaceHeader>
        <CampaignMarketplace />
      </MarketplaceHeader>

      {/* 2. MAIN FILTER BAR */}
      <FilterBar>
        <SearchWrapper>
          <Search size={18} color="#94a3b8" />
          <StyledInput
            placeholder="Search leaders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <ClearButton onClick={() => setSearchTerm("")}>
              <X size={16} />
            </ClearButton>
          )}
        </SearchWrapper>

        <FilterGroup>
          <StyledDropdown>
            <Dropdown.Toggle id="pos-drop" />
            <FilterChip
              active={selectedPosition !== "All"}
              onClick={() => document.getElementById("pos-drop").click()}
            >
              <Briefcase size={14} />{" "}
              {selectedPosition === "All" ? "Position" : selectedPosition}{" "}
              <ChevronDown size={12} />
            </FilterChip>
            <Dropdown.Menu>
              {["All", ...new Set(leaders.map((l) => l.position))].map((p) => (
                <Dropdown.Item key={p} onClick={() => setSelectedPosition(p)}>
                  {p}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </StyledDropdown>

          <StyledDropdown>
            <Dropdown.Toggle id="cty-drop" />
            <FilterChip
              active={selectedCounty !== "All"}
              onClick={() => document.getElementById("cty-drop").click()}
            >
              <MapPin size={14} />{" "}
              {selectedCounty === "All" ? "County" : selectedCounty}{" "}
              <ChevronDown size={12} />
            </FilterChip>
            <Dropdown.Menu>
              {["All", ...new Set(leaders.map((l) => l.county))].map((c) => (
                <Dropdown.Item key={c} onClick={() => setSelectedCounty(c)}>
                  {c}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </StyledDropdown>

          {(searchTerm ||
            selectedPosition !== "All" ||
            selectedCounty !== "All") && (
            <FilterChip
              style={{ background: "#f1f5f9" }}
              onClick={() => {
                setSearchTerm("");
                setSelectedPosition("All");
                setSelectedCounty("All");
              }}
            >
              <X size={14} /> Clear
            </FilterChip>
          )}
        </FilterGroup>
      </FilterBar>

      {/* 3. RESULTS STATS */}
      <StatsRow>
        <CountBadge>
          <Sparkles size={14} /> {filteredLeaders.length} leaders found
        </CountBadge>
        <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
          <Clock size={12} /> {new Date().toLocaleDateString()}
        </div>
      </StatsRow>

      {/* 4. LEADERS GRID */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" style={{ color: "#FF5C01" }} />
        </div>
      ) : (
        <>
          <Row className="g-4">
            {filteredLeaders
              .slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage,
              )
              .map((leader) => (
                <Col key={leader.id} xs={12} sm={6} lg={4} xl={3}>
                  <LeaderCard
                    leader={leader}
                    onViewInsights={() => {
                      setSelectedLeader(leader);
                      setShowInsights(true);
                    }}
                    isLiked={likedLeaders.has(leader.id)}
                    isDisliked={dislikedLeaders.has(leader.id)}
                  />
                </Col>
              ))}
          </Row>

          {/* Pagination */}
          {filteredLeaders.length > itemsPerPage && (
            <PaginationContainer>
              <PageButton
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </PageButton>
              <PageButton active>{currentPage}</PageButton>
              <PageButton
                disabled={currentPage * itemsPerPage >= filteredLeaders.length}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <ChevronRight size={16} />
              </PageButton>
            </PaginationContainer>
          )}
        </>
      )}
    </Container>
  );
};

export default LeadersPage;
