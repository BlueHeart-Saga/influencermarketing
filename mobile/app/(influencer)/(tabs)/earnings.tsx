import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import earningsAPI, {
  Earning,
  Withdrawal,
  EarningsSummary,
  AnalyticsResponse,
  DashboardData,
  PaymentMethod,
  getStatusConfig,
  formatCurrency,
  formatDate,
  getPaymentMethodName,
  calculateWithdrawalFee,
} from '../../../services/earningsAPI';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const config = getStatusConfig(status);

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.backgroundColor }]}>
      <Feather name={config.icon as any} size={12} color={config.color} />
      <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

// Stats Card Component
const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  color = '#007AFF',
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  color?: string;
}) => {
  const brandBlue = '#0f6eea';
  const displayColor = color === '#007AFF' ? brandBlue : color; // Use brand blue as default

  return (
    <View
      style={[styles.statsCard, { backgroundColor: displayColor }]}
    >
      <View style={styles.statsCardHeader}>
        <View>
          <Text style={styles.statsCardTitle}>{title}</Text>
          <Text style={styles.statsCardValue}>
            {formatCurrency(value)}
          </Text>
          <Text style={styles.statsCardSubtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.statsCardIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Feather name={icon as any} size={24} color="#fff" />
        </View>
      </View>
    </View>
  );
};

// Earnings Table Component
const EarningsTable = ({
  earnings,
  onViewDetails,
}: {
  earnings: Earning[];
  onViewDetails: (earning: Earning) => void;
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredEarnings = earnings.filter(earning => {
    if (filterStatus === 'all') return true;
    return earning.status === filterStatus;
  });

  const renderItem = ({ item }: { item: Earning }) => (
    <TouchableOpacity
      style={styles.earningRow}
      onPress={() => onViewDetails(item)}
    >
      <View style={styles.earningRowLeft}>
        <Text style={styles.campaignName} numberOfLines={1}>
          {item.campaign_title}
        </Text>
        <Text style={styles.brandName}>{item.brand_name}</Text>
      </View>

      <View style={styles.earningRowRight}>
        <Text style={styles.earningAmount}>
          {formatCurrency(item.amount, item.currency)}
        </Text>
        <StatusBadge status={item.status} />
        <Text style={styles.earningDate}>
          {formatDate(item.earned_at, 'short')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        <View>
          <Text style={styles.tableTitle}>Recent Earnings</Text>
          <Text style={styles.tableSubtitle}>Your latest transactions</Text>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'pending' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('pending')}
          >
            <Text style={[styles.filterText, filterStatus === 'pending' && styles.filterTextActive]}>
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'completed' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('completed')}
          >
            <Text style={[styles.filterText, filterStatus === 'completed' && styles.filterTextActive]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredEarnings.slice(0, 10)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No earnings found</Text>
          </View>
        }
      />
    </View>
  );
};

// Withdrawals Table Component
const WithdrawalsTable = ({
  withdrawals,
  onRequestWithdrawal,
}: {
  withdrawals: Withdrawal[];
  onRequestWithdrawal: () => void;
}) => {
  const renderItem = ({ item }: { item: Withdrawal }) => (
    <View style={styles.withdrawalRow}>
      <View style={styles.withdrawalRowLeft}>
        <Text style={styles.withdrawalAmount}>
          {formatCurrency(item.amount, item.currency)}
        </Text>
        <Text style={styles.withdrawalMethod}>
          {getPaymentMethodName(item.payment_method)}
        </Text>
        {item.processing_fee ? (
          <Text style={styles.withdrawalFee}>
            Fee: {formatCurrency(item.processing_fee)}
          </Text>
        ) : null}
      </View>

      <View style={styles.withdrawalRowRight}>
        <StatusBadge status={item.status} />
        <Text style={styles.withdrawalDate}>
          {formatDate(item.requested_at, 'short')}
        </Text>
        {item.completed_at && (
          <Text style={styles.withdrawalCompleted}>
            Completed: {formatDate(item.completed_at, 'short')}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        <View>
          <Text style={styles.tableTitle}>Recent Withdrawals</Text>
          <Text style={styles.tableSubtitle}>Your withdrawal history</Text>
        </View>

        <TouchableOpacity
          style={styles.requestButton}
          onPress={onRequestWithdrawal}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.requestButtonText}>Request</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={withdrawals.slice(0, 5)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No withdrawals found</Text>
          </View>
        }
      />
    </View>
  );
};

// Analytics Chart Component
const AnalyticsChart = ({
  analytics,
  period,
}: {
  analytics: AnalyticsResponse;
  period: string;
}) => {
  const earningsData = analytics.earnings_over_time.slice(-7).map(item => item.amount);
  const labels = analytics.earnings_over_time.slice(-7).map(item => {
    if (item.period.day) {
      return `${item.period.month}/${item.period.day}`;
    }
    return `Week ${item.period.week}`;
  });

  const chartData = {
    labels,
    datasets: [
      {
        data: earningsData,
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#007AFF',
    },
  };

  const pieData = analytics.top_campaigns.slice(0, 5).map((campaign, index) => ({
    name: campaign.campaign_title.length > 15
      ? campaign.campaign_title.substring(0, 15) + '...'
      : campaign.campaign_title,
    amount: campaign.total_amount,
    color: ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF3B30'][index],
    legendFontColor: '#666',
    legendFontSize: 12,
  }));

  return (
    <View style={styles.chartsContainer}>
      {/* Earnings Over Time */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartTitle}>Earnings Over Time</Text>
            <Text style={styles.chartSubtitle}>
              Last {period === 'month' ? '30 days' : period.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {earningsData.length > 0 ? (
          <LineChart
            data={chartData}
            width={SCREEN_WIDTH - 64}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            formatYLabel={(value) => `$${parseInt(value)}`}
          />
        ) : (
          <View style={styles.noChartData}>
            <Text style={styles.noChartText}>No earnings data available</Text>
          </View>
        )}
      </View>

      {/* Top Campaigns */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Top Campaigns</Text>
        {pieData.length > 0 ? (
          <PieChart
            data={pieData}
            width={SCREEN_WIDTH - 64}
            height={200}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : (
          <View style={styles.noChartData}>
            <Text style={styles.noChartText}>No campaign data available</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Top Brands Component
const TopBrands = ({ brands }: { brands: AnalyticsResponse['top_brands'] }) => {
  return (
    <View style={styles.brandsContainer}>
      <Text style={styles.sectionTitle}>Top Brands</Text>
      {brands.map((brand, index) => (
        <View key={brand.brand_id} style={styles.brandItem}>
          <View style={styles.brandInfo}>
            <View style={styles.brandRank}>
              <Text style={styles.brandRankText}>{index + 1}</Text>
            </View>
            <View>
              <Text style={styles.brandName}>{brand.brand_name}</Text>
              <Text style={styles.brandCampaigns}>
                {brand.campaign_count} campaigns
              </Text>
            </View>
          </View>
          <View style={styles.brandStats}>
            <Text style={styles.brandAmount}>
              {formatCurrency(brand.total_amount)}
            </Text>
            <Text style={styles.brandTransactions}>
              {brand.transaction_count} transactions
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

// Performance Trends Component
const PerformanceTrends = ({ trends }: { trends: AnalyticsResponse['trends'] }) => {
  return (
    <View style={styles.trendsContainer}>
      <Text style={styles.sectionTitle}>Performance Trends</Text>
      {trends.map((trend, index) => (
        <View key={index} style={styles.trendItem}>
          <Text style={styles.trendMetric}>{trend.metric}</Text>
          <View style={styles.trendValues}>
            <Text style={styles.trendCurrent}>
              {formatCurrency(trend.current)}
            </Text>
            <View style={[
              styles.trendChange,
              trend.growth > 0 ? styles.trendPositive : styles.trendNegative,
            ]}>
              <Feather
                name={trend.growth > 0 ? 'arrow-up-right' : 'arrow-down-right'}
                size={14}
                color={trend.growth > 0 ? '#34C759' : '#FF3B30'}
              />
              <Text style={[
                styles.trendChangeText,
                trend.growth > 0 ? styles.trendPositiveText : styles.trendNegativeText,
              ]}>
                {Math.abs(trend.growth).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

// Earning Details Modal
const EarningDetailsModal = ({
  visible,
  earning,
  onClose,
}: {
  visible: boolean;
  earning: Earning | null;
  onClose: () => void;
}) => {
  if (!earning) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Earning Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalBody}>
              {/* Campaign Info */}
              <View style={styles.detailSection}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Campaign</Text>
                  <Text style={styles.detailValue}>{earning.campaign_title}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Brand</Text>
                  <Text style={styles.detailValue}>{earning.brand_name}</Text>
                </View>
              </View>

              {/* Amount */}
              <View style={styles.detailSection}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount</Text>
                  <Text style={styles.detailAmount}>
                    {formatCurrency(earning.amount, earning.currency)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <StatusBadge status={earning.status} />
                </View>
              </View>

              {/* Payment Info */}
              {(earning.payment_method || earning.transaction_id) && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionSubtitle}>Payment Information</Text>

                  {earning.payment_method && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Method</Text>
                      <Text style={styles.detailValue}>
                        {getPaymentMethodName(earning.payment_method)}
                      </Text>
                    </View>
                  )}

                  {earning.transaction_id && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Transaction ID</Text>
                      <Text style={styles.detailValueSmall} numberOfLines={1}>
                        {earning.transaction_id}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Dates */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionSubtitle}>Timeline</Text>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Earned At</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(earning.earned_at, 'long')}
                  </Text>
                </View>

                {earning.completed_at && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Completed At</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(earning.completed_at, 'long')}
                    </Text>
                  </View>
                )}
              </View>

              {/* Notes */}
              {earning.notes && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionSubtitle}>Notes</Text>
                  <Text style={styles.detailNotes}>{earning.notes}</Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Withdrawal Request Modal
const WithdrawalRequestModal = ({
  visible,
  availableBalance,
  onClose,
  onConfirm,
  loading,
}: {
  visible: boolean;
  availableBalance: number;
  onClose: () => void;
  onConfirm: (amount: number, method: PaymentMethod, details: any) => void;
  loading: boolean;
}) => {
  const [amount, setAmount] = useState(availableBalance.toString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [accountDetails, setAccountDetails] = useState('');
  const [showMethodSelector, setShowMethodSelector] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    'bank_transfer',
    'paypal',
    'stripe',
    'wise',
    'crypto',
  ];

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (numAmount > availableBalance) {
      Alert.alert('Error', 'Amount exceeds available balance');
      return;
    }

    if (numAmount < 10) {
      Alert.alert('Error', 'Minimum withdrawal amount is $10');
      return;
    }

    if (!accountDetails.trim()) {
      Alert.alert('Error', 'Please enter account details');
      return;
    }

    const details: any = {};

    if (paymentMethod === 'bank_transfer') {
      const lines = accountDetails.split('\n').filter(l => l.trim());
      details.account_name = lines[0] || '';
      details.account_number = lines[1] || '';
      details.bank_name = lines[2] || '';
      details.routing_number = lines[3] || '';
    } else if (paymentMethod === 'paypal') {
      details.email = accountDetails.trim();
    } else if (paymentMethod === 'crypto') {
      details.wallet_address = accountDetails.trim();
    } else {
      details.notes = accountDetails.trim();
    }

    onConfirm(numAmount, paymentMethod, details);
  };

  const fee = calculateWithdrawalFee(parseFloat(amount) || 0, paymentMethod);
  const netAmount = (parseFloat(amount) || 0) - fee;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '80%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Request Withdrawal</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalBody}>
              {/* Available Balance */}
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>
                  {formatCurrency(availableBalance)}
                </Text>
              </View>

              {/* Amount Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Withdrawal Amount</Text>
                <View style={styles.amountInput}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountInputField}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>
              </View>

              {/* Fee Calculation */}
              {parseFloat(amount) > 0 && (
                <View style={styles.feeInfo}>
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Processing Fee:</Text>
                    <Text style={styles.feeValue}>{formatCurrency(fee)}</Text>
                  </View>
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>You'll Receive:</Text>
                    <Text style={styles.netAmount}>{formatCurrency(netAmount)}</Text>
                  </View>
                </View>
              )}

              {/* Payment Method */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Payment Method</Text>
                <TouchableOpacity
                  style={styles.methodSelector}
                  onPress={() => setShowMethodSelector(!showMethodSelector)}
                >
                  <Text style={styles.methodSelectorText}>
                    {getPaymentMethodName(paymentMethod)}
                  </Text>
                  <Feather
                    name={showMethodSelector ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>

                {showMethodSelector && (
                  <View style={styles.methodList}>
                    {paymentMethods.map((method) => (
                      <TouchableOpacity
                        key={method}
                        style={[
                          styles.methodItem,
                          paymentMethod === method && styles.methodItemSelected,
                        ]}
                        onPress={() => {
                          setPaymentMethod(method);
                          setShowMethodSelector(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.methodItemText,
                            paymentMethod === method && styles.methodItemTextSelected,
                          ]}
                        >
                          {getPaymentMethodName(method)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Account Details */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Details</Text>
                <TextInput
                  style={styles.accountInput}
                  value={accountDetails}
                  onChangeText={setAccountDetails}
                  placeholder={
                    paymentMethod === 'bank_transfer'
                      ? 'Account Name\nAccount Number\nBank Name\nRouting Number'
                      : paymentMethod === 'paypal'
                        ? 'PayPal Email'
                        : paymentMethod === 'crypto'
                          ? 'Wallet Address'
                          : 'Enter account details'
                  }
                  multiline
                  numberOfLines={paymentMethod === 'bank_transfer' ? 4 : 2}
                  textAlignVertical="top"
                />
              </View>

              <Text style={styles.noteText}>
                Processing may take 3-5 business days.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Time Period Filter Component
const TimePeriodFilter = ({
  period,
  onPeriodChange,
}: {
  period: string;
  onPeriodChange: (period: string) => void;
}) => {
  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'year', label: 'Year' },
    { value: 'all_time', label: 'All' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.periodFilterContainer}
    >
      {periods.map((p) => (
        <TouchableOpacity
          key={p.value}
          style={[styles.periodButton, period === p.value && styles.periodButtonActive]}
          onPress={() => onPeriodChange(p.value)}
        >
          <Text
            style={[styles.periodButtonText, period === p.value && styles.periodButtonTextActive]}
          >
            {p.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// Main Component
const EarningsScreen = () => {
  const router = useRouter();
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'withdrawals' | 'analytics'>('overview');
  const [period, setPeriod] = useState('month');

  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);

  const [selectedEarning, setSelectedEarning] = useState<Earning | null>(null);
  const [showEarningModal, setShowEarningModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [summaryData, earningsData, withdrawalsData, analyticsData] = await Promise.all([
        earningsAPI.getEarningsSummary(),
        earningsAPI.getEarnings(undefined, undefined, undefined, 50),
        earningsAPI.getWithdrawals(undefined, undefined, undefined, 10),
        earningsAPI.getEarningsAnalytics(period as any, undefined, undefined, 'day'),
      ]);

      setSummary(summaryData);
      setEarnings(earningsData);
      setWithdrawals(withdrawalsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching earnings data:', error);

      // Set fallback empty data
      setSummary({
        total_earnings: 0,
        available_balance: 0,
        pending_earnings: 0,
        processing_withdrawals: 0,
        completed_withdrawals: 0,
        currency: 'USD',
      });
      setEarnings([]);
      setWithdrawals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, period]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleViewEarningDetails = (earning: Earning) => {
    setSelectedEarning(earning);
    setShowEarningModal(true);
  };

  const handleWithdrawalRequest = async (
    amount: number,
    method: PaymentMethod,
    details: any
  ) => {
    setWithdrawLoading(true);

    try {
      await earningsAPI.createWithdrawal({
        amount,
        payment_method: method,
        account_details: details,
      });

      setShowWithdrawalModal(false);
      fetchData();

      Alert.alert('Success', 'Withdrawal request submitted successfully');
    } catch (error: any) {
      Alert.alert('Error', error.detail || 'Withdrawal failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleExportData = async (format: 'csv' | 'json') => {
    try {
      const result = await earningsAPI.exportEarningsData(format);

      if (format === 'csv' && result.content && result.filename) {
        await earningsAPI.downloadExport(
          result.content,
          result.filename,
          result.content_type || 'text/csv'
        );
      } else if (format === 'json') {
        const jsonString = JSON.stringify(result, null, 2);
        await earningsAPI.downloadExport(
          jsonString,
          `earnings_export_${new Date().toISOString().slice(0, 10)}.json`,
          'application/json'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const stats = summary ? [
    {
      title: 'Total Earnings',
      value: summary.total_earnings,
      subtitle: 'All time completed earnings',
      icon: 'wallet',
      color: '#34C759',
    },
    {
      title: 'Available Balance',
      value: summary.available_balance,
      subtitle: 'Ready for withdrawal',
      icon: 'dollar-sign',
      color: '#007AFF',
    },
    {
      title: 'Pending Earnings',
      value: summary.pending_earnings,
      subtitle: 'Awaiting processing',
      icon: 'clock',
      color: '#FF9500',
    },
    {
      title: 'Completed Withdrawals',
      value: summary.completed_withdrawals,
      subtitle: 'Total withdrawn',
      icon: 'credit-card',
      color: '#AF52DE',
    },
  ] : [];

  if (loading && !summary) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loaderText}>Loading earnings dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings Dashboard</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => handleExportData('csv')}
          >
            <Feather name="download" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onRefresh}
          >
            <Feather name="refresh-cw" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Time Period Filter */}
        <TimePeriodFilter period={period} onPeriodChange={setPeriod} />

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                Overview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'earnings' && styles.activeTab]}
              onPress={() => setActiveTab('earnings')}
            >
              <Text style={[styles.tabText, activeTab === 'earnings' && styles.activeTabText]}>
                Earnings
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'withdrawals' && styles.activeTab]}
              onPress={() => setActiveTab('withdrawals')}
            >
              <Text style={[styles.tabText, activeTab === 'withdrawals' && styles.activeTabText]}>
                Withdrawals
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
              onPress={() => setActiveTab('analytics')}
            >
              <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
                Analytics
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'overview' && (
            <>
              {analytics && (
                <AnalyticsChart analytics={analytics} period={period} />
              )}

              <EarningsTable
                earnings={earnings}
                onViewDetails={handleViewEarningDetails}
              />

              <WithdrawalsTable
                withdrawals={withdrawals}
                onRequestWithdrawal={() => setShowWithdrawalModal(true)}
              />
            </>
          )}

          {activeTab === 'earnings' && (
            <View style={styles.fullTableContainer}>
              <Text style={styles.fullTableTitle}>All Earnings</Text>
              <EarningsTable
                earnings={earnings}
                onViewDetails={handleViewEarningDetails}
              />
            </View>
          )}

          {activeTab === 'withdrawals' && (
            <WithdrawalsTable
              withdrawals={withdrawals}
              onRequestWithdrawal={() => setShowWithdrawalModal(true)}
            />
          )}

          {activeTab === 'analytics' && analytics && (
            <>
              <AnalyticsChart analytics={analytics} period={period} />

              <View style={styles.analyticsGrid}>
                <TopBrands brands={analytics.top_brands} />
                <PerformanceTrends trends={analytics.trends} />
              </View>
            </>
          )}
        </View>

        <View style={styles.footer} />
      </ScrollView>

      {/* Earning Details Modal */}
      <EarningDetailsModal
        visible={showEarningModal}
        earning={selectedEarning}
        onClose={() => {
          setShowEarningModal(false);
          setSelectedEarning(null);
        }}
      />

      {/* Withdrawal Request Modal */}
      {summary && (
        <WithdrawalRequestModal
          visible={showWithdrawalModal}
          availableBalance={summary.available_balance}
          onClose={() => setShowWithdrawalModal(false)}
          onConfirm={handleWithdrawalRequest}
          loading={withdrawLoading}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  periodFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  statsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statsCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statsCardTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  statsCardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statsCardSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  statsCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#007AFF',
  },
  tabContent: {
    padding: 16,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tableSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 10,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  earningRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  earningRowLeft: {
    flex: 1,
    marginRight: 12,
  },
  campaignName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  brandName: {
    fontSize: 12,
    color: '#999',
  },
  earningRowRight: {
    alignItems: 'flex-end',
  },
  earningAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
    marginBottom: 4,
  },
  earningDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  withdrawalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  withdrawalRowLeft: {
    flex: 1,
    marginRight: 12,
  },
  withdrawalAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  withdrawalMethod: {
    fontSize: 12,
    color: '#666',
  },
  withdrawalFee: {
    fontSize: 10,
    color: '#FF9500',
  },
  withdrawalRowRight: {
    alignItems: 'flex-end',
  },
  withdrawalDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  withdrawalCompleted: {
    fontSize: 9,
    color: '#999',
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  requestButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  chartsContainer: {
    gap: 16,
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noChartData: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noChartText: {
    fontSize: 14,
    color: '#999',
  },
  brandsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  brandItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandRankText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  brandCampaigns: {
    fontSize: 11,
    color: '#999',
  },
  brandStats: {
    alignItems: 'flex-end',
  },
  brandAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  brandTransactions: {
    fontSize: 10,
    color: '#999',
  },
  trendsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  trendMetric: {
    fontSize: 14,
    color: '#666',
  },
  trendValues: {
    alignItems: 'flex-end',
  },
  trendCurrent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  trendChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 2,
  },
  trendPositive: {
    color: '#34C759',
  },
  trendNegative: {
    color: '#FF3B30',
  },
  trendChangeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  trendPositiveText: {
    color: '#34C759',
  },
  trendNegativeText: {
    color: '#FF3B30',
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  fullTableContainer: {
    flex: 1,
  },
  fullTableTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  footer: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  detailValueSmall: {
    fontSize: 12,
    color: '#666',
  },
  detailAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34C759',
  },
  detailNotes: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  balanceInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginRight: 4,
  },
  amountInputField: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  feeInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: '#666',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  netAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34C759',
  },
  methodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  methodSelectorText: {
    fontSize: 14,
    color: '#333',
  },
  methodList: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  methodItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  methodItemSelected: {
    backgroundColor: '#007AFF',
  },
  methodItemText: {
    fontSize: 14,
    color: '#333',
  },
  methodItemTextSelected: {
    color: '#fff',
  },
  accountInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  noteText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});

export default EarningsScreen;