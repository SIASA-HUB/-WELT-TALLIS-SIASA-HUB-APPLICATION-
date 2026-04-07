import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { ShieldCheck } from "lucide-react"; // Modern trust icon

// --- Styled Components ---

const Component = styled.div`
  background: #fff;
  /* width: 30%; */
`;

const Header = styled.div`
  padding: 15px 24px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
`;

const Heading = styled.p`
  color: #878787;
  font-weight: 600;
  margin: 0;
`;

const Container = styled.div`
  padding: 15px 24px;
  background: #fff;

  & > p {
    margin-bottom: 20px;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
  }
`;

const Price = styled.span`
  font-weight: 500;
`;

const TotalAmount = styled.p`
  font-size: 18px;
  font-weight: 600;
  border-top: 1px dashed #e0e0e0;
  padding: 20px 0;
  border-bottom: 1px dashed #e0e0e0;
`;

const Savings = styled.p`
  font-size: 16px;
  color: #388e3c;
  font-weight: 500;
  display: flex !important;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
`;

// --- Component Logic ---

const TotalView = ({ cartItems }) => {
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const calculateTotal = () => {
      let totalMktPrice = 0;
      let totalDiscount = 0;

      cartItems.forEach((item) => {
        totalMktPrice += item.price.mrp;
        totalDiscount += item.price.mrp - item.price.cost;
      });

      setPrice(totalMktPrice);
      setDiscount(totalDiscount);
    };

    calculateTotal();
  }, [cartItems]);

  const deliveryCharges = 40;
  const finalAmount = price - discount + deliveryCharges;

  return (
    <Component>
      <Header>
        <Heading>PRICE DETAILS</Heading>
      </Header>

      <Container>
        <p>
          Price ({cartItems?.length} item)
          <Price>₹{price.toLocaleString()}</Price>
        </p>
        <p>
          Discount
          <Price style={{ color: "#388e3c" }}>
            -₹{discount.toLocaleString()}
          </Price>
        </p>
        <p>
          Delivery Charges
          <Price>₹{deliveryCharges}</Price>
        </p>

        <TotalAmount>
          Total Amount
          <span>₹{finalAmount.toLocaleString()}</span>
        </TotalAmount>

        <Savings>
          <ShieldCheck size={18} />
          You will save ₹{(discount - deliveryCharges).toLocaleString()} on this
          order
        </Savings>
      </Container>
    </Component>
  );
};

export default TotalView;
