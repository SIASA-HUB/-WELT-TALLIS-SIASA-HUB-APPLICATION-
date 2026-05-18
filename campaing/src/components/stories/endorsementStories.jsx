// components/endorsements/EndorsementStories.jsx - Fixed Auto-Play Unmuted

import React, { useState, useEffect, useCallback, useRef } from "react";
import styled, { keyframes } from "styled-components";
import {
  Plus,
  TrendingUp,
  MessageCircle,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Play,
  Heart,
  Eye,
  Flame,
  Zap,
} from "lucide-react";
import theme from "../../utils/theme";
import AddStoryModal from "./addStoryModal";
import EndorsementDetailModal from "./EndorsementDetailModal";
import { buildImageUrl, buildVideoUrl } from "../../utils/imageUtils";
import api from "../../api/api";

// ========== ANIMATIONS ==========
const ringGlow = keyframes`
  0% { 
    box-shadow: 0 0 0 0 rgba(255, 92, 1, 0.6);
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% { 
    box-shadow: 0 0 0 10px rgba(255, 92, 1, 0);
    transform: scale(1);
  }
`;

const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// ========== STYLED COMPONENTS - BLACK BACKGROUND ONLY ==========
const StoriesSection = styled.div`
  background: #000000;
  padding: 16px 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
`;

const StoriesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const StoriesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
  animation: ${slideIn} 0.4s ease-out;
`;

const StoriesTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #ff5c01;
  text-transform: uppercase;
  letter-spacing: 1px;

  svg {
    color: #ff5c01;
  }
`;

const RefreshButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    color: #ff5c01;
    background: rgba(255, 92, 1, 0.15);
    transform: rotate(180deg);
  }
`;

const StoriesScroll = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scrollbar-width: thin;
  padding: 8px 4px 16px;
  scroll-snap-type: x mandatory;

  &::-webkit-scrollbar {
    height: 3px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ff5c01;
    border-radius: 10px;
  }
`;

const StoryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex-shrink: 0;
  min-width: 88px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  scroll-snap-align: start;

  &:hover {
    transform: translateY(-5px);
    
    .story-ring {
      transform: scale(1.05);
    }
  }
`;

const StoryRing = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  padding: 3px;
  background: ${(props) =>
    props.$isAdd
      ? "#2a2a2a"
      : props.$isTrending
        ? "#ff5c01"
        : props.$viewed
          ? "#4a4a4a"
          : "#ff5c01"};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${(props) => (props.$isTrending && !props.$viewed ? ringGlow : "none")} 2s infinite;

  &:active {
    transform: scale(0.95);
  }
`;

const StoryAvatar = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  border: ${(props) =>
    props.$isAdd ? `2px dashed #ff5c01` : "none"};
`;

const StoryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const StoryVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
`;

const VideoPlayIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);

  svg {
    width: 18px;
    height: 18px;
    color: white;
    margin-left: 2px;
  }
`;

const TextStoryPreview = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1e3c72;
  color: white;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  padding: 12px;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-height: 1.3;
`;

const StoryName = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #e2e8f0;
  text-align: center;
  max-width: 84px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  span {
    color: #ff5c01;
  }
`;

const AddIcon = styled.div`
  width: 28px;
  height: 28px;
  background: #ff5c01;
  border-radius: 50%;
  border: 2px solid #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: -4px;
  right: -4px;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  z-index: 5;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const MediaTypeBadge = styled.div`
  position: absolute;
  bottom: -4px;
  left: -4px;
  background: #ff5c01;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #000000;
  font-size: 10px;
  z-index: 3;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const ReplyBadge = styled.div`
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #10b981;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #000000;
  z-index: 3;
  animation: ${float} 2s ease-in-out infinite;

  svg {
    width: 12px;
    height: 12px;
    color: white;
  }
`;

const TrendingBadge = styled.div`
  position: absolute;
  top: -6px;
  right: -6px;
  background: #dc2626;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #000000;
  z-index: 4;
  animation: ${float} 1s ease-in-out infinite;

  svg {
    width: 14px;
    height: 14px;
    color: white;
  }
`;

const LoadingShimmer = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;

  svg {
    margin-bottom: 12px;
    opacity: 0.5;
    animation: ${float} 3s ease-in-out infinite;
  }
`;

const SuccessToast = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: white;
  padding: 12px 24px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  z-index: 1000;
  animation: slideInUp 0.3s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translate(-50%, 20px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
`;

// ========== VIDEO COMPONENT WITH AUTO-PLAY UNMUTED ==========
const VideoThumbnail = ({ videoUrl, posterUrl, storyId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const observerRef = useRef(null);

  // Auto-play when video comes into view - UNMUTED
  useEffect(() => {
    if (!containerRef.current || hasAutoPlayed) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAutoPlayed && videoRef.current) {
            setTimeout(() => {
              if (videoRef.current && !isPlaying) {
                videoRef.current.play()
                  .then(() => {
                    setIsPlaying(true);
                    setHasAutoPlayed(true);
                  })
                  .catch(err => {
                    console.log("Auto-play prevented:", err);
                    setIsPlaying(false);
                  });
              }
            }, 100);
          }
        });
      },
      { threshold: 0.5 }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasAutoPlayed, isPlaying]);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => console.log("Playback error:", err));
      }
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setHasAutoPlayed(false);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: '50%'
      }}
    >
      {!isPlaying ? (
        <>
          {posterUrl ? (
            <StoryImage src={posterUrl} alt="Video thumbnail" />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: '#1e3c72',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🎬
            </div>
          )}
          <VideoPlayIcon onClick={handlePlay}>
            <Play size={16} />
          </VideoPlayIcon>
        </>
      ) : (
        <StoryVideo
          ref={videoRef}
          src={videoUrl}
          muted={false}
          playsInline
          loop={false}
          onEnded={handleVideoEnded}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
      )}
    </div>
  );
};

// ========== HELPER FUNCTIONS ==========
const isAutoGeneratedMessage = (message, mediaType) => {
  if (!message) return true;
  const autoMessages = [
    "📷 Photo",
    "🎥 Video",
    "💬 Support message",
    "Support message",
    "Photo",
    "Video",
  ];
  if (
    (mediaType === "image" || mediaType === "video") &&
    autoMessages.includes(message.trim())
  ) {
    return true;
  }
  return false;
};

const getDisplayMessage = (story) => {
  const { message, media_type } = story;
  if (message && !isAutoGeneratedMessage(message, media_type)) {
    return message;
  }
  return null;
};

// ========== MAIN COMPONENT ==========
const EndorsementStories = ({ leaderId, currentUser, onBoostSuccess }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [replies, setReplies] = useState({});
  const [endorsements, setEndorsements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const scrollRef = useRef(null);

  const fetchEndorsements = useCallback(async () => {
    if (!leaderId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const path = `/endorsements/leader/${leaderId}/active?limit=100&t=${Date.now()}`;
      const responseData = await api.get(path);
      if (responseData.success) {
        setEndorsements(responseData.data || []);
      } else {
        setError(responseData.message || "Failed to load stories");
        setEndorsements([]);
      }
    } catch (error) {
      console.error("❌ Error fetching endorsements:", error);
      setError(error.response?.data?.message || "Failed to load stories");
      setEndorsements([]);
    } finally {
      setLoading(false);
    }
  }, [leaderId]);

  useEffect(() => {
    fetchEndorsements();
  }, [fetchEndorsements]);

  useEffect(() => {
    const savedReplies = localStorage.getItem("story_replies");
    if (savedReplies) {
      try {
        setReplies(JSON.parse(savedReplies));
      } catch (e) {
        console.error("Failed to parse saved replies:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(replies).length) {
      localStorage.setItem("story_replies", JSON.stringify(replies));
    }
  }, [replies]);

  const handleAddStoryClick = () => setShowAddModal(true);
  const handleStoryClick = (index) => {
    setSelectedIndex(index);
    setShowStoryModal(true);
  };
  const handleReply = (storyId, reply) => {
    setReplies((prev) => ({
      ...prev,
      [storyId]: [reply, ...(prev[storyId] || [])],
    }));
  };
  const hasReplies = (storyId) => (replies[storyId]?.length || 0) > 0;
  const handleRefresh = () => fetchEndorsements();
  const handleStoryPosted = () => {
    setSuccessMessage("Story posted successfully!");
    setShowSuccess(true);
    if (api.clearCache) api.clearCache();
    fetchEndorsements();
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getMediaIcon = (mediaType) => {
    if (mediaType === "video") return "🎬";
    if (mediaType === "image") return "📷";
    return "💬";
  };

  const getStoryPreview = (story, storyId) => {
    const { media_type, image_url, video_url, user_name, message } = story;

    // Handle videos - UNMUTED AUTO-PLAY
    if (media_type === "video") {
      const videoSrc = video_url || image_url;
      if (videoSrc) {
        const fullVideoUrl = buildVideoUrl ? buildVideoUrl(videoSrc) : videoSrc;
        const posterSrc = image_url ? buildImageUrl(image_url) : null;

        return (
          <VideoThumbnail
            videoUrl={fullVideoUrl}
            posterUrl={posterSrc}
            storyId={storyId}
          />
        );
      }
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1e3c72',
          color: 'white',
          fontSize: '28px'
        }}>
          🎬
        </div>
      );
    }

    // Handle images
    if (media_type === "image" && image_url) {
      const imageSrc = buildImageUrl(image_url);
      return (
        <StoryImage
          src={imageSrc}
          alt={user_name || "Story"}
          onError={(e) => {
            console.warn(`Failed to load image: ${imageSrc}`);
            e.target.style.display = "none";
            if (e.target.parentElement) {
              const fallback = document.createElement("div");
              fallback.style.cssText = "width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1e3c72;color:white;font-size:28px;";
              fallback.innerText = "📷";
              e.target.parentElement.appendChild(fallback);
              e.target.remove();
            }
          }}
        />
      );
    }

    // Handle text stories
    const displayMessage = getDisplayMessage(story);
    if (displayMessage) {
      return (
        <TextStoryPreview>
          {displayMessage.length > 60 ? displayMessage.substring(0, 60) + "..." : displayMessage}
        </TextStoryPreview>
      );
    }

    return <TextStoryPreview>💬 Support</TextStoryPreview>;
  };

  // Filter stories (only last 24 hours)
  const validEndorsements = endorsements.filter((e) => {
    if (!e.created_at) return false;
    const storyDate = new Date(e.created_at).getTime();
    const now = Date.now();
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
    if (now - storyDate > twentyFourHoursInMs) return false;
    if (e.image_url || e.video_url) return true;
    const hasRealMessage = e.message && !isAutoGeneratedMessage(e.message, e.media_type);
    return hasRealMessage;
  });

  return (
    <>
      <StoriesSection>
        <StoriesContainer>
          <StoriesHeader>
            <StoriesTitle>
              <Flame size={14} />
              <span>LIVE STORIES</span>
              <Zap size={12} />
            </StoriesTitle>
            <RefreshButton onClick={handleRefresh}>
              <RefreshCw size={16} />
            </RefreshButton>
          </StoriesHeader>

          <StoriesScroll ref={scrollRef}>
            <StoryItem onClick={handleAddStoryClick}>
              <StoryRing $isAdd>
                <StoryAvatar $isAdd>
                  <Plus size={32} color="white" strokeWidth={2.5} />
                </StoryAvatar>
                <AddIcon>
                  <Plus size={18} strokeWidth={2.5} />
                </AddIcon>
              </StoryRing>
              <StoryName>
                <span>Your Story</span>
              </StoryName>
            </StoryItem>

            {loading ? (
              [...Array(6)].map((_, i) => (
                <StoryItem key={`loader-${i}`}>
                  <LoadingShimmer />
                  <StoryName>...</StoryName>
                </StoryItem>
              ))
            ) : error ? (
              <EmptyState>
                <AlertCircle size={32} />
                <p>{error}</p>
                <RefreshButton onClick={handleRefresh} style={{ marginTop: 8 }}>
                  Try Again
                </RefreshButton>
              </EmptyState>
            ) : validEndorsements.length === 0 ? (
              <EmptyState>
                <MessageCircle size={32} />
                <p>No stories yet. Be the first to post!</p>
              </EmptyState>
            ) : (
              validEndorsements.map((story, index) => {
                const isTrending = (story.likes || 0) > 5 || (story.views || 0) > 50;
                const hasRepliesCount = hasReplies(story.id);
                const latestReply = replies[story.id]?.[0];
                const mediaType = story.media_type || "text";
                const userName = story.user_name?.split(" ")[0] || "Anonymous";
                const isNew = new Date() - new Date(story.created_at) < 3600000;

                return (
                  <StoryItem key={story.id} onClick={() => handleStoryClick(index)}>
                    <StoryRing
                      $viewed={false}
                      $isTrending={isTrending}
                      className="story-ring"
                    >
                      <StoryAvatar>
                        {getStoryPreview(story, story.id)}
                        {hasRepliesCount && (
                          <ReplyBadge>
                            <MessageCircle size={12} />
                          </ReplyBadge>
                        )}
                        <MediaTypeBadge>{getMediaIcon(mediaType)}</MediaTypeBadge>
                        {isTrending && (
                          <TrendingBadge>
                            <Flame size={14} />
                          </TrendingBadge>
                        )}
                      </StoryAvatar>
                    </StoryRing>
                    <StoryName>
                      {userName}
                      {isNew && <span> • New</span>}
                    </StoryName>
                    {latestReply && (
                      <div
                        style={{
                          fontSize: "9px",
                          color: "#10b981",
                          maxWidth: "84px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginTop: "-6px",
                          textAlign: "center",
                          fontWeight: 500,
                        }}
                      >
                        💬 {latestReply.user_name?.split(" ")[0]} replied
                      </div>
                    )}
                  </StoryItem>
                );
              })
            )}
          </StoriesScroll>
        </StoriesContainer>
      </StoriesSection>

      <AddStoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        leader={leaderId}
        user={currentUser}
        onComplete={handleStoryPosted}
      />

      <EndorsementDetailModal
        isOpen={showStoryModal}
        onClose={() => setShowStoryModal(false)}
        endorsements={validEndorsements}
        initialIndex={selectedIndex}
        getImageUrl={buildImageUrl}
        currentUser={currentUser}
        onReply={handleReply}
        onBoost={onBoostSuccess}
        leaderId={leaderId}
      />

      {showSuccess && (
        <SuccessToast>
          <CheckCircle size={18} />
          {successMessage}
        </SuccessToast>
      )}
    </>
  );
};

export default EndorsementStories;