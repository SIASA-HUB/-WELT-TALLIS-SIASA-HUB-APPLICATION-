// PostCard.js - COMPLETE UPDATED VERSION WITH IMPROVED SEARCH
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { ArrowDownToLine } from 'lucide-react';
import PostHeader from './postHeader';
import PostActions from './postActions';
const VideoBackups = React.lazy(() => import('./videoBackups/videoBackUps'));
const CommentsSection = React.lazy(() => import('./commentSection'));
import { KENYA_COLORS } from './constants';
import * as Styled from './styledComponents';

// Base URL
const API_BASE_URL = 'http://localhost:8007';

// Function to format timestamp to "X time ago"
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now';
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Just now';
    
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    return `${diffYears}y ago`;
  } catch (error) {
    return 'Just now';
  }
};

const PostCard = ({ searchQuery = '' }) => {
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [backupVideosMap, setBackupVideosMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showComments, setShowComments] = useState({});
  const [showVideoBackups, setShowVideoBackups] = useState({});
  const [postLikes, setPostLikes] = useState({});
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  const observer = useRef();
  const lastPostRef = useCallback(node => {
    if (isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
        loadMorePosts();
      }
    });
    if (node) observer.current.observe(node);
  }, [isFetchingMore, hasMore]);

  // IMPROVED: Filter posts based on search query with word matching
  const filterPosts = (query, posts) => {
    if (!query || query.trim() === '') {
      return posts;
    }
    
    const searchTerm = query.toLowerCase().trim();
    
    // Split search query into individual words
    const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 2);
    
    return posts.filter(post => {
      // If single word search or no word splitting needed
      if (searchWords.length === 0) {
        return basicSearch(searchTerm, post);
      }
      
      // For multi-word searches, check if ANY word matches
      return searchWords.some(word => {
        // Check title
        if (post.title && post.title.toLowerCase().includes(word)) {
          return true;
        }
        
        // Check content/description
        if (post.content && post.content.toLowerCase().includes(word)) {
          return true;
        }
        
        // Check author
        if (post.author && post.author.toLowerCase().includes(word)) {
          return true;
        }
        
        // Check party
        if (post.party && post.party.toLowerCase().includes(word)) {
          return true;
        }
        
        // Check location
        if (post.location && post.location.toLowerCase().includes(word)) {
          return true;
        }
        
        // Check hashtags
        const hashtags = post.content?.match(/#\w+/g) || [];
        if (hashtags.some(tag => tag.toLowerCase().includes(word))) {
          return true;
        }
        
        return false;
      });
    });
    
    // Helper function for basic single word search
    function basicSearch(term, post) {
      // Search in title
      if (post.title && post.title.toLowerCase().includes(term)) {
        return true;
      }
      
      // Search in content
      if (post.content && post.content.toLowerCase().includes(term)) {
        return true;
      }
      
      // Search in author name
      if (post.author && post.author.toLowerCase().includes(term)) {
        return true;
      }
      
      // Search in party
      if (post.party && post.party.toLowerCase().includes(term)) {
        return true;
      }
      
      // Search in location
      if (post.location && post.location.toLowerCase().includes(term)) {
        return true;
      }
      
      // Search in hashtags within content
      const hashtags = post.content?.match(/#\w+/g) || [];
      if (hashtags.some(tag => tag.toLowerCase().includes(term))) {
        return true;
      }
      
      // Check for similar words (fuzzy matching)
      if (post.title) {
        const titleWords = post.title.toLowerCase().split(/\s+/);
        if (titleWords.some(word => calculateSimilarity(word, term) > 0.6)) {
          return true;
        }
      }
      
      if (post.content) {
        const contentWords = post.content.toLowerCase().split(/\s+/);
        if (contentWords.some(word => calculateSimilarity(word, term) > 0.6)) {
          return true;
        }
      }
      
      return false;
    }
  };

  // Calculate similarity between two strings (Levenshtein distance based)
  const calculateSimilarity = (str1, str2) => {
    if (!str1 || !str2) return 0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    // Check if shorter is a substring of longer
    if (longer.includes(shorter)) return 1.0;
    
    // Simple similarity based on common characters
    const set1 = new Set(str1);
    const set2 = new Set(str2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  };

  // Update filtered posts when search query changes
  useEffect(() => {
    const filtered = filterPosts(searchQuery, allPosts);
    setFilteredPosts(filtered);
    
    if (searchQuery.trim()) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  }, [searchQuery, allPosts]);

  // Toggle description expansion
  const toggleDescription = (postId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // IMPROVED: Format content with better search highlighting
  const formatContent = (content, postId, highlightSearch = false) => {
    if (!content) return '';
    
    const isExpanded = expandedDescriptions[postId];
    const MAX_LENGTH = 150;
    const shouldTruncate = content.length > MAX_LENGTH && !isExpanded;
    
    const displayContent = shouldTruncate 
      ? content.substring(0, MAX_LENGTH) + '...' 
      : content;
    
    // Split content into parts
    const parts = displayContent.split(/(#\w+)/g);
    
    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith('#')) {
            return (
              <span key={index} style={{ color: KENYA_COLORS.primary, fontWeight: 'bold' }}>
                {part}
              </span>
            );
          } else if (highlightSearch && searchQuery) {
            // Split search query into words
            const searchWords = searchQuery.toLowerCase().split(/\s+/).filter(word => word.length > 2);
            
            // Highlight each matching word
            let highlightedPart = part;
            searchWords.forEach(word => {
              if (highlightedPart.toLowerCase().includes(word)) {
                const regex = new RegExp(`(${word})`, 'gi');
                highlightedPart = highlightedPart.replace(regex, (match) => (
                  `<span style="background-color: #FFEB3B; padding: 0 2px; border-radius: 2px; font-weight: bold">${match}</span>`
                ));
              }
            });
            
            // If we found matches, render with dangerouslySetInnerHTML
            if (highlightedPart !== part) {
              return (
                <span 
                  key={index}
                  dangerouslySetInnerHTML={{ __html: highlightedPart }}
                />
              );
            }
          }
          return part;
        })}
        {content.length > MAX_LENGTH && (
          <button
            onClick={() => toggleDescription(postId)}
            style={{
              background: 'none',
              border: 'none',
              color: KENYA_COLORS.primary,
              fontWeight: 'bold',
              cursor: 'pointer',
              padding: '0 4px',
              marginLeft: '4px',
              fontSize: '14px'
            }}
          >
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>
        )}
      </>
    );
  };

  // Optimized fetch for backup videos (only when needed)
  const fetchBackupVideos = async (postId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/backup/${postId}`);
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      
      let videosArray = [];
      if (data.success && Array.isArray(data.videos)) {
        videosArray = data.videos;
      } else if (Array.isArray(data)) {
        videosArray = data;
      } else if (data.data && Array.isArray(data.data)) {
        videosArray = data.data;
      } else if (data.videos && Array.isArray(data.videos)) {
        videosArray = data.videos;
      }
      
      const transformedVideos = videosArray.map((video, index) => ({
        id: video.id || video._id || video.public_id || `video_${postId}_${index}_${Date.now()}`,
        title: video.title || `Backup Video ${index + 1}`,
        views: video.views || video.view_count || "0",
        likes: video.likes || video.like_count || "0",
        duration: video.duration || "0:30",
        thumbnail: video.thumbnail_url || video.thumbnail || '',
        url: video.video_url || video.url || '',
        type: 'video',
        description: video.description || '',
        pinned: video.pinned || false,
      }));
      
      return transformedVideos;
    } catch (error) {
      console.error(`Error fetching backup videos for post ${postId}:`, error);
      return [];
    }
  };

  const transformPostData = (rawPost) => {
    if (!rawPost) return null;
    
    const extractParty = () => {
      if (!rawPost.title && !rawPost.description) return 'Independent';
      const text = (rawPost.title || '') + ' ' + (rawPost.description || '');
      if (text.includes('ODM') || text.includes('odm')) return 'ODM';
      if (text.includes('UDA') || text.includes('uda')) return 'UDA';
      if (text.includes('ANC') || text.includes('anc')) return 'ANC';
      return 'Independent';
    };
    
    const postId = rawPost.post_id || rawPost.id || rawPost._id || `post_${Date.now()}_${Math.random()}`;
    const timestamp = rawPost.created_at || rawPost.timestamp || new Date().toISOString();
    const timeAgo = formatTimeAgo(timestamp);
    
    return {
      id: postId,
      post_id: postId,
      author: rawPost.author || `User ${rawPost.user_id?.slice(-4) || 'Unknown'}`,
      party: extractParty(),
      title: rawPost.title || '',
      content: rawPost.description || rawPost.title || rawPost.content || '',
      timestamp: timestamp,
      timeAgo: timeAgo,
      location: rawPost.location || 'Kenya',
      isLive: rawPost.isLive || false,
      media: rawPost.image_url ? {
        url: rawPost.image_url,
        type: 'image'
      } : (rawPost.media || null),
      likes: rawPost.likes || 0,
      dislikes: rawPost.dislikes || 0,
      comments: rawPost.comments || [],
      shares: rawPost.shares || 0,
      downloads: rawPost.downloads || 0,
    };
  };

  // Fetch posts with pagination
  const fetchPosts = async (pageNum = 1, isLoadMore = false) => {
    if (searchQuery.trim() && isLoadMore) return;
    
    if (isLoadMore) {
      setIsFetchingMore(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/posts/get?page=${pageNum}&limit=10`);
      const data = await response.json();
      
      let fetchedPosts = [];
      
      if (data.success && Array.isArray(data.posts)) {
        fetchedPosts = data.posts;
        setHasMore(data.posts.length === 10 && !searchQuery.trim());
      } else if (Array.isArray(data)) {
        fetchedPosts = data;
        setHasMore(data.length === 10 && !searchQuery.trim());
      } else if (data.data && Array.isArray(data.data)) {
        fetchedPosts = data.data;
        setHasMore(data.data.length === 10 && !searchQuery.trim());
      } else if (data.posts && Array.isArray(data.posts)) {
        fetchedPosts = data.posts;
        setHasMore(data.posts.length === 10 && !searchQuery.trim());
      }
      
      const transformedPosts = fetchedPosts.map(transformPostData).filter(Boolean);
      
      if (isLoadMore) {
        const updatedAllPosts = [...allPosts, ...transformedPosts];
        setAllPosts(updatedAllPosts);
        const filtered = filterPosts(searchQuery, updatedAllPosts);
        setFilteredPosts(filtered);
        setPage(prev => prev + 1);
      } else {
        setAllPosts(transformedPosts);
        const filtered = filterPosts(searchQuery, transformedPosts);
        setFilteredPosts(filtered);
        setPage(2);
        setInitialLoadDone(true);
      }
      
      const newPosts = isLoadMore ? transformedPosts : transformedPosts;
      const newCommentStates = {};
      const newBackupStates = {};
      const newLikes = {};
      const newExpandedStates = {};
      
      newPosts.forEach(post => {
        if (post.post_id) {
          newCommentStates[post.post_id] = false;
          newBackupStates[post.post_id] = false;
          newLikes[post.post_id] = post.likes || 0;
          newExpandedStates[post.post_id] = false;
        }
      });
      
      setShowComments(prev => ({ ...prev, ...newCommentStates }));
      setShowVideoBackups(prev => ({ ...prev, ...newBackupStates }));
      setPostLikes(prev => ({ ...prev, ...newLikes }));
      setExpandedDescriptions(prev => ({ ...prev, ...newExpandedStates }));
      
    } catch (error) {
      console.error('Error fetching posts:', error);
      setHasMore(false);
    } finally {
      if (isLoadMore) {
        setIsFetchingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const loadMorePosts = () => {
    if (!hasMore || isFetchingMore || searchQuery.trim()) return;
    fetchPosts(page, true);
  };

  useEffect(() => {
    fetchPosts(1, false);
  }, []);

  // Post action handlers (keep as is)
  const handlePostLike = (postId) => {
    const newLikes = (postLikes[postId] || 0) + 1;
    setPostLikes(prev => ({ ...prev, [postId]: newLikes }));
    setAllPosts(prevPosts => 
      prevPosts.map(post => 
        post.post_id === postId ? { ...post, likes: newLikes } : post
      )
    );
    setFilteredPosts(prevPosts => 
      prevPosts.map(post => 
        post.post_id === postId ? { ...post, likes: newLikes } : post
      )
    );
  };

  const handlePostDislike = (postId) => {
    setAllPosts(prevPosts => 
      prevPosts.map(post => 
        post.post_id === postId ? { ...post, dislikes: (post.dislikes || 0) + 1 } : post
      )
    );
    setFilteredPosts(prevPosts => 
      prevPosts.map(post => 
        post.post_id === postId ? { ...post, dislikes: (post.dislikes || 0) + 1 } : post
      )
    );
  };

  const handleShare = (postId, post) => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.author}`,
        text: post.content?.substring(0, 100) + '...' || '',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
    
    setAllPosts(prevPosts => 
      prevPosts.map(p => 
        p.post_id === postId ? { ...p, shares: (p.shares || 0) + 1 } : p
      )
    );
    setFilteredPosts(prevPosts => 
      prevPosts.map(p => 
        p.post_id === postId ? { ...p, shares: (p.shares || 0) + 1 } : p
      )
    );
  };

  const handleDownload = (postId, post) => {
    const media = post.media;
    if (!media || !media.url) {
      alert('No media to download');
      return;
    }

    const link = document.createElement('a');
    link.href = media.url;
    link.download = `post-${post.id}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setAllPosts(prevPosts => 
      prevPosts.map(p => 
        p.post_id === postId ? { ...p, downloads: (p.downloads || 0) + 1 } : p
      )
    );
    setFilteredPosts(prevPosts => 
      prevPosts.map(p => 
        p.post_id === postId ? { ...p, downloads: (p.downloads || 0) + 1 } : p
      )
    );
  };

  const handleAddComment = (postId, newComment) => {
    setAllPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.post_id === postId) {
          const updatedComments = [...(post.comments || []), newComment];
          return { ...post, comments: updatedComments };
        }
        return post;
      })
    );
    setFilteredPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.post_id === postId) {
          const updatedComments = [...(post.comments || []), newComment];
          return { ...post, comments: updatedComments };
        }
        return post;
      })
    );
  };

  const handleAddBackupVideo = (postId, newVideo) => {
    setBackupVideosMap(prev => {
      const currentVideos = prev[postId] || [];
      return {
        ...prev,
        [postId]: [...currentVideos, newVideo]
      };
    });
  };

  const handleToggleBackups = async (postId) => {
    const newState = !showVideoBackups[postId];
    
    if (newState && !backupVideosMap[postId]) {
      const videos = await fetchBackupVideos(postId);
      if (videos.length > 0) {
        setBackupVideosMap(prev => ({
          ...prev,
          [postId]: videos
        }));
      }
    }
    
    setShowVideoBackups(prev => ({
      ...prev,
      [postId]: newState
    }));
  };

  const renderMedia = (post) => {
    const media = post.media;
    
    if (!media || !media.url) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#666',
          background: '#f5f5f5',
          borderRadius: '8px',
          margin: '10px 0'
        }}>
          No media attached to this post
        </div>
      );
    }

    return (
      <Styled.MediaContainer>
        <Styled.MainImage>
          <Styled.MainImageContent 
            src={media.url} 
            alt="Post content" 
            loading="lazy"
          />
        </Styled.MainImage>
      </Styled.MediaContainer>
    );
  };

  // Loading state for initial load
  if (isLoading && !initialLoadDone) {
    return (
      <>
        {[...Array(3)].map((_, index) => (
          <Styled.Card key={`skeleton_${index}`} style={{ marginBottom: '20px' }}>
            <div style={{ padding: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#e0e0e0',
                  marginRight: '10px'
                }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    width: '60%',
                    height: '16px',
                    background: '#e0e0e0',
                    marginBottom: '5px',
                    borderRadius: '4px'
                  }}></div>
                  <div style={{
                    width: '40%',
                    height: '12px',
                    background: '#e0e0e0',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{
                  width: '100%',
                  height: '14px',
                  background: '#e0e0e0',
                  marginBottom: '8px',
                  borderRadius: '4px'
                }}></div>
                <div style={{
                  width: '80%',
                  height: '14px',
                  background: '#e0e0e0',
                  marginBottom: '8px',
                  borderRadius: '4px'
                }}></div>
                <div style={{
                  width: '60%',
                  height: '14px',
                  background: '#e0e0e0',
                  borderRadius: '4px'
                }}></div>
              </div>
              
              <div style={{
                width: '100%',
                height: '200px',
                background: '#e0e0e0',
                borderRadius: '8px',
                marginBottom: '15px'
              }}></div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '10px',
                borderTop: '1px solid #eee'
              }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{
                    width: '40px',
                    height: '20px',
                    background: '#e0e0e0',
                    borderRadius: '4px'
                  }}></div>
                ))}
              </div>
            </div>
          </Styled.Card>
        ))}
      </>
    );
  }

  const displayPosts = searchQuery.trim() ? filteredPosts : allPosts;

  if (displayPosts.length === 0 && initialLoadDone) {
    if (searchQuery.trim()) {
      return (
        <Styled.Card>
          <div style={{ 
            padding: '40px 20px', 
            textAlign: 'center', 
            color: '#666',
            background: '#f9f9f9',
            borderRadius: '8px'
          }}>
        
            <h3>No search results</h3>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>
              No posts found for "{searchQuery}"
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: KENYA_COLORS.primary,
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Clear Search & Show All Posts
            </button>
          </div>
        </Styled.Card>
      );
    } else {
      return (
        <Styled.Card>
          <div style={{ 
            padding: '40px 20px', 
            textAlign: 'center', 
            color: '#666',
            background: '#f9f9f9',
            borderRadius: '8px'
          }}>
   
            <h3>No posts available</h3>
            <p style={{ fontSize: '14px', color: '#888' }}>
              There are no posts to display at the moment.
            </p>
          </div>
        </Styled.Card>
      );
    }
  }

  const renderSearchHeader = () => {
    if (!searchQuery.trim()) return null;
    
    return (
      <div style={{
        padding: '10px 16px',
        background: '#E8F5E9',
        borderBottom: `2px solid ${KENYA_COLORS.accent}`,
        marginBottom: '15px',
        borderRadius: '8px 8px 0 0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
      
       
        </div>
      </div>
    );
  };

  return (
    <>
      {renderSearchHeader()}
      
      {displayPosts.map((post, index) => {
        const currentPostLikes = postLikes[post.post_id] || post.likes || 0;
        const backupVideos = backupVideosMap[post.post_id] || [];
        const backupCount = backupVideos.length;
        const isLastPost = index === displayPosts.length - 1 && !searchQuery.trim();
        
        return (
          <Styled.Card 
            key={`post_${post.id}`} 
            style={{ marginBottom: '20px' }}
            ref={isLastPost ? lastPostRef : null}
          >
            <PostHeader 
              title={post.title}
              author={post.author}
              party={post.party}
              timestamp={post.timeAgo}
              location={post.location}
              isLive={post.isLive}
            />

            <Styled.Content>
              <div style={{ 
                whiteSpace: 'pre-wrap',
                marginBottom: '15px',
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#333',
                padding: '0 5px'
              }}>
                {formatContent(post.content, post.post_id, true)}
              </div>

              {renderMedia(post)}
            </Styled.Content>

            <PostActions
              likes={currentPostLikes}
              dislikes={post.dislikes || 0}
              comments={post.comments?.length || 0}
              shares={post.shares || 0}
              downloads={post.downloads || 0}
              backups={backupCount}
              onLike={() => handlePostLike(post.post_id)}
              onDislike={() => handlePostDislike(post.post_id)}
              onComment={() => setShowComments(prev => ({
                ...prev,
                [post.post_id]: !prev[post.post_id]
              }))}
              onShare={() => handleShare(post.post_id, post)}
              onToggleBackups={() => handleToggleBackups(post.post_id)}
              onDownload={() => handleDownload(post.post_id, post)}
            />

            {showVideoBackups[post.post_id] && (
              <Suspense fallback={
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: KENYA_COLORS.primary 
                }}>
                  Loading video backups...
                </div>
              }>
                <VideoBackups 
                  postId={post.post_id}
                  videos={backupVideos}
                  onAddVideo={(newVideo) => handleAddBackupVideo(post.post_id, newVideo)}
                  onClose={() => setShowVideoBackups(prev => ({
                    ...prev,
                    [post.post_id]: false
                  }))}
                />
              </Suspense>
            )}

            {showComments[post.post_id] && (
              <CommentsSection 
                comments={post.comments || []}
                onAddComment={(newComment) => handleAddComment(post.post_id, newComment)}
                onClose={() => setShowComments(prev => ({
                  ...prev,
                  [post.post_id]: false
                }))}
              />
            )}
          </Styled.Card>
        );
      })}

      {isFetchingMore && !searchQuery.trim() && (
        <Styled.Card>
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            color: KENYA_COLORS.primary
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              border: `2px solid ${KENYA_COLORS.primary}20`,
              borderTopColor: KENYA_COLORS.primary,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
            <p style={{ marginTop: '10px', fontSize: '14px' }}>Loading more posts...</p>
          </div>
        </Styled.Card>
      )}

      {!hasMore && displayPosts.length > 0 && !searchQuery.trim() && (
        <Styled.Card>
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            color: '#666',
            background: '#f9f9f9',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '14px' }}>No more posts to load</p>
          </div>
        </Styled.Card>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default PostCard;