// components/endorsements/endorsementComents.jsx - Fixed with larger fonts

import React, { useState } from "react";
import styled from "styled-components";
import { Heart, Send } from "lucide-react";

const CommentsContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0a0a0a;
`;

const CommentsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #1a1a1a;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ff5c01;
    border-radius: 10px;
  }
`;

const CommentItem = styled.div`
  display: flex;
  gap: 14px;
  animation: fadeIn 0.2s ease;
  padding: 4px 0;
`;

const CommentAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff5c01, #ff8c01);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(255, 92, 1, 0.2);
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 6px;
  flex-wrap: wrap;
`;

const CommentUserName = styled.span`
  font-weight: 700;
  font-size: 1rem;
  color: white;
  letter-spacing: 0.3px;
`;

const CommentTime = styled.span`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
`;

const CommentText = styled.div`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  word-break: break-word;
  margin-bottom: 8px;
`;

const CommentActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
`;

const LikeButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${(props) => (props.$liked ? "#ff2d55" : "rgba(255, 255, 255, 0.6)")};
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 24px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.02);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const CommentInputWrapper = styled.div`
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: #0a0a0a;
`;

const InputForm = styled.form`
  display: flex;
  gap: 12px;
  align-items: flex-end;
`;

const CommentInput = styled.textarea`
  flex: 1;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 12px 18px;
  color: white;
  font-size: 0.95rem;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  font-family: inherit;
  line-height: 1.4;

  &:focus {
    outline: none;
    border-color: #ff5c01;
    box-shadow: 0 0 0 2px rgba(255, 92, 1, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.9rem;
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, #ff5c01, #ff8c01);
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(255, 92, 1, 0.3);

  &:hover {
    background: linear-gradient(135deg, #ff8c01, #ffa01c);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(255, 92, 1, 0.4);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const EmptyComments = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  padding: 60px 20px;
  font-size: 1rem;
  line-height: 1.5;
`;

const EndorsementComments = ({
  comments = [],
  onSendComment,
  formatDate,
  onLikeComment,
}) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSendComment({ content: newComment.trim() });
      setNewComment("");
    } catch (error) {
      console.error("Error sending comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <CommentsContainer>
      <CommentsList>
        {comments.length === 0 ? (
          <EmptyComments>
            💬 No comments yet.
            <br />
            Be the first to comment!
          </EmptyComments>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id}>
              <CommentAvatar>
                {comment.user_name?.charAt(0).toUpperCase() || "U"}
              </CommentAvatar>
              <CommentContent>
                <CommentHeader>
                  <CommentUserName>
                    {comment.user_name || "Anonymous"}
                  </CommentUserName>
                  <CommentTime>
                    {formatDate(comment.created_at)}
                  </CommentTime>
                </CommentHeader>
                <CommentText>{comment.comment}</CommentText>
                <CommentActions>
                  <LikeButton
                    $liked={comment.liked}
                    onClick={() => onLikeComment(comment.id)}
                  >
                    <Heart
                      size={16}
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

      <CommentInputWrapper>
        <InputForm onSubmit={handleSubmit}>
          <CommentInput
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
          />
          <SendButton type="submit" disabled={!newComment.trim() || isSubmitting}>
            <Send size={18} color="white" />
          </SendButton>
        </InputForm>
      </CommentInputWrapper>
    </CommentsContainer>
  );
};

export default EndorsementComments;