import React from "react";
import styled from "styled-components";
import { Bell, Share2, CheckCircle } from "lucide-react";

// ============================================
// KENYAN THEME
// ============================================
const KENYA_THEME = {
  primary: "#BB0000",
  text: {
    primary: "#0F172A",
  },
};

// ============================================
// STYLED COMPONENTS FOR ACTION BAR
// ============================================

const BarContainer = styled.div`
  display: flex;
  gap: 12px;
  margin: 20px auto 30px;
  flex-wrap: wrap;
  max-width: 1200px;
  padding: 0 20px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border: none;
  border-radius: 100px;
  background: ${(props) => {
    if (props.$variant === "follow" && props.$active) return "#dc2626";
    if (props.$variant === "follow") return "#f1f5f9";
    return "#f1f5f9";
  }};
  color: ${(props) => {
    if (props.$variant === "follow" && props.$active) return "white";
    return KENYA_THEME.text.primary;
  }};
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid
    ${(props) => {
      if (props.$variant === "follow" && props.$active) return "#dc2626";
      return "#e2e8f0";
    }};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.15);
    background: ${(props) => {
      if (props.$variant === "follow" && props.$active) return "#b91c1c";
      if (props.$variant === "follow") return KENYA_THEME.primary;
      return KENYA_THEME.primary;
    }};
    color: white;
  }
`;

// ============================================
// ACTION BAR COMPONENT
// ============================================

const LeaderActionBar = ({ isFollowing, onFollow, onShare, leaderName }) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: leaderName,
        text: `Check out ${leaderName}'s profile on Kenyan Leaders Platform`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <BarContainer>
      <ActionButton $variant="follow" $active={isFollowing} onClick={onFollow}>
        {isFollowing ? <CheckCircle size={18} /> : <Bell size={18} />}
        {isFollowing ? "Following" : "Follow"}
      </ActionButton>

      <ActionButton $variant="share" onClick={onShare || handleShare}>
        <Share2 size={18} />
        Share Profile
      </ActionButton>
    </BarContainer>
  );
};

export default LeaderActionBar;
