import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Heart, Coffee, Users, Shield, Copy, X, MapPin, Phone, Mail, Globe, Code, ExternalLink } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const FooterContainer = styled.footer`
  background: white;
  color: #1e293b;
  padding: 60px 20px 30px;
  margin-top: 60px;
  border-top: 1px solid #f1f5f9;
`;

const FooterGrid = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 40px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const SectionTitle = styled.h4`
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
`;

const FooterLink = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  &:hover {
    color: #BB0000;
    transform: translateX(4px);
  }

  @media (max-width: 500px) {
    justify-content: center;
    &:hover { transform: translateY(-2px); }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  z-index: 2000;
  backdrop-filter: blur(5px);
  display: flex;
  align-items: flex-end;
  animation: ${fadeIn} 0.3s ease;
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 24px 24px 0 0;
  padding: 30px;
  position: relative;
  animation: ${slideUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 90vh;
  overflow-y: auto;
`;

const TeamCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
`;

const Footer = () => {
  const [modalType, setModalType] = useState(null); // 'donate' or 'team'
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeModal = () => {
    setModalType(null);
    setCopied(false);
  };

  return (
    <>
      <FooterContainer>
        <FooterGrid>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <Heart size={24} color="#BB0000" fill="#BB0000" />
              <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>WANANCHI TECH</h3>
            </div>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
              Empowering Kenya's digital future through sustainable technology and community growth.
            </p>
          </div>

          <div>
            <SectionTitle>Navigation</SectionTitle>
            <FooterLink>Campaigns</FooterLink>
            <FooterLink>Rankings</FooterLink>
            <FooterLink onClick={() => setModalType('team')}>
               <Users size={14} /> Our Team
            </FooterLink>
          </div>

          <div>
            <SectionTitle>Legal</SectionTitle>
            <FooterLink>Privacy Policy</FooterLink>
            <FooterLink>Terms of Use</FooterLink>
            <FooterLink><Shield size={14} /> NGO Compliance</FooterLink>
          </div>

          <div>
            <SectionTitle>Support</SectionTitle>
            <button 
              onClick={() => setModalType('donate')}
              style={{ background: '#BB0000', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Coffee size={16} /> Donate Now
            </button>
          </div>
        </FooterGrid>

        <div style={{ maxWidth: '1100px', margin: '40px auto 0', paddingTop: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', fontSize: '12px', color: '#94a3b8' }}>
          <span>© {new Date().getFullYear()} Wananchi Tech Foundation • Nairobi, Kenya</span>
          <span style={{ fontWeight: 700, color: '#475569' }}>Made with ❤️ for Kenya 🇰🇪</span>
        </div>
      </FooterContainer>

      {/* MODALS */}
      {modalType && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                {modalType === 'donate' ? 'Support Our Cause' : 'Developed By'}
              </h2>
              <X cursor="pointer" onClick={closeModal} />
            </div>

            {modalType === 'donate' ? (
              <>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#006600', marginBottom: '10px' }}>MPESA TILL NUMBER</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '2px' }}>123 456</span>
                    <button onClick={() => handleCopy('123456')} style={{ padding: '8px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontSize: '12px' }}>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#3b82f6', marginBottom: '10px' }}>BANK ACCOUNT (KCB)</div>
                  <div style={{ fontSize: '18px', fontWeight: 700 }}>1234567890</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>TechForChange Kenya Foundation</div>
                </div>
              </>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                  <div style={{ width: '60px', height: '60px', background: '#BB0000', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: 'white' }}>
                    <Code size={30} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 900 }}>Welt Tallis</h3>
                  <p style={{ color: '#64748b', fontSize: '14px' }}>Digital Innovation Agency</p>
                </div>
                
                <TeamCard>
                  <div style={{ width: 40, height: 40, background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Globe size={20} color="#BB0000" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>Full-Stack Development</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Building scalable Kenyan solutions</div>
                  </div>
                </TeamCard>

                <TeamCard>
                  <div style={{ width: 40, height: 40, background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ExternalLink size={20} color="#BB0000" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>Contact Welt Tallis</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>solutions@welttallis.co.ke</div>
                  </div>
                </TeamCard>

                <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginTop: '10px' }}>
                  This platform was crafted with precision to serve the Kenyan community.
                </p>
              </>
            )}

            <button 
              onClick={closeModal}
              style={{ width: '100%', marginTop: '20px', padding: '14px', borderRadius: '12px', border: 'none', background: '#0f172a', color: 'white', fontWeight: 700, cursor: 'pointer' }}
            >
              Close
            </button>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default Footer;