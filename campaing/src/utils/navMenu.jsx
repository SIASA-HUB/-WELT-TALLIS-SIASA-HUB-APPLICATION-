import React, { useState, useEffect, useRef, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Home, UserCheck, ShoppingBag, User, LayoutDashboard, Settings } from "lucide-react";
import { useAuth } from "../components/hooks/useAuth";
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
  height: 65px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 9999;
  background: #ffffff;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.06);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  transform: translateY(${(props) => (props.$isVisible ? "0" : "110%")});
  will-change: transform;
`;

const NavItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  text-decoration: none;
  gap: 2px;

  /* --- BOX REMOVAL SECTION --- */
  -webkit-tap-highlight-color: transparent; 
  -webkit-tap-highlight-color: rgba(0,0,0,0); /* Secondary fallback */
  outline: none; /* Removes the focus square */
  border: none;
  background: transparent;
  user-select: none;

  &:focus, &:active, &:hover, &:visited {
    outline: none;
    background: transparent;
    border: none;
    -webkit-tap-highlight-color: transparent;
  }
  /* --------------------------- */

  &:active {
    animation: ${clickScale} 0.15s ease-in-out;
  }

  span {
    font-size: 11px;
    font-weight: ${(props) => (props.$active ? "900" : "500")};
    color: ${(props) => (props.$active ? "#10b981" : "#71717a")};
    transition: all 0.2s ease;
  }
`;

const NavMenu = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef(null);
  const loadingBarRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY.current);

      if (scrollDifference > 10) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 70) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }
      lastScrollY.current = currentScrollY;

      // Auto-appear after 2.5s stop
      scrollTimeout.current = setTimeout(() => {
        setIsVisible(true);
      }, 2500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  const { isLeaderAuthenticated, isAdmin, isMarketAdmin } = useAuth();

  const getProfileItem = () => {
    if (isAdmin() || isMarketAdmin()) return { path: "/marketplace-admin", label: "Admin", icon: Settings };
    if (isLeaderAuthenticated) return { path: "/aspirant-dashboard", label: "Dashboard", icon: LayoutDashboard };
    return { path: "/profile", label: "Profile", icon: User };
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/leaders", label: "Aspirants", icon: UserCheck },
    { path: "/marketplace/shop", label: "Store", icon: ShoppingBag },
    getProfileItem(),
  ];

  return (
    <>
      <AppLoadingBar color="#10b981" ref={loadingBarRef} shadow={true} />
      <NavContainer $isVisible={isVisible}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === "/marketplace/shop" && location.pathname.startsWith("/marketplace"));

          return (
            <NavItem
              key={item.path}
              to={item.path}
              $active={isActive}
              onClick={() => {
                if (location.pathname !== item.path) loadingBarRef.current?.continuousStart();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <item.icon
                size={24}
                strokeWidth={isActive ? 3 : 2} // Bolder when active
                color={isActive ? "#10b981" : "#000000ff"}
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