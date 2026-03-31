// import React, { useState } from "react";
// import "../style/HelpCenter.css";
// import HomeTopBar from "../pages/HomePage/HomeTopBar";

// const helpTopics = [
//   {
//     category: "Getting Started",
//     icon: "🚀",
//     articles: [
//       { 
//         title: "How to Create an Account", 
//         link: "#",
//         description: "Step-by-step guide to setting up your InfluenceAI account",
//         popular: true
//       },
//       { 
//         title: "Navigating the Dashboard", 
//         link: "#",
//         description: "Learn how to navigate and customize your dashboard",
//         popular: false
//       },
//       { 
//         title: "Setting Up Your First Campaign", 
//         link: "#",
//         description: "Complete guide to launching your first influencer campaign",
//         popular: true
//       },
//       { 
//         title: "Connecting Your Social Accounts", 
//         link: "#",
//         description: "How to integrate your social media platforms with InfluenceAI",
//         popular: false
//       },
//     ],
//   },
//   {
//     category: "Influencer Management",
//     icon: "👥",
//     articles: [
//       { 
//         title: "Finding the Right Influencers", 
//         link: "#",
//         description: "Using our AI tools to identify perfect influencer matches",
//         popular: true
//       },
//       { 
//         title: "Contacting Influencers Efficiently", 
//         link: "#",
//         description: "Best practices for outreach and communication",
//         popular: false
//       },
//       { 
//         title: "Tracking Influencer Performance", 
//         link: "#",
//         description: "Monitor and analyze influencer campaign results",
//         popular: false
//       },
//       { 
//         title: "Managing Long-term Relationships", 
//         link: "#",
//         description: "Strategies for building lasting partnerships with influencers",
//         popular: false
//       },
//     ],
//   },
//   {
//     category: "AI Tools & Automation",
//     icon: "🤖",
//     articles: [
//       { 
//         title: "Using AI Insights Effectively", 
//         link: "#",
//         description: "How to interpret and apply AI-generated recommendations",
//         popular: true
//       },
//       { 
//         title: "Trend Predictor Guide", 
//         link: "#",
//         description: "Leverage predictive analytics for campaign planning",
//         popular: false
//       },
//       { 
//         title: "Engagement Calculator Tutorial", 
//         link: "#",
//         description: "Estimate and optimize engagement rates for your campaigns",
//         popular: false
//       },
//       { 
//         title: "Automated Outreach Settings", 
//         link: "#",
//         description: "Configure and optimize automated influencer communications",
//         popular: true
//       },
//     ],
//   },
//   {
//     category: "Billing & Subscription",
//     icon: "💳",
//     articles: [
//       { 
//         title: "Subscription Plans Overview", 
//         link: "#",
//         description: "Compare features across different pricing tiers",
//         popular: false
//       },
//       { 
//         title: "Payment Methods", 
//         link: "#",
//         description: "Accepted payment options and processing information",
//         popular: false
//       },
//       { 
//         title: "Updating Billing Information", 
//         link: "#",
//         description: "How to change your payment details and billing address",
//         popular: false
//       },
//       { 
//         title: "Understanding Your Invoice", 
//         link: "#",
//         description: "Breakdown of charges and billing cycles",
//         popular: false
//       },
//     ],
//   },
//   {
//     category: "Troubleshooting",
//     icon: "🔧",
//     articles: [
//       { 
//         title: "Common Login Issues", 
//         link: "#",
//         description: "Solutions for frequent authentication problems",
//         popular: true
//       },
//       { 
//         title: "How to Reset Your Password", 
//         link: "#",
//         description: "Step-by-step password recovery process",
//         popular: false
//       },
//       { 
//         title: "Reporting a Bug", 
//         link: "#",
//         description: "How to report technical issues to our team",
//         popular: false
//       },
//       { 
//         title: "Browser Compatibility", 
//         link: "#",
//         description: "Supported browsers and optimal configuration",
//         popular: false
//       },
//     ],
//   },
//   {
//     category: "Advanced Features",
//     icon: "⭐",
//     articles: [
//       { 
//         title: "API Integration Guide", 
//         link: "#",
//         description: "Connect InfluenceAI with your existing tools and systems",
//         popular: false
//       },
//       { 
//         title: "Custom Reporting", 
//         link: "#",
//         description: "Create tailored analytics reports for your campaigns",
//         popular: true
//       },
//       { 
//         title: "Team Collaboration Tools", 
//         link: "#",
//         description: "Manage team permissions and collaborative workflows",
//         popular: false
//       },
//       { 
//         title: "White Label Options", 
//         link: "#",
//         description: "Enterprise white labeling and customization",
//         popular: false
//       },
//     ],
//   },
// ];

// const popularArticles = helpTopics
//   .flatMap(topic => topic.articles.filter(article => article.popular))
//   .slice(0, 5);

// const contactOptions = [
//   {
//     title: "Email Support",
//     description: "Get help from our support team within 24 hours",
//     icon: "✉️",
//     action: "Send Email"
//   },
//   {
//     title: "Live Chat",
//     description: "Instant help from our support agents",
//     icon: "💬",
//     action: "Start Chat"
//   },
//   {
//     title: "Help Community",
//     description: "Connect with other InfluenceAI users",
//     icon: "👥",
//     action: "Join Community"
//   },
//   {
//     title: "Schedule a Call",
//     description: "Book a one-on-one session with our experts",
//     icon: "📅",
//     action: "Schedule Now"
//   }
// ];

// export default function HelpCenter() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeCategory, setActiveCategory] = useState("All");

//   const filteredTopics = helpTopics.filter(topic => 
//     activeCategory === "All" || topic.category === activeCategory
//   );

//   const searchResults = helpTopics.flatMap(topic => 
//     topic.articles.filter(article => 
//       article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       article.description.toLowerCase().includes(searchQuery.toLowerCase())
//     )
//   );

//   const categories = ["All", ...helpTopics.map(topic => topic.category)];

//   return (
//     <><HomeTopBar />
//     <div className="helpcenter-container">
//       {/* Header Section */}
//       <header className="helpcenter-header">
//         <div className="header-content">
//           <h1>InfluenceAI Help Center</h1>
//           <p>Find answers to common questions, guides, and tutorials to maximize your AI marketing platform experience</p>
          
//           <div className="search-container">
//             <div className="search-box">
//               <span className="search-icon">🔍</span>
//               <input
//                 type="text"
//                 placeholder="Search for help articles, tutorials, or guides..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="search-input"
//               />
//               {searchQuery && (
//                 <button 
//                   className="clear-search"
//                   onClick={() => setSearchQuery("")}
//                 >
//                   ✕
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="helpcenter-content">
//         {/* Show search results if query exists */}
//         {searchQuery ? (
//           <div className="search-results">
//             <h2>Search Results for "{searchQuery}"</h2>
//             <p className="results-count">{searchResults.length} articles found</p>
            
//             {searchResults.length > 0 ? (
//               <div className="results-grid">
//                 {searchResults.map((article, index) => (
//                   <div key={index} className="result-card">
//                     <h3>{article.title}</h3>
//                     <p>{article.description}</p>
//                     <a href={article.link} className="read-article">
//                       Read Article →
//                     </a>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="no-results">
//                 <h3>No results found</h3>
//                 <p>Try different keywords or browse our categories below</p>
//               </div>
//             )}
//           </div>
//         ) : (
//           <>
//             {/* Popular Articles */}
//             <section className="popular-section">
//               <h2>Popular Help Articles</h2>
//               <div className="popular-articles-grid">
//                 {popularArticles.map((article, index) => (
//                   <div key={index} className="popular-article-card">
//                     <div className="popular-content">
//                       <h3>{article.title}</h3>
//                       <p>{article.description}</p>
//                       <a href={article.link} className="article-link">
//                         Read Guide →
//                       </a>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </section>

//             {/* Contact Options */}
//             <section className="contact-section">
//               <h2>Need More Help?</h2>
//               <p>Get in touch with our support team through these channels</p>
//               <div className="contact-options">
//                 {contactOptions.map((option, index) => (
//                   <div key={index} className="contact-card">
//                     <div className="contact-icon">{option.icon}</div>
//                     <h3>{option.title}</h3>
//                     <p>{option.description}</p>
//                     <button className="contact-button">{option.action}</button>
//                   </div>
//                 ))}
//               </div>
//             </section>

//             {/* Category Filter */}
//             <div className="category-filter">
//               <h2>Browse by Category</h2>
//               <div className="filter-buttons">
//                 {categories.map(category => (
//                   <button
//                     key={category}
//                     className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
//                     onClick={() => setActiveCategory(category)}
//                   >
//                     {category}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </>
//         )}

//         {/* Help Topics Grid */}
//         <section className="help-topics">
//           {!searchQuery && (
//             <h2>{activeCategory === "All" ? "All Help Topics" : activeCategory}</h2>
//           )}
          
//           <div className="helpcenter-grid">
//             {filteredTopics.map((topic, idx) => (
//               <div key={idx} className="help-topic-card">
//                 <div className="topic-header">
//                   <span className="topic-icon">{topic.icon}</span>
//                   <h3 className="topic-title">{topic.category}</h3>
//                 </div>
//                 <ul className="topic-articles">
//                   {topic.articles.map((article, aIdx) => (
//                     <li key={aIdx} className="article-item">
//                       <a href={article.link} className="article-link">
//                         <span className="article-title">{article.title}</span>
//                         <span className="article-description">{article.description}</span>
//                       </a>
//                     </li>
//                   ))}
//                 </ul>
//                 <a href="/" className="view-all">View all {topic.category} articles →</a>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* FAQ Section */}
//         {!searchQuery && (
//           <section className="faq-section">
//             <h2>Frequently Asked Questions</h2>
//             <div className="faq-grid">
//               <div className="faq-item">
//                 <h3>How do I reset my password?</h3>
//                 <p>Go to the login page and click "Forgot Password." Enter your email address, and we'll send you a link to reset your password.</p>
//               </div>
//               <div className="faq-item">
//                 <h3>Can I change my subscription plan?</h3>
//                 <p>Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes take effect immediately.</p>
//               </div>
//               <div className="faq-item">
//                 <h3>How does the AI matching work?</h3>
//                 <p>Our AI analyzes influencer content, audience demographics, engagement patterns, and brand alignment to find the perfect matches for your campaigns.</p>
//               </div>
//               <div className="faq-item">
//                 <h3>Is there a mobile app available?</h3>
//                 <p>Yes, InfluenceAI offers mobile apps for both iOS and Android devices. You can download them from the respective app stores.</p>
//               </div>
//             </div>
//           </section>
//         )}
//       </div>
//     </div>
//     </>
//   );
// }


import React, { useState } from 'react';
import { Search, Mail, MessageCircle, Users, Phone, BookOpen, Wrench, Zap, CreditCard, AlertCircle, Rocket, ArrowRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";


const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

   const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

  const categories = [
    'All',
    'Getting Started',
    'Influencer Management',
    'AI Tools & Automation',
    'Billing & Subscription',
    'Troubleshooting',
    'Advanced Features'
  ];

  const popularArticles = [
    {
      id: 1,
      title: 'How to Create an Account',
      description: 'Step-by-step guide to setting up your InfluenceAI account',
      link: 'Read Guide'
    },
    {
      id: 2,
      title: 'Setting Up Your First Campaign',
      description: 'Complete guide to launching your first influencer campaign',
      link: 'Read Guide'
    },
    {
      id: 3,
      title: 'Finding the Right Influencers',
      description: 'Using our AI tools to identify perfect influencer matches',
      link: 'Read Guide'
    },
    {
      id: 4,
      title: 'Using AI Insights Effectively',
      description: 'How to interpret and apply AI-generated recommendations',
      link: 'Read Guide'
    },
    {
      id: 5,
      title: 'Automated Outreach Settings',
      description: 'Configure and optimize automated influencer communications',
      link: 'Read Guide'
    },
    {
      id: 6,
      title: 'Setting Up Your First Campaign',
      description: 'Complete guide to launching your first influencer campaign',
      link: 'Read Guide'
    },
    {
      id: 7,
      title: 'Finding the Right Influencers',
      description: 'Using our AI tools to identify perfect influencer matches',
      link: 'Read Guide'
    },
    {
      id: 8,
      title: 'Using AI Insights Effectively',
      description: 'How to interpret and apply AI-generated recommendations',
      link: 'Read Guide'
    }
  ];

  const supportChannels = [
    {
      icon: <Mail size={32} />,
      title: 'Email Support',
      description: 'Get help from our support team within 24 hours',
      buttonText: 'Send Email',
      color: '#3B82F6'
    },
    {
      icon: <MessageCircle size={32} />,
      title: 'Live Chat',
      description: 'Instant help from our support agents',
      buttonText: 'Start Chat',
      color: '#3B82F6'
    },
    {
      icon: <Users size={32} />,
      title: 'Help Community',
      description: 'Connect with other InfluenceAI users',
      buttonText: 'Join Community',
      color: '#3B82F6'
    },
    {
      icon: <Phone size={32} />,
      title: 'Schedule a Call',
      description: 'Book a one-on-one session with our experts',
      buttonText: 'Schedule Now',
      color: '#3B82F6'
    }
  ];

  const helpTopics = [
    {
      icon: <BookOpen size={24} />,
      iconColor: '#3B82F6',
      title: 'Getting Started',
      articles: [
        {
          title: 'How to Create an Account',
          description: 'Step-by-step guide to setting up your InfluenceAI account'
        },
        {
          title: 'Navigating the Dashboard',
          description: 'Learn how to navigate and customize your dashboard'
        },
        {
          title: 'Setting Up Your First Campaign',
          description: 'Complete guide to launching your first influencer campaign'
        },
        {
          title: 'Connecting Your Social Accounts',
          description: 'How to integrate your social media platforms with InfluenceAI'
        }
      ],
      link: 'View all Getting Started articles'
    },
    {
      icon: <Users size={24} />,
      iconColor: '#3B82F6',
      title: 'Influencer Management',
      articles: [
        {
          title: 'Finding the Right Influencers',
          description: 'Using our AI tools to identify perfect influencer matches'
        },
        {
          title: 'Contacting Influencers Efficiently',
          description: 'Best practices for outreach and communication'
        },
        {
          title: 'Tracking Influencer Performance',
          description: 'Monitor and analyze influencer campaign results'
        },
        {
          title: 'Managing Long-term Relationships',
          description: 'Strategies for building lasting partnerships with influencers'
        }
      ],
      link: 'View all Influencer Management articles'
    },
    {
      icon: <Zap size={24} />,
      iconColor: '#3B82F6',
      title: 'AI Tools & Automation',
      articles: [
        {
          title: 'Using AI Insights Effectively',
          description: 'How to interpret and apply AI-generated recommendations'
        },
        {
          title: 'Trend Predictor Guide',
          description: 'Leverage predictive insights for campaign planning'
        },
        {
          title: 'Engagement Calculator Tutorial',
          description: 'Estimate and optimize engagement rates for your campaigns'
        },
        {
          title: 'Automated Outreach Settings',
          description: 'Configure and optimize automated influencer communications'
        }
      ],
      link: 'View all AI Tools & Automation articles'
    },
    {
      icon: <CreditCard size={24} />,
      iconColor: '#3B82F6',
      title: 'Billing & Subscription',
      articles: [
        {
          title: 'Subscription Plans Overview',
          description: 'Compare features across different pricing tiers'
        },
        {
          title: 'Payment Methods',
          description: 'Accepted payment options and processing information'
        },
        {
          title: 'Updating Billing Information',
          description: 'How to change your payment details and billing address'
        },
        {
          title: 'Understanding Your Invoice',
          description: 'Breakdown of charges and billing cycles'
        }
      ],
      link: 'View all Billing & Subscription articles'
    },
    {
      icon: <Wrench size={24} />,
      iconColor: '#3B82F6',
      title: 'Troubleshooting',
      articles: [
        {
          title: 'Common Login Issues',
          description: 'Solutions for frequent authentication problems'
        },
        {
          title: 'How to Reset Your Password',
          description: 'Step-by-step password recovery process'
        },
        {
          title: 'Reporting a Bug',
          description: 'How to report technical issues to our team'
        },
        {
          title: 'Browser Compatibility',
          description: 'Supported browsers and optimal configuration'
        }
      ],
      link: 'View all Troubleshooting articles'
    },
    {
      icon: <Rocket size={24} />,
      iconColor: '#3B82F6',
      title: 'Advanced Features',
      articles: [
        {
          title: 'API Integration Guide',
          description: 'Connect InfluenceAI with your existing tools and systems'
        },
        {
          title: 'Custom Reporting',
          description: 'Create tailored analytics dashboards for your campaigns'
        },
        {
          title: 'Team Collaboration Tools',
          description: 'Manage team permissions and collaborative workflows'
        },
        {
          title: 'White Label Options',
          description: 'Enterprise white labeling and customization'
        }
      ],
      link: 'View all Advanced Features articles'
    }
  ];

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'Go to the login page and click "Forgot Password". Enter your email address, and we\'ll send you a link to reset your password.'
    },
    {
      question: 'Can I change my subscription plan?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes take effect immediately.'
    },
    {
      question: 'How does the AI matching work?',
      answer: 'Our AI analyzes influencer content, audience demographics, engagement patterns, and brand alignment to find the perfect matches for your campaigns.'
    },
    {
      question: 'Is there a mobile app available?',
      answer: 'Yes, InfluenceAI offers mobile apps for both iOS and Android devices. You can download them from the App Store or Google Play.'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '42px',
          fontWeight: '700',
          color: '#ffffff',
          margin: '0 0 16px',
          letterSpacing: '-0.5px'
        }}>
          InfluenceAI Help Center
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.95)',
          margin: '0 0 40px',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: '1.6'
        }}>
          Find answers to common questions, guides, and tutorials to maximize your AI marketing platform experience
        </p>

        {/* Search Bar */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 60px 16px 24px',
              fontSize: '15px',
              border: 'none',
              borderRadius: '50px',
              outline: 'none',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              boxSizing: 'border-box'
            }}
          />
          <button style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '44px',
            height: '44px',
            background: '#3B82F6',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '60px 20px'
      }}>
        {/* Popular Help Articles */}
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 32px'
          }}>
            Popular Help Articles
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px'
          }}>
            {popularArticles.map((article) => (
              <div
                key={article.id}
                style={{
                  background: '#f9fafb',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 12px',
                  lineHeight: '1.4'
                }}>
                  {article.title}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  lineHeight: '1.5',
                  margin: '0 0 16px'
                }}>
                  {article.description}
                </p>
                <a
                  href="/login"
                  style={{
                    fontSize: '13px',
                    color: '#3B82F6',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {article.link} →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Need More Help Section */}
        <div style={{
          background: '#f9fafb',
          padding: '60px 40px',
          borderRadius: '16px',
          marginBottom: '80px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 16px'
          }}>
            Need More Help?
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: '0 0 48px'
          }}>
            Get in touch with our support team through these channels
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px'
          }}>
            {supportChannels.map((channel, index) => (
              <div
                key={index}
                style={{
                  background: '#ffffff',
                  padding: '32px 24px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: '#EFF6FF',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: channel.color
                }}>
                  {channel.icon}
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 12px'
                }}>
                  {channel.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.5',
                  margin: '0 0 20px'
                }}>
                  {channel.description}
                </p>
                <button  onClick={goToLogin} style={{
                  background: channel.color,
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = '0.9';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                  e.target.style.transform = 'scale(1)';
                }}
                >
                  {channel.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Browse by Category */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 24px'
          }}>
            Browse by Category
          </h2>

          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                style={{
                  padding: '10px 20px',
                  background: activeCategory === category ? '#3B82F6' : '#f3f4f6',
                  color: activeCategory === category ? '#ffffff' : '#6b7280',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (activeCategory !== category) {
                    e.target.style.background = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCategory !== category) {
                    e.target.style.background = '#f3f4f6';
                  }
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* All Help Topics */}
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 32px'
          }}>
            All Help Topics
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px'
          }}>
            {helpTopics.map((topic, index) => (
              <div
                key={index}
                style={{
                  background: '#ffffff',
                  padding: '28px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: '#EFF6FF',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: topic.iconColor
                  }}>
                    {topic.icon}
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: 0
                  }}>
                    {topic.title}
                  </h3>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  {topic.articles.map((article, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: '16px',
                        cursor: 'pointer'
                      }}
                    >
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0 0 4px',
                        lineHeight: '1.4'
                      }}>
                        {article.title}
                      </h4>
                      <p style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        lineHeight: '1.4',
                        margin: 0
                      }}>
                        {article.description}
                      </p>
                    </div>
                  ))}
                </div>

                <a
                  href="/login"
                  style={{
                    fontSize: '13px',
                    color: '#3B82F6',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {topic.link} →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#3B82F6',
            margin: '0 0 32px',
            textAlign: 'center'
          }}>
            Frequently Asked Questions
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px'
          }}>
            {faqs.map((faq, index) => (
              <div
                key={index}
                style={{
                  background: '#f9fafb',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <h3 style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 12px',
                  lineHeight: '1.4'
                }}>
                  {faq.question}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;