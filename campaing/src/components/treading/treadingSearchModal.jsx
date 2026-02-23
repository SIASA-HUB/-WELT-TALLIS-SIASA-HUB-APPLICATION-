import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { Search, X, TrendingUp, ArrowUp, Users, Target, Flame, BarChart3, Clock, Zap } from 'lucide-react';

const KENYA_COLORS = {
  primary: '#BB0000',
  accent: '#006600',
  neutral: '#6B7280',
  light: '#F8FAFC',
  dark: '#1F2937'
};

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const lineRise = keyframes`
  from { height: 0%; }
  to { height: var(--fill-height); }
`;

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.75); display: flex;
  justify-content: center; align-items: center; z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContainer = styled.div`
  background: white; border-radius: 20px; width: 100%; max-width: 500px;
  max-height: 85vh; overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  margin: 20px; display: flex; flex-direction: column;
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, ${KENYA_COLORS.primary}, ${KENYA_COLORS.accent});
  color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;
`;

const ModalContent = styled.div`
  padding: 20px; overflow-y: auto; flex-grow: 1;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;

const SearchItem = styled.div`
  background: white; border-radius: 12px; padding: 14px 16px;
  border: 1px solid #f1f5f9; display: flex; align-items: center;
  margin-bottom: 10px; cursor: pointer; transition: all 0.2s;
  position: relative;

  &:hover { 
    border-color: #10b981;
    background: #f0fdf4;
    transform: translateX(5px);
  }

  /* The rising green line on the left */
  &::before {
    content: ''; position: absolute; left: 0; bottom: 0; width: 4px;
    background: #10b981; border-radius: 0 4px 4px 0;
    animation: ${lineRise} 1.2s ease-out forwards;
    --fill-height: ${props => Math.min((props.$count / 50) * 100, 100)}%;
  }
`;

const RankBadge = styled.div`
  width: 32px; height: 32px; border-radius: 50%;
  background: ${props => props.$rank <= 3 ? '#1f2937' : '#f1f5f9'};
  color: ${props => props.$rank <= 3 ? 'white' : '#64748b'};
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 12px; margin-right: 12px;
`;

const SearchCount = styled.div`
  display: flex; align-items: center; gap: 4px;
  color: #059669; font-weight: 700; font-size: 15px;
  margin-left: auto; background: #ecfdf5;
  padding: 4px 10px; border-radius: 20px;
`;

const TrendingSearchesModal = ({ isOpen, onClose, onSearchSelect }) => {
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTrendingData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:9002/api/v1/searches/post/trending');
      if (res.data.success) setTrendingSearches(res.data.data.slice(0, 20));
    } catch (err) {
      console.error("Fetch failed", err);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (isOpen) fetchTrendingData(); }, [isOpen]);

  const getIcon = (text) => {
    const t = text.toLowerCase();
    if (t.includes('ruto') || t.includes('raila') || t.includes('gachagua')) return <Users size={16} color="#2563eb" />;
    if (t.includes('road') || t.includes('infrastructure')) return <BarChart3 size={16} color="#7c3aed" />;
    return <Flame size={16} color="#f97316" />;
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <TrendingUp size={24} />
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Top 20 Trends</h2>
              <span style={{ fontSize: '11px', opacity: 0.8 }}>Real-time search volume</span>
            </div>
          </div>
          <X size={24} onClick={onClose} style={{ cursor: 'pointer' }} />
        </ModalHeader>

        <ModalContent>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Calculating trends...</div>
          ) : (
            trendingSearches.map((item, index) => (
              <SearchItem 
                key={index} 
                $count={item.search_count}
                onClick={() => { onSearchSelect(item.search_input); onClose(); }}
              >
                <RankBadge $rank={index + 1}>{index + 1}</RankBadge>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {getIcon(item.search_input)}
                  <span style={{ fontWeight: 600, color: '#1e2937', fontSize: '14px' }}>
                    {item.search_input}
                  </span>
                </div>

                <SearchCount>
                  {item.search_count}
                  <ArrowUp 
                    size={14} 
                    style={{ 
                      strokeWidth: 3,
                      // Arrow gets more visible/vibrant for higher counts
                      opacity: item.search_count > 5 ? 1 : 0.5 
                    }} 
                  />
                </SearchCount>
              </SearchItem>
            ))
          )}
          
          <div style={{ textAlign: 'center', marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '11px', color: '#94a3b8' }}>
                <Clock size={12} /> Last updated 24h search cycle
             </div>
          </div>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default TrendingSearchesModal;