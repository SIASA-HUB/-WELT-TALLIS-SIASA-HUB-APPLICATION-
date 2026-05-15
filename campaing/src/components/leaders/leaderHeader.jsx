

import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import styled, { keyframes } from "styled-components";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  Sparkles,
  X,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Flag,
  User,
  Plus,
  Twitter,
  Heart,
  MessageCircle,
  Facebook,
  Linkedin,
  Link2,
  Instagram,
  Youtube,
  Globe,
  Eye as EyeIcon,
  Users,
  Search,
  MapPin,
  Smartphone,
  Award,
  Shield,
  Zap,
  Trophy,
  Crown,
  Medal,
  Star,
  LogIn,
  Mail,
  Lock,
  UserPlus,
  Flame
} from "lucide-react";
import api from "../../api/api";
import { buildImageUrl } from "../../utils/imageUtils";

import EndorsementStories from "../stories/endorsementStories";
import BoostedStoriesRow from "../stories/boostedstoriesrow";
import BoostModal from "../Wallet/boostModal";
import AddStoryModal from "../stories/addStoryModal";

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
`;

const glow = keyframes`
  0% { filter: drop-shadow(0 0 2px #dc2626); }
  50% { filter: drop-shadow(0 0 10px #ef4444); }
  100% { filter: drop-shadow(0 0 2px #dc2626); }
`;

const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const scrollTicker = keyframes`
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(50px); }
  to { opacity: 1; transform: translateX(0); }
`;

const crownGlow = keyframes`
  0% { filter: drop-shadow(0 0 2px gold); }
  50% { filter: drop-shadow(0 0 8px gold); }
  100% { filter: drop-shadow(0 0 2px gold); }
`;

// Brand Colors
const BRANDS = {
  twitter: "#000000",
  facebook: "#1877F2",
  whatsapp: "#25D366",
  linkedin: "#0077B5",
};

// ==================== STYLED COMPONENTS ====================

const PageContainer = styled.div`
  background: #000000;
  min-height: 100vh;
  color: white;
  position: relative;
`;

const HeroSection = styled.div`
  position: relative;
  height: 450px;
  width: 100%;
  overflow: hidden;
  background: #0a0a0a;
`;

const CoverImage = styled.div`
  position: absolute;
  inset: 0;
  background-image: url(${(props) => props.$image});
  background-size: cover;
  background-position: center 20%;
  background-repeat: no-repeat;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 30%, rgba(0, 0, 0, 0.8) 80%, #000000 100%);
  }
`;

const TopNav = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent);
`;

const IconButton = styled.button`
  background: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #000;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const SideActions = styled.div`
  position: fixed;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;
  animation: ${slideInRight} 0.2s ease-out;
  transition: opacity 0.2s ease, transform 0.2s ease;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transform: ${(props) => (props.$visible ? "translateX(0)" : "translateX(20px)")};
  pointer-events: ${(props) => (props.$visible ? "auto" : "none")};
  top: ${(props) => (props.$scrolledPast ? "80px" : "50%")};
  transform: ${(props) => (props.$scrolledPast ? "translateY(0)" : "translateY(-50%)")};
`;

const VerifiedBadge = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: default;

  .verified-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${(props) => (props.$verified ? "#10b981" : "rgba(107, 114, 128, 0.8)")};
    backdrop-filter: blur(10px);
    transition: none;
  }

  .verified-text {
    font-size: 8px;
    font-weight: 500;
    color: ${(props) => (props.$verified ? "#10b981" : "#9ca3af")};
  }
`;

const BoostButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  background: none;
  border: none;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  .boost-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
    color: white;
    animation: ${pulse} 2s infinite;
  }

  .boost-text {
    font-size: 9px;
    font-weight: 700;
    color: #ef4444;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &:hover {
    transform: scale(1.1) translateY(-2px);
    .boost-icon {
      box-shadow: 0 8px 25px rgba(220, 38, 38, 0.6);
    }
  }
`;

const FloatingBoostAction = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 50px;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 9999;
  box-shadow: 0 10px 30px rgba(220, 38, 38, 0.5);
  animation: ${pulse} 2s infinite;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;

  &:hover {
    transform: scale(1.05) translateY(-4px);
    box-shadow: 0 15px 40px rgba(220, 38, 38, 0.7);
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

const ShareButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  background: none;
  border: none;
  position: relative;

  .share-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    color: white;
  }

  .share-text {
    font-size: 8px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
  }
`;

const ShareDropdown = styled.div`
  position: absolute;
  bottom: 60px;
  right: 0;
  background: #000000ff;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 200;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  min-width: 120px;
`;

const ShareIconRow = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  width: 100%;
  font-size: 13px;
  font-weight: 500;
  &:hover { background: rgba(255,255,255,0.05); }
`;

const SupportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${(props) => (props.$active ? "#374151" : "linear-gradient(135deg, #ef4444, #dc2626)")};
  color: ${(props) => (props.$active ? "#9ca3af" : "white")};
  border: ${(props) => (props.$active ? "1px solid #4b5563" : "none")};
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  cursor: ${(props) => (props.$active ? "default" : "pointer")};
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: ${(props) => (props.$active ? "none" : "0 4px 12px rgba(239, 68, 68, 0.4)")};
  animation: ${(props) => (!props.$active ? pulse : "none")} 2s infinite ease-in-out;

  &:hover {
    transform: ${(props) => (props.$active ? "none" : "scale(1.05) translateY(-2px)")};
    box-shadow: ${(props) => (props.$active ? "none" : "0 6px 25px rgba(239, 68, 68, 0.6)")};
    filter: brightness(1.1);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
    pointer-events: none;
    animation: ${(props) => (!props.$active ? shimmer : "none")} 3s infinite;
  }

  .count {
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    backdrop-filter: blur(4px);
  }
`;

// Competitors Stories Row - Instagram-style story rings with ranking
const CompetitorsSection = styled.div`
  margin: 20px 0;
  padding: 0 20px;
`;

const SectionTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h3 {
    font-size: 16px;
    font-weight: 700;
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  span {
    font-size: 13px;
    color: #ef4444;
    cursor: pointer;
  }
`;

const StoriesScrollContainer = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 8px;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const StoryRing = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  
  &:hover {
    transform: scale(1.08) translateY(-5px);
  }
`;

const RingBorder = styled.div`
  width: 85px;
  height: 85px;
  border-radius: 50%;
  background: ${(props) => {
    if (props.$rank === 1) return "linear-gradient(135deg, #FFD700, #FFA500)";
    if (props.$rank === 2) return "linear-gradient(135deg, #C0C0C0, #A8A8A8)";
    if (props.$rank === 3) return "linear-gradient(135deg, #CD7F32, #B87333)";
    return "linear-gradient(135deg, #f09433, #e6683c, #dc2743)";
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px;
  position: relative;
  animation: ${(props) => props.$rank === 1 ? crownGlow : "none"} 2s infinite;
`;

const CompetitorAvatar = styled.img`
  width: 85px;
  height: 85px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #000000;
`;

const RankBadge = styled.div`
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${(props) => {
    if (props.$rank === 1) return "linear-gradient(135deg, #FFD700, #FFA500)";
    if (props.$rank === 2) return "linear-gradient(135deg, #C0C0C0, #A8A8A8)";
    if (props.$rank === 3) return "linear-gradient(135deg, #CD7F32, #B87333)";
    return "#ef4444";
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: ${(props) => (props.$rank <= 2 ? "#000" : "#fff")};
  border: 2px solid #000;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
`;

const CompetitorName = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #e5e7eb;
  text-align: center;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CompetitorStats = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  color: #9ca3af;
  text-align: center;
  
  svg {
    width: 10px;
    height: 10px;
  }
`;

const SupportCount = styled.span`
  color: #10b981;
  font-weight: 600;
`;

const StickyActionBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(10, 10, 10, 0.9);
  backdrop-filter: blur(25px);
  padding: 16px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  z-index: 10000;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
  transform: translateY(${(props) => (props.$visible ? "0" : "100%")});
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);

  @media (min-width: 768px) { display: none; }
`;

const TickerWrapper = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 8px 16px;
  margin-top: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  width: 100%;
`;

const TickerTrack = styled.div`
  display: flex;
  white-space: nowrap;
  animation: ${scrollTicker} 30s linear infinite;
  gap: 40px;
`;

const TickerItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 600;
  span { color: #dc2626; font-weight: 800; }
  strong { color: #10b981; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10001;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${(props) => props.$bg || "transparent"};
  color: ${(props) => props.$color || "white"};
  border: none;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
`;

// Support Register Modal for joining a campaign
const SupportRegisterModal = styled.div`
  background: #050505;
  border-radius: 24px;
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  animation: ${fadeInUp} 0.4s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
  padding: 32px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;

  /* Custom scrollbar for webkit browsers */
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 8px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 8px; }
`;

const FormTitle = styled.h3`
  font-size: 24px;
  font-weight: 800;
  color: white;
  margin-bottom: 8px;
  text-align: center;
`;

const FormSubtitle = styled.p`
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
  text-align: left;
  
  label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    color: #9ca3af;
    font-weight: 600;
  }
  
  input, select {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 14px;
    outline: none;
    transition: all 0.2s;
    
    &:focus {
      border-color: #ef4444;
      background: rgba(0, 0, 0, 0.4);
    }
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: none;
  border-radius: 16px;
  color: white;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    filter: brightness(1.05);
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
`;

// Rich Share Modal with enhanced message
const SharePromptModal = styled.div`
  background: radial-gradient(circle at top right, rgba(239, 68, 68, 0.15), transparent 60%), #050505;
  color: white;
  padding: 40px 32px;
  border-radius: 32px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(239, 68, 68, 0.1);
  width: 100%;
  max-width: 480px;
  position: relative;
  animation: ${fadeInUp} 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  h3 {
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 8px;
    color: white;
  }
  
  p {
    opacity: 0.7;
    margin-bottom: 24px;
    font-size: 14px;
  }
  
  .share-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .share-message-preview {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 20px;
    text-align: left;
    border-left: 3px solid #ef4444;
    
    .preview-text {
      font-size: 13px;
      color: #e5e7eb;
      line-height: 1.5;
    }
    
    .preview-link {
      font-size: 11px;
      color: #6b7280;
      margin-top: 8px;
      word-break: break-all;
    }
  }
`;

const SocialIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  width: 56px;
  height: 56px;
  color: white;
  transition: all 0.3s;
  background: ${props => props.$bg || "#2a2a3a"};
  
  &:hover {
    transform: scale(1.1);
    filter: brightness(1.1);
  }
`;

const AddStoryButton = styled.button`
  position: fixed;
  bottom: ${(props) => (props.$visible ? "100px" : "-80px")};
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 10px;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(220, 38, 38, 0.55);
  z-index: 99;
  transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  font-size: 12px;
  font-weight: 800;
  color: white;
  &:hover { transform: scale(1.06) translateY(-2px); }
`;

const ProfileCard = styled.div`
  position: relative;
  margin-top: -70px;
  padding: 0 20px;
  z-index: 5;
`;

const ProfileTopRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-direction: column;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
  align-self: flex-start;
`;

const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #000;
  background: #1a1a1a;
`;

const VerifiedIcon = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: ${(props) => (props.$verified ? "#10b981" : "#6b7280")};
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #000;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const LeaderName = styled.h1`
  font-size: 20px;
  font-weight: 800;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const LeaderMeta = styled.div`
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
  flex-wrap: wrap;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const StatChip = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 80px;
  padding: 0 12px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-right: none;
  }
  
  .stat-label {
    font-size: 10px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .stat-number {
    font-weight: 800;
    color: white;
    font-size: 18px;
    font-family: 'Inter', sans-serif;
    display: flex;
    align-items: baseline;
    gap: 2px;

    small {
      font-size: 10px;
      color: #9ca3af;
      font-weight: 500;
    }
  }

  .stat-trend {
    font-size: 9px;
    color: #10b981;
    display: flex;
    align-items: center;
    gap: 2px;
  }
`;

const TrendingBadge = styled.div`
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
  animation: ${glow} 2s infinite;
`;

const PositionBadge = styled.div`
  font-size: 9px;
  color: #9ca3af;
  text-align: center;
  margin-top: 2px;
`;

const ContentArea = styled.div`
  margin-top: 24px;
  padding-bottom: 100px;
`;

const Toast = styled.div`
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(12px);
  color: white;
  padding: 12px 24px;
  border-radius: 40px;
  z-index: 10001;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  animation: ${fadeIn} 0.3s ease;
`;

// ==================== Helper Functions ====================

const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const getLoggedInUserId = () => {
  try {
    const userData = localStorage.getItem("user_data") || localStorage.getItem("user_info");
    if (userData) return JSON.parse(userData).user_id || JSON.parse(userData).id;
    return null;
  } catch (e) { return null; }
};

const getLoggedInUser = () => {
  try {
    const userData = localStorage.getItem("user_data") || localStorage.getItem("user_info");
    if (userData) return JSON.parse(userData);
    return null;
  } catch (e) { return null; }
};

const normalizePosition = (pos) => {
  if (!pos) return "";
  const l = pos.toLowerCase();
  if (l.includes("deputy president")) return "DP";
  if (l.includes("governor")) return "Governor";
  if (l.includes("senator")) return "Senator";
  if (l.includes("mp")) return "MP";
  if (l.includes("mca")) return "MCA";
  return pos;
};

// ==================== MAIN COMPONENT ====================

const LeaderHeader = memo(({ leader, onBack }) => {
  const navigate = useNavigate();
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(getLoggedInUserId());
  const [currentUser, setCurrentUser] = useState(getLoggedInUser());
  const [scrolledPast, setScrolledPast] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [supportCount, setSupportCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [boostCount, setBoostCount] = useState(0);
  const [totalBoostAmount, setTotalBoostAmount] = useState(0);
  const [trendingScore, setTrendingScore] = useState(0);
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [showSupportRegisterModal, setShowSupportRegisterModal] = useState(false);
  const [actionBarVisible, setActionBarVisible] = useState(false);

  const handleCloseSharePrompt = () => {
    setShowSharePrompt(false);
    if (leader?.slug) {
      localStorage.setItem(`dismissed_share_${leader?.slug}`, Date.now().toString());
    }
  };

  // Support Form State
  const [supportForm, setSupportForm] = useState({
    name: "",
    email: "",
    phone: "",
    county: "",
    constituency: "",
    ward: "",
    password: ""
  });
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [supportFormError, setSupportFormError] = useState("");

  const handleSupportFormChange = (e) => {
    setSupportForm({ ...supportForm, [e.target.name]: e.target.value });
  };

  const submitSupportForm = async (e) => {
    e.preventDefault();
    setSupportFormError("");
    setIsSubmittingSupport(true);

    try {
      // 1. Register the user
      const registerRes = await api.post("/users/register", {
        real_name: supportForm.name,
        personal_email: supportForm.email,
        phone_number: supportForm.phone,
        county: supportForm.county,
        constituency: supportForm.constituency,
        ward: supportForm.ward,
        password: supportForm.password,
      });

      if (!registerRes.success) throw new Error(registerRes.message || "Failed to create account");

      // 2. Login the user to get token
      const loginRes = await api.post("/users/login", {
        identifier: supportForm.email,
        password: supportForm.password,
        remember_me: true
      });

      if (!loginRes.success) throw new Error(loginRes.message || "Failed to auto-login");

      // 3. Update local user state
      const userId = loginRes.user.user_id || loginRes.user.id;
      setCurrentUserId(userId);
      setCurrentUser(loginRes.user);

      // Persist auth state to localStorage so auto-join works for other candidates
      const token = loginRes.accessToken || loginRes.token;
      if (token) {
        localStorage.setItem("access_token", token);
        localStorage.setItem("token", token);
      }
      localStorage.setItem("user_data", JSON.stringify(loginRes.user));
      window.dispatchEvent(new Event("storage")); // Notify other components

      // 4. Record support for the leader
      if (leader?.leader_id) {
        await api.post(`/leaders/${leader.leader_id}/support`, { user_id: userId, status: true });
        setIsSupported(true);
        setSupportCount(prev => prev + 1);
        setShowSharePrompt(true);
        setToastMessage("You successfully joined the campaign! 🎉");
      }

      setShowSupportRegisterModal(false);
    } catch (error) {
      console.error("Support Registration Error:", error);
      setSupportFormError(error.message || "An error occurred during registration");
    } finally {
      setIsSubmittingSupport(false);
    }
  };
  const [competitors, setCompetitors] = useState([]);

  const dropdownRef = useRef(null);

  const tickerItems = [
    "Share this profile to boost visibility 🔥",
    "Join the campaign and make an impact 🚀",
    "Post an endorsement story today 📢",
    "Help this candidate reach more voters ✨",
  ];

  // Check authentication on mount and storage changes
  useEffect(() => {
    const checkAuth = () => {
      const userId = getLoggedInUserId();
      const user = getLoggedInUser();
      setCurrentUserId(userId);
      setCurrentUser(user);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    if (!leader?.slug) {
      console.warn("No slug provided for leader");
      return;
    }

    const fetchData = async () => {
      try {
        if (leader?.leader_id) {
          const userIdParam = currentUserId ? `?user_id=${currentUserId}` : '';
          const statsRes = await api.get(`/leaders/${leader.leader_id}/stats${userIdParam}`);
          if (statsRes.success && statsRes.data) {
            setSupportCount(statsRes.data.support_count || 0);
            setViewsCount(statsRes.data.views || 0);
            setBoostCount(statsRes.data.boost_count || 0);
            setTotalBoostAmount(statsRes.data.total_boost_amount || 0);
            setTrendingScore(statsRes.data.trending_score || 0);
            setIsSupported(statsRes.data.is_supporting || false);
          }
        }

        const competitorsRes = await api.get(`/leaders/slug/${leader.slug}/competitors`);
        if (competitorsRes.success && competitorsRes.data) {
          const sortedCompetitors = [...competitorsRes.data].sort((a, b) => {
            const scoreA = a.boost_score || 0;
            const scoreB = b.boost_score || 0;
            return scoreB - scoreA;
          });
          setCompetitors(sortedCompetitors);
        }
      } catch (err) {
        console.warn("Fetch failed", err);
      }
    };

    fetchData();
  }, [leader?.slug, leader?.leader_id]);

  useEffect(() => {
    if (!leader?.slug) return;

    const checkTimer = () => {
      if (isSupported || showSupportRegisterModal) return;

      const storageKey = `dismissed_share_${leader?.slug}`;
      const dismissedAt = localStorage.getItem(storageKey);

      if (dismissedAt) {
        const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;
        if (Date.now() - parseInt(dismissedAt, 10) < fiveDaysInMs) {
          return; // Skip showing if dismissed within 5 days
        }
      }

      setShowSharePrompt(true);
    };

    const timer = setTimeout(checkTimer, 15000);
    return () => clearTimeout(timer);
  }, [leader?.slug, isSupported, showSupportRegisterModal]);

  useEffect(() => {
    const handleScroll = () => {
      setActionBarVisible(window.scrollY > 300);
      setScrolledPast(window.scrollY > 280);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle support - requires authentication
  const handleSupportClick = () => {
    if (isSupported) return; // Completely disable if already joined
    if (!currentUserId) {
      setShowSupportRegisterModal(true);
      return;
    }
    handleSupport();
  };

  const handleSupport = async () => {
    if (!leader?.leader_id) return;
    if (isSupported) return; // Prevent un-joining, you can only join once!

    const nextStatus = true;
    setIsSupported(true);
    setSupportCount(prev => prev + 1);
    try {
      await api.post(`/leaders/${leader.leader_id}/support`, { user_id: currentUserId, status: true });
      setShowSharePrompt(true);
      setToastMessage("You joined the campaign! 🎉");
      setTimeout(() => setToastMessage(null), 2000);
    } catch (err) {
      console.error(err);
      setIsSupported(false);
      setSupportCount(prev => prev - 1);
    }
  };

  // Handle add story - requires authentication - redirect to register
  const handleAddStoryClick = () => {
    if (!currentUserId) {
      setShowSupportRegisterModal(true);
      return;
    }
    setShowAddStoryModal(true);
  };

  // Redirect to register page fallback
  const redirectToRegister = () => {
    setShowSupportRegisterModal(false);
    navigate("/register");
  };

  const handleBoostSuccess = () => {
    setToastMessage("Campaign boosted successfully! 🔥");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCompetitorClick = (competitor) => {
    const slugOrId = competitor.slug || competitor.leader_id || competitor.id;
    window.location.href = `/leader/${slugOrId}`;
  };

  const canonicalUrl = window.location.href;
  const shareImageUrl = buildImageUrl(leader?.image_url || leader?.primary_image);

  const getDynamicShareMessage = () => {
    const messages = [
      "🗳️ Make history! Stand with the leader who delivers.",
      "🔥 Momentum is building! Join the movement today.",
      "🚀 Action speaks louder! Support visionary leadership.",
      "⚡ Power to the people! Stand with a leader for all.",
      "🌟 Your voice matters! Help build a better community.",
      "📢 Speak up for change! Join the winning campaign.",
      "🤝 Unity is strength! Together we can achieve more."
    ];
    const day = new Date().getDay(); // 0-6
    return messages[day];
  };

  const getRichShareText = () => {
    const dynamicMsg = getDynamicShareMessage();
    return `🇰🇪 *VOTE ${leader?.name?.toUpperCase()}* 🇰🇪\n\n` +
      `${dynamicMsg}\n\n` +
      `👉 ${canonicalUrl}\n\n` +
      `#SiasaHub #Kenya2027`;
  };

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(getRichShareText())}`, "_blank");
    setShowShareDropdown(false);
    setShowSharePrompt(false);
  };

  const shareToTwitter = () => {
    const tweetText = `${shareTitle}\n\n${shareDescription}\n\nJoin me in supporting ${leader?.name}! ${canonicalUrl}\n#${leader?.name?.replace(/\s/g, '')} #SiasaHub`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, "_blank");
    setShowShareDropdown(false);
    setShowSharePrompt(false);
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}&quote=${encodeURIComponent(shareDescription)}`, "_blank");
    setShowShareDropdown(false);
    setShowSharePrompt(false);
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`, "_blank");
    setShowShareDropdown(false);
    setShowSharePrompt(false);
  };

  const handleNativeShare = async () => {
    const text = getRichShareText();

    if (navigator.share) {
      try {
        let filesArray = [];
        // Attempt to fetch and attach the image directly to the share
        if (shareImageUrl) {
          try {
            // Fix relative paths for fetching
            let fetchUrl = shareImageUrl;
            if (fetchUrl.startsWith('/')) {
              fetchUrl = window.location.origin + fetchUrl;
            }
            if (fetchUrl.startsWith('http')) {
              // Ensure we try to fetch as a blob from a remote server with correct cors
              // If it's a cross-origin request without CORS headers, it might fail.
              const response = await fetch(fetchUrl);
              const blob = await response.blob();
              const file = new File([blob], 'campaign_image.jpg', { type: blob.type });
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                filesArray = [file];
              }
            }
          } catch (e) {
            console.warn("Could not fetch image for native share, but we will share the text.", e);
          }
        }

        const shareData = {
          title: `${leader?.name} Campaign`,
          text: text,
        };

        if (filesArray.length > 0) {
          shareData.files = filesArray;
        }

        await navigator.share(shareData);
        setToastMessage("Shared successfully! 🎉");
      } catch (err) {
        console.error("Error with native share:", err);
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
    setShowShareDropdown(false);
    setShowSharePrompt(false);
  };

  const handleCopyLink = async () => {
    try {
      const text = getRichShareText();
      await navigator.clipboard.writeText(text);
      setToastMessage("Campaign message & link copied! 📋");
      setTimeout(() => setToastMessage(null), 2000);
      setShowShareDropdown(false);
      setShowSharePrompt(false);
    } catch (err) { console.error(err); }
  };

  const leaderImageUrl = buildImageUrl(leader?.image_url || leader?.primary_image);
  const isVerified = leader?.verification === 1 || leader?.verification === "verified";
  const displayViews = viewsCount > 0 ? viewsCount : (leader?.stats?.views || 0);
  const displaySupport = supportCount > 0 ? supportCount : (leader?.stats?.endorsements || 0);

  // Ensure shareTitle and shareDescription are defined for helmet
  const shareTitle = `${leader?.name} for ${normalizePosition(leader?.position)} | SiasaHub`;
  const shareDescription = `Join ${formatNumber(supportCount)} supporters backing ${leader?.name} for ${normalizePosition(leader?.position)}. Together, we can make a difference! 🇰🇪`;

  return (
    <PageContainer>
      <Helmet>
        <title>{shareTitle}</title>
        <meta name="description" content={shareDescription} />
        <meta property="og:title" content={shareTitle} />
        <meta property="og:description" content={shareDescription} />
        <meta property="og:image" content={shareImageUrl} />
        <meta property="og:image:secure_url" content={shareImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={shareTitle} />
        <meta name="twitter:description" content={shareDescription} />
        <meta name="twitter:image" content={shareImageUrl} />
      </Helmet>

      <HeroSection>
        <CoverImage $image={leaderImageUrl} />
        <TopNav>
          <IconButton onClick={onBack}><ArrowLeft size={20} /></IconButton>
        </TopNav>
      </HeroSection>

      <SideActions $visible={!scrolledPast} $scrolledPast={scrolledPast}>
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <ShareButton onClick={() => setShowShareDropdown(!showShareDropdown)}>
            <div className="share-icon"><Share2 size={18} /></div>
            <div className="share-text">Share</div>
          </ShareButton>
          {showShareDropdown && (
            <ShareDropdown>
              <ShareIconRow onClick={handleNativeShare}><Share2 size={16} /> Native Share</ShareIconRow>
              <ShareIconRow onClick={shareToTwitter}><Twitter size={16} /> X (Twitter)</ShareIconRow>
              <ShareIconRow onClick={shareToWhatsApp}><MessageCircle size={16} /> WhatsApp</ShareIconRow>
              <ShareIconRow onClick={shareToFacebook}><Facebook size={16} /> Facebook</ShareIconRow>
              <ShareIconRow onClick={shareToLinkedIn}><Linkedin size={16} /> LinkedIn</ShareIconRow>
              <ShareIconRow onClick={handleCopyLink}><Link2 size={16} /> Copy Message</ShareIconRow>
            </ShareDropdown>
          )}
        </div>
        <BoostButton onClick={() => setShowBoostModal(true)}>
          <div className="boost-icon"><TrendingUp size={18} /></div>
          <div className="boost-text">Boost</div>
        </BoostButton>
        <VerifiedBadge $verified={isVerified}>
          <div className="verified-icon">{isVerified ? <CheckCircle size={18} /> : <AlertCircle size={18} />}</div>
          <div className="verified-text">{isVerified ? "Verified" : "Pending"}</div>
        </VerifiedBadge>
      </SideActions>


      <StickyActionBar $visible={actionBarVisible}>
        <SupportButton
          $active={isSupported}
          onClick={handleSupportClick}
          style={{ flex: 1, cursor: isSupported ? 'default' : 'pointer', opacity: isSupported ? 0.8 : 1 }}
        >
          {isSupported ? <CheckCircle size={18} /> : <TrendingUp size={18} />}
          {isSupported ? "JOINED" : "JOIN CAMPAIGN"}
          {displaySupport > 0 && <span className="count">{formatNumber(displaySupport)}</span>}
        </SupportButton>
        <ActionButton $bg="rgba(255, 255, 255, 0.1)" onClick={() => setShowSharePrompt(true)} style={{ width: 56, height: 56, borderRadius: 12, justifyContent: 'center' }}>
          <Share2 size={22} />
        </ActionButton>
      </StickyActionBar>

      <ProfileCard>
        <ProfileTopRow>
          <AvatarWrapper>
            <Avatar src={leaderImageUrl} alt={leader?.name} />
            <VerifiedIcon $verified={isVerified}><CheckCircle size={14} color="white" /></VerifiedIcon>
          </AvatarWrapper>
          <ProfileInfo>
            <LeaderName>
              {leader?.name} {isVerified && <CheckCircle size={16} color="#10b981" />}
            </LeaderName>
            {trendingScore > 100 && (
              <TrendingBadge>
                <Flame size={12} fill="white" /> TRENDING
              </TrendingBadge>
            )}
            <LeaderMeta>
              <span><Trophy size={14} /> {normalizePosition(leader?.position)}</span>
              <span><MapPin size={14} /> {leader?.county}</span>
              <span><Users size={14} /> {leader?.party || "Independent"}</span>
            </LeaderMeta>

            <StatsRow>
              <StatChip>
                <div className="stat-label"><EyeIcon size={12} /> Reach</div>
                <div className="stat-number">{formatNumber(displayViews)}</div>
              </StatChip>
              <StatChip>
                <div className="stat-label"><TrendingUp size={12} /> Boosts</div>
                <div className="stat-number">{formatNumber(boostCount)}</div>
              </StatChip>
              <StatChip>
                <div className="stat-label"><Sparkles size={12} /> Raised</div>
                <div className="stat-number"><small>KES</small> {formatNumber(totalBoostAmount)}</div>
              </StatChip>
              <StatChip>
                <div className="stat-label"><Users size={12} /> Supporters</div>
                <div className="stat-number">{formatNumber(displaySupport)}</div>
                <div className="stat-trend"><TrendingUp size={10} /> Live</div>
              </StatChip>
            </StatsRow>

            <div style={{ marginTop: 16, marginBottom: 16 }}>
              <SupportButton
                $active={isSupported}
                onClick={handleSupportClick}
                style={{
                  width: 'fit-content',
                  padding: '10px 24px',
                  borderRadius: '12px',
                  cursor: isSupported ? 'default' : 'pointer',
                  opacity: isSupported ? 0.8 : 1
                }}
              >
                {isSupported ? <CheckCircle size={18} /> : <TrendingUp size={18} />}
                {isSupported ? "JOINED CAMPAIGN" : "JOIN CAMPAIGN"}
              </SupportButton>
            </div>

            <TickerWrapper>
              <TickerTrack>
                {tickerItems.concat(tickerItems).map((text, idx) => (
                  <TickerItem key={idx}>
                    {text}
                  </TickerItem>
                ))}
              </TickerTrack>
            </TickerWrapper>
          </ProfileInfo>
        </ProfileTopRow>
      </ProfileCard>

      {/* Competitors Section */}
      {competitors.length > 0 && (
        <CompetitorsSection>
          <SectionTitle>
            <h3>
              <Trophy size={16} />
              Top Candidates for {normalizePosition(leader?.position)}
            </h3>
            <span>See all →</span>
          </SectionTitle>
          <StoriesScrollContainer>
            {competitors.map((competitor, index) => {
              const rank = index + 1;
              return (
                <StoryRing
                  key={competitor.slug || competitor.leader_id || competitor.id}
                  onClick={() => handleCompetitorClick(competitor)}
                >
                  <RingBorder $rank={rank}>
                    <CompetitorAvatar
                      src={buildImageUrl(competitor.image_url) || "https://via.placeholder.com/74"}
                      alt={competitor.name}
                    />
                    <RankBadge $rank={rank}>
                      {rank === 1 ? <Crown size={16} fill="#FFD700" /> : rank === 2 ? <Medal size={14} /> : rank === 3 ? <Star size={12} fill="#CD7F32" /> : rank}
                    </RankBadge>
                  </RingBorder>
                  <CompetitorName>{competitor.name?.split(" ")[0] || competitor.name}</CompetitorName>
                  <CompetitorStats>
                    {competitor.endorsement_count > 0 && (
                      <>
                        <Heart size={8} />
                        <SupportCount>{formatNumber(competitor.endorsement_count)}</SupportCount>
                      </>
                    )}
                  </CompetitorStats>
                  <PositionBadge>{competitor.party || "Independent"}</PositionBadge>
                </StoryRing>
              );
            })}
          </StoriesScrollContainer>
        </CompetitorsSection>
      )}

      <ContentArea>
        <EndorsementStories
          leaderId={leader?.leader_id}
          currentUser={{ name: currentUser?.name || "You", id: currentUserId }}
          onBoostSuccess={handleBoostSuccess}
          requireAuth={true}
          onAuthRequired={() => setShowSupportRegisterModal(true)}
        />
      </ContentArea>

      {/* Rich Share Prompt Modal */}
      {showSharePrompt && (
        <ModalOverlay onClick={handleCloseSharePrompt}>
          <SharePromptModal onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={handleCloseSharePrompt}><X size={18} /></CloseButton>
            <div>
              <Heart size={48} color="#ef4444" fill="#ef4444" style={{ marginBottom: 12 }} />
              <h3>Support {leader?.name?.split(" ")[0]}!</h3>
              <p>Share this campaign with your network</p>

              <div className="share-message-preview">
                <div className="preview-text">
                  🇰🇪 <strong>VOTE {leader?.name?.toUpperCase()} FOR {normalizePosition(leader?.position)?.toUpperCase()}</strong> 🇰🇪
                  <br />
                  "{leader?.slogan || "Together we rise, together we win!"}"
                  <br />
                  📊 {formatNumber(supportCount)} supporters already joined!
                </div>
                <div className="preview-link">{canonicalUrl}</div>
              </div>

              <div className="share-grid">
                <div className="social-item">
                  <SocialIconButton onClick={handleNativeShare} $bg="#3b82f6"><Share2 size={24} /></SocialIconButton>
                  <span>Share</span>
                </div>
                <div className="social-item">
                  <SocialIconButton onClick={shareToWhatsApp} $bg="#25D366"><MessageCircle size={24} /></SocialIconButton>
                  <span>WhatsApp</span>
                </div>
                <div className="social-item">
                  <SocialIconButton onClick={shareToFacebook} $bg="#1877F2"><Facebook size={24} /></SocialIconButton>
                  <span>Facebook</span>
                </div>
                <div className="social-item">
                  <SocialIconButton onClick={shareToTwitter} $bg="#000000"><Twitter size={24} /></SocialIconButton>
                  <span>X</span>
                </div>
              </div>

              <button onClick={handleCopyLink} style={{ width: "100%", padding: "14px", borderRadius: "16px", background: "#ef4444", color: "white", border: "none", fontWeight: "bold", cursor: "pointer" }}>
                📋 COPY CAMPAIGN MESSAGE
              </button>
            </div>
          </SharePromptModal>
        </ModalOverlay>
      )}

      {/* Support Register Modal */}
      {showSupportRegisterModal && (
        <ModalOverlay onClick={() => setShowSupportRegisterModal(false)}>
          <SupportRegisterModal onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowSupportRegisterModal(false)}><X size={18} /></CloseButton>

            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <UserPlus size={48} color="#ef4444" style={{ marginBottom: "8px" }} />
              <FormTitle>Join {leader?.name?.split(" ")[0]}'s Campaign!</FormTitle>
              <FormSubtitle>Sign up to officially become a supporter and get campaign updates.</FormSubtitle>
            </div>

            {supportFormError && (
              <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "10px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", textAlign: "center" }}>
                {supportFormError}
              </div>
            )}

            <form onSubmit={submitSupportForm}>
              <FormGroup>
                <label>Full Name</label>
                <input type="text" name="name" value={supportForm.name} onChange={handleSupportFormChange} placeholder="John Doe" required minLength="3" />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <label>Email Address</label>
                  <input type="email" name="email" value={supportForm.email} onChange={handleSupportFormChange} placeholder="john@example.com" required />
                </FormGroup>
                <FormGroup>
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={supportForm.phone} onChange={handleSupportFormChange} placeholder="0712345678" required />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <label>County</label>
                  <input type="text" name="county" value={supportForm.county} onChange={handleSupportFormChange} placeholder="e.g. Nairobi" required />
                </FormGroup>
                <FormGroup>
                  <label>Constituency</label>
                  <input type="text" name="constituency" value={supportForm.constituency} onChange={handleSupportFormChange} placeholder="e.g. Westlands" required />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <label>Ward</label>
                <input type="text" name="ward" value={supportForm.ward} onChange={handleSupportFormChange} placeholder="e.g. Parklands" required />
              </FormGroup>

              <FormGroup>
                <label>Create Password</label>
                <input type="password" name="password" value={supportForm.password} onChange={handleSupportFormChange} placeholder="••••••••" required minLength="6" />
              </FormGroup>

              <SubmitButton type="submit" disabled={isSubmittingSupport}>
                {isSubmittingSupport ? "JOINING..." : "JOIN CAMPAIGN NOW"}
              </SubmitButton>
            </form>

            <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "16px", textAlign: "center" }}>
              Already have an account? <span onClick={redirectToRegister} style={{ color: "#ef4444", cursor: "pointer" }}>Login instead</span>
            </p>
          </SupportRegisterModal>
        </ModalOverlay>
      )}

      <BoostModal isOpen={showBoostModal} onClose={() => setShowBoostModal(false)} onBoost={handleBoostSuccess} targetName={leader?.name} targetId={leader?.slug} targetType="leader" userId={currentUserId} />
      <AddStoryModal
        isOpen={showAddStoryModal}
        onClose={() => setShowAddStoryModal(false)}
        leader={leader}
        onComplete={handleBoostSuccess}
        currentUserId={currentUserId}
      />
      
      <FloatingBoostAction onClick={() => setShowBoostModal(true)}>
        <Flame size={20} />
        BOOST {leader?.name?.split(" ")[0]?.toUpperCase()}
      </FloatingBoostAction>

      {toastMessage && <Toast><Sparkles size={14} /> {toastMessage}</Toast>}
    </PageContainer>
  );
});

LeaderHeader.displayName = "LeaderHeader";
export default LeaderHeader;