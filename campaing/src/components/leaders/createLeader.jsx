import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";
import {
  User,
  MapPin,
  Flag,
  Image as ImageIcon,
  Plus,
  X,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Sparkles,
  UploadCloud,
  Link as LinkIcon,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
  Hash,
} from "lucide-react";

const THEME = {
  primary: "#BB0000",
  success: "#22c55e",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  bg: "#f8fafc",
};

// --- Styled Components ---
const FormWrapper = styled.div`
  max-width: 900px;
  margin: 40px auto;
  padding: 40px;
  background: white;
  border-radius: 32px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.04);
  font-family: "Inter", sans-serif;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
  color: ${THEME.muted};
  margin: 30px 0 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 1px;
  border-bottom: 2px solid ${THEME.border};
  padding-bottom: 8px;
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 700;
  color: ${THEME.text};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StyledInput = styled.input`
  padding: 14px 18px;
  border-radius: 14px;
  border: 1.5px solid ${THEME.border};
  background: ${THEME.bg};
  font-size: 14px;
  transition: all 0.2s;
  &:focus {
    outline: none;
    border-color: ${THEME.primary};
    background: white;
    box-shadow: 0 0 0 4px rgba(187, 0, 0, 0.05);
  }
`;

const StyledTextArea = styled.textarea`
  padding: 14px 18px;
  border-radius: 14px;
  border: 1.5px solid ${THEME.border};
  background: ${THEME.bg};
  font-size: 14px;
  transition: all 0.2s;
  min-height: 80px;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: ${THEME.primary};
    background: white;
    box-shadow: 0 0 0 4px rgba(187, 0, 0, 0.05);
  }
`;

const DynamicSection = styled.div`
  background: ${THEME.bg};
  padding: 20px;
  border-radius: 20px;
  border: 1px solid ${THEME.border};
  margin-bottom: 15px;
`;

const TagChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  margin: 5px;
  border: 1px solid ${THEME.border};
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  svg {
    cursor: pointer;
    color: ${THEME.primary};
  }
`;

const ImagePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const PreviewCard = styled.div`
  aspect-ratio: 1;
  border-radius: 12px;
  background: url(${(props) => props.$url}) center/cover;
  position: relative;
  border: 2px solid white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

  ${(props) =>
    props.$primary &&
    `
    border: 3px solid ${THEME.primary};
    box-shadow: 0 0 0 2px white, 0 0 0 5px ${THEME.primary}20;
  `}
`;

const PrimaryBadge = styled.div`
  position: absolute;
  bottom: 5px;
  left: 5px;
  background: ${THEME.primary};
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 20px;
`;

const SocialLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 18px;
  margin-top: 40px;
  background: ${THEME.text};
  color: white;
  border: none;
  border-radius: 18px;
  font-weight: 800;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    background: ${THEME.primary};
    transform: translateY(-2px);
  }
  &:disabled {
    background: ${THEME.muted};
    opacity: 0.6;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: ${THEME.primary};
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
`;

// --- Main Component ---
const LeaderRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  // Education and Experience
  const [eduList, setEduList] = useState([]);
  const [expList, setExpList] = useState([]);
  const [eduInput, setEduInput] = useState("");
  const [expInput, setExpInput] = useState("");

  // Form state
  const [form, setForm] = useState({
    // Basic info
    name: "",
    party: "",
    slogan: "",
    motto: "",

    // Position
    position: "",
    position_running_for: "", // If not current, what they're vying for

    // Location/Jurisdiction
    county: "",
    constituency: "",
    ward: "",
    location: "",

    // Social links
    website: "",
    facebook: "",
    twitter: "",
    instagram: "",
    tiktok: "",
    linkedin: "",
    youtube: "",
  });

  const handleInput = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);

    // Limit to 10 images
    if (images.length + files.length > 10) {
      setError("Maximum 10 images allowed");
      return;
    }

    setImages((prev) => [...prev, ...files]);

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...urls]);
    setError("");
  };

  const removeImage = (index) => {
    setPreviews(previews.filter((_, idx) => idx !== index));
    setImages(images.filter((_, idx) => idx !== index));

    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(primaryImageIndex - 1);
    }
  };

  const addItem = (type) => {
    if (type === "edu" && eduInput.trim()) {
      setEduList([...eduList, eduInput.trim()]);
      setEduInput("");
    }
    if (type === "exp" && expInput.trim()) {
      setExpList([...expList, expInput.trim()]);
      setExpInput("");
    }
  };

  const handleKeyPress = (e, type) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem(type);
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!form.name.trim()) {
      setError("Leader name is required");
      setLoading(false);
      return;
    }

    const formData = new FormData();

    // Append all form fields
    Object.keys(form).forEach((key) => {
      if (form[key]) formData.append(key, form[key]);
    });

    // Append education and experience as strings
    if (eduList.length > 0) {
      formData.append("education", eduList.join(" | "));
    }

    if (expList.length > 0) {
      formData.append("experience", expList.join(" | "));
    }

    // Construct tags object (for backward compatibility)
    const tagsData = [];
    if (eduList.length > 0) tagsData.push({ education: eduList });
    if (expList.length > 0) tagsData.push({ experience: expList });
    if (form.slogan) tagsData.push({ slogan: form.slogan });
    if (form.motto) tagsData.push({ motto: form.motto });

    formData.append("tags", JSON.stringify(tagsData));

    // Append images with primary flag
    images.forEach((img, index) => {
      formData.append("images", img);
      if (index === primaryImageIndex) {
        formData.append("primary_image", index);
      }
    });

    try {
      const res = await axios.post(
        "http://localhost:8009/api/v1/leaders/leaders/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res.data.success) {
        alert("Leader registered successfully!");
        // Reset form
        setForm({
          name: "",
          party: "",
          slogan: "",
          motto: "",
          position: "",
          position_running_for: "",
          county: "",
          constituency: "",
          ward: "",
          location: "",
          website: "",
          facebook: "",
          twitter: "",
          instagram: "",
          tiktok: "",
          linkedin: "",
          youtube: "",
        });
        setEduList([]);
        setExpList([]);
        setImages([]);
        setPreviews([]);
        setPrimaryImageIndex(0);
      }
    } catch (err) {
      console.error("Upload Error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to register leader. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormWrapper>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <Sparkles
          size={32}
          color={THEME.primary}
          style={{ marginBottom: "10px" }}
        />
        <h2 style={{ fontWeight: 900, fontSize: "28px", margin: "0" }}>
          Leader Registration
        </h2>
        <p style={{ color: THEME.muted, fontSize: "14px", marginTop: "5px" }}>
          Add a new political figure to the Ballot database
        </p>
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <form onSubmit={submitForm}>
        {/* Basic Information */}
        <SectionTitle>
          <User size={16} /> Basic Information
        </SectionTitle>
        <InputGrid>
          <FormGroup>
            <Label>Full Name *</Label>
            <StyledInput
              name="name"
              required
              placeholder="e.g. Johnson Sakaja"
              value={form.name}
              onChange={handleInput}
            />
          </FormGroup>
          <FormGroup>
            <Label>Political Party</Label>
            <StyledInput
              name="party"
              placeholder="e.g. UDA, ODM, etc."
              value={form.party}
              onChange={handleInput}
            />
          </FormGroup>
          <FormGroup>
            <Label>Campaign Slogan</Label>
            <StyledInput
              name="slogan"
              placeholder="e.g. Nairobi Works"
              value={form.slogan}
              onChange={handleInput}
            />
          </FormGroup>
          <FormGroup>
            <Label>Motto/Personal Quote</Label>
            <StyledInput
              name="motto"
              placeholder="e.g. Service Above Self"
              value={form.motto}
              onChange={handleInput}
            />
          </FormGroup>
        </InputGrid>

        {/* Position Information */}
        <SectionTitle>
          <Briefcase size={16} /> Position Details
        </SectionTitle>
        <InputGrid>
          <FormGroup>
            <Label>Current Position (if any)</Label>
            <StyledInput
              name="position"
              placeholder="e.g. Governor, Senator, etc."
              value={form.position}
              onChange={handleInput}
            />
          </FormGroup>
          <FormGroup>
            <Label>Vying For (if applicable)</Label>
            <StyledInput
              name="position_running_for"
              placeholder="e.g. President, Governor, MCA"
              value={form.position_running_for}
              onChange={handleInput}
            />
          </FormGroup>
        </InputGrid>

        {/* Jurisdiction */}
        <SectionTitle>
          <MapPin size={16} /> Jurisdiction
        </SectionTitle>
        <InputGrid>
          <FormGroup>
            <Label>County</Label>
            <StyledInput
              name="county"
              placeholder="e.g. Nairobi"
              value={form.county}
              onChange={handleInput}
            />
          </FormGroup>
          <FormGroup>
            <Label>Constituency</Label>
            <StyledInput
              name="constituency"
              placeholder="e.g. Westlands"
              value={form.constituency}
              onChange={handleInput}
            />
          </FormGroup>
          <FormGroup>
            <Label>Ward</Label>
            <StyledInput
              name="ward"
              placeholder="e.g. Parklands"
              value={form.ward}
              onChange={handleInput}
            />
          </FormGroup>
        </InputGrid>

        {/* Education */}
        <SectionTitle>
          <GraduationCap size={16} /> Education
        </SectionTitle>
        <DynamicSection>
          <div style={{ display: "flex", gap: "10px" }}>
            <StyledInput
              style={{ flex: 1 }}
              value={eduInput}
              placeholder="Add education (e.g. MBA - University of Nairobi)"
              onChange={(e) => setEduInput(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, "edu")}
            />
            <button
              type="button"
              onClick={() => addItem("edu")}
              style={{
                padding: "0 20px",
                borderRadius: "14px",
                background: THEME.text,
                color: "white",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              <Plus size={20} />
            </button>
          </div>
          <div style={{ marginTop: "15px" }}>
            {eduList.length === 0 ? (
              <p
                style={{
                  color: THEME.muted,
                  fontSize: "13px",
                  fontStyle: "italic",
                }}
              >
                No education entries added yet
              </p>
            ) : (
              eduList.map((item, i) => (
                <TagChip key={i}>
                  <GraduationCap size={14} color={THEME.primary} />
                  {item}
                  <X
                    size={14}
                    onClick={() =>
                      setEduList(eduList.filter((_, idx) => idx !== i))
                    }
                  />
                </TagChip>
              ))
            )}
          </div>
        </DynamicSection>

        {/* Experience */}
        <SectionTitle>
          <Briefcase size={16} /> Experience
        </SectionTitle>
        <DynamicSection>
          <div style={{ display: "flex", gap: "10px" }}>
            <StyledInput
              style={{ flex: 1 }}
              value={expInput}
              placeholder="Add experience (e.g. 5 years as County Minister)"
              onChange={(e) => setExpInput(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, "exp")}
            />
            <button
              type="button"
              onClick={() => addItem("exp")}
              style={{
                padding: "0 20px",
                borderRadius: "14px",
                background: THEME.text,
                color: "white",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              <Plus size={20} />
            </button>
          </div>
          <div style={{ marginTop: "15px" }}>
            {expList.length === 0 ? (
              <p
                style={{
                  color: THEME.muted,
                  fontSize: "13px",
                  fontStyle: "italic",
                }}
              >
                No experience entries added yet
              </p>
            ) : (
              expList.map((item, i) => (
                <TagChip key={i}>
                  <Briefcase size={14} color={THEME.primary} />
                  {item}
                  <X
                    size={14}
                    onClick={() =>
                      setExpList(expList.filter((_, idx) => idx !== i))
                    }
                  />
                </TagChip>
              ))
            )}
          </div>
        </DynamicSection>

        {/* Social Links */}
        <SectionTitle>
          <LinkIcon size={16} /> Social Media & Links
        </SectionTitle>
        <SocialLinksGrid>
          <FormGroup>
            <Label>
              <Globe size={14} /> Website
            </Label>
            <StyledInput
              name="website"
              placeholder="https://example.com"
              value={form.website}
              onChange={handleInput}
            />
          </FormGroup>
          <FormGroup>
            <Label>
              <Facebook size={14} /> Facebook
            </Label>
            <StyledInput
              name="facebook"
              placeholder="https://facebook.com/..."
              value={form.facebook}
              onChange={handleInput}
            />
          </FormGroup>
          <FormGroup>
            <Label>
              <Twitter size={14} /> Twitter/X
            </Label>
            <StyledInput
              name="twitter"
              placeholder="https://twitter.com/..."
              value={form.twitter}
              onChange={handleInput}
            />
          </FormGroup>
          <FormGroup>
            <Label>
              <Instagram size={14} /> Instagram
            </Label>
            <StyledInput
              name="instagram"
              placeholder="https://instagram.com/..."
              value={form.instagram}
              onChange={handleInput}
            />
          </FormGroup>
          <FormGroup>
            <Label>
              <Hash size={14} /> TikTok
            </Label>
            <StyledInput
              name="tiktok"
              placeholder="https://tiktok.com/@..."
              value={form.tiktok}
              onChange={handleInput}
            />
          </FormGroup>
          <FormGroup>
            <Label>
              <Linkedin size={14} /> LinkedIn
            </Label>
            <StyledInput
              name="linkedin"
              placeholder="https://linkedin.com/in/..."
              value={form.linkedin}
              onChange={handleInput}
            />
          </FormGroup>
          <FormGroup>
            <Label>
              <Youtube size={14} /> YouTube
            </Label>
            <StyledInput
              name="youtube"
              placeholder="https://youtube.com/@..."
              value={form.youtube}
              onChange={handleInput}
            />
          </FormGroup>
        </SocialLinksGrid>

        {/* Image Upload */}
        <SectionTitle>
          <ImageIcon size={16} /> Images (Max 10)
        </SectionTitle>
        <div
          onClick={() => document.getElementById("leader-imgs").click()}
          style={{
            border: `2px dashed ${THEME.border}`,
            padding: "30px",
            borderRadius: "20px",
            textAlign: "center",
            cursor: "pointer",
            background: THEME.bg,
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#f1f5f9")}
          onMouseOut={(e) => (e.currentTarget.style.background = THEME.bg)}
        >
          <UploadCloud size={40} color={THEME.muted} />
          <p style={{ margin: "10px 0 0", fontWeight: 700, color: THEME.text }}>
            Click to upload images
          </p>
          <p
            style={{ margin: "5px 0 0", color: THEME.muted, fontSize: "12px" }}
          >
            PNG, JPG, GIF up to 10MB each
          </p>
          <input
            type="file"
            id="leader-imgs"
            multiple
            hidden
            onChange={handleFiles}
            accept="image/*"
          />
        </div>

        {previews.length > 0 && (
          <>
            <p
              style={{
                margin: "15px 0 5px",
                fontSize: "13px",
                color: THEME.muted,
              }}
            >
              Click on any image to set as primary
            </p>
            <ImagePreviewGrid>
              {previews.map((url, i) => (
                <PreviewCard
                  key={i}
                  $url={url}
                  $primary={i === primaryImageIndex}
                  onClick={() => setPrimaryImageIndex(i)}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(i);
                    }}
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      background: THEME.primary,
                      border: "none",
                      borderRadius: "50%",
                      color: "white",
                      padding: "4px",
                      cursor: "pointer",
                      width: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={14} />
                  </button>
                  {i === primaryImageIndex && (
                    <PrimaryBadge>Primary</PrimaryBadge>
                  )}
                </PreviewCard>
              ))}
            </ImagePreviewGrid>
          </>
        )}

        <SubmitButton type="submit" disabled={loading}>
          {loading ? (
            "Registering Leader..."
          ) : (
            <>
              Register Leader <CheckCircle2 size={20} />
            </>
          )}
        </SubmitButton>
      </form>
    </FormWrapper>
  );
};

export default LeaderRegistration;
