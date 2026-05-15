// BattleCard.jsx - Premium Redesign (Stripe/Linear Aesthetic)

import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Clock,
  Share2,
  TrendingUp,
  BarChart3,
  Flame,
  CheckCircle,
  Zap,
  MoreHorizontal,
  ChevronRight,
  Trophy,
  Eye
} from "lucide-react";
import { buildImageUrl } from "../../../utils/imageUtils";

// ==================== DESIGN TOKENS ====================
const theme = {
  colors: {
    primary: "#ef4444", // Modern Red
    primaryDark: "#dc2626",
    bg: "#050505",
    cardBg: "rgba(10, 10, 10, 0.8)",
    surface: "rgba(30, 30, 30, 0.4)",
    border: "rgba(255, 255, 255, 0.08)",
    borderHover: "rgba(255, 255, 255, 0.15)",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
    gold: "#FBBF24",
    success: "#10B981",
  },
  shadows: {
    card: "0 20px 40px -12px rgba(0, 0, 0, 0.5)",
    hover: "0 30px 60px -12px rgba(0, 0, 0, 0.6)",
  },
  blur: "backdrop-filter: blur(16px);",
};

const leadingGlow = keyframes`
  0% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.2); }
  50% { box-shadow: 0 0 30px rgba(239, 68, 68, 0.4); }
  100% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.2); }
`;

// ==================== STYLED COMPONENTS ====================
const CardContainer = styled(motion.div)`
  background: ${theme.colors.cardBg};
  border: 1px solid ${theme.colors.border};
  border-radius: 28px;
  overflow: hidden;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  color: ${theme.colors.text};
  box-shadow: ${theme.shadows.card};
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  ${theme.blur}

  &:hover {
    border-color: ${theme.colors.borderHover};
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.hover};
  }
`;

const Header = styled.div`
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${theme.colors.border};
  background: rgba(255, 255, 255, 0.02);
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  .dot {
    width: 6px;
    height: 6px;
    background: ${theme.colors.primary};
    border-radius: 50%;
    box-shadow: 0 0 10px ${theme.colors.primary};
  }
  
  span {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: ${theme.colors.textMuted};
    text-transform: uppercase;
  }
`;

const Timer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  color: ${theme.colors.textMuted};
  border: 1px solid ${theme.colors.border};
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 240px;
  background: ${theme.colors.bg};
  position: relative;
  
  &::after {
    content: 'VS';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: ${theme.colors.bg};
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 900;
    color: ${theme.colors.primary};
    border: 1px solid ${theme.colors.border};
    z-index: 10;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
  }

  @media (max-width: 480px) {
    height: 180px;
  }
`;

const MediaItem = styled.div`
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }
  
  &:hover img {
    transform: scale(1.08);
  }
  
  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 12px;
    opacity: 0.9;
  }
  
  .name {
    font-size: 13px;
    font-weight: 700;
    color: white;
    margin-bottom: 2px;
  }
  
  .stats-preview {
    font-size: 10px;
    color: rgba(255,255,255,0.6);
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const ContentSection = styled.div`
  padding: 24px 20px;
`;

const Question = styled.h3`
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  text-align: center;
  margin-bottom: 24px;
  color: ${theme.colors.text};
`;

const VotingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
`;

const CandidateButton = styled(motion.button)`
  background: ${props => props.$active ? `rgba(239, 68, 68, 0.1)` : theme.colors.surface};
  border: 1px solid ${props => props.$active ? theme.colors.primary : theme.colors.border};
  border-radius: 24px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  ${props => props.$winner && `animation: ${leadingGlow} 3s infinite;`}
  
  &:hover {
    border-color: ${theme.colors.primary};
    background: rgba(239, 68, 68, 0.08);
    transform: scale(1.02);
  }
  
  .avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    margin-bottom: 14px;
    border: 3px solid ${props => props.$winner ? theme.colors.primary : theme.colors.border};
    padding: 2px;
    background: ${theme.colors.bg};
    position: relative;
    
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    ${props => props.$winner && `
      &::after {
        content: '🔥';
        position: absolute;
        bottom: -4px;
        right: -4px;
        font-size: 14px;
      }
    `}
  }
  
  .info {
    text-align: center;
    
    .c-name {
      font-size: 14px;
      font-weight: 800;
      margin-bottom: 4px;
      color: ${theme.colors.text};
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    
    .c-party {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: ${theme.colors.textMuted};
      letter-spacing: 0.08em;
      background: rgba(255,255,255,0.05);
      padding: 2px 8px;
      border-radius: 4px;
    }
  }
  
  .votes {
    margin-top: 16px;
    font-size: 20px;
    font-weight: 900;
    color: ${theme.colors.text};
    letter-spacing: -0.02em;
    
    span {
      font-size: 11px;
      font-weight: 600;
      color: ${theme.colors.textMuted};
      text-transform: uppercase;
    }
  }
`;

const ProgressBarContainer = styled.div`
  margin-bottom: 24px;
  
  .labels {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    font-weight: 800;
    color: ${theme.colors.textMuted};
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .track {
    height: 10px;
    background: rgba(255,255,255,0.05);
    border-radius: 100px;
    overflow: hidden;
    display: flex;
    border: 1px solid ${theme.colors.border};
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
  }
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${props => props.$color || theme.colors.primary};
`;

const FooterStats = styled.div`
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  
  .icon-row {
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${theme.colors.textMuted};
  }
  
  .val {
    font-size: 14px;
    font-weight: 800;
    color: ${theme.colors.text};
  }
  
  .lab {
    font-size: 9px;
    color: ${theme.colors.textMuted};
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.05em;
  }
`;

const ActionRow = styled.div`
  display: flex;
  gap: 10px;
  padding: 0 20px 20px;
`;

const Button = styled(motion.button)`
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  
  ${props => props.$primary ? `
    background: ${theme.colors.primary};
    color: white;
    border: none;
    &:hover { background: ${theme.colors.primaryDark}; }
  ` : `
    background: ${theme.colors.surface};
    color: ${theme.colors.text};
    border: 1px solid ${theme.colors.border};
    &:hover { border-color: ${theme.colors.primary}; }
  `}
`;

const ReactionsRow = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 20px 20px;
  flex-wrap: wrap;
`;

const ReactionBtn = styled(motion.button)`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 12px;
  color: ${theme.colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  
  .count {
    font-size: 10px;
    font-weight: 600;
    color: ${theme.colors.textMuted};
  }
  
  &:hover {
    border-color: ${theme.colors.primary};
    background: rgba(225, 29, 72, 0.04);
  }
`;

// ==================== UTILS ====================
const formatCount = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num;
};

const formatCountdown = (ms) => {
  if (ms <= 0) return "Ended";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const BattleCard = ({
  battle,
  countdowns,
  reactionCounts,
  onVote,
  onAddReaction,
  currentUser,
  isSingleView = false,
}) => {
  const [localReactionCounts, setLocalReactionCounts] = useState({});

  useEffect(() => {
    if (reactionCounts && reactionCounts[battle?.id]) {
      setLocalReactionCounts(reactionCounts[battle.id]);
    } else if (battle?.reactions) {
      setLocalReactionCounts(battle.reactions);
    }
  }, [reactionCounts, battle?.id, battle?.reactions]);

  if (!battle) return null;

  const total = (battle.votesLeft || 0) + (battle.votesRight || 0);
  const leftPercent = total ? Math.round(((battle.votesLeft || 0) / total) * 100) : 50;
  const rightPercent = 100 - leftPercent;
  const isLeftWinner = (battle.votesLeft || 0) > (battle.votesRight || 0);
  const isRightWinner = (battle.votesRight || 0) > (battle.votesLeft || 0);
  const timeRemaining = countdowns?.[battle.id] || 0;

  const handleVoteClick = (e, side, leaderId) => {
    e.stopPropagation();
    onVote(battle.id, leaderId);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: `SiasaHub Battle: ${battle.left?.name} vs ${battle.right?.name}`,
        url: `${window.location.origin}/battle/${battle.slug || battle.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/battle/${battle.slug || battle.id}`);
      alert("Link copied!");
    }
  };

  const handleReaction = async (e, emoji) => {
    e.stopPropagation();
    setLocalReactionCounts((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }));
    await onAddReaction(battle.id, emoji);
  };

  const handleCardClick = () => {
    window.location.href = `/battle/${battle.slug || battle.id}`;
  };

  const reactions = [
    { emoji: "❤️", label: "Support" },
    { emoji: "🔥", label: "Fire" },
    { emoji: "👏", label: "Clap" },
    { emoji: "🇰🇪", label: "Kenya" },
  ];

  return (
    <CardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4 }}
      onClick={handleCardClick}
    >
      <Header>
        <StatusBadge>
          <div className="dot" />
          <span>Live Battle</span>
        </StatusBadge>
        <Timer>
          <Clock size={12} />
          {formatCountdown(timeRemaining)}
        </Timer>
      </Header>

      <Question>
        {battle.question || "Who would you choose as the next leader for this position?"}
      </Question>

      <MediaGrid>
        <MediaItem>
          <img src={buildImageUrl(battle.left?.primary_image)} alt={battle.left?.name} />
          <div className="overlay">
            <div className="name">{battle.left?.name}</div>
            <div className="stats-preview">
              <Trophy size={10} color={theme.colors.gold} /> Rank #{battle.left?.rank || 1}
            </div>
          </div>
        </MediaItem>
        <MediaItem>
          <img src={buildImageUrl(battle.right?.primary_image)} alt={battle.right?.name} />
          <div className="overlay">
            <div className="name">{battle.right?.name}</div>
            <div className="stats-preview">
              <Trophy size={10} color={theme.colors.gold} /> Rank #{battle.right?.rank || 2}
            </div>
          </div>
        </MediaItem>
      </MediaGrid>

      <ContentSection>
        <VotingGrid>
          <CandidateButton
            whileTap={{ scale: 0.95 }}
            $winner={isLeftWinner}
            onClick={(e) => handleVoteClick(e, 'left', battle.left?.leader_id)}
          >
            <div className="avatar">
              <img src={buildImageUrl(battle.left?.primary_image)} alt="" />
            </div>
            <div className="info">
              <div className="c-name">
                {battle.left?.name?.split(' ')[0]}
                {isLeftWinner && <Trophy size={14} color={theme.colors.gold} fill={theme.colors.gold} />}
              </div>
              <div className="c-party">{battle.left?.party || "Independent"}</div>
            </div>
            <div className="votes">
              {formatCount(battle.votesLeft || 0)} <span>votes</span>
            </div>
          </CandidateButton>

          <CandidateButton
            whileTap={{ scale: 0.95 }}
            $winner={isRightWinner}
            onClick={(e) => handleVoteClick(e, 'right', battle.right?.leader_id)}
          >
            <div className="avatar">
              <img src={buildImageUrl(battle.right?.primary_image)} alt="" />
            </div>
            <div className="info">
              <div className="c-name">
                {battle.right?.name?.split(' ')[0]}
                {isRightWinner && <Trophy size={14} color={theme.colors.gold} fill={theme.colors.gold} />}
              </div>
              <div className="c-party">{battle.right?.party || "Independent"}</div>
            </div>
            <div className="votes">
              {formatCount(battle.votesRight || 0)} <span>votes</span>
            </div>
          </CandidateButton>
        </VotingGrid>

        <ProgressBarContainer>
          <div className="labels">
            <span>{leftPercent}% Support</span>
            <span>{rightPercent}% Support</span>
          </div>
          <div className="track">
            <ProgressFill 
              $color={theme.colors.primary}
              animate={{ width: `${leftPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <ProgressFill 
              $color="#334155"
              animate={{ width: `${rightPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </ProgressBarContainer>
      </ContentSection>

      <ActionRow>
        <Button onClick={handleShare}>
          <Share2 size={14} />
          Share
        </Button>
        <Button $primary onClick={(e) => { e.stopPropagation(); handleCardClick(); }}>
          <Eye size={14} />
          View Arena
        </Button>
      </ActionRow>

      <ReactionsRow>
        {reactions.map(({ emoji, label }) => (
          <ReactionBtn 
            key={emoji} 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => handleReaction(e, emoji)}
          >
            {emoji} <span className="count">{formatCount(localReactionCounts?.[emoji] || 0)}</span>
          </ReactionBtn>
        ))}
      </ReactionsRow>

      <FooterStats>
        <StatItem>
          <div className="icon-row"><Users size={14} /> <span className="lab">total votes</span></div>
          <div className="val">{formatCount(total)}</div>
        </StatItem>
        <StatItem>
          <div className="icon-row"><BarChart3 size={14} /> <span className="lab">gap</span></div>
          <div className="val">{Math.abs(leftPercent - rightPercent)}%</div>
        </StatItem>
        <StatItem>
          <div className="icon-row"><Zap size={14} color={theme.colors.gold} /> <span className="lab">momentum</span></div>
          <div className="val">High</div>
        </StatItem>
      </FooterStats>
    </CardContainer>
  );
};

export default BattleCard;