import React from 'react';
import styled from 'styled-components';
import { Play, Eye, Heart } from 'lucide-react';

const KENYA_COLORS = {
  primary: '#BB0000',
  accent: '#006600',
  highlight: '#FFFFFF',
  neutral: '#6B7280',
};

const VideoCard = styled.div`
  display: inline-block;
  width: 145px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  border: 1.5px solid ${props => props.$active ? KENYA_COLORS.primary : 'transparent'};

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(187, 0, 0, 0.12);
  }
`;

const VideoThumbnail = styled.div`
  width: 100%;
  height: 180px;
  position: relative;
  overflow: hidden;
  background: #f3f4f6;
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
  
  ${VideoCard}:hover & {
    transform: scale(1.05);
  }
`;

const PlayButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 36px;
  height: 36px;
  background: rgba(187, 0, 0, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  transition: all 0.3s;
  z-index: 2;
  cursor: pointer;

  &:hover {
    background: rgba(187, 0, 0, 1);
    transform: translate(-50%, -50%) scale(1.1);
  }
`;

const DurationBadge = styled.div`
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  font-size: 9px;
  padding: 2px 5px;
  border-radius: 8px;
  font-weight: 600;
  z-index: 2;
  backdrop-filter: blur(4px);
`;

const VideoInfo = styled.div`
  padding: 8px;
`;

const VideoTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${KENYA_COLORS.primary};
  margin-bottom: 4px;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
`;

const VideoStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: ${KENYA_COLORS.neutral};
  font-weight: 500;
  
  span {
    display: flex;
    align-items: center;
    gap: 2px;
    cursor: pointer;
    
    &:hover {
      color: ${KENYA_COLORS.primary};
    }
  }
`;

const LoadingIndicator = styled.div`
  display: inline-block;
  width: 8px;
  height: 8px;
  border: 1px solid rgba(187, 0, 0, 0.1);
  border-top: 1px solid ${KENYA_COLORS.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 2px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  const n = typeof num === 'string' ? parseInt(num.replace(/[^0-9]/g, '')) || 0 : num;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
};

const VideoCardComponent = ({ 
  video, 
  index, 
  isSelected, 
  isLiked, 
  stats, 
  onVideoClick, 
  onLike 
}) => {
  const handleClick = () => {
    onVideoClick(video, index);
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (video.id) {
      onLike(video.id, isLiked);
    }
  };

  const viewsCount = stats?.views || video.views || 0;
  const likesCount = stats?.likes || video.likes || 0;
  const isLoading = stats?.isLoading || false;
  const hasError = stats?.error;

  return (
    <VideoCard 
      $active={isSelected}
      onClick={handleClick}
      title={video.title || 'Untitled Video'}
    >
      <VideoThumbnail>
        {video.thumbnail ? (
          <ThumbnailImage 
            src={video.thumbnail} 
            alt={video.title}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.style.background = 'linear-gradient(135deg, #BB0000, #006600)';
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #BB0000, #006600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px'
          }}>
            🎬
          </div>
        )}
        <PlayButton>
          <Play size={14} />
        </PlayButton>
        
        {isLiked && (
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            color: '#FF0000',
            fontSize: '10px',
            zIndex: 3,
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            ❤️
          </div>
        )}
        
        <DurationBadge>{video.duration || '0:30'}</DurationBadge>
      </VideoThumbnail>
      <VideoInfo>
        <VideoTitle>{video.title || 'Untitled Video'}</VideoTitle>
        <VideoStats>
          <span title={`${viewsCount} views`} onClick={(e) => e.stopPropagation()}>
            <Eye size={8} />
            {formatNumber(viewsCount)}
            {isLoading && <LoadingIndicator />}
          </span>
          <span title={`${likesCount} likes`} onClick={handleLikeClick}>
            <Heart size={8} fill={isLiked ? '#FF0000' : 'none'} color={isLiked ? '#FF0000' : KENYA_COLORS.neutral} />
            {formatNumber(likesCount)}
            {isLoading && <LoadingIndicator />}
          </span>
          <span style={{ color: KENYA_COLORS.primary }}>
            {video.type === 'tiktok' ? '📱' : '🎬'}
          </span>
        </VideoStats>
        {hasError && (
          <div style={{
            fontSize: '7px',
            color: '#ef4444',
            marginTop: '4px',
            fontStyle: 'italic'
          }}>
            Stats unavailable
          </div>
        )}
      </VideoInfo>
    </VideoCard>
  );
};

export default VideoCardComponent;