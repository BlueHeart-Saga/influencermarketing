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
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import adminAccountAPI, { User, UserStats, FilterOptions, BankAccount } from '../../services/adminaccountapi';

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
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: getIconColor(), borderLeftWidth: 4 }]}
      onPress={onPress}
      activeOpacity={0.7}
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

// Bank Account Card Component
const BankAccountCard = ({ account }: { account: BankAccount }) => {
  const maskedNumber = adminAccountAPI.maskAccountNumber(account.account_number);
  
  return (
    <View style={styles.bankAccountCard}>
      <View style={styles.bankCardHeader}>
        <View style={styles.bankIcon}>
          <Ionicons name="business" size={20} color="#2196F3" />
        </View>
        <View style={styles.bankInfo}>
          <Text style={styles.bankHolderName}>{account.account_holder_name}</Text>
          <Text style={styles.bankDetails}>
            {account.bank_name || 'Bank'} • {maskedNumber}
          </Text>
        </View>
        {account.is_primary && (
          <View style={styles.primaryBadge}>
            <Text style={styles.primaryBadgeText}>Primary</Text>
          </View>
        )}
      </View>
      
      <View style={styles.bankDetailsRow}>
        <View style={styles.bankDetailItem}>
          <Text style={styles.bankDetailLabel}>IFSC</Text>
          <Text style={styles.bankDetailValue}>{account.ifsc_code}</Text>
        </View>
        <View style={styles.bankDetailItem}>
          <Text style={styles.bankDetailLabel}>Type</Text>
          <Text style={styles.bankDetailValue}>{account.account_type}</Text>
        </View>
        <View style={styles.bankDetailItem}>
          <Text style={styles.bankDetailLabel}>Status</Text>
          <View style={[styles.verificationBadge, account.is_verified && styles.verifiedBadge]}>
            <Text style={[styles.verificationText, account.is_verified && styles.verifiedText]}>
              {account.is_verified ? 'Verified' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>
      
      {account.branch_name && (
        <View style={styles.branchContainer}>
          <Ionicons name="location-outline" size={12} color="#999" />
          <Text style={styles.branchText}>{account.branch_name}</Text>
        </View>
      )}
    </View>
  );
};

// User Card Component
const UserCard = ({ user, onViewProfile, onToggleSuspend }: any) => {
  const [expanded, setExpanded] = useState(false);
  const roleColor = adminAccountAPI.getRoleColor(user.role);
  const roleBgColor = adminAccountAPI.getRoleBackgroundColor(user.role);
  const statusColor = adminAccountAPI.getStatusColor(user.is_suspended);
  const statusBgColor = adminAccountAPI.getStatusBackgroundColor(user.is_suspended);
  const statusLabel = adminAccountAPI.getStatusLabel(user.is_suspended);
  
  const displayName = user.name || user.nickname || user.company_name || 'No Name';
  const hasBankAccounts = user.bank_accounts && user.bank_accounts.length > 0;
  const primaryAccount = user.bank_accounts?.find(acc => acc.is_primary);
  
  return (
    <View style={styles.userCard}>
      <TouchableOpacity 
        style={styles.userCardHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.userMeta}>
            <View style={[styles.roleBadge, { backgroundColor: roleBgColor }]}>
              <Text style={[styles.roleText, { color: roleColor }]}>{user.role}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>
        </View>
        
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color="#666" />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.userDetails}>
          {/* Contact Information */}
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.detailRow}>
              <Ionicons name="mail-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{user.email}</Text>
            </View>
            {user.phone && (
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{user.phone}</Text>
              </View>
            )}
            {user.created_at && (
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.detailText}>Joined: {adminAccountAPI.formatDate(user.created_at)}</Text>
              </View>
            )}
          </View>
          
          {/* Role-specific Information */}
          {user.role === 'brand' && (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Company Information</Text>
              {user.company_name && (
                <View style={styles.detailRow}>
                  <Ionicons name="business-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{user.company_name}</Text>
                </View>
              )}
              {user.industry && (
                <View style={styles.detailRow}>
                  <Ionicons name="pricetag-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{user.industry}</Text>
                </View>
              )}
              {user.website && (
                <TouchableOpacity 
                  style={styles.detailRow}
                  onPress={() => Linking.openURL(user.website)}
                >
                  <Ionicons name="globe-outline" size={16} color="#2196F3" />
                  <Text style={[styles.detailText, styles.linkText]}>{user.website}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {user.role === 'influencer' && (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Influencer Profile</Text>
              {user.nickname && (
                <View style={styles.detailRow}>
                  <Ionicons name="person-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>@{user.nickname}</Text>
                </View>
              )}
              {user.followers && (
                <View style={styles.detailRow}>
                  <Ionicons name="people-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>Followers: {adminAccountAPI.formatNumber(user.followers)}</Text>
                </View>
              )}
              {user.engagement_rate && (
                <View style={styles.detailRow}>
                  <Ionicons name="trending-up-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>Engagement: {user.engagement_rate}%</Text>
                </View>
              )}
              {user.primary_platform && (
                <View style={styles.detailRow}>
                  <Ionicons name={adminAccountAPI.getPlatformIcon(user.primary_platform) as any} size={16} color="#666" />
                  <Text style={styles.detailText}>{user.primary_platform}</Text>
                </View>
              )}
            </View>
          )}
          
          {/* Bio Section */}
          {user.bio && (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bioText}>{user.bio}</Text>
            </View>
          )}
          
          {/* Bank Accounts Section */}
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>
              Bank Accounts {hasBankAccounts ? `(${user.bank_accounts.length})` : ''}
            </Text>
            {hasBankAccounts ? (
              user.bank_accounts.map((account: BankAccount) => (
                <BankAccountCard key={account._id} account={account} />
              ))
            ) : (
              <View style={styles.noBankContainer}>
                <Ionicons name="alert-circle-outline" size={24} color="#FF9800" />
                <Text style={styles.noBankText}>No bank accounts added</Text>
              </View>
            )}
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => onViewProfile(user)}
            >
              <Ionicons name="eye-outline" size={18} color="#2196F3" />
              <Text style={styles.viewButtonText}>View Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.actionButton,
                user.is_suspended ? styles.unsuspendButton : styles.suspendButton
              ]}
              onPress={() => onToggleSuspend(user)}
            >
              <Ionicons 
                name={user.is_suspended ? 'lock-open-outline' : 'lock-closed-outline'} 
                size={18} 
                color={user.is_suspended ? '#4CAF50' : '#F44336'} 
              />
              <Text style={[
                styles.actionButtonText,
                user.is_suspended ? styles.unsuspendText : styles.suspendText
              ]}>
                {user.is_suspended ? 'Unsuspend' : 'Suspend'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// Filter Modal Component
const FilterModal = ({ visible, onClose, filters, onApplyFilters }: any) => {
  const [tempFilters, setTempFilters] = useState(filters);
  
  const handleReset = () => {
    setTempFilters({
      search: '',
      role: 'all',
      status: 'all',
      bank_status: 'all',
    });
  };
  
  const handleApply = () => {
    onApplyFilters(tempFilters);
    onClose();
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
            <Text style={styles.modalTitle}>Filter Users</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.filterModalBody}>
            {/* Role Filter */}
            <Text style={styles.filterSectionTitle}>Role</Text>
            <View style={styles.filterOptions}>
              {['all', 'brand', 'influencer', 'admin'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.filterOption,
                    tempFilters.role === role && styles.filterOptionActive,
                  ]}
                  onPress={() => setTempFilters({ ...tempFilters, role: role as any })}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      tempFilters.role === role && styles.filterOptionTextActive,
                    ]}
                  >
                    {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Status Filter */}
            <Text style={styles.filterSectionTitle}>Status</Text>
            <View style={styles.filterOptions}>
              {['all', 'active', 'suspended'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterOption,
                    tempFilters.status === status && styles.filterOptionActive,
                  ]}
                  onPress={() => setTempFilters({ ...tempFilters, status: status as any })}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      tempFilters.status === status && styles.filterOptionTextActive,
                    ]}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Bank Status Filter */}
            <Text style={styles.filterSectionTitle}>Bank Account</Text>
            <View style={styles.filterOptions}>
              {['all', 'has_bank', 'no_bank'].map((bankStatus) => (
                <TouchableOpacity
                  key={bankStatus}
                  style={[
                    styles.filterOption,
                    tempFilters.bank_status === bankStatus && styles.filterOptionActive,
                  ]}
                  onPress={() => setTempFilters({ ...tempFilters, bank_status: bankStatus as any })}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      tempFilters.bank_status === bankStatus && styles.filterOptionTextActive,
                    ]}
                  >
                    {bankStatus === 'all' ? 'All' : 
                     bankStatus === 'has_bank' ? 'Has Bank Account' : 'No Bank Account'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.filterModalActions}>
            <TouchableOpacity style={styles.resetFilterButton} onPress={handleReset}>
              <Text style={styles.resetFilterText}>Reset All</Text>
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

// User Detail Modal
const UserDetailModal = ({ visible, user, onClose, onToggleSuspend }: any) => {
  if (!user) return null;
  
  const roleColor = adminAccountAPI.getRoleColor(user.role);
  const statusColor = adminAccountAPI.getStatusColor(user.is_suspended);
  const statusLabel = adminAccountAPI.getStatusLabel(user.is_suspended);
  const displayName = user.name || user.nickname || user.company_name || 'No Name';
  const hasBankAccounts = user.bank_accounts && user.bank_accounts.length > 0;
  
  const handleEmail = () => {
    Linking.openURL(`mailto:${user.email}`);
  };
  
  const handlePhone = () => {
    if (user.phone) {
      Linking.openURL(`tel:${user.phone}`);
    }
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
            <Text style={styles.modalTitle}>User Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>{displayName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{displayName}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
                <View style={styles.profileBadges}>
                  <View style={[styles.roleBadgeLarge, { backgroundColor: roleColor + '20' }]}>
                    <Text style={[styles.roleTextLarge, { color: roleColor }]}>{user.role}</Text>
                  </View>
                  <View style={[styles.statusBadgeLarge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.statusTextLarge, { color: statusColor }]}>{statusLabel}</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Contact Actions */}
            <View style={styles.contactActions}>
              <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
                <Ionicons name="mail-outline" size={20} color="#2196F3" />
                <Text style={styles.contactButtonText}>Email</Text>
              </TouchableOpacity>
              {user.phone && (
                <TouchableOpacity style={styles.contactButton} onPress={handlePhone}>
                  <Ionicons name="call-outline" size={20} color="#4CAF50" />
                  <Text style={styles.contactButtonText}>Call</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Account Info */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Account Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>User ID:</Text>
                <Text style={styles.infoValue}>{user.user_id}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Joined:</Text>
                <Text style={styles.infoValue}>{adminAccountAPI.formatDateTime(user.created_at)}</Text>
              </View>
              {user.last_login && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Last Login:</Text>
                  <Text style={styles.infoValue}>{adminAccountAPI.formatDateTime(user.last_login)}</Text>
                </View>
              )}
            </View>
            
            {/* Role-specific Info */}
            {user.role === 'brand' && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Company Details</Text>
                {user.company_name && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Company:</Text>
                    <Text style={styles.infoValue}>{user.company_name}</Text>
                  </View>
                )}
                {user.industry && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Industry:</Text>
                    <Text style={styles.infoValue}>{user.industry}</Text>
                  </View>
                )}
                {user.company_size && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Size:</Text>
                    <Text style={styles.infoValue}>{user.company_size}</Text>
                  </View>
                )}
                {user.website && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Website:</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(user.website)}>
                      <Text style={[styles.infoValue, styles.linkValue]}>{user.website}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
            
            {user.role === 'influencer' && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Influencer Details</Text>
                {user.nickname && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Nickname:</Text>
                    <Text style={styles.infoValue}>@{user.nickname}</Text>
                  </View>
                )}
                {user.followers && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Followers:</Text>
                    <Text style={styles.infoValue}>{adminAccountAPI.formatNumber(user.followers)}</Text>
                  </View>
                )}
                {user.engagement_rate && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Engagement:</Text>
                    <Text style={styles.infoValue}>{user.engagement_rate}%</Text>
                  </View>
                )}
                {user.primary_platform && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Platform:</Text>
                    <Text style={styles.infoValue}>{user.primary_platform}</Text>
                  </View>
                )}
                {user.categories && user.categories.length > 0 && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Categories:</Text>
                    <Text style={styles.infoValue}>{user.categories.join(', ')}</Text>
                  </View>
                )}
              </View>
            )}
            
            {/* Bio */}
            {user.bio && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Bio</Text>
                <Text style={styles.bioFullText}>{user.bio}</Text>
              </View>
            )}
            
            {/* Social Media Links */}
            {user.social_media_links && Object.keys(user.social_media_links).length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Social Media</Text>
                <View style={styles.socialLinks}>
                  {Object.entries(user.social_media_links).map(([platform, url]) => (
                    <TouchableOpacity
                      key={platform}
                      style={styles.socialLink}
                      onPress={() => Linking.openURL(url as string)}
                    >
                      <Ionicons name={adminAccountAPI.getPlatformIcon(platform) as any} size={20} color="#666" />
                      <Text style={styles.socialLinkText}>{platform}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            {/* Bank Accounts */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>
                Bank Accounts {hasBankAccounts ? `(${user.bank_accounts.length})` : ''}
              </Text>
              {hasBankAccounts ? (
                user.bank_accounts.map((account: BankAccount) => (
                  <BankAccountCard key={account._id} account={account} />
                ))
              ) : (
                <View style={styles.noBankContainer}>
                  <Ionicons name="alert-circle-outline" size={32} color="#FF9800" />
                  <Text style={styles.noBankTextLarge}>No bank accounts added</Text>
                </View>
              )}
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.suspendModalButton, user.is_suspended && styles.unsuspendModalButton]}
              onPress={() => {
                onToggleSuspend(user);
                onClose();
              }}
            >
              <Ionicons
                name={user.is_suspended ? 'lock-open-outline' : 'lock-closed-outline'}
                size={20}
                color="#fff"
              />
              <Text style={styles.suspendModalText}>
                {user.is_suspended ? 'Unsuspend User' : 'Suspend User'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main Component
export default function AccountHandlesTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    role: 'all',
    status: 'all',
    bank_status: 'all',
  });
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const fetchUsers = useCallback(async () => {
    try {
      const data = await adminAccountAPI.getAllUsers();
      setUsers(data);
      
      // Apply filters
      let filtered = data;
      if (searchQuery) {
        filtered = adminAccountAPI.filterUsers(filtered, { ...filters, search: searchQuery });
      } else {
        filtered = adminAccountAPI.filterUsers(filtered, filters);
      }
      setFilteredUsers(filtered);
      
      // Update stats
      const userStats = await adminAccountAPI.getUserStats(data);
      setStats(userStats);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', error.message || 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, searchQuery]);
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    let filtered = users;
    filtered = adminAccountAPI.filterUsers(filtered, { ...filters, search: text });
    setFilteredUsers(filtered);
  };
  
  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    let filtered = users;
    filtered = adminAccountAPI.filterUsers(filtered, { ...newFilters, search: searchQuery });
    setFilteredUsers(filtered);
  };
  
  const handleToggleSuspend = async (user: User) => {
    try {
      if (user.is_suspended) {
        await adminAccountAPI.unsuspendUser(user.user_id);
        Alert.alert('Success', 'User unsuspended successfully');
      } else {
        await adminAccountAPI.suspendUser(user.user_id);
        Alert.alert('Success', 'User suspended successfully');
      }
      fetchUsers();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update user status');
    }
  };
  
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const blob = await adminAccountAPI.exportUsersCSV();
      
      // Share the file
      const uri = `file://${new Date().getTime()}_users_report.csv`;
      // Note: In a real app, you would save the file and share it
      // This is a simplified version
      await Share.share({
        message: 'Users Report CSV',
        title: 'Export Users Report',
      });
      
      Alert.alert('Success', 'CSV exported successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };
  
  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setDetailModalVisible(true);
  };
  
  const handleStatPress = (type: string) => {
    const newFilters: FilterOptions = { ...filters, search: searchQuery };
    
    switch (type) {
      case 'influencers':
        newFilters.role = 'influencer';
        break;
      case 'brands':
        newFilters.role = 'brand';
        break;
      case 'suspended':
        newFilters.status = 'suspended';
        break;
      case 'has_bank':
        newFilters.bank_status = 'has_bank';
        break;
      case 'no_bank':
        newFilters.bank_status = 'no_bank';
        break;
      default:
        newFilters.role = 'all';
        newFilters.status = 'all';
        newFilters.bank_status = 'all';
    }
    
    setFilters(newFilters);
    let filtered = users;
    filtered = adminAccountAPI.filterUsers(filtered, { ...newFilters, search: searchQuery });
    setFilteredUsers(filtered);
  };
  
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account Management</Text>
        <Text style={styles.headerSubtitle}>Manage users and bank accounts</Text>
      </View>
      
      {/* Stats Cards */}
      {stats && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
          <View style={styles.statsContainer}>
            <StatCard
              title="Total Users"
              value={stats.total_users}
              icon="people"
              color="primary"
              onPress={() => handleStatPress('all')}
            />
            <StatCard
              title="Influencers"
              value={stats.influencers}
              icon="person"
              color="secondary"
              onPress={() => handleStatPress('influencers')}
            />
            <StatCard
              title="Brands"
              value={stats.brands}
              icon="business"
              color="info"
              onPress={() => handleStatPress('brands')}
            />
            <StatCard
              title="Suspended"
              value={stats.suspended}
              icon="lock-closed"
              color="error"
              onPress={() => handleStatPress('suspended')}
            />
            <StatCard
              title="Has Bank"
              value={stats.users_with_bank}
              icon="card"
              color="success"
              onPress={() => handleStatPress('has_bank')}
            />
            <StatCard
              title="No Bank"
              value={stats.users_without_bank}
              icon="alert-circle"
              color="warning"
              onPress={() => handleStatPress('no_bank')}
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
            placeholder="Search by name, email, or company..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.filterButton, (filters.role !== 'all' || filters.status !== 'all' || filters.bank_status !== 'all') && styles.filterButtonActive]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={20} color={(filters.role !== 'all' || filters.status !== 'all' || filters.bank_status !== 'all') ? '#2196F3' : '#666'} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExportCSV}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="download-outline" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Active Filters Display */}
      {(filters.role !== 'all' || filters.status !== 'all' || filters.bank_status !== 'all') && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersLabel}>Active filters:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.role !== 'all' && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>Role: {filters.role}</Text>
                <TouchableOpacity onPress={() => handleApplyFilters({ ...filters, role: 'all' })}>
                  <Ionicons name="close-circle" size={14} color="#666" />
                </TouchableOpacity>
              </View>
            )}
            {filters.status !== 'all' && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>Status: {filters.status}</Text>
                <TouchableOpacity onPress={() => handleApplyFilters({ ...filters, status: 'all' })}>
                  <Ionicons name="close-circle" size={14} color="#666" />
                </TouchableOpacity>
              </View>
            )}
            {filters.bank_status !== 'all' && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>
                  Bank: {filters.bank_status === 'has_bank' ? 'Has Account' : 'No Account'}
                </Text>
                <TouchableOpacity onPress={() => handleApplyFilters({ ...filters, bank_status: 'all' })}>
                  <Ionicons name="close-circle" size={14} color="#666" />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      )}
      
      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No users found</Text>
          <Text style={styles.emptyText}>
            {searchQuery || filters.role !== 'all' || filters.status !== 'all' || filters.bank_status !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Users will appear here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.user_id}
          renderItem={({ item }) => (
            <UserCard
              user={item}
              onViewProfile={handleViewProfile}
              onToggleSuspend={handleToggleSuspend}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />
      
      {/* User Detail Modal */}
      <UserDetailModal
        visible={detailModalVisible}
        user={selectedUser}
        onClose={() => setDetailModalVisible(false)}
        onToggleSuspend={handleToggleSuspend}
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
  exportButton: {
    width: 48,
    height: 48,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  activeFiltersLabel: {
    fontSize: 12,
    color: '#666',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipText: {
    fontSize: 12,
    color: '#333',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  userAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
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
  userMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  userDetails: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  linkText: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  bioText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  bankAccountCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  bankCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bankIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankInfo: {
    flex: 1,
  },
  bankHolderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  bankDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  primaryBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  bankDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bankDetailItem: {
    alignItems: 'center',
  },
  bankDetailLabel: {
    fontSize: 10,
    color: '#999',
  },
  bankDetailValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  verificationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E9',
  },
  verificationText: {
    fontSize: 10,
    color: '#F44336',
  },
  verifiedText: {
    color: '#4CAF50',
  },
  branchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  branchText: {
    fontSize: 11,
    color: '#999',
  },
  noBankContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  noBankText: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 4,
  },
  noBankTextLarge: {
    fontSize: 14,
    color: '#FF9800',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  viewButton: {
    backgroundColor: '#E3F2FD',
  },
  viewButtonText: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '500',
  },
  suspendButton: {
    backgroundColor: '#FFEBEE',
  },
  unsuspendButton: {
    backgroundColor: '#E8F5E9',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  suspendText: {
    color: '#F44336',
  },
  unsuspendText: {
    color: '#4CAF50',
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  profileBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  roleBadgeLarge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleTextLarge: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadgeLarge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusTextLarge: {
    fontSize: 12,
    fontWeight: '500',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 14,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 13,
    color: '#666',
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  linkValue: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  bioFullText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  socialLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  socialLinkText: {
    fontSize: 13,
    color: '#666',
    textTransform: 'capitalize',
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  suspendModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  unsuspendModalButton: {
    backgroundColor: '#4CAF50',
  },
  suspendModalText: {
    fontSize: 16,
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
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
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