// // C:\Sagadevan\quickbox\frontend\src\pages\brand\BrandAnalytics.jsx

// import React, { useState, useMemo, useEffect, useContext } from "react";
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
//   Badge,
//   Tooltip,
//   Divider,
//   Stepper,
//   Step,
//   StepLabel,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
//   Checkbox,
//   FormGroup,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Slider,
//   FormLabel,
//   TablePagination,
//   Skeleton,
//   Rating,
//   Switch,
//   FormHelperText,
//   Autocomplete,
//   Zoom,
//   Fade,
//   Grow,
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
//   AccountBalance,
//   Search,
//   Edit,
//   PlayArrow,
//   Pause,
//   Add,
//   GetApp,
//   Email,
//   Message,
//   Share,
//   PictureAsPdf,
//   InsertChart,
//   RocketLaunch,
//   Lightbulb,
//   CompareArrows,
//   DateRange,
//   FilterList,
//   ExpandMore,
//   Instagram,
//   YouTube,
//   LinkedIn,
//   Twitter,
//   SmartDisplay,
//   ReceiptLong,
//   Group,
//   ShowChart,
//   PieChart,
//   TableChart,
//   Dashboard,
//   Insights,
//   AccountCircle,
//   WorkHistory,
//   Paid,
//   Engagement,
//   ConversionRate,
//   Analytics as AnalyticsIcon,
//   Campaign as CampaignIcon,
//   AutoGraph,
//   Timeline as TimelineIcon,
//   TrendingFlat,
//   AccessTime,
//   ArrowUpward,
//   ArrowDownward,
//   Money,
//   LocalOffer,
//   Category,
//   Flag,
//   Assessment,
//   StackedLineChart,
//   MultilineChart,
//   ScatterPlot,
//   BubbleChart,
//   ShowChart as ShowChartIcon,
//   HistoryToggleOff,
//   DataUsage,
//   Equalizer,
//   Functions,
//   Calculate,
//   Leaderboard,
//   Poll,
//   QueryStats,
//   StackedBarChart,
//   StackedLineChart as StackedLineChartIcon,
//   TrendingDown,
//   TrendingUp as TrendingUpIcon,
//   Speed,
//   SpeedDial,
//   SpeedDialAction,
//   SpeedDialIcon,
//   Print,
//   ContentCopy,
//   CloudUpload,
//   CloudDownload,
//   SaveAlt,
//   ZoomIn,
//   ZoomOut,
//   Fullscreen,
//   FullscreenExit,
//   Settings,
//   Tune,
//   Layers,
//   ViewWeek,
//   ViewDay,
//   ViewMonth,
//   CalendarViewDay,
//   CalendarViewWeek,
//   CalendarViewMonth,
//   Timeline as TimelineIcon2,
//   AreaChart,
//   StackedAreaChart,
//   WaterfallChart,
//   CandlestickChart,
//   ShowChart as ShowChartIcon2,
//   TableRows,
//   GridView,
//   ViewList,
//   ViewModule,
//   ViewComfy,
//   ViewCarousel,
//   ViewQuilt,
//   ViewStream,
//   ViewSidebar,
//   ViewHeadline,
//   ViewColumn,
//   ViewAgenda,
//   ViewArray,
//   ViewDay as ViewDayIcon,
//   ViewWeek as ViewWeekIcon,
//   ViewMonth as ViewMonthIcon,
//   ViewComfy as ViewComfyIcon,
//   ViewCompact,
//   ViewCompactAlt,
//   ViewCozy,
//   ViewKanban,
//   ViewTimeline,
//   ViewWeekend,
//   ViewInAr,
//   ViewQuilt as ViewQuiltIcon,
//   ViewSidebar as ViewSidebarIcon,
//   ViewStream as ViewStreamIcon,
//   ViewHeadline as ViewHeadlineIcon,
//   ViewColumn as ViewColumnIcon,
//   ViewAgenda as ViewAgendaIcon,
//   ViewArray as ViewArrayIcon,
//   ViewInAr as ViewInArIcon,
//   ViewKanban as ViewKanbanIcon,
//   ViewTimeline as ViewTimelineIcon,
//   ViewWeekend as ViewWeekendIcon,
//   AutoAwesome,
//   AutoFixHigh,
//   AutoFixNormal,
//   AutoFixOff,
//   AutoStories,
//   AutoDelete,
//   AutoMode,
//   AutoGraph as AutoGraphIcon,
//   AutoAwesomeMosaic,
//   AutoAwesomeMotion,
//   AutoFixHigh as AutoFixHighIcon,
//   AutoFixNormal as AutoFixNormalIcon,
//   AutoFixOff as AutoFixOffIcon,
//   AutoStories as AutoStoriesIcon,
//   AutoDelete as AutoDeleteIcon,
//   AutoMode as AutoModeIcon,
//   AutoAwesomeMosaic as AutoAwesomeMosaicIcon,
//   AutoAwesomeMotion as AutoAwesomeMotionIcon,
// } from "@mui/icons-material";
// import { campaignAPI, useApi } from "../../services/api";
// import profileAPI from "../../services/profileAPI";
// import { AuthContext } from "../../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";

// // Enhanced Currency formatter
// const formatCurrency = (amount, currency = "USD") => {
//   return new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: currency,
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(amount);
// };

// // Enhanced Number formatter
// const formatNumber = (num) => {
//   if (num >= 1000000) {
//     return (num / 1000000).toFixed(1) + 'M';
//   }
//   if (num >= 1000) {
//     return (num / 1000).toFixed(1) + 'K';
//   }
//   return num.toString();
// };

// // Enhanced Time formatter for real-time updates
// const formatTimeAgo = (dateString) => {
//   if (!dateString) return "N/A";
//   const date = new Date(dateString);
//   const now = new Date();
//   const diffMs = now - date;
//   const diffMins = Math.floor(diffMs / 60000);
//   const diffHours = Math.floor(diffMs / 3600000);
//   const diffDays = Math.floor(diffMs / 86400000);

//   if (diffMins < 1) return "Just now";
//   if (diffMins < 60) return `${diffMins}m ago`;
//   if (diffHours < 24) return `${diffHours}h ago`;
//   if (diffDays < 7) return `${diffDays}d ago`;
//   if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
//   return date.toLocaleDateString();
// };

// // Bar Graph Component with enhanced features
// const BarGraph = ({ 
//   data, 
//   title, 
//   height = 300, 
//   color = "#2196F3", 
//   showValues = true,
//   showGrid = true,
//   horizontal = false,
//   stacked = false,
//   timeSeries = false
// }) => {
//   const theme = useTheme();
  
//   // Calculate max value for scaling
//   const maxValue = Math.max(...data.map(item => Array.isArray(item.value) ? Math.max(...item.value) : item.value));
  
//   // Generate gradient colors
//   const getBarColor = (index, isStacked = false) => {
//     if (isStacked) {
//       const colors = [
//         theme.palette.primary.main,
//         theme.palette.secondary.main,
//         theme.palette.success.main,
//         theme.palette.warning.main,
//         theme.palette.error.main
//       ];
//       return colors[index % colors.length];
//     }
    
//     const baseColor = color || theme.palette.primary.main;
//     return `${baseColor}${Math.min(80 + (index * 10), 100)}`;
//   };

//   return (
//     <Paper sx={{ 
//       p: 3, 
//       borderRadius: "16px",
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
      
//       <Box sx={{ 
//         flex: 1, 
//         display: 'flex', 
//         alignItems: horizontal ? 'flex-start' : 'flex-end',
//         justifyContent: 'center',
//         position: 'relative',
//         px: 2,
//         py: 1
//       }}>
//         {/* Grid lines */}
//         {showGrid && !horizontal && (
//           <Box sx={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             display: 'flex',
//             flexDirection: 'column',
//             justifyContent: 'space-between',
//             pointerEvents: 'none'
//           }}>
//             {[0, 0.25, 0.5, 0.75, 1].map((percent) => (
//               <Box
//                 key={percent}
//                 sx={{
//                   width: '100%',
//                   height: '1px',
//                   background: `rgba(0, 0, 0, ${0.05 + percent * 0.05})`,
//                   position: 'relative'
//                 }}
//               >
//                 {percent > 0 && (
//                   <Typography 
//                     variant="caption" 
//                     sx={{ 
//                       position: 'absolute',
//                       right: '105%',
//                       top: '-8px',
//                       color: 'text.secondary',
//                       fontWeight: 500
//                     }}
//                   >
//                     {Math.round(percent * maxValue)}
//                   </Typography>
//                 )}
//               </Box>
//             ))}
//           </Box>
//         )}
        
//         {horizontal && showGrid && (
//           <Box sx={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             display: 'flex',
//             flexDirection: 'row',
//             justifyContent: 'space-between',
//             pointerEvents: 'none'
//           }}>
//             {[0, 0.25, 0.5, 0.75, 1].map((percent) => (
//               <Box
//                 key={percent}
//                 sx={{
//                   width: '1px',
//                   height: '100%',
//                   background: `rgba(0, 0, 0, ${0.05 + percent * 0.05})`,
//                   position: 'relative'
//                 }}
//               >
//                 {percent > 0 && (
//                   <Typography 
//                     variant="caption" 
//                     sx={{ 
//                       position: 'absolute',
//                       bottom: '-20px',
//                       left: '50%',
//                       transform: 'translateX(-50%)',
//                       color: 'text.secondary',
//                       fontWeight: 500
//                     }}
//                   >
//                     {Math.round(percent * maxValue)}
//                   </Typography>
//                 )}
//               </Box>
//             ))}
//           </Box>
//         )}
        
//         <Box sx={{ 
//           display: horizontal ? 'flex' : 'flex',
//           flexDirection: horizontal ? 'column' : 'row',
//           gap: 2,
//           width: '100%',
//           height: '100%',
//           alignItems: horizontal ? 'stretch' : 'flex-end',
//           justifyContent: horizontal ? 'flex-end' : 'space-between'
//         }}>
//           {data.map((item, index) => (
//             <Tooltip 
//               key={index} 
//               title={
//                 <Box>
//                   <Typography variant="subtitle2" fontWeight={600}>{item.label}</Typography>
//                   {Array.isArray(item.value) ? (
//                     item.value.map((val, idx) => (
//                       <Typography key={idx} variant="body2">
//                         {item.seriesLabels?.[idx] || `Series ${idx + 1}`}: {val}
//                       </Typography>
//                     ))
//                   ) : (
//                     <Typography variant="body2">Value: {item.value}</Typography>
//                   )}
//                   {item.change && (
//                     <Typography 
//                       variant="body2" 
//                       color={item.change > 0 ? 'success.main' : 'error.main'}
//                     >
//                       {item.change > 0 ? '↗' : '↘'} {Math.abs(item.change)}%
//                     </Typography>
//                   )}
//                 </Box>
//               } 
//               arrow
//               placement={horizontal ? "left" : "top"}
//             >
//               <Box sx={{ 
//                 flex: 1,
//                 display: 'flex',
//                 flexDirection: horizontal ? 'row' : 'column',
//                 alignItems: 'center',
//                 justifyContent: horizontal ? 'flex-end' : 'flex-end',
//                 position: 'relative',
//                 transition: 'all 0.3s ease',
//                 '&:hover': {
//                   transform: 'scale(1.05)',
//                   zIndex: 1
//                 }
//               }}>
//                 {stacked && Array.isArray(item.value) ? (
//                   <Box sx={{
//                     display: 'flex',
//                     flexDirection: horizontal ? 'column' : 'row',
//                     width: horizontal ? '100%' : '80%',
//                     height: horizontal ? '24px' : undefined,
//                     borderRadius: '4px',
//                     overflow: 'hidden'
//                   }}>
//                     {item.value.map((value, valueIndex) => (
//                       <Box
//                         key={valueIndex}
//                         sx={{
//                           flex: value / maxValue,
//                           backgroundColor: getBarColor(valueIndex, true),
//                           height: horizontal ? '100%' : `${(value / maxValue) * 100}%`,
//                           width: horizontal ? `${(value / maxValue) * 100}%` : '100%',
//                           transition: 'all 0.3s ease',
//                           '&:hover': {
//                             opacity: 0.8
//                           }
//                         }}
//                       />
//                     ))}
//                   </Box>
//                 ) : (
//                   <Box
//                     sx={{
//                       backgroundColor: getBarColor(index),
//                       width: horizontal ? `${(item.value / maxValue) * 100}%` : '80%',
//                       height: horizontal ? '24px' : `${(item.value / maxValue) * 100}%`,
//                       borderRadius: '4px',
//                       transition: 'all 0.3s ease',
//                       '&:hover': {
//                         opacity: 0.8
//                       }
//                     }}
//                   />
//                 )}
                
//                 {showValues && (
//                   <Typography 
//                     variant="caption" 
//                     sx={{ 
//                       mt: horizontal ? 0 : 0.5,
//                       ml: horizontal ? 0.5 : 0,
//                       fontWeight: 600,
//                       textAlign: 'center',
//                       fontSize: '0.7rem',
//                       color: 'text.primary'
//                     }}
//                   >
//                     {formatNumber(Array.isArray(item.value) ? item.value.reduce((a, b) => a + b, 0) : item.value)}
//                   </Typography>
//                 )}
                
//                 <Typography 
//                   variant="caption" 
//                   sx={{ 
//                     mt: horizontal ? 0.5 : 0,
//                     ml: horizontal ? 0 : 0,
//                     fontWeight: 600,
//                     textAlign: 'center',
//                     fontSize: '0.75rem',
//                     color: 'text.secondary',
//                     writingMode: horizontal ? 'horizontal-tb' : 'inherit',
//                     transform: horizontal ? 'none' : 'none',
//                     width: '100%',
//                     overflow: 'hidden',
//                     textOverflow: 'ellipsis',
//                     whiteSpace: 'nowrap'
//                   }}
//                 >
//                   {timeSeries ? format(new Date(item.label), 'MMM dd') : item.label}
//                 </Typography>
//               </Box>
//             </Tooltip>
//           ))}
//         </Box>
//       </Box>
//     </Paper>
//   );
// };

// // Multi-Series Bar Graph Component
// const MultiSeriesBarGraph = ({ 
//   data, 
//   title, 
//   height = 400,
//   series = [],
//   timeSeries = false
// }) => {
//   const theme = useTheme();
  
//   // Calculate max value across all series
//   const maxValue = Math.max(...data.flatMap(item => 
//     series.map((_, idx) => item.values[idx] || 0)
//   ));
  
//   const seriesColors = [
//     theme.palette.primary.main,
//     theme.palette.secondary.main,
//     theme.palette.success.main,
//     theme.palette.warning.main,
//     theme.palette.error.main,
//     theme.palette.info.main
//   ];

//   return (
//     <Paper sx={{ 
//       p: 3, 
//       borderRadius: "16px",
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
//         <StackedBarChart />
//         {title}
//       </Typography>
      
//       {/* Legend */}
//       <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
//         {series.map((serie, index) => (
//           <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <Box sx={{ 
//               width: 12, 
//               height: 12, 
//               borderRadius: '2px',
//               backgroundColor: seriesColors[index] 
//             }} />
//             <Typography variant="caption" sx={{ fontWeight: 600 }}>
//               {serie}
//             </Typography>
//           </Box>
//         ))}
//       </Box>
      
//       <Box sx={{ 
//         flex: 1, 
//         display: 'flex', 
//         alignItems: 'flex-end',
//         justifyContent: 'center',
//         position: 'relative',
//         px: 2,
//         py: 1
//       }}>
//         {/* Grid lines */}
//         <Box sx={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'space-between',
//           pointerEvents: 'none'
//         }}>
//           {[0, 0.25, 0.5, 0.75, 1].map((percent) => (
//             <Box
//               key={percent}
//               sx={{
//                 width: '100%',
//                 height: '1px',
//                 background: `rgba(0, 0, 0, ${0.05 + percent * 0.05})`,
//                 position: 'relative'
//               }}
//             >
//               {percent > 0 && (
//                 <Typography 
//                   variant="caption" 
//                   sx={{ 
//                     position: 'absolute',
//                     right: '105%',
//                     top: '-8px',
//                     color: 'text.secondary',
//                     fontWeight: 500
//                   }}
//                 >
//                   {Math.round(percent * maxValue)}
//                 </Typography>
//               )}
//             </Box>
//           ))}
//         </Box>
        
//         <Box sx={{ 
//           display: 'flex',
//           gap: 1,
//           width: '100%',
//           height: '100%',
//           alignItems: 'flex-end',
//           justifyContent: 'space-between'
//         }}>
//           {data.map((item, index) => (
//             <Tooltip 
//               key={index} 
//               title={
//                 <Box>
//                   <Typography variant="subtitle2" fontWeight={600}>{item.label}</Typography>
//                   {series.map((serie, serieIndex) => (
//                     <Typography key={serieIndex} variant="body2">
//                       {serie}: {item.values[serieIndex] || 0}
//                     </Typography>
//                   ))}
//                   <Typography variant="body2" fontWeight={600}>
//                     Total: {item.values.reduce((a, b) => a + b, 0)}
//                   </Typography>
//                 </Box>
//               } 
//               arrow
//               placement="top"
//             >
//               <Box sx={{ 
//                 flex: 1,
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//                 justifyContent: 'flex-end',
//                 height: '100%',
//                 position: 'relative',
//                 transition: 'all 0.3s ease',
//                 '&:hover': {
//                   transform: 'scale(1.05)',
//                   zIndex: 1
//                 }
//               }}>
//                 <Box sx={{
//                   display: 'flex',
//                   flexDirection: 'column',
//                   alignItems: 'center',
//                   width: '80%',
//                   height: '100%',
//                   justifyContent: 'flex-end'
//                 }}>
//                   {series.map((_, serieIndex) => {
//                     const value = item.values[serieIndex] || 0;
//                     const previousValue = index > 0 ? data[index - 1].values[serieIndex] || 0 : value;
//                     const change = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
                    
//                     return (
//                       <Box
//                         key={serieIndex}
//                         sx={{
//                           width: '100%',
//                           height: `${(value / maxValue) * 100}%`,
//                           backgroundColor: seriesColors[serieIndex],
//                           marginBottom: '1px',
//                           borderRadius: '2px 2px 0 0',
//                           position: 'relative',
//                           transition: 'all 0.3s ease',
//                           '&:hover': {
//                             opacity: 0.8
//                           }
//                         }}
//                       >
//                         {value > 0 && (
//                           <Typography 
//                             variant="caption" 
//                             sx={{ 
//                               position: 'absolute',
//                               top: -20,
//                               left: 0,
//                               right: 0,
//                               textAlign: 'center',
//                               fontWeight: 600,
//                               fontSize: '0.6rem',
//                               color: change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'text.secondary'
//                             }}
//                           >
//                             {change !== 0 && (
//                               <>
//                                 {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
//                               </>
//                             )}
//                           </Typography>
//                         )}
//                       </Box>
//                     );
//                   })}
//                 </Box>
                
//                 <Typography 
//                   variant="caption" 
//                   sx={{ 
//                     mt: 1,
//                     fontWeight: 600,
//                     textAlign: 'center',
//                     fontSize: '0.75rem',
//                     color: 'text.secondary',
//                     width: '100%',
//                     overflow: 'hidden',
//                     textOverflow: 'ellipsis',
//                     whiteSpace: 'nowrap'
//                   }}
//                 >
//                   {timeSeries ? format(new Date(item.label), 'MMM dd') : item.label}
//                 </Typography>
//               </Box>
//             </Tooltip>
//           ))}
//         </Box>
//       </Box>
//     </Paper>
//   );
// };

// // Performance Comparison Bar Graph
// const PerformanceComparisonGraph = ({
//   campaigns = [],
//   metrics = ['applications', 'engagement', 'roi'],
//   height = 400
// }) => {
//   const theme = useTheme();
  
//   const metricConfigs = {
//     applications: { label: 'Applications', color: theme.palette.primary.main },
//     engagement: { label: 'Engagement Rate', color: theme.palette.success.main, suffix: '%' },
//     roi: { label: 'ROI', color: theme.palette.warning.main, suffix: '%' },
//     budget: { label: 'Budget', color: theme.palette.info.main, prefix: '$' }
//   };

//   const getCampaignValue = (campaign, metric) => {
//     switch (metric) {
//       case 'applications':
//         return campaign.applications?.length || 0;
//       case 'engagement':
//         return Math.round((campaign.applications?.length || 0) / (campaign.budget || 1) * 100);
//       case 'roi':
//         return Math.round((campaign.budget || 0) * 1.42);
//       case 'budget':
//         return campaign.budget || 0;
//       default:
//         return 0;
//     }
//   };

//   const maxValues = metrics.reduce((acc, metric) => {
//     acc[metric] = Math.max(...campaigns.map(c => getCampaignValue(c, metric)));
//     return acc;
//   }, {});

//   return (
//     <Paper sx={{ 
//       p: 3, 
//       borderRadius: "16px",
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
//         <CompareArrows />
//         Performance Comparison
//       </Typography>
      
//       <Box sx={{ height: height - 100, overflow: 'auto', pr: 1 }}>
//         {campaigns.map((campaign, index) => (
//           <Box key={campaign._id} sx={{ mb: 3 }}>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
//               <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
//                 {campaign.title}
//               </Typography>
//               <Chip 
//                 label={campaign.status} 
//                 size="small"
//                 color={
//                   campaign.status === "active" ? "success" :
//                   campaign.status === "paused" ? "warning" : "default"
//                 }
//                 sx={{ fontWeight: 600, ml: 1 }}
//               />
//             </Box>
            
//             {metrics.map((metric) => {
//               const value = getCampaignValue(campaign, metric);
//               const maxValue = maxValues[metric] || 1;
//               const config = metricConfigs[metric];
              
//               return (
//                 <Box key={metric} sx={{ mb: 1 }}>
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
//                     <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
//                       {config.label}
//                     </Typography>
//                     <Typography variant="caption" sx={{ fontWeight: 600 }}>
//                       {config.prefix || ''}{value}{config.suffix || ''}
//                     </Typography>
//                   </Box>
//                   <LinearProgress 
//                     variant="determinate" 
//                     value={(value / maxValue) * 100}
//                     sx={{ 
//                       height: 6, 
//                       borderRadius: 3,
//                       backgroundColor: `${config.color}20`,
//                       '& .MuiLinearProgress-bar': {
//                         background: `linear-gradient(90deg, ${config.color}, ${config.color}80)`,
//                         borderRadius: 3
//                       }
//                     }}
//                   />
//                 </Box>
//               );
//             })}
//           </Box>
//         ))}
//       </Box>
//     </Paper>
//   );
// };

// // Time Series Bar Graph
// const TimeSeriesBarGraph = ({
//   data,
//   title,
//   height = 350,
//   showTrendLine = true
// }) => {
//   const theme = useTheme();
  
//   const maxValue = Math.max(...data.map(item => item.value));
//   const trendData = data.map(item => item.value);
  
//   // Calculate trend line
//   const calculateTrendLine = (data) => {
//     const n = data.length;
//     const xSum = data.reduce((sum, _, i) => sum + i, 0);
//     const ySum = data.reduce((sum, val) => sum + val, 0);
//     const xySum = data.reduce((sum, val, i) => sum + i * val, 0);
//     const x2Sum = data.reduce((sum, _, i) => sum + i * i, 0);
    
//     const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
//     const intercept = (ySum - slope * xSum) / n;
    
//     return data.map((_, i) => intercept + slope * i);
//   };
  
//   const trendLine = showTrendLine ? calculateTrendLine(trendData) : null;

//   return (
//     <Paper sx={{ 
//       p: 3, 
//       borderRadius: "16px",
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
//         <TimelineIcon />
//         {title}
//       </Typography>
      
//       <Box sx={{ 
//         flex: 1, 
//         position: 'relative',
//         px: 2,
//         py: 1
//       }}>
//         {/* Grid lines */}
//         <Box sx={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'space-between',
//           pointerEvents: 'none'
//         }}>
//           {[0, 0.25, 0.5, 0.75, 1].map((percent) => (
//             <Box
//               key={percent}
//               sx={{
//                 width: '100%',
//                 height: '1px',
//                 background: `rgba(0, 0, 0, ${0.05 + percent * 0.05})`,
//                 position: 'relative'
//               }}
//             >
//               {percent > 0 && (
//                 <Typography 
//                   variant="caption" 
//                   sx={{ 
//                     position: 'absolute',
//                     right: '105%',
//                     top: '-8px',
//                     color: 'text.secondary',
//                     fontWeight: 500
//                   }}
//                 >
//                   {Math.round(percent * maxValue)}
//                 </Typography>
//               )}
//             </Box>
//           ))}
//         </Box>
        
//         {/* Trend line */}
//         {trendLine && (
//           <Box sx={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             pointerEvents: 'none'
//           }}>
//             <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
//               <path
//                 d={trendLine.map((value, i) => {
//                   const x = (i / (trendLine.length - 1)) * 100;
//                   const y = 100 - (value / maxValue) * 100;
//                   return `${i === 0 ? 'M' : 'L'} ${x}% ${y}%`;
//                 }).join(' ')}
//                 stroke={theme.palette.success.main}
//                 strokeWidth="2"
//                 fill="none"
//                 strokeDasharray="5,5"
//               />
//             </svg>
//           </Box>
//         )}
        
//         <Box sx={{ 
//           display: 'flex',
//           gap: 1,
//           width: '100%',
//           height: '100%',
//           alignItems: 'flex-end',
//           justifyContent: 'space-between',
//           position: 'relative'
//         }}>
//           {data.map((item, index) => {
//             const previousValue = index > 0 ? data[index - 1].value : item.value;
//             const change = previousValue ? ((item.value - previousValue) / previousValue) * 100 : 0;
            
//             return (
//               <Tooltip 
//                 key={index} 
//                 title={
//                   <Box>
//                     <Typography variant="subtitle2" fontWeight={600}>
//                       {format(new Date(item.label), 'MMM dd, yyyy')}
//                     </Typography>
//                     <Typography variant="body2">Value: {item.value}</Typography>
//                     {change !== 0 && (
//                       <Typography 
//                         variant="body2" 
//                         color={change > 0 ? 'success.main' : 'error.main'}
//                       >
//                         {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% from previous
//                       </Typography>
//                     )}
//                   </Box>
//                 } 
//                 arrow
//                 placement="top"
//               >
//                 <Box sx={{ 
//                   flex: 1,
//                   display: 'flex',
//                   flexDirection: 'column',
//                   alignItems: 'center',
//                   justifyContent: 'flex-end',
//                   position: 'relative',
//                   transition: 'all 0.3s ease',
//                   '&:hover': {
//                     transform: 'translateY(-5px)',
//                     zIndex: 1
//                   }
//                 }}>
//                   <Box
//                     sx={{
//                       width: '80%',
//                       height: `${(item.value / maxValue) * 100}%`,
//                       backgroundColor: change > 0 ? theme.palette.success.main : 
//                                      change < 0 ? theme.palette.error.main : 
//                                      theme.palette.primary.main,
//                       borderRadius: '4px 4px 0 0',
//                       transition: 'all 0.3s ease',
//                       position: 'relative',
//                       '&:hover': {
//                         opacity: 0.8
//                       }
//                     }}
//                   >
//                     {/* Value label on bar */}
//                     <Typography 
//                       variant="caption" 
//                       sx={{ 
//                         position: 'absolute',
//                         top: -20,
//                         left: 0,
//                         right: 0,
//                         textAlign: 'center',
//                         fontWeight: 600,
//                         fontSize: '0.7rem',
//                         color: change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'text.primary'
//                       }}
//                     >
//                       {item.value}
//                     </Typography>
//                   </Box>
                  
//                   <Typography 
//                     variant="caption" 
//                     sx={{ 
//                       mt: 1,
//                       fontWeight: 600,
//                       textAlign: 'center',
//                       fontSize: '0.75rem',
//                       color: 'text.secondary',
//                       writingMode: 'vertical-rl',
//                       transform: 'rotate(180deg)',
//                       height: '40px',
//                       display: 'flex',
//                       alignItems: 'center'
//                     }}
//                   >
//                     {format(new Date(item.label), 'MMM dd')}
//                   </Typography>
//                 </Box>
//               </Tooltip>
//             );
//           })}
//         </Box>
//       </Box>
//     </Paper>
//   );
// };

// // KPI Bar Graph for Key Metrics
// const KPIBarGraph = ({
//   metrics = [],
//   title = "Key Performance Indicators",
//   height = 300
// }) => {
//   const theme = useTheme();
  
//   const maxValue = Math.max(...metrics.map(m => m.value));

//   return (
//     <Paper sx={{ 
//       p: 3, 
//       borderRadius: "16px",
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
//         <Leaderboard />
//         {title}
//       </Typography>
      
//       <Box sx={{ 
//         display: 'flex', 
//         flexDirection: 'column', 
//         gap: 2,
//         height: height - 100,
//         overflow: 'auto',
//         pr: 1
//       }}>
//         {metrics.map((metric, index) => (
//           <Box key={index}>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//                 <Box sx={{ 
//                   width: 8, 
//                   height: 8, 
//                   borderRadius: '50%', 
//                   backgroundColor: metric.color || theme.palette.primary.main 
//                 }} />
//                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                   {metric.label}
//                 </Typography>
//               </Box>
//               <Box sx={{ textAlign: 'right' }}>
//                 <Typography variant="body2" sx={{ fontWeight: 700 }}>
//                   {metric.value}{metric.suffix || ''}
//                 </Typography>
//                 {metric.target && (
//                   <Typography variant="caption" sx={{ color: 'text.secondary' }}>
//                     Target: {metric.target}{metric.suffix || ''}
//                   </Typography>
//                 )}
//               </Box>
//             </Box>
            
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//               <Box sx={{ flex: 1 }}>
//                 <LinearProgress 
//                   variant="determinate" 
//                   value={(metric.value / maxValue) * 100}
//                   sx={{ 
//                     height: 8, 
//                     borderRadius: 4,
//                     backgroundColor: `${metric.color || theme.palette.primary.main}20`,
//                     '& .MuiLinearProgress-bar': {
//                       background: `linear-gradient(90deg, ${metric.color || theme.palette.primary.main}, ${metric.color || theme.palette.primary.main}80)`,
//                       borderRadius: 4
//                     }
//                   }}
//                 />
//               </Box>
              
//               {metric.change !== undefined && (
//                 <Chip 
//                   label={
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                       {metric.change > 0 ? <ArrowUpward sx={{ fontSize: 14 }} /> : <ArrowDownward sx={{ fontSize: 14 }} />}
//                       {Math.abs(metric.change)}%
//                     </Box>
//                   } 
//                   size="small"
//                   color={metric.change > 0 ? "success" : "error"}
//                   variant="outlined"
//                   sx={{ fontWeight: 600, minWidth: 60 }}
//                 />
//               )}
//             </Box>
            
//             {metric.description && (
//               <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
//                 {metric.description}
//               </Typography>
//             )}
//           </Box>
//         ))}
//       </Box>
//     </Paper>
//   );
// };

// // Horizontal Bar Graph Component
// const HorizontalBarGraph = ({ 
//   data, 
//   title, 
//   height = 400,
//   showValues = true,
//   color = "#2196F3"
// }) => {
//   const theme = useTheme();
  
//   const maxValue = Math.max(...data.map(item => item.value));

//   return (
//     <Paper sx={{ 
//       p: 3, 
//       borderRadius: "16px",
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
//         <TableChart />
//         {title}
//       </Typography>
      
//       <Box sx={{ 
//         flex: 1,
//         display: 'flex',
//         flexDirection: 'column',
//         gap: 1.5,
//         overflow: 'auto',
//         pr: 1
//       }}>
//         {data.map((item, index) => (
//           <Tooltip key={index} title={`${item.label}: ${item.value}`} arrow>
//             <Box sx={{ 
//               display: 'flex', 
//               alignItems: 'center',
//               gap: 2,
//               p: 1,
//               borderRadius: '8px',
//               transition: 'all 0.3s ease',
//               '&:hover': {
//                 backgroundColor: 'action.hover',
//                 transform: 'translateX(4px)'
//               }
//             }}>
//               <Typography variant="body2" sx={{ 
//                 fontWeight: 600, 
//                 minWidth: 120,
//                 textAlign: 'right'
//               }}>
//                 {item.label}
//               </Typography>
              
//               <Box sx={{ flex: 1, position: 'relative' }}>
//                 <Box
//                   sx={{
//                     width: `${(item.value / maxValue) * 100}%`,
//                     height: 24,
//                     backgroundColor: color,
//                     borderRadius: '4px',
//                     transition: 'all 0.3s ease',
//                     position: 'relative',
//                     '&:hover': {
//                       opacity: 0.8
//                     }
//                   }}
//                 >
//                   {showValues && (
//                     <Typography 
//                       variant="caption" 
//                       sx={{ 
//                         position: 'absolute',
//                         right: 4,
//                         top: '50%',
//                         transform: 'translateY(-50%)',
//                         fontWeight: 700,
//                         color: 'white',
//                         textShadow: '0 1px 2px rgba(0,0,0,0.3)'
//                       }}
//                     >
//                       {item.value}
//                     </Typography>
//                   )}
//                 </Box>
//               </Box>
              
//               {item.change !== undefined && (
//                 <Chip 
//                   label={`${item.change > 0 ? '+' : ''}${item.change}%`} 
//                   size="small"
//                   color={item.change > 0 ? "success" : "error"}
//                   sx={{ 
//                     fontWeight: 600,
//                     minWidth: 60
//                   }}
//                 />
//               )}
//             </Box>
//           </Tooltip>
//         ))}
//       </Box>
//     </Paper>
//   );
// };

// // Enhanced Donut Chart Component
// const EnhancedDonutChart = ({ data, title, height = 300, showTotal = true }) => {
//   const theme = useTheme();
//   const total = data.reduce((sum, item) => sum + item.value, 0);
  
//   return (
//     <Paper sx={{ 
//       p: 3, 
//       borderRadius: "16px",
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
//             background: `conic-gradient(${data.map((item, index) => 
//               `${item.color} 0% ${index === 0 ? item.value/total*100 : 
//                 data.slice(0, index).reduce((sum, i) => sum + i.value/total*100, 0) + item.value/total*100}%`
//             ).join(', ')})`
//           }} />
          
//           {showTotal && (
//             <Box sx={{
//               position: 'absolute',
//               top: 20,
//               left: 20,
//               width: 160,
//               height: 160,
//               borderRadius: '50%',
//               backgroundColor: theme.palette.background.paper,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               flexDirection: 'column'
//             }}>
//               <Typography variant="h4" sx={{ fontWeight: 800 }}>
//                 {total}
//               </Typography>
//               <Typography variant="body2" sx={{ color: 'text.secondary' }}>
//                 Total
//               </Typography>
//             </Box>
//           )}
//         </Box>
//       </Box>
      
//       <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
//         {data.map((item, index) => (
//           <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//               <Box sx={{ 
//                 width: 12, 
//                 height: 12, 
//                 borderRadius: '50%', 
//                 backgroundColor: item.color 
//               }} />
//               <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                 {item.name}
//               </Typography>
//             </Box>
//             <Box sx={{ textAlign: 'right' }}>
//               <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                 {item.value}
//               </Typography>
//               <Typography variant="caption" sx={{ color: 'text.secondary' }}>
//                 ({(item.value/total*100).toFixed(1)}%)
//               </Typography>
//             </Box>
//           </Box>
//         ))}
//       </Box>
//     </Paper>
//   );
// };

// // AI Suggestion Component
// const AISuggestionCard = ({ title, description, action, icon, color = "#2196F3" }) => {
//   const theme = useTheme();
//   return (
//     <Card sx={{ 
//       borderRadius: "16px", 
//       background: `linear-gradient(135deg, ${color}08 0%, ${color}02 100%)`,
//       border: `1px solid ${color}20`,
//       transition: 'all 0.3s ease',
//       '&:hover': {
//         transform: 'translateY(-4px)',
//         boxShadow: `0 8px 25px ${color}15`,
//       }
//     }}>
//       <CardContent sx={{ p: 2.5 }}>
//         <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
//           <Box sx={{ 
//             backgroundColor: `${color}15`, 
//             borderRadius: "12px", 
//             p: 1,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center"
//           }}>
//             {React.cloneElement(icon, { 
//               sx: { 
//                 fontSize: 20, 
//                 color: color,
//               } 
//             })}
//           </Box>
//           <Box sx={{ flex: 1 }}>
//             <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
//               {title}
//             </Typography>
//             <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.4 }}>
//               {description}
//             </Typography>
//             {action && (
//               <Button 
//                 size="small" 
//                 variant="outlined" 
//                 onClick={action.onClick}
//                 sx={{ 
//                   borderRadius: '8px',
//                   borderColor: color,
//                   color: color,
//                   '&:hover': {
//                     backgroundColor: `${color}08`,
//                     borderColor: color,
//                   }
//                 }}
//               >
//                 {action.label}
//               </Button>
//             )}
//           </Box>
//         </Box>
//       </CardContent>
//     </Card>
//   );
// };

// // Enhanced Metric Card
// const MetricCard = ({ title, value, subtitle, icon, color, trend, onClick, currency, percentage, size = "medium" }) => {
//   const theme = useTheme();
//   const fontSize = size === "large" ? { xs: '2.5rem', md: '3.5rem' } : { xs: '2rem', md: '2.5rem' };
  
//   return (
//     <Card 
//       sx={{ 
//         borderRadius: "16px", 
//         transition: "all 0.3s ease",
//         background: `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`,
//         border: `1px solid ${color}20`,
//         cursor: onClick ? 'pointer' : 'default',
//         height: '100%',
//         "&:hover": {
//           transform: "translateY(-4px)",
//           boxShadow: `0 8px 25px ${color}20`,
//         }
//       }}
//       elevation={0}
//       onClick={onClick}
//     >
//       <CardContent sx={{ p: 3, position: 'relative' }}>
//         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
//           <Box sx={{ flex: 1 }}>
//             <Typography variant="h2" sx={{ 
//               fontWeight: 800, 
//               background: `linear-gradient(45deg, ${color}, ${theme.palette.primary.main})`,
//               backgroundClip: "text",
//               WebkitBackgroundClip: "text",
//               WebkitTextFillColor: "transparent",
//               fontSize: fontSize,
//               lineHeight: 1.1
//             }}>
//               {value}
//             </Typography>
//             {percentage && (
//               <Typography variant="h6" sx={{ 
//                 color: color, 
//                 fontWeight: 700,
//                 fontSize: '1.1rem'
//               }}>
//                 {percentage}
//               </Typography>
//             )}
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
//             backgroundColor: `${color}15`, 
//             borderRadius: "12px", 
//             p: 1.5,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center"
//           }}>
//             {React.cloneElement(icon, { 
//               sx: { 
//                 fontSize: 24, 
//                 color: color,
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

// // Enhanced RealTime Activity Component
// const EnhancedRealTimeActivity = ({ activities }) => {
//   const theme = useTheme();
  
//   const getActivityIcon = (type) => {
//     switch (type) {
//       case 'application': return <Assignment color="primary" />;
//       case 'campaign': return <Campaign color="secondary" />;
//       case 'payment': return <AttachMoney color="success" />;
//       case 'message': return <Message color="info" />;
//       default: return <Notifications color="action" />;
//     }
//   };

//   return (
//     <Paper sx={{ 
//       p: 3, 
//       borderRadius: "16px",
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
//         Real-Time Activity Feed
//       </Typography>
      
//       <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
//         {activities.length === 0 ? (
//           <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', p: 3 }}>
//             No recent activity
//           </Typography>
//         ) : (
//           activities.map((activity, index) => (
//             <Box key={index} sx={{ 
//               display: 'flex', 
//               alignItems: 'flex-start', 
//               gap: 2, 
//               p: 2, 
//               borderBottom: `1px solid ${theme.palette.divider}`,
//               transition: 'all 0.3s ease',
//               '&:hover': {
//                 backgroundColor: theme.palette.action.hover,
//                 borderRadius: '8px'
//               },
//               '&:last-child': { borderBottom: 'none' }
//             }}>
//               <Avatar sx={{ 
//                 width: 40, 
//                 height: 40,
//                 background: `linear-gradient(45deg, ${activity.color}, ${activity.color}80)`
//               }}>
//                 {getActivityIcon(activity.type)}
//               </Avatar>
//               <Box sx={{ flex: 1 }}>
//                 <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
//                   {activity.message}
//                 </Typography>
//                 <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
//                   {activity.details}
//                 </Typography>
//                 <Typography variant="caption" sx={{ color: 'text.secondary' }}>
//                   {activity.time}
//                 </Typography>
//               </Box>
//               <Chip 
//                 label={activity.status} 
//                 size="small"
//                 color={
//                   activity.status === 'Completed' ? 'success' : 
//                   activity.status === 'New' ? 'primary' :
//                   activity.status === 'Updated' ? 'warning' : 'default'
//                 }
//                 sx={{ fontWeight: 600 }}
//               />
//             </Box>
//           ))
//         )}
//       </Box>
//     </Paper>
//   );
// };

// // Enhanced Campaign Performance Table
// const EnhancedCampaignPerformanceTable = ({ campaigns, onCampaignClick, onUserClick }) => {
//   const theme = useTheme();
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);
  
//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };
  
//   return (
//     <Paper sx={{ 
//       borderRadius: "16px",
//       background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
//       overflow: 'hidden'
//     }}>
//       <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
//         <Typography variant="h6" sx={{ fontWeight: 700 }}>
//           Campaign Performance Details
//         </Typography>
//       </Box>
      
//       <TableContainer>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell sx={{ fontWeight: 700 }}>Campaign</TableCell>
//               <TableCell sx={{ fontWeight: 700 }} align="center">Status</TableCell>
//               <TableCell sx={{ fontWeight: 700 }} align="center">Budget</TableCell>
//               <TableCell sx={{ fontWeight: 700 }} align="center">Applications</TableCell>
//               <TableCell sx={{ fontWeight: 700 }} align="center">Engagement</TableCell>
//               <TableCell sx={{ fontWeight: 700 }} align="center">ROI</TableCell>
//               <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {campaigns.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((campaign) => (
//               <TableRow 
//                 key={campaign._id} 
//                 hover 
//                 sx={{ 
//                   cursor: 'pointer',
//                   transition: 'all 0.3s ease',
//                   '&:hover': {
//                     backgroundColor: `${theme.palette.primary.main}08`,
//                     transform: 'translateX(4px)'
//                   }
//                 }}
//               >
//                 <TableCell onClick={() => onCampaignClick(campaign)}>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                     <Avatar 
//                       src={campaign.campaign_image_id ? `/api/campaigns/image/${campaign.campaign_image_id}` : undefined}
//                       sx={{ 
//                         width: 40, 
//                         height: 40,
//                         background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
//                       }}
//                     >
//                       <Campaign />
//                     </Avatar>
//                     <Box>
//                       <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
//                         {campaign.title}
//                       </Typography>
//                       <Typography variant="caption" sx={{ color: 'text.secondary' }}>
//                         {campaign.category} • {new Date(campaign.deadline).toLocaleDateString()}
//                       </Typography>
//                     </Box>
//                   </Box>
//                 </TableCell>
//                 <TableCell align="center" onClick={() => onCampaignClick(campaign)}>
//                   <Chip 
//                     label={campaign.status} 
//                     size="small"
//                     color={
//                       campaign.status === "active" ? "success" :
//                       campaign.status === "paused" ? "warning" : "default"
//                     }
//                     sx={{ fontWeight: 600 }}
//                   />
//                 </TableCell>
//                 <TableCell align="center" onClick={() => onCampaignClick(campaign)}>
//                   <Typography variant="body2" sx={{ fontWeight: 700 }}>
//                     {formatCurrency(campaign.budget || 0, campaign.currency)}
//                   </Typography>
//                 </TableCell>
//                 <TableCell align="center" onClick={() => onCampaignClick(campaign)}>
//                   <Typography variant="body2" sx={{ fontWeight: 700 }}>
//                     {campaign.applications?.length || 0}
//                   </Typography>
//                 </TableCell>
//                 <TableCell align="center" onClick={() => onCampaignClick(campaign)}>
//                   <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
//                     {Math.round((campaign.applications?.length || 0) / (campaign.budget || 1) * 100)}%
//                   </Typography>
//                 </TableCell>
//                 <TableCell align="center" onClick={() => onCampaignClick(campaign)}>
//                   <Typography variant="body2" sx={{ fontWeight: 700, color: 'warning.main' }}>
//                     {Math.round((campaign.budget || 0) * 1.42)}%
//                   </Typography>
//                 </TableCell>
//                 <TableCell align="center">
//                   <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
//                     <Tooltip title="View Campaign">
//                       <IconButton 
//                         size="small" 
//                         color="primary"
//                         onClick={() => onCampaignClick(campaign)}
//                       >
//                         <Visibility />
//                       </IconButton>
//                     </Tooltip>
//                     <Tooltip title="View Applications">
//                       <IconButton size="small" color="info">
//                         <People />
//                       </IconButton>
//                     </Tooltip>
//                     <Tooltip title="Download Report">
//                       <IconButton size="small" color="success">
//                         <GetApp />
//                       </IconButton>
//                     </Tooltip>
//                   </Box>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
      
//       <TablePagination
//         rowsPerPageOptions={[5, 10, 25]}
//         component="div"
//         count={campaigns.length}
//         rowsPerPage={rowsPerPage}
//         page={page}
//         onPageChange={handleChangePage}
//         onRowsPerPageChange={handleChangeRowsPerPage}
//       />
//     </Paper>
//   );
// };

// // Report Generation Component
// const ReportGenerator = ({ onGenerate, onExport, loading = false }) => {
//   const [reportType, setReportType] = useState('performance');
//   const [dateRange, setDateRange] = useState('30d');
//   const [includeCharts, setIncludeCharts] = useState(true);
//   const [includeData, setIncludeData] = useState(true);
//   const [format, setFormat] = useState('pdf');
  
//   const reportTypes = [
//     { value: 'performance', label: 'Performance Summary' },
//     { value: 'campaign', label: 'Campaign Analysis' },
//     { value: 'influencer', label: 'Influencer Performance' },
//     { value: 'financial', label: 'Financial Report' },
//     { value: 'custom', label: 'Custom Report' }
//   ];
  
//   const dateRanges = [
//     { value: '7d', label: 'Last 7 Days' },
//     { value: '30d', label: 'Last 30 Days' },
//     { value: '90d', label: 'Last 90 Days' },
//     { value: 'ytd', label: 'Year to Date' },
//     { value: 'custom', label: 'Custom Range' }
//   ];
  
//   const formats = [
//     { value: 'pdf', label: 'PDF Document' },
//     { value: 'excel', label: 'Excel Spreadsheet' },
//     { value: 'csv', label: 'CSV Data' },
//     { value: 'html', label: 'HTML Report' }
//   ];

//   return (
//     <Paper sx={{ p: 3, borderRadius: '16px', mb: 3 }}>
//       <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
//         <PictureAsPdf />
//         Generate Analytics Report
//       </Typography>
      
//       <Grid container spacing={3}>
//         <Grid item xs={12} md={6}>
//           <FormControl fullWidth>
//             <FormLabel>Report Type</FormLabel>
//             <Select
//               value={reportType}
//               onChange={(e) => setReportType(e.target.value)}
//               size="small"
//             >
//               {reportTypes.map((type) => (
//                 <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </Grid>
        
//         <Grid item xs={12} md={6}>
//           <FormControl fullWidth>
//             <FormLabel>Date Range</FormLabel>
//             <Select
//               value={dateRange}
//               onChange={(e) => setDateRange(e.target.value)}
//               size="small"
//             >
//               {dateRanges.map((range) => (
//                 <MenuItem key={range.value} value={range.value}>{range.label}</MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </Grid>
        
//         <Grid item xs={12} md={6}>
//           <FormControl fullWidth>
//             <FormLabel>Export Format</FormLabel>
//             <Select
//               value={format}
//               onChange={(e) => setFormat(e.target.value)}
//               size="small"
//             >
//               {formats.map((fmt) => (
//                 <MenuItem key={fmt.value} value={fmt.value}>{fmt.label}</MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </Grid>
        
//         <Grid item xs={12} md={6}>
//           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
//             <FormControlLabel
//               control={
//                 <Checkbox 
//                   checked={includeCharts} 
//                   onChange={(e) => setIncludeCharts(e.target.checked)}
//                 />
//               }
//               label="Include Charts & Graphs"
//             />
//             <FormControlLabel
//               control={
//                 <Checkbox 
//                   checked={includeData} 
//                   onChange={(e) => setIncludeData(e.target.checked)}
//                 />
//               }
//               label="Include Raw Data"
//             />
//           </Box>
//         </Grid>
        
//         <Grid item xs={12}>
//           <Divider sx={{ my: 2 }} />
//           <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
//             <Button
//               variant="outlined"
//               startIcon={<GetApp />}
//               onClick={() => onExport({ reportType, dateRange, format, includeCharts, includeData })}
//               disabled={loading}
//             >
//               Export Report
//             </Button>
//             <Button
//               variant="contained"
//               startIcon={loading ? <CircularProgress size={20} /> : <PictureAsPdf />}
//               onClick={() => onGenerate({ reportType, dateRange, format, includeCharts, includeData })}
//               disabled={loading}
//             >
//               {loading ? 'Generating...' : 'Generate Report'}
//             </Button>
//           </Box>
//         </Grid>
//       </Grid>
//     </Paper>
//   );
// };

// // Main Brand Analytics Component
// const BrandAnalytics = () => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("md"));
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();
  
//   const [timeRange, setTimeRange] = useState("30d");
//   const [activeTab, setActiveTab] = useState(0);
//   const [selectedCampaign, setSelectedCampaign] = useState(null);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
//   const [userDialogOpen, setUserDialogOpen] = useState(false);
//   const [lastRefresh, setLastRefresh] = useState(new Date());
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filters, setFilters] = useState({
//     dateRange: '30d',
//     status: 'all',
//     category: 'all',
//     budgetRange: 'all'
//   });
//   const [generatingReport, setGeneratingReport] = useState(false);
//   const [viewMode, setViewMode] = useState('overview');
//   const [chartData, setChartData] = useState({
//     campaignPerformance: [],
//     applicationTrends: [],
//     roiComparison: [],
//     influencerPerformance: [],
//     budgetAllocation: [],
//     engagementMetrics: []
//   });

//   // Real API calls
//   const {
//     data: campaigns = [],
//     loading: campaignsLoading,
//     error: campaignsError,
//     execute: fetchCampaigns,
//   } = useApi(campaignAPI.getBrandCampaigns, [], true);

//   const {
//     data: applications = [],
//     loading: applicationsLoading,
//     error: applicationsError,
//     execute: fetchApplications,
//   } = useApi(campaignAPI.getBrandApplications, [], true);

//   const loading = campaignsLoading || applicationsLoading;
//   const error = campaignsError || applicationsError;

//   // Enhanced metrics calculation
//   const metrics = useMemo(() => {
//     const totalCampaigns = campaigns.length;
//     const totalApplications = applications.length;
//     const totalBudget = campaigns.reduce((sum, c) => sum + (c?.budget || 0), 0);
//     const approvedApplications = applications.filter(a => a?.status === "approved").length;
//     const activeCampaigns = campaigns.filter(c => c?.status === "active").length;
//     const pendingApplications = applications.filter(a => a?.status === "pending").length;
//     const completionRate = totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0;
    
//     // Calculate influencers engaged (unique influencers across all applications)
//     const uniqueInfluencers = new Set(applications.map(app => app.influencer_id)).size;
    
//     // Calculate ROI (simplified - in real app this would be more complex)
//     const totalROI = totalBudget > 0 ? ((totalBudget * 1.42 - totalBudget) / totalBudget) * 100 : 0;

//     // Calculate trends
//     const recentApplications = applications.filter(app => {
//       const appDate = new Date(app.applied_at);
//       const daysAgo = new Date();
//       daysAgo.setDate(daysAgo.getDate() - 7);
//       return appDate > daysAgo;
//     });

//     const trendValue = recentApplications.length > 0 ? 
//       Math.round((recentApplications.length / 7) * 100 / Math.max(totalApplications / 30, 1)) : 0;

//     // Calculate average engagement rate
//     const engagementRates = applications.map(app => {
//       // Simulated engagement rate calculation
//       return Math.random() * 10 + 1; // Random between 1-11%
//     });
//     const avgEngagementRate = engagementRates.length > 0 
//       ? (engagementRates.reduce((a, b) => a + b, 0) / engagementRates.length).toFixed(1)
//       : 0;

//     // Calculate cost per engagement
//     const costPerEngagement = totalBudget > 0 && totalApplications > 0 
//       ? (totalBudget / totalApplications).toFixed(2)
//       : 0;

//     return {
//       totalCampaigns,
//       totalApplications,
//       totalBudget,
//       approvedApplications,
//       activeCampaigns,
//       pendingApplications,
//       completionRate,
//       uniqueInfluencers,
//       totalROI,
//       avgEngagementRate,
//       costPerEngagement,
//       trends: {
//         totalCampaigns: { value: `${Math.abs(trendValue)}%`, positive: trendValue > 0 },
//         totalApplications: { value: `${Math.abs(trendValue)}%`, positive: trendValue > 0 },
//         completionRate: { value: "+5%", positive: true },
//         activeCampaigns: { value: "+8%", positive: true },
//         totalROI: { value: "+12%", positive: true },
//         avgEngagementRate: { value: "+3%", positive: true }
//       }
//     };
//   }, [campaigns, applications]);

//   // Enhanced real-time activities
//   const realTimeActivities = useMemo(() => {
//     const activities = [];
    
//     // Recent applications
//     const recentApps = applications
//       .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at))
//       .slice(0, 3);
    
//     recentApps.forEach(app => {
//       activities.push({
//         message: `New application from ${app.influencer_name}`,
//         details: `Campaign: ${app.campaign_title}`,
//         time: formatTimeAgo(app.applied_at),
//         status: 'New',
//         type: 'application',
//         color: theme.palette.primary.main
//       });
//     });

//     // Campaign updates
//     const recentCampaigns = campaigns
//       .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
//       .slice(0, 2);
    
//     recentCampaigns.forEach(campaign => {
//       activities.push({
//         message: `Campaign "${campaign.title}" updated`,
//         details: `Status: ${campaign.status}`,
//         time: formatTimeAgo(campaign.updated_at || campaign.created_at),
//         status: 'Updated',
//         type: 'campaign',
//         color: theme.palette.secondary.main
//       });
//     });

//     // Add some simulated activities
//     activities.push({
//       message: "Monthly performance report generated",
//       details: "Download available in reports section",
//       time: formatTimeAgo(subDays(new Date(), 1)),
//       status: 'Completed',
//       type: 'report',
//       color: theme.palette.success.main
//     });

//     activities.push({
//       message: "Influencer payment processed",
//       details: "Amount: $2,500",
//       time: formatTimeAgo(subDays(new Date(), 2)),
//       status: 'Completed',
//       type: 'payment',
//       color: theme.palette.warning.main
//     });

//     return activities;
//   }, [applications, campaigns, theme]);

//   // Enhanced chart data - Generate realistic data
//   useEffect(() => {
//     if (campaigns.length > 0) {
//       // Campaign Performance Data
//       const campaignPerformanceData = campaigns.slice(0, 6).map((campaign, index) => ({
//         label: campaign.title.length > 15 ? campaign.title.substring(0, 12) + '...' : campaign.title,
//         value: campaign.applications?.length || 0,
//         change: Math.random() > 0.5 ? Math.random() * 30 + 5 : -(Math.random() * 20 + 5)
//       }));

//       // Application Trends Data (last 7 days)
//       const applicationTrendsData = Array.from({ length: 7 }, (_, i) => {
//         const date = subDays(new Date(), 6 - i);
//         return {
//           label: date.toISOString(),
//           value: Math.floor(Math.random() * 50) + 20
//         };
//       });

//       // ROI Comparison Data
//       const roiComparisonData = campaigns.slice(0, 5).map(campaign => ({
//         label: campaign.title.length > 12 ? campaign.title.substring(0, 10) + '...' : campaign.title,
//         value: Math.round((campaign.budget || 0) * (Math.random() * 0.5 + 0.8)),
//         change: Math.random() > 0.4 ? Math.random() * 25 + 5 : -(Math.random() * 15 + 5)
//       }));

//       // Influencer Performance Data
//       const influencerPerformanceData = Array.from({ length: 8 }, (_, i) => ({
//         label: `Influencer ${i + 1}`,
//         value: Math.floor(Math.random() * 1000) + 500,
//         change: Math.random() > 0.5 ? Math.random() * 40 + 10 : -(Math.random() * 20 + 5)
//       }));

//       // Budget Allocation Data
//       const budgetAllocationData = campaigns.slice(0, 5).map(campaign => ({
//         label: campaign.category || 'General',
//         values: [
//           Math.round((campaign.budget || 0) * 0.6), // Spent
//           Math.round((campaign.budget || 0) * 0.4)  // Remaining
//         ]
//       }));

//       // Engagement Metrics Data
//       const engagementMetricsData = [
//         { label: 'Instagram', value: Math.floor(Math.random() * 1000) + 500 },
//         { label: 'YouTube', value: Math.floor(Math.random() * 800) + 300 },
//         { label: 'TikTok', value: Math.floor(Math.random() * 1200) + 600 },
//         { label: 'Facebook', value: Math.floor(Math.random() * 600) + 200 },
//         { label: 'Twitter', value: Math.floor(Math.random() * 400) + 100 }
//       ];

//       setChartData({
//         campaignPerformance: campaignPerformanceData,
//         applicationTrends: applicationTrendsData,
//         roiComparison: roiComparisonData,
//         influencerPerformance: influencerPerformanceData,
//         budgetAllocation: budgetAllocationData,
//         engagementMetrics: engagementMetricsData
//       });
//     }
//   }, [campaigns]);

//   // Enhanced chart data for donut charts
//   const campaignStatusData = useMemo(() => [
//     { name: "Active", value: campaigns.filter(c => c?.status === "active").length, color: "#00C49F" },
//     { name: "Paused", value: campaigns.filter(c => c?.status === "paused").length, color: "#FFBB28" },
//     { name: "Completed", value: campaigns.filter(c => c?.status === "completed").length, color: "#FF8042" },
//     { name: "Draft", value: campaigns.filter(c => c?.status === "draft").length, color: "#8884d8" },
//   ], [campaigns]);

//   const applicationStatusData = useMemo(() => [
//     { name: "Approved", value: applications.filter(a => a?.status === "approved").length, color: "#00C49F" },
//     { name: "Pending", value: applications.filter(a => a?.status === "pending").length, color: "#FFBB28" },
//     { name: "Rejected", value: applications.filter(a => a?.status === "rejected").length, color: "#FF8042" },
//     { name: "Contracted", value: applications.filter(a => a?.status === "contracted").length, color: "#8884d8" },
//   ], [applications]);

//   // KPI Metrics Data
//   const kpiMetricsData = useMemo(() => [
//     {
//       label: "ROI",
//       value: metrics.totalROI.toFixed(1),
//       suffix: "%",
//       color: theme.palette.success.main,
//       target: 150,
//       change: 12,
//       description: "Return on investment across all campaigns"
//     },
//     {
//       label: "Engagement Rate",
//       value: metrics.avgEngagementRate,
//       suffix: "%",
//       color: theme.palette.primary.main,
//       target: 8,
//       change: 3,
//       description: "Average engagement rate from influencers"
//     },
//     {
//       label: "Cost per Application",
//       value: `$${metrics.costPerEngagement}`,
//       color: theme.palette.warning.main,
//       target: 250,
//       change: -5,
//       description: "Average cost per application received"
//     },
//     {
//       label: "Approval Rate",
//       value: metrics.completionRate.toFixed(1),
//       suffix: "%",
//       color: theme.palette.info.main,
//       target: 70,
//       change: 5,
//       description: "Percentage of approved applications"
//     }
//   ], [metrics, theme]);

//   // Multi-series data for budget allocation
//   const budgetAllocationSeriesData = useMemo(() => {
//     const categories = [...new Set(campaigns.map(c => c.category))].slice(0, 5);
//     return categories.map(category => ({
//       label: category,
//       values: [
//         campaigns.filter(c => c.category === category).reduce((sum, c) => sum + (c.budget || 0) * 0.6, 0), // Spent
//         campaigns.filter(c => c.category === category).reduce((sum, c) => sum + (c.budget || 0) * 0.4, 0), // Remaining
//         campaigns.filter(c => c.category === category).reduce((sum, c) => sum + (c.budget || 0) * 0.2, 0)  // Projected
//       ]
//     }));
//   }, [campaigns]);

//   // AI Suggestions based on data
//   const aiSuggestions = useMemo(() => [
//     {
//       title: "Boost Campaign Performance",
//       description: "Your active campaigns have 68% approval rate. Consider increasing budget for top performers.",
//       action: { label: "Optimize Budget", onClick: () => navigate('/brand/campaigns') },
//       icon: <RocketLaunch />,
//       color: "#2196F3"
//     },
//     {
//       title: "Engage Top Influencers",
//       description: "3 high-performing influencers are available in your category. Send them collaboration invites.",
//       action: { label: "View Influencers", onClick: () => navigate('/brand/influencers') },
//       icon: <Group />,
//       color: "#4CAF50"
//     },
//     {
//       title: "Improve ROI",
//       description: "Campaigns in Beauty category show 42% higher ROI. Consider focusing on this category.",
//       action: { label: "Analyze Categories", onClick: () => setActiveTab(1) },
//       icon: <Insights />,
//       color: "#FF9800"
//     },
//     {
//       title: "Generate Monthly Report",
//       description: "It's time to generate your monthly performance report. Click to create comprehensive analytics.",
//       action: { label: "Generate Report", onClick: () => setActiveTab(4) },
//       icon: <Assessment />,
//       color: "#9C27B0"
//     }
//   ], [navigate]);

//   const refetchAll = () => {
//     fetchCampaigns();
//     fetchApplications();
//     setLastRefresh(new Date());
//   };

//   // Auto-refresh
//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (!loading) {
//         refetchAll();
//       }
//     }, 30000);

//     return () => clearInterval(interval);
//   }, [loading]);

//   const handleFilterChange = (filterName, value) => {
//     setFilters(prev => ({ ...prev, [filterName]: value }));
//   };

//   const clearAllFilters = () => {
//     setFilters({
//       dateRange: '30d',
//       status: 'all',
//       category: 'all',
//       budgetRange: 'all'
//     });
//     setSearchTerm("");
//   };

//   const handleCampaignClick = (campaign) => {
//     setSelectedCampaign(campaign);
//     setCampaignDialogOpen(true);
//   };

//   const handleUserClick = async (userId) => {
//     try {
//       const userData = await profileAPI.getProfileById(userId);
//       setSelectedUser(userData.profile);
//       setUserDialogOpen(true);
//     } catch (error) {
//       console.error('Error fetching user data:', error);
//     }
//   };

//   const handleExportReport = async (options) => {
//     setGeneratingReport(true);
//     try {
//       // Simulate report generation
//       await new Promise(resolve => setTimeout(resolve, 2000));
      
//       // In a real application, this would call an API endpoint
//       const reportData = {
//         ...options,
//         timestamp: new Date().toISOString(),
//         metrics,
//         totalCampaigns: campaigns.length,
//         totalApplications: applications.length
//       };
      
//       console.log('Generating report:', reportData);
      
//       // For demo purposes, create a downloadable JSON file
//       const dataStr = JSON.stringify(reportData, null, 2);
//       const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
//       const exportFileDefaultName = `brand-analytics-report-${new Date().toISOString().split('T')[0]}.json`;
      
//       const linkElement = document.createElement('a');
//       linkElement.setAttribute('href', dataUri);
//       linkElement.setAttribute('download', exportFileDefaultName);
//       linkElement.click();
      
//     } catch (error) {
//       console.error('Error generating report:', error);
//     } finally {
//       setGeneratingReport(false);
//     }
//   };

//   const handleGenerateReport = async (options) => {
//     setGeneratingReport(true);
//     try {
//       // Simulate report generation
//       await new Promise(resolve => setTimeout(resolve, 3000));
      
//       // In a real application, this would generate a PDF/Excel report
//       alert(`Report generated successfully! Check your downloads for ${options.format.toUpperCase()} file.`);
      
//     } catch (error) {
//       console.error('Error generating report:', error);
//     } finally {
//       setGeneratingReport(false);
//     }
//   };

//   // Filter Section Component
//   const AnalyticsFilterSection = ({ filters, onFilterChange, onClearFilters }) => {
//     const [expanded, setExpanded] = useState(false);

//     return (
//       <Paper sx={{ p: 3, borderRadius: '16px', mb: 3 }}>
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//           <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
//             <FilterList />
//             Analytics Filters
//           </Typography>
//           <Box sx={{ display: 'flex', gap: 1 }}>
//             <Button 
//               size="small" 
//               onClick={() => setExpanded(!expanded)}
//               startIcon={<ExpandMore sx={{ transform: expanded ? 'rotate(180deg)' : 'none' }} />}
//             >
//               {expanded ? 'Hide' : 'Show'} Filters
//             </Button>
//             <Button size="small" onClick={onClearFilters} startIcon={<Refresh />}>
//               Clear All
//             </Button>
//           </Box>
//         </Box>

//         <Accordion expanded={expanded} sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
//           <AccordionSummary sx={{ display: 'none' }} />
//           <AccordionDetails sx={{ pt: 0 }}>
//             <Grid container spacing={3}>
//               <Grid item xs={12} sm={6} md={3}>
//                 <FormControl fullWidth size="small">
//                   <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
//                     Date Range
//                   </Typography>
//                   <Select
//                     value={filters.dateRange}
//                     onChange={(e) => onFilterChange('dateRange', e.target.value)}
//                   >
//                     <MenuItem value="7d">Last 7 days</MenuItem>
//                     <MenuItem value="30d">Last 30 days</MenuItem>
//                     <MenuItem value="90d">Last 90 days</MenuItem>
//                     <MenuItem value="custom">Custom Range</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>

//               <Grid item xs={12} sm={6} md={3}>
//                 <FormControl fullWidth size="small">
//                   <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
//                     Campaign Status
//                   </Typography>
//                   <Select
//                     value={filters.status}
//                     onChange={(e) => onFilterChange('status', e.target.value)}
//                   >
//                     <MenuItem value="all">All Status</MenuItem>
//                     <MenuItem value="active">Active</MenuItem>
//                     <MenuItem value="paused">Paused</MenuItem>
//                     <MenuItem value="completed">Completed</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>

//               <Grid item xs={12} sm={6} md={3}>
//                 <FormControl fullWidth size="small">
//                   <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
//                     Category
//                   </Typography>
//                   <Select
//                     value={filters.category}
//                     onChange={(e) => onFilterChange('category', e.target.value)}
//                   >
//                     <MenuItem value="all">All Categories</MenuItem>
//                     <MenuItem value="fashion">Fashion</MenuItem>
//                     <MenuItem value="beauty">Beauty</MenuItem>
//                     <MenuItem value="lifestyle">Lifestyle</MenuItem>
//                     <MenuItem value="technology">Technology</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>

//               <Grid item xs={12} sm={6} md={3}>
//                 <FormControl fullWidth size="small">
//                   <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
//                     Budget Range
//                   </Typography>
//                   <Select
//                     value={filters.budgetRange}
//                     onChange={(e) => onFilterChange('budgetRange', e.target.value)}
//                   >
//                     <MenuItem value="all">All Budgets</MenuItem>
//                     <MenuItem value="0-1000">$0 - $1,000</MenuItem>
//                     <MenuItem value="1000-5000">$1,000 - $5,000</MenuItem>
//                     <MenuItem value="5000+">$5,000+</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
//             </Grid>
//           </AccordionDetails>
//         </Accordion>
//       </Paper>
//     );
//   };

//   // Campaign Detail Dialog Component
//   const CampaignDetailDialog = ({ open, onClose, campaign, onEdit }) => {
//     const theme = useTheme();
//     const navigate = useNavigate();

//     if (!campaign) return null;

//     const handleViewApplications = () => {
//       onClose();
//       navigate('/brand/applications');
//     };

//     const handleViewAnalytics = () => {
//       onClose();
//       navigate(`/brand/analytics?campaign=${campaign._id}`);
//     };

//     const performanceMetrics = [
//       { label: 'Applications Received', value: campaign.applications?.length || 0, color: 'primary' },
//       { label: 'Approval Rate', value: '68%', color: 'success' },
//       { label: 'Engagement Rate', value: '4.2%', color: 'info' },
//       { label: 'ROI', value: '142%', color: 'warning' },
//     ];

//     return (
//       <Dialog 
//         open={open} 
//         onClose={onClose}
//         maxWidth="lg"
//         fullWidth
//         PaperProps={{ sx: { borderRadius: '20px' } }}
//       >
//         <DialogTitle sx={{ 
//           background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
//           color: 'white',
//           fontWeight: 700
//         }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//             <CampaignIcon sx={{ fontSize: 32 }} />
//             <Box>
//               <Typography variant="h5">
//                 {campaign.title}
//               </Typography>
//               <Typography variant="body2" sx={{ opacity: 0.9 }}>
//                 Campaign Performance & Details
//               </Typography>
//             </Box>
//           </Box>
//         </DialogTitle>
        
//         <DialogContent dividers sx={{ p: 4 }}>
//           <Grid container spacing={4}>
//             {/* Campaign Overview */}
//             <Grid item xs={12} md={8}>
//               <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
//                 Campaign Overview
//               </Typography>
              
//               <Grid container spacing={3}>
//                 <Grid item xs={12} sm={6}>
//                   <Paper sx={{ p: 2.5, borderRadius: '12px', background: theme.palette.grey[50] }}>
//                     <Typography variant="body2" color="text.secondary">
//                       Budget
//                     </Typography>
//                     <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main' }}>
//                       {formatCurrency(campaign.budget, campaign.currency)}
//                     </Typography>
//                   </Paper>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Paper sx={{ p: 2.5, borderRadius: '12px', background: theme.palette.grey[50] }}>
//                     <Typography variant="body2" color="text.secondary">
//                       Status
//                     </Typography>
//                     <Chip 
//                       label={campaign.status} 
//                       color={
//                         campaign.status === "active" ? "success" :
//                         campaign.status === "paused" ? "warning" : "default"
//                       }
//                       sx={{ fontWeight: 700, mt: 0.5 }}
//                     />
//                   </Paper>
//                 </Grid>
                
//                 <Grid item xs={12} sm={6}>
//                   <Paper sx={{ p: 2.5, borderRadius: '12px', background: theme.palette.grey[50] }}>
//                     <Typography variant="body2" color="text.secondary">
//                       Category
//                     </Typography>
//                     <Typography variant="h6" sx={{ fontWeight: 700 }}>
//                       {campaign.category}
//                     </Typography>
//                   </Paper>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Paper sx={{ p: 2.5, borderRadius: '12px', background: theme.palette.grey[50] }}>
//                     <Typography variant="body2" color="text.secondary">
//                       Deadline
//                     </Typography>
//                     <Typography variant="h6" sx={{ fontWeight: 700 }}>
//                       {new Date(campaign.deadline).toLocaleDateString()}
//                     </Typography>
//                   </Paper>
//                 </Grid>
//               </Grid>

//               {/* Performance Metrics */}
//               <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>
//                 Performance Metrics
//               </Typography>
//               <Grid container spacing={2}>
//                 {performanceMetrics.map((metric, index) => (
//                   <Grid item xs={6} sm={3} key={index}>
//                     <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
//                       <Typography variant="h4" sx={{ 
//                         fontWeight: 800,
//                         color: `${metric.color}.main`
//                       }}>
//                         {metric.value}
//                       </Typography>
//                       <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
//                         {metric.label}
//                       </Typography>
//                     </Paper>
//                   </Grid>
//                 ))}
//               </Grid>

//               {/* Campaign Description */}
//               {campaign.description && (
//                 <>
//                   <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>
//                     Description
//                   </Typography>
//                   <Paper sx={{ p: 3, borderRadius: '12px' }}>
//                     <Typography variant="body1">
//                       {campaign.description}
//                     </Typography>
//                   </Paper>
//                 </>
//               )}
//             </Grid>

//             {/* Quick Actions & Timeline */}
//             <Grid item xs={12} md={4}>
//               <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
//                 Quick Actions
//               </Typography>
              
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
//                 <Button 
//                   variant="contained" 
//                   startIcon={<Visibility />}
//                   onClick={handleViewApplications}
//                   sx={{ borderRadius: '8px', py: 1.5 }}
//                 >
//                   View Applications
//                 </Button>
//                 <Button 
//                   variant="outlined" 
//                   startIcon={<Analytics />}
//                   onClick={handleViewAnalytics}
//                   sx={{ borderRadius: '8px', py: 1.5 }}
//                 >
//                   Detailed Analytics
//                 </Button>
//                 <Button 
//                   variant="outlined" 
//                   startIcon={<Edit />}
//                   onClick={onEdit}
//                   sx={{ borderRadius: '8px', py: 1.5 }}
//                 >
//                   Edit Campaign
//                 </Button>
//               </Box>

//               {/* Campaign Timeline */}
//               <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
//                 Campaign Timeline
//               </Typography>
//               <Stepper orientation="vertical" sx={{ mb: 3 }}>
//                 <Step completed>
//                   <StepLabel>Campaign Created</StepLabel>
//                 </Step>
//                 <Step completed>
//                   <StepLabel>Applications Open</StepLabel>
//                 </Step>
//                 <Step completed={campaign.status !== 'draft'}>
//                   <StepLabel>In Progress</StepLabel>
//                 </Step>
//                 <Step completed={campaign.status === 'completed'}>
//                   <StepLabel>Completed</StepLabel>
//                 </Step>
//               </Stepper>
//             </Grid>
//           </Grid>
//         </DialogContent>

//         <DialogActions sx={{ p: 3 }}>
//           <Button onClick={onClose} variant="outlined">
//             Close
//           </Button>
//           <Button variant="contained" onClick={onEdit} startIcon={<Edit />}>
//             Edit Campaign
//           </Button>
//         </DialogActions>
//       </Dialog>
//     );
//   };

//   // User Profile Dialog Component
//   const UserProfileDialog = ({ open, onClose, user, type = 'influencer' }) => {
//     const theme = useTheme();
//     const navigate = useNavigate();

//     if (!user) return null;

//     const handleViewFullProfile = () => {
//       onClose();
//       navigate(`/brand/profile/view/${type}/${user._id}`);
//     };

//     const handleStartChat = () => {
//       onClose();
//       navigate(`/brand/collaborations?user=${user._id}`);
//     };

//     return (
//       <Dialog 
//         open={open} 
//         onClose={onClose}
//         maxWidth="md"
//         fullWidth
//         PaperProps={{ sx: { borderRadius: '20px' } }}
//       >
//         <DialogTitle sx={{ 
//           background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
//           color: 'white',
//           fontWeight: 700
//         }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//             <AccountCircle sx={{ fontSize: 32 }} />
//             <Box>
//               <Typography variant="h5">
//                 {user.nickname || user.company_name || 'User Profile'}
//               </Typography>
//               <Typography variant="body2" sx={{ opacity: 0.9 }}>
//                 {type === 'influencer' ? 'Influencer Profile' : 'Brand Profile'}
//               </Typography>
//             </Box>
//           </Box>
//         </DialogTitle>
        
//         <DialogContent dividers sx={{ p: 4 }}>
//           <Grid container spacing={4}>
//             {/* Profile Overview */}
//             <Grid item xs={12} md={4}>
//               <Box sx={{ textAlign: 'center', mb: 3 }}>
//                 <Avatar 
//                   src={user.profile_picture || user.logo} 
//                   sx={{ 
//                     width: 120, 
//                     height: 120, 
//                     mx: 'auto',
//                     mb: 2,
//                     border: `4px solid ${theme.palette.primary.main}20`
//                   }}
//                 />
//                 <Typography variant="h6" sx={{ fontWeight: 700 }}>
//                   {user.nickname || user.company_name}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   {user.full_name || user.contact_person_name}
//                 </Typography>
//                 <Chip 
//                   label={type} 
//                   color="primary" 
//                   sx={{ mt: 1, fontWeight: 600 }}
//                 />
//               </Box>

//               {/* Quick Stats */}
//               <Paper sx={{ p: 2, borderRadius: '12px', background: theme.palette.grey[50] }}>
//                 <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
//                   Quick Stats
//                 </Typography>
//                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
//                   {user.followers && (
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                       <Typography variant="body2">Followers</Typography>
//                       <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                         {user.followers.toLocaleString()}
//                       </Typography>
//                     </Box>
//                   )}
//                   {user.engagement_rate && (
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                       <Typography variant="body2">Engagement Rate</Typography>
//                       <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
//                         {user.engagement_rate}%
//                       </Typography>
//                     </Box>
//                   )}
//                   {user.rating && (
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                       <Typography variant="body2">Rating</Typography>
//                       <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>
//                         ⭐ {user.rating}/5
//                       </Typography>
//                     </Box>
//                   )}
//                 </Box>
//               </Paper>
//             </Grid>

//             {/* Detailed Information */}
//             <Grid item xs={12} md={8}>
//               <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
//                 Profile Information
//               </Typography>
              
//               <Grid container spacing={2} sx={{ mb: 3 }}>
//                 <Grid item xs={12} sm={6}>
//                   <Typography variant="body2" color="text.secondary">
//                     Email
//                   </Typography>
//                   <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                     {user.email || 'N/A'}
//                   </Typography>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Typography variant="body2" color="text.secondary">
//                     Location
//                   </Typography>
//                   <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                     {user.location || 'N/A'}
//                   </Typography>
//                 </Grid>
//                 {user.categories && (
//                   <Grid item xs={12}>
//                     <Typography variant="body2" color="text.secondary">
//                       Categories
//                     </Typography>
//                     <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
//                       {user.categories.slice(0, 5).map((category, index) => (
//                         <Chip key={index} label={category} size="small" variant="outlined" />
//                       ))}
//                     </Box>
//                   </Grid>
//                 )}
//               </Grid>

//               {user.bio && (
//                 <>
//                   <Typography variant="body2" color="text.secondary">
//                     Bio
//                   </Typography>
//                   <Typography variant="body2" sx={{ mb: 3, fontStyle: 'italic' }}>
//                     "{user.bio}"
//                   </Typography>
//                 </>
//               )}

//               {/* Social Media Links */}
//               {(user.instagram || user.youtube || user.tiktok) && (
//                 <>
//                   <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
//                     Social Media
//                   </Typography>
//                   <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//                     {user.instagram && (
//                       <Chip icon={<Instagram />} label="Instagram" variant="outlined" size="small" />
//                     )}
//                     {user.youtube && (
//                       <Chip icon={<YouTube />} label="YouTube" variant="outlined" size="small" />
//                     )}
//                     {user.tiktok && (
//                       <Chip icon={<SmartDisplay />} label="TikTok" variant="outlined" size="small" />
//                     )}
//                   </Box>
//                 </>
//               )}
//             </Grid>
//           </Grid>
//         </DialogContent>

//         <DialogActions sx={{ p: 3, gap: 1 }}>
//           <Button onClick={onClose} variant="outlined">
//             Close
//           </Button>
//           <Button onClick={handleStartChat} variant="outlined" startIcon={<Message />}>
//             Start Chat
//           </Button>
//           <Button onClick={handleViewFullProfile} variant="contained" startIcon={<Visibility />}>
//             View Full Profile
//           </Button>
//         </DialogActions>
//       </Dialog>
//     );
//   };

//   if (loading) {
//     return (
//       <Box sx={{ 
//         display: "flex", 
//         flexDirection: "column", 
//         justifyContent: "center", 
//         alignItems: "center", 
//         minHeight: "60vh",
//         background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
//       }}>
//         <CircularProgress 
//           size={60} 
//           thickness={4}
//           sx={{ 
//             mb: 3,
//             color: 'white',
//           }} 
//         />
//         <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
//           Loading Real-Time Analytics...
//         </Typography>
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box sx={{ p: 3 }}>
//         <Alert 
//           severity="error" 
//           sx={{ mb: 3, borderRadius: 3 }}
//           action={
//             <Button color="inherit" size="small" onClick={refetchAll}>
//               RETRY
//             </Button>
//           }
//         >
//           {error}
//         </Alert>
//       </Box>
//     );
//   }

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Box sx={{ 
//         minHeight: "100vh",
//         background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
//         p: { xs: 1, sm: 2, md: 3 }
//       }}>
//         {/* Header Section */}
//         <Box sx={{ mb: 4 }}>
//           <Box sx={{ 
//             display: "flex", 
//             justifyContent: "space-between", 
//             alignItems: { xs: "flex-start", sm: "center" },
//             flexDirection: { xs: "column", sm: "row" },
//             mb: 3,
//             gap: 2
//           }}>
//             <Box>
//               <Typography variant="h3" sx={{ 
//                 fontWeight: 800, 
//                 background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
//                 backgroundClip: "text",
//                 WebkitBackgroundClip: "text",
//                 WebkitTextFillColor: "transparent",
//                 mb: 1,
//                 fontSize: { xs: '2rem', md: '3rem' }
//               }}>
//                 Campaign Analytics Dashboard
//               </Typography>
//               <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 600 }}>
//                 Comprehensive insights and performance metrics for your influencer marketing campaigns • 
//                 Last updated: {lastRefresh.toLocaleTimeString()}
//               </Typography>
//             </Box>
            
//             <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: 'wrap' }}>
//               <Button
//                 variant="outlined"
//                 startIcon={<PictureAsPdf />}
//                 onClick={() => handleExportReport('pdf')}
//                 sx={{ borderRadius: '12px' }}
//               >
//                 Export PDF
//               </Button>
//               <Button
//                 variant="outlined"
//                 startIcon={<GetApp />}
//                 onClick={() => handleExportReport('csv')}
//                 sx={{ borderRadius: '12px' }}
//               >
//                 Export CSV
//               </Button>
//               <IconButton 
//                 onClick={refetchAll} 
//                 disabled={loading}
//                 sx={{ 
//                   backgroundColor: "white",
//                   boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
//                   "&:hover": { 
//                     backgroundColor: "grey.50",
//                   }
//                 }}
//               >
//                 <Refresh />
//               </IconButton>
//             </Box>
//           </Box>

//           {/* Search and Filters */}
//           <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
//             <TextField
//               size="small"
//               placeholder="Search campaigns, influencers, categories..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <Search />
//                   </InputAdornment>
//                 ),
//               }}
//               sx={{ 
//                 minWidth: 300, 
//                 background: 'white', 
//                 borderRadius: '12px',
//                 flex: 1
//               }}
//             />
            
//             <FormControl size="small" sx={{ minWidth: 140 }}>
//               <Select
//                 value={timeRange}
//                 onChange={(e) => setTimeRange(e.target.value)}
//                 sx={{ borderRadius: '12px', background: 'white', fontWeight: 600 }}
//               >
//                 <MenuItem value="7d">Last 7 days</MenuItem>
//                 <MenuItem value="30d">Last 30 days</MenuItem>
//                 <MenuItem value="90d">Last 90 days</MenuItem>
//                 <MenuItem value="1y">Last Year</MenuItem>
//               </Select>
//             </FormControl>
//           </Box>

//           <AnalyticsFilterSection 
//             filters={filters}
//             onFilterChange={handleFilterChange}
//             onClearFilters={clearAllFilters}
//           />
//         </Box>

//         {/* Key Metrics Section */}
//         <Grid container spacing={3} sx={{ mb: 4 }}>
//           <Grid item xs={12} sm={6} lg={3}>
//             <MetricCard
//               title="Total Campaigns Run"
//               value={metrics.totalCampaigns}
//               subtitle={`${metrics.activeCampaigns} active`}
//               icon={<Campaign />}
//               color="#2196F3"
//               trend={metrics.trends.totalCampaigns}
//               onClick={() => setActiveTab(1)}
//             />
//           </Grid>
          
//           <Grid item xs={12} sm={6} lg={3}>
//             <MetricCard
//               title="Influencers Engaged"
//               value={metrics.uniqueInfluencers}
//               subtitle={`${metrics.approvedApplications} approved`}
//               icon={<People />}
//               color="#4CAF50"
//               trend={metrics.trends.totalApplications}
//               onClick={() => setActiveTab(2)}
//             />
//           </Grid>
          
//           <Grid item xs={12} sm={6} lg={3}>
//             <MetricCard
//               title="Total Budget Spent"
//               value={formatCurrency(metrics.totalBudget, "USD")}
//               subtitle={`Across ${campaigns.length} campaigns`}
//               icon={<AttachMoney />}
//               color="#FF9800"
//             />
//           </Grid>
          
//           <Grid item xs={12} sm={6} lg={3}>
//             <MetricCard
//               title="Overall ROI"
//               value={`${metrics.totalROI.toFixed(1)}%`}
//               subtitle="Return on Investment"
//               icon={<TrendingUp />}
//               color="#9C27B0"
//               trend={metrics.trends.totalROI}
//               size="large"
//             />
//           </Grid>
//         </Grid>

//         {/* AI Suggestions */}
//         <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
//           <Lightbulb color="warning" />
//           AI-Powered Suggestions
//         </Typography>
//         <Grid container spacing={2} sx={{ mb: 4 }}>
//           {aiSuggestions.map((suggestion, index) => (
//             <Grid item xs={12} md={4} key={index}>
//               <AISuggestionCard {...suggestion} />
//             </Grid>
//           ))}
//         </Grid>

//         {/* Main Analytics Tabs */}
//         <Paper sx={{ mb: 3, borderRadius: "16px", overflow: 'hidden' }}>
//           <Tabs 
//             value={activeTab} 
//             onChange={(e, newValue) => setActiveTab(newValue)}
//             sx={{ 
//               px: 2, 
//               pt: 2,
//               '& .MuiTab-root': {
//                 fontWeight: 600,
//                 fontSize: '0.9rem',
//                 minHeight: '60px'
//               }
//             }}
//             variant="scrollable"
//             scrollButtons="auto"
//           >
//             <Tab icon={<Dashboard />} label="Overview Dashboard" />
//             <Tab icon={<Campaign />} label="Campaign Analytics" />
//             <Tab icon={<People />} label="Influencer Performance" />
//             <Tab icon={<ShowChart />} label="ROI & Trends" />
//             <Tab icon={<Assessment />} label="Detailed Reports" />
//           </Tabs>

//           <Box sx={{ p: 3 }}>
//             {/* Overview Dashboard Tab */}
//             {activeTab === 0 && (
//               <Grid container spacing={3}>
//                 {/* Charts Row 1 */}
//                 <Grid item xs={12} lg={8}>
//                   <Grid container spacing={3}>
//                     <Grid item xs={12} md={6}>
//                       <EnhancedDonutChart 
//                         data={campaignStatusData} 
//                         title="Campaign Status Distribution"
//                       />
//                     </Grid>
//                     <Grid item xs={12} md={6}>
//                       <EnhancedDonutChart 
//                         data={applicationStatusData} 
//                         title="Application Status"
//                       />
//                     </Grid>
//                     <Grid item xs={12}>
//                       <BarGraph 
//                         data={chartData.applicationTrends}
//                         title="Application Trends (Last 7 Days)"
//                         height={250}
//                         timeSeries={true}
//                         color="#2196F3"
//                       />
//                     </Grid>
//                   </Grid>
//                 </Grid>

//                 <Grid item xs={12} lg={4}>
//                   <Grid container spacing={3}>
//                     <Grid item xs={12}>
//                       <EnhancedRealTimeActivity activities={realTimeActivities} />
//                     </Grid>
//                     <Grid item xs={12} sm={6} lg={12}>
//                       <Paper sx={{ p: 3, borderRadius: "16px", textAlign: "center" }}>
//                         <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
//                           {metrics.completionRate.toFixed(1)}%
//                         </Typography>
//                         <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
//                           Overall Success Rate
//                         </Typography>
//                       </Paper>
//                     </Grid>
//                     <Grid item xs={12} sm={6} lg={12}>
//                       <Paper sx={{ p: 3, borderRadius: "16px", textAlign: "center" }}>
//                         <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.success.main }}>
//                           {metrics.uniqueInfluencers}
//                         </Typography>
//                         <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
//                           Unique Influencers
//                         </Typography>
//                       </Paper>
//                     </Grid>
//                   </Grid>
//                 </Grid>

//                 {/* Campaign Performance Bar Graph */}
//                 <Grid item xs={12} md={6}>
//                   <BarGraph 
//                     data={chartData.campaignPerformance}
//                     title="Campaign Performance (Applications)"
//                     height={300}
//                     showValues={true}
//                     color="#4CAF50"
//                   />
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   <HorizontalBarGraph 
//                     data={chartData.roiComparison}
//                     title="ROI Comparison by Campaign"
//                     height={300}
//                     showValues={true}
//                     color="#FF9800"
//                   />
//                 </Grid>

//                 {/* KPI Metrics */}
//                 <Grid item xs={12} md={6}>
//                   <KPIBarGraph 
//                     metrics={kpiMetricsData}
//                     title="Key Performance Indicators"
//                     height={350}
//                   />
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   <PerformanceComparisonGraph 
//                     campaigns={campaigns.slice(0, 5)}
//                     metrics={['applications', 'engagement', 'roi', 'budget']}
//                     height={350}
//                   />
//                 </Grid>

//                 {/* Performance Table */}
//                 <Grid item xs={12}>
//                   <EnhancedCampaignPerformanceTable 
//                     campaigns={campaigns} 
//                     onCampaignClick={handleCampaignClick}
//                     onUserClick={handleUserClick}
//                   />
//                 </Grid>
//               </Grid>
//             )}

//             {/* Campaign Analytics Tab */}
//             {activeTab === 1 && (
//               <Grid container spacing={3}>
//                 <Grid item xs={12}>
//                   <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
//                     Campaign Performance Analytics
//                   </Typography>
//                 </Grid>
                
//                 {/* Multi-series Bar Graph */}
//                 <Grid item xs={12} lg={8}>
//                   <MultiSeriesBarGraph 
//                     data={budgetAllocationSeriesData}
//                     title="Budget Allocation by Category"
//                     height={400}
//                     series={['Spent', 'Remaining', 'Projected']}
//                   />
//                 </Grid>
                
//                 <Grid item xs={12} lg={4}>
//                   <BarGraph 
//                     data={chartData.engagementMetrics}
//                     title="Engagement by Platform"
//                     height={400}
//                     horizontal={true}
//                     color="#9C27B0"
//                   />
//                 </Grid>
                
//                 {/* Time Series Analysis */}
//                 <Grid item xs={12}>
//                   <TimeSeriesBarGraph 
//                     data={chartData.applicationTrends}
//                     title="Application Trends Over Time"
//                     height={350}
//                     showTrendLine={true}
//                   />
//                 </Grid>
                
//                 {/* Campaign Comparison */}
//                 <Grid item xs={12}>
//                   <PerformanceComparisonGraph 
//                     campaigns={campaigns.slice(0, 8)}
//                     metrics={['applications', 'engagement', 'roi']}
//                     height={400}
//                   />
//                 </Grid>
//               </Grid>
//             )}

//             {/* Influencer Performance Tab */}
//             {activeTab === 2 && (
//               <Grid container spacing={3}>
//                 <Grid item xs={12}>
//                   <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
//                     Influencer Performance Analytics
//                   </Typography>
//                 </Grid>
                
//                 <Grid item xs={12} md={8}>
//                   <BarGraph 
//                     data={chartData.influencerPerformance}
//                     title="Top Performing Influencers"
//                     height={400}
//                     showValues={true}
//                     color="#2196F3"
//                   />
//                 </Grid>
                
//                 <Grid item xs={12} md={4}>
//                   <KPIBarGraph 
//                     metrics={[
//                       {
//                         label: "Avg. Engagement Rate",
//                         value: metrics.avgEngagementRate,
//                         suffix: "%",
//                         color: theme.palette.success.main,
//                         target: 8,
//                         change: 3,
//                         description: "Average across all influencers"
//                       },
//                       {
//                         label: "Top Influencer Score",
//                         value: "9.2",
//                         color: theme.palette.warning.main,
//                         target: 9,
//                         change: 2,
//                         description: "Highest rated influencer"
//                       },
//                       {
//                         label: "Response Rate",
//                         value: "78",
//                         suffix: "%",
//                         color: theme.palette.info.main,
//                         target: 80,
//                         change: 5,
//                         description: "Average response rate"
//                       },
//                       {
//                         label: "Content Quality",
//                         value: "8.5",
//                         color: theme.palette.primary.main,
//                         target: 8.5,
//                         change: 0,
//                         description: "Average content quality score"
//                       }
//                     ]}
//                     title="Influencer KPIs"
//                     height={400}
//                   />
//                 </Grid>
                
//                 {/* Platform Performance */}
//                 <Grid item xs={12}>
//                   <MultiSeriesBarGraph 
//                     data={[
//                       { label: 'Instagram', values: [1200, 800, 400] },
//                       { label: 'YouTube', values: [900, 600, 300] },
//                       { label: 'TikTok', values: [1500, 1000, 500] },
//                       { label: 'Facebook', values: [700, 400, 200] },
//                       { label: 'Twitter', values: [500, 300, 150] }
//                     ]}
//                     title="Platform Performance Metrics"
//                     height={350}
//                     series={['Reach', 'Engagement', 'Conversions']}
//                   />
//                 </Grid>
//               </Grid>
//             )}

//             {/* ROI & Trends Tab */}
//             {activeTab === 3 && (
//               <Grid container spacing={3}>
//                 <Grid item xs={12}>
//                   <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
//                     ROI Analysis & Trends
//                   </Typography>
//                 </Grid>
                
//                 <Grid item xs={12} lg={8}>
//                   <TimeSeriesBarGraph 
//                     data={chartData.applicationTrends.map((item, index) => ({
//                       ...item,
//                       value: Math.round(item.value * (Math.random() * 10 + 5))
//                     }))}
//                     title="Revenue Trends (Last 7 Days)"
//                     height={400}
//                     showTrendLine={true}
//                   />
//                 </Grid>
                
//                 <Grid item xs={12} lg={4}>
//                   <KPIBarGraph 
//                     metrics={[
//                       {
//                         label: "Overall ROI",
//                         value: metrics.totalROI.toFixed(1),
//                         suffix: "%",
//                         color: theme.palette.success.main,
//                         target: 150,
//                         change: 12,
//                         description: "Return on investment"
//                       },
//                       {
//                         label: "Cost per Acquisition",
//                         value: `$${metrics.costPerEngagement}`,
//                         color: theme.palette.warning.main,
//                         target: 250,
//                         change: -5,
//                         description: "Average cost per application"
//                       },
//                       {
//                         label: "Revenue Growth",
//                         value: "24",
//                         suffix: "%",
//                         color: theme.palette.info.main,
//                         target: 20,
//                         change: 4,
//                         description: "Monthly revenue growth"
//                       },
//                       {
//                         label: "Profit Margin",
//                         value: "42",
//                         suffix: "%",
//                         color: theme.palette.primary.main,
//                         target: 40,
//                         change: 2,
//                         description: "Average profit margin"
//                       }
//                     ]}
//                     title="Financial KPIs"
//                     height={400}
//                   />
//                 </Grid>
                
//                 {/* ROI Comparison */}
//                 <Grid item xs={12}>
//                   <BarGraph 
//                     data={chartData.roiComparison}
//                     title="ROI Comparison Across Campaigns"
//                     height={350}
//                     showValues={true}
//                     color="#FF9800"
//                   />
//                 </Grid>
                
//                 {/* Cost Analysis */}
//                 <Grid item xs={12} md={6}>
//                   <HorizontalBarGraph 
//                     data={[
//                       { label: 'Influencer Fees', value: 12500, change: 8 },
//                       { label: 'Production Costs', value: 8500, change: -3 },
//                       { label: 'Platform Fees', value: 3200, change: 12 },
//                       { label: 'Marketing Spend', value: 5600, change: 5 },
//                       { label: 'Operational Costs', value: 4100, change: -2 }
//                     ]}
//                     title="Cost Breakdown Analysis"
//                     height={300}
//                     showValues={true}
//                     color="#9C27B0"
//                   />
//                 </Grid>
                
//                 <Grid item xs={12} md={6}>
//                   <BarGraph 
//                     data={[
//                       { label: 'Q1', value: 125, change: 5 },
//                       { label: 'Q2', value: 142, change: 12 },
//                       { label: 'Q3', value: 118, change: -8 },
//                       { label: 'Q4', value: 156, change: 24 }
//                     ]}
//                     title="Quarterly ROI Performance"
//                     height={300}
//                     showValues={true}
//                     color="#4CAF50"
//                   />
//                 </Grid>
//               </Grid>
//             )}

//             {/* Detailed Reports Tab */}
//             {activeTab === 4 && (
//               <Grid container spacing={3}>
//                 <Grid item xs={12}>
//                   <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
//                     Advanced Reports & Analytics
//                   </Typography>
//                 </Grid>
                
//                 {/* Report Generator */}
//                 <Grid item xs={12}>
//                   <ReportGenerator 
//                     onGenerate={handleGenerateReport}
//                     onExport={handleExportReport}
//                     loading={generatingReport}
//                   />
//                 </Grid>
                
//                 {/* Comprehensive Analysis Section */}
//                 <Grid item xs={12} md={6}>
//                   <MultiSeriesBarGraph 
//                     data={budgetAllocationSeriesData}
//                     title="Budget vs Performance Analysis"
//                     height={350}
//                     series={['Budget', 'Spent', 'Results']}
//                   />
//                 </Grid>
                
//                 <Grid item xs={12} md={6}>
//                   <BarGraph 
//                     data={[
//                       { label: 'Campaign 1', value: 85, change: 12 },
//                       { label: 'Campaign 2', value: 92, change: 8 },
//                       { label: 'Campaign 3', value: 78, change: -5 },
//                       { label: 'Campaign 4', value: 95, change: 15 },
//                       { label: 'Campaign 5', value: 88, change: 3 },
//                       { label: 'Campaign 6', value: 91, change: 10 }
//                     ]}
//                     title="Campaign Success Scores"
//                     height={350}
//                     showValues={true}
//                     color="#2196F3"
//                   />
//                 </Grid>
                
//                 {/* Detailed Metrics Grid */}
//                 <Grid item xs={12}>
//                   <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
//                     Detailed Performance Metrics
//                   </Typography>
//                   <Grid container spacing={2}>
//                     <Grid item xs={12} sm={6} md={3}>
//                       <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
//                         <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main' }}>
//                           {metrics.totalApplications}
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                           Total Applications
//                         </Typography>
//                       </Paper>
//                     </Grid>
//                     <Grid item xs={12} sm={6} md={3}>
//                       <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
//                         <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
//                           {metrics.avgEngagementRate}%
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                           Avg Engagement Rate
//                         </Typography>
//                       </Paper>
//                     </Grid>
//                     <Grid item xs={12} sm={6} md={3}>
//                       <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
//                         <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.main' }}>
//                           ${metrics.costPerEngagement}
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                           Cost per Application
//                         </Typography>
//                       </Paper>
//                     </Grid>
//                     <Grid item xs={12} sm={6} md={3}>
//                       <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
//                         <Typography variant="h4" sx={{ fontWeight: 800, color: 'info.main' }}>
//                           {metrics.completionRate.toFixed(1)}%
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                           Approval Rate
//                         </Typography>
//                       </Paper>
//                     </Grid>
//                   </Grid>
//                 </Grid>
                
//                 {/* Data Export Options */}
//                 <Grid item xs={12}>
//                   <Paper sx={{ p: 3, borderRadius: '16px' }}>
//                     <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
//                       Export Options
//                     </Typography>
//                     <Grid container spacing={2}>
//                       <Grid item xs={6} sm={3}>
//                         <Button
//                           fullWidth
//                           variant="outlined"
//                           startIcon={<PictureAsPdf />}
//                           onClick={() => handleExportReport({ format: 'pdf' })}
//                           disabled={generatingReport}
//                         >
//                           PDF Report
//                         </Button>
//                       </Grid>
//                       <Grid item xs={6} sm={3}>
//                         <Button
//                           fullWidth
//                           variant="outlined"
//                           startIcon={<TableChart />}
//                           onClick={() => handleExportReport({ format: 'excel' })}
//                           disabled={generatingReport}
//                         >
//                           Excel Data
//                         </Button>
//                       </Grid>
//                       <Grid item xs={6} sm={3}>
//                         <Button
//                           fullWidth
//                           variant="outlined"
//                           startIcon={<GetApp />}
//                           onClick={() => handleExportReport({ format: 'csv' })}
//                           disabled={generatingReport}
//                         >
//                           CSV Export
//                         </Button>
//                       </Grid>
//                       <Grid item xs={6} sm={3}>
//                         <Button
//                           fullWidth
//                           variant="outlined"
//                           startIcon={<InsertChart />}
//                           onClick={() => handleExportReport({ format: 'html' })}
//                           disabled={generatingReport}
//                         >
//                           HTML Report
//                         </Button>
//                       </Grid>
//                     </Grid>
//                   </Paper>
//                 </Grid>
//               </Grid>
//             )}
//           </Box>
//         </Paper>

//         {/* Floating Action Buttons */}
//         <Box sx={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 2 }}>
//           <Badge badgeContent={realTimeActivities.length} color="error">
//             <Tooltip title="Real-time Updates">
//               <Fab
//                 color="primary"
//                 sx={{
//                   background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
//                 }}
//                 onClick={refetchAll}
//               >
//                 <Refresh />
//               </Fab>
//             </Tooltip>
//           </Badge>
          
//           <Tooltip title="Generate Report">
//             <Fab
//               color="secondary"
//               sx={{
//                 background: "linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)",
//               }}
//               onClick={() => setActiveTab(4)}
//             >
//               <PictureAsPdf />
//             </Fab>
//           </Tooltip>
          
//           <Tooltip title="Quick Analytics">
//             <Fab
//               color="success"
//               sx={{
//                 background: "linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)",
//               }}
//               onClick={() => setActiveTab(0)}
//             >
//               <Analytics />
//             </Fab>
//           </Tooltip>
//         </Box>

//         {/* Dialogs */}
//         <CampaignDetailDialog
//           open={campaignDialogOpen}
//           onClose={() => setCampaignDialogOpen(false)}
//           campaign={selectedCampaign}
//           onEdit={() => {
//             setCampaignDialogOpen(false);
//             navigate(`/brand/campaigns/edit/${selectedCampaign?._id}`);
//           }}
//         />

//         <UserProfileDialog
//           open={userDialogOpen}
//           onClose={() => setUserDialogOpen(false)}
//           user={selectedUser}
//           type="influencer"
//         />
//       </Box>
//     </LocalizationProvider>
//   );
// };

// export default BrandAnalytics;


import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from "../../context/AuthContext";
import API_BASE_URL from "../../config/api";
import axios from 'axios';
import {
  Box, Typography, Card, CardContent, Grid, Paper, Container,
  Chip, Button, IconButton, CircularProgress, useTheme,
  useMediaQuery, Tabs, Tab, Divider, Avatar, TextField,
  InputAdornment, MenuItem, FormControl, InputLabel,
  Select, Slider, Tooltip, Fade, Zoom, Alert
} from '@mui/material';
import {
  Campaign, People, AttachMoney, TrendingUp, TrendingDown,
  CheckCircle, Pending, Cancel, ShoppingCart, Visibility,
  ThumbUp, Bookmark, Category, CalendarToday, AccessTime,
  ArrowForward, Refresh, FilterList, Search, Clear,
  Instagram, YouTube, Facebook, Twitter, LinkedIn,
  PieChart, BarChart, LineChart, ShowChart,
  Download, Share, Email, Chat, Person
} from '@mui/icons-material';
import { campaignAPI } from '../../services/api';
import profileAPI from "../../services/profileAPI";
import { Pie, Doughnut, Line, Bar } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
import { keyframes } from "@emotion/react";
import styled from '@emotion/styled';

// =============================================
// 🎨 STYLED COMPONENTS
// =============================================

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const AnalyticsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  animation: `${fadeIn} 0.6s ease`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 48px rgba(102, 126, 234, 0.15)',
  }
}));

const MetricCard = styled(Paper)(({ theme, color }) => ({
  // padding: theme.spacing(3),
  borderRadius: '16px',
  background: color || '#2563eb',
  color: 'white',
  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
  animation: `${fadeIn} 0.5s ease`,
  '&:hover': {
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
    transform: 'translateY(-2px)'
  }
}));

const StatusBadge = styled(Chip)(({ theme, status }) => ({
  fontWeight: 700,
  fontSize: '0.7rem',
  height: '24px',
  borderRadius: '12px',
  ...(status === 'active' && {
    background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
    color: 'white'
  }),
  ...(status === 'pending' && {
    background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
    color: 'white'
  }),
  ...(status === 'completed' && {
    background: 'linear-gradient(135deg, #2196F3, #42A5F5)',
    color: 'white'
  }),
  ...(status === 'paused' && {
    background: 'linear-gradient(135deg, #9E9E9E, #BDBDBD)',
    color: 'white'
  })
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: '#2563eb',
  color: 'white',
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
    transform: 'translateY(-2px)',
    background: '#2563eb'
  }
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '300px',
  width: '100%',
  // padding: theme.spacing(2),
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  animation: `${slideIn} 0.5s ease`
}));

// =============================================
// 📊 MAIN COMPONENT - BRAND ANALYTICS
// =============================================

const BrandAnalytics = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState([]);
  const [brandProfile, setBrandProfile] = useState(null);
  const [metrics, setMetrics] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    totalBudget: 0,
    spentBudget: 0,
    totalViews: 0,
    totalLikes: 0,
    engagementRate: 0,
    conversionRate: 0
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch campaigns
      const campaignsRes = await campaignAPI.getBrandCampaigns();
      const campaignsData = campaignsRes.data || [];
      setCampaigns(campaignsData);

      // Fetch applications
      const appsRes = await campaignAPI.getBrandApplications();
      const appsData = Array.isArray(appsRes) ? appsRes : appsRes.data || appsRes.applications || [];
      setApplications(appsData);

      // Fetch brand profile
      if (user?.id) {
        const profileRes = await profileAPI.getProfileById(user.id);
        setBrandProfile(profileRes?.profile || null);
      }

      // Calculate metrics
      calculateMetrics(campaignsData, appsData);
      
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (campaignsData, appsData) => {
    // Campaign metrics
    const totalCampaigns = campaignsData.length;
    const activeCampaigns = campaignsData.filter(c => c.status === 'active').length;
    
    // Application metrics
    const totalApplications = appsData.length;
    const pendingApplications = appsData.filter(app => app.status === 'pending').length;
    const approvedApplications = appsData.filter(app => app.status === 'approved').length;
    
    // Budget metrics
    const totalBudget = campaignsData.reduce((sum, c) => sum + (parseFloat(c.budget) || 0), 0);
    const spentBudget = appsData
      .filter(app => ['completed', 'media_submitted', 'contracted'].includes(app.status))
      .reduce((sum, app) => sum + (parseFloat(app.budget) || 0), 0);
    
    // Engagement metrics
    const totalViews = campaignsData.reduce((sum, c) => sum + (c.total_views || 0), 0);
    const totalLikes = campaignsData.reduce((sum, c) => sum + (c.likes_count || 0), 0);
    
    // Calculate rates
    const engagementRate = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) : 0;
    const conversionRate = totalApplications > 0 ? ((approvedApplications / totalApplications) * 100).toFixed(1) : 0;

    setMetrics({
      totalCampaigns,
      activeCampaigns,
      totalApplications,
      pendingApplications,
      approvedApplications,
      totalBudget,
      spentBudget,
      totalViews,
      totalLikes,
      engagementRate,
      conversionRate
    });
  };

  // =============================================
  // 📈 CHART DATA FUNCTIONS
  // =============================================

  const getCampaignStatusChartData = () => {
    const statusCounts = {
      active: campaigns.filter(c => c.status === 'active').length,
      pending: campaigns.filter(c => c.status === 'pending').length,
      completed: campaigns.filter(c => c.status === 'completed').length,
      paused: campaigns.filter(c => c.status === 'paused').length
    };

    return {
      labels: ['Active', 'Pending', 'Completed', 'Paused'],
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: [
            '#4CAF50', // Active - Green
            '#FF9800', // Pending - Orange
            '#2196F3', // Completed - Blue
            '#9E9E9E'  // Paused - Gray
          ],
          borderWidth: 0,
          borderRadius: 6
        }
      ]
    };
  };

  const getApplicationStatusChartData = () => {
    const statusCounts = {
      pending: applications.filter(app => app.status === 'pending').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      contracted: applications.filter(app => app.status === 'contracted' || app.contract_signed).length,
      completed: applications.filter(app => app.status === 'completed').length
    };

    return {
      labels: ['Pending', 'Approved', 'Rejected', 'Contracted', 'Completed'],
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: [
            '#FF9800', // Pending - Orange
            '#4CAF50', // Approved - Green
            '#F44336', // Rejected - Red
            '#9C27B0', // Contracted - Purple
            '#2196F3'  // Completed - Blue
          ],
          borderWidth: 0,
          borderRadius: 6
        }
      ]
    };
  };

  const getBudgetChartData = () => {
    const remaining = Math.max(0, metrics.totalBudget - metrics.spentBudget);
    
    return {
      labels: ['Total Budget', 'Spent Budget', 'Remaining'],
      datasets: [
        {
          data: [
            metrics.totalBudget,
            metrics.spentBudget,
            remaining
          ],
          backgroundColor: [
            '#667eea', // Total - Purple
            '#2563eb', // Spent - Dark Purple
            '#e79e57'  // Remaining - Orange
          ],
          borderWidth: 0,
          borderRadius: 6
        }
      ]
    };
  };

  const getEngagementChartData = () => {
    // Get last 7 days data
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return format(date, 'EEE');
    });

    // Mock data for engagement (in real app, fetch from API)
    const viewsData = [1200, 1500, 1800, 2200, 1900, 2100, 2400];
    const likesData = [200, 250, 300, 350, 320, 380, 400];
    const applicationsData = [15, 20, 25, 30, 28, 32, 35];

    return {
      labels: days,
      datasets: [
        {
          label: 'Views',
          data: viewsData,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3
        },
        {
          label: 'Likes',
          data: likesData,
          borderColor: '#e79e57',
          backgroundColor: 'rgba(231, 158, 87, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3
        },
        {
          label: 'Applications',
          data: applicationsData,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3
        }
      ]
    };
  };

  const getTopCampaignsChartData = () => {
    // Sort campaigns by applications
    const topCampaigns = [...campaigns]
      .sort((a, b) => (b.applications?.length || 0) - (a.applications?.length || 0))
      .slice(0, 5);

    return {
      labels: topCampaigns.map(c => c.title.substring(0, 20) + (c.title.length > 20 ? '...' : '')),
      datasets: [
        {
          label: 'Applications',
          data: topCampaigns.map(c => c.applications?.length || 0),
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: '#667eea',
          borderWidth: 1,
          borderRadius: 6
        },
        {
          label: 'Views',
          data: topCampaigns.map(c => c.total_views || 0),
          backgroundColor: 'rgba(231, 158, 87, 0.8)',
          borderColor: '#e79e57',
          borderWidth: 1,
          borderRadius: 6
        }
      ]
    };
  };

  // =============================================
  // 📊 METRIC CARDS COMPONENT
  // =============================================

  const MetricCards = () => {
    const metricItems = [
      {
        title: 'Total Campaigns',
        value: metrics.totalCampaigns,
        change: '+12%',
        icon: <Campaign />,
        color: 'linear-gradient(135deg, #667eea 0%, #2563eb 100%)'
      },
      {
        title: 'Active Campaigns',
        value: metrics.activeCampaigns,
        change: '+5%',
        icon: <TrendingUp />,
        color: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)'
      },
      {
        title: 'Total Applications',
        value: metrics.totalApplications,
        change: '+23%',
        icon: <People />,
        color: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)'
      },
      {
        title: 'Pending Reviews',
        value: metrics.pendingApplications,
        change: '+8%',
        icon: <Pending />,
        color: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)'
      },
      {
        title: 'Total Budget',
        value: `$${metrics.totalBudget.toLocaleString()}`,
        change: '+15%',
        icon: <AttachMoney />,
        color: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)'
      },
      {
        title: 'Spent Budget',
        value: `$${metrics.spentBudget.toLocaleString()}`,
        change: '+22%',
        icon: <ShoppingCart />,
        color: 'linear-gradient(135deg, #FF5722 0%, #FF8A65 100%)'
      },
      {
        title: 'Engagement Rate',
        value: `${metrics.engagementRate}%`,
        change: '+4%',
        icon: <ThumbUp />,
        color: 'linear-gradient(135deg, #00BCD4 0%, #80DEEA 100%)'
      },
      {
        title: 'Total Views',
        value: metrics.totalViews.toLocaleString(),
        change: '+18%',
        icon: <Visibility />,
        color: 'linear-gradient(135deg, #795548 0%, #A1887F 100%)'
      }
    ];

    return (
      <Grid container spacing={3}>
        {metricItems.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
              <MetricCard color={metric.color}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h3" fontWeight="800" gutterBottom>
                      {metric.value}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {metric.title}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    background: 'rgba(255, 255, 255, 0.2)', 
                    borderRadius: '12px',
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {metric.icon}
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" mt={2}>
                  <Typography variant="caption" sx={{ opacity: 0.9, mr: 1 }}>
                    {metric.change} from last month
                  </Typography>
                  {metric.change.startsWith('+') ? 
                    <TrendingUp sx={{ fontSize: 16 }} /> : 
                    <TrendingDown sx={{ fontSize: 16 }} />
                  }
                </Box>
              </MetricCard>
            </Zoom>
          </Grid>
        ))}
      </Grid>
    );
  };

  // =============================================
  // 📊 CHARTS COMPONENT
  // =============================================

  const ChartsSection = () => {
    const chartOptions = {
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        }
      }
    };

    const lineChartOptions = {
      ...chartOptions,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    return (
      <Grid container spacing={3}>
        {/* Campaign Status */}
        <Grid item xs={12} md={6}>
          <AnalyticsCard>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight="700" color="primary">
                  Campaign Status Distribution
                </Typography>
                <IconButton size="small">
                  <PieChart />
                </IconButton>
              </Box>
              <ChartContainer>
                <Pie
                  data={getCampaignStatusChartData()}
                  options={chartOptions}
                />
              </ChartContainer>
            </CardContent>
          </AnalyticsCard>
        </Grid>

        {/* Application Status */}
        <Grid item xs={12} md={6}>
          <AnalyticsCard>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight="700" color="primary">
                  Application Status
                </Typography>
                <IconButton size="small">
                  <BarChart />
                </IconButton>
              </Box>
              <ChartContainer>
                <Doughnut
                  data={getApplicationStatusChartData()}
                  options={chartOptions}
                />
              </ChartContainer>
            </CardContent>
          </AnalyticsCard>
        </Grid>

        {/* Budget Allocation */}
        <Grid item xs={12} md={6}>
          <AnalyticsCard>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight="700" color="primary">
                  Budget Allocation
                </Typography>
                <IconButton size="small">
                  <AttachMoney />
                </IconButton>
              </Box>
              <ChartContainer>
                <Doughnut
                  data={getBudgetChartData()}
                  options={chartOptions}
                />
              </ChartContainer>
            </CardContent>
          </AnalyticsCard>
        </Grid>

        {/* Engagement Trend */}
        <Grid item xs={12} md={6}>
          <AnalyticsCard>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight="700" color="primary">
                  Engagement Trend (Last 7 Days)
                </Typography>
                <IconButton size="small">
                  <ShowChart />
                </IconButton>
              </Box>
              <ChartContainer>
                <Line
                  data={getEngagementChartData()}
                  options={lineChartOptions}
                />
              </ChartContainer>
            </CardContent>
          </AnalyticsCard>
        </Grid>

        {/* Top Campaigns */}
        <Grid item xs={12}>
          <AnalyticsCard>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight="700" color="primary">
                  Top Performing Campaigns
                </Typography>
                <IconButton size="small">
                  <TrendingUp />
                </IconButton>
              </Box>
              <ChartContainer sx={{ height: '250px' }}>
                <Bar
                  data={getTopCampaignsChartData()}
                  options={{
                    ...lineChartOptions,
                    scales: {
                      y: {
                        beginAtZero: true
                      },
                      x: {
                        ticks: {
                          maxRotation: 45,
                          minRotation: 45
                        }
                      }
                    }
                  }}
                />
              </ChartContainer>
            </CardContent>
          </AnalyticsCard>
        </Grid>
      </Grid>
    );
  };

  // =============================================
  // 📋 RECENT ACTIVITY COMPONENT
  // =============================================

  const RecentActivity = () => {
    const activities = [
      {
        id: 1,
        type: 'application',
        title: 'New application received',
        description: 'Influencer @john_doe applied to "Summer Collection Campaign"',
        time: '2 hours ago',
        icon: <Person color="primary" />,
        status: 'pending'
      },
      {
        id: 2,
        type: 'campaign',
        title: 'Campaign published',
        description: 'Your campaign "Holiday Special" is now live',
        time: '5 hours ago',
        icon: <Campaign color="success" />,
        status: 'active'
      },
      {
        id: 3,
        type: 'payment',
        title: 'Payment completed',
        description: 'Payment of $500 processed for @jane_doe',
        time: '1 day ago',
        icon: <AttachMoney color="warning" />,
        status: 'completed'
      },
      {
        id: 4,
        type: 'application',
        title: 'Application approved',
        description: 'Application from @alex_smith approved for "Product Launch"',
        time: '2 days ago',
        icon: <CheckCircle color="info" />,
        status: 'approved'
      }
    ];

    return (
      <AnalyticsCard>
        <CardContent>
          <Typography variant="h6" fontWeight="700" color="primary" gutterBottom>
            Recent Activity
          </Typography>
          <Box>
            {activities.map((activity) => (
              <Box
                key={activity.id}
                sx={{
                  p: 2,
                  mb: 1,
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.02)',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                  animation: `${fadeIn} 0.5s ease`
                }}
              >
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                    {activity.icon}
                  </Avatar>
                  <Box flex={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="subtitle1" fontWeight="600">
                        {activity.title}
                      </Typography>
                      <StatusBadge label={activity.status} status={activity.status} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {activity.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
          <Button
            fullWidth
            endIcon={<ArrowForward />}
            sx={{ mt: 2, borderRadius: '8px' }}
          >
            View All Activity
          </Button>
        </CardContent>
      </AnalyticsCard>
    );
  };

  // =============================================
  // 🎯 TOP INFLUENCERS COMPONENT
  // =============================================

  const TopInfluencers = () => {
    const influencers = [
      { id: 1, name: 'John Doe', platform: 'Instagram', followers: '150K', engagement: '4.5%', applications: 5 },
      { id: 2, name: 'Jane Smith', platform: 'YouTube', followers: '250K', engagement: '3.8%', applications: 4 },
      { id: 3, name: 'Alex Johnson', platform: 'TikTok', followers: '500K', engagement: '6.2%', applications: 3 },
      { id: 4, name: 'Sarah Wilson', platform: 'Instagram', followers: '180K', engagement: '4.1%', applications: 2 }
    ];

    const getPlatformIcon = (platform) => {
      switch (platform) {
        case 'Instagram': return <Instagram color="primary" />;
        case 'YouTube': return <YouTube color="error" />;
        case 'Facebook': return <Facebook color="info" />;
        case 'Twitter': return <Twitter color="info" />;
        case 'LinkedIn': return <LinkedIn color="info" />;
        default: return <Campaign color="action" />;
      }
    };

    return (
      <AnalyticsCard>
        <CardContent>
          <Typography variant="h6" fontWeight="700" color="primary" gutterBottom>
            Top Influencers
          </Typography>
          <Box>
            {influencers.map((influencer, index) => (
              <Box
                key={influencer.id}
                sx={{
                  p: 2,
                  mb: 1,
                  borderRadius: '8px',
                  background: index % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                  animation: `${slideIn} 0.5s ease`,
                  animationDelay: `${index * 100}ms`
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      {influencer.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="600">
                        {influencer.name}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getPlatformIcon(influencer.platform)}
                        <Typography variant="caption" color="text.secondary">
                          {influencer.followers} • {influencer.engagement} engagement
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="subtitle2" fontWeight="700" color="primary">
                      {influencer.applications} applications
                    </Typography>
                    <Button size="small" variant="outlined" sx={{ mt: 0.5, borderRadius: '6px' }}>
                      View Profile
                    </Button>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </AnalyticsCard>
    );
  };

  // =============================================
  // 🎯 MAIN RENDER
  // =============================================

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>
          Loading analytics...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3} flexDirection={isMobile ? "column" : "row"} gap={isMobile ? 2 : 0}>
          <Box>
            <Typography variant="h3" component="h1" fontWeight="800" gutterBottom color="primary">
              Brand Analytics Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px' }}>
              Track your campaign performance, influencer engagement, and business growth metrics
            </Typography>
          </Box>
          <Box display="flex" gap={1} flexWrap="wrap">
            <GradientButton
              startIcon={<Refresh />}
              onClick={fetchAnalyticsData}
              sx={{ borderRadius: '12px' }}
            >
              Refresh Data
            </GradientButton>
            <GradientButton
              startIcon={<Download />}
              sx={{ borderRadius: '12px', background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' }}
            >
              Export Report
            </GradientButton>
          </Box>
        </Box>

        {/* Date Range Selector */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                label="Date Range"
              >
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month">Last 30 Days</MenuItem>
                <MenuItem value="quarter">Last Quarter</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="Search metrics..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}
            </Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <Paper sx={{ borderRadius: '12px', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 2 }}
          >
            <Tab label="Overview" value="overview" icon={<ShowChart />} />
            <Tab label="Campaigns" value="campaigns" icon={<Campaign />} />
            <Tab label="Applications" value="applications" icon={<People />} />
            <Tab label="Influencers" value="influencers" icon={<Person />} />
            <Tab label="Financial" value="financial" icon={<AttachMoney />} />
            <Tab label="Engagement" value="engagement" icon={<ThumbUp />} />
          </Tabs>
        </Paper>
      </Box>

      {/* Error Display */}
      {error && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Main Content based on Active Tab */}
      {activeTab === 'overview' && (
        <Fade in={true}>
          <Box>
            {/* Metric Cards */}
            <Box sx={{ mb: 4 }}>
              <MetricCards />
            </Box>

            {/* Charts Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="700" gutterBottom sx={{ mb: 3, color: 'primary' }}>
                Performance Insights
              </Typography>
              <ChartsSection />
            </Box>

            {/* Additional Insights */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <RecentActivity />
              </Grid>
              <Grid item xs={12} md={6}>
                <TopInfluencers />
              </Grid>
            </Grid>
          </Box>
        </Fade>
      )}

      {activeTab === 'campaigns' && (
        <Fade in={true}>
          <Box>
            <Typography variant="h5" fontWeight="700" gutterBottom sx={{ mb: 3, color: 'primary' }}>
              Campaign Analytics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <AnalyticsCard>
                  <CardContent>
                    <Typography variant="h6" fontWeight="700" color="primary" gutterBottom>
                      Campaign Performance Summary
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="body1">
                        Total Campaigns: {metrics.totalCampaigns}
                      </Typography>
                      <Typography variant="body1">
                        Active Campaigns: {metrics.activeCampaigns}
                      </Typography>
                      <Typography variant="body1">
                        Total Budget: ${metrics.totalBudget.toLocaleString()}
                      </Typography>
                    </Box>
                    {/* Add more campaign analytics here */}
                  </CardContent>
                </AnalyticsCard>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      )}

      {activeTab === 'applications' && (
        <Fade in={true}>
          <Box>
            <Typography variant="h5" fontWeight="700" gutterBottom sx={{ mb: 3, color: 'primary' }}>
              Application Analytics
            </Typography>
            <AnalyticsCard>
              <CardContent>
                <Typography variant="h6" fontWeight="700" color="primary" gutterBottom>
                  Application Statistics
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                  <Box>
                    <Typography variant="h4" color="primary">
                      {metrics.totalApplications}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Applications
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" color="success.main">
                      {metrics.approvedApplications}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Approved
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" color="warning.main">
                      {metrics.pendingApplications}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" color="error.main">
                      {applications.filter(app => app.status === 'rejected').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rejected
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </AnalyticsCard>
          </Box>
        </Fade>
      )}

      {/* Footer Actions */}
      <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Typography variant="body2" color="text.secondary">
            Need help interpreting your analytics? <Button size="small">Contact Support</Button>
          </Typography>
          <Box display="flex" gap={1}>
            <Button startIcon={<Email />} variant="outlined">
              Email Report
            </Button>
            <Button startIcon={<Share />} variant="outlined">
              Share Dashboard
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default BrandAnalytics;