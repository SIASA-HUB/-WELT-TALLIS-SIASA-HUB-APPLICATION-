import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom"; // CRITICAL FOR PORTAL
import styled from "styled-components";
import { Send, Reply, X, Heart, ChevronDown, ChevronUp } from "lucide-react";

const TIKTOK_THEME = {
  black: "#000000",
  darkGray: "#121212",
  accent: "#00A86B",
  glass: "rgba(255, 255, 255, 0.08)",
  heart: "#ff2b54",
};

const FullScreenOverlay = styled.div`
  position: fixed;
  /* FORCED POSITIONING */
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  height: 90vh !important;
  width: 100vw !important;
  background: ${TIKTOK_THEME.black};
  /* HIGHEST POSSIBLE Z-INDEX */
  z-index: 2147483647 !important;
  display: flex;
  flex-direction: column;
  color: white;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px 16px;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 100px;
`;

const InputBar = styled.div`
  background: ${TIKTOK_THEME.darkGray};
  padding: 12px 16px;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  border-top: 1px solid ${TIKTOK_THEME.glass};
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
`;

const ManifestoComments = ({ manifestoId, onClose }) => {
  const [comments, setComments] = useState([
    {
      id: 1,
      user_name: "Kenyatta_fan",
      comment: "This policy on education is exactly what we need! 🇰🇪",
      parent_id: null,
      likes: 24,
    },
    {
      id: 2,
      user_name: "Odinga_Support",
      comment: "I agree, but how will we fund it?",
      parent_id: 1,
      likes: 5,
    },
    {
      id: 3,
      user_name: "Tech_Guru",
      comment: "We need more focus on digital infrastructure.",
      parent_id: null,
      likes: 12,
    },
  ]);

  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [likedComments, setLikedComments] = useState({});
  const [expandedThreads, setExpandedThreads] = useState({ 1: true });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handlePost = () => {
    if (!text.trim()) return;
    const newComment = {
      id: Date.now(),
      user_name: "You",
      comment: text,
      parent_id: replyingTo?.id || null,
      likes: 0,
    };
    setComments([newComment, ...comments]);
    setText("");
    setReplyingTo(null);
  };

  const renderComment = (c, isReply = false) => {
    const hasReplies = comments.some((r) => r.parent_id === c.id);
    const isExpanded = expandedThreads[c.id];
    const isLiked = likedComments[c.id];

    return (
      <div
        key={c.id}
        style={{ padding: "12px 0", marginLeft: isReply ? "40px" : "0" }}
      >
        <div style={{ display: "flex", gap: "12px" }}>
          <div
            style={{
              width: isReply ? "28px" : "38px",
              height: isReply ? "28px" : "38px",
              borderRadius: "50%",
              background: TIKTOK_THEME.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            {c.user_name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "12px", color: "#888" }}>
              @{c.user_name.toLowerCase()}
            </div>
            <div style={{ fontSize: "14px", color: "#eee" }}>{c.comment}</div>
            <div style={{ display: "flex", gap: "20px", marginTop: "8px" }}>
              <span
                onClick={() => {
                  setReplyingTo(c);
                  document.getElementById("commentInput").focus();
                }}
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#666",
                  cursor: "pointer",
                }}
              >
                Reply
              </span>
              {!isReply && hasReplies && (
                <span
                  onClick={() =>
                    setExpandedThreads((p) => ({ ...p, [c.id]: !isExpanded }))
                  }
                  style={{
                    fontSize: "12px",
                    color: TIKTOK_THEME.accent,
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {isExpanded
                    ? "Hide"
                    : `View ${comments.filter((r) => r.parent_id === c.id).length} replies`}
                </span>
              )}
            </div>
          </div>
          <div
            style={{ textAlign: "center" }}
            onClick={() =>
              setLikedComments((p) => ({ ...p, [c.id]: !isLiked }))
            }
          >
            <Heart
              size={20}
              fill={isLiked ? TIKTOK_THEME.heart : "none"}
              color={isLiked ? TIKTOK_THEME.heart : "#444"}
            />
            <div style={{ fontSize: "10px", color: "#666" }}>
              {c.likes + (isLiked ? 1 : 0)}
            </div>
          </div>
        </div>
        {isExpanded &&
          comments
            .filter((r) => r.parent_id === c.id)
            .map((r) => renderComment(r, true))}
      </div>
    );
  };

  // CREATE THE PORTAL CONTENT
  const content = (
    <FullScreenOverlay onClick={(e) => e.stopPropagation()}>
      <div
        style={{
          padding: "15px",
          textAlign: "center",
          borderBottom: `1px solid ${TIKTOK_THEME.glass}`,
        }}
      >
        <div
          style={{
            width: "40px",
            height: "4px",
            background: "#333",
            borderRadius: "10px",
            margin: "0 auto 10px",
          }}
        />
        <span style={{ fontWeight: "800", fontSize: "13px" }}>
          {comments.length} REACTIONS
        </span>
      </div>

      <ScrollContent>
        {comments.filter((c) => !c.parent_id).map((c) => renderComment(c))}
      </ScrollContent>

      <InputBar>
        {replyingTo && (
          <div
            style={{
              fontSize: "12px",
              color: TIKTOK_THEME.accent,
              display: "flex",
              justifyContent: "space-between",
              padding: "5px 10px",
              background: "rgba(0,168,107,0.1)",
              borderRadius: "5px",
            }}
          >
            Replying to @{replyingTo.user_name}
            <X size={14} onClick={() => setReplyingTo(null)} />
          </div>
        )}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={onClose}
            style={{
              background: "#222",
              border: "none",
              color: "white",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} />
          </button>
          <input
            id="commentInput"
            placeholder="Add comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              flex: 1,
              background: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: "20px",
              padding: "10px 15px",
              color: "white",
              outline: "none",
            }}
          />
          <button
            onClick={handlePost}
            style={{
              background: text.trim() ? TIKTOK_THEME.accent : "transparent",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              color: text.trim() ? "white" : "#444",
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </InputBar>
    </FullScreenOverlay>
  );

  // RENDER INTO BODY DIRECTLY
  return ReactDOM.createPortal(content, document.body);
};

export default ManifestoComments;
