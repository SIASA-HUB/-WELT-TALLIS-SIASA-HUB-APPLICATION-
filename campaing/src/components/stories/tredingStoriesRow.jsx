// TrendingStoriesRow.js - Instagram + WhatsApp Status style

import React, { useState, useEffect, useCallback, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { Sparkles, Flame, ChevronRight, Heart, Play, X, Pause, Eye } from "lucide-react";
import API from "../../api/config";
import api from "../../api/api";

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.02); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const ringPulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 59, 59, 0.4); }
  70% { transform: scale(1.02); box-shadow: 0 0 0 8px rgba(255, 59, 59, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 59, 59, 0); }
`;

// ============================================
// STYLED COMPONENTS - Instagram + WhatsApp Style
// ============================================

const Section = styled.div`
  margin: 12px 0 20px;
  background: #0a0a0a;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #0a0a0a;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LiveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 59, 59, 0.12);
  padding: 4px 12px;
  border-radius: 30px;

  .dot {
    width: 6px;
    height: 6px;
    background: #ff3b3b;
    border-radius: 50%;
    animation: ${pulse} 1.5s infinite;
  }

  span {
    font-size: 10px;
    font-weight: 700;
    color: #ff3b3b;
    letter-spacing: 0.5px;
  }
`;

const HeaderTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StoriesContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 14px;
  padding: 8px 16px 20px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const StoryItem = styled.div`
  flex: 0 0 auto;
  width: 84px;
  cursor: pointer;
  scroll-snap-align: start;
  transition: transform 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  text-align: center;

  &:active {
    transform: scale(0.96);
  }
`;

const StoryRing = styled.div`
  width: 78px;
  height: 78px;
  border-radius: 50%;
  margin: 0 auto 8px;
  background: ${(props) => {
    if (props.$viewed) return "#262626";
    if (props.$trending)
      return "linear-gradient(135deg, #ff3b3b, #ff5c01, #ff8c42)";
    if (props.$hot) return "linear-gradient(135deg, #ff2d55, #ff5c01)";
    return "linear-gradient(135deg, #ff3b3b, #cc0000)";
  }};
  padding: 2.5px;
  position: relative;
  transition: all 0.2s;
  animation: ${(props) => (props.$trending ? ringPulse : "none")} 2s infinite;

  &:hover {
    transform: scale(1.02);
  }
`;

const StoryAvatar = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #0a0a0a;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const HotBadge = styled.div`
  position: absolute;
  bottom: -3px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ff3b3b, #cc0000);
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 8px;
  font-weight: 800;
  color: white;
  white-space: nowrap;
  z-index: 2;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

const StoryUsername = styled.div`
  font-size: 0.7rem;
  font-weight: 500;
  color: #f5f5f5;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 84px;
  margin-top: 6px;
`;

const EngagementBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.55rem;
  font-weight: 600;
  color: #ff8c42;
  margin-top: 2px;

  svg {
    width: 10px;
    height: 10px;
  }
`;

const SkeletonRing = styled.div`
  width: 78px;
  height: 78px;
  border-radius: 50%;
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  margin: 0 auto 8px;
`;

const SkeletonText = styled.div`
  width: 60px;
  height: 10px;
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 5px;
  margin: 4px auto 0;
`;

const SeeAllLink = styled.button`
  background: transparent;
  border: none;
  color: #ff5c01;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 92, 1, 0.1);
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #888;
  font-size: 12px;
`;

// ============================================
// STORY PLAYER MODAL (WhatsApp Status Style)
// ============================================

const StoryModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 100000;
  display: flex;
  flex-direction: column;
`;

const StoryProgressContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 4px;
  padding: 12px;
  z-index: 10;
`;

const StoryProgressBar = styled.div`
  flex: 1;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
`;

const StoryProgressFill = styled.div`
  height: 100%;
  background: white;
  width: ${(props) => props.$width}%;
  transition: width 0.05s linear;
`;

const StoryHeader = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
  background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
`;

const StoryUserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ff3b3b;
`;

const StoryUserInfo = styled.div`
  flex: 1;
  
  .name {
    font-weight: 700;
    font-size: 14px;
    color: white;
  }
  
  .time {
    font-size: 11px;
    color: rgba(255,255,255,0.6);
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
`;

const StoryContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const StoryText = styled.div`
  position: absolute;
  bottom: 100px;
  left: 0;
  right: 0;
  text-align: center;
  padding: 20px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  color: white;
  font-size: 18px;
  font-weight: 500;
`;

const TouchZone = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  z-index: 20;
`;

const LeftZone = styled(TouchZone)`
  left: 0;
`;

const RightZone = styled(TouchZone)`
  right: 0;
`;

const StoryFooter = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  z-index: 10;
`;

const ViewCount = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: rgba(255,255,255,0.7);
  font-size: 12px;
  margin-bottom: 10px;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

// ============================================
// STORY PLAYER COMPONENT
// ============================================

const StoryPlayer = ({ story, onClose, onNext, onPrev, hasNext, hasPrev }) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const STORY_DURATION = 5000;

  useEffect(() => {
    if (isPaused) return;
    
    const interval = 100;
    const step = 100 / (STORY_DURATION / interval);
    
    timerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timerRef.current);
          onNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);
    
    return () => clearInterval(timerRef.current);
  }, [isPaused, onNext]);

  const handleTouchStart = (e) => {
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
  };

  const handleLeftClick = () => {
    if (hasPrev) {
      setProgress(0);
      onPrev();
    }
  };

  const handleRightClick = () => {
    if (hasNext) {
      setProgress(0);
      onNext();
    }
  };

  const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const base = API.UPLOAD_BASE || "http://localhost:5000";
    return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
  };

  const mediaUrl = getMediaUrl(story.image_url);
  const isVideo = story.media_type === "video" || (story.image_url && story.image_url.match(/\.(mp4|webm|mov)$/i));
  
  // Get avatar URL (use story image or fallback)
  const getAvatarUrl = () => {
    if (story.user_avatar) return getMediaUrl(story.user_avatar);
    return `https://ui-avatars.com/api/?name=${story.user_name?.charAt(0) || "U"}&background=ff3b3b&color=fff`;
  };

  return (
    <StoryModalOverlay>
      <StoryProgressContainer>
        <StoryProgressBar>
          <StoryProgressFill $width={progress} />
        </StoryProgressBar>
      </StoryProgressContainer>
      
      <StoryHeader>
        <StoryUserAvatar src={getAvatarUrl()} />
        <StoryUserInfo>
          <div className="name">{story.user_name || "Anonymous"}</div>
          <div className="time">
            {new Date(story.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </StoryUserInfo>
        <CloseButton onClick={onClose}>
          <X size={24} />
        </CloseButton>
      </StoryHeader>
      
      <LeftZone onClick={handleLeftClick} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} />
      <RightZone onClick={handleRightClick} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} />
      
      <StoryContent>
        {mediaUrl ? (
          isVideo ? (
            <video src={mediaUrl} autoPlay playsInline />
          ) : (
            <img src={mediaUrl} alt="Story" />
          )
        ) : (
          <StoryText>{story.message || "💬 Support message"}</StoryText>
        )}
      </StoryContent>
      
      <StoryFooter>
        <ViewCount>
          <Eye size={14} />
          <span>{story.views || 0} views</span>
        </ViewCount>
      </StoryFooter>
    </StoryModalOverlay>
  );
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Helper function to build image URL via Gateway
const buildImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  const baseUrl = API.UPLOAD_BASE || "http://localhost:5000";
  if (imageUrl.startsWith("/")) {
    return `${baseUrl}${imageUrl}`;
  }
  return `${baseUrl}/${imageUrl}`;
};

const calculateTrendingScore = (story) => {
  const likes = story.likes || 0;
  const boosts = story.boost_count || 0;
  const comments = story.comments || 0;
  const views = story.views || 0;
  return likes + comments * 2 + boosts * 5 + views * 0.5;
};

// ============================================
// MAIN COMPONENT
// ============================================

const TrendingStoriesRow = ({ currentUser, limit = 50 }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(null);
  const [viewedStories, setViewedStories] = useState(new Set());

  useEffect(() => {
    fetchTrendingStories();
  }, []);

  const fetchTrendingStories = async () => {
    setLoading(true);
    setError(null);
    try {
      

      const responseData = await api.get("/endorsements/recent?limit=100");

      let allStories = [];

      if (responseData?.success && responseData?.data) {
        allStories = responseData.data;
        
      } else if (Array.isArray(responseData)) {
        allStories = responseData;
      }

      if (allStories.length === 0) {
        setStories([]);
        setError("No stories available");
        setLoading(false);
        return;
      }

      // Filter: must have image OR meaningful message
      const validStories = allStories.filter((s) => {
        const hasImage = s.image_url;
        const hasMeaningfulMessage = s.message && 
          !s.message.includes("📷") && 
          !s.message.includes("📹") &&
          s.message !== "Support message" &&
          s.message !== "💬 Support message";
        return hasImage || hasMeaningfulMessage;
      });

      // Calculate trending score for each story
      const storiesWithScore = validStories.map((story) => ({
        ...story,
        trendingScore: calculateTrendingScore(story),
      }));

      // Sort by trending score (highest first), then by recency
      storiesWithScore.sort((a, b) => {
        if (b.trendingScore !== a.trendingScore) {
          return b.trendingScore - a.trendingScore;
        }
        return new Date(b.created_at) - new Date(a.created_at);
      });

      // Take top stories
      const trendingStories = storiesWithScore.slice(0, limit);
      setStories(trendingStories);
    } catch (error) {
      console.error("Fetch error", error);
      setError("Unable to load trending stories");
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (story) => {
    // Use user_avatar if available
    if (story.user_avatar) {
      return buildImageUrl(story.user_avatar);
    }
    // Use story image as fallback for avatar
    if (story?.image_url) {
      return buildImageUrl(story.image_url);
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(story?.user_name || "U")}&background=ff3b3b&color=fff&bold=true&size=80`;
  };

  const getEngagementLevel = (story) => {
    const score = calculateTrendingScore(story);
    if (score > 50) return "trending";
    if (score > 20) return "hot";
    return "normal";
  };

  const handleStoryClick = (index) => {
    setViewedStories((prev) => new Set(prev).add(stories[index].id));
    setSelectedStoryIndex(index);
  };

  const handleClosePlayer = () => {
    setSelectedStoryIndex(null);
  };

  const handleNextStory = () => {
    if (selectedStoryIndex < stories.length - 1) {
      setSelectedStoryIndex(selectedStoryIndex + 1);
    } else {
      setSelectedStoryIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (selectedStoryIndex > 0) {
      setSelectedStoryIndex(selectedStoryIndex - 1);
    }
  };

  if (loading) {
    return (
      <Section>
        <SectionHeader>
          <HeaderLeft>
            <HeaderTitle>
              <Sparkles size={14} color="#ffcc00" />
              Trending Stories
            </HeaderTitle>
            <LiveIndicator>
              <div className="dot" />
              <span>LIVE</span>
            </LiveIndicator>
          </HeaderLeft>
        </SectionHeader>
        <StoriesContainer>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} style={{ width: "84px", flexShrink: 0, textAlign: "center" }}>
              <SkeletonRing />
              <SkeletonText />
            </div>
          ))}
        </StoriesContainer>
      </Section>
    );
  }

  if (error && stories.length === 0) {
    return (
      <Section>
        <SectionHeader>
          <HeaderLeft>
            <HeaderTitle>
              <Flame size={14} color="#ff3b3b" />
              Trending Stories
            </HeaderTitle>
          </HeaderLeft>
        </SectionHeader>
        <ErrorMessage>{error}</ErrorMessage>
      </Section>
    );
  }

  if (!stories.length && !loading) {
    return (
      <Section>
        <SectionHeader>
          <HeaderLeft>
            <HeaderTitle>
              <Flame size={14} color="#ff3b3b" />
              Trending Stories
            </HeaderTitle>
          </HeaderLeft>
        </SectionHeader>
        <ErrorMessage>No trending stories available yet. Be the first to start a story!</ErrorMessage>
      </Section>
    );
  }

  return (
    <>
      <Section>
        <SectionHeader>
          <HeaderLeft>
            <HeaderTitle>
              <Flame size={14} color="#ff3b3b" />
              Trending Stories
            </HeaderTitle>
            <LiveIndicator>
              <div className="dot" />
              <span>HOT</span>
            </LiveIndicator>
          </HeaderLeft>
          <SeeAllLink onClick={fetchTrendingStories}>
            Refresh <ChevronRight size={14} />
          </SeeAllLink>
        </SectionHeader>

        <StoriesContainer>
          {stories.map((story, index) => {
            const isViewed = viewedStories.has(story.id);
            const engagementLevel = getEngagementLevel(story);
            const isTrending = engagementLevel === "trending";
            const isHot = engagementLevel === "hot";
            const score = calculateTrendingScore(story);
            const avatarUrl = getAvatarUrl(story);

            return (
              <StoryItem key={story.id} onClick={() => handleStoryClick(index)}>
                <StoryRing $viewed={isViewed} $trending={isTrending} $hot={isHot}>
                  <StoryAvatar>
                    <img 
                      src={avatarUrl} 
                      alt={story.user_name || "User"}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${(story.user_name || "U").charAt(0)}&background=ff3b3b&color=fff`;
                      }}
                    />
                    {(isTrending || score > 50) && <HotBadge>🔥 HOT</HotBadge>}
                  </StoryAvatar>
                </StoryRing>
                <StoryUsername>
                  {story.user_name?.substring(0, 12) || "User"}
                </StoryUsername>
                {score > 0 && (
                  <EngagementBadge>
                    <Heart size={8} />
                    {story.likes || 0}
                  </EngagementBadge>
                )}
              </StoryItem>
            );
          })}
        </StoriesContainer>
      </Section>

      {selectedStoryIndex !== null && stories[selectedStoryIndex] && (
        <StoryPlayer
          story={stories[selectedStoryIndex]}
          onClose={handleClosePlayer}
          onNext={handleNextStory}
          onPrev={handlePrevStory}
          hasNext={selectedStoryIndex < stories.length - 1}
          hasPrev={selectedStoryIndex > 0}
        />
      )}
    </>
  );
};

export default TrendingStoriesRow;