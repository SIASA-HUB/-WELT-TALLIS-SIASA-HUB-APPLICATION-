import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { ShoppingCart, ArrowRight } from "lucide-react";

// Styled Components
const Container = styled.div`
  width: 80%;
  max-width: 800px;
  min-height: 65vh;
  background: #fff;
  margin: 80px auto;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    width: 90%;
    margin: 60px auto;
    min-height: 50vh;
  }
`;

const Content = styled.div`
  text-align: center;
  padding: 70px 20px;

  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const Image = styled.img`
  width: 15%;
  max-width: 150px;
  min-width: 100px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    width: 25%;
    min-width: 80px;
  }
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: #212121;
  margin: 20px 0 8px 0;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const Message = styled.p`
  font-size: 14px;
  color: #878787;
  margin: 0 0 24px 0;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const ShopButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fb641b;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 2px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s;

  &:hover {
    background: #f85606;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 12px;
  }
`;

const IconWrapper = styled.div`
  background: #f5f5f5;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;

  svg {
    width: 40px;
    height: 40px;
    color: #fb641b;
  }

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;

    svg {
      width: 30px;
      height: 30px;
    }
  }
`;

const EmptyCart = () => {
  const imgurl =
    "https://rukminim1.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90";

  return (
    <Container>
      <Content>
        {/* Option 1: Using image from URL */}
        <Image src={imgurl} alt="Empty cart" />

        {/* Option 2: Using Lucide icon instead of image (alternative) */}
        {/* <IconWrapper>
          <ShoppingCart />
        </IconWrapper> */}

        <Title>Your cart is empty!</Title>
        <Message>Add items to it now.</Message>
        <ShopButton to="/marketplace">
          Shop Now
          <ArrowRight size={16} />
        </ShopButton>
      </Content>
    </Container>
  );
};

export default EmptyCart;
