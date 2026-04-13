// LeaderListingPage.jsx — Dynamic listing page for /county/:county/position/:position
// SEO-optimized with Open Graph, intro paragraph, internal linking

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import styled, { keyframes } from "styled-components";
import { Users, MapPin, Briefcase, ChevronRight, Search, Filter } from "lucide-react";
import api from "../../api/api";

// ─── Animations ─────────────────────────────────────────────────────────────
const fadeUp = keyframes`from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); }`;
const shimmer = keyframes`0% { background-position: -200% 0; } 100% { background-position: 200% 0; }`;

// ─── Styled Components ───────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  background: #0a0a0f;
  color: #fff;
  padding: 0 0 60px;
`;

const Hero = styled.div`
  background: linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0a1a2e 100%);
  padding: 60px 24px 48px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  text-align: center;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(225,29,72,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const Pill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(225,29,72,0.12);
  border: 1px solid rgba(225,29,72,0.3);
  color: #e11d48;
  padding: 6px 16px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
`;

const HeroTitle = styled.h1`
  font-size: clamp(28px, 5vw, 52px);
  font-weight: 900;
  margin: 0 0 16px;
  background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
`;

const HeroSub = styled.p`
  font-size: 16px;
  color: #94a3b8;
  max-width: 680px;
  margin: 0 auto 32px;
  line-height: 1.7;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
`;

const FilterSelect = styled.select`
  padding: 10px 16px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  background: rgba(255,255,255,0.05);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  option { background: #1a1a2e; color: #fff; }
  &:focus { outline: none; border-color: #e11d48; }
`;

const SearchInput = styled.input`
  padding: 10px 16px 10px 40px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  background: rgba(255,255,255,0.05);
  color: #fff;
  font-size: 14px;
  width: 260px;
  &::placeholder { color: #475569; }
  &:focus { outline: none; border-color: #e11d48; }
`;

const SearchWrapper = styled.div`
  position: relative;
  svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #475569; }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px 0;
`;

const SeoIntro = styled.section`
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 40px;
  animation: ${fadeUp} 0.5s ease;
  h2 { font-size: 18px; font-weight: 700; margin: 0 0 12px; color: #e2e8f0; }
  p { color: #94a3b8; line-height: 1.8; font-size: 15px; margin: 0; }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  flex: 1;
  min-width: 120px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 16px 20px;
  .num { font-size: 28px; font-weight: 800; color: #e11d48; }
  .label { font-size: 12px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const LeaderCard = styled(Link)`
  text-decoration: none;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.25s ease;
  animation: ${fadeUp} 0.4s ease;
  &:hover {
    border-color: rgba(225,29,72,0.4);
    background: rgba(225,29,72,0.04);
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(225,29,72,0.1);
  }
`;

const LeaderAvatar = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(225,29,72,0.3);
  flex-shrink: 0;
  img { width: 100%; height: 100%; object-fit: cover; }
`;

const LeaderInfo = styled.div`
  flex: 1;
`;

const LeaderName = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 6px;
`;

const LeaderMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MetaTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #64748b;
  svg { width: 12px; height: 12px; }
`;

const PartyBadge = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 99px;
  background: rgba(225,29,72,0.12);
  color: #e11d48;
  border: 1px solid rgba(225,29,72,0.2);
  margin-top: 8px;
  width: fit-content;
`;

const VerifiedBadge = styled.span`
  font-size: 11px;
  color: #10b981;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  &::before { content: "✓"; }
`;

const ChevronRow = styled.div`
  display: flex;
  justify-content: flex-end;
  color: #334155;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #475569;
  svg { margin-bottom: 16px; opacity: 0.3; }
  h3 { font-size: 20px; color: #94a3b8; margin-bottom: 8px; }
  p { font-size: 14px; }
`;

const SkeletonCard = styled.div`
  background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 16px;
  height: 160px;
`;

const InternalLinks = styled.div`
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid rgba(255,255,255,0.06);
  h3 { font-size: 16px; font-weight: 700; color: #e2e8f0; margin-bottom: 16px; }
`;

const LinkGrid = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const InternalLink = styled(Link)`
  padding: 8px 16px;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 13px;
  transition: all 0.2s;
  &:hover { border-color: #e11d48; color: #e11d48; }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

const POSITIONS = [
  "Governor", "Senator", "MP", "MCA",
  "Women Representative", "Deputy Governor"
];

const MAJOR_COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret",
  "Kiambu", "Machakos", "Nyeri", "Meru", "Kakamega"
];

// Generate a rich SEO intro paragraph
const buildIntro = (county, position) => {
  const yr = 2027;
  const countyName = capitalize(county);
  const positionName = capitalize(position);
  return `Welcome to the official ${yr} ${countyName} ${positionName} candidate listings on Siasahub — Kenya's leading political intelligence platform. As ${yr} approaches, voters across ${countyName} County are seeking clear, verified information about who is vying for the ${positionName} seat. This page provides a comprehensive directory of all declared and potential ${positionName} candidates for ${countyName}, including their party affiliations, manifestos, endorsements, and public support ratings. Use the filters below to sort by party, verification status, or support level. Each candidate profile links directly to their full manifesto, so you can make an informed decision at the ballot box. Siasahub is committed to transparency, accountability, and citizen empowerment through data. Share this page to help your community stay informed.`;
};

// ─── Component ───────────────────────────────────────────────────────────────
const LeaderListingPage = () => {
  const { county, position } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const partyFilter = searchParams.get("party") || "";
  const [search, setSearch] = useState("");
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parties, setParties] = useState([]);

  const countyName = capitalize(county || "");
  const positionName = capitalize(position || "");
  const pageTitle = `${countyName} ${positionName} Candidates 2027 | Siasahub`;
  const pageDescription = `Find all 2027 ${positionName} candidates running in ${countyName} County. Compare manifestos, party affiliations, and public support on Siasahub.`;
  const pageUrl = `https://siasahub.co.ke/county/${county}/position/${position}`;

  useEffect(() => {
    const fetchLeaders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ county, position_running_for: position, limit: 60 });
        if (partyFilter) params.append("party", partyFilter);
        const res = await api.get(`/leaders?${params.toString()}`);
        const data = res?.data || res || [];
        const list = Array.isArray(data) ? data : (data.data || data.leaders || []);
        setLeaders(list);
        // Extract unique parties
        const uniqueParties = [...new Set(list.map(l => l.party || l.political_party).filter(Boolean))];
        setParties(uniqueParties);
      } catch (err) {
        console.error("Error fetching leaders:", err);
        setLeaders([]);
      } finally {
        setLoading(false);
      }
    };
    if (county && position) fetchLeaders();
  }, [county, position, partyFilter]);

  const filtered = leaders.filter(l => {
    const name = (l.name || l.full_name || "").toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const handlePartyChange = (e) => {
    const val = e.target.value;
    if (val) setSearchParams({ party: val });
    else setSearchParams({});
  };

  return (
    <Page>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Siasahub" />
        <meta property="og:image" content="https://siasahub.co.ke/og-default.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {/* Structured data */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": pageTitle,
          "description": pageDescription,
          "url": pageUrl,
          "numberOfItems": leaders.length,
        })}</script>
      </Helmet>

      <Hero>
        <Pill><MapPin size={12} />{countyName} County</Pill>
        <HeroTitle>{countyName} {positionName} Candidates 2027</HeroTitle>
        <HeroSub>
          Explore all declared candidates for the {positionName} seat in {countyName} County.
          Compare their manifestos, party affiliation, and public support ratings.
        </HeroSub>

        <FilterBar>
          <SearchWrapper>
            <Search size={14} />
            <SearchInput
              placeholder="Search candidates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </SearchWrapper>
          <FilterSelect value={partyFilter} onChange={handlePartyChange}>
            <option value="">All Parties</option>
            {parties.map(p => <option key={p} value={p}>{p}</option>)}
          </FilterSelect>
        </FilterBar>
      </Hero>

      <Container>
        {/* SEO intro */}
        <SeoIntro>
          <h2>About {countyName} {positionName} Race 2027</h2>
          <p>{buildIntro(county, position)}</p>
        </SeoIntro>

        {/* Stats row */}
        {!loading && (
          <StatsRow>
            <StatCard>
              <div className="num">{leaders.length}</div>
              <div className="label">Candidates Listed</div>
            </StatCard>
            <StatCard>
              <div className="num">{leaders.filter(l => l.is_verified).length}</div>
              <div className="label">Verified Profiles</div>
            </StatCard>
            <StatCard>
              <div className="num">{parties.length}</div>
              <div className="label">Political Parties</div>
            </StatCard>
            <StatCard>
              <div className="num">{countyName}</div>
              <div className="label">County</div>
            </StatCard>
          </StatsRow>
        )}

        {/* Leader grid */}
        {loading ? (
          <Grid>
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </Grid>
        ) : filtered.length === 0 ? (
          <EmptyState>
            <Users size={48} />
            <h3>No candidates found</h3>
            <p>No {positionName} candidates found for {countyName} County{partyFilter ? ` (Party: ${partyFilter})` : ""}.</p>
          </EmptyState>
        ) : (
          <Grid>
            {filtered.map((leader) => {
              const leaderSlug = leader.slug || leader.leader_id;
              const profileUrl = `/leader/${leaderSlug}`;
              const avatarSrc = leader.image_url || leader.image
                ? (leader.image_url || leader.image).startsWith("http")
                  ? (leader.image_url || leader.image)
                  : `http://localhost:8000${leader.image_url || leader.image}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name || "L")}&background=e11d48&color=fff&size=200`;

              return (
                <LeaderCard key={leader.leader_id || leader.id} to={profileUrl}>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <LeaderAvatar>
                      <img src={avatarSrc} alt={leader.name} loading="lazy"
                        onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name || "L")}&background=e11d48&color=fff`; }}
                      />
                    </LeaderAvatar>
                    <LeaderInfo>
                      <LeaderName>{leader.name || leader.full_name}</LeaderName>
                      <LeaderMeta>
                        <MetaTag><MapPin />{leader.county}</MetaTag>
                        <MetaTag><Briefcase />{leader.position_running_for || leader.position}</MetaTag>
                      </LeaderMeta>
                      {leader.party && <PartyBadge>{leader.party}</PartyBadge>}
                      {leader.is_verified && <VerifiedBadge style={{ marginTop: 6, display: "inline-flex", fontSize: 11, color: "#10b981" }}>Verified</VerifiedBadge>}
                    </LeaderInfo>
                  </div>
                  <ChevronRow>
                    <ChevronRight size={16} />
                  </ChevronRow>
                </LeaderCard>
              );
            })}
          </Grid>
        )}

        {/* Internal links for SEO */}
        <InternalLinks>
          <h3>Browse More Positions in {countyName}</h3>
          <LinkGrid>
            {POSITIONS.filter(p => p.toLowerCase() !== position?.toLowerCase()).map(p => (
              <InternalLink key={p} to={`/county/${county}/position/${p.toLowerCase().replace(/\s+/g, "-")}`}>
                {countyName} {p}
              </InternalLink>
            ))}
          </LinkGrid>

          <h3 style={{ marginTop: 24 }}>Browse {positionName} in Other Counties</h3>
          <LinkGrid>
            {MAJOR_COUNTIES.filter(c => c.toLowerCase() !== county?.toLowerCase()).slice(0, 8).map(c => (
              <InternalLink key={c} to={`/county/${c.toLowerCase()}/position/${position}`}>
                {c} {positionName}
              </InternalLink>
            ))}
          </LinkGrid>
        </InternalLinks>
      </Container>
    </Page>
  );
};

export default LeaderListingPage;
