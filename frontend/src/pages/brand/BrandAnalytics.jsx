// BrandAnalytics.jsx - Professional Enterprise Analytics Dashboard
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, ScatterChart, Scatter, ComposedChart
} from 'recharts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  TrendingUp, Users, DollarSign, Target, BarChart3, PieChart as PieChartIcon,
  Calendar, Filter, Download, Eye, Star, UserCheck, Award,
  Clock, TrendingDown, CheckCircle, XCircle, AlertCircle, Activity,
  CreditCard, FileText, ShoppingBag, Percent, ArrowUp,
  ArrowDown, RefreshCw, Search, ChevronDown, ChevronUp,
  Shield, Zap, Globe, Package, Wallet, BarChart2, LineChart as LineChartIcon,
  Users as UsersIcon, DollarSign as DollarIcon, Target as TargetIcon,
  ArrowLeft, MessageSquare, Settings, MoreVertical, Minus, Tag,
  Play, Pause, CheckSquare, XSquare, Info, ExternalLink,
  Heart, Share2, ThumbsUp, Eye as EyeIcon, MessageCircle,
  Bell, User, Mail, Phone, Home, Instagram, Youtube, Facebook,
  Twitter, Linkedin, Globe as GlobeIcon, Lock, Unlock,
  Edit, Trash2, Plus, Save, Hash
} from 'lucide-react';
import API_BASE_URL from '../../config/api';
import '../../style/BrandAnalytics.css';

const BrandAnalyticsProfessional = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Analytics data states
  const [dashboardData, setDashboardData] = useState(null);
  const [campaignsData, setCampaignsData] = useState(null);
  const [campaignDetail, setCampaignDetail] = useState(null);
  const [paymentsData, setPaymentsData] = useState(null);
  const [applicationsData, setApplicationsData] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [influencerPerformance, setInfluencerPerformance] = useState(null);
  const [brandProfile, setBrandProfile] = useState(null);


  const fetchBrandProfile = async () => {
  try {
    const token = localStorage.getItem("access_token");

    const res = await axios.get(`${API_BASE_URL}/profiles/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.data?.type === "brand") {
      setBrandProfile(res.data.profile);
    }
  } catch (err) {
    console.error("Failed to load brand profile", err);
  }
};

const getBrandLogo = (fileId) =>
  fileId ? `${API_BASE_URL}/profiles/image/${fileId}` : null;



  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    startDate: null,
    endDate: null,
    minAmount: '',
    maxAmount: '',
    influencerId: '',
    campaignId: ''
  });
  
  // Period selectors
  const [dashboardPeriod, setDashboardPeriod] = useState('30days');
  const [financialPeriod, setFinancialPeriod] = useState('monthly');
  
  // UI States
  const [expandedCharts, setExpandedCharts] = useState({});
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Color palettes
  const CHART_COLORS = {
    primary: '#4361ee',
    secondary: '#06d6a0',
    tertiary: '#7209b7',
    warning: '#f9c74f',
    danger: '#ef476f',
    neutral: '#64748b'
  };

  const STATUS_COLORS = {
    active: '#06d6a0',
    completed: '#4361ee',
    pending: '#f9c74f',
    draft: '#64748b',
    paused: '#ef476f',
    approved: '#06d6a0',
    rejected: '#ef476f',
    reviewed: '#7209b7',
    shortlisted: '#f9c74f',
    contracted: '#4361ee',
    paid: '#06d6a0',
    failed: '#ef476f',
    processing: '#7209b7'
  };

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${value?.toFixed(1) || 0}%`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // API Functions
  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/api/brand/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const params = {};
      
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.start_date = filters.startDate.toISOString().split('T')[0];
      if (filters.endDate) params.end_date = filters.endDate.toISOString().split('T')[0];
      
      const response = await axios.get(`${API_BASE_URL}/api/brand/analytics/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setCampaignsData(response.data.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchCampaignDetail = async (campaignId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/api/brand/analytics/campaign/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaignDetail(response.data.data);
      setSelectedCampaign(campaignId);
      setActiveTab('campaign-detail');
    } catch (error) {
      console.error('Error fetching campaign detail:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const params = {};
      
      if (filters.status) params.status = filters.status;
      if (filters.campaignId) params.campaign_id = filters.campaignId;
      if (filters.startDate) params.start_date = filters.startDate.toISOString().split('T')[0];
      if (filters.endDate) params.end_date = filters.endDate.toISOString().split('T')[0];
      if (filters.minAmount) params.min_amount = filters.minAmount;
      if (filters.maxAmount) params.max_amount = filters.maxAmount;
      
      const response = await axios.get(`${API_BASE_URL}/api/brand/analytics/payments`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setPaymentsData(response.data.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const params = {};
      
      if (filters.status) params.status = filters.status;
      if (filters.campaignId) params.campaign_id = filters.campaignId;
      if (filters.startDate) params.start_date = filters.startDate.toISOString().split('T')[0];
      if (filters.endDate) params.end_date = filters.endDate.toISOString().split('T')[0];
      if (filters.influencerId) params.influencer_id = filters.influencerId;
      
      const response = await axios.get(`${API_BASE_URL}/api/brand/analytics/applications`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setApplicationsData(response.data.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchFinancial = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/api/brand/analytics/financial`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { period: financialPeriod }
      });
      setFinancialData(response.data.data);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    }
  };

  const fetchInfluencerPerformance = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/api/brand/analytics/influencer-performance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInfluencerPerformance(response.data.data);
    } catch (error) {
      console.error('Error fetching influencer performance:', error);
    }
  };

  const handleExport = async (dataType, format) => {
    try {
      setExportLoading(true);
      const token = localStorage.getItem('access_token');
      const params = {
        data_type: dataType,
        format: format
      };
      
      if (filters.startDate) params.start_date = filters.startDate.toISOString().split('T')[0];
      if (filters.endDate) params.end_date = filters.endDate.toISOString().split('T')[0];
      
      const response = await axios.get(`${API_BASE_URL}/api/brand/analytics/export`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      if (format === 'json') {
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
        const exportFileDefaultName = `${dataType}_export_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      } else {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${dataType}_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchBrandProfile(),
getBrandLogo(),
          fetchDashboard(),
          fetchCampaigns(),
          fetchPayments(),
          fetchApplications(),
          fetchFinancial(),
          fetchInfluencerPerformance()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
      setLoading(false);
    };
    
    loadInitialData();
  }, []);

  // Update data when filters or period changes
  useEffect(() => {
    const updateData = async () => {
      try {
        if (activeTab === "campaigns") {
          await fetchCampaigns();
        } 
        else if (activeTab === "payments") {
          await fetchPayments();
        } 
        else if (activeTab === "applications") {
          await fetchApplications();
        } 
        else if (activeTab === "financial") {
          await fetchFinancial();
        } 
        else if (activeTab === "influencer") {
          await fetchInfluencerPerformance();
        }
      } catch (error) {
        console.error("Failed to update data:", error);
      }
    };

    updateData();
  }, [activeTab, filters, financialPeriod]);

  // Toggle chart expansion
  const toggleChartExpansion = (chartId) => {
    setExpandedCharts(prev => ({
      ...prev,
      [chartId]: !prev[chartId]
    }));
  };

  // Reusable Components
  const StatCard = ({ title, value, change, icon, color = 'primary', loading = false }) => {
    if (loading) {
      return (
        <div className="brand-prof-stat-card brand-prof-skeleton">
          <div className="brand-prof-stat-skeleton"></div>
          <div className="brand-prof-value-skeleton"></div>
        </div>
      );
    }

    return (
      <div className={`brand-prof-stat-card brand-prof-${color}`}>
        <div className="brand-prof-stat-header">
          <div className="brand-prof-stat-icon">{icon}</div>
          <div className="brand-prof-stat-title">{title}</div>
        </div>
        <div className="brand-prof-stat-value">{value}</div>
        {change !== undefined && (
          <div className={`brand-prof-stat-change ${change >= 0 ? 'brand-prof-positive' : 'brand-prof-negative'}`}>
            {change >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
    );
  };

  const ChartCard = ({ title, children, expandable = true, className = '' }) => {
    const chartId = title.toLowerCase().replace(/\s+/g, '-');
    const isExpanded = expandedCharts[chartId];

    return (
      <div className={`brand-prof-chart-card ${className} ${isExpanded ? 'brand-prof-expanded' : ''}`}>
        <div className="brand-prof-chart-header">
          <h3 className="brand-prof-chart-title">{title}</h3>
          {expandable && (
            <button 
              className="brand-prof-chart-expand-btn"
              onClick={() => toggleChartExpansion(chartId)}
              aria-label={isExpanded ? "Collapse chart" : "Expand chart"}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
        <div className="brand-prof-chart-content">
          {children}
        </div>
      </div>
    );
  };

  const DataTable = ({ headers, rows, loading = false, emptyMessage = "No data available" }) => {
    if (loading) {
      return (
        <div className="brand-prof-data-table brand-prof-loading">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="brand-prof-row-skeleton"></div>
          ))}
        </div>
      );
    }

    if (!rows || rows.length === 0) {
      return (
        <div className="brand-prof-data-table brand-prof-empty">
          <div className="brand-prof-empty-state">
            <FileText size={32} />
            <p>{emptyMessage}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="brand-prof-data-table">
        <div className="brand-prof-table-scroll">
          <table>
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const StatusBadge = ({ status, children }) => (
    <span 
      className="brand-prof-status-badge"
      style={{ backgroundColor: STATUS_COLORS[status] || CHART_COLORS.neutral }}
    >
      {children || status}
    </span>
  );

  // Dashboard Tab Component
  const DashboardTab = () => {
    if (!dashboardData) {
      return (
        <div className="brand-prof-dashboard-skeleton">
          {[...Array(4)].map((_, i) => (
            <StatCard key={i} loading={true} />
          ))}
        </div>
      );
    }

    const summary = dashboardData?.campaigns_summary || {};
    const performance = dashboardData?.performance_metrics || {};
    const recentActivity = dashboardData?.recent_activity || {};
    const charts = dashboardData?.charts || {};

    const statsData = [
      {
        title: 'Total Campaigns',
        value: summary.total_campaigns || 0,
        change: 12,
        icon: <ShoppingBag size={20} />,
        color: 'primary'
      },
      {
        title: 'Total Applications',
        value: formatNumber(summary.total_applications || 0),
        change: 8,
        icon: <Users size={20} />,
        color: 'secondary'
      },
      {
        title: 'Total Spent',
        value: formatCurrency(performance.total_spent || 0),
        change: -5,
        icon: <DollarSign size={20} />,
        color: 'warning'
      },
      {
        title: 'Average ROI',
        value: formatPercentage(performance.average_roi || 0),
        change: 18,
        icon: <TrendingUp size={20} />,
        color: 'tertiary'
      }
    ];

    const performanceData = [
      { metric: 'Engagement', value: performance.engagement_rate || 0 },
      { metric: 'Conversion', value: performance.conversion_rate || 0 },
      { metric: 'Completion', value: performance.completion_rate || 0 },
      { metric: 'ROI', value: performance.average_roi || 0 },
      { metric: 'Budget Util', value: performance.budget_utilization || 0 }
    ];

    const statusData = Object.entries(charts.campaign_status || {}).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    return (
      <div className="brand-prof-dashboard">
        {/* Header */}
        <div className="brand-prof-dashboard-header">
          <div className="brand-prof-header-content">
            <div className="brand-prof-header-brand">
  {brandProfile?.logo ? (
    <img
      src={getBrandLogo(brandProfile.logo)}
      alt="Brand Logo"
      className="brand-prof-header-logo"
    />
  ) : (
    <div className="brand-prof-header-logo-placeholder">
      {(brandProfile?.company_name || "B")[0]}
    </div>
  )}

  <div className="brand-prof-header-text">
    <h1 className="brand-prof-page-title">
      {brandProfile?.company_name || "Brand"}
    </h1>
    <p className="brand-prof-page-subtitle">
      Analytics Dashboard
    </p>
  </div>
</div>

          </div>
          <div className="brand-prof-header-actions">
            <div className="brand-prof-period-selector">
              <select 
                value={dashboardPeriod}
                onChange={(e) => setDashboardPeriod(e.target.value)}
                className="brand-prof-period-select"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="1year">Last year</option>
              </select>
            </div>
            <button className="brand-prof-btn-icon" onClick={fetchDashboard} title="Refresh">
              <RefreshCw size={16} />
            </button>
            <button 
              className="brand-prof-btn-primary brand-prof-btn-small"
              onClick={() => handleExport('summary', 'json')}
              disabled={exportLoading}
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="brand-prof-stats-grid">
          {statsData.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="brand-prof-charts-grid">
          <ChartCard title="Performance Metrics">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="metric" stroke="#64748b" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar 
                  name="Performance" 
                  dataKey="value" 
                  stroke={CHART_COLORS.primary} 
                  fill={CHART_COLORS.primary} 
                  fillOpacity={0.6} 
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Campaign Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(CHART_COLORS)[index % 6]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Recent Activity & Performance */}
        <div className="brand-prof-content-grid">
          <ChartCard title="Recent Activity" className="brand-prof-activity-card">
            <div className="brand-prof-activity-list">
              {recentActivity.payments?.slice(0, 5).map((payment, index) => (
                <div key={index} className="brand-prof-activity-item">
                  <div className="brand-prof-activity-icon">
                    {payment.status === 'completed' ? (
                      <CheckCircle size={16} color={CHART_COLORS.secondary} />
                    ) : payment.status === 'pending' ? (
                      <AlertCircle size={16} color={CHART_COLORS.warning} />
                    ) : (
                      <XCircle size={16} color={CHART_COLORS.danger} />
                    )}
                  </div>
                  <div className="brand-prof-activity-content">
                    <div className="brand-prof-activity-title">Payment to {payment.influencer_name}</div>
                    <div className="brand-prof-activity-details">
                      <span className="brand-prof-amount">{formatCurrency(payment.amount)}</span>
                      <span className="brand-prof-campaign">{payment.campaign_title}</span>
                      <span className="brand-prof-time">{formatDate(payment.created_at)}</span>
                    </div>
                  </div>
                  <StatusBadge status={payment.status} />
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Performance Metrics" className="brand-prof-metrics-card">
            <div className="brand-prof-metrics-grid-small">
              {[
                { label: 'Engagement Rate', value: performance.engagement_rate || 0 },
                { label: 'Conversion Rate', value: performance.conversion_rate || 0 },
                { label: 'Budget Utilization', value: performance.budget_utilization || 0 },
                { label: 'Avg Cost per App', value: performance.avg_cost_per_application || 0, isCurrency: true }
              ].map((metric, index) => (
                <div key={index} className="brand-prof-metric-item">
                  <div className="brand-prof-metric-label">{metric.label}</div>
                  <div className="brand-prof-metric-value">
                    {metric.isCurrency ? formatCurrency(metric.value) : formatPercentage(metric.value)}
                  </div>
                  <div className="brand-prof-metric-progress">
                    <div 
                      className="brand-prof-progress-bar"
                      style={{ 
                        width: `${Math.min(metric.value, 100)}%`,
                        backgroundColor: metric.value >= 70 ? CHART_COLORS.secondary : 
                                       metric.value >= 40 ? CHART_COLORS.warning : 
                                       CHART_COLORS.danger
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Spending Chart */}
        <ChartCard title="Monthly Spending Trends" expandable={true}>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={charts.monthly_spending || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
              <Legend />
              <Bar dataKey="amount" fill={CHART_COLORS.primary} name="Monthly Spending" />
              <Line type="monotone" dataKey="amount" stroke={CHART_COLORS.secondary} name="Trend" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    );
  };

  // Campaigns Tab Component
  const CampaignsTab = () => {
    if (!campaignsData) return null;

    return (
      <div className="brand-prof-analytics-section">
        <div className="brand-prof-section-header">
          <div className="brand-prof-header-content">
            <h1 className="brand-prof-page-title">Campaign Analytics</h1>
            <p className="brand-prof-page-subtitle">Detailed performance analysis of your campaigns</p>
          </div>
          <div className="brand-prof-header-actions">
            <button 
              className="brand-prof-btn-primary"
              onClick={() => handleExport('campaigns', 'csv')}
              disabled={exportLoading}
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="brand-prof-filter-section">
          <div className="brand-prof-filter-grid">
            <div className="brand-prof-filter-group">
              <label><Filter size={14} /> Status</label>
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="brand-prof-filter-input"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="brand-prof-filter-group">
              <label><Calendar size={14} /> Date Range</label>
              <div className="brand-prof-date-range">
                <DatePicker
                  selected={filters.startDate}
                  onChange={(date) => setFilters({...filters, startDate: date})}
                  placeholderText="Start Date"
                  className="brand-prof-date-input"
                />
                <DatePicker
                  selected={filters.endDate}
                  onChange={(date) => setFilters({...filters, endDate: date})}
                  placeholderText="End Date"
                  className="brand-prof-date-input"
                />
              </div>
            </div>

            <div className="brand-prof-filter-group">
              <label><Hash size={14} /> Category</label>
              <input 
                type="text"
                placeholder="Filter by category"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="brand-prof-filter-input"
              />
            </div>

            <button 
              className="brand-prof-btn-secondary"
              onClick={() => setFilters({
                status: '',
                category: '',
                startDate: null,
                endDate: null,
                minAmount: '',
                maxAmount: '',
                influencerId: '',
                campaignId: ''
              })}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="brand-prof-stats-grid">
          <StatCard
            title="Total Campaigns"
            value={campaignsData.summary?.total_campaigns || 0}
            icon={<BarChart2 size={20} />}
          />
          <StatCard
            title="Total Budget"
            value={formatCurrency(campaignsData.summary?.total_budget || 0)}
            icon={<DollarIcon size={20} />}
          />
          <StatCard
            title="Total Applications"
            value={campaignsData.summary?.total_applications || 0}
            icon={<UsersIcon size={20} />}
          />
          <StatCard
            title="Average Performance"
            value={formatPercentage(campaignsData.summary?.average_performance || 0)}
            icon={<TargetIcon size={20} />}
          />
        </div>

        {/* Charts */}
        <div className="brand-prof-charts-grid">
          <ChartCard title="Campaign Performance by ROI">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignsData.campaigns?.slice(0, 8).map(c => ({
                name: c.title.substring(0, 15) + (c.title.length > 15 ? '...' : ''),
                roi: c.analytics?.roi || 0,
                engagement: c.analytics?.engagement_rate || 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="roi" fill={CHART_COLORS.primary} name="ROI %" />
                <Bar dataKey="engagement" fill={CHART_COLORS.secondary} name="Engagement %" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Budget vs Actual Spending">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignsData.campaigns?.slice(0, 6).map(c => ({
                name: c.title.substring(0, 12) + (c.title.length > 12 ? '...' : ''),
                budget: c.budget || 0,
                spent: c.payment_summary?.total_amount_paid || 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                <Legend />
                <Bar dataKey="budget" fill="#e2e8f0" name="Budget" />
                <Bar dataKey="spent" fill={CHART_COLORS.primary} name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Campaigns Table */}
        <ChartCard title="Campaign Details" className="brand-prof-table-card">
          <DataTable
            headers={['Campaign', 'Status', 'Budget', 'Applications', 'Performance', 'Actions']}
            rows={campaignsData.campaigns?.map(campaign => [
              <div className="brand-prof-campaign-info">
                <div className="brand-prof-campaign-name">{campaign.title}</div>
                <div className="brand-prof-campaign-category">{campaign.category || 'Uncategorized'}</div>
              </div>,
              <StatusBadge status={campaign.status} />,
              formatCurrency(campaign.budget),
              <div className="brand-prof-applications-count">
                {campaign.application_stats?.total || 0}
                <div className="brand-prof-applications-breakdown">
                  <span className="brand-prof-pending">{campaign.application_stats?.by_status?.pending || 0} pending</span>
                </div>
              </div>,
              <div className="brand-prof-performance-score">
                <div className="brand-prof-score-circle" style={{
                  borderColor: campaign.analytics?.performance_score > 80 ? CHART_COLORS.secondary : 
                              campaign.analytics?.performance_score > 60 ? CHART_COLORS.warning : 
                              CHART_COLORS.danger
                }}>
                  {campaign.analytics?.performance_score?.toFixed(0) || 0}
                </div>
              </div>,
              <div className="brand-prof-action-buttons">
                <button 
                  className="brand-prof-btn-icon-small"
                  onClick={() => fetchCampaignDetail(campaign._id)}
                  title="View Details"
                >
                  <Eye size={14} />
                </button>
                <button className="brand-prof-btn-icon-small" title="Edit">
                  <Edit size={14} />
                </button>
              </div>
            ])}
            emptyMessage="No campaigns found"
          />
        </ChartCard>
      </div>
    );
  };

  // Campaign Detail Tab Component
  const CampaignDetailTab = () => {
    if (!campaignDetail) {
      return (
        <div className="brand-prof-empty-state-full">
          <ShoppingBag size={48} />
          <h3>No Campaign Selected</h3>
          <p>Select a campaign from the campaigns tab to view detailed analytics</p>
          <button 
            className="brand-prof-btn-primary"
            onClick={() => setActiveTab('campaigns')}
          >
            Browse Campaigns
          </button>
        </div>
      );
    }

    const { campaign, analytics, applications, payments, influencer_insights } = campaignDetail;

    return (
      <div className="brand-prof-analytics-section">
        <div className="brand-prof-section-header">
          <div className="brand-prof-header-content">
            <button 
              className="brand-prof-btn-back"
              onClick={() => setActiveTab('campaigns')}
            >
              <ArrowLeft size={16} />
              Back to Campaigns
            </button>
            <h1 className="brand-prof-page-title">{campaign.title} - Analytics</h1>
          </div>
          <div className="brand-prof-header-actions">
            <button className="brand-prof-btn-primary" onClick={() => handleExport('campaigns', 'csv')}>
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>

        {/* Overview */}
        <div className="brand-prof-overview-grid">
          <div className="brand-prof-overview-card">
            <h3 className="brand-prof-card-title">Campaign Overview</h3>
            <div className="brand-prof-overview-content">
              <div className="brand-prof-overview-item">
                <span className="brand-prof-item-label">Category</span>
                <span className="brand-prof-item-value">{campaign.category || 'Uncategorized'}</span>
              </div>
              <div className="brand-prof-overview-item">
                <span className="brand-prof-item-label">Budget</span>
                <span className="brand-prof-item-value">{formatCurrency(campaign.budget)}</span>
              </div>
              <div className="brand-prof-overview-item">
                <span className="brand-prof-item-label">Created</span>
                <span className="brand-prof-item-value">{formatDate(campaign.created_at)}</span>
              </div>
              <div className="brand-prof-overview-item">
                <span className="brand-prof-item-label">Applications</span>
                <span className="brand-prof-item-value">{applications.total || 0}</span>
              </div>
              <div className="brand-prof-overview-item">
                <span className="brand-prof-item-label">Total Spent</span>
                <span className="brand-prof-item-value">{formatCurrency(payments.total_amount_paid || 0)}</span>
              </div>
              <div className="brand-prof-overview-item">
                <span className="brand-prof-item-label">Status</span>
                <StatusBadge status={campaign.status} />
              </div>
            </div>
          </div>

          <div className="brand-prof-metrics-card">
            <h3 className="brand-prof-card-title">Key Metrics</h3>
            <div className="brand-prof-metrics-grid-small">
              {[
                { label: 'Engagement Rate', value: analytics.engagement_rate || 0, icon: <Activity size={16} /> },
                { label: 'Conversion Rate', value: analytics.conversion_rate || 0, icon: <TrendingUp size={16} /> },
                { label: 'ROI', value: analytics.roi || 0, icon: <DollarSign size={16} /> },
                { label: 'Completion Rate', value: analytics.completion_rate || 0, icon: <CheckCircle size={16} /> },
              ].map((metric, index) => (
                <div key={index} className="brand-prof-metric-item">
                  <div className="brand-prof-metric-icon">{metric.icon}</div>
                  <div className="brand-prof-metric-content">
                    <div className="brand-prof-metric-label">{metric.label}</div>
                    <div className="brand-prof-metric-value">{formatPercentage(metric.value)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Applications & Payments */}
        <div className="brand-prof-cards-grid">
          <ChartCard title="Applications Summary">
            <div className="brand-prof-summary-content">
              <div className="brand-prof-summary-value">{applications.total || 0}</div>
              <div className="brand-prof-status-distribution">
                {Object.entries(applications.status_distribution || {}).map(([status, count]) => (
                  <div key={status} className="brand-prof-status-item">
                    <div className="brand-prof-status-label">
                      <div 
                        className="brand-prof-status-dot" 
                        style={{ backgroundColor: STATUS_COLORS[status] || CHART_COLORS.neutral }}
                      />
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                    <div className="brand-prof-status-count">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Payments Summary">
            <div className="brand-prof-summary-content">
              <div className="brand-prof-summary-value">{formatCurrency(payments.total_amount_paid || 0)}</div>
              <div className="brand-prof-payments-breakdown">
                <div className="brand-prof-payment-item">
                  <span className="brand-prof-payment-label">Total Paid</span>
                  <span className="brand-prof-payment-value">{formatCurrency(payments.total_amount_paid || 0)}</span>
                </div>
                <div className="brand-prof-payment-item">
                  <span className="brand-prof-payment-label">Pending</span>
                  <span className="brand-prof-payment-value">{formatCurrency(payments.pending_amount || 0)}</span>
                </div>
                <div className="brand-prof-payment-item">
                  <span className="brand-prof-payment-label">Completed</span>
                  <span className="brand-prof-payment-value">{payments.completed_count || 0}</span>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Performance Timeline */}
        <ChartCard title="Performance Timeline">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.timeline_data || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="engagement" 
                stroke={CHART_COLORS.primary} 
                fill={CHART_COLORS.primary} 
                fillOpacity={0.3} 
                name="Engagement" 
              />
              <Area 
                type="monotone" 
                dataKey="applications" 
                stroke={CHART_COLORS.secondary} 
                fill={CHART_COLORS.secondary} 
                fillOpacity={0.3} 
                name="Applications" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    );
  };

  // Payments Tab Component
  const PaymentsTab = () => {
    if (!paymentsData) return null;

    return (
      <div className="brand-prof-analytics-section">
        <div className="brand-prof-section-header">
          <div className="brand-prof-header-content">
            <h1 className="brand-prof-page-title">Payment Analytics</h1>
            <p className="brand-prof-page-subtitle">Track and analyze all payments to influencers</p>
          </div>
          <div className="brand-prof-header-actions">
            <button 
              className="brand-prof-btn-primary"
              onClick={() => handleExport('payments', 'csv')}
              disabled={exportLoading}
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="brand-prof-filter-section">
          <div className="brand-prof-filter-grid">
            <div className="brand-prof-filter-group">
              <label><Filter size={14} /> Status</label>
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="brand-prof-filter-input"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="brand-prof-filter-group">
              <label><Calendar size={14} /> Date Range</label>
              <div className="brand-prof-date-range">
                <DatePicker
                  selected={filters.startDate}
                  onChange={(date) => setFilters({...filters, startDate: date})}
                  placeholderText="Start Date"
                  className="brand-prof-date-input"
                />
                <DatePicker
                  selected={filters.endDate}
                  onChange={(date) => setFilters({...filters, endDate: date})}
                  placeholderText="End Date"
                  className="brand-prof-date-input"
                />
              </div>
            </div>

            <div className="brand-prof-filter-group">
              <label><DollarSign size={14} /> Amount Range</label>
              <div className="brand-prof-amount-range">
                <input 
                  type="number" 
                  placeholder="Min"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                  className="brand-prof-filter-input"
                />
                <span className="brand-prof-range-separator">to</span>
                <input 
                  type="number" 
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                  className="brand-prof-filter-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="brand-prof-stats-grid">
          <StatCard
            title="Total Payments"
            value={paymentsData.summary?.total_payments || 0}
            icon={<CreditCard size={20} />}
          />
          <StatCard
            title="Total Amount"
            value={formatCurrency(paymentsData.summary?.total_amount || 0)}
            icon={<DollarSign size={20} />}
          />
          <StatCard
            title="Completed"
            value={paymentsData.summary?.completed_payments || 0}
            icon={<CheckCircle size={20} />}
          />
          <StatCard
            title="Success Rate"
            value={formatPercentage(paymentsData.summary?.completion_rate || 0)}
            icon={<Percent size={20} />}
          />
        </div>

        {/* Charts */}
        <div className="brand-prof-charts-grid">
          <ChartCard title="Payment Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(paymentsData.status_distribution || {}).map(([name, value]) => ({
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    value
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {Object.entries(paymentsData.status_distribution || {}).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(CHART_COLORS)[index % 6]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Payment Trends">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={paymentsData.trends?.daily_trends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                <Area 
                  type="monotone" 
                  dataKey="total_amount" 
                  stroke={CHART_COLORS.primary} 
                  fill={CHART_COLORS.primary} 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Payments Table */}
        <ChartCard title="Payment Details" className="brand-prof-table-card">
          <DataTable
            headers={['Transaction', 'Influencer', 'Campaign', 'Amount', 'Status', 'Date', 'Actions']}
            rows={paymentsData.payments?.map(payment => [
              <div className="brand-prof-transaction-id">
                {payment.payment_intent_id?.substring(0, 8)}...
              </div>,
              <div className="brand-prof-influencer-info">
                <div className="brand-prof-influencer-name">{payment.influencer_name}</div>
                <div className="brand-prof-influencer-email">{payment.influencer_email}</div>
              </div>,
              payment.campaign_title,
              formatCurrency(payment.amount),
              <StatusBadge status={payment.status} />,
              formatDate(payment.created_at),
              <div className="brand-prof-action-buttons">
                <button className="brand-prof-btn-icon-small" title="View Details">
                  <Eye size={14} />
                </button>
                <button className="brand-prof-btn-icon-small" title="Download Receipt">
                  <Download size={14} />
                </button>
              </div>
            ])}
            emptyMessage="No payments found"
          />
        </ChartCard>
      </div>
    );
  };

  // Applications Tab Component
  const ApplicationsTab = () => {
    if (!applicationsData) return null;

    return (
      <div className="brand-prof-analytics-section">
        <div className="brand-prof-section-header">
          <div className="brand-prof-header-content">
            <h1 className="brand-prof-page-title">Application Analytics</h1>
            <p className="brand-prof-page-subtitle">Track and manage influencer applications</p>
          </div>
          <div className="brand-prof-header-actions">
            <button 
              className="brand-prof-btn-primary"
              onClick={() => handleExport('applications', 'csv')}
              disabled={exportLoading}
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="brand-prof-filter-section">
          <div className="brand-prof-filter-grid">
            <div className="brand-prof-filter-group">
              <label><Filter size={14} /> Status</label>
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="brand-prof-filter-input"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="brand-prof-filter-group">
              <label><Search size={14} /> Campaign</label>
              <input 
                type="text"
                placeholder="Search by campaign ID"
                value={filters.campaignId}
                onChange={(e) => setFilters({...filters, campaignId: e.target.value})}
                className="brand-prof-filter-input"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="brand-prof-stats-grid">
          <StatCard
            title="Total Applications"
            value={applicationsData.summary?.total_applications || 0}
            icon={<FileText size={20} />}
          />
          <StatCard
            title="Approval Rate"
            value={formatPercentage(applicationsData.summary?.conversion_rates?.approval_rate || 0)}
            icon={<CheckCircle size={20} />}
          />
          <StatCard
            title="Completion Rate"
            value={formatPercentage(applicationsData.summary?.conversion_rates?.completion_rate || 0)}
            icon={<Target size={20} />}
          />
          <StatCard
            title="Payment Rate"
            value={formatPercentage(applicationsData.summary?.conversion_rates?.payment_rate || 0)}
            icon={<Percent size={20} />}
          />
        </div>

        {/* Status Distribution */}
        <ChartCard title="Application Status Distribution">
          <div className="brand-prof-status-bars">
            {Object.entries(applicationsData.status_distribution || {}).map(([status, count]) => {
              const percentage = (count / (applicationsData.summary?.total_applications || 1)) * 100;
              return (
                <div key={status} className="brand-prof-status-bar-item">
                  <div className="brand-prof-status-bar-label">
                    <div 
                      className="brand-prof-status-dot"
                      style={{ backgroundColor: STATUS_COLORS[status] || CHART_COLORS.neutral }}
                    />
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </div>
                  <div className="brand-prof-status-bar-container">
                    <div 
                      className="brand-prof-status-bar-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: STATUS_COLORS[status] || CHART_COLORS.neutral
                      }}
                    />
                  </div>
                  <div className="brand-prof-status-bar-count">{count} ({percentage.toFixed(1)}%)</div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        {/* Applications Table */}
        <ChartCard title="Application Details" className="brand-prof-table-card">
          <DataTable
            headers={['Influencer', 'Campaign', 'Match Score', 'Status', 'Amount', 'Applied', 'Actions']}
            rows={applicationsData.applications?.map(app => [
              <div className="brand-prof-influencer-info">
                <div className="brand-prof-influencer-name">{app.influencer_name}</div>
                <div className="brand-prof-influencer-followers">
                  <Users size={12} />
                  {formatNumber(app.influencer_followers || 0)} followers
                </div>
              </div>,
              <div className="brand-prof-campaign-info">
                <div className="brand-prof-campaign-name">{app.campaign_title}</div>
                <StatusBadge status={app.campaign_status} />
              </div>,
              <div className="brand-prof-match-score">
                <div className="brand-prof-score-circle" style={{
                  borderColor: app.match_score > 80 ? CHART_COLORS.secondary : 
                              app.match_score > 60 ? CHART_COLORS.warning : 
                              CHART_COLORS.danger
                }}>
                  {app.match_score?.toFixed(1)}%
                </div>
              </div>,
              <StatusBadge status={app.status} />,
              formatCurrency(app.proposed_amount),
              formatDate(app.applied_at),
              <div className="brand-prof-action-buttons">
                <button className="brand-prof-btn-icon-small" title="View Details">
                  <Eye size={14} />
                </button>
                <button className="brand-prof-btn-icon-small" title="Review">
                  <FileText size={14} />
                </button>
              </div>
            ])}
            emptyMessage="No applications found"
          />
        </ChartCard>
      </div>
    );
  };

  // Financial Tab Component
  const FinancialTab = () => {
    if (!financialData) return null;

    return (
      <div className="brand-prof-analytics-section">
        <div className="brand-prof-section-header">
          <div className="brand-prof-header-content">
            <h1 className="brand-prof-page-title">Financial Analytics</h1>
            <p className="brand-prof-page-subtitle">Comprehensive financial overview and ROI analysis</p>
          </div>
          <div className="brand-prof-header-actions">
            <div className="brand-prof-period-selector">
              <select 
                value={financialPeriod}
                onChange={(e) => setFinancialPeriod(e.target.value)}
                className="brand-prof-period-select"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <button 
              className="brand-prof-btn-primary"
              onClick={() => handleExport('financial', 'json')}
              disabled={exportLoading}
            >
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="brand-prof-overview-grid">
          <div className="brand-prof-financial-card">
            <h3 className="brand-prof-card-title">Financial Overview</h3>
            <div className="brand-prof-financial-metrics">
              {[
                { label: 'Total Budget', value: formatCurrency(financialData.summary?.total_budget) },
                { label: 'Total Spent', value: formatCurrency(financialData.summary?.total_spent) },
                { label: 'Remaining Budget', value: formatCurrency(financialData.summary?.remaining_budget), className: 'brand-prof-positive' },
                { label: 'Pending Payments', value: formatCurrency(financialData.summary?.pending_payments), className: 'brand-prof-warning' },
                { label: 'Budget Utilization', value: formatPercentage(financialData.summary?.budget_utilization) },
                { label: 'Average ROI', value: formatPercentage(financialData.summary?.average_roi), className: 'brand-prof-positive' }
              ].map((metric, index) => (
                <div key={index} className="brand-prof-financial-metric">
                  <span className="brand-prof-metric-label">{metric.label}</span>
                  <span className={`brand-prof-metric-value ${metric.className || ''}`}>
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="brand-prof-metrics-card">
            <h3 className="brand-prof-card-title">Key Performance Indicators</h3>
            <div className="brand-prof-metrics-grid-small">
              {[
                { label: 'ROI Performance', value: financialData.summary?.average_roi || 0, change: 12 },
                { label: 'Budget Efficiency', value: financialData.summary?.budget_utilization || 0, change: 5 },
                { label: 'Cost per Application', value: 150, change: -5, isCurrency: true },
                { label: 'Growth Rate', value: 15, change: 15 }
              ].map((metric, index) => (
                <div key={index} className="brand-prof-metric-item">
                  <div className="brand-prof-metric-label">{metric.label}</div>
                  <div className="brand-prof-metric-value">
                    {metric.isCurrency ? formatCurrency(metric.value) : formatPercentage(metric.value)}
                  </div>
                  <div className={`brand-prof-metric-change ${metric.change >= 0 ? 'brand-prof-positive' : 'brand-prof-negative'}`}>
                    {metric.change >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    {Math.abs(metric.change)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="brand-prof-charts-grid">
          <ChartCard title="Monthly Spending Trends">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData.period_analysis?.data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                <Legend />
                <Bar dataKey="amount" fill={CHART_COLORS.primary} name="Total Amount" />
                <Bar dataKey="avg_amount_per_campaign" fill={CHART_COLORS.secondary} name="Avg per Campaign" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Spending by Category">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={financialData.category_analysis || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="amount"
                >
                  {financialData.category_analysis?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(CHART_COLORS)[index % 6]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    );
  };

  // Influencer Performance Tab Component
  const InfluencerPerformanceTab = () => {
    if (!influencerPerformance) return null;

    return (
      <div className="brand-prof-analytics-section">
        <div className="brand-prof-section-header">
          <div className="brand-prof-header-content">
            <h1 className="brand-prof-page-title">Influencer Performance</h1>
            <p className="brand-prof-page-subtitle">Track influencer performance and engagement metrics</p>
          </div>
          <div className="brand-prof-header-actions">
            <button 
              className="brand-prof-btn-primary"
              onClick={() => handleExport('influencer-performance', 'csv')}
              disabled={exportLoading}
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="brand-prof-filter-section">
          <div className="brand-prof-filter-grid">
            <div className="brand-prof-filter-group">
              <label><Search size={14} /> Search Influencers</label>
              <input 
                type="text"
                placeholder="Search by name or username"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="brand-prof-filter-input"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="brand-prof-stats-grid">
          <StatCard
            title="Total Influencers"
            value={influencerPerformance.total_influencers || 0}
            icon={<Users size={20} />}
          />
          <StatCard
            title="Total Completed"
            value={influencerPerformance.influencer_performance?.reduce((sum, inf) => 
              sum + (inf.metrics.completed_campaigns || 0), 0) || 0}
            icon={<CheckCircle size={20} />}
          />
          <StatCard
            title="Total Earnings"
            value={formatCurrency(influencerPerformance.influencer_performance?.reduce((sum, inf) => 
              sum + (inf.metrics.total_earnings || 0), 0) || 0)}
            icon={<DollarSign size={20} />}
          />
          <StatCard
            title="Avg Completion Rate"
            value={formatPercentage(
              influencerPerformance.influencer_performance?.reduce((sum, inf) => 
                sum + (inf.metrics.completion_rate || 0), 0) / 
              (influencerPerformance.influencer_performance?.length || 1)
            )}
            icon={<Percent size={20} />}
          />
        </div>

        {/* Performance Charts */}
        <div className="brand-prof-charts-grid">
          <ChartCard title="Completion Rate Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={influencerPerformance.influencer_performance?.slice(0, 8).map(inf => ({
                name: inf.profile?.username?.substring(0, 10) || 'Influencer',
                completionRate: inf.metrics.completion_rate || 0,
                approvalRate: inf.metrics.approval_rate || 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completionRate" fill={CHART_COLORS.primary} name="Completion Rate %" />
                <Bar dataKey="approvalRate" fill={CHART_COLORS.secondary} name="Approval Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Earnings vs Applications">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="total_applications" name="Applications" />
                <YAxis type="number" dataKey="total_earnings" name="Earnings" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'total_earnings' ? formatCurrency(value) : value,
                    name === 'total_earnings' ? 'Earnings' : 'Applications'
                  ]}
                />
                <Scatter 
                  name="Influencers" 
                  data={influencerPerformance.influencer_performance?.map(inf => ({
                    total_applications: inf.metrics.total_applications,
                    total_earnings: inf.metrics.total_earnings,
                    name: inf.profile?.username
                  }))} 
                  fill={CHART_COLORS.primary} 
                />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Influencers Table */}
        <ChartCard title="Influencer Performance Details" className="brand-prof-table-card">
          <DataTable
            headers={['Influencer', 'Applications', 'Completed', 'Completion Rate', 'Total Earnings', 'Actions']}
            rows={influencerPerformance.influencer_performance?.map(inf => [
              <div className="brand-prof-influencer-info">
                <div className="brand-prof-influencer-name">
                  {inf.profile?.profile?.full_name || inf.profile?.username || 'Unknown'}
                </div>
                <div className="brand-prof-influencer-followers">
                  <Users size={12} />
                  {formatNumber(inf.profile?.profile?.followers?.total || 0)} followers
                </div>
              </div>,
              inf.metrics.total_applications || 0,
              inf.metrics.completed_campaigns || 0,
              <div className="brand-prof-completion-rate">
                <div className="brand-prof-progress-bar">
                  <div 
                    className="brand-prof-progress-fill"
                    style={{ width: `${inf.metrics.completion_rate || 0}%` }}
                  />
                </div>
                <span className="brand-prof-percentage">{formatPercentage(inf.metrics.completion_rate)}</span>
              </div>,
              formatCurrency(inf.metrics.total_earnings || 0),
              <div className="brand-prof-action-buttons">
                <button className="brand-prof-btn-icon-small" title="View Details">
                  <Eye size={14} />
                </button>
                <button className="brand-prof-btn-icon-small" title="Message">
                  <MessageSquare size={14} />
                </button>
              </div>
            ])}
            emptyMessage="No influencers found"
          />
        </ChartCard>
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="brand-prof-analytics-loading">
        <div className="brand-prof-loading-spinner"></div>
        <p>Loading advanced analytics...</p>
      </div>
    );
  }

  return (
    <div className="brand-prof-analytics-container">
      {/* Sidebar Navigation */}
      <div className="brand-prof-analytics-sidebar">
        <div className="brand-prof-sidebar-header">
          <h2 className="brand-prof-sidebar-title">Analytics</h2>
          <p className="brand-prof-sidebar-subtitle">Brand Performance Dashboard</p>
        </div>
        
        <nav className="brand-prof-sidebar-nav">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
            { id: 'campaigns', label: 'Campaigns', icon: <ShoppingBag size={18} /> },
            { id: 'payments', label: 'Payments', icon: <CreditCard size={18} /> },
            { id: 'applications', label: 'Applications', icon: <FileText size={18} /> },
            { id: 'financial', label: 'Financial', icon: <DollarSign size={18} /> },
            { id: 'influencer', label: 'Influencers', icon: <Users size={18} /> },
          ].map(tab => (
            <button
              key={tab.id}
              className={`brand-prof-nav-item ${activeTab === tab.id ? 'brand-prof-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="brand-prof-sidebar-footer">
          <div className="brand-prof-quick-stats">
            <div className="brand-prof-quick-stat">
              <div className="brand-prof-stat-label">Active Campaigns</div>
              <div className="brand-prof-stat-value">
                {dashboardData?.campaigns_summary?.campaigns_by_status?.active || 0}
              </div>
            </div>
            <div className="brand-prof-quick-stat">
              <div className="brand-prof-stat-label">Pending Payments</div>
              <div className="brand-prof-stat-value">
                {dashboardData?.payment_summary?.pending_payments || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="brand-prof-analytics-main">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'campaigns' && <CampaignsTab />}
        {activeTab === 'campaign-detail' && <CampaignDetailTab />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'applications' && <ApplicationsTab />}
        {activeTab === 'financial' && <FinancialTab />}
        {activeTab === 'influencer' && <InfluencerPerformanceTab />}
      </main>
    </div>
  );
};

export default BrandAnalyticsProfessional;