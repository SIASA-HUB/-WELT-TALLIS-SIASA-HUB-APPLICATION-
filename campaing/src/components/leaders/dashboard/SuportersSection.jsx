// SuportersSection.jsx - Premium Campaign Intelligence Dashboard
import React, { useState, useEffect, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import {
  Users, Search, Download, MapPin, Calendar,
  TrendingUp, Heart, DollarSign, BarChart3,
  FileSpreadsheet, Filter, RefreshCw, Award,
  ArrowUpDown, ChevronDown, Star, Zap, Globe,
} from "lucide-react";
import api from "../../../api/api";
import { buildImageUrl } from "../../../utils/imageUtils";

// ===================== ANIMATIONS =====================
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; } 50% { opacity: 0.5; }
`;

// ===================== THEME =====================
const T = {
  bg: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  primary: "#1e3c72",
  accent: "#e11d48",
  success: "#10b981",
  warning: "#f59e0b",
  text: "#0f172a",
  muted: "#64748b",
  light: "#f1f5f9",
};

// ===================== STYLED COMPONENTS =====================
const Wrapper = styled.div`
  animation: ${fadeInUp} 0.4s ease-out;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 500px) { grid-template-columns: 1fr 1fr; }
`;

const StatCard = styled.div`
  background: ${T.card};
  border: 1px solid ${T.border};
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.3s;
  &:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }

  .icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 4px;
  }
  .value {
    font-size: 30px; font-weight: 900;
    color: ${T.text}; letter-spacing: -1px;
  }
  .label {
    font-size: 12px; font-weight: 600;
    color: ${T.muted}; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .trend {
    font-size: 11px; font-weight: 600;
    color: ${T.success}; margin-top: 4px;
    display: flex; align-items: center; gap: 4px;
  }
`;

const MainCard = styled.div`
  background: ${T.card};
  border: 1px solid ${T.border};
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;

const CardHead = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${T.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  background: ${T.light};

  .title {
    font-size: 18px; font-weight: 800; color: ${T.text};
    display: flex; align-items: center; gap: 10px;
  }
  .count-badge {
    background: ${T.primary}; color: white;
    padding: 2px 10px; border-radius: 100px;
    font-size: 12px; font-weight: 700;
  }
`;

const Controls = styled.div`
  display: flex; gap: 10px; flex-wrap: wrap;
  padding: 16px 24px;
  border-bottom: 1px solid ${T.border};
  background: white;
`;

const SearchInput = styled.div`
  flex: 1; min-width: 200px;
  display: flex; align-items: center;
  background: ${T.light}; border: 1px solid ${T.border};
  border-radius: 12px; padding: 0 14px; gap: 10px;

  input {
    flex: 1; border: none; background: none;
    padding: 10px 0; font-size: 14px; color: ${T.text};
    outline: none;
    &::placeholder { color: ${T.muted}; }
  }
`;

const FilterBtn = styled.select`
  padding: 10px 14px;
  border: 1px solid ${T.border}; border-radius: 12px;
  background: ${T.light}; color: ${T.muted};
  font-size: 13px; font-weight: 600;
  cursor: pointer; outline: none;
`;

const ExportBtn = styled.button`
  padding: 10px 18px;
  background: ${props => props.$primary ? T.primary : T.card};
  color: ${props => props.$primary ? 'white' : T.muted};
  border: 1px solid ${props => props.$primary ? T.primary : T.border};
  border-radius: 12px; font-size: 13px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; gap: 8px;
  transition: all 0.2s;
  &:hover {
    background: ${props => props.$primary ? '#152c54' : T.light};
    transform: translateY(-1px);
  }
`;

const TableHead = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.2fr 1fr 0.8fr 0.8fr 0.8fr;
  padding: 10px 24px;
  background: ${T.light};
  border-bottom: 1px solid ${T.border};
  font-size: 11px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1px;
  color: ${T.muted};
  @media (max-width: 768px) { display: none; }
`;

const SupporterRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.2fr 1fr 0.8fr 0.8fr 0.8fr;
  padding: 14px 24px;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
  transition: all 0.15s;
  cursor: pointer;
  &:hover { background: #f8fafc; }
  &:last-child { border-bottom: none; }
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 14px 16px;
  }
`;

const SupporterInfo = styled.div`
  display: flex; align-items: center; gap: 12px;

  .avatar {
    width: 44px; height: 44px; border-radius: 50%;
    object-fit: cover; background: ${T.primary};
    display: flex; align-items: center; justify-content: center;
    color: white; font-weight: 700; font-size: 14px; flex-shrink: 0;
    border: 2px solid ${T.border};
  }
  .name { font-size: 14px; font-weight: 700; color: ${T.text}; margin-bottom: 2px; }
  .phrase { font-size: 11px; color: ${T.muted}; max-width: 180px; 
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`;

const Badge = styled.span`
  padding: 3px 10px; border-radius: 100px;
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
  background: ${props => props.$type === 'paid' ? '#fef3c7' : '#dcfce7'};
  color: ${props => props.$type === 'paid' ? '#d97706' : '#16a34a'};
`;

const Cell = styled.div`
  font-size: 13px; color: ${T.muted};
  display: flex; align-items: center; gap: 4px;

  &.bold { color: ${T.text}; font-weight: 700; font-size: 14px; }
  &.amount { color: ${T.primary}; font-weight: 800; font-size: 14px; }
`;

const EmptyState = styled.div`
  text-align: center; padding: 80px 40px; color: ${T.muted};
  svg { opacity: 0.3; margin-bottom: 16px; }
  p { font-size: 14px; margin: 0; }
`;

const LoadingRow = styled.div`
  padding: 20px 24px;
  .shimmer {
    height: 48px; border-radius: 12px; margin-bottom: 12px;
    background: linear-gradient(90deg, #f0f4ff 25%, #e8edf5 50%, #f0f4ff 75%);
    background-size: 1000px 100%;
    animation: ${pulse} 1.5s infinite;
  }
`;

const CountyBreakdown = styled.div`
  padding: 20px 24px;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px;
`;

const CountyChip = styled.div`
  background: ${T.light}; border: 1px solid ${T.border};
  border-radius: 14px; padding: 12px 14px;
  display: flex; flex-direction: column; gap: 4px;
  transition: all 0.2s;
  &:hover { border-color: ${T.primary}; background: #eff6ff; }

  .county-name { font-size: 12px; font-weight: 700; color: ${T.text}; }
  .county-bar {
    height: 4px; border-radius: 2px; background: #e2e8f0;
    .fill { height: 100%; border-radius: 2px; background: ${T.primary}; transition: width 0.8s; }
  }
  .county-count { font-size: 11px; color: ${T.muted}; font-weight: 600; }
`;

const Pagination = styled.div`
  padding: 16px 24px;
  border-top: 1px solid ${T.border};
  display: flex; justify-content: space-between; align-items: center;
  font-size: 13px; color: ${T.muted};

  .pages { display: flex; gap: 6px; }
  button {
    padding: 6px 12px; border-radius: 8px;
    border: 1px solid ${T.border}; background: ${T.card};
    cursor: pointer; font-size: 13px; font-weight: 600; color: ${T.muted};
    transition: all 0.15s;
    &:hover, &.active { background: ${T.primary}; color: white; border-color: ${T.primary}; }
    &:disabled { opacity: 0.3; cursor: not-allowed; }
  }
`;

// ===================== UTILS =====================
const formatAmount = (n) => n > 0 ? `KES ${Number(n).toLocaleString()}` : "Free";
const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
const formatDate = (d) => {
  if (!d) return "Recently";
  const date = new Date(d), now = new Date();
  const diff = Math.floor((now - date) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return date.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
};

// ===================== EXCEL EXPORT =====================
const exportToExcel = (supporters, leaderName = "Campaign") => {
  const headers = ["#", "Name", "County", "Constituency", "Ward", "Type", "Amount (KES)", "Phone", "Email", "Support Message", "Joined Date"];

  const rows = supporters.map((s, i) => [
    i + 1,
    s.name,
    s.county || "N/A",
    s.constituency || "N/A",
    s.ward || "N/A",
    s.endorsementType === "paid" ? "Paid Supporter" : "Free Supporter",
    s.amount || 0,
    s.phone || "N/A",
    s.email || "N/A",
    (s.phrase || "").replace(/,/g, " "),
    s.since ? new Date(s.since).toLocaleDateString("en-KE") : "N/A",
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${leaderName.replace(/\s+/g, "_")}_Campaign_Supporters_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ===================== MAIN COMPONENT =====================
const SupportersSection = ({ leader }) => {
  const [supporters, setSupporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCounty, setFilterCounty] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  useEffect(() => {
    const fetchSupporters = async () => {
      const leaderId = leader?.leader_id || leader?.id;
      if (!leaderId) return;
      setLoading(true);
      try {
        const res = await api.get(`/endorsements/leader/${leaderId}/recent?limit=500`);
        if (res?.success) {
          setSupporters((res.data || []).map((s, i) => ({
            id: s.endorsement_id || s.id || `s_${i}`,
            name: s.user_name || s.name || "Anonymous",
            county: s.county || "Kenya",
            constituency: s.constituency || "",
            ward: s.ward || "",
            avatar: s.image_url,
            endorsementType: Number(s.amount) > 0 ? "paid" : "free",
            amount: Number(s.amount) || 0,
            since: s.created_at,
            phrase: s.phrase || s.message || "",
            phone: s.phone || "",
            email: s.email || "",
          })));
        }
      } catch (e) {
        console.error("Failed to fetch supporters:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSupporters();
  }, [leader]);

  // ---- Stats ----
  const totalSupporters = supporters.length;
  const paidSupporters = supporters.filter(s => s.endorsementType === "paid").length;
  const freeSupporters = supporters.filter(s => s.endorsementType === "free").length;
  const totalRevenue = supporters.reduce((sum, s) => sum + s.amount, 0);

  // ---- County breakdown ----
  const countyMap = useMemo(() => {
    const map = {};
    supporters.forEach(s => { map[s.county] = (map[s.county] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [supporters]);

  const maxCounty = countyMap[0]?.[1] || 1;
  const uniqueCounties = [...new Set(supporters.map(s => s.county))].filter(Boolean).sort();

  // ---- Filtering + Sorting ----
  const filtered = useMemo(() => {
    let data = [...supporters];
    const q = search.toLowerCase();
    if (q) data = data.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.county.toLowerCase().includes(q) ||
      s.constituency.toLowerCase().includes(q) ||
      s.ward.toLowerCase().includes(q) ||
      s.phrase.toLowerCase().includes(q)
    );
    if (filterType !== "all") data = data.filter(s => s.endorsementType === filterType);
    if (filterCounty !== "all") data = data.filter(s => s.county === filterCounty);
    if (sortBy === "newest") data.sort((a, b) => new Date(b.since) - new Date(a.since));
    else if (sortBy === "oldest") data.sort((a, b) => new Date(a.since) - new Date(b.since));
    else if (sortBy === "amount_high") data.sort((a, b) => b.amount - a.amount);
    else if (sortBy === "name") data.sort((a, b) => a.name.localeCompare(b.name));
    return data;
  }, [supporters, search, filterType, filterCounty, sortBy]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleExport = () => exportToExcel(filtered, leader?.name || "Campaign");

  return (
    <Wrapper>
      {/* ---- Summary Stats ---- */}
      <StatsGrid>
        <StatCard>
          <div className="icon" style={{ background: "#eff6ff" }}>
            <Users size={22} color={T.primary} />
          </div>
          <div className="value">{totalSupporters.toLocaleString()}</div>
          <div className="label">Total Supporters</div>
          {totalSupporters > 0 && <div className="trend"><TrendingUp size={12} /> Active Campaign</div>}
        </StatCard>

        <StatCard>
          <div className="icon" style={{ background: "#fefce8" }}>
            <DollarSign size={22} color={T.warning} />
          </div>
          <div className="value">{paidSupporters.toLocaleString()}</div>
          <div className="label">Paid Supporters</div>
          <div className="trend" style={{ color: T.warning }}>
            <Zap size={12} /> {totalSupporters > 0 ? Math.round((paidSupporters / totalSupporters) * 100) : 0}% conversion
          </div>
        </StatCard>

        <StatCard>
          <div className="icon" style={{ background: "#f0fdf4" }}>
            <Heart size={22} color={T.success} />
          </div>
          <div className="value">{freeSupporters.toLocaleString()}</div>
          <div className="label">Free Supporters</div>
          <div className="trend"><Globe size={12} /> Organic reach</div>
        </StatCard>

        <StatCard>
          <div className="icon" style={{ background: "#fff1f2" }}>
            <Award size={22} color={T.accent} />
          </div>
          <div className="value">
            {totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(1)}K` : totalRevenue.toLocaleString()}
          </div>
          <div className="label">Revenue (KES)</div>
          <div className="trend" style={{ color: T.accent }}>
            <BarChart3 size={12} /> Campaign funds
          </div>
        </StatCard>
      </StatsGrid>

      {/* ---- County Breakdown ---- */}
      {countyMap.length > 0 && (
        <MainCard>
          <CardHead>
            <div className="title">
              <MapPin size={18} color={T.primary} />
              County Reach
              <span className="count-badge">{countyMap.length} counties</span>
            </div>
          </CardHead>
          <CountyBreakdown>
            {countyMap.map(([county, count]) => (
              <CountyChip key={county} onClick={() => setFilterCounty(county === filterCounty ? "all" : county)}
                style={{ borderColor: filterCounty === county ? T.primary : T.border,
                  background: filterCounty === county ? "#eff6ff" : T.light }}>
                <div className="county-name">{county}</div>
                <div className="county-bar">
                  <div className="fill" style={{ width: `${(count / maxCounty) * 100}%` }} />
                </div>
                <div className="county-count">{count} supporter{count !== 1 ? "s" : ""}</div>
              </CountyChip>
            ))}
          </CountyBreakdown>
        </MainCard>
      )}

      {/* ---- Supporters Table ---- */}
      <MainCard>
        <CardHead>
          <div className="title">
            <Users size={18} color={T.primary} />
            Campaign Supporters
            <span className="count-badge">{filtered.length}</span>
            {filterCounty !== "all" && (
              <span style={{ fontSize: "12px", color: T.accent, fontWeight: 600 }}>
                • {filterCounty}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <ExportBtn onClick={handleExport} $primary>
              <FileSpreadsheet size={15} />
              Export Excel
            </ExportBtn>
          </div>
        </CardHead>

        <Controls>
          <SearchInput>
            <Search size={16} color={T.muted} />
            <input
              placeholder="Search by name, county, ward, message..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: "18px" }}>×</button>
            )}
          </SearchInput>

          <FilterBtn value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
            <option value="all">All Types</option>
            <option value="paid">Paid Only</option>
            <option value="free">Free Only</option>
          </FilterBtn>

          <FilterBtn value={filterCounty} onChange={e => { setFilterCounty(e.target.value); setPage(1); }}>
            <option value="all">All Counties</option>
            {uniqueCounties.map(c => <option key={c} value={c}>{c}</option>)}
          </FilterBtn>

          <FilterBtn value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount_high">Highest Amount</option>
            <option value="name">By Name A-Z</option>
          </FilterBtn>
        </Controls>

        <TableHead>
          <div>Supporter</div>
          <div>Location</div>
          <div>Joined</div>
          <div>Type</div>
          <div>Amount</div>
          <div>Message</div>
        </TableHead>

        <div>
          {loading ? (
            <LoadingRow>
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="shimmer" />)}
            </LoadingRow>
          ) : paginated.length === 0 ? (
            <EmptyState>
              <Users size={48} />
              <p>{search || filterType !== "all" || filterCounty !== "all"
                ? "No supporters match your search or filter"
                : "No supporters yet — share your campaign to get started!"
              }</p>
            </EmptyState>
          ) : (
            paginated.map((s) => (
              <SupporterRow key={s.id}>
                <SupporterInfo>
                  {s.avatar ? (
                    <img className="avatar" src={buildImageUrl(s.avatar)} alt={s.name}
                      onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                  ) : null}
                  <div className="avatar" style={{ display: s.avatar ? "none" : "flex" }}>
                    {getInitials(s.name)}
                  </div>
                  <div>
                    <div className="name">{s.name}</div>
                    <div className="phrase">
                      {s.phrase ? `"${s.phrase.slice(0, 55)}${s.phrase.length > 55 ? "…" : ""}"` : "No message"}
                    </div>
                  </div>
                </SupporterInfo>

                <Cell>
                  <MapPin size={12} />
                  <div>
                    <div style={{ fontWeight: 600, color: T.text, fontSize: "13px" }}>{s.county || "—"}</div>
                    {s.constituency && <div style={{ fontSize: "11px" }}>{s.constituency}</div>}
                    {s.ward && <div style={{ fontSize: "11px", color: T.muted }}>{s.ward}</div>}
                  </div>
                </Cell>

                <Cell>
                  <Calendar size={12} />
                  {formatDate(s.since)}
                </Cell>

                <Cell>
                  <Badge $type={s.endorsementType}>
                    {s.endorsementType === "paid" ? "Paid" : "Free"}
                  </Badge>
                </Cell>

                <Cell className={s.amount > 0 ? "amount" : ""}>
                  {formatAmount(s.amount)}
                </Cell>

                <Cell style={{ fontSize: "11px", color: T.muted, overflow: "hidden" }}>
                  {s.phrase ? `"${s.phrase.slice(0, 40)}${s.phrase.length > 40 ? "…" : ""}"` : "—"}
                </Cell>
              </SupporterRow>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <Pagination>
            <span>
              Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="pages">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button key={p} className={p === page ? "active" : ""} onClick={() => setPage(p)}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
            </div>
          </Pagination>
        )}
      </MainCard>
    </Wrapper>
  );
};

export default SupportersSection;