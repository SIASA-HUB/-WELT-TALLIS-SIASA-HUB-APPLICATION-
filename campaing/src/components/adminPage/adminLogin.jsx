// components/admin/AdminLogin.jsx
import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Mail, Eye, EyeOff } from "lucide-react";
import api from "../../api/api";

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 32px;
  
  .icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #e11d48, #be123c);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    
    svg {
      width: 32px;
      height: 32px;
      color: white;
    }
  }
  
  h1 {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #fff, #e11d48);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    font-size: 13px;
    color: #94a3b8;
    margin-top: 8px;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InputWrapper = styled.div`
  position: relative;
  
  input {
    width: 100%;
    padding: 12px 16px 12px 42px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: white;
    font-size: 14px;
    transition: all 0.2s;
    
    &:focus {
      outline: none;
      border-color: #e11d48;
      background: rgba(255, 255, 255, 0.08);
    }
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
  }
  
  .input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
  }
  
  .toggle-password {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #64748b;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #e11d48, #be123c);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 24px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(225, 29, 72, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(225, 29, 72, 0.1);
  border: 1px solid rgba(225, 29, 72, 0.3);
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 20px;
  color: #e11d48;
  font-size: 12px;
  text-align: center;
`;

const BackLink = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 12px;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
  text-align: center;
  
  &:hover {
    color: #e11d48;
  }
`;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/users/admin/login", {
        email,
        password,
      });

      if (response.success) {
        localStorage.setItem("admin_token", response.accessToken || response.token);
        localStorage.setItem("token", response.accessToken || response.token); // Standard key for interceptor
        localStorage.setItem("admin_data", JSON.stringify(response.admin));
        navigate("/admin/dashboard");
      } else {
        setError(response.data.message || "Invalid credentials");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <LoginCard>
        <Logo>
          <div className="icon">
            <Shield />
          </div>
          <h1>Admin Portal</h1>
          <p>Secure access to SiasaHub administration</p>
        </Logo>

        <form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <InputGroup>
            <Label>Email Address</Label>
            <InputWrapper>
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                placeholder="admin@siasahub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>Password</Label>
            <InputWrapper>
              <Lock size={16} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </div>
            </InputWrapper>
          </InputGroup>

          <LoginButton type="submit" disabled={loading}>
            {loading ? "Authenticating..." : "Login to Admin Portal"}
          </LoginButton>
        </form>

        <BackLink onClick={() => navigate("/")}>
          ← Back to Home
        </BackLink>
      </LoginCard>
    </Container>
  );
};

export default AdminLogin;