// components/leaders/leaderHeader.jsx - Enhanced SEO with Engagement Booster
import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import styled, { keyframes } from "styled-components";
import { Helmet } from "react-helmet-async";
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
  Heart,
  MessageCircle,
  Facebook,
  Linkedin,
  Link2,
  Instagram,
  Youtube,
  Globe,
  Eye as EyeIcon,
  Users,
  Search,
  MapPin,
  Smartphone
} from "lucide-react";
import api from "../../api/api";
import { buildImageUrl } from "../../utils/imageUtils";

import EndorsementStories from "../stories/endorsementStories";
import BoostedStoriesRow from "../stories/boostedstoriesrow";
import BoostModal from "../Wallet/boostModal";
import AddStoryModal from "../stories/addStoryModal";

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const scrollTicker = keyframes`
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
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
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
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

// ==================== STYLED COMPONENTS ====================

const PageContainer = styled.div`
  background: #000000;
  min-height: 100vh;
  color: white;
  position: relative;
`;

const HeroSection = styled.div`
  position: relative;
  height: 450px;
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
  transition: none;
`;

const SideActions = styled.div`
  position: fixed;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;
  animation: ${slideInRight} 0.2s ease-out;
  transition: opacity 0.2s ease, transform 0.2s ease;
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
    transition: none;
  }

  .verified-text {
    font-size: 8px;
    font-weight: 500;
    color: ${(props) => (props.$verified ? "#10b981" : "#9ca3af")};
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
    color: white;
  }

  .boost-text {
    font-size: 8px;
    font-weight: 500;
    color: #dc2626;
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
    color: white;
  }

  .share-text {
    font-size: 8px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
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
  width: 100%;
  font-size: 13px;
  font-weight: 500;
  &:hover { background: rgba(255,255,255,0.05); }
`;

const SupportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${(props) => (props.$active ? "linear-gradient(135deg, #22c55e, #16a34a)" : "linear-gradient(135deg, #ef4444, #dc2626)")};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 12px ${(props) => (props.$active ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)")};
  animation: ${(props) => (!props.$active ? pulse : "none")} 2s infinite ease-in-out;

  &:hover {
    transform: scale(1.05) translateY(-2px);
    box-shadow: 0 6px 20px ${(props) => (props.$active ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)")};
  }

  .count {
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
  }
`;

const StickyActionBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(10, 10, 10, 0.9);
  backdrop-filter: blur(25px);
  padding: 16px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  z-index: 10000;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
  transform: translateY(${(props) => (props.$visible ? "0" : "100%")});
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);

  @media (min-width: 768px) { display: none; }
`;

const TickerWrapper = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 8px 16px;
  margin-top: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  width: 100%;
`;

const TickerTrack = styled.div`
  display: flex;
  white-space: nowrap;
  animation: ${scrollTicker} 30s linear infinite;
  gap: 40px;
`;

const TickerItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 600;
  span { color: #dc2626; font-weight: 800; }
  strong { color: #10b981; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10001;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${(props) => props.$bg || "transparent"};
  color: ${(props) => props.$color || "white"};
  border: none;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
`;

const SharePromptModal = styled.div`
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%);
  color: white;
  padding: 40px 32px;
  border-radius: 20px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
  width: 100%;
  max-width: 420px;
  position: relative;
  animation: ${fadeInUp} 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  h3 { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
  p { opacity: 0.8; margin-bottom: 24px; font-size: 15px; }
  .share-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .social-item { display: flex; flex-direction: column; align-items: center; gap: 8px; span { font-size: 11px; color: #94a3b8; } }
`;

const SocialIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  width: 56px;
  height: 56px;
  color: white;
  transition: all 0.3s;
  &:hover { transform: scale(1.1); }
`;

const AddStoryButton = styled.button`
  position: fixed;
  bottom: ${(props) => (props.$visible ? "100px" : "-80px")};
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 10px;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(220, 38, 38, 0.55);
  z-index: 99;
  transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  font-size: 12px;
  font-weight: 800;
  color: white;
  &:hover { transform: scale(1.06) translateY(-2px); }
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
`;

const ProfileInfo = styled.div` flex: 1; `;
const LeaderName = styled.h1` font-size: 20px; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 8px; `;
const LeaderMeta = styled.div` display: flex; gap: 16px; font-size: 12px; color: #9ca3af; margin-top: 4px; `;
const AvatarWrapper = styled.div` position: relative; flex-shrink: 0; `;
const Avatar = styled.img` width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #000; background: #1a1a1a; `;
const VerifiedIcon = styled.div` position: absolute; bottom: 2px; right: 2px; background: ${(props) => (props.$verified ? "#10b981" : "#6b7280")}; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border: 2px solid #000; `;

const ContentArea = styled.div` margin-top: 24px; padding-bottom: 100px; `;
const Divider = styled.div` height: 1px; background: rgba(255,255,255,0.1); margin: 20px 0; `;
const Toast = styled.div` position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(12px); color: white; padding: 12px 24px; border-radius: 40px; z-index: 10001; display: flex; align-items: center; gap: 8px; font-size: 14px; animation: ${fadeIn} 0.3s ease; `;

// ==================== Helper Functions ====================

const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const getLoggedInUserId = () => {
  try {
    const userData = localStorage.getItem("user_data") || localStorage.getItem("user_info");
    if (userData) return JSON.parse(userData).user_id || JSON.parse(userData).id;
    return null;
  } catch (e) { return null; }
};

const normalizePosition = (pos) => {
  if (!pos) return "";
  const l = pos.toLowerCase();
  if (l.includes("governor")) return "Governor";
  if (l.includes("senator")) return "Senator";
  if (l.includes("mp")) return "MP";
  if (l.includes("mca")) return "MCA";
  return pos;
};

// ==================== MAIN COMPONENT ====================

const LeaderHeader = memo(({ leader, onBack }) => {
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(getLoggedInUserId());
  const [scrolledPast, setScrolledPast] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [supportCount, setSupportCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [actionBarVisible, setActionBarVisible] = useState(false);

  const dropdownRef = useRef(null);

  const tickerItems = [
    "Share this profile to boost visibility 🔥",
    "Join the campaign and make an impact 🚀",
    "Post an endorsement story today 📢",
    "Help this candidate reach more voters ✨",
  ];

  useEffect(() => {
    if (!leader?.leader_id) return;
    const fetchData = async () => {
      try {
        const res = await api.get(`/leaders/${leader.leader_id}/stats`);
        if (res.success && res.data) {
          setSupportCount(res.data.support_count || 0);
          setViewsCount(res.data.views_count || 0);
          setIsSupported(res.data.is_supporting || false);
        }
      } catch (err) { console.warn("Stats fetch failed"); }
    };

    fetchData();

    const timer = setTimeout(() => {
      if (!isSupported) setShowSharePrompt(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [leader?.leader_id, isSupported]);

  useEffect(() => {
    const handleScroll = () => {
      setActionBarVisible(window.scrollY > 300);
      setScrolledPast(window.scrollY > 280);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSupport = async () => {
    if (!leader?.leader_id) return;
    const nextStatus = !isSupported;
    setIsSupported(nextStatus);
    setSupportCount(prev => nextStatus ? prev + 1 : prev - 1);
    try {
      await api.post(`/leaders/${leader.leader_id}/support`, { user_id: currentUserId, status: nextStatus });
      if (nextStatus) setShowSharePrompt(true);
    } catch (err) { console.error(err); }
  };

  const handleAddStory = () => setShowAddStoryModal(true);
  const handleBoostSuccess = () => {
    setToastMessage("Campaign boosted successfully! 🔥");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const canonicalUrl = window.location.href;
  const shareText = `Support ${leader?.name} for ${normalizePosition(leader?.position)}! Check their vision on SiasaHub. #SiasaHub #Kenya2027`;

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + canonicalUrl)}`, "_blank");
    setShowShareDropdown(false);
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(canonicalUrl)}`, "_blank");
    setShowShareDropdown(false);
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`, "_blank");
    setShowShareDropdown(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setToastMessage("Link copied to clipboard! 📋");
      setTimeout(() => setToastMessage(null), 2000);
      setShowShareDropdown(false);
    } catch (err) { console.error(err); }
  };

  const leaderImageUrl = buildImageUrl(leader?.image_url || leader?.primary_image);
  const isVerified = leader?.verification === 1 || leader?.verification === "verified";

  return (
    <PageContainer>
      <Helmet>
        <title>{leader?.name} - {normalizePosition(leader?.position)} | SiasaHub</title>
        <meta name="description" content={`Support ${leader?.name} for ${leader?.position}. View manifesto and stories.`} />
      </Helmet>

      <HeroSection>
        <CoverImage $image={leaderImageUrl} />
        <TopNav>
          <IconButton onClick={onBack}><ArrowLeft size={20} /></IconButton>
        </TopNav>
      </HeroSection>

      <SideActions $visible={!scrolledPast} $scrolledPast={scrolledPast}>
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <ShareButton onClick={() => setShowShareDropdown(!showShareDropdown)}>
            <div className="share-icon"><Share2 size={18} /></div>
            <div className="share-text">Share</div>
          </ShareButton>
          {showShareDropdown && (
            <ShareDropdown>
              <ShareIconRow onClick={shareToTwitter}><Twitter size={16} /> X (Twitter)</ShareIconRow>
              <ShareIconRow onClick={shareToWhatsApp}><MessageCircle size={16} /> WhatsApp</ShareIconRow>
              <ShareIconRow onClick={shareToFacebook}><Facebook size={16} /> Facebook</ShareIconRow>
              <ShareIconRow onClick={handleCopyLink}><Link2 size={16} /> Copy Link</ShareIconRow>
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

      <AddStoryButton $visible={!showAddStoryModal} onClick={handleAddStory}>
        <TrendingUp size={16} /> 📢 ENDORSE ME
      </AddStoryButton>

      <StickyActionBar $visible={actionBarVisible}>
        <SupportButton $active={isSupported} onClick={handleSupport} style={{ flex: 1 }}>
          {isSupported ? <CheckCircle size={18} /> : <TrendingUp size={18} />}
          {isSupported ? "JOINED" : "JOIN CAMPAIGN"}
        </SupportButton>
        <ActionButton $bg="rgba(255, 255, 255, 0.1)" onClick={() => setShowSharePrompt(true)} style={{ width: 56, height: 56, borderRadius: 12, justifyContent: 'center' }}>
          <Share2 size={22} />
        </ActionButton>
        <ActionButton $bg="#dc2626" onClick={handleAddStory} style={{ flex: 1, borderRadius: 12, justifyContent: 'center' }}>
          <TrendingUp size={18} /> POST STORY
        </ActionButton>
      </StickyActionBar>

      <ProfileCard>
        <ProfileTopRow>
          <AvatarWrapper>
            <Avatar src={leaderImageUrl} alt={leader?.name} />
            <VerifiedIcon $verified={isVerified}><CheckCircle size={14} color="white" /></VerifiedIcon>
          </AvatarWrapper>
          <ProfileInfo>
            <LeaderName>
              {leader?.name} {isVerified && <CheckCircle size={16} color="#10b981" />}
            </LeaderName>
            <LeaderMeta>
              <span><Smartphone size={14} /> {leader?.position}</span>
              <span><MapPin size={14} /> {leader?.county}</span>
            </LeaderMeta>
            <TickerWrapper>
              <TickerTrack>
                {tickerItems.concat(tickerItems).map((text, idx) => (
                  <TickerItem key={idx}>
                    {text}
                  </TickerItem>
                ))}
              </TickerTrack>
            </TickerWrapper>
          </ProfileInfo>
        </ProfileTopRow>
      </ProfileCard>

      <ContentArea>
        <EndorsementStories leaderId={leader?.leader_id} currentUser={{ name: "You", id: currentUserId }} onBoostSuccess={handleBoostSuccess} />
      </ContentArea>

      {showSharePrompt && (
        <ModalOverlay onClick={() => setShowSharePrompt(false)}>
          <SharePromptModal onClick={(e) => e.stopPropagation()}>
            <IconButton onClick={() => setShowSharePrompt(false)} style={{ position: "absolute", top: 12, right: 12 }}><X size={18} /></IconButton>
            <div style={{ padding: "20px" }}>
              <Heart size={40} color="#ef4444" fill="#ef4444" style={{ marginBottom: 12 }} />
              <h3>Support {leader?.name.split(" ")[0]}!</h3>
              <p>Every share helps win votes. Spread the word to your community!</p>
              <div className="share-grid">
                <div className="social-item"><SocialIconButton onClick={shareToTwitter} style={{ background: BRANDS.twitter }}><Twitter size={20} /></SocialIconButton><span>X</span></div>
                <div className="social-item"><SocialIconButton onClick={shareToWhatsApp} style={{ background: BRANDS.whatsapp }}><MessageCircle size={20} /></SocialIconButton><span>WhatsApp</span></div>
                <div className="social-item"><SocialIconButton onClick={shareToFacebook} style={{ background: BRANDS.facebook }}><Facebook size={20} /></SocialIconButton><span>Facebook</span></div>
              </div>
              <button onClick={handleCopyLink} style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "#ef4444", color: "white", border: "none", fontWeight: "bold", marginTop: 20 }}>📋 COPY LINK</button>
            </div>
          </SharePromptModal>
        </ModalOverlay>
      )}

      <BoostModal isOpen={showBoostModal} onClose={() => setShowBoostModal(false)} onBoost={handleBoostSuccess} targetName={leader?.name} targetId={leader?.leader_id} targetType="leader" userId={currentUserId} />
      <AddStoryModal isOpen={showAddStoryModal} onClose={() => setShowAddStoryModal(false)} leader={leader} onComplete={handleBoostSuccess} />

      {toastMessage && <Toast><Sparkles size={14} /> {toastMessage}</Toast>}
    </PageContainer>
  );
});

LeaderHeader.displayName = "LeaderHeader";
export default LeaderHeader;