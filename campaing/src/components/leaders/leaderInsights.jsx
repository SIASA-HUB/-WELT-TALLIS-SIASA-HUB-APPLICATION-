import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import {
  BookOpen,
  History as HistoryIcon,
  MapPin,
  Info,
  MessageSquare,
  FileText,
} from "lucide-react";
import axios from "axios";

// Components
import LeaderHeader from "./leaderHeader.jsx";
import LeaderHistory from "./leaderHistory.jsx";
import LeaderSupportMap from "./leadersSuportMap.jsx";
import ManifestoComments from "./manifestoComents.jsx";
import LeaderOverview from "./leaderOverView.jsx";
import ManifestoPage from "./manifestoPage.jsx";

const KENYA_THEME = {
  primary: "#BB0000",
  secondary: "#000000",
  background: "#F8FAFC",
  text: { primary: "#0F172A", secondary: "#64748B" },
  partyColors: {
    UDA: "#BB0000",
    ODM: "#006600",
    WIPER: "#8B5CF6",
    INDEPENDENT: "#6B7280",
  },
};

const PageContainer = styled.div`
  background: ${KENYA_THEME.background};
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  margin-top: -20px;
  position: relative;
  z-index: 2;
  width: 100%;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 5px 15px 15px 15px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabButton = styled.button`
  padding: 10px 18px;
  background: ${(props) => (props.$active ? KENYA_THEME.primary : "white")};
  color: ${(props) => (props.$active ? "white" : KENYA_THEME.text.secondary)};
  border-radius: 12px;
  font-weight: 700;
  border: 1px solid #fff;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
`;

const Section = styled.div`
  background: white;
  padding: 20px 15px;
  margin-bottom: 20px;
  border: 1px solid #eef2f7;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 600px) {
    border-radius: 0;
    margin-bottom: 0;
  }
`;

const SubTabWrapper = styled.div`
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
  margin-bottom: 20px;
  gap: 4px;
`;

const SubTabButton = styled.button`
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: ${(props) => (props.$active ? "white" : "transparent")};
  color: ${(props) =>
    props.$active ? KENYA_THEME.primary : KENYA_THEME.text.secondary};
  box-shadow: ${(props) =>
    props.$active ? "0 2px 4px rgba(0,0,0,0.1)" : "none"};
`;

// ... keep all imports same ...

const LeaderInsightPage = ({ leaderId: propLeaderId, onBack }) => {
  const { id: urlId } = useParams();
  const activeLeaderId = propLeaderId || urlId;

  const [activeTab, setActiveTab] = useState("manifestos");
  const [manifestoMode, setManifestoMode] = useState("content");

  const [loading, setLoading] = useState(true);
  const [leader, setLeader] = useState(null);
  const [manifestos, setManifestos] = useState([]);
  const [selectedManifesto, setSelectedManifesto] = useState(null);

  const API_BASE_URL =
    "https://bundle-unexpected-sustainability-idol.trycloudflare.com";

  useEffect(() => {
    const fetchData = async () => {
      if (!activeLeaderId) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/leaders/leaders/${activeLeaderId}`,
        );
        if (res.data?.success) setLeader(res.data.data);

        const mRes = await axios.get(
          `${API_BASE_URL}/api/v1/leaders/manifestos/leader/${activeLeaderId}`,
        );
        const mData = mRes.data?.data || [];
        setManifestos(mData);

        if (mData.length > 0) {
          setSelectedManifesto(mData[0].manifesto_id || mData[0].id);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeLeaderId]);

  if (loading)
    return (
      <Section>
        <p>Loading Leader Profile...</p>
      </Section>
    );
  if (!leader)
    return (
      <Section>
        <p>Leader not found.</p>
      </Section>
    );

  return (
    <PageContainer>
      <LeaderHeader
        leader={leader}
        partyColor={
          KENYA_THEME.partyColors[leader?.party] || KENYA_THEME.secondary
        }
        onBack={onBack || (() => window.history.back())}
      />

      <ContentContainer>
        <TabContainer>
          <TabButton
            $active={activeTab === "manifestos"}
            onClick={() => setActiveTab("manifestos")}
          >
            <BookOpen size={18} /> Manifestos
          </TabButton>
          <TabButton
            $active={activeTab === "support"}
            onClick={() => setActiveTab("support")}
          >
            <MapPin size={18} /> Support
          </TabButton>
          <TabButton
            $active={activeTab === "history"}
            onClick={() => setActiveTab("history")}
          >
            <HistoryIcon size={18} /> History
          </TabButton>
          <TabButton
            $active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          >
            <Info size={18} /> Overview
          </TabButton>
        </TabContainer>

        {/* Removed the extra <Section> wrapper here to prevent double-padding/blocking */}
        <div style={{ width: "100%" }}>
          {activeTab === "manifestos" && (
            <>
              {manifestos.length > 0 ? (
                <>
                  <div style={{ padding: "0 15px" }}>
                    <SubTabWrapper>
                      <SubTabButton
                        $active={manifestoMode === "content"}
                        onClick={() => setManifestoMode("content")}
                      >
                        <FileText size={16} /> View Policies
                      </SubTabButton>
                      <SubTabButton
                        $active={manifestoMode === "comments"}
                        onClick={() => setManifestoMode("comments")}
                      >
                        <MessageSquare size={16} /> Public Comments
                      </SubTabButton>
                    </SubTabWrapper>
                  </div>

                  {manifestoMode === "content" ? (
                    <ManifestoPage
                      leaderId={activeLeaderId}
                      leaderData={leader}
                      hideHeader={true}
                    />
                  ) : (
                    <ManifestoComments
                      manifestoId={selectedManifesto}
                      leaderId={activeLeaderId}
                      leaderName={leader.name}
                      /* FIX: Added the onClose handler so the X button works */
                      onClose={() => setManifestoMode("content")}
                    />
                  )}
                </>
              ) : (
                <Section style={{ textAlign: "center", padding: "40px" }}>
                  <p style={{ color: KENYA_THEME.text.secondary }}>
                    No manifestos found.
                  </p>
                </Section>
              )}
            </>
          )}

          {activeTab === "support" && (
            <Section>
              <LeaderSupportMap leaderId={activeLeaderId} theme={KENYA_THEME} />
            </Section>
          )}
          {activeTab === "history" && (
            <Section>
              <LeaderHistory leaderId={activeLeaderId} theme={KENYA_THEME} />
            </Section>
          )}
          {activeTab === "overview" && (
            <Section>
              <LeaderOverview leader={leader} theme={KENYA_THEME} />
            </Section>
          )}
        </div>
      </ContentContainer>
    </PageContainer>
  );
};

export default LeaderInsightPage;
