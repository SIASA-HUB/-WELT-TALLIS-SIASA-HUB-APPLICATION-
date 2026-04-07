// components/endorsements/EndorsementStories.jsx
import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { Plus, TrendingUp, MessageCircle, Loader } from "lucide-react";
import theme from "../../utils/theme";
import AddStoryModal from "./addStoryModal";
import EndorsementDetailModal from "./EndorsementDetailModal";
import axios from "axios";

const ENDORSEMENT_API_URL = "http://localhost:8009";

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
  background: ${theme.colors.dark || "#0a0a0a"};
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

const ViewAllButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary || "#ff5c01"};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 20px;

  &:hover {
    background: rgba(255, 92, 1, 0.15);
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
  min-width: 72px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-3px);
  }
`;

const StoryRing = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  padding: 2px;
  background: ${(props) =>
    props.$isAdd
      ? "transparent"
      : props.$hasReplies
        ? `linear-gradient(135deg, #10b981, #34d399)`
        : `linear-gradient(135deg, ${theme.colors.primary || "#ff5c01"}, #f59e0b)`};
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
    props.$isAdd ? `2px dashed ${theme.colors.primary || "#ff5c01"}` : "none"};
`;

const StoryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const StoryName = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: #f1f5f9;
  text-align: center;
  max-width: 68px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PointsBadge = styled.div`
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(6px);
  border: 1px solid
    ${(props) => (props.$isFree ? "#4ade80" : "rgba(255,92,1,0.4)")};
  color: ${(props) => (props.$isFree ? "#4ade80" : theme.colors.primary)};
  font-size: 8px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 9999px;
  white-space: nowrap;
  z-index: 3;
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

const LoadingShimmer = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const EndorsementStories = ({ leaderId, currentUser, onBoostSuccess }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [replies, setReplies] = useState({});
  const [endorsements, setEndorsements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch endorsements from endorsement service
  const fetchEndorsements = useCallback(async () => {
    if (!leaderId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${ENDORSEMENT_API_URL}/api/v1/endorsements/leader/${leaderId}/recent?limit=100`,
      );
      if (res.data.success) {
        setEndorsements(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching endorsements:", error);
    } finally {
      setLoading(false);
    }
  }, [leaderId]);

  useEffect(() => {
    fetchEndorsements();
  }, [fetchEndorsements]);

  // Load replies from localStorage
  useEffect(() => {
    const savedReplies = localStorage.getItem("story_replies");
    if (savedReplies) {
      try {
        setReplies(JSON.parse(savedReplies));
      } catch (e) {}
    }
  }, []);

  // Save replies to localStorage
  useEffect(() => {
    if (Object.keys(replies).length) {
      localStorage.setItem("story_replies", JSON.stringify(replies));
    }
  }, [replies]);

  const handleAddStoryClick = () => setShowAddModal(true);

  const handleEndorse = async (name, amount, phrase, message, imageFile) => {
    // This will be implemented to call the endorsement service
    console.log("Endorse:", { name, amount, phrase, message, imageFile });
    setShowAddModal(false);
    fetchEndorsements(); // Refresh after adding
  };

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

  const getReplyCount = (storyId) => {
    return replies[storyId]?.length || 0;
  };

  const hasReplies = (storyId) => {
    return getReplyCount(storyId) > 0;
  };

  // Filter out stories with no image or message
  const validEndorsements = endorsements.filter(
    (e) => e.image_url || e.message || e.phrase,
  );

  return (
    <>
      <StoriesSection>
        <StoriesContainer>
          <StoriesHeader>
            <StoriesTitle>
              <TrendingUp size={14} color={theme.colors.primary} />
              SUPPORTER STORIES
            </StoriesTitle>
            {validEndorsements.length > 0 && (
              <ViewAllButton onClick={() => handleStoryClick(0)}>
                View All ({validEndorsements.length})
              </ViewAllButton>
            )}
          </StoriesHeader>

          <StoriesScroll>
            {/* Add Your Story Button */}
            <StoryItem onClick={handleAddStoryClick}>
              <StoryRing $isAdd>
                <StoryAvatar $isAdd>
                  <Plus size={24} color={theme.colors.primary} />
                </StoryAvatar>
              </StoryRing>
              <StoryName>Your Story</StoryName>
            </StoryItem>

            {/* Loading State */}
            {loading
              ? [...Array(6)].map((_, i) => (
                  <StoryItem key={`loader-${i}`}>
                    <LoadingShimmer />
                    <StoryName>...</StoryName>
                  </StoryItem>
                ))
              : validEndorsements.map((supporter, index) => {
                  const isFree = parseInt(supporter.amount || 0) === 0;
                  const hasRepliesCount = hasReplies(supporter.id);
                  const latestReply = replies[supporter.id]?.[0];
                  const imageSrc = supporter.image_url?.startsWith("http")
                    ? supporter.image_url
                    : `${ENDORSEMENT_API_URL}${supporter.image_url || ""}`;
                  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    supporter.user_name || "Supporter",
                  )}&background=ff5c01&color=fff&size=128`;

                  return (
                    <StoryItem
                      key={supporter.id}
                      onClick={() => handleStoryClick(index)}
                    >
                      <StoryRing $hasReplies={hasRepliesCount}>
                        <StoryAvatar>
                          <StoryImage
                            src={imageSrc || defaultAvatar}
                            alt={supporter.user_name || "Supporter"}
                            onError={(e) => {
                              e.target.src = defaultAvatar;
                            }}
                          />
                          <PointsBadge $isFree={isFree}>
                            {isFree ? "FREE" : `${supporter.amount} KES`}
                          </PointsBadge>
                          {hasRepliesCount && (
                            <ReplyBadge>
                              <MessageCircle size={10} />
                            </ReplyBadge>
                          )}
                        </StoryAvatar>
                      </StoryRing>
                      <StoryName>
                        {supporter.user_name || "Anonymous"}
                      </StoryName>
                      {latestReply && (
                        <div
                          style={{
                            fontSize: "8px",
                            color: "#10b981",
                            maxWidth: "68px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            marginTop: "-4px",
                            textAlign: "center",
                          }}
                        >
                          💬 {latestReply.user_name}: {latestReply.reply_text}
                        </div>
                      )}
                    </StoryItem>
                  );
                })}
          </StoriesScroll>
        </StoriesContainer>
      </StoriesSection>

      <AddStoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        leaderId={leaderId}
        user={currentUser}
        onEndorse={handleEndorse}
      />

      <EndorsementDetailModal
        isOpen={showStoryModal}
        onClose={() => setShowStoryModal(false)}
        endorsements={validEndorsements}
        initialIndex={selectedIndex}
        getImageUrl={(url) =>
          url?.startsWith("http") ? url : `${ENDORSEMENT_API_URL}${url || ""}`
        }
        currentUser={currentUser}
        onReply={handleReply}
        onBoost={onBoostSuccess}
        leaderId={leaderId}
      />
    </>
  );
};

export default EndorsementStories;
