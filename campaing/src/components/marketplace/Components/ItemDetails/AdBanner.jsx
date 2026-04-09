import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Full width container with no background
const Container = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  background: transparent;
  position: relative;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 16px;
    padding: 0 16px;
  }
`;

const ScrollWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
`;

const HorizontalScroll = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 16px;
  padding: 16px 20px;
  scroll-behavior: smooth;
  width: 100%;

  /* Show scrollbar on desktop */
  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #bb0000;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #990000;
  }

  /* Hide scrollbar on mobile but keep functionality */
  @media (max-width: 768px) {
    &::-webkit-scrollbar {
      height: 3px;
    }
  }
`;

const PartyCard = styled(Link)`
  flex: 0 0 160px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px 12px;
  text-align: center;
  text-decoration: none;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #bb0000;
  }

  @media (max-width: 768px) {
    flex: 0 0 140px;
    padding: 16px 8px;
  }
`;

const PartyLogo = styled.img`
  height: 60px;
  width: auto;
  max-width: 100px;
  object-fit: contain;
`;

const PartyName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
`;

const PartySlogan = styled.div`
  font-size: 10px;
  color: #7f8c8d;
  line-height: 1.3;
`;

const ScrollButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  opacity: 0.9;

  &:hover {
    background: #bb0000;
    border-color: #bb0000;
    color: white;
    opacity: 1;
  }

  ${(props) => (props.$direction === "left" ? "left: 0;" : "right: 0;")}

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

// Political Parties Data
const PARTIES = [
  {
    id: 1,
    name: "UDA Party",
    logo: "https://uda.ke/wp-content/uploads/2023/04/cropped-uda.png",
    slogan: "Kenya Ni Kazi!",
    link: "/party/uda",
  },
  {
    id: 2,
    name: "Linda Mwananchi",
    logo: "https://lindamwananchi.com/wp-content/uploads/2026/03/LM-Main-Logo-v1-2048x1154.png",
    slogan: "Protecting Citizens",
    link: "/party/linda-mwananchi",
  },
  {
    id: 3,
    name: "Wiper Party",
    logo: "https://wiper.co.ke/static/assets/img/wiperlogo.png",
    slogan: "Wiper Patriotic Front",
    link: "/party/wiper",
  },
  {
    id: 4,
    name: "Jubilee Party",
    logo: "https://global-uploads.webflow.com/61fa0db307d4e6dbea95b2ec/61fa411f7160025aac17c63a_jp-logo.svg",
    slogan: "Building Bridges",
    link: "/party/jubilee",
  },
  {
    id: 5,
    name: "ODM Party",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/39/Orange_Democratic_Movement_logo.svg/1200px-Orange_Democratic_Movement_logo.svg.png",
    slogan: "Inawezekana!",
    link: "/party/odm",
  },
  {
    id: 6,
    name: "Kenya Kwanza",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxvXzQWhr6T1S6k3L8jQ9a_F4-KyNKHZZQBg&s",
    slogan: "Bottom-Up Economy",
    link: "/party/kenya-kwanza",
  },
  {
    id: 7,
    name: "ANC",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjZqXpV5rKqjF_QxZvXnL5xQ3wL6kYfGp1cw&s",
    slogan: "Amani Na Umoja",
    link: "/party/anc",
  },
  {
    id: 8,
    name: "Ford Kenya",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStz0Y5cLqRjWYaMkZqXpV5rKqjF_QxZvXnL5xQ3w&s",
    slogan: "Sisi Ni Wakenya",
    link: "/party/ford-kenya",
  },
  {
    id: 9,
    name: "Maendeleo Chap Chap",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwZxYpL5rKqjF_QxZvXnL5xQ3wL6kYfGp1cw&s",
    slogan: "Speed for Development",
    link: "/party/maendeleo-chap-chap",
  },
  {
    id: 10,
    name: "KANU",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_XzYpL5rKqjF_QxZvXnL5xQ3wL6kYfGp1cw&s",
    slogan: "Nyayo Philosophy",
    link: "/party/kanu",
  },
];

const AdBanner = ({ showTitle = true }) => {
  const scrollRef = useRef(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      checkScrollButtons();
      scrollElement.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);

      return () => {
        scrollElement.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        direction === "left"
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <Container>
      {showTitle && (
        <SectionTitle>
          <span>🇰🇪</span> Political Parties in Kenya <span>🇰🇪</span>
        </SectionTitle>
      )}

      <ScrollWrapper>
        {showLeftButton && (
          <ScrollButton $direction="left" onClick={() => scroll("left")}>
            <ChevronLeft size={20} />
          </ScrollButton>
        )}

        <HorizontalScroll ref={scrollRef}>
          {PARTIES.map((party) => (
            <PartyCard key={party.id} to={party.link}>
              <PartyLogo src={party.logo} alt={party.name} />
              <PartyName>{party.name}</PartyName>
              <PartySlogan>{party.slogan}</PartySlogan>
            </PartyCard>
          ))}
        </HorizontalScroll>

        {showRightButton && (
          <ScrollButton $direction="right" onClick={() => scroll("right")}>
            <ChevronRight size={20} />
          </ScrollButton>
        )}
      </ScrollWrapper>
    </Container>
  );
};

// Simplified version - always visible buttons
export const AdBannerSimple = ({ showTitle = true }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <Container>
      {showTitle && (
        <SectionTitle>
          <span>🇰🇪</span> Political Parties <span>🇰🇪</span>
        </SectionTitle>
      )}

      <ScrollWrapper>
        <ScrollButton $direction="left" onClick={() => scroll("left")}>
          <ChevronLeft size={20} />
        </ScrollButton>

        <HorizontalScroll ref={scrollRef}>
          {PARTIES.map((party) => (
            <PartyCard key={party.id} to={party.link}>
              <PartyLogo src={party.logo} alt={party.name} />
              <PartyName>{party.name}</PartyName>
              <PartySlogan>{party.slogan}</PartySlogan>
            </PartyCard>
          ))}
        </HorizontalScroll>

        <ScrollButton $direction="right" onClick={() => scroll("right")}>
          <ChevronRight size={20} />
        </ScrollButton>
      </ScrollWrapper>
    </Container>
  );
};

// Touch-friendly version for mobile
export const AdBannerTouch = ({ showTitle = true }) => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Container>
      {showTitle && (
        <SectionTitle>
          <span>🇰🇪</span> Political Parties <span>🇰🇪</span>
        </SectionTitle>
      )}

      <HorizontalScroll
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseUp}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        {PARTIES.map((party) => (
          <PartyCard key={party.id} to={party.link}>
            <PartyLogo src={party.logo} alt={party.name} />
            <PartyName>{party.name}</PartyName>
            <PartySlogan>{party.slogan}</PartySlogan>
          </PartyCard>
        ))}
      </HorizontalScroll>
    </Container>
  );
};

export default AdBanner;
