import React from 'react';
import styled from 'styled-components';
import { BarChart, Share2, ThumbsUp, ThumbsDown } from 'lucide-react';

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

const EngagementStats = ({ stats = {} }) => {
  const { shares = 45, likes = 312, dislikes = 18 } = stats;

  return (
    <Section>
      <SectionTitle>
        <BarChart size={18} />
        Engagement Stats
      </SectionTitle>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around', 
        textAlign: 'center',
        marginBottom: 15
      }}>
        <div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 800, 
            color: '#1e293b',
            marginBottom: 4
          }}>
            {shares}
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: '#64748b',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            justifyContent: 'center'
          }}>
            <Share2 size={13} />
            Shares
          </div>
        </div>
        
        <div style={{ width: '1px', background: '#f1f5f9' }} />
        
        <div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 800, 
            color: '#10b981',
            marginBottom: 4
          }}>
            {likes}
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: '#64748b',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            justifyContent: 'center'
          }}>
            <ThumbsUp size={13} />
            Likes
          </div>
        </div>
        
        <div style={{ width: '1px', background: '#f1f5f9' }} />
        
        <div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 800, 
            color: '#ef4444',
            marginBottom: 4
          }}>
            {dislikes}
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: '#64748b',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            justifyContent: 'center'
          }}>
            <ThumbsDown size={13} />
            Dislikes
          </div>
        </div>
      </div>
      
      <div style={{ 
        fontSize: '11px', 
        color: '#64748b',
        textAlign: 'center',
        padding: '10px',
        background: '#f8fafc',
        borderRadius: '10px'
      }}>
        Engagement rate: <strong style={{ color: '#BB0000' }}>68%</strong> • Higher than 85% of users
      </div>
    </Section>
  );
};

export default EngagementStats;