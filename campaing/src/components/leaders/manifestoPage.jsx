import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Loader2,
  MessageSquare,
} from "lucide-react";
import axios from "axios";
import ManifestoComments from "./manifestoComents"; // Ensure spelling matches your filename

const KENYA_THEME = {
  primary: "#BB0000",
  background: "#F8FAFC",
  support: "#00A86B",
  opposition: "#EF4444",
  border: "#E2E8F0",
  text: { primary: "#0F172A", secondary: "#64748B", light: "#94A3B8" },
};

// --- STYLES ---
const PageContainer = styled.div`
  background: ${KENYA_THEME.background};
  min-height: 100vh;
`;

const Header = styled.div`
  background: ${(props) => props.$color || KENYA_THEME.primary};
  color: white;
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const MainContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0.75rem;
`;

const ManifestoCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  border: 1px solid ${KENYA_THEME.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const AgendaItem = styled.div`
  background: #f1f5f9;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
  border-left: 4px solid ${(props) => props.$color || KENYA_THEME.primary};
  font-size: 0.9rem;
  color: ${KENYA_THEME.text.primary};
`;

const ActionGrid = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  &.approve {
    background: ${(props) => (props.$active ? KENYA_THEME.support : "#ECFDF5")};
    color: ${(props) => (props.$active ? "white" : KENYA_THEME.support)};
  }
  &.reject {
    background: ${(props) =>
      props.$active ? KENYA_THEME.opposition : "#FEF2F2"};
    color: ${(props) => (props.$active ? "white" : KENYA_THEME.opposition)};
  }
`;

const CommentTrigger = styled.button`
  width: 100%;
  margin-top: 1rem;
  padding: 12px;
  background: #f8fafc;
  border: 1px dashed ${KENYA_THEME.border};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  color: ${KENYA_THEME.text.secondary};
  cursor: pointer;
  &:hover {
    background: #f1f5f9;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  .spinner {
    animation: spin 1s linear infinite;
    color: ${KENYA_THEME.primary};
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ManifestoPage = ({ leaderId, onBack, leaderData, hideHeader }) => {
  const [manifestos, setManifestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    if (!leaderId) return;

    setLoading(true);
    axios
      .get(
        `https://bundle-unexpected-sustainability-idol.trycloudflare.com/api/v1/leaders/manifestos/leader/${leaderId}`,
      )
      .then((res) => {
        const rawData = res.data.data || [];

        const processed = rawData.map((m) => {
          // 1. Determine which field holds the promises
          let rawPromises = m.promises || m.agenda_items || m.roadmap || [];

          // 2. Safely parse if it's a string, otherwise use as is
          let parsedPromises = [];
          try {
            parsedPromises =
              typeof rawPromises === "string"
                ? JSON.parse(rawPromises)
                : rawPromises;
          } catch (e) {
            console.error("Failed to parse promises for manifesto:", m.id);
            parsedPromises = [];
          }

          return {
            ...m,
            id: (m.manifesto_id || m.id).toString(),
            display_promises: Array.isArray(parsedPromises)
              ? parsedPromises
              : [],
          };
        });

        setManifestos(processed);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setLoading(false);
      });
  }, [leaderId]);

  if (loading)
    return (
      <LoadingState>
        <Loader2 size={40} className="spinner" />
        <p style={{ marginTop: "10px", color: "#666" }}>
          Fetching Leader's Promises...
        </p>
      </LoadingState>
    );

  return (
    <PageContainer>
      {!hideHeader && (
        <Header $color={leaderData?.party_color}>
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={18} /> <strong>Back</strong>
          </button>
          <h2 style={{ fontSize: "1.2rem", marginTop: "10px" }}>
            Roadmap & Policies
          </h2>
        </Header>
      )}

      <MainContent>
        {manifestos.length === 0 && (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#94A3B8" }}
          >
            No manifesto data available for this leader.
          </div>
        )}

        {manifestos.map((m) => (
          <ManifestoCard key={m.id}>
            <h3
              style={{ marginBottom: "12px", color: KENYA_THEME.text.primary }}
            >
              {m.main_agenda}
            </h3>

            {/* Displaying the processed promises */}
            {m.display_promises.length > 0 ? (
              m.display_promises.map((item, i) => (
                <AgendaItem key={i} $color={leaderData?.party_color}>
                  <strong>• {item.title || item.promise || item}</strong>
                  {item.description && (
                    <p
                      style={{
                        fontSize: "0.8rem",
                        marginTop: "4px",
                        opacity: 0.8,
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                </AgendaItem>
              ))
            ) : (
              <p style={{ fontSize: "0.85rem", color: "#94A3B8" }}>
                Details pending updates...
              </p>
            )}

            <ActionGrid>
              <ActionButton
                className="approve"
                $active={userVotes[m.id] === "approve"}
                onClick={() =>
                  setUserVotes({ ...userVotes, [m.id]: "approve" })
                }
              >
                <ThumbsUp size={16} /> Support
              </ActionButton>
              <ActionButton
                className="reject"
                $active={userVotes[m.id] === "reject"}
                onClick={() => setUserVotes({ ...userVotes, [m.id]: "reject" })}
              >
                <ThumbsDown size={16} /> Oppose
              </ActionButton>
            </ActionGrid>

            <CommentTrigger onClick={() => setActiveCommentId(m.id)}>
              <MessageSquare size={16} /> Join the Debate
            </CommentTrigger>

            {activeCommentId === m.id && (
              <ManifestoComments
                manifestoId={m.id}
                onClose={() => setActiveCommentId(null)}
              />
            )}
          </ManifestoCard>
        ))}
      </MainContent>
    </PageContainer>
  );
};

export default ManifestoPage;
