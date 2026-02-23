import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import { Bell, Search, X } from "lucide-react";

const KENYA_THEME = {
  primary: "#BB0000",
  text: "#1e293b",
  muted: "#94a3b8",
  bg: "#f1f5f9",
};

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const HeaderWrapper = styled.header`
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  height: 60px; /* Slightly taller for better touch targets */
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${(props) =>
    props.$scrolled ? "0 4px 12px rgba(0,0,0,0.05)" : "none"};
  border-bottom: 1px solid
    ${(props) => (props.$scrolled ? "#e2e8f0" : "transparent")};
  transform: translateY(${(props) => (props.$isVisible ? "0" : "-100%")});
`;

const LogoContainer = styled.div`
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  /* Flex-basis controls the space it takes up */
  flex-basis: ${(props) => (props.$isFocused ? "0px" : "120px")};
  opacity: ${(props) => (props.$isFocused ? "0" : "1")};
  transform: translateX(${(props) => (props.$isFocused ? "-20px" : "0")});
  pointer-events: ${(props) => (props.$isFocused ? "none" : "auto")};
`;

const Logo = styled.h2`
  font-size: 18px;
  font-weight: 900;
  cursor: pointer;
  color: ${KENYA_THEME.primary};
  letter-spacing: -0.5px;
  white-space: nowrap;
`;

const SearchContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  margin: 0 ${(props) => (props.$isFocused ? "0" : "12px")};
  transition: margin 0.3s ease;
`;

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  background: ${KENYA_THEME.bg};
  padding: 10px 14px;
  border-radius: 14px;
  border: 1.5px solid transparent;
  transition: all 0.3s ease;

  ${(props) =>
    props.$isFocused &&
    css`
      background: white;
      border-color: ${KENYA_THEME.primary};
      box-shadow: 0 4px 15px rgba(187, 0, 0, 0.1);
    `}
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  padding: 0 10px;
  font-size: 15px;
  font-weight: 600;
  color: ${KENYA_THEME.text};
  &::placeholder {
    color: ${KENYA_THEME.muted};
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  /* Shrink the right section slightly to give search more room */
  transform: scale(${(props) => (props.$isFocused ? "0.95" : "1")});
  margin-left: ${(props) => (props.$isFocused ? "8px" : "0")};
`;

const IconButton = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${KENYA_THEME.text};
  cursor: pointer;
  border-radius: 50%;
  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }
`;

const NotifBadge = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  background: ${KENYA_THEME.primary};
  color: white;
  font-size: 9px;
  font-weight: 900;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
`;

const GreenDot = styled.div`
  width: 7px;
  height: 7px;
  background: #22c55e;
  border-radius: 50%;
  animation: ${pulse} 2s infinite;
`;

const GlobalHeader = ({ notifCount = 3, onSearch }) => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [localQuery, setLocalQuery] = useState("");
  const lastScrollY = useRef(0);
  const searchTimerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only hide header if user scrolls down more than 10px
      if (currentScrollY > lastScrollY.current && currentScrollY > 70) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setScrolled(currentScrollY > 30);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setLocalQuery(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      if (onSearch) onSearch(val);
    }, 300);
  };

  const handleClear = () => {
    setLocalQuery("");
    setIsFocused(false);
    if (onSearch) onSearch("");
  };

  return (
    <HeaderWrapper $scrolled={scrolled} $isVisible={isVisible}>
      {/* 1. Pull Logo Away */}
      <LogoContainer $isFocused={isFocused}>
        <Logo onClick={() => navigate("/")}>Siasa Hub 🇰🇪</Logo>
      </LogoContainer>

      {/* 2. Search expands to fill empty space */}
      <SearchContainer $isFocused={isFocused}>
        <SearchInputWrapper $isFocused={isFocused}>
          <Search
            size={18}
            color={isFocused ? KENYA_THEME.primary : KENYA_THEME.muted}
          />
          <SearchInput
            placeholder="Search leaders..."
            value={localQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => !localQuery && setIsFocused(false)}
            onChange={handleInputChange}
          />
          {(isFocused || localQuery) && (
            <div
              onClick={handleClear}
              style={{ display: "flex", cursor: "pointer", padding: "4px" }}
            >
              <X size={18} color={KENYA_THEME.muted} strokeWidth={2.5} />
            </div>
          )}
        </SearchInputWrapper>
      </SearchContainer>

      {/* 3. Right section compacts slightly */}
      <RightSection $isFocused={isFocused}>
        <IconButton onClick={() => navigate("/notifications")}>
          <Bell size={20} />
          {notifCount > 0 && <NotifBadge>{notifCount}</NotifBadge>}
        </IconButton>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 10px",
            background: "#f0fdf4",
            borderRadius: "20px",
            border: "1px solid #dcfce7",
          }}
        >
          <GreenDot />
          <span style={{ fontWeight: 900, color: "#16a34a", fontSize: "11px" }}>
            42
          </span>
        </div>
      </RightSection>
    </HeaderWrapper>
  );
};

GlobalHeader.displayName = "GlobalHeader";
export default GlobalHeader;
