import React, { useState, useEffect, useMemo, useContext, useCallback, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { CurrencyContext } from '../../context/CurrencyContext'; // Adjust path as needed
import { campaignAPI } from '../../services/api';
import BrandCreateCampaign from './BrandCreateCampaign';
import BrandCampaigns from './BrandCampaigns';
import BrandApplications from './BrandApplications';
import BrandAnalytics from './BrandAnalytics';
import {
  FiRefreshCw,
  FiAlertCircle,
  FiPlusCircle,
  FiInbox,
  FiTrendingUp,
  FiBell,
  FiPieChart,
  FiDollarSign,
  FiAward,
  FiSearch,
  FiX,
  FiCpu,
  FiUserCheck,
  FiEye,
  FiGlobe,
  FiChevronDown
} from 'react-icons/fi';
import '../../style/BrandDashboard.css';
import Tools from './Tools';
import { formatCurrency as globalFormatCurrency } from '../../utils/formatters';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// AI Tools configuration
// const brandAITools = [
//   {
//     id: 1,
//     title: "AI Content Creator",
//     description: "Generate engaging content ideas and captions with AI assistance",
//     icon: FiEdit3,
//     color: "#3B82F6",
//     isNew: true,
//     isPro: false
//   },
//   {
//     id: 2,
//     title: "Fast Post Generator",
//     description: "Create social media posts quickly with AI-powered templates",
//     icon: FiZap,
//     color: "#10B981",
//     isNew: false,
//     isPro: false
//   },
//   {
//     id: 3,
//     title: "AI Hashtag Generator",
//     description: "Find the perfect hashtags to maximize your content reach",
//     icon: FiHash,
//     color: "#F59E0B",
//     isNew: false,
//     isPro: false
//   },
//   {
//     id: 4,
//     title: "ROI Predictor",
//     description: "AI-powered ROI prediction for your campaigns",
//     icon: FiBarChart2,
//     color: "#8B5CF6",
//     isNew: true,
//     isPro: true
//   },
//   {
//     id: 5,
//     title: "Voice to Text AI",
//     description: "Convert voice notes to text content for your campaigns",
//     icon: FiMic,
//     color: "#EC4899",
//     isNew: false,
//     isPro: false
//   },
//   {
//     id: 6,
//     title: "Influencer Matching AI",
//     description: "Find perfect influencer matches using AI algorithms",
//     icon: FiUsers,
//     color: "#06B6D4",
//     isNew: true,
//     isPro: true
//   },
//   {
//     id: 7,
//     title: "Audience Analyzer",
//     description: "Deep analysis of target audience demographics",
//     icon: FiTarget,
//     color: "#F97316",
//     isNew: false,
//     isPro: true
//   },
//   {
//     id: 8,
//     title: "Content Scheduler",
//     description: "AI-optimized posting schedule for maximum engagement",
//     icon: FiClock,
//     color: "#14B8A6",
//     isNew: false,
//     isPro: false
//   }
// ];

// Currency symbols mapping
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

// Currency names
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

// Popular currencies for quick selection
const POPULAR_CURRENCIES = ['USD', 'GBP', 'EUR', 'JPY', 'CAD', 'AUD', 'INR'];

// StatCard Component
const BrandStatCard = ({ label, value, icon: Icon, color, subtitle, trend, onClick }) => {
  return (
    <div
      className={`brand-stat-card ${onClick ? 'brand-stat-clickable' : ''}`}
      onClick={onClick}
    >
      <div className="brand-stat-header">
        <div className="brand-stat-icon" style={{ backgroundColor: `${color}15` }}>
          <Icon size={20} color={color} />
        </div>
        {trend && (
          <div className={`brand-trend-indicator brand-trend-${trend.direction}`}>
            {trend.direction === 'up' ? '↗' : '↘'} {trend.value}
          </div>
        )}
      </div>
      <div className="brand-stat-content">
        <h3>{value}</h3>
        <p className="brand-stat-label">{label}</p>
        {subtitle && <span className="brand-stat-subtitle">{subtitle}</span>}
      </div>
    </div>
  );
};

// Currency Converter Component
const CurrencyConverter = ({
  selectedCurrency,
  onCurrencyChange,
  totalBudget,
  rates
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllCurrencies, setShowAllCurrencies] = useState(false);

  // Calculate converted total budget
  const calculateConvertedTotal = () => {
    if (!totalBudget || !rates || !selectedCurrency) return 0;

    let totalInSelectedCurrency = 0;

    Object.entries(totalBudget).forEach(([currencyCode, amount]) => {
      if (rates[currencyCode] && rates[selectedCurrency]) {
        // Convert from currencyCode to GBP, then to selectedCurrency
        const amountInGBP = amount / rates[currencyCode];
        const convertedAmount = amountInGBP * rates[selectedCurrency];
        totalInSelectedCurrency += convertedAmount;
      }
    });

    return totalInSelectedCurrency;
  };

  const convertedTotal = calculateConvertedTotal();

  // Filter currencies based on search
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
    <div className="brand-currency-converter">
      <div className="brand-currency-header">
        <div className="brand-currency-display">
          <div className="brand-currency-label">
            <FiGlobe size={14} />
            <span>Display Currency:</span>
          </div>
          <div className="brand-currency-selector">
            <button
              className="brand-currency-toggle"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="brand-currency-symbol">
                {CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency}
              </span>
              <span className="brand-currency-code">{selectedCurrency}</span>
              <FiChevronDown size={16} className={isOpen ? 'brand-rotate-180' : ''} />
            </button>

            {isOpen && (
              <div className="brand-currency-dropdown brand-drop-shadow">
                <div className="brand-currency-search">
                  <FiSearch size={14} />
                  <input
                    type="text"
                    placeholder="Search currency..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="brand-currency-search-input"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="brand-clear-search"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </div>

                {/* Popular currencies */}
                <div className="brand-currency-section">
                  <div className="brand-currency-section-title">Popular</div>
                  <div className="brand-currency-grid">
                    {POPULAR_CURRENCIES.map(currencyCode => (
                      <button
                        key={currencyCode}
                        className={`brand-currency-option ${selectedCurrency === currencyCode ? 'brand-currency-selected' : ''}`}
                        onClick={() => {
                          onCurrencyChange(currencyCode);
                          setIsOpen(false);
                        }}
                      >
                        <span className="brand-currency-option-symbol">
                          {CURRENCY_SYMBOLS[currencyCode] || currencyCode}
                        </span>
                        <span className="brand-currency-option-code">{currencyCode}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* All currencies */}
                <div className="brand-currency-section">
                  <div className="brand-currency-section-title">
                    All Currencies
                    <button
                      className="brand-show-all-btn"
                      onClick={() => setShowAllCurrencies(!showAllCurrencies)}
                    >
                      {showAllCurrencies ? 'Show Less' : 'Show All'}
                    </button>
                  </div>
                  <div className="brand-currency-list">
                    {(showAllCurrencies ? filteredCurrencies : filteredCurrencies.slice(0, 10)).map(currencyCode => (
                      <button
                        key={currencyCode}
                        className={`brand-currency-option ${selectedCurrency === currencyCode ? 'brand-currency-selected' : ''}`}
                        onClick={() => {
                          onCurrencyChange(currencyCode);
                          setIsOpen(false);
                        }}
                      >
                        <span className="brand-currency-option-symbol">
                          {CURRENCY_SYMBOLS[currencyCode] || currencyCode}
                        </span>
                        <div className="brand-currency-option-details">
                          <span className="brand-currency-option-code">{currencyCode}</span>
                          <span className="brand-currency-option-name">
                            {CURRENCY_NAMES[currencyCode] || currencyCode}
                          </span>
                        </div>
                        {rates && rates[currencyCode] && (
                          <span className="brand-currency-rate">
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

        {/* <div className="brand-converted-total">
          <div className="brand-converted-label">Total Budget:</div>
          <div className="brand-converted-value">
            {formatCurrency(convertedTotal, selectedCurrency)}
          </div>
          {Object.keys(totalBudget || {}).length > 1 && (
            <div className="brand-multi-currency-hint">
              (Combined from {Object.keys(totalBudget || {}).length} currencies)
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
};

// AIToolCard Component
const BrandAIToolCard = ({ title, description, icon: Icon, color, onClick, isNew, isPro }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="brand-ai-tool-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="brand-ai-tool-header">
        <div
          className="brand-ai-tool-icon"
          style={{
            background: isHovered ? `linear-gradient(135deg, ${color}, ${color}80)` : `${color}15`,
            color: isHovered ? 'white' : color
          }}
        >
          <Icon size={24} />
        </div>
        <div className="brand-ai-tool-badges">
          {isNew && <span className="brand-new-badge">New</span>}
          {isPro && <span className="brand-pro-badge">Pro</span>}
        </div>
      </div>
      <h4>{title}</h4>
      <p>{description}</p>
      <div className="brand-ai-tool-footer">
        <div className="brand-ai-tool-arrow" style={{ color }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// QuickAction Component
const BrandQuickAction = ({ title, description, icon: Icon, color, onClick }) => {
  return (
    <div className="brand-quick-action" onClick={onClick}>
      <div className="brand-quick-action-icon" style={{ backgroundColor: `${color}15`, color }}>
        <Icon size={18} />
      </div>
      <div className="brand-quick-action-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );
};

// SearchResult Component
const BrandSearchResult = ({ result, onClick }) => {
  const IconComponent = result.icon;

  return (
    <div className="brand-search-result" onClick={onClick}>
      <div className="brand-result-icon" style={{ color: result.color }}>
        <IconComponent size={16} />
      </div>
      <div className="brand-result-content">
        <h4>{result.title}</h4>
        <p>{result.description}</p>
      </div>
      <div className="brand-result-type">{result.type}</div>
    </div>
  );
};

// Main BrandDashboard Component
const BrandDashboard = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showBudgetBreakdown, setShowBudgetBreakdown] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const activityDropdownRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);


  const navigate = useNavigate();
  const { currency, changeCurrency, rates } = useContext(CurrencyContext);

  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    pendingApplications: 0,
    completedCampaigns: 0,
    totalBudget: {},
    convertedTotal: 0,
    conversionRate: '0%',
    engagementRate: '4.2%',
    roi: '127%'
  });

  // Quick Actions Configuration
  const quickActions = useMemo(() => [
    {
      title: "Create Campaign",
      description: "Launch a new influencer campaign",
      icon: FiPlusCircle,
      color: "#3B82F6",
      action: () => setActiveTab('create')
    },
    {
      title: "View Applications",
      description: "Review pending applications",
      icon: FiInbox,
      color: "#10B981",
      action: () => setActiveTab('applications')
    },
    {
      title: "Analytics Dashboard",
      description: "Campaign performance insights",
      icon: FiPieChart,
      color: "#8B5CF6",
      action: () => setActiveTab('analytics')
    },
    {
      title: "AI Tools",
      description: "AI-powered marketing tools",
      icon: FiCpu,
      color: "#F59E0B",
      action: () => setActiveTab('aitools')
    }
  ], []);

  // Real-time search data
  const searchData = useMemo(() => {
    const allData = [
      // Campaigns
      ...campaigns.map(campaign => ({
        type: 'campaign',
        title: campaign.title,
        description: `${campaign.status} • ${campaign.applications?.length || 0} applications`,
        data: campaign,
        icon: FiAward,
        color: '#3B82F6'
      })),

      // Applications
      ...applications.map(app => ({
        type: 'application',
        title: `Application from ${app.influencer_name}`,
        description: `Status: ${app.status} • ${app.campaign_title}`,
        data: app,
        icon: FiInbox,
        color: '#10B981'
      })),

      // AI Tools
      // ...Tools.map(tool => ({
      //   type: 'tool',
      //   title: tool.title,
      //   description: tool.description,
      //   data: tool,
      //   icon: tool.icon,
      //   color: tool.color
      // })),

      // Analytics
      {
        type: 'analytics',
        title: 'Campaign Performance',
        description: 'View detailed analytics and metrics',
        data: null,
        icon: FiPieChart,
        color: '#8B5CF6'
      },
      {
        type: 'analytics',
        title: 'ROI Calculator',
        description: 'Calculate campaign return on investment',
        data: null,
        icon: FiDollarSign,
        color: '#EC4899'
      }
    ];

    return allData;
  }, [campaigns, applications]);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Update stats when campaigns, applications, or currency changes
  useEffect(() => {
    if (!applications || !campaigns) return;

    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => ['active', 'live'].includes(c.status?.toLowerCase())).length;
    const completedCampaigns = campaigns.filter(c => ['completed', 'finished'].includes(c.status?.toLowerCase())).length;

    const pendingApplications = applications.filter(a => ['pending', 'review'].includes(a.status?.toLowerCase())).length;

    // Calculate total budget by currency
    const budgetsByCurrency = {};
    campaigns.forEach(campaign => {
      const currencyCode = campaign.currency || 'USD';
      if (!budgetsByCurrency[currencyCode]) {
        budgetsByCurrency[currencyCode] = 0;
      }
      budgetsByCurrency[currencyCode] += (campaign.budget || 0);
    });

    // Calculate converted total for selected currency
    let convertedTotal = 0;
    if (rates && currency) {
      Object.entries(budgetsByCurrency).forEach(([currencyCode, amount]) => {
        if (rates[currencyCode] && rates[currency]) {
          // Convert from currencyCode to GBP, then to selected currency
          const amountInGBP = amount / rates[currencyCode];
          const convertedAmount = amountInGBP * rates[currency];
          convertedTotal += convertedAmount;
        }
      });
    }

    setStats(prev => ({
      ...prev,
      totalCampaigns,
      activeCampaigns,
      completedCampaigns,
      pendingApplications,
      totalBudget: budgetsByCurrency,
      convertedTotal,
      conversionRate: totalCampaigns > 0 ? `${Math.round((completedCampaigns / totalCampaigns) * 100)}%` : '0%'
    }));
  }, [campaigns, applications, currency, rates]);

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

  // Format currency helper function
  const formatCurrency = (amount, currencyCode = currency) => {
    return globalFormatCurrency(amount, currencyCode, CURRENCY_SYMBOLS);
  };

  // Real-time search functionality
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = searchData.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 8));
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, searchData]);

  // Also fetch count when returning to dashboard (add to fetchData)
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [campaignsRes, applicationsRes] = await Promise.all([
        campaignAPI.getBrandCampaigns(),
        campaignAPI.getBrandApplications()
      ]);

      const campaignsData = Array.isArray(campaignsRes?.data) ? campaignsRes.data : (Array.isArray(campaignsRes) ? campaignsRes : []);
      const applicationsData = Array.isArray(applicationsRes?.data) ? applicationsRes.data : (Array.isArray(applicationsRes) ? applicationsRes : []);

      const processedCampaigns = campaignsData.map(campaign => ({
        ...campaign,
        currency: campaign.currency || 'USD'
      }));

      setCampaigns(processedCampaigns);
      setApplications(applicationsData);

      // Add this line to fetch notification count when data refreshes
      await fetchNotificationCount();

    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to fetch data. Please check your connection and try again.');
      setCampaigns([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };


  // Add this function to fetch notification count
  const fetchNotificationCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/brand/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Calculate unread count from notifications
        const unread = (data.notifications || []).filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Error fetching notification count:', err);
    }
  }, []);

  // Call it when component mounts and periodically
  useEffect(() => {
    fetchNotificationCount();

    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(fetchNotificationCount, 30000);

    return () => clearInterval(interval);
  }, [fetchNotificationCount]);


  const handleCampaignCreated = () => {
    fetchData();
    setActiveTab('campaigns');
  };

  const handleApplicationUpdate = () => fetchData();

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && searchResults.length > 0) {
      handleSearchResultClick(searchResults[0]);
    }
  };

  const handleSearchResultClick = (result) => {
    switch (result.type) {
      case 'campaign':
        setActiveTab('campaigns');
        break;
      case 'application':
        setActiveTab('applications');
        break;
      case 'tool':
        setActiveTab('aitools');
        break;
      case 'analytics':
        setActiveTab('analytics');
        break;
      default:
        break;
    }
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleAIToolClick = (tool) => {
    console.log('AI Tool clicked:', tool.title);
  };

  // Loading State
  if (loading) {
    return (
      <div className="brand-dashboard-loader">
        <div className="brand-loader-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="brand-dashboard-error">
        <div className="brand-error-icon">
          <FiAlertCircle size={48} />
        </div>
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <div className="brand-error-actions">
          <button className="brand-btn-secondary" onClick={() => window.location.reload()}>
            Refresh Page
          </button>
          <button className="brand-btn-primary" onClick={fetchData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="brand-dashboard">
      {/* Header Section */}
      <header className="brand-dashboard-header">
        <div className="brand-header-main">
          <div className="brand-header-brand">
            <h1 className="brand-gradient-text">Brand DashBoard</h1>
            <span className="brand-header-subtitle">Professional Marketing Dashboard</span>
          </div>

          {/* Currency Converter */}
          <div className="brand-header-currency">
            <CurrencyConverter
              selectedCurrency={currency}
              onCurrencyChange={changeCurrency}
              totalBudget={stats.totalBudget}
              rates={rates}
            />
          </div>

          {/* Search Section */}
          <div className="brand-header-search">
            <form onSubmit={handleSearchSubmit} className="brand-search-form">
              <div className="brand-search-wrapper">
                <FiSearch className="brand-search-icon" />
                <input
                  type="text"
                  placeholder="AI Search: campaigns, influencers, analytics, tools..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="brand-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="brand-clear-search"
                    aria-label="Clear search"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </div>
            </form>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="brand-search-results brand-drop-shadow">
                <div className="brand-search-results-header">
                  <span>Quick Access</span>
                  <span>{searchResults.length} results</span>
                </div>
                <div className="brand-search-results-list">
                  {searchResults.map((result, index) => (
                    <BrandSearchResult
                      key={index}
                      result={result}
                      onClick={() => handleSearchResultClick(result)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Header Actions */}
          <div className="brand-header-actions">
            <button
              className="brand-btn-icon brand-notification-btn"
              aria-label="Notifications"
              onClick={() => navigate("/brand/notification")}
            >
              <FiBell size={18} />
              {unreadCount > 0 && (
                <span className="brand-notification-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <button className="brand-btn-refresh" onClick={fetchData}>
              <FiRefreshCw size={16} />
              Refresh Data
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="brand-dashboard-main">
        {/* Overview Section */}
        <div className="brand-overview-section">
          {/* Performance Stats */}
          <section className="brand-stats-section">
            <div className="brand-section-header">
              <h2>Performance Overview</h2>
              <p>Real-time campaign metrics and performance indicators</p>
            </div>
            <div className="brand-stats-grid">
              <BrandStatCard
                label="Total Campaigns"
                value={stats.totalCampaigns}
                icon={FiAward}
                color="#3B82F6"
                subtitle="All campaigns"
                trend={{ direction: 'up', value: '+12%' }}
                onClick={() => setActiveTab('campaigns')}
              />
              <BrandStatCard
                label="Active Campaigns"
                value={stats.activeCampaigns}
                icon={FiTrendingUp}
                color="#10B981"
                subtitle="Live now"
                onClick={() => setActiveTab('campaigns')}
              />
              <BrandStatCard
                label="Pending Applications"
                value={stats.pendingApplications}
                icon={FiInbox}
                color="#F59E0B"
                subtitle="Needs review"
                trend={{ direction: 'up', value: '+5' }}
                onClick={() => setActiveTab('applications')}
              />
              <BrandStatCard
                label="Total Budget"
                value={formatCurrency(stats.convertedTotal)}
                icon={FiDollarSign}
                color="#EC4899"
                subtitle={`In ${currency}`}
                onClick={() => setShowBudgetBreakdown(!showBudgetBreakdown)}
              />
              <BrandStatCard
                label="Conversion Rate"
                value={stats.conversionRate}
                icon={FiUserCheck}
                color="#06B6D4"
                subtitle="Application success"
                trend={{ direction: 'up', value: '+3%' }}
              />
              <BrandStatCard
                label="Engagement Rate"
                value={stats.engagementRate}
                icon={FiEye}
                color="#8B5CF6"
                subtitle="Avg. performance"
              />
            </div>

            {/* Budget Breakdown */}
            {showBudgetBreakdown && stats.totalBudget && Object.keys(stats.totalBudget).length > 0 && (
              <div className="brand-budget-breakdown">
                <div className="brand-budget-breakdown-header">
                  <h4>Budget Breakdown by Currency</h4>
                  <button
                    className="brand-close-breakdown"
                    onClick={() => setShowBudgetBreakdown(false)}
                  >
                    <FiX size={16} />
                  </button>
                </div>
                <div className="brand-budget-breakdown-grid">
                  {Object.entries(stats.totalBudget).map(([currencyCode, amount]) => (
                    <div key={currencyCode} className="brand-budget-breakdown-item">
                      <div className="brand-budget-currency">
                        <span className="brand-budget-currency-code">{currencyCode}</span>
                        <span className="brand-budget-currency-name">
                          {CURRENCY_NAMES[currencyCode] || currencyCode}
                        </span>
                      </div>
                      <div className="brand-budget-amounts">
                        <span className="brand-budget-original">
                          {formatCurrency(amount, currencyCode)}
                        </span>
                        {currencyCode !== currency && rates && rates[currencyCode] && rates[currency] && (
                          <span className="brand-budget-converted">
                            ≈ {formatCurrency((amount / rates[currencyCode]) * rates[currency], currency)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Recent Activity */}
          <section className="brand-recent-activity" ref={activityDropdownRef}>
            <div className="brand-section-header">
              <div>
                <h2>Recent Activity</h2>
                <p>Latest updates and actions</p>
              </div>

              {applications.length > 3 && (
                <button
                  onClick={() => setShowActivityDropdown(!showActivityDropdown)}
                  className={`brand-link-btn ${showActivityDropdown ? 'brand-link-btn--active' : ''}`}
                >
                  View All
                  <FiChevronDown
                    size={14}
                    style={{
                      transition: 'transform 0.2s ease',
                      transform: showActivityDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                </button>
              )}
            </div>

            {/* Default 5 activities */}
            <div className="brand-activity-list">
              {applications.slice(0, 5).map((app, index) => (
                <div key={index} className="brand-activity-item">
                  <div className="brand-activity-icon">
                    <FiInbox />
                  </div>

                  <div className="brand-activity-content">
                    <p className="brand-activity-title">
                      <strong>{app.influencer_profile_name || app.influencer_name}</strong> applied to{" "}
                      <span>{app.campaign_title || app.title}</span>
                    </p>
                    <span className="brand-activity-meta">
                      {new Date(app.applied_at).toLocaleDateString()} • Application submitted
                    </span>
                  </div>

                  <span className={`brand-activity-pill brand-status-${app.status}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Dropdown — floats freely over page content */}
            {showActivityDropdown && (
              <div className="brand-activity-dropdown brand-drop-shadow">
                <div className="brand-activity-dropdown-header">
                  <h4>All Recent Activity</h4>
                  <button className="brand-activity-close-btn" onClick={() => setShowActivityDropdown(false)}>
                    <FiX size={14} />
                  </button>
                </div>

                <div className="brand-activity-dropdown-list">
                  {applications.slice(0, 20).map((app, index) => (
                    <div key={index} className="brand-activity-row">
                      <div className="brand-activity-icon">
                        <FiInbox />
                      </div>

                      <div className="brand-activity-info">
                        <p>
                          <strong>{app.influencer_profile_name || app.influencer_name}</strong> applied to{" "}
                          {app.campaign_title || app.title}
                        </p>
                        <span className="brand-activity-time">{new Date(app.applied_at).toLocaleDateString()}</span>
                      </div>

                      <span className={`brand-activity-pill brand-status-${app.status}`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="brand-activity-dropdown-footer">
                  <button
                    className="brand-view-all-activity-btn"
                    onClick={() => navigate('/brand/activity')}
                  >
                    Visit all activity page
                  </button>
                </div>
              </div>
            )}
          </section>

        </div>

        {/* Quick Actions */}
        {/* Quick Actions */}
        {/* Quick Actions Section */}
        <section style={{
          marginBottom: '32px',
          padding: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f1f5f9'
        }}>
          {/* Section Header */}
          <div style={{
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#4f46e5'
              }} />
              Quick Actions
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: 0
            }}>
              Switch between frequently used features and tools
            </p>
          </div>

          {/* Quick Action Tabs */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '4px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            {[
              {
                id: 'create',
                label: 'Create New',
                icon: FiPlusCircle,
                color: '#3b82f6'
              },
              {
                id: 'campaigns',
                label: 'Campaigns',
                icon: FiAward,
                color: '#3b82f6',
                badge: stats.activeCampaigns,
                badgeColor: '#10b981'
              },
              {
                id: 'applications',
                label: 'Applications',
                icon: FiInbox,
                color: '#3b82f6',
                badge: stats.pendingApplications,
                badgeColor: '#ef4444'
              },
              {
                id: 'analytics',
                label: 'Analytics',
                icon: FiPieChart,
                color: '#3b82f6'
              },
              {
                id: 'aitools',
                label: 'AI Tools',
                icon: FiCpu,
                color: '#3b82f6',
                newBadge: true
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
                    padding: '10px 18px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? tab.color : '#475569',
                    boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
                    transform: isActive ? 'translateY(-1px)' : 'none',
                    flex: '1 0 auto',
                    minWidth: '120px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#ffffff';
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
                  {/* Icon with colored circle background when active */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: isActive ? `${tab.color}15` : '#f1f5f9',
                    transition: 'all 0.2s ease'
                  }}>
                    <Icon
                      size={16}
                      color={isActive ? tab.color : '#94a3b8'}
                    />
                  </div>

                  <span style={{
                    flex: 1,
                    textAlign: 'left'
                  }}>
                    {tab.label}
                  </span>

                  {/* Number Badge */}
                  {tab.badge > 0 && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '20px',
                      height: '20px',
                      padding: '0 6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      backgroundColor: tab.badgeColor,
                      color: '#ffffff',
                      borderRadius: '10px',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                    }}>
                      {tab.badge}
                    </span>
                  )}

                  {/* New Badge */}
                  {tab.newBadge && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2px 8px',
                      fontSize: '10px',
                      fontWeight: '700',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      borderRadius: '10px',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      New
                    </span>
                  )}

                  {/* Active Tab Indicator */}
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '24px',
                      height: '3px',
                      backgroundColor: tab.color,
                      borderRadius: '3px 3px 0 0'
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Tab Indicator */}
          {/* <div style={{
    marginTop: '16px',
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }}>
    <div style={{
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#4f46e5'
    }} />
    <span style={{
      fontSize: '13px',
      fontWeight: '500',
      color: '#475569'
    }}>
      Selected:{' '}
      <span style={{
        fontWeight: '600',
        color: '#1e293b'
      }}>
        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
      </span>
    </span>
  </div> */}
        </section>


        {/* Active Tab Content Section */}
        <div className="brand-tab-content-section">
          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <BrandCampaigns campaigns={campaigns} onUpdate={fetchData} />
          )}

          {/* Create Campaign Tab */}
          {activeTab === 'create' && (
            <BrandCreateCampaign onCampaignCreated={handleCampaignCreated} />
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <BrandApplications applications={applications} onApplicationUpdate={handleApplicationUpdate} />
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <BrandAnalytics />
          )}

          {/* AI Tools Tab */}
          {activeTab === 'aitools' && (
            <Tools />

            // <div className="brand-ai-tools-section">
            //   <div className="brand-section-header">
            //     <h2 className="brand-gradient-text">AI-Powered Marketing Suite</h2>
            //     <p>Leverage artificial intelligence to optimize your marketing campaigns and maximize ROI</p>
            //   </div>

            //   {/* AI Tools Grid */}
            //   <div className="brand-ai-tools-grid">
            //     {brandAITools.map((tool) => (
            //       <BrandAIToolCard 
            //         key={tool.id}
            //         title={tool.title}
            //         description={tool.description}
            //         icon={tool.icon}
            //         color={tool.color}
            //         onClick={() => handleAIToolClick(tool)}
            //         isNew={tool.isNew}
            //         isPro={tool.isPro}
            //       />
            //     ))}
            //   </div>

            //   {/* AI Benefits Section */}
            //   <div className="brand-ai-benefits">
            //     <div className="brand-benefits-header">
            //       <h3>Transform Your Marketing with AI</h3>
            //       <p>Our AI tools are designed to help you work smarter, not harder</p>
            //     </div>
            //     <div className="brand-benefits-grid">
            //       <div className="brand-benefit-card">
            //         <div className="brand-benefit-icon">⚡</div>
            //         <h4>10x Faster</h4>
            //         <p>Create content and campaigns in minutes instead of hours</p>
            //       </div>
            //       <div className="brand-benefit-card">
            //         <div className="brand-benefit-icon">📈</div>
            //         <h4>Data-Driven</h4>
            //         <p>Make decisions based on AI-powered insights and analytics</p>
            //       </div>
            //       <div className="brand-benefit-card">
            //         <div className="brand-benefit-icon">🎯</div>
            //         <h4>Precision Targeting</h4>
            //         <p>Reach the right audience with AI-optimized targeting</p>
            //       </div>
            //       <div className="brand-benefit-card">
            //         <div className="brand-benefit-icon">💡</div>
            //         <h4>Creative Intelligence</h4>
            //         <p>Generate innovative ideas and overcome creative blocks</p>
            //       </div>
            //       <div className="brand-benefit-card">
            //         <div className="brand-benefit-icon">🔄</div>
            //         <h4>Continuous Learning</h4>
            //         <p>AI models improve with every campaign you run</p>
            //       </div>
            //       <div className="brand-benefit-card">
            //         <div className="brand-benefit-icon">🛡️</div>
            //         <h4>Risk Reduction</h4>
            //         <p>Predict campaign performance and avoid costly mistakes</p>
            //       </div>
            //     </div>
            //   </div>

            //   {/* Pro Features CTA */}
            //   <div className="brand-pro-cta">
            //     <div className="brand-pro-cta-content">
            //       <h3>Unlock Pro AI Features</h3>
            //       <p>Get access to advanced AI tools, premium templates, and dedicated support</p>
            //       <div className="brand-pro-features">
            //         <span>✓ Advanced Analytics</span>
            //         <span>✓ Priority Support</span>
            //         <span>✓ Custom AI Models</span>
            //         <span>✓ Unlimited Usage</span>
            //       </div>
            //       <button className="brand-btn-primary">Upgrade to Pro</button>
            //     </div>
            //   </div>
            // </div>
          )}
        </div>
      </main>

      {/* Footer Quick Links */}
      <section className="brand-footer-links">
        <div className="brand-quick-actions-grid">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="brand-quick-action-card"
              onClick={action.action}
            >
              <div
                className="brand-quick-action-icon"
                style={{ backgroundColor: `${action.color}15`, color: action.color }}
              >
                <action.icon size={20} />
              </div>

              <div className="brand-quick-action-content">
                <h4>{action.title}</h4>
                <p>{action.description}</p>
              </div>
            </div>
          ))}
        </div>

      </section>

      <footer className="brand-dashboard-footer">
        <div className="brand-footer-content">
          <div className="brand-footer-info">
            <p>© {new Date().getFullYear()} Brio. Campaign Marketing Platform.</p>
            <span className="brand-footer-version">v2.1.0 • AI Enhanced • Currency: {currency}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BrandDashboard;