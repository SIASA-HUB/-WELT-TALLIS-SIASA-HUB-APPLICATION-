import React, { useState, useEffect, useRef, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { Home, UserCheck, User, PlusSquare, ShoppingBag } from "lucide-react";

const THEME = {
  primary: "#BB0000",
  black: "#000000",
  background: "rgba(255, 255, 255, 0.98)",
};

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${THEME.background};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  height: 50px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  /* Use transform for GPU acceleration */
  will-change: transform;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(${(props) => (props.$isVisible ? "0" : "110%")});
  padding-bottom: env(safe-area-inset-bottom, 0px);
`;

const NavItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: ${(props) => (props.$active ? THEME.primary : THEME.black)};
  flex: 1;
  height: 100%;
  position: relative;
  -webkit-tap-highlight-color: transparent;

  span {
    font-size: 9px;
    font-weight: 800;
    margin-top: 2px;
  }
`;

const ActiveIndicator = styled.div`
  position: absolute;
  top: 0;
  width: 30%;
  height: 3px;
  background: ${THEME.primary};
  border-radius: 0 0 4px 4px;
  opacity: ${(props) => (props.$active ? 1 : 0)};
  transition: opacity 0.15s ease;
`;

const NavMenu = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Optimized Admin Check: Only run once on mount
  const [isAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved)?.role === "admin" : false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/leaders", label: "Leaders", icon: UserCheck },
    { path: "/marketplace", label: "Store", icon: ShoppingBag },
    { path: "/profile", label: "Profile", icon: User },
    ...(isAdmin
      ? [{ path: "/admin/create-leader", label: "Create", icon: PlusSquare }]
      : []),
  ];

  return (
    <NavContainer $isVisible={isVisible}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <NavItem
            key={item.path}
            to={item.path}
            $active={isActive}
            // PRE-FETCH LOGIC: Starts loading the page data when finger touches button
            onTouchStart={() => {
              const link = document.createElement("link");
              link.rel = "prefetch";
              link.href = item.path;
              document.head.appendChild(link);
            }}
          >
            <ActiveIndicator $active={isActive} />
            <item.icon
              size={20}
              strokeWidth={isActive ? 3 : 2}
              color={isActive ? THEME.primary : THEME.black}
            />
            <span>{item.label}</span>
          </NavItem>
        );
      })}
    </NavContainer>
  );
};

export default memo(NavMenu);
