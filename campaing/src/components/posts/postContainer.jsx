// PostsContainer.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from './postCard';

const PostsContainer = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    console.log('🔍 Starting fetch from backend...');
    setLoading(true);
    setError(null);
    
    try {
      // Direct fetch to your backend API
      const response = await axios.get(
        'https://eventually-carry-annual-title.trycloudflare.com/api/v1/posts/get?page=1&limit=10',
        {
          timeout: 5000,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      console.log('✅ Backend response:', response.data);
      
      if (response.data && response.data.success) {
        if (Array.isArray(response.data.posts) && response.data.posts.length > 0) {
          // Transform API data to PostCard format
          const transformedPosts = response.data.posts.map(post => ({
            id: post.id,
            post_id: post.post_id,
            title: post.title || '',
            content: post.description || '',
            timestamp: post.created_at,
            media: {
              url: post.image_url || '',
              type: post.image_url ? 'image' : 'none'
            }
          }));
          
          console.log(`✅ Loaded ${transformedPosts.length} posts from backend`);
          setPosts(transformedPosts);
        } else {
          console.log('⚠️ No posts in response');
          setPosts([]);
        }
      } else {
        console.error('❌ API response not successful');
        setError('Backend returned unsuccessful response');
      }
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(`Failed to load posts: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #BB0000',
          borderRadius: '50%',
          margin: '0 auto',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '20px', color: '#666' }}>
          Fetching posts from backend...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '48px', color: '#BB0000' }}>⚠️</div>
        <h3>Error Loading Posts</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
        <button
          onClick={fetchPosts}
          style={{
            background: '#BB0000',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '48px', color: '#666' }}>📭</div>
        <h3>No Posts Found</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Backend returned no posts.
        </p>
        <button
          onClick={fetchPosts}
          style={{
            background: '#BB0000',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        background: '#f8f9fa',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#BB0000', margin: 0 }}>
          Posts from Backend ({posts.length})
        </h2>
        <p style={{ color: '#666', marginTop: '5px' }}>
          Real data from: http://localhost:8007
        </p>
      </div>
      
      {posts.map(post => (
        <PostCard key={post.post_id} post={post} />
      ))}
    </div>
  );
};

export default PostsContainer;