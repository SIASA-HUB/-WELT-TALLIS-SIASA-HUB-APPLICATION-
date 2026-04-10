// components/endorsements/endorsementComents.jsx - Fixed

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
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #1a1a1a;
  }

  &::-webkit-scrollbar-thumb {
    background: #ff5c01;
    border-radius: 4px;
  }
`;

const CommentItem = styled.div`
  display: flex;
  gap: 12px;
  animation: fadeIn 0.2s ease;
`;

const CommentAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff5c01, #ff8c01);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  flex-shrink: 0;
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
`;

const CommentUserName = styled.span`
  font-weight: 700;
  font-size: 0.85rem;
  color: white;
`;

const CommentTime = styled.span`
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.5);
`;

const CommentText = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  word-break: break-word;
`;

const CommentActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
`;

const LikeButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: ${(props) => (props.$liked ? "#ff2d55" : "rgba(255, 255, 255, 0.5)")};
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const CommentInputWrapper = styled.div`
  padding: 16px;
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
  border-radius: 20px;
  padding: 10px 16px;
  color: white;
  font-size: 0.85rem;
  resize: none;
  min-height: 40px;
  max-height: 100px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #ff5c01;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const SendButton = styled.button`
  background: #ff5c01;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ff8c01;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyComments = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  padding: 40px 20px;
  font-size: 0.85rem;
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
          <EmptyComments>No comments yet. Be the first to comment!</EmptyComments>
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
            <Send size={16} color="white" />
          </SendButton>
        </InputForm>
      </CommentInputWrapper>
    </CommentsContainer>
  );
};

export default EndorsementComments;