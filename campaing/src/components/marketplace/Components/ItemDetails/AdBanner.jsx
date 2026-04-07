import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const AdContainer = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 24px;
  margin: 24px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.05) 1%,
      transparent 1%
    );
    background-size: 20px 20px;
    pointer-events: none;
  }
`;

const AdContent = styled.div`
  flex: 1;
  z-index: 1;
`;

const AdTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const AdSubtitle = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
`;

const AdButton = styled(Link)`
  background: #bb0000;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  z-index: 1;

  &:hover {
    background: #990000;
    transform: translateY(-2px);
  }
`;

const AdIcon = styled.div`
  font-size: 48px;
  opacity: 0.3;
  position: absolute;
  right: 20px;
  bottom: 20px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const AdBanner = ({ party, slogan, link, icon }) => {
  return (
    <AdContainer>
      <AdContent>
        <AdTitle>{party}</AdTitle>
        <AdSubtitle>{slogan}</AdSubtitle>
      </AdContent>
      <AdButton to={link}>Learn More →</AdButton>
      <AdIcon>{icon}</AdIcon>
    </AdContainer>
  );
};

export default AdBanner; // Make sure this is here!
