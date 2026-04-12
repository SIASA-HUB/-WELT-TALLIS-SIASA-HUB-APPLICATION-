import React, { useEffect, useState } from "react";
import ProductCard from "../components/cards/ProductCard";
import styled from "styled-components";
import {
  category,
  filter,
} from "../components/utils/data";
import { Spinner, Form } from "react-bootstrap";
import { getAllProducts } from "../components/api";
import { useLocation } from "react-router-dom";

const Container = styled.div`
  padding: 40px 30px;
  height: calc(100vh - 80px);
  display: flex;
  gap: 40px;
  background: #f8fafc;
  @media (max-width: 900px) {
    flex-direction: column;
    height: auto;
    padding: 20px 16px;
  }
`;

const Sidebar = styled.div`
  width: 280px;
  background: white;
  border-radius: 24px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  height: fit-content;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  @media (max-width: 900px) {
    width: 100%;
  }
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FilterTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CategoryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${({ selected }) => (selected ? "#e11d48" : "#64748b")};
  font-weight: ${({ selected }) => (selected ? "600" : "500")};
  cursor: pointer;
  padding: 6px 0;
  transition: all 0.2s ease;
  &:hover {
    color: #e11d48;
  }
`;

const SizeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
`;

const SizeBox = styled.div`
  height: 40px;
  border: 1px solid ${({ selected }) => (selected ? "#e11d48" : "#e2e8f0")};
  background: ${({ selected }) => (selected ? "#fff1f2" : "transparent")};
  color: ${({ selected }) => (selected ? "#e11d48" : "#64748b")};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    border-color: #e11d48;
    color: #e11d48;
  }
`;

const MainContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
  }
`;

const ShopHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const Title = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
`;

const ResultCount = styled.div`
  font-size: 15px;
  color: #64748b;
  font-weight: 500;
`;

const CardWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
  justify-items: center;
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
`;

const PriceDisplay = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #e11d48;
  margin-top: 4px;
`;

const ShopListing = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [priceRange, setPriceRange] = useState(1000);
  const [selectedSizes, setSelectedSizes] = useState([]); 
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  const location = useLocation();

  const getFilteredProductsData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("maxPrice", priceRange);
      if (selectedCategories.length > 0) {
        const slugs = selectedCategories.map(cat => cat.toLowerCase().replace("-", ""));
        params.append("categories", slugs.join(","));
      }
      if (selectedSizes.length > 0) {
        params.append("sizes", selectedSizes.join(","));
      }

      const res = await getAllProducts(params.toString());
      setProducts(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Parse category from URL if present
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      // Find the best match in our defined categories (case insensitive)
      const match = category.find(c => 
        c.slug.toLowerCase() === categoryParam.toLowerCase() || 
        c.name.toLowerCase() === categoryParam.toLowerCase()
      );
      if (match) {
        setSelectedCategories([match.name]);
      } else {
        // Fallback: capitalize for UI display
        const normalized = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
        setSelectedCategories([normalized]);
      }
    }
  }, [location.search]);

  useEffect(() => {
    getFilteredProductsData();
  }, [priceRange, selectedSizes, selectedCategories]);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  return (
    <Container>
      <MainContent style={{ paddingRight: 0 }}>
        <ShopHeader>
          <Title>Shop Our Collection</Title>
          <ResultCount>Showing {products.length} products</ResultCount>
        </ShopHeader>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
            <Spinner animation="border" style={{ color: "#e11d48" }} />
          </div>
        ) : (
          <CardWrapper>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
            {products.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "80px", color: "#64748b" }}>
                No products found matching your filters.
              </div>
            )}
          </CardWrapper>
        )}
      </MainContent>
    </Container>
  );
};

export default ShopListing;
