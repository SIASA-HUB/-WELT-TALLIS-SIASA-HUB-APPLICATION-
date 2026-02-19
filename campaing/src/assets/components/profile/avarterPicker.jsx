import React from 'react';
import styled, { keyframes } from 'styled-components';
import { X, RefreshCw, Camera } from 'lucide-react';

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const PickerModal = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  z-index: 1000;
  border-radius: 24px 24px 0 0;
  padding: 25px 20px;
  box-shadow: 0 -15px 40px rgba(0,0,0,0.2);
  animation: ${slideUp} 0.4s ease-out;
  max-height: 80vh;
  overflow-y: auto;
`;

const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-top: 15px;
`;

const EmojiItem = styled.div`
  font-size: 30px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.08);
    background: #e2e8f0;
  }
`;

const AvatarPicker = ({ 
  showPicker, 
  setShowPicker, 
  profilePic, 
  generateRandomAvatar, 
  selectEmoji 
}) => {
  const emojis = ['🇰🇪', '🦁', '🔥', '✊', '💎', '🎯', '⭐', '🛡️', '🌍', '🤝', '✌️', '💪', '👑', '🗳️', '📈'];

  return showPicker ? (
    <>
      <div 
        style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.7)', 
          zIndex: 999,
          animation: 'fadeIn 0.3s ease-out'
        }} 
        onClick={() => setShowPicker(false)}
      />
      <PickerModal>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 20 
        }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800, color: '#1e293b', fontSize: '18px' }}>
              Choose Your Identity
            </h3>
            <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '13px' }}>
              Select an avatar or emoji to represent you
            </p>
          </div>
          <button
            onClick={() => setShowPicker(false)}
            style={{
              background: 'none',
              border: 'none',
              padding: 6,
              borderRadius: '50%',
              cursor: 'pointer',
              color: '#64748b',
              ':hover': { background: '#f1f5f9' }
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ 
          marginBottom: 20,
          padding: 16,
          background: '#f8fafc',
          borderRadius: 16,
          border: '2px dashed #cbd5e1'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
            padding: 12,
            background: 'white',
            borderRadius: 12,
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: profilePic.isEmoji ? '#f1f5f9' : `url(${profilePic.url}) center/cover`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 25
            }}>
              {profilePic.isEmoji ? profilePic.emoji : null}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>
                {profilePic.isEmoji ? 'Emoji Avatar' : 'Generated Avatar'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
                {profilePic.isEmoji ? 
                  `Selected emoji: ${profilePic.emoji}` : 
                  'Randomly generated character'
                }
              </div>
            </div>
          </div>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #BB0000, #FF4444)', 
          padding: 16, 
          borderRadius: 16,
          marginBottom: 20,
          cursor: 'pointer'
        }}
        onClick={generateRandomAvatar}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <RefreshCw size={20} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: 'white', fontSize: '14px' }}>
                Generate Random Avatar
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginTop: 2 }}>
                Get a unique, computer-generated character
              </div>
            </div>
          </div>
        </div>

        <h4 style={{ 
          margin: '0 0 12px', 
          fontSize: '13px', 
          fontWeight: 800,
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.8px'
        }}>
          Emoji Selection
        </h4>
        
        <EmojiGrid>
          {emojis.map(emoji => (
            <EmojiItem 
              key={emoji} 
              onClick={() => selectEmoji(emoji)}
              style={{
                background: profilePic.emoji === emoji ? '#e2e8f0' : '#f8fafc',
                border: profilePic.emoji === emoji ? '2px solid #BB0000' : 'none'
              }}
            >
              {emoji}
            </EmojiItem>
          ))}
        </EmojiGrid>

        <button 
          style={{
            background: 'linear-gradient(135deg, #BB0000, #FF4444)',
            color: 'white',
            border: 'none',
            padding: '14px',
            borderRadius: '12px',
            width: '100%',
            fontWeight: 800,
            fontSize: '14px',
            marginTop: 20,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => setShowPicker(false)}
          onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
        >
          Save Changes
        </button>
      </PickerModal>
    </>
  ) : null;
};

export default AvatarPicker;