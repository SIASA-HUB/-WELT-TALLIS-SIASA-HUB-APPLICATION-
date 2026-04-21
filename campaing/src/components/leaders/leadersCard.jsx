// components/LeaderCard.jsx - Fixed with correct image URL (no /api/v1 prefix)

import React, { memo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, MapPin, ArrowRight, Zap, User } from "lucide-react";

// API Configuration
import { buildImageUrl } from "../../utils/imageUtils";

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
