import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  ArrowLeft,
  ShoppingBag,
  MessageCircle,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Container = styled.div`
  min-height: 100vh;
  background: #000;
  color: #fff;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  background: #111;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  margin-right: 15px;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  flex: 1;
`;

const ImageGallery = styled.div`
  position: relative;
`;

const MainImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
`;

const GalleryNav = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: rgba(255, 92, 1, 0.5);
  }

  ${(props) => (props.left ? "left: 10px;" : "right: 10px;")}
`;

const Content = styled.div`
  padding: 20px;
`;

const ProductName = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 5px;
`;

const ProductCategory = styled.span`
  color: #999;
  font-size: 14px;
  display: block;
  margin-bottom: 15px;
`;

const Price = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: #ff5c01;
  margin-bottom: 20px;
`;

const Description = styled.p`
  color: #ccc;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 25px;
`;

const Section = styled.div`
  margin-bottom: 25px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 10px;
  color: #fff;
`;

const OptionsRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const OptionButton = styled.button`
  background: ${(props) => (props.selected ? "#ff5c01" : "#222")};
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: ${(props) => (props.selected ? "#ff5c01" : "#333")};
  }
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
`;

const QuantityButton = styled.button`
  background: #222;
  color: #fff;
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 12px;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #333;
  }
`;

const QuantityValue = styled.span`
  font-size: 20px;
  font-weight: 600;
  min-width: 40px;
  text-align: center;
`;

const TotalPrice = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #ff5c01;
  margin-bottom: 20px;
  padding: 15px;
  background: #111;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
`;

const WhatsAppButton = styled.button`
  width: 100%;
  background: #25d366;
  color: #fff;
  border: none;
  padding: 18px;
  border-radius: 35px;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;

  &:hover {
    background: #20b358;
  }
`;

const PhoneButton = styled.a`
  width: 100%;
  background: #333;
  color: #fff;
  border: none;
  padding: 15px;
  border-radius: 35px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: #444;
  }
`;

const ProductDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || "");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </BackButton>
          <Title>Product Not Found</Title>
        </Header>
      </Container>
    );
  }

  const images = [product.image]; // Add more images if available

  const handleWhatsAppOrder = () => {
    const phoneNumber = "0740045355";
    const message = `Hello! I'd like to order:
*${product.name}*
Price: KSH ${product.price}
Quantity: ${quantity}
Size: ${selectedSize}
Color: ${selectedColor}
Total: KSH ${product.price * quantity}

My details:
Name: [Your Name]
Location: [Your Location]
Phone: [Your Phone]`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handlePhoneOrder = () => {
    window.location.href = "tel:0740045355";
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </BackButton>
        <Title>Product Details</Title>
      </Header>

      <ImageGallery>
        <MainImage src={images[currentImageIndex]} alt={product.name} />
        {images.length > 1 && (
          <>
            <GalleryNav
              left
              onClick={() =>
                setCurrentImageIndex((prev) => Math.max(0, prev - 1))
              }
            >
              <ChevronLeft size={24} />
            </GalleryNav>
            <GalleryNav
              onClick={() =>
                setCurrentImageIndex((prev) =>
                  Math.min(images.length - 1, prev + 1),
                )
              }
            >
              <ChevronRight size={24} />
            </GalleryNav>
          </>
        )}
      </ImageGallery>

      <Content>
        <ProductName>{product.name}</ProductName>
        <ProductCategory>{product.category}</ProductCategory>
        <Price>KSH {product.price}</Price>
        <Description>{product.description}</Description>

        <Section>
          <SectionTitle>Size</SectionTitle>
          <OptionsRow>
            {product.sizes.map((size) => (
              <OptionButton
                key={size}
                selected={selectedSize === size}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </OptionButton>
            ))}
          </OptionsRow>
        </Section>

        <Section>
          <SectionTitle>Color</SectionTitle>
          <OptionsRow>
            {product.colors.map((color) => (
              <OptionButton
                key={color}
                selected={selectedColor === color}
                onClick={() => setSelectedColor(color)}
              >
                {color}
              </OptionButton>
            ))}
          </OptionsRow>
        </Section>

        <Section>
          <SectionTitle>Quantity</SectionTitle>
          <QuantitySelector>
            <QuantityButton
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </QuantityButton>
            <QuantityValue>{quantity}</QuantityValue>
            <QuantityButton onClick={() => setQuantity(quantity + 1)}>
              +
            </QuantityButton>
          </QuantitySelector>
        </Section>

        <TotalPrice>
          <span>Total:</span>
          <span>KSH {product.price * quantity}</span>
        </TotalPrice>

        <ActionButtons>
          <WhatsAppButton onClick={handleWhatsAppOrder}>
            <MessageCircle size={24} />
            Order via WhatsApp
          </WhatsAppButton>

          <PhoneButton as="a" href={`tel:0740045355`}>
            <Phone size={20} />
            Call to Order: 0740045355
          </PhoneButton>
        </ActionButtons>
      </Content>
    </Container>
  );
};

export default ProductDetailPage;
