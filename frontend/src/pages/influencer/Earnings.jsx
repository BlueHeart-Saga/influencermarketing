// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Wallet,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   Loader2
// } from "lucide-react";
// import "../../style/InfluencerEarnings.css";

// const API_BASE_URL =
//   process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

// const InfluencerEarnings = () => {
//   const [earnings, setEarnings] = useState([]);
//   const [summary, setSummary] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const token = localStorage.getItem("access_token");

//   // ---------------- FETCH DATA ----------------
//   const fetchEarningsData = async () => {
//     try {
//       setLoading(true);

//       const headers = {
//         Authorization: `Bearer ${token}`,
//       };

//       const [earningsRes, summaryRes] = await Promise.all([
//         axios.get(`${API_BASE_URL}/earnings`, { headers }),
//         axios.get(`${API_BASE_URL}/earnings/summary`, { headers }),
//       ]);

//       setEarnings(earningsRes.data || []);
//       setSummary(summaryRes.data);
//     } catch (err) {
//       console.error(err);
//       setError("Unable to load earnings data. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEarningsData();
//   }, []);

//   // ---------------- STATUS BADGE ----------------
//   const getStatusBadge = (status) => {
//     const base = "status-badge";
//     switch (status) {
//       case "completed":
//         return `${base} status-success`;
//       case "pending":
//         return `${base} status-pending`;
//       case "processing":
//         return `${base} status-processing`;
//       case "on_hold":
//         return `${base} status-hold`;
//       case "cancelled":
//         return `${base} status-cancelled`;
//       default:
//         return base;
//     }
//   };

//   // ---------------- LOADING ----------------
//   if (loading) {
//     return (
//       <div className="loading-container">
//         <Loader2 className="spinner" />
//         <span>Loading earnings...</span>
//       </div>
//     );
//   }

//   // ---------------- ERROR ----------------
//   if (error) {
//     return (
//       <div className="error-container">
//         <AlertCircle />
//         <span>{error}</span>
//       </div>
//     );
//   }

//   // ---------------- UI ----------------
//   return (
//     <div className="earnings-page">

//       <h1 className="page-title">Earnings</h1>

//       {/* SUMMARY CARDS */}
//       {summary && (
//         <div className="summary-grid">

//           <div className="summary-card">
//             <div className="summary-header">
//               <span>Total Earnings</span>
//               <Wallet className="icon green" />
//             </div>
//             <h2>${summary.total_earnings.toFixed(2)}</h2>
//           </div>

//           <div className="summary-card">
//             <div className="summary-header">
//               <span>Available Balance</span>
//               <CheckCircle className="icon blue" />
//             </div>
//             <h2>${summary.available_balance.toFixed(2)}</h2>
//           </div>

//           <div className="summary-card">
//             <div className="summary-header">
//               <span>Pending Earnings</span>
//               <Clock className="icon yellow" />
//             </div>
//             <h2>${summary.pending_earnings.toFixed(2)}</h2>
//           </div>

//           <div className="summary-card">
//             <div className="summary-header">
//               <span>Processing Withdrawals</span>
//               <AlertCircle className="icon orange" />
//             </div>
//             <h2>${summary.processing_withdrawals.toFixed(2)}</h2>
//           </div>

//         </div>
//       )}

//       {/* EARNINGS TABLE */}
//       <div className="earnings-table-wrapper">
//         <h2 className="section-title">Earnings History</h2>

//         {earnings.length === 0 ? (
//           <div className="empty-state">
//             No earnings recorded yet.
//           </div>
//         ) : (
//           <table className="earnings-table">
//             <thead>
//               <tr>
//                 <th>Campaign</th>
//                 <th>Brand</th>
//                 <th>Amount</th>
//                 <th>Status</th>
//                 <th>Earned On</th>
//               </tr>
//             </thead>
//             <tbody>
//               {earnings.map((e) => (
//                 <tr key={e.id || e._id}>
//                   <td>{e.campaign_title}</td>
//                   <td>{e.brand_name}</td>
//                   <td>
//                     ${e.amount.toFixed(2)} {e.currency}
//                   </td>
//                   <td>
//                     <span className={getStatusBadge(e.status)}>
//                       {e.status.replace("_", " ").toUpperCase()}
//                     </span>
//                   </td>
//                   <td>
//                     {new Date(e.earned_at).toLocaleDateString()}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//     </div>
//   );
// };

// export default InfluencerEarnings;



import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Eye,
  RefreshCw,
  BarChart3,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  X
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  format,
  parseISO
} from 'date-fns';
import '../../style/InfluencerEarnings.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      className: 'status-badge status-pending',
      icon: Clock
    },
    processing: {
      label: 'Processing',
      className: 'status-badge status-processing',
      icon: RefreshCw
    },
    completed: {
      label: 'Completed',
      className: 'status-badge status-completed',
      icon: CheckCircle
    },
    cancelled: {
      label: 'Cancelled',
      className: 'status-badge status-cancelled',
      icon: AlertCircle
    },
    on_hold: {
      label: 'On Hold',
      className: 'status-badge status-on-hold',
      icon: AlertCircle
    },
    rejected: {
      label: 'Rejected',
      className: 'status-badge status-rejected',
      icon: AlertCircle
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={config.className}>
      <Icon className="status-icon" />
      {config.label}
    </span>
  );
};

// Time Period Filter Component
const TimePeriodFilter = ({ period, onPeriodChange }) => {
  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'all_time', label: 'All Time' }
  ];

  return (
    <div className="period-filter">
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => onPeriodChange(p.value)}
          className={`period-button ${period === p.value ? 'period-button-active' : ''}`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, subtitle, icon: Icon, trend, color = 'indigo' }) => {
  return (
    <div className={`stats-card ${color}`}>
      <div className="stats-card-header">
        <div>
          <p className="stats-card-title">{title}</p>
          <p className="stats-card-value">
            ${typeof value === 'number' ? value.toFixed(2) : value}
          </p>
          {subtitle && (
            <p className="stats-card-subtitle">{subtitle}</p>
          )}
        </div>
        <div className={`stats-card-icon ${color}`}>
          <Icon className="stats-icon" />
        </div>
      </div>
      {trend && (
        <div className={`stats-trend ${trend.value > 0 ? 'trend-positive' : 'trend-negative'}`}>
          {trend.value > 0 ? (
            <ArrowUpRight className="trend-icon" />
          ) : (
            <ArrowDownRight className="trend-icon" />
          )}
          <span>{Math.abs(trend.value)}%</span>
          <span className="trend-label">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

// Earnings Table Component
const EarningsTable = ({ earnings, onViewDetails }) => {
  const [sortField, setSortField] = useState('earned_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredEarnings = earnings.filter(earning => {
    if (filterStatus === 'all') return true;
    return earning.status === filterStatus;
  });

  const sortedEarnings = [...filteredEarnings].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    if (sortField === 'amount') {
      return (a.amount - b.amount) * multiplier;
    }
    
    if (sortField === 'earned_at') {
      return (new Date(a.earned_at) - new Date(b.earned_at)) * multiplier;
    }
    
    return 0;
  });

  return (
    <div className="earnings-table-container">
      <div className="table-header">
        <div className="table-header-content">
          <div>
            <h3 className="table-title">Recent Earnings</h3>
            <p className="table-subtitle">Your latest transactions</p>
          </div>
          <div className="table-controls">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
            <button className="filter-button">
              <Filter className="filter-icon" onChange={(e) => setFilterStatus(e.target.value)}/>
            </button>
          </div>
        </div>
      </div>
      
      <div className="table-wrapper">
        <table className="earnings-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('campaign_title')}>
                Campaign
                {sortField === 'campaign_title' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSort('amount')}>
                Amount
                {sortField === 'amount' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th>Status</th>
              <th onClick={() => handleSort('earned_at')}>
                Date
                {sortField === 'earned_at' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedEarnings.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-table">
                  No earnings found
                </td>
              </tr>
            ) : (
              sortedEarnings.slice(0, 10).map((earning) => (
                <tr key={earning.id} className="table-row">
                  <td>
                    <div className="campaign-info">
                      <p className="campaign-name">{earning.campaign_title}</p>
                      <p className="brand-name">{earning.brand_name}</p>
                    </div>
                  </td>
                  <td>
                    <div className="amount-info">
                      <span className="amount">${earning.amount.toFixed(2)}</span>
                      <span className="currency">{earning.currency}</span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={earning.status} />
                  </td>
                  <td className="date-cell">
                    {format(parseISO(earning.earned_at), 'MMM dd, yyyy')}
                  </td>
                  <td>
                    <button
                      onClick={() => onViewDetails(earning.id)}
                      className="view-details-button"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const WithdrawalConfirmModal = ({
  amount,
  onClose,
  onConfirm,
  loading
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container small">
        <div className="modal-header">
          <h3 className="modal-title">Confirm Withdrawal</h3>
          <button onClick={onClose} className="modal-close">
            <X className="close-icon" />
          </button>
        </div>

        <div className="modal-content">
          <p className="confirm-text">
            You are about to withdraw:
          </p>

          <h2 className="confirm-amount">
            ${amount.toFixed(2)}
          </h2>

          <p className="confirm-warning">
            This action cannot be undone. Processing fees may apply.
          </p>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="modal-button secondary">
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="modal-button primary"
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm Withdrawal"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Withdrawals Table Component
const WithdrawalsTable = ({ withdrawals, onRequestWithdrawal }) => {

  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

    const handleWithdrawalRequest = () => {
  setShowWithdrawalModal(true);
};
  return (
    <div className="withdrawals-table-container">
      <div className="table-header">
        <div className="table-header-content">
          <div>
            <h3 className="table-title">Recent Withdrawals</h3>
            <p className="table-subtitle">Your withdrawal history</p>
          </div>
          <button
  className="withdrawal-request-button"
  onClick={() => setShowWithdrawalModal(true)}
>
  Request Withdrawal
</button>
        </div>
      </div>
      
      <div className="table-wrapper">
        <table className="withdrawals-table">
          <thead>
            <tr>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Requested</th>
              <th>Completed</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-table">
                  No withdrawals found
                </td>
              </tr>
            ) : (
              withdrawals.slice(0, 5).map((withdrawal) => (
                <tr key={withdrawal.id} className="table-row">
                  <td>
                    <div className="withdrawal-amount">
                      <p className="amount-main">
                        ${withdrawal.amount.toFixed(2)}
                        {withdrawal.net_amount !== withdrawal.amount && (
                          <span className="net-amount">
                            (Net: ${withdrawal.net_amount?.toFixed(2)})
                          </span>
                        )}
                      </p>
                      {withdrawal.processing_fee && (
                        <p className="processing-fee">
                          Fee: ${withdrawal.processing_fee.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="payment-method">
                      {withdrawal.payment_method.replace('_', ' ').toUpperCase()}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={withdrawal.status} />
                  </td>
                  <td className="date-cell">
                    {format(parseISO(withdrawal.requested_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="date-cell">
                    {withdrawal.completed_at ? format(parseISO(withdrawal.completed_at), 'MMM dd, yyyy') : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Analytics Chart Component
const AnalyticsChart = ({ analytics, period }) => {
  const [chartType, setChartType] = useState('line');

  const earningsData = analytics.earnings_over_time.map(item => ({
    date: `${item.period.year}-${item.period.month || 1}-${item.period.day || 1}`,
    amount: item.amount,
    transactions: item.transaction_count
  }));

  const topCampaignsData = analytics.top_campaigns.map(campaign => ({
    name: campaign.campaign_title.length > 20 ? campaign.campaign_title.substring(0, 20) + '...' : campaign.campaign_title,
    value: campaign.total_amount
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="analytics-charts">
      {/* Earnings Over Time */}
      <div className="chart-container">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Earnings Over Time</h3>
            <p className="chart-subtitle">Last {period === 'month' ? '30 days' : period.replace('_', ' ')}</p>
          </div>
          <div className="chart-type-selector">
            <button
              onClick={() => setChartType('line')}
              className={`chart-type-button ${chartType === 'line' ? 'active' : ''}`}
            >
              <BarChart3 className="chart-type-icon" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`chart-type-button ${chartType === 'bar' ? 'active' : ''}`}
            >
              <TrendingUp className="chart-type-icon" />
            </button>
          </div>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
                  stroke="#666"
                />
                <YAxis stroke="#666" />
                <ChartTooltip 
                  formatter={(value) => [`$${value}`, 'Amount']}
                  labelFormatter={(date) => format(parseISO(date), 'MMM dd, yyyy')}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
                  stroke="#666"
                />
                <YAxis stroke="#666" />
                <ChartTooltip 
                  formatter={(value) => [`$${value}`, 'Amount']}
                  labelFormatter={(date) => format(parseISO(date), 'MMM dd, yyyy')}
                />
                <Bar dataKey="amount" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Campaigns */}
      <div className="chart-container">
        <h3 className="chart-title">Top Campaigns</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={topCampaignsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {topCampaignsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip formatter={(value) => [`$${value}`, 'Amount']} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Top Brands Component
const TopBrands = ({ brands }) => {
  return (
    <div className="top-brands-container">
      <h3 className="section-title">Top Brands</h3>
      <div className="brands-list">
        {brands?.slice(0, 5).map((brand, index) => (
          <div key={brand.brand_id} className="brand-item">
            <div className="brand-info">
              <div className="brand-rank">{index + 1}</div>
              <div>
                <p className="brand-name">{brand.brand_name}</p>
                <p className="brand-campaigns">{brand.campaign_count} campaigns</p>
              </div>
            </div>
            <div className="brand-stats">
              <p className="brand-amount">${brand.total_amount.toFixed(2)}</p>
              <p className="brand-transactions">{brand.transaction_count} transactions</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Performance Trends Component
const PerformanceTrends = ({ trends }) => {
  return (
    <div className="trends-container">
      <h3 className="section-title">Performance Trends</h3>
      <div className="trends-list">
        {trends?.map((trend, index) => (
          <div key={index} className="trend-item">
            <span className="trend-metric">{trend.metric}</span>
            <div className="trend-values">
              <span className="trend-current">
                ${typeof trend.current === 'number' ? trend.current.toFixed(2) : trend.current}
              </span>
              <span className={`trend-change ${trend.growth > 0 ? 'positive' : 'negative'}`}>
                {trend.growth > 0 ? (
                  <ArrowUpRight className="trend-change-icon" />
                ) : (
                  <ArrowDownRight className="trend-change-icon" />
                )}
                {Math.abs(trend.growth).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Earning Details Modal Component
const EarningDetailsModal = ({ earning, onClose }) => {
  if (!earning) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Earning Details</h3>
          <button onClick={onClose} className="modal-close">
            <X className="close-icon" />
          </button>
        </div>
        <div className="modal-content">
          <div className="details-grid">
            <div className="detail-item">
              <p className="detail-label">Campaign</p>
              <p className="detail-value">{earning.campaign_title}</p>
            </div>
            <div className="detail-item">
              <p className="detail-label">Brand</p>
              <p className="detail-value">{earning.brand_name}</p>
            </div>
            <div className="detail-item">
              <p className="detail-label">Amount</p>
              <p className="detail-amount">
                ${earning.amount.toFixed(2)} <span className="detail-currency">{earning.currency}</span>
              </p>
            </div>
            <div className="detail-item">
              <p className="detail-label">Status</p>
              <StatusBadge status={earning.status} />
            </div>
          </div>
          
          <div className="details-section">
            <div className="detail-full">
              <p className="detail-label">Description</p>
              <p className="detail-value">{earning.description || 'No description provided'}</p>
            </div>
            
            {earning.payment_method && (
              <div className="detail-full">
                <p className="detail-label">Payment Method</p>
                <p className="detail-value">{earning.payment_method.replace('_', ' ').toUpperCase()}</p>
              </div>
            )}
            
            {earning.transaction_id && (
              <div className="detail-full">
                <p className="detail-label">Transaction ID</p>
                <p className="detail-value transaction-id">{earning.transaction_id}</p>
              </div>
            )}
            
            <div className="details-dates">
              <div className="detail-item">
                <p className="detail-label">Earned At</p>
                <p className="detail-value">
                  {format(parseISO(earning.earned_at), 'PPpp')}
                </p>
              </div>
              {earning.completed_at && (
                <div className="detail-item">
                  <p className="detail-label">Completed At</p>
                  <p className="detail-value">
                    {format(parseISO(earning.completed_at), 'PPpp')}
                  </p>
                </div>
              )}
            </div>
            
            {earning.notes && (
              <div className="detail-full">
                <p className="detail-label">Notes</p>
                <p className="detail-value">{earning.notes}</p>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="modal-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const InfluencerEarnings = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: null,
    earnings: [],
    withdrawals: [],
    analytics: null
  });
  const [period, setPeriod] = useState('month');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEarning, setSelectedEarning] = useState(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const getToken = () => {
    return localStorage.getItem('access_token');
  };



const handleWithdrawalRequest = async () => {
  try {
    const token = getToken();

    if (!data.summary?.available_balance) {
      alert("No withdrawable balance available");
      return;
    }

    setWithdrawLoading(true);

    await axios.post(
      `${API_BASE_URL}/api/withdrawals`,
      {
        influencer_id: localStorage.getItem("user_id"), // adjust if stored elsewhere
        amount: data.summary.available_balance,
        payment_method: "bank_transfer",
        account_details: {}
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setShowWithdrawalModal(false);
    fetchDashboardData();

    alert("Withdrawal request submitted successfully");
  } catch (err) {
    console.error(err);
    alert(
      err.response?.data?.detail ||
      "Withdrawal failed"
    );
  } finally {
    setWithdrawLoading(false);
  }
};



  const safeNumber = (v) => (typeof v === "number" ? v : 0);
const safeArray = (v) => (Array.isArray(v) ? v : []);

const fetchDashboardData = useCallback(async () => {
  try {
    setLoading(true);
    const token = getToken();

    const [summaryRes, earningsRes, withdrawalsRes, analyticsRes] =
      await Promise.all([
        axios.get(`${API_BASE_URL}/api/earnings/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: {} })),

        axios.get(`${API_BASE_URL}/api/earnings`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 50 }
        }).catch(() => ({ data: [] })),

        axios.get(`${API_BASE_URL}/api/withdrawals`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 10 }
        }).catch(() => ({ data: [] })),

        axios.get(`${API_BASE_URL}/api/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { period, group_by: "day" }
        }).catch(() => ({ data: {} }))
      ]);

    const summary = summaryRes.data || {};

    setData({
      summary: {
        total_earnings: safeNumber(summary.total_earnings),
        available_balance: safeNumber(summary.available_balance),
        pending_earnings: safeNumber(summary.pending_earnings),
        completed_withdrawals: safeNumber(summary.completed_withdrawals)
      },

      earnings: safeArray(earningsRes.data),
      withdrawals: safeArray(withdrawalsRes.data),

      analytics: {
        earnings_over_time: safeArray(analyticsRes.data?.earnings_over_time),
        top_campaigns: safeArray(analyticsRes.data?.top_campaigns),
        top_brands: safeArray(analyticsRes.data?.top_brands),
        trends: safeArray(analyticsRes.data?.trends)
      }
    });

    setError("");
  } catch (err) {
    console.error(err);

    // Fallback FREE state instead of error screen
    setData({
      summary: {
        total_earnings: 0,
        available_balance: 0,
        pending_earnings: 0,
        completed_withdrawals: 0
      },
      earnings: [],
      withdrawals: [],
      analytics: {
        earnings_over_time: [],
        top_campaigns: [],
        top_brands: [],
        trends: []
      }
    });

    setError("");
  } finally {
    setLoading(false);
  }
}, [period]);


  const fetchEarningDetails = async (earningId) => {
    try {
      const token = getToken();
      const res = await axios.get(`${API_BASE_URL}/api/earnings/${earningId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedEarning(res.data);
    } catch (err) {
      console.error('Error fetching earning details:', err);
    }
  };

  const handleExportData = async (format) => {
    try {
      const token = getToken();
      const res = await axios.get(`${API_BASE_URL}/api/analytics/export`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { format }
      });

      if (format === 'csv') {
        const blob = new Blob([res.data.content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = res.data.filename;
        a.click();
        window.URL.revokeObjectURL(url);
      } else if (format === 'json') {
        const dataStr = JSON.stringify(res.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `earnings_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading && !data.summary) {
    return (
      
      <div className="brand-dashboard-loader">
        <div className="brand-loader-spinner"></div>
        <p>Loading your earnings dashboard...</p>
      </div>
    );
  }

  if (error && !data.summary) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <AlertCircle className="error-icon" />
          <h3 className="error-title">Error Loading Data</h3>
          <p className="error-message">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="error-retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = data.summary ? [
    {
      title: 'Total Earnings',
      value: data.summary.total_earnings,
      subtitle: 'All time completed earnings',
      icon: Wallet,
      color: 'green'
    },
    {
      title: 'Available Balance',
      value: data.summary.available_balance,
      subtitle: 'Ready for withdrawal',
      icon: DollarSign,
      color: 'blue'
    },
    {
      title: 'Pending Earnings',
      value: data.summary.pending_earnings,
      subtitle: 'Awaiting processing',
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Completed Withdrawals',
      value: data.summary.completed_withdrawals,
      subtitle: 'Total withdrawn',
      icon: CreditCard,
      color: 'purple'
    }
  ] : [];

  return (
    <div className="earnings-container">
      {/* Header */}
      <div className="earnings-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Earnings Dashboard</h1>
            <p className="page-subtitle">Track your earnings, withdrawals, and analytics</p>
          </div>
          <div className="header-actions">
            <button
              onClick={() => handleExportData('csv')}
              className="export-button"
            >
              <Download className="export-icon" />
              Export CSV
            </button>
            <button
              onClick={fetchDashboardData}
              className="refresh-button"
            >
              <RefreshCw className="refresh-icon" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="earnings-content">
        {/* Time Period Filter */}
        <div className="period-filter-section">
          <TimePeriodFilter period={period} onPeriodChange={setPeriod} />
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <nav className="tabs-nav">
            <button
              onClick={() => setActiveTab('overview')}
              className={`tab-button ${activeTab === 'overview' ? 'tab-active' : ''}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('earnings')}
              className={`tab-button ${activeTab === 'earnings' ? 'tab-active' : ''}`}
            >
              Earnings History
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`tab-button ${activeTab === 'withdrawals' ? 'tab-active' : ''}`}
            >
              Withdrawals
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`tab-button ${activeTab === 'analytics' ? 'tab-active' : ''}`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            {data.analytics && (
              <AnalyticsChart analytics={data.analytics} period={period} />
            )}
            <div className="tables-grid">
              <EarningsTable 
                earnings={data.earnings || []} 
                onViewDetails={fetchEarningDetails}
              />
              <WithdrawalsTable
  withdrawals={data.withdrawals || []}
  onRequestWithdrawal={() => setShowWithdrawalModal(true)}
/>
            </div>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="tab-content-full">
            <div className="full-table-container">
              <div className="full-table-header">
                <h2 className="full-table-title">All Earnings</h2>
                <p className="full-table-subtitle">Complete history of your earnings</p>
              </div>
              <EarningsTable 
                earnings={data.earnings || []} 
                onViewDetails={fetchEarningDetails}
              />
            </div>
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="tab-content">
            <WithdrawalsTable withdrawals={data.withdrawals || []} />
          </div>
        )}

        {activeTab === 'analytics' && data.analytics && (
          <div className="tab-content">
            <AnalyticsChart analytics={data.analytics} period={period} />
            
            {/* Additional Analytics Cards */}
            <div className="analytics-grid">
              <TopBrands brands={data.analytics.top_brands} />
              <PerformanceTrends trends={data.analytics.trends} />
            </div>
          </div>
        )}
      </div>

      {/* Earning Details Modal */}
      {selectedEarning && (
        <EarningDetailsModal 
          earning={selectedEarning} 
          onClose={() => setSelectedEarning(null)} 
        />
      )}

      {showWithdrawalModal && (
  <WithdrawalConfirmModal
    amount={data.summary?.available_balance || 0}
    loading={withdrawLoading}
    onClose={() => setShowWithdrawalModal(false)}
    onConfirm={handleWithdrawalRequest}
  />
)}

    </div>
  );
};

export default InfluencerEarnings;