import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Tag, Plus, X, MoreHorizontal, Loader } from 'lucide-react';
import axios from 'axios';

const KENYA_COLORS = {
  primary: '#BB0000',
  accent: '#006600',
  highlight: '#FFFFFF',
  neutral: '#6B7280',
};

const API_BASE_URL = 'http://localhost:9002/api/v1/reaction';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const HashtagContainer = styled.div`
  margin-bottom: 16px;
  padding: 0 16px;
  max-height: ${props => props.$expanded ? 'none' : '70px'};
  overflow: hidden;
`;

const HashtagsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 6px;
`;

const HashtagsLabel = styled.div`
  font-size: 12px;
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
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;

  &:hover {
    background: #990000;
    transform: translateY(-1px);
  }
`;

const HashtagsScrollContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 4px;
  padding: 4px 0;
  scrollbar-width: thin;
  scrollbar-color: ${KENYA_COLORS.primary}20 transparent;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${KENYA_COLORS.primary}40;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${KENYA_COLORS.primary}60;
  }
`;

const HashtagItem = styled.div`
  background: ${props => {
    if (props.$isPopular) return KENYA_COLORS.primary;
    if (props.$count > 10) return 'linear-gradient(135deg, #4CAF50, #8BC34A)';
    if (props.$count > 5) return 'linear-gradient(135deg, #8BC34A, #CDDC39)';
    if (props.$count > 2) return 'linear-gradient(135deg, #CDDC39, #FFEB3B)';
    return 'linear-gradient(135deg, #E8F5E9, #C8E6C9)';
  }};
  color: ${props => props.$isPopular ? 'white' : props.$count > 2 ? '#1B5E20' : '#2E7D32'};
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 10px;
  font-weight: ${props => props.$count > 5 ? '700' : '600'};
  border: ${props => props.$isPopular ? 'none' : props.$count > 2 ? '1px solid #81C784' : '1px solid #C8E6C9'};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  white-space: nowrap;
  box-shadow: ${props => props.$count > 5 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'};
  
  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
`;

const ShowMoreHashtags = styled.button`
  background: linear-gradient(135deg, ${KENYA_COLORS.primary}, ${KENYA_COLORS.accent});
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(187, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 4px 8px rgba(187, 0, 0, 0.3);
  }
`;

const ExpandedHashtagsContainer = styled.div`
  margin-top: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #F1F8E9, #E8F5E9);
  border-radius: 12px;
  border: 2px solid #C8E6C9;
  animation: ${fadeIn} 0.3s ease;
`;

const ExpandedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #C8E6C9;
`;

const ExpandedTitle = styled.div`
  font-size: 11px;
  color: ${KENYA_COLORS.primary};
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CollapseButton = styled.button`
  background: ${KENYA_COLORS.primary};
  color: white;
  border: none;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 9px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 3px;
  transition: all 0.2s;
  
  &:hover {
    background: #990000;
    transform: translateY(-1px);
  }
`;

const ExpandedHashtagsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
  padding: 5px;
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
  border: 2px solid rgba(187, 0, 0, 0.1);
  border-top: 2px solid ${KENYA_COLORS.primary};
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const HashtagSection = ({ postId, showModal, setShowModal }) => {
  const [postHashtags, setPostHashtags] = useState([]);
  const [hashtagsExpanded, setHashtagsExpanded] = useState(false);
  const [hashtagInput, setHashtagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFetchingHashtags, setIsFetchingHashtags] = useState(false);
  const [hashtagError, setHashtagError] = useState(null);

  // Fetch hashtags for the post - FIXED endpoint
  const fetchPostHashtags = useCallback(async () => {
    if (!postId) return [];
    
    try {
      setIsFetchingHashtags(true);
      setHashtagError(null);
      
      // FIXED: Correct endpoint is /hashtags/:postId, not /posts/:postId/hashtags
      const response = await axios.get(`${API_BASE_URL}/hashtags/${postId}`);
      console.log('Hashtags API response:', response.data);
      
      if (response.data?.success) {
        // Handle different response structures
        let hashtagsData = response.data.data?.hashtags || response.data.hashtags || [];
        
        if (Array.isArray(hashtagsData) && hashtagsData.length > 0) {
          if (typeof hashtagsData[0] === 'string') {
            // If it's an array of strings, convert to objects with count
            return hashtagsData.map(tag => ({ tag, count: 1 }));
          } else if (hashtagsData[0].hashtag) {
            // If it's an array of objects with hashtag property
            return hashtagsData.map(item => ({ 
              tag: item.hashtag, 
              count: item.count || 1 
            }));
          } else if (hashtagsData[0].tag) {
            // If it's an array of objects with tag property
            return hashtagsData.map(item => ({ 
              tag: item.tag, 
              count: item.count || 1 
            }));
          }
        }
        
        // If we got an empty array or no data
        return [];
      } else {
        console.log('Hashtags API returned unsuccessful:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching hashtags:', error);
      setHashtagError(`Failed to fetch hashtags: ${error.message}`);
      return [];
    } finally {
      setIsFetchingHashtags(false);
    }
  }, [postId]);

  // Create new hashtag - FIXED endpoint
  const createHashtag = useCallback(async (hashtagText) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/hashtag/create`, {
        post_id: postId,
        hashtag: hashtagText
      });
      return response.data;
    } catch (error) {
      console.error('Error creating hashtag:', error);
      throw error;
    }
  }, [postId]);

  // Load hashtags on component mount and when showModal changes
  useEffect(() => {
    const loadHashtags = async () => {
      if (postId) {
        const hashtags = await fetchPostHashtags();
        setPostHashtags(hashtags);
        console.log('Loaded hashtags:', hashtags);
      }
    };
    loadHashtags();
  }, [postId, fetchPostHashtags]);

  // Also refresh hashtags when modal closes
  useEffect(() => {
    if (!showModal && postId) {
      const refreshHashtags = async () => {
        const hashtags = await fetchPostHashtags();
        setPostHashtags(hashtags);
      };
      refreshHashtags();
    }
  }, [showModal, postId, fetchPostHashtags]);

  // Handle adding a new hashtag
  const handleAddHashtag = async () => {
    if (!hashtagInput.trim()) return;
    
    let hashtag = hashtagInput.trim();
    if (!hashtag.startsWith('#')) {
      hashtag = `#${hashtag}`;
    }
    
    hashtag = hashtag.replace(/^#+/, '#');
    
    try {
      setLoading(true);
      const result = await createHashtag(hashtag);
      
      if (result.success) {
        // Refresh hashtags
        const updatedHashtags = await fetchPostHashtags();
        setPostHashtags(updatedHashtags);
        
        setHashtagInput('');
        setShowModal(false);
      } else {
        console.error('Failed to create hashtag:', result.message);
        setHashtagError(result.message || 'Failed to create hashtag');
      }
    } catch (error) {
      console.error('Error adding hashtag:', error);
      setHashtagError(error.response?.data?.message || error.message || 'Error adding hashtag');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddHashtag();
    }
  };

  const toggleHashtagsExpanded = () => {
    setHashtagsExpanded(!hashtagsExpanded);
  };

  const getTopHashtags = () => {
    if (!postHashtags.length) return [];
    const sorted = [...postHashtags].sort((a, b) => b.count - a.count);
    return sorted.slice(0, 8);
  };

  const getRemainingHashtags = () => {
    if (!postHashtags.length || postHashtags.length <= 8) return [];
    const sorted = [...postHashtags].sort((a, b) => b.count - a.count);
    return sorted.slice(8);
  };

  // Render hashtag modal
  const renderHashtagModal = () => {
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
              Add Hashtag to Post
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
            Add a hashtag to post {postId}
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
          
          {hashtagError && (
            <div style={{ 
              color: '#ef4444', 
              fontSize: '12px', 
              marginTop: '8px',
              padding: '6px',
              background: '#fee2e2',
              borderRadius: '4px'
            }}>
              {hashtagError}
            </div>
          )}
          
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
              {loading ? <LoadingSpinner /> : <><Plus size={14} /> Add Hashtag</>}
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
                Current Hashtags ({postHashtags.length}):
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', maxHeight: '150px', overflowY: 'auto' }}>
                {postHashtags.map((hashtag, index) => (
                  <span
                    key={index}
                    style={{
                      background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
                      color: '#2E7D32',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      border: '1px solid #C8E6C9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <Tag size={9} />
                    {hashtag.tag}
                    <span style={{ fontSize: '9px', color: '#4CAF50' }}>
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
      <HashtagContainer $expanded={hashtagsExpanded}>
        <HashtagsHeader>
          <HashtagsLabel>
            <Tag size={12} /> 
            {isFetchingHashtags ? 'Loading Hashtags...' : 
             postHashtags.length > 0 ? `Top Hashtags (${postHashtags.length} total)` : 'Add Hashtags'}
          </HashtagsLabel>
          <AddHashtagButton onClick={() => setShowModal(true)}>
            <Plus size={10} /> Add
          </AddHashtagButton>
        </HashtagsHeader>
        
        {isFetchingHashtags ? (
          <div style={{ 
            padding: '10px', 
            textAlign: 'center',
            color: KENYA_COLORS.neutral,
            fontSize: '11px'
          }}>
            <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> Loading hashtags...
          </div>
        ) : hashtagError ? (
          <div style={{ 
            color: '#ef4444', 
            fontSize: '11px', 
            padding: '6px 0',
            fontStyle: 'italic'
          }}>
            {hashtagError}
          </div>
        ) : postHashtags.length > 0 ? (
          <>
            <HashtagsScrollContainer>
              {getTopHashtags().map((hashtag, index) => (
                <HashtagItem 
                  key={index}
                  $isPopular={hashtag.count > 10}
                  $count={hashtag.count}
                  title={`${hashtag.tag} (used ${hashtag.count} times)`}
                  onClick={() => {
                    setHashtagInput(hashtag.tag);
                    setShowModal(true);
                  }}
                >
                  <Tag size={8} />
                  {hashtag.tag}
                  {hashtag.count > 1 && (
                    <span style={{ 
                      fontSize: '8px', 
                      fontWeight: '700',
                      marginLeft: '2px'
                    }}>
                      {hashtag.count}
                    </span>
                  )}
                </HashtagItem>
              ))}
              
              {postHashtags.length > 8 && (
                <ShowMoreHashtags 
                  onClick={toggleHashtagsExpanded}
                  title={`Show all ${postHashtags.length} hashtags`}
                >
                  <MoreHorizontal size={8} />
                  {hashtagsExpanded ? 'Less' : `More (${postHashtags.length - 8})`}
                </ShowMoreHashtags>
              )}
            </HashtagsScrollContainer>
            
            {hashtagsExpanded && getRemainingHashtags().length > 0 && (
              <ExpandedHashtagsContainer>
                <ExpandedHeader>
                  <ExpandedTitle>
                    <Tag size={10} />
                    All Hashtags ({postHashtags.length})
                  </ExpandedTitle>
                  <CollapseButton onClick={toggleHashtagsExpanded}>
                    <X size={8} />
                    Collapse
                  </CollapseButton>
                </ExpandedHeader>
                
                <ExpandedHashtagsGrid>
                  {postHashtags.map((hashtag, index) => (
                    <HashtagItem 
                      key={index}
                      $isPopular={hashtag.count > 10}
                      $count={hashtag.count}
                      title={`${hashtag.tag} (used ${hashtag.count} times)`}
                      onClick={() => {
                        setHashtagInput(hashtag.tag);
                        setShowModal(true);
                      }}
                      style={{ flexShrink: 0 }}
                    >
                      <Tag size={8} />
                      {hashtag.tag}
                      <span style={{ 
                        fontSize: '8px', 
                        fontWeight: '700',
                        marginLeft: '2px'
                      }}>
                        {hashtag.count}
                      </span>
                    </HashtagItem>
                  ))}
                </ExpandedHashtagsGrid>
              </ExpandedHashtagsContainer>
            )}
          </>
        ) : (
          <div style={{ 
            color: KENYA_COLORS.neutral, 
            fontSize: '11px', 
            padding: '6px 0',
            fontStyle: 'italic'
          }}>
            No hashtags yet. Click "Add" to add hashtags.
          </div>
        )}
      </HashtagContainer>
      
      {renderHashtagModal()}
    </>
  );
};

export default HashtagSection;