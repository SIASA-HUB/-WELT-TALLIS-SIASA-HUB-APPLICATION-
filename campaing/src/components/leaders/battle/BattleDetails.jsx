
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import {
  ChevronLeft,
  Loader,
  Activity,
  BarChart3,
  MapPin,
  TrendingUp,
  ArrowDown,
  Info
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
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
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
  height: 100vh;
  width: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #000;
  overflow-y: auto;
  
  &::-webkit-scrollbar { display: none; }
`;

const Header = styled.div`
  position: fixed;
  top: 40px;
  left: 20px;
  z-index: 1000;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
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

  &:hover { background: #ff4444; border-color: #ff4444; }
`;

const AnalyticsSection = styled.div`
  padding: 40px 20px 100px;
  background: linear-gradient(to bottom, transparent, #0a0a0f);
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease-out;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;

  svg { color: #ff4444; }
`;

const ChartContainer = styled.div`
  height: 300px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 20px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
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

  .label { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; margin-bottom: 8px; }
  .value { font-size: 24px; font-weight: 900; color: #fff; }
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
  
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchBattles = async () => {
      try {
        const res = await axios.get("/api/v1/battles/active");
        if (res.data?.success) {
          const allBattles = res.data.data;
          const requestedId = id || slug;
          if (requestedId) {
            const index = allBattles.findIndex(b => b.id === requestedId || b.slug === requestedId);
            if (index > -1) {
              const [requested] = allBattles.splice(index, 1);
              allBattles.unshift(requested);
            }
          }
          
          // Initialize states
          const initialComments = {};
          const initialReactions = {};
          allBattles.forEach(b => {
            initialComments[b.id] = b.comments || [];
            initialReactions[b.id] = b.reactions || {};
          });
          
          setBattles(allBattles);
          setComments(initialComments);
          setReactionCounts(initialReactions);
        }
      } catch (err) {
        setError("Error loading battles");
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
        b.id === data.battleId ? { ...b, votesLeft: data.votesLeft, votesRight: data.votesRight, countyStats: data.countyStats } : b
      ));
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

    return () => socketRef.current?.disconnect();
  }, [id, slug]);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const newCountdowns = {};
      battles.forEach(battle => {
        if (!battle.expires_at) return;
        const expiry = new Date(battle.expires_at).getTime();
        newCountdowns[battle.id] = Math.max(0, expiry - now);
      });
      setCountdowns(newCountdowns);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [battles]);

  const onVote = async (battleId, candidateId) => {
    try {
      const deviceId = localStorage.getItem('siasahub_device_id') || `device_${Math.random().toString(36).substr(2, 9)}`;
      if (!localStorage.getItem('siasahub_device_id')) {
        localStorage.setItem('siasahub_device_id', deviceId);
      }

      await axios.post("/api/v1/battles/vote", {
        battle_id: battleId,
        candidate_id: candidateId,
        device_id: deviceId,
        county: 'Nairobi' 
      });
    } catch (err) {
      console.error("Vote error:", err);
    }
  };

  const onAddReaction = async (battleId, emoji) => {
    try {
      const deviceId = localStorage.getItem('siasahub_device_id') || `device_${Math.random().toString(36).substr(2, 9)}`;
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
      const deviceId = localStorage.getItem('siasahub_device_id') || `device_${Math.random().toString(36).substr(2, 9)}`;
      await axios.post("/api/v1/battles/comment", {
        battle_id: battleId,
        text: newComment,
        user_name: 'Guest',
        device_id: deviceId
      });
      setNewComment("");
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
      <Loader className="animate-spin" size={40} color="#ff4444" />
    </div>
  );

  return (
    <FeedWrapper>
      <Header>
        <BackButton onClick={() => navigate('/')}><ChevronLeft /></BackButton>
      </Header>

      {battles.map((battle, index) => {
        const totalVotes = (battle.votesLeft || 0) + (battle.votesRight || 0);
        const chartData = battle.countyStats ? battle.countyStats.map(s => ({
          name: s.county,
          total: s.total,
          left: s.left_votes,
          right: s.right_votes
        })) : [];

        return (
          <BattleSection key={battle.id}>
            <div style={{ height: '100vh', width: '100%', flexShrink: 0, position: 'relative' }}>
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
                isSingleView={true}
              />
              <ScrollHint>
                <span>Swipe Up / Scroll Down for Stats</span>
                <ArrowDown size={14} />
              </ScrollHint>
            </div>

            <AnalyticsSection>
              <SectionTitle><BarChart3 size={20} /> Leading Counties</SectionTitle>
              <ChartContainer>
                {chartData.length > 0 ? (
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
                        contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={i % 2 === 0 ? '#ff4444' : '#ff8844'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
                    No regional data yet... Be the first to vote!
                  </div>
                )}
              </ChartContainer>

              <SectionTitle><TrendingUp size={20} /> Engagement Metrics</SectionTitle>
              <StatsGrid>
                <StatCard>
                  <div className="label">Total Votes</div>
                  <div className="value">{totalVotes.toLocaleString()}</div>
                </StatCard>
                <StatCard>
                  <div className="label">Comments</div>
                  <div className="value">{(comments[battle.id] || []).length}</div>
                </StatCard>
              </StatsGrid>

              <div style={{ textAlign: 'center', opacity: 0.3, padding: '40px 0' }}>
                <TrendingUp size={40} style={{ marginBottom: '10px' }} />
                <p style={{ fontSize: '12px' }}>LIVE BATTLE MOMENTUM</p>
              </div>
            </AnalyticsSection>
          </BattleSection>
        );
      })}
    </FeedWrapper>
  );
};

export default BattleDetails;
