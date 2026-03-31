import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const DashboardOverview = ({ stats, pendingActions, onTabChange, refreshKey }) => {
  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Prepare chart data
  const paymentStatusData = stats?.payment_stats ? [
    { name: 'Completed', value: stats.payment_stats.completed, color: '#10b981' },
    { name: 'Pending', value: stats.payment_stats.pending, color: '#f59e0b' },
    { name: 'Approved', value: stats.payment_stats.approved, color: '#3b82f6' },
    { name: 'Failed', value: stats.payment_stats.total - stats.payment_stats.completed - stats.payment_stats.pending - stats.payment_stats.approved, color: '#ef4444' }
  ].filter(item => item.value > 0) : [];

  const recentPayments = stats?.recent_payments || [];
  const recentPayouts = stats?.recent_payouts || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="dashboard-overview">
      {/* Stats Overview Grid */}
      <div className="stats-overview-grid">
        <div className="stat-card primary">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">{formatCurrency(stats?.payment_stats?.total_amount || 0)}</p>
            <p className="stat-label">{stats?.payment_stats?.total || 0} total payments</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Completed Payments</h3>
            <p className="stat-value">{formatCurrency(stats?.payment_stats?.completed_amount || 0)}</p>
            <p className="stat-label">{stats?.payment_stats?.completed || 0} payments</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <h3>Platform Fees</h3>
            <p className="stat-value">{formatCurrency(stats?.platform_stats?.platform_fees || 0)}</p>
            <p className="stat-label">10% of completed payments</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <h3>Total Payouts</h3>
            <p className="stat-value">{stats?.payout_stats?.total || 0}</p>
            <p className="stat-label">{stats?.payout_stats?.completed || 0} completed</p>
          </div>
        </div>
      </div>

      {/* Charts and Pending Actions Row */}
      <div className="charts-actions-row">
        <div className="chart-container">
          <h3>Payment Status Distribution</h3>
          {paymentStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} payments`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No payment data available</div>
          )}
        </div>

        <div className="pending-actions-container">
          <h3>Pending Actions ⚡</h3>
          <div className="actions-list">
            <div className="action-item urgent">
              <div className="action-content">
                <h4>Payments Pending Approval</h4>
                <p className="action-count">{pendingActions?.payments_pending_approval || 0}</p>
                <p className="action-desc">Requires immediate review</p>
              </div>
              <button 
                className="btn btn-small btn-primary"
                onClick={() => onTabChange('payments')}
              >
                Review Now
              </button>
            </div>

            <div className="action-item">
              <div className="action-content">
                <h4>Approved Payments Not Paid</h4>
                <p className="action-count">{pendingActions?.approved_payments_not_paid || 0}</p>
                <p className="action-desc">Ready for payout creation</p>
              </div>
              <button 
                className="btn btn-small btn-secondary"
                onClick={() => onTabChange('payouts')}
              >
                Create Payout
              </button>
            </div>

            <div className="action-item">
              <div className="action-content">
                <h4>Payouts Pending Processing</h4>
                <p className="action-count">{pendingActions?.payouts_pending_processing || 0}</p>
                <p className="action-desc">Awaiting processing</p>
              </div>
              <button 
                className="btn btn-small btn-warning"
                onClick={() => onTabChange('payouts')}
              >
                Process Now
              </button>
            </div>

            <div className="action-item">
              <div className="action-content">
                <h4>Withdrawals Pending</h4>
                <p className="action-count">{pendingActions?.withdrawals_pending_processing || 0}</p>
                <p className="action-desc">Influencer withdrawal requests</p>
              </div>
              <button 
                className="btn btn-small btn-info"
                onClick={() => onTabChange('withdrawals')}
              >
                Review
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="recent-activity-row">
        <div className="recent-payments">
          <h3>Recent Payments</h3>
          {recentPayments.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Influencer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.slice(0, 5).map(payment => (
                    <tr key={payment._id}>
                      <td>{payment.payment_reference?.substring(0, 8)}...</td>
                      <td>{payment.influencer_name || 'Unknown'}</td>
                      <td className="amount">{formatCurrency(payment.amount)}</td>
                      <td>
                        <span className={`status-badge ${payment.status}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                className="btn btn-link view-all"
                onClick={() => onTabChange('payments')}
              >
                View All Payments →
              </button>
            </div>
          ) : (
            <div className="no-data">No recent payments</div>
          )}
        </div>

        <div className="recent-payouts">
          <h3>Recent Payouts</h3>
          {recentPayouts.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayouts.slice(0, 5).map(payout => (
                    <tr key={payout.id}>
                      <td>{payout.reference?.substring(0, 8)}...</td>
                      <td className="amount">{formatCurrency(payout.amount)}</td>
                      <td>{payout.method}</td>
                      <td>
                        <span className={`status-badge ${payout.status}`}>
                          {payout.status}
                        </span>
                      </td>
                      <td>{new Date(payout.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                className="btn btn-link view-all"
                onClick={() => onTabChange('payouts')}
              >
                View All Payouts →
              </button>
            </div>
          ) : (
            <div className="no-data">No recent payouts</div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats-row">
        <div className="quick-stat-card">
          <h4>Daily Average</h4>
          <p className="stat-value">
            {formatCurrency((stats?.payment_stats?.total_amount || 0) / 30)}
          </p>
          <p className="stat-label">Last 30 days</p>
        </div>
        <div className="quick-stat-card">
          <h4>Success Rate</h4>
          <p className="stat-value">
            {stats?.payment_stats?.total ? 
              ((stats.payment_stats.completed / stats.payment_stats.total) * 100).toFixed(1) : '0'}%
          </p>
          <p className="stat-label">Payment completion</p>
        </div>
        <div className="quick-stat-card">
          <h4>Avg Payment</h4>
          <p className="stat-value">
            {formatCurrency((stats?.payment_stats?.total_amount || 0) / (stats?.payment_stats?.total || 1))}
          </p>
          <p className="stat-label">Per transaction</p>
        </div>
        <div className="quick-stat-card">
          <h4>Active Campaigns</h4>
          <p className="stat-value">
            {Math.floor((stats?.payment_stats?.total || 0) / 3)}
          </p>
          <p className="stat-label">Estimated active</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;