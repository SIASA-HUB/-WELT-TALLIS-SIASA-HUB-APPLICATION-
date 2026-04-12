import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Button from "../components/Button";
import { Heart, ShoppingCart } from "lucide-react";
import { Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  addToCart,
  addToFavourite,
  deleteFromFavourite,
  getFavourite,
  getProductDetails,
} from "../components/api";
import { useAuth } from "@/components/hooks/useAuth";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: ${({ theme }) => theme.bg};
`;
const Wrapper = styled.div`
  max-width: 1300px;
  width: 100%;
  display: flex;
  padding: 40px 24px;
  gap: 60px;
  @media (max-width: 900px) {
    flex-direction: column;
    padding: 24px 16px;
    gap: 32px;
  }
`;
const ImageWrapper = styled.div`
  flex: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 32px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.04);
`;
const Image = styled.img`
  max-width: 100%;
  height: 600px;
  border-radius: 20px;
  object-fit: contain;
  @media (max-width: 750px) {
    height: 350px;
  }
`;

const Details = styled.div`
  display: flex;
  gap: 24px;
  flex-direction: column;
  flex: 1;
`;

const Title = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: ${({ theme }) => theme.text_primary};
  line-height: 1.2;
`;
const Desc = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: ${({ theme }) => theme.text_secondary};
  line-height: 1.6;
`;
const Category = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #e11d48;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: -10px;
`;
const Price = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.text_primary};
`;
const Span = styled.div`
  font-size: 20px;
  font-weight: 500;
  color: #94a3b8;
  text-decoration: line-through;
`;
const Percent = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #22c55e;
  background: #f0fdf4;
  padding: 4px 12px;
  border-radius: 10px;
`;

const Sizes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const Label = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.text_primary};
`;
const Items = styled.div`
  display: flex;
  gap: 12px;
`;
const Item = styled.div`
  border: 2px solid ${({ theme }) => theme.primary + 20};
  font-size: 14px;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  ${({ selected, theme }) =>
    selected ?
    `
    background: ${theme.primary};
    color: white;
    border-color: ${theme.primary};
    box-shadow: 0 4px 12px ${theme.primary + 40};
    ` : 
    `
    &:hover {
      border-color: ${theme.primary};
      color: ${theme.primary};
    }
    `
  }
`;
const ButtonWrapper = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 20px;
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

// Simple custom Star component for rating
const StarRating = ({ value }) => {
  return (
    <div style={{ display: "flex", color: "#fbce1f", gap: "2px" }}>
      {[...Array(5)].map((_, i) => (
        <span key={i} style={{ fontSize: "22px" }}>
          {i < Math.floor(value) ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState();
  const [selectedSize, setSelectedSize] = useState();
  const [favorite, setFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  const getAuthToken = () => localStorage.getItem("access_token");

  const getProduct = async () => {
    setLoading(true);
    try {
      const res = await getProductDetails(id);
      const productData = res.data.data;
      setProduct(productData);
      if (productData?.sizes?.length > 0) {
        setSelectedSize(productData.sizes[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addCart = async () => {
    // Standard Cart Implementation (Guest-first)
    const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
    const existingItemIndex = guestCart.findIndex(item => item.product._id === product._id);
    
    if (existingItemIndex > -1) {
      guestCart[existingItemIndex].quantity += 1;
    } else {
      guestCart.push({ product, quantity: 1, selectedSize });
    }
    
    localStorage.setItem("guest_cart", JSON.stringify(guestCart));
    alert("Added to cart!");
    navigate("/marketplace/cart");
  };

  const checkFavourite = async () => {
    if (!isAuthenticated || !product) return;
    try {
      const res = await getFavourite(getAuthToken(), { productId: product?._id });
      const isFavorite = res.data?.some(fav => fav._id === product?._id);
      setFavorite(isFavorite);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      checkFavourite();
    }
  }, [product, isAuthenticated]);

  return (
    <Container>
      {loading ? (
        <Spinner animation="border" style={{ color: "#e11d48" }} />
      ) : (
        <Wrapper>
          <ImageWrapper>
            <Image src={product?.img} />
          </ImageWrapper>
          <Details>
            <Category>{product?.category || "Premium Collection"}</Category>
            <Title>{product?.title || product?.name}</Title>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <StarRating value={product?.rating || 4.5} />
              <span style={{ color: "#64748b", fontWeight: 500 }}>(120 Reviews)</span>
            </div>

            <Price>
              KSH {Number(product?.price?.org).toLocaleString()} 
              {product?.price?.mrp && product.price.mrp > product.price.org && (
                <>
                  <Span>KSH {Number(product?.price?.mrp).toLocaleString()}</Span>
                  <Percent>{product?.price?.off}% Off</Percent>
                </>
              )}
            </Price>

            <Desc>{product?.description || "Experience the perfect blend of style and comfort with our latest collection. This premium product is crafted from high-quality materials to ensure durability and a perfect fit for any occasion."}</Desc>
            
            <Sizes>
              <Label>Select Size</Label>
              <Items>
                {(product?.sizes?.length > 0 ? product.sizes : ["S", "M", "L", "XL"]).map((size) => (
                  <Item
                    key={size}
                    selected={selectedSize === size}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Item>
                ))}
              </Items>
            </Sizes>

            <ButtonWrapper>
              <Button
                text="Add to Cart"
                full
                variant="outlined"
                isLoading={cartLoading}
                onClick={addCart}
                style={{ background: 'white', color: '#e11d48', border: '2px solid #e11d48' }}
              />
              <Button
                text="Buy Now"
                full
                onClick={() => {
                  // Direct Order: Clear guest cart and add only this item
                  localStorage.setItem("guest_cart", JSON.stringify([{ product, quantity: 1, selectedSize }]));
                  navigate("/marketplace/cart");
                }}
              />
            </ButtonWrapper>
          </Details>
        </Wrapper>
      )}
    </Container>
  );
};

export default ProductDetails;
