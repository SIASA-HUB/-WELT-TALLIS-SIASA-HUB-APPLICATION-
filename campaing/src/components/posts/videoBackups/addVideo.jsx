import React, { useCallback } from 'react';
import styled from 'styled-components';

const KENYA_COLORS = {
  primary: '#BB0000',
  accent: '#006600',
  highlight: '#FFFFFF',
  neutral: '#6B7280',
};

const AddVideoCard = styled.div`
  display: inline-block;
  width: 145px;
  height: 230px;
  border: 1.5px dashed ${KENYA_COLORS.primary}60;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;

  &:hover {
    border-color: ${KENYA_COLORS.accent};
    background: ${KENYA_COLORS.accent}06;
    transform: translateY(-2px);
  }
`;

const AddIcon = styled.div`
  font-size: 28px;
  color: ${KENYA_COLORS.primary};
  margin-bottom: 6px;
  transition: all 0.3s;
  
  ${AddVideoCard}:hover & {
    transform: scale(1.1);
  }
`;

const AddText = styled.div`
  font-size: 10px;
  color: ${KENYA_COLORS.primary};
  font-weight: 600;
  text-align: center;
  padding: 0 8px;
`;

const AddVideoCardComponent = ({ onUpload }) => {
  const handleUploadClick = useCallback(() => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 50 * 1024 * 1024) {
          alert('File too large. Maximum size: 50MB');
          return;
        }
        
        const videoUrl = URL.createObjectURL(file);
        
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          const duration = Math.floor(video.duration);
          const minutes = Math.floor(duration / 60);
          const seconds = duration % 60;
          
          const newVideo = {
            id: Date.now(),
            title: file.name.replace(/\.[^/.]+$/, ""),
            views: "0",
            likes: "0",
            duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
            thumbnail: videoUrl,
            url: videoUrl,
            type: "video"
          };
          
          if (onUpload) {
            onUpload(newVideo);
            alert('🎬 Video added to backups!');
          }
        };
        video.src = videoUrl;
      }
    };
    fileInput.click();
  }, [onUpload]);

  return (
    <AddVideoCard onClick={handleUploadClick}>
      <AddIcon>➕</AddIcon>
      <AddText>
        Add Video
      </AddText>
      <div style={{ 
        fontSize: '9px', 
        color: KENYA_COLORS.neutral,
        marginTop: '4px',
        textAlign: 'center',
        padding: '0 8px'
      }}>
        Click to upload
      </div>
    </AddVideoCard>
  );
};

export default AddVideoCardComponent;