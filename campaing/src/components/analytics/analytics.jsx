import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Kenyan counties data
const kenyanCounties = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { 
        "name": "Nairobi", 
        "support": { "Ruto": 52, "Raila": 40, "Others": 8 },
        "votes": 2450000 
      },
      "geometry": { "type": "Point", "coordinates": [36.8219, -1.2921] }
    },
    {
      "type": "Feature",
      "properties": { 
        "name": "Mombasa", 
        "support": { "Ruto": 38, "Raila": 55, "Others": 7 },
        "votes": 1200000 
      },
      "geometry": { "type": "Point", "coordinates": [39.6682, -4.0435] }
    },
    {
      "type": "Feature",
      "properties": { 
        "name": "Kisumu", 
        "support": { "Ruto": 15, "Raila": 82, "Others": 3 },
        "votes": 980000 
      },
      "geometry": { "type": "Point", "coordinates": [34.7619, -0.1022] }
    },
    {
      "type": "Feature",
      "properties": { 
        "name": "Nakuru", 
        "support": { "Ruto": 65, "Raila": 30, "Others": 5 },
        "votes": 1650000 
      },
      "geometry": { "type": "Point", "coordinates": [36.0665, -0.3031] }
    },
    {
      "type": "Feature",
      "properties": { 
        "name": "Eldoret", 
        "support": { "Ruto": 85, "Raila": 10, "Others": 5 },
        "votes": 850000 
      },
      "geometry": { "type": "Point", "coordinates": [35.2692, 0.5143] }
    },
    {
      "type": "Feature",
      "properties": { 
        "name": "Kakamega", 
        "support": { "Ruto": 25, "Raila": 70, "Others": 5 },
        "votes": 1100000 
      },
      "geometry": { "type": "Point", "coordinates": [34.7520, 0.2827] }
    },
    {
      "type": "Feature",
      "properties": { 
        "name": "Meru", 
        "support": { "Ruto": 60, "Raila": 35, "Others": 5 },
        "votes": 950000 
      },
      "geometry": { "type": "Point", "coordinates": [37.6559, 0.0515] }
    },
    {
      "type": "Feature",
      "properties": { 
        "name": "Kisii", 
        "support": { "Ruto": 40, "Raila": 55, "Others": 5 },
        "votes": 880000 
      },
      "geometry": { "type": "Point", "coordinates": [34.7667, -0.6833] }
    },
    {
      "type": "Feature",
      "properties": { 
        "name": "Garissa", 
        "support": { "Ruto": 45, "Raila": 48, "Others": 7 },
        "votes": 420000 
      },
      "geometry": { "type": "Point", "coordinates": [39.6464, -0.4532] }
    },
    {
      "type": "Feature",
      "properties": { 
        "name": "Machakos", 
        "support": { "Ruto": 48, "Raila": 45, "Others": 7 },
        "votes": 920000 
      },
      "geometry": { "type": "Point", "coordinates": [37.2634, -1.5168] }
    }
  ]
};

// Styled Components
const AnalyticsSectionContainer = styled.div`
  background: white;
  margin: 24px 20px;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MapContainerStyled = styled.div`
  height: 300px;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.8);
  margin-bottom: 20px;
  
  .leaflet-container {
    height: 100%;
    width: 100%;
    border-radius: 16px;
  }
`;

const Legend = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #0f172a;
  
  .color-box {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    background: ${props => props.color};
  }
`;

const SupportChart = styled.div`
  margin-top: 24px;
`;

const CandidateBar = styled.div`
  margin-bottom: 12px;
`;

const BarLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13px;
  color: #0f172a;
`;

const BarContainer = styled.div`
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  width: ${props => props.width}%;
  background: ${props => props.color};
  border-radius: 4px;
  transition: width 0.5s ease;
`;

const SVGIcon = ({ name, size = 24, color = 'currentColor' }) => {
  const icons = {
    map: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    )
  };
  return icons[name] || null;
};

const AnalyticsSection = () => {
  const [mapReady, setMapReady] = useState(false);
  const [mapCenter] = useState([0.0236, 37.9062]);
  const [mapZoom] = useState(6);

  useEffect(() => {
    setMapReady(true);
  }, []);

  const theme = {
    colors: {
      ruto: '#ff0000',
      raila: '#0000ff',
      others: '#808080'
    }
  };

  const overallSupport = {
    Ruto: 48,
    Raila: 45,
    Others: 7
  };

  const getDominantCandidate = (support) => {
    const candidates = Object.entries(support);
    candidates.sort((a, b) => b[1] - a[1]);
    return candidates[0][0];
  };

  if (!mapReady) {
    return (
      <AnalyticsSectionContainer>
        <SectionTitle>
          <SVGIcon name="map" size={20} color="#197fe6" />
          Loading Kenyan Election Heat Map...
        </SectionTitle>
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
          Loading map data...
        </div>
      </AnalyticsSectionContainer>
    );
  }

  return (
    <AnalyticsSectionContainer>
      <SectionTitle>
        <SVGIcon name="map" size={20} color="#197fe6" />
        Kenyan Election Heat Map
      </SectionTitle>
      
      <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
        Real-time support distribution across major counties
      </p>

      <MapContainerStyled>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {kenyanCounties.features.map((county, index) => (
            <GeoJSON
              key={index}
              data={county}
              pointToLayer={(feature, latlng) => {
                const support = feature.properties.support;
                const dominant = getDominantCandidate(support);
                const percentage = support[dominant];
                
                const color = dominant === 'Ruto' ? theme.colors.ruto :
                             dominant === 'Raila' ? theme.colors.raila :
                             theme.colors.others;
                
                return L.circleMarker(latlng, {
                  radius: 15 + (percentage / 5),
                  fillColor: color,
                  color: '#fff',
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.7
                });
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                <div style={{ padding: '8px', minWidth: '150px' }}>
                  <strong>{county.properties.name}</strong><br />
                  <div style={{ marginTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Ruto:</span>
                      <span style={{ color: theme.colors.ruto, fontWeight: 'bold' }}>
                        {county.properties.support.Ruto}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Raila:</span>
                      <span style={{ color: theme.colors.raila, fontWeight: 'bold' }}>
                        {county.properties.support.Raila}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Others:</span>
                      <span style={{ color: theme.colors.others, fontWeight: 'bold' }}>
                        {county.properties.support.Others}%
                      </span>
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '11px', color: '#666' }}>
                      Total votes: {county.properties.votes.toLocaleString()}
                    </div>
                  </div>
                </div>
              </Tooltip>
            </GeoJSON>
          ))}
        </MapContainer>
      </MapContainerStyled>

      <Legend>
        <LegendItem color={theme.colors.ruto}>
          <div className="color-box" />
          <span>Ruto Stronghold</span>
        </LegendItem>
        <LegendItem color={theme.colors.raila}>
          <div className="color-box" />
          <span>Raila Stronghold</span>
        </LegendItem>
        <LegendItem color={theme.colors.others}>
          <div className="color-box" />
          <span>Competitive/Others</span>
        </LegendItem>
      </Legend>

      <SupportChart>
        <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#0f172a' }}>
          Overall National Support
        </h3>
        
        {Object.entries(overallSupport).map(([candidate, percentage]) => (
          <CandidateBar key={candidate}>
            <BarLabel>
              <span>{candidate === 'Ruto' ? 'William Ruto' : candidate === 'Raila' ? 'Raila Odinga' : 'Others'}</span>
              <span style={{ fontWeight: 'bold' }}>{percentage}%</span>
            </BarLabel>
            <BarContainer>
              <BarFill 
                width={percentage} 
                color={candidate === 'Ruto' ? theme.colors.ruto : candidate === 'Raila' ? theme.colors.raila : theme.colors.others}
              />
            </BarContainer>
          </CandidateBar>
        ))}
      </SupportChart>

      <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#0f172a' }}>
          📊 Key Insights
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#94a3b8' }}>
          <li>Ruto leads in Rift Valley and Central regions</li>
          <li>Raila dominates Nyanza and Western Kenya</li>
          <li>Nairobi remains a key battleground</li>
          <li>Coastal region showing competitive race</li>
        </ul>
      </div>
    </AnalyticsSectionContainer>
  );
};

export default AnalyticsSection;