import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  History,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Award,
  Target,
  Image as ImageIcon,
} from "lucide-react";

const KENYA_THEME = {
  primary: "#BB0000",
  support: "#00A86B",
  opposition: "#FF6B6B",
  trending: "#F59E0B",
  background: "#F8FAFC",
  border: "#E2E8F0",
  text: {
    primary: "#0F172A",
    secondary: "#64748B",
  },
};

const HistoryContainer = styled.div`
  background: white;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const HeroCard = styled.div`
  background:
    linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)),
    url("https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=1000");
  background-size: cover;
  background-position: center;
  padding: 5px 10px;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Badge = styled.span`
  background: ${(props) => props.$color || KENYA_THEME.primary};
  color: white;
  padding: 5px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  width: fit-content;
`;

const HistoryItem = styled.div`
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.1);
  }
`;

const ProjectImage = styled.div`
  width: 100%;
  height: 160px;
  background: #f1f5f9;
  background-image: url(${(props) => props.$url});
  background-size: cover;
  background-position: center;
  position: relative;
`;

const ItemContent = styled.div`
  padding: 10px;
`;

const LeaderHistory = ({ leaderId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const sampleHistory = [
          {
            id: 1,
            title: "Nairobi Expressway Expansion",
            description:
              "Oversaw the Phase 2 linkage project, connecting suburban routes to the main highway to reduce traffic by 30%.",
            date: "Jan 2024",
            type: "project",
            impact: "High",
            img: "https://images.unsplash.com/photo-1545147986-a9d6f210df77?auto=format&fit=crop&q=80&w=500",
            verified: true,
          },
          {
            id: 2,
            title: "Excellence in Public Service Award",
            description:
              "Received the national merit award for transparency in constituency development fund management.",
            date: "Nov 2023",
            type: "achievement",
            impact: "High",
            img: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&q=80&w=500",
            verified: true,
          },
          {
            id: 3,
            title: "Mombasa Road Water Drainage",
            description:
              "Project flagged for slow implementation. Residents report flooding persists during heavy rains.",
            date: "May 2024",
            type: "negative",
            impact: "Moderate",
            img: "https://images.unsplash.com/photo-1510563800743-aed236490d08?auto=format&fit=crop&q=80&w=500",
            warning: "Delayed",
          },
        ];
        setHistory(sampleHistory);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [leaderId]);

  if (loading)
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        Loading Track Record...
      </div>
    );

  return (
    <HistoryContainer>
      <HeroCard>
        <Badge $color={KENYA_THEME.support}>Verified Record</Badge>
        <h2 style={{ margin: 0, fontSize: "28px" }}>Political Track Record</h2>
        <p style={{ opacity: 0.9, margin: 0 }}>
          Reviewing {history.length} key projects and achievements.
        </p>
      </HeroCard>

      <div style={{ padding: "25px" }}>
        {/* Timeline Start */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: "-15px",
              top: 0,
              bottom: 0,
              width: "2px",
              background: "#f1f5f9",
            }}
          />

          {history.map((item) => (
            <div
              key={item.id}
              style={{ position: "relative", marginBottom: "30px" }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "-23px",
                  top: "20px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "white",
                  border: `4px solid ${item.type === "negative" ? KENYA_THEME.opposition : KENYA_THEME.support}`,
                  zIndex: 2,
                }}
              />

              <HistoryItem>
                <ProjectImage $url={item.img}>
                  <div
                    style={{ position: "absolute", top: "10px", right: "10px" }}
                  >
                    {item.verified && (
                      <Badge $color="#00A86B">✓ Verified</Badge>
                    )}
                    {item.warning && (
                      <Badge $color="#F59E0B">⚠ {item.warning}</Badge>
                    )}
                  </div>
                </ProjectImage>

                <ItemContent>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        color: KENYA_THEME.text.primary,
                        fontSize: "18px",
                      }}
                    >
                      {item.title}
                    </h4>
                    <span
                      style={{
                        fontSize: "12px",
                        color: KENYA_THEME.text.secondary,
                        fontWeight: "bold",
                      }}
                    >
                      {item.date}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: "0 0 20px 0",
                      fontSize: "14px",
                      color: KENYA_THEME.text.secondary,
                      lineHeight: "1.6",
                    }}
                  >
                    {item.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: "15px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "12px",
                        color: KENYA_THEME.text.primary,
                        fontWeight: "700",
                      }}
                    >
                      <Target size={14} color={KENYA_THEME.primary} />{" "}
                      {item.impact} Impact
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "12px",
                        color: KENYA_THEME.text.secondary,
                      }}
                    >
                      <Calendar size={14} /> Updated {item.date}
                    </div>
                  </div>
                </ItemContent>
              </HistoryItem>
            </div>
          ))}
        </div>
      </div>
    </HistoryContainer>
  );
};

export default LeaderHistory;
