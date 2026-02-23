import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Coffee,
  Users,
  Shield,
  X,
  Mail,
  Globe,
  Code,
  Twitter,
  Github,
  Instagram,
  ArrowUpRight,
  Send,
} from "lucide-react";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const FooterContainer = styled.footer`
  background: #0f172a; /* Deep Midnight Blue */
  color: #f8fafc;
  padding: 80px 20px 120px;
  margin-top: 60px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #bb0000, transparent);
  }
`;

const FooterGrid = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 50px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const BrandSection = styled.div`
  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    h3 {
      font-size: 22px;
      fontweight: 900;
      letter-spacing: -1px;
    }
  }
  p {
    color: #94a3b8;
    line-height: 1.7;
    font-size: 14px;
    margin-bottom: 24px;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 15px;
  @media (max-width: 500px) {
    justify-content: center;
  }
`;

const SocialIcon = styled.a`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  transition: all 0.3s ease;
  &:hover {
    background: #bb0000;
    color: white;
    transform: translateY(-3px);
  }
`;

const SectionTitle = styled.h4`
  color: white;
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 24px;
  position: relative;
  display: inline-block;
  &::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 20px;
    height: 2px;
    background: #bb0000;
  }
`;

const FooterLink = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 14px;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  &:hover {
    color: white;
    transform: translateX(5px);
  }
  @media (max-width: 500px) {
    justify-content: center;
  }
`;

const DonateButton = styled.button`
  background: linear-gradient(135deg, #bb0000 0%, #880000 100%);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 14px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 10px 20px rgba(187, 0, 0, 0.2);
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.03);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.85);
  z-index: 4000;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: ${fadeIn} 0.3s ease;
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 450px;
  border-radius: 30px;
  padding: 40px;
  position: relative;
  animation: ${slideUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  color: #0f172a;
`;

const Footer = () => {
  const [modalType, setModalType] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <FooterContainer>
        <FooterGrid>
          <BrandSection>
            <div className="logo">
              <Heart size={28} color="#BB0000" fill="#BB0000" />
              <h3>WANANCHI TECH</h3>
            </div>
            <p>
              Kenya's first community-driven digital advocacy platform. Built
              for the people, by the people. Join the movement for transparency.
            </p>
            <SocialLinks>
              <SocialIcon href="#">
                <Twitter size={18} />
              </SocialIcon>
              <SocialIcon href="#">
                <Instagram size={18} />
              </SocialIcon>
              <SocialIcon href="#">
                <Github size={18} />
              </SocialIcon>
            </SocialLinks>
          </BrandSection>

          <div>
            <SectionTitle>Platform</SectionTitle>
            <FooterLink onClick={() => navigate("/leaders")}>
              Aspirants
            </FooterLink>
            <FooterLink onClick={() => navigate("/betting")}>
              Predictions
            </FooterLink>
            <FooterLink onClick={() => setModalType("team")}>
              Behind The Code
            </FooterLink>
          </div>

          <div>
            <SectionTitle>Trust</SectionTitle>
            <FooterLink>Privacy</FooterLink>
            <FooterLink>Terms</FooterLink>
            <FooterLink>
              <Shield size={14} /> Compliance
            </FooterLink>
          </div>

          <div>
            <SectionTitle>Fuel Us</SectionTitle>
            <p style={{ fontSize: "12px", marginBottom: "15px" }}>
              Help us keep the servers running and the data free.
            </p>
            <DonateButton onClick={() => setModalType("donate")}>
              <Coffee size={18} /> Support Project
            </DonateButton>
          </div>
        </FooterGrid>

        <div
          style={{
            maxWidth: "1100px",
            margin: "60px auto 0",
            paddingTop: "30px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
            fontSize: "12px",
            color: "#64748b",
          }}
        >
          <span>
            © {new Date().getFullYear()} Wananchi Tech Foundation • HQ Nairobi
          </span>
          <span style={{ color: "#94a3b8" }}>
            Designed by{" "}
            <strong style={{ color: "#BB0000" }}>Welt Tallis</strong>
          </span>
        </div>
      </FooterContainer>

      {/* COOL MODALS */}
      {modalType && (
        <ModalOverlay onClick={() => setModalType(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <X
              size={24}
              style={{
                position: "absolute",
                top: "25px",
                right: "25px",
                cursor: "pointer",
                color: "#94a3b8",
              }}
              onClick={() => setModalType(null)}
            />

            {modalType === "donate" ? (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    background: "#f0fdf4",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <Send size={30} color="#006600" />
                </div>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: 900,
                    marginBottom: "10px",
                  }}
                >
                  Quick Support
                </h2>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: "14px",
                    marginBottom: "30px",
                  }}
                >
                  Your contribution keeps this platform independent.
                </p>

                <div
                  style={{
                    background: "#f8fafc",
                    padding: "25px",
                    borderRadius: "24px",
                    border: "1px dashed #cbd5e1",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 900,
                      color: "#64748b",
                      position: "absolute",
                      top: "-10px",
                      left: "20px",
                      background: "white",
                      padding: "0 10px",
                    }}
                  >
                    MPESA TILL
                  </span>
                  <div
                    style={{
                      fontSize: "32px",
                      fontWeight: 900,
                      color: "#0f172a",
                      letterSpacing: "4px",
                      marginBottom: "15px",
                    }}
                  >
                    123 456
                  </div>
                  <button
                    onClick={() => handleCopy("123456")}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "12px",
                      background: copied ? "#006600" : "#0f172a",
                      color: "white",
                      border: "none",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.3s",
                    }}
                  >
                    {copied ? "COPIED TO CLIPBOARD!" : "COPY TILL NUMBER"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    background: "#fef2f2",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <Code size={30} color="#BB0000" />
                </div>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: 900,
                    marginBottom: "5px",
                  }}
                >
                  Welt Tallis
                </h2>
                <p
                  style={{
                    color: "#BB0000",
                    fontWeight: 700,
                    fontSize: "14px",
                    marginBottom: "20px",
                  }}
                >
                  Lead Developer
                </p>

                <div
                  style={{
                    textAlign: "left",
                    background: "#f8fafc",
                    padding: "20px",
                    borderRadius: "20px",
                    marginBottom: "15px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <Globe size={18} color="#BB0000" />
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>
                      solutions@welttallis.co.ke
                    </span>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    lineHeight: 1.6,
                  }}
                >
                  Specializing in high-traffic African digital ecosystems and
                  secure voting visualizations.
                </p>
              </div>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default Footer;
