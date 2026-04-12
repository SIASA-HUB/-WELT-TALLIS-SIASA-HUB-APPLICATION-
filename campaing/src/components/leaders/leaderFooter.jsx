// LeaderFooter.jsx - professional footer for leader profile
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
  CheckCircle,
} from "lucide-react";

const glow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
`;

const BRANDS = {
  twitter:  { color: "#000000", icon: Twitter },
  x:        { color: "#000000", icon: Twitter },
  facebook: { color: "#1877F2", icon: Facebook },
  instagram: { color: "#E1306C", icon: Instagram },
  youtube:  { color: "#FF0000", icon: Youtube },
  linkedin: { color: "#0077B5", icon: Linkedin },
  whatsapp: { color: "#25D366", icon: MessageCircle },
  website:  { color: "#10b981", icon: Globe },
};

const COLORS = {
  primary: "#ff5c01",
  success: "#10b981",
  dark: "#0a0a0b",
  darkCard: "#141416",
  border: "rgba(255, 255, 255, 0.08)",
  textSecondary: "#94a3b8",
};

const FooterWrapper = styled.footer`
  background: ${COLORS.dark};
  border-top: 1px solid ${COLORS.border};
  color: white;
  margin-top: 40px;
  padding: 60px 0 40px;
  width: 100%;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
`;

const TopGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 40px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 30px;
  }
`;

const Branding = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  h3 {
    font-size: 1.2rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0;
  }
  
  p {
    font-size: 0.85rem;
    color: ${COLORS.textSecondary};
    margin: 0;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const SocialCircle = styled.a`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  background: ${COLORS.darkCard};
  text-decoration: none;
  border: 1px solid ${COLORS.border};

  &:hover {
    transform: translateY(-5px);
    background: ${(props) => props.$hoverBg || COLORS.primary};
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const VerificationBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
  font-size: 0.8rem;
  font-weight: 500;
  color: ${COLORS.success};

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const BottomLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 32px;
  border-top: 1px solid ${COLORS.border};
  font-size: 0.75rem;
  color: ${COLORS.textSecondary};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 20px;
  
  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s;
    &:hover { color: white; }
  }
`;

const LeaderFooter = ({ leader }) => {
  if (!leader) return null;

  // Process social links
  let socialLinks = [];
  if (Array.isArray(leader.social_links)) {
    socialLinks = leader.social_links.filter(s => s.url && s.url.length > 5);
  } else if (leader.social_links && typeof leader.social_links === "object") {
    socialLinks = Object.entries(leader.social_links)
      .filter(([, url]) => url && url.length > 5)
      .map(([type, url]) => ({ type, url }));
  }

  // Define default links if empty, or just show branding
  const hasLinks = socialLinks.length > 0;

  return (
    <FooterWrapper>
      <Container>
        <TopGrid>
          <Branding>
            <h3>{leader.name}</h3>
            <p>{leader.position_running_for || leader.position || "2027 Candidate"}</p>
          </Branding>

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
            {!hasLinks && (
              <p style={{ fontSize: '0.8rem', color: COLORS.textSecondary, opacity: 0.6 }}>
                Social links coming soon
              </p>
            )}
          </SocialLinks>

          <VerificationBadge>
            <ShieldCheck size={16} />
            <span>Official Campaign Profile</span>
          </VerificationBadge>
        </TopGrid>

        <BottomLine>
          <div>
            © {new Date().getFullYear()} Siasa Hub · All Rights Reserved
          </div>
          <NavLinks>
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/contact">Support</a>
          </NavLinks>
        </BottomLine>
      </Container>
    </FooterWrapper>
  );
};

export default LeaderFooter;