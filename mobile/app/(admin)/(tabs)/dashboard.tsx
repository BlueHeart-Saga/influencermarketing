import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';

// Import API service
import adminAPI, { DashboardData, Activity, QuickStats } from '../../../services/adminapi';

const { width: screenWidth } = Dimensions.get('window');

// Stat Card Component
const StatCard = ({ title, value, icon, color, subtitle, trend }: any) => {
    const getIconColor = () => {
        switch (color) {
            case 'primary': return '#2196F3';
            case 'success': return '#4CAF50';
            case 'warning': return '#FF9800';
            case 'error': return '#F44336';
            case 'secondary': return '#9C27B0';
            case 'info': return '#00BCD4';
            default: return '#757575';
        }
    };

    return (
        <View style={[styles.statCard, { borderLeftColor: getIconColor(), borderLeftWidth: 4 }]}>
            <View style={styles.statCardHeader}>
                <Text style={styles.statCardTitle}>{title}</Text>
                <View style={[styles.statCardIcon, { backgroundColor: getIconColor() + '20' }]}>
                    <Ionicons name={icon} size={24} color={getIconColor()} />
                </View>
            </View>
            <Text style={styles.statCardValue}>{value}</Text>
            {subtitle && <Text style={styles.statCardSubtitle}>{subtitle}</Text>}
            {trend !== undefined && (
                <View style={styles.trendContainer}>
                    <Ionicons
                        name={trend > 0 ? 'trending-up' : 'trending-down'}
                        size={16}
                        color={trend > 0 ? '#4CAF50' : '#F44336'}
                    />
                    <Text style={[styles.trendText, { color: trend > 0 ? '#4CAF50' : '#F44336' }]}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </Text>
                </View>
            )}
        </View>
    );
};

// Activity Item Component
const ActivityItem = ({ activity }: { activity: Activity }) => {
    const getIcon = () => {
        switch (activity.type) {
            case 'user': return 'person-add';
            case 'subscription': return 'card';
            case 'post': return 'document-text';
            case 'admin': return 'shield';
            default: return 'time';
        }
    };

    const getIconColor = () => {
        switch (activity.type) {
            case 'user': return '#2196F3';
            case 'subscription': return '#4CAF50';
            case 'post': return '#FF9800';
            case 'admin': return '#9C27B0';
            default: return '#757575';
        }
    };

    return (
        <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: getIconColor() + '20' }]}>
                <Ionicons name={getIcon()} size={20} color={getIconColor()} />
            </View>
            <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
        </View>
    );
};

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
    const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    // Format time ago
    const formatTimeAgo = (dateString: string) => {
        try {
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
            return date.toLocaleDateString();
        } catch (error) {
            return 'Just now';
        }
    };

    // Format numbers
    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            setError(null);

            // Get token from storage
            const token = await AsyncStorage.getItem('access_token');

            if (!token) {
                throw new Error('Authentication required');
            }

            // Fetch all data in parallel
            const [dashboard, stats, activities] = await Promise.all([
                adminAPI.getDashboard(),
                adminAPI.getQuickStats(),
                adminAPI.getRecentActivities(10),
            ]);

            setDashboardData(dashboard);
            setQuickStats(stats);
            setRecentActivities(activities.activities);
            setLastUpdated(new Date().toISOString());

        } catch (err: any) {
            console.error('Fetch error:', err);
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Handle refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
    };

    // Initial load
    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Refresh on focus
    useFocusEffect(
        useCallback(() => {
            fetchDashboardData();
        }, [])
    );

    // Stat cards configuration
    const statCards = dashboardData ? [
        {
            title: 'Total Users',
            value: formatNumber(dashboardData.platform_overview.total_users),
            icon: 'people',
            color: 'primary',
            subtitle: `${dashboardData.platform_overview.brands} brands, ${dashboardData.platform_overview.influencers} influencers`,
            trend: 12.5,
        },
        {
            title: 'Active Subs',
            value: formatNumber(dashboardData.subscription_analytics.active_subscriptions),
            icon: 'card',
            color: 'success',
            subtitle: `${dashboardData.subscription_analytics.trial_users} trials`,
            trend: 8.3,
        },
        {
            title: 'Total Posts',
            value: formatNumber(dashboardData.platform_overview.total_posts),
            icon: 'document-text',
            color: 'warning',
            subtitle: `${dashboardData.recent_activity.last_24h_posts} today`,
            trend: 15.2,
        },
        {
            title: 'Engagement',
            value: formatNumber(dashboardData.engagement_metrics.total_likes),
            icon: 'heart',
            color: 'error',
            subtitle: `${formatNumber(dashboardData.engagement_metrics.total_comments)} comments`,
            trend: 18.7,
        },
    ] : [];

    // Chart data
    const chartData = dashboardData ? {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            data: [
                dashboardData.recent_activity.last_7d_posts / 7,
                dashboardData.recent_activity.last_7d_posts / 7,
                dashboardData.recent_activity.last_7d_posts / 7,
                dashboardData.recent_activity.last_7d_posts / 7,
                dashboardData.recent_activity.last_7d_posts / 7,
                dashboardData.recent_activity.last_7d_posts / 7,
                dashboardData.recent_activity.last_7d_posts / 7,
            ],
        }],
    } : { labels: [], datasets: [{ data: [] }] };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Loading dashboard...</Text>
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
                    <View>
                        <Text style={styles.headerTitle}>Admin Dashboard</Text>
                        <Text style={styles.headerSubtitle}>
                            {lastUpdated ? `Updated ${formatTimeAgo(lastUpdated)}` : 'Loading...'}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                        <Ionicons name="refresh" size={24} color="#2196F3" />
                    </TouchableOpacity>
                </View>

                {/* Error Message */}
                {error && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={24} color="#F44336" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={fetchDashboardData}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Quick Stats Row */}
                {quickStats && (
                    <View style={styles.quickStatsContainer}>
                        <View style={styles.quickStatItem}>
                            <Text style={styles.quickStatValue}>{formatNumber(quickStats.total_users)}</Text>
                            <Text style={styles.quickStatLabel}>Users</Text>
                        </View>
                        <View style={styles.quickStatDivider} />
                        <View style={styles.quickStatItem}>
                            <Text style={styles.quickStatValue}>{formatNumber(quickStats.total_posts)}</Text>
                            <Text style={styles.quickStatLabel}>Posts</Text>
                        </View>
                        <View style={styles.quickStatDivider} />
                        <View style={styles.quickStatItem}>
                            <Text style={styles.quickStatValue}>{formatNumber(quickStats.active_subscriptions)}</Text>
                            <Text style={styles.quickStatLabel}>Active Subs</Text>
                        </View>
                        <View style={styles.quickStatDivider} />
                        <View style={styles.quickStatItem}>
                            <Text style={styles.quickStatValue}>{formatNumber(quickStats.new_users_24h)}</Text>
                            <Text style={styles.quickStatLabel}>New (24h)</Text>
                        </View>
                    </View>
                )}

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {statCards.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </View>

                {/* Activity Chart */}
                {dashboardData && (
                    <View style={styles.chartContainer}>
                        <View style={styles.chartHeader}>
                            <Text style={styles.chartTitle}>Weekly Activity</Text>
                            <Text style={styles.chartSubtitle}>
                                {dashboardData.recent_activity.last_7d_posts} posts this week
                            </Text>
                        </View>
                        <LineChart
                            data={chartData}
                            width={screenWidth - 48}
                            height={220}
                            chartConfig={{
                                backgroundColor: '#ffffff',
                                backgroundGradientFrom: '#ffffff',
                                backgroundGradientTo: '#ffffff',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                style: {
                                    borderRadius: 16,
                                },
                                propsForDots: {
                                    r: '6',
                                    strokeWidth: '2',
                                    stroke: '#2196F3',
                                },
                            }}
                            bezier
                            style={styles.chart}
                            formatYLabel={(value) => Math.round(Number(value)).toString()}
                        />
                    </View>
                )}

                {/* Recent Activities */}
                <View style={styles.activitiesContainer}>
                    <View style={styles.activitiesHeader}>
                        <Text style={styles.activitiesTitle}>Recent Activities</Text>
                        <Text style={styles.activitiesCount}>{recentActivities.length} activities</Text>
                    </View>

                    {recentActivities.length > 0 ? (
                        recentActivities.map((activity, index) => (
                            <ActivityItem key={index} activity={activity} />
                        ))
                    ) : (
                        <View style={styles.emptyActivities}>
                            <Ionicons name="time-outline" size={48} color="#ccc" />
                            <Text style={styles.emptyActivitiesText}>No recent activities</Text>
                        </View>
                    )}
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsContainer}>
                    <Text style={styles.quickActionsTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <View style={styles.quickActionIcon}>
                                <Ionicons name="people" size={24} color="#2196F3" />
                            </View>
                            <Text style={styles.quickActionText}>Manage Users</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <View style={styles.quickActionIcon}>
                                <Ionicons name="card" size={24} color="#4CAF50" />
                            </View>
                            <Text style={styles.quickActionText}>Subscriptions</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <View style={styles.quickActionIcon}>
                                <Ionicons name="document-text" size={24} color="#FF9800" />
                            </View>
                            <Text style={styles.quickActionText}>Posts</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <View style={styles.quickActionIcon}>
                                <Ionicons name="stats-chart" size={24} color="#9C27B0" />
                            </View>
                            <Text style={styles.quickActionText}>Reports</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    refreshButton: {
        padding: 8,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        padding: 12,
        backgroundColor: '#ffebee',
        borderRadius: 8,
    },
    errorText: {
        flex: 1,
        marginLeft: 8,
        color: '#F44336',
        fontSize: 14,
    },
    retryText: {
        color: '#2196F3',
        fontWeight: '600',
        marginLeft: 8,
    },
    quickStatsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    quickStatValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    quickStatLabel: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    quickStatDivider: {
        width: 1,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 8,
    },
    statsGrid: {
        paddingHorizontal: 16,
    },
    statCard: {
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
    statCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statCardTitle: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    statCardIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statCardValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    statCardSubtitle: {
        fontSize: 12,
        color: '#999',
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    trendText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    chartContainer: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    chartHeader: {
        marginBottom: 16,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    chartSubtitle: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    chart: {
        marginLeft: -20,
        borderRadius: 12,
    },
    activitiesContainer: {
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    activitiesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    activitiesTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    activitiesCount: {
        fontSize: 12,
        color: '#999',
    },
    activityItem: {
        flexDirection: 'row',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    activityDescription: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 10,
        color: '#999',
    },
    emptyActivities: {
        padding: 40,
        alignItems: 'center',
    },
    emptyActivitiesText: {
        marginTop: 8,
        fontSize: 14,
        color: '#999',
    },
    quickActionsContainer: {
        margin: 16,
        marginBottom: 32,
    },
    quickActionsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickActionButton: {
        width: '23%',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionText: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },
});