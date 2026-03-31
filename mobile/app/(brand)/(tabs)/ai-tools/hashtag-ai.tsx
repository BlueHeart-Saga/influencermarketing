import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Clipboard,
  Platform,
  Share,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { hashtagApi } from '../../../../services/hashtagAPI';

const PRIMARY_BLUE = 'rgb(15, 110, 234)';
const PRIMARY_GRADIENT = ['rgb(15, 110, 234)', '#0A4FA0'];

interface UsageData {
  daily_limit: number | null;
  requests_used: number;
  remaining_requests: number | null;
  limit_type: string;
  trial_expired: boolean;
  plan: string;
}

const AIHashtag: React.FC = () => {
  const navigation = useNavigation();
  const [inputText, setInputText] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    fetchUsage();

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchUsage = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoadingUsage(true);
    }

    try {
      // Try to get cached usage first
      const cached = await hashtagApi.getCachedUsage();
      if (cached && mountedRef.current) {
        setUsage(cached);
      }

      // Then fetch fresh data
      abortControllerRef.current = new AbortController();
      const freshUsage = await hashtagApi.getHashtagUsage({
        signal: abortControllerRef.current.signal,
      });

      if (mountedRef.current) {
        setUsage(freshUsage);
        await hashtagApi.cacheUsageData(freshUsage);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && mountedRef.current) {
        console.error('Error fetching usage:', err);
        // Don't show error to user for usage fetch, just use cached if available
      }
    } finally {
      if (mountedRef.current) {
        setLoadingUsage(false);
        setRefreshing(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchUsage(true);
  };

  const canGenerate = (): { can: boolean; reason?: string } => {
    if (!usage) return { can: true }; // Assume can if no usage data yet

    if (usage.trial_expired) {
      return { can: false, reason: 'Your trial has expired. Please upgrade to continue.' };
    }

    if (usage.daily_limit !== null && usage.remaining_requests !== null && usage.remaining_requests <= 0) {
      if (usage.limit_type === 'total during trial') {
        return { can: false, reason: `You've used all ${usage.daily_limit} requests for your trial. Upgrade to continue.` };
      } else {
        return { can: false, reason: `Daily limit of ${usage.daily_limit} requests reached. Try again tomorrow or upgrade.` };
      }
    }

    return { can: true };
  };

  const getUsageProgress = (): number => {
    if (!usage || usage.daily_limit === null) return 0;
    const used = usage.requests_used || 0;
    const daily = usage.daily_limit || 0;
    if (daily === 0) return 0;
    return Math.min(100, Math.round((used / daily) * 100));
  };

  const getRemainingText = (): string => {
    if (!usage) return 'Loading usage data...';
    if (usage.daily_limit === null) return 'Unlimited requests available';
    if (usage.limit_type === 'total during trial') {
      return `${usage.remaining_requests || 0} of ${usage.daily_limit} total requests remaining`;
    }
    return `${usage.remaining_requests || 0} of ${usage.daily_limit} requests remaining today`;
  };

  const handleGenerate = async () => {
    setError(null);
    setSuccess(null);
    setHashtags([]);
    setCopied(false);

    if (!inputText.trim()) {
      setError('Please enter some text to generate hashtags');
      return;
    }

    const { can, reason } = canGenerate();
    if (!can) {
      setError(reason || 'Cannot generate hashtags at this time');
      return;
    }

    setLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await hashtagApi.generateHashtags(
        { text: inputText },
        { signal: abortControllerRef.current.signal }
      );

      if (mountedRef.current) {
        if (response.hashtags && response.hashtags.length > 0) {
          setHashtags(response.hashtags);
          setSuccess(`✨ Generated ${response.hashtags.length} hashtags!`);
          // Refresh usage after successful generation
          fetchUsage();
        } else {
          setError('No hashtags generated. Try different text.');
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && mountedRef.current) {
        console.error('Generation error:', err);
        setError(err.message || 'Failed to generate hashtags. Please try again.');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const copyToClipboard = async () => {
    if (hashtags.length === 0) return;

    const hashtagString = hashtags.join(' ');

    try {
      await Clipboard.setString(hashtagString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Show success message
      setSuccess('Hashtags copied to clipboard!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error('Copy error:', err);
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const shareHashtags = async () => {
    if (hashtags.length === 0) return;

    try {
      await Share.share({
        message: hashtags.join(' '),
        title: 'AI Generated Hashtags',
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const copySingleHashtag = async (tag: string) => {
    try {
      await Clipboard.setString(tag);
      setSuccess(`Copied: ${tag}`);
      setTimeout(() => setSuccess(null), 1500);
    } catch (err) {
      console.error('Copy error:', err);
    }
  };

  const handleUpgrade = () => {
    // Navigate to subscription screen
    navigation.navigate('Subscription' as never);
  };

  const handleClear = () => {
    setInputText('');
    setHashtags([]);
    setError(null);
    setSuccess(null);
  };

  const getPlanName = (): string => {
    if (!usage) return 'Free Trial';
    return usage.plan || 'Free Trial';
  };

  const isTrialExpired = (): boolean => {
    return usage?.trial_expired || false;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_BLUE} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Usage Stats Card */}
        {!loadingUsage && usage && !isTrialExpired() && (
          <LinearGradient
            colors={['#f8fafc', '#ffffff']}
            style={styles.usageCard}
          >
            <View style={styles.usageHeader}>
              <View>
                <Text style={styles.planName}>{getPlanName()} Plan</Text>
                <Text style={styles.remainingText}>{getRemainingText()}</Text>
              </View>
              {getPlanName() !== 'Enterprise' && (
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={handleUpgrade}
                >
                  <Icon name="flash" size={16} color="#fff" />
                  <Text style={styles.upgradeButtonText}>Upgrade</Text>
                </TouchableOpacity>
              )}
            </View>

            {usage.daily_limit !== null && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>
                    {usage.requests_used} / {usage.daily_limit} used
                  </Text>
                  <Text style={styles.progressPercentage}>
                    {getUsageProgress()}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${getUsageProgress()}%`,
                        backgroundColor:
                          getUsageProgress() >= 90
                            ? '#ef4444'
                            : getUsageProgress() >= 70
                              ? '#eab308'
                              : PRIMARY_BLUE,
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </LinearGradient>
        )}

        {/* Trial Expired Warning */}
        {isTrialExpired() && (
          <View style={styles.trialExpiredCard}>
            <Icon name="alert-circle" size={24} color="#ef4444" />
            <View style={styles.trialExpiredContent}>
              <Text style={styles.trialExpiredTitle}>Trial Expired</Text>
              <Text style={styles.trialExpiredText}>
                Your free trial has ended. Upgrade to continue using AI Hashtag Generator.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.trialUpgradeButton}
              onPress={handleUpgrade}
            >
              <Text style={styles.trialUpgradeText}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Input Card */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Enter Your Content</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={6}
            placeholder="Paste your caption, description, or content here... ✨"
            placeholderTextColor="#94a3b8"
            value={inputText}
            onChangeText={setInputText}
            editable={!loading && !isTrialExpired() && (canGenerate().can)}
          />

          <View style={styles.actionButtons}>
            {inputText.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
              >
                <Icon name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.generateButton,
                (!inputText.trim() || loading || !canGenerate().can || isTrialExpired()) &&
                styles.generateButtonDisabled,
              ]}
              onPress={handleGenerate}
              disabled={!inputText.trim() || loading || !canGenerate().can || isTrialExpired()}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="auto-fix" size={20} color="#fff" />
                  <Text style={styles.generateButtonText}>Generate Hashtags</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorCard}>
            <Icon name="alert" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            {error.toLowerCase().includes('upgrade') && (
              <TouchableOpacity
                style={styles.errorAction}
                onPress={handleUpgrade}
              >
                <Text style={styles.errorActionText}>Upgrade</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Success Message */}
        {success && (
          <View style={styles.successCard}>
            <Icon name="check-circle" size={20} color="#22c55e" />
            <Text style={styles.successText}>{success}</Text>
          </View>
        )}

        {/* Limit Reached Warning */}
        {usage && !canGenerate().can && !isTrialExpired() && (
          <View style={styles.limitCard}>
            <Icon name="lock" size={24} color="#eab308" />
            <View style={styles.limitContent}>
              <Text style={styles.limitTitle}>Request limit reached!</Text>
              <Text style={styles.limitText}>
                {usage.limit_type === 'total during trial'
                  ? `You've used all ${usage.daily_limit} requests for your trial. Upgrade to continue.`
                  : `You've used all ${usage.daily_limit} requests for today. Upgrade to get more daily requests.`
                }
              </Text>
            </View>
            <TouchableOpacity
              style={styles.limitButton}
              onPress={handleUpgrade}
            >
              <Text style={styles.limitButtonText}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Results Section */}
        <View style={styles.resultsCard}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              Generated Hashtags
              {hashtags.length > 0 && (
                <Text style={styles.resultsCount}> ({hashtags.length})</Text>
              )}
            </Text>
            {hashtags.length > 0 && (
              <View style={styles.resultsActions}>
                <TouchableOpacity
                  style={styles.actionIcon}
                  onPress={shareHashtags}
                >
                  <Icon name="share-variant" size={20} color={PRIMARY_BLUE} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionIcon, copied && styles.actionIconCopied]}
                  onPress={copyToClipboard}
                >
                  <Icon
                    name={copied ? 'check' : 'content-copy'}
                    size={20}
                    color={copied ? '#22c55e' : PRIMARY_BLUE}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {hashtags.length > 0 ? (
            <>
              <View style={styles.hashtagsContainer}>
                {hashtags.map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.hashtagChip}
                    onPress={() => copySingleHashtag(tag)}
                  >
                    <Text style={styles.hashtagText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.mobileCopyButton}
                onPress={copyToClipboard}
              >
                <Icon name="content-copy" size={18} color={PRIMARY_BLUE} />
                <Text style={styles.mobileCopyText}>
                  {copied ? 'Copied to Clipboard!' : 'Copy All Hashtags'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="auto-fix" size={48} color="#cbd5e1" />
              <Text style={styles.emptyStateTitle}>
                No Hashtags Generated Yet
              </Text>
              <Text style={styles.emptyStateText}>
                {isTrialExpired()
                  ? 'Your trial has expired. Upgrade to generate hashtags.'
                  : 'Enter your content above and tap Generate to get AI-powered hashtag suggestions.'}
              </Text>
            </View>
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Icon name="lightning-bolt" size={20} color="#eab308" />
            <Text style={styles.tipsTitle}>Pro Tips</Text>
          </View>

          <View style={styles.tipsList}>
            {[
              { tip: 'Use specific keywords', desc: 'Include specific terms for more relevant hashtags' },
              { tip: 'Mix popular & niche', desc: 'Combine trending and niche hashtags for better reach' },
              { tip: 'Keep it relevant', desc: 'Only use hashtags directly related to your content' },
              { tip: 'Optimal number', desc: 'Use 5-15 hashtags per post for best engagement' },
            ].map((item, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>{item.tip}</Text>
                  <Text style={styles.tipDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Plan Comparison */}
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <Icon name="trending-up" size={20} color={PRIMARY_BLUE} />
            <Text style={styles.planTitle}>Plan Comparison</Text>
          </View>

          <View style={styles.planList}>
            {[
              { plan: 'Free Trial', limit: '10 total requests', isCurrent: getPlanName() === 'trial' },
              { plan: 'Starter', limit: '10 requests/day', isCurrent: getPlanName() === 'starter' },
              { plan: 'Pro', limit: '30 requests/day', isCurrent: getPlanName() === 'pro' },
              { plan: 'Enterprise', limit: 'Unlimited requests', isCurrent: getPlanName() === 'enterprise' },
            ].map((item, index) => (
              <View
                key={index}
                style={[
                  styles.planItem,
                  item.isCurrent && styles.planItemCurrent,
                ]}
              >
                <View style={styles.planInfo}>
                  <View style={styles.planNameContainer}>
                    <Text style={styles.planItemName}>{item.plan}</Text>
                    {item.isCurrent && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Current</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.planLimit}>{item.limit}</Text>
                </View>
                {!item.isCurrent && item.plan !== 'Free Trial' && (
                  <TouchableOpacity
                    style={styles.planUpgradeButton}
                    onPress={handleUpgrade}
                  >
                    <Text style={styles.planUpgradeText}>Upgrade</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={handleUpgrade}
            >
              <Text style={styles.viewAllButtonText}>View All Plans & Pricing</Text>
              <Icon name="arrow-right" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  headerContent: {
    backgroundColor: "#0f6eea",
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  usageCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  remainingText: {
    fontSize: 13,
    color: '#64748b',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_BLUE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  progressPercentage: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  trialExpiredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 12,
  },
  trialExpiredContent: {
    flex: 1,
  },
  trialExpiredTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b91c1c',
    marginBottom: 2,
  },
  trialExpiredText: {
    fontSize: 12,
    color: '#b91c1c',
  },
  trialUpgradeButton: {
    backgroundColor: '#b91c1c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  trialUpgradeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  inputCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1e293b',
    textAlignVertical: 'top',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  generateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_BLUE,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  generateButtonDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.5,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
    flexWrap: 'wrap',
  },
  errorText: {
    flex: 1,
    color: '#b91c1c',
    fontSize: 14,
  },
  errorAction: {
    backgroundColor: '#b91c1c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  errorActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    color: '#166534',
    fontSize: 14,
    flex: 1,
  },
  limitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef9c3',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
    flexWrap: 'wrap',
  },
  limitContent: {
    flex: 1,
  },
  limitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#854d0e',
    marginBottom: 2,
  },
  limitText: {
    fontSize: 12,
    color: '#854d0e',
  },
  limitButton: {
    backgroundColor: '#854d0e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  limitButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  resultsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  resultsCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '400',
  },
  resultsActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIcon: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  actionIconCopied: {
    backgroundColor: '#dcfce7',
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    minHeight: 80,
  },
  hashtagChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  hashtagText: {
    fontSize: 13,
    color: PRIMARY_BLUE,
    fontWeight: '500',
  },
  mobileCopyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginTop: 8,
  },
  mobileCopyText: {
    fontSize: 14,
    color: PRIMARY_BLUE,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  tipsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    gap: 8,
  },
  tipBullet: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  tipDesc: {
    fontSize: 12,
    color: '#64748b',
  },
  planCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  planList: {
    gap: 8,
  },
  planItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  planItemCurrent: {
    backgroundColor: 'rgba(15, 110, 234, 0.05)',
    borderColor: PRIMARY_BLUE,
  },
  planInfo: {
    flex: 1,
  },
  planNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  planItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  currentBadge: {
    backgroundColor: PRIMARY_BLUE,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  planLimit: {
    fontSize: 12,
    color: '#64748b',
  },
  planUpgradeButton: {
    backgroundColor: PRIMARY_BLUE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  planUpgradeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PRIMARY_BLUE,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  viewAllButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AIHashtag;