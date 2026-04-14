import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { campaignAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { CurrencyContext } from '../../context/CurrencyContext'; // Adjust path as needed
import InfluencerCampaigns from './InfluencerCampaigns';
import InfluencerApplications from './InfluencerApplications';
import AITools from "./AITools";
import InfluencerAnalytics from "./InfluencerAnalytics";
import {
  FiSearch,
  FiX,
  FiRefreshCw,
  FiAlertCircle,
  FiGrid,
  FiInbox,
  FiCheckCircle,
  FiTrendingUp,
  FiBell,
  FiPieChart,
  FiZap,
  FiCpu,
  FiDollarSign,
  FiUsers,
  FiFileText,
  FiMessageSquare,
  FiGlobe,
  FiChevronDown,
  FiClock,
  FiCreditCard,
  FiSend,
  FiXCircle,
  FiCheck,
  FiAward
} from 'react-icons/fi';
import '../../style/InfluencerDashboard.css';
import axios from "axios";
import { formatCurrency as globalFormatCurrency } from '../../utils/formatters';

import API_BASE_URL from "../../config/api";

// Currency symbols mapping (keep your existing CURRENCY_SYMBOLS, CURRENCY_NAMES, POPULAR_CURRENCIES)
const CURRENCY_SYMBOLS = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  SGD: 'S$',
  HKD: 'HK$',
  KRW: '₩',
  RUB: '₽',
  TRY: '₺',
  BRL: 'R$',
  MXN: '$',
  AED: 'د.إ',
  SAR: 'ر.س',
  ZAR: 'R'
};

const CURRENCY_NAMES = {
  USD: 'US Dollar',
  GBP: 'British Pound',
  EUR: 'Euro',
  JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan',
  INR: 'Indian Rupee',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone',
  DKK: 'Danish Krone',
  SGD: 'Singapore Dollar',
  HKD: 'Hong Kong Dollar',
  KRW: 'South Korean Won',
  RUB: 'Russian Ruble',
  TRY: 'Turkish Lira',
  BRL: 'Brazilian Real',
  MXN: 'Mexican Peso',
  AED: 'UAE Dirham',
  SAR: 'Saudi Riyal',
  ZAR: 'South African Rand'
};

const POPULAR_CURRENCIES = ['USD', 'GBP', 'EUR', 'JPY', 'CAD', 'AUD', 'INR'];

// Currency Converter Component
const InfluencerCurrencyConverter = ({
  selectedCurrency,
  onCurrencyChange,
  earnings,
  rates
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllCurrencies, setShowAllCurrencies] = useState(false);
  const dropdownRef = useRef(null);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const calculateEarningsInCurrency = () => {
    if (!earnings || !rates || !selectedCurrency) return 0;
    const earningsAmount = typeof earnings === 'number' ? earnings : parseFloat(earnings) || 0;
    if (rates[selectedCurrency]) {
      return earningsAmount * rates[selectedCurrency];
    }
    return earningsAmount;
  };

  const convertedEarnings = calculateEarningsInCurrency();

  const filteredCurrencies = Object.keys(CURRENCY_SYMBOLS).filter(currencyCode => {
    if (!searchTerm) return true;
    return (
      currencyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      CURRENCY_NAMES[currencyCode]?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatCurrency = (amount, currencyCode) => {
    return globalFormatCurrency(amount, currencyCode, CURRENCY_SYMBOLS);
  };

  return (
    <div className="influencer-currency-converter" ref={dropdownRef}>
      <div className="influencer-currency-header">
        <div className="influencer-currency-display">
          <div className="influencer-currency-label">
            <FiGlobe size={14} />
            <span>Currency:</span>
          </div>
          <div className="influencer-currency-selector">
            <button
              className="influencer-currency-toggle"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="influencer-currency-symbol">
                {CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency}
              </span>
              <span className="influencer-currency-code">{selectedCurrency}</span>
              <FiChevronDown size={16} className={isOpen ? 'influencer-rotate-180' : ''} />
            </button>

            {isOpen && (
              <div className="influencer-currency-dropdown influencer-drop-shadow">
                <div className="influencer-currency-search">
                  <FiSearch size={14} />
                  <input
                    type="text"
                    placeholder="Search currency..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="influencer-currency-search-input"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="influencer-clear-search"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </div>

                <div className="influencer-currency-section">
                  <div className="influencer-currency-section-title">Popular</div>
                  <div className="influencer-currency-grid">
                    {POPULAR_CURRENCIES.map(currencyCode => (
                      <button
                        key={currencyCode}
                        className={`influencer-currency-option ${selectedCurrency === currencyCode ? 'influencer-currency-selected' : ''}`}
                        onClick={() => {
                          onCurrencyChange(currencyCode);
                          setIsOpen(false);
                          setSearchTerm('');
                        }}
                      >
                        <span className="influencer-currency-option-symbol">
                          {CURRENCY_SYMBOLS[currencyCode] || currencyCode}
                        </span>
                        <span className="influencer-currency-option-code">{currencyCode}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="influencer-currency-section">
                  <div className="influencer-currency-section-title">
                    All Currencies
                    <button
                      className="influencer-show-all-btn"
                      onClick={() => setShowAllCurrencies(!showAllCurrencies)}
                    >
                      {showAllCurrencies ? 'Show Less' : 'Show All'}
                    </button>
                  </div>
                  <div className="influencer-currency-list">
                    {(showAllCurrencies ? filteredCurrencies : filteredCurrencies.slice(0, 10)).map(currencyCode => (
                      <button
                        key={currencyCode}
                        className={`influencer-currency-option ${selectedCurrency === currencyCode ? 'influencer-currency-selected' : ''}`}
                        onClick={() => {
                          onCurrencyChange(currencyCode);
                          setIsOpen(false);
                          setSearchTerm('');
                        }}
                      >
                        <span className="influencer-currency-option-symbol">
                          {CURRENCY_SYMBOLS[currencyCode] || currencyCode}
                        </span>
                        <div className="influencer-currency-option-details">
                          <span className="influencer-currency-option-code">{currencyCode}</span>
                          <span className="influencer-currency-option-name">
                            {CURRENCY_NAMES[currencyCode] || currencyCode}
                          </span>
                        </div>
                        {rates && rates[currencyCode] && (
                          <span className="influencer-currency-rate">
                            1 GBP = {(rates[currencyCode]).toFixed(2)} {currencyCode}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Search Results Component
const SearchResults = ({ results, onResultClick, searchQuery }) => {
  const navigate = useNavigate();
  const resultsRef = useRef(null);

  const getResultIcon = (type) => {
    const icons = {
      campaign: FiZap,
      application: FiInbox,
      tool: FiCpu,
      analytics: FiPieChart,
      earnings: FiDollarSign,
      message: FiMessageSquare,
      profile: FiUsers,
      contract: FiFileText
    };
    const IconComponent = icons[type] || FiSearch;
    return <IconComponent size={16} />;
  };

  const getResultColor = (type) => {
    const colors = {
      campaign: '#3B82F6',
      application: '#F59E0B',
      tool: '#8B5CF6',
      analytics: '#06B6D4',
      earnings: '#10B981',
      message: '#EC4899',
      profile: '#6366F1',
      contract: '#F97316'
    };
    return colors[type] || '#6B7280';
  };

  const handleResultClick = (result) => {
    if (onResultClick) {
      onResultClick(result);
    }
  };

  if (results.length === 0) {
    return (
      <div className="influencer-search-results" ref={resultsRef}>
        <div className="influencer-no-results">
          <FiSearch size={24} />
          <p>No results found for "{searchQuery}"</p>
          <span>Try searching for campaigns, applications, or tools</span>
        </div>
      </div>
    );
  }

  return (
    <div className="influencer-search-results" ref={resultsRef}>
      <div className="influencer-search-results-header">
        <h4>Search Results</h4>
        <span>{results.length} results</span>
      </div>
      <div className="influencer-search-results-list">
        {results.map((result, index) => (
          <div
            key={index}
            className="influencer-search-result-item"
            onClick={() => handleResultClick(result)}
          >
            <div
              className="influencer-result-type-icon"
              style={{ backgroundColor: `${getResultColor(result.type)}15` }}
            >
              {getResultIcon(result.type)}
            </div>
            <div className="influencer-result-content">
              <h4>{result.title}</h4>
              <p>{result.description}</p>
              <div className="influencer-result-meta">
                <span
                  className="influencer-result-type-badge"
                  style={{ color: getResultColor(result.type) }}
                >
                  {result.type}
                </span>
                {result.status && (
                  <span className={`influencer-result-status influencer-status-${result.status}`}>
                    {result.status}
                  </span>
                )}
              </div>
            </div>
            <div className="influencer-result-action">
              <span className="influencer-result-cta">
                {result.action || 'View'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Search Bar Component
const EnhancedSearchBar = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  onSearchSubmit,
  showResults,
  searchResults,
  onResultClick,
  onOutsideClick
}) => {
  const searchRef = useRef(null);

  // Handle outside click to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        onOutsideClick();
      }
    };

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResults, onOutsideClick]);

  return (
    <div className="influencer-search-container" ref={searchRef}>
      <form onSubmit={onSearchSubmit} className="influencer-search-form">
        <div className="influencer-search-input-wrapper">
          <FiSearch className="influencer-search-icon" />
          <input
            type="text"
            placeholder="AI Search: Find campaigns, analytics, tools, applications..."
            value={searchQuery}
            onChange={onSearchChange}
            className="influencer-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="influencer-clear-search"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      </form>

      {showResults && (
        <SearchResults
          results={searchResults}
          onResultClick={onResultClick}
          searchQuery={searchQuery}
        />
      )}
    </div>
  );
};

// StatCard Component
const StatCard = ({ label, value, icon: Icon, color, subtitle, currency }) => {
  const { currency: selectedCurrency, rates } = useContext(CurrencyContext);

  const formatCurrencyValue = (valueString) => {
    if (!valueString) return valueString;
    if (typeof valueString === 'string' && (valueString.startsWith('$') || /\d+[.,]\d{2}/.test(valueString))) {
      const amount = parseFloat(valueString.replace(/[^0-9.-]+/g, '')) || 0;
      if (rates && selectedCurrency && rates[selectedCurrency]) {
        const convertedAmount = amount * rates[selectedCurrency];
        return globalFormatCurrency(convertedAmount, selectedCurrency, CURRENCY_SYMBOLS);
      }
    }
    return valueString;
  };

  const formattedValue = currency ? formatCurrencyValue(value) : value;

  return (
    <div className="influencer-stat-card">
      <div className="influencer-stat-icon-container" style={{ backgroundColor: `${color}15` }}>
        <Icon size={20} color={color} />
      </div>
      <div className="influencer-stat-content">
        <h3>{formattedValue}</h3>
        <p className="influencer-stat-label">{label}</p>
        {subtitle && <span className="influencer-stat-subtitle">{subtitle}</span>}
        {currency && selectedCurrency && (
          <span className="influencer-currency-indicator">{selectedCurrency}</span>
        )}
      </div>
    </div>
  );
};

// Main Dashboard Component
const InfluencerDashboard = () => {
  const [activeTab, setActiveTab] = useState('aitools');
  const [applications, setApplications] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [earningsSummary, setEarningsSummary] = useState({
    total_earnings: 0,
    available_balance: 0,
    pending_earnings: 0,
    completed_withdrawals: 0
  });

  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const activityDropdownRef = useRef(null);

  const navigate = useNavigate();
  const { currency, changeCurrency, rates } = useContext(CurrencyContext);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    earnings: totalEarnings
  });

  // Fetch notifications count
  const fetchNotificationCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/influencer/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Calculate unread count from notifications
        const unread = (data.notifications || []).filter(n => !n.is_read).length;
        setUnreadNotificationCount(unread);
      }
    } catch (err) {
      console.error('Error fetching notification count:', err);
    }
  }, []);

  // Fetch earnings summary
  const fetchEarningsSummary = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(
        `${API_BASE_URL}/api/earnings/summary`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEarningsSummary(res.data || {});
    } catch (err) {
      console.error("Failed to load earnings summary", err);
    }
  };

  useEffect(() => {
    fetchEarningsSummary();
    fetchNotificationCount();

    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(fetchNotificationCount, 30000);

    return () => clearInterval(interval);
  }, [fetchNotificationCount]);

  // Outside click for activity dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activityDropdownRef.current && !activityDropdownRef.current.contains(event.target)) {
        setShowActivityDropdown(false);
      }
    };
    if (showActivityDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActivityDropdown]);

  const convert = (amount) => {
    if (!rates || !currency || !rates[currency]) return amount;
    return amount * rates[currency];
  };

  // Format currency helper
  const formatCurrency = (amount, currencyCode = currency) => {
    return globalFormatCurrency(amount, currencyCode, CURRENCY_SYMBOLS);
  };

  // Calculate earnings in selected currency
  const calculateEarnings = () => {
    if (rates && currency && rates[currency]) {
      return totalEarnings * rates[currency];
    }
    return totalEarnings;
  };

  // Fetch applications and campaigns
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await campaignAPI.getInfluencerApplications();

      let applicationsData = [];
      if (response.data) {
        applicationsData = response.data;
      } else if (Array.isArray(response)) {
        applicationsData = response;
      } else if (response && typeof response === 'object') {
        applicationsData = response.applications || response.data || [];
      }

      setApplications(Array.isArray(applicationsData) ? applicationsData : []);

    } catch (err) {
      console.error('Fetch error:', err);
      const errorMessage = err.response?.data?.message ||
        err.message ||
        'Failed to fetch applications. Please try again.';
      setError(errorMessage);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await campaignAPI.getAvailableCampaigns();
      setCampaigns(response.data || []);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchCampaigns();
  }, []);

  // Calculate stats
  useEffect(() => {
    if (!applications || !Array.isArray(applications)) {
      setStats(prev => ({
        ...prev,
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0
      }));
      return;
    }

    const pending = applications.filter(app =>
      app.status?.toLowerCase() === 'pending'
    ).length;

    const accepted = applications.filter(app =>
      ['approved', 'accepted', 'hired', 'contracted'].includes(app.status?.toLowerCase())
    ).length;

    const rejected = applications.filter(app =>
      ['rejected', 'declined'].includes(app.status?.toLowerCase())
    ).length;

    const earningsInCurrency = calculateEarnings();

    setStats(prev => ({
      ...prev,
      total: applications.length,
      pending,
      accepted,
      rejected,
      earnings: earningsInCurrency
    }));
  }, [applications, currency, rates, totalEarnings]);

  // Enhanced search functionality
  const performSearch = useCallback((query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = [];

    // Search campaigns
    campaigns.forEach(campaign => {
      if (
        campaign.title?.toLowerCase().includes(lowerQuery) ||
        campaign.description?.toLowerCase().includes(lowerQuery) ||
        campaign.category?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: 'campaign',
          title: campaign.title,
          description: campaign.description?.substring(0, 100) + '...',
          id: campaign._id || campaign.id,
          action: 'View Campaign',
          route: '/influencer/campaigns'
        });
      }
    });

    // Search applications
    applications.forEach(app => {
      const campaignTitle = app.campaign_title || app.campaignName || 'Campaign';
      if (
        campaignTitle.toLowerCase().includes(lowerQuery) ||
        app.status?.toLowerCase().includes(lowerQuery) ||
        app.message?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: 'application',
          title: `Application: ${campaignTitle}`,
          description: `Status: ${app.status} - ${app.message?.substring(0, 80) || 'No message'}...`,
          id: app._id || app.id,
          status: app.status,
          action: 'View Application',
          route: '/influencer/campaigns/requests'
        });
      }
    });

    // Search tools and features
    const toolsAndFeatures = [
      {
        type: 'tool',
        title: 'AI Content Creator',
        description: 'Generate engaging content with AI assistance',
        route: '/influencer/aitools/aicontentcreator'
      },
      {
        type: 'tool',
        title: 'Fast Post Generator',
        description: 'Quickly create social media posts',
        route: '/influencer/aitools/fastpost'
      },
      {
        type: 'tool',
        title: 'AI Hashtag Generator',
        description: 'Find the best hashtags for your content',
        route: '/influencer/aitools/aihashtag'
      },
      {
        type: 'tool',
        title: 'Earnings Calculator',
        description: 'Calculate your potential earnings',
        route: '/influencer/aitools/aicalculator'
      },
      {
        type: 'analytics',
        title: 'Performance Analytics',
        description: 'View your campaign performance metrics',
        route: '/influencer/analytics'
      },
      {
        type: 'earnings',
        title: 'Earnings Dashboard',
        description: 'Track your income and payments',
        route: '/influencer/earnings'
      },
      {
        type: 'message',
        title: 'Collaborations',
        description: 'Manage your brand collaborations and messages',
        route: '/influencer/collaborations'
      },
      {
        type: 'contract',
        title: 'Agreements & Contracts',
        description: 'View and manage your contracts',
        route: '/influencer/agreements'
      }
    ];

    toolsAndFeatures.forEach(item => {
      if (
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.type.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          ...item,
          action: 'Open'
        });
      }
    });

    setSearchResults(results.slice(0, 10));
  }, [campaigns, applications]);

  // Search handlers
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      setShowSearchResults(true);
      performSearch(query);
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  // Handle outside click on search results
  const handleOutsideClick = () => {
    setShowSearchResults(false);
  };

  // Handle search result clicks
  const handleResultClick = (result) => {
    setShowSearchResults(false);
    setSearchQuery('');

    if (result.route) {
      navigate(result.route);
      if (result.route === '/influencer/campaigns') {
        setActiveTab('InfluencerCampaigns');
      } else if (result.route === '/influencer/campaigns/requests') {
        setActiveTab('myApplications');
      } else if (result.route.includes('/influencer/aitools')) {
        setActiveTab('aitools');
      } else if (result.route === '/influencer/analytics') {
        setActiveTab('analytics');
      }
    }
  };

  const handleApplicationUpdate = () => {
    fetchApplications();
  };

  // Loading and Error states
  if (loading) return (
    <div className="influencer-dashboard-loader">
      <div className="influencer-loader-spinner"></div>
      <p>Loading your dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="influencer-dashboard-error">
      <div className="influencer-error-icon">
        <FiAlertCircle size={48} />
      </div>
      <h3>Something went wrong</h3>
      <p>{error}</p>
      <div className="influencer-error-actions">
        <button className="influencer-btn-secondary" onClick={() => window.location.reload()}>
          Refresh Page
        </button>
        <button className="influencer-btn-primary" onClick={fetchApplications}>
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="influencer-dashboard">
      {/* Enhanced Header with Real Search, Currency Converter, and Notification Badge */}
      <header className="influencer-dashboard-header">
        <div className="influencer-header-content">
          <div className="influencer-header-brand">
            <h1>Influencer Dashboard</h1>
            <p className="influencer-header-subtitle">Manage your campaigns and analytics</p>
          </div>

          <div className="influencer-header-controls">
            {/* Currency Converter */}
            <div className="influencer-currency-wrapper">
              <InfluencerCurrencyConverter
                selectedCurrency={currency}
                onCurrencyChange={changeCurrency}
                earnings={totalEarnings}
                rates={rates}
              />
            </div>

            {/* Search Bar */}
            <EnhancedSearchBar
              searchQuery={searchQuery}
              onSearchChange={handleSearch}
              onClearSearch={clearSearch}
              onSearchSubmit={handleSearchSubmit}
              showResults={showSearchResults}
              searchResults={searchResults}
              onResultClick={handleResultClick}
              onOutsideClick={handleOutsideClick}
            />

            <div className="influencer-header-actions">
              {/* Notification Bell with Unread Badge - EXACTLY LIKE BRANDDASHBOARD */}
              <button
                className="influencer-btn-icon influencer-notification-btn"
                aria-label="Notifications"
                onClick={() => navigate("/influencer/notification")}
                style={{ position: 'relative' }}
              >
                <FiBell size={18} />
                {unreadNotificationCount > 0 && (
                  <span
                    className="influencer-notification-badge"
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: '600',
                      minWidth: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                      border: '2px solid white'
                    }}
                  >
                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                  </span>
                )}
              </button>
              <button
                className="influencer-btn-refresh"
                onClick={() => {
                  fetchApplications();
                  fetchNotificationCount();
                }}
              >
                <FiRefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="influencer-stats-section">
        <div className="influencer-stats-grid">
          <StatCard
            label="Total Applications"
            value={stats.total}
            icon={FiGrid}
            color="#3B82F6"
            subtitle="All time"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={FiInbox}
            color="#F59E0B"
            subtitle="Awaiting review"
          />
          <StatCard
            label="Accepted"
            value={stats.accepted}
            icon={FiCheckCircle}
            color="#10B981"
            subtitle="Active campaigns"
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            icon={FiAlertCircle}
            color="#EF4444"
            subtitle="Not selected"
          />
          <StatCard
            label="Total Earnings"
            value={formatCurrency(convert(earningsSummary.total_earnings))}
            icon={FiDollarSign}
            color="#10B981"
            subtitle="All time"
            currency
          />
          <StatCard
            label="Available Balance"
            value={formatCurrency(convert(earningsSummary.available_balance))}
            icon={FiCreditCard}
            color="#3B82F6"
            subtitle="Ready to withdraw"
            currency
          />
          <StatCard
            label="Pending Earnings"
            value={formatCurrency(convert(earningsSummary.pending_earnings))}
            icon={FiClock}
            color="#F59E0B"
            subtitle="Awaiting clearance"
            currency
          />
          <StatCard
            label="Success Rate"
            value={stats.total > 0 ? `${Math.round((stats.accepted / stats.total) * 100)}%` : '0%'}
            icon={FiTrendingUp}
            color="#06B6D4"
            subtitle="Application success"
          />
        </div>
      </section>

      {/* Influencer Recent Activity - Brand-level Design System */}
      <section className="inf-ra-section">
        <div className="inf-ra-card">
          {/* Section Header */}
          <div className="inf-ra-header">
            <div className="inf-ra-header-left">
              <div className="inf-ra-header-icon">
                <FiAward size={18} />
              </div>
              <div>
                <h2 className="inf-ra-title">Recent Activity</h2>
                <p className="inf-ra-subtitle">Your latest collaboration updates</p>
              </div>
            </div>
            {applications.length > 5 && (
              <button
                className="inf-ra-view-more-btn"
                onClick={() => setShowActivityDropdown(true)}
              >
                View All
              </button>
            )}
          </div>

          {/* Activity Feed */}
          <div className="inf-ra-list">
            {applications.length === 0 ? (
              <div className="inf-ra-empty">
                <FiInbox size={32} />
                <p>No recent activity yet</p>
                <span>Your collaboration updates will appear here</span>
              </div>
            ) : (
              applications.slice(0, 3).map((app, index) => {
                const status = app.status?.toLowerCase();
                const isAccepted = ['approved', 'accepted', 'hired', 'contracted'].includes(status);
                const isRejected = ['rejected', 'declined'].includes(status);
                const isPending = status === 'pending';

                const ActivityIcon = isAccepted ? FiCheck : isRejected ? FiXCircle : FiSend;
                const activityLabel = isAccepted
                  ? 'Application Accepted'
                  : isRejected
                    ? 'Application Rejected'
                    : 'Application Submitted';
                const iconStatusKey = isAccepted ? 'accepted' : isRejected ? 'rejected' : 'pending';

                return (
                  <div key={index} className={`inf-ra-item inf-ra-item--${iconStatusKey}`}>
                    {/* Activity Icon */}
                    <div className={`inf-ra-icon inf-ra-icon--${iconStatusKey}`}>
                      <ActivityIcon size={16} />
                    </div>

                    {/* Activity Content */}
                    <div className="inf-ra-content">
                      <div className="inf-ra-content-top">
                        <span className="inf-ra-type-label">{activityLabel}</span>
                        <span className={`inf-ra-badge inf-ra-badge--${iconStatusKey}`}>
                          {isAccepted ? <FiCheck size={11} /> : isRejected ? <FiXCircle size={11} /> : <FiClock size={11} />}
                          {app.status}
                        </span>
                      </div>
                      <p className="inf-ra-campaign-name">
                        {app.campaign_title || app.title || 'Campaign'}
                      </p>
                      <div className="inf-ra-meta">
                        <span className="inf-ra-meta-date">
                          <FiClock size={11} />
                          {new Date(app.applied_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </span>
                        {(app.brand_profile_name || app.brand_name) && (
                          <span className="inf-ra-meta-brand">
                            <FiUsers size={11} />
                            {app.brand_profile_name || app.brand_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer view-more */}
          {applications.length > 3 && (
            <div className="inf-ra-footer">
              <button
                className="inf-ra-footer-btn"
                onClick={() => setShowActivityDropdown(true)}
              >
                View {applications.length - 3} more activities
              </button>
            </div>
          )}
        </div>

        {/* Expanded Dropdown */}
        {showActivityDropdown && (
          <div className="inf-ra-dropdown inf-ra-dropdown-shadow" ref={activityDropdownRef}>
            <div className="inf-ra-dropdown-header">
              <div className="inf-ra-dropdown-title">
                <FiAward size={16} />
                <h4>All Recent Activity</h4>
              </div>
              <button className="inf-ra-close-btn" onClick={() => setShowActivityDropdown(false)}>
                <FiX size={14} />
              </button>
            </div>

            <div className="inf-ra-dropdown-list">
              {applications.slice(0, 20).map((app, index) => {
                const status = app.status?.toLowerCase();
                const isAccepted = ['approved', 'accepted', 'hired', 'contracted'].includes(status);
                const isRejected = ['rejected', 'declined'].includes(status);
                const ActivityIcon = isAccepted ? FiCheck : isRejected ? FiXCircle : FiSend;
                const iconStatusKey = isAccepted ? 'accepted' : isRejected ? 'rejected' : 'pending';

                return (
                  <div key={index} className="inf-ra-dropdown-row">
                    <div className={`inf-ra-icon inf-ra-icon--${iconStatusKey}`}>
                      <ActivityIcon size={14} />
                    </div>
                    <div className="inf-ra-dropdown-info">
                      <p className="inf-ra-dropdown-campaign">
                        {app.campaign_title || app.title || 'Campaign'}
                      </p>
                      <div className="inf-ra-dropdown-meta">
                        <span>{new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        {(app.brand_profile_name || app.brand_name) && (
                          <span>· {app.brand_profile_name || app.brand_name}</span>
                        )}
                      </div>
                    </div>
                    <span className={`inf-ra-badge inf-ra-badge--${iconStatusKey}`}>
                      {app.status}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="inf-ra-dropdown-footer">
              <button
                className="inf-ra-dropdown-footer-btn"
                onClick={() => navigate('/influencer/activity')}
              >
                Visit full activity page
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Main Content */}
      <main style={{
        padding: '24px 0',
        backgroundColor: '#ffffff',
        minHeight: '100vh'
      }}>
        {/* Section Header */}
        <div style={{
          marginBottom: '32px',
          maxWidth: '1200px',
          margin: '0 auto 32px auto',
          padding: '0 24px'
        }}>
          <h2 style={{
            fontSize: 'clamp(24px, 5vw, 32px)',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '8px',
            letterSpacing: '-0.025em',
            lineHeight: '1.2'
          }}>
            Campaign Management
          </h2>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            color: '#666666',
            margin: 0,
            lineHeight: '1.5',
            maxWidth: '600px'
          }}>
            Manage your applications and discover new opportunities
          </p>
        </div>

        {/* Dashboard Tabs */}
        <div style={{
          marginBottom: '32px',
          maxWidth: '1200px',
          margin: '0 auto 32px auto',
          padding: '0 24px'
        }}>
          <div style={{
            padding: '6px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            <style>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            <div style={{
              display: 'flex',
              gap: '4px',
              minWidth: 'fit-content'
            }}>
              {[
                {
                  id: 'InfluencerCampaigns',
                  label: 'Available Campaigns',
                  icon: FiZap,
                  color: '#2563eb'
                },
                {
                  id: 'myApplications',
                  label: 'My Applications',
                  icon: FiInbox,
                  color: '#2563eb',
                  badge: stats.pending,
                  badgeColor: '#dc2626'
                },
                {
                  id: 'aitools',
                  label: 'AI Tools',
                  icon: FiCpu,
                  color: '#2563eb',
                  newBadge: true
                },
                {
                  id: 'analytics',
                  label: 'Analytics',
                  icon: FiPieChart,
                  color: '#2563eb'
                }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 24px)',
                      fontSize: 'clamp(13px, 1.5vw, 14px)',
                      fontWeight: '500',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      backgroundColor: isActive ? '#ffffff' : 'transparent',
                      color: isActive ? '#2563eb' : '#4b5563',
                      boxShadow: isActive ? '0 2px 8px rgba(37, 99, 235, 0.1), 0 1px 2px rgba(37, 99, 235, 0.05)' : 'none',
                      transform: isActive ? 'translateY(-1px)' : 'none',
                      position: 'relative',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 'clamp(24px, 4vw, 28px)',
                      height: 'clamp(24px, 4vw, 28px)',
                      borderRadius: '8px',
                      backgroundColor: isActive ? 'rgba(37, 99, 235, 0.1)' : '#f3f4f6',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}>
                      <Icon
                        size={16}
                        color={isActive ? '#2563eb' : '#9ca3af'}
                      />
                    </div>

                    <span style={{
                      display: { sm: 'inline', xs: 'none' }
                    }}>
                      {tab.label}
                    </span>

                    {tab.badge > 0 && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 'clamp(18px, 3vw, 22px)',
                        height: 'clamp(18px, 3vw, 22px)',
                        padding: '0 clamp(4px, 1vw, 7px)',
                        fontSize: 'clamp(10px, 2vw, 12px)',
                        fontWeight: '700',
                        backgroundColor: tab.badgeColor,
                        color: '#ffffff',
                        borderRadius: '50%',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                        flexShrink: 0
                      }}>
                        {tab.badge}
                      </span>
                    )}

                    {tab.newBadge && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2px 8px',
                        fontSize: 'clamp(9px, 1.5vw, 11px)',
                        fontWeight: '700',
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        borderRadius: '10px',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        flexShrink: 0
                      }}>
                        New
                      </span>
                    )}

                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '24px',
                        height: '3px',
                        backgroundColor: '#2563eb',
                        borderRadius: '3px 3px 0 0'
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          padding: 'clamp(20px, 4vw, 32px)',
          minHeight: '400px',
          maxWidth: '1200px',
          margin: '0 auto',
          paddingLeft: '24px',
          paddingRight: '24px'
        }}>
          {activeTab === 'InfluencerCampaigns' && (
            <InfluencerCampaigns onApplicationSubmit={handleApplicationUpdate} />
          )}
          {activeTab === 'myApplications' && (
            <InfluencerApplications
              applications={applications}
              onUpdate={handleApplicationUpdate}
              loading={loading}
            />
          )}
          {activeTab === 'aitools' && <AITools />}
          {activeTab === 'analytics' && <InfluencerAnalytics />}
        </div>
      </main>

      {/* Footer */}
      <footer className="influencer-dashboard-footer">
        <div className="influencer-footer-content">
          <div className="influencer-footer-info">
            <p>© {new Date().getFullYear()} Brio. All rights reserved.</p>
            <span className="influencer-footer-version">v2.1.0 • Currency: {currency}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InfluencerDashboard;