// components/endorsements/EndorsementDetailModal.jsx - Clean Professional Story View
import React, { useState, useEffect, useRef, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { X, Heart, MessageCircle, TrendingUp, Clock, Play } from "lucide-react";
import axios from "axios";
import BoostModal from "../Wallet/boostModal";
import EndorsementComments from "./endorsementComents";

const slideUp = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

const glowPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 92, 1, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(255, 92, 1, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 92, 1, 0); }
`;

const API_BASE_URL = "http://localhost:8009";

// Helper function to build image URL
const buildImageUrl = (imageUrl, createdAt) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl.startsWith("/uploads")) return `${API_BASE_URL}${imageUrl}`;
  if (imageUrl.startsWith("uploads")) return `${API_BASE_URL}/${imageUrl}`;
  if (createdAt) {
    const date = new Date(createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${API_BASE_URL}/uploads/endorsements/${year}/${month}/${imageUrl}`;
  }
  return `${API_BASE_URL}/uploads/endorsements/${imageUrl}`;
};

// Styled Components
const FullScreenOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 100000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ProgressContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 2px;
  z-index: 100;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.3);
`;

const ProgressTrack = styled.div`
  flex: 1;
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${(props) => (props.$active ? "#ff5c01" : "white")};
  width: ${(props) => props.$width}%;
  transition: width 0.05s linear;
`;

const StoryHeader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 48px 16px 20px;
  z-index: 50;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  background: #1a1a1a;
  border: 2px solid #ff5c01;
  animation: ${glowPulse} 2s infinite;
`;

const UserTextInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 700;
  font-size: 0.9rem;
  color: white;
`;

const UserDetail = styled.div`
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
`;

const CloseBtn = styled.button`
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

// Full-screen media container
const FullScreenMedia = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

// Strong gradient overlay for better text visibility
const GradientOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0.7) 30%,
    rgba(0, 0, 0, 0.2) 60%,
    transparent 100%
  );
  height: 50%;
  z-index: 30;
  pointer-events: none;
`;

// Dark overlay for better text contrast
const DarkOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 25;
  pointer-events: none;
`;

// Message display - clean text with shadow
const MessageDisplay = styled.div`
  position: absolute;
  bottom: 120px;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 40;
  padding: 0 24px;
`;

const MessageText = styled.div`
  font-size: 1.3rem;
  line-height: 1.5;
  font-weight: 500;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
  max-width: 85%;
  margin: 0 auto;
  animation: ${fadeIn} 0.3s ease;
`;

// Centered text for no-media stories
const CenteredMessage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  z-index: 40;
  padding: 0 40px;
  background: #000;
`;

const CenteredText = styled.div`
  font-size: 1.6rem;
  line-height: 1.5;
  font-weight: 500;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  max-width: 85%;
  margin: 0 auto;
  animation: ${fadeIn} 0.3s ease;
`;

const EndorsementMeta = styled.div`
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 32px;
  z-index: 40;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: white;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  padding: 6px 14px;
  border-radius: 30px;

  svg {
    width: 14px;
    height: 14px;
    color: #ff5c01;
  }
`;

const RightActions = styled.div`
  position: absolute;
  right: 16px;
  bottom: 30%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 50;
`;

const ActionButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border: none;
  padding: 10px;
  color: white;
  gap: 4px;
  cursor: pointer;
  min-width: 52px;
  border-radius: 30px;
  transition: all 0.2s;

  span {
    font-size: 0.65rem;
    font-weight: 600;
  }

  &:active {
    transform: scale(0.95);
  }

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
`;

const CountSpan = styled.span`
  font-size: 0.65rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
`;

const NavigationZone = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 30%;
  z-index: 40;
`;

const LeftZone = styled(NavigationZone)`
  left: 0;
`;
const RightZone = styled(NavigationZone)`
  right: 0;
`;

const CommentsModalOverlay = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #0a0a0a;
  height: 70vh;
  z-index: 100001;
  display: flex;
  flex-direction: column;
  animation: ${slideUp} 0.3s ease-out;
  border-radius: 20px 20px 0 0;
`;

const CommentsModalHeader = styled.div`
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const EndorsementDetailModal = ({
  isOpen,
  onClose,
  endorsements = [],
  initialIndex = 0,
  currentUser,
  onCommentsUpdate,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [likesState, setLikesState] = useState({});
  const [likesCountState, setLikesCountState] = useState({});
  const [commentsState, setCommentsState] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});

  const timerRef = useRef(null);
  const STORY_DURATION = 5000;

  const current = endorsements[currentIndex];

  const loadComments = useCallback(async (storyId) => {
    if (!storyId) return;
    setCommentsLoading((prev) => ({ ...prev, [storyId]: true }));
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/endorsements/${storyId}/comments`,
      );
      let comments = [];
      if (response.data.data?.comments) {
        comments = response.data.data.comments;
      } else if (response.data.comments) {
        comments = response.data.comments;
      } else if (Array.isArray(response.data.data)) {
        comments = response.data.data;
      } else if (Array.isArray(response.data)) {
        comments = response.data;
      }
      setCommentsState((prev) => ({ ...prev, [storyId]: comments }));
    } catch (error) {
      console.error("Error loading comments:", error);
      setCommentsState((prev) => ({ ...prev, [storyId]: [] }));
    } finally {
      setCommentsLoading((prev) => ({ ...prev, [storyId]: false }));
    }
  }, []);

  useEffect(() => {
    if (isOpen && current?.id) {
      loadComments(current.id);
      if (
        current.likes !== undefined &&
        likesCountState[current.id] === undefined
      ) {
        setLikesCountState((prev) => ({
          ...prev,
          [current.id]: current.likes || 0,
        }));
      }
    }
  }, [isOpen, current?.id, loadComments, current?.likes]);

  const getAvatarUrl = (item) => {
    if (item?.image_url) {
      return buildImageUrl(item.image_url, item.created_at);
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(item?.user_name || "User")}&background=ff5c01&color=fff&size=100`;
  };

  const getMediaUrl = (item) => {
    if (item?.image_url) {
      return buildImageUrl(item.image_url, item.created_at);
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const capitalizeFirst = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setProgress(0);
    }
  }, [isOpen, initialIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < endorsements.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, endorsements.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!isOpen || isPaused || showComments || showBoostModal) return;

    const interval = 100;
    const step = 100 / (STORY_DURATION / interval);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timerRef.current);
  }, [isOpen, isPaused, showComments, showBoostModal, handleNext]);

  const handleLike = async () => {
    if (!current) return;
    const storyId = current.id;
    const isLiked = likesState[storyId];
    const currentLikes = likesCountState[storyId] || current.likes || 0;

    setLikesState((prev) => ({ ...prev, [storyId]: !isLiked }));
    setLikesCountState((prev) => ({
      ...prev,
      [storyId]: isLiked ? currentLikes - 1 : currentLikes + 1,
    }));

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/endorsements/${storyId}/like`,
        { user_id: currentUser?.id || "anonymous" },
      );
      if (response.data.success) {
        setLikesState((prev) => ({ ...prev, [storyId]: response.data.liked }));
        setLikesCountState((prev) => ({
          ...prev,
          [storyId]: response.data.likes,
        }));
        if (response.data.likes !== undefined && current) {
          current.likes = response.data.likes;
        }
      }
    } catch (e) {
      console.error("Error liking endorsement:", e);
      setLikesState((prev) => ({ ...prev, [storyId]: isLiked }));
      setLikesCountState((prev) => ({ ...prev, [storyId]: currentLikes }));
    }
  };

  const handleSendComment = async (commentData) => {
    if (!current) return;
    const storyId = current.id;
    const newComment = {
      id: Date.now(),
      user_name: currentUser?.name || "Anonymous",
      comment: commentData.content,
      created_at: new Date().toISOString(),
      likes: 0,
      liked: false,
    };

    setCommentsState((prev) => ({
      ...prev,
      [storyId]: [...(prev[storyId] || []), newComment],
    }));

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/endorsements/${storyId}/comments`,
        {
          user_id: currentUser?.id || "anonymous",
          user_name: currentUser?.name || "Anonymous",
          comment: commentData.content,
        },
      );
      if (response.data.success && response.data.data) {
        setCommentsState((prev) => ({
          ...prev,
          [storyId]: prev[storyId].map((c) =>
            c.id === newComment.id ? response.data.data : c,
          ),
        }));
        if (onCommentsUpdate) onCommentsUpdate(storyId, response.data.data);
      }
    } catch (error) {
      console.error("Error sending comment:", error);
      setCommentsState((prev) => ({
        ...prev,
        [storyId]: prev[storyId].filter((c) => c.id !== newComment.id),
      }));
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!current) return;
    const storyId = current.id;
    const comment = commentsState[storyId]?.find((c) => c.id === commentId);
    if (!comment) return;

    const wasLiked = comment.liked;
    const newLikesCount = wasLiked
      ? (comment.likes || 0) - 1
      : (comment.likes || 0) + 1;

    setCommentsState((prev) => ({
      ...prev,
      [storyId]: prev[storyId].map((c) =>
        c.id === commentId
          ? { ...c, liked: !wasLiked, likes: newLikesCount }
          : c,
      ),
    }));

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/comments/${commentId}/like`,
        { user_id: currentUser?.id || "anonymous" },
      );
      if (response.data.success) {
        setCommentsState((prev) => ({
          ...prev,
          [storyId]: prev[storyId].map((c) =>
            c.id === commentId
              ? { ...c, liked: response.data.liked, likes: response.data.likes }
              : c,
          ),
        }));
      }
    } catch (error) {
      console.error("Error liking comment:", error);
      setCommentsState((prev) => ({
        ...prev,
        [storyId]: prev[storyId].map((c) =>
          c.id === commentId
            ? { ...c, liked: wasLiked, likes: comment.likes || 0 }
            : c,
        ),
      }));
    }
  };

  if (!isOpen || !current) return null;

  const currentLikesCount =
    likesCountState[current.id] !== undefined
      ? likesCountState[current.id]
      : current.likes || 0;

  const currentCommentsCount = commentsState[current.id]?.length || 0;
  const mediaUrl = getMediaUrl(current);
  const hasMedia =
    mediaUrl &&
    (current.media_type === "image" || current.media_type === "video");
  const isVideo = hasMedia && current.media_type === "video";
  const hasMessage = current.message && current.message.trim().length > 0;
  const displayMessage = hasMessage
    ? current.message
    : current.phrase || "Standing strong for leadership";

  return (
    <>
      <FullScreenOverlay>
        <ProgressContainer>
          {endorsements.map((_, idx) => (
            <ProgressTrack key={idx}>
              <ProgressFill
                $active={idx === currentIndex}
                $width={
                  idx < currentIndex ? 100 : idx === currentIndex ? progress : 0
                }
              />
            </ProgressTrack>
          ))}
        </ProgressContainer>

        <StoryHeader>
          <UserInfo>
            <UserAvatar src={getAvatarUrl(current)} alt={current.user_name} />
            <UserTextInfo>
              <UserName>
                {capitalizeFirst(current.user_name || "Anonymous")}
              </UserName>
              <UserDetail>
                <Clock size={10} />
                <span>{formatDate(current.created_at)}</span>
              </UserDetail>
            </UserTextInfo>
          </UserInfo>
          <CloseBtn onClick={onClose}>
            <X size={20} />
          </CloseBtn>
        </StoryHeader>

        <LeftZone onClick={handlePrev} />
        <RightZone onClick={handleNext} />

        {/* Full Screen Media - NO PHOTO ICONS */}
        {hasMedia ? (
          <>
            <FullScreenMedia>
              {isVideo ? (
                <video src={mediaUrl} autoPlay loop playsInline />
              ) : (
                <img src={mediaUrl} alt="Story" />
              )}
            </FullScreenMedia>
            <DarkOverlay />
            <GradientOverlay />
          </>
        ) : null}

        {/* Message Display - Clean text with strong shadow */}
        <MessageDisplay>
          <MessageText>{displayMessage}</MessageText>
        </MessageDisplay>

        {/* Centered message for no-media stories */}
        {!hasMedia && (
          <CenteredMessage>
            <CenteredText>{displayMessage}</CenteredText>
          </CenteredMessage>
        )}

        {/* Meta Info - Only likes and comments, no views */}
        <EndorsementMeta>
          <MetaItem>
            <Heart size={14} />
            <span>{currentLikesCount}</span>
          </MetaItem>
          <MetaItem>
            <MessageCircle size={14} />
            <span>{currentCommentsCount}</span>
          </MetaItem>
        </EndorsementMeta>

        <RightActions>
          <ActionButton onClick={handleLike}>
            <Heart
              size={22}
              fill={likesState[current.id] ? "#ff2d55" : "none"}
              color={likesState[current.id] ? "#ff2d55" : "white"}
            />
            <span>Like</span>
            <CountSpan>{currentLikesCount}</CountSpan>
          </ActionButton>

          <ActionButton onClick={() => setShowComments(true)}>
            <MessageCircle size={22} />
            <span>Chat</span>
            <CountSpan>{currentCommentsCount}</CountSpan>
          </ActionButton>

          <ActionButton onClick={() => setShowBoostModal(true)}>
            <TrendingUp size={22} color="#ffcc00" />
            <span>Boost</span>
            <CountSpan>{current.boost_count || 0}</CountSpan>
          </ActionButton>
        </RightActions>

        {showComments && (
          <CommentsModalOverlay>
            <CommentsModalHeader>
              <div style={{ color: "white", fontWeight: "bold" }}>
                Comments ({currentCommentsCount})
              </div>
              <CloseBtn onClick={() => setShowComments(false)}>
                <X size={18} />
              </CloseBtn>
            </CommentsModalHeader>
            <div style={{ flex: 1, overflow: "hidden" }}>
              {commentsLoading[current.id] ? (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  Loading comments...
                </div>
              ) : (
                <EndorsementComments
                  comments={commentsState[current.id] || []}
                  onSendComment={handleSendComment}
                  formatDate={formatDate}
                  onLikeComment={handleLikeComment}
                />
              )}
            </div>
          </CommentsModalOverlay>
        )}
      </FullScreenOverlay>

      {showBoostModal && (
        <BoostModal
          isOpen={showBoostModal}
          onClose={() => setShowBoostModal(false)}
          endorsementId={current.id}
          targetName={current.user_name}
        />
      )}
    </>
  );
};

export default EndorsementDetailModal;
