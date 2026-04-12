// BoostedStoriesRow.js - Fixed (no duplicate /api/v1)

import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import {
  Heart,
  MessageCircle,
  Flame,
  Zap,
  Eye,
  MoreHorizontal,
  Play,
} from "lucide-react";
import EndorsementDetailModal from "./EndorsementDetailModal";

import API from "../../api/config";
import api from "../../api/api";


// ============================================
// HELPER: Build image URL correctly via Gateway
// ============================================
const buildImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // Already a full URL
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  const baseUrl = API.UPLOAD_BASE;
  if (imageUrl.startsWith("/")) {
    return `${baseUrl}${imageUrl}`;
  }

  return `${baseUrl}/${imageUrl}`;
};


// ============================================
// STYLED COMPONENTS - INSTAGRAM STYLE
// ============================================

const Section = styled.div`
  margin-bottom: 32px;
  padding: 0 12px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 4px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HeaderIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff5c01, #ff8c01);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 18px;
    height: 18px;
    color: white;
  }
`;

const HeaderTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
  letter-spacing: -0.3px;
`;

const HeaderSubtitle = styled.span`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
`;

const SeeAllLink = styled.button`
  background: none;
  border: none;
  color: #ff5c01;
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 92, 1, 0.1);
  }
`;

const StoriesContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding: 8px 4px 16px;
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
  width: 100px;
  cursor: pointer;
  scroll-snap-align: start;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const ringGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 92, 1, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(255, 92, 1, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 92, 1, 0); }
`;

const StoryRing = styled.div`
  width: 76px;
  height: 76px;
  border-radius: 50%;
  padding: 2.5px;
  background: linear-gradient(135deg, #ff5c01, #f59e0b);
  animation: ${ringGlow} 2.8s infinite ease-in-out;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StoryAvatar = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .media-type-badge {
    position: absolute;
    bottom: -2px;
    right: -2px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #0a0a0a;

    svg {
      width: 10px;
      height: 10px;
      color: white;
    }
  }

  .boost-badge {
    position: absolute;
    bottom: -2px;
    right: -2px;
    background: #ffcc00;
    border-radius: 50%;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #0a0a0a;

    svg {
      width: 12px;
      height: 12px;
      color: #000;
    }
  }
`;

const StoryUsername = styled.div`
  font-size: 0.7rem;
  font-weight: 500;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
  margin: 0 auto;
`;

const StoryBoostCount = styled.div`
  font-size: 0.6rem;
  text-align: center;
  color: #ffcc00;
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
`;

// Card view for stories with media
const StoryCardHorizontal = styled.div`
  flex: 0 0 auto;
  width: 280px;
  background: #0a0a0a;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.05);

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 92, 1, 0.3);
  }
`;

const CardHeader = styled.div`
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const CardAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff5c01, #ff8c01);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CardUserInfo = styled.div`
  flex: 1;
`;

const CardUserName = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
`;

const CardTime = styled.div`
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.4);
`;

const CardMedia = styled.div`
  width: 100%;
  height: 200px;
  background: #1a1a1a;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .play-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    padding: 12px;
    pointer-events: none;

    svg {
      width: 24px;
      height: 24px;
      color: white;
    }
  }
`;

const CardContent = styled.div`
  padding: 12px;
`;

const CardMessage = styled.p`
  font-size: 0.85rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardStats = styled.div`
  display: flex;
  gap: 16px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const CardStat = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);

  svg {
    width: 14px;
    height: 14px;
  }
`;

const LoadingSkeleton = styled.div`
  flex: 0 0 auto;
  width: 100px;
  text-align: center;
`;

const SkeletonRing = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 8px;
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 0.8;
    }
  }
`;

const SkeletonText = styled.div`
  width: 80%;
  height: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  margin: 0 auto;
  animation: pulse 1.5s ease-in-out infinite;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 20px;
  color: #ff5c01;
  font-size: 0.8rem;
`;

const RetryButton = styled.button`
  background: rgba(255, 92, 1, 0.2);
  border: 1px solid rgba(255, 92, 1, 0.3);
  color: #ff5c01;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.75rem;
  cursor: pointer;
  margin-top: 8px;

  &:hover {
    background: rgba(255, 92, 1, 0.3);
  }
`;

// ============================================
// MAIN COMPONENT
// ============================================

const BoostedStoriesRow = ({
  currentUser,
  leaderId,
  type = "boosted",
  onBoostSuccess,
}) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [useCardView, setUseCardView] = useState(false);

  useEffect(() => {
    if (leaderId) {
      fetchStories();
    } else {
      setLoading(false);
    }
  }, [leaderId, type]);

  const fetchStories = async () => {
    setLoading(true);
    setError(null);

    try {
      let path;

      switch (type) {
        case "boosted":
          path = `/endorsements/leader/${leaderId}/boosted?limit=15`;
          break;
        case "trending":
          path = `/endorsements/leader/${leaderId}/trending?limit=15&days=7`;
          break;
        case "recent":
          path = `/endorsements/leader/${leaderId}/recent?limit=15`;
          break;
        default:
          path = `/endorsements/leader/${leaderId}/boosted?limit=15`;
      }

      
      const responseData = await api.get(path);

      let fetchedStories = [];

      if (responseData?.success && responseData?.data) {
        fetchedStories = Array.isArray(responseData.data)
          ? responseData.data
          : [];
      } else if (Array.isArray(responseData)) {
        fetchedStories = responseData;
      }


      

      // Transform stories to ensure consistent format
      const transformedStories = fetchedStories.map((story) => ({
        id: story.id,
        user_id: story.user_id,
        user_name: story.user_name || "Anonymous",
        message: story.message || story.phrase || "",
        media_type: story.media_type || "text",
        image_url: story.image_url,
        thumbnail_url: story.thumbnail_url,
        likes: story.likes || 0,
        comments: story.comments || 0,
        boost_count: story.boost_count || 0,
        total_boost_amount: story.total_boost_amount || 0,
        created_at: story.created_at,
        isFree: story.isFree || story.amount === 0,
        type: story.type || (story.amount === 0 ? "free" : "paid"),
      }));

      setStories(transformedStories);

      if (transformedStories.length === 0) {
        setError("No stories found");
      }
    } catch (error) {
      console.error(`Error fetching ${type} stories:`, error);

      if (error.code === "ECONNABORTED") {
        setError("Request timeout - please try again");
      } else if (error.response) {
        setError(
          error.response.data?.message ||
            `Server error: ${error.response.status}`,
        );
      } else if (error.request) {
        setError("Cannot connect to server. Please check your connection.");
      } else {
        setError(error.message || "Failed to load stories");
      }

      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (story, index) => {
    setSelectedStory(story);
    setSelectedIndex(index);
  };

  const handleRetry = () => {
    fetchStories();
  };

  // FIXED: Get media URL using buildImageUrl helper
  const getMediaUrl = (story) => {
    if (story.image_url) {
      return buildImageUrl(story.image_url);
    }
    return null;
  };

  // Check if media is video
  const isVideo = (story) => {
    return (
      story.media_type === "video" ||
      (story.image_url && story.image_url.match(/\.(mp4|webm|mov)$/i))
    );
  };

  const getTitle = () => {
    switch (type) {
      case "boosted":
        return "Most Boosted";
      case "trending":
        return "Trending Now";
      case "recent":
        return "Recent Supporters";
      default:
        return "Most Boosted";
    }
  };

  const getSubtitle = () => {
    switch (type) {
      case "boosted":
        return "🔥 Most engaged stories";
      case "trending":
        return "⚡ What's hot right now";
      case "recent":
        return "📖 Latest from supporters";
      default:
        return "🔥 Most engaged stories";
    }
  };

  const getHeaderIcon = () => {
    switch (type) {
      case "boosted":
        return <Flame />;
      case "trending":
        return <Zap />;
      case "recent":
        return <Eye />;
      default:
        return <Flame />;
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
  };

  // Loading state
  if (loading) {
    return (
      <Section>
        <SectionHeader>
          <HeaderLeft>
            <HeaderIcon>{getHeaderIcon()}</HeaderIcon>
            <div>
              <HeaderTitle>{getTitle()}</HeaderTitle>
              <HeaderSubtitle>{getSubtitle()}</HeaderSubtitle>
            </div>
          </HeaderLeft>
        </SectionHeader>
        <StoriesContainer>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <LoadingSkeleton key={i}>
              <SkeletonRing />
              <SkeletonText />
            </LoadingSkeleton>
          ))}
        </StoriesContainer>
      </Section>
    );
  }

  // Error state
  if (error && stories.length === 0) {
    return (
      <Section>
        <SectionHeader>
          <HeaderLeft>
            <HeaderIcon>{getHeaderIcon()}</HeaderIcon>
            <div>
              <HeaderTitle>{getTitle()}</HeaderTitle>
              <HeaderSubtitle>{getSubtitle()}</HeaderSubtitle>
            </div>
          </HeaderLeft>
        </SectionHeader>
        <ErrorState>
          <p>{error}</p>
          <RetryButton onClick={handleRetry}>Retry</RetryButton>
        </ErrorState>
      </Section>
    );
  }

  // Empty state
  if (!stories || stories.length === 0) {
    return null;
  }

  return (
    <>
      <Section>
        <SectionHeader>
          <HeaderLeft>
            <HeaderIcon>{getHeaderIcon()}</HeaderIcon>
            <div>
              <HeaderTitle>{getTitle()}</HeaderTitle>
              <HeaderSubtitle>{getSubtitle()}</HeaderSubtitle>
            </div>
          </HeaderLeft>
          <SeeAllLink onClick={() => setUseCardView(!useCardView)}>
            {useCardView ? "Circle" : "Cards"} view
          </SeeAllLink>
        </SectionHeader>

        <StoriesContainer>
          {stories.map((story, index) => {
            const mediaUrl = getMediaUrl(story);
            const isVideoStory = isVideo(story);
            const boostCount = story.boost_count || 0;
            const isHighBoost = boostCount >= 5;

            if (useCardView) {
              return (
                <StoryCardHorizontal
                  key={story.id || index}
                  onClick={() => handleStoryClick(story, index)}
                >
                  <CardHeader>
                    <CardAvatar>
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(story.user_name || "User")}&background=ff5c01&color=fff&size=36`}
                        alt={story.user_name}
                      />
                    </CardAvatar>
                    <CardUserInfo>
                      <CardUserName>{story.user_name}</CardUserName>
                      <CardTime>{formatTimeAgo(story.created_at)}</CardTime>
                    </CardUserInfo>
                    <MoreHorizontal size={16} color="rgba(255,255,255,0.4)" />
                  </CardHeader>

                  {mediaUrl && story.media_type !== "text" && (
                    <CardMedia>
                      {isVideoStory ? (
                        <>
                          <video src={mediaUrl} preload="metadata" />
                          <div className="play-icon">
                            <Play size={24} />
                          </div>
                        </>
                      ) : (
                        <img
                          src={mediaUrl}
                          alt={story.user_name}
                          onError={(e) => {
                            console.error(`Failed to load image: ${mediaUrl}`);
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                    </CardMedia>
                  )}

                  <CardContent>
                    <CardMessage>
                      {story.message || "Supporting this campaign!"}
                    </CardMessage>
                    <CardStats>
                      <CardStat>
                        <Heart size={14} />
                        <span>{story.likes || 0}</span>
                      </CardStat>
                      <CardStat>
                        <MessageCircle size={14} />
                        <span>{story.comments || 0}</span>
                      </CardStat>
                      <CardStat>
                        <Flame size={14} color="#ffcc00" />
                        <span style={{ color: "#ffcc00" }}>
                          {story.boost_count || 0}
                        </span>
                      </CardStat>
                    </CardStats>
                  </CardContent>
                </StoryCardHorizontal>
              );
            }

            // Circle view (Instagram stories style)
            return (
              <StoryItem
                key={story.id || index}
                onClick={() => handleStoryClick(story, index)}
              >
                <StoryRing
                  style={{
                    background: isHighBoost
                      ? "linear-gradient(135deg, #ff5c01, #ffcc00)"
                      : "linear-gradient(135deg, #ff5c01, #ff8c01)",
                  }}
                >
                  <StoryAvatar>
                    {mediaUrl && story.media_type !== "text" ? (
                      isVideoStory ? (
                        <video src={mediaUrl} preload="metadata" />
                      ) : (
                        <img
                          src={mediaUrl}
                          alt={story.user_name}
                          onError={(e) => {
                            console.error(`Failed to load image: ${mediaUrl}`);
                            e.target.style.display = "none";
                          }}
                        />
                      )
                    ) : (
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(story.user_name || "User")}&background=ff5c01&color=fff&size=96`}
                        alt={story.user_name}
                      />
                    )}

                    {story.media_type === "video" && (
                      <div className="media-type-badge">
                        <Play size={10} />
                      </div>
                    )}

                    {boostCount > 0 && (
                      <div className="boost-badge">
                        <Flame size={10} />
                      </div>
                    )}
                  </StoryAvatar>
                </StoryRing>
                <StoryUsername>
                  {story.user_name?.substring(0, 12)}
                </StoryUsername>
                {boostCount > 0 && (
                  <StoryBoostCount>
                    <Flame size={8} />
                    {boostCount}
                  </StoryBoostCount>
                )}
              </StoryItem>
            );
          })}
        </StoriesContainer>
      </Section>

      {selectedStory && (
        <EndorsementDetailModal
          isOpen={!!selectedStory}
          onClose={() => setSelectedStory(null)}
          endorsements={stories}
          initialIndex={selectedIndex}
          currentUser={currentUser}
        />
      )}
    </>
  );
};

export default BoostedStoriesRow;
