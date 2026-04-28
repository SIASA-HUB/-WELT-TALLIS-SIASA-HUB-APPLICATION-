// LeaderFooter.jsx - Sleek, professional footer matching WTA magazine style
import React from "react";
import styled, { keyframes } from "styled-components";
import {
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Linkedin,
  MessageCircle,
  ShieldCheck,
  ChevronUp,
  Heart,
  MapPin,
  Calendar,
} from "lucide-react";

const KENYA = {
  black: "#050505",
  red: "#BB0000",
  green: "#22c55e",
  white: "#ffffff",
  border: "rgba(255, 255, 255, 0.08)",
  muted: "#888888",
  darkCard: "#0a0a0a",
};

const BRANDS = {
  twitter: { color: "#1DA1F2", icon: Twitter },
  x: { color: "#000000", icon: Twitter },
  facebook: { color: "#1877F2", icon: Facebook },
  instagram: { color: "#E1306C", icon: Instagram },
  youtube: { color: "#FF0000", icon: Youtube },
  linkedin: { color: "#0077B5", icon: Linkedin },
  whatsapp: { color: "#25D366", icon: MessageCircle },
  website: { color: KENYA.green, icon: Globe },
};

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const FooterWrapper = styled.footer`
  background: ${KENYA.black};
  border-top: 1px solid ${KENYA.border};
  color: ${KENYA.white};
  margin-top: 60px;
  padding: 50px 0 30px;
  width: 100%;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${KENYA.red}, ${KENYA.green}, ${KENYA.red});
  }
`;

const Container = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 0 24px;
  animation: ${slideUp} 0.6s ease;
`;

const Divider = styled.div`
  height: 1px;
  background: ${KENYA.border};
  margin: 30px 0;
`;

const SocialSection = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const SocialLabel = styled.div`
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: ${KENYA.muted};
  margin-bottom: 20px;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const SocialCircle = styled.a`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${KENYA.white};
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  background: rgba(255, 255, 255, 0.03);
  text-decoration: none;
  border: 1px solid ${KENYA.border};

  &:hover {
    transform: translateY(-3px) scale(1.05);
    background: ${(props) => props.$hoverBg || KENYA.red};
    border-color: transparent;
    
    svg {
      transform: scale(1.1);
    }
  }

  svg {
    width: 18px;
    height: 18px;
    transition: transform 0.2s ease;
  }
`;

const CandidateInfo = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const CandidateName = styled.h3`
  font-size: 18px;
  font-weight: 800;
  font-family: "Playfair Display", serif;
  letter-spacing: -0.5px;
  margin: 0 0 8px 0;
`;

const CandidatePosition = styled.p`
  font-size: 12px;
  color: ${KENYA.muted};
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  
  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const VerificationBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(34, 197, 94, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  color: ${KENYA.green};
  margin-top: 12px;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 30px 0;
  
  @media (max-width: 500px) {
    gap: 20px;
    flex-wrap: wrap;
  }
`;

const StatItem = styled.div`
  text-align: center;
  
  .stat-value {
    font-size: 20px;
    font-weight: 800;
    font-family: "Playfair Display", serif;
    color: ${KENYA.white};
    line-height: 1;
  }
  
  .stat-label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${KENYA.muted};
    margin-top: 5px;
  }
`;

const BottomNav = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 30px 0 20px;
  flex-wrap: wrap;
`;

const NavLink = styled.a`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${KENYA.muted};
  text-decoration: none;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${KENYA.white};
  }
`;

const Copyright = styled.div`
  text-align: center;
  font-size: 10px;
  color: ${KENYA.muted};
  letter-spacing: 0.5px;
  
  .heart {
    color: ${KENYA.red};
    display: inline-block;
    animation: pulse 1.5s ease infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

const ScrollTop = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${KENYA.white};
  color: ${KENYA.black};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 100;
  
  &:hover {
    transform: translateY(-3px);
    background: ${KENYA.red};
    color: ${KENYA.white};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  @media (max-width: 768px) {
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
  }
`;

const LeaderFooter = ({ leader, stats }) => {
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!leader) return null;

  // Process social links
  let socialLinks = [];
  if (Array.isArray(leader.social_links)) {
    socialLinks = leader.social_links.filter(s => s?.url && s.url.length > 5);
  } else if (leader.social_links && typeof leader.social_links === "object") {
    socialLinks = Object.entries(leader.social_links)
      .filter(([, url]) => url && url.length > 5)
      .map(([type, url]) => ({ type, url }));
  }

  const position = leader.position_running_for || leader.position || "Candidate";
  const county = leader.county || "Kenya";
  const party = leader.party || "Independent";

  // Format stats
  const followersCount = stats?.followers || leader?.followers || 0;
  const endorsementsCount = stats?.endorsements || 0;
  const viewsCount = stats?.views || leader?.views || 0;

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <>
      <FooterWrapper>
        <Container>
          <SocialSection>
            <SocialLabel>CONNECT WITH CAMPAIGN</SocialLabel>
            <SocialLinks>
              {socialLinks.map(({ type, url }) => {
                const typeKey = type?.toLowerCase();
                const brand = BRANDS[typeKey];
                if (!brand) return null;
                const Icon = brand.icon;

                return (
                  <SocialCircle
                    key={type}
                    href={url}
                    $hoverBg={brand.color}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={type}
                  >
                    <Icon />
                  </SocialCircle>
                );
              })}
              {socialLinks.length === 0 && (
                <p style={{ fontSize: "11px", color: KENYA.muted, opacity: 0.6 }}>
                  No social links added yet
                </p>
              )}
            </SocialLinks>
          </SocialSection>

          <Divider />

          <CandidateInfo>
            <CandidateName>{leader.name}</CandidateName>
            <CandidatePosition>
              <span>
                <MapPin size={12} /> {county}
              </span>
              <span>•</span>
              <span>{party}</span>
              <span>•</span>
              <span>{position}</span>
            </CandidatePosition>
            <VerificationBadge>
              <ShieldCheck size={14} />
              <span>VERIFIED CAMPAIGN PROFILE</span>
            </VerificationBadge>
          </CandidateInfo>

          {(followersCount > 0 || endorsementsCount > 0 || viewsCount > 0) && (
            <StatsRow>
              {followersCount > 0 && (
                <StatItem>
                  <div className="stat-value">{formatNumber(followersCount)}</div>
                  <div className="stat-label">Followers</div>
                </StatItem>
              )}
              {endorsementsCount > 0 && (
                <StatItem>
                  <div className="stat-value">{formatNumber(endorsementsCount)}</div>
                  <div className="stat-label">Endorsements</div>
                </StatItem>
              )}
              {endorsementsCount > 0 && (
                <StatItem>
                  <div className="stat-value">{formatNumber(endorsementsCount)}</div>
                  <div className="stat-label">Endorsements</div>
                </StatItem>
              )}
            </StatsRow>
          )}



          <Copyright>
            <span>© {new Date().getFullYear()} SIASA HUB</span>
            <span style={{ margin: "0 8px" }}>•</span>
            <span>Made with <span className="heart">♥</span> for Kenya</span>
          </Copyright>
        </Container>
      </FooterWrapper>

      {showScrollTop && (
        <ScrollTop onClick={scrollToTop}>
          <ChevronUp />
        </ScrollTop>
      )}
    </>
  );
};

export default LeaderFooter;