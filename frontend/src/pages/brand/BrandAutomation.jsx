import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  ListItemButton,
  InputAdornment,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Slider,
  Paper,
  Grid,
  Autocomplete,
  TablePagination,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormLabel
} from "@mui/material";
import {
  Email,
  WhatsApp,
  Sms,
  Campaign,
  Analytics,
  People,
  Add,
  Group,
  Search,
  Delete,
  Send,
  Save,
  Schedule,
  AttachFile,
  InsertLink,
  AddPhotoAlternate,
  FormatBold,
  FormatItalic,
  InsertEmoticon,
  MenuBook,
  Refresh,
  MoreVert,
  PersonAdd,
  GroupAdd,
  ImportExport,
  SelectAll,
  Deselect,
  FilterList,
  CloudUpload,
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  Notifications,
  CheckCircle,
  Close,
  Edit,
  LocalOffer,
  AccessTime,
  Business,
  Phone,
  Star,
  StarBorder,
  Visibility,
  TrendingUp,
  Assessment,
  BarChart,
  Download,
  Upload,
  InsertDriveFile,
  Image,
  Description,
  Videocam,
  AudioFile,
  ExpandMore,
  ArrowDropDown,
  ArrowRight,
  Category,
  ContentCopy,
  QrCode,
  Dashboard,
  Campaign as CampaignIcon,
  Lock,
  Notes,
  Settings,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Chat,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Folder,
  FolderOpen,
  Storage,
  Link,
  Timeline,
  PieChart,
  Numbers,
  Speed,
  TrendingFlat,
  Check,
  Clear,
  Warning,
  Info,
  Error,
  VisibilityOff,
  MoreHoriz,
  CalendarToday,
  Timer,
  History,
  Summarize,
  GridView,
  List as ListIcon,
  FilterAlt,
  Sort,
  DragIndicator,
  Upgrade,
  Security,
  Payment,
  AccountBalance,
  VerifiedUser,
  Help,
  ContactSupport,
  SupportAgent
} from "@mui/icons-material";
import '../../style/BrandAutomation.css';
import API_BASE_URL from "../../config/api";
import { useAuth } from "../../context/AuthContext";




const BrandAutomation = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState({
    contacts: false,
    groups: false,
    templates: false,
    sending: false,
    uploading: false,
    importing: false
  });
  const [userInfo, setUserInfo] = useState(null);
  const [usageStats, setUsageStats] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [newContactDialog, setNewContactDialog] = useState(false);
  const [newGroupDialog, setNewGroupDialog] = useState(false);
  const [newTemplateDialog, setNewTemplateDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [apiConnected, setApiConnected] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalContacts, setTotalContacts] = useState(0);
  const [upgradeDialog, setUpgradeDialog] = useState(false);
  const [planInfo, setPlanInfo] = useState(null);

  const token = localStorage.getItem('access_token');
  const isAuthenticated = !!(user && user.token);


  // Email form state
  const [emailData, setEmailData] = useState({
    recipients: [],
    subject: "",
    message: "",
    template_id: "",
    attachments: [],
    is_bulk: false,
    schedule_time: null,
    track_opens: true,
    track_clicks: true,
    daily_limit: 500,
    messages_per_minute: 10
  });

  // New contact form
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    tags: [],
    groups: [],
    custom_fields: {},
    notes: ""
  });

  // New group form
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    color: "#667eea",
    is_active: true
  });

  // New template form
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    channel: "email",
    subject: "",
    content: "",
    category: "general",
    variables: [],
    is_active: true
  });

  // Import settings
  const [importSettings, setImportSettings] = useState({
    groupId: "",
    updateExisting: false
  });

  // Load data
  useEffect(() => {
    if (isAuthenticated && user?.role === "brand") {
      loadInitialData();
    }
  }, [isAuthenticated, user]);

  const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadUserInfo(),
        loadContacts(),
        loadGroups(),
        loadTemplates(),
        loadUsageStats(),
        loadDashboardStats(),
        loadPlanInfo()
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setError('Failed to load data. Please refresh the page.');
    }
  };

  const loadUserInfo = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/automation/user-info`, {
      headers
    });
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        setUserInfo(data.user);
      } else {
        setError(data.error || 'Failed to load user info');
      }
    }
  } catch (err) {
    console.error('Failed to load user info:', err);
    setError('Failed to load user info');
  }
};

  const loadContacts = async (page = 0, limit = 10, search = "") => {
  if (user?.role !== "brand") return;
  
  setLoading(prev => ({ ...prev, contacts: true }));
  try {
    const headers = getAuthHeaders();
    const params = new URLSearchParams({
      skip: (page * limit).toString(),
      limit: limit.toString()
    });
    
    if (search) params.append("search", search);
    if (selectedGroup !== "all") params.append("group_id", selectedGroup);
    if (selectedTags.length > 0) params.append("tags", selectedTags.join(","));
    
    const response = await fetch(`${API_BASE_URL}/automation/contacts?${params}`, {
      headers
    });
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        setContacts(data.contacts || []);
        setTotalContacts(data.total || 0);
      } else {
        setError(data.error || 'Failed to load contacts');
      }
    }
  } catch (err) {
    console.error('Failed to load contacts:', err);
    setError('Failed to load contacts');
  } finally {
    setLoading(prev => ({ ...prev, contacts: false }));
  }
};

  const loadGroups = async () => {
    if (user?.role !== "brand") return;
    
    setLoading(prev => ({ ...prev, groups: true }));
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/automation/groups`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
      }
    } catch (err) {
      console.error('Failed to load groups:', err);
      setError('Failed to load groups');
    } finally {
      setLoading(prev => ({ ...prev, groups: false }));
    }
  };

  const loadTemplates = async (channel = "email") => {
    if (user?.role !== "brand") return;
    
    setLoading(prev => ({ ...prev, templates: true }));
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/automation/templates?channel=${channel}`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(prev => ({ ...prev, templates: false }));
    }
  };

  const loadUsageStats = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/automation/usage-stats`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        setUsageStats(data.usage_stats);
      }
    } catch (err) {
      console.error('Failed to load usage stats:', err);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/automation/dashboard-stats`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data.dashboard_stats);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  };

  const loadPlanInfo = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/automation/plan-upgrade-info`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        setPlanInfo(data);
      }
    } catch (err) {
      console.error('Failed to load plan info:', err);
    }
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    
    if (user?.role !== "brand") {
      setError("Only brand users can send email campaigns");
      return;
    }

    if (emailData.recipients.length === 0) {
      setError("Please add recipients");
      return;
    }

    // Check plan features
    if (emailData.is_bulk && !userInfo?.plan_limits?.can_bulk_send) {
      setError("Bulk sending is not available in your current plan");
      setUpgradeDialog(true);
      return;
    }

    if (emailData.schedule_time && !userInfo?.plan_limits?.can_schedule) {
      setError("Scheduled sending is not available in your current plan");
      setUpgradeDialog(true);
      return;
    }

    if (emailData.attachments.length > 0 && !userInfo?.plan_limits?.can_attach_files) {
      setError("File attachments are not available in your current plan");
      setUpgradeDialog(true);
      return;
    }

    setLoading(prev => ({ ...prev, sending: true }));
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/automation/send-email`, {
        method: 'POST',
        headers,
        body: JSON.stringify(emailData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess(`Email campaign created successfully! Campaign ID: ${data.campaign_id}`);
        setEmailData(prev => ({
          ...prev,
          subject: "",
          message: "",
          template_id: "",
          attachments: []
        }));
        setAttachments([]);
        loadUsageStats();
        loadDashboardStats();
      } else {
        setError(data.detail || 'Failed to send email');
      }
    } catch (err) {
      setError('Failed to send email');
    } finally {
      setLoading(prev => ({ ...prev, sending: false }));
    }
  };

  const createContact = async () => {
    if (user?.role !== "brand") {
      setError("Only brand users can create contacts");
      return;
    }

    if (!newContact.name || (!newContact.email && !newContact.phone)) {
      setError("Please provide at least name and email or phone");
      return;
    }

    setLoading(prev => ({ ...prev, sending: true }));
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/automation/contacts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newContact)
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Contact created successfully');
        setNewContact({
          name: "",
          email: "",
          phone: "",
          company: "",
          tags: [],
          groups: [],
          custom_fields: {},
          notes: ""
        });
        setNewContactDialog(false);
        loadContacts();
        loadUsageStats();
      } else {
        setError(data.detail || 'Failed to create contact');
      }
    } catch (err) {
      setError('Failed to create contact');
    } finally {
      setLoading(prev => ({ ...prev, sending: false }));
    }
  };

  const createGroup = async () => {
    if (user?.role !== "brand") {
      setError("Only brand users can create groups");
      return;
    }

    if (!newGroup.name) {
      setError("Please provide group name");
      return;
    }

    // Check plan limits
    if (groups.length >= (userInfo?.plan_limits?.max_groups || 5)) {
      setError(`Group limit reached. Your plan allows ${userInfo?.plan_limits?.max_groups || 5} groups.`);
      setUpgradeDialog(true);
      return;
    }

    setLoading(prev => ({ ...prev, sending: true }));
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/automation/groups`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newGroup)
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Group created successfully');
        setNewGroup({
          name: "",
          description: "",
          color: "#667eea",
          is_active: true
        });
        setNewGroupDialog(false);
        loadGroups();
      } else {
        setError(data.detail || 'Failed to create group');
      }
    } catch (err) {
      setError('Failed to create group');
    } finally {
      setLoading(prev => ({ ...prev, sending: false }));
    }
  };

  const createTemplate = async () => {
    if (user?.role !== "brand") {
      setError("Only brand users can create templates");
      return;
    }

    if (!newTemplate.name || !newTemplate.content) {
      setError("Please provide template name and content");
      return;
    }

    if (newTemplate.channel === "email" && !newTemplate.subject) {
      setError("Please provide email subject");
      return;
    }

    setLoading(prev => ({ ...prev, sending: true }));
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/automation/templates`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newTemplate)
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Template created successfully');
        setNewTemplate({
          name: "",
          channel: "email",
          subject: "",
          content: "",
          category: "general",
          variables: [],
          is_active: true
        });
        setNewTemplateDialog(false);
        loadTemplates();
      } else {
        setError(data.detail || 'Failed to create template');
      }
    } catch (err) {
      setError('Failed to create template');
    } finally {
      setLoading(prev => ({ ...prev, sending: false }));
    }
  };

  const uploadAttachment = async (file) => {
    if (!userInfo?.plan_limits?.can_attach_files) {
      setError("File attachments are not available in your current plan");
      setUpgradeDialog(true);
      return;
    }

    setLoading(prev => ({ ...prev, uploading: true }));
    setUploadProgress(0);
    
    try {
      const headers = await getAuthHeaders();
      const formData = new FormData();
      formData.append("file", file);
      
      // Create a fake progress indicator
      const interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const response = await fetch(`${API_BASE_URL}/automation/attachments`, {
        method: 'POST',
        headers: {
          'Authorization': headers.Authorization
        },
        body: formData
      });

      clearInterval(interval);
      setUploadProgress(100);

      const data = await response.json();
      
      if (response.ok) {
        setAttachments(prev => [...prev, data.attachment_id]);
        setEmailData(prev => ({ 
          ...prev, 
          attachments: [...prev.attachments, data.attachment_id] 
        }));
        setSuccess(`File "${data.filename}" uploaded successfully`);
      } else {
        setError(data.detail || 'Failed to upload file');
      }
    } catch (err) {
      setError('Failed to upload file');
    } finally {
      setLoading(prev => ({ ...prev, uploading: false }));
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const importContacts = async (file) => {
    if (user?.role !== "brand") {
      setError("Only brand users can import contacts");
      return;
    }

    setLoading(prev => ({ ...prev, importing: true }));
    
    try {
      const headers = await getAuthHeaders();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("group_id", importSettings.groupId);
      formData.append("update_existing", importSettings.updateExisting.toString());
      
      const response = await fetch(`${API_BASE_URL}/automation/contacts/import`, {
        method: 'POST',
        headers: {
          'Authorization': headers.Authorization
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess(data.message || 'Contacts imported successfully');
        setImportDialog(false);
        loadContacts();
        loadUsageStats();
      } else {
        setError(data.detail || 'Failed to import contacts');
      }
    } catch (err) {
      setError('Failed to import contacts');
    } finally {
      setLoading(prev => ({ ...prev, importing: false }));
    }
  };

  const applyTemplate = (template) => {
    setEmailData(prev => ({
      ...prev,
      subject: template.subject || prev.subject,
      message: template.content,
      template_id: template._id
    }));
    setSuccess(`Template "${template.name}" applied successfully`);
  };

  const handleTemplateVariables = (template) => {
    const variables = template.variables || [];
    if (variables.length > 0) {
      let message = template.content;
      variables.forEach(variable => {
        const value = prompt(`Enter value for ${variable}:`, `{${variable}}`);
        if (value) {
          message = message.replace(new RegExp(`{${variable}}`, 'g'), value);
        }
      });
      setEmailData(prev => ({
        ...prev,
        message: message,
        subject: template.subject || prev.subject,
        template_id: template._id
      }));
    } else {
      applyTemplate(template);
    }
  };

  // Helper functions
  const handleSelectContact = (contactId) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c._id));
    }
  };

  const addSelectedToRecipients = () => {
    const selected = contacts.filter(c => selectedContacts.includes(c._id));
    const emails = selected.map(c => c.email).filter(Boolean);
    setEmailData(prev => ({ 
      ...prev, 
      recipients: [...new Set([...prev.recipients, ...emails])] 
    }));
    setSelectedContacts([]);
    setSuccess(`Added ${emails.length} contacts to recipients`);
  };

  const removeRecipient = (email) => {
    setEmailData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(e => e !== email)
    }));
  };

  const handleSearchRecipient = (e) => {
    const value = e.target.value;
    if (value.includes(',') || value.includes(';')) {
      const emails = value.split(/[,;]/).map(e => e.trim()).filter(Boolean);
      setEmailData(prev => ({ 
        ...prev, 
        recipients: [...new Set([...prev.recipients, ...emails])] 
      }));
      e.target.value = '';
    }
  };

  const addGroupToRecipients = (groupId) => {
    const group = groups.find(g => g._id === groupId);
    if (group) {
      const groupContacts = contacts.filter(c => c.groups?.includes(groupId));
      const emails = groupContacts.map(c => c.email).filter(Boolean);
      setEmailData(prev => ({ 
        ...prev, 
        recipients: [...new Set([...prev.recipients, ...emails])] 
      }));
      setSuccess(`Added ${emails.length} contacts from "${group.name}"`);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'text/csv'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError(`File type ${file.type} not supported`);
        return;
      }
      
      uploadAttachment(file);
    });
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'text/csv') {
      setError('Please upload a CSV file');
      return;
    }
    
    importContacts(file);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    loadContacts(newPage, rowsPerPage, searchQuery);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    loadContacts(0, parseInt(event.target.value, 10), searchQuery);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(0);
    loadContacts(0, rowsPerPage, value);
  };

  const handleCloseSnackbar = () => {
    setSuccess("");
    setError("");
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Check if user can access a feature
  const canUseFeature = (feature) => {
    if (!userInfo?.plan_limits) return false;
    return userInfo.plan_limits[feature] || false;
  };

  // Stats display components
  const StatCard = ({ title, value, icon, color, progress = null, max = null, onClick = null }) => (
    <Card 
      sx={{ 
        borderRadius: 3, 
        p: 3,
        backgroundColor: color ? `${color}10` : '#f8f9fa',
        border: `1px solid ${color}20`,
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { 
          borderColor: color,
          boxShadow: `0 4px 12px ${color}20`
        } : {}
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ 
          backgroundColor: color ? `${color}20` : '#e9ecef',
          borderRadius: '12px',
          p: 1,
          mr: 2
        }}>
          {icon}
        </Box>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" fontWeight="700" gutterBottom>
        {value}
      </Typography>
      {progress !== null && max !== null && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={(progress / max) * 100} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: `${color}20`,
              '& .MuiLinearProgress-bar': {
                backgroundColor: color
              }
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {progress} of {max} ({Math.round((progress / max) * 100)}%)
          </Typography>
        </Box>
      )}
    </Card>
  );

  if (!user) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 3
      }}>
        <Lock sx={{ fontSize: 60, color: '#667eea' }} />
        <Typography variant="h4" color="text.secondary">
          Please log in to access Marketing Automation
        </Typography>
        <Button 
          variant="contained" 
          href="/login"
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #4987e3ff 100%)',
            px: 4,
            py: 1.5
          }}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  if (user?.role !== "brand") {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 3
      }}>
        <Security sx={{ fontSize: 60, color: '#f44336' }} />
        <Typography variant="h4" color="text.secondary">
          This feature is only available for brand users
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please contact support to upgrade your account
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ContactSupport />}
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #4987e3ff 100%)',
            px: 4,
            py: 1.5
          }}
          href="/support"
        >
          Contact Support
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: { xs: 2, md: 4 }
    }}>
      {/* Header Section */}
      <section style={{ marginBottom: 32 }}>
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #667eea 0%, #4987e3ff 100%)',
          color: 'white'
        }}>
          <Box sx={{ 
            padding: { xs: 3, md: 4 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 3
          }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Campaign sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="700">
                    Marketing Automation
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    {userInfo?.username ? `Welcome, ${userInfo.username}` : 'Manage your marketing campaigns'}
                  </Typography>
                </Box>
              </Box>
              
              {/* Plan Info & Quick Stats */}
              <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                {userInfo?.subscription && (
                  <Chip 
                    label={userInfo.subscription.plan?.toUpperCase() || 'FREE'}
                    sx={{ 
                      backgroundColor: '#ffffff20',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                )}
                
                {usageStats && (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email fontSize="small" />
                      <Typography variant="body2">
                        {usageStats.daily?.sent || 0}/{usageStats.daily?.limit || 50} emails today
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <People fontSize="small" />
                      <Typography variant="body2">
                        {usageStats.totals?.contacts || 0} contacts
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="API Status">
                <Badge 
                  color={apiConnected ? "success" : "error"} 
                  variant="dot"
                  sx={{ '& .MuiBadge-dot': { backgroundColor: apiConnected ? '#4caf50' : '#f44336' } }}
                >
                  {apiConnected ? <Cloud /> : <CloudOff />}
                </Badge>
              </Tooltip>
              
              <Button
                variant="contained"
                sx={{ 
                  backgroundColor: 'white',
                  color: '#2563eb',
                  '&:hover': { backgroundColor: '#f8f9fa' }
                }}
                startIcon={<Refresh />}
                onClick={loadInitialData}
              >
                Refresh
              </Button>

              <Button
                variant="outlined"
                sx={{ 
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { borderColor: '#ffffff80', backgroundColor: '#ffffff10' }
                }}
                startIcon={<Upgrade />}
                onClick={() => setUpgradeDialog(true)}
              >
                Upgrade Plan
              </Button>

              <IconButton 
                sx={{ color: 'white' }}
                onClick={handleMenuOpen}
              >
                <MoreVert />
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: { width: 200 }
                }}
              >
                <MenuItem onClick={() => { handleMenuClose(); setNewContactDialog(true); }}>
                  <PersonAdd fontSize="small" sx={{ mr: 1 }} />
                  Add Contact
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); setNewGroupDialog(true); }}>
                  <GroupAdd fontSize="small" sx={{ mr: 1 }} />
                  Create Group
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); setNewTemplateDialog(true); }}>
                  <Dashboard fontSize="small" sx={{ mr: 1 }} />
                  New Template
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleMenuClose(); setImportDialog(true); }}>
                  <ImportExport fontSize="small" sx={{ mr: 1 }} />
                  Import Contacts
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); window.open('/support', '_blank'); }}>
                  <SupportAgent fontSize="small" sx={{ mr: 1 }} />
                  Support
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); setUpgradeDialog(true); }}>
                  <Upgrade fontSize="small" sx={{ mr: 1 }} />
                  Upgrade Plan
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Card>
      </section>

      {/* Plan Limit Warning */}
      {userInfo?.subscription?.plan === 'free' && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3, borderRadius: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => setUpgradeDialog(true)}
            >
              UPGRADE
            </Button>
          }
        >
          You're on the Free plan. Upgrade to unlock more features and higher limits!
        </Alert>
      )}

      {/* Dashboard Stats Section */}
      {activeTab === 0 && (
        <section style={{ marginBottom: 32 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Contacts"
                value={totalContacts}
                icon={<People color="primary" />}
                color="#667eea"
                onClick={() => setActiveTab(2)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Email Sent Today"
                value={usageStats?.daily?.sent || 0}
                icon={<Email color="secondary" />}
                color="#f44336"
                progress={usageStats?.daily?.sent || 0}
                max={usageStats?.daily?.limit || 50}
                onClick={() => setActiveTab(1)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Campaign Success"
                value={`${dashboardStats?.campaign_summary?.success_rate?.toFixed(1) || 0}%`}
                icon={<TrendingUp color="success" />}
                color="#4caf50"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Groups"
                value={groups.length}
                icon={<Group color="warning" />}
                color="#ff9800"
                onClick={() => setNewGroupDialog(true)}
              />
            </Grid>
          </Grid>

          {/* Recent Activity */}
          {dashboardStats?.recent_campaigns && dashboardStats.recent_campaigns.length > 0 && (
            <Card sx={{ borderRadius: 3, boxShadow: 2, mt: 3, p: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <History />
                Recent Campaigns
              </Typography>
              <List>
                {dashboardStats.recent_campaigns.map((campaign, index) => (
                  <React.Fragment key={campaign._id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight="600">
                              {campaign.subject?.substring(0, 50)}...
                            </Typography>
                            <Chip 
                              label={campaign.status}
                              size="small"
                              color={
                                campaign.status === 'sent' ? 'success' : 
                                campaign.status === 'failed' ? 'error' : 'warning'
                              }
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {campaign.recipients?.length || 0} recipients • 
                              {new Date(campaign.created_at).toLocaleDateString()}
                            </Typography>
                            {campaign.error && (
                              <Typography variant="caption" color="error">
                                Error: {campaign.error}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    {index < dashboardStats.recent_campaigns.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Card>
          )}
        </section>
      )}

      {/* Tabs Section */}
      <section style={{ marginBottom: 32 }}>
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                py: 3,
                px: 4,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                '&.Mui-selected': {
                  color: '#667eea'
                }
              }
            }}
          >
            <Tab icon={<Dashboard />} label="Dashboard" />
            <Tab 
              icon={<Email />} 
              label="Email Campaign" 
              disabled={!canUseFeature('daily_emails')}
            />
            <Tab icon={<People />} label="Contacts" />
            <Tab icon={<Dashboard />} label="Templates" />
            <Tab 
              icon={<WhatsApp />} 
              label="WhatsApp" 
              disabled={!canUseFeature('can_whatsapp')}
              title={!canUseFeature('can_whatsapp') ? 'Upgrade to Pro plan or higher' : ''}
            />
            <Tab 
              icon={<Sms />} 
              label="SMS" 
              disabled={!canUseFeature('can_sms')}
              title={!canUseFeature('can_sms') ? 'Upgrade to Pro plan or higher' : ''}
            />
            <Tab icon={<BarChart />} label="Analytics" />
          </Tabs>
        </Card>
      </section>

      {/* Email Campaign Section */}
      {activeTab === 1 && (
        <section style={{ marginBottom: 32 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <Box sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email color="primary" />
                Compose Email Campaign
                {usageStats?.daily && (
                  <Chip 
                    label={`${usageStats.daily.remaining} emails remaining today`}
                    size="small"
                    color={usageStats.daily.remaining > 0 ? 'primary' : 'error'}
                    sx={{ ml: 2 }}
                  />
                )}
              </Typography>
              
              <form onSubmit={sendEmail}>
                {/* Recipients Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People fontSize="small" />
                    Recipients
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({emailData.recipients.length} selected)
                    </Typography>
                  </Typography>
                  
                  {/* Recipients Display */}
                  {emailData.recipients.length > 0 && (
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1, 
                      mb: 2,
                      p: 2,
                      backgroundColor: '#f8f9fa',
                      borderRadius: 2,
                      border: '1px solid #e9ecef'
                    }}>
                      {emailData.recipients.map((email, index) => (
                        <Chip
                          key={index}
                          label={email}
                          onDelete={() => removeRecipient(email)}
                          color="primary"
                          size="small"
                          sx={{ 
                            backgroundColor: '#e3f2fd',
                            '& .MuiChip-deleteIcon': { color: '#1976d2' }
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Add Recipients Input */}
                  <TextField
                    fullWidth
                    placeholder="Enter email addresses (comma or semicolon separated)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchRecipient(e);
                      }
                    }}
                    onBlur={handleSearchRecipient}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />

                  {/* Quick Add Groups */}
                  {groups.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Quick add groups:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {groups.slice(0, 5).map(group => (
                          <Chip
                            key={group._id}
                            label={`${group.name} (${group.member_count || 0})`}
                            onClick={() => addGroupToRecipients(group._id)}
                            variant="outlined"
                            size="small"
                            sx={{ 
                              borderColor: group.color || '#1976d2',
                              color: group.color || '#1976d2',
                              '&:hover': { backgroundColor: group.color ? `${group.color}10` : '#e3f2fd' }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Subject */}
                <TextField
                  fullWidth
                  label="Subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  margin="normal"
                  required
                  sx={{ mb: 3 }}
                />

                {/* Template Selection */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Quick Templates
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                    {templates
                      .filter(t => t.channel === 'email')
                      .slice(0, 6)
                      .map(template => (
                        <Card
                          key={template._id}
                          sx={{
                            minWidth: 200,
                            cursor: 'pointer',
                            border: emailData.template_id === template._id ? '2px solid #667eea' : '1px solid #e9ecef',
                            borderRadius: 2,
                            p: 2,
                            '&:hover': { 
                              borderColor: '#667eea',
                              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.1)'
                            }
                          }}
                          onClick={() => handleTemplateVariables(template)}
                        >
                          <Typography variant="subtitle2" fontWeight="600" noWrap>
                            {template.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {template.category}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            {template.variables?.length || 0} variables
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            sx={{ mt: 1 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewContent(template.content);
                              setPreviewDialog(true);
                            }}
                          >
                            Preview
                          </Button>
                        </Card>
                      ))}
                  </Box>
                  <Button
                    startIcon={<Add />}
                    onClick={() => setNewTemplateDialog(true)}
                    sx={{ mt: 1 }}
                  >
                    Create New Template
                  </Button>
                </Box>

                {/* Message Editor */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MenuBook fontSize="small" />
                    Message
                  </Typography>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={12}
                    value={emailData.message}
                    onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Type your email message here... Use {variable_name} for template variables"
                    required
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#f8f9fa',
                        '&:hover': { backgroundColor: '#f1f3f4' }
                      }
                    }}
                  />

                  {/* Editor Toolbar */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    mt: 2, 
                    p: 2,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid #e9ecef'
                  }}>
                    <Tooltip title="Attach File">
                      <IconButton 
                        size="small"
                        component="label"
                        disabled={!canUseFeature('can_attach_files')}
                        title={!canUseFeature('can_attach_files') ? 'Upgrade to attach files' : ''}
                      >
                        <AttachFile fontSize="small" />
                        <input
                          type="file"
                          hidden
                          multiple
                          onChange={handleFileUpload}
                        />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Add Image">
                      <IconButton 
                        size="small"
                        component="label"
                        disabled={!canUseFeature('can_attach_files')}
                        title={!canUseFeature('can_attach_files') ? 'Upgrade to attach files' : ''}
                      >
                        <AddPhotoAlternate fontSize="small" />
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Upload Progress */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={uploadProgress} 
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Uploading... {uploadProgress}%
                      </Typography>
                    </Box>
                  )}

                  {/* Attachments List */}
                  {attachments.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Attachments:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {attachments.map((attachmentId, index) => (
                          <Chip
                            key={index}
                            label={`File ${index + 1}`}
                            onDelete={() => {
                              setAttachments(prev => prev.filter(id => id !== attachmentId));
                              setEmailData(prev => ({
                                ...prev,
                                attachments: prev.attachments.filter(id => id !== attachmentId)
                              }));
                            }}
                            size="small"
                            sx={{ backgroundColor: '#e9ecef' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Options Section */}
                <Box sx={{ 
                  mb: 4, 
                  p: 3,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 3,
                  border: '1px solid #e9ecef'
                }}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    Campaign Options
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={emailData.track_opens}
                            onChange={(e) => setEmailData(prev => ({ ...prev, track_opens: e.target.checked }))}
                            color="primary"
                          />
                        }
                        label="Track Opens"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={emailData.track_clicks}
                            onChange={(e) => setEmailData(prev => ({ ...prev, track_clicks: e.target.checked }))}
                            color="primary"
                          />
                        }
                        label="Track Clicks"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={emailData.is_bulk}
                            onChange={(e) => setEmailData(prev => ({ ...prev, is_bulk: e.target.checked }))}
                            color="primary"
                            disabled={!canUseFeature('can_bulk_send')}
                            title={!canUseFeature('can_bulk_send') ? 'Upgrade to enable bulk sending' : ''}
                          />
                        }
                        label="Bulk Send"
                      />
                    </Grid>
                    
                    {/* Bulk Options */}
                    {emailData.is_bulk && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Bulk sending settings:
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" display="block" gutterBottom>
                            Daily limit: {emailData.daily_limit} emails
                          </Typography>
                          <Slider
                            value={emailData.daily_limit}
                            onChange={(e, newValue) => setEmailData(prev => ({ ...prev, daily_limit: newValue }))}
                            min={1}
                            max={1000}
                            valueLabelDisplay="auto"
                          />
                        </Box>
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="caption" display="block" gutterBottom>
                            Messages per minute: {emailData.messages_per_minute}
                          </Typography>
                          <Slider
                            value={emailData.messages_per_minute}
                            onChange={(e, newValue) => setEmailData(prev => ({ ...prev, messages_per_minute: newValue }))}
                            min={1}
                            max={60}
                            valueLabelDisplay="auto"
                          />
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2,
                  pt: 3,
                  borderTop: '1px solid #e9ecef'
                }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Send />}
                    disabled={loading.sending || emailData.recipients.length === 0}
                    sx={{ 
                      px: 4,
                      py: 1.5,
                      background: '#2563eb',
                      '&:hover': {
                        background: '#2563eb'
                      }
                    }}
                  >
                    {loading.sending ? <CircularProgress size={24} /> : 'Send Campaign'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Schedule />}
                    onClick={() => setEmailData(prev => ({ ...prev, schedule_time: new Date().toISOString() }))}
                    disabled={!canUseFeature('can_schedule')}
                    title={!canUseFeature('can_schedule') ? 'Upgrade to enable scheduling' : ''}
                  >
                    Schedule
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => {
                      setPreviewContent(emailData.message);
                      setPreviewDialog(true);
                    }}
                  >
                    Preview
                  </Button>
                </Box>
              </form>
            </Box>
          </Card>
        </section>
      )}

      {/* Contacts Section */}
      {activeTab === 2 && (
        <section style={{ marginBottom: 32 }}>
          {/* Contacts Header */}
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: 2,
            mb: 3 
          }}>
            <Box sx={{ 
              p: 3,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2
            }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <People color="primary" />
                  Contacts Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {totalContacts} contacts • {groups.length} groups • 
                  Limit: {userInfo?.plan_limits?.max_contacts || 100}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={() => setNewContactDialog(true)}
                  disabled={totalContacts >= (userInfo?.plan_limits?.max_contacts || 100)}
                  title={totalContacts >= (userInfo?.plan_limits?.max_contacts || 100) ? 'Contact limit reached. Upgrade to add more.' : ''}
                >
                  Add Contact
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<GroupAdd />}
                  onClick={() => setNewGroupDialog(true)}
                  disabled={groups.length >= (userInfo?.plan_limits?.max_groups || 5)}
                  title={groups.length >= (userInfo?.plan_limits?.max_groups || 5) ? 'Group limit reached. Upgrade to add more.' : ''}
                >
                  Create Group
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ImportExport />}
                  onClick={() => setImportDialog(true)}
                >
                  Import
                </Button>
              </Box>
            </Box>
          </Card>

          {/* Search and Filter */}
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: 2,
            mb: 3,
            p: 3
          }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search contacts by name, email, or company..."
                  size="small"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <Select
                  fullWidth
                  size="small"
                  value={selectedGroup}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value);
                    loadContacts(0, rowsPerPage, searchQuery);
                  }}
                  displayEmpty
                >
                  <MenuItem value="all">All Groups</MenuItem>
                  {groups.map(group => (
                    <MenuItem key={group._id} value={group._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: group.color }} />
                        {group.name} ({group.member_count || 0})
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={6} md={3}>
                <Select
                  fullWidth
                  size="small"
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                >
                  <MenuItem value="list">
                    <ListIcon fontSize="small" sx={{ mr: 1 }} />
                    List View
                  </MenuItem>
                  <MenuItem value="grid">
                    <GridView fontSize="small" sx={{ mr: 1 }} />
                    Grid View
                  </MenuItem>
                </Select>
              </Grid>
            </Grid>
          </Card>

          {/* Selection Actions */}
          {selectedContacts.length > 0 && (
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: 2,
              mb: 3,
              backgroundColor: '#e3f2fd',
              border: '1px solid #bbdefb'
            }}>
              <Box sx={{ 
                p: 3,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircle color="primary" />
                  <Typography variant="subtitle1" fontWeight="600">
                    {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Email />}
                    onClick={addSelectedToRecipients}
                  >
                    Add to Email
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={selectedContacts.length === contacts.length ? <Deselect /> : <SelectAll />}
                    onClick={handleSelectAll}
                  >
                    {selectedContacts.length === contacts.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </Box>
              </Box>
            </Card>
          )}

          {/* Contacts List/Grid */}
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            {loading.contacts ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                <CircularProgress />
              </Box>
            ) : contacts.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 8 }}>
                <People sx={{ fontSize: 60, color: '#dee2e6', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No contacts found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {searchQuery ? 'Try a different search' : 'Add your first contact to get started'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={() => setNewContactDialog(true)}
                  disabled={totalContacts >= (userInfo?.plan_limits?.max_contacts || 100)}
                >
                  Add Contact
                </Button>
              </Box>
            ) : viewMode === "list" ? (
              <>
                <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                  {contacts.map((contact, index) => (
                    <React.Fragment key={contact._id}>
                      <ListItem
                        secondaryAction={
                          <Checkbox
                            edge="end"
                            checked={selectedContacts.includes(contact._id)}
                            onChange={() => handleSelectContact(contact._id)}
                          />
                        }
                        sx={{
                          px: 3,
                          py: 2,
                          '&:hover': { backgroundColor: '#f8f9fa' }
                        }}
                      >
                        <ListItemButton 
                          onClick={() => handleSelectContact(contact._id)}
                          sx={{ borderRadius: 2 }}
                        >
                          <Avatar 
                            sx={{ 
                              mr: 2,
                              bgcolor: contact.email ? '#667eea' : '#6c757d',
                              width: 48,
                              height: 48
                            }}
                          >
                            {contact.name?.charAt(0).toUpperCase() || '?'}
                          </Avatar>
                          
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                <Typography variant="subtitle1" fontWeight="600">
                                  {contact.name || 'Unnamed Contact'}
                                </Typography>
                                {contact.tags?.includes('VIP') && (
                                  <Chip 
                                    label="VIP" 
                                    size="small" 
                                    color="error" 
                                    sx={{ height: 20, fontSize: '0.75rem' }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 1 }}>
                                {contact.email && (
                                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Email fontSize="small" />
                                    {contact.email}
                                  </Typography>
                                )}
                                {contact.phone && (
                                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Phone fontSize="small" />
                                    {contact.phone}
                                  </Typography>
                                )}
                                {contact.company && (
                                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Business fontSize="small" />
                                    {contact.company}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                      {index < contacts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                <TablePagination
                  component="div"
                  count={totalContacts}
                  page={page}
                  onPageChange={handlePageChange}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </>
            ) : (
              <Grid container spacing={2} sx={{ p: 3 }}>
                {contacts.map((contact) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={contact._id}>
                    <Card 
                      sx={{ 
                        p: 3,
                        cursor: 'pointer',
                        border: selectedContacts.includes(contact._id) ? '2px solid #667eea' : '1px solid #e9ecef',
                        '&:hover': { borderColor: '#667eea' }
                      }}
                      onClick={() => handleSelectContact(contact._id)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Checkbox
                          checked={selectedContacts.includes(contact._id)}
                          onChange={() => handleSelectContact(contact._id)}
                          sx={{ mr: 1 }}
                        />
                        <Avatar 
                          sx={{ 
                            bgcolor: contact.email ? '#667eea' : '#6c757d',
                            width: 40,
                            height: 40
                          }}
                        >
                          {contact.name?.charAt(0).toUpperCase() || '?'}
                        </Avatar>
                      </Box>
                      
                      <Typography variant="subtitle1" fontWeight="600" noWrap>
                        {contact.name || 'Unnamed Contact'}
                      </Typography>
                      
                      {contact.email && (
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 1 }}>
                          <Email fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          {contact.email}
                        </Typography>
                      )}
                      
                      {contact.company && (
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
                          <Business fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          {contact.company}
                        </Typography>
                      )}
                      
                      {contact.tags && contact.tags.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
                          {contact.tags.slice(0, 3).map((tag, idx) => (
                            <Chip 
                              key={idx}
                              label={tag}
                              size="small"
                              sx={{ fontSize: '0.65rem', height: 20 }}
                            />
                          ))}
                        </Box>
                      )}
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Card>
        </section>
      )}

      {/* Templates Section */}
      {activeTab === 3 && (
        <section style={{ marginBottom: 32 }}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: 2,
            mb: 3 
          }}>
            <Box sx={{ 
              p: 3,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2
            }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Dashboard color="primary" />
                  Email Templates
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create and manage email templates for your campaigns
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setNewTemplateDialog(true)}
              >
                New Template
              </Button>
            </Box>
          </Card>

          {/* Templates Grid */}
          <Grid container spacing={3}>
            {loading.templates ? (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                  <CircularProgress />
                </Box>
              </Grid>
            ) : templates.length === 0 ? (
              <Grid item xs={12}>
                <Card sx={{ textAlign: 'center', p: 8 }}>
                  <Dashboard sx={{ fontSize: 60, color: '#dee2e6', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No templates found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Create your first template to get started
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setNewTemplateDialog(true)}
                  >
                    Create Template
                  </Button>
                </Card>
              </Grid>
            ) : (
              templates.map(template => (
                <Grid item xs={12} md={6} lg={4} key={template._id}>
                  <Card sx={{ 
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid #e9ecef',
                    '&:hover': { 
                      borderColor: '#667eea',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.1)'
                    }
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="600">
                          {template.name}
                        </Typography>
                        <Chip 
                          label={template.category}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <IconButton size="small">
                        <MoreHoriz />
                      </IconButton>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                      {template.subject || 'No subject'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {template.variables?.map((variable, idx) => (
                        <Chip
                          key={idx}
                          label={`{${variable}}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ContentCopy />}
                        fullWidth
                        onClick={() => handleTemplateVariables(template)}
                      >
                        Use Template
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        fullWidth
                        onClick={() => {
                          setPreviewContent(template.content);
                          setPreviewDialog(true);
                        }}
                      >
                        Preview
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </section>
      )}

      {/* Add Contact Dialog */}
      <Dialog 
        open={newContactDialog} 
        onClose={() => setNewContactDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          pb: 2 
        }}>
          <PersonAdd color="primary" />
          <Typography variant="h6">Add New Contact</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name *"
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company"
                  value={newContact.company}
                  onChange={(e) => setNewContact(prev => ({ ...prev, company: e.target.value }))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={newContact.tags}
                  onChange={(event, newValue) => {
                    setNewContact(prev => ({ ...prev, tags: newValue }));
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tags"
                      placeholder="Add tags (press enter)"
                      margin="normal"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={groups}
                  getOptionLabel={(option) => option.name}
                  value={groups.filter(g => newContact.groups.includes(g._id))}
                  onChange={(event, newValue) => {
                    setNewContact(prev => ({ 
                      ...prev, 
                      groups: newValue.map(g => g._id) 
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Groups"
                      placeholder="Select groups"
                      margin="normal"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={newContact.notes}
                  onChange={(e) => setNewContact(prev => ({ ...prev, notes: e.target.value }))}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setNewContactDialog(false)}>Cancel</Button>
          <Button 
            onClick={createContact} 
            variant="contained" 
            disabled={loading.sending || (!newContact.name && (!newContact.email && !newContact.phone))}
          >
            {loading.sending ? <CircularProgress size={24} /> : 'Add Contact'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Group Dialog */}
      <Dialog 
        open={newGroupDialog} 
        onClose={() => setNewGroupDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          pb: 2 
        }}>
          <GroupAdd color="primary" />
          <Typography variant="h6">Create New Group</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Group Name *"
              value={newGroup.name}
              onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={newGroup.description}
              onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Color</InputLabel>
              <Select
                value={newGroup.color}
                onChange={(e) => setNewGroup(prev => ({ ...prev, color: e.target.value }))}
                label="Color"
              >
                <MenuItem value="#667eea">Purple</MenuItem>
                <MenuItem value="#4caf50">Green</MenuItem>
                <MenuItem value="#2196f3">Blue</MenuItem>
                <MenuItem value="#ff9800">Orange</MenuItem>
                <MenuItem value="#f44336">Red</MenuItem>
                <MenuItem value="#9c27b0">Deep Purple</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setNewGroupDialog(false)}>Cancel</Button>
          <Button 
            onClick={createGroup} 
            variant="contained" 
            disabled={loading.sending || !newGroup.name}
          >
            {loading.sending ? <CircularProgress size={24} /> : 'Create Group'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Template Dialog */}
      <Dialog 
        open={newTemplateDialog} 
        onClose={() => setNewTemplateDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          pb: 2 
        }}>
          <Dashboard color="primary" />
          <Typography variant="h6">Create New Template</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Template Name *"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Channel</InputLabel>
                  <Select
                    value={newTemplate.channel}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, channel: e.target.value }))}
                    label="Channel"
                  >
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="whatsapp" disabled={!canUseFeature('can_whatsapp')}>
                      WhatsApp {!canUseFeature('can_whatsapp') && '(Upgrade Required)'}
                    </MenuItem>
                    <MenuItem value="sms" disabled={!canUseFeature('can_sms')}>
                      SMS {!canUseFeature('can_sms') && '(Upgrade Required)'}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {newTemplate.channel === "email" && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject *"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                    margin="normal"
                    required
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Category"
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Template Content *"
                  multiline
                  rows={8}
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                  margin="normal"
                  required
                  helperText="Use {variable_name} for dynamic content"
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={newTemplate.variables}
                  onChange={(event, newValue) => {
                    const cleaned = newValue.map(v => v.replace(/[{}]/g, ''));
                    setNewTemplate(prev => ({ ...prev, variables: cleaned }));
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={`{${option}}`}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Variables"
                      placeholder="Add variables (press enter)"
                      margin="normal"
                      helperText="These will be replaced when using the template"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setNewTemplateDialog(false)}>Cancel</Button>
          <Button 
            onClick={createTemplate} 
            variant="contained" 
            disabled={loading.sending || !newTemplate.name || !newTemplate.content || (newTemplate.channel === "email" && !newTemplate.subject)}
          >
            {loading.sending ? <CircularProgress size={24} /> : 'Create Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Contacts Dialog */}
      <Dialog 
        open={importDialog} 
        onClose={() => setImportDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          pb: 2 
        }}>
          <ImportExport color="primary" />
          <Typography variant="h6">Import Contacts</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" gutterBottom>
              Upload a CSV file with your contacts. Required columns:
            </Typography>
            <Box sx={{ 
              backgroundColor: '#f8f9fa', 
              p: 2, 
              borderRadius: 2, 
              mb: 3,
              fontFamily: 'monospace',
              fontSize: '0.9rem'
            }}>
              name, email, phone, company, tags
            </Box>
            
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                textAlign: 'center',
                borderStyle: 'dashed',
                borderColor: '#dee2e6',
                backgroundColor: '#f8f9fa',
                cursor: 'pointer',
                '&:hover': { borderColor: '#667eea', backgroundColor: '#f0f2ff' }
              }}
              onClick={() => document.getElementById('csv-upload').click()}
            >
              <CloudUpload sx={{ fontSize: 48, color: '#adb5bd', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Click to upload CSV file
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or drag and drop your file here
              </Typography>
              <input
                id="csv-upload"
                type="file"
                hidden
                accept=".csv"
                onChange={handleImportFile}
              />
            </Paper>
            
            <Grid container spacing={2} sx={{ mt: 3 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Add to Group</InputLabel>
                  <Select
                    value={importSettings.groupId}
                    onChange={(e) => setImportSettings(prev => ({ ...prev, groupId: e.target.value }))}
                    label="Add to Group"
                  >
                    <MenuItem value="">No group</MenuItem>
                    {groups.map(group => (
                      <MenuItem key={group._id} value={group._id}>
                        {group.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={importSettings.updateExisting}
                      onChange={(e) => setImportSettings(prev => ({ ...prev, updateExisting: e.target.checked }))}
                    />
                  }
                  label="Update existing contacts"
                />
              </Grid>
            </Grid>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Maximum file size: 10MB. CSV format required.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setImportDialog(false)}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={() => document.getElementById('csv-upload').click()}
            disabled={loading.importing}
          >
            {loading.importing ? <CircularProgress size={24} /> : 'Select File'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upgrade Plan Dialog */}
      <Dialog 
        open={upgradeDialog} 
        onClose={() => setUpgradeDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          pb: 2 
        }}>
          <Upgrade color="primary" />
          <Typography variant="h6">Upgrade Your Plan</Typography>
        </DialogTitle>
        <DialogContent dividers>
          {planInfo && (
            <Box sx={{ py: 2 }}>
              <Typography variant="body1" gutterBottom>
                Current Plan: <strong>{planInfo.current_plan_details?.name || 'Free'}</strong>
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {Object.entries(planInfo.available_upgrades || {}).map(([planKey, planDetails]) => (
                  <Grid item xs={12} md={6} key={planKey}>
                    <Card sx={{ 
                      p: 3,
                      height: '100%',
                      border: '2px solid #667eea',
                      backgroundColor: '#f0f2ff',
                      '&:hover': { 
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)'
                      }
                    }}>
                      <Typography variant="h5" fontWeight="700" color="#667eea" gutterBottom>
                        {planDetails.name}
                      </Typography>
                      <Typography variant="h4" fontWeight="700" gutterBottom>
                        {planDetails.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        per {planDetails.billing_cycle}
                      </Typography>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <List dense>
                        {planDetails.features?.map((feature, index) => (
                          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                            <Check color="success" sx={{ mr: 1, fontSize: 16 }} />
                            <ListItemText 
                              primary={feature}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                      
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{ 
                          mt: 3,
                          background: '#2563eb',
                          py: 1.5
                        }}
                        onClick={() => {
                          // Redirect to upgrade page
                          window.open(`/billing/upgrade?plan=${planKey}`, '_blank');
                          setUpgradeDialog(false);
                        }}
                      >
                        Upgrade to {planDetails.name}
                      </Button>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                Need a custom plan? <a href="/contact" style={{ color: '#667eea' }}>Contact our sales team</a>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setUpgradeDialog(false)}>Maybe Later</Button>
          <Button 
            variant="outlined"
            href="/billing"
          >
            View All Plans
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog 
        open={previewDialog} 
        onClose={() => setPreviewDialog(false)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          pb: 2 
        }}>
          <Visibility color="primary" />
          <Typography variant="h6">Preview</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box 
            sx={{ 
              p: 3,
              backgroundColor: '#f8f9fa',
              borderRadius: 2,
              minHeight: 400,
              border: '1px solid #e9ecef'
            }}
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="error" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BrandAutomation;