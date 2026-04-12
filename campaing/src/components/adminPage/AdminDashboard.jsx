import React, { useState, useEffect } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import axios from "axios";
import {
  Users,
  Wallet,
  CheckCircle,
  XCircle,
  TrendingUp,
  Search,
  RefreshCw,
  Activity,
  Shield,
  Trash2,
  AlertCircle,
  BarChart2,
  Smartphone,
  CreditCard,
  UserCheck,
  MapPin
} from "lucide-react";


// API Configuration
import api from "../api/api";
import API from "../api/config";


// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Global Styles for Premium Feel
const GlobalAdminStyle = createGlobalStyle`
  body {
    background-color: #f4f7fe;
    color: #1b2559;
    font-family: 'Inter', sans-serif;
  }
`;

// Styled Components
const DashboardWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 20px;

  h1 {
    font-size: 32px;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #1b2559;
  }

  span {
    color: #a3aed0;
    font-size: 14px;
    font-weight: 500;
    display: block;
    margin-top: 4px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  .icon-box {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${(props) => props.$bg || "#f4f7fe"};
    color: ${(props) => props.$color || "#4318ff"};
  }

  .details {
    .label {
      font-size: 14px;
      color: #a3aed0;
      font-weight: 600;
    }
    .value {
      font-size: 24px;
      font-weight: 800;
      color: #1b2559;
    }
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  background: #e9edf7;
  padding: 6px;
  border-radius: 14px;
  width: fit-content;
`;

const TabButton = styled.button`
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${(props) => (props.$active ? "white" : "transparent")};
  color: ${(props) => (props.$active ? "#4318ff" : "#a3aed0")};
  box-shadow: ${(props) => (props.$active ? "0 4px 12px rgba(0, 0, 0, 0.05)" : "none")};

  &:hover {
    color: #4318ff;
  }
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.03);
  min-height: 500px;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  margin-top: 20px;

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 12px;
    
    th {
      text-align: left;
      padding: 12px 20px;
      color: #a3aed0;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    td {
      padding: 16px 20px;
      background: #f8fafc;
      font-size: 14px;
      font-weight: 600;
      vertical-align: middle;

      &:first-child {
        border-radius: 12px 0 0 12px;
      }
      &:last-child {
        border-radius: 0 12px 12px 0;
      }
    }

    tbody tr {
      transition: transform 0.2s ease;
      &:hover td {
        background: #f1f5f9;
      }
    }
  }
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  background: ${(props) => props.$bg || "#4318ff20"};
  color: ${(props) => props.$color || "#4318ff"};

  &:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  background: ${(props) => props.$bg || "#ffedea"};
  color: ${(props) => props.$color || "#ff5b5b"};
`;

const SearchBar = styled.div`
  position: relative;
  max-width: 400px;
  margin-bottom: 20px;

  input {
    width: 100%;
    padding: 12px 16px 12px 44px;
    border-radius: 14px;
    border: 1px solid #e0e5f2;
    background: #f4f7fe;
    font-size: 14px;
    outline: none;
    transition: all 0.3s;

    &:focus {
      border-color: #4318ff;
      background: white;
      box-shadow: 0 4px 15px rgba(67, 24, 255, 0.08);
    }
  }

  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #a3aed0;
  }
`;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("aspirants");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ 
    aspirants: 0, 
    pending: 0, 
    totalEndorsements: 0, 
    totalEarnings: 0,
    countyStats: [] 
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGlobalStats();
    fetchData();
  }, [activeTab]);

  const fetchGlobalStats = async () => {
    try {
      const walletStats = await api.get("/wallet/admin/stats");
      const endorsementStats = await api.get("/endorsements/admin/stats");
      
      setStats(prev => ({
        ...prev,
        totalEarnings: walletStats.data?.total_balance_in_circulation || 0,
        totalEndorsements: endorsementStats.data?.totals?.total_endorsements || 0,
        countyStats: endorsementStats.data?.countyDistribution || []
      }));
    } catch (err) {
      console.error("Global stats error:", err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "aspirants") {
        const allRes = await api.get("/leaders");
        
        let allLeaders = [];
        if (allRes.data.success && Array.isArray(allRes.data.data)) {
           allRes.data.data.forEach(group => {
             if (group.leaders) allLeaders.push(...group.leaders);
           });
        }
        
        setData(allLeaders);
        setStats(prev => ({
          ...prev,
          aspirants: allLeaders.length,
          pending: allLeaders.filter(l => l.verification === 0).length
        }));
      } else {
        const walletRes = await api.get("/wallet/admin/transactions"); 
        setData(walletRes.data.data || walletRes.data || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  const handleVerify = async (id) => {
    try {
      await api.patch(`/leaders/verify/${id}`);
      setData(data.map(l => l.leader_id === id ? { ...l, verification: 1 } : l));
    } catch (err) {
      alert("Failed to verify leader");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/leaders/reject/${id}`);
      setData(data.map(l => l.leader_id === id ? { ...l, verification: 0 } : l));
    } catch (err) {
      alert("Failed to reject leader");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this leader?")) return;
    try {
      await api.delete(`/leaders/${id}`);
      setData(data.filter(l => l.leader_id !== id));
    } catch (err) {
      alert("Failed to delete leader");
    }
  };

  const filteredData = data.filter(item => {
    const search = searchTerm.toLowerCase();
    if (activeTab === "aspirants") {
      return item.name?.toLowerCase().includes(search) || item.county?.toLowerCase().includes(search);
    } else {
      return item.user_id?.toLowerCase().includes(search) || item.transaction_id?.toLowerCase().includes(search);
    }
  });

  return (
    <DashboardWrapper>
      <GlobalAdminStyle />
      <Header>
        <div>
          <h1><Shield size={32} color="#4318ff" /> Admin Control Center</h1>
          <span>Manage platform aspirants, wallets, and system integrity.</span>
        </div>
        <ActionButton $bg="white" $color="#1b2559" onClick={() => { setRefreshing(true); fetchData(); }} disabled={refreshing}>
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh Data
        </ActionButton>
      </Header>

      <StatsGrid>
        <StatCard $bg="#e7e7ff" $color="#4318ff">
          <div className="icon-box"><Users size={24} /></div>
          <div className="details">
            <div className="label">Aspirants</div>
            <div className="value">{stats.aspirants}</div>
          </div>
        </StatCard>
        <StatCard $bg="#fff5e9" $color="#ffb547">
          <div className="icon-box"><Activity size={24} /></div>
          <div className="details">
            <div className="label">Pending</div>
            <div className="value">{stats.pending}</div>
          </div>
        </StatCard>
        <StatCard $bg="#e6faf5" $color="#05cd99">
          <div className="icon-box"><TrendingUp size={24} /></div>
          <div className="details">
            <div className="label">Platform Earnings</div>
            <div className="value">KES {stats.totalEarnings.toLocaleString()}</div>
          </div>
        </StatCard>
        <StatCard $bg="#fff0f3" $color="#ff5b5b">
          <div className="icon-box"><BarChart2 size={24} /></div>
          <div className="details">
            <div className="label">Endorsements</div>
            <div className="value">{stats.totalEndorsements.toLocaleString()}</div>
          </div>
        </StatCard>
      </StatsGrid>


      <TabContainer>
        <TabButton $active={activeTab === "aspirants"} onClick={() => setActiveTab("aspirants")}>
          <UserCheck size={18} /> Aspirants Control
        </TabButton>
        <TabButton $active={activeTab === "wallets"} onClick={() => setActiveTab("wallets")}>
          <CreditCard size={18} /> Wallet Monitor
        </TabButton>
        <TabButton $active={activeTab === "counties"} onClick={() => setActiveTab("counties")}>
          <MapPin size={18} /> County Monitor
        </TabButton>
      </TabContainer>


      <ContentCard>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>
            {activeTab === "aspirants" ? "Registered Political Aspirants" : 
             activeTab === "wallets" ? "Global Wallet Transactions" : 
             "Endorsement Activity by County"}
          </h2>
          <SearchBar>
            <Search size={18} />
            <input 
              type="text" 
              placeholder={
                activeTab === "aspirants" ? "Search by name, county..." : 
                activeTab === "wallets" ? "Search transaction, user..." :
                "Search county..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBar>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-secondary">Securing data pipeline...</p>
          </div>
        ) : (
          <TableWrapper>
            <table>
              <thead>
                {activeTab === "aspirants" ? (
                  <tr>
                    <th>Ref ID</th>
                    <th>Aspirant</th>
                    <th>Position</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Actions</th>
                  </tr>
                ) : activeTab === "wallets" ? (
                  <tr>
                    <th>Ref ID</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                ) : (
                  <tr>
                    <th>County</th>
                    <th>Endorsement Count</th>
                    <th>Intensity</th>
                    <th>Trend</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {activeTab === "aspirants" ? (
                  filteredData.map((leader) => (
                    <tr key={leader.leader_id}>
                      <td><code style={{ fontSize: 11 }}>#{leader.leader_id?.toString().slice(0, 8)}</code></td>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eee', overflow: 'hidden' }}>
                            <img src={leader.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{leader.name}</div>
                            <div style={{ fontSize: 11, color: '#a3aed0' }}>{leader.party}</div>
                          </div>
                        </div>
                      </td>
                      <td>{leader.position}</td>
                      <td>{leader.county}</td>
                      <td>
                        {leader.verification === 1 ? (
                          <StatusBadge $bg="#e6faf5" $color="#05cd99">Verified</StatusBadge>
                        ) : (
                          <StatusBadge $bg="#fff5e9" $color="#ffb547">Pending</StatusBadge>
                        )}
                      </td>
                      <td>
                         <div style={{ color: leader.boost_score > 100 ? '#05cd99' : '#1b2559' }}>
                           {leader.boost_score || 0} pts
                         </div>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {leader.verification === 0 ? (
                            <ActionButton onClick={() => handleVerify(leader.leader_id)} title="Verify">
                              <CheckCircle size={16} />
                            </ActionButton>
                          ) : (
                            <ActionButton $bg="#fff5e9" $color="#ffb547" onClick={() => handleReject(leader.leader_id)} title="Unverify">
                              <XCircle size={16} />
                            </ActionButton>
                          )
                          }
                          <ActionButton $bg="#fff0f3" $color="#ff5b5b" onClick={() => handleDelete(leader.leader_id)} title="Delete">
                            <Trash2 size={16} />
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : activeTab === "wallets" ? (
                  filteredData.map((tx) => (
                    <tr key={tx.transaction_id}>
                      <td><code style={{ fontSize: 11 }}>{tx.transaction_id?.toString().slice(0, 15)}...</code></td>
                      <td>{tx.user_id}</td>
                      <td style={{ color: tx.type === 'deposit' ? '#05cd99' : '#ff5b5b' }}>
                        {tx.type === 'deposit' ? '+' : '-'}{tx.amount} pts
                      </td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{tx.type}</span>
                      </td>
                      <td>
                        <StatusBadge 
                          $bg={tx.status === 'completed' ? "#e6faf5" : "#fff5e9"} 
                          $color={tx.status === 'completed' ? "#05cd99" : "#ffb547"}
                        >
                          {tx.status}
                        </StatusBadge>
                      </td>
                      <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  stats.countyStats.map((c, i) => (
                    <tr key={i}>
                      <td><div style={{ fontWeight: 700 }}>{c.county}</div></td>
                      <td style={{ fontSize: '16px', fontWeight: 800 }}>{c.count.toLocaleString()}</td>
                      <td>
                        <div style={{ width: '100%', maxWidth: 100, height: 6, background: '#eee', borderRadius: 10, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min((c.count / (stats.totalEndorsements || 1)) * 500, 100)}%`, height: '100%', background: '#4318ff' }} />
                        </div>
                      </td>
                      <td><StatusBadge $bg="#e6faf5" $color="#05cd99">Active</StatusBadge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableWrapper>
        )}
      </ContentCard>

            {filteredData.length === 0 && (
              <div className="text-center py-5 text-secondary">
                <BarChart2 size={48} className="mb-3 opacity-20" />
                <p>No records found in current view</p>
              </div>
            )}
          </TableWrapper>
        )}
      </ContentCard>
    </DashboardWrapper>
  );
};

export default AdminDashboard;
