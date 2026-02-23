import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ShoppingBag, Zap, ChevronRight, ArrowLeft } from "lucide-react";

const MERCH_DATA = [
  {
    id: 1,
    name: "Safety Vest",
    category: "Reflector",
    price: 850,
    image:
      "https://images.unsplash.com/photo-1559030623-0226b1241edd?q=80&w=300&auto=format&fit=crop",
    description:
      "High-visibility safety vest perfect for campaign events and night rallies. Durable material with reflective strips.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Orange", "Yellow", "Green"],
  },
  {
    id: 2,
    name: "Campaign Polo",
    category: "T-Shirt",
    price: 1800,
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=300&auto=format&fit=crop",
    description:
      "Premium quality polo shirt with embroidered logo. Perfect for campaign staff and volunteers.",
    sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
    colors: ["Red", "Blue", "Green", "Black", "White"],
  },
  {
    id: 3,
    name: "Signature Cap",
    category: "Cap",
    price: 1200,
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=300&auto=format&fit=crop",
    description:
      "Adjustable baseball cap with campaign slogan. One size fits most with velcro closure.",
    sizes: ["One Size"],
    colors: ["Red", "Blue", "Black", "White"],
  },
  {
    id: 4,
    name: "Heavy Tee",
    category: "T-Shirt",
    price: 1500,
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=300&auto=format&fit=crop",
    description:
      "Heavy cotton t-shirt with screen printed design. Comfortable and durable for daily wear.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Red", "Blue", "Black", "White", "Gray"],
  },
  {
    id: 5,
    name: "Worker Vest",
    category: "Reflector",
    price: 900,
    image:
      "https://images.unsplash.com/photo-1516211621161-83c9d71752c0?q=80&w=300&auto=format&fit=crop",
    description:
      "Lightweight worker vest with multiple pockets. Ideal for event organizers and security.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Orange", "Yellow"],
  },
  {
    id: 6,
    name: "Campaign Flag",
    category: "Flag",
    price: 2500,
    image:
      "https://images.unsplash.com/photo-1589994965851-a8f479c573a4?q=80&w=300&auto=format&fit=crop",
    description:
      "Large campaign flag with pole sleeve. Perfect for rallies and events.",
    sizes: ["3x5 ft", "4x6 ft", "5x8 ft"],
    colors: ["Red", "Blue", "Green"],
  },
  {
    id: 7,
    name: "Banner",
    category: "Banner",
    price: 3500,
    image:
      "https://images.unsplash.com/photo-1566576912323-6b65bfb1b5c6?q=80&w=300&auto=format&fit=crop",
    description:
      "Vinyl banner with grommets. Weather resistant for outdoor use.",
    sizes: ["2x4 ft", "3x6 ft", "4x8 ft"],
    colors: ["Custom"],
  },
  {
    id: 8,
    name: "Button Pins",
    category: "Accessory",
    price: 200,
    image:
      "https://images.unsplash.com/photo-1611928482473-7b27d24eab80?q=80&w=300&auto=format&fit=crop",
    description: "Campaign button pins. Pack of 10 with various slogans.",
    sizes: ["1.25 inch", "2.25 inch"],
    colors: ["Mixed"],
  },
  {
    id: 9,
    name: "Wristbands",
    category: "Accessory",
    price: 150,
    image:
      "https://images.unsplash.com/photo-1574126153372-5a7b18a0b436?q=80&w=300&auto=format&fit=crop",
    description: "Silicone wristbands with campaign message. Pack of 5.",
    sizes: ["Adult", "Youth"],
    colors: ["Red", "Blue", "Green", "Yellow"],
  },
  {
    id: 10,
    name: "Stickers",
    category: "Accessory",
    price: 300,
    image:
      "https://images.unsplash.com/photo-1572375212503-5eb6e7c3adf6?q=80&w=300&auto=format&fit=crop",
    description:
      "Vinyl stickers for cars, laptops, and signs. Weatherproof. Pack of 10.",
    sizes: ["3 inch", "5 inch", "7 inch"],
    colors: ["Various"],
  },
];

const MainWrapper = styled.div`
  width: 100%;
  margin-bottom: 25px;
  background: transparent;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 8px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const Title = styled.h2`
  color: #fff;
  margin: 0;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ScrollContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 10px;
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const MerchCard = styled.div`
  flex: 0 0 105px;
  background: transparent;
  cursor: pointer;
`;

const ImageWrapper = styled.div`
  width: 100%;
  height: 105px;
  position: relative;
  background: #111;
`;

const ProductImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CategoryLabel = styled.span`
  position: absolute;
  bottom: 0;
  right: 0;
  background: #ff5c01;
  color: #fff;
  font-size: 7px;
  font-weight: 900;
  padding: 2px 5px;
  text-transform: uppercase;
`;

const InfoArea = styled.div`
  padding: 8px 0;
`;

const ProductName = styled.div`
  color: #eee;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2px;
`;

const Price = styled.span`
  color: #ff5c01;
  font-weight: 700;
  font-size: 10px;
`;

const ViewAllButton = styled.div`
  color: #666;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 2px;

  &:hover {
    color: #ff5c01;
  }
`;

const CampaignMarketplace = ({ onViewAll }) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      navigate("/marketplace");
    }
  };

  const handleProductClick = (product) => {
    // Navigate to product detail or open modal
    navigate(`/marketplace/product/${product.id}`, { state: { product } });
  };

  return (
    <MainWrapper>
      <Header>
        <Title>
          <Zap size={12} fill="#ff5c01" color="#ff5c01" />
          Merch Store
        </Title>
        <ViewAllButton onClick={handleViewAll}>
          VIEW ALL <ChevronRight size={10} />
        </ViewAllButton>
      </Header>

      <ScrollContainer>
        {MERCH_DATA.slice(0, 8).map((item) => (
          <MerchCard key={item.id} onClick={() => handleProductClick(item)}>
            <ImageWrapper>
              <ProductImg src={item.image} alt={item.name} />
              <CategoryLabel>{item.category}</CategoryLabel>
            </ImageWrapper>
            <InfoArea>
              <ProductName>{item.name}</ProductName>
              <PriceRow>
                <Price>KSH {item.price}</Price>
                <ShoppingBag size={10} color="#666" />
              </PriceRow>
            </InfoArea>
          </MerchCard>
        ))}
      </ScrollContainer>
    </MainWrapper>
  );
};

export default CampaignMarketplace;
