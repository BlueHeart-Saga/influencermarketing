import React, { useState, useEffect, useContext, useCallback, useLayoutEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  FlatList,
  Alert,
  Image,
} from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../../contexts/AuthContext";
import { campaignAPI } from "../../../services/campaignAPI";
import earningsAPI from "../../../services/earningsAPI";
import { CurrencyContext } from "../../../contexts/CurrencyContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

// Color constants
const COLORS = {
  primary: '#0F6EEA', // rgb(15, 110, 234)
  primaryLight: '#E8F0FE',
  primaryDark: '#0A4EA8',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
  teal: '#06B6D4',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  white: '#FFFFFF',
  black: '#000000',
};

// Currency symbols mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
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
  ZAR: 'R',
};

// Currency names
const CURRENCY_NAMES: Record<string, string> = {
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
  ZAR: 'South African Rand',
};

// Popular currencies for quick selection
const POPULAR_CURRENCIES = ['USD', 'GBP', 'EUR', 'JPY', 'CAD', 'AUD', 'INR'];

// Stat Card Component
interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  subtitle?: string;
  trend?: { direction: 'up' | 'down'; value: string };
  onClick?: () => void;
}

const StatCard = ({ label, value, icon, color = COLORS.primary, subtitle, trend, onClick }: StatCardProps) => {
  return (
    <TouchableOpacity 
      style={[styles.statCard, onClick && styles.statCardClickable]}
      onPress={onClick}
      disabled={!onClick}
      activeOpacity={onClick ? 0.7 : 1}
    >
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        {trend && (
          <View style={[
            styles.trendIndicator,
            trend.direction === 'up' ? styles.trendUp : styles.trendDown
          ]}>
            <Text style={styles.trendText}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );
};

// Currency Converter Component
interface CurrencyConverterProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
  totalEarnings?: number;
  rates: Record<string, number>;
}

const CurrencyConverter = ({ selectedCurrency, onCurrencyChange, totalEarnings = 0, rates }: CurrencyConverterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllCurrencies, setShowAllCurrencies] = useState(false);

  const formatCurrency = (amount: number, currencyCode: string) => {
    const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
    return `${symbol}${amount.toFixed(2)}`;
  };

  const filteredCurrencies = Object.keys(CURRENCY_SYMBOLS).filter(currencyCode => {
    if (!searchTerm) return true;
    return (
      currencyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      CURRENCY_NAMES[currencyCode]?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <View style={styles.currencyConverter}>
      <TouchableOpacity 
        style={styles.currencySelector}
        onPress={() => setIsOpen(true)}
      >
        <View style={styles.currencyDisplay}>
          <Ionicons name="globe-outline" size={14} color={COLORS.gray[600]} />
          <Text style={styles.currencyCode}>{selectedCurrency}</Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.gray[600]} />
        </View>
      </TouchableOpacity>

      {/* Currency Selection Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.currencyModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray[700]} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={COLORS.gray[400]} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search currency..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholderTextColor={COLORS.gray[400]}
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setSearchTerm('')}>
                  <Ionicons name="close-circle" size={20} color={COLORS.gray[400]} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.currencyList}>
              {/* Popular Currencies */}
              <View style={styles.currencySection}>
                <Text style={styles.sectionTitle}>Popular</Text>
                <View style={styles.popularGrid}>
                  {POPULAR_CURRENCIES.map(currencyCode => (
                    <TouchableOpacity
                      key={currencyCode}
                      style={[
                        styles.popularCurrencyItem,
                        selectedCurrency === currencyCode && styles.selectedCurrencyItem
                      ]}
                      onPress={() => {
                        onCurrencyChange(currencyCode);
                        setIsOpen(false);
                      }}
                    >
                      <Text style={styles.currencySymbol}>
                        {CURRENCY_SYMBOLS[currencyCode] || currencyCode}
                      </Text>
                      <Text style={styles.currencyCodeSmall}>{currencyCode}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* All Currencies */}
              <View style={styles.currencySection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>All Currencies</Text>
                  <TouchableOpacity onPress={() => setShowAllCurrencies(!showAllCurrencies)}>
                    <Text style={styles.showAllText}>
                      {showAllCurrencies ? 'Show Less' : 'Show All'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {(showAllCurrencies ? filteredCurrencies : filteredCurrencies.slice(0, 10)).map(currencyCode => (
                  <TouchableOpacity
                    key={currencyCode}
                    style={[
                      styles.currencyRow,
                      selectedCurrency === currencyCode && styles.selectedCurrencyRow
                    ]}
                    onPress={() => {
                      onCurrencyChange(currencyCode);
                      setIsOpen(false);
                    }}
                  >
                    <View style={styles.currencyInfo}>
                      <Text style={styles.currencySymbolLarge}>
                        {CURRENCY_SYMBOLS[currencyCode] || currencyCode}
                      </Text>
                      <View>
                        <Text style={styles.currencyCodeLarge}>{currencyCode}</Text>
                        <Text style={styles.currencyName}>
                          {CURRENCY_NAMES[currencyCode] || currencyCode}
                        </Text>
                      </View>
                    </View>
                    {rates && rates[currencyCode] && (
                      <Text style={styles.currencyRate}>
                        1 GBP = {(rates[currencyCode]).toFixed(2)} {currencyCode}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Converted Earnings */}
      {totalEarnings > 0 && (
        <View style={styles.convertedTotal}>
          <Text style={styles.convertedLabel}>Total Earnings:</Text>
          <Text style={styles.convertedValue}>
            {formatCurrency(totalEarnings, selectedCurrency)}
          </Text>
        </View>
      )}
    </View>
  );
};

// Search Result Component
interface SearchResult {
  type: string;
  title: string;
  description: string;
  data?: any;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  route?: string;
}

interface SearchResultItemProps {
  result: SearchResult;
  onClick: () => void;
}

const SearchResultItem = ({ result, onClick }: SearchResultItemProps) => {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    campaign: 'megaphone',
    application: 'mail',
    analytics: 'stats-chart',
    tool: 'cog',
    earnings: 'cash',
    message: 'chatbubble',
    contract: 'document-text',
    profile: 'person',
  };

  const colorMap: Record<string, string> = {
    campaign: COLORS.primary,
    application: COLORS.success,
    analytics: COLORS.purple,
    tool: COLORS.warning,
    earnings: COLORS.pink,
    message: COLORS.teal,
    contract: COLORS.warning,
    profile: COLORS.gray[600],
  };

  const icon = result.icon || iconMap[result.type] || 'document';
  const color = result.color || colorMap[result.type] || COLORS.gray[500];

  return (
    <TouchableOpacity style={styles.searchResult} onPress={onClick} activeOpacity={0.7}>
      <View style={[styles.resultIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{result.title}</Text>
        <Text style={styles.resultDescription}>{result.description}</Text>
      </View>
      <View style={[styles.resultType, { backgroundColor: `${color}15` }]}>
        <Text style={[styles.resultTypeText, { color }]}>{result.type}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Tab Button Component
interface TabButtonProps {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  badge?: number;
  badgeColor?: string;
  isNew?: boolean;
  onPress: () => void;
}

const TabButton = ({ id, label, icon, isActive, badge, badgeColor = COLORS.danger, isNew, onPress }: TabButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.tabButton,
        isActive && styles.activeTabButton
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.tabIconContainer,
        isActive && { backgroundColor: `${COLORS.primary}15` }
      ]}>
        <Ionicons 
          name={icon} 
          size={18} 
          color={isActive ? COLORS.primary : COLORS.gray[500]} 
        />
      </View>
      <Text style={[
        styles.tabLabel,
        isActive && styles.activeTabLabel
      ]}>
        {label}
      </Text>
      
      {badge !== undefined && badge > 0 && (
        <View style={[styles.tabBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.tabBadgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
      
      {isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>New</Text>
        </View>
      )}
      
      {isActive && <View style={[styles.activeIndicator, { backgroundColor: COLORS.primary }]} />}
    </TouchableOpacity>
  );
};

// Quick Action Component
interface QuickActionProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  onClick: () => void;
}

const QuickAction = ({ title, description, icon, color = COLORS.primary, onClick }: QuickActionProps) => {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onClick} activeOpacity={0.7}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Main Dashboard Component
const InfluencerDashboard = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { user, token } = useContext(AuthContext);
  const { currency, changeCurrency, rates } = useContext(CurrencyContext);

  const [activeTab, setActiveTab] = useState('campaigns');
  const [applications, setApplications] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [earningsSummary, setEarningsSummary] = useState({
    total_earnings: 0,
    available_balance: 0,
    pending_earnings: 0,
    completed_withdrawals: 0,
  });
  const [showEarningsBreakdown, setShowEarningsBreakdown] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);

  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    totalEarnings: 0,
    availableBalance: 0,
    pendingEarnings: 0,
    successRate: '0%',
    engagementRate: '4.2%',
  });

  // Set up navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: () => (
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>BRIO</Text>
          <Text style={styles.headerSubtitle}>Influencer Dashboard</Text>
        </View>
      ),
      headerLeft: () => (
        <TouchableOpacity onPress={() => (navigation as any).openDrawer()}>
          <Ionicons name="menu" size={24} color={COLORS.white} style={styles.headerIcon} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push('/(influencer)/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, unreadCount]);

  // Fetch notification count
  const fetchNotificationCount = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/influencer/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const unread = (data.notifications || []).filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Error fetching notification count:', err);
    }
  }, []);

  // Fetch earnings summary
  const fetchEarningsSummary = useCallback(async () => {
    try {
      const summary = await earningsAPI.getEarningsSummary();
      setEarningsSummary(summary);
    } catch (err) {
      console.error('Failed to load earnings summary', err);
    }
  }, []);

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    try {
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
      console.error('Failed to fetch applications:', err);
      setApplications([]);
    }
  }, []);

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    try {
      const response = await campaignAPI.getAvailableCampaigns();
      setCampaigns(response.data || []);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      setCampaigns([]);
    }
  }, []);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      
      await Promise.all([
        fetchApplications(),
        fetchCampaigns(),
        fetchEarningsSummary(),
        fetchNotificationCount(),
      ]);
      
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to fetch data. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchApplications, fetchCampaigns, fetchEarningsSummary, fetchNotificationCount]);

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [fetchData, fetchNotificationCount]);

  // Calculate stats
  useEffect(() => {
    if (!applications || !Array.isArray(applications)) {
      setStats(prev => ({ 
        ...prev, 
        totalApplications: 0, 
        pendingApplications: 0, 
        acceptedApplications: 0, 
        rejectedApplications: 0,
      }));
      return;
    }

    const pending = applications.filter(app => 
      ['pending', 'review'].includes(app.status?.toLowerCase())
    ).length;
    
    const accepted = applications.filter(app => 
      ['approved', 'accepted', 'hired', 'contracted'].includes(app.status?.toLowerCase())
    ).length;
    
    const rejected = applications.filter(app => 
      ['rejected', 'declined'].includes(app.status?.toLowerCase())
    ).length;

    const total = applications.length;
    const successRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

    let convertedTotalEarnings = earningsSummary.total_earnings;
    let convertedAvailableBalance = earningsSummary.available_balance;
    let convertedPendingEarnings = earningsSummary.pending_earnings;

    if (rates && currency && rates[currency]) {
      convertedTotalEarnings = earningsSummary.total_earnings * rates[currency];
      convertedAvailableBalance = earningsSummary.available_balance * rates[currency];
      convertedPendingEarnings = earningsSummary.pending_earnings * rates[currency];
    }

    setStats(prev => ({
      ...prev,
      totalApplications: total,
      pendingApplications: pending,
      acceptedApplications: accepted,
      rejectedApplications: rejected,
      totalEarnings: convertedTotalEarnings,
      availableBalance: convertedAvailableBalance,
      pendingEarnings: convertedPendingEarnings,
      successRate: `${successRate}%`,
    }));
  }, [applications, earningsSummary, currency, rates]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const searchData: SearchResult[] = [
        ...campaigns.map(campaign => ({
          type: 'campaign',
          title: campaign.title,
          description: `${campaign.budget ? `$${campaign.budget} • ` : ''}${campaign.category || 'General'}`,
          data: campaign,
          route: '/(influencer)/campaigns',
        })),
        ...applications.map(app => ({
          type: 'application',
          title: app.campaign_title || 'Campaign',
          description: `Status: ${app.status} • ${app.message?.substring(0, 50) || 'No message'}`,
          data: app,
          route: '/(influencer)/applications',
        })),
        {
          type: 'tool',
          title: 'AI Content Creator',
          description: 'Generate engaging content with AI assistance',
          route: '/(influencer)/aitools/content',
        },
        {
          type: 'tool',
          title: 'Hashtag Generator',
          description: 'Find the best hashtags for your content',
          route: '/(influencer)/aitools/hashtag',
        },
        {
          type: 'analytics',
          title: 'Performance Analytics',
          description: 'View your campaign performance metrics',
          route: '/(influencer)/analytics',
        },
        {
          type: 'earnings',
          title: 'Earnings Dashboard',
          description: `Total: ${formatCurrency(stats.totalEarnings, currency)}`,
          route: '/(influencer)/earnings',
        },
        {
          type: 'contract',
          title: 'Agreements & Contracts',
          description: 'View and manage your contracts',
          route: '/(influencer)/agreements',
        }
      ];

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
  }, [searchQuery, campaigns, applications, stats.totalEarnings, currency]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleApplicationUpdate = () => {
    fetchApplications();
    fetchEarningsSummary();
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setSearchQuery('');
    setShowSearchResults(false);
    
    if (result.route) {
      router.push(result.route as any);
    }
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
    return `${symbol}${amount.toFixed(2)}`;
  };

  const tabs = [
    { id: 'campaigns', label: 'Campaigns', icon: 'megaphone' as const },
    { id: 'applications', label: 'Applications', icon: 'mail' as const, badge: stats.pendingApplications, badgeColor: COLORS.warning },
    { id: 'aitools', label: 'AI Tools', icon: 'cog' as const, isNew: true },
    { id: 'analytics', label: 'Analytics', icon: 'stats-chart' as const },
    { id: 'earnings', label: 'Earnings', icon: 'cash' as const },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <Ionicons name="alert-circle" size={48} color={COLORS.danger} />
        </View>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <View style={styles.errorActions}>
          <TouchableOpacity 
            style={[styles.button, styles.buttonSecondary]} 
            onPress={fetchData}
          >
            <Text style={styles.buttonSecondaryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Currency */}
        <View style={styles.headerSection}>
          <CurrencyConverter 
            selectedCurrency={currency}
            onCurrencyChange={changeCurrency}
            totalEarnings={stats.totalEarnings}
            rates={rates || {}}
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.gray[400]} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="AI Search: campaigns, applications, tools..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.gray[400]}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.gray[400]} />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Results */}
          {showSearchResults && searchResults.length > 0 && (
            <View style={styles.searchResults}>
              <View style={styles.searchResultsHeader}>
                <Text style={styles.searchResultsTitle}>Quick Access</Text>
                <Text style={styles.searchResultsCount}>{searchResults.length} results</Text>
              </View>
              {searchResults.map((result, index) => (
                <SearchResultItem
                  key={index}
                  result={result}
                  onClick={() => handleSearchResultClick(result)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <StatCard 
              label="Total Applications" 
              value={stats.totalApplications} 
              icon="mail" 
              color={COLORS.primary}
              subtitle="All time"
              onClick={() => setActiveTab('applications')}
            />
            <StatCard 
              label="Pending" 
              value={stats.pendingApplications} 
              icon="time" 
              color={COLORS.warning}
              subtitle="Awaiting review"
              trend={{ direction: 'up', value: '+2' }}
              onClick={() => setActiveTab('applications')}
            />
            <StatCard 
              label="Accepted" 
              value={stats.acceptedApplications} 
              icon="checkmark-circle" 
              color={COLORS.success}
              subtitle="Active campaigns"
              onClick={() => setActiveTab('campaigns')}
            />
            <StatCard 
              label="Rejected" 
              value={stats.rejectedApplications} 
              icon="close-circle" 
              color={COLORS.danger}
              subtitle="Not selected"
            />
            <StatCard 
              label="Total Earnings" 
              value={formatCurrency(stats.totalEarnings, currency)} 
              icon="cash" 
              color={COLORS.pink}
              subtitle={`In ${currency}`}
              onClick={() => setActiveTab('earnings')}
            />
            <StatCard 
              label="Available Balance" 
              value={formatCurrency(stats.availableBalance, currency)} 
              icon="wallet" 
              color={COLORS.teal}
              subtitle="Ready to withdraw"
              onClick={() => router.push('/(influencer)/earnings' as any)}
            />
            <StatCard 
              label="Pending Earnings" 
              value={formatCurrency(stats.pendingEarnings, currency)} 
              icon="hourglass" 
              color={COLORS.warning}
              subtitle="Awaiting clearance"
            />
            <StatCard 
              label="Success Rate" 
              value={stats.successRate} 
              icon="trending-up" 
              color={COLORS.purple}
              subtitle="Application success"
              trend={{ direction: stats.acceptedApplications > stats.rejectedApplications ? 'up' : 'down', value: '+5%' }}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <Text style={styles.sectionSubtitle}>Latest updates and actions</Text>
            </View>
            {applications.length > 3 && (
              <TouchableOpacity onPress={() => setShowActivityDropdown(!showActivityDropdown)}>
                <Text style={styles.viewMoreText}>View more</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.activityList}>
            {applications.slice(0, 3).map((app, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: `${COLORS.primary}15` }]}>
                  <Ionicons name="mail" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>
                    Applied to <Text style={styles.activityHighlight}>{app.campaign_title || 'Campaign'}</Text>
                  </Text>
                  <Text style={styles.activityMeta}>
                    {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Just now'} • Application submitted
                  </Text>
                </View>
                <View style={[styles.activityStatus, { backgroundColor: app.status === 'pending' ? `${COLORS.warning}15` : `${COLORS.success}15` }]}>
                  <Text style={[styles.activityStatusText, { color: app.status === 'pending' ? COLORS.warning : COLORS.success }]}>
                    {app.status || 'Pending'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Activity Dropdown */}
          {showActivityDropdown && (
            <Modal
              visible={showActivityDropdown}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setShowActivityDropdown(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.activityModal}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>All Recent Activity</Text>
                    <TouchableOpacity onPress={() => setShowActivityDropdown(false)}>
                      <Ionicons name="close" size={24} color={COLORS.gray[700]} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView>
                    {applications.map((app, index) => (
                      <View key={index} style={styles.activityModalItem}>
                        <View style={[styles.activityIcon, { backgroundColor: `${COLORS.primary}15` }]}>
                          <Ionicons name="mail" size={18} color={COLORS.primary} />
                        </View>
                        <View style={styles.activityModalContent}>
                          <Text style={styles.activityModalTitle}>
                            Applied to {app.campaign_title || 'Campaign'}
                          </Text>
                          <Text style={styles.activityModalTime}>
                            {app.created_at ? new Date(app.created_at).toLocaleString() : 'Recently'}
                          </Text>
                        </View>
                        <View style={[styles.activityPill, { backgroundColor: app.status === 'pending' ? `${COLORS.warning}15` : `${COLORS.success}15` }]}>
                          <Text style={[styles.activityPillText, { color: app.status === 'pending' ? COLORS.warning : COLORS.success }]}>
                            {app.status || 'Pending'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Text style={styles.sectionSubtitle}>Switch between frequently used features</Text>
          </View>

          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  icon={tab.icon}
                  isActive={activeTab === tab.id}
                  badge={tab.badge}
                  badgeColor={tab.badgeColor}
                  isNew={tab.isNew}
                  onPress={() => setActiveTab(tab.id)}
                />
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'campaigns' && (
            <View style={styles.comingSoon}>
              <Ionicons name="megaphone" size={48} color={COLORS.gray[300]} />
              <Text style={styles.comingSoonText}>Available Campaigns</Text>
              <Text style={styles.comingSoonSubtext}>Browse and apply to campaigns</Text>
              <TouchableOpacity 
                style={styles.goButton}
                onPress={() => router.push('/(influencer)/campaigns' as any)}
              >
                <Text style={styles.goButtonText}>View Campaigns</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'applications' && (
            <View style={styles.comingSoon}>
              <Ionicons name="mail" size={48} color={COLORS.gray[300]} />
              <Text style={styles.comingSoonText}>My Applications</Text>
              <Text style={styles.comingSoonSubtext}>Track your application status</Text>
              <TouchableOpacity 
                style={styles.goButton}
                onPress={() => router.push('/(influencer)/applications' as any)}
              >
                <Text style={styles.goButtonText}>View Applications</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'aitools' && (
            <View style={styles.comingSoon}>
              <Ionicons name="cog" size={48} color={COLORS.gray[300]} />
              <Text style={styles.comingSoonText}>AI Tools</Text>
              <Text style={styles.comingSoonSubtext}>Boost your content with AI</Text>
              <TouchableOpacity 
                style={styles.goButton}
                onPress={() => router.push('/(influencer)/aitools' as any)}
              >
                <Text style={styles.goButtonText}>Explore Tools</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'analytics' && (
            <View style={styles.comingSoon}>
              <Ionicons name="stats-chart" size={48} color={COLORS.gray[300]} />
              <Text style={styles.comingSoonText}>Analytics</Text>
              <Text style={styles.comingSoonSubtext}>Track your performance</Text>
              <TouchableOpacity 
                style={styles.goButton}
                onPress={() => router.push('/(influencer)/analytics' as any)}
              >
                <Text style={styles.goButtonText}>View Analytics</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'earnings' && (
            <View style={styles.comingSoon}>
              <Ionicons name="cash" size={48} color={COLORS.gray[300]} />
              <Text style={styles.comingSoonText}>Earnings</Text>
              <Text style={styles.comingSoonSubtext}>Track your income and withdrawals</Text>
              <TouchableOpacity 
                style={styles.goButton}
                onPress={() => router.push('/(influencer)/earnings' as any)}
              >
                <Text style={styles.goButtonText}>View Earnings</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Footer Quick Links */}
        <View style={styles.footerQuickLinks}>
          <QuickAction
            title="Browse Campaigns"
            description="Find new opportunities"
            icon="megaphone"
            color={COLORS.primary}
            onClick={() => router.push('/(influencer)/campaigns' as any)}
          />
          <QuickAction
            title="Check Applications"
            description="Track your status"
            icon="mail"
            color={COLORS.success}
            onClick={() => router.push('/(influencer)/applications' as any)}
          />
          <QuickAction
            title="AI Tools"
            description="Content creation tools"
            icon="cog"
            color={COLORS.purple}
            onClick={() => router.push('/(influencer)/aitools' as any)}
          />
          <QuickAction
            title="Earnings"
            description="View your income"
            icon="cash"
            color={COLORS.warning}
            onClick={() => router.push('/(influencer)/earnings' as any)}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Brio. Influencer Marketing Platform.
          </Text>
          <Text style={styles.footerVersion}>v2.1.0 • AI Enhanced • Currency: {currency}</Text>
        </View>
      </ScrollView>

      {/* Earnings Breakdown Modal */}
      {showEarningsBreakdown && (
        <Modal
          visible={showEarningsBreakdown}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowEarningsBreakdown(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.earningsModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Earnings Breakdown</Text>
                <TouchableOpacity onPress={() => setShowEarningsBreakdown(false)}>
                  <Ionicons name="close" size={24} color={COLORS.gray[700]} />
                </TouchableOpacity>
              </View>
              
              <ScrollView>
                <View style={styles.earningsItem}>
                  <Text style={styles.earningsLabel}>Total Earnings</Text>
                  <Text style={styles.earningsValue}>
                    {formatCurrency(earningsSummary.total_earnings, currency)}
                  </Text>
                </View>
                <View style={styles.earningsItem}>
                  <Text style={styles.earningsLabel}>Available Balance</Text>
                  <Text style={styles.earningsValue}>
                    {formatCurrency(earningsSummary.available_balance, currency)}
                  </Text>
                </View>
                <View style={styles.earningsItem}>
                  <Text style={styles.earningsLabel}>Pending Earnings</Text>
                  <Text style={styles.earningsValue}>
                    {formatCurrency(earningsSummary.pending_earnings, currency)}
                  </Text>
                </View>
                <View style={styles.earningsItem}>
                  <Text style={styles.earningsLabel}>Completed Withdrawals</Text>
                  <Text style={styles.earningsValue}>
                    {formatCurrency(earningsSummary.completed_withdrawals, currency)}
                  </Text>
                </View>
              </ScrollView>

              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => {
                  setShowEarningsBreakdown(false);
                  router.push('/(influencer)/earnings' as any);
                }}
              >
                <Text style={styles.viewAllButtonText}>View Full Earnings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    paddingLeft: 8,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '600',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.white,
    marginTop: 2,
  },
  headerIcon: {
    marginLeft: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray[800],
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: COLORS.gray[100],
  },
  buttonSecondaryText: {
    color: COLORS.gray[700],
    fontSize: 14,
    fontWeight: '500',
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  currencyConverter: {
    marginBottom: 8,
  },
  currencySelector: {
    alignSelf: 'flex-start',
  },
  currencyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  currencyCode: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray[700],
  },
  convertedTotal: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  convertedLabel: {
    fontSize: 12,
    color: COLORS.gray[600],
  },
  convertedValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
    position: 'relative',
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray[800],
    paddingVertical: 8,
  },
  searchResults: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 20,
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  searchResultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[800],
  },
  searchResultsCount: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  searchResult: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  resultIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[800],
    marginBottom: 2,
  },
  resultDescription: {
    fontSize: 12,
    color: COLORS.gray[600],
  },
  resultType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  resultTypeText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  statCardClickable: {
    // Add any clickable styles if needed
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  trendUp: {
    backgroundColor: '#E8F5E9',
  },
  trendDown: {
    backgroundColor: '#FFEBEE',
  },
  trendText: {
    fontSize: 10,
    fontWeight: '500',
  },
  statContent: {},
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.gray[800],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray[600],
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: COLORS.gray[500],
  },
  activitySection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray[800],
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  viewMoreText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: COLORS.gray[700],
    marginBottom: 4,
  },
  activityHighlight: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  activityMeta: {
    fontSize: 11,
    color: COLORS.gray[500],
  },
  activityStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityStatusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  quickActionsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  tabsContainer: {
    marginTop: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    position: 'relative',
  },
  activeTabButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  tabIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[600],
  },
  activeTabLabel: {
    color: COLORS.primary,
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  tabBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  newBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  newBadgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    transform: [{ translateX: -12 }],
    width: 24,
    height: 3,
    borderRadius: 3,
  },
  tabContent: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  comingSoon: {
    backgroundColor: COLORS.gray[50],
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderStyle: 'dashed',
  },
  comingSoonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[600],
    marginTop: 12,
  },
  comingSoonSubtext: {
    fontSize: 13,
    color: COLORS.gray[500],
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  goButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  goButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  footerQuickLinks: {
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[800],
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 13,
    color: COLORS.gray[600],
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 10,
    color: COLORS.gray[400],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  currencyModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray[800],
  },
  currencyList: {
    maxHeight: 400,
  },
  currencySection: {
    marginBottom: 20,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularCurrencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  selectedCurrencyItem: {
    backgroundColor: `${COLORS.primary}15`,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[700],
  },
  currencyCodeSmall: {
    fontSize: 12,
    color: COLORS.gray[600],
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  selectedCurrencyRow: {
    backgroundColor: `${COLORS.primary}10`,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencySymbolLarge: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.gray[700],
    width: 30,
  },
  currencyCodeLarge: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[800],
  },
  currencyName: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  currencyRate: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  earningsModal: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  earningsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  earningsLabel: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  viewAllButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  activityModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  activityModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  activityModalContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityModalTitle: {
    fontSize: 14,
    color: COLORS.gray[700],
    marginBottom: 2,
  },
  activityModalTime: {
    fontSize: 11,
    color: COLORS.gray[500],
  },
  activityPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  activityPillText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});

export default InfluencerDashboard;