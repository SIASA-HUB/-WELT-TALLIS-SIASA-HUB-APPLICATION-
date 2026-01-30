// LeaderStats.jsx
import React from 'react';
import styled from 'styled-components';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { TrendingUp, Users, Target, Award, Activity } from 'lucide-react';

const KENYA_THEME = {
  primary: '#BB0000',
  support: '#00A86B',
  opposition: '#FF6B6B',
  trending: '#F59E0B',
  neutral: '#6B7280',
  background: '#F8FAFC',
  border: '#E2E8F0',
  text: {
    primary: '#0F172A',
    secondary: '#64748B'
  }
};

const StatsContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 20px;
`;

const StatsCard = styled.div`
  background: ${props => props.$background || KENYA_THEME.background};
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const LeaderStats = ({ leaderData }) => {
  // Sample performance data
  const performanceData = [
    { month: 'Jan', approval: 65, likes: 8000, support: 60 },
    { month: 'Feb', approval: 68, likes: 9500, support: 62 },
    { month: 'Mar', approval: 72, likes: 11000, support: 65 },
    { month: 'Apr', approval: 75, likes: 12500, support: 68 },
    { month: 'May', approval: 78, likes: 14000, support: 72 },
    { month: 'Jun', approval: leaderData.approval, likes: leaderData.likes, support: leaderData.approval }
  ];

  const sentimentData = [
    { name: 'Wasaidizi Wazito', value: Math.floor(leaderData.likes * 0.7), color: KENYA_THEME.support },
    { name: 'Wasaidizi Wastani', value: Math.floor(leaderData.likes * 0.2), color: '#3b82f6' },
    { name: 'Wanaoangalia', value: Math.floor(leaderData.views * 0.3), color: KENYA_THEME.neutral },
    { name: 'Wakosoaji', value: leaderData.dislikes, color: KENYA_THEME.opposition }
  ];

  return (
    <StatsContainer>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
        <Activity size={28} color={KENYA_THEME.primary} />
        <h3 style={{ margin: 0, color: KENYA_THEME.text.primary }}>
          Takwimu za Utendaji
        </h3>
      </div>

      {/* Quick Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <StatsCard $background="#f0fdf4">
          <TrendingUp size={32} color="#10b981" style={{ marginBottom: '10px' }} />
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#065f46', marginBottom: '5px' }}>
            {leaderData.approval}%
          </div>
          <div style={{ fontSize: '14px', color: '#047857', fontWeight: '600' }}>
            Kiwango cha Ridhaa
          </div>
        </StatsCard>
        
        <StatsCard $background="#fef3c7">
          <Users size={32} color="#d97706" style={{ marginBottom: '10px' }} />
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#92400e', marginBottom: '5px' }}>
            {(leaderData.likes + leaderData.dislikes).toLocaleString()}
          </div>
          <div style={{ fontSize: '14px', color: '#b45309', fontWeight: '600' }}>
            Jumla ya Maoni
          </div>
        </StatsCard>
        
        <StatsCard $background="#e0f2fe">
          <Target size={32} color="#0369a1" style={{ marginBottom: '10px' }} />
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#075985', marginBottom: '5px' }}>
            {leaderData.trustScore}%
          </div>
          <div style={{ fontSize: '14px', color: '#0ea5e9', fontWeight: '600' }}>
            Alama ya Uaminifu
          </div>
        </StatsCard>
        
        <StatsCard $background="#fce7f3">
          <Award size={32} color="#db2777" style={{ marginBottom: '10px' }} />
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#9d174d', marginBottom: '5px' }}>
            {leaderData.manifestoApprovals?.toLocaleString() || '0'}
          </div>
          <div style={{ fontSize: '14px', color: '#be185d', fontWeight: '600' }}>
            Idhini za Manifesti
          </div>
        </StatsCard>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
        {/* Approval Trend Chart */}
        <div>
          <h4 style={{ marginBottom: '15px', color: KENYA_THEME.text.secondary }}>
            Mwenendo wa Ridhaa
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" fontSize={12} stroke={KENYA_THEME.text.secondary} />
              <YAxis fontSize={12} stroke={KENYA_THEME.text.secondary} />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="approval" 
                stroke={KENYA_THEME.primary} 
                fill="url(#colorApproval)"
                strokeWidth={3}
              />
              <defs>
                <linearGradient id="colorApproval" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={KENYA_THEME.primary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={KENYA_THEME.primary} stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Distribution */}
        <div>
          <h4 style={{ marginBottom: '15px', color: KENYA_THEME.text.secondary }}>
            Usambazaji wa Hisia
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div style={{
        background: KENYA_THEME.background,
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px'
      }}>
        <h4 style={{ marginBottom: '15px', color: KENYA_THEME.text.primary }}>
          Takwimu za kina
        </h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '15px' 
        }}>
          <div>
            <div style={{ fontSize: '12px', color: KENYA_THEME.text.secondary, marginBottom: '5px' }}>
              Wasaidizi
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: KENYA_THEME.support }}>
              {leaderData.likes.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: KENYA_THEME.text.secondary, marginBottom: '5px' }}>
              Wakosoaji
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: KENYA_THEME.opposition }}>
              {leaderData.dislikes.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: KENYA_THEME.text.secondary, marginBottom: '5px' }}>
              Uwiano wa Ushindi
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: KENYA_THEME.trending }}>
              {leaderData.likes > 0 ? Math.round((leaderData.likes / (leaderData.likes + leaderData.dislikes)) * 100) : 0}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: KENYA_THEME.text.secondary, marginBottom: '5px' }}>
              Mabadiliko ya Mwezi
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>
              +{Math.floor(Math.random() * 5) + 2}%
            </div>
          </div>
        </div>
      </div>
    </StatsContainer>
  );
};

export default LeaderStats;