import React from "react";
import styled from "styled-components";

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  font-size: 18px;
  margin: 0 0 20px 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

const CategoryCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    transform: translateY(-2px);
  }
`;

const CategoryName = styled.h4`
  text-transform: uppercase;
  font-size: 16px;
  margin: 0 0 8px 0;
`;

const ProductCount = styled.p`
  color: #666;
  font-size: 12px;
  margin: 0;
`;

const CategoriesManagement = ({ products }) => {
  const categories = [
    "caps",
    "tshirts",
    "hoodies",
    "posters",
    "badges",
    "stickers",
    "banners",
    "wristbands",
    "bags",
  ];

  const getProductCount = (category) => {
    return products.filter((p) => p.category === category).length;
  };

  return (
    <Container>
      <Title>Categories</Title>
      <Grid>
        {categories.map((cat) => (
          <CategoryCard key={cat}>
            <CategoryName>{cat}</CategoryName>
            <ProductCount>{getProductCount(cat)} products</ProductCount>
          </CategoryCard>
        ))}
      </Grid>
    </Container>
  );
};

export default CategoriesManagement;
