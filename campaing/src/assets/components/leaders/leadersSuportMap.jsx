// LeaderSupportMap.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Map, Target, TrendingUp, TrendingDown, Users, 
  AlertTriangle, CheckCircle, Award, BarChart2  ,   Octagon
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Cell, PieChart, Pie, LineChart, Line, AreaChart, Area
} from 'recharts';

// Kenyan Counties Data
const KENYAN_COUNTIES = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita Taveta',
  'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru',
  'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua',
  'Nyeri', 'Kirinyaga', 'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot',
  'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi',
  'Baringo', 'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho',
  'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia', 'Siaya',
  'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira', 'Nairobi'
];

// Party strongholds data
const PARTY_STRONGHOLDS = {
  'UDA': ['Nakuru', 'Kiambu', 'Baringo', 'Nyeri', 'Murang\'a', 'Kirinyaga'],
  'ODM': ['Kisumu', 'Siaya', 'Homa Bay', 'Migori', 'Mombasa', 'Nairobi'],
  'WIPER': ['Kitui', 'Makueni', 'Machakos'],
  'FORD-KENYA': ['Bungoma', 'Trans Nzoia', 'Busia'],
  'JUBILEE': ['Nairobi', 'Kiambu', 'Nakuru'],
  'INDEPENDENT': ['Turkana', 'Marsabit', 'Isiolo']
};

// KENYAN THEME
const KENYA_THEME = {
  primary: '#BB0000',
  secondary: '#000000',
  accent: '#006600',
  highlight: '#FFFFFF',
  support: '#00A86B',
  opposition: '#FF6B6B',
  neutral: '#6B7280',
  trending: '#F59E0B',
  background: '#F8FAFC',
  border: '#E2E8F0',
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    light: '#94A3B8'
  },
  partyColors: {
    'UDA': '#BB0000',
    'ODM': '#006600',
    'WIPER': '#8B5CF6',
    'FORD-KENYA': '#10B981',
    'JUBILEE': '#FFD700',
    'NARC-KENYA': '#EC4899',
    'INDEPENDENT': '#6B7280'
  }
};

// Styled Components
const SupportMapContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 20px;
`;

const MapGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
  margin-bottom: 25px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const CountyCard = styled.div`
  background: ${props => {
    if (props.$support >= 80) return '#f0fdf4';
    if (props.$support >= 60) return '#fffbeb';
    if (props.$support >= 40) return '#fef2f2';
    return '#f8fafc';
  }};
  border: 2px solid ${props => {
    if (props.$support >= 80) return '#86efac';
    if (props.$support >= 60) return '#fcd34d';
    if (props.$support >= 40) return '#fca5a5';
    return '#d1d5db';
  }};
  border-radius: 12px;
  padding: 15px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
`;

const SupportLevel = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: ${props => {
    if (props.$support >= 80) return '#065f46';
    if (props.$support >= 60) return '#92400e';
    if (props.$support >= 40) return '#991b1b';
    return '#4b5563';
  }};
  margin-bottom: 5px;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: none;
  background: ${props => props.$active ? KENYA_THEME.primary : KENYA_THEME.background};
  color: ${props => props.$active ? 'white' : KENYA_THEME.text.primary};
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$active ? '#990000' : '#f1f5f9'};
    transform: translateY(-1px);
  }
`;

const RegionCard = styled.div`
  background: ${props => props.$isStronghold ? '#fef3c7' : KENYA_THEME.background};
  border: 2px solid ${props => props.$isStronghold ? '#fbbf24' : KENYA_THEME.border};
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 10px;
`;

// Main Component
const LeaderSupportMap = ({ leaderData }) => {
  const [supportData, setSupportData] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'high', 'low', 'trending'
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  // Generate support data based on leader's party and other factors
  useEffect(() => {
    const generateSupportData = () => {
      setLoading(true);
      
      // Get leader's party
      const party = leaderData?.party || 'INDEPENDENT';
      const strongholds = PARTY_STRONGHOLDS[party] || [];
      
      // Generate support data for counties
      const generatedData = KENYAN_COUNTIES.map(county => {
        let baseSupport = 50;
        
        // Adjust based on party strongholds
        if (strongholds.includes(county)) {
          baseSupport += Math.floor(Math.random() * 30) + 15; // 65-95%
        } else {
          baseSupport += Math.floor(Math.random() * 50) - 25; // 25-75%
        }
        
        // Add some randomness
        const support = Math.max(0, Math.min(100, baseSupport));
        
        // Calculate population (simulated)
        const population = Math.floor(Math.random() * 3000000) + 500000;
        
        // Determine if trending up or down
        const trend = Math.random() > 0.5 ? 'up' : 'down';
        const trendValue = Math.floor(Math.random() * 15) + 5;
        
        // Generate performance metrics
        const performance = {
          manifestoSupport: Math.floor(support * 0.8) + Math.floor(Math.random() * 20),
          youthSupport: Math.floor(support * 0.9) + Math.floor(Math.random() * 10),
          womenSupport: Math.floor(support * 0.85) + Math.floor(Math.random() * 15),
          turnout: Math.floor(Math.random() * 40) + 50
        };
        
        return {
          id: county.toLowerCase().replace(/\s+/g, '-'),
          name: county,
          support: support,
          population: population,
          trend: trend,
          trendValue: trendValue,
          isStronghold: strongholds.includes(county),
          performance: performance,
          partyAlignment: strongholds.includes(county) ? 'high' : support > 60 ? 'medium' : 'low',
          color: getColorForSupport(support)
        };
      }).sort((a, b) => b.support - a.support);
      
      setSupportData(generatedData);
      setLoading(false);
    };
    
    generateSupportData();
  }, [leaderData]);

  const getColorForSupport = (support) => {
    if (support >= 80) return '#10b981';
    if (support >= 60) return '#3b82f6';
    if (support >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getSupportLabel = (support) => {
    if (support >= 80) return 'Usaidizi Mkubwa Sana';
    if (support >= 60) return 'Usaidizi Mkubwa';
    if (support >= 40) return 'Usaidizi Wastani';
    return 'Usaidizi Mdogo';
  };

  const getFilteredData = () => {
    switch(filter) {
      case 'high':
        return supportData.filter(item => item.support >= 60);
      case 'low':
        return supportData.filter(item => item.support < 40);
      case 'trending':
        return supportData.filter(item => item.trend === 'up').sort((a, b) => b.trendValue - a.trendValue);
      default:
        return supportData;
    }
  };

  const getRegionStats = () => {
    if (!selectedRegion) return null;
    
    const region = supportData.find(item => item.id === selectedRegion);
    if (!region) return null;
    
    return {
      name: region.name,
      support: region.support,
      population: region.population.toLocaleString(),
      trend: region.trend,
      trendValue: region.trendValue,
      isStronghold: region.isStronghold,
      performance: region.performance
    };
  };

  const renderCountyGrid = () => {
    const filteredData = getFilteredData();
    
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '15px',
        maxHeight: '500px',
        overflowY: 'auto',
        padding: '10px'
      }}>
        {filteredData.map((county) => (
          <CountyCard 
            key={county.id}
            $support={county.support}
            onClick={() => setSelectedRegion(county.id)}
            style={{
              borderColor: selectedRegion === county.id ? KENYA_THEME.primary : undefined,
              boxShadow: selectedRegion === county.id ? `0 0 0 3px ${KENYA_THEME.primary}20` : undefined
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontWeight: '700', fontSize: '14px', color: KENYA_THEME.text.primary }}>
                {county.name}
              </div>
              {county.isStronghold && (
                <div style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: '600'
                }}>
                  Ngome
                </div>
              )}
            </div>
            
            <SupportLevel $support={county.support}>
              {county.support}%
            </SupportLevel>
            
            <div style={{ fontSize: '11px', color: KENYA_THEME.text.secondary, marginBottom: '8px' }}>
              {county.population.toLocaleString()} wakazi
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              fontSize: '12px',
              color: county.trend === 'up' ? '#10b981' : '#ef4444'
            }}>
              {county.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {county.trend === 'up' ? '+' : '-'}{county.trendValue}% mwezi huu
            </div>
            
            <div style={{
              marginTop: '10px',
              height: '6px',
              background: KENYA_THEME.border,
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${county.support}%`,
                height: '100%',
                background: county.color,
                borderRadius: '3px'
              }} />
            </div>
          </CountyCard>
        ))}
      </div>
    );
  };

  const renderRegionDetails = () => {
    const regionStats = getRegionStats();
    
    if (!regionStats) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          color: KENYA_THEME.text.secondary
        }}>
          <Map size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>
            Chagua kaunti kwa taarifa za kina
          </div>
          <div style={{ fontSize: '14px' }}>
            Bofya kwenye kadi yoyote ya kaunti upande wa kushoto
          </div>
        </div>
      );
    }

    return (
      <div>
        <div style={{ 
          background: regionStats.isStronghold ? '#fffbeb' : KENYA_THEME.background,
          border: `2px solid ${regionStats.isStronghold ? '#fbbf24' : KENYA_THEME.border}`,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: KENYA_THEME.text.primary }}>
              {regionStats.name}
            </h3>
            {regionStats.isStronghold && (
              <div style={{
                background: '#fef3c7',
                color: '#92400e',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Award size={14} />
                Ngome ya {leaderData?.party || 'Chama'}
              </div>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: KENYA_THEME.text.secondary, marginBottom: '5px' }}>
                Usaidizi wa Sasa
              </div>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: '800', 
                color: getColorForSupport(regionStats.support),
                marginBottom: '5px'
              }}>
                {regionStats.support}%
              </div>
              <div style={{ fontSize: '12px', color: KENYA_THEME.text.light }}>
                {getSupportLabel(regionStats.support)}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: KENYA_THEME.text.secondary, marginBottom: '5px' }}>
                Mwenendo
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontSize: '18px',
                fontWeight: '700',
                color: regionStats.trend === 'up' ? '#10b981' : '#ef4444'
              }}>
                {regionStats.trend === 'up' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                {regionStats.trend === 'up' ? '+' : '-'}{regionStats.trendValue}%
                <span style={{ fontSize: '14px', color: KENYA_THEME.text.light }}>
                  mwezi huu
                </span>
              </div>
            </div>
          </div>
          
          <div style={{ fontSize: '14px', color: KENYA_THEME.text.secondary }}>
            <strong>Idadi ya Wapiga Kura:</strong> {regionStats.population}
          </div>
        </div>

        {/* Performance Metrics */}
        <h4 style={{ marginBottom: '15px', color: KENYA_THEME.text.primary }}>
          Vipimo vya Utendaji
        </h4>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '15px',
          marginBottom: '25px'
        }}>
          <div style={{ textAlign: 'center', padding: '15px', background: '#f0fdf4', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981', marginBottom: '5px' }}>
              {regionStats.performance.manifestoSupport}%
            </div>
            <div style={{ fontSize: '12px', color: '#047857' }}>Usaidizi wa Manifesti</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '15px', background: '#e0f2fe', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#3b82f6', marginBottom: '5px' }}>
              {regionStats.performance.youthSupport}%
            </div>
            <div style={{ fontSize: '12px', color: '#1d4ed8' }}>Usaidizi wa Vijana</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '15px', background: '#fce7f3', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#db2777', marginBottom: '5px' }}>
              {regionStats.performance.womenSupport}%
            </div>
            <div style={{ fontSize: '12px', color: '#be185d' }}>Usaidizi wa Wanawake</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '15px', background: '#fef3c7', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#d97706', marginBottom: '5px' }}>
              {regionStats.performance.turnout}%
            </div>
            <div style={{ fontSize: '12px', color: '#b45309' }}>Ushawishi wa Kura</div>
          </div>
        </div>

        {/* Trends Chart */}
        <h4 style={{ marginBottom: '15px', color: KENYA_THEME.text.primary }}>
          Mwenendo wa Usaidizi (Miezi 6 iliyopita)
        </h4>
        
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={[
              { month: 'Jan', support: regionStats.support - 15 },
              { month: 'Feb', support: regionStats.support - 10 },
              { month: 'Mar', support: regionStats.support - 8 },
              { month: 'Apr', support: regionStats.support - 5 },
              { month: 'May', support: regionStats.support - 2 },
              { month: 'Jun', support: regionStats.support }
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" fontSize={12} stroke={KENYA_THEME.text.secondary} />
            <YAxis fontSize={12} stroke={KENYA_THEME.text.secondary} />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="support" 
              stroke={getColorForSupport(regionStats.support)} 
              fill={`${getColorForSupport(regionStats.support)}20`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (loading) {
    return (
      <SupportMapContainer>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '16px', color: KENYA_THEME.text.secondary }}>
            Inapakia ramani ya usaidizi...
          </div>
        </div>
      </SupportMapContainer>
    );
  }

  // Prepare data for charts
  const regionSupportData = supportData.slice(0, 10).map(region => ({
    name: region.name,
    support: region.support,
    population: region.population / 1000000 // Convert to millions for chart
  }));

  const supportDistribution = [
    { name: 'Usaidizi Mkubwa Sana (80%+)', value: supportData.filter(r => r.support >= 80).length, color: '#10b981' },
    { name: 'Usaidizi Mkubwa (60-79%)', value: supportData.filter(r => r.support >= 60 && r.support < 80).length, color: '#3b82f6' },
    { name: 'Usaidizi Wastani (40-59%)', value: supportData.filter(r => r.support >= 40 && r.support < 60).length, color: '#f59e0b' },
    { name: 'Usaidizi Mdogo (<40%)', value: supportData.filter(r => r.support < 40).length, color: '#ef4444' }
  ];

  return (
    <SupportMapContainer>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
        <Map size={28} color={KENYA_THEME.primary} />
        <div>
          <h3 style={{ margin: 0, color: KENYA_THEME.text.primary }}>
            Ramani ya Usaidizi wa Kijiografia
          </h3>
          <p style={{ margin: '5px 0 0 0', color: KENYA_THEME.text.secondary, fontSize: '14px' }}>
            Usaidizi wa {leaderData?.name || 'Kiongozi'} kote nchini Kenya
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <FilterButton 
          $active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          <Map size={14} style={{ marginRight: '6px' }} />
          Kaunti Zote ({supportData.length})
        </FilterButton>
        
        <FilterButton 
          $active={filter === 'high'}
          onClick={() => setFilter('high')}
        >
          <Target size={14} style={{ marginRight: '6px' }} />
          Usaidizi Mkubwa ({supportData.filter(r => r.support >= 60).length})
        </FilterButton>
        
        <FilterButton 
          $active={filter === 'low'}
          onClick={() => setFilter('low')}
        >
          <AlertTriangle size={14} style={{ marginRight: '6px' }} />
          Usaidizi Mdogo ({supportData.filter(r => r.support < 40).length})
        </FilterButton>
        
        <FilterButton 
          $active={filter === 'trending'}
          onClick={() => setFilter('trending')}
        >
          <TrendingUp size={14} style={{ marginRight: '6px' }} />
          Inapanda ({supportData.filter(r => r.trend === 'up').length})
        </FilterButton>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div style={{ textAlign: 'center', padding: '15px', background: '#f0fdf4', borderRadius: '12px' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>
            {Math.round(supportData.reduce((sum, r) => sum + r.support, 0) / supportData.length)}%
          </div>
          <div style={{ fontSize: '13px', color: '#047857', fontWeight: '600' }}>
            Wastani wa Usaidizi
          </div>
        </div>
        
        <div style={{ textAlign: 'center', padding: '15px', background: '#e0f2fe', borderRadius: '12px' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#3b82f6' }}>
            {supportData.filter(r => r.support >= 60).length}
          </div>
          <div style={{ fontSize: '13px', color: '#1d4ed8', fontWeight: '600' }}>
            Kaunti zilizounga Mkono
          </div>
        </div>
        
        <div style={{ textAlign: 'center', padding: '15px', background: '#fffbeb', borderRadius: '12px' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#d97706' }}>
            {supportData.filter(r => r.isStronghold).length}
          </div>
          <div style={{ fontSize: '13px', color: '#b45309', fontWeight: '600' }}>
            Nguo za Chama
          </div>
        </div>
        
        <div style={{ textAlign: 'center', padding: '15px', background: '#fef2f2', borderRadius: '12px' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#dc2626' }}>
            {supportData.filter(r => r.support < 40).length}
          </div>
          <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: '600' }}>
            Kaunti zenye Changamoto
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <MapGrid>
        {/* Left Column: Counties Grid */}
        <div>
          <h4 style={{ marginBottom: '15px', color: KENYA_THEME.text.secondary }}>
            Usaidizi kwa Kaunti
          </h4>
          {renderCountyGrid()}
        </div>

        {/* Right Column: Region Details & Charts */}
        <div>
          <h4 style={{ marginBottom: '15px', color: KENYA_THEME.text.secondary }}>
            {selectedRegion ? 'Taarifa za Kinamna' : 'Chagua Kaunti'}
          </h4>
          {renderRegionDetails()}
        </div>
      </MapGrid>

      {/* Charts Section */}
      <div style={{ marginTop: '30px' }}>
        <h4 style={{ marginBottom: '20px', color: KENYA_THEME.text.primary }}>
          Uchambuzi wa Usaidizi
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          {/* Top 10 Counties by Support */}
          <div>
            <h5 style={{ marginBottom: '15px', color: KENYA_THEME.text.secondary, fontSize: '14px' }}>
              Kaunti 10 Bora kwa Usaidizi
            </h5>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={regionSupportData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={11} stroke={KENYA_THEME.text.secondary} angle={-45} textAnchor="end" />
                <YAxis fontSize={12} stroke={KENYA_THEME.text.secondary} />
                <Tooltip />
                <Bar dataKey="support" radius={[8, 8, 0, 0]}>
                  {regionSupportData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorForSupport(entry.support)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Support Distribution */}
          <div>
            <h5 style={{ marginBottom: '15px', color: KENYA_THEME.text.secondary, fontSize: '14px' }}>
              Usambazaji wa Usaidizi
            </h5>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={supportDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {supportDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Octagon />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '25px',
        padding: '15px',
        background: KENYA_THEME.background,
        borderRadius: '12px',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '2px' }} />
            <span>Usaidizi Mkubwa Sana (80%+)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }} />
            <span>Usaidizi Mkubwa (60-79%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px' }} />
            <span>Usaidizi Wastani (40-59%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px' }} />
            <span>Usaidizi Mdogo (40%)</span>
          </div>
        </div>
      </div>
    </SupportMapContainer>
  );
};

export default LeaderSupportMap;