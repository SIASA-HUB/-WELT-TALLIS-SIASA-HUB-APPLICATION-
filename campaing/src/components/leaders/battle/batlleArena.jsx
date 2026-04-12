// BattleArena.js - Simplified Version (No Ended Battles, Fixed Keyframes)

import React, { useState, useEffect, useRef, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import io from "socket.io-client";
import {
  Swords,
  Eye,
  MessageCircle,
  Send,
  Users,
  Loader,
  RefreshCw,
  Clock,
  X,
  Check,
  Search,
  Gift,
  Volume2,
  VolumeX,
  Flame,
  Zap,
  Heart,
  Crown,
} from "lucide-react";

const API_BASE = "/api/v1/users";
const SOCKET_URL = "/api/v1/users";
const BATTLE_API = `${API_BASE}/battles`;

// ==================== ANIMATIONS ====================
const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const livePulse = keyframes`
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
`;

const modalFadeIn = keyframes`
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
`;

// ==================== STYLED COMPONENTS ====================
const BattleContainer = styled.div`
  margin: 16px 0;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const BattleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
  gap: 12px;
`;

const Title = styled.h2`
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LiveBadge = styled.span`
  background: #ff4444;
  color: white;
  font-size: 9px;
  padding: 3px 8px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  animation: ${livePulse} 1s ease-in-out infinite;

  &::before {
    content: "●";
    font-size: 8px;
  }
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const IconButton = styled.button`
  background: ${({ $active }) => ($active ? "#ff4444" : "#f5f5f5")};
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  svg {
    color: ${({ $active }) => ($active ? "white" : "#666")};
    width: 18px;
    height: 18px;
  }

  &:hover {
    transform: scale(0.95);
    background: ${({ $active }) => ($active ? "#ff5555" : "#e8e8e8")};
  }
`;

const CreateButton = styled.button`
  background: #1e3c72;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: #152c54;
    transform: translateY(-1px);
  }
`;

const RefreshButton = styled.button`
  background: #f5f5f5;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #e8e8e8;
  }
`;

const BattleScroll = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 16px;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
`;

import BattleCard from "./battleCard";

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #999;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;

  svg {
    margin-bottom: 16px;
    opacity: 0.5;
  }

  p {
    margin: 8px 0;
    font-size: 14px;
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: ${modalFadeIn} 0.2s ease;
`;

const ModalContent = styled.div`
  background: #0a0a0f;
  border-radius: 20px;
  width: 90%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h2 {
    font-size: 18px;
    font-weight: 700;
    color: white;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  button {
    background: rgba(255, 255, 255, 0.08);
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 13px;
  margin-bottom: 16px;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    outline: none;
    border-color: #ff4444;
  }
`;

const LeaderList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 16px;
`;

const LeaderItem = styled.div`
  background: ${({ $selected }) =>
    $selected ? "rgba(255, 68, 68, 0.15)" : "rgba(255, 255, 255, 0.03)"};
  border: 1px solid
    ${({ $selected }) => ($selected ? "#ff4444" : "rgba(255, 255, 255, 0.05)")};
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 68, 68, 0.1);
  }
`;

const LeaderAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff4444, #ff8844);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  color: white;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const LeaderInfo = styled.div`
  flex: 1;

  h4 {
    font-size: 14px;
    font-weight: 600;
    color: white;
    margin: 0 0 4px;
  }

  p {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
  }
`;

const VsDivider = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: #ff8844;
  margin: 8px 0;
`;

const DurationOptions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 16px 0;
`;

const DurationOption = styled.button`
  flex: 1;
  background: ${({ $selected }) =>
    $selected ? "#ff4444" : "rgba(255, 255, 255, 0.05)"};
  border: none;
  border-radius: 30px;
  padding: 8px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ff5555;
  }
`;

const CreateBattleButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #ff4444, #ff8844);
  border: none;
  border-radius: 40px;
  padding: 12px;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const VoiceControl = styled.button`
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #1e3c72;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  &:hover {
    background: #152c54;
  }
`;

const GiftAlert = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #ff4444, #ff8844);
  border-radius: 12px;
  padding: 12px 20px;
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10001;
  animation: ${slideIn} 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  font-weight: 600;
`;

// ==================== HELPER FUNCTIONS ====================
const getDeviceId = () => {
  let deviceId = localStorage.getItem("battle_device_id");
  if (!deviceId) {
    deviceId = `device_${Math.random().toString(36).substring(7)}_${Date.now()}`;
    localStorage.setItem("battle_device_id", deviceId);
  }
  return deviceId;
};

// ==================== MAIN COMPONENT ====================
const BattleArena = ({ currentUser = null }) => {
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState("7d");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [giftAlerts, setGiftAlerts] = useState([]);
  const [comments, setComments] = useState({});
  const [modalSearch, setModalSearch] = useState("");
  const [submittingVote, setSubmittingVote] = useState({});
  const [countdowns, setCountdowns] = useState({});
  const [reactionCounts, setReactionCounts] = useState({});
  const [floatingReactions, setFloatingReactions] = useState({});
  const [openComments, setOpenComments] = useState(null);
  const [newComment, setNewComment] = useState("");

  const [availableLeaders, setAvailableLeaders] = useState([]);
  const [leadersLoading, setLeadersLoading] = useState(false);

  const socketRef = useRef(null);
  const voteCooldownRef = useRef({});

  const durationOptions = [
    { value: "1h", label: "1h" },
    { value: "3h", label: "3h" },
    { value: "6h", label: "6h" },
    { value: "12h", label: "12h" },
    { value: "1d", label: "1d" },
    { value: "3d", label: "3d" },
    { value: "7d", label: "7d" },
  ];

  const fetchLeadersForModal = async () => {
    setLeadersLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/leaders`, {
        params: { limit: 100 }
      });

      let leaders = [];
      if (res.data?.success && Array.isArray(res.data.data)) {
        res.data.data.forEach(group => {
          if (group.leaders && Array.isArray(group.leaders)) {
            leaders = [...leaders, ...group.leaders];
          }
        });
      }
      
      const uniqueLeaders = [];
      const seenIds = new Set();
      for (const leader of leaders) {
        if (!seenIds.has(leader.leader_id)) {
          seenIds.add(leader.leader_id);
          uniqueLeaders.push(leader);
        }
      }
      
      setAvailableLeaders(uniqueLeaders);
    } catch (err) {
      console.error("Error fetching leaders:", err);
      setAvailableLeaders([]);
    } finally {
      setLeadersLoading(false);
    }
  };

  useEffect(() => {
    if (showCreateModal && availableLeaders.length === 0 && !leadersLoading) {
      fetchLeadersForModal();
    }
  }, [showCreateModal]);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current.on("connect", () => );
    socketRef.current.on("vote-update", (data) => {
      setBattles((prev) =>
        prev.map((b) =>
          b.id === data.battleId
            ? { ...b, votesLeft: data.votesLeft, votesRight: data.votesRight }
            : b,
        ),
      );
    });

    socketRef.current.on("reaction-update", (data) => {
      setReactionCounts((prev) => ({
        ...prev,
        [data.battleId]: {
          ...prev[data.battleId],
          [data.reaction]: data.reactionCount,
        },
      }));
      setFloatingReactions((prev) => ({
        ...prev,
        [data.battleId]: [
          ...(prev[data.battleId] || []),
          { id: Date.now(), emoji: data.reaction },
        ],
      }));
      setTimeout(() => {
        setFloatingReactions((prev) => ({
          ...prev,
          [data.battleId]: (prev[data.battleId] || []).slice(1),
        }));
      }, 1500);
    });

    socketRef.current.on("comment-update", (data) => {
      setComments((prev) => ({
        ...prev,
        [data.battleId]: [...(prev[data.battleId] || []), data.comment],
      }));
    });

    socketRef.current.on("battle-ended", (data) => {
      setBattles((prev) => prev.filter((b) => b.id !== data.battleId));
    });

    return () => socketRef.current?.disconnect();
  }, []);

  const fetchBattles = useCallback(async () => {
    try {
      const activeRes = await axios.get(`${BATTLE_API}/active`);
      if (activeRes.data?.success) setBattles(activeRes.data.data);
    } catch (err) {
      console.error("Error fetching battles:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBattles();
  }, [fetchBattles]);

  const vote = async (battleId, candidateId) => {
    if (voteCooldownRef.current[battleId]) return;
    voteCooldownRef.current[battleId] = true;
    setTimeout(() => delete voteCooldownRef.current[battleId], 500);

    setSubmittingVote((prev) => ({ ...prev, [battleId]: true }));
    try {
      const deviceId = getDeviceId();
      const res = await axios.post(`${BATTLE_API}/vote`, {
        battle_id: battleId,
        candidate_id: candidateId,
        device_id: deviceId,
      });

      if (res.data?.success) {
        socketRef.current?.emit("battle-vote", {
          battleId,
          candidateId,
          votesLeft: res.data.data.votes_left,
          votesRight: res.data.data.votes_right,
        });
      }
    } catch (err) {
      console.error("Vote error:", err);
    } finally {
      setSubmittingVote((prev) => ({ ...prev, [battleId]: false }));
    }
  };

  const addReaction = async (battleId, emoji) => {
    try {
      const deviceId = getDeviceId();
      await axios.post(`${BATTLE_API}/reaction`, {
        battle_id: battleId,
        reaction: emoji,
        device_id: deviceId,
      });
      socketRef.current?.emit("battle-reaction", { battleId, reaction: emoji });
    } catch (err) {
      console.error("Reaction error:", err);
    }
  };

  const addComment = async (battleId) => {
    if (!newComment.trim()) return;
    try {
      const deviceId = getDeviceId();
      await axios.post(`${BATTLE_API}/comment`, {
        battle_id: battleId,
        comment: newComment,
        device_id: deviceId,
      });
      setNewComment("");
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  const sendGift = async (battleId, giftValue) => {
    try {
      await axios.post(`${BATTLE_API}/gift`, {
        battle_id: battleId,
        gift_value: giftValue,
        device_id: getDeviceId(),
      });
      setGiftAlerts((prev) => [
        ...prev,
        { id: Date.now(), message: `🎉 ${giftValue} coins sent!` },
      ]);
      setTimeout(() => setGiftAlerts((prev) => prev.slice(1)), 3000);
    } catch (err) {
      console.error("Gift error:", err);
    }
  };

  const createBattle = async () => {
    if (!selectedLeft || !selectedRight) return;
    try {
      const res = await axios.post(`${BATTLE_API}/create`, {
        challenger1_id: selectedLeft.leader_id,
        challenger2_id: selectedRight.leader_id,
        duration: selectedDuration,
        title: `${selectedLeft.name} vs ${selectedRight.name}`,
      });
      if (res.data?.success) {
        setBattles([res.data.data, ...battles]);
        setShowCreateModal(false);
        setSelectedLeft(null);
        setSelectedRight(null);
        setModalSearch("");
      }
    } catch (err) {
      console.error("Create battle error:", err);
    }
  };

  const filteredLeaders = availableLeaders.filter((l) =>
    l.name?.toLowerCase().includes(modalSearch.toLowerCase()),
  );

  if (loading && battles.length === 0) {
    return (
      <BattleContainer>
        <BattleHeader>
          <Title>
            <Swords size={16} /> ASPIRANT BATTLES <LiveBadge>LIVE</LiveBadge>
          </Title>
          <CreateButton disabled>+ Create Battle</CreateButton>
        </BattleHeader>
        <LoadingSpinner>
          <Loader size={24} /> Loading battles...
        </LoadingSpinner>
      </BattleContainer>
    );
  }

  return (
    <BattleContainer>
      <BattleHeader>
        <Title>
          <Swords size={16} /> ASPIRANT BATTLES <LiveBadge>LIVE</LiveBadge>
        </Title>
        <HeaderButtons>
          <IconButton
            onClick={() => setSoundEnabled(!soundEnabled)}
            $active={soundEnabled}
          >
            {soundEnabled ? <Volume2 /> : <VolumeX />}
          </IconButton>
          <RefreshButton onClick={fetchBattles}>
            <RefreshCw size={16} />
          </RefreshButton>
          <CreateButton onClick={() => setShowCreateModal(true)}>
            + Create Battle
          </CreateButton>
        </HeaderButtons>
      </BattleHeader>

      {battles.length === 0 ? (
        <EmptyState>
          <Swords size={48} />
          <p>No active battles</p>
          <CreateButton onClick={() => setShowCreateModal(true)}>
            Create First Battle
          </CreateButton>
        </EmptyState>
      ) : (
        <BattleScroll>
          {battles.map((battle) => (
            <BattleCard
              key={battle.id}
              battle={battle}
              countdowns={countdowns}
              reactionCounts={reactionCounts}
              floatingReactions={floatingReactions}
              comments={comments}
              openComments={openComments}
              setOpenComments={setOpenComments}
              newComment={newComment}
              setNewComment={setNewComment}
              onVote={vote}
              onAddReaction={addReaction}
              onAddComment={addComment}
              onSendGift={sendGift}
              currentUser={currentUser}
            />
          ))}
        </BattleScroll>
      )}

      {giftAlerts.map((alert) => (
        <GiftAlert key={alert.id}>
          <Gift size={20} />
          {alert.message}
        </GiftAlert>
      ))}

      {/* Create Battle Modal */}
      {showCreateModal && (
        <ModalOverlay onClick={() => setShowCreateModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>
                <Swords size={18} /> Create Battle
              </h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </ModalHeader>

            <SearchInput
              placeholder="Search aspirant..."
              value={modalSearch}
              onChange={(e) => setModalSearch(e.target.value)}
            />

            <LeaderList>
              {leadersLoading ? (
                <div style={{ textAlign: "center", padding: "20px", color: "rgba(255,255,255,0.5)" }}>
                  <Loader size={24} /> Loading leaders...
                </div>
              ) : filteredLeaders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "rgba(255,255,255,0.5)" }}>
                  No leaders found
                </div>
              ) : (
                filteredLeaders.map((l) => (
                  <LeaderItem
                    key={l.leader_id}
                    $selected={selectedLeft?.leader_id === l.leader_id}
                    onClick={() => setSelectedLeft(l)}
                  >
                    <LeaderAvatar>
                      {l.image_url ? (
                        <img src={l.image_url} alt={l.name} />
                      ) : (
                        l.name?.charAt(0).toUpperCase()
                      )}
                    </LeaderAvatar>
                    <LeaderInfo>
                      <h4>{l.name}</h4>
                      <p>{l.party || "No party"} • {l.position || "Candidate"}</p>
                    </LeaderInfo>
                    {selectedLeft?.leader_id === l.leader_id && <Check size={16} color="#ff4444" />}
                  </LeaderItem>
                ))
              )}
            </LeaderList>

            <VsDivider>VS</VsDivider>

            <LeaderList>
              {leadersLoading ? (
                <div style={{ textAlign: "center", padding: "20px", color: "rgba(255,255,255,0.5)" }}>
                  <Loader size={24} /> Loading leaders...
                </div>
              ) : (
                filteredLeaders
                  .filter((l) => l.leader_id !== selectedLeft?.leader_id)
                  .map((l) => (
                    <LeaderItem
                      key={l.leader_id}
                      $selected={selectedRight?.leader_id === l.leader_id}
                      onClick={() => setSelectedRight(l)}
                    >
                      <LeaderAvatar>
                        {l.image_url ? (
                          <img src={l.image_url} alt={l.name} />
                        ) : (
                          l.name?.charAt(0).toUpperCase()
                        )}
                      </LeaderAvatar>
                      <LeaderInfo>
                        <h4>{l.name}</h4>
                        <p>{l.party || "No party"} • {l.position || "Candidate"}</p>
                      </LeaderInfo>
                      {selectedRight?.leader_id === l.leader_id && <Check size={16} color="#ff4444" />}
                    </LeaderItem>
                  ))
              )}
            </LeaderList>

            <DurationOptions>
              {durationOptions.map((opt) => (
                <DurationOption
                  key={opt.value}
                  $selected={selectedDuration === opt.value}
                  onClick={() => setSelectedDuration(opt.value)}
                >
                  {opt.label}
                </DurationOption>
              ))}
            </DurationOptions>

            <CreateBattleButton
              onClick={createBattle}
              disabled={!selectedLeft || !selectedRight}
            >
              <Swords size={16} /> Start Battle
            </CreateBattleButton>
          </ModalContent>
        </ModalOverlay>
      )}

      <VoiceControl onClick={() => setSoundEnabled(!soundEnabled)}>
        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </VoiceControl>
    </BattleContainer>
  );
};

export default BattleArena;