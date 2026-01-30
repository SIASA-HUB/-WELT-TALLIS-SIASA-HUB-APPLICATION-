import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import 'bootstrap/dist/css/bootstrap.min.css';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const ManifestoContainer = styled.div`
  background: white;
  min-height: 100vh;
  font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #111418;
  max-width: 800px;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease-out;
`;

const ManifestoHeader = styled.div`
  background: linear-gradient(135deg, #197fe6, #60a5fa);
  color: white;
  padding: 40px 20px 20px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
  }
`;

const ManifestoContent = styled.div`
  padding: 30px 20px;
`;

const Section = styled.div`
  margin-bottom: 40px;
  padding: 25px;
  background: #f8fafc;
  border-radius: 15px;
  border-left: 4px solid #197fe6;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
  }
`;

const SupportByCounty = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const CountyCard = styled.div`
  background: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
  
  .progress-bar {
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 8px;
    
    .progress-fill {
      height: 100%;
      background: ${props => props.support > 70 ? '#10b981' : props.support > 40 ? '#f59e0b' : '#ef4444'};
      border-radius: 4px;
      width: ${props => props.support}%;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 20px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #e5e7eb;
  box-shadow: 0 3px 10px rgba(0,0,0,0.05);
  
  .stat-value {
    font-size: 28px;
    font-weight: 800;
    color: #197fe6;
    margin-bottom: 5px;
  }
  
  .stat-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 600;
  }
`;

const MaterialIcon = ({ icon, size = 24, color = 'currentColor', filled = false }) => (
  <span 
    className="material-symbols-outlined"
    style={{
      fontSize: size,
      color: color,
      fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0"
    }}
  >
    {icon}
  </span>
);

const ManifestoPage = ({ candidate }) => {
  const [activeSection, setActiveSection] = useState('vision');

  const candidateData = {
    name: "William Ruto",
    position: "Presidential Candidate",
    party: "UDA",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    manifestoTitle: "Bottom-Up Economic Transformation",
    overallSupport: 78,
    
    sections: [
      {
        id: 'vision',
        title: 'Vision & Mission',
        content: 'To transform Kenya into a globally competitive, prosperous nation through a bottom-up economic model that prioritizes the common citizen.',
        icon: 'visibility'
      },
      {
        id: 'economy',
        title: 'Economic Agenda',
        content: 'Create 5 million jobs in 5 years through SME support, digital economy, and agricultural transformation.',
        icon: 'trending_up'
      },
      {
        id: 'education',
        title: 'Education Reform',
        content: 'Free primary and secondary education, university funding reform, and technical training for 2 million youth.',
        icon: 'school'
      },
      {
        id: 'health',
        title: 'Healthcare',
        content: 'Universal Health Coverage through NHIF reforms and construction of 100 new hospitals.',
        icon: 'medical_services'
      }
    ],
    
    countySupport: [
      { name: 'Nairobi', support: 82, voters: 2.5 },
      { name: 'Kiambu', support: 78, voters: 1.8 },
      { name: 'Nakuru', support: 55, voters: 1.5 },
      { name: 'Kisumu', support: 25, voters: 1.2 },
      { name: 'Mombasa', support: 45, voters: 1.1 },
      { name: 'Uasin Gishu', support: 85, voters: 0.9 }
    ],
    
    demographics: {
      youth: 65,
      women: 52,
      rural: 60,
      urban: 40
    },
    
    sentiment: {
      positive: 72,
      neutral: 18,
      negative: 10
    },
    
    engagement: {
      totalReach: '1.2M',
      engagementRate: '36.5%',
      shares: '125K',
      comments: '75K'
    }
  };

  return (
    <ManifestoContainer>
      <ManifestoHeader>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', position: 'relative', zIndex: 2 }}>
          <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}>
            <MaterialIcon icon="arrow_back" size={24} />
          </button>
          <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}>
            <MaterialIcon icon="share" size={24} />
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '25px', alignItems: 'center', position: 'relative', zIndex: 2, flexWrap: 'wrap' }}>
          <img 
            src={candidateData.image} 
            alt={candidateData.name}
            style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '20px',
              objectFit: 'cover',
              border: '4px solid white',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          />
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>{candidateData.name}</h1>
              <span style={{ 
                background: '#ffd700', 
                color: '#000', 
                padding: '6px 12px', 
                borderRadius: '20px', 
                fontSize: '14px', 
                fontWeight: '800' 
              }}>
                {candidateData.party}
              </span>
            </div>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '15px' }}>{candidateData.position}</p>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'rgba(255,255,255,0.9)' }}>
              {candidateData.manifestoTitle}
            </h2>
            
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '15px', 
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MaterialIcon icon="thumb_up" size={28} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '800' }}>{candidateData.overallSupport}%</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Overall Support</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '15px', 
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MaterialIcon icon="trending_up" size={28} color="#10b981" />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>+2.5%</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>This Week</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ManifestoHeader>

      <ManifestoContent>
        {/* Sentiment Analysis */}
        <Section>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111418', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MaterialIcon icon="sentiment_satisfied" size={24} color="#197fe6" />
            Public Sentiment Analysis
          </h3>
          
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: '600' }}>Positive</span>
                <span style={{ fontWeight: '800', color: '#10b981' }}>{candidateData.sentiment.positive}%</span>
              </div>
              <div style={{ height: '10px', background: '#e5e7eb', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${candidateData.sentiment.positive}%`, height: '100%', background: '#10b981' }} />
              </div>
            </div>
            
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: '600' }}>Neutral</span>
                <span style={{ fontWeight: '800', color: '#6b7280' }}>{candidateData.sentiment.neutral}%</span>
              </div>
              <div style={{ height: '10px', background: '#e5e7eb', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${candidateData.sentiment.neutral}%`, height: '100%', background: '#6b7280' }} />
              </div>
            </div>
            
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: '600' }}>Negative</span>
                <span style={{ fontWeight: '800', color: '#ef4444' }}>{candidateData.sentiment.negative}%</span>
              </div>
              <div style={{ height: '10px', background: '#e5e7eb', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${candidateData.sentiment.negative}%`, height: '100%', background: '#ef4444' }} />
              </div>
            </div>
          </div>
        </Section>

        {/* Support by County */}
        <Section>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111418', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MaterialIcon icon="map" size={24} color="#197fe6" />
            Support by County
          </h3>
          
          <SupportByCounty>
            {candidateData.countySupport.map(county => (
              <CountyCard key={county.name} support={county.support}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '800' }}>{county.name}</span>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '800', 
                    background: county.support > 70 ? '#d1fae5' : county.support > 40 ? '#fef3c7' : '#fee2e2',
                    color: county.support > 70 ? '#065f46' : county.support > 40 ? '#92400e' : '#991b1b',
                    padding: '4px 8px',
                    borderRadius: '12px'
                  }}>
                    {county.support}% Support
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  {county.voters}M Voters
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" />
                </div>
              </CountyCard>
            ))}
          </SupportByCounty>
        </Section>

        {/* Demographic Breakdown */}
        <Section>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111418', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MaterialIcon icon="pie_chart" size={24} color="#197fe6" />
            Demographic Support
          </h3>
          
          <StatsGrid>
            <StatCard>
              <div className="stat-value">{candidateData.demographics.youth}%</div>
              <div className="stat-label">Youth (18-35)</div>
              <div style={{ marginTop: '10px', fontSize: '11px', color: '#10b981' }}>
                <MaterialIcon icon="trending_up" size={16} /> +5% this month
              </div>
            </StatCard>
            
            <StatCard>
              <div className="stat-value">{candidateData.demographics.women}%</div>
              <div className="stat-label">Women Support</div>
              <div style={{ marginTop: '10px', fontSize: '11px', color: '#10b981' }}>
                <MaterialIcon icon="trending_up" size={16} /> +3% this month
              </div>
            </StatCard>
            
            <StatCard>
              <div className="stat-value">{candidateData.demographics.rural}%</div>
              <div className="stat-label">Rural Areas</div>
              <div style={{ marginTop: '10px', fontSize: '11px', color: '#f59e0b' }}>
                <MaterialIcon icon="trending_flat" size={16} /> Stable
              </div>
            </StatCard>
            
            <StatCard>
              <div className="stat-value">{candidateData.demographics.urban}%</div>
              <div className="stat-label">Urban Areas</div>
              <div style={{ marginTop: '10px', fontSize: '11px', color: '#10b981' }}>
                <MaterialIcon icon="trending_up" size={16} /> +8% this month
              </div>
            </StatCard>
          </StatsGrid>
        </Section>

        {/* Manifesto Sections */}
        <Section>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111418', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MaterialIcon icon="description" size={24} color="#197fe6" />
            Manifesto Details
          </h3>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
            {candidateData.sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                style={{
                  padding: '12px 20px',
                  background: activeSection === section.id ? '#197fe6' : '#f3f4f6',
                  color: activeSection === section.id ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}
              >
                <MaterialIcon icon={section.icon} size={20} />
                {section.title}
              </button>
            ))}
          </div>
          
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            {candidateData.sections
              .filter(section => section.id === activeSection)
              .map(section => (
                <div key={section.id}>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '15px', color: '#197fe6' }}>
                    {section.title}
                  </h4>
                  <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#374151' }}>
                    {section.content}
                  </p>
                  <button style={{
                    marginTop: '20px',
                    padding: '12px 24px',
                    background: '#197fe6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <MaterialIcon icon="download" size={20} />
                    Download Full Policy Document
                  </button>
                </div>
              ))}
          </div>
        </Section>

        {/* Engagement Metrics */}
        <Section>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111418', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MaterialIcon icon="analytics" size={24} color="#197fe6" />
            Digital Engagement
          </h3>
          
          <StatsGrid>
            <StatCard>
              <div className="stat-value">{candidateData.engagement.totalReach}</div>
              <div className="stat-label">Total Reach</div>
            </StatCard>
            
            <StatCard>
              <div className="stat-value">{candidateData.engagement.engagementRate}</div>
              <div className="stat-label">Engagement Rate</div>
            </StatCard>
            
            <StatCard>
              <div className="stat-value">{candidateData.engagement.shares}</div>
              <div className="stat-label">Shares</div>
            </StatCard>
            
            <StatCard>
              <div className="stat-value">{candidateData.engagement.comments}</div>
              <div className="stat-label">Comments</div>
            </StatCard>
          </StatsGrid>
        </Section>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '15px', marginTop: '40px', flexWrap: 'wrap' }}>
          <button style={{
            flex: 1,
            minWidth: '200px',
            padding: '18px',
            background: '#197fe6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '800',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 5px 20px rgba(25, 127, 230, 0.3)'
          }}>
            <MaterialIcon icon="how_to_vote" size={24} />
            Pledge Your Support
          </button>
          
          <button style={{
            flex: 1,
            minWidth: '200px',
            padding: '18px',
            background: 'white',
            color: '#197fe6',
            border: '2px solid #197fe6',
            borderRadius: '12px',
            fontWeight: '800',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <MaterialIcon icon="share" size={24} />
            Share Manifesto
          </button>
          
          <button style={{
            flex: 1,
            minWidth: '200px',
            padding: '18px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '800',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 5px 20px rgba(16, 185, 129, 0.3)'
          }}>
            <MaterialIcon icon="volunteer_activism" size={24} />
            Donate to Campaign
          </button>
        </div>
      </ManifestoContent>
    </ManifestoContainer>
  );
};

export default ManifestoPage;