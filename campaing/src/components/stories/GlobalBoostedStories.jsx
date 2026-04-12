// GlobalBoostedStories.jsx — Shows boosted endorsements on the main trending feed
// Falls back to most recent if no boosted stories exist
// Personalized by user location

import React, { useState, useEffect, useCallback, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { Zap, TrendingUp, RefreshCw, ChevronRight, MapPin } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../../api/config";

const pulse = keyframes`0%,100% { opacity: 1; } 50% { opacity: 0.5; }`;
const glow = keyframes`0%,100% { box-shadow: 0 0 0 0 rgba(255,107,53,0.3); } 50% { box-shadow: 0 0 0 8px rgba(255,107,53,0); }`;
const slideIn = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); }`;

const Section = styled.section`
  padding: 16px 0 20px;
  background: #0a0a0a;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  animation: ${slideIn} 0.4s ease;
`;
const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px 12px;
`;
const TitleRow = styled.div`display: flex; align-items: center; gap: 8px;`;
const Title = styled.span`font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.8px;`;
const LiveBadge = styled.span`
  background: linear-gradient(135deg, #ff4d4d, #ff6b35);
  color: white; font-size: 9px; font-weight: 800;
  padding: 1px 7px; border-radius: 99px; letter-spacing: 0.5px;
  animation: ${pulse} 2s ease infinite;
`;
const LocationBadge = styled.span`
  display: flex; align-items: center; gap: 4px;
  font-size: 10px; color: rgba(255,255,255,0.4);
`;

const ScrollRow = styled.div`
  display: flex; gap: 14px; overflow-x: auto;
  padding: 0 16px 6px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const StoryItem = styled.div`
  flex-shrink: 0; display: flex; flex-direction: column; align-items: center;
  gap: 7px; cursor: pointer; min-width: 72px;
  transition: transform 0.2s; &:hover { transform: translateY(-3px); }
`;
const Ring = styled.div`
  width: 72px; height: 72px; border-radius: 50%; padding: 2.5px;
  background: ${p => p.$boosted
    ? "linear-gradient(135deg, #ff4d4d, #ff6b35)"
    : p.$recent
      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
      : "linear-gradient(135deg, #10b981, #34d399)"};
  animation: ${p => p.$boosted ? glow : "none"} 2.5s ease-in-out infinite;
`;
const Avatar = styled.div`
  width: 100%; height: 100%; border-radius: 50%;
  background: #1a1a1a; overflow: hidden; display: flex;
  align-items: center; justify-content: center; position: relative;
`;
const AvatarImg = styled.img`width: 100%; height: 100%; object-fit: cover;`;
const TextPreview = styled.div`
  width: 100%; height: 100%; display: flex; align-items: center;
  justify-content: center; background: linear-gradient(135deg, #1e3c72, #2a4a8a);
  color: white; font-size: 9px; font-weight: 500; text-align: center;
  padding: 8px; word-break: break-word; border-radius: 50%;
`;
const BoostPin = styled.div`
  position: absolute; top: -3px; right: -3px;
  background: linear-gradient(135deg, #ff4d4d, #ff6b35);
  border-radius: 50%; width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #0a0a0a; font-size: 9px;
`;
const Name = styled.div`
  font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.75);
  max-width: 70px; overflow: hidden; text-overflow: ellipsis;
  white-space: nowrap; text-align: center;
`;

const Shimmer = styled.div`
  width: 72px; height: 72px; border-radius: 50%;
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: ${keyframes`0%{background-position:200% 0}100%{background-position:-200% 0}`} 1.5s infinite;
`;

const ViewAllBtn = styled.button`
  display: flex; align-items: center; gap: 4px;
  background: none; border: none; color: rgba(255,255,255,0.4);
  font-size: 11px; cursor: pointer; &:hover { color: white; }
`;

// Image URL builder
const buildImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = API.IMAGES;
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
};

const GlobalBoostedStories = ({ onStoryClick }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationLabel, setLocationLabel] = useState(null);
  const navigate = useNavigate();

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
      const county = userData.county || null;

      // Strategy: try county-specific recent, then global boosted, then global recent
      let result = [];
      let source = "global";

      // 1. Try personalized by county (if logged in)
      if (county) {
        try {
          // Get all leaders in county, then fetch their boosted/recent stories
          const leadersRes = await axios.get(`${API.LEADERS}/popular?county=${encodeURIComponent(county)}&limit=8`, { withCredentials: true });
          const countyLeaders = leadersRes.data?.data || [];

          if (countyLeaders.length > 0) {
            const storyPromises = countyLeaders.slice(0, 5).map(l =>
              axios.get(`${API.ENDORSEMENTS}/leader/${l.leader_id}/recent?limit=3`).then(r => {
                const items = r.data?.data || [];
                return items.map(s => ({ ...s, leader_name: l.name, leader_id: l.leader_id }));
              }).catch(() => [])
            );
            const all = (await Promise.all(storyPromises)).flat();
            if (all.length > 0) {
              result = all;
              source = "county";
              setLocationLabel(county);
            }
          }
        } catch {}
      }

      // 2. Global boosted stories
      if (result.length === 0) {
        try {
          const res = await axios.get(`${API.ENDORSEMENTS}/recent?limit=20`, { withCredentials: true });
          const all = res.data?.data || [];
          // Sort: boosted first, then by recency
          all.sort((a, b) => {
            const aScore = (a.total_boost_amount || 0) + (a.boost_count || 0) * 10 + (a.likes || 0);
            const bScore = (b.total_boost_amount || 0) + (b.boost_count || 0) * 10 + (b.likes || 0);
            return bScore - aScore;
          });
          result = all;
          source = "global";
        } catch {}
      }

      // 3. Absolute fallback — get recent stories
      if (result.length === 0) {
        try {
          const res = await axios.get(`${API.ENDORSEMENTS}/recent?limit=15`, { withCredentials: true });
          result = res.data?.data || [];
        } catch {}
      }

      // Filter: must have image or real message
      const valid = result.filter(s => s.image_url || (s.message && s.message.length > 3 && !["📷 Photo", "📹 Video", "💬 Support message"].includes(s.message)));
      setStories(valid.slice(0, 20));
    } catch (err) {
      console.error("GlobalBoostedStories error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const isBoosted = s => (s.boost_count > 0 || s.total_boost_amount > 0);

  if (!loading && stories.length === 0) return null;

  return (
    <Section>
      <Header>
        <TitleRow>
          <Zap size={14} color="#ff6b35" />
          <Title>Boosted Stories</Title>
          <LiveBadge>LIVE</LiveBadge>
          {locationLabel && (
            <LocationBadge>
              <MapPin size={10} /> {locationLabel}
            </LocationBadge>
          )}
        </TitleRow>
        <ViewAllBtn onClick={() => navigate("/leaders")}>
          SEE ALL <ChevronRight size={12} />
        </ViewAllBtn>
      </Header>

      <ScrollRow>
        {loading
          ? [...Array(7)].map((_, i) => (
              <StoryItem key={i}>
                <Shimmer />
                <Name style={{ background: "#1a1a1a", borderRadius: 4, width: 50, height: 10 }}></Name>
              </StoryItem>
            ))
          : stories.map((story, i) => {
              const boosted = isBoosted(story);
              const imgSrc = buildImageUrl(story.image_url);
              const name = (story.leader_name || story.user_name || "Anonymous").split(" ")[0];

              return (
                <StoryItem
                  key={story.id || i}
                  onClick={() => onStoryClick ? onStoryClick(story) : navigate(`/leaders/${story.leader_id}`)}
                >
                  <Ring $boosted={boosted} $recent={!boosted && i < 5}>
                    <Avatar>
                      {imgSrc ? (
                        <AvatarImg
                          src={imgSrc}
                          alt={name}
                          onError={e => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <TextPreview>{story.message?.slice(0, 30) || "💬"}</TextPreview>
                      )}
                      {boosted && <BoostPin>🔥</BoostPin>}
                    </Avatar>
                  </Ring>
                  <Name>{name}</Name>
                </StoryItem>
              );
            })
        }
      </ScrollRow>
    </Section>
  );
};

export default GlobalBoostedStories;
