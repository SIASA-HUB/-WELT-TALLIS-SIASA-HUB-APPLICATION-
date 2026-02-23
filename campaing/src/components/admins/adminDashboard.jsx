import React, { useState, useEffect } from "react";
import { 
  Container, Row, Col, Card, Button, Table, 
  Form, Spinner, Modal, Badge, Alert, Tabs, Tab,
  Dropdown, Pagination, ProgressBar, Nav
} from "react-bootstrap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import {
  Users, UserCheck, FileText, MessageSquare,
  TrendingUp, Download, Edit, Trash2, Plus,
  Filter, Search, BarChart2, PieChart, Activity
} from 'react-feather';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

const CHART_COLORS = ["#007bff", "#28a745", "#ffc107", "#dc3545", "#6f42c1", "#17a2b8"];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Users state
  const [users, setUsers] = useState([]);
  const [usersPagination, setUsersPagination] = useState({});
  const [usersFilters, setUsersFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    gender: '',
    age_bracket: '',
    county: '',
    is_verified: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });
  const [usersLoading, setUsersLoading] = useState(false);

  // Leaders state
  const [leaders, setLeaders] = useState([]);
  const [leadersPagination, setLeadersPagination] = useState({});
  const [leadersFilters, setLeadersFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    party: '',
    location: '',
    status: '',
    verification: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });
  const [leadersLoading, setLeadersLoading] = useState(false);
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [editingLeader, setEditingLeader] = useState(null);
  const [leaderForm, setLeaderForm] = useState({
    name: '',
    party: '',
    location: '',
    position: '',
    education: '',
    image_url: '',
    tags: []
  });

  // Manifestos state
  const [manifestos, setManifestos] = useState([]);
  const [manifestosPagination, setManifestosPagination] = useState({});
  const [manifestosFilters, setManifestosFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    leader_id: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });
  const [manifestosLoading, setManifestosLoading] = useState(false);

  // Analytics state
  const [engagementData, setEngagementData] = useState(null);
  const [growthData, setGrowthData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30days');

  // Error state
  const [error, setError] = useState(null);

  // Fetch dashboard summary
  const fetchDashboardSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/admin/dashboard/summary');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const params = new URLSearchParams(usersFilters);
      const response = await fetch(`http://localhost:3000/api/admin/users?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.users);
        setUsersPagination(data.data.pagination);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch leaders
  const fetchLeaders = async () => {
    try {
      setLeadersLoading(true);
      const params = new URLSearchParams(leadersFilters);
      const response = await fetch(`http://localhost:3000/api/admin/leaders?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setLeaders(data.data.leaders);
        setLeadersPagination(data.data.pagination);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLeadersLoading(false);
    }
  };

  // Fetch manifestos
  const fetchManifestos = async () => {
    try {
      setManifestosLoading(true);
      const params = new URLSearchParams(manifestosFilters);
      const response = await fetch(`http://localhost:3000/api/admin/manifestos?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setManifestos(data.data.manifestos);
        setManifestosPagination(data.data.pagination);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setManifestosLoading(false);
    }
  };

  // Fetch engagement analytics
  const fetchEngagementAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/admin/analytics/engagement?period=${analyticsPeriod}`
      );
      const data = await response.json();
      
      if (data.success) {
        setEngagementData(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch growth metrics
  const fetchGrowthMetrics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await fetch('http://localhost:3000/api/admin/analytics/growth?months=12');
      const data = await response.json();
      
      if (data.success) {
        setGrowthData(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Update user verification
  const updateUserVerification = async (userId, isVerified) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/admin/users/${userId}/verification`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_verified: isVerified })
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        fetchUsers(); // Refresh users list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Create or update leader
  const saveLeader = async () => {
    try {
      const url = editingLeader 
        ? `http://localhost:3000/api/admin/leaders/${editingLeader.leader_id}`
        : 'http://localhost:3000/api/admin/leaders';
      
      const method = editingLeader ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaderForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowLeaderModal(false);
        setEditingLeader(null);
        setLeaderForm({
          name: '',
          party: '',
          location: '',
          position: '',
          education: '',
          image_url: '',
          tags: []
        });
        fetchLeaders(); // Refresh leaders list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Delete leader
  const deleteLeader = async (leaderId) => {
    if (window.confirm('Are you sure you want to delete this leader?')) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/admin/leaders/${leaderId}`,
          { method: 'DELETE' }
        );
        
        const data = await response.json();
        
        if (data.success) {
          fetchLeaders(); // Refresh leaders list
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        setError(error.message);
      }
    }
  };

  // Export data
  const exportData = async (type, format = 'csv') => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/admin/export?type=${type}&format=${format}`
      );
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const jsonStr = JSON.stringify(data.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Initialize leader form for editing
  const initEditLeader = (leader) => {
    setEditingLeader(leader);
    setLeaderForm({
      name: leader.name || '',
      party: leader.party || '',
      location: leader.location || '',
      position: leader.position || '',
      education: leader.education || '',
      image_url: leader.image_url || '',
      tags: leader.tags ? JSON.parse(leader.tags) : []
    });
    setShowLeaderModal(true);
  };

  // Initialize leader form for creation
  const initCreateLeader = () => {
    setEditingLeader(null);
    setLeaderForm({
      name: '',
      party: '',
      location: '',
      position: '',
      education: '',
      image_url: '',
      tags: []
    });
    setShowLeaderModal(true);
  };

  // Effect for initial load
  useEffect(() => {
    fetchDashboardSummary();
    fetchEngagementAnalytics();
    fetchGrowthMetrics();
  }, []);

  // Effect for users
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, usersFilters]);

  // Effect for leaders
  useEffect(() => {
    if (activeTab === 'leaders') {
      fetchLeaders();
    }
  }, [activeTab, leadersFilters]);

  // Effect for manifestos
  useEffect(() => {
    if (activeTab === 'manifestos') {
      fetchManifestos();
    }
  }, [activeTab, manifestosFilters]);

  // Effect for analytics period
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchEngagementAnalytics();
    }
  }, [analyticsPeriod]);

  // Prepare charts data
  const prepareGenderChartData = () => {
    if (!dashboardData?.userDemographics?.gender) return null;
    
    return {
      labels: dashboardData.userDemographics.gender.map(g => g.gender),
      datasets: [
        {
          data: dashboardData.userDemographics.gender.map(g => g.count),
          backgroundColor: CHART_COLORS,
          borderWidth: 2,
          borderColor: '#fff'
        }
      ]
    };
  };

  const prepareAgeChartData = () => {
    if (!dashboardData?.userDemographics?.age) return null;
    
    return {
      labels: dashboardData.userDemographics.age.map(a => a.age_bracket),
      datasets: [
        {
          label: 'Users',
          data: dashboardData.userDemographics.age.map(a => a.count),
          backgroundColor: CHART_COLORS[1],
          borderWidth: 0,
          borderRadius: 8
        }
      ]
    };
  };

  const prepareEngagementChartData = () => {
    if (!engagementData?.dailyEngagement) return null;
    
    return {
      labels: engagementData.dailyEngagement.map(d => 
        new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ),
      datasets: [
        {
          label: 'Likes',
          data: engagementData.dailyEngagement.map(d => d.likes),
          borderColor: CHART_COLORS[4],
          backgroundColor: `${CHART_COLORS[4]}20`,
          borderWidth: 3,
          fill: true,
          tension: 0.4
        },
        {
          label: 'Comments',
          data: engagementData.dailyEngagement.map(d => d.comments),
          borderColor: CHART_COLORS[1],
          backgroundColor: `${CHART_COLORS[1]}20`,
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }
      ]
    };
  };

  const prepareGrowthChartData = () => {
    if (!growthData?.userGrowth) return null;
    
    return {
      labels: growthData.userGrowth.map(g => g.month),
      datasets: [
        {
          label: 'New Users',
          data: growthData.userGrowth.map(g => g.new_users),
          borderColor: CHART_COLORS[0],
          backgroundColor: `${CHART_COLORS[0]}20`,
          borderWidth: 3,
          fill: true
        },
        {
          label: 'Total Users',
          data: growthData.userGrowth.map(g => g.total_users),
          borderColor: CHART_COLORS[2],
          backgroundColor: `${CHART_COLORS[2]}20`,
          borderWidth: 3,
          fill: true
        }
      ]
    };
  };

  if (loading && !dashboardData) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">Admin Dashboard</h1>
          <p className="text-muted mb-0">
            Manage users, leaders, manifestos, and view platform analytics
          </p>
        </div>
        <div>
          <Dropdown>
            <Dropdown.Toggle variant="primary">
              <Download size={16} className="me-2" />
              Export Data
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => exportData('users')}>
                Export Users (CSV)
              </Dropdown.Item>
              <Dropdown.Item onClick={() => exportData('leaders')}>
                Export Leaders (CSV)
              </Dropdown.Item>
              <Dropdown.Item onClick={() => exportData('manifestos')}>
                Export Manifestos (CSV)
              </Dropdown.Item>
              <Dropdown.Item onClick={() => exportData('engagements')}>
                Export Engagements (CSV)
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => exportData('users', 'json')}>
                Export Users (JSON)
              </Dropdown.Item>
              <Dropdown.Item onClick={() => exportData('leaders', 'json')}>
                Export Leaders (JSON)
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* Navigation Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="dashboard" title={
          <>
            <BarChart2 size={16} className="me-1" />
            Dashboard
          </>
        }>
          {/* Dashboard Content */}
          {dashboardData && (
            <>
              {/* Summary Cards */}
              <Row className="mb-4">
                <Col xl={3} lg={6} md={6} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-2">Total Users</h6>
                          <h2 className="mb-0">{dashboardData.summary.totalUsers}</h2>
                          <small className="text-success">
                            +{dashboardData.summary.todayUsers} today
                          </small>
                        </div>
                        <div className="bg-primary bg-opacity-10 p-3 rounded">
                          <Users size={24} className="text-primary" />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xl={3} lg={6} md={6} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-2">Total Leaders</h6>
                          <h2 className="mb-0">{dashboardData.summary.totalLeaders}</h2>
                          <small className="text-muted">Active on platform</small>
                        </div>
                        <div className="bg-success bg-opacity-10 p-3 rounded">
                          <UserCheck size={24} className="text-success" />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xl={3} lg={6} md={6} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-2">Total Manifestos</h6>
                          <h2 className="mb-0">{dashboardData.summary.totalManifestos}</h2>
                          <small className="text-success">
                            +{dashboardData.summary.todayManifestos} today
                          </small>
                        </div>
                        <div className="bg-warning bg-opacity-10 p-3 rounded">
                          <FileText size={24} className="text-warning" />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xl={3} lg={6} md={6} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-2">Total Comments</h6>
                          <h2 className="mb-0">{dashboardData.summary.totalComments}</h2>
                          <small className="text-success">
                            +{dashboardData.summary.todayComments} today
                          </small>
                        </div>
                        <div className="bg-info bg-opacity-10 p-3 rounded">
                          <MessageSquare size={24} className="text-info" />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Charts Row */}
              <Row className="mb-4">
                <Col xl={6} lg={12} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body>
                      <h5 className="card-title mb-4">User Gender Distribution</h5>
                      <div style={{ height: '300px' }}>
                        {prepareGenderChartData() ? (
                          <Doughnut
                            data={prepareGenderChartData()}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'bottom'
                                }
                              }
                            }}
                          />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                            No data available
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xl={6} lg={12} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body>
                      <h5 className="card-title mb-4">User Age Distribution</h5>
                      <div style={{ height: '300px' }}>
                        {prepareAgeChartData() ? (
                          <Bar
                            data={prepareAgeChartData()}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  display: false
                                }
                              },
                              scales: {
                                y: {
                                  beginAtZero: true
                                }
                              }
                            }}
                          />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                            No data available
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Growth & Engagement Charts */}
              <Row>
                <Col xl={6} lg={12} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="card-title mb-0">User Growth Trend</h5>
                        <Badge bg="success" className="px-3 py-2">
                          <TrendingUp size={14} className="me-1" />
                          {growthData?.growthRates?.userGrowthRate?.toFixed(1)}% MoM
                        </Badge>
                      </div>
                      <div style={{ height: '300px' }}>
                        {prepareGrowthChartData() ? (
                          <Line
                            data={prepareGrowthChartData()}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'top'
                                }
                              }
                            }}
                          />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                            No data available
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xl={6} lg={12} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="card-title mb-0">Engagement Trend</h5>
                        <div className="d-flex gap-2">
                          <Form.Select 
                            size="sm" 
                            style={{ width: '120px' }}
                            value={analyticsPeriod}
                            onChange={(e) => setAnalyticsPeriod(e.target.value)}
                          >
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 90 Days</option>
                            <option value="year">Last Year</option>
                          </Form.Select>
                        </div>
                      </div>
                      <div style={{ height: '300px' }}>
                        {prepareEngagementChartData() ? (
                          <Line
                            data={prepareEngagementChartData()}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'top'
                                }
                              }
                            }}
                          />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                            No data available
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Recent Activities */}
              <Row>
                <Col lg={12}>
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <h5 className="card-title mb-4">Recent Activities</h5>
                      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <Table hover responsive>
                          <thead>
                            <tr>
                              <th>Type</th>
                              <th>Description</th>
                              <th>User/Leader</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.recentActivities?.map((activity, index) => (
                              <tr key={index}>
                                <td>
                                  <Badge bg={
                                    activity.type === 'user_signup' ? 'success' :
                                    activity.type === 'manifesto_created' ? 'primary' :
                                    'info'
                                  }>
                                    {activity.type === 'user_signup' ? 'User Signup' :
                                     activity.type === 'manifesto_created' ? 'Manifesto Created' :
                                     'Comment Added'}
                                  </Badge>
                                </td>
                                <td>{activity.description}</td>
                                <td>{activity.name}</td>
                                <td>
                                  {new Date(activity.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Tab>

        <Tab eventKey="users" title={
          <>
            <Users size={16} className="me-1" />
            Users
          </>
        }>
          {/* Users Management */}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0">User Management</h5>
                <div className="d-flex gap-2">
                  <Form.Control
                    placeholder="Search users..."
                    value={usersFilters.search}
                    onChange={(e) => setUsersFilters({...usersFilters, search: e.target.value, page: 1})}
                    style={{ width: '200px' }}
                  />
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary">
                      <Filter size={16} className="me-1" />
                      Filters
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <div className="p-3" style={{ minWidth: '250px' }}>
                        <Form.Group className="mb-3">
                          <Form.Label>Gender</Form.Label>
                          <Form.Select
                            value={usersFilters.gender}
                            onChange={(e) => setUsersFilters({...usersFilters, gender: e.target.value, page: 1})}
                          >
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Verification</Form.Label>
                          <Form.Select
                            value={usersFilters.is_verified}
                            onChange={(e) => setUsersFilters({...usersFilters, is_verified: e.target.value, page: 1})}
                          >
                            <option value="">All</option>
                            <option value="true">Verified</option>
                            <option value="false">Not Verified</option>
                          </Form.Select>
                        </Form.Group>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => setUsersFilters({
                            page: 1,
                            limit: 20,
                            search: '',
                            gender: '',
                            age_bracket: '',
                            county: '',
                            is_verified: '',
                            sortBy: 'created_at',
                            sortOrder: 'DESC'
                          })}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>

              {usersLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                  <p className="mt-2">Loading users...</p>
                </div>
              ) : (
                <>
                  <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <Table hover responsive>
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Gender</th>
                          <th>Age</th>
                          <th>County</th>
                          <th>Ward</th>
                          <th>Voter Card</th>
                          <th>Verified</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <strong>{user.anonymous_username}</strong>
                              <br />
                              <small className="text-muted">{user.user_id}</small>
                            </td>
                            <td>{user.gender || 'Not specified'}</td>
                            <td>{user.age_bracket || 'Not specified'}</td>
                            <td>{user.county || 'Not specified'}</td>
                            <td>{user.ward || 'Not specified'}</td>
                            <td>
                              {user.voter_card ? (
                                <Badge bg="success">Yes</Badge>
                              ) : (
                                <Badge bg="secondary">No</Badge>
                              )}
                            </td>
                            <td>
                              {user.is_verified ? (
                                <Badge bg="success" className="cursor-pointer" onClick={() => updateUserVerification(user.user_id, false)}>
                                  Verified
                                </Badge>
                              ) : (
                                <Badge bg="warning" className="cursor-pointer" onClick={() => updateUserVerification(user.user_id, true)}>
                                  Not Verified
                                </Badge>
                              )}
                            </td>
                            <td>
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => updateUserVerification(user.user_id, !user.is_verified)}
                              >
                                {user.is_verified ? 'Unverify' : 'Verify'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {usersPagination.pages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <Pagination>
                        <Pagination.Prev
                          disabled={usersFilters.page === 1}
                          onClick={() => setUsersFilters({...usersFilters, page: usersFilters.page - 1})}
                        />
                        {Array.from({ length: Math.min(5, usersPagination.pages) }, (_, i) => {
                          let pageNum;
                          if (usersPagination.pages <= 5) {
                            pageNum = i + 1;
                          } else if (usersFilters.page <= 3) {
                            pageNum = i + 1;
                          } else if (usersFilters.page >= usersPagination.pages - 2) {
                            pageNum = usersPagination.pages - 4 + i;
                          } else {
                            pageNum = usersFilters.page - 2 + i;
                          }
                          
                          return (
                            <Pagination.Item
                              key={pageNum}
                              active={pageNum === usersFilters.page}
                              onClick={() => setUsersFilters({...usersFilters, page: pageNum})}
                            >
                              {pageNum}
                            </Pagination.Item>
                          );
                        })}
                        <Pagination.Next
                          disabled={usersFilters.page === usersPagination.pages}
                          onClick={() => setUsersFilters({...usersFilters, page: usersFilters.page + 1})}
                        />
                      </Pagination>
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">
                      Showing {(usersFilters.page - 1) * usersFilters.limit + 1} to{' '}
                      {Math.min(usersFilters.page * usersFilters.limit, usersPagination.total)} of{' '}
                      {usersPagination.total} users
                    </small>
                    <Form.Select
                      style={{ width: '100px' }}
                      value={usersFilters.limit}
                      onChange={(e) => setUsersFilters({...usersFilters, limit: parseInt(e.target.value), page: 1})}
                    >
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
                      <option value="100">100 per page</option>
                    </Form.Select>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="leaders" title={
          <>
            <UserCheck size={16} className="me-1" />
            Leaders
          </>
        }>
          {/* Leaders Management */}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0">Leader Management</h5>
                <div className="d-flex gap-2">
                  <Button variant="primary" onClick={initCreateLeader}>
                    <Plus size={16} className="me-1" />
                    Add Leader
                  </Button>
                  <Form.Control
                    placeholder="Search leaders..."
                    value={leadersFilters.search}
                    onChange={(e) => setLeadersFilters({...leadersFilters, search: e.target.value, page: 1})}
                    style={{ width: '200px' }}
                  />
                </div>
              </div>

              {leadersLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                  <p className="mt-2">Loading leaders...</p>
                </div>
              ) : (
                <>
                  <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <Table hover responsive>
                      <thead>
                        <tr>
                          <th>Leader</th>
                          <th>Party</th>
                          <th>Location</th>
                          <th>Position</th>
                          <th>Status</th>
                          <th>Verified</th>
                          <th>Engagement</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaders.map((leader) => (
                          <tr key={leader.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                {leader.image_url ? (
                                  <img
                                    src={leader.image_url}
                                    alt={leader.name}
                                    className="rounded-circle me-3"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div className="rounded-circle bg-secondary me-3 d-flex align-items-center justify-content-center"
                                    style={{ width: '40px', height: '40px' }}>
                                    <span className="text-white">{leader.name.charAt(0)}</span>
                                  </div>
                                )}
                                <div>
                                  <strong>{leader.name}</strong>
                                  <br />
                                  <small className="text-muted">{leader.leader_id}</small>
                                </div>
                              </div>
                            </td>
                            <td>{leader.party || 'Independent'}</td>
                            <td>{leader.location || 'Not specified'}</td>
                            <td>{leader.position || 'Not specified'}</td>
                            <td>
                              <Badge bg={leader.status === 'active' ? 'success' : 'secondary'}>
                                {leader.status}
                              </Badge>
                            </td>
                            <td>
                              {leader.verification ? (
                                <Badge bg="success">Verified</Badge>
                              ) : (
                                <Badge bg="warning">Not Verified</Badge>
                              )}
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <small>
                                  <Badge bg="success" className="me-1">
                                    👍 {leader.likes}
                                  </Badge>
                                </small>
                                <small>
                                  <Badge bg="danger" className="me-1">
                                    👎 {leader.dislikes}
                                  </Badge>
                                </small>
                                <small>
                                  <Badge bg="info">
                                    💬 {leader.comments_count}
                                  </Badge>
                                </small>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => initEditLeader(leader)}
                                >
                                  <Edit size={14} />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => deleteLeader(leader.leader_id)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {leadersPagination.pages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <Pagination>
                        <Pagination.Prev
                          disabled={leadersFilters.page === 1}
                          onClick={() => setLeadersFilters({...leadersFilters, page: leadersFilters.page - 1})}
                        />
                        {Array.from({ length: Math.min(5, leadersPagination.pages) }, (_, i) => {
                          let pageNum;
                          if (leadersPagination.pages <= 5) {
                            pageNum = i + 1;
                          } else if (leadersFilters.page <= 3) {
                            pageNum = i + 1;
                          } else if (leadersFilters.page >= leadersPagination.pages - 2) {
                            pageNum = leadersPagination.pages - 4 + i;
                          } else {
                            pageNum = leadersFilters.page - 2 + i;
                          }
                          
                          return (
                            <Pagination.Item
                              key={pageNum}
                              active={pageNum === leadersFilters.page}
                              onClick={() => setLeadersFilters({...leadersFilters, page: pageNum})}
                            >
                              {pageNum}
                            </Pagination.Item>
                          );
                        })}
                        <Pagination.Next
                          disabled={leadersFilters.page === leadersPagination.pages}
                          onClick={() => setLeadersFilters({...leadersFilters, page: leadersFilters.page + 1})}
                        />
                      </Pagination>
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">
                      Showing {(leadersFilters.page - 1) * leadersFilters.limit + 1} to{' '}
                      {Math.min(leadersFilters.page * leadersFilters.limit, leadersPagination.total)} of{' '}
                      {leadersPagination.total} leaders
                    </small>
                    <Form.Select
                      style={{ width: '100px' }}
                      value={leadersFilters.limit}
                      onChange={(e) => setLeadersFilters({...leadersFilters, limit: parseInt(e.target.value), page: 1})}
                    >
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
                      <option value="100">100 per page</option>
                    </Form.Select>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="manifestos" title={
          <>
            <FileText size={16} className="me-1" />
            Manifestos
          </>
        }>
          {/* Manifestos Management */}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0">Manifesto Management</h5>
                <Form.Control
                  placeholder="Search manifestos..."
                  value={manifestosFilters.search}
                  onChange={(e) => setManifestosFilters({...manifestosFilters, search: e.target.value, page: 1})}
                  style={{ width: '200px' }}
                />
              </div>

              {manifestosLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                  <p className="mt-2">Loading manifestos...</p>
                </div>
              ) : (
                <>
                  <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <Table hover responsive>
                      <thead>
                        <tr>
                          <th>Manifesto</th>
                          <th>Leader</th>
                          <th>Party</th>
                          <th>Engagement</th>
                          <th>Created</th>
                          <th>PDF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {manifestos.map((manifesto) => (
                          <tr key={manifesto.manifesto_id}>
                            <td>
                              <strong>{manifesto.main_agenda}</strong>
                              <br />
                              <small className="text-muted">
                                ID: {manifesto.manifesto_id}
                              </small>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                {manifesto.leader_image ? (
                                  <img
                                    src={manifesto.leader_image}
                                    alt={manifesto.leader_name}
                                    className="rounded-circle me-2"
                                    style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                                  />
                                ) : null}
                                <span>{manifesto.leader_name}</span>
                              </div>
                            </td>
                            <td>{manifesto.party || 'Independent'}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Badge bg="success" className="me-1">
                                  👍 {manifesto.likes}
                                </Badge>
                                <Badge bg="danger" className="me-1">
                                  👎 {manifesto.dislikes}
                                </Badge>
                                <Badge bg="info">
                                  💬 {manifesto.comments_count}
                                </Badge>
                              </div>
                            </td>
                            <td>
                              {new Date(manifesto.created_at).toLocaleDateString()}
                            </td>
                            <td>
                              {manifesto.pdf_url ? (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  as="a"
                                  href={manifesto.pdf_url}
                                  target="_blank"
                                >
                                  View PDF
                                </Button>
                              ) : (
                                <span className="text-muted">No PDF</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {manifestosPagination.pages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <Pagination>
                        <Pagination.Prev
                          disabled={manifestosFilters.page === 1}
                          onClick={() => setManifestosFilters({...manifestosFilters, page: manifestosFilters.page - 1})}
                        />
                        {Array.from({ length: Math.min(5, manifestosPagination.pages) }, (_, i) => {
                          let pageNum;
                          if (manifestosPagination.pages <= 5) {
                            pageNum = i + 1;
                          } else if (manifestosFilters.page <= 3) {
                            pageNum = i + 1;
                          } else if (manifestosFilters.page >= manifestosPagination.pages - 2) {
                            pageNum = manifestosPagination.pages - 4 + i;
                          } else {
                            pageNum = manifestosFilters.page - 2 + i;
                          }
                          
                          return (
                            <Pagination.Item
                              key={pageNum}
                              active={pageNum === manifestosFilters.page}
                              onClick={() => setManifestosFilters({...manifestosFilters, page: pageNum})}
                            >
                              {pageNum}
                            </Pagination.Item>
                          );
                        })}
                        <Pagination.Next
                          disabled={manifestosFilters.page === manifestosPagination.pages}
                          onClick={() => setManifestosFilters({...manifestosFilters, page: manifestosFilters.page + 1})}
                        />
                      </Pagination>
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">
                      Showing {(manifestosFilters.page - 1) * manifestosFilters.limit + 1} to{' '}
                      {Math.min(manifestosFilters.page * manifestosFilters.limit, manifestosPagination.total)} of{' '}
                      {manifestosPagination.total} manifestos
                    </small>
                    <Form.Select
                      style={{ width: '100px' }}
                      value={manifestosFilters.limit}
                      onChange={(e) => setManifestosFilters({...manifestosFilters, limit: parseInt(e.target.value), page: 1})}
                    >
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
                      <option value="100">100 per page</option>
                    </Form.Select>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="analytics" title={
          <>
            <PieChart size={16} className="me-1" />
            Analytics
          </>
        }>
          {/* Advanced Analytics */}
          <Row>
            <Col lg={12} className="mb-4">
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h5 className="card-title mb-4">Engagement Analytics</h5>
                  
                  {analyticsLoading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" />
                      <p className="mt-2">Loading analytics...</p>
                    </div>
                  ) : engagementData ? (
                    <>
                      <Row className="mb-4">
                        <Col md={4} className="mb-3">
                          <Card className="border">
                            <Card.Body className="text-center">
                              <h3 className="text-primary">
                                {engagementData.dailyEngagement.reduce((sum, day) => sum + day.total_engagements, 0).toLocaleString()}
                              </h3>
                              <p className="text-muted mb-0">Total Engagements</p>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={4} className="mb-3">
                          <Card className="border">
                            <Card.Body className="text-center">
                              <h3 className="text-success">
                                {engagementData.dailyEngagement.reduce((sum, day) => sum + day.likes, 0).toLocaleString()}
                              </h3>
                              <p className="text-muted mb-0">Total Likes</p>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={4} className="mb-3">
                          <Card className="border">
                            <Card.Body className="text-center">
                              <h3 className="text-info">
                                {engagementData.dailyEngagement.reduce((sum, day) => sum + day.comments, 0).toLocaleString()}
                              </h3>
                              <p className="text-muted mb-0">Total Comments</p>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>

                      {/* Hourly Engagement */}
                      <Row className="mb-4">
                        <Col lg={6}>
                          <Card className="border">
                            <Card.Body>
                              <h6 className="card-title mb-3">Engagement by Hour of Day</h6>
                              <div style={{ height: '250px' }}>
                                <Bar
                                  data={{
                                    labels: engagementData.hourlyEngagement.map(h => `${h.hour}:00`),
                                    datasets: [{
                                      label: 'Engagements',
                                      data: engagementData.hourlyEngagement.map(h => h.total_engagements),
                                      backgroundColor: CHART_COLORS[0],
                                      borderWidth: 0,
                                      borderRadius: 4
                                    }]
                                  }}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                      legend: { display: false }
                                    }
                                  }}
                                />
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col lg={6}>
                          <Card className="border">
                            <Card.Body>
                              <h6 className="card-title mb-3">Engagement by Day of Week</h6>
                              <div style={{ height: '250px' }}>
                                <Bar
                                  data={{
                                    labels: engagementData.weeklyEngagement.map(w => w.day),
                                    datasets: [{
                                      label: 'Engagements',
                                      data: engagementData.weeklyEngagement.map(w => w.total_engagements),
                                      backgroundColor: CHART_COLORS[1],
                                      borderWidth: 0,
                                      borderRadius: 4
                                    }]
                                  }}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                      legend: { display: false }
                                    }
                                  }}
                                />
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>

                      {/* Top Users */}
                      <Card className="border mb-4">
                        <Card.Body>
                          <h6 className="card-title mb-3">Top Engaging Users</h6>
                          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <Table hover responsive>
                              <thead>
                                <tr>
                                  <th>Username</th>
                                  <th>Gender</th>
                                  <th>Age</th>
                                  <th>County</th>
                                  <th>Total Engagements</th>
                                  <th>Likes</th>
                                  <th>Comments</th>
                                </tr>
                              </thead>
                              <tbody>
                                {engagementData.topUsers.map((user, index) => (
                                  <tr key={user.id}>
                                    <td>
                                      <strong>{user.anonymous_username}</strong>
                                    </td>
                                    <td>{user.gender || 'N/A'}</td>
                                    <td>{user.age_bracket || 'N/A'}</td>
                                    <td>{user.county || 'N/A'}</td>
                                    <td>
                                      <Badge bg="primary">{user.total_engagements}</Badge>
                                    </td>
                                    <td>
                                      <Badge bg="success">{user.likes_given}</Badge>
                                    </td>
                                    <td>
                                      <Badge bg="info">{user.comments_given}</Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </Card.Body>
                      </Card>
                    </>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      No analytics data available
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* Leader Modal */}
      <Modal show={showLeaderModal} onHide={() => setShowLeaderModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingLeader ? 'Edit Leader' : 'Add New Leader'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Leader Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={leaderForm.name}
                    onChange={(e) => setLeaderForm({...leaderForm, name: e.target.value})}
                    placeholder="Enter leader's full name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Political Party</Form.Label>
                  <Form.Control
                    type="text"
                    value={leaderForm.party}
                    onChange={(e) => setLeaderForm({...leaderForm, party: e.target.value})}
                    placeholder="Enter political party"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location/Constituency</Form.Label>
                  <Form.Control
                    type="text"
                    value={leaderForm.location}
                    onChange={(e) => setLeaderForm({...leaderForm, location: e.target.value})}
                    placeholder="Enter location or constituency"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Position</Form.Label>
                  <Form.Control
                    type="text"
                    value={leaderForm.position}
                    onChange={(e) => setLeaderForm({...leaderForm, position: e.target.value})}
                    placeholder="E.g., Governor, Senator, MP"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Education Background</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={leaderForm.education}
                onChange={(e) => setLeaderForm({...leaderForm, education: e.target.value})}
                placeholder="Enter education background"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Profile Image URL</Form.Label>
              <Form.Control
                type="url"
                value={leaderForm.image_url}
                onChange={(e) => setLeaderForm({...leaderForm, image_url: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tags (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                value={leaderForm.tags.join(', ')}
                onChange={(e) => setLeaderForm({...leaderForm, tags: e.target.value.split(',').map(tag => tag.trim())})}
                placeholder="E.g., youth, education, healthcare"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLeaderModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveLeader}>
            {editingLeader ? 'Update Leader' : 'Create Leader'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;