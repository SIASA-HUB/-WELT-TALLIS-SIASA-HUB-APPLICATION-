import React from 'react';
import styled from 'styled-components';
import { MapPin, Edit3, Camera } from 'lucide-react';

const HeroSectionContainer = styled.div`
  background: linear-gradient(135deg, #BB0000 0%, #8B0000 100%);
  padding: 40px 20px 60px;
  text-align: center;
  position: relative;
  color: white;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${props => props.$isEmoji ? '#f1f5f9' : `url(${props.$url})`} center/cover;
  border: 4px solid rgba(255, 255, 255, 0.3);
  margin: 0 auto 15px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const RankBadge = styled.div`
  background: linear-gradient(135deg, ${props => props.$color || '#006600'}, #00AA44);
  color: white;
  font-size: 11px;
  font-weight: 800;
  padding: 6px 16px;
  border-radius: 50px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: -18px;
  z-index: 2;
  position: relative;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  text-transform: uppercase;
`;

const HeroSection = ({ 
  profilePic, 
  setShowPicker, 
  currentRank, 
  userData = {},
  RankIcon 
}) => {
  const { name = 'Jane Wateti', location = 'Nairobi, Kileleshwa' } = userData;

  return (
    <HeroSectionContainer>
      <button 
        onClick={() => setShowPicker(true)} // Removed redirect, just opens picker
        style={{ 
          position: 'absolute', 
          top: 25, 
          right: 15, 
          background: 'rgba(255,255,255,0.15)', 
          border: 'none', 
          borderRadius: '50%', 
          padding: 10, 
          color: '#fff',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.25)'}
        onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.15)'}
      >
        <Edit3 size={18} />
      </button>
      
      <Avatar 
        $url={profilePic.isEmoji ? '' : profilePic.url || userData.avatar} 
        $isEmoji={profilePic.isEmoji}
        onClick={() => setShowPicker(true)}
      >
        {profilePic.isEmoji ? profilePic.emoji : null}
        <div style={{
          position: 'absolute', 
          bottom: 5, 
          right: 5, 
          background: '#BB0000', 
          padding: 6, 
          borderRadius: '50%', 
          border: '3px solid rgba(255,255,255,0.3)',
          boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
        }}>
          <Camera size={14} color="white" />
        </div>
      </Avatar>
      
      {currentRank && (
        <RankBadge $color={currentRank.color}>
          <RankIcon size={14} fill="white" /> {currentRank.label}
        </RankBadge>
      )}
      
      <h2 style={{ margin: '15px 0 5px', fontWeight: 800, fontSize: '20px' }}>{name}</h2>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 6,
        fontSize: '14px',
        opacity: 0.9
      }}>
        <MapPin size={16} />
        {location}
      </div>
    </HeroSectionContainer>
  );
};

export default HeroSection;