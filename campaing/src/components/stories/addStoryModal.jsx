// components/AddStoryModal.jsx - Fixed for mobile & no limits
import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  X,
  Loader2,
  Image as ImageIcon,
  Video,
  Type,
  Send,
  Trash2,
  CheckCircle,
  AlertCircle,
  Lock,
  User,
} from "lucide-react";
import api from "../../api/api";
import { useAuth } from "../hooks/useAuth";

// Animations
const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Styled Components
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: ${fadeIn} 0.3s ease;
`;

const Content = styled.div`
  background: #121212;
  width: 100%;
  max-width: 480px;
  border-radius: 24px 24px 0 0;
  padding: 20px;
  padding-bottom: calc(env(safe-area-inset-bottom, 20px) + 70px);
  animation: ${slideUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 90vh;
  overflow-y: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  &::-webkit-scrollbar-thumb {
    background: #25d366;
    border-radius: 4px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #25d366, #128c7e);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: white;
    font-size: 18px;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .meta {
    .name {
      font-size: 15px;
      font-weight: 700;
      color: #fff;
    }
    .target {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
  }
`;

const TabGroup = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px;
  border-radius: 14px;
  margin-bottom: 20px;
  flex-shrink: 0;
`;

const Tab = styled.button`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  background: ${(props) => (props.$active ? "#25d366" : "transparent")};
  color: ${(props) => (props.$active ? "#000" : "#94a3b8")};
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${(props) =>
    props.$active ? "#25d366" : "rgba(255,255,255,0.05)"};
  }
`;

const InputWrapper = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 18px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: border-color 0.2s;

  &:focus-within {
    border-color: #25d366;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 16px;
  min-height: 100px;
  outline: none;
  resize: vertical;
  font-family: inherit;
  -webkit-appearance: none;
  appearance: none;

  &::placeholder {
    color: #475569;
    font-size: 14px;
  }
`;

const CharCounter = styled.div`
  text-align: right;
  font-size: 11px;
  color: #475569;
  margin-top: 8px;
`;

const PreviewContainer = styled.div`
  position: relative;
  margin-top: 16px;
  border-radius: 14px;
  overflow: hidden;
  background: #000;

  img,
  video {
    width: 100%;
    display: block;
    max-height: 300px;
    object-fit: contain;
  }
`;

const RemoveMediaBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);

  &:hover {
    background: #ef4444;
  }
`;

const MediaUploadBtn = styled.button`
  width: 100%;
  margin-top: 12px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #25d366;
    color: #25d366;
    background: rgba(37, 211, 102, 0.05);
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  margin-top: 24px;
  padding: 16px 20px;
  border-radius: 16px;
  border: none;
  background: #25d366;
  color: #000;
  font-size: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

const LoginPrompt = styled.div`
  text-align: center;
  padding: 40px 20px;

  .icon {
    width: 60px;
    height: 60px;
    background: rgba(37, 211, 102, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    color: #25d366;
  }

  h3 {
    color: white;
    margin-bottom: 8px;
  }

  p {
    color: #64748b;
    font-size: 13px;
    margin-bottom: 20px;
  }

  button {
    background: #25d366;
    color: #000;
    border: none;
    padding: 12px 24px;
    border-radius: 30px;
    font-weight: 600;
    cursor: pointer;
  }
`;

const StatusMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 16px;
  font-size: 13px;
  background: ${(props) =>
    props.$isError ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)"};
  color: ${(props) => (props.$isError ? "#ef4444" : "#22c55e")};
`;

// Helper functions
const getLocalUser = () => {
  try {
    const userData = localStorage.getItem("user_data");
    if (userData) return JSON.parse(userData);
    const userInfo = localStorage.getItem("user_info");
    if (userInfo) return JSON.parse(userInfo);
    return null;
  } catch (e) {
    return null;
  }
};

const isUserAuthenticatedFromStorage = () => {
  const hasUserToken = !!(localStorage.getItem("access_token") || localStorage.getItem("token"));
  const hasLeaderToken = !!localStorage.getItem("leaderToken");
  return hasUserToken || hasLeaderToken;
};

const AddStoryModal = ({ isOpen, onClose, leader, onComplete }) => {
  const { user: authUser, isAuthenticated: authIsAuth, isLeaderAuthenticated, leader: authLeader } = useAuth();
  const [postType, setPostType] = useState("text");
  const [text, setText] = useState("");
  const [media, setMedia] = useState({ file: null, preview: null, type: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [maxTextLength] = useState(5000); // Increased for mobile

  const fileInput = useRef(null);
  const contentRef = useRef(null);

  const user = authUser || authLeader || getLocalUser();
  const isAuthenticated = authIsAuth || isLeaderAuthenticated || isUserAuthenticatedFromStorage();

  const getLeaderId = () => {
    if (!leader) return null;
    if (typeof leader === "string") return leader;
    return leader.leader_id || leader.id;
  };

  const getLeaderName = () => {
    if (!leader) return "Candidate";
    if (typeof leader === "string") return "Candidate";
    return leader.name || "Candidate";
  };

  const leaderId = getLeaderId();
  const leaderName = getLeaderName();

  useEffect(() => {
    if (!isOpen) {
      // Cleanup preview URLs when modal closes
      if (media.preview) {
        URL.revokeObjectURL(media.preview);
      }
      setText("");
      setMedia({ file: null, preview: null, type: null });
      setError(null);
      setSuccess(null);
      setPostType("text");
      setUploadProgress(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setTimeout(() => {
        contentRef.current.scrollTop = contentRef.current.scrollHeight;
      }, 300);
    }
  }, [isOpen, text]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Clean up old preview
    if (media.preview) {
      URL.revokeObjectURL(media.preview);
    }

    // Check file size - 500MB for mobile
    if (file.size > 500 * 1024 * 1024) {
      setError("File too large (Max 500MB)");
      return;
    }

    // Check if it's a valid media type
    if (file.type.startsWith("video/")) {
      // Check video duration for mobile
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        // No duration limit - allow any length
        setMedia({
          file,
          preview: URL.createObjectURL(file),
          type: "video",
        });
        setError(null);
      };
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        setMedia({
          file,
          preview: URL.createObjectURL(file),
          type: "video",
        });
        setError(null);
      };
      video.src = URL.createObjectURL(file);
    } else if (file.type.startsWith("image/")) {
      setMedia({
        file,
        preview: URL.createObjectURL(file),
        type: "image",
      });
      setError(null);
    } else {
      setError("Unsupported file type. Please upload image or video.");
    }
  };

  const handleRemoveMedia = () => {
    if (media.preview) {
      URL.revokeObjectURL(media.preview);
    }
    setMedia({ file: null, preview: null, type: null });
    if (fileInput.current) fileInput.current.value = "";
  };

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimensions for mobile
          const maxWidth = 1200;
          const maxHeight = 1200;

          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.8);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!leaderId) {
      setError("Invalid leader. Please refresh and try again.");
      return;
    }

    if (!text.trim() && !media.file) {
      setError("Please add a message or media");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("leader_id", leaderId);
    formData.append("user_id", user?.user_id || user?.id || user?.leader_id || `anonymous_${Date.now()}`);
    formData.append(
      "user_name",
      user?.real_name || user?.username || user?.name || "Supporter",
    );
    formData.append("message", text.trim() || "");
    formData.append(
      "post_type",
      media.file ? (media.type === "video" ? "video" : "image") : "text",
    );
    formData.append("amount", "0");
    formData.append(
      "phrase",
      text.trim().slice(0, 100) ||
      (media.file
        ? media.type === "video"
          ? "Video support"
          : "Photo support"
        : "Support message"),
    );

    // Compress image before upload for mobile
    let finalMediaFile = media.file;
    if (media.file && media.type === "image") {
      try {
        finalMediaFile = await compressImage(media.file);
      } catch (err) {
        console.warn("Image compression failed, using original:", err);
      }
    }

    if (finalMediaFile) {
      formData.append("media", finalMediaFile);
    }

    const path = "/endorsements/create";

    try {
      const responseData = await api.post(path, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000, // 5 minute timeout for large videos
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      if (responseData?.success) {
        setSuccess("Story posted successfully!");
        if (media.preview) {
          URL.revokeObjectURL(media.preview);
        }
        onComplete?.(responseData.data);

        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(responseData?.message || "Failed to post story");
      }
    } catch (err) {
      console.error("❌ Post error:", err);

      // Better error messages for mobile
      let errorMessage = "Failed to post story. ";
      if (err.code === 'ECONNABORTED') {
        errorMessage += "Upload took too long. Please try with a smaller file or better connection.";
      } else if (err.message === 'Network Error') {
        errorMessage += "Please check your internet connection.";
      } else if (err.response?.status === 413) {
        errorMessage += "File too large for server. Please compress your file.";
      } else {
        errorMessage += err.response?.data?.message || err.message || "Please try again.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (!isOpen) return null;

  const renderHeader = () => (
    <Header>
      <UserProfile>
        <div className="avatar">
          {isAuthenticated && user?.avatar ? (
            <img src={user.avatar} alt="" />
          ) : (
            <User size={22} />
          )}
        </div>
        <div className="meta">
          <div className="name">
            {isAuthenticated ? (user?.real_name || user?.username || "Supporter") : "Anonymous Supporter"}
          </div>
          <div className="target">🗳️ Supporting {leaderName} — make your voice count!</div>
        </div>
      </UserProfile>
      <X
        size={22}
        color="#64748b"
        onClick={onClose}
        style={{ cursor: "pointer" }}
      />
    </Header>
  );

  if (!leaderId) {
    return (
      <Overlay onClick={onClose}>
        <Content onClick={(e) => e.stopPropagation()}>
          <LoginPrompt>
            <div className="icon" style={{ background: "rgba(239,68,68,0.1)" }}>
              <AlertCircle size={28} color="#ef4444" />
            </div>
            <h3>Invalid Leader</h3>
            <p>Unable to identify the leader. Please go back and try again.</p>
            <button onClick={onClose} style={{ background: "#ef4444" }}>
              Close
            </button>
          </LoginPrompt>
        </Content>
      </Overlay>
    );
  }

  return (
    <Overlay onClick={onClose}>
      <Content ref={contentRef} onClick={(e) => e.stopPropagation()}>
        {renderHeader()}

        <TabGroup>
          <Tab
            $active={postType === "text"}
            onClick={() => setPostType("text")}
          >
            <Type size={14} /> Text
          </Tab>
          <Tab
            $active={postType === "image"}
            onClick={() => {
              setPostType("image");
              setTimeout(() => fileInput.current?.click(), 100);
            }}
          >
            <ImageIcon size={14} /> Photo
          </Tab>
          <Tab
            $active={postType === "video"}
            onClick={() => {
              setPostType("video");
              setTimeout(() => fileInput.current?.click(), 100);
            }}
          >
            <Video size={14} /> Video
          </Tab>
        </TabGroup>

        {!isAuthenticated && (
          <div style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '12px', padding: '6px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '20px' }}>
            🔒 Anonymous · No login required · Unlimited posts!
          </div>
        )}

        {error && (
          <StatusMessage $isError>
            <AlertCircle size={14} /> {error}
          </StatusMessage>
        )}

        {success && (
          <StatusMessage $isError={false}>
            <CheckCircle size={14} /> {success}
          </StatusMessage>
        )}

        {loading && uploadProgress > 0 && uploadProgress < 100 && (
          <StatusMessage $isError={false}>
            <Loader2 size={14} className="spin" /> Uploading: {uploadProgress}%
          </StatusMessage>
        )}

        <InputWrapper>
          <TextArea
            placeholder={`Tell Kenya WHY you support ${leaderName}! What will they do for your community? Share your truth — your voice matters 🇰🇪\n\nYou can write as much as you want. No character limits!`}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxTextLength))}
          />

          {media.preview && (
            <PreviewContainer>
              {media.type === "video" ? (
                <video
                  src={media.preview}
                  controls
                  autoPlay={false}
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img src={media.preview} alt="Preview" />
              )}
              <RemoveMediaBtn onClick={handleRemoveMedia}>
                <Trash2 size={14} />
              </RemoveMediaBtn>
            </PreviewContainer>
          )}
        </InputWrapper>

        {(postType === "image" || postType === "video") && !media.preview && (
          <MediaUploadBtn onClick={() => fileInput.current?.click()}>
            {postType === "image" ? (
              <ImageIcon size={16} />
            ) : (
              <Video size={16} />
            )}
            Upload {postType === "image" ? "Photo" : "Video"} (Max 500MB)
          </MediaUploadBtn>
        )}

        <input
          type="file"
          ref={fileInput}
          hidden
          accept={postType === "image" ? "image/*" : "video/*"}
          onChange={handleFileSelect}
          capture={postType === "image" ? "environment" : undefined}
        />

        <SubmitBtn
          disabled={loading || (!text.trim() && !media.file)}
          onClick={handleSubmit}
        >
          {loading ? (
            <Loader2 size={18} className="spin" />
          ) : (
            <Send size={18} />
          )}
          {loading ? (uploadProgress > 0 ? `UPLOADING ${uploadProgress}%` : "POSTING...") : "🚀 PUBLISH YOUR STORY"}
        </SubmitBtn>

        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </Content>
    </Overlay>
  );
};

export default AddStoryModal;