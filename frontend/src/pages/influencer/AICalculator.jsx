import React, { useState } from 'react';
import '../../style/AICalculator.css';
import {
  FaChartLine,
  FaDollarSign,
  FaChartBar,
  FaVideo,
  FaRocket,
  FaHashtag,
  FaUsers,
  FaHandshake,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaStar,
  FaClock,
  FaBullseye,
  FaCalendarAlt,
  FaFileContract,
  FaRegChartBar,
  FaRegCalendarCheck,
  FaRegClock,
  FaRegThumbsUp,
  FaRegComments,
  FaRegEye,
  FaShareAlt,
  FaRegSave,
  FaRegHeart,
  FaRegFlag,
  FaCamera,
  FaPenFancy,
  FaAd,
  FaTachometerAlt,
  FaBalanceScale,
  FaCoins,
  FaMoneyBillWave,
  FaPercentage,
  FaClipboardList,
  FaTasks,
  FaProjectDiagram,
  FaBoxOpen,
  FaStore,
  FaNetworkWired
} from "react-icons/fa";

const AICalculator = () => {
  const [activeCalculator, setActiveCalculator] = useState(null);
  const [results, setResults] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');

  // Calculator categories
  const categories = [
    { id: 'all', name: 'All Calculators', icon: <FaProjectDiagram /> },
    { id: 'performance', name: 'Performance & ROI', icon: <FaChartLine /> },
    { id: 'earnings', name: 'Earnings & Pricing', icon: <FaDollarSign /> },
    { id: 'campaign', name: 'Campaign Management', icon: <FaClipboardList /> },
    { id: 'audience', name: 'Audience Analytics', icon: <FaUsers /> },
    { id: 'content', name: 'Content Strategy', icon: <FaVideo /> },
    { id: 'brand', name: 'Brand Partnership', icon: <FaHandshake /> }
  ];

  // Complete calculator configurations (20+ calculators)
  const calculators = [
    // ============ PERFORMANCE & ROI CATEGORY ============
    {
      id: 'engagement-rate',
      title: 'Engagement Rate Calculator',
      category: 'performance',
      icon: <FaChartLine />,
      description: 'Calculate comprehensive engagement rate across platforms',
      inputs: [
        { id: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook', 'LinkedIn'] },
        { id: 'followers', label: 'Total Followers', type: 'number', placeholder: 'Enter follower count' },
        { id: 'likes', label: 'Average Likes', type: 'number', placeholder: 'Enter average likes' },
        { id: 'comments', label: 'Average Comments', type: 'number', placeholder: 'Enter average comments' },
        { id: 'saves', label: 'Average Saves', type: 'number', placeholder: 'Enter average saves (optional)' },
        { id: 'shares', label: 'Average Shares', type: 'number', placeholder: 'Enter average shares (optional)' }
      ],
      calculate: (inputs) => {
        const followers = parseFloat(inputs.followers) || 0;
        const likes = parseFloat(inputs.likes) || 0;
        const comments = parseFloat(inputs.comments) || 0;
        const saves = parseFloat(inputs.saves) || 0;
        const shares = parseFloat(inputs.shares) || 0;
        
        // Standard engagement rate
        const standardEngagement = ((likes + comments) / followers) * 100;
        
        // Advanced engagement (includes saves and shares)
        const advancedEngagement = ((likes + comments + saves + shares) / followers) * 100;
        
        // Quality score based on comment-to-like ratio
        const commentRatio = likes > 0 ? (comments / likes) * 100 : 0;
        let qualityScore = 'Average';
        if (commentRatio > 5) qualityScore = 'Excellent';
        else if (commentRatio > 3) qualityScore = 'Good';
        else if (commentRatio > 1) qualityScore = 'Average';
        else qualityScore = 'Needs Improvement';
        
        // Platform benchmarks
        const benchmarks = {
          'Instagram': { good: 3, excellent: 5 },
          'TikTok': { good: 5, excellent: 8 },
          'YouTube': { good: 4, excellent: 7 },
          'Twitter': { good: 1, excellent: 2.5 },
          'Facebook': { good: 0.5, excellent: 1.5 },
          'LinkedIn': { good: 2, excellent: 4 }
        };
        
        const benchmark = benchmarks[inputs.platform] || { good: 2, excellent: 4 };
        let performanceRating = 'Poor';
        if (standardEngagement >= benchmark.excellent) performanceRating = 'Excellent';
        else if (standardEngagement >= benchmark.good) performanceRating = 'Good';
        else if (standardEngagement >= benchmark.good * 0.5) performanceRating = 'Average';
        
        return {
          standardEngagementRate: standardEngagement.toFixed(2) + '%',
          advancedEngagementRate: advancedEngagement.toFixed(2) + '%',
          commentToLikeRatio: commentRatio.toFixed(2) + '%',
          qualityScore: qualityScore,
          performanceRating: performanceRating,
          benchmarkComparison: `vs ${benchmark.good}% platform avg`,
          estimatedReach: Math.round(followers * (standardEngagement / 100) * 3).toLocaleString()
        };
      }
    },
    {
      id: 'roi-calculator',
      title: 'Campaign ROI & Performance',
      category: 'performance',
      icon: <FaChartBar />,
      description: 'Comprehensive ROI analysis with multiple revenue streams',
      inputs: [
        { id: 'investment', label: 'Total Campaign Investment ($)', type: 'number', placeholder: 'Enter total investment' },
        { id: 'directRevenue', label: 'Direct Sales Revenue ($)', type: 'number', placeholder: 'Enter direct revenue' },
        { id: 'affiliateRevenue', label: 'Affiliate/Commission Revenue ($)', type: 'number', placeholder: 'Enter affiliate revenue' },
        { id: 'brandValue', label: 'Estimated Brand Value ($)', type: 'number', placeholder: 'Enter brand value increase' },
        { id: 'conversions', label: 'Total Conversions', type: 'number', placeholder: 'Enter number of conversions' },
        { id: 'newCustomers', label: 'New Customers Acquired', type: 'number', placeholder: 'Enter new customers' }
      ],
      calculate: (inputs) => {
        const investment = parseFloat(inputs.investment) || 0;
        const directRevenue = parseFloat(inputs.directRevenue) || 0;
        const affiliateRevenue = parseFloat(inputs.affiliateRevenue) || 0;
        const brandValue = parseFloat(inputs.brandValue) || 0;
        const conversions = parseFloat(inputs.conversions) || 1;
        const newCustomers = parseFloat(inputs.newCustomers) || 0;
        
        const totalRevenue = directRevenue + affiliateRevenue + brandValue;
        const netProfit = totalRevenue - investment;
        const roi = investment > 0 ? (netProfit / investment) * 100 : 0;
        
        const cpa = conversions > 0 ? investment / conversions : 0;
        const customerAcquisitionCost = newCustomers > 0 ? investment / newCustomers : 0;
        const revenuePerConversion = conversions > 0 ? totalRevenue / conversions : 0;
        
        // Break-even analysis
        const breakEvenRevenue = investment;
        const breakEvenConversions = investment / (revenuePerConversion || 1);
        
        // Performance score (0-100)
        let performanceScore = 0;
        if (roi >= 100) performanceScore = 95 + (Math.min(roi, 300) - 100) / 10;
        else if (roi >= 50) performanceScore = 80 + (roi - 50) * 0.6;
        else if (roi >= 0) performanceScore = 50 + roi * 0.6;
        else performanceScore = 50 + roi * 0.5;
        performanceScore = Math.min(100, Math.max(0, performanceScore));
        
        return {
          totalRevenue: '$' + Math.round(totalRevenue).toLocaleString(),
          netProfit: '$' + Math.round(netProfit).toLocaleString(),
          roi: roi.toFixed(2) + '%',
          cpa: '$' + cpa.toFixed(2),
          customerAcquisitionCost: '$' + customerAcquisitionCost.toFixed(2),
          revenuePerConversion: '$' + revenuePerConversion.toFixed(2),
          breakEvenRevenue: '$' + Math.round(breakEvenRevenue).toLocaleString(),
          breakEvenConversions: Math.ceil(breakEvenConversions),
          performanceScore: Math.round(performanceScore) + '/100',
          rating: performanceScore >= 80 ? 'Excellent' : performanceScore >= 60 ? 'Good' : performanceScore >= 40 ? 'Average' : 'Poor'
        };
      }
    },
    {
      id: 'cpc-cpm-calculator',
      title: 'CPC & CPM Calculator',
      category: 'performance',
      icon: <FaAd />,
      description: 'Calculate cost per click and cost per mille metrics',
      inputs: [
        { id: 'campaignCost', label: 'Campaign Cost ($)', type: 'number', placeholder: 'Enter total campaign cost' },
        { id: 'impressions', label: 'Total Impressions', type: 'number', placeholder: 'Enter impressions count' },
        { id: 'clicks', label: 'Total Clicks', type: 'number', placeholder: 'Enter clicks count' },
        { id: 'conversions', label: 'Conversions', type: 'number', placeholder: 'Enter conversions (optional)' }
      ],
      calculate: (inputs) => {
        const cost = parseFloat(inputs.campaignCost) || 0;
        const impressions = parseFloat(inputs.impressions) || 1;
        const clicks = parseFloat(inputs.clicks) || 1;
        const conversions = parseFloat(inputs.conversions) || 0;
        
        const cpm = (cost / impressions) * 1000;
        const cpc = clicks > 0 ? cost / clicks : 0;
        const cpa = conversions > 0 ? cost / conversions : 0;
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
        
        let efficiency = 'Poor';
        if (ctr > 3 && cpc < 1) efficiency = 'Excellent';
        else if (ctr > 2 && cpc < 2) efficiency = 'Good';
        else if (ctr > 1 && cpc < 3) efficiency = 'Average';
        
        return {
          cpm: '$' + cpm.toFixed(2),
          cpc: '$' + cpc.toFixed(2),
          cpa: conversions > 0 ? '$' + cpa.toFixed(2) : 'N/A',
          ctr: ctr.toFixed(2) + '%',
          conversionRate: conversionRate.toFixed(2) + '%',
          efficiency: efficiency,
          recommendedBudget: '$' + Math.round(cpa * 100).toLocaleString()
        };
      }
    },
    {
      id: 'lifetime-value',
      title: 'Customer Lifetime Value (CLV)',
      category: 'performance',
      icon: <FaCoins />,
      description: 'Calculate customer lifetime value and retention metrics',
      inputs: [
        { id: 'avgPurchase', label: 'Average Purchase Value ($)', type: 'number', placeholder: 'Enter avg purchase value' },
        { id: 'purchaseFrequency', label: 'Purchases per Year', type: 'number', placeholder: 'Enter frequency' },
        { id: 'customerLifespan', label: 'Customer Lifespan (Years)', type: 'number', placeholder: 'Enter years' },
        { id: 'retentionRate', label: 'Retention Rate (%)', type: 'number', placeholder: 'Enter retention rate' },
        { id: 'acquisitionCost', label: 'Acquisition Cost ($)', type: 'number', placeholder: 'Enter CAC' }
      ],
      calculate: (inputs) => {
        const avgPurchase = parseFloat(inputs.avgPurchase) || 0;
        const frequency = parseFloat(inputs.purchaseFrequency) || 1;
        const lifespan = parseFloat(inputs.customerLifespan) || 1;
        const retention = parseFloat(inputs.retentionRate) || 50;
        const cac = parseFloat(inputs.acquisitionCost) || 0;
        
        const annualValue = avgPurchase * frequency;
        const clv = annualValue * lifespan;
        const clvWithRetention = annualValue * (1 + (retention / 100) + Math.pow(retention / 100, 2) + Math.pow(retention / 100, 3));
        
        const clvToCacRatio = cac > 0 ? clv / cac : 0;
        let ratioRating = 'Poor';
        if (clvToCacRatio > 5) ratioRating = 'Excellent';
        else if (clvToCacRatio > 3) ratioRating = 'Good';
        else if (clvToCacRatio > 1) ratioRating = 'Average';
        
        const paybackPeriod = cac > 0 ? cac / (annualValue / 12) : 0;
        
        return {
          customerLifetimeValue: '$' + Math.round(clv).toLocaleString(),
          clvWithRetention: '$' + Math.round(clvWithRetention).toLocaleString(),
          annualCustomerValue: '$' + Math.round(annualValue).toLocaleString(),
          clvToCacRatio: clvToCacRatio.toFixed(2),
          ratioRating: ratioRating,
          paybackPeriod: paybackPeriod.toFixed(1) + ' months',
          recommendedMaxCac: '$' + Math.round(clv * 0.3).toLocaleString()
        };
      }
    },

    // ============ EARNINGS & PRICING CATEGORY ============
    {
      id: 'earnings-estimator',
      title: 'Influencer Earnings Estimator',
      category: 'earnings',
      icon: <FaDollarSign />,
      description: 'Advanced earnings calculator with multiple revenue streams',
      inputs: [
        { id: 'platform', label: 'Primary Platform', type: 'select', options: ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook', 'LinkedIn'] },
        { id: 'followers', label: 'Follower Count', type: 'number', placeholder: 'Enter follower count' },
        { id: 'engagement', label: 'Engagement Rate (%)', type: 'number', placeholder: 'Enter engagement rate' },
        { id: 'niche', label: 'Niche/Category', type: 'select', options: ['Fashion', 'Beauty', 'Tech', 'Food', 'Travel', 'Fitness', 'Lifestyle', 'Gaming', 'Finance', 'Education', 'Parenting', 'Pets', 'Other'] },
        { id: 'contentType', label: 'Content Type', type: 'select', options: ['Photo', 'Video/Reel', 'Story', 'Carousel', 'Long-form Video', 'Blog'] },
        { id: 'experience', label: 'Experience Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Celebrity'] }
      ],
      calculate: (inputs) => {
        const followers = parseFloat(inputs.followers) || 0;
        const engagement = parseFloat(inputs.engagement) || 1;
        
        // Platform multipliers
        const platformMultipliers = {
          'Instagram': 1.2, 'TikTok': 1.1, 'YouTube': 1.5, 
          'Twitter': 0.6, 'Facebook': 0.8, 'LinkedIn': 1.3
        };
        
        // Niche multipliers
        const nicheMultipliers = {
          'Fashion': 1.3, 'Beauty': 1.2, 'Tech': 1.5, 'Food': 1.1,
          'Travel': 1.2, 'Fitness': 1.1, 'Lifestyle': 1.0, 'Gaming': 1.2,
          'Finance': 1.8, 'Education': 1.3, 'Parenting': 0.9, 'Pets': 1.0,
          'Other': 0.9
        };
        
        // Content type multipliers
        const contentTypeMultipliers = {
          'Photo': 1.0, 'Video/Reel': 1.8, 'Story': 0.5,
          'Carousel': 1.3, 'Long-form Video': 2.5, 'Blog': 2.0
        };
        
        // Experience multipliers
        const experienceMultipliers = {
          'Beginner': 0.7, 'Intermediate': 1.0, 'Advanced': 1.5,
          'Expert': 2.0, 'Celebrity': 3.5
        };
        
        const platformMultiplier = platformMultipliers[inputs.platform] || 1;
        const nicheMultiplier = nicheMultipliers[inputs.niche] || 1;
        const contentTypeMultiplier = contentTypeMultipliers[inputs.contentType] || 1;
        const experienceMultiplier = experienceMultipliers[inputs.experience] || 1;
        
        // Base rate calculation
        let baseRate = 0;
        if (followers < 10000) baseRate = 50;
        else if (followers < 50000) baseRate = followers * 0.01;
        else if (followers < 100000) baseRate = followers * 0.008;
        else if (followers < 500000) baseRate = followers * 0.006;
        else if (followers < 1000000) baseRate = followers * 0.005;
        else baseRate = followers * 0.004;
        
        // Apply multipliers
        const estimatedEarnings = baseRate * platformMultiplier * nicheMultiplier * contentTypeMultiplier * experienceMultiplier;
        
        // Calculate package pricing
        const storyPrice = estimatedEarnings * 0.6;
        const carouselPrice = estimatedEarnings * 1.3;
        const videoPrice = estimatedEarnings * 1.8;
        const seriesPrice = estimatedEarnings * 3.5;
        
        // Calculate annual potential
        const monthlyPosts =
  inputs.contentType === 'Blog'
    ? 8
    : inputs.contentType === 'Video/Reel'
    ? 12
    : 16;

        const annualEarnings = estimatedEarnings * monthlyPosts * 12;
        
        // Tier classification
        let tier = 'Nano';
        if (followers >= 1000000) tier = 'Mega-Celebrity';
        else if (followers >= 500000) tier = 'Macro';
        else if (followers >= 100000) tier = 'Mid-Tier';
        else if (followers >= 10000) tier = 'Micro';
        
        return {
          estimatedPostEarnings: '$' + Math.round(estimatedEarnings).toLocaleString(),
          storyPrice: '$' + Math.round(storyPrice).toLocaleString(),
          carouselPrice: '$' + Math.round(carouselPrice).toLocaleString(),
          videoPrice: '$' + Math.round(videoPrice).toLocaleString(),
          seriesPackage: '$' + Math.round(seriesPrice).toLocaleString(),
          monthlyPotential: '$' + Math.round(estimatedEarnings * monthlyPosts).toLocaleString(),
          annualPotential: '$' + Math.round(annualEarnings).toLocaleString(),
          influencerTier: tier,
          ratePer1000: '$' + Math.round((estimatedEarnings / followers) * 1000 * 100) / 100
        };
      }
    },
    {
      id: 'collaboration-pricing',
      title: 'Brand Collaboration Pricing',
      category: 'earnings',
      icon: <FaHandshake />,
      description: 'Comprehensive pricing calculator for brand deals',
      inputs: [
        { id: 'followers', label: 'Total Followers', type: 'number', placeholder: 'Enter follower count' },
        { id: 'engagementRate', label: 'Engagement Rate (%)', type: 'number', placeholder: 'Enter engagement rate' },
        { id: 'contentType', label: 'Content Type', type: 'select', options: ['Single Post', 'Story', 'Reel/Video', 'Carousel', 'Series (3 posts)', 'Series (5 posts)', 'Long-term Contract'] },
        { id: 'usageRights', label: 'Usage Rights', type: 'select', options: ['Platform Only', 'Limited Usage (30 days)', 'Limited Usage (90 days)', 'Full Rights', 'Exclusive Rights'] },
        { id: 'exclusivity', label: 'Exclusivity', type: 'select', options: ['None', 'Category Exclusivity', 'Full Exclusivity'] },
        { id: 'deliverables', label: 'Additional Deliverables', type: 'select', options: ['None', 'Behind-the-Scenes', 'Product Reviews', 'Tutorials', 'Live Stream', 'All Inclusive'] }
      ],
      calculate: (inputs) => {
        const followers = parseFloat(inputs.followers) || 0;
        const engagement = parseFloat(inputs.engagementRate) || 1;
        
        // Base calculation
        const baseRate = followers * (engagement / 100) * 0.15;
        
        // Content type multipliers
        const contentTypeMultipliers = {
          'Single Post': 1.0, 'Story': 0.5, 'Reel/Video': 1.8,
          'Carousel': 1.3, 'Series (3 posts)': 2.2, 'Series (5 posts)': 3.0,
          'Long-term Contract': 5.0
        };
        
        // Usage rights multipliers
        const rightsMultipliers = {
          'Platform Only': 1.0, 'Limited Usage (30 days)': 1.3,
          'Limited Usage (90 days)': 1.6, 'Full Rights': 2.2,
          'Exclusive Rights': 3.0
        };
        
        // Exclusivity multipliers
        const exclusivityMultipliers = {
          'None': 1.0, 'Category Exclusivity': 1.5, 'Full Exclusivity': 2.5
        };
        
        // Deliverables multipliers
        const deliverablesMultipliers = {
          'None': 1.0, 'Behind-the-Scenes': 1.2, 'Product Reviews': 1.3,
          'Tutorials': 1.4, 'Live Stream': 1.6, 'All Inclusive': 2.0
        };
        
        const typeMultiplier = contentTypeMultipliers[inputs.contentType] || 1;
        const rightsMultiplier = rightsMultipliers[inputs.usageRights] || 1;
        const exclusivityMultiplier = exclusivityMultipliers[inputs.exclusivity] || 1;
        const deliverablesMultiplier = deliverablesMultipliers[inputs.deliverables] || 1;
        
        const estimatedPrice = baseRate * typeMultiplier * rightsMultiplier * exclusivityMultiplier * deliverablesMultiplier;
        
        // Pricing ranges
        const minimumPrice = estimatedPrice * 0.8;
        const recommendedPrice = estimatedPrice;
        const premiumPrice = estimatedPrice * 1.2;
        
        // Value added services
        const revisionCost = estimatedPrice * 0.1;
        const rushFee = estimatedPrice * 0.25;
        const analyticsReport = estimatedPrice * 0.15;
        
        return {
          estimatedPrice: '$' + Math.round(estimatedPrice).toLocaleString(),
          priceRange: `$${Math.round(minimumPrice).toLocaleString()} - $${Math.round(premiumPrice).toLocaleString()}`,
          minimumPrice: '$' + Math.round(minimumPrice).toLocaleString(),
          recommendedPrice: '$' + Math.round(recommendedPrice).toLocaleString(),
          premiumPrice: '$' + Math.round(premiumPrice).toLocaleString(),
          revisionFee: '$' + Math.round(revisionCost).toLocaleString(),
          rushFee: '$' + Math.round(rushFee).toLocaleString(),
          analyticsReport: '$' + Math.round(analyticsReport).toLocaleString(),
          totalPackageWithExtras: '$' + Math.round(estimatedPrice + revisionCost + analyticsReport).toLocaleString()
        };
      }
    },
    {
      id: 'affiliate-earnings',
      title: 'Affiliate Marketing Calculator',
      category: 'earnings',
      icon: <FaShareAlt />,
      description: 'Calculate potential affiliate earnings and commissions',
      inputs: [
        { id: 'followers', label: 'Follower Count', type: 'number', placeholder: 'Enter follower count' },
        { id: 'engagementRate', label: 'Engagement Rate (%)', type: 'number', placeholder: 'Enter engagement rate' },
        { id: 'clickThroughRate', label: 'Click-Through Rate (%)', type: 'number', placeholder: 'Enter CTR (default 2%)' },
        { id: 'conversionRate', label: 'Conversion Rate (%)', type: 'number', placeholder: 'Enter conversion rate (default 3%)' },
        { id: 'avgOrderValue', label: 'Average Order Value ($)', type: 'number', placeholder: 'Enter AOV' },
        { id: 'commissionRate', label: 'Commission Rate (%)', type: 'number', placeholder: 'Enter commission %' },
        { id: 'postsPerMonth', label: 'Posts per Month', type: 'number', placeholder: 'Enter posts per month' }
      ],
      calculate: (inputs) => {
        const followers = parseFloat(inputs.followers) || 0;
        const engagement = parseFloat(inputs.engagementRate) || 1;
        const ctr = parseFloat(inputs.clickThroughRate) || 2;
        const cvr = parseFloat(inputs.conversionRate) || 3;
        const aov = parseFloat(inputs.avgOrderValue) || 50;
        const commission = parseFloat(inputs.commissionRate) || 10;
        const postsPerMonth = parseFloat(inputs.postsPerMonth) || 10;
        
        // Reach calculation
        const reach = followers * (engagement / 100);
        const clicks = reach * (ctr / 100);
        const conversions = clicks * (cvr / 100);
        
        // Earnings calculation
        const earningsPerPost = conversions * aov * (commission / 100);
        const monthlyEarnings = earningsPerPost * postsPerMonth;
        const annualEarnings = monthlyEarnings * 12;
        
        // Performance metrics
        const epc = earningsPerPost / 100; // Earnings per 100 clicks
        const roas = aov / (earningsPerPost / conversions) || 0;
        
        // Projections
        const projectedGrowth = monthlyEarnings * 1.2; // 20% growth
        const breakEvenFollowers = (earningsPerPost > 0) ? followers * 0.5 : 0;
        
        return {
          estimatedReach: Math.round(reach).toLocaleString(),
          estimatedClicks: Math.round(clicks).toLocaleString(),
          estimatedConversions: Math.round(conversions).toLocaleString(),
          earningsPerPost: '$' + Math.round(earningsPerPost).toLocaleString(),
          monthlyEarnings: '$' + Math.round(monthlyEarnings).toLocaleString(),
          annualEarnings: '$' + Math.round(annualEarnings).toLocaleString(),
          earningsPerClick: '$' + (earningsPerPost / (clicks || 1)).toFixed(2),
          epc: '$' + epc.toFixed(2),
          roas: roas.toFixed(2) + 'x',
          projectedMonthlyEarnings: '$' + Math.round(projectedGrowth).toLocaleString()
        };
      }
    },

    // ============ CAMPAIGN MANAGEMENT CATEGORY ============
    {
      id: 'campaign-planning',
      title: 'Campaign Planning & Budgeting',
      category: 'campaign',
      icon: <FaClipboardList />,
      description: 'Complete campaign planning and budget allocation tool',
      inputs: [
        { id: 'campaignDuration', label: 'Campaign Duration (Days)', type: 'number', placeholder: 'Enter campaign length' },
        { id: 'totalBudget', label: 'Total Campaign Budget ($)', type: 'number', placeholder: 'Enter total budget' },
        { id: 'influencerCount', label: 'Number of Influencers', type: 'number', placeholder: 'Enter influencer count' },
        { id: 'contentPieces', label: 'Content Pieces per Influencer', type: 'number', placeholder: 'Enter content per influencer' },
        { id: 'platforms', label: 'Target Platforms', type: 'select', options: ['Instagram Only', 'TikTok Only', 'Multi-Platform (2)', 'Multi-Platform (3+)', 'All Major Platforms'] },
        { id: 'campaignGoal', label: 'Primary Campaign Goal', type: 'select', options: ['Brand Awareness', 'Sales/Conversions', 'Product Launch', 'Event Promotion', 'Content Generation', 'Community Growth'] }
      ],
      calculate: (inputs) => {
        const duration = parseFloat(inputs.campaignDuration) || 30;
        const budget = parseFloat(inputs.totalBudget) || 0;
        const influencerCount = parseFloat(inputs.influencerCount) || 1;
        const contentPerInfluencer = parseFloat(inputs.contentPieces) || 3;
        
        // Budget allocation
        const influencerBudget = budget * 0.7; // 70% to influencers
        const productionBudget = budget * 0.15; // 15% to production
        const adBudget = budget * 0.1; // 10% to ads
        const managementBudget = budget * 0.05; // 5% to management
        
        const avgInfluencerPayment = influencerCount > 0 ? influencerBudget / influencerCount : 0;
        const costPerContent = avgInfluencerPayment / (contentPerInfluencer || 1);
        
        // Timeline planning
        const planningPhase = Math.ceil(duration * 0.2);
        const executionPhase = Math.ceil(duration * 0.5);
        const analysisPhase = Math.ceil(duration * 0.3);
        
        // Content calendar
        const totalContentPieces = influencerCount * contentPerInfluencer;
        const contentPerDay = totalContentPieces / executionPhase;
        
        // Expected outcomes by goal
        const expectedReach = budget * 50; // Conservative estimate
        const expectedImpressions = budget * 100;
        const expectedEngagements = budget * 5;
        const expectedConversions = budget * 0.5;
        
        return {
          influencerBudget: '$' + Math.round(influencerBudget).toLocaleString(),
          productionBudget: '$' + Math.round(productionBudget).toLocaleString(),
          adBudget: '$' + Math.round(adBudget).toLocaleString(),
          managementBudget: '$' + Math.round(managementBudget).toLocaleString(),
          avgInfluencerPayment: '$' + Math.round(avgInfluencerPayment).toLocaleString(),
          costPerContent: '$' + Math.round(costPerContent).toLocaleString(),
          planningPhase: planningPhase + ' days',
          executionPhase: executionPhase + ' days',
          analysisPhase: analysisPhase + ' days',
          totalContentPieces: totalContentPieces,
          contentPerDay: contentPerDay.toFixed(1),
          expectedReach: Math.round(expectedReach).toLocaleString(),
          expectedImpressions: Math.round(expectedImpressions).toLocaleString(),
          expectedEngagements: Math.round(expectedEngagements).toLocaleString(),
          expectedConversions: Math.round(expectedConversions).toLocaleString(),
          estimatedCPM: '$' + (budget > 0 ? (budget / expectedImpressions * 1000).toFixed(2) : 0)
        };
      }
    },
    {
      id: 'content-calendar',
      title: 'Content Calendar Optimizer',
      category: 'campaign',
      icon: <FaCalendarAlt />,
      description: 'Optimize your content posting schedule for maximum engagement',
      inputs: [
        { id: 'platform', label: 'Primary Platform', type: 'select', options: ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook', 'LinkedIn'] },
        { id: 'weeklyPosts', label: 'Posts per Week', type: 'number', placeholder: 'Enter posts per week' },
        { id: 'avgEngagement', label: 'Current Engagement Rate (%)', type: 'number', placeholder: 'Enter current engagement' },
        { id: 'contentMix', label: 'Content Mix', type: 'select', options: ['Photos Only', 'Videos Only', 'Mixed (50/50)', 'Stories Heavy', 'Carousel Focused'] },
        { id: 'bestTime', label: 'Best Posting Time', type: 'select', options: ['Morning (6-10am)', 'Midday (11am-2pm)', 'Afternoon (3-6pm)', 'Evening (7-10pm)', 'Late Night (11pm-2am)', 'Not Sure'] }
      ],
      calculate: (inputs) => {
        const weeklyPosts = parseFloat(inputs.weeklyPosts) || 7;
        const currentEngagement = parseFloat(inputs.avgEngagement) || 1;
        
        // Platform optimal frequency
        const optimalFrequency = {
          'Instagram': 7, 'TikTok': 10, 'YouTube': 3,
          'Twitter': 15, 'Facebook': 5, 'LinkedIn': 3
        };
        
        const optimal = optimalFrequency[inputs.platform] || 7;
        const frequencyScore = Math.min(100, (weeklyPosts / optimal) * 100);
        
        // Engagement lift by content mix
        const mixMultipliers = {
          'Photos Only': 1.0, 'Videos Only': 1.3,
          'Mixed (50/50)': 1.2, 'Stories Heavy': 1.1,
          'Carousel Focused': 1.25
        };
        
        // Time of day multipliers
        const timeMultipliers = {
          'Morning (6-10am)': 1.15, 'Midday (11am-2pm)': 1.1,
          'Afternoon (3-6pm)': 1.2, 'Evening (7-10pm)': 1.25,
          'Late Night (11pm-2am)': 0.9, 'Not Sure': 1.0
        };
        
        const mixMultiplier = mixMultipliers[inputs.contentMix] || 1;
        const timeMultiplier = timeMultipliers[inputs.bestTime] || 1;
        
        const projectedEngagement = currentEngagement * mixMultiplier * timeMultiplier;
        const engagementIncrease = ((projectedEngagement - currentEngagement) / currentEngagement) * 100;
        
        // Best days to post (platform specific)
        const bestDays = {
          'Instagram': ['Sunday', 'Monday', 'Thursday'],
          'TikTok': ['Tuesday', 'Thursday', 'Friday'],
          'YouTube': ['Thursday', 'Friday', 'Saturday'],
          'Twitter': ['Wednesday', 'Friday', 'Sunday'],
          'Facebook': ['Wednesday', 'Thursday', 'Friday'],
          'LinkedIn': ['Tuesday', 'Wednesday', 'Thursday']
        };
        
        return {
          optimalPostsPerWeek: optimal,
          frequencyScore: frequencyScore.toFixed(1) + '%',
          currentFrequencyRating: frequencyScore >= 80 ? 'Optimal' : frequencyScore >= 60 ? 'Good' : 'Needs Improvement',
          projectedEngagementRate: projectedEngagement.toFixed(2) + '%',
          engagementIncrease: engagementIncrease.toFixed(1) + '%',
          recommendedMix: inputs.contentMix,
          bestTimeToPost: inputs.bestTime !== 'Not Sure' ? inputs.bestTime : 'Test different times',
          bestDaysToPost: bestDays[inputs.platform].join(', '),
          weeklySchedule: `Post ${optimal} times: ${bestDays[inputs.platform].slice(0, 3).join(', ')} at ${inputs.bestTime.split(' ')[0]}`,
          monthlyContentGoal: Math.round(weeklyPosts * 4.3),
          estimatedReachIncrease: Math.round(engagementIncrease * 0.8) + '%'
        };
      }
    },
    {
      id: 'campaign-timeline',
      title: 'Campaign Timeline Planner',
      category: 'campaign',
      icon: <FaRegClock />,
      description: 'Plan and optimize campaign timelines and milestones',
      inputs: [
        { id: 'campaignType', label: 'Campaign Type', type: 'select', options: ['Product Launch', 'Seasonal Campaign', 'Brand Awareness', 'Sales Event', 'Influencer Takeover', 'User Generated Content'] },
        { id: 'launchDate', label: 'Target Launch Date', type: 'date', placeholder: 'Select launch date' },
        { id: 'preparationWeeks', label: 'Preparation Weeks', type: 'number', placeholder: 'Weeks needed for prep' },
        { id: 'influencerCount', label: 'Number of Influencers', type: 'number', placeholder: 'Enter influencer count' },
        { id: 'contentComplexity', label: 'Content Complexity', type: 'select', options: ['Low (Photos only)', 'Medium (Mixed content)', 'High (Video production)', 'Very High (Professional production)'] }
      ],
      calculate: (inputs) => {
        const prepWeeks = parseFloat(inputs.preparationWeeks) || 4;
        const influencerCount = parseFloat(inputs.influencerCount) || 5;
        
        // Timeline phases
        const researchPhase = 1;
        const outreachPhase = Math.ceil(influencerCount * 0.5);
        const negotiationPhase = Math.ceil(influencerCount * 0.3);
        const briefingPhase = 1;
        
        // Content complexity multipliers
        const complexityMultipliers = {
          'Low (Photos only)': 1,
          'Medium (Mixed content)': 1.5,
          'High (Video production)': 2,
          'Very High (Professional production)': 3
        };
        
        const contentProductionWeeks = prepWeeks * (complexityMultipliers[inputs.contentComplexity] || 1);
        const reviewPhase = 1;
        const approvalPhase = 0.5;
        
        const totalPrepWeeks = researchPhase + outreachPhase + negotiationPhase + briefingPhase + contentProductionWeeks + reviewPhase + approvalPhase;
        
        // Campaign duration based on type
        const campaignDurations = {
          'Product Launch': 4,
          'Seasonal Campaign': 3,
          'Brand Awareness': 6,
          'Sales Event': 2,
          'Influencer Takeover': 1,
          'User Generated Content': 8
        };
        
        const campaignDuration = campaignDurations[inputs.campaignType] || 4;
        
        // Milestones
        const milestones = [
          { phase: 'Research & Strategy', duration: researchPhase },
          { phase: 'Influencer Outreach', duration: outreachPhase },
          { phase: 'Negotiation & Contracts', duration: negotiationPhase },
          { phase: 'Creative Briefing', duration: briefingPhase },
          { phase: 'Content Production', duration: contentProductionWeeks },
          { phase: 'Review & Feedback', duration: reviewPhase },
          { phase: 'Final Approval', duration: approvalPhase },
          { phase: 'Campaign Launch', duration: 0 },
          { phase: 'Campaign Execution', duration: campaignDuration },
          { phase: 'Performance Analysis', duration: 1 }
        ];
        
        return {
          totalPreparationWeeks: Math.ceil(totalPrepWeeks),
          totalCampaignWeeks: Math.ceil(totalPrepWeeks + campaignDuration + 1),
          campaignDuration: campaignDuration + ' weeks',
          researchPhase: researchPhase + ' week',
          outreachPhase: outreachPhase + ' weeks',
          negotiationPhase: negotiationPhase + ' weeks',
          contentProductionTime: contentProductionWeeks.toFixed(1) + ' weeks',
          launchReadiness: totalPrepWeeks <= prepWeeks ? 'On Track' : 'Behind Schedule',
          milestones: milestones.map(m => `${m.phase}: ${m.duration > 0 ? m.duration + ' week(s)' : 'Launch Day'}`).join(' → '),
          recommendedPrepWeeks: Math.ceil(totalPrepWeeks),
          bufferRecommended: Math.ceil(totalPrepWeeks * 0.2) + ' weeks buffer'
        };
      }
    },
    {
      id: 'influencer-selection',
      title: 'Influencer Selection Scorecard',
      category: 'campaign',
      icon: <FaStar />,
      description: 'Score and compare influencers for your campaign',
      inputs: [
        { id: 'followers', label: 'Follower Count', type: 'number', placeholder: 'Enter follower count' },
        { id: 'engagementRate', label: 'Engagement Rate (%)', type: 'number', placeholder: 'Enter engagement rate' },
        { id: 'contentQuality', label: 'Content Quality', type: 'select', options: ['Poor', 'Average', 'Good', 'Excellent', 'Professional'] },
        { id: 'brandFit', label: 'Brand Fit Score', type: 'select', options: ['Poor', 'Fair', 'Good', 'Excellent', 'Perfect'] },
        { id: 'audienceOverlap', label: 'Audience Overlap', type: 'select', options: ['<10%', '10-25%', '25-50%', '50-75%', '>75%'] },
        { id: 'pastPerformance', label: 'Past Campaign Performance', type: 'select', options: ['No data', 'Poor', 'Average', 'Good', 'Excellent'] }
      ],
      calculate: (inputs) => {
        const followers = parseFloat(inputs.followers) || 0;
        const engagement = parseFloat(inputs.engagementRate) || 0;
        
        // Score mappings
        const qualityScores = { 'Poor': 20, 'Average': 40, 'Good': 60, 'Excellent': 80, 'Professional': 100 };
        const brandFitScores = { 'Poor': 20, 'Fair': 40, 'Good': 60, 'Excellent': 80, 'Perfect': 100 };
        const overlapScores = { '<10%': 100, '10-25%': 80, '25-50%': 60, '50-75%': 40, '>75%': 20 };
        const performanceScores = { 'No data': 30, 'Poor': 20, 'Average': 50, 'Good': 70, 'Excellent': 90 };
        
        // Calculate individual scores
        const reachScore = Math.min(100, (followers / 100000) * 20);
        const engagementScore = Math.min(100, engagement * 20);
        const qualityScore = qualityScores[inputs.contentQuality] || 40;
        const brandFitScore = brandFitScores[inputs.brandFit] || 40;
        const overlapScore = overlapScores[inputs.audienceOverlap] || 60;
        const performanceScore = performanceScores[inputs.pastPerformance] || 30;
        
        // Weighted total score
        const totalScore = (
          reachScore * 0.1 +
          engagementScore * 0.25 +
          qualityScore * 0.15 +
          brandFitScore * 0.25 +
          overlapScore * 0.1 +
          performanceScore * 0.15
        );
        
        // Rating classification
        let rating = 'Poor';
        let recommendation = 'Not Recommended';
        if (totalScore >= 80) {
          rating = 'Excellent';
          recommendation = 'Strongly Recommend';
        } else if (totalScore >= 65) {
          rating = 'Good';
          recommendation = 'Recommended';
        } else if (totalScore >= 50) {
          rating = 'Average';
          recommendation = 'Consider with Caution';
        } else if (totalScore >= 35) {
          rating = 'Fair';
          recommendation = 'Not Recommended';
        } else {
          rating = 'Poor';
          recommendation = 'Reject';
        }
        
        // Estimated cost bracket
        let costBracket = 'N/A';
        if (followers > 1000000) costBracket = '$5,000+';
        else if (followers > 500000) costBracket = '$2,000-$5,000';
        else if (followers > 100000) costBracket = '$500-$2,000';
        else if (followers > 50000) costBracket = '$250-$500';
        else if (followers > 10000) costBracket = '$100-$250';
        else costBracket = 'Under $100';
        
        return {
          reachScore: reachScore.toFixed(1) + '/100',
          engagementScore: engagementScore.toFixed(1) + '/100',
          qualityScore: qualityScore + '/100',
          brandFitScore: brandFitScore + '/100',
          audienceOverlapScore: overlapScore + '/100',
          pastPerformanceScore: performanceScore + '/100',
          totalScore: totalScore.toFixed(1) + '/100',
          rating: rating,
          recommendation: recommendation,
          estimatedCostBracket: costBracket,
          priorityLevel: totalScore >= 70 ? 'High Priority' : totalScore >= 50 ? 'Medium Priority' : 'Low Priority'
        };
      }
    },

    // ============ AUDIENCE ANALYTICS CATEGORY ============
    {
      id: 'audience-demographics',
      title: 'Audience Demographics Analyzer',
      category: 'audience',
      icon: <FaUsers />,
      description: 'Comprehensive audience demographic analysis',
      inputs: [
        { id: 'followers', label: 'Total Followers', type: 'number', placeholder: 'Enter total followers' },
        { id: 'usAudience', label: 'US/Audience (%)', type: 'number', placeholder: 'Percentage of target country' },
        { id: 'age1824', label: 'Age 18-24 (%)', type: 'number', placeholder: 'Percentage' },
        { id: 'age2534', label: 'Age 25-34 (%)', type: 'number', placeholder: 'Percentage' },
        { id: 'age3544', label: 'Age 35-44 (%)', type: 'number', placeholder: 'Percentage' },
        { id: 'age45plus', label: 'Age 45+ (%)', type: 'number', placeholder: 'Percentage' },
        { id: 'femalePercentage', label: 'Female (%)', type: 'number', placeholder: 'Female percentage' },
        { id: 'malePercentage', label: 'Male (%)', type: 'number', placeholder: 'Male percentage' }
      ],
      calculate: (inputs) => {
        const followers = parseFloat(inputs.followers) || 0;
        const usAudience = parseFloat(inputs.usAudience) || 0;
        const age1824 = parseFloat(inputs.age1824) || 0;
        const age2534 = parseFloat(inputs.age2534) || 0;
        const age3544 = parseFloat(inputs.age3544) || 0;
        const age45plus = parseFloat(inputs.age45plus) || 0;
        const femalePct = parseFloat(inputs.femalePercentage) || 0;
        const malePct = parseFloat(inputs.malePercentage) || 0;
        
        // Calculate audience value
        const usAudienceValue = followers * (usAudience / 100) * 0.15;
        const youngAudience = age1824 + age2534;
        const midAudience = age3544;
        const matureAudience = age45plus;
        
        // Audience quality score
        let audienceQuality = 50;
        if (youngAudience > 50) audienceQuality = 80;
        else if (youngAudience > 30) audienceQuality = 70;
        else if (midAudience > 40) audienceQuality = 65;
        else if (matureAudience > 50) audienceQuality = 60;
        
        // Gender distribution balance
        const genderBalance = femalePct > 0 && malePct > 0 ? 
          100 - Math.abs(femalePct - malePct) : 50;
        
        const audienceScore = (audienceQuality * 0.6 + genderBalance * 0.4);
        
        // Platform specific insights
        let primaryGender = 'Balanced';
        if (femalePct > 60) primaryGender = 'Female Dominant';
        else if (malePct > 60) primaryGender = 'Male Dominant';
        
        let primaryAgeGroup = '18-24';
        const ages = [
          { name: '18-24', value: age1824 },
          { name: '25-34', value: age2534 },
          { name: '35-44', value: age3544 },
          { name: '45+', value: age45plus }
        ];
        const maxAge = ages.reduce((max, age) => age.value > max.value ? age : max, ages[0]);
        primaryAgeGroup = maxAge.name;
        
        return {
          usAudienceCount: Math.round(followers * (usAudience / 100)).toLocaleString(),
          usAudienceValue: '$' + Math.round(usAudienceValue).toLocaleString(),
          ageDistribution: `${age1824}% (18-24), ${age2534}% (25-34), ${age3544}% (35-44), ${age45plus}% (45+)`,
          primaryAgeGroup: primaryAgeGroup,
          genderDistribution: `${femalePct}% Female, ${malePct}% Male`,
          primaryGender: primaryGender,
          genderBalanceScore: genderBalance.toFixed(1) + '%',
          audienceQualityScore: audienceScore.toFixed(1) + '/100',
          audienceRating: audienceScore >= 80 ? 'Premium' : audienceScore >= 60 ? 'Valuable' : audienceScore >= 40 ? 'Average' : 'Developing',
          recommendedNiche: primaryAgeGroup === '18-24' ? 'Trendy/Entertainment' : primaryAgeGroup === '25-34' ? 'Career/Lifestyle' : 'Family/Finance',
          estimatedCPM: '$' + (usAudienceValue > 0 ? (usAudienceValue / (followers * (usAudience / 100)) * 1000).toFixed(2) : '0.00')
        };
      }
    },
    {
      id: 'audience-growth',
      title: 'Audience Growth Analyzer',
      category: 'audience',
      icon: <FaRocket />,
      description: 'Track and project audience growth metrics',
      inputs: [
        { id: 'currentFollowers', label: 'Current Followers', type: 'number', placeholder: 'Enter current followers' },
        { id: 'monthlyGrowth', label: 'Monthly Growth Rate (%)', type: 'number', placeholder: 'Enter growth rate %' },
        { id: 'months', label: 'Projection Period (Months)', type: 'number', placeholder: 'Enter months to project' },
        { id: 'contentFrequency', label: 'Content Frequency', type: 'select', options: ['Low (1-2/week)', 'Medium (3-5/week)', 'High (6-10/week)', 'Very High (11+/week)'] },
        { id: 'engagementTrend', label: 'Engagement Trend', type: 'select', options: ['Declining', 'Stable', 'Growing', 'Viral'] }
      ],
      calculate: (inputs) => {
        const current = parseFloat(inputs.currentFollowers) || 0;
        const growthRate = parseFloat(inputs.monthlyGrowth) || 1;
        const months = parseFloat(inputs.months) || 12;
        
        // Content frequency multipliers
        const frequencyMultipliers = {
          'Low (1-2/week)': 0.7,
          'Medium (3-5/week)': 1.0,
          'High (6-10/week)': 1.3,
          'Very High (11+/week)': 1.5
        };
        
        // Engagement trend multipliers
        const trendMultipliers = {
          'Declining': 0.6,
          'Stable': 1.0,
          'Growing': 1.4,
          'Viral': 2.5
        };
        
        const frequencyMultiplier = frequencyMultipliers[inputs.contentFrequency] || 1;
        const trendMultiplier = trendMultipliers[inputs.engagementTrend] || 1;
        
        // Adjusted growth rate
        const adjustedGrowthRate = growthRate * frequencyMultiplier * trendMultiplier;
        
        // Calculate projections
        let projectedFollowers = current;
        let monthlyProjections = [];
        
        for (let i = 1; i <= months; i++) {
          projectedFollowers = projectedFollowers * (1 + (adjustedGrowthRate / 100));
          monthlyProjections.push({
            month: i,
            followers: Math.round(projectedFollowers)
          });
        }
        
        const totalGrowth = projectedFollowers - current;
        const growthPercentage = ((projectedFollowers - current) / current) * 100;
        
        // Time to reach milestones
        const timeTo10k = current < 10000 ? 
          Math.ceil(Math.log(10000 / current) / Math.log(1 + adjustedGrowthRate / 100)) : 0;
        const timeTo100k = current < 100000 ? 
          Math.ceil(Math.log(100000 / current) / Math.log(1 + adjustedGrowthRate / 100)) : 0;
        const timeTo1M = current < 1000000 ? 
          Math.ceil(Math.log(1000000 / current) / Math.log(1 + adjustedGrowthRate / 100)) : 0;
        
        return {
          currentFollowers: current.toLocaleString(),
          monthlyGrowthRate: growthRate + '%',
          adjustedGrowthRate: adjustedGrowthRate.toFixed(2) + '%',
          projectedFollowers: Math.round(projectedFollowers).toLocaleString(),
          totalGrowth: Math.round(totalGrowth).toLocaleString(),
          growthPercentage: growthPercentage.toFixed(1) + '%',
          monthlyProjection: `${Math.round(monthlyProjections[0]?.followers || 0).toLocaleString()} in 1 month → ${Math.round(monthlyProjections[months-1]?.followers || 0).toLocaleString()} in ${months} months`,
          timeTo10k: timeTo10k > 0 ? timeTo10k + ' months' : 'Already achieved',
          timeTo100k: timeTo100k > 0 ? timeTo100k + ' months' : 'Already achieved',
          timeTo1M: timeTo1M > 0 ? timeTo1M + ' months' : 'Already achieved',
          growthVelocity: Math.round(totalGrowth / months).toLocaleString() + ' followers/month',
          recommendation: adjustedGrowthRate < 2 ? 'Increase posting frequency' : adjustedGrowthRate < 5 ? 'Good momentum, maintain consistency' : 'Excellent growth rate'
        };
      }
    },
    {
      id: 'sentiment-analysis',
      title: 'Audience Sentiment Analyzer',
      category: 'audience',
      icon: <FaRegThumbsUp />,
      description: 'Analyze audience sentiment from comments and feedback',
      inputs: [
        { id: 'totalComments', label: 'Total Comments Analyzed', type: 'number', placeholder: 'Enter comment count' },
        { id: 'positiveComments', label: 'Positive Comments', type: 'number', placeholder: 'Number of positive' },
        { id: 'negativeComments', label: 'Negative Comments', type: 'number', placeholder: 'Number of negative' },
        { id: 'neutralComments', label: 'Neutral Comments', type: 'number', placeholder: 'Number of neutral' },
        { id: 'questions', label: 'Questions/Inquiries', type: 'number', placeholder: 'Questions count' },
        { id: 'sentimentTrend', label: 'Sentiment Trend', type: 'select', options: ['Improving', 'Stable', 'Declining', 'Volatile'] }
      ],
      calculate: (inputs) => {
        const total = parseFloat(inputs.totalComments) || 1;
        const positive = parseFloat(inputs.positiveComments) || 0;
        const negative = parseFloat(inputs.negativeComments) || 0;
        const neutral = parseFloat(inputs.neutralComments) || 0;
        const questions = parseFloat(inputs.questions) || 0;
        
        // Calculate sentiment scores
        const positiveRatio = (positive / total) * 100;
        const negativeRatio = (negative / total) * 100;
        const neutralRatio = (neutral / total) * 100;
        const questionRatio = (questions / total) * 100;
        
        // Net sentiment score
        const netSentiment = positiveRatio - negativeRatio;
        
        // Engagement quality score
        const engagementQuality = (positiveRatio * 1.5) - (negativeRatio * 1) + (neutralRatio * 0.5);
        
        // Sentiment classification
        let sentimentCategory = 'Neutral';
        if (netSentiment >= 50) sentimentCategory = 'Very Positive';
        else if (netSentiment >= 25) sentimentCategory = 'Positive';
        else if (netSentiment >= 0) sentimentCategory = 'Slightly Positive';
        else if (netSentiment >= -25) sentimentCategory = 'Slightly Negative';
        else if (netSentiment >= -50) sentimentCategory = 'Negative';
        else sentimentCategory = 'Very Negative';
        
        // Health score (0-100)
        const healthScore = Math.min(100, Math.max(0, 50 + netSentiment * 0.5 + (engagementQuality / total) * 20));
        
        // Response recommendation
        let recommendation = 'Monitor sentiment regularly';
        if (negativeRatio > 30) recommendation = 'Address negative feedback immediately';
        else if (questions > total * 0.2) recommendation = 'Create FAQ or Q&A content';
        else if (positiveRatio > 70) recommendation = 'Leverage positive sentiment for social proof';
        
        return {
          sentimentDistribution: `${positiveRatio.toFixed(1)}% Positive, ${neutralRatio.toFixed(1)}% Neutral, ${negativeRatio.toFixed(1)}% Negative`,
          positiveRatio: positiveRatio.toFixed(1) + '%',
          negativeRatio: negativeRatio.toFixed(1) + '%',
          neutralRatio: neutralRatio.toFixed(1) + '%',
          questionRatio: questionRatio.toFixed(1) + '%',
          netSentimentScore: netSentiment.toFixed(1),
          sentimentCategory: sentimentCategory,
          audienceHealthScore: healthScore.toFixed(1) + '/100',
          engagementQualityScore: (engagementQuality / total * 100).toFixed(1) + '/100',
          recommendation: recommendation,
          responsePriority: negativeRatio > 30 ? 'High' : negativeRatio > 15 ? 'Medium' : 'Low'
        };
      }
    },

    // ============ CONTENT STRATEGY CATEGORY ============
    {
      id: 'content-value',
      title: 'Content Value Calculator',
      category: 'content',
      icon: <FaVideo />,
      description: 'Calculate the true value of your content assets',
      inputs: [
        { id: 'views', label: 'Average Views', type: 'number', placeholder: 'Enter average views' },
        { id: 'engagementRate', label: 'Engagement Rate (%)', type: 'number', placeholder: 'Enter engagement rate' },
        { id: 'contentType', label: 'Content Type', type: 'select', options: ['Reel/Short', 'Post', 'Story', 'Long Video', 'Carousel', 'Blog'] },
        { id: 'productionTime', label: 'Production Time (Hours)', type: 'number', placeholder: 'Hours to produce' },
        { id: 'productionCost', label: 'Production Cost ($)', type: 'number', placeholder: 'Enter production cost' },
        { id: 'contentLongevity', label: 'Content Longevity', type: 'select', options: ['1 day (Stories)', '1 week', '1 month', '3 months', 'Evergreen (6+ months)'] }
      ],
      calculate: (inputs) => {
        const views = parseFloat(inputs.views) || 0;
        const engagement = parseFloat(inputs.engagementRate) || 1;
        const prodHours = parseFloat(inputs.productionTime) || 1;
        const prodCost = parseFloat(inputs.productionCost) || 0;
        
        // Content type value multipliers
        const typeMultipliers = {
          'Reel/Short': 1.8, 'Post': 1.0, 'Story': 0.5,
          'Long Video': 2.2, 'Carousel': 1.4, 'Blog': 2.5
        };
        
        // Longevity multipliers
        const longevityMultipliers = {
          '1 day (Stories)': 0.3, '1 week': 0.6, '1 month': 1.0,
          '3 months': 1.8, 'Evergreen (6+ months)': 3.0
        };
        
        const typeMultiplier = typeMultipliers[inputs.contentType] || 1;
        const longevityMultiplier = longevityMultipliers[inputs.contentLongevity] || 1;
        
        // Calculate content value
        const baseValue = views * (engagement / 100) * 0.1;
        const contentValue = baseValue * typeMultiplier * longevityMultiplier;
        
        // Efficiency metrics
        const valuePerHour = contentValue / prodHours;
        const roi = prodCost > 0 ? ((contentValue - prodCost) / prodCost) * 100 : 0;
        const valuePer1000Views = views > 0 ? (contentValue / views) * 1000 : 0;
        
        // Performance rating
        let performanceRating = 'Average';
        if (valuePerHour > 100) performanceRating = 'Excellent';
        else if (valuePerHour > 50) performanceRating = 'Good';
        else if (valuePerHour > 25) performanceRating = 'Average';
        else performanceRating = 'Poor';
        
        return {
          contentValue: '$' + Math.round(contentValue).toLocaleString(),
          valuePerHour: '$' + Math.round(valuePerHour).toLocaleString(),
          valuePer1000Views: '$' + valuePer1000Views.toFixed(2),
          productionEfficiency: performanceRating,
          contentRoi: roi.toFixed(1) + '%',
          estimatedLifetimeValue: '$' + Math.round(contentValue * longevityMultiplier).toLocaleString(),
          costPerView: '$' + (prodCost / (views || 1)).toFixed(3),
          breakEvenViews: Math.ceil(prodCost / (valuePer1000Views / 1000 || 0.01)),
          recommendation: roi > 200 ? 'Scale this content type' : roi > 100 ? 'Continue producing' : roi > 0 ? 'Optimize production' : 'Reconsider format'
        };
      }
    },
    {
      id: 'hashtag-performance',
      title: 'Hashtag Performance Analyzer',
      category: 'content',
      icon: <FaHashtag />,
      description: 'Advanced hashtag strategy and performance analysis',
      inputs: [
        { id: 'hashtag', label: 'Primary Hashtag', type: 'text', placeholder: 'Enter hashtag (without #)' },
        { id: 'postsUsingHashtag', label: 'Posts Using Hashtag', type: 'number', placeholder: 'Number of your posts' },
        { id: 'avgLikes', label: 'Avg Likes with Hashtag', type: 'number', placeholder: 'Average likes' },
        { id: 'avgComments', label: 'Avg Comments with Hashtag', type: 'number', placeholder: 'Average comments' },
        { id: 'hashtagVolume', label: 'Hashtag Usage Volume', type: 'select', options: ['Low (<1k)', 'Medium (1k-50k)', 'High (50k-500k)', 'Very High (500k-1M)', 'Viral (1M+)'] },
        { id: 'hashtagDifficulty', label: 'Hashtag Difficulty', type: 'select', options: ['Easy', 'Moderate', 'Hard', 'Very Hard'] }
      ],
      calculate: (inputs) => {
        const posts = parseFloat(inputs.postsUsingHashtag) || 1;
        const likes = parseFloat(inputs.avgLikes) || 0;
        const comments = parseFloat(inputs.avgComments) || 0;
        const hashtag = inputs.hashtag || 'your_hashtag';
        
        // Volume scores
        const volumeScores = {
          'Low (<1k)': 30, 'Medium (1k-50k)': 60,
          'High (50k-500k)': 80, 'Very High (500k-1M)': 50,
          'Viral (1M+)': 30
        };
        
        // Difficulty scores (lower is better)
        const difficultyScores = {
          'Easy': 20, 'Moderate': 40, 'Hard': 70, 'Very Hard': 90
        };
        
        const volumeScore = volumeScores[inputs.hashtagVolume] || 50;
        const difficultyScore = difficultyScores[inputs.hashtagDifficulty] || 50;
        
        // Performance metrics
        const totalEngagement = likes + comments;
        const engagementPerPost = totalEngagement / posts;
        const performanceScore = (engagementPerPost / 100) * (100 - difficultyScore) * (volumeScore / 100);
        
        // Hashtag effectiveness
        let effectiveness = 'Poor';
        if (performanceScore > 50) effectiveness = 'Excellent';
        else if (performanceScore > 30) effectiveness = 'Good';
        else if (performanceScore > 15) effectiveness = 'Average';
        
        // Recommended hashtag strategy
        let strategy = '';
        if (difficultyScore > 70 && volumeScore > 70) {
          strategy = 'Use as secondary hashtag, too competitive for primary';
        } else if (difficultyScore < 40 && volumeScore > 60) {
          strategy = 'Excellent primary hashtag candidate';
        } else if (volumeScore < 40) {
          strategy = 'Niche hashtag, good for targeted reach';
        } else {
          strategy = 'Balanced hashtag, use in rotation';
        }
        
        return {
          hashtag: '#' + hashtag,
          totalEngagement: totalEngagement.toLocaleString(),
          engagementPerPost: engagementPerPost.toFixed(1),
          performanceScore: performanceScore.toFixed(1) + '/100',
          effectiveness: effectiveness,
          difficultyLevel: inputs.hashtagDifficulty,
          volumeLevel: inputs.hashtagVolume,
          recommendedStrategy: strategy,
          estimatedReachPotential: volumeScore > 70 ? 'High' : volumeScore > 40 ? 'Medium' : 'Low',
          competitionLevel: difficultyScore > 70 ? 'High' : difficultyScore > 40 ? 'Medium' : 'Low',
          valueScore: ((volumeScore * (100 - difficultyScore)) / 100).toFixed(1) + '%'
        };
      }
    },
    {
      id: 'content-mix',
      title: 'Content Mix Optimizer',
      category: 'content',
      icon: <FaPenFancy />,
      description: 'Optimize your content mix for maximum engagement',
      inputs: [
        { id: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook', 'LinkedIn'] },
        { id: 'currentPhotoPct', label: 'Current Photos (%)', type: 'number', placeholder: 'Photo percentage' },
        { id: 'currentVideoPct', label: 'Current Videos (%)', type: 'number', placeholder: 'Video percentage' },
        { id: 'currentCarouselPct', label: 'Current Carousels (%)', type: 'number', placeholder: 'Carousel percentage' },
        { id: 'currentStoryPct', label: 'Current Stories (%)', type: 'number', placeholder: 'Story percentage' },
        { id: 'goalEngagement', label: 'Goal Engagement Rate (%)', type: 'number', placeholder: 'Target engagement %' },
        { id: 'niche', label: 'Niche', type: 'select', options: ['Fashion/Beauty', 'Tech/Gaming', 'Food/Travel', 'Fitness/Health', 'Education/Business', 'Entertainment'] }
      ],
      calculate: (inputs) => {
        const photoPct = parseFloat(inputs.currentPhotoPct) || 25;
        const videoPct = parseFloat(inputs.currentVideoPct) || 25;
        const carouselPct = parseFloat(inputs.currentCarouselPct) || 25;
        const storyPct = parseFloat(inputs.currentStoryPct) || 25;
        const goalEngagement = parseFloat(inputs.goalEngagement) || 3;
        
        // Platform optimal mix
        const optimalMix = {
          'Instagram': { photo: 25, video: 30, carousel: 25, story: 20 },
          'TikTok': { photo: 10, video: 70, carousel: 5, story: 15 },
          'YouTube': { photo: 5, video: 85, carousel: 5, story: 5 },
          'Twitter': { photo: 40, video: 30, carousel: 10, story: 20 },
          'Facebook': { photo: 30, video: 40, carousel: 15, story: 15 },
          'LinkedIn': { photo: 40, video: 20, carousel: 30, story: 10 }
        };
        
        // Niche preferences
        const nichePreferences = {
          'Fashion/Beauty': { photo: 1.2, video: 0.9, carousel: 1.1, story: 0.8 },
          'Tech/Gaming': { photo: 0.8, video: 1.3, carousel: 0.9, story: 1.0 },
          'Food/Travel': { photo: 1.3, video: 1.1, carousel: 0.8, story: 0.8 },
          'Fitness/Health': { photo: 1.0, video: 1.2, carousel: 0.9, story: 0.9 },
          'Education/Business': { photo: 0.9, video: 0.8, carousel: 1.4, story: 0.9 },
          'Entertainment': { photo: 0.7, video: 1.4, carousel: 0.8, story: 1.1 }
        };
        
        const platformOptimal = optimalMix[inputs.platform] || optimalMix['Instagram'];
        const nicheMultiplier = nichePreferences[inputs.niche] || { photo: 1, video: 1, carousel: 1, story: 1 };
        
        // Calculate recommended mix
        const recommendedMix = {
          photo: Math.round(platformOptimal.photo * nicheMultiplier.photo),
          video: Math.round(platformOptimal.video * nicheMultiplier.video),
          carousel: Math.round(platformOptimal.carousel * nicheMultiplier.carousel),
          story: Math.round(platformOptimal.story * nicheMultiplier.story)
        };
        
        // Normalize to 100%
        const total = recommendedMix.photo + recommendedMix.video + recommendedMix.carousel + recommendedMix.story;
        const normalizedMix = {
          photo: Math.round((recommendedMix.photo / total) * 100),
          video: Math.round((recommendedMix.video / total) * 100),
          carousel: Math.round((recommendedMix.carousel / total) * 100),
          story: 100 - Math.round((recommendedMix.photo / total) * 100) - 
                 Math.round((recommendedMix.video / total) * 100) - 
                 Math.round((recommendedMix.carousel / total) * 100)
        };
        
        // Calculate current vs optimal score
        const currentScore = 
          (Math.min(photoPct / normalizedMix.photo, 1) * 25) +
          (Math.min(videoPct / normalizedMix.video, 1) * 25) +
          (Math.min(carouselPct / normalizedMix.carousel, 1) * 25) +
          (Math.min(storyPct / normalizedMix.story, 1) * 25);
        
        // Projected engagement
        const projectedEngagement = goalEngagement * (currentScore / 100);
        
        return {
          currentMix: `${photoPct}% Photo, ${videoPct}% Video, ${carouselPct}% Carousel, ${storyPct}% Story`,
          recommendedMix: `${normalizedMix.photo}% Photo, ${normalizedMix.video}% Video, ${normalizedMix.carousel}% Carousel, ${normalizedMix.story}% Story`,
          mixOptimizationScore: currentScore.toFixed(1) + '/100',
          currentEngagementProjection: projectedEngagement.toFixed(2) + '%',
          projectedEngagementIncrease: (projectedEngagement - (projectedEngagement * 0.7)).toFixed(2) + '%',
          primaryFocus: normalizedMix.video > normalizedMix.photo ? 'Video Content' : 'Photo/Carousel Content',
          secondaryFocus: normalizedMix.carousel > 20 ? 'Carousels' : 'Stories',
          contentTypeRecommendation: normalizedMix.video > 40 ? 'Create more short-form videos' : 
                                   normalizedMix.carousel > 30 ? 'Develop educational carousels' : 
                                   'Mix static and interactive content',
          weeklyProductionGoal: `${Math.round(normalizedMix.video / 10)} videos, ${Math.round(normalizedMix.carousel / 15)} carousels per week`
        };
      }
    },

    // ============ BRAND PARTNERSHIP CATEGORY ============
    {
      id: 'brand-deal-valuation',
      title: 'Brand Deal Valuation',
      category: 'brand',
      icon: <FaBalanceScale />,
      description: 'Comprehensive brand partnership valuation',
      inputs: [
        { id: 'followers', label: 'Total Followers', type: 'number', placeholder: 'Enter follower count' },
        { id: 'engagementRate', label: 'Engagement Rate (%)', type: 'number', placeholder: 'Enter engagement rate' },
        { id: 'brandSize', label: 'Brand Size', type: 'select', options: ['Startup', 'Small Business', 'Mid-Market', 'Enterprise', 'Luxury'] },
        { id: 'dealType', label: 'Deal Type', type: 'select', options: ['One-time Post', 'Package Deal', 'Ambassador (3 months)', 'Ambassador (6 months)', 'Ambassador (1 year)'] },
        { id: 'exclusivity', label: 'Exclusivity Required', type: 'select', options: ['None', 'Category', 'Platform', 'Full'] },
        { id: 'usageRights', label: 'Content Usage Rights', type: 'select', options: ['Platform Only', 'Social Media', 'Website/Ads', 'All Media', 'Buyout'] }
      ],
      calculate: (inputs) => {
        const followers = parseFloat(inputs.followers) || 0;
        const engagement = parseFloat(inputs.engagementRate) || 1;
        
        // Base value calculation
        const baseValue = followers * (engagement / 100) * 0.12;
        
        // Brand size multipliers
        const brandMultipliers = {
          'Startup': 0.8, 'Small Business': 1.0,
          'Mid-Market': 1.3, 'Enterprise': 1.6, 'Luxury': 2.0
        };
        
        // Deal type multipliers
        const dealMultipliers = {
          'One-time Post': 1.0, 'Package Deal': 2.2,
          'Ambassador (3 months)': 4.0, 'Ambassador (6 months)': 7.0,
          'Ambassador (1 year)': 12.0
        };
        
        // Exclusivity multipliers
        const exclusivityMultipliers = {
          'None': 1.0, 'Category': 1.4, 'Platform': 1.8, 'Full': 2.5
        };
        
        // Usage rights multipliers
        const rightsMultipliers = {
          'Platform Only': 1.0, 'Social Media': 1.2,
          'Website/Ads': 1.5, 'All Media': 1.8, 'Buyout': 2.5
        };
        
        const brandMultiplier = brandMultipliers[inputs.brandSize] || 1;
        const dealMultiplier = dealMultipliers[inputs.dealType] || 1;
        const exclusivityMultiplier = exclusivityMultipliers[inputs.exclusivity] || 1;
        const rightsMultiplier = rightsMultipliers[inputs.usageRights] || 1;
        
        const totalValue = baseValue * brandMultiplier * dealMultiplier * exclusivityMultiplier * rightsMultiplier;
        
        // Calculate monthly equivalent
        let monthlyValue = totalValue;
        if (inputs.dealType.includes('Ambassador')) {
          const months = inputs.dealType === 'Ambassador (3 months)' ? 3 :
                        inputs.dealType === 'Ambassador (6 months)' ? 6 : 12;
          monthlyValue = totalValue / months;
        }
        
        // Value benchmarks
        const industryAverage = followers * 0.01;
        const topTier = followers * 0.025;
        
        return {
          estimatedDealValue: '$' + Math.round(totalValue).toLocaleString(),
          monthlyValue: '$' + Math.round(monthlyValue).toLocaleString(),
          perPostValue: '$' + Math.round(baseValue * brandMultiplier).toLocaleString(),
          brandMultiplier: brandMultiplier.toFixed(1) + 'x',
          dealMultiplier: dealMultiplier.toFixed(1) + 'x',
          valueVsIndustryAvg: ((totalValue / industryAverage) * 100).toFixed(1) + '%',
          valueVsTopTier: ((totalValue / topTier) * 100).toFixed(1) + '%',
          negotiationRange: `$${Math.round(totalValue * 0.85).toLocaleString()} - $${Math.round(totalValue * 1.15).toLocaleString()}`,
          recommendedMinimum: '$' + Math.round(totalValue * 0.9).toLocaleString(),
          dealRating: totalValue > topTier ? 'Premium' : totalValue > industryAverage ? 'Above Average' : 'Standard',
          notes: exclusivityMultiplier > 1.5 ? 'Includes exclusivity premium' : 'Standard non-exclusive rate'
        };
      }
    },
    {
      id: 'contract-terms',
      title: 'Contract Terms Optimizer',
      category: 'brand',
      icon: <FaFileContract />,
      description: 'Optimize brand deal contract terms',
      inputs: [
        { id: 'contractValue', label: 'Contract Value ($)', type: 'number', placeholder: 'Enter total value' },
        { id: 'paymentStructure', label: 'Payment Structure', type: 'select', options: ['100% Upfront', '50/50 Split', '25/75 Split', 'Monthly', 'Performance-based'] },
        { id: 'deliverables', label: 'Number of Deliverables', type: 'number', placeholder: 'Enter number of posts' },
        { id: 'revisionRounds', label: 'Revision Rounds', type: 'select', options: ['1 round', '2 rounds', '3 rounds', 'Unlimited'] },
        { id: 'rightsPeriod', label: 'Rights Period', type: 'select', options: ['30 days', '90 days', '6 months', '1 year', 'Perpetual'] },
        { id: 'killFee', label: 'Kill Fee', type: 'select', options: ['None', '25%', '50%', '75%', '100%'] }
      ],
      calculate: (inputs) => {
        const contractValue = parseFloat(inputs.contractValue) || 1000;
        const deliverables = parseFloat(inputs.deliverables) || 1;
        
        // Payment structure calculations
        let paymentSchedule = [];
        if (inputs.paymentStructure === '100% Upfront') {
          paymentSchedule = ['100% upon signing: $' + Math.round(contractValue).toLocaleString()];
        } else if (inputs.paymentStructure === '50/50 Split') {
          paymentSchedule = [
            '50% upon signing: $' + Math.round(contractValue * 0.5).toLocaleString(),
            '50% upon approval: $' + Math.round(contractValue * 0.5).toLocaleString()
          ];
        } else if (inputs.paymentStructure === '25/75 Split') {
          paymentSchedule = [
            '25% upon signing: $' + Math.round(contractValue * 0.25).toLocaleString(),
            '75% upon approval: $' + Math.round(contractValue * 0.75).toLocaleString()
          ];
        } else if (inputs.paymentStructure === 'Monthly') {
          const monthlyAmount = contractValue / 3;
          paymentSchedule = [
            'Month 1: $' + Math.round(monthlyAmount).toLocaleString(),
            'Month 2: $' + Math.round(monthlyAmount).toLocaleString(),
            'Month 3: $' + Math.round(monthlyAmount).toLocaleString()
          ];
        }
        
        // Revision costs
        const revisionScores = {
          '1 round': 100, '2 rounds': 80,
          '3 rounds': 60, 'Unlimited': 40
        };
        
        // Rights period valuation
        const rightsMultipliers = {
          '30 days': 0.3, '90 days': 0.5,
          '6 months': 0.7, '1 year': 1.0, 'Perpetual': 1.5
        };
        
        // Kill fee protection
        const killFeePercent = inputs.killFee === 'None' ? 0 :
                              inputs.killFee === '25%' ? 0.25 :
                              inputs.killFee === '50%' ? 0.5 :
                              inputs.killFee === '75%' ? 0.75 : 1.0;
        
        const killFeeAmount = contractValue * killFeePercent;
        
        // Value per deliverable
        const valuePerDeliverable = contractValue / deliverables;
        
        // Contract score (0-100)
        let contractScore = 50;
        if (inputs.paymentStructure === '100% Upfront') contractScore += 30;
        else if (inputs.paymentStructure === '50/50 Split') contractScore += 15;
        
        if (killFeePercent >= 0.5) contractScore += 20;
        else if (killFeePercent >= 0.25) contractScore += 10;
        
        if (inputs.revisionRounds === 'Unlimited') contractScore -= 20;
        else if (inputs.revisionRounds === '3 rounds') contractScore -= 10;
        
        if (inputs.rightsPeriod === 'Perpetual' && rightsMultipliers.Perpetual > 1) {
          contractScore += 25; // Should charge more for perpetual rights
        }
        
        return {
          valuePerDeliverable: '$' + Math.round(valuePerDeliverable).toLocaleString(),
          paymentSchedule: paymentSchedule.join(' → '),
          bestPaymentStructure: contractValue > 5000 ? '50/50 Split' : '100% Upfront',
          killFeeProtection: '$' + Math.round(killFeeAmount).toLocaleString(),
          killFeePercentage: killFeePercent * 100 + '%',
          rightsPeriodValue: '$' + Math.round(contractValue * rightsMultipliers[inputs.rightsPeriod]).toLocaleString(),
          revisionPolicy: inputs.revisionRounds,
          contractScore: Math.min(100, Math.max(0, contractScore)).toFixed(1) + '/100',
          contractRating: contractScore >= 80 ? 'Excellent' : contractScore >= 60 ? 'Good' : contractScore >= 40 ? 'Average' : 'Poor',
          recommendedAdditions: killFeePercent < 0.5 ? 'Add 50% kill fee protection' : 'Contract terms are protective',
          negotiationPoints: rightsMultipliers[inputs.rightsPeriod] > 1 ? 'Value rights appropriately' : 'Consider longer rights period for premium'
        };
      }
    },
    {
      id: 'brand-fit',
      title: 'Brand Partnership Fit Score',
      category: 'brand',
      icon: <FaHandshake />,
      description: 'Evaluate brand partnership alignment',
      inputs: [
        { id: 'yourNiche', label: 'Your Primary Niche', type: 'select', options: ['Fashion', 'Beauty', 'Tech', 'Food', 'Travel', 'Fitness', 'Lifestyle', 'Gaming', 'Finance', 'Education'] },
        { id: 'brandNiche', label: 'Brand Industry', type: 'select', options: ['Fashion', 'Beauty', 'Tech', 'Food', 'Travel', 'Fitness', 'Lifestyle', 'Gaming', 'Finance', 'Education'] },
        { id: 'audienceOverlap', label: 'Audience Overlap', type: 'select', options: ['<20%', '20-40%', '40-60%', '60-80%', '80%+'] },
        { id: 'valueAlignment', label: 'Value Alignment', type: 'select', options: ['Poor', 'Fair', 'Good', 'Excellent', 'Perfect'] },
        { id: 'aestheticMatch', label: 'Aesthetic Match', type: 'select', options: ['Poor', 'Fair', 'Good', 'Excellent', 'Perfect'] },
        { id: 'pastCollaborations', label: 'Past Collaborations', type: 'select', options: ['None', '1-2', '3-5', '6-10', '10+'] }
      ],
      calculate: (inputs) => {
        // Niche compatibility matrix
        const nicheCompatibility = {
          'Fashion': { 'Fashion': 100, 'Beauty': 80, 'Lifestyle': 70, 'Travel': 50, 'Fitness': 40, 'Tech': 20, 'Food': 30, 'Gaming': 10, 'Finance': 10, 'Education': 20 },
          'Beauty': { 'Beauty': 100, 'Fashion': 80, 'Lifestyle': 70, 'Travel': 40, 'Fitness': 50, 'Tech': 20, 'Food': 30, 'Gaming': 10, 'Finance': 10, 'Education': 20 },
          'Tech': { 'Tech': 100, 'Gaming': 80, 'Finance': 70, 'Education': 60, 'Lifestyle': 40, 'Fashion': 20, 'Beauty': 20, 'Travel': 30, 'Fitness': 30, 'Food': 20 },
          'Food': { 'Food': 100, 'Travel': 80, 'Lifestyle': 70, 'Fitness': 50, 'Beauty': 30, 'Fashion': 30, 'Tech': 20, 'Gaming': 20, 'Finance': 20, 'Education': 30 },
          'Travel': { 'Travel': 100, 'Food': 80, 'Lifestyle': 80, 'Fashion': 50, 'Beauty': 40, 'Fitness': 50, 'Tech': 30, 'Gaming': 20, 'Finance': 20, 'Education': 40 },
          'Fitness': { 'Fitness': 100, 'Lifestyle': 80, 'Food': 70, 'Travel': 60, 'Beauty': 40, 'Fashion': 30, 'Tech': 30, 'Gaming': 20, 'Finance': 20, 'Education': 30 },
          'Lifestyle': { 'Lifestyle': 100, 'Fashion': 80, 'Beauty': 70, 'Travel': 70, 'Food': 60, 'Fitness': 60, 'Tech': 40, 'Gaming': 30, 'Finance': 30, 'Education': 40 },
          'Gaming': { 'Gaming': 100, 'Tech': 80, 'Lifestyle': 40, 'Entertainment': 70, 'Food': 30, 'Fitness': 30, 'Fashion': 20, 'Beauty': 20, 'Finance': 30, 'Education': 40 },
          'Finance': { 'Finance': 100, 'Tech': 70, 'Education': 80, 'Lifestyle': 40, 'Business': 70, 'Fashion': 10, 'Beauty': 10, 'Travel': 20, 'Fitness': 20, 'Food': 20 },
          'Education': { 'Education': 100, 'Tech': 70, 'Finance': 70, 'Lifestyle': 50, 'Travel': 40, 'Food': 30, 'Fitness': 30, 'Fashion': 20, 'Beauty': 20, 'Gaming': 30 }
        };
        
        const nicheScore = nicheCompatibility[inputs.yourNiche]?.[inputs.brandNiche] || 50;
        
        // Audience overlap scores
        const overlapScores = {
          '<20%': 30, '20-40%': 50,
          '40-60%': 70, '60-80%': 85, '80%+': 95
        };
        
        // Value alignment scores
        const alignmentScores = {
          'Poor': 20, 'Fair': 40, 'Good': 60, 'Excellent': 80, 'Perfect': 100
        };
        
        // Aesthetic match scores
        const aestheticScores = {
          'Poor': 20, 'Fair': 40, 'Good': 60, 'Excellent': 80, 'Perfect': 100
        };
        
        // Past collaboration scores
        const collaborationScores = {
          'None': 30, '1-2': 50, '3-5': 70, '6-10': 85, '10+': 95
        };
        
        const overlapScore = overlapScores[inputs.audienceOverlap] || 50;
        const alignmentScore = alignmentScores[inputs.valueAlignment] || 40;
        const aestheticScore = aestheticScores[inputs.aestheticMatch] || 40;
        const collaborationScore = collaborationScores[inputs.pastCollaborations] || 30;
        
        // Weighted total score
        const totalScore = (
          nicheScore * 0.25 +
          overlapScore * 0.25 +
          alignmentScore * 0.2 +
          aestheticScore * 0.2 +
          collaborationScore * 0.1
        );
        
        // Fit classification
        let fitCategory = 'Poor Fit';
        let recommendation = 'Not recommended';
        if (totalScore >= 80) {
          fitCategory = 'Excellent Fit';
          recommendation = 'Strongly pursue partnership';
        } else if (totalScore >= 65) {
          fitCategory = 'Good Fit';
          recommendation = 'Recommended for collaboration';
        } else if (totalScore >= 50) {
          fitCategory = 'Moderate Fit';
          recommendation = 'Consider with specific guidelines';
        } else if (totalScore >= 35) {
          fitCategory = 'Fair Fit';
          recommendation = 'Proceed with caution';
        } else {
          fitCategory = 'Poor Fit';
          recommendation = 'Decline or reassess';
        }
        
        return {
          nicheCompatibilityScore: nicheScore + '/100',
          audienceOverlapScore: overlapScore + '/100',
          valueAlignmentScore: alignmentScore + '/100',
          aestheticMatchScore: aestheticScore + '/100',
          partnershipHistoryScore: collaborationScore + '/100',
          overallFitScore: totalScore.toFixed(1) + '/100',
          fitCategory: fitCategory,
          recommendation: recommendation,
          priorityLevel: totalScore >= 70 ? 'High Priority' : totalScore >= 50 ? 'Medium Priority' : 'Low Priority',
          strengths: nicheScore > 70 ? 'Strong niche alignment' : alignmentScore > 70 ? 'Good value alignment' : 'Average fit overall',
          concerns: overlapScore < 50 ? 'Limited audience overlap' : aestheticScore < 50 ? 'Aesthetic mismatch' : 'No major concerns'
        };
      }
    },

    // ============ ADDITIONAL CALCULATORS ============
    {
      id: 'story-performance',
      title: 'Stories & Reels Performance',
      category: 'content',
      icon: <FaRegEye />,
      description: 'Analyze and optimize Stories and Reels performance',
      inputs: [
        { id: 'storyViews', label: 'Average Story Views', type: 'number', placeholder: 'Enter avg views' },
        { id: 'storyCompletions', label: 'Average Completion Rate (%)', type: 'number', placeholder: 'Enter completion %' },
        { id: 'storyTaps', label: 'Average Taps Forward/Back', type: 'number', placeholder: 'Enter tap count' },
        { id: 'storyReplies', label: 'Average Replies', type: 'number', placeholder: 'Enter replies' },
        { id: 'storyType', label: 'Story Type', type: 'select', options: ['Photo', 'Video', 'Poll', 'Quiz', 'Question', 'Countdown', 'Link'] }
      ],
      calculate: (inputs) => {
        const views = parseFloat(inputs.storyViews) || 0;
        const completionRate = parseFloat(inputs.storyCompletions) || 50;
        const taps = parseFloat(inputs.storyTaps) || 0;
        const replies = parseFloat(inputs.storyReplies) || 0;
        
        // Interaction rate
        const interactionRate = ((taps + replies) / views) * 100;
        
        // Drop-off rate
        const dropOffRate = 100 - completionRate;
        
        // Quality score
        let qualityScore = 50;
        if (completionRate > 80) qualityScore += 30;
        else if (completionRate > 60) qualityScore += 15;
        else if (completionRate < 40) qualityScore -= 15;
        
        if (interactionRate > 10) qualityScore += 20;
        else if (interactionRate > 5) qualityScore += 10;
        else if (interactionRate < 2) qualityScore -= 10;
        
        return {
          completionRate: completionRate.toFixed(1) + '%',
          dropOffRate: dropOffRate.toFixed(1) + '%',
          interactionRate: interactionRate.toFixed(2) + '%',
          tapThroughRate: (taps / views * 100).toFixed(2) + '%',
          replyRate: (replies / views * 100).toFixed(2) + '%',
          qualityScore: Math.min(100, Math.max(0, qualityScore)).toFixed(1) + '/100',
          performanceRating: qualityScore >= 80 ? 'Excellent' : qualityScore >= 60 ? 'Good' : qualityScore >= 40 ? 'Average' : 'Poor',
          recommendedLength: completionRate < 60 ? 'Consider shorter stories (under 15 seconds)' : 'Current length is optimal',
          engagementTip: interactionRate < 5 ? 'Add interactive stickers to boost engagement' : 'Good interaction rate, maintain strategy'
        };
      }
    },
    {
      id: 'competitive-analysis',
      title: 'Competitive Analysis',
      category: 'performance',
      icon: <FaBalanceScale />,
      description: 'Compare your performance against competitors',
      inputs: [
        { id: 'yourFollowers', label: 'Your Followers', type: 'number', placeholder: 'Enter your followers' },
        { id: 'yourEngagement', label: 'Your Engagement Rate (%)', type: 'number', placeholder: 'Enter your engagement' },
        { id: 'competitor1Followers', label: 'Competitor 1 Followers', type: 'number', placeholder: 'Competitor followers' },
        { id: 'competitor1Engagement', label: 'Competitor 1 Engagement (%)', type: 'number', placeholder: 'Competitor engagement' },
        { id: 'competitor2Followers', label: 'Competitor 2 Followers', type: 'number', placeholder: 'Competitor 2 (optional)' },
        { id: 'competitor2Engagement', label: 'Competitor 2 Engagement (%)', type: 'number', placeholder: 'Competitor 2 engagement' }
      ],
      calculate: (inputs) => {
        const yourFollowers = parseFloat(inputs.yourFollowers) || 0;
        const yourEngagement = parseFloat(inputs.yourEngagement) || 0;
        const comp1Followers = parseFloat(inputs.competitor1Followers) || 0;
        const comp1Engagement = parseFloat(inputs.competitor1Engagement) || 0;
        const comp2Followers = parseFloat(inputs.competitor2Followers) || 0;
        const comp2Engagement = parseFloat(inputs.competitor2Engagement) || 0;
        
        // Calculate averages
        const avgFollowers = comp1Followers + comp2Followers > 0 ? 
          (comp1Followers + comp2Followers) / (comp2Followers > 0 ? 2 : 1) : yourFollowers;
        const avgEngagement = comp1Engagement + comp2Engagement > 0 ? 
          (comp1Engagement + comp2Engagement) / (comp2Engagement > 0 ? 2 : 1) : yourEngagement;
        
        // Comparison metrics
        const followerRatio = avgFollowers > 0 ? (yourFollowers / avgFollowers) * 100 : 100;
        const engagementRatio = avgEngagement > 0 ? (yourEngagement / avgEngagement) * 100 : 100;
        
        // Competitive position
        let position = 'Follower';
        if (yourFollowers > avgFollowers * 1.5 && yourEngagement > avgEngagement * 1.2) position = 'Market Leader';
        else if (yourFollowers > avgFollowers && yourEngagement > avgEngagement) position = 'Strong Competitor';
        else if (yourFollowers > avgFollowers * 0.8 || yourEngagement > avgEngagement * 0.9) position = 'Emerging Competitor';
        
        return {
          yourFollowers: yourFollowers.toLocaleString(),
          avgCompetitorFollowers: Math.round(avgFollowers).toLocaleString(),
          followerComparison: followerRatio.toFixed(1) + '% of average',
          yourEngagementRate: yourEngagement.toFixed(2) + '%',
          avgCompetitorEngagement: avgEngagement.toFixed(2) + '%',
          engagementComparison: engagementRatio.toFixed(1) + '% of average',
          competitivePosition: position,
          advantage: yourEngagement > avgEngagement ? 'Engagement' : yourFollowers > avgFollowers ? 'Reach' : 'Neither',
          opportunity: yourEngagement < avgEngagement ? 'Improve engagement rate' : 'Grow follower count',
          marketShare: (followerRatio * 0.7 + engagementRatio * 0.3).toFixed(1) + '%'
        };
      }
    },
    {
      id: 'campaign-risk',
      title: 'Campaign Risk Assessment',
      category: 'campaign',
      icon: <FaRegFlag />,
      description: 'Assess risks in influencer campaigns',
      inputs: [
        { id: 'campaignValue', label: 'Campaign Value ($)', type: 'number', placeholder: 'Enter campaign value' },
        { id: 'influencerReliability', label: 'Influencer Reliability', type: 'select', options: ['Untested', 'New', 'Proven', 'Highly Reliable', 'Long-term Partner'] },
        { id: 'contentApproval', label: 'Content Approval Process', type: 'select', options: ['No approval', 'Basic review', 'Strict approval', 'Legal review required'] },
        { id: 'timelineRigor', label: 'Timeline Rigor', type: 'select', options: ['Flexible', 'Moderate', 'Strict', 'Critical deadline'] },
        { id: 'contractClarity', label: 'Contract Clarity', type: 'select', options: ['Verbal agreement', 'Basic contract', 'Detailed contract', 'Legal reviewed'] }
      ],
      calculate: (inputs) => {
        const campaignValue = parseFloat(inputs.campaignValue) || 0;
        
        // Risk factor scores (higher = more risk)
        const reliabilityScores = {
          'Untested': 80, 'New': 60, 'Proven': 30, 'Highly Reliable': 15, 'Long-term Partner': 10
        };
        
        const approvalScores = {
          'No approval': 70, 'Basic review': 40, 'Strict approval': 20, 'Legal review required': 30
        };
        
        const timelineScores = {
          'Flexible': 20, 'Moderate': 40, 'Strict': 60, 'Critical deadline': 80
        };
        
        const contractScores = {
          'Verbal agreement': 90, 'Basic contract': 50, 'Detailed contract': 25, 'Legal reviewed': 15
        };
        
        const reliabilityRisk = reliabilityScores[inputs.influencerReliability] || 50;
        const approvalRisk = approvalScores[inputs.contentApproval] || 50;
        const timelineRisk = timelineScores[inputs.timelineRigor] || 50;
        const contractRisk = contractScores[inputs.contractClarity] || 50;
        
        // Calculate overall risk
        const overallRisk = (reliabilityRisk * 0.35 + approvalRisk * 0.2 + timelineRisk * 0.25 + contractRisk * 0.2);
        
        // Financial risk
        const financialRisk = campaignValue * (overallRisk / 100);
        
        // Risk rating
        let riskRating = 'Low';
        let recommendation = 'Proceed as planned';
        if (overallRisk >= 70) {
          riskRating = 'Critical';
          recommendation = 'Reconsider or implement strict controls';
        } else if (overallRisk >= 50) {
          riskRating = 'High';
          recommendation = 'Implement risk mitigation strategies';
        } else if (overallRisk >= 30) {
          riskRating = 'Moderate';
          recommendation = 'Monitor closely';
        }
        
        return {
          overallRiskScore: overallRisk.toFixed(1) + '/100',
          riskRating: riskRating,
          financialRiskExposure: '$' + Math.round(financialRisk).toLocaleString(),
          reliabilityRisk: reliabilityRisk + '/100',
          approvalRisk: approvalRisk + '/100',
          timelineRisk: timelineRisk + '/100',
          contractRisk: contractRisk + '/100',
          recommendation: recommendation,
          mitigationActions: reliabilityRisk > 50 ? 'Request portfolio and references' : '',
          criticalFactors: timelineRisk > 60 ? 'Timeline is high risk' : contractRisk > 60 ? 'Contract needs improvement' : 'No critical factors'
        };
      }
    }
  ];

  const [inputValues, setInputValues] = useState({});

  // Filter calculators by category
  const filteredCalculators = activeCategory === 'all' 
    ? calculators 
    : calculators.filter(calc => calc.category === activeCategory);

  const handleInputChange = (calculatorId, inputId, value) => {
    setInputValues(prev => ({
      ...prev,
      [calculatorId]: {
        ...prev[calculatorId],
        [inputId]: value
      }
    }));
  };

  const calculateResults = (calculator) => {
    const inputs = inputValues[calculator.id] || {};
    const results = calculator.calculate(inputs);
    setResults(prev => ({
      ...prev,
      [calculator.id]: results
    }));
  };

  const resetCalculator = (calculatorId) => {
    setInputValues(prev => ({
      ...prev,
      [calculatorId]: {}
    }));
    setResults(prev => ({
      ...prev,
      [calculatorId]: {}
    }));
  };

  const openCalculator = (calculatorId) => {
    setActiveCalculator(calculatorId);
  };

  const closeCalculator = () => {
    setActiveCalculator(null);
  };

  return (
    <div className="ai-calculator-container">
      <div className="ai-calculator-header">
        <h1>Influencer AI Calculator Suite</h1>
        <p>25+ advanced calculators for influencer marketing and brand campaign management</p>
        <div className="calculator-stats">
          <span className="stat-badge">
            <FaChartLine /> 25+ Calculators
          </span>
          <span className="stat-badge">
            <FaDollarSign /> Real-time Estimates
          </span>
          <span className="stat-badge">
            <FaHandshake /> Brand Ready
          </span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="calculator-categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-button ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Calculators Grid */}
      <div className="calculators-grid">
        {filteredCalculators.map(calculator => (
          <div 
            key={calculator.id} 
            className="calculator-card"
            onClick={() => openCalculator(calculator.id)}
          >
            <div className="calculator-card-header">
              <span className="calculator-card-icon">{calculator.icon}</span>
              <h3>{calculator.title}</h3>
            </div>
            <p className="calculator-card-description">{calculator.description}</p>
            <span className="calculator-category-tag">{calculator.category}</span>
            <button className="calculator-card-button">Open Calculator</button>
          </div>
        ))}
      </div>

      {/* Modal for each calculator */}
      {calculators.map(calculator => (
        <div 
          key={calculator.id} 
          className={`calculator-modal ${activeCalculator === calculator.id ? 'calculator-modal-active' : ''}`}
        >
          <div className="calculator-modal-content">
            <div className="calculator-modal-header">
              <div className="calculator-modal-title">
                <span className="calculator-modal-icon">{calculator.icon}</span>
                <h2>{calculator.title}</h2>
              </div>
              <button className="calculator-modal-close" onClick={closeCalculator}>
                &times;
              </button>
            </div>

            <div className="calculator-modal-body">
              <p className="calculator-modal-description">{calculator.description}</p>
              
              <div className="calculator-inputs-container">
                {calculator.inputs.map(input => (
                  <div key={input.id} className="calculator-input-group">
                    <label htmlFor={`${calculator.id}-${input.id}`}>{input.label}</label>
                    {input.type === 'select' ? (
                      <select
                        id={`${calculator.id}-${input.id}`}
                        value={inputValues[calculator.id]?.[input.id] || ''}
                        onChange={(e) => handleInputChange(calculator.id, input.id, e.target.value)}
                      >
                        <option value="">Select {input.label}</option>
                        {input.options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : input.type === 'date' ? (
                      <input
                        id={`${calculator.id}-${input.id}`}
                        type="date"
                        placeholder={input.placeholder}
                        value={inputValues[calculator.id]?.[input.id] || ''}
                        onChange={(e) => handleInputChange(calculator.id, input.id, e.target.value)}
                      />
                    ) : (
                      <input
                        id={`${calculator.id}-${input.id}`}
                        type={input.type}
                        placeholder={input.placeholder}
                        value={inputValues[calculator.id]?.[input.id] || ''}
                        onChange={(e) => handleInputChange(calculator.id, input.id, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="calculator-modal-actions">
                <button 
                  className="calculator-calculate-btn"
                  onClick={() => calculateResults(calculator)}
                >
                  <FaChartLine /> Calculate
                </button>
                <button 
                  className="calculator-reset-btn"
                  onClick={() => resetCalculator(calculator.id)}
                >
                  Reset
                </button>
              </div>

              {results[calculator.id] && Object.keys(results[calculator.id]).length > 0 && (
                <div className="calculator-results-container">
                  <h4>
                    <FaDollarSign /> Results:
                  </h4>
                  {Object.entries(results[calculator.id]).map(([key, value]) => (
                    <div key={key} className="calculator-result-item">
                      <span className="calculator-result-label">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                      </span>
                      <span className="calculator-result-value">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AICalculator;