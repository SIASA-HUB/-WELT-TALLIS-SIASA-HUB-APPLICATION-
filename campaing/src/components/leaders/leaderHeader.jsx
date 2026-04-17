// components/leaders/leaderHeader.jsx - Fixed Image Handling & Competitors
import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import styled, { keyframes } from "styled-components";
import {
  ArrowLeft,
  Share2,
  Sparkles,
  X,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Flag,
  User,
  Plus,
  Twitter,
  MessageCircle,
  Facebook,
  Linkedin,
  Link2,
  Instagram,
  Youtube,
  Globe,
} from "lucide-react";
import api from "../../api/api";
import API from "../../api/config";

import EndorsementStories from "../stories/endorsementStories";
import BoostedStoriesRow from "../stories/boostedstoriesrow";
import BoostModal from "../Wallet/boostModal";
import AddStoryModal from "../stories/addStoryModal";

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

// Brand Colors
const BRANDS = {
  twitter: "#000000",
  facebook: "#1877F2",
  instagram: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
  whatsapp: "#25D366",
  linkedin: "#0077B5",
  copy: "#10b981",
};

// --- Party Logos Database ---
const PARTY_LOGOS = {
  UDA: "https://uda.ke/wp-content/uploads/2023/04/cropped-uda.png",
  "United Democratic Alliance": "https://uda.ke/wp-content/uploads/2023/04/cropped-uda.png",
  ODM: "https://odm.co.ke/images/logo.png",
  "Orange Democratic Movement": "https://odm.co.ke/images/logo.png",
  Wiper: "https://wiper.co.ke/static/assets/img/wiperlogo.png",
  Jubilee: "https://global-uploads.webflow.com/61fa0db307d4e6dbea95b2ec/61fa411f7160025aac17c63a_jp-logo.svg",
};

const getPartyLogo = (partyName) => {
  if (!partyName) return null;
  const upperParty = partyName.toUpperCase();
  if (PARTY_LOGOS[upperParty]) return PARTY_LOGOS[upperParty];
  for (const [key, value] of Object.entries(PARTY_LOGOS)) {
    if (upperParty.includes(key.toUpperCase()) || key.toUpperCase().includes(upperParty)) {
      return value;
    }
  }
  return null;
};

// ==================== STYLED COMPONENTS ====================

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
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 30%, rgba(0, 0, 0, 0.8) 80%, #000000 100%);
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

// FIXED: Back button with white background and black icon
const IconButton = styled.button`
  background: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #000;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &:hover {
    background: #f0f0f0;
    transform: scale(1.02);
  }

  svg {
    stroke-width: 2.5;
  }
`;

const SideActions = styled.div`
  position: fixed;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;
  animation: ${slideInRight} 0.3s ease-out;
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transform: ${(props) => (props.$visible ? "translateX(0)" : "translateX(20px)")};
  pointer-events: ${(props) => (props.$visible ? "auto" : "none")};
  top: ${(props) => (props.$scrolledPast ? "80px" : "50%")};
  transform: ${(props) => (props.$scrolledPast ? "translateY(0)" : "translateY(-50%)")};
`;

const VerifiedBadge = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: default;

  .verified-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${(props) => (props.$verified ? "#10b981" : "rgba(107, 114, 128, 0.8)")};
    backdrop-filter: blur(10px);
    transition: all 0.2s;
  }

  .verified-text {
    font-size: 8px;
    font-weight: 500;
    color: ${(props) => (props.$verified ? "#10b981" : "#9ca3af")};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const BoostButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  background: none;
  border: none;

  .boost-icon {
    width: 40px;
    height: 40px;
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
    font-size: 8px;
    font-weight: 500;
    color: #dc2626;
  }

  &:hover .boost-icon {
    background: #b91c1c;
    transform: scale(1.05);
  }
`;

const ShareButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  background: none;
  border: none;
  position: relative;

  .share-icon {
    width: 40px;
    height: 40px;
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
    font-size: 8px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
  }

  &:hover .share-icon {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.05);
  }
`;

const ShareDropdown = styled.div`
  position: absolute;
  bottom: 60px;
  right: 0;
  background: #1a1a1a;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 200;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  min-width: 120px;
`;

const ShareIconRow = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  font-size: 13px;
  font-weight: 500;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: ${(props) => props.$bg || "rgba(255,255,255,0.1)"};
    transform: translateX(2px);
  }
`;

const AddStoryButton = styled.button`
  position: fixed;
  bottom: ${(props) => (props.$visible ? "100px" : "-60px")};
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
  z-index: 99;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  animation: ${(props) => (props.$visible ? fadeInUp : fadeOutDown)} 0.3s ease-out;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(220, 38, 38, 0.5);
  }
`;

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
  width: 56px;
  height: 56px;
  border-radius: 50%;
  padding: 2px;
  background: ${(props) => (props.$isTop ? "linear-gradient(135deg, #f59e0b, #ea580c)" : "rgba(255,255,255,0.2)")};
  animation: ${(props) => (props.$isTop ? ringGlow : "none")} 2.5s infinite ease-in-out;
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
      width: 24px;
      height: 24px;
      color: rgba(255, 255, 255, 0.3);
    }
  }
`;

const CompetitorName = styled.div`
  font-size: 9px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  max-width: 60px;
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
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7px;
  font-weight: bold;
  color: white;
`;

const InfoSection = styled.div`
  margin-top: 8px;
`;

const Name = styled.h1`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 2px 0;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  letter-spacing: -0.2px;
`;

const VerifyBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  background: ${(props) => (props.$status === "verified" ? "rgba(16, 185, 129, 0.15)" : "rgba(107, 114, 128, 0.15)")};
  color: ${(props) => (props.$status === "verified" ? "#10b981" : "#9ca3af")};
`;

const PositionText = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

// ==================== Helper Functions ====================

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

// Improved image URL builder
const buildImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  let baseUrl = API?.IMAGES || API?.BASE || process.env.REACT_APP_API_URL || "http://localhost:5000";
  if (baseUrl.includes("/api/v1")) baseUrl = baseUrl.replace(/\/api\/v1\/?$/, "");
  baseUrl = baseUrl.replace(/\/$/, "");
  let imagePath = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${imagePath}`;
};

const getLeaderImage = (leader) => {
  if (!leader) return null;
  const imageUrl = leader.image_url || leader.primary_image || leader.profile_image || leader.avatar || leader.image;
  return buildImageUrl(imageUrl);
};

// Track profile view
const trackProfileView = async (leaderId, userId) => {
  if (!leaderId) return;
  try {
    await api.post(`/leaders/${leaderId}/view`, { user_id: userId, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Error tracking profile view:", error);
  }
};

const trackShare = async (leaderId, userId, platform) => {
  if (!leaderId) return;
  try {
    await api.post(`/leaders/${leaderId}/share`, { user_id: userId, platform, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Error tracking share:", error);
  }
};

// Normalize position strings for matching
const normalizePosition = (position) => {
  if (!position) return "";
  const lower = position.toLowerCase();
  if (lower.includes("governor")) return "Governor";
  if (lower.includes("women rep") || lower.includes("woman rep")) return "Women Representative";
  if (lower.includes("mp") || lower.includes("member of parliament")) return "Member of Parliament";
  if (lower.includes("mca") || lower.includes("member of county assembly")) return "Member of County Assembly";
  if (lower.includes("senator")) return "Senator";
  if (lower.includes("president")) return "President";
  if (lower.includes("deputy president")) return "Deputy President";
  return position.charAt(0).toUpperCase() + position.slice(1);
};

// Memoized LeaderHeader component
const LeaderHeader = memo(({ leader, onBack }) => {
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [boostedStories, setBoostedStories] = useState([]);
  const [sideActionsVisible, setSideActionsVisible] = useState(true);
  const [addButtonVisible, setAddButtonVisible] = useState(true);
  const [scrolledPast, setScrolledPast] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const dropdownRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    setCurrentUserId(getLoggedInUserId());
  }, []);

  // Track time spent on profile
  useEffect(() => {
    if (!leader?.leader_id) return;
    startTimeRef.current = Date.now();
    return () => {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent >= 3) {
        api.post(`/leaders/${leader.leader_id}/time-spent`, {
          user_id: currentUserId,
          time_spent: timeSpent,
          timestamp: new Date().toISOString()
        }).catch(err => console.error("Error tracking time:", err));
      }
    };
  }, [leader?.leader_id, currentUserId]);

  // Track profile view (once)
  useEffect(() => {
    if (leader?.leader_id && !viewTracked) {
      trackProfileView(leader.leader_id, currentUserId);
      setViewTracked(true);
    }
  }, [leader?.leader_id, currentUserId, viewTracked]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowShareDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll handling for side actions visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const heroHeight = 380;
      const isScrollingUp = currentScrollY < lastScrollYRef.current;

      setScrolledPast(currentScrollY > heroHeight - 100);

      if (isScrollingUp) {
        setAddButtonVisible(true);
      } else if (currentScrollY > 50) {
        setAddButtonVisible(false);
      }
      if (currentScrollY <= 10) setAddButtonVisible(true);

      setSideActionsVisible(false);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => setSideActionsVisible(true), 300);

      lastScrollYRef.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const fetchBoostedStories = useCallback(async () => {
    if (!leader?.leader_id) return;
    try {
      const response = await api.get(`/endorsements/leader/${leader.leader_id}/boosted?limit=15`);
      if (response.data?.success && response.data?.data) setBoostedStories(response.data.data);
    } catch (error) {
      console.error("Error fetching boosted stories:", error);
    }
  }, [leader?.leader_id]);

  useEffect(() => {
    if (leader?.leader_id) fetchBoostedStories();
  }, [leader?.leader_id, fetchBoostedStories]);

  // FIXED: Competitors fetching – correctly extract leaders from groups response
  const fetchCompetitors = useCallback(async () => {
    if (!leader?.leader_id) return;

    try {
      const currentPositionRaw = leader.vying_for || leader.position || "";
      const normalizedCurrentPosition = normalizePosition(currentPositionRaw);
      const currentCounty = leader.county || "";
      const currentConstituency = leader.constituency || "";

      // Fetch all leaders (paginated groups)
      const response = await api.get("/leaders", { params: { limit: 500 } });

      if (!response?.success || !response?.data) return;

      let allLeaders = [];
      // Response.data is an array of groups
      if (Array.isArray(response.data)) {
        response.data.forEach(group => {
          if (group.leaders && Array.isArray(group.leaders)) {
            allLeaders.push(...group.leaders);
          }
        });
      } else if (response.data.leaders) {
        allLeaders = response.data.leaders;
      }

      // Filter competitors
      const competitorsList = allLeaders
        .filter(aspirant => {
          const aspirantPosition = normalizePosition(aspirant.position_running_for || aspirant.position || "");
          const notSelf = aspirant.leader_id !== leader.leader_id;
          const samePosition = aspirantPosition === normalizedCurrentPosition;
          if (!samePosition || !notSelf) return false;

          let sameLocation = false;
          const pos = normalizedCurrentPosition;
          if (pos === "Governor" || pos === "Senator" || pos === "Women Representative") {
            sameLocation = currentCounty && aspirant.county && aspirant.county.toLowerCase() === currentCounty.toLowerCase();
          } else if (pos === "Member of Parliament") {
            sameLocation = currentConstituency && aspirant.constituency && aspirant.constituency.toLowerCase() === currentConstituency.toLowerCase();
          } else if (pos === "Member of County Assembly") {
            sameLocation = currentConstituency && aspirant.constituency && aspirant.constituency.toLowerCase() === currentConstituency.toLowerCase();
          } else if (pos === "President" || pos === "Deputy President") {
            sameLocation = true;
          }
          return sameLocation;
        })
        .slice(0, 10);

      setCompetitors(competitorsList);
    } catch (error) {
      console.error("Error fetching competitors:", error);
      setCompetitors([]);
    }
  }, [leader]);

  useEffect(() => {
    if (leader?.leader_id) fetchCompetitors();
  }, [leader?.leader_id, fetchCompetitors]);

  const handleBoostSuccess = () => {
    setToastMessage(`Successfully boosted ${leader.name}'s campaign!`);
    setTimeout(() => setToastMessage(null), 3000);
    fetchBoostedStories();
  };

  const handleCompetitorClick = (competitor) => {
    const target = competitor.slug ? `/leader/${competitor.slug}` : `/leaders/${competitor.leader_id}`;
    window.location.href = target;
  };

  const handleAddStory = () => setShowAddStoryModal(true);

  const canonicalUrl = leader?.slug
    ? `${window.location.origin}/leader/${leader.slug}`
    : (typeof window !== "undefined" ? window.location.href : "");

  const shareText = `Check out ${leader?.name || "this leader"}'s 2027 campaign on SiasaHub! ${leader?.position || ""} ${leader?.county ? `- ${leader.county} County` : ""}`;

  const shareToTwitter = async () => {
    await trackShare(leader?.leader_id, currentUserId, "twitter");
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(canonicalUrl)}`, "_blank");
    setShowShareDropdown(false);
  };

  const shareToWhatsApp = async () => {
    await trackShare(leader?.leader_id, currentUserId, "whatsapp");
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + "\n" + canonicalUrl)}`, "_blank");
    setShowShareDropdown(false);
  };

  const shareToFacebook = async () => {
    await trackShare(leader?.leader_id, currentUserId, "facebook");
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`, "_blank");
    setShowShareDropdown(false);
  };

  const shareToLinkedIn = async () => {
    await trackShare(leader?.leader_id, currentUserId, "linkedin");
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}&title=${encodeURIComponent(shareText)}`, "_blank");
    setShowShareDropdown(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      await trackShare(leader?.leader_id, currentUserId, "copy_link");
      setCopied(true);
      setToastMessage("Link copied to clipboard!");
      setTimeout(() => { setCopied(false); setToastMessage(null); }, 2000);
      setShowShareDropdown(false);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!leader) return null;

  const leaderImageUrl = getLeaderImage(leader);
  const coverImage = leaderImageUrl || "https://images.unsplash.com/photo-1570126688035-1e6adbd61053?auto=format&fit=crop&q=80&w=1400";
  const partyName = leader?.party || leader?.political_party || "Independent";
  const partyLogo = getPartyLogo(partyName);
  const isVerified = leader?.verification === 1 || leader?.verification === "verified";
  const runningFor = leader?.vying_for || leader?.position || "Candidate";
  const formattedPosition = normalizePosition(runningFor);
  const getLocationText = () => {
    const pos = formattedPosition;
    if (pos === "Governor" || pos === "Women Representative" || pos === "Senator") return leader?.county || "";
    if (pos === "Member of Parliament" || pos === "Member of County Assembly") return leader?.constituency || "";
    return "";
  };
  const displayPosition = formattedPosition + (getLocationText() ? ` - ${getLocationText()}` : "");
  const getFallbackAvatar = () => `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&background=dc2626&color=fff&size=100&bold=true`;

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

      <SideActions $visible={sideActionsVisible} $scrolledPast={scrolledPast}>
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <ShareButton onClick={() => setShowShareDropdown(!showShareDropdown)}>
            <div className="share-icon"><Share2 size={18} /></div>
            <div className="share-text">Share</div>
          </ShareButton>
          {showShareDropdown && (
            <ShareDropdown>
              <ShareIconRow onClick={shareToTwitter} $bg="#000000"><Twitter size={18} /> Twitter</ShareIconRow>
              <ShareIconRow onClick={shareToWhatsApp} $bg="#25D366"><MessageCircle size={18} /> WhatsApp</ShareIconRow>
              <ShareIconRow onClick={shareToFacebook} $bg="#1877F2"><Facebook size={18} /> Facebook</ShareIconRow>
              <ShareIconRow onClick={shareToLinkedIn} $bg="#0077B5"><Linkedin size={18} /> LinkedIn</ShareIconRow>
              <ShareIconRow onClick={handleCopyLink} $bg="#10b981"><Link2 size={18} /> {copied ? "Copied!" : "Copy Link"}</ShareIconRow>
            </ShareDropdown>
          )}
        </div>
        <BoostButton onClick={() => setShowBoostModal(true)}>
          <div className="boost-icon"><TrendingUp size={18} /></div>
          <div className="boost-text">Boost</div>
        </BoostButton>
        <VerifiedBadge $verified={isVerified}>
          <div className="verified-icon">{isVerified ? <CheckCircle size={18} /> : <AlertCircle size={18} />}</div>
          <div className="verified-text">{isVerified ? "Verified" : "Pending"}</div>
        </VerifiedBadge>
      </SideActions>

      <AddStoryButton onClick={handleAddStory} $visible={addButtonVisible}>
        <Plus size={22} color="white" />
      </AddStoryButton>

      <ProfileCard>
        <ProfileTopRow>
          <AvatarWrapper>
            <Avatar src={(!imageError && leaderImageUrl) ? leaderImageUrl : getFallbackAvatar()} alt={leader.name} onError={() => setImageError(true)} />
            <VerifiedIcon $verified={isVerified}>
              {isVerified ? <CheckCircle size={12} fill="#10b981" color="white" /> : <AlertCircle size={10} color="white" />}
            </VerifiedIcon>
          </AvatarWrapper>
          <PartyLogoContainer>
            <PartyCircle>{partyLogo ? <PartyLogoImg src={partyLogo} alt={partyName} /> : <Flag size={20} color="#f59e0b" />}</PartyCircle>
            <PartyName>{partyName}</PartyName>
          </PartyLogoContainer>
        </ProfileTopRow>

        {competitors.length > 0 && (
          <CompetitorsRow>
            <CompetitorsScroll>
              {competitors.map((competitor, idx) => {
                const competitorImg = getLeaderImage(competitor);
                const isTop = idx === 0;
                return (
                  <CompetitorStoryItem key={competitor.leader_id} onClick={() => handleCompetitorClick(competitor)}>
                    <div style={{ position: "relative" }}>
                      <CompetitorRing $isTop={isTop}>
                        <CompetitorAvatar>
                          {competitorImg ? (
                            <img src={competitorImg} alt={competitor.name} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(competitor.name)}&background=2a2a2a&color=fff&size=56`; }} />
                          ) : (
                            <div className="default-avatar"><User size={24} /></div>
                          )}
                        </CompetitorAvatar>
                      </CompetitorRing>
                      {isTop && <TopCompetitorBadge>👑</TopCompetitorBadge>}
                    </div>
                    <CompetitorName>{competitor.name.split(" ")[0]}</CompetitorName>
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
              {isVerified ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
              {isVerified ? "Verified" : "Unverified"}
            </VerifyBadge>
          </Name>
          <PositionText>{displayPosition}</PositionText>
        </InfoSection>
      </ProfileCard>

      <ContentArea>
        {boostedStories && boostedStories.length > 0 && (
          <>
            <BoostedStoriesRow leaderId={leader?.leader_id} currentUser={{ name: "You", id: currentUserId || "unknown" }} onBoostSuccess={handleBoostSuccess} />
            <Divider />
          </>
        )}
        <EndorsementStories leaderId={leader.leader_id} currentUser={{ name: "You", id: currentUserId || "unknown" }} onBoostSuccess={handleBoostSuccess} />
      </ContentArea>

      <BoostModal isOpen={showBoostModal} onClose={() => setShowBoostModal(false)} onBoost={handleBoostSuccess} targetName={leader.name} targetId={leader.leader_id} targetType="leader" userId={currentUserId} />
      <AddStoryModal isOpen={showAddStoryModal} onClose={() => setShowAddStoryModal(false)} leader={leader} onComplete={() => {
        setToastMessage("Story posted successfully!");
        setTimeout(() => setToastMessage(null), 3000);
        fetchBoostedStories();
      }} />

      {toastMessage && (
        <Toast>
          <Sparkles size={14} /> {toastMessage}
        </Toast>
      )}
    </PageContainer>
  );
});

LeaderHeader.displayName = 'LeaderHeader';
export default LeaderHeader;