// components/endorsements/StoryReplyModal.jsx
import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import {
  X,
  Heart,
  Share2,
  Zap,
  MessageCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Trash2,
  Pin,
  Star,
  Flame,
  Award,
} from "lucide-react";
import theme from "../../utils/theme";

const heartPop = keyframes`
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.4); opacity: 1; }
  100% { transform: scale(1); opacity: 0; }
`;

const slideUp = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const FullScreenOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 100000;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const StoryHeader = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  padding: 20px 16px;
  z-index: 40;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.9),
    rgba(0, 0, 0, 0.6)
  );
  backdrop-filter: blur(10px);
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
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${theme.colors.primary || "#ff5c01"};
`;

const UserName = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
`;

const CloseBtn = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const StoryContent = styled.div`
  padding: 20px;
  text-align: center;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StoryImage = styled.img`
  max-width: 100%;
  max-height: 400px;
  border-radius: 16px;
  margin-bottom: 20px;
  object-fit: cover;
`;

const SupportMessage = styled.div`
  font-size: 1.5rem;
  line-height: 1.4;
  font-weight: 700;
  color: white;
  max-width: 90%;
  margin: 16px 0;
`;

const ReasonTag = styled.div`
  background: rgba(255, 92, 1, 0.15);
  color: #ffcc00;
  padding: 6px 16px;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 12px 0;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 20px;
`;

const ActionBtn = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: white;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;

  &:active {
    transform: scale(0.92);
  }
`;

// Replies Section
const RepliesSection = styled.div`
  background: rgba(0, 0, 0, 0.4);
  padding: 20px;
  margin-top: 20px;
`;

const RepliesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
`;

const ReplyInputContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 30px;
  padding: 8px 16px;
  align-items: center;
`;

const ReplyInput = styled.input`
  flex: 1;
  background: none;
  border: none;
  color: white;
  font-size: 0.9rem;
  padding: 8px 0;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
  }
`;

const SendButton = styled.button`
  background: ${theme.colors.primary || "#ff5c01"};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:active {
    transform: scale(0.95);
  }
`;

const ReplyItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 12px;
  animation: ${slideUp} 0.3s ease;

  ${({ $isPinned }) =>
    $isPinned &&
    `
    background: rgba(255, 92, 1, 0.15);
    border-left: 3px solid #ff5c01;
  `}
`;

const ReplyHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ReplyUser = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  img {
    width: 28px;
    height: 28px;
    border-radius: 50%;
  }

  span {
    font-weight: 600;
    font-size: 0.85rem;
  }
`;

const ReplyText = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 8px 0;
  line-height: 1.4;
`;

const ReplyImage = styled.img`
  max-width: 100%;
  max-height: 150px;
  border-radius: 12px;
  margin-top: 8px;
`;

const ReplyActions = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
`;

const PinBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ff5c01;
  font-size: 0.7rem;
`;

const StoryReplyModal = ({
  isOpen,
  onClose,
  story,
  replies = [],
  onReply,
  currentUser,
  getImageUrl,
}) => {
  const [replyText, setReplyText] = useState("");
  const [replyImage, setReplyImage] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [zapCount, setZapCount] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [localReplies, setLocalReplies] = useState(replies);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setLocalReplies(replies);
  }, [replies]);

  if (!isOpen || !story) return null;

  const handleSendReply = () => {
    if (!replyText.trim()) return;

    const newReply = {
      id: Date.now(),
      user_name: currentUser?.name || "Anonymous",
      user_id: currentUser?.id || "anonymous",
      user_avatar: currentUser?.avatar,
      reply_text: replyText,
      reply_image: replyImage,
      created_at: new Date().toISOString(),
      likes: 0,
      isPinned: false,
    };

    setLocalReplies([newReply, ...localReplies]); // New reply at top
    onReply(story.id, replyText, replyImage);
    setReplyText("");
    setReplyImage(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReplyImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));

    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 700);
  };

  const handleZap = () => {
    setZapCount((prev) => prev + 1);
  };

  const handlePinReply = (replyId) => {
    setLocalReplies((prev) => {
      const updated = prev.map((r) => ({
        ...r,
        isPinned: r.id === replyId ? !r.isPinned : r.isPinned,
      }));
      // Sort pinned replies to top
      return [...updated].sort(
        (a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0),
      );
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const imageUrl = story.image_url
    ? getImageUrl?.(story.image_url) || story.image_url
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(story.user_name)}&background=ff5c01&color=fff&size=200`;

  return (
    <FullScreenOverlay>
      {showHeart && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          <Heart size={90} fill="#ff2d55" color="#ff2d55" />
        </div>
      )}

      <StoryHeader>
        <UserInfo>
          <UserAvatar src={imageUrl} alt={story.user_name} />
          <div>
            <UserName>{story.user_name}</UserName>
            <div style={{ fontSize: "0.8rem", color: "#ffcc00" }}>
              {story.amount ? `KSh ${story.amount}` : "Free Support"}
            </div>
          </div>
        </UserInfo>
        <CloseBtn onClick={onClose}>
          <X size={28} />
        </CloseBtn>
      </StoryHeader>

      <StoryContent>
        {story.image_url && <StoryImage src={imageUrl} alt={story.user_name} />}

        {story.phrase && <ReasonTag>"{story.phrase}"</ReasonTag>}

        <SupportMessage>
          {story.message || "I stand with this leader for a better Kenya."}
        </SupportMessage>
      </StoryContent>

      <ActionBar>
        <ActionBtn onClick={handleLike}>
          <Heart
            size={28}
            fill={isLiked ? "#ff2d55" : "none"}
            color={isLiked ? "#ff2d55" : "white"}
          />
          <span>{likesCount || story.likes || 0}</span>
        </ActionBtn>

        <ActionBtn onClick={handleZap}>
          <Zap size={28} color="#ffcc00" />
          <span>{zapCount}</span>
        </ActionBtn>

        <ActionBtn onClick={() => alert("Share story!")}>
          <Share2 size={28} />
          <span>Share</span>
        </ActionBtn>
      </ActionBar>

      <RepliesSection>
        <RepliesHeader>
          <span>
            <MessageCircle size={16} /> {localReplies.length} Replies
          </span>
          <span style={{ fontSize: "0.75rem" }}>Newest first ↑</span>
        </RepliesHeader>

        <ReplyInputContainer>
          <ReplyInput
            placeholder="Reply to this story..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendReply()}
          />
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleImageUpload}
          />
          <ActionBtn onClick={() => fileInputRef.current?.click()}>
            <ImageIcon size={20} />
          </ActionBtn>
          <SendButton onClick={handleSendReply}>
            <Send size={16} />
          </SendButton>
        </ReplyInputContainer>

        {replyImage && (
          <div style={{ marginBottom: "12px", position: "relative" }}>
            <img
              src={replyImage}
              alt="Reply preview"
              style={{
                maxWidth: "100px",
                maxHeight: "100px",
                borderRadius: "8px",
              }}
            />
            <button
              onClick={() => setReplyImage(null)}
              style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                background: "rgba(0,0,0,0.7)",
                border: "none",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                cursor: "pointer",
                color: "white",
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {localReplies.map((reply) => (
          <ReplyItem key={reply.id} $isPinned={reply.isPinned}>
            <ReplyHeader>
              <ReplyUser>
                <img
                  src={
                    reply.user_avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.user_name)}&background=ff5c01&color=fff&size=40`
                  }
                  alt={reply.user_name}
                />
                <span>{reply.user_name}</span>
                {reply.isPinned && (
                  <PinBadge>
                    <Pin size={12} /> Pinned
                  </PinBadge>
                )}
              </ReplyUser>
              <div
                style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}
              >
                {formatDate(reply.created_at)}
              </div>
            </ReplyHeader>

            <ReplyText>{reply.reply_text}</ReplyText>

            {reply.reply_image && (
              <ReplyImage src={reply.reply_image} alt="Reply" />
            )}

            <ReplyActions>
              <span
                onClick={() => handleLikeReply(reply.id)}
                style={{ cursor: "pointer" }}
              >
                ❤️ {reply.likes || 0}
              </span>
              <span
                onClick={() => handlePinReply(reply.id)}
                style={{ cursor: "pointer" }}
              >
                📌 Pin
              </span>
              <span style={{ cursor: "pointer" }}>💬 Reply</span>
            </ReplyActions>
          </ReplyItem>
        ))}

        {localReplies.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.5)",
              padding: "40px",
            }}
          >
            <MessageCircle size={32} />
            <p style={{ marginTop: "12px" }}>
              No replies yet. Be the first to reply!
            </p>
          </div>
        )}
      </RepliesSection>
    </FullScreenOverlay>
  );
};

export default StoryReplyModal;
