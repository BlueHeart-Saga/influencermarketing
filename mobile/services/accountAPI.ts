import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

const BASE_URL = `${API_BASE_URL}/api/account`;

// ======================================================
// 🔐 AUTH HELPERS
// ======================================================
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleError = (err: any) => {
  console.error('Account API Error:', err.response?.data || err.message);
  const errorData = err.response?.data || { error: err.message };
  throw errorData;
};

const request = async (method: string, url: string, data?: any, params?: any) => {
  try {
    const headers = await getAuthHeader();
    
    const res = await axios({
      method,
      url: `${BASE_URL}${url}`,
      data,
      params,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// ======================================================
// 📊 BANK ACCOUNT TYPES
// ======================================================
export interface BankAccount {
  _id: string;
  user_id: string;
  user_role: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name?: string;
  branch_name?: string;
  account_type: 'savings' | 'current';
  is_primary: boolean;
  is_verified: boolean;
  verification_status: 'pending' | 'verified' | 'failed';
  bank_details?: {
    center?: string;
    district?: string;
    state?: string;
    contact?: string;
    bank_code?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateBankAccountRequest {
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name?: string;
  branch_name?: string;
  account_type: 'savings' | 'current';
  is_primary: boolean;
}

export interface UpdateBankAccountRequest {
  account_holder_name?: string;
  is_primary?: boolean;
}

export interface IFSCValidationResponse {
  is_valid: boolean;
  bank_name?: string;
  branch_name?: string;
  bank_code?: string;
  ifsc_code?: string;
  center?: string;
  district?: string;
  state?: string;
  contact?: string;
  message?: string;
}

export interface BankAccountStatusResponse {
  has_accounts: boolean;
  account_count: number;
  has_primary_account: boolean;
  primary_account?: BankAccount;
}

export interface CreateBankAccountResponse {
  success: boolean;
  message: string;
  bank_account: BankAccount;
  ifsc_validation: IFSCValidationResponse;
}

// ======================================================
// 🚀 BANK ACCOUNT API METHODS
// ======================================================

/**
 * Get all bank accounts for current user
 */
export const getBankAccounts = async (): Promise<BankAccount[]> => {
  return request('get', '/bank-accounts');
};

/**
 * Get primary bank account for current user
 */
export const getPrimaryBankAccount = async (): Promise<BankAccount> => {
  return request('get', '/bank-accounts/primary');
};

/**
 * Create a new bank account
 */
export const createBankAccount = async (
  data: CreateBankAccountRequest
): Promise<CreateBankAccountResponse> => {
  return request('post', '/bank-accounts', data);
};

/**
 * Update bank account details
 */
export const updateBankAccount = async (
  accountId: string,
  data: UpdateBankAccountRequest
): Promise<{ success: boolean; message: string }> => {
  return request('put', `/bank-accounts/${accountId}`, data);
};

/**
 * Delete a bank account
 */
export const deleteBankAccount = async (
  accountId: string
): Promise<{ success: boolean; message: string }> => {
  return request('delete', `/bank-accounts/${accountId}`);
};

/**
 * Validate IFSC code
 */
export const validateIFSC = async (ifscCode: string): Promise<IFSCValidationResponse> => {
  return request('get', `/validate-ifsc/${ifscCode}`);
};

/**
 * Get bank account status
 */
export const getBankAccountStatus = async (): Promise<BankAccountStatusResponse> => {
  return request('get', '/bank-accounts/status');
};

/**
 * Get influencer account summary (for payment processing)
 */
export const getInfluencerAccountSummary = async (userId: string): Promise<any> => {
  return request('get', `/user/${userId}/account-summary`);
};

// Admin endpoints (for admin users only)
export const getAllBankAccountsAdmin = async (): Promise<BankAccount[]> => {
  return request('get', '/all-bank-accounts');
};

export const getUserBankAccountsAdmin = async (userId: string): Promise<BankAccount[]> => {
  return request('get', `/user/${userId}/bank-accounts`);
};

export const getBankAccountsByRole = async (role: 'influencer' | 'brand'): Promise<BankAccount[]> => {
  return request('get', `/bank-accounts/by-role/${role}`);
};

export const suspendUser = async (userId: string): Promise<{ success: boolean; message: string }> => {
  return request('put', `/suspend-user/${userId}`);
};

export const unsuspendUser = async (userId: string): Promise<{ success: boolean; message: string }> => {
  return request('put', `/unsuspend-user/${userId}`);
};

export const generateUserReport = async (): Promise<any[]> => {
  return request('get', '/report/all-users');
};

export const exportUserReportCSV = async (): Promise<{ content: string; filename: string }> => {
  const response = await fetch(`${BASE_URL}/report/all-users/csv`, {
    headers: await getAuthHeader(),
  });
  
  const text = await response.text();
  return {
    content: text,
    filename: `users_bank_report_${new Date().toISOString().slice(0, 10)}.csv`,
  };
};

// ======================================================
// 📱 HELPER FUNCTIONS
// ======================================================

/**
 * Mask account number for display
 */
export const maskAccountNumber = (accountNumber?: string): string => {
  if (!accountNumber) return '****';
  return `****${accountNumber.slice(-4)}`;
};

/**
 * Format IFSC code for display
 */
export const formatIFSC = (ifscCode?: string): string => {
  if (!ifscCode) return '';
  return ifscCode.toUpperCase();
};

/**
 * Get account type label
 */
export const getAccountTypeLabel = (accountType: 'savings' | 'current'): string => {
  return accountType === 'current' ? 'Current Account' : 'Savings Account';
};

/**
 * Get verification status config
 */
export const getVerificationStatusConfig = (status: string): {
  color: string;
  backgroundColor: string;
  label: string;
  icon: string;
} => {
  const configs: Record<string, any> = {
    verified: {
      color: '#10B981',
      backgroundColor: '#D1FAE5',
      label: 'Verified',
      icon: 'check-circle',
    },
    pending: {
      color: '#F59E0B',
      backgroundColor: '#FEF3C7',
      label: 'Pending Verification',
      icon: 'clock',
    },
    failed: {
      color: '#EF4444',
      backgroundColor: '#FEE2E2',
      label: 'Verification Failed',
      icon: 'alert-circle',
    },
  };
  
  return configs[status] || configs.pending;
};

// ======================================================
// 📦 EXPORT
// ======================================================
const accountAPI = {
  getBankAccounts,
  getPrimaryBankAccount,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  validateIFSC,
  getBankAccountStatus,
  getInfluencerAccountSummary,
  getAllBankAccountsAdmin,
  getUserBankAccountsAdmin,
  getBankAccountsByRole,
  suspendUser,
  unsuspendUser,
  generateUserReport,
  exportUserReportCSV,
  maskAccountNumber,
  formatIFSC,
  getAccountTypeLabel,
  getVerificationStatusConfig,
};

export default accountAPI;