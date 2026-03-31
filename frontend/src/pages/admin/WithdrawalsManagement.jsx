import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WithdrawalsManagement = ({ searchQuery }) => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filters, setFilters] = useState({
    status: '',
    influencer_id: '',
    payment_method: ''
  });
  const [summary, setSummary] = useState(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
    fetchWithdrawalsSummary();
  }, [page, filters, searchQuery]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = {
        skip: (page - 1) * limit,
        limit,
        ...filters
      };

      const response = await axios.get('/api/admin/payments/withdrawals', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (response.data.success) {
        setWithdrawals(response.data.withdrawals);
        setTotalWithdrawals(response.data.total);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawalsSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/payments/withdrawals/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Error fetching withdrawals summary:', error);
    }
  };

  const handleStatusUpdate = async (withdrawalId, status, transactionId = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `/api/admin/payments/withdrawals/${withdrawalId}/status`,
        {
          status,
          transaction_id: transactionId,
          admin_notes: `Status updated to ${status}`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Withdrawal status updated successfully!');
        fetchWithdrawals();
        fetchWithdrawalsSummary();
        setShowStatusModal(false);
        setSelectedWithdrawal(null);
      }
    } catch (error) {
      console.error('Error updating withdrawal status:', error);
      alert('Failed to update status');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'pending': 'badge-warning',
      'processing': 'badge-primary',
      'completed': 'badge-success',
      'rejected': 'badge-danger',
      'cancelled': 'badge-secondary'
    };

    return (
      <span className={`status-badge ${statusColors[status] || 'badge-light'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getMethodIcon = (method) => {
    const icons = {
      'bank_transfer': '🏦',
      'upi': '📱',
      'paypal': '🌐',
      'stripe': '💳',
      'cash': '💵'
    };
    return icons[method] || '💰';
  };

  return (
    <div className="withdrawals-management">
      {/* Header */}
      <div className="section-header">
        <div className="header-left">
          <h2>Withdrawals Management</h2>
          <p className="header-subtitle">
            Manage influencer withdrawal requests
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              // Export withdrawals
              alert('Export feature coming soon');
            }}
          >
            📊 Generate Report
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="summary-stats">
          <div className="stat-card">
            <h4>Total Withdrawals</h4>
            <p className="stat-value">{summary.total_withdrawals}</p>
            <p className="stat-amount">{formatCurrency(summary.total_amount)}</p>
          </div>
          <div className="stat-card">
            <h4>Pending</h4>
            <p className="stat-value warning">{summary.pending_amount || 0}</p>
            <p className="stat-count">{summary.by_status?.pending || 0} requests</p>
          </div>
          <div className="stat-card">
            <h4>Processing</h4>
            <p className="stat-value primary">{summary.processing_amount || 0}</p>
            <p className="stat-count">{summary.by_status?.processing || 0} requests</p>
          </div>
          <div className="stat-card">
            <h4>Completed</h4>
            <p className="stat-value success">{summary.completed_amount || 0}</p>
            <p className="stat-count">{summary.by_status?.completed || 0} requests</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="form-select"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
          <select 
            value={filters.payment_method}
            onChange={(e) => setFilters({...filters, payment_method: e.target.value})}
            className="form-select"
          >
            <option value="">All Methods</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="upi">UPI</option>
            <option value="paypal">PayPal</option>
            <option value="stripe">Stripe</option>
          </select>
          <input 
            type="text"
            placeholder="Influencer ID"
            value={filters.influencer_id || ''}
            onChange={(e) => setFilters({...filters, influencer_id: e.target.value})}
            className="form-input"
          />
          <button 
            className="btn btn-secondary"
            onClick={() => setFilters({})}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading">Loading withdrawals...</div>
        ) : withdrawals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏧</div>
            <h3>No withdrawal requests</h3>
            <p>No pending withdrawal requests at the moment</p>
          </div>
        ) : (
          <>
            <table className="withdrawals-table">
              <thead>
                <tr>
                  <th>Influencer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th>Account Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(withdrawal => (
                  <tr key={withdrawal._id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {withdrawal.influencer_name?.charAt(0) || 'I'}
                        </div>
                        <div className="user-details">
                          <strong>{withdrawal.influencer_name}</strong>
                          <small>{withdrawal.influencer_email}</small>
                          <small>ID: {withdrawal.influencer_id?.substring(0, 8)}</small>
                        </div>
                      </div>
                    </td>
                    <td className="amount-cell">
                      <strong>{formatCurrency(withdrawal.amount)}</strong>
                      <small>{withdrawal.currency || 'INR'}</small>
                    </td>
                    <td>
                      <div className="method-cell">
                        <span className="method-icon">
                          {getMethodIcon(withdrawal.payment_method)}
                        </span>
                        <span className="method-name">
                          {withdrawal.payment_method?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td>{getStatusBadge(withdrawal.status)}</td>
                    <td>
                      {new Date(withdrawal.requested_at).toLocaleDateString()}
                      <small className="d-block">
                        {new Date(withdrawal.requested_at).toLocaleTimeString()}
                      </small>
                    </td>
                    <td>
                      <div className="account-details">
                        {withdrawal.bank_details ? (
                          <>
                            <small>Bank: {withdrawal.bank_details.bank_name}</small>
                            <small>Acc: ****{withdrawal.bank_details.account_number?.slice(-4)}</small>
                          </>
                        ) : withdrawal.upi_details ? (
                          <small>UPI: {withdrawal.upi_details.upi_id}</small>
                        ) : (
                          <small className="text-muted">No details</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon"
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            // Show details modal
                            alert('Details modal coming soon');
                          }}
                          title="View Details"
                        >
                          👁️
                        </button>
                        {withdrawal.status === 'pending' && (
                          <>
                            <button 
                              className="btn-icon success"
                              onClick={() => handleStatusUpdate(withdrawal._id, 'processing')}
                              title="Start Processing"
                            >
                              ⚡
                            </button>
                            <button 
                              className="btn-icon danger"
                              onClick={() => handleStatusUpdate(withdrawal._id, 'rejected')}
                              title="Reject"
                            >
                              ❌
                            </button>
                          </>
                        )}
                        {withdrawal.status === 'processing' && (
                          <button 
                            className="btn-icon success"
                            onClick={() => {
                              const transactionId = prompt('Enter transaction ID:');
                              if (transactionId) {
                                handleStatusUpdate(withdrawal._id, 'completed', transactionId);
                              }
                            }}
                            title="Mark as Completed"
                          >
                            ✅
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalWithdrawals > limit && (
              <div className="pagination">
                <button 
                  className="btn btn-secondary"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  ← Previous
                </button>
                <span className="page-info">
                  Page {page} of {Math.ceil(totalWithdrawals / limit)}
                </span>
                <button 
                  className="btn btn-secondary"
                  disabled={page >= Math.ceil(totalWithdrawals / limit)}
                  onClick={() => setPage(page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedWithdrawal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Update Withdrawal Status</h3>
            <p>Withdrawal ID: {selectedWithdrawal._id}</p>
            <p>Amount: {formatCurrency(selectedWithdrawal.amount)}</p>
            <div className="status-options">
              <button 
                className="btn btn-success"
                onClick={() => handleStatusUpdate(selectedWithdrawal._id, 'completed')}
              >
                Mark as Completed
              </button>
              <button 
                className="btn btn-warning"
                onClick={() => handleStatusUpdate(selectedWithdrawal._id, 'processing')}
              >
                Mark as Processing
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleStatusUpdate(selectedWithdrawal._id, 'rejected')}
              >
                Reject
              </button>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowStatusModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalsManagement;