// BattleCard.jsx - Clean, Simple & Exuberant
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Clock, Share2, Eye, Heart, Flame, ThumbsUp } from "lucide-react";
import { buildImageUrl } from "../../../utils/imageUtils";

// ===== VIBRANT COLORS =====
const colors = {
  primary: "#ff4757",
  primaryLight: "#ff6b81",
  secondary: "#1e90ff",
  text: "#ffffff",
  textDim: "#cccccc",
  border: "rgba(255, 255, 255, 0.12)",
  glow: "rgba(255, 71, 87, 0.3)",
};

// ===== STYLES =====
const Card = styled(motion.div)`
  background: transparent;
  width: 100%;
  min-width: 320px;
  max-width: 380px;
  scroll-snap-align: start;
  cursor: pointer;
`;

const CardInner = styled.div`
  background: #000000;
  border-radius: 28px;
  overflow: hidden;
 
  transition: all 0.25s ease;

  &:hover {

    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  }
`;

const TopBar = styled.div`
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${colors.border};
`;

const LiveBadge = styled.div`
  background: ${colors.primary}20;
  padding: 4px 12px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  .dot {
    width: 8px;
    height: 8px;
    background: ${colors.primary};
    border-radius: 50%;
    animation: pulse 1s infinite;
  }
  
  span {
    font-size: 10px;
    font-weight: 700;
    color: ${colors.primary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }
`;

const Timer = styled.div`
  background: rgba(255, 255, 255, 0.08);
  padding: 4px 12px;
  border-radius: 40px;
  font-size: 11px;
  font-weight: 500;
  color: ${colors.textDim};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Question = styled.h3`
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  padding: 20px 20px 12px;
  margin: 0;
  color: ${colors.text};
  line-height: 1.4;
`;

// Hero with two candidates - RECTANGULAR IMAGES
const HeroRow = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 12px;
  padding: 16px 20px 20px;
`;

const Candidate = styled.div`
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  
  .image-container {
    width: 100%;
    aspect-ratio: 3/4;
    border-radius: 16px;
    overflow: hidden;
    border: 2px solid ${props => props.$active ? colors.primary : colors.border};
    box-shadow: ${props => props.$active ? `0 0 20px ${colors.glow}` : 'none'};
    background: #1a1a1a;
    transition: all 0.3s ease;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
  }
  
  .name {
    font-size: 14px;
    font-weight: 700;
    margin-top: 10px;
    color: ${colors.text};
  }
  
  .party {
    font-size: 9px;
    color: ${colors.textDim};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 4px;
  }
  
  .vote-count {
    font-size: 18px;
    font-weight: 800;
    color: ${colors.primary};
    margin-top: 6px;
  }
`;

const VsCircle = styled.div`
  min-width: 40px;
  height: 40px;
  background: ${colors.primary}15;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: ${colors.primary};
  border: 1px solid ${colors.primary}40;
  margin-top: auto;
  margin-bottom: auto;
`;

const VoteRow = styled.div`
  display: flex;
  gap: 12px;
  padding: 0 20px 20px;
`;

const SideVoteBtn = styled.button`
  flex: 1;
  background: ${props => props.$side === 'left'
    ? `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`
    : `linear-gradient(135deg, ${colors.secondary}, #4faaff)`};
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 800;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.02);
    filter: brightness(1.1);
  }
`;

const ProgressSection = styled.div`
  padding: 0 20px 20px;
  
  .bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    overflow: hidden;
    display: flex;
  }
  
  .fill-left {
    background: ${colors.primary};
    transition: width 0.3s;
  }
  
  .fill-right {
    background: ${colors.secondary};
    transition: width 0.3s;
  }
  
  .percent-row {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    font-size: 12px;
    font-weight: 600;
    
    .left { color: ${colors.primary}; }
    .right { color: ${colors.secondary}; }
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  padding: 0 20px 20px;
`;

const ActionBtn = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  background: ${props => props.$primary ? colors.primary : 'rgba(255, 255, 255, 0.06)'};
  color: ${props => props.$primary ? 'white' : colors.textDim};
  border: 1px solid ${props => props.$primary ? 'transparent' : colors.border};
  
  &:hover {
    background: ${props => props.$primary ? colors.primaryLight : 'rgba(255, 255, 255, 0.12)'};
    color: white;
  }
`;

const Reactions = styled.div`
  display: flex;
  justify-content: center;
  gap: 32px;
  padding: 16px 20px;
  border-top: 1px solid ${colors.border};
`;

const Reaction = styled.button`
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  cursor: pointer;
  color: ${colors.textDim};
  transition: all 0.2s;
  
  &:hover {
    color: ${colors.primary};
    transform: scale(1.15);
  }
  
  span {
    font-size: 13px;
    font-weight: 600;
    color: ${colors.textDim};
  }
`;

const Stats = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.3);
`;

const Stat = styled.div`
  text-align: center;
  
  .value {
    font-size: 18px;
    font-weight: 800;
    color: ${colors.text};
  }
  
  .label {
    font-size: 10px;
    font-weight: 600;
    color: ${colors.textDim};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 4px;
  }
`;

// ===== HELPERS =====
const formatNumber = (n) => {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

const formatTimeLeft = (ms) => {
  if (!ms || ms <= 0) return "Ended";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return "Just now";
};

// ===== MAIN COMPONENT =====
const BattleCard = ({ battle, countdowns, onVote, onAddReaction }) => {
  const [reactions, setReactions] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    if (battle?.reactions) setReactions(battle.reactions);
  }, [battle]);

  if (!battle) return null;

  const left = battle.left || {};
  const right = battle.right || {};
  const votesLeft = battle.votesLeft || 0;
  const votesRight = battle.votesRight || 0;
  const total = votesLeft + votesRight;
  const leftPercent = total ? (votesLeft / total) * 100 : 50;
  const rightPercent = 100 - leftPercent;
  const timeLeft = countdowns?.[battle.id] || 0;
  const isLeftWinning = votesLeft > votesRight;

  const handleImageError = (side) => {
    setImageErrors(prev => ({ ...prev, [side]: true }));
  };

  const getImageUrl = (image, side) => {
    if (imageErrors[side]) return null;
    const url = buildImageUrl(image);
    return url || null;
  };

  const handleVote = (e, side, leaderId) => {
    e.stopPropagation();
    onVote?.(battle.id, leaderId);
  };

  const handleReact = async (e, emoji) => {
    e.stopPropagation();
    setReactions(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    await onAddReaction?.(battle.id, emoji);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/battle/${battle.slug || battle.id}`;
    navigator.clipboard.writeText(url);
    alert("🔗 Link copied!");
  };

  const openBattle = () => {
    window.location.href = `/battle/${battle.slug || battle.id}`;
  };

  return (
    <Card
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      onClick={openBattle}
    >
      <CardInner>
        <TopBar>
          <LiveBadge>
            <div className="dot" />
            <span>LIVE</span>
          </LiveBadge>
          <Timer>
            <Clock size={12} />
            {formatTimeLeft(timeLeft)}
          </Timer>
        </TopBar>

        <Question>
          {battle.question || "Who deserves your vote?"}
        </Question>

        <HeroRow>
          <Candidate $active={isLeftWinning}>
            <div className="image-container">
              {getImageUrl(left.primary_image, 'left') ? (
                <img
                  src={getImageUrl(left.primary_image, 'left')}
                  alt={left.name}
                  onError={() => handleImageError('left')}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  fontWeight: 'bold'
                }}>
                  {left.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div className="name">{left.name || "Candidate A"}</div>
            <div className="party">{left.party || ""}</div>
            <div className="vote-count">{formatNumber(votesLeft)}</div>
          </Candidate>

          <VsCircle>VS</VsCircle>

          <Candidate $active={!isLeftWinning && votesRight > 0}>
            <div className="image-container">
              {getImageUrl(right.primary_image, 'right') ? (
                <img
                  src={getImageUrl(right.primary_image, 'right')}
                  alt={right.name}
                  onError={() => handleImageError('right')}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #1e90ff, #4faaff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  fontWeight: 'bold'
                }}>
                  {right.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div className="name">{right.name || "Candidate B"}</div>
            <div className="party">{right.party || ""}</div>
            <div className="vote-count">{formatNumber(votesRight)}</div>
          </Candidate>
        </HeroRow>

        <VoteRow>
          <SideVoteBtn $side="left" onClick={(e) => handleVote(e, "left", left.leader_id)}>
            VOTE {left.name?.split(" ")[0]?.toUpperCase() || "LEFT"}
          </SideVoteBtn>
          <SideVoteBtn $side="right" onClick={(e) => handleVote(e, "right", right.leader_id)}>
            VOTE {right.name?.split(" ")[0]?.toUpperCase() || "RIGHT"}
          </SideVoteBtn>
        </VoteRow>

        <ProgressSection>
          <div className="bar">
            <div className="fill-left" style={{ width: `${leftPercent}%` }} />
            <div className="fill-right" style={{ width: `${rightPercent}%` }} />
          </div>
          <div className="percent-row">
            <span className="left">{Math.round(leftPercent)}%</span>
            <span className="right">{Math.round(rightPercent)}%</span>
          </div>
        </ProgressSection>

        <Actions>
          <ActionBtn onClick={handleShare}>
            <Share2 size={12} /> Share
          </ActionBtn>
          <ActionBtn $primary onClick={(e) => { e.stopPropagation(); openBattle(); }}>
            <Eye size={12} /> View Details
          </ActionBtn>
        </Actions>

        <Reactions>
          <Reaction onClick={(e) => handleReact(e, "❤️")}>
            ❤️ <span>{formatNumber(reactions["❤️"] || 0)}</span>
          </Reaction>
          <Reaction onClick={(e) => handleReact(e, "🔥")}>
            🔥 <span>{formatNumber(reactions["🔥"] || 0)}</span>
          </Reaction>
          <Reaction onClick={(e) => handleReact(e, "👍")}>
            👍 <span>{formatNumber(reactions["👍"] || 0)}</span>
          </Reaction>
        </Reactions>

        <Stats>
          <Stat>
            <div className="value">{formatNumber(total)}</div>
            <div className="label">Total Votes</div>
          </Stat>
          <Stat>
            <div className="value">{Math.abs(Math.round(leftPercent - rightPercent))}%</div>
            <div className="label">Margin</div>
          </Stat>
          <Stat>
            <div className="value">
              {votesLeft > votesRight
                ? left.name?.split(" ")[0]?.slice(0, 8) || "Left"
                : right.name?.split(" ")[0]?.slice(0, 8) || "Right"}
            </div>
            <div className="label">Leading</div>
          </Stat>
        </Stats>
      </CardInner>
    </Card>
  );
};

export default BattleCard;