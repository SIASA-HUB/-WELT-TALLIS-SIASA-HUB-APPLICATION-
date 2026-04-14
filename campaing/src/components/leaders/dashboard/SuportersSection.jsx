import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Users,
  Search,
  Download,
  Heart,
  MapPin,
  Calendar,
  ChevronRight,
  Award,
} from "lucide-react";
import axios from "axios";

const Card = styled.div`
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  background: #fafbfc;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const SearchBar = styled.div`
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid #eef2f6;
  background: white;

  input {
    flex: 1;
    padding: 10px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #1e3c72;
      box-shadow: 0 0 0 3px rgba(30, 60, 114, 0.1);
    }
  }

  button {
    padding: 10px 20px;
    background: #1e3c72;
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 13px;
    transition: all 0.2s;

    &:hover {
      background: #152c54;
      transform: translateY(-1px);
    }
  }
`;

const ExportButton = styled.button`
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
    border-color: #1e3c72;
    color: #1e3c72;
  }
`;

const SupporterList = styled.div`
  max-height: 600px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
`;

const SupporterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #eef2f6;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: #fafbfc;
    transform: translateX(4px);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SupporterAvatar = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
`;

const SupporterDetails = styled.div`
  flex: 1;
  margin-left: 16px;

  .name {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .location {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    font-size: 12px;
    color: #64748b;
    margin-bottom: 6px;

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .separator {
      color: #cbd5e1;
    }
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 11px;
    color: #94a3b8;

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
`;

const SupporterBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    background: ${props => props.$type === "paid" ? "#fef3c7" : "#dcfce7"};
    color: ${props => props.$type === "paid" ? "#d97706" : "#16a34a"};
  }

  .chevron {
    color: #cbd5e1;
    transition: all 0.2s;
  }
`;

const StatsBadge = styled.div`
  text-align: right;
  
  .count {
    font-size: 20px;
    font-weight: 800;
    color: #1e3c72;
  }
  
  .label {
    font-size: 10px;
    color: #64748b;
    font-weight: 500;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 40px;
  
  svg {
    color: #cbd5e1;
    margin-bottom: 16px;
  }
  
  p {
    color: #64748b;
    font-size: 14px;
    margin: 0;
  }
`;

import API from "../../api/config";

const SupportersSection = ({ leader }) => {
  const [supporters, setSupporters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupporters = async () => {
      const leaderId = leader?.leader_id || leader?.id;
      if (!leaderId) return;

      try {
        const response = await axios.get(`${API.ENDORSEMENTS}/leader/${leaderId}/recent?limit=50`);
        if (response.data?.success) {
          setSupporters(response.data.data.map((s, index) => ({
            id: s.endorsement_id || s.id || `supporter_${index}`,
            name: s.user_name || "Anonymous Supporter",
            county: s.county || "Kenya",
            constituency: s.constituency || "Not specified",
            ward: s.ward || "Not specified",
            avatar: s.image_url,
            endorsementType: s.amount > 0 ? "paid" : "free",
            amount: s.amount || 0,
            since: s.created_at,
            phrase: s.phrase || "I support this vision!",
            engagementScore: s.engagement_score || Math.floor(Math.random() * 50) + 50,
          })));
        }
      } catch (error) {
        console.error("Error fetching supporters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupporters();
  }, [leader]);

  const filteredSupporters = supporters.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.county.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.constituency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ward.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Safe way to get display ID
  const getDisplayId = (id) => {
    if (!id) return "N/A";
    const idStr = String(id);
    return idStr.length > 6 ? idStr.slice(-6) : idStr;
  };

  return (
    <Card>
      <CardHeader>
        <h3>
          <Users size={20} />
          Your Supporters
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>
            ({supporters.length})
          </span>
        </h3>
        <ExportButton>
          <Download size={16} />
          Export CSV
        </ExportButton>
      </CardHeader>

      <SearchBar>
        <input
          type="text"
          placeholder="Search by name, county, constituency, or ward..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button>
          <Search size={16} /> Search
        </button>
      </SearchBar>

      <SupporterList>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
            Loading supporters...
          </div>
        ) : filteredSupporters.length === 0 ? (
          <EmptyState>
            <Users size={48} />
            <p>No supporters found matching your search</p>
          </EmptyState>
        ) : (
          filteredSupporters.map((supporter) => (
            <SupporterRow key={supporter.id}>
              <SupporterAvatar
                src={
                  supporter.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(supporter.name)}&background=1e3c72&color=fff&size=100&bold=true`
                }
                alt={supporter.name}
              />
              <SupporterDetails>
                <div className="name">
                  {supporter.name}
                  <span style={{ fontSize: "11px", fontWeight: "500", color: "#64748b" }}>
                    #{getDisplayId(supporter.id)}
                  </span>
                </div>
                <div className="location">
                  <span>
                    <MapPin size={12} />
                    {supporter.county}
                  </span>
                  {supporter.constituency !== "Not specified" && (
                    <>
                      <span className="separator">•</span>
                      <span>Constituency: {supporter.constituency}</span>
                    </>
                  )}
                  {supporter.ward !== "Not specified" && (
                    <>
                      <span className="separator">•</span>
                      <span>Ward: {supporter.ward}</span>
                    </>
                  )}
                </div>
                <div className="meta">
                  <span>
                    <Calendar size={11} />
                    Joined {formatDate(supporter.since)}
                  </span>
                  {supporter.phrase && (
                    <>
                      <span className="separator">•</span>
                      <span>"{supporter.phrase.slice(0, 50)}"</span>
                    </>
                  )}
                </div>
              </SupporterDetails>
              <SupporterBadge $type={supporter.endorsementType}>
                <div className="badge">
                  {supporter.endorsementType === "paid" ? "Paid Supporter" : "Free Supporter"}
                </div>
                <StatsBadge>
                  <div className="count">{supporter.engagementScore}</div>
                  <div className="label">score</div>
                </StatsBadge>
                <ChevronRight size={16} className="chevron" />
              </SupporterBadge>
            </SupporterRow>
          ))
        )}
      </SupporterList>
    </Card>
  );
};

export default SupportersSection;