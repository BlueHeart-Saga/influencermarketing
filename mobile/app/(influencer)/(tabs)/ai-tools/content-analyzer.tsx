import React, { useState, useEffect, useRef } from 'react';
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
  Platform,
  Modal,
  RefreshControl,
  Share,
  Clipboard,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { contentApi, LimitsResponse } from '../../../../services/contentAPI';

const { width } = Dimensions.get('window');
const PRIMARY_BLUE = 'rgb(15, 110, 234)';

interface Platform {
  name: string;
  icon: string;
  color: string;
}

interface PlatformStats {
  length: string;
  hashtags: string;
  bestTime: string;
  tips: string[];
}

const ContentAnalyzer: React.FC = () => {
  const navigation = useNavigation();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Instagram');
  const [content, setContent] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [limits, setLimits] = useState<LimitsResponse | null>(null);
  const [loadingLimits, setLoadingLimits] = useState<boolean>(true);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const [showPlatformTips, setShowPlatformTips] = useState<boolean>(false);
  const [analysisMode, setAnalysisMode] = useState<string>('caption');

  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const platforms: Platform[] = contentApi.getPlatforms();
  const platformStats: PlatformStats = contentApi.getPlatformStats(selectedPlatform);
  const templates = contentApi.getTemplates(selectedPlatform);

  useEffect(() => {
    fetchLimits();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchLimits = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoadingLimits(true);
    }

    try {
      abortControllerRef.current = new AbortController();
      
      // Try cached first
      const cached = await contentApi.getCachedLimits();
      if (cached) {
        setLimits(cached);
      }

      // Fetch fresh
      const limitsData = await contentApi.getContentLimits({
        signal: abortControllerRef.current.signal,
      });
      
      setLimits(limitsData);
      await contentApi.cacheLimits(limitsData);
      
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching limits:', err);
      }
    } finally {
      setLoadingLimits(false);
      setRefreshing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!content.trim()) {
      setError('Please enter some content to analyze');
      return;
    }

    if (limits && !contentApi.canAnalyze(limits.usage_stats)) {
      setError(`Daily limit reached! You've used ${limits.usage_stats.today_usage}/${limits.usage_stats.daily_limit} analyses today. Please upgrade your plan or try again tomorrow.`);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      abortControllerRef.current = new AbortController();
      
      const prompt = `Analyze this social media content for ${selectedPlatform}:

Content: """${content}"""

Please provide:
1. Improved/rewritten version for better engagement
2. 5-10 relevant hashtags
3. 3-5 performance optimization tips
4. Suggested posting time`;

      const response = await contentApi.generateContent(
        {
          prompt,
          mode: analysisMode,
        },
        { signal: abortControllerRef.current.signal }
      );

      if (response.success) {
        setResult(response.result);
        setSuccess(`✨ Analysis complete! ${response.usage.remaining_today} remaining today.`);
        
        // Update local limits
        setLimits(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            usage_stats: {
              ...prev.usage_stats,
              today_usage: response.usage.today_usage,
              remaining_today: response.usage.remaining_today,
            }
          };
        });

        // Scroll to results
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 500);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      
      if (err.message.includes('limit')) {
        setError(err.message);
      } else if (err.message.includes('login')) {
        setError('Please login to use this feature');
      } else {
        setError(err.message || 'Failed to analyze content. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result) {
      try {
        await Clipboard.setString(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setSuccess('Copied to clipboard!');
        setTimeout(() => setSuccess(null), 2000);
      } catch (err) {
        Alert.alert('Error', 'Failed to copy to clipboard');
      }
    }
  };

  const handleShare = async () => {
    if (result) {
      try {
        await Share.share({
          message: result,
          title: 'AI Content Analysis',
        });
      } catch (err) {
        console.error('Share error:', err);
      }
    }
  };

  const handleClear = () => {
    setContent('');
    setResult(null);
    setError(null);
    setSuccess(null);
    setCopied(false);
  };

  const handleRefresh = () => {
    fetchLimits(true);
  };

  const handleUpgrade = () => {
    navigation.navigate('Subscription' as never);
  };

  const applyTemplate = (templateContent: string) => {
    setContent(templateContent);
    setShowTemplates(false);
  };

  const getPlatformColor = (platformName: string): string => {
    const platform = platforms.find(p => p.name === platformName);
    return platform?.color || PRIMARY_BLUE;
  };

  const usagePercentage = limits ? 
    contentApi.getUsagePercentage(limits.usage_stats.today_usage, limits.usage_stats.daily_limit) : 0;
  
  const progressColor = contentApi.getProgressColor(usagePercentage);
  const canAnalyze = limits ? contentApi.canAnalyze(limits.usage_stats) : true;
  const planColor = limits ? 
    contentApi.getPlanColor(limits.plan_type, limits.usage_stats.is_trial) : '#f59e0b';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_BLUE} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#0f6eea" }]}>
  <SafeAreaView>
    <View style={styles.headerContent}>
      

      <View  style={styles.headerTextContainer} >
        <Text onPress={() => navigation.goBack()} style={styles.headerTitle}>AI Content Analyzer</Text>
        <Text style={styles.headerSubtitle}>
          Enhance your social media content with AI-powered suggestions
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => setShowPlatformTips(true)}
        style={styles.infoButton}
      >
        <Icon name="information" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  </SafeAreaView>
</View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Plan Info Card */}
        {limits && (
          <LinearGradient
            colors={['#f8fafc', '#ffffff']}
            style={styles.planCard}
          >
            <View style={styles.planHeader}>
              <View style={styles.planTitleContainer}>
                <Icon name="crown" size={20} color={planColor} />
                <Text style={styles.planName}>{limits.plan}</Text>
              </View>
              <View style={[styles.planBadge, { backgroundColor: planColor }]}>
                <Text style={styles.planBadgeText}>
                  {limits.usage_stats.is_trial ? 'TRIAL' : limits.plan_type.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Usage Progress */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Daily Usage</Text>
                <Text style={[styles.progressValue, { color: progressColor }]}>
                  {limits.usage_stats.today_usage} / {limits.usage_stats.daily_limit}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${usagePercentage}%`,
                      backgroundColor: progressColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.remainingText}>
                {limits.usage_stats.remaining_today} analyses remaining today
              </Text>
            </View>

            {/* Trial Warning */}
            {limits.usage_stats.is_trial && limits.usage_stats.trial_remaining_days > 0 && (
              <View style={styles.trialWarning}>
                <Icon name="alert" size={16} color="#eab308" />
                <Text style={styles.trialWarningText}>
                  {limits.usage_stats.trial_remaining_days} days left in trial. Upgrade to unlock more features.
                </Text>
              </View>
            )}

            {/* Limit Warning */}
            {!canAnalyze && (
              <View style={styles.limitWarning}>
                <Icon name="alert-circle" size={16} color="#ef4444" />
                <Text style={styles.limitWarningText}>
                  Daily limit reached! Upgrade your plan for more analyses.
                </Text>
                <TouchableOpacity
                  style={styles.upgradeSmallButton}
                  onPress={handleUpgrade}
                >
                  <Text style={styles.upgradeSmallText}>Upgrade</Text>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        )}

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

        {/* Platform Selection */}
        <View style={styles.platformCard}>
          <Text style={styles.sectionTitle}>Select Platform</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.platformScroll}
          >
            {platforms.map((platform) => (
              <TouchableOpacity
                key={platform.name}
                style={[
                  styles.platformChip,
                  selectedPlatform === platform.name && styles.platformChipActive,
                  { borderColor: platform.color }
                ]}
                onPress={() => setSelectedPlatform(platform.name)}
              >
                <Icon 
                  name={platform.icon} 
                  size={20} 
                  color={selectedPlatform === platform.name ? '#fff' : platform.color} 
                />
                <Text style={[
                  styles.platformChipText,
                  selectedPlatform === platform.name && styles.platformChipTextActive
                ]}>
                  {platform.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content Input */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputTitle}>
              <Icon name="message-text" size={18} color={PRIMARY_BLUE} /> Your Content
            </Text>
            <View style={styles.inputActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowTemplates(true)}
              >
                <Icon name="file-document-outline" size={18} color="#64748b" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleClear}
                disabled={!content && !result}
              >
                <Icon name="refresh" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>

          <TextInput
            style={styles.textInput}
            placeholder={`Paste your ${selectedPlatform} content here...`}
            placeholderTextColor="#94a3b8"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            editable={!loading && canAnalyze}
          />

          <View style={styles.characterCount}>
            <Text style={styles.characterCountText}>
              {content.length} characters
            </Text>
          </View>

          {/* Platform Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="message-text" size={16} color={PRIMARY_BLUE} />
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{platformStats.length}</Text>
                <Text style={styles.statLabel}>Recommended</Text>
                <Text style={styles.statUnit}>chars</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <Icon name="hash" size={16} color={PRIMARY_BLUE} />
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{platformStats.hashtags}</Text>
                <Text style={styles.statLabel}>Hashtags</Text>
                <Text style={styles.statUnit}>recommended</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <Icon name="clock-outline" size={16} color={PRIMARY_BLUE} />
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{platformStats.bestTime}</Text>
                <Text style={styles.statLabel}>Best Time</Text>
                <Text style={styles.statUnit}>to post</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <Icon name="chart-line" size={16} color={PRIMARY_BLUE} />
              <View style={styles.statContent}>
                <Text style={styles.statValue}>
                  {limits ? contentApi.formatRemaining(limits.usage_stats.remaining_today, limits.usage_stats.daily_limit) : '...'}
                </Text>
                <Text style={styles.statLabel}>Daily Usage</Text>
                <Text style={styles.statUnit}>analyses</Text>
              </View>
            </View>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={[
              styles.generateButton,
              (!content.trim() || loading || !canAnalyze) && styles.generateButtonDisabled,
              { backgroundColor: getPlatformColor(selectedPlatform) }
            ]}
            onPress={handleAnalyze}
            disabled={!content.trim() || loading || !canAnalyze}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="auto-fix" size={18} color="#fff" />
                <Text style={styles.generateButtonText}>
                  {canAnalyze ? 'Analyze Content' : 'Limit Reached'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Upgrade Button if needed */}
          {!canAnalyze && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgrade}
            >
              <Icon name="flash" size={18} color="#fff" />
              <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Results */}
        {result && (
          <View style={styles.resultsCard}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                <Icon name="auto-fix" size={18} color={PRIMARY_BLUE} /> AI Analysis Results
              </Text>
              <View style={styles.resultsActions}>
                <TouchableOpacity
                  style={styles.resultAction}
                  onPress={handleShare}
                >
                  <Icon name="share-variant" size={18} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.resultAction, copied && styles.resultActionCopied]}
                  onPress={handleCopy}
                >
                  <Icon 
                    name={copied ? 'check' : 'content-copy'} 
                    size={18} 
                    color={copied ? '#22c55e' : '#64748b'} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.resultContent}>
              <Text style={styles.resultText}>{result}</Text>
            </View>

            <View style={styles.tipsContainer}>
              {platformStats.tips.slice(0, 3).map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Icon name="check-circle" size={16} color="#22c55e" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Templates Modal */}
      <Modal
        visible={showTemplates}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTemplates(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quick Templates</Text>
              <TouchableOpacity onPress={() => setShowTemplates(false)}>
                <Icon name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {templates.map((template, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.templateItem}
                  onPress={() => applyTemplate(template.content)}
                >
                  <Icon name="file-document-outline" size={20} color={PRIMARY_BLUE} />
                  <View style={styles.templateContent}>
                    <Text style={styles.templateLabel}>{template.label}</Text>
                    <Text style={styles.templatePreview} numberOfLines={2}>
                      {template.content}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Platform Tips Modal */}
      <Modal
        visible={showPlatformTips}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPlatformTips(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedPlatform} Tips</Text>
              <TouchableOpacity onPress={() => setShowPlatformTips(false)}>
                <Icon name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.tipsSection}>
                <Text style={styles.tipsSectionTitle}>Best Practices</Text>
                {platformStats.tips.map((tip, index) => (
                  <View key={index} style={styles.tipDetailItem}>
                    <Icon name="check-circle" size={16} color="#22c55e" />
                    <Text style={styles.tipDetailText}>{tip}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.tipsSection}>
                <Text style={styles.tipsSectionTitle}>Platform Stats</Text>
                <View style={styles.tipStatItem}>
                  <Text style={styles.tipStatLabel}>Recommended Length:</Text>
                  <Text style={styles.tipStatValue}>{platformStats.length} characters</Text>
                </View>
                <View style={styles.tipStatItem}>
                  <Text style={styles.tipStatLabel}>Optimal Hashtags:</Text>
                  <Text style={styles.tipStatValue}>{platformStats.hashtags}</Text>
                </View>
                <View style={styles.tipStatItem}>
                  <Text style={styles.tipStatLabel}>Best Posting Time:</Text>
                  <Text style={styles.tipStatValue}>{platformStats.bestTime}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  headerContent: {
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
  infoButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  planCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  planBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  remainingText: {
    fontSize: 11,
    color: '#64748b',
  },
  trialWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef9c3',
    padding: 10,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  trialWarningText: {
    flex: 1,
    fontSize: 12,
    color: '#854d0e',
  },
  limitWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  limitWarningText: {
    flex: 1,
    fontSize: 12,
    color: '#b91c1c',
  },
  upgradeSmallButton: {
    backgroundColor: '#b91c1c',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  upgradeSmallText: {
    color: '#fff',
    fontSize: 10,
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
  platformCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  platformScroll: {
    flexGrow: 0,
  },
  platformChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
  },
  platformChipActive: {
    backgroundColor: PRIMARY_BLUE,
  },
  platformChipText: {
    fontSize: 12,
    color: '#64748b',
  },
  platformChipTextActive: {
    color: '#fff',
  },
  inputCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inputActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
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
    marginBottom: 6,
  },
  characterCount: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  characterCountText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 48) / 2,
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 9,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 1,
  },
  statUnit: {
    fontSize: 8,
    color: '#94a3b8',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eab308',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 12,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultsActions: {
    flexDirection: 'row',
    gap: 8,
  },
  resultAction: {
    padding: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
  },
  resultActionCopied: {
    backgroundColor: '#dcfce7',
  },
  resultContent: {
    marginBottom: 16,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  tipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tipItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    padding: 8,
    borderRadius: 8,
    gap: 4,
    minWidth: (width - 56) / 2,
  },
  tipText: {
    flex: 1,
    fontSize: 11,
    color: '#0369a1',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalBody: {
    padding: 20,
  },
  templateItem: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  templateContent: {
    flex: 1,
  },
  templateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  templatePreview: {
    fontSize: 12,
    color: '#64748b',
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  tipDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipDetailText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
  },
  tipStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tipStatLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  tipStatValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
});

export default ContentAnalyzer;