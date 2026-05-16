import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { useCart } from "../../context/CartContext";
import { addToCart as addToCartApi } from "../../components/api";
import { useNavigate } from "react-router-dom";

// ======================== STYLED COMPONENTS ========================
const Card = styled(motion.div)`
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f1f5f9;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.08);
    border-color: #e2e8f0;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 110%; 
  background: #f8fafc;
  overflow: hidden;
`;

const ProductImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const BadgesContainer = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 2;
`;

const Badge = styled.div`
  background: ${p => p.type === 'Trending' ? '#1a1a2e' : p.type === 'Best Seller' || p.type === 'Featured' ? '#ef4444' : '#ffffff'};
  color: ${p => p.type === 'Trending' || p.type === 'Best Seller' || p.type === 'Featured' ? '#ffffff' : '#1a1a2e'};
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const WishlistButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #ffffff;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  color: #64748b;
  z-index: 2;
  transition: all 0.2s;
  &:hover { color: #ef4444; transform: scale(1.1); }
`;

const Content = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
`;

const Category = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #ef4444;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Name = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
  line-height: 1.4;
`;

const StockIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: ${p => p.low ? '#f59e0b' : '#22c55e'};
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 10px;
`;

const Price = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: #1a1a2e;
`;

const QuickAdd = styled.button`
  background: #1a1a2e;
  color: white;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: #000; transform: scale(1.05); }
`;

const CountyRecommendation = styled.div`
  font-size: 11px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
`;

// ======================== COMPONENT ========================
const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const county = localStorage.getItem('user_county') || 'Nairobi';

  // Handle both raw price (number) and normalized price ({ org, mrp })
  const getPrice = () => {
    if (typeof product.price === 'object' && product.price?.org) return product.price.org;
    if (typeof product.price === 'number') return product.price;
    return parseFloat(product.price) || 0;
  };

  const displayPrice = getPrice();
  const productName = product.name || product.title || "Product";
  const productImage = product.img || product.image || product.image_url || "https://ui-avatars.com/api/?name=Product&background=random&color=fff&size=512";
  const productCategory = product.category || "Premium Collection";
  const productStock = Number(product.stock) || 20;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("access_token");
    const productName = product.name || product.title || "Product";
    const productImage = product.img || product.image || product.image_url || "https://ui-avatars.com/api/?name=Product&background=random&color=fff&size=512";
    const displayPrice = getPrice();

    try {
      if (token) {
        await addToCartApi(token, {
          productId: product._id || product.id,
          quantity: 1,
        });
      }

      addToCart({ ...product, price: displayPrice, name: productName, image: productImage });
      toast.success(`${productName} added to bag`, {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: true,
        theme: "light",
      });
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add to cart");
    }
  };

  const handleClick = () => {
    const id = product.slug || product._id || product.id;
    if (id) navigate(`/marketplace/product/${id}`);
  };

  return (
    <Card
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <ImageContainer>
        <BadgesContainer>
          {(() => {
            const p = displayPrice;
            let tier = null;
            if (p >= 5000) tier = { label: "👑 Governor's Taste", bg: "#f59e0b" };
            else if (p >= 3500) tier = { label: "🏛️ Senator's Choice", bg: "#8b5cf6" };
            else if (p >= 2500) tier = { label: "🎖️ MP's Choice", bg: "#3b82f6" };
            else if (p >= 1500) tier = { label: "💼 MCA's Pick", bg: "#10b981" };
            else tier = { label: "✊ Supporter's Gear", bg: "#ef4444" };

            return (
              <div style={{ background: tier.bg, color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                {tier.label}
              </div>
            );
          })()}
          {product.badge && <Badge type={product.badge}>{product.badge}</Badge>}
          {product.featured === 1 && <Badge type="Featured">Featured</Badge>}
        </BadgesContainer>

        <WishlistButton onClick={(e) => e.stopPropagation()}>
          <Heart size={20} />
        </WishlistButton>

        <ProductImage src={productImage} alt={productName} loading="lazy" />
      </ImageContainer>

      <Content>
        <Category>{productCategory}</Category>
        <Name>{productName}</Name>

        <CountyRecommendation>
          <MapPin size={12} /> Trending in {county}
        </CountyRecommendation>

        <StockIndicator low={productStock < 10}>
          <AlertCircle size={14} />
          {productStock < 10 ? `Only ${productStock} left` : 'In Stock'}
        </StockIndicator>

        <PriceRow>
          <Price>KES {displayPrice.toLocaleString()}</Price>
          <QuickAdd onClick={handleAddToCart}>
            <ShoppingBag size={20} />
          </QuickAdd>
        </PriceRow>
      </Content>
    </Card>
  );
};

export default ProductCard;
