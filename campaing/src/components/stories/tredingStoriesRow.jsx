// TrendingStoriesRow.js - Fixed with proper API calls using axios

import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { Sparkles, Flame, ChevronRight, Heart } from "lucide-react";
import EndorsementDetailModal from "./EndorsementDetailModal";
import API_BASE_URL from "./apiConfig";

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
// STYLED COMPONENTS
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

// Helper function to build image URL
const buildImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  let baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
  if (imageUrl.startsWith("/uploads")) {
    return `${baseUrl}${imageUrl}`;
  }
  if (imageUrl.startsWith("uploads")) {
    return `${baseUrl}/${imageUrl}`;
  }
  return `${baseUrl}/${imageUrl}`;
};

const calculateTrendingScore = (story) => {
  const likes = story.likes || 0;
  const boosts = story.boost_count || 0;
  const comments = story.comments || 0;
  return likes + comments * 2 + boosts * 5;
};

const TrendingStoriesRow = ({ currentUser, limit = 50 }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewedStories, setViewedStories] = useState(new Set());

  useEffect(() => {
    fetchTrendingStories();
  }, []);

  const fetchTrendingStories = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("📊 Fetching trending stories...");

      // Fetch recent endorsements using axios
      const response = await axios.get(
        `${API_BASE_URL}/endorsements/recent?limit=100`,
        {
          withCredentials: true,
        },
      );

      let allStories = [];

      if (response.data?.success && response.data?.data) {
        allStories = response.data.data;
        console.log(`📥 Fetched ${allStories.length} recent endorsements`);
      } else if (Array.isArray(response.data)) {
        allStories = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        allStories = response.data.data;
      }

      if (allStories.length === 0) {
        setStories([]);
        setError("No stories available");
        setLoading(false);
        return;
      }

      // Calculate trending score for each story and sort
      const storiesWithScore = allStories.map((story) => ({
        ...story,
        trendingScore: calculateTrendingScore(story),
      }));

      // Sort by trending score (highest first)
      storiesWithScore.sort((a, b) => b.trendingScore - a.trendingScore);

      // Take top stories
      const trendingStories = storiesWithScore.slice(0, limit);

      console.log(`🔥 Found ${trendingStories.length} trending stories`);
      trendingStories.forEach((story, idx) => {
        console.log(
          `  ${idx + 1}. Score: ${story.trendingScore} - ${story.user_name}`,
        );
      });

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

  const handleStoryClick = (story, index) => {
    setViewedStories((prev) => new Set(prev).add(story.id));
    setSelectedStory(story);
    setSelectedIndex(index);
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
            <div
              key={i}
              style={{ width: "84px", flexShrink: 0, textAlign: "center" }}
            >
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

  if (!stories.length) return null;

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

            return (
              <StoryItem
                key={story.id}
                onClick={() => handleStoryClick(story, index)}
              >
                <StoryRing
                  $viewed={isViewed}
                  $trending={isTrending}
                  $hot={isHot}
                >
                  <StoryAvatar>
                    <img src={getAvatarUrl(story)} alt="" />
                    {(isTrending || score > 50) && <HotBadge>HOT</HotBadge>}
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

export default TrendingStoriesRow;
