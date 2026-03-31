// src/pages/influencer/AIHashtag.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Container,
  LinearProgress,
  useTheme,
  Stack,
  IconButton,
  Tooltip,
  Paper,
  Divider
} from '@mui/material';
import {
  ContentCopy,
  AutoAwesome,
  TrendingUp,
  Lock,
  CheckCircle,
  Info,
  Bolt,
  Upgrade
} from '@mui/icons-material';
import { generateHashtags, getHashtagUsage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AIHashtag = () => {
  const [inputText, setInputText] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState(null);
  const [refreshingUsage, setRefreshingUsage] = useState(false);

  const mountedRef = useRef(true);
  const usageTimerRef = useRef(null);

  const { user, subscription, trialExpired } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (usageTimerRef.current) clearTimeout(usageTimerRef.current);
    };
  }, []);

  // Helper: ensure any backend error becomes a safe string
  const formatError = (err) => {
    if (!err) return "An unknown error occurred.";

    // If axios-like response
    const resp = err.response?.data ?? err.data ?? null;

    // FastAPI validation errors: detail is an array of objects
    if (resp?.detail) {
      const detail = resp.detail;
      if (Array.isArray(detail)) {
        // join messages
        const msgs = detail.map(d => d?.msg || JSON.stringify(d)).join("; ");
        return msgs || JSON.stringify(detail);
      }
      if (typeof detail === "string") return detail;
      if (typeof detail === "object") return JSON.stringify(detail);
    }

    // If backend returns a 'message' or 'error'
    if (resp?.message) return resp.message;
    if (resp?.error) return resp.error;

    // If axios error.message present
    if (err.message) return err.message;

    // Fallback stringify
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  };

  // Fetch usage data (defensive)
  const fetchUsage = useCallback(async (signal) => {
    try {
      setRefreshingUsage(true);
      const usageData = await getHashtagUsage({ signal });
      if (!mountedRef.current) return;
      // Ensure expected shape
      setUsage({
        daily_limit: usageData?.daily_limit ?? null,
        requests_used: usageData?.requests_used ?? 0,
        remaining_requests: usageData?.remaining_requests ?? (usageData?.daily_limit ? Math.max((usageData.daily_limit - (usageData.requests_used ?? 0)), 0) : null),
        limit_type: usageData?.limit_type ?? 'daily',
        plan: usageData?.plan ?? null,
        trial_expired: usageData?.trial_expired ?? false
      });
    } catch (err) {
      if (!mountedRef.current) return;
      // swallow network errors quietly but log
      console.error("Error fetching usage:", err);
    } finally {
      if (mountedRef.current) setRefreshingUsage(false);
    }
  }, []);

  // Debounced fetch usage whenever user changes or after generation
  useEffect(() => {
    if (!user) {
      setUsage(null);
      return;
    }
    const controller = new AbortController();
    // small debounce to avoid duplicate calls
    usageTimerRef.current = setTimeout(() => fetchUsage(controller.signal), 200);
    return () => {
      controller.abort();
      if (usageTimerRef.current) clearTimeout(usageTimerRef.current);
    };
  }, [user, fetchUsage]);

  // Check if user can make more requests
  const canMakeRequests = () => {
    if (!usage) return true;
    if (usage.daily_limit === null) return true; // Unlimited
    return (usage.remaining_requests ?? 0) > 0;
  };

  // Check if trial has expired
  const isTrialExpired = () => {
    // prefer usage.trial_expired if backend supplies it; otherwise fallback to context flag
    if (usage?.trial_expired !== undefined) return usage.trial_expired;
    return !!trialExpired;
  };

  // Get usage progress for LinearProgress (0-100)
  const getUsageProgress = () => {
    if (!usage) return 0;
    if (usage.daily_limit === null) return 0;
    const used = usage.requests_used ?? 0;
    const daily = usage.daily_limit ?? 0;
    if (daily === 0) return 0;
    const percent = Math.min(100, Math.round((used / daily) * 100));
    return percent;
  };

  // Remaining requests text
  const getRemainingText = () => {
    if (!usage) return 'Loading...';
    if (usage.daily_limit === null) return 'Unlimited requests available';
    const limitType = usage.limit_type === 'total during trial' ? 'total' : 'today';
    return `${usage.remaining_requests ?? 0} of ${usage.daily_limit} requests remaining ${limitType}`;
  };

  // Get plan name from subscription or usage
  const getPlanName = () => {
    if (usage?.plan) return usage.plan;
    if (!subscription) return 'Free Trial';
    return subscription.plan_name || subscription.plan || 'Free Trial';
  };

  // Generate hashtags action
  const handleGenerate = async () => {
    setError(null);
    setHashtags([]);
    setCopied(false);

    if (!inputText.trim()) {
      setError("Please enter some text to generate hashtags.");
      return;
    }

    if (isTrialExpired()) {
      setError("Your free trial has expired. Please upgrade to continue using AI Hashtag Generator.");
      return;
    }

    if (!canMakeRequests()) {
      const limitType = usage?.limit_type === 'total during trial' ? 'total' : 'daily';
      setError(`${limitType.charAt(0).toUpperCase() + limitType.slice(1)} request limit reached (${usage?.daily_limit ?? '—'}). ${limitType === 'total' ? 'Upgrade to continue.' : 'Please try again tomorrow.'}`);
      return;
    }

    setLoading(true);
    try {
      const res = await generateHashtags({ text: inputText });
      // Expecting { hashtags: [] }
      const tags = res?.hashtags ?? [];
      if (Array.isArray(tags) && tags.length > 0) {
        setHashtags(tags);
        // refresh usage after success
        fetchUsage();
      } else {
        setError("No hashtags generated. Try another text.");
      }
    } catch (err) {
      console.error("Error generating hashtags:", err);
      setError(formatError(err));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  // Copy hashtags to clipboard
  const copyToClipboard = async () => {
    if (hashtags.length === 0) return;
    try {
      await navigator.clipboard.writeText(hashtags.join(" "));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleUpgrade = () => navigate('/influencer/subscription');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h3"
          fontWeight="700"
          gutterBottom
          sx={{
            background: 'linear-gradient(135deg, #3355edff 0%, #283fefff 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            padding: '5px',
            fontSize: { xs: '2rem', md: '3rem' }
          }}
        >
          AI Hashtag Generator
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
          Generate highly relevant hashtags for your social media content
        </Typography>
      </Box>

      {/* Usage Stats Banner */}
      {usage && !isTrialExpired() && (
        <Card sx={{ mb: 4, borderRadius: '12px', overflow: 'hidden' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    {getPlanName()} Plan
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getRemainingText()}
                  </Typography>
                </Box>
                {(subscription?.type === 'trial' || subscription?.type === 'starter') && (
                  <Button
                    variant="contained"
                    onClick={handleUpgrade}
                    startIcon={<Upgrade />}
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #4759e1ff 0%, #4759e1ff 100%)',
                    }}
                  >
                    Upgrade
                  </Button>
                )}
              </Box>

              {usage.daily_limit !== null && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">
                      Requests used: <strong>{usage.requests_used}</strong> / {usage.daily_limit}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(getUsageProgress())}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getUsageProgress()}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: theme.palette.action.hover
                    }}
                    color={getUsageProgress() >= 90 ? 'error' : getUsageProgress() >= 70 ? 'warning' : 'primary'}
                  />
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Trial Expired Warning */}
      {isTrialExpired() && (
        <Alert
          severity="error"
          sx={{ mb: 4, borderRadius: '12px' }}
          action={
            <Button color="inherit" size="small" onClick={handleUpgrade}>
              Upgrade Now
            </Button>
          }
        >
          <Typography variant="body2" fontWeight="600">
            Trial Expired
          </Typography>
          <Typography variant="body2">
            Your free trial has ended. Upgrade to continue using AI Hashtag Generator.
          </Typography>
        </Alert>
      )}

      {/* Main Content Card */}
      <Card sx={{ mb: 4, borderRadius: '12px', overflow: 'hidden' }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={4}>
            {/* Input Section */}
            <Box>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Enter Your Content
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                placeholder="Paste your caption, description, or content here... ✨
Example: 'Beautiful sunset at the beach with friends #summer'"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTrialExpired() || !canMakeRequests()}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
              />
            </Box>

            {/* Generate Button */}
            <Box>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleGenerate}
                disabled={loading || !inputText.trim() || isTrialExpired() || !canMakeRequests()}
                startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
                sx={{
                  py: 2,
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #2940f1ff 0%, #2940f1ff 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2940f1ff 0%, #2940f1ff 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                  },
                  '&:disabled': {
                    background: theme.palette.action.disabled,
                    transform: 'none',
                    boxShadow: 'none',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Generating Hashtags...' : '✨ Generate Hashtags'}
              </Button>
            </Box>

            {/* Error Message */}
            {error && (
              <Alert
                severity="error"
                sx={{ borderRadius: '8px' }}
                action={
                  String(error).toLowerCase().includes('upgrade') && (
                    <Button color="inherit" size="small" onClick={handleUpgrade}>
                      Upgrade
                    </Button>
                  )
                }
              >
                {String(error)}
              </Alert>
            )}

            {/* Limit Reached Warning */}
            {usage && !canMakeRequests() && !isTrialExpired() && (
              <Alert
                severity="warning"
                sx={{ borderRadius: '8px' }}
                icon={<Lock />}
                action={
                  <Button color="inherit" size="small" onClick={handleUpgrade}>
                    Upgrade Plan
                  </Button>
                }
              >
                <Typography variant="body2" fontWeight="600">
                  Request limit reached!
                </Typography>
                <Typography variant="body2">
                  {usage.limit_type === 'total during trial'
                    ? `You've used all ${usage.daily_limit} requests for your trial. Upgrade to continue.`
                    : `You've used all ${usage.daily_limit} requests for today. Upgrade to get more daily requests.`
                  }
                </Typography>
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card sx={{ mb: 4, borderRadius: '12px', overflow: 'hidden' }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="600">
              Generated Hashtags
              {hashtags.length > 0 && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  ({hashtags.length} hashtags)
                </Typography>
              )}
            </Typography>
            {hashtags.length > 0 && (
              <Tooltip title={copied ? "Copied!" : "Copy all hashtags"}>
                <IconButton
                  onClick={copyToClipboard}
                  color={copied ? "success" : "primary"}
                  size="large"
                  sx={{
                    background: copied ? 'rgba(76, 175, 80, 0.1)' : 'rgba(102, 126, 234, 0.1)',
                    '&:hover': {
                      background: copied ? 'rgba(76, 175, 80, 0.2)' : 'rgba(102, 126, 234, 0.2)',
                    }
                  }}
                >
                  {copied ? <CheckCircle /> : <ContentCopy />}
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Results Display */}
          {hashtags.length > 0 ? (
            <Box>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1,
                mb: 3,
                minHeight: 100,
                p: 2,
                borderRadius: '8px',
                border: `1px solid ${theme.palette.divider}`,
                background: theme.palette.background.default
              }}>
                {hashtags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={`${tag}`}
                    variant="outlined"
                    onClick={() => navigator.clipboard.writeText(`${tag}`)}
                    sx={{
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      '&:hover': {
                        background: theme.palette.primary.main,
                        color: 'white',
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </Box>

              {/* Copy Button for Mobile */}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ContentCopy />}
                onClick={copyToClipboard}
                sx={{ display: { xs: 'flex', md: 'none' }, mb: 2 }}
              >
                {copied ? 'Copied to Clipboard!' : 'Copy All Hashtags'}
              </Button>

              {/* Success Message */}
              <Alert 
                severity="success" 
                icon={<CheckCircle />}
                sx={{ borderRadius: '8px' }}
              >
                <Typography variant="body2">
                  Successfully generated {hashtags.length} hashtags! {usage?.remaining_requests !== null && 
                    `You have ${usage.remaining_requests} requests remaining.`
                  }
                </Typography>
              </Alert>
            </Box>
          ) : (
            <Paper
              sx={{
                p: 6,
                textAlign: 'center',
                background: theme.palette.background.default,
                border: `2px dashed ${theme.palette.divider}`,
                borderRadius: '12px'
              }}
            >
              <AutoAwesome sx={{ 
                fontSize: 64, 
                color: 'text.secondary', 
                mb: 2,
                opacity: 0.5
              }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Hashtags Generated Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                {isTrialExpired()
                  ? "Your trial has expired. Upgrade to generate hashtags."
                  : "Enter your content above and click 'Generate Hashtags' to get AI-powered hashtag suggestions for your social media posts."
                }
              </Typography>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Tips & Info Section */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        {/* Tips Card */}
        <Card sx={{ flex: 1, borderRadius: '12px', overflow: 'hidden' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Bolt sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6" fontWeight="600">
                Pro Tips
              </Typography>
            </Box>
            <Stack spacing={1.5}>
              {[
                { tip: "Use specific keywords", desc: "Include specific terms for more relevant hashtags" },
                { tip: "Mix popular & niche", desc: "Combine trending and niche hashtags for better reach" },
                { tip: "Keep it relevant", desc: "Only use hashtags directly related to your content" },
                { tip: "Optimal number", desc: "Use 5-15 hashtags per post for best engagement" },
                { tip: "Research trends", desc: "Check trending hashtags in your niche regularly" }
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Typography variant="body2" sx={{ minWidth: 24, mt: 0.5 }}>•</Typography>
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      {item.tip}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Plan Comparison Card */}
        <Card sx={{ flex: 1, borderRadius: '12px', overflow: 'hidden' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="600">
                Plan Comparison
              </Typography>
            </Box>
            <Stack spacing={2}>
              {[
                { plan: 'Free Trial', limit: '10 total requests', upgrade: false },
                { plan: 'Starter', limit: '10 requests/day', upgrade: true },
                { plan: 'Pro', limit: '30 requests/day', upgrade: true },
                { plan: 'Enterprise', limit: 'Unlimited requests', upgrade: true }
              ].map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    borderRadius: '8px',
                    border: `1px solid ${theme.palette.divider}`,
                    background: item.plan === getPlanName() ? 'rgba(102, 126, 234, 0.05)' : 'transparent',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600">
                        {item.plan}
                        {item.plan === getPlanName() && (
                          <Typography component="span" variant="caption" sx={{ 
                            ml: 1, 
                            px: 1, 
                            py: 0.5, 
                            bgcolor: 'primary.main', 
                            color: 'white', 
                            borderRadius: '4px',
                            fontSize: '0.7rem'
                          }}>
                            Current
                          </Typography>
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.limit}
                      </Typography>
                    </Box>
                    {item.upgrade && item.plan !== getPlanName() && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleUpgrade}
                        sx={{ minWidth: 80 }}
                      >
                        Upgrade
                      </Button>
                    )}
                  </Box>
                </Box>
              ))}
              
              <Button
                fullWidth
                variant="contained"
                onClick={handleUpgrade}
                startIcon={<Upgrade />}
                sx={{
                  mt: 1,
                  background: 'linear-gradient(135deg, #2940f1ff 0%, #2940f1ff 100%)',
                }}
              >
                View All Plans & Pricing
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default AIHashtag;