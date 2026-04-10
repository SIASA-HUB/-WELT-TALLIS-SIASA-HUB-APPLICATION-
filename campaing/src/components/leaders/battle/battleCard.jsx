// BattleCard.js - Complete Fixed Version (No Keyframe Errors)

import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  Crown,
  Eye,
  MessageCircle,
  Users,
  Heart,
  Zap,
  Clock,
  X,
  Gift,
  Swords,
  Send,
} from "lucide-react";

// ==================== ANIMATIONS ====================
const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const floatUp = keyframes`
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-80px) scale(1.2); opacity: 0; }
`;

const winnerGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.6); }
  50% { box-shadow: 0 0 20px 10px rgba(255, 215, 0, 0.4); }
  100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.6); }
`;

const loserDim = keyframes`
  0% { filter: brightness(1); }
  50% { filter: brightness(0.7); }
  100% { filter: brightness(1); }
`;

const scorePop = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.3); color: #ffd700; }
  100% { transform: scale(1); }
`;

const livePulse = keyframes`
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
`;

const tapRipple = keyframes`
  0% { transform: scale(0); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
`;

const countdownPulse = keyframes`
  0% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 0.7; transform: scale(1); }
`;

// ==================== STYLED COMPONENTS ====================
const BattleCardStyled = styled.div`
  min-width: 320px;
  height: 540px;
  background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0f 100%);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  scroll-snap-align: center;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  animation: ${slideIn} 0.4s ease-out;
`;

const LiveIndicator = styled.div`
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff4444;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 700;
  color: white;
  z-index: 25;
  display: flex;
  align-items: center;
  gap: 4px;
  animation: ${livePulse} 1s infinite;
`;

const CountdownTimer = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  padding: 4px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 25;
  font-size: 11px;
  font-weight: 700;
  color: white;
  animation: ${countdownPulse} 1s infinite;
`;

const BattleTitle = styled.div`
  position: absolute;
  top: 55px;
  left: 0;
  right: 0;
  text-align: center;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 0, 0, 0.8),
    transparent
  );
  padding: 8px 16px;
  color: white;
  font-size: 12px;
  font-weight: 700;
  z-index: 20;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  span {
    background: rgba(0, 0, 0, 0.6);
    padding: 4px 12px;
    border-radius: 20px;
    display: inline-block;
  }
`;

const HostBadge = styled.div`
  position: absolute;
  top: 55px;
  left: 12px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 8px;
  color: rgba(255, 255, 255, 0.8);
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const WinnerEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 12;
  background: radial-gradient(
    circle at ${({ $side }) => ($side === "left" ? "25%" : "75%")} 50%,
    rgba(255, 215, 0, 0.3) 0%,
    transparent 70%
  );
  animation: ${winnerGlow} 1.5s ease-in-out infinite;
`;

const LoserEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 12;
  background: radial-gradient(
    circle at ${({ $side }) => ($side === "left" ? "25%" : "75%")} 50%,
    rgba(100, 100, 100, 0.3) 0%,
    transparent 70%
  );
  animation: ${loserDim} 2s ease-in-out infinite;
`;

const WinnerCrown = styled.div`
  position: absolute;
  top: 50%;
  left: ${({ $side }) => ($side === "left" ? "20%" : "80%")};
  transform: translate(-50%, -50%);
  font-size: 40px;
  animation: ${floatUp} 1s ease-out forwards;
  pointer-events: none;
  z-index: 20;
`;

const VsBadge = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #ff4444, #ff8844);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 20px;
  color: white;
  z-index: 15;
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 68, 68, 0.5);
  animation: ${livePulse} 2s infinite;
`;

const CandidateSide = styled.div`
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;

  &:active {
    transform: scale(0.98);
  }

  ${({ $left }) => $left && `left: 0;`}
  ${({ $right }) => $right && `right: 0;`}
`;

const CandidateImage = styled.img`
  width: 100%;
  height: 62%;
  object-fit: cover;
  transition: transform 0.4s ease;

  ${CandidateSide}:hover & {
    transform: scale(1.05);
  }
`;

const CandidateInfo = styled.div`
  padding: 12px;
  text-align: center;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.95), transparent);
  position: relative;
  z-index: 5;
`;

const CandidateName = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const CandidateParty = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
`;

const CandidatePosition = styled.div`
  font-size: 9px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
`;

const TapHint = styled.div`
  position: absolute;
  bottom: 80px;
  ${({ $left }) => $left && `left: 12px;`}
  ${({ $right }) => $right && `right: 12px;`}
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border: none;
  padding: 6px 14px;
  border-radius: 30px;
  color: white;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 15;
  pointer-events: none;
`;

const ProgressContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  z-index: 10;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #ff4444, #ff8844);
  transition: width 0.6s cubic-bezier(0.34, 1.2, 0.64, 1);
  width: ${({ $percent }) => $percent}%;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    right: 0;
    top: -3px;
    width: 4px;
    height: 12px;
    background: white;
    border-radius: 2px;
    animation: ${livePulse} 0.8s infinite;
  }
`;

const VoteNumbers = styled.div`
  position: absolute;
  bottom: 20px;
  font-size: 12px;
  font-weight: 800;
  color: white;
  background: rgba(0, 0, 0, 0.7);
  padding: 4px 10px;
  border-radius: 20px;
  backdrop-filter: blur(8px);
  z-index: 15;

  .number {
    font-size: 14px;
    animation: ${({ $animate }) => ($animate ? scorePop : "none")} 0.4s ease;
  }

  ${({ $left }) => $left && `left: 12px;`}
  ${({ $right }) => $right && `right: 12px;`}
`;

const CommentsSection = styled.div`
  position: absolute;
  bottom: 70px;
  left: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  max-height: ${({ $open }) => ($open ? "200px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease;
  z-index: 20;
  display: flex;
  flex-direction: column;
`;

const CommentsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  span {
    font-size: 12px;
    font-weight: 600;
    color: white;
  }

  button {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;

    &:hover {
      color: white;
    }
  }
`;

const CommentsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  max-height: 120px;

  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }
  &::-webkit-scrollbar-thumb {
    background: #ff4444;
    border-radius: 3px;
  }
`;

const Comment = styled.div`
  font-size: 11px;
  color: white;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  strong {
    color: #ff8844;
    font-weight: 700;
  }
  span {
    color: rgba(255, 255, 255, 0.8);
    margin-left: 6px;
  }
`;

const CommentInput = styled.div`
  display: flex;
  padding: 8px;
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  input {
    flex: 1;
    background: rgba(255, 255, 255, 0.15);
    border: none;
    padding: 8px 12px;
    border-radius: 25px;
    color: white;
    font-size: 11px;

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
    &:focus {
      outline: none;
      background: rgba(255, 255, 255, 0.25);
    }
  }

  button {
    background: #ff4444;
    border: none;
    padding: 6px 14px;
    border-radius: 25px;
    color: white;
    cursor: pointer;
    font-size: 11px;
    font-weight: 600;
    transition: 0.2s;

    &:active {
      transform: scale(0.95);
    }
  }
`;

const ReactionButtons = styled.div`
  position: absolute;
  bottom: 140px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 15;
`;

const ReactionBtn = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.1s;
  position: relative;

  .count {
    position: absolute;
    bottom: -2px;
    right: -2px;
    background: #ff4444;
    color: white;
    font-size: 8px;
    font-weight: bold;
    border-radius: 10px;
    min-width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 3px;
  }

  &:active {
    transform: scale(1.2);
    background: rgba(255, 68, 68, 0.8);
  }
`;

const FloatingReaction = styled.div`
  font-size: 28px;
  position: absolute;
  animation: ${floatUp} 1.5s ease-out forwards;
  pointer-events: none;
  z-index: 25;
`;

const BattleStats = styled.div`
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 6px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 10;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: white;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const CommentButton = styled.button`
  position: absolute;
  bottom: 100px;
  left: 12px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border: none;
  padding: 6px 12px;
  border-radius: 25px;
  color: white;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  z-index: 15;
  transition: 0.2s;

  &:active {
    transform: scale(0.95);
  }
`;

const GiftButton = styled.button`
  position: absolute;
  bottom: 100px;
  right: 12px;
  background: linear-gradient(135deg, #ff8844, #ff4444);
  border: none;
  padding: 6px 12px;
  border-radius: 25px;
  color: white;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  z-index: 15;
  transition: 0.2s;

  &:active {
    transform: scale(0.95);
  }
`;

const formatNumber = (n) => {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

const formatCountdown = (ms) => {
  if (ms <= 0) return "Ended";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

// ==================== MAIN COMPONENT ====================
const BattleCard = ({
  battle,
  countdowns,
  reactionCounts,
  floatingReactions,
  comments,
  openComments,
  setOpenComments,
  newComment,
  setNewComment,
  scoreAnimations,
  onVote,
  onAddReaction,
  onAddComment,
  onSendGift,
  currentUser,
}) => {
  const [ripples, setRipples] = useState({});
  const [localReactionCounts, setLocalReactionCounts] = useState({});

  useEffect(() => {
    if (reactionCounts && reactionCounts[battle?.id]) {
      setLocalReactionCounts(reactionCounts[battle.id]);
    }
  }, [reactionCounts, battle?.id]);

  const total = (battle.votesLeft || 0) + (battle.votesRight || 0);
  const leftPercent = total ? ((battle.votesLeft || 0) / total) * 100 : 50;
  const isLeftWinner = (battle.votesLeft || 0) > (battle.votesRight || 0);
  const timeRemaining = countdowns?.[battle.id] || 0;

  const handleVoteWithRipple = (side, candidateId, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rippleKey = `${battle.id}-${side}-${Date.now()}`;
    setRipples((prev) => ({ ...prev, [rippleKey]: { x, y } }));
    setTimeout(() => {
      setRipples((prev) => {
        const newRipples = { ...prev };
        delete newRipples[rippleKey];
        return newRipples;
      });
    }, 500);
    onVote(battle.id, candidateId);
  };

  const handleReactionClick = async (emoji) => {
    setLocalReactionCounts((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }));
    await onAddReaction(battle.id, emoji);
  };

  const reactions = ["🔥", "❤️", "😂", "👏", "💯"];

  if (!battle) return null;

  return (
    <BattleCardStyled>
      <LiveIndicator>🔴 LIVE</LiveIndicator>
      <CountdownTimer>
        <Clock size={12} />
        <span>{formatCountdown(timeRemaining)}</span>
      </CountdownTimer>

      {battle.title && (
        <BattleTitle>
          <span>{battle.title}</span>
        </BattleTitle>
      )}

      {battle.hostName && (
        <HostBadge>
          <Crown size={10} /> {battle.hostName}
        </HostBadge>
      )}

      {isLeftWinner ? (
        <>
          <WinnerEffect $side="left" />
          <LoserEffect $side="right" />
        </>
      ) : (
        <>
          <WinnerEffect $side="right" />
          <LoserEffect $side="left" />
        </>
      )}

      {isLeftWinner && <WinnerCrown $side="left">👑</WinnerCrown>}
      {!isLeftWinner && <WinnerCrown $side="right">👑</WinnerCrown>}

      {/* Left Side */}
      <CandidateSide
        $left
        onClick={(e) => handleVoteWithRipple("left", battle.left?.leader_id, e)}
      >
        <CandidateImage
          src={
            battle.left?.primary_image ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(battle.left?.name || "")}&background=ff4444&color=fff&size=300&bold=true`
          }
          alt={battle.left?.name}
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(battle.left?.name || "")}&background=ff4444&color=fff&size=300&bold=true`;
          }}
        />
        <CandidateInfo>
          <CandidateName>
            {battle.left?.name?.split(" ")[0]}
            {isLeftWinner && <Crown size={14} color="#ffd700" />}
          </CandidateName>
          <CandidateParty>{battle.left?.political_party}</CandidateParty>
          <CandidatePosition>
            {battle.left?.position_running_for}
          </CandidatePosition>
        </CandidateInfo>
        <TapHint $left>
          <Zap size={10} /> TAP TO VOTE
        </TapHint>
        {Object.entries(ripples)
          .filter(([key]) => key.includes(`${battle.id}-left`))
          .map(([key, ripple]) => (
            <div
              key={key}
              style={{
                position: "absolute",
                left: ripple.x - 20,
                top: ripple.y - 20,
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(255, 68, 68, 0.6)",
                animation: tapRipple,
                pointerEvents: "none",
                zIndex: 20,
              }}
            />
          ))}
      </CandidateSide>

      <VsBadge>VS</VsBadge>

      {/* Right Side */}
      <CandidateSide
        $right
        onClick={(e) =>
          handleVoteWithRipple("right", battle.right?.leader_id, e)
        }
      >
        <CandidateImage
          src={
            battle.right?.primary_image ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(battle.right?.name || "")}&background=ff8844&color=fff&size=300&bold=true`
          }
          alt={battle.right?.name}
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(battle.right?.name || "")}&background=ff8844&color=fff&size=300&bold=true`;
          }}
        />
        <CandidateInfo>
          <CandidateName>
            {battle.right?.name?.split(" ")[0]}
            {!isLeftWinner && <Crown size={14} color="#ffd700" />}
          </CandidateName>
          <CandidateParty>{battle.right?.political_party}</CandidateParty>
          <CandidatePosition>
            {battle.right?.position_running_for}
          </CandidatePosition>
        </CandidateInfo>
        <TapHint $right>
          <Zap size={10} /> TAP TO VOTE
        </TapHint>
        {Object.entries(ripples)
          .filter(([key]) => key.includes(`${battle.id}-right`))
          .map(([key, ripple]) => (
            <div
              key={key}
              style={{
                position: "absolute",
                left: ripple.x - 20,
                top: ripple.y - 20,
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(255, 68, 68, 0.6)",
                animation: tapRipple,
                pointerEvents: "none",
                zIndex: 20,
              }}
            />
          ))}
      </CandidateSide>

      <ProgressContainer>
        <ProgressBar $percent={leftPercent} />
      </ProgressContainer>

      <VoteNumbers $left $animate={scoreAnimations?.[battle.id]}>
        <span className="number">{formatNumber(battle.votesLeft || 0)}</span> (
        {Math.round(leftPercent)}%)
      </VoteNumbers>
      <VoteNumbers $right $animate={scoreAnimations?.[battle.id]}>
        <span className="number">{formatNumber(battle.votesRight || 0)}</span> (
        {Math.round(100 - leftPercent)}%)
      </VoteNumbers>

      <CommentButton
        onClick={() =>
          setOpenComments(openComments === battle.id ? null : battle.id)
        }
      >
        <MessageCircle size={12} /> {comments?.[battle.id]?.length || 0}
      </CommentButton>

      <GiftButton onClick={() => onSendGift && onSendGift(battle.id, 10)}>
        <Gift size={10} /> Send Gift
      </GiftButton>

      <CommentsSection $open={openComments === battle.id}>
        <CommentsHeader>
          <span>💬 Comments ({comments?.[battle.id]?.length || 0})</span>
          <button onClick={() => setOpenComments(null)}>
            <X size={12} /> Close
          </button>
        </CommentsHeader>
        <CommentsList>
          {(comments?.[battle.id] || []).map((c, idx) => (
            <Comment key={c.id || idx}>
              <strong>{c.user || "Fan"}:</strong>
              <span>{c.text}</span>
            </Comment>
          ))}
          {(!comments?.[battle.id] || comments[battle.id].length === 0) && (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              No comments yet. Be the first!
            </div>
          )}
        </CommentsList>
        <CommentInput>
          <input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onAddComment(battle.id)}
          />
          <button onClick={() => onAddComment(battle.id)}>
            <Send size={12} /> Send
          </button>
        </CommentInput>
      </CommentsSection>

      <ReactionButtons>
        {reactions.map((emoji) => (
          <ReactionBtn key={emoji} onClick={() => handleReactionClick(emoji)}>
            {emoji}
            {(localReactionCounts?.[emoji] || 0) > 0 && (
              <span className="count">
                {formatNumber(localReactionCounts[emoji] || 0)}
              </span>
            )}
          </ReactionBtn>
        ))}
      </ReactionButtons>

      {floatingReactions?.[battle.id]?.map((r, i) => (
        <FloatingReaction
          key={r.id}
          style={{
            bottom: 160 + i * 25,
            left: Math.random() * 200 + 80,
          }}
        >
          {r.emoji}
        </FloatingReaction>
      ))}

      <BattleStats>
        <StatItem>
          <Eye size={10} /> {formatNumber(battle.views || 0)}
        </StatItem>
        <StatItem>
          <Users size={10} /> {formatNumber(total)} votes
        </StatItem>
        <StatItem>
          <Heart size={10} />{" "}
          {formatNumber(
            Object.values(localReactionCounts || {}).reduce(
              (a, b) => a + b,
              0,
            ),
          )}
        </StatItem>
        <StatItem>
          <Gift size={10} /> {formatNumber(battle.giftTotal || 0)}
        </StatItem>
      </BattleStats>
    </BattleCardStyled>
  );
};

export default BattleCard;