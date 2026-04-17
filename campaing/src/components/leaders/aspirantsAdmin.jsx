import React, { useState, useEffect } from "react";
import api from "../../api/api";

const Aspirants = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [leaders, setLeaders] = useState([]);
  const [countyAnalytics, setCountyAnalytics] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    total_leaders: 0,
    total_counties: 0,
    total_constituencies: 0,
    total_wards: 0,
    verified_leaders: 0,
    pending_leaders: 0,
    top_county: "",
    top_county_count: 0,
  });
  const [positionBreakdown, setPositionBreakdown] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedConstituency, setSelectedConstituency] = useState("");
  const [constituencyStats, setConstituencyStats] = useState([]);
  const [wardStats, setWardStats] = useState([]);

  // Fetch all data on load
  useEffect(() => {
    fetchDashboardData();
    fetchCountyAnalytics();
    fetchLeaders();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/leaders/analytics/dashboard");
      if (response.success) {
        setDashboardStats(response.data.overview);
        setPositionBreakdown(response.data.position_breakdown || []);
      }
    } catch (error) {
      console.error(
        "Error fetching dashboard data:",
        error.response?.data || error.message,
      );
    }
  };

  const fetchCountyAnalytics = async () => {
    try {
      const response = await api.get("/leaders/analytics/county");
      if (response.success) {
        setCountyAnalytics(response.data.counties || []);
      }
    } catch (error) {
      console.error(
        "Error fetching county analytics:",
        error.response?.data || error.message,
      );
    }
  };

  const fetchLeaders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/leaders");
      if (response.success) {
        // Extract leaders from grouped response
        const allLeaders = [];
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach((group) => {
            if (group.leaders && Array.isArray(group.leaders)) {
              allLeaders.push(...group.leaders);
            }
          });
        }
        setLeaders(allLeaders);
      }
    } catch (error) {
      console.error(
        "Error fetching leaders:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchConstituencyAnalytics = async (county) => {
    try {
      const response = await api.get(
        `/leaders/analytics/constituency?county=${encodeURIComponent(county)}`,
      );
      if (response.success) {
        setConstituencyStats(response.data.constituencies || []);
      }
    } catch (error) {
      console.error(
        "Error fetching constituency data:",
        error.response?.data || error.message,
      );
    }
  };

  const fetchWardAnalytics = async (constituency) => {
    try {
      const response = await api.get(
        `/leaders/analytics/ward?constituency=${encodeURIComponent(constituency)}`,
      );
      if (response.success) {
        setWardStats(response.data.wards || []);
      }
    } catch (error) {
      console.error(
        "Error fetching ward data:",
        error.response?.data || error.message,
      );
    }
  };

  const handleCountyClick = (countyName) => {
    setSelectedCounty(countyName);
    fetchConstituencyAnalytics(countyName);
    setActiveTab("constituency");
  };

  const handleConstituencyClick = (constituencyName) => {
    setSelectedConstituency(constituencyName);
    fetchWardAnalytics(constituencyName);
    setActiveTab("ward");
  };

  const filteredLeaders = leaders.filter(
    (leader) =>
      leader.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.party?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.county?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.position?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getPositionBadgeClass = (position) => {
    const pos = position?.toLowerCase() || "";
    if (pos.includes("president")) return "danger";
    if (pos.includes("governor")) return "primary";
    if (pos.includes("senator")) return "info";
    if (pos.includes("mp")) return "success";
    if (pos.includes("mca")) return "warning";
    if (pos.includes("women")) return "secondary";
    return "secondary";
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh", background: "#f8f9fa" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="ms-3 text-secondary">Loading leaders data...</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 className="display-5 fw-bold text-dark mb-2">
              🏛️ Leaders Dashboard
            </h1>
            <p className="text-secondary">
              Track all registered political aspirants across Kenya
            </p>
          </div>
          <div className="bg-white rounded shadow-sm p-3 border">
            <div className="fw-bold text-secondary">Total Leaders</div>
            <div className="display-6 text-primary">
              {dashboardStats.total_leaders}
            </div>
          </div>
        </div>

        {/* Stats Cards - Light Theme */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-primary small text-uppercase fw-bold">
                      Counties
                    </div>
                    <div className="display-6 text-dark">
                      {dashboardStats.total_counties}
                    </div>
                  </div>
                  <i className="bi bi-map fs-1 text-primary opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-success small text-uppercase fw-bold">
                      Constituencies
                    </div>
                    <div className="display-6 text-dark">
                      {dashboardStats.total_constituencies}
                    </div>
                  </div>
                  <i className="bi bi-pin-map fs-1 text-success opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-warning small text-uppercase fw-bold">
                      Wards
                    </div>
                    <div className="display-6 text-dark">
                      {dashboardStats.total_wards}
                    </div>
                  </div>
                  <i className="bi bi-geo-alt fs-1 text-warning opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-info small text-uppercase fw-bold">
                      Verified
                    </div>
                    <div className="display-6 text-dark">
                      {dashboardStats.verified_leaders}
                    </div>
                  </div>
                  <i className="bi bi-check-circle fs-1 text-info opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Light Theme */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "dashboard" ? "active text-primary fw-bold border-primary border-bottom-2" : "text-secondary"}`}
              onClick={() => setActiveTab("dashboard")}
              style={{
                background: activeTab === "dashboard" ? "#fff" : "transparent",
              }}
            >
              📊 Dashboard
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "county" ? "active text-primary fw-bold" : "text-secondary"}`}
              onClick={() => setActiveTab("county")}
            >
              🗺️ By County
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "constituency" ? "active text-primary fw-bold" : "text-secondary"}`}
              onClick={() => setActiveTab("constituency")}
            >
              📍 By Constituency
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "ward" ? "active text-primary fw-bold" : "text-secondary"}`}
              onClick={() => setActiveTab("ward")}
            >
              🏘️ By Ward
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "leaders" ? "active text-primary fw-bold" : "text-secondary"}`}
              onClick={() => setActiveTab("leaders")}
            >
              👥 All Leaders
            </button>
          </li>
        </ul>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <>
            {/* Position Breakdown */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0 pt-4">
                    <h5 className="text-dark mb-0 fw-bold">
                      🏛️ Position Breakdown
                    </h5>
                    <small className="text-secondary">
                      Number of leaders by position category
                    </small>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {positionBreakdown.map((pos, idx) => (
                        <div className="col-md-4 col-lg-3 mb-3" key={idx}>
                          <div className="bg-light rounded p-3 text-center border">
                            <div className="fw-bold text-dark">
                              {pos.position}
                            </div>
                            <div className="display-6 text-primary">
                              {pos.count}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Counties */}
            <div className="row">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0 pt-4">
                    <h5 className="text-dark mb-0 fw-bold">
                      🏆 Top Counties by Leaders
                    </h5>
                    <small className="text-secondary">
                      Counties with highest number of registered aspirants
                    </small>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>#</th>
                            <th>County</th>
                            <th>Total Leaders</th>
                            <th>Governors</th>
                            <th>Senators</th>
                            <th>MPs</th>
                            <th>MCAs</th>
                            <th>Women Reps</th>
                          </tr>
                        </thead>
                        <tbody>
                          {countyAnalytics.slice(0, 10).map((county, idx) => (
                            <tr key={idx}>
                              <td>{idx + 1}</td>
                              <td className="fw-bold">{county.county}</td>
                              <td>{county.total_leaders}</td>
                              <td>{county.governors || 0}</td>
                              <td>{county.senators || 0}</td>
                              <td>{county.mps || 0}</td>
                              <td>{county.mcas || 0}</td>
                              <td>{county.women_reps || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* County Tab */}
        {activeTab === "county" && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 pt-4">
              <h5 className="text-dark mb-0 fw-bold">🗺️ Leaders by County</h5>
              <small className="text-secondary">
                Click on "View Constituencies" to see constituency breakdown
              </small>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>County</th>
                      <th>Total Leaders</th>
                      <th>Governors</th>
                      <th>Senators</th>
                      <th>MPs</th>
                      <th>MCAs</th>
                      <th>Women Reps</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countyAnalytics.map((county, idx) => (
                      <tr key={idx}>
                        <td className="fw-bold">{county.county}</td>
                        <td>{county.total_leaders}</td>
                        <td>{county.governors || 0}</td>
                        <td>{county.senators || 0}</td>
                        <td>{county.mps || 0}</td>
                        <td>{county.mcas || 0}</td>
                        <td>{county.women_reps || 0}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleCountyClick(county.county)}
                          >
                            View Constituencies
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Constituency Tab */}
        {activeTab === "constituency" && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 pt-4">
              <h5 className="text-dark mb-0 fw-bold">
                📍 Constituencies in {selectedCounty}
              </h5>
              <small className="text-secondary">
                Click on a constituency to see ward breakdown
              </small>
              <div className="mt-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setActiveTab("county")}
                >
                  ← Back to Counties
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Constituency</th>
                      <th>County</th>
                      <th>Total Leaders</th>
                      <th>MPs</th>
                      <th>MCAs</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {constituencyStats.map((constituency, idx) => (
                      <tr key={idx}>
                        <td className="fw-bold">{constituency.constituency}</td>
                        <td>{constituency.county}</td>
                        <td>{constituency.total_leaders}</td>
                        <td>{constituency.mps || 0}</td>
                        <td>{constituency.mcas || 0}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() =>
                              handleConstituencyClick(constituency.constituency)
                            }
                          >
                            View Wards
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Ward Tab */}
        {activeTab === "ward" && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 pt-4">
              <h5 className="text-dark mb-0 fw-bold">
                🏘️ Wards in {selectedConstituency}
              </h5>
              <div className="mt-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setActiveTab("constituency")}
                >
                  ← Back to Constituencies
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Ward</th>
                      <th>Constituency</th>
                      <th>County</th>
                      <th>Total Leaders</th>
                      <th>MCAs</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wardStats.map((ward, idx) => (
                      <tr key={idx}>
                        <td className="fw-bold">{ward.ward}</td>
                        <td>{ward.constituency}</td>
                        <td>{ward.county}</td>
                        <td>{ward.total_leaders}</td>
                        <td>{ward.mcas || 0}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => {
                              setSearchTerm(ward.leader_names || "");
                              setActiveTab("leaders");
                            }}
                          >
                            View Candidates
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* All Leaders Tab */}
        {activeTab === "leaders" && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 pt-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h5 className="text-dark mb-0 fw-bold">
                    👥 All Registered Leaders
                  </h5>
                  <small className="text-secondary">
                    Complete list of all political aspirants
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, party, county..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: "250px" }}
                  />
                  <button
                    className="btn btn-outline-secondary"
                    onClick={fetchLeaders}
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Party</th>
                      <th>County</th>
                      <th>Constituency</th>
                      <th>Ward</th>
                      <th>Status</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaders.slice(0, 100).map((leader, idx) => (
                      <tr key={idx}>
                        <td className="fw-bold">{leader.name}</td>
                        <td>
                          <span
                            className={`badge bg-${getPositionBadgeClass(leader.position)}`}
                          >
                            {leader.position ||
                              leader.position_running_for ||
                              "N/A"}
                          </span>
                        </td>
                        <td>{leader.party || "N/A"}</td>
                        <td>{leader.county || "N/A"}</td>
                        <td>{leader.constituency || "N/A"}</td>
                        <td>{leader.ward || "N/A"}</td>
                        <td>
                          <span
                            className={`badge ${leader.verification === 1 ? "bg-success" : "bg-warning"}`}
                          >
                            {leader.verification === 1 ? "Verified" : "Pending"}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="small">{leader.score || 0}</span>
                            <div
                              className="progress"
                              style={{ width: "60px", height: "5px" }}
                            >
                              <div
                                className="progress-bar bg-primary"
                                style={{ width: `${leader.score || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLeaders.length === 0 && (
                  <div className="text-center text-secondary py-5">
                    No leaders found matching your search
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Aspirants;
