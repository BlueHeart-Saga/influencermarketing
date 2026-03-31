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
    Platform,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import adminFeedbackAPI, { Feedback, FeedbackStatus, FeedbackType, FeedbackStats } from '../../services/adminfeedbackapi';

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

// Status Chip Component
const StatusChip = ({ status }: { status: FeedbackStatus }) => {
    const color = adminFeedbackAPI.getStatusColor(status);
    const label = adminFeedbackAPI.getStatusLabel(status);

    return (
        <View style={[styles.statusChip, { backgroundColor: color + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: color }]} />
            <Text style={[styles.statusChipText, { color }]}>{label}</Text>
        </View>
    );
};

// Type Chip Component
const TypeChip = ({ type }: { type: FeedbackType }) => {
    const color = adminFeedbackAPI.getTypeColor(type);
    const icon = adminFeedbackAPI.getTypeIcon(type);
    const label = adminFeedbackAPI.getTypeLabel(type);

    return (
        <View style={[styles.typeChip, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon as any} size={12} color={color} />
            <Text style={[styles.typeChipText, { color }]}>{label}</Text>
        </View>
    );
};

// Feedback Card Component
const FeedbackCard = ({ item, onPress, onStatusUpdate }: { item: Feedback; onPress: () => void; onStatusUpdate: (id: string, status: FeedbackStatus) => void }) => {
    const relativeTime = adminFeedbackAPI.getRelativeTime(item.created_at);

    return (
        <TouchableOpacity style={styles.feedbackCard} onPress={onPress}>
            <View style={styles.feedbackHeader}>
                <View style={styles.feedbackType}>
                    <TypeChip type={item.type} />
                    <StatusChip status={item.status} />
                </View>
                {item.email && (
                    <View style={styles.emailBadge}>
                        <Ionicons name="mail-outline" size={12} color="#666" />
                        <Text style={styles.emailText} numberOfLines={1}>{item.email}</Text>
                    </View>
                )}
            </View>

            <Text style={styles.feedbackMessage} numberOfLines={2}>
                {item.message}
            </Text>

            <View style={styles.feedbackFooter}>
                <View style={styles.footerItem}>
                    <Ionicons name="time-outline" size={14} color="#999" />
                    <Text style={styles.footerText}>{relativeTime}</Text>
                </View>
                {item.page_url && (
                    <View style={styles.footerItem}>
                        <Ionicons name="link-outline" size={14} color="#999" />
                        <Text style={styles.footerText} numberOfLines={1}>{item.page_url}</Text>
                    </View>
                )}
            </View>

            {item.status !== 'resolved' && (
                <TouchableOpacity
                    style={styles.resolveButton}
                    onPress={() => onStatusUpdate(item._id, 'resolved')}
                >
                    <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                    <Text style={styles.resolveButtonText}>Mark Resolved</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

// Feedback Detail Modal
const FeedbackDetailModal = ({ visible, feedback, onClose, onStatusUpdate }: any) => {
    const [updating, setUpdating] = useState(false);

    const handleStatusUpdate = async (status: FeedbackStatus) => {
        if (!feedback) return;
        setUpdating(true);
        try {
            await adminFeedbackAPI.updateFeedbackStatus(feedback._id, status);
            onStatusUpdate(feedback._id, status);
            Alert.alert('Success', `Feedback marked as ${adminFeedbackAPI.getStatusLabel(status)}`);
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    if (!feedback) return null;

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
                        <Text style={styles.modalTitle}>Feedback Details</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        {/* Type and Status */}
                        <View style={styles.modalInfoRow}>
                            <View style={styles.modalInfoItem}>
                                <Text style={styles.modalInfoLabel}>Type</Text>
                                <TypeChip type={feedback.type} />
                            </View>
                            <View style={styles.modalInfoItem}>
                                <Text style={styles.modalInfoLabel}>Status</Text>
                                <StatusChip status={feedback.status} />
                            </View>
                        </View>

                        {/* Email */}
                        {feedback.email && (
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Contact Email</Text>
                                <View style={styles.emailContainer}>
                                    <Ionicons name="mail-outline" size={18} color="#666" />
                                    <Text style={styles.emailValue}>{feedback.email}</Text>
                                </View>
                            </View>
                        )}

                        {/* Page URL */}
                        {feedback.page_url && (
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Page URL</Text>
                                <View style={styles.urlContainer}>
                                    <Text style={styles.urlValue}>{feedback.page_url}</Text>
                                </View>
                            </View>
                        )}

                        {/* Message */}
                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>Message</Text>
                            <View style={styles.messageContainer}>
                                <Text style={styles.messageValue}>{feedback.message}</Text>
                            </View>
                        </View>

                        {/* Timestamps */}
                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>Timestamps</Text>
                            <View style={styles.timestampRow}>
                                <Ionicons name="time-outline" size={16} color="#666" />
                                <Text style={styles.timestampLabel}>Created:</Text>
                                <Text style={styles.timestampValue}>{adminFeedbackAPI.formatDate(feedback.created_at)}</Text>
                            </View>
                            {feedback.updated_at && (
                                <View style={styles.timestampRow}>
                                    <Ionicons name="refresh-outline" size={16} color="#666" />
                                    <Text style={styles.timestampLabel}>Updated:</Text>
                                    <Text style={styles.timestampValue}>{adminFeedbackAPI.formatDate(feedback.updated_at)}</Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    {/* Status Update Buttons */}
                    <View style={styles.modalActions}>
                        <Text style={styles.modalActionsTitle}>Update Status</Text>
                        <View style={styles.statusButtons}>
                            {(['new', 'reviewed', 'in_progress', 'resolved'] as FeedbackStatus[]).map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.statusButton,
                                        feedback.status === status && styles.statusButtonActive,
                                        { backgroundColor: adminFeedbackAPI.getStatusColor(status) + '20' }
                                    ]}
                                    onPress={() => handleStatusUpdate(status)}
                                    disabled={updating || feedback.status === status}
                                >
                                    <Text
                                        style={[
                                            styles.statusButtonText,
                                            feedback.status === status && styles.statusButtonTextActive,
                                            { color: adminFeedbackAPI.getStatusColor(status) }
                                        ]}
                                    >
                                        {adminFeedbackAPI.getStatusLabel(status)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// Filter Modal Component
const FilterModal = ({ visible, onClose, filterStatus, filterType, onApplyFilters }: any) => {
    const [tempStatus, setTempStatus] = useState(filterStatus);
    const [tempType, setTempType] = useState(filterType);

    const statusOptions: { value: FeedbackStatus | 'all'; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'new', label: 'New' },
        { value: 'reviewed', label: 'Reviewed' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'resolved', label: 'Resolved' },
    ];

    const typeOptions: { value: FeedbackType | 'all'; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'general', label: 'General' },
        { value: 'bug', label: 'Bug Report' },
        { value: 'feature', label: 'Feature Request' },
        { value: 'help', label: 'Help' },
    ];

    const handleApply = () => {
        onApplyFilters(tempStatus, tempType);
        onClose();
    };

    const handleReset = () => {
        setTempStatus('all');
        setTempType('all');
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
                        <Text style={styles.modalTitle}>Filter Feedback</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.filterModalBody}>
                        <Text style={styles.filterSectionTitle}>Status</Text>
                        <View style={styles.filterOptions}>
                            {statusOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.filterOption,
                                        tempStatus === option.value && styles.filterOptionActive,
                                    ]}
                                    onPress={() => setTempStatus(option.value as any)}
                                >
                                    <Text
                                        style={[
                                            styles.filterOptionText,
                                            tempStatus === option.value && styles.filterOptionTextActive,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.filterSectionTitle}>Type</Text>
                        <View style={styles.filterOptions}>
                            {typeOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.filterOption,
                                        tempType === option.value && styles.filterOptionActive,
                                    ]}
                                    onPress={() => setTempType(option.value as any)}
                                >
                                    <Text
                                        style={[
                                            styles.filterOptionText,
                                            tempType === option.value && styles.filterOptionTextActive,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <View style={styles.filterModalActions}>
                        <TouchableOpacity style={styles.resetFilterButton} onPress={handleReset}>
                            <Text style={styles.resetFilterText}>Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.applyFilterButton} onPress={handleApply}>
                            <Text style={styles.applyFilterText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// Main Component
export default function FeedbacksTab() {
    const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
    const [filteredList, setFilteredList] = useState<Feedback[]>([]);
    const [stats, setStats] = useState<FeedbackStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState<FeedbackStatus | 'all'>('all');
    const [filterType, setFilterType] = useState<FeedbackType | 'all'>('all');
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    const fetchFeedback = useCallback(async () => {
        try {
            const data = await adminFeedbackAPI.getAllFeedback();
            setFeedbackList(data);

            // Apply current filters
            let filtered = data;
            if (filterStatus !== 'all') {
                filtered = adminFeedbackAPI.filterByStatus(filtered, filterStatus);
            }
            if (filterType !== 'all') {
                filtered = adminFeedbackAPI.filterByType(filtered, filterType);
            }
            if (searchText) {
                filtered = adminFeedbackAPI.searchFeedback(filtered, searchText);
            }
            setFilteredList(filtered);

            // Update stats
            setStats(adminFeedbackAPI.getFeedbackStats(data));
        } catch (error: any) {
            console.error('Error fetching feedback:', error);
            Alert.alert('Error', error.message || 'Failed to load feedback');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filterStatus, filterType, searchText]);

    useEffect(() => {
        fetchFeedback();
    }, [fetchFeedback]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchFeedback();
    };

    const applyFilters = (status: FeedbackStatus | 'all', type: FeedbackType | 'all') => {
        setFilterStatus(status);
        setFilterType(type);

        let filtered = feedbackList;
        if (status !== 'all') {
            filtered = adminFeedbackAPI.filterByStatus(filtered, status);
        }
        if (type !== 'all') {
            filtered = adminFeedbackAPI.filterByType(filtered, type);
        }
        if (searchText) {
            filtered = adminFeedbackAPI.searchFeedback(filtered, searchText);
        }
        setFilteredList(filtered);
    };

    const handleSearch = (text: string) => {
        setSearchText(text);
        let filtered = feedbackList;
        if (filterStatus !== 'all') {
            filtered = adminFeedbackAPI.filterByStatus(filtered, filterStatus);
        }
        if (filterType !== 'all') {
            filtered = adminFeedbackAPI.filterByType(filtered, filterType);
        }
        if (text) {
            filtered = adminFeedbackAPI.searchFeedback(filtered, text);
        }
        setFilteredList(filtered);
    };

    const handleStatusUpdate = async (id: string, status: FeedbackStatus) => {
        try {
            await adminFeedbackAPI.updateFeedbackStatus(id, status);

            // Update local state
            const updatedList = feedbackList.map(item =>
                item._id === id ? { ...item, status, updated_at: new Date().toISOString() } : item
            );
            setFeedbackList(updatedList);

            // Re-apply filters
            applyFilters(filterStatus, filterType);

            // Update stats
            setStats(adminFeedbackAPI.getFeedbackStats(updatedList));
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update status');
        }
    };

    const handleViewFeedback = (feedback: Feedback) => {
        setSelectedFeedback(feedback);
        setDetailModalVisible(true);
    };

    const handleStatPress = (status: FeedbackStatus | 'all') => {
        setFilterStatus(status);
        applyFilters(status, filterType);
    };

    const getFilterLabel = () => {
        if (filterStatus !== 'all' && filterType !== 'all') {
            return `${adminFeedbackAPI.getStatusLabel(filterStatus)} • ${adminFeedbackAPI.getTypeLabel(filterType)}`;
        }
        if (filterStatus !== 'all') {
            return adminFeedbackAPI.getStatusLabel(filterStatus);
        }
        if (filterType !== 'all') {
            return adminFeedbackAPI.getTypeLabel(filterType);
        }
        return 'All Feedback';
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Loading feedback...</Text>
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
                            icon="chatbubbles"
                            color="primary"
                            onPress={() => handleStatPress('all')}
                        />
                        <StatCard
                            title="New"
                            value={stats.new}
                            icon="newspaper"
                            color="error"
                            onPress={() => handleStatPress('new')}
                        />
                        <StatCard
                            title="In Progress"
                            value={stats.in_progress}
                            icon="time"
                            color="warning"
                            onPress={() => handleStatPress('in_progress')}
                        />
                        <StatCard
                            title="Resolved"
                            value={stats.resolved}
                            icon="checkmark-circle"
                            color="success"
                            onPress={() => handleStatPress('resolved')}
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
                        placeholder="Search feedback or email..."
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
                    style={[styles.filterButton, (filterStatus !== 'all' || filterType !== 'all') && styles.filterButtonActive]}
                    onPress={() => setFilterModalVisible(true)}
                >
                    <Ionicons name="filter" size={20} color={(filterStatus !== 'all' || filterType !== 'all') ? '#2196F3' : '#666'} />
                </TouchableOpacity>
            </View>

            {/* Active Filter Display */}
            {(filterStatus !== 'all' || filterType !== 'all') && (
                <View style={styles.activeFilterContainer}>
                    <Text style={styles.activeFilterLabel}>Filtered by:</Text>
                    <View style={styles.activeFilterChip}>
                        <Text style={styles.activeFilterText}>{getFilterLabel()}</Text>
                        <TouchableOpacity onPress={() => applyFilters('all', 'all')}>
                            <Ionicons name="close-circle" size={16} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Feedback List */}
            {filteredList.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyTitle}>No feedback found</Text>
                    <Text style={styles.emptyText}>
                        {searchText || filterStatus !== 'all' || filterType !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Feedback will appear here when users submit it'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredList}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <FeedbackCard
                            item={item}
                            onPress={() => handleViewFeedback(item)}
                            onStatusUpdate={handleStatusUpdate}
                        />
                    )}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Feedback Detail Modal */}
            <FeedbackDetailModal
                visible={detailModalVisible}
                feedback={selectedFeedback}
                onClose={() => setDetailModalVisible(false)}
                onStatusUpdate={handleStatusUpdate}
            />

            {/* Filter Modal */}
            <FilterModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                filterStatus={filterStatus}
                filterType={filterType}
                onApplyFilters={applyFilters}
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
    feedbackCard: {
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
    feedbackHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    feedbackType: {
        flexDirection: 'row',
        gap: 8,
    },
    emailBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    emailText: {
        fontSize: 10,
        color: '#666',
        maxWidth: 120,
    },
    feedbackMessage: {
        fontSize: 14,
        color: '#333',
        marginBottom: 12,
        lineHeight: 20,
    },
    feedbackFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 12,
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
    resolveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#E8F5E9',
        borderRadius: 20,
        gap: 6,
    },
    resolveButtonText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '500',
    },
    statusChip: {
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
    statusChipText: {
        fontSize: 10,
        fontWeight: '500',
    },
    typeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    typeChipText: {
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
    modalInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    modalInfoItem: {
        flex: 1,
    },
    modalInfoLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 8,
    },
    modalSection: {
        marginBottom: 20,
    },
    modalSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    emailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 10,
    },
    emailValue: {
        fontSize: 14,
        color: '#666',
    },
    urlContainer: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 10,
    },
    urlValue: {
        fontSize: 12,
        color: '#666',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    messageContainer: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 10,
        minHeight: 120,
    },
    messageValue: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    timestampRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    timestampLabel: {
        fontSize: 12,
        color: '#666',
        width: 60,
    },
    timestampValue: {
        fontSize: 12,
        color: '#999',
        flex: 1,
    },
    modalActions: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    modalActionsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    statusButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    statusButtonActive: {
        borderColor: 'transparent',
    },
    statusButtonText: {
        fontSize: 13,
        fontWeight: '500',
    },
    statusButtonTextActive: {
        fontWeight: '600',
    },
    filterModalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
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
    filterOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    filterOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
    },
    filterOptionActive: {
        backgroundColor: '#2196F3',
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