import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Users, ShieldCheck, MapPin, ArrowRight, Zap } from "lucide-react";
import axios from "axios";
import API from "../../api/config";

const Container = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #e9ecef;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #1a1a2e;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const CompetitorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const CompetitorCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;

  &:hover {
    border-color: #1e3c72;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    object-fit: cover;
    background: #e2e8f0;
  }

  .info {
    flex: 1;
    min-width: 0;

    .name {
      font-weight: 700;
      color: #1a1a2e;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .pos {
      font-size: 11px;
      color: #64748b;
      margin: 2px 0;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 6px;
      
      .party {
        font-size: 10px;
        font-weight: 700;
        color: #1e3c72;
        background: rgba(30, 60, 114, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
      }
    }
  }
`;

const CompetitorsSection = ({ leader }) => {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompetitors = async () => {
      const leaderId = leader?.leader_id || leader?.id;
      if (!leaderId) return;

      try {
        const res = await axios.get(`${API.LEADERS}/${leaderId}/competitors`);
        if (res.data.success) {
          setCompetitors(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching competitors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitors();
  }, [leader]);

  if (loading) return <div>Loading competitors...</div>;

  return (
    <Container>
      <SectionHeader>
        <h3><Users size={20} /> Field Competitors</h3>
        <span style={{ fontSize: '12px', color: '#64748b' }}>{competitors.length} Active Rivals</span>
      </SectionHeader>

      {competitors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          No immediate competitors found in your category/region.
        </div>
      ) : (
        <CompetitorGrid>
          {competitors.map(comp => (
            <CompetitorCard key={comp.leader_id}>
              <img 
                className="avatar" 
                src={comp.image_url ? (comp.image_url.startsWith('http') ? comp.image_url : `${API.IMAGES}${comp.image_url}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(comp.name)}&background=1e3c72&color=fff`} 
                alt={comp.name} 
              />
              <div className="info">
                <div className="name">
                    {comp.name}
                    {comp.verification === 1 && <ShieldCheck size={14} color="#10b981" />}
                </div>
                <div className="pos">{comp.position_running_for || comp.position}</div>
                <div className="meta">
                   <span className="party">{comp.party || "IND"}</span>
                   <span style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <MapPin size={10} /> {comp.ward || comp.county}
                   </span>
                </div>
              </div>
            </CompetitorCard>
          ))}
        </CompetitorGrid>
      )}
    </Container>
  );
};

export default CompetitorsSection;
