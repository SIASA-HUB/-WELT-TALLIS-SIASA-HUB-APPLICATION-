import React from "react";
import styled from "styled-components";
import { Tag, Truck, Shield, Store, FileText } from "lucide-react";

const Container = styled.div`
  padding: 20px;
  background: white;
  border-radius: 8px;
`;

const OffersTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
`;

const OfferItem = styled.div`
  display: flex;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 10px;
  color: #212121;
`;

const OfferIcon = styled(Tag)`
  color: #00cc00;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

const InfoGrid = styled.div`
  margin-top: 20px;
  border-top: 1px solid #f0f0f0;
`;

const InfoRow = styled.div`
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Label = styled.div`
  width: 120px;
  font-size: 14px;
  color: #878787;
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 8px;
  }
`;

const Value = styled.div`
  flex: 1;
  font-size: 14px;
  color: #212121;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SellerLink = styled.span`
  color: #2874f0;
  cursor: pointer;
  font-weight: 500;
`;

const AdImage = styled.img`
  width: 100%;
  max-width: 390px;
  margin: 8px 0;
`;

const ProductDetail = ({ product }) => {
  const adURL =
    "https://rukminim1.flixcart.com/lockin/774/185/images/CCO__PP_2019-07-14.png?q=50";
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const formattedDate = deliveryDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <Container>
      <OffersTitle>Available offers</OffersTitle>

      <OfferItem>
        <OfferIcon size={16} />
        <span>
          Bank Offer 5% Unlimited Cashback on Flipkart Axis Bank Credit Card
        </span>
      </OfferItem>
      <OfferItem>
        <OfferIcon size={16} />
        <span>Bank Offer 10% Off on Bank of Baroda Mastercard debit card</span>
      </OfferItem>
      <OfferItem>
        <OfferIcon size={16} />
        <span>
          Purchase this Furniture and Get Extra ₹500 Off on Select ACs
        </span>
      </OfferItem>
      <OfferItem>
        <OfferIcon size={16} />
        <span>
          Partner Offer Extra 10% off upto ₹500 on next furniture purchase
        </span>
      </OfferItem>

      <InfoGrid>
        <InfoRow>
          <Label>
            <Truck size={14} /> Delivery
          </Label>
          <Value>Delivery by {formattedDate} | ₹40</Value>
        </InfoRow>

        <InfoRow>
          <Label>
            <Shield size={14} /> Warranty
          </Label>
          <Value>No Warranty</Value>
        </InfoRow>

        <InfoRow>
          <Label>
            <Store size={14} /> Seller
          </Label>
          <Value>
            <SellerLink>SuperComNet</SellerLink>
            <div style={{ fontSize: 12, color: "#878787", marginTop: 4 }}>
              GST invoice available
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#2874f0",
                marginTop: 4,
                cursor: "pointer",
              }}
            >
              View more sellers starting from ₹329 →
            </div>
          </Value>
        </InfoRow>

        <InfoRow>
          <Label></Label>
          <Value>
            <AdImage src={adURL} alt="" />
          </Value>
        </InfoRow>

        <InfoRow>
          <Label>
            <FileText size={14} /> Description
          </Label>
          <Value>{product.description || "No description available"}</Value>
        </InfoRow>
      </InfoGrid>
    </Container>
  );
};

export default ProductDetail;
