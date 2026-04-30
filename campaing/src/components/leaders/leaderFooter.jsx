// LeaderFooter.jsx - Sleek, professional footer with colored brand icons
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
  MapPin,
  Link2
} from "lucide-react";

const KENYA = {
  black: "#050505",
  red: "#BB0000",
  green: "#22c55e",
  white: "#ffffff",
  border: "rgba(255, 255, 255, 0.08)",
  muted: "#888888",
};

const BRANDS = {
  twitter: { color: "#1DA1F2", icon: Twitter },
  x: { color: "#ffffff", icon: Twitter },
  facebook: { color: "#1877F2", icon: Facebook },
  instagram: { color: "#E1306C", icon: Instagram },
  youtube: { color: "#FF0000", icon: Youtube },
  linkedin: { color: "#0077B5", icon: Linkedin },
  whatsapp: { color: "#25D366", icon: MessageCircle },
  website: { color: "#22c55e", icon: Globe },
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
  padding: 60px 0 30px;
  width: 100%;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${KENYA.red}, ${KENYA.green}, ${KENYA.red});
  }
`;

const Container = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 0 24px;
  animation: ${slideUp} 0.6s ease;
`;

const SocialSection = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const SocialLabel = styled.div`
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: ${KENYA.muted};
  margin-bottom: 25px;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 18px;
  justify-content: center;
  flex-wrap: wrap;
`;

const SocialCircle = styled.a`
  width: 50px;
  height: 50px;
  border-radius: 15px; /* Sleek Squircle Shape */
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  /* Default State: Brand color icons and borders */
  background: rgba(255, 255, 255, 0.02);
  border: 1.5px solid ${(props) => props.$brandColor || KENYA.border};
  color: ${(props) => props.$brandColor || KENYA.white};

  svg {
    width: 22px;
    height: 22px;
    transition: all 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px);
    background: ${(props) => props.$brandColor || KENYA.red};
    border-color: transparent;
    color: white;
    box-shadow: 0 12px 24px ${(props) => (props.$brandColor ? `${props.$brandColor}55` : 'rgba(187, 0, 0, 0.4)')};
    
    svg {
      transform: scale(1.2) rotate(-8deg);
    }
  }
`;

const CandidateInfo = styled.div`
  text-align: center;
  margin-bottom: 35px;
`;

const CandidateName = styled.h3`
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -1px;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  background: linear-gradient(to right, #fff, #888);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CandidatePosition = styled.p`
  font-size: 12px;
  color: ${KENYA.muted};
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  
  svg {
    color: ${KENYA.red};
  }
`;

const VerificationBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 10px;
  font-weight: 900;
  color: ${KENYA.green};
  margin-top: 20px;
  letter-spacing: 1.5px;
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 50px;
  margin: 40px 0;
  border-top: 1px solid ${KENYA.border};
  border-bottom: 1px solid ${KENYA.border};
  padding: 30px 0;
`;

const StatItem = styled.div`
  text-align: center;
  
  .stat-value {
    font-size: 24px;
    font-weight: 900;
    color: ${KENYA.white};
  }
  
  .stat-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: ${KENYA.muted};
    margin-top: 8px;
  }
`;

const Copyright = styled.div`
  text-align: center;
  font-size: 11px;
  color: ${KENYA.muted};
  letter-spacing: 1.5px;
  margin-top: 50px;
  
  .heart {
    color: ${KENYA.red};
    display: inline-block;
    animation: heartBeat 1.5s infinite;
  }

  @keyframes heartBeat {
    0% { transform: scale(1); }
    15% { transform: scale(1.3); }
    30% { transform: scale(1); }
  }
`;

const ScrollTop = styled.button`
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 50px;
  height: 50px;
  border-radius: 15px;
  background: ${KENYA.white};
  color: ${KENYA.black};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
  z-index: 100;
  
  &:hover {
    transform: translateY(-5px);
    background: ${KENYA.red};
    color: ${KENYA.white};
  }
`;

const LeaderFooter = ({ leader, stats }) => {
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!leader) return null;

  let socialLinks = [];
  if (Array.isArray(leader.social_links)) {
    socialLinks = leader.social_links.filter(s => s?.url && s.url.length > 5);
  } else if (leader.social_links && typeof leader.social_links === "object") {
    socialLinks = Object.entries(leader.social_links)
      .filter(([, url]) => url && url.length > 5)
      .map(([type, url]) => ({ type, url }));
  }

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <>
      <FooterWrapper>
        <Container>
          <SocialSection>
            <SocialLabel>Campaign Channels</SocialLabel>
            <SocialLinks>
              {socialLinks.map(({ type, url }) => {
                const typeKey = type?.toLowerCase();
                const brand = BRANDS[typeKey] || { color: "#fff", icon: Link2 };
                const Icon = brand.icon;

                return (
                  <SocialCircle
                    key={type}
                    href={url}
                    $brandColor={brand.color}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon />
                  </SocialCircle>
                );
              })}
            </SocialLinks>
          </SocialSection>

          <CandidateInfo>
            <CandidateName>{leader.name}</CandidateName>
            <CandidatePosition>
              <span><MapPin size={14} /> {leader.county || "Kenya"}</span>
              <span>•</span>
              <span>{leader.party || "Independent"}</span>
              <span>•</span>
              <span>{leader.position || "Candidate"}</span>
            </CandidatePosition>
            <VerificationBadge>
              <ShieldCheck size={16} />
              <span>OFFICIAL VERIFIED PROFILE</span>
            </VerificationBadge>
          </CandidateInfo>

          <StatsRow>
            <StatItem>
              <div className="stat-value">{formatNumber(leader.views || 0)}</div>
              <div className="stat-label">Reach</div>
            </StatItem>
            <StatItem>
              <div className="stat-value">{formatNumber(stats?.endorsements || 0)}</div>
              <div className="stat-label">Backers</div>
            </StatItem>
          </StatsRow>

          <Copyright>
            © {new Date().getFullYear()} SIASA HUB <span style={{ margin: "0 10px" }}>|</span> MADE WITH <span className="heart">♥</span> FOR KENYA
          </Copyright>
        </Container>
      </FooterWrapper>

      {showScrollTop && (
        <ScrollTop onClick={scrollToTop}>
          <ChevronUp size={24} />
        </ScrollTop>
      )}
    </>
  );
};

export default LeaderFooter;