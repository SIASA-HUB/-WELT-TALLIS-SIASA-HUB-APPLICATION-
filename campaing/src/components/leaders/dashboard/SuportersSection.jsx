import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Users,
  Search,
  Filter,
  Download,
  Heart,
  MessageCircle,
} from "lucide-react";

const Card = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #eef2f6;
  margin-bottom: 20px;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;

  input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #1e3c72;
    }
  }

  button {
    padding: 12px 20px;
    background: #1e3c72;
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
      background: #152c54;
    }
  }
`;

const SupporterCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eef2f6;

  &:hover {
    background: #f8fafc;
  }
`;

const SupporterAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
`;

const SupporterInfo = styled.div`
  flex: 1;
  margin-left: 16px;

  h4 {
    margin: 0 0 4px;
    font-size: 16px;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 12px;
    color: #64748b;
  }
`;

const SupporterStats = styled.div`
  display: flex;
  gap: 16px;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #64748b;
  }
`;

const ENDORSEMENT_API_URL = "http://localhost:8003/api/v1";
import axios from "axios";

const SupportersSection = ({ leader }) => {
  const [supporters, setSupporters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch supporters from API
    const fetchSupporters = async () => {
      const leaderId = leader?.leader_id || leader?.id;
      if (!leaderId) return;

      try {
        const response = await axios.get(`${ENDORSEMENT_API_URL}/endorsements/leader/${leaderId}/recent?limit=50`);
        if (response.data?.success) {
          setSupporters(response.data.data.map(s => ({
            id: s.endorsement_id || s.id,
            name: s.user_name || "Anonymous",
            county: s.county || "Kenya",
            avatar: s.image_url,
            engagements: s.amount > 0 ? "Paid" : "Free",
            since: s.created_at,
            phrase: s.phrase
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
      s.county.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ margin: 0, fontWeight: 800 }}>Your Supporters</h3>
        <button
          style={{
            padding: "8px 16px",
            background: "#f1f5f9",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Download size={16} /> Export
        </button>
      </div>

      <SearchBar>
        <input
          type="text"
          placeholder="Search by name or county..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button>
          <Search size={16} /> Search
        </button>
      </SearchBar>

      <div>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            Loading supporters...
          </div>
        ) : filteredSupporters.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#64748b" }}
          >
            <Users size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
            <p>No supporters found</p>
          </div>
        ) : (
          filteredSupporters.map((supporter) => (
            <SupporterCard key={supporter.id}>
              <SupporterAvatar
                src={
                  supporter.avatar ||
                  `https://ui-avatars.com/api/?name=${supporter.name}&background=1e3c72&color=fff`
                }
              />
              <SupporterInfo>
                <h4>{supporter.name}</h4>
                <p>
                  {supporter.county} • Supporter since{" "}
                  {new Date(supporter.since).toLocaleDateString()}
                </p>
              </SupporterInfo>
              <SupporterStats>
                <span>
                  <Heart size={14} /> {supporter.engagements}
                </span>
                <span>
                  <MessageCircle size={14} /> 12
                </span>
              </SupporterStats>
            </SupporterCard>
          ))
        )}
      </div>
    </Card>
  );
};

export default SupportersSection;
