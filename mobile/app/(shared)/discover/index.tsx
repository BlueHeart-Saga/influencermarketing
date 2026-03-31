import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import profileAPI from '../../../services/profileAPI';
import { Feather, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface Profile {
  type: 'brand' | 'influencer';
  profile: {
    _id?: string;
    id?: string;
    company_name?: string;
    full_name?: string;
    nickname?: string;
    logo?: string;
    profile_picture?: string;
    bio?: string;
    location?: string;
    categories?: string[];
    followers?: any[];
    following?: any[];
  };
  isFollowing?: boolean;
  followersCount?: number;
  followingCount?: number;
}

const DiscoverScreen = () => {
  const router = useRouter();
  const { token, user: currentUser } = useAuth();
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'brand' | 'influencer'>('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  // Get image URL
  const getImageUrl = (fileId: string) => {
    if (!fileId) return 'https://via.placeholder.com/150';
    return `${profileAPI.BASE_URL}/profiles/image/${fileId}`;
  };

  // Fetch following list
  const fetchFollowingMap = useCallback(async () => {
    if (!token || !currentUser?.id) return;
    
    try {
      const followingList = await profileAPI.getFollowing(currentUser.id);
      const map: Record<string, boolean> = {};
      followingList.forEach((user: any) => {
        const userId = user._id || user.id;
        if (userId) map[userId] = true;
      });
      setFollowingMap(map);
    } catch (err) {
      console.error('Error fetching following list:', err);
    }
  }, [token, currentUser?.id]);

  // Fetch profiles
  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const res = await profileAPI.getPublicProfiles();
      
      // Process profiles with follow states and counts
      const processedProfiles = await Promise.all(
        res.map(async (p: Profile) => {
          const profileId = p.profile._id || p.profile.id;
          let isFollowing = false;
          let followersCount = p.profile.followers?.length || 0;
          let followingCount = p.profile.following?.length || 0;

          if (token && currentUser?.id !== profileId) {
            isFollowing = followingMap[profileId] || false;
          }

          // Fetch counts if available
          try {
            const followersData = await profileAPI.getFollowers(profileId);
            const followingData = await profileAPI.getFollowing(profileId);
            followersCount = followersData.length;
            followingCount = followingData.length;
          } catch {}

          return {
            ...p,
            isFollowing,
            followersCount,
            followingCount,
          };
        })
      );

      setProfiles(processedProfiles);
      setFilteredProfiles(processedProfiles);
      
    } catch (err: any) {
      console.error('Failed to fetch profiles:', err);
      setError(err.message || 'Failed to load profiles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, currentUser?.id, followingMap]);

  // Filter profiles
  useEffect(() => {
    let filtered = [...profiles];

    // Tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(p => p.type === activeTab);
    }

    // Search filter
    if (search.trim()) {
      const query = search.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const profile = p.profile;
        const name = p.type === 'brand' 
          ? profile.company_name || ''
          : profile.full_name || '';
        const username = profile.nickname || '';
        const location = profile.location || '';
        const bio = profile.bio || '';
        const categories = Array.isArray(profile.categories) 
          ? profile.categories.join(' ') 
          : '';

        const haystack = `${name} ${username} ${location} ${bio} ${categories}`.toLowerCase();
        return haystack.includes(query);
      });
    }

    setFilteredProfiles(filtered);
  }, [activeTab, search, profiles]);

  // Initial load
  useEffect(() => {
    fetchFollowingMap();
  }, [fetchFollowingMap]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfiles();
  }, [fetchProfiles]);

  // Handle follow/unfollow
  const handleFollowToggle = async (profileId: string, isFollowing: boolean) => {
    if (!token) {
      Alert.alert('Login Required', 'Please login to follow users');
      return;
    }

    try {
      if (isFollowing) {
        await profileAPI.unfollowUser(profileId);
      } else {
        await profileAPI.followUser(profileId);
      }

      // Update following map
      setFollowingMap(prev => ({
        ...prev,
        [profileId]: !isFollowing,
      }));

      // Update profiles
      const updateProfiles = (prev: Profile[]) => 
        prev.map(p => {
          const pid = p.profile._id || p.profile.id;
          if (pid === profileId) {
            return {
              ...p,
              isFollowing: !isFollowing,
              followersCount: isFollowing 
                ? Math.max((p.followersCount || 0) - 1, 0)
                : (p.followersCount || 0) + 1,
            };
          }
          return p;
        });

      setProfiles(updateProfiles);
      setFilteredProfiles(updateProfiles);
      
    } catch (err) {
      console.error('Failed to follow/unfollow:', err);
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  // Render profile card
  const renderProfileCard = ({ item }: { item: Profile }) => {
    const profile = item.profile;
    const profileId = profile._id || profile.id;
    const displayName = item.type === 'brand' 
      ? profile.company_name 
      : profile.full_name || profile.nickname || 'Unknown';
    const avatar = item.type === 'brand' ? profile.logo : profile.profile_picture;
    const location = profile.location;
    const categories = profile.categories || [];
    const isCurrentUser = profileId === (currentUser?._id || currentUser?.id);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => router.push(`/(shared)/profile/${profileId}`)}
      >
        <View style={styles.cardHeader}>
          {avatar ? (
            <Image
              source={{ uri: getImageUrl(avatar) }}
              style={styles.cardAvatar}
            />
          ) : (
            <View style={styles.cardAvatarPlaceholder}>
              <Feather name="user" size={30} color="#999" />
            </View>
          )}
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>
              {item.type === 'brand' ? '🏢' : '⭐'}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>
            {displayName}
          </Text>

          {location ? (
            <View style={styles.cardLocation}>
              <Feather name="map-pin" size={12} color="#999" />
              <Text style={styles.cardLocationText} numberOfLines={1}>
                {location}
              </Text>
            </View>
          ) : null}

          {categories.length > 0 && (
            <View style={styles.cardCategories}>
              {categories.slice(0, 2).map((cat, index) => (
                <View key={index} style={styles.cardCategoryTag}>
                  <Text style={styles.cardCategoryText} numberOfLines={1}>
                    {cat}
                  </Text>
                </View>
              ))}
              {categories.length > 2 && (
                <Text style={styles.cardMoreCategories}>+{categories.length - 2}</Text>
              )}
            </View>
          )}

          <View style={styles.cardStats}>
            <View style={styles.cardStat}>
              <Text style={styles.cardStatNumber}>{item.followersCount || 0}</Text>
              <Text style={styles.cardStatLabel}>Followers</Text>
            </View>
            <View style={styles.cardStat}>
              <Text style={styles.cardStatNumber}>{item.followingCount || 0}</Text>
              <Text style={styles.cardStatLabel}>Following</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          {!isCurrentUser && token && (
            <TouchableOpacity
              style={[
                styles.followBtn,
                item.isFollowing && styles.followingBtn,
              ]}
              onPress={() => handleFollowToggle(profileId, item.isFollowing || false)}
            >
              <Text style={styles.followBtnText}>
                {item.isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => router.push(`/(shared)/profile/${profileId}`)}
          >
            <Text style={styles.viewBtnText}>View</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  

  // Render tabs
  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {[
        { id: 'all', label: 'All' },
        { id: 'brand', label: 'Brands' },
        { id: 'influencer', label: 'Influencers' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => setActiveTab(tab.id as typeof activeTab)}
        >
          <Text
            style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render search
  const renderSearch = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, location, category..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#999"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  // Render results count
  const renderResultsCount = () => (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsText}>
        Showing {filteredProfiles.length} {filteredProfiles.length === 1 ? 'profile' : 'profiles'}
        {search ? ` for "${search}"` : ''}
      </Text>
    </View>
  );

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="users" size={60} color="#ccc" />
      <Text style={styles.emptyTitle}>No profiles found</Text>
      <Text style={styles.emptyText}>
        {search
          ? `No profiles match your search for "${search}". Try different keywords.`
          : 'No profiles available at the moment.'}
      </Text>
      {(search || activeTab !== 'all') && (
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => {
            setSearch('');
            setActiveTab('all');
          }}
        >
          <Text style={styles.clearBtnText}>Clear filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render footer
  const renderFooter = () => {
    if (loading && !refreshing) return null;
    return <View style={styles.footer} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={filteredProfiles}
        renderItem={renderProfileCard}
        keyExtractor={(item, index) => 
          (item.profile._id || item.profile.id || index.toString())
        }
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <>
            
            {renderTabs()}
            {renderSearch()}
            {renderResultsCount()}
          </>
        }
        ListEmptyComponent={!loading ? renderEmpty : null}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {loading && !refreshing && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loaderText}>Loading profiles...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#999',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#007AFF',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 14,
    color: '#999',
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    height: 120,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  cardAvatar: {
    width: '100%',
    height: '100%',
  },
  cardAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  cardBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cardBadgeText: {
    fontSize: 12,
    color: '#fff',
  },
  cardBody: {
    padding: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLocationText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  cardCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  cardCategoryTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  cardCategoryText: {
    fontSize: 10,
    color: '#666',
  },
  cardMoreCategories: {
    fontSize: 10,
    color: '#999',
    alignSelf: 'center',
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardStat: {
    flex: 1,
    alignItems: 'center',
  },
  cardStatNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  cardStatLabel: {
    fontSize: 10,
    color: '#999',
  },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  followBtn: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    alignItems: 'center',
  },
  followingBtn: {
    backgroundColor: '#e0e0e0',
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  viewBtn: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  clearBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    height: 20,
  },
});

export default DiscoverScreen;