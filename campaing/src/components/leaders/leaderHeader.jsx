// LeaderHeader.js - Clean Design with Red Boost Button
import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import {
  ArrowLeft,
  Share2,
  Sparkles,
  X,
  CheckCircle,
  AlertCircle,
  Users,
  Target,
  TrendingUp,
  Flag,
  Crown,
  GitBranch,
  User,
  Eye,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";

import EndorsementStories from "../endorsements/endorsementStories";
import BoostedStoriesRow from "../endorsements/boostedstoriesrow";
import BoostModal from "../userProfile/boostModal";

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ringGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }
  100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
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

// --- Styled Components ---
const PageContainer = styled.div`
  background: #000000;
  min-height: 100vh;
  color: white;
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

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionBtn = styled.button`
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border: none;
  padding: 8px 18px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
`;

const BoostBtn = styled(ActionBtn)`
  background: linear-gradient(135deg, #dc2626, #b91c1c);

  &:hover {
    background: linear-gradient(135deg, #b91c1c, #991b1b);
  }
`;

const ProfileCard = styled.div`
  position: relative;
  margin-top: -70px;
  padding: 0 20px;
  z-index: 5;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const AvatarWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #000000;
  background: #1a1a1a;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
`;

const VerifiedIcon = styled.div`
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: ${(props) => (props.$verified ? "#10b981" : "#6b7280")};
  border-radius: 50%;
  width: 26px;
  height: 26px;
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
  width: 56px;
  height: 56px;
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
  width: 38px;
  height: 38px;
  object-fit: contain;
  border-radius: 50%;
`;

const PartyName = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
`;

const InfoContainer = styled.div`
  flex: 1;
  min-width: 200px;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
`;

const Name = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: white;
`;

const VerifyBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  background: ${(props) =>
    props.$status === "verified"
      ? "rgba(16, 185, 129, 0.15)"
      : "rgba(107, 114, 128, 0.15)"};
  color: ${(props) => (props.$status === "verified" ? "#10b981" : "#9ca3af")};
`;

const RunningPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #f59e0b, #ea580c);
  padding: 6px 16px;
  border-radius: 40px;
  margin: 8px 0;
  box-shadow: 0 2px 10px rgba(245, 158, 11, 0.3);

  span {
    font-size: 13px;
    font-weight: 700;
    color: white;
  }

  svg {
    color: white;
    width: 16px;
    height: 16px;
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${(props) =>
    props.$incumbent ? "rgba(34, 197, 94, 0.15)" : "rgba(245, 158, 11, 0.15)"};
  padding: 4px 12px;
  border-radius: 30px;
  font-size: 11px;
  font-weight: 600;
  color: ${(props) => (props.$incumbent ? "#22c55e" : "#f59e0b")};
  margin: 4px 0;
`;

const ViewsBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 8px;
`;

const ContentArea = styled.div`
  padding: 0 20px 80px;
  margin-top: 16px;
`;

const SectionHeader = styled.div`
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 16px 0;
`;

// Competitors Stories Section - Instagram Style (No padding)
const CompetitorsSection = styled.div`
  margin: 0 0 20px 0;
`;

const CompetitorsScroll = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 0 0 8px 0;

  &::-webkit-scrollbar {
    display: none;
  }
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
  width: 64px;
  height: 64px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  animation: ${ringGlow} 2.5s infinite ease-in-out;
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

const LeaderHeader = ({ leader, onBack }) => {
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [loadingCompetitors, setLoadingCompetitors] = useState(true);
  const [boostedStories, setBoostedStories] = useState([]);

  useEffect(() => {
    setCurrentUserId(getLoggedInUserId());
  }, []);

  const normalizePosition = (position) => {
    if (!position) return "";
    const lower = position.toLowerCase();
    if (lower.includes("governor")) return "governor";
    if (lower.includes("women rep") || lower.includes("woman rep"))
      return "women rep";
    if (lower.includes("mp") || lower.includes("member of parliament"))
      return "mp";
    if (lower.includes("mca") || lower.includes("member of county assembly"))
      return "mca";
    return lower;
  };

  const fetchBoostedStories = useCallback(async () => {
    if (!leader?.leader_id) return;
    try {
      const res = await axios.get(
        `${ENDORSEMENT_API_URL}/api/v1/endorsements/leader/${leader.leader_id}/boosted?limit=20`,
      );
      if (res.data.success) {
        setBoostedStories(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching boosted stories:", error);
    }
  }, [leader?.leader_id]);

  const fetchCompetitors = useCallback(async () => {
    if (!leader?.leader_id) {
      setLoadingCompetitors(false);
      return;
    }

    setLoadingCompetitors(true);
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
              normalizedCurrentPosition === "governor" ||
              normalizedCurrentPosition === "women rep"
            ) {
              sameLocation =
                currentCounty &&
                aspirantCounty &&
                aspirantCounty.toLowerCase() === currentCounty.toLowerCase();
            } else if (
              normalizedCurrentPosition === "mp" ||
              normalizedCurrentPosition === "mca"
            ) {
              sameLocation =
                currentConstituency &&
                aspirantConstituency &&
                aspirantConstituency.toLowerCase() ===
                  currentConstituency.toLowerCase();
            }
            return sameLocation;
          })
          .slice(0, 8);

        setCompetitors(competitorsList);
      }
    } catch (error) {
      console.error("Error fetching competitors:", error);
      setCompetitors([]);
    } finally {
      setLoadingCompetitors(false);
    }
  }, [
    leader?.leader_id,
    leader?.vying_for,
    leader?.position,
    leader?.constituency,
    leader?.county,
  ]);

  useEffect(() => {
    if (currentUserId) {
      fetchBoostedStories();
      fetchCompetitors();
    }
  }, [currentUserId, fetchBoostedStories, fetchCompetitors]);

  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${LEADER_API_URL}${url}`;
  };

  const handleBoostSuccess = () => {
    setToastMessage(`✓ Successfully boosted ${leader.name}'s campaign!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCompetitorClick = (competitor) => {
    window.location.href = `/leader/${competitor.leader_id}`;
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
  const isIncumbent = leader?.is_incumbent === true;
  const viewsCount = leader?.stats?.views || 0;

  const getLocationText = () => {
    const position = normalizePosition(runningFor);
    if (position === "governor" || position === "women rep")
      return leader?.county || "";
    if (position === "mp" || position === "mca")
      return leader?.constituency || "";
    return "";
  };

  return (
    <PageContainer>
      <HeroSection>
        <CoverImage $image={coverImage} />
        <TopNav>
          <IconButton onClick={onBack}>
            <ArrowLeft size={20} />
          </IconButton>
          <ActionButtons>
            <ActionBtn onClick={() => setShowShareModal(true)}>
              <Share2 size={14} /> Share
            </ActionBtn>
            <BoostBtn onClick={() => setShowBoostModal(true)}>
              <TrendingUp size={14} /> Boost
            </BoostBtn>
          </ActionButtons>
        </TopNav>
      </HeroSection>

      <ProfileCard>
        <ProfileHeader>
          <AvatarWrapper>
            <Avatar src={avatarImage} alt={leader.name} />
            <VerifiedIcon $verified={isVerified}>
              {isVerified ? (
                <CheckCircle size={14} fill="#10b981" color="white" />
              ) : (
                <Clock size={12} color="white" />
              )}
            </VerifiedIcon>
          </AvatarWrapper>

          <PartyLogoContainer>
            <PartyCircle>
              {partyLogo ? (
                <PartyLogoImg src={partyLogo} alt={partyName} />
              ) : (
                <Flag size={22} color="#f59e0b" />
              )}
            </PartyCircle>
            <PartyName>{partyName}</PartyName>
          </PartyLogoContainer>

          <InfoContainer>
            <NameRow>
              <Name>{leader.name}</Name>
              <VerifyBadge $status={isVerified ? "verified" : "unverified"}>
                {isVerified ? (
                  <CheckCircle size={10} />
                ) : (
                  <AlertCircle size={10} />
                )}
                {isVerified ? "Verified" : "Unverified"}
              </VerifyBadge>
            </NameRow>

            <RunningPill>
              <Target size={14} />
              <span>Running For: {runningFor}</span>
              {getLocationText() && (
                <span style={{ fontSize: "11px", opacity: 0.8 }}>
                  ({getLocationText()})
                </span>
              )}
            </RunningPill>

            <StatusBadge $incumbent={isIncumbent}>
              {isIncumbent ? <Crown size={12} /> : <GitBranch size={12} />}
              {isIncumbent ? "Incumbent" : "Challenger"}
            </StatusBadge>

            <ViewsBadge>
              <Eye size={12} />
              <span>{viewsCount.toLocaleString()} views</span>
            </ViewsBadge>
          </InfoContainer>
        </ProfileHeader>

        {/* Competitors - Instagram Stories Style - Right after name */}
        {competitors.length > 0 && (
          <CompetitorsSection>
            <CompetitorsScroll>
              {competitors.map((competitor) => {
                const competitorImg =
                  competitor.image_url || competitor.primary_image;
                const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(competitor.name.split(" ")[0])}&background=dc2626&color=fff&size=64`;

                return (
                  <CompetitorStoryItem
                    key={competitor.leader_id}
                    onClick={() => handleCompetitorClick(competitor)}
                  >
                    <CompetitorRing>
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
                    <CompetitorName>
                      {competitor.name.split(" ")[0]}
                    </CompetitorName>
                  </CompetitorStoryItem>
                );
              })}
            </CompetitorsScroll>
          </CompetitorsSection>
        )}
      </ProfileCard>

      <ContentArea>
        {/* Boosted Stories */}
        {boostedStories.length > 0 && (
          <>
            <BoostedStoriesRow
              boostedStories={boostedStories}
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

      {toastMessage && (
        <Toast>
          <Sparkles size={14} /> {toastMessage}
        </Toast>
      )}
    </PageContainer>
  );
};

export default LeaderHeader;
