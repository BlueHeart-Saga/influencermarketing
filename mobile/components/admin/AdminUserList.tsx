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

interface AdminUserListProps {
  onUserSelect?: (user: User) => void;
}

export default function AdminUserList({ onUserSelect }: AdminUserListProps) {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await adminAPI.getUsers({
        role: 'admin',
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchQuery || undefined,
      });
      setAdmins(response.users || []);
    } catch (error: any) {
      console.error('Error fetching admins:', error);
      Alert.alert('Error', error.message || 'Failed to load admins');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterStatus, searchQuery]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdmins();
  };

  const handleAdminPress = (admin: User) => {
    setSelectedAdmin(admin);
    setModalVisible(true);
    if (onUserSelect) {
      onUserSelect(admin);
    }
  };

  const handleToggleStatus = async (admin: User) => {
    setActionLoading(true);
    try {
      if (admin.status === 'active') {
        await adminAPI.suspendUser(admin._id);
        Alert.alert('Success', 'Admin suspended successfully');
      } else {
        await adminAPI.activateUser(admin._id);
        Alert.alert('Success', 'Admin activated successfully');
      }
      fetchAdmins();
      if (selectedAdmin && selectedAdmin._id === admin._id) {
        setSelectedAdmin(null);
        setModalVisible(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update admin status');
    } finally {
      setActionLoading(false);
    }
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

  const getDisplayName = (admin: User) => {
    return admin.username;
  };

  const renderAdminCard = ({ item }: { item: User }) => {
    const statusColor = getStatusColor(item.status);
    
    return (
      <TouchableOpacity style={styles.adminCard} onPress={() => handleAdminPress(item)}>
        <View style={styles.adminCardHeader}>
          <View style={styles.adminAvatar}>
            <Ionicons name="shield" size={24} color="#fff" />
          </View>
          <View style={styles.adminInfo}>
            <Text style={styles.adminName}>{getDisplayName(item)}</Text>
            <Text style={styles.adminEmail}>{item.email}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.adminDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.detailText}>Joined: {formatDate(item.created_at)}</Text>
          </View>
          {item.last_login && (
            <View style={styles.detailItem}>
              <Ionicons name="log-in-outline" size={14} color="#666" />
              <Text style={styles.detailText}>Last Login: {formatDate(item.last_login)}</Text>
            </View>
          )}
        </View>

        <View style={styles.adminStats}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={12} color="#666" />
            <Text style={styles.statText}>Role: Administrator</Text>
          </View>
        </View>
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
    </ScrollView>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F44336" />
        <Text style={styles.loadingText}>Loading admins...</Text>
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
          placeholder="Search admins by name or email..."
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
        data={admins}
        keyExtractor={(item) => item._id}
        renderItem={renderAdminCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No admins found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        }
        contentContainerStyle={admins.length === 0 ? styles.emptyList : undefined}
      />

      {/* Admin Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedAdmin && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalAvatar, { backgroundColor: '#F44336' }]}>
                    <Ionicons name="shield" size={32} color="#fff" />
                  </View>
                  <Text style={styles.modalName}>{getDisplayName(selectedAdmin)}</Text>
                  <Text style={styles.modalEmail}>{selectedAdmin.email}</Text>
                  <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedAdmin.status) + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(selectedAdmin.status) }]} />
                    <Text style={[styles.modalStatusText, { color: getStatusColor(selectedAdmin.status) }]}>
                      {selectedAdmin.status}
                    </Text>
                  </View>
                </View>

                <ScrollView style={styles.modalDetails}>
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Account Information</Text>
                    <View style={styles.detailRow}>
                      <Ionicons name="person-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Username:</Text>
                      <Text style={styles.detailValue}>@{selectedAdmin.username}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Joined:</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedAdmin.created_at)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="log-in-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Last Login:</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedAdmin.last_login)}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Role Information</Text>
                    <View style={styles.detailRow}>
                      <Ionicons name="shield-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Role:</Text>
                      <Text style={styles.detailValue}>Administrator</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="key-outline" size={18} color="#666" />
                      <Text style={styles.detailLabel}>Permissions:</Text>
                      <Text style={styles.detailValue}>Full Access</Text>
                    </View>
                  </View>
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
                      selectedAdmin.status === 'active' ? styles.suspendButton : styles.activateButton,
                    ]}
                    onPress={() => handleToggleStatus(selectedAdmin)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.actionButtonText}>
                        {selectedAdmin.status === 'active' ? 'Suspend' : 'Activate'}
                      </Text>
                    )}
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
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  adminCard: {
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
  adminCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  adminAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  adminEmail: {
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
  adminDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
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
  adminStats: {
    flexDirection: 'row',
    gap: 16,
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
    backgroundColor: '#F44336',
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
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
});