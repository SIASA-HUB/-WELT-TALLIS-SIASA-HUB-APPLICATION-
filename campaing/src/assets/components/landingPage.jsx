import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

// --- External Sub-Component Imports ---
import PostCard from './posts/postCard'; // Fixed: Capitalized component name
import TrendingSection from './treading/treading';
import ManifestoPage from './manifesto';
import HeatMaps from './heatMaps/HeatMaps';

// --- Shared Theme Config ---
const theme = {
  colors: {
    primary: '#197fe6',
    secondary: '#94a3b8',
    text: '#0f172a',
    background: '#f8fafc',
    border: 'rgba(226, 232, 240, 0.8)',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b'
  },
  fonts: {
    main: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  }
};

// --- Global Icons Component ---
const SVGIcon = ({ name, size = 24, color = 'currentColor', onClick }) => {
  const icons = {
    home: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    menu: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
    notifications: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    live: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" fill={color} />
      </svg>
    ),
    trending: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    person: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    add: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    close: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    chevron_down: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    )
  };
  return <span onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>{icons[name] || null}</span>;
};

// --- Animations ---
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// --- Styled Components ---
const Container = styled.div`
  background: ${theme.colors.background};
  min-height: 100vh;
  font-family: ${theme.fonts.main};
  max-width: 480px;
  margin: 0 auto;
  position: relative;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.05);
`;

const TopBar = styled.header`
  position: sticky; 
  top: 0; 
  z-index: 1000;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid ${theme.colors.border};
  height: 60px; 
  padding: 0 20px;
  display: flex; 
  align-items: center; 
  justify-content: space-between;
`;

const AppTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.text};
  margin: 0;
  background: linear-gradient(135deg, ${theme.colors.primary}, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SearchBar = styled.div`
  margin: 16px 20px;
  padding: 12px 16px;
  background: white;
  border-radius: 16px;
  border: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  gap: 12px;
  animation: ${slideUp} 0.3s ease-out;
  
  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
    color: ${theme.colors.text};
    
    &::placeholder {
      color: ${theme.colors.secondary};
    }
  }
`;

const CategoryTabs = styled.div`
  position: sticky; 
  top: 60px; 
  z-index: 999;
  background: white; 
  padding: 12px 20px;
  display: flex; 
  gap: 8px;
  overflow-x: auto; 
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CategoryButton = styled.button`
  padding: 8px 16px; 
  border-radius: 12px; 
  border: none;
  background: ${props => props.$active ? theme.colors.primary : '#f8fafc'};
  color: ${props => props.$active ? 'white' : theme.colors.secondary};
  font-weight: 600; 
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
`;

const MainContent = styled.div`
  padding: 0 0 80px 0;
  animation: ${slideUp} 0.4s ease-out;
`;

const BottomNav = styled.nav`
  position: fixed; 
  bottom: 0; 
  width: 100%; 
  max-width: 480px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  display: flex; 
  justify-content: space-around;
  padding: 12px 0; 
  border-top: 1px solid ${theme.colors.border}; 
  z-index: 1000;
`;

const FabButton = styled.button`
  position: fixed; 
  bottom: 80px; 
  right: 20px;
  width: 56px; 
  height: 56px; 
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.primary}, #667eea);
  color: white; 
  border: none;
  box-shadow: 0 8px 24px rgba(25, 127, 230, 0.3);
  display: flex; 
  align-items: center; 
  justify-content: center;
  animation: ${pulse} 2s infinite;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 999;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 32px rgba(25, 127, 230, 0.4);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ViewMoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: calc(100% - 40px);
  margin: 20px auto;
  padding: 14px;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  color: ${theme.colors.primary};
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.primary}10;
    border-color: ${theme.colors.primary};
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

// --- MOCK DATA (Authentic Political Posts with Images) ---
const TRENDING_CANDIDATES = [
  {
    id: 1,
    name: "William Ruto",
    party: "UDA",
    position: "President",
    popular: true,
    followers: 245000,
    posts: 78,
    support: 65,
    manifesto: {
      title: "Bottom-Up Economic Model",
      description: "Empowering the hustle economy through MSMEs and agriculture.",
      points: [
        "Create 5 million jobs in digital economy",
        "Increase funding for SMEs by 200%",
        "Universal healthcare coverage",
        "Affordable housing program"
      ]
    }
  },
  {
    id: 2,
    name: "Raila Odinga",
    party: "ODM",
    position: "Presidential Candidate",
    popular: true,
    followers: 198000,
    posts: 65,
    support: 58,
    manifesto: {
      title: "Azimio la Umoja",
      description: "Unity and social protection for all Kenyans.",
      points: [
        "Monthly stipend for vulnerable households",
        "Free education up to university",
        "Industrialization and job creation",
        "Constitutional reforms"
      ]
    }
  },
  {
    id: 3,
    name: "Martha Karua",
    party: "NARC-KENYA",
    position: "Running Mate",
    popular: true,
    followers: 112000,
    posts: 56,
    support: 68,
    manifesto: {
      title: "Justice and Equality",
      description: "Fighting corruption and ensuring equal opportunities.",
      points: [
        "Strengthen anti-corruption institutions",
        "Gender equality in government",
        "Judicial reforms",
        "Youth empowerment programs"
      ]
    }
  },
  {
    id: 4,
    name: "Musalia Mudavadi",
    party: "FORD-KENYA",
    position: "Prime Minister",
    followers: 76000,
    posts: 38,
    support: 52,
    manifesto: {
      title: "Economic Recovery",
      description: "Stabilizing the economy through fiscal discipline.",
      points: [
        "Reduce government spending",
        "Attract foreign investment",
        "Support local industries",
        "Infrastructure development"
      ]
    }
  }
];

// Authentic political posts with images
const ALL_POSTS = [
  {
    id: 101,
    author: "Sena News",
    content: 'New poll shows shifting dynamics in the coastal region as undecided voters lean towards economic issues. Experts predict this could significantly impact the upcoming elections.',
    likes: 1200,
    dislikes: 45,
    comments: [
      { id: 'c1', author: 'John M.', content: 'The economy is definitely the deciding factor this time.', likes: 42, timestamp: '2:45 PM' },
      { id: 'c2', author: 'Sarah K.', content: 'I wish they would focus more on healthcare too.', likes: 28, timestamp: '3:20 PM' }
    ],
    timestamp: '2 hours ago',
    avatarColor: '#667eea',
    image: 'https://images.unsplash.com/photo-1551135049-8a33b2fb2f3f?w=400&h=300&fit=crop'
  },
  {
    id: 102,
    author: "Politics KE",
    content: 'Presidential debate scheduled for next Tuesday at 8 PM. All major candidates have confirmed participation. Who are you rooting for? Share your thoughts below.',
    likes: 850,
    dislikes: 23,
    comments: [
      { id: 'c3', author: 'Mike T.', content: 'Looking forward to hearing their policy details!', likes: 56, timestamp: '1:15 PM' },
      { id: 'c4', author: 'Linda W.', content: 'Finally! We need to hear their plans directly.', likes: 32, timestamp: '1:45 PM' }
    ],
    timestamp: '4 hours ago',
    avatarColor: '#10b981',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop'
  },
  {
    id: 103,
    author: "Campaign Watch",
    content: 'Record voter registration numbers reported across all counties. IEBC announces highest ever registration rate among youth aged 18-25.',
    likes: 2300,
    dislikes: 89,
    comments: [],
    timestamp: '1 hour ago',
    avatarColor: '#f59e0b',
    image: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w-400&h=300&fit=crop'
  },
  {
    id: 104,
    author: "Economic Times",
    content: 'New economic policies proposed by leading candidates could create over 2 million new jobs in the next fiscal year according to independent analysis.',
    likes: 980,
    dislikes: 34,
    comments: [
      { id: 'c5', author: 'James K.', content: 'Promises are easy, implementation is hard.', likes: 67, timestamp: '5:20 PM' },
      { id: 'c6', author: 'Mary J.', content: 'We need concrete plans, not just numbers.', likes: 45, timestamp: '6:05 PM' }
    ],
    timestamp: '5 hours ago',
    avatarColor: '#8b5cf6'
  },
  {
    id: 105,
    author: "Youth Voice",
    content: 'Young voters demand more representation in government. Youth-led movements gain momentum ahead of elections.',
    likes: 3200,
    dislikes: 120,
    comments: [
      { id: 'c7', author: 'David L.', content: 'About time! Youth are 60% of the population.', likes: 89, timestamp: '11:30 AM' },
      { id: 'c8', author: 'Grace N.', content: 'We need youth ministers in every department.', likes: 76, timestamp: '12:15 PM' }
    ],
    timestamp: '3 hours ago',
    avatarColor: '#ef4444',
    image: 'https://images.unsplash.com/photo-1529254479751-fbacb4c9a550?w-400&h=300&fit=crop'
  },
  {
    id: 106,
    author: "Agriculture Digest",
    content: 'Farmers express concerns over proposed agricultural policies. Many fear changes could affect food security.',
    likes: 670,
    dislikes: 56,
    comments: [
      { id: 'c9', author: 'Robert M.', content: 'Agriculture is our backbone. Handle with care!', likes: 54, timestamp: '9:45 AM' }
    ],
    timestamp: '6 hours ago',
    avatarColor: '#84cc16'
  },
  {
    id: 107,
    author: "Tech Kenya",
    content: 'Digital economy policies take center stage in election manifestos. Tech community watches closely.',
    likes: 1450,
    dislikes: 23,
    comments: [
      { id: 'c10', author: 'Brian O.', content: 'Finally tech is getting attention!', likes: 98, timestamp: '8:20 AM' },
      { id: 'c11', author: 'Susan T.', content: 'Need more than just promises.', likes: 45, timestamp: '9:05 AM' }
    ],
    timestamp: '8 hours ago',
    avatarColor: '#0ea5e9',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop'
  },
  {
    id: 108,
    author: "Healthcare Today",
    content: 'Universal healthcare proposals spark debate among candidates. Implementation costs raise concerns.',
    likes: 890,
    dislikes: 78,
    comments: [
      { id: 'c12', author: 'Dr. Patel', content: 'Healthcare should be a right, not a privilege.', likes: 120, timestamp: '7:15 AM' }
    ],
    timestamp: '10 hours ago',
    avatarColor: '#ec4899'
  }
];

// --- Helper Components ---
const NavIcon = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      background: 'none',
      border: 'none',
      padding: '8px',
      color: active ? theme.colors.primary : theme.colors.secondary,
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }}
  >
    <SVGIcon name={icon} size={22} />
    <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: active ? '600' : '400' }}>{label}</span>
  </button>
);

// --- PostsContainer Component ---
const PostsContainer = ({ posts, searchQuery, onUpdatePost, visibleCount, onShowMore }) => {
  const filteredPosts = posts.filter(post => {
    if (searchQuery.trim() === '') return true;
    return post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
           post.author.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const displayedPosts = filteredPosts.slice(0, visibleCount);
  const hasMorePosts = filteredPosts.length > visibleCount;

  if (displayedPosts.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: theme.colors.secondary,
        fontSize: '14px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <div>No posts found for "{searchQuery}"</div>
        <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
          Try a different search term
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 20px' }}>
      {displayedPosts.map(post => (
        <PostCard 
          key={post.id} 
          post={post}
          onUpdatePost={onUpdatePost}
        />
      ))}
      
      {hasMorePosts && (
        <ViewMoreButton onClick={onShowMore}>
          <span>View More Posts ({filteredPosts.length - visibleCount} remaining)</span>
          <SVGIcon name="chevron_down" size={18} color={theme.colors.primary} />
        </ViewMoreButton>
      )}
    </div>
  );
};

// --- Main App Component ---
export default function SiasaApp() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState(ALL_POSTS);
  const [activeNav, setActiveNav] = useState('home');
  const [visiblePostCount, setVisiblePostCount] = useState(3);

  const handleUpdatePost = (updatedPost) => {
    setPosts(posts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  const handleSelectCandidate = (candidate) => {
    console.log('Selected candidate:', candidate);
    setSelectedCandidate(candidate);
  };

  const handleCreatePost = () => {
    const newPost = {
      id: Date.now(),
      author: "You",
      content: "This is my new political post about important issues!",
      likes: 0,
      dislikes: 0,
      comments: [],
      timestamp: 'Just now',
      avatarColor: '#197fe6'
    };
    
    setPosts([newPost, ...posts]);
    
    if (visiblePostCount < posts.length + 1) {
      setVisiblePostCount(visiblePostCount + 1);
    }
  };

  const handleShowMorePosts = () => {
    setVisiblePostCount(prev => Math.min(prev + 3, posts.length));
  };

  return (
    <Container>
    

      {/* Search Bar */}
      <SearchBar>
        <SVGIcon name="search" size={20} color={theme.colors.secondary} />
        <input
          type="text"
          placeholder="Search posts, candidates, or topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <SVGIcon 
            name="close" 
            size={18} 
            color={theme.colors.secondary}
            onClick={() => setSearchQuery('')}
          />
        )}
      </SearchBar>

      {/* Category Tabs */}
      <CategoryTabs>
        {['All', 'News', 'Rallies', 'Polls', 'Manifestos', 'Debates'].map(tab => (
          <CategoryButton 
            key={tab} 
            $active={activeTab === tab} 
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </CategoryButton>
        ))}
      </CategoryTabs>

      {/* Main Content Area */}
      <MainContent>
        {/* Trending Candidates Section */}
        <TrendingSection 
          candidates={TRENDING_CANDIDATES}
          onSelect={handleSelectCandidate}
          title="🔥 Trending Now"
          loading={false}
        />

    
        {/* Posts Container with View More */}
        <PostsContainer 
          posts={posts}
          searchQuery={searchQuery}
          onUpdatePost={handleUpdatePost}
          visibleCount={visiblePostCount}
          onShowMore={handleShowMorePosts}
        />

            {/* Heat Maps Section */}
        <HeatMaps />

      </MainContent>

 

      {/* Manifesto Modal */}
      {selectedCandidate && (
        <ManifestoModal 
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </Container>
  );
}