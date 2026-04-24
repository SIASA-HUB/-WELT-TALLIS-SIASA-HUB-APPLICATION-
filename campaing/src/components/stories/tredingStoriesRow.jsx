// TrendingStoriesRow.js - Instagram + WhatsApp Status style using EndorsementDetailModal (Green Theme)

import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { Sparkles, Flame, ChevronRight, Heart } from "lucide-react";
import API from "../../api/config";
import api from "../../api/api";
import EndorsementDetailModal from "./EndorsementDetailModal";

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
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  70% { transform: scale(1.02); box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
`;

// ============================================
// STYLED COMPONENTS - Instagram + WhatsApp Style (Green Theme)
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
  background: rgba(34, 197, 94, 0.12);
  padding: 4px 12px;
  border-radius: 30px;

  .dot {
    width: 6px;
    height: 6px;
    background: #22c55e;
    border-radius: 50%;
    animation: ${pulse} 1.5s infinite;
  }

  span {
    font-size: 10px;
    font-weight: 700;
    color: #22c55e;
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
      return "linear-gradient(135deg, #22c55e, #16a34a, #15803d)";
    if (props.$hot) return "linear-gradient(135deg, #4ade80, #22c55e)";
    return "linear-gradient(135deg, #16a34a, #15803d)";
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
  background: linear-gradient(135deg, #22c55e, #15803d);
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
  color: #4ade80;
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
  color: #22c55e;
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
    background: rgba(34, 197, 94, 0.1);
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #888;
  font-size: 12px;
`;

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
      const responseData = await api.get(`/endorsements/recent?limit=100&t=${Date.now()}`);

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
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(story?.user_name || "U")}&background=22c55e&color=fff&bold=true&size=80`;
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

  // This will be called when comments/likes update (optional)
  const handleCommentsUpdate = () => {
    // Optionally refresh the list or update counts
    fetchTrendingStories();
  };

  if (loading) {
    return (
      <Section>
        <SectionHeader>
          <HeaderLeft>
            <HeaderTitle>
              <Sparkles size={14} color="#22c55e" />
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
              <Flame size={14} color="#22c55e" />
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
              <Flame size={14} color="#22c55e" />
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
              <Flame size={14} color="#22c55e" />
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
                        e.target.src = `https://ui-avatars.com/api/?name=${(story.user_name || "U").charAt(0)}&background=22c55e&color=fff`;
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


      <EndorsementDetailModal
        isOpen={selectedStoryIndex !== null}
        onClose={handleClosePlayer}
        endorsements={stories}
        initialIndex={selectedStoryIndex !== null ? selectedStoryIndex : 0}
        currentUser={currentUser}
        onCommentsUpdate={handleCommentsUpdate}
      />
    </>
  );
};

export default TrendingStoriesRow;