import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Modal,
    TextInput,
    FlatList,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { campaignAPI, Campaign, CampaignStats, Application, ApplicationStatusUpdate } from '../../../services/campaignAPI';


// Stat Card Component
const StatCard = ({ title, value, icon, color, subtitle, onPress }: any) => {
    const getIconColor = () => {
        switch (color) {
            case 'primary': return '#2196F3';
            case 'success': return '#4CAF50';
            case 'warning': return '#FF9800';
            case 'error': return '#F44336';
            case 'info': return '#00BCD4';
            case 'secondary': return '#9C27B0';
            default: return '#757575';
        }
    };

    return (
        <TouchableOpacity style={[styles.statCard, { borderLeftColor: getIconColor(), borderLeftWidth: 4 }]} onPress={onPress}>
            <View style={styles.statCardHeader}>
                <Text style={styles.statCardTitle}>{title}</Text>
                <View style={[styles.statCardIcon, { backgroundColor: getIconColor() + '20' }]}>
                    <Ionicons name={icon} size={24} color={getIconColor()} />
                </View>
            </View>
            <Text style={styles.statCardValue}>{value}</Text>
            {subtitle && <Text style={styles.statCardSubtitle}>{subtitle}</Text>}
        </TouchableOpacity>
    );
};

// Status Chip Component
const StatusChip = ({ status }: { status: string }) => {
    const getStatusConfig = () => {
        switch (status?.toLowerCase()) {
            case 'active': return { color: '#4CAF50', icon: 'play-circle' };
            case 'paused': return { color: '#FF9800', icon: 'pause-circle' };
            case 'completed': return { color: '#2196F3', icon: 'checkmark-circle' };
            case 'draft': return { color: '#9E9E9E', icon: 'create-outline' };
            default: return { color: '#757575', icon: 'help-circle' };
        }
    };

    const config = getStatusConfig();

    return (
        <View style={[styles.statusChip, { backgroundColor: config.color + '20' }]}>
            <Ionicons name={config.icon as any} size={12} color={config.color} />
            <Text style={[styles.statusChipText, { color: config.color }]}>{status}</Text>
        </View>
    );
};

// Application Status Chip
const AppStatusChip = ({ status }: { status: string }) => {
    const getStatusConfig = () => {
        switch (status?.toLowerCase()) {
            case 'pending': return { color: '#FF9800', icon: 'time-outline' };
            case 'approved': return { color: '#4CAF50', icon: 'checkmark-circle' };
            case 'rejected': return { color: '#F44336', icon: 'close-circle' };
            case 'contracted': return { color: '#9C27B0', icon: 'document-text' };
            case 'media_submitted': return { color: '#2196F3', icon: 'images' };
            case 'completed': return { color: '#00BCD4', icon: 'flag' };
            default: return { color: '#757575', icon: 'help-circle' };
        }
    };

    const config = getStatusConfig();

    return (
        <View style={[styles.appStatusChip, { backgroundColor: config.color + '20' }]}>
            <Ionicons name={config.icon as any} size={10} color={config.color} />
            <Text style={[styles.appStatusChipText, { color: config.color }]}>{status.replace('_', ' ')}</Text>
        </View>
    );
};

// Campaign Card Component
const CampaignCard = ({ campaign, onPress, onStatusUpdate, onDelete }: any) => {
    const formattedBudget = campaignAPI.formatCampaignForDisplay(campaign).formattedBudget;
    const applicationCount = campaign.applications?.length || 0;
    const pendingCount = campaign.applications?.filter((a: any) => a.status === 'pending').length || 0;

    return (
        <TouchableOpacity style={styles.campaignCard} onPress={() => onPress(campaign)}>
            <View style={styles.campaignCardHeader}>
                <View style={styles.campaignIcon}>
                    <Ionicons name="megaphone" size={24} color="#fff" />
                </View>
                <View style={styles.campaignInfo}>
                    <Text style={styles.campaignTitle} numberOfLines={1}>{campaign.title}</Text>
                    <Text style={styles.campaignBrand}>{campaign.brand_name || 'Unknown Brand'}</Text>
                </View>
                <StatusChip status={campaign.status} />
            </View>

            <Text style={styles.campaignDescription} numberOfLines={2}>{campaign.description}</Text>

            <View style={styles.campaignDetails}>
                <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={14} color="#666" />
                    <Text style={styles.detailText}>{formattedBudget}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={14} color="#666" />
                    <Text style={styles.detailText}>
                        {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : 'No deadline'}
                    </Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="people-outline" size={14} color="#666" />
                    <Text style={styles.detailText}>{applicationCount} applications</Text>
                </View>
            </View>

            {pendingCount > 0 && (
                <View style={styles.pendingBadge}>
                    <Ionicons name="alert-circle" size={12} color="#FF9800" />
                    <Text style={styles.pendingText}>{pendingCount} pending review</Text>
                </View>
            )}

            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={styles.cardActionButton}
                    onPress={() => onStatusUpdate(campaign)}
                >
                    <Ionicons name="refresh-outline" size={18} color="#666" />
                    <Text style={styles.cardActionText}>Update Status</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.cardActionButton, styles.deleteButton]}
                    onPress={() => onDelete(campaign)}
                >
                    <Ionicons name="trash-outline" size={18} color="#F44336" />
                    <Text style={[styles.cardActionText, { color: '#F44336' }]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

// Application Card Component
const ApplicationCard = ({ application, campaign, onStatusUpdate, onSendContract }: any) => {
    const appliedDate = new Date(application.applied_at).toLocaleDateString();

    return (
        <View style={styles.applicationCard}>
            <View style={styles.applicationHeader}>
                <View style={styles.applicationAvatar}>
                    <Ionicons name="person" size={20} color="#fff" />
                </View>
                <View style={styles.applicationInfo}>
                    <Text style={styles.applicationName}>{application.influencer_name}</Text>
                    <Text style={styles.applicationDate}>Applied: {appliedDate}</Text>
                </View>
                <AppStatusChip status={application.status} />
            </View>

            {application.message && (
                <Text style={styles.applicationMessage} numberOfLines={2}>
                    "{application.message}"
                </Text>
            )}

            <View style={styles.applicationDetails}>
                <View style={styles.detailItem}>
                    <Ionicons name="mail-outline" size={12} color="#666" />
                    <Text style={styles.applicationDetailText}>{application.influencer_email || 'No email'}</Text>
                </View>
                {application.influencer_phone && (
                    <View style={styles.detailItem}>
                        <Ionicons name="call-outline" size={12} color="#666" />
                        <Text style={styles.applicationDetailText}>{application.influencer_phone}</Text>
                    </View>
                )}
            </View>

            {application.status === 'pending' && (
                <View style={styles.applicationActions}>
                    <TouchableOpacity
                        style={[styles.appActionButton, styles.approveButton]}
                        onPress={() => onStatusUpdate(application, 'approved')}
                    >
                        <Ionicons name="checkmark" size={16} color="#fff" />
                        <Text style={styles.appActionText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.appActionButton, styles.rejectButton]}
                        onPress={() => onStatusUpdate(application, 'rejected')}
                    >
                        <Ionicons name="close" size={16} color="#fff" />
                        <Text style={styles.appActionText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}

            {application.status === 'approved' && (
                <TouchableOpacity
                    style={[styles.contractButton, { backgroundColor: '#9C27B0' }]}
                    onPress={() => onSendContract(application, campaign)}
                >
                    <Ionicons name="document-text" size={16} color="#fff" />
                    <Text style={styles.contractButtonText}>Send Contract</Text>
                </TouchableOpacity>
            )}

            {application.submitted_media && application.submitted_media.length > 0 && (
                <View style={styles.mediaBadge}>
                    <Ionicons name="images" size={12} color="#2196F3" />
                    <Text style={styles.mediaBadgeText}>{application.submitted_media.length} media files submitted</Text>
                </View>
            )}
        </View>
    );
};

// Campaign Detail Modal
const CampaignDetailModal = ({ visible, campaign, onClose, onStatusUpdate, onDelete }: any) => {
    const [loading, setLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(campaign?.status || 'active');
    const [applications, setApplications] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'applications'>('overview');

    useEffect(() => {
        if (campaign) {
            setApplications(campaign.applications || []);
            setSelectedStatus(campaign.status);
        }
    }, [campaign]);

    const handleStatusUpdate = async () => {
        if (!campaign || selectedStatus === campaign.status) return;

        setLoading(true);
        try {
            await campaignAPI.adminUpdateCampaignStatus(campaign._id, selectedStatus);
            Alert.alert('Success', 'Campaign status updated successfully');
            onStatusUpdate?.();
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.detail || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const handleApplicationStatus = async (application: any, newStatus: ApplicationStatusUpdate['status']) => {

        setLoading(true);
        try {
            await campaignAPI.updateApplicationStatus(campaign._id, application.influencer_id, {
                status: newStatus,
            });

            // Update local applications list
            setApplications(prev =>
                prev.map(app =>
                    app.influencer_id === application.influencer_id
                        ? { ...app, status: newStatus }
                        : app
                )
            );

            Alert.alert('Success', `Application ${newStatus} successfully`);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.detail || 'Failed to update application');
        } finally {
            setLoading(false);
        }
    };

    const handleSendContract = async (application: any) => {
        setLoading(true);
        try {
            await campaignAPI.sendContractAgreement(campaign._id, application.influencer_id);

            // Update local applications list
            setApplications(prev =>
                prev.map(app =>
                    app.influencer_id === application.influencer_id
                        ? { ...app, status: 'contracted' }
                        : app
                )
            );

            Alert.alert('Success', 'Contract sent to influencer');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.detail || 'Failed to send contract');
        } finally {
            setLoading(false);
        }
    };

    if (!campaign) return null;

    const formattedCampaign = campaignAPI.formatCampaignForDisplay(campaign);
    const pendingApplications = applications.filter(a => a.status === 'pending').length;

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
                        <Text style={styles.modalTitle} numberOfLines={1}>{campaign.title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tabBar}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
                            onPress={() => setActiveTab('overview')}
                        >
                            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'applications' && styles.activeTab]}
                            onPress={() => setActiveTab('applications')}
                        >
                            <View style={styles.tabWithBadge}>
                                <Text style={[styles.tabText, activeTab === 'applications' && styles.activeTabText]}>Applications</Text>
                                {pendingApplications > 0 && (
                                    <View style={styles.tabBadge}>
                                        <Text style={styles.tabBadgeText}>{pendingApplications}</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        {activeTab === 'overview' ? (
                            <View>
                                {/* Campaign Info */}
                                <View style={styles.infoSection}>
                                    <Text style={styles.sectionTitle}>Campaign Details</Text>

                                    <View style={styles.infoRow}>
                                        <Ionicons name="business" size={18} color="#666" />
                                        <Text style={styles.infoLabel}>Brand:</Text>
                                        <Text style={styles.infoValue}>{campaign.brand_name || 'Unknown Brand'}</Text>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <Ionicons name="cash-outline" size={18} color="#666" />
                                        <Text style={styles.infoLabel}>Budget:</Text>
                                        <Text style={styles.infoValue}>{formattedCampaign.formattedBudget}</Text>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <Ionicons name="pricetag-outline" size={18} color="#666" />
                                        <Text style={styles.infoLabel}>Category:</Text>
                                        <Text style={styles.infoValue}>{campaign.category}</Text>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <Ionicons name="calendar-outline" size={18} color="#666" />
                                        <Text style={styles.infoLabel}>Deadline:</Text>
                                        <Text style={styles.infoValue}>{formattedCampaign.formattedDeadline}</Text>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <Ionicons name="time-outline" size={18} color="#666" />
                                        <Text style={styles.infoLabel}>Created:</Text>
                                        <Text style={styles.infoValue}>{formattedCampaign.formattedCreatedAt}</Text>
                                    </View>
                                </View>

                                {/* Description */}
                                <View style={styles.infoSection}>
                                    <Text style={styles.sectionTitle}>Description</Text>
                                    <Text style={styles.descriptionText}>{campaign.description}</Text>
                                </View>

                                {/* Requirements */}
                                <View style={styles.infoSection}>
                                    <Text style={styles.sectionTitle}>Requirements</Text>
                                    <Text style={styles.descriptionText}>{campaign.requirements}</Text>
                                </View>

                                {/* Statistics */}
                                <View style={styles.infoSection}>
                                    <Text style={styles.sectionTitle}>Statistics</Text>
                                    <View style={styles.statsGrid}>
                                        <View style={styles.statItem}>
                                            <Text style={styles.statValue}>{campaign.total_views || 0}</Text>
                                            <Text style={styles.statLabel}>Views</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={styles.statValue}>{campaign.unique_views || 0}</Text>
                                            <Text style={styles.statLabel}>Unique Views</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={styles.statValue}>{campaign.likes_count || 0}</Text>
                                            <Text style={styles.statLabel}>Likes</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={styles.statValue}>{applications.length}</Text>
                                            <Text style={styles.statLabel}>Applications</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Status Update */}
                                <View style={styles.infoSection}>
                                    <Text style={styles.sectionTitle}>Update Status</Text>
                                    <View style={styles.statusUpdateRow}>
                                        <View style={styles.statusSelector}>
                                            {['active', 'paused', 'completed'].map((status) => (
                                                <TouchableOpacity
                                                    key={status}
                                                    style={[
                                                        styles.statusOption,
                                                        selectedStatus === status && styles.statusOptionActive,
                                                    ]}
                                                    onPress={() => setSelectedStatus(status)}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.statusOptionText,
                                                            selectedStatus === status && styles.statusOptionTextActive,
                                                        ]}
                                                    >
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                        <TouchableOpacity
                                            style={[
                                                styles.updateButton,
                                                selectedStatus === campaign.status && styles.updateButtonDisabled,
                                            ]}
                                            onPress={handleStatusUpdate}
                                            disabled={loading || selectedStatus === campaign.status}
                                        >
                                            {loading ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <Text style={styles.updateButtonText}>Update Status</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Delete Button */}
                                <TouchableOpacity
                                    style={styles.deleteCampaignButton}
                                    onPress={() => {
                                        Alert.alert(
                                            'Delete Campaign',
                                            'Are you sure you want to delete this campaign? This action cannot be undone.',
                                            [
                                                { text: 'Cancel', style: 'cancel' },
                                                {
                                                    text: 'Delete',
                                                    style: 'destructive',
                                                    onPress: async () => {
                                                        setLoading(true);
                                                        try {
                                                            await campaignAPI.adminDeleteCampaign(campaign._id);
                                                            Alert.alert('Success', 'Campaign deleted successfully');
                                                            onDelete?.();
                                                            onClose();
                                                        } catch (error: any) {
                                                            Alert.alert('Error', error.response?.data?.detail || 'Failed to delete campaign');
                                                        } finally {
                                                            setLoading(false);
                                                        }
                                                    },
                                                },
                                            ]
                                        );
                                    }}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#F44336" />
                                    <Text style={styles.deleteButtonText}>Delete Campaign</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View>
                                {applications.length === 0 ? (
                                    <View style={styles.emptyApplications}>
                                        <Ionicons name="people-outline" size={48} color="#ccc" />
                                        <Text style={styles.emptyText}>No applications yet</Text>
                                        <Text style={styles.emptySubtext}>Influencers will appear here when they apply</Text>
                                    </View>
                                ) : (
                                    applications.map((application, index) => (
                                        <ApplicationCard
                                            key={index}
                                            application={application}
                                            campaign={campaign}
                                            onStatusUpdate={handleApplicationStatus}
                                            onSendContract={handleSendContract}
                                        />
                                    ))
                                )}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

// Status Update Modal
const StatusUpdateModal = ({ visible, campaign, onClose, onUpdate }: any) => {
    const [selectedStatus, setSelectedStatus] = useState(campaign?.status || 'active');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (campaign) {
            setSelectedStatus(campaign.status);
        }
    }, [campaign]);

    const handleUpdate = async () => {
        if (!campaign || selectedStatus === campaign.status) return;

        setLoading(true);
        try {
            await campaignAPI.adminUpdateCampaignStatus(campaign._id, selectedStatus);
            Alert.alert('Success', 'Campaign status updated successfully');
            onUpdate?.();
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.detail || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    if (!campaign) return null;

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.statusModalContent}>
                    <Text style={styles.statusModalTitle}>Update Campaign Status</Text>
                    <Text style={styles.statusModalCampaign}>{campaign.title}</Text>

                    <View style={styles.statusOptions}>
                        {['active', 'paused', 'completed'].map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.statusRadioOption,
                                    selectedStatus === status && styles.statusRadioSelected,
                                ]}
                                onPress={() => setSelectedStatus(status)}
                            >
                                <View style={styles.radioCircle}>
                                    {selectedStatus === status && <View style={styles.radioSelected} />}
                                </View>
                                <Text style={styles.statusRadioLabel}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.statusModalActions}>
                        <TouchableOpacity style={styles.cancelStatusButton} onPress={onClose}>
                            <Text style={styles.cancelStatusText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.confirmStatusButton, selectedStatus === campaign.status && styles.disabledButton]}
                            onPress={handleUpdate}
                            disabled={loading || selectedStatus === campaign.status}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.confirmStatusText}>Update</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// Main Admin Campaigns Component
export default function AdminCampaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [stats, setStats] = useState<CampaignStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [filterMenuVisible, setFilterMenuVisible] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [campaignsData, statsData] = await Promise.all([
                campaignAPI.getAllCampaignsAdmin(),
                campaignAPI.getCampaignStatsAdmin(),
            ]);
            setCampaigns(campaignsData);
            setStats(statsData);
        } catch (error: any) {
            console.error('Error fetching campaigns:', error);
            Alert.alert('Error', error.response?.data?.detail || 'Failed to load campaigns');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const filteredCampaigns = campaigns.filter(campaign => {
        if (filterStatus !== 'all' && campaign.status !== filterStatus) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                campaign.title.toLowerCase().includes(query) ||
                campaign.brand_name?.toLowerCase().includes(query) ||
                campaign.category.toLowerCase().includes(query)
            );
        }
        return true;
    });

    const handleCampaignPress = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setDetailModalVisible(true);
    };

    const handleStatusUpdate = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setStatusModalVisible(true);
    };

    const handleDelete = async (campaign: Campaign) => {
        Alert.alert(
            'Delete Campaign',
            `Are you sure you want to delete "${campaign.title}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await campaignAPI.adminDeleteCampaign(campaign._id);
                            Alert.alert('Success', 'Campaign deleted successfully');
                            fetchData();
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.detail || 'Failed to delete campaign');
                        }
                    },
                },
            ]
        );
    };

    const handleRefreshAfterUpdate = () => {
        fetchData();
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Loading campaigns...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Campaign Management</Text>
                    <Text style={styles.headerSubtitle}>Manage all platform campaigns</Text>
                </View>

                {/* Stats Cards */}
                {stats && (
                    <View style={styles.statsContainer}>
                        <StatCard
                            title="Total Campaigns"
                            value={stats.total}
                            icon="megaphone"
                            color="primary"
                        />
                        <StatCard
                            title="Active"
                            value={stats.active}
                            icon="play-circle"
                            color="success"
                        />
                        <StatCard
                            title="Paused"
                            value={stats.paused}
                            icon="pause-circle"
                            color="warning"
                        />
                        <StatCard
                            title="Completed"
                            value={stats.completed}
                            icon="checkmark-circle"
                            color="info"
                        />
                        <StatCard
                            title="Total Views"
                            value={stats.total_views?.toLocaleString() || '0'}
                            icon="eye"
                            color="secondary"
                        />
                    </View>
                )}

                {/* Search and Filter */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search campaigns..."
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

                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setFilterMenuVisible(!filterMenuVisible)}
                    >
                        <Ionicons name="filter" size={20} color={filterStatus !== 'all' ? '#2196F3' : '#666'} />
                    </TouchableOpacity>
                </View>

                {/* Filter Options */}
                {filterMenuVisible && (
                    <View style={styles.filterMenu}>
                        {['all', 'active', 'paused', 'completed'].map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.filterOption,
                                    filterStatus === status && styles.filterOptionActive,
                                ]}
                                onPress={() => {
                                    setFilterStatus(status);
                                    setFilterMenuVisible(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.filterOptionText,
                                        filterStatus === status && styles.filterOptionTextActive,
                                    ]}
                                >
                                    {status === 'all' ? 'All Campaigns' : status.charAt(0).toUpperCase() + status.slice(1)}
                                </Text>
                                {filterStatus === status && (
                                    <Ionicons name="checkmark" size={16} color="#2196F3" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Campaigns List */}
                {filteredCampaigns.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="megaphone-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyTitle}>No campaigns found</Text>
                        <Text style={styles.emptyText}>
                            {searchQuery || filterStatus !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Campaigns will appear here when created'}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.campaignsList}>
                        {filteredCampaigns.map((campaign) => (
                            <CampaignCard
                                key={campaign._id}
                                campaign={campaign}
                                onPress={handleCampaignPress}
                                onStatusUpdate={handleStatusUpdate}
                                onDelete={handleDelete}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Campaign Detail Modal */}
            <CampaignDetailModal
                visible={detailModalVisible}
                campaign={selectedCampaign}
                onClose={() => setDetailModalVisible(false)}
                onStatusUpdate={handleRefreshAfterUpdate}
                onDelete={handleRefreshAfterUpdate}
            />

            {/* Status Update Modal */}
            <StatusUpdateModal
                visible={statusModalVisible}
                campaign={selectedCampaign}
                onClose={() => setStatusModalVisible(false)}
                onUpdate={handleRefreshAfterUpdate}
            />
        </SafeAreaView>
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
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        minWidth: '30%',
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
    filterMenu: {
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    filterOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    filterOptionActive: {
        backgroundColor: '#E3F2FD',
    },
    filterOptionText: {
        fontSize: 14,
        color: '#666',
    },
    filterOptionTextActive: {
        color: '#2196F3',
        fontWeight: '500',
    },
    campaignsList: {
        padding: 16,
    },
    campaignCard: {
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
    campaignCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    campaignIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    campaignInfo: {
        flex: 1,
    },
    campaignTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    campaignBrand: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    campaignDescription: {
        fontSize: 13,
        color: '#666',
        marginBottom: 12,
        lineHeight: 18,
    },
    campaignDetails: {
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
    pendingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 12,
        gap: 4,
    },
    pendingText: {
        fontSize: 10,
        color: '#FF9800',
        fontWeight: '500',
    },
    cardActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
        gap: 16,
    },
    cardActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    deleteButton: {
        marginLeft: 'auto',
    },
    cardActionText: {
        fontSize: 12,
        color: '#666',
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusChipText: {
        fontSize: 10,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
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
        flex: 1,
    },
    closeButton: {
        padding: 4,
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#2196F3',
    },
    tabText: {
        fontSize: 14,
        color: '#666',
    },
    activeTabText: {
        color: '#2196F3',
        fontWeight: '600',
    },
    tabWithBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    tabBadge: {
        backgroundColor: '#F44336',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    tabBadgeText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
    },
    modalBody: {
        padding: 20,
    },
    infoSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoLabel: {
        width: 80,
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    descriptionText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statItem: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    statLabel: {
        fontSize: 11,
        color: '#666',
        marginTop: 4,
    },
    statusUpdateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusSelector: {
        flex: 1,
        flexDirection: 'row',
        gap: 8,
    },
    statusOption: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    statusOptionActive: {
        backgroundColor: '#E3F2FD',
    },
    statusOptionText: {
        fontSize: 12,
        color: '#666',
    },
    statusOptionTextActive: {
        color: '#2196F3',
        fontWeight: '500',
    },
    updateButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    updateButtonDisabled: {
        backgroundColor: '#ccc',
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    deleteCampaignButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    deleteButtonText: {
        fontSize: 14,
        color: '#F44336',
    },
    statusModalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        margin: 20,
        padding: 20,
    },
    statusModalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    statusModalCampaign: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    statusOptions: {
        gap: 12,
        marginBottom: 24,
    },
    statusRadioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
    },
    statusRadioSelected: {
        backgroundColor: '#E3F2FD',
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    radioSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#2196F3',
    },
    statusRadioLabel: {
        fontSize: 14,
        color: '#333',
    },
    statusModalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelStatusButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
    },
    cancelStatusText: {
        fontSize: 14,
        color: '#666',
    },
    confirmStatusButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#2196F3',
        borderRadius: 10,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    confirmStatusText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    // Application Card Styles
    applicationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    applicationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    applicationAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#9C27B0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    applicationInfo: {
        flex: 1,
    },
    applicationName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    applicationDate: {
        fontSize: 10,
        color: '#999',
        marginTop: 2,
    },
    applicationMessage: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 12,
        paddingLeft: 48,
    },
    applicationDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 12,
        paddingLeft: 48,
    },
    applicationDetailText: {
        fontSize: 11,
        color: '#666',
    },
    applicationActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
        paddingLeft: 48,
    },
    appActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    approveButton: {
        backgroundColor: '#4CAF50',
    },
    rejectButton: {
        backgroundColor: '#F44336',
    },
    appActionText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '500',
    },
    contractButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        marginTop: 8,
        marginLeft: 48,
    },
    contractButtonText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '500',
    },
    mediaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
        paddingLeft: 48,
    },
    mediaBadgeText: {
        fontSize: 10,
        color: '#2196F3',
    },
    appStatusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    appStatusChipText: {
        fontSize: 9,
        fontWeight: '500',
    },
    emptyApplications: {
        alignItems: 'center',
        paddingVertical: 48,
    },
});