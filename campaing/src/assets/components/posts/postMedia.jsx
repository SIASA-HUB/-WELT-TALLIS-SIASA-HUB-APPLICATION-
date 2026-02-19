import React, { useState, useRef } from 'react';
import styled from 'styled-components';

const KENYA_THEME = {
  primary: '#BB0000',
};

const MediaContainer = styled.div`
  position: relative;
  margin: 0 -20px;
  background: #000;
`;

const VideoPlayer = styled.video`
  width: 100%;
  max-height: 500px;
  display: block;
  background: #000;
`;

const ImagePost = styled.img`
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  display: block;
`;

const DownloadButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  
  &:hover {
    background: ${KENYA_THEME.primary};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export default function PostMedia({ media, onDownload }) {
  const [downloading, setDownloading] = useState(false);
  const videoRef = useRef(null);

  const handleDownload = async () => {
    if (!media?.url || downloading) return;
    
    setDownloading(true);
    try {
      const response = await fetch(media.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `post-${Date.now()}.${media.type === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      if (onDownload) onDownload();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (!media) return null;

  return (
    <MediaContainer>
      {media.type === 'video' ? (
        <VideoPlayer
          ref={videoRef}
          src={media.url}
          poster={media.thumbnail}
          controls
          autoPlay={false}
        />
      ) : (
        <ImagePost src={media.url} alt="Post content" />
      )}
      
      <DownloadButton onClick={handleDownload} disabled={downloading}>
        <span style={{ 
          display: 'inline-flex',
          animation: downloading ? 'spin 1s linear infinite' : 'none'
        }}>
          ⬇️
        </span>
        {downloading ? 'Downloading...' : 'Download'}
      </DownloadButton>
      
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </MediaContainer>
  );
}