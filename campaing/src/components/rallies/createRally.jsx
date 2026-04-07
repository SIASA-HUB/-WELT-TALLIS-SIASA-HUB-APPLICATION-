import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Clock,
  MapPin,
  Flag,
  User,
  Image as ImageIcon,
  X,
  UploadCloud,
  CheckCircle,
  Loader,
  Map,
  Tag,
} from "lucide-react";

const API_BASE_URL =
  "https://expand-reporting-nicole-geological.trycloudflare.com/api/v1"; // Change to your backend URL

const THEME = {
  primary: "#BB0000",
  secondary: "#006600",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  bg: "#f8fafc",
  white: "#ffffff",
};

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 16px;
  min-height: 100vh;
  background: ${THEME.bg};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${THEME.primary};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &:hover {
    background: #f1f5f9;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: ${THEME.text};
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormSection = styled.div`
  background: ${THEME.white};
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid ${THEME.border};
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${THEME.text};
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: ${THEME.primary};
  }
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  grid-column: ${(props) => (props.$full ? "1 / -1" : "auto")};
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${THEME.muted};
  text-transform: uppercase;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Input = styled.input`
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${THEME.border};
  background: ${THEME.bg};
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${THEME.primary};
    box-shadow: 0 0 0 3px ${THEME.primary}20;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const TextArea = styled.textarea`
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${THEME.border};
  background: ${THEME.bg};
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${THEME.primary};
    box-shadow: 0 0 0 3px ${THEME.primary}20;
  }
`;

const Select = styled.select`
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${THEME.border};
  background: ${THEME.bg};
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${THEME.primary};
  }
`;

// Image Upload Area
const ImageUploadArea = styled.div`
  border: 2px dashed ${THEME.border};
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: ${THEME.bg};
  margin-bottom: 10px;

  &:hover {
    border-color: ${THEME.primary};
    background: ${THEME.primary}08;
  }
`;

const UploadIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${THEME.primary}10;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  color: ${THEME.primary};
`;

const UploadText = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: ${THEME.text};
  margin: 0 0 5px 0;
`;

const UploadSubtext = styled.p`
  font-size: 12px;
  color: ${THEME.muted};
  margin: 0;
`;

// Image Preview
const ImagePreviewContainer = styled.div`
  position: relative;
  margin-top: 15px;
  border-radius: 16px;
  overflow: hidden;
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 16px;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${THEME.primary};
    transform: scale(1.1);
  }
`;

// Submit Button
const SubmitButton = styled.button`
  background: ${THEME.primary};
  color: white;
  border: none;
  padding: 16px;
  border-radius: 40px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;

  &:hover {
    background: #990000;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px ${THEME.primary}40;
  }

  &:disabled {
    background: ${THEME.muted};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #991b1b;
  padding: 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SuccessMessage = styled.div`
  background: #dcfce7;
  color: #166534;
  padding: 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Party options
const PARTIES = [
  "UDA",
  "ODM",
  "Jubilee",
  "ANC",
  "Wiper",
  "Independent",
  "Other",
];

// County options (simplified - add all 47 counties)
const COUNTIES = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Kiambu",
  "Nakuru",
  "Uasin Gishu",
  "Machakos",
  "Meru",
  "Kakamega",
  "Kilifi",
  "Kericho",
  "Bungoma",
  "Kitui",
  "Mandera",
  "Garissa",
  "Wajir",
  "Marsabit",
  "Turkana",
].sort();

// Rally types
const RALLY_TYPES = ["rally", "townhall", "summit", "meeting"];

const CreateRally = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    end_time: "",
    location: "",
    venue: "",
    county: "Nairobi",
    party: "UDA",
    leader: "",
    status: "upcoming",
    type: "rally",
  });

  // Image state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.name) {
      setError("Rally name is required");
      return;
    }

    if (!formData.date) {
      setError("Date is required");
      return;
    }

    if (!formData.time) {
      setError("Time is required");
      return;
    }

    if (!formData.location) {
      setError("Location is required");
      return;
    }

    if (!formData.leader) {
      setError("Leader name is required");
      return;
    }

    if (!imageFile) {
      setError("Please upload a rally poster image");
      return;
    }

    setLoading(true);

    try {
      // Create FormData for multipart upload
      const submitData = new FormData();

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      // Append image file
      submitData.append("image", imageFile);

      // Send to backend
      const response = await axios.post(`${API_BASE_URL}/rallies`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setSuccess("Rally created successfully! 🎉");

        // Clear form
        setFormData({
          name: "",
          description: "",
          date: "",
          time: "",
          end_time: "",
          location: "",
          venue: "",
          county: "Nairobi",
          party: "UDA",
          leader: "",
          status: "upcoming",
          type: "rally",
        });
        removeImage();

        // Navigate after 2 seconds
        setTimeout(() => {
          navigate(`/rallies/${response.data.data.rally_id}`);
        }, 2000);
      }
    } catch (err) {
      console.error("Error creating rally:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create rally. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Get today's date for min attribute
  const today = new Date().toISOString().split("T")[0];

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>←</BackButton>
        <Title>Create New Rally</Title>
      </Header>

      {error && (
        <ErrorMessage>
          <X size={16} />
          {error}
        </ErrorMessage>
      )}

      {success && (
        <SuccessMessage>
          <CheckCircle size={16} />
          {success}
        </SuccessMessage>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <FormSection>
          <SectionTitle>
            <Flag size={18} />
            Basic Information
          </SectionTitle>

          <FormGroup $full>
            <Label>Rally Name *</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Nairobi Mega Rally"
              required
            />
          </FormGroup>

          <FormGroup $full>
            <Label>Description</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the rally, agenda, etc."
            />
          </FormGroup>

          <InputGrid>
            <FormGroup>
              <Label>
                <Calendar size={12} />
                Date *
              </Label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={today}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Clock size={12} />
                Time *
              </Label>
              <Input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Clock size={12} />
                End Time
              </Label>
              <Input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
              />
            </FormGroup>
          </InputGrid>
        </FormSection>

        {/* Location Details */}
        <FormSection>
          <SectionTitle>
            <MapPin size={18} />
            Location Details
          </SectionTitle>

          <FormGroup $full>
            <Label>Location/Venue *</Label>
            <Input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g. Kasarani Stadium"
              required
            />
          </FormGroup>

          <FormGroup $full>
            <Label>Specific Venue (optional)</Label>
            <Input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleInputChange}
              placeholder="e.g. Main Arena, Gate A"
            />
          </FormGroup>

          <FormGroup $full>
            <Label>
              <Map size={12} />
              County *
            </Label>
            <Select
              name="county"
              value={formData.county}
              onChange={handleInputChange}
              required
            >
              {COUNTIES.map((county) => (
                <option key={county} value={county}>
                  {county}
                </option>
              ))}
            </Select>
          </FormGroup>
        </FormSection>

        {/* Political Details */}
        <FormSection>
          <SectionTitle>
            <User size={18} />
            Political Details
          </SectionTitle>

          <InputGrid>
            <FormGroup>
              <Label>
                <Tag size={12} />
                Party *
              </Label>
              <Select
                name="party"
                value={formData.party}
                onChange={handleInputChange}
                required
              >
                {PARTIES.map((party) => (
                  <option key={party} value={party}>
                    {party}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Leader *</Label>
              <Input
                type="text"
                name="leader"
                value={formData.leader}
                onChange={handleInputChange}
                placeholder="e.g. William Ruto"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Type</Label>
              <Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                {RALLY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </InputGrid>
        </FormSection>

        {/* Image Upload */}
        <FormSection>
          <SectionTitle>
            <ImageIcon size={18} />
            Rally Poster *
          </SectionTitle>

          {!imagePreview ? (
            <>
              <input
                type="file"
                id="rally-image"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <ImageUploadArea
                onClick={() => document.getElementById("rally-image").click()}
              >
                <UploadIcon>
                  <UploadCloud size={28} />
                </UploadIcon>
                <UploadText>Click to upload rally poster</UploadText>
                <UploadSubtext>PNG, JPG, GIF up to 5MB</UploadSubtext>
              </ImageUploadArea>
            </>
          ) : (
            <ImagePreviewContainer>
              <PreviewImage src={imagePreview} alt="Rally poster preview" />
              <RemoveImageButton onClick={removeImage} type="button">
                <X size={16} />
              </RemoveImageButton>
            </ImagePreviewContainer>
          )}
        </FormSection>

        <SubmitButton type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader size={18} className="spin" />
              Creating Rally...
            </>
          ) : (
            <>
              <CheckCircle size={18} />
              Create Rally
            </>
          )}
        </SubmitButton>
      </Form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </Container>
  );
};

export default CreateRally;
