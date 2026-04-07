import React, { useState } from "react";
import styled from "styled-components";
import { Plus, Minus } from "lucide-react";

// --- Styled Components ---

const Container = styled.div`
  display: flex;
  align-items: center;
  margin-top: 30px;
  background: #fff;
  width: fit-content;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
`;

const StyledButton = styled.button`
  background: transparent;
  border: none;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #212121;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background-color: #f5faff;
  }

  &:disabled {
    color: #c2c2c2;
    cursor: not-allowed;
  }
`;

const CounterValue = styled.span`
  padding: 0 15px;
  font-size: 16px;
  font-weight: 600;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  min-width: 40px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 35px;
`;

// --- Component Logic ---

const GroupedButton = () => {
  const [counter, setCounter] = useState(1);

  const handleIncrement = () => {
    setCounter((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setCounter((prev) => prev - 1);
  };

  return (
    <Container>
      <StyledButton
        onClick={handleDecrement}
        disabled={counter <= 1}
        aria-label="Decrease quantity"
      >
        <Minus size={16} strokeWidth={3} />
      </StyledButton>

      <CounterValue>{counter}</CounterValue>

      <StyledButton onClick={handleIncrement} aria-label="Increase quantity">
        <Plus size={16} strokeWidth={3} />
      </StyledButton>
    </Container>
  );
};

export default GroupedButton;
