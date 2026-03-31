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
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { imageApi, UsageResponse } from '../../../../services/imageAPI';

const { width } = Dimensions.get('window');
const PRIMARY_BLUE = 'rgb(15, 110, 234)';
const PRIMARY_GRADIENT = ['rgb(15, 110, 234)', '#0A4FA0'];

// Suggestion prompts
const SUGGESTIONS = [
  { label: 'Dragon', prompt: 'A majestic dragon flying over mountains at sunset, digital art' },
  { label: 'Fantasy', prompt: 'A magical forest with glowing mushrooms and fairies' },
  { label: 'Cyberpunk', prompt: 'A futuristic city with neon lights and flying cars, cyberpunk style' },
  { label: 'Space', prompt: 'Astronaut riding a horse on Mars, surreal art' },
  { label: 'Portrait', prompt: 'Beautiful portrait of an elven warrior, fantasy art' },
  { label: 'Landscape', prompt: 'Serene Japanese temple surrounded by cherry blossoms' },
];

const ImageCraftAI: React.FC = () => {
  const navigation = useNavigation();
  const [prompt, setPrompt] = useState('');
  const [numImages, setNumImages] = useState(4);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [canGenerate, setCanGenerate] = useState(true);
  const [canGenerateCheck, setCanGenerateCheck] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchUsageData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (prompt && numImages > 0) {
      checkGenerationLimit();
    }
  }, [prompt, numImages]);

  const fetchUsageData = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoadingUsage(true);
    }

    try {
      abortControllerRef.current = new AbortController();
      
      // Try to get cached status first
      const cached = await imageApi.getCachedGenerationStatus();
      if (cached) {
        setCanGenerate(cached.canGenerate);
      }

      // Fetch fresh usage data
      const usageData = await imageApi.getImageUsage({
        signal: abortControllerRef.current.signal,
      });
      
      setUsage(usageData);
      await imageApi.cacheUsageData(usageData);

      // Fetch usage history
      const historyData = await imageApi.getUsageHistory(10, 7, {
        signal: abortControllerRef.current.signal,
      });
      setUsageHistory(historyData.recent_usage || []);

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching usage:', err);
      }
    } finally {
      setLoadingUsage(false);
      setRefreshing(false);
    }
  };

  const checkGenerationLimit = async () => {
    try {
      abortControllerRef.current = new AbortController();
      const check = await imageApi.canGenerateImages(numImages, {
        signal: abortControllerRef.current.signal,
      });
      setCanGenerateCheck(check);
      setCanGenerate(check.can_generate);
      
      if (!check.can_generate) {
        setError(check.message);
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Error checking limit:', err);
      setCanGenerate(true); // Default to true if check fails
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (!canGenerate) {
      setError(canGenerateCheck?.message || 'Cannot generate images at this time');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setImages([]);

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await imageApi.generateImages(
        {
          prompt: prompt.trim(),
          num_images: numImages,
        },
        { signal: abortControllerRef.current.signal }
      );

      if (response.images && response.images.length > 0) {
        setImages(response.images);
        setSuccess(`✨ Generated ${response.images.length} images! ${response.usage_info.remaining} remaining today.`);
        
        // Update usage state
        setUsage(prev => ({
          ...prev!,
          usage: {
            ...prev!.usage,
            today_used: response.usage_info.today_used,
          },
          remaining: {
            daily: response.usage_info.remaining,
            reset_in: response.usage_info.reset_time,
          },
        }));

        // Scroll to results
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 500);
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      
      if (err.message.includes('402') || err.message.includes('payment')) {
        setError('Daily limit reached. Consider upgrading your plan.');
      } else if (err.message.includes('403')) {
        setError('You don\'t have permission to generate images.');
      } else {
        setError(err.message || 'Failed to generate images. Please try again.');
      }
    } finally {
      setLoading(false);
      // Refresh usage after generation
      setTimeout(() => fetchUsageData(), 2000);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    setDownloading(index);
    try {
      await imageApi.downloadImage(imageUrl, `ai-image-${Date.now()}-${index}.jpg`);
      setSuccess(`✅ Image ${index + 1} downloaded successfully!`);
    } catch (err: any) {
      Alert.alert('Download Failed', err.message || 'Failed to download image');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAll = async () => {
    setDownloading(-1); // Special value for "all"
    try {
      for (let i = 0; i < images.length; i++) {
        await imageApi.downloadImage(images[i], `ai-image-${Date.now()}-${i}.jpg`);
        if (i < images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Stagger downloads
        }
      }
      setSuccess(`✅ Downloaded all ${images.length} images!`);
    } catch (err: any) {
      Alert.alert('Download Failed', err.message || 'Failed to download some images');
    } finally {
      setDownloading(null);
    }
  };

  const handleShare = async (imageUrl: string) => {
    try {
      await imageApi.shareImage(imageUrl);
    } catch (err: any) {
      Alert.alert('Share Failed', err.message || 'Failed to share image');
    }
  };

  const handleShareAll = async () => {
    try {
      await imageApi.shareMultipleImages(images);
    } catch (err: any) {
      Alert.alert('Share Failed', err.message || 'Failed to share images');
    }
  };

  const handleRefresh = () => {
    fetchUsageData(true);
  };

  const handleClear = () => {
    setPrompt('');
    setImages([]);
    setError(null);
    setSuccess(null);
  };

  const handleUpgrade = () => {
    // Navigate to subscription screen
    navigation.navigate('Subscription' as never);
  };

  const getUsagePercentage = (): number => {
    return imageApi.getUsagePercentage(usage);
  };

  const getRemainingText = (): string => {
    return imageApi.getRemainingText(usage);
  };

  const getPlanTier = (): string => {
    return imageApi.getPlanTier(usage);
  };

  const planFeatures = usage ? imageApi.getPlanFeatures(usage) : [];
  const upgradeMessage = usage ? imageApi.getUpgradeMessage(usage) : null;
  const planTier = getPlanTier();
  const usagePercentage = getUsagePercentage();
  const remainingText = getRemainingText();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_BLUE} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#0f6eea" }]}>
  
    <View style={styles.headerContent}>
      
      

      <View style={styles.headerTextContainer}>
        <Text onPress={() => navigation.goBack()} style={styles.headerTitle}>ImageCraft AI</Text>
        <Text style={styles.headerSubtitle}>
          Transform ideas into stunning visuals
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => setShowHistory(true)}
        style={styles.historyButton}
      >
        <Icon name="history" size={24} color="#fff" />
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
        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Icon name="image" size={20} color={PRIMARY_BLUE} />
            <Text style={styles.statValue}>{usage?.usage.total_used || 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="clock-outline" size={20} color={PRIMARY_BLUE} />
            <Text style={styles.statValue}>{remainingText}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="crown" size={20} color={PRIMARY_BLUE} />
            <Text style={styles.statValue}>
              {planTier === 'enterprise' ? '∞' : 'HD'}
            </Text>
            <Text style={styles.statLabel}>Quality</Text>
          </View>
        </View>

        {/* Plan Info Card */}
        <LinearGradient
          colors={['#f8fafc', '#ffffff']}
          style={styles.planCard}
        >
          <View style={styles.planHeader}>
            <View style={styles.planTitleContainer}>
              <Icon name="crown" size={20} color={PRIMARY_BLUE} />
              <Text style={styles.planName}>
                {usage?.plan.name || 'Free Trial'}
              </Text>
            </View>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>
                {planTier === 'trial' ? 'TRIAL' : planTier.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Usage Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Daily Usage</Text>
              <Text style={[
                styles.progressValue,
                usagePercentage > 80 ? styles.progressHigh :
                usagePercentage > 60 ? styles.progressMedium :
                styles.progressLow
              ]}>
                {usage?.usage.today_used || 0} / {usage?.limits.max_image_generations_per_day === -1 ? '∞' : usage?.limits.max_image_generations_per_day}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${usagePercentage}%`,
                    backgroundColor:
                      usagePercentage > 80 ? '#ef4444' :
                      usagePercentage > 60 ? '#eab308' : PRIMARY_BLUE,
                  },
                ]}
              />
            </View>
            <Text style={styles.remainingText}>
              {remainingText} generations remaining today
            </Text>
          </View>

          {/* Trial Warning */}
          {planTier === 'trial' && (
            <View style={styles.trialWarning}>
              <Icon name="alert" size={16} color="#eab308" />
              <Text style={styles.trialWarningText}>
                Upgrade to unlock more generations and premium features
              </Text>
            </View>
          )}

          {/* Limit Warning */}
          {!canGenerate && canGenerateCheck && (
            <View style={styles.limitWarning}>
              <Icon name="alert-circle" size={16} color="#ef4444" />
              <Text style={styles.limitWarningText}>
                {canGenerateCheck.message}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Generation Controls */}
        <View style={styles.controlCard}>
          <Text style={styles.sectionTitle}>Generate Images</Text>

          <TextInput
            style={styles.promptInput}
            placeholder="Describe your image... (e.g., A majestic dragon flying over a medieval castle at sunset)"
            placeholderTextColor="#94a3b8"
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={4}
            editable={!loading && canGenerate}
          />

          <View style={styles.numImagesContainer}>
            <Text style={styles.numImagesLabel}>Number of Images:</Text>
            <View style={styles.numImagesButtons}>
              {[1, 2, 3, 4].map(num => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.numImageButton,
                    numImages === num && styles.numImageButtonActive,
                  ]}
                  onPress={() => setNumImages(num)}
                  disabled={loading || !canGenerate}
                >
                  <Text
                    style={[
                      styles.numImageButtonText,
                      numImages === num && styles.numImageButtonTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.actionRow}>
            {prompt.length > 0 && (
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
                (!prompt.trim() || loading || !canGenerate) &&
                  styles.generateButtonDisabled,
              ]}
              onPress={handleGenerate}
              disabled={!prompt.trim() || loading || !canGenerate}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="auto-fix" size={20} color="#fff" />
                  <Text style={styles.generateButtonText}>
                    Generate {numImages} {numImages === 1 ? 'Image' : 'Images'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {!canGenerate && upgradeMessage && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgrade}
            >
              <Icon name="flash" size={18} color="#fff" />
              <Text style={styles.upgradeButtonText}>
                {upgradeMessage.buttonText}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Suggestions */}
        <View style={styles.suggestionsCard}>
          <Text style={styles.sectionTitle}>Try These Prompts</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.suggestionsRow}>
              {SUGGESTIONS.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => setPrompt(suggestion.prompt)}
                >
                  <Icon name="lightbulb-outline" size={16} color={PRIMARY_BLUE} />
                  <Text style={styles.suggestionText}>{suggestion.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
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

        {/* Generated Images */}
        {images.length > 0 && (
          <View style={styles.resultsCard}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                Generated Images ({images.length})
              </Text>
              <View style={styles.resultsActions}>
                {images.length > 1 && (
                  <>
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={handleShareAll}
                    >
                      <Icon name="share-variant" size={20} color={PRIMARY_BLUE} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={handleDownloadAll}
                      disabled={downloading === -1}
                    >
                      {downloading === -1 ? (
                        <ActivityIndicator size="small" color={PRIMARY_BLUE} />
                      ) : (
                        <Icon name="download" size={20} color={PRIMARY_BLUE} />
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            <FlatList
              data={images}
              keyExtractor={(item, index) => index.toString()}
              numColumns={2}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.imageCard}
                  onPress={() => {
                    setSelectedImage(item);
                    setImageModalVisible(true);
                  }}
                >
                  <Image source={{ uri: item }} style={styles.generatedImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.5)']}
                    style={styles.imageOverlay}
                  >
                    <View style={styles.imageActions}>
                      <TouchableOpacity
                        style={styles.imageAction}
                        onPress={() => handleShare(item)}
                      >
                        <Icon name="share" size={16} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.imageAction}
                        onPress={() => handleDownload(item, index)}
                        disabled={downloading === index}
                      >
                        {downloading === index ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Icon name="download" size={16} color="#fff" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Loading State */}
        {loading && !images.length && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={PRIMARY_BLUE} />
            <Text style={styles.loadingTitle}>Generating your images...</Text>
            <Text style={styles.loadingText}>
              This may take 30-60 seconds. Please don't close this page.
            </Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && images.length === 0 && (
          <View style={styles.emptyCard}>
            <Icon name="palette" size={48} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No images generated yet</Text>
            <Text style={styles.emptyText}>
              Enter a creative prompt above and generate your first AI masterpiece
            </Text>
          </View>
        )}

        {/* Plan Features */}
        <View style={styles.featuresCard}>
          <Text style={styles.sectionTitle}>Plan Features</Text>
          <View style={styles.featuresGrid}>
            {planFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}>
                  <Icon name={feature.icon} size={20} color={feature.color} />
                </View>
                <Text style={styles.featureLabel}>{feature.label}</Text>
                <Text style={styles.featureValue}>{feature.value}</Text>
              </View>
            ))}
          </View>

          {planTier !== 'enterprise' && upgradeMessage && (
            <View style={styles.upgradePrompt}>
              <Text style={styles.upgradeTitle}>{upgradeMessage.title}</Text>
              <Text style={styles.upgradeDescription}>{upgradeMessage.description}</Text>
              <TouchableOpacity
                style={styles.upgradePromptButton}
                onPress={handleUpgrade}
              >
                <Text style={styles.upgradePromptButtonText}>
                  {upgradeMessage.buttonText}
                </Text>
                <Icon name="arrow-right" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setImageModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.modalImage} />
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalAction}
                onPress={() => {
                  if (selectedImage) {
                    handleShare(selectedImage);
                  }
                }}
              >
                <Icon name="share" size={20} color={PRIMARY_BLUE} />
                <Text style={styles.modalActionText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalAction, styles.modalActionPrimary]}
                onPress={() => {
                  if (selectedImage) {
                    const index = images.indexOf(selectedImage);
                    handleDownload(selectedImage, index);
                  }
                }}
              >
                <Icon name="download" size={20} color="#fff" />
                <Text style={[styles.modalActionText, styles.modalActionTextPrimary]}>
                  Download
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* History Modal */}
      <Modal
        visible={showHistory}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.historyModalOverlay}>
          <View style={styles.historyModalContent}>
            <View style={styles.historyModalHeader}>
              <Text style={styles.historyModalTitle}>Generation History</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <Icon name="close" size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={usageHistory}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.historyList}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <View style={styles.historyItemIcon}>
                    <Icon name="image" size={20} color={PRIMARY_BLUE} />
                  </View>
                  <View style={styles.historyItemContent}>
                    <Text style={styles.historyItemPrompt} numberOfLines={2}>
                      {item.prompt}
                    </Text>
                    <View style={styles.historyItemMeta}>
                      <Text style={styles.historyItemCount}>
                        {item.images_generated} images
                      </Text>
                      <Text style={styles.historyItemDate}>
                        {new Date(item.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
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
  historyButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
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
    backgroundColor: PRIMARY_BLUE,
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
  progressLow: {
    color: PRIMARY_BLUE,
  },
  progressMedium: {
    color: '#eab308',
  },
  progressHigh: {
    color: '#ef4444',
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
  },
  limitWarningText: {
    flex: 1,
    fontSize: 12,
    color: '#b91c1c',
  },
  controlCard: {
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
  promptInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1e293b',
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  numImagesContainer: {
    marginBottom: 16,
  },
  numImagesLabel: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  numImagesButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  numImageButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  numImageButtonActive: {
    backgroundColor: PRIMARY_BLUE,
    borderColor: PRIMARY_BLUE,
  },
  numImageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  numImageButtonTextActive: {
    color: '#fff',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  clearButton: {
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  generateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_BLUE,
    paddingVertical: 12,
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
  suggestionsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  suggestionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  suggestionChip: {
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
  suggestionText: {
    fontSize: 12,
    color: '#475569',
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
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
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
  imageCard: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden',
    aspectRatio: 1,
  },
  generatedImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    justifyContent: 'center',
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    gap: 8,
  },
  imageAction: {
    padding: 6,
  },
  loadingCard: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 4,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  featuresCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  featureItem: {
    width: (width - 56) / 2,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  featureValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  upgradePrompt: {
    backgroundColor: '#fef9c3',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  upgradeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#854d0e',
    marginBottom: 4,
  },
  upgradeDescription: {
    fontSize: 12,
    color: '#854d0e',
    marginBottom: 12,
  },
  upgradePromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eab308',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  upgradePromptButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight! + 10,
    right: 20,
    zIndex: 10,
  },
  modalCloseButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  modalImage: {
    flex: 1,
    width: '100%',
    resizeMode: 'contain',
  },
  modalActions: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  modalAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  modalActionPrimary: {
    backgroundColor: PRIMARY_BLUE,
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_BLUE,
  },
  modalActionTextPrimary: {
    color: '#fff',
  },
  historyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  historyModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '60%',
    maxHeight: '80%',
  },
  historyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  historyModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  historyList: {
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  historyItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: `${PRIMARY_BLUE}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemPrompt: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  historyItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyItemCount: {
    fontSize: 12,
    color: PRIMARY_BLUE,
  },
  historyItemDate: {
    fontSize: 12,
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
});

export default ImageCraftAI;