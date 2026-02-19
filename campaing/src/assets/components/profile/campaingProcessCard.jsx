import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Target, Star, Award, Flag, Shield, Zap, Crown, Trophy } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const InfoCard = styled.div`
  background: white;
  margin: 20px 15px;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
  border: 1px solid #f1f5f9;
  animation: ${fadeIn} 0.8s ease-out;
`;

const ProgressBarContainer = styled.div`
  height: 6px;
  background: #f1f5f9;
  border-radius: 8px;
  margin: 12px 0;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #BB0000, #FF4444);
  border-radius: 8px;
  width: ${props => props.$progress || 0}%;
  transition: width 0.6s ease-out;
`;

const RanksContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding: 15px 0;
  margin-top: 15px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`;

const RankCard = styled.div`
  min-width: 120px;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid ${props => props.$isCurrent ? '#BB0000' : '#e2e8f0'};
  background: ${props => props.$isCurrent ? '#fef2f2' : 'white'};
  text-align: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const RankIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
  color: ${props => props.$color};
`;

const RankName = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${props => props.$isCurrent ? '#BB0000' : '#1e293b'};
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RankRequirement = styled.div`
  font-size: 10px;
  color: ${props => props.$isCurrent ? '#dc2626' : '#64748b'};
  font-weight: 600;
`;

const CampaignProgressCard = ({ campaignProgress = 82, currentRank = 'Campaign Advocate' }) => {
  const campaignRanks = [
    { id: 'cadet', name: 'Campaign Cadet', icon: Target, color: '#6b7280', requirement: '0% Complete', minProgress: 0, description: 'New campaign participant' },
    { id: 'scout', name: 'Campaign Scout', icon: Star, color: '#3b82f6', requirement: '10% Complete', minProgress: 10, description: 'Learning the ropes' },
    { id: 'advocate', name: 'Campaign Advocate', icon: Award, color: '#8b5cf6', requirement: '25% Complete', minProgress: 25, description: 'Active campaign supporter' },
    { id: 'strategist', name: 'Campaign Strategist', icon: Flag, color: '#10b981', requirement: '40% Complete', minProgress: 40, description: 'Strategic campaign planner' },
    { id: 'leader', name: 'Campaign Leader', icon: Shield, color: '#f59e0b', requirement: '60% Complete', minProgress: 60, description: 'Leading campaign efforts' },
    { id: 'commander', name: 'Campaign Commander', icon: Zap, color: '#ef4444', requirement: '75% Complete', minProgress: 75, description: 'Commanding campaign operations' },
    { id: 'champion', name: 'Campaign Champion', icon: Crown, color: '#BB0000', requirement: '90% Complete', minProgress: 90, description: 'Top campaign performer' },
    { id: 'ultimate', name: 'Ultimate Rank', icon: Trophy, color: '#FFD700', requirement: '100% Complete', minProgress: 100, description: 'Campaign master' }
  ];

  const currentRankIndex = campaignRanks.findIndex(rank => rank.name === currentRank);
  const currentRankData = campaignRanks[currentRankIndex] || campaignRanks[0];
  const nextRank = campaignRanks[currentRankIndex + 1];
  
  // Create reference for dynamic icon rendering
  const CurrentIcon = currentRankData.icon;

  const progressToNextRank = nextRank 
    ? Math.max(0, Math.min(100, ((campaignProgress - currentRankData.minProgress) / 
      (nextRank.minProgress - currentRankData.minProgress)) * 100))
    : 100;

  return (
    <InfoCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.8px' }}>
            Campaign Rank Progress
          </div>
          <div style={{ fontSize: '13px', color: '#BB0000', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CurrentIcon size={16} />
            {currentRank} • {campaignProgress}% Complete
          </div>
        </div>
        <Target size={22} color="#BB0000" />
      </div>
      
      <ProgressBarContainer>
        <ProgressFill $progress={campaignProgress} />
      </ProgressBarContainer>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '8px' }}>
        <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
      </div>

      <RanksContainer>
        {campaignRanks.map((rank) => {
          const RankIconComponent = rank.icon;
          const isCurrent = rank.name === currentRank;
          const isUnlocked = campaignProgress >= rank.minProgress;
          
          return (
            <RankCard 
              key={rank.id}
              $isCurrent={isCurrent}
              onClick={() => alert(`Rank: ${rank.name}\n${rank.description}\nRequirement: ${rank.requirement}`)}
            >
              <RankIcon $color={rank.color}>
                <RankIconComponent size={18} />
              </RankIcon>
              <RankName $isCurrent={isCurrent}>
                {rank.name.split(' ')[1]}
              </RankName>
              <RankRequirement $isCurrent={isCurrent}>
                {rank.requirement}
              </RankRequirement>
              <div style={{ fontSize: '9px', color: isCurrent ? '#dc2626' : '#94a3b8', marginTop: '4px' }}>
                {isCurrent ? '✓ Current' : (isUnlocked ? '✓ Unlocked' : 'Locked')}
              </div>
            </RankCard>
          );
        })}
      </RanksContainer>

      {nextRank && (
        <div style={{ marginTop: '15px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
              Progress to {nextRank.name.split(' ')[1]}:
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#BB0000' }}>
              {progressToNextRank.toFixed(0)}%
            </div>
          </div>
          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)', width: `${progressToNextRank}%`, transition: 'width 0.6s ease-out' }} />
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
            Need <strong style={{ color: '#8b5cf6' }}>{nextRank.minProgress - campaignProgress}%</strong> more to reach {nextRank.name}
          </p>
        </div>
      )}

      <div style={{ marginTop: '15px', padding: '12px', background: 'linear-gradient(135deg, #fef2f2, #fff7ed)', borderRadius: '12px', border: '1px solid #fed7d7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: currentRankData.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CurrentIcon size={12} color="white" />
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#7f1d1d' }}>{currentRank}</div>
        </div>
        <p style={{ margin: 0, fontSize: '11px', color: '#92400e' }}>
          {currentRankData.description}. Continue participating in campaigns to rank up!
        </p>
      </div>
    </InfoCard>
  );
};

export default CampaignProgressCard;