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

interface InfluencerUsersListProps {
  onUserSelect?: (user: User) => void;
}

export default function InfluencerUsersList({ onUserSelect }: InfluencerUsersListProps) {
  const [influencers, setInfluencers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInfluencer, setSelectedInfluencer] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');

  const fetchInfluencers = useCallback(async () => {
    try {
      const response = await adminAPI.getUsers({
        role: 'influencer',
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchQuery || undefined,
      });
      setInfluencers(response.users || []);
    } catch (error: any) {
      console.error('Error fetching influencers:', error);
      Alert.alert('Error', error.message || 'Failed to load influencers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterStatus, searchQuery]);

  useEffect(() => {
    fetchInfluencers();
  }, [fetchInfluencers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInfluencers();
  };

  const handleInfluencerPress = (influencer: User) => {
    setSelectedInfluencer(influencer);
    setModalVisible(true);
    if (onUserSelect) {
      onUserSelect(influencer);
    }
  };

  const handleToggleStatus = async (influencer: User) => {
    setActionLoading(true);
    try {
      if (influencer.status === 'active') {
        await adminAPI.suspendUser(influencer._id);
        Alert.alert('Success', 'Influencer suspended successfully');
      } else {
        await adminAPI.activateUser(influencer._id);
        Alert.alert('Success', 'Influencer activated successfully');
      }
      fetchInfluencers();
      if (selectedInfluencer && selectedInfluencer._id === influencer._id) {
        setSelectedInfluencer(null);
        setModalVisible(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update influencer status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteInfluencer = async (influencerId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to permanently delete this influencer? This will delete all posts, collaborations, and associated data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await adminAPI.deleteUser(influencerId);
              Alert.alert('Success', 'Influencer deleted successfully');
              fetchInfluencers();
              setModalVisible(false);
              setSelectedInfluencer(null);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete influencer');
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

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'suspended': return '#FF9800';
      case 'banned': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getDisplayName = (influencer: User) => {
    return influencer.influencer_profile?.full_name || 
           influencer.influencer_profile?.nickname || 
           influencer.username;
  };

  const getProfileCompletion = (influencer: User) => {
    const profile = influencer.influencer_profile || {};
    const requiredFields = ['full_name', 'niche', 'location'];
    const completed = requiredFields.filter(field => profile[field as keyof typeof profile]).length;
    return Math.round((completed / requiredFields.length) * 100);
  };

  const renderInfluencerCard = ({ item }: { item: User }) => {
    const completion = getProfileCompletion(item);
    const statusColor = getStatusColor(item.status);
    const followers = item.activity_metrics?.followers_count || item.influencer_profile?.follower_count || 0;
    
    return (
      <TouchableOpacity style={styles.influencerCard} onPress={() => handleInfluencerPress(item)}>
        <View style={styles.influencerCardHeader}>
          <View style={styles.influencerAvatar}>
            <Ionicons name="person" size={24} color="#fff" />
          </View>
          <View style={styles.influencerInfo}>
            <Text style={styles.influencerName}>{getDisplayName(item)}</Text>
            <Text style={styles.influencerUsername}>@{item.username}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.influencerDetails}>
          {item.influencer_profile?.niche && (
            <View style={styles.detailItem}>
              <Ionicons name="pricetag-outline" size={14} color="#666" />
              <Text style={styles.detailText}>{item.influencer_profile.niche}</Text>
            </View>
          )}
          {item.influencer_profile?.location && (
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.detailText}>{item.influencer_profile.location}</Text>
            </View>
          )}
        </View>

        <View style={styles.influencerStats}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={12} color="#666" />
            <Text style={styles.statText}>Followers: {formatNumber(followers)}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="document-text-outline" size={12} color="#666" />
            <Text style={styles.statText}>Posts: {item.activity_metrics?.post_count || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={12} color="#666" />
            <Text style={styles.statText}>Joined: {formatDate(item.created_at)}</Text>
          </View>
        </View>

        <View style={styles.completionBar}>
          <View style={[styles.completionFill, { width: `${completion}%` }]} />
          <Text style={styles.completionText}>{completion}% Complete</Text>
        </View>

        {item.influencer_profile?.engagement_rate && (
          <View style={styles.engagementBadge}>
            <Ionicons name="trending-up" size={12} color="#4CAF50" />
            <Text style={styles.engagementText}>Engagement: {item.influencer_profile.engagement_rate}%</Text>
          </View>
        )}

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
  };

  const renderFilterBar = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
      <TouchableOpacity
        style={[styles.filterChip, filterStatus === 'all' && styles.filterChipActive]}
        onPress={() => setFilterStatus('all')}
      >
        <Text style={[styles.filterChipText, filterStatus === 'all' && styles.filterChipTextActive]}>
          All
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterChip, filterStatus === 'active' && styles.filterChipActive]}
        onPress={() => setFilterStatus('active')}
      >
        <Ionicons name="checkmark-circle" size={16} color={filterStatus === 'active' ? '#fff' : '#4CAF50'} />
        <Text style={[styles.filterChipText, filterStatus === 'active' && styles.filterChipTextActive]}>
          Active
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterChip, filterStatus === 'suspended' && styles.filterChipActive]}
        onPress={() => setFilterStatus('suspended')}
      >
        <Ionicons name="pause-circle" size={16} color={filterStatus === 'suspended' ? '#fff' : '#FF9800'} />
        <Text style={[styles.filterChipText, filterStatus === 'suspended' && styles.filterChipTextActive]}>
          Suspended
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterChip, filterStatus === 'banned' && styles.filterChipActive]}
        onPress={() => setFilterStatus('banned')}
      >
        <Ionicons name="ban" size={16} color={filterStatus === 'banned' ? '#fff' : '#F44336'} />
        <Text style={[styles.filterChipText, filterStatus === 'banned' && styles.filterChipTextActive]}>
          Banned
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <Text style={styles.loadingText}>Loading influencers...</Text>
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
          placeholder="Search influencers by name, email, niche..."
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
        data={influencers}
        keyExtractor={(item) => item._id}
        renderItem={renderInfluencerCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="person-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No influencers found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        }
        contentContainerStyle={influencers.length === 0 ? styles.emptyList : undefined}
      />

      {/* Influencer Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedInfluencer && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalAvatar, { backgroundColor: '#9C27B0' }]}>
                    <Ionicons name="person" size={32} color="#fff" />
                  </View>
                  <Text style={styles.modalName}>{getDisplayName(selectedInfluencer)}</Text>
                  <Text style={styles.modalUsername}>@{selectedInfluencer.username}</Text>
                  <Text style={styles.modalEmail}>{selectedInfluencer.email}</Text>
                  <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedInfluencer.status) + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(selectedInfluencer.status) }]} />
                    <Text style={[styles.modalStatusText, { color: getStatusColor(selectedInfluencer.status) }]}>
                      {selectedInfluencer.status}
                    </Text>
                  </View>
                </View>

                <ScrollView style={styles.modalDetails}>
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    <View style={styles.detailRow}>
                      <Ionicons name="person-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Full Name:</Text>
                      <Text style={styles.detailValue}>{selectedInfluencer.influencer_profile?.full_name || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="pricetag-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Nickname:</Text>
                      <Text style={styles.detailValue}>{selectedInfluencer.influencer_profile?.nickname || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="briefcase-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Niche:</Text>
                      <Text style={styles.detailValue}>{selectedInfluencer.influencer_profile?.niche || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Location:</Text>
                      <Text style={styles.detailValue}>{selectedInfluencer.influencer_profile?.location || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="call-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Phone:</Text>
                      <Text style={styles.detailValue}>{selectedInfluencer.influencer_profile?.phone_number || 'N/A'}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Audience & Engagement</Text>
                    <View style={styles.detailRow}>
                      <Ionicons name="people-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Followers:</Text>
                      <Text style={styles.detailValue}>
                        {formatNumber(selectedInfluencer.activity_metrics?.followers_count || selectedInfluencer.influencer_profile?.follower_count)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="trending-up-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Engagement Rate:</Text>
                      <Text style={styles.detailValue}>
                        {selectedInfluencer.influencer_profile?.engagement_rate || 'N/A'}%
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="document-text-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Total Posts:</Text>
                      <Text style={styles.detailValue}>{selectedInfluencer.activity_metrics?.post_count || 0}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Account Activity</Text>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Joined:</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedInfluencer.created_at)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="log-in-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Last Login:</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedInfluencer.last_login)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Days Active:</Text>
                      <Text style={styles.detailValue}>{selectedInfluencer.activity_metrics?.days_since_registration || 0}</Text>
                    </View>
                  </View>

                  {selectedInfluencer.influencer_profile?.bio && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Bio</Text>
                      <Text style={styles.bioText}>{selectedInfluencer.influencer_profile.bio}</Text>
                    </View>
                  )}

                  {selectedInfluencer.influencer_profile?.social_links && 
                   Object.values(selectedInfluencer.influencer_profile.social_links).some(Boolean) && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Social Links</Text>
                      <View style={styles.socialLinksContainer}>
                        {Object.entries(selectedInfluencer.influencer_profile.social_links).map(([platform, url]) => (
                          url && (
                            <View key={platform} style={styles.socialLink}>
                              <Ionicons 
                                name={platform === 'instagram' ? 'logo-instagram' : 
                                      platform === 'youtube' ? 'logo-youtube' : 
                                      platform === 'tiktok' ? 'logo-tiktok' : 
                                      platform === 'twitter' ? 'logo-twitter' : 'link'} 
                                size={16} 
                                color="#666" 
                              />
                              <Text style={styles.socialLinkText}>{platform}</Text>
                            </View>
                          )
                        ))}
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
                      selectedInfluencer.status === 'active' ? styles.suspendButton : styles.activateButton,
                    ]}
                    onPress={() => handleToggleStatus(selectedInfluencer)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.actionButtonText}>
                        {selectedInfluencer.status === 'active' ? 'Suspend' : 'Activate'}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteInfluencer(selectedInfluencer._id)}
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
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  influencerCard: {
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
  influencerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  influencerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  influencerInfo: {
    flex: 1,
  },
  influencerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  influencerUsername: {
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
  influencerDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
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
  influencerStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: '#666',
  },
  completionBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  completionFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  completionText: {
    position: 'absolute',
    right: 0,
    top: -20,
    fontSize: 10,
    color: '#4CAF50',
  },
  engagementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 4,
  },
  engagementText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '500',
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
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  modalUsername: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  modalEmail: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
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
    width: 110,
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  bioText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  socialLinkText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
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