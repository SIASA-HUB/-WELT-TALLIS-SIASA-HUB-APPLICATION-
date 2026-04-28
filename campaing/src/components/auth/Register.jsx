import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";
import {
  UserPlus,
  ShieldCheck,
  MapPin,
  ClipboardList,
  Calendar,
  Lock,
  Briefcase,
  Eye,
  EyeOff,
  User,
  Flag,
  TrendingUp,
  Mail,
  Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import api from "../../api/api";

// Color scheme
const colors = {
  primaryDark: "#000000",
  primaryLight: "#000000",
  secondary: "#1a1a1a",
  text: "#0f172a",
  textLight: "#64748b",
  border: "#e2e8f0",
  bg: "#f8fafc",
};

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${colors.bg};
  padding: 10px 20px;
`;

const FormCard = styled.div`
  background: white;
  width: 100%;
  max-width: 1200px;
  border-radius: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  border: 1px solid ${colors.border};
`;

const Header = styled.div`
  background: white;
  padding: 40px 32px 20px;
  color: ${colors.text};
  text-align: center;
  border-bottom: 1px solid ${colors.border};

  h2 {
    margin: 0;
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -1px;
    color: #1e3c72;
  }

  p {
    margin: 12px 0 0;
    color: ${colors.textLight};
    font-size: 15px;
    font-weight: 500;
  }
`;

const Section = styled.div`
  padding: 20px 32px;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: 8px;
  margin-top: 20px;

  &:first-of-type {
    margin-top: 0;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: ${(props) => (props.hasIcon ? "14px 16px 14px 44px" : "14px 16px")};
  border: 1.5px solid ${(props) => (props.error ? "#ef4444" : colors.border)};
  border-radius: 12px;
  font-size: 15px;
  background: white;
  color: #1e293b; /* Explicitly set dark text color */
  transition: all 0.2s ease;
  
  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    border-color: #1e3c72;
    outline: none;
    box-shadow: 0 0 0 4px rgba(30, 60, 114, 0.05);
    background: white;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid ${colors.border};
  border-radius: 12px;
  background: white;
  font-size: 15px;
  color: #1e293b; /* Explicitly set dark text color */
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    border-color: #1e3c72;
    outline: none;
    box-shadow: 0 0 0 4px rgba(30, 60, 114, 0.05);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: ${colors.textLight};
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: ${colors.textLight};
`;

const SubmitBtn = styled.button`
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
  transition: all 0.3s ease;
  margin-top: 24px;

  &:hover {
    background: #2a4a8a;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(30, 60, 114, 0.3);
  }

  &:disabled {
    background: ${colors.textLight};
    cursor: not-allowed;
  }
`;

const OptionalBadge = styled.span`
  font-size: 10px;
  font-weight: normal;
  background: ${colors.border};
  padding: 2px 6px;
  border-radius: 12px;
  margin-left: 8px;
  color: ${colors.textLight};
`;

const SensitiveBadge = styled.span`
  font-size: 10px;
  font-weight: normal;
  background: #fee2e2;
  padding: 2px 6px;
  border-radius: 12px;
  margin-left: 8px;
  color: #1e3c72;
`;

// Data Lists
const CountyList = [
  "Mombasa",
  "Kwale",
  "Kilifi",
  "Tana River",
  "Lamu",
  "Taita Taveta",
  "Garissa",
  "Wajir",
  "Mandera",
  "Marsabit",
  "Isiolo",
  "Meru",
  "Tharaka Nithi",
  "Embu",
  "Kitui",
  "Machakos",
  "Makueni",
  "Nyandarua",
  "Nyeri",
  "Kirinyaga",
  "Murang'a",
  "Kiambu",
  "Turkana",
  "West Pokot",
  "Samburu",
  "Trans Nzoia",
  "Uasin Gishu",
  "Elgeyo Marakwet",
  "Nandi",
  "Baringo",
  "Laikipia",
  "Nakuru",
  "Narok",
  "Kajiado",
  "Kericho",
  "Bomet",
  "Kakamega",
  "Vihiga",
  "Bungoma",
  "Busia",
  "Siaya",
  "Kisumu",
  "Homa Bay",
  "Migori",
  "Kisii",
  "Nyamira",
  "Nairobi",
];

const PoliticalParties = [
  "UDA",
  "ODM",
  "DCP",
  "Wiper",
  "Jubilee",
  "ANC",
  "Ford-Kenya",
  "Linda Mwanainchi",
  "Independent",
  "None",
  "Undecided",
  "Prefer not to say",
];

const EmploymentStatuses = [
  "Employed Full-time",
  "Employed Part-time",
  "Self-Employed",
  "Unemployed",
  "Student",
  "Retired",
  "Prefer not to say",
];

const PoliticalLeanings = [
  "Pro-Government",
  "Opposition",
  "Undecided",
  "Prefer not to say",
];

const VoteFrequencies = [
  "Always",
  "Sometimes",
  "Rarely",
  "Never",
  "First-time voter",
  "Prefer not to say",
];

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    real_name: "",
    gender: "",
    age_bracket: "",
    county: "",
    ward: "",
    voter_card: "",
    will_vote: "",
    password: "",
    political_party: "",
    employment_status: "",
    political_leanings: "",
    vote_frequency: "",
    personal_email: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.real_name || formData.real_name.trim().length < 3) {
      toast.error("Full name must be at least 3 characters");
      return false;
    }
    if (!formData.personal_email) {
      toast.error("Please enter your email address");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.personal_email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const submitData = {
      real_name: formData.real_name.trim(),
      personal_email: formData.personal_email.trim(),
      password: formData.password,
    };

    try {
      const response = await api.post("/users/register", submitData);

      if (response.success) {
        toast.success(
          `Welcome ${formData.real_name.split(" ")[0]}! 150 points added to your wallet! 🎉`,
        );
        
        // Handle redirect if present
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        setTimeout(() => navigate(redirect === 'cart' ? '/marketplace' : '/login'), 2000);
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(err.response?.data?.message || "Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <ToastContainer position="top-center" autoClose={3000} />
      <FormCard>
        <Header>
          <h2>🇰🇪 Join Siasa-Hub</h2>
          <p>Register to participate in democracy • Get 150 welcome points!</p>
        </Header>

        <form onSubmit={handleSubmit}>
          <Section>
            {/* Full Name */}
            <Label>
              <User size={16} /> Full Name *
            </Label>
            <InputWrapper>
              <InputIcon>
                <User size={18} />
              </InputIcon>
              <Input
                name="real_name"
                placeholder="Enter your full name"
                value={formData.real_name}
                onChange={handleChange}
                hasIcon
              />
            </InputWrapper>

            {/* Personal Email */}
            <Label>
              <Mail size={16} /> Personal Email *
            </Label>
            <InputWrapper>
              <InputIcon>
                <Mail size={18} />
              </InputIcon>
              <Input
                name="personal_email"
                type="email"
                placeholder="your@email.com"
                value={formData.personal_email}
                onChange={handleChange}
                hasIcon
              />
            </InputWrapper>

            {/* Password */}
            <Label>
              <Lock size={14} /> Password *
            </Label>
            <InputWrapper>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </PasswordToggle>
            </InputWrapper>

            <SubmitBtn type="submit" disabled={loading}>
              {loading
                ? "Creating Account..."
                : "Join Siasa-Hub (Get 150 Points!)"}
              {!loading && <UserPlus size={20} />}
            </SubmitBtn>
          </Section>
        </form>
      </FormCard>
    </PageWrapper>
  );
};

export default RegistrationPage;
