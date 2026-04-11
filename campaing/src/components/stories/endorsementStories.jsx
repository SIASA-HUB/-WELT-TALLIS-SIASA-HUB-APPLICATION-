// components/endorsements/EndorsementStories.jsx - Fixed image URL building

import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import {
  Plus,
  TrendingUp,
  MessageCircle,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Play,
} from "lucide-react";
import theme from "../../utils/theme";
import AddStoryModal from "./addStoryModal";
import EndorsementDetailModal from "./EndorsementDetailModal";
import axios from "axios";

import API_BASE_URL from "./apiConfig.jsx";

const ringGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 92, 1, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(255, 92, 1, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 92, 1, 0); }
`;

const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const StoriesSection = styled.div`
  background: ${theme.colors?.dark || "#0a0a0a"};
  padding: 16px 0;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.1);
`;

const StoriesContainer = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
`;

const StoriesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
`;

const StoriesTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${theme.colors?.primary || "#ff5c01"};
    background: rgba(255, 92, 1, 0.1);
  }
`;

const StoriesScroll = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 4px 0 12px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const StoryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-shrink: 0;
  min-width: 80px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-3px);
  }
`;

const StoryRing = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  padding: 2px;
  background: ${(props) =>
    props.$isAdd
      ? "transparent"
      : props.$hasReplies
        ? "linear-gradient(135deg, #10b981, #34d399)"
        : `linear-gradient(135deg, ${theme.colors?.primary || "#ff5c01"}, #f59e0b)`};
  animation: ${(props) => (props.$isAdd ? "none" : ringGlow)} 2.8s infinite
    ease-in-out;
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
    props.$isAdd ? `2px dashed ${theme.colors?.primary || "#ff5c01"}` : "none"};
`;

const StoryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const VideoPlayIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  svg {
    width: 14px;
    height: 14px;
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
  background: linear-gradient(135deg, #1e3c72, #2a4a8a);
  color: white;
  font-size: 11px;
  font-weight: 500;
  text-align: center;
  padding: 12px;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const StoryName = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: #f1f5f9;
  text-align: center;
  max-width: 76px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ReplyBadge = styled.div`
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #10b981;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #0a0a0a;

  svg {
    width: 10px;
    height: 10px;
    color: white;
  }
`;

const MediaTypeBadge = styled.div`
  position: absolute;
  bottom: -4px;
  left: -4px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #0a0a0a;
  font-size: 8px;
`;

const LoadingShimmer = styled.div`
  width: 80px;
  height: 80px;
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
  }
`;

const SuccessToast = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  z-index: 1000;
  animation: fadeInUp 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  @keyframes fadeInUp {
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

const buildImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // Already a full URL
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Get base URL without /api/v1
  let baseUrl = API_BASE_URL;
  if (baseUrl.includes("/api/v1")) {
    baseUrl = baseUrl.replace(/\/api\/v1\/?$/, "");
  }

  // Remove any leading slash from the image path
  let cleanPath = imageUrl;
  if (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.substring(1);
  }

  // Add base URL
  return `${baseUrl}/${cleanPath}`;
};

const isAutoGeneratedMessage = (message, mediaType) => {
  if (!message) return true;

  const autoMessages = [
    "📷 Photo",
    "📹 Video",
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

// ============================================
// MAIN COMPONENT
// ============================================

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

  const fetchEndorsements = useCallback(async () => {
    if (!leaderId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${API_BASE_URL}/endorsements/leader/${leaderId}/recent?limit=100`;
      console.log("📡 Fetching endorsements from:", url);

      const res = await axios.get(url, { withCredentials: true });

      if (res.data.success) {
        console.log("✅ Fetched endorsements:", res.data.data?.length || 0);
        setEndorsements(res.data.data || []);
      } else {
        setError(res.data.message || "Failed to load stories");
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

  const hasReplies = (storyId) => {
    return (replies[storyId]?.length || 0) > 0;
  };

  const handleRefresh = () => {
    fetchEndorsements();
  };

  const handleStoryPosted = () => {
    setSuccessMessage("Story posted successfully!");
    setShowSuccess(true);
    fetchEndorsements();
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const getMediaIcon = (mediaType) => {
    if (mediaType === "video") return "🎬";
    if (mediaType === "image") return "📷";
    return "💬";
  };

  const getStoryPreview = (story) => {
    const { media_type, image_url, user_name } = story;

    const imageSrc = buildImageUrl(image_url);

    // Image story
    if (media_type === "image" && imageSrc) {
      return (
        <StoryImage
          src={imageSrc}
          alt={user_name}
          onError={(e) => {
            console.error(`Failed to load image: ${imageSrc}`);
            e.target.style.display = "none";
          }}
        />
      );
    }

    // Video story
    if (media_type === "video" && imageSrc) {
      return (
        <>
          <StoryImage src={imageSrc} alt={user_name} />
          <VideoPlayIcon>
            <Play size={14} />
          </VideoPlayIcon>
        </>
      );
    }

    // Text story
    const displayMessage = getDisplayMessage(story);
    if (displayMessage) {
      return (
        <TextStoryPreview>{displayMessage.substring(0, 60)}</TextStoryPreview>
      );
    }

    // Fallback
    return <TextStoryPreview>💬 Support</TextStoryPreview>;
  };

  // Filter valid endorsements (has image OR real message)
  const validEndorsements = endorsements.filter((e) => {
    if (e.image_url) return true;
    const hasRealMessage =
      e.message && !isAutoGeneratedMessage(e.message, e.media_type);
    return hasRealMessage;
  });

  return (
    <>
      <StoriesSection>
        <StoriesContainer>
          <StoriesHeader>
            <StoriesTitle>
              <TrendingUp
                size={14}
                color={theme.colors?.primary || "#ff5c01"}
              />
              STORIES
            </StoriesTitle>
            <RefreshButton onClick={handleRefresh} title="Refresh stories">
              <RefreshCw size={14} />
            </RefreshButton>
          </StoriesHeader>

          <StoriesScroll>
            {/* Add Story Button */}
            <StoryItem onClick={handleAddStoryClick}>
              <StoryRing $isAdd>
                <StoryAvatar $isAdd>
                  <Plus size={24} color={theme.colors?.primary || "#ff5c01"} />
                </StoryAvatar>
              </StoryRing>
              <StoryName>Your Story</StoryName>
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
                <p>No stories yet. Be the first to support!</p>
              </EmptyState>
            ) : (
              validEndorsements.map((supporter, index) => {
                const hasRepliesCount = hasReplies(supporter.id);
                const latestReply = replies[supporter.id]?.[0];
                const mediaType = supporter.media_type || "text";

                return (
                  <StoryItem
                    key={supporter.id}
                    onClick={() => handleStoryClick(index)}
                  >
                    <StoryRing $hasReplies={hasRepliesCount}>
                      <StoryAvatar>
                        {getStoryPreview(supporter)}
                        {hasRepliesCount && (
                          <ReplyBadge>
                            <MessageCircle size={10} />
                          </ReplyBadge>
                        )}
                        <MediaTypeBadge>
                          {getMediaIcon(mediaType)}
                        </MediaTypeBadge>
                      </StoryAvatar>
                    </StoryRing>
                    <StoryName>
                      {supporter.user_name?.split(" ")[0] || "Anonymous"}
                    </StoryName>
                    {latestReply && (
                      <div
                        style={{
                          fontSize: "8px",
                          color: "#10b981",
                          maxWidth: "76px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginTop: "-4px",
                          textAlign: "center",
                        }}
                      >
                        💬 {latestReply.user_name?.split(" ")[0]}
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
          <CheckCircle size={16} />
          {successMessage}
        </SuccessToast>
      )}
    </>
  );
};

export default EndorsementStories;
