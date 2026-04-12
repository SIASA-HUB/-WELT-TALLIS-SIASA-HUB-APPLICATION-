// components/NotFound.jsx
import React from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Compass } from "lucide-react";

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at 30% 50%, rgba(225, 29, 72, 0.08), transparent);
    animation: ${float} 20s ease-in-out infinite;
  }
`;

const Content = styled.div`
  text-align: center;
  max-width: 500px;
  z-index: 1;
  animation: ${fadeIn} 0.6s ease-out;
`;

const LogoWrapper = styled.div`
  margin-bottom: 32px;
  animation: ${float} 3s ease-in-out infinite;
  
  img {
    width: 120px;
    height: auto;
    filter: drop-shadow(0 0 20px rgba(225, 29, 72, 0.3));
  }
`;

const ErrorCode = styled.div`
  font-size: 120px;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #e11d48, #f97316);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(225, 29, 72, 0.2);
  
  @media (max-width: 768px) {
    font-size: 80px;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    font-size: 22px;
  }
`;

const Message = styled.p`
  font-size: 16px;
  color: #94a3b8;
  margin-bottom: 32px;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  ${props => props.$primary ? `
    background: linear-gradient(135deg, #e11d48, #be123c);
    color: white;
    box-shadow: 0 4px 15px rgba(225, 29, 72, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(225, 29, 72, 0.4);
    }
  ` : `
    background: rgba(255, 255, 255, 0.05);
    color: #94a3b8;
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }
  `}
  
  &:active {
    transform: scale(0.98);
  }
`;

const DecorativeLine = styled.div`
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #e11d48, transparent);
  margin: 32px auto 0;
`;

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Content>
        <LogoWrapper>
          <img src="/image/siasa.png" alt="SiasaHub" />
        </LogoWrapper>
        
        <ErrorCode>404</ErrorCode>
        <Title>Oops! Page not found</Title>
        <Message>
          The page you're looking for doesn't exist or has been moved.<br />
          Let's get you back on track.
        </Message>
        
        <ButtonGroup>
          <Button $primary onClick={() => navigate("/")}>
            <Home size={16} /> Home
          </Button>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Go Back
          </Button>
          <Button onClick={() => navigate("/leaders")}>
            <Compass size={16} /> Explore
          </Button>
        </ButtonGroup>
        
        <DecorativeLine />
      </Content>
    </Container>
  );
};

export default NotFound;