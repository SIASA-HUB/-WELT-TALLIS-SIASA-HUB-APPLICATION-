// RegisterAspirant.jsx - Complete Version with All Leadership Positions
// FIXED: Properly detects success from backend response
// FIXED: Image upload persistence and preview reliability
// FIXED: Back button moved to bottom for cleaner UX

import React, { useState, useRef } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import {
  User,
  ShieldCheck,
  MapPin,
  Lock,
  Upload,
  Plus,
  Trash2,
  ArrowLeft,
  LogIn,
  Type,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Camera,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import api from "../../api/api";

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: 'Outfit', sans-serif;
    background: linear-gradient(135deg, #f5f7fa 0%, #e9edf2 100%);
    min-height: 100vh;
  }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(187, 0, 0, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(187, 0, 0, 0); }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
`;

const FormCard = styled.div`
  background: white;
  width: 100%;
  max-width: 900px;
  border-radius: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: ${slideIn} 0.5s ease-out;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #0f2b4d 0%, #1e3c72 100%);
  padding: 32px 32px 24px;
  text-align: center;
  position: relative;
  color: white;
  
  h2 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #fff, #e0e7ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  p {
    font-size: 14px;
    opacity: 0.8;
    margin-top: 8px;
  }
`;

const TopNav = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 40px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
`;

const StepDot = styled.div`
  width: 60px;
  height: 4px;
  border-radius: 4px;
  background: ${props => props.active ? "#bb0000" : "rgba(255, 255, 255, 0.2)"};
  transition: all 0.3s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${props => props.active ? "#bb0000" : "rgba(255, 255, 255, 0.2)"};
    border: 2px solid ${props => props.active ? "#fff" : "transparent"};
    opacity: ${props => props.active ? 1 : 0};
    transition: all 0.3s ease;
  }
`;

const ContentArea = styled.div`
  padding: 32px;
  max-height: 65vh;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #1e3c72;
    border-radius: 10px;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
  margin-top: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  span {
    color: #ef4444;
    margin-left: 2px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: ${(props) => (props.hasIcon ? "14px 14px 14px 44px" : "14px 16px")};
  background: #f8fafc;
  border: 2px solid ${props => props.error ? "#ef4444" : "#e2e8f0"};
  border-radius: 16px;
  font-size: 14px;
  color: #1e293b;
  transition: all 0.2s;
  
  &::placeholder {
    color: #94a3b8;
  }
  
  &:focus {
    border-color: #1e3c72;
    background: white;
    outline: none;
    box-shadow: 0 0 0 3px rgba(30, 60, 114, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  background: #f8fafc;
  border: 2px solid ${props => props.error ? "#ef4444" : "#e2e8f0"};
  border-radius: 16px;
  color: #1e293b;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:focus {
    border-color: #1e3c72;
    outline: none;
    box-shadow: 0 0 0 3px rgba(30, 60, 114, 0.1);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  display: flex;
  align-items: center;
`;

const ErrorText = styled.span`
  font-size: 11px;
  color: #ef4444;
  margin-top: 4px;
  display: block;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: #1e3c72;
  margin: 24px 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &::before {
    content: '';
    width: 4px;
    height: 20px;
    background: #bb0000;
    border-radius: 4px;
  }
`;

const ImageUploadArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 24px;
  border: 2px dashed #cbd5e1;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    border-color: #1e3c72;
    background: #f1f5f9;
  }
`;

const ImagePreview = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .camera-icon {
    position: absolute;
    bottom: 0;
    right: 0;
    background: #1e3c72;
    border-radius: 50%;
    padding: 8px;
    color: white;
  }
`;

const TagItem = styled.div`
  background: #f8fafc;
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  gap: 12px;
  border: 1px solid #e2e8f0;
  animation: ${fadeIn} 0.3s ease;
  
  textarea {
    flex: 1;
    padding: 12px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    color: #1e293b;
    font-family: inherit;
    font-size: 14px;
    resize: vertical;
    min-height: 70px;
    
    &:focus {
      outline: none;
      border-color: #1e3c72;
    }
  }
  
  button {
    background: none;
    border: none;
    color: #ef4444;
    cursor: pointer;
    padding: 8px;
    border-radius: 12px;
    transition: all 0.2s;
    
    &:hover {
      background: #fee2e2;
    }
  }
`;

const AddButton = styled.button`
  width: 100%;
  padding: 12px;
  background: white;
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  color: #1e3c72;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #1e3c72;
    background: #f8fafc;
  }
`;

const SocialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const BottomButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  padding: 24px 32px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
`;

const SecondaryButton = styled.button`
  flex: 1;
  padding: 14px;
  background: white;
  color: #1e3c72;
  border: 2px solid #1e3c72;
  border-radius: 16px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #eff6ff;
    transform: translateY(-1px);
  }
`;

const PrimaryButton = styled.button`
  flex: 2;
  padding: 14px;
  background: linear-gradient(135deg, #1e3c72, #2a4a8a);
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -5px rgba(30, 60, 114, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  flex: 2;
  padding: 16px;
  background: linear-gradient(135deg, #bb0000, #e11d48);
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
  animation: ${pulseGlow} 2s infinite;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.05);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    animation: none;
  }
`;

const CountyList = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta",
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru",
  "Tharaka Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua",
  "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot",
  "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo Marakwet", "Nandi",
  "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho",
  "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya",
  "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi",
];

const LeadershipPositions = [
  "President",
  "Deputy President",
  "Governor",
  "Senator",
  "Member of Parliament (MP)",
  "Women Representative (Women Rep)",
  "Member of County Assembly (MCA)"
];

const RegisterAspirant = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    party: "",
    slogan: "",
    position: "",
    county: "",
    constituency: "",
    ward: "",
    experience: [""],
    education: [""],
    facebook: "",
    twitter: "",
    linkedin: "",
    instagram: "",
    website: "",
  });

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Full name is required";
      if (!formData.password || formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
      if (!formData.position) newErrors.position = "Please select a position";
      if (!formData.county) newErrors.county = "Please select a county";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleTagChange = (type, index, value) => {
    const updated = [...formData[type]];
    updated[index] = value;
    setFormData(prev => ({ ...prev, [type]: updated }));
  };

  const addTag = (type) => {
    setFormData(prev => ({ ...prev, [type]: [...prev[type], ""] }));
  };

  const removeTag = (type, index) => {
    if (formData[type].length === 1) return;
    const updated = formData[type].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [type]: updated }));
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => Math.min(prev + 1, 3));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error("Please fill all required fields");
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async () => {
    if (loading) return;

    // Final validation
    if (!formData.name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!formData.position) {
      toast.error("Please select the position you are vying for");
      return;
    }
    if (!formData.county) {
      toast.error("Please select your county");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creating your aspirant profile...");

    try {
      const submitData = new FormData();

      // Required fields
      submitData.append("name", formData.name.trim());
      submitData.append("password", formData.password);
      submitData.append("position", formData.position);
      submitData.append("county", formData.county);

      // Optional fields
      if (formData.email) submitData.append("email", formData.email.trim());
      if (formData.party) submitData.append("party", formData.party.trim());
      if (formData.slogan) submitData.append("slogan", formData.slogan.trim());
      if (formData.constituency) submitData.append("constituency", formData.constituency.trim());
      if (formData.ward) submitData.append("ward", formData.ward.trim());
      if (imageFile) submitData.append("image", imageFile);

      // Arrays as JSON
      const validExperience = formData.experience.filter(exp => exp && exp.trim());
      const validEducation = formData.education.filter(edu => edu && edu.trim());

      if (validExperience.length) submitData.append("experience", JSON.stringify(validExperience));
      if (validEducation.length) submitData.append("education", JSON.stringify(validEducation));

      // Social links
      if (formData.facebook) submitData.append("facebook", formData.facebook.trim());
      if (formData.twitter) submitData.append("twitter", formData.twitter.trim());
      if (formData.linkedin) submitData.append("linkedin", formData.linkedin.trim());
      if (formData.instagram) submitData.append("instagram", formData.instagram.trim());
      if (formData.website) submitData.append("website", formData.website.trim());

      const response = await api.post("/leaders/register", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000
      });

      const resData = response;
      console.log("Server response:", resData);

      const isSuccess = resData?.success === true ||
        resData?.status === "success" ||
        resData?.data?.success === true;

      const successMessage = resData?.message || resData?.data?.message || "Registration successful! Please login.";

      if (isSuccess) {
        const leaderData = resData.data;
        const token = leaderData.token;

        // Store auth data for auto-login
        localStorage.setItem("leader_token", token);
        localStorage.setItem("token", token);
        localStorage.setItem("leader_id", leaderData.leader_id);
        localStorage.setItem("user_data", JSON.stringify(leaderData));
        localStorage.setItem("leaderData", JSON.stringify(leaderData));
        
        toast.update(toastId, {
          render: "Registration successful! Redirecting to your dashboard...",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        setTimeout(() => {
          navigate("/aspirant-dashboard");
        }, 1500);
      } else {
        const errorMsg = resData?.message || response?.data?.message || "Registration failed. Please try again.";
        toast.update(toastId, {
          render: errorMsg,
          type: "error",
          isLoading: false,
          autoClose: 4000,
        });
      }

    } catch (err) {
      console.error("Registration error:", err);
      let errorMessage = "Registration failed. Please check your connection and try again.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      toast.update(toastId, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <GlobalStyle />
      <ToastContainer position="top-center" theme="dark" closeOnClick />

      <FormCard>
        <Header>
          <TopNav>
            <button onClick={() => navigate("/login-aspirant")}>
              <ArrowLeft size={16} /> Back to Login
            </button>
            <button onClick={() => navigate("/login-aspirant")}>
              <LogIn size={16} /> Login
            </button>
          </TopNav>

          <h2>🏛️ Aspirant Registration</h2>
          <p>Join the movement. Lead with integrity.</p>

          <StepIndicator>
            <StepDot active={step >= 1} />
            <StepDot active={step >= 2} />
            <StepDot active={step >= 3} />
          </StepIndicator>
        </Header>

        <ContentArea>
          {step === 1 && (
            <div>
              <SectionTitle>Account & Personal Info</SectionTitle>
              <Grid>
                <div>
                  <Label>Full Name <span>*</span></Label>
                  <InputWrapper>
                    <InputIcon><User size={18} /></InputIcon>
                    <Input
                      name="name"
                      placeholder="Your official name"
                      value={formData.name}
                      onChange={handleChange}
                      hasIcon
                      error={errors.name}
                    />
                  </InputWrapper>
                  {errors.name && <ErrorText>{errors.name}</ErrorText>}
                </div>
                <div>
                  <Label>Password <span>*</span></Label>
                  <InputWrapper>
                    <InputIcon><Lock size={18} /></InputIcon>
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Min. 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      hasIcon
                      error={errors.password}
                    />
                  </InputWrapper>
                  {errors.password && <ErrorText>{errors.password}</ErrorText>}
                </div>
              </Grid>

              <Label>Email Address</Label>
              <InputWrapper>
                <InputIcon><LogIn size={18} /></InputIcon>
                <Input
                  type="email"
                  name="email"
                  placeholder="aspirant@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  hasIcon
                />
              </InputWrapper>

              <Label>Campaign Slogan</Label>
              <InputWrapper>
                <InputIcon><Type size={18} /></InputIcon>
                <Input
                  name="slogan"
                  placeholder="e.g., Together We Rise"
                  value={formData.slogan}
                  onChange={handleChange}
                  hasIcon
                />
              </InputWrapper>

              <Grid>
                <div>
                  <Label>Vying For <span>*</span></Label>
                  <Select name="position" value={formData.position} onChange={handleChange} error={errors.position}>
                    <option value="">Select Position</option>
                    {LeadershipPositions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </Select>
                  {errors.position && <ErrorText>{errors.position}</ErrorText>}
                </div>
                <div>
                  <Label>Political Party</Label>
                  <InputWrapper>
                    <InputIcon><ShieldCheck size={18} /></InputIcon>
                    <Input
                      name="party"
                      placeholder="Party affiliation"
                      value={formData.party}
                      onChange={handleChange}
                      hasIcon
                    />
                  </InputWrapper>
                </div>
              </Grid>

              <Grid>
                <div>
                  <Label>County <span>*</span></Label>
                  <Select name="county" value={formData.county} onChange={handleChange} error={errors.county}>
                    <option value="">Select County</option>
                    {CountyList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                  {errors.county && <ErrorText>{errors.county}</ErrorText>}
                </div>
                <div>
                  <Label>Constituency</Label>
                  <InputWrapper>
                    <InputIcon><MapPin size={18} /></InputIcon>
                    <Input
                      name="constituency"
                      placeholder="Your constituency"
                      value={formData.constituency}
                      onChange={handleChange}
                      hasIcon
                    />
                  </InputWrapper>
                </div>
              </Grid>

              <Label>Ward</Label>
              <InputWrapper>
                <InputIcon><MapPin size={18} /></InputIcon>
                <Input
                  name="ward"
                  placeholder="Your electoral ward"
                  value={formData.ward}
                  onChange={handleChange}
                  hasIcon
                />
              </InputWrapper>
            </div>
          )}

          {step === 2 && (
            <div>
              <SectionTitle>Campaign Photo</SectionTitle>
              <ImageUploadArea onClick={() => fileInputRef.current?.click()}>
                <ImagePreview>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" />
                  ) : (
                    <Camera size={48} color="#94a3b8" />
                  )}
                  <div className="camera-icon">
                    <Camera size={16} />
                  </div>
                </ImagePreview>
                <span style={{ fontWeight: 500, color: "#1e3c72" }}>
                  {imageFile ? "Change Photo" : "Upload Campaign Photo"}
                </span>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  JPEG, PNG or GIF. Max 5MB
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </ImageUploadArea>

              <SectionTitle>Political Experience</SectionTitle>
              {formData.experience.map((exp, i) => (
                <TagItem key={i}>
                  <textarea
                    value={exp}
                    onChange={(e) => handleTagChange("experience", i, e.target.value)}
                    placeholder="Describe your experience in politics or community service..."
                    rows={2}
                  />
                  <button type="button" onClick={() => removeTag("experience", i)}>
                    <Trash2 size={18} />
                  </button>
                </TagItem>
              ))}
              <AddButton type="button" onClick={() => addTag("experience")}>
                <Plus size={16} /> Add More Experience
              </AddButton>

              <SectionTitle>Education Background</SectionTitle>
              {formData.education.map((edu, i) => (
                <TagItem key={i}>
                  <textarea
                    value={edu}
                    onChange={(e) => handleTagChange("education", i, e.target.value)}
                    placeholder="List your educational qualifications..."
                    rows={2}
                  />
                  <button type="button" onClick={() => removeTag("education", i)}>
                    <Trash2 size={18} />
                  </button>
                </TagItem>
              ))}
              <AddButton type="button" onClick={() => addTag("education")}>
                <Plus size={16} /> Add More Education
              </AddButton>
            </div>
          )}

          {step === 3 && (
            <div>
              <SectionTitle>Digital Presence</SectionTitle>
              <SocialGrid>
                <InputWrapper>
                  <InputIcon><Facebook size={16} /></InputIcon>
                  <Input name="facebook" placeholder="Facebook profile URL" value={formData.facebook} onChange={handleChange} hasIcon />
                </InputWrapper>
                <InputWrapper>
                  <InputIcon><Twitter size={16} /></InputIcon>
                  <Input name="twitter" placeholder="Twitter/X profile URL" value={formData.twitter} onChange={handleChange} hasIcon />
                </InputWrapper>
                <InputWrapper>
                  <InputIcon><Linkedin size={16} /></InputIcon>
                  <Input name="linkedin" placeholder="LinkedIn profile URL" value={formData.linkedin} onChange={handleChange} hasIcon />
                </InputWrapper>
                <InputWrapper>
                  <InputIcon><Instagram size={16} /></InputIcon>
                  <Input name="instagram" placeholder="Instagram profile URL" value={formData.instagram} onChange={handleChange} hasIcon />
                </InputWrapper>
              </SocialGrid>

              <Label>Official Website</Label>
              <InputWrapper>
                <InputIcon><Globe size={16} /></InputIcon>
                <Input name="website" placeholder="https://yourcampaign.com" value={formData.website} onChange={handleChange} hasIcon />
              </InputWrapper>

              <div style={{ marginTop: "32px", padding: "16px", background: "#f0fdf4", borderRadius: "16px", border: "1px solid #bbf7d0" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <CheckCircle size={24} color="#16a34a" />
                  <div>
                    <strong style={{ color: "#166534" }}>Ready to submit?</strong>
                    <p style={{ fontSize: "13px", color: "#166534", marginTop: "4px" }}>
                      Review your information before completing registration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ContentArea>

        <BottomButtonContainer>
          {step > 1 && (
            <SecondaryButton type="button" onClick={prevStep}>
              <ChevronLeft size={18} /> Back
            </SecondaryButton>
          )}

          {step < 3 ? (
            <PrimaryButton type="button" onClick={nextStep}>
              Continue <ChevronRight size={18} />
            </PrimaryButton>
          ) : (
            <SubmitButton type="button" onClick={handleFinalSubmit} disabled={loading}>
              {loading ? "⏳ Processing..." : "✓ Complete Registration"}
              {!loading && <CheckCircle size={18} />}
            </SubmitButton>
          )}
        </BottomButtonContainer>
      </FormCard>
    </PageWrapper>
  );
};

export default RegisterAspirant;