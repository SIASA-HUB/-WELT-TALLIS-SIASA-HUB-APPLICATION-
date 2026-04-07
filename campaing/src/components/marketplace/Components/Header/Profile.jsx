import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { LogOut } from "lucide-react"; // Modern Lucide logout icon

// --- Styled Components ---

const ProfileWrapper = styled.div`
  position: relative;
  cursor: pointer;
`;

const AccountName = styled.p`
  margin-top: 2px;
  font-weight: 600;
  color: #fff; /* Assuming it's in a dark navbar, adjust if needed */
  font-size: 16px;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 40px;
  left: 0;
  background: #ffffff;
  min-width: 150px;
  border-radius: 2px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: ${(props) => (props.open ? "block" : "none")};
`;

const MenuItem = styled.div`
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: #212121;
  transition: background 0.2s;

  &:hover {
    background-color: #f5faff;
  }
`;

const LogoutText = styled.span`
  font-size: 14px;
`;

// --- Component Logic ---

const Profile = ({ account, setAccount }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  // Handle clicking outside to close the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const logout = () => {
    setAccount("");
    setOpen(false);
  };

  return (
    <ProfileWrapper ref={menuRef}>
      <AccountName onClick={handleToggle}>{account}</AccountName>

      <DropdownMenu open={open}>
        <MenuItem onClick={logout}>
          <LogOut size={16} color="#2874f0" strokeWidth={2.5} />
          <LogoutText>Logout</LogoutText>
        </MenuItem>
      </DropdownMenu>
    </ProfileWrapper>
  );
};

export default Profile;
