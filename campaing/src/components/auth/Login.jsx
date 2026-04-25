// pages/LoginPage.jsx - Fixed Token Storage & Role Redirection
import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle,
  Fingerprint,
} from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import AppLoadingBar from "../../utils/LoadingBar";
import { useAuth } from "../hooks/useAuth";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// ==========================================
// STYLED COMPONENTS - Clean Dark Theme
// ==========================================
const LoginWrapper = styled.div`
  background: #0a0a0a;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  position: relative;
`;

const LoginContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  animation: ${slideIn} 0.5s ease-out;
  position: relative;
  z-index: 1;
`;

const LoginCard = styled.div`
  background: #111111;
  border-radius: 10px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.6);
  }
`;

const LoginHeader = styled.div`
  background: #1e3c72;
  padding: 32px;
  color: white;
  text-align: center;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const BackButton = styled(Link)`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(-2px);
  }
`;

const LogoIcon = styled.div`
  width: 64px;
  height: 64px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);

  svg {
    width: 32px;
    height: 32px;
    color: #1e3c72;
  }
`;

const LoginBody = styled.div`
  padding: 32px;
  background: #111111;

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #a1a1aa;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${(props) => (props.error ? "#ef4444" : "#e5e7eb")};
  border-radius: 12px;
  font-size: 15px;
  color: #1e293b;
  background: white;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #1e3c72;
    box-shadow: 0 0 0 3px rgba(30, 60, 114, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PasswordInputWrapper = styled.div`
  position: relative;
`;

const TogglePasswordButton = styled.button`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;

  &:hover {
    color: #10b981;
  }
`;

const LoginButton = styled.button`
  background: #1e3c72;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(30, 60, 114, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: linear-gradient(135deg, #374151, #1f2937);
    cursor: not-allowed;
    opacity: 0.7;
    transform: none;
    box-shadow: none;
  }
`;

const RegisterPrompt = styled.div`
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #2a2a2a;
  color: #6b7280;
  font-size: 13px;

  a {
    color: #10b981;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    margin-left: 5px;

    &:hover {
      color: #34d399;
      text-decoration: underline;
    }
  }
`;

const ErrorAlert = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #ef4444;
  color: #fca5a5;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    flex-shrink: 0;
    color: #ef4444;
  }
`;

const SuccessAlert = styled.div`
  background: rgba(16, 185, 129, 0.1);
  border-left: 3px solid #10b981;
  color: #6ee7b7;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    flex-shrink: 0;
    color: #10b981;
  }
`;

const SecurityBadge = styled.div`
  background: #0a0a0a;
  border-radius: 12px;
  padding: 10px 16px;
  margin-top: 20px;
  text-align: center;
  font-size: 11px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #2a2a2a;

  svg {
    color: #10b981;
  }
`;

// ==========================================
// LOGIN PAGE COMPONENT
// ==========================================
const LoginPage = () => {
  const { login, isAuthenticated, user: authUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const loadingBarRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loginData, setLoginData] = useState({ username: "", password: "" });

  // Role-based redirect helper
  const getRedirectPathByRole = (role) => {
    switch (role?.toLowerCase()) {
      case "administrator":
      case "super_admin":
      case "ceo":
        return "/admin/dashboard";
      case "market_admin":
      case "marketadmin":
      case "admin":
        return "/marketplace-admin";
      case "aspirant":
      case "leader":
        return "/aspirant-dashboard";
      default:
        return "/";
    }
  };

  useEffect(() => {
    loadingBarRef.current?.continuousStart();

    if (location.state?.registered) {
      setSuccessMessage("Registration successful! Please login with your credentials.");
    }

    // Only redirect if fully authenticated AND we have a local token
    // This prevents "ghost sessions" from cookies auto-redirecting a user who intentionally logged out
    const hasLocalToken = localStorage.getItem("access_token") || localStorage.getItem("token");
    if (isAuthenticated && authUser && hasLocalToken) {
      const redirectPath = getRedirectPathByRole(authUser.role);
      navigate(redirectPath, { replace: true });
    }

    setTimeout(() => loadingBarRef.current?.complete(), 500);
  }, [location, navigate, isAuthenticated, authUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!loginData.username || !loginData.password) {
      setErrorMessage("Please fill in all fields");
      return;
    }
    if (loginData.username.length < 3) {
      setErrorMessage("Username must be at least 3 characters");
      return;
    }
    if (loginData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    loadingBarRef.current?.continuousStart();

      try {
        const result = await login(loginData.username, loginData.password);
        if (result.success) {
          const user = result.user;
          const userRole = user?.role || "user";
          localStorage.removeItem("was_aspirant");

          loadingBarRef.current?.complete();

        // Redirect based on role
        const redirectPath = getRedirectPathByRole(userRole);
        navigate(redirectPath, {
          replace: true,
          state: {
            welcomeMessage: `Welcome back, ${user.real_name || user.username}!`,
            userRole,
          },
        });
      } else {
        throw new Error(result.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      loadingBarRef.current?.complete();
      setErrorMessage(err.message || "Invalid username or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppLoadingBar ref={loadingBarRef} color="#10b981" />
      <LoginWrapper>
        <LoginContainer>
          <LoginCard>
            <LoginHeader>
              <BackButton to="/">
                <ArrowLeft size={20} />
              </BackButton>
              <LogoIcon>
                <Fingerprint size={32} />
              </LogoIcon>
              <h1 style={{ margin: "0 0 8px", fontSize: "28px", fontWeight: 700 }}>
                Welcome Back
              </h1>
              <p style={{ margin: 0, fontSize: "13px", opacity: 0.7 }}>
                Sign in to continue to SiasaHub
              </p>
            </LoginHeader>

            <LoginBody>
              {successMessage && (
                <SuccessAlert>
                  <CheckCircle size={18} />
                  <span>{successMessage}</span>
                </SuccessAlert>
              )}
              {errorMessage && (
                <ErrorAlert>
                  <AlertTriangle size={18} />
                  <span>{errorMessage}</span>
                </ErrorAlert>
              )}

              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <FormLabel>
                    <Mail size={14} /> Username or Email
                  </FormLabel>
                  <FormInput
                    type="text"
                    name="username"
                    value={loginData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username or email"
                    disabled={isSubmitting}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>
                    <Lock size={14} /> Password
                  </FormLabel>
                  <PasswordInputWrapper>
                    <FormInput
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={loginData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      disabled={isSubmitting}
                    />
                    <TogglePasswordButton type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </TogglePasswordButton>
                  </PasswordInputWrapper>
                </FormGroup>

                <LoginButton type="submit" disabled={isSubmitting}>
                  <LogIn size={18} />
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </LoginButton>
              </form>

              <SecurityBadge>
                <Shield size={12} />
                <span>Secure • Encrypted • Protected</span>
              </SecurityBadge>

              <RegisterPrompt>
                Don't have an account?
                <Link to="/register">Create Account</Link>
              </RegisterPrompt>
            </LoginBody>
          </LoginCard>
        </LoginContainer>
      </LoginWrapper>
    </>
  );
};

export default LoginPage;