// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Container,
//   Paper,
//   Typography,
//   Box,
//   Tabs,
//   Tab,
//   TextField,
//   Button,
//   Grid,
//   Chip,
//   IconButton,
//   CircularProgress,
//   Alert,
//   Snackbar,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   Checkbox,
//   ListItemText,
//   FormControlLabel,
//   Switch,
//   Card,
//   CardContent,
//   CardActions,
//   Avatar,
//   Divider,
//   Stepper,
//   Step,
//   StepLabel,
//   StepContent,
//   Badge,
//   Tooltip,
//   LinearProgress,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemSecondaryAction,
//   ListItemText as MuiListItemText,
//   Collapse,
// } from '@mui/material';
// import {
//   Send as SendIcon,
//   Email as EmailIcon,
//   Schedule as ScheduleIcon,
//   Template as TemplateIcon,
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   Edit as EditIcon,
//   Refresh as RefreshIcon,
//   CloudUpload as CloudUploadIcon,
//   Visibility as VisibilityIcon,
//   GetApp as GetAppIcon,
//   CheckCircle as CheckCircleIcon,
//   Error as ErrorIcon,
//   Warning as WarningIcon,
//   Info as InfoIcon,
//   ExpandMore as ExpandMoreIcon,
//   ExpandLess as ExpandLessIcon,
//   People as PeopleIcon,
//   BarChart as BarChartIcon,
//   History as HistoryIcon,
//   Settings as SettingsIcon,
//   Mail as MailIcon,
//   AttachFile as AttachFileIcon,
//   CalendarToday as CalendarTodayIcon,
//   Check as CheckIcon,
//   Close as CloseIcon,
// } from '@mui/icons-material';
// import { DatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { DataGrid } from '@mui/x-data-grid';
// import Papa from 'papaparse';
// import { format } from 'date-fns';
// import { styled } from '@mui/material/styles';
// import axios from 'axios';

// // API Configuration
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
// const BULK_EMAIL_API = `${API_BASE_URL}/bulk-email`;

// // Styled Components
// const StyledPaper = styled(Paper)(({ theme }) => ({
//   padding: theme.spacing(3),
//   marginBottom: theme.spacing(3),
// }));

// const UploadBox = styled(Box)(({ theme }) => ({
//   border: `2px dashed ${theme.palette.divider}`,
//   borderRadius: theme.shape.borderRadius,
//   padding: theme.spacing(4),
//   textAlign: 'center',
//   cursor: 'pointer',
//   transition: 'border-color 0.3s',
//   '&:hover': {
//     borderColor: theme.palette.primary.main,
//   },
// }));

// const StatusChip = styled(Chip)(({ theme, status }) => ({
//   backgroundColor: {
//     sent: theme.palette.success.light,
//     pending: theme.palette.warning.light,
//     sending: theme.palette.info.light,
//     failed: theme.palette.error.light,
//     scheduled: theme.palette.secondary.light,
//     bounced: theme.palette.error.dark,
//     opened: theme.palette.success.main,
//     clicked: theme.palette.info.main,
//     cancelled: theme.palette.grey[400],
//   }[status] || theme.palette.grey[300],
//   color: 'white',
//   fontWeight: 'bold',
// }));

// const BulkMessage = () => {
//   // State Management
//   const [activeTab, setActiveTab] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [smtpConnected, setSmtpConnected] = useState(false);
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
//   // Single Email State
//   const [singleEmail, setSingleEmail] = useState({
//     to: { email: '', name: '' },
//     subject: '',
//     body: '',
//     htmlBody: '',
//     templateId: '',
//     priority: 'normal',
//     attachments: [],
//   });
  
//   // Bulk Email State
//   const [bulkEmail, setBulkEmail] = useState({
//     recipients: [],
//     subject: '',
//     body: '',
//     htmlBody: '',
//     templateId: '',
//     batchSize: 50,
//     priority: 'normal',
//     attachments: [],
//   });
  
//   // Schedule Email State
//   const [scheduleEmail, setScheduleEmail] = useState({
//     to: { email: '', name: '' },
//     recipients: [],
//     isBulk: false,
//     subject: '',
//     body: '',
//     htmlBody: '',
//     templateId: '',
//     scheduleTime: null,
//     timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//     priority: 'normal',
//     attachments: [],
//   });
  
//   // Templates State
//   const [templates, setTemplates] = useState([]);
//   const [selectedTemplate, setSelectedTemplate] = useState(null);
//   const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
//   const [newTemplate, setNewTemplate] = useState({
//     name: '',
//     subject: '',
//     htmlContent: '',
//     textContent: '',
//     category: 'general',
//     variables: [],
//     isActive: true,
//   });
  
//   // Recipients Management
//   const [recipientInput, setRecipientInput] = useState('');
//   const [uploadedFile, setUploadedFile] = useState(null);
//   const [recipientsPreview, setRecipientsPreview] = useState([]);
  
//   // Email History & Analytics
//   const [emailHistory, setEmailHistory] = useState([]);
//   const [scheduledEmails, setScheduledEmails] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [selectedEmail, setSelectedEmail] = useState(null);
//   const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  
//   // File Attachments
//   const [fileInputKey, setFileInputKey] = useState(Date.now());
  
//   // Steps for bulk sending
//   const [bulkSteps, setBulkSteps] = useState(0);
  
//   // Authentication token (get from your auth system)
//   const token = localStorage.getItem('token');

//   // API Headers
//   const headers = {
//     'Authorization': `Bearer ${token}`,
//     'Content-Type': 'application/json',
//   };

//   // Initialize component
//   useEffect(() => {
//     checkSmtpConnection();
//     loadTemplates();
//     loadEmailHistory();
//     loadScheduledEmails();
//     loadStats();
//   }, []);

//   // API Functions
//   const checkSmtpConnection = async () => {
//     try {
//       const response = await axios.get(`${BULK_EMAIL_API}/test-connection`, { headers });
//       setSmtpConnected(response.data.success);
//     } catch (error) {
//       showSnackbar('SMTP connection failed', 'error');
//     }
//   };

//   const loadTemplates = async () => {
//     try {
//       const response = await axios.get(`${BULK_EMAIL_API}/templates`, { headers });
//       setTemplates(response.data.templates);
//     } catch (error) {
//       console.error('Failed to load templates:', error);
//     }
//   };

//   const loadEmailHistory = async (params = {}) => {
//     try {
//       const response = await axios.get(`${BULK_EMAIL_API}/history`, {
//         headers,
//         params,
//       });
//       setEmailHistory(response.data.emails);
//     } catch (error) {
//       console.error('Failed to load email history:', error);
//     }
//   };

//   const loadScheduledEmails = async () => {
//     try {
//       const response = await axios.get(`${BULK_EMAIL_API}/scheduled`, { headers });
//       setScheduledEmails(response.data.scheduled_emails);
//     } catch (error) {
//       console.error('Failed to load scheduled emails:', error);
//     }
//   };

//   const loadStats = async () => {
//     try {
//       const response = await axios.get(`${BULK_EMAIL_API}/stats`, { headers });
//       setStats(response.data.statistics);
//     } catch (error) {
//       console.error('Failed to load stats:', error);
//     }
//   };

//   // Send Single Email
//   const handleSendSingleEmail = async () => {
//     if (!validateEmail(singleEmail.to.email)) {
//       showSnackbar('Please enter a valid email address', 'error');
//       return;
//     }

//     if (!singleEmail.subject.trim()) {
//       showSnackbar('Subject is required', 'error');
//       return;
//     }

//     if (!singleEmail.body.trim() && !singleEmail.htmlBody.trim() && !singleEmail.templateId) {
//       showSnackbar('Email content or template is required', 'error');
//       return;
//     }

//     setLoading(true);
//     try {
//       const payload = {
//         to: singleEmail.to,
//         subject: singleEmail.subject,
//         body: singleEmail.body,
//         html_body: singleEmail.htmlBody,
//         template_id: singleEmail.templateId || null,
//         priority: singleEmail.priority,
//         send_immediately: true,
//         attachments: singleEmail.attachments,
//       };

//       const response = await axios.post(`${BULK_EMAIL_API}/send-single`, payload, { headers });
      
//       showSnackbar(response.data.message, 'success');
      
//       // Reset form
//       setSingleEmail({
//         to: { email: '', name: '' },
//         subject: '',
//         body: '',
//         htmlBody: '',
//         templateId: '',
//         priority: 'normal',
//         attachments: [],
//       });
      
//       // Reload history
//       loadEmailHistory();
//       loadStats();
//     } catch (error) {
//       console.error('Failed to send email:', error);
//       showSnackbar(error.response?.data?.detail || 'Failed to send email', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Send Bulk Email
//   const handleSendBulkEmail = async () => {
//     if (bulkEmail.recipients.length === 0) {
//       showSnackbar('Please add recipients', 'error');
//       return;
//     }

//     if (!bulkEmail.subject.trim()) {
//       showSnackbar('Subject is required', 'error');
//       return;
//     }

//     if (!bulkEmail.body.trim() && !bulkEmail.htmlBody.trim() && !bulkEmail.templateId) {
//       showSnackbar('Email content or template is required', 'error');
//       return;
//     }

//     setLoading(true);
//     try {
//       const payload = {
//         recipients: bulkEmail.recipients,
//         subject: bulkEmail.subject,
//         body: bulkEmail.body,
//         html_body: bulkEmail.htmlBody,
//         template_id: bulkEmail.templateId || null,
//         batch_size: bulkEmail.batchSize,
//         priority: bulkEmail.priority,
//         send_immediately: true,
//         attachments: bulkEmail.attachments,
//       };

//       const response = await axios.post(`${BULK_EMAIL_API}/send-bulk`, payload, { headers });
      
//       showSnackbar(response.data.message, 'success');
//       setBulkSteps(0);
      
//       // Reset form
//       setBulkEmail({
//         recipients: [],
//         subject: '',
//         body: '',
//         htmlBody: '',
//         templateId: '',
//         batchSize: 50,
//         priority: 'normal',
//         attachments: [],
//       });
//       setRecipientsPreview([]);
      
//       // Reload history and stats
//       loadEmailHistory();
//       loadStats();
//     } catch (error) {
//       console.error('Failed to send bulk email:', error);
//       showSnackbar(error.response?.data?.detail || 'Failed to send bulk emails', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Schedule Email
//   const handleScheduleEmail = async () => {
//     if (!scheduleEmail.scheduleTime) {
//       showSnackbar('Please select a schedule time', 'error');
//       return;
//     }

//     if (scheduleEmail.isBulk && scheduleEmail.recipients.length === 0) {
//       showSnackbar('Please add recipients for bulk scheduling', 'error');
//       return;
//     }

//     if (!scheduleEmail.isBulk && !validateEmail(scheduleEmail.to.email)) {
//       showSnackbar('Please enter a valid email address', 'error');
//       return;
//     }

//     if (!scheduleEmail.subject.trim()) {
//       showSnackbar('Subject is required', 'error');
//       return;
//     }

//     setLoading(true);
//     try {
//       const payload = {
//         to: scheduleEmail.isBulk ? scheduleEmail.recipients : scheduleEmail.to,
//         subject: scheduleEmail.subject,
//         body: scheduleEmail.body,
//         html_body: scheduleEmail.htmlBody,
//         template_id: scheduleEmail.templateId || null,
//         schedule_time: scheduleEmail.scheduleTime.toISOString(),
//         timezone: scheduleEmail.timezone,
//         priority: scheduleEmail.priority,
//         attachments: scheduleEmail.attachments,
//       };

//       const response = await axios.post(`${BULK_EMAIL_API}/schedule`, payload, { headers });
      
//       showSnackbar(response.data.message, 'success');
      
//       // Reset form
//       setScheduleEmail({
//         to: { email: '', name: '' },
//         recipients: [],
//         isBulk: false,
//         subject: '',
//         body: '',
//         htmlBody: '',
//         templateId: '',
//         scheduleTime: null,
//         timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//         priority: 'normal',
//         attachments: [],
//       });
      
//       // Reload scheduled emails
//       loadScheduledEmails();
//     } catch (error) {
//       console.error('Failed to schedule email:', error);
//       showSnackbar(error.response?.data?.detail || 'Failed to schedule email', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle CSV Upload
//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     setUploadedFile(file);

//     Papa.parse(file, {
//       header: true,
//       skipEmptyLines: true,
//       complete: (results) => {
//         const parsedRecipients = results.data
//           .filter(row => row.email && validateEmail(row.email))
//           .map(row => ({
//             email: row.email.trim(),
//             name: row.name?.trim() || '',
//             variables: {
//               ...row,
//               email: undefined,
//               name: undefined,
//             },
//           }));

//         setRecipientsPreview(parsedRecipients);
//         setBulkEmail(prev => ({
//           ...prev,
//           recipients: parsedRecipients,
//         }));
        
//         showSnackbar(`Successfully loaded ${parsedRecipients.length} recipients`, 'success');
//       },
//       error: (error) => {
//         console.error('CSV parsing error:', error);
//         showSnackbar('Failed to parse CSV file', 'error');
//       },
//     });
//   };

//   // Add single recipient
//   const handleAddRecipient = () => {
//     if (!validateEmail(recipientInput.trim())) {
//       showSnackbar('Please enter a valid email address', 'error');
//       return;
//     }

//     const newRecipient = {
//       email: recipientInput.trim(),
//       name: '',
//       variables: {},
//     };

//     setBulkEmail(prev => ({
//       ...prev,
//       recipients: [...prev.recipients, newRecipient],
//     }));

//     setRecipientInput('');
//     showSnackbar('Recipient added', 'success');
//   };

//   // Remove recipient
//   const handleRemoveRecipient = (index) => {
//     const newRecipients = [...bulkEmail.recipients];
//     newRecipients.splice(index, 1);
//     setBulkEmail(prev => ({ ...prev, recipients: newRecipients }));
//   };

//   // Add attachment
//   const handleAddAttachment = async (event, emailType = 'single') => {
//     const files = event.target.files;
//     if (!files || files.length === 0) return;

//     const newAttachments = [];
//     for (let i = 0; i < files.length; i++) {
//       const file = files[i];
      
//       // Convert file to base64
//       const base64 = await convertFileToBase64(file);
      
//       newAttachments.push({
//         filename: file.name,
//         content_type: file.type,
//         content_base64: base64.split(',')[1], // Remove data URL prefix
//       });
//     }

//     switch (emailType) {
//       case 'single':
//         setSingleEmail(prev => ({
//           ...prev,
//           attachments: [...prev.attachments, ...newAttachments],
//         }));
//         break;
//       case 'bulk':
//         setBulkEmail(prev => ({
//           ...prev,
//           attachments: [...prev.attachments, ...newAttachments],
//         }));
//         break;
//       case 'schedule':
//         setScheduleEmail(prev => ({
//           ...prev,
//           attachments: [...prev.attachments, ...newAttachments],
//         }));
//         break;
//     }

//     setFileInputKey(Date.now());
//     showSnackbar(`${newAttachments.length} file(s) added`, 'success');
//   };

//   // Remove attachment
//   const handleRemoveAttachment = (index, emailType = 'single') => {
//     switch (emailType) {
//       case 'single':
//         setSingleEmail(prev => ({
//           ...prev,
//           attachments: prev.attachments.filter((_, i) => i !== index),
//         }));
//         break;
//       case 'bulk':
//         setBulkEmail(prev => ({
//           ...prev,
//           attachments: prev.attachments.filter((_, i) => i !== index),
//         }));
//         break;
//       case 'schedule':
//         setScheduleEmail(prev => ({
//           ...prev,
//           attachments: prev.attachments.filter((_, i) => i !== index),
//         }));
//         break;
//     }
//   };

//   // Template Management
//   const handleCreateTemplate = async () => {
//     if (!newTemplate.name.trim() || !newTemplate.subject.trim() || !newTemplate.htmlContent.trim()) {
//       showSnackbar('Name, subject, and HTML content are required', 'error');
//       return;
//     }

//     setLoading(true);
//     try {
//       await axios.post(`${BULK_EMAIL_API}/templates`, newTemplate, { headers });
      
//       showSnackbar('Template created successfully', 'success');
//       setTemplateDialogOpen(false);
//       setNewTemplate({
//         name: '',
//         subject: '',
//         htmlContent: '',
//         textContent: '',
//         category: 'general',
//         variables: [],
//         isActive: true,
//       });
      
//       loadTemplates();
//     } catch (error) {
//       console.error('Failed to create template:', error);
//       showSnackbar(error.response?.data?.detail || 'Failed to create template', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleTemplateSelect = (templateId) => {
//     const template = templates.find(t => t.id === templateId);
//     if (!template) return;

//     setSelectedTemplate(template);
    
//     // Apply template to active tab
//     const templateContent = {
//       subject: template.subject,
//       htmlBody: template.html_content,
//       body: template.text_content || '',
//       templateId: template.id,
//     };

//     switch (activeTab) {
//       case 0: // Single
//         setSingleEmail(prev => ({ ...prev, ...templateContent }));
//         break;
//       case 1: // Bulk
//         setBulkEmail(prev => ({ ...prev, ...templateContent }));
//         break;
//       case 2: // Schedule
//         setScheduleEmail(prev => ({ ...prev, ...templateContent }));
//         break;
//     }

//     showSnackbar(`Template "${template.name}" applied`, 'success');
//   };

//   // Cancel scheduled email
//   const handleCancelScheduledEmail = async (scheduledId) => {
//     if (!window.confirm('Are you sure you want to cancel this scheduled email?')) return;

//     try {
//       await axios.delete(`${BULK_EMAIL_API}/scheduled/${scheduledId}`, { headers });
//       showSnackbar('Scheduled email cancelled', 'success');
//       loadScheduledEmails();
//     } catch (error) {
//       console.error('Failed to cancel scheduled email:', error);
//       showSnackbar(error.response?.data?.detail || 'Failed to cancel email', 'error');
//     }
//   };

//   // View email details
//   const handleViewEmail = async (emailId) => {
//     try {
//       const response = await axios.get(`${BULK_EMAIL_API}/analytics/${emailId}`, { headers });
//       setSelectedEmail(response.data);
//       setEmailDialogOpen(true);
//     } catch (error) {
//       console.error('Failed to load email details:', error);
//       showSnackbar('Failed to load email details', 'error');
//     }
//   };

//   // Utility functions
//   const validateEmail = (email) => {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return re.test(email);
//   };

//   const convertFileToBase64 = (file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result);
//       reader.onerror = (error) => reject(error);
//     });
//   };

//   const showSnackbar = (message, severity = 'info') => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbar({ ...snackbar, open: false });
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return format(new Date(dateString), 'PPpp');
//   };

//   const getStatusIcon = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'sent':
//       case 'delivered':
//       case 'opened':
//       case 'clicked':
//         return <CheckCircleIcon color="success" />;
//       case 'pending':
//       case 'scheduled':
//       case 'sending':
//         return <InfoIcon color="info" />;
//       case 'failed':
//       case 'bounced':
//         return <ErrorIcon color="error" />;
//       default:
//         return <WarningIcon color="warning" />;
//     }
//   };

//   // Tab panels
//   const TabPanel = ({ children, value, index }) => {
//     return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
//   };

//   // Render functions for each tab
//   const renderSingleEmailTab = () => (
//     <StyledPaper>
//       <Typography variant="h6" gutterBottom>
//         <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
//         Send Single Email
//       </Typography>
      
//       <Grid container spacing={3}>
//         <Grid item xs={12} md={6}>
//           <TextField
//             fullWidth
//             label="Recipient Email"
//             type="email"
//             value={singleEmail.to.email}
//             onChange={(e) => setSingleEmail(prev => ({
//               ...prev,
//               to: { ...prev.to, email: e.target.value }
//             }))}
//             required
//             margin="normal"
//           />
//         </Grid>
//         <Grid item xs={12} md={6}>
//           <TextField
//             fullWidth
//             label="Recipient Name (Optional)"
//             value={singleEmail.to.name}
//             onChange={(e) => setSingleEmail(prev => ({
//               ...prev,
//               to: { ...prev.to, name: e.target.value }
//             }))}
//             margin="normal"
//           />
//         </Grid>
        
//         <Grid item xs={12}>
//           <TextField
//             fullWidth
//             label="Subject"
//             value={singleEmail.subject}
//             onChange={(e) => setSingleEmail(prev => ({ ...prev, subject: e.target.value }))}
//             required
//             margin="normal"
//           />
//         </Grid>
        
//         <Grid item xs={12}>
//           <FormControl fullWidth margin="normal">
//             <InputLabel>Template (Optional)</InputLabel>
//             <Select
//               value={singleEmail.templateId}
//               onChange={(e) => setSingleEmail(prev => ({ ...prev, templateId: e.target.value }))}
//               label="Template"
//             >
//               <MenuItem value="">None</MenuItem>
//               {templates.map(template => (
//                 <MenuItem key={template.id} value={template.id}>
//                   {template.name} ({template.category})
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </Grid>
        
//         <Grid item xs={12}>
//           <TextField
//             fullWidth
//             label="HTML Content"
//             value={singleEmail.htmlBody}
//             onChange={(e) => setSingleEmail(prev => ({ ...prev, htmlBody: e.target.value }))}
//             multiline
//             rows={6}
//             margin="normal"
//             placeholder="<p>Your HTML content here...</p>"
//             helperText="Leave empty if using template or plain text"
//           />
//         </Grid>
        
//         <Grid item xs={12}>
//           <TextField
//             fullWidth
//             label="Plain Text Content"
//             value={singleEmail.body}
//             onChange={(e) => setSingleEmail(prev => ({ ...prev, body: e.target.value }))}
//             multiline
//             rows={3}
//             margin="normal"
//             placeholder="Your plain text content here..."
//             helperText="Fallback for email clients that don't support HTML"
//           />
//         </Grid>
        
//         <Grid item xs={12}>
//           <Box sx={{ mb: 2 }}>
//             <Typography variant="subtitle2" gutterBottom>
//               Attachments
//             </Typography>
//             <input
//               key={fileInputKey}
//               type="file"
//               accept="*/*"
//               multiple
//               onChange={(e) => handleAddAttachment(e, 'single')}
//               style={{ display: 'none' }}
//               id="single-attachment-upload"
//             />
//             <label htmlFor="single-attachment-upload">
//               <Button
//                 component="span"
//                 variant="outlined"
//                 startIcon={<AttachFileIcon />}
//                 sx={{ mr: 2 }}
//               >
//                 Add Attachments
//               </Button>
//             </label>
            
//             {singleEmail.attachments.length > 0 && (
//               <List dense>
//                 {singleEmail.attachments.map((attachment, index) => (
//                   <ListItem key={index}>
//                     <ListItemIcon>
//                       <AttachFileIcon />
//                     </ListItemIcon>
//                     <MuiListItemText
//                       primary={attachment.filename}
//                       secondary={`${attachment.content_type}`}
//                     />
//                     <ListItemSecondaryAction>
//                       <IconButton edge="end" onClick={() => handleRemoveAttachment(index, 'single')}>
//                         <DeleteIcon />
//                       </IconButton>
//                     </ListItemSecondaryAction>
//                   </ListItem>
//                 ))}
//               </List>
//             )}
//           </Box>
//         </Grid>
        
//         <Grid item xs={12}>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <FormControl sx={{ minWidth: 150 }}>
//               <InputLabel>Priority</InputLabel>
//               <Select
//                 value={singleEmail.priority}
//                 onChange={(e) => setSingleEmail(prev => ({ ...prev, priority: e.target.value }))}
//                 label="Priority"
//               >
//                 <MenuItem value="high">High</MenuItem>
//                 <MenuItem value="normal">Normal</MenuItem>
//                 <MenuItem value="low">Low</MenuItem>
//               </Select>
//             </FormControl>
            
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={handleSendSingleEmail}
//               disabled={loading || !smtpConnected}
//               startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
//               size="large"
//             >
//               {loading ? 'Sending...' : 'Send Email'}
//             </Button>
//           </Box>
//         </Grid>
//       </Grid>
//     </StyledPaper>
//   );

//   const renderBulkEmailTab = () => (
//     <StyledPaper>
//       <Typography variant="h6" gutterBottom>
//         <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
//         Send Bulk Emails
//       </Typography>
      
//       <Stepper activeStep={bulkSteps} orientation="vertical">
//         <Step>
//           <StepLabel>Add Recipients</StepLabel>
//           <StepContent>
//             <Grid container spacing={2}>
//               <Grid item xs={12}>
//                 <Box sx={{ mb: 3 }}>
//                   <Typography variant="subtitle2" gutterBottom>
//                     Add Recipients Manually
//                   </Typography>
//                   <Box sx={{ display: 'flex', gap: 2 }}>
//                     <TextField
//                       fullWidth
//                       label="Email Address"
//                       value={recipientInput}
//                       onChange={(e) => setRecipientInput(e.target.value)}
//                       onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
//                       placeholder="Enter email address"
//                     />
//                     <Button
//                       variant="outlined"
//                       onClick={handleAddRecipient}
//                       startIcon={<AddIcon />}
//                     >
//                       Add
//                     </Button>
//                   </Box>
//                 </Box>
                
//                 <Box sx={{ mb: 3 }}>
//                   <Typography variant="subtitle2" gutterBottom>
//                     Or Upload CSV File
//                   </Typography>
//                   <input
//                     accept=".csv"
//                     style={{ display: 'none' }}
//                     id="csv-upload"
//                     type="file"
//                     onChange={handleFileUpload}
//                   />
//                   <label htmlFor="csv-upload">
//                     <UploadBox>
//                       <CloudUploadIcon sx={{ fontSize: 48, mb: 2, color: 'text.secondary' }} />
//                       <Typography variant="body1" gutterBottom>
//                         {uploadedFile ? uploadedFile.name : 'Drag & drop CSV file or click to browse'}
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         CSV should have columns: email, name (optional), and any template variables
//                       </Typography>
//                     </UploadBox>
//                   </label>
//                 </Box>
                
//                 {bulkEmail.recipients.length > 0 && (
//                   <Box>
//                     <Typography variant="subtitle2" gutterBottom>
//                       Recipients ({bulkEmail.recipients.length})
//                     </Typography>
//                     <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
//                       <List dense>
//                         {bulkEmail.recipients.map((recipient, index) => (
//                           <ListItem
//                             key={index}
//                             secondaryAction={
//                               <IconButton edge="end" onClick={() => handleRemoveRecipient(index)}>
//                                 <DeleteIcon />
//                               </IconButton>
//                             }
//                           >
//                             <ListItemIcon>
//                               <EmailIcon />
//                             </ListItemIcon>
//                             <MuiListItemText
//                               primary={recipient.email}
//                               secondary={recipient.name || 'No name provided'}
//                             />
//                           </ListItem>
//                         ))}
//                       </List>
//                     </Paper>
//                   </Box>
//                 )}
//               </Grid>
              
//               <Grid item xs={12}>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                   <Button disabled>Back</Button>
//                   <Button
//                     variant="contained"
//                     onClick={() => setBulkSteps(1)}
//                     disabled={bulkEmail.recipients.length === 0}
//                   >
//                     Next: Compose Email
//                   </Button>
//                 </Box>
//               </Grid>
//             </Grid>
//           </StepContent>
//         </Step>
        
//         <Step>
//           <StepLabel>Compose Email</StepLabel>
//           <StepContent>
//             <Grid container spacing={3}>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Subject"
//                   value={bulkEmail.subject}
//                   onChange={(e) => setBulkEmail(prev => ({ ...prev, subject: e.target.value }))}
//                   required
//                   margin="normal"
//                 />
//               </Grid>
              
//               <Grid item xs={12}>
//                 <FormControl fullWidth margin="normal">
//                   <InputLabel>Template (Optional)</InputLabel>
//                   <Select
//                     value={bulkEmail.templateId}
//                     onChange={(e) => setBulkEmail(prev => ({ ...prev, templateId: e.target.value }))}
//                     label="Template"
//                   >
//                     <MenuItem value="">None</MenuItem>
//                     {templates.map(template => (
//                       <MenuItem key={template.id} value={template.id}>
//                         {template.name} ({template.category})
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Grid>
              
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="HTML Content"
//                   value={bulkEmail.htmlBody}
//                   onChange={(e) => setBulkEmail(prev => ({ ...prev, htmlBody: e.target.value }))}
//                   multiline
//                   rows={6}
//                   margin="normal"
//                   placeholder="<p>Your HTML content here...</p>"
//                   helperText="Leave empty if using template"
//                 />
//               </Grid>
              
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Plain Text Content"
//                   value={bulkEmail.body}
//                   onChange={(e) => setBulkEmail(prev => ({ ...prev, body: e.target.value }))}
//                   multiline
//                   rows={3}
//                   margin="normal"
//                   placeholder="Your plain text content here..."
//                   helperText="Fallback for email clients that don't support HTML"
//                 />
//               </Grid>
              
//               <Grid item xs={12}>
//                 <Box sx={{ mb: 2 }}>
//                   <Typography variant="subtitle2" gutterBottom>
//                     Attachments (Optional)
//                   </Typography>
//                   <input
//                     key={fileInputKey}
//                     type="file"
//                     accept="*/*"
//                     multiple
//                     onChange={(e) => handleAddAttachment(e, 'bulk')}
//                     style={{ display: 'none' }}
//                     id="bulk-attachment-upload"
//                   />
//                   <label htmlFor="bulk-attachment-upload">
//                     <Button
//                       component="span"
//                       variant="outlined"
//                       startIcon={<AttachFileIcon />}
//                       sx={{ mr: 2 }}
//                     >
//                       Add Attachments
//                     </Button>
//                   </label>
                  
//                   {bulkEmail.attachments.length > 0 && (
//                     <List dense>
//                       {bulkEmail.attachments.map((attachment, index) => (
//                         <ListItem key={index}>
//                           <ListItemIcon>
//                             <AttachFileIcon />
//                           </ListItemIcon>
//                           <MuiListItemText
//                             primary={attachment.filename}
//                             secondary={`${attachment.content_type}`}
//                           />
//                           <ListItemSecondaryAction>
//                             <IconButton edge="end" onClick={() => handleRemoveAttachment(index, 'bulk')}>
//                               <DeleteIcon />
//                             </IconButton>
//                           </ListItemSecondaryAction>
//                         </ListItem>
//                       ))}
//                     </List>
//                   )}
//                 </Box>
//               </Grid>
              
//               <Grid item xs={12}>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                   <Button onClick={() => setBulkSteps(0)}>Back</Button>
//                   <Button
//                     variant="contained"
//                     onClick={() => setBulkSteps(2)}
//                     disabled={!bulkEmail.subject.trim()}
//                   >
//                     Next: Settings
//                   </Button>
//                 </Box>
//               </Grid>
//             </Grid>
//           </StepContent>
//         </Step>
        
//         <Step>
//           <StepLabel>Settings & Send</StepLabel>
//           <StepContent>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   label="Batch Size"
//                   type="number"
//                   value={bulkEmail.batchSize}
//                   onChange={(e) => setBulkEmail(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 50 }))}
//                   margin="normal"
//                   helperText="Number of emails to send per batch (1-100)"
//                   inputProps={{ min: 1, max: 100 }}
//                 />
//               </Grid>
              
//               <Grid item xs={12} md={6}>
//                 <FormControl fullWidth margin="normal">
//                   <InputLabel>Priority</InputLabel>
//                   <Select
//                     value={bulkEmail.priority}
//                     onChange={(e) => setBulkEmail(prev => ({ ...prev, priority: e.target.value }))}
//                     label="Priority"
//                   >
//                     <MenuItem value="high">High</MenuItem>
//                     <MenuItem value="normal">Normal</MenuItem>
//                     <MenuItem value="low">Low</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
              
//               <Grid item xs={12}>
//                 <Alert severity="info" sx={{ mb: 2 }}>
//                   <Typography variant="body2">
//                     Ready to send to {bulkEmail.recipients.length} recipients.
//                     {bulkEmail.attachments.length > 0 && ` Includes ${bulkEmail.attachments.length} attachment(s).`}
//                   </Typography>
//                 </Alert>
//               </Grid>
              
//               <Grid item xs={12}>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                   <Button onClick={() => setBulkSteps(1)}>Back</Button>
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     onClick={handleSendBulkEmail}
//                     disabled={loading || !smtpConnected}
//                     startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
//                     size="large"
//                   >
//                     {loading ? 'Sending...' : 'Send Bulk Emails'}
//                   </Button>
//                 </Box>
//               </Grid>
//             </Grid>
//           </StepContent>
//         </Step>
//       </Stepper>
      
//       {bulkSteps === 0 && bulkEmail.recipients.length > 0 && (
//         <Button onClick={() => setBulkSteps(1)} sx={{ mt: 2 }}>
//           Skip to Compose Email
//         </Button>
//       )}
//     </StyledPaper>
//   );

//   const renderScheduleEmailTab = () => (
//     <StyledPaper>
//       <Typography variant="h6" gutterBottom>
//         <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
//         Schedule Email
//       </Typography>
      
//       <Grid container spacing={3}>
//         <Grid item xs={12}>
//           <FormControlLabel
//             control={
//               <Switch
//                 checked={scheduleEmail.isBulk}
//                 onChange={(e) => setScheduleEmail(prev => ({
//                   ...prev,
//                   isBulk: e.target.checked
//                 }))}
//               />
//             }
//             label="Schedule Bulk Email"
//           />
//         </Grid>
        
//         {!scheduleEmail.isBulk ? (
//           <>
//             <Grid item xs={12} md={6}>
//               <TextField
//                 fullWidth
//                 label="Recipient Email"
//                 type="email"
//                 value={scheduleEmail.to.email}
//                 onChange={(e) => setScheduleEmail(prev => ({
//                   ...prev,
//                   to: { ...prev.to, email: e.target.value }
//                 }))}
//                 required
//                 margin="normal"
//               />
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <TextField
//                 fullWidth
//                 label="Recipient Name (Optional)"
//                 value={scheduleEmail.to.name}
//                 onChange={(e) => setScheduleEmail(prev => ({
//                   ...prev,
//                   to: { ...prev.to, name: e.target.value }
//                 }))}
//                 margin="normal"
//               />
//             </Grid>
//           </>
//         ) : (
//           <Grid item xs={12}>
//             <Box sx={{ mb: 3 }}>
//               <Typography variant="subtitle2" gutterBottom>
//                 Add Bulk Recipients
//               </Typography>
//               <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
//                 <TextField
//                   fullWidth
//                   label="Email Address"
//                   placeholder="Enter email address"
//                   onKeyPress={(e) => {
//                     if (e.key === 'Enter' && validateEmail(e.target.value)) {
//                       const newRecipient = {
//                         email: e.target.value.trim(),
//                         name: '',
//                         variables: {},
//                       };
//                       setScheduleEmail(prev => ({
//                         ...prev,
//                         recipients: [...prev.recipients, newRecipient]
//                       }));
//                       e.target.value = '';
//                     }
//                   }}
//                 />
//                 <Button
//                   variant="outlined"
//                   onClick={() => {
//                     const input = document.querySelector('input[placeholder="Enter email address"]');
//                     if (input && validateEmail(input.value)) {
//                       const newRecipient = {
//                         email: input.value.trim(),
//                         name: '',
//                         variables: {},
//                       };
//                       setScheduleEmail(prev => ({
//                         ...prev,
//                         recipients: [...prev.recipients, newRecipient]
//                       }));
//                       input.value = '';
//                     }
//                   }}
//                   startIcon={<AddIcon />}
//                 >
//                   Add
//                 </Button>
//               </Box>
              
//               {scheduleEmail.recipients.length > 0 && (
//                 <Paper variant="outlined" sx={{ maxHeight: 150, overflow: 'auto' }}>
//                   <List dense>
//                     {scheduleEmail.recipients.map((recipient, index) => (
//                       <ListItem
//                         key={index}
//                         secondaryAction={
//                           <IconButton edge="end" onClick={() => {
//                             const newRecipients = [...scheduleEmail.recipients];
//                             newRecipients.splice(index, 1);
//                             setScheduleEmail(prev => ({ ...prev, recipients: newRecipients }));
//                           }}>
//                             <DeleteIcon />
//                           </IconButton>
//                         }
//                       >
//                         <ListItemIcon>
//                           <EmailIcon />
//                         </ListItemIcon>
//                         <MuiListItemText
//                           primary={recipient.email}
//                           secondary={recipient.name || 'No name'}
//                         />
//                       </ListItem>
//                     ))}
//                   </List>
//                 </Paper>
//               )}
//             </Box>
//           </Grid>
//         )}
        
//         <Grid item xs={12}>
//           <TextField
//             fullWidth
//             label="Subject"
//             value={scheduleEmail.subject}
//             onChange={(e) => setScheduleEmail(prev => ({ ...prev, subject: e.target.value }))}
//             required
//             margin="normal"
//           />
//         </Grid>
        
//         <Grid item xs={12}>
//           <FormControl fullWidth margin="normal">
//             <InputLabel>Template (Optional)</InputLabel>
//             <Select
//               value={scheduleEmail.templateId}
//               onChange={(e) => setScheduleEmail(prev => ({ ...prev, templateId: e.target.value }))}
//               label="Template"
//             >
//               <MenuItem value="">None</MenuItem>
//               {templates.map(template => (
//                 <MenuItem key={template.id} value={template.id}>
//                   {template.name} ({template.category})
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </Grid>
        
//         <Grid item xs={12}>
//           <TextField
//             fullWidth
//             label="HTML Content"
//             value={scheduleEmail.htmlBody}
//             onChange={(e) => setScheduleEmail(prev => ({ ...prev, htmlBody: e.target.value }))}
//             multiline
//             rows={4}
//             margin="normal"
//             placeholder="<p>Your HTML content here...</p>"
//           />
//         </Grid>
        
//         <Grid item xs={12}>
//           <TextField
//             fullWidth
//             label="Plain Text Content"
//             value={scheduleEmail.body}
//             onChange={(e) => setScheduleEmail(prev => ({ ...prev, body: e.target.value }))}
//             multiline
//             rows={2}
//             margin="normal"
//           />
//         </Grid>
        
//         <Grid item xs={12} md={6}>
//           <LocalizationProvider dateAdapter={AdapterDateFns}>
//             <DatePicker
//               label="Schedule Date"
//               value={scheduleEmail.scheduleTime}
//               onChange={(newValue) => setScheduleEmail(prev => ({ ...prev, scheduleTime: newValue }))}
//               renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
//             />
//           </LocalizationProvider>
//         </Grid>
        
//         <Grid item xs={12} md={6}>
//           <LocalizationProvider dateAdapter={AdapterDateFns}>
//             <TimePicker
//               label="Schedule Time"
//               value={scheduleEmail.scheduleTime}
//               onChange={(newValue) => setScheduleEmail(prev => ({ ...prev, scheduleTime: newValue }))}
//               renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
//             />
//           </LocalizationProvider>
//         </Grid>
        
//         <Grid item xs={12}>
//           <Box sx={{ mb: 2 }}>
//             <Typography variant="subtitle2" gutterBottom>
//               Attachments (Optional)
//             </Typography>
//             <input
//               key={fileInputKey}
//               type="file"
//               accept="*/*"
//               multiple
//               onChange={(e) => handleAddAttachment(e, 'schedule')}
//               style={{ display: 'none' }}
//               id="schedule-attachment-upload"
//             />
//             <label htmlFor="schedule-attachment-upload">
//               <Button
//                 component="span"
//                 variant="outlined"
//                 startIcon={<AttachFileIcon />}
//                 sx={{ mr: 2 }}
//               >
//                 Add Attachments
//               </Button>
//             </label>
            
//             {scheduleEmail.attachments.length > 0 && (
//               <List dense>
//                 {scheduleEmail.attachments.map((attachment, index) => (
//                   <ListItem key={index}>
//                     <ListItemIcon>
//                       <AttachFileIcon />
//                     </ListItemIcon>
//                     <MuiListItemText
//                       primary={attachment.filename}
//                       secondary={`${attachment.content_type}`}
//                     />
//                     <ListItemSecondaryAction>
//                       <IconButton edge="end" onClick={() => handleRemoveAttachment(index, 'schedule')}>
//                         <DeleteIcon />
//                       </IconButton>
//                     </ListItemSecondaryAction>
//                   </ListItem>
//                 ))}
//               </List>
//             )}
//           </Box>
//         </Grid>
        
//         <Grid item xs={12}>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <FormControl sx={{ minWidth: 150 }}>
//               <InputLabel>Priority</InputLabel>
//               <Select
//                 value={scheduleEmail.priority}
//                 onChange={(e) => setScheduleEmail(prev => ({ ...prev, priority: e.target.value }))}
//                 label="Priority"
//               >
//                 <MenuItem value="high">High</MenuItem>
//                 <MenuItem value="normal">Normal</MenuItem>
//                 <MenuItem value="low">Low</MenuItem>
//               </Select>
//             </FormControl>
            
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={handleScheduleEmail}
//               disabled={loading || !smtpConnected}
//               startIcon={loading ? <CircularProgress size={20} /> : <ScheduleIcon />}
//               size="large"
//             >
//               {loading ? 'Scheduling...' : 'Schedule Email'}
//             </Button>
//           </Box>
//         </Grid>
//       </Grid>
//     </StyledPaper>
//   );

//   const renderTemplatesTab = () => (
//     <StyledPaper>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//         <Typography variant="h6">
//           <TemplateIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
//           Email Templates
//         </Typography>
//         <Button
//           variant="contained"
//           startIcon={<AddIcon />}
//           onClick={() => setTemplateDialogOpen(true)}
//         >
//           New Template
//         </Button>
//       </Box>
      
//       {templates.length === 0 ? (
//         <Alert severity="info">
//           No templates found. Create your first email template to save time on repetitive emails.
//         </Alert>
//       ) : (
//         <Grid container spacing={3}>
//           {templates.map(template => (
//             <Grid item xs={12} md={6} lg={4} key={template.id}>
//               <Card>
//                 <CardContent>
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//                     <Typography variant="h6" gutterBottom>
//                       {template.name}
//                       {!template.is_active && (
//                         <Chip
//                           label="Inactive"
//                           size="small"
//                           color="default"
//                           sx={{ ml: 1 }}
//                         />
//                       )}
//                     </Typography>
//                     <Chip
//                       label={template.category}
//                       size="small"
//                       color="primary"
//                       variant="outlined"
//                     />
//                   </Box>
                  
//                   <Typography variant="body2" color="text.secondary" gutterBottom>
//                     Subject: {template.subject}
//                   </Typography>
                  
//                   <Typography variant="body2" sx={{ mb: 2 }}>
//                     {template.html_content.length > 100
//                       ? `${template.html_content.substring(0, 100)}...`
//                       : template.html_content}
//                   </Typography>
                  
//                   {template.variables && template.variables.length > 0 && (
//                     <Box sx={{ mb: 2 }}>
//                       <Typography variant="caption" color="text.secondary">
//                         Variables: {template.variables.join(', ')}
//                       </Typography>
//                     </Box>
//                   )}
                  
//                   <Typography variant="caption" color="text.secondary">
//                     Created: {formatDate(template.created_at)}
//                   </Typography>
//                 </CardContent>
//                 <CardActions>
//                   <Button
//                     size="small"
//                     startIcon={<VisibilityIcon />}
//                     onClick={() => handleTemplateSelect(template.id)}
//                   >
//                     Use Template
//                   </Button>
//                   <Button size="small" startIcon={<EditIcon />}>
//                     Edit
//                   </Button>
//                 </CardActions>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>
//       )}
//     </StyledPaper>
//   );

//   const renderAnalyticsTab = () => (
//     <StyledPaper>
//       <Typography variant="h6" gutterBottom>
//         <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
//         Email Analytics
//       </Typography>
      
//       {stats ? (
//         <Grid container spacing={3}>
//           <Grid item xs={12} md={3}>
//             <Card>
//               <CardContent>
//                 <Typography color="text.secondary" gutterBottom>
//                   Total Emails
//                 </Typography>
//                 <Typography variant="h4">
//                   {stats.total_emails || 0}
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>
          
//           <Grid item xs={12} md={3}>
//             <Card>
//               <CardContent>
//                 <Typography color="text.secondary" gutterBottom>
//                   Sent
//                 </Typography>
//                 <Typography variant="h4" color="success.main">
//                   {stats.status_distribution?.sent || 0}
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>
          
//           <Grid item xs={12} md={3}>
//             <Card>
//               <CardContent>
//                 <Typography color="text.secondary" gutterBottom>
//                   Failed
//                 </Typography>
//                 <Typography variant="h4" color="error.main">
//                   {stats.status_distribution?.failed || 0}
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>
          
//           <Grid item xs={12} md={3}>
//             <Card>
//               <CardContent>
//                 <Typography color="text.secondary" gutterBottom>
//                   Open Rate
//                 </Typography>
//                 <Typography variant="h4" color="info.main">
//                   {((stats.status_distribution?.opened || 0) / stats.total_emails * 100).toFixed(1)}%
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>
          
//           <Grid item xs={12}>
//             <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
//               Recent Email History
//             </Typography>
//             <TableContainer component={Paper} variant="outlined">
//               <Table>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Recipient</TableCell>
//                     <TableCell>Subject</TableCell>
//                     <TableCell>Status</TableCell>
//                     <TableCell>Sent At</TableCell>
//                     <TableCell>Actions</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {emailHistory.slice(0, 10).map((email) => (
//                     <TableRow key={email.email_id}>
//                       <TableCell>
//                         <Box>
//                           <Typography variant="body2">{email.to_email}</Typography>
//                           {email.to_name && (
//                             <Typography variant="caption" color="text.secondary">
//                               {email.to_name}
//                             </Typography>
//                           )}
//                         </Box>
//                       </TableCell>
//                       <TableCell>{email.subject}</TableCell>
//                       <TableCell>
//                         <StatusChip
//                           label={email.status}
//                           status={email.status}
//                           size="small"
//                         />
//                       </TableCell>
//                       <TableCell>
//                         {email.sent_at ? formatDate(email.sent_at) : 'Not sent'}
//                       </TableCell>
//                       <TableCell>
//                         <IconButton size="small" onClick={() => handleViewEmail(email.email_id)}>
//                           <VisibilityIcon fontSize="small" />
//                         </IconButton>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </Grid>
//         </Grid>
//       ) : (
//         <CircularProgress />
//       )}
//     </StyledPaper>
//   );

//   const renderScheduledTab = () => (
//     <StyledPaper>
//       <Typography variant="h6" gutterBottom>
//         <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
//         Scheduled Emails
//       </Typography>
      
//       {scheduledEmails.length === 0 ? (
//         <Alert severity="info">
//           No scheduled emails. Schedule an email to see it here.
//         </Alert>
//       ) : (
//         <TableContainer component={Paper} variant="outlined">
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Subject</TableCell>
//                 <TableCell>Recipients</TableCell>
//                 <TableCell>Scheduled Time</TableCell>
//                 <TableCell>Status</TableCell>
//                 <TableCell>Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {scheduledEmails.map((email) => (
//                 <TableRow key={email.scheduled_id}>
//                   <TableCell>{email.subject}</TableCell>
//                   <TableCell>{email.recipient_count}</TableCell>
//                   <TableCell>
//                     {formatDate(email.schedule_time)}
//                     <Typography variant="caption" display="block" color="text.secondary">
//                       {email.timezone}
//                     </Typography>
//                   </TableCell>
//                   <TableCell>
//                     <StatusChip
//                       label={email.status}
//                       status={email.status}
//                       size="small"
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <IconButton
//                       size="small"
//                       onClick={() => handleCancelScheduledEmail(email.scheduled_id)}
//                       color="error"
//                       title="Cancel"
//                     >
//                       <CloseIcon fontSize="small" />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       )}
//     </StyledPaper>
//   );

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container maxWidth="xl">
//         <Box sx={{ my: 4 }}>
//           <Typography variant="h4" gutterBottom>
//             <MailIcon sx={{ mr: 2, verticalAlign: 'bottom' }} />
//             Bulk Email Manager
//           </Typography>
          
//           <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
//             <Chip
//               icon={smtpConnected ? <CheckIcon /> : <ErrorIcon />}
//               label={`SMTP: ${smtpConnected ? 'Connected' : 'Disconnected'}`}
//               color={smtpConnected ? 'success' : 'error'}
//               variant="outlined"
//               sx={{ mr: 2 }}
//             />
//             <Button
//               size="small"
//               startIcon={<RefreshIcon />}
//               onClick={checkSmtpConnection}
//             >
//               Test Connection
//             </Button>
//           </Box>
          
//           <Paper sx={{ mb: 2 }}>
//             <Tabs
//               value={activeTab}
//               onChange={(e, newValue) => setActiveTab(newValue)}
//               variant="scrollable"
//               scrollButtons="auto"
//             >
//               <Tab label="Single Email" icon={<EmailIcon />} iconPosition="start" />
//               <Tab label="Bulk Email" icon={<PeopleIcon />} iconPosition="start" />
//               <Tab label="Schedule Email" icon={<ScheduleIcon />} iconPosition="start" />
//               <Tab label="Templates" icon={<TemplateIcon />} iconPosition="start" />
//               <Tab label="Analytics" icon={<BarChartIcon />} iconPosition="start" />
//               <Tab label="Scheduled" icon={<HistoryIcon />} iconPosition="start" />
//             </Tabs>
//           </Paper>
          
//           <TabPanel value={activeTab} index={0}>
//             {renderSingleEmailTab()}
//           </TabPanel>
          
//           <TabPanel value={activeTab} index={1}>
//             {renderBulkEmailTab()}
//           </TabPanel>
          
//           <TabPanel value={activeTab} index={2}>
//             {renderScheduleEmailTab()}
//           </TabPanel>
          
//           <TabPanel value={activeTab} index={3}>
//             {renderTemplatesTab()}
//           </TabPanel>
          
//           <TabPanel value={activeTab} index={4}>
//             {renderAnalyticsTab()}
//           </TabPanel>
          
//           <TabPanel value={activeTab} index={5}>
//             {renderScheduledTab()}
//           </TabPanel>
//         </Box>
        
//         {/* Template Creation Dialog */}
//         <Dialog
//           open={templateDialogOpen}
//           onClose={() => setTemplateDialogOpen(false)}
//           maxWidth="md"
//           fullWidth
//         >
//           <DialogTitle>Create New Email Template</DialogTitle>
//           <DialogContent>
//             <Grid container spacing={2} sx={{ mt: 1 }}>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Template Name"
//                   value={newTemplate.name}
//                   onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Subject"
//                   value={newTemplate.subject}
//                   onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Category"
//                   value={newTemplate.category}
//                   onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="HTML Content"
//                   value={newTemplate.htmlContent}
//                   onChange={(e) => setNewTemplate(prev => ({ ...prev, htmlContent: e.target.value }))}
//                   multiline
//                   rows={8}
//                   required
//                   helperText="Use {{variable_name}} for dynamic content"
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Plain Text Content (Optional)"
//                   value={newTemplate.textContent}
//                   onChange={(e) => setNewTemplate(prev => ({ ...prev, textContent: e.target.value }))}
//                   multiline
//                   rows={4}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Variables (comma-separated)"
//                   value={newTemplate.variables.join(', ')}
//                   onChange={(e) => setNewTemplate(prev => ({
//                     ...prev,
//                     variables: e.target.value.split(',').map(v => v.trim()).filter(v => v)
//                   }))}
//                   helperText="List of variable names used in the template"
//                 />
//               </Grid>
//             </Grid>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
//             <Button
//               onClick={handleCreateTemplate}
//               variant="contained"
//               disabled={loading}
//             >
//               {loading ? 'Creating...' : 'Create Template'}
//             </Button>
//           </DialogActions>
//         </Dialog>
        
//         {/* Email Details Dialog */}
//         <Dialog
//           open={emailDialogOpen}
//           onClose={() => setEmailDialogOpen(false)}
//           maxWidth="md"
//           fullWidth
//         >
//           {selectedEmail && (
//             <>
//               <DialogTitle>
//                 Email Details
//                 <StatusChip
//                   label={selectedEmail.email.status}
//                   status={selectedEmail.email.status}
//                   sx={{ ml: 2 }}
//                 />
//               </DialogTitle>
//               <DialogContent>
//                 <Grid container spacing={3}>
//                   <Grid item xs={12}>
//                     <Typography variant="subtitle2" color="text.secondary">
//                       Recipient
//                     </Typography>
//                     <Typography variant="body1">
//                       {selectedEmail.email.to_name} &lt;{selectedEmail.email.to_email}&gt;
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={12}>
//                     <Typography variant="subtitle2" color="text.secondary">
//                       Subject
//                     </Typography>
//                     <Typography variant="body1">{selectedEmail.email.subject}</Typography>
//                   </Grid>
//                   <Grid item xs={6}>
//                     <Typography variant="subtitle2" color="text.secondary">
//                       Created
//                     </Typography>
//                     <Typography variant="body2">
//                       {formatDate(selectedEmail.email.created_at)}
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={6}>
//                     <Typography variant="subtitle2" color="text.secondary">
//                       Sent
//                     </Typography>
//                     <Typography variant="body2">
//                       {selectedEmail.email.sent_at ? formatDate(selectedEmail.email.sent_at) : 'Not sent'}
//                     </Typography>
//                   </Grid>
//                   {selectedEmail.analytics && (
//                     <>
//                       <Grid item xs={6}>
//                         <Typography variant="subtitle2" color="text.secondary">
//                           Times Opened
//                         </Typography>
//                         <Typography variant="body1">
//                           {selectedEmail.analytics.opened_count || 0}
//                         </Typography>
//                       </Grid>
//                       <Grid item xs={6}>
//                         <Typography variant="subtitle2" color="text.secondary">
//                           Times Clicked
//                         </Typography>
//                         <Typography variant="body1">
//                           {selectedEmail.analytics.clicked_count || 0}
//                         </Typography>
//                       </Grid>
//                     </>
//                   )}
//                   {selectedEmail.email.error_message && (
//                     <Grid item xs={12}>
//                       <Alert severity="error">
//                         <Typography variant="subtitle2">Error:</Typography>
//                         <Typography variant="body2">{selectedEmail.email.error_message}</Typography>
//                       </Alert>
//                     </Grid>
//                   )}
//                 </Grid>
//               </DialogContent>
//               <DialogActions>
//                 <Button onClick={() => setEmailDialogOpen(false)}>Close</Button>
//               </DialogActions>
//             </>
//           )}
//         </Dialog>
        
//         {/* Snackbar for notifications */}
//         <Snackbar
//           open={snackbar.open}
//           autoHideDuration={6000}
//           onClose={handleCloseSnackbar}
//           anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//         >
//           <Alert
//             onClose={handleCloseSnackbar}
//             severity={snackbar.severity}
//             sx={{ width: '100%' }}
//           >
//             {snackbar.message}
//           </Alert>
//         </Snackbar>
//       </Container>
//     </LocalizationProvider>
//   );
// };

// export default BulkMessage;