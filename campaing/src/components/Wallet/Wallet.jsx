import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Zap,
  Smartphone,
  ArrowRight,
  Shield,
  Fingerprint,
  Coins,
  Wallet,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  AtSign,
} from "lucide-react";
import walletApi from "./ApiConfig"; // Import the wallet API

const Container = styled.div`
  padding: 40px 24px;
  background: #000;
  color: white;
  max-width: 400px;
  margin: 0 auto;
  font-family: -apple-system, Inter, sans-serif;
  min-height: 100vh;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  opacity: 0.8;
`;

const Brand = styled.div`
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 3px;
  display: flex;
  align-items: center;
  gap: 8px;
  span {
    color: #10b981;
  }
`;

const BalanceWrapper = styled.div`
  margin-bottom: 48px;
  text-align: left;
`;

const MiniLabel = styled.div`
  font-size: 9px;
  font-weight: 800;
  color: #10b981;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PointsDisplay = styled.h1`
  font-size: 3.8rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: -4px;
  line-height: 0.9;
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;

  .points {
    font-size: 3.8rem;
    font-weight: 900;
    letter-spacing: -4px;
  }

  .pts-label {
    font-size: 11px;
    letter-spacing: 2px;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.3);
    text-transform: uppercase;
  }
`;

const InputGroup = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  transition: all 0.2s;

  &:focus-within {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.02);
  }

  input {
    background: transparent;
    border: none;
    color: white;
    font-size: 14px;
    font-weight: 500;
    width: 100%;
    margin-left: 10px;
    outline: none;
    &::placeholder {
      color: rgba(255, 255, 255, 0.2);
    }
  }
`;

const ChipGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 24px;
`;

const SmallChip = styled.button`
  background: ${(props) => (props.$active ? "#10b981" : "transparent")};
  color: ${(props) => (props.$active ? "#000" : "rgba(255,255,255,0.6)")};
  border: 1px solid
    ${(props) => (props.$active ? "#10b981" : "rgba(255,255,255,0.1)")};
  padding: 12px 0;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: ${(props) => !props.$active && "rgba(16, 185, 129, 0.5)"};
    transform: translateY(-1px);
  }
`;

const CustomAmountInput = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;

  input {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 12px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    outline: none;

    &:focus {
      border-color: #10b981;
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
  }
`;

const BonusInfo = styled.div`
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 24px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .bonus-text {
    color: #10b981;
    font-weight: 600;
  }

  .bonus-value {
    font-weight: 800;
    color: #10b981;
  }
`;

const SleekButton = styled.button`
  background: #10b981;
  color: white;
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 16px;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #0d9f6e;
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RefreshButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  font-size: 12px;
  text-align: center;
  margin-top: 12px;
  padding: 8px;
  background: rgba(255, 68, 68, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const SuccessMessage = styled.div`
  color: #10b981;
  font-size: 12px;
  text-align: center;
  margin-top: 12px;
  padding: 8px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const PhonePrefix = styled.span`
  color: #10b981;
  font-weight: 600;
  font-size: 14px;
`;

// Auth Service to get current user
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

// Format phone number for Kenya
const formatKenyanPhone = (phone) => {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1);
  }
  if (!cleaned.startsWith("254")) {
    cleaned = "254" + cleaned;
  }
  return cleaned;
};

const Header = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bonus, setBonus] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);

  // Get logged-in user from localStorage/cookies
  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.user_id) {
      setCurrentUser(user);
      setUserId(user.user_id);
      setIsAuthenticated(true);
      console.log("✅ User found in localStorage:", user.user_id);
    } else {
      // Try to get from cookie using walletApi
      const getUserFromCookie = async () => {
        try {
          const response = await walletApi.get("/user-info");
          if (response.data.success) {
            setCurrentUser(response.data.user);
            setUserId(response.data.user.user_id);
            setIsAuthenticated(true);
            console.log("✅ User found in cookie:", response.data.user.user_id);
          }
        } catch (err) {
          console.error("❌ No logged-in user found");
        }
      };
      getUserFromCookie();
    }
  }, []);

  // Fetch wallet balance when user is loaded
  useEffect(() => {
    if (userId) {
      fetchBalance();
      fetchTransactions();
    }
  }, [userId]);

  // Calculate bonus based on amount
  const calculateBonus = (amount) => {
    if (amount >= 5 && amount < 100) return 0;
    if (amount >= 100 && amount < 500) return Math.floor(amount * 0.1);
    if (amount >= 500 && amount < 1000) return Math.floor(amount * 0.2);
    if (amount >= 1000 && amount < 5000) return Math.floor(amount * 0.25);
    if (amount >= 5000 && amount < 10000) return Math.floor(amount * 0.3);
    if (amount >= 10000) return Math.floor(amount * 0.35);
    return 0;
  };

  // Update bonus when amount changes
  useEffect(() => {
    const amount = getCurrentAmount();
    setBonus(calculateBonus(amount));
  }, [selectedAmount, customAmount]);

  const getCurrentAmount = () => {
    if (customAmount && customAmount !== "") {
      return parseInt(customAmount) || 0;
    }
    return selectedAmount;
  };

  const fetchBalance = async () => {
    if (!userId) return;
    try {
      console.log("🔍 Fetching balance for user:", userId);
      const response = await walletApi.get(`/balance/${userId}`);
      console.log("📊 Balance response:", response.data);
      if (response.data.success) {
        setBalance(response.data.data.balance);
      } else {
        console.error("❌ Balance fetch failed:", response.data.message);
      }
    } catch (err) {
      console.error("❌ Error fetching balance:", err);
      setError("Failed to fetch balance");
    }
  };

  const fetchTransactions = async () => {
    if (!userId) return;
    try {
      const response = await walletApi.get(`/transactions/${userId}?limit=5`);
      if (response.data.success) {
        setTransactions(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const handleDeposit = async () => {
    const amount = getCurrentAmount();

    if (amount < 5) {
      setError("Minimum deposit is 5 KES");
      return;
    }

    if (!phoneNumber) {
      setError("Phone number is required for M-Pesa payment");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formattedPhone = formatKenyanPhone(phoneNumber);

      const payload = {
        user_id: userId,
        amount: amount,
        phone_number: formattedPhone,
        email: currentUser?.email || `${userId}@siasahub.com`,
        first_name:
          currentUser?.real_name || currentUser?.username || "SiasaHub User",
      };

      console.log("📤 Sending deposit request:", payload);

      const response = await walletApi.post("/deposit", payload);

      console.log("📥 Deposit response:", response.data);

      if (response.data.success) {
        if (response.data.data?.redirect_url) {
          window.location.href = response.data.data.redirect_url;
        } else {
          setSuccess(
            `Payment initiated! Check your phone for M-Pesa prompt...`,
          );
          setTimeout(() => {
            if (response.data.data?.redirect_url) {
              window.location.href = response.data.data.redirect_url;
            }
          }, 2000);
        }
      } else {
        setError(response.data.message || "Failed to initiate payment");
      }
    } catch (err) {
      console.error("❌ Deposit error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to initiate payment. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setCustomAmount(value);
      if (value !== "") {
        setSelectedAmount(null);
      }
    }
  };

  const handleChipClick = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <Container>
        <TopBar>
          <Brand>
            <Fingerprint size={14} /> Siasa <span>Credits</span>
          </Brand>
        </TopBar>
        <div style={{ textAlign: "center", marginTop: "100px" }}>
          <Shield size={48} color="#10b981" />
          <h3 style={{ marginTop: 20, color: "white" }}>Please Login</h3>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 10 }}>
            You need to be logged in to access your wallet
          </p>
          <SleekButton onClick={() => (window.location.href = "/login")}>
            Go to Login
          </SleekButton>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <TopBar>
        <Brand>
          <Fingerprint size={14} /> Siasa<span>Hub</span>
        </Brand>
        <RefreshButton
          onClick={() => {
            fetchBalance();
            fetchTransactions();
          }}
        >
          <RefreshCw size={14} color="rgba(255,255,255,0.6)" />
        </RefreshButton>
      </TopBar>

      <BalanceWrapper>
        <MiniLabel>
          <Wallet size={10} /> Available Balance
        </MiniLabel>
        <PointsDisplay>
          <span className="points">{balance.toLocaleString()}</span>
          <span className="pts-label">pts</span>
        </PointsDisplay>
      </BalanceWrapper>

      {/* M-Pesa Phone Input */}
      <MiniLabel style={{ marginBottom: 12 }}>
        <Smartphone size={10} /> M-Pesa Number
      </MiniLabel>
      <InputGroup>
        <PhonePrefix>+254</PhonePrefix>
        <input
          type="tel"
          placeholder="7XXXXXXXX (e.g., 712345678)"
          value={phoneNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setPhoneNumber(value);
          }}
        />
      </InputGroup>

      <MiniLabel style={{ marginBottom: 12 }}>
        <Coins size={10} /> Choose Amount (KES)
      </MiniLabel>
      <ChipGrid>
        {[10, 50, 100, 200, 500, 1000].map((val) => (
          <SmallChip
            key={val}
            $active={selectedAmount === val && !customAmount}
            onClick={() => handleChipClick(val)}
          >
            {val}
          </SmallChip>
        ))}
      </ChipGrid>

      <CustomAmountInput>
        <input
          type="text"
          placeholder="Custom amount (min 5)"
          value={customAmount}
          onChange={handleCustomAmountChange}
        />
      </CustomAmountInput>

      {bonus > 0 && (
        <BonusInfo>
          <span className="bonus-text">🎁 Bonus Points</span>
          <span className="bonus-value">+{bonus} pts</span>
        </BonusInfo>
      )}

      <SleekButton onClick={handleDeposit} disabled={loading}>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            Pay KES {getCurrentAmount()} via M-Pesa
            {bonus > 0 && ` (Get ${getCurrentAmount() + bonus} points)`}
            <ArrowRight size={14} />
          </>
        )}
      </SleekButton>

      {error && (
        <ErrorMessage>
          <AlertCircle size={14} />
          {error}
        </ErrorMessage>
      )}

      {success && (
        <SuccessMessage>
          <CheckCircle size={14} />
          {success}
        </SuccessMessage>
      )}

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <MiniLabel>Recent Transactions</MiniLabel>
          {transactions.slice(0, 3).map((tx) => (
            <div
              key={tx.transaction_id}
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 8,
                padding: "12px",
                marginBottom: 8,
                fontSize: "11px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ color: "rgba(255,255,255,0.8)" }}>
                  {tx.type === "deposit"
                    ? "💳 Deposit"
                    : tx.type === "bonus"
                      ? "🎁 Bonus"
                      : tx.type === "endorsement"
                        ? "✨ Endorsement"
                        : tx.type}
                </div>
                <div
                  style={{ color: "rgba(255,255,255,0.4)", fontSize: "9px" }}
                >
                  {new Date(tx.created_at).toLocaleDateString()}
                </div>
              </div>
              <div
                style={{
                  color:
                    tx.type === "deposit" || tx.type === "bonus"
                      ? "#10b981"
                      : "#ff8c42",
                  fontWeight: 600,
                }}
              >
                {tx.type === "deposit" || tx.type === "bonus" ? "+" : "-"}{" "}
                {tx.amount} pts
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "40px", opacity: 0.1 }}>
        <span
          style={{ fontSize: "7px", fontWeight: 900, letterSpacing: "5px" }}
        >
          POWERED BY PESAPAL • M-PESA
        </span>
      </div>
    </Container>
  );
};

export default Header;
