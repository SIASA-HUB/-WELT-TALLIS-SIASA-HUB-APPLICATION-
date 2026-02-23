// styledComponents.jsx
import styled from 'styled-components';

export const Card = styled.div`
  background: white;
  border-radius: 12px;
  margin: 16px auto;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  max-width: 500px;
  width: 100%;
  
  @media (min-width: 768px) {
    margin: 20px auto;
    max-width: 520px;
  }
`;

export const Content = styled.div`
  padding: 14px 16px;
  color: #1f2937;
  line-height: 1.5;
  font-size: 15px;
`;

export const MediaContainer = styled.div`
  position: relative;
  width: 100%;
  margin-top: 12px;
  border-radius: 8px;
  overflow: hidden;
`;

export const MainImage = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
`;

export const MainImageContent = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const VideoBackupCarousel = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  margin-top: 12px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  display: ${props => props.show ? 'block' : 'none'};
`;

export const CarouselTrack = styled.div`
  display: flex;
  height: 100%;
  width: ${props => props.width || '100%'};
  transform: translateX(${props => props.translateX || '0'}px);
  transition: transform 0.5s ease-in-out;
`;

export const CarouselVideo = styled.div`
  min-width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const VideoPlayer = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${props => props.active ? 1 : 0.7};
  transition: opacity 0.3s;
  cursor: pointer;
  
  &:hover {
    opacity: 1;
  }
`;

export const YouTubeIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  opacity: ${props => props.active ? 1 : 0.7};
  transition: opacity 0.3s;
  
  &:hover {
    opacity: 1;
  }
`;

export const CarouselDots = styled.div`
  position: absolute;
  bottom: 12px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 6px;
  z-index: 3;
`;

export const Dot = styled.button`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: ${props => props.active ? props.theme?.primary || '#BB0000' : 'rgba(255, 255, 255, 0.5)'};
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? props.theme?.primary || '#BB0000' : 'rgba(255, 255, 255, 0.8)'};
  }
`;

export const PlayButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background: rgba(187, 0, 0, 0.85);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  opacity: ${props => props.playing ? 0 : 0.9};
  transition: opacity 0.3s;
  cursor: pointer;
  z-index: 2;
  
  &:hover {
    opacity: 1;
  }
`;

export const LoadingSpinner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #BB0000;
  animation: spin 1s linear infinite;
  z-index: 3;
  
  @keyframes spin {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }
`;

export const FullscreenButton = styled.button`
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.3s;
  cursor: pointer;
  z-index: 2;
  
  ${CarouselVideo}:hover & {
    opacity: 1;
  }
  
  &:hover {
    background: #BB0000;
  }
`;

export const VideoTitle = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  color: white;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 2;
  
  ${CarouselVideo}:hover & {
    opacity: 1;
  }
`;

export const CarouselNav = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3;
  transition: all 0.2s;
  opacity: 0.7;
  
  &:hover {
    background: #BB0000;
    opacity: 1;
  }
`;

export const PrevButton = styled(CarouselNav)`
  left: 12px;
`;

export const NextButton = styled(CarouselNav)`
  right: 12px;
`;

export const PostVideo = styled.video`
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  display: block;
  border-radius: 8px;
  background: #000;
`;

export const VideoControls = styled.div`
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: 8px 12px;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 2;
  
  ${MediaContainer}:hover & {
    opacity: 1;
  }
`;

export const ControlButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

export const ProgressBar = styled.div`
  flex: 1;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
`;

export const ProgressFill = styled.div`
  width: ${props => props.progress}%;
  height: 100%;
  background: #BB0000;
  border-radius: 2px;
`;

export const PostStats = styled.div`
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #f3f4f6;
  font-size: 13px;
  color: #6b7280;
  background: #fafafa;
`;

export const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const DownloadButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s;
  
  &:hover {
    background: #BB0000;
  }
`;

export const MediaBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  z-index: 10;
`;

export const AutoScrollToggle = styled.button`
  position: absolute;
  top: 12px;
  right: 80px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s;
  
  &:hover {
    background: #BB0000;
  }
`;

export const FullscreenModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 1000;
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

export const FullscreenVideo = styled.video`
  width: 90%;
  height: 80%;
  max-width: 1200px;
  object-fit: contain;
  background: #000;
  border-radius: 8px;
`;

export const FullscreenYouTube = styled.iframe`
  width: 90%;
  height: 80%;
  max-width: 1200px;
  border: none;
  border-radius: 8px;
`;

export const FullscreenCloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 1001;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
`;

export const VideoTitleFullscreen = styled.div`
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
  padding: 0 20px;
  max-width: 800px;
`;