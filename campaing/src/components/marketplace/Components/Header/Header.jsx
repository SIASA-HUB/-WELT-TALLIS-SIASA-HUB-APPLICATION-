import React, { useState, useContext } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, ShoppingCart, User, X, LogOut } from "lucide-react";
import { useTheme } from "styled-components";
import CustomButtons from "./CustomButtons";

// Styled Components with theme support
const AppBar = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors?.primary || "#bb0000"};
  height: 60px;
  z-index: 1100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  margin-right: 24px;

  @media (max-width: 768px) {
    margin-right: 12px;
  }
`;

const Logo = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: white;
  letter-spacing: 1px;

  span {
    font-weight: 400;
    font-size: 14px;
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  margin-right: 8px;

  &:hover {
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 500px;
  margin: 0 20px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileSearchButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
  }
`;

const DesktopButtons = styled.div`
  margin-left: auto;

  @media (max-width: 768px) {
    display: none;
  }
`;

// Drawer Components
const DrawerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1200;
  visibility: ${(props) => (props.isOpen ? "visible" : "hidden")};
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  transition: all 0.3s ease;
`;

const Drawer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: white;
  z-index: 1201;
  transform: translateX(${(props) => (props.isOpen ? "0" : "-100%")});
  transition: transform 0.3s ease;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 16px;
  background: ${({ theme }) => theme.colors?.primary || "#bb0000"};
  color: white;
`;

const DrawerTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;

  &:hover {
    opacity: 0.8;
  }
`;

const DrawerContent = styled.div`
  padding: 20px;
`;

const DrawerNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DrawerLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  color: #333;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: #f5f5f5;
  }
`;

const Divider = styled.hr`
  margin: 16px 0;
  border: none;
  border-top: 1px solid #f0f0f0;
`;

const Header = () => {
  const [open, setOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Campaign logo text instead of Flipkart logo
  const campaignName = "Campaign Store";

  return (
    <>
      <AppBar>
        <Toolbar>
          {/* Mobile Menu Button */}
          <MenuButton onClick={handleOpen}>
            <Menu size={20} />
          </MenuButton>

          {/* Logo */}
          <LogoContainer to="/">
            <Logo>
              {campaignName}
              <span> | Merch</span>
            </Logo>
          </LogoContainer>

          {/* Desktop Search */}
          <SearchContainer>
            <SearchInput />
          </SearchContainer>

          {/* Mobile Search Button */}
          <MobileSearchButton
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            <Search size={18} />
          </MobileSearchButton>

          {/* Desktop Buttons */}
          <DesktopButtons>
            <CustomButtons />
          </DesktopButtons>
        </Toolbar>

        {/* Mobile Search Bar (when toggled) */}
        {showMobileSearch && (
          <MobileSearchBar>
            <SearchInput />
          </MobileSearchBar>
        )}
      </AppBar>

      {/* Mobile Drawer */}
      <DrawerOverlay isOpen={open} onClick={handleClose} />
      <Drawer isOpen={open}>
        <DrawerHeader>
          <DrawerTitle>Menu</DrawerTitle>
          <CloseButton onClick={handleClose}>
            <X size={20} />
          </CloseButton>
        </DrawerHeader>
        <DrawerContent>
          <DrawerNav>
            <DrawerLink to="/marketplace" onClick={handleClose}>
              <ShoppingCart size={18} />
              Marketplace
            </DrawerLink>
            <DrawerLink to="/cart" onClick={handleClose}>
              <ShoppingCart size={18} />
              Cart
            </DrawerLink>
            <Divider />
            <CustomButtons />
          </DrawerNav>
        </DrawerContent>
      </Drawer>
    </>
  );
};

// Search Input Component
const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 6px 12px;
  width: 100%;
`;

const SearchInputField = styled.input`
  flex: 1;
  border: none;
  outline: none;
  padding: 8px;
  font-size: 14px;

  &::placeholder {
    color: #999;
  }
`;

const SearchButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors?.primary || "#bb0000"};

  &:hover {
    opacity: 0.7;
  }
`;

const MobileSearchBar = styled.div`
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  background: white;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;

  @media (min-width: 769px) {
    display: none;
  }
`;

const SearchInput = () => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      console.log("Searching for:", query);
      // Handle search logic here
    }
  };

  return (
    <SearchInputWrapper>
      <SearchInputField
        type="text"
        placeholder="Search campaign merch..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
      />
      <SearchButton onClick={handleSearch}>
        <Search size={18} />
      </SearchButton>
    </SearchInputWrapper>
  );
};

export default Header;
