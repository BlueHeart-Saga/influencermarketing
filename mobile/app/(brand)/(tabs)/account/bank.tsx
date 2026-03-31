import React, { useState, useEffect, useCallback } from 'react';
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
import { useAuth } from '../../../../contexts/AuthContext';
import accountAPI, {
  BankAccount,
  CreateBankAccountRequest,
  IFSCValidationResponse,
  BankAccountStatusResponse,
  maskAccountNumber,
  formatIFSC,
  getAccountTypeLabel,
  getVerificationStatusConfig,
} from '../../../../services/accountAPI';
import { Feather, Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =============================================
// 🎨 STYLED COMPONENTS
// =============================================

const StatusBadge = ({ status }: { status: string }) => {
  const config = getVerificationStatusConfig(status);

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.backgroundColor }]}>
      <Feather name={config.icon as any} size={12} color={config.color} />
      <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const AccountCard = ({ account, onEdit, onDelete, onSetPrimary }: {
  account: BankAccount;
  onEdit: () => void;
  onDelete: () => void;
  onSetPrimary: () => void;
}) => {
  const verificationConfig = getVerificationStatusConfig(account.verification_status);

  return (
    <View style={[styles.accountCard, account.is_primary && styles.primaryCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.bankIcon}>
            <Feather name="home" size={24} color={account.is_primary ? '#0066CC' : '#666'} />
          </View>
          <View>
            <Text style={styles.accountHolderName}>{account.account_holder_name}</Text>
            <Text style={styles.bankName}>{account.bank_name || 'Bank Name'}</Text>
          </View>
        </View>

        <View style={styles.cardHeaderRight}>
          {account.is_primary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryBadgeText}>Primary</Text>
            </View>
          )}
          <StatusBadge status={account.verification_status} />
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Account Number</Text>
          <Text style={styles.detailValue}>{maskAccountNumber(account.account_number)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>IFSC Code</Text>
          <Text style={styles.detailValue}>{formatIFSC(account.ifsc_code)}</Text>
        </View>

        {account.branch_name && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Branch</Text>
            <Text style={styles.detailValue}>{account.branch_name}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Account Type</Text>
          <Text style={styles.detailValue}>{getAccountTypeLabel(account.account_type)}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        {!account.is_primary && (
          <TouchableOpacity style={styles.primaryButton} onPress={onSetPrimary}>
            <Feather name="star" size={16} color="#0066CC" />
            <Text style={styles.primaryButtonText}>Set as Primary</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Feather name="edit-2" size={16} color="#666" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Feather name="trash-2" size={16} color="#ff3b30" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Add/Edit Bank Account Modal
const BankAccountModal = ({
  visible,
  onClose,
  account,
  onSave,
  loading,
}: {
  visible: boolean;
  onClose: () => void;
  account?: BankAccount | null;
  onSave: (data: CreateBankAccountRequest) => void;
  loading: boolean;
}) => {
  const [formData, setFormData] = useState<CreateBankAccountRequest>({
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    branch_name: '',
    account_type: 'current',
    is_primary: true,
  });

  const [ifscValidation, setIfscValidation] = useState<IFSCValidationResponse | null>(null);
  const [validatingIfsc, setValidatingIfsc] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const isEditing = !!account;

  useEffect(() => {
    if (account) {
      setFormData({
        account_holder_name: account.account_holder_name,
        account_number: account.account_number,
        ifsc_code: account.ifsc_code,
        bank_name: account.bank_name || '',
        branch_name: account.branch_name || '',
        account_type: account.account_type,
        is_primary: account.is_primary,
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
      account_type: 'current',
      is_primary: true,
    });
    setIfscValidation(null);
    setActiveStep(0);
  };

  const handleIFSCChange = async (text: string) => {
    const ifscCode = text.toUpperCase();
    setFormData(prev => ({ ...prev, ifsc_code: ifscCode }));

    if (ifscCode.length === 11) {
      setValidatingIfsc(true);
      try {
        const validation = await accountAPI.validateIFSC(ifscCode);
        setIfscValidation(validation);

        if (validation.is_valid) {
          setFormData(prev => ({
            ...prev,
            bank_name: validation.bank_name || '',
            branch_name: validation.branch_name || '',
          }));
          setActiveStep(1);
        }
      } catch (error) {
        console.error('IFSC validation error:', error);
        setIfscValidation({
          is_valid: false,
          message: 'Failed to validate IFSC code',
        });
      } finally {
        setValidatingIfsc(false);
      }
    } else {
      setIfscValidation(null);
      setActiveStep(0);
    }
  };

  const handleSubmit = () => {
    if (!formData.account_holder_name || !formData.account_number || !formData.ifsc_code) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (ifscValidation && !ifscValidation.is_valid) {
      Alert.alert('Error', 'Please enter a valid IFSC code');
      return;
    }

    onSave(formData);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#0066CC', '#004499']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <Feather name="home" size={24} color="#fff" />
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Bank Account' : 'Add Bank Account'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Stepper */}
            {!isEditing && (
              <View style={styles.stepperContainer}>
                <View style={styles.stepContainer}>
                  <View style={[styles.stepCircle, activeStep >= 0 && styles.stepActive]}>
                    <Text style={styles.stepNumber}>1</Text>
                  </View>
                  <Text style={[styles.stepLabel, activeStep >= 0 && styles.stepLabelActive]}>
                    IFSC Code
                  </Text>
                </View>
                <View style={[styles.stepLine, activeStep >= 1 && styles.stepLineActive]} />
                <View style={styles.stepContainer}>
                  <View style={[styles.stepCircle, activeStep >= 1 && styles.stepActive]}>
                    <Text style={styles.stepNumber}>2</Text>
                  </View>
                  <Text style={[styles.stepLabel, activeStep >= 1 && styles.stepLabelActive]}>
                    Bank Details
                  </Text>
                </View>
                <View style={[styles.stepLine, activeStep >= 2 && styles.stepLineActive]} />
                <View style={styles.stepContainer}>
                  <View style={[styles.stepCircle, activeStep >= 2 && styles.stepActive]}>
                    <Text style={styles.stepNumber}>3</Text>
                  </View>
                  <Text style={[styles.stepLabel, activeStep >= 2 && styles.stepLabelActive]}>
                    Complete
                  </Text>
                </View>
              </View>
            )}

            {/* IFSC Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>IFSC Code</Text>
              <TextInput
                style={[styles.input, ifscValidation && !ifscValidation.is_valid && styles.inputError]}
                value={formData.ifsc_code}
                onChangeText={handleIFSCChange}
                placeholder="e.g., SBIN0000001"
                maxLength={11}
                autoCapitalize="characters"
                editable={!isEditing}
              />
              {validatingIfsc && (
                <Text style={styles.helperText}>Validating IFSC...</Text>
              )}
              {ifscValidation && !validatingIfsc && (
                <Text style={[styles.helperText, ifscValidation.is_valid ? styles.successText : styles.errorText]}>
                  {ifscValidation.message}
                </Text>
              )}
            </View>

            {/* Bank Details - Show after IFSC validation or when editing */}
            {(ifscValidation?.is_valid || isEditing) && (
              <>
                <View style={styles.rowInput}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Bank Name</Text>
                    <TextInput
                      style={[styles.input, isEditing ? styles.readOnlyInput : null]}
                      value={formData.bank_name}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, bank_name: text }))}
                      placeholder="Auto-filled from IFSC"
                      editable={!isEditing}
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>Branch Name</Text>
                    <TextInput
                      style={[styles.input, isEditing ? styles.readOnlyInput : null]}
                      value={formData.branch_name}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, branch_name: text }))}
                      placeholder="Auto-filled from IFSC"
                      editable={!isEditing}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Account Holder Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.account_holder_name}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, account_holder_name: text }))}
                    placeholder="Enter company name as per bank records"
                  />
                </View>

                <View style={styles.rowInput}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Account Number</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.account_number}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, account_number: text.replace(/\D/g, '') }))}
                      placeholder="Enter account number"
                      keyboardType="numeric"
                      maxLength={18}
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>Account Type</Text>
                    <View style={styles.typeSelector}>
                      <TouchableOpacity
                        style={[styles.typeOption, formData.account_type === 'current' && styles.typeOptionActive]}
                        onPress={() => setFormData(prev => ({ ...prev, account_type: 'current' }))}
                      >
                        <Text style={[styles.typeOptionText, formData.account_type === 'current' && styles.typeOptionTextActive]}>
                          Current
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.typeOption, formData.account_type === 'savings' && styles.typeOptionActive]}
                        onPress={() => setFormData(prev => ({ ...prev, account_type: 'savings' }))}
                      >
                        <Text style={[styles.typeOptionText, formData.account_type === 'savings' && styles.typeOptionTextActive]}>
                          Savings
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.primarySwitch}>
                  <Text style={styles.primarySwitchLabel}>Set as Primary Account</Text>
                  <TouchableOpacity
                    style={[styles.switch, formData.is_primary && styles.switchActive]}
                    onPress={() => setFormData(prev => ({ ...prev, is_primary: !prev.is_primary }))}
                  >
                    <View style={[styles.switchKnob, formData.is_primary && styles.switchKnobActive]} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {isEditing ? 'Update Account' : 'Add Account'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  account,
  loading,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  account?: BankAccount | null;
  loading: boolean;
}) => {
  if (!account) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.confirmModal}>
          <View style={styles.confirmModalHeader}>
            <Feather name="alert-triangle" size={32} color="#ff3b30" />
            <Text style={styles.confirmModalTitle}>Delete Bank Account</Text>
          </View>

          <Text style={styles.confirmModalText}>
            Are you sure you want to delete the account ending with{' '}
            <Text style={styles.accountNumberHighlight}>
              {maskAccountNumber(account.account_number)}
            </Text>
            ?
          </Text>
          <Text style={styles.confirmModalWarning}>
            This action cannot be undone.
          </Text>

          <View style={styles.confirmModalActions}>
            <TouchableOpacity style={styles.confirmCancelButton} onPress={onClose}>
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmDeleteButton, loading && styles.confirmButtonDisabled]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmDeleteText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Info Card Component
const InfoCard = ({ title, icon, items, color }: {
  title: string;
  icon: string;
  items: string[];
  color: string;
}) => {
  const IconComponent = getIconComponent(icon);

  return (
    <LinearGradient
      colors={[color, color + 'CC']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.infoCard}
    >
      <View style={styles.infoCardHeader}>
        <IconComponent name={icon} size={24} color="#fff" />
        <Text style={styles.infoCardTitle}>{title}</Text>
      </View>
      <View style={styles.infoCardItems}>
        {items.map((item, index) => (
          <View key={index} style={styles.infoCardItem}>
            <Feather name="check-circle" size={14} color="#fff" />
            <Text style={styles.infoCardItemText}>{item}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
};

// Helper function to get icon component
const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    'business': Feather,
    'account-balance': Feather,
    'shield': Feather,
    'credit-card': Feather,
  };
  return icons[iconName] || Feather;
};

// Main Component
const BankAccountScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, token } = useAuth();

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [accountStatus, setAccountStatus] = useState<BankAccountStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(brand)/(tabs)/account");
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [accounts, status] = await Promise.all([
        accountAPI.getBankAccounts(),
        accountAPI.getBankAccountStatus(),
      ]);

      setBankAccounts(accounts || []);
      setAccountStatus(status);

    } catch (err: any) {
      console.error('Error loading bank accounts:', err);
      setError(err.detail || err.message || 'Failed to load bank accounts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setModalVisible(true);
  };

  const handleEditAccount = (account: BankAccount) => {
    setSelectedAccount(account);
    setModalVisible(true);
  };

  const handleDeleteAccount = (account: BankAccount) => {
    setAccountToDelete(account);
    setDeleteModalVisible(true);
  };

  const handleSetPrimary = async (accountId: string) => {
    try {
      await accountAPI.updateBankAccount(accountId, { is_primary: true });
      setSuccessMessage('Primary bank account updated successfully');
      setShowSuccessToast(true);
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.detail || err.message || 'Failed to update primary account');
    }
  };

  const handleSaveAccount = async (formData: CreateBankAccountRequest) => {
    setSaving(true);

    try {
      if (selectedAccount) {
        // Update existing account
        await accountAPI.updateBankAccount(selectedAccount._id, {
          account_holder_name: formData.account_holder_name,
          is_primary: formData.is_primary,
        });
        setSuccessMessage('Bank account updated successfully');
      } else {
        // Create new account
        await accountAPI.createBankAccount(formData);
        setSuccessMessage('Bank account added successfully');
      }

      setModalVisible(false);
      setShowSuccessToast(true);
      loadData();

    } catch (err: any) {
      Alert.alert('Error', err.detail || err.message || 'Failed to save bank account');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;

    setDeleting(true);

    try {
      await accountAPI.deleteBankAccount(accountToDelete._id);
      setSuccessMessage('Bank account deleted successfully');
      setShowSuccessToast(true);
      setDeleteModalVisible(false);
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.detail || err.message || 'Failed to delete bank account');
    } finally {
      setDeleting(false);
      setAccountToDelete(null);
    }
  };

  const stats = {
    totalAccounts: bankAccounts.length,
    primaryAccount: bankAccounts.find(acc => acc.is_primary),
    verifiedAccounts: bankAccounts.filter(acc => acc.verification_status === 'verified').length,
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loaderText}>Loading bank accounts...</Text>
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
          <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.headerBackButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerRefreshButton} onPress={onRefresh}>
              <Feather name="refresh-cw" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View>
            <Text style={styles.headerTitle}>Business Bank Account</Text>
            <Text style={styles.headerSubtitle}>
              Manage your company bank accounts for campaign payments
            </Text>
          </View>
        </LinearGradient>

        {/* Status Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statusCard, styles.statusCardSuccess]}>
            <Text style={styles.statusCardValue}>{stats.totalAccounts}</Text>
            <Text style={styles.statusCardLabel}>Total Accounts</Text>
          </View>

          <View style={[styles.statusCard, stats.primaryAccount ? styles.statusCardSuccess : styles.statusCardWarning]}>
            <Text style={styles.statusCardValue}>
              {stats.primaryAccount ? '✓' : '!'}
            </Text>
            <Text style={styles.statusCardLabel}>
              {stats.primaryAccount ? 'Primary Set' : 'No Primary'}
            </Text>
          </View>

          <View style={[styles.statusCard, styles.statusCardInfo]}>
            <Text style={styles.statusCardValue}>{stats.verifiedAccounts}</Text>
            <Text style={styles.statusCardLabel}>Verified</Text>
          </View>
        </View>

        {/* Add Account Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
            <Feather name="plus" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Business Account</Text>
          </TouchableOpacity>
        </View>

        {/* Bank Accounts List */}
        <View style={styles.accountsContainer}>
          <Text style={styles.sectionTitle}>Company Bank Accounts</Text>

          {bankAccounts.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="home" size={60} color="#ccc" />
              <Text style={styles.emptyTitle}>No Business Accounts Added</Text>
              <Text style={styles.emptyText}>
                Add your company bank account to manage campaign payments and financial operations
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={handleAddAccount}>
                <Text style={styles.emptyButtonText}>Add Business Account</Text>
              </TouchableOpacity>
            </View>
          ) : (
            bankAccounts.map((account) => (
              <AccountCard
                key={account._id}
                account={account}
                onEdit={() => handleEditAccount(account)}
                onDelete={() => handleDeleteAccount(account)}
                onSetPrimary={() => handleSetPrimary(account._id)}
              />
            ))
          )}
        </View>

        {/* Business Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Business Banking Features</Text>

          <View style={styles.infoGrid}>
            <InfoCard
              title="Business Features"
              icon="business"
              color="#3B82F6"
              items={[
                "Multiple account support",
                "Campaign payment processing",
                "Refund management",
                "Financial reporting",
                "Bulk payments",
              ]}
            />

            <InfoCard
              title="Account Types"
              icon="account-balance"
              color="#10B981"
              items={[
                "Current Accounts (Recommended)",
                "Savings Accounts",
                "Company name registration",
                "GST-compliant payments",
                "Business overdraft facility",
              ]}
            />

            <InfoCard
              title="Corporate Security"
              icon="shield"
              color="#8B5CF6"
              items={[
                "Enterprise-grade encryption",
                "Multi-level verification",
                "Audit trail",
                "Compliance ready",
                "Role-based access control",
              ]}
            />

            <InfoCard
              title="Payment Processing"
              icon="credit-card"
              color="#F59E0B"
              items={[
                "Automated campaign payments",
                "Scheduled bulk transfers",
                "Real-time transaction tracking",
                "Tax invoice generation",
                "Multi-currency support",
              ]}
            />
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>

      {/* Add/Edit Account Modal */}
      <BankAccountModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        account={selectedAccount}
        onSave={handleSaveAccount}
        loading={saving}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        account={accountToDelete}
        loading={deleting}
      />

      {/* Success Toast */}
      {showSuccessToast && (
        <View style={styles.toastContainer}>
          <View style={styles.toastContent}>
            <Feather name="check-circle" size={20} color="#10B981" />
            <Text style={styles.toastText}>{successMessage}</Text>
          </View>
        </View>
      )}
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
    paddingTop: 15,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRefreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    maxWidth: '85%',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  statusCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusCardSuccess: {
    backgroundColor: '#10B981',
  },
  statusCardWarning: {
    backgroundColor: '#F59E0B',
  },
  statusCardInfo: {
    backgroundColor: '#3B82F6',
  },
  statusCardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusCardLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
  },
  addButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  accountsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryCard: {
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bankIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountHolderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  bankName: {
    fontSize: 12,
    color: '#666',
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBadge: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
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
  cardDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  primaryButtonText: {
    fontSize: 12,
    color: '#0066CC',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#ff3b30',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
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
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  infoSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  infoGrid: {
    gap: 12,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  infoCardItems: {
    gap: 6,
  },
  infoCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoCardItemText: {
    fontSize: 12,
    color: '#fff',
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  modalBody: {
    padding: 20,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepActive: {
    backgroundColor: '#0066CC',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  stepLabel: {
    fontSize: 10,
    color: '#999',
  },
  stepLabelActive: {
    color: '#0066CC',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#0066CC',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  readOnlyInput: {
    backgroundColor: '#f5f5f5',
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  successText: {
    color: '#10B981',
  },
  errorText: {
    color: '#ff3b30',
  },
  rowInput: {
    flexDirection: 'row',
    gap: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  typeOptionActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#666',
  },
  typeOptionTextActive: {
    color: '#fff',
  },
  primarySwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  primarySwitchLabel: {
    fontSize: 14,
    color: '#333',
  },
  switch: {
    width: 50,
    height: 28,
    backgroundColor: '#e0e0e0',
    borderRadius: 14,
    padding: 2,
  },
  switchActive: {
    backgroundColor: '#0066CC',
  },
  switchKnob: {
    width: 24,
    height: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  switchKnobActive: {
    transform: [{ translateX: 22 }],
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#0066CC',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  confirmModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    alignSelf: 'center',
  },
  confirmModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  confirmModalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  accountNumberHighlight: {
    fontWeight: '600',
    color: '#333',
  },
  confirmModalWarning: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmCancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  confirmCancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#ff3b30',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmDeleteText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  toastContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
});

export default BankAccountScreen;