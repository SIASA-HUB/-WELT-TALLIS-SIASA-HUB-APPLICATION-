import React, { memo } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, MapPin, ArrowRight, Zap } from "lucide-react";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const CardContainer = styled.div`
  position: relative;
  width: 230px;
  height: 350px;
  border-radius: 12px; /* Slightly more rounded for a modern look */
  overflow: hidden;
  cursor: pointer;
  background: #000;

  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: ${fadeUp} 0.5s ease-out forwards;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 35px rgba(220, 38, 38, 0.15); /* Red tinted shadow */
    border-color: rgba(220, 38, 38, 0.5); /* Red border on hover */
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
  /* Making the red visible and punchy */
  background: #dc2626;
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 10px rgba(220, 38, 38, 0.3);
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
`;

const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #a1a1aa;
  font-size: 12px;
  margin-bottom: 12px;
  font-weight: 500;
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
    color: #dc2626; /* Text turns red on hover */
    gap: 10px;
  }
`;

const LeaderCard = ({ leader }) => {
  const navigate = useNavigate();

  const {
    leader_id,
    name = "Candidate",
    party = "IND",
    county = "Kenya",
    primary_image,
    verification = 0,
  } = leader || {};

  return (
    <CardContainer onClick={() => navigate(`/leaders/${leader_id}`)}>
      <ImageWrapper>
        <LeaderImage
          src={
            primary_image ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=111&color=dc2626&bold=true`
          }
          alt={name}
          loading="lazy"
        />
      </ImageWrapper>

      <TopBar>
        <PartyBadge>
          <Zap size={11} fill="white" color="white" />
          {party}
        </PartyBadge>
      </TopBar>

      <InfoSection>
        <Name>
          {name}
          {verification === 1 && (
            /* Verified badge is now red to match the theme */
            <ShieldCheck
              size={18}
              color="#dc2626"
              fill="rgba(220, 38, 38, 0.1)"
            />
          )}
        </Name>

        <Location>
          <MapPin size={13} /> {county || "National"}
        </Location>

        <SmallViewButton>
          Profile <ArrowRight size={14} strokeWidth={3} />
        </SmallViewButton>
      </InfoSection>
    </CardContainer>
  );
};

export default memo(LeaderCard);
