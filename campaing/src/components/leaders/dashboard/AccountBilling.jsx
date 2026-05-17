// AccountBilling.jsx - Premium Billing with STK Push Polling
import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Smartphone, BarChart3, Rocket, CheckCircle2,
  AlertCircle, Zap, Lock, Sparkles, X, Loader2, Receipt,
  CheckCheck, RefreshCw, Phone
} from "lucide-react";
import api from "../../../api/api";

const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const fadeIn = keyframes`from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`;
const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
  50% { box-shadow: 0 0 0 12px rgba(16,185,129,0); }
`;

const T = {
  primary: "#1e3c72", light: "#2a5298", accent: "#E11D48",
  bg: "#f8fafc", card: "#ffffff", surface: "#f1f5f9",
  border: "rgba(0,0,0,0.07)", text: "#0f172a", muted: "#64748b",
  success: "#10B981", warning: "#F59E0B", error: "#EF4444",
};

const PRICING = {
  president: { verification: 250000, analytics: 416667, boost: 200000 },
  governor:  { verification: 70000,  analytics: 15000,  boost: 50000  },
  senator:   { verification: 50000,  analytics: 15000,  boost: 5000   },
  mp:        { verification: 60000,  analytics: 15000,  boost: 5000   },
  womenRep:  { verification: 20000,  analytics: 1000,   boost: 2000   },
  mca:       { verification: 10000,  analytics: 1000,   boost: 1000   },
};

const Wrap = styled.div`max-width: 1100px; margin: 0 auto; padding: 32px 20px; animation: ${fadeIn} 0.4s ease;`;

const PageHead = styled.div`
  margin-bottom: 36px; display: flex; justify-content: space-between; align-items: flex-end; gap: 16px;
  flex-wrap: wrap;
  h1 { font-size: 26px; font-weight: 800; margin: 0 0 4px; color: ${T.text}; }
  p  { color: ${T.muted}; font-size: 14px; margin: 0; }
`;

const PosTag = styled.div`
  background: #eff6ff; border: 1px solid #bfdbfe; padding: 7px 14px; border-radius: 100px;
  font-size: 13px; font-weight: 700; color: ${T.primary};
  display: flex; align-items: center; gap: 6px;
`;

const Grid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 18px; margin-bottom: 40px;
`;

const PlanCard = styled(motion.div)`
  background: ${T.card}; border: 1px solid ${T.border}; border-radius: 22px;
  padding: 26px; display: flex; flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: border-color .25s, box-shadow .25s;
  &:hover { border-color: ${T.primary}; box-shadow: 0 10px 28px rgba(30,60,114,0.1); }
`;

const PIcon = styled.div`
  width: 48px; height: 48px; background: ${T.surface}; border: 1px solid ${T.border};
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
  color: ${T.primary}; margin-bottom: 18px;
`;

const PName = styled.h3`font-size: 17px; font-weight: 800; color: ${T.text}; margin: 0 0 4px;`;
const PDesc = styled.p`font-size: 12px; color: ${T.muted}; margin: 0 0 16px; line-height: 1.5;`;

const PPrice = styled.div`
  margin-bottom: 16px;
  .amt { font-size: 26px; font-weight: 900; color: ${T.primary}; }
  .per { font-size: 12px; color: ${T.muted}; margin-left: 4px; }
`;

const Features = styled.div`display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; flex: 1;`;
const Feat = styled.div`
  display: flex; align-items: center; gap: 8px; font-size: 12px; color: ${T.muted};
  svg { color: ${T.success}; flex-shrink: 0; }
`;

const PayBtn = styled(motion.button)`
  width: 100%; padding: 13px; background: ${T.primary}; color: white;
  border: none; border-radius: 12px; font-size: 14px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  &:hover { background: ${T.light}; }
`;

const TxTable = styled.div`
  background: ${T.card}; border: 1px solid ${T.border};
  border-radius: 22px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;

const TxHead = styled.div`
  padding: 18px 22px; border-bottom: 1px solid ${T.border};
  display: flex; justify-content: space-between; align-items: center;
  background: ${T.surface};
  h2 { font-size: 16px; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 8px; color: ${T.text}; }
`;

const TxRow = styled.div`
  padding: 13px 22px;
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
  border-bottom: 1px solid #f1f5f9; align-items: center; font-size: 13px;
  &:last-child { border-bottom: none; }
`;

const SBadge = styled.span`
  padding: 3px 9px; border-radius: 100px; font-size: 10px; font-weight: 700; text-transform: uppercase;
  background: ${p => p.$s === 'completed' ? 'rgba(16,185,129,.1)' : p.$s === 'pending' ? 'rgba(245,158,11,.1)' : 'rgba(239,68,68,.1)'};
  color:      ${p => p.$s === 'completed' ? T.success : p.$s === 'pending' ? T.warning : T.error};
`;

// Modal
const Overlay = styled(motion.div)`
  position: fixed; inset: 0; background: rgba(0,0,0,.5); backdrop-filter: blur(8px);
  z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;
`;

const Modal = styled(motion.div)`
  background: white; border-radius: 28px; width: 100%; max-width: 400px;
  padding: 28px; box-shadow: 0 24px 60px rgba(0,0,0,.15);
`;

const PhoneInput = styled.input`
  width: 100%; background: ${T.surface}; border: 1.5px solid ${T.border};
  border-radius: 12px; padding: 13px 16px; color: ${T.text}; font-size: 16px;
  text-align: center; box-sizing: border-box; margin-bottom: 16px;
  &:focus { outline: none; border-color: ${T.primary}; background: white; }
  &::placeholder { color: ${T.muted}; }
`;

const StatusBox = styled.div`
  padding: 16px; border-radius: 14px; text-align: center; margin-bottom: 18px;
  background: ${p => p.$t === 'success' ? 'rgba(16,185,129,.08)' : p.$t === 'error' ? 'rgba(239,68,68,.08)' : 'rgba(30,60,114,.06)'};
  border: 1px solid ${p => p.$t === 'success' ? 'rgba(16,185,129,.2)' : p.$t === 'error' ? 'rgba(239,68,68,.2)' : 'rgba(30,60,114,.15)'};
  .iw {
    width: 52px; height: 52px; border-radius: 50%; margin: 0 auto 10px;
    display: flex; align-items: center; justify-content: center;
    background: ${p => p.$t === 'success' ? '#dcfce7' : p.$t === 'error' ? '#fee2e2' : '#dbeafe'};
    animation: ${p => p.$t === 'waiting' ? pulseGlow : 'none'} 2s infinite;
  }
  .title { font-size: 15px; font-weight: 800; color: ${T.text}; margin-bottom: 6px; }
  .desc  { font-size: 12px; color: ${T.muted}; line-height: 1.5; }
`;

const Spinner = styled(Loader2)`animation: ${spin} 1s linear infinite;`;

// ===================== MAIN COMPONENT =====================
const AccountBillingSection = ({ leader = null }) => {
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("input"); // input | loading | waiting | success | error
  const [msg, setMsg] = useState("");
  const pollRef = useRef(null);

  const posKey = (leader?.position || "").toLowerCase().includes("president") ? "president"
    : (leader?.position || "").toLowerCase().includes("governor") ? "governor"
    : (leader?.position || "").toLowerCase().includes("senator") ? "senator"
    : (leader?.position || "").toLowerCase().includes("mp") ? "mp"
    : (leader?.position || "").toLowerCase().includes("women") ? "womenRep"
    : "mca";
  const pr = PRICING[posKey] || PRICING.mca;

  useEffect(() => {
    const parsed = JSON.parse(localStorage.getItem("leaderData") || localStorage.getItem("user_data") || "{}");
    const u = parsed.leader || parsed;
    if (u.phone) setPhone(u.phone.replace(/^\+?0?/, "254"));
    fetchTx();
  }, []);

  const fetchTx = async () => {
    setTxLoading(true);
    try {
      const parsed = JSON.parse(localStorage.getItem("leaderData") || localStorage.getItem("user_data") || "{}");
      const u = parsed.leader || parsed;
      const uid = u.leader_id || u.user_id || u.id;
      if (uid) {
        const res = await api.get(`/wallet/transactions/${uid}`);
        if (res?.success) setTransactions(res.data || []);
      }
    } catch { /* silent */ } finally { setTxLoading(false); }
  };

  const openModal = (svc) => {
    setSelected(svc); setStep("input"); setMsg("");
    setShowModal(true);
    if (pollRef.current) clearInterval(pollRef.current);
  };

  const closeModal = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setShowModal(false);
    if (step === "success") fetchTx();
  };

  const startPolling = (txId) => {
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await api.get(`/wallet/status/${txId}`);
        if (res?.data?.status === "completed") {
          clearInterval(pollRef.current);
          setStep("success"); setMsg("Payment confirmed! Service activated.");
          fetchTx();
        } else if (res?.data?.status === "failed") {
          clearInterval(pollRef.current);
          setStep("error"); 
          // Extract the failure reason from the description, e.g., "M-Pesa STK Push to 254... | Request cancelled by user"
          const failReason = res.data.description?.split('|').pop()?.trim() || "Transaction Failed or Cancelled.";
          setMsg(failReason);
        }
      } catch { /* silent */ }
      if (attempts >= 18) {
        clearInterval(pollRef.current);
        setStep("error"); setMsg("STK Push Timed Out. Please try again.");
      }
    }, 5000);
  };

  const handlePay = async () => {
    if (!phone || phone.length < 9) { setMsg("Enter a valid M-Pesa number."); return; }
    if (selected.price > 150000) {
      setStep("error");
      setMsg("M-Pesa STK Push limit is KES 150,000. Please contact support or use manual Paybill for larger payments.");
      return;
    }
    setStep("loading"); setMsg("");
    try {
      const parsed = JSON.parse(localStorage.getItem("leaderData") || localStorage.getItem("user_data") || "{}");
      const u = parsed.leader || parsed;
      const formatted = phone.startsWith("0") ? "254" + phone.slice(1)
        : phone.startsWith("+") ? phone.slice(1) : phone;
      const res = await api.post("/wallet/mpesa/stkpush", {
        phoneNumber: formatted, 
        amount: selected.price,
        accountReference: u.leader_id || u.id, // Critical for callback identification
        userId: u.leader_id || u.user_id || u.id,
        type: "billing",
        origin: "billing",
      });
      if (res?.success) {
        const txId = res.data?.checkoutRequestId;
        setStep("waiting");
        if (txId) startPolling(txId);
      } else {
        setStep("error"); setMsg(res?.message || "Payment initiation failed.");
      }
    } catch (e) {
      setStep("error"); setMsg(e?.response?.data?.message || "Payment failed. Try again.");
    }
  };

  const services = [
    { id: "verify", title: "Official Verification", desc: "Get the verified badge and unlock premium profile visibility.", price: pr.verification, period: "one-time", icon: <ShieldCheck size={20} />, features: ["Verified badge on profile", "Priority search placement", "Credibility boost", "Trust signal for voters"] },
    { id: "analytics", title: "Deep Analytics", desc: "Full voter demographics, reach metrics & exportable campaign data.", price: pr.analytics, period: "per month", icon: <BarChart3 size={20} />, features: ["Voter demographics", "County-level reach data", "Engagement analytics", "Excel/CSV reports"] },
    { id: "boost", title: "Campaign Boost", desc: "Feature at top of listings & reach 5× more voters this week.", price: pr.boost, period: "per boost", icon: <Rocket size={20} />, features: ["Featured listing 7 days", "5× Visibility increase", "Social media push", "Priority placement"] },
  ];

  return (
    <Wrap>
      <PageHead>
        <div>
          <h1>Campaign Billing</h1>
          <p>Manage your premium services and campaign tools.</p>
        </div>
        <PosTag><Sparkles size={13} /> {leader?.position || "Candidate"} Level</PosTag>
      </PageHead>

      <Grid>
        {services.map(s => (
          <PlanCard key={s.id} whileHover={{ y: -5 }}>
            <PIcon>{s.icon}</PIcon>
            <PName>{s.title}</PName>
            <PDesc>{s.desc}</PDesc>
            <PPrice>
              <span className="amt">KES {s.price.toLocaleString()}</span>
              <span className="per">/{s.period}</span>
            </PPrice>
            <Features>
              {s.features.map(f => (
                <Feat key={f}><CheckCircle2 size={14} />{f}</Feat>
              ))}
            </Features>
            <PayBtn whileTap={{ scale: 0.97 }} onClick={() => openModal(s)}>
              <Smartphone size={16} /> Pay with M-Pesa
            </PayBtn>
          </PlanCard>
        ))}
      </Grid>

      <TxTable>
        <TxHead>
          <h2><Receipt size={16} /> Payment History</h2>
          <button onClick={fetchTx} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", alignItems: "center", gap: 5, fontSize: 13 }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </TxHead>
        {txLoading ? (
          <div style={{ padding: "36px", textAlign: "center", color: T.muted }}>Loading...</div>
        ) : transactions.length > 0 ? (
          <>
            <TxRow style={{ background: T.surface, fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px", color: T.muted }}>
              <div>Service</div><div>Date</div><div>Amount</div><div>Status</div>
            </TxRow>
            {transactions.map(t => (
              <TxRow key={t.transaction_id || t.id}>
                <div style={{ fontWeight: 600, color: T.text }}>{t.description || "Service Payment"}</div>
                <div style={{ color: T.muted }}>{new Date(t.created_at).toLocaleDateString("en-KE")}</div>
                <div style={{ fontWeight: 700 }}>KES {Number(t.amount).toLocaleString()}</div>
                <div><SBadge $s={t.status}>{t.status}</SBadge></div>
              </TxRow>
            ))}
          </>
        ) : (
          <div style={{ padding: "44px", textAlign: "center", color: T.muted }}>No payment history yet.</div>
        )}
      </TxTable>

      <AnimatePresence>
        {showModal && (
          <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
            <Modal onClick={e => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>M-Pesa Checkout</h3>
                <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted }}><X size={20} /></button>
              </div>

              <div style={{ background: T.surface, padding: "14px 18px", borderRadius: 14, marginBottom: 20, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: T.muted }}>Paying for</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>{selected?.title}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: T.primary, marginTop: 4 }}>KES {selected?.price.toLocaleString()}</div>
              </div>

              {step === "waiting" && (
                <StatusBox $t="waiting">
                  <div className="iw"><Phone size={22} color={T.primary} /></div>
                  <div className="title">Check Your Phone</div>
                  <div className="desc">M-Pesa prompt sent to <strong>{phone}</strong>. Enter your PIN to confirm.</div>
                </StatusBox>
              )}
              {step === "success" && (
                <StatusBox $t="success">
                  <div className="iw"><CheckCheck size={22} color={T.success} /></div>
                  <div className="title">Payment Confirmed!</div>
                  <div className="desc">{msg}</div>
                </StatusBox>
              )}
              {step === "error" && (
                <StatusBox $t="error">
                  <div className="iw"><AlertCircle size={22} color={T.error} /></div>
                  <div className="title">Payment Failed</div>
                  <div className="desc">{msg}</div>
                </StatusBox>
              )}

              {(step === "input" || step === "error") && (
                <>
                  <label style={{ fontSize: 12, color: T.muted, marginBottom: 6, display: "block" }}>M-Pesa Phone Number</label>
                  <PhoneInput placeholder="2547XXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
                  <PayBtn whileTap={{ scale: 0.97 }} onClick={handlePay} style={{ width: "100%", padding: 13, fontSize: 14 }}>
                    <Smartphone size={16} /> {step === "error" ? "Try Again" : "Send STK Push"}
                  </PayBtn>
                </>
              )}

              {step === "loading" && (
                <div style={{ textAlign: "center", padding: "18px 0" }}>
                  <Spinner size={32} color={T.primary} />
                  <div style={{ marginTop: 10, color: T.muted, fontSize: 13 }}>Initiating M-Pesa...</div>
                </div>
              )}
              {step === "waiting" && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", color: T.muted, fontSize: 11, marginTop: 8 }}>
                  <Spinner size={12} /> Waiting for confirmation...
                </div>
              )}
              {step === "success" && (
                <PayBtn whileTap={{ scale: 0.97 }} onClick={closeModal} style={{ width: "100%", padding: 13, fontSize: 14, background: T.success, marginTop: 4 }}>
                  <CheckCheck size={16} /> Done
                </PayBtn>
              )}

              <div style={{ textAlign: "center", marginTop: 14, fontSize: 11, color: T.muted }}>
                <Lock size={10} /> Secured via Safaricom M-Pesa
              </div>
            </Modal>
          </Overlay>
        )}
      </AnimatePresence>
    </Wrap>
  );
};

export default AccountBillingSection;