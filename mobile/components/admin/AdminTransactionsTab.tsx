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
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import adminTransactionsAPI, {
  DashboardStats,
  Payment,
  Payout,
  Application,
  RevenueAnalytics,
  TopInfluencer,
  TopBrand,
  PaymentFlow,
} from '../../services/admintransactionsapi';

// Stat Card Component
const StatCard = ({ title, value, icon, color, subtitle, onPress }: any) => {
  const getIconColor = () => {
    switch (color) {
      case 'primary': return '#6366F1';
      case 'success': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'error': return '#EF4444';
      case 'info': return '#0EA5E9';
      case 'secondary': return '#8B5CF6';
      default: return '#757575';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: getIconColor(), borderLeftWidth: 4 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.statCardHeader}>
        <Text style={styles.statCardTitle}>{title}</Text>
        <View style={[styles.statCardIcon, { backgroundColor: getIconColor() + '20' }]}>
          <Ionicons name={icon as any} size={24} color={getIconColor()} />
        </View>
      </View>
      <Text style={styles.statCardValue}>{value}</Text>
      {subtitle && <Text style={styles.statCardSubtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const color = adminTransactionsAPI.getStatusColor(status);
  const label = adminTransactionsAPI.formatStatus(status);

  return (
    <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>{label}</Text>
    </View>
  );
};

// Payment Card Component
const PaymentCard = ({ payment, onPress, onApprove, onMarkPaid }: any) => {
  const amount = adminTransactionsAPI.formatCurrency(payment.amount, payment.currency);
  const date = adminTransactionsAPI.formatDate(payment.created_at);
  const methodIcon = adminTransactionsAPI.getPaymentMethodIcon(payment.payment_method);
  const methodLabel = adminTransactionsAPI.getPaymentMethodLabel(payment.payment_method);

  return (
    <TouchableOpacity style={styles.transactionCard} onPress={() => onPress(payment)}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Text style={styles.cardIconText}>{methodIcon}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{payment.payment_reference}</Text>
          <Text style={styles.cardSubtitle}>{payment.campaign_title}</Text>
        </View>
        <StatusBadge status={payment.status} />
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{payment.influencer_name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={14} color="#666" />
          <Text style={[styles.detailText, styles.amountText]}>{amount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="card-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{methodLabel}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{date}</Text>
        </View>
      </View>

      {(payment.status === 'pending_approval' || payment.status === 'approved') && (
        <View style={styles.cardActions}>
          {payment.status === 'pending_approval' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => onApprove(payment._id)}
            >
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
          )}
          {(payment.status === 'approved' || payment.status === 'processing') && (
            <TouchableOpacity
              style={[styles.actionButton, styles.markPaidButton]}
              onPress={() => onMarkPaid(payment)}
            >
              <Ionicons name="cash" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Mark Paid</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// Application Card Component
const ApplicationCard = ({ application, onPress, onCreatePayment }: any) => {
  const amount = adminTransactionsAPI.formatCurrency(application.payment_amount, application.payment_currency);
  const date = adminTransactionsAPI.formatDate(application.application_completed_at || application.created_at);

  return (
    <TouchableOpacity style={styles.transactionCard} onPress={() => onPress(application)}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: '#F59E0B20' }]}>
          <Ionicons name="document-text" size={20} color="#F59E0B" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{application.campaign_title}</Text>
          <Text style={styles.cardSubtitle}>Completed Application</Text>
        </View>
        {application.payment_created ? (
          <StatusBadge status={application.payment_status || 'completed'} />
        ) : (
          <StatusBadge status="pending" />
        )}
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{application.influencer_name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{application.brand_name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={14} color="#666" />
          <Text style={[styles.detailText, styles.amountText]}>{amount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{date}</Text>
        </View>
      </View>

      {!application.payment_created && (
        <TouchableOpacity
          style={[styles.actionButton, styles.createPaymentButton]}
          onPress={() => onCreatePayment(application)}
        >
          <Ionicons name="add-circle" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Create Payment</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

// Payout Card Component
const PayoutCard = ({ payout, onPress }: any) => {
  const amount = adminTransactionsAPI.formatCurrency(payout.total_amount, payout.currency);
  const date = adminTransactionsAPI.formatDate(payout.created_at);
  const methodLabel = adminTransactionsAPI.getPaymentMethodLabel(payout.payout_method);

  return (
    <TouchableOpacity style={styles.transactionCard} onPress={() => onPress(payout)}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: '#8B5CF620' }]}>
          <Ionicons name="send" size={20} color="#8B5CF6" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{payout.payout_reference}</Text>
          <Text style={styles.cardSubtitle}>{payout.influencer_name}</Text>
        </View>
        <StatusBadge status={payout.status} />
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={14} color="#666" />
          <Text style={[styles.detailText, styles.amountText]}>{amount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="card-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{methodLabel}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Transaction Detail Modal
const TransactionDetailModal = ({ visible, transaction, onClose, onApprove, onMarkPaid }: any) => {
  if (!transaction) return null;

  const isPayment = transaction.payment_reference !== undefined;
  const isApplication = transaction.application_id !== undefined;
  const isPayout = transaction.payout_reference !== undefined;

  const renderPaymentDetails = () => (
    <View>
      <View style={styles.detailSection}>
        <Text style={styles.detailSectionTitle}>Payment Information</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Reference:</Text>
          <Text style={styles.detailValue}>{transaction.payment_reference}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <StatusBadge status={transaction.status} />
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount:</Text>
          <Text style={[styles.detailValue, styles.amountValue]}>
            {adminTransactionsAPI.formatCurrency(transaction.amount, transaction.currency)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Method:</Text>
          <Text style={styles.detailValue}>
            {adminTransactionsAPI.getPaymentMethodLabel(transaction.payment_method)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created:</Text>
          <Text style={styles.detailValue}>{adminTransactionsAPI.formatDate(transaction.created_at)}</Text>
        </View>
        {transaction.transaction_id && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID:</Text>
            <Text style={styles.detailValue}>{transaction.transaction_id}</Text>
          </View>
        )}
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.detailSectionTitle}>Parties</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Influencer:</Text>
          <Text style={styles.detailValue}>{transaction.influencer_name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Campaign:</Text>
          <Text style={styles.detailValue}>{transaction.campaign_title}</Text>
        </View>
      </View>

      {transaction.notes && (
        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{transaction.notes}</Text>
        </View>
      )}
    </View>
  );

  const renderApplicationDetails = () => (
    <View>
      <View style={styles.detailSection}>
        <Text style={styles.detailSectionTitle}>Application Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Campaign:</Text>
          <Text style={styles.detailValue}>{transaction.campaign_title}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Influencer:</Text>
          <Text style={styles.detailValue}>{transaction.influencer_name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Brand:</Text>
          <Text style={styles.detailValue}>{transaction.brand_name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment Amount:</Text>
          <Text style={[styles.detailValue, styles.amountValue]}>
            {adminTransactionsAPI.formatCurrency(transaction.payment_amount, transaction.payment_currency)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Completed:</Text>
          <Text style={styles.detailValue}>
            {adminTransactionsAPI.formatDate(transaction.application_completed_at || transaction.created_at)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderPayoutDetails = () => (
    <View>
      <View style={styles.detailSection}>
        <Text style={styles.detailSectionTitle}>Payout Information</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Reference:</Text>
          <Text style={styles.detailValue}>{transaction.payout_reference}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <StatusBadge status={transaction.status} />
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount:</Text>
          <Text style={[styles.detailValue, styles.amountValue]}>
            {adminTransactionsAPI.formatCurrency(transaction.total_amount, transaction.currency)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Method:</Text>
          <Text style={styles.detailValue}>
            {adminTransactionsAPI.getPaymentMethodLabel(transaction.payout_method)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created:</Text>
          <Text style={styles.detailValue}>{adminTransactionsAPI.formatDate(transaction.created_at)}</Text>
        </View>
      </View>

      {transaction.payout_details?.bank_details && (
        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Bank Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Holder:</Text>
            <Text style={styles.detailValue}>{transaction.payout_details.bank_details.account_holder_name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Number:</Text>
            <Text style={styles.detailValue}>****{transaction.payout_details.bank_details.account_number?.slice(-4)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>IFSC:</Text>
            <Text style={styles.detailValue}>{transaction.payout_details.bank_details.ifsc_code}</Text>
          </View>
        </View>
      )}
    </View>
  );

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
            <Text style={styles.modalTitle}>
              {isPayment ? 'Payment Details' : isApplication ? 'Application Details' : 'Payout Details'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {isPayment && renderPaymentDetails()}
            {isApplication && renderApplicationDetails()}
            {isPayout && renderPayoutDetails()}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
            {isPayment && transaction.status === 'pending_approval' && (
              <TouchableOpacity
                style={styles.approveModalButton}
                onPress={() => onApprove(transaction._id)}
              >
                <Text style={styles.approveModalText}>Approve Payment</Text>
              </TouchableOpacity>
            )}
            {isApplication && !transaction.payment_created && (
              <TouchableOpacity
                style={styles.createModalButton}
                onPress={() => onCreatePayment(transaction)}
              >
                <Text style={styles.createModalText}>Create Payment</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Payment Flow Modal
const PaymentFlowModal = ({ visible, flow, onClose }: { visible: boolean; flow: PaymentFlow | null; onClose: () => void }) => {
  if (!flow) return null;

  const getStepStatus = (status: string) => {
    if (status === 'completed') return 'completed';
    if (status === 'processing' || status === 'approved') return 'active';
    return 'pending';
  };

  const steps = [
    { key: 'application', label: 'Application Completed', status: getStepStatus(flow.application_status), date: flow.application_completed_at, icon: 'checkmark-circle' },
    { key: 'payment', label: 'Payment Created', status: flow.payment ? getStepStatus(flow.payment.status) : 'pending', date: flow.payment?.created_at, icon: 'card', amount: flow.payment?.amount },
    { key: 'earning', label: 'Earning Created', status: flow.earning ? getStepStatus(flow.earning.status) : 'pending', date: flow.earning?.created_at, icon: 'cash', amount: flow.earning?.amount },
    { key: 'withdrawal', label: 'Withdrawal Requested', status: flow.withdrawal ? getStepStatus(flow.withdrawal.status) : 'pending', date: flow.withdrawal?.requested_at, icon: 'trending-up', amount: flow.withdrawal?.amount },
    { key: 'payout', label: 'Payout Completed', status: flow.payout ? getStepStatus(flow.payout.status) : 'pending', date: flow.payout?.created_at, icon: 'send', amount: flow.payout?.total_amount },
  ];

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'active': return '#0EA5E9';
      default: return '#D1D5DB';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, styles.flowModalContent]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Payment Flow</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.flowHeader}>
              <Text style={styles.flowTitle}>{flow.campaign_title}</Text>
              <View style={styles.flowParties}>
                <Text style={styles.flowParty}>Influencer: {flow.influencer_name}</Text>
                <Text style={styles.flowParty}>Brand: {flow.brand_name}</Text>
              </View>
              <StatusBadge status={flow.overall_status} />
            </View>

            <View style={styles.timeline}>
              {steps.map((step, index) => (
                <View key={step.key} style={styles.timelineStep}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineIcon, { backgroundColor: getStepColor(step.status) + '20' }]}>
                      <Ionicons name={step.icon as any} size={20} color={getStepColor(step.status)} />
                    </View>
                    {index < steps.length - 1 && <View style={[styles.timelineLine, { backgroundColor: getStepColor(step.status) }]} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineLabel, { color: getStepColor(step.status) }]}>{step.label}</Text>
                    {step.date && <Text style={styles.timelineDate}>{adminTransactionsAPI.formatDate(step.date)}</Text>}
                    {step.amount && (
                      <Text style={styles.timelineAmount}>
                        {adminTransactionsAPI.formatCurrency(step.amount, flow.payment?.currency || 'USD')}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Create Payment Modal
const CreatePaymentModal = ({ visible, application, onClose, onCreate }: any) => {
  const [amount, setAmount] = useState(application?.payment_amount?.toString() || '');
  const [currency, setCurrency] = useState(application?.payment_currency || 'USD');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD'];
  const paymentMethods = [
    { value: 'razorpay', label: 'Razorpay' },
    { value: 'stripe', label: 'Stripe' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'upi', label: 'UPI' },
  ];

  const handleCreate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await adminTransactionsAPI.createPayment({
        campaign_id: application.campaign_id,
        influencer_id: application.influencer_id,
        amount: parseFloat(amount),
        currency,
        payment_method: paymentMethod as any,
        notes,
        auto_approve: true,
      });
      Alert.alert('Success', 'Payment created successfully');
      onCreate?.();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

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
            <Text style={styles.modalTitle}>Create Payment</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Campaign</Text>
              <Text style={styles.formValue}>{application?.campaign_title}</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Influencer</Text>
              <Text style={styles.formValue}>{application?.influencer_name}</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Amount *</Text>
              <View style={styles.amountRow}>
                <TextInput
                  style={[styles.formInput, styles.amountInput]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
                <View style={styles.currencyPicker}>
                  {currencies.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.currencyOption, currency === c && styles.currencyOptionActive]}
                      onPress={() => setCurrency(c)}
                    >
                      <Text style={[styles.currencyText, currency === c && styles.currencyTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Payment Method</Text>
              <View style={styles.methodOptions}>
                {paymentMethods.map(method => (
                  <TouchableOpacity
                    key={method.value}
                    style={[styles.methodOption, paymentMethod === method.value && styles.methodOptionActive]}
                    onPress={() => setPaymentMethod(method.value)}
                  >
                    <Text style={[styles.methodText, paymentMethod === method.value && styles.methodTextActive]}>
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                style={[styles.formInput, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add payment notes..."
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
              <Text style={styles.closeModalText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createModalButton, loading && styles.disabledButton]}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.createModalText}>Create Payment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Mark Paid Modal
const MarkPaidModal = ({ visible, payment, onClose, onMarkPaid }: any) => {
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!transactionId.trim()) {
      Alert.alert('Error', 'Please enter a transaction ID');
      return;
    }

    setLoading(true);
    try {
      await adminTransactionsAPI.markPaymentAsPaid(payment._id, transactionId);
      Alert.alert('Success', 'Payment marked as paid');
      onMarkPaid?.();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to mark payment as paid');
    } finally {
      setLoading(false);
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
        <View style={styles.smallModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mark as Paid</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Payment Reference</Text>
              <Text style={styles.formValue}>{payment?.payment_reference}</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Amount</Text>
              <Text style={styles.formValue}>
                {adminTransactionsAPI.formatCurrency(payment?.amount, payment?.currency)}
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Transaction ID *</Text>
              <TextInput
                style={styles.formInput}
                value={transactionId}
                onChangeText={setTransactionId}
                placeholder="Enter transaction ID"
              />
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
              <Text style={styles.closeModalText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.approveModalButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.approveModalText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main Component
export default function AdminTransactionsTab() {
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'payments' | 'payouts'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueAnalytics[]>([]);
  const [topInfluencers, setTopInfluencers] = useState<TopInfluencer[]>([]);
  const [topBrands, setTopBrands] = useState<TopBrand[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedFlow, setSelectedFlow] = useState<PaymentFlow | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [flowModalVisible, setFlowModalVisible] = useState(false);
  const [createPaymentModalVisible, setCreatePaymentModalVisible] = useState(false);
  const [markPaidModalVisible, setMarkPaidModalVisible] = useState(false);
  
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        statsData,
        appsData,
        paymentsData,
        payoutsData,
        revenueData,
        influencersData,
        brandsData,
      ] = await Promise.all([
        adminTransactionsAPI.getDashboardStats(),
        adminTransactionsAPI.getCompletedApplications({ limit: 50 }),
        adminTransactionsAPI.getPayments({ limit: 50 }),
        adminTransactionsAPI.getPayouts({ limit: 50 }),
        adminTransactionsAPI.getRevenueAnalytics('30d'),
        adminTransactionsAPI.getTopInfluencers(10),
        adminTransactionsAPI.getTopBrands(10),
      ]);
      
      setStats(statsData);
      setApplications(appsData.applications);
      setPayments(paymentsData.payments);
      setPayouts(payoutsData.payouts);
      setRevenueData(revenueData);
      setTopInfluencers(influencersData);
      setTopBrands(brandsData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', error.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  const handleViewDetails = (item: any) => {
    setSelectedTransaction(item);
    setDetailModalVisible(true);
  };

  const handleViewPaymentFlow = async (campaignId: string, influencerId: string) => {
    try {
      const flow = await adminTransactionsAPI.getPaymentFlow(campaignId, influencerId);
      setSelectedFlow(flow);
      setFlowModalVisible(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load payment flow');
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    try {
      await adminTransactionsAPI.approvePayment(paymentId);
      Alert.alert('Success', 'Payment approved successfully');
      fetchAllData();
      setDetailModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to approve payment');
    }
  };

  const handleMarkPaid = (payment: Payment) => {
    setSelectedPayment(payment);
    setMarkPaidModalVisible(true);
  };

  const handleCreatePayment = (application: Application) => {
    setSelectedApplication(application);
    setCreatePaymentModalVisible(true);
  };

  const handleBatchCreatePayments = async () => {
    const pendingApps = applications.filter(app => !app.payment_created);
    if (pendingApps.length === 0) {
      Alert.alert('Info', 'No pending applications to process');
      return;
    }

    Alert.alert(
      'Batch Create Payments',
      `Create payments for ${pendingApps.length} completed applications?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            try {
              const result = await adminTransactionsAPI.batchCreatePayments(
                pendingApps.map(app => app.application_id)
              );
              Alert.alert(
                'Batch Processing Complete',
                `Successful: ${result.summary.successful}\nFailed: ${result.summary.failed}\nAlready Processed: ${result.summary.already_processed}`
              );
              fetchAllData();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to batch create payments');
            }
          },
        },
      ]
    );
  };

  const handleExport = async () => {
    try {
      const blob = await adminTransactionsAPI.exportData('payments', 'csv');
      await Share.share({
        message: 'Export payments data',
        title: 'Payments Export',
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to export data');
    }
  };

  const renderOverview = () => (
    <View>
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Revenue"
          value={adminTransactionsAPI.formatCurrency(stats?.total_brand_payments || 0)}
          icon="cash"
          color="primary"
        />
        <StatCard
          title="Platform Fees"
          value={adminTransactionsAPI.formatCurrency(stats?.total_platform_fees || 0)}
          icon="trending-up"
          color="success"
        />
        <StatCard
          title="Pending Actions"
          value={stats?.waiting_payments || 0}
          icon="time"
          color="warning"
        />
        <StatCard
          title="Completed Payments"
          value={stats?.completed_payments || 0}
          icon="checkmark-circle"
          color="success"
        />
      </View>

      {/* Revenue Chart Placeholder */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Revenue Trends (30 Days)</Text>
        <View style={styles.chartContainer}>
          {revenueData.length > 0 ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={revenueData}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.chartBar}>
                  <View style={[styles.bar, { height: Math.min((item.total_revenue / 10000) * 100, 150) }]} />
                  <Text style={styles.barLabel}>{item._id}</Text>
                  <Text style={styles.barValue}>{adminTransactionsAPI.formatCurrency(item.total_revenue)}</Text>
                </View>
              )}
              contentContainerStyle={styles.chartBars}
            />
          ) : (
            <Text style={styles.noDataText}>No revenue data available</Text>
          )}
        </View>
      </View>

      {/* Top Performers */}
      <View style={styles.performersContainer}>
        <View style={styles.performerCard}>
          <Text style={styles.performerTitle}>Top Influencers</Text>
          {topInfluencers.map((inf, index) => (
            <View key={inf.influencer_id} style={styles.performerItem}>
              <Text style={styles.performerRank}>{index + 1}</Text>
              <View style={styles.performerInfo}>
                <Text style={styles.performerName}>{inf.name}</Text>
                <Text style={styles.performerCount}>{inf.payment_count} payments</Text>
              </View>
              <Text style={styles.performerAmount}>
                {adminTransactionsAPI.formatCurrency(inf.total_earnings)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.performerCard}>
          <Text style={styles.performerTitle}>Top Brands</Text>
          {topBrands.map((brand, index) => (
            <View key={brand.brand_id} style={styles.performerItem}>
              <Text style={styles.performerRank}>{index + 1}</Text>
              <View style={styles.performerInfo}>
                <Text style={styles.performerName}>{brand.name}</Text>
                <Text style={styles.performerCount}>{brand.payment_count} payments</Text>
              </View>
              <Text style={styles.performerAmount}>
                {adminTransactionsAPI.formatCurrency(brand.total_spent)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderApplications = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Completed Applications</Text>
        <TouchableOpacity
          style={styles.batchButton}
          onPress={handleBatchCreatePayments}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.batchButtonText}>Batch Create</Text>
        </TouchableOpacity>
      </View>

      {applications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No completed applications</Text>
        </View>
      ) : (
        applications.map(app => (
          <ApplicationCard
            key={app.application_id}
            application={app}
            onPress={() => handleViewDetails(app)}
            onCreatePayment={() => handleCreatePayment(app)}
          />
        ))
      )}
    </View>
  );

  const renderPayments = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Payments</Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      {payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="card-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No payments found</Text>
        </View>
      ) : (
        payments.map(payment => (
          <PaymentCard
            key={payment._id}
            payment={payment}
            onPress={() => handleViewDetails(payment)}
            onApprove={handleApprovePayment}
            onMarkPaid={handleMarkPaid}
          />
        ))
      )}
    </View>
  );

  const renderPayouts = () => (
    <View>
      <Text style={styles.sectionTitle}>Payouts</Text>
      {payouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="send-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No payouts found</Text>
        </View>
      ) : (
        payouts.map(payout => (
          <PayoutCard
            key={payout._id}
            payout={payout}
            onPress={() => handleViewDetails(payout)}
          />
        ))
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <Text style={styles.headerSubtitle}>Manage payments and payouts</Text>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { key: 'overview', label: 'Overview', icon: 'stats-chart' },
          { key: 'applications', label: 'Applications', icon: 'document-text', badge: applications.filter(a => !a.payment_created).length },
          { key: 'payments', label: 'Payments', icon: 'card', badge: stats?.waiting_payments },
          { key: 'payouts', label: 'Payouts', icon: 'send' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? '#6366F1' : '#666'}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
            {tab.badge > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{tab.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'applications' && renderApplications()}
        {activeTab === 'payments' && renderPayments()}
        {activeTab === 'payouts' && renderPayouts()}
      </ScrollView>

      {/* Modals */}
      <TransactionDetailModal
        visible={detailModalVisible}
        transaction={selectedTransaction}
        onClose={() => setDetailModalVisible(false)}
        onApprove={handleApprovePayment}
        onCreatePayment={handleCreatePayment}
      />

      <PaymentFlowModal
        visible={flowModalVisible}
        flow={selectedFlow}
        onClose={() => setFlowModalVisible(false)}
      />

      <CreatePaymentModal
        visible={createPaymentModalVisible}
        application={selectedApplication}
        onClose={() => setCreatePaymentModalVisible(false)}
        onCreate={fetchAllData}
      />

      <MarkPaidModal
        visible={markPaidModalVisible}
        payment={selectedPayment}
        onClose={() => setMarkPaidModalVisible(false)}
        onMarkPaid={fetchAllData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    gap: 6,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#EFF6FF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#6366F1',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statCardSubtitle: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartBars: {
    alignItems: 'flex-end',
  },
  chartBar: {
    alignItems: 'center',
    marginRight: 16,
    width: 50,
  },
  bar: {
    width: 30,
    backgroundColor: '#6366F1',
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  barValue: {
    fontSize: 9,
    color: '#999',
  },
  performersContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  performerCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  performerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  performerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  performerRank: {
    width: 24,
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  performerCount: {
    fontSize: 10,
    color: '#999',
  },
  performerAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  batchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  batchButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  exportButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F120',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIconText: {
    fontSize: 20,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  cardDetails: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  amountText: {
    fontWeight: '600',
    color: '#10B981',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  markPaidButton: {
    backgroundColor: '#6366F1',
  },
  createPaymentButton: {
    backgroundColor: '#0EA5E9',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 40,
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
  smallModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 20,
    maxHeight: '80%',
  },
  flowModalContent: {
    maxHeight: '85%',
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
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  closeModalButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  closeModalText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  approveModalButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 10,
  },
  approveModalText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  createModalButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#0EA5E9',
    borderRadius: 10,
  },
  createModalText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    width: 100,
    fontSize: 13,
    color: '#666',
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  amountValue: {
    fontWeight: '600',
    color: '#10B981',
  },
  notesText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  formValue: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  amountRow: {
    flexDirection: 'row',
    gap: 12,
  },
  amountInput: {
    flex: 1,
  },
  currencyPicker: {
    flexDirection: 'row',
    gap: 8,
  },
  currencyOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  currencyOptionActive: {
    backgroundColor: '#6366F1',
  },
  currencyText: {
    fontSize: 12,
    color: '#666',
  },
  currencyTextActive: {
    color: '#fff',
  },
  methodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  methodOptionActive: {
    backgroundColor: '#6366F1',
  },
  methodText: {
    fontSize: 12,
    color: '#666',
  },
  methodTextActive: {
    color: '#fff',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  flowHeader: {
    marginBottom: 24,
  },
  flowTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  flowParties: {
    gap: 4,
    marginBottom: 12,
  },
  flowParty: {
    fontSize: 13,
    color: '#666',
  },
  timeline: {
    marginTop: 8,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeft: {
    width: 40,
    alignItems: 'center',
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  timelineAmount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
  },
});