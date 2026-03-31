// C:\Sagadevan\quickbox\mobile\app\(influencer)\settings\bank-account.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Switch,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import accountAPI, { BankAccount, CreateBankAccountRequest } from '../../../services/accountAPI';

const { width, height } = Dimensions.get('window');

// Status Chip Component
const StatusChip = ({ status }: { status: string }) => {
  const config = accountAPI.getVerificationStatusConfig(status);
  
  return (
    <View style={[styles.statusChip, { backgroundColor: config.backgroundColor }]}>
      <Ionicons name={config.icon as any} size={14} color={config.color} />
      <Text style={[styles.statusChipText, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};

// Bank Account Card Component
const BankAccountCard = ({ 
  account, 
  onEdit, 
  onDelete, 
  onSetPrimary,
  isOnlyAccount 
}: { 
  account: BankAccount; 
  onEdit: () => void; 
  onDelete: () => void; 
  onSetPrimary: () => void;
  isOnlyAccount: boolean;
}) => {
  const maskAccountNumber = (number: string) => {
    if (!number) return '';
    return `****${number.slice(-4)}`;
  };

  return (
    <View style={styles.accountCard}>
      <View style={styles.accountHeader}>
        <View style={styles.accountHeaderLeft}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.accountIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="wallet-outline" size={24} color="#FFF" />
          </LinearGradient>
          <View>
            <Text style={styles.accountHolderName}>
              {account.account_holder_name}
            </Text>
            <View style={styles.accountBadges}>
              {account.is_primary && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>Primary</Text>
                </View>
              )}
              <StatusChip status={account.verification_status} />
            </View>
          </View>
        </View>
        
        <View style={styles.accountActions}>
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <Ionicons name="create-outline" size={20} color="#667eea" />
          </TouchableOpacity>
          {!isOnlyAccount && (
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={20} color="#F44336" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.accountDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Account Number</Text>
          <Text style={styles.detailValue}>{maskAccountNumber(account.account_number)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>IFSC Code</Text>
          <Text style={styles.detailValue}>{account.ifsc_code}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Bank</Text>
          <Text style={styles.detailValue}>{account.bank_name || 'N/A'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Account Type</Text>
          <Text style={styles.detailValue}>
            {account.account_type === 'savings' ? 'Savings Account' : 'Current Account'}
          </Text>
        </View>
      </View>

      {!account.is_primary && (
        <TouchableOpacity style={styles.setPrimaryButton} onPress={onSetPrimary}>
          <Text style={styles.setPrimaryButtonText}>Set as Primary</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Stats Card Component
const StatsCard = ({ hasAccounts, accountCount, hasPrimaryAccount }: {
  hasAccounts: boolean;
  accountCount: number;
  hasPrimaryAccount: boolean;
}) => {
  return (
    <View style={styles.statsContainer}>
      <LinearGradient
        colors={hasAccounts ? ['#4CAF50', '#2E7D32'] : ['#FF9800', '#F57C00']}
        style={styles.statsCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Ionicons name={hasAccounts ? "checkmark-circle" : "alert-circle"} size={32} color="#FFF" />
        <Text style={styles.statsTitle}>
          {hasAccounts ? 'Account Setup Complete' : 'Account Required'}
        </Text>
        <Text style={styles.statsValue}>
          {accountCount} {accountCount === 1 ? 'account' : 'accounts'} added
        </Text>
      </LinearGradient>

      <LinearGradient
        colors={hasPrimaryAccount ? ['#4CAF50', '#2E7D32'] : ['#9E9E9E', '#757575']}
        style={styles.statsCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Ionicons name={hasPrimaryAccount ? "checkmark-circle" : "alert-circle"} size={32} color="#FFF" />
        <Text style={styles.statsTitle}>
          {hasPrimaryAccount ? 'Primary Account Set' : 'No Primary Account'}
        </Text>
      </LinearGradient>

      <LinearGradient
        colors={['#2196F3', '#1976D2']}
        style={styles.statsCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Ionicons name="person-outline" size={32} color="#FFF" />
        <Text style={styles.statsTitle}>Influencer Account</Text>
        <Text style={styles.statsSubtitle}>Personal Banking</Text>
      </LinearGradient>
    </View>
  );
};

// Add/Edit Bank Account Modal
const BankAccountModal = ({ 
  visible, 
  onClose, 
  onSubmit, 
  account,
  loading 
}: { 
  visible: boolean; 
  onClose: () => void; 
  onSubmit: (data: CreateBankAccountRequest) => Promise<void>; 
  account?: BankAccount | null;
  loading: boolean;
}) => {
  const [formData, setFormData] = useState<CreateBankAccountRequest>({
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    branch_name: '',
    account_type: 'savings',
    is_primary: true
  });
  const [ifscValidation, setIfscValidation] = useState<any>(null);
  const [validatingIfsc, setValidatingIfsc] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (account) {
      setFormData({
        account_holder_name: account.account_holder_name,
        account_number: account.account_number,
        ifsc_code: account.ifsc_code,
        bank_name: account.bank_name || '',
        branch_name: account.branch_name || '',
        account_type: account.account_type as 'savings' | 'current',
        is_primary: account.is_primary
      });
      setActiveStep(2);
    } else {
      resetForm();
    }
  }, [account]);

  const resetForm = () => {
    setFormData({
      account_holder_name: '',
      account_number: '',
      ifsc_code: '',
      bank_name: '',
      branch_name: '',
      account_type: 'savings',
      is_primary: true
    });
    setIfscValidation(null);
    setErrors({});
    setActiveStep(0);
  };

  const validateIFSC = async (ifscCode: string) => {
    if (!ifscCode || ifscCode.length !== 11) return;

    try {
      setValidatingIfsc(true);
      const response = await accountAPI.validateIFSC(ifscCode);
      setIfscValidation(response);

      if (response.is_valid) {
        setFormData(prev => ({
          ...prev,
          bank_name: response.bank_name || '',
          branch_name: response.branch_name || ''
        }));
        setActiveStep(1);
      }
    } catch (error) {
      console.error('IFSC validation error:', error);
      setIfscValidation({
        is_valid: false,
        message: 'Failed to validate IFSC code'
      });
    } finally {
      setValidatingIfsc(false);
    }
  };

  const handleIFSCChange = (text: string) => {
    const ifscCode = text.toUpperCase();
    setFormData(prev => ({ ...prev, ifsc_code: ifscCode }));

    if (ifscCode.length === 11) {
      validateIFSC(ifscCode);
    } else {
      setIfscValidation(null);
      setActiveStep(0);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.account_holder_name.trim()) {
      newErrors.account_holder_name = 'Account holder name is required';
    }
    if (!formData.account_number.trim()) {
      newErrors.account_number = 'Account number is required';
    } else if (!/^\d+$/.test(formData.account_number)) {
      newErrors.account_number = 'Account number must contain only digits';
    }
    if (!formData.ifsc_code.trim()) {
      newErrors.ifsc_code = 'IFSC code is required';
    } else if (formData.ifsc_code.length !== 11) {
      newErrors.ifsc_code = 'IFSC code must be 11 characters';
    }
    if (ifscValidation && !ifscValidation.is_valid) {
      newErrors.ifsc_code = ifscValidation.message || 'Invalid IFSC code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  const steps = [
    { label: 'Enter IFSC Code', description: 'Enter your 11-digit IFSC code' },
    { label: 'Verify Bank Details', description: 'Review auto-filled bank details' },
    { label: 'Complete Account Info', description: 'Fill in remaining details' }
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {account ? 'Edit Bank Account' : 'Add Bank Account'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {!account && (
              <View style={styles.stepsContainer}>
                {steps.map((step, index) => (
                  <View key={index} style={styles.stepContainer}>
                    <View style={[styles.stepIndicator, activeStep >= index && styles.stepActive]}>
                      <Text style={[styles.stepNumber, activeStep >= index && styles.stepNumberActive]}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepLabel}>{step.label}</Text>
                      <Text style={styles.stepDescription}>{step.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.formContainer}>
              {/* IFSC Code Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>IFSC Code</Text>
                <TextInput
                  style={[styles.input, errors.ifsc_code && styles.inputError]}
                  placeholder="e.g., SBIN0000001"
                  value={formData.ifsc_code}
                  onChangeText={handleIFSCChange}
                  autoCapitalize="characters"
                  maxLength={11}
                  editable={!account}
                />
                {validatingIfsc && (
                  <View style={styles.validationMessage}>
                    <ActivityIndicator size="small" color="#667eea" />
                    <Text style={styles.validationText}>Validating IFSC...</Text>
                  </View>
                )}
                {ifscValidation && !validatingIfsc && (
                  <Text style={[
                    styles.validationMessageText,
                    ifscValidation.is_valid ? styles.successText : styles.errorText
                  ]}>
                    {ifscValidation.message}
                  </Text>
                )}
                {errors.ifsc_code && (
                  <Text style={styles.errorText}>{errors.ifsc_code}</Text>
                )}
              </View>

              {/* Bank Details - Show after IFSC validation */}
              {(ifscValidation?.is_valid || account) && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Bank Name</Text>
                    <TextInput
                      style={[styles.input, styles.readOnlyInput]}
                      value={formData.bank_name}
                      editable={false}
                      placeholder="Auto-filled from IFSC"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Branch Name</Text>
                    <TextInput
                      style={[styles.input, styles.readOnlyInput]}
                      value={formData.branch_name}
                      editable={false}
                      placeholder="Auto-filled from IFSC"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Account Holder Name</Text>
                    <TextInput
                      style={[styles.input, errors.account_holder_name && styles.inputError]}
                      placeholder="Enter account holder name as per bank records"
                      value={formData.account_holder_name}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, account_holder_name: text }))}
                    />
                    {errors.account_holder_name && (
                      <Text style={styles.errorText}>{errors.account_holder_name}</Text>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Account Number</Text>
                    <TextInput
                      style={[styles.input, errors.account_number && styles.inputError]}
                      placeholder="Enter account number"
                      value={formData.account_number}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, account_number: text.replace(/\D/g, '') }))}
                      keyboardType="numeric"
                      maxLength={18}
                    />
                    {errors.account_number && (
                      <Text style={styles.errorText}>{errors.account_number}</Text>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Account Type</Text>
                    <View style={styles.accountTypeContainer}>
                      <TouchableOpacity
                        style={[
                          styles.accountTypeButton,
                          formData.account_type === 'savings' && styles.accountTypeActive
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, account_type: 'savings' }))}
                      >
                        <Ionicons 
                          name="wallet-outline" 
                          size={20} 
                          color={formData.account_type === 'savings' ? '#667eea' : '#666'} 
                        />
                        <Text style={[
                          styles.accountTypeText,
                          formData.account_type === 'savings' && styles.accountTypeTextActive
                        ]}>
                          Savings Account
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.accountTypeButton,
                          formData.account_type === 'current' && styles.accountTypeActive
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, account_type: 'current' }))}
                      >
                        <Ionicons 
                          name="business-outline" 
                          size={20} 
                          color={formData.account_type === 'current' ? '#667eea' : '#666'} 
                        />
                        <Text style={[
                          styles.accountTypeText,
                          formData.account_type === 'current' && styles.accountTypeTextActive
                        ]}>
                          Current Account
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.switchContainer}>
                    <View>
                      <Text style={styles.switchLabel}>Set as Primary Account</Text>
                      <Text style={styles.switchDescription}>
                        Primary account will be used for all payments
                      </Text>
                    </View>
                    <Switch
                      value={formData.is_primary}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, is_primary: value }))}
                      trackColor={{ false: '#E0E0E0', true: '#667eea' }}
                      thumbColor={formData.is_primary ? '#FFF' : '#FFF'}
                    />
                  </View>
                </>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading || (ifscValidation && !ifscValidation.is_valid)}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name={account ? "create-outline" : "add-outline"} size={20} color="#FFF" />
                    <Text style={styles.submitButtonText}>
                      {account ? 'Update Account' : 'Add Account'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ 
  visible, 
  onClose, 
  onConfirm,
  accountNumber 
}: { 
  visible: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
  accountNumber?: string;
}) => {
  const maskedNumber = accountNumber ? `****${accountNumber.slice(-4)}` : '';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.confirmModal}>
          <View style={styles.confirmModalHeader}>
            <Ionicons name="trash-outline" size={32} color="#F44336" />
            <Text style={styles.confirmModalTitle}>Delete Bank Account</Text>
          </View>
          
          <Text style={styles.confirmModalMessage}>
            Are you sure you want to delete the bank account ending with{' '}
            <Text style={styles.accountNumberHighlight}>{maskedNumber}</Text>?
          </Text>
          
          <Text style={styles.confirmModalWarning}>
            This action cannot be undone. You will need to add this account again if you want to use it in the future.
          </Text>
          
          <View style={styles.confirmModalActions}>
            <TouchableOpacity style={styles.confirmCancelButton} onPress={onClose}>
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmDeleteButton} onPress={onConfirm}>
              <Ionicons name="trash-outline" size={18} color="#FFF" />
              <Text style={styles.confirmDeleteText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Info Section Component
const InfoSection = () => {
  return (
    <View style={styles.infoSection}>
      <Text style={styles.infoTitle}>
        <Ionicons name="information-circle-outline" size={24} color="#667eea" />
        Important Information
      </Text>
      
      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <Ionicons name="cash-outline" size={32} color="#4CAF50" />
          <Text style={styles.infoCardTitle}>Payment Process</Text>
          <Text style={styles.infoCardText}>
            Receive payments directly to your verified bank account after campaign completion.
          </Text>
        </View>
        
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={32} color="#2196F3" />
          <Text style={styles.infoCardTitle}>Security Features</Text>
          <Text style={styles.infoCardText}>
            Bank-level encryption, IFSC verification, and secure payment processing.
          </Text>
        </View>
        
        <View style={styles.infoCard}>
          <Ionicons name="document-text-outline" size={32} color="#FF9800" />
          <Text style={styles.infoCardTitle}>Requirements</Text>
          <Text style={styles.infoCardText}>
            Personal savings/current account, valid IFSC code, and matching account holder name.
          </Text>
        </View>
      </View>
    </View>
  );
};

// Main Component
const InfluencerBankAccountScreen = ({ navigation, route }: any) => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [accountStatus, setAccountStatus] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const accounts = await accountAPI.getBankAccounts();
      setBankAccounts(accounts);
    } catch (err: any) {
      console.error('Error loading bank accounts:', err);
      setError(err.message || 'Failed to load bank accounts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadAccountStatus = async () => {
    try {
      const status = await accountAPI.getBankAccountStatus();
      setAccountStatus(status);
    } catch (err) {
      console.error('Error loading account status:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBankAccounts();
      loadAccountStatus();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadBankAccounts();
    loadAccountStatus();
  };

  const handleAddAccount = async (data: CreateBankAccountRequest) => {
    setSubmitting(true);
    try {
      await accountAPI.createBankAccount(data);
      setSuccess('Bank account added successfully');
      setModalVisible(false);
      loadBankAccounts();
      loadAccountStatus();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add bank account');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAccount = async (data: CreateBankAccountRequest) => {
    if (!selectedAccount) return;
    
    setSubmitting(true);
    try {
      await accountAPI.updateBankAccount(selectedAccount._id, data);
      setSuccess('Bank account updated successfully');
      setModalVisible(false);
      loadBankAccounts();
      loadAccountStatus();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update bank account');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;
    
    try {
      await accountAPI.deleteBankAccount(selectedAccount._id);
      setSuccess('Bank account deleted successfully');
      setDeleteModalVisible(false);
      loadBankAccounts();
      loadAccountStatus();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete bank account');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSetPrimary = async (accountId: string) => {
    try {
      await accountAPI.updateBankAccount(accountId, { is_primary: true });
      setSuccess('Primary account updated');
      loadBankAccounts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update primary account');
      setTimeout(() => setError(null), 3000);
    }
  };

  const openAddModal = () => {
    setSelectedAccount(null);
    setModalVisible(true);
  };

  const openEditModal = (account: BankAccount) => {
    setSelectedAccount(account);
    setModalVisible(true);
  };

  const openDeleteModal = (account: BankAccount) => {
    setSelectedAccount(account);
    setDeleteModalVisible(true);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading bank accounts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#667eea']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bank Account Management</Text>
          <Text style={styles.headerSubtitle}>
            Manage your bank accounts for receiving payments from campaigns
          </Text>
        </View>

        {/* Error/Success Messages */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {success && (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.successText}>{success}</Text>
          </View>
        )}

        {/* Stats Cards */}
        {accountStatus && (
          <StatsCard
            hasAccounts={accountStatus.has_accounts}
            accountCount={accountStatus.account_count}
            hasPrimaryAccount={accountStatus.has_primary_account}
          />
        )}

        {/* Add Account Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.addButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="add-outline" size={24} color="#FFF" />
              <Text style={styles.addButtonText}>Add Bank Account</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bank Accounts List */}
        {bankAccounts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No Bank Accounts Added</Text>
            <Text style={styles.emptyText}>
              Add your bank account to start receiving payments from campaigns
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
              <Text style={styles.emptyButtonText}>Add Your First Bank Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.accountsList}>
            {bankAccounts.map((account) => (
              <BankAccountCard
                key={account._id}
                account={account}
                onEdit={() => openEditModal(account)}
                onDelete={() => openDeleteModal(account)}
                onSetPrimary={() => handleSetPrimary(account._id)}
                isOnlyAccount={bankAccounts.length === 1}
              />
            ))}
          </View>
        )}

        {/* Info Section */}
        <InfoSection />
      </ScrollView>

      {/* Add/Edit Bank Account Modal */}
      <BankAccountModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedAccount(null);
        }}
        onSubmit={selectedAccount ? handleUpdateAccount : handleAddAccount}
        account={selectedAccount}
        loading={submitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setSelectedAccount(null);
        }}
        onConfirm={handleDeleteAccount}
        accountNumber={selectedAccount?.account_number}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#F44336',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: '#4CAF50',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 8,
    textAlign: 'center',
  },
  statsValue: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  statsSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    textAlign: 'center',
  },
  addButtonContainer: {
    padding: 16,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  accountsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  accountCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  accountHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountHolderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  accountBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  primaryBadge: {
    backgroundColor: '#667eea20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#667eea',
  },
  accountActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  accountDetails: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  setPrimaryButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  setPrimaryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    marginHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginTop: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  infoSection: {
    margin: 16,
    marginTop: 24,
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 8,
  },
  stepsContainer: {
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    backgroundColor: '#667eea',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  stepNumberActive: {
    color: '#FFF',
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 12,
    color: '#666',
  },
  formContainer: {
    padding: 20,
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
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  inputError: {
    borderColor: '#F44336',
  },
  readOnlyInput: {
    backgroundColor: '#F5F5F5',
    color: '#666',
  },
  validationMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  validationMessageText: {
    fontSize: 12,
    marginTop: 8,
  },
  validationText: {
    fontSize: 12,
    color: '#667eea',
  },
  successText: {
    color: '#4CAF50',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  accountTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  accountTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  accountTypeActive: {
    borderColor: '#667eea',
    backgroundColor: '#667eea10',
  },
  accountTypeText: {
    fontSize: 14,
    color: '#666',
  },
  accountTypeTextActive: {
    color: '#667eea',
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  switchDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModal: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    maxWidth: 320,
  },
  confirmModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  confirmModalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  accountNumberHighlight: {
    fontWeight: 'bold',
    color: '#333',
  },
  confirmModalWarning: {
    fontSize: 12,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmCancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  confirmDeleteButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmDeleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default InfluencerBankAccountScreen;