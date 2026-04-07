// EndedBattles.js
import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  Trophy,
  Eye,
  Heart,
  Gift,
  User,
  Calendar,
  Crown,
  TrendingUp,
  Award,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const EndedBattlesContainer = styled.div`
  padding: 0 16px 20px;
  animation: ${fadeIn} 0.3s ease;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  h3 {
    font-size: 14px;
    font-weight: 700;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  button {
    background: transparent;
    border: none;
    color: #666;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;

    &:active {
      transform: scale(0.95);
    }
  }
`;

const BattleCard = styled.div`
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const BattleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
`;

const BattleTitle = styled.div`
  font-weight: 800;
  font-size: 14px;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const WinnerBadge = styled.div`
  background: linear-gradient(135deg, #ffd700, #ffb347);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DateBadge = styled.div`
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CandidatesRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0;
  gap: 12px;
`;

const Candidate = styled.div`
  flex: 1;
  text-align: center;
  padding: 8px;
  background: ${({ $winner }) =>
    $winner ? "rgba(255, 215, 0, 0.1)" : "transparent"};
  border-radius: 12px;
  position: relative;
`;

const CandidateName = styled.div`
  font-weight: 700;
  font-size: 13px;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const CandidateParty = styled.div`
  font-size: 10px;
  color: #666;
  margin-top: 2px;
`;

const VoteScore = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: #ff4444;
  margin-top: 4px;
`;

const VsDivider = styled.div`
  font-weight: 800;
  font-size: 12px;
  color: #ff8844;
  background: rgba(0, 0, 0, 0.05);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProgressContainer = styled.div`
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin: 8px 0;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #ff4444, #ff8844);
  width: ${({ $percent }) => $percent}%;
  transition: width 0.3s ease;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #666;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;

  svg {
    opacity: 0.5;
    margin-bottom: 16px;
  }

  p {
    font-size: 14px;
  }
`;

const formatNumber = (n) => {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

const formatDate = (dateString) => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const EndedBattles = ({ battles, onRefresh }) => {
  const [expandedBattle, setExpandedBattle] = useState(null);

  if (!battles || battles.length === 0) {
    return (
      <EmptyState>
        <Trophy size={48} strokeWidth={1.5} />
        <p>No ended battles yet</p>
        <p style={{ fontSize: 12, marginTop: 8 }}>
          Create a battle to see results here!
        </p>
      </EmptyState>
    );
  }

  return (
    <EndedBattlesContainer>
      <SectionHeader>
        <h3>
          <Trophy size={16} />
          Completed Battles
        </h3>
        <button onClick={onRefresh}>
          <RefreshCw size={12} />
          Refresh
        </button>
      </SectionHeader>

      {battles.map((battle) => {
        const total = (battle.votesLeft || 0) + (battle.votesRight || 0);
        const leftPercent = total
          ? ((battle.votesLeft || 0) / total) * 100
          : 50;
        const isLeftWinner = (battle.votesLeft || 0) > (battle.votesRight || 0);
        const winner = isLeftWinner ? battle.left : battle.right;
        const loser = isLeftWinner ? battle.right : battle.left;

        return (
          <BattleCard
            key={battle.id}
            id={`ended-battle-${battle.id}`}
            onClick={() =>
              setExpandedBattle(expandedBattle === battle.id ? null : battle.id)
            }
          >
            <BattleHeader>
              <BattleTitle>
                {battle.title ||
                  `${battle.left?.name} vs ${battle.right?.name}`}
                <WinnerBadge>
                  <Crown size={10} /> Winner: {winner?.name?.split(" ")[0]}
                </WinnerBadge>
              </BattleTitle>
              <DateBadge>
                <Calendar size={10} />
                {formatDate(battle.ended_at || battle.created_at)}
              </DateBadge>
            </BattleHeader>

            <CandidatesRow>
              <Candidate $winner={isLeftWinner}>
                <CandidateName>
                  {battle.left?.name?.split(" ")[0]}
                  {isLeftWinner && <Crown size={12} color="#ffd700" />}
                </CandidateName>
                <CandidateParty>{battle.left?.political_party}</CandidateParty>
                <VoteScore>{formatNumber(battle.votesLeft || 0)}</VoteScore>
                <div style={{ fontSize: 10, color: "#666" }}>
                  ({Math.round(leftPercent)}%)
                </div>
              </Candidate>
              <VsDivider>VS</VsDivider>
              <Candidate $winner={!isLeftWinner}>
                <CandidateName>
                  {battle.right?.name?.split(" ")[0]}
                  {!isLeftWinner && <Crown size={12} color="#ffd700" />}
                </CandidateName>
                <CandidateParty>{battle.right?.political_party}</CandidateParty>
                <VoteScore>{formatNumber(battle.votesRight || 0)}</VoteScore>
                <div style={{ fontSize: 10, color: "#666" }}>
                  ({Math.round(100 - leftPercent)}%)
                </div>
              </Candidate>
            </CandidatesRow>

            <ProgressContainer>
              <ProgressBar $percent={leftPercent} />
            </ProgressContainer>

            <StatsRow>
              <StatItem>
                <Eye size={10} /> {formatNumber(battle.views || 0)} views
              </StatItem>
              <StatItem>
                <Heart size={10} />{" "}
                {formatNumber(
                  Object.values(battle.reactions || {}).reduce(
                    (a, b) => a + b,
                    0,
                  ),
                )}{" "}
                reactions
              </StatItem>
              <StatItem>
                <Gift size={10} /> {formatNumber(battle.giftTotal || 0)} gifts
              </StatItem>
              {battle.hostName && (
                <StatItem>
                  <User size={10} /> Host: {battle.hostName}
                </StatItem>
              )}
            </StatsRow>

            {expandedBattle === battle.id && (
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid rgba(0,0,0,0.05)",
                  fontSize: 12,
                  color: "#666",
                }}
              >
                <div>
                  <strong>Margin of Victory:</strong>{" "}
                  {Math.abs(leftPercent - 50).toFixed(1)}%
                </div>
                <div>
                  <strong>Total Votes:</strong> {formatNumber(total)}
                </div>
                <div>
                  <strong>Comments:</strong> {battle.comments?.length || 0}
                </div>
                {winner && (
                  <div style={{ marginTop: 8, color: "#ff8844" }}>
                    <TrendingUp size={12} /> {winner.name} won by{" "}
                    {Math.abs(
                      (battle.votesLeft || 0) - (battle.votesRight || 0),
                    )}{" "}
                    votes!
                  </div>
                )}
              </div>
            )}

            <div
              style={{
                marginTop: 12,
                display: "flex",
                justifyContent: "flex-end",
                fontSize: 11,
                color: "#ff8844",
              }}
            >
              <ChevronRight size={14} />
            </div>
          </BattleCard>
        );
      })}
    </EndedBattlesContainer>
  );
};

export default EndedBattles;
