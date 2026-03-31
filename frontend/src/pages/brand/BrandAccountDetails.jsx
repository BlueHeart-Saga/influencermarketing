// C:\Sagadevan\quickbox\frontend\src\pages\brand\BrandAccountDetails.jsx
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
  Switch,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Stack,
  Grid
} from '@mui/material';
import {
  AccountBalance,
  Add,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Security,
  VerifiedUser,
  Payment,
  Business,
  Warning,
  AccountBalance as BankIcon,
  Payments,
  Security as SecurityIcon,
  Description,
  Close
} from '@mui/icons-material';
import { accountAPI } from '../../services/api';

const BrandAccountDetails = ({ embedded = false, onClose, onAccountAdded }) => {
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
    account_type: 'current',
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
        setActiveStep(1);
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
      account_type: 'current',
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
      setActiveStep(2);
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
        await accountAPI.updateBankAccount(selectedAccount._id, formData);
        setSuccess('Bank account updated successfully');
      } else {
        await accountAPI.createBankAccount(formData);
        setSuccess('Bank account added successfully');
        // Call the callback when a new account is added
        if (onAccountAdded) {
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

  const content = (
    <Box sx={{ py: embedded ? 2 : 4 }}>
      {/* Header Section - Hide header when embedded since dialog has its own header */}
      {!embedded && (
        <Container maxWidth="xl" sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Business sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Business Bank Account Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your company bank accounts for campaign payments and financial operations
              </Typography>
            </Box>
          </Box>
        </Container>
      )}

      {/* Account Status Summary */}
      {accountStatus && (
        <Container maxWidth="xl" sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  p: 3,
                  backgroundColor: accountStatus.has_accounts ? 'success.main' : 'warning.main',
                  color: 'white',
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  {accountStatus.has_accounts ? '✓ Account Setup Complete' : 'Account Required'}
                </Typography>
                <Typography variant="body2" mt={1}>
                  {accountStatus.account_count} {accountStatus.account_count === 1 ? 'account' : 'accounts'} added
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  p: 3,
                  backgroundColor: accountStatus.has_primary_account ? 'success.main' : 'grey.500',
                  color: 'white',
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  {accountStatus.has_primary_account ? '✓ Primary Account Set' : 'No Primary Account'}
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  p: 3,
                  backgroundColor: 'secondary.main',
                  color: 'white',
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" fontWeight={600} mb={1}>
                  Business Account
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Business fontSize="small" />
                  <Typography variant="body2">Corporate Banking</Typography>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  p: 3,
                  backgroundColor: 'info.main',
                  color: 'white',
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" fontWeight={600} mb={1}>
                  GST Compliance
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Description fontSize="small" />
                  <Typography variant="body2">Business Invoices</Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      )}

      {/* Alerts Section */}
      <Container maxWidth="xl" sx={{ mb: 4 }}>
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
      <Box sx={{ width: '100%', px: embedded ? 2 : { xs: 2, md: 4, lg: 8, xl: 12 } }}>
        {/* Add Account Button Section */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            size="large"
            sx={{ 
              backgroundColor: 'secondary.main',
              '&:hover': { backgroundColor: 'secondary.dark' }
            }}
          >
            Add Business Account
          </Button>
        </Box>

        {/* Bank Accounts List */}
        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <BankIcon />
              Company Bank Accounts
            </Typography>

            {bankAccounts.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center', background: 'grey.50', my: 2, borderRadius: 2 }}>
                <Business sx={{ fontSize: 64, color: 'grey.400', mb: 3 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  No Business Accounts Added
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                  Add your company bank account to manage campaign payments and financial operations
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                  size="large"
                  sx={{ 
                    backgroundColor: 'secondary.main',
                    '&:hover': { backgroundColor: 'secondary.dark' }
                  }}
                >
                  Add Company Bank Account
                </Button>
              </Paper>
            ) : (
              <List sx={{ p: 0 }}>
                {bankAccounts.map((account, index) => (
                  <React.Fragment key={account._id}>
                    <ListItem sx={{ 
                      py: 3, 
                      px: 2,
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}>
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          mb: 2,
                          flexWrap: 'wrap',
                          gap: 2
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
                          
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {!account.is_primary && (
                              <Button
                                size="small"
                                onClick={() => handleSetPrimary(account._id)}
                                variant="outlined"
                                color="secondary"
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

                        <Grid container spacing={3} sx={{ mt: 1 }}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Account Number
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {formatAccountNumber(account.account_number)}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              IFSC Code
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {account.ifsc_code}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Bank & Branch
                            </Typography>
                            <Typography variant="body1">
                              {account.bank_name || 'N/A'}
                              {account.branch_name && (
                                <Typography variant="body2" color="text.secondary">
                                  {account.branch_name}
                                </Typography>
                              )}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Account Type
                            </Typography>
                            <Typography variant="body1" textTransform="capitalize">
                              {account.account_type}
                              <Typography variant="caption" display="block" color="text.secondary">
                                {account.account_type === 'current' ? 'Business Operations' : 'Business Savings'}
                              </Typography>
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </ListItem>
                    {index < bankAccounts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Business Information Grid - Only show when not embedded */}
        {!embedded && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'secondary.main' }}>
                    <Business />
                    Business Features
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">• Multiple account support</Typography>
                    <Typography variant="body2" color="text.secondary">• Campaign payment processing</Typography>
                    <Typography variant="body2" color="text.secondary">• Refund management</Typography>
                    <Typography variant="body2" color="text.secondary">• Financial reporting</Typography>
                    <Typography variant="body2" color="text.secondary">• Bulk payments</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'secondary.main' }}>
                    <AccountBalance />
                    Account Types
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">• Current Accounts (Recommended)</Typography>
                    <Typography variant="body2" color="text.secondary">• Savings Accounts</Typography>
                    <Typography variant="body2" color="text.secondary">• Company name registration</Typography>
                    <Typography variant="body2" color="text.secondary">• GST-compliant payments</Typography>
                    <Typography variant="body2" color="text.secondary">• Business overdraft facility</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'secondary.main' }}>
                    <SecurityIcon />
                    Corporate Security
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">• Enterprise-grade encryption</Typography>
                    <Typography variant="body2" color="text.secondary">• Multi-level verification</Typography>
                    <Typography variant="body2" color="text.secondary">• Audit trail</Typography>
                    <Typography variant="body2" color="text.secondary">• Compliance ready</Typography>
                    <Typography variant="body2" color="text.secondary">• Role-based access control</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'secondary.main' }}>
                    <Payments />
                    Payment Processing
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">• Automated campaign payments</Typography>
                    <Typography variant="body2" color="text.secondary">• Scheduled bulk transfers</Typography>
                    <Typography variant="body2" color="text.secondary">• Real-time transaction tracking</Typography>
                    <Typography variant="body2" color="text.secondary">• Tax invoice generation</Typography>
                    <Typography variant="body2" color="text.secondary">• Multi-currency support</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Business Banking CTA - Only show when not embedded */}
        {!embedded && (
          <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
                <Box>
                  <Typography variant="h5" fontWeight="600" gutterBottom>
                    Need Business Banking Solutions?
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                    Explore business banking services with higher transaction limits, dedicated relationship managers, and corporate banking features tailored for growing businesses.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Payment />}
                  onClick={() => window.open('https://razorpay.com/business-banking', '_blank')}
                  size="large"
                  sx={{ 
                    backgroundColor: 'secondary.main',
                    '&:hover': { backgroundColor: 'secondary.dark' },
                    whiteSpace: 'nowrap'
                  }}
                >
                  Explore Business Banking
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

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
          background: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)',
          color: 'white',
          fontWeight: 700
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Business />
            {selectedAccount ? 'Edit Business Account' : 'Add Business Account'}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {!selectedAccount && (
            <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
              {steps.map((step) => (
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
              />

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
                    label="Account Holder Name (Company Name)"
                    value={formData.account_holder_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, account_holder_name: e.target.value }))}
                    required
                    placeholder="Enter company name as per bank records"
                  />

                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                    <TextField
                      fullWidth
                      label="Account Number"
                      value={formData.account_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value.replace(/\D/g, '') }))}
                      required
                      inputProps={{ maxLength: 18 }}
                      placeholder="Enter company account number"
                    />

                    <FormControl fullWidth>
                      <InputLabel>Account Type</InputLabel>
                      <Select
                        value={formData.account_type}
                        label="Account Type"
                        onChange={(e) => setFormData(prev => ({ ...prev, account_type: e.target.value }))}
                      >
                        <MenuItem value="current">Current Account</MenuItem>
                        <MenuItem value="savings">Savings Account</MenuItem>
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
                        color="secondary"
                      />
                    </Box>
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
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
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
            {selectedAccount ? 'Update Account' : 'Add Business Account'}
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
        <DialogTitle>Delete Business Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the business account ending with{' '}
            <strong>{selectedAccount?.account_number?.slice(-4)}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAccount}
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // If embedded, just return the content
  if (embedded) {
    return content;
  }

  // If not embedded, wrap with Container
  return (
    <Container maxWidth="xl">
      {content}
    </Container>
  );
};

export default BrandAccountDetails;