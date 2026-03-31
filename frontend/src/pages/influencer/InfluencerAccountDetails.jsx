// C:\Sagadevan\quickbox\frontend\src\pages\influencer\InfluencerAccountDetails.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Stack
} from '@mui/material';
import {
  AccountBalance,
  Add,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  AccountBalanceWallet,
  Security,
  VerifiedUser,
  Payment,
  Person,
  Business,
  ArrowRight,
  Info,
  Warning
} from '@mui/icons-material';
import { accountAPI } from '../../services/api';

const InfluencerAccountDetails = ({ onAccountAdded }) => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [ifscValidation, setIfscValidation] = useState(null);
  const [validatingIfsc, setValidatingIfsc] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    branch_name: '',
    account_type: 'savings',
    is_primary: true
  });

  // Load bank accounts and status on component mount
  useEffect(() => {
    loadBankAccounts();
    loadAccountStatus();
  }, []);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await accountAPI.getBankAccounts();
      setBankAccounts(response.data || []);
    } catch (err) {
      setError('Failed to load bank accounts');
      console.error('Error loading bank accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAccountStatus = async () => {
    try {
      const response = await accountAPI.getBankAccountStatus();
      setAccountStatus(response.data);
    } catch (err) {
      console.error('Error loading account status:', err);
    }
  };

  const validateIFSC = async (ifscCode) => {
    if (!ifscCode || ifscCode.length !== 11) return;

    try {
      setValidatingIfsc(true);
      const response = await accountAPI.validateIFSC(ifscCode);
      setIfscValidation(response.data);

      if (response.data.is_valid) {
        setFormData(prev => ({
          ...prev,
          bank_name: response.data.bank_name || '',
          branch_name: response.data.branch_name || ''
        }));
        setActiveStep(1); // Move to next step when IFSC is validated
      }
    } catch (err) {
      console.error('IFSC validation error:', err);
      setIfscValidation({
        is_valid: false,
        message: 'Failed to validate IFSC code'
      });
    } finally {
      setValidatingIfsc(false);
    }
  };

  const handleIFSCChange = (e) => {
    const ifscCode = e.target.value.toUpperCase();
    setFormData(prev => ({ ...prev, ifsc_code: ifscCode }));

    if (ifscCode.length === 11) {
      validateIFSC(ifscCode);
    } else {
      setIfscValidation(null);
      setActiveStep(0);
    }
  };

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
    setSelectedAccount(null);
    setActiveStep(0);
  };

  const handleOpenDialog = (account = null) => {
    if (account) {
      setSelectedAccount(account);
      setFormData({
        account_holder_name: account.account_holder_name,
        account_number: account.account_number,
        ifsc_code: account.ifsc_code,
        bank_name: account.bank_name || '',
        branch_name: account.branch_name || '',
        account_type: account.account_type,
        is_primary: account.is_primary
      });
      setActiveStep(2); // Skip to final step for edits
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleOpenDeleteDialog = (account) => {
    setSelectedAccount(account);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedAccount(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (selectedAccount) {
        // Update existing account
        await accountAPI.updateBankAccount(selectedAccount._id, formData);
        setSuccess('Bank account updated successfully');
      } else {
        // Create new account
        await accountAPI.createBankAccount(formData);
        setSuccess('Bank account added successfully');

        // ✅ IMPORTANT: notify parent (Apply Campaign flow)
        if (typeof onAccountAdded === 'function') {
          onAccountAdded();
        }
      }

      handleCloseDialog();
      loadBankAccounts();
      loadAccountStatus();

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save bank account');
      console.error('Error saving bank account:', err);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await accountAPI.deleteBankAccount(selectedAccount._id);
      setSuccess('Bank account deleted successfully');
      handleCloseDeleteDialog();
      loadBankAccounts();
      loadAccountStatus();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete bank account');
      console.error('Error deleting bank account:', err);
    }
  };

  const handleSetPrimary = async (accountId) => {
    try {
      await accountAPI.updateBankAccount(accountId, { is_primary: true });
      setSuccess('Primary bank account updated');
      loadBankAccounts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update primary account');
      console.error('Error setting primary account:', err);
    }
  };

  const getStatusChip = (account) => {
    if (account.verification_status === 'verified') {
      return (
        <Chip
          icon={<VerifiedUser />}
          label="Verified"
          color="success"
          size="small"
          variant="outlined"
          sx={{ ml: 1 }}
        />
      );
    } else if (account.verification_status === 'failed') {
      return (
        <Chip
          icon={<Cancel />}
          label="Verification Failed"
          color="error"
          size="small"
          variant="outlined"
          sx={{ ml: 1 }}
        />
      );
    } else {
      return (
        <Chip
          icon={<Security />}
          label="Pending Verification"
          color="warning"
          size="small"
          variant="outlined"
          sx={{ ml: 1 }}
        />
      );
    }
  };

  const formatAccountNumber = (accountNumber) => {
    if (!accountNumber) return '';
    return `****${accountNumber.slice(-4)}`;
  };

  const steps = [
    {
      label: 'Enter IFSC Code',
      description: 'Start by entering your 11-digit IFSC code to auto-fill bank details'
    },
    {
      label: 'Verify Bank Details',
      description: 'Review the auto-filled bank and branch information'
    },
    {
      label: 'Complete Account Information',
      description: 'Fill in the remaining account details'
    }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      {/* Header Section */}
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <AccountBalanceWallet sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Bank Account Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your bank accounts for receiving payments from campaigns
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* Account Status Summary */}
      {accountStatus && (
        <Container maxWidth="lg" sx={{ mb: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {/* Account Setup */}
            <Card
              sx={{
                flex: 1,
                p: 3,
                backgroundColor: accountStatus.has_accounts ? 'success.main' : 'warning.main',
                color: 'white',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                {accountStatus.has_accounts ? '✓ Account Setup Complete' : 'Account Required'}
              </Typography>
              <Typography variant="body2" mt={1}>
                {accountStatus.account_count} {accountStatus.account_count === 1 ? 'account' : 'accounts'} added
              </Typography>
            </Card>

            {/* Primary Account */}
            <Card
              sx={{
                flex: 1,
                p: 3,
                backgroundColor: accountStatus.has_primary_account ? 'success.main' : 'grey.500',
                color: 'white',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                {accountStatus.has_primary_account ? '✓ Primary Account Set' : 'No Primary Account'}
              </Typography>
            </Card>

            {/* Influencer Account */}
            <Card
              sx={{
                flex: 1,
                p: 3,
                backgroundColor: 'info.main',
                color: 'white',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={1}>
                Influencer Account
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person fontSize="small" />
                <Typography variant="body2">Personal Banking</Typography>
              </Box>
            </Card>
          </Stack>
        </Container>
      )}

      {/* Alerts Section */}
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }} 
            onClose={() => setError('')}
            icon={<Warning />}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 2 }} 
            onClose={() => setSuccess('')}
            icon={<CheckCircle />}
          >
            {success}
          </Alert>
        )}
      </Container>

      {/* Main Content Area */}
      <Container maxWidth="lg">
        {/* Add Account Button Section */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            size="large"
          >
            Add Bank Account
          </Button>
        </Box>

        {/* Bank Accounts List Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalance />
              Your Bank Accounts
            </Typography>

            {bankAccounts.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center', background: 'grey.50', my: 2 }}>
                <AccountBalance sx={{ fontSize: 64, color: 'grey.400', mb: 3 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  No Bank Accounts Added
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                  Add your bank account to start receiving payments from campaigns
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                  size="large"
                >
                  Add Your First Bank Account
                </Button>
              </Paper>
            ) : (
              <List sx={{ p: 0 }}>
                {bankAccounts.map((account, index) => (
                  <React.Fragment key={account._id}>
                    <ListItem sx={{ py: 3, px: 2 }}>
                      <Box sx={{ width: '100%' }}>
                        {/* Account Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" fontWeight="600">
                              {account.account_holder_name}
                            </Typography>
                            {account.is_primary && (
                              <Chip
                                label="Primary"
                                color="primary"
                                size="small"
                                variant="filled"
                              />
                            )}
                            {getStatusChip(account)}
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {!account.is_primary && (
                              <Button
                                size="small"
                                onClick={() => handleSetPrimary(account._id)}
                                variant="outlined"
                              >
                                Set Primary
                              </Button>
                            )}
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(account)}
                              color="primary"
                            >
                              <Edit />
                            </IconButton>
                            {bankAccounts.length > 1 && (
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDeleteDialog(account)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            )}
                          </Box>
                        </Box>

                        {/* Account Details */}
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Account Number
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {formatAccountNumber(account.account_number)}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              IFSC Code
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {account.ifsc_code}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Bank
                            </Typography>
                            <Typography variant="body1">
                              {account.bank_name || 'N/A'}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Account Type
                            </Typography>
                            <Typography variant="body1" textTransform="capitalize">
                              {account.account_type}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </ListItem>
                    {index < bankAccounts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Information Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Info color="primary" />
              Important Information
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
              {/* Payment Process */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  💰 Payment Process
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  As an influencer, you'll receive payments directly to your verified bank account after campaign completion.
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    • Campaign completion verification
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • 24-48 hour processing time
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Direct bank transfer
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Tax-compliant payments
                  </Typography>
                </Stack>
              </Box>

              {/* Security Features */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🔒 Security Features
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    • Bank-level encryption
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • IFSC code verification
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Secure payment processing
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • PCI DSS compliant
                  </Typography>
                </Stack>
              </Box>

              {/* Requirements */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  📋 Requirements
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    • Personal savings/current account
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Valid IFSC code
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Account holder name match
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Active bank account
                  </Typography>
                </Stack>
              </Box>
            </Box>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              {/* <Button
                variant="outlined"
                startIcon={<Payment />}
                onClick={() => window.open('https://razorpay.com/security', '_blank')}
                size="large"
                sx={{ px: 4 }}
              >
                Learn About Payment Security
              </Button> */}
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Add/Edit Bank Account Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ 
          background: '#2563eb',
          color: 'white',
          fontWeight: 700
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <AccountBalance />
            {selectedAccount ? 'Edit Bank Account' : 'Add Bank Account'}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {!selectedAccount && (
            <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel>{step.label}</StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* IFSC Code Field - Always visible */}
              <TextField
                fullWidth
                label="IFSC Code"
                value={formData.ifsc_code}
                onChange={handleIFSCChange}
                required
                inputProps={{ maxLength: 11, style: { textTransform: 'uppercase' } }}
                placeholder="e.g., SBIN0000001"
                error={ifscValidation && !ifscValidation.is_valid}
                helperText={
                  validatingIfsc ? 'Validating IFSC...' :
                  ifscValidation?.message || 'Enter 11-digit IFSC code'
                }
                FormHelperTextProps={{
                  sx: { 
                    color: ifscValidation?.is_valid ? 'success.main' : 
                          ifscValidation ? 'error.main' : 'text.secondary'
                  }
                }}
              />

              {/* Bank Details - Show after IFSC validation or when editing */}
              {(ifscValidation?.is_valid || selectedAccount) && (
                <>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                    <TextField
                      fullWidth
                      label="Bank Name"
                      value={formData.bank_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                      placeholder="Bank name (auto-filled from IFSC)"
                      InputProps={{ readOnly: !selectedAccount }}
                      variant="filled"
                    />

                    <TextField
                      fullWidth
                      label="Branch Name"
                      value={formData.branch_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, branch_name: e.target.value }))}
                      placeholder="Branch name (auto-filled from IFSC)"
                      InputProps={{ readOnly: !selectedAccount }}
                      variant="filled"
                    />
                  </Box>

                  <TextField
                    fullWidth
                    label="Account Holder Name"
                    value={formData.account_holder_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, account_holder_name: e.target.value }))}
                    required
                    placeholder="Enter account holder name as per bank records"
                  />

                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                    <TextField
                      fullWidth
                      label="Account Number"
                      value={formData.account_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value.replace(/\D/g, '') }))}
                      required
                      inputProps={{ maxLength: 18 }}
                      placeholder="Enter account number"
                    />

                    <FormControl fullWidth>
                      <InputLabel>Account Type</InputLabel>
                      <Select
                        value={formData.account_type}
                        label="Account Type"
                        onChange={(e) => setFormData(prev => ({ ...prev, account_type: e.target.value }))}
                      >
                        <MenuItem value="savings">Savings Account</MenuItem>
                        <MenuItem value="current">Current Account</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <FormControl fullWidth>
                    <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ p: 1 }}>
                      <Typography variant="body1" fontWeight="500">
                        Set as Primary Account
                      </Typography>
                      <Switch
                        checked={formData.is_primary}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_primary: e.target.checked }))}
                        color="primary"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Primary account will be used for all payments
                    </Typography>
                  </FormControl>
                </>
              )}

              {ifscValidation && (
                <Alert 
                  severity={ifscValidation.is_valid ? "success" : "error"}
                  icon={ifscValidation.is_valid ? <CheckCircle /> : <Cancel />}
                >
                  {ifscValidation.message}
                </Alert>
              )}
            </Stack>
          </form>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              !formData.account_holder_name ||
              !formData.account_number ||
              !formData.ifsc_code ||
              (ifscValidation && !ifscValidation.is_valid) ||
              validatingIfsc
            }
            startIcon={selectedAccount ? <Edit /> : <Add />}
          >
            {selectedAccount ? 'Update Account' : 'Add Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Delete Bank Account
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the bank account ending with{' '}
            <strong>{selectedAccount?.account_number?.slice(-4)}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. You will need to add this account again if you want to use it in the future.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAccount}
            startIcon={<Delete />}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InfluencerAccountDetails;