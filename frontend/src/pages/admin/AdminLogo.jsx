import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/api";

const ModernAdminBranding = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [logoHistory, setLogoHistory] = useState([]);
  const [platformName, setPlatformName] = useState("");
  const [newPlatformName, setNewPlatformName] = useState("");
  const [nameMessage, setNameMessage] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [nameHistory, setNameHistory] = useState([]);
  const [revertingId, setRevertingId] = useState(null);
  const [logoInfo, setLogoInfo] = useState(null);

  // Enhanced error handling
  const handleApiError = (error, defaultMessage) => {
    console.error("API Error:", error);
    const serverMessage = error.response?.data?.detail || error.message;
    return serverMessage || defaultMessage;
  };

  // Fetch Logo Info (metadata)
  const fetchLogoInfo = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/logo/info`);
      setLogoInfo(res.data);
      return res.data;
    } catch (err) {
      console.log("No logo info found");
      setLogoInfo(null);
      return null;
    }
  }, []);

  // Fetch Current Logo with proper error handling
  const fetchCurrentLogo = useCallback(async () => {
    try {
      const timestamp = new Date().getTime();
      const logoInfo = await fetchLogoInfo();
      
      if (!logoInfo || !logoInfo.has_logo) {
        setPreview("");
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/api/logo/current?t=${timestamp}`, {
        responseType: "blob",
        timeout: 10000,
      });
      
      if (res.data && res.data.size > 0) {
        const url = URL.createObjectURL(res.data);
        setPreview(url);
      } else {
        throw new Error("Empty logo file");
      }
    } catch (err) {
      console.error("Error fetching logo:", err);
      setPreview("");
    }
  }, [fetchLogoInfo]);

  // Fetch Logo History
  const fetchLogoHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/logo/history`);
      const history = res.data || [];
      
      // Normalize history entries with proper IDs
      const normalizedHistory = history.map((item) => ({
        ...item,
        id: item.file_id || `hist-${Date.now()}-${Math.random()}`,
      }));

      setLogoHistory(normalizedHistory);
    } catch (err) {
      console.error("Logo history failed:", err);
      setLogoHistory([]);
    }
  }, []);

  // Fetch Platform Name
  const fetchPlatformName = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/platform/name`);
      setPlatformName(res.data.platform_name);
      setNewPlatformName(res.data.platform_name);
    } catch (err) {
      console.error("Fetch name failed:", err);
      setPlatformName("InfluenceAI");
      setNewPlatformName("InfluenceAI");
    }
  }, []);

  // Fetch Platform Name History
  const fetchPlatformNameHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/platform/name/history`);
      setNameHistory(res.data || []);
    } catch (err) {
      console.error("Name history failed:", err);
      setNameHistory([]);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchLogoInfo(),
        fetchCurrentLogo(),
        fetchLogoHistory(),
        fetchPlatformName(),
        fetchPlatformNameHistory()
      ]);
    };
    
    initializeData();
  }, [fetchCurrentLogo, fetchLogoHistory, fetchPlatformName, fetchPlatformNameHistory, fetchLogoInfo]);

  // File handling with relaxed validation
  const validateFile = (file) => {
    // More relaxed file type checking to match backend
    const allowedExtensions = [
      ".png", ".jpg", ".jpeg", ".svg", ".ico", ".gif", 
      ".webp", ".bmp", ".tiff", ".tif", ".avif", ".heic", ".heif"
    ];

    const fileExtension = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => 
      fileExtension.endsWith(ext)
    );

    if (!hasValidExtension) {
      // Warning but allow upload (matching backend behavior)
      console.warn(`Uploading file with non-standard extension: ${file.name}`);
    }

    // More generous file size limit (50MB to match backend)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error("❌ File size too large. Please choose a file smaller than 50MB.");
    }

    // Basic file existence check
    if (!file || file.size === 0) {
      throw new Error("❌ File is empty");
    }
  };

  const handleFileSelect = (selectedFile) => {
    try {
      validateFile(selectedFile);
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) handleFileSelect(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const selected = e.dataTransfer.files[0];
    if (selected) handleFileSelect(selected);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Logo Upload - Fixed to match backend
  const handleUpload = async () => {
    if (!file) {
      setMessage("❌ Please choose a file first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API_BASE_URL}/api/logo/upload`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 second timeout for large files
      });

      setMessage(`✅ ${response.data.message || "Logo uploaded successfully!"}`);
      setFile(null);
      
      // Refresh data
      await Promise.all([
        fetchLogoInfo(),
        fetchCurrentLogo(),
        fetchLogoHistory()
      ]);
    } catch (err) {
      setMessage(handleApiError(err, "❌ Upload failed. Please try again."));
    }

    setLoading(false);
  };

  // Revert Logo - Fixed to use file_id from backend
  const handleRevertLogo = async (historyItem) => {
    if (!historyItem?.file_id) {
      setMessage("❌ Invalid history entry");
      return;
    }

    if (!window.confirm(`Revert to logo "${historyItem.filename}"?`)) {
      return;
    }

    setRevertingId(historyItem.file_id);
    setMessage("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/logo/revert/${historyItem.file_id}`);
      
      setMessage(`✅ ${response.data.message || "Logo reverted successfully!"}`);
      
      // Refresh data
      await Promise.all([
        fetchLogoInfo(),
        fetchCurrentLogo(),
        fetchLogoHistory()
      ]);
    } catch (err) {
      setMessage(handleApiError(err, "❌ Failed to revert logo. Please try again."));
    }

    setRevertingId(null);
  };

  // Delete Current Logo
  const handleDeleteLogo = async () => {
    if (!window.confirm("Are you sure you want to delete the current logo?")) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await axios.delete(`${API_BASE_URL}/api/logo/current`);
      
      setMessage("✅ Current logo deleted successfully!");
      
      // Refresh data
      await Promise.all([
        fetchLogoInfo(),
        fetchCurrentLogo(),
        fetchLogoHistory()
      ]);
    } catch (err) {
      setMessage(handleApiError(err, "❌ Failed to delete logo. Please try again."));
    }

    setLoading(false);
  };

  // Update Platform Name - Fixed to match backend
  const handlePlatformNameUpdate = async () => {
    if (!newPlatformName.trim()) {
      setNameMessage("❌ Platform name cannot be empty.");
      return;
    }

    if (newPlatformName === platformName) {
      setNameMessage("ℹ️ Platform name is already set to this value.");
      return;
    }

    if (newPlatformName.length > 50) {
      setNameMessage("❌ Platform name too long (max 50 characters).");
      return;
    }

    setNameLoading(true);
    setNameMessage("");

    try {
      const response = await axios.put(`${API_BASE_URL}/api/platform/name`, { 
        name: newPlatformName 
      });

      setNameMessage(`✅ ${response.data.message || "Platform name updated successfully!"}`);
      
      // Refresh data
      await Promise.all([
        fetchPlatformName(),
        fetchPlatformNameHistory()
      ]);
    } catch (err) {
      setNameMessage(handleApiError(err, "❌ Failed to update name. Please try again."));
    }

    setNameLoading(false);
  };

  // Revert Platform Name - Fixed to match backend
  const handleRevertPlatformName = async (historyItem) => {
    if (!historyItem?.name) {
      setNameMessage("❌ Invalid history entry");
      return;
    }

    if (!window.confirm(`Revert to platform name "${historyItem.name}"?`)) {
      return;
    }

    setNameLoading(true);
    setNameMessage("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/platform/name/revert`, { 
        name: historyItem.name 
      });
      
      setNameMessage(`✅ ${response.data.message || "Platform name reverted successfully!"}`);
      
      // Refresh data
      await Promise.all([
        fetchPlatformName(),
        fetchPlatformNameHistory()
      ]);
    } catch (err) {
      setNameMessage(handleApiError(err, "❌ Failed to revert platform name. Please try again."));
    }

    setNameLoading(false);
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getHistoryTypeLabel = (type) => {
    const labels = {
      'upload': 'Upload',
      'revert': 'Revert',
      'name_change': 'Change'
    };
    return labels[type] || type;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Clear messages after timeout
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (nameMessage) {
      const timer = setTimeout(() => setNameMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [nameMessage]);

  // Icons and reusable components
  const ImageIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  );

  const UploadIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
  );

  const PackageIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
      <path d="M2 17l10 5 10-5"></path>
      <path d="M2 12l10 5 10-5"></path>
    </svg>
  );

  const HistoryIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );

  const CheckIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  const TrashIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );

  const Spinner = () => (
    <div style={styles.spinner}></div>
  );

  const EmptyHistory = ({ icon, text, hint }) => (
    <div style={styles.emptyHistory}>
      {icon}
      <p style={styles.emptyHistoryText}>{text}</p>
      <p style={styles.emptyHistoryHint}>{hint}</p>
    </div>
  );

  const HistoryItem = ({ item, index, type, onRevert, revertingId, formatDate, getTypeLabel, formatFileSize }) => (
    <div style={styles.historyItem}>
      <div style={styles.historyItemLeft}>
        <div style={styles.historyIcon}>
          {type === 'logo' ? <ImageIcon size={20} /> : <PackageIcon size={20} />}
        </div>
        <div style={styles.historyContent}>
          <p style={styles.historyFilename}>
            {type === 'logo' 
              ? (item.filename || `File #${item.file_id}`) 
              : (item.name || "Unknown name")
            }
          </p>
          <p style={styles.historyDetails}>
            {formatDate(type === 'logo' ? item.uploaded_at : item.changed_at)}
            {type === 'logo' && item.file_size && (
              <span style={styles.fileSize}> • {formatFileSize(item.file_size)}</span>
            )}
            <span style={styles.historyType}>
              {getTypeLabel(item.type)}
            </span>
          </p>
        </div>
      </div>
      <div style={styles.historyItemRight}>
        {item.is_current ? (
          <span style={styles.currentBadge}>Current</span>
        ) : (
          <button
            style={{
              ...styles.revertButton,
              ...(revertingId === item.file_id ? styles.revertButtonDisabled : {})
            }}
            onClick={() => onRevert(item)}
            disabled={revertingId === item.file_id}
          >
            {revertingId === item.file_id ? (
              <Spinner />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
            )}
            {revertingId === item.file_id ? 'Restoring...' : 'Restore'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.mainTitle}>Platform Branding</h1>
          <p style={styles.mainSubtitle}>
            Manage your platform's visual identity and branding elements
          </p>
        </div>

        {/* Main Grid */}
        <div style={styles.grid}>
          {/* Logo Upload Section */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>
                <ImageIcon />
              </div>
              <div>
                <h2 style={styles.cardTitle}>Logo Upload</h2>
                <p style={styles.cardSubtitle}>
                  {logoInfo?.has_logo 
                    ? `Current logo: ${logoInfo.filename}` 
                    : "Upload your platform logo"
                  }
                </p>
              </div>
            </div>

            {/* Preview Area */}
            <div style={styles.previewBox}>
              {preview ? (
                <img src={preview} alt="Platform Logo" style={styles.previewImage} />
              ) : (
                <div style={styles.emptyPreview}>
                  <ImageIcon size={48} />
                  <p style={styles.emptyText}>No logo uploaded</p>
                </div>
              )}
            </div>

            {/* Upload Dropzone */}
            <div
              style={{
                ...styles.dropzone,
                ...(isDragging ? styles.dropzoneDragging : {})
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <UploadIcon size={40} />
              <p style={styles.dropzoneText}>
                Drag & drop your logo here, or{" "}
                <label style={styles.browseLink}>
                  browse
                  <input
                    type="file"
                    accept="image/*,.svg,.ico,.webp,.bmp,.tiff,.tif,.avif,.heic,.heif"
                    onChange={handleFileChange}
                    style={styles.fileInput}
                  />
                </label>
              </p>
              <p style={styles.dropzoneHint}>
                Supports: PNG, JPG, SVG, GIF, ICO, WEBP, BMP, TIFF, AVIF, HEIC (Max 50MB)
              </p>
            </div>

            {/* Action Buttons */}
            <div style={styles.buttonGroup}>
              <button
                style={{
                  ...styles.uploadButton,
                  ...(loading || !file ? styles.uploadButtonDisabled : {})
                }}
                onClick={handleUpload}
                disabled={loading || !file}
              >
                {loading ? (
                  <>
                    <Spinner />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon size={20} />
                    {logoInfo?.has_logo ? 'Replace Logo' : 'Upload Logo'}
                  </>
                )}
              </button>

              {logoInfo?.has_logo && (
                <button
                  style={styles.deleteButton}
                  onClick={handleDeleteLogo}
                  disabled={loading}
                >
                  <TrashIcon size={20} />
                  Delete Logo
                </button>
              )}
            </div>

            {message && (
              <div style={{
                ...styles.message,
                ...(message.includes("✅") ? styles.messageSuccess : styles.messageError)
              }}>
                {message}
              </div>
            )}
          </div>

          {/* Platform Name Section */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>
                <PackageIcon />
              </div>
              <div>
                <h2 style={styles.cardTitle}>Platform Name</h2>
                <p style={styles.cardSubtitle}>Customize your platform's display name</p>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Current Platform Name</label>
              <input
                type="text"
                value={platformName}
                disabled
                style={styles.inputDisabled}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>New Platform Name</label>
              <input
                type="text"
                value={newPlatformName}
                onChange={(e) => setNewPlatformName(e.target.value)}
                placeholder="Enter new platform name"
                style={styles.input}
                maxLength={50}
              />
              <div style={styles.charCount}>
                {newPlatformName.length}/50 characters
              </div>
            </div>

            <button
              style={{
                ...styles.uploadButton,
                ...(nameLoading || newPlatformName.trim() === platformName ? styles.uploadButtonDisabled : {})
              }}
              onClick={handlePlatformNameUpdate}
              disabled={nameLoading || newPlatformName.trim() === platformName}
            >
              {nameLoading ? (
                <>
                  <Spinner />
                  Updating...
                </>
              ) : (
                <>
                  <CheckIcon size={20} />
                  Update Name
                </>
              )}
            </button>

            {nameMessage && (
              <div style={{
                ...styles.message,
                ...(nameMessage.includes("✅") ? styles.messageSuccess : styles.messageError)
              }}>
                {nameMessage}
              </div>
            )}
          </div>

          {/* Logo History Section */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>
                <HistoryIcon />
              </div>
              <div>
                <h2 style={styles.cardTitle}>Logo History</h2>
                <p style={styles.cardSubtitle}>Previous logo versions - Click restore to revert</p>
              </div>
            </div>

            {logoHistory.length === 0 ? (
              <EmptyHistory 
                icon={<HistoryIcon size={64} />}
                text="No logo changes recorded yet"
                hint="Upload your first logo to start tracking changes"
              />
            ) : (
              <div style={styles.historyList}>
                {logoHistory.map((item) => (
                  <HistoryItem
                    key={item.file_id}
                    item={item}
                    type="logo"
                    onRevert={handleRevertLogo}
                    revertingId={revertingId}
                    formatDate={formatDate}
                    getTypeLabel={getHistoryTypeLabel}
                    formatFileSize={formatFileSize}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Platform Name History Section */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>
                <PackageIcon />
              </div>
              <div>
                <h2 style={styles.cardTitle}>Name History</h2>
                <p style={styles.cardSubtitle}>Previous platform names - Click restore to revert</p>
              </div>
            </div>

            {nameHistory.length === 0 ? (
              <EmptyHistory 
                icon={<PackageIcon size={64} />}
                text="No name changes recorded"
                hint="Change the platform name to see history"
              />
            ) : (
              <div style={styles.historyList}>
                {nameHistory.map((item, index) => (
                  <HistoryItem
                    key={item._id || index}
                    item={item}
                    type="name"
                    onRevert={handleRevertPlatformName}
                    formatDate={formatDate}
                    getTypeLabel={getHistoryTypeLabel}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  wrapper: {
    minHeight: '100vh',
    background: '#2563eb',
    padding: '40px 20px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  mainTitle: {
    fontSize: '36px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '8px',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  mainSubtitle: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
    gap: '24px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '24px',
  },
  cardIcon: {
    color: '#2196f3',
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '4px',
  },
  cardSubtitle: {
    fontSize: '14px',
    color: '#757575',
  },
  previewBox: {
    width: '100%',
    height: '200px',
    border: '2px dashed #e0e0e0',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    background: '#fafafa',
    overflow: 'hidden',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  emptyPreview: {
    textAlign: 'center',
    color: '#bdbdbd',
  },
  emptyText: {
    marginTop: '12px',
    fontSize: '14px',
    color: '#9e9e9e',
  },
  dropzone: {
    border: '2px dashed #e0e0e0',
    borderRadius: '12px',
    padding: '40px 20px',
    textAlign: 'center',
    background: '#fafafa',
    transition: 'all 0.3s ease',
    marginBottom: '24px',
    cursor: 'pointer',
  },
  dropzoneDragging: {
    borderColor: '#2196f3',
    background: '#e3f2fd',
  },
  dropzoneText: {
    fontSize: '15px',
    color: '#424242',
    marginBottom: '8px',
  },
  browseLink: {
    color: '#2196f3',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  fileInput: {
    display: 'none',
  },
  dropzoneHint: {
    fontSize: '13px',
    color: '#9e9e9e',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  uploadButton: {
    flex: 1,
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
  },
  uploadButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  deleteButton: {
    padding: '14px 24px',
    background: 'white',
    border: '2px solid #f44336',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#f44336',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  message: {
    marginTop: '16px',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '500',
  },
  messageSuccess: {
    background: '#e8f5e9',
    color: '#2e7d32',
  },
  messageError: {
    background: '#ffebee',
    color: '#c62828',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#424242',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  },
  inputDisabled: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    background: '#f5f5f5',
    color: '#9e9e9e',
    cursor: 'not-allowed',
    boxSizing: 'border-box',
  },
  charCount: {
    fontSize: '12px',
    color: '#9e9e9e',
    textAlign: 'right',
    marginTop: '4px',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  historyItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    background: '#fafafa',
    borderRadius: '10px',
    border: '1px solid #e0e0e0',
    transition: 'all 0.2s ease',
  },
  historyItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1,
  },
  historyIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#2196f3',
    flexShrink: 0,
  },
  historyContent: {
    flex: 1,
    minWidth: 0,
  },
  historyFilename: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '4px',
    wordBreak: 'break-word',
  },
  historyDetails: {
    fontSize: '13px',
    color: '#757575',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  fileSize: {
    fontSize: '12px',
    color: '#9e9e9e',
  },
  historyType: {
    background: '#e0e0e0',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  historyItemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  currentBadge: {
    padding: '6px 16px',
    background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
    color: 'white',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
  },
  revertButton: {
    padding: '8px 16px',
    background: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#2196f3',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    minWidth: '100px',
    justifyContent: 'center',
  },
  revertButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  emptyHistory: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#bdbdbd',
  },
  emptyHistoryText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#757575',
    marginBottom: '8px',
    marginTop: '16px',
  },
  emptyHistoryHint: {
    fontSize: '14px',
    color: '#9e9e9e',
  },
};

// Add CSS animation for spinner
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default ModernAdminBranding;