// pages/LoginPage.jsx - Using your apiConfig

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
import AppLoadingBar from "../../utils/LoadingBar";
import theme from "../../utils/Theme";
import API_BASE_URL from "./apiConfig";

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
// STYLED COMPONENTS - SiasaHub Theme
// ==========================================
const LoginWrapper = styled.div`
  background: linear-gradient(
    135deg,
    ${theme?.colors?.background || "#fef3c7"} 0%,
    ${theme?.colors?.surface || "#fffbeb"} 100%
  );
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%23fbbf24' fill-opacity='0.05' d='M10,50 L20,30 L30,50 L20,70 Z M60,20 L70,0 L80,20 L70,40 Z M80,80 L90,60 L100,80 L90,100 Z'/%3E%3C/svg%3E");
    background-size: 60px 60px;
    opacity: 0.3;
    pointer-events: none;
  }
`;

const LoginContainer = styled.div`
  width: 100%;
  max-width: 480px;
  animation: ${slideIn} 0.8s ease-out;
  position: relative;
  z-index: 1;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: ${theme?.BORDER_RADIUS?.xl || "32px"};
  box-shadow: ${theme?.SHADOWS?.lg || "0 25px 50px -12px rgba(0, 0, 0, 0.25)"};
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme?.SHADOWS?.xl || "0 30px 60px -12px rgba(0, 0, 0, 0.3)"};
  }
`;

const LoginHeader = styled.div`
  background: linear-gradient(
    135deg,
    ${theme?.KENYA_THEME?.primary || "#b91c1c"} 0%,
    ${theme?.KENYA_THEME?.secondary || "#dc2626"} 50%,
    ${theme?.colors?.primary || "#ef4444"} 100%
  );
  padding: 40px;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 70%
    );
    animation: ${fadeIn} 1s ease-out;
  }
`;

const BackButton = styled(Link)`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 10px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateX(-2px);
  }
`;

const LoginBody = styled.div`
  padding: 40px;
  background: white;

  @media (max-width: 768px) {
    padding: 30px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${theme?.KENYA_THEME?.text || "#1f2937"};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid
    ${(props) =>
      props.error ? "#ef4444" : theme?.KENYA_THEME?.border || "#e5e7eb"};
  border-radius: ${theme?.BORDER_RADIUS?.lg || "16px"};
  font-size: 15px;
  color: ${theme?.KENYA_THEME?.text || "#1f2937"};
  transition: all 0.3s ease;
  background: ${(props) => (props.readOnly ? "#f9fafb" : "white")};
  animation: ${(props) => (props.error ? shake : "none")} 0.5s ease-in-out;

  &:focus {
    outline: none;
    border-color: ${theme?.KENYA_THEME?.primary || "#b91c1c"};
    box-shadow: 0 0 0 3px
      ${theme?.KENYA_THEME?.primary + "20" || "rgba(185, 28, 28, 0.1)"};
  }

  &::placeholder {
    color: #9ca3af;
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
  color: ${theme?.KENYA_THEME?.muted || "#6b7280"};
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;

  &:hover {
    color: ${theme?.KENYA_THEME?.primary || "#b91c1c"};
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(
    135deg,
    ${theme?.KENYA_THEME?.primary || "#b91c1c"} 0%,
    ${theme?.KENYA_THEME?.secondary || "#dc2626"} 50%,
    ${theme?.colors?.primary || "#ef4444"} 100%
  );
  color: white;
  border: none;
  padding: 16px;
  border-radius: ${theme?.BORDER_RADIUS?.lg || "16px"};
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px
      ${theme?.KENYA_THEME?.primary + "80" || "rgba(185, 28, 28, 0.4)"};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: linear-gradient(135deg, #9ca3af, #d1d5db);
    cursor: not-allowed;
    opacity: 0.7;
    transform: none;

    &::before {
      display: none;
    }
  }
`;

const RegisterPrompt = styled.div`
  text-align: center;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid ${theme?.KENYA_THEME?.border || "#e5e7eb"};
  color: ${theme?.KENYA_THEME?.muted || "#6b7280"};
  font-size: 14px;

  a {
    color: ${theme?.KENYA_THEME?.primary || "#b91c1c"};
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    margin-left: 5px;

    &:hover {
      color: ${theme?.KENYA_THEME?.secondary || "#dc2626"};
      text-decoration: underline;
    }
  }
`;

const ErrorAlert = styled.div`
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-left: 4px solid #ef4444;
  color: #991b1b;
  padding: 14px 16px;
  border-radius: ${theme?.BORDER_RADIUS?.lg || "16px"};
  margin-bottom: 24px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: ${shake} 0.5s ease-in-out;

  svg {
    flex-shrink: 0;
    color: #ef4444;
  }
`;

const SuccessAlert = styled.div`
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-left: 4px solid #22c55e;
  color: #166534;
  padding: 14px 16px;
  border-radius: ${theme?.BORDER_RADIUS?.lg || "16px"};
  margin-bottom: 24px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: ${fadeIn} 0.5s ease-out;

  svg {
    flex-shrink: 0;
    color: #22c55e;
  }
`;

const SecurityBadge = styled.div`
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: ${theme?.BORDER_RADIUS?.md || "12px"};
  padding: 12px 16px;
  margin-top: 24px;
  text-align: center;
  font-size: 12px;
  color: ${theme?.KENYA_THEME?.muted || "#6b7280"};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid ${theme?.KENYA_THEME?.border || "#e5e7eb"};

  svg {
    color: ${theme?.KENYA_THEME?.primary || "#b91c1c"};
  }
`;

const LogoIcon = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  backdrop-filter: blur(10px);
  animation: ${fadeIn} 0.6s ease-out;

  svg {
    width: 40px;
    height: 40px;
  }
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
        AuthService.clearAuth();
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
      await API_BASE_URL.post("/auth/logout");
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
        "✓ Registration successful! Please login with your credentials.",
      );
    }

    // Check if already authenticated
    if (AuthService.isAuthenticated()) {
      const userData = AuthService.getUserData();
      if (userData) {
        navigate("/dashboard", { replace: true });
      }
    }

    setTimeout(() => {
      loadingBarRef.current?.complete();
    }, 500);
  }, [location, navigate]);

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
      setErrorMessage("⚠️ Please fill in all fields");
      return;
    }

    if (loginData.username.length < 3) {
      setErrorMessage("⚠️ Username must be at least 3 characters");
      return;
    }

    if (loginData.password.length < 6) {
      setErrorMessage("⚠️ Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    loadingBarRef.current?.continuousStart();

    try {
      console.log("📤 Sending login request to SiasaHub API");
      console.log("📤 Login data:", { anonymous_username: loginData.username });

      // Using your apiConfig directly - no need to create new axios instance
      const response = await API_BASE_URL.post("/login", {
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
          role: response.data.role || "user",
          political_party: response.data.political_party,
          employment_status: response.data.employment_status,
        };

        console.log("👤 User data to store:", user);

        AuthService.setAuthenticated(true, user);

        console.log("✅ Login successful, redirecting to SiasaHub...");

        loadingBarRef.current?.complete();

        const from = location.state?.from?.pathname || "/dashboard";

        navigate(from, {
          state: {
            welcomeBack: true,
            username: user.username,
            real_name: user.real_name,
            county: user.county,
          },
          replace: true,
        });
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      loadingBarRef.current?.complete();

      let msg = "Login failed. Please check your credentials.";

      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err.message) {
        msg = err.message;
      }

      if (msg.toLowerCase().includes("verify")) {
        setErrorMessage("📧 " + msg);
      } else if (msg.toLowerCase().includes("locked")) {
        setErrorMessage("🔒 " + msg);
      } else {
        setErrorMessage("❌ " + msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppLoadingBar
        ref={loadingBarRef}
        color={theme?.KENYA_THEME?.primary || "#b91c1c"}
      />

      <LoginWrapper>
        <LoginContainer>
          <LoginCard>
            <LoginHeader>
              <BackButton to="/">
                <ArrowLeft size={22} />
              </BackButton>

              <LogoIcon>
                <Shield size={40} />
              </LogoIcon>

              <h1
                style={{
                  margin: "0 0 12px",
                  fontSize: "32px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                }}
              >
                SiasaHub Login
              </h1>
              <p style={{ margin: 0, fontSize: "15px", opacity: 0.95 }}>
                Secure access to manifesto liblary
              </p>
            </LoginHeader>

            <LoginBody>
              {successMessage && (
                <SuccessAlert>
                  <CheckCircle size={20} />
                  <span>{successMessage}</span>
                </SuccessAlert>
              )}

              {errorMessage && (
                <ErrorAlert>
                  <AlertTriangle size={20} />
                  <span>{errorMessage}</span>
                </ErrorAlert>
              )}

              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <FormLabel>
                    <Mail size={18} /> Username / Email
                  </FormLabel>
                  <FormInput
                    type="text"
                    name="username"
                    value={loginData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username or email"
                    required
                    error={!!errorMessage && !loginData.username}
                    autoComplete="username"
                    disabled={isSubmitting}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>
                    <Lock size={18} /> Password
                  </FormLabel>
                  <PasswordInputWrapper>
                    <FormInput
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={loginData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      required
                      error={!!errorMessage && !loginData.password}
                      autoComplete="current-password"
                      disabled={isSubmitting}
                    />
                    <TogglePasswordButton
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </TogglePasswordButton>
                  </PasswordInputWrapper>
                </FormGroup>

                <LoginButton type="submit" disabled={isSubmitting}>
                  <LogIn size={20} />
                  {isSubmitting ? "Authenticating..." : "Sign In to SiasaHub"}
                </LoginButton>
              </form>

              <SecurityBadge>
                <Shield size={14} />
                <span>
                  🔒 Secure HTTP-only Cookies • Session Protected • 256-bit SSL
                </span>
              </SecurityBadge>

              <RegisterPrompt>
                Don't have an account?{" "}
                <Link to="/register">Create SiasaHub Account</Link>
              </RegisterPrompt>
            </LoginBody>
          </LoginCard>
        </LoginContainer>
      </LoginWrapper>
    </>
  );
};

export default LoginPage;
