import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import SEO from "../../../utils/SEO";
import styled from "styled-components";
import { ShoppingCart, Share2, ArrowLeft } from "lucide-react";
import { Spinner } from "react-bootstrap";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../../api/api";
import API from "../../../api/config";
import { useAuth } from "@/components/hooks/useAuth";
import { addToCart as addToCartApi } from "../components/api";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  min-height: 100vh;
  overflow-y: auto;
  background: #ffffff;
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

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  transition: all 0.2s;
  width: fit-content;
  
  &:hover { 
    background: #f1f5f9;
    color: #e11d48;
    transform: translateX(-2px);
  }
`;

const Breadcrumb = styled.nav`
  font-size: 12px;
  color: #475569;
  font-weight: 500;
  margin-bottom: 16px;
  a { 
    color: #e11d48; 
    text-decoration: none;
    font-weight: 600;
    &:hover { text-decoration: underline; }
  }
  span { margin: 0 6px; color: #94a3b8; }
`;

const ImageWrapper = styled.div`
  flex: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 32px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
`;

const Image = styled.img`
  max-width: 100%;
  height: 600px;
  border-radius: 20px;
  object-fit: contain;
  loading: lazy;
  @media (max-width: 750px) {
    height: 350px;
  }
`;

const Details = styled.div`
  display: flex;
  gap: 20px;
  flex-direction: column;
  flex: 1;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: #1a1a2e;
  line-height: 1.2;
  margin: 0;
`;

const Desc = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  line-height: 1.6;
  margin: 0;
`;

const Category = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #e11d48;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: -8px;
`;

const Price = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 800;
  color: #1a1a2e;
`;

const Span = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #64748b;
  text-decoration: line-through;
`;

const Percent = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #16a34a;
  background: #f0fdf4;
  padding: 4px 10px;
  border-radius: 8px;
`;

const Sizes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #1a1a2e;
`;

const Items = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Item = styled.div`
  border: 2px solid ${({ theme }) => theme.primary + "40"};
  font-size: 13px;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s ease;
  color: #1a1a2e;
  ${({ selected, theme }) =>
    selected
      ? `background: ${theme.primary}; color: white; border-color: ${theme.primary}; box-shadow: 0 2px 8px ${theme.primary + "66"};`
      : `&:hover { border-color: ${theme.primary}; color: ${theme.primary}; background: ${theme.primary + "10"}; }`
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

// FIXED: Changed to solid red background for better visibility
const AddToCartBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background: #e11d48;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  
  &:hover { 
    background: #be123c;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const BuyNowBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background: #e11d48;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  
  &:hover { 
    background: #be123c;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ShareBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  
  &:hover { 
    border-color: #e11d48; 
    color: #e11d48; 
    background: #fff1f2;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const SlugTag = styled.div`
  font-size: 11px;
  color: #475569;
  font-family: monospace;
  background: #f1f5f9;
  border-radius: 6px;
  padding: 4px 10px;
  width: fit-content;
  font-weight: 500;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const ReviewCount = styled.span`
  color: #475569;
  font-weight: 600;
  font-size: 13px;
`;

const ErrorContainer = styled.div`
  margin: auto;
  text-align: center;
  padding: 60px 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
`;

const ErrorTitle = styled.h2`
  color: #dc2626;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
`;

const ErrorLink = styled(Link)`
  color: #e11d48;
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const StarRating = ({ value }) => (
  <div style={{ display: "flex", color: "#fbbf24", gap: "3px" }}>
    {[...Array(5)].map((_, i) => (
      <span key={i} style={{ fontSize: "18px", fontWeight: "normal" }}>
        {i < Math.floor(value) ? "★" : "☆"}
      </span>
    ))}
  </div>
);

const ProductDetails = () => {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      let res;
      if (slug && isNaN(slug)) {
        res = await api.get(`/products/slug/${slug}`);
      } else {
        res = await api.get(`/products/${slug}`);
      }

      const productData = res?.data;
      if (productData) {
        setProduct(productData);
        const sizes = typeof productData.sizes === "string"
          ? productData.sizes.split(",").map(s => s.trim()).filter(Boolean)
          : (productData.sizes || []);
        if (sizes.length > 0) setSelectedSize(sizes[0]);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if user is logged in (from localStorage as fallback)
  const checkAuth = () => {
    const token = localStorage.getItem("access_token");
    const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
    const userId = userData?.user_id;

    if (!isAuthenticated && !token && !userId) {
      alert("You are not logged in. Please log in to continue.");
      return false;
    }
    return true;
  };

  const addToCart = async () => {
    if (!product) return;

    // Check if user is logged in
    if (!checkAuth()) return;

    // Validate size selection
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      alert("Please select a size before adding to cart.");
      return;
    }

    setButtonLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      await addToCartApi(token, {
        productId: product._id || product.id,
        quantity: 1,
        size: selectedSize,
      });

      // Show success message and redirect
      alert("Item added to cart successfully!");
      navigate("/marketplace");
    } catch (err) {
      console.error("Cart Add Error:", err);
      alert(err.message || "Failed to add to cart. Please try again.");
    } finally {
      setButtonLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!checkAuth()) return;

    if (!selectedSize && product?.sizes && product.sizes.length > 0) {
      alert("Please select a size before buying.");
      return;
    }

    // Add to cart first, then go to checkout
    addToCartApi(localStorage.getItem("access_token"), {
      productId: product._id || product.id,
      quantity: 1,
      size: selectedSize,
    })
      .then(() => {
        navigate("/checkout");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to process. Please try again.");
      });
  };

  const handleShare = () => {
    const url = `${window.location.origin}/product/${product?.slug || slug}`;
    if (navigator.share) {
      navigator.share({ title: product?.name, url });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  useEffect(() => {
    if (slug) fetchProduct();
  }, [slug]);

  const APP_URL = "https://siasahub.co.ke";
  const productUrl = `${APP_URL}/product/${product?.slug || slug}`;
  const productImage = product?.image
    ? (product.image.startsWith("http") ? product.image : `${API.IMAGES}${product.image}`)
    : `${APP_URL}/og-default.png`;
  const price = product?.price || 0;
  const mrp = product?.mrp || 0;
  const discountPct = mrp > price && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const parsedSizes = product
    ? (typeof product.sizes === "string"
      ? product.sizes.split(",").map(s => s.trim()).filter(Boolean)
      : (product.sizes || []))
    : ["S", "M", "L", "XL"];

  return (
    <Container>
      <SEO
        title={product ? `${product.name} — KSH ${Number(price).toLocaleString()} | Campaign Shop` : "Marketplace"}
        description={product?.description || `Buy ${product?.name} at the best price on Siasahub Store.`}
        canonical={productUrl}
        ogImage={productImage}
        ogType="product"
        jsonLd={product ? {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "image": productImage,
          "description": product.description,
          "sku": product.slug || product.id,
          "offers": {
            "@type": "Offer",
            "url": productUrl,
            "priceCurrency": "KES",
            "price": price,
            "availability": "https://schema.org/InStock"
          },
          "brand": {
            "@type": "Brand",
            "name": "SiasaHub"
          }
        } : null}
      >
        <meta property="product:price:amount" content={price} />
        <meta property="product:price:currency" content="KES" />
      </SEO>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
          <Spinner animation="border" style={{ color: "#e11d48", width: "40px", height: "40px" }} />
        </div>
      ) : !product ? (
        <ErrorContainer>
          <ErrorTitle>Product not found</ErrorTitle>
          <p style={{ color: "#475569", marginBottom: "24px" }}>
            The product you're looking for doesn't exist or has been removed.
          </p>
          <ErrorLink to="/marketplace">← Back to shop</ErrorLink>
        </ErrorContainer>
      ) : (
        <Wrapper>
          <ImageWrapper>
            <Image
              src={productImage}
              alt={product.name}
              loading="lazy"
              onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=e11d48&color=fff&size=400`; }}
            />
          </ImageWrapper>

          <Details>
            <BackButton to="/marketplace">
              <ArrowLeft size={14} />
              Back to Shop
            </BackButton>

            <Breadcrumb>
              <a href="/">Home</a><span>/</span>
              <a href="/marketplace">Shop</a><span>/</span>
              <a href={`/marketplace?category=${product.category}`}>{product.category}</a><span>/</span>
              <span style={{ color: "#1a1a2e", fontWeight: 600 }}>{product.name}</span>
            </Breadcrumb>

            <Category>{product.category || "Premium Collection"}</Category>
            <Title>{product.name}</Title>

            <RatingContainer>
              <StarRating value={product.rating || 4.5} />
              <ReviewCount>({product.reviewCount || 120} Reviews)</ReviewCount>
            </RatingContainer>

            <Price>
              KSH {Number(price).toLocaleString()}
              {mrp > price && (
                <>
                  <Span>KSH {Number(mrp).toLocaleString()}</Span>
                  <Percent>{discountPct}% Off</Percent>
                </>
              )}
            </Price>

            <Desc>{product.description || "Experience the perfect blend of style and comfort. Crafted from high-quality materials for durability and a perfect fit."}</Desc>

            {parsedSizes.length > 0 && (
              <Sizes>
                <Label>Select Size</Label>
                <Items>
                  {parsedSizes.map((size) => (
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
            )}

            {product.slug && (
              <SlugTag>🔗 SKU: {product.slug}</SlugTag>
            )}

            <ButtonWrapper>
              <AddToCartBtn onClick={addToCart} disabled={buttonLoading}>
                <ShoppingCart size={18} />
                {buttonLoading ? "Adding..." : "Add to Cart"}
              </AddToCartBtn>
              <BuyNowBtn onClick={handleBuyNow}>
                Buy Now
              </BuyNowBtn>
            </ButtonWrapper>

            <ShareBtn onClick={handleShare}>
              <Share2 size={14} />
              Share this product
            </ShareBtn>
          </Details>
        </Wrapper>
      )}
    </Container>
  );
};

export default ProductDetails;