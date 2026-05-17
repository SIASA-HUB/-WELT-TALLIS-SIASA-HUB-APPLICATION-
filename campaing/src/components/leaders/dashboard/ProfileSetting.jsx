import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  User,
  Camera,
  Edit2,
  Save,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import api from "../../../api/api";

const Card = styled.div`
  background: white;
  border-radius: 20px;
  border: 1px solid #e9ecef;
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  background: #fafbfc;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a2e;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  p {
    margin: 4px 0 0;
    font-size: 12px;
    color: #6c757d;
  }
`;

const CardBody = styled.div`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #1e293b;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #1e3c72;
    box-shadow: 0 0 0 3px rgba(30, 60, 114, 0.1);
  }

  &:disabled {
    background: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #1e3c72;
    box-shadow: 0 0 0 3px rgba(30, 60, 114, 0.1);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AvatarSection = styled.div`
  text-align: center;
  margin-bottom: 32px;
  position: relative;
`;

const AvatarWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #1e3c72;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ChangePhotoButton = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  background: #1e3c72;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
  border: 2px solid white;

  &:hover {
    background: #152c54;
    transform: scale(1.05);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
`;

const SaveButton = styled.button`
  padding: 12px 32px;
  background: #1e3c72;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #152c54;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: 12px 32px;
  background: white;
  color: #6c757d;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
    border-color: #dee2e6;
  }
`;

const Message = styled.div`
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;

  &.success {
    background: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #c8e6c9;
  }

  &.error {
    background: #ffebee;
    color: #c62828;
    border: 1px solid #ffcdd2;
  }

  &.warning {
    background: #fff3e0;
    color: #ed6c02;
    border: 1px solid #ffe0b2;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: ${(props) =>
    props.status === "active" || props.status === "verified"
      ? "#e8f5e9"
      : props.status === "pending"
        ? "#fff3e0"
        : "#ffebee"};
  color: ${(props) =>
    props.status === "active" || props.status === "verified"
      ? "#2e7d32"
      : props.status === "pending"
        ? "#ed6c02"
        : "#c62828"};
`;

const VerifyButton = styled.button`
  padding: 6px 12px;
  background: #1e3c72;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #152c54;
  }

  &:disabled {
    background: #e2e8f0;
    color: #94a3b8;
    cursor: not-allowed;
  }
`;

const ProfileSettingsSection = ({ leader, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    party: "",
    position: "",
    county: "",
    constituency: "",
    ward: "",
    email: "",
    phone: "",
    slogan: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (leader) {
      setFormData({
        name: leader.name || "",
        party: leader.party || "",
        position: leader.position || leader.position_running_for || "",
        county: leader.county || "",
        constituency: leader.constituency || "",
        ward: leader.ward || "",
        email: leader.email || "",
        phone: leader.phone || "",
        slogan: leader.slogan || "",
      });
      setAvatar(leader.image_url || leader.primary_image || null);
    }
  }, [leader]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image must be less than 5MB" });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Prepare update data - only include fields that are allowed to be updated
    const updateData = {
      name: formData.name,
      party: formData.party,
      slogan: formData.slogan,
      phone: formData.phone,
      email: formData.email,
    };

    try {
      console.log("Updating profile with data:", updateData);
      
      // Try multiple possible endpoints
      let response;
      try {
        response = await api.put("/leaders/profile/me", updateData);
      } catch (firstError) {
        console.log("First endpoint failed, trying alternative...");
        try {
          response = await api.put("/profile/me", updateData);
        } catch (secondError) {
          console.log("Second endpoint failed, trying admin endpoint...");
          const leaderId = leader.leader_id || leader.id;
          response = await api.put(`/leaders/${leaderId}/admin`, updateData);
        }
      }
      
      if (response?.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setIsEditing(false);
        
        // Update local leader data
        const updatedLeader = { ...leader, ...updateData };
        localStorage.setItem("leaderData", JSON.stringify(updatedLeader));
        
        if (onUpdate) onUpdate(updateData);
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(response?.message || "Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      
      let errorMessage = "Failed to update profile. ";
      if (error.response?.status === 503) {
        errorMessage = "Service temporarily unavailable. Please try again in a few minutes.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Our team has been notified. Please try again later.";
      } else if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
        // Redirect to login after 2 seconds
        setTimeout(() => {
          localStorage.removeItem("leaderToken");
          localStorage.removeItem("leaderData");
          window.location.href = "/login-aspirant";
        }, 2000);
      } else {
        errorMessage += error.response?.data?.message || error.message;
      }
      
      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestVerification = async () => {
    setLoading(true);
    try {
      const response = await api.post("/leaders/verification/request");
      
      if (response?.success) {
        setMessage({ type: "success", text: response.message || "Verification request sent successfully!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(response?.message || "Request failed");
      }
    } catch (error) {
      let errorMessage = "Failed to send verification request. ";
      if (error.response?.status === 503) {
        errorMessage = "Service temporarily unavailable. Please try again later.";
      } else if (error.response?.status === 402) {
        errorMessage = error.response?.data?.message || "Payment required for verification.";
      } else {
        errorMessage += error.message;
      }
      setMessage({ 
        type: "error", 
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = () => {
    const status = leader?.status || leader?.verification_status;
    if (status === "active" || status === "verified")
      return { text: "Verified", icon: <CheckCircle size={12} /> };
    if (status === "pending")
      return { text: "Verification Pending", icon: <AlertCircle size={12} /> };
    return { text: "Unverified", icon: <AlertCircle size={12} /> };
  };

  const status = getStatusLabel();
  const isVerified = leader?.status === "active" || leader?.status === "verified" || leader?.verification_status === "verified";
  const isPending = leader?.status === "pending" || leader?.verification_status === "pending";

  return (
    <Card>
      <CardHeader>
        <h3>
          <User size={18} /> Profile Settings
        </h3>
        <p>Manage your campaign profile and personal information</p>
      </CardHeader>

      <CardBody>
        <form onSubmit={handleSubmit}>
          <AvatarSection>
            <AvatarWrapper>
              <Avatar
                src={
                  avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || "Leader")}&background=1e3c72&color=fff&size=120&bold=true`
                }
                alt={formData.name || "Profile"}
              />
              {isEditing && (
                <ChangePhotoButton>
                  <Camera size={16} />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </ChangePhotoButton>
              )}
            </AvatarWrapper>

            <div style={{ marginTop: "12px", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <StatusBadge status={leader?.status || leader?.verification_status}>
                {status.icon} {status.text}
              </StatusBadge>
              {!isEditing && !isVerified && !isPending && (
                <VerifyButton type="button" onClick={handleRequestVerification} disabled={loading}>
                  <ShieldCheck size={12} />
                  {loading ? "Requesting..." : "Request Verification"}
                </VerifyButton>
              )}
            </div>
          </AvatarSection>

          {message && (
            <Message className={message.type}>
              {message.type === "success" ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              {message.text}
            </Message>
          )}

          {!isEditing ? (
            <>
              <Grid>
                <div>
                  <Label>Full Name</Label>
                  <Input value={formData.name || "Not set"} disabled />
                </div>
                <div>
                  <Label>Political Party</Label>
                  <Input value={formData.party || "Not specified"} disabled />
                </div>
                <div>
                  <Label>Position</Label>
                  <Input value={formData.position || "Not set"} disabled />
                </div>
                <div>
                  <Label>County</Label>
                  <Input value={formData.county || "Not set"} disabled />
                </div>
                <div>
                  <Label>Constituency</Label>
                  <Input value={formData.constituency || "Not specified"} disabled />
                </div>
                <div>
                  <Label>Ward</Label>
                  <Input value={formData.ward || "Not specified"} disabled />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={formData.email || "Not provided"} disabled />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={formData.phone || "Not provided"} disabled />
                </div>
              </Grid>

              <div>
                <Label>Campaign Slogan</Label>
                <TextArea value={formData.slogan || "No slogan set"} disabled rows={2} />
              </div>

              <ButtonGroup>
                <SaveButton type="button" onClick={() => setIsEditing(true)}>
                  <Edit2 size={16} />
                  Edit Profile
                </SaveButton>
              </ButtonGroup>
            </>
          ) : (
            <>
              <Grid>
                <FormGroup>
                  <Label>Full Name *</Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Political Party</Label>
                  <Input
                    name="party"
                    value={formData.party}
                    onChange={handleChange}
                    placeholder="e.g., UDA, ODM, Independent"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Position *</Label>
                  <Input
                    name="position"
                    value={formData.position}
                    disabled
                    title="Position cannot be changed. Contact admin for changes."
                  />
                  <small style={{ color: '#6c757d', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    Position cannot be changed. Contact admin for assistance.
                  </small>
                </FormGroup>
                <FormGroup>
                  <Label>County *</Label>
                  <Input
                    name="county"
                    value={formData.county}
                    disabled
                    title="County cannot be changed. Contact admin for changes."
                  />
                  <small style={{ color: '#6c757d', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    County cannot be changed. Contact admin for assistance.
                  </small>
                </FormGroup>
                <FormGroup>
                  <Label>Constituency</Label>
                  <Input
                    name="constituency"
                    value={formData.constituency}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Ward</Label>
                  <Input
                    name="ward"
                    value={formData.ward}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Email</Label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Phone</Label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </FormGroup>
              </Grid>

              <FormGroup>
                <Label>Campaign Slogan</Label>
                <TextArea
                  name="slogan"
                  value={formData.slogan}
                  onChange={handleChange}
                  placeholder="Your campaign slogan..."
                  rows={3}
                />
              </FormGroup>

              <ButtonGroup>
                <CancelButton type="button" onClick={() => setIsEditing(false)}>
                  Cancel
                </CancelButton>
                <SaveButton type="submit" disabled={loading}>
                  <Save size={16} />
                  {loading ? "Saving..." : "Save Changes"}
                </SaveButton>
              </ButtonGroup>
            </>
          )}
        </form>
      </CardBody>
    </Card>
  );
};

export default ProfileSettingsSection;