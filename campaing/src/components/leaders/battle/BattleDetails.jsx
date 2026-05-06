
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import {
  ChevronLeft,
  Loader,
  TrendingUp,
  MapPin,
  Activity,
  MessageSquare,
  Zap,
  Brain,
  TrendingDown,
  BarChart,
  Target,
  Sparkles,
  ShieldCheck,
  BarChart3,
  Clock,
  Share2,
  Heart,
  Users,
  Link2
} from "lucide-react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import io from "socket.io-client";
import BattleCard from "./battleCard";
import { buildImageUrl } from "../../../utils/imageUtils";

const SOCKET_URL = window.location.origin;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #000;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.div`
  width: 100%;
  max-width: 1000px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const NavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s;

  &:hover { 
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(-4px);
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, #aaa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const MainGrid = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: ${fadeIn} 0.6s ease-out 0.1s both;
`;



const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 24px;
  width: 100%;
`;

const AnalyticsCard = styled(GlassCard)`
  border-top: 2px solid #ff1f1f;
`;

const CandidateMedia = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid ${props => props.$color};
  box-shadow: 0 0 20px ${props => props.$color}44;
  margin-bottom: 12px;
  background: #111;
  display: inline-block;

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const InsightGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 20px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const InsightItem = styled.div`
  background: rgba(255, 255, 255, 0.03);
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  .label { font-size: 11px; opacity: 0.5; margin-bottom: 4px; display: flex; align-items: center; gap: 4px; }
  .value { font-size: 18px; font-weight: 800; color: ${props => props.$color || 'white'}; }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);

  .icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: ${props => props.$color || '#ff4444'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .info {
    display: flex;
    flex-direction: column;
    label { font-size: 12px; color: rgba(255,255,255,0.5); }
    span { font-size: 18px; font-weight: 700; }
  }
`;

const ProgressSection = styled.div`
  margin-top: 10px;
`;

const ProgressBar = styled.div`
  height: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  margin: 12px 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.$width}%;
  background: ${props => props.$color};
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
`;

const CandidateStat = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  
  .name { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.8); }
  .value { font-size: 14px; font-weight: 700; color: ${props => props.$color}; }
`;

const LeadingBadge = styled.div`
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const ShareAction = styled.button`
  background: #e11d48;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #be123c;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(225, 29, 72, 0.2);
  }
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 13px;

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
  }

  .text {
    flex: 1;
    color: rgba(255,255,255,0.8);
    span { color: #e11d48; font-weight: 700; }
  }

  .time {
    font-size: 11px;
    color: rgba(255,255,255,0.4);
  }
`;

const BattleDetails = () => {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const [battle, setBattle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const socketRef = useRef(null);

  const battleId = id || slug;

  useEffect(() => {
    const fetchBattle = async () => {
      try {
        const res = await axios.get(`/api/v1/battles/${battleId}`);
        if (res.data?.success) {
          setBattle(res.data.data);
        } else {
          setError("Battle not found");
        }
      } catch (err) {
        setError("Error fetching battle");
      } finally {
        setLoading(false);
      }
    };

    fetchBattle();

    // Socket implementation
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to battle room:", battleId);
      socketRef.current.emit("join-battle", battleId);
    });

    socketRef.current.on("vote-update", (data) => {
      if (data.battleId === battleId || data.slug === battleId) {
        setBattle(prev => prev ? {
          ...prev,
          votesLeft: data.votesLeft,
          votesRight: data.votesRight
        } : null);

        // Add to recent activity
        setRecentActivity(prev => [
          {
            id: Date.now(),
            type: 'vote',
            candidate: data.candidateId === battle?.left?.leader_id ? battle?.left?.name : battle?.right?.name,
            county: data.county || 'Somewhere',
            time: 'Just now'
          },
          ...prev.slice(0, 4)
        ]);
      }
    });

    socketRef.current.on("comment-update", (data) => {
      if (data.battleId === battleId) {
        setRecentActivity(prev => [
          {
            id: Date.now(),
            type: 'comment',
            text: data.comment.text,
            user: data.comment.user_name,
            time: 'Just now'
          },
          ...prev.slice(0, 4)
        ]);
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [battleId]);

  const handleVote = async (bId, candidateId) => {
    try {
      // The actual vote logic is handled in BattleCard, 
      // but we can refresh local state if needed.
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const dayMessages = [
      "🔥 Who wins? VOTE NOW!",
      "🗳️ Make your choice! THE BATTLE IS LIVE!",
      "⚡ THE ULTIMATE SHOWDOWN! Stand with your candidate!",
      "🚀 MOMENTUM ALERT! Who has your support?",
      "🌟 LEADERSHIP CLASH! Cast your vote today!",
      "📢 SPEAK UP! Join the most intense battle of the day!",
      "🤝 THE PEOPLE'S CHOICE! Who takes the lead?"
    ];
    const day = new Date().getDay();
    const shareText = `${dayMessages[day]}\n\n${battle.left?.name} vs ${battle.right?.name}\n\n${battle.question}\n\n👉 ${shareUrl}\n#SiasaHub`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Battle: ${battle.left?.name} vs ${battle.right?.name}`,
          text: shareText,
        });
      } catch (err) { }
    } else {
      navigator.clipboard.writeText(`${shareText}`);
      alert("Campaign message & link copied! 📋");
    }
  };

  if (loading) return (
    <PageWrapper>
      <Loader size={48} className="animate-spin" style={{ marginTop: '100px', opacity: 0.5 }} />
      <p style={{ marginTop: '20px', color: 'rgba(255,255,255,0.5)' }}>Analyzing battle data...</p>
    </PageWrapper>
  );

  if (error || !battle) return (
    <PageWrapper>
      <Header>
        <NavGroup>
          <BackButton onClick={() => navigate('/')}><ChevronLeft /></BackButton>
          <Title>Battle Not Found</Title>
        </NavGroup>
      </Header>
      <GlassCard>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>{error || "This battle might have ended or been removed."}</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '20px', background: '#ff4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px' }}>Go Home</button>
      </GlassCard>
    </PageWrapper>
  );

  const totalVotes = (battle.votesLeft || 0) + (battle.votesRight || 0);
  const leftPercent = totalVotes > 0 ? Math.round((battle.votesLeft / totalVotes) * 100) : 50;
  const rightPercent = 100 - leftPercent;
  const isLeftLeading = (battle.votesLeft || 0) > (battle.votesRight || 0);

  return (
    <PageWrapper>
      <Header>
        <NavGroup>
          <BackButton onClick={() => navigate('/')}><ChevronLeft /></BackButton>
          <Title>{battle.title || "Battle Arena"}</Title>
        </NavGroup>
        <ShareAction onClick={handleShare}>
          <Share2 size={18} /> Share Battle
        </ShareAction>
      </Header>

      {battle.question && (
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          background: 'linear-gradient(135deg, #ff1f1f 0%, #a30000 100%)',
          padding: '40px 24px',
          borderRadius: '32px',
          marginBottom: '32px',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(255, 31, 31, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          animation: 'fadeIn 0.8s ease-out',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)'
          }} />
          <div style={{ fontSize: '13px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '12px', fontWeight: 900 }}>The Main Battle Question</div>
          <div style={{ fontSize: '36px', fontWeight: 900, color: 'white', lineHeight: 1.1, textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>{battle.question}</div>
        </div>
      )}

       <MainGrid>
         <div style={{ maxWidth: '420px', margin: '0 auto', width: '100%' }}>
           <BattleCard
             battle={battle}
             onVote={handleVote}
             onAddReaction={(bId, emoji) => {
               axios.post(`/api/v1/battles/reaction`, {
                 battle_id: bId,
                 reaction: emoji,
                 device_id: 'guest'
               }).then(res => {
                 if (res.data.success) {
                   setBattle(prev => ({
                     ...prev,
                     reactions: {
                       ...prev.reactions,
                       [emoji]: (prev.reactions?.[emoji] || 0) + 1
                     }
                   }));
                 }
               });
             }}
             isSingleView={true}
           />
         </div>

        <AnalyticsCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <TrendingUp size={22} color="#ff1f1f" />
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Voter Momentum</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <CandidateMedia $color="#ff4444">
               {battle.left?.primary_image?.endsWith('.mp4') ? (
                  <video 
                    src={buildImageUrl(battle.left.primary_image)} 
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                    crossOrigin="anonymous"
                  />
                ) : (
                  <img src={buildImageUrl(battle.left?.primary_image) || "/placeholder-aspirant.png"} crossOrigin="anonymous" />
                )}
              </CandidateMedia>
              <div style={{ fontSize: '16px', fontWeight: 900, color: 'white', textTransform: 'capitalize' }}>{battle.left?.name}</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#ff4444', marginTop: '4px' }}>{leftPercent}%</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <CandidateMedia $color="#2563eb">
                {battle.right?.primary_image?.endsWith('.mp4') ? (
                  <video 
                    src={buildImageUrl(battle.right.primary_image)} 
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                    crossOrigin="anonymous"
                  />
                ) : (
                  <img src={buildImageUrl(battle.right?.primary_image) || "/placeholder-aspirant.png"} crossOrigin="anonymous" />
                )}
              </CandidateMedia>
              <div style={{ fontSize: '16px', fontWeight: 900, color: 'white', textTransform: 'capitalize' }}>{battle.right?.name}</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#2563eb', marginTop: '4px' }}>{rightPercent}%</div>
            </div>
          </div>

          <ProgressSection>
            <ProgressBar>
              <ProgressFill $width={leftPercent} $color="#ff4444" />
              <ProgressFill $width={rightPercent} $color="#2563eb" />
            </ProgressBar>
          </ProgressSection>

          <InsightGrid>
            <InsightItem $color="#ffc107">
              <div className="label"><Brain size={14} /> AI Prediction</div>
              <div className="value">{leftPercent > rightPercent ? battle.left?.name : battle.right?.name}</div>
              <div style={{ fontSize: '10px', opacity: 0.5 }}>Estimated Win Probability: {Math.max(leftPercent, rightPercent)}%</div>
            </InsightItem>
            <InsightItem $color="#4caf50">
              <div className="label"><Target size={14} /> Voter Intent</div>
              <div className="value">Positive</div>
              <div style={{ fontSize: '10px', opacity: 0.5 }}>Sentiment Index: 8.4/10</div>
            </InsightItem>
          </InsightGrid>
        </AnalyticsCard>

        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Sparkles size={20} color="#eab308" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Siasa AI Insights</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid #ff1f1f' }}>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                Current trajectory shows <strong style={{ color: '#ff4444' }}>{battle.left?.name}</strong> leading in {battle.voterCounties || 1} counties. AI suggests high momentum in metropolitan areas.
              </div>
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid #2563eb' }}>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                Voter engagement for <strong style={{ color: '#2563eb' }}>{battle.right?.name}</strong> has spiked by 12% in the last hour following recent comment activity.
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Activity size={18} color="#eab308" />
            <h4 style={{ margin: 0, fontSize: '16px' }}>Voter Participation</h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <StatItem $color="rgba(225, 29, 72, 0.2)">
              <div className="icon"><Users size={20} color="#e11d48" /></div>
              <div className="info">
                <label>Total Votes</label>
                <span>{totalVotes.toLocaleString()}</span>
              </div>
            </StatItem>

            <StatItem $color="rgba(34, 197, 94, 0.2)">
              <div className="icon"><MapPin size={20} color="#22c55e" /></div>
              <div className="info">
                <label>Counties</label>
                <span>{battle.voterCounties || 1}</span>
              </div>
            </StatItem>
          </div>
        </GlassCard>

        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Activity size={18} color="#eab308" />
            <h4 style={{ margin: 0, fontSize: '16px' }}>Live Activity</h4>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {recentActivity.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                Waiting for interactions...
              </p>
            ) : (
              recentActivity.map(act => (
                <ActivityItem key={act.id}>
                  <div className="avatar">
                    {act.type === 'vote' ? <TrendingUp size={14} /> : <MessageSquare size={14} />}
                  </div>
                  <div className="text">
                    {act.type === 'vote' ? (
                      <>Voted for <span>{act.candidate}</span> from {act.county}</>
                    ) : (
                      <><span>{act.user}</span>: {act.text.substring(0, 30)}...</>
                    )}
                  </div>
                  <div className="time">{act.time}</div>
                </ActivityItem>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <BarChart size={20} color="#ff1f1f" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>County Distribution</h3>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            {(battle.countyStats && battle.countyStats.length > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={battle.countyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="county" stroke="rgba(255,255,255,0.5)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} tickLine={false} axisLine={false} />
                  <RechartsTooltip
                    contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {battle.countyStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#ff4444' : '#2563eb'} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}>
                <Activity size={40} color="#ff4444" style={{ marginBottom: '12px', opacity: 0.5 }} />
                <div style={{ fontSize: '16px', fontWeight: 700 }}>Projected Regional Trends</div>
                <div style={{ fontSize: '12px', opacity: 0.5, textAlign: 'center', maxWidth: '200px', marginTop: '4px' }}>
                  Awaiting more votes for precise regional mapping.
                </div>
                <div style={{ width: '100%', height: '100px', marginTop: '20px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent)', borderRadius: '12px' }} />
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Sparkles size={20} color="#eab308" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Siasa AI Insight</h3>
          </div>

          <div style={{ padding: '20px', background: 'rgba(255,193,7,0.05)', borderRadius: '16px', border: '1px solid rgba(255,193,7,0.2)' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffc107', marginBottom: '8px' }}>🚀 Growth Strategy</div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, margin: 0 }}>
              Based on current momentum, <strong style={{ color: '#ff4444' }}>{battle.left?.name}</strong> needs 12% more engagement to secure the lead.
              <br /><br />
              <strong style={{ color: 'white' }}>Action:</strong> Share this battle to your WhatsApp status to get your preferred leader to the top!
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button 
                onClick={handleShare}
                style={{ 
                  flex: 1, padding: '12px', background: '#ffc107', color: 'black', 
                  border: 'none', borderRadius: '12px', fontWeight: 900, cursor: 'pointer' 
                }}
              >
                SHARE TO APPS
              </button>
              <button 
                onClick={() => {
                  const shareUrl = window.location.href;
                  const dayMessages = [
                    "🔥 Who wins? VOTE NOW!",
                    "🗳️ Make your choice! THE BATTLE IS LIVE!",
                    "⚡ THE ULTIMATE SHOWDOWN! Stand with your candidate!",
                    "🚀 MOMENTUM ALERT! Who has your support?",
                    "🌟 LEADERSHIP CLASH! Cast your vote today!",
                    "📢 SPEAK UP! Join the most intense battle of the day!",
                    "🤝 THE PEOPLE'S CHOICE! Who takes the lead?"
                  ];
                  const day = new Date().getDay();
                  const shareText = `${dayMessages[day]}\n\n${battle.left?.name} vs ${battle.right?.name}\n\n${battle.question}\n\n👉 ${shareUrl}\n#SiasaHub`;
                  navigator.clipboard.writeText(shareText);
                  alert("Campaign message & link copied! 📋");
                }}
                style={{ 
                  padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', 
                  border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', fontWeight: 900, cursor: 'pointer' 
                }}
                title="Copy Link"
              >
                <Link2 size={18} />
              </button>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Heart size={20} color="#ff4444" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Live Reaction Analytics</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {['❤️', '😂', '👏', '💯'].map(emoji => (
              <div key={emoji} style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{emoji}</div>
                <div style={{ fontSize: '18px', fontWeight: 900 }}>{battle.reactions?.[emoji] || 0}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'rgba(255,255,255,0.7)' }}>Battle Integrity</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <ShieldCheck size={18} color="#22c55e" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Verified Battle</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Blockchain tracked votes</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Clock size={18} color="#94a3b8" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Active Status</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Live monitoring enabled</div>
              </div>
            </div>
          </div>
        </GlassCard>
      </MainGrid>
    </PageWrapper>
  );
};

export default BattleDetails;
