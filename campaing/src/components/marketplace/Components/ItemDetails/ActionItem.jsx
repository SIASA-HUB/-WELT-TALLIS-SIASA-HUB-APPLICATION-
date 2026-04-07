import React, { useState, useContext } from "react";
import styled from "styled-components";
import { ShoppingCart, Zap, Heart } from "lucide-react";
import { useHistory } from "react-router-dom";
import { LoginContext } from "../../context/ContextProvider";
import { useCart } from "../../../context/CartContext";

const LeftContainer = styled.div`
  min-width: 40%;
  padding: 40px 0 0 80px;

  @media (max-width: 1200px) {
    padding: 20px 40px;
  }

  @media (max-width: 768px) {
    min-width: 100%;
    padding: 20px;
  }
`;

const ProductImage = styled.img`
  padding: 15px 20px;
  border: 1px solid #f0f0f0;
  width: 95%;
  max-height: 400px;
  object-fit: contain;
  background: white;
  border-radius: 8px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const AddToCartButton = styled.button`
  width: 46%;
  background: #ff9f00;
  color: #fff;
  border: none;
  border-radius: 2px;
  height: 50px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.3s;

  &:hover {
    background: #fb641b;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const BuyNowButton = styled.button`
  width: 46%;
  background: #fb641b;
  color: #fff;
  border: none;
  border-radius: 2px;
  height: 50px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.3s;

  &:hover {
    background: #f85606;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const Price = styled.div`
  margin: 16px 0;
  font-size: 24px;
  font-weight: 500;
  color: #212121;
`;

const OriginalPrice = styled.span`
  font-size: 16px;
  color: #878787;
  text-decoration: line-through;
  margin-left: 12px;
`;

const Discount = styled.span`
  font-size: 16px;
  color: #388e3c;
  margin-left: 12px;
`;

const ActionItem = ({ product }) => {
  const history = useHistory();
  const { account } = useContext(LoginContext);
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const { id, price, detailUrl, title, mrp } = product;

  const calculateDiscount = () => {
    if (mrp && price) {
      return Math.round(((mrp - price) / mrp) * 100);
    }
    return 0;
  };

  const addItemToCart = async () => {
    setIsAdding(true);
    try {
      addToCart(product);
      alert("Item added to cart!");
      history.push("/cart");
    } catch (error) {
      alert("Failed to add item to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const buyNow = async () => {
    await loadRazorpay(price);
  };

  const loadRazorpay = (amount) => {
    console.log("Processing payment of ₹", amount);
    alert(`Payment of ₹${amount} would be processed here`);
  };

  const discount = calculateDiscount();

  return (
    <LeftContainer>
      <ProductImage
        src={detailUrl || product.image || "https://via.placeholder.com/400"}
        alt={title || product.name}
      />

      <Price>
        ₹{price || product.cost}
        {mrp && <OriginalPrice>₹{mrp}</OriginalPrice>}
        {discount > 0 && <Discount>{discount}% off</Discount>}
      </Price>

      <ButtonGroup>
        <AddToCartButton onClick={addItemToCart} disabled={isAdding}>
          <ShoppingCart size={18} />
          {isAdding ? "ADDING..." : "ADD TO CART"}
        </AddToCartButton>
        <BuyNowButton onClick={buyNow}>
          <Zap size={18} />
          BUY NOW
        </BuyNowButton>
      </ButtonGroup>
    </LeftContainer>
  );
};

export default ActionItem;
