import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  FlatList,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  ProgressChart,
} from 'react-native-chart-kit';
import {
  influencerAnalyticsApi,
  DashboardData,
  PerformanceData,
  EarningsTrendData,
  ApplicationsAnalysisData,
  CampaignData,
  MediaAnalyticsData,
  QuickStatsData,
  ComprehensiveReportData,
  ProfileSummary,
  METRIC_COLORS,
  STATUS_COLORS,
} from '../../services/influencerAnalyticsAPI';

const { width } = Dimensions.get('window');
const PRIMARY_BLUE = 'rgb(15, 110, 234)';

// Chart Configuration
const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(15, 110, 234, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#fff',
  },
};

type TabType = 'dashboard' | 'performance' | 'earnings' | 'applications' | 'media' | 'growth' | 'export';

interface ExpandedCharts {
  earnings: boolean;
  performance: boolean;
}

const InfluencerAnalytics: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [timeRange, setTimeRange] = useState('last_30_days');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showTimeRangeModal, setShowTimeRangeModal] = useState(false);
  const [expandedCharts, setExpandedCharts] = useState<ExpandedCharts>({
    earnings: false,
    performance: false,
  });

  // Data states
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [earningsData, setEarningsData] = useState<EarningsTrendData[]>([]);
  const [applicationsData, setApplicationsData] = useState<ApplicationsAnalysisData | null>(null);
  const [campaignsData, setCampaignsData] = useState<CampaignData[]>([]);
  const [mediaData, setMediaData] = useState<MediaAnalyticsData | null>(null);
  const [growthData, setGrowthData] = useState<ComprehensiveReportData | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStatsData | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const timeRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_90_days', label: 'Last 90 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_quarter', label: 'This Quarter' },
    { value: 'this_year', label: 'This Year' },
    { value: 'all_time', label: 'All Time' },
  ];

  // Fetch functions
  const fetchProfileSummary = async () => {
    try {
      const data = await influencerAnalyticsApi.getProfileSummary();
      setProfileSummary(data);
    } catch (err) {
      console.error('Profile summary fetch error:', err);
    }
  };

  const fetchDashboard = async () => {
    try {
      const data = await influencerAnalyticsApi.getDashboard(timeRange);
      setDashboardData(data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      throw err;
    }
  };

  const fetchPerformance = async () => {
    try {
      const data = await influencerAnalyticsApi.getPerformance(timeRange);
      setPerformanceData(data);
    } catch (err) {
      console.error('Performance fetch error:', err);
    }
  };

  const fetchEarnings = async () => {
    try {
      const groupBy = influencerAnalyticsApi.getGroupByFromTimeRange(timeRange);
      const data = await influencerAnalyticsApi.getEarningsTrends(timeRange, groupBy);
      setEarningsData(data);
    } catch (err) {
      console.error('Earnings fetch error:', err);
    }
  };

  const fetchApplications = async () => {
    try {
      const data = await influencerAnalyticsApi.getApplicationsAnalysis(timeRange);
      setApplicationsData(data);
    } catch (err) {
      console.error('Applications fetch error:', err);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const data = await influencerAnalyticsApi.getCampaigns();
      setCampaignsData(data);
    } catch (err) {
      console.error('Campaigns fetch error:', err);
    }
  };

  const fetchMediaAnalytics = async () => {
    try {
      const data = await influencerAnalyticsApi.getMediaAnalytics();
      setMediaData(data);
    } catch (err) {
      console.error('Media analytics fetch error:', err);
    }
  };

  const fetchGrowthData = async () => {
    try {
      const data = await influencerAnalyticsApi.getComprehensiveReport('last_90_days');
      setGrowthData(data);
    } catch (err) {
      console.error('Growth data fetch error:', err);
    }
  };

  const fetchQuickStats = async () => {
    try {
      const data = await influencerAnalyticsApi.getQuickStats();
      setQuickStats(data);
    } catch (err) {
      console.error('Quick stats fetch error:', err);
    }
  };

  const fetchAllData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchProfileSummary(),
        fetchDashboard(),
        fetchPerformance(),
        fetchEarnings(),
        fetchApplications(),
        fetchCampaigns(),
        fetchMediaAnalytics(),
        fetchGrowthData(),
        fetchQuickStats(),
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllData(false);
  }, [fetchAllData]);

  useEffect(() => {
    fetchAllData();
  }, [timeRange, fetchAllData]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchDashboard();
      fetchQuickStats();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Handle export
  const handleExport = async (reportType: string, format: 'json' | 'csv' = 'json') => {
    try {
      setExporting(true);
      await influencerAnalyticsApi.shareExportedData(reportType, format, timeRange);
    } catch (err: any) {
      Alert.alert('Export Failed', err.message || 'Could not export data');
    } finally {
      setExporting(false);
    }
  };

  // Clear cache
  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear analytics cache?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await influencerAnalyticsApi.clearCache();
              await fetchAllData();
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (err) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  // Computed metrics
  const computedMetrics = useMemo(() => {
    if (!dashboardData) return null;
    
    const { performance_score, application_stats, earnings_summary } = dashboardData;
    
    return {
      overallScore: performance_score?.overall || 0,
      earningsTotal: earnings_summary?.total || 0,
      availableBalance: earnings_summary?.available || 0,
      pendingEarnings: earnings_summary?.pending || 0,
      totalApplications: application_stats?.total || 0,
      approvalRate: application_stats?.approval_rate || 0,
      successRate: application_stats?.success_rate || 0,
      activeCampaigns: dashboardData.campaign_performance?.active_campaigns || 0,
      completionRate: dashboardData.campaign_performance?.completion_rate || 0,
    };
  }, [dashboardData]);

  // Earnings chart data
  const earningsChartData = useMemo(() => {
    if (!earningsData || earningsData.length === 0) return null;
    
    return {
      labels: earningsData.map(item => item.period.substring(item.period.length - 2)),
      datasets: [
        {
          data: earningsData.map(item => item.total_amount),
          color: (opacity = 1) => `rgba(15, 110, 234, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  }, [earningsData]);

  // Applications by status for pie chart
  const applicationsPieData = useMemo(() => {
    if (!applicationsData?.status_distribution) return [];
    
    const data = Object.entries(applicationsData.status_distribution).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: STATUS_COLORS[status] || '#64748b',
      legendFontColor: '#1e293b',
      legendFontSize: 12,
    }));
    
    return data;
  }, [applicationsData]);

  // Toggle chart expansion
  const toggleChartExpansion = (chart: keyof ExpandedCharts) => {
    setExpandedCharts(prev => ({
      ...prev,
      [chart]: !prev[chart],
    }));
  };

  // Render Metric Card
  const MetricCard = ({ title, value, subtitle, icon, color, change, format = 'number' }: any) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: `${color}20` }]}>
          <Icon name={icon} size={20} color={color} />
        </View>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>
        {format === 'currency' ? influencerAnalyticsApi.formatCurrency(value) :
         format === 'percentage' ? influencerAnalyticsApi.formatPercentage(value) :
         format === 'number' ? influencerAnalyticsApi.formatNumber(value) : value}
      </Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
      {change !== undefined && change !== null && (
        <View style={styles.metricChange}>
          <Icon
            name={change >= 0 ? 'arrow-up' : 'arrow-down'}
            size={12}
            color={change >= 0 ? '#10b981' : '#ef4444'}
          />
          <Text style={[styles.changeText, change >= 0 ? styles.positiveChange : styles.negativeChange]}>
            {Math.abs(change).toFixed(1)}%
          </Text>
          <Text style={styles.changeLabel}>vs previous</Text>
        </View>
      )}
    </View>
  );

  // Render Status Badge
  const StatusBadge = ({ status }: { status: string }) => (
    <View style={[styles.statusBadge, { backgroundColor: influencerAnalyticsApi.getStatusColor(status) }]}>
      <Text style={styles.statusBadgeText}>{status}</Text>
    </View>
  );

  // Dashboard Tab
  const DashboardTab = () => {
    if (!dashboardData || !computedMetrics) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.dashboardHeader}>
          <View>
            <Text style={styles.dashboardTitle}>Performance Dashboard</Text>
            <Text style={styles.dashboardSubtitle}>
              Last updated: {new Date().toLocaleTimeString()}
            </Text>
          </View>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Icon name="refresh" size={20} color={PRIMARY_BLUE} />
          </TouchableOpacity>
        </View>

        {/* Key Metrics Grid */}
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Total Earnings"
            value={computedMetrics.earningsTotal}
            subtitle={`Available: ${influencerAnalyticsApi.formatCurrency(computedMetrics.availableBalance)}`}
            icon="cash"
            color={METRIC_COLORS.success}
            format="currency"
          />
          
          <MetricCard
            title="Performance Score"
            value={computedMetrics.overallScore}
            subtitle={dashboardData.performance_score?.tier}
            icon="trophy"
            color={METRIC_COLORS.warning}
            format="percentage"
          />
          
          <MetricCard
            title="Applications"
            value={computedMetrics.totalApplications}
            subtitle={`${influencerAnalyticsApi.formatPercentage(computedMetrics.approvalRate)} approval rate`}
            icon="file-document"
            color={METRIC_COLORS.info}
          />
          
          <MetricCard
            title="Active Campaigns"
            value={computedMetrics.activeCampaigns}
            subtitle={`${influencerAnalyticsApi.formatPercentage(computedMetrics.completionRate)} completion rate`}
            icon="target"
            color={METRIC_COLORS.primary}
          />
        </View>

        {/* Earnings Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>
              <Icon name="trending-up" size={18} color={PRIMARY_BLUE} /> Earnings Trend
            </Text>
            <TouchableOpacity onPress={() => toggleChartExpansion('earnings')}>
              <Icon name={expandedCharts.earnings ? 'chevron-up' : 'chevron-down'} size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          <View style={[styles.chartContent, expandedCharts.earnings && styles.expandedChart]}>
            {earningsChartData ? (
              <LineChart
                data={earningsChartData}
                width={width - 64}
                height={expandedCharts.earnings ? 300 : 200}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                formatYLabel={(value) => `$${parseInt(value).toLocaleString()}`}
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No earnings data available</Text>
              </View>
            )}
          </View>
        </View>

        {/* Applications Status */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>
              <Icon name="pie-chart" size={18} color={PRIMARY_BLUE} /> Applications Status
            </Text>
          </View>
          <View style={styles.chartContent}>
            {applicationsPieData.length > 0 ? (
              <PieChart
                data={applicationsPieData}
                width={width - 64}
                height={200}
                chartConfig={chartConfig}
                accessor="value"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No applications data available</Text>
              </View>
            )}
          </View>
        </View>

        {/* Recent Activity */}
        {dashboardData.recent_activity?.items && dashboardData.recent_activity.items.length > 0 && (
          <View style={styles.recentActivityContainer}>
            <Text style={styles.sectionTitle}>
              <Icon name="clock-outline" size={18} color={PRIMARY_BLUE} /> Recent Activity
            </Text>
            {dashboardData.recent_activity.items.slice(0, 5).map((activity, idx) => (
              <View key={idx} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Icon
                    name={
                      activity.type === 'application' ? 'file-document' :
                      activity.type === 'earning' ? 'cash' : 'target'
                    }
                    size={16}
                    color={PRIMARY_BLUE}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityTime}>
                    {influencerAnalyticsApi.formatDateTime(activity.timestamp)}
                  </Text>
                </View>
                {activity.amount && (
                  <Text style={styles.activityAmount}>
                    {influencerAnalyticsApi.formatCurrency(activity.amount)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  // Performance Tab
  const PerformanceTab = () => {
    if (!performanceData) return null;

    const performanceMetrics = [
      { label: 'Application Quality', value: performanceData.application_quality, color: METRIC_COLORS.primary },
      { label: 'Campaign Completion', value: performanceData.completion_rate, color: METRIC_COLORS.success },
      { label: 'Brand Satisfaction', value: performanceData.satisfaction_score, color: METRIC_COLORS.warning },
      { label: 'Content Quality', value: performanceData.content_quality, color: METRIC_COLORS.purple },
      { label: 'Response Time', value: performanceData.response_time_score, color: METRIC_COLORS.info },
      { label: 'Earnings Efficiency', value: performanceData.earnings_efficiency, color: METRIC_COLORS.teal },
    ];

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.tabHeader}>
          <Text style={styles.pageTitle}>Performance Analytics</Text>
        </View>

        {/* Overall Score */}
        <LinearGradient
          colors={[PRIMARY_BLUE, '#0A4FA0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scoreCard}
        >
          <Text style={styles.scoreValue}>{performanceData.overall_score.toFixed(1)}</Text>
          <Text style={styles.scoreLabel}>Overall Score</Text>
          <View style={styles.scoreProgress}>
            <View
              style={[
                styles.scoreFill,
                { width: `${performanceData.overall_score}%` }
              ]}
            />
          </View>
          <View style={styles.scoreTier}>
            <Text style={styles.scoreTierLabel}>Tier: </Text>
            <View style={styles.tierBadge}>
              <Text style={styles.tierBadgeText}>{performanceData.tier || 'Novice'}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Performance Breakdown */}
        <View style={styles.breakdownContainer}>
          <Text style={styles.sectionTitle}>Performance Breakdown</Text>
          {performanceMetrics.map((item, idx) => (
            <View key={idx} style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>{item.label}</Text>
              <View style={styles.breakdownBar}>
                <View
                  style={[
                    styles.breakdownFill,
                    {
                      width: `${item.value}%`,
                      backgroundColor: item.color,
                    }
                  ]}
                />
              </View>
              <Text style={styles.breakdownValue}>{item.value.toFixed(1)}%</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // Earnings Tab
  const EarningsTab = () => {
    if (!earningsData || !computedMetrics) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.tabHeader}>
          <Text style={styles.pageTitle}>Earnings Analytics</Text>
        </View>

        {/* Earnings Summary */}
        <View style={styles.earningsSummary}>
          <View style={styles.earningsCard}>
            <Text style={styles.earningsAmount}>
              {influencerAnalyticsApi.formatCurrency(computedMetrics.earningsTotal)}
            </Text>
            <Text style={styles.earningsLabel}>Total Earnings</Text>
            <Text style={styles.earningsSub}>
              Available: {influencerAnalyticsApi.formatCurrency(computedMetrics.availableBalance)}
            </Text>
          </View>
          
          <View style={styles.earningsCard}>
            <Text style={styles.earningsAmount}>
              {influencerAnalyticsApi.formatCurrency(computedMetrics.pendingEarnings)}
            </Text>
            <Text style={styles.earningsLabel}>Pending</Text>
            <Text style={styles.earningsSub}>Awaiting payment</Text>
          </View>

          <View style={styles.earningsCard}>
            <Text style={styles.earningsAmount}>
              {influencerAnalyticsApi.formatCurrency((computedMetrics.earningsTotal || 0) / 12)}
            </Text>
            <Text style={styles.earningsLabel}>Avg Monthly</Text>
            <Text style={styles.earningsSub}>Projected earnings</Text>
          </View>
        </View>

        {/* Earnings Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
          {earningsChartData ? (
            <BarChart
              data={earningsChartData}
              width={width - 64}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel="$"
              yAxisSuffix=""
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No earnings data available</Text>
            </View>
          )}
        </View>

        {/* Top Earning Campaigns */}
        <View style={styles.topCampaignsContainer}>
          <Text style={styles.sectionTitle}>Top Earning Campaigns</Text>
          {campaignsData.slice(0, 5).map((campaign, idx) => (
            <View key={campaign._id} style={styles.topCampaignItem}>
              <View style={styles.topCampaignRank}>
                <Text style={styles.rankText}>{idx + 1}</Text>
              </View>
              <View style={styles.topCampaignContent}>
                <Text style={styles.topCampaignTitle}>{campaign.title}</Text>
                <Text style={styles.topCampaignBrand}>
                  {campaign.brand_name ||
                   campaign.brand?.company_name ||
                   'Unknown Brand'}
                </Text>
              </View>
              <View style={styles.topCampaignAmount}>
                <Text style={styles.amountText}>
                  {influencerAnalyticsApi.formatCurrency(campaign.campaign_earnings)}
                </Text>
                <StatusBadge status={campaign.status} />
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
          <Text style={styles.pageTitle}>Applications Analytics</Text>
        </View>

        {/* Applications Overview */}
        <View style={styles.applicationsOverview}>
          <View style={styles.applicationsStatsGrid}>
            {[
              { label: 'Total', value: applicationsData.total_applications || 0, color: METRIC_COLORS.primary },
              { label: 'Pending', value: applicationsData.pending || 0, color: STATUS_COLORS.pending },
              { label: 'Approved', value: applicationsData.approved || 0, color: STATUS_COLORS.approved },
              { label: 'Rejected', value: applicationsData.rejected || 0, color: STATUS_COLORS.rejected },
              { label: 'Completed', value: applicationsData.completed || 0, color: STATUS_COLORS.completed },
              { label: 'Success', value: `${applicationsData.success_rate || 0}%`, color: METRIC_COLORS.success },
            ].map((stat, idx) => (
              <View key={idx} style={styles.applicationsStatItem}>
                <Text style={[styles.applicationsStatValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.applicationsStatLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Applications Timeline */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Application Timeline</Text>
          {applicationsData.timeline && applicationsData.timeline.length > 0 ? (
            <BarChart
              data={{
                labels: applicationsData.timeline.map(item => item.date.substring(5)),
                datasets: [
                  {
                    data: applicationsData.timeline.map(item => item.applications),
                  },
                ],
              }}
              width={width - 64}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=""
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No timeline data available</Text>
            </View>
          )}
        </View>

        {/* Recent Applications */}
        {applicationsData.recent_applications && applicationsData.recent_applications.length > 0 && (
          <View style={styles.recentApplicationsContainer}>
            <Text style={styles.sectionTitle}>Recent Applications</Text>
            {applicationsData.recent_applications.slice(0, 10).map((app, idx) => (
              <View key={idx} style={styles.recentApplicationItem}>
                <View style={styles.applicationInfo}>
                  <Text style={styles.applicationTitle}>{app.campaign_title}</Text>
                  <Text style={styles.applicationBrand}>{app.brand_name}</Text>
                </View>
                <View style={styles.applicationMeta}>
                  <StatusBadge status={app.status} />
                  <Text style={styles.applicationAmount}>
                    {influencerAnalyticsApi.formatCurrency(app.payment_amount)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  // Media Tab
  const MediaTab = () => {
    if (!mediaData) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.tabHeader}>
          <Text style={styles.pageTitle}>Media Analytics</Text>
        </View>

        {/* Media Stats */}
        <View style={styles.mediaStats}>
          {[
            { label: 'Total Files', value: mediaData.total_files, icon: 'file' },
            { label: 'Images', value: mediaData.images, icon: 'image' },
            { label: 'Videos', value: mediaData.videos, icon: 'video' },
            { label: 'Documents', value: mediaData.documents, icon: 'file-document' },
          ].map((stat, idx) => (
            <View key={idx} style={styles.mediaStatCard}>
              <Icon name={stat.icon} size={24} color={PRIMARY_BLUE} />
              <Text style={styles.mediaStatValue}>{stat.value}</Text>
              <Text style={styles.mediaStatLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Media Type Distribution */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Media Type Distribution</Text>
          {mediaData.type_distribution && mediaData.type_distribution.length > 0 ? (
            <PieChart
              data={mediaData.type_distribution.map(item => ({
                name: item.name,
                value: item.value,
                color: METRIC_COLORS[item.name.toLowerCase() as keyof typeof METRIC_COLORS] || PRIMARY_BLUE,
                legendFontColor: '#1e293b',
                legendFontSize: 12,
              }))}
              width={width - 64}
              height={200}
              chartConfig={chartConfig}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No media distribution data</Text>
            </View>
          )}
        </View>

        {/* Recent Media */}
        {mediaData.recent_media && mediaData.recent_media.length > 0 && (
          <View style={styles.recentMediaContainer}>
            <Text style={styles.sectionTitle}>Recent Media</Text>
            <FlatList
              data={mediaData.recent_media.slice(0, 8)}
              keyExtractor={(item, index) => index.toString()}
              numColumns={2}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.mediaItem}>
                  <View style={styles.mediaPreview}>
                    <Icon
                      name={
                        item.type === 'image' ? 'image' :
                        item.type === 'video' ? 'video' : 'file-document'
                      }
                      size={32}
                      color={PRIMARY_BLUE}
                    />
                  </View>
                  <Text style={styles.mediaFilename} numberOfLines={1}>{item.filename}</Text>
                </View>
              )}
            />
          </View>
        )}
      </ScrollView>
    );
  };

  // Growth Tab
  const GrowthTab = () => {
    if (!growthData) return null;

    const growthMetrics = [
      { label: 'Monthly Growth', value: growthData.monthly_growth || 0, color: METRIC_COLORS.success },
      { label: 'Audience Growth', value: growthData.audience_growth || 0, format: 'number', color: METRIC_COLORS.primary },
      { label: 'Engagement Growth', value: growthData.engagement_growth || 0, color: METRIC_COLORS.info },
      { label: 'Revenue Growth', value: growthData.revenue_growth || 0, color: METRIC_COLORS.warning },
    ];

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.tabHeader}>
          <Text style={styles.pageTitle}>Growth Analytics</Text>
        </View>

        {/* Growth Metrics */}
        <View style={styles.growthMetrics}>
          {growthMetrics.map((metric, idx) => (
            <View key={idx} style={styles.growthMetricCard}>
              <Text style={styles.growthMetricLabel}>{metric.label}</Text>
              <Text style={[styles.growthMetricValue, { color: metric.color }]}>
                {metric.format === 'number'
                  ? influencerAnalyticsApi.formatNumber(metric.value)
                  : `${metric.value.toFixed(1)}%`}
              </Text>
            </View>
          ))}
        </View>

        {/* Growth Chart */}
        {growthData.trends && growthData.trends.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Growth Trends</Text>
            <LineChart
              data={{
                labels: growthData.trends.map(item => item.period.substring(5)),
                datasets: [
                  {
                    data: growthData.trends.map(item => item.earnings_growth),
                    color: (opacity = 1) => `rgba(15, 110, 234, ${opacity})`,
                    strokeWidth: 2,
                  },
                  {
                    data: growthData.trends.map(item => item.applications_growth),
                    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                    strokeWidth: 2,
                  },
                ],
                legend: ['Earnings', 'Applications'],
              }}
              width={width - 64}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              formatYLabel={(value) => `${parseInt(value).toFixed(0)}%`}
            />
          </View>
        )}
      </ScrollView>
    );
  };

  // Export Tab
  const ExportTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.tabHeader}>
        <Text style={styles.pageTitle}>Export Reports</Text>
        <Text style={styles.tabSubtitle}>Download comprehensive reports in multiple formats</Text>
      </View>

      {/* Export Options */}
      <View style={styles.exportOptions}>
        <Text style={styles.exportSectionTitle}>Export Formats</Text>
        <View style={styles.formatGrid}>
          {[
            { format: 'json', label: 'JSON', icon: 'code-json', description: 'Complete data for analysis' },
            { format: 'csv', label: 'CSV', icon: 'file-delimited', description: 'Spreadsheet compatible' },
            { format: 'pdf', label: 'PDF', icon: 'file-pdf-box', description: 'Printable report' },
            { format: 'excel', label: 'Excel', icon: 'microsoft-excel', description: 'Advanced analytics' },
          ].map((option, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.formatCard}
              onPress={() => handleExport('comprehensive', option.format as 'json' | 'csv')}
              disabled={exporting}
            >
              <Icon name={option.icon} size={32} color={PRIMARY_BLUE} />
              <Text style={styles.formatLabel}>{option.label}</Text>
              <Text style={styles.formatDescription}>{option.description}</Text>
              <View style={styles.exportButton}>
                {exporting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.exportButtonText}>Download</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.exportSectionTitle}>Report Types</Text>
        <View style={styles.reportButtons}>
          {[
            { type: 'dashboard', label: 'Dashboard Report' },
            { type: 'performance', label: 'Performance Report' },
            { type: 'earnings', label: 'Financial Report' },
            { type: 'applications', label: 'Applications Report' },
            { type: 'media', label: 'Media Report' },
          ].map((report, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.reportButton}
              onPress={() => handleExport(report.type, 'json')}
              disabled={exporting}
            >
              <Text style={styles.reportButtonText}>{report.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  // Render active tab
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'performance': return <PerformanceTab />;
      case 'earnings': return <EarningsTab />;
      case 'applications': return <ApplicationsTab />;
      case 'media': return <MediaTab />;
      case 'growth': return <GrowthTab />;
      case 'export': return <ExportTab />;
      default: return <DashboardTab />;
    }
  };

  if (loading && !dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_BLUE} />
        <Text style={styles.loadingText}>Loading your analytics reports...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Unable to Load Data</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <View style={styles.errorActions}>
          <TouchableOpacity style={styles.errorRetry} onPress={onRefresh}>
            <Icon name="refresh" size={16} color="#fff" />
            <Text style={styles.errorRetryText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.errorReload} onPress={() => fetchAllData()}>
            <Text style={styles.errorReloadText}>Reload</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_BLUE} />

      {/* Header */}
      <LinearGradient
        colors={[PRIMARY_BLUE, '#0A4FA0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Analytics</Text>
              <Text style={styles.headerSubtitle}>Influencer Performance</Text>
            </View>
            <TouchableOpacity onPress={handleClearCache} style={styles.cacheButton}>
              <Icon name="database" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Time Range Selector */}
      <TouchableOpacity
        style={styles.timeRangeSelector}
        onPress={() => setShowTimeRangeModal(true)}
      >
        <Icon name="calendar" size={16} color={PRIMARY_BLUE} />
        <Text style={styles.timeRangeText}>
          {timeRangeOptions.find(opt => opt.value === timeRange)?.label || 'Last 30 Days'}
        </Text>
        <Icon name="chevron-down" size={16} color={PRIMARY_BLUE} />
      </TouchableOpacity>

      {/* Tab Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'view-dashboard' },
          { id: 'performance', label: 'Performance', icon: 'chart-line' },
          { id: 'earnings', label: 'Earnings', icon: 'cash' },
          { id: 'applications', label: 'Applications', icon: 'file-document' },
          { id: 'media', label: 'Media', icon: 'camera' },
          { id: 'growth', label: 'Growth', icon: 'trending-up' },
          { id: 'export', label: 'Export', icon: 'download' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id as TabType)}
          >
            <Icon name={tab.icon} size={18} color={activeTab === tab.id ? PRIMARY_BLUE : '#64748b'} />
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main Content */}
      {renderActiveTab()}

      {/* Time Range Modal */}
      <Modal
        visible={showTimeRangeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimeRangeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time Range</Text>
              <TouchableOpacity onPress={() => setShowTimeRangeModal(false)}>
                <Icon name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={timeRangeOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.timeRangeOption,
                    timeRange === item.value && styles.timeRangeOptionActive,
                  ]}
                  onPress={() => {
                    setTimeRange(item.value);
                    setShowTimeRangeModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.timeRangeOptionText,
                      timeRange === item.value && styles.timeRangeOptionTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {timeRange === item.value && (
                    <Icon name="check" size={18} color={PRIMARY_BLUE} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Auto Refresh Toggle */}
      <TouchableOpacity
        style={[styles.autoRefreshToggle, autoRefresh && styles.autoRefreshActive]}
        onPress={() => setAutoRefresh(!autoRefresh)}
      >
        <Icon name="refresh-auto" size={16} color={autoRefresh ? '#fff' : '#64748b'} />
      </TouchableOpacity>

      {/* Quick Stats Bar */}
      {quickStats && (
        <View style={styles.quickStatsBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.quickStatsContainer}>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatLabel}>Today</Text>
                <Text style={styles.quickStatValue}>
                  {influencerAnalyticsApi.formatCurrency(quickStats.today?.earnings || 0)}
                </Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatLabel}>This Week</Text>
                <Text style={styles.quickStatValue}>
                  {influencerAnalyticsApi.formatCurrency(quickStats.this_week?.earnings || 0)}
                </Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatLabel}>This Month</Text>
                <Text style={styles.quickStatValue}>
                  {influencerAnalyticsApi.formatCurrency(quickStats.this_month?.earnings || 0)}
                </Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatLabel}>Total</Text>
                <Text style={styles.quickStatValue}>
                  {influencerAnalyticsApi.formatCurrency(computedMetrics?.earningsTotal || 0)}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  cacheButton: {
    padding: 8,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'flex-start',
    gap: 8,
  },
  timeRangeText: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '500',
  },
  tabBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tabBarContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 20,
    gap: 4,
  },
  activeTab: {
    backgroundColor: `${PRIMARY_BLUE}15`,
  },
  tabLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: PRIMARY_BLUE,
  },
  tabContent: {
    flex: 1,
    padding: 16,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  errorRetry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_BLUE,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  errorRetryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  errorReload: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  errorReloadText: {
    color: '#64748b',
    fontSize: 14,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  dashboardSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
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
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 11,
    color: '#64748b',
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  positiveChange: {
    color: '#10b981',
  },
  negativeChange: {
    color: '#ef4444',
  },
  changeLabel: {
    fontSize: 10,
    color: '#94a3b8',
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chartContent: {
    alignItems: 'center',
  },
  expandedChart: {
    minHeight: 300,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  recentActivityContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    fontSize: 13,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#64748b',
  },
  activityAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  tabHeader: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  tabSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  scoreCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  scoreProgress: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginBottom: 12,
  },
  scoreFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  scoreTier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreTierLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  tierBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tierBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  breakdownContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  breakdownItem: {
    marginBottom: 16,
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 4,
  },
  breakdownBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'right',
  },
  earningsSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  earningsCard: {
    flex: 1,
    minWidth: (width - 44) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  earningsAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: PRIMARY_BLUE,
    marginBottom: 4,
  },
  earningsLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  earningsSub: {
    fontSize: 11,
    color: '#94a3b8',
  },
  topCampaignsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  topCampaignItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },
  topCampaignRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${PRIMARY_BLUE}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY_BLUE,
  },
  topCampaignContent: {
    flex: 1,
  },
  topCampaignTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  topCampaignBrand: {
    fontSize: 11,
    color: '#64748b',
  },
  topCampaignAmount: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  applicationsStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  applicationsStatItem: {
    width: (width - 56) / 3,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applicationsStatValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  applicationsStatLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  recentApplicationsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  recentApplicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  applicationInfo: {
    flex: 1,
  },
  applicationTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  applicationBrand: {
    fontSize: 11,
    color: '#64748b',
  },
  applicationMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  applicationAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  mediaStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  mediaStatCard: {
    flex: 1,
    minWidth: (width - 56) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  mediaStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 2,
  },
  mediaStatLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  recentMediaContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  mediaItem: {
    width: (width - 64) / 2,
    margin: 4,
    alignItems: 'center',
  },
  mediaPreview: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  mediaFilename: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
  },
  growthMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  growthMetricCard: {
    flex: 1,
    minWidth: (width - 56) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  growthMetricLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  growthMetricValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  exportOptions: {
    paddingBottom: 30,
  },
  exportSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    marginTop: 24,
  },
  formatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formatCard: {
    width: (width - 56) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formatLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  formatDescription: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 12,
  },
  exportButton: {
    backgroundColor: PRIMARY_BLUE,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  reportButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reportButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reportButtonText: {
    fontSize: 12,
    color: '#475569',
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
  timeRangeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  timeRangeOptionActive: {
    backgroundColor: `${PRIMARY_BLUE}10`,
  },
  timeRangeOptionText: {
    fontSize: 15,
    color: '#1e293b',
  },
  timeRangeOptionTextActive: {
    color: PRIMARY_BLUE,
    fontWeight: '600',
  },
  autoRefreshToggle: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  autoRefreshActive: {
    backgroundColor: PRIMARY_BLUE,
  },
  quickStatsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 8,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  quickStatItem: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  quickStatLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  quickStatValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
});

export default InfluencerAnalytics;