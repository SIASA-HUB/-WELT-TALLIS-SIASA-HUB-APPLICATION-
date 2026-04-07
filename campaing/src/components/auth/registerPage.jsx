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
  Users,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  AtSign,
  Flag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = axios.create({
  baseURL: "https://promote-strongly-chose-resist.trycloudflare.com/api/v1",
});

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  position: relative;
  overflow: hidden;
`;

const FormCard = styled.div`
  background: white;
  width: 100%;
  max-width: 1200px;
  border-radius: 10px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  position: relative;
  z-index: 1;
  margin: 20px;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 32px;
  color: white;
  text-align: center;

  h2 {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
  }

  p {
    margin: 12px 0 0;
    opacity: 0.9;
    font-size: 14px;
  }
`;

const Section = styled.div`
  padding: 32px;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
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
  padding: ${(props) => (props.hasIcon ? "12px 16px 12px 42px" : "12px 16px")};
  border: 2px solid ${(props) => (props.error ? "#ef4444" : "#e5e7eb")};
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    border-color: ${(props) => (props.error ? "#ef4444" : "#3b82f6")};
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    border-color: #3b82f6;
    outline: none;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
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

const SubmitBtn = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const UsernameStatus = styled.div`
  margin-top: 6px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${(props) => {
    if (props.status === "available") return "#10b981";
    if (props.status === "taken") return "#ef4444";
    return "#6b7280";
  }};
`;

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

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [formData, setFormData] = useState({
    real_name: "",
    username: "",
    gender: "",
    age_bracket: "",
    county: "",
    ward: "",
    voter_card: "",
    will_vote: "",
    password: "",
    political_party: "",
    employment_status: "",
  });

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "username" && value.length >= 3) {
      setCheckingUsername(true);
      try {
        const response = await API.get(`/users/check-username/${value}`);
        setUsernameAvailable(response.data.available);
      } catch (error) {
        setUsernameAvailable(false);
      } finally {
        setCheckingUsername(false);
      }
    } else if (name === "username" && value.length < 3) {
      setUsernameAvailable(null);
    }
  };

  const validateForm = () => {
    if (!formData.real_name || formData.real_name.trim().length < 3) {
      toast.error("Full name must be at least 3 characters");
      return false;
    }
    if (!formData.username || formData.username.length < 1) {
      toast.error("Username is required");
      return false;
    }
    // REMOVED: username regex validation - ANY username is allowed

    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (!formData.gender) {
      toast.error("Please select your gender");
      return false;
    }
    if (!formData.age_bracket) {
      toast.error("Please select your age bracket");
      return false;
    }
    if (!formData.county) {
      toast.error("Please select your county");
      return false;
    }
    if (!formData.voter_card) {
      toast.error("Please indicate if you have a voter's card");
      return false;
    }
    if (!formData.will_vote) {
      toast.error("Please indicate if you will vote");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        real_name: formData.real_name.trim(),
        username: formData.username,
        gender: formData.gender,
        age_bracket: formData.age_bracket,
        county: formData.county,
        ward: formData.ward || "",
        voter_card: formData.voter_card,
        will_vote: formData.will_vote,
        password: formData.password,
        political_party: formData.political_party || "Undecided",
        employment_status: formData.employment_status || "Prefer not to say",
      };

      const response = await API.post("/users/register", submitData);

      if (response.data.success) {
        toast.success(`Welcome ${formData.real_name.split(" ")[0]}!`);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (err) {
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
          <p>Register to participate in democracy</p>
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

            {/* Username */}
            <Label>
              <AtSign size={16} /> Username *
            </Label>
            <InputWrapper>
              <InputIcon>
                <AtSign size={18} />
              </InputIcon>
              <Input
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                hasIcon
                error={usernameAvailable === false}
              />
            </InputWrapper>
            {formData.username?.length >= 3 && (
              <UsernameStatus
                status={
                  usernameAvailable === true
                    ? "available"
                    : usernameAvailable === false
                      ? "taken"
                      : null
                }
              >
                {checkingUsername ? (
                  <AlertCircle size={12} />
                ) : usernameAvailable === true ? (
                  <CheckCircle size={12} />
                ) : usernameAvailable === false ? (
                  <XCircle size={12} />
                ) : null}
                {checkingUsername
                  ? "Checking..."
                  : usernameAvailable === true
                    ? "Username available!"
                    : usernameAvailable === false
                      ? "Username taken"
                      : ""}
              </UsernameStatus>
            )}

            <Grid>
              <div>
                <Label>Gender *</Label>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Male">👨 Male</option>
                  <option value="Female">👩 Female</option>
                  <option value="Other">🌈 Other</option>
                </Select>
              </div>
              <div>
                <Label>
                  <Calendar size={14} /> Age Bracket *
                </Label>
                <Select
                  name="age_bracket"
                  value={formData.age_bracket}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="18-25">🌟 18-25 (Gen Z)</option>
                  <option value="26-35">💪 26-35 (Millennial)</option>
                  <option value="36-45">📊 36-45 (Gen X)</option>
                  <option value="46-55">🏆 46-55</option>
                  <option value="56+">👑 56+</option>
                </Select>
              </div>
            </Grid>

            <Grid>
              <div>
                <Label>
                  <MapPin size={14} /> County *
                </Label>
                <Select
                  name="county"
                  value={formData.county}
                  onChange={handleChange}
                >
                  <option value="">Select county</option>
                  {CountyList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>
                  <MapPin size={14} /> Ward
                </Label>
                <Input
                  name="ward"
                  placeholder="Your ward/constituency"
                  value={formData.ward}
                  onChange={handleChange}
                />
              </div>
            </Grid>

            <Grid>
              <div>
                <Label>
                  <ShieldCheck size={14} /> Voter's Card? *
                </Label>
                <Select
                  name="voter_card"
                  value={formData.voter_card}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Yes">✅ Yes, registered</option>
                  <option value="No">❌ Not registered</option>
                </Select>
              </div>
              <div>
                <Label>
                  <ClipboardList size={14} /> Will you vote? *
                </Label>
                <Select
                  name="will_vote"
                  value={formData.will_vote}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Yes">✅ Yes</option>
                  <option value="No">❌ No</option>
                  <option value="Not Sure">🤔 Not sure</option>
                </Select>
              </div>
            </Grid>

            {/* NEW: Political Affiliation */}
            <Label>
              <Flag size={14} /> Political Party
            </Label>
            <Select
              name="political_party"
              value={formData.political_party}
              onChange={handleChange}
            >
              <option value="">Select political affiliation</option>
              {PoliticalParties.map((party) => (
                <option key={party} value={party}>
                  {party}
                </option>
              ))}
            </Select>

            {/* NEW: Employment Status */}
            <Label>
              <Briefcase size={14} /> Employment Status
            </Label>
            <Select
              name="employment_status"
              value={formData.employment_status}
              onChange={handleChange}
            >
              <option value="">Select employment status</option>
              {EmploymentStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>

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
              {loading ? (
                "Creating..."
              ) : (
                <>
                  Join Siasa-Hub
                  <UserPlus size={20} />
                </>
              )}
            </SubmitBtn>
          </Section>
        </form>
      </FormCard>
    </PageWrapper>
  );
};

export default RegistrationPage;
