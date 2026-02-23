import React from 'react';
import styled from 'styled-components';
import { Video } from 'lucide-react';

const Section = styled.div`
  background: white;
  margin: 0 15px 20px;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  border: 1px solid #f1f5f9;
  animation: fadeIn 1s ease-out;
`;

const SectionTitle = styled.h3`
  margin: 0 0 15px;
  font-size: 16px;
  font-weight: 800;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PinnedVideosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`;

const PinnedVideoCard = styled.div`
  aspect-ratio: 16/9;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  background: ${props => props.$image ? `url(${props.$image}) center/cover` : '#f1f5f9'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.03);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
`;

const PlayButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: rgba(187, 0, 0, 0.85);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
  
  ${PinnedVideoCard}:hover & {
    opacity: 1;
  }
`;

const PinnedVideos = () => {
  const pinnedVideos = [
    { id: 1, title: 'Campaign Speech', thumbnail: 'https://via.placeholder.com/300x200/BB0000/FFFFFF?text=Video+1', views: '1.2K' },
    { id: 2, title: 'Community Meeting', thumbnail: 'https://via.placeholder.com/300x200/006600/FFFFFF?text=Video+2', views: '850' },
    { id: 3, title: 'Policy Discussion', thumbnail: 'https://via.placeholder.com/300x200/000000/FFFFFF?text=Video+3', views: '2.1K' },
    { id: 4, title: 'Live Q&A Session', thumbnail: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Video+4', views: '3.4K' }
  ];

  return (
    <Section>
      <SectionTitle>
        <Video size={18} />
        Pinned Videos
      </SectionTitle>
      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: 15 }}>
        Your most important saved videos
      </div>
      
      <PinnedVideosGrid>
        {pinnedVideos.map((video) => (
          <PinnedVideoCard key={video.id} $image={video.thumbnail}>
            <PlayButton>
              ▶
            </PlayButton>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              color: 'white',
              padding: '8px',
              fontSize: '10px'
            }}>
              <div style={{ fontWeight: 600 }}>{video.title}</div>
              <div style={{ fontSize: '9px', opacity: 0.9 }}>👁️ {video.views} views</div>
            </div>
          </PinnedVideoCard>
        ))}
      </PinnedVideosGrid>
    </Section>
  );
};

export default PinnedVideos;