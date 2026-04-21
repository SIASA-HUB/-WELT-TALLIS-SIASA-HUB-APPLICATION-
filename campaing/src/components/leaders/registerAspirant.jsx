// RegisterAspirant.jsx - Complete Version with All Leadership Positions

import React, { useState } from "react";
import axios from "axios";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import {
  User,
  ShieldCheck,
  MapPin,
  Lock,
  Briefcase,
  Users,
  Upload,
  Plus,
  Trash2,
  ArrowLeft,
  LogIn,
  Type,
  Award,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Smartphone,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
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
  
  h2 {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    color: white;
    letter-spacing: -0.5px;
  }
  p {
    margin: 6px 0 0;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
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
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
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
  
  option {
    background: white;
    color: #1e293b;
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

const SubmitBtn = PrimaryButton;

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

const AddButton = SecondaryButton;

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
    transition: all 0.2s;
    
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

// Complete list of all leadership positions
const LeadershipPositions = [
  "President",
  "Deputy President",     // Added Deputy President
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

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step < 3) {
      nextStep();
      return;
    }

    // Validation checks - eased
    if (!formData.name) {
      // toast.error("Name is required");
      // return;
    }
    // ... remaining checks also eased

    setLoading(true);
    const toastId = toast.loading("Creating your account...");

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("password", formData.password);
      if (formData.party) submitData.append("party", formData.party);
      if (formData.slogan) submitData.append("slogan", formData.slogan);
      submitData.append("position", formData.position);
      submitData.append("county", formData.county);
      if (formData.constituency) submitData.append("constituency", formData.constituency);
      if (formData.ward) submitData.append("ward", formData.ward);
      if (formData.image) submitData.append("image", formData.image);

      const validExperience = formData.experience.filter((exp) => exp.trim());
      const validEducation = formData.education.filter((edu) => edu.trim());

      if (validExperience.length > 0) {
        submitData.append("experience", JSON.stringify(validExperience));
      }
      if (validEducation.length > 0) {
        submitData.append("education", JSON.stringify(validEducation));
      }

      if (formData.facebook) submitData.append("facebook", formData.facebook);
      if (formData.twitter) submitData.append("twitter", formData.twitter);
      if (formData.linkedin) submitData.append("linkedin", formData.linkedin);
      if (formData.instagram) submitData.append("instagram", formData.instagram);
      if (formData.website) submitData.append("website", formData.website);

      const response = await api.post("/leaders/register", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000
      });

      console.log("Full response:", response);

      if (response && response.success === true) {
        toast.update(toastId, {
          render: response.message || "Registration successful! Please login.",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        setTimeout(() => {
          navigate("/login-aspirant");
        }, 2000);
      } else {
        toast.update(toastId, {
          render: response?.message || "Registration failed. Please try again.",
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
            style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)" }}
          >
            {step > 1 ? <ChevronLeft size={18} /> : <ArrowLeft size={18} />}
          </NavButton>

          <h2>Aspirant Journey</h2>
          <p>
            {step === 1 && "Start your leadership profile"}
            {step === 2 && "Define your electoral impact"}
            {step === 3 && "Showcase your vision & credentials"}
          </p>
        </Header>

        <StepIndicator>
          <StepDot active={step >= 1} />
          <StepDot active={step >= 2} />
          <StepDot active={step >= 3} />
        </StepIndicator>

        <form 
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (step < 3) nextStep();
            }
          }}
        >
          <Section>
            {step === 1 && (
              <div className="animate-in">
                <SectionTitle>Account & Personal Info</SectionTitle>
                <Grid>
                  <div>
                    <Label>Full Name</Label>
                    <InputWrapper>
                      <InputIcon><User size={18} /></InputIcon>
                      <Input
                        name="name"
                        placeholder="Official Name"
                        value={formData.name}
                        onChange={handleChange}
                        hasIcon
                      />
                    </InputWrapper>
                  </div>
                  <div>
                    <Label>Password</Label>
                    <InputWrapper>
                      <InputIcon><Lock size={18} /></InputIcon>
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Secure Password"
                        value={formData.password}
                        onChange={handleChange}
                        hasIcon
                      />
                    </InputWrapper>
                  </div>
                </Grid>

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
                    <Label>Vying For (Position)</Label>
                    <Select name="position" value={formData.position} onChange={handleChange}>
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
              <div className="animate-in">
                <SectionTitle>Electoral Area Details</SectionTitle>
                <Grid>
                  <div>
                    <Label>County</Label>
                    <Select name="county" value={formData.county} onChange={handleChange}>
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
              </div>
            )}

            {step === 3 && (
              <div className="animate-in">
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
                      <button type="button" onClick={() => removeTag("experience", i)} style={{ background: "none", border: "none", color: "#ef4444" }}>
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
                      <button type="button" onClick={() => removeTag("education", i)} style={{ background: "none", border: "none", color: "#ef4444" }}>
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
              <PrimaryButton type="submit" disabled={loading}>
                {loading ? "Finalizing Profile..." : "Complete Registration"}
                {!loading && <CheckCircle size={20} />}
              </PrimaryButton>
            )}
          </ButtonContainer>
        </form>
      </FormCard>
    </PageWrapper>
  );
};

export default RegisterAspirant;
