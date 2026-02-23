import React from "react";
import styled from "styled-components";
import {
  Sparkles,
  GraduationCap,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  ExternalLink,
  ShieldCheck,
  MapPin,
} from "lucide-react";

const OverviewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 8px 4px;
`;

const InfoCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  h3 {
    margin: 0;
    color: ${(props) => props.$textColor};
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: -0.01em;
  }
`;

const TagCloud = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.span`
  background: #f8fafc;
  color: #475569;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  &::before {
    content: "";
    position: absolute;
    left: 7px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: #e2e8f0;
  }
`;

const TimelineItem = styled.div`
  position: relative;
  padding-left: 32px;
  padding-bottom: 20px;
  &:last-child {
    padding-bottom: 0;
  }

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 6px;
    width: 16px;
    height: 16px;
    background: white;
    border: 3px solid ${(props) => props.$color};
    border-radius: 50%;
    z-index: 1;
  }
`;

const EduContent = styled.div`
  font-size: 0.95rem;
  color: #1e293b;
  font-weight: 500;
  line-height: 1.5;
`;

const SocialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
`;

const SocialButton = styled.a`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  text-decoration: none;
  color: #334155;
  font-size: 0.85rem;
  font-weight: 700;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: ${(props) => props.$brandColor};
    background: #f8fafc;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const LeaderOverview = ({ leader, theme }) => {
  if (!leader) return null;

  const getSocialIcon = (type) => {
    switch (type.toLowerCase()) {
      case "facebook":
        return <Facebook size={18} strokeWidth={2.5} color="#1877F2" />;
      case "instagram":
        return <Instagram size={18} strokeWidth={2.5} color="#E4405F" />;
      case "twitter":
        return <Twitter size={18} strokeWidth={2.5} color="#1DA1F2" />;
      default:
        return <Globe size={18} strokeWidth={2.5} color={theme.primary} />;
    }
  };

  return (
    <OverviewWrapper>
      {/* Biography Section */}
      <InfoCard>
        <SectionHeader>
          <TitleGroup $textColor={theme.text.primary}>
            <Sparkles size={20} color={theme.primary} fill={theme.primary} />
            <h3>Executive Biography</h3>
          </TitleGroup>
          {leader.verification === 1 && (
            <ShieldCheck size={18} color="#059669" />
          )}
        </SectionHeader>
        <p
          style={{
            color: "#475569",
            lineHeight: "1.8",
            fontSize: "1rem",
            margin: 0,
          }}
        >
          {leader.bio ||
            `Currently serving as ${leader.position} in ${leader.location}, ${leader.name} remains a key figure in the ${leader.party} party leadership.`}
        </p>
      </InfoCard>

      {/* Professional Tags */}
      <TagCloud>
        {Array.isArray(leader.parsed_tags) &&
          leader.parsed_tags
            .filter((tag) => typeof tag === "string")
            .map((tag, i) => <Tag key={i}>{tag}</Tag>)}
      </TagCloud>

      {/* Education Section */}
      {leader.education && leader.education.length > 0 && (
        <InfoCard>
          <SectionHeader>
            <TitleGroup $textColor={theme.text.primary}>
              <GraduationCap size={22} color={theme.primary} />
              <h3>Academic Background</h3>
            </TitleGroup>
          </SectionHeader>
          <Timeline>
            {leader.education.map((edu, i) => (
              <TimelineItem key={i} $color={theme.primary}>
                <EduContent>{edu}</EduContent>
              </TimelineItem>
            ))}
          </Timeline>
        </InfoCard>
      )}

      {/* Digital Presence */}
      {leader.portfolio && leader.portfolio.length > 0 && (
        <InfoCard>
          <SectionHeader>
            <TitleGroup $textColor={theme.text.primary}>
              <ExternalLink size={20} color={theme.primary} />
              <h3>Digital Presence</h3>
            </TitleGroup>
          </SectionHeader>
          <SocialGrid>
            {leader.portfolio.map((site, i) => (
              <SocialButton
                key={i}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                $brandColor={theme.primary}
              >
                {getSocialIcon(site.type)}
                {site.type}
              </SocialButton>
            ))}
          </SocialGrid>
        </InfoCard>
      )}
    </OverviewWrapper>
  );
};

export default LeaderOverview;
