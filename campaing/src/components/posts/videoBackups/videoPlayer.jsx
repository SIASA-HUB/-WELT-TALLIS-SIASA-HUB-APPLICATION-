import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { X, ChevronLeft, ChevronRight, Eye, Heart, Share2, Download, Pause, Play, Tag } from 'lucide-react';

const KENYA_COLORS = {
  primary: '#BB0000',
  accent: '#006600',
  highlight: '#FFFFFF',
  neutral: '#6B7280',
};

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const heartBeat = keyframes`
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 0; }
`;

const FullscreenPlayer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.98);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.3s ease;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 10000;
  backdrop-filter: blur(10px);
  transition: all 0.2s;

  &:hover {
    background: ${KENYA_COLORS.primary};
    transform: scale(1.1);
  }
`;

const VideoContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 10px;
  overflow: hidden;
`;

const VideoInfoOverlay = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  color: white;
  font-size: 14px;
  font-weight: bold;
  max-width: calc(100% - 100px);
  z-index: 10000;
  background: rgba(0, 0, 0, 0.5);
  padding: 6px 12px;
  border-radius: 6px;
  backdrop-filter: blur(5px);
`;

const VideoPlayer = styled.video`
  width: 100%;
  height: 100%;
  max-height: calc(100vh - 120px);
  object-fit: ${props => props.$mode || 'contain'};
  border-radius: 8px;
  background: #000;
  cursor: pointer;
`;

const ViewsButton = styled.button`
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 12px;
  border-radius: 20px;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(5px);
  border: none;
  cursor: default;
`;

const LikeButton = styled.button`
  position: absolute;
  bottom: 20px;
  right: 20px;
  color: white;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 12px;
  border-radius: 20px;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(5px);
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const ActionButtons = styled.div`
  padding: 12px 16px;
  display: flex;
  justify-content: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.9);
  border-top: 1px solid ${KENYA_COLORS.primary}30;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: ${props => props.$variant === 'primary' ? KENYA_COLORS.primary : 'rgba(255,255,255,0.1)'};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  flex: 1;
  min-width: 80px;
  justify-content: center;

  &:hover {
    background: ${props => props.$variant === 'primary' ? '#990000' : 'rgba(255,255,255,0.2)'};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LikeAnimation = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 80px;
  color: #FF0000;
  z-index: 10001;
  animation: ${heartBeat} 0.8s ease-in-out;
`;

const PlayPauseOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  opacity: ${props => props.$show ? 1 : 0};
  transition: opacity 0.3s;
  z-index: 10000;
  pointer-events: none;
`;

const SwipeIndicator = styled.div`
  position: absolute;
  top: 50%;
  ${props => props.$side === 'left' ? 'left: 10px;' : 'right: 10px;'}
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.3);
  padding: 6px 10px;
  border-radius: 16px;
  opacity: ${props => props.$visible ? 0.8 : 0};
  transition: opacity 0.3s;
`;

const LoadingIndicator = styled.div`
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 6px;
  
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

const VideoPlayerComponent = ({
  video,
  videos,
  currentIndex,
  isLiked,
  stats,
  onClose,
  onNavigate,
  onLike,
  onRecordView,
  onShowHashtagModal
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState('contain');
  const [showSwipeIndicators, setShowSwipeIndicators] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [showPlayPauseOverlay, setShowPlayPauseOverlay] = useState(false);
  const [hasRecordedView, setHasRecordedView] = useState(false);
  
  const videoRef = useRef(null);
  const playPauseTimeoutRef = useRef(null);

  // Record view when video starts playing
  useEffect(() => {
    const recordViewIfNeeded = async () => {
      if (video && video.id && !hasRecordedView && videoRef.current) {
        try {
          if (onRecordView) {
            await onRecordView(video.id);
          }
          setHasRecordedView(true);
        } catch (error) {
          console.error('Error recording view:', error);
        }
      }
    };

    if (videoRef.current && isPlaying && !hasRecordedView) {
      recordViewIfNeeded();
    }
  }, [video, isPlaying, hasRecordedView, onRecordView]);

  // Handle video like
  const handleLike = useCallback(async (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    if (!video.id) return;
    
    const newLikedState = !isLiked;
    
    // Update UI immediately
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 1000);
    
    // Call parent handler
    if (onLike) {
      onLike(video.id, isLiked);
    }
  }, [video.id, isLiked, onLike]);

  // Handle video play/pause
  const togglePlayPause = useCallback((e) => {
    e.stopPropagation();
    
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    
    setShowPlayPauseOverlay(true);
    if (playPauseTimeoutRef.current) {
      clearTimeout(playPauseTimeoutRef.current);
    }
    playPauseTimeoutRef.current = setTimeout(() => {
      setShowPlayPauseOverlay(false);
    }, 800);
  }, []);

  // Handle touch for swipe navigation
  const handleTouchStart = useCallback((e) => {
    setTouchStartX(e.touches[0].clientX);
    setShowSwipeIndicators(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    setTouchEndX(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        onNavigate('next');
      } else {
        onNavigate('prev');
      }
    }
    
    setTimeout(() => setShowSwipeIndicators(false), 1000);
  }, [touchStartX, touchEndX, onNavigate]);

  // Handle share video
  const handleShareVideo = useCallback((e) => {
    e.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: `Check out this video: ${video.title}`,
        url: video.url || window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(video.url || window.location.href);
      alert('Video link copied to clipboard!');
    }
  }, [video]);

  // Handle download video
  const handleDownloadVideo = useCallback((e) => {
    e.stopPropagation();
    
    if (!video.url) return;
    
    const link = document.createElement('a');
    link.href = video.url;
    link.download = `${video.title || 'video'}.mp4`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Video download started!');
  }, [video]);

  // Toggle fullscreen mode
  const toggleFullscreenMode = useCallback((e) => {
    e.stopPropagation();
    setFullscreenMode(prev => prev === 'contain' ? 'cover' : 'contain');
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          onNavigate('prev');
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNavigate('next');
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause(e);
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          handleLike(e);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreenMode(e);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, onClose, togglePlayPause, handleLike, toggleFullscreenMode]);

  const hasMultipleVideos = videos.length > 1;
  const viewsCount = stats?.views || video.views || 0;
  const likesCount = stats?.likes || video.likes || 0;
  const isLoading = stats?.isLoading || false;

  return (
    <FullscreenPlayer
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={togglePlayPause}
    >
      <CloseButton onClick={onClose}>
        <X size={20} />
      </CloseButton>
      
      <VideoInfoOverlay>
        {video.title}
      </VideoInfoOverlay>
      
      {hasMultipleVideos && (
        <>
          <SwipeIndicator $side="left" $visible={showSwipeIndicators}>
            <ChevronLeft size={14} /> Swipe for previous
          </SwipeIndicator>
          
          <SwipeIndicator $side="right" $visible={showSwipeIndicators}>
            Swipe for next <ChevronRight size={14} />
          </SwipeIndicator>
        </>
      )}
      
      <VideoContainer>
        {video.url && !videoError ? (
          <>
            <VideoPlayer
              ref={videoRef}
              src={video.url}
              autoPlay={isPlaying}
              controls={false}
              playsInline
              $mode={fullscreenMode}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={() => {
                console.error('Video failed to load:', video.url);
                setVideoError(true);
              }}
              onLoadedMetadata={() => {
                setVideoError(false);
                if (isPlaying && videoRef.current) {
                  videoRef.current.play().catch(e => {
                    console.log('Auto-play prevented:', e);
                    setIsPlaying(false);
                  });
                }
              }}
            />
            
            <PlayPauseOverlay $show={showPlayPauseOverlay}>
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </PlayPauseOverlay>
          </>
        ) : (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'white',
            zIndex: 10000,
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '20px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            maxWidth: '90%'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎬</div>
            <div style={{ fontSize: '16px', marginBottom: '6px' }}>Video cannot be played</div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '16px' }}>
              The video format may not be supported
            </div>
            <button 
              onClick={() => {
                if (video.url) {
                  window.open(video.url, '_blank');
                }
              }}
              style={{
                background: KENYA_COLORS.primary,
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                marginTop: '8px'
              }}
            >
              Try opening in new tab
            </button>
          </div>
        )}
        
        {showLikeAnimation && (
          <LikeAnimation>❤️</LikeAnimation>
        )}
        
        <ViewsButton>
          <Eye size={16} />
          {formatNumber(viewsCount)} views
          {isLoading && <LoadingIndicator />}
        </ViewsButton>
        
        <LikeButton onClick={handleLike}>
          <Heart 
            size={16} 
            fill={isLiked ? '#FF0000' : 'none'} 
            color={isLiked ? '#FF0000' : 'white'} 
          />
          {formatNumber(likesCount)} likes
          {isLoading && <LoadingIndicator />}
        </LikeButton>
      </VideoContainer>
      
      <ActionButtons>
        <ActionButton 
          $variant="primary" 
          onClick={() => onNavigate('prev')}
          disabled={!hasMultipleVideos}
        >
          <ChevronLeft size={14} /> Prev
        </ActionButton>
        
        <ActionButton onClick={onShowHashtagModal}>
          <Tag size={14} />
          Add Hashtag
        </ActionButton>
        
        <ActionButton onClick={handleShareVideo}>
          <Share2 size={14} />
          Share
        </ActionButton>
        
        <ActionButton onClick={toggleFullscreenMode}>
          {fullscreenMode === 'contain' ? 'Fill' : 'Fit'}
        </ActionButton>
        
        <ActionButton onClick={handleDownloadVideo}>
          <Download size={14} />
          Save
        </ActionButton>
        
        <ActionButton 
          $variant="primary" 
          onClick={() => onNavigate('next')}
          disabled={!hasMultipleVideos}
        >
          Next <ChevronRight size={14} />
        </ActionButton>
      </ActionButtons>
    </FullscreenPlayer>
  );
};

export default VideoPlayerComponent;