import React, { useState } from "react";
import styled from "styled-components";
import { TrendingUp, Target, Award, Activity } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

const THEME = {
  emerald: "#10b981",
  amber: "#f59e0b",
  blue: "#3b82f6",
  textMuted: "#6B7280",
  border: "rgba(255, 255, 255, 0.08)",
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
`;

// Sleek transparent tiles with pure black background
const Tile = styled.div`
  background: #000000;
  border: 1px solid ${THEME.border};
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: ${(props) => props.$color || THEME.emerald};
  }

  ${(props) =>
    props.$active &&
    `
    border-color: ${props.$color || THEME.emerald};
    background: rgba(255, 255, 255, 0.02);
  `}

  .label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${THEME.textMuted};
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
  }

  .value {
    font-size: 20px;
    font-weight: 800;
    color: #fff;
  }
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
  @media (max-width: 850px) {
    grid-template-columns: 1fr;
  }
`;

const ChartWrapper = styled.div`
  background: #000000;
  border: 1px solid ${THEME.border};
  border-radius: 16px;
  padding: 10px;
  height: 240px;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 6px;

  border-radius: 10px;
  margin-top: 8px;
  overflow: hidden;
  position: relative;
`;

const ProgressBar = styled.div`
  height: 100%;
  width: ${(props) => props.$width}%;
  background: ${(props) => props.$color || THEME.emerald};
  box-shadow: 0 0 12px ${(props) => props.$color || THEME.emerald}66;
`;

const LeaderSupportMap = () => {
  const [selected, setSelected] = useState({
    name: "Nairobi",
    support: 62,
    color: THEME.emerald,
  });

  const regions = [
    { name: "Nairobi", support: 62, color: THEME.emerald },
    { name: "Kisumu", support: 84, color: THEME.blue },
    { name: "Mombasa", support: 55, color: THEME.amber },
    { name: "Kiambu", support: 41, color: "#ec4899" },
  ];

  const chartData = {
    labels: ["Phase 1", "Phase 2", "Phase 3", "Current"],
    datasets: [
      {
        data: [
          selected.support - 15,
          selected.support - 5,
          selected.support - 8,
          selected.support,
        ],
        borderColor: selected.color,
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#000",
        fill: true,
        backgroundColor: `${selected.color}11`,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#444", font: { size: 10 } },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.03)" },
        ticks: { display: false },
      },
    },
  };

  return (
    <Container>
      {/* Horizontal Selection */}
      <StatGrid>
        {regions.map((r) => (
          <Tile
            key={r.name}
            $active={selected.name === r.name}
            $color={r.color}
            onClick={() => setSelected(r)}
          >
            <div className="label">
              <span>{r.name}</span>
              <Activity size={12} />
            </div>
            <div className="value">{r.support}%</div>
          </Tile>
        ))}
      </StatGrid>

      <AnalyticsGrid>
        {/* Growth Trend */}
        <ChartWrapper>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: "#eee" }}>
              REGION PERFORMANCE
            </span>
            <span style={{ fontSize: 10, color: selected.color }}>
              +12.4% Momentum
            </span>
          </div>
          <div style={{ height: "160px" }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </ChartWrapper>

        {/* Manifesto Strength */}
        <ChartWrapper>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#eee",
              marginBottom: 20,
            }}
          >
            MANIFESTO IMPACT
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {[
              { label: "Economic Transformation", val: 82, color: THEME.blue },
              { label: "Health Infrastructure", val: 64, color: THEME.emerald },
              { label: "Youth Empowerment", val: 91, color: THEME.amber },
              { label: "Social Justice", val: 45, color: "#a855f7" },
            ].map((item) => (
              <div key={item.label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    color: THEME.textMuted,
                  }}
                >
                  <span>{item.label}</span>
                  <span style={{ color: "#fff" }}>{item.val}%</span>
                </div>
                <ProgressTrack>
                  <ProgressBar $width={item.val} $color={item.color} />
                </ProgressTrack>
              </div>
            ))}
          </div>
        </ChartWrapper>
      </AnalyticsGrid>

      {/* Global Quick Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              color: THEME.textMuted,
              fontSize: "10px",
              marginBottom: "4px",
            }}
          >
            NATIONAL RANK
          </div>
          <div style={{ color: "#fff", fontSize: "18px", fontWeight: 800 }}>
            #02
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              color: THEME.textMuted,
              fontSize: "10px",
              marginBottom: "4px",
            }}
          >
            BATTLEGROUNDS
          </div>
          <div
            style={{ color: THEME.amber, fontSize: "18px", fontWeight: 800 }}
          >
            08
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              color: THEME.textMuted,
              fontSize: "10px",
              marginBottom: "4px",
            }}
          >
            TOTAL REACH
          </div>
          <div style={{ color: THEME.blue, fontSize: "18px", fontWeight: 800 }}>
            4.2M
          </div>
        </div>
      </div>
    </Container>
  );
};

export default LeaderSupportMap;
