import React from 'react';
import styled from 'styled-components';
import { Share2, ThumbsUp, MessageCircle, Clock, TrendingUp as TrendingUpIcon } from 'lucide-react';

const Section = styled.div`
  background: white;
  margin: 0 15px 20px;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  border: 1px solid #f1f5f9;
  animation: fadeIn 1s ease-out;
`;

const SectionTitle = styled.h3`
  margin: 0 0 15px;
  font-size: 16px;
  font-weight: 800;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EarningsItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
`;

const EarningsInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const EarningsIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${props => props.$color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color};
`;

const EarningsAmount = styled.div`
  font-weight: 700;
  font-size: 15px;
  color: #1e293b;
`;

const EarningsBreakdown = () => {
  const earningsBreakdown = [
    { id: 1, title: 'Video Sharing', amount: 50, rate: 'per 100 people', icon: Share2, color: '#BB0000' },
    { id: 2, title: 'Likes Earned', amount: 5, rate: 'per 100 likes', icon: ThumbsUp, color: '#006600' },
    { id: 3, title: 'Posts Created', amount: 25, rate: 'per post', icon: MessageCircle, color: '#8B5CF6' },
    { id: 4, title: 'Comments Made', amount: 2, rate: 'per comment', icon: MessageCircle, color: '#F59E0B' },
    { id: 5, title: 'Time Active', amount: 10, rate: 'per hour', icon: Clock, color: '#3B82F6' }
  ];

  return (
    <Section>
      <SectionTitle>
        <TrendingUpIcon size={18} />
        Earnings Breakdown
      </SectionTitle>
      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: 15 }}>
        How you earn money on the platform
      </div>
      
      {earningsBreakdown.map((item) => (
        <EarningsItem key={item.id}>
          <EarningsInfo>
            <EarningsIcon $color={item.color}>
              <item.icon size={18} />
            </EarningsIcon>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
                {item.rate}
              </div>
            </div>
          </EarningsInfo>
          <EarningsAmount>
            KES {item.amount}
          </EarningsAmount>
        </EarningsItem>
      ))}
      
      <div style={{ 
        marginTop: 15, 
        padding: 12, 
        background: '#f8fafc', 
        borderRadius: 12,
        fontSize: '12px',
        color: '#64748b'
      }}>
        💡 <strong>Tip:</strong> Share more videos and engage with posts to maximize your earnings!
      </div>
    </Section>
  );
};

export default EarningsBreakdown;