import React, { useState } from "react";
import styled from "styled-components";
import { Smartphone, ArrowRight, Zap } from "lucide-react";

const WalletWrapper = styled.div`
  padding: 0 20px;
  margin-top: 5px;
  color: white;
  max-width: 400px;
`;

const BalanceSection = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
`;

const BigAmount = styled.h2`
  font-size: 2.8rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: -1.5px;
  display: flex;
  align-items: baseline;
  gap: 8px;

  span {
    font-size: 14px;
    color: #10b981; /* Green accent */
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const InputGroup = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  margin-bottom: 12px;

  &:focus-within {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
  }

  input {
    background: transparent;
    border: none;
    color: white;
    font-size: 14px;
    font-weight: 600;
    width: 100%;
    margin-left: 10px;
    outline: none;
    &::placeholder {
      color: rgba(255, 255, 255, 0.2);
    }
  }
`;

const ChipRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 4px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const AmountChip = styled.button`
  background: ${(props) => (props.$active ? "#fff" : "transparent")};
  color: ${(props) => (props.$active ? "#000" : "rgba(255, 255, 255, 0.6)")};
  border: 1px solid
    ${(props) => (props.$active ? "#fff" : "rgba(255, 255, 255, 0.15)")};
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
  transition: all 0.2s ease;
`;

const PayButton = styled.button`
  background: #10b981; /* Green */
  color: white;
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 16px;
  font-weight: 900;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
`;

const SleekWallet = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(500);
  const points = 0; // Default zero points

  return (
    <WalletWrapper>
      <BalanceSection>
        <Label>
          <Zap size={10} color="#10b981" fill="#10b981" /> Total Points
        </Label>
        <BigAmount>
          {points} <span>PTS</span>
        </BigAmount>
      </BalanceSection>

      <InputGroup>
        <Smartphone size={16} color="rgba(255,255,255,0.4)" />
        <input
          type="tel"
          placeholder="07XX XXX XXX"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </InputGroup>

      <ChipRow>
        {[200, 500, 1000, 2500].map((val) => (
          <AmountChip
            key={val}
            $active={selectedAmount === val}
            onClick={() => setSelectedAmount(val)}
          >
            {val} PTS
          </AmountChip>
        ))}
      </ChipRow>

      <PayButton>
        Purchase {selectedAmount} Points <ArrowRight size={16} />
      </PayButton>

      <div
        style={{
          textAlign: "center",
          fontSize: "8px",
          opacity: 0.3,
          marginTop: "16px",
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          fontWeight: 700,
        }}
      >
        <span>ENCRYPTED</span>
        <span>•</span>
        <span>M-PESA DARAJA</span>
        <span>•</span>
        <span>SIASA HUB</span>
      </div>
    </WalletWrapper>
  );
};

export default SleekWallet;
