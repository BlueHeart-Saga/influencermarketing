// frontend/src/components/admin/payments/AdminPaymentsDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import {
  DollarSign, CreditCard, TrendingUp, Users, Download, Filter,
  CheckCircle, XCircle, Clock, AlertCircle, Search, Plus,
  RefreshCw, ChevronRight, Eye, MoreVertical, FileText,
  BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Calendar, User, Briefcase, Award, TrendingDown, TrendingUp as TrendingUpIcon,
  ExternalLink, Loader2, AlertTriangle, CheckSquare, Square
} from 'lucide-react';
import '../../style/AdminPaymentsDashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Constants
const STATUS_COLORS = {
  pending_approval: '#FFB020',
  approved: '#14B8A6',
  processing: '#0EA5E9',
  completed: '#10B981',
  failed: '#EF4444',
  cancelled: '#6B7280',
  on_hold: '#F59E0B',
  refunded: '#8B5CF6',
  draft: '#D1D5DB',
  pending: '#F59E0B',
  initiated: '#3B82F6',
  processed: '#10B981',
  paid: '#059669',
  rejected: '#DC2626'
};

const PAYMENT_METHODS = [
  { value: 'razorpay', label: 'Razorpay', icon: '💳' },
  { value: 'stripe', label: 'Stripe', icon: '💠' },
  { value: 'paypal', label: 'PayPal', icon: '🔵' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'upi', label: 'UPI', icon: '📱' },
  { value: 'manual_transfer', label: 'Manual Transfer', icon: '✍️' },
  { value: 'cash', label: 'Cash', icon: '💵' }
];

const PAYOUT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'stripe_connect', label: 'Stripe Connect', icon: '💠' },
  { value: 'razorpay_x', label: 'RazorpayX', icon: '💳' },
  { value: 'paypal', label: 'PayPal', icon: '🔵' },
  { value: 'upi', label: 'UPI', icon: '📱' },
  { value: 'manual', label: 'Manual', icon: '✍️' }
];

const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD', 'NZD', 'CHF',
  'JPY', 'KRW', 'HKD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF',
  'THB', 'PHP', 'MYR', 'IDR', 'ZAR', 'BRL', 'MXN'
];

const AdminPaymentsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [topInfluencers, setTopInfluencers] = useState([]);
  const [topBrands, setTopBrands] = useState([]);
  const [completedApplications, setCompletedApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [earnings, setEarnings] = useState([]);

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState({
    status: '',
    payment_method: '',
    payout_method: '',
    currency: '',
    brand_id: '',
    influencer_id: '',
    campaign_id: ''
  });
  const [selectedItems, setSelectedItems] = useState([]);

  // Modal States
  const [showCreatePayment, setShowCreatePayment] = useState(false);
  const [showCreatePayout, setShowCreatePayout] = useState(false);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentFlowModal, setShowPaymentFlowModal] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [paymentFlowData, setPaymentFlowData] = useState(null);

  // Form States
  const [newPayment, setNewPayment] = useState({
    campaign_id: '',
    influencer_id: '',
    amount: '',
    currency: 'USD',
    payment_method: 'razorpay',
    notes: '',
    scheduled_payout_date: '',
    auto_approve: false
  });

  const [newPayout, setNewPayout] = useState({
    payment_ids: [],
    payout_method: 'bank_transfer',
    payout_details: {
      bank_details: {
        account_holder_name: '',
        account_number: '',
        ifsc_code: '',
        bank_name: '',
        branch: ''
      },
      upi_details: {
        upi_id: '',
        provider: ''
      },
      paypal_details: {
        email: '',
        account_name: ''
      },
      stripe_connect_id: '',
      razorpay_contact_id: ''
    },
    scheduled_date: '',
    notes: ''
  });

  // Error States
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Search & Filter states
  const [campaigns, setCampaigns] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [brands, setBrands] = useState([]);

  // Pagination
  const [pagination, setPagination] = useState({
    payments: { skip: 0, limit: 50, total: 0 },
    applications: { skip: 0, limit: 50, total: 0 },
    payouts: { skip: 0, limit: 50, total: 0 },
    earnings: { skip: 0, limit: 50, total: 0 }
  });

  // Auth helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // Format helpers
  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount && amount !== 0) return 'N/A';
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
      }).format(amount);
    } catch {
      return `${currency} ${parseFloat(amount).toFixed(2)}`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Status badge component
  const StatusBadge = ({ status, type = 'payment' }) => {
    const color = STATUS_COLORS[status] || '#6B7280';
    return (
      <span
        className="status-badge"
        style={{
          backgroundColor: `${color}15`,
          color: color,
          border: `1px solid ${color}30`
        }}
      >
        <div className="status-dot" style={{ backgroundColor: color }} />
        {formatStatus(status)}
      </span>
    );
  };

  // Fetch reference data (campaigns, influencers, brands)
  const fetchReferenceData = async () => {
    try {
      const headers = getAuthHeaders();

      // Fetch campaigns
      const campaignsRes = await axios.get(`${API_BASE_URL}/campaigns?limit=100`, headers);
      setCampaigns(campaignsRes.data?.campaigns || []);

      // Fetch influencers
      const influencersRes = await axios.get(`${API_BASE_URL}/users?role=influencer&limit=100`, headers);
      setInfluencers(influencersRes.data?.users || []);

      // Fetch brands
      const brandsRes = await axios.get(`${API_BASE_URL}/users?role=brand&limit=100`, headers);
      setBrands(brandsRes.data?.users || []);

    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  };

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = getAuthHeaders();

      // Fetch dashboard stats
      const [statsRes, analyticsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/payments/dashboard/stats`, headers),
        axios.get(`${API_BASE_URL}/admin/payments/analytics/revenue?timeframe=30d`, headers)
      ]);

      setDashboardStats(statsRes.data);
      setAnalytics(analyticsRes.data);

      // Fetch completed applications
      const applicationsRes = await axios.get(
        `${API_BASE_URL}/admin/payments/applications/completed?skip=${pagination.applications.skip}&limit=${pagination.applications.limit}`,
        headers
      );
      setCompletedApplications(applicationsRes.data || []);

      // Fetch tab-specific data
      switch (activeTab) {
        case 'payments':
          const paymentsRes = await axios.get(
            `${API_BASE_URL}/admin/payments/payments?skip=${pagination.payments.skip}&limit=${pagination.payments.limit}`,
            headers
          );
          setPayments(paymentsRes.data?.payments || []);
          setPagination(prev => ({
            ...prev,
            payments: {
              ...prev.payments,
              total: paymentsRes.data?.total || 0
            }
          }));
          break;

        case 'payouts':
          const payoutsRes = await axios.get(
            `${API_BASE_URL}/admin/payments/payouts?skip=${pagination.payouts.skip}&limit=${pagination.payouts.limit}`,
            headers
          );
          setPayouts(payoutsRes.data?.payouts || []);
          setPagination(prev => ({
            ...prev,
            payouts: {
              ...prev.payouts,
              total: payoutsRes.data?.total || 0
            }
          }));
          break;

        case 'withdrawals':
          const withdrawalsRes = await axios.get(
            `${API_BASE_URL}/admin/payments/withdrawals?skip=${pagination.payouts.skip}&limit=${pagination.payouts.limit}`,
            headers
          );
          setWithdrawals(withdrawalsRes.data?.withdrawals || []);
          break;

        case 'earnings':
          const earningsRes = await axios.get(
            `${API_BASE_URL}/admin/payments/earnings?skip=${pagination.earnings.skip}&limit=${pagination.earnings.limit}`,
            headers
          );
          setEarnings(earningsRes.data?.earnings || []);
          setPagination(prev => ({
            ...prev,
            earnings: {
              ...prev.earnings,
              total: earningsRes.data?.total || 0
            }
          }));
          break;

        case 'analytics':
          const [influencersRes, brandsRes, methodsRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/admin/payments/analytics/top-influencers?limit=10`, headers),
            axios.get(`${API_BASE_URL}/admin/payments/analytics/top-brands?limit=10`, headers),
            axios.get(`${API_BASE_URL}/admin/payments/analytics/payment-methods?timeframe=30d`, headers)
          ]);
          setTopInfluencers(influencersRes.data?.top_influencers || []);
          setTopBrands(brandsRes.data?.top_brands || []);
          // Set payment method data from API
          if (methodsRes.data?.payment_methods) {
            setPaymentMethodData(methodsRes.data.payment_methods);
          }
          break;
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.detail || 'Failed to fetch data');
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, pagination]);

  useEffect(() => {
    fetchAllData();
    fetchReferenceData();
  }, [activeTab]);

  useEffect(() => {
    // Reset pagination when tab changes
    setPagination({
      payments: { skip: 0, limit: 50, total: 0 },
      applications: { skip: 0, limit: 50, total: 0 },
      payouts: { skip: 0, limit: 50, total: 0 },
      earnings: { skip: 0, limit: 50, total: 0 }
    });
  }, [activeTab]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  // Action handlers
  const handleCreatePayment = async () => {
    try {
      setActionLoading(true);
      setError(null);

      // Validate required fields
      if (!newPayment.campaign_id || !newPayment.influencer_id || !newPayment.amount) {
        setError('Please fill in all required fields');
        return;
      }

      const payload = {
        ...newPayment,
        amount: parseFloat(newPayment.amount)
      };

      await axios.post(
        `${API_BASE_URL}/admin/payments/payments/create`,
        payload,
        getAuthHeaders()
      );

      setShowCreatePayment(false);
      setNewPayment({
        campaign_id: '',
        influencer_id: '',
        amount: '',
        currency: 'USD',
        payment_method: 'razorpay',
        notes: '',
        scheduled_payout_date: '',
        auto_approve: false
      });
      setError(null);
      fetchAllData();
    } catch (error) {
      console.error('Error creating payment:', error);
      setError(error.response?.data?.detail || 'Failed to create payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId) => {
    try {
      setActionLoading(true);
      await axios.put(
        `${API_BASE_URL}/admin/payments/payments/${paymentId}/approve`,
        {},
        getAuthHeaders()
      );
      fetchAllData();
    } catch (error) {
      console.error('Error approving payment:', error);
      setError(error.response?.data?.detail || 'Failed to approve payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async (paymentId) => {
    try {
      const transactionId = prompt('Enter transaction ID:');
      if (!transactionId) return;

      setActionLoading(true);
      await axios.put(
        `${API_BASE_URL}/admin/payments/payments/${paymentId}/mark-paid`,
        {},
        {
          ...getAuthHeaders(),
          params: { transaction_id: transactionId }
        }
      );
      fetchAllData();
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      setError(error.response?.data?.detail || 'Failed to mark payment as paid');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBatchCreatePayments = async (applicationIds) => {
    try {
      setActionLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_BASE_URL}/admin/payments/applications/batch-create-payments`,
        { application_ids: applicationIds },
        getAuthHeaders()
      );

      setSelectedItems([]);
      fetchAllData();

      // Show success message
      if (response.data?.summary) {
        const { successful, failed, already_processed } = response.data.summary;
        alert(`Batch processing complete:\n\n• Successful: ${successful}\n• Failed: ${failed}\n• Already Processed: ${already_processed}`);
      }
    } catch (error) {
      console.error('Error batch creating payments:', error);
      setError(error.response?.data?.detail || 'Failed to batch create payments');
    } finally {
      setActionLoading(false);
      setShowBatchActions(false);
    }
  };

  const handleGetPaymentFlow = async (campaignId, influencerId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/payments/payments/flow/${campaignId}/${influencerId}`,
        getAuthHeaders()
      );
      setPaymentFlowData(response.data?.flow);
      setShowPaymentFlowModal(true);
    } catch (error) {
      console.error('Error fetching payment flow:', error);
      setError(error.response?.data?.detail || 'Failed to fetch payment flow');
    }
  };

  const handleExportData = async (type, format) => {
    try {
      let url = '';
      const params = new URLSearchParams();

      // Add filters to export
      if (filters.status) params.append('status', filters.status);
      if (filters.payment_method) params.append('payment_method', filters.payment_method);
      if (filters.currency) params.append('currency', filters.currency);
      if (dateRange.start) params.append('date_from', dateRange.start);
      if (dateRange.end) params.append('date_to', dateRange.end);

      switch (type) {
        case 'payments':
          url = `${API_BASE_URL}/admin/payments/export/payments?${params.toString()}&format=${format}`;
          break;
        case 'payouts':
          url = `${API_BASE_URL}/admin/payments/export/payouts?${params.toString()}&format=${format}`;
          break;
        default:
          url = `${API_BASE_URL}/admin/payments/reports/generate/payment-summary?${params.toString()}&format=${format}`;
          break;
      }

      const response = await axios.get(url, {
        ...getAuthHeaders(),
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${type}_export_${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error exporting data:', error);
      setError(error.response?.data?.detail || 'Failed to export data');
    }
  };

  // Filter functions
  const filterItems = (items) => {
    return items.filter(item => {
      // Search filter
      if (searchQuery) {
        const searchableFields = [
          item.payment_reference,
          item.payout_reference,
          item.influencer_name,
          item.brand_name,
          item.campaign_title,
          item.amount?.toString(),
          item.notes
        ].filter(Boolean);

        const matchesSearch = searchableFields.some(field =>
          field.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status && item.status !== filters.status) return false;

      // Payment method filter
      if (filters.payment_method && item.payment_method !== filters.payment_method) return false;

      // Payout method filter
      if (filters.payout_method && item.payout_method !== filters.payout_method) return false;

      // Currency filter
      if (filters.currency && item.currency !== filters.currency) return false;

      // Brand filter
      if (filters.brand_id && item.brand_id !== filters.brand_id) return false;

      // Influencer filter
      if (filters.influencer_id && item.influencer_id !== filters.influencer_id) return false;

      // Campaign filter
      if (filters.campaign_id && item.campaign_id !== filters.campaign_id) return false;

      return true;
    });
  };

  // Calculate stats for charts
  const paymentStatusData = dashboardStats ? [
    { name: 'Completed', value: dashboardStats.completed_payments || 0, color: '#10B981' },
    { name: 'Approved', value: dashboardStats.pending_payments || 0, color: '#14B8A6' },
    { name: 'Processing', value: dashboardStats.processing_payments || 0, color: '#0EA5E9' },
    { name: 'Pending Approval', value: dashboardStats.waiting_payments || 0, color: '#F59E0B' },
    { name: 'Failed', value: dashboardStats.failed_payments || 0, color: '#EF4444' }
  ] : [];

  const [paymentMethodData, setPaymentMethodData] = useState([
    { name: 'Razorpay', value: 45, color: '#6366F1' },
    { name: 'Stripe', value: 25, color: '#10B981' },
    { name: 'Bank Transfer', value: 20, color: '#F59E0B' },
    { name: 'UPI', value: 10, color: '#EF4444' }
  ]);

  // Render components
  const renderStatCard = (icon, title, value, subValue, trend, color) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>
        {icon}
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
        <div className="stat-trend">
          {trend && (
            <span className={`trend-indicator ${trend > 0 ? 'up' : 'down'}`}>
              {trend > 0 ? <TrendingUpIcon size={14} /> : <TrendingDown size={14} />}
              {Math.abs(trend)}%
            </span>
          )}
          {subValue && <span className="stat-subvalue">{subValue}</span>}
        </div>
      </div>
    </div>
  );

  // Error display component
  const ErrorAlert = ({ message, onClose }) => (
    <div className="error-alert">
      <AlertTriangle size={20} />
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="error-close">
          ×
        </button>
      )}
    </div>
  );

  // Loading component
  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <Loader2 className="animate-spin" size={24} />
      <span>Loading...</span>
    </div>
  );

  const renderOverview = () => (
    <div className="overview-container">
      {/* Stats Grid */}
      <div className="stats-grid">
        {renderStatCard(
          <DollarSign size={24} />,
          'Total Revenue',
          formatCurrency(dashboardStats?.total_brand_payments || 0),
          `${dashboardStats?.completed_payments || 0} payments`,
          12.5,
          '#6366F1'
        )}

        {renderStatCard(
          <CreditCard size={24} />,
          'Platform Fees',
          formatCurrency(dashboardStats?.total_platform_fees || 0),
          `${dashboardStats?.total_applications || 0} applications`,
          8.2,
          '#10B981'
        )}

        {renderStatCard(
          <Users size={24} />,
          'Pending Actions',
          dashboardStats?.waiting_payments || 0,
          'Require approval',
          null,
          '#F59E0B'
        )}

        {renderStatCard(
          <TrendingUp size={24} />,
          'Net Profit',
          formatCurrency((dashboardStats?.total_platform_fees || 0) - (dashboardStats?.total_influencer_payouts || 0)),
          'This month',
          15.3,
          '#8B5CF6'
        )}
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Revenue Trends</h3>
            <select className="time-selector" defaultValue="30d">
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
              <option value="1y">1 Year</option>
            </select>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics?.revenue_analytics || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="_id" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                <Area type="monotone" dataKey="total_revenue" stroke="#6366F1" fill="#6366F1" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Payment Status Distribution</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activities */}
      <div className="actions-row">
        <div className="quick-actions-card">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => setShowCreatePayment(true)}>
              <Plus size={20} />
              <span>Create Payment</span>
            </button>
            <button
              className="action-btn"
              onClick={() => completedApplications.length > 0 && setShowBatchActions(true)}
              disabled={completedApplications.length === 0}
            >
              <FileText size={20} />
              <span>Batch Process ({completedApplications.length})</span>
            </button>
            <button className="action-btn" onClick={() => setShowExportModal(true)}>
              <Download size={20} />
              <span>Export Reports</span>
            </button>
            <button className="action-btn" onClick={() => setActiveTab('applications')}>
              <CheckCircle size={20} />
              <span>Review Applications</span>
            </button>
          </div>
        </div>

        <div className="recent-activities-card">
          <h3>Recent Payments</h3>
          <div className="activities-list">
            {payments.slice(0, 5).map(payment => (
              <div key={payment._id} className="activity-item">
                <div className="activity-icon">
                  <DollarSign size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">
                    Payment {payment.payment_reference}
                  </p>
                  <p className="activity-details">
                    {formatCurrency(payment.amount, payment.currency)} • {payment.influencer_name}
                  </p>
                </div>
                <div className="activity-time">
                  {formatDate(payment.created_at)}
                </div>
                <button
                  className="activity-action"
                  onClick={() => {
                    setDetailData(payment);
                    setShowDetailModal(true);
                  }}
                >
                  <Eye size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Items */}
      <div className="pending-section">
        <h3>Pending Items Requiring Attention</h3>
        <div className="pending-grid">
          <div className="pending-card warning">
            <div className="pending-header">
              <AlertCircle size={20} />
              <span>Pending Approval</span>
            </div>
            <p className="pending-count">{dashboardStats?.waiting_payments || 0}</p>
            <button
              className="pending-action"
              onClick={() => setActiveTab('payments')}
            >
              Review Payments <ChevronRight size={16} />
            </button>
          </div>

          <div className="pending-card info">
            <div className="pending-header">
              <Clock size={20} />
              <span>Approved Payments</span>
            </div>
            <p className="pending-count">{dashboardStats?.pending_payments || 0}</p>
            <button
              className="pending-action"
              onClick={() => setActiveTab('payments')}
            >
              Mark as Paid <ChevronRight size={16} />
            </button>
          </div>

          <div className="pending-card danger">
            <div className="pending-header">
              <XCircle size={20} />
              <span>Failed Payments</span>
            </div>
            <p className="pending-count">{dashboardStats?.failed_payments || 0}</p>
            <button
              className="pending-action"
              onClick={() => setActiveTab('payments')}
            >
              View Details <ChevronRight size={16} />
            </button>
          </div>

          <div className="pending-card success">
            <div className="pending-header">
              <Users size={20} />
              <span>Withdrawals Pending</span>
            </div>
            <p className="pending-count">{dashboardStats?.pending_withdrawals || 0}</p>
            <button
              className="pending-action"
              onClick={() => setActiveTab('withdrawals')}
            >
              Process <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApplications = () => (
    <div className="applications-container">
      <div className="section-header">
        <div className="header-content">
          <h2>Completed Applications</h2>
          <p>Applications ready for payment processing</p>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (selectedItems.length > 0) {
                handleBatchCreatePayments(selectedItems);
              } else {
                setShowBatchActions(true);
              }
            }}
            disabled={selectedItems.length === 0 && completedApplications.length === 0}
          >
            <Plus size={18} />
            {selectedItems.length > 0 ? `Create ${selectedItems.length} Payments` : 'Batch Create'}
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <div className="filters-row">
        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
        </select>

        <select
          className="filter-select"
          value={filters.currency}
          onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
        >
          <option value="">All Currencies</option>
          {CURRENCIES.map(currency => (
            <option key={currency} value={currency}>{currency}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.brand_id}
          onChange={(e) => setFilters({ ...filters, brand_id: e.target.value })}
        >
          <option value="">All Brands</option>
          {brands.map(brand => (
            <option key={brand._id} value={brand._id}>{brand.username}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.influencer_id}
          onChange={(e) => setFilters({ ...filters, influencer_id: e.target.value })}
        >
          <option value="">All Influencers</option>
          {influencers.map(influencer => (
            <option key={influencer._id} value={influencer._id}>{influencer.username}</option>
          ))}
        </select>

        <input
          type="date"
          className="date-input"
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
        />

        <input
          type="date"
          className="date-input"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
        />

        <button className="btn btn-secondary" onClick={() => {
          setFilters({ status: '', payment_method: '', payout_method: '', currency: '', brand_id: '', influencer_id: '', campaign_id: '' });
          setSearchQuery('');
          setDateRange({
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
          });
        }}>
          <Filter size={16} />
          Clear Filters
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th width="50">
                <input
                  type="checkbox"
                  checked={selectedItems.length === filterItems(completedApplications).length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(filterItems(completedApplications).map(item => item.application_id));
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                />
              </th>
              <th>Campaign</th>
              <th>Influencer</th>
              <th>Brand</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Completed At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filterItems(completedApplications).map(app => (
              <tr key={app.application_id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(app.application_id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, app.application_id]);
                      } else {
                        setSelectedItems(selectedItems.filter(id => id !== app.application_id));
                      }
                    }}
                  />
                </td>
                <td>
                  <div className="campaign-info">
                    <strong>{app.campaign_title}</strong>
                    <small>ID: {app.campaign_id}</small>
                  </div>
                </td>
                <td>
                  <div className="user-info">
                    <div className="avatar">{app.influencer_name?.[0] || 'I'}</div>
                    <div>
                      <strong>{app.influencer_name}</strong>
                      <small>ID: {app.influencer_id}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="user-info">
                    <div className="avatar brand">{app.brand_name?.[0] || 'B'}</div>
                    <div>
                      <strong>{app.brand_name}</strong>
                    </div>
                  </div>
                </td>
                <td>
                  <strong>{formatCurrency(app.payment_amount, app.payment_currency)}</strong>
                </td>
                <td>
                  {app.payment_created ? (
                    <StatusBadge status={app.payment_status} />
                  ) : (
                    <span className="status-badge pending">Awaiting Payment</span>
                  )}
                </td>
                <td>
                  {formatDate(app.application_completed_at || app.created_at)}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon"
                      onClick={() => {
                        setDetailData(app);
                        setShowDetailModal(true);
                      }}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleGetPaymentFlow(app.campaign_id, app.influencer_id)}
                      title="View Payment Flow"
                    >
                      <ExternalLink size={16} />
                    </button>
                    {!app.payment_created && (
                      <button
                        className="btn-icon success"
                        onClick={() => handleBatchCreatePayments([app.application_id])}
                        title="Create Payment"
                      >
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filterItems(completedApplications).length === 0 && !loading && (
        <div className="empty-state">
          <FileText size={48} />
          <h3>No completed applications found</h3>
          <p>Applications marked as completed will appear here for payment processing.</p>
        </div>
      )}

      {/* Pagination */}
      {completedApplications.length > 0 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={pagination.applications.skip === 0}
            onClick={() => setPagination(prev => ({
              ...prev,
              applications: { ...prev.applications, skip: Math.max(0, prev.applications.skip - prev.applications.limit) }
            }))}
          >
            Previous
          </button>
          <span className="pagination-info">
            Showing {pagination.applications.skip + 1} to {Math.min(pagination.applications.skip + pagination.applications.limit, pagination.applications.total)} of {pagination.applications.total}
          </span>
          <button
            className="pagination-btn"
            disabled={pagination.applications.skip + pagination.applications.limit >= pagination.applications.total}
            onClick={() => setPagination(prev => ({
              ...prev,
              applications: { ...prev.applications, skip: prev.applications.skip + prev.applications.limit }
            }))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  const renderPayments = () => (
    <div className="payments-container">
      <div className="section-header">
        <div className="header-content">
          <h2>Payments Management</h2>
          <p>Manage and process all payments</p>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreatePayment(true)}>
            <Plus size={18} />
            Create Payment
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handleExportData('payments', 'csv')}
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <div className="stats-cards">
        <div className="stat-mini">
          <h4>Pending Approval</h4>
          <p className="stat-value">{dashboardStats?.waiting_payments || 0}</p>
        </div>
        <div className="stat-mini">
          <h4>Approved</h4>
          <p className="stat-value">{dashboardStats?.pending_payments || 0}</p>
        </div>
        <div className="stat-mini">
          <h4>Processing</h4>
          <p className="stat-value">{dashboardStats?.processing_payments || 0}</p>
        </div>
        <div className="stat-mini">
          <h4>Completed</h4>
          <p className="stat-value">{dashboardStats?.completed_payments || 0}</p>
        </div>
      </div>

      <div className="filters-row">
        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>

        <select
          className="filter-select"
          value={filters.payment_method}
          onChange={(e) => setFilters({ ...filters, payment_method: e.target.value })}
        >
          <option value="">All Methods</option>
          {PAYMENT_METHODS.map(method => (
            <option key={method.value} value={method.value}>{method.label}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.currency}
          onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
        >
          <option value="">All Currencies</option>
          {CURRENCIES.map(currency => (
            <option key={currency} value={currency}>{currency}</option>
          ))}
        </select>

        <input
          type="date"
          className="date-input"
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
        />

        <input
          type="date"
          className="date-input"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
        />

        <button className="btn btn-secondary" onClick={() => {
          setFilters({ status: '', payment_method: '', payout_method: '', currency: '' });
          setSearchQuery('');
          setDateRange({
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
          });
        }}>
          <Filter size={16} />
          Clear Filters
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Influencer</th>
              <th>Campaign</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Method</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filterItems(payments).map(payment => (
              <tr key={payment._id}>
                <td>
                  <strong>{payment.payment_reference}</strong>
                  {payment.payout_id && (
                    <small className="payout-indicator">Payout Created</small>
                  )}
                </td>
                <td>
                  <div className="user-info">
                    <div className="avatar">{payment.influencer_name?.[0] || 'I'}</div>
                    <div>
                      <strong>{payment.influencer_name}</strong>
                      <small>{payment.influencer_email || `ID: ${payment.influencer_id}`}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <strong>{payment.campaign_title}</strong>
                  <small>ID: {payment.campaign_id}</small>
                </td>
                <td>
                  <strong>{formatCurrency(payment.amount, payment.currency)}</strong>
                </td>
                <td>
                  <StatusBadge status={payment.status} />
                </td>
                <td>
                  <span className="method-badge">
                    {PAYMENT_METHODS.find(m => m.value === payment.payment_method)?.icon}
                    {payment.payment_method?.replace('_', ' ')}
                  </span>
                </td>
                <td>{formatDate(payment.created_at)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon"
                      onClick={() => {
                        setDetailData(payment);
                        setShowDetailModal(true);
                      }}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>

                    {payment.status === 'pending_approval' && (
                      <button
                        className="btn-icon success"
                        onClick={() => handleApprovePayment(payment._id)}
                        title="Approve Payment"
                        disabled={actionLoading}
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}

                    {(payment.status === 'approved' || payment.status === 'processing') && (
                      <button
                        className="btn-icon primary"
                        onClick={() => handleMarkPaid(payment._id)}
                        title="Mark as Paid"
                        disabled={actionLoading}
                      >
                        <DollarSign size={16} />
                      </button>
                    )}

                    <button
                      className="btn-icon"
                      onClick={() => handleGetPaymentFlow(payment.campaign_id, payment.influencer_id)}
                      title="View Payment Flow"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filterItems(payments).length === 0 && !loading && (
        <div className="empty-state">
          <CreditCard size={48} />
          <h3>No payments found</h3>
          <p>Create a new payment or adjust your filters.</p>
        </div>
      )}

      {/* Pagination */}
      {payments.length > 0 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={pagination.payments.skip === 0}
            onClick={() => setPagination(prev => ({
              ...prev,
              payments: { ...prev.payments, skip: Math.max(0, prev.payments.skip - prev.payments.limit) }
            }))}
          >
            Previous
          </button>
          <span className="pagination-info">
            Showing {pagination.payments.skip + 1} to {Math.min(pagination.payments.skip + pagination.payments.limit, pagination.payments.total)} of {pagination.payments.total}
          </span>
          <button
            className="pagination-btn"
            disabled={pagination.payments.skip + pagination.payments.limit >= pagination.payments.total}
            onClick={() => setPagination(prev => ({
              ...prev,
              payments: { ...prev.payments, skip: prev.payments.skip + prev.payments.limit }
            }))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="analytics-container">
      <div className="section-header">
        <div className="header-content">
          <h2>Advanced Analytics</h2>
          <p>Detailed insights and performance metrics</p>
        </div>
        <div className="header-actions">
          <select
            className="time-selector"
            onChange={(e) => {
              // Refetch analytics with new timeframe
              // You can implement this if needed
            }}
            defaultValue="30d"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card large">
          <div className="card-header">
            <h3>Revenue Overview</h3>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#6366F1' }} />
                <span>Total Revenue</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#10B981' }} />
                <span>Completed Revenue</span>
              </div>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.revenue_analytics || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="_id" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                <Legend />
                <Line type="monotone" dataKey="total_revenue" stroke="#6366F1" strokeWidth={2} />
                <Line type="monotone" dataKey="completed_revenue" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>Top Influencers</h3>
          </div>
          <div className="top-list">
            {topInfluencers.map((influencer, index) => (
              <div key={influencer.influencer_id} className="top-item">
                <div className="item-rank">{index + 1}</div>
                <div className="item-info">
                  <strong>{influencer.name}</strong>
                  <small>{influencer.payment_count} payments</small>
                </div>
                <div className="item-value">
                  {formatCurrency(influencer.total_earnings, 'USD')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>Top Brands</h3>
          </div>
          <div className="top-list">
            {topBrands.map((brand, index) => (
              <div key={brand.brand_id} className="top-item">
                <div className="item-rank">{index + 1}</div>
                <div className="item-info">
                  <strong>{brand.name}</strong>
                  <small>{brand.payment_count} payments</small>
                </div>
                <div className="item-value">
                  {formatCurrency(brand.total_spent, 'USD')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>Payment Methods</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [formatCurrency(value, 'USD'), props.payload.name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  // Modals
  const renderCreatePaymentModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Create New Payment</h3>
          <button className="close-btn" onClick={() => setShowCreatePayment(false)}>×</button>
        </div>
        <div className="modal-body">
          {error && <ErrorAlert message={error} />}

          <div className="form-grid">
            <div className="form-group">
              <label>Campaign *</label>
              <select
                value={newPayment.campaign_id}
                onChange={(e) => setNewPayment({ ...newPayment, campaign_id: e.target.value })}
                required
              >
                <option value="">Select Campaign</option>
                {campaigns.map(campaign => (
                  <option key={campaign._id} value={campaign._id}>
                    {campaign.title} (ID: {campaign._id})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Influencer *</label>
              <select
                value={newPayment.influencer_id}
                onChange={(e) => setNewPayment({ ...newPayment, influencer_id: e.target.value })}
                required
              >
                <option value="">Select Influencer</option>
                {influencers.map(influencer => (
                  <option key={influencer._id} value={influencer._id}>
                    {influencer.username} (ID: {influencer._id})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Amount *</label>
              <input
                type="number"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Currency</label>
              <select
                value={newPayment.currency}
                onChange={(e) => setNewPayment({ ...newPayment, currency: e.target.value })}
              >
                {CURRENCIES.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <select
                value={newPayment.payment_method}
                onChange={(e) => setNewPayment({ ...newPayment, payment_method: e.target.value })}
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.icon} {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                value={newPayment.notes}
                onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                placeholder="Add payment notes..."
                rows="3"
              />
            </div>

            <div className="form-group full-width">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newPayment.auto_approve}
                  onChange={(e) => setNewPayment({ ...newPayment, auto_approve: e.target.checked })}
                />
                <span>Auto approve payment</span>
              </label>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={() => {
              setShowCreatePayment(false);
              setError(null);
            }}
            disabled={actionLoading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleCreatePayment}
            disabled={actionLoading}
          >
            {actionLoading ? <Loader2 className="animate-spin" size={18} /> : 'Create Payment'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderBatchActionsModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Batch Create Payments</h3>
          <button className="close-btn" onClick={() => setShowBatchActions(false)}>×</button>
        </div>
        <div className="modal-body">
          <p>Create payments for all completed applications without existing payments?</p>
          <div className="applications-list">
            {completedApplications
              .filter(app => !app.payment_created)
              .slice(0, 5)
              .map(app => (
                <div key={app.application_id} className="application-item">
                  <div className="app-info">
                    <strong>{app.campaign_title}</strong>
                    <small>Influencer: {app.influencer_name} | Brand: {app.brand_name}</small>
                  </div>
                  <div className="app-amount">
                    {formatCurrency(app.payment_amount, app.payment_currency)}
                  </div>
                </div>
              ))}
            {completedApplications.filter(app => !app.payment_created).length > 5 && (
              <div className="more-items">
                + {completedApplications.filter(app => !app.payment_created).length - 5} more applications
              </div>
            )}
          </div>
          <div className="total-amount">
            Total: {formatCurrency(
              completedApplications
                .filter(app => !app.payment_created)
                .reduce((sum, app) => sum + (app.payment_amount || 0), 0),
              'USD'
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={() => setShowBatchActions(false)}
            disabled={actionLoading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleBatchCreatePayments(
              completedApplications
                .filter(app => !app.payment_created)
                .map(app => app.application_id)
            )}
            disabled={actionLoading}
          >
            {actionLoading ? <Loader2 className="animate-spin" size={18} /> : 'Create All Payments'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderDetailModal = () => (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h3>Payment Details</h3>
          <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
        </div>
        <div className="modal-body">
          {detailData && (
            <div className="detail-grid">
              <div className="detail-section">
                <h4>Basic Information</h4>
                <div className="detail-row">
                  <span className="detail-label">Reference:</span>
                  <span className="detail-value">{detailData.payment_reference || detailData.payout_reference || detailData.application_id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">
                    <StatusBadge status={detailData.status || detailData.payment_status} />
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value">
                    {formatCurrency(detailData.amount || detailData.total_amount || detailData.payment_amount, detailData.currency || detailData.payment_currency || 'USD')}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">{formatDate(detailData.created_at || detailData.application_completed_at)}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Parties Involved</h4>
                <div className="detail-row">
                  <span className="detail-label">Influencer:</span>
                  <span className="detail-value">{detailData.influencer_name || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Brand:</span>
                  <span className="detail-value">{detailData.brand_name || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Campaign:</span>
                  <span className="detail-value">{detailData.campaign_title || 'N/A'}</span>
                </div>
              </div>

              {detailData.notes && (
                <div className="detail-section full-width">
                  <h4>Notes</h4>
                  <p className="detail-notes">{detailData.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const renderPaymentFlowModal = () => (
    <div className="modal-overlay">
      <div className="modal xlarge">
        <div className="modal-header">
          <h3>Payment Flow Details</h3>
          <button className="close-btn" onClick={() => setShowPaymentFlowModal(false)}>×</button>
        </div>
        <div className="modal-body">
          {paymentFlowData && (
            <div className="flow-details">
              <div className="flow-header">
                <div className="flow-title">
                  <h4>{paymentFlowData.campaign_title}</h4>
                  <StatusBadge status={paymentFlowData.overall_status} />
                </div>
                <div className="flow-parties">
                  <div className="flow-party">
                    <strong>Influencer:</strong> {paymentFlowData.influencer_name}
                  </div>
                  <div className="flow-party">
                    <strong>Brand:</strong> {paymentFlowData.brand_name}
                  </div>
                </div>
              </div>

              <div className="flow-timeline">
                <div className={`flow-step ${paymentFlowData.application_status === 'completed' ? 'completed' : ''}`}>
                  <div className="step-icon">
                    <CheckCircle size={20} />
                  </div>
                  <div className="step-content">
                    <strong>Application Completed</strong>
                    <small>{formatDate(paymentFlowData.application_completed_at)}</small>
                  </div>
                </div>

                {paymentFlowData.payment && (
                  <div className={`flow-step ${['approved', 'processing', 'completed'].includes(paymentFlowData.payment.status) ? 'completed' : ''}`}>
                    <div className="step-icon">
                      <CreditCard size={20} />
                    </div>
                    <div className="step-content">
                      <strong>Payment Created</strong>
                      <small>
                        {paymentFlowData.payment.reference} |
                        {formatCurrency(paymentFlowData.payment.amount, paymentFlowData.payment.currency)} |
                        {formatStatus(paymentFlowData.payment.status)}
                      </small>
                      <small>{formatDate(paymentFlowData.payment.created_at)}</small>
                    </div>
                  </div>
                )}

                {paymentFlowData.earning && (
                  <div className={`flow-step ${paymentFlowData.earning.status === 'available' ? 'completed' : ''}`}>
                    <div className="step-icon">
                      <DollarSign size={20} />
                    </div>
                    <div className="step-content">
                      <strong>Earning Created</strong>
                      <small>
                        {formatCurrency(paymentFlowData.earning.amount, paymentFlowData.earning.currency)} |
                        {formatStatus(paymentFlowData.earning.status)}
                      </small>
                      <small>{formatDate(paymentFlowData.earning.created_at)}</small>
                    </div>
                  </div>
                )}

                {paymentFlowData.withdrawal && (
                  <div className={`flow-step ${paymentFlowData.withdrawal.status === 'completed' ? 'completed' : ''}`}>
                    <div className="step-icon">
                      <TrendingUp size={20} />
                    </div>
                    <div className="step-content">
                      <strong>Withdrawal Requested</strong>
                      <small>
                        {formatCurrency(paymentFlowData.withdrawal.amount)} |
                        {formatStatus(paymentFlowData.withdrawal.status)}
                      </small>
                      <small>{formatDate(paymentFlowData.withdrawal.requested_at)}</small>
                    </div>
                  </div>
                )}

                {paymentFlowData.payout && (
                  <div className={`flow-step ${['processed', 'paid', 'completed'].includes(paymentFlowData.payout.status) ? 'completed' : ''}`}>
                    <div className="step-icon">
                      <FileText size={20} />
                    </div>
                    <div className="step-content">
                      <strong>Payout Created</strong>
                      <small>
                        {paymentFlowData.payout.reference} |
                        {formatStatus(paymentFlowData.payout.status)}
                      </small>
                      <small>{formatDate(paymentFlowData.payout.created_at)}</small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowPaymentFlowModal(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const renderExportModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Export Data</h3>
          <button className="close-btn" onClick={() => setShowExportModal(false)}>×</button>
        </div>
        <div className="modal-body">
          <div className="export-options">
            <div className="export-type">
              <h4>Export Type</h4>
              <select className="export-select">
                <option value="payments">Payments</option>
                <option value="payouts">Payouts</option>
                <option value="report">Summary Report</option>
              </select>
            </div>

            <div className="export-format">
              <h4>Format</h4>
              <div className="format-options">
                <label className="format-option">
                  <input type="radio" name="format" value="csv" defaultChecked />
                  <span>CSV</span>
                </label>
                <label className="format-option">
                  <input type="radio" name="format" value="excel" />
                  <span>Excel</span>
                </label>
                <label className="format-option">
                  <input type="radio" name="format" value="pdf" />
                  <span>PDF</span>
                </label>
              </div>
            </div>

            <div className="export-filters">
              <h4>Include Current Filters</h4>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>Apply current search and filter settings</span>
              </label>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowExportModal(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => {
            const type = document.querySelector('.export-select').value;
            const format = document.querySelector('input[name="format"]:checked').value;
            handleExportData(type, format);
            setShowExportModal(false);
          }}>
            Export
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-payments-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Payments Dashboard</h1>
          <div className="header-subtitle">
            <span className="badge">{dashboardStats?.completed_payments || 0} Total Payments</span>
            <span className="divider">•</span>
            <span>{formatCurrency(dashboardStats?.total_brand_payments || 0)} Total Revenue</span>
          </div>
        </div>

        <div className="header-right">
          <button
            className={`btn btn-icon ${refreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>

          <div className="date-range">
            <Calendar size={18} />
            <span>
              {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
            </span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-tabs">
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart2 size={18} /> },
            { id: 'applications', label: 'Applications', icon: <FileText size={18} /> },
            { id: 'payments', label: 'Payments', icon: <CreditCard size={18} /> },
            { id: 'payouts', label: 'Payouts', icon: <DollarSign size={18} /> },
            { id: 'withdrawals', label: 'Withdrawals', icon: <TrendingUp size={18} /> },
            { id: 'earnings', label: 'Earnings', icon: <Award size={18} /> },
            { id: 'analytics', label: 'Analytics', icon: <PieChartIcon size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'applications' && dashboardStats?.waiting_payments > 0 && (
                <span className="tab-badge">
                  {dashboardStats.waiting_payments}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        {loading ? (
          <div className="loading-state">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'applications' && renderApplications()}
            {activeTab === 'payments' && renderPayments()}
            {activeTab === 'analytics' && renderAnalytics()}
          </>
        )}
      </main>

      {/* Modals */}
      {showCreatePayment && renderCreatePaymentModal()}
      {showBatchActions && renderBatchActionsModal()}
      {showDetailModal && renderDetailModal()}
      {showPaymentFlowModal && renderPaymentFlowModal()}
      {showExportModal && renderExportModal()}
    </div>
  );
};

export default AdminPaymentsDashboard;