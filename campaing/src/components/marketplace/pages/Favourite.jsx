import React, { useEffect, useState } from "react";
import styled from "styled-components";
import ProductCard from "../components/cards/ProductCard";
import { getFavourite } from "../components/api";
import { Spinner } from "react-bootstrap";
import { useAuth } from "@/components/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

const Container = styled.div`
  padding: 20px 30px;
  padding-bottom: 200px;
  height: 100%;
  overflow-y: scroll;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 30px;
  @media (max-width: 768px) {
    padding: 20px 12px;
  }
  background: ${({ theme }) => theme.bg};
`;
const Section = styled.div`
  max-width: 1400px;
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const Title = styled.div`
  font-size: 28px;
  font-weight: 500;
  display: flex;
  justify-content: ${({ center }) => (center ? "center" : "space-between")};
  align-items: center;
`;

const CardWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  @media (max-width: 750px) {
    gap: 14px;
  }
`;

const Favourite = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getProducts = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await getFavourite(token);
      setProducts(res.data.data || []);
    } catch (error) {
      console.error("Error fetching favourites:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Container>
        <Section>
          <Title>Please sign in to view your favourites</Title>
          <Button text="Sign In" onClick={() => navigate("/login")} />
        </Section>
      </Container>
    );
  }

  return (
    <Container>
      <Section>
        <Title>Your favourites</Title>
        <CardWrapper>
          {loading ? (
            <Spinner animation="border" style={{ color: "#e11d48" }} />
          ) : (
            <>
              {products.length === 0 ? (
                <div style={{ textAlign: "center", width: "100%", padding: "40px" }}>
                  No Products found in your favourites.
                </div>
              ) : (
                <CardWrapper>
                  {products.map((product) => (
                    <ProductCard key={product?._id} product={product} />
                  ))}
                </CardWrapper>
              )}
            </>
          )}
        </CardWrapper>
      </Section>
    </Container>
  );
};

export default Favourite;
