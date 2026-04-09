// components/AddStoryModal.jsx - Fixed with correct API URL
import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import axios from "axios";
import { useAuth } from "../Hooks/useAuth";

// Direct API URL - hardcoded for reliability
const ENDORSEMENT_API_URL = "http://localhost:8009";

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
  padding: 24px;
  animation: ${slideUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  padding-bottom: env(safe-area-inset-bottom, 32px);
  max-height: 92vh;
  overflow-y: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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
  font-size: 15px;
  min-height: 80px;
  outline: none;
  resize: none;
  font-family: inherit;

  &::placeholder {
    color: #475569;
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
    max-height: 280px;
    object-fit: contain;
  }
`;

const RemoveMediaBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
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
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  color: #94a3b8;
  font-size: 13px;
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
  padding: 16px;
  border-radius: 16px;
  border: none;
  background: #25d366;
  color: #000;
  font-size: 15px;
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

const isUserAuthenticated = () => {
  const user = getLocalUser();
  const isAuth = localStorage.getItem("isAuthenticated") === "true";
  return !!(user && isAuth);
};

const AddStoryModal = ({ isOpen, onClose, leader, onComplete }) => {
  const { user: authUser, isAuthenticated: authIsAuth } = useAuth();
  const [postType, setPostType] = useState("text");
  const [text, setText] = useState("");
  const [media, setMedia] = useState({ file: null, preview: null, type: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fileInput = useRef(null);

  const user = authUser || getLocalUser();
  const isAuthenticated = authIsAuth || isUserAuthenticated();

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
      setText("");
      setMedia({ file: null, preview: null, type: null });
      setError(null);
      setSuccess(null);
      setPostType("text");
    }
  }, [isOpen]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError("File too large (Max 50MB)");
      return;
    }

    if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        if (video.duration > 60) {
          setError("Video must be 1 minute or less");
          return;
        }
        setMedia({
          file,
          preview: URL.createObjectURL(file),
          type: "video",
        });
        setError(null);
      };
      video.src = URL.createObjectURL(file);
    } else {
      setMedia({
        file,
        preview: URL.createObjectURL(file),
        type: "image",
      });
      setError(null);
    }
  };

  const handleRemoveMedia = () => {
    setMedia({ file: null, preview: null, type: null });
    if (fileInput.current) fileInput.current.value = "";
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setError("Please login first");
      return;
    }

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

    const formData = new FormData();
    formData.append("leader_id", leaderId);
    formData.append("user_id", user?.user_id || user?.id || "anonymous");
    formData.append(
      "user_name",
      user?.real_name || user?.username || "Supporter",
    );
    formData.append("message", text.trim() || "");
    formData.append(
      "post_type",
      media.file ? (media.type === "video" ? "video" : "image") : "text",
    );
    formData.append("amount", "0");
    formData.append(
      "phrase",
      text.trim().slice(0, 50) ||
        (media.file
          ? media.type === "video"
            ? "Video support"
            : "Photo support"
          : "Support message"),
    );

    if (media.file) {
      formData.append("media", media.file);
    }

    // Use hardcoded URL
    const url = `${ENDORSEMENT_API_URL}/api/v1/endorsements/create`;
    console.log("📤 Posting story to:", url);
    console.log("📍 Leader ID:", leaderId);
    console.log("📝 Post type:", media.file ? media.type : "text");

    try {
      const response = await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (response.data?.success) {
        setSuccess("Story posted successfully!");
        onComplete?.(response.data.data);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(response.data?.message || "Failed to post story");
      }
    } catch (err) {
      console.error("❌ Post error:", err);
      setError(err.response?.data?.message || "Failed to post story");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <Overlay onClick={onClose}>
        <Content onClick={(e) => e.stopPropagation()}>
          <LoginPrompt>
            <div className="icon">
              <Lock size={28} />
            </div>
            <h3>Login Required</h3>
            <p>Please login to post your endorsement story</p>
            <button onClick={() => (window.location.href = "/login")}>
              Login Now
            </button>
          </LoginPrompt>
        </Content>
      </Overlay>
    );
  }

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
      <Content onClick={(e) => e.stopPropagation()}>
        <Header>
          <UserProfile>
            <div className="avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt="" />
              ) : (
                <User size={22} />
              )}
            </div>
            <div className="meta">
              <div className="name">
                {user?.real_name || user?.username || "Supporter"}
              </div>
              <div className="target">Supporting {leaderName}</div>
            </div>
          </UserProfile>
          <X
            size={20}
            color="#64748b"
            onClick={onClose}
            style={{ cursor: "pointer" }}
          />
        </Header>

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

        <InputWrapper>
          <TextArea
            placeholder="Share your endorsement message..."
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 500))}
            maxLength={500}
          />
          <CharCounter>{text.length}/500</CharCounter>
          {media.preview && (
            <PreviewContainer>
              {media.type === "video" ? (
                <video
                  src={media.preview}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
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
            Upload {postType === "image" ? "Photo" : "Video"} (Max 50MB)
          </MediaUploadBtn>
        )}

        <input
          type="file"
          ref={fileInput}
          hidden
          accept={postType === "image" ? "image/*" : "video/*"}
          onChange={handleFileSelect}
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
          {loading ? "POSTING..." : "POST STORY"}
        </SubmitBtn>

        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </Content>
    </Overlay>
  );
};

export default AddStoryModal;
