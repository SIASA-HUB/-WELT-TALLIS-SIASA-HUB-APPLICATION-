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
  color: #1a1a1a;
  font-weight: 600;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

const CategoryCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #eaeaea;

  &:hover {
    background: #f0f0f0;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

const CategoryName = styled.h4`
  text-transform: uppercase;
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #1a1a1a;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const ProductCount = styled.p`
  color: #555;
  font-size: 13px;
  margin: 0;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
`;

const CategoriesManagement = ({ products = [] }) => {
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

  const totalProducts = products.length;

  return (
    <Container>
      <Title>Categories Management</Title>
      {totalProducts === 0 ? (
        <EmptyState>
          No products available to display categories
        </EmptyState>
      ) : (
        <Grid>
          {categories.map((cat) => {
            const count = getProductCount(cat);
            return (
              <CategoryCard key={cat}>
                <CategoryName>{cat}</CategoryName>
                <ProductCount>
                  {count} {count === 1 ? 'product' : 'products'}
                </ProductCount>
              </CategoryCard>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default CategoriesManagement;