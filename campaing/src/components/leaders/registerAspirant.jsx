// RegisterAspirant.jsx - Fixed Main Registration

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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// API Configuration
const API_BASE_URL = "http://localhost:8002/api/v1/leaders";

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const PageWrapper = styled.div`
  background: #f3f4f6;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "Inter", sans-serif;
`;

const FormCard = styled.div`
  background: white;
  width: 100%;
  max-width: 850px;
  min-height: 100vh;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background: #1e3c72;
  padding: 30px;
  color: white;
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .header-content {
    flex: 1;
  }
  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 800;
  }
  p {
    margin: 8px 0 0;
    opacity: 0.8;
    font-size: 14px;
  }
`;

const NavButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: 0.2s;
  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const Section = styled.div`
  padding: 40px;
  flex: 1;
  max-height: 70vh;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  margin-top: 24px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
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
  padding: ${(props) => (props.hasIcon ? "14px 16px 14px 44px" : "14px 16px")};
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  &:focus {
    border-color: #1e3c72;
    outline: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  font-size: 15px;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 18px;
  background: #1e3c72;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  margin-top: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  &:disabled {
    background: #9ca3af;
  }
`;

const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  background: #f9fafb;
  justify-content: center;
  &:hover {
    background: #f3f4f6;
  }
`;

const TagItem = styled.div`
  background: #f3f4f6;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  gap: 12px;
  animation: ${slideIn} 0.3s ease;
  textarea {
    flex: 1;
    padding: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    resize: vertical;
    font-family: inherit;
  }
  button {
    background: none;
    border: none;
    color: #ef4444;
    cursor: pointer;
  }
`;

const AddButton = styled.button`
  width: 100%;
  padding: 12px;
  background: none;
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #1e3c72;
  margin: 32px 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 8px;
`;

const CountyList = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta",
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru",
  "Tharaka Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua",
  "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot",
  "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo Marakwet", "Nandi",
  "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet",
  "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya", "Kisumu", "Homa Bay",
  "Migori", "Kisii", "Nyamira", "Nairobi",
];

const RegisterAspirant = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

    // Validate required fields
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

      // Filter out empty strings from experience and education
      const validExperience = formData.experience.filter((exp) => exp.trim());
      const validEducation = formData.education.filter((edu) => edu.trim());

      if (validExperience.length > 0) {
        submitData.append("experience", JSON.stringify(validExperience));
      }
      if (validEducation.length > 0) {
        submitData.append("education", JSON.stringify(validEducation));
      }

      // Make the API call to the correct endpoint
      const response = await axios.post(`${API_BASE_URL}/register`, submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Registration response:", response.data);

      if (response.data.success) {
        toast.success("Account created successfully! Please login.");
        setTimeout(() => navigate("/login-aspirant"), 2000);
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <ToastContainer position="top-center" theme="colored" />
      <FormCard>
        <Header>
          <NavButton onClick={() => navigate("/leaders")}>
            <ArrowLeft size={18} /> Back
          </NavButton>
          <div className="header-content">
            <h2>Aspirant Registration</h2>
            <p>Join the Siasa Hub Platform</p>
          </div>
          <NavButton onClick={() => navigate("/login-aspirant")}>
            <LogIn size={18} /> Login
          </NavButton>
        </Header>

        <form onSubmit={handleSubmit}>
          <Section>
            <SectionTitle>
              <Users size={18} /> Personal & Campaign Info
            </SectionTitle>

            <Grid>
              <div>
                <Label>
                  <User size={16} /> Full Name *
                </Label>
                <InputWrapper>
                  <InputIcon>
                    <User size={18} />
                  </InputIcon>
                  <Input
                    name="name"
                    placeholder="Official Name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    hasIcon
                  />
                </InputWrapper>
              </div>
              <div>
                <Label>
                  <Lock size={16} /> Password *
                </Label>
                <Input
                  type="password"
                  name="password"
                  placeholder="Min. 6 characters"
                  required
                  minLength="6"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </Grid>

            <Label>
              <Type size={16} /> Campaign Slogan
            </Label>
            <Input
              name="slogan"
              placeholder="e.g., Leadership for Change"
              value={formData.slogan}
              onChange={handleChange}
            />

            <Grid>
              <div>
                <Label>
                  <Award size={16} /> Vying For (Position) *
                </Label>
                <Select
                  name="position"
                  required
                  value={formData.position}
                  onChange={handleChange}
                >
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
                <Label>
                  <ShieldCheck size={16} /> Political Party
                </Label>
                <Input
                  name="party"
                  placeholder="Party Name"
                  value={formData.party}
                  onChange={handleChange}
                />
              </div>
            </Grid>

            <SectionTitle>
              <MapPin size={18} /> Electoral Area
            </SectionTitle>
            <Grid>
              <div>
                <Label>County *</Label>
                <Select
                  name="county"
                  required
                  value={formData.county}
                  onChange={handleChange}
                >
                  <option value="">Select County</option>
                  {CountyList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
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
              <Upload size={18} /> Profile Picture
            </SectionTitle>
            <FileInputLabel>
              <Upload size={18} />
              <span>
                {formData.image ? formData.image.name : "Upload Campaign Photo"}
              </span>
              <input
                type="file"
                hidden
                name="image"
                onChange={handleChange}
                accept="image/*"
              />
            </FileInputLabel>

            <SectionTitle>
              <Briefcase size={18} /> Political Experience
            </SectionTitle>
            {formData.experience.map((exp, i) => (
              <TagItem key={i}>
                <textarea
                  value={exp}
                  onChange={(e) =>
                    handleTagChange("experience", i, e.target.value)
                  }
                  placeholder="Describe past roles or community work..."
                  rows="2"
                />
                {formData.experience.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTag("experience", i)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </TagItem>
            ))}
            <AddButton type="button" onClick={() => addTag("experience")}>
              <Plus size={16} /> Add Experience
            </AddButton>

            <SectionTitle>
              <Briefcase size={18} /> Education Background
            </SectionTitle>
            {formData.education.map((edu, i) => (
              <TagItem key={i}>
                <textarea
                  value={edu}
                  onChange={(e) =>
                    handleTagChange("education", i, e.target.value)
                  }
                  placeholder="Describe your educational background..."
                  rows="2"
                />
                {formData.education.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTag("education", i)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </TagItem>
            ))}
            <AddButton type="button" onClick={() => addTag("education")}>
              <Plus size={16} /> Add Education
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