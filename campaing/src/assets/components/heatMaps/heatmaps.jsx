import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Doughnut, Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);


// Kenyan-themed colors
const KENYA_COLORS = {
  primary: '#BB0000',    // Kenyan flag red
  secondary: '#000000',  // Black
  accent: '#006600',     // Green
  highlight: '#FFFFFF',  // White
  support: '#00A86B',    // Green for support
  opposition: '#FF6B6B', // Red for opposition
  neutral: '#6B7280',    // Gray
  trending: '#F59E0B',   // Amber for trending
  counties: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F1948A', '#7FB3D5', '#76D7C4', '#F8C471', '#A569BD'
  ]
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

// Styled Components
const DashboardContainer = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin: 20px 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  animation: ${fadeIn} 0.6s ease-out;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const DashboardTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &::before {
    content: '';
    width: 4px;
    height: 24px;
    background: ${KENYA_COLORS.primary};
    border-radius: 2px;
  }
`;

const RefreshButton = styled.button`
  background: linear-gradient(135deg, ${KENYA_COLORS.primary}, ${KENYA_COLORS.accent});
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(187, 0, 0, 0.2);
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const MetricCard = styled.div`
  background: ${props => props.highlight ? 
    `linear-gradient(135deg, ${KENYA_COLORS.primary}, ${KENYA_COLORS.secondary})` : 
    '#f8fafc'};
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  animation: ${props => props.highlight ? pulse : 'none'} 2s infinite;
`;

const MetricValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.highlight ? 'white' : KENYA_COLORS.primary};
  margin-bottom: 4px;
`;

const MetricLabel = styled.div`
  font-size: 14px;
  color: ${props => props.highlight ? 'rgba(255,255,255,0.9)' : '#64748b'};
  font-weight: 500;
`;

const MetricChange = styled.div`
  font-size: 12px;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const KenyaMapContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  background: #f8fafc;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
`;

const CountyBadge = styled.div`
  position: absolute;
  background: ${props => KENYA_COLORS.counties[props.index % KENYA_COLORS.counties.length]};
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1;
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    z-index: 2;
  }
`;

const MapLabel = styled.div`
  position: absolute;
  font-size: 11px;
  color: #64748b;
  pointer-events: none;
`;

const TopCandidatesList = styled.div`
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  margin-top: 20px;
`;

const CandidateItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 12px;
  margin-bottom: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${KENYA_COLORS.primary};
    transform: translateX(4px);
  }
`;

const CandidateRank = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.rank <= 3 ? KENYA_COLORS.primary : '#e2e8f0'};
  color: ${props => props.rank <= 3 ? 'white' : '#64748b'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-right: 12px;
  font-size: 14px;
`;

const CandidateInfo = styled.div`
  flex: 1;
`;

const CandidateName = styled.div`
  font-weight: 600;
  color: #0f172a;
`;

const CandidateParty = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
`;

const CandidateStats = styled.div`
  text-align: right;
  font-weight: 600;
  color: ${KENYA_COLORS.primary};
`;

// Dummy Data
const generateHeatMapData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeks = 5;
  const data = [];
  
  for (let week = 0; week < weeks; week++) {
    for (let day = 0; day < 7; day++) {
      const intensity = Math.random() * 0.8 + 0.2; // 0.2 - 1.0
      data.push({
        day,
        week,
        intensity,
        date: new Date(Date.now() - (weeks - week - 1) * 7 * 24 * 60 * 60 * 1000 - day * 24 * 60 * 60 * 1000)
      });
    }
  }
  
  return data;
};

// Kenyan counties with approximate positions
const KENYAN_COUNTIES = [
  { name: 'Nairobi', x: 50, y: 60, engagement: 0.9 },
  { name: 'Mombasa', x: 80, y: 80, engagement: 0.8 },
  { name: 'Kisumu', x: 40, y: 50, engagement: 0.7 },
  { name: 'Nakuru', x: 45, y: 55, engagement: 0.85 },
  { name: 'Eldoret', x: 42, y: 52, engagement: 0.75 },
  { name: 'Kisii', x: 38, y: 48, engagement: 0.65 },
  { name: 'Kakamega', x: 35, y: 53, engagement: 0.6 },
  { name: 'Meru', x: 55, y: 58, engagement: 0.7 },
  { name: 'Thika', x: 52, y: 59, engagement: 0.8 },
  { name: 'Machakos', x: 53, y: 62, engagement: 0.55 }
];

// Top candidates data
const TOP_CANDIDATES = [
  { id: 1, name: 'William Ruto', party: 'UDA', support: 12450, change: 12.5 },
  { id: 2, name: 'Raila Odinga', party: 'ODM', support: 11230, change: 8.3 },
  { id: 3, name: 'Martha Karua', party: 'NARC-KENYA', support: 8920, change: 15.7 },
  { id: 4, name: 'Kalonzo Musyoka', party: 'WIPER', support: 7560, change: 5.2 },
  { id: 5, name: 'Musalia Mudavadi', party: 'FORD-KENYA', support: 6210, change: 3.8 }
];

const HeatMaps = () => {
  const [heatMapData, setHeatMapData] = useState(generateHeatMapData());
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [timeFilter, setTimeFilter] = useState('today');

  // Gender support data
  const genderSupportData = {
    labels: ['Male (18-35)', 'Male (36-55)', 'Male (56+)', 'Female (18-35)', 'Female (36-55)', 'Female (56+)'],
    datasets: [
      {
        label: 'Support',
        data: [65, 58, 42, 68, 61, 45],
        backgroundColor: KENYA_COLORS.counties.slice(0, 6),
        borderColor: 'white',
        borderWidth: 2
      }
    ]
  };

  // Party support over time
  const partyTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'UDA',
        data: [58, 59, 60, 62, 63, 65, 66],
        borderColor: KENYA_COLORS.primary,
        backgroundColor: 'rgba(187, 0, 0, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'ODM',
        data: [55, 56, 57, 56, 55, 54, 55],
        borderColor: KENYA_COLORS.accent,
        backgroundColor: 'rgba(0, 102, 0, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'WIPER',
        data: [38, 39, 40, 41, 42, 41, 42],
        borderColor: KENYA_COLORS.counties[2],
        backgroundColor: 'rgba(69, 183, 209, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Age group distribution
  const ageDistributionData = {
    labels: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
    datasets: [
      {
        label: 'Engagement Level',
        data: [85, 78, 65, 58, 45, 32],
        backgroundColor: [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'
        ]
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold'
        },
        formatter: (value) => `${value}%`
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value}%`
        }
      }
    }
  };

  const handleRefresh = () => {
    setHeatMapData(generateHeatMapData());
  };

  const handleCountyClick = (county) => {
    setSelectedCounty(county);
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>🇰🇪 Dashboard</DashboardTitle>
        <RefreshButton onClick={handleRefresh}>
          <span>🔄</span> Refresh Data
        </RefreshButton>
      </DashboardHeader>

      {/* Key Metrics */}
      <MetricsGrid>
        <MetricCard highlight>
          <MetricValue highlight>12,450</MetricValue>
          <MetricLabel highlight>Total Engagement Today</MetricLabel>
          <MetricChange positive>+24% ↑</MetricChange>
        </MetricCard>
        
        <MetricCard>
          <MetricValue>856</MetricValue>
          <MetricLabel>Most Comments Today</MetricLabel>
          <MetricChange positive>+18% ↑</MetricChange>
        </MetricCard>
        
        <MetricCard>
          <MetricValue>42</MetricValue>
          <MetricLabel>Wards Engaged</MetricLabel>
          <MetricChange positive>+8% ↑</MetricChange>
        </MetricCard>
        
        <MetricCard>
          <MetricValue>68%</MetricValue>
          <MetricLabel>Youth (18-35) Participation</MetricLabel>
          <MetricChange positive>+15% ↑</MetricChange>
        </MetricCard>
      </MetricsGrid>

      {/* Heat Map */}
      <ChartCard>
        <ChartTitle>🔥 Weekly Engagement Heat Map</ChartTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '16px' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} style={{ textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
              {day}
            </div>
          ))}
          {heatMapData.map((cell, index) => (
            <div
              key={index}
              style={{
                width: '100%',
                aspectRatio: '1',
                backgroundColor: `rgba(187, 0, 0, ${0.3 + cell.intensity * 0.7})`,
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title={`${cell.date.toLocaleDateString()}\nEngagement: ${Math.round(cell.intensity * 100)}%`}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
          <span>Low Activity</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[0.3, 0.5, 0.7, 0.9].map((opacity, idx) => (
              <div key={idx} style={{ width: '20px', height: '8px', backgroundColor: `rgba(187, 0, 0, ${opacity})`, borderRadius: '2px' }} />
            ))}
          </div>
          <span>High Activity</span>
        </div>
      </ChartCard>

      {/* Charts Grid */}
      <ChartsGrid>
        {/* Gender Support Chart */}
        <ChartCard>
          <ChartTitle>👥 Gender & Age Support</ChartTitle>
          <div style={{ height: '250px' }}>
            <Bar 
              data={genderSupportData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: { display: false }
                }
              }}
            />
          </div>
        </ChartCard>

        {/* Party Trend Chart */}
        <ChartCard>
          <ChartTitle>📈 Party Support Trend (This Week)</ChartTitle>
          <div style={{ height: '250px' }}>
            <Line 
              data={partyTrendData}
              options={chartOptions}
            />
          </div>
        </ChartCard>

        {/* Age Distribution */}
        <ChartCard>
          <ChartTitle>🎯 Age Group Engagement</ChartTitle>
          <div style={{ height: '250px' }}>
            <Doughnut 
              data={ageDistributionData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  datalabels: {
                    ...chartOptions.plugins.datalabels,
                    formatter: (value) => `${value}%`
                  }
                }
              }}
            />
          </div>
        </ChartCard>
      </ChartsGrid>

      {/* Kenya Map */}
      <ChartCard>
        <ChartTitle>🗺️ County Engagement Map</ChartTitle>
        <KenyaMapContainer>
          {/* Simplified Kenya map outline */}
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '20%',
            right: '20%',
            bottom: '20%',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)'
          }} />
          
          {/* County markers */}
          {KENYAN_COUNTIES.map((county, index) => (
            <CountyBadge
              key={county.name}
              index={index}
              style={{
                left: `${county.x}%`,
                top: `${county.y}%`,
                backgroundColor: KENYA_COLORS.counties[index],
                transform: selectedCounty?.name === county.name ? 
                  'translate(-50%, -50%) scale(1.2)' : 
                  'translate(-50%, -50%)'
              }}
              onClick={() => handleCountyClick(county)}
              title={`${county.name}: ${Math.round(county.engagement * 100)}% engagement`}
            >
              {county.name}
            </CountyBadge>
          ))}

          {/* Map labels */}
          <MapLabel style={{ top: '15%', left: '25%' }}>Western</MapLabel>
          <MapLabel style={{ top: '30%', left: '45%' }}>Central</MapLabel>
          <MapLabel style={{ top: '50%', left: '65%' }}>Coast</MapLabel>
          <MapLabel style={{ top: '70%', left: '40%' }}>Rift Valley</MapLabel>
          <MapLabel style={{ top: '85%', left: '60%' }}>Nyanza</MapLabel>
        </KenyaMapContainer>
        
        {selectedCounty && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: `linear-gradient(135deg, ${KENYA_COLORS.counties[KENYAN_COUNTIES.findIndex(c => c.name === selectedCounty.name) % KENYA_COLORS.counties.length]}, rgba(255,255,255,0.9))`,
            borderRadius: '12px',
            color: 'white'
          }}>
            <strong>{selectedCounty.name}</strong>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '14px' }}>
              <span>Engagement: {Math.round(selectedCounty.engagement * 100)}%</span>
              <span>Leading: UDA</span>
              <span>Posts: 234</span>
            </div>
          </div>
        )}
      </ChartCard>

      {/* Top Candidates */}
      <TopCandidatesList>
        <ChartTitle>🏆 Top Performing Candidates Today</ChartTitle>
        {TOP_CANDIDATES.map((candidate, index) => (
          <CandidateItem key={candidate.id}>
            <CandidateRank rank={index + 1}>
              {index + 1}
            </CandidateRank>
            <CandidateInfo>
              <CandidateName>{candidate.name}</CandidateName>
              <CandidateParty>{candidate.party}</CandidateParty>
            </CandidateInfo>
            <CandidateStats>
              {candidate.support.toLocaleString()} votes
              <div style={{ fontSize: '12px', color: candidate.change > 0 ? '#10b981' : '#ef4444' }}>
                {candidate.change > 0 ? '+' : ''}{candidate.change}%
              </div>
            </CandidateStats>
          </CandidateItem>
        ))}
      </TopCandidatesList>

      {/* Leading Wards */}
      <ChartsGrid>
        <ChartCard>
          <ChartTitle>📍 Top 5 Wards by Engagement</ChartTitle>
          <div style={{ padding: '16px' }}>
            {[
              { name: 'Westlands Ward', county: 'Nairobi', engagement: 94 },
              { name: 'Mvita Ward', county: 'Mombasa', engagement: 87 },
              { name: 'Milimani Ward', county: 'Kisumu', engagement: 82 },
              { name: 'Lanet Ward', county: 'Nakuru', engagement: 78 },
              { name: 'Kapsoya Ward', county: 'Eldoret', engagement: 75 }
            ].map((ward, index) => (
              <div key={ward.name} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                borderBottom: '1px solid #e2e8f0',
                background: index < 3 ? 'rgba(187, 0, 0, 0.05)' : 'transparent'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{ward.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{ward.county}</div>
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: KENYA_COLORS.primary
                }}>
                  {ward.engagement}%
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard>
          <ChartTitle>📱 Platform Distribution</ChartTitle>
          <div style={{ height: '250px', marginTop: '16px' }}>
            <Pie 
              data={{
                labels: ['Twitter', 'Facebook', 'WhatsApp', 'Instagram', 'TikTok'],
                datasets: [{
                  data: [35, 28, 22, 12, 8],
                  backgroundColor: [
                    '#1DA1F2', '#1877F2', '#25D366', '#E4405F', '#000000'
                  ],
                  borderWidth: 2
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.label}: ${context.raw}%`
                    }
                  }
                }
              }}
            />
          </div>
        </ChartCard>
      </ChartsGrid>
    </DashboardContainer>
  );
};

export default HeatMaps;