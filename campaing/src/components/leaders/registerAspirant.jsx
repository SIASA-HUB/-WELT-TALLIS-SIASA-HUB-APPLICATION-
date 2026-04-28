// RegisterAspirant.jsx - Complete Version with All Leadership Positions
// FIXED: Properly detects success from backend response
// NO auto-registration - ONLY manual button click submits

import React, { useState } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import api from "../../api/api";

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
  body {
    margin: 0;
    padding: 0;
    font-family: 'Outfit', sans-serif;
    background-color: #f8fafc;
  }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const vibratePulse = keyframes`
  0%, 100% { box-shadow: 0 6px 24px rgba(187, 0, 0, 0.45), 0 0 0 0 rgba(187, 0, 0, 0.35); }
  50% { box-shadow: 0 8px 32px rgba(187, 0, 0, 0.65), 0 0 0 10px rgba(187, 0, 0, 0); }
`;

const PageWrapper = styled.div`
  background: #f8fafc;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0px;
  color: #1e293b;
`;

const FormCard = styled.div`
  background: white;
  width: 100%;
  max-width: 800px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${slideIn} 0.6s cubic-bezier(0.16, 1, 0.3, 1);
`;

const Header = styled.div`
  background: #1e3c72;
  padding: 30px;
  text-align: center;
  position: relative;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    color: white;
    letter-spacing: -0.5px;
    flex: 1;
    text-align: center;
  }
`;

const NavButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
  z-index: 2;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 0 30px 30px;
`;

const StepDot = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: ${props => props.active ? "#bb0000" : "rgba(255, 255, 255, 0.1)"};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.active ? "0 0 15px rgba(187, 0, 0, 0.5)" : "none"};
`;

const Section = styled.div`
  padding: 30px;
  flex: 1;
`;

const Label = styled.label`
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 8px;
  margin-top: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: ${(props) => (props.hasIcon ? "14px 14px 14px 46px" : "14px 16px")};
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  font-size: 15px;
  color: #1e293b;
  transition: all 0.3s;
  
  &::placeholder {
    color: #94a3b8;
  }
  
  &:focus {
    border-color: #1e3c72;
    outline: none;
    box-shadow: 0 0 0 4px rgba(30, 60, 114, 0.05);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  color: #1e293b;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:focus {
    border-color: #1e3c72;
    outline: none;
    box-shadow: 0 0 0 4px rgba(30, 60, 114, 0.05);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  display: flex;
  align-items: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  padding: 30px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
`;

const PrimaryButton = styled.button`
  flex: 1;
  padding: 16px;
  background: #1e3c72;
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s;
  
  &:hover:not(:disabled) {
    background: #2a4a8a;
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(30, 60, 114, 0.2);
  }
  
  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;

const VibrantSubmitButton = styled.button`
  flex: 1;
  padding: 18px;
  background: linear-gradient(135deg, #bb0000 0%, #e11d48 50%, #bb0000 100%);
  background-size: 200% 100%;
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 900;
  font-size: 17px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  letter-spacing: 0.5px;
  animation: ${vibratePulse} 2s ease-in-out infinite;
  transition: all 0.3s ease;
  text-transform: uppercase;

  &:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    background-position: right center;
  }

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    animation: none;
    box-shadow: none;
  }
`;

const SecondaryButton = styled.button`
  padding: 16px 24px;
  background: white;
  color: #1e3c72;
  border: 1.5px solid #1e3c72;
  border-radius: 16px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const FileInputLabel = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  border: 2px dashed #e2e8f0;
  border-radius: 20px;
  cursor: pointer;
  background: #f8fafc;
  justify-content: center;
  transition: all 0.3s;
  color: #64748b;
  
  &:hover {
    background: #f1f5f9;
    border-color: #1e3c72;
    color: #1e3c72;
  }

  .preview {
    width: 120px;
    height: 120px;
    border-radius: 60px;
    object-fit: cover;
    margin-bottom: 10px;
    border: 2px solid #bb0000;
    box-shadow: 0 0 20px rgba(187, 0, 0, 0.3);
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
  animation: ${slideIn} 0.3s ease;
  
  textarea {
    flex: 1;
    padding: 12px;
    background: white;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    color: #1e293b;
    font-family: inherit;
    font-size: 14px;
    resize: none;
    
    &:focus {
      outline: none;
      border-color: #1e3c72;
    }
  }
`;

const SectionTitle = styled.h3`
  font-size: 12px;
  font-weight: 800;
  color: #1e3c72;
  margin: 10px 0 25px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, #e2e8f0, transparent);
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
    image: null,
    experience: [""],
    education: [""],
    facebook: "",
    twitter: "",
    linkedin: "",
    instagram: "",
    website: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error("File size should be less than 5MB");
          return;
        }
        if (!file.type.startsWith("image/")) {
          toast.error("Please upload an image file");
          return;
        }
        setFormData({ ...formData, image: file });
        setImagePreview(URL.createObjectURL(file));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTagChange = (type, index, value) => {
    const updated = [...formData[type]];
    updated[index] = value;
    setFormData({ ...formData, [type]: updated });
  };

  const addTag = (type) => {
    setFormData({ ...formData, [type]: [...formData[type], ""] });
  };

  const removeTag = (type, index) => {
    const updated = formData[type].filter((_, i) => i !== index);
    setFormData({ ...formData, [type]: updated });
  };

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = async () => {
    if (loading) return;

    // Validation
    if (!formData.name || !formData.name.trim()) {
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
    const toastId = toast.loading("Creating your account...");

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name.trim());
      if (formData.email) submitData.append("email", formData.email.trim());
      submitData.append("password", formData.password);
      if (formData.party) submitData.append("party", formData.party.trim());
      if (formData.slogan) submitData.append("slogan", formData.slogan.trim());
      submitData.append("position", formData.position);
      submitData.append("county", formData.county);
      if (formData.constituency) submitData.append("constituency", formData.constituency.trim());
      if (formData.ward) submitData.append("ward", formData.ward.trim());
      if (formData.image) submitData.append("image", formData.image);

      const validExperience = formData.experience.filter((exp) => exp && exp.trim());
      const validEducation = formData.education.filter((edu) => edu && edu.trim());

      if (validExperience.length) {
        submitData.append("experience", JSON.stringify(validExperience));
      }
      if (validEducation.length) {
        submitData.append("education", JSON.stringify(validEducation));
      }

      if (formData.facebook) submitData.append("facebook", formData.facebook.trim());
      if (formData.twitter) submitData.append("twitter", formData.twitter.trim());
      if (formData.linkedin) submitData.append("linkedin", formData.linkedin.trim());
      if (formData.instagram) submitData.append("instagram", formData.instagram.trim());
      if (formData.website) submitData.append("website", formData.website.trim());

      const response = await api.post("/leaders/register", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000
      });

      // ========== IMPROVED RESPONSE HANDLING ==========
      // Extract safely (prevents undefined crashes)
      // NOTE: Our interceptor in api.js returns response.data directly.
      const resData = response;

      console.log("Processed response data:", resData);

      // Normalize success check (STRICT + SAFE)
      // Check both top-level and nested success flags
      const isSuccess = 
        resData?.success === true || 
        resData?.status === "success" ||
        resData?.data?.success === true;

      // Get message safely
      const successMessage =
        resData?.message ||
        resData?.data?.message ||
        "Registration successful! Please login.";

      if (isSuccess) {
        toast.update(toastId, {
          render: successMessage,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        setTimeout(() => {
          navigate("/login-aspirant");
        }, 2000);
      } else {
        // Failure case
        const errorMsg =
          resData?.message ||
          response?.data?.message ||
          resData?.error ||
          response?.data?.error ||
          "Registration failed. Please try again.";

        toast.update(toastId, {
          render: errorMsg,
          type: "error",
          isLoading: false,
          autoClose: 4000,
        });
      }


    } catch (err) {
      console.error("Registration error:", err);
      let errorMessage = "Registration failed. Please try again.";
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
      <ToastContainer position="top-center" theme="dark" />

      <FormCard>
        <Header>
          <NavButton
            type="button"
            onClick={() => step > 1 ? prevStep() : navigate("/login-aspirant")}
          >
            {step > 1 ? <ChevronLeft size={18} /> : <ArrowLeft size={18} />}
            {step > 1 ? "Back" : "Login"}
          </NavButton>

          <h2>Aspirant Journey</h2>

          <NavButton type="button" onClick={() => navigate("/login-aspirant")}>
            <LogIn size={18} />
            Login
          </NavButton>
        </Header>

        <StepIndicator>
          <StepDot active={step >= 1} />
          <StepDot active={step >= 2} />
          <StepDot active={step >= 3} />
        </StepIndicator>

        <div>
          <Section>
            {step === 1 && (
              <div>
                <SectionTitle>Account & Personal Info</SectionTitle>
                <Grid>
                  <div>
                    <Label>Full Name *</Label>
                    <InputWrapper>
                      <InputIcon><User size={18} /></InputIcon>
                      <Input
                        name="name"
                        placeholder="Official Name"
                        value={formData.name}
                        onChange={handleChange}
                        hasIcon
                        required
                      />
                    </InputWrapper>
                  </div>
                  <div>
                    <Label>Password *</Label>
                    <InputWrapper>
                      <InputIcon><Lock size={18} /></InputIcon>
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Secure Password (min 6 chars)"
                        value={formData.password}
                        onChange={handleChange}
                        hasIcon
                        required
                      />
                    </InputWrapper>
                  </div>
                </Grid>

                <Label>Email Address (For Login & Notifications)</Label>
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
                    placeholder="e.g., Transforming the Future"
                    value={formData.slogan}
                    onChange={handleChange}
                    hasIcon
                  />
                </InputWrapper>

                <Grid>
                  <div>
                    <Label>Vying For (Position) *</Label>
                    <Select name="position" value={formData.position} onChange={handleChange} required>
                      <option value="">Select Position</option>
                      {LeadershipPositions.map((pos) => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Political Party</Label>
                    <InputWrapper>
                      <InputIcon><ShieldCheck size={18} /></InputIcon>
                      <Input
                        name="party"
                        placeholder="Party Affiliation"
                        value={formData.party}
                        onChange={handleChange}
                        hasIcon
                      />
                    </InputWrapper>
                  </div>
                </Grid>
              </div>
            )}

            {step === 2 && (
              <div>
                <SectionTitle>Electoral Area Details</SectionTitle>
                <Grid>
                  <div>
                    <Label>County *</Label>
                    <Select name="county" value={formData.county} onChange={handleChange} required>
                      <option value="">Select County</option>
                      {CountyList.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Constituency</Label>
                    <InputWrapper>
                      <InputIcon><MapPin size={18} /></InputIcon>
                      <Input
                        name="constituency"
                        placeholder="Constituency"
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
                    placeholder="Electoral Ward"
                    value={formData.ward}
                    onChange={handleChange}
                    hasIcon
                  />
                </InputWrapper>

                <SectionTitle style={{ marginTop: "40px" }}>Campaign Media</SectionTitle>
                <FileInputLabel>
                  {imagePreview ? (
                    <img src={imagePreview} className="preview" alt="Preview" />
                  ) : (
                    <Upload size={32} style={{ marginBottom: "10px", color: "rgba(255,255,255,0.2)" }} />
                  )}
                  <span>{formData.image ? "Change Campaign Photo" : "Upload Campaign Photo (Optional)"}</span>
                  <input type="file" hidden name="image" onChange={handleChange} accept="image/*" />
                </FileInputLabel>
                <p style={{ fontSize: "12px", color: "#64748b", marginTop: "8px", textAlign: "center" }}>
                  Photo preview is local – actual upload happens only when you click "Complete Registration"
                </p>
              </div>
            )}

            {step === 3 && (
              <div>
                <SectionTitle>Experience & Impact</SectionTitle>
                <Label>Political Experience</Label>
                {formData.experience.map((exp, i) => (
                  <TagItem key={i}>
                    <textarea
                      value={exp}
                      onChange={(e) => handleTagChange("experience", i, e.target.value)}
                      placeholder="Share your history of community service or political roles..."
                    />
                    {formData.experience.length > 1 && (
                      <button type="button" onClick={() => removeTag("experience", i)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>
                        <Trash2 size={18} />
                      </button>
                    )}
                  </TagItem>
                ))}
                <SecondaryButton type="button" onClick={() => addTag("experience")} style={{ width: "100%", marginBottom: "20px" }}>
                  <Plus size={16} /> Add More Experience
                </SecondaryButton>

                <SectionTitle style={{ marginTop: "40px" }}>Education Background</SectionTitle>
                {formData.education.map((edu, i) => (
                  <TagItem key={i}>
                    <textarea
                      value={edu}
                      onChange={(e) => handleTagChange("education", i, e.target.value)}
                      placeholder="Share your educational qualifications..."
                    />
                    {formData.education.length > 1 && (
                      <button type="button" onClick={() => removeTag("education", i)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>
                        <Trash2 size={18} />
                      </button>
                    )}
                  </TagItem>
                ))}
                <SecondaryButton type="button" onClick={() => addTag("education")} style={{ width: "100%", marginBottom: "20px" }}>
                  <Plus size={16} /> Add More Education
                </SecondaryButton>

                <SectionTitle style={{ marginTop: "40px" }}>Digital Presence</SectionTitle>
                <Grid>
                  <InputWrapper>
                    <InputIcon><Facebook size={16} /></InputIcon>
                    <Input name="facebook" placeholder="Facebook URL" value={formData.facebook} onChange={handleChange} hasIcon />
                  </InputWrapper>
                  <InputWrapper>
                    <InputIcon><Twitter size={16} /></InputIcon>
                    <Input name="twitter" placeholder="Twitter URL" value={formData.twitter} onChange={handleChange} hasIcon />
                  </InputWrapper>
                </Grid>
                <div style={{ marginTop: "16px" }}>
                  <InputWrapper>
                    <InputIcon><Globe size={16} /></InputIcon>
                    <Input name="website" placeholder="Official Website URL" value={formData.website} onChange={handleChange} hasIcon />
                  </InputWrapper>
                </div>
              </div>
            )}
          </Section>

          <ButtonContainer>
            {step < 3 ? (
              <PrimaryButton type="button" onClick={nextStep}>
                Next Step <ChevronRight size={20} />
              </PrimaryButton>
            ) : (
              <VibrantSubmitButton
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
              >
                {loading ? "🔄 Finalizing Profile..." : "🚀 Complete Registration"}
                {!loading && <CheckCircle size={20} />}
              </VibrantSubmitButton>
            )}
          </ButtonContainer>
        </div>
      </FormCard>
    </PageWrapper>
  );
};

export default RegisterAspirant;