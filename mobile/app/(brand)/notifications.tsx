// C:\Sagadevan\quickbox\mobile\app\(brand)\notifications.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Alert,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { brandNotificationAPI, Notification } from '../../services/brandNotificationAPI';

const { width, height } = Dimensions.get('window');

// Priority configuration
const priorityConfig = {
  low: { color: '#9E9E9E', label: 'Low', icon: 'information-circle-outline' },
  medium: { color: '#2196F3', label: 'Medium', icon: 'megaphone-outline' },
  high: { color: '#FF9800', label: 'High', icon: 'alert-circle-outline' },
  urgent: { color: '#F44336', label: 'Urgent', icon: 'warning-outline' }
};

// Type icon mapping
const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    campaign_application: 'megaphone-outline',
    campaign_approved: 'checkmark-circle-outline',
    campaign_created: 'add-circle-outline',
    campaign_status_change: 'sync-outline',
    campaign_performance: 'trending-up-outline',
    subscription_update: 'card-outline',
    trial_ending: 'alert-circle-outline',
    payment_success: 'cash-outline',
    payment_failed: 'close-circle-outline',
    payment_pending: 'time-outline',
    new_message: 'chatbubble-outline',
    media_submitted: 'image-outline',
    media_approved: 'checkmark-done-circle-outline',
    profile_incomplete: 'person-outline',
    profile_updated: 'person-add-outline',
    dashboard_alert: 'notifications-outline',
    system_update: 'cloud-upload-outline',
  };
  return icons[type] || 'notifications-outline';
};

// Notification Card Component
const NotificationCard = ({
  notification,
  onPress,
  onMarkRead,
  onDelete,
  isDarkMode = false
}: {
  notification: Notification;
  onPress: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
  isDarkMode?: boolean;
}) => {
  const priority = priorityConfig[notification.priority] || priorityConfig.medium;
  const iconName = getTypeIcon(notification.type);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[
          styles.notificationCard,
          !notification.is_read && styles.unreadCard,
          isDarkMode && styles.darkCard
        ]}
      >
        {/* Priority Indicator */}
        <View style={[styles.priorityIndicator, { backgroundColor: priority.color }]} />

        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: priority.color + '20' }]}>
          <Ionicons name={iconName as any} size={24} color={priority.color} />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, !notification.is_read && styles.unreadTitle]}>
              {notification.title}
            </Text>
            <View style={[styles.priorityBadge, { backgroundColor: priority.color + '20' }]}>
              <Text style={[styles.priorityText, { color: priority.color }]}>
                {priority.label}
              </Text>
            </View>
          </View>

          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>

          {/* Metadata */}
          {notification.metadata ? (
            <View style={styles.metadataContainer}>
              {notification.metadata.campaign_title ? (
                <View style={styles.metadataChip}>
                  <Ionicons name="megaphone-outline" size={12} color="#666" />
                  <Text style={styles.metadataText} numberOfLines={1}>
                    {notification.metadata.campaign_title}
                  </Text>
                </View>
              ) : null}
              {notification.metadata.influencer_username ? (
                <View style={styles.metadataChip}>
                  <Ionicons name="person-outline" size={12} color="#666" />
                  <Text style={styles.metadataText}>
                    {notification.metadata.influencer_username}
                  </Text>
                </View>
              ) : null}
              {notification.metadata.amount !== undefined && notification.metadata.amount !== null ? (
                <View style={styles.metadataChip}>
                  <Ionicons name="cash-outline" size={12} color="#4CAF50" />
                  <Text style={[styles.metadataText, { color: '#4CAF50' }]}>
                    ${notification.metadata.amount}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.dateText}>
              {formatDate(notification.created_at)}
            </Text>
            <View style={styles.actionButtons}>
              {!notification.is_read ? (
                <TouchableOpacity onPress={onMarkRead} style={styles.actionButton}>
                  <Ionicons name="mail-open-outline" size={18} color="#2196F3" />
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
                <Ionicons name="trash-outline" size={18} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Stats Card Component
const StatsCard = ({ stats }: { stats: any }) => {
  return (
    <View
      style={[styles.statsCard, { backgroundColor: '#0f6eea' }]}
    >
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="notifications-outline" size={24} color="#FFF" />
          <Text style={styles.statValue}>{stats.total_count}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="mail-unread-outline" size={24} color="#FFF" />
          <Text style={styles.statValue}>{stats.unread_count}</Text>
          <Text style={styles.statLabel}>Unread</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="alert-circle-outline" size={24} color="#FFF" />
          <Text style={styles.statValue}>{stats.urgent_priority_count}</Text>
          <Text style={styles.statLabel}>Urgent</Text>
        </View>
      </View>
    </View>
  );
};

// Main Component
const BrandNotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total_count: 0,
    unread_count: 0,
    high_priority_count: 0,
    urgent_priority_count: 0,
    read_count: 0
  });
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'urgent'>('all');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await brandNotificationAPI.getNotifications(0, 100, activeTab === 'unread');
      setNotifications(response.notifications || []);

      // Fetch stats
      const statsResponse = await brandNotificationAPI.getNotificationStats();
      setStats(statsResponse);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You must be a brand to view these notifications.');
      } else {
        setError('Failed to load notifications. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [activeTab])
  );

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // Handle mark as read
  const handleMarkAsRead = async (notification: Notification) => {
    try {
      await brandNotificationAPI.markAsRead(notification._id);

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n._id === notification._id ? { ...n, is_read: true } : n
        )
      );
      setStats(prev => ({ ...prev, unread_count: prev.unread_count - 1 }));

      setSuccess('Notification marked as read');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await brandNotificationAPI.markAllAsRead();

              // Update local state
              setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true }))
              );
              setStats(prev => ({ ...prev, unread_count: 0 }));

              setSuccess('All notifications marked as read');
              setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
              Alert.alert('Error', 'Failed to mark all as read');
            }
          }
        }
      ]
    );
  };

  // Handle delete
  const handleDelete = async (notification: Notification) => {
    try {
      await brandNotificationAPI.deleteNotification(notification._id);

      // Update local state
      setNotifications(prev =>
        prev.filter(n => n._id !== notification._id)
      );
      if (!notification.is_read) {
        setStats(prev => ({ ...prev, unread_count: prev.unread_count - 1 }));
      }
      setStats(prev => ({ ...prev, total_count: prev.total_count - 1 }));

      setSuccess('Notification deleted');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  // Handle notification press
  const handleNotificationPress = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      handleMarkAsRead(notification);
    }

    // Navigate based on action URL
    if (notification.action_url) {
      // Handle navigation - you can use navigation.navigate here
      // For now, just show alert
      Alert.alert('Navigate', `Would navigate to: ${notification.action_url}`);
    }
  };

  // Filter notifications based on tab
  const getFilteredNotifications = () => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'unread') return notifications.filter(n => !n.is_read);
    if (activeTab === 'urgent') return notifications.filter(n => n.priority === 'urgent');
    return notifications;
  };

  const filteredNotifications = getFilteredNotifications();

  // Render loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0f6eea" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={24} color="#0f6eea" />
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      {stats.total_count > 0 && <StatsCard stats={stats} />}

      {/* Error/Success Messages */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchNotifications}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {success && (
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.successText}>{success}</Text>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All ({stats.total_count})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'unread' && styles.activeTab]}
          onPress={() => setActiveTab('unread')}
        >
          <Text style={[styles.tabText, activeTab === 'unread' && styles.activeTabText]}>
            Unread ({stats.unread_count})
          </Text>
          {stats.unread_count > 0 && <View style={styles.unreadDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'urgent' && styles.activeTab]}
          onPress={() => setActiveTab('urgent')}
        >
          <Text style={[styles.tabText, activeTab === 'urgent' && styles.activeTabText]}>
            Urgent ({stats.urgent_priority_count})
          </Text>
        </TouchableOpacity>

        {stats.unread_count > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
            <Ionicons name="mail-open-outline" size={18} color="#2196F3" />
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={() => handleNotificationPress(item)}
            onMarkRead={() => handleMarkAsRead(item)}
            onDelete={() => {
              setSelectedNotification(item);
              setDeleteModalVisible(true);
            }}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0f6eea']}
            tintColor="#0f6eea"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'unread'
                ? "You're all caught up! No unread notifications."
                : activeTab === 'urgent'
                  ? "No urgent notifications at the moment."
                  : "You don't have any notifications yet."}
            </Text>
          </View>
        }
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="trash-outline" size={24} color="#F44336" />
              <Text style={styles.modalTitle}>Delete Notification</Text>
            </View>

            <Text style={styles.modalMessage}>
              Are you sure you want to delete this notification? This action cannot be undone.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={() => {
                  if (selectedNotification) {
                    handleDelete(selectedNotification);
                  }
                  setDeleteModalVisible(false);
                }}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Add these missing styles to the styles object in your file

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  statsCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#0f6eea20',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#0f6eea',
    fontWeight: '600',
  },
  unreadDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    gap: 4,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2196F3',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#F8F9FF',
    borderLeftWidth: 3,
    borderLeftColor: '#0f6eea',
  },
  darkCard: {
    backgroundColor: '#1E1E2E',
  },
  priorityIndicator: {
    width: 4,
    height: '100%',
  },
  iconContainer: {
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    paddingLeft: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#0f6eea',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  metadataChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  metadataText: {
    fontSize: 11,
    color: '#666',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#F44336',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: '#4CAF50',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 16,
  },
  viewAllButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#667eea',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    maxWidth: 320,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default BrandNotificationsScreen;