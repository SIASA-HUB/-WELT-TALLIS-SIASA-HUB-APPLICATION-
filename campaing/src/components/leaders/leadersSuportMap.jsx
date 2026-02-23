// LeaderSupportMap.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Map,
  Target,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  CheckCircle,
  Award,
  BarChart2,
  Octagon,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from "recharts";

// Kenyan Counties Data
const KENYAN_COUNTIES = [
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
  "Tharaka-Nithi",
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
  "Elgeyo-Marakwet",
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

const PARTY_STRONGHOLDS = {
  UDA: ["Nakuru", "Kiambu", "Baringo", "Nyeri", "Murang'a", "Kirinyaga"],
  ODM: ["Kisumu", "Siaya", "Homa Bay", "Migori", "Mombasa", "Nairobi"],
  WIPER: ["Kitui", "Makueni", "Machakos"],
  "FORD-KENYA": ["Bungoma", "Trans Nzoia", "Busia"],
  JUBILEE: ["Nairobi", "Kiambu", "Nakuru"],
  INDEPENDENT: ["Turkana", "Marsabit", "Isiolo"],
};

const KENYA_THEME = {
  primary: "#BB0000",
  secondary: "#000000",
  accent: "#006600",
  highlight: "#FFFFFF",
  support: "#00A86B",
  opposition: "#FF6B6B",
  neutral: "#6B7280",
  trending: "#F59E0B",
  background: "#F8FAFC",
  border: "#E2E8F0",
  text: {
    primary: "#0F172A",
    secondary: "#64748B",
    light: "#94A3B8",
  },
  partyColors: {
    UDA: "#BB0000",
    ODM: "#006600",
    WIPER: "#8B5CF6",
    "FORD-KENYA": "#10B981",
    JUBILEE: "#FFD700",
    "NARC-KENYA": "#EC4899",
    INDEPENDENT: "#6B7280",
  },
};

// Styled Components
const SupportMapContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  @media (max-width: 600px) {
    padding: 15px;
    border-radius: 0;
  }
`;

const MapGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
  margin-bottom: 25px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 25px;
`;

const CountyCard = styled.div`
  background: ${(props) => {
    if (props.$support >= 80) return "#f0fdf4";
    if (props.$support >= 60) return "#fffbeb";
    if (props.$support >= 40) return "#fef2f2";
    return "#f8fafc";
  }};
  border: 2px solid
    ${(props) => {
      if (props.$active) return KENYA_THEME.primary;
      if (props.$support >= 80) return "#86efac";
      if (props.$support >= 60) return "#fcd34d";
      if (props.$support >= 40) return "#fca5a5";
      return "#d1d5db";
    }};
  border-radius: 12px;
  padding: 15px;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: ${(props) =>
    props.$active ? `0 0 0 3px ${KENYA_THEME.primary}20` : "none"};

  &:hover {
    transform: translateY(-2px);
  }
`;

const SupportLevel = styled.div`
  font-size: 22px;
  font-weight: 800;
  color: ${(props) => {
    if (props.$support >= 80) return "#065f46";
    if (props.$support >= 60) return "#92400e";
    if (props.$support >= 40) return "#991b1b";
    return "#4b5563";
  }};
`;

const FilterButton = styled.button`
  padding: 8px 14px;
  border: none;
  background: ${(props) =>
    props.$active ? KENYA_THEME.primary : KENYA_THEME.background};
  color: ${(props) => (props.$active ? "white" : KENYA_THEME.text.primary)};
  border-radius: 12px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LeaderSupportMap = ({ leaderData }) => {
  const [supportData, setSupportData] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateSupportData = () => {
      setLoading(true);
      const party = leaderData?.party || "INDEPENDENT";
      const strongholds = PARTY_STRONGHOLDS[party] || [];

      const generatedData = KENYAN_COUNTIES.map((county) => {
        let baseSupport = 50;
        if (strongholds.includes(county)) {
          baseSupport += Math.floor(Math.random() * 30) + 15;
        } else {
          baseSupport += Math.floor(Math.random() * 50) - 25;
        }

        const support = Math.max(0, Math.min(100, baseSupport));
        const trend = Math.random() > 0.5 ? "up" : "down";

        return {
          id: county.toLowerCase().replace(/\s+/g, "-"),
          name: county,
          support: support,
          population: Math.floor(Math.random() * 3000000) + 500000,
          trend: trend,
          trendValue: Math.floor(Math.random() * 15) + 5,
          isStronghold: strongholds.includes(county),
          performance: {
            manifestoSupport:
              Math.floor(support * 0.8) + Math.floor(Math.random() * 20),
            youthSupport:
              Math.floor(support * 0.9) + Math.floor(Math.random() * 10),
            womenSupport:
              Math.floor(support * 0.85) + Math.floor(Math.random() * 15),
            turnout: Math.floor(Math.random() * 40) + 50,
          },
          color: getColorForSupport(support),
        };
      }).sort((a, b) => b.support - a.support);

      setSupportData(generatedData);
      setLoading(false);
    };

    generateSupportData();
  }, [leaderData]);

  const getColorForSupport = (support) => {
    if (support >= 80) return "#10b981";
    if (support >= 60) return "#3b82f6";
    if (support >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const getFilteredData = () => {
    switch (filter) {
      case "high":
        return supportData.filter((item) => item.support >= 60);
      case "low":
        return supportData.filter((item) => item.support < 40);
      case "trending":
        return supportData
          .filter((item) => item.trend === "up")
          .sort((a, b) => b.trendValue - a.trendValue);
      default:
        return supportData;
    }
  };

  const regionStats = selectedRegion
    ? supportData.find((item) => item.id === selectedRegion)
    : null;

  if (loading)
    return (
      <SupportMapContainer>
        <p>Loading support map...</p>
      </SupportMapContainer>
    );

  return (
    <SupportMapContainer>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <Map size={24} color={KENYA_THEME.primary} />
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "18px",
              color: KENYA_THEME.text.primary,
            }}
          >
            Geographic Support Analytics
          </h3>
          <p
            style={{
              margin: 0,
              color: KENYA_THEME.text.secondary,
              fontSize: "13px",
            }}
          >
            Real-time popularity by county
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          overflowX: "auto",
          paddingBottom: "5px",
        }}
      >
        <FilterButton
          $active={filter === "all"}
          onClick={() => setFilter("all")}
        >
          <Map size={14} /> All
        </FilterButton>
        <FilterButton
          $active={filter === "high"}
          onClick={() => setFilter("high")}
        >
          <Target size={14} /> Strong
        </FilterButton>
        <FilterButton
          $active={filter === "low"}
          onClick={() => setFilter("low")}
        >
          <AlertTriangle size={14} /> Weak
        </FilterButton>
        <FilterButton
          $active={filter === "trending"}
          onClick={() => setFilter("trending")}
        >
          <TrendingUp size={14} /> Rising
        </FilterButton>
      </div>

      <StatsGrid>
        <div
          style={{
            padding: "12px",
            background: "#f0fdf4",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontSize: "20px", fontWeight: "800", color: "#10b981" }}
          >
            {Math.round(
              supportData.reduce((sum, r) => sum + r.support, 0) /
                supportData.length,
            )}
            %
          </div>
          <div
            style={{ fontSize: "11px", color: "#047857", fontWeight: "700" }}
          >
            National Avg
          </div>
        </div>
        <div
          style={{
            padding: "12px",
            background: "#e0f2fe",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontSize: "20px", fontWeight: "800", color: "#3b82f6" }}
          >
            {supportData.filter((r) => r.support >= 60).length}
          </div>
          <div
            style={{ fontSize: "11px", color: "#1d4ed8", fontWeight: "700" }}
          >
            Strong Counties
          </div>
        </div>
        <div
          style={{
            padding: "12px",
            background: "#fef2f2",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontSize: "20px", fontWeight: "800", color: "#dc2626" }}
          >
            {supportData.filter((r) => r.support < 40).length}
          </div>
          <div
            style={{ fontSize: "11px", color: "#991b1b", fontWeight: "700" }}
          >
            Critical Areas
          </div>
        </div>
      </StatsGrid>

      <MapGrid>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "12px",
            maxHeight: "450px",
            overflowY: "auto",
            paddingRight: "5px",
          }}
        >
          {getFilteredData().map((county) => (
            <CountyCard
              key={county.id}
              $support={county.support}
              $active={selectedRegion === county.id}
              onClick={() => setSelectedRegion(county.id)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  fontWeight: "700",
                  marginBottom: "8px",
                }}
              >
                {county.name}
                {county.isStronghold && <Award size={14} color="#d97706" />}
              </div>
              <SupportLevel $support={county.support}>
                {county.support}%
              </SupportLevel>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  color: county.trend === "up" ? "#10b981" : "#ef4444",
                  marginTop: "4px",
                }}
              >
                {county.trend === "up" ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                {county.trendValue}% trend
              </div>
            </CountyCard>
          ))}
        </div>

        <div
          style={{
            background: "#f8fafc",
            borderRadius: "16px",
            padding: "15px",
            border: "1px solid #e2e8f0",
          }}
        >
          {regionStats ? (
            <>
              <h4 style={{ margin: "0 0 15px 0" }}>
                {regionStats.name} Insight
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    background: "white",
                    padding: "10px",
                    borderRadius: "8px",
                  }}
                >
                  <span style={{ fontSize: "10px", color: "#64748b" }}>
                    YOUTH
                  </span>
                  <div style={{ fontWeight: "800" }}>
                    {regionStats.performance.youthSupport}%
                  </div>
                </div>
                <div
                  style={{
                    background: "white",
                    padding: "10px",
                    borderRadius: "8px",
                  }}
                >
                  <span style={{ fontSize: "10px", color: "#64748b" }}>
                    WOMEN
                  </span>
                  <div style={{ fontWeight: "800" }}>
                    {regionStats.performance.womenSupport}%
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart
                  data={[
                    { m: "J", s: regionStats.support - 10 },
                    { m: "F", s: regionStats.support - 5 },
                    { m: "M", s: regionStats.support },
                  ]}
                >
                  <Area
                    type="monotone"
                    dataKey="s"
                    stroke={KENYA_THEME.primary}
                    fill={`${KENYA_THEME.primary}20`}
                  />
                  <XAxis dataKey="m" fontSize={10} hide />
                  <Tooltip />
                </AreaChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px 10px",
                color: "#94a3b8",
              }}
            >
              <Users size={32} style={{ marginBottom: "10px", opacity: 0.5 }} />
              <p style={{ fontSize: "13px" }}>
                Tap a county to see demographics
              </p>
            </div>
          )}
        </div>
      </MapGrid>

      <ChartGrid>
        <div
          style={{
            background: "#fff",
            border: "1px solid #f1f5f9",
            padding: "15px",
            borderRadius: "12px",
          }}
        >
          <h5 style={{ margin: "0 0 15px 0", fontSize: "14px" }}>
            Top Performing Counties
          </h5>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={supportData.slice(0, 5)}>
              <XAxis
                dataKey="name"
                fontSize={10}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Bar dataKey="support" radius={[4, 4, 0, 0]}>
                {supportData.slice(0, 5).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getColorForSupport(entry.support)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #f1f5f9",
            padding: "15px",
            borderRadius: "12px",
          }}
        >
          <h5 style={{ margin: "0 0 15px 0", fontSize: "14px" }}>
            Support Distribution
          </h5>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  {
                    name: "High",
                    value: supportData.filter((r) => r.support >= 60).length,
                    fill: "#10b981",
                  },
                  {
                    name: "Med",
                    value: supportData.filter(
                      (r) => r.support >= 40 && r.support < 60,
                    ).length,
                    fill: "#3b82f6",
                  },
                  {
                    name: "Low",
                    value: supportData.filter((r) => r.support < 40).length,
                    fill: "#ef4444",
                  },
                ]}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartGrid>
    </SupportMapContainer>
  );
};

export default LeaderSupportMap;
