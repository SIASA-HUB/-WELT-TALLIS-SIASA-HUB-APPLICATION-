import React, { useState, memo, useEffect, useRef } from "react";
import styled from "styled-components";
import LoadingBar from "react-top-loading-bar";

import TopFypHeader from "./fyp";
import VoterRegistrationCompetition from "../Auth/voterCompetition";
import BattleArena from "../leaders/battle/batlleArena";
import TrendingStoriesRow from "../Stories/tredingStoriesRow";
import TrendingManifestos from "../leaders/manifestos/TredingManifestos";
import RalliesSection from "../Rallies/ralliessection";
import TrendingLeaders from "../leaders/TrendingLeaders";
import TopMobilizers from "./topMobilizers";

const TrendingContainer = styled.div`
  background: #ffffff;
  min-height: 100vh;
  padding-bottom: 60px;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  gap: 0;
`;

const SectionWrapper = styled.div`
  width: 100%;
  background: #ffffff;
`;

const Divider = styled.hr`
  height: 1px;
  background: #f0f0f0;
  border: none;
  margin: 0;
  width: 100%;
`;

const TrendingSection = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [hasStories, setHasStories] = useState(true);
  const [hasLeaders, setHasLeaders] = useState(true);
  const [hasManifestos, setHasManifestos] = useState(true);
  const [hasRallies, setHasRallies] = useState(true);
  const loadingBarRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (e) {}
    }
    loadingBarRef.current?.complete();
  }, []);

  return (
    <TrendingContainer>
      <LoadingBar ref={loadingBarRef} color="#ff5c01" height={3} />
      <TopFypHeader />
      {/* <TopMobilizers /> */}
      <ContentWrapper>
        {/* 1. TRENDING STORIES */}
        {hasStories && (
          <SectionWrapper>
            <TrendingStoriesRow
              currentUser={currentUser}
              limit={15}
              onEmpty={() => setHasStories(false)}
            />
          </SectionWrapper>
        )}

        {hasStories && hasLeaders && <Divider />}

        {/* 2. TRENDING LEADERS */}
        {hasLeaders && (
          <SectionWrapper>
            <TrendingLeaders
              limit={8}
              compact={true}
              onEmpty={() => setHasLeaders(false)}
            />
          </SectionWrapper>
        )}

        {hasLeaders && hasManifestos && <Divider />}

        {/* 3. TRENDING MANIFESTOS */}
        {hasManifestos && (
          <SectionWrapper>
            <TrendingManifestos
              limit={6}
              onEmpty={() => setHasManifestos(false)}
            />
          </SectionWrapper>
        )}

        {hasManifestos && <Divider />}

        {/* 4. BATTLE ARENA */}
        <SectionWrapper>
          <BattleArena />
        </SectionWrapper>

        <Divider />

        {/* 5. UPCOMING RALLIES */}
        {hasRallies && (
          <SectionWrapper>
            <RalliesSection
              limit={4}
              compact={true}
              onEmpty={() => setHasRallies(false)}
            />
          </SectionWrapper>
        )}

        {hasRallies && <Divider />}

        {/* 6. VOTER REGISTRATION - Always show last */}
        <SectionWrapper>
          <VoterRegistrationCompetition />
        </SectionWrapper>
      </ContentWrapper>
    </TrendingContainer>
  );
};

export default memo(TrendingSection);
