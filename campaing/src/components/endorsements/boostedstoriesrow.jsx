// BoostedStoriesRow.js - No Scrollbars, Clean Instagram Style
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import {
  Heart,
  MessageCircle,
  Flame,
  Zap,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import EndorsementDetailModal from "./EndorsementDetailModal";

const API_BASE_URL = "http://localhost:8009";

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

  /* COMPLETELY HIDE SCROLLBAR - Instagram style */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
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

const StoryRing = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff5c01, #ff8c01, #ffcc00);
  padding: 2px;
  margin-bottom: 8px;
  transition: all 0.2s;

  ${StoryItem}:hover & {
    transform: scale(1.02);
  }
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

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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

// Card view (alternative)
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

const CardAvatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
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

// ============================================
// MAIN COMPONENT
// ============================================

const BoostedStoriesRow = ({ currentUser, leaderId, type = "boosted" }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
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
    try {
      let url;

      switch (type) {
        case "boosted":
          url = `${API_BASE_URL}/api/v1/endorsements/leader/${leaderId}/boosted?limit=15`;
          break;
        case "trending":
          url = `${API_BASE_URL}/api/v1/endorsements/leader/${leaderId}/trending?limit=15&days=7`;
          break;
        case "recent":
          url = `${API_BASE_URL}/api/v1/endorsements/leader/${leaderId}/recent?limit=15`;
          break;
        default:
          url = `${API_BASE_URL}/api/v1/endorsements/leader/${leaderId}/boosted?limit=15`;
      }

      const response = await axios.get(url, { withCredentials: true });

      let fetchedStories = [];
      if (response.data?.success && response.data?.data) {
        fetchedStories = Array.isArray(response.data.data)
          ? response.data.data
          : [];
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        fetchedStories = response.data.data;
      } else if (Array.isArray(response.data)) {
        fetchedStories = response.data;
      }

      setStories(fetchedStories);
    } catch (error) {
      console.error(`Error fetching ${type} stories:`, error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (story, index) => {
    setSelectedStory(story);
    setSelectedIndex(index);
  };

  const getAvatarUrl = (story) => {
    if (story?.image_url) {
      return story.image_url.startsWith("http")
        ? story.image_url
        : `${API_BASE_URL}${story.image_url}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(story?.user_name || "User")}&background=ff5c01&color=fff&bold=true&size=96`;
  };

  const getTitle = () => {
    switch (type) {
      case "boosted":
        return "Most Boosted";
      case "trending":
        return "Trending Now";
      case "recent":
        return "Recent";
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
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

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
            if (useCardView) {
              return (
                <StoryCardHorizontal
                  key={story.id}
                  onClick={() => handleStoryClick(story, index)}
                >
                  <CardHeader>
                    <CardAvatar
                      src={getAvatarUrl(story)}
                      alt={story.user_name}
                    />
                    <CardUserInfo>
                      <CardUserName>{story.user_name}</CardUserName>
                      <CardTime>{formatTimeAgo(story.created_at)}</CardTime>
                    </CardUserInfo>
                    <MoreHorizontal size={16} color="rgba(255,255,255,0.4)" />
                  </CardHeader>
                  <CardContent>
                    <CardMessage>
                      {story.message ||
                        story.phrase ||
                        "Standing strong for leadership."}
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

            const boostCount = story.boost_count || 0;
            const isHighBoost = boostCount >= 5;

            return (
              <StoryItem
                key={story.id}
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
                    <img src={getAvatarUrl(story)} alt={story.user_name} />
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
