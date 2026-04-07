import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import {
  Heart,
  MessageCircle,
  Send,
  Smile,
  Camera,
  User,
  LogIn,
  X,
  Image,
  Gift,
} from "lucide-react";
import axios from "axios";

// --- Styled Components ---
const CommentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #000000;
  color: #ffffff;
`;

const CommentsHeader = styled.div`
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: #000000;
`;

const HeaderTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: -0.2px;
`;

const HeaderSubtitle = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
`;

const CommentsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
`;

const CommentItem = styled.div`
  display: flex;
  gap: 12px;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CommentAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(255, 92, 1, 0.3);
  flex-shrink: 0;
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 0.85rem;
  color: #ffffff;
`;

const Timestamp = styled.span`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
`;

const CommentText = styled.div`
  font-size: 0.85rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 8px;
  word-break: break-word;
`;

const StickerImage = styled.img`
  max-width: 140px;
  max-height: 140px;
  object-fit: contain;
  margin: 8px 0;
  border-radius: 12px;
  display: block;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const CommentActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const LikeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: ${(props) => (props.$liked ? "#ff2d55" : "rgba(255, 255, 255, 0.5)")};
  cursor: pointer;
  font-size: 0.7rem;
  padding: 4px 0;
  transition: all 0.2s;

  &:hover {
    color: ${(props) =>
      props.$liked ? "#ff2d55" : "rgba(255, 255, 255, 0.8)"};
  }

  svg {
    transition: transform 0.2s;
  }

  &:hover svg {
    transform: scale(1.1);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;

  svg {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const EmptyText = styled.p`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  margin: 0;
`;

const EmptySubtext = styled.p`
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.75rem;
  margin: 4px 0 0;
`;

const StickerModal = styled.div`
  position: absolute;
  bottom: 80px;
  left: 16px;
  right: 16px;
  background: #0a0a0a;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px;
  z-index: 10;
  animation: slideUp 0.2s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const StickerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const StickerTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: #ffffff;
`;

const CloseStickerBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);

  &:hover {
    color: #ffffff;
  }
`;

const StickerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const StickerOption = styled.div`
  aspect-ratio: 1;
  cursor: pointer;
  border-radius: 12px;
  background: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    transform: scale(1.05);
    border-color: #ff5c01;
  }
`;

const UploadStickerOption = styled.label`
  aspect-ratio: 1;
  cursor: pointer;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  svg {
    color: rgba(255, 255, 255, 0.4);
  }

  span {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.4);
  }

  &:hover {
    border-color: #ff5c01;
    background: rgba(255, 92, 1, 0.05);

    svg,
    span {
      color: #ff5c01;
    }
  }
`;

const CommentInputContainer = styled.div`
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: 12px;
  align-items: center;
  background: #000000;
  position: relative;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  color: ${(props) => (props.$active ? "#ff5c01" : "rgba(255, 255, 255, 0.6)")};

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: ${(props) => (props.$active ? "#ff5c01" : "#ffffff")};
  }
`;

const CommentInputWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const CommentInput = styled.input`
  width: 100%;
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 12px 20px;
  color: #ffffff;
  outline: none;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:focus {
    border-color: #ff5c01;
    background: #111;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  background: #ff5c01;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: #ff6b1a;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoginPrompt = styled.div`
  padding: 24px;
  text-align: center;
  background: #0a0a0a;
  margin: 20px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #ff5c01, #ff8c01);
  border: none;
  color: white;
  padding: 12px 28px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 92, 1, 0.3);
  }
`;

// Get current user from localStorage
const getCurrentUser = () => {
  const userData = localStorage.getItem("user_data");
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Professional sticker set
const STICKERS = [
  {
    id: 1,
    url: "https://media1.tenor.com/m/-IyHl0Odl-cAAAAC/fire-fire-emoji.gif",
    name: "Fire",
  },
  {
    id: 2,
    url: "https://media1.tenor.com/m/mCiM7CmGGI4AAAAC/naruto-run.gif",
    name: "Naruto",
  },
  {
    id: 3,
    url: "https://media1.tenor.com/m/V0LcYsgpIeIAAAAC/clapping-applause.gif",
    name: "Applause",
  },
  {
    id: 4,
    url: "https://media1.tenor.com/m/YpLq0DfR5bIAAAAC/yes-yess.gif",
    name: "Yes",
  },
  {
    id: 5,
    url: "https://media1.tenor.com/m/BkfVUBHVkMgAAAAC/love-heart.gif",
    name: "Love",
  },
  {
    id: 6,
    url: "https://media1.tenor.com/m/J1MviyDvsZQAAAAC/shock-surprised.gif",
    name: "Shock",
  },
];

// --- Main Component ---
const EndorsementComments = ({
  comments = [],
  onSendComment,
  formatDate,
  onLikeComment,
}) => {
  const [text, setText] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const inputRef = useRef(null);
  const stickerRef = useRef(null);

  // Check user authentication on mount
  useEffect(() => {
    const user = getCurrentUser();
    if (user && (user.user_id || user.id)) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      console.log("✅ User is logged in:", user.user_id || user.id);
    } else {
      console.log("❌ User not logged in");
      setIsLoggedIn(false);
    }
  }, []);

  // Close sticker picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (stickerRef.current && !stickerRef.current.contains(event.target)) {
        setShowStickers(false);
      }
    };

    if (showStickers) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStickers]);

  const handleSend = (content, type = "text") => {
    if (!isLoggedIn) {
      alert("Please log in to comment");
      return;
    }

    if (type === "text" && !content.trim()) return;
    onSendComment({ content, type });
    setText("");
    setShowStickers(false);
  };

  const handleCustomSticker = (e) => {
    if (!isLoggedIn) {
      alert("Please log in to comment");
      return;
    }

    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleSend(event.target.result, "sticker");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(text, "text");
    }
  };

  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <CommentsContainer>
      <CommentsHeader>
        <HeaderTitle>Conversations</HeaderTitle>
        <HeaderSubtitle>
          {comments.length} {comments.length === 1 ? "message" : "messages"}
        </HeaderSubtitle>
      </CommentsHeader>

      <CommentsList>
        {comments.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <MessageCircle size={32} />
            </EmptyIcon>
            <EmptyText>No messages yet</EmptyText>
            <EmptySubtext>Be the first to join the conversation</EmptySubtext>
          </EmptyState>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id}>
              <CommentAvatar
                src={
                  comment.user_avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user_name || "User")}&background=ff5c01&color=fff&bold=true&size=40`
                }
                alt={comment.user_name}
              />
              <CommentContent>
                <CommentHeader>
                  <UserName>{comment.user_name || "Anonymous"}</UserName>
                  <Timestamp>
                    {formatDate(comment.created_at || comment.time)}
                  </Timestamp>
                </CommentHeader>

                {comment.type === "sticker" ? (
                  <StickerImage
                    src={comment.content}
                    alt="sticker"
                    onClick={() => window.open(comment.content, "_blank")}
                  />
                ) : (
                  <CommentText>
                    {comment.comment || comment.content || comment.text}
                  </CommentText>
                )}

                <CommentActions>
                  <LikeButton
                    $liked={comment.liked}
                    onClick={() => {
                      if (!isLoggedIn) {
                        alert("Please log in to like comments");
                        return;
                      }
                      onLikeComment(comment.id);
                    }}
                  >
                    <Heart
                      size={14}
                      fill={comment.liked ? "#ff2d55" : "none"}
                    />
                    <span>{comment.likes || 0}</span>
                  </LikeButton>
                </CommentActions>
              </CommentContent>
            </CommentItem>
          ))
        )}
      </CommentsList>

      {!isLoggedIn ? (
        <LoginPrompt>
          <User size={40} style={{ marginBottom: 8, opacity: 0.5 }} />
          <EmptyText>Join the conversation</EmptyText>
          <EmptySubtext>Sign in to comment and like</EmptySubtext>
          <LoginButton onClick={handleLogin}>
            <LogIn size={16} />
            Sign In
          </LoginButton>
        </LoginPrompt>
      ) : (
        <CommentInputContainer>
          <ActionButton
            $active={showStickers}
            onClick={() => setShowStickers(!showStickers)}
          >
            <Smile size={22} />
          </ActionButton>

          <CommentInputWrapper>
            <CommentInput
              ref={inputRef}
              placeholder="Write a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </CommentInputWrapper>

          <SendButton
            onClick={() => handleSend(text, "text")}
            disabled={!text.trim()}
          >
            <Send size={18} />
          </SendButton>

          {showStickers && (
            <StickerModal ref={stickerRef}>
              <StickerHeader>
                <StickerTitle>Add a sticker</StickerTitle>
                <CloseStickerBtn onClick={() => setShowStickers(false)}>
                  <X size={16} />
                </CloseStickerBtn>
              </StickerHeader>
              <StickerGrid>
                <UploadStickerOption>
                  <Camera size={24} />
                  <span>Upload</span>
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleCustomSticker}
                  />
                </UploadStickerOption>
                {STICKERS.map((sticker) => (
                  <StickerOption
                    key={sticker.id}
                    onClick={() => handleSend(sticker.url, "sticker")}
                  >
                    <img src={sticker.url} alt={sticker.name} />
                  </StickerOption>
                ))}
              </StickerGrid>
            </StickerModal>
          )}
        </CommentInputContainer>
      )}
    </CommentsContainer>
  );
};

export default EndorsementComments;
