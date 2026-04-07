import React, { useState, useEffect, useRef, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Home, UserCheck, ShoppingBag, User } from "lucide-react";
import AppLoadingBar from "./LoadingBar";

const clickScale = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(0.9); }
  100% { transform: scale(1); }
`;

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 54px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(${(props) => (props.$isVisible ? "0" : "100%")});
`;

const NavItem = styled(Link)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  text-decoration: none;
  gap: 2px;
  -webkit-tap-highlight-color: transparent;

  &:active {
    animation: ${clickScale} 0.15s ease-in-out;
  }

  span {
    font-size: 10px;
    font-weight: ${(props) => (props.$active ? "700" : "500")};
    color: ${(props) => (props.$active ? "#10b981" : "#8e8e93")};
    transition: color 0.2s ease;
  }
`;

const ActiveBar = styled.div`
  position: absolute;
  top: 0;
  width: 30px;
  height: 3px;
  background: #10b981;
  border-radius: 0 0 4px 4px;
  transition: all 0.2s ease-in-out;
  opacity: ${(props) => (props.$active ? "1" : "0")};
  transform: translateY(${(props) => (props.$active ? "0" : "-5px")});
`;

const NavMenu = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const loadingBarRef = useRef(null);

  // Trigger loading bar completion when the route actually changes
  useEffect(() => {
    if (loadingBarRef.current) {
      loadingBarRef.current.complete();
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (current < 50) {
        setIsVisible(true);
        return;
      }
      if (Math.abs(current - lastScrollY.current) < 10) return;
      setIsVisible(current < lastScrollY.current);
      lastScrollY.current = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/leaders", label: "Aspirants", icon: UserCheck },
    { path: "/marketplace", label: "Merch", icon: ShoppingBag },
    { path: "/profile", label: "Profile", icon: User },
  ];

  const handleNavClick = (path) => {
    // Only trigger loading if we are moving to a NEW page
    if (location.pathname !== path) {
      if (loadingBarRef.current) {
        loadingBarRef.current.continuousStart();
      }
    }
    window.scrollTo(0, 0);
  };

  return (
    <>
      <AppLoadingBar color="#10b981" ref={loadingBarRef} shadow={true} />

      <NavContainer $isVisible={isVisible}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <NavItem
              key={item.path}
              to={item.path}
              $active={isActive}
              onClick={() => handleNavClick(item.path)}
            >
              <ActiveBar $active={isActive} />
              <item.icon
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
                color={isActive ? "#10b981" : "#8e8e93"}
              />
              <span>{item.label}</span>
            </NavItem>
          );
        })}
      </NavContainer>
    </>
  );
};

export default memo(NavMenu);
