import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  FlatList,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import adminContactAPI, { ContactMessage, ContactStats } from '../../services/admincontactapi';

// Stat Card Component
const StatCard = ({ title, value, icon, color, subtitle, onPress }: any) => {
  const getIconColor = () => {
    switch (color) {
      case 'primary': return '#2196F3';
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      case 'info': return '#00BCD4';
      default: return '#757575';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: getIconColor(), borderLeftWidth: 4 }]}
      onPress={onPress}
    >
      <View style={styles.statCardHeader}>
        <Text style={styles.statCardTitle}>{title}</Text>
        <View style={[styles.statCardIcon, { backgroundColor: getIconColor() + '20' }]}>
          <Ionicons name={icon as any} size={24} color={getIconColor()} />
        </View>
      </View>
      <Text style={styles.statCardValue}>{value}</Text>
      {subtitle && <Text style={styles.statCardSubtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );
};

// Status Badge Component
const StatusBadge = ({ read, status }: { read: boolean; status: string }) => {
  const color = adminContactAPI.getStatusColor(read, status);
  const label = adminContactAPI.getStatusLabel(read, status);
  const bgColor = adminContactAPI.getStatusBackgroundColor(read, status);

  return (
    <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusBadgeText, { color }]}>{label}</Text>
    </View>
  );
};

// Contact Message Card Component
const ContactMessageCard = ({ message, onPress, onMarkRead }: { message: ContactMessage; onPress: () => void; onMarkRead: (id: string) => void }) => {
  const relativeTime = adminContactAPI.getRelativeTime(message.submitted_at);

  return (
    <TouchableOpacity
      style={[styles.messageCard, !message.read && styles.unreadCard]}
      onPress={onPress}
    >
      <View style={styles.messageHeader}>
        <View style={styles.senderInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{message.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.senderDetails}>
            <Text style={styles.senderName}>{message.name}</Text>
            <Text style={styles.senderEmail}>{message.email}</Text>
          </View>
        </View>
        <StatusBadge read={message.read} status={message.status} />
      </View>

      {message.subject && (
        <Text style={styles.messageSubject} numberOfLines={1}>
          {message.subject}
        </Text>
      )}

      <Text style={styles.messagePreview} numberOfLines={2}>
        {message.message}
      </Text>

      <View style={styles.messageFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="time-outline" size={14} color="#999" />
          <Text style={styles.footerText}>{relativeTime}</Text>
        </View>
        
        {!message.read && (
          <TouchableOpacity
            style={styles.markReadButton}
            onPress={() => onMarkRead(message._id)}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#2196F3" />
            <Text style={styles.markReadText}>Mark Read</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Message Detail Modal
const MessageDetailModal = ({ visible, message, onClose, onMarkRead }: any) => {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);

  if (!message) return null;

  const handleMarkRead = async () => {
    try {
      await adminContactAPI.markMessageAsRead(message._id);
      onMarkRead(message._id);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to mark as read');
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Re: ${message.subject || 'Contact Form Submission'}`);
    const body = encodeURIComponent(`\n\n---\nOriginal message from ${message.name} (${message.submitted_at}):\n${message.message}`);
    Linking.openURL(`mailto:${message.email}?subject=${subject}&body=${body}`);
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Message Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Sender Info */}
            <View style={styles.detailSection}>
              <View style={styles.detailSenderHeader}>
                <View style={styles.detailAvatar}>
                  <Text style={styles.detailAvatarText}>{message.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.detailSenderInfo}>
                  <Text style={styles.detailSenderName}>{message.name}</Text>
                  <Text style={styles.detailSenderEmail}>{message.email}</Text>
                </View>
                <StatusBadge read={message.read} status={message.status} />
              </View>
            </View>

            {/* Subject */}
            {message.subject && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Subject</Text>
                <View style={styles.subjectContainer}>
                  <Text style={styles.subjectText}>{message.subject}</Text>
                </View>
              </View>
            )}

            {/* Message */}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Message</Text>
              <View style={styles.messageContainer}>
                <Text style={styles.messageText}>{message.message}</Text>
              </View>
            </View>

            {/* Timestamp */}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Submitted</Text>
              <View style={styles.timestampContainer}>
                <Ionicons name="time-outline" size={18} color="#666" />
                <Text style={styles.timestampText}>{formatFullDate(message.submitted_at)}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            {!message.read && (
              <TouchableOpacity style={styles.markReadModalButton} onPress={handleMarkRead}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Mark as Read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.replyButton} onPress={handleEmail}>
              <Ionicons name="mail" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Reply via Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Filter Modal Component
const FilterModal = ({ visible, onClose, showUnreadOnly, onApplyFilter }: any) => {
  const [tempShowUnreadOnly, setTempShowUnreadOnly] = useState(showUnreadOnly);

  const handleApply = () => {
    onApplyFilter(tempShowUnreadOnly);
    onClose();
  };

  const handleReset = () => {
    setTempShowUnreadOnly(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Messages</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterModalBody}>
            <Text style={styles.filterSectionTitle}>Status</Text>
            <TouchableOpacity
              style={[styles.filterOption, tempShowUnreadOnly && styles.filterOptionActive]}
              onPress={() => setTempShowUnreadOnly(!tempShowUnreadOnly)}
            >
              <View style={styles.filterOptionLeft}>
                <Ionicons name="mail-unread" size={20} color={tempShowUnreadOnly ? '#fff' : '#666'} />
                <Text style={[styles.filterOptionText, tempShowUnreadOnly && styles.filterOptionTextActive]}>
                  Unread Only
                </Text>
              </View>
              {tempShowUnreadOnly && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.filterModalActions}>
            <TouchableOpacity style={styles.resetFilterButton} onPress={handleReset}>
              <Text style={styles.resetFilterText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyFilterButton} onPress={handleApply}>
              <Text style={styles.applyFilterText}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main Component
export default function ContactUsTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      const data = await adminContactAPI.getContactMessages();
      setMessages(data);
      
      // Apply filters
      let filtered = data;
      if (showUnreadOnly) {
        filtered = adminContactAPI.filterByReadStatus(filtered, true);
      }
      if (searchText) {
        filtered = adminContactAPI.searchMessages(filtered, searchText);
      }
      setFilteredMessages(filtered);
      
      // Update stats
      setStats(adminContactAPI.getContactStats(data));
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', error.message || 'Failed to load messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showUnreadOnly, searchText]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMessages();
  };

  const applyFilter = (unreadOnly: boolean) => {
    setShowUnreadOnly(unreadOnly);
    
    let filtered = messages;
    if (unreadOnly) {
      filtered = adminContactAPI.filterByReadStatus(filtered, true);
    }
    if (searchText) {
      filtered = adminContactAPI.searchMessages(filtered, searchText);
    }
    setFilteredMessages(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    let filtered = messages;
    if (showUnreadOnly) {
      filtered = adminContactAPI.filterByReadStatus(filtered, true);
    }
    if (text) {
      filtered = adminContactAPI.searchMessages(filtered, text);
    }
    setFilteredMessages(filtered);
  };

  const handleMarkRead = async (id: string) => {
    try {
      await adminContactAPI.markMessageAsRead(id);
      
      // Update local state
      const updatedMessages = messages.map(msg =>
        msg._id === id ? { ...msg, read: true, status: 'read' as const } : msg
      );
      setMessages(updatedMessages);
      
      // Re-apply filters
      applyFilter(showUnreadOnly);
      
      // Update stats
      setStats(adminContactAPI.getContactStats(updatedMessages));
      
      // Update selected message if open
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage({ ...selectedMessage, read: true, status: 'read' });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to mark as read');
    }
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setDetailModalVisible(true);
  };

  const handleStatPress = (type: 'all' | 'unread') => {
    if (type === 'unread') {
      setShowUnreadOnly(true);
      applyFilter(true);
    } else {
      setShowUnreadOnly(false);
      applyFilter(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Cards */}
      {stats && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
          <View style={styles.statsContainer}>
            <StatCard
              title="Total"
              value={stats.total}
              icon="mail"
              color="primary"
              onPress={() => handleStatPress('all')}
            />
            <StatCard
              title="Unread"
              value={stats.unread}
              icon="mail-unread"
              color="error"
              onPress={() => handleStatPress('unread')}
            />
            <StatCard
              title="Read"
              value={stats.read}
              icon="mail-open"
              color="info"
              onPress={() => handleStatPress('all')}
            />
            <StatCard
              title="Replied"
              value={stats.replied}
              icon="checkmark-done"
              color="success"
              onPress={() => handleStatPress('all')}
            />
          </View>
        </ScrollView>
      )}

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or message..."
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
          {searchText !== '' && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.filterButton, showUnreadOnly && styles.filterButtonActive]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={20} color={showUnreadOnly ? '#2196F3' : '#666'} />
        </TouchableOpacity>
      </View>

      {/* Active Filter Display */}
      {showUnreadOnly && (
        <View style={styles.activeFilterContainer}>
          <Text style={styles.activeFilterLabel}>Filtered by:</Text>
          <View style={styles.activeFilterChip}>
            <Ionicons name="mail-unread" size={14} color="#F44336" />
            <Text style={styles.activeFilterText}>Unread Only</Text>
            <TouchableOpacity onPress={() => applyFilter(false)}>
              <Ionicons name="close-circle" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="mail-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No messages found</Text>
          <Text style={styles.emptyText}>
            {searchText || showUnreadOnly
              ? 'Try adjusting your search or filters'
              : 'Contact form submissions will appear here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMessages}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ContactMessageCard
              message={item}
              onPress={() => handleViewMessage(item)}
              onMarkRead={handleMarkRead}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Message Detail Modal */}
      <MessageDetailModal
        visible={detailModalVisible}
        message={selectedMessage}
        onClose={() => setDetailModalVisible(false)}
        onMarkRead={handleMarkRead}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        showUnreadOnly={showUnreadOnly}
        onApplyFilter={applyFilter}
      />
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
  statsScroll: {
    flexGrow: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    minWidth: 110,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statCardSubtitle: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
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
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  activeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  activeFilterLabel: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeFilterText: {
    fontSize: 12,
    color: '#333',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  senderDetails: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  senderEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  messageSubject: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2196F3',
    marginBottom: 8,
  },
  messagePreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: '#999',
  },
  markReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
  },
  markReadText: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '500',
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
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSenderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailAvatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  detailSenderInfo: {
    flex: 1,
  },
  detailSenderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  detailSenderEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subjectContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 10,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2196F3',
  },
  messageContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 10,
    minHeight: 120,
  },
  messageText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 10,
  },
  timestampText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  markReadModalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  replyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  filterModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  filterModalBody: {
    padding: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  filterOptionActive: {
    backgroundColor: '#2196F3',
  },
  filterOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  filterModalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  resetFilterButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  resetFilterText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  applyFilterButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 10,
  },
  applyFilterText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});