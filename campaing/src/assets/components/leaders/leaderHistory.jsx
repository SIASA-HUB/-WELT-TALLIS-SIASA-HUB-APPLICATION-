// LeaderHistorySwahili.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { History, CheckCircle, AlertTriangle, Calendar, Award, Target } from 'lucide-react';

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

const HistoryContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 20px;
`;

const HistoryItem = styled.div`
  border-left: 4px solid ${props => props.$type === 'success' ? KENYA_THEME.support : 
                            props.$type === 'warning' ? KENYA_THEME.trending : 
                            props.$type === 'negative' ? KENYA_THEME.opposition : KENYA_THEME.neutral};
  padding: 20px;
  margin-bottom: 20px;
  background: ${props => props.$type === 'success' ? '#f0fdf4' : 
                        props.$type === 'warning' ? '#fffbeb' : 
                        props.$type === 'negative' ? '#fef2f2' : KENYA_THEME.background};
  border-radius: 12px;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateX(5px);
  }
`;

const LeaderHistorySwahili = ({ leaderId, leaderData }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch history data
    const fetchHistory = async () => {
      try {
        // This would fetch from your backend
        // For now, using sample data
        const sampleHistory = [
          {
            id: 1,
            title: "Uteuzi kama Mwenyekiti wa Kamati ya Elimu",
            description: "Alichaguliwa kuwa mwenyekiti wa kamati ya elimu bungeni, akiongoza mabadiliko ya mfumo wa elimu",
            date: "2023-03-15",
            type: "success",
            impact: "Kubwa",
            verified: true
          },
          {
            id: 2,
            title: "Mradi wa Barabara Haijakamilika",
            description: "Mradi wa barabara ulioahidiwa haujakamilika kwa muda uliokusudiwa",
            date: "2023-05-10",
            type: "negative",
            impact: "Wastani",
            warning: "Ahadi ya uwongo inayodaiwa"
          },
          {
            id: 3,
            title: "Utunzaji wa Afya wa Wazee",
            description: "Aliunga mkono na kusaidia kupitishwa kwa mswada wa utunzaji wa afya kwa wazee",
            date: "2023-04-22",
            type: "success",
            impact: "Kubwa",
            verified: true
          },
          {
            id: 4,
            title: "Programu ya Ajira kwa Vijana",
            description: "Alizindua programu ya ajira iliyosaidia vijana 5,000 kupata ajira",
            date: "2023-02-28",
            type: "success",
            impact: "Kubwa",
            verified: true
          }
        ];
        
        setHistory(sampleHistory);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [leaderId]);

  const getSwahiliLabel = (type) => {
    switch(type) {
      case 'success': return 'Mafanikio';
      case 'warning': return 'Onyo';
      case 'negative': return 'Hasara';
      default: return 'Tukio';
    }
  };

  const getImpactColor = (impact) => {
    switch(impact) {
      case 'Kubwa': return '#10b981';
      case 'Wastani': return '#f59e0b';
      case 'Ndogo': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <HistoryContainer>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '16px', color: KENYA_THEME.text.secondary }}>
            Inapakia historia ya kiongozi...
          </div>
        </div>
      </HistoryContainer>
    );
  }

  return (
    <HistoryContainer>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px', 
        marginBottom: '25px' 
      }}>
        <History size={28} color={KENYA_THEME.primary} />
        <div>
          <h3 style={{ margin: '0', color: KENYA_THEME.text.primary }}>
            Historia ya Utendaji (kwa Kiswahili)
          </h3>
          <p style={{ margin: '5px 0 0 0', color: KENYA_THEME.text.secondary, fontSize: '14px' }}>
            Rekodi ya matendo, mafanikio na changamoto za kiongozi huyu
          </p>
        </div>
      </div>

      {/* Statistics Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: '#f0fdf4',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#065f46' }}>
            {history.filter(h => h.type === 'success').length}
          </div>
          <div style={{ fontSize: '14px', color: '#047857', fontWeight: '600' }}>
            Mafanikio
          </div>
        </div>
        
        <div style={{
          background: '#fffbeb',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#92400e' }}>
            {history.filter(h => h.type === 'warning').length}
          </div>
          <div style={{ fontSize: '14px', color: '#d97706', fontWeight: '600' }}>
            Matukio ya Onyo
          </div>
        </div>
        
        <div style={{
          background: '#fef2f2',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#991b1b' }}>
            {history.filter(h => h.type === 'negative').length}
          </div>
          <div style={{ fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>
            Changamoto
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div style={{ position: 'relative' }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute',
          left: '40px',
          top: 0,
          bottom: 0,
          width: '3px',
          background: KENYA_THEME.border,
          zIndex: 1
        }} />
        
        {history.map((item, index) => (
          <div key={item.id} style={{ 
            position: 'relative', 
            zIndex: 2,
            marginBottom: '25px',
            marginLeft: '60px'
          }}>
            {/* Timeline dot */}
            <div style={{
              position: 'absolute',
              left: '-45px',
              top: '10px',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: item.type === 'success' ? KENYA_THEME.support : 
                          item.type === 'warning' ? KENYA_THEME.trending : 
                          item.type === 'negative' ? KENYA_THEME.opposition : KENYA_THEME.neutral,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              {index + 1}
            </div>
            
            <HistoryItem $type={item.type}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', color: KENYA_THEME.text.primary }}>
                      {item.title}
                    </h4>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: item.type === 'success' ? '#d1fae5' : 
                                  item.type === 'warning' ? '#fef3c7' : 
                                  item.type === 'negative' ? '#fee2e2' : '#f1f5f9',
                      color: item.type === 'success' ? '#065f46' : 
                             item.type === 'warning' ? '#92400e' : 
                             item.type === 'negative' ? '#991b1b' : KENYA_THEME.text.primary
                    }}>
                      {getSwahiliLabel(item.type)}
                    </span>
                  </div>
                  
                  <p style={{ 
                    margin: '0 0 15px 0', 
                    fontSize: '14px', 
                    color: KENYA_THEME.text.secondary,
                    lineHeight: '1.6'
                  }}>
                    {item.description}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: KENYA_THEME.text.secondary }}>
                      <Calendar size={14} />
                      {item.date}
                    </span>
                    
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      color: getImpactColor(item.impact),
                      fontWeight: '600'
                    }}>
                      <Target size={14} />
                      Athari: {item.impact}
                    </span>
                  </div>
                </div>
                
                {item.verified && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#d1fae5',
                    color: '#065f46',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    <CheckCircle size={14} />
                    Imethibitishwa
                  </div>
                )}
                
                {item.warning && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#fef3c7',
                    color: '#92400e',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    <AlertTriangle size={14} />
                    Onyo
                  </div>
                )}
              </div>
              
              {/* Impact Analysis */}
              <div style={{ 
                marginTop: '15px',
                padding: '12px',
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '8px',
                fontSize: '13px',
                color: KENYA_THEME.text.secondary
              }}>
                <strong>Uchambuzi:</strong> Tukio hili linaonyesha {item.type === 'success' ? 'mafanikio katika' : 
                item.type === 'warning' ? 'changamoto katika' : 'kusitishwa kwa'} utekelezaji wa wajibu wa kiongozi.
              </div>
            </HistoryItem>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div style={{
        marginTop: '30px',
        padding: '25px',
        background: `linear-gradient(135deg, ${KENYA_THEME.background} 0%, #e2e8f0 100%)`,
        borderRadius: '12px',
        border: `1px solid ${KENYA_THEME.border}`
      }}>
        <h4 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          marginBottom: '15px',
          color: KENYA_THEME.text.primary
        }}>
          <Award size={20} />
          Muhtasari wa Historia ya Utendaji
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <h5 style={{ margin: '0 0 10px 0', color: KENYA_THEME.text.secondary, fontSize: '14px' }}>
              Nguvu Kuu
            </h5>
            <ul style={{ 
              margin: 0, 
              paddingLeft: '20px', 
              fontSize: '14px', 
              color: KENYA_THEME.text.primary,
              lineHeight: '1.6'
            }}>
              <li>Uongozi katika mabadiliko ya elimu</li>
              <li>Utekelezaji wa miradi ya kijamii</li>
              <li>Ushirikiano na jamii</li>
            </ul>
          </div>
          
          <div>
            <h5 style={{ margin: '0 0 10px 0', color: KENYA_THEME.text.secondary, fontSize: '14px' }}>
              Maeneo ya Kuboresha
            </h5>
            <ul style={{ 
              margin: 0, 
              paddingLeft: '20px', 
              fontSize: '14px', 
              color: KENYA_THEME.text.primary,
              lineHeight: '1.6'
            }}>
              <li>Utekelezaji wa miradi ya miundombinu</li>
              <li>Ufuatiliaji wa ahadi za uwongo</li>
              <li>Uwazi katika matumizi ya fedha</li>
            </ul>
          </div>
        </div>
      </div>
    </HistoryContainer>
  );
};

export default LeaderHistorySwahili;