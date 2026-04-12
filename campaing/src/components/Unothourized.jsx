// components/Unauthorized.jsx
import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

const Container = styled.div`
  min-height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Card = styled.div`
  text-align: center;
  max-width: 400px;
  
  .icon {
    width: 80px;
    height: 80px;
    background: rgba(225, 29, 72, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    
    svg {
      width: 40px;
      height: 40px;
      color: #e11d48;
    }
  }
  
  h1 {
    font-size: 28px;
    font-weight: 800;
    margin-bottom: 12px;
  }
  
  p {
    color: #94a3b8;
    margin-bottom: 24px;
    line-height: 1.6;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #e11d48, #be123c);
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const Unauthorized = () => {
  const navigate = useNavigate();
  
  return (
    <Container>
      <Card>
        <div className="icon">
          <ShieldAlert />
        </div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page. Please login with appropriate credentials.</p>
        <Button onClick={() => navigate("/")}>
          <ArrowLeft size={16} /> Back to Home
        </Button>
      </Card>
    </Container>
  );
};

export default Unauthorized;