// AccountBillingSection.js - Real Backend Integration with M-Pesa STK Push
import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  ShieldCheck,
  Smartphone,
  BarChart3,
  Rocket,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Zap,
  ChevronRight,
  Lock,
  Sparkles,
  X,
  Loader,
} from "lucide-react";
import api from "../../../api/api"; // Fixed import path to centralized API

// --- Animations ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// --- Pricing Data (Based on Founder's Directive) ---
const PRICING = {
  president: {
    verification: 250000,
    analytics: { monthly: 416667, yearly: 5000000 },
    boost: 200000,
    leaderboard: 100000,
  },
  governor: {
    verification: 70000,
    analytics: { monthly: 15000, yearly: 100000 },
    boost: 50000,
    leaderboard: 15000,
  },
  senator: {
    verification: 50000,
    analytics: { monthly: 15000, yearly: 100000 },
    boost: 5000,
    leaderboard: 15000,
  },
  mp: {
    verification: 60000,
    analytics: { monthly: 15000, yearly: 100000 },
    boost: 5000,
    leaderboard: 15000,
  },
  womenRep: {
    verification: 20000,
    analytics: { monthly: 1000, yearly: 8000 },
    boost: 2000,
    leaderboard: 10000,
  },
  mca: {
    verification: 10000,
    analytics: { monthly: 1000, yearly: 8000 },
    boost: 1000,
    leaderboard: 5000,
  },
};

// --- Styled Components ---
const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 20px;
  background: #f5f7fa;
  min-height: 100vh;
  animation: ${fadeInUp} 0.3s ease-out;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const TitleSection = styled.div`
  h1 {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 4px;
    color: #1a1a2e;
    letter-spacing: -0.3px;
  }
  p {
    margin: 0;
    color: #6c757d;
    font-size: 13px;
  }
`;

const PositionCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 32px;
  border: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  .title {
    font-size: 13px;
    color: #6c757d;
    margin-bottom: 4px;
  }

  .position {
    font-size: 18px;
    font-weight: 700;
    color: #1a1a2e;
  }
`;

const BillingToggle = styled.div`
  display: flex;
  gap: 8px;
  background: #f1f3f5;
  padding: 4px;
  border-radius: 40px;
  width: fit-content;
  margin-bottom: 24px;
`;

const ToggleButton = styled.button`
  padding: 8px 24px;
  border-radius: 40px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  background: ${(props) => (props.active ? "white" : "transparent")};
  color: ${(props) => (props.active ? "#1e3c72" : "#6c757d")};
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${(props) =>
    props.active ? "0 1px 3px rgba(0,0,0,0.05)" : "none"};

  &:hover {
    color: #1e3c72;
  }
`;

const ServicesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
`;

const ServiceCard = styled.div`
  background: white;
  border-radius: 20px;
  border: 1px solid #e9ecef;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    border-color: #1e3c72;
  }
`;

const ServiceHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fafbfc;
  border-bottom: 1px solid #e9ecef;

  @media (max-width: 640px) {
    flex-wrap: wrap;
  }
`;

const IconBox = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f1f3f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e3c72;
`;

const ServiceInfo = styled.div`
  flex: 1;

  h3 {
    margin: 0 0 4px;
    font-size: 16px;
    font-weight: 700;
    color: #1a1a2e;
  }

  p {
    margin: 0;
    font-size: 12px;
    color: #6c757d;
  }
`;

const PriceTag = styled.div`
  text-align: right;

  .amount {
    font-size: 22px;
    font-weight: 700;
    color: #1a1a2e;
  }

  .period {
    font-size: 11px;
    color: #6c757d;
  }

  @media (max-width: 640px) {
    text-align: left;
  }
`;

const ServiceBody = styled.div`
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const Features = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const Feature = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #495057;

  svg {
    width: 14px;
    height: 14px;
    color: #10b981;
  }
`;

const PayButton = styled.button`
  padding: 10px 24px;
  background: #1e3c72;
  color: white;
  border: none;
  border-radius: 40px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: #152c54;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #adb5bd;
    cursor: not-allowed;
    transform: none;
  }
`;

const TransactionSection = styled.div`
  background: white;
  border-radius: 20px;
  border: 1px solid #e9ecef;
  overflow: hidden;
  margin-top: 8px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fafbfc;
  border-bottom: 1px solid #e9ecef;

  h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #1a1a2e;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const TransactionRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 1fr;
  padding: 12px 20px;
  border-bottom: 1px solid #f1f3f5;
  font-size: 13px;

  &:hover {
    background: #fafbfc;
  }

  .service {
    font-weight: 500;
    color: #1a1a2e;
  }
  .date {
    color: #6c757d;
  }
  .ref {
    color: #6c757d;
    font-family: monospace;
    font-size: 11px;
  }
  .amount {
    text-align: right;
    font-weight: 600;
    color: #1e3c72;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: #adb5bd;

  svg {
    margin-bottom: 12px;
    opacity: 0.5;
  }
`;

// Payment Modal
const PaymentModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeInUp} 0.2s ease;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 400px;
  width: 90%;
  padding: 24px;
  text-align: center;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 18px;
    color: #1a1a2e;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    color: #6c757d;
  }
`;

const PhoneInput = styled.input`
  width: 100%;
  padding: 14px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  font-size: 14px;
  margin: 16px 0;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #1e3c72;
  }
`;

const StatusMessage = styled.div`
  padding: 12px;
  border-radius: 12px;
  margin: 16px 0;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  background: ${(props) =>
    props.$type === "success"
      ? "#d4edda"
      : props.$type === "error"
        ? "#f8d7da"
        : "#e8f4fd"};
  color: ${(props) =>
    props.$type === "success"
      ? "#155724"
      : props.$type === "error"
        ? "#721c24"
        : "#1e3c72"};
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #e9ecef;
  border-top-color: #1e3c72;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
  display: inline-block;
`;

const getPositionKey = (position) => {
  const pos = position?.toLowerCase() || "";
  if (pos.includes("president")) return "president";
  if (pos.includes("governor")) return "governor";
  if (pos.includes("senator")) return "senator";
  if (pos.includes("mp") || pos.includes("member of parliament")) return "mp";
  if (pos.includes("women rep") || pos.includes("woman rep")) return "womenRep";
  return "mca";
};

const formatPrice = (price) => {
  if (price >= 1000000) return `${(price / 1000000).toFixed(0)}M`;
  if (price >= 1000) return `${(price / 1000).toFixed(0)}K`;
  return price.toString();
};

const AccountBillingSection = ({ leader = null }) => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const positionKey = getPositionKey(leader?.position);
  const pricing = PRICING[positionKey] || PRICING.mca;

  useEffect(() => {
    // Try to get user data from localStorage (multiple possible keys)
    const userData = localStorage.getItem("user_data") || 
                     localStorage.getItem("leaderData") ||
                     localStorage.getItem("aspirant_data");
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        // Set default phone number from user data if available
        if (user.phone || user.phoneNumber) {
          setPhoneNumber(user.phone || user.phoneNumber);
        }
        const userId = user.user_id || user.id || user._id || user.leader_id;
        if (userId) {
          fetchTransactions(userId);
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  const fetchTransactions = async (userId) => {
    try {
      // Using centralized API - the interceptor handles response.data extraction
      const response = await api.get(`/wallet/transactions/${userId}?limit=10`);
      // api interceptor already returns response.data, so response is the data object
      if (response?.success) {
        setTransactions(response.data || []);
      } else if (Array.isArray(response)) {
        setTransactions(response);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    }
  };

  const handlePaymentClick = (service, amount) => {
    if (!currentUser) {
      alert("Please log in to make a payment");
      return;
    }
    setSelectedService({ name: service, amount });
    setShowPaymentModal(true);
    setPaymentStatus(null);
  };

  const processMpesaPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setPaymentStatus({
        type: "error",
        message: "Please enter a valid phone number (e.g., 2547XXXXXXXX)",
      });
      return;
    }

    setPaymentLoading(true);
    setPaymentStatus(null);

    try {
      // Format phone number (ensure it starts with 254)
      let formattedPhone = phoneNumber.replace(/\s/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "254" + formattedPhone.substring(1);
      }
      if (!formattedPhone.startsWith("254")) {
        formattedPhone = "254" + formattedPhone;
      }

      const userId = currentUser.user_id || currentUser.id || currentUser._id || currentUser.leader_id;
      const leaderId = leader?.leader_id || leader?.id || userId;

      // Call STK Push endpoint via centralized api
      const response = await api.post("/wallet/mpesa/stkpush", {
        phoneNumber: formattedPhone,
        amount: selectedService.amount,
        accountReference: selectedService.name.substring(0, 12),
        userId: userId,
        leader_id: leaderId,
      });

      if (response?.success) {
        setPaymentStatus({
          type: "success",
          message: response.message || "Payment initiated! Check your phone for M-Pesa prompt.",
        });

        // Poll for transaction status
        const checkoutRequestId = response.data?.checkoutRequestId;
        if (checkoutRequestId) {
          const checkInterval = setInterval(async () => {
            try {
              const statusRes = await api.get(`/wallet/status/${checkoutRequestId}`);
              if (statusRes?.success && statusRes.data?.status === "completed") {
                clearInterval(checkInterval);
                setPaymentStatus({
                  type: "success",
                  message: "Payment successful! Service activated.",
                });
                // Refresh transactions
                if (userId) {
                  await fetchTransactions(userId);
                }
                setTimeout(() => {
                  setShowPaymentModal(false);
                  setSelectedService(null);
                  setPhoneNumber("");
                }, 2000);
              } else if (statusRes?.success && statusRes.data?.status === "failed") {
                clearInterval(checkInterval);
                setPaymentStatus({
                  type: "error",
                  message: "Payment failed or cancelled.",
                });
              }
            } catch (err) {
              console.error("Error checking payment status:", err);
            }
          }, 3000);

          // Stop polling after 60 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
          }, 60000);
        }
      } else {
        setPaymentStatus({
          type: "error",
          message: response?.message || "Payment failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus({
        type: "error",
        message: error.response?.data?.message || error.message || "Payment failed. Please check your phone number and try again.",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const services = [
    {
      id: "verification",
      title: "Official Verification",
      description: "Get verified badge and anti-impersonation protection",
      price: pricing.verification,
      period: "one-time",
      features: [
        "Blue verification badge",
        "Priority search ranking",
        "Verified filter",
      ],
      icon: <ShieldCheck size={22} />,
    },
    {
      id: "analytics",
      title: "Data & Analytics",
      description: "Deep insights into voter demographics and engagement",
      price:
        billingCycle === "monthly"
          ? pricing.analytics.monthly
          : pricing.analytics.yearly,
      period: billingCycle === "monthly" ? "month" : "year",
      features: ["Voter demographics", "Real-time metrics", "Export reports"],
      icon: <BarChart3 size={22} />,
    },
    {
      id: "boost",
      title: "Manifesto Boost",
      description: "Get featured placement and increased visibility",
      price: pricing.boost,
      period: "month",
      features: ["5x more visits", "Featured placement", "Priority listing"],
      icon: <Rocket size={22} />,
    },
    {
      id: "leaderboard",
      title: "Leaderboard",
      description: "Premium placement on national and county leaderboards",
      price: pricing.leaderboard,
      period: "month",
      features: ["Top position", "Premium badge", "Increased visibility"],
      icon: <TrendingUp size={22} />,
    },
  ];

  return (
    <Container>
      <Header>
        <TitleSection>
          <h1>Campaign Services</h1>
          <p>
            Premium features to boost your campaign • Pay directly with M-Pesa
          </p>
        </TitleSection>
      </Header>

      {/* Position Display */}
      <PositionCard>
        <div>
          <div className="title">Your Position</div>
          <div className="position">{leader?.position || "MCA"}</div>
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#10b981",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <CheckCircle2 size={14} />
          Auto-detected
        </div>
      </PositionCard>

      {/* Billing Toggle */}
      <BillingToggle>
        <ToggleButton
          active={billingCycle === "monthly"}
          onClick={() => setBillingCycle("monthly")}
        >
          Monthly
        </ToggleButton>
        <ToggleButton
          active={billingCycle === "yearly"}
          onClick={() => setBillingCycle("yearly")}
        >
          Yearly <span style={{ fontSize: "10px" }}>(Save 20%)</span>
        </ToggleButton>
      </BillingToggle>

      {/* Services List */}
      <ServicesGrid>
        {services.map((service) => (
          <ServiceCard key={service.id}>
            <ServiceHeader>
              <IconBox>{service.icon}</IconBox>
              <ServiceInfo>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </ServiceInfo>
              <PriceTag>
                <div className="amount">KES {formatPrice(service.price)}</div>
                <div className="period">/{service.period}</div>
              </PriceTag>
            </ServiceHeader>
            <ServiceBody>
              <Features>
                {service.features.map((feature, idx) => (
                  <Feature key={idx}>
                    <CheckCircle2 size={12} />
                    {feature}
                  </Feature>
                ))}
              </Features>
              <PayButton
                onClick={() => handlePaymentClick(service.title, service.price)}
                disabled={loading}
              >
                <Smartphone size={14} />
                Pay with M-Pesa
                <ChevronRight size={14} />
              </PayButton>
            </ServiceBody>
          </ServiceCard>
        ))}
      </ServicesGrid>

      {/* Payment Info Note */}
      <div
        style={{
          background: "#e8f4fd",
          padding: "12px 16px",
          borderRadius: "12px",
          marginBottom: "24px",
          fontSize: "12px",
          color: "#1e3c72",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Lock size={14} />
        <span>
          Secure M-Pesa payments. You'll receive a prompt on your phone to
          complete payment.
        </span>
      </div>

      {/* Transactions */}
      <TransactionSection>
        <SectionHeader>
          <h4>
            <Clock size={14} /> Recent Payments
          </h4>
          <span style={{ fontSize: "11px", color: "#6c757d" }}>
            Last 10 transactions
          </span>
        </SectionHeader>

        {transactions.length === 0 ? (
          <EmptyState>
            <CreditCard size={28} />
            <p>No transactions yet</p>
            <p style={{ fontSize: "11px", marginTop: "4px" }}>
              Your payment history will appear here
            </p>
          </EmptyState>
        ) : (
          <>
            <TransactionRow
              style={{
                background: "#fafbfc",
                fontWeight: 500,
                fontSize: "12px",
              }}
            >
              <div>Service</div>
              <div>Date</div>
              <div>Reference</div>
              <div style={{ textAlign: "right" }}>Amount</div>
            </TransactionRow>
            {transactions.map((tx, index) => (
              <TransactionRow key={tx.id || index}>
                <div className="service">{tx.type || "Payment"}</div>
                <div className="date">
                  {new Date(tx.completed_at || tx.date || Date.now()).toLocaleDateString()}
                </div>
                <div className="ref">{tx.transaction_id || `TXN-${tx.id || index}`}</div>
                <div className="amount">KES {tx.amount?.toLocaleString() || 0}</div>
              </TransactionRow>
            ))}
          </>
        )}
      </TransactionSection>

      {/* Payment Modal */}
      {showPaymentModal && selectedService && (
        <PaymentModal onClick={() => setShowPaymentModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>M-Pesa Payment</h3>
              <button onClick={() => setShowPaymentModal(false)}>
                <X size={20} />
              </button>
            </ModalHeader>

            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  fontSize: "14px",
                  color: "#6c757d",
                  marginBottom: "8px",
                }}
              >
                Service
              </div>
              <div style={{ fontWeight: 700, fontSize: "18px" }}>
                {selectedService.name}
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#1e3c72",
                  marginTop: "8px",
                }}
              >
                KES {selectedService.amount.toLocaleString()}
              </div>
            </div>

            <PhoneInput
              type="tel"
              placeholder="Phone Number (e.g., 254712345678)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />

            {paymentStatus && (
              <StatusMessage $type={paymentStatus.type}>
                {paymentStatus.type === "success" ? (
                  <CheckCircle2 size={16} />
                ) : paymentStatus.type === "error" ? (
                  <AlertCircle size={16} />
                ) : (
                  <Smartphone size={16} />
                )}
                {paymentStatus.message}
              </StatusMessage>
            )}

            <PayButton
              onClick={processMpesaPayment}
              disabled={paymentLoading}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {paymentLoading ? (
                <>
                  <Spinner />
                  Processing...
                </>
              ) : (
                <>
                  <Smartphone size={16} />
                  Pay KES {selectedService.amount.toLocaleString()}
                </>
              )}
            </PayButton>

            <p
              style={{
                fontSize: "11px",
                color: "#6c757d",
                marginTop: "16px",
                marginBottom: 0,
              }}
            >
              You will receive an M-Pesa prompt on your phone. Enter your PIN to
              complete payment.
            </p>
          </ModalContent>
        </PaymentModal>
      )}
    </Container>
  );
};

export default AccountBillingSection;