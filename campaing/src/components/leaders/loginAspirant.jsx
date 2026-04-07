import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import {
  LogIn,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = axios.create({
  baseURL:
    "https://apartments-adopt-cities-consent.trycloudflare.com/api/v1/leaders",
});

// --- Styled Components ---

const PageWrapper = styled.div`
  background: #f3f4f6;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "Inter", sans-serif;
`;

const LoginCard = styled.div`
  background: white;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
`;

const Header = styled.div`
  background: #1e3c72;
  padding: 40px 30px;
  color: white;
  text-align: center;
  position: relative;
  h2 {
    margin: 0;
    font-size: 26px;
    font-weight: 800;
  }
  p {
    margin: 10px 0 0;
    opacity: 0.8;
    font-size: 14px;
  }
`;

const BackButton = styled.button`
  position: absolute;
  left: 20px;
  top: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const Form = styled.form`
  padding: 40px 30px;
`;

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px 14px 44px;
  border: 2px solid ${(props) => (props.error ? "#ef4444" : "#e5e7eb")};
  border-radius: 12px;
  font-size: 15px;
  transition: border 0.2s;
  background: #f9fafb;
  &:focus {
    border-color: #1e3c72;
    outline: none;
    background: white;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #1e3c72;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 10px;
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const RegisterLink = styled.p`
  text-align: center;
  margin-top: 24px;
  color: #6b7280;
  font-size: 14px;
  span {
    color: #1e3c72;
    font-weight: 700;
    cursor: pointer;
    margin-left: 5px;
  }
`;

const ErrorAlert = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
`;

// --- Component Logic ---

const LoginAspirant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true); // New state to handle redirect check
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: location.state?.name || location.state?.username || "",
    password: "",
  });
  const [error, setError] = useState("");

  // CHECK IF ALREADY LOGGED IN
  useEffect(() => {
    const token = localStorage.getItem("leaderToken");
    const leaderData = localStorage.getItem("leaderData");

    if (token && leaderData) {
      // User is already logged in, skip to dashboard
      navigate("/aspirant-dashboard");
    } else {
      // No valid session, show the login form
      setCheckingAuth(false);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.password) {
      setError("Please enter your name and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await API.post("/login", {
        name: formData.name,
        password: formData.password,
      });

      if (response.data.success) {
        const { token, leader } = response.data.data;

        localStorage.setItem("leaderToken", token);
        localStorage.setItem("leaderData", JSON.stringify(leader));

        const leaderId = leader.leader_id || leader.id || leader._id;
        localStorage.setItem("currentLeaderId", leaderId);

        toast.success(`Welcome back, ${leader.name}!`);

        setTimeout(() => {
          navigate("/aspirant-dashboard");
        }, 1500);
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Invalid name or password");
    } finally {
      setLoading(false);
    }
  };

  // While checking if the user is already logged in, show a simple loader or empty state
  if (checkingAuth) {
    return (
      <PageWrapper>
        <div style={{ textAlign: "center", color: "#1e3c72" }}>
          <p style={{ fontWeight: "600" }}>Checking session...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <ToastContainer position="top-center" theme="colored" />
      <LoginCard>
        <Header>
          <BackButton onClick={() => navigate("/")}>
            <ArrowLeft size={20} />
          </BackButton>
          <h2>Aspirant Login</h2>
          <p>Access your campaign dashboard</p>
        </Header>

        <Form onSubmit={handleSubmit}>
          {error && (
            <ErrorAlert>
              <AlertCircle size={16} />
              {error}
            </ErrorAlert>
          )}

          <InputWrapper>
            <InputIcon>
              <User size={18} />
            </InputIcon>
            <Input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              error={!!error}
            />
          </InputWrapper>

          <InputWrapper>
            <InputIcon>
              <Lock size={18} />
            </InputIcon>
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              error={!!error}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </PasswordToggle>
          </InputWrapper>

          <LoginButton type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Login to Dashboard"}
            {!loading && <LogIn size={18} />}
          </LoginButton>

          <RegisterLink>
            Don't have an account?
            <span onClick={() => navigate("/register-aspirant")}>
              Register here
            </span>
          </RegisterLink>
        </Form>
      </LoginCard>
    </PageWrapper>
  );
};

export default LoginAspirant;
