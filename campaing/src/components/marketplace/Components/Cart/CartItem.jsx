import React from "react";
import styled from "styled-components";
import { Trash2, Minus, Plus } from "lucide-react";

const API_URL = "http://localhost:8000";

const ItemContainer = styled.div`
  display: flex;
  padding: 20px 24px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  gap: 20px;
  transition: background 0.2s;

  &:hover {
    background: #fafafa;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const ImageContainer = styled.div`
  width: 100px;
  height: 100px;
  background: #f8f8f8;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
  }
`;

const DetailsContainer = styled.div`
  flex: 1;
`;

const ProductName = styled.h4`
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 500;
  color: #1a1a2e;
`;

const ProductPrice = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #bb0000;
  margin: 6px 0;
`;

const QuantityWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 12px 0;
`;

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    border-color: #bb0000;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityValue = styled.span`
  font-size: 16px;
  font-weight: 500;
  min-width: 32px;
  text-align: center;
`;

const TotalPrice = styled.span`
  color: #666;
  font-size: 14px;
  margin-left: 16px;

  strong {
    color: #1a1a2e;
    font-size: 16px;
  }
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #ff6161;
  cursor: pointer;
  padding: 6px 0;
  font-size: 13px;
  transition: color 0.2s;

  &:hover {
    color: #ff0000;
  }
`;

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/")) return `${API_URL}${imagePath}`;
  return `${API_URL}/${imagePath}`;
};

const CartItem = ({ item, removeItemFromCart, updateQuantity }) => {
  const quantity = item.quantity || 1;
  const imageUrl = getImageUrl(item.image);
  const totalItemPrice = (item.price || 0) * quantity;

  return (
    <ItemContainer>
      <ImageContainer>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML = "📦";
            }}
          />
        ) : (
          <span style={{ fontSize: 32 }}>📦</span>
        )}
      </ImageContainer>

      <DetailsContainer>
        <ProductName>{item.name}</ProductName>
        <ProductPrice>KES {item.price?.toLocaleString()}</ProductPrice>

        <QuantityWrapper>
          <QuantityButton
            onClick={() =>
              updateQuantity && updateQuantity(item.id, quantity - 1)
            }
            disabled={quantity <= 1}
          >
            <Minus size={14} />
          </QuantityButton>
          <QuantityValue>{quantity}</QuantityValue>
          <QuantityButton
            onClick={() =>
              updateQuantity && updateQuantity(item.id, quantity + 1)
            }
          >
            <Plus size={14} />
          </QuantityButton>
          <TotalPrice>
            Total: <strong>KES {totalItemPrice.toLocaleString()}</strong>
          </TotalPrice>
        </QuantityWrapper>

        <RemoveButton onClick={() => removeItemFromCart(item.id)}>
          <Trash2 size={14} />
          Remove
        </RemoveButton>
      </DetailsContainer>
    </ItemContainer>
  );
};

export default CartItem;
