import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import paymentsAPI, {
  PendingApplication,
  PaymentHistoryItem,
  formatCurrency,
  formatDate,
  getPaymentStatusConfig,
  getBankStatusConfig,
  maskAccountNumber,
} from '../../services/paymentsAPI';
import { accountAPI } from '../../services/accountAPI';
import profileAPI from '../../services/profileAPI';
import { Feather, Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =============================================
// 🎨 STYLED COMPONENTS
// =============================================

const StatsCard = ({ label, value, icon, color, subtitle, onPress }: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
  onPress?: () => void;
}) => {
  const IconComponent = getIconComponent(icon);
  
  return (
    <TouchableOpacity 
      style={[styles.statsCard, onPress && styles.statsCardClickable]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <LinearGradient
        colors={[color, color + 'CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statsCardGradient}
      >
        <View style={styles.statsHeader}>
          <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
            <IconComponent name={icon} size={24} color="#fff" />
          </View>
        </View>
        <View style={styles.statsContent}>
          <Text style={styles.statsValue}>{value}</Text>
          <Text style={styles.statsLabel}>{label}</Text>
          {subtitle && <Text style={styles.statsSubtitle}>{subtitle}</Text>}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const StatusBadge = ({ status, type = 'payment' }: { status: string; type?: 'payment' | 'application' }) => {
  const config = type === 'payment' 
    ? paymentsAPI.getPaymentStatusConfig(status)
    : { color: '#F59E0B', backgroundColor: '#FEF3C7', icon: 'clock', label: status };
  
  return (
    <View style={[styles.statusBadge, { backgroundColor: config.backgroundColor }]}>
      <Feather name={config.icon as any} size={12} color={config.color} />
      <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const BankAccountCard = ({ bankAccount }: { bankAccount: any }) => {
  const config = getBankStatusConfig(bankAccount);
  
  if (!bankAccount) {
    return (
      <View style={[styles.bankCard, styles.noBankCard]}>
        <View style={styles.bankCardIcon}>
          <Feather name="alert-circle" size={24} color="#757575" />
        </View>
        <View style={styles.bankCardInfo}>
          <Text style={styles.bankCardTitle}>No Bank Account Added</Text>
          <Text style={styles.bankCardSubtitle}>
            Influencer needs to add bank details for direct payment
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.bankCard, bankAccount.verified && styles.verifiedBankCard]}>
      <View style={styles.bankCardHeader}>
        <View style={styles.bankCardIcon}>
          <Feather name="home" size={20} color={bankAccount.verified ? '#10B981' : '#F59E0B'} />
        </View>
        <View style={[styles.verificationBadge, { backgroundColor: config.backgroundColor }]}>
          <Text style={[styles.verificationBadgeText, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
      </View>
      
      <View style={styles.bankCardInfo}>
        <Text style={styles.bankCardName}>{bankAccount.account_holder_name || 'Account Holder'}</Text>
        <Text style={styles.bankCardDetails}>
          {bankAccount.bank_name} • {maskAccountNumber(bankAccount.account_number)}
        </Text>
        {bankAccount.ifsc_code && (
          <Text style={styles.bankCardDetails}>IFSC: {bankAccount.ifsc_code}</Text>
        )}
        {bankAccount.account_type && (
          <Text style={styles.bankCardDetails}>
            Account Type: {bankAccount.account_type.toUpperCase()}
          </Text>
        )}
      </View>
    </View>
  );
};

const PaymentCard = ({ application, onPay, onViewProfile, onChat, isUpdated }: {
  application: PendingApplication;
  onPay: (amount: number) => void;
  onViewProfile: () => void;
  onChat: () => void;
  isUpdated: boolean;
}) => {
  const { currency, rates, convertAmount } = useCurrency();
  const [amount, setAmount] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [amountError, setAmountError] = useState('');
  
  const amountDue = application.amount_due || 0;
  const appCurrency = application.currency || 'USD';
  const bankAccount = application.bank_account;
  const bankConfig = getBankStatusConfig(bankAccount);
  const isPayable = bankAccount?.verified && parseFloat(amount) > 0 && parseFloat(amount) <= amountDue;
  
  const convertedAmount = convertAmount(amountDue, appCurrency, currency);
  
  const handleAmountChange = (text: string) => {
    setAmount(text);
    const numAmount = parseFloat(text);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setAmountError('Please enter a valid amount');
    } else if (numAmount > amountDue) {
      setAmountError(`Amount exceeds maximum of ${formatCurrency(amountDue, appCurrency)}`);
    } else {
      setAmountError('');
    }
  };
  
  const handleQuickSelect = (percentage: number) => {
    const quickAmount = amountDue * percentage;
    setAmount(quickAmount.toFixed(2));
    setAmountError('');
  };
  
  const handlePayPress = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0 && numAmount <= amountDue) {
      onPay(numAmount);
    }
  };
  
  return (
    <View style={[styles.paymentCard, isUpdated && styles.updatedCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.influencerInfo}>
          <View style={styles.influencerAvatar}>
            <Text style={styles.influencerInitial}>
              {application.influencer.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View>
            <Text style={styles.influencerName}>{application.influencer.name}</Text>
            <Text style={styles.influencerEmail} numberOfLines={1}>
              {application.influencer.email || 'No email provided'}
            </Text>
          </View>
        </View>
        <StatusBadge status={application.status} type="application" />
      </View>
      
      <Text style={styles.campaignTitle} numberOfLines={1}>
        {application.campaign_title}
      </Text>
      
      <View style={styles.amountRow}>
        <View>
          <Text style={styles.dueLabel}>Amount Due</Text>
          <Text style={styles.dueAmount}>
            {formatCurrency(amountDue, appCurrency)}
          </Text>
          {appCurrency !== currency && (
            <Text style={styles.convertedAmount}>
              ≈ {formatCurrency(convertedAmount, currency)}
            </Text>
          )}
        </View>
        
        {application.media_submitted && (
          <View style={styles.mediaBadge}>
            <Feather name="image" size={12} color="#9C27B0" />
            <Text style={styles.mediaBadgeText}>Media Submitted</Text>
          </View>
        )}
      </View>
      
      <BankAccountCard bankAccount={bankAccount} />
      
      <View style={styles.paymentInputContainer}>
        <Text style={styles.inputLabel}>Payment Amount</Text>
        <View style={[styles.amountInputWrapper, isFocused && styles.amountInputFocused, amountError && styles.amountInputError]}>
          <Text style={styles.currencySymbol}>
            {appCurrency === 'USD' ? '$' : appCurrency === 'EUR' ? '€' : appCurrency === 'GBP' ? '£' : appCurrency}
          </Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="0.00"
            keyboardType="numeric"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            editable={bankAccount?.verified}
          />
        </View>
        {amountError ? (
          <Text style={styles.errorText}>{amountError}</Text>
        ) : null}
        
        {bankAccount?.verified && (
          <View style={styles.quickSelectRow}>
            <Text style={styles.quickSelectLabel}>Quick Select:</Text>
            <View style={styles.quickSelectButtons}>
              {[0.25, 0.5, 0.75, 1].map((percentage) => (
                <TouchableOpacity
                  key={percentage}
                  style={styles.quickSelectButton}
                  onPress={() => handleQuickSelect(percentage)}
                >
                  <Text style={styles.quickSelectText}>{percentage * 100}%</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.payButton, (!isPayable || !bankAccount?.verified) && styles.payButtonDisabled]}
          onPress={handlePayPress}
          disabled={!isPayable || !bankAccount?.verified}
        >
          <Feather name="send" size={18} color="#fff" />
          <Text style={styles.payButtonText}>
            Pay {amount ? formatCurrency(parseFloat(amount), appCurrency) : formatCurrency(amountDue, appCurrency)}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.secondaryAction} onPress={onChat}>
            <Feather name="message-circle" size={16} color="#666" />
            <Text style={styles.secondaryActionText}>Chat</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryAction} onPress={onViewProfile}>
            <Feather name="user" size={16} color="#666" />
            <Text style={styles.secondaryActionText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// const PaymentHistoryItem = ({ payment, onPress }: { payment: PaymentHistoryItem; onPress?: () => void }) => {
//   const { currency, convertAmount } = useCurrency();
//   const config = getPaymentStatusConfig(payment.status);
//   const convertedAmount = convertAmount(payment.amount, payment.currency, currency);
  
//   return (
//     <TouchableOpacity style={styles.historyItem} onPress={onPress}>
//       <View style={styles.historyLeft}>
//         <View style={[styles.historyIcon, { backgroundColor: config.backgroundColor }]}>
//           <Feather name={config.icon as any} size={20} color={config.color} />
//         </View>
//         <View>
//           <Text style={styles.historyCampaign} numberOfLines={1}>
//             {payment.campaign_title || 'Unknown Campaign'}
//           </Text>
//           <Text style={styles.historyInfluencer}>
//             {payment.influencer_name || 'Influencer'}
//           </Text>
//           <Text style={styles.historyDate}>
//             {formatDate(payment.created_at, 'short')}
//           </Text>
//         </View>
//       </View>
      
//       <View style={styles.historyRight}>
//         <Text style={styles.historyAmount}>
//           {formatCurrency(payment.amount, payment.currency)}
//         </Text>
//         {payment.currency !== currency && (
//           <Text style={styles.historyConverted}>
//             ≈ {formatCurrency(convertedAmount, currency)}
//           </Text>
//         )}
//         <StatusBadge status={payment.status} type="payment" />
//       </View>
//     </TouchableOpacity>
//   );
// };

// Helper function to get icon component
const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    'wallet': Feather,
    'receipt': Feather,
    'check-circle': Feather,
    'trending-up': Feather,
  };
  return icons[iconName] || Feather;
};

// Main Component
const QuickPayScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, token } = useAuth();
  const { currency, changeCurrency, rates, convertAmount } = useCurrency();
  
  const [applications, setApplications] = useState<PendingApplication[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [updatedItems, setUpdatedItems] = useState<Set<string>>(new Set());
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [profileDialogVisible, setProfileDialogVisible] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  
  const markAsUpdated = (itemId: string) => {
    setUpdatedItems(prev => new Set([...prev, itemId]));
    setTimeout(() => {
      setUpdatedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 2000);
  };
  
  const isRecentlyUpdated = (itemId: string) => updatedItems.has(itemId);
  
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load pending direct payments
      const pendingRes = await paymentsAPI.getPendingDirectPayments();
      
      let pendingApps: PendingApplication[] = [];
      if (pendingRes && typeof pendingRes === 'object') {
        if (Array.isArray(pendingRes)) {
          pendingApps = pendingRes;
        } else if (pendingRes.applications && Array.isArray(pendingRes.applications)) {
          pendingApps = pendingRes.applications;
        } else if (pendingRes.data && Array.isArray(pendingRes.data)) {
          pendingApps = pendingRes.data;
        }
      }
      
      setApplications(pendingApps);
      
      // Load payment history
      try {
        const historyRes = await paymentsAPI.getPaymentHistory();
        let historyData: PaymentHistoryItem[] = [];
        
        if (historyRes && typeof historyRes === 'object') {
          if (Array.isArray(historyRes)) {
            historyData = historyRes;
          } else if (historyRes.payments && Array.isArray(historyRes.payments)) {
            historyData = historyRes.payments;
          } else if (historyRes.data && Array.isArray(historyRes.data)) {
            historyData = historyRes.data;
          }
        }
        
        setPaymentHistory(historyData);
      } catch (paymentError) {
        console.error('Error loading payment history:', paymentError);
        setPaymentHistory([]);
      }
      
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.detail || err.message || 'Failed to load data');
      setApplications([]);
      setPaymentHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handlePay = async (application: PendingApplication, amount: number) => {
    if (!application.bank_account?.verified) {
      Alert.alert('Cannot Pay', 'Influencer bank account is not verified');
      return;
    }
    
    if (amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    
    if (amount > (application.amount_due || 0)) {
      Alert.alert('Invalid Amount', 'Amount exceeds the due amount');
      return;
    }
    
    setPayingId(application.application_id);
    setPaymentInProgress(true);
    
    try {
      const response = await paymentsAPI.directPayInfluencer(
        application.campaign_id,
        application.influencer.id,
        amount,
        'bank_transfer'
      );
      
      if (response.success) {
        setSuccess(`Successfully paid ${application.influencer.name} ${formatCurrency(amount, application.currency)}`);
        setShowSuccessToast(true);
        
        markAsUpdated(application.application_id);
        
        // Remove from pending
        setApplications(prev => prev.filter(app => app.application_id !== application.application_id));
        
        // Add to history
        const newPayment: PaymentHistoryItem = {
          id: response.payment_id,
          payment_id: response.payment_id,
          transaction_id: response.transaction_id,
          campaign_id: application.campaign_id,
          campaign_title: application.campaign_title,
          influencer_id: application.influencer.id,
          influencer_name: application.influencer.name,
          amount: amount,
          currency: application.currency,
          status: 'completed',
          created_at: new Date().toISOString(),
        };
        
        setPaymentHistory(prev => [newPayment, ...prev]);
        
        // Show success alert
        Alert.alert(
          'Payment Successful!',
          `$${amount.toFixed(2)} has been sent to ${application.influencer.name}`,
          [{ text: 'OK' }]
        );
      }
      
    } catch (err: any) {
      console.error('Payment failed:', err);
      Alert.alert('Payment Failed', err.detail || err.message || 'Payment failed. Please try again.');
    } finally {
      setPayingId(null);
      setPaymentInProgress(false);
    }
  };
  
  const handleViewProfile = async (influencerId: string, influencerName: string) => {
    try {
      const profileData = await profileAPI.getProfileById(influencerId);
      setSelectedProfile({
        ...(profileData.profile || profileData),
        _id: influencerId,
        username: influencerName,
      });
      setProfileDialogVisible(true);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    }
  };
  
  const handleChat = (userId: string, userName: string) => {
    router.push(`/(brand)/collaborations?user=${userId}&name=${encodeURIComponent(userName)}` as any);
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };
  
  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);
  
  const stats = {
    pendingPayments: applications.length,
    readyToPay: applications.filter(app => app.bank_account?.verified).length,
    totalPayments: paymentHistory.length,
    completedPayments: paymentHistory.filter(p => p.status === 'completed').length,
    pendingAmount: applications.reduce((sum, app) => {
      const converted = convertAmount(app.amount_due || 0, app.currency || 'USD', currency);
      return sum + converted;
    }, 0),
  };
  
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loaderText}>Loading payment dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={['#0066CC', '#004499']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View>
            <Text style={styles.headerTitle}>Direct Payment Management</Text>
            <Text style={styles.headerSubtitle}>
              Send direct bank transfers to influencers with verified accounts
            </Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Feather name="refresh-cw" size={20} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
        
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatsCard
            label="Total Applications"
            value={stats.pendingPayments}
            icon="wallet"
            color="#3B82F6"
            subtitle={`${stats.readyToPay} verified`}
          />
          <StatsCard
            label="Ready to Pay"
            value={stats.readyToPay}
            icon="check-circle"
            color="#10B981"
            subtitle="Verified bank accounts"
          />
          <StatsCard
            label="Completed Payments"
            value={stats.completedPayments}
            icon="receipt"
            color="#8B5CF6"
            subtitle={`${stats.totalPayments} total`}
          />
          <StatsCard
            label="Total Pending"
            value={formatCurrency(stats.pendingAmount, currency)}
            icon="trending-up"
            color="#F59E0B"
            subtitle="Awaiting payment"
          />
        </View>
        
        {/* Error Message */}
        {error ? (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={20} color="#ff3b30" />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
            onPress={() => setActiveTab('pending')}
          >
            <Feather
              name="clock"
              size={18}
              color={activeTab === 'pending' ? '#0066CC' : '#999'}
            />
            <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
              Pending Payments
            </Text>
            {applications.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{applications.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <Feather
              name="list"
              size={18}
              color={activeTab === 'history' ? '#0066CC' : '#999'}
            />
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              Payment History
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Pending Payments Tab */}
        {activeTab === 'pending' && (
          <View style={styles.pendingContainer}>
            {applications.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="check-circle" size={60} color="#10B981" />
                <Text style={styles.emptyTitle}>All Caught Up! 🎉</Text>
                <Text style={styles.emptyText}>
                  No pending payments. All influencer campaigns have been processed.
                </Text>
              </View>
            ) : (
              applications.map((application) => {
                const isUpdated = isRecentlyUpdated(application.application_id);
                
                return (
                  <PaymentCard
                    key={application.application_id}
                    application={application}
                    onPay={(amount) => handlePay(application, amount)}
                    onViewProfile={() => handleViewProfile(application.influencer.id, application.influencer.name)}
                    onChat={() => handleChat(application.influencer.id, application.influencer.name)}
                    isUpdated={isUpdated}
                  />
                );
              })
            )}
          </View>
        )}
        
        {/* Payment History Tab */}
        {activeTab === 'history' && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Payment History</Text>
            {paymentHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="receipt" size={60} color="#ccc" />
                <Text style={styles.emptyTitle}>No Payment History</Text>
                <Text style={styles.emptyText}>
                  Your payment history will appear here after processing payments
                </Text>
              </View>
            ) : (
              paymentHistory.map((payment) => (
                <PaymentHistoryItem
                  key={payment.id || payment.payment_id}
                  payment={payment}
                />
              ))
            )}
          </View>
        )}
        
        <View style={styles.footer} />
      </ScrollView>
      
      {/* Success Toast */}
      {showSuccessToast && (
        <BlurView intensity={90} tint="light" style={styles.toastContainer}>
          <View style={styles.toastContent}>
            <Feather name="check-circle" size={24} color="#10B981" />
            <Text style={styles.toastText}>{success}</Text>
          </View>
        </BlurView>
      )}
      
      {/* Profile View Modal */}
      <Modal
        visible={profileDialogVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setProfileDialogVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.profileModal}>
            <LinearGradient
              colors={['#0066CC', '#004499']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileModalHeader}
            >
              <View style={styles.profileModalHeaderContent}>
                <Feather name="user" size={24} color="#fff" />
                <Text style={styles.profileModalTitle}>Profile</Text>
              </View>
              <TouchableOpacity onPress={() => setProfileDialogVisible(false)}>
                <Feather name="x" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            
            <View style={styles.profileModalBody}>
              <View style={styles.profileAvatarLarge}>
                <Text style={styles.profileAvatarText}>
                  {selectedProfile?.username?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <Text style={styles.profileName}>{selectedProfile?.username || 'User'}</Text>
              <Text style={styles.profileType}>
                {selectedProfile?.profile_type === 'influencer' ? 'Influencer' : 'Brand'}
              </Text>
              
              <View style={styles.profileActions}>
                <TouchableOpacity
                  style={styles.profileChatButton}
                  onPress={() => {
                    setProfileDialogVisible(false);
                    handleChat(selectedProfile?._id, selectedProfile?.username);
                  }}
                >
                  <Feather name="message-circle" size={20} color="#fff" />
                  <Text style={styles.profileChatText}>Message</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.profileViewButton}
                  onPress={() => {
                    setProfileDialogVisible(false);
                    router.push(`/(shared)/profile/${selectedProfile?._id}` as any);
                  }}
                >
                  <Feather name="eye" size={20} color="#0066CC" />
                  <Text style={styles.profileViewText}>Full Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    maxWidth: '80%',
  },
  refreshButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statsCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsCardClickable: {
    // Add clickable styles if needed
  },
  statsCardGradient: {
    padding: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  statsIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContent: {
    marginTop: 4,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  statsSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#ff3b30',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#0066CC10',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#0066CC',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: 8,
    backgroundColor: '#0066CC',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  pendingContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  updatedCard: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  influencerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  influencerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  influencerInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  influencerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  influencerEmail: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  dueLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  dueAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  convertedAmount: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  mediaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  mediaBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9C27B0',
  },
  bankCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  noBankCard: {
    backgroundColor: '#FFEBEE',
  },
  verifiedBankCard: {
    borderWidth: 1,
    borderColor: '#10B981',
  },
  bankCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bankCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verificationBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  bankCardInfo: {
    marginTop: 4,
  },
  bankCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  bankCardDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  paymentInputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  amountInputFocused: {
    borderColor: '#0066CC',
    borderWidth: 2,
  },
  amountInputError: {
    borderColor: '#ff3b30',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#ff3b30',
    marginTop: 4,
  },
  quickSelectRow: {
    marginTop: 12,
  },
  quickSelectLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  quickSelectButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickSelectButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  quickSelectText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  cardActions: {
    marginTop: 8,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secondaryActionText: {
    fontSize: 12,
    color: '#666',
  },
  historyContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyCampaign: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  historyInfluencer: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 10,
    color: '#999',
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  historyConverted: {
    fontSize: 10,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  footer: {
    height: 20,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  profileModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  profileModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  profileModalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  profileModalBody: {
    alignItems: 'center',
    padding: 24,
  },
  profileAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  profileType: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
  },
  profileActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  profileChatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  profileChatText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  profileViewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  profileViewText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0066CC',
  },
});

export default QuickPayScreen;