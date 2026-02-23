import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  ShoppingBag,
  ArrowLeft,
  Search,
  X,
  MessageCircle,
  Share2,
  Phone,
  User,
  MapPin,
  Package,
  ChevronRight,
} from "lucide-react";

// Simple Kenyan Colors
const KENYA_COLORS = {
  primary: "#BB0000", // Kenyan Red
  accent: "#006600", // Kenyan Green
  dark: "#0A0A0A",
  cardBg: "#141414",
  inputBg: "#1E1E1E",
  neutral: "#94A3B8",
  whatsapp: "#25D366",
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

// Constants
const Constants = {
  WHATSAPP_NUMBER: "0740045355",
  PHONE_NUMBER: "0740045355",
};

// Data - exactly as in your original
const MERCH_DATA = [
  {
    id: 1,
    name: "Safety Vest",
    category: "Reflector",
    price: 850,
    image:
      "https://images.unsplash.com/photo-1559030623-0226b1241edd?q=80&w=300&auto=format&fit=crop",
    description:
      "High-visibility safety vest with reflective strips. Perfect for campaign events.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Orange", "Yellow"],
  },
  {
    id: 2,
    name: "Campaign Polo",
    category: "T-Shirt",
    price: 1800,
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=300&auto=format&fit=crop",
    description: "Premium quality polo shirt with embroidered logo.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Red", "Black", "White"],
  },
  {
    id: 3,
    name: "Signature Cap",
    category: "Cap",
    price: 1200,
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=300&auto=format&fit=crop",
    description: "Adjustable baseball cap with campaign slogan.",
    sizes: ["One Size"],
    colors: ["Red", "Blue", "Black"],
  },
  {
    id: 4,
    name: "Heavy Tee",
    category: "T-Shirt",
    price: 1500,
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=300&auto=format&fit=crop",
    description: "Heavy cotton t-shirt with screen printed design.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Red", "Black", "White"],
  },
  {
    id: 5,
    name: "Worker Vest",
    category: "Reflector",
    price: 900,
    image:
      "https://images.unsplash.com/photo-1516211621161-83c9d71752c0?q=80&w=300&auto=format&fit=crop",
    description: "Lightweight worker vest with multiple pockets.",
    sizes: ["M", "L", "XL"],
    colors: ["Yellow"],
  },
  {
    id: 6,
    name: "Campaign Flag",
    category: "Flag",
    price: 2500,
    image:
      "https://images.unsplash.com/photo-1589994965851-a8f479c573a4?q=80&w=300&auto=format&fit=crop",
    description: "Large campaign flag with pole sleeve.",
    sizes: ["3x5 ft"],
    colors: ["Red", "Green"],
  },
  {
    id: 7,
    name: "Banner",
    category: "Banner",
    price: 3500,
    image:
      "https://images.unsplash.com/photo-1566576912323-6b65bfb1b5c6?q=80&w=300&auto=format&fit=crop",
    description: "Vinyl banner with grommets.",
    sizes: ["2x4 ft"],
    colors: ["Custom"],
  },
  {
    id: 8,
    name: "Button Pins",
    category: "Accessory",
    price: 200,
    image:
      "https://images.unsplash.com/photo-1611928482473-7b27d24eab80?q=80&w=300&auto=format&fit=crop",
    description: "Campaign button pins. Pack of 10.",
    sizes: ["1.25 inch"],
    colors: ["Mixed"],
  },
];

const CATEGORIES = [
  "All",
  "T-Shirt",
  "Cap",
  "Reflector",
  "Flag",
  "Banner",
  "Accessory",
];

// Styled Components - Clean and simple
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${KENYA_COLORS.dark};
  color: #fff;
  padding: 0 16px 100px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 0 16px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  flex: 1;
  color: #fff;
`;

const CartIcon = styled.div`
  position: relative;
`;

const CartBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: ${KENYA_COLORS.primary};
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: ${KENYA_COLORS.cardBg};
  border-radius: 12px;
  padding: 12px 16px;
  margin: 8px 0 20px;
`;

const SearchInput = styled.input`
  flex: 1;
  background: none;
  border: none;
  color: #fff;
  font-size: 14px;
  margin-left: 12px;
  outline: none;

  &::placeholder {
    color: ${KENYA_COLORS.neutral};
  }
`;

const CategoriesScroll = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0 0 20px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CategoryChip = styled.button`
  background: ${(props) =>
    props.active ? KENYA_COLORS.primary : KENYA_COLORS.cardBg};
  border: none;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  cursor: pointer;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  animation: ${fadeIn} 0.3s ease;
`;

const ProductCard = styled.div`
  background: ${KENYA_COLORS.cardBg};
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
`;

const ProductImageWrapper = styled.div`
  position: relative;
  height: 160px;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CategoryBadge = styled.span`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: ${KENYA_COLORS.primary};
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 12px;
  text-transform: uppercase;
`;

const ProductInfo = styled.div`
  padding: 12px;
`;

const ProductName = styled.h3`
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 6px;
  color: #fff;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Price = styled.span`
  color: ${KENYA_COLORS.primary};
  font-weight: 700;
  font-size: 14px;
`;

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: flex-end;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background: ${KENYA_COLORS.dark};
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 24px 24px 0 0;
  animation: ${slideUp} 0.3s ease;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 4px;
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const ModalImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 16px;
  margin-bottom: 16px;
`;

const ModalDescription = styled.p`
  color: ${KENYA_COLORS.neutral};
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h4`
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 10px;
  color: #fff;
`;

const OptionsRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const OptionButton = styled.button`
  background: ${(props) =>
    props.selected ? KENYA_COLORS.primary : KENYA_COLORS.inputBg};
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  background: ${KENYA_COLORS.inputBg};
  padding: 8px 12px;
  border-radius: 30px;
  width: fit-content;
`;

const QuantityButton = styled.button`
  background: ${KENYA_COLORS.cardBg};
  color: #fff;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const QuantityValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
`;

const TotalPrice = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${KENYA_COLORS.primary};
  margin: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const Input = styled.input`
  width: 100%;
  background: ${KENYA_COLORS.inputBg};
  border: none;
  border-radius: 12px;
  padding: 14px;
  color: #fff;
  font-size: 14px;
  margin-bottom: 12px;

  &:focus {
    outline: none;
  }
`;

const ActionButton = styled.button`
  width: 100%;
  background: ${(props) =>
    props.primary ? KENYA_COLORS.whatsapp : KENYA_COLORS.cardBg};
  color: #fff;
  border: none;
  padding: 16px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  margin-top: ${(props) => (props.primary ? "16px" : "8px")};
`;

const MarketplacePage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    location: "",
  });

  const filteredProducts = MERCH_DATA.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setSelectedSize(product.sizes[0] || "");
    setSelectedColor(product.colors[0] || "");
    setCustomer({ name: "", phone: "", location: "" });
  };

  const sendOrder = () => {
    if (!customer.name || !customer.phone) {
      alert("Please fill in your name and phone number");
      return;
    }

    const message = `*NEW ORDER - SIASA MERCH*

Product: ${selectedProduct.name}
Price: KSH ${selectedProduct.price}
Size: ${selectedSize}
Color: ${selectedColor}
Qty: ${quantity}
Total: KSH ${selectedProduct.price * quantity}

Customer: ${customer.name}
Phone: ${customer.phone}
Location: ${customer.location || "Not specified"}

Thank you! 🇰🇪`;

    window.open(
      `https://wa.me/${Constants.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    setSelectedProduct(null);
  };

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </BackButton>
        <PageTitle>Merch Store</PageTitle>
        <CartIcon>
          <ShoppingBag size={20} />
          <CartBadge>2</CartBadge>
        </CartIcon>
      </Header>

      <SearchBar>
        <Search size={16} color={KENYA_COLORS.neutral} />
        <SearchInput
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <X
            size={14}
            color={KENYA_COLORS.neutral}
            onClick={() => setSearchTerm("")}
            style={{ cursor: "pointer" }}
          />
        )}
      </SearchBar>

      <CategoriesScroll>
        {CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat}
            active={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </CategoryChip>
        ))}
      </CategoriesScroll>

      <ProductsGrid>
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            onClick={() => handleProductClick(product)}
          >
            <ProductImageWrapper>
              <ProductImage src={product.image} alt={product.name} />
              <CategoryBadge>{product.category}</CategoryBadge>
            </ProductImageWrapper>
            <ProductInfo>
              <ProductName>{product.name}</ProductName>
              <PriceRow>
                <Price>KSH {product.price}</Price>
                <ShoppingBag size={12} color={KENYA_COLORS.neutral} />
              </PriceRow>
            </ProductInfo>
          </ProductCard>
        ))}
      </ProductsGrid>

      {/* Product Modal */}
      {selectedProduct && (
        <ModalOverlay onClick={() => setSelectedProduct(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{selectedProduct.name}</ModalTitle>
              <CloseButton onClick={() => setSelectedProduct(null)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <ModalImage
                src={selectedProduct.image}
                alt={selectedProduct.name}
              />
              <ModalDescription>{selectedProduct.description}</ModalDescription>

              <SectionTitle>Size</SectionTitle>
              <OptionsRow>
                {selectedProduct.sizes.map((size) => (
                  <OptionButton
                    key={size}
                    selected={selectedSize === size}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </OptionButton>
                ))}
              </OptionsRow>

              <SectionTitle>Color</SectionTitle>
              <OptionsRow>
                {selectedProduct.colors.map((color) => (
                  <OptionButton
                    key={color}
                    selected={selectedColor === color}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </OptionButton>
                ))}
              </OptionsRow>

              <SectionTitle>Quantity</SectionTitle>
              <QuantitySelector>
                <QuantityButton
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </QuantityButton>
                <QuantityValue>{quantity}</QuantityValue>
                <QuantityButton onClick={() => setQuantity(quantity + 1)}>
                  +
                </QuantityButton>
              </QuantitySelector>

              <TotalPrice>
                <span>Total</span>
                <span>KSH {selectedProduct.price * quantity}</span>
              </TotalPrice>

              <SectionTitle>Your Details</SectionTitle>
              <Input
                placeholder="Your Name"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
              />
              <Input
                placeholder="Phone Number"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
              />
              <Input
                placeholder="Delivery Location"
                value={customer.location}
                onChange={(e) =>
                  setCustomer({ ...customer, location: e.target.value })
                }
              />

              <ActionButton primary onClick={sendOrder}>
                <MessageCircle size={18} />
                Order via WhatsApp
              </ActionButton>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default MarketplacePage;
