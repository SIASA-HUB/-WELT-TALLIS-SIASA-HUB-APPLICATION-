import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { Plus, MessageCircle } from "lucide-react";
import { usePost } from "../context/postContext"; // Re-importing your logic

// --- Ultra-Smooth Animations ---
const slideUp = keyframes`
  from { transform: translateY(60px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const subtleRipple = keyframes`
  0% { transform: scale(1); opacity: 0.3; }
  100% { transform: scale(1.6); opacity: 0; }
`;

const elegantFloat = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

// --- Styled Components ---
const ButtonWrapper = styled.div`
  position: fixed;
  bottom: 50px;
  right: 20px; /* Slightly adjusted for better visual balance */
  z-index: 1000;
  animation: ${slideUp} 1s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translateY(${(props) => (props.$visible ? "0" : "150px")});
  opacity: ${(props) => (props.$visible ? "1" : "0")};
  transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: ${(props) => (props.$visible ? "auto" : "none")};
`;

const CreateButton = styled.button`
  width: 62px; /* Balanced size */
  height: 62px;
  background: #9e0000; /* Deep Satin Red */
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
  animation: ${elegantFloat} 5s ease-in-out infinite;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &::after {
    content: "";
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 1.5px solid #004d00; /* Emerald Green Ripple */
    animation: ${subtleRipple} 3s infinite;
  }

  &:hover {
    transform: scale(1.08) translateY(-5px);
    background: #bb0000;
    box-shadow: 0 25px 50px rgba(158, 0, 0, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    z-index: 2;
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  &:hover svg:first-child {
    transform: rotate(90deg);
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -4px;
  right: -6px;
  background: #004d00; /* Deep Satin Green */
  color: #e0eee0;
  font-family: "Inter", sans-serif;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  white-space: nowrap;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  z-index: 10;
`;

const MoodLabel = styled.div`
  position: absolute;
  right: 85px;
  top: 50%;
  transform: translateY(-50%) translateX(20px);
  font-family: "Playfair Display", serif;
  font-style: italic;
  font-size: 1.2rem;
  color: #432c2c;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  white-space: nowrap;

  ${CreateButton}:hover & {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
`;

const GlobalCreatePostButton = () => {
  // 1. Hook into your existing post logic
  const { openCreatePostModal } = usePost();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // 2. Scroll visibility logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <ButtonWrapper $visible={isVisible}>
      {/* 3. Link the onClick to your modal opener */}
      <CreateButton onClick={openCreatePostModal} aria-label="Sema">
        <MoodLabel>Sema nasi...</MoodLabel>
        <Plus size={28} strokeWidth={1.5} />
        <Badge>SEMA</Badge>
        <MessageCircle
          size={12}
          style={{
            position: "absolute",
            bottom: 14,
            right: 14,
            color: "rgba(255,255,255,0.6)",
            fill: "rgba(255,255,255,0.1)",
          }}
        />
      </CreateButton>
    </ButtonWrapper>
  );
};

export default GlobalCreatePostButton;
