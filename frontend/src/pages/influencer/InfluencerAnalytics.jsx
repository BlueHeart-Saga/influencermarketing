// // InfluencerAnalytics.jsx
// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Box,
//   Typography,
//   Grid,
//   Paper,
//   Card,
//   CardContent,
//   Alert,
//   Button,
//   IconButton,
//   MenuItem,
//   FormControl,
//   Select,
//   useTheme,
//   useMediaQuery,
//   Chip,
//   Tabs,
//   Tab,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Avatar,
//   CircularProgress,
//   Fab,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   LinearProgress,
//   List,
//   ListItem,
//   ListItemText,
//   ListItemIcon,
//   TextField,
//   InputAdornment,
// } from "@mui/material";
// import {
//   Refresh,
//   TrendingUp,
//   Campaign,
//   Assignment,
//   AttachMoney,
//   CheckCircle,
//   People,
//   Visibility,
//   Analytics,
//   DonutLarge,
//   BarChart,
//   Timeline,
//   Download,
//   Notifications,
//   Business,
//   CalendarToday,
//   AccountBalanceWallet,
//   Paid,
//   RequestPage,
//   Search
// } from "@mui/icons-material";

// // Currency formatter
// const formatCurrency = (amount, currency = "USD") => {
//   if (typeof amount !== 'number') {
//     amount = parseFloat(amount) || 0;
//   }
//   return new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: currency,
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(amount);
// };

// // Tab Panel Component
// const TabPanel = ({ children, value, index, ...other }) => {
//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`analytics-tabpanel-${index}`}
//       aria-labelledby={`analytics-tab-${index}`}
//       {...other}
//     >
//       {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
//     </div>
//   );
// };

// // Metric Card Component
// const MetricCard = ({ title, value, subtitle, icon, color, trend, onClick, isCurrency }) => {
//   const theme = useTheme();
  
//   const handleClick = () => {
//     if (onClick && typeof onClick === 'function') {
//       onClick();
//     }
//   };

//   return (
//     <Card 
//       sx={{ 
//         borderRadius: "20px", 
//         transition: "all 0.3s ease",
//         background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
//         border: `1px solid ${color}20`,
//         cursor: onClick ? 'pointer' : 'default',
//         "&:hover": {
//           transform: onClick ? "translateY(-8px)" : "none",
//           boxShadow: onClick ? `0 12px 35px ${color}25` : "none",
//         }
//       }}
//       elevation={0}
//       onClick={handleClick}
//     >
//       <CardContent sx={{ p: 3, position: 'relative' }}>
//         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
//           <Box sx={{ flex: 1 }}>
//             <Typography variant="h2" sx={{ 
//               fontWeight: 800, 
//               color: color,
//               background: `linear-gradient(45deg, ${color}, ${theme.palette.primary.main})`,
//               backgroundClip: "text",
//               WebkitBackgroundClip: "text",
//               WebkitTextFillColor: "transparent",
//               fontSize: { xs: '2rem', md: isCurrency ? '2.2rem' : '3rem' }
//             }}>
//               {value}
//             </Typography>
//             <Typography variant="h6" sx={{ 
//               color: "text.primary", 
//               fontWeight: 700, 
//               mt: 1,
//               fontSize: { xs: '0.9rem', md: '1rem' }
//             }}>
//               {title}
//             </Typography>
//           </Box>
//           <Box sx={{ 
//             backgroundColor: `${color}20`, 
//             borderRadius: "16px", 
//             p: 1.5,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center"
//           }}>
//             {React.cloneElement(icon, { 
//               sx: { 
//                 fontSize: 28, 
//                 color: color,
//                 filter: `drop-shadow(0 2px 4px ${color}40)`
//               } 
//             })}
//           </Box>
//         </Box>
        
//         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
//           <Typography variant="body2" sx={{ 
//             color: "text.secondary",
//             fontWeight: 500
//           }}>
//             {subtitle}
//           </Typography>
//           {trend && (
//             <Chip 
//               label={
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                   <TrendingUp sx={{ 
//                     fontSize: 16, 
//                     transform: trend.positive ? 'none' : 'rotate(180deg)',
//                     color: trend.positive ? theme.palette.success.main : theme.palette.error.main
//                   }} />
//                   {trend.value}
//                 </Box>
//               } 
//               size="small"
//               color={trend.positive ? "success" : "error"}
//               variant="filled"
//               sx={{ 
//                 fontWeight: 600,
//                 background: trend.positive ? 
//                   `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.light})` :
//                   `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.light})`
//               }}
//             />
//           )}
//         </Box>
//       </CardContent>
//     </Card>
//   );
// };

// // Donut Chart Component
// const SimpleDonutChart = ({ data, title }) => {
//   const theme = useTheme();
//   const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  
//   if (!data || data.length === 0) {
//     return (
//       <Paper sx={{ p: 3, borderRadius: "20px", height: '100%' }}>
//         <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
//           {title}
//         </Typography>
//         <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
//           <Typography variant="body2" color="text.secondary">
//             No data available
//           </Typography>
//         </Box>
//       </Paper>
//     );
//   }

//   return (
//     <Paper sx={{ 
//       p: 3, 
//       borderRadius: "20px",
//       background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
//       height: '100%',
//       display: 'flex',
//       flexDirection: 'column'
//     }}>
//       <Typography variant="h6" sx={{ 
//         mb: 3, 
//         fontWeight: 700,
//         display: 'flex',
//         alignItems: 'center',
//         gap: 1
//       }}>
//         <DonutLarge />
//         {title}
//       </Typography>
      
//       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
//         <Box sx={{ position: 'relative', width: 200, height: 200 }}>
//           <Box sx={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             width: 200,
//             height: 200,
//             borderRadius: '50%',
//             background: `conic-gradient(${data.map((item, index) => {
//               const percentage = (item.value / total) * 100;
//               const start = index === 0 ? 0 : data.slice(0, index).reduce((sum, i) => sum + (i.value / total) * 100, 0);
//               return `${item.color || '#ccc'} ${start}% ${start + percentage}%`;
//             }).join(', ')})`
//           }} />
          
//           <Box sx={{
//             position: 'absolute',
//             top: 20,
//             left: 20,
//             width: 160,
//             height: 160,
//             borderRadius: '50%',
//             backgroundColor: theme.palette.background.paper,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             flexDirection: 'column'
//           }}>
//             <Typography variant="h4" sx={{ fontWeight: 800 }}>
//               {total}
//             </Typography>
//             <Typography variant="body2" sx={{ color: 'text.secondary' }}>
//               Total
//             </Typography>
//           </Box>
//         </Box>
//       </Box>
      
//       <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
//         {data.map((item, index) => (
//           <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <Box sx={{ 
//               width: 12, 
//               height: 12, 
//               borderRadius: '50%', 
//               backgroundColor: item.color || '#ccc'
//             }} />
//             <Typography variant="body2">
//               {item.name}: {item.value} ({(item.value/total*100).toFixed(1)}%)
//             </Typography>
//           </Box>
//         ))}
//       </Box>
//     </Paper>
//   );
// };

// // Bar Chart Component
// const SimpleBarChart = ({ data, title }) => {
//   const theme = useTheme();
  
//   if (!data || data.length === 0) {
//     return (
//       <Paper sx={{ p: 3, borderRadius: "20px", height: '100%' }}>
//         <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
//           {title}
//         </Typography>
//         <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
//           <Typography variant="body2" color="text.secondary">
//             No data available
//           </Typography>
//         </Box>
//       </Paper>
//     );
//   }

//   const maxValue = Math.max(...data.map(item => item.earnings || 0));

//   return (
//     <Paper sx={{ 
//       p: 3, 
//       borderRadius: "20px",
//       background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
//       height: '100%',
//       display: 'flex',
//       flexDirection: 'column'
//     }}>
//       <Typography variant="h6" sx={{ 
//         mb: 3, 
//         fontWeight: 700,
//         display: 'flex',
//         alignItems: 'center',
//         gap: 1
//       }}>
//         <BarChart />
//         {title}
//       </Typography>
      
//       <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
//         {data.map((item, index) => (
//           <Box key={index}>
//             <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
//               {item.month}
//             </Typography>
            
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
//                 <AttachMoney sx={{ fontSize: 16, color: theme.palette.primary.main }} />
//                 <Typography variant="body2" sx={{ minWidth: 80 }}>
//                   {formatCurrency(item.earnings || 0)}
//                 </Typography>
//                 <LinearProgress 
//                   variant="determinate" 
//                   value={maxValue > 0 ? ((item.earnings || 0) / maxValue) * 100 : 0}
//                   sx={{ 
//                     flex: 1, 
//                     height: 8, 
//                     borderRadius: 4,
//                     backgroundColor: theme.palette.primary.light,
//                     '& .MuiLinearProgress-bar': {
//                       backgroundColor: theme.palette.primary.main
//                     }
//                   }}
//                 />
//               </Box>
//             </Box>
//           </Box>
//         ))}
//       </Box>
//     </Paper>
//   );
// };

// // RealTime Activity Component
// const RealTimeActivity = ({ activities = [] }) => {
//   const theme = useTheme();
  
//   if (!activities || activities.length === 0) {
//     return (
//       <Paper sx={{ p: 3, borderRadius: "20px", height: '100%' }}>
//         <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
//           Recent Activity
//         </Typography>
//         <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
//           <Typography variant="body2" color="text.secondary">
//             No recent activity
//           </Typography>
//         </Box>
//       </Paper>
//     );
//   }

//   return (
//     <Paper sx={{ 
//       p: 3, 
//       borderRadius: "20px",
//       background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
//       height: '100%'
//     }}>
//       <Typography variant="h6" sx={{ 
//         mb: 3, 
//         fontWeight: 700,
//         display: 'flex',
//         alignItems: 'center',
//         gap: 1
//       }}>
//         <Timeline />
//         Recent Activity
//       </Typography>
      
//       <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
//         {activities.map((activity, index) => (
//           <Box key={index} sx={{ 
//             display: 'flex', 
//             alignItems: 'center', 
//             gap: 2, 
//             p: 2, 
//             borderBottom: `1px solid ${theme.palette.divider}`,
//             '&:last-child': { borderBottom: 'none' }
//           }}>
//             <Avatar sx={{ 
//               width: 40, 
//               height: 40,
//               background: `linear-gradient(45deg, ${activity.color || theme.palette.primary.main}, ${activity.color || theme.palette.primary.main}80)`
//             }}>
//               {activity.icon || <Notifications />}
//             </Avatar>
//             <Box sx={{ flex: 1 }}>
//               <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                 {activity.message || 'Unknown activity'}
//               </Typography>
//               <Typography variant="caption" sx={{ color: 'text.secondary' }}>
//                 {activity.time || 'Unknown time'}
//               </Typography>
//             </Box>
//             <Chip 
//               label={activity.status || 'Unknown'} 
//               size="small"
//               color={
//                 activity.status === 'Completed' || activity.status === 'Paid' ? 'success' : 
//                 activity.status === 'Pending' ? 'warning' : 'primary'
//               }
//             />
//           </Box>
//         ))}
//       </Box>
//     </Paper>
//   );
// };

// // Earnings Table Component
// const EarningsTable = ({ earnings = [], onEarningClick }) => {
//   const theme = useTheme();
  
//   const handleRowClick = (earning) => {
//     if (onEarningClick && typeof onEarningClick === 'function') {
//       onEarningClick(earning);
//     }
//   };

//   if (!earnings || earnings.length === 0) {
//     return (
//       <Paper sx={{ p: 3, borderRadius: "20px" }}>
//         <Typography variant="h6" sx={{ fontWeight: 700 }}>
//           Earnings History
//         </Typography>
//         <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
//           <Typography variant="body2" color="text.secondary">
//             No earnings data available
//           </Typography>
//         </Box>
//       </Paper>
//     );
//   }

//   return (
//     <Paper sx={{ 
//       borderRadius: "20px",
//       background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
//       overflow: 'hidden'
//     }}>
//       <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
//         <Typography variant="h6" sx={{ fontWeight: 700 }}>
//           Earnings History
//         </Typography>
//       </Box>
      
//       <TableContainer>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell sx={{ fontWeight: 700 }}>Campaign</TableCell>
//               <TableCell sx={{ fontWeight: 700 }} align="center">Brand</TableCell>
//               <TableCell sx={{ fontWeight: 700 }} align="center">Amount</TableCell>
//               <TableCell sx={{ fontWeight: 700 }} align="center">Status</TableCell>
//               <TableCell sx={{ fontWeight: 700 }} align="center">Earned Date</TableCell>
//               <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {earnings.map((earning, index) => (
//               <TableRow 
//                 key={earning._id || index} 
//                 hover 
//                 sx={{ 
//                   cursor: 'pointer',
//                   transition: 'all 0.3s ease',
//                   '&:hover': {
//                     backgroundColor: `${theme.palette.primary.main}08`,
//                   }
//                 }}
//                 onClick={() => handleRowClick(earning)}
//               >
//                 <TableCell>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                     <Avatar sx={{ 
//                       width: 40, 
//                       height: 40,
//                       background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
//                     }}>
//                       <Campaign />
//                     </Avatar>
//                     <Box>
//                       <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
//                         {earning.campaign_title || 'Unknown Campaign'}
//                       </Typography>
//                       <Typography variant="caption" sx={{ color: 'text.secondary' }}>
//                         {earning.category || 'General'}
//                       </Typography>
//                     </Box>
//                   </Box>
//                 </TableCell>
//                 <TableCell align="center">
//                   <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                     {earning.brand_name || 'Unknown Brand'}
//                   </Typography>
//                 </TableCell>
//                 <TableCell align="center">
//                   <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                     {formatCurrency(earning.amount || 0, earning.currency)}
//                   </Typography>
//                 </TableCell>
//                 <TableCell align="center">
//                   <Chip 
//                     label={earning.status || 'Unknown'} 
//                     size="small"
//                     color={
//                       earning.status === "paid" ? "success" :
//                       earning.status === "pending" ? "warning" : "default"
//                     }
//                     sx={{ fontWeight: 600 }}
//                   />
//                 </TableCell>
//                 <TableCell align="center">
//                   <Typography variant="body2">
//                     {earning.earned_at ? new Date(earning.earned_at).toLocaleDateString() : 'Unknown'}
//                   </Typography>
//                 </TableCell>
//                 <TableCell align="center">
//                   <IconButton size="small" color="primary">
//                     <Visibility />
//                   </IconButton>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Paper>
//   );
// };

// // Main Component
// const InfluencerAnalytics = () => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
//   // State management
//   const [timeRange, setTimeRange] = useState("30d");
//   const [activeTab, setActiveTab] = useState(0);
//   const [selectedEarning, setSelectedEarning] = useState(null);
//   const [earningDialogOpen, setEarningDialogOpen] = useState(false);
//   const [lastRefresh, setLastRefresh] = useState(new Date());
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
  
//   // Data states
//   const [earnings, setEarnings] = useState([]);
//   const [applications, setApplications] = useState([]);
//   const [withdrawals, setWithdrawals] = useState([]);

//   // Safe data fetching
//   const fetchData = async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 1500));
      
//       // Mock data with safe defaults
//       const mockEarnings = [
//         {
//           _id: "1",
//           campaign_title: "Summer Fashion Campaign",
//           brand_name: "Fashion Co",
//           amount: 1500,
//           currency: "USD",
//           status: "paid",
//           earned_at: "2024-01-15",
//           paid_at: "2024-01-20",
//           category: "Fashion"
//         },
//         {
//           _id: "2",
//           campaign_title: "Tech Product Launch",
//           brand_name: "Tech Innovations",
//           amount: 2500,
//           currency: "USD",
//           status: "pending",
//           earned_at: "2024-01-20",
//           category: "Technology"
//         },
//         {
//           _id: "3",
//           campaign_title: "Beauty Product Review",
//           brand_name: "Beauty Corp",
//           amount: 1200,
//           currency: "USD",
//           status: "paid",
//           earned_at: "2024-01-10",
//           paid_at: "2024-01-12",
//           category: "Beauty"
//         }
//       ];

//       const mockApplications = [
//         {
//           campaign_id: "1",
//           campaign_title: "Summer Fashion Campaign",
//           brand_name: "Fashion Co",
//           budget: 5000,
//           currency: "USD",
//           status: "approved",
//           applied_at: "2024-01-10",
//           category: "Fashion"
//         },
//         {
//           campaign_id: "2",
//           campaign_title: "Tech Product Launch",
//           brand_name: "Tech Innovations",
//           budget: 10000,
//           currency: "USD",
//           status: "pending",
//           applied_at: "2024-01-15",
//           category: "Technology"
//         },
//         {
//           campaign_id: "3",
//           campaign_title: "Fitness App Promotion",
//           brand_name: "Health Tech",
//           budget: 3000,
//           currency: "USD",
//           status: "rejected",
//           applied_at: "2024-01-05",
//           category: "Health"
//         }
//       ];

//       const mockWithdrawals = [
//         {
//           _id: "1",
//           amount: 1000,
//           status: "processed",
//           requested_at: "2024-01-18",
//           processed_at: "2024-01-20"
//         },
//         {
//           _id: "2",
//           amount: 500,
//           status: "pending",
//           requested_at: "2024-01-25"
//         }
//       ];

//       setEarnings(mockEarnings);
//       setApplications(mockApplications);
//       setWithdrawals(mockWithdrawals);
      
//     } catch (err) {
//       console.error('Error fetching data:', err);
//       setError("Failed to load data. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Initial data load
//   useEffect(() => {
//     fetchData();
//   }, []);

//   // Safe metric calculations
//   const metrics = useMemo(() => {
//     try {
//       const totalEarnings = earnings.reduce((sum, e) => sum + (e.amount || 0), 0);
//       const availableBalance = earnings
//         .filter(e => e.status === 'paid')
//         .reduce((sum, e) => sum + (e.amount || 0), 0);
//       const pendingEarnings = earnings
//         .filter(e => e.status === 'pending')
//         .reduce((sum, e) => sum + (e.amount || 0), 0);
      
//       const totalApplications = applications.length;
//       const approvedApplications = applications.filter(a => a.status === 'approved').length;
//       const pendingApplications = applications.filter(a => a.status === 'pending').length;
//       const activeCampaigns = applications.filter(a => a.status === 'approved').length;
      
//       const approvalRate = totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0;
//       const totalWithdrawals = withdrawals.length;
//       const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;

//       const trends = {
//         totalEarnings: { value: "+15%", positive: true },
//         availableBalance: { value: "+8%", positive: true },
//         approvalRate: { value: "+5%", positive: true },
//         activeCampaigns: { value: "+12%", positive: true }
//       };

//       return {
//         totalEarnings,
//         availableBalance,
//         pendingEarnings,
//         totalApplications,
//         approvedApplications,
//         pendingApplications,
//         activeCampaigns,
//         approvalRate,
//         totalWithdrawals,
//         pendingWithdrawals,
//         trends
//       };
//     } catch (error) {
//       console.error('Error calculating metrics:', error);
//       return {
//         totalEarnings: 0,
//         availableBalance: 0,
//         pendingEarnings: 0,
//         totalApplications: 0,
//         approvedApplications: 0,
//         pendingApplications: 0,
//         activeCampaigns: 0,
//         approvalRate: 0,
//         totalWithdrawals: 0,
//         pendingWithdrawals: 0,
//         trends: {}
//       };
//     }
//   }, [earnings, applications, withdrawals]);

//   // Safe chart data preparation
//   const earningsStatusData = useMemo(() => {
//     try {
//       return [
//         { name: "Paid", value: earnings.filter(e => e.status === "paid").length, color: "#00C49F" },
//         { name: "Pending", value: earnings.filter(e => e.status === "pending").length, color: "#FFBB28" },
//       ];
//     } catch (error) {
//       return [];
//     }
//   }, [earnings]);

//   const applicationStatusData = useMemo(() => {
//     try {
//       return [
//         { name: "Approved", value: applications.filter(a => a.status === "approved").length, color: "#00C49F" },
//         { name: "Pending", value: applications.filter(a => a.status === "pending").length, color: "#FFBB28" },
//         { name: "Rejected", value: applications.filter(a => a.status === "rejected").length, color: "#FF8042" },
//       ];
//     } catch (error) {
//       return [];
//     }
//   }, [applications]);

//   const earningsChartData = useMemo(() => {
//     return [
//       { month: "Jan", earnings: 1500 },
//       { month: "Feb", earnings: 2200 },
//       { month: "Mar", earnings: 1800 },
//       { month: "Apr", earnings: 3000 },
//       { month: "May", earnings: 2500 },
//       { month: "Jun", earnings: 4000 },
//     ];
//   }, []);

//   const realTimeActivities = useMemo(() => {
//     return [
//       { 
//         message: "New payment received from Fashion Co", 
//         time: "5 minutes ago", 
//         status: "Paid", 
//         color: theme.palette.success.main,
//         icon: <Paid />
//       },
//       { 
//         message: "Application approved for Tech Campaign", 
//         time: "2 hours ago", 
//         status: "Approved", 
//         color: theme.palette.primary.main,
//         icon: <CheckCircle />
//       },
//       { 
//         message: "Withdrawal request processed", 
//         time: "1 day ago", 
//         status: "Completed", 
//         color: theme.palette.info.main,
//         icon: <AccountBalanceWallet />
//       }
//     ];
//   }, [theme]);

//   // Safe event handlers
//   const handleEarningClick = (earning) => {
//     if (earning && typeof earning === 'object') {
//       setSelectedEarning(earning);
//       setEarningDialogOpen(true);
//     }
//   };

//   const handleRefresh = () => {
//     fetchData();
//     setLastRefresh(new Date());
//   };

//   const handleTabChange = (event, newValue) => {
//     setActiveTab(newValue);
//   };

//   const handleSearchChange = (event) => {
//     setSearchTerm(event.target.value);
//   };

//   const handleTimeRangeChange = (event) => {
//     setTimeRange(event.target.value);
//   };

//   // Filter data safely
//   const filteredEarnings = useMemo(() => {
//     if (!searchTerm) return earnings;
    
//     try {
//       return earnings.filter(earning =>
//         (earning.campaign_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (earning.brand_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (earning.status || '').toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     } catch (error) {
//       return earnings;
//     }
//   }, [earnings, searchTerm]);

//   // Loading state
//   if (loading) {
//     return (
//       <Box sx={{ 
//         display: "flex", 
//         flexDirection: "column", 
//         justifyContent: "center", 
//         alignItems: "center", 
//         minHeight: "60vh",
//         background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
//         p: 3
//       }}>
//         <CircularProgress 
//           size={60} 
//           thickness={4}
//           sx={{ 
//             mb: 3,
//             color: theme.palette.primary.main,
//           }} 
//         />
//         <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
//           Loading Influencer Analytics
//         </Typography>
//         <Typography variant="body2" sx={{ color: "text.secondary", textAlign: 'center' }}>
//           Gathering your earnings and campaign data...
//         </Typography>
//       </Box>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <Box sx={{ 
//         display: "flex", 
//         flexDirection: "column", 
//         justifyContent: "center", 
//         alignItems: "center", 
//         minHeight: "60vh",
//         p: 3,
//         background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
//       }}>
//         <Alert 
//           severity="error" 
//           sx={{ 
//             mb: 3, 
//             width: "100%", 
//             maxWidth: 500,
//             borderRadius: 3,
//           }}
//           action={
//             <Button color="inherit" size="small" onClick={handleRefresh}>
//               RETRY
//             </Button>
//           }
//         >
//           {error}
//         </Alert>
//         <Button
//           variant="contained"
//           onClick={handleRefresh}
//           startIcon={<Refresh />}
//           sx={{
//             borderRadius: 3,
//             px: 4,
//             py: 1.5,
//             fontWeight: 600,
//           }}
//         >
//           Try Again
//         </Button>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ 
//       minHeight: "100vh",
//       background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
//       p: { xs: 1, sm: 2, md: 3 }
//     }}>
//       {/* Header */}
//       <Box sx={{ 
//         display: "flex", 
//         justifyContent: "space-between", 
//         alignItems: { xs: "flex-start", sm: "center" },
//         flexDirection: { xs: "column", sm: "row" },
//         mb: 4,
//         gap: 2
//       }}>
//         <Box>
//           <Typography variant="h3" sx={{ 
//             fontWeight: 800, 
//             background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
//             backgroundClip: "text",
//             WebkitBackgroundClip: "text",
//             WebkitTextFillColor: "transparent",
//             mb: 1,
//             fontSize: { xs: '2rem', md: '3rem' }
//           }}>
//             Influencer Analytics
//           </Typography>
//           <Typography variant="body1" sx={{ 
//             color: "text.secondary",
//             fontSize: { xs: '0.9rem', md: '1rem' }
//           }}>
//             Track your earnings, campaign performance, and growth • Last updated: {lastRefresh.toLocaleTimeString()}
//           </Typography>
//         </Box>
        
//         <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: 'wrap' }}>
//           <TextField
//             size="small"
//             placeholder="Search earnings..."
//             value={searchTerm}
//             onChange={handleSearchChange}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <Search />
//                 </InputAdornment>
//               ),
//             }}
//             sx={{ 
//               minWidth: 200,
//               background: 'white',
//               borderRadius: 3
//             }}
//           />
          
//           <FormControl size="small" sx={{ minWidth: 140 }}>
//             <Select
//               value={timeRange}
//               onChange={handleTimeRangeChange}
//               sx={{ 
//                 borderRadius: 3,
//                 background: 'white',
//                 fontWeight: 600
//               }}
//             >
//               <MenuItem value="7d">Last 7 days</MenuItem>
//               <MenuItem value="30d">Last 30 days</MenuItem>
//               <MenuItem value="90d">Last 90 days</MenuItem>
//               <MenuItem value="all">All time</MenuItem>
//             </Select>
//           </FormControl>
          
//           <IconButton 
//             onClick={handleRefresh}
//             sx={{ 
//               backgroundColor: "white",
//               boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
//             }}
//           >
//             <Refresh />
//           </IconButton>
//         </Box>
//       </Box>

//       {/* Summary Metrics */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         <Grid item xs={12} sm={6} lg={3}>
//           <MetricCard
//             title="Total Earnings"
//             value={formatCurrency(metrics.totalEarnings)}
//             subtitle={`${metrics.pendingEarnings > 0 ? formatCurrency(metrics.pendingEarnings) + ' pending' : 'All payments cleared'}`}
//             icon={<AccountBalanceWallet />}
//             color="#2196F3"
//             trend={metrics.trends.totalEarnings}
//             onClick={() => setActiveTab(1)}
//             isCurrency={true}
//           />
//         </Grid>
        
//         <Grid item xs={12} sm={6} lg={3}>
//           <MetricCard
//             title="Available Balance"
//             value={formatCurrency(metrics.availableBalance)}
//             subtitle="Ready for withdrawal"
//             icon={<Paid />}
//             color="#4CAF50"
//             trend={metrics.trends.availableBalance}
//             onClick={() => setActiveTab(1)}
//             isCurrency={true}
//           />
//         </Grid>
        
//         <Grid item xs={12} sm={6} lg={3}>
//           <MetricCard
//             title="Campaign Applications"
//             value={metrics.totalApplications}
//             subtitle={`${metrics.approvedApplications} approved`}
//             icon={<Campaign />}
//             color="#FF9800"
//             trend={metrics.trends.activeCampaigns}
//             onClick={() => setActiveTab(2)}
//           />
//         </Grid>
        
//         <Grid item xs={12} sm={6} lg={3}>
//           <MetricCard
//             title="Approval Rate"
//             value={`${metrics.approvalRate.toFixed(1)}%`}
//             subtitle="Application success rate"
//             icon={<CheckCircle />}
//             color="#9C27B0"
//             trend={metrics.trends.approvalRate}
//           />
//         </Grid>
//       </Grid>

//       {/* Tabs */}
//       <Paper sx={{ 
//         mb: 3, 
//         borderRadius: "20px",
//         background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
//       }}>
//         <Tabs 
//           value={activeTab} 
//           onChange={handleTabChange}
//           sx={{ 
//             px: 2,
//             pt: 2,
//             '& .MuiTab-root': {
//               fontWeight: 600,
//               fontSize: '0.9rem'
//             }
//           }}
//           centered
//         >
//           <Tab icon={<Analytics />} label="Overview" />
//           <Tab icon={<AccountBalanceWallet />} label="Earnings" />
//           <Tab icon={<Campaign />} label="Applications" />
//           <Tab icon={<Timeline />} label="Activity" />
//         </Tabs>

//         {/* Tab Panels */}
//         <TabPanel value={activeTab} index={0}>
//           <Grid container spacing={3}>
//             <Grid item xs={12} md={6} lg={4}>
//               <SimpleDonutChart 
//                 data={earningsStatusData} 
//                 title="Earnings Status"
//               />
//             </Grid>

//             <Grid item xs={12} md={6} lg={4}>
//               <SimpleDonutChart 
//                 data={applicationStatusData} 
//                 title="Application Status"
//               />
//             </Grid>

//             <Grid item xs={12} md={6} lg={4}>
//               <RealTimeActivity activities={realTimeActivities} />
//             </Grid>

//             <Grid item xs={12} lg={8}>
//               <SimpleBarChart 
//                 data={earningsChartData}
//                 title="Monthly Earnings Trend"
//               />
//             </Grid>

//             <Grid item xs={12} lg={4}>
//               <Grid container spacing={2}>
//                 {[
//                   { value: metrics.totalApplications, label: "Total Applications", color: theme.palette.primary.main },
//                   { value: formatCurrency(metrics.totalEarnings), label: "Total Earnings", color: theme.palette.success.main },
//                   { value: `${metrics.approvalRate.toFixed(1)}%`, label: "Approval Rate", color: theme.palette.warning.main },
//                   { value: metrics.pendingWithdrawals, label: "Pending Withdrawals", color: theme.palette.info.main }
//                 ].map((item, index) => (
//                   <Grid item xs={12} sm={6} lg={12} key={index}>
//                     <Paper sx={{ p: 3, borderRadius: "20px", textAlign: "center" }}>
//                       <Typography variant="h4" sx={{ fontWeight: 800, color: item.color }}>
//                         {item.value}
//                       </Typography>
//                       <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
//                         {item.label}
//                       </Typography>
//                     </Paper>
//                   </Grid>
//                 ))}
//               </Grid>
//             </Grid>

//             <Grid item xs={12}>
//               <EarningsTable 
//                 earnings={filteredEarnings.slice(0, 5)} 
//                 onEarningClick={handleEarningClick}
//               />
//             </Grid>
//           </Grid>
//         </TabPanel>

//         <TabPanel value={activeTab} index={1}>
//           <Grid container spacing={3}>
//             <Grid item xs={12}>
//               <EarningsTable 
//                 earnings={filteredEarnings} 
//                 onEarningClick={handleEarningClick}
//               />
//             </Grid>
//           </Grid>
//         </TabPanel>

//         <TabPanel value={activeTab} index={2}>
//           <Grid container spacing={3}>
//             <Grid item xs={12}>
//               <Paper sx={{ p: 3, borderRadius: "20px" }}>
//                 <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
//                   Campaign Applications ({applications.length})
//                 </Typography>
//                 <List>
//                   {applications.map((app, index) => (
//                     <ListItem key={app.campaign_id || index} divider={index < applications.length - 1}>
//                       <ListItemIcon>
//                         <Avatar sx={{ 
//                           background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
//                         }}>
//                           <Business />
//                         </Avatar>
//                       </ListItemIcon>
//                       <ListItemText
//                         primary={app.campaign_title || "Unknown Campaign"}
//                         secondary={`Brand: ${app.brand_name || "Unknown"} • Status: ${app.status || "Unknown"} • Applied: ${app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "Unknown"}`}
//                       />
//                       <Chip 
//                         label={app.status || "Unknown"} 
//                         color={
//                           app.status === "approved" ? "success" :
//                           app.status === "pending" ? "warning" : "error"
//                         }
//                         size="small"
//                       />
//                     </ListItem>
//                   ))}
//                 </List>
//               </Paper>
//             </Grid>
//           </Grid>
//         </TabPanel>

//         <TabPanel value={activeTab} index={3}>
//           <Grid container spacing={3}>
//             <Grid item xs={12}>
//               <RealTimeActivity activities={realTimeActivities} />
//             </Grid>
//           </Grid>
//         </TabPanel>
//       </Paper>

//       {/* Earning Detail Dialog */}
//       <Dialog 
//         open={earningDialogOpen} 
//         onClose={() => setEarningDialogOpen(false)}
//         maxWidth="md"
//         fullWidth
//       >
//         <DialogTitle sx={{ fontWeight: 700 }}>
//           Earning Details
//         </DialogTitle>
//         <DialogContent>
//           {selectedEarning && (
//             <Grid container spacing={3} sx={{ mt: 1 }}>
//               <Grid item xs={12} md={6}>
//                 <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
//                   Payment Information
//                 </Typography>
//                 <List dense>
//                   <ListItem>
//                     <ListItemIcon><Business /></ListItemIcon>
//                     <ListItemText 
//                       primary="Brand" 
//                       secondary={selectedEarning.brand_name || "Unknown"} 
//                     />
//                   </ListItem>
//                   <ListItem>
//                     <ListItemIcon><AccountBalanceWallet /></ListItemIcon>
//                     <ListItemText 
//                       primary="Amount" 
//                       secondary={formatCurrency(selectedEarning.amount, selectedEarning.currency)} 
//                     />
//                   </ListItem>
//                   <ListItem>
//                     <ListItemIcon><CalendarToday /></ListItemIcon>
//                     <ListItemText 
//                       primary="Earned Date" 
//                       secondary={selectedEarning.earned_at ? new Date(selectedEarning.earned_at).toLocaleDateString() : "Unknown"} 
//                     />
//                   </ListItem>
//                 </List>
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
//                   Campaign Details
//                 </Typography>
//                 <List dense>
//                   <ListItem>
//                     <ListItemIcon><Campaign /></ListItemIcon>
//                     <ListItemText 
//                       primary="Campaign" 
//                       secondary={selectedEarning.campaign_title || "Unknown"} 
//                     />
//                   </ListItem>
//                   <ListItem>
//                     <ListItemIcon><Assignment /></ListItemIcon>
//                     <ListItemText 
//                       primary="Category" 
//                       secondary={selectedEarning.category || "General"} 
//                     />
//                   </ListItem>
//                   <ListItem>
//                     <ListItemIcon><Paid /></ListItemIcon>
//                     <ListItemText 
//                       primary="Status" 
//                       secondary={
//                         <Chip 
//                           label={selectedEarning.status || "Unknown"} 
//                           size="small"
//                           color={selectedEarning.status === "paid" ? "success" : "warning"}
//                         />
//                       } 
//                     />
//                   </ListItem>
//                 </List>
//               </Grid>
//             </Grid>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setEarningDialogOpen(false)}>
//             Close
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default InfluencerAnalytics;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp, Users, DollarSign, Target, BarChart3, PieChart as PieChartIcon,
   Download, Eye, Star,
  Clock, Activity, HardDrive, FileText,
  Percent, TrendingDown, RefreshCw, Trophy,
  AlertCircle,
  Heart, Image as ImageIcon,
  Video as VideoIcon, Camera as CameraIcon,
  CheckSquare, Database,
  Maximize2, Minimize2,
} from 'lucide-react';
import '../../style/InfluencerAnalytics.css';
import API_BASE_URL from '../../config/api';

// Constants
const STATUS_COLORS = {
  pending: '#F59E0B',
  approved: '#ae10b9',
  rejected: '#EF4444',
  contracted: '#3B82F6',
  completed: '#10ce0d',
  cancelled: '#6B7280',
  media_submitted: '#06B6D4'
};

const METRIC_COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  teal: '#14B8A6',
  orange: '#F97316',
  indigo: '#6366F1'
};

const CHART_COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE'
];

// Utility Functions
const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '$0';
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  return formatter.format(amount);
};

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatPercentage = (value) => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(1)}%`;
};

const formatDate = (dateString, format = 'short') => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  
  if (format === 'full') {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else if (format === 'month') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const calculateChange = (current, previous) => {
  if (!previous || previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

// Chart Components
const CustomTooltip = ({ active, payload, label, valueFormatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="analytics-custom-tooltip">
        <p className="analytics-tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="analytics-tooltip-item">
            <span className="analytics-tooltip-dot" style={{ backgroundColor: entry.color }}></span>
            <span className="analytics-tooltip-name">{entry.name}: </span>
            <span className="analytics-tooltip-value">
              {valueFormatter ? valueFormatter(entry.value) : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const LoadingSpinner = () => (
  <div className="brand-dashboard-loader">
          <div className="brand-loader-spinner"></div>
          <p>Loading your analytics reports...</p>
        </div>
);

const ErrorDisplay = ({ message, onRetry }) => (
  <div className="analytics-error-wrapper">
    <AlertCircle size={48} className="analytics-error-icon" />
    <h3 className="analytics-error-title">Unable to Load Data</h3>
    <p className="analytics-error-message">{message}</p>
    <div className="analytics-error-actions">
      <button onClick={onRetry} className="analytics-error-retry">
        <RefreshCw size={16} />
        Try Again
      </button>
      <button onClick={() => window.location.reload()} className="analytics-error-reload">
        Reload Page
      </button>
    </div>
  </div>
);

// Metric Card Component
const MetricCard = ({ title, value, subtitle, icon, color, change, format = 'number', trendData }) => (
  <div className="analytics-metric-card">
    <div className="analytics-metric-header">
      <div className="analytics-metric-icon" style={{ color }}>
        {icon}
      </div>
      <div className="analytics-metric-title">{title}</div>
    </div>
    <div className="analytics-metric-value">
      {format === 'currency' ? formatCurrency(value) : 
       format === 'percentage' ? formatPercentage(value) :
       format === 'number' ? formatNumber(value) : value}
    </div>
    {subtitle && (
      <div className="analytics-metric-subtitle">{subtitle}</div>
    )}
    {change !== undefined && change !== null && (
      <div className="analytics-metric-change">
        <span className={`analytics-change-indicator ${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(change).toFixed(1)}%
        </span>
        <span className="analytics-change-label">vs previous period</span>
      </div>
    )}
    {trendData && trendData.length > 0 && (
      <div className="analytics-metric-trend">
        <div className="analytics-trend-line">
          {trendData.map((val, idx) => (
            <div 
              key={idx}
              className="analytics-trend-point"
              style={{
                height: `${Math.min(100, (val / Math.max(...trendData)) * 100)}%`,
                backgroundColor: change >= 0 ? METRIC_COLORS.success : METRIC_COLORS.danger
              }}
            />
          ))}
        </div>
      </div>
    )}
  </div>
);

// Status Badge Component
const StatusBadge = ({ status, size = 'medium' }) => (
  <span 
    className={`analytics-status-badge analytics-status-${status} analytics-size-${size}`}
    style={{ backgroundColor: STATUS_COLORS[status] }}
  >
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

// Time Range Selector
const TimeRangeSelector = ({ value, onChange }) => {
  const ranges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_90_days', label: 'Last 90 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_quarter', label: 'This Quarter' },
    { value: 'last_quarter', label: 'Last Quarter' },
    { value: 'this_year', label: 'This Year' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'all_time', label: 'All Time' }
  ];

  return (
    <div className="analytics-time-range-selector">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="analytics-range-select"
      >
        {ranges.map(range => (
          <option key={range.value} value={range.value}>
            {range.label}
          </option>
        ))}
      </select>
    </div>
  );
};



const resolveProfileImage = (imageValue) => {
  if (!imageValue) {
    return `${API_BASE_URL}/static/defaults/influencer-avatar.png`;
  }

  if (typeof imageValue === "string" && imageValue.startsWith("/static/")) {
    return `${API_BASE_URL}${imageValue}`;
  }

  if (imageValue.startsWith("http")) return imageValue;

  return `${API_BASE_URL}/profiles/image/${imageValue}`;
};


// Main Component
const InfluencerAnalyticsEnhanced = () => {
  // State Management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('last_30_days');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  const [applicationsData, setApplicationsData] = useState(null);
  const [campaignsData, setCampaignsData] = useState([]);
  const [mediaData, setMediaData] = useState(null);
  const [growthData, setGrowthData] = useState(null);
  const [quickStats, setQuickStats] = useState(null);
  
  // UI States
  const [expandedCharts, setExpandedCharts] = useState({});
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [profileSummary, setProfileSummary] = useState(null);
  
  // API Configuration
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('access_token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }, []);

  const fetchProfileSummary = async () => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/profiles/me`,
      getAuthHeaders()
    );

    if (res.data?.type === "influencer") {
      setProfileSummary({
        username: res.data.profile.username || res.data.profile.full_name,
        profile_picture: res.data.profile.profile_picture
      });
    }
  } catch (err) {
    console.error("Profile summary fetch error:", err);
  }
};

useEffect(() => {
  fetchProfileSummary();
}, []);


const sidebarProfile = useMemo(() => {
  return dashboardData?.profile_summary || profileSummary || null;
}, [dashboardData, profileSummary]);


  const profileName = useMemo(() => {
  return sidebarProfile?.username || "Influencer";
}, [sidebarProfile]);



  // API Functions
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/influencer/analytics/dashboard`,
        { 
          ...getAuthHeaders(),
          params: { time_range: timeRange }
        }
      );
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformance = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/influencer/analytics/performance`,
        {
          ...getAuthHeaders(),
          params: { time_range: timeRange }
        }
      );
      setPerformanceData(response.data);
    } catch (err) {
      console.error('Performance fetch error:', err);
    }
  };

  const fetchEarnings = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/influencer/analytics/earnings-trends`,
        {
          ...getAuthHeaders(),
          params: { 
            period: timeRange,
            group_by: getGroupByFromTimeRange(timeRange)
          }
        }
      );
      setEarningsData(response.data);
    } catch (err) {
      console.error('Earnings fetch error:', err);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/influencer/analytics/applications/analysis`,
        {
          ...getAuthHeaders(),
          params: { time_range: timeRange }
        }
      );
      setApplicationsData(response.data);
    } catch (err) {
      console.error('Applications fetch error:', err);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/influencer/analytics/campaigns`,
        getAuthHeaders()
      );
      setCampaignsData(response.data);
    } catch (err) {
      console.error('Campaigns fetch error:', err);
    }
  };

  const fetchMediaAnalytics = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/influencer/analytics/media`,
        getAuthHeaders()
      );
      setMediaData(response.data);
    } catch (err) {
      console.error('Media analytics fetch error:', err);
    }
  };

  const fetchGrowthData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/influencer/analytics/comprehensive-report`,
        {
          ...getAuthHeaders(),
          params: { time_range: 'last_90_days' }
        }
      );
      setGrowthData(response.data);
    } catch (err) {
      console.error('Growth data fetch error:', err);
    }
  };

  const fetchQuickStats = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/influencer/analytics/quick-stats`,
        getAuthHeaders()
      );
      setQuickStats(response.data);
    } catch (err) {
      console.error('Quick stats fetch error:', err);
    }
  };

  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchDashboard(),
      fetchPerformance(),
      fetchEarnings(),
      fetchApplications(),
      fetchCampaigns(),
      fetchMediaAnalytics(),
      fetchGrowthData(),
      fetchQuickStats()
    ]);
  }, [timeRange]);

  // Helper Functions
  const getGroupByFromTimeRange = (range) => {
    if (range.includes('today') || range.includes('yesterday')) return 'hour';
    if (range.includes('7_days')) return 'day';
    if (range.includes('30_days') || range.includes('month')) return 'week';
    if (range.includes('90_days') || range.includes('quarter')) return 'week';
    if (range.includes('year')) return 'month';
    return 'month';
  };

  const handleExport = async (format, reportType) => {
    try {
      setExporting(true);
      const response = await axios.get(
        `${API_BASE_URL}/influencer/analytics/export`,
        {
          ...getAuthHeaders(),
          params: { format, report_type: reportType }
        }
      );

      const blob = new Blob(
        [format === 'json' ? JSON.stringify(response.data, null, 2) : response.data.content || response.data],
        { type: format === 'json' ? 'application/json' : 'text/csv' }
      );
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `influencer-${reportType}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const clearCache = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/influencer/analytics/clear-cache`,
        {},
        getAuthHeaders()
      );
      await fetchAllData();
      alert('Cache cleared successfully');
    } catch (err) {
      console.error('Cache clear error:', err);
      alert('Failed to clear cache');
    }
  };

  // Effects
  useEffect(() => {
    fetchAllData();
  }, [timeRange, fetchAllData]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchDashboard();
        fetchQuickStats();
      }
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Memoized Computed Data
  const computedMetrics = useMemo(() => {
    if (!dashboardData) return null;
    
    const { performance_score, application_stats, financial_summary, engagement_metrics } = dashboardData;
    
    return {
      overallScore: performance_score?.overall || 0,
      earningsTotal: financial_summary?.total_earnings || 0,
      availableBalance: financial_summary?.available_balance || 0,
      pendingEarnings: financial_summary?.pending_earnings || 0,
      totalApplications: application_stats?.total || 0,
      approvalRate: application_stats?.approval_rate || 0,
      successRate: application_stats?.success_rate || 0,
      engagementScore: engagement_metrics?.engagement_score || 0,
      activeCampaigns: dashboardData?.campaign_performance?.active_campaigns || 0,
      completionRate: dashboardData?.campaign_performance?.completion_rate || 0
    };
  }, [dashboardData]);

  const earningsChartData = useMemo(() => {
    if (!earningsData) return [];
    return earningsData.map(item => ({
      ...item,
      formattedAmount: formatCurrency(item.total_amount),
      formattedAverage: formatCurrency(item.average_amount)
    }));
  }, [earningsData]);

  const applicationsByStatus = useMemo(() => {
    if (!applicationsData) return [];
    return Object.entries(applicationsData?.status_distribution || {}).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: STATUS_COLORS[status]
    }));
  }, [applicationsData]);

  const campaignPerformanceData = useMemo(() => {
    if (!dashboardData?.campaign_performance) return [];
    return [
      { name: 'Completed', value: dashboardData.campaign_performance.completed_campaigns || 0 },
      { name: 'Active', value: dashboardData.campaign_performance.active_campaigns || 0 },
      { name: 'Pending', value: dashboardData.campaign_performance.pending_campaigns || 0 }
    ];
  }, [dashboardData]);

  // Tab Components
  const DashboardTab = () => {
    if (!dashboardData || !computedMetrics) return <LoadingSpinner />;

    return (
      <div className="analytics-dashboard-tab">
        {/* Header */}
        <div className="analytics-dashboard-header">
          <div className="analytics-header-left">
            <h1 className="analytics-dashboard-title">
              <BarChart3 size={28} />
              Performance Dashboard
            </h1>
            <p className="analytics-dashboard-subtitle">
              Last updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="analytics-header-right">
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            <button onClick={fetchAllData} className="analytics-refresh-button">
              <RefreshCw size={18} />
            </button>
            <button onClick={clearCache} className="analytics-cache-button" title="Clear Cache">
              <Database size={18} />
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="analytics-metrics-grid">
          <MetricCard
            title="Total Earnings"
            value={computedMetrics.earningsTotal}
            subtitle={`Available: ${formatCurrency(computedMetrics.availableBalance)}`}
            icon={<DollarSign size={24} />}
            color={METRIC_COLORS.success}
            format="currency"
          />
          
          <MetricCard
            title="Performance Score"
            value={computedMetrics.overallScore}
            subtitle={dashboardData.performance_score?.tier}
            icon={<Trophy size={24} />}
            color={METRIC_COLORS.warning}
            format="percentage"
          />
          
          <MetricCard
            title="Applications"
            value={computedMetrics.totalApplications}
            subtitle={`${formatPercentage(computedMetrics.approvalRate)} approval rate`}
            icon={<FileText size={24} />}
            color={METRIC_COLORS.info}
          />
          
          <MetricCard
            title="Active Campaigns"
            value={computedMetrics.activeCampaigns}
            subtitle={`${formatPercentage(computedMetrics.completionRate)} completion rate`}
            icon={<Target size={24} />}
            color={METRIC_COLORS.primary}
          />
        </div>

        {/* Charts Section */}
        <div className="analytics-charts-section">
          {/* Earnings Trend Chart */}
          <div className="analytics-chart-container">
            <div className="analytics-chart-header">
              <h3>
                <TrendingUp size={20} />
                Earnings Trend
              </h3>
              <div className="analytics-chart-actions">
                <button
                  onClick={() => setExpandedCharts(prev => ({ ...prev, earnings: !prev.earnings }))}
                  className="analytics-chart-expand"
                >
                  {expandedCharts.earnings ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </div>
            </div>
            <div className={`analytics-chart-content ${expandedCharts.earnings ? 'expanded' : ''}`}>
              <ResponsiveContainer width="100%" height={expandedCharts.earnings ? 400 : 300}>
                <AreaChart data={earningsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => formatCurrency(value).replace('$', '')} />
                  <Tooltip
                    content={<CustomTooltip valueFormatter={(val) => formatCurrency(val)} />}
                    formatter={(value) => [formatCurrency(value), 'Earnings']}
                  />
                  <Area
                    type="monotone"
                    dataKey="total_amount"
                    stroke={METRIC_COLORS.success}
                    fill={METRIC_COLORS.success}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Applications Status Chart */}
          <div className="analytics-chart-container">
            <div className="analytics-chart-header">
              <h3>
                <PieChartIcon size={20} />
                Applications Status
              </h3>
            </div>
            <div className="analytics-chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={applicationsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {applicationsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Applications']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="analytics-detailed-metrics">
          <div className="analytics-metrics-section">
            <h3>
              <Activity size={20} />
              Performance Metrics
            </h3>
            <div className="analytics-metrics-grid-small">
              {[
                { label: 'Campaign ROI', value: '125%', change: 12.5, icon: <Percent size={16} /> },
                { label: 'Avg Response Time', value: '24h', change: -5.2, icon: <Clock size={16} /> },
                { label: 'Content Quality', value: '8.5/10', change: 3.1, icon: <Star size={16} /> },
                { label: 'Engagement Rate', value: '4.2%', change: 8.7, icon: <Heart size={16} /> },
                { label: 'Application Quality', value: '7.8/10', change: 2.4, icon: <CheckSquare size={16} /> },
                { label: 'Brand Satisfaction', value: '92%', change: 1.8, icon: <Users size={16} /> }
              ].map((metric, idx) => (
                <div key={idx} className="analytics-small-metric">
                  <div className="analytics-small-metric-header">
                    <div className="analytics-small-metric-icon">
                      {metric.icon}
                    </div>
                    <div className="analytics-small-metric-label">{metric.label}</div>
                  </div>
                  <div className="analytics-small-metric-value">{metric.value}</div>
                  <div className="analytics-small-metric-change">
                    <span className={`analytics-change-badge ${metric.change >= 0 ? 'positive' : 'negative'}`}>
                      {metric.change >= 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {dashboardData.recent_activity?.items && (
          <div className="analytics-recent-activity">
            <h3>
              <Clock size={20} />
              Recent Activity
            </h3>
            <div className="analytics-activity-list">
              {dashboardData.recent_activity.items.slice(0, 5).map((activity, idx) => (
                <div key={idx} className="analytics-activity-item">
                  <div className="analytics-activity-icon">
                    {activity.type === 'application' && <FileText size={16} />}
                    {activity.type === 'earning' && <DollarSign size={16} />}
                    {activity.type === 'campaign' && <Target size={16} />}
                  </div>
                  <div className="analytics-activity-content">
                    <div className="analytics-activity-title">{activity.title}</div>
                    <div className="analytics-activity-time">
                      {formatDateTime(activity.timestamp)}
                    </div>
                  </div>
                  <div className="analytics-activity-amount">
                    {activity.amount ? formatCurrency(activity.amount) : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const PerformanceTab = () => {
    if (!performanceData) return <LoadingSpinner />;

    return (
      <div className="analytics-performance-tab">
        <div className="analytics-tab-header">
          <h2>
            <Activity size={24} />
            Performance Analytics
          </h2>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        {/* Performance Score */}
        <div className="analytics-performance-score">
          <div className="analytics-score-card">
            <div className="analytics-score-value">
              {(performanceData?.overall_score ?? 0).toFixed(1)}
            </div>
            <div className="analytics-score-label">Overall Score</div>
            <div className="analytics-score-progress">
              <div 
                className="analytics-score-fill"
                style={{ width: `${performanceData.overall_score || 0}%` }}
              />
            </div>
            <div className="analytics-score-tier">
              Tier: <span className="analytics-tier-badge">{performanceData.tier || 'Novice'}</span>
            </div>
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="analytics-performance-breakdown">
          <h3>Performance Breakdown</h3>
          <div className="analytics-breakdown-grid">
            {[
              { label: 'Application Quality', value: performanceData.application_quality || 0 },
              { label: 'Campaign Completion', value: performanceData.completion_rate || 0 },
              { label: 'Brand Satisfaction', value: performanceData.satisfaction_score || 0 },
              { label: 'Content Quality', value: performanceData.content_quality || 0 },
              { label: 'Response Time', value: performanceData.response_time_score || 0 },
              { label: 'Earnings Efficiency', value: performanceData.earnings_efficiency || 0 }
            ].map((item, idx) => (
              <div key={idx} className="analytics-breakdown-item">
                <div className="analytics-breakdown-label">{item.label}</div>
                <div className="analytics-breakdown-bar">
                  <div 
                    className="analytics-breakdown-fill"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
                <div className="analytics-breakdown-value">{item.value.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Trends */}
        <div className="analytics-performance-chart">
          <h3>Performance Trends</h3>
          <div className="analytics-chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData.trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="overall_score"
                  stroke={METRIC_COLORS.primary}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="average_score"
                  stroke={METRIC_COLORS.success}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const EarningsTab = () => {
    if (!earningsData) return <LoadingSpinner />;

    return (
      <div className="analytics-earnings-tab">
        <div className="analytics-tab-header">
          <h2>
            <DollarSign size={24} />
            Earnings Analytics
          </h2>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        {/* Earnings Summary */}
        <div className="analytics-earnings-summary">
          <div className="analytics-earnings-card">
            <div className="analytics-earnings-amount">
              {formatCurrency(computedMetrics?.earningsTotal || 0)}
            </div>
            <div className="analytics-earnings-label">Total Earnings</div>
            <div className="analytics-earnings-sub">
              Available: {formatCurrency(computedMetrics?.availableBalance || 0)}
            </div>
          </div>
          
          <div className="analytics-earnings-card">
            <div className="analytics-earnings-amount">
              {formatCurrency(computedMetrics?.pendingEarnings || 0)}
            </div>
            <div className="analytics-earnings-label">Pending</div>
            <div className="analytics-earnings-sub">
              Awaiting payment
            </div>
          </div>

          <div className="analytics-earnings-card">
            <div className="analytics-earnings-amount">
              {formatCurrency((computedMetrics?.earningsTotal || 0) / 12)}
            </div>
            <div className="analytics-earnings-label">Avg Monthly</div>
            <div className="analytics-earnings-sub">
              Projected earnings
            </div>
          </div>
        </div>

        {/* Earnings Chart */}
        <div className="analytics-earnings-chart">
          <h3>Earnings Breakdown</h3>
          <div className="analytics-chart-wrapper">
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={earningsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                <Bar dataKey="total_amount" fill={METRIC_COLORS.primary} name="Total Earnings" />
                <Line
                  type="monotone"
                  dataKey="average_amount"
                  stroke={METRIC_COLORS.success}
                  strokeWidth={2}
                  name="Average"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Earning Campaigns */}
        <div className="analytics-top-earnings">
          <h3>Top Earning Campaigns</h3>
          <div className="analytics-earnings-list">
            {campaignsData.slice(0, 5).map((campaign, idx) => (
              <div key={idx} className="analytics-earnings-item">
                <div className="analytics-earnings-rank">{idx + 1}</div>
                <div className="analytics-earnings-content">
                  <div className="analytics-earnings-title">{campaign.title}</div>
              <div className="analytics-earnings-brand">
  {campaign.brand_name ||
   campaign.brand?.company_name ||
   campaign.brand_profile?.company_name ||  // Add this
   campaign.created_by?.company_name ||
   campaign.creator?.company_name ||        // Add this
   campaign.brand_info?.company_name ||     // Add this
   "Unknown Brand"}
</div>


                </div>
                <div className="analytics-earnings-amount">
                  {formatCurrency(campaign.earnings)}
                </div>
                <StatusBadge status={campaign.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const ApplicationsTab = () => {
    if (!applicationsData) return <LoadingSpinner />;

    return (
      <div className="analytics-applications-tab">
        <div className="analytics-tab-header">
          <h2>
            <FileText size={24} />
            Applications Analytics
          </h2>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        {/* Applications Overview */}
        <div className="analytics-applications-overview">
          <div className="analytics-applications-grid">
            {[
              { label: 'Total', value: applicationsData.total_applications || 0, color: METRIC_COLORS.primary },
              { label: 'Pending', value: applicationsData.pending || 0, color: STATUS_COLORS.pending },
              { label: 'Approved', value: applicationsData.approved || 0, color: STATUS_COLORS.approved },
              { label: 'Rejected', value: applicationsData.rejected || 0, color: STATUS_COLORS.rejected },
              { label: 'Completed', value: applicationsData.completed || 0, color: STATUS_COLORS.completed },
              { label: 'Success Rate', value: `${applicationsData.success_rate || 0}%`, color: METRIC_COLORS.success }
            ].map((stat, idx) => (
              <div key={idx} className="analytics-applications-stat">
                <div className="analytics-applications-value" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="analytics-applications-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Applications Timeline */}
        <div className="analytics-applications-timeline">
          <h3>Application Timeline</h3>
          <div className="analytics-chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={applicationsData.timeline || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Applications']} />
                <Bar dataKey="applications" fill={METRIC_COLORS.info} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="analytics-recent-applications">
          <h3>Recent Applications</h3>
          <div className="analytics-applications-table">
            <table>
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Brand</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicationsData.recent_applications?.slice(0, 10).map((app, idx) => (
                  <tr key={idx}>
                    <td>{app.campaign_title}</td>
                    <td>{app.brand_name}</td>
                    <td><StatusBadge status={app.status} /></td>
                    <td>{formatDate(app.applied_at)}</td>
                    <td>{formatCurrency(app.payment_amount)}</td>
                    <td>
                      <button
                        onClick={() => setSelectedCampaign(app.campaign_id)}
                        className="analytics-view-button"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const MediaTab = () => {
    if (!mediaData) return <LoadingSpinner />;

    return (
      <div className="analytics-media-tab">
        <div className="analytics-tab-header">
          <h2>
            <CameraIcon size={24} />
            Media Analytics
          </h2>
        </div>

        {/* Media Overview */}
        <div className="analytics-media-overview">
          <div className="analytics-media-stats">
            {[
              { label: 'Total Files', value: mediaData.total_files || 0, icon: <FileText size={20} /> },
              { label: 'Images', value: mediaData.images || 0, icon: <ImageIcon size={20} /> },
              { label: 'Videos', value: mediaData.videos || 0, icon: <VideoIcon size={20} /> },
              { label: 'Documents', value: mediaData.documents || 0, icon: <FileText size={20} /> },
              { label: 'Avg File Size', value: mediaData.avg_file_size || '0MB', icon: <Database size={20} /> },
              { label: 'Storage Used', value: mediaData.storage_used || '0GB', icon: <HardDrive size={20} /> }
            ].map((stat, idx) => (
              <div key={idx} className="analytics-media-stat">
                <div className="analytics-media-icon">{stat.icon}</div>
                <div className="analytics-media-value">{stat.value}</div>
                <div className="analytics-media-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Media Type Distribution */}
        <div className="analytics-media-chart">
          <h3>Media Type Distribution</h3>
          <div className="analytics-chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mediaData.type_distribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {mediaData.type_distribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Files']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Media */}
        <div className="analytics-recent-media">
          <h3>Recent Media Submissions</h3>
          <div className="analytics-media-grid">
            {mediaData.recent_media?.slice(0, 8).map((media, idx) => (
              <div key={idx} className="analytics-media-item">
                <div className="analytics-media-preview">
                  {media.type === 'image' && <ImageIcon size={24} />}
                  {media.type === 'video' && <VideoIcon size={24} />}
                  {media.type === 'document' && <FileText size={24} />}
                </div>
                <div className="analytics-media-info">
                  <div className="analytics-media-name">{media.filename}</div>
                  {/* <div className="analytics-media-details">
                    <span>{formatDate(media.submitted_at)}</span>
                    <span>{media.size}</span>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const GrowthTab = () => {
    if (!growthData) return <LoadingSpinner />;

    return (
      <div className="analytics-growth-tab">
        <div className="analytics-tab-header">
          <h2>
            <TrendingUp size={24} />
            Growth Analytics
          </h2>
        </div>

        {/* Growth Metrics */}
        <div className="analytics-growth-metrics">
          {[
            { label: 'Monthly Growth', value: `${growthData.monthly_growth || 0}%`, change: growthData.growth_trend || 0 },
            { label: 'Audience Growth', value: formatNumber(growthData.audience_growth || 0), change: 12.5 },
            { label: 'Engagement Growth', value: `${growthData.engagement_growth || 0}%`, change: 8.7 },
            { label: 'Revenue Growth', value: `${growthData.revenue_growth || 0}%`, change: growthData.revenue_trend || 0 }
          ].map((metric, idx) => (
            <div key={idx} className="analytics-growth-metric">
              <div className="analytics-growth-label">{metric.label}</div>
              <div className="analytics-growth-value">{metric.value}</div>
              <div className="analytics-growth-change">
                <span className={`analytics-growth-badge ${metric.change >= 0 ? 'positive' : 'negative'}`}>
                  {metric.change >= 0 ? '+' : ''}{metric.change}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Growth Chart */}
        <div className="analytics-growth-chart">
          <h3>Growth Trends</h3>
          <div className="analytics-chart-wrapper">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={growthData.trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Growth']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="earnings_growth"
                  stroke={METRIC_COLORS.success}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Earnings Growth"
                />
                <Line
                  type="monotone"
                  dataKey="applications_growth"
                  stroke={METRIC_COLORS.primary}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Applications Growth"
                />
                <Line
                  type="monotone"
                  dataKey="engagement_growth"
                  stroke={METRIC_COLORS.purple}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Engagement Growth"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const ExportTab = () => (
    <div className="analytics-export-tab">
      <div className="analytics-tab-header">
        <h2>
          <Download size={24} />
          Export Reports
        </h2>
        <p className="analytics-tab-subtitle">
          Download comprehensive reports in multiple formats
        </p>
      </div>

      {/* Export Options */}
      <div className="analytics-export-options">
        <div className="analytics-export-section">
          <h3>Export Formats</h3>
          <div className="analytics-format-grid">
            {[
              { format: 'json', label: 'JSON', icon: <FileText size={32} />, description: 'Complete data for analysis' },
              { format: 'csv', label: 'CSV', icon: <FileText size={32} />, description: 'Spreadsheet compatible' },
              { format: 'pdf', label: 'PDF', icon: <FileText size={32} />, description: 'Printable report' },
              { format: 'excel', label: 'Excel', icon: <FileText size={32} />, description: 'Advanced analytics' }
            ].map((option, idx) => (
              <div key={idx} className="analytics-format-card">
                <div className="analytics-format-icon">{option.icon}</div>
                <div className="analytics-format-label">{option.label}</div>
                <div className="analytics-format-description">{option.description}</div>
                <button
                  onClick={() => handleExport(option.format, 'comprehensive')}
                  disabled={exporting}
                  className="analytics-export-button"
                >
                  {exporting ? 'Exporting...' : 'Download'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-export-section">
          <h3>Report Types</h3>
          <div className="analytics-report-buttons">
            {[
              { type: 'summary', label: 'Summary Report' },
              { type: 'detailed', label: 'Detailed Report' },
              { type: 'financial', label: 'Financial Report' },
              { type: 'performance', label: 'Performance Report' },
              { type: 'applications', label: 'Applications Report' },
              { type: 'media', label: 'Media Report' }
            ].map((report, idx) => (
              <button
                key={idx}
                onClick={() => handleExport('json', report.type)}
                disabled={exporting}
                className="analytics-report-button"
              >
                {report.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Main Render
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'performance': return <PerformanceTab />;
      case 'earnings': return <EarningsTab />;
      case 'applications': return <ApplicationsTab />;
      case 'media': return <MediaTab />;
      case 'growth': return <GrowthTab />;
      case 'export': return <ExportTab />;
      default: return <DashboardTab />;
    }
  };


  
  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchAllData} />;
  }
  if (loading && !dashboardData) {
    return <LoadingSpinner />;
  }


  return (
    <div className="analytics-enhanced-container">
      {/* Sidebar */}
      <div className="analytics-sidebar">
        <div className="analytics-sidebar-header">
          <div className="analytics-profile">
            <div className="analytics-profile-avatar">
  {sidebarProfile?.profile_picture ? (
    <img
      src={resolveProfileImage(sidebarProfile.profile_picture)}
      alt="Profile"
      className="analytics-avatar-image"
      onError={(e) => {
        e.currentTarget.src =
          `${API_BASE_URL}/static/defaults/influencer-avatar.png`;
      }}
    />
  ) : (
    <div className="analytics-avatar-placeholder">
      {sidebarProfile?.username?.charAt(0) || 'I'}
    </div>
  )}
</div>

            <div className="analytics-profile-info">
              <div className="analytics-profile-name">
                {sidebarProfile?.username || profileName}
              </div>
              <div className="analytics-profile-tier">
                <Trophy size={14} />
                <span>{dashboardData?.performance_score?.tier || 'Rising Star'}</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="analytics-sidebar-nav">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={20} /> },
            { id: 'performance', label: 'Performance', icon: <Activity size={20} /> },
            { id: 'earnings', label: 'Earnings', icon: <DollarSign size={20} /> },
            { id: 'applications', label: 'Applications', icon: <FileText size={20} /> },
            { id: 'media', label: 'Media', icon: <CameraIcon size={20} /> },
            { id: 'growth', label: 'Growth', icon: <TrendingUp size={20} /> },
            { id: 'export', label: 'Export', icon: <Download size={20} /> }
          ].map(tab => (
            <button
              key={tab.id}
              className={`analytics-nav-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="analytics-nav-icon">{tab.icon}</span>
              <span className="analytics-nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="analytics-sidebar-footer">
          <div className="analytics-auto-refresh">
            <label>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <span>Auto Refresh</span>
            </label>
          </div>
          {quickStats && (
            <div className="analytics-quick-stats-sidebar">
              <div className="analytics-quick-stat">
                <span>Today:</span>
                <strong>{formatCurrency(quickStats.today?.earnings || 0)}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="analytics-main-content">
        {renderActiveTab()}
      </div>

      {/* Quick Stats Bar */}
      {quickStats && (
        <div className="analytics-quick-stats-bar">
          <div className="analytics-quick-stats-container">
            <div className="analytics-quick-stat-item">
              <span className="analytics-quick-stat-label">Today</span>
              <span className="analytics-quick-stat-value">
                {formatCurrency(quickStats.today?.earnings || 0)}
              </span>
            </div>
            <div className="analytics-quick-stat-item">
              <span className="analytics-quick-stat-label">This Week</span>
              <span className="analytics-quick-stat-value">
                {formatCurrency(quickStats.this_week?.earnings || 0)}
              </span>
            </div>
            <div className="analytics-quick-stat-item">
              <span className="analytics-quick-stat-label">This Month</span>
              <span className="analytics-quick-stat-value">
                {formatCurrency(quickStats.this_month?.earnings || 0)}
              </span>
            </div>
            <div className="analytics-quick-stat-item">
              <span className="analytics-quick-stat-label">Total</span>
              <span className="analytics-quick-stat-value">
                {formatCurrency(computedMetrics?.earningsTotal || 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfluencerAnalyticsEnhanced;