import React from "react";
import styled, { keyframes } from "styled-components";
import { Loader2, AlertCircle } from "lucide-react";

// Components

import MidSlide from "./Home/MidSlide";
import MidSection from "./Home/MidSection";
import Slide from "./Home/Slide";

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const FullPageCenter = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  gap: 15px;
`;

const Spinner = styled(Loader2)`
  animation: ${rotate} 1s linear infinite;
  color: #bb0000;
`;

const MainContainer = styled.div`
  background: #000000;
  min-height: calc(100vh - 120px);
`;

const Home = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <FullPageCenter>
        <AlertCircle size={48} color="#ff4d4d" />
        <p>No products available. Check back soon!</p>
      </FullPageCenter>
    );
  }

  // Filter products by category
  const capsProducts = products.filter((p) => p.category === "caps");
  const tshirtsProducts = products.filter((p) => p.category === "tshirts");
  const hoodiesProducts = products.filter((p) => p.category === "hoodies");
  const accessoriesProducts = products.filter((p) =>
    ["badges", "stickers", "wristbands"].includes(p.category),
  );

  console.log("Caps count:", capsProducts.length);
  console.log("T-Shirts count:", tshirtsProducts.length);
  console.log("Hoodies count:", hoodiesProducts.length);
  console.log("Accessories count:", accessoriesProducts.length);

  return (
    <>
      <MainContainer>
        <MidSlide products={products} />
        <MidSection />

        <Slide
          data={capsProducts}
          title="Campaign Caps"
          timer={false}
          multi={true}
        />
        <Slide
          data={tshirtsProducts}
          title="T-Shirts"
          timer={false}
          multi={true}
        />
        <Slide
          data={hoodiesProducts}
          title="Hoodies"
          timer={false}
          multi={true}
        />
        <Slide
          data={accessoriesProducts}
          title="Accessories"
          timer={false}
          multi={true}
        />
      </MainContainer>
    </>
  );
};

export default Home;
