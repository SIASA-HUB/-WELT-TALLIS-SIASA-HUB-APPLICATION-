import React from 'react';
import styled from 'styled-components';
import { Share2, MessageCircleMore, ThumbsUp, ArrowDownToLine, ThumbsDown, Video } from 'lucide-react';

// Kenyan-themed colors
const KENYA_COLORS = {
  primary: '#BB0000',
  accent: '#006600',
  highlight: '#FFFFFF',
  neutral: '#6B7280',
};

const Container = styled.div`
  padding: 8px 16px;
  display: flex;
  gap: 4px;
  align-items: center;
  border-top: 1px solid #e5e7eb;
  background: white;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  background: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-height: 36px;

  &:hover {
    background: #f3f4f6;
    color: ${KENYA_COLORS.primary};
  }

  &.active {
    color: ${props => props.type === 'like' ? KENYA_COLORS.accent : KENYA_COLORS.primary};
  }
`;

const Count = styled.span`
  font-weight: 600;
  font-size: 12px;
`;

export default function PostActions({
  likes,
  dislikes,
  comments,
  shares,
  downloads,
  onLike,
  onDislike,
  onComment,
  onShare,
  onToggleBackups,
  onDownload
}) {
  return (
    <Container>
      <ActionButton onClick={onLike}>
        <ThumbsUp size={16} />
        <Count>{likes.toLocaleString()}</Count>
      </ActionButton>
      
      <ActionButton onClick={onDislike}>
        <ThumbsDown size={16} />
        <Count>{dislikes.toLocaleString()}</Count>
      </ActionButton>
      
      <ActionButton onClick={onComment}>
        <MessageCircleMore size={16} />
        <Count>{comments}</Count>
      </ActionButton>
      
      <ActionButton onClick={onShare}>
        <Share2 size={16} />
        <Count>{shares.toLocaleString()}</Count>
      </ActionButton>
      
      <ActionButton onClick={onToggleBackups}>
        <Video size={16} />
        <span>Backup</span>
      </ActionButton>
      
     
    </Container>
  );
}