import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

import VideoCard from './videoCard';
import HashtagSection from './hashTagSection';
import FullscreenPlayer from './videoPlayer';
import AddVideoCard from './addVideo';

// Kenyan-themed colors
const KENYA_COLORS = {
  primary: '#BB0000',
  accent: '#006600',
  highlight: '#FFFFFF',
  neutral: '#6B7280',
};

// API base URL
const API_BASE_URL = 'http://localhost:9002/api/v1/reaction';

const Container = styled.div`
  border-top: 1px solid ${KENYA_COLORS.primary}20;
  padding: 12px 0;
  margin: 0;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  margin-bottom: 12px;
`;

const Title = styled.div`
  font-size: 15px;
  color: ${KENYA_COLORS.primary};
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  color: ${KENYA_COLORS.neutral};
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${KENYA_COLORS.primary}10;
    color: ${KENYA_COLORS.primary};
  }
`;

const VideoScrollContainer = styled.div`
  position: relative;
  overflow-x: auto;
  white-space: nowrap;
  padding: 0 16px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const VideoList = styled.div`
  display: inline-flex;
  gap: 10px;
  padding-bottom: 8px;
`;

const ScrollButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  background: ${KENYA_COLORS.primary};
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  z-index: 10;
  opacity: 0.8;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);

  &:hover {
    opacity: 1;
    transform: translateY(-50%) scale(1.1);
  }
`;

const LeftScrollButton = styled(ScrollButton)`
  left: 8px;
`;

const RightScrollButton = styled(ScrollButton)`
  right: 8px;
`;

const VideoBackups = ({ postId, videos = [], onAddVideo, onClose }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [likedVideos, setLikedVideos] = useState({});
  const [videoStats, setVideoStats] = useState({});
  const [showHashtagModal, setShowHashtagModal] = useState(false);
  const [loadingStats, setLoadingStats] = useState({});
  const [statsError, setStatsError] = useState({});
  
  const scrollRef = useRef(null);
  const statsCacheRef = useRef({});

  // Helper function to extract the correct video ID
  const getVideoId = useCallback((video) => {
    if (!video) return null;
    
    // Priority 1: Use public_id (Cloudinary ID like "backup_videos/qpunktw1aphl4lvsaeo8")
    if (video.public_id) {
      return video.public_id;
    }
    
    // Priority 2: Use video_id from API response
    if (video.video_id) {
      return video.video_id;
    }
    
    // Priority 3: Use id (integer database ID) as fallback
    if (video.id) {
      return video.id.toString();
    }
    
    // Priority 4: Try to extract from URL (last resort)
    if (video.video_url || video.url) {
      const url = video.video_url || video.url;
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      // Remove file extension if present
      return lastPart.split('.')[0];
    }
    
    return null;
  }, []);

  // Scroll functions
  const scrollLeft = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }, []);

  // Fetch video stats from API - FIXED: URL encode for backup_videos/ prefix
  const fetchVideoStats = useCallback(async (video) => {
    const videoId = getVideoId(video);
    if (!videoId) return null;
    
    // Check cache (cache for 30 seconds)
    const now = Date.now();
    const cacheKey = `video_${videoId}`;
    const cachedData = statsCacheRef.current[cacheKey];
    
    if (cachedData && (now - cachedData.timestamp < 30000)) {
      return cachedData.data;
    }
    
    try {
      setLoadingStats(prev => ({ ...prev, [videoId]: true }));
      setStatsError(prev => ({ ...prev, [videoId]: null }));
      
      console.log(`Fetching stats for video: ${videoId}`);
      
      // URL encode the videoId since it contains slashes (backup_videos/)
      const encodedVideoId = encodeURIComponent(videoId);
      const response = await axios.get(`${API_BASE_URL}/video/status/${encodedVideoId}`);
      
      if (response.data?.success) {
        const stats = {
          views: response.data.data.views || 0,
          likes: response.data.data.likes || 0,
          video_id: response.data.data.video_id || videoId,
          fetched_at: response.data.data.fetched_at
        };
        
        // Update cache
        statsCacheRef.current[cacheKey] = {
          data: stats,
          timestamp: now
        };
        
        // Update state
        setVideoStats(prev => ({
          ...prev,
          [videoId]: stats
        }));
        
        return stats;
      } else {
        throw new Error('Failed to fetch video stats');
      }
    } catch (error) {
      console.error(`Error fetching stats for video ${videoId}:`, error);
      setStatsError(prev => ({ ...prev, [videoId]: error.message }));
      
      // Return cached data if available, otherwise return default
      if (cachedData) {
        return cachedData.data;
      }
      
      return {
        views: 0,
        likes: 0,
        video_id: videoId,
        fetched_at: new Date().toISOString()
      };
    } finally {
      setLoadingStats(prev => ({ ...prev, [videoId]: false }));
    }
  }, [getVideoId]);

  // Record a view for a video
  const recordVideoView = useCallback(async (video) => {
    const videoId = getVideoId(video);
    if (!videoId) return;
    
    try {
      console.log(`Recording view for video: ${videoId}`);
      
      const response = await axios.post(`${API_BASE_URL}/video/view`, {
        video_id: videoId // Send the full ID with backup_videos/ prefix
      });
      
      if (response.data?.success) {
        // Update local stats
        setVideoStats(prev => ({
          ...prev,
          [videoId]: {
            ...prev[videoId],
            views: (prev[videoId]?.views || 0) + 1,
            video_id: videoId
          }
        }));
        
        // Invalidate cache
        delete statsCacheRef.current[`video_${videoId}`];
        
        console.log('View recorded successfully:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Error recording view:', error);
      // Still update locally even if API fails
      setVideoStats(prev => ({
        ...prev,
        [videoId]: {
          ...prev[videoId],
          views: (prev[videoId]?.views || 0) + 1,
          video_id: videoId
        }
      }));
    }
  }, [getVideoId]);

  // Record a like for a video
  const recordVideoLike = useCallback(async (video, isLiking) => {
    const videoId = getVideoId(video);
    if (!videoId) return;
    
    try {
      console.log(`Recording ${isLiking ? 'like' : 'unlike'} for video: ${videoId}`);
      
      const response = await axios.post(`${API_BASE_URL}/video/like`, {
        video_id: videoId, // Send the full ID with backup_videos/ prefix
        action: isLiking ? 'like' : 'unlike'
      });
      
      if (response.data?.success) {
        // Invalidate cache
        delete statsCacheRef.current[`video_${videoId}`];
        
        console.log('Like recorded successfully:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Error recording like:', error);
    }
  }, [getVideoId]);

  // Handle video selection
  const handleVideoClick = useCallback(async (video, index) => {
    console.log('Video clicked:', video);
    setSelectedVideo(video);
    setCurrentVideoIndex(index);
    
    // Fetch stats for this video
    await fetchVideoStats(video);
  }, [fetchVideoStats]);

  // Handle closing fullscreen player
  const closeFullscreen = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  // Navigate to previous/next video
  const navigateVideo = useCallback(async (direction) => {
    if (videos.length <= 1) return;
    
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentVideoIndex === 0 ? videos.length - 1 : currentVideoIndex - 1;
    } else {
      newIndex = currentVideoIndex === videos.length - 1 ? 0 : currentVideoIndex + 1;
    }
    
    setCurrentVideoIndex(newIndex);
    const nextVideo = videos[newIndex];
    setSelectedVideo(nextVideo);
    
    // Fetch stats for the new video
    await fetchVideoStats(nextVideo);
  }, [currentVideoIndex, videos, fetchVideoStats]);

  // Handle like action
  const handleLike = useCallback(async (video, isLiked) => {
    const videoId = getVideoId(video);
    if (!videoId) return;
    
    const newLikedState = !isLiked;
    
    // Update local state immediately for better UX
    setLikedVideos(prev => ({
      ...prev,
      [videoId]: newLikedState
    }));
    
    setVideoStats(prev => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        likes: newLikedState ? (prev[videoId]?.likes || 0) + 1 : Math.max(0, (prev[videoId]?.likes || 1) - 1)
      }
    }));
    
    // Update selected video stats if it's the current video
    if (selectedVideo && getVideoId(selectedVideo) === videoId) {
      setSelectedVideo(prev => ({
        ...prev,
        likes: newLikedState ? (prev.likes || 0) + 1 : Math.max(0, (prev.likes || 1) - 1)
      }));
    }
    
    // Send to API
    try {
      await recordVideoLike(video, newLikedState);
    } catch (error) {
      console.error('Error sending like:', error);
      // Revert if API fails
      setLikedVideos(prev => ({ ...prev, [videoId]: isLiked }));
      setVideoStats(prev => ({
        ...prev,
        [videoId]: {
          ...prev[videoId],
          likes: newLikedState ? Math.max(0, (prev[videoId]?.likes || 1) - 1) : (prev[videoId]?.likes || 0) + 1
        }
      }));
    }
  }, [selectedVideo, getVideoId, recordVideoLike]);

  // Get current video stats
  const getVideoStatsForVideo = useCallback((video) => {
    const videoId = getVideoId(video);
    if (!videoId) return { views: 0, likes: 0, isLoading: false, error: null };
    
    const stats = videoStats[videoId];
    const isLoading = loadingStats[videoId];
    const error = statsError[videoId];
    
    return {
      views: stats?.views || 0,
      likes: stats?.likes || 0,
      isLoading: isLoading || false,
      error: error || null
    };
  }, [videoStats, loadingStats, statsError, getVideoId]);

  // Load stats for all videos on mount
  useEffect(() => {
    const loadInitialStats = async () => {
      if (videos.length > 0) {
        console.log('Loading initial stats for videos:', videos.length);
        
        // Load stats for first few videos (optimization)
        const videosToLoad = videos.slice(0, 3);
        for (const video of videosToLoad) {
          await fetchVideoStats(video);
        }
      }
    };
    
    loadInitialStats();
  }, [videos, fetchVideoStats]);

  // Auto-refresh stats for selected video every 10 seconds
  useEffect(() => {
    let intervalId;
    
    if (selectedVideo) {
      intervalId = setInterval(() => {
        fetchVideoStats(selectedVideo);
      }, 10000); // Refresh every 10 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [selectedVideo, fetchVideoStats]);

  // Render video card
  const renderVideoCard = (video, index) => {
    const videoId = getVideoId(video);
    const stats = getVideoStatsForVideo(video);
    const isSelected = selectedVideo && getVideoId(selectedVideo) === videoId;
    
    return (
      <VideoCard
        key={videoId || index}
        video={video}
        index={index}
        isSelected={isSelected}
        isLiked={videoId ? likedVideos[videoId] : false}
        stats={stats}
        onVideoClick={handleVideoClick}
        onLike={handleLike}
      />
    );
  };

  return (
    <>
      <Container>
        <Header>
          <Title>
            <span style={{ fontSize: '18px' }}></span>
            Video Backups ({videos.length})
          </Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        {/* Hashtags Section */}
        <HashtagSection
          postId={postId}
          showModal={showHashtagModal}
          setShowModal={setShowHashtagModal}
        />

        {/* Video Cards Section */}
        <div style={{ position: 'relative' }}>
          <VideoScrollContainer ref={scrollRef}>
            <VideoList>
              {videos.map((video, index) => renderVideoCard(video, index))}
              
              <AddVideoCard onUpload={onAddVideo} />
            </VideoList>
          </VideoScrollContainer>
          
          {videos.length > 3 && (
            <>
              <LeftScrollButton onClick={scrollLeft}>
                <ChevronLeft size={14} />
              </LeftScrollButton>
              <RightScrollButton onClick={scrollRight}>
                <ChevronRight size={14} />
              </RightScrollButton>
            </>
          )}
        </div>
      </Container>

      {/* Fullscreen video player */}
      {selectedVideo && (
        <FullscreenPlayer
          video={selectedVideo}
          videos={videos}
          currentIndex={currentVideoIndex}
          isLiked={getVideoId(selectedVideo) ? likedVideos[getVideoId(selectedVideo)] : false}
          stats={getVideoStatsForVideo(selectedVideo)}
          onClose={closeFullscreen}
          onNavigate={navigateVideo}
          onLike={handleLike}
          onRecordView={recordVideoView}
          onShowHashtagModal={() => setShowHashtagModal(true)}
        />
      )}
      
      <style jsx="true">{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default VideoBackups;