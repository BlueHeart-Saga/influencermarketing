// C:\Sagadevan\quickbox\mobile\app\(brand)\(tabs)\dashboard.tsx
import React, { useState, useEffect, useContext, useCallback, useLayoutEffect } from "react";
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
import { useCurrency } from "../../../contexts/CurrencyContext";
import { campaignAPI } from "../../../services/campaignAPI";
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
  totalBudget: Record<string, number>;
  rates: Record<string, number>;
}

const CurrencyConverter = ({ selectedCurrency, onCurrencyChange, totalBudget, rates }: CurrencyConverterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllCurrencies, setShowAllCurrencies] = useState(false);

  const calculateConvertedTotal = useCallback(() => {
    if (!totalBudget || !rates || !selectedCurrency) return 0;

    let totalInSelectedCurrency = 0;
    Object.entries(totalBudget).forEach(([currencyCode, amount]) => {
      if (rates[currencyCode] && rates[selectedCurrency]) {
        const amountInGBP = amount / rates[currencyCode];
        const convertedAmount = amountInGBP * rates[selectedCurrency];
        totalInSelectedCurrency += convertedAmount;
      }
    });
    return totalInSelectedCurrency;
  }, [totalBudget, rates, selectedCurrency]);

  const convertedTotal = calculateConvertedTotal();

  const filteredCurrencies = Object.keys(CURRENCY_SYMBOLS).filter(currencyCode => {
    if (!searchTerm) return true;
    return (
      currencyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      CURRENCY_NAMES[currencyCode]?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatCurrency = (amount: number, currencyCode: string) => {
    const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
    const numAmount = typeof amount === 'number' ? amount : Number(amount) || 0;
    return `${symbol}${numAmount.toFixed(2)}`;
  };

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
                <View style={styles.currencySectionHeader}>
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
                        1 GBP = {(Number(rates[currencyCode]) || 0).toFixed(2)} {currencyCode}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Converted Total */}
      {convertedTotal > 0 && (
        <View style={styles.convertedTotal}>
          <Text style={styles.convertedLabel}>Total Budget:</Text>
          <Text style={styles.convertedValue}>
            {formatCurrency(convertedTotal, selectedCurrency)}
          </Text>
          {Object.keys(totalBudget || {}).length > 1 && (
            <Text style={styles.multiCurrencyHint}>
              (Combined from {Object.keys(totalBudget || {}).length} currencies)
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

// Quick Action Component
interface QuickActionProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  badge?: number;
  isNew?: boolean;
  onClick: () => void;
}

const QuickAction = ({ title, description, icon, color = COLORS.primary, badge, isNew, onClick }: QuickActionProps) => {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onClick} activeOpacity={0.7}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.quickActionContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Text style={[styles.quickActionTitle, { marginBottom: 0 }]}>{title}</Text>
          {badge !== undefined && badge > 0 && (
            <View style={{ backgroundColor: COLORS.danger, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}>
              <Text style={{ color: COLORS.white, fontSize: 10, fontWeight: '700' }}>{badge > 99 ? '99+' : badge}</Text>
            </View>
          )}
          {isNew && (
            <View style={{ backgroundColor: COLORS.warning, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}>
              <Text style={{ color: COLORS.white, fontSize: 10, fontWeight: '700' }}>NEW</Text>
            </View>
          )}
        </View>
        <Text style={styles.quickActionDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.gray[300]} />
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

// Search Result Component
interface SearchResult {
  type: string;
  title: string;
  description: string;
  data?: any;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
}

interface SearchResultItemProps {
  result: SearchResult;
  onClick: () => void;
}

const SearchResultItem = ({ result, onClick }: SearchResultItemProps) => {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    campaign: 'ribbon',
    application: 'mail',
    analytics: 'stats-chart',
    tool: 'cog',
  };

  const colorMap: Record<string, string> = {
    campaign: COLORS.primary,
    application: COLORS.success,
    analytics: COLORS.purple,
    tool: COLORS.warning,
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

// Budget Breakdown Component
interface BudgetBreakdownProps {
  totalBudget: Record<string, number>;
  rates: Record<string, number>;
  selectedCurrency: string;
  formatCurrency: (amount: number, currencyCode: string) => string;
  onClose: () => void;
}

const BudgetBreakdown = ({ totalBudget, rates, selectedCurrency, formatCurrency, onClose }: BudgetBreakdownProps) => {
  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.budgetModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Budget Breakdown by Currency</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.gray[700]} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {Object.entries(totalBudget).map(([currencyCode, amount]) => (
              <View key={currencyCode} style={styles.budgetItem}>
                <View style={styles.budgetCurrency}>
                  <Text style={styles.budgetCurrencyCode}>{currencyCode}</Text>
                  <Text style={styles.budgetCurrencyName}>
                    {CURRENCY_NAMES[currencyCode] || currencyCode}
                  </Text>
                </View>
                <View style={styles.budgetAmounts}>
                  <Text style={styles.budgetOriginal}>
                    {formatCurrency(amount, currencyCode)}
                  </Text>
                  {currencyCode !== selectedCurrency && rates && rates[currencyCode] && rates[selectedCurrency] && (
                    <Text style={styles.budgetConverted}>
                      ≈ {formatCurrency((amount / rates[currencyCode]) * rates[selectedCurrency], selectedCurrency)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { currency, changeCurrency, rates } = useCurrency();

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showBudgetBreakdown, setShowBudgetBreakdown] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);

  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    pendingApplications: 0,
    completedCampaigns: 0,
    totalBudget: {} as Record<string, number>,
    convertedTotal: 0,
    conversionRate: '0%',
    engagementRate: '4.2%',
    roi: '127%'
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setError('');
      const [campaignsRes, applicationsRes] = await Promise.all([
        campaignAPI.getBrandCampaigns(),
        campaignAPI.getBrandApplications()
      ]) as any[];

      const campaignsData = Array.isArray(campaignsRes?.data) ? campaignsRes.data : (Array.isArray(campaignsRes) ? campaignsRes : []);
      const applicationsData = Array.isArray(applicationsRes?.data) ? applicationsRes.data : (Array.isArray(applicationsRes) ? applicationsRes : []);

      const processedCampaigns = campaignsData.map((campaign: any) => ({
        ...campaign,
        currency: campaign.currency || 'USD'
      }));

      const processedApplications = applicationsData.map((app: any) => {
        // If campaign_title is missing but campaign_id exists, look it up
        if (!app.campaign_title && app.campaign_id) {
          const campaign = processedCampaigns.find((c: any) =>
            c.campaign_id === app.campaign_id ||
            c._id === app.campaign_id ||
            c.id === app.campaign_id
          );
          return { ...app, campaign_title: campaign?.title || 'Campaign' };
        }
        return app;
      });

      setCampaigns(processedCampaigns);
      setApplications(processedApplications);

    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to fetch data. Please check your connection and try again.');
      setCampaigns([]);
      setApplications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);



  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update stats
  useEffect(() => {
    if (!applications || !campaigns) return;

    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => ['active', 'live'].includes(c.status?.toLowerCase())).length;
    const completedCampaigns = campaigns.filter(c => ['completed', 'finished'].includes(c.status?.toLowerCase())).length;
    const pendingApplications = applications.filter(a => ['pending', 'review'].includes(a.status?.toLowerCase())).length;

    const budgetsByCurrency: Record<string, number> = {};
    campaigns.forEach(campaign => {
      const currencyCode = campaign.currency || 'USD';
      if (!budgetsByCurrency[currencyCode]) {
        budgetsByCurrency[currencyCode] = 0;
      }
      budgetsByCurrency[currencyCode] += Number(campaign.budget) || 0;
    });

    let convertedTotal = 0;
    if (rates && currency) {
      Object.entries(budgetsByCurrency).forEach(([currencyCode, amount]) => {
        if (rates[currencyCode] && rates[currency]) {
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

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const searchData: SearchResult[] = [
        ...campaigns.map(campaign => ({
          type: 'campaign',
          title: campaign.title,
          description: `${campaign.status} • ${campaign.applications?.length || 0} applications`,
          data: campaign,
        })),
        ...applications.map(app => ({
          type: 'application',
          title: `Application from ${app.influencer_name}`,
          description: `Status: ${app.status} • ${app.campaign_title}`,
          data: app,
        })),
        {
          type: 'analytics',
          title: 'Campaign Performance',
          description: 'View detailed analytics and metrics',
          data: null,
        },
        {
          type: 'analytics',
          title: 'ROI Calculator',
          description: 'Calculate campaign return on investment',
          data: null,
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
  }, [searchQuery, campaigns, applications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleCampaignCreated = () => {
    fetchData();
    router.push('/(brand)/(tabs)/campaigns');
  };

  const handleApplicationUpdate = () => fetchData();

  const handleSearchResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'campaign':
        router.push('/(brand)/(tabs)/campaigns');
        break;
      case 'application':
        router.push('/(brand)/(tabs)/campaigns/requests');
        break;
      case 'analytics':
        router.push('/(brand)/(tabs)/account/analytics');
        break;
      default:
        break;
    }
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
    const numAmount = typeof amount === 'number' ? amount : Number(amount) || 0;
    return `${symbol}${numAmount.toFixed(2)}`;
  };

  const tabs = [
    { id: 'create', label: 'Create', route: '/(brand)/(tabs)/campaigns/create', icon: 'add-circle' as const },
    { id: 'campaigns', label: 'Campaigns', route: '/(brand)/(tabs)/campaigns', icon: 'ribbon' as const, badge: stats.activeCampaigns },
    { id: 'applications', label: 'Applications', route: '/(brand)/(tabs)/campaigns/requests', icon: 'mail' as const, badge: stats.pendingApplications, badgeColor: COLORS.danger },
    { id: 'analytics', label: 'Analytics', route: '/(brand)/(tabs)/account/analytics', icon: 'stats-chart' as const },
    { id: 'aitools', label: 'AI Tools', route: '/(brand)/(tabs)/ai-tools', icon: 'cog' as const, isNew: true },
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
            onPress={() => fetchData()}
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
            totalBudget={stats.totalBudget}
            rates={rates || {}}
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.gray[400]} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="AI Search: campaigns, applications, analytics..."
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
              label="Total Campaigns"
              value={stats.totalCampaigns}
              icon="ribbon"
              color={COLORS.primary}
              subtitle="All campaigns"
              trend={{ direction: 'up', value: '+12%' }}
              onClick={() => router.push('/(brand)/(tabs)/campaigns')}
            />
            <StatCard
              label="Active Campaigns"
              value={stats.activeCampaigns}
              icon="trending-up"
              color={COLORS.success}
              subtitle="Live now"
              onClick={() => router.push('/(brand)/(tabs)/campaigns')}
            />
            <StatCard
              label="Pending Apps"
              value={stats.pendingApplications}
              icon="mail"
              color={COLORS.warning}
              subtitle="Needs review"
              trend={{ direction: 'up', value: '+5' }}
              onClick={() => router.push('/(brand)/(tabs)/campaigns/requests')}
            />
            <StatCard
              label="Total Budget"
              value={formatCurrency(stats.convertedTotal, currency)}
              icon="cash"
              color={COLORS.pink}
              subtitle={`In ${currency}`}
              onClick={() => setShowBudgetBreakdown(true)}
            />
            <StatCard
              label="Conversion Rate"
              value={stats.conversionRate}
              icon="people"
              color={COLORS.teal}
              subtitle="Application success"
              trend={{ direction: 'up', value: '+3%' }}
            />
            <StatCard
              label="Engagement"
              value={stats.engagementRate}
              icon="eye"
              color={COLORS.purple}
              subtitle="Avg. performance"
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
                    <Text style={styles.activityStrong}>{app.influencer_name}</Text> applied to{' '}
                    <Text style={styles.activityHighlight}>{app.campaign_title}</Text>
                  </Text>
                  <Text style={styles.activityMeta}>Just now • Application submitted</Text>
                </View>
                <View style={[styles.activityStatus, { backgroundColor: `${COLORS.warning}15` }]}>
                  <Text style={[styles.activityStatusText, { color: COLORS.warning }]}>
                    {app.status}
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
                            <Text style={styles.activityStrong}>{app.influencer_name}</Text> applied to{' '}
                            {app.campaign_title}
                          </Text>
                          <Text style={styles.activityModalTime}>Just now</Text>
                        </View>
                        <View style={[styles.activityPill, { backgroundColor: `${COLORS.warning}15` }]}>
                          <Text style={[styles.activityPillText, { color: COLORS.warning }]}>
                            {app.status}
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

        {/* Quick Actions Header */}
        <View style={[styles.sectionHeader, { paddingHorizontal: 16, marginTop: 12 }]}>
          <View>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Text style={styles.sectionSubtitle}>Common tasks and shortcuts</Text>
          </View>
        </View>

        {/* Footer Quick Links */}
        <View style={styles.footerQuickLinks}>
          <QuickAction
            title="Create Campaign"
            description="Launch a new influencer campaign"
            icon="add-circle"
            color={COLORS.primary}
            onClick={() => router.push('/(brand)/(tabs)/campaigns/create')}
          />
          <QuickAction
            title="Active Campaigns"
            description="Manage your ongoing campaigns"
            icon="ribbon"
            color={COLORS.info}
            badge={stats.activeCampaigns}
            onClick={() => router.push('/(brand)/(tabs)/campaigns')}
          />
          <QuickAction
            title="View Applications"
            description="Review pending applications"
            icon="mail"
            color={COLORS.success}
            badge={stats.pendingApplications}
            onClick={() => router.push('/(brand)/(tabs)/campaigns/requests')}
          />
          <QuickAction
            title="Analytics Dashboard"
            description="Campaign performance insights"
            icon="stats-chart"
            color={COLORS.purple}
            onClick={() => router.push('/(brand)/(tabs)/account/analytics')}
          />
          <QuickAction
            title="AI Tools"
            description="AI-powered marketing tools"
            icon="cog"
            color={COLORS.warning}
            isNew={true}
            onClick={() => router.push('/(brand)/(tabs)/ai-tools')}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Brio. Campaign Marketing Platform.
          </Text>
          <Text style={styles.footerVersion}>v2.1.0 • AI Enhanced • Currency: {currency}</Text>
        </View>
      </ScrollView>

      {/* Budget Breakdown Modal */}
      {showBudgetBreakdown && (
        <BudgetBreakdown
          totalBudget={stats.totalBudget}
          rates={rates || {}}
          selectedCurrency={currency}
          formatCurrency={formatCurrency}
          onClose={() => setShowBudgetBreakdown(false)}
        />
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
    color: COLORS.gray[800],
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.gray[500],
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
  multiCurrencyHint: {
    fontSize: 10,
    color: COLORS.gray[500],
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
  activityStrong: {
    fontWeight: '600',
    color: COLORS.gray[800],
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
  currencySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  showAllText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
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
  budgetModal: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    width: '90%',
    maxHeight: '80%',
  },
  budgetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  budgetCurrency: {
    flex: 1,
  },
  budgetCurrencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[800],
  },
  budgetCurrencyName: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  budgetAmounts: {
    alignItems: 'flex-end',
  },
  budgetOriginal: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[800],
  },
  budgetConverted: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
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

export default Dashboard;