import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Modal,
    ScrollView,
    TextInput,
    ActivityIndicator,
    SafeAreaView,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
    Pressable,
    Linking,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { campaignAPI } from '../../../../services/campaignAPI';
import profileAPI from '../../../../services/profileAPI';
import { useAuth } from '../../../../contexts/AuthContext';

const { width } = Dimensions.get('window');

// Types
interface Agreement {
    application_id?: string;
    influencer_id: string;
    influencer_name: string;
    influencer_email?: string;
    status: 'pending' | 'approved' | 'rejected' | 'contracted' | 'media_submitted' | 'completed';
    message?: string;
    applied_at: string;
    contract_sent?: boolean;
    contract_sent_at?: string;
    contract_signed?: boolean;
    contract_signed_at?: string;
    submitted_media?: any[];
    media_submitted_at?: string;

    // Campaign fields
    campaign_id: string;
    campaign_title: string;
    campaign_description?: string;
    campaign_requirements?: string;
    campaign_budget?: number;
    campaign_category?: string;
    campaign_deadline?: string;
    campaign_status?: string;
    campaign_currency?: string;
    campaign_image_id?: string;
    campaign_video_id?: string;

    // Brand fields
    brand_id?: string;
    brand_name?: string;
    brand_email?: string;

    // Additional fields
    title?: string;
    description?: string;
    requirements?: string;
    budget?: number;
    category?: string;
    deadline?: string;
    currency?: string;
    campaign_image?: string;
    campaign_video?: string;
}

interface AgreementStats {
    total: number;
    readyForContract: number;
    contractSent: number;
    contractSigned: number;
    mediaReady: number;
    completed: number;
}

// Helper functions
const formatCurrency = (amount: number, currency: string = 'USD') => {
    const symbols: Record<string, string> = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        JPY: '¥',
        CAD: 'C$',
        AUD: 'A$',
        INR: '₹',
    };
    const symbol = symbols[currency] || '$';
    return `${symbol}${amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch (error) {
        return 'Invalid date';
    }
};

const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (error) {
        return 'Invalid date';
    }
};

const getStatusColor = (status: string, contractSent?: boolean, contractSigned?: boolean) => {
    if (contractSigned) return '#4CAF50';
    if (contractSent) return '#FF9800';
    if (status === 'media_submitted') return '#2196F3';
    if (status === 'completed') return '#607D8B';
    return '#9C27B0';
};

const getStatusText = (agreement: Agreement) => {
    if (agreement.contract_signed) return 'Contract Signed';
    if (agreement.contract_sent) return 'Contract Sent';
    if (agreement.status === 'media_submitted') return 'Media Submitted';
    if (agreement.status === 'completed') return 'Completed';
    return 'Ready for Contract';
};

const getStatusIcon = (agreement: Agreement) => {
    if (agreement.contract_signed) return 'checkmark-circle';
    if (agreement.contract_sent) return 'send';
    if (agreement.status === 'media_submitted') return 'image';
    if (agreement.status === 'completed') return 'checkmark-done-circle';
    return 'document-text';
};

// Profile Image Component
const ProfileImage = ({
    userId,
    profileType,
    size = 40,
    onPress
}: {
    userId: string;
    profileType: 'influencer' | 'brand';
    size?: number;
    onPress?: () => void;
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState('');

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const response = await profileAPI.getProfileById(userId);

                if (response && response.profile) {
                    const profileData = response.profile;

                    let name = '';
                    if (profileType === 'influencer') {
                        name = profileData.nickname || profileData.full_name || 'Influencer';
                    } else {
                        name = profileData.company_name || profileData.contact_person_name || 'Brand';
                    }
                    setDisplayName(name);

                    let imageId = null;
                    if (profileType === 'influencer' && profileData.profile_picture) {
                        imageId = profileData.profile_picture;
                    } else if (profileType === 'brand' && profileData.logo) {
                        imageId = profileData.logo;
                    }

                    if (imageId) {
                        setImageUrl(`${process.env.EXPO_PUBLIC_API_URL}/profiles/image/${imageId}`);
                    } else {
                        setError(true);
                    }
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error('Error fetching profile data:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchProfileData();
        }
    }, [userId, profileType]);

    const getInitial = () => {
        return displayName?.charAt(0)?.toUpperCase() || 'U';
    };

    if (error || !imageUrl) {
        return (
            <TouchableOpacity onPress={onPress} disabled={!onPress}>
                <View
                    style={[styles.profileImage, { width: size, height: size, borderRadius: size / 2, backgroundColor: '#0f6eea' }]}
                >
                    <Text style={[styles.profileInitial, { fontSize: size * 0.4 }]}>
                        {getInitial()}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity onPress={onPress} disabled={!onPress}>
            <View>
                {loading && (
                    <View style={[styles.profileImageLoader, { width: size, height: size, borderRadius: size / 2 }]}>
                        <ActivityIndicator size="small" color="#0f6eea" />
                    </View>
                )}
                <Image
                    source={{ uri: imageUrl }}
                    style={[styles.profileImage, { width: size, height: size, borderRadius: size / 2 }]}
                    contentFit="cover"
                    transition={200}
                    onLoad={() => setLoading(false)}
                    onError={() => {
                        setLoading(false);
                        setError(true);
                    }}
                />
            </View>
        </TouchableOpacity>
    );
};

// User Info Component
const UserInfo = ({
    userId,
    profileType,
    showEmail = true,
    size = 40,
    showStats = false,
    onPress
}: {
    userId: string;
    profileType: 'influencer' | 'brand';
    showEmail?: boolean;
    size?: number;
    showStats?: boolean;
    onPress?: () => void;
}) => {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const response = await profileAPI.getProfileById(userId);
                if (response && response.profile) {
                    setUserData(response.profile);
                }
            } catch (error: any) {
                if (error?.detail !== "User not found") {
                    console.error('Error fetching user data:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    const getDisplayName = () => {
        if (!userData) return 'Loading...';
        if (profileType === 'influencer') {
            return userData.nickname || userData.full_name || 'Influencer User';
        } else {
            return userData.company_name || userData.contact_person_name || 'Brand User';
        }
    };

    const getStats = () => {
        if (!userData || !showStats) return null;

        if (profileType === 'influencer') {
            return {
                followers: userData.followers_count || userData.followers,
                engagement: userData.engagement_rate,
                rating: userData.rating
            };
        }
        return null;
    };

    const stats = getStats();

    if (loading) {
        return (
            <View style={styles.userInfoContainer}>
                <ActivityIndicator size="small" color="#0f6eea" />
            </View>
        );
    }

    return (
        <TouchableOpacity style={styles.userInfoContainer} onPress={onPress} disabled={!onPress}>
            <ProfileImage
                userId={userId}
                profileType={profileType}
                size={size}
                onPress={onPress}
            />
            <View style={styles.userInfoText}>
                <Text style={styles.userInfoName} numberOfLines={1}>
                    {getDisplayName()}
                </Text>
                {showEmail && userData?.email && (
                    <Text style={styles.userInfoEmail} numberOfLines={1}>
                        {userData.email}
                    </Text>
                )}
                {showStats && stats && (
                    <View style={styles.userInfoStats}>
                        {stats.followers && (
                            <View style={styles.userInfoStat}>
                                <Ionicons name="people" size={10} color="#666666" />
                                <Text style={styles.userInfoStatText}>
                                    {stats.followers.toLocaleString()} followers
                                </Text>
                            </View>
                        )}
                        {stats.engagement && (
                            <View style={styles.userInfoStat}>
                                <Ionicons name="trending-up" size={10} color="#666666" />
                                <Text style={styles.userInfoStatText}>
                                    {stats.engagement}% eng.
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

// Status Chip Component
const StatusChip = ({ agreement }: { agreement: Agreement }) => {
    const color = getStatusColor(agreement.status, agreement.contract_sent, agreement.contract_signed);
    const icon = getStatusIcon(agreement);
    const text = getStatusText(agreement);

    return (
        <View style={[styles.statusChip, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon as any} size={12} color={color} />
            <Text style={[styles.statusText, { color }]}>{text}</Text>
        </View>
    );
};

// Stats Card Component
const StatsCard = ({
    label,
    value,
    icon,
    color,
    onPress
}: {
    label: string;
    value: number;
    icon: string;
    color: string;
    onPress?: () => void;
}) => {
    return (
        <TouchableOpacity style={styles.statsCard} onPress={onPress}>
            <View style={[styles.statsCardIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon as any} size={24} color={color} />
            </View>
            <Text style={styles.statsCardValue}>{value}</Text>
            <Text style={styles.statsCardLabel}>{label}</Text>
        </TouchableOpacity>
    );
};

// Agreement Card Component
const AgreementCard = ({
    agreement,
    onPress,
    onChat,
    onSendContract,
    onProcessPayment,
    onViewDetails,
    updating
}: {
    agreement: Agreement;
    onPress: () => void;
    onChat: () => void;
    onSendContract?: () => void;
    onProcessPayment?: () => void;
    onViewDetails: () => void;
    updating: boolean;
}) => {
    const statusColor = getStatusColor(agreement.status, agreement.contract_sent, agreement.contract_signed);

    const getPriorityActions = () => {
        if (agreement.contract_signed && agreement.status === 'media_submitted') {
            return (
                <TouchableOpacity
                    style={[styles.priorityButton, styles.paymentButton]}
                    onPress={onProcessPayment}
                    disabled={updating}
                >
                    <Ionicons name="cash" size={16} color="#FFFFFF" />
                    <Text style={styles.priorityButtonText}>Pay</Text>
                </TouchableOpacity>
            );
        } else if (agreement.status === 'approved' && !agreement.contract_sent) {
            return (
                <TouchableOpacity
                    style={[styles.priorityButton, styles.contractButton]}
                    onPress={onSendContract}
                    disabled={updating}
                >
                    <Ionicons name="send" size={16} color="#FFFFFF" />
                    <Text style={styles.priorityButtonText}>Send</Text>
                </TouchableOpacity>
            );
        } else if (agreement.contract_sent && !agreement.contract_signed) {
            return (
                <View style={[styles.priorityButton, styles.pendingButton]}>
                    <Ionicons name="time" size={16} color="#FF9800" />
                    <Text style={[styles.priorityButtonText, { color: '#FF9800' }]}>Pending</Text>
                </View>
            );
        } else if (agreement.status === 'completed') {
            return (
                <View style={[styles.priorityButton, styles.completedButton]}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={[styles.priorityButtonText, { color: '#4CAF50' }]}>Done</Text>
                </View>
            );
        }
        return null;
    };

    return (
        <View style={styles.agreementCard}>
            <View style={styles.agreementCardContent}>
                {/* Header */}
                <View style={styles.agreementCardHeader}>
                    <UserInfo
                        userId={agreement.influencer_id}
                        profileType="influencer"
                        showEmail={false}
                        showStats
                        size={44}
                        onPress={() => router.push(`/(shared)/profile/${agreement.influencer_id}`)}
                    />
                    <StatusChip agreement={agreement} />
                </View>

                {/* Campaign Title */}
                <Text style={styles.agreementCampaignTitle} numberOfLines={1}>
                    {agreement.campaign_title || agreement.title || 'Unknown Campaign'}
                </Text>

                {/* Budget and Date */}
                <View style={styles.agreementMeta}>
                    <View style={styles.metaItem}>
                        <Ionicons name="cash" size={14} color="#4CAF50" />
                        <Text style={styles.budgetText}>
                            {formatCurrency(agreement.campaign_budget || agreement.budget || 0, agreement.campaign_currency || agreement.currency)}
                        </Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="calendar" size={14} color="#FF9800" />
                        <Text style={styles.metaText}>
                            {formatDate(agreement.applied_at)}
                        </Text>
                    </View>
                    {agreement.campaign_category && (
                        <View style={styles.metaItem}>
                            <Ionicons name="pricetag" size={14} color="#0f6eea" />
                            <Text style={styles.metaText}>
                                {agreement.campaign_category}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Deadline Warning */}
                {agreement.campaign_deadline && new Date(agreement.campaign_deadline) < new Date() && !agreement.contract_signed && (
                    <View style={styles.deadlineWarning}>
                        <Ionicons name="alert-circle" size={14} color="#F44336" />
                        <Text style={styles.deadlineWarningText}>Deadline passed</Text>
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.agreementActions}>
                    {/* Priority Action */}
                    {getPriorityActions()}

                    {/* Secondary Actions */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.detailButton} onPress={onViewDetails}>
                            <Ionicons name="eye" size={18} color="#0f6eea" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.chatButton} onPress={onChat}>
                            <Ionicons name="chatbubble" size={18} color="#4CAF50" />
                        </TouchableOpacity>

                        {agreement.contract_signed && (
                            <TouchableOpacity style={styles.mediaButton} onPress={onPress}>
                                <Ionicons name="image" size={18} color="#2196F3" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
};

// Agreement Detail Modal
const AgreementDetailModal = ({
    visible,
    onClose,
    agreement,
    onSendContract,
    onProcessPayment,
    onChat,
    updating
}: {
    visible: boolean;
    onClose: () => void;
    agreement: Agreement | null;
    onSendContract?: () => void;
    onProcessPayment?: () => void;
    onChat?: () => void;
    updating: boolean;
}) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [influencerData, setInfluencerData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchInfluencerData = async () => {
            if (agreement?.influencer_id) {
                try {
                    setLoading(true);
                    const response = await profileAPI.getProfileById(agreement.influencer_id);
                    if (response?.profile) {
                        setInfluencerData(response.profile);
                    }
                } catch (error) {
                    console.error('Error fetching influencer data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        if (visible && agreement) {
            fetchInfluencerData();
        }
    }, [visible, agreement]);

    if (!agreement) return null;

    const canSendContract = agreement.status === 'approved' && !agreement.contract_sent;
    const canProcessPayment = agreement.contract_signed && agreement.status === 'media_submitted';

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={[styles.modalHeader, { backgroundColor: '#0f6eea' }]}>
                    <TouchableOpacity onPress={onClose} style={styles.modalBackButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle} numberOfLines={1}>
                        Agreement Details
                    </Text>
                    <View style={styles.modalHeaderRight} />
                </View>

                <View style={styles.modalTabs}>
                    {['overview', 'campaign', 'influencer', 'timeline'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.modalTab, activeTab === tab && styles.modalTabActive]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.modalTabText, activeTab === tab && styles.modalTabTextActive]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <ScrollView style={styles.modalContent}>
                    {activeTab === 'overview' && (
                        <View>
                            {/* Status */}
                            <View style={styles.modalSection}>
                                <StatusChip agreement={agreement} />
                            </View>

                            {/* Quick Actions */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Quick Actions</Text>
                                <View style={styles.quickActionsRow}>
                                    <TouchableOpacity
                                        style={styles.quickAction}
                                        onPress={() => {
                                            onChat?.();
                                            onClose();
                                        }}
                                    >
                                        <Ionicons name="chatbubble" size={20} color="#4CAF50" />
                                        <Text style={styles.quickActionText}>Message</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.quickAction}
                                        onPress={() => {
                                            router.push(`/(shared)/profile/${agreement.influencer_id}`);
                                            onClose();
                                        }}
                                    >
                                        <Ionicons name="person" size={20} color="#0f6eea" />
                                        <Text style={styles.quickActionText}>Profile</Text>
                                    </TouchableOpacity>

                                    {canSendContract && (
                                        <TouchableOpacity
                                            style={[styles.quickAction, styles.quickActionPrimary]}
                                            onPress={onSendContract}
                                            disabled={updating}
                                        >
                                            <Ionicons name="send" size={20} color="#FFFFFF" />
                                            <Text style={[styles.quickActionText, styles.quickActionTextLight]}>
                                                {updating ? '...' : 'Contract'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    {canProcessPayment && (
                                        <TouchableOpacity
                                            style={[styles.quickAction, styles.quickActionSuccess]}
                                            onPress={onProcessPayment}
                                            disabled={updating}
                                        >
                                            <Ionicons name="cash" size={20} color="#FFFFFF" />
                                            <Text style={[styles.quickActionText, styles.quickActionTextLight]}>
                                                Pay
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {/* Campaign Summary */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Campaign Summary</Text>
                                <View style={styles.infoCard}>
                                    <Text style={styles.infoCardTitle}>
                                        {agreement.campaign_title || agreement.title}
                                    </Text>
                                    <View style={styles.infoCardRow}>
                                        <Text style={styles.infoCardLabel}>Budget:</Text>
                                        <Text style={styles.infoCardValue}>
                                            {formatCurrency(agreement.campaign_budget || agreement.budget || 0, agreement.campaign_currency || agreement.currency)}
                                        </Text>
                                    </View>
                                    <View style={styles.infoCardRow}>
                                        <Text style={styles.infoCardLabel}>Category:</Text>
                                        <Text style={styles.infoCardValue}>
                                            {agreement.campaign_category || agreement.category || 'General'}
                                        </Text>
                                    </View>
                                    {agreement.campaign_deadline && (
                                        <View style={styles.infoCardRow}>
                                            <Text style={styles.infoCardLabel}>Deadline:</Text>
                                            <Text style={styles.infoCardValue}>
                                                {formatDate(agreement.campaign_deadline)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Influencer Message */}
                            {agreement.message && (
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Influencer Message</Text>
                                    <View style={styles.messageBox}>
                                        <Text style={styles.messageText}>"{agreement.message}"</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}

                    {activeTab === 'campaign' && (
                        <View>
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Campaign Details</Text>
                                <View style={styles.infoCard}>
                                    <Text style={styles.infoCardTitle}>
                                        {agreement.campaign_title || agreement.title}
                                    </Text>

                                    {agreement.campaign_description && (
                                        <View style={styles.infoCardBlock}>
                                            <Text style={styles.infoCardLabel}>Description</Text>
                                            <Text style={styles.infoCardText}>
                                                {agreement.campaign_description}
                                            </Text>
                                        </View>
                                    )}

                                    {agreement.campaign_requirements && (
                                        <View style={styles.infoCardBlock}>
                                            <Text style={styles.infoCardLabel}>Requirements</Text>
                                            <Text style={styles.infoCardText}>
                                                {agreement.campaign_requirements}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    )}

                    {activeTab === 'influencer' && (
                        <View>
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Influencer Profile</Text>
                                {loading ? (
                                    <ActivityIndicator size="large" color="#0f6eea" />
                                ) : influencerData ? (
                                    <View style={styles.profileCard}>
                                        <ProfileImage
                                            userId={agreement.influencer_id}
                                            profileType="influencer"
                                            size={80}
                                        />
                                        <Text style={styles.profileName}>
                                            {influencerData.nickname || influencerData.full_name}
                                        </Text>
                                        <Text style={styles.profileEmail}>{influencerData.email}</Text>

                                        {influencerData.bio && (
                                            <View style={styles.profileBio}>
                                                <Text style={styles.profileBioLabel}>Bio</Text>
                                                <Text style={styles.profileBioText}>{influencerData.bio}</Text>
                                            </View>
                                        )}

                                        {influencerData.followers && (
                                            <View style={styles.profileStats}>
                                                <View style={styles.profileStat}>
                                                    <Ionicons name="people" size={14} color="#666666" />
                                                    <Text style={styles.profileStatValue}>
                                                        {influencerData.followers.toLocaleString()} followers
                                                    </Text>
                                                </View>
                                            </View>
                                        )}

                                        <TouchableOpacity
                                            style={styles.viewProfileButton}
                                            onPress={() => {
                                                router.push(`/(shared)/profile/${agreement.influencer_id}`);
                                                onClose();
                                            }}
                                        >
                                            <View style={[styles.viewProfileGradient, { backgroundColor: '#0f6eea' }]}>
                                                <Ionicons name="person" size={18} color="#FFFFFF" />
                                                <Text style={styles.viewProfileText}>View Full Profile</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <Text style={styles.noDataText}>Profile data not available</Text>
                                )}
                            </View>
                        </View>
                    )}

                    {activeTab === 'timeline' && (
                        <View>
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Agreement Timeline</Text>
                                <View style={styles.timelineCard}>
                                    <View style={styles.timelineItem}>
                                        <Ionicons name="time" size={16} color="#666666" />
                                        <Text style={styles.timelineLabel}>Applied on:</Text>
                                        <Text style={styles.timelineValue}>{formatDateTime(agreement.applied_at)}</Text>
                                    </View>

                                    {agreement.contract_sent_at && (
                                        <View style={styles.timelineItem}>
                                            <Ionicons name="send" size={16} color="#FF9800" />
                                            <Text style={styles.timelineLabel}>Contract sent:</Text>
                                            <Text style={styles.timelineValue}>{formatDateTime(agreement.contract_sent_at)}</Text>
                                        </View>
                                    )}

                                    {agreement.contract_signed_at && (
                                        <View style={styles.timelineItem}>
                                            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                                            <Text style={styles.timelineLabel}>Contract signed:</Text>
                                            <Text style={styles.timelineValue}>{formatDateTime(agreement.contract_signed_at)}</Text>
                                        </View>
                                    )}

                                    {agreement.media_submitted_at && (
                                        <View style={styles.timelineItem}>
                                            <Ionicons name="image" size={16} color="#2196F3" />
                                            <Text style={styles.timelineLabel}>Media submitted:</Text>
                                            <Text style={styles.timelineValue}>{formatDateTime(agreement.media_submitted_at)}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    )}
                </ScrollView>

                <View style={styles.modalFooter}>
                    {(canSendContract || canProcessPayment) && (
                        <View style={styles.modalFooterActions}>
                            {canSendContract && (
                                <TouchableOpacity
                                    style={styles.modalContractButton}
                                    onPress={onSendContract}
                                    disabled={updating}
                                >
                                    <Ionicons name="send" size={18} color="#FFFFFF" />
                                    <Text style={styles.modalButtonText}>
                                        {updating ? '...' : 'Send Contract'}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {canProcessPayment && (
                                <TouchableOpacity
                                    style={styles.modalPaymentButton}
                                    onPress={onProcessPayment}
                                    disabled={updating}
                                >
                                    <Ionicons name="cash" size={18} color="#FFFFFF" />
                                    <Text style={styles.modalButtonText}>
                                        {updating ? '...' : 'Process Payment'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                    <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
                        <Text style={styles.modalCloseText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

// Send Contract Modal
const SendContractModal = ({
    visible,
    onClose,
    agreement,
    onSend,
    sending
}: {
    visible: boolean;
    onClose: () => void;
    agreement: Agreement | null;
    onSend: () => void;
    sending: boolean;
}) => {
    if (!agreement) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.sendContractModal}>
                    <View style={[styles.sendContractHeader, { backgroundColor: '#0f6eea' }]}>
                        <Text style={styles.sendContractTitle}>Send Contract Agreement</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.sendContractBody}>
                        <View style={styles.sendContractSection}>
                            <Text style={styles.sendContractSectionTitle}>Campaign Details</Text>
                            <Text style={styles.sendContractCampaignTitle}>
                                {agreement.campaign_title || agreement.title}
                            </Text>
                            <View style={styles.sendContractRow}>
                                <Text style={styles.sendContractLabel}>Budget:</Text>
                                <Text style={styles.sendContractValue}>
                                    {formatCurrency(agreement.campaign_budget || agreement.budget || 0, agreement.campaign_currency || agreement.currency)}
                                </Text>
                            </View>
                            {agreement.campaign_deadline && (
                                <View style={styles.sendContractRow}>
                                    <Text style={styles.sendContractLabel}>Deadline:</Text>
                                    <Text style={styles.sendContractValue}>
                                        {formatDate(agreement.campaign_deadline)}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.sendContractSection}>
                            <Text style={styles.sendContractSectionTitle}>Influencer</Text>
                            <UserInfo
                                userId={agreement.influencer_id}
                                profileType="influencer"
                                showEmail
                                size={50}
                            />
                        </View>

                        <View style={styles.sendContractSection}>
                            <Text style={styles.sendContractSectionTitle}>Contract Terms</Text>
                            <View style={styles.termsList}>
                                {[
                                    'Deliverables & Timeline: Clear specification of required content and submission deadlines',
                                    `Compensation: ${formatCurrency(agreement.campaign_budget || agreement.budget || 0, agreement.campaign_currency || agreement.currency)} upon satisfactory completion`,
                                    'Content Usage Rights: Brand receives rights to use submitted content for marketing',
                                    'Approval Process: Brand approval required before content publication',
                                    'Payment Terms: Payment released within 7 days of content approval'
                                ].map((term, index) => (
                                    <View key={index} style={styles.termItem}>
                                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                                        <Text style={styles.termText}>{term}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {agreement.contract_sent && (
                            <View style={styles.warningBox}>
                                <Ionicons name="information-circle" size={20} color="#FF9800" />
                                <Text style={styles.warningText}>
                                    Contract was previously sent on {formatDateTime(agreement.contract_sent_at!)}
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    <View style={styles.sendContractFooter}>
                        <TouchableOpacity style={styles.sendContractCancelButton} onPress={onClose}>
                            <Text style={styles.sendContractCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.sendContractSendButton, sending && styles.sendContractSendButtonDisabled]}
                            onPress={onSend}
                            disabled={sending}
                        >
                            <Text style={styles.sendContractSendText}>
                                {sending ? 'Sending...' : (agreement.contract_sent ? 'Resend Contract' : 'Send Contract')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// Main Component
export default function BrandAgreements() {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const [agreements, setAgreements] = useState<Agreement[]>([]);
    const [filteredAgreements, setFilteredAgreements] = useState<Agreement[]>([]);

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.push("/(brand)/(tabs)/account");
        }
    };
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [sendContractModalVisible, setSendContractModalVisible] = useState(false);
    const [mediaModalVisible, setMediaModalVisible] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Stats
    const [stats, setStats] = useState<AgreementStats>({
        total: 0,
        readyForContract: 0,
        contractSent: 0,
        contractSigned: 0,
        mediaReady: 0,
        completed: 0
    });

    // Fetch agreements
    const fetchAgreements = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await campaignAPI.getBrandApplications();

            const appsData = Array.isArray(response) ? response : [];

            // Filter only approved applications that can have contracts
            const approvedApps = appsData.filter((app: any) =>
                app.status === 'approved' || app.contract_sent || app.contract_signed ||
                app.status === 'media_submitted' || app.status === 'completed'
            );

            setAgreements(approvedApps as unknown as Agreement[]);

            // Calculate stats
            const newStats = {
                total: approvedApps.length,
                readyForContract: approvedApps.filter((a: any) => a.status === 'approved' && !a.contract_sent).length,
                contractSent: approvedApps.filter((a: any) => a.contract_sent && !a.contract_signed).length,
                contractSigned: approvedApps.filter((a: any) => a.contract_signed).length,
                mediaReady: approvedApps.filter((a: any) => a.status === 'media_submitted').length,
                completed: approvedApps.filter((a: any) => a.status === 'completed').length,
            };
            setStats(newStats);

        } catch (err) {
            setError('Failed to load agreements');
            console.error('Failed to fetch agreements:', err);
            setAgreements([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAgreements();
        }, [])
    );

    // Filter agreements
    useEffect(() => {
        let filtered = agreements;

        // Tab filtering
        if (activeTab !== 'all') {
            filtered = filtered.filter(agreement => {
                switch (activeTab) {
                    case 'ready':
                        return agreement.status === 'approved' && !agreement.contract_sent;
                    case 'sent':
                        return agreement.contract_sent && !agreement.contract_signed;
                    case 'signed':
                        return agreement.contract_signed;
                    case 'media':
                        return agreement.status === 'media_submitted';
                    case 'completed':
                        return agreement.status === 'completed';
                    default:
                        return true;
                }
            });
        }

        // Search filtering
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(agreement =>
                agreement.influencer_name?.toLowerCase().includes(query) ||
                agreement.campaign_title?.toLowerCase().includes(query) ||
                agreement.title?.toLowerCase().includes(query) ||
                agreement.influencer_email?.toLowerCase().includes(query)
            );
        }

        setFilteredAgreements(filtered);
    }, [agreements, activeTab, searchQuery]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAgreements();
    }, []);

    const handleSendContract = async () => {
        if (!selectedAgreement) return;

        setUpdating(true);
        try {
            await campaignAPI.sendContractAgreement(selectedAgreement.campaign_id, selectedAgreement.influencer_id);
            setSuccess(`Contract ${selectedAgreement.contract_sent ? 'resent' : 'sent'} successfully!`);
            setTimeout(() => setSuccess(''), 5000);
            setSendContractModalVisible(false);
            await fetchAgreements();
        } catch (err) {
            setError('Failed to send contract. Please try again.');
            setTimeout(() => setError(''), 5000);
        } finally {
            setUpdating(false);
        }
    };

    const handleProcessPayment = (agreement: Agreement) => {
        router.push(`/(brand)/(tabs)/account/payments?campaign=${agreement.campaign_id}&influencer=${agreement.influencer_id}`);
        setDetailModalVisible(false);
    };

    const handleDirectChat = (agreement: Agreement) => {
        router.push(`/(brand)/(tabs)/chat?user=${agreement.influencer_id}&campaign=${agreement.campaign_id}`);
    };

    const handleViewProfile = (userId: string) => {
        router.push(`/(shared)/profile/${userId}`);
    };

    const handleViewMedia = (agreement: Agreement) => {
        setSelectedAgreement(agreement);
        setMediaModalVisible(true);
    };

    const getTabCount = (tab: string) => {
        switch (tab) {
            case 'all': return stats.total;
            case 'ready': return stats.readyForContract;
            case 'sent': return stats.contractSent;
            case 'signed': return stats.contractSigned;
            case 'media': return stats.mediaReady;
            case 'completed': return stats.completed;
            default: return 0;
        }
    };

    const statItems = [
        { label: 'Total', value: stats.total, icon: 'document-text', color: '#0f6eea', tab: 'all' },
        { label: 'Ready', value: stats.readyForContract, icon: 'time', color: '#FF9800', tab: 'ready' },
        { label: 'Sent', value: stats.contractSent, icon: 'send', color: '#9C27B0', tab: 'sent' },
        { label: 'Signed', value: stats.contractSigned, icon: 'checkmark-circle', color: '#4CAF50', tab: 'signed' },
        { label: 'Media', value: stats.mediaReady, icon: 'image', color: '#2196F3', tab: 'media' },
        { label: 'Done', value: stats.completed, icon: 'checkmark-done-circle', color: '#607D8B', tab: 'completed' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <View style={styles.headerTopRow}>
                    <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Contract Agreements</Text>
                    <View style={{ width: 40 }} />
                </View>
                <Text style={styles.headerSubtitle}>
                    Manage influencer partnerships and track contract progress
                </Text>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Ionicons name="search" size={20} color="#FFFFFF" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name or campaign..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="rgba(255,255,255,0.7)"
                        />
                        {searchQuery ? (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                        <Ionicons name="refresh" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Alerts */}
            {error ? (
                <View style={styles.errorAlert}>
                    <Ionicons name="alert-circle" size={20} color="#F44336" />
                    <Text style={styles.errorAlertText}>{error}</Text>
                    <TouchableOpacity onPress={() => setError('')}>
                        <Ionicons name="close" size={18} color="#F44336" />
                    </TouchableOpacity>
                </View>
            ) : null}

            {success ? (
                <View style={styles.successAlert}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.successAlertText}>{success}</Text>
                    <TouchableOpacity onPress={() => setSuccess('')}>
                        <Ionicons name="close" size={18} color="#4CAF50" />
                    </TouchableOpacity>
                </View>
            ) : null}

            {/* Stats Grid */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.statsScroll}
                contentContainerStyle={styles.statsContainer}
            >
                {statItems.map((stat) => (
                    <StatsCard
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color}
                        onPress={() => setActiveTab(stat.tab)}
                    />
                ))}
            </ScrollView>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[
                        { key: 'all', label: 'All', count: stats.total },
                        { key: 'ready', label: 'Ready', count: stats.readyForContract },
                        { key: 'sent', label: 'Sent', count: stats.contractSent },
                        { key: 'signed', label: 'Signed', count: stats.contractSigned },
                        { key: 'media', label: 'Media', count: stats.mediaReady },
                        { key: 'completed', label: 'Done', count: stats.completed },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                                {tab.label} ({tab.count})
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Results Info */}
            <View style={styles.resultsInfo}>
                <Text style={styles.resultsText}>
                    Showing {filteredAgreements.length} of {agreements.length} agreements
                </Text>
            </View>

            {/* Agreements List */}
            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0f6eea" />
                </View>
            ) : filteredAgreements.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="document-text-outline" size={64} color="#CCCCCC" />
                    <Text style={styles.emptyStateTitle}>No agreements found</Text>
                    <Text style={styles.emptyStateSubtitle}>
                        {searchQuery || activeTab !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Approved applications will appear here for contract management'
                        }
                    </Text>
                    {activeTab !== 'all' && (
                        <TouchableOpacity style={styles.clearFiltersButton} onPress={() => setActiveTab('all')}>
                            <Text style={styles.clearFiltersButtonText}>View All</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <FlatList
                    data={filteredAgreements}
                    keyExtractor={(item) => `${item.campaign_id}-${item.influencer_id}`}
                    renderItem={({ item }) => (
                        <AgreementCard
                            agreement={item}
                            onPress={() => handleViewMedia(item)}
                            onChat={() => handleDirectChat(item)}
                            onSendContract={() => {
                                setSelectedAgreement(item);
                                setSendContractModalVisible(true);
                            }}
                            onProcessPayment={() => handleProcessPayment(item)}
                            onViewDetails={() => {
                                setSelectedAgreement(item);
                                setDetailModalVisible(true);
                            }}
                            updating={updating}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0f6eea']} />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Modals */}
            <AgreementDetailModal
                visible={detailModalVisible}
                onClose={() => setDetailModalVisible(false)}
                agreement={selectedAgreement}
                onSendContract={() => {
                    setDetailModalVisible(false);
                    setSendContractModalVisible(true);
                }}
                onProcessPayment={() => selectedAgreement && handleProcessPayment(selectedAgreement)}
                onChat={() => selectedAgreement && handleDirectChat(selectedAgreement)}
                updating={updating}
            />

            <SendContractModal
                visible={sendContractModalVisible}
                onClose={() => setSendContractModalVisible(false)}
                agreement={selectedAgreement}
                onSend={handleSendContract}
                sending={updating}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        backgroundColor: '#0f6eea',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    headerBackButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#E0E7FF',
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#FFFFFF',
    },
    refreshButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsScroll: {
        maxHeight: 110,
        marginTop: 16,
        marginBottom: 8,
    },
    statsContainer: {
        paddingHorizontal: 12,
        gap: 12,
    },
    statsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        width: 100,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statsCardIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statsCardValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333333',
        marginBottom: 2,
    },
    statsCardLabel: {
        fontSize: 11,
        color: '#666666',
    },
    tabsContainer: {
        paddingHorizontal: 16,
        marginTop: 8,
        marginBottom: 8,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    tabActive: {
        backgroundColor: '#0f6eea',
        borderColor: '#0f6eea',
    },
    tabText: {
        fontSize: 13,
        color: '#666666',
    },
    tabTextActive: {
        color: '#FFFFFF',
    },
    resultsInfo: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resultsText: {
        fontSize: 12,
        color: '#666666',
    },
    listContent: {
        padding: 12,
        paddingBottom: 100,
    },
    agreementCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    agreementCardContent: {
        padding: 16,
    },
    agreementCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    agreementCampaignTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 8,
    },
    agreementMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: '#666666',
    },
    budgetText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4CAF50',
    },
    deadlineWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    deadlineWarningText: {
        fontSize: 10,
        color: '#F44336',
    },
    agreementActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    priorityButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    contractButton: {
        backgroundColor: '#9C27B0',
    },
    paymentButton: {
        backgroundColor: '#4CAF50',
    },
    pendingButton: {
        backgroundColor: '#FFF3E0',
    },
    completedButton: {
        backgroundColor: '#E8F5E9',
    },
    priorityButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
    },
    detailButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '500',
    },
    profileImage: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    profileInitial: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    profileImageLoader: {
        position: 'absolute',
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    userInfoContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginRight: 8,
    },
    userInfoText: {
        flex: 1,
    },
    userInfoName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
    },
    userInfoEmail: {
        fontSize: 11,
        color: '#999999',
    },
    userInfoStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    userInfoStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    userInfoStatText: {
        fontSize: 9,
        color: '#666666',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 20,
    },
    modalBackButton: {
        marginRight: 12,
    },
    modalTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    modalHeaderRight: {
        width: 40,
    },
    modalTabs: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    modalTab: {
        paddingVertical: 12,
        marginRight: 24,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    modalTabActive: {
        borderBottomColor: '#0f6eea',
    },
    modalTabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666666',
    },
    modalTabTextActive: {
        color: '#0f6eea',
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    modalSection: {
        marginBottom: 24,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 12,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
    },
    infoCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 12,
    },
    infoCardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoCardLabel: {
        fontSize: 13,
        color: '#666666',
    },
    infoCardValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#333333',
    },
    infoCardBlock: {
        marginTop: 12,
    },
    infoCardText: {
        fontSize: 13,
        color: '#666666',
        lineHeight: 18,
        marginTop: 4,
    },
    quickActionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    quickAction: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F5F7FA',
    },
    quickActionPrimary: {
        backgroundColor: '#9C27B0',
    },
    quickActionSuccess: {
        backgroundColor: '#4CAF50',
    },
    quickActionText: {
        fontSize: 12,
        color: '#666666',
    },
    quickActionTextLight: {
        color: '#FFFFFF',
    },
    messageBox: {
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
    },
    messageText: {
        fontSize: 14,
        color: '#333333',
        fontStyle: 'italic',
        lineHeight: 20,
    },
    timelineCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    timelineLabel: {
        fontSize: 12,
        color: '#666666',
        width: 90,
    },
    timelineValue: {
        flex: 1,
        fontSize: 12,
        color: '#333333',
        fontWeight: '500',
    },
    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333333',
        marginTop: 12,
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 13,
        color: '#666666',
        marginBottom: 12,
    },
    profileBio: {
        width: '100%',
        marginTop: 12,
        marginBottom: 12,
    },
    profileBioLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666666',
        marginBottom: 4,
    },
    profileBioText: {
        fontSize: 13,
        color: '#333333',
        lineHeight: 18,
    },
    profileStats: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
        marginBottom: 16,
    },
    profileStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    profileStatValue: {
        fontSize: 12,
        color: '#666666',
    },
    viewProfileButton: {
        width: '100%',
        overflow: 'hidden',
        borderRadius: 12,
    },
    viewProfileGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    viewProfileText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    modalFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
    },
    modalFooterActions: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    modalContractButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        backgroundColor: '#9C27B0',
        paddingVertical: 14,
        borderRadius: 12,
    },
    modalPaymentButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        backgroundColor: '#4CAF50',
        paddingVertical: 14,
        borderRadius: 12,
    },
    modalButtonText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    modalCloseButton: {
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#0f6eea',
        alignItems: 'center',
    },
    modalCloseText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f6eea',
    },
    noDataText: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        marginTop: 20,
    },
    // Send Contract Modal
    sendContractModal: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
    },
    sendContractHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    sendContractTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    sendContractBody: {
        padding: 16,
        maxHeight: 500,
    },
    sendContractSection: {
        marginBottom: 20,
    },
    sendContractSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 8,
    },
    sendContractCampaignTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f6eea',
        marginBottom: 8,
    },
    sendContractRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    sendContractLabel: {
        fontSize: 13,
        color: '#666666',
    },
    sendContractValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#333333',
    },
    termsList: {
        gap: 8,
    },
    termItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    termText: {
        flex: 1,
        fontSize: 12,
        color: '#666666',
        lineHeight: 18,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    warningText: {
        flex: 1,
        fontSize: 12,
        color: '#FF9800',
    },
    sendContractFooter: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        gap: 12,
    },
    sendContractCancelButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#0f6eea',
    },
    sendContractCancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f6eea',
    },
    sendContractSendButton: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#0f6eea',
    },
    sendContractSendButtonDisabled: {
        opacity: 0.6,
    },
    sendContractSendText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Loading and Empty States
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 24,
    },
    clearFiltersButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#0f6eea',
    },
    clearFiltersButtonText: {
        fontSize: 14,
        color: '#0f6eea',
        fontWeight: '500',
    },
    // Alerts
    errorAlert: {
        position: 'absolute',
        top: 40,
        left: 16,
        right: 16,
        zIndex: 1000,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFEBEE',
        padding: 12,
        borderRadius: 8,
    },
    errorAlertText: {
        flex: 1,
        fontSize: 13,
        color: '#F44336',
    },
    successAlert: {
        position: 'absolute',
        top: 40,
        left: 16,
        right: 16,
        zIndex: 1000,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#E8F5E9',
        padding: 12,
        borderRadius: 8,
    },
    successAlertText: {
        flex: 1,
        fontSize: 13,
        color: '#4CAF50',
    },
});