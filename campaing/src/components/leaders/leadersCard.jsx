// components/LeaderCard.jsx - Fixed with correct image URL (no /api/v1 prefix)

import React, { memo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, MapPin, ArrowRight, Zap, User } from "lucide-react";

// API Configuration
import API from "../../api/config";


const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const CardContainer = styled.div`
  position: relative;
  width: 230px;
  height: 350px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: #000;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: ${fadeUp} 0.5s ease-out forwards;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 35px rgba(220, 38, 38, 0.15);
    border-color: rgba(220, 38, 38, 0.5);
  }
`;

const ImageWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.2) 50%,
      rgba(0, 0, 0, 0.9) 90%,
      #000000 100%
    );
  }
`;

const LeaderImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1s ease-out;

  ${CardContainer}:hover & {
    transform: scale(1.1);
  }
`;

const FallbackImage = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: white;

  svg {
    width: 48px;
    height: 48px;
    opacity: 0.5;
    margin-bottom: 8px;
  }

  span {
    font-size: 12px;
    opacity: 0.6;
  }
`;

const TopBar = styled.div`
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  display: flex;
  justify-content: space-between;
  z-index: 10;
`;

const PartyBadge = styled.div`
  background: #dc2626;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 4px;
 
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const InfoSection = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 18px;
  z-index: 5;
`;

const Name = styled.h3`
  font-size: 19px;
  font-weight: 800;
  color: white;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #a1a1aa;
  font-size: 12px;
  margin-bottom: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SmallViewButton = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 4px 0px;
  transition: all 0.3s ease;

  ${CardContainer}:hover & {
    color: #dc2626;
    gap: 10px;
  }
`;

const PositionBadge = styled.div`
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  color: #dc2626;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border: 1px solid rgba(220, 38, 38, 0.3);
`;

const StatsRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
  font-size: 10px;
  color: #a1a1aa;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

// Helper function to build full image URL via Gateway (Port 8009)
const buildImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl === "null" || imageUrl === "") return null;

  // If it's already a full URL
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Gateway handles /uploads prefix
  const baseUrl = API.IMAGES; 
  if (imageUrl.startsWith("/")) {
    return `${baseUrl}${imageUrl}`;
  }

  return `${baseUrl}/${imageUrl}`;
};


const LeaderCard = ({ leader }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const {
    leader_id,
    name = "Candidate",
    party = "IND",
    county = "Kenya",
    ward,
    constituency,
    position,
    position_running_for,
    image_url,
    verification = 0,
    views = 0,
    followers = 0,
    endorsement_count = 0,
  } = leader || {};

  // Get display location
  const getDisplayLocation = () => {
    if (ward && ward !== "null" && ward !== "") return ward;
    if (constituency && constituency !== "null" && constituency !== "")
      return constituency;
    if (county && county !== "null" && county !== "") return county;
    return "Kenya";
  };

  // Get display position
  const getDisplayPosition = () => {
    if (
      position_running_for &&
      position_running_for !== "null" &&
      position_running_for !== ""
    ) {
      return position_running_for;
    }
    if (position && position !== "null" && position !== "") {
      return position;
    }
    return null;
  };

  const imageUrl = buildImageUrl(image_url);
  const displayLocation = getDisplayLocation();
  const displayPosition = getDisplayPosition();

  const handleImageError = () => {
    
    setImageError(true);
  };

  const handleClick = () => {
    // Prefer slug-based SEO URL, fallback to leader_id
    if (leader?.slug) {
      navigate(`/aspirants/${leader.slug}`);
    } else {
      navigate(`/leaders/${leader_id}`);
    }
  };

  return (
    <CardContainer onClick={handleClick}>
      <ImageWrapper>
        {imageUrl && !imageError ? (
          <LeaderImage
            src={imageUrl}
            alt={name}
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <FallbackImage>
            <User size={40} />
            <span>{name?.charAt(0) || "?"}</span>
          </FallbackImage>
        )}
      </ImageWrapper>

      <TopBar>
        <PartyBadge title={party}>
          <Zap size={11} fill="white" color="white" />
          {party?.length > 15 ? `${party.substring(0, 12)}...` : party}
        </PartyBadge>
        {displayPosition && (
          <PositionBadge>
            {displayPosition.length > 10
              ? `${displayPosition.substring(0, 8)}...`
              : displayPosition}
          </PositionBadge>
        )}
      </TopBar>

      <InfoSection>
        <Name title={name}>
          {name?.length > 20 ? `${name.substring(0, 18)}...` : name}
          {verification === 1 && (
            <ShieldCheck
              size={18}
              color="#dc2626"
              fill="rgba(220, 38, 38, 0.1)"
            />
          )}
        </Name>

        <Location title={displayLocation}>
          <MapPin size={13} />{" "}
          {displayLocation?.length > 25
            ? `${displayLocation.substring(0, 22)}...`
            : displayLocation}
        </Location>

        {(views > 0 || followers > 0 || endorsement_count > 0) && (
          <StatsRow>
            {views > 0 && <span>👁️ {views.toLocaleString()}</span>}
            {followers > 0 && <span>❤️ {followers.toLocaleString()}</span>}
            {endorsement_count > 0 && (
              <span>⭐ {endorsement_count.toLocaleString()}</span>
            )}
          </StatsRow>
        )}

        <SmallViewButton>
          Profile <ArrowRight size={14} strokeWidth={3} />
        </SmallViewButton>
      </InfoSection>
    </CardContainer>
  );
};

export default memo(LeaderCard);
