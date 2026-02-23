import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import {
  MapPin,
  Eye,
  ArrowLeft,
  CheckCircle2,
  Share2,
  UserPlus,
  Check,
} from "lucide-react";

const API_BASE =
  "https://bundle-unexpected-sustainability-idol.trycloudflare.com/api/v1";

// ... (Styled Components remain the same as your snippet) ...
const SleekHeader = styled.div`
  --party-color: ${(props) => props.$color || "#BB0000"};
  background: #0a0a0a;
  position: relative;
  padding: 40px 0 60px;
  color: white;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 10%;
    width: 500px;
    height: 500px;
    background: var(--party-color);
    filter: blur(140px);
    opacity: 0.12;
    pointer-events: none;
  }
`;

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 40px;
  position: relative;
  z-index: 1;
  @media (max-width: 600px) {
    padding: 0 20px;
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const NavAction = styled.button`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const FollowButton = styled.button`
  background: white;
  color: black;
  border: none;
  padding: 8px 20px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FlexLayout = styled.div`
  display: flex;
  align-items: center;
  gap: 50px;
  @media (max-width: 850px) {
    flex-direction: column;
    text-align: center;
    gap: 30px;
  }
`;

const ProfileCircle = styled.div`
  position: relative;
  flex-shrink: 0;
  img {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.1);
    padding: 5px;
    background: #0a0a0a;
  }
  &::after {
    content: "";
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    border: 2px solid var(--party-color);
    mask-image: linear-gradient(to bottom, black, transparent);
  }
`;

const NameHeader = styled.h1`
  font-size: 2.4rem;
  font-weight: 200;
  margin: 5px 0;
  line-height: 1.1;
  letter-spacing: -1px;
  span {
    font-weight: 800;
  }
  @media (max-width: 600px) {
    font-size: 1.8rem;
  }
`;

const MetaGrid = styled.div`
  display: flex;
  gap: 25px;
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  @media (max-width: 850px) {
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  strong {
    color: white;
  }
`;

// --- MAIN COMPONENT ---
const LeaderHeader = ({ leader, partyColor, onBack, currentUser }) => {
  const [following, setFollowing] = useState(false);
  const [stats, setStats] = useState({ views: 0, followers: 0, shares: 0 });

  useEffect(() => {
    if (!leader?.leader_id) return;

    // View tracking
    axios
      .post(`${API_BASE}/leaders/view`, {
        leader_id: leader.leader_id,
        user_name: currentUser?.user_name || "Anon-User",
      })
      .catch((e) => console.error("View count failed", e));

    // Stats fetching
    axios
      .get(`${API_BASE}/leaders/${leader.leader_id}/stats`)
      .then((res) => {
        if (res.data.success) {
          setStats(res.data.data);
          const isFollowing = res.data.recent_actions.followers.some(
            (f) => f.user_name === currentUser?.user_name,
          );
          setFollowing(isFollowing);
        }
      })
      .catch((e) => console.error("Stats fetch failed", e));
  }, [leader?.leader_id, currentUser?.user_name]);

  const handleFollow = async () => {
    if (following) return;
    try {
      const res = await axios.post(`${API_BASE}/leaders/follow`, {
        leader_id: leader.leader_id,
        user_id: currentUser?.user_id || "USR-GUEST",
      });
      if (res.status === 200 || res.status === 201) {
        setFollowing(true);
        setStats((prev) => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- IMPROVED SHARE WITH IMAGE ---
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/leader/${leader.leader_id}`;
    const shareTitle = `Check out ${leader.name} on the platform`;

    try {
      // 1. Increment Share Count in Database
      axios.post(`${API_BASE}/leaders/share`, { leader_id: leader.leader_id });
      setStats((prev) => ({ ...prev, shares: (prev.shares || 0) + 1 }));

      if (navigator.share) {
        // 2. Fetch image to share as file
        const response = await fetch(leader.image_url);
        const blob = await response.blob();
        const file = new File([blob], "profile.jpg", { type: blob.type });

        // 3. Trigger Share
        await navigator.share({
          title: shareTitle,
          text: `Check out the profile of ${leader.name}`,
          url: shareUrl,
          files: [file],
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Profile link copied!");
      }
    } catch (err) {
      // Fallback if file sharing is not supported by device
      navigator
        .share({ title: shareTitle, url: shareUrl })
        .catch((e) => console.log(e));
    }
  };

  if (!leader) return null;

  const nameParts = (leader.name || "").split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return (
    <SleekHeader $color={partyColor}>
      <Container>
        <TopBar>
          <NavAction onClick={onBack}>
            <ArrowLeft size={16} /> Back
          </NavAction>
          <div style={{ display: "flex", gap: "12px" }}>
            <NavAction onClick={handleShare}>
              <Share2 size={16} /> Share
            </NavAction>
            {!following ? (
              <FollowButton onClick={handleFollow}>
                <UserPlus size={16} /> Follow
              </FollowButton>
            ) : (
              <NavAction
                as="div"
                style={{
                  cursor: "default",
                  borderColor: "#10b981",
                  color: "#10b981",
                }}
              >
                <Check size={16} /> Following
              </NavAction>
            )}
          </div>
        </TopBar>

        <FlexLayout>
          <ProfileCircle>
            <img src={leader.image_url} alt={leader.name} />
          </ProfileCircle>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                justifyContent:
                  window.innerWidth < 850 ? "center" : "flex-start",
              }}
            >
              <span
                style={{
                  color: partyColor,
                  fontWeight: 900,
                  fontSize: "0.7rem",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                }}
              >
                {leader.party}
              </span>
              {leader.verification === 1 && (
                <CheckCircle2 size={14} color="#10b981" />
              )}
            </div>

            <NameHeader>
              {firstName} <span>{lastName}</span>
            </NameHeader>

            <MetaGrid>
              <MetaItem>
                <MapPin size={14} color={partyColor} />
                <strong>{leader.county}</strong>
              </MetaItem>
              <MetaItem>
                <Eye size={14} />
                <strong>{stats.views.toLocaleString()}</strong> Views
              </MetaItem>
              <MetaItem>
                <UserPlus size={14} />
                <strong>{stats.followers.toLocaleString()}</strong> Followers
              </MetaItem>
              {/* FIXED: Added Share Count back to display */}
              <MetaItem>
                <Share2 size={14} />
                <strong>{(stats.shares || 0).toLocaleString()}</strong> Shares
              </MetaItem>
            </MetaGrid>
          </div>
        </FlexLayout>
      </Container>
    </SleekHeader>
  );
};

export default LeaderHeader;
