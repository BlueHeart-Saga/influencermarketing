// import React, { useState } from "react";
// import "../style/PaymentAutomation.css";
// import HomeTopBar from "../pages/HomePage/HomeTopBar";

// export default function PaymentAutomation() {
//   const [formData, setFormData] = useState({
//     amount: "",
//     currency: "usd",
//     description: "",
//     paymentType: "collect", // collect or pay
//     recipientEmail: "",
//     campaignId: ""
//   });
  
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [transactionHistory, setTransactionHistory] = useState([
//     { id: 1, date: "2023-04-15", amount: "$1,200.00", recipient: "influencer@example.com", status: "Completed", type: "Payout" },
//     { id: 2, date: "2023-04-10", amount: "$2,500.00", recipient: "brand@example.com", status: "Completed", type: "Collection" },
//     { id: 3, date: "2023-04-05", amount: "$850.00", recipient: "influencer@example.com", status: "Processing", type: "Payout" }
//   ]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");
    
//     // Simulate API call
//     setTimeout(() => {
//       // Add to transaction history
//       const newTransaction = {
//         id: transactionHistory.length + 1,
//         date: new Date().toISOString().split('T')[0],
//         amount: `${formData.currency.toUpperCase()} ${parseFloat(formData.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
//         recipient: formData.recipientEmail || (formData.paymentType === "collect" ? "Campaign Collection" : "Influencer Payout"),
//         status: "Processing",
//         type: formData.paymentType === "collect" ? "Collection" : "Payout"
//       };
      
//       setTransactionHistory(prev => [newTransaction, ...prev]);
//       setMessage(`Payment ${formData.paymentType === "collect" ? "collection" : "payout"} initiated successfully!`);
//       setLoading(false);
      
//       // Reset form
//       setFormData({
//         amount: "",
//         currency: "usd",
//         description: "",
//         paymentType: "collect",
//         recipientEmail: "",
//         campaignId: ""
//       });
//     }, 1500);
//   };

//   const getStatusBadge = (status) => {
//     const statusClass = status === "Completed" ? "status-completed" : 
//                         status === "Processing" ? "status-processing" : "status-failed";
//     return <span className={`status-badge ${statusClass}`}>{status}</span>;
//   };

//   return (
//     <><HomeTopBar />
//     <div className="payment-automation-container">
//       <div className="payment-header">
//         <h1>Payment Automation</h1>
//         <p>Streamline campaign payments and influencer payouts with our secure payment system</p>
//       </div>
      
//       <div className="payment-content">
//         <div className="payment-form-section">
//           <div className="form-card">
//             <h2>Initiate Payment</h2>
            
//             <form onSubmit={handleSubmit}>
//               <div className="form-toggle">
//                 <button 
//                   type="button"
//                   className={formData.paymentType === "collect" ? "active" : ""}
//                   onClick={() => setFormData({...formData, paymentType: "collect"})}
//                 >
//                   <i className="icon-collect"></i>
//                   Collect Payment
//                 </button>
//                 <button 
//                   type="button"
//                   className={formData.paymentType === "pay" ? "active" : ""}
//                   onClick={() => setFormData({...formData, paymentType: "pay"})}
//                 >
//                   <i className="icon-pay"></i>
//                   Send Payment
//                 </button>
//               </div>
              
//               <div className="input-group">
//                 <label htmlFor="amount">Amount</label>
//                 <div className="amount-input">
//                   <select 
//                     name="currency" 
//                     value={formData.currency}
//                     onChange={handleInputChange}
//                   >
//                     <option value="usd">USD ($)</option>
//                     <option value="eur">EUR (€)</option>
//                     <option value="gbp">GBP (£)</option>
//                     <option value="inr">INR (₹)</option>
//                   </select>
//                   <input
//                     id="amount"
//                     name="amount"
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     placeholder="0.00"
//                     value={formData.amount}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>
//               </div>
              
//               <div className="input-group">
//                 <label htmlFor="description">Description</label>
//                 <input
//                   id="description"
//                   name="description"
//                   type="text"
//                   placeholder={formData.paymentType === "collect" ? "Campaign fee collection" : "Influencer payout"}
//                   value={formData.description}
//                   onChange={handleInputChange}
//                 />
//               </div>
              
//               {formData.paymentType === "pay" && (
//                 <div className="input-group">
//                   <label htmlFor="recipientEmail">Recipient Email</label>
//                   <input
//                     id="recipientEmail"
//                     name="recipientEmail"
//                     type="email"
//                     placeholder="recipient@example.com"
//                     value={formData.recipientEmail}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//               )}
              
//               {formData.paymentType === "collect" && (
//                 <div className="input-group">
//                   <label htmlFor="campaignId">Campaign ID (Optional)</label>
//                   <input
//                     id="campaignId"
//                     name="campaignId"
//                     type="text"
//                     placeholder="CAMPAIGN_123"
//                     value={formData.campaignId}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//               )}
              
//               <button 
//                 type="submit" 
//                 className="submit-btn"
//                 disabled={loading || !formData.amount}
//               >
//                 {loading ? (
//                   <>
//                     <span className="spinner"></span>
//                     Processing...
//                   </>
//                 ) : (
//                   <>
//                     <i className={formData.paymentType === "collect" ? "icon-lock" : "icon-send"}></i>
//                     {formData.paymentType === "collect" ? "Request Payment" : "Send Payment"}
//                   </>
//                 )}
//               </button>
              
//               {message && (
//                 <div className="message-success">
//                   <i className="icon-success"></i>
//                   {message}
//                 </div>
//               )}
//             </form>
//           </div>
//         </div>
        
//         <div className="transaction-section">
//           <div className="stats-cards">
//             <div className="stat-card">
//               <div className="stat-icon revenue">
//                 <i className="icon-revenue"></i>
//               </div>
//               <div className="stat-content">
//                 <h3>$12,458.00</h3>
//                 <p>Total Revenue</p>
//               </div>
//             </div>
            
//             <div className="stat-card">
//               <div className="stat-icon payout">
//                 <i className="icon-payout"></i>
//               </div>
//               <div className="stat-content">
//                 <h3>$8,230.00</h3>
//                 <p>Total Payouts</p>
//               </div>
//             </div>
//           </div>
          
//           <div className="transactions-card">
//             <div className="transactions-header">
//               <h2>Recent Transactions</h2>
//               <button className="view-all-btn">View All</button>
//             </div>
            
//             <div className="transactions-list">
//               {transactionHistory.map(transaction => (
//                 <div key={transaction.id} className="transaction-item">
//                   <div className="transaction-info">
//                     <div className="transaction-type">{transaction.type}</div>
//                     <div className="transaction-recipient">{transaction.recipient}</div>
//                     <div className="transaction-date">{transaction.date}</div>
//                   </div>
//                   <div className="transaction-amount">{transaction.amount}</div>
//                   <div className="transaction-status">
//                     {getStatusBadge(transaction.status)}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//     </>
//   );
// }



import React, { useState } from 'react';
import { 
  CreditCard, DollarSign, Send, Download,
  TrendingUp, Users, Clock, CheckCircle,
  AlertCircle, ChevronRight, RefreshCw,
  Shield, FileText, Calendar, Zap,
  Building, Wallet, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
// import HomeTopBar from "../pages/HomePage/HomeTopBar";

export default function PaymentAutomation() {
  const [formData, setFormData] = useState({
    amount: "",
    currency: "usd",
    description: "",
    paymentType: "collect",
    recipientEmail: "",
    campaignId: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("payments");
  const [transactionHistory, setTransactionHistory] = useState([
    { 
      id: 1, 
      date: "2024-04-15", 
      amount: 1200.00, 
      currency: "USD",
      recipient: "influencer@example.com", 
      status: "completed", 
      type: "payout" 
    },
    { 
      id: 2, 
      date: "2024-04-10", 
      amount: 2500.00, 
      currency: "USD",
      recipient: "brand@example.com", 
      status: "completed", 
      type: "collection" 
    },
    { 
      id: 3, 
      date: "2024-04-05", 
      amount: 850.00, 
      currency: "USD",
      recipient: "influencer@example.com", 
      status: "processing", 
      type: "payout" 
    },
    { 
      id: 4, 
      date: "2024-04-01", 
      amount: 5000.00, 
      currency: "USD",
      recipient: "campaign_123", 
      status: "completed", 
      type: "collection" 
    }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    setTimeout(() => {
      const newTransaction = {
        id: transactionHistory.length + 1,
        date: new Date().toISOString().split('T')[0],
        amount: parseFloat(formData.amount) || 0,
        currency: formData.currency,
        recipient: formData.recipientEmail || (formData.paymentType === "collect" ? "Campaign Collection" : "Influencer Payout"),
        status: "processing",
        type: formData.paymentType
      };
      
      setTransactionHistory(prev => [newTransaction, ...prev]);
      setMessage(`${formData.paymentType === "collect" ? "Payment collection" : "Payment payout"} initiated successfully!`);
      setLoading(false);
      
      setFormData({
        amount: "",
        currency: "usd",
        description: "",
        paymentType: "collect",
        recipientEmail: "",
        campaignId: ""
      });
    }, 1500);
  };

  const stats = [
    { 
      title: "Total Revenue", 
      value: "$12,458.00", 
      change: "+12.5%", 
      icon: <TrendingUp size={24} />, 
      color: "#10B981" 
    },
    { 
      title: "Total Payouts", 
      value: "$8,230.00", 
      change: "+8.2%", 
      icon: <Users size={24} />, 
      color: "#3B82F6" 
    },
    { 
      title: "Pending Payments", 
      value: "$1,850.00", 
      change: "-3.1%", 
      icon: <Clock size={24} />, 
      color: "#F59E0B" 
    },
    { 
      title: "Success Rate", 
      value: "98.7%", 
      change: "+0.5%", 
      icon: <CheckCircle size={24} />, 
      color: "#8B5CF6" 
    }
  ];

  const paymentMethods = [
    { name: "Credit Card", icon: <CreditCard size={20} />, status: "active" },
    { name: "Bank Transfer", icon: <Building size={20} />, status: "active" },
    { name: "PayPal", icon: <Wallet size={20} />, status: "active" },
    { name: "Stripe", icon: <Shield size={20} />, status: "pending" }
  ];

  const currencySymbols = {
    usd: "$",
    eur: "€",
    gbp: "£",
    inr: "₹"
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: "#10B981", bgColor: "#D1FAE5", icon: <CheckCircle size={14} /> },
      processing: { color: "#F59E0B", bgColor: "#FEF3C7", icon: <Clock size={14} /> },
      failed: { color: "#EF4444", bgColor: "#FEE2E2", icon: <AlertCircle size={14} /> }
    };
    
    const config = statusConfig[status] || statusConfig.processing;
    
    return (
      <span className="payment-status-badge" style={{ color: config.color, backgroundColor: config.bgColor }}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <>
      {/* <HomeTopBar /> */}
      <div className="payment-wrapper">
        {/* Main Content */}
        <div className="payment-main">
          <div className="payment-container">
            <div className="payment-layout">
              {/* Main Content Area */}
              <main className="payment-content">
                {/* Header */}
                <div className="payment-header-card">
                  <div className="payment-header-content">
                    <div className="payment-header-icon">
                      <CreditCard size={32} />
                    </div>
                    <div>
                      <h1 className="payment-header-title">Payment Automation</h1>
                      <p className="payment-header-subtitle">
                        Streamline campaign payments and influencer payouts with our secure payment system
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="payment-tabs">
                  <button 
                    className={`payment-tab-btn ${activeTab === "payments" ? 'active' : ''}`}
                    onClick={() => setActiveTab("payments")}
                  >
                    <CreditCard size={18} />
                    <span>Initiate Payment</span>
                  </button>
                  <button 
                    className={`payment-tab-btn ${activeTab === "transactions" ? 'active' : ''}`}
                    onClick={() => setActiveTab("transactions")}
                  >
                    <FileText size={18} />
                    <span>Transaction History</span>
                  </button>
                  <button 
                    className={`payment-tab-btn ${activeTab === "methods" ? 'active' : ''}`}
                    onClick={() => setActiveTab("methods")}
                  >
                    <Shield size={18} />
                    <span>Payment Methods</span>
                  </button>
                </div>

                {/* Payments Tab */}
                {activeTab === "payments" && (
                  <div className="payment-processor">
                    <div className="payment-form-card">
                      <div className="payment-form-header">
                        <h2 className="payment-form-title">
                          <Send size={20} />
                          <span>Initiate Payment</span>
                        </h2>
                      </div>
                      
                      <form onSubmit={handleSubmit}>
                        <div className="payment-toggle">
                          <div className="payment-toggle-buttons">
                            <button 
                              type="button"
                              className={`payment-toggle-btn ${formData.paymentType === "collect" ? 'active' : ''}`}
                              onClick={() => setFormData({...formData, paymentType: "collect"})}
                            >
                              <Download size={16} />
                              <span>Collect Payment</span>
                            </button>
                            <button 
                              type="button"
                              className={`payment-toggle-btn ${formData.paymentType === "pay" ? 'active' : ''}`}
                              onClick={() => setFormData({...formData, paymentType: "pay"})}
                            >
                              <Send size={16} />
                              <span>Send Payment</span>
                            </button>
                          </div>
                        </div>
                        
                        <div className="payment-form-grid">
                          <div className="payment-input-group">
                            <label className="payment-input-label">
                              <DollarSign size={16} />
                              <span>Amount</span>
                            </label>
                            <div className="payment-amount-input">
                              <select 
                                name="currency" 
                                value={formData.currency}
                                onChange={handleInputChange}
                                className="payment-currency-select"
                              >
                                <option value="usd">USD ($)</option>
                                <option value="eur">EUR (€)</option>
                                <option value="gbp">GBP (£)</option>
                                <option value="inr">INR (₹)</option>
                              </select>
                              <input
                                name="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={handleInputChange}
                                className="payment-amount-field"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="payment-input-group">
                            <label className="payment-input-label">
                              <FileText size={16} />
                              <span>Description</span>
                            </label>
                            <input
                              name="description"
                              type="text"
                              placeholder={formData.paymentType === "collect" ? "Campaign fee collection" : "Influencer payout"}
                              value={formData.description}
                              onChange={handleInputChange}
                              className="payment-input"
                            />
                          </div>
                          
                          {formData.paymentType === "pay" && (
                            <div className="payment-input-group">
                              <label className="payment-input-label">
                                <Users size={16} />
                                <span>Recipient Email</span>
                              </label>
                              <input
                                name="recipientEmail"
                                type="email"
                                placeholder="recipient@example.com"
                                value={formData.recipientEmail}
                                onChange={handleInputChange}
                                className="payment-input"
                              />
                            </div>
                          )}
                          
                          {formData.paymentType === "collect" && (
                            <div className="payment-input-group">
                              <label className="payment-input-label">
                                <CreditCard size={16} />
                                <span>Campaign ID (Optional)</span>
                              </label>
                              <input
                                name="campaignId"
                                type="text"
                                placeholder="CAMPAIGN_123"
                                value={formData.campaignId}
                                onChange={handleInputChange}
                                className="payment-input"
                              />
                            </div>
                          )}
                        </div>
                        
                        <button 
                          type="submit" 
                          className={`payment-submit-btn ${loading ? 'loading' : ''}`}
                          disabled={loading || !formData.amount}
                        >
                          {loading ? (
                            <>
                              <div className="payment-spinner"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              {formData.paymentType === "collect" ? <Download size={18} /> : <Send size={18} />}
                              <span>{formData.paymentType === "collect" ? "Request Payment" : "Send Payment"}</span>
                            </>
                          )}
                        </button>
                        
                        {message && (
                          <div className="payment-success-message">
                            <CheckCircle size={16} />
                            <span>{message}</span>
                          </div>
                        )}
                      </form>
                    </div>

                    {/* Stats Cards */}
                    <div className="payment-stats-grid">
                      {stats.map((stat, index) => (
                        <div key={index} className="payment-stat-card">
                          <div className="payment-stat-icon" style={{ color: stat.color }}>
                            {stat.icon}
                          </div>
                          <div className="payment-stat-content">
                            <div className="payment-stat-value">{stat.value}</div>
                            <div className="payment-stat-title">{stat.title}</div>
                            <div className="payment-stat-change" style={{ 
                              color: stat.change.startsWith('+') ? '#10B981' : '#EF4444' 
                            }}>
                              {stat.change.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                              <span>{stat.change}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transactions Tab */}
                {activeTab === "transactions" && (
                  <div className="payment-transactions">
                    <div className="payment-transactions-card">
                      <div className="payment-transactions-header">
                        <h2 className="payment-transactions-title">Recent Transactions</h2>
                        <div className="payment-transactions-count">{transactionHistory.length} transactions</div>
                      </div>
                      
                      <div className="payment-transactions-list">
                        {transactionHistory.map(transaction => (
                          <div key={transaction.id} className="payment-transaction-item">
                            <div className="payment-transaction-icon">
                              {transaction.type === "collect" ? 
                                <Download size={20} /> : 
                                <Send size={20} />
                              }
                            </div>
                            <div className="payment-transaction-content">
                              <div className="payment-transaction-main">
                                <div className="payment-transaction-type">
                                  {transaction.type === "collect" ? "Collection" : "Payout"}
                                </div>
                                <div className="payment-transaction-recipient">{transaction.recipient}</div>
                              </div>
                              <div className="payment-transaction-date">
                                <Calendar size={14} />
                                <span>{transaction.date}</span>
                              </div>
                            </div>
                            <div className="payment-transaction-amount">
                              {currencySymbols[transaction.currency]}{transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="payment-transaction-status">
                              {getStatusBadge(transaction.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Methods Tab */}
                {activeTab === "methods" && (
                  <div className="payment-methods">
                    <div className="payment-methods-card">
                      <div className="payment-methods-header">
                        <h2 className="payment-methods-title">Payment Methods</h2>
                        <p className="payment-methods-subtitle">Manage your connected payment methods and gateways</p>
                      </div>
                      
                      <div className="payment-methods-grid">
                        {paymentMethods.map((method, index) => (
                          <div key={index} className="payment-method-card">
                            <div className="payment-method-icon">
                              {method.icon}
                            </div>
                            <div className="payment-method-content">
                              <h3 className="payment-method-name">{method.name}</h3>
                              <div className={`payment-method-status ${method.status}`}>
                                {method.status === "active" ? "Connected" : "Pending"}
                              </div>
                            </div>
                            <button className="payment-method-action">
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </main>

              {/* Sidebar */}
              <aside className="payment-sidebar">
                {/* Quick Stats */}
                <div className="payment-sidebar-section">
                  <h3 className="payment-sidebar-title">Payment Overview</h3>
                  <div className="payment-overview">
                    <div className="payment-overview-item">
                      <div className="payment-overview-icon">
                        <Zap size={16} />
                      </div>
                      <div className="payment-overview-content">
                        <div className="payment-overview-value">42</div>
                        <div className="payment-overview-label">Payments Today</div>
                      </div>
                    </div>
                    <div className="payment-overview-item">
                      <div className="payment-overview-icon">
                        <Clock size={16} />
                      </div>
                      <div className="payment-overview-content">
                        <div className="payment-overview-value">3</div>
                        <div className="payment-overview-label">Pending Review</div>
                      </div>
                    </div>
                    <div className="payment-overview-item">
                      <div className="payment-overview-icon">
                        <CheckCircle size={16} />
                      </div>
                      <div className="payment-overview-content">
                        <div className="payment-overview-value">98.2%</div>
                        <div className="payment-overview-label">Success Rate</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="payment-sidebar-section">
                  <h3 className="payment-sidebar-title">Quick Actions</h3>
                  <div className="payment-actions">
                    <button className="payment-action" onClick={() => setActiveTab("payments")}>
                      <Send size={16} />
                      <span>Send Payment</span>
                    </button>
                    <button className="payment-action" onClick={() => setActiveTab("payments")}>
                      <Download size={16} />
                      <span>Collect Payment</span>
                    </button>
                    <button className="payment-action" onClick={() => {
                      setFormData({
                        amount: "5000",
                        currency: "usd",
                        description: "Campaign sponsorship",
                        paymentType: "collect",
                        recipientEmail: "",
                        campaignId: "CAMPAIGN_789"
                      });
                      setActiveTab("payments");
                    }}>
                      <CreditCard size={16} />
                      <span>Quick Collection</span>
                    </button>
                    <button className="payment-action" onClick={() => {
                      setFormData({
                        amount: "1200",
                        currency: "usd",
                        description: "Influencer payment",
                        paymentType: "pay",
                        recipientEmail: "influencer@example.com",
                        campaignId: ""
                      });
                      setActiveTab("payments");
                    }}>
                      <Users size={16} />
                      <span>Quick Payout</span>
                    </button>
                  </div>
                </div>

                {/* Tips */}
                <div className="payment-sidebar-section">
                  <h3 className="payment-sidebar-title">Payment Tips</h3>
                  <div className="payment-tips">
                    <div className="payment-tip">
                      <Shield size={16} />
                      <span>All payments are secured with 256-bit encryption</span>
                    </div>
                    <div className="payment-tip">
                      <Clock size={16} />
                      <span>Processing time is typically 1-2 business days</span>
                    </div>
                    <div className="payment-tip">
                      <AlertCircle size={16} />
                      <span>Verify recipient details before sending payments</span>
                    </div>
                  </div>
                </div>

                {/* Upcoming Payments */}
                {/* <div className="payment-sidebar-section">
                  <h3 className="payment-sidebar-title">Upcoming Payments</h3>
                  <div className="payment-upcoming">
                    <div className="payment-upcoming-item">
                      <div className="payment-upcoming-date">Apr 20</div>
                      <div className="payment-upcoming-details">
                        <div className="payment-upcoming-recipient">@influencer_jane</div>
                        <div className="payment-upcoming-amount">$1,500.00</div>
                      </div>
                    </div>
                    <div className="payment-upcoming-item">
                      <div className="payment-upcoming-date">Apr 22</div>
                      <div className="payment-upcoming-details">
                        <div className="payment-upcoming-recipient">Campaign #789</div>
                        <div className="payment-upcoming-amount">$3,200.00</div>
                      </div>
                    </div>
                  </div>
                </div> */}
              </aside>
            </div>
          </div>
        </div>

        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          .payment-wrapper { width: 100%; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; }
          
          /* Main Content */
          .payment-main { padding: 40px 0; }
          .payment-container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }
          .payment-layout { display: grid; grid-template-columns: 1fr 350px; gap: 32px; }
          
          /* Content Area */
          .payment-content { display: flex; flex-direction: column; gap: 24px; }
          
          /* Header Card */
          .payment-header-card { background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); border-radius: 12px; padding: 32px; color: white; }
          .payment-header-content { display: flex; align-items: center; gap: 16px; }
          .payment-header-icon { width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
          .payment-header-title { font-size: 28px; font-weight: 700; color: white; margin-bottom: 8px; }
          .payment-header-subtitle { font-size: 16px; color: rgba(255,255,255,0.9); }
          
          /* Tabs */
          .payment-tabs { display: flex; gap: 8px; background: white; padding: 8px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          .payment-tab-btn { flex: 1; padding: 12px 16px; background: transparent; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .payment-tab-btn:hover { background: #f1f5f9; color: #3B82F6; }
          .payment-tab-btn.active { background: #3B82F6; color: white; }
          
          /* Payment Form Card */
          .payment-form-card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .payment-form-header { margin-bottom: 24px; }
          .payment-form-title { font-size: 20px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; }
          
          /* Payment Toggle */
          .payment-toggle { margin-bottom: 24px; }
          .payment-toggle-buttons { display: flex; gap: 8px; }
          .payment-toggle-btn { flex: 1; padding: 12px 16px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .payment-toggle-btn:hover { border-color: #cbd5e1; }
          .payment-toggle-btn.active { background: #3B82F6; border-color: #3B82F6; color: white; }
          
          /* Form Grid */
          .payment-form-grid { display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px; }
          .payment-input-group { display: flex; flex-direction: column; gap: 8px; }
          .payment-input-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #374151; }
          
          /* Amount Input */
          .payment-amount-input { display: flex; gap: 8px; }
          .payment-currency-select { padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; font-weight: 600; color: #374151; background: white; min-width: 100px; }
          .payment-amount-field { flex: 1; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px; font-weight: 600; color: #1e293b; }
          
          .payment-input { padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 15px; transition: 0.2s; }
          .payment-input:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
          
          /* Submit Button */
          .payment-submit-btn { width: 100%; padding: 16px; background: #3B82F6; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .payment-submit-btn:hover:not(:disabled) { background: #2563eb; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
          .payment-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
          .payment-submit-btn.loading { background: #3B82F6; }
          .payment-spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          /* Success Message */
          .payment-success-message { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #d1fae5; border: 1px solid #bbf7d0; border-radius: 8px; color: #059669; font-size: 14px; font-weight: 500; margin-top: 16px; }
          
          /* Stats Grid */
          .payment-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
          .payment-stat-card { background: white; margin: 10px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; display: flex; gap: 16px; align-items: center; }
          .payment-stat-icon { width: 48px; height: 48px; background: #f8fafc; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
          .payment-stat-content { flex: 1; }
          .payment-stat-value { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
          .payment-stat-title { font-size: 13px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
          .payment-stat-change { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; }
          
          /* Transactions */
          .payment-transactions-card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .payment-transactions-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
          .payment-transactions-title { font-size: 20px; font-weight: 700; color: #1e293b; }
          .payment-transactions-count { font-size: 14px; color: #64748b; background: #f1f5f9; padding: 4px 12px; border-radius: 6px; }
          
          .payment-transactions-list { display: flex; flex-direction: column; gap: 12px; }
          .payment-transaction-item { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
          .payment-transaction-icon { width: 40px; height: 40px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #3B82F6; }
          .payment-transaction-content { flex: 1; }
          .payment-transaction-main { display: flex; gap: 8px; align-items: center; margin-bottom: 4px; }
          .payment-transaction-type { font-size: 14px; font-weight: 600; color: #1e293b; }
          .payment-transaction-recipient { font-size: 14px; color: #64748b; }
          .payment-transaction-date { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #94a3b8; }
          
          .payment-transaction-amount { font-size: 16px; font-weight: 700; color: #1e293b; margin-right: 16px; }
          
          .payment-status-badge { display: flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
          
          /* Payment Methods */
          .payment-methods-card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .payment-methods-header { margin-bottom: 32px; }
          .payment-methods-title { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
          .payment-methods-subtitle { font-size: 15px; color: #64748b; }
          
          .payment-methods-grid { display: flex; flex-direction: column; gap: 12px; }
          .payment-method-card { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
          .payment-method-icon { width: 40px; height: 40px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #3B82F6; }
          .payment-method-content { flex: 1; }
          .payment-method-name { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 4px; }
          .payment-method-status { font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 4px; display: inline-block; }
          .payment-method-status.active { background: #d1fae5; color: #059669; }
          .payment-method-status.pending { background: #fef3c7; color: #d97706; }
          
          .payment-method-action { background: transparent; border: none; color: #94a3b8; cursor: pointer; }
          
          /* Sidebar */
          .payment-sidebar { position: sticky; top: 20px; height: fit-content; display: flex; flex-direction: column; gap: 20px; }
          
          /* Sidebar Sections */
          .payment-sidebar-section { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          .payment-sidebar-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
          
          /* Overview */
          .payment-overview { display: flex; flex-direction: column; gap: 16px; }
          .payment-overview-item { display: flex; gap: 12px; align-items: center; }
          .payment-overview-icon { width: 32px; height: 32px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #3B82F6; }
          .payment-overview-content { flex: 1; }
          .payment-overview-value { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 2px; }
          .payment-overview-label { font-size: 13px; color: #64748b; }
          
          /* Actions */
          .payment-actions { display: flex; flex-direction: column; gap: 8px; }
          .payment-action { padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; gap: 12px; color: #475569; font-size: 14px; cursor: pointer; transition: 0.2s; }
          .payment-action:hover { background: #e2e8f0; border-color: #cbd5e1; color: #3B82F6; }
          
          /* Tips */
          .payment-tips { display: flex; flex-direction: column; gap: 12px; }
          .payment-tip { display: flex; gap: 12px; }
          .payment-tip svg { color: #F59E0B; flex-shrink: 0; margin-top: 2px; }
          .payment-tip span { font-size: 13px; color: #64748b; }
          
          /* Upcoming Payments */
          .payment-upcoming { display: flex; flex-direction: column; gap: 12px; }
          .payment-upcoming-item { display: flex; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 8px; }
          .payment-upcoming-date { width: 40px; height: 40px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #3B82F6; font-size: 12px; font-weight: 600; }
          .payment-upcoming-details { flex: 1; }
          .payment-upcoming-recipient { font-size: 14px; font-weight: 600; color: #1e293b
.payment-upcoming-amount { font-size: 14px; color: #64748b; font-weight: 600; }

/* Responsive Design */
@media (max-width: 1200px) {
  .payment-stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 992px) {
  .payment-layout { grid-template-columns: 1fr; }
  .payment-sidebar { position: static; margin-top: 32px; }
}

@media (max-width: 768px) {
  .payment-main { padding: 20px 0; }
  .payment-container { padding: 0 16px; }
  .payment-header-card { padding: 24px; }
  .payment-header-content { flex-direction: column; text-align: center; }
  .payment-header-icon { width: 56px; height: 56px; }
  .payment-header-title { font-size: 24px; }
  .payment-tabs { flex-direction: column; }
  .payment-tab-btn { width: 100%; }
  .payment-form-card, .payment-transactions-card, .payment-methods-card { padding: 24px; }
  .payment-stats-grid { grid-template-columns: 1fr; }
  .payment-transaction-item { flex-direction: column; align-items: flex-start; gap: 12px; }
  .payment-transaction-amount { margin-right: 0; align-self: flex-end; }
  .payment-transaction-status { align-self: flex-start; }
}

/* Additional Styling */
input:focus, select:focus, button:focus { outline: none; }

.payment-submit-btn:active:not(:disabled) { transform: translateY(0); }

.payment-method-card:hover { background: #f1f5f9; border-color: #cbd5e1; }

.payment-transaction-item:hover { background: #f1f5f9; border-color: #cbd5e1; }

/* Scrollbar Styling */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #f1f5f9; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .payment-submit-btn { transition: none; }
  .payment-tab-btn, .payment-toggle-btn, .payment-action { transition: none; }
}

/* Print Styles */
@media print {
  .payment-tabs, .payment-action, .payment-method-action, .payment-submit-btn { display: none; }
  .payment-header-card { background: white; color: #1e293b; }
  .payment-header-icon { background: #f1f5f9; color: #3B82F6; }
  .payment-stat-card, .payment-transaction-item, .payment-method-card { border: 1px solid #cbd5e1; }
}
          `}</style>
      </div>
    </>
  );
}