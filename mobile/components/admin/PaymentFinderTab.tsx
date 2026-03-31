import React, { useState, useEffect, useCallback } from 'react';
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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import adminPaymentFinderAPI, { 
  InfluencerDetailsResponse, 
  CampaignDetailsResponse, 
  BankAccount,
  CampaignApplication
} from '../../services/adminpaymentfinderapi';

// Tab types
type SearchType = 'influencer' | 'campaign';

// Stat Card Component
const StatCard = ({ title, value, icon, color, onPress }: any) => {
  const getIconColor = () => {
    switch (color) {
      case 'primary': return '#2196F3';
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      case 'info': return '#00BCD4';
      default: return '#757575';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: getIconColor(), borderLeftWidth: 4 }]}
      onPress={onPress}
    >
      <View style={styles.statCardHeader}>
        <Text style={styles.statCardTitle}>{title}</Text>
        <View style={[styles.statCardIcon, { backgroundColor: getIconColor() + '20' }]}>
          <Ionicons name={icon as any} size={24} color={getIconColor()} />
        </View>
      </View>
      <Text style={styles.statCardValue}>{value}</Text>
    </TouchableOpacity>
  );
};

// Bank Account Card Component
const BankAccountCard = ({ account }: { account: BankAccount }) => {
  const maskedNumber = adminPaymentFinderAPI.maskAccountNumber(account.account_number);
  
  return (
    <View style={styles.bankCard}>
      <View style={styles.bankCardHeader}>
        <View style={styles.bankIcon}>
          <Ionicons name="business" size={20} color="#2196F3" />
        </View>
        <View style={styles.bankInfo}>
          <Text style={styles.bankHolderName}>{account.account_holder_name}</Text>
          <Text style={styles.bankDetails}>
            {account.bank_name || 'Bank'} • {maskedNumber}
          </Text>
        </View>
        {account.is_primary && (
          <View style={styles.primaryBadge}>
            <Text style={styles.primaryBadgeText}>Primary</Text>
          </View>
        )}
      </View>
      
      <View style={styles.bankDetailsRow}>
        <View style={styles.bankDetailItem}>
          <Text style={styles.bankDetailLabel}>IFSC</Text>
          <Text style={styles.bankDetailValue}>{account.ifsc_code}</Text>
        </View>
        <View style={styles.bankDetailItem}>
          <Text style={styles.bankDetailLabel}>Type</Text>
          <Text style={styles.bankDetailValue}>{account.account_type}</Text>
        </View>
        <View style={styles.bankDetailItem}>
          <Text style={styles.bankDetailLabel}>Status</Text>
          <View style={[styles.verificationBadge, account.is_verified && styles.verifiedBadge]}>
            <Text style={[styles.verificationText, account.is_verified && styles.verifiedText]}>
              {account.is_verified ? 'Verified' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Payment Card Component
const PaymentCard = ({ application, campaign, onProcessPayment }: any) => {
  const [expanded, setExpanded] = useState(false);
  const statusColor = adminPaymentFinderAPI.getApplicationStatusColor(application.status);
  const paymentStatusColor = adminPaymentFinderAPI.getPaymentStatusColor(application.payment_status);
  
  return (
    <View style={styles.paymentCard}>
      <TouchableOpacity 
        style={styles.paymentCardHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.paymentHeaderLeft}>
          <View style={styles.paymentAvatar}>
            <Text style={styles.paymentAvatarText}>
              {application.influencer_name?.charAt(0).toUpperCase() || 'I'}
            </Text>
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentName}>{application.influencer_name}</Text>
            <Text style={styles.paymentCampaign}>{campaign?.title}</Text>
          </View>
        </View>
        <View style={styles.paymentHeaderRight}>
          <View style={[styles.paymentStatusBadge, { backgroundColor: paymentStatusColor + '20' }]}>
            <Text style={[styles.paymentStatusText, { color: paymentStatusColor }]}>
              {adminPaymentFinderAPI.getPaymentStatusLabel(application.payment_status)}
            </Text>
          </View>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color="#666" />
        </View>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.paymentDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Campaign:</Text>
            <Text style={styles.detailValue}>{campaign?.title}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={[styles.detailValue, styles.amountValue]}>
              {adminPaymentFinderAPI.formatCurrency(application.payment_amount || campaign?.budget, campaign?.currency)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {application.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Applied:</Text>
            <Text style={styles.detailValue}>{adminPaymentFinderAPI.formatDate(application.applied_at)}</Text>
          </View>
          
          {application.status === 'completed' && application.payment_status !== 'completed' && (
            <TouchableOpacity
              style={styles.processPaymentButton}
              onPress={() => onProcessPayment(application, campaign)}
            >
              <Ionicons name="cash-outline" size={20} color="#fff" />
              <Text style={styles.processPaymentText}>Process Payment</Text>
            </TouchableOpacity>
          )}
          
          {application.payment_status === 'completed' && application.payment_id && (
            <View style={styles.paymentCompletedInfo}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.paymentCompletedText}>
                Payment completed • Transaction ID: {application.payment_id.slice(-8)}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// Influencer Detail Modal
const InfluencerDetailModal = ({ visible, influencer, onClose, onProcessPayment }: any) => {
  if (!influencer) return null;
  
  const profile = influencer.profile?.profile;
  const bankAccounts = influencer.bankAccounts || [];
  const primaryAccount = bankAccounts.find(acc => acc.is_primary);
  
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
            <Text style={styles.modalTitle}>Influencer Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>
                  {profile?.full_name?.charAt(0) || profile?.nickname?.charAt(0) || 'I'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile?.full_name || profile?.nickname}</Text>
                <Text style={styles.profileEmail}>{profile?.email}</Text>
                {profile?.location && (
                  <Text style={styles.profileLocation}>
                    <Ionicons name="location-outline" size={12} /> {profile.location}
                  </Text>
                )}
              </View>
            </View>
            
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{influencer.totalEarnings?.toFixed(2) || '0'}</Text>
                <Text style={styles.statLabel}>Total Earnings</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{influencer.completedPayments || 0}</Text>
                <Text style={styles.statLabel}>Paid</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{influencer.pendingPayments || 0}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
            
            {/* Bank Accounts */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bank Accounts</Text>
              {bankAccounts.length === 0 ? (
                <View style={styles.emptyBankContainer}>
                  <Ionicons name="alert-circle-outline" size={32} color="#FF9800" />
                  <Text style={styles.emptyBankText}>No bank accounts found</Text>
                  <Text style={styles.emptyBankSubtext}>Influencer needs to add a bank account for payments</Text>
                </View>
              ) : (
                bankAccounts.map(account => (
                  <BankAccountCard key={account._id} account={account} />
                ))
              )}
            </View>
            
            {/* Campaign Applications */}
            {influencer.campaigns && influencer.campaigns.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Campaign Applications</Text>
                {influencer.campaigns.map((campaign: any) => (
                  campaign.applications?.map((app: any) => (
                    <PaymentCard
                      key={app.application_id}
                      application={app}
                      campaign={campaign}
                      onProcessPayment={onProcessPayment}
                    />
                  ))
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Campaign Detail Modal
const CampaignDetailModal = ({ visible, campaign, onClose, onProcessPayment }: any) => {
  if (!campaign) return null;
  
  const completedApplications = campaign.applications?.filter(
    (app: any) => app.status === 'completed' && app.payment_status !== 'completed'
  ) || [];
  
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
            <Text style={styles.modalTitle}>Campaign Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Campaign Info */}
            <View style={styles.campaignHeader}>
              <Text style={styles.campaignTitle}>{campaign.campaign?.title}</Text>
              <View style={[styles.campaignStatusBadge, { backgroundColor: adminPaymentFinderAPI.getCampaignStatusColor(campaign.campaign?.status) + '20' }]}>
                <Text style={[styles.campaignStatusText, { color: adminPaymentFinderAPI.getCampaignStatusColor(campaign.campaign?.status) }]}>
                  {campaign.campaign?.status?.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View style={styles.campaignDetailsGrid}>
              <View style={styles.campaignDetailItem}>
                <Ionicons name="cash-outline" size={16} color="#666" />
                <Text style={styles.campaignDetailLabel}>Budget:</Text>
                <Text style={styles.campaignDetailValue}>
                  {adminPaymentFinderAPI.formatCurrency(campaign.campaign?.budget, campaign.campaign?.currency)}
                </Text>
              </View>
              <View style={styles.campaignDetailItem}>
                <Ionicons name="pricetag-outline" size={16} color="#666" />
                <Text style={styles.campaignDetailLabel}>Category:</Text>
                <Text style={styles.campaignDetailValue}>{campaign.campaign?.category}</Text>
              </View>
              <View style={styles.campaignDetailItem}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.campaignDetailLabel}>Deadline:</Text>
                <Text style={styles.campaignDetailValue}>
                  {adminPaymentFinderAPI.formatDate(campaign.campaign?.deadline)}
                </Text>
              </View>
            </View>
            
            {/* Brand Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Brand Information</Text>
              <View style={styles.brandInfoCard}>
                <Text style={styles.brandName}>{campaign.brandDetails?.profile?.company_name}</Text>
                <Text style={styles.brandContact}>{campaign.brandDetails?.profile?.contact_person_name}</Text>
                <Text style={styles.brandEmail}>{campaign.brandDetails?.profile?.email}</Text>
              </View>
            </View>
            
            {/* Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Campaign Metrics</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{campaign.metrics?.totalApplications}</Text>
                  <Text style={styles.metricLabel}>Applications</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{campaign.metrics?.completed}</Text>
                  <Text style={styles.metricLabel}>Completed</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{campaign.metrics?.pending}</Text>
                  <Text style={styles.metricLabel}>Pending</Text>
                </View>
              </View>
            </View>
            
            {/* Applications Ready for Payment */}
            {completedApplications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ready for Payment ({completedApplications.length})</Text>
                {completedApplications.map((app: any) => (
                  <PaymentCard
                    key={app.application_id}
                    application={app}
                    campaign={campaign.campaign}
                    onProcessPayment={onProcessPayment}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Payment Processing Modal
const PaymentProcessingModal = ({ visible, application, campaign, onClose, onSuccess }: any) => {
  const [transactionId, setTransactionId] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const handleProcessPayment = async () => {
    if (!transactionId.trim()) {
      Alert.alert('Error', 'Please enter a transaction ID');
      return;
    }
    
    setProcessing(true);
    try {
      // Here you would call the API to process the payment
      // await adminPaymentFinderAPI.processCampaignPayment(campaign._id, application.influencer_id);
      Alert.alert('Success', 'Payment processed successfully');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.paymentModalContent}>
          <Text style={styles.paymentModalTitle}>Process Payment</Text>
          
          <View style={styles.paymentInfoContainer}>
            <Text style={styles.paymentInfoLabel}>Influencer:</Text>
            <Text style={styles.paymentInfoValue}>{application?.influencer_name}</Text>
            
            <Text style={styles.paymentInfoLabel}>Campaign:</Text>
            <Text style={styles.paymentInfoValue}>{campaign?.title}</Text>
            
            <Text style={styles.paymentInfoLabel}>Amount:</Text>
            <Text style={[styles.paymentInfoValue, styles.paymentAmount]}>
              {adminPaymentFinderAPI.formatCurrency(application?.payment_amount || campaign?.budget, campaign?.currency)}
            </Text>
          </View>
          
          <TextInput
            style={styles.transactionInput}
            placeholder="Enter Transaction ID"
            value={transactionId}
            onChangeText={setTransactionId}
            autoCapitalize="none"
          />
          
          <View style={styles.paymentModalActions}>
            <TouchableOpacity style={styles.cancelPaymentButton} onPress={onClose}>
              <Text style={styles.cancelPaymentText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmPaymentButton, processing && styles.disabledButton]}
              onPress={handleProcessPayment}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmPaymentText}>Process Payment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main Component
export default function PaymentFinderTab() {
  const [searchType, setSearchType] = useState<SearchType>('influencer');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [selectedInfluencer, setSelectedInfluencer] = useState<InfluencerDetailsResponse | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignDetailsResponse | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [selectedPaymentCampaign, setSelectedPaymentCampaign] = useState<any>(null);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
  const [readyCampaignsCount, setReadyCampaignsCount] = useState(0);
  
  const fetchPendingCounts = useCallback(async () => {
    try {
      const pendingInfluencers = await adminPaymentFinderAPI.getInfluencersWithPendingPayments();
      const readyCampaigns = await adminPaymentFinderAPI.getCampaignsReadyForPayment();
      setPendingPaymentsCount(pendingInfluencers?.length || 0);
      setReadyCampaignsCount(readyCampaigns?.length || 0);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  }, []);
  
  useEffect(() => {
    fetchPendingCounts();
  }, [fetchPendingCounts]);
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', `Please enter a ${searchType === 'influencer' ? 'influencer ID or name' : 'campaign ID or title'}`);
      return;
    }
    
    setLoading(true);
    setSearchResult(null);
    
    try {
      if (searchType === 'influencer') {
        const result = await adminPaymentFinderAPI.getInfluencerDetails(searchQuery);
        setSearchResult(result);
        setSelectedInfluencer(result);
        setDetailModalVisible(true);
      } else {
        const result = await adminPaymentFinderAPI.getCampaignDetails(searchQuery);
        setSearchResult(result);
        setSelectedCampaign(result);
        setDetailModalVisible(true);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || `${searchType === 'influencer' ? 'Influencer' : 'Campaign'} not found`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleProcessPayment = (application: any, campaign: any) => {
    setSelectedApplication(application);
    setSelectedPaymentCampaign(campaign);
    setPaymentModalVisible(true);
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingCounts();
    if (searchQuery) {
      handleSearch();
    } else {
      setRefreshing(false);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment Finder</Text>
        <Text style={styles.headerSubtitle}>Manage influencer payments and campaigns</Text>
      </View>
      
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Pending Payments"
          value={pendingPaymentsCount}
          icon="cash-outline"
          color="warning"
        />
        <StatCard
          title="Ready Campaigns"
          value={readyCampaignsCount}
          icon="flag-outline"
          color="success"
        />
      </View>
      
      {/* Search Type Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, searchType === 'influencer' && styles.activeTab]}
          onPress={() => setSearchType('influencer')}
        >
          <Ionicons name="person" size={20} color={searchType === 'influencer' ? '#2196F3' : '#666'} />
          <Text style={[styles.tabText, searchType === 'influencer' && styles.activeTabText]}>
            Influencer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, searchType === 'campaign' && styles.activeTab]}
          onPress={() => setSearchType('campaign')}
        >
          <Ionicons name="megaphone" size={20} color={searchType === 'campaign' ? '#2196F3' : '#666'} />
          <Text style={[styles.tabText, searchType === 'campaign' && styles.activeTabText]}>
            Campaign
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={searchType === 'influencer' ? 'Search by ID, name, or email...' : 'Search by ID, title, or brand...'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
            onSubmitEditing={handleSearch}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="search" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => {
              setSearchType('influencer');
              // You can add logic to fetch influencers with pending payments
            }}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FF9800' }]}>
              <Ionicons name="people" size={24} color="#fff" />
            </View>
            <Text style={styles.quickActionText}>Pending Payments</Text>
            <Text style={styles.quickActionCount}>{pendingPaymentsCount}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => {
              setSearchType('campaign');
            }}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="flag" size={24} color="#fff" />
            </View>
            <Text style={styles.quickActionText}>Ready Campaigns</Text>
            <Text style={styles.quickActionCount}>{readyCampaignsCount}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Recent Activity Placeholder */}
      <View style={styles.recentActivity}>
        <Text style={styles.recentActivityTitle}>Recent Payments</Text>
        <Text style={styles.recentActivityEmpty}>
          No recent payments to display. Search for an influencer or campaign to process payments.
        </Text>
      </View>
      
      {/* Influencer Detail Modal */}
      <InfluencerDetailModal
        visible={detailModalVisible && searchType === 'influencer' && !!selectedInfluencer}
        influencer={selectedInfluencer}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedInfluencer(null);
          setSearchResult(null);
        }}
        onProcessPayment={handleProcessPayment}
      />
      
      {/* Campaign Detail Modal */}
      <CampaignDetailModal
        visible={detailModalVisible && searchType === 'campaign' && !!selectedCampaign}
        campaign={selectedCampaign}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedCampaign(null);
          setSearchResult(null);
        }}
        onProcessPayment={handleProcessPayment}
      />
      
      {/* Payment Processing Modal */}
      <PaymentProcessingModal
        visible={paymentModalVisible}
        application={selectedApplication}
        campaign={selectedPaymentCampaign}
        onClose={() => {
          setPaymentModalVisible(false);
          setSelectedApplication(null);
          setSelectedPaymentCampaign(null);
        }}
        onSuccess={() => {
          fetchPendingCounts();
          if (searchQuery) handleSearch();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#E3F2FD',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196F3',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#ccc',
  },
  quickActions: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  quickActionCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  recentActivity: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  recentActivityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  recentActivityEmpty: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  profileLocation: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  bankCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  bankCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bankIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankInfo: {
    flex: 1,
  },
  bankHolderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  bankDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  primaryBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  bankDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bankDetailItem: {
    alignItems: 'center',
  },
  bankDetailLabel: {
    fontSize: 10,
    color: '#999',
  },
  bankDetailValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  verificationBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E9',
  },
  verificationText: {
    fontSize: 10,
    color: '#F44336',
  },
  verifiedText: {
    color: '#4CAF50',
  },
  emptyBankContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyBankText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF9800',
    marginTop: 8,
  },
  emptyBankSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  paymentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  paymentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  paymentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  paymentCampaign: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  paymentHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  paymentDetails: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    width: 80,
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  amountValue: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  processPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  processPaymentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  paymentCompletedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  paymentCompletedText: {
    fontSize: 12,
    color: '#4CAF50',
    flex: 1,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  campaignTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  campaignStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  campaignStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  campaignDetailsGrid: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  campaignDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  campaignDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    width: 60,
  },
  campaignDetailValue: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  brandInfoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  brandContact: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  brandEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  metricLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  paymentModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 20,
    padding: 20,
  },
  paymentModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  paymentInfoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  paymentInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  paymentInfoValue: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  transactionInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  paymentModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelPaymentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  cancelPaymentText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  confirmPaymentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  confirmPaymentText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
});