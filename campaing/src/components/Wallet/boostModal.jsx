// BoostModal.js - Updated with Leader Boost Support
import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  X,
  Zap,
  Coins,
  Sparkles,
  AlertCircle,
  Flame,
  Heart,
  Shield,
  TrendingUp,
  Wallet,
  Crown,
} from "lucide-react";
import api from "../../api/api";
import API from "../../api/config";
// Kenyan Quotes for the boost cards
const BOOST_AMOUNTS = [
  {
    amount: 10,
    points: 10,
    label: "Weka Mawe",
    quote: "Weka Mawe!",
    meaning: "Be strong",
    emoji: "🪨",
  },
  {
    amount: 50,
    points: 50,
    label: "Weka Pawa",
    quote: "Weka Pawa!",
    meaning: "Go hard",
    emoji: "⚡",
  },
  {
    amount: 100,
    points: 100,
    label: "Finyanga",
    quote: "Finyanga!",
    meaning: "Crush it",
    emoji: "💪",
  },
  {
    amount: 500,
    points: 500,
    label: "Chapa Kazi",
    quote: "Chapa Kazi!",
    meaning: "Work hard",
    emoji: "🔥",
  },
];

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
  70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
`;

// Styled Components
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(12px);
  z-index: 100000;
  animation: ${fadeIn} 0.2s ease;
`;

const ModalContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #000000;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  z-index: 100001;
  animation: ${slideUp} 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);
`;

const ModalHeader = styled.div`
  padding: 20px 20px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.08);

  h3 {
    margin: 0;
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    letter-spacing: -0.3px;
  }

  button {
    background: rgba(255, 255, 255, 0.08);
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    cursor: pointer;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: scale(0.95);
    }
  }
`;

const ModalContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const WalletSection = styled.div`
  background: rgba(220, 38, 38, 0.08);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 24px;
  border: 0.5px solid rgba(220, 38, 38, 0.2);
  backdrop-filter: blur(10px);
`;

const WalletTitle = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const WalletAmount = styled.div`
  font-size: 40px;
  font-weight: 800;
  color: #dc2626;
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-family: monospace;

  span {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.4);
  }
`;

const InsufficientAlert = styled.div`
  background: rgba(239, 68, 68, 0.12);
  border: 0.5px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #f87171;
  font-size: 13px;
`;

const BoostGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const BoostCard = styled.button`
  background: rgba(255, 255, 255, 0.03);
  border: 0.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 18px 20px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  transition: all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    transform: translateX(4px);
    border-color: rgba(220, 38, 38, 0.4);
    background: rgba(220, 38, 38, 0.05);
  }

  ${(props) =>
    props.$selected &&
    `
    background: rgba(220, 38, 38, 0.12);
    border-color: #dc2626;
    transform: translateX(4px);
  `}
`;

const BoostLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const BoostAmount = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: baseline;
  gap: 6px;

  small {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
  }
`;

const BoostLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const KenyanQuote = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
`;

const BoostRight = styled.div`
  display: flex;
  align-items: center;
`;

const BoostPoints = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ConfirmButton = styled.button`
  width: 100%;
  background: #dc2626;
  color: white;
  border: none;
  padding: 18px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
  animation: ${(props) => (props.$animate ? pulse : "none")} 1.5s infinite;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 10px;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const QuoteStrip = styled.div`
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 0.5px solid rgba(255, 255, 255, 0.05);
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;



const getLoggedInUserId = () => {
  const userData = localStorage.getItem("user_data");
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user.user_id) return user.user_id;
      if (user.id) return user.id;
    } catch (e) {
      console.error(e);
    }
  }
  return null;
};

const getCurrentUser = () => {
  const userData = localStorage.getItem("user_data");
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (e) {
      return null;
    }
  }
  return null;
};

const BoostModal = ({
  isOpen,
  onClose,
  onBoost,
  targetName,
  targetId,
  targetType = "endorsement", // 'endorsement' or 'leader'
}) => {
  const [selectedBoost, setSelectedBoost] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [boosting, setBoosting] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const user = getCurrentUser();
    const id = getLoggedInUserId();

    if (id) {
      setUserId(id);
      setCurrentUser(user);
    } else {
      setError("Please log in to boost");
    }
  }, [isOpen]);

  // Fetch wallet balance from wallet service (port 8005)
  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchBalance = async () => {
      setLoading(true);
      try {
       
        const response = await api.get(`/wallet/balance/${userId}`);
        if (response.data?.success) {
          setWalletBalance(response.data.data.balance || 0);
        
        } else {
          console.error("❌ Failed to fetch balance:", response.data);
          setWalletBalance(0);
        }
      } catch (err) {
       
        setError("Could not fetch wallet balance. Please try again.");
        setWalletBalance(0);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, [isOpen, userId]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedBoost(null);
      setError(null);
    }
  }, [isOpen]);

  const handleBoost = async () => {
    if (!selectedBoost || !userId) {
      setError("Please select an amount and ensure you're logged in");
      return;
    }

    if (walletBalance < selectedBoost.amount) {
      setError(
        `Insufficient balance! Need ${selectedBoost.amount} KES. You have ${walletBalance} KES.`,
      );
      return;
    }

    if (!targetId) {
      setError("Invalid target ID");
      return;
    }

    setBoosting(true);
    setError(null);

    try {
      let response;

      if (targetType === "leader") {
        response = await api.post(`/leaders/${targetId}/boost`, {
          user_id: userId,
          amount: selectedBoost.amount,
        });
      } else {
        response = await api.post(`/endorsements/${targetId}/boost`, {
          user_id: userId,
          amount: selectedBoost.amount,
        });
      }

      

      if (response.data?.success) {
        // Update local balance
        setWalletBalance((prev) => prev - selectedBoost.amount);

        // Call the callback
        if (onBoost) {
          await onBoost(targetId, selectedBoost.amount);
        }

        // Close modal on success
        onClose();
      } else {
        setError(response.data?.message || "Failed to boost");
      }
    } catch (err) {
      console.error("❌ Boost error:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to boost. Please try again.",
      );
    } finally {
      setBoosting(false);
    }
  };

  if (!isOpen) return null;

  if (!userId) {
    return (
      <>
        <Overlay onClick={onClose} />
        <ModalContainer>
          <ModalHeader>
            <h3>
              <Zap size={20} color="#dc2626" /> Authentication Required
            </h3>
            <button onClick={onClose}>
              <X size={18} />
            </button>
          </ModalHeader>
          <ModalContent>
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Shield size={48} color="#ef4444" />
              <p style={{ marginTop: 16, color: "white" }}>
                Please log in to boost
              </p>
              <button
                onClick={() => (window.location.href = "/login")}
                style={{
                  marginTop: 20,
                  background: "#dc2626",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Go to Login
              </button>
            </div>
          </ModalContent>
        </ModalContainer>
      </>
    );
  }

  const isLeaderBoost = targetType === "leader";
  const icon = isLeaderBoost ? (
    <Crown size={20} color="#dc2626" />
  ) : (
    <TrendingUp size={20} color="#dc2626" />
  );
  const title = isLeaderBoost
    ? `Boost ${targetName?.split(" ")[0] || "Leader"}'s Campaign`
    : `Boost ${targetName?.split(" ")[0] || "Endorsement"}`;

  return (
    <>
      <Overlay onClick={onClose} />
      <ModalContainer>
        <ModalHeader>
          <h3>
            {icon} {title}
          </h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </ModalHeader>

        <ModalContent>
          <WalletSection>
            <WalletTitle>
              <Wallet size={12} /> YOUR BALANCE
            </WalletTitle>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <WalletAmount>
                {walletBalance?.toLocaleString()} <span>KES</span>
              </WalletAmount>
            )}
          </WalletSection>

          {error && (
            <InsufficientAlert>
              <AlertCircle size={16} /> {error}
            </InsufficientAlert>
          )}

          <BoostGrid>
            {BOOST_AMOUNTS.map((boost) => (
              <BoostCard
                key={boost.amount}
                $selected={selectedBoost?.amount === boost.amount}
                onClick={() =>
                  walletBalance >= boost.amount && setSelectedBoost(boost)
                }
                disabled={walletBalance < boost.amount}
              >
                <BoostLeft>
                  <BoostAmount>
                    {boost.amount} <small>KES</small>
                  </BoostAmount>
                  <BoostLabel>
                    {boost.emoji} {boost.label}
                  </BoostLabel>
                  <KenyanQuote>
                    "{boost.quote}" — {boost.meaning}
                  </KenyanQuote>
                </BoostLeft>
                <BoostRight>
                  <BoostPoints>
                    <Coins size={12} /> +{boost.points} pts
                  </BoostPoints>
                </BoostRight>
              </BoostCard>
            ))}
          </BoostGrid>

          <ConfirmButton
            onClick={handleBoost}
            disabled={!selectedBoost || boosting}
            $animate={!selectedBoost}
          >
            {boosting ? (
              <LoadingSpinner />
            ) : (
              <>
                <Crown size={18} />{" "}
                {selectedBoost
                  ? `Boost with ${selectedBoost.amount} KES`
                  : "Select amount to boost"}
              </>
            )}
          </ConfirmButton>

          <QuoteStrip>
            <Sparkles size={10} /> WEKA MAWE • WEKA PAWA • FINYANGA{" "}
            <Flame size={10} />
          </QuoteStrip>
        </ModalContent>
      </ModalContainer>
    </>
  );
};

const ENDORSEMENT_API_URL = "/api/v1";

export default BoostModal;
