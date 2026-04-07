// pages/LoginPage.jsx - Clean version

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
} from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import AppLoadingBar from "../../utils/LoadingBar";
import theme from "../../utils/theme";

// ==========================================
// API CONFIGURATION
// ==========================================
const API_BASE_URL =
  "https://grass-solaris-sas-hosts.trycloudflare.com/api/v1/users";

// Create axios instance with credentials (for cookies)
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================
// ANIMATIONS
// ==========================================
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

// ==========================================
// STYLED COMPONENTS
// ==========================================
const LoginWrapper = styled.div`
  background: linear-gradient(
    135deg,
    ${theme?.colors?.bg || "#f8fafc"} 0%,
    ${theme?.colors?.border || "#f1f5f9"} 100%
  );
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: ${fadeIn} 0.6s ease-out;
`;

const LoginContainer = styled.div`
  width: 100%;
  max-width: 480px;
  animation: ${slideIn} 0.8s ease-out;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: ${theme?.BORDER_RADIUS?.lg || "24px"};
  box-shadow: ${theme?.SHADOWS?.red || "0 20px 60px rgba(0, 0, 0, 0.1)"};
  overflow: hidden;
`;

const LoginHeader = styled.div`
  background: linear-gradient(
    135deg,
    ${theme?.KENYA_THEME?.primary || "#006600"} 0%,
    ${theme?.colors?.success || "#00aa44"} 100%
  );
  padding: 40px;
  color: white;
  text-align: center;
  position: relative;
`;

const BackButton = styled(Link)`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  padding: 10px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateX(-2px);
  }
`;

const LoginBody = styled.div`
  padding: 40px;
  @media (max-width: 768px) {
    padding: 30px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 25px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${theme?.KENYA_THEME?.text || "#475569"};
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 16px;
  border: 2px solid
    ${(props) =>
      props.error ? "#ef4444" : theme?.KENYA_THEME?.border || "#e2e8f0"};
  border-radius: ${theme?.BORDER_RADIUS?.md || "12px"};
  font-size: 15px;
  color: ${theme?.KENYA_THEME?.text || "#1e293b"};
  transition: all 0.3s ease;
  background: ${(props) => (props.readOnly ? "#f8fafc" : "white")};
  animation: ${(props) => (props.error ? shake : "none")} 0.5s ease-in-out;

  &:focus {
    outline: none;
    border-color: ${theme?.KENYA_THEME?.primary || "#006600"};
    box-shadow: 0 0 0 4px
      ${theme?.KENYA_THEME?.primary + "20" || "rgba(0, 102, 0, 0.1)"};
  }
`;

const PasswordInputWrapper = styled.div`
  position: relative;
`;

const TogglePasswordButton = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${theme?.KENYA_THEME?.muted || "#64748b"};
  cursor: pointer;
  padding: 6px;
  &:hover {
    color: ${theme?.KENYA_THEME?.primary || "#006600"};
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(
    135deg,
    ${theme?.KENYA_THEME?.primary || "#006600"},
    ${theme?.colors?.success || "#00aa44"}
  );
  color: white;
  border: none;
  padding: 18px;
  border-radius: ${theme?.BORDER_RADIUS?.lg || "14px"};
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px
      ${theme?.KENYA_THEME?.primary + "50" || "rgba(0, 102, 0, 0.3)"};
  }
  &:disabled {
    background: ${theme?.KENYA_THEME?.muted || "#cbd5e1"};
    cursor: not-allowed;
    opacity: 0.8;
    transform: none;
  }
`;

const RegisterPrompt = styled.div`
  text-align: center;
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid ${theme?.KENYA_THEME?.border || "#e2e8f0"};
  color: ${theme?.KENYA_THEME?.muted || "#64748b"};
  font-size: 14px;
  a {
    color: ${theme?.COLORS?.primary || "#bb0000"};
    text-decoration: none;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorAlert = styled.div`
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  color: #b91c1c;
  padding: 14px;
  border-radius: ${theme?.BORDER_RADIUS?.md || "12px"};
  margin-bottom: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    flex-shrink: 0;
  }
`;

const SuccessAlert = styled.div`
  background: #f0fdf4;
  border-left: 4px solid #22c55e;
  color: #166534;
  padding: 14px;
  border-radius: ${theme?.BORDER_RADIUS?.md || "12px"};
  margin-bottom: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SecurityBadge = styled.div`
  background: #f1f5f9;
  border-radius: 8px;
  padding: 10px;
  margin-top: 20px;
  text-align: center;
  font-size: 11px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

// ==========================================
// AUTH SERVICE
// ==========================================
const AuthService = {
  isAuthenticated: () => {
    const userData = localStorage.getItem("user_data");
    const isAuth = localStorage.getItem("isAuthenticated") === "true";

    if (!userData || !isAuth) return false;

    try {
      const user = JSON.parse(userData);
      if (user.timestamp && Date.now() - user.timestamp > 24 * 60 * 60 * 1000) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  setUserData: (userData) => {
    if (!userData) return;

    const safeUserData = {
      user_id: userData.user_id,
      username: userData.username || userData.anonymous_username,
      real_name: userData.real_name,
      gender: userData.gender,
      age_bracket: userData.age_bracket,
      county: userData.county,
      ward: userData.ward,
      voter_card: userData.voter_card,
      will_vote: userData.will_vote,
      is_verified: userData.is_verified,
      member_since: userData.member_since,
      role: userData.role,
      political_party: userData.political_party,
      employment_status: userData.employment_status,
      timestamp: Date.now(),
    };

    localStorage.setItem("user_data", JSON.stringify(safeUserData));
  },

  getUserData: () => {
    const userData = localStorage.getItem("user_data");
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  },

  clearAuth: () => {
    const keysToRemove = ["user_data", "isAuthenticated"];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  },

  setAuthenticated: (value, userData = null) => {
    localStorage.setItem("isAuthenticated", value.toString());
    if (userData) {
      AuthService.setUserData(userData);
    }
    if (!value) {
      AuthService.clearAuth();
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      AuthService.clearAuth();
    }
  },
};

// ==========================================
// LOGIN PAGE COMPONENT
// ==========================================
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loadingBarRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  // Top loader on page mount
  useEffect(() => {
    loadingBarRef.current?.continuousStart();

    // Check if user came from registration
    if (location.state?.registered) {
      setSuccessMessage(
        "Registration successful! Please login with your credentials.",
      );
    }

    setTimeout(() => {
      loadingBarRef.current?.complete();
    }, 500);
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    setIsSubmitting(true);
    loadingBarRef.current?.continuousStart();

    try {
      console.log("📤 Sending login request:", {
        username: loginData.username,
      });

      const response = await api.post("/login", {
        anonymous_username: loginData.username,
        password: loginData.password,
      });

      console.log("📥 Login response:", response.data);

      if (response.data.success) {
        const user = response.data.user || {
          user_id: response.data.user_id,
          username: loginData.username,
          real_name: response.data.real_name,
          gender: response.data.gender,
          age_bracket: response.data.age_bracket,
          county: response.data.county,
          ward: response.data.ward,
          voter_card: response.data.voter_card,
          will_vote: response.data.will_vote,
          is_verified: response.data.is_verified,
          role: response.data.role,
          political_party: response.data.political_party,
          employment_status: response.data.employment_status,
        };

        console.log("👤 User data to store:", user);

        AuthService.setAuthenticated(true, user);

        console.log("✅ Login successful, redirecting...");

        loadingBarRef.current?.complete();

        const from = location.state?.from || "/";

        navigate(from, {
          state: {
            welcomeBack: true,
            username: user.username,
            real_name: user.real_name,
            county: user.county,
          },
        });
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      loadingBarRef.current?.complete();

      const msg =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please check your credentials.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppLoadingBar
        ref={loadingBarRef}
        color={theme?.KENYA_THEME?.primary || "#006600"}
      />

      <LoginWrapper>
        <LoginContainer>
          <LoginCard>
            <LoginHeader>
              <BackButton to="/">
                <ArrowLeft size={20} />
              </BackButton>
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <Shield size={32} />
              </div>
              <h1
                style={{
                  margin: "0 0 10px",
                  fontSize: "28px",
                  fontWeight: 800,
                }}
              >
                Welcome Back
              </h1>
              <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>
                Secure login for Wananchi Connect
              </p>
            </LoginHeader>

            <LoginBody>
              {successMessage && (
                <SuccessAlert>
                  <CheckCircle size={18} />
                  {successMessage}
                </SuccessAlert>
              )}

              {errorMessage && (
                <ErrorAlert>
                  <AlertTriangle size={18} />
                  {errorMessage}
                </ErrorAlert>
              )}

              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <FormLabel>
                    <Mail size={16} /> Username
                  </FormLabel>
                  <FormInput
                    type="text"
                    name="username"
                    value={loginData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    required
                    error={!!errorMessage}
                    autoComplete="username"
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>
                    <Lock size={16} /> Password
                  </FormLabel>
                  <PasswordInputWrapper>
                    <FormInput
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={loginData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      required
                      error={!!errorMessage}
                      autoComplete="current-password"
                    />
                    <TogglePasswordButton
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </TogglePasswordButton>
                  </PasswordInputWrapper>
                </FormGroup>

                <LoginButton type="submit" disabled={isSubmitting}>
                  <LogIn size={20} />
                  {isSubmitting ? "Authenticating..." : "Sign In"}
                </LoginButton>
              </form>

              <SecurityBadge>
                <Shield size={12} />
                <span>
                  🔒 Secure HTTP-only Cookies • Session Protected • 256-bit SSL
                </span>
              </SecurityBadge>

              <RegisterPrompt>
                Don't have an account?{" "}
                <Link to="/register">Create account</Link>
              </RegisterPrompt>
            </LoginBody>
          </LoginCard>
        </LoginContainer>
      </LoginWrapper>
    </>
  );
};

export default LoginPage;
