import React, { useState, useEffect, useRef, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Home, UserCheck, ShoppingBag, User } from "lucide-react";

import AppLoadingBar from "./LoadingBar";

const clickScale = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(0.92); }
  100% { transform: scale(1); }
`;

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  
  /* This handles the "hiding" part */
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translateY(${(props) => (props.$isVisible ? "0" : "120%")});
  
  /* Force hardware acceleration for smoother hide/show */
  will-change: transform;
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
  gap: 4px;
  
  /* REMOVES THE UNNECESSARY BOX */
  -webkit-tap-highlight-color: transparent;
  outline: none;
  background: transparent;
  border: none;
  user-select: none;

  &:active, &:focus, &:hover {
    outline: none;
    background: transparent;
    -webkit-tap-highlight-color: rgba(0,0,0,0);
  }

  &:active {
    animation: ${clickScale} 0.1s ease-in-out;
  }

  span {
    font-size: 10px;
    font-weight: ${(props) => (props.$active ? "700" : "500")};
    color: ${(props) => (props.$active ? "#10b981" : "#8e8e93")};
    transition: color 0.2s ease;
  }
`;

const NavMenu = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const loadingBarRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 1. Threshold: If we haven't moved at least 5px, don't do anything
      if (Math.abs(currentScrollY - lastScrollY.current) < 5) return;

      if (currentScrollY > lastScrollY.current && currentScrollY > 70) {
        // Scrolling Down - Hide it
        setIsVisible(false);
      } else {
        // Scrolling Up - Show it
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    // Attach to window, but use capture: false and passive: true
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Completion of loading bar on route change
  useEffect(() => {
    if (loadingBarRef.current) {
      loadingBarRef.current.complete();
    }
  }, [location.pathname]);

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/leaders", label: "Aspirants", icon: UserCheck },
    { path: "/marketplace/shop", label: "Store", icon: ShoppingBag },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <>
      <AppLoadingBar color="#10b981" ref={loadingBarRef} shadow={true} />

      <NavContainer $isVisible={isVisible}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === "/marketplace" && location.pathname.startsWith("/marketplace"));

          return (
            <NavItem
              key={item.path}
              to={item.path}
              $active={isActive}
              onClick={() => {
                if (location.pathname !== item.path) {
                  loadingBarRef.current?.continuousStart();
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <item.icon
                size={22}
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