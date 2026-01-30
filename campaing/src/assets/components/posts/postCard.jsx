import React, { useState, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';

// --- Kenyan Color Scheme ---
const KENYA_THEME = {
  primary: '#BB0000',        // Kenyan flag red
  secondary: '#000000',      // Black
  accent: '#006600',         // Green
  highlight: '#FFFFFF',      // White
  support: '#00A86B',        // Green for support
  opposition: '#FF6B6B',     // Red for opposition
  neutral: '#6B7280',        // Gray
  trending: '#F59E0B',       // Amber for trending
  background: '#F8FAFC',
  border: '#E2E8F0',
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    light: '#94A3B8'
  },
  gradients: {
    kenya: 'linear-gradient(135deg, #BB0000, #000000, #006600)',
    support: 'linear-gradient(135deg, #00A86B, #34D399)',
    opposition: 'linear-gradient(135deg, #FF6B6B, #EF4444)',
    neutral: 'linear-gradient(135deg, #6B7280, #9CA3AF)'
  },
  partyColors: {
    'UDA': '#BB0000',
    'ODM': '#006600',
    'WIPER': '#8B5CF6',
    'FORD-KENYA': '#10B981',
    'NARC-KENYA': '#EC4899',
    'INDEPENDENT': '#6B7280',
    'NARC': '#8B5CF6'
  }
};

// --- Animations ---
const slideIn = keyframes`
  from { 
    transform: translateY(10px); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0); 
    opacity: 1; 
  }
`;

const fadeIn = keyframes`
  from { 
    opacity: 0; 
  }
  to { 
    opacity: 1; 
  }
`;

const scaleUp = keyframes`
  from { 
    transform: scale(0.95); 
    opacity: 0; 
  }
  to { 
    transform: scale(1); 
    opacity: 1; 
  }
`;

const pulse = keyframes`
  0% { 
    transform: scale(1); 
  }
  50% { 
    transform: scale(1.05); 
  }
  100% { 
    transform: scale(1); 
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px ${KENYA_THEME.primary}40;
  }
  50% {
    box-shadow: 0 0 15px ${KENYA_THEME.primary}60;
  }
`;

// --- SVG Icon Component ---
const SVGIcon = ({ name, size = 24, color = 'currentColor', fill, onClick }) => {
  const icons = {
    thumb_up: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
      </svg>
    ),
    thumb_down: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zM17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
      </svg>
    ),
    chat_bubble: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    share: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    send: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
    emoji: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
    image: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    x: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    star: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || '#F59E0B'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    crown: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || '#F59E0B'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
      </svg>
    ),
    flag: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y1="15" />
      </svg>
    ),
    reply: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 10 4 15 9 20" />
        <path d="M20 4v7a4 4 0 0 1-4 4H4" />
      </svg>
    ),
    kenya_flag: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#BB0000" />
        <rect x="2" y="2" width="20" height="7" rx="4" fill="#000000" />
        <rect x="2" y="15" width="20" height="7" rx="4" fill="#006600" />
        <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" 
          fill="#FFFFFF" stroke="#000000" strokeWidth="0.5" />
      </svg>
    ),
    election: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
      </svg>
    )
  };
  
  return (
    <span 
      onClick={onClick} 
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {icons[name] || <span>?</span>}
    </span>
  );
};

// --- Styled Components ---
const Card = styled.div`
  background: ${KENYA_THEME.background};
  border-radius: 16px;
  margin: 0px auto;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(187, 0, 0, 0.08);
  animation: ${slideIn} 0.3s ease-out;
  border: 2px solid ${KENYA_THEME.border};
  max-width: 480px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    box-shadow: 0 8px 32px rgba(187, 0, 0, 0.12);
    border-color: ${KENYA_THEME.primary}40;
    transform: translateY(-2px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.$party ? KENYA_THEME.partyColors[props.$party] : KENYA_THEME.gradients.kenya};
    background-size: 200% 100%;
    animation: wave 3s linear infinite;
    
    @keyframes wave {
      0% { background-position: 0% 0; }
      100% { background-position: 200% 0; }
    }
  }
`;

const AuthorHeader = styled.div`
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, rgba(187, 0, 0, 0.03), rgba(0, 102, 0, 0.03));
  border-bottom: 1px solid ${KENYA_THEME.border};
`;

const AuthorAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${props => props.$party ? KENYA_THEME.partyColors[props.$party] : KENYA_THEME.gradients.kenya};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
  border: 2px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
`;

const AuthorInfo = styled.div`
  flex: 1;
`;

const AuthorName = styled.div`
  font-weight: 700;
  color: ${KENYA_THEME.text.primary};
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AuthorBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  background: ${props => props.$party ? KENYA_THEME.partyColors[props.$party] : KENYA_THEME.neutral};
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PostTime = styled.div`
  font-size: 12px;
  color: ${KENYA_THEME.text.secondary};
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ContentBody = styled.div`
  padding: 20px;
  color: ${KENYA_THEME.text.primary};
  line-height: 1.6;
  font-size: 15px;
  background: white;
  
  p {
    margin: 0 0 12px 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const PostImage = styled.div`
  margin: 0 -20px 20px;
  overflow: hidden;
  max-height: 320px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.1));
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.5s ease;
  }
  
  &:hover img {
    transform: scale(1.02);
  }
`;

const ApprovalGraph = styled.div`
  padding: 20px;
  border-top: 1px solid ${KENYA_THEME.border};
  background: linear-gradient(135deg, rgba(187, 0, 0, 0.02), rgba(0, 102, 0, 0.02));
`;

const GraphBar = styled.div`
  height: 6px;
  background: ${KENYA_THEME.border};
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 12px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
    
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  }
`;

const ApprovalFill = styled.div`
  width: ${props => props.percentage}%;
  height: 100%;
  background: ${props => props.$party ? 
    KENYA_THEME.partyColors[props.$party] : 
    KENYA_THEME.gradients.support};
  border-radius: 3px;
  transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  z-index: 1;
`;

const GraphStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: ${KENYA_THEME.text.secondary};
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatValue = styled.div`
  font-weight: 700;
  font-size: 16px;
  color: ${props => props.type === 'support' ? KENYA_THEME.support : 
    props.type === 'oppose' ? KENYA_THEME.opposition : 
    KENYA_THEME.text.primary};
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActionFooter = styled.div`
  padding: 16px 20px;
  display: flex;
  gap: 12px;
  align-items: center;
  border-top: 1px solid ${KENYA_THEME.border};
  background: white;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: ${props => props.active ? 
    (props.type === 'like' ? 
      `${KENYA_THEME.support}20` : 
      `${KENYA_THEME.opposition}20`) 
    : 'transparent'};
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.active ? 
    (props.type === 'like' ? KENYA_THEME.support : KENYA_THEME.opposition) 
    : KENYA_THEME.text.secondary};
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;

  &:hover {
    background: ${props => props.active ? 
      (props.type === 'like' ? 
        `${KENYA_THEME.support}30` : 
        `${KENYA_THEME.opposition}30`) 
      : `${KENYA_THEME.primary}10`};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ShareButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: ${KENYA_THEME.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: ${KENYA_THEME.primary}10;
    color: ${KENYA_THEME.primary};
    transform: rotate(15deg);
  }
`;

const ShareDropdown = styled.div`
  position: absolute;
  bottom: 100%;
  right: 0;
  background: white;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid ${KENYA_THEME.border};
  z-index: 1000;
  min-width: 160px;
  animation: ${scaleUp} 0.2s ease-out;
  transform-origin: bottom right;
`;

const ShareOption = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: none;
  border-radius: 8px;
  font-size: 14px;
  color: ${KENYA_THEME.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${KENYA_THEME.primary}10;
    color: ${KENYA_THEME.primary};
  }
`;

const CommentsSection = styled.div`
  border-top: 1px solid ${KENYA_THEME.border};
  background: linear-gradient(135deg, rgba(187, 0, 0, 0.02), rgba(0, 102, 0, 0.02));
  animation: ${fadeIn} 0.3s ease-out;
`;

const CommentInputContainer = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${KENYA_THEME.border};
  background: white;
`;

const CommentInputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
`;

const CommentTextarea = styled.textarea`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid ${KENYA_THEME.border};
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
  resize: none;
  min-height: 44px;
  max-height: 100px;
  outline: none;
  transition: all 0.3s ease;
  background: ${KENYA_THEME.background};
  color: ${KENYA_THEME.text.primary};
  font-family: inherit;

  &::placeholder {
    color: ${KENYA_THEME.text.light};
    font-size: 14px;
  }

  &:focus {
    border-color: ${KENYA_THEME.primary};
    background: white;
    box-shadow: 0 0 0 3px ${KENYA_THEME.primary}20;
  }
`;

const InputActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionIcon = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: ${KENYA_THEME.text.light};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: ${KENYA_THEME.primary}10;
    color: ${KENYA_THEME.primary};
  }
`;

const SendButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: ${props => props.disabled ? KENYA_THEME.neutral : KENYA_THEME.gradients.kenya};
  color: white;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    background: ${props => props.disabled ? KENYA_THEME.neutral : 'linear-gradient(135deg, #CC0000, #111111, #007700)'};
    transform: ${props => props.disabled ? 'none' : 'scale(1.1)'};
  }
`;

const CommentList = styled.div`
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
  background: white;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${KENYA_THEME.background};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${KENYA_THEME.primary};
    border-radius: 3px;
    
    &:hover {
      background: #CC0000;
    }
  }
`;

const CommentItem = styled.div`
  background: ${props => props.$featured ? 
    'linear-gradient(135deg, #FFFBEB, #FEF3C7)' : 
    KENYA_THEME.background};
  border-radius: 12px;
  padding: ${props => props.$featured ? '16px' : '14px'};
  margin-bottom: 12px;
  border: ${props => props.$featured ? 
    `2px solid ${KENYA_THEME.trending}` : 
    `1px solid ${KENYA_THEME.border}`};
  animation: ${fadeIn} 0.3s ease-out;
  position: relative;
  
  ${props => props.$featured && css`
    animation: ${glow} 2s infinite;
    
    &::before {
      content: '👑 Most Liked';
      position: absolute;
      top: -10px;
      right: 12px;
      background: ${KENYA_THEME.trending};
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
      z-index: 1;
    }
  `}

  &:hover {
    border-color: ${KENYA_THEME.primary}60;
    transform: translateX(2px);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const CommentAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CommentAuthorAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$featured ? 
    KENYA_THEME.trending : 
    KENYA_THEME.gradients.kenya};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

const CommentAuthorName = styled.div`
  font-weight: 600;
  color: ${KENYA_THEME.text.primary};
  font-size: 13px;
`;

const CommentMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CommentTime = styled.div`
  font-size: 11px;
  color: ${KENYA_THEME.text.light};
`;

const CommentLikes = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: ${props => props.$featured ? KENYA_THEME.trending : KENYA_THEME.support};
  font-weight: 700;
  background: ${props => props.$featured ? 
    'rgba(245, 158, 11, 0.1)' : 
    'rgba(0, 168, 107, 0.1)'};
  padding: 2px 8px;
  border-radius: 20px;
`;

const CommentContent = styled.div`
  color: ${KENYA_THEME.text.primary};
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 10px;
  word-break: break-word;
`;

const CommentImage = styled.div`
  margin: 8px 0;
  border-radius: 8px;
  overflow: hidden;
  max-height: 200px;
  border: 1px solid ${KENYA_THEME.border};
  
  img {
    width: 100%;
    height: auto;
    max-height: 200px;
    object-fit: cover;
    border-radius: 8px;
  }
`;

const StickerContainer = styled.div`
  margin: 8px 0;
  display: inline-block;
  font-size: 32px;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.2);
  }
`;

const CommentActions = styled.div`
  display: flex;
  gap: 16px;
  padding-top: 10px;
  border-top: 1px solid ${KENYA_THEME.border}80;
`;

const CommentAction = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: none;
  background: transparent;
  border-radius: 20px;
  font-size: 12px;
  color: ${KENYA_THEME.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${KENYA_THEME.primary}10;
    color: ${KENYA_THEME.primary};
  }

  &.active {
    color: ${props => props.type === 'like' ? KENYA_THEME.support : KENYA_THEME.opposition};
    background: ${props => props.type === 'like' ? 
      'rgba(0, 168, 107, 0.1)' : 
      'rgba(255, 107, 107, 0.1)'};
  }
`;

const ReplyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: none;
  background: transparent;
  border-radius: 20px;
  font-size: 12px;
  color: ${KENYA_THEME.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${KENYA_THEME.primary}10;
    color: ${KENYA_THEME.primary};
  }
`;

const StickerPicker = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid ${KENYA_THEME.border};
  z-index: 1000;
  width: 320px;
  max-height: 240px;
  overflow-y: auto;
  animation: ${scaleUp} 0.2s ease-out;
`;

const StickerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
`;

const StickerOption = styled.button`
  width: 48px;
  height: 48px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  padding: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;

  &:hover {
    background: ${KENYA_THEME.primary}10;
    transform: scale(1.1);
  }
`;

const ImagePreview = styled.div`
  margin: 12px 0;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  max-height: 150px;
  border: 2px solid ${KENYA_THEME.border};
  
  img {
    width: 100%;
    height: auto;
    max-height: 150px;
    object-fit: cover;
  }
`;

const RemoveImage = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }
`;

const EmptyComments = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${KENYA_THEME.text.light};
  font-size: 14px;
  
  div:first-child {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }
`;

const ReplyIndicator = styled.div`
  font-size: 12px;
  color: ${KENYA_THEME.primary};
  margin-bottom: 10px;
  padding: 8px 12px;
  background: ${KENYA_THEME.primary}10;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// --- Sticker Library ---
const STICKERS = [
  '🇰🇪', '👍', '👎', '😂', '😍', '😡', '🤔', '👏', '🙌',
  '🔥', '💯', '🎉', '✨', '💪', '❤️', '🤝', '🗳️', '🏛️',
  '⚖️', '💰', '🏥', '🎓', '🚜', '💼', '📚', '🏆'
];

// --- Component ---
export default function PostCard({ post, onUpdatePost }) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [userVote, setUserVote] = useState(post.userVote || null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [commentVotes, setCommentVotes] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const fileInputRef = useRef(null);
  
  if (!post) return null;

  // Calculate approval metrics
  const totalVotes = (post.likes || 0) + (post.dislikes || 0);
  const approvalRate = totalVotes > 0 ? Math.round((post.likes / totalVotes) * 100) : 0;

  // Sort comments by likes (most liked first)
  const sortedComments = post.comments 
    ? [...post.comments].sort((a, b) => (b.likes || 0) - (a.likes || 0))
    : [];

  const handleVote = (type) => {
    if (!onUpdatePost) return;
    
    const newVote = userVote === type ? null : type;
    setUserVote(newVote);
    
    const updatedPost = { ...post };
    
    if (newVote === 'like') {
      updatedPost.likes = (updatedPost.likes || 0) + 1;
      if (userVote === 'dislike') {
        updatedPost.dislikes = Math.max(0, (updatedPost.dislikes || 0) - 1);
      }
    } else if (newVote === 'dislike') {
      updatedPost.dislikes = (updatedPost.dislikes || 0) + 1;
      if (userVote === 'like') {
        updatedPost.likes = Math.max(0, (updatedPost.likes || 0) - 1);
      }
    } else {
      // Removing vote
      if (userVote === 'like') {
        updatedPost.likes = Math.max(0, (updatedPost.likes || 0) - 1);
      } else if (userVote === 'dislike') {
        updatedPost.dislikes = Math.max(0, (updatedPost.dislikes || 0) - 1);
      }
    }
    
    onUpdatePost(updatedPost);
  };

  const handleAddComment = () => {
    if (!newComment.trim() && !selectedImage && !replyingTo?.sticker) return;
    
    const comment = {
      id: Date.now().toString(),
      author: 'You',
      content: newComment,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      likes: 0,
      dislikes: 0,
      image: selectedImage,
      sticker: replyingTo?.sticker,
      isReply: replyingTo ? true : false,
      replyTo: replyingTo?.author
    };
    
    const updatedPost = {
      ...post,
      comments: [comment, ...(post.comments || [])]
    };
    
    onUpdatePost(updatedPost);
    setNewComment('');
    setSelectedImage(null);
    setReplyingTo(null);
  };

  const handleCommentVote = (commentId, type) => {
    if (!onUpdatePost) return;
    
    const updatedPost = { ...post };
    const commentIndex = updatedPost.comments.findIndex(c => c.id === commentId);
    
    if (commentIndex !== -1) {
      const comment = updatedPost.comments[commentIndex];
      
      // Remove previous vote if exists
      const prevVote = commentVotes[commentId];
      if (prevVote === 'like') {
        comment.likes = Math.max(0, (comment.likes || 0) - 1);
      } else if (prevVote === 'dislike') {
        comment.dislikes = Math.max(0, (comment.dislikes || 0) - 1);
      }
      
      // Add new vote if different
      if (type !== prevVote) {
        if (type === 'like') {
          comment.likes = (comment.likes || 0) + 1;
        } else if (type === 'dislike') {
          comment.dislikes = (comment.dislikes || 0) + 1;
        }
        setCommentVotes(prev => ({ ...prev, [commentId]: type }));
      } else {
        setCommentVotes(prev => ({ ...prev, [commentId]: null }));
      }
      
      // Re-sort comments
      updatedPost.comments.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      
      onUpdatePost(updatedPost);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStickerSelect = (sticker) => {
    if (replyingTo) {
      // Add sticker to reply
      setNewComment(prev => prev + ` ${sticker}`);
    } else {
      // Add sticker to new comment
      setNewComment(prev => prev + ` ${sticker}`);
    }
    setShowStickerPicker(false);
  };

  const handleReply = (comment) => {
    setReplyingTo(comment);
    setShowComments(true);
    setNewComment(`@${comment.author} `);
  };

  const handleShare = (platform) => {
    const shareUrl = window.location.href;
    const text = `🇰🇪 Check out this political post: "${post.content.substring(0, 100)}..."`;
    
    let shareLink = '';
    switch(platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        setShowShareMenu(false);
        return;
    }
    
    window.open(shareLink, '_blank', 'noopener,noreferrer');
    setShowShareMenu(false);
  };

  const mostLikedComment = sortedComments.length > 0 ? sortedComments[0] : null;

  return (
    <Card $party={post.party}>
      {/* Author Header */}
      <AuthorHeader>
        <AuthorAvatar 
          $party={post.party}
          color={post.avatarColor}
        >
          {post.author?.[0]?.toUpperCase() || '🇰🇪'}
        </AuthorAvatar>
        <AuthorInfo>
          <AuthorName>
            {post.author || 'Political Candidate'}
            {post.party && (
              <AuthorBadge $party={post.party}>
                {post.party}
              </AuthorBadge>
            )}
          </AuthorName>
          <PostTime>
            <SVGIcon name="clock" size={12} color={KENYA_THEME.text.light} />
            {post.timestamp || '2 hours ago'}
            {post.location && (
              <>
                <span>•</span>
                <span>{post.location}</span>
              </>
            )}
          </PostTime>
        </AuthorInfo>
      </AuthorHeader>

      {/* Content */}
      <ContentBody>
        {post.content}
      </ContentBody>

      {/* Image (if exists) */}
      {post.image && (
        <PostImage>
          <img 
            src={post.image} 
            alt="Campaign" 
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </PostImage>
      )}

      {/* Approval Graph */}
      <ApprovalGraph>
        <GraphBar>
          <ApprovalFill 
            percentage={approvalRate} 
            $party={post.party}
          />
        </GraphBar>
        <GraphStats>
          <StatItem>
            <StatValue type="support">👍 {post.likes || 0}</StatValue>
            <StatLabel>Support</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue type="oppose">👎 {post.dislikes || 0}</StatValue>
            <StatLabel>Oppose</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{totalVotes}</StatValue>
            <StatLabel>Total Votes</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue type={approvalRate > 50 ? 'support' : 'oppose'}>
              {approvalRate}%
            </StatValue>
            <StatLabel>Approval</StatLabel>
          </StatItem>
        </GraphStats>
      </ApprovalGraph>

      {/* Action Footer */}
      <ActionFooter>
        <ActionButton
          onClick={() => handleVote('like')}
          active={userVote === 'like'}
          type="like"
        >
          <SVGIcon 
            name="thumb_up" 
            size={18} 
            color={userVote === 'like' ? KENYA_THEME.support : KENYA_THEME.text.secondary}
            fill={userVote === 'like' ? KENYA_THEME.support : 'none'}
          />
          {post.likes || 0}
        </ActionButton>
        
        <ActionButton
          onClick={() => handleVote('dislike')}
          active={userVote === 'dislike'}
          type="dislike"
        >
          <SVGIcon 
            name="thumb_down" 
            size={18} 
            color={userVote === 'dislike' ? KENYA_THEME.opposition : KENYA_THEME.text.secondary}
            fill={userVote === 'dislike' ? KENYA_THEME.opposition : 'none'}
          />
          {post.dislikes || 0}
        </ActionButton>
        
        <ActionButton onClick={() => setShowComments(!showComments)}>
          <SVGIcon 
            name="chat_bubble" 
            size={18} 
            color={showComments ? KENYA_THEME.primary : KENYA_THEME.text.secondary}
          />
          {post.comments?.length || 0}
        </ActionButton>
        
        <div style={{ position: 'relative' }}>
          <ShareButton onClick={() => setShowShareMenu(!showShareMenu)}>
            <SVGIcon 
              name="share" 
              size={18} 
              color={showShareMenu ? KENYA_THEME.primary : KENYA_THEME.text.secondary}
            />
          </ShareButton>
          {showShareMenu && (
            <ShareDropdown>
              <ShareOption onClick={() => handleShare('twitter')}>
                <SVGIcon name="twitter" size={16} color="#1DA1F2" />
                Twitter
              </ShareOption>
              <ShareOption onClick={() => handleShare('facebook')}>
                <SVGIcon name="facebook" size={16} color="#1877F2" />
                Facebook
              </ShareOption>
              <ShareOption onClick={() => handleShare('whatsapp')}>
                <SVGIcon name="whatsapp" size={16} color="#25D366" />
                WhatsApp
              </ShareOption>
              <ShareOption onClick={() => handleShare('copy')}>
                <SVGIcon name="link" size={16} color={KENYA_THEME.primary} />
                Copy Link
              </ShareOption>
            </ShareDropdown>
          )}
        </div>
      </ActionFooter>

      {/* Comments Section */}
      {showComments && (
        <CommentsSection>
          <CommentInputContainer>
            {replyingTo && (
              <ReplyIndicator>
                <span>Replying to @{replyingTo.author}</span>
                <button
                  onClick={() => setReplyingTo(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: KENYA_THEME.text.light,
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
              </ReplyIndicator>
            )}
            
            {selectedImage && (
              <ImagePreview>
                <img src={selectedImage} alt="Preview" />
                <RemoveImage onClick={() => setSelectedImage(null)}>
                  <SVGIcon name="x" size={14} color="white" />
                </RemoveImage>
              </ImagePreview>
            )}
            
            <CommentInputWrapper>
              <CommentTextarea
                placeholder={replyingTo ? `Reply to @${replyingTo.author}...` : "Add your comment..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows="1"
              />
              
              <InputActions>
                <ActionIcon onClick={() => setShowStickerPicker(!showStickerPicker)}>
                  <SVGIcon name="emoji" size={20} />
                </ActionIcon>
                
                <ActionIcon onClick={() => fileInputRef.current?.click()}>
                  <SVGIcon name="image" size={20} />
                </ActionIcon>
                
                <SendButton 
                  onClick={handleAddComment}
                  disabled={!newComment.trim() && !selectedImage && !replyingTo?.sticker}
                >
                  <SVGIcon name="send" size={18} color="white" />
                </SendButton>
              </InputActions>
              
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleImageUpload}
              />
              
              {showStickerPicker && (
                <StickerPicker>
                  <StickerGrid>
                    {STICKERS.map((sticker, index) => (
                      <StickerOption
                        key={index}
                        onClick={() => handleStickerSelect(sticker)}
                      >
                        {sticker}
                      </StickerOption>
                    ))}
                  </StickerGrid>
                </StickerPicker>
              )}
            </CommentInputWrapper>
          </CommentInputContainer>
          
          <CommentList>
            {sortedComments.length > 0 ? (
              sortedComments.map((comment, index) => {
                const isMostLiked = index === 0 && comment.likes > 0;
                const userVote = commentVotes[comment.id];
                
                return (
                  <CommentItem key={comment.id} $featured={isMostLiked}>
                    <CommentHeader>
                      <CommentAuthor>
                        <CommentAuthorAvatar $featured={isMostLiked}>
                          {comment.author?.[0]?.toUpperCase() || '👤'}
                        </CommentAuthorAvatar>
                        <CommentAuthorName>
                          {comment.author}
                          {isMostLiked && (
                            <SVGIcon name="crown" size={12} color={KENYA_THEME.trending} fill={KENYA_THEME.trending} />
                          )}
                        </CommentAuthorName>
                      </CommentAuthor>
                      <CommentMeta>
                        {comment.likes > 0 && (
                          <CommentLikes $featured={isMostLiked}>
                            <SVGIcon name="thumb_up" size={10} color={isMostLiked ? KENYA_THEME.trending : KENYA_THEME.support} />
                            {comment.likes}
                          </CommentLikes>
                        )}
                        <CommentTime>{comment.timestamp}</CommentTime>
                      </CommentMeta>
                    </CommentHeader>
                    
                    {comment.isReply && (
                      <div style={{
                        fontSize: '12px',
                        color: KENYA_THEME.primary,
                        marginBottom: '6px',
                        padding: '4px 8px',
                        background: `${KENYA_THEME.primary}10`,
                        borderRadius: '6px',
                        fontStyle: 'italic'
                      }}>
                        ↪ Replying to @{comment.replyTo}
                      </div>
                    )}
                    
                    <CommentContent>
                      {comment.content}
                    </CommentContent>
                    
                    {comment.image && (
                      <CommentImage>
                        <img src={comment.image} alt="Comment attachment" />
                      </CommentImage>
                    )}
                    
                    {comment.sticker && (
                      <StickerContainer>
                        {comment.sticker}
                      </StickerContainer>
                    )}
                    
                    <CommentActions>
                      <CommentAction 
                        onClick={() => handleCommentVote(comment.id, 'like')}
                        className={userVote === 'like' ? 'active' : ''}
                        type="like"
                      >
                        <SVGIcon 
                          name="thumb_up" 
                          size={12} 
                          color={userVote === 'like' ? KENYA_THEME.support : KENYA_THEME.text.secondary}
                        />
                        {comment.likes || 0}
                      </CommentAction>
                      <CommentAction 
                        onClick={() => handleCommentVote(comment.id, 'dislike')}
                        className={userVote === 'dislike' ? 'active' : ''}
                        type="dislike"
                      >
                        <SVGIcon 
                          name="thumb_down" 
                          size={12} 
                          color={userVote === 'dislike' ? KENYA_THEME.opposition : KENYA_THEME.text.secondary}
                        />
                        {comment.dislikes || 0}
                      </CommentAction>
                      <ReplyButton onClick={() => handleReply(comment)}>
                        <SVGIcon name="reply" size={12} />
                        Reply
                      </ReplyButton>
                    </CommentActions>
                  </CommentItem>
                );
              })
            ) : (
              <EmptyComments>
                <div>💬</div>
                <div>No comments yet. Be the first to share your thoughts!</div>
              </EmptyComments>
            )}
          </CommentList>
        </CommentsSection>
      )}
    </Card>
  );
}

// Example usage with Kenyan data
export function ExamplePostCard() {
  const [post, setPost] = useState({
    id: '1',
    author: 'William Ruto',
    party: 'UDA',
    location: 'Nairobi, Kenya',
    content: 'Our Bottom-Up Economic Model is transforming Kenya. We are creating opportunities for every Kenyan, from the grassroots to the national level. 🇰🇪 Together, we can build a prosperous nation!',
    likes: 2450,
    dislikes: 320,
    comments: [
      {
        id: 'c1',
        author: 'Sarah M.',
        content: 'Finally, someone focusing on the common mwananchi! The hustler nation is rising.',
        timestamp: '2:45 PM',
        likes: 42,
        dislikes: 2
      },
      {
        id: 'c2',
        author: 'John K.',
        content: 'Promises are good, but we need action. Show us the implementation plan.',
        timestamp: '3:20 PM',
        likes: 28,
        dislikes: 5
      }
    ],
    timestamp: '2 hours ago',
    avatarColor: '#BB0000',
    image: 'https://images.unsplash.com/photo-1581272170836-9a04d4331e09?w=400&h=300&fit=crop'
  });

  const handleUpdatePost = (updatedPost) => {
    setPost(updatedPost);
  };

  return (
    <div style={{ 
      maxWidth: '480px', 
      margin: '0 auto', 
      padding: '20px',
      background: KENYA_THEME.background,
      minHeight: '100vh'
    }}>
      <PostCard
        post={post}
        onUpdatePost={handleUpdatePost}
      />
    </div>
  );
}