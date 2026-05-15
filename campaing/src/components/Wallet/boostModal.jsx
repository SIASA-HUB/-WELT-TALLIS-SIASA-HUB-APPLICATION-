// BoostModal.js - Updated with Leader Boost Support
import React, { useState, useEffect, useRef } from "react";
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
  Smartphone,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Phone
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

const StatusBox = styled.div`
  padding: 16px; border-radius: 14px; text-align: center; margin-bottom: 18px;
  background: ${p => p.$t === 'success' ? 'rgba(16,185,129,.08)' : p.$t === 'error' ? 'rgba(239,68,68,.08)' : 'rgba(220,38,38,.06)'};
  border: 1px solid ${p => p.$t === 'success' ? 'rgba(16,185,129,.2)' : p.$t === 'error' ? 'rgba(239,68,68,.2)' : 'rgba(220,38,38,.15)'};
  .iw {
    width: 52px; height: 52px; border-radius: 50%; margin: 0 auto 10px;
    display: flex; align-items: center; justify-content: center;
    background: ${p => p.$t === 'success' ? '#dcfce7' : p.$t === 'error' ? '#fee2e2' : 'rgba(220,38,38,0.1)'};
    animation: ${p => p.$t === 'waiting' ? 'pulseGlow 2s infinite' : 'none'};
  }
  .title { font-size: 15px; font-weight: 800; color: white; margin-bottom: 6px; }
  .desc  { font-size: 12px; color: rgba(255,255,255,0.6); line-height: 1.5; }
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.4); }
    50% { box-shadow: 0 0 0 12px rgba(220,38,38,0); }
  }
`;

const PhoneInput = styled.input`
  width: 100%; background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 12px; padding: 13px 16px; color: white; font-size: 18px;
  text-align: center; box-sizing: border-box; margin-bottom: 16px;
  &:focus { outline: none; border-color: #dc2626; background: rgba(255,255,255,0.08); }
  &::placeholder { color: rgba(255,255,255,0.3); }
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

  // STK Push states
  const [step, setStep] = useState("selection"); // selection | stk_input | stk_waiting | success | error
  const [phone, setPhone] = useState("");
  const [pollTxId, setPollTxId] = useState(null);
  const pollTimerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const user = getCurrentUser();
    const id = getLoggedInUserId();

    if (id) {
      setUserId(id);
      setCurrentUser(user);
      if (user.phone) setPhone(user.phone.replace(/^\+?0?/, "254"));
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
      setStep("selection");
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    }
  }, [isOpen]);

  const startPolling = (txId) => {
    setPollTxId(txId);
    setStep("stk_waiting");
    let attempts = 0;
    pollTimerRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await api.get(`/wallet/status/${txId}`);
        if (res?.data?.status === "completed") {
          clearInterval(pollTimerRef.current);
          // Payment confirmed! Now execute the boost
          handleActualBoost();
        } else if (res?.data?.status === "failed") {
          clearInterval(pollTimerRef.current);
          setStep("error");
          const failReason = res.data.description?.split('|').pop()?.trim() || "Transaction Failed";
          setError(failReason);
        }
      } catch (e) { console.error("Poll error:", e); }

      if (attempts >= 20) {
        clearInterval(pollTimerRef.current);
        setStep("error");
        setError("Payment timeout. Please check your M-Pesa and try again.");
      }
    }, 4000);
  };

  const handleStkPush = async () => {
    if (!phone || phone.length < 9) { setError("Enter a valid M-Pesa number"); return; }
    if (selectedBoost.amount > 150000) {
      setError("M-Pesa STK Push limit is KES 150,000. Please use a smaller amount or contact support.");
      return;
    }
    setBoosting(true);
    setError(null);
    try {
      const formatted = phone.startsWith("254") ? phone : phone.startsWith("0") ? "254" + phone.slice(1) : "254" + phone;
      const res = await api.post("/wallet/mpesa/stkpush", {
        phoneNumber: formatted,
        amount: selectedBoost.amount,
        accountReference: `BOOST-${targetId.substring(0, 6)}`,
        userId: userId,
        origin: "boost"
      });

      if (res?.success) {
        const txId = res.data?.checkoutRequestId;
        if (txId) startPolling(txId);
        else setError("Payment initiated but tracking ID missing");
      } else {
        setError(res?.message || "Payment initiation failed");
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Payment failed to start");
    } finally {
      setBoosting(false);
    }
  };

  const handleActualBoost = async () => {
    setBoosting(true);
    setStep("selection"); // Go back to selection mode for error handling if needed
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
        if (onBoost) await onBoost(targetId, selectedBoost.amount);
        onClose();
      } else {
        setError(response.data?.message || "Failed to process boost action");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to boost after payment");
    } finally {
      setBoosting(false);
    }
  };

  const handleBoost = async () => {
    if (!selectedBoost || !userId) {
      setError("Please select an amount");
      return;
    }

    if (walletBalance < selectedBoost.amount) {
      setStep("stk_input");
      setError(null);
      return;
    }

    handleActualBoost();
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

          {step === "selection" && (
            <>
              <BoostGrid>
                {BOOST_AMOUNTS.map((boost) => (
                  <BoostCard
                    key={boost.amount}
                    $selected={selectedBoost?.amount === boost.amount}
                    onClick={() => setSelectedBoost(boost)}
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
                      ? walletBalance >= selectedBoost.amount
                        ? `Boost with ${selectedBoost.amount} KES`
                        : `Pay KES ${selectedBoost.amount} & Boost`
                      : "Select amount to boost"}
                  </>
                )}
              </ConfirmButton>
            </>
          )}

          {step === "stk_input" && (
            <>
              <div style={{ padding: "20px 0" }}>
                <WalletTitle><Smartphone size={12} /> M-PESA CHECKOUT</WalletTitle>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", marginBottom: "20px" }}>
                  Confirm your M-Pesa number to receive the payment prompt for <strong>KES {selectedBoost.amount}</strong>.
                </p>
                <PhoneInput
                  placeholder="2547XXXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  autoFocus
                />
                <ConfirmButton onClick={handleStkPush} disabled={boosting}>
                  {boosting ? <LoadingSpinner /> : <><Smartphone size={18} /> Send Prompt</>}
                </ConfirmButton>
                <button
                  onClick={() => setStep("selection")}
                  style={{ width: "100%", background: "none", border: "none", color: "rgba(255,255,255,0.4)", marginTop: "12px", fontSize: "13px", cursor: "pointer" }}
                >
                  Go Back
                </button>
              </div>
            </>
          )}

          {step === "stk_waiting" && (
            <div style={{ padding: "30px 0" }}>
              <StatusBox $t="waiting">
                <div className="iw"><Phone size={22} color="#dc2626" /></div>
                <div className="title">Check Your Phone</div>
                <div className="desc">Enter M-Pesa PIN on <strong>{phone}</strong> to confirm KES {selectedBoost.amount}.</div>
              </StatusBox>
              <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
                <LoadingSpinner /> Waiting for confirmation...
              </div>
              <button
                onClick={() => setStep("selection")}
                style={{ width: "100%", background: "none", border: "none", color: "rgba(255,255,255,0.4)", marginTop: "24px", fontSize: "13px", cursor: "pointer" }}
              >
                Cancel & Go Back
              </button>
            </div>
          )}

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
