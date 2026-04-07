import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  X,
  ShieldCheck,
  ArrowUpRight,
  Crown,
  Camera,
  Loader2,
} from "lucide-react";
import axios from "axios";

// --- Animations ---
const slideUp = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 174, 0, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 174, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 174, 0, 0); }
`;

// --- Styled Components ---
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  z-index: 200000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const Content = styled.div`
  background: #000;
  width: 100%;
  max-width: 440px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px 24px 0 0;
  padding: 24px;
  animation: ${slideUp} 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  padding-bottom: env(safe-area-inset-bottom, 24px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const StatusBadge = styled.div`
  font-size: 10px;
  font-weight: 900;
  color: #10b981;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TextArea = styled.textarea`
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1.1rem;
  font-weight: 500;
  min-height: 80px;
  outline: none;
  resize: none;
  margin-bottom: 8px;
  &::placeholder {
    color: rgba(255, 255, 255, 0.2);
  }
  &:focus {
    border-color: #10b981;
  }
`;

const ImageStrip = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px 0;
`;

const Label = styled.span`
  font-size: 9px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const AddImageBtn = styled.button`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  font-size: 8px;
  font-weight: 700;
  &:hover {
    border-color: #10b981;
    color: #10b981;
  }
`;

const PreviewBox = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  img {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    object-fit: cover;
    border: 2px solid #10b981;
  }
`;

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 12px 0 32px;
`;

const OptionCard = styled.button`
  background: ${(props) =>
    props.$active
      ? props.$isHigh
        ? "linear-gradient(135deg, #ffae00, #ff7b00)"
        : "#10b981"
      : "rgba(255,255,255,0.03)"};
  border: 1px solid
    ${(props) => (props.$active ? "transparent" : "rgba(255,255,255,0.08)")};
  border-radius: 12px;
  padding: 14px 0;
  cursor: pointer;
  transition: all 0.2s;
  animation: ${(props) => (props.$active && props.$isHigh ? pulse : "none")} 2s
    infinite;

  .pts {
    display: block;
    font-size: 14px;
    font-weight: 900;
    color: ${(props) => (props.$active ? "#000" : "#fff")};
  }
  .label {
    font-size: 8px;
    font-weight: 800;
    color: ${(props) => (props.$active ? "#000" : "rgba(255,255,255,0.5)")};
  }
`;

const PayButton = styled.button`
  width: 100%;
  background: ${(props) =>
    props.$isHigh ? "linear-gradient(135deg, #ffae00, #ff7b00)" : "#fff"};
  color: #000;
  border: none;
  border-radius: 16px;
  padding: 20px;
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: transform 0.2s;
  &:active {
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }
`;

// --- Component Logic ---
const AddStoryModal = ({
  isOpen,
  onClose,
  leaderId: propId,
  leader,
  user,
  onComplete,
}) => {
  const { id: routeId } = useParams();
  // Sync with backend allowedAmounts: [10, 50, 100]
  const [amount, setAmount] = useState(10);
  const [text, setText] = useState("");
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const activeLeaderId = routeId || propId || leader?.leader_id || leader?.id;

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    if (!activeLeaderId) {
      alert("Error: Leader ID not found.");
      return;
    }

    setLoading(true);

    // Determine level string based on amount
    const levelMap = { 10: "RISING", 50: "GOLD", 100: "ELITE" };

    const formData = new FormData();
    formData.append("leader_id", activeLeaderId);
    formData.append("user_id", user?.id || user?._id || "USR-80c0410e-6ee2");
    formData.append("user_name", user?.name || "Supporter");
    formData.append("amount", amount);
    formData.append("level", levelMap[amount] || "RISING");
    formData.append("phrase", "Official Endorsement"); // Required by your backend
    formData.append("message", text);

    if (file) formData.append("image", file);

    try {
      const res = await axios.post(
        "https://instant-resumes-keeping-quite.trycloudflare.com/api/v1/endorsements",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      if (res.data.success) {
        onComplete?.(res.data.data);
        setText("");
        setFile(null);
        setPreview(null);
        setAmount(10);
        onClose();
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert(
        err.response?.data?.message || "Error uploading. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Content onClick={(e) => e.stopPropagation()}>
        <Header>
          <StatusBadge>
            <ShieldCheck size={14} /> OFFICIAL ENDORSEMENT
          </StatusBadge>
          <X
            size={20}
            color="white"
            onClick={onClose}
            style={{ cursor: "pointer", opacity: 0.5 }}
          />
        </Header>

        <TextArea
          placeholder="Reason you support this leader..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />

        <ImageStrip>
          <Label>Attached Media / Brand Logo</Label>
          {!preview ? (
            <AddImageBtn onClick={() => fileInputRef.current.click()}>
              <Camera size={18} />
              ADD PHOTO
            </AddImageBtn>
          ) : (
            <PreviewBox>
              <img src={preview} alt="Upload Preview" />
              <div
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                }}
                style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  background: "#ff4b4b",
                  borderRadius: "50%",
                  padding: "2px",
                  cursor: "pointer",
                }}
              >
                <X size={12} color="white" />
              </div>
            </PreviewBox>
          )}
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*"
            onChange={handleFile}
          />
        </ImageStrip>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "10px",
          }}
        >
          <Label>Select Visibility Tier</Label>
          {amount >= 50 && (
            <span
              style={{
                color: "#ffae00",
                fontSize: "10px",
                fontWeight: "900",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Crown size={12} /> VIP PLACEMENT
            </span>
          )}
        </div>

        <OptionGrid>
          {[
            { v: 10, l: "BASIC" },
            { v: 50, l: "GOLD", high: true },
            { v: 100, l: "ELITE", high: true },
          ].map((t) => (
            <OptionCard
              key={t.v}
              $active={amount === t.v}
              $isHigh={t.high}
              onClick={() => setAmount(t.v)}
            >
              <span className="pts">{t.v}</span>
              <span className="label">{t.l}</span>
            </OptionCard>
          ))}
        </OptionGrid>

        <PayButton
          $isHigh={amount >= 50}
          disabled={!text || loading}
          onClick={handleSubmit}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            `Confirm ${amount} KES Support`
          )}
          {!loading && <ArrowUpRight size={18} />}
        </PayButton>
      </Content>
    </Overlay>
  );
};

export default AddStoryModal;
