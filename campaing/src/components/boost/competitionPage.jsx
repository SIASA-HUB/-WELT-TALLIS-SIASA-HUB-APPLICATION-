import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  ChevronLeft,
  TrendingUp,
  Users,
  Flame,
  Map,
  Star,
  Medal,
  Upload,
  CheckCircle,
  MapPin,
  Navigation,
  UserCheck,
  Share2,
  Copy,
  Check,
  Gift,
  Bell,
  Crown,
  X,
  Plus,
  MapIcon,
  Building2,
  Zap,
  Heart,
  BarChart3,
  Loader,
  Trophy,
  Search,
  Filter,
  RefreshCw,
  Coins,
  Eye,
  ChevronRight,
} from "lucide-react";
import theme from "../../utils/theme";
import AppLoadingBar from "../../utils/LoadingBar";

// --- ANIMATIONS ---
const floatUp = keyframes`
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  30% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
  100% { transform: translate(-50%, -150%) scale(0.8); opacity: 0; }
`;

const bounce = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
`;

const marquee = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

// --- STYLED COMPONENTS ---
const PageWrapper = styled.div`
  background: ${theme.colors.dark};
  min-height: 100vh;
  color: #fff;
  padding-bottom: 80px;
`;

const Header = styled.div`
  background: #0a0a0a;
  border-bottom: 1px solid rgba(187, 0, 0, 0.2);
  padding: 12px 16px;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const BrandsMarquee = styled.div`
  background: linear-gradient(90deg, #0a0a0a, #1a1a1a, #0a0a0a);
  padding: 12px 0;
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 80px;
    z-index: 2;
    pointer-events: none;
  }

  &::before {
    left: 0;
    background: linear-gradient(90deg, #0a0a0a, transparent);
  }

  &::after {
    right: 0;
    background: linear-gradient(-90deg, #0a0a0a, transparent);
  }
`;

const MarqueeContent = styled.div`
  display: flex;
  animation: ${marquee} ${(props) => props.$duration || 30}s linear infinite;
  width: fit-content;

  &:hover {
    animation-play-state: paused;
  }
`;

const BrandItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 40px;
  padding: 8px 20px;
  margin: 0 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(187, 0, 0, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
    border-color: ${theme.colors.primary};
    background: rgba(187, 0, 0, 0.2);
  }
`;

const BrandLogoMini = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: contain;
  background: #fff;
  padding: 2px;
`;

const BrandInfoMini = styled.div`
  display: flex;
  flex-direction: column;
`;

const BrandNameMini = styled.div`
  font-size: 13px;
  font-weight: 700;
`;

const BrandRewardMini = styled.div`
  font-size: 10px;
  color: #4ade80;
`;

// Brand Cards Grid
const BrandGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
`;

const BrandCard = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  padding: 16px;
  border: 1px solid ${(props) => props.$color || "rgba(255,255,255,0.1)"};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: ${(props) => props.$color || theme.colors.primary};
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
`;

const BrandLogo = styled.img`
  width: 60px;
  height: 60px;
  object-fit: contain;
  background: #fff;
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 12px;
`;

const BrandName = styled.div`
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const BrandCategory = styled.div`
  font-size: 10px;
  color: ${(props) => props.$color || theme.colors.primary};
  margin-bottom: 8px;
`;

const BrandOffer = styled.div`
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
`;

const BrandReward = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #4ade80;
  margin: 8px 0;
`;

const ProgressBar = styled.div`
  height: 3px;
  background: #222;
  border-radius: 2px;
  overflow: hidden;
  margin: 8px 0;

  div {
    width: ${(props) => props.$width}%;
    height: 100%;
    background: ${(props) => props.$color || theme.colors.primary};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  padding: 10px;
  text-align: center;
  border: 1px solid #222;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 4px;
`;

const SectionTitle = styled.h3`
  font-size: 12px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${theme.colors.primary};
`;

const CountyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
`;

const CountyCard = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  padding: 12px;
  border: 1px solid #222;
  transition: all 0.2s;

  &:hover {
    border-color: ${theme.colors.primary};
  }
`;

const CompetitionPage = () => {
  const navigate = useNavigate();
  const loadingBarRef = useRef(null);
  const marqueeRef = useRef(null);

  // All 47 Counties
  const allCounties = [
    "Mombasa",
    "Kwale",
    "Kilifi",
    "Tana River",
    "Lamu",
    "Taita Taveta",
    "Garissa",
    "Wajir",
    "Mandera",
    "Marsabit",
    "Isiolo",
    "Meru",
    "Tharaka Nithi",
    "Embu",
    "Kitui",
    "Machakos",
    "Makueni",
    "Nyandarua",
    "Nyeri",
    "Kirinyaga",
    "Murang'a",
    "Kiambu",
    "Turkana",
    "West Pokot",
    "Samburu",
    "Trans Nzoia",
    "Uasin Gishu",
    "Elgeyo Marakwet",
    "Nandi",
    "Baringo",
    "Laikipia",
    "Nakuru",
    "Narok",
    "Kajiado",
    "Kericho",
    "Bomet",
    "Kakamega",
    "Vihiga",
    "Bungoma",
    "Busia",
    "Siaya",
    "Kisumu",
    "Homa Bay",
    "Migori",
    "Kisii",
    "Nyamira",
    "Nairobi",
  ];

  // Brand Partners Data (with logo URLs)
  const [brandPartners] = useState([
    {
      id: 1,
      name: "Uhuru Kenyatta",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Uhuru_Kenyatta.png/200px-Uhuru_Kenyatta.png",
      category: "Former President",
      offer: "Supporting youth voter registration",
      reward: "KES 100 per verification",
      totalSponsored: 2500000,
      color: "#FF5C01",
      totalLeads: 25000,
    },
    {
      id: 2,
      name: "Safaricom",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Safaricom_Logo.svg/200px-Safaricom_Logo.svg.png",
      category: "Telecom",
      offer: "Free 1GB Data + KES 50 Airtime",
      reward: "KES 50 per verification",
      totalSponsored: 1250000,
      color: "#4ADE80",
      totalLeads: 25000,
    },
    {
      id: 3,
      name: "Raila Odinga",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/NDINDINYORO.jpg/200px-NDINDINYORO.jpg",
      category: "Former PM",
      offer: "Encouraging first-time voters",
      reward: "KES 100 per verification",
      totalSponsored: 1800000,
      color: "#FFD700",
      totalLeads: 18000,
    },
    {
      id: 4,
      name: "KCB Bank",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/KCB_Group_logo.svg/200px-KCB_Group_logo.svg.png",
      category: "Banking",
      offer: "KES 100 Cashback + 5% Interest Bonus",
      reward: "KES 75 per verification",
      totalSponsored: 875000,
      color: "#FFD700",
      totalLeads: 11666,
    },
    {
      id: 5,
      name: "Airtel Kenya",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Airtel_Logo.svg/200px-Airtel_Logo.svg.png",
      category: "Telecom",
      offer: "Unlimited SMS + 500MB Data",
      reward: "KES 40 per verification",
      totalSponsored: 432000,
      color: "#FF0000",
      totalLeads: 10800,
    },
    {
      id: 6,
      name: "Equity Bank",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/64/Equity_Bank_Logo.svg/200px-Equity_Bank_Logo.svg.png",
      category: "Banking",
      offer: "KES 500 Welcome Bonus + Free Account",
      reward: "KES 100 per verification",
      totalSponsored: 654000,
      color: "#00A3FF",
      totalLeads: 6540,
    },
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verifiedVoters, setVerifiedVoters] = useState([]);
  const [showAddCenterModal, setShowAddCenterModal] = useState(false);
  const [newCenter, setNewCenter] = useState({
    name: "",
    county: "Nairobi",
    address: "",
    lat: "",
    lng: "",
  });

  const [centers] = useState([
    {
      id: 1,
      name: "Nairobi City Hall",
      county: "Nairobi",
      lat: -1.286389,
      lng: 36.817223,
      address: "City Hall Way, Nairobi",
      clicks: 234,
    },
    {
      id: 2,
      name: "Kiambu IEBC Office",
      county: "Kiambu",
      lat: -1.171111,
      lng: 36.8325,
      address: "Kiambu Town",
      clicks: 156,
    },
    {
      id: 3,
      name: "Mombasa County Hall",
      county: "Mombasa",
      lat: -4.043477,
      lng: 39.668206,
      address: "Mombasa CBD",
      clicks: 189,
    },
  ]);

  const [mobilizers] = useState([
    {
      id: 1,
      name: "@Mugo_Dev",
      county: "Nairobi",
      verifiedVoters: 1856,
      rank: 1,
      avatar: "👑",
      totalEarned: 456000,
      gifts: 47,
    },
    {
      id: 2,
      name: "@Amina_Hub",
      county: "Mombasa",
      verifiedVoters: 1742,
      rank: 2,
      avatar: "⭐",
      totalEarned: 328000,
      gifts: 32,
    },
    {
      id: 3,
      name: "@Peter_M",
      county: "Kiambu",
      verifiedVoters: 1628,
      rank: 3,
      avatar: "💎",
      totalEarned: 274000,
      gifts: 28,
    },
  ]);

  const [userReferralCode] = useState("VOTE2024");
  const [copied, setCopied] = useState(false);
  const [totalVerified, setTotalVerified] = useState(2013000);
  const [dailyVerifications] = useState(12450);
  const [totalGifts] = useState(2300);
  const [totalGiftAmount] = useState(124000);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedMobilizer, setSelectedMobilizer] = useState(null);
  const [giftAmount, setGiftAmount] = useState(100);
  const [giftAnimation, setGiftAnimation] = useState(null);
  const [currentBrandIndex, setCurrentBrandIndex] = useState(0);

  const [generationalStats] = useState({
    genZ: {
      count: 845230,
      percentage: 42,
      color: "#FF5C01",
      icon: "⚡",
      name: "Gen Z",
    },
    millennial: {
      count: 684560,
      percentage: 34,
      color: "#4ADE80",
      icon: "💚",
      name: "Millennial",
    },
    genX: {
      count: 362450,
      percentage: 18,
      color: "#FFD700",
      icon: "🔥",
      name: "Gen X",
    },
    boomer: {
      count: 120760,
      percentage: 6,
      color: "#00D4FF",
      icon: "👴",
      name: "Boomer",
    },
  });

  const [leaderboard] = useState([
    {
      county: "Nairobi",
      verified: 185600,
      target: 250000,
      percentage: 74.24,
      rank: 1,
      growth: "+12.5%",
    },
    {
      county: "Kiambu",
      verified: 124500,
      target: 180000,
      percentage: 69.17,
      rank: 2,
      growth: "+9.8%",
    },
    {
      county: "Mombasa",
      verified: 98700,
      target: 140000,
      percentage: 70.5,
      rank: 3,
      growth: "+11.2%",
    },
  ]);

  const [countyStats, setCountyStats] = useState({});

  useEffect(() => {
    const stats = {};
    allCounties.forEach((county) => {
      const target = 50000;
      const verified = Math.floor(Math.random() * target) + 10000;
      stats[county] = {
        verified,
        target,
        percentage: (verified / target) * 100,
      };
    });
    setCountyStats(stats);
  }, []);

  // Auto-scroll brands
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBrandIndex((prev) => (prev + 1) % brandPartners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [brandPartners.length]);

  const addNotification = (text) => {
    // Notification logic
  };

  const handleUpload = (county) => {
    setSelectedCounty(county);
    setShowUploadModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        setTimeout(() => {
          setVerificationStatus("verified");
          const newVoter = {
            id: verifiedVoters.length + 1,
            name: "Verified Voter",
            county: selectedCounty,
            verifiedAt: new Date().toISOString(),
          };
          setVerifiedVoters([newVoter, ...verifiedVoters]);
          setTotalVerified((prev) => prev + 1);
          setShowUploadModal(false);
          setUploadedImage(null);
          setVerificationStatus(null);
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(userReferralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openInWaze = (center) => {
    window.open(
      `https://waze.com/ul?ll=${center.lat},${center.lng}&navigate=yes`,
      "_blank",
    );
  };

  const totalTarget = 15000000;
  const overallProgress = (totalVerified / totalTarget) * 100;

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  // Double the brands for seamless marquee
  const marqueeBrands = [...brandPartners, ...brandPartners];

  // Limit counties to first 6 for brevity, but you can show all in a scrollable grid
  const displayedCounties = allCounties.slice(0, 6);

  return (
    <PageWrapper>
      <AppLoadingBar ref={loadingBarRef} />

      {/* Gift Animation */}
      {giftAnimation && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 3000,
            pointerEvents: "none",
            animation: `${floatUp} 1.5s ease-out`,
          }}
        >
          <div
            style={{
              fontSize: "60px",
              textAlign: "center",
              animation: `${bounce} 0.3s ease`,
            }}
          >
            🎁
          </div>
          <div
            style={{
              background: "#4ADE80",
              padding: "10px 20px",
              borderRadius: "30px",
              color: "#000",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            KES {giftAnimation.amount} to {giftAnimation.name}!
          </div>
        </div>
      )}

      {/* Header */}
      <Header>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "#1A1A1A",
              border: "1px solid #333",
              borderRadius: 8,
              padding: 6,
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                background: theme.colors.primary,
                color: "#000",
                fontSize: 9,
                fontWeight: "bold",
                padding: "2px 10px",
                borderRadius: 16,
                display: "inline-block",
              }}
            >
              🇰🇪 Tuko Kadi : KENYA DECIDES
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <div
              style={{
                background: "#1A1A1A",
                borderRadius: 8,
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <TrendingUp size={10} color={theme.colors.primary} />
              <span style={{ fontSize: 10, fontWeight: 600 }}>
                {(totalVerified / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 800,
              margin: 0,
              background: "linear-gradient(135deg, #fff, #FF5C01)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            VOTE KENYA
          </h1>
          <p style={{ color: "#666", fontSize: 10, margin: "2px 0 0" }}>
            {totalVerified.toLocaleString()} verified • Target 15M
          </p>
        </div>

        <div
          style={{
            marginTop: 10,
            background: "#1A1A1A",
            borderRadius: 10,
            padding: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
              marginBottom: 4,
            }}
          >
            <span style={{ color: "#888" }}>National Progress</span>
            <span style={{ color: theme.colors.primary, fontWeight: 600 }}>
              {overallProgress.toFixed(1)}%
            </span>
          </div>
          <div
            style={{
              background: "#000",
              height: 4,
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${overallProgress}%`,
                height: "100%",
                background: "linear-gradient(90deg, #FF5C01, #FFD700)",
              }}
            />
          </div>
          <div style={{ fontSize: 9, color: "#4ADE80", marginTop: 4 }}>
            +{dailyVerifications.toLocaleString()} today
          </div>
        </div>

        <div
          style={{
            marginTop: 8,
            background: "#1A1A1A",
            borderRadius: 8,
            padding: "6px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Share2 size={10} color={theme.colors.primary} />
            <span style={{ fontSize: 10, color: "#888" }}>Share:</span>
            <span style={{ fontWeight: 600, fontSize: 11, color: "#FFD700" }}>
              {userReferralCode}
            </span>
          </div>
          <button
            onClick={copyReferralCode}
            style={{
              background: "#333",
              border: "none",
              borderRadius: 6,
              padding: "3px 8px",
              fontSize: 10,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            {copied ? <Check size={8} color="#4ADE80" /> : <Copy size={8} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </Header>

      {/* Main Content */}
      <div style={{ padding: "16px" }}>
        {/* Quick Stats */}
        <StatsGrid>
          <StatCard>
            <Users
              size={14}
              color={theme.colors.primary}
              style={{ marginBottom: 2 }}
            />
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              {(totalVerified / 1000000).toFixed(1)}M
            </div>
            <div style={{ fontSize: 8, color: "#666" }}>Verified</div>
          </StatCard>
          <StatCard>
            <Gift size={14} color="#4ADE80" style={{ marginBottom: 2 }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              {totalGifts.toLocaleString()}
            </div>
            <div style={{ fontSize: 8, color: "#666" }}>Gifts</div>
          </StatCard>
          <StatCard>
            <Coins size={14} color="#FFD700" style={{ marginBottom: 2 }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              KES {(totalGiftAmount / 1000).toFixed(0)}K
            </div>
            <div style={{ fontSize: 8, color: "#666" }}>Gifted</div>
          </StatCard>
          <StatCard>
            <Map
              size={14}
              color={theme.colors.primary}
              style={{ marginBottom: 2 }}
            />
            <div style={{ fontSize: 14, fontWeight: 700 }}>47</div>
            <div style={{ fontSize: 8, color: "#666" }}>Counties</div>
          </StatCard>
        </StatsGrid>

        {/* AUTO-SCROLLING BRANDS SECTION - Sleek & Compact */}
        <BrandsMarquee>
          <MarqueeContent $duration={20}>
            {marqueeBrands.map((brand, idx) => (
              <BrandItem
                key={`${brand.id}-${idx}`}
                onClick={() => console.log(`Selected ${brand.name}`)}
              >
                <BrandLogoMini
                  src={brand.logo}
                  alt={brand.name}
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/28?text=${brand.name.charAt(0)}`;
                  }}
                />
                <BrandInfoMini>
                  <BrandNameMini>{brand.name}</BrandNameMini>
                  <BrandRewardMini>{brand.reward}</BrandRewardMini>
                </BrandInfoMini>
              </BrandItem>
            ))}
          </MarqueeContent>
        </BrandsMarquee>

        {/* COUNTY VERIFICATION CARDS */}
        <div style={{ marginBottom: 20 }}>
          <SectionHeader>
            <SectionTitle>
              <MapPin size={12} color={theme.colors.primary} /> VERIFY YOUR
              COUNTY
            </SectionTitle>
            <span style={{ fontSize: 10, color: "#666" }}>Upload proof</span>
          </SectionHeader>
          <CountyGrid>
            {displayedCounties.map((county) => {
              const stats = countyStats[county] || {
                verified: 0,
                target: 50000,
                percentage: 0,
              };
              return (
                <CountyCard key={county}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {county}
                    </div>
                    <button
                      onClick={() => handleUpload(county)}
                      style={{
                        background: theme.colors.primary,
                        border: "none",
                        borderRadius: 20,
                        padding: "4px 12px",
                        color: "#000",
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Upload size={12} /> Verify
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 10,
                      marginBottom: 4,
                    }}
                  >
                    <span>{formatNumber(stats.verified)} verified</span>
                    <span>Target: {formatNumber(stats.target)}</span>
                  </div>
                  <ProgressBar $width={stats.percentage}>
                    <div />
                  </ProgressBar>
                </CountyCard>
              );
            })}
          </CountyGrid>
        </div>

        {/* BRAND PARTNERS GRID - NICE CARDS WITH IMAGES */}
        <div style={{ marginBottom: 20 }}>
          <SectionHeader>
            <SectionTitle>
              <Building2 size={12} color="#FFD700" /> SPONSORS & PARTNERS
            </SectionTitle>
            <button
              onClick={() => {}}
              style={{
                background: theme.colors.primary,
                border: "none",
                borderRadius: 20,
                padding: "4px 12px",
                color: "#000",
                fontSize: 10,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              View All
            </button>
          </SectionHeader>
          <BrandGrid>
            {brandPartners.map((brand) => (
              <BrandCard key={brand.id} $color={brand.color}>
                <BrandLogo
                  src={brand.logo}
                  alt={brand.name}
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/60?text=${brand.name.charAt(0)}`;
                  }}
                />
                <BrandName>{brand.name}</BrandName>
                <BrandCategory $color={brand.color}>
                  {brand.category}
                </BrandCategory>
                <BrandOffer>{brand.offer.substring(0, 35)}...</BrandOffer>
                <BrandReward>💰 {brand.reward}</BrandReward>
                <ProgressBar
                  $width={(brand.totalLeads / 50000) * 100}
                  $color={brand.color}
                >
                  <div />
                </ProgressBar>
                <div style={{ fontSize: 8, color: "#666", marginTop: 4 }}>
                  {brand.totalLeads.toLocaleString()} leads • KES{" "}
                  {brand.totalSponsored.toLocaleString()}
                </div>
              </BrandCard>
            ))}
          </BrandGrid>
        </div>

        {/* Generation Stats */}
        <div style={{ marginBottom: 20 }}>
          <SectionHeader>
            <SectionTitle>
              <Zap size={12} color="#FFD700" /> GENERATION POWER
            </SectionTitle>
            <span style={{ fontSize: 10, color: "#666" }}>Active voters</span>
          </SectionHeader>
          <div style={{ display: "flex", gap: 8 }}>
            {Object.values(generationalStats).map((gen) => (
              <div
                key={gen.name}
                style={{
                  flex: 1,
                  background: "#0A0A0A",
                  borderRadius: 10,
                  padding: 10,
                  textAlign: "center",
                  border: `1px solid ${gen.color}20`,
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>{gen.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{gen.name}</div>
                <div
                  style={{ fontSize: 12, fontWeight: 800, color: gen.color }}
                >
                  {gen.percentage}%
                </div>
                <div style={{ fontSize: 9, color: "#666" }}>
                  {formatNumber(gen.count)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard Preview */}
        <div style={{ marginBottom: 20 }}>
          <SectionHeader>
            <SectionTitle>
              <Trophy size={12} color="#FFD700" /> TOP COUNTIES
            </SectionTitle>
            <span style={{ fontSize: 10, color: theme.colors.primary }}>
              View all →
            </span>
          </SectionHeader>
          {leaderboard.map((county) => (
            <div
              key={county.county}
              style={{
                background: "#0A0A0A",
                border: "1px solid #222",
                borderRadius: 10,
                padding: 10,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
                    {county.rank}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>
                    {county.county}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: "#4ADE80" }}>
                  {county.growth}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 10,
                  marginBottom: 4,
                }}
              >
                <span>{formatNumber(county.verified)} verified</span>
                <span>Target: {formatNumber(county.target)}</span>
              </div>
              <div
                style={{
                  background: "#222",
                  height: 3,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${county.percentage}%`,
                    height: "100%",
                    background: theme.colors.primary,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Registration Centers */}
        <div style={{ marginBottom: 20 }}>
          <SectionHeader>
            <SectionTitle>
              <MapPin size={12} color={theme.colors.primary} /> REGISTRATION
              CENTERS
            </SectionTitle>
            <button
              onClick={() => setShowAddCenterModal(true)}
              style={{
                background: theme.colors.primary,
                border: "none",
                borderRadius: 20,
                padding: "4px 12px",
                color: "#000",
                fontSize: 10,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Plus size={12} /> Add
            </button>
          </SectionHeader>
          {centers.map((center) => (
            <div
              key={center.id}
              style={{
                background: "#0A0A0A",
                border: "1px solid #222",
                borderRadius: 10,
                padding: 10,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  {center.name}
                </div>
                <button
                  onClick={() => openInWaze(center)}
                  style={{
                    background: "#333",
                    border: "none",
                    borderRadius: 20,
                    padding: "4px 12px",
                    fontSize: 10,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Navigation size={12} /> Navigate
                </button>
              </div>
              <div style={{ fontSize: 10, color: "#888", marginBottom: 4 }}>
                {center.address}
              </div>
              <div style={{ fontSize: 9, color: "#666" }}>
                {center.clicks} clicks this week
              </div>
            </div>
          ))}
        </div>

        {/* Top Mobilizers */}
        <div>
          <SectionHeader>
            <SectionTitle>
              <Crown size={12} color="#FFD700" /> TOP MOBILIZERS
            </SectionTitle>
            <button
              onClick={() => setShowGiftModal(true)}
              style={{
                background: "#FFD70020",
                border: "1px solid #FFD700",
                borderRadius: 20,
                padding: "4px 12px",
                fontSize: 10,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                color: "#FFD700",
              }}
            >
              <Gift size={10} /> Gift
            </button>
          </SectionHeader>
          {mobilizers.map((mob) => (
            <div
              key={mob.id}
              style={{
                background: "#0A0A0A",
                border: "1px solid #222",
                borderRadius: 10,
                padding: 10,
                marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    background: "#222",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {mob.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 13 }}>
                      {mob.name}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        color: "#FFD700",
                        background: "#FFD70020",
                        padding: "2px 6px",
                        borderRadius: 10,
                      }}
                    >
                      #{mob.rank}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 12, fontSize: 10 }}>
                    <span>{mob.verifiedVoters} voters</span>
                    <span style={{ color: "#4ADE80" }}>
                      KES {formatNumber(mob.totalEarned)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedMobilizer(mob);
                    setShowGiftModal(true);
                  }}
                  style={{
                    background: "#4ADE8020",
                    border: "none",
                    borderRadius: 30,
                    padding: "6px 12px",
                    fontSize: 11,
                    cursor: "pointer",
                    color: "#4ADE80",
                  }}
                >
                  Tip
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.9)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#1A1A1A",
              borderRadius: 20,
              maxWidth: 400,
              width: "100%",
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18 }}>
                Verify in {selectedCounty}
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadedImage(null);
                  setVerificationStatus(null);
                }}
                style={{
                  background: "#333",
                  border: "none",
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>
            {!uploadedImage ? (
              <div
                style={{
                  border: "2px dashed #444",
                  borderRadius: 12,
                  padding: 40,
                  textAlign: "center",
                  cursor: "pointer",
                  marginBottom: 20,
                }}
                onClick={() => document.getElementById("fileInput").click()}
              >
                <Upload size={32} color="#666" />
                <p style={{ color: "#888", marginTop: 8 }}>
                  Click to upload voter registration proof
                </p>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <img
                  src={uploadedImage}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: 200,
                    objectFit: "contain",
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                />
                {verificationStatus === "verified" ? (
                  <div
                    style={{
                      color: "#4ADE80",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <CheckCircle size={20} /> Verified!
                  </div>
                ) : (
                  <div style={{ color: "#FFD700" }}>Processing...</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gift Modal */}
      {showGiftModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.9)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#1A1A1A",
              borderRadius: 20,
              maxWidth: 400,
              width: "100%",
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18 }}>Send Gift</h3>
              <button
                onClick={() => setShowGiftModal(false)}
                style={{
                  background: "#333",
                  border: "none",
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  color: "#888",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Amount (KES)
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {[50, 100, 200, 500].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setGiftAmount(amt)}
                    style={{
                      flex: 1,
                      background:
                        giftAmount === amt ? theme.colors.primary : "#333",
                      border: "none",
                      borderRadius: 8,
                      padding: "8px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      color: giftAmount === amt ? "#000" : "#fff",
                    }}
                  >
                    KES {amt}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                setGiftAnimation({
                  amount: giftAmount,
                  name: selectedMobilizer?.name,
                });
                setTimeout(() => setGiftAnimation(null), 1500);
                setShowGiftModal(false);
              }}
              style={{
                width: "100%",
                background: theme.colors.primary,
                border: "none",
                borderRadius: 12,
                padding: 12,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                marginTop: 16,
              }}
            >
              Send Gift
            </button>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default CompetitionPage;
