import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TextField,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { toast } from "react-toastify";
import { 
  Download, 
  Lock, 
  LockOpen, 
  Search, 
  User, 
  Eye, 
  Mail, 
  Phone, 
  Calendar,
  Building,
  CreditCard,
  MapPin,
  Globe,
  Instagram,
  Youtube,
  Facebook,
  Twitter,
  Linkedin,
  X
} from "lucide-react";
import api from "../../services/api";
import { format } from "date-fns";

const PaymentManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileTab, setProfileTab] = useState("overview");
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    suspended: "all",
  });

  // ==========================
  // 📦 FETCH REPORT DATA
  // ==========================
  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get("/account/report/all-users");
      setUsers(res.data || []);
      setFilteredUsers(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch report");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // 🔍 FILTER HANDLER
  // ==========================
  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);

    let filtered = [...users];

    // Search filter
    if (newFilters.search.trim() !== "") {
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(newFilters.search.toLowerCase()) ||
          u.email?.toLowerCase().includes(newFilters.search.toLowerCase()) ||
          u.company_name?.toLowerCase().includes(newFilters.search.toLowerCase()) ||
          u.nickname?.toLowerCase().includes(newFilters.search.toLowerCase())
      );
    }

    // Role filter
    if (newFilters.role !== "all") {
      filtered = filtered.filter((u) => u.role === newFilters.role);
    }

    // Suspended filter
    if (newFilters.suspended !== "all") {
      const isSuspended = newFilters.suspended === "true";
      filtered = filtered.filter((u) => u.is_suspended === isSuspended);
    }

    setFilteredUsers(filtered);
  };

  // ==========================
  // 🔒 SUSPEND / UNSUSPEND
  // ==========================
  const handleSuspend = async (userId) => {
    try {
      await api.put(`/account/suspend-user/${userId}`);
      toast.success("User suspended successfully");
      fetchReport();
    } catch (err) {
      toast.error("Failed to suspend user");
      console.error(err);
    }
  };

  const handleUnsuspend = async (userId) => {
    try {
      await api.put(`/account/unsuspend-user/${userId}`);
      toast.success("User unsuspended successfully");
      fetchReport();
    } catch (err) {
      toast.error("Failed to unsuspend user");
      console.error(err);
    }
  };

  // ==========================
  // 👤 VIEW PROFILE
  // ==========================
  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setProfileDialogOpen(true);
    setProfileTab("overview");
  };

  const handleCloseProfile = () => {
    setProfileDialogOpen(false);
    setSelectedUser(null);
  };

  // ==========================
  // 📁 EXPORT CSV
  // ==========================
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const res = await api.get("/account/report/all-users/csv", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users_bank_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("CSV exported successfully");
    } catch (err) {
      toast.error("Failed to export CSV");
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  // ==========================
  // 🎨 UI HELPERS
  // ==========================
  const getRoleColor = (role) => {
    switch (role) {
      case "influencer": return "primary";
      case "brand": return "secondary";
      case "admin": return "error";
      default: return "default";
    }
  };

  const getStatusColor = (isSuspended) => {
    return isSuspended ? "error" : "success";
  };

  const getPlatformIcon = (platform) => {
    const platformIcons = {
      instagram: <Instagram size={20} />,
      youtube: <Youtube size={20} />,
      facebook: <Facebook size={20} />,
      twitter: <Twitter size={20} />,
      linkedin: <Linkedin size={20} />,
      tiktok: <Globe size={20} />
    };
    return platformIcons[platform?.toLowerCase()] || <Globe size={20} />;
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // ==========================
  // 👤 USER PROFILE COMPONENT
  // ==========================
  const UserProfileDialog = ({ user, open, onClose }) => {
    if (!user) return null;

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          background: '#2563eb',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h5" fontWeight="700">
            User Profile
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <X size={24} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Tabs
            value={profileTab}
            onChange={(e, newValue) => setProfileTab(newValue)}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              px: 3,
              pt: 2
            }}
          >
            <Tab label="Overview" value="overview" />
            <Tab label="Bank Accounts" value="banking" />
            <Tab label="Activity" value="activity" />
          </Tabs>

          {/* Overview Tab */}
          {profileTab === "overview" && (
            <Box sx={{ p: 3 }}>
              {/* Header Section */}
              <Box display="flex" alignItems="flex-start" gap={3} sx={{ mb: 4 }}>
                <Avatar
                  sx={{ 
                    width: 100, 
                    height: 100,
                    fontSize: '2rem'
                  }}
                >
                  <User size={40} />
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h4" fontWeight="700" gutterBottom>
                    {user.name || user.nickname || user.company_name || 'No Name'}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" sx={{ mb: 2 }}>
                    <Chip 
                      label={user.role} 
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                    <Chip 
                      label={user.is_suspended ? "Suspended" : "Active"} 
                      color={getStatusColor(user.is_suspended)}
                      variant="outlined"
                      size="small"
                    />
                    {user.verified && (
                      <Chip 
                        label="Verified" 
                        color="success" 
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                        <Mail size={18} color="#666" />
                        <Typography variant="body2">{user.email}</Typography>
                      </Box>
                      {user.phone && (
                        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                          <Phone size={18} color="#666" />
                          <Typography variant="body2">{user.phone}</Typography>
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                        <Calendar size={18} color="#666" />
                        <Typography variant="body2">
                          Joined: {user.created_at ? format(new Date(user.created_at), 'MMM dd, yyyy') : 'N/A'}
                        </Typography>
                      </Box>
                      {user.last_login && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Calendar size={18} color="#666" />
                          <Typography variant="body2">
                            Last login: {format(new Date(user.last_login), 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Brand Specific Information */}
              {user.role === "brand" && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Company Information
                  </Typography>
                  <Grid container spacing={3}>
                    {user.company_name && (
                      <Grid item xs={12} sm={6}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                            <Building size={20} color="#1976d2" />
                            <Typography variant="body1" fontWeight="600">Company Name</Typography>
                          </Box>
                          <Typography variant="body2">{user.company_name}</Typography>
                        </Card>
                      </Grid>
                    )}
                    {user.industry && (
                      <Grid item xs={12} sm={6}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                            <Globe size={20} color="#1976d2" />
                            <Typography variant="body1" fontWeight="600">Industry</Typography>
                          </Box>
                          <Typography variant="body2">{user.industry}</Typography>
                        </Card>
                      </Grid>
                    )}
                    {user.company_size && (
                      <Grid item xs={12} sm={6}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                            <User size={20} color="#1976d2" />
                            <Typography variant="body1" fontWeight="600">Company Size</Typography>
                          </Box>
                          <Typography variant="body2">{user.company_size}</Typography>
                        </Card>
                      </Grid>
                    )}
                    {user.website && (
                      <Grid item xs={12} sm={6}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                            <Globe size={20} color="#1976d2" />
                            <Typography variant="body1" fontWeight="600">Website</Typography>
                          </Box>
                          <Typography variant="body2">{user.website}</Typography>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {/* Influencer Specific Information */}
              {user.role === "influencer" && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Influencer Profile
                  </Typography>
                  <Grid container spacing={3}>
                    {user.nickname && (
                      <Grid item xs={12} sm={6}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                            <User size={20} color="#1976d2" />
                            <Typography variant="body1" fontWeight="600">Nickname</Typography>
                          </Box>
                          <Typography variant="body2">{user.nickname}</Typography>
                        </Card>
                      </Grid>
                    )}
                    {user.followers && (
                      <Grid item xs={12} sm={6}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                            <User size={20} color="#1976d2" />
                            <Typography variant="body1" fontWeight="600">Followers</Typography>
                          </Box>
                          <Typography variant="body2">{formatNumber(user.followers)}</Typography>
                        </Card>
                      </Grid>
                    )}
                    {user.engagement_rate && (
                      <Grid item xs={12} sm={6}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                            <Globe size={20} color="#1976d2" />
                            <Typography variant="body1" fontWeight="600">Engagement Rate</Typography>
                          </Box>
                          <Typography variant="body2">{user.engagement_rate}%</Typography>
                        </Card>
                      </Grid>
                    )}
                    {user.primary_platform && (
                      <Grid item xs={12} sm={6}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                            {getPlatformIcon(user.primary_platform)}
                            <Typography variant="body1" fontWeight="600">Primary Platform</Typography>
                          </Box>
                          <Typography variant="body2" textTransform="capitalize">
                            {user.primary_platform}
                          </Typography>
                        </Card>
                      </Grid>
                    )}
                  </Grid>

                  {/* Social Media Links */}
                  {user.social_media_links && Object.keys(user.social_media_links).length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                        Social Media Links
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {Object.entries(user.social_media_links).map(([platform, url]) => (
                          <Chip
                            key={platform}
                            icon={getPlatformIcon(platform)}
                            label={platform}
                            variant="outlined"
                            size="small"
                            onClick={() => window.open(url, '_blank')}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {/* Bio Section */}
              {user.bio && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    About
                  </Typography>
                  <Card variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                      {user.bio}
                    </Typography>
                  </Card>
                </Box>
              )}
            </Box>
          )}

          {/* Banking Tab */}
          {profileTab === "banking" && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Bank Accounts
              </Typography>
              
              {user.bank_accounts?.length > 0 ? (
                <Grid container spacing={2}>
                  {user.bank_accounts.map((account, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                          <CreditCard size={24} color="#1976d2" />
                          <Typography variant="h6" fontWeight="600">
                            {account.bank_name || "Unknown Bank"}
                          </Typography>
                        </Box>
                        
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Account Number
                            </Typography>
                            <Typography variant="body1" fontWeight="600" fontFamily="monospace">
                              ****{account.account_number?.slice(-4)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              IFSC Code
                            </Typography>
                            <Typography variant="body1" fontWeight="600">
                              {account.ifsc_code || "N/A"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Account Holder
                            </Typography>
                            <Typography variant="body1" fontWeight="600">
                              {account.account_holder_name || "N/A"}
                            </Typography>
                          </Grid>
                          {account.branch && (
                            <Grid item xs={12}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <MapPin size={16} color="#666" />
                                <Typography variant="body2">
                                  {account.branch}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>

                        {account.is_primary && (
                          <Chip 
                            label="Primary Account" 
                            color="primary" 
                            size="small" 
                            sx={{ mt: 2 }}
                          />
                        )}
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={4}>
                  <CreditCard size={48} color="#ccc" />
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                    No bank accounts added
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Activity Tab */}
          {profileTab === "activity" && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Activity tracking feature coming soon...
              </Typography>
              {/* Add activity timeline, payments, campaigns etc. here */}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={onClose}>
            Close
          </Button>
          {user.is_suspended ? (
            <Button
              variant="contained"
              color="success"
              startIcon={<LockOpen size={18} />}
              onClick={() => {
                handleUnsuspend(user.user_id);
                onClose();
              }}
            >
              Unsuspend User
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              startIcon={<Lock size={18} />}
              onClick={() => {
                handleSuspend(user.user_id);
                onClose();
              }}
            >
              Suspend User
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // ==========================
  // 🖼️ UI
  // ==========================
  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Admin Dashboard — User & Payment Management
      </Typography>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, background: '#2563eb', color: 'white' }}>
            <Typography variant="h4" fontWeight="700">
              {users.length}
            </Typography>
            <Typography variant="body2">Total Users</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <Typography variant="h4" fontWeight="700">
              {users.filter(u => u.role === 'influencer').length}
            </Typography>
            <Typography variant="body2">Influencers</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <Typography variant="h4" fontWeight="700">
              {users.filter(u => u.role === 'brand').length}
            </Typography>
            <Typography variant="body2">Brands</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <Typography variant="h4" fontWeight="700">
              {users.filter(u => u.is_suspended).length}
            </Typography>
            <Typography variant="body2">Suspended</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filters Row */}
      <Box
        display="flex"
        flexWrap="wrap"
        alignItems="center"
        gap={2}
        mb={3}
        justifyContent="space-between"
      >
        <Box display="flex" flexWrap="wrap" alignItems="center" gap={2}>
          {/* Search Bar */}
          <TextField
            placeholder="Search by name, email, or company"
            variant="outlined"
            size="small"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            sx={{ width: "250px" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            }}
          />

          {/* Role Filter */}
          <TextField
            select
            label="Role"
            size="small"
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="brand">Brand</MenuItem>
            <MenuItem value="influencer">Influencer</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>

          {/* Suspended Filter */}
          <TextField
            select
            label="Status"
            size="small"
            value={filters.suspended}
            onChange={(e) => handleFilterChange("suspended", e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="false">Active</MenuItem>
            <MenuItem value="true">Suspended</MenuItem>
          </TextField>
        </Box>

        <Button
          variant="contained"
          color="success"
          startIcon={<Download size={18} />}
          onClick={handleExportCSV}
          disabled={exporting}
        >
          {exporting ? "Exporting..." : "Export CSV"}
        </Button>
      </Box>

      {/* Data Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : filteredUsers.length === 0 ? (
        <Box textAlign="center" mt={4} p={4}>
          <Search size={48} color="#ccc" />
          <Typography variant="h6" color="text.secondary" mt={2}>
            No users found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search filters
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
              <TableRow>
                <TableCell><b>User</b></TableCell>
                <TableCell><b>Contact</b></TableCell>
                <TableCell><b>Role</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell><b>Bank Accounts</b></TableCell>
                <TableCell align="center"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.user_id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        <User size={20} />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="600">
                          {user.name || user.nickname || user.company_name || 'No Name'}
                        </Typography>
                        {user.role === 'brand' && user.company_name && (
                          <Typography variant="caption" color="text.secondary">
                            {user.company_name}
                          </Typography>
                        )}
                        {user.role === 'influencer' && user.nickname && (
                          <Typography variant="caption" color="text.secondary">
                            @{user.nickname}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                    {user.phone && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {user.phone}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.is_suspended ? "Suspended" : "Active"} 
                      color={getStatusColor(user.is_suspended)}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.bank_accounts?.length > 0 ? (
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {user.bank_accounts.length} account(s)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Primary: {user.bank_accounts.find(acc => acc.is_primary)?.bank_name || 'N/A'}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography color="text.secondary" fontSize={14}>
                        No accounts
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={1} justifyContent="center">
                      <Tooltip title="View Profile">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewProfile(user)}
                        >
                          <Eye size={18} />
                        </IconButton>
                      </Tooltip>
                      {user.is_suspended ? (
                        <Tooltip title="Unsuspend User">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleUnsuspend(user.user_id)}
                          >
                            <LockOpen size={18} />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Suspend User">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleSuspend(user.user_id)}
                          >
                            <Lock size={18} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* User Profile Dialog */}
      <UserProfileDialog 
        user={selectedUser} 
        open={profileDialogOpen} 
        onClose={handleCloseProfile} 
      />
    </Box>
  );
};

export default PaymentManagement;




// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import PaymentFilters from './PaymentFilters';
// import PaymentModal from './PaymentModal';
// import StatusUpdateModal from './StatusUpdateModal';

// const PaymentsManagement = ({ searchQuery }) => {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [totalPayments, setTotalPayments] = useState(0);
//   const [page, setPage] = useState(1);
//   const [limit] = useState(20);
//   const [filters, setFilters] = useState({
//     status: '',
//     payment_method: '',
//     brand_id: '',
//     influencer_id: '',
//     campaign_id: '',
//     date_from: '',
//     date_to: '',
//     min_amount: '',
//     max_amount: '',
//     has_payout: ''
//   });
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showStatusModal, setShowStatusModal] = useState(false);
//   const [selectedPayment, setSelectedPayment] = useState(null);
//   const [selectedStatus, setSelectedStatus] = useState('');
//   const [stats, setStats] = useState({
//     total: 0,
//     pending: 0,
//     approved: 0,
//     completed: 0,
//     failed: 0
//   });

//   useEffect(() => {
//     fetchPayments();
//     fetchPaymentStats();
//   }, [page, filters, searchQuery]);

//   const fetchPayments = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       const params = {
//         skip: (page - 1) * limit,
//         limit,
//         ...filters
//       };

//       // Add search query if applicable
//       if (searchQuery) {
//         params.search = searchQuery;
//       }

//       const response = await axios.get('/api/admin/payments/payments', {
//         headers: { Authorization: `Bearer ${token}` },
//         params
//       });

//       if (response.data.success) {
//         setPayments(response.data.payments);
//         setTotalPayments(response.data.total);
//       }
//     } catch (error) {
//       console.error('Error fetching payments:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchPaymentStats = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('/api/admin/payments/dashboard/stats', {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (response.data.success) {
//         setStats({
//           total: response.data.payment_stats.total,
//           pending: response.data.payment_stats.pending,
//           approved: response.data.payment_stats.approved,
//           completed: response.data.payment_stats.completed,
//           failed: response.data.payment_stats.total - 
//                  response.data.payment_stats.pending - 
//                  response.data.payment_stats.approved - 
//                  response.data.payment_stats.completed
//         });
//       }
//     } catch (error) {
//       console.error('Error fetching payment stats:', error);
//     }
//   };

//   const handleFilterChange = (newFilters) => {
//     setFilters(newFilters);
//     setPage(1);
//   };

//   const handleCreatePayment = async (paymentData) => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.post('/api/admin/payments/payments/create', paymentData, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (response.data.success) {
//         fetchPayments();
//         fetchPaymentStats();
//         setShowCreateModal(false);
//         // Show success notification
//         alert('Payment created successfully!');
//       }
//     } catch (error) {
//       console.error('Error creating payment:', error);
//       alert('Failed to create payment');
//     }
//   };

//   const handleStatusUpdate = async (paymentId, statusData) => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.put(
//         `/api/admin/payments/payments/${paymentId}/status`,
//         statusData,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         fetchPayments();
//         fetchPaymentStats();
//         setShowStatusModal(false);
//         alert('Status updated successfully!');
//       }
//     } catch (error) {
//       console.error('Error updating status:', error);
//       alert('Failed to update status');
//     }
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0
//     }).format(amount);
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   const getStatusBadgeClass = (status) => {
//     switch (status) {
//       case 'completed': return 'badge-success';
//       case 'approved': return 'badge-primary';
//       case 'pending_approval': return 'badge-warning';
//       case 'processing': return 'badge-info';
//       case 'failed': return 'badge-danger';
//       case 'cancelled': return 'badge-secondary';
//       default: return 'badge-light';
//     }
//   };

//   const handleExport = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('/api/admin/payments/export/payments', {
//         headers: { Authorization: `Bearer ${token}` },
//         params: filters,
//         responseType: 'blob'
//       });

//       const blob = new Blob([response.data], { type: 'text/csv' });
//       const downloadUrl = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = downloadUrl;
//       link.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } catch (error) {
//       console.error('Export failed:', error);
//       alert('Export failed. Please try again.');
//     }
//   };

//   return (
//     <div className="payments-management">
//       {/* Header with stats and actions */}
//       <div className="section-header">
//         <div className="header-left">
//           <h2>Payments Management</h2>
//           <p className="header-subtitle">
//             Manage and track all payments to influencers
//           </p>
//         </div>
//         <div className="header-actions">
//           <button 
//             className="btn btn-secondary"
//             onClick={handleExport}
//             title="Export to CSV"
//           >
//             📥 Export
//           </button>
//           <button 
//             className="btn btn-primary"
//             onClick={() => setShowCreateModal(true)}
//           >
//             + Create Payment
//           </button>
//         </div>
//       </div>

//       {/* Quick Stats */}
//       <div className="quick-stats-bar">
//         <div className="stat-item">
//           <span className="stat-label">Total Payments</span>
//           <span className="stat-value">{stats.total}</span>
//         </div>
//         <div className="stat-item">
//           <span className="stat-label">Pending Approval</span>
//           <span className="stat-value warning">{stats.pending}</span>
//         </div>
//         <div className="stat-item">
//           <span className="stat-label">Approved</span>
//           <span className="stat-value primary">{stats.approved}</span>
//         </div>
//         <div className="stat-item">
//           <span className="stat-label">Completed</span>
//           <span className="stat-value success">{stats.completed}</span>
//         </div>
//         <div className="stat-item">
//           <span className="stat-label">Failed</span>
//           <span className="stat-value danger">{stats.failed}</span>
//         </div>
//       </div>

//       {/* Filters */}
//       <PaymentFilters 
//         filters={filters}
//         onFilterChange={handleFilterChange}
//         onReset={() => setFilters({})}
//       />

//       {/* Payments Table */}
//       <div className="table-container">
//         {loading ? (
//           <div className="loading-indicator">
//             <div className="spinner"></div>
//             <p>Loading payments...</p>
//           </div>
//         ) : payments.length === 0 ? (
//           <div className="empty-state">
//             <div className="empty-icon">💰</div>
//             <h3>No payments found</h3>
//             <p>Try adjusting your filters or create a new payment</p>
//             <button 
//               className="btn btn-primary"
//               onClick={() => setShowCreateModal(true)}
//             >
//               Create First Payment
//             </button>
//           </div>
//         ) : (
//           <>
//             <table className="payments-table">
//               <thead>
//                 <tr>
//                   <th>Reference</th>
//                   <th>Influencer</th>
//                   <th>Campaign</th>
//                   <th>Amount</th>
//                   <th>Status</th>
//                   <th>Method</th>
//                   <th>Created</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {payments.map(payment => (
//                   <tr key={payment._id}>
//                     <td>
//                       <div className="payment-ref">
//                         <strong>{payment.payment_reference}</strong>
//                         <small className="text-muted">ID: {payment._id.substring(0, 8)}</small>
//                       </div>
//                     </td>
//                     <td>
//                       <div className="user-info">
//                         <div className="user-avatar">
//                           {payment.influencer_name?.charAt(0) || 'U'}
//                         </div>
//                         <div className="user-details">
//                           <strong>{payment.influencer_name}</strong>
//                           <small>{payment.influencer_email || 'No email'}</small>
//                         </div>
//                       </div>
//                     </td>
//                     <td>
//                       <div className="campaign-info">
//                         <strong>{payment.campaign_title}</strong>
//                         <small>ID: {payment.campaign_id?.substring(0, 8)}</small>
//                       </div>
//                     </td>
//                     <td className="amount-cell">
//                       <strong>{formatCurrency(payment.amount)}</strong>
//                       <small>{payment.currency}</small>
//                     </td>
//                     <td>
//                       <span className={`status-badge ${getStatusBadgeClass(payment.status)}`}>
//                         {payment.status.replace('_', ' ').toUpperCase()}
//                       </span>
//                     </td>
//                     <td>
//                       <span className="payment-method">
//                         {payment.payment_method}
//                       </span>
//                     </td>
//                     <td>
//                       <div className="date-cell">
//                         {formatDate(payment.created_at)}
//                         <small>{new Date(payment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
//                       </div>
//                     </td>
//                     <td>
//                       <div className="action-buttons">
//                         <button 
//                           className="btn-icon"
//                           onClick={() => {
//                             setSelectedPayment(payment);
//                             // Show details modal or navigate
//                           }}
//                           title="View Details"
//                         >
//                           👁️
//                         </button>
//                         <button 
//                           className="btn-icon"
//                           onClick={() => {
//                             setSelectedPayment(payment);
//                             setShowStatusModal(true);
//                           }}
//                           title="Update Status"
//                         >
//                           ✏️
//                         </button>
//                         {payment.status === 'approved' && !payment.payout_id && (
//                           <button 
//                             className="btn-icon success"
//                             onClick={() => {
//                               // Add to payout
//                             }}
//                             title="Add to Payout"
//                           >
//                             ➕
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {/* Pagination */}
//             {totalPayments > limit && (
//               <div className="pagination">
//                 <button 
//                   className="btn btn-secondary"
//                   disabled={page === 1}
//                   onClick={() => setPage(page - 1)}
//                 >
//                   ← Previous
//                 </button>
//                 <span className="page-info">
//                   Page {page} of {Math.ceil(totalPayments / limit)}
//                   <span className="total-info"> ({totalPayments} total payments)</span>
//                 </span>
//                 <button 
//                   className="btn btn-secondary"
//                   disabled={page >= Math.ceil(totalPayments / limit)}
//                   onClick={() => setPage(page + 1)}
//                 >
//                   Next →
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Modals */}
//       {showCreateModal && (
//         <PaymentModal
//           onClose={() => setShowCreateModal(false)}
//           onSubmit={handleCreatePayment}
//         />
//       )}

//       {showStatusModal && selectedPayment && (
//         <StatusUpdateModal
//           payment={selectedPayment}
//           onClose={() => {
//             setShowStatusModal(false);
//             setSelectedPayment(null);
//           }}
//           onSubmit={(statusData) => handleStatusUpdate(selectedPayment._id, statusData)}
//         />
//       )}
//     </div>
//   );
// };

// export default PaymentsManagement;