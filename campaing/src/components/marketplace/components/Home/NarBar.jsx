import React from "react";
import styled from "styled-components";
import * as Icons from "lucide-react";

// --- Campaign Merchandise Data ---
export const navData = [
  { text: "T-Shirts", iconName: "Shirt" },
  { text: "Caps", iconName: "GraduationCap" },
  { text: "Hoodies", iconName: "Wind" },
  { text: "Posters", iconName: "Image" },
  { text: "Badges", iconName: "Award" },
  { text: "Stickers", iconName: "Sticker" },
  { text: "Banners", iconName: "Flag" },
  { text: "Wristbands", iconName: "Watch" },
  { text: "Bags", iconName: "ShoppingBag" },
];

// --- Styled Components ---
const NavContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 32px;
  margin: 24px 0 16px 0;
  background: #fff;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  overflow-x: auto;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 3px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #bbb;
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    gap: 20px;
    justify-content: flex-start;
    padding: 10px 16px;
  }
`;

const NavItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  min-width: 65px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const IconCircle = styled.div`
  width: 48px;
  height: 48px;
  background: ${(props) => (props.active ? "#bb0000" : "#f5f5f5")};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  color: ${(props) => (props.active ? "#fff" : "#555")};

  ${NavItem}:hover & {
    background: ${(props) => (props.active ? "#bb0000" : "#e8e8e8")};
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 42px;
    height: 42px;
  }
`;

const NavText = styled.span`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${(props) => (props.active ? "#bb0000" : "#555")};
  letter-spacing: 0.3px;
  transition: color 0.2s ease;

  ${NavItem}:hover & {
    color: #bb0000;
  }

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

// --- Component ---
const NavBar = ({ activeCategory, onCategorySelect }) => {
  return (
    <NavContainer>
      {navData.map((item, index) => {
        const Icon = Icons[item.iconName] || Icons.ShoppingBag;
        const isActive = activeCategory === item.text.toLowerCase();

        return (
          <NavItem
            key={index}
            onClick={() =>
              onCategorySelect &&
              onCategorySelect(item.text.toLowerCase(), index)
            }
          >
            <IconCircle active={isActive}>
              <Icon size={22} strokeWidth={1.8} />
            </IconCircle>
            <NavText active={isActive}>{item.text}</NavText>
          </NavItem>
        );
      })}
    </NavContainer>
  );
};

export default NavBar;
