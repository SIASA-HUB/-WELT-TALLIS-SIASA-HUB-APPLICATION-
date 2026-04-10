import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { ShoppingCart, ChevronDown } from "lucide-react";
import { useCart } from "../../context/CartContext";

// Styled Components
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    margin-top: 10px;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  font-size: 12px;
  gap: 8px;

  @media (max-width: 768px) {
    color: #2874f0;
    font-size: 14px;
    padding: 8px;
    width: 100%;
    justify-content: center;
  }
`;

const CartContainer = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  gap: 8px;
  position: relative;

  @media (max-width: 768px) {
    color: #2874f0;
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: -8px;
  right: -12px;
  background: #ff6161;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;

  @media (max-width: 768px) {
    background: #ff6161;
    color: white;
  }
`;

const CartIcon = styled(ShoppingCart)`
  width: 18px;
  height: 18px;
`;

const CartText = styled.span`
  font-size: 12px;
  margin-left: 4px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const MoreLink = styled(NavLink)`
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const CustomButtons = () => {
  const { getTotalItems } = useCart();
  const cartItemCount = getTotalItems ? getTotalItems() : 0;

  return (
    <Wrapper>
      <MoreLink to="#">
        More
        <ChevronDown size={14} />
      </MoreLink>

      <CartContainer to="/marketplace/cart">
        <div style={{ position: "relative" }}>
          <CartIcon />
          {cartItemCount > 0 && <CartBadge>{cartItemCount}</CartBadge>}
        </div>
        <CartText>Cart</CartText>
      </CartContainer>
    </Wrapper>
  );
};

export default CustomButtons;
