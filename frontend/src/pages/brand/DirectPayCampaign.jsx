// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Button,
//   Chip,
//   Divider,
//   TextField,
//   CircularProgress,
//   Grid
// } from "@mui/material";
// import { paymentsAPI } from "../../services/paymentAPI"; // you will add this
// import { useParams } from "react-router-dom";

// const DirectPayCampaign = () => {
//   const { campaignId } = useParams();

//   const [loading, setLoading] = useState(true);
//   const [applications, setApplications] = useState([]);
//   const [payingId, setPayingId] = useState(null);
//   const [amount, setAmount] = useState({});

//   useEffect(() => {
//     fetchApplications();
//   }, []);

//   const fetchApplications = async () => {
//     try {
//       setLoading(true);
//       const res = await paymentsAPI.getApplicationsWithAccounts(campaignId);
//       setApplications(res.data.applications || []);
//     } catch (err) {
//       console.error("Failed to load applications", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePay = async (application) => {
//     const influencerId = application.influencer.id;
//     const payAmount = amount[influencerId];

//     if (!payAmount || payAmount <= 0) {
//       alert("Enter valid amount");
//       return;
//     }

//     try {
//       setPayingId(influencerId);

//       await paymentsAPI.directPayInfluencer(
//         campaignId,
//         influencerId,
//         Number(payAmount)
//       );

//       alert("Payment initiated successfully");

//     } catch (err) {
//       alert(err.response?.data?.detail || "Payment failed");
//     } finally {
//       setPayingId(null);
//     }
//   };

//   if (loading) {
//     return (
//       <Box sx={{ p: 4, textAlign: "center" }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: 4 }}>
//       <Typography variant="h5" fontWeight={700} gutterBottom>
//         Direct Pay – Influencer Applications
//       </Typography>

//       <Divider sx={{ mb: 3 }} />

//       {applications.length === 0 && (
//         <Typography>No applications found</Typography>
//       )}

//       <Grid container spacing={2}>
//         {applications.map((app) => {
//           const bank = app.bank_account;
//           const influencerId = app.influencer.id;

//           return (
//             <Grid item xs={12} md={6} key={app.application_id}>
//               <Card variant="outlined">
//                 <CardContent>
//                   <Typography fontWeight={600}>
//                     {app.influencer.name}
//                   </Typography>

//                   <Typography variant="body2" color="text.secondary">
//                     Status: {app.status}
//                   </Typography>

//                   <Box sx={{ mt: 1 }}>
//                     {bank ? (
//                       <>
//                         <Chip
//                           label={bank.verified ? "Bank Verified" : "Bank Not Verified"}
//                           color={bank.verified ? "success" : "warning"}
//                           size="small"
//                           sx={{ mr: 1 }}
//                         />
//                         <Chip
//                           label={`${bank.bank_name} • ****${bank.last4}`}
//                           size="small"
//                         />
//                       </>
//                     ) : (
//                       <Chip label="No Bank Account" color="error" size="small" />
//                     )}
//                   </Box>

//                   <Divider sx={{ my: 2 }} />

//                   <TextField
//                     fullWidth
//                     type="number"
//                     label="Payment Amount"
//                     size="small"
//                     disabled={!bank}
//                     value={amount[influencerId] || ""}
//                     onChange={(e) =>
//                       setAmount({
//                         ...amount,
//                         [influencerId]: e.target.value
//                       })
//                     }
//                   />

//                   <Button
//                     fullWidth
//                     sx={{ mt: 2 }}
//                     variant="contained"
//                     disabled={!bank || payingId === influencerId}
//                     onClick={() => handlePay(app)}
//                   >
//                     {payingId === influencerId ? "Processing..." : "Pay Influencer"}
//                   </Button>
//                 </CardContent>
//               </Card>
//             </Grid>
//           );
//         })}
//       </Grid>
//     </Box>
//   );
// };

// export default DirectPayCampaign;



import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  TextField,
  CircularProgress,
  Grid,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Avatar,
  Tooltip,
  IconButton,
  Stack,
  Badge
} from "@mui/material";
import { paymentsAPI } from "../../services/paymentAPI";
import { useParams } from "react-router-dom";
import { CurrencyContext } from "../../context/CurrencyContext";
import {
  AccountBalance,
  Payment,
  CheckCircle,
  AccountBalanceWallet,
  Refresh,
  Public,
  VerifiedUser,
  ArrowForward,
  Info,
  CreditCard,
  AttachMoney,
  CalendarToday,
  Security
} from "@mui/icons-material";

// Currency symbols mapping
const CURRENCY_SYMBOLS = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  SGD: 'S$',
  HKD: 'HK$',
  KRW: '₩',
  RUB: '₽',
  TRY: '₺',
  BRL: 'R$',
  MXN: '$',
  AED: 'د.إ',
  SAR: 'ر.س',
  ZAR: 'R'
};

// Currency names
const CURRENCY_NAMES = {
  USD: 'US Dollar',
  GBP: 'British Pound',
  EUR: 'Euro',
  JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan',
  INR: 'Indian Rupee',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone',
  DKK: 'Danish Krona',
  SGD: 'Singapore Dollar',
  HKD: 'Hong Kong Dollar',
  KRW: 'South Korean Won',
  RUB: 'Russian Ruble',
  TRY: 'Turkish Lira',
  BRL: 'Brazilian Real',
  MXN: 'Mexican Peso',
  AED: 'UAE Dirham',
  SAR: 'Saudi Riyal',
  ZAR: 'South African Rand'
};

// Popular currencies for quick selection
const POPULAR_CURRENCIES = ['USD', 'GBP', 'EUR', 'JPY', 'CAD', 'AUD', 'INR'];

const DirectPayCampaign = () => {
  const { campaignId } = useParams();
  const { currency, changeCurrency, rates } = useContext(CurrencyContext);

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [payingId, setPayingId] = useState(null);
  const [amount, setAmount] = useState({});
  const [campaignData, setCampaignData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await paymentsAPI.getApplicationsWithAccounts(campaignId);
      setApplications(res.data.applications || []);
      
      // Simulate campaign data - replace with actual API call
      setCampaignData({
        title: `Campaign #${campaignId}`,
        totalBudget: res.data.applications?.reduce((sum, app) => sum + (app.amount || 0), 0) || 0,
        currency: 'USD'
      });
    } catch (err) {
      console.error("Failed to load applications", err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (application) => {
    const influencerId = application.influencer.id;
    const payAmount = amount[influencerId];

    if (!payAmount || payAmount <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }

    try {
      setPayingId(influencerId);
      setError('');

      await paymentsAPI.directPayInfluencer(
        campaignId,
        influencerId,
        Number(payAmount)
      );

      setSuccess(`Payment of ${formatCurrency(payAmount, application.currency || 'USD')} initiated successfully!`);
      
      // Refresh the data
      setTimeout(() => {
        fetchApplications();
        setSuccess('');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.detail || "Payment failed. Please try again.");
    } finally {
      setPayingId(null);
    }
  };

  const formatCurrency = (amount, currencyCode = currency) => {
    if (!amount) return 'N/A';
    const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
    return `${symbol}${Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Calculate converted amount
  const calculateConvertedAmount = (originalAmount, originalCurrency = 'USD') => {
    if (!originalAmount || !rates || !currency) return originalAmount;
    
    if (rates[originalCurrency] && rates[currency]) {
      const amountInGBP = originalAmount / rates[originalCurrency];
      return amountInGBP * rates[currency];
    }
    
    return originalAmount;
  };

  const totalPendingAmount = applications.reduce((sum, app) => {
    const appAmount = app.amount || 0;
    const appCurrency = app.currency || 'USD';
    return sum + calculateConvertedAmount(appAmount, appCurrency);
  }, 0);

  const verifiedApplications = applications.filter(app => app.bank_account?.verified).length;
  const unverifiedApplications = applications.filter(app => !app.bank_account?.verified).length;

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading direct payment dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* PayPal-style Header with Currency Converter */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)',
        p: 4,
        borderRadius: '16px',
        color: 'white',
        mb: 4,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <Box sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
        }} />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h3" component="h1" fontWeight="800" gutterBottom>
                Direct Payment Management
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: '600px' }}>
                Send direct bank transfers to influencers with verified accounts
              </Typography>
              {campaignData && (
                <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
                  Campaign: {campaignData.title}
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchApplications}
              disabled={loading}
              sx={{ 
                borderRadius: '25px', 
                px: 3, 
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              Refresh
            </Button>
          </Box>

          {/* Currency Converter Section */}
          <Box sx={{ 
            mt: 3, 
            p: 3, 
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Currency Converter
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  All amounts will be displayed in your selected currency
                </Typography>
              </Box>
              
              {/* Currency Selection */}
              <Box sx={{ minWidth: 200 }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    <Public style={{ marginRight: 8, fontSize: 14 }} />
                    Display Currency
                  </InputLabel>
                  <Select
                    value={currency}
                    onChange={(e) => changeCurrency(e.target.value)}
                    label="Display Currency"
                    sx={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 300,
                          background: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)',
                          color: 'white',
                        }
                      }
                    }}
                  >
                    {POPULAR_CURRENCIES.map((currencyCode) => (
                      <MenuItem key={currencyCode} value={currencyCode}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight="600">
                            {CURRENCY_SYMBOLS[currencyCode] || currencyCode}
                          </Typography>
                          <Typography variant="body2">
                            {currencyCode}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7, ml: 'auto' }}>
                            {CURRENCY_NAMES[currencyCode]}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              {/* Total Amount Display */}
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Total Pending
                </Typography>
                <Typography variant="h4" fontWeight="800">
                  {formatCurrency(totalPendingAmount, currency)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Across {applications.length} applications
                </Typography>
              </Box>
            </Box>

            {/* Currency Stats */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ 
                  p: 2, 
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Applications
                  </Typography>
                  <Typography variant="h5" fontWeight="700">
                    {applications.length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {verifiedApplications} verified
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ 
                  p: 2, 
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Ready to Pay
                  </Typography>
                  <Typography variant="h5" fontWeight="700">
                    {verifiedApplications}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Verified bank accounts
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ 
                  p: 2, 
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Exchange Rate
                  </Typography>
                  <Typography variant="h5" fontWeight="700">
                    1 GBP = {rates && rates[currency] ? rates[currency].toFixed(2) : '1.00'} {currency}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Live rates from CurrencyContext
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ 
                  p: 2, 
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Selected Currency
                  </Typography>
                  <Typography variant="h5" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {CURRENCY_SYMBOLS[currency] || currency} {currency}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {CURRENCY_NAMES[currency] || 'Selected Currency'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>

      {/* Error and Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Applications Grid */}
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccountBalanceWallet />
        Influencer Applications
        <Chip label={`${applications.length} total`} size="small" color="primary" />
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {applications.length === 0 ? (
        <Box sx={{ p: 8, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
          <AccountBalanceWallet sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No applications found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There are no influencer applications for this campaign yet.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Status Summary */}
          <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={`${verifiedApplications} Verified Accounts`} 
              color="success" 
              icon={<CheckCircle />}
              variant="outlined"
            />
            <Chip 
              label={`${unverifiedApplications} Unverified Accounts`} 
              color="warning" 
              icon={<Info />}
              variant="outlined"
            />
          </Box>

          <Grid container spacing={3}>
            {applications.map((app) => {
              const bank = app.bank_account;
              const influencerId = app.influencer.id;
              const appAmount = app.amount || 0;
              const appCurrency = app.currency || 'USD';
              const convertedAmount = calculateConvertedAmount(appAmount, appCurrency);

              return (
                <Grid item xs={12} md={6} lg={4} key={app.application_id}>
                  <Card 
                    sx={{ 
                      borderRadius: '16px',
                      boxShadow: bank?.verified ? '0 8px 32px rgba(76, 175, 80, 0.15)' : '0 4px 12px rgba(0, 0, 0, 0.08)',
                      border: bank?.verified ? '2px solid #4CAF50' : '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                      }
                    }}
                  >
                    <CardContent>
                      {/* Influencer Info Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: bank?.verified ? 'success.main' : 'warning.main' }}>
                          {app.influencer.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6" fontWeight={600}>
                            {app.influencer.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Chip
                              label={app.status}
                              size="small"
                              color={
                                app.status === 'approved' ? 'success' : 
                                app.status === 'pending' ? 'warning' : 'default'
                              }
                            />
                            {bank?.verified && (
                              <Tooltip title="Verified Bank Account">
                                <VerifiedUser sx={{ fontSize: 16, color: 'success.main' }} />
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      </Box>

                      {/* Bank Account Info */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Bank Account Details
                        </Typography>
                        {bank ? (
                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccountBalance sx={{ fontSize: 16, color: 'primary.main' }} />
                              <Typography variant="body2">
                                {bank.bank_name}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CreditCard sx={{ fontSize: 16, color: 'primary.main' }} />
                              <Typography variant="body2">
                                ****{bank.last4}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <VerifiedUser sx={{ fontSize: 16, color: bank.verified ? 'success.main' : 'warning.main' }} />
                              <Typography variant="body2" color={bank.verified ? 'success.main' : 'warning.main'}>
                                {bank.verified ? 'Verified' : 'Verification Pending'}
                              </Typography>
                            </Box>
                          </Stack>
                        ) : (
                          <Alert severity="error" sx={{ py: 0.5 }}>
                            No bank account added
                          </Alert>
                        )}
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Amount Display */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Payment Amount
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                          <Typography variant="h5" fontWeight="700" color="primary">
                            {formatCurrency(convertedAmount, currency)}
                          </Typography>
                          {appCurrency !== currency && (
                            <Typography variant="caption" color="text.secondary">
                              ({formatCurrency(appAmount, appCurrency)})
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Payment Input */}
                      <TextField
                        fullWidth
                        type="number"
                        label="Enter Payment Amount"
                        size="medium"
                        disabled={!bank?.verified || payingId === influencerId}
                        value={amount[influencerId] || ''}
                        onChange={(e) =>
                          setAmount({
                            ...amount,
                            [influencerId]: e.target.value
                          })
                        }
                        InputProps={{
                          startAdornment: (
                            <AttachMoney sx={{ color: 'text.secondary', mr: 1 }} />
                          )
                        }}
                        sx={{ mb: 2 }}
                      />

                      {/* Pay Button */}
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={!bank?.verified || payingId === influencerId}
                        onClick={() => handlePay(app)}
                        startIcon={payingId === influencerId ? <CircularProgress size={20} color="inherit" /> : <Payment />}
                        endIcon={!payingId && <ArrowForward />}
                        sx={{
                          borderRadius: '12px',
                          py: 1.5,
                          background: bank?.verified 
                            ? 'linear-gradient(135deg, #0066CC 0%, #004499 100%)'
                            : 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)',
                          '&:hover': {
                            background: bank?.verified 
                              ? 'linear-gradient(135deg, #0055AA 0%, #003377 100%)'
                              : 'linear-gradient(135deg, #757575 0%, #616161 100%)'
                          }
                        }}
                      >
                        {payingId === influencerId 
                          ? 'Processing Payment...' 
                          : bank?.verified 
                            ? 'Pay Influencer' 
                            : 'Bank Account Required'
                        }
                      </Button>

                      {!bank?.verified && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          The influencer needs to verify their bank account before payment
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}

      {/* Footer Info */}
      {applications.length > 0 && (
        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security sx={{ fontSize: 16 }} />
            Secure Direct Bank Transfer
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Payments are processed through secure bank transfers directly to verified influencer accounts. 
            All transactions are encrypted and comply with financial regulations.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default DirectPayCampaign;