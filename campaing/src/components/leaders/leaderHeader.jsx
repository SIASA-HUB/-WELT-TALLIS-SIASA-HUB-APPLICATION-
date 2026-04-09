// LeaderHeader.js - Complete with Instagram-style Add Story button
import React, { useState, useEffect, useCallback, useRef } from "react";
import styled, { keyframes } from "styled-components";
import {
  ArrowLeft,
  Share2,
  Sparkles,
  X,
  CheckCircle,
  AlertCircle,
  Target,
  TrendingUp,
  Flag,
  Crown,
  GitBranch,
  User,
  Eye,
  Plus,
} from "lucide-react";
import axios from "axios";

import EndorsementStories from "../Stories/endorsementStories";
import BoostedStoriesRow from "../Stories/boostedstoriesrow";
import BoostModal from "../Wallet/boostModal";
import AddStoryModal from "../Stories/addStoryModal";

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeOutDown = keyframes`
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(30px); }
`;

const ringGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }
  100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
`;

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(50px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
`;

// --- Party Logos Database ---
const PARTY_LOGOS = {
  UDA: "https://uda.ke/wp-content/uploads/2023/04/cropped-uda.png",
  "United Democratic Alliance":
    "https://uda.ke/wp-content/uploads/2023/04/cropped-uda.png",
  ODM: "https://odm.co.ke/images/logo.png",
  "Orange Democratic Movement": "https://odm.co.ke/images/logo.png",
  Wiper: "https://wiper.co.ke/static/assets/img/wiperlogo.png",
  Jubilee:
    "https://global-uploads.webflow.com/61fa0db307d4e6dbea95b2ec/61fa411f7160025aac17c63a_jp-logo.svg",
};

const getPartyLogo = (partyName) => {
  if (!partyName) return null;
  const upperParty = partyName.toUpperCase();
  if (PARTY_LOGOS[upperParty]) return PARTY_LOGOS[upperParty];
  for (const [key, value] of Object.entries(PARTY_LOGOS)) {
    if (
      upperParty.includes(key.toUpperCase()) ||
      key.toUpperCase().includes(upperParty)
    ) {
      return value;
    }
  }
  return null;
};

// ==================== EXTERNAL STYLED COMPONENTS ====================

export const VerifiedBadge = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: default;

  .verified-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${(props) =>
      props.$verified ? "#10b981" : "rgba(107, 114, 128, 0.8)"};
    backdrop-filter: blur(10px);
    transition: all 0.2s;
  }

  .verified-text {
    font-size: 9px;
    font-weight: 500;
    color: ${(props) => (props.$verified ? "#10b981" : "#9ca3af")};
  }

  svg {
    width: 22px;
    height: 22px;
  }
`;

export const BoostButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  background: none;
  border: none;

  .boost-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #dc2626;
    backdrop-filter: blur(10px);
    transition: all 0.2s;
    color: white;
  }

  .boost-text {
    font-size: 9px;
    font-weight: 500;
    color: #dc2626;
  }

  &:hover .boost-icon {
    background: #b91c1c;
    transform: scale(1.05);
  }

  &:hover .boost-text {
    color: #b91c1c;
  }
`;

export const ShareButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  background: none;
  border: none;

  .share-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    transition: all 0.2s;
    color: white;
  }

  .share-text {
    font-size: 9px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
  }

  &:hover .share-icon {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.05);
  }

  &:hover .share-text {
    color: white;
  }
`;

export const ViewCounter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: default;

  .view-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    color: white;
  }

  .view-count {
    font-size: 10px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
  }

  .view-label {
    font-size: 9px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.5);
  }
`;

// ==================== MAIN STYLED COMPONENTS ====================

const PageContainer = styled.div`
  background: #000000;
  min-height: 100vh;
  color: white;
  position: relative;
`;

const HeroSection = styled.div`
  position: relative;
  height: 380px;
  width: 100%;
  overflow: hidden;
  background: #0a0a0a;
`;

const CoverImage = styled.div`
  position: absolute;
  inset: 0;
  background-image: url(${(props) => props.$image});
  background-size: cover;
  background-position: center 20%;
  background-repeat: no-repeat;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.2) 0%,
      rgba(0, 0, 0, 0.1) 30%,
      rgba(0, 0, 0, 0.8) 80%,
      #000000 100%
    );
  }
`;

const TopNav = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent);
`;

const IconButton = styled.button`
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.05);
  }
`;

// Side Actions
const SideActions = styled.div`
  position: fixed;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 100;
  animation: ${slideInRight} 0.3s ease-out;
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transform: ${(props) =>
    props.$visible ? "translateX(0)" : "translateX(20px)"};
  pointer-events: ${(props) => (props.$visible ? "auto" : "none")};
  top: ${(props) => {
    if (props.$scrolledPast) return "20px";
    return "50%";
  }};
  transform: ${(props) => {
    if (props.$scrolledPast) return "translateY(0)";
    return "translateY(-50%)";
  }};
`;

// Instagram-style Add Story Button - Beautiful design
const AddStoryButton = styled.button`
  position: fixed;
  bottom: ${(props) => (props.$visible ? "90px" : "-80px")};
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #25d366, #128c7e);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
  z-index: 99;
  transition: all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  animation: ${(props) => (props.$visible ? fadeInUp : fadeOutDown)} 0.3s
    ease-out;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 25px rgba(37, 211, 102, 0.5);
  }

  &:active {
    transform: scale(0.95);
  }
`;

// Instagram-style Story Ring around button
const AddStoryRing = styled.div`
  position: fixed;
  bottom: ${(props) => (props.$visible ? "82px" : "-88px")};
  right: 12px;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff5c01, #ff8c01, #ffcc00);
  padding: 3px;
  z-index: 98;
  transition: all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
  opacity: ${(props) => (props.$visible ? 0.6 : 0)};
  pointer-events: none;
  animation: ${pulse} 2s infinite;
`;

// Profile Card
const ProfileCard = styled.div`
  position: relative;
  margin-top: -70px;
  padding: 0 20px;
  z-index: 5;
`;

const ProfileTopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const AvatarWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #000000;
  background: #1a1a1a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
`;

const VerifiedIcon = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: ${(props) => (props.$verified ? "#10b981" : "#6b7280")};
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #000000;
`;

const PartyLogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const PartyCircle = styled.div`
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const PartyLogoImg = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 50%;
`;

const PartyName = styled.span`
  font-size: 9px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
`;

// Horizontal Competitors Row
const CompetitorsRow = styled.div`
  margin: 16px 0;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const CompetitorsScroll = styled.div`
  display: flex;
  gap: 16px;
  padding: 8px 0;
`;

const CompetitorStoryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const CompetitorRing = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  padding: 2px;
  background: ${(props) =>
    props.$isTop
      ? "linear-gradient(135deg, #f59e0b, #ea580c)"
      : "rgba(255,255,255,0.2)"};
  animation: ${(props) => (props.$isTop ? ringGlow : "none")} 2.5s infinite
    ease-in-out;
`;

const CompetitorAvatar = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #1a1a1a;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .default-avatar {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #2a2a2a;
    svg {
      width: 28px;
      height: 28px;
      color: rgba(255, 255, 255, 0.3);
    }
  }
`;

const CompetitorName = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  max-width: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
`;

const TopCompetitorBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  background: #f59e0b;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: bold;
  color: white;
`;

// Info Section
const InfoSection = styled.div`
  margin-top: 8px;
`;

const Name = styled.h1`
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const VerifyBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  background: ${(props) =>
    props.$status === "verified"
      ? "rgba(16, 185, 129, 0.15)"
      : "rgba(107, 114, 128, 0.15)"};
  color: ${(props) => (props.$status === "verified" ? "#10b981" : "#9ca3af")};
`;

const PositionText = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
`;

const ContentArea = styled.div`
  margin-top: 24px;
  padding: 0 20px;
  padding-bottom: 100px;
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 16px 0;
`;

// Share Modal
const ShareModal = ({ isOpen, onClose, leader }) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const shareUrl = window.location.href;
  const shareText = `Check out ${leader.name}'s campaign on SiasaHub!`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>Share Profile</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </ModalHeader>
        <ModalBody>
          <ShareOption
            onClick={() =>
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
                "_blank",
              )
            }
          >
            <span style={{ background: "#1da1f2" }}>𝕏</span> Twitter
          </ShareOption>
          <ShareOption
            onClick={() =>
              window.open(
                `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
                "_blank",
              )
            }
          >
            <span style={{ background: "#25d366" }}>📱</span> WhatsApp
          </ShareOption>
          <CopyBtn onClick={handleCopy}>
            {copied ? "✓ Copied!" : "Copy Link"}
          </CopyBtn>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(8px);
  z-index: 20000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: #1a1a2e;
  border-radius: 24px;
  width: 90%;
  max-width: 320px;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h3 {
    margin: 0;
    font-size: 16px;
    color: white;
  }

  button {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ShareOption = styled.button`
  padding: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: white;

  span {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
`;

const CopyBtn = styled.button`
  padding: 12px;
  background: linear-gradient(135deg, #f59e0b, #ea580c);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: white;
  margin-top: 8px;

  &:hover {
    opacity: 0.9;
  }
`;

const Toast = styled.div`
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(12px);
  color: white;
  padding: 12px 24px;
  border-radius: 40px;
  z-index: 10001;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  animation: ${fadeIn} 0.3s ease;
`;

// API URLs
const LEADER_API_URL = "http://localhost:8002";
const ENDORSEMENT_API_URL = "http://localhost:8009";

const getLoggedInUserId = () => {
  const userData = localStorage.getItem("user_data");
  if (userData) {
    try {
      const user = JSON.parse(userData);
      return user.user_id || null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

const LeaderHeader = ({ leader, onBack }) => {
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [boostedStories, setBoostedStories] = useState([]);
  const [viewCount, setViewCount] = useState(0);
  const [sideActionsVisible, setSideActionsVisible] = useState(true);
  const [addButtonVisible, setAddButtonVisible] = useState(true);
  const [scrolledPast, setScrolledPast] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    setCurrentUserId(getLoggedInUserId());
  }, []);

  // Handle scroll to hide/show side actions and add button
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const heroHeight = 380;
      const isScrollingUp = currentScrollY < lastScrollYRef.current;

      // Update scrolled past state
      setScrolledPast(currentScrollY > heroHeight - 100);

      // Show/hide add button based on scroll direction
      if (isScrollingUp) {
        // Scrolling UP - show button
        setAddButtonVisible(true);
      } else if (currentScrollY > 50) {
        // Scrolling DOWN and not at top - hide button
        setAddButtonVisible(false);
      }

      // When at the very top, always show button
      if (currentScrollY <= 10) {
        setAddButtonVisible(true);
      }

      // Hide side actions immediately when scrolling
      setSideActionsVisible(false);

      // Clear previous timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Show side actions after scrolling stops (300ms after last scroll)
      scrollTimeoutRef.current = setTimeout(() => {
        setSideActionsVisible(true);
      }, 300);

      // Update last scroll position
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Fetch REAL views from backend API
  const fetchViews = useCallback(async () => {
    if (!leader?.leader_id) return;
    try {
      const response = await axios.get(
        `${LEADER_API_URL}/api/v1/leaders/${leader.leader_id}/stats`,
      );
      if (response.data?.success && response.data?.data?.views !== undefined) {
        setViewCount(response.data.data.views);
      } else {
        setViewCount(leader?.stats?.views || 0);
      }
    } catch (error) {
      console.error("Error fetching views:", error);
      setViewCount(leader?.stats?.views || 0);
    }
  }, [leader?.leader_id, leader?.stats?.views]);

  useEffect(() => {
    fetchViews();
  }, [fetchViews]);

  // Fetch boosted stories
  const fetchBoostedStories = useCallback(async () => {
    if (!leader?.leader_id) return;
    try {
      const response = await axios.get(
        `${ENDORSEMENT_API_URL}/api/v1/endorsements/leader/${leader.leader_id}/boosted?limit=15`,
      );
      if (response.data?.success && response.data?.data) {
        setBoostedStories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching boosted stories:", error);
    }
  }, [leader?.leader_id]);

  useEffect(() => {
    if (leader?.leader_id) {
      fetchBoostedStories();
    }
  }, [leader?.leader_id, fetchBoostedStories]);

  const normalizePosition = (position) => {
    if (!position) return "";
    const lower = position.toLowerCase();
    if (lower.includes("governor")) return "Governor";
    if (lower.includes("women rep") || lower.includes("woman rep"))
      return "Women Representative";
    if (lower.includes("mp") || lower.includes("member of parliament"))
      return "Member of Parliament";
    if (lower.includes("mca") || lower.includes("member of county assembly"))
      return "Member of County Assembly";
    if (lower.includes("senator")) return "Senator";
    if (lower.includes("president")) return "President";
    return position;
  };

  // Fetch competitors for this leader
  const fetchCompetitors = useCallback(async () => {
    if (!leader?.leader_id) return;

    try {
      const currentPosition = leader.vying_for || leader.position || "";
      const currentConstituency = leader.constituency || "";
      const currentCounty = leader.county || "";
      const normalizedCurrentPosition = normalizePosition(currentPosition);

      const response = await axios.get(`${LEADER_API_URL}/api/v1/leaders`, {
        timeout: 8000,
      });

      if (response.data?.data) {
        const competitorsList = response.data.data
          .filter((aspirant) => {
            const aspirantPosition =
              aspirant.vying_for || aspirant.position || "";
            const aspirantConstituency = aspirant.constituency || "";
            const aspirantCounty = aspirant.county || "";
            const normalizedAspirantPosition =
              normalizePosition(aspirantPosition);
            const notSelf = aspirant.leader_id !== leader.leader_id;

            const samePosition =
              normalizedAspirantPosition === normalizedCurrentPosition;
            if (!samePosition || !notSelf) return false;

            let sameLocation = false;
            if (
              normalizedCurrentPosition === "Governor" ||
              normalizedCurrentPosition === "Women Representative"
            ) {
              sameLocation =
                currentCounty &&
                aspirantCounty &&
                aspirantCounty.toLowerCase() === currentCounty.toLowerCase();
            } else if (
              normalizedCurrentPosition === "Member of Parliament" ||
              normalizedCurrentPosition === "Member of County Assembly"
            ) {
              sameLocation =
                currentConstituency &&
                aspirantConstituency &&
                aspirantConstituency.toLowerCase() ===
                  currentConstituency.toLowerCase();
            } else if (normalizedCurrentPosition === "Senator") {
              sameLocation =
                currentCounty &&
                aspirantCounty &&
                aspirantCounty.toLowerCase() === currentCounty.toLowerCase();
            }
            return sameLocation;
          })
          .slice(0, 10);

        setCompetitors(competitorsList);
      }
    } catch (error) {
      console.error("Error fetching competitors:", error);
      setCompetitors([]);
    }
  }, [
    leader?.leader_id,
    leader?.vying_for,
    leader?.position,
    leader?.constituency,
    leader?.county,
  ]);

  useEffect(() => {
    if (leader?.leader_id) {
      fetchCompetitors();
    }
  }, [leader?.leader_id, fetchCompetitors]);

  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${LEADER_API_URL}${url}`;
  };

  const handleBoostSuccess = () => {
    setToastMessage(`✓ Successfully boosted ${leader.name}'s campaign!`);
    setTimeout(() => setToastMessage(null), 3000);
    fetchBoostedStories();
  };

  const handleCompetitorClick = (competitor) => {
    window.location.href = `/leader/${competitor.leader_id}`;
  };

  const handleAddStory = () => {
    setShowAddStoryModal(true);
  };

  if (!leader) return null;

  const coverImage =
    leader?.primary_image ||
    "https://images.unsplash.com/photo-1570126688035-1e6adbd61053?auto=format&fit=crop&q=80&w=1400";
  const avatarImage =
    leader?.primary_image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&background=f59e0b&color=fff&size=100`;
  const partyName = leader?.party || leader?.political_party || "Independent";
  const partyLogo = getPartyLogo(partyName);
  const isVerified =
    leader?.verification === 1 || leader?.verification === "verified";

  const runningFor = leader?.vying_for || leader?.position || "Candidate";
  const formattedPosition = normalizePosition(runningFor);

  const getLocationText = () => {
    const position = formattedPosition;
    if (
      position === "Governor" ||
      position === "Women Representative" ||
      position === "Senator"
    )
      return leader?.county || "";
    if (
      position === "Member of Parliament" ||
      position === "Member of County Assembly"
    )
      return leader?.constituency || "";
    return "";
  };

  const displayPosition =
    formattedPosition + (getLocationText() ? ` - ${getLocationText()}` : "");

  return (
    <PageContainer>
      <HeroSection>
        <CoverImage $image={coverImage} />
        <TopNav>
          <IconButton onClick={onBack}>
            <ArrowLeft size={20} />
          </IconButton>
        </TopNav>
      </HeroSection>

      {/* Side Actions */}
      <SideActions $visible={sideActionsVisible} $scrolledPast={scrolledPast}>
        <ViewCounter>
          <div className="view-icon">
            <Eye size={22} />
          </div>
          <div className="view-count">{viewCount.toLocaleString()}</div>
          <div className="view-label">Views</div>
        </ViewCounter>
        <ShareButton onClick={() => setShowShareModal(true)}>
          <div className="share-icon">
            <Share2 size={22} />
          </div>
          <div className="share-text">Share</div>
        </ShareButton>
        <BoostButton onClick={() => setShowBoostModal(true)}>
          <div className="boost-icon">
            <TrendingUp size={22} />
          </div>
          <div className="boost-text">Boost</div>
        </BoostButton>
        <VerifiedBadge $verified={isVerified}>
          <div className="verified-icon">
            {isVerified ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
          </div>
          <div className="verified-text">
            {isVerified ? "Verified" : "Pending"}
          </div>
        </VerifiedBadge>
      </SideActions>

      {/* Instagram-style Add Story Button - Beautiful design */}
      <AddStoryRing $visible={addButtonVisible} />
      <AddStoryButton onClick={handleAddStory} $visible={addButtonVisible}>
        <Plus size={24} color="white" />
      </AddStoryButton>

      {/* Profile Section */}
      <ProfileCard>
        <ProfileTopRow>
          <AvatarWrapper>
            <Avatar src={avatarImage} alt={leader.name} />
            <VerifiedIcon $verified={isVerified}>
              {isVerified ? (
                <CheckCircle size={12} fill="#10b981" color="white" />
              ) : (
                <AlertCircle size={10} color="white" />
              )}
            </VerifiedIcon>
          </AvatarWrapper>
          <PartyLogoContainer>
            <PartyCircle>
              {partyLogo ? (
                <PartyLogoImg src={partyLogo} alt={partyName} />
              ) : (
                <Flag size={20} color="#f59e0b" />
              )}
            </PartyCircle>
            <PartyName>{partyName}</PartyName>
          </PartyLogoContainer>
        </ProfileTopRow>

        {/* Horizontal Competitors Row */}
        {competitors.length > 0 && (
          <CompetitorsRow>
            <CompetitorsScroll>
              {competitors.map((competitor, idx) => {
                const competitorImg =
                  competitor.image_url || competitor.primary_image;
                const isTop = idx === 0;
                return (
                  <CompetitorStoryItem
                    key={competitor.leader_id}
                    onClick={() => handleCompetitorClick(competitor)}
                  >
                    <div style={{ position: "relative" }}>
                      <CompetitorRing $isTop={isTop}>
                        <CompetitorAvatar>
                          {competitorImg ? (
                            <img
                              src={getFullImageUrl(competitorImg)}
                              alt={competitor.name}
                            />
                          ) : (
                            <div className="default-avatar">
                              <User size={28} />
                            </div>
                          )}
                        </CompetitorAvatar>
                      </CompetitorRing>
                      {isTop && <TopCompetitorBadge>👑</TopCompetitorBadge>}
                    </div>
                    <CompetitorName>
                      {competitor.name.split(" ")[0]}
                    </CompetitorName>
                  </CompetitorStoryItem>
                );
              })}
            </CompetitorsScroll>
          </CompetitorsRow>
        )}

        <InfoSection>
          <Name>
            {leader.name}
            <VerifyBadge $status={isVerified ? "verified" : "unverified"}>
              {isVerified ? (
                <CheckCircle size={10} />
              ) : (
                <AlertCircle size={10} />
              )}
              {isVerified ? "Verified" : "Unverified"}
            </VerifyBadge>
          </Name>
          <PositionText>{displayPosition}</PositionText>
        </InfoSection>
      </ProfileCard>

      <ContentArea>
        {boostedStories.length > 0 && (
          <>
            <BoostedStoriesRow
              leaderId={leader?.leader_id}
              currentUser={{ name: "You", id: currentUserId || "unknown" }}
              onBoostSuccess={handleBoostSuccess}
              getImageUrl={getFullImageUrl}
            />
            <Divider />
          </>
        )}
        <EndorsementStories
          leaderId={leader.leader_id}
          currentUser={{ name: "You", id: currentUserId || "unknown" }}
          onBoostSuccess={handleBoostSuccess}
        />
      </ContentArea>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        leader={leader}
      />

      <BoostModal
        isOpen={showBoostModal}
        onClose={() => setShowBoostModal(false)}
        onBoost={handleBoostSuccess}
        targetName={leader.name}
        targetId={leader.leader_id}
        targetType="leader"
        userId={currentUserId}
      />

      <AddStoryModal
        isOpen={showAddStoryModal}
        onClose={() => setShowAddStoryModal(false)}
        leader={leader}
        onComplete={() => {
          setToastMessage("✓ Story posted successfully!");
          setTimeout(() => setToastMessage(null), 3000);
          fetchBoostedStories();
        }}
      />

      {toastMessage && (
        <Toast>
          <Sparkles size={14} /> {toastMessage}
        </Toast>
      )}
    </PageContainer>
  );
};

export default LeaderHeader;
