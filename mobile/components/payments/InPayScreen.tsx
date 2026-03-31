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
  Image,
  FlatList,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import paymentAPI, {
  Application,
  Payment,
  MediaFile,
  formatCurrency,
  formatDate,
  getPaymentStatusConfig,
  getApplicationStatusConfig,
  getMediaTypeIcon,
} from '../../services/paymentAPI';
import { campaignAPI } from '../../services/campaignAPI';
import profileAPI from '../../services/profileAPI';
import { Feather, Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import * as Clipboard from 'expo-clipboard';

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
    ? paymentAPI.getPaymentStatusConfig(status)
    : paymentAPI.getApplicationStatusConfig(status);
  
  return (
    <View style={[styles.statusBadge, { backgroundColor: config.backgroundColor }]}>
      <Feather name={config.icon as any} size={12} color={config.color} />
      <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const PaymentCard = ({ application, onPay, onViewMedia, onViewProfile, onChat, isUpdated }: {
  application: Application;
  onPay: () => void;
  onViewMedia: () => void;
  onViewProfile: () => void;
  onChat: () => void;
  isUpdated: boolean;
}) => {
  const { currency, rates, convertAmount } = useCurrency();
  const amount = application.budget || application.campaign_budget || 0;
  const appCurrency = application.currency || application.campaign_currency || 'USD';
  const mediaCount = application.submitted_media?.length || 0;
  
  const convertedAmount = convertAmount(amount, appCurrency, currency);
  
  return (
    <View style={[styles.paymentCard, isUpdated && styles.updatedCard]}>
      {/* Campaign Image */}
      <CampaignImage 
        fileId={application.campaign_image_id}
        title={application.title || application.campaign_title}
        category={application.category}
      />
      
      <View style={styles.cardContent}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <UserInfo
            userId={application.influencer_id}
            userName={application.influencer_name}
            onViewProfile={onViewProfile}
            onChat={onChat}
          />
          <StatusBadge status={application.status} type="application" />
        </View>
        
        {/* Campaign Details */}
        <Text style={styles.campaignTitle} numberOfLines={1}>
          {application.title || application.campaign_title}
        </Text>
        
        {application.message && (
          <Text style={styles.influencerMessage} numberOfLines={2}>
            "{application.message}"
          </Text>
        )}
        
        {/* Budget and Media Info */}
        <View style={styles.budgetRow}>
          <View>
            <Text style={styles.budgetLabel}>Payment Amount</Text>
            <Text style={styles.budgetAmount}>
              {formatCurrency(amount, appCurrency)}
            </Text>
            {appCurrency !== currency && rates && (
              <Text style={styles.convertedAmount}>
                ≈ {formatCurrency(convertedAmount, currency)}
              </Text>
            )}
          </View>
          
          {mediaCount > 0 && (
            <TouchableOpacity style={styles.mediaCount} onPress={onViewMedia}>
              <Feather name="image" size={16} color="#666" />
              <Text style={styles.mediaCountText}>{mediaCount} files</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionButton, styles.payButton]} onPress={onPay}>
          <Feather name="credit-card" size={18} color="#fff" />
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={onViewMedia}>
          <Feather name="image" size={18} color="#666" />
          <Text style={styles.secondaryButtonText}>Media</Text>
        </TouchableOpacity>
      </View>
      
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
  );
};

const CampaignImage = ({ fileId, title, category }: { fileId?: string; title?: string; category?: string }) => {
  const [imageError, setImageError] = useState(false);
  
  const getImageUrl = () => {
    if (!fileId) return null;
    if (fileId.startsWith('http')) return fileId;
    return `${process.env.EXPO_PUBLIC_API_URL}/api/campaigns/image/${fileId}`;
  };
  
  const imageUrl = getImageUrl();
  
  if (imageError || !imageUrl) {
    return (
      <LinearGradient
        colors={['#667eea', '#49a0ed']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.imagePlaceholder}
      >
        <Feather name="campaign" size={40} color="#fff" />
        <Text style={styles.imagePlaceholderTitle}>{title || 'Campaign'}</Text>
        <Text style={styles.imagePlaceholderSubtitle}>{category || 'Marketing Campaign'}</Text>
      </LinearGradient>
    );
  }
  
  return (
    <Image
      source={{ uri: imageUrl }}
      style={styles.campaignImage}
      onError={() => setImageError(true)}
    />
  );
};

const UserInfo = ({ userId, userName, onViewProfile, onChat }: {
  userId?: string;
  userName?: string;
  onViewProfile: () => void;
  onChat: () => void;
}) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      try {
        const data = await profileAPI.getProfileById(userId);
        setProfileData(data.profile || data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);
  
  const displayName = profileData?.username || profileData?.full_name || profileData?.company_name || userName || 'User';
  const initial = displayName.charAt(0).toUpperCase();
  
  return (
    <View style={styles.userInfo}>
      <TouchableOpacity onPress={onViewProfile}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{initial}</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.userDetails}>
        <TouchableOpacity onPress={onViewProfile}>
          <Text style={styles.userName}>{displayName}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onChat}>
          <Text style={styles.chatLink}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const MediaFilesModal = ({ visible, onClose, mediaFiles, application }: {
  visible: boolean;
  onClose: () => void;
  mediaFiles: MediaFile[];
  application: Application | null;
}) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  
  const handleDownload = async (media: MediaFile) => {
    try {
      await paymentAPI.downloadMediaFile(media.file_id, media.filename);
    } catch (error) {
      Alert.alert('Error', 'Failed to download file');
    }
  };
  
  const renderMediaItem = ({ item }: { item: MediaFile }) => (
    <TouchableOpacity 
      style={styles.mediaItem}
      onPress={() => setSelectedMedia(item)}
    >
      <View style={styles.mediaIcon}>
        <Feather name={getMediaTypeIcon(item.media_type) as any} size={24} color="#007AFF" />
      </View>
      <View style={styles.mediaInfo}>
        <Text style={styles.mediaName} numberOfLines={1}>{item.filename}</Text>
        <Text style={styles.mediaType}>{item.media_type.toUpperCase()}</Text>
        {item.size && (
          <Text style={styles.mediaSize}>
            {(item.size / 1024 / 1024).toFixed(2)} MB
          </Text>
        )}
        {item.description && (
          <Text style={styles.mediaDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.downloadButton} onPress={() => handleDownload(item)}>
        <Feather name="download" size={20} color="#007AFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
  
  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#FF9800', '#F57C00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <Feather name="image" size={24} color="#fff" />
                <View>
                  <Text style={styles.modalTitle}>Submitted Media Files</Text>
                  <Text style={styles.modalSubtitle}>
                    {application?.influencer_name || 'Influencer'} • {mediaFiles.length} files
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            
            <FlatList
              data={mediaFiles}
              renderItem={renderMediaItem}
              keyExtractor={(item, index) => item.file_id || index.toString()}
              contentContainerStyle={styles.mediaList}
              ListEmptyComponent={
                <View style={styles.emptyMedia}>
                  <Feather name="image" size={48} color="#ccc" />
                  <Text style={styles.emptyMediaText}>No media files found</Text>
                  <Text style={styles.emptyMediaSubtext}>
                    Media files submitted by the influencer will appear here
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
      
      {/* Media Viewer Modal */}
      <Modal
        visible={!!selectedMedia}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedMedia(null)}
      >
        <View style={styles.mediaViewerOverlay}>
          <View style={styles.mediaViewerContent}>
            <View style={styles.mediaViewerHeader}>
              <Text style={styles.mediaViewerTitle} numberOfLines={1}>
                {selectedMedia?.filename}
              </Text>
              <TouchableOpacity onPress={() => setSelectedMedia(null)}>
                <Feather name="x" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.mediaViewerBody}>
              {selectedMedia?.media_type === 'image' ? (
                <Image
                  source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/api/media/${selectedMedia.file_id}/view` }}
                  style={styles.mediaViewerImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.mediaViewerPlaceholder}>
                  <Feather name={getMediaTypeIcon(selectedMedia?.media_type || 'file') as any} size={64} color="#fff" />
                  <Text style={styles.mediaViewerPlaceholderText}>
                    Preview not available
                  </Text>
                  <TouchableOpacity 
                    style={styles.downloadMediaButton}
                    onPress={() => selectedMedia && handleDownload(selectedMedia)}
                  >
                    <Feather name="download" size={20} color="#fff" />
                    <Text style={styles.downloadMediaText}>Download File</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const PaymentHistoryItem = ({ payment, onPress }: { payment: Payment; onPress?: () => void }) => {
  const { currency, convertAmount } = useCurrency();
  const config = getPaymentStatusConfig(payment.status);
  const convertedAmount = convertAmount(payment.amount, payment.currency, currency);
  
  return (
    <TouchableOpacity style={styles.historyItem} onPress={onPress}>
      <View style={styles.historyLeft}>
        <View style={[styles.historyIcon, { backgroundColor: config.backgroundColor }]}>
          <Feather name={config.icon as any} size={20} color={config.color} />
        </View>
        <View>
          <Text style={styles.historyCampaign} numberOfLines={1}>
            {payment.campaign_title}
          </Text>
          <Text style={styles.historyInfluencer}>
            {payment.influencer_name || 'Influencer'}
          </Text>
          <Text style={styles.historyDate}>
            {formatDate(payment.created_at, 'short')}
          </Text>
        </View>
      </View>
      
      <View style={styles.historyRight}>
        <Text style={styles.historyAmount}>
          {formatCurrency(payment.amount, payment.currency)}
        </Text>
        {payment.currency !== currency && (
          <Text style={styles.historyConverted}>
            ≈ {formatCurrency(convertedAmount, currency)}
          </Text>
        )}
        <StatusBadge status={payment.status} type="payment" />
      </View>
    </TouchableOpacity>
  );
};

const PaymentDialog = ({
  visible,
  onClose,
  application,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  application: Application | null;
  onSuccess: () => void;
}) => {
  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  
  const steps = ['Select Payment', 'Confirm Details', 'Processing', 'Complete'];
  
  const amount = application?.budget || application?.campaign_budget || 0;
  const currencyCode = application?.currency || application?.campaign_currency || 'USD';
  
  const handleCreateOrder = async () => {
    if (!application) return;
    
    setProcessing(true);
    setError('');
    
    try {
      const orderData = {
        amount: amount,
        currency: currencyCode,
        campaign_id: application.campaign_id,
        influencer_id: application.influencer_id,
      };
      
      const response = await paymentAPI.createRazorpayOrder(orderData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to create payment order');
      }
      
      setPaymentDetails(response);
      setStep(1);
      
    } catch (err: any) {
      setError(err.detail || err.message || 'Failed to initialize payment');
    } finally {
      setProcessing(false);
    }
  };
  
  const handleRazorpayPayment = () => {
    if (!paymentDetails?.order_id) {
      setError('Invalid payment details');
      return;
    }
    
    // For mobile, we need to use Razorpay's mobile SDK
    // This is a simplified version using WebView for demo
    const razorpayKey = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;
    
    if (!razorpayKey) {
      setError('Payment gateway not configured');
      return;
    }
    
    const amountInPaise = Math.round(paymentDetails.amount * 100);
    
    // Create HTML for Razorpay checkout
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body>
        <script>
          var options = {
            key: "${razorpayKey}",
            amount: ${amountInPaise},
            currency: "${paymentDetails.currency}",
            name: "Brio",
            description: "Payment for campaign: ${application?.title || application?.campaign_title}",
            order_id: "${paymentDetails.order_id}",
            handler: function(response) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'success',
                data: response
              }));
            },
            modal: {
              ondismiss: function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'dismiss'
                }));
              }
            }
          };
          var rzp = new Razorpay(options);
          rzp.open();
        </script>
      </body>
      </html>
    `;
    
    setPaymentUrl(`data:text/html,${encodeURIComponent(html)}`);
    setWebViewVisible(true);
  };
  
  const handleWebViewMessage = async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'success') {
        setWebViewVisible(false);
        setStep(2);
        
        const verifyData = {
          razorpay_payment_id: message.data.razorpay_payment_id,
          razorpay_order_id: message.data.razorpay_order_id,
          razorpay_signature: message.data.razorpay_signature,
        };
        
        const verifyResponse = await paymentAPI.verifyRazorpayPayment(verifyData);
        
        if (verifyResponse.success) {
          setStep(3);
          onSuccess();
        } else {
          throw new Error(verifyResponse.message || 'Payment verification failed');
        }
      } else if (message.type === 'dismiss') {
        setWebViewVisible(false);
        setError('Payment cancelled');
      }
    } catch (err: any) {
      setError(err.message || 'Payment verification failed');
      setStep(1);
    }
  };
  
  const resetDialog = () => {
    setStep(0);
    setProcessing(false);
    setError('');
    setPaymentDetails(null);
    setWebViewVisible(false);
  };
  
  const handleClose = () => {
    resetDialog();
    onClose();
  };
  
  if (!application) return null;
  
  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dialogContent}>
            <LinearGradient
              colors={['#667eea', '#49a0ed']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dialogHeader}
            >
              <View style={styles.dialogHeaderContent}>
                <Feather name="credit-card" size={24} color="#fff" />
                <Text style={styles.dialogTitle}>Process Payment</Text>
              </View>
              <TouchableOpacity onPress={handleClose}>
                <Feather name="x" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            
            {/* Stepper */}
            <View style={styles.stepper}>
              {steps.map((label, index) => (
                <View key={label} style={styles.stepContainer}>
                  <View style={[
                    styles.stepCircle,
                    index <= step && styles.stepCircleActive,
                    index < step && styles.stepCircleCompleted,
                  ]}>
                    {index < step ? (
                      <Feather name="check" size={14} color="#fff" />
                    ) : (
                      <Text style={styles.stepNumber}>{index + 1}</Text>
                    )}
                  </View>
                  <Text style={[
                    styles.stepLabel,
                    index <= step && styles.stepLabelActive,
                  ]}>
                    {label}
                  </Text>
                  {index < steps.length - 1 && (
                    <View style={[
                      styles.stepLine,
                      index < step && styles.stepLineActive,
                    ]} />
                  )}
                </View>
              ))}
            </View>
            
            <ScrollView style={styles.dialogBody}>
              {/* Step 0: Payment Method Selection */}
              {step === 0 && (
                <View>
                  <Text style={styles.sectionTitle}>Payment Details</Text>
                  
                  <View style={styles.detailsCard}>
                    <Text style={styles.detailLabel}>Campaign</Text>
                    <Text style={styles.detailValue}>
                      {application.title || application.campaign_title}
                    </Text>
                    
                    <Text style={styles.detailLabel}>Influencer</Text>
                    <Text style={styles.detailValue}>{application.influencer_name}</Text>
                    
                    <Text style={styles.detailLabel}>Amount</Text>
                    <Text style={styles.detailAmount}>
                      {formatCurrency(amount, currencyCode)}
                    </Text>
                    
                    <Text style={styles.detailLabel}>Status</Text>
                    <StatusBadge status={application.status} type="application" />
                  </View>
                  
                  {error ? (
                    <View style={styles.errorContainer}>
                      <Feather name="alert-circle" size={16} color="#ff3b30" />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}
                  
                  <View style={styles.infoBox}>
                    <Feather name="info" size={16} color="#F59E0B" />
                    <Text style={styles.infoText}>
                      Click continue to proceed with secure Razorpay payment
                    </Text>
                  </View>
                </View>
              )}
              
              {/* Step 1: Confirm Details */}
              {step === 1 && paymentDetails && (
                <View>
                  <Text style={styles.sectionTitle}>Confirm Payment</Text>
                  
                  <View style={styles.detailsCard}>
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmLabel}>Campaign</Text>
                      <Text style={styles.confirmValue}>
                        {application.title || application.campaign_title}
                      </Text>
                    </View>
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmLabel}>Influencer</Text>
                      <Text style={styles.confirmValue}>{application.influencer_name}</Text>
                    </View>
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmLabel}>Amount</Text>
                      <Text style={styles.confirmAmount}>
                        {formatCurrency(paymentDetails.amount, paymentDetails.currency)}
                      </Text>
                    </View>
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmLabel}>Method</Text>
                      <Text style={styles.confirmValue}>Razorpay</Text>
                    </View>
                  </View>
                  
                  {error ? (
                    <View style={styles.errorContainer}>
                      <Feather name="alert-circle" size={16} color="#ff3b30" />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}
                  
                  <View style={[styles.infoBox, styles.warningBox]}>
                    <Feather name="alert-triangle" size={16} color="#F59E0B" />
                    <Text style={styles.infoText}>
                      You will be redirected to Razorpay's secure payment gateway
                    </Text>
                  </View>
                </View>
              )}
              
              {/* Step 2: Processing */}
              {step === 2 && (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={styles.processingTitle}>Processing Payment...</Text>
                  <Text style={styles.processingSubtext}>
                    Please wait while we process your payment
                  </Text>
                </View>
              )}
              
              {/* Step 3: Complete */}
              {step === 3 && (
                <View style={styles.successContainer}>
                  <View style={styles.successIcon}>
                    <Feather name="check-circle" size={80} color="#34C759" />
                  </View>
                  <Text style={styles.successTitle}>Payment Successful!</Text>
                  <Text style={styles.successMessage}>
                    Your payment of {formatCurrency(amount, currencyCode)} has been processed successfully.
                  </Text>
                  
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionTitle}>Transaction Details</Text>
                    <View style={styles.transactionRow}>
                      <Text style={styles.transactionLabel}>Campaign</Text>
                      <Text style={styles.transactionValue}>
                        {application.title || application.campaign_title}
                      </Text>
                    </View>
                    <View style={styles.transactionRow}>
                      <Text style={styles.transactionLabel}>Influencer</Text>
                      <Text style={styles.transactionValue}>{application.influencer_name}</Text>
                    </View>
                    <View style={styles.transactionRow}>
                      <Text style={styles.transactionLabel}>Amount</Text>
                      <Text style={styles.transactionAmount}>
                        {formatCurrency(amount, currencyCode)}
                      </Text>
                    </View>
                    <View style={styles.transactionRow}>
                      <Text style={styles.transactionLabel}>Status</Text>
                      <StatusBadge status="completed" type="payment" />
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.dialogActions}>
              {step === 0 && (
                <>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.continueButton, processing && styles.buttonDisabled]}
                    onPress={handleCreateOrder}
                    disabled={processing}
                  >
                    {processing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.continueButtonText}>Continue to Payment</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
              
              {step === 1 && (
                <>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setStep(0)}>
                    <Text style={styles.cancelButtonText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.continueButton, processing && styles.buttonDisabled]}
                    onPress={handleRazorpayPayment}
                    disabled={processing}
                  >
                    <Feather name="credit-card" size={18} color="#fff" />
                    <Text style={styles.continueButtonText}>Proceed to Pay</Text>
                  </TouchableOpacity>
                </>
              )}
              
              {step === 3 && (
                <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Razorpay WebView Modal */}
      <Modal
        visible={webViewVisible}
        animationType="slide"
        onRequestClose={() => setWebViewVisible(false)}
      >
        <SafeAreaView style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <Text style={styles.webViewTitle}>Razorpay Checkout</Text>
            <TouchableOpacity onPress={() => setWebViewVisible(false)}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: paymentUrl }}
            onMessage={handleWebViewMessage}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
};

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
const InPayScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, token } = useAuth();
  const { currency, convertAmount } = useCurrency();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
  const [mediaDialogVisible, setMediaDialogVisible] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [updatedItems, setUpdatedItems] = useState<Set<string>>(new Set());
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [profileDialogVisible, setProfileDialogVisible] = useState(false);
  
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
      
      // Fetch applications with media submitted
      const appsResponse = await campaignAPI.getBrandApplications();
      let appsData = Array.isArray(appsResponse) ? appsResponse : 
                     appsResponse?.data || appsResponse?.applications || [];
      
      // Filter for media_submitted and not completed
      const filteredApps = appsData.filter((app: Application) => 
        (app.status === 'media_submitted' || (app.submitted_media?.length > 0)) && 
        app.status !== 'completed'
      );
      
      setApplications(filteredApps);
      
      // Fetch payment history
      try {
        const paymentsResponse = await paymentAPI.getPaymentHistory();
        let paymentsData: Payment[] = [];
        
        if (paymentsResponse?.success) {
          paymentsData = paymentsResponse.payments || [];
        } else if (Array.isArray(paymentsResponse)) {
          paymentsData = paymentsResponse;
        } else if (paymentsResponse?.data) {
          paymentsData = paymentsResponse.data;
        }
        
        setPaymentHistory(paymentsData);
      } catch (paymentError) {
        console.error('Error loading payment history:', paymentError);
        setPaymentHistory([]);
      }
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
      setApplications([]);
      setPaymentHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const loadMediaFiles = async (application: Application) => {
    if (!application) return;
    
    try {
      let mediaData: MediaFile[] = [];
      
      try {
        const response = await paymentAPI.getCampaignMediaFiles(
          application.campaign_id,
          application.influencer_id
        );
        if (response && Array.isArray(response)) {
          mediaData = response;
        }
      } catch (campaignError) {
        console.warn('Campaign media API failed:', campaignError);
      }
      
      if (mediaData.length === 0 && application.submitted_media) {
        mediaData = application.submitted_media.map(media => ({
          ...media,
          campaign_id: application.campaign_id,
          influencer_id: application.influencer_id,
        }));
      }
      
      setMediaFiles(mediaData);
    } catch (error) {
      console.error('Error loading media files:', error);
    }
  };
  
  const handleOpenPaymentDialog = (application: Application) => {
    setSelectedApplication(application);
    setPaymentDialogVisible(true);
  };
  
  const handleOpenMediaDialog = async (application: Application) => {
    setSelectedApplication(application);
    await loadMediaFiles(application);
    setMediaDialogVisible(true);
  };
  
  const handleViewProfile = async (userId: string, userName: string) => {
    try {
      const profileData = await profileAPI.getProfileById(userId);
      setSelectedProfile({
        ...(profileData.profile || profileData),
        _id: userId,
        username: userName,
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
  
  const handlePaymentSuccess = () => {
    markAsUpdated(`${selectedApplication?.campaign_id}-${selectedApplication?.influencer_id}`);
    loadData();
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
    totalPayments: paymentHistory.length,
    completedPayments: paymentHistory.filter(p => p.status === 'completed').length,
    totalAmount: paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0),
  };
  
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loaderText}>Loading payment data...</Text>
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
          colors={['#667eea', '#49a0ed']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View>
            <Text style={styles.headerTitle}>Payment Management</Text>
            <Text style={styles.headerSubtitle}>
              Process payments for completed influencer campaigns
            </Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Feather name="refresh-cw" size={20} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
        
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatsCard
            label="Pending Payments"
            value={stats.pendingPayments}
            icon="wallet"
            color="#F59E0B"
            subtitle={`${stats.pendingPayments} campaigns waiting`}
          />
          <StatsCard
            label="Completed Payments"
            value={stats.completedPayments}
            icon="check-circle"
            color="#34C759"
            subtitle="Successful transactions"
          />
          <StatsCard
            label="Total Processed"
            value={formatCurrency(stats.totalAmount, currency)}
            icon="receipt"
            color="#007AFF"
            subtitle={`Across ${stats.totalPayments} payments`}
          />
          <StatsCard
            label="Currency"
            value={currency}
            icon="trending-up"
            color="#8B5CF6"
            subtitle="Display currency"
            onPress={() => {
              // TODO: Open currency selector
            }}
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
              name="credit-card"
              size={18}
              color={activeTab === 'pending' ? '#007AFF' : '#999'}
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
              name="clock"
              size={18}
              color={activeTab === 'history' ? '#007AFF' : '#999'}
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
                <Feather name="check-circle" size={60} color="#34C759" />
                <Text style={styles.emptyTitle}>All Caught Up! 🎉</Text>
                <Text style={styles.emptyText}>
                  No pending payments. All influencer campaigns have been processed.
                </Text>
              </View>
            ) : (
              applications.map((application) => {
                const itemId = `${application.campaign_id}-${application.influencer_id}`;
                const isUpdated = isRecentlyUpdated(itemId);
                
                return (
                  <PaymentCard
                    key={itemId}
                    application={application}
                    onPay={() => handleOpenPaymentDialog(application)}
                    onViewMedia={() => handleOpenMediaDialog(application)}
                    onViewProfile={() => handleViewProfile(application.influencer_id, application.influencer_name || '')}
                    onChat={() => handleChat(application.influencer_id, application.influencer_name || '')}
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
                  key={payment._id || payment.id}
                  payment={payment}
                />
              ))
            )}
          </View>
        )}
        
        <View style={styles.footer} />
      </ScrollView>
      
      {/* Payment Dialog */}
      <PaymentDialog
        visible={paymentDialogVisible}
        onClose={() => setPaymentDialogVisible(false)}
        application={selectedApplication}
        onSuccess={handlePaymentSuccess}
      />
      
      {/* Media Files Modal */}
      <MediaFilesModal
        visible={mediaDialogVisible}
        onClose={() => setMediaDialogVisible(false)}
        mediaFiles={mediaFiles}
        application={selectedApplication}
      />
      
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
              colors={['#667eea', '#49a0ed']}
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
                  <Feather name="eye" size={20} color="#007AFF" />
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
    backgroundColor: '#007AFF10',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#007AFF',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: 8,
    backgroundColor: '#007AFF',
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
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  updatedCard: {
    borderWidth: 2,
    borderColor: '#34C759',
  },
  campaignImage: {
    width: '100%',
    height: 160,
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  imagePlaceholderSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  chatLink: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
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
    marginBottom: 8,
  },
  influencerMessage: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  budgetLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  budgetAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34C759',
  },
  convertedAmount: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  mediaCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mediaCountText: {
    fontSize: 12,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  payButton: {
    backgroundColor: '#007AFF',
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  secondaryActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  dialogContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dialogHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#007AFF',
  },
  stepCircleCompleted: {
    backgroundColor: '#34C759',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  stepLabel: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#007AFF',
    fontWeight: '500',
  },
  stepLine: {
    position: 'absolute',
    top: 15,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#e0e0e0',
  },
  stepLineActive: {
    backgroundColor: '#007AFF',
  },
  dialogBody: {
    paddingHorizontal: 20,
  },
  dialogActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  detailAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#34C759',
    marginBottom: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#ff3b30',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  warningBox: {
    backgroundColor: '#FFF3E0',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#F59E0B',
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  confirmLabel: {
    fontSize: 14,
    color: '#999',
  },
  confirmValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  confirmAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34C759',
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  processingSubtext: {
    fontSize: 14,
    color: '#999',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  successIcon: {
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#34C759',
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  transactionDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginTop: 16,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transactionLabel: {
    fontSize: 12,
    color: '#999',
  },
  transactionValue: {
    fontSize: 12,
    color: '#333',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  continueButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    gap: 8,
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  doneButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  webViewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  webView: {
    flex: 1,
  },
  mediaList: {
    padding: 16,
    gap: 12,
  },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  mediaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaInfo: {
    flex: 1,
  },
  mediaName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  mediaType: {
    fontSize: 10,
    color: '#999',
    marginBottom: 2,
  },
  mediaSize: {
    fontSize: 10,
    color: '#999',
  },
  mediaDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  downloadButton: {
    padding: 8,
  },
  emptyMedia: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyMediaText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
    marginTop: 16,
  },
  emptyMediaSubtext: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 8,
  },
  mediaViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  mediaViewerContent: {
    flex: 1,
  },
  mediaViewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mediaViewerTitle: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },
  mediaViewerBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaViewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  mediaViewerPlaceholder: {
    alignItems: 'center',
    gap: 16,
  },
  mediaViewerPlaceholderText: {
    fontSize: 16,
    color: '#fff',
  },
  downloadMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  downloadMediaText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
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
    backgroundColor: '#007AFF',
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
    backgroundColor: '#007AFF',
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
    color: '#007AFF',
  },
});

export default InPayScreen;