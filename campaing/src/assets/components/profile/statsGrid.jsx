import React from 'react';
import styled from 'styled-components';
import { DollarSign, Clock, Share2, ThumbsUp, ThumbsDown } from 'lucide-react';

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 15px 20px;
`;

const MiniCard = styled.div`
  background: white;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
    border-color: #BB0000;
  }
  
  h4 { 
    margin: 0; 
    font-weight: 800; 
    color: #1e293b;
    font-size: 20px;
  }
  
  small { 
    color: #64748b; 
    font-weight: 600; 
    font-size: 11px;
    letter-spacing: 0.5px;
  }
`;

const StatsGrid = ({ stats = {} }) => {
  const { earnings = 4250, timeSpent = 128, shares = 45, likes = 312, dislikes = 18 } = stats;

  return (
    <StatGrid>
      <MiniCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #10b981, #34d399)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DollarSign size={18} color="white" />
          </div>
          <div>
            <small>EARNINGS</small>
            <h4>KES {earnings.toLocaleString()}</h4>
          </div>
        </div>
        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
          From 15 completed tasks
        </div>
      </MiniCard>

      <MiniCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={18} color="white" />
          </div>
          <div>
            <small>TIME INVESTED</small>
            <h4>{timeSpent}h</h4>
          </div>
        </div>
        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
          Average 8h/week
        </div>
      </MiniCard>
    </StatGrid>
  );
};

export default StatsGrid;