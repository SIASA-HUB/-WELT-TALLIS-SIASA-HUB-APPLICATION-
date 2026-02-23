// hashTags.js - SEPARATE HASHTAGS COMPONENT WITH API INTEGRATION
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Tag, Plus, Hash, TrendingUp, X, Loader } from 'lucide-react';
import numeral from 'numeral';
import axios from 'axios';

// Kenyan-themed colors
const KENYA_COLORS = {
  primary: '#BB0000',
  accent: '#006600',
  highlight: '#FFFFFF',
  neutral: '#6B7280',
};

// Hashtag Styles
const HashtagContainer = styled.div`
  margin-bottom: 16px;
`;

const HashtagsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 8px;
`;

const HashtagsLabel = styled.div`
  font-size: 13px;
  color: ${KENYA_COLORS.neutral};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AddHashtagButton = styled.button`
  background: ${KENYA_COLORS.primary};
  color: white;
  border: none;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;

  &:hover {
    background: #990000;
    transform: translateY(-1px);
  }
`;

const HorizontalHashtagsContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 6px;
  padding: 0 16px 12px;
  scrollbar-width: thin;
  scrollbar-color: ${KENYA_COLORS.primary} transparent;
  
  &::-webkit-scrollbar {
    height: 3px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${KENYA_COLORS.primary}10;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${KENYA_COLORS.primary}40;
    border-radius: 2px;
  }
`;

const TikTokHashtag = styled.div`
  background: linear-gradient(135deg, ${KENYA_COLORS.primary}15, ${KENYA_COLORS.accent}15);
  color: ${KENYA_COLORS.primary};
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid ${KENYA_COLORS.primary}30;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  min-width: 80px;
  
  &:hover {
    background: linear-gradient(135deg, ${KENYA_COLORS.primary}25, ${KENYA_COLORS.accent}25);
    transform: translateY(-1px);
  }
`;

const HashtagText = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  font-weight: 700;
`;

const HashtagCount = styled.div`
  font-size: 9px;
  color: ${KENYA_COLORS.neutral};
  margin-top: 1px;
  display: flex;
  align-items: center;
  gap: 2px;
`;

const HashtagModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HashtagModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  width: 90%;
  max-width: 350px;
  max-height: 80vh;
  overflow-y: auto;
`;

const HashtagInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #1e293b;
  font-size: 13px;
  outline: none;
  
  &::placeholder {
    color: #94a3b8;
  }
  
  &:focus {
    border-color: ${KENYA_COLORS.primary};
    box-shadow: 0 0 0 2px ${KENYA_COLORS.primary}20;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  svg {
    animation: spin 1s linear infinite;
    color: ${KENYA_COLORS.primary};
  }
`;

const ErrorMessage = styled.div`
  color: ${KENYA_COLORS.primary};
  font-size: 11px;
  text-align: center;
  padding: 10px;
  background: ${KENYA_COLORS.primary}10;
  border-radius: 8px;
  margin: 0 16px;
`;

// Main Hashtags Component
const Hashtags = ({ postId, videoIds = [], onAddHashtag, onRemoveHashtag }) => {
  const [showModal, setShowModal] = useState(false);
  const [hashtagInput, setHashtagInput] = useState('#');
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postHashtags, setPostHashtags] = useState([]);
  
  const API_BASE_URL = 'http://localhost:9002/api/v1/reaction';

  // Format number
  const formatNumber = (num) => {
    if (!num) return '0';
    const n = typeof num === 'string' ? parseInt(num) || 0 : num;
    if (n >= 1000000) return numeral(n).format('0.0a');
    if (n >= 1000) return numeral(n).format('0.0a');
    return n.toString();
  };

  const formatHashtagCount = (count) => {
    return formatNumber(count) + ' posts';
  };

  // Fetch hashtags for all videos in the post
  const fetchPostHashtags = async () => {
    if (!postId || videoIds.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const allHashtags = [];
      
      // Fetch hashtags for each video
      for (const videoId of videoIds) {
        try {
          const response = await axios.get(`${API_BASE_URL}/videos/${videoId}/hashtags`);
          if (response.data && response.data.hashtags) {
            allHashtags.push(...response.data.hashtags);
          }
        } catch (videoError) {
          console.error(`Error fetching hashtags for video ${videoId}:`, videoError);
        }
      }
      
      // Remove duplicates and count occurrences
      const hashtagMap = {};
      allHashtags.forEach(tag => {
        if (hashtagMap[tag]) {
          hashtagMap[tag].count++;
        } else {
          hashtagMap[tag] = { tag, count: 1 };
        }
      });
      
      // Convert to array and sort by count
      const uniqueHashtags = Object.values(hashtagMap)
        .map(item => ({ tag: item.tag, count: item.count }))
        .sort((a, b) => b.count - a.count);
      
      setPostHashtags(uniqueHashtags);
      setHashtags(uniqueHashtags);
    } catch (error) {
      console.error('Error fetching post hashtags:', error);
      setError('Failed to load hashtags. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create hashtag via API
  const createHashtag = async (hashtag) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/hashtags`, {
        hashtag: hashtag,
        postId: postId,
        videoIds: videoIds
      });
      return response.data;
    } catch (error) {
      console.error('Error creating hashtag:', error);
      throw error;
    }
  };

  // Remove hashtag (you'll need to create an API endpoint for this)
  const removeHashtag = async (hashtag) => {
    try {
      // This endpoint doesn't exist yet - you'll need to create it
      // For now, we'll just remove from local state
      // const response = await axios.delete(`${API_BASE_URL}/hashtags/${hashtag}`, {
      //   data: { postId, videoIds }
      // });
      // return response.data;
      
      // For now, just remove locally
      return { success: true };
    } catch (error) {
      console.error('Error removing hashtag:', error);
      throw error;
    }
  };

  const handleAddHashtag = async () => {
    if (!hashtagInput.trim() || !postId) return;
    
    let hashtag = hashtagInput.trim();
    if (!hashtag.startsWith('#')) {
      hashtag = `#${hashtag}`;
    }
    
    hashtag = hashtag.replace(/^#+/, '#');
    
    try {
      setLoading(true);
      await createHashtag(hashtag);
      
      // Add to local state
      const newHashtag = { tag: hashtag, count: 1 };
      setHashtags(prev => [...prev, newHashtag]);
      setPostHashtags(prev => {
        const existing = prev.find(h => h.tag === hashtag);
        if (existing) {
          return prev.map(h => 
            h.tag === hashtag ? { ...h, count: h.count + 1 } : h
          );
        }
        return [...prev, newHashtag];
      });
      
      if (onAddHashtag) {
        onAddHashtag(hashtag);
      }
      
      setHashtagInput('#');
      setShowModal(false);
    } catch (error) {
      alert('Error adding hashtag. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveHashtag = async (index, hashtag) => {
    try {
      await removeHashtag(hashtag);
      
      // Update local state
      const newHashtags = [...hashtags];
      const removedHashtag = newHashtags[index];
      
      if (removedHashtag.count > 1) {
        // Decrease count if multiple videos have this hashtag
        newHashtags[index] = { ...removedHashtag, count: removedHashtag.count - 1 };
        setHashtags(newHashtags);
      } else {
        // Remove completely if only one video has it
        newHashtags.splice(index, 1);
        setHashtags(newHashtags);
      }
      
      // Also update postHashtags
      setPostHashtags(prev => {
        const updated = [...prev];
        const postHashtagIndex = updated.findIndex(h => h.tag === hashtag);
        
        if (postHashtagIndex !== -1) {
          if (updated[postHashtagIndex].count > 1) {
            updated[postHashtagIndex] = {
              ...updated[postHashtagIndex],
              count: updated[postHashtagIndex].count - 1
            };
          } else {
            updated.splice(postHashtagIndex, 1);
          }
        }
        
        return updated;
      });
      
      if (onRemoveHashtag) {
        onRemoveHashtag(index, hashtag);
      }
    } catch (error) {
      alert('Error removing hashtag. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddHashtag();
    }
  };

  // Fetch hashtags on component mount or when postId/videoIds change
  useEffect(() => {
    if (postId && videoIds && videoIds.length > 0) {
      fetchPostHashtags();
    }
  }, [postId, videoIds]);

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <HashtagModal onClick={() => !loading && setShowModal(false)}>
        <HashtagModalContent onClick={(e) => e.stopPropagation()}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h3 style={{ margin: 0, color: KENYA_COLORS.primary, fontSize: '16px' }}>
              Add Hashtags
            </h3>
            <button
              onClick={() => !loading && setShowModal(false)}
              style={{
                background: 'none',
                border: 'none',
                padding: '5px',
                borderRadius: '50%',
                cursor: loading ? 'not-allowed' : 'pointer',
                color: KENYA_COLORS.neutral,
                opacity: loading ? 0.5 : 1
              }}
              disabled={loading}
            >
              <X size={18} />
            </button>
          </div>
          
          <p style={{ color: KENYA_COLORS.neutral, marginBottom: '12px', fontSize: '13px' }}>
            Add hashtags to this post. Hashtags will be applied to all videos in the post.
          </p>
          
          <HashtagInput
            type="text"
            placeholder="#trending"
            value={hashtagInput}
            onChange={(e) => setHashtagInput(e.target.value)}
            onKeyPress={handleKeyPress}
            autoFocus
            disabled={loading}
          />
          
          <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
            <button
              onClick={handleAddHashtag}
              disabled={loading || !hashtagInput.trim()}
              style={{
                flex: 1,
                background: loading ? KENYA_COLORS.neutral : KENYA_COLORS.primary,
                color: 'white',
                border: 'none',
                padding: '10px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? <Loader size={14} /> : <><Plus size={14} /> Add Hashtag</>}
            </button>
            
            <button
              onClick={() => !loading && setShowModal(false)}
              disabled={loading}
              style={{
                background: '#f1f5f9',
                color: KENYA_COLORS.neutral,
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                opacity: loading ? 0.5 : 1
              }}
            >
              Cancel
            </button>
          </div>
          
          {postHashtags.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <p style={{ fontSize: '12px', color: KENYA_COLORS.neutral, marginBottom: '8px' }}>
                Current post hashtags ({postHashtags.length}):
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {postHashtags.map((hashtag, index) => (
                  <span
                    key={index}
                    style={{
                      background: KENYA_COLORS.primary + '15',
                      color: KENYA_COLORS.primary,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      border: `1px solid ${KENYA_COLORS.primary}30`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <Tag size={9} />
                    {hashtag.tag}
                    <span style={{ fontSize: '9px', color: KENYA_COLORS.neutral }}>
                      ({hashtag.count})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </HashtagModalContent>
      </HashtagModal>
    );
  };

  return (
    <>
      <HashtagContainer>
        <HashtagsHeader>
          <HashtagsLabel>
            <Hash size={13} /> 
            {loading ? 'Loading Hashtags...' : 
             postHashtags.length > 0 ? `Post Hashtags (${postHashtags.length})` : 'Add Hashtags'}
          </HashtagsLabel>
          <AddHashtagButton onClick={() => setShowModal(true)}>
            <Plus size={11} /> Add
          </AddHashtagButton>
        </HashtagsHeader>
        
        {loading ? (
          <LoadingSpinner>
            <Loader size={16} />
          </LoadingSpinner>
        ) : error ? (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        ) : (
          <HorizontalHashtagsContainer>
            {postHashtags.length > 0 ? (
              postHashtags.map((hashtag, index) => (
                <TikTokHashtag 
                  key={index} 
                  onClick={() => handleRemoveHashtag(index, hashtag.tag)}
                  title={`Click to remove. Used by ${hashtag.count} video${hashtag.count > 1 ? 's' : ''}`}
                >
                  <HashtagText>
                    <Tag size={9} />
                    {hashtag.tag}
                  </HashtagText>
                  <HashtagCount>
                    <TrendingUp size={8} />
                    {formatHashtagCount(hashtag.count)}
                  </HashtagCount>
                </TikTokHashtag>
              ))
            ) : (
              <div style={{ 
                color: KENYA_COLORS.neutral, 
                fontSize: '11px', 
                padding: '6px 12px',
                fontStyle: 'italic'
              }}>
                No hashtags yet. Click "Add" to add hashtags to all videos.
              </div>
            )}
          </HorizontalHashtagsContainer>
        )}
      </HashtagContainer>
      
      {renderModal()}
    </>
  );
};

export default Hashtags;