// frontend/src/pages/admin/EarningsAnalytics.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import './EarningsAnalytics.css';

const EarningsAnalytics = () => {
  const [summary, setSummary] = useState(null);
  const [topInfluencers, setTopInfluencers] = useState([]);
  const [topBrands, setTopBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [summaryRes, influencersRes, brandsRes] = await Promise.all([
        axios.get('/api/admin/payments/earnings/summary', {
          params: { timeframe },
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/admin/payments/analytics/top-influencers', {
          params: { timeframe, limit: 10 },
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/admin/payments/analytics/top-brands', {
          params: { timeframe, limit: 10 },
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setSummary(summaryRes.data.summary);
      setTopInfluencers(influencersRes.data.top_influencers);
      setTopBrands(brandsRes.data.top_brands);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="earnings-analytics">
      <div className="page-header">
        <h1>Earnings Analytics</h1>
        <div className="timeframe-selector">
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="summary-section">
          <div className="summary-card">
            <h3>Total Earnings</h3>
            <p className="amount">{formatCurrency(summary.total_earnings)}</p>
            <p className="count">{summary.total_count} transactions</p>
          </div>

          <div className="summary-card">
            <h3>Completed</h3>
            <p className="amount">{formatCurrency(summary.completed_amount)}</p>
            <p className="count">{summary.completed_count} payments</p>
          </div>

          <div className="summary-card">
            <h3>Pending</h3>
            <p className="amount">{formatCurrency(summary.pending_amount)}</p>
            <p className="count">{summary.pending_count} payments</p>
          </div>

          <div className="summary-card">
            <h3>Failed</h3>
            <p className="amount">{formatCurrency(summary.failed_amount)}</p>
            <p className="count">{summary.failed_count} payments</p>
          </div>
        </div>
      )}

      {/* Top Influencers */}
      <div className="top-section">
        <h2>Top Influencers</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Influencer</th>
                <th>Total Earnings</th>
                <th>Payments</th>
                <th>Avg Payment</th>
                <th>Last Payment</th>
              </tr>
            </thead>
            <tbody>
              {topInfluencers.map((influencer, index) => (
                <tr key={influencer.influencer_id}>
                  <td>#{index + 1}</td>
                  <td>
                    <div>
                      <strong>{influencer.name}</strong>
                      <br />
                      <small>{influencer.email}</small>
                    </div>
                  </td>
                  <td>{formatCurrency(influencer.total_earnings)}</td>
                  <td>{influencer.payment_count}</td>
                  <td>{formatCurrency(influencer.avg_payment)}</td>
                  <td>{new Date(influencer.last_payment).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Brands */}
      <div className="top-section">
        <h2>Top Brands</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Brand</th>
                <th>Total Spent</th>
                <th>Payments</th>
                <th>Completed</th>
                <th>Avg Payment</th>
              </tr>
            </thead>
            <tbody>
              {topBrands.map((brand, index) => (
                <tr key={brand.brand_id}>
                  <td>#{index + 1}</td>
                  <td>
                    <div>
                      <strong>{brand.name}</strong>
                      <br />
                      <small>{brand.email}</small>
                    </div>
                  </td>
                  <td>{formatCurrency(brand.total_spent)}</td>
                  <td>{brand.payment_count}</td>
                  <td>{brand.completed_payments}</td>
                  <td>{formatCurrency(brand.avg_payment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EarningsAnalytics;