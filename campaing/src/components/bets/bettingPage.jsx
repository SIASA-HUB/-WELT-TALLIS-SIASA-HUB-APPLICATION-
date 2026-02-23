import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Trophy, Clock, Wallet, Trash2, 
  ChevronRight, Zap, Award, Flame, Calendar,
  TrendingUp, Users, MessageSquare, Target, Crown,
  BarChart2, Shield, Globe, Mic, Star, DollarSign,
  TrendingDown, CheckCircle, XCircle, AlertCircle,
  Home, Menu, Bell, User, LogOut, Filter, ChevronDown,
  Percent, Hash, Flag, Eye, EyeOff, TrendingUp as TrendingUpIcon,
  Phone, Mail, Lock, Settings, HelpCircle, Share2, Download,
  RefreshCw, Copy, ExternalLink, BookOpen, TrendingUp as ArrowUp,
  TrendingDown as ArrowDown, Users as Group, Heart, Volume2,
  Grid, List, Maximize2, Minimize2
} from 'lucide-react';

// Enhanced Color Palette
const THEME = {
  darkBg: '#0A101A',
  cardBg: '#141C28',
  accent: '#00DC82',         // Bright green for success
  accent2: '#FF3B5C',        // Red for opposition
  accent3: '#3B82F6',        // Blue for trending
  accent4: '#8B5CF6',        // Purple for premium
  textMain: '#FFFFFF',
  textDim: '#94A3B8',
  textFaint: '#64748B',
  border: '#1E293B',
  buttonBg: '#1E293B',
  buttonHover: '#334155',
  success: '#00DC82',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  partyColors: {
    'UDA': '#FF0000',
    'ODM': '#008000',
    'WIPER': '#8B5CF6',
    'FORD-KENYA': '#10B981',
    'NARC-KENYA': '#EC4899',
    'INDEPENDENT': '#6B7280',
    'JUBILEE': '#FF6B6B',
    'ANC': '#3B82F6',
    'AZIMIO': '#00A86B',
    'KENYA KWANZA': '#DC2626',
    'PAA': '#F59E0B',
    'DP': '#8B5CF6'
  },
  gradients: {
    primary: 'linear-gradient(135deg, #00DC82 0%, #00C851 100%)',
    secondary: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    danger: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    warning: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    premium: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
  }
};

// Global Styles
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    background: ${THEME.darkBg};
    color: ${THEME.textMain};
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow-x: hidden;
  }
  
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: ${THEME.darkBg};
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${THEME.accent};
    border-radius: 4px;
  }
  
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

// Animations
const slideIn = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(0, 220, 130, 0.3); }
  50% { box-shadow: 0 0 40px rgba(0, 220, 130, 0.6); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
`;

// Styled Components
const Page = styled.div`
  background: ${THEME.darkBg};
  min-height: 100vh;
  color: ${THEME.textMain};
  font-family: 'Inter', sans-serif;
  padding-bottom: 100px;
`;

// Enhanced Top Navigation
const TopNav = styled.div`
  background: ${THEME.cardBg};
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 3px solid ${THEME.accent};
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  
  .logo-icon {
    width: 40px;
    height: 40px;
    background: ${THEME.gradients.primary};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 1.5rem;
    animation: ${float} 3s ease-in-out infinite;
  }
  
  .logo-text {
    font-weight: 900;
    font-size: 1.8rem;
    background: ${THEME.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .logo-tagline {
    font-size: 0.75rem;
    color: ${THEME.textDim};
    margin-top: 2px;
    letter-spacing: 1px;
  }
`;

const NavControls = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  
  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const BalanceBox = styled.div`
  background: linear-gradient(135deg, ${THEME.buttonBg}, #1A2332);
  padding: 10px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 2px solid ${THEME.border};
  min-width: 180px;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 220, 130, 0.1), transparent);
    transition: 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 220, 130, 0.2);
    border-color: ${THEME.accent};
  }
  
  @media (max-width: 768px) {
    min-width: auto;
    padding: 8px 12px;
  }
`;

const NotificationBadge = styled.div`
  position: relative;
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${THEME.buttonBg};
  }
  
  .badge {
    position: absolute;
    top: 0;
    right: 0;
    background: ${THEME.danger};
    color: white;
    font-size: 0.7rem;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
  }
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 20px 24px;
  background: ${THEME.cardBg};
  border-bottom: 1px solid ${THEME.border};
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    padding: 16px;
    gap: 12px;
  }
`;

const StatCard = styled.div`
  background: ${THEME.buttonBg};
  padding: 16px;
  border-radius: 16px;
  border: 1px solid ${THEME.border};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    border-color: ${THEME.accent};
  }
  
  .stat-value {
    font-size: 1.8rem;
    font-weight: 900;
    color: ${THEME.accent};
    margin: 8px 0;
  }
  
  .stat-label {
    font-size: 0.85rem;
    color: ${THEME.textDim};
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const CategoryBar = styled.div`
  display: flex;
  overflow-x: auto;
  background: ${THEME.cardBg};
  padding: 16px 24px;
  gap: 12px;
  position: sticky;
  top: 60px;
  z-index: 90;
  border-bottom: 1px solid ${THEME.border};
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const CategoryTab = styled.div`
  background: ${props => props.active ? THEME.gradients.primary : THEME.buttonBg};
  color: ${props => props.active ? '#000' : THEME.textMain};
  padding: 12px 24px;
  border-radius: 30px;
  white-space: nowrap;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.active ? THEME.accent : 'transparent'};
  min-width: fit-content;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }
  
  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.85rem;
  }
`;

const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  max-width: 1400px;
  margin: 0 auto;
  gap: 24px;
  padding: 24px;
  margin-top: 16px;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 400px;
  }
  
  @media (max-width: 768px) {
    padding: 16px;
    gap: 16px;
  }
`;

const MarketsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MarketCard = styled.div`
  background: ${THEME.cardBg};
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid ${THEME.border};
  margin-bottom: 8px;
  animation: ${slideIn} 0.5s ease-out;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
    border-color: ${THEME.accent};
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.gradient || THEME.gradients.primary};
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const MarketHeader = styled.div`
  background: #1A2332;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${THEME.border};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const MarketTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 800;
  font-size: 1.1rem;
  
  .market-badge {
    background: ${THEME.accent}20;
    color: ${THEME.accent};
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
  }
`;

const MarketTime = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: ${THEME.accent};
  font-weight: 600;
  background: ${THEME.accent}10;
  padding: 8px 16px;
  border-radius: 20px;
`;

const MarketBody = styled.div`
  padding: 24px;
`;

const TeamsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${THEME.border};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const TeamCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  background: ${THEME.buttonBg};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(${props => props.reversed ? '4px' : '-4px'});
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }
  
  @media (max-width: 768px) {
    flex-direction: ${props => props.reversed ? 'row-reverse' : 'row'};
    text-align: ${props => props.reversed ? 'right' : 'left'};
  }
`;

const TeamLogo = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: ${props => props.gradient || THEME.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 900;
  color: white;
  border: 3px solid ${THEME.border};
  flex-shrink: 0;
`;

const TeamInfo = styled.div`
  flex: 1;
`;

const TeamName = styled.div`
  font-weight: 800;
  font-size: 1.2rem;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  .party-badge {
    background: ${props => props.partyColor || THEME.accent};
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 700;
  }
`;

const TeamStats = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: ${THEME.textDim};
  flex-wrap: wrap;
`;

const StatBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: ${props => props.color || THEME.accent}20;
  color: ${props => props.color || THEME.accent};
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const VsBadge = styled.div`
  padding: 16px;
  background: ${THEME.buttonBg};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.2rem;
  color: ${THEME.accent};
  border: 2px solid ${THEME.border};
  
  @media (max-width: 768px) {
    order: -1;
    margin: 0 auto;
  }
`;

const OddsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 24px;
`;

const OddsBox = styled.button`
  background: ${props => props.selected ? THEME.gradients.primary : THEME.buttonBg};
  color: ${props => props.selected ? '#000' : THEME.textMain};
  border: 2px solid ${props => props.selected ? THEME.accent : THEME.border};
  border-radius: 12px;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 900;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent 30%, rgba(255, 255, 255, 0.1) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
  
  .label {
    font-size: 0.8rem;
    opacity: 0.9;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    z-index: 1;
  }
  
  .val {
    font-size: 1.4rem;
    z-index: 1;
  }
  
  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const BetSlip = styled.div`
  background: ${THEME.cardBg};
  border-radius: 24px;
  border: 2px solid ${THEME.border};
  position: sticky;
  top: 140px;
  overflow: hidden;
  animation: ${slideIn} 0.5s ease-out 0.2s both;
  max-height: calc(100vh - 160px);
  display: flex;
  flex-direction: column;
  
  @media (max-width: 1024px) {
    position: relative;
    top: 0;
  }
`;

const SlipHeader = styled.div`
  background: linear-gradient(135deg, #1A2332, #141C28);
  padding: 24px;
  font-weight: 900;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 3px solid ${THEME.accent};
  font-size: 1.2rem;
  
  .count-badge {
    background: ${THEME.gradients.primary};
    color: #000;
    padding: 8px 20px;
    border-radius: 30px;
    font-size: 1rem;
    font-weight: 900;
  }
`;

const SlipBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
`;

const EmptySlip = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${THEME.textDim};
  
  svg {
    width: 80px;
    height: 80px;
    margin-bottom: 20px;
    opacity: 0.5;
  }
  
  .title {
    font-weight: 800;
    font-size: 1.2rem;
    margin-bottom: 12px;
  }
  
  .description {
    font-size: 0.95rem;
    line-height: 1.5;
  }
`;

const BetItem = styled.div`
  background: ${THEME.buttonBg};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  border: 2px solid ${THEME.border};
  transition: all 0.3s ease;
  animation: ${slideIn} 0.3s ease-out;
  
  &:hover {
    border-color: ${THEME.accent};
    transform: translateX(8px);
  }
`;

const BetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const BetTitle = styled.div`
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.4;
  flex: 1;
  padding-right: 12px;
`;

const RemoveBtn = styled.button`
  background: ${THEME.danger}20;
  color: ${THEME.danger};
  border: 2px solid ${THEME.danger}30;
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  flex-shrink: 0;
  
  &:hover {
    background: ${THEME.gradients.danger};
    color: white;
    transform: scale(1.05);
  }
`;

const BetDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 0.9rem;
  
  .odds {
    font-weight: 900;
    font-size: 1.3rem;
    background: ${THEME.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const StakeInput = styled.div`
  background: ${THEME.darkBg};
  border: 2px solid ${THEME.border};
  border-radius: 16px;
  padding: 20px;
  margin-top: 24px;
  transition: all 0.3s ease;
  
  &:focus-within {
    border-color: ${THEME.accent};
    box-shadow: 0 0 0 3px ${THEME.accent}20;
  }
`;

const InputLabel = styled.div`
  font-size: 0.9rem;
  color: ${THEME.textDim};
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .balance {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 20px;
  
  .currency {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-weight: 700;
    color: ${THEME.accent};
  }
  
  input {
    width: 100%;
    background: ${THEME.buttonBg};
    border: 2px solid ${THEME.border};
    color: ${THEME.textMain};
    font-size: 2rem;
    font-weight: 900;
    outline: none;
    padding: 16px 16px 16px 60px;
    border-radius: 12px;
    text-align: center;
    transition: all 0.3s ease;
    
    &:focus {
      border-color: ${THEME.accent};
      box-shadow: 0 0 0 3px ${THEME.accent}20;
    }
  }
`;

const QuickStakeButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-top: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const QuickButton = styled.button`
  background: ${THEME.buttonBg};
  color: ${THEME.textMain};
  border: 2px solid ${THEME.border};
  border-radius: 12px;
  padding: 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  
  &:hover {
    background: ${THEME.buttonHover};
    border-color: ${THEME.accent};
    transform: translateY(-2px);
  }
  
  &.active {
    background: ${THEME.gradients.primary};
    color: #000;
    border-color: ${THEME.accent};
    font-weight: 800;
  }
`;

const PlaceBetButton = styled.button`
  width: 100%;
  background: ${props => props.disabled ? THEME.buttonBg : THEME.gradients.primary};
  color: ${props => props.disabled ? THEME.textDim : '#000'};
  border: none;
  padding: 24px;
  border-radius: 16px;
  font-weight: 900;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 1.2rem;
  transition: all 0.3s ease;
  animation: ${props => props.hasBets ? glow : 'none'} 2s infinite;
  position: relative;
  overflow: hidden;
  margin-top: 24px;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: 0.5s;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 220, 130, 0.4);
    
    &::after {
      left: 100%;
    }
  }
  
  &:disabled {
    opacity: 0.6;
  }
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 16px 0;
  font-size: 0.95rem;
  padding: 12px 0;
  
  &.total {
    font-size: 1.3rem;
    font-weight: 900;
    color: ${THEME.accent};
    margin-top: 24px;
    padding-top: 24px;
    border-top: 2px solid ${THEME.border};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const LiveBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: ${THEME.gradients.danger};
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: ${pulse} 2s infinite;
  z-index: 2;
`;

// Enhanced dummy data
const MARKETS = [
  {
    id: 1,
    category: 'TRENDING NOW',
    title: '2027 Presidential Election Winner',
    time: 'Closes in 45 days',
    icon: TrendingUp,
    gradient: THEME.gradients.primary,
    live: true,
    teamA: {
      name: 'William Ruto',
      party: 'UDA',
      logo: 'WR',
      gradient: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
      stats: 'Current President',
      trend: '+5.2%',
      supporters: '12.4M',
      color: THEME.partyColors.UDA
    },
    teamB: {
      name: 'Raila Odinga',
      party: 'ODM',
      logo: 'RO',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      stats: 'Former Prime Minister',
      trend: '+3.8%',
      supporters: '10.8M',
      color: THEME.partyColors.ODM
    },
    odds: {
      win: { label: 'Ruto Wins', value: 1.85 },
      draw: { label: 'Coalition Govt', value: 4.20 },
      lose: { label: 'Raila Wins', value: 2.75 }
    }
  },
  {
    id: 2,
    category: 'RUNNING MATE',
    title: 'Ruto\'s 2027 Deputy President',
    time: 'Closes in 30 days',
    icon: Users,
    gradient: THEME.gradients.secondary,
    teamA: {
      name: 'Rigathi Gachagua',
      party: 'UDA',
      logo: 'RG',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      stats: 'Current Deputy',
      trend: '+65%',
      supporters: '8.2M',
      color: THEME.partyColors.UDA
    },
    teamB: {
      name: 'Kithure Kindiki',
      party: 'UDA',
      logo: 'KK',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      stats: 'Interior CS',
      trend: '+28%',
      supporters: '6.5M',
      color: THEME.partyColors.UDA
    },
    odds: {
      win: { label: 'Gachagua', value: 1.45 },
      draw: { label: 'Wildcard Pick', value: 5.00 },
      lose: { label: 'Kindiki', value: 3.80 }
    }
  },
  {
    id: 3,
    category: 'COALITION FORMATION',
    title: 'Next Major Coalition Announcement',
    time: 'Closes in 15 days',
    icon: Group,
    gradient: THEME.gradients.premium,
    live: true,
    teamA: {
      name: 'Kenya Kwanza',
      logo: 'KK',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      stats: 'Ruto-led Coalition',
      trend: '+42%',
      members: '12 Parties',
      color: '#F59E0B'
    },
    teamB: {
      name: 'Azimio La Umoja',
      logo: 'AZ',
      gradient: 'linear-gradient(135deg, #00A86B 0%, #059669 100%)',
      stats: 'Raila-led Coalition',
      trend: '+38%',
      members: '8 Parties',
      color: '#00A86B'
    },
    odds: {
      win: { label: 'KK Expands', value: 2.10 },
      draw: { label: 'No Change', value: 3.50 },
      lose: { label: 'Azimio Expands', value: 2.90 }
    }
  },
  {
    id: 4,
    category: 'POLITICAL POLLS',
    title: 'Next Opinion Poll Leader',
    time: 'Closes Tomorrow 23:59',
    icon: BarChart2,
    gradient: THEME.gradients.warning,
    teamA: {
      name: 'UDA Coalition',
      logo: 'UC',
      gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      stats: 'Current Lead: +5.2%',
      trend: '+2.1%',
      pollster: 'IPSOS',
      color: THEME.partyColors.UDA
    },
    teamB: {
      name: 'Azimio Coalition',
      logo: 'AC',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      stats: 'Current: -2.1%',
      trend: '-0.8%',
      pollster: 'TIFA',
      color: THEME.partyColors.ODM
    },
    odds: {
      win: { label: 'UDA Leads', value: 1.65 },
      draw: { label: 'Statistical Tie', value: 4.50 },
      lose: { label: 'Azimio Leads', value: 2.80 }
    }
  },
  {
    id: 5,
    category: 'MANIFESTO IMPACT',
    title: 'Most Impactful Policy Proposal',
    time: 'Closes in 5 days',
    icon: Target,
    gradient: THEME.gradients.info,
    teamA: {
      name: 'Digital Economy',
      logo: 'DE',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      stats: 'Youth-focused',
      impact: '85% Approval',
      sector: 'Technology',
      color: '#8B5CF6'
    },
    teamB: {
      name: 'Agriculture Reform',
      logo: 'AR',
      gradient: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
      stats: 'Rural-focused',
      impact: '78% Approval',
      sector: 'Agriculture',
      color: '#34C759'
    },
    odds: {
      win: { label: 'Digital Wins', value: 2.25 },
      draw: { label: 'Equal Impact', value: 3.75 },
      lose: { label: 'Agriculture Wins', value: 2.80 }
    }
  },
  {
    id: 6,
    category: 'INTERNATIONAL VISIT',
    title: 'Next Major International Visit',
    time: 'Closes Next Week',
    icon: Globe,
    gradient: THEME.gradients.premium,
    teamA: {
      name: 'United States',
      logo: 'US',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      stats: 'Strategic Partner',
      probability: 'High',
      purpose: 'Trade Talks',
      color: '#3B82F6'
    },
    teamB: {
      name: 'China',
      logo: 'CN',
      gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      stats: 'Major Investor',
      probability: 'Medium',
      purpose: 'Infrastructure',
      color: '#EF4444'
    },
    odds: {
      win: { label: 'US Visit', value: 2.30 },
      draw: { label: 'Both Visits', value: 4.20 },
      lose: { label: 'China Visit', value: 2.90 }
    }
  }
];

const QUICK_STAKES = [100, 500, 1000, 2500, 5000];
const CATEGORIES = [
  { id: 'ALL', label: 'All Markets', icon: Grid },
  { id: 'TRENDING', label: 'Trending', icon: TrendingUpIcon },
  { id: 'RUNNING MATE', label: 'Running Mate', icon: Users },
  { id: 'COALITION', label: 'Coalitions', icon: Group },
  { id: 'POLLS', label: 'Polls', icon: BarChart2 },
  { id: 'DEBATES', label: 'Debates', icon: Mic },
  { id: 'MANIFESTO', label: 'Manifesto', icon: Target },
  { id: 'INTERNATIONAL', label: 'International', icon: Globe }
];

const BettingPage  = () => {
  const navigate = useNavigate();
  const [selectedBets, setSelectedBets] = useState({});
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [stake, setStake] = useState(500);
  const [userBalance, setUserBalance] = useState(15250);
  const [showBalance, setShowBalance] = useState(true);
  const [notifications, setNotifications] = useState(3);
  const [userStats, setUserStats] = useState({
    winRate: 87,
    betsWon: 42,
    totalWon: 25800,
    liveBets: 3,
    streak: 8,
    accuracy: 92
  });

  const handleSelectBet = (marketId, pick, odds, label) => {
    const key = `${marketId}-${pick}`;
    
    if (selectedBets[key]) {
      const newBets = { ...selectedBets };
      delete newBets[key];
      setSelectedBets(newBets);
    } else {
      const market = MARKETS.find(m => m.id === marketId);
      setSelectedBets({
        ...selectedBets,
        [key]: {
          id: marketId,
          marketTitle: market.title,
          pick: pick,
          label: label,
          odds: odds,
          time: market.time,
          category: market.category
        }
      });
    }
  };

  const removeBet = (betKey) => {
    const newBets = { ...selectedBets };
    delete newBets[betKey];
    setSelectedBets(newBets);
  };

  const calculateTotalOdds = () => {
    const odds = Object.values(selectedBets).reduce((total, bet) => total * bet.odds, 1);
    return odds.toFixed(2);
  };

  const calculatePotentialWin = () => {
    return (stake * calculateTotalOdds()).toFixed(2);
  };

  const placeBet = () => {
    if (Object.keys(selectedBets).length === 0) {
      alert('📢 Please select at least one bet!');
      return;
    }

    if (stake < 100) {
      alert('💰 Minimum stake is KES 100');
      return;
    }

    if (stake > userBalance) {
      alert('❌ Insufficient balance!');
      return;
    }

    // Place bet logic
    setUserBalance(prev => prev - stake);
    
    // Update stats
    setUserStats(prev => ({
      ...prev,
      liveBets: prev.liveBets + 1
    }));
    
    alert(`✅ Bet placed successfully!\n\n📊 Details:\n• Stake: KES ${stake}\n• Potential Win: KES ${calculatePotentialWin()}\n• Total Odds: ${calculateTotalOdds()}x\n\nGood luck! 🍀`);
    
    // Clear selections
    setSelectedBets({});
  };

  const filteredMarkets = useMemo(() => {
    if (activeCategory === 'ALL') return MARKETS;
    return MARKETS.filter(market => market.category.includes(activeCategory));
  }, [activeCategory]);

  const quickAddStake = (amount) => {
    setStake(amount);
  };

  const addToStake = () => {
    setStake(prev => prev + 100);
  };

  const deductFromStake = () => {
    setStake(prev => Math.max(100, prev - 100));
  };

  const clearBetslip = () => {
    if (Object.keys(selectedBets).length > 0) {
      if (window.confirm('Are you sure you want to clear all bets?')) {
        setSelectedBets({});
      }
    }
  };

  return (
    <>
      <GlobalStyle />
      <Page>
        {/* Top Navigation */}
        <TopNav>
          <Logo onClick={() => navigate('/')}>
            <div className="logo-icon">P</div>
            <div>
              <div className="logo-text">POLITIKA</div>
              <div className="logo-tagline">POLITICAL SPORTSBOOK</div>
            </div>
          </Logo>
          
          <NavControls>
            <NotificationBadge>
              <Bell size={22} />
              {notifications > 0 && <div className="badge">{notifications}</div>}
            </NotificationBadge>
            
            <BalanceBox onClick={() => setShowBalance(!showBalance)}>
              <Wallet size={22} color={THEME.accent} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: THEME.textDim }}>BALANCE</div>
                <div style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '0.5px' }}>
                  {showBalance ? `KES ${userBalance.toLocaleString()}` : '••••••••'}
                </div>
              </div>
            </BalanceBox>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: THEME.buttonBg,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <User size={20} />
              <span style={{ fontWeight: 600 }}>Profile</span>
              <ChevronDown size={16} />
            </div>
          </NavControls>
        </TopNav>

        {/* Quick Stats */}
        <QuickStats>
          <StatCard>
            <div className="stat-label">
              <Trophy size={16} /> WIN RATE
            </div>
            <div className="stat-value">{userStats.winRate}%</div>
            <div style={{ fontSize: '0.8rem', color: THEME.success }}>
              <TrendingUp size={12} /> +2.4% this week
            </div>
          </StatCard>
          
          <StatCard>
            <div className="stat-label">
              <Award size={16} /> BETS WON
            </div>
            <div className="stat-value">{userStats.betsWon}</div>
            <div style={{ fontSize: '0.8rem', color: THEME.warning }}>
              <Flame size={12} /> {userStats.streak} day streak
            </div>
          </StatCard>
          
          <StatCard>
            <div className="stat-label">
              <DollarSign size={16} /> TOTAL WON
            </div>
            <div className="stat-value">KES {userStats.totalWon.toLocaleString()}</div>
            <div style={{ fontSize: '0.8rem', color: THEME.accent }}>
              <TrendingUp size={12} /> +KES 4,200 today
            </div>
          </StatCard>
          
          <StatCard>
            <div className="stat-label">
              <Zap size={16} /> LIVE BETS
            </div>
            <div className="stat-value">{userStats.liveBets}</div>
            <div style={{ fontSize: '0.8rem', color: THEME.info }}>
              <Target size={12} /> {userStats.accuracy}% accuracy
            </div>
          </StatCard>
        </QuickStats>

        {/* Category Filter */}
        <CategoryBar>
          {CATEGORIES.map(category => {
            const Icon = category.icon;
            return (
              <CategoryTab
                key={category.id}
                active={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              >
                <Icon size={16} />
                {category.label}
              </CategoryTab>
            );
          })}
        </CategoryBar>

        <LayoutGrid>
          {/* Markets Section */}
          <MarketsContainer>
            {filteredMarkets.map(market => {
              const Icon = market.icon;
              const isBetSelected = Object.keys(selectedBets).some(key => key.startsWith(`${market.id}-`));
              
              return (
                <MarketCard key={market.id} gradient={market.gradient}>
                  {market.live && (
                    <LiveBadge>
                      <Flame size={12} /> LIVE
                    </LiveBadge>
                  )}
                  
                  <MarketHeader>
                    <MarketTitle>
                      <Icon size={22} color={THEME.accent} />
                      <span>{market.category}</span>
                      {isBetSelected && (
                        <div className="market-badge">
                          <CheckCircle size={12} /> SELECTED
                        </div>
                      )}
                    </MarketTitle>
                    <MarketTime>
                      <Clock size={16} />
                      {market.time}
                    </MarketTime>
                  </MarketHeader>
                  
                  <MarketBody>
                    <TeamsRow>
                      <TeamCard>
                        <TeamLogo gradient={market.teamA.gradient}>
                          {market.teamA.logo}
                        </TeamLogo>
                        <TeamInfo>
                          <TeamName partyColor={market.teamA.color}>
                            {market.teamA.name}
                            {market.teamA.party && (
                              <span className="party-badge">{market.teamA.party}</span>
                            )}
                          </TeamName>
                          <TeamStats>
                            <StatBadge color={THEME.accent}>
                              <TrendingUp size={12} />
                              {market.teamA.trend}
                            </StatBadge>
                            <span>{market.teamA.stats}</span>
                            {market.teamA.supporters && (
                              <StatBadge color={THEME.info}>
                                <Users size={12} />
                                {market.teamA.supporters}
                              </StatBadge>
                            )}
                          </TeamStats>
                        </TeamInfo>
                      </TeamCard>
                      
                      <VsBadge>VS</VsBadge>
                      
                      <TeamCard reversed>
                        <TeamLogo gradient={market.teamB.gradient}>
                          {market.teamB.logo}
                        </TeamLogo>
                        <TeamInfo style={{ textAlign: 'right' }}>
                          <TeamName partyColor={market.teamB.color}>
                            {market.teamA.party && (
                              <span className="party-badge">{market.teamB.party}</span>
                            )}
                            {market.teamB.name}
                          </TeamName>
                          <TeamStats style={{ justifyContent: 'flex-end' }}>
                            {market.teamB.supporters && (
                              <StatBadge color={THEME.info}>
                                <Users size={12} />
                                {market.teamB.supporters}
                              </StatBadge>
                            )}
                            <span>{market.teamB.stats}</span>
                            <StatBadge color={THEME.accent2}>
                              <TrendingUp size={12} />
                              {market.teamB.trend}
                            </StatBadge>
                          </TeamStats>
                        </TeamInfo>
                      </TeamCard>
                    </TeamsRow>
                    
                    <OddsContainer>
                      <OddsBox
                        selected={selectedBets[`${market.id}-win`]}
                        onClick={() => handleSelectBet(market.id, 'win', market.odds.win.value, market.odds.win.label)}
                      >
                        <div className="label">{market.odds.win.label}</div>
                        <div className="val">{market.odds.win.value}</div>
                      </OddsBox>
                      
                      <OddsBox
                        selected={selectedBets[`${market.id}-draw`]}
                        onClick={() => handleSelectBet(market.id, 'draw', market.odds.draw.value, market.odds.draw.label)}
                      >
                        <div className="label">{market.odds.draw.label}</div>
                        <div className="val">{market.odds.draw.value}</div>
                      </OddsBox>
                      
                      <OddsBox
                        selected={selectedBets[`${market.id}-lose`]}
                        onClick={() => handleSelectBet(market.id, 'lose', market.odds.lose.value, market.odds.lose.label)}
                      >
                        <div className="label">{market.odds.lose.label}</div>
                        <div className="val">{market.odds.lose.value}</div>
                      </OddsBox>
                    </OddsContainer>
                  </MarketBody>
                </MarketCard>
              );
            })}
          </MarketsContainer>

          {/* Bet Slip */}
          <BetSlip>
            <SlipHeader>
              <span>📋 BETSLIP</span>
              <div className="count-badge">
                {Object.keys(selectedBets).length} SELECTION{Object.keys(selectedBets).length !== 1 ? 'S' : ''}
              </div>
            </SlipHeader>
            
            <SlipBody>
              {Object.keys(selectedBets).length === 0 ? (
                <EmptySlip>
                  <Target size={80} />
                  <div className="title">Your Betslip is Empty</div>
                  <div className="description">
                    Select odds from the markets to add them here
                  </div>
                </EmptySlip>
              ) : (
                <>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontWeight: 600 }}>Selected Bets</div>
                    <button
                      onClick={clearBetslip}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: THEME.danger,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Trash2 size={14} />
                      Clear All
                    </button>
                  </div>
                  
                  {Object.entries(selectedBets).map(([key, bet]) => (
                    <BetItem key={key}>
                      <BetHeader>
                        <BetTitle>{bet.marketTitle}</BetTitle>
                        <RemoveBtn onClick={() => removeBet(key)}>
                          <Trash2 size={14} />
                          Remove
                        </RemoveBtn>
                      </BetHeader>
                      <div style={{
                        fontSize: '0.8rem',
                        color: THEME.textDim,
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          background: THEME.accent + '20',
                          color: THEME.accent,
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          {bet.category}
                        </div>
                      </div>
                      <BetDetails>
                        <div style={{ 
                          color: THEME.accent, 
                          fontWeight: 700,
                          fontSize: '0.95rem'
                        }}>
                          {bet.label}
                        </div>
                        <div className="odds">{bet.odds}</div>
                      </BetDetails>
                      <div style={{
                        fontSize: '0.8rem',
                        color: THEME.textDim,
                        marginTop: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Clock size={12} />
                        {bet.time}
                      </div>
                    </BetItem>
                  ))}
                  
                  <StakeInput>
                    <InputLabel>
                      <span>STAKE AMOUNT (KES)</span>
                      <div className="balance">
                        <Wallet size={14} />
                        Balance: KES {userBalance.toLocaleString()}
                      </div>
                    </InputLabel>
                    
                    <InputWrapper>
                      <span className="currency">KES</span>
                      <input
                        type="number"
                        value={stake}
                        onChange={(e) => setStake(Math.max(100, parseInt(e.target.value) || 100))}
                        min="100"
                        max={userBalance}
                        step="100"
                      />
                    </InputWrapper>
                    
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <button
                        onClick={deductFromStake}
                        style={{
                          flex: 1,
                          background: THEME.buttonBg,
                          border: `2px solid ${THEME.border}`,
                          color: THEME.textMain,
                          padding: '12px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        -100
                      </button>
                      <button
                        onClick={addToStake}
                        style={{
                          flex: 1,
                          background: THEME.buttonBg,
                          border: `2px solid ${THEME.border}`,
                          color: THEME.textMain,
                          padding: '12px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        +100
                      </button>
                    </div>
                    
                    <QuickStakeButtons>
                      {QUICK_STAKES.map(amount => (
                        <QuickButton
                          key={amount}
                          className={stake === amount ? 'active' : ''}
                          onClick={() => quickAddStake(amount)}
                        >
                          {amount}
                        </QuickButton>
                      ))}
                    </QuickStakeButtons>
                  </StakeInput>
                  
                  <TotalRow>
                    <span>Number of Bets:</span>
                    <span style={{ fontWeight: 700 }}>
                      {Object.keys(selectedBets).length}
                    </span>
                  </TotalRow>
                  
                  <TotalRow>
                    <span>Total Odds:</span>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                      {calculateTotalOdds()}x
                    </span>
                  </TotalRow>
                  
                  <TotalRow>
                    <span>Stake Amount:</span>
                    <span style={{ fontWeight: 700 }}>
                      KES {stake.toLocaleString()}
                    </span>
                  </TotalRow>
                  
                  <TotalRow className="total">
                    <span>Potential Win:</span>
                    <span style={{ color: THEME.accent, fontSize: '1.4rem' }}>
                      KES {calculatePotentialWin()}
                    </span>
                  </TotalRow>
                  
                  <PlaceBetButton
                    onClick={placeBet}
                    disabled={Object.keys(selectedBets).length === 0}
                    hasBets={Object.keys(selectedBets).length > 0}
                  >
                    {Object.keys(selectedBets).length === 0 
                      ? 'SELECT BETS TO CONTINUE' 
                      : `PLACE BET - KES ${stake.toLocaleString()}`
                    }
                  </PlaceBetButton>
                </>
              )}
            </SlipBody>
          </BetSlip>
        </LayoutGrid>
      </Page>
    </>
  );
};



export default BettingPage;