import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  FlatList,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TabView, SceneMap } from 'react-native-tab-view';
import { BlurView } from 'expo-blur';
import {
  brandAnalyticsApi,
  DashboardData,
  CampaignsData,
  CampaignDetailData,
  PaymentsData,
  ApplicationsData,
  FinancialData,
  InfluencerPerformanceData,
  BrandProfile,
} from '../../../../services/brandAnalyticsAPI';

const { width } = Dimensions.get('window');
const PRIMARY_BLUE = 'rgb(15, 110, 234)';
const CHART_COLORS = {
  primary: '#4361ee',
  secondary: '#06d6a0',
  tertiary: '#7209b7',
  warning: '#f9c74f',
  danger: '#ef476f',
  neutral: '#64748b',
};

type TabType = 'dashboard' | 'campaigns' | 'campaign-detail' | 'payments' | 'applications' | 'financial' | 'influencer';

interface FilterState {
  status: string;
  category: string;
  startDate: Date | null;
  endDate: Date | null;
  minAmount: string;
  maxAmount: string;
  campaignId: string;
  influencerId: string;
  searchQuery: string;
}

const TAB_CONFIG = {
  dashboard: { title: "Overview", icon: "view-dashboard", color: '#0f6eea', bg: "rgba(15, 110, 234, 0.12)" },
  campaigns: { title: "Campaigns", icon: "bullhorn", color: '#10B981', bg: "rgba(16, 185, 129, 0.12)" },
  payments: { title: "Payments", icon: "cash", color: '#F59E0B', bg: "rgba(245, 158, 11, 0.12)" },
  applications: { title: "Apps", icon: "file-document", color: '#8B5CF6', bg: "rgba(139, 92, 246, 0.12)" },
  financial: { title: "Financial", icon: "finance", color: '#EF4444', bg: "rgba(239, 68, 68, 0.12)" },
  influencer: { title: "Influencers", icon: "account-star", color: '#0EA5E9', bg: "rgba(14, 165, 233, 0.12)" },
};

const BrandAnalytics: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const layout = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'dashboard', title: 'Overview' },
    { key: 'campaigns', title: 'Campaigns' },
    { key: 'payments', title: 'Payments' },
    { key: 'applications', title: 'Applications' },
    { key: 'financial', title: 'Financial' },
    { key: 'influencer', title: 'Influencers' },
  ]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const setActiveTab = (tabKey: TabType) => {
    const tabIndex = routes.findIndex(r => r.key === tabKey);
    if (tabIndex !== -1) {
      setIndex(tabIndex);
      setSelectedCampaign(null);
    } else if (tabKey === 'campaign-detail') {
      // Logic handled specifically within the Campaigns tab
    }
  };

  const activeTab = routes[index].key as TabType;
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [campaignsData, setCampaignsData] = useState<CampaignsData | null>(null);
  const [campaignDetail, setCampaignDetail] = useState<CampaignDetailData | null>(null);
  const [paymentsData, setPaymentsData] = useState<PaymentsData | null>(null);
  const [applicationsData, setApplicationsData] = useState<ApplicationsData | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [influencerPerformance, setInfluencerPerformance] = useState<InfluencerPerformanceData | null>(null);

  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    category: '',
    startDate: null,
    endDate: null,
    minAmount: '',
    maxAmount: '',
    campaignId: '',
    influencerId: '',
    searchQuery: '',
  });

  // Period selectors
  const [dashboardPeriod, setDashboardPeriod] = useState('30days');
  const [financialPeriod, setFinancialPeriod] = useState('monthly');

  // UI States
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [expandedCharts, setExpandedCharts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!loading && activeTab !== 'dashboard') {
      refreshTabData();
    }
  }, [activeTab, filters, financialPeriod]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchBrandProfile(),
        fetchDashboard(),
        fetchCampaigns(),
        fetchPayments(),
        fetchApplications(),
        fetchFinancial(),
        fetchInfluencerPerformance(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshTabData = async () => {
    try {
      if (activeTab === 'campaigns') {
        await fetchCampaigns();
      } else if (activeTab === 'payments') {
        await fetchPayments();
      } else if (activeTab === 'applications') {
        await fetchApplications();
      } else if (activeTab === 'financial') {
        await fetchFinancial();
      } else if (activeTab === 'influencer') {
        await fetchInfluencerPerformance();
      }
    } catch (error) {
      console.error('Error refreshing tab data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(brand)/(tabs)/account");
    }
  };

  const fetchBrandProfile = async () => {
    try {
      const data = await brandAnalyticsApi.getBrandProfile();
      setBrandProfile(data);
    } catch (error) {
      console.error('Error fetching brand profile:', error);
    }
  };

  const fetchDashboard = async () => {
    try {
      // Try cache first
      const cached = await brandAnalyticsApi.getCachedDashboardData();
      if (cached) {
        setDashboardData(cached);
      }

      const response = await brandAnalyticsApi.getDashboardAnalytics();
      if (response.success) {
        setDashboardData(response.data);
        await brandAnalyticsApi.cacheDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const params: any = {};
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.start_date = filters.startDate.toISOString().split('T')[0];
      if (filters.endDate) params.end_date = filters.endDate.toISOString().split('T')[0];

      const response = await brandAnalyticsApi.getCampaignsAnalytics(params);
      if (response.success) {
        setCampaignsData(response.data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchCampaignDetail = async (campaignId: string) => {
    try {
      const response = await brandAnalyticsApi.getCampaignDetail(campaignId);
      if (response.success) {
        setCampaignDetail(response.data);
        setSelectedCampaign(campaignId);
        setActiveTab('campaign-detail');
      }
    } catch (error) {
      console.error('Error fetching campaign detail:', error);
      Alert.alert('Error', 'Failed to load campaign details');
    }
  };

  const fetchPayments = async () => {
    try {
      const params: any = {};
      if (filters.status) params.status = filters.status;
      if (filters.campaignId) params.campaign_id = filters.campaignId;
      if (filters.startDate) params.start_date = filters.startDate.toISOString().split('T')[0];
      if (filters.endDate) params.end_date = filters.endDate.toISOString().split('T')[0];
      if (filters.minAmount) params.min_amount = parseFloat(filters.minAmount);
      if (filters.maxAmount) params.max_amount = parseFloat(filters.maxAmount);

      const response = await brandAnalyticsApi.getPaymentAnalytics(params);
      if (response.success) {
        setPaymentsData(response.data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const params: any = {};
      if (filters.status) params.status = filters.status;
      if (filters.campaignId) params.campaign_id = filters.campaignId;
      if (filters.influencerId) params.influencer_id = filters.influencerId;
      if (filters.startDate) params.start_date = filters.startDate.toISOString().split('T')[0];
      if (filters.endDate) params.end_date = filters.endDate.toISOString().split('T')[0];

      const response = await brandAnalyticsApi.getApplicationAnalytics(params);
      if (response.success) {
        setApplicationsData(response.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchFinancial = async () => {
    try {
      const response = await brandAnalyticsApi.getFinancialAnalytics(financialPeriod);
      if (response.success) {
        setFinancialData(response.data);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
    }
  };

  const fetchInfluencerPerformance = async () => {
    try {
      const response = await brandAnalyticsApi.getInfluencerPerformance(1, 0);
      if (response.success) {
        setInfluencerPerformance(response.data);
      }
    } catch (error) {
      console.error('Error fetching influencer performance:', error);
    }
  };

  const handleExport = async (dataType: string) => {
    Alert.alert(
      'Export Data',
      `Choose export format for ${dataType}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'JSON',
          onPress: async () => {
            setExportLoading(true);
            try {
              const params: any = {};
              if (filters.startDate) params.start_date = filters.startDate.toISOString().split('T')[0];
              if (filters.endDate) params.end_date = filters.endDate.toISOString().split('T')[0];

              await brandAnalyticsApi.shareExportedData(dataType, 'json');
            } catch (error) {
              Alert.alert('Export Failed', 'Could not export data');
            } finally {
              setExportLoading(false);
            }
          },
        },
        {
          text: 'CSV',
          onPress: async () => {
            setExportLoading(true);
            try {
              const params: any = {};
              if (filters.startDate) params.start_date = filters.startDate.toISOString().split('T')[0];
              if (filters.endDate) params.end_date = filters.endDate.toISOString().split('T')[0];

              await brandAnalyticsApi.shareExportedData(dataType, 'csv');
            } catch (error) {
              Alert.alert('Export Failed', 'Could not export data');
            } finally {
              setExportLoading(false);
            }
          },
        },
      ]
    );
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      startDate: null,
      endDate: null,
      minAmount: '',
      maxAmount: '',
      campaignId: '',
      influencerId: '',
      searchQuery: '',
    });
    setShowFilterModal(false);
  };

  const toggleChartExpansion = (chartId: string) => {
    setExpandedCharts(prev => ({
      ...prev,
      [chartId]: !prev[chartId],
    }));
  };

  // Render Stat Card
  const StatCard = ({ title, value, change, icon, color = 'primary', loading = false }: any) => {
    if (loading) {
      return <View style={styles.statCardSkeleton} />;
    }

    return (
      <View style={[styles.statCard as any, { borderLeftColor: (CHART_COLORS as any)[color] }]}>
        <View style={styles.statHeader}>
          <View style={[styles.statIcon as any, { backgroundColor: `${(CHART_COLORS as any)[color]}20` }]}>
            <Icon name={icon} size={16} color={(CHART_COLORS as any)[color]} />
          </View>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Text style={styles.statValue}>{value}</Text>
        {change !== undefined && (
          <View style={[styles.statChange as any, change >= 0 ? (styles.positiveChange as any) : (styles.negativeChange as any)]}>
            <Icon name={change >= 0 ? 'arrow-up' : 'arrow-down'} size={12} color={change >= 0 ? '#10b981' : '#ef4444'} />
            <Text style={styles.statChangeText}>{Math.abs(change)}%</Text>
          </View>
        )}
      </View>
    );
  };

  // Render Chart Card
  const ChartCard = ({ title, children, expandable = true }: any) => {
    const chartId = title.toLowerCase().replace(/\s+/g, '-');
    const isExpanded = expandedCharts[chartId];

    return (
      <View style={[styles.chartCard, isExpanded && styles.expandedChart]}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{title}</Text>
          {expandable && (
            <TouchableOpacity onPress={() => toggleChartExpansion(chartId)} style={styles.expandButton}>
              <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
        <View style={[styles.chartContent, isExpanded && styles.expandedChartContent]}>
          {children}
        </View>
      </View>
    );
  };

  // Render Status Badge
  const StatusBadge = ({ status }: { status: string }) => (
    <View style={[styles.statusBadge, { backgroundColor: brandAnalyticsApi.getStatusColor(status) }]}>
      <Text style={styles.statusBadgeText}>{status}</Text>
    </View>
  );

  // Dashboard Tab
  const DashboardTab = () => {
    if (!dashboardData) return null;

    const summary = dashboardData.campaigns_summary;
    const performance = dashboardData.performance_metrics;

    const stats = [
      {
        title: 'Total Campaigns',
        value: summary.total_campaigns.toString(),
        change: 12,
        icon: 'shopping',
        color: 'primary',
      },
      {
        title: 'Total Applications',
        value: brandAnalyticsApi.formatNumber(performance.total_applications || 0),
        change: 8,
        icon: 'account-group',
        color: 'secondary',
      },
      {
        title: 'Total Spent',
        value: brandAnalyticsApi.formatCurrency(performance.total_spent || 0),
        change: -5,
        icon: 'cash',
        color: 'warning',
      },
      {
        title: 'Average ROI',
        value: brandAnalyticsApi.formatPercentage(performance.average_roi || 0),
        change: 18,
        icon: 'trending-up',
        color: 'tertiary',
      },
    ];

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.dashboardHeader}>
          <View style={styles.brandInfo}>
            {brandProfile?.profile?.logo ? (
              <Image source={{ uri: `${API_BASE_URL}/profiles/image/${brandProfile.profile.logo}` }} style={styles.brandLogo} />
            ) : (
              <View style={styles.brandLogoPlaceholder}>
                <Text style={styles.brandLogoText}>
                  {brandProfile?.profile?.company_name?.[0] || 'B'}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.brandName}>{brandProfile?.profile?.company_name || 'Brand'}</Text>
              <Text style={styles.pageSubtitle}>Analytics Dashboard</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity onPress={onRefresh} style={styles.iconButton}>
              <Icon name="refresh" size={20} color={PRIMARY_BLUE} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleExport('summary')} style={styles.exportButton} disabled={exportLoading}>
              {exportLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="download" size={16} color="#fff" />
                  <Text style={styles.exportButtonText}>Export</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {dashboardData.recent_activity?.payments?.slice(0, 3).map((payment, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Icon
                  name={payment.status === 'completed' ? 'check-circle' : 'alert-circle'}
                  size={16}
                  color={payment.status === 'completed' ? CHART_COLORS.secondary : CHART_COLORS.warning}
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Payment to {payment.influencer_name}</Text>
                <Text style={styles.activityDetails}>
                  {brandAnalyticsApi.formatCurrency(payment.amount)} • {payment.campaign_title}
                </Text>
              </View>
              <StatusBadge status={payment.status} />
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // Campaigns Tab
  const CampaignsTab = () => {
    if (selectedCampaign && campaignDetail) {
      return <CampaignDetailTab />;
    }
    if (!campaignsData) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.tabHeader}>
          <Text style={styles.pageTitle}>Campaign Analytics</Text>
          <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterButton}>
            <Icon name="filter-variant" size={20} color={PRIMARY_BLUE} />
          </TouchableOpacity>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <View style={styles.smallStatCard}>
            <Text style={styles.smallStatLabel}>Total Campaigns</Text>
            <Text style={styles.smallStatValue}>{campaignsData.summary.total_campaigns}</Text>
          </View>
          <View style={styles.smallStatCard}>
            <Text style={styles.smallStatLabel}>Total Budget</Text>
            <Text style={styles.smallStatValue}>{brandAnalyticsApi.formatCurrency(campaignsData.summary.total_budget)}</Text>
          </View>
          <View style={styles.smallStatCard}>
            <Text style={styles.smallStatLabel}>Applications</Text>
            <Text style={styles.smallStatValue}>{campaignsData.summary.total_applications}</Text>
          </View>
          <View style={styles.smallStatCard}>
            <Text style={styles.smallStatLabel}>Avg Performance</Text>
            <Text style={styles.smallStatValue}>{brandAnalyticsApi.formatPercentage(campaignsData.summary.average_performance)}</Text>
          </View>
        </View>

        {/* Campaigns List */}
        <View style={styles.campaignsList}>
          {campaignsData.campaigns.map((campaign) => (
            <TouchableOpacity
              key={campaign._id}
              style={styles.campaignCard}
              onPress={() => fetchCampaignDetail(campaign._id)}
            >
              <View style={styles.campaignHeader}>
                <View>
                  <Text style={styles.campaignTitle}>{campaign.title}</Text>
                  <Text style={styles.campaignCategory}>{campaign.category || 'Uncategorized'}</Text>
                </View>
                <StatusBadge status={campaign.status} />
              </View>

              <View style={styles.campaignStats}>
                <View style={styles.campaignStat}>
                  <Icon name="cash" size={14} color={PRIMARY_BLUE} />
                  <Text style={styles.campaignStatLabel}>Budget:</Text>
                  <Text style={styles.campaignStatValue}>{brandAnalyticsApi.formatCurrency(campaign.budget)}</Text>
                </View>
                <View style={styles.campaignStat}>
                  <Icon name="account-group" size={14} color={PRIMARY_BLUE} />
                  <Text style={styles.campaignStatLabel}>Apps:</Text>
                  <Text style={styles.campaignStatValue}>{campaign.application_stats.total}</Text>
                </View>
                <View style={styles.campaignStat}>
                  <Icon name="star" size={14} color={PRIMARY_BLUE} />
                  <Text style={styles.campaignStatLabel}>Score:</Text>
                  <Text style={styles.campaignStatValue}>{campaign.analytics.performance_score?.toFixed(0)}%</Text>
                </View>
              </View>

              <View style={styles.campaignFooter}>
                <View style={styles.campaignProgress}>
                  <View
                    style={[
                      styles.campaignProgressFill,
                      {
                        width: `${campaign.payment_summary.total_amount_paid / campaign.budget * 100}%`,
                        backgroundColor: campaign.analytics.performance_score > 70 ? CHART_COLORS.secondary : CHART_COLORS.warning,
                      },
                    ]}
                  />
                </View>
                <TouchableOpacity style={styles.viewButton}>
                  <Icon name="eye" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  // Campaign Detail Tab
  const CampaignDetailTab = () => {
    if (!campaignDetail) return null;

    const { campaign, analytics, applications, payments } = campaignDetail;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.tabHeader}>
          <TouchableOpacity onPress={() => setActiveTab('campaigns')} style={styles.backButton}>
            <Icon name="arrow-left" size={20} color={PRIMARY_BLUE} />
          </TouchableOpacity>
          <Text style={styles.pageTitle} numberOfLines={1}>{campaign.title}</Text>
        </View>

        {/* Campaign Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.cardTitle}>Campaign Overview</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Category</Text>
              <Text style={styles.overviewValue}>{campaign.category || 'Uncategorized'}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Budget</Text>
              <Text style={styles.overviewValue}>{brandAnalyticsApi.formatCurrency(campaign.budget)}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Status</Text>
              <StatusBadge status={campaign.status} />
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Applications</Text>
              <Text style={styles.overviewValue}>{applications.total}</Text>
            </View>
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsCard}>
          <Text style={styles.cardTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            {[
              { label: 'Engagement', value: analytics.engagement_rate, icon: 'chart-line' },
              { label: 'Conversion', value: analytics.conversion_rate, icon: 'trending-up' },
              { label: 'ROI', value: analytics.roi, icon: 'cash' },
              { label: 'Completion', value: analytics.completion_rate, icon: 'check-circle' },
            ].map((metric, index) => (
              <View key={index} style={styles.metricItem}>
                <Icon name={metric.icon} size={16} color={PRIMARY_BLUE} />
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricValue}>{brandAnalyticsApi.formatPercentage(metric.value)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Applications Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Applications Status</Text>
          {Object.entries(applications.status_distribution).map(([status, count]) => (
            <View key={status} style={styles.statusRow}>
              <View style={styles.statusLabelContainer}>
                <View style={[styles.statusDot, { backgroundColor: brandAnalyticsApi.getStatusColor(status) }]} />
                <Text style={styles.statusLabel}>{status}</Text>
              </View>
              <Text style={styles.statusCount}>{count}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // Payments Tab
  const PaymentsTab = () => {
    if (!paymentsData) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.tabHeader}>
          <Text style={styles.pageTitle}>Payment Analytics</Text>
          <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterButton}>
            <Icon name="filter-variant" size={20} color={PRIMARY_BLUE} />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.smallStatCard}>
            <Text style={styles.smallStatLabel}>Total Payments</Text>
            <Text style={styles.smallStatValue}>{paymentsData.summary.total_payments}</Text>
          </View>
          <View style={styles.smallStatCard}>
            <Text style={styles.smallStatLabel}>Total Amount</Text>
            <Text style={styles.smallStatValue}>{brandAnalyticsApi.formatCurrency(paymentsData.summary.total_amount)}</Text>
          </View>
          <View style={styles.smallStatCard}>
            <Text style={styles.smallStatLabel}>Success Rate</Text>
            <Text style={styles.smallStatValue}>{brandAnalyticsApi.formatPercentage(paymentsData.summary.completion_rate)}</Text>
          </View>
        </View>

        {/* Payments List */}
        <View style={styles.paymentsList}>
          {paymentsData.payments.slice(0, 10).map((payment) => (
            <View key={payment._id} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <View>
                  <Text style={styles.paymentInfluencer}>{payment.influencer_name || 'Unknown'}</Text>
                  <Text style={styles.paymentCampaign}>{payment.campaign_title}</Text>
                </View>
                <StatusBadge status={payment.status} />
              </View>
              <View style={styles.paymentFooter}>
                <Text style={styles.paymentAmount}>{brandAnalyticsApi.formatCurrency(payment.amount)}</Text>
                <Text style={styles.paymentDate}>{brandAnalyticsApi.formatDate(payment.created_at)}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // Applications Tab
  const ApplicationsTab = () => {
    if (!applicationsData) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.tabHeader}>
          <Text style={styles.pageTitle}>Application Analytics</Text>
          <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterButton}>
            <Icon name="filter-variant" size={20} color={PRIMARY_BLUE} />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.smallStatCard}>
            <Text style={styles.smallStatLabel}>Total Apps</Text>
            <Text style={styles.smallStatValue}>{applicationsData.summary.total_applications}</Text>
          </View>
          <View style={styles.smallStatCard}>
            <Text style={styles.smallStatLabel}>Approval Rate</Text>
            <Text style={styles.smallStatValue}>{brandAnalyticsApi.formatPercentage(applicationsData.summary.conversion_rates.approval_rate)}</Text>
          </View>
          <View style={styles.smallStatCard}>
            <Text style={styles.smallStatLabel}>Completion Rate</Text>
            <Text style={styles.smallStatValue}>{brandAnalyticsApi.formatPercentage(applicationsData.summary.conversion_rates.completion_rate)}</Text>
          </View>
        </View>

        {/* Applications List */}
        <View style={styles.applicationsList}>
          {applicationsData.applications.slice(0, 10).map((app, index) => (
            <View key={index} style={styles.applicationCard}>
              <View style={styles.applicationHeader}>
                <View>
                  <Text style={styles.applicationInfluencer}>{app.influencer_name || 'Unknown'}</Text>
                  <Text style={styles.applicationCampaign}>{app.campaign_title}</Text>
                </View>
                <StatusBadge status={app.status} />
              </View>
              <View style={styles.applicationFooter}>
                <View style={styles.applicationMatch}>
                  <Icon name="star" size={12} color="#FFD700" />
                  <Text style={styles.applicationMatchText}>Match: {app.match_score?.toFixed(0)}%</Text>
                </View>
                <Text style={styles.applicationAmount}>{brandAnalyticsApi.formatCurrency(app.proposed_amount)}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // Financial Tab
  const FinancialTab = () => {
    if (!financialData) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.tabHeader}>
          <Text style={styles.pageTitle}>Financial Analytics</Text>
          <TouchableOpacity onPress={() => handleExport('financial')} style={styles.exportButton} disabled={exportLoading}>
            {exportLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="download" size={16} color="#fff" />
                <Text style={styles.exportButtonText}>Export</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Financial Overview */}
        <View style={styles.financialCard}>
          <Text style={styles.cardTitle}>Financial Overview</Text>
          <View style={styles.financialMetrics}>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Total Budget</Text>
              <Text style={styles.financialValue}>{brandAnalyticsApi.formatCurrency(financialData.summary.total_budget)}</Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Total Spent</Text>
              <Text style={styles.financialValue}>{brandAnalyticsApi.formatCurrency(financialData.summary.total_spent)}</Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Remaining</Text>
              <Text style={[styles.financialValue, styles.positiveValue]}>
                {brandAnalyticsApi.formatCurrency(financialData.summary.remaining_budget)}
              </Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Budget Utilization</Text>
              <Text style={styles.financialValue}>{brandAnalyticsApi.formatPercentage(financialData.summary.budget_utilization)}</Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Average ROI</Text>
              <Text style={[styles.financialValue, financialData.summary.average_roi > 0 ? styles.positiveValue : styles.negativeValue]}>
                {brandAnalyticsApi.formatPercentage(financialData.summary.average_roi)}
              </Text>
            </View>
          </View>
        </View>

        {/* Top Campaigns */}
        <View style={styles.topCampaignsCard}>
          <Text style={styles.cardTitle}>Top Campaigns by Spending</Text>
          {financialData.campaign_spending.top_campaigns.map((campaign, index) => (
            <View key={campaign.campaign_id} style={styles.topCampaignRow}>
              <Text style={styles.topCampaignRank}>{index + 1}</Text>
              <View style={styles.topCampaignInfo}>
                <Text style={styles.topCampaignTitle}>{campaign.title}</Text>
                <Text style={styles.topCampaignSpent}>{brandAnalyticsApi.formatCurrency(campaign.spent)}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // Influencer Performance Tab
  const InfluencerPerformanceTab = () => {
    if (!influencerPerformance) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.tabHeader}>
          <Text style={styles.pageTitle}>Influencer Performance</Text>
          <TouchableOpacity onPress={() => handleExport('influencer-performance')} style={styles.exportButton} disabled={exportLoading}>
            {exportLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="download" size={16} color="#fff" />
                <Text style={styles.exportButtonText}>Export</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search influencers..."
            value={filters.searchQuery}
            onChangeText={(text) => setFilters({ ...filters, searchQuery: text })}
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.smallStatCard}>
            <Text style={styles.smallStatLabel}>Total Influencers</Text>
            <Text style={styles.smallStatValue}>{influencerPerformance.total_influencers}</Text>
          </View>
          <View style={styles.smallStatCard}>
            <Text style={styles.smallStatLabel}>Avg Completion</Text>
            <Text style={styles.smallStatValue}>
              {brandAnalyticsApi.formatPercentage(
                influencerPerformance.influencer_performance.reduce((sum, inf) => sum + (inf.metrics.completion_rate || 0), 0) /
                (influencerPerformance.influencer_performance.length || 1)
              )}
            </Text>
          </View>
        </View>

        {/* Influencers List */}
        <View style={styles.influencersList}>
          {influencerPerformance.influencer_performance
            .filter(inf =>
              inf.profile?.username?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
              inf.profile?.profile?.full_name?.toLowerCase().includes(filters.searchQuery.toLowerCase())
            )
            .slice(0, 10)
            .map((inf) => (
              <View key={inf.influencer_id} style={styles.influencerCard}>
                <View style={styles.influencerHeader}>
                  <View>
                    <Text style={styles.influencerName}>
                      {inf.profile?.profile?.full_name || inf.profile?.username || 'Unknown'}
                    </Text>
                    <Text style={styles.influencerFollowers}>
                      <Icon name="account-group" size={12} /> {brandAnalyticsApi.formatNumber(inf.profile?.profile?.followers?.total || 0)} followers
                    </Text>
                  </View>
                </View>

                <View style={styles.influencerStats}>
                  <View style={styles.influencerStat}>
                    <Text style={styles.influencerStatLabel}>Apps</Text>
                    <Text style={styles.influencerStatValue}>{inf.metrics.total_applications}</Text>
                  </View>
                  <View style={styles.influencerStat}>
                    <Text style={styles.influencerStatLabel}>Completed</Text>
                    <Text style={styles.influencerStatValue}>{inf.metrics.completed_campaigns}</Text>
                  </View>
                  <View style={styles.influencerStat}>
                    <Text style={styles.influencerStatLabel}>Completion</Text>
                    <Text style={styles.influencerStatValue}>{brandAnalyticsApi.formatPercentage(inf.metrics.completion_rate)}</Text>
                  </View>
                  <View style={styles.influencerStat}>
                    <Text style={styles.influencerStatLabel}>Earnings</Text>
                    <Text style={styles.influencerStatValue}>{brandAnalyticsApi.formatCurrency(inf.metrics.total_earnings)}</Text>
                  </View>
                </View>
              </View>
            ))}
        </View>
      </ScrollView>
    );
  };

  // Filter Modal
  const FilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Icon name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.filterChips}>
              {['', 'active', 'pending', 'completed'].map((status) => (
                <TouchableOpacity
                  key={status || 'all'}
                  style={[
                    styles.filterChip,
                    filters.status === status && styles.filterChipActive,
                  ]}
                  onPress={() => setFilters({ ...filters, status })}
                >
                  <Text style={[filters.status === status && styles.filterChipTextActive]}>
                    {status || 'All'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Date Range</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text>{filters.startDate ? filters.startDate.toLocaleDateString() : 'Start Date'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text>{filters.endDate ? filters.endDate.toLocaleDateString() : 'End Date'}</Text>
            </TouchableOpacity>

            {showStartDatePicker && (
              <DateTimePicker
                value={filters.startDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowStartDatePicker(false);
                  if (date) setFilters({ ...filters, startDate: date });
                }}
              />
            )}

            {showEndDatePicker && (
              <DateTimePicker
                value={filters.endDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowEndDatePicker(false);
                  if (date) setFilters({ ...filters, endDate: date });
                }}
              />
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={clearFilters} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowFilterModal(false)}
              style={[styles.applyButton, { backgroundColor: PRIMARY_BLUE }]}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_BLUE} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  const renderTabBar = (props: any) => {
    const { navigationState, position, jumpTo } = props;
    const HORIZONTAL_MARGIN = 16;
    const barWidth = layout.width - (HORIZONTAL_MARGIN * 2);
    const tabWidth = barWidth / routes.length;

    const translateX = position.interpolate({
      inputRange: routes.map((_, i) => i),
      outputRange: routes.map((_, i) => i * tabWidth + 4),
    });

    return (
      <View style={styles.tabBarWrapper}>
        <View style={styles.floatingContainer}>
          <BlurView intensity={90} tint="light" style={styles.blur}>
            <Animated.View
              style={[
                styles.activeIndicator,
                {
                  width: tabWidth - 8,
                  transform: [{ translateX }],
                  backgroundColor: TAB_CONFIG[routes[index].key as keyof typeof TAB_CONFIG].bg,
                  borderColor: TAB_CONFIG[routes[index].key as keyof typeof TAB_CONFIG].color + "30",
                },
              ]}
            />

            <View style={styles.tabsContainer}>
              {navigationState.routes.map((route: any, i: number) => {
                const isFocused = navigationState.index === i;
                const config = TAB_CONFIG[route.key as keyof typeof TAB_CONFIG];
                const color = isFocused ? config.color : "#94a3b8";

                return (
                  <TouchableOpacity
                    key={route.key}
                    onPress={() => jumpTo(route.key)}
                    style={styles.tabItem}
                    activeOpacity={0.7}
                  >
                    <View style={styles.tabContentBadge}>
                      <Icon
                        name={config.icon}
                        size={18}
                        color={color}
                      />
                      {isFocused && (
                        <Text style={[styles.tabLabelFloating, { color }]} numberOfLines={1}>
                          {config.title}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </BlurView>
        </View>
      </View>
    );
  };

  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case 'dashboard': return <DashboardTab />;
      case 'campaigns': return selectedCampaign ? <CampaignDetailTab /> : <CampaignsTab />;
      case 'payments': return <PaymentsTab />;
      case 'applications': return <ApplicationsTab />;
      case 'financial': return <FinancialTab />;
      case 'influencer': return <InfluencerPerformanceTab />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_BLUE} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_BLUE} />

      {/* Modern Brand Header */}
      <LinearGradient
        colors={[PRIMARY_BLUE, '#1e40af']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topHeaderEnhanced}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.topHeaderContent}>
            <TouchableOpacity style={styles.headerIconButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>

            <View style={styles.brandProfileHeader}>
              <View style={styles.brandLogoContainer}>
                {brandProfile?.profile?.logo ? (
                  <Image source={{ uri: `${API_BASE_URL}/profiles/image/${brandProfile.profile.logo}` }} style={styles.brandHeaderLogo} />
                ) : (
                  <View style={styles.brandLogoPlaceholderHeader}>
                    <Text style={styles.brandLogoPlaceholderTextHeader}>
                      {brandProfile?.profile?.company_name?.[0] || 'B'}
                    </Text>
                  </View>
                )}
              </View>
              <View>
                <Text style={styles.brandHeaderName}>{brandProfile?.profile?.company_name || 'Brand'}</Text>
                <View style={styles.brandStatusTag}>
                  <View style={styles.activePulse} />
                  <Text style={styles.brandStatusText}>Business Account</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.headerIconButton} onPress={onRefresh}>
              <Ionicons name="refresh" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Quick Metrics Header Row */}
          <View style={styles.quickMetricsRow}>
            <View style={styles.quickMetric}>
              <Text style={styles.quickMetricLabel}>Total Reach</Text>
              <Text style={styles.quickMetricValue}>
                {brandAnalyticsApi.formatNumber(dashboardData?.performance_metrics?.total_engagement || 0)}
              </Text>
            </View>
            <View style={styles.quickMetricDivider} />
            <View style={styles.quickMetric}>
              <Text style={styles.quickMetricLabel}>Total Spent</Text>
              <Text style={styles.quickMetricValue}>
                {brandAnalyticsApi.formatCurrency(dashboardData?.performance_metrics?.total_spent || 0)}
              </Text>
            </View>
            <View style={styles.quickMetricDivider} />
            <View style={styles.quickMetric}>
              <Text style={styles.quickMetricLabel}>Campaigns</Text>
              <Text style={styles.quickMetricValue}>
                {dashboardData?.campaigns_summary?.total_campaigns || 0}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Swipeable Tabs Container */}
      <View style={{ flex: 1, marginTop: -20 }}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}
          tabBarPosition="top"
          swipeEnabled={!selectedCampaign}
        />
      </View>

      <FilterModal />
    </View>
  );
};

const styles = StyleSheet.create({
  topHeaderEnhanced: {
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  topHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandLogoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandHeaderLogo: {
    width: '100%',
    height: '100%',
  },
  brandLogoPlaceholderHeader: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PRIMARY_BLUE,
  },
  brandLogoPlaceholderTextHeader: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  brandHeaderName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  brandStatusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  activePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  brandStatusText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '500',
  },
  quickMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 5,
  },
  quickMetric: {
    alignItems: 'center',
  },
  quickMetricLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickMetricValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  quickMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabBarWrapper: {
    paddingTop: 0,
    paddingBottom: 8,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  floatingContainer: {
    height: 52,
    marginHorizontal: 16,
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    backgroundColor: '#fff',
  },
  blur: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tabLabelFloating: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    height: 38,
    borderRadius: 19,
    top: 7,
    borderWidth: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    gap: 6,
  },
  activeTab: {
    backgroundColor: `${PRIMARY_BLUE}15`,
    color: '#ffffff',
  },
  tabLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  brandLogoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${PRIMARY_BLUE}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogoText: {
    fontSize: 20,
    fontWeight: '600',
    color: PRIMARY_BLUE,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_BLUE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 44) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardSkeleton: {
    width: (width - 44) / 2,
    height: 100,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  statChangeText: {
    fontSize: 12,
  },
  recentActivitySection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  activityDetails: {
    fontSize: 12,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  chartCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  expandedChart: {
    minHeight: 400,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  expandButton: {
    padding: 4,
  },
  chartContent: {
    minHeight: 200,
  },
  expandedChartContent: {
    minHeight: 350,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  smallStatCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  smallStatLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
  },
  smallStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  campaignsList: {
    gap: 12,
  },
  campaignCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  campaignTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  campaignCategory: {
    fontSize: 11,
    color: '#64748b',
  },
  campaignStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  campaignStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  campaignStatLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  campaignStatValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  campaignFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  campaignProgress: {
    flex: 1,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  campaignProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  viewButton: {
    width: 32,
    height: 32,
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  overviewGrid: {
    gap: 12,
  },
  overviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  overviewLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  overviewValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1e293b',
  },
  metricsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricItem: {
    width: (width - 64) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricLabel: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statusLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 13,
    color: '#475569',
    textTransform: 'capitalize',
  },
  statusCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  paymentsList: {
    gap: 12,
  },
  paymentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfluencer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  paymentCampaign: {
    fontSize: 11,
    color: '#64748b',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY_BLUE,
  },
  paymentDate: {
    fontSize: 11,
    color: '#64748b',
  },
  applicationsList: {
    gap: 12,
  },
  applicationCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  applicationInfluencer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  applicationCampaign: {
    fontSize: 11,
    color: '#64748b',
  },
  applicationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicationMatch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  applicationMatchText: {
    fontSize: 12,
    color: '#64748b',
  },
  applicationAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  financialCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  financialMetrics: {
    gap: 12,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  financialLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  financialValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  positiveValue: {
    color: '#10b981',
  },
  negativeValue: {
    color: '#ef4444',
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backButton: {
    padding: 8,
    backgroundColor: `${PRIMARY_BLUE}10`,
    borderRadius: 8,
    marginRight: 12,
  },
  positiveChange: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  negativeChange: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statChangeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e293b',
  },
  topCampaignsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  topCampaignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },
  topCampaignRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${PRIMARY_BLUE}15`,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY_BLUE,
  },
  topCampaignInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topCampaignTitle: {
    fontSize: 13,
    color: '#1e293b',
    flex: 1,
  },
  topCampaignSpent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#1e293b',
  },
  influencersList: {
    gap: 12,
  },
  influencerCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  influencerHeader: {
    marginBottom: 12,
  },
  influencerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  influencerFollowers: {
    fontSize: 11,
    color: '#64748b',
  },
  influencerStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  influencerStat: {
    minWidth: 80,
  },
  influencerStatLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  influencerStatValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalBody: {
    padding: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: PRIMARY_BLUE,
    borderColor: PRIMARY_BLUE,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  dateInput: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
});

export default BrandAnalytics;