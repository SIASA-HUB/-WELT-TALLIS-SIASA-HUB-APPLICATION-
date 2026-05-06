// BattleArena.js - Simplified Version (No Registered Aspirants, Custom Only)

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
  Volume2,
  VolumeX,
  Flame,
  Zap,
  Heart,
  Crown,
  Activity,
  Plus,
  TrendingUp,
  Share2
} from "lucide-react";
import BattleCard from "./battleCard";

// ==================== CONSTANTS ====================
const KENYAN_COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta", "Garissa", "Wajir", "Mandera", "Marsabit",
  "Isiolo", "Meru", "Tharaka-Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga",
  "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo Marakwet", "Nandi", "Baringo",
  "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia",
  "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi"
].sort();

const API_BASE = "/api/v1/leaders";
const SOCKET_URL = "/";
const BATTLE_API = "/api/v1/battles";

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

const HeaderButton = styled.button`
  background: ${(props) => (props.$primary ? "#ff4444" : "#f8f9fa")};
  color: ${(props) => (props.$primary ? "white" : "#666")};
  border: 1px solid ${(props) => (props.$primary ? "#ff4444" : "#e0e0e0")};
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$primary ? "#e63946" : "#f1f3f5")};
    transform: translateY(-1px);
  }
`;

const BattleFeed = styled.div`
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 16px;
  padding: 16px 20px;
  background: transparent;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }

  @media (max-width: 640px) {
    padding: 12px 16px;
    gap: 12px;
  }
`;

const EmptyState = styled.div`
  padding: 32px 16px;
  text-align: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 1px dashed #e2e8f0;
  margin: 16px;
  border-radius: 16px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: #1a1a2e;
  width: 100%;
  max-width: 450px;
  border-radius: 24px;
  padding: 24px;
  position: relative;
  animation: ${modalFadeIn} 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    color: white;
    font-size: 20px;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  button {
    background: rgba(255, 255, 255, 0.05);
    border: none;
    color: #888;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
  }
`;

const SearchInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  color: white;
  margin-bottom: 16px;
  font-size: 14px;
  transition: 0.2s;

  &:focus {
    outline: none;
    border-color: #ff4444;
    background: rgba(255, 255, 255, 0.08);
  }
`;

const VsDivider = styled.div`
  text-align: center;
  color: #ff4444;
  font-weight: 900;
  font-size: 14px;
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const DurationOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 24px;
`;

const DurationOption = styled.button`
  background: ${(props) =>
    props.$selected ? "#ff4444" : "rgba(255, 255, 255, 0.05)"};
  border: 1px solid
    ${(props) => (props.$selected ? "#ff4444" : "rgba(255, 255, 255, 0.1)")};
  color: ${(props) => (props.$selected ? "white" : "#aaa")};
  padding: 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: ${(props) => (props.$selected ? "#e63946" : "rgba(255, 255, 255, 0.1)")};
  }
`;

const CreateButton = styled.button`
  width: 100%;
  background: #ff4444;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: 0.3s;

  &:hover {
    background: #e63946;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(255, 68, 68, 0.2);
  }

  &:disabled {
    background: #444;
    cursor: not-allowed;
    transform: none;
  }
`;

const VoiceControl = styled.button`
  position: absolute;
  top: 16px;
  right: 140px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #666;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #333;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  color: #666;
`;

const BattleArena = ({ currentUser }) => {
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("1d");
  const [giftAlerts, setGiftAlerts] = useState([]);
  const [showCountyModal, setShowCountyModal] = useState(false);
  const [pendingVote, setPendingVote] = useState(null);
  const [voterCounty, setVoterCounty] = useState(localStorage.getItem("user_county") || "");
  const [soundEnabled, setSoundEnabled] = useState(false);

  const [countdowns, setCountdowns] = useState({});
  const [reactionCounts, setReactionCounts] = useState({});
  const [floatingReactions, setFloatingReactions] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [battleQuestion, setBattleQuestion] = useState("");

  const [customLeft, setCustomLeft] = useState({ name: "", party: "", position: "", image: "", file: null });
  const [customRight, setCustomRight] = useState({ name: "", party: "", position: "", image: "", file: null });
  const [endedBattles, setEndedBattles] = useState([]);
  const [showEnded, setShowEnded] = useState(false);
  const [uploading, setUploading] = useState(false);

  const socketRef = useRef(null);

  const durationOptions = [
    { label: "1 Hour", value: "1h" },
    { label: "12 Hours", value: "12h" },
    { label: "1 Day", value: "1d" },
    { label: "3 Days", value: "3d" },
    { label: "1 Week", value: "7d" },
  ];

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socketRef.current.on("connect", () => console.log("Connected to battle socket"));
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

  // --- COUNTDOWN TIMER LOGIC ---
  useEffect(() => {
    const timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const newCountdowns = {};

      battles.forEach(battle => {
        if (!battle.expires_at) return;
        const expiresStr = typeof battle.expires_at === 'string' && !battle.expires_at.includes('T')
          ? battle.expires_at.replace(' ', 'T')
          : battle.expires_at;
        const expiry = new Date(expiresStr).getTime();
        const remaining = Math.max(0, expiry - now);
        newCountdowns[battle.id] = remaining;
      });

      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [battles]);

  const fetchBattles = useCallback(async () => {
    setLoading(true);
    try {
      const [activeRes, endedRes] = await Promise.all([
        axios.get(`${BATTLE_API}/active`),
        axios.get(`${BATTLE_API}/completed`)
      ]);

      if (activeRes.data?.success) setBattles(activeRes.data.data);
      if (endedRes.data?.success) setEndedBattles(endedRes.data.data);
    } catch (err) {
      console.error("Error fetching battles:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBattles();
  }, [fetchBattles]);

  const castVote = async (battleId, candidateId, county) => {
    try {
      const res = await axios.post(`${BATTLE_API}/vote`, {
        battle_id: battleId,
        candidate_id: candidateId,
        device_id: currentUser?.user_id || "guest",
        county: county
      });
      console.log("Vote response:", res.data);
      // Refresh battles to show updated counts
      fetchBattles();
    } catch (err) {
      console.error("Error voting:", err.response?.data || err.message);
    }
  };

  const handleVote = (battleId, candidateId) => {
    setPendingVote({ battleId, candidateId });
    setShowCountyModal(true);
  };

  const handleSelectCounty = (county) => {
    setVoterCounty(county);
    localStorage.setItem("user_county", county);
    setShowCountyModal(false);
    if (pendingVote) {
      castVote(pendingVote.battleId, pendingVote.candidateId, county);
      setPendingVote(null);
    }
  };

  const handleAddReaction = async (battleId, reaction) => {
    try {
      await axios.post(`${BATTLE_API}/reaction`, {
        battle_id: battleId,
        reaction,
        device_id: currentUser?.user_id || "guest",
      });
    } catch (err) {
      console.error("Error adding reaction:", err);
    }
  };

  const handleAddComment = async (battleId) => {
    if (!newComment.trim()) return;
    try {
      await axios.post(`${BATTLE_API}/comment`, {
        battle_id: battleId,
        comment: newComment,
        user_name: currentUser?.name || "Guest User",
        device_id: currentUser?.user_id || "guest",
      });
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await axios.post(`${BATTLE_API}/upload-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data.imageUrl;
  };

  const createBattle = async () => {
    if (!customLeft.name || !customRight.name) return;

    setUploading(true);
    try {
      let finalLeftImage = customLeft.image;
      let finalRightImage = customRight.image;

      if (customLeft.file) {
        finalLeftImage = await handleImageUpload(customLeft.file);
      }
      if (customRight.file) {
        finalRightImage = await handleImageUpload(customRight.file);
      }

      const payload = {
        challenger1_id: null,
        challenger2_id: null,
        challenger1_custom: { ...customLeft, image: finalLeftImage },
        challenger2_custom: { ...customRight, image: finalRightImage },
        duration: selectedDuration,
        title: `${customLeft.name} vs ${customRight.name}`,
        question: battleQuestion,
        created_by: currentUser?.user_id || "guest",
        host_name: currentUser?.name || "Guest Host"
      };

      const res = await axios.post(`${BATTLE_API}/create`, payload);
      if (res.data?.success) {
        setBattles([res.data.data, ...battles]);
        setShowCreateModal(false);
        setCustomLeft({ name: "", party: "", position: "", image: "", file: null });
        setCustomRight({ name: "", party: "", position: "", image: "", file: null });
        setBattleQuestion("");
      }
    } catch (err) {
      console.error("Create battle error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <BattleContainer>
      <BattleHeader>
        <Title>
          <Swords size={20} color="#ff4444" />
          Battle Arena
          {battles.length > 0 && <LiveBadge>LIVE</LiveBadge>}
        </Title>
        <HeaderButtons>
          {endedBattles.length > 0 && (
            <HeaderButton onClick={() => setShowEnded(!showEnded)}>
              <Clock size={16} /> {showEnded ? "Live Feed" : "Ended"}
            </HeaderButton>
          )}
          <RefreshCw
            size={16}
            style={{ cursor: 'pointer', opacity: 0.5 }}
            onClick={fetchBattles}
            className={loading ? "animate-spin" : ""}
          />
          <HeaderButton onClick={() => setShowCreateModal(true)} $primary>
            <Plus size={16} /> New Battle
          </HeaderButton>
        </HeaderButtons>
      </BattleHeader>

      <BattleFeed>
        {loading ? (
          <LoadingState>
            <Loader size={32} className="animate-spin" />
            <p>Entering the arena...</p>
          </LoadingState>
        ) : showEnded ? (
          endedBattles.length > 0 ? (
            endedBattles.map((battle) => (
              <BattleCard
                key={battle.id}
                battle={battle}
                onVote={handleVote}
                onAddReaction={handleAddReaction}
                onAddComment={handleAddComment}
                countdowns={countdowns}
                reactionCounts={reactionCounts}
                floatingReactions={floatingReactions}
                comments={comments}
                currentUser={currentUser}
                isEnded={true}
              />
            ))
          ) : (
            <EmptyState>
              <p>No ended battles yet.</p>
            </EmptyState>
          )
        ) : battles.length > 0 ? (
          battles.map((battle) => (
            <BattleCard
              key={battle.id}
              battle={battle}
              onVote={handleVote}
              onAddReaction={handleAddReaction}
              onAddComment={handleAddComment}

              countdowns={countdowns}
              reactionCounts={reactionCounts}
              floatingReactions={floatingReactions}
              comments={comments}
              setNewComment={setNewComment}
              newComment={newComment}
              currentUser={currentUser}
            />
          ))
        ) : (
          <EmptyState>
            <p>The arena is currently quiet. Why not start a battle?</p>
            <HeaderButton onClick={() => setShowCreateModal(true)} $primary style={{ marginTop: '12px' }}>
              Launch First Battle
            </HeaderButton>
            {/* Overlay to close custom aspirants modal */}
          </EmptyState>
        )}
      </BattleFeed>

      {showCountyModal && (
        <ModalOverlay onClick={() => setShowCountyModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Where are you voting from?</h2>
            <p style={{ opacity: 0.7, fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
              Select your county to participate in this battle and see regional trends.
            </p>
            <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {voterCounty && (
                <button
                  onClick={() => handleSelectCounty(voterCounty)}
                  style={{
                    gridColumn: '1 / -1',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #ff4444 0%, #ff8844 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 900,
                    marginBottom: '10px'
                  }}
                >
                  Vote as {voterCounty} (Current)
                </button>
              )}
              {KENYAN_COUNTIES.map(county => (
                <button
                  key={county}
                  onClick={() => handleSelectCounty(county)}
                  style={{
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  {county}
                </button>
              ))}
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {showCreateModal && (
        <ModalOverlay onClick={() => setShowCreateModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2><Swords size={18} /> Launch Battle</h2>
              <button onClick={() => setShowCreateModal(false)}><X size={18} /></button>
            </ModalHeader>

            <SearchInput
              placeholder="Battle Question (e.g. Who is more fit for Nairobi?)"
              value={battleQuestion}
              onChange={(e) => setBattleQuestion(e.target.value)}
              style={{ marginBottom: '24px' }}
            />

            <div style={{ color: 'white', fontSize: '14px', marginBottom: '12px', fontWeight: 600 }}>Challenger 1</div>
            <div style={{ display: 'grid', gap: '8px', marginBottom: '24px' }}>
              <SearchInput placeholder="Aspirant Name" value={customLeft.name} onChange={e => setCustomLeft({ ...customLeft, name: e.target.value })} style={{ margin: 0 }} />
              <SearchInput placeholder="Political Party" value={customLeft.party} onChange={e => setCustomLeft({ ...customLeft, party: e.target.value })} style={{ margin: 0 }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="file"
                  id="left-image"
                  hidden
                  onChange={e => setCustomLeft({ ...customLeft, file: e.target.files[0], image: URL.createObjectURL(e.target.files[0]) })}
                />
                <label
                  htmlFor="left-image"
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    border: '1px dashed rgba(255,255,255,0.2)',
                    textAlign: 'center'
                  }}
                >
                  {customLeft.file ? customLeft.file.name : "Upload Photo or Video"}
                </label>
              </div>
            </div>

            <VsDivider>VS</VsDivider>

            <div style={{ color: 'white', fontSize: '14px', marginBottom: '12px', fontWeight: 600, marginTop: '12px' }}>Challenger 2</div>
            <div style={{ display: 'grid', gap: '8px', marginBottom: '24px' }}>
              <SearchInput placeholder="Aspirant Name" value={customRight.name} onChange={e => setCustomRight({ ...customRight, name: e.target.value })} style={{ margin: 0 }} />
              <SearchInput placeholder="Political Party" value={customRight.party} onChange={e => setCustomRight({ ...customRight, party: e.target.value })} style={{ margin: 0 }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="file"
                  id="right-image"
                  hidden
                  onChange={e => setCustomRight({ ...customRight, file: e.target.files[0], image: URL.createObjectURL(e.target.files[0]) })}
                />
                <label
                  htmlFor="right-image"
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    border: '1px dashed rgba(255,255,255,0.2)',
                    textAlign: 'center'
                  }}
                >
                  {customRight.file ? customRight.file.name : "Upload Photo or Video"}
                </label>
              </div>
            </div>

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

            <CreateButton
              onClick={createBattle}
              disabled={uploading || !customLeft.name || !customRight.name}
            >
              {uploading ? <Loader size={18} className="animate-spin" /> : <Swords size={18} />}
              {uploading ? "Uploading Data..." : "Launch Battle Now"}
            </CreateButton>
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