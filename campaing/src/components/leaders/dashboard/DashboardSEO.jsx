import React from "react";
import SEO from "@/utils/SEO";

const DashboardSEO = ({ leader, activeTab }) => {
  const getTitle = () => {
    const base = "Command Center";
    switch (activeTab) {
      case "dashboard": return `${base} | Intelligence & Overview`;
      case "manifesto": return `${base} | Manifesto Management`;
      case "rally": return `${base} | Rally & Events`;
      case "supporters": return `${base} | Voter Database`;
      case "analytics": return `${base} | Advanced Analytics`;
      case "settings": return `${base} | Profile SEO Settings`;
      default: return base;
    }
  };

  const getDescription = () => {
    return `Real-time campaign command center for ${leader?.name || "Aspirant"}. Track reach, sentiment, and competitor analysis for the ${leader?.position || "Political"} race.`;
  };

  return (
    <SEO 
      title={getTitle()} 
      description={getDescription()}
      ogType="website"
    />
  );
};

export default DashboardSEO;
