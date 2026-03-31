import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  FlatList,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import adminLogoAPI from '../../services/adminlogoapi';

// Types
interface LogoInfo {
  current_file_id: number | null;
  filename: string | null;
  uploaded_at: string | null;
  content_type: string;
  has_logo: boolean;
}

interface LogoHistoryItem {
  file_id: number;
  filename: string;
  uploaded_at: string;
  type: 'upload' | 'revert';
  content_type: string;
  file_size?: number;
  is_current: boolean;
}

interface PlatformNameHistoryItem {
  name: string;
  changed_at: string;
  type: 'name_change' | 'revert';
  is_current: boolean;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Helper function to format file size
const formatFileSize = (bytes: number) => {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Logo History Item Component
const LogoHistoryItem = ({ item, onRevert, revertingId }: any) => {
  const isReverting = revertingId === item.file_id;

  return (
    <View style={styles.historyItem}>
      <View style={styles.historyItemLeft}>
        <View style={styles.historyIcon}>
          <Ionicons name="image" size={20} color="#2196F3" />
        </View>
        <View style={styles.historyContent}>
          <Text style={styles.historyFilename} numberOfLines={1}>
            {item.filename}
          </Text>
          <Text style={styles.historyDetails}>
            {formatDate(item.uploaded_at)}
            {item.file_size && (
              <Text style={styles.fileSize}> • {formatFileSize(item.file_size)}</Text>
            )}
            <Text style={styles.historyType}>{item.type}</Text>
          </Text>
        </View>
      </View>
      <View style={styles.historyItemRight}>
        {item.is_current ? (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>Current</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.revertButton, isReverting && styles.revertButtonDisabled]}
            onPress={() => onRevert(item)}
            disabled={isReverting}
          >
            {isReverting ? (
              <ActivityIndicator size="small" color="#2196F3" />
            ) : (
              <Ionicons name="refresh" size={14} color="#2196F3" />
            )}
            <Text style={styles.revertButtonText}>Restore</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Name History Item Component
const NameHistoryItem = ({ item, onRevert, revertingName }: any) => {
  const isReverting = revertingName === item.name;

  return (
    <View style={styles.historyItem}>
      <View style={styles.historyItemLeft}>
        <View style={styles.historyIcon}>
          <Ionicons name="text" size={20} color="#9C27B0" />
        </View>
        <View style={styles.historyContent}>
          <Text style={styles.historyFilename} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.historyDetails}>
            {formatDate(item.changed_at)}
            <Text style={styles.historyType}>{item.type === 'name_change' ? 'Change' : 'Revert'}</Text>
          </Text>
        </View>
      </View>
      <View style={styles.historyItemRight}>
        {item.is_current ? (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>Current</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.revertButton, isReverting && styles.revertButtonDisabled]}
            onPress={() => onRevert(item)}
            disabled={isReverting}
          >
            {isReverting ? (
              <ActivityIndicator size="small" color="#9C27B0" />
            ) : (
              <Ionicons name="refresh" size={14} color="#9C27B0" />
            )}
            <Text style={styles.revertButtonText}>Restore</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Empty State Component
const EmptyState = ({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name={icon as any} size={64} color="#ccc" />
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySubtitle}>{subtitle}</Text>
  </View>
);

// Main Component
export default function LogoTab() {
  const [logoInfo, setLogoInfo] = useState<LogoInfo | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoHistory, setLogoHistory] = useState<LogoHistoryItem[]>([]);
  const [platformName, setPlatformName] = useState('');
  const [newPlatformName, setNewPlatformName] = useState('');
  const [nameHistory, setNameHistory] = useState<PlatformNameHistoryItem[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [updatingName, setUpdatingName] = useState(false);
  const [revertingId, setRevertingId] = useState<number | null>(null);
  const [revertingName, setRevertingName] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [activeHistoryType, setActiveHistoryType] = useState<'logo' | 'name'>('logo');

  // Fetch logo data
  const fetchLogoData = useCallback(async () => {
    try {
      const [info, url, history] = await Promise.all([
        adminLogoAPI.getLogoInfo(),
        adminLogoAPI.getCurrentLogo(),
        adminLogoAPI.getLogoHistory(),
      ]);
      setLogoInfo(info);
      setLogoUrl(url);
      setLogoHistory(history);
    } catch (error: any) {
      console.error('Error fetching logo data:', error);
      setMessage({ text: error.message || 'Failed to load logo data', type: 'error' });
    }
  }, []);

  // Fetch platform name data
  const fetchPlatformNameData = useCallback(async () => {
    try {
      const [name, history] = await Promise.all([
        adminLogoAPI.getPlatformName(),
        adminLogoAPI.getPlatformNameHistory(),
      ]);
      setPlatformName(name.platform_name);
      setNewPlatformName(name.platform_name);
      setNameHistory(history);
    } catch (error: any) {
      console.error('Error fetching platform name:', error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchLogoData();
    fetchPlatformNameData();
  }, [fetchLogoData, fetchPlatformNameData]);

  // Clear message after timeout
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Pick image from library
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);
      
      // Validate file size (max 50MB)
      if (fileInfo.size && fileInfo.size > 50 * 1024 * 1024) {
        Alert.alert('File too large', 'Please choose an image smaller than 50MB');
        return;
      }

      // Create a File object from the URI
      const filename = asset.fileName || `logo_${Date.now()}.jpg`;
      const file = {
        uri: asset.uri,
        name: filename,
        type: asset.type || 'image/jpeg',
        size: fileInfo.size,
      } as any;

      handleUpload(file);
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to use the camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);
      
      if (fileInfo.size && fileInfo.size > 50 * 1024 * 1024) {
        Alert.alert('File too large', 'Please choose an image smaller than 50MB');
        return;
      }

      const file = {
        uri: asset.uri,
        name: `camera_${Date.now()}.jpg`,
        type: 'image/jpeg',
        size: fileInfo.size,
      } as any;

      handleUpload(file);
    }
  };

  // Handle file upload
  const handleUpload = async (file: any) => {
    setUploading(true);
    setMessage(null);

    try {
      // Create FormData compatible with React Native
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as any);

      // Use the upload endpoint
      const response = await fetch(`${adminLogoAPI['baseURL']}/api/logo/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await adminLogoAPI['getToken']()}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const data = await response.json();
      setMessage({ text: data.message || 'Logo uploaded successfully!', type: 'success' });
      
      // Refresh data
      await Promise.all([fetchLogoData(), fetchPlatformNameData()]);
    } catch (error: any) {
      console.error('Upload error:', error);
      setMessage({ text: error.message || 'Upload failed. Please try again.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  // Handle logo revert
  const handleRevertLogo = async (item: LogoHistoryItem) => {
    Alert.alert(
      'Restore Logo',
      `Are you sure you want to restore the logo "${item.filename}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            setRevertingId(item.file_id);
            try {
              await adminLogoAPI.revertLogo(item.file_id);
              setMessage({ text: 'Logo restored successfully!', type: 'success' });
              await fetchLogoData();
            } catch (error: any) {
              setMessage({ text: error.message || 'Failed to restore logo', type: 'error' });
            } finally {
              setRevertingId(null);
            }
          },
        },
      ]
    );
  };

  // Handle delete current logo
  const handleDeleteLogo = async () => {
    if (!logoInfo?.has_logo) {
      Alert.alert('No Logo', 'There is no logo to delete');
      return;
    }

    Alert.alert(
      'Delete Logo',
      'Are you sure you want to delete the current logo? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await adminLogoAPI.deleteCurrentLogo();
              setMessage({ text: 'Logo deleted successfully!', type: 'success' });
              await fetchLogoData();
            } catch (error: any) {
              setMessage({ text: error.message || 'Failed to delete logo', type: 'error' });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Handle platform name update
  const handleUpdatePlatformName = async () => {
    if (!newPlatformName.trim()) {
      setMessage({ text: 'Platform name cannot be empty', type: 'error' });
      return;
    }

    if (newPlatformName === platformName) {
      setMessage({ text: 'Platform name is already set to this value', type: 'error' });
      return;
    }

    if (newPlatformName.length > 50) {
      setMessage({ text: 'Platform name too long (max 50 characters)', type: 'error' });
      return;
    }

    setUpdatingName(true);
    try {
      await adminLogoAPI.updatePlatformName(newPlatformName);
      setPlatformName(newPlatformName);
      setMessage({ text: 'Platform name updated successfully!', type: 'success' });
      await fetchPlatformNameData();
      setNameModalVisible(false);
    } catch (error: any) {
      setMessage({ text: error.message || 'Failed to update platform name', type: 'error' });
    } finally {
      setUpdatingName(false);
    }
  };

  // Handle platform name revert
  const handleRevertPlatformName = async (item: PlatformNameHistoryItem) => {
    Alert.alert(
      'Restore Name',
      `Are you sure you want to restore the platform name "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            setRevertingName(item.name);
            try {
              await adminLogoAPI.revertPlatformName(item.name);
              setMessage({ text: 'Platform name restored successfully!', type: 'success' });
              await fetchPlatformNameData();
            } catch (error: any) {
              setMessage({ text: error.message || 'Failed to restore platform name', type: 'error' });
            } finally {
              setRevertingName(null);
            }
          },
        },
      ]
    );
  };

  // Show image picker options
  const showImagePickerOptions = () => {
    Alert.alert(
      'Upload Logo',
      'Choose an option to upload a new logo',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Take Photo', onPress: takePhoto },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Logo Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="image" size={24} color="#2196F3" />
          <View>
            <Text style={styles.sectionTitle}>Platform Logo</Text>
            <Text style={styles.sectionSubtitle}>
              {logoInfo?.has_logo ? 'Current logo' : 'No logo uploaded'}
            </Text>
          </View>
        </View>

        {/* Logo Preview */}
        <View style={styles.logoPreview}>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.logoImage} resizeMode="contain" />
          ) : (
            <View style={styles.emptyLogo}>
              <Ionicons name="image-outline" size={48} color="#ccc" />
              <Text style={styles.emptyLogoText}>No logo uploaded</Text>
            </View>
          )}
        </View>

        {/* Logo Actions */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.actionButton, styles.uploadButton]}
            onPress={showImagePickerOptions}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-upload" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>
                  {logoInfo?.has_logo ? 'Replace Logo' : 'Upload Logo'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {logoInfo?.has_logo && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDeleteLogo}
              disabled={loading}
            >
              <Ionicons name="trash" size={20} color="#F44336" />
              <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Logo History Preview */}
        {logoHistory.length > 0 && (
          <TouchableOpacity
            style={styles.historyPreview}
            onPress={() => {
              setActiveHistoryType('logo');
              setHistoryModalVisible(true);
            }}
          >
            <View style={styles.historyPreviewLeft}>
              <Ionicons name="time" size={16} color="#666" />
              <Text style={styles.historyPreviewText}>
                {logoHistory.length} version{logoHistory.length !== 1 ? 's' : ''} in history
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Platform Name Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="text" size={24} color="#9C27B0" />
          <View>
            <Text style={styles.sectionTitle}>Platform Name</Text>
            <Text style={styles.sectionSubtitle}>Current: {platformName}</Text>
          </View>
        </View>

        {/* Current Name Display */}
        <View style={styles.nameDisplay}>
          <Text style={styles.nameValue}>{platformName}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setNameModalVisible(true)}
          >
            <Ionicons name="pencil" size={20} color="#2196F3" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Name History Preview */}
        {nameHistory.length > 0 && (
          <TouchableOpacity
            style={styles.historyPreview}
            onPress={() => {
              setActiveHistoryType('name');
              setHistoryModalVisible(true);
            }}
          >
            <View style={styles.historyPreviewLeft}>
              <Ionicons name="time" size={16} color="#666" />
              <Text style={styles.historyPreviewText}>
                {nameHistory.length} version{nameHistory.length !== 1 ? 's' : ''} in history
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Message Display */}
      {message && (
        <View style={[styles.messageContainer, message.type === 'success' ? styles.successMessage : styles.errorMessage]}>
          <Ionicons name={message.type === 'success' ? 'checkmark-circle' : 'alert-circle'} size={20} color="#fff" />
          <Text style={styles.messageText}>{message.text}</Text>
        </View>
      )}

      {/* Edit Name Modal */}
      <Modal
        visible={nameModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Platform Name</Text>
              <TouchableOpacity onPress={() => setNameModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.nameInput}
              value={newPlatformName}
              onChangeText={setNewPlatformName}
              placeholder="Enter platform name"
              maxLength={50}
              autoFocus
            />
            <Text style={styles.charCount}>{newPlatformName.length}/50 characters</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setNameModalVisible(false)}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={handleUpdatePlatformName}
                disabled={updatingName}
              >
                {updatingName ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmModalText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* History Modal */}
      <Modal
        visible={historyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.historyModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeHistoryType === 'logo' ? 'Logo History' : 'Name History'}
              </Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {activeHistoryType === 'logo' ? (
              <>
                {logoHistory.length === 0 ? (
                  <EmptyState
                    icon="image-outline"
                    title="No history"
                    subtitle="Upload a logo to see history"
                  />
                ) : (
                  <FlatList
                    data={logoHistory}
                    keyExtractor={(item) => item.file_id.toString()}
                    renderItem={({ item }) => (
                      <LogoHistoryItem
                        item={item}
                        onRevert={handleRevertLogo}
                        revertingId={revertingId}
                      />
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.historyList}
                  />
                )}
              </>
            ) : (
              <>
                {nameHistory.length === 0 ? (
                  <EmptyState
                    icon="text-outline"
                    title="No history"
                    subtitle="Change the platform name to see history"
                  />
                ) : (
                  <FlatList
                    data={nameHistory}
                    keyExtractor={(item, index) => `${item.name}-${index}`}
                    renderItem={({ item }) => (
                      <NameHistoryItem
                        item={item}
                        onRevert={handleRevertPlatformName}
                        revertingName={revertingName}
                      />
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.historyList}
                  />
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  logoPreview: {
    width: '100%',
    height: 180,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  emptyLogo: {
    alignItems: 'center',
  },
  emptyLogoText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  buttonGroup: {
    flexDirection: 'row',
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
  uploadButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  nameDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  nameValue: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
  },
  editButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  historyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  historyPreviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyPreviewText: {
    fontSize: 13,
    color: '#666',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  successMessage: {
    backgroundColor: '#4CAF50',
  },
  errorMessage: {
    backgroundColor: '#F44336',
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  historyModalContent: {
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 4,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelModalText: {
    fontSize: 16,
    color: '#666',
  },
  confirmModalButton: {
    backgroundColor: '#2196F3',
  },
  confirmModalText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  historyList: {
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyFilename: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  historyDetails: {
    fontSize: 11,
    color: '#999',
  },
  fileSize: {
    color: '#999',
  },
  historyType: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  historyItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  revertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    gap: 4,
  },
  revertButtonDisabled: {
    opacity: 0.6,
  },
  revertButtonText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
});