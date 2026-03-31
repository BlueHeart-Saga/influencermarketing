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
  FlatList,
  RefreshControl,
  Share,
  Clipboard,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { contentIntelligenceApi, LimitsResponse } from '../../../../services/contentIntelligenceAPI';

const { width } = Dimensions.get('window');
const PRIMARY_BLUE = 'rgb(15, 110, 234)';

interface HistoryItem {
  id: number;
  prompt: string;
  result: string;
  model: string;
  tokens: number;
  timestamp: string;
}

const ContentIntelligence: React.FC = () => {
  const navigation = useNavigation();
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('command-a-03-2025');
  const [maxTokens, setMaxTokens] = useState(500);
  const [limits, setLimits] = useState<LimitsResponse | null>(null);
  const [loadingLimits, setLoadingLimits] = useState(true);
  const [generationHistory, setGenerationHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const models = contentIntelligenceApi.getAvailableModels();
  const quickPrompts = contentIntelligenceApi.getQuickPrompts();
  const plans = contentIntelligenceApi.getPlans();
  
  const planKey = limits ? contentIntelligenceApi.getPlanKey(limits.subscription_data) : 'trial';
  const planData = plans[planKey] || plans.trial;
  const upgradeRequired = limits ? 
    contentIntelligenceApi.isUpgradeRequired(limits.subscription_data, limits) : false;
  const usagePercentage = limits ? 
    contentIntelligenceApi.getUsagePercentage(
      limits.usage_stats.today_usage, 
      limits.usage_stats.daily_limit
    ) : 0;
  const progressColor = contentIntelligenceApi.getProgressColor(usagePercentage);

  useEffect(() => {
    fetchLimits();
    loadHistory();

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
      const cached = await contentIntelligenceApi.getCachedLimits();
      if (cached) {
        setLimits(cached);
      }

      // Fetch fresh
      const limitsData = await contentIntelligenceApi.getContentLimits({
        signal: abortControllerRef.current.signal,
      });
      
      setLimits(limitsData);
      await contentIntelligenceApi.cacheLimits(limitsData);
      
      // Update max tokens based on plan
      if (limitsData.limits.max_tokens) {
        setMaxTokens(Math.min(maxTokens, limitsData.limits.max_tokens));
      }
      
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching limits:', err);
      }
    } finally {
      setLoadingLimits(false);
      setRefreshing(false);
    }
  };

  const loadHistory = async () => {
    const history = await contentIntelligenceApi.loadGenerationHistory();
    setGenerationHistory(history);
  };

  const saveHistory = async (newHistory: HistoryItem[]) => {
    setGenerationHistory(newHistory);
    await contentIntelligenceApi.saveGenerationHistory(newHistory);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (upgradeRequired) {
      setError('Your trial has expired or limit reached. Please upgrade to continue.');
      return;
    }

    if (limits && limits.usage_stats.remaining_today <= 0) {
      setError(`Daily limit reached! You've used ${limits.usage_stats.today_usage}/${limits.usage_stats.daily_limit} generations today.`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult('');

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await contentIntelligenceApi.generateContent(
        {
          prompt,
          model: selectedModel,
          max_tokens: maxTokens,
        },
        { signal: abortControllerRef.current.signal }
      );

      if (response.success) {
        setResult(response.generated_text);
        setSuccess('✨ Content generated successfully!');
        
        // Save to history
        const newEntry: HistoryItem = {
          id: Date.now(),
          prompt,
          result: response.generated_text,
          model: selectedModel,
          tokens: maxTokens,
          timestamp: new Date().toISOString(),
        };
        
        const updatedHistory = [newEntry, ...generationHistory.slice(0, 9)];
        await saveHistory(updatedHistory);
        
        // Update limits
        setLimits(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            usage_stats: {
              ...prev.usage_stats,
              today_usage: prev.usage_stats.today_usage + 1,
              remaining_today: response.usage.remaining_today,
            }
          };
        });
        
        // Clear prompt
        setPrompt('');
        
        // Scroll to results
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 500);
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      
      if (err.message.includes('limit') || err.message.includes('upgrade')) {
        setError(err.message);
      } else {
        setError(err.message || 'Failed to generate content. Please try again.');
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
          title: 'AI Generated Content',
        });
      } catch (err) {
        console.error('Share error:', err);
      }
    }
  };

  const handleClear = () => {
    setPrompt('');
    setResult('');
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

  const handleRetry = (item: HistoryItem) => {
    setPrompt(item.prompt);
    setSelectedModel(item.model);
    setMaxTokens(item.tokens);
    setShowHistory(false);
  };

  const handleClearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all generation history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await contentIntelligenceApi.clearHistory();
            setGenerationHistory([]);
          },
        },
      ]
    );
  };

  const handleQuickPrompt = (quickPrompt: string) => {
    setPrompt(quickPrompt);
    setShowQuickPrompts(false);
  };

  const getModelById = (modelId: string) => {
    return models.find(m => m.id === modelId) || models[0];
  };

  const currentModel = getModelById(selectedModel);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_BLUE} />
      
      {/* Header */}
      <View style={styles.header}>
  
    <View style={styles.headerContent}>

      

      {/* CENTER TITLE */}
      <View style={styles.headerCenter}>
        <Text onPress={() => navigation.goBack()} style={styles.headerTitle}>Content Intelligence</Text>
        <Text style={styles.headerSubtitle}>
          AI Powered Content Studio
        </Text>
      </View>

      {/* RIGHT ICON */}
      <TouchableOpacity
        onPress={() => setShowHistory(true)}
        style={styles.headerAction}
      >
        <Icon name="history" size={22} color="#fff" />
      </TouchableOpacity>

    </View>
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
                <Icon name="crown" size={20} color={planData.color} />
                <Text style={styles.planName}>{limits.plan}</Text>
              </View>
              <View style={[styles.planBadge, { backgroundColor: planData.badgeColor }]}>
                <Text style={styles.planBadgeText}>
                  {limits.subscription_data.is_trial ? 'TRIAL' : planKey.toUpperCase()}
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
                {limits.usage_stats.remaining_today} generations remaining today
              </Text>
            </View>

            {/* Trial Warning */}
            {limits.subscription_data.is_trial && limits.subscription_data.trial_remaining_days > 0 && (
              <View style={styles.trialWarning}>
                <Icon name="alert" size={16} color="#eab308" />
                <Text style={styles.trialWarningText}>
                  {limits.subscription_data.trial_remaining_days} days left in trial
                </Text>
              </View>
            )}

            {/* Upgrade Warning */}
            {upgradeRequired && (
              <View style={styles.upgradeWarning}>
                <Icon name="alert-circle" size={16} color="#ef4444" />
                <Text style={styles.upgradeWarningText}>
                  {limits.subscription_data.is_trial && limits.subscription_data.trial_remaining_days <= 0
                    ? 'Trial expired. Upgrade to continue.'
                    : 'Daily limit reached. Upgrade for more.'}
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

        {/* Quick Prompts */}
        <View style={styles.quickPromptsCard}>
          <View style={styles.quickPromptsHeader}>
            <Text style={styles.sectionTitle}>
              <Icon name="lightbulb-outline" size={18} color={PRIMARY_BLUE} /> Quick Prompts
            </Text>
            <TouchableOpacity
              onPress={() => setShowQuickPrompts(true)}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Icon name="chevron-right" size={16} color={PRIMARY_BLUE} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.quickPromptsRow}>
              {quickPrompts.slice(0, 5).map((qp, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickPromptChip}
                  onPress={() => handleQuickPrompt(qp)}
                  disabled={upgradeRequired}
                >
                  <Icon name="lightbulb" size={14} color={PRIMARY_BLUE} />
                  <Text style={styles.quickPromptText} numberOfLines={1}>
                    {qp.length > 30 ? qp.substring(0, 30) + '...' : qp}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Input Area */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Your Prompt</Text>
          {upgradeRequired && (
            <View style={styles.upgradeBadge}>
              <Icon name="lock" size={12} color="#fff" />
              <Text style={styles.upgradeBadgeText}>Upgrade Required</Text>
            </View>
          )}

          <TextInput
            style={[styles.textInput, upgradeRequired && styles.textInputDisabled]}
            placeholder="Describe what you want to generate. Be specific for better results..."
            placeholderTextColor="#94a3b8"
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={6}
            editable={!loading && !upgradeRequired}
          />

          <View style={styles.textareaFooter}>
            <Text style={styles.charCount}>{prompt.length} characters</Text>
            <TouchableOpacity
              onPress={() => setPrompt('')}
              style={styles.clearButton}
              disabled={upgradeRequired}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          {/* Model Selection */}
          <View style={styles.modelSelector}>
            <Text style={styles.modelLabel}>AI Model</Text>
            <TouchableOpacity
              style={styles.modelSelectButton}
              onPress={() => setShowModels(true)}
              disabled={upgradeRequired}
            >
              <Text style={styles.modelSelectText}>{currentModel.name}</Text>
              <Icon name="chevron-down" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Token Slider */}
          <View style={styles.tokenSliderContainer}>
            <Text style={styles.tokenLabel}>Max Tokens: {maxTokens}</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderMin}>100</Text>
              <View style={styles.sliderTrack}>
                <View 
                  style={[
                    styles.sliderFill,
                    { 
                      width: `${((maxTokens - 100) / ((limits?.limits.max_tokens || 500) - 100)) * 100}%`,
                      backgroundColor: PRIMARY_BLUE 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.sliderMax}>{limits?.limits.max_tokens || 500}</Text>
            </View>
            <View style={styles.sliderButtons}>
              {[100, 200, 300, 400, 500].map(value => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.sliderButton,
                    maxTokens === value && styles.sliderButtonActive,
                  ]}
                  onPress={() => setMaxTokens(value)}
                  disabled={value > (limits?.limits.max_tokens || 500) || upgradeRequired}
                >
                  <Text style={[
                    styles.sliderButtonText,
                    maxTokens === value && styles.sliderButtonTextActive,
                  ]}>
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={[
              styles.generateButton,
              (loading || !prompt.trim() || upgradeRequired) && styles.generateButtonDisabled,
            ]}
            onPress={handleGenerate}
            disabled={loading || !prompt.trim() || upgradeRequired}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : upgradeRequired ? (
              <>
                <Icon name="lock" size={18} color="#fff" />
                <Text style={styles.generateButtonText}>Upgrade to Generate</Text>
              </>
            ) : (
              <>
                <Icon name="auto-fix" size={18} color="#fff" />
                <Text style={styles.generateButtonText}>Generate Content</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Result */}
        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>
                <Icon name="auto-fix" size={18} color={PRIMARY_BLUE} /> Generated Content
              </Text>
              <View style={styles.resultActions}>
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

            <TouchableOpacity
              style={styles.copyMobileButton}
              onPress={handleCopy}
            >
              <Icon name="content-copy" size={16} color={PRIMARY_BLUE} />
              <Text style={styles.copyMobileText}>
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>
            <Icon name="lightbulb-outline" size={16} color={PRIMARY_BLUE} /> Tips for Better Results
          </Text>
          <View style={styles.tipsList}>
            {[
              'Be specific about tone, style, and length',
              'Include target audience in your prompt',
              'Use bullet points for structured content',
              'Mention if you want SEO-optimized content',
              'Specify the platform (blog, social, email)'
            ].map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* History Modal */}
      <Modal
        visible={showHistory}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generation History</Text>
              <View style={styles.modalHeaderActions}>
                {generationHistory.length > 0 && (
                  <TouchableOpacity
                    onPress={handleClearHistory}
                    style={styles.modalClearButton}
                  >
                    <Icon name="delete" size={20} color="#ef4444" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setShowHistory(false)}>
                  <Icon name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              data={generationHistory}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.historyList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.historyItem}
                  onPress={() => handleRetry(item)}
                >
                  <View style={styles.historyItemHeader}>
                    <Text style={styles.historyItemTime}>
                      {contentIntelligenceApi.formatTime(item.timestamp)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRetry(item)}
                      style={styles.historyRetryButton}
                    >
                      <Icon name="refresh" size={14} color={PRIMARY_BLUE} />
                      <Text style={styles.historyRetryText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.historyItemPrompt} numberOfLines={2}>
                    {item.prompt}
                  </Text>
                  <View style={styles.historyItemMeta}>
                    <Text style={styles.historyItemModel}>{item.model}</Text>
                    <Text style={styles.historyItemTokens}>{item.tokens} tokens</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.historyEmpty}>
                  <Icon name="history" size={48} color="#94a3b8" />
                  <Text style={styles.historyEmptyText}>No generation history yet</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Models Modal */}
      <Modal
        visible={showModels}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModels(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select AI Model</Text>
              <TouchableOpacity onPress={() => setShowModels(false)}>
                <Icon name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={models}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.modelsList}
              renderItem={({ item }) => {
                const isAllowed = limits?.limits.allowed_models.includes(item.id);
                const isSelected = selectedModel === item.id;
                
                return (
                  <TouchableOpacity
                    style={[
                      styles.modelItem,
                      isSelected && styles.modelItemSelected,
                      !isAllowed && styles.modelItemDisabled,
                    ]}
                    onPress={() => {
                      if (isAllowed) {
                        setSelectedModel(item.id);
                        setMaxTokens(Math.min(maxTokens, item.maxTokens));
                        setShowModels(false);
                      }
                    }}
                    disabled={!isAllowed}
                  >
                    <View style={styles.modelItemHeader}>
                      <Text style={[
                        styles.modelItemName,
                        isSelected && styles.modelItemNameSelected,
                      ]}>
                        {item.name}
                      </Text>
                      {!isAllowed && (
                        <View style={styles.modelLockBadge}>
                          <Icon name="lock" size={12} color="#fff" />
                          <Text style={styles.modelLockText}>Upgrade</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.modelItemDescription}>{item.description}</Text>
                    <Text style={styles.modelItemTokens}>Max {item.maxTokens} tokens</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Quick Prompts Modal */}
      <Modal
        visible={showQuickPrompts}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowQuickPrompts(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quick Prompts</Text>
              <TouchableOpacity onPress={() => setShowQuickPrompts(false)}>
                <Icon name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={quickPrompts}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.quickPromptsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.quickPromptItem}
                  onPress={() => handleQuickPrompt(item)}
                >
                  <Icon name="lightbulb" size={20} color={PRIMARY_BLUE} />
                  <Text style={styles.quickPromptItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
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
  header: {
  backgroundColor: "#0f6eea", // ✅ single color
  
},
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

headerCenter: {
  flex: 1,
  // alignItems: "center",
},

headerTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#fff",
},

headerSubtitle: {
  fontSize: 12,
  color: "rgba(255,255,255,0.85)",
  marginTop: 2,
},

headerAction: {
  padding: 6,
},
  historyButton: {
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
  upgradeWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  upgradeWarningText: {
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
  quickPromptsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickPromptsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 12,
    color: PRIMARY_BLUE,
  },
  quickPromptsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickPromptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickPromptText: {
    fontSize: 12,
    color: '#475569',
    maxWidth: 150,
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
    marginBottom: 8,
  },
  upgradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 4,
  },
  upgradeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
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
    marginBottom: 8,
  },
  textInputDisabled: {
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
  },
  textareaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  charCount: {
    fontSize: 11,
    color: '#94a3b8',
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 11,
    color: '#64748b',
  },
  modelSelector: {
    marginBottom: 16,
  },
  modelLabel: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6,
  },
  modelSelectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modelSelectText: {
    fontSize: 14,
    color: '#1e293b',
  },
  tokenSliderContainer: {
    marginBottom: 20,
  },
  tokenLabel: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sliderMin: {
    fontSize: 10,
    color: '#64748b',
    width: 30,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  sliderFill: {
    height: '100%',
    borderRadius: 2,
  },
  sliderMax: {
    fontSize: 10,
    color: '#64748b',
    width: 30,
    textAlign: 'right',
  },
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  sliderButton: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sliderButtonActive: {
    backgroundColor: PRIMARY_BLUE,
    borderColor: PRIMARY_BLUE,
  },
  sliderButtonText: {
    fontSize: 10,
    color: '#64748b',
  },
  sliderButtonTextActive: {
    color: '#fff',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_BLUE,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  generateButtonDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.7,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultActions: {
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
    marginBottom: 12,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  copyMobileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  copyMobileText: {
    fontSize: 13,
    color: PRIMARY_BLUE,
    fontWeight: '500',
  },
  tipsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    gap: 8,
  },
  tipBullet: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
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
  modalHeaderActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  modalClearButton: {
    padding: 4,
  },
  historyList: {
    padding: 16,
  },
  historyItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyItemTime: {
    fontSize: 10,
    color: '#64748b',
  },
  historyRetryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  historyRetryText: {
    fontSize: 10,
    color: PRIMARY_BLUE,
  },
  historyItemPrompt: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  historyItemMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  historyItemModel: {
    fontSize: 10,
    color: PRIMARY_BLUE,
    backgroundColor: `${PRIMARY_BLUE}15`,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  historyItemTokens: {
    fontSize: 10,
    color: '#64748b',
  },
  historyEmpty: {
    alignItems: 'center',
    padding: 40,
  },
  historyEmptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
  },
  modelsList: {
    padding: 16,
  },
  modelItem: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modelItemSelected: {
    borderColor: PRIMARY_BLUE,
    backgroundColor: `${PRIMARY_BLUE}05`,
  },
  modelItemDisabled: {
    opacity: 0.5,
  },
  modelItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modelItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  modelItemNameSelected: {
    color: PRIMARY_BLUE,
  },
  modelLockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  modelLockText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '600',
  },
  modelItemDescription: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  modelItemTokens: {
    fontSize: 10,
    color: PRIMARY_BLUE,
  },
  quickPromptsList: {
    padding: 16,
  },
  quickPromptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickPromptItemText: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b',
  },
});

export default ContentIntelligence;