// components/SloganSection.jsx
import React from "react";
import styled from "styled-components";
import { MessageCircle, Code, Shield } from "lucide-react";

const FooterBase = styled.footer`
  width: 100%;
  background: #000000;
  padding: 40px 0 30px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
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

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  h2 {
    color: #ffffff;
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.5px;
    text-transform: uppercase;
  }

  p {
    color: #475569;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 2px;
    margin: 0;
    text-transform: uppercase;
  }
`;

const WhatsAppButton = styled.a`
  background: rgba(37, 211, 102, 0.1);
  border: 1px solid rgba(37, 211, 102, 0.2);
  padding: 10px 20px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  transition: all 0.2s ease;

  span {
    color: #25d366;
    font-size: 13px;
    font-weight: 700;
  }

  &:hover {
    background: rgba(37, 211, 102, 0.15);
    transform: translateY(-2px);
    border-color: rgba(37, 211, 102, 0.4);
  }
`;

const BottomCredit = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 10px;
  opacity: 0.5;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const CreditItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 10px;
  font-weight: 600;

  strong {
    color: #ffffff;
  }
`;

const SloganSection = () => {
  const supportNumber = "254700000000"; // Replace with your actual WhatsApp number
  const supportMessage = encodeURIComponent(
    "Hello Siasa Hub Support, I need assistance.",
  );

  return (
    <FooterBase>
      <ContentContainer>
        <BrandText>
          <p>The Great Kenyan Comeback</p>
          <h2>
            Siasa Hub <span>2027</span>
          </h2>
        </BrandText>

        <WhatsAppButton
          href={`https://wa.me/${supportNumber}?text=${supportMessage}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={18} color="#25d366" strokeWidth={2.5} />
          <span>DIRECT SUPPORT</span>
        </WhatsAppButton>

        <BottomCredit>
          <CreditItem>
            <Code size={12} />
            <span>
              ENGINEERED BY <strong>WELT TALLIS</strong>
            </span>
          </CreditItem>

          <CreditItem>
            <Shield size={12} />
            <span>
              SECURED IN <strong>NAIROBI, KENYA</strong>
            </span>
          </CreditItem>
        </BottomCredit>

        <div style={{ fontSize: "12px", marginTop: "10px", opacity: 0.3 }}>
          🇰🇪
        </div>
      </ContentContainer>
    </FooterBase>
  );
};

export default SloganSection;
