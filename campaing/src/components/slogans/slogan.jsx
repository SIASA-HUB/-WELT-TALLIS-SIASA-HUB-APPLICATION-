// components/SloganSection.jsx
import React from "react";
import styled from "styled-components";
import { Zap, ShieldCheck, Code } from "lucide-react";

const FooterBase = styled.footer`
  width: 100%;
  background: #000000;
  padding: 32px 0 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const ContentContainer = styled.div`
  width: 90%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
`;

const WeekBadge = styled.div`
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  padding: 4px 12px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 6px;

  .dot {
    width: 4px;
    height: 4px;
    background: #10b981;
    border-radius: 50%;
  }

  span {
    color: #10b981;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 1px;
  }
`;

const MainSlogan = styled.h2`
  color: #ffffff;
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.5px;

  span {
    color: #10b981;
  }

  @media (max-width: 600px) {
    font-size: 1.1rem;
  }
`;

const SubText = styled.p`
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 500;
  margin: 0;
  letter-spacing: 1px;
`;

const BottomInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #475569;
  font-size: 9px;
  font-weight: 500;

  svg {
    opacity: 0.6;
  }

  strong {
    color: #10b981;
    font-weight: 600;
  }
`;

const KenyaFlag = styled.div`
  font-size: 12px;
  margin-top: 8px;
  opacity: 0.4;
`;

const SloganSection = ({ leaderName = "" }) => {
  const currentWeek = "W01 • MARCH 2026";
  const anthem = "The Great Kenyan Comeback";

  return (
    <FooterBase>
      <ContentContainer>
        <WeekBadge>
          <div className="dot" />
          <span>{currentWeek}</span>
        </WeekBadge>

        <MainSlogan>
          {anthem} {leaderName && <span>{leaderName}</span>}
        </MainSlogan>

        <SubText>Arise and Shine</SubText>

        <BottomInfo>
          <InfoItem>
            <Zap size={10} />
            <span>
              POWERED BY <strong>MUMO (CTO)</strong>
            </span>
          </InfoItem>
          <InfoItem>
            <Code size={10} />
            <span>
              DEVELOPED BY <strong>WELT TALLIS</strong>
            </span>
          </InfoItem>
          <InfoItem>
            <ShieldCheck size={10} />
            <span>KENYA</span>
          </InfoItem>
        </BottomInfo>

        <KenyaFlag>🇰🇪</KenyaFlag>
      </ContentContainer>
    </FooterBase>
  );
};

export default SloganSection;
