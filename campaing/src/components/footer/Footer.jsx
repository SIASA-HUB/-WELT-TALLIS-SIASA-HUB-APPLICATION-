import React from "react";
import styled from "styled-components";
import { MessageCircle, Shield, CreditCard, Phone, Heart } from "lucide-react";

const FooterBase = styled.footer`
  width: 100%;
  background: #000000;
  padding: 30px 0 20px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
`;

const ContentContainer = styled.div`
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
`;

const LogoImage = styled.img`
  height: 28px;
  width: auto;
  object-fit: contain;
  opacity: 0.8;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 1;
    transform: scale(1.05);
  }
`;

const Tagline = styled.p`
  color: #475569;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 3px;
  margin: 0;
  text-transform: uppercase;
  opacity: 0.6;
`;

const CompactSupport = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 4px 0;

  @media (max-width: 600px) {
    gap: 12px;
    flex-direction: column;
  }
`;

const SupportItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 500;
  
  strong {
    color: #f1f5f9;
    font-weight: 600;
  }

  svg {
    opacity: 0.7;
  }
`;

const WhatsAppBadge = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(37, 211, 102, 0.1);
  color: #25d366;
  padding: 5px 14px;
  border-radius: 100px;
  text-decoration: none;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid rgba(37, 211, 102, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(37, 211, 102, 0.15);
    border-color: rgba(37, 211, 102, 0.4);
    transform: translateY(-1px);
  }
`;

const BottomRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  width: 100%;
`;

const HorizontalGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  color: #475569;
  font-size: 10px;
  font-weight: 500;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const CreditItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  
  strong {
    color: #64748b;
  }
`;

const SloganSection = () => {
  const whatsappGroupLink = "https://chat.whatsapp.com/DPLfiPjZSc7JX55U01wcHz";

  return (
    <FooterBase>
      <ContentContainer>
        <Tagline>THE GREAT KENYAN COMEBACK</Tagline>

        <LogoImage src="/image/siasa.png" alt="Siasa Hub" />

        <CompactSupport>
          <SupportItem>
            <CreditCard size={12} color="#e11d48" />
            <span>Till: <strong>5570316</strong></span>
          </SupportItem>

          <SupportItem>
            <Phone size={12} color="#e11d48" />
            <span>Support: <strong>+254740045355</strong></span>
          </SupportItem>

          <WhatsAppBadge
            href={whatsappGroupLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={13} strokeWidth={2.5} />
            JOIN COMMUNITY
          </WhatsAppBadge>
        </CompactSupport>

        <BottomRow>
          <HorizontalGroup>
            <CreditItem>
              <Shield size={11} />
              <span>SECURED BY <strong>WELT TALLIS</strong></span>
            </CreditItem>

            <CreditItem>
              <Heart size={11} color="#e11d48" fill="#e11d48" opacity={0.5} />
              <span>KENYA</span>
            </CreditItem>

            <span>© {new Date().getFullYear()} SIASA HUB</span>
          </HorizontalGroup>
        </BottomRow>
      </ContentContainer>
    </FooterBase>
  );
};

export default SloganSection;