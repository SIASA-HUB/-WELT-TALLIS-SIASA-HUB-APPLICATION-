// components/SloganSection.jsx
import React from "react";
import styled from "styled-components";
import { MessageCircle, Shield } from "lucide-react";

const FooterBase = styled.footer`
  width: 100%;
  background: #000000;
  padding: 35px 0 30px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const ContentContainer = styled.div`
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
`;

const LogoImage = styled.img`
  height: 32px;
  width: auto;
  object-fit: contain;
  opacity: 0.9;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
`;

const Tagline = styled.p`
  color: #475569;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 3px;
  margin: 0;
  text-transform: uppercase;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
  margin-top: 8px;
  
  @media (max-width: 700px) {
    gap: 20px;
    flex-direction: column;
  }
`;

const HorizontalGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  
  @media (max-width: 700px) {
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const CreditItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.3px;
  
  strong {
    color: #64748b;
    font-weight: 600;
  }
`;

const WhatsAppLink = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(37, 211, 102, 0.08);
  border: 1px solid rgba(37, 211, 102, 0.15);
  padding: 6px 18px;
  border-radius: 100px;
  text-decoration: none;
  transition: all 0.2s ease;
  
  span {
    color: #25d366;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  
  &:hover {
    background: rgba(37, 211, 102, 0.12);
    transform: translateY(-1px);
    border-color: rgba(37, 211, 102, 0.3);
  }
`;

const Divider = styled.span`
  color: #2a2a2a;
  font-size: 12px;
  
  @media (max-width: 700px) {
    display: none;
  }
`;

const KenyaFlag = styled.span`
  font-size: 14px;
  opacity: 0.5;
  display: flex;
  align-items: center;
`;

const SloganSection = () => {
  const whatsappGroupLink = "https://chat.whatsapp.com/DPLfiPjZSc7JX55U01wcHz";

  return (
    <FooterBase>
      <ContentContainer>
        <Tagline>THE GREAT KENYAN COMEBACK</Tagline>
        
        <LogoImage src="/image/siasa.png" alt="Siasa Hub" />

        <BottomRow>
          <HorizontalGroup>
            <WhatsAppLink 
              href={whatsappGroupLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={13} color="#25d366" strokeWidth={2} />
              <span>JOIN COMMUNITY</span>
            </WhatsAppLink>
            
            <CreditItem>
              <Shield size={11} />
              <span>BUILT BY <strong>WELT TALLIS</strong></span>
            </CreditItem>
            
            <Divider>•</Divider>
            
            <CreditItem>
              <span>📍 <strong>NAIROBI, KE</strong></span>
            </CreditItem>
            
            <KenyaFlag>🇰🇪</KenyaFlag>
          </HorizontalGroup>
        </BottomRow>
      </ContentContainer>
    </FooterBase>
  );
};

export default SloganSection;