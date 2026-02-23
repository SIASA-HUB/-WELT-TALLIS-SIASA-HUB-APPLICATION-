import React, { useState } from "react";
import styled from "styled-components";
import {
  MapPin,
  User,
  Vote,
  CheckCircle2,
  AlertCircle,
  Save,
  Pencil,
  Sparkles,
  Zap,
} from "lucide-react";

const Container = styled.div`
  background: #020617; /* Midnight Black */
  padding: 45px 24px 35px;
  text-align: center;
  color: white;
  border-radius: 0 0 40px 40px;
  position: relative;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
`;

const Glow = styled.div`
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 250px;
  height: 250px;
  background: radial-gradient(
    circle,
    rgba(59, 246, 78, 0.2) 0%,
    transparent 70%
  );
  pointer-events: none;
`;

const AvatarFrame = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 18px;

  &::before {
    content: "";
    position: absolute;
    inset: -4px;
    border-radius: 35px;
    background: linear-gradient(135deg, #3bf66d, #68fa60, #62d81d);
    opacity: ${(props) => (props.$registered ? 0.8 : 0.2)};
    z-index: 0;
  }
`;

const Avatar = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 32px;
  background: #1e293b url(${(props) => props.$url}) center/cover;
  border: 4px solid #020617;
  z-index: 1;
`;

const ProfileBadge = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 4px 12px;
  border-radius: 100px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #94a3b8;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const Name = styled.h2`
  font-size: 28px;
  font-weight: 900;
  margin: 0;
  letter-spacing: -1px;
  background: linear-gradient(to bottom, #ffffff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const LocationText = styled.div`
  color: #64748b;
  font-size: 13px;
  margin-top: 6px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  opacity: 0.8;

  &:hover {
    opacity: 1;
    cursor: pointer;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 30px;
`;

const GlassCard = styled.button`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  text-align: left;

  &:active {
    transform: scale(0.92);
    background: rgba(255, 255, 255, 0.08);
  }

  .label {
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
    color: #475569;
    letter-spacing: 0.8px;
  }

  .value {
    font-size: 14px;
    font-weight: 700;
    color: #f8fafc;
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const FloatingSave = styled.button`
  position: fixed;
  bottom: 110px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  color: #020617;
  padding: 14px 28px;
  border-radius: 100px;
  font-weight: 900;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 15px 30px rgba(255, 255, 255, 0.1);
  border: none;
  z-index: 2000;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  @keyframes popIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;

const HeroSection = ({ userData, setUserData }) => {
  const [changed, setChanged] = useState(false);
  const isRegistered = userData.voter_status === "Registered";

  const toggle = (field, val1, val2) => {
    setUserData({
      ...userData,
      [field]: userData[field] === val1 ? val2 : val1,
    });
    setChanged(true);
  };

  return (
    <Container>
      <Glow />

      <ProfileBadge>
        <Zap size={10} fill="#eab308" color="#eab308" />
        {isRegistered ? "VERIFIED CITIZEN" : "PENDING ACTION"}
      </ProfileBadge>

      <AvatarFrame $registered={isRegistered}>
        <Avatar
          $url={`https://api.dicebear.com/7.x/notionists/svg?seed=${userData.username}`}
        />
      </AvatarFrame>

      <Name>{userData.username}</Name>

      <LocationText onClick={() => setChanged(true)}>
        <MapPin size={12} /> {userData.ward}, {userData.county}{" "}
        <Pencil size={10} />
      </LocationText>

      <Grid>
        <GlassCard
          onClick={() => toggle("voter_status", "Registered", "Not Registered")}
        >
          <div className="label">Registry Status</div>
          <div
            className="value"
            style={{ color: isRegistered ? "#4ade80" : "#ef4444" }}
          >
            {isRegistered ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {userData.voter_status}
          </div>
        </GlassCard>

        <GlassCard onClick={() => toggle("will_vote", true, false)}>
          <div className="label">Voting Power</div>
          <div className="value">
            {userData.will_vote ? "⚡ Committed" : "💤 Passive"}
          </div>
        </GlassCard>

        <GlassCard onClick={() => toggle("gender", "Male", "Female")}>
          <div className="label">Identity</div>
          <div className="value">
            <User size={15} /> {userData.gender}
          </div>
        </GlassCard>

        <GlassCard
          onClick={() => toggle("voting_intention", "Decided", "Undecided")}
        >
          <div className="label">Mindset</div>
          <div className="value">
            <Vote size={15} /> {userData.voting_intention}
          </div>
        </GlassCard>
      </Grid>

      {changed && (
        <FloatingSave
          onClick={() => {
            setChanged(false);
            alert("Biometrics Synced.");
          }}
        >
          <Save size={18} /> Sync Profile
        </FloatingSave>
      )}
    </Container>
  );
};

export default HeroSection;
