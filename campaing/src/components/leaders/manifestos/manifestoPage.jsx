// manifestoPage.jsx - Fixed stats display only, keeping your sleek design
import React, { useState, useEffect, useRef, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import {
  ArrowLeft,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Eye,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import AppLoadingBar from "../../../utils/LoadingBar";
import api from "../../../api/api";
import SEO from "../../../utils/SEO";
import { useAuth } from "../../hooks/useAuth";

const KENYA = {
  black: "#050505",
  red: "#BB0000",
  green: "#22c55e",
  white: "#ffffff",
  border: "rgba(255, 255, 255, 0.12)",
  muted: "#888888",
};

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  background: ${KENYA.black};
  width: 100%;
  color: white;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
`;

const FixedHeader = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(5, 5, 5, 0.95);
  backdrop-filter: blur(15px);
  padding: 18px 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${KENYA.border};

  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
  }
`;

const ManifestoContainer = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 1px;
`;

const MagazineHeader = styled.div`
  border-bottom: 4px solid white;
  padding-bottom: 20px;
  margin-bottom: 40px;

  .issue-no {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${KENYA.muted};
  }

  h1 {
    font-size: clamp(40px, 10vw, 64px);
    font-weight: 950;
    font-family: "Playfair Display", serif;
    display: block;
    line-height: 0.9;
    margin: 10px 0;
  }
`;

const ArticleWrapper = styled.div`
  padding: 40px 0;
  border-bottom: 1px solid ${KENYA.border};
  animation: ${slideUp} 0.6s ease both;
`;

const CategoryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const CategoryLabel = styled.span`
  background: ${(props) => props.$color};
  color: white;
  font-size: 10px;
  font-weight: 900;
  padding: 4px 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ArticleTitle = styled.h2`
  font-family: "Playfair Display", serif;
  font-size: 32px;
  font-weight: 800;
  line-height: 1.1;
  margin: 15px 0;
  letter-spacing: -0.5px;
`;

const ArticleContent = styled.p`
  font-size: 18px;
  line-height: 1.7;
  color: #d1d1d1;
  margin-bottom: 25px;

  &::first-letter {
    font-family: "Playfair Display", serif;
    font-size: 64px;
    font-weight: 900;
    float: left;
    line-height: 0.8;
    margin-right: 12px;
    margin-top: 4px;
    color: ${KENYA.white};
  }
`;

const ImpactBarContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  height: 6px;
  width: 100%;
  border-radius: 10px;
  margin: 20px 0 10px 0;
  overflow: hidden;
  display: flex;
`;

const SupportProgress = styled.div`
  height: 100%;
  background: ${KENYA.green};
  width: ${(props) => props.$percent}%;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
`;

const RejectProgress = styled.div`
  height: 100%;
  background: ${KENYA.red};
  width: ${(props) => props.$percent}%;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
`;

const VoteStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 800;
  margin-bottom: 25px;
  color: ${KENYA.muted};

  .sup {
    color: ${KENYA.green};
  }
  .rej {
    color: ${KENYA.red};
  }
`;

const InteractionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const IconButton = styled.button`
  background: ${(props) => (props.$active ? props.$color : "transparent")};
  border: 1px solid ${(props) => (props.$active ? props.$color : KENYA.border)};
  color: white;
  padding: 10px 20px;
  font-size: 11px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) =>
    props.$active ? props.$color : "rgba(255,255,255,0.1)"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${KENYA.muted};

  svg {
    margin-bottom: 16px;
    color: ${KENYA.red};
  }

  p {
    margin: 8px 0;
  }

  button {
    margin-top: 20px;
    background: ${KENYA.red};
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${KENYA.muted};
`;

const ManifestoPage = ({ leaderName, leaderId, onBack }) => {
  const { user } = useAuth();
  const loadingBarRef = useRef(null);
  const [manifesto, setManifesto] = useState(null);
  const [agendaItems, setAgendaItems] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voting, setVoting] = useState({});

  const userId = useMemo(() => {
    if (user?.user_id || user?.id) return user.user_id || user.id;
    
    let anonId = localStorage.getItem("siasa_anon_id");
    if (!anonId) {
      anonId = `anon_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`;
      localStorage.setItem("siasa_anon_id", anonId);
    }
    return anonId;
  }, [user]);

  const readStartRef = useRef(Date.now());
  const manifestoIdRef = useRef(null);

  useEffect(() => {
    if (leaderId) {
      fetchManifesto();
      trackView();
    } else {
      setError("Leader ID is required");
      setLoading(false);
    }

    return () => {
      const readTimeSeconds = Math.round((Date.now() - readStartRef.current) / 1000);
      if (manifestoIdRef.current && readTimeSeconds > 2) {
        api.post(`/leaders/manifestos/${manifestoIdRef.current}/read-time`, {
          user_id: userId,
          read_time: readTimeSeconds,
        }).catch(() => { });
      }
    };
  }, [leaderId]);

  const trackView = async () => {
    if (!leaderId) return;
    try {
      await api.post("/leaders/interact", {
        leaderId: leaderId,
        interactionType: "info_view",
        metadata: { deviceId: userId, source: "manifesto_page" },
      });
    } catch (err) {

    }
  };

  const fetchManifesto = async () => {
    if (!leaderId) return;

    loadingBarRef.current?.continuousStart();
    setLoading(true);

    try {
      const response = await api.get(
        `/leaders/manifestos/leader/${leaderId}`,
        { timeout: 60000 },
      );

      if (response && response.success && response.data) {
        // Handle both array and object responses
        const manifestoData = Array.isArray(response.data) ? response.data[0] : response.data;

        if (manifestoData) {
          setManifesto(manifestoData);
          manifestoIdRef.current = manifestoData.manifesto_id || manifestoData.id;

          let agendaItemsList = manifestoData.agenda_items || [];
          if (typeof agendaItemsList === "string") {
            agendaItemsList = JSON.parse(agendaItemsList);
          }

          const itemsWithDefaultStats = (agendaItemsList || []).map((item, idx) => ({
            ...item,
            id: item.id || item.agenda_item_id || idx,
            agenda_item_id: item.id || item.agenda_item_id,
            stats: {
              approve_count: 0,
              reject_count: 0,
              neutral_count: 0,
              total_votes: 0,
              approval_rate: 0,
              rejection_rate: 0,
            },
          }));

          setAgendaItems(itemsWithDefaultStats);

          const manifestoId = manifestoData.manifesto_id || manifestoData.id;
          if (manifestoId) {
            // Track specifically that a manifesto was viewed
            api.post(`/leaders/manifestos/${manifestoId}/view`, {
              user_id: userId
            }).catch(() => {});

            try {
              const statsResponse = await api.get(`/leaders/manifestos/${manifestoId}/stats`);

              //  stats are in data.agenda_stats array
              if (statsResponse && statsResponse.success && statsResponse.data?.agenda_stats) {
                const statsMap = {};
                statsResponse.data.agenda_stats.forEach(stat => {
                  statsMap[stat.agenda_id] = stat;
                });

                setAgendaItems(prev =>
                  prev.map(item => ({
                    ...item,
                    stats: statsMap[item.agenda_item_id || item.id] || {
                      approve_count: 0,
                      reject_count: 0,
                      total_votes: 0,
                      approval_rate: 0,
                      rejection_rate: 0,
                    }
                  }))
                );
              }

              // Load user votes if available
              if (statsResponse?.data?.user_votes) {
                const votesMap = {};
                statsResponse.data.user_votes.forEach(vote => {
                  votesMap[`${manifestoId}_${vote.agenda_item_id}`] = vote.vote_type;
                });
                setUserVotes(votesMap);
              }
            } catch (statsErr) {
              console.error("Error fetching stats:", statsErr);
            }
          }
        } else {
          setError("No manifesto found for this leader");
        }
      } else {
        setError(response?.message || "No manifesto found for this leader");
      }
    } catch (err) {
      console.error("Error fetching manifesto:", err);
      setError(err.response?.data?.message || "Failed to load manifesto");
    } finally {
      setLoading(false);
      loadingBarRef.current?.complete();
    }
  };

  const handleVote = async (item, voteType) => {
    if (!manifesto) return;

    const manifestoId = manifesto.manifesto_id || manifesto.id;
    const agendaItemId = item.agenda_item_id || item.id;
    const voteKey = `${manifestoId}_${agendaItemId}`;

    if (voting[voteKey]) return;

    setVoting((prev) => ({ ...prev, [voteKey]: true }));

    const previousVote = userVotes[voteKey];
    // Optimistic update
    setUserVotes((prev) => ({
      ...prev,
      [voteKey]: previousVote === voteType ? null : voteType,
    }));

    // Optimistic stats update
    setAgendaItems((prev) =>
      prev.map((i) => {
        if ((i.agenda_item_id || i.id) === agendaItemId) {
          const currentStats = { ...i.stats };
          let newStats = { ...currentStats };

          // Remove previous vote if exists
          if (previousVote === 'approve') {
            newStats.approve_count = Math.max(0, (newStats.approve_count || 0) - 1);
            newStats.total_votes = Math.max(0, (newStats.total_votes || 0) - 1);
          } else if (previousVote === 'reject') {
            newStats.reject_count = Math.max(0, (newStats.reject_count || 0) - 1);
            newStats.total_votes = Math.max(0, (newStats.total_votes || 0) - 1);
          }

          // Add new vote if not toggling off
          if (previousVote !== voteType) {
            if (voteType === 'approve') {
              newStats.approve_count = (newStats.approve_count || 0) + 1;
              newStats.total_votes = (newStats.total_votes || 0) + 1;
            } else if (voteType === 'reject') {
              newStats.reject_count = (newStats.reject_count || 0) + 1;
              newStats.total_votes = (newStats.total_votes || 0) + 1;
            }
          }

          newStats.approval_rate = newStats.total_votes > 0
            ? ((newStats.approve_count / newStats.total_votes) * 100).toFixed(1)
            : 0;
          newStats.rejection_rate = newStats.total_votes > 0
            ? ((newStats.reject_count / newStats.total_votes) * 100).toFixed(1)
            : 0;

          return { ...i, stats: newStats };
        }
        return i;
      })
    );

    try {
      const response = await api.post(`/leaders/manifestos/${manifestoId}/vote`, {
        manifesto_id: manifestoId,
        agenda_item_id: agendaItemId,
        user_id: userId,
        vote_type: voteType,
      });

      if (response && response.success && response.data?.stats) {
        // Update with actual stats from server
        setAgendaItems((prev) =>
          prev.map((i) =>
            (i.agenda_item_id || i.id) === agendaItemId
              ? { ...i, stats: response.data.stats }
              : i
          )
        );
      }
    } catch (err) {

      // Revert on failure
      setUserVotes((prev) => ({ ...prev, [voteKey]: previousVote }));
      fetchManifesto(); // Refresh data
    } finally {
      setVoting((prev) => ({ ...prev, [voteKey]: false }));
    }
  };

  const getPercentages = (stats) => {
    const total = stats?.total_votes || 0;
    const approves = stats?.approve_count || 0;
    const rejects = stats?.reject_count || 0;

    if (total === 0) {
      return { support: 0, reject: 0 };
    }

    return {
      support: ((approves / total) * 100).toFixed(1),
      reject: ((rejects / total) * 100).toFixed(1),
    };
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (loading) {
    return (
      <Page>
        <AppLoadingBar ref={loadingBarRef} color={KENYA.red} />
        <FixedHeader>
          <button onClick={onBack}>
            <ArrowLeft size={22} />
          </button>
          <Share2 size={18} />
        </FixedHeader>
        <LoadingState>Loading manifesto...</LoadingState>
      </Page>
    );
  }

  if (error || !manifesto) {
    return (
      <Page>
        <FixedHeader>
          <button onClick={onBack}>
            <ArrowLeft size={22} />
          </button>
          <Share2 size={18} />
        </FixedHeader>
        <ErrorContainer>
          <AlertCircle size={48} />
          <p>{error || "No manifesto available"}</p>
          <button onClick={onBack}>Go Back</button>
        </ErrorContainer>
      </Page>
    );
  }

  return (
    <Page>
      <SEO
        title={leaderName ? `${leaderName}'s Vision & Manifesto` : "Leader Manifesto"}
        description={manifesto?.main_agenda || `Read the official election manifesto for ${leaderName}. Explore their key pledges and development agenda.`}
        canonical={leaderId ? `/leaders/manifestos/${leaderId}` : undefined}
      />

      <ManifestoContainer>
        <MagazineHeader>
          <div className="issue-no">Special Edition • The Manifesto</div>
          <h1>{leaderName?.split(" ")[0] || "Kenya"}'s Vision</h1>
          <p
            style={{ fontSize: "14px", color: KENYA.muted, marginTop: "10px" }}
          >
            {manifesto.main_agenda}
          </p>
        </MagazineHeader>

        {agendaItems.map((item, index) => {
          const stats = getPercentages(item.stats);
          const manifestoId = manifesto.manifesto_id || manifesto.id;
          const agendaItemId = item.agenda_item_id || item.id;
          const voteKey = `${manifestoId}_${agendaItemId}`;
          const currentVote = userVotes[voteKey];

          return (
            <ArticleWrapper key={agendaItemId || index}>
              <CategoryRow>
                <CategoryLabel
                  $color={index % 2 === 0 ? KENYA.red : KENYA.green}
                >
                  AGENDA {index + 1}
                </CategoryLabel>
                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    color: KENYA.muted,
                    fontSize: "11px",
                  }}
                >
                  <span>
                    <Eye size={12} />{" "}
                    {formatNumber(item.stats?.total_votes || 0)} Votes
                  </span>
                  <span>
                    <TrendingUp size={12} /> Active
                  </span>
                </div>
              </CategoryRow>

              <ArticleTitle>{item.title}</ArticleTitle>
              <ArticleContent>{item.description}</ArticleContent>

              <VoteStats>
                <span className="sup">{stats.support}% APPROVAL</span>
                <span className="rej">{stats.reject}% REJECTION</span>
              </VoteStats>

              <ImpactBarContainer>
                <SupportProgress $percent={stats.support} />
                <RejectProgress $percent={stats.reject} />
              </ImpactBarContainer>

              <InteractionBar>
                <div style={{ display: "flex", gap: "10px" }}>
                  <IconButton
                    $color={KENYA.green}
                    $active={currentVote === "approve"}
                    onClick={() => handleVote(item, "approve")}
                    disabled={voting[voteKey]}
                  >
                    <ThumbsUp size={14} /> APPROVE
                  </IconButton>
                  <IconButton
                    $color={KENYA.red}
                    $active={currentVote === "reject"}
                    onClick={() => handleVote(item, "reject")}
                    disabled={voting[voteKey]}
                  >
                    <ThumbsDown size={14} /> REJECT
                  </IconButton>
                </div>
              </InteractionBar>
            </ArticleWrapper>
          );
        })}
      </ManifestoContainer>
    </Page>
  );
};

export default ManifestoPage;