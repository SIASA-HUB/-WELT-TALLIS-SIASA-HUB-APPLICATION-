import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
  User,
  MapPin,
  Award,
  Heart,
  CheckCircle,
} from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";

// ==========================================
// CONFIGURATION
// ==========================================
const API_BASE_URL =
  "https://reports-peaceful-premises-everywhere.trycloudflare.com/api/v1";

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

// ==========================================
// STYLED COMPONENTS
// ==========================================
const LoginWrapper = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
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
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const LoginHeader = styled.div`
  background: linear-gradient(135deg, #006600 0%, #00aa44 100%);
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
  color: #475569;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  color: #1e293b;
  transition: all 0.3s ease;
  background: ${(props) => (props.readOnly ? "#f8fafc" : "white")};
  &:focus {
    outline: none;
    border-color: #006600;
    box-shadow: 0 0 0 4px rgba(0, 102, 0, 0.1);
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
  color: #64748b;
  cursor: pointer;
  padding: 6px;
`;

const RememberForgot = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0 30px;
`;

const RememberMe = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
`;

const ForgotPassword = styled(Link)`
  font-size: 14px;
  color: #bb0000;
  text-decoration: none;
  font-weight: 600;
  &:hover {
    text-decoration: underline;
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #006600, #00aa44);
  color: white;
  border: none;
  padding: 18px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(0, 102, 0, 0.3);
  }
  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

const RegisterPrompt = styled.div`
  text-align: center;
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 14px;
  a {
    color: #bb0000;
    text-decoration: none;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorAlert = styled.div`
  background: #fff1f2;
  border: 1px solid #fda4af;
  color: #be123c;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
`;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Store all user data from login response in localStorage
 */
const storeUserData = (userData) => {
  if (!userData) return;

  // Store basic auth info
  localStorage.setItem("isAuthenticated", "true");
  localStorage.setItem("user_id", userData.user_id);
  localStorage.setItem("current_username", userData.username);

  // Store all user profile data
  localStorage.setItem("user_gender", userData.gender || "");
  localStorage.setItem("user_age_bracket", userData.age_bracket || "");
  localStorage.setItem("user_county", userData.county || "");
  localStorage.setItem("user_ward", userData.ward || "");
  localStorage.setItem("user_voter_card", userData.voter_card || "");
  localStorage.setItem("user_will_vote", userData.will_vote ? "true" : "false");
  localStorage.setItem("user_voter_status", userData.voter_status || "");
  localStorage.setItem(
    "user_voting_intention",
    userData.voting_intention || "",
  );
  localStorage.setItem(
    "user_is_verified",
    userData.is_verified ? "true" : "false",
  );
  localStorage.setItem("user_member_since", userData.member_since || "");
  localStorage.setItem("user_last_login", userData.last_login || "");

  // Store complete user object for easy access (JSON string)
  localStorage.setItem("user_data_complete", JSON.stringify(userData));

  console.log("✅ All user data stored in localStorage", userData);
};

/**
 * Get user data from localStorage (for other components)
 */
export const getUserData = () => {
  try {
    const userData = {
      user_id: localStorage.getItem("user_id"),
      username: localStorage.getItem("current_username"),
      gender: localStorage.getItem("user_gender"),
      age_bracket: localStorage.getItem("user_age_bracket"),
      county: localStorage.getItem("user_county"),
      ward: localStorage.getItem("user_ward"),
      voter_card: localStorage.getItem("user_voter_card"),
      will_vote: localStorage.getItem("user_will_vote") === "true",
      voter_status: localStorage.getItem("user_voter_status"),
      voting_intention: localStorage.getItem("user_voting_intention"),
      is_verified: localStorage.getItem("user_is_verified") === "true",
      member_since: localStorage.getItem("user_member_since"),
      last_login: localStorage.getItem("user_last_login"),
    };

    // Try to get complete object if available
    const completeData = localStorage.getItem("user_data_complete");
    if (completeData) {
      return JSON.parse(completeData);
    }

    return userData;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

/**
 * Clear all user data from localStorage on logout
 */
export const clearUserData = () => {
  const rememberMe = localStorage.getItem("rememberMe_active") === "true";

  // Items to keep if remember me is active
  const keepItems = rememberMe ? ["assignedUsername", "rememberMe_active"] : [];

  // Get all keys
  const keys = Object.keys(localStorage);

  // Remove all user-related items
  keys.forEach((key) => {
    if (
      !keepItems.includes(key) &&
      (key.startsWith("user_") ||
        key === "isAuthenticated" ||
        key === "user_id" ||
        key === "current_username" ||
        key === "user_data_complete")
    ) {
      localStorage.removeItem(key);
    }
  });

  console.log("✅ User data cleared from localStorage");
};

// ==========================================
// PAGE COMPONENT
// ==========================================

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  // Load username from state (registration) or LocalStorage
  useEffect(() => {
    const stateUsername = location.state?.autoUsername;
    const storedUsername = localStorage.getItem("assignedUsername");
    const wasRemembered = localStorage.getItem("rememberMe_active") === "true";

    if (stateUsername || storedUsername) {
      setLoginData((prev) => ({
        ...prev,
        username: stateUsername || storedUsername,
        rememberMe: wasRemembered,
      }));
    }
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!loginData.username || !loginData.password) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/login`,
        {
          anonymous_username: loginData.username,
          password: loginData.password,
        },
        {
          withCredentials: true, // CRITICAL: Sends/Receives cookies
        },
      );

      if (response.data.success) {
        const { user } = response.data;

        // Store ALL user data in localStorage
        storeUserData(user);

        // Handle remember me
        if (loginData.rememberMe) {
          localStorage.setItem("assignedUsername", user.username);
          localStorage.setItem("rememberMe_active", "true");
        } else {
          localStorage.setItem("rememberMe_active", "false");
        }

        // Navigate to dashboard with user data in state
        navigate("/", {
          state: {
            welcomeBack: true,
            username: user.username,
            county: user.county,
            voter_status: user.voter_status,
          },
        });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginWrapper>
      <LoginContainer>
        <LoginCard>
          <LoginHeader>
            <BackButton to="/">
              {" "}
              <ArrowLeft size={20} />{" "}
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
              style={{ margin: "0 0 10px", fontSize: "28px", fontWeight: 800 }}
            >
              Welcome Back
            </h1>
            <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>
              Secure login for Wananchi 2026
            </p>
          </LoginHeader>

          <LoginBody>
            {errorMessage && <ErrorAlert>{errorMessage}</ErrorAlert>}

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <FormLabel>
                  {" "}
                  <Mail size={16} /> Username{" "}
                </FormLabel>
                <FormInput
                  type="text"
                  name="username"
                  value={loginData.username}
                  onChange={handleInputChange}
                  placeholder="e.g. Brave-Lion-402"
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  {" "}
                  <Lock size={16} /> Password{" "}
                </FormLabel>
                <PasswordInputWrapper>
                  <FormInput
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={loginData.password}
                    onChange={handleInputChange}
                    placeholder="Your password"
                    required
                  />
                  <TogglePasswordButton
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </TogglePasswordButton>
                </PasswordInputWrapper>
              </FormGroup>

              <RememberForgot>
                <RememberMe>
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={loginData.rememberMe}
                    onChange={handleInputChange}
                  />
                  Remember Me
                </RememberMe>
                <ForgotPassword to="/forgot-password">
                  Forgot Password?
                </ForgotPassword>
              </RememberForgot>

              <LoginButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Authenticating..." : "Sign In"}
                {!isSubmitting && <LogIn size={20} />}
              </LoginButton>
            </form>

            <RegisterPrompt>
              Don't have an account? <Link to="/register">Register here</Link>
            </RegisterPrompt>
          </LoginBody>
        </LoginCard>
      </LoginContainer>
    </LoginWrapper>
  );
};

export default LoginPage;
