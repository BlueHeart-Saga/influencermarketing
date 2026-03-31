import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import adminAPI, { User } from '../../services/adminapi';

interface AllUsersListProps {
  onUserSelect?: (user: User) => void;
}

export default function AllUsersList({ onUserSelect }: AllUsersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'brand' | 'influencer' | 'admin'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');

  const fetchUsers = useCallback(async () => {
    try {
      const response = await adminAPI.getUsers({
        role: filterRole !== 'all' ? filterRole : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchQuery || undefined,
      });
      setUsers(response.users || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', error.message || 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterRole, filterStatus, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleUserPress = (user: User) => {
    setSelectedUser(user);
    setModalVisible(true);
    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  const handleToggleStatus = async (user: User) => {
    setActionLoading(true);
    try {
      if (user.status === 'active') {
        await adminAPI.suspendUser(user._id);
        Alert.alert('Success', 'User suspended successfully');
      } else {
        await adminAPI.activateUser(user._id);
        Alert.alert('Success', 'User activated successfully');
      }
      fetchUsers();
      if (selectedUser && selectedUser._id === user._id) {
        setSelectedUser(null);
        setModalVisible(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to permanently delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await adminAPI.deleteUser(userId);
              Alert.alert('Success', 'User deleted successfully');
              fetchUsers();
              setModalVisible(false);
              setSelectedUser(null);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete user');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'suspended': return '#FF9800';
      case 'banned': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'brand': return 'business';
      case 'influencer': return 'person';
      case 'admin': return 'shield';
      default: return 'person-outline';
    }
  };

  const getDisplayName = (user: User) => {
    if (user.role === 'brand' && user.brand_profile?.company_name) {
      return user.brand_profile.company_name;
    }
    if (user.role === 'influencer') {
      return user.influencer_profile?.full_name || user.influencer_profile?.nickname || user.username;
    }
    return user.username;
  };

  const getProfileImage = (user: User) => {
    if (user.role === 'brand' && user.brand_profile?.logo) {
      return user.brand_profile.logo;
    }
    if (user.role === 'influencer' && user.influencer_profile?.profile_picture) {
      return user.influencer_profile.profile_picture;
    }
    return null;
  };

  const renderUserCard = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => handleUserPress(item)}>
      <View style={styles.userCardHeader}>
        <View style={styles.userAvatar}>
          <Ionicons name={getRoleIcon(item.role)} size={24} color="#fff" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{getDisplayName(item)}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.userCardDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.detailText}>Joined: {formatDate(item.created_at)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="document-text-outline" size={14} color="#666" />
          <Text style={styles.detailText}>Posts: {item.activity_metrics?.post_count || 0}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="people-outline" size={14} color="#666" />
          <Text style={styles.detailText}>
            {item.role === 'influencer' ? 'Followers: ' : 'Following: '}
            {item.role === 'influencer' 
              ? (item.activity_metrics?.followers_count || 0)
              : (item.activity_metrics?.following_count || 0)}
          </Text>
        </View>
      </View>

      {item.subscription && item.subscription.type !== 'free' && (
        <View style={styles.subscriptionBadge}>
          <Ionicons name="star" size={12} color="#FF9800" />
          <Text style={styles.subscriptionText}>
            {item.subscription.type === 'trial' ? 'Trial' : 'Paid'} • {item.subscription.plan}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderFilterBar = () => (
    <View style={styles.filterBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.filterChip, filterRole === 'all' && styles.filterChipActive]}
          onPress={() => setFilterRole('all')}
        >
          <Text style={[styles.filterChipText, filterRole === 'all' && styles.filterChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterRole === 'brand' && styles.filterChipActive]}
          onPress={() => setFilterRole('brand')}
        >
          <Ionicons name="business" size={16} color={filterRole === 'brand' ? '#fff' : '#666'} />
          <Text style={[styles.filterChipText, filterRole === 'brand' && styles.filterChipTextActive]}>
            Brands
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterRole === 'influencer' && styles.filterChipActive]}
          onPress={() => setFilterRole('influencer')}
        >
          <Ionicons name="person" size={16} color={filterRole === 'influencer' ? '#fff' : '#666'} />
          <Text style={[styles.filterChipText, filterRole === 'influencer' && styles.filterChipTextActive]}>
            Influencers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterRole === 'admin' && styles.filterChipActive]}
          onPress={() => setFilterRole('admin')}
        >
          <Ionicons name="shield" size={16} color={filterRole === 'admin' ? '#fff' : '#666'} />
          <Text style={[styles.filterChipText, filterRole === 'admin' && styles.filterChipTextActive]}>
            Admins
          </Text>
        </TouchableOpacity>
        <View style={styles.filterDivider} />
        <TouchableOpacity
          style={[styles.filterChip, filterStatus === 'all' && styles.filterChipActive]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.filterChipText, filterStatus === 'all' && styles.filterChipTextActive]}>
            All Status
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterStatus === 'active' && styles.filterChipActive]}
          onPress={() => setFilterStatus('active')}
        >
          <Text style={[styles.filterChipText, filterStatus === 'active' && styles.filterChipTextActive]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterStatus === 'suspended' && styles.filterChipActive]}
          onPress={() => setFilterStatus('suspended')}
        >
          <Text style={[styles.filterChipText, filterStatus === 'suspended' && styles.filterChipTextActive]}>
            Suspended
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterStatus === 'banned' && styles.filterChipActive]}
          onPress={() => setFilterStatus('banned')}
        >
          <Text style={[styles.filterChipText, filterStatus === 'banned' && styles.filterChipTextActive]}>
            Banned
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {renderFilterBar()}

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderUserCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No users found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        }
        contentContainerStyle={users.length === 0 ? styles.emptyList : undefined}
      />

      {/* User Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedUser && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalAvatar}>
                    <Ionicons name={getRoleIcon(selectedUser.role)} size={32} color="#fff" />
                  </View>
                  <Text style={styles.modalName}>{getDisplayName(selectedUser)}</Text>
                  <Text style={styles.modalEmail}>{selectedUser.email}</Text>
                  <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedUser.status) + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(selectedUser.status) }]} />
                    <Text style={[styles.modalStatusText, { color: getStatusColor(selectedUser.status) }]}>
                      {selectedUser.status}
                    </Text>
                  </View>
                </View>

                <ScrollView style={styles.modalDetails}>
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    <View style={styles.detailRow}>
                      <Ionicons name="person-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Username:</Text>
                      <Text style={styles.detailValue}>@{selectedUser.username}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Joined:</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedUser.created_at)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="log-in-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Last Login:</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedUser.last_login)}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Activity</Text>
                    <View style={styles.detailRow}>
                      <Ionicons name="document-text-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Total Posts:</Text>
                      <Text style={styles.detailValue}>{selectedUser.activity_metrics?.post_count || 0}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="people-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Followers:</Text>
                      <Text style={styles.detailValue}>{selectedUser.activity_metrics?.followers_count || 0}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="trending-up-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Days Active:</Text>
                      <Text style={styles.detailValue}>{selectedUser.activity_metrics?.days_since_registration || 0}</Text>
                    </View>
                  </View>

                  {selectedUser.subscription && selectedUser.subscription.type !== 'free' && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Subscription</Text>
                      <View style={styles.detailRow}>
                        <Ionicons name="star" size={18} color="#FF9800" />
                        <Text style={styles.detailLabel}>Plan:</Text>
                        <Text style={styles.detailValue}>{selectedUser.subscription.plan}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={18} color="#666" />
                        <Text style={styles.detailLabel}>Expires:</Text>
                        <Text style={styles.detailValue}>
                          {selectedUser.subscription.current_period_end 
                            ? formatDate(selectedUser.subscription.current_period_end)
                            : 'N/A'}
                        </Text>
                      </View>
                    </View>
                  )}
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      selectedUser.status === 'active' ? styles.suspendButton : styles.activateButton,
                    ]}
                    onPress={() => handleToggleStatus(selectedUser)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.actionButtonText}>
                        {selectedUser.status === 'active' ? 'Suspend' : 'Activate'}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteUser(selectedUser._id)}
                    disabled={actionLoading}
                  >
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  filterBar: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  filterDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  userCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  userCardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  subscriptionText: {
    fontSize: 10,
    color: '#FF9800',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  modalEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    gap: 6,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalDetails: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  suspendButton: {
    backgroundColor: '#FF9800',
  },
  activateButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
});