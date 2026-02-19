import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Send, Loader2, MessageSquare, User, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import axios from 'axios';

// Styled Components
const CommentsContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const CommentInput = styled.div`
  margin-bottom: 25px;
  
  textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    min-height: 80px;
    margin-bottom: 10px;
    
    &:focus {
      outline: none;
      border-color: #007bff;
    }
  }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background: #0056b3;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CommentCard = styled.div`
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 15px;
  background: ${props => props.$isEven ? '#f8f9fa' : 'white'};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  margin-right: 10px;
  
  &:hover {
    background: #f0f0f0;
  }
  
  &.active {
    background: #007bff10;
    color: #007bff;
    border-color: #007bff30;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const ManifestoComments = ({ manifestoId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userReactions, setUserReactions] = useState({});

  // API base URL
  const API_BASE_URL = 'http://localhost:8006/api/v1/leaders/manifestos';

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        return {
          user_id: parsedData.user_id || `USR-${Math.random().toString(36).substr(2, 9)}`,
          user_name: parsedData.user_name || `Anon-KE-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
        };
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    
    // Return anonymous user if no data in localStorage
    return {
      user_id: `USR-${Math.random().toString(36).substr(2, 9)}`,
      user_name: `Anon-KE-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    };
  };

  // Fetch comments from API
  const fetchComments = async () => {
    if (!manifestoId) {
      setError('No manifesto ID provided');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(
        `${API_BASE_URL}/${manifestoId}/coment`,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      if (response.data && Array.isArray(response.data)) {
        setComments(response.data);
      } else if (response.data && response.data.comments) {
        setComments(response.data.comments);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments. Please try again later.');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  // Submit new comment
  const submitComment = async () => {
    if (!newComment.trim() || !manifestoId) return;
    
    const userData = getUserData();
    
    const commentData = {
      user_id: userData.user_id,
      user_name: userData.user_name,
      comment: newComment.trim()
    };
    
    try {
      setSubmitting(true);
      setError('');
      
      const response = await axios.post(
        `${API_BASE_URL}/${manifestoId}/coment`,
        commentData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Add the new comment to the list
      if (response.data) {
        setComments(prev => [response.data, ...prev]);
        setNewComment('');
      }
      
      console.log('Comment submitted successfully:', response.data);
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('Failed to post comment. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle like/dislike (update API endpoint as needed)
  const handleReaction = async (commentId, reactionType) => {
    try {
      // First update local state for immediate UI feedback
      setUserReactions(prev => ({
        ...prev,
        [commentId]: reactionType
      }));
      
      // Update comment counts locally
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId || comment._id === commentId) {
          const updatedComment = { ...comment };
          
          if (reactionType === 'like') {
            // If user previously liked, remove like
            if (userReactions[commentId] === 'like') {
              updatedComment.likes = (updatedComment.likes || 0) - 1;
            } else {
              // If user previously disliked, remove dislike and add like
              if (userReactions[commentId] === 'dislike') {
                updatedComment.dislikes = (updatedComment.dislikes || 0) - 1;
              }
              updatedComment.likes = (updatedComment.likes || 0) + 1;
            }
          } else if (reactionType === 'dislike') {
            // If user previously disliked, remove dislike
            if (userReactions[commentId] === 'dislike') {
              updatedComment.dislikes = (updatedComment.dislikes || 0) - 1;
            } else {
              // If user previously liked, remove like and add dislike
              if (userReactions[commentId] === 'like') {
                updatedComment.likes = (updatedComment.likes || 0) - 1;
              }
              updatedComment.dislikes = (updatedComment.dislikes || 0) + 1;
            }
          }
          
          return updatedComment;
        }
        return comment;
      }));
      
      // Send reaction to API (adjust endpoint as needed)
      // await axios.post(`${API_BASE_URL}/comments/${commentId}/react`, {
      //   user_id: getUserData().user_id,
      //   reaction: reactionType
      // });
      
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  // Get user initials
  const getUserInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Load comments on component mount
  useEffect(() => {
    if (manifestoId) {
      fetchComments();
    }
  }, [manifestoId]);

  // Handle Enter key to submit
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      submitComment();
    }
  };

  return (
    <CommentsContainer>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <MessageSquare size={20} style={{ marginRight: '10px' }} />
        <h3 style={{ margin: 0 }}>Comments ({comments.length})</h3>
      </div>
      
      {/* Error Message */}
      {error && (
        <div style={{
          padding: '10px',
          background: '#ffebee',
          color: '#c62828',
          borderRadius: '6px',
          marginBottom: '15px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
      
      {/* Comment Input */}
      <CommentInput>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Share your thoughts on this manifesto..."
          maxLength={1000}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {1000 - newComment.length} characters remaining
            <br />
            <small>Press Ctrl+Enter to submit</small>
          </div>
          <SubmitButton 
            onClick={submitComment}
            disabled={!newComment.trim() || submitting}
          >
            {submitting ? (
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Send size={16} />
            )}
            Post Comment
          </SubmitButton>
        </div>
      </CommentInput>
      
      {/* Comments List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#007bff' }} />
          <p style={{ marginTop: '10px', color: '#666' }}>
            Loading comments...
          </p>
        </div>
      ) : comments.length === 0 ? (
        <EmptyState>
          <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
          <h4>No comments yet</h4>
          <p>Be the first to share your thoughts</p>
        </EmptyState>
      ) : (
        <div>
          {comments.map((comment, index) => (
            <CommentCard key={comment.id || comment._id || index} $isEven={index % 2 === 0}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#e3f2fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1976d2',
                    fontWeight: '600',
                    marginRight: '10px',
                    fontSize: '14px'
                  }}>
                    {getUserInitials(comment.user_name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>
                      {comment.user_name || 'Anonymous'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center' }}>
                      <Clock size={12} style={{ marginRight: '5px' }} />
                      {formatDate(comment.created_at || comment.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                fontSize: '14px', 
                lineHeight: '1.5',
                marginBottom: '15px',
                color: '#333'
              }}>
                {comment.comment || comment.text}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ActionButton
                  className={userReactions[comment.id || comment._id] === 'like' ? 'active' : ''}
                  onClick={() => handleReaction(comment.id || comment._id, 'like')}
                >
                  <ThumbsUp size={14} />
                  Like {comment.likes > 0 && `(${comment.likes})`}
                </ActionButton>
                
                <ActionButton
                  className={userReactions[comment.id || comment._id] === 'dislike' ? 'active' : ''}
                  onClick={() => handleReaction(comment.id || comment._id, 'dislike')}
                >
                  <ThumbsDown size={14} />
                  Dislike {comment.dislikes > 0 && `(${comment.dislikes})`}
                </ActionButton>
              </div>
            </CommentCard>
          ))}
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </CommentsContainer>
  );
};

export default ManifestoComments;