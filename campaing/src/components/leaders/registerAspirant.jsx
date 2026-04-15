// RegisterAspirant.jsx - Sleek Dark Theme Registration

import React, { useState } from "react";
import axios from "axios";
import styled, { keyframes } from "styled-components";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import api from "../../api/api";

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const PageWrapper = styled.div`
  background-color: #f8fafc;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  font-family: "Inter", sans-serif;
  padding: 10px 10px;
`;

const FormCard = styled.div`
  background: white;
  width: 100%;
  max-width: 900px;
  border-radius: 24px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  animation: ${slideIn} 0.5s cubic-bezier(0.4, 0, 0.2, 1);
`;

const Header = styled.div`
  background: #1e3c72;
  padding: 30px 40px;
  color: white;
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  .header-content {
    flex: 1;
  }
  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: white;
  }
  p {
    margin: 6px 0 0;
    opacity: 0.8;
    font-size: 13px;
    font-weight: 500;
    color: white;
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
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
`;

const Section = styled.div`
  padding: 25px 30px;

  flex: 1;
  overflow-y: auto;
  max-height: 80vh;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(220, 38, 38, 0.5);
    border-radius: 10px;
  }
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #71717a;
  margin-bottom: 6px;
  margin-top: 16px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
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
  padding: ${(props) => (props.hasIcon ? "12px 14px 12px 42px" : "12px 14px")};
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  color: #1e293b; /* Ensure text visible */
  transition: all 0.2s ease;
  
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
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #1e293b; /* Explicitly set dark text color */
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:focus {
    border-color: #000000;
    outline: none;
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05);
  }
  
  option {
    background: white;
    color: #1e293b;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #52525b;
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 16px;
  background: #1e3c72;
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  margin-top: 32px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: #2a4a8a;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(30, 60, 114, 0.25);
  }
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    opacity: 0.5;
  }
`;

const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  background: #f8fafc;
  justify-content: center;
  transition: all 0.3s;
  color: #64748b;
  
  &:hover {
    background: #f1f5f9;
    border-color: #000000;
    color: #0f172a;
  }
`;

const TagItem = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border-radius: 14px;
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  animation: ${slideIn} 0.3s ease;
  
  textarea {
    flex: 1;
    padding: 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    background: white;
    color: #1e293b;
    font-family: inherit;
    font-size: 14px;
    resize: none;
    transition: all 0.2s;
    
    &:focus {
      outline: none;
      border-color: #000000;
    }
    
    &::placeholder {
      color: #3f3f46;
    }
  }
  
  button {
    background: rgba(239, 68, 68, 0.1);
    border: none;
    color: #ef4444;
    cursor: pointer;
    padding: 8px;
    border-radius: 10px;
    transition: all 0.2s;
    height: fit-content;
    
    &:hover {
      background: rgba(239, 68, 68, 0.2);
      transform: scale(1.05);
    }
  }
`;

const AddButton = styled.button`
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #71717a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
  font-size: 13px;
  font-weight: 600;
  
  &:hover {
    background: rgba(220, 38, 38, 0.05);
    border-color: #dc2626;
    color: #ef4444;
  }
`;

const SectionTitle = styled.h3`
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
  margin: 40px 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-left: 4px solid #000000;
  padding: 6px 16px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  background: #f1f5f9;
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

const RegisterAspirant = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Name is required");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!formData.position) {
      toast.error("Position is required");
      return;
    }
    if (!formData.county) {
      toast.error("County is required");
      return;
    }

    setLoading(true);
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

      const response = await api.post(
        "/leaders/register",
        submitData,
        { 
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 45000 
        }
      );

      if (response.data.success) {
        toast.success("Account created successfully! Please login.");
        setTimeout(() => navigate("/login-aspirant"), 2000);
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <ToastContainer position="top-center" theme="dark" />
      <FormCard>
        <Header>
          <NavButton onClick={() => navigate("/leaders")}>
            <ArrowLeft size={16} /> Back
          </NavButton>
          <div className="header-content">
            <h2>Aspirant Registration</h2>
      
          </div>
          <NavButton onClick={() => navigate("/login-aspirant")}>
            <LogIn size={16} /> Login
          </NavButton>
        </Header>

        <form onSubmit={handleSubmit}>
          <Section>
            <SectionTitle>
              <Users size={14} /> Personal & Campaign Info
            </SectionTitle>

            <Grid>
              <div>
                <Label>Full Name *</Label>
                <InputWrapper>
                  <InputIcon>
                    <User size={16} />
                  </InputIcon>
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
                <Label>Password *</Label>
                <InputWrapper>
                  <InputIcon>
                    <Lock size={16} />
                  </InputIcon>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    hasIcon
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#6b7280",
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                </InputWrapper>
              </div>
            </Grid>

            <Label>Campaign Slogan</Label>
            <Input
              name="slogan"
              placeholder="e.g., Leadership for Change"
              value={formData.slogan}
              onChange={handleChange}
            />

            <Grid>
              <div>
                <Label>Vying For (Position) *</Label>
                <Select name="position" value={formData.position} onChange={handleChange}>
                  <option value="">Select Position</option>
                  <option value="President">President</option>
                  <option value="Governor">Governor</option>
                  <option value="Senator">Senator</option>
                  <option value="MP">Member of Parliament</option>
                  <option value="Women Rep">Women Representative</option>
                  <option value="MCA">MCA</option>
                </Select>
              </div>
              <div>
                <Label>Political Party</Label>
                <Input
                  name="party"
                  placeholder="Party Name"
                  value={formData.party}
                  onChange={handleChange}
                />
              </div>
            </Grid>

            <SectionTitle>
              <MapPin size={14} /> Electoral Area
            </SectionTitle>
            <Grid>
              <div>
                <Label>County *</Label>
                <Select name="county" value={formData.county} onChange={handleChange}>
                  <option value="">Select County</option>
                  {CountyList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Constituency</Label>
                <Input
                  name="constituency"
                  placeholder="Constituency"
                  value={formData.constituency}
                  onChange={handleChange}
                />
              </div>
            </Grid>
            <Label>Ward</Label>
            <Input
              name="ward"
              placeholder="Electoral Ward"
              value={formData.ward}
              onChange={handleChange}
            />

            <SectionTitle>
              <Users size={14} /> Social Media & Web
            </SectionTitle>
            <Grid>
              <div>
                <Label>Facebook</Label>
                <Input
                  name="facebook"
                  placeholder="https://facebook.com/yourprofile"
                  value={formData.facebook}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Twitter (X)</Label>
                <Input
                  name="twitter"
                  placeholder="https://twitter.com/yourhandle"
                  value={formData.twitter}
                  onChange={handleChange}
                />
              </div>
            </Grid>
            <Grid>
              <div>
                <Label>LinkedIn</Label>
                <Input
                  name="linkedin"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedin}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Instagram</Label>
                <Input
                  name="instagram"
                  placeholder="https://instagram.com/yourhandle"
                  value={formData.instagram}
                  onChange={handleChange}
                />
              </div>
            </Grid>
            <Label>Website</Label>
            <Input
              name="website"
              placeholder="https://yourwebsite.com"
              value={formData.website}
              onChange={handleChange}
            />

            <SectionTitle>
              <Upload size={14} /> Profile Picture
            </SectionTitle>
            <FileInputLabel>
              <Upload size={16} />
              <span>{formData.image ? formData.image.name : "Upload Campaign Photo"}</span>
              <input type="file" hidden name="image" onChange={handleChange} accept="image/*" />
            </FileInputLabel>

            <SectionTitle>
              <Briefcase size={14} /> Political Experience
            </SectionTitle>
            {formData.experience.map((exp, i) => (
              <TagItem key={i}>
                <textarea
                  value={exp}
                  onChange={(e) => handleTagChange("experience", i, e.target.value)}
                  placeholder="Describe past roles or community work..."
                  rows="2"
                />
                {formData.experience.length > 1 && (
                  <button type="button" onClick={() => removeTag("experience", i)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </TagItem>
            ))}
            <AddButton type="button" onClick={() => addTag("experience")}>
              <Plus size={14} /> Add Experience
            </AddButton>

            <SectionTitle>
              <Briefcase size={14} /> Education Background
            </SectionTitle>
            {formData.education.map((edu, i) => (
              <TagItem key={i}>
                <textarea
                  value={edu}
                  onChange={(e) => handleTagChange("education", i, e.target.value)}
                  placeholder="Describe your educational background..."
                  rows="2"
                />
                {formData.education.length > 1 && (
                  <button type="button" onClick={() => removeTag("education", i)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </TagItem>
            ))}
            <AddButton type="button" onClick={() => addTag("education")}>
              <Plus size={14} /> Add Education
            </AddButton>

            <SubmitBtn type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Aspirant Account"}
            </SubmitBtn>
          </Section>
        </form>
      </FormCard>
    </PageWrapper>
  );
};

export default RegisterAspirant;
