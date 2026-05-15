import React, { useEffect, useState } from "react";
import SEO from "../../../utils/SEO";
import styled, { keyframes } from "styled-components";
import { ShoppingCart, Share2, ArrowLeft, ShieldCheck, Truck, RotateCcw, Heart } from "lucide-react";
import { Spinner } from "react-bootstrap";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../api/api";
import { buildImageUrl } from "../../../utils/imageUtils";
import { useAuth } from "@/components/hooks/useAuth";
import { addToCart as addToCartApi } from "../components/api";
import { useCart } from "../context/CartContext";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  background: #f8fafc;
  min-height: 100vh;
  padding: 40px 0;
  display: flex;
  justify-content: center;
  font-family: 'Inter', sans-serif;
`;

const Wrapper = styled.div`
  max-width: 1200px;
  width: 95%;
  background: white;
  border-radius: 32px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.04);
  overflow: hidden;
  display: flex;
  animation: ${fadeIn} 0.6s ease-out;
  @media (max-width: 968px) {
    flex-direction: column;
  }
`;

const ImageSection = styled.div`
  flex: 1.2;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
`;

const ProductImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 550px;
  object-fit: contain;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.08));
  transition: transform 0.5s ease;
  &:hover {
    transform: scale(1.03);
  }
`;

const DetailsSection = styled.div`
  flex: 1;
  padding: 50px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  @media (max-width: 640px) {
    padding: 30px 24px;
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CategoryTag = styled.span`
  background: #fff1f2;
  color: #e11d48;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const WishlistBtn = styled.button`
  background: white;
  border: 1px solid #e2e8f0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
  &:hover {
    color: #e11d48;
    border-color: #e11d48;
    background: #fff1f2;
  }
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
  margin: 0;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 16px;
`;

const CurrentPrice = styled.span`
  font-size: 32px;
  font-weight: 800;
  color: #e11d48;
`;

const OldPrice = styled.span`
  font-size: 18px;
  color: #94a3b8;
  text-decoration: line-through;
  font-weight: 500;
`;

const DiscountBadge = styled.span`
  background: #16a34a;
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #64748b;
`;

const Description = styled.div`
  color: #475569;
  font-size: 15px;
  line-height: 1.7;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  padding: 20px 0;
  
  strong {
    color: #0f172a;
    display: block;
    margin-bottom: 8px;
  }
`;

const OptionLabel = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
`;

const SizeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 10px;
`;

const SizeBox = styled.button`
  height: 48px;
  border: 2px solid ${props => props.active ? '#e11d48' : '#e2e8f0'};
  background: ${props => props.active ? '#e11d48' : 'white'};
  color: ${props => props.active ? 'white' : '#0f172a'};
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: #e11d48;
    color: ${props => props.active ? 'white' : '#e11d48'};
  }
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
  margin-top: 10px;
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const PrimaryBtn = styled.button`
  background: #0f172a;
  color: white;
  border: none;
  height: 56px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.15);
  
  &:hover {
    background: #1e293b;
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(15, 23, 42, 0.25);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;

const SecondaryBtn = styled.button`
  background: #0f172a;
  color: white;
  border: none;
  height: 56px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.1);
  
  &:hover {
    background: #1e293b;
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(15, 23, 42, 0.2);
  }
`;

const TrustRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 10px;
`;

const TrustItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  svg {
    color: #16a34a;
    width: 20px;
    height: 20px;
  }
`;

const StockBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #16a34a;
  .dot {
    width: 8px;
    height: 8px;
    background: #16a34a;
    border-radius: 50%;
    box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.2);
  }
`;

const StarRating = ({ value }) => (
  <div style={{ display: "flex", color: "#fbbf24", gap: "2px" }}>
    {[...Array(5)].map((_, i) => (
      <span key={i} style={{ fontSize: "16px" }}>
        {i < Math.floor(value) ? "★" : "☆"}
      </span>
    ))}
  </div>
);

const ProductDetails = () => {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { addToCart: addToCartContext } = useCart();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      let res;
      // If slug is a number, it's likely an ID. If it contains non-digits, it's a slug.
      const isSlug = slug && isNaN(Number(slug));
      
      if (isSlug) {
        console.log(`[ProductDetails] Fetching by slug: ${slug}`);
        res = await api.get(`/products/slug/${slug}`);
      } else {
        console.log(`[ProductDetails] Fetching by id: ${slug}`);
        res = await api.get(`/products/${slug}`);
      }

      if (res?.success && res.data) {
        setProduct(res.data);
        const sizes = typeof res.data.sizes === "string"
          ? res.data.sizes.split(",").map(s => s.trim()).filter(Boolean)
          : (res.data.sizes || []);
        if (sizes.length > 0) setSelectedSize(sizes[0]);

        // Reward 10 points for browsing
        const token = localStorage.getItem("access_token");
        if (token) {
          api.post("/wallet/reward", { action: "browsing product", amount: 10 }, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => {}); // Silent fail
        }
      } else {
        console.warn("[ProductDetails] Product not found in response:", res);
        setProduct(null);
      }
    } catch (error) {
      console.error("[ProductDetails] Error fetching product:", error);
      toast.error("Failed to load product details.");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = () => {
    const token = localStorage.getItem("access_token");
    const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
    if (!token || !userData?.user_id) {
      toast.info("Please log in to continue with your purchase.");
      navigate("/login");
      return false;
    }
    return true;
  };

  const addToCart = async () => {
    if (!product || !checkAuth()) return;
    if (!selectedSize && product.sizes?.length > 0) {
      toast.warn("Please select a size.");
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

      // Update local context so navbar count updates
      addToCartContext({
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        size: selectedSize
      });

      toast.success("Added to cart successfully! 🛒");
    } catch (err) {
      toast.error(err.message || "Failed to add to cart.");
    } finally {
      setButtonLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || !checkAuth()) return;
    setButtonLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      await addToCartApi(token, {
        productId: product._id || product.id,
        quantity: 1,
        size: selectedSize,
      });

      // Update local context
      addToCartContext({
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        size: selectedSize
      });

      navigate("/marketplace/cart");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setButtonLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return (
    <Container>
      <Spinner animation="border" style={{ color: "#e11d48", marginTop: "100px" }} />
    </Container>
  );

  if (!product) return (
    <Container>
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <h2>Product not found</h2>
        <Link to="/marketplace" style={{ color: "#e11d48", fontWeight: 600 }}>← Back to marketplace</Link>
      </div>
    </Container>
  );

  const price = product.price || 0;
  const mrp = product.mrp || 0;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const parsedSizes = typeof product.sizes === "string" 
    ? product.sizes.split(",").map(s => s.trim()) 
    : (product.sizes || []);

  const generateDescription = (product) => {
    if (product.description && product.description.length > 50 && !product.description.includes("Crafted for durability")) {
      return product.description;
    }

    const name = (product.name || "item").toLowerCase();
    const cat = (product.category || "").toLowerCase();

    if (name.includes("t-shirt") || name.includes("tee") || cat.includes("clothing")) {
      return `This premium ${product.name} is crafted from 100% breathable cotton for ultimate comfort. Featuring a reinforced crew neck and a modern tailored fit, it's perfect for campaign rallies, grassroots mobilization, or casual everyday wear. Durable enough to withstand multiple washes while maintaining its vibrant color and shape.`;
    }
    if (name.includes("cap") || name.includes("hat") || cat.includes("accessories")) {
      return `Make a statement with this high-quality ${product.name}. Designed with a structured crown and an adjustable strap for a perfect fit, this cap is made from premium twill fabric that offers both sun protection and style. The reinforced stitching ensures it remains a staple in your campaign wardrobe for years to come.`;
    }
    if (name.includes("hoodie") || name.includes("sweatshirt")) {
      return `Stay warm and professional in this ultra-soft ${product.name}. Built with heavyweight fleece and a double-lined hood, it provides exceptional warmth and a premium feel. Features a spacious kangaroo pocket and ribbed cuffs, making it the ideal choice for outdoor campaign events in any weather.`;
    }
    if (name.includes("poster") || name.includes("banner") || cat.includes("branding")) {
      return `High-impact ${product.name} printed on premium weather-resistant material. Featuring vibrant, fade-resistant UV inks, this branding essential ensures your message stands out from a distance. Ideal for high-traffic areas and outdoor mobilization.`;
    }

    return `Experience the perfect blend of style and durability with this authentic ${product.name}. Meticulously designed for those who demand quality, this item is a versatile addition to your collection, offering both comfort and a professional aesthetic that represents the SiasaHub standard.`;
  };

  const productDescription = product ? generateDescription(product) : "";

  return (
    <Container>
      <SEO 
        title={`${product.name} | SiasaHub Shop`}
        description={productDescription}
      />
      <Wrapper>
        <ImageSection>
          <Link to="/marketplace" style={{ position: "absolute", top: 30, left: 30, zIndex: 10 }}>
            <WishlistBtn><ArrowLeft size={20} /></WishlistBtn>
          </Link>
          <ProductImage src={buildImageUrl(product.image)} alt={product.name} />
          {discount > 0 && <DiscountBadge style={{ position: "absolute", top: 30, right: 30 }}>-{discount}%</DiscountBadge>}
        </ImageSection>

        <DetailsSection>
          <CategoryHeader>
            <CategoryTag>{product.category || "General"}</CategoryTag>
            <WishlistBtn><Heart size={20} /></WishlistBtn>
          </CategoryHeader>

          <div>
            <Title>{product.name}</Title>
            <RatingRow style={{ marginTop: 8 }}>
              <StarRating value={4.5} />
              <span>(120+ Reviews)</span>
              <StockBadge><div className="dot" /> In Stock</StockBadge>
            </RatingRow>
          </div>

          <PriceRow>
            <CurrentPrice>KSH {Number(price).toLocaleString()}</CurrentPrice>
            {mrp > price && <OldPrice>KSH {Number(mrp).toLocaleString()}</OldPrice>}
          </PriceRow>

          <Description>
            <strong>Product Information</strong>
            {productDescription}
          </Description>

          {parsedSizes.length > 0 && (
            <div>
              <OptionLabel>
                Select Size <span>Size Guide</span>
              </OptionLabel>
              <SizeGrid>
                {parsedSizes.map(size => (
                  <SizeBox 
                    key={size} 
                    active={selectedSize === size}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </SizeBox>
                ))}
              </SizeGrid>
            </div>
          )}

          <div style={{ marginTop: 10 }}>
            <OptionLabel>Action</OptionLabel>
            <ActionGrid>
              <PrimaryBtn onClick={handleBuyNow} disabled={buttonLoading}>
                {buttonLoading ? <Spinner size="sm" /> : <>Buy Now</>}
              </PrimaryBtn>
              <SecondaryBtn onClick={addToCart} disabled={buttonLoading}>
                <ShoppingCart size={20} />
              </SecondaryBtn>
            </ActionGrid>
          </div>

          <TrustRow>
            <TrustItem><Truck /><br />Fast Delivery</TrustItem>
            <TrustItem><ShieldCheck /><br />Genuine Quality</TrustItem>
            <TrustItem><RotateCcw /><br />7 Day Return</TrustItem>
          </TrustRow>

          <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
             <SlugTag style={{ fontSize: 10, opacity: 0.6 }}>SKU: {product.slug || product._id}</SlugTag>
             <button onClick={() => {
               navigator.clipboard.writeText(window.location.href);
               alert("Link copied!");
             }} style={{ background: "none", border: "none", color: "#64748b", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
               <Share2 size={10} /> Share
             </button>
          </div>
        </DetailsSection>
      </Wrapper>
    </Container>
  );
};

const SlugTag = styled.span`
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
  color: #64748b;
  font-family: monospace;
`;

export default ProductDetails;