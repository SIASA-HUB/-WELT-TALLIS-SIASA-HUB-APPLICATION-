import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { BookOpen, Info } from "lucide-react";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import theme from "../../utils/theme.jsx";
import AppLoadingBar from "../../utils/LoadingBar.jsx";
// API Configuration
import API from "../../api/config";
import api from "../../api/api";


// Lazy load components
const LeaderHeader = lazy(() => import("./leaderHeader.jsx"));
const ManifestoPage = lazy(() => import("./manifestos/manifestoPage"));
const LeaderFooter = lazy(() => import("./leaderFooter.jsx"));

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  background: ${theme.colors.dark || "#0a0a0a"};
  min-height: 100vh;
  width: 100%;
  position: relative;
  color: ${theme.colors.white || "#ffffff"};
  display: flex;
  flex-direction: column;
`;

const LoadingWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99999;
  pointer-events: none;
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 10px;
  animation: ${fadeIn} 0.5s ease-out;
  flex: 1;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 12px 0;
  scrollbar-width: none;
  position: sticky;
  top: 0;
  background: ${theme.colors.dark || "#0a0a0a"};
  z-index: 10;
  border-bottom: 1px solid ${theme.colors.border || "rgba(255,255,255,0.1)"};

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabButton = styled.button`
  padding: 8px 18px;
  background: ${(props) =>
    props.$active
      ? `rgba(${theme.colors.primaryRgb || "255, 92, 1"}, 0.1)`
      : "transparent"};
  color: ${(props) =>
    props.$active
      ? theme.colors.primary || "#ff5c01"
      : theme.colors.gray || "#94a3b8"};
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  border: ${(props) =>
    props.$active
      ? `1px solid ${theme.colors.primary || "#ff5c01"}`
      : "1px solid transparent"};
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    color: ${theme.colors.primary || "#ff5c01"};
    background: rgba(255, 92, 1, 0.05);
    border-color: ${theme.colors.primary || "#ff5c01"};
  }
`;

const SectionCard = styled.div`
  margin: 20px 0;
  animation: ${fadeIn} 0.5s ease-out;
`;

const PlaceholderCard = styled.div`
  background: ${theme.colors.surface || "#111111"};
  border: 1px solid ${theme.colors.border || "rgba(255,255,255,0.1)"};
  border-radius: 16px;
  padding: 40px;
  margin: 20px 0;
  text-align: center;
  color: ${theme.colors.gray || "#94a3b8"};
`;

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.dark || "#0a0a0a"};
  text-align: center;
  padding: 20px;
`;

const SkeletonHeader = styled.div`
  height: 200px;
  background: ${theme.colors.surface || "#111111"};
  margin: 0 16px;
  border-radius: 16px;
`;

const BioSection = styled.div`
  background: ${theme.colors.surface || "#111111"};
  border: 1px solid ${theme.colors.border || "rgba(255,255,255,0.1)"};
  border-radius: 16px;
  padding: 24px;
`;

const BioHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const BioIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${theme.colors.primary || "#ff5c01"};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const BioInfo = styled.div`
  flex: 1;
`;

const BioTitle = styled.h2`
  margin: 0 0 4px 0;
  color: ${theme.colors.white || "#ffffff"};
  font-size: 1.3rem;
  font-weight: 600;
`;

const BioPosition = styled.p`
  color: ${theme.colors.primary || "#ff5c01"};
  font-weight: 500;
  font-size: 0.8rem;
  margin: 0;
`;

const BioText = styled.p`
  line-height: 1.6;
  color: ${theme.colors.gray || "#94a3b8"};
  font-size: 0.9rem;
  margin: 0;
`;

const LeaderInsightPage = ({ leaderId: propLeaderId, onBack }) => {
  const { id: urlId, slug: urlSlug } = useParams();
  const navigate = useNavigate();
  
  // Store the actual leader_id from the API response
  const [actualLeaderId, setActualLeaderId] = useState(null);
  const activeSlug = urlSlug;

  const loadingBarRef = useRef(null);
  const dataFetchedRef = useRef(false);

  const [activeTab, setActiveTab] = useState("manifestos");
  const [leader, setLeader] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeaderData = async () => {
      const identifier = propLeaderId || urlId || urlSlug;
      if (!identifier || dataFetchedRef.current) return;

      loadingBarRef.current?.continuousStart(30);
      setIsLoading(true);

      try {
        let endpoint;
        if (urlSlug || (identifier && !identifier.startsWith("LDR_"))) {
          const slugValue = urlSlug || identifier;
          endpoint = `/leaders/profile/${slugValue}`;
        } else {
          endpoint = `/leaders/${identifier}`;
        }

        
        const responseData = await api.get(endpoint);

        if (responseData?.success) {
          const leaderData = responseData.data;

          setLeader(leaderData);
          setActualLeaderId(leaderData.leader_id);
          
        } else {
          setError("Leader not found");
        }

        dataFetchedRef.current = true;
      } catch (err) {
        console.error("Failed to load leader profile:", err);
        setError("Failed to load leader profile");
      } finally {
        loadingBarRef.current?.complete();
        setIsLoading(false);
      }
    };

    loadLeaderData();
  }, [propLeaderId, urlId, urlSlug]);

  const handleBack = () => (onBack ? onBack() : navigate(-1));

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingWrapper>
          <AppLoadingBar
            ref={loadingBarRef}
            color={theme.colors.primary || "#ff5c01"}
            height={3}
          />
        </LoadingWrapper>
        <ContentContainer>
          <SkeletonHeader />
        </ContentContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <div>
          <h2 style={{ color: theme.colors.primary, marginBottom: 16, fontSize: 28 }}>
            Oops!
          </h2>
          <p style={{ color: theme.colors.gray, marginBottom: 24 }}>{error}</p>
          <button
            onClick={handleBack}
            style={{
              padding: "10px 28px",
              background: theme.colors.primary,
              borderRadius: 30,
              cursor: "pointer",
              color: "#000",
              fontWeight: 600,
              border: "none",
            }}
          >
            Go Back
          </button>
        </div>
      </ErrorContainer>
    );
  }

  // Build SEO metadata
  const seoTitle = leader
    ? `${leader.name} (${leader.party || 'Independent'}) - ${leader.position_running_for || leader.position || 'Candidate'} ${leader.ward || leader.constituency || leader.county || 'Kenya'} 2027 | Siasahub`
    : 'Aspirant Profile | Siasahub';
  const seoDescription = leader
    ? `Read the official 2027 election manifesto for ${leader.name}, ${leader.party || 'Independent'} candidate for ${leader.position_running_for || leader.position || 'Office'} ${leader.ward || leader.constituency || leader.county || 'Kenya'}. View key pledges on education, security, and infrastructure.`
    : 'View aspirant profiles, manifestos, and endorsement data on Siasahub.';
  const seoImage = leader?.image_url || 'https://siasahub.co.ke/og-default.png';
  const seoUrl = leader?.slug
    ? `https://siasahub.co.ke/aspirants/${leader.slug}`
    : `https://siasahub.co.ke/leaders/${actualLeaderId || ''}`;

  return (
    <PageContainer>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={seoUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:url" content={seoUrl} />
        <meta property="og:type" content="profile" />
        <meta property="og:site_name" content="Siasahub" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={seoImage} />
      </Helmet>

      <LoadingWrapper>
        <AppLoadingBar
          ref={loadingBarRef}
          color={theme.colors.primary || "#ff5c01"}
          height={3}
        />
      </LoadingWrapper>

      <Suspense fallback={<SkeletonHeader />}>
        {leader && (
          <LeaderHeader
            leader={leader}
            partyColor={theme.colors.primary || "#ff5c01"}
            onBack={handleBack}
          />
        )}
      </Suspense>

      <ContentContainer>
        <TabContainer>
          <TabButton
            $active={activeTab === "manifestos"}
            onClick={() => setActiveTab("manifestos")}
          >
            <BookOpen size={14} /> Manifesto
          </TabButton>
          <TabButton
            $active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          >
            <Info size={14} /> Bio
          </TabButton>
        </TabContainer>

        <Suspense fallback={<PlaceholderCard>Loading...</PlaceholderCard>}>
          {activeTab === "manifestos" && (
            <ManifestoPage
              leaderName={leader?.name || "Loading..."}
              leaderId={actualLeaderId}
              onBack={() => setActiveTab("overview")}
            />
          )}

          {activeTab === "overview" && leader && (
            <SectionCard>
              <BioSection>
                <BioHeader>
                  <BioIcon>
                    <Info size={20} color="#000" />
                  </BioIcon>
                  <BioInfo>
                    <BioTitle>{leader.name}</BioTitle>
                    <BioPosition>{leader.position || "Candidate"}</BioPosition>
                  </BioInfo>
                </BioHeader>
                <BioText>{leader.bio || "No biography available."}</BioText>
              </BioSection>
            </SectionCard>
          )}
        </Suspense>
      </ContentContainer>

  
      {leader && <LeaderFooter leader={leader} />}
    </PageContainer>
  );
};

export default LeaderInsightPage;