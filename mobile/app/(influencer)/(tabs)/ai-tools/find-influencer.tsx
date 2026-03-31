import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  Platform,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { youtubeApi } from '../../../../services/youtubeAPI';

const PRIMARY_BLUE = 'rgb(15, 110, 234)';
const { width } = Dimensions.get('window');

// Types
interface Influencer {
  channelId: string;
  title: string;
  description: string;
  customUrl: string;
  publishedAt?: string;
  country?: string;
  thumbnails: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
  };
  statistics: {
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
    likeCount?: string;
    commentCount?: string;
  };
  influencerMetrics?: {
    engagementRate: number;
    avgViewsPerVideo: number;
    growthPotential: number;
    audienceQuality?: number;
    contentFrequency?: number;
  };
  influencerScore?: {
    totalScore: number;
    dimensionScores: {
      popularity: number;
      engagement: number;
      contentVolume: number;
      growthPotential: number;
      consistency?: number;
      audienceQuality?: number;
    };
  };
  keywords?: string[];
}

interface FilterOptions {
  minSubscribers: number;
  maxSubscribers: number;
  category: string;
  engagementMin: number;
  sortBy: string;
}

interface SearchParams {
  query: string;
  maxResults: number;
  order: string;
}

// Popular categories with icons
const POPULAR_CATEGORIES = [
  { id: 'tech', label: 'Technology', icon: 'laptop', query: 'tech review' },
  { id: 'gaming', label: 'Gaming', icon: 'gamepad-variant', query: 'gaming' },
  { id: 'beauty', label: 'Beauty', icon: 'lipstick', query: 'beauty makeup' },
  { id: 'fitness', label: 'Fitness', icon: 'dumbbell', query: 'fitness workout' },
  { id: 'education', label: 'Education', icon: 'school', query: 'educational' },
  { id: 'music', label: 'Music', icon: 'music', query: 'music' },
  { id: 'cooking', label: 'Cooking', icon: 'food', query: 'cooking recipe' },
  { id: 'travel', label: 'Travel', icon: 'airplane', query: 'travel vlog' },
  { id: 'fashion', label: 'Fashion', icon: 'tshirt-crew', query: 'fashion' },
  { id: 'finance', label: 'Finance', icon: 'cash', query: 'finance investing' },
  { id: 'sports', label: 'Sports', icon: 'soccer', query: 'sports' },
  { id: 'comedy', label: 'Comedy', icon: 'emoticon', query: 'comedy' },
];

// Quick filter presets
const QUICK_FILTERS = [
  { label: 'Micro (1K-50K)', min: 1000, max: 50000 },
  { label: 'Mid-tier (50K-500K)', min: 50000, max: 500000 },
  { label: 'Macro (500K-5M)', min: 500000, max: 5000000 },
  { label: 'Mega (5M+)', min: 5000000, max: 100000000 },
];

// Sort options
const SORT_OPTIONS = [
  { label: 'Influencer Score', value: 'score' },
  { label: 'Relevance', value: 'relevance' },
  { label: 'Subscribers', value: 'subscriberCount' },
  { label: 'Engagement Rate', value: 'engagement' },
  { label: 'Video Count', value: 'videoCount' },
  { label: 'View Count', value: 'viewCount' },
];

const FindInfluencer: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'search' | 'results' | 'details'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Influencer[]>([]);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [influencerAnalysis, setInfluencerAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    minSubscribers: 0,
    maxSubscribers: 10000000,
    category: '',
    engagementMin: 0,
    sortBy: 'score',
  });

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      // In a real app, load from AsyncStorage
      const searches = ['tech reviews', 'gaming', 'beauty', 'fitness'];
      setRecentSearches(searches);
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const handleSearch = async (params?: Partial<SearchParams>) => {
    if (!searchQuery.trim() && !params?.query) {
      Alert.alert('Error', 'Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const query = params?.query || searchQuery;
      const response = await youtubeApi.searchChannels(
        query,
        params?.maxResults || 20,
        params?.order || 'relevance',
        filters.minSubscribers,
        filters.maxSubscribers
      );

      setSearchResults(response.items || []);
      setActiveTab('results');
      
      // Add to recent searches
      if (!recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
      }
    } catch (err: any) {
      setError(err.message || 'Search failed. Please try again.');
      Alert.alert('Search Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInfluencerSelect = async (channelId: string) => {
    setLoading(true);
    setError(null);

    try {
      const [channelData, analysisData] = await Promise.all([
        youtubeApi.getChannel(channelId),
        youtubeApi.analyzeInfluencer(channelId)
      ]);

      setSelectedInfluencer(channelData.item);
      setInfluencerAnalysis(analysisData);
      setActiveTab('details');
    } catch (err: any) {
      setError(err.message || 'Failed to load influencer details.');
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'results' && searchQuery) {
      await handleSearch();
    }
    setRefreshing(false);
  };

  const handleBackToResults = () => {
    setActiveTab('results');
    setSelectedInfluencer(null);
    setInfluencerAnalysis(null);
  };

  const handleBackToSearch = () => {
    setActiveTab('search');
    setSearchResults([]);
    setSelectedInfluencer(null);
    setInfluencerAnalysis(null);
  };

  const applyQuickFilter = (min: number, max: number) => {
    setFilters(prev => ({ ...prev, minSubscribers: min, maxSubscribers: max }));
    setShowFilters(false);
  };

  const formatNumber = (num: string | number): string => {
    if (!num) return '0';
    const number = typeof num === 'string' ? parseInt(num) : num;
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toString();
  };

  const getTierFromSubs = (subCount: string | number): string => {
    const count = typeof subCount === 'string' ? parseInt(subCount) : subCount;
    if (count >= 1000000) return 'Mega';
    if (count >= 100000) return 'Macro';
    if (count >= 10000) return 'Micro';
    return 'Nano';
  };

  const getTierColor = (tier: string): string => {
    const colors: Record<string, string> = {
      'Mega': '#FFD700',
      'Macro': '#C0C0C0',
      'Micro': '#CD7F32',
      'Nano': '#8B4513',
    };
    return colors[tier] || '#666';
  };

  const openYouTubeChannel = (channelId: string) => {
    const url = `https://www.youtube.com/channel/${channelId}`;
    Linking.openURL(url).catch(err => 
      Alert.alert('Error', 'Could not open YouTube')
    );
  };

  const renderHeader = () => (
  <View style={[styles.header, { backgroundColor: "#0f6eea" }]}>
    
      <View style={styles.headerContent}>
        
        <View style={styles.headerTextContainer}>
          <Text onPress={() => navigation.goBack()} style={styles.headerTitle}>
            {activeTab === 'search' && 'Influencer Discovery'}
            {activeTab === 'results' && `Results (${searchResults.length})`}
            {activeTab === 'details' && (selectedInfluencer?.title || 'Details')}
          </Text>

          <Text style={styles.headerSubtitle}>
            {activeTab === 'search' && 'Find the perfect YouTube creators'}
            {activeTab === 'results' && 'Browse and analyze influencers'}
            {activeTab === 'details' && 'Comprehensive performance metrics'}
          </Text>
        </View>

      </View>
  </View>
);

  const renderSearchTab = () => (
    <ScrollView 
      style={styles.tabContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by niche, topic, or channel..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Icon name="tune" size={20} color={PRIMARY_BLUE} />
        </TouchableOpacity>
      </View>

      {/* Quick Filters */}
      <View style={styles.quickFiltersSection}>
        <Text style={styles.sectionTitle}>Quick Filters</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.quickFiltersScroll}
        >
          {QUICK_FILTERS.map((filter, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.quickFilterChip,
                filters.minSubscribers === filter.min && 
                filters.maxSubscribers === filter.max && 
                styles.quickFilterChipActive
              ]}
              onPress={() => applyQuickFilter(filter.min, filter.max)}
            >
              <Icon 
                name="account-group" 
                size={16} 
                color={filters.minSubscribers === filter.min ? '#fff' : '#64748b'} 
              />
              <Text style={[
                styles.quickFilterText,
                filters.minSubscribers === filter.min && 
                filters.maxSubscribers === filter.max && 
                styles.quickFilterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <View style={styles.recentSearchesSection}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentSearchItem}
              onPress={() => {
                setSearchQuery(search);
                handleSearch({ query: search });
              }}
            >
              <Icon name="history" size={18} color="#64748b" />
              <Text style={styles.recentSearchText}>{search}</Text>
              <Icon name="arrow-right" size={18} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Popular Categories */}
      <View style={styles.popularSection}>
        <Text style={styles.sectionTitle}>Popular Categories</Text>
        <View style={styles.categoryGrid}>
          {POPULAR_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => {
                setSearchQuery(category.query);
                handleSearch({ query: category.query });
              }}
            >
              <Icon name={category.icon} size={24} color={PRIMARY_BLUE} />
              <Text style={styles.categoryText}>{category.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitle}>Discovery Tips</Text>
        <View style={styles.tipCard}>
          <Icon name="lightbulb-on" size={20} color={PRIMARY_BLUE} />
          <Text style={styles.tipText}>Look for engagement rate ≥ 3% for authentic audiences</Text>
        </View>
        <View style={styles.tipCard}>
          <Icon name="chart-line" size={20} color={PRIMARY_BLUE} />
          <Text style={styles.tipText}>Check recent video performance for growth trends</Text>
        </View>
        <View style={styles.tipCard}>
          <Icon name="account-check" size={20} color={PRIMARY_BLUE} />
          <Text style={styles.tipText}>Verify channel consistency and content quality</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderResultsTab = () => (
    <View style={styles.tabContent}>
      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <View style={styles.resultsInfo}>
          <Icon name="account-group" size={18} color={PRIMARY_BLUE} />
          <Text style={styles.resultsCount}>{searchResults.length} influencers found</Text>
        </View>
        <View style={styles.resultsActions}>
          <TouchableOpacity 
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Icon 
              name={viewMode === 'grid' ? 'view-grid' : 'view-list'} 
              size={20} 
              color="#64748b" 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => setShowSort(true)}
          >
            <Icon name="sort" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Filters */}
      {(filters.minSubscribers > 0 || filters.maxSubscribers < 10000000) && (
        <View style={styles.activeFilters}>
          <Text style={styles.activeFilterText}>
            Min: {formatNumber(filters.minSubscribers)} - Max: {formatNumber(filters.maxSubscribers)}
          </Text>
        </View>
      )}

      {/* Results Grid/List */}
      <FlatList
        data={searchResults}
        key={viewMode}
        keyExtractor={(item) => item.channelId}
        numColumns={viewMode === 'grid' ? 2 : 1}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.influencerCard,
              viewMode === 'grid' ? styles.gridCard : styles.listCard,
            ]}
            onPress={() => handleInfluencerSelect(item.channelId)}
          >
            <Image 
              source={{ uri: item.thumbnails?.medium?.url || item.thumbnails?.default?.url }}
              style={viewMode === 'grid' ? styles.gridImage : styles.listImage}
            />
            <View style={styles.cardContent}>
              <Text style={styles.influencerName} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.cardStats}>
                <View style={styles.stat}>
                  <Icon name="account" size={12} color="#64748b" />
                  <Text style={styles.statText}>
                    {formatNumber(item.statistics.subscriberCount)}
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Icon name="play" size={12} color="#64748b" />
                  <Text style={styles.statText}>
                    {formatNumber(item.statistics.videoCount)}
                  </Text>
                </View>
              </View>
              {item.influencerMetrics?.engagementRate && (
                <View style={styles.engagementBadge}>
                  <Icon name="trending-up" size={10} color="#fff" />
                  <Text style={styles.engagementText}>
                    {item.influencerMetrics.engagementRate.toFixed(1)}%
                  </Text>
                </View>
              )}
              {item.influencerScore && (
                <View style={styles.scoreBadge}>
                  <Icon name="star" size={10} color="#FFD700" />
                  <Text style={styles.scoreText}>
                    {item.influencerScore.totalScore.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="account-search" size={48} color="#94a3b8" />
            <Text style={styles.emptyStateText}>No influencers found</Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={handleBackToSearch}
            >
              <Text style={styles.emptyStateButtonText}>Try a different search</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.resultsList}
      />
    </View>
  );

  const renderDetailsTab = () => {
    if (!selectedInfluencer || !influencerAnalysis) return null;

    const tier = getTierFromSubs(selectedInfluencer.statistics.subscriberCount);
    const tierColor = getTierColor(tier);

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Channel Header */}
        <View style={styles.channelHeader}>
          <Image 
            source={{ uri: selectedInfluencer.thumbnails?.high?.url || selectedInfluencer.thumbnails?.medium?.url }}
            style={styles.channelAvatar}
          />
          <View style={styles.channelInfo}>
            <Text style={styles.channelTitle}>{selectedInfluencer.title}</Text>
            <Text style={styles.channelHandle}>@{selectedInfluencer.customUrl}</Text>
            <View style={styles.channelStats}>
              <View style={styles.channelStat}>
                <Icon name="account" size={14} color="#64748b" />
                <Text style={styles.channelStatText}>
                  {formatNumber(selectedInfluencer.statistics.subscriberCount)} subs
                </Text>
              </View>
              <View style={styles.channelStat}>
                <Icon name="eye" size={14} color="#64748b" />
                <Text style={styles.channelStatText}>
                  {formatNumber(selectedInfluencer.statistics.viewCount)} views
                </Text>
              </View>
            </View>
            <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
              <Text style={styles.tierBadgeText}>{tier}</Text>
            </View>
          </View>
        </View>

        {/* Score Card */}
        {influencerAnalysis.influencerScore && (
          <LinearGradient
            colors={[PRIMARY_BLUE, '#0A4FA0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.scoreCard}
          >
            <View style={styles.scoreCardHeader}>
              <Text style={styles.scoreCardTitle}>Influencer Score</Text>
              <View style={styles.scoreValue}>
                <Text style={styles.scoreNumber}>
                  {influencerAnalysis.influencerScore.totalScore.toFixed(1)}
                </Text>
                <Text style={styles.scoreMax}>/10</Text>
              </View>
            </View>
            <View style={styles.scoreDimensions}>
              {Object.entries(influencerAnalysis.influencerScore.dimensionScores).map(([key, value]) => (
                <View key={key} style={styles.dimension}>
                  <Text style={styles.dimensionLabel}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                  <Text style={styles.dimensionValue}>{(value as number).toFixed(1)}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        )}

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Icon name="chart-line" size={20} color={PRIMARY_BLUE} />
            <Text style={styles.metricValue}>
              {influencerAnalysis.influencerMetrics?.engagementRate?.toFixed(1) || '0'}%
            </Text>
            <Text style={styles.metricLabel}>Engagement Rate</Text>
          </View>
          <View style={styles.metricCard}>
            <Icon name="eye" size={20} color={PRIMARY_BLUE} />
            <Text style={styles.metricValue}>
              {formatNumber(influencerAnalysis.performanceMetrics?.avgViews || 0)}
            </Text>
            <Text style={styles.metricLabel}>Avg Views</Text>
          </View>
          <View style={styles.metricCard}>
            <Icon name="trending-up" size={20} color={PRIMARY_BLUE} />
            <Text style={styles.metricValue}>
              {influencerAnalysis.influencerMetrics?.growthPotential?.toFixed(1) || '0'}%
            </Text>
            <Text style={styles.metricLabel}>Growth Potential</Text>
          </View>
          <View style={styles.metricCard}>
            <Icon name="clock" size={20} color={PRIMARY_BLUE} />
            <Text style={styles.metricValue}>
              {influencerAnalysis.contentAnalysis?.avgVideosPerWeek?.toFixed(1) || '0'}
            </Text>
            <Text style={styles.metricLabel}>Videos/Week</Text>
          </View>
        </View>

        {/* Performance Trend */}
        {influencerAnalysis.performanceTrends && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Trend</Text>
            <View style={styles.trendCard}>
              <View style={styles.trendHeader}>
                <Text style={styles.trendLabel}>Current Trend</Text>
                <View style={[
                  styles.trendBadge,
                  { 
                    backgroundColor: 
                      influencerAnalysis.performanceTrends.trend === 'growing' ? '#22c55e' :
                      influencerAnalysis.performanceTrends.trend === 'stable' ? '#eab308' : '#ef4444'
                  }
                ]}>
                  <Text style={styles.trendBadgeText}>
                    {influencerAnalysis.performanceTrends.trend}
                  </Text>
                </View>
              </View>
              <Text style={styles.growthRate}>
                {influencerAnalysis.performanceTrends.growthRate > 0 ? '+' : ''}
                {influencerAnalysis.performanceTrends.growthRate?.toFixed(1)}% growth
              </Text>
              <View style={styles.trendStats}>
                <Text style={styles.trendStat}>
                  Recent Avg Views: {formatNumber(influencerAnalysis.performanceTrends.avgRecentViews || 0)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Audience Quality */}
        {influencerAnalysis.audienceAnalysis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Audience Analysis</Text>
            <View style={styles.audienceCard}>
              <View style={styles.audienceRow}>
                <Text style={styles.audienceLabel}>Quality Score</Text>
                <Text style={styles.audienceValue}>
                  {influencerAnalysis.audienceAnalysis.qualityScore?.toFixed(1)}/10
                </Text>
              </View>
              <View style={styles.audienceRow}>
                <Text style={styles.audienceLabel}>Engagement Level</Text>
                <Text style={styles.audienceValue}>
                  {influencerAnalysis.audienceAnalysis.engagementLevel}
                </Text>
              </View>
              <View style={styles.audienceRow}>
                <Text style={styles.audienceLabel}>Subscriber/View Ratio</Text>
                <Text style={styles.audienceValue}>
                  {influencerAnalysis.audienceAnalysis.subscriberToViewRatio?.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Monetization Potential */}
        {influencerAnalysis.monetizationPotential && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monetization Potential</Text>
            <View style={styles.monetizationCard}>
              <View style={styles.monetizationRow}>
                <Icon name="cash" size={20} color="#22c55e" />
                <View style={styles.monetizationInfo}>
                  <Text style={styles.monetizationLabel}>Est. Earnings/Video</Text>
                  <Text style={styles.monetizationValue}>
                    ${influencerAnalysis.monetizationPotential.estimatedEarningsPerVideo}
                  </Text>
                </View>
              </View>
              <View style={styles.monetizationRow}>
                <Icon name="diamond" size={20} color="#eab308" />
                <View style={styles.monetizationInfo}>
                  <Text style={styles.monetizationLabel}>Sponsorship Value</Text>
                  <Text style={styles.monetizationValue}>
                    ${influencerAnalysis.monetizationPotential.sponsorshipValue?.estimatedSponsorshipFee}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Recommendations */}
        {influencerAnalysis.recommendations && influencerAnalysis.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            <View style={styles.recommendationsCard}>
              {influencerAnalysis.recommendations.map((rec: string, index: number) => (
                <View key={index} style={styles.recommendationItem}>
                  <Icon name="lightbulb-on" size={16} color={PRIMARY_BLUE} />
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => openYouTubeChannel(selectedInfluencer.channelId)}
          >
            <Icon name="youtube" size={20} color="#fff" />
            <Text style={styles.buttonText}>View Channel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleBackToResults}
          >
            <Icon name="arrow-left" size={20} color={PRIMARY_BLUE} />
            <Text style={styles.secondaryButtonText}>Back to Results</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_BLUE} />
      {renderHeader()}

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Icon 
            name="magnify" 
            size={20} 
            color={activeTab === 'search' ? PRIMARY_BLUE : '#64748b'} 
          />
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
            Search
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'results' && styles.activeTab]}
          onPress={() => activeTab !== 'results' && setActiveTab('results')}
          disabled={searchResults.length === 0}
        >
          <Icon 
            name="format-list-bulleted" 
            size={20} 
            color={activeTab === 'results' ? PRIMARY_BLUE : '#64748b'} 
          />
          <Text style={[styles.tabText, activeTab === 'results' && styles.activeTabText]}>
            Results
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && styles.activeTab]}
          onPress={() => activeTab !== 'details' && setActiveTab('details')}
          disabled={!selectedInfluencer}
        >
          <Icon 
            name="account-details" 
            size={20} 
            color={activeTab === 'details' ? PRIMARY_BLUE : '#64748b'} 
          />
          <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
            Details
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Main Content */}
      {loading && activeTab !== 'results' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_BLUE} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <>
          {activeTab === 'search' && renderSearchTab()}
          {activeTab === 'results' && renderResultsTab()}
          {activeTab === 'details' && renderDetailsTab()}
        </>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Icon name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.filterLabel}>Subscriber Range</Text>
              <View style={styles.rangeInputs}>
                <TextInput
                  style={styles.rangeInput}
                  placeholder="Min"
                  keyboardType="numeric"
                  value={filters.minSubscribers.toString()}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, minSubscribers: parseInt(text) || 0 }))}
                />
                <Text style={styles.rangeSeparator}>to</Text>
                <TextInput
                  style={styles.rangeInput}
                  placeholder="Max"
                  keyboardType="numeric"
                  value={filters.maxSubscribers.toString()}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, maxSubscribers: parseInt(text) || 10000000 }))}
                />
              </View>

              <Text style={styles.filterLabel}>Category</Text>
              <TextInput
                style={styles.categoryInput}
                placeholder="Enter category"
                value={filters.category}
                onChangeText={(text) => setFilters(prev => ({ ...prev, category: text }))}
              />

              <Text style={styles.filterLabel}>Min Engagement Rate (%)</Text>
              <TextInput
                style={styles.engagementInput}
                placeholder="0"
                keyboardType="numeric"
                value={filters.engagementMin.toString()}
                onChangeText={(text) => setFilters(prev => ({ ...prev, engagementMin: parseInt(text) || 0 }))}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => setFilters({
                  minSubscribers: 0,
                  maxSubscribers: 10000000,
                  category: '',
                  engagementMin: 0,
                  sortBy: 'score',
                })}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.applyButton, { backgroundColor: PRIMARY_BLUE }]}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={showSort}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSort(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSort(false)}>
                <Icon name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.sortOption}
                  onPress={() => {
                    setFilters(prev => ({ ...prev, sortBy: option.value }));
                    setShowSort(false);
                  }}
                >
                  <Text style={[
                    styles.sortOptionText,
                    filters.sortBy === option.value && styles.sortOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                  {filters.sortBy === option.value && (
                    <Icon name="check" size={20} color={PRIMARY_BLUE} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: 'rgb(15, 110, 234)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabText: {
    color: 'rgb(15, 110, 234)',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#ef4444',
    fontSize: 14,
  },
  searchSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1e293b',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickFiltersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  quickFiltersScroll: {
    flexGrow: 0,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickFilterChipActive: {
    backgroundColor: 'rgb(15, 110, 234)',
    borderColor: 'rgb(15, 110, 234)',
  },
  quickFilterText: {
    fontSize: 14,
    color: '#64748b',
  },
  quickFilterTextActive: {
    color: '#fff',
  },
  recentSearchesSection: {
    marginBottom: 24,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  recentSearchText: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    marginLeft: 12,
  },
  popularSection: {
    marginBottom: 24,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    width: (width - 48) / 3,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryText: {
    fontSize: 12,
    color: '#1e293b',
    marginTop: 6,
    textAlign: 'center',
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  resultsActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewModeButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  sortButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  activeFilters: {
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  activeFilterText: {
    fontSize: 12,
    color: '#475569',
  },
  resultsList: {
    paddingBottom: 16,
  },
  influencerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  gridCard: {
    flex: 1,
    margin: 4,
  },
  listCard: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  gridImage: {
    width: '100%',
    height: 100,
  },
  listImage: {
    width: 70,
    height: 70,
  },
  cardContent: {
    padding: 10,
    flex: 1,
    position: 'relative',
  },
  influencerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    fontSize: 11,
    color: '#64748b',
  },
  engagementBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(15, 110, 234)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  engagementText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '600',
  },
  scoreBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  scoreText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94a3b8',
  },
  emptyStateButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgb(15, 110, 234)',
    borderRadius: 6,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  channelHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  channelAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  channelInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  channelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  channelHandle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
  },
  channelStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  channelStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  channelStatText: {
    fontSize: 12,
    color: '#475569',
  },
  tierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  scoreCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  scoreCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  scoreValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  scoreMax: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 2,
  },
  scoreDimensions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dimension: {
    flex: 1,
    minWidth: '40%',
  },
  dimensionLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  dimensionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 6,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  trendCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  trendBadgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  growthRate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  trendStats: {
    marginTop: 4,
  },
  trendStat: {
    fontSize: 12,
    color: '#64748b',
  },
  audienceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  audienceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  audienceLabel: {
    fontSize: 13,
    color: '#475569',
  },
  audienceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  monetizationCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  monetizationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  monetizationInfo: {
    flex: 1,
  },
  monetizationLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  monetizationValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  recommendationsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 30,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgb(15, 110, 234)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgb(15, 110, 234)',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgb(15, 110, 234)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 8,
  },
  rangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  rangeInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1e293b',
  },
  rangeSeparator: {
    fontSize: 14,
    color: '#64748b',
  },
  categoryInput: {
    height: 44,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 20,
  },
  engagementInput: {
    height: 44,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1e293b',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#1e293b',
  },
  sortOptionTextActive: {
    color: 'rgb(15, 110, 234)',
    fontWeight: '600',
  },
});

export default FindInfluencer;