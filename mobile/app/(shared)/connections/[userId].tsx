import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import PagerView from 'react-native-pager-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../../contexts/AuthContext';
import profileAPI from '../../../services/profileAPI';
import { Feather, Ionicons } from '@expo/vector-icons';

interface ConnectionUser {
  _id?: string;
  id?: string;
  display_name: string;
  email?: string;
  type: 'brand' | 'influencer';
  company_name?: string | null;
  full_name?: string | null;
  nickname?: string | null;
  username?: string;
  profile_picture?: string | null;
}

const ConnectionsScreen = () => {
  const { userId, type } = useLocalSearchParams();
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuth();


  const [followers, setFollowers] = useState<ConnectionUser[]>([]);
  const [following, setFollowing] = useState<ConnectionUser[]>([]);
  const [currentUserFollowing, setCurrentUserFollowing] = useState<ConnectionUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(type === 'following' ? 'following' : 'followers');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});
  const pagerRef = React.useRef<PagerView>(null);
  const insets = useSafeAreaInsets();


  // Get image URL
  const getImageUrl = (fileId?: string | null) => {
    if (!fileId) return 'https://via.placeholder.com/150';
    return `${profileAPI.BASE_URL}/profiles/image/${fileId}`;
  };

  // Map user data
  const mapUserData = (raw: any): ConnectionUser => {
    // If double-mapped (already processed by profileAPI), just return it
    if (raw.display_name) return raw;

    const userData = raw.user || raw;
    const profile = raw.profile || userData.profile || userData;

    const isBrand = profile.company_name ||
      profile.brand_profile?.company_name ||
      raw.company_name ||
      (profile.role === 'brand') ||
      (profile.type === 'brand');

    let display_name = 'User';

    if (isBrand) {
      display_name = profile.company_name ||
        profile.brand_profile?.company_name ||
        userData.company_name ||
        profile.username ||
        raw.username ||
        'Brand';
    } else {
      display_name = profile.full_name ||
        profile.influencer_profile?.full_name ||
        profile.nickname ||
        profile.influencer_profile?.nickname ||
        userData.full_name ||
        userData.nickname ||
        profile.username ||
        raw.username ||
        'Influencer';
    }

    const profile_picture =
      profile.profile_picture ||
      profile.logo ||
      profile.brand_profile?.logo ||
      profile.influencer_profile?.profile_picture ||
      userData.profile_picture ||
      raw.profilePicture ||
      null;

    const email = profile.email || userData.email || raw.email || '';
    const nickname = profile.nickname ||
      profile.influencer_profile?.nickname ||
      userData.nickname ||
      null;

    const username = profile.username || raw.username || '';

    return {
      _id: (raw._id || profile._id || userData._id)?.toString() || (raw.id || userData.id || profile.id)?.toString(),
      id: raw.id || profile.id || userData.id,
      display_name,
      email,
      type: isBrand ? 'brand' : 'influencer',
      company_name: isBrand ? display_name : null,
      full_name: !isBrand ? display_name : null,
      nickname,
      username,
      profile_picture,
    };
  };


  // Fetch connections
  const fetchConnections = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // 🛠️ Defensively parse userId
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;
    if (!userIdStr) {
      setLoading(false);
      return;
    }

    // 🛠️ Resolve 'me' to the actual current user ID
    const effectiveUserId = userIdStr === 'me'
      ? (currentUser?._id || currentUser?.id)?.toString()
      : userIdStr.toString();

    // If we are waiting for currentUser to resolve 'me', stay in loading but don't hang forever
    if (userIdStr === 'me' && !effectiveUserId) {
      setTimeout(() => {
        if (!effectiveUserId) setLoading(false);
      }, 3000);
      return;
    }

    if (!effectiveUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const [followersData, followingData] = await Promise.all([
        profileAPI.getFollowers(effectiveUserId),
        profileAPI.getFollowing(effectiveUserId)
      ]);


      const processData = (data: any[]): ConnectionUser[] => {
        if (!data) return [];
        return data.map(item => mapUserData(item));
      };

      setFollowers(processData(followersData));
      setFollowing(processData(followingData));

      if (currentUser) {

        const myId = (currentUser._id || currentUser.id)?.toString();
        if (myId) {
          const currentFollowing = await profileAPI.getFollowing(myId);
          setCurrentUserFollowing(processData(currentFollowing));
        }
      }

    } catch (err: any) {
      console.error('Error fetching connections:', err);
      setError(err.message || 'Failed to load connections');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, currentUser, isAuthenticated]);

  // Initial load
  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConnections();
  }, [fetchConnections]);

  // Check if following a user
  const isFollowingUser = (target: ConnectionUser): boolean => {
    const id = target._id || target.id;
    return currentUserFollowing.some(u => (u._id || u.id) === id);
  };

  // Handle follow/unfollow
  const handleFollowToggle = async (target: ConnectionUser) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to follow/unfollow');
      return;
    }


    const targetId = target._id || target.id;
    if (!targetId) return;

    const alreadyFollowing = isFollowingUser(target);

    setFollowLoading(prev => ({ ...prev, [targetId]: true }));

    try {
      if (alreadyFollowing) {
        await profileAPI.unfollowUser(targetId);
        setCurrentUserFollowing(prev =>
          prev.filter(u => (u._id || u.id) !== targetId)
        );
      } else {
        await profileAPI.followUser(targetId);
        setCurrentUserFollowing(prev => [...prev, target]);
      }

      // Refresh counts
      fetchConnections();

    } catch (err) {
      console.error('Follow toggle failed:', err);
      Alert.alert('Error', 'Failed to update follow status');
    } finally {
      setFollowLoading(prev => ({ ...prev, [targetId]: false }));
    }
  };

  // Filter users based on search
  const getFilteredList = (list: ConnectionUser[]) => {
    if (!search.trim()) return list;

    const query = search.toLowerCase().trim();
    return list.filter(user =>
      user.display_name.toLowerCase().includes(query) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.nickname && user.nickname.toLowerCase().includes(query)) ||
      (user.username && user.username.toLowerCase().includes(query))
    );
  };


  // Render user item
  const renderUserItem = ({ item }: { item: ConnectionUser }) => {
    const id = item._id || item.id;
    const selfId = currentUser?._id || currentUser?.id;
    const isSelf = id === selfId;
    const following = isFollowingUser(item);
    const busy = followLoading[id || ''];
    const profileType = item.type;

    let subText = '';
    if (profileType === 'brand') {
      if (item.email) subText = item.email;
    } else {
      if (item.nickname) subText = `@${item.nickname}`;
      else if (item.email) subText = item.email;
    }

    return (
      <View style={styles.userCard}>
        <TouchableOpacity
          style={styles.userCardMain}
          onPress={() => id && router.push(`/(shared)/profile/${id}`)}
        >
          <View style={styles.avatarContainer}>
            {item.profile_picture ? (
              <Image
                source={{ uri: getImageUrl(item.profile_picture) }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Feather name="user" size={24} color="#999" />
              </View>
            )}
            {profileType === 'brand' && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#0f6eea" />
              </View>
            )}
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.display_name}
            </Text>
            {subText ? (
              <Text style={styles.userSubtitle} numberOfLines={1}>
                {subText}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>

        <View style={styles.userActions}>
          {!isSelf && currentUser && (
            <TouchableOpacity

              style={[
                styles.followBtn,
                following && styles.followingBtn,
                busy && styles.followBtnLoading,
              ]}
              onPress={() => handleFollowToggle(item)}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator size="small" color={following ? "#0f6eea" : "#fff"} />
              ) : (
                <Text style={[styles.followBtnText, following && styles.followingBtnText]}>
                  {following ? 'Following' : 'Follow'}
                </Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => id && router.push(`/(shared)/profile/${id}`)}
          >
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };


  const handlePageSelected = (e: any) => {
    const page = e.nativeEvent.position;
    setActiveTab(page === 0 ? 'followers' : 'following');
  };

  const setPage = (index: number) => {
    setActiveTab(index === 0 ? 'followers' : 'following');
    pagerRef.current?.setPage(index);
  };

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={[styles.headerTop, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Network</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search connections..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#999"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'followers' && styles.activeTab]}
          onPress={() => setPage(0)}
        >
          <Text style={[styles.tabText, activeTab === 'followers' && styles.activeTabText]}>
            Followers ({followers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'following' && styles.activeTab]}
          onPress={() => setPage(1)}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>
            Following ({following.length})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  // Render empty state
  const renderEmpty = (type: 'followers' | 'following') => {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="users" size={60} color="#ccc" />
        <Text style={styles.emptyTitle}>
          {search ? 'No results found' : `No ${type} yet`}
        </Text>
        <Text style={styles.emptyText}>
          {search
            ? `No users match "${search}"`
            : type === 'followers'
              ? 'This user doesn\'t have any followers yet.'
              : 'This user isn\'t following anyone yet.'}
        </Text>
        {search && (
          <TouchableOpacity style={styles.clearBtn} onPress={() => setSearch('')}>
            <Text style={styles.clearBtnText}>Clear search</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };


  // Render footer
  const renderFooter = () => {
    if (loading && !refreshing) return null;
    return <View style={styles.footer} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}

      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={type === 'following' ? 1 : 0}
        onPageSelected={handlePageSelected}
      >
        <View key="1" style={{ flex: 1 }}>
          <FlatList
            data={getFilteredList(followers)}
            renderItem={renderUserItem}
            keyExtractor={(item, index) => (item._id || item.id || index.toString())}
            ListEmptyComponent={() => renderEmpty('followers')}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0f6eea"]} />
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
        <View key="2" style={{ flex: 1 }}>
          <FlatList
            data={getFilteredList(following)}
            renderItem={renderUserItem}
            keyExtractor={(item, index) => (item._id || item.id || index.toString())}
            ListEmptyComponent={() => renderEmpty('following')}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0f6eea"]} />
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>

      </PagerView>

      {loading && !refreshing && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#0f6eea" />
          <Text style={styles.loaderText}>Loading network...</Text>
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
  pagerView: {
    flex: 1,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0f6eea',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#0f6eea',
  },
  listContent: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  userCardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
    position: 'relative',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  userSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  followBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0f6eea',
    minWidth: 95,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingBtn: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  followBtnLoading: {
    opacity: 0.8,
  },
  followBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  followingBtnText: {
    color: '#333',
  },
  viewBtn: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  clearBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f6eea',
  },
  footer: {
    height: 20,
  },
});

export default ConnectionsScreen;