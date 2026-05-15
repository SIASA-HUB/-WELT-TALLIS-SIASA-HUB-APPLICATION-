// BattleDetails.js - Fixed Complete Version

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import {
  ChevronLeft,
  Loader,
  BarChart3,
  TrendingUp,
  ArrowDown,
  Users,
  Eye,
  Flame
} from "lucide-react";
import io from "socket.io-client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import BattleCard from "./battleCard";

const SOCKET_URL = window.location.origin;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
`;

const FeedWrapper = styled.div`
  height: 100vh;
  width: 100vw;
  background: #000;
  color: white;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const BattleSection = styled.section`
  min-height: 100vh;
  width: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #000;
`;

const Header = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  @media (max-width: 768px) {
    top: 10px;
    left: 10px;
  }
`;

const BackButton = styled.button`
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s;

  &:hover { 
    background: #BB0000; 
    border-color: #BB0000; 
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    width: 38px;
    height: 38px;
  }
`;

const CardContainer = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const ScrollHint = styled.div`
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.6;
  animation: ${bounce} 2s infinite;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  pointer-events: none;
  z-index: 10;
  color: rgba(255,255,255,0.5);
  
  @media (max-width: 768px) {
    bottom: 15px;
  }
`;

const AnalyticsSection = styled.div`
  padding: 60px 20px 100px;
  background: linear-gradient(to bottom, #0a0a0a, #000000);
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  animation: ${fadeIn} 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
    margin-top: 12px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 14px;
  font-weight: 900;
  color: #fff;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 2px;

  .title-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  svg { color: #ef4444; }

  .live-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    color: #ef4444;
    
    .pulse-dot {
      width: 6px;
      height: 6px;
      background: #ef4444;
      border-radius: 50%;
      animation: ${pulse} 1.5s infinite;
      box-shadow: 0 0 10px #ef4444;
    }
  }
`;

const ChartContainer = styled.div`
  height: 340px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 32px;
  padding: 24px;
  margin-bottom: 40px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
  
  &:hover {
    border-color: #BB0000;
    transform: translateY(-2px);
  }

  .label { 
    font-size: 10px; 
    color: rgba(255,255,255,0.4); 
    text-transform: uppercase; 
    margin-bottom: 8px;
    letter-spacing: 1px;
  }
  
  .value { 
    font-size: 28px; 
    font-weight: 900; 
    color: #fff;
  }
  
  .trend {
    font-size: 11px;
    color: #22c55e;
    margin-top: 8px;
  }
`;

const CountyList = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 20px;
  margin-bottom: 30px;
`;

const CountyItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
  
  .county-name {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
  }
  
  .county-stats {
    display: flex;
    gap: 15px;
    align-items: center;
    
    .left-votes {
      color: #BB0000;
      font-weight: 700;
      font-size: 12px;
    }
    
    .right-votes {
      color: #22c55e;
      font-weight: 700;
      font-size: 12px;
    }
    
    .total {
      color: rgba(255,255,255,0.4);
      font-size: 11px;
    }
  }
`;

const LoadingContainer = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  flex-direction: column;
  gap: 20px;
  
  p {
    color: rgba(255,255,255,0.5);
    font-size: 14px;
  }
`;

const ErrorContainer = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  flex-direction: column;
  gap: 20px;
  
  p {
    color: #BB0000;
    font-size: 16px;
  }
  
  button {
    background: #BB0000;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 30px;
    cursor: pointer;
    font-weight: 700;
    
    &:hover {
      background: #8B0000;
    }
  }
`;

const BattleDetails = () => {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdowns, setCountdowns] = useState({});
  const [comments, setComments] = useState({});
  const [reactionCounts, setReactionCounts] = useState({});
  const [floatingReactions, setFloatingReactions] = useState({});
  const [openComments, setOpenComments] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [scoreAnimations, setScoreAnimations] = useState({});
  const [countyStats, setCountyStats] = useState({});

  const socketRef = useRef(null);

  useEffect(() => {
    const fetchBattles = async () => {
      try {
        const res = await axios.get("/api/v1/battles/active");
        if (res.data?.success) {
          let allBattles = res.data.data;
          const requestedId = id || slug;

          if (requestedId) {
            const index = allBattles.findIndex(b => b.id === requestedId || b.slug === requestedId);
            if (index > -1) {
              const [requested] = allBattles.splice(index, 1);
              allBattles = [requested, ...allBattles];
            }
          }

          const initialComments = {};
          const initialReactions = {};
          const initialCountyStats = {};

          allBattles.forEach(b => {
            initialComments[b.id] = b.comments || [];
            initialReactions[b.id] = b.reactions || {};
            initialCountyStats[b.id] = b.countyStats || [];
          });

          setBattles(allBattles);
          setComments(initialComments);
          setReactionCounts(initialReactions);
          setCountyStats(initialCountyStats);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load battles. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBattles();

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socketRef.current.on("vote-update", (data) => {
      setBattles(prev => prev.map(b =>
        b.id === data.battleId ? {
          ...b,
          votesLeft: data.votesLeft,
          votesRight: data.votesRight,
          countyStats: data.countyStats
        } : b
      ));
      if (data.countyStats) {
        setCountyStats(prev => ({ ...prev, [data.battleId]: data.countyStats }));
      }
      setScoreAnimations(prev => ({ ...prev, [data.battleId]: true }));
      setTimeout(() => setScoreAnimations(prev => ({ ...prev, [data.battleId]: false })), 500);
    });

    socketRef.current.on("reaction-update", (data) => {
      setReactionCounts(prev => ({
        ...prev,
        [data.battleId]: { ...prev[data.battleId], [data.reaction]: data.reactionCount }
      }));

      const rid = Date.now();
      setFloatingReactions(prev => ({
        ...prev,
        [data.battleId]: [...(prev[data.battleId] || []), { id: rid, emoji: data.reaction }]
      }));
      setTimeout(() => {
        setFloatingReactions(prev => ({
          ...prev,
          [data.battleId]: (prev[data.battleId] || []).filter(r => r.id !== rid)
        }));
      }, 2000);
    });

    socketRef.current.on("comment-update", (data) => {
      setComments(prev => ({
        ...prev,
        [data.battleId]: [...(prev[data.battleId] || []), data.comment]
      }));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [id, slug]);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const newCountdowns = {};
      battles.forEach(battle => {
        if (battle.expires_at) {
          const expiry = new Date(battle.expires_at).getTime();
          newCountdowns[battle.id] = Math.max(0, expiry - now);
        }
      });
      setCountdowns(newCountdowns);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [battles]);

  const onVote = async (battleId, candidateId) => {
    try {
      let deviceId = localStorage.getItem('siasahub_device_id');
      if (!deviceId) {
        deviceId = `device_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('siasahub_device_id', deviceId);
      }

      await axios.post("/api/v1/battles/vote", {
        battle_id: battleId,
        candidate_id: candidateId,
        device_id: deviceId,
        county: localStorage.getItem('user_county') || 'Nairobi'
      });
    } catch (err) {
      console.error("Vote error:", err);
      alert("Failed to vote. Please try again.");
    }
  };

  const onAddReaction = async (battleId, emoji) => {
    try {
      let deviceId = localStorage.getItem('siasahub_device_id');
      if (!deviceId) {
        deviceId = `device_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('siasahub_device_id', deviceId);
      }

      await axios.post("/api/v1/battles/reaction", {
        battle_id: battleId,
        reaction: emoji,
        device_id: deviceId
      });
    } catch (err) {
      console.error("Reaction error:", err);
    }
  };

  const onAddComment = async (battleId) => {
    if (!newComment.trim()) return;
    try {
      let deviceId = localStorage.getItem('siasahub_device_id');
      if (!deviceId) {
        deviceId = `device_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('siasahub_device_id', deviceId);
      }

      await axios.post("/api/v1/battles/comment", {
        battle_id: battleId,
        text: newComment,
        user_name: 'Supporter',
        device_id: deviceId
      });
      setNewComment("");
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Loader className="animate-spin" size={40} color="#BB0000" />
        <p>Loading battles...</p>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </ErrorContainer>
    );
  }

  if (battles.length === 0) {
    return (
      <ErrorContainer>
        <p>No active battles found</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </ErrorContainer>
    );
  }

  return (
    <FeedWrapper>
      <Header>
        <BackButton onClick={() => navigate('/')}>
          <ChevronLeft size={24} />
        </BackButton>
      </Header>

      {battles.map((battle, index) => {
        const totalVotes = (battle.votesLeft || 0) + (battle.votesRight || 0);
        const battleCountyStats = countyStats[battle.id] || battle.countyStats || [];

        const chartData = battleCountyStats.map(s => ({
          name: s.county?.substring(0, 8) || 'Unknown',
          total: s.total || 0,
          left: s.left_votes || 0,
          right: s.right_votes || 0
        })).slice(0, 10);

        const topCounties = [...battleCountyStats]
          .sort((a, b) => (b.total || 0) - (a.total || 0))
          .slice(0, 5);

        return (
          <BattleSection key={battle.id}>
            <CardContainer>
              <BattleCard
                battle={battle}
                countdowns={countdowns}
                reactionCounts={reactionCounts}
                floatingReactions={floatingReactions}
                comments={comments}
                openComments={openComments}
                setOpenComments={setOpenComments}
                newComment={newComment}
                setNewComment={setNewComment}
                scoreAnimations={scoreAnimations}
                onVote={onVote}
                onAddReaction={onAddReaction}
                onAddComment={onAddComment}
                onSendGift={() => alert("Gifting coming soon!")}
                currentUser={null}
                isSingleView={true}
              />
              <ScrollHint>
                <span>SCROLL FOR STATS</span>
                <ArrowDown size={14} />
              </ScrollHint>
            </CardContainer>

            <AnalyticsSection>
              <SectionTitle>
                <div className="title-content">
                  <BarChart3 size={18} />
                  <span>County Performance</span>
                </div>
                <div className="live-indicator">
                  <div className="pulse-dot" />
                  LIVE ANALYTICS
                </div>
              </SectionTitle>

              {chartData.length > 0 ? (
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#1a1a2e',
                          border: '1px solid #BB0000',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#BB0000" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <ChartContainer>
                  <div style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: '12px',
                    gap: '10px'
                  }}>
                    <Eye size={32} />
                    No county data yet
                    <span style={{ fontSize: '10px' }}>Be the first to vote in your county!</span>
                  </div>
                </ChartContainer>
              )}

              {topCounties.length > 0 && (
                <CountyList>
                  <SectionTitle style={{ marginBottom: '15px' }}>
                    <TrendingUp size={16} />
                    Top 5 Counties
                  </SectionTitle>
                  {topCounties.map((county, idx) => (
                    <CountyItem key={idx}>
                      <span className="county-name">{county.county}</span>
                      <div className="county-stats">
                        <span className="left-votes">← {county.left_votes || 0}</span>
                        <span className="total">|</span>
                        <span className="right-votes">{county.right_votes || 0} →</span>
                        <span className="total">Total: {county.total || 0}</span>
                      </div>
                    </CountyItem>
                  ))}
                </CountyList>
              )}

              <SectionTitle>
                <TrendingUp size={18} />
                Engagement
              </SectionTitle>

              <StatsGrid>
                <StatCard>
                  <div className="label">Total Votes</div>
                  <div className="value">{totalVotes.toLocaleString()}</div>
                  <div className="trend">
                    <Flame size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Live
                  </div>
                </StatCard>
                <StatCard>
                  <div className="label">Comments</div>
                  <div className="value">{(comments[battle.id] || []).length}</div>
                  <div className="trend">Active discussion</div>
                </StatCard>
                <StatCard>
                  <div className="label">Reactions</div>
                  <div className="value">
                    {Object.values(reactionCounts[battle.id] || {}).reduce((a, b) => a + b, 0)}
                  </div>
                  <div className="trend">❤️ 🔥 👏 🇰🇪</div>
                </StatCard>
                <StatCard>
                  <div className="label">Turnout</div>
                  <div className="value">
                    {Math.min(100, Math.round((totalVotes / 10000) * 100))}%
                  </div>
                  <div className="trend">Building momentum</div>
                </StatCard>
              </StatsGrid>

              <div style={{
                textAlign: 'center',
                opacity: 0.3,
                padding: '40px 0 20px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                marginTop: '20px'
              }}>
                <Users size={32} style={{ marginBottom: '10px' }} />
                <p style={{ fontSize: '10px', letterSpacing: '1px' }}>
                  POWERED BY THE PEOPLE
                </p>
              </div>
            </AnalyticsSection>
          </BattleSection>
        );
      })}
    </FeedWrapper>
  );
};

export default BattleDetails;