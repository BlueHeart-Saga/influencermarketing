// frontend/src/pages/admin/PayoutsManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../style/PayoutsManagement.css';

const PayoutsManagement = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedPayoutIds, setSelectedPayoutIds] = useState([]);
  const [showPayoutReport, setShowPayoutReport] = useState(false);
  const [payoutReport, setPayoutReport] = useState(null);

  // New payout form state
  const [newPayout, setNewPayout] = useState({
    payout_method: 'bank_transfer',
    scheduled_date: '',
    notes: '',
    payout_details: {
      bank_details: {
        account_holder_name: '',
        account_number: '',
        ifsc_code: '',
        bank_name: '',
        branch: ''
      },
      upi_details: {
        upi_id: ''
      },
      paypal_details: {
        email: ''
      },
      stripe_connect_id: '',
      razorpay_contact_id: ''
    }
  });

  // Available payments for selection
  const [availablePayments, setAvailablePayments] = useState([]);

  useEffect(() => {
    fetchPayouts();
    fetchAvailablePayments();
  }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/admin/payments/payouts', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPayouts(response.data.payouts || []);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      alert('Failed to load payouts');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePayments = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/admin/payments/payments?status=approved&has_payout=false', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAvailablePayments(response.data.payments || []);
    } catch (error) {
      console.error('Error fetching available payments:', error);
    }
  };

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreatePayout = async (e) => {
    e.preventDefault();
    
    if (selectedPayments.length === 0) {
      alert('Please select at least one payment');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        payment_ids: selectedPayments,
        payout_method: newPayout.payout_method,
        payout_details: {
          payout_method: newPayout.payout_method,
          ...newPayout.payout_details
        },
        scheduled_date: newPayout.scheduled_date || undefined,
        notes: newPayout.notes
      };

      await axios.post('/api/admin/payments/payouts/create', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Payout created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchPayouts();
      fetchAvailablePayments();
    } catch (error) {
      console.error('Error creating payout:', error);
      alert('Failed to create payout: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleProcessPayout = async (payoutId) => {
    if (!window.confirm('Process this payout?')) return;


    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/admin/payments/payouts/${payoutId}/process`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Payout processing initiated!');
      fetchPayouts();
    } catch (error) {
      console.error('Error processing payout:', error);
      alert('Failed to process payout');
    }
  };

  const handleStatusUpdate = async (payoutId, status) => {
    if (!window.confirm(`Mark this payout as ${status}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/admin/payments/payouts/${payoutId}/status`, {
        status: status,
        notes: `Status updated by admin`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Payout status updated!');
      fetchPayouts();
    } catch (error) {
      console.error('Error updating payout status!window.:', error);
      alert('Failed to update payout status');
    }
  };

  const handleViewDetails = async (payout) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin/payments/payouts/${payout._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSelectedPayout(response.data.payout);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching payout details:', error);
      alert('Failed to load payout details');
    }
  };

  const handleGenerateReport = async (payoutId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin/payments/payouts/${payoutId}/report`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPayoutReport(response.data.report);
      setShowPayoutReport(true);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedPayoutIds.length === 0) {
      alert('Please select payouts to process');
      return;
    }

    if (!window.confirm(`Perform ${action} on ${selectedPayoutIds.length} payouts?`)) return;


    try {
      const token = localStorage.getItem('token');
      
      if (action === 'process') {
        const response = await axios.post('/api/admin/payments/payouts/batch/process', {
          payout_ids: selectedPayoutIds,
          action: 'process'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        alert(`Batch processing completed: ${response.data.results.successful.length} successful, ${response.data.results.failed.length} failed`);
      } else if (action === 'cancel') {
        for (const payoutId of selectedPayoutIds) {
          await axios.put(`/api/admin/payments/payouts/${payoutId}/status`, {
            status: 'cancelled',
            notes: 'Bulk cancelled by admin'
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        alert(`${selectedPayoutIds.length} payouts cancelled`);
      }

      setSelectedPayoutIds([]);
      setShowBulkActions(false);
      fetchPayouts();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/payments/export/payouts', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payouts_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting payouts:', error);
      alert('Failed to export payouts');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': '#95a5a6',
      'pending': '#f39c12',
      'initiated': '#3498db',
      'processing': '#9b59b6',
      'processed': '#1abc9c',
      'paid': '#27ae60',
      'failed': '#e74c3c',
      'refunded': '#e67e22',
      'cancelled': '#7f8c8d'
    };
    return colors[status] || '#7f8c8d';
  };

  const resetForm = () => {
    setNewPayout({
      payout_method: 'bank_transfer',
      scheduled_date: '',
      notes: '',
      payout_details: {
        bank_details: {
          account_holder_name: '',
          account_number: '',
          ifsc_code: '',
          bank_name: '',
          branch: ''
        },
        upi_details: {
          upi_id: ''
        },
        paypal_details: {
          email: ''
        },
        stripe_connect_id: '',
        razorpay_contact_id: ''
      }
    });
    setSelectedPayments([]);
  };

  const togglePaymentSelection = (paymentId) => {
    setSelectedPayments(prev => {
      if (prev.includes(paymentId)) {
        return prev.filter(id => id !== paymentId);
      } else {
        return [...prev, paymentId];
      }
    });
  };

  const togglePayoutSelection = (payoutId) => {
    setSelectedPayoutIds(prev => {
      if (prev.includes(payoutId)) {
        return prev.filter(id => id !== payoutId);
      } else {
        return [...prev, payoutId];
      }
    });
  };

  const selectAllPayments = () => {
    if (selectedPayments.length === availablePayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(availablePayments.map(p => p._id));
    }
  };

  const selectAllPayouts = () => {
    if (selectedPayoutIds.length === payouts.length) {
      setSelectedPayoutIds([]);
    } else {
      setSelectedPayoutIds(payouts.map(p => p._id));
    }
  };

  const getPayoutMethodIcon = (method) => {
    const icons = {
      'bank_transfer': '🏦',
      'stripe_connect': '💳',
      'razorpay_x': '🔄',
      'paypal': '📧',
      'upi': '📱',
      'manual': '✋'
    };
    return icons[method] || '💰';
  };

  if (loading && payouts.length === 0) {
    return (
      <div className="payouts-management">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="payouts-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Payouts Management</h1>
          <p>Process and manage influencer payouts</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowBulkActions(!showBulkActions)}
          >
            Bulk Actions
          </button>
          <button 
            className="btn btn-warning" 
            onClick={handleExport}
          >
            Export CSV
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowCreateModal(true)}
            disabled={availablePayments.length === 0}
          >
            + Create Payout
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <div className="bulk-actions-bar">
          <div className="bulk-info">
            <span className="bulk-count">
              {selectedPayoutIds.length} payouts selected
            </span>
            <button 
              className="btn btn-link"
              onClick={selectAllPayouts}
            >
              {selectedPayoutIds.length === payouts.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="bulk-buttons">
            <button 
              className="btn btn-success"
              onClick={() => handleBulkAction('process')}
              disabled={selectedPayoutIds.length === 0}
            >
              Process Selected
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => handleBulkAction('cancel')}
              disabled={selectedPayoutIds.length === 0}
            >
              Cancel Selected
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setSelectedPayoutIds([]);
                setShowBulkActions(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="payouts-summary">
        <div className="summary-card">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <h3>Total Payouts</h3>
            <p className="summary-value">{payouts.length}</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">⏳</div>
          <div className="summary-content">
            <h3>Pending Processing</h3>
            <p className="summary-value">
              {payouts.filter(p => ['pending', 'initiated'].includes(p.status)).length}
            </p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <h3>Completed</h3>
            <p className="summary-value">
              {payouts.filter(p => p.status === 'paid').length}
            </p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">📋</div>
          <div className="summary-content">
            <h3>Ready for Payout</h3>
            <p className="summary-value">{availablePayments.length}</p>
          </div>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="payouts-table-container">
        <div className="table-header">
          <div className="table-summary">
            Showing {payouts.length} payouts
          </div>
        </div>

        <div className="table-responsive">
          <table className="payouts-table">
            <thead>
              <tr>
                {showBulkActions && (
                  <th style={{ width: '50px' }}>
                    <input 
                      type="checkbox"
                      checked={selectedPayoutIds.length === payouts.length && payouts.length > 0}
                      onChange={selectAllPayouts}
                    />
                  </th>
                )}
                <th>Reference</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Payments</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length > 0 ? (
                payouts.map(payout => (
                  <tr key={payout._id}>
                    {showBulkActions && (
                      <td>
                        <input 
                          type="checkbox"
                          checked={selectedPayoutIds.includes(payout._id)}
                          onChange={() => togglePayoutSelection(payout._id)}
                        />
                      </td>
                    )}
                    <td>
                      <div className="payout-reference">
                        {payout.payout_reference || payout._id.substring(0, 8)}
                      </div>
                    </td>
                    <td>
                      <div className="payout-method">
                        <span className="method-icon">
                          {getPayoutMethodIcon(payout.payout_method)}
                        </span>
                        <span className="method-name">
                          {payout.payout_method.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="payout-amount">
                        {formatCurrency(payout.total_amount, payout.currency)}
                      </div>
                    </td>
                    <td>
                      <div className="payment-count">
                        {payout.payment_count || 0} payments
                      </div>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(payout.status) }}
                      >
                        {payout.status}
                      </span>
                    </td>
                    <td>
                      <div className="created-date">
                        {formatDate(payout.created_at)}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-action btn-view"
                          onClick={() => handleViewDetails(payout)}
                        >
                          View
                        </button>
                        
                        {payout.status === 'pending' && (
                          <button 
                            className="btn-action btn-process"
                            onClick={() => handleProcessPayout(payout._id)}
                          >
                            Process
                          </button>
                        )}

                        {payout.status === 'processing' && (
                          <button 
                            className="btn-action btn-complete"
                            onClick={() => handleStatusUpdate(payout._id, 'paid')}
                          >
                            Mark Paid
                          </button>
                        )}

                        <button 
                          className="btn-action btn-report"
                          onClick={() => handleGenerateReport(payout._id)}
                        >
                          Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={showBulkActions ? 9 : 8} className="empty-state">
                    <div className="empty-content">
                      <div className="empty-icon">💰</div>
                      <h3>No payouts found</h3>
                      <p>Create a new payout to get started</p>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => setShowCreateModal(true)}
                        disabled={availablePayments.length === 0}
                      >
                        Create Payout
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Payout Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content wide-modal">
            <div className="modal-header">
              <h2>Create New Payout</h2>
              <button 
                className="btn-close" 
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleCreatePayout}>
                {/* Payment Selection Section */}
                <div className="section">
                  <h3>Select Payments</h3>
                  <div className="payment-selection">
                    <div className="selection-header">
                      <label className="checkbox-label">
                        <input 
                          type="checkbox"
                          checked={selectedPayments.length === availablePayments.length && availablePayments.length > 0}
                          onChange={selectAllPayments}
                        />
                        <span>Select All ({availablePayments.length} payments available)</span>
                      </label>
                      <div className="selected-count">
                        {selectedPayments.length} payments selected
                      </div>
                    </div>
                    
                    <div className="payments-list">
                      {availablePayments.length > 0 ? (
                        availablePayments.map(payment => (
                          <div key={payment._id} className="payment-item">
                            <label className="checkbox-label">
                              <input 
                                type="checkbox"
                                checked={selectedPayments.includes(payment._id)}
                                onChange={() => togglePaymentSelection(payment._id)}
                              />
                              <div className="payment-info">
                                <span className="payment-campaign">
                                  {payment.campaign_title}
                                </span>
                                <span className="payment-details">
                                  {payment.influencer_name} • {formatCurrency(payment.amount)}
                                </span>
                              </div>
                            </label>
                          </div>
                        ))
                      ) : (
                        <div className="empty-payments">
                          No payments available for payout
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payout Details Section */}
                <div className="section">
                  <h3>Payout Details</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Payout Method *</label>
                      <select 
                        required
                        value={newPayout.payout_method}
                        onChange={(e) => setNewPayout(prev => ({ 
                          ...prev, 
                          payout_method: e.target.value 
                        }))}
                      >
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="stripe_connect">Stripe Connect</option>
                        <option value="razorpay_x">Razorpay X</option>
                        <option value="upi">UPI</option>
                        <option value="paypal">PayPal</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Scheduled Date</label>
                      <input 
                        type="datetime-local"
                        value={newPayout.scheduled_date}
                        onChange={(e) => setNewPayout(prev => ({ 
                          ...prev, 
                          scheduled_date: e.target.value 
                        }))}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Notes</label>
                      <textarea 
                        value={newPayout.notes}
                        onChange={(e) => setNewPayout(prev => ({ 
                          ...prev, 
                          notes: e.target.value 
                        }))}
                        placeholder="Add any notes about this payout"
                        rows="3"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method Specific Details */}
                <div className="section">
                  <h3>Payment Details</h3>
                  
                  {newPayout.payout_method === 'bank_transfer' && (
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Account Holder Name *</label>
                        <input 
                          type="text"
                          required
                          value={newPayout.payout_details.bank_details.account_holder_name}
                          onChange={(e) => setNewPayout(prev => ({
                            ...prev,
                            payout_details: {
                              ...prev.payout_details,
                              bank_details: {
                                ...prev.payout_details.bank_details,
                                account_holder_name: e.target.value
                              }
                            }
                          }))}
                          placeholder="Enter account holder name"
                        />
                      </div>

                      <div className="form-group">
                        <label>Account Number *</label>
                        <input 
                          type="text"
                          required
                          value={newPayout.payout_details.bank_details.account_number}
                          onChange={(e) => setNewPayout(prev => ({
                            ...prev,
                            payout_details: {
                              ...prev.payout_details,
                              bank_details: {
                                ...prev.payout_details.bank_details,
                                account_number: e.target.value
                              }
                            }
                          }))}
                          placeholder="Enter account number"
                        />
                      </div>

                      <div className="form-group">
                        <label>IFSC Code *</label>
                        <input 
                          type="text"
                          required
                          value={newPayout.payout_details.bank_details.ifsc_code}
                          onChange={(e) => setNewPayout(prev => ({
                            ...prev,
                            payout_details: {
                              ...prev.payout_details,
                              bank_details: {
                                ...prev.payout_details.bank_details,
                                ifsc_code: e.target.value
                              }
                            }
                          }))}
                          placeholder="Enter IFSC code"
                        />
                      </div>

                      <div className="form-group">
                        <label>Bank Name *</label>
                        <input 
                          type="text"
                          required
                          value={newPayout.payout_details.bank_details.bank_name}
                          onChange={(e) => setNewPayout(prev => ({
                            ...prev,
                            payout_details: {
                              ...prev.payout_details,
                              bank_details: {
                                ...prev.payout_details.bank_details,
                                bank_name: e.target.value
                              }
                            }
                          }))}
                          placeholder="Enter bank name"
                        />
                      </div>

                      <div className="form-group">
                        <label>Branch</label>
                        <input 
                          type="text"
                          value={newPayout.payout_details.bank_details.branch}
                          onChange={(e) => setNewPayout(prev => ({
                            ...prev,
                            payout_details: {
                              ...prev.payout_details,
                              bank_details: {
                                ...prev.payout_details.bank_details,
                                branch: e.target.value
                              }
                            }
                          }))}
                          placeholder="Enter branch name"
                        />
                      </div>
                    </div>
                  )}

                  {newPayout.payout_method === 'upi' && (
                    <div className="form-group">
                      <label>UPI ID *</label>
                      <input 
                        type="text"
                        required
                        value={newPayout.payout_details.upi_details.upi_id}
                        onChange={(e) => setNewPayout(prev => ({
                          ...prev,
                          payout_details: {
                            ...prev.payout_details,
                            upi_details: {
                              ...prev.payout_details.upi_details,
                              upi_id: e.target.value
                            }
                          }
                        }))}
                        placeholder="Enter UPI ID (e.g., username@bank)"
                      />
                    </div>
                  )}

                  {newPayout.payout_method === 'paypal' && (
                    <div className="form-group">
                      <label>PayPal Email *</label>
                      <input 
                        type="email"
                        required
                        value={newPayout.payout_details.paypal_details.email}
                        onChange={(e) => setNewPayout(prev => ({
                          ...prev,
                          payout_details: {
                            ...prev.payout_details,
                            paypal_details: {
                              ...prev.payout_details.paypal_details,
                              email: e.target.value
                            }
                          }
                        }))}
                        placeholder="Enter PayPal email address"
                      />
                    </div>
                  )}

                  {newPayout.payout_method === 'stripe_connect' && (
                    <div className="form-group">
                      <label>Stripe Connect ID *</label>
                      <input 
                        type="text"
                        required
                        value={newPayout.payout_details.stripe_connect_id}
                        onChange={(e) => setNewPayout(prev => ({
                          ...prev,
                          payout_details: {
                            ...prev.payout_details,
                            stripe_connect_id: e.target.value
                          }
                        }))}
                        placeholder="Enter Stripe Connect account ID"
                      />
                    </div>
                  )}

                  {newPayout.payout_method === 'razorpay_x' && (
                    <div className="form-group">
                      <label>Razorpay Contact ID *</label>
                      <input 
                        type="text"
                        required
                        value={newPayout.payout_details.razorpay_contact_id}
                        onChange={(e) => setNewPayout(prev => ({
                          ...prev,
                          payout_details: {
                            ...prev.payout_details,
                            razorpay_contact_id: e.target.value
                          }
                        }))}
                        placeholder="Enter Razorpay contact ID"
                      />
                    </div>
                  )}

                  {newPayout.payout_method === 'manual' && (
                    <div className="form-group full-width">
                      <label>Manual Payout Instructions</label>
                      <textarea 
                        value={newPayout.notes}
                        onChange={(e) => setNewPayout(prev => ({ 
                          ...prev, 
                          notes: e.target.value 
                        }))}
                        placeholder="Add instructions for manual payout"
                        rows="4"
                      />
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={selectedPayments.length === 0}
                  >
                    Create Payout
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payout Details Modal */}
      {showDetailsModal && selectedPayout && (
        <div className="modal-overlay">
          <div className="modal-content wide-modal">
            <div className="modal-header">
              <h2>Payout Details</h2>
              <button 
                className="btn-close" 
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="payout-details">
                {/* Basic Info */}
                <div className="section">
                  <h3>Basic Information</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Payout ID:</span>
                      <span className="detail-value">
                        {selectedPayout.payout_reference}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span 
                        className="detail-value status-badge"
                        style={{ backgroundColor: getStatusColor(selectedPayout.status) }}
                      >
                        {selectedPayout.status}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Total Amount:</span>
                      <span className="detail-value">
                        {formatCurrency(selectedPayout.total_amount, selectedPayout.currency)}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Payment Count:</span>
                      <span className="detail-value">
                        {selectedPayout.payment_count} payments
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Payout Method:</span>
                      <span className="detail-value">
                        {selectedPayout.payout_method.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">
                        {formatDate(selectedPayout.created_at)}
                      </span>
                    </div>

                    {selectedPayout.scheduled_date && (
                      <div className="detail-item">
                        <span className="detail-label">Scheduled:</span>
                        <span className="detail-value">
                          {formatDate(selectedPayout.scheduled_date)}
                        </span>
                      </div>
                    )}

                    {selectedPayout.transaction_id && (
                      <div className="detail-item">
                        <span className="detail-label">Transaction ID:</span>
                        <span className="detail-value">
                          {selectedPayout.transaction_id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Included Payments */}
                {selectedPayout.payments && selectedPayout.payments.length > 0 && (
                  <div className="section">
                    <h3>Included Payments ({selectedPayout.payments.length})</h3>
                    <div className="payments-list compact">
                      {selectedPayout.payments.map(payment => (
                        <div key={payment._id} className="payment-item compact">
                          <div className="payment-info">
                            <span className="payment-campaign">
                              {payment.campaign_title}
                            </span>
                            <span className="payment-details">
                              {payment.influencer_name} • {formatCurrency(payment.amount)}
                            </span>
                          </div>
                          <span className="payment-status">
                            {payment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Influencers */}
                {selectedPayout.influencers && selectedPayout.influencers.length > 0 && (
                  <div className="section">
                    <h3>Influencers ({selectedPayout.influencers.length})</h3>
                    <div className="influencers-list">
                      {selectedPayout.influencers.map(influencer => (
                        <div key={influencer.id} className="influencer-item">
                          <div className="influencer-avatar">
                            {influencer.name.charAt(0)}
                          </div>
                          <div className="influencer-info">
                            <span className="influencer-name">
                              {influencer.name}
                            </span>
                            <span className="influencer-email">
                              {influencer.email}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payout Details */}
                {selectedPayout.payout_details && (
                  <div className="section">
                    <h3>Payment Details</h3>
                    <div className="details-grid">
                      {selectedPayout.payout_details.bank_details && (
                        <>
                          <div className="detail-item full-width">
                            <span className="detail-label">Bank Name:</span>
                            <span className="detail-value">
                              {selectedPayout.payout_details.bank_details.bank_name}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Account Holder:</span>
                            <span className="detail-value">
                              {selectedPayout.payout_details.bank_details.account_holder_name}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Account Number:</span>
                            <span className="detail-value">
                              {selectedPayout.payout_details.bank_details.account_number}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">IFSC Code:</span>
                            <span className="detail-value">
                              {selectedPayout.payout_details.bank_details.ifsc_code}
                            </span>
                          </div>
                        </>
                      )}

                      {selectedPayout.payout_details.upi_details && (
                        <div className="detail-item full-width">
                          <span className="detail-label">UPI ID:</span>
                          <span className="detail-value">
                            {selectedPayout.payout_details.upi_details.upi_id}
                          </span>
                        </div>
                      )}

                      {selectedPayout.payout_details.paypal_details && (
                        <div className="detail-item full-width">
                          <span className="detail-label">PayPal Email:</span>
                          <span className="detail-value">
                            {selectedPayout.payout_details.paypal_details.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedPayout.notes && (
                  <div className="section">
                    <h3>Notes</h3>
                    <div className="notes-content">
                      {selectedPayout.notes}
                    </div>
                  </div>
                )}

                <div className="modal-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleGenerateReport(selectedPayout._id)}
                  >
                    Generate Report
                  </button>
                  {selectedPayout.status === 'pending' && (
                    <button 
                      className="btn btn-success"
                      onClick={() => handleProcessPayout(selectedPayout._id)}
                    >
                      Process Payout
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payout Report Modal */}
      {showPayoutReport && payoutReport && (
        <div className="modal-overlay">
          <div className="modal-content wide-modal">
            <div className="modal-header">
              <h2>Payout Report</h2>
              <button 
                className="btn-close" 
                onClick={() => setShowPayoutReport(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="report-content">
                <div className="report-summary">
                  <div className="summary-item">
                    <span className="summary-label">Total Amount:</span>
                    <span className="summary-value">
                      {formatCurrency(payoutReport.total_amount)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Platform Fee (10%):</span>
                    <span className="summary-value">
                      {formatCurrency(payoutReport.platform_fee)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Influencer Payout:</span>
                    <span className="summary-value highlight">
                      {formatCurrency(payoutReport.influencer_payout)}
                    </span>
                  </div>
                </div>

                <div className="report-section">
                  <h3>Payment Breakdown</h3>
                  <div className="breakdown-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Campaign</th>
                          <th>Influencer</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payoutReport.payments.map(payment => (
                          <tr key={payment._id}>
                            <td>{payment.campaign_title}</td>
                            <td>{payment.influencer_name}</td>
                            <td>{formatCurrency(payment.amount)}</td>
                            <td>{payment.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="report-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      // Print or save report
                      window.print();
                    }}
                  >
                    Print Report
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowPayoutReport(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutsManagement;