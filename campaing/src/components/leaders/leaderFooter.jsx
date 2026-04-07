// LeaderFooter.js - Clean version with social icons
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
} from "lucide-react";

// Animations
const glow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
`;

// Authentic Brand Colors
const BRANDS = {
  twitter: "#000000",
  facebook: "#1877F2",
  instagram:
    "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
  tiktok: "#000000",
  whatsapp: "#25D366",
  website: "#10b981",
  youtube: "#FF0000",
  linkedin: "#0077B5",
};

const COLORS = {
  primary: "#10b981",
  primaryDark: "#059669",
  dark: "#050505",
  darkCard: "#0d0d0d",
  border: "rgba(255, 255, 255, 0.08)",
  textSecondary: "#94a3b8",
};

const FooterWrapper = styled.footer`
  background: ${COLORS.dark};
  border-top: 1px solid ${COLORS.border};
  color: white;
  margin-top: 40px;
  padding: 40px 0;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
`;

const SocialSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
`;

const SocialCircle = styled.a`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
  background: ${(props) => props.$bg || COLORS.darkCard};
  text-decoration: none;
  border: 1px solid ${COLORS.border};
  cursor: pointer;

  &:hover {
    transform: translateY(-4px) scale(1.05);
    filter: brightness(1.1);
    animation: ${glow} 0.5s ease;
    border-color: ${COLORS.primary};
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid ${COLORS.border};
  font-size: 12px;
  color: ${COLORS.textSecondary};
`;

const LeaderFooter = ({ leader }) => {
  if (!leader) return null;

  // Default social links if not provided (for demo purposes)
  const socials = leader.socials || {};

  return (
    <FooterWrapper>
      <Container>
        <SocialSection>
          <SocialLinks>
            {/* Website */}
            <SocialCircle
              href={socials.website || "#"}
              $bg={BRANDS.website}
              title="Website"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Globe size={24} />
            </SocialCircle>

            {/* X (Twitter) */}
            <SocialCircle
              href={socials.twitter || "#"}
              $bg={BRANDS.twitter}
              title="X (Twitter)"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter size={24} />
            </SocialCircle>

            {/* Facebook */}
            <SocialCircle
              href={socials.facebook || "#"}
              $bg={BRANDS.facebook}
              title="Facebook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook size={24} />
            </SocialCircle>

            {/* Instagram */}
            <SocialCircle
              href={socials.instagram || "#"}
              $bg={BRANDS.instagram}
              title="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={24} />
            </SocialCircle>

            {/* YouTube */}
            <SocialCircle
              href={socials.youtube || "#"}
              $bg={BRANDS.youtube}
              title="YouTube"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Youtube size={24} />
            </SocialCircle>

            {/* LinkedIn */}
            <SocialCircle
              href={socials.linkedin || "#"}
              $bg={BRANDS.linkedin}
              title="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin size={24} />
            </SocialCircle>

            {/* TikTok */}
            <SocialCircle
              href={socials.tiktok || "#"}
              $bg={BRANDS.tiktok}
              title="TikTok"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="24"
                height="24"
              >
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.53 1.13-.2 2.15-.99 2.67-2.01.23-.4.35-.85.38-1.3.11-3.37.03-6.75.04-10.12z" />
              </svg>
            </SocialCircle>

            {/* WhatsApp */}
            <SocialCircle
              href={socials.whatsapp || "#"}
              $bg={BRANDS.whatsapp}
              title="WhatsApp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={24} />
            </SocialCircle>
          </SocialLinks>
        </SocialSection>

        <Copyright>
          © {new Date().getFullYear()} {leader.name}. Follow on social media
        </Copyright>
      </Container>
    </FooterWrapper>
  );
};

export default LeaderFooter;
