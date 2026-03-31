import React, { useState, useEffect } from 'react';
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
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import subscriptionAPI, {
  Plan,
  SubscriptionStatus,
  getPlanDisplayName,
  getPlanLevel,
  getPlanFeatures,
  getPlanHighlights,
  getDaysRemaining,
  getPeriodProgress,
  formatDate,
} from '../../services/subscriptionAPI';

import { CardField, useStripe, useConfirmPayment, StripeProvider } from '@stripe/stripe-react-native';
import { Feather, Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Icon mapping
const getIcon = (iconName: string, size: number = 20, color: string = '#666') => {
  switch (iconName) {
    case 'timer': return <Feather name="clock" size={size} color={color} />;
    case 'rocket': return <Feather name="rocket" size={size} color={color} />;
    case 'group': return <Feather name="users" size={size} color={color} />;
    case 'analytics': return <Feather name="bar-chart-2" size={size} color={color} />;
    case 'support-agent': return <Feather name="headphones" size={size} color={color} />;
    case 'verified-user': return <Feather name="check-circle" size={size} color={color} />;
    case 'campaign': return <MaterialIcons name="campaign" size={size} color={color} />;
    case 'photo-library': return <MaterialIcons name="photo-library" size={size} color={color} />;
    case 'chat': return <Feather name="message-circle" size={size} color={color} />;
    case 'trending-up': return <Feather name="trending-up" size={size} color={color} />;
    case 'api': return <Feather name="code" size={size} color={color} />;
    case 'workspace-premium': return <MaterialIcons name="workspace-premium" size={size} color={color} />;
    case 'diamond': return <FontAwesome5 name="gem" size={size} color={color} />;
    case 'crown': return <FontAwesome5 name="crown" size={size} color="#F59E0B" />;
    case 'star': return <Feather name="star" size={size} color={color} />;
    default: return <Feather name="check" size={size} color={color} />;
  }
};

// Plan Card Component - Platform-specific styling
const PlanCard = ({
  plan,
  isCurrentPlan,
  onUpgrade,
  onViewDetails,
  userRole,
}: {
  plan: Plan;
  isCurrentPlan: boolean;
  onUpgrade: (plan: Plan) => void;
  onViewDetails: (plan: Plan) => void;
  userRole: 'brand' | 'influencer';
}) => {
  const planLevel = getPlanLevel(plan.key);
  const highlights = getPlanHighlights(plan.key, userRole);
  const planTitle = getPlanDisplayName(plan.key, userRole);
  const isFreePlan = plan.is_free;

  // Get gradient colors based on plan level
  const getGradientColors = () => {
    switch (planLevel) {
      case 'starter':
        return ['#007AFF', '#0056B3'] as const;
      case 'pro':
        return ['#9C27B0', '#7B1FA2'] as const;
      case 'enterprise':
        return ['#F59E0B', '#D97706'] as const;
      default:
        return ['#4CAF50', '#2E7D32'] as const;
    }
  };

  // Get icon based on plan level
  const getPlanIcon = () => {
    switch (planLevel) {
      case 'starter':
        return getIcon('rocket', 24, '#fff');
      case 'pro':
        return getIcon('diamond', 24, '#fff');
      case 'enterprise':
        return getIcon('crown', 24, '#fff');
      default:
        return getIcon('star', 24, '#fff');
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.planCard,
        plan.featured && styles.featuredCard,
        isCurrentPlan && styles.currentPlanCard,
        Platform.OS === 'web' && styles.planCardWeb,
      ]}
      activeOpacity={0.9}
      onPress={() => onViewDetails(plan)}
    >
      {/* Plan Header */}
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.planHeader}
      >
        <View style={styles.planHeaderContent}>
          {getPlanIcon()}
          <Text style={styles.planTitle}>{planTitle}</Text>
        </View>
        <Text style={styles.planBilling}>
          {plan.billing_cycle === 'trial' ? '15-day free trial' :
           plan.is_free ? 'Free forever' : `${plan.billing_cycle} billing`}
        </Text>
        
        {plan.billing_cycle === 'yearly' && !plan.is_free && (
          <View style={styles.saveBadge}>
            <Text style={styles.saveBadgeText}>Save 17%</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.planBody}>
        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>
            {plan.is_free ? 'Free' : 'Paid'}
          </Text>
        </View>

        {/* Highlights */}
        <View style={styles.highlightsContainer}>
          {highlights.slice(0, 3).map((highlight, index) => (
            <View key={index} style={styles.highlightItem}>
              <Feather name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.highlightText} numberOfLines={1}>
                {highlight}
              </Text>
            </View>
          ))}
          {highlights.length > 3 && (
            <Text style={styles.moreText}>+{highlights.length - 3} more features</Text>
          )}
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.planFooter}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            isCurrentPlan ? styles.currentPlanButton : styles.upgradeButton,
          ]}
          onPress={() => isCurrentPlan ? null : onUpgrade(plan)}
          disabled={isCurrentPlan}
        >
          <Text style={[
            styles.actionButtonText,
            isCurrentPlan && styles.currentPlanButtonText,
          ]}>
            {isCurrentPlan ? 'Current Plan' : 'Upgrade Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// Countdown Timer Component
const CountdownTimer = ({ subscription }: { subscription: SubscriptionStatus | null }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!subscription?.current_period_end) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const endDate = new Date(subscription.current_period_end).getTime();
      const now = new Date().getTime();
      const difference = endDate - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [subscription]);

  const progress = getPeriodProgress(
    subscription?.current_period_start,
    subscription?.current_period_end
  );

  const isTrial = subscription?.type === 'trial';

  if (!subscription) return null;

  return (
    <View style={[styles.countdownCard, Platform.OS === 'web' && styles.countdownCardWeb]}>
      <View style={styles.countdownHeader}>
        <Feather name="clock" size={32} color="#007AFF" />
        <Text style={styles.countdownTitle}>
          {isTrial ? 'Trial Period Countdown' : 'Subscription Countdown'}
        </Text>
        <Text style={styles.countdownSubtitle}>
          {isTrial ? 'Your free trial ends in' : 'Your current billing period ends in'}
        </Text>
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <View style={styles.timeUnit}>
          <Text style={styles.timeNumber}>{timeLeft.days}</Text>
          <Text style={styles.timeLabel}>Days</Text>
        </View>
        <View style={styles.timeUnit}>
          <Text style={styles.timeNumber}>{timeLeft.hours}</Text>
          <Text style={styles.timeLabel}>Hours</Text>
        </View>
        <View style={styles.timeUnit}>
          <Text style={styles.timeNumber}>{timeLeft.minutes}</Text>
          <Text style={styles.timeLabel}>Minutes</Text>
        </View>
        <View style={styles.timeUnit}>
          <Text style={styles.timeNumber}>{timeLeft.seconds}</Text>
          <Text style={styles.timeLabel}>Seconds</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Period Progress</Text>
          <Text style={styles.progressValue}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Dates */}
      <View style={styles.datesContainer}>
        <View style={styles.dateItem}>
          <Feather name="calendar" size={16} color="#666" />
          <Text style={styles.dateLabel}>Start:</Text>
          <Text style={styles.dateValue}>
            {formatDate(subscription.current_period_start)}
          </Text>
        </View>
        <View style={styles.dateItem}>
          <Feather name="clock" size={16} color="#666" />
          <Text style={styles.dateLabel}>End:</Text>
          <Text style={styles.dateValue}>
            {formatDate(subscription.current_period_end)}
          </Text>
        </View>
      </View>

      {/* Status */}
      <View style={[
        styles.statusBadge,
        subscription.is_active ? styles.activeStatus : styles.inactiveStatus,
      ]}>
        <Text style={styles.statusText}>
          Status: {subscription.status?.toUpperCase()} • Plan: {subscription.plan?.toUpperCase()}
        </Text>
      </View>

      {isTrial && (
        <View style={styles.trialWarning}>
          <Feather name="alert-triangle" size={20} color="#F59E0B" />
          <Text style={styles.trialWarningText}>
            Your trial period will end soon. Upgrade to continue accessing all features.
          </Text>
        </View>
      )}
    </View>
  );
};

// Payment Modal Component - Web-friendly version
const PaymentModal = ({
  visible,
  onClose,
  plan,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  plan: Plan | null;
  onSuccess: (data: any) => void;
}) => {
  const { confirmPayment } = useConfirmPayment();
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayPress = async () => {
    if (!cardDetails?.complete) {
      setError('Please enter complete card details');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create subscription
      const response = await subscriptionAPI.createSubscription(
        plan?.key || '',
        cardDetails?.id // This will be handled by Stripe
      );

      if (response.client_secret) {
        // Confirm payment
        const { error: paymentError } = await confirmPayment(response.client_secret, {
          type: 'Card',
          billingDetails: {},
        });

        if (paymentError) {
          setError(paymentError.message);
          setLoading(false);
          return;
        }
      }

      onSuccess(response);
      onClose();
    } catch (err: any) {
      setError(err.detail || err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  // For web, we might want to use a different modal approach
  if (Platform.OS === 'web') {
    if (!visible) return null;
    return (
      <View style={[styles.modalOverlay, styles.modalOverlayWeb]}>
        <View style={[styles.modalContent, styles.modalContentWeb]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Upgrade to {plan?.plan}</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalBody}>
              <Text style={styles.paymentLabel}>Card Details</Text>
              
              <CardField
                postalCodeEnabled={false}
                placeholders={{
                  number: '4242 4242 4242 4242',
                }}
                cardStyle={styles.cardField}
                style={[styles.cardFieldContainer, Platform.OS === 'web' && styles.cardFieldContainerWeb]}
                onCardChange={setCardDetails}
              />

              {error ? (
                <View style={styles.errorContainer}>
                  <Feather name="alert-circle" size={16} color="#ff3b30" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.payButton]}
                  onPress={handlePayPress}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.payButtonText}>
                      Subscribe to {plan?.plan}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  // Mobile modal (bottom sheet)
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
            <Text style={styles.modalTitle}>Upgrade to {plan?.plan}</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalBody}>
              <Text style={styles.paymentLabel}>Card Details</Text>
              
              <CardField
                postalCodeEnabled={false}
                placeholders={{
                  number: '4242 4242 4242 4242',
                }}
                cardStyle={styles.cardField}
                style={styles.cardFieldContainer}
                onCardChange={setCardDetails}
              />

              {error ? (
                <View style={styles.errorContainer}>
                  <Feather name="alert-circle" size={16} color="#ff3b30" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.payButton]}
                  onPress={handlePayPress}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.payButtonText}>
                      Subscribe to {plan?.plan}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Plan Details Modal - Web-friendly version
const PlanDetailsModal = ({
  visible,
  onClose,
  plan,
  isCurrentPlan,
  onUpgrade,
  userRole,
}: {
  visible: boolean;
  onClose: () => void;
  plan: Plan | null;
  isCurrentPlan: boolean;
  onUpgrade: (plan: Plan) => void;
  userRole: 'brand' | 'influencer';
}) => {
  if (!plan) return null;

  const planLevel = getPlanLevel(plan.key);
  const features = getPlanFeatures(plan.key, userRole);
  const highlights = getPlanHighlights(plan.key, userRole);
  const planTitle = getPlanDisplayName(plan.key, userRole);
  const isFreePlan = plan.is_free;

  // Get gradient colors
  const getGradientColors = () => {
    switch (planLevel) {
      case 'starter':
        return ['#007AFF', '#0056B3'] as const;
      case 'pro':
        return ['#9C27B0', '#7B1FA2'] as const;
      case 'enterprise':
        return ['#F59E0B', '#D97706'] as const;
      default:
        return ['#4CAF50', '#2E7D32'] as const;
    }
  };

  // For web, use a different modal approach
  if (Platform.OS === 'web') {
    if (!visible) return null;
    return (
      <View style={[styles.modalOverlay, styles.modalOverlayWeb]}>
        <View style={[styles.modalContent, styles.detailsModal, styles.modalContentWeb]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Plan Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Plan Header */}
            <LinearGradient
              colors={getGradientColors()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.detailsHeader}
            >
              <Text style={styles.detailsPlanName}>{planTitle}</Text>
              <Text style={styles.detailsPlanBilling}>
                {plan.billing_cycle === 'trial' ? '15-day free trial' :
                 plan.is_free ? 'Free forever' : `${plan.billing_cycle} billing`}
              </Text>
            </LinearGradient>

            <View style={styles.detailsBody}>
              {/* Highlights */}
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Key Highlights</Text>
                {highlights.map((highlight, index) => (
                  <View key={index} style={styles.detailsHighlightItem}>
                    <Feather name="check-circle" size={18} color="#007AFF" />
                    <Text style={styles.detailsHighlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.divider} />

              {/* All Features */}
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>All Features</Text>
                {features.map((feature, index) => (
                  <View key={index} style={styles.detailsFeatureItem}>
                    {getIcon(feature.icon, 18, '#007AFF')}
                    <Text style={styles.detailsFeatureText}>{feature.text}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.detailsActions}>
              <TouchableOpacity
                style={[styles.detailsButton, styles.closeDetailsButton]}
                onPress={onClose}
              >
                <Text style={styles.closeDetailsButtonText}>Close</Text>
              </TouchableOpacity>
              {!isCurrentPlan && !isFreePlan && (
                <TouchableOpacity
                  style={[styles.detailsButton, styles.upgradeDetailsButton]}
                  onPress={() => {
                    onClose();
                    onUpgrade(plan);
                  }}
                >
                  <Text style={styles.upgradeDetailsButtonText}>Upgrade Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  // Mobile modal
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, styles.detailsModal]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Plan Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Plan Header */}
            <LinearGradient
              colors={getGradientColors()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.detailsHeader}
            >
              <Text style={styles.detailsPlanName}>{planTitle}</Text>
              <Text style={styles.detailsPlanBilling}>
                {plan.billing_cycle === 'trial' ? '15-day free trial' :
                 plan.is_free ? 'Free forever' : `${plan.billing_cycle} billing`}
              </Text>
            </LinearGradient>

            <View style={styles.detailsBody}>
              {/* Highlights */}
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Key Highlights</Text>
                {highlights.map((highlight, index) => (
                  <View key={index} style={styles.detailsHighlightItem}>
                    <Feather name="check-circle" size={18} color="#007AFF" />
                    <Text style={styles.detailsHighlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.divider} />

              {/* All Features */}
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>All Features</Text>
                {features.map((feature, index) => (
                  <View key={index} style={styles.detailsFeatureItem}>
                    {getIcon(feature.icon, 18, '#007AFF')}
                    <Text style={styles.detailsFeatureText}>{feature.text}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.detailsActions}>
              <TouchableOpacity
                style={[styles.detailsButton, styles.closeDetailsButton]}
                onPress={onClose}
              >
                <Text style={styles.closeDetailsButtonText}>Close</Text>
              </TouchableOpacity>
              {!isCurrentPlan && !isFreePlan && (
                <TouchableOpacity
                  style={[styles.detailsButton, styles.upgradeDetailsButton]}
                  onPress={() => {
                    onClose();
                    onUpgrade(plan);
                  }}
                >
                  <Text style={styles.upgradeDetailsButtonText}>Upgrade Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Main Subscription Screen
const SubscriptionScreen = () => {
  const router = useRouter();
  const { user, token } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'plans' | 'countdown'>('plans');
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentModal, setPaymentModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);
  
  const userRole = (user?.role as 'brand' | 'influencer') || 'brand';

  // Fetch subscription data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [subData, plansData] = await Promise.all([
        subscriptionAPI.getSubscriptionStatus(),
        subscriptionAPI.getAllPlans(),
      ]);

      setSubscription(subData);

      // Filter plans by billing cycle
      const filteredPlans = plansData.plans.filter(
        plan => plan.billing_cycle === billingCycle || 
                plan.is_free || 
                plan.billing_cycle === 'trial'
      );

      // Mark featured plan (usually Pro)
      const enhancedPlans = filteredPlans.map(plan => ({
        ...plan,
        featured: plan.key.includes('pro_'),
      }));

      setPlans(enhancedPlans);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      Alert.alert('Error', 'Failed to load subscription data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, billingCycle]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleUpgrade = (plan: Plan) => {
    if (plan.is_free) {
      Alert.alert('Info', 'You are already on the free plan');
      return;
    }
    setSelectedPlan(plan);
    setPaymentModal(true);
  };

  const handleViewDetails = (plan: Plan) => {
    setSelectedPlan(plan);
    setDetailsModal(true);
  };

  const handleUpgradeSuccess = (data: any) => {
    Alert.alert(
      'Success',
      data.message || 'Subscription upgraded successfully!',
      [{ text: 'OK' }]
    );
    fetchData();
  };

  const isCurrentPlan = (planKey: string) => {
    return subscription?.plan === planKey;
  };

  // Web-specific layout
  if (Platform.OS === 'web') {
    return (
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <View style={[styles.container, styles.containerWeb]}>
          <StatusBar barStyle="dark-content" />

          

          {/* Role Badge */}
          <View style={styles.roleBadgeContainer}>
            <View style={[
              styles.roleBadge,
              userRole === 'influencer' ? styles.influencerBadge : styles.brandBadge,
            ]}>
              <Text style={styles.roleBadgeText}>
                {userRole === 'influencer' ? 'INFLUENCER' : 'BRAND'}
              </Text>
            </View>
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            {userRole === 'influencer'
              ? 'Choose the perfect plan for your influencer journey'
              : 'Select the right plan for your brand needs'}
          </Text>

          {/* Tabs */}
          <View style={[styles.tabContainer, styles.tabContainerWeb]}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'plans' && styles.activeTab]}
              onPress={() => setActiveTab('plans')}
            >
              <Feather
                name="credit-card"
                size={18}
                color={activeTab === 'plans' ? '#007AFF' : '#999'}
              />
              <Text style={[styles.tabText, activeTab === 'plans' && styles.activeTabText]}>
                Plans & Pricing
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'countdown' && styles.activeTab]}
              onPress={() => setActiveTab('countdown')}
            >
              <Feather
                name="clock"
                size={18}
                color={activeTab === 'countdown' ? '#007AFF' : '#999'}
              />
              <Text style={[styles.tabText, activeTab === 'countdown' && styles.activeTabText]}>
                Countdown Timer
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.scrollContentWeb}
          >
            {activeTab === 'plans' ? (
              <>
                {/* Billing Toggle */}
                <View style={styles.billingToggleContainer}>
                  <View style={styles.billingToggle}>
                    <TouchableOpacity
                      style={[styles.billingOption, billingCycle === 'monthly' && styles.billingOptionActive]}
                      onPress={() => setBillingCycle('monthly')}
                    >
                      <Text style={[
                        styles.billingOptionText,
                        billingCycle === 'monthly' && styles.billingOptionTextActive,
                      ]}>
                        Monthly
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.billingOption, billingCycle === 'yearly' && styles.billingOptionActive]}
                      onPress={() => setBillingCycle('yearly')}
                    >
                      <Text style={[
                        styles.billingOptionText,
                        billingCycle === 'yearly' && styles.billingOptionTextActive,
                      ]}>
                        Yearly
                      </Text>
                      <View style={styles.saveChip}>
                        <Text style={styles.saveChipText}>Save 17%</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Plans List - Web grid layout */}
                <View style={styles.plansContainerWeb}>
                  {plans.map((plan) => (
                    <PlanCard
                      key={plan.key}
                      plan={plan}
                      isCurrentPlan={isCurrentPlan(plan.key)}
                      onUpgrade={handleUpgrade}
                      onViewDetails={handleViewDetails}
                      userRole={userRole}
                    />
                  ))}
                </View>

                {/* Current Plan Info */}
                {subscription && (
                  <View style={styles.currentPlanCard}>
                    <Text style={styles.currentPlanTitle}>Current Plan</Text>
                    <Text style={styles.currentPlanName}>
                      {getPlanDisplayName(subscription.plan, userRole)}
                    </Text>
                    <Text style={styles.currentPlanStatus}>
                      {subscription.type === 'trial' ? 'Free Trial - ' : ''}
                      Status: {subscription.status}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <CountdownTimer subscription={subscription} />
            )}

            <View style={styles.footer} />
          </ScrollView>

          {/* Payment Modal */}
          <PaymentModal
            visible={paymentModal}
            onClose={() => setPaymentModal(false)}
            plan={selectedPlan}
            onSuccess={handleUpgradeSuccess}
          />

          {/* Plan Details Modal */}
          <PlanDetailsModal
            visible={detailsModal}
            onClose={() => setDetailsModal(false)}
            plan={selectedPlan}
            isCurrentPlan={isCurrentPlan(selectedPlan?.key || '')}
            onUpgrade={handleUpgrade}
            userRole={userRole}
          />
        </View>
      </StripeProvider>
    );
  }

  // Mobile layout (original)
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription Plans</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Role Badge */}
        <View style={styles.roleBadgeContainer}>
          <View style={[
            styles.roleBadge,
            userRole === 'influencer' ? styles.influencerBadge : styles.brandBadge,
          ]}>
            <Text style={styles.roleBadgeText}>
              {userRole === 'influencer' ? 'INFLUENCER' : 'BRAND'}
            </Text>
          </View>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {userRole === 'influencer'
            ? 'Choose the perfect plan for your influencer journey'
            : 'Select the right plan for your brand needs'}
        </Text>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'plans' && styles.activeTab]}
            onPress={() => setActiveTab('plans')}
          >
            <Feather
              name="credit-card"
              size={18}
              color={activeTab === 'plans' ? '#007AFF' : '#999'}
            />
            <Text style={[styles.tabText, activeTab === 'plans' && styles.activeTabText]}>
              Plans & Pricing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'countdown' && styles.activeTab]}
            onPress={() => setActiveTab('countdown')}
          >
            <Feather
              name="clock"
              size={18}
              color={activeTab === 'countdown' ? '#007AFF' : '#999'}
            />
            <Text style={[styles.tabText, activeTab === 'countdown' && styles.activeTabText]}>
              Countdown Timer
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {activeTab === 'plans' ? (
            <>
              {/* Billing Toggle */}
              <View style={styles.billingToggleContainer}>
                <View style={styles.billingToggle}>
                  <TouchableOpacity
                    style={[styles.billingOption, billingCycle === 'monthly' && styles.billingOptionActive]}
                    onPress={() => setBillingCycle('monthly')}
                  >
                    <Text style={[
                      styles.billingOptionText,
                      billingCycle === 'monthly' && styles.billingOptionTextActive,
                    ]}>
                      Monthly
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.billingOption, billingCycle === 'yearly' && styles.billingOptionActive]}
                    onPress={() => setBillingCycle('yearly')}
                  >
                    <Text style={[
                      styles.billingOptionText,
                      billingCycle === 'yearly' && styles.billingOptionTextActive,
                    ]}>
                      Yearly
                    </Text>
                    <View style={styles.saveChip}>
                      <Text style={styles.saveChipText}>Save 17%</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Plans List */}
              <View style={styles.plansContainer}>
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.key}
                    plan={plan}
                    isCurrentPlan={isCurrentPlan(plan.key)}
                    onUpgrade={handleUpgrade}
                    onViewDetails={handleViewDetails}
                    userRole={userRole}
                  />
                ))}
              </View>

              {/* Current Plan Info */}
              {subscription && (
                <View style={styles.currentPlanCard}>
                  <Text style={styles.currentPlanTitle}>Current Plan</Text>
                  <Text style={styles.currentPlanName}>
                    {getPlanDisplayName(subscription.plan, userRole)}
                  </Text>
                  <Text style={styles.currentPlanStatus}>
                    {subscription.type === 'trial' ? 'Free Trial - ' : ''}
                    Status: {subscription.status}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <CountdownTimer subscription={subscription} />
          )}

          <View style={styles.footer} />
        </ScrollView>

        {/* Payment Modal */}
        <PaymentModal
          visible={paymentModal}
          onClose={() => setPaymentModal(false)}
          plan={selectedPlan}
          onSuccess={handleUpgradeSuccess}
        />

        {/* Plan Details Modal */}
        <PlanDetailsModal
          visible={detailsModal}
          onClose={() => setDetailsModal(false)}
          plan={selectedPlan}
          isCurrentPlan={isCurrentPlan(selectedPlan?.key || '')}
          onUpgrade={handleUpgrade}
          userRole={userRole}
        />
      </SafeAreaView>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerWeb: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
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
  headerWeb: {
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  roleBadgeContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
  },
  brandBadge: {
    backgroundColor: '#E3F2FD',
  },
  influencerBadge: {
    backgroundColor: '#F3E5F5',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabContainerWeb: {
    marginHorizontal: 24,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
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
  billingToggleContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 4,
  },
  billingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 8,
  },
  billingOptionActive: {
    backgroundColor: '#007AFF',
  },
  billingOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  billingOptionTextActive: {
    color: '#fff',
  },
  saveChip: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  saveChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  plansContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  plansContainerWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 24,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: Platform.OS === 'web' ? 300 : '100%',
    maxWidth: Platform.OS === 'web' ? 300 : '100%',
  },
  planCardWeb: {
    marginBottom: 0,
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  currentPlanCard: {
    opacity: 0.9,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  planHeader: {
    padding: 16,
    alignItems: 'center',
  },
  planHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  planBilling: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  saveBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  planBody: {
    padding: 16,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  priceText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  highlightsContainer: {
    gap: 8,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  moreText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  planFooter: {
    padding: 16,
    paddingTop: 0,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
  },
  currentPlanButton: {
    backgroundColor: '#e0e0e0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  currentPlanButtonText: {
    color: '#666',
  },
  currentPlanCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentPlanTitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  currentPlanName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  currentPlanStatus: {
    fontSize: 12,
    color: '#666',
  },
  countdownCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  countdownCardWeb: {
    maxWidth: 600,
    marginHorizontal: 'auto',
  },
  countdownHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  countdownTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  countdownSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  timeUnit: {
    alignItems: 'center',
  },
  timeNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
  },
  timeLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  datesContainer: {
    gap: 8,
    marginBottom: 20,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: '#999',
  },
  dateValue: {
    flex: 1,
    fontSize: 12,
    color: '#333',
  },
  statusBadge: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  activeStatus: {
    backgroundColor: '#E8F5E9',
  },
  inactiveStatus: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  trialWarning: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  trialWarningText: {
    flex: 1,
    fontSize: 12,
    color: '#F59E0B',
  },
  footer: {
    height: 20,
  },
  scrollContentWeb: {
    paddingBottom: 40,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayWeb: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 400,
  },
  modalContentWeb: {
    borderRadius: 12,
    maxWidth: 500,
    width: '90%',
    maxHeight: '90%',
  },
  detailsModal: {
    minHeight: 500,
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
  paymentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  cardField: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  cardFieldContainer: {
    height: 50,
    marginBottom: 20,
  },
  cardFieldContainerWeb: {
    height: 40,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#ff3b30',
  },
  modalActions: {
    flexDirection: 'row',
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
  payButton: {
    backgroundColor: '#007AFF',
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  detailsHeader: {
    padding: 24,
    alignItems: 'center',
  },
  detailsPlanName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  detailsPlanBilling: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  detailsBody: {
    padding: 20,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailsHighlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailsHighlightText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 16,
  },
  detailsFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailsFeatureText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  detailsActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailsButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeDetailsButton: {
    backgroundColor: '#f5f5f5',
  },
  closeDetailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  upgradeDetailsButton: {
    backgroundColor: '#007AFF',
  },
  upgradeDetailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default SubscriptionScreen;