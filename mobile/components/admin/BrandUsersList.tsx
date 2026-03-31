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

interface BrandUsersListProps {
  onUserSelect?: (user: User) => void;
}

export default function BrandUsersList({ onUserSelect }: BrandUsersListProps) {
  const [brands, setBrands] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');

  const fetchBrands = useCallback(async () => {
    try {
      const response = await adminAPI.getUsers({
        role: 'brand',
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchQuery || undefined,
      });
      setBrands(response.users || []);
    } catch (error: any) {
      console.error('Error fetching brands:', error);
      Alert.alert('Error', error.message || 'Failed to load brands');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterStatus, searchQuery]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBrands();
  };

  const handleBrandPress = (brand: User) => {
    setSelectedBrand(brand);
    setModalVisible(true);
    if (onUserSelect) {
      onUserSelect(brand);
    }
  };

  const handleToggleStatus = async (brand: User) => {
    setActionLoading(true);
    try {
      if (brand.status === 'active') {
        await adminAPI.suspendUser(brand._id);
        Alert.alert('Success', 'Brand suspended successfully');
      } else {
        await adminAPI.activateUser(brand._id);
        Alert.alert('Success', 'Brand activated successfully');
      }
      fetchBrands();
      if (selectedBrand && selectedBrand._id === brand._id) {
        setSelectedBrand(null);
        setModalVisible(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update brand status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to permanently delete this brand? This will delete all campaigns, posts, and associated data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await adminAPI.deleteUser(brandId);
              Alert.alert('Success', 'Brand deleted successfully');
              fetchBrands();
              setModalVisible(false);
              setSelectedBrand(null);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete brand');
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

  const getDisplayName = (brand: User) => {
    return brand.brand_profile?.company_name || brand.username;
  };

  const getProfileCompletion = (brand: User) => {
    const profile = brand.brand_profile || {};
    const requiredFields = ['company_name', 'industry', 'location'];
    const completed = requiredFields.filter(field => profile[field as keyof typeof profile]).length;
    return Math.round((completed / requiredFields.length) * 100);
  };

  const renderBrandCard = ({ item }: { item: User }) => {
    const completion = getProfileCompletion(item);
    const statusColor = getStatusColor(item.status);
    
    return (
      <TouchableOpacity style={styles.brandCard} onPress={() => handleBrandPress(item)}>
        <View style={styles.brandCardHeader}>
          <View style={styles.brandAvatar}>
            <Ionicons name="business" size={24} color="#fff" />
          </View>
          <View style={styles.brandInfo}>
            <Text style={styles.brandName}>{getDisplayName(item)}</Text>
            <Text style={styles.brandEmail}>{item.email}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.brandDetails}>
          {item.brand_profile?.industry && (
            <View style={styles.detailItem}>
              <Ionicons name="business-outline" size={14} color="#666" />
              <Text style={styles.detailText}>{item.brand_profile.industry}</Text>
            </View>
          )}
          {item.brand_profile?.location && (
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.detailText}>{item.brand_profile.location}</Text>
            </View>
          )}
        </View>

        <View style={styles.brandStats}>
          <View style={styles.statItem}>
            <Ionicons name="document-text-outline" size={12} color="#666" />
            <Text style={styles.statText}>Posts: {item.activity_metrics?.post_count || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={12} color="#666" />
            <Text style={styles.statText}>Joined: {formatDate(item.created_at)}</Text>
          </View>
        </View>

        <View style={styles.completionBar}>
          <View style={[styles.completionFill, { width: `${completion}%` }]} />
          <Text style={styles.completionText}>{completion}% Complete</Text>
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
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading brands...</Text>
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
          placeholder="Search brands by name, email, location..."
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
        data={brands}
        keyExtractor={(item) => item._id}
        renderItem={renderBrandCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No brands found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        }
        contentContainerStyle={brands.length === 0 ? styles.emptyList : undefined}
      />

      {/* Brand Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedBrand && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalAvatar}>
                    <Ionicons name="business" size={32} color="#fff" />
                  </View>
                  <Text style={styles.modalName}>{getDisplayName(selectedBrand)}</Text>
                  <Text style={styles.modalEmail}>{selectedBrand.email}</Text>
                  <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedBrand.status) + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(selectedBrand.status) }]} />
                    <Text style={[styles.modalStatusText, { color: getStatusColor(selectedBrand.status) }]}>
                      {selectedBrand.status}
                    </Text>
                  </View>
                </View>

                <ScrollView style={styles.modalDetails}>
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Company Information</Text>
                    <View style={styles.detailRow}>
                      <Ionicons name="business-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Company:</Text>
                      <Text style={styles.detailValue}>{selectedBrand.brand_profile?.company_name || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="briefcase-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Industry:</Text>
                      <Text style={styles.detailValue}>{selectedBrand.brand_profile?.industry || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Location:</Text>
                      <Text style={styles.detailValue}>{selectedBrand.brand_profile?.location || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="call-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Phone:</Text>
                      <Text style={styles.detailValue}>{selectedBrand.brand_profile?.phone_number || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="person-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Contact Person:</Text>
                      <Text style={styles.detailValue}>{selectedBrand.brand_profile?.contact_person_name || 'N/A'}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Activity</Text>
                    <View style={styles.detailRow}>
                      <Ionicons name="document-text-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Total Posts:</Text>
                      <Text style={styles.detailValue}>{selectedBrand.activity_metrics?.post_count || 0}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Joined:</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedBrand.created_at)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="log-in-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Last Login:</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedBrand.last_login)}</Text>
                    </View>
                  </View>

                  {selectedBrand.brand_profile?.description && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Description</Text>
                      <Text style={styles.descriptionText}>{selectedBrand.brand_profile.description}</Text>
                    </View>
                  )}

                  {selectedBrand.brand_profile?.categories && selectedBrand.brand_profile.categories.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Categories</Text>
                      <View style={styles.categoriesContainer}>
                        {selectedBrand.brand_profile.categories.map((cat, index) => (
                          <View key={index} style={styles.categoryChip}>
                            <Text style={styles.categoryText}>{cat}</Text>
                          </View>
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
                      selectedBrand.status === 'active' ? styles.suspendButton : styles.activateButton,
                    ]}
                    onPress={() => handleToggleStatus(selectedBrand)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.actionButtonText}>
                        {selectedBrand.status === 'active' ? 'Suspend' : 'Activate'}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteBrand(selectedBrand._id)}
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
  brandCard: {
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
  brandCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  brandEmail: {
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
  brandDetails: {
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
  brandStats: {
    flexDirection: 'row',
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
    width: 100,
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
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