import React, { useState } from "react";
import styled from "styled-components";
import LogoImg from "./utils/Images/logo.png";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, ShoppingCart, User as UserIcon } from "lucide-react";

const Nav = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const NavbarContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media (max-width: 768px) {
    padding: 0 10px;
  }
`;

const NavLogo = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 64px;
  img {
    width: 130px;
    height: auto;
  }
`;

const Logo = styled.img`
  height: 78px;
`;

const NavItems = styled.ul`
  display: flex;
  align-items: center;
  gap: 40px;
  list-style: none;
  @media screen and (max-width: 900px) {
    display: none;
  }
`;

const Navlink = styled(NavLink)`
  display: flex;
  align-items: center;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 15px;
  &:hover {
    color: #e11d48;
  }
  &.active {
    color: #e11d48;
    &::after {
      content: "";
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 100%;
      height: 2px;
      background: #e11d48;
      border-radius: 2px;
    }
  }
  position: relative;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 24px;
  align-items: center;
  @media screen and (max-width: 900px) {
    display: none;
  }
`;

const MobileIcon = styled.div`
  color: #1e293b;
  display: none;
  cursor: pointer;
  @media screen and (max-width: 900px) {
    display: flex;
    align-items: center;
  }
`;

const Mobileicons = styled.div`
  color: #1e293b;
  display: none;
  @media screen and (max-width: 900px) {
    display: flex;
    align-items: center;
    gap: 16px;
  }
`;

const MobileMenu = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 40px;
  background: white;
  position: fixed;
  top: 80px;
  right: 0;
  width: 100%;
  height: calc(100vh - 80px);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${({ $isOpen }) => ($isOpen ? "translateX(0)" : "translateX(100%)")};
  z-index: 999;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.05);
`;

const TextButton = styled.div`
  color: #64748b;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.3s ease;
  font-weight: 600;
  &:hover {
    color: #e11d48;
  }
`;

const AvatarCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f1f5f9;
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    border-color: #e11d48;
  }
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CartBadge = styled.div`
  position: absolute;
  top: -6px;
  right: -8px;
  color: #e11d48;

  font-size: 10px;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
`;

const Navbar = ({ currentUser, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
  };

  const handleLogout = () => {
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    localStorage.removeItem("guest_cart");
    localStorage.removeItem("user_info");
    sessionStorage.clear();
    if (onLogout) onLogout();
    navigate("/login");
  };

  const userInitial = currentUser?.name?.[0] || currentUser?.anonymous_username?.[0] || "U";
  const userImage = currentUser?.image || currentUser?.img;

  const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
  const cartCount = guestCart.reduce((acc, item) => acc + item.quantity, 0);

  const isLoggedIn = currentUser || !!getCookie("user_info");

  return (
    <Nav>
      <NavbarContainer>
        <NavLogo onClick={() => navigate("/marketplace")}>
          <Logo src={LogoImg} />
        </NavLogo>

        <NavItems>
          <Navlink to="/marketplace">Home</Navlink>
          <Navlink to="/marketplace/shop">Shop</Navlink>
          <Navlink to="/marketplace/cart">Cart</Navlink>
        </NavItems>

        <ButtonContainer>
          {/* Cart icon - always visible */}
          <Navlink to="/marketplace/cart">
            <div style={{ position: "relative" }}>

              <ShoppingCart size={24} color="#1e293b" />
              {cartCount > 0 && <CartBadge>{cartCount}</CartBadge>}
            </div>
          </Navlink>

          {/* Only show user avatar/logout if logged in - NO SIGN IN BUTTON */}
          {isLoggedIn && (
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <AvatarCircle onClick={() => navigate("/marketplace/profile")}>
                {userImage ? <AvatarImg src={userImage} /> : userInitial}
              </AvatarCircle>
              <TextButton onClick={handleLogout}>Logout</TextButton>
            </div>
          )}
        </ButtonContainer>

        <Mobileicons>
          <Navlink to="/marketplace/cart">
            <div style={{ position: "relative" }}>
              <ShoppingCart size={26} color="inherit" />
              {cartCount > 0 && <CartBadge>{cartCount}</CartBadge>}
            </div>
          </Navlink>
          <MobileIcon onClick={() => setIsOpen(!isOpen)}>
            <Menu size={28} />
          </MobileIcon>
        </Mobileicons>

        <MobileMenu $isOpen={isOpen}>
          <Navlink to="/marketplace" onClick={() => setIsOpen(false)}>Home</Navlink>
          <Navlink to="/marketplace/shop" onClick={() => setIsOpen(false)}>Shop</Navlink>
          <Navlink to="/marketplace/cart" onClick={() => setIsOpen(false)}>Cart</Navlink>
          {isLoggedIn ? (
            <>
              <Navlink to="/marketplace/profile" onClick={() => setIsOpen(false)}>Profile</Navlink>
              <TextButton onClick={() => { handleLogout(); setIsOpen(false); }}>Logout</TextButton>
            </>
          ) : null}

        </MobileMenu>
      </NavbarContainer>
    </Nav>
  );
};

export default Navbar;