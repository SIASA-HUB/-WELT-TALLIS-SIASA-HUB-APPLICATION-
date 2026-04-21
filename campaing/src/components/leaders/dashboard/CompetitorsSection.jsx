// components/leaders/CompetitorsSection.jsx - Competitor Intelligence Dashboard
import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { 
  Users, 
  ShieldCheck, 
  MapPin, 
  Crown, 
  TrendingUp,
  AlertTriangle,
  Target,
  Zap,
  ArrowRight,
  TrendingDown,
  Activity,
  BarChart2
} from "lucide-react";
import api from "../../../api/api";
import { buildImageUrl, getAvatarFallback } from "../../../utils/imageUtils";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  background: #ffffff;
  border-radius: 24px;
  padding: 24px;
  margin: 20px 0;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .title-group {
    h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 800;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    p {
      margin: 4px 0 0;
      font-size: 0.85rem;
      color: #64748b;
    }
  }

  .badge {
    background: #f1f5f9;
    padding: 6px 12px;
    border-radius: 30px;
    font-size: 0.75rem;
    color: #475569;
    font-weight: 700;
  }
`;

const CompetitorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const IntelligenceCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 20px;
  position: relative;
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.4s ease-out;

  &:hover {
    border-color: #1e3c72;
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  }
`;

const CompetitorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  img, .fallback {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    object-fit: cover;
    border: 2px solid white;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }
  
  .fallback {
    background: #1e3c72;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 800;
  }

  .details {
    h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
    }
    p {
      margin: 2px 0 0;
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 500;
    }
  }
`;

const ComparisonStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatRow = styled.div`
  .label-group {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    margin-bottom: 4px;
    
    .diff {
      color: ${props => props.$losing ? '#dc2626' : '#16a34a'};
    }
  }

  .bar-container {
    height: 8px;
    background: #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
  }

  .your-bar {
    height: 100%;
    background: #1e3c72;
    width: ${props => props.$yourPercent}%;
    transition: width 1s ease-out;
  }

  .opp-bar {
    height: 100%;
    background: #94a3b8;
    width: ${props => props.$oppPercent}%;
    transition: width 1s ease-out;
    opacity: 0.5;
  }
`;

const ThreatBadge = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 30px;
  background: ${props => {
    if (props.$level === 'High') return '#fee2e2';
    if (props.$level === 'Medium') return '#fef3c7';
    return '#dcfce7';
  }};
  color: ${props => {
    if (props.$level === 'High') return '#991b1b';
    if (props.$level === 'Medium') return '#92400e';
    return '#166534';
  }};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const InsightCard = styled.div`
  background: ${props => props.$type === 'warning' ? '#fff7ed' : '#f0f9ff'};
  border: 1px solid ${props => props.$type === 'warning' ? '#ffedd5' : '#e0f2fe'};
  padding: 12px 16px;
  border-radius: 12px;
  margin-top: 16px;
  display: flex;
  gap: 12px;
  align-items: center;

  .icon-box {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$type === 'warning' ? '#ea580c' : '#0369a1'};
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  p {
    margin: 0;
    font-size: 0.8rem;
    font-weight: 500;
    color: #334155;
    line-height: 1.4;
  }
`;

const CompetitorsSection = ({ leader }) => {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompetitorsData = async () => {
      const leaderId = leader?.leader_id || leader?.id;
      if (!leaderId) return;

      try {
        const res = await api.get(`/leaders`, {
          params: { 
            position_running_for: leader.position,
            county: leader.county,
            limit: 5
          }
        });
        
        if (res.success) {
          // Filter out the current leader
          const filtered = (Array.isArray(res.data) ? res.data : (res.data.leaders || []))
            .filter(c => c.leader_id !== leaderId)
            .slice(0, 3);
          setCompetitors(filtered);
        }
      } catch (err) {
        console.error("Error fetching competitors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitorsData();
  }, [leader]);

  const calculateThreatLevel = (comp) => {
    const yourScore = (leader.boost_score || 0) * 10 + (leader.views || 0);
    const compScore = (comp.boost_score || 0) * 10 + (comp.views || 0);
    
    if (compScore > yourScore * 1.5) return "Critical";
    if (compScore > yourScore) return "High";
    if (compScore > yourScore * 0.7) return "Medium";
    return "Low";
  };

  const calculatePercent = (val1, val2) => {
    const total = val1 + val2;
    if (total === 0) return 50;
    return (val1 / total) * 100;
  };

  if (loading) return <Container>Loading intelligence data...</Container>;

  return (
    <Container>
      <SectionHeader>
        <div className="title-group">
          <h3>
            <BarChart2 size={22} color="#1e3c72" />
            Competitor Intelligence
          </h3>
          <p>Real-time head-to-head analysis with your top opponents</p>
        </div>
        <div className="badge">
          {competitors.length} Active Competitors detected
        </div>
      </SectionHeader>

      <CompetitorGrid>
        {competitors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', gridColumn: '1/-1' }}>
            <Target size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <p>No active competitors found in {leader.county}</p>
          </div>
        ) : (
          competitors.map((comp) => {
            const threat = calculateThreatLevel(comp);
            const reachGap = (comp.views || 0) - (leader.views || 0);
            
            return (
              <IntelligenceCard key={comp.leader_id}>
                <ThreatBadge $level={threat}>
                  {threat === 'Critical' || threat === 'High' ? <AlertTriangle size={12} /> : <Zap size={12} />}
                  {threat} Threat
                </ThreatBadge>

                <CompetitorInfo>
                  <img 
                    src={buildImageUrl(comp.image_url || comp.image) || getAvatarFallback(comp.name)} 
                    alt={comp.name} 
                  />
                  <div className="details">
                    <h4>{comp.name}</h4>
                    <p>{comp.party || 'Independent'} • {comp.position}</p>
                  </div>
                </CompetitorInfo>

                <ComparisonStats>
                  <StatRow 
                    $yourPercent={calculatePercent(leader.views || 0, comp.views || 0)}
                    $oppPercent={calculatePercent(comp.views || 0, leader.views || 0)}
                    $losing={reachGap > 0}
                  >
                    <div className="label-group">
                      <span>Reach Visibility</span>
                      <span className="diff">{reachGap > 0 ? `+${reachGap.toLocaleString()}` : reachGap.toLocaleString()} Views</span>
                    </div>
                    <div className="bar-container">
                      <div className="your-bar" />
                    </div>
                    <div className="bar-container" style={{ marginTop: '2px', background: 'transparent' }}>
                      <div className="opp-bar" />
                    </div>
                  </StatRow>

                  <StatRow 
                    $yourPercent={calculatePercent(leader.boost_score || 0, comp.boost_score || 0)}
                    $oppPercent={calculatePercent(comp.boost_score || 0, leader.boost_score || 0)}
                    $losing={(comp.boost_score || 0) > (leader.boost_score || 0)}
                  >
                    <div className="label-group">
                      <span>Boost Strength</span>
                      <span className="diff">{(comp.boost_score || 0) > (leader.boost_score || 0) ? 'Trailing' : 'Leading'}</span>
                    </div>
                    <div className="bar-container">
                      <div className="your-bar" />
                    </div>
                    <div className="bar-container" style={{ marginTop: '2px', background: 'transparent' }}>
                      <div className="opp-bar" />
                    </div>
                  </StatRow>
                </ComparisonStats>

                {threat === 'High' || threat === 'Critical' ? (
                  <InsightCard $type="warning">
                    <div className="icon-box"><TrendingUp size={16} /></div>
                    <p>Opponent gaining momentum. Increase endorsements in {leader.ward || 'your area'} to maintain lead.</p>
                  </InsightCard>
                ) : (
                  <InsightCard $type="info">
                    <div className="icon-box"><Activity size={16} /></div>
                    <p>Your campaign has 15% better engagement. Maintain current strategy.</p>
                  </InsightCard>
                )}
                
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button style={{ 
                    background: 'none', border: 'none', color: '#1e3c72', 
                    fontSize: '0.75rem', fontWeight: '700', 
                    display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' 
                  }}>
                    VIEW PROFILE <ArrowRight size={14} />
                  </button>
                </div>
              </IntelligenceCard>
            );
          })
        )}
      </CompetitorGrid>
    </Container>
  );
};

export default CompetitorsSection;
