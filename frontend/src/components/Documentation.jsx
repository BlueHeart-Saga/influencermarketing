// import React, { useState } from "react";
// import "../style/Documentation.css";
// import HomeTopBar from "../pages/HomePage/HomeTopBar";

// const documentationSections = [
//   {
//     id: "getting-started",
//     title: "Getting Started",
//     icon: "🚀",
//     content: "Learn how to create your account, set up your profile, and start using InfluenceAI efficiently.",
//     subsections: [
//       {
//         title: "Creating an Account",
//         content: "Sign up with your email or use Google OAuth for quick access. Verify your email to activate all features."
//       },
//       {
//         title: "Dashboard Overview",
//         content: "Navigate through the intuitive dashboard to access influencer discovery, campaign management, and analytics."
//       },
//       {
//         title: "First Campaign Setup",
//         content: "Step-by-step guide to creating your first influencer marketing campaign in under 10 minutes."
//       }
//     ]
//   },
//   {
//     id: "api-overview",
//     title: "API Overview",
//     icon: "🔌",
//     content: "Our RESTful API allows you to fetch influencer data, manage campaigns, and analyze engagement programmatically.",
//     subsections: [
//       {
//         title: "API Basics",
//         content: "Understand the core concepts of our REST API with JSON responses and standard HTTP status codes."
//       },
//       {
//         title: "Rate Limits",
//         content: "API requests are limited to 1000 requests per hour per API key. Contact us for higher limits."
//       },
//       {
//         title: "API Versioning",
//         content: "Current API version is v1. All endpoints are prefixed with /api/v1/. Version updates are announced 3 months in advance."
//       }
//     ]
//   },
//   {
//     id: "authentication",
//     title: "Authentication & API Keys",
//     icon: "🔑",
//     content: "Generate your unique API key from your account dashboard. Keep it secure and never share it publicly.",
//     subsections: [
//       {
//         title: "Generating API Keys",
//         content: "Navigate to Settings > API Keys to generate new keys. You can create up to 5 active keys."
//       },
//       {
//         title: "Key Permissions",
//         content: "Assign read, write, or admin permissions to each API key based on your integration needs."
//       },
//       {
//         title: "Key Rotation",
//         content: "Regularly rotate your API keys for security. Old keys are automatically invalidated after 90 days."
//       }
//     ]
//   },
//   {
//     id: "influencers",
//     title: "Fetching Influencers",
//     icon: "👥",
//     content: "Use the `/influencers` endpoint to retrieve filtered influencer lists by category, platform, followers, and engagement rate.",
//     subsections: [
//       {
//         title: "Search Parameters",
//         content: "Filter by platform, follower count, engagement rate, location, and content categories."
//       },
//       {
//         title: "Pagination",
//         content: "All influencer lists are paginated with 50 results per page. Use the `page` parameter to navigate."
//       },
//       {
//         title: "Response Format",
//         content: "Influencer objects include demographics, engagement metrics, and content analysis data."
//       }
//     ]
//   },
//   {
//     id: "campaigns",
//     title: "Creating Campaigns",
//     icon: "📊",
//     content: "Programmatically create and manage marketing campaigns via the `/campaigns` endpoint.",
//     subsections: [
//       {
//         title: "Campaign Object Structure",
//         content: "Define campaign name, budget, timeline, target audience, and KPIs in the request body."
//       },
//       {
//         title: "Campaign Statuses",
//         content: "Track campaigns through draft, active, paused, completed, and archived statuses."
//       },
//       {
//         title: "Automated Workflows",
//         content: "Set up automated approval workflows and payment processing through the API."
//       }
//     ]
//   },
//   {
//     id: "analytics",
//     title: "Analytics & Reporting",
//     icon: "📈",
//     content: "Retrieve campaign performance, engagement metrics, and ROI using `/analytics` endpoint.",
//     subsections: [
//       {
//         title: "Metric Definitions",
//         content: "Understand engagement rate, reach, impressions, conversions, and ROI calculations."
//       },
//       {
//         title: "Custom Reports",
//         content: "Create custom reports with specific metrics, date ranges, and visualization options."
//       },
//       {
//         title: "Export Options",
//         content: "Export analytics data as JSON, CSV, or PDF for external analysis and presentations."
//       }
//     ]
//   },
//   {
//     id: "rate-limits",
//     title: "Rate Limits & Best Practices",
//     icon: "⚡",
//     content: "Ensure you adhere to our API rate limits. Use caching and avoid repeated requests for efficiency.",
//     subsections: [
//       {
//         title: "Rate Limit Headers",
//         content: "Each response includes X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset headers."
//       },
//       {
//         title: "Handling Rate Limits",
//         content: "Implement exponential backoff when hitting rate limits instead of immediate retries."
//       },
//       {
//         title: "Performance Tips",
//         content: "Use filtering parameters to reduce payload size and request only needed data."
//       }
//     ]
//   },
//   {
//     id: "sample-request",
//     title: "Sample Requests",
//     icon: "💻",
//     content: "Example code snippets for common API operations in various programming languages.",
//     subsections: [
//       {
//         title: "JavaScript Fetch",
//         content: "```javascript\nconst response = await fetch('https://api.influenceai.com/v1/influencers', {\n  method: 'GET',\n  headers: {\n    'Authorization': 'Bearer YOUR_API_KEY',\n    'Content-Type': 'application/json'\n  }\n});\nconst data = await response.json();\nconsole.log(data);\n```"
//       },
//       {
//         title: "Python Requests",
//         content: "```python\nimport requests\n\nurl = 'https://api.influenceai.com/v1/influencers'\nheaders = {'Authorization': 'Bearer YOUR_API_KEY'}\nresponse = requests.get(url, headers=headers)\ndata = response.json()\nprint(data)\n```"
//       },
//       {
//         title: "cURL",
//         content: "```bash\ncurl -X GET https://api.influenceai.com/v1/influencers \\\n  -H 'Authorization: Bearer YOUR_API_KEY' \\\n  -H 'Content-Type: application/json'\n```"
//       }
//     ]
//   },
//   {
//     id: "error-handling",
//     title: "Error Handling",
//     icon: "⚠️",
//     content: "All API errors return descriptive messages. Handle 4xx for client errors and 5xx for server errors.",
//     subsections: [
//       {
//         title: "Common Error Codes",
//         content: "400: Bad Request, 401: Unauthorized, 403: Forbidden, 404: Not Found, 429: Too Many Requests, 500: Internal Server Error"
//       },
//       {
//         title: "Error Response Format",
//         content: "```json\n{\n  \"error\": {\n    \"code\": \"invalid_api_key\",\n    \"message\": \"The provided API key is invalid\",\n    \"documentation_url\": \"https://docs.influenceai.com/errors/invalid_api_key\"\n  }\n}\n```"
//       },
//       {
//         title: "Retry Strategies",
//         content: "Implement retry logic for 5xx errors with exponential backoff. Do not retry 4xx errors without fixing the request."
//       }
//     ]
//   },
//   {
//     id: "support",
//     title: "Support & Feedback",
//     icon: "💬",
//     content: "Contact support via your dashboard for assistance or provide feedback for new features.",
//     subsections: [
//       {
//         title: "Support Channels",
//         content: "Access 24/7 support through email, live chat, or scheduled video calls for enterprise customers."
//       },
//       {
//         title: "Documentation Updates",
//         content: "Subscribe to our changelog RSS feed to stay updated on API changes and new features."
//       },
//       {
//         title: "Feature Requests",
//         content: "Submit feature requests through the dashboard. Our product team reviews all suggestions weekly."
//       }
//     ]
//   }
// ];

// export default function Documentation() {
//   const [activeSection, setActiveSection] = useState("getting-started");
//   const [searchQuery, setSearchQuery] = useState("");

  
 
//   const filteredSections = documentationSections.filter(section =>
//     section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     section.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     section.subsections.some(sub => 
//       sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       sub.content.toLowerCase().includes(searchQuery.toLowerCase())
//     )
//   );

//   const currentSection = documentationSections.find(section => section.id === activeSection);

//   return (
//     <><HomeTopBar />
//     <div className="documentation-page">
//       {/* Header Section */}
//       <header className="doc-header">
//         <div className="header-content">
//           <h1>Developer Documentation</h1>
//           <p>Comprehensive guides and API references to help you integrate and extend InfluenceAI's capabilities</p>
          
//           <div className="search-container">
//             <div className="search-box">
//               <span className="search-icon">🔍</span>
//               <input
//                 type="text"
//                 placeholder="Search documentation..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="search-input"
//               />
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="doc-container">
//         {/* Sidebar Navigation */}
//         <aside className="doc-sidebar">
//           <div className="sidebar-content">
//             <h3>Documentation</h3>
//             <nav className="doc-nav">
//               {documentationSections.map(section => (
//                 <div key={section.id} className="nav-item">
//                   <button
//                     className={`nav-link ${activeSection === section.id ? 'active' : ''}`}
//                     onClick={() => setActiveSection(section.id)}
//                   >
//                     <span className="nav-icon">{section.icon}</span>
//                     {section.title}
//                   </button>
                  
//                   {activeSection === section.id && section.subsections && (
//                     <div className="subsections">
//                       {section.subsections.map((sub, index) => (
//                         <a
//                           key={index}
//                           href={`#${section.id}-${index}`}
//                           className="subsection-link"
//                         >
//                           {sub.title}
//                         </a>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </nav>

//             <div className="api-key-box">
//               <h4>API Key</h4>
//               <div className="key-display">
//                 <code>sk-1234abcd5678efgh91011ijkl</code>
//               </div>
//               <button className="copy-key-btn">Copy Key</button>
//             </div>

//             <div className="resources-box">
//               <h4>Resources</h4>
//               <a href="/" className="resource-link">API Reference</a>
//               <a href="/" className="resource-link">Postman Collection</a>
//               <a href="/" className="resource-link">OpenAPI Spec</a>
//               <a href="/" className="resource-link">Changelog</a>
//             </div>
//           </div>
//         </aside>

//         {/* Main Content */}
//         <main className="doc-main">
//           {searchQuery ? (
//             <div className="search-results">
//               <h2>Search Results for "{searchQuery}"</h2>
//               <p className="results-count">{filteredSections.length} results found</p>
              
//               {filteredSections.length > 0 ? (
//                 <div className="results-list">
//                   {filteredSections.map(section => (
//                     <div key={section.id} className="result-item">
//                       <h3 onClick={() => setActiveSection(section.id)}>
//                         {section.icon} {section.title}
//                       </h3>
//                       <p>{section.content}</p>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="no-results">
//                   <h3>No results found</h3>
//                   <p>Try different keywords or browse the documentation sections</p>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <>
//               {/* Current Section */}
//               {currentSection && (
//                 <section className="doc-section">
//                   <div className="section-header">
//                     <span className="section-icon">{currentSection.icon}</span>
//                     <h2>{currentSection.title}</h2>
//                   </div>
//                   <p className="section-description">{currentSection.content}</p>

//                   {/* Subsections */}
//                   {currentSection.subsections && (
//                     <div className="subsections-container">
//                       {currentSection.subsections.map((sub, index) => (
//                         <div key={index} id={`${currentSection.id}-${index}`} className="subsection">
//                           <h3>{sub.title}</h3>
//                           {sub.content.startsWith('```') ? (
//                             <div className="code-block">
//                               <div className="code-header">
//                                 <span className="code-language">
//                                   {sub.content.includes('javascript') ? 'JavaScript' : 
//                                    sub.content.includes('python') ? 'Python' : 
//                                    sub.content.includes('bash') ? 'cURL' : 'Code'}
//                                 </span>
//                                 <button className="copy-code-btn">Copy</button>
//                               </div>
//                               <pre>
//                                 <code>
//                                   {sub.content.replace(/```[a-z]*\n/, '').replace(/\n```/, '')}
//                                 </code>
//                               </pre>
//                             </div>
//                           ) : sub.content.startsWith('{') ? (
//                             <div className="code-block">
//                               <div className="code-header">
//                                 <span className="code-language">JSON</span>
//                                 <button className="copy-code-btn">Copy</button>
//                               </div>
//                               <pre>
//                                 <code>
//                                   {JSON.stringify(JSON.parse(sub.content.replace(/```json\n/, '').replace(/\n```/, '')), null, 2)}
//                                 </code>
//                               </pre>
//                             </div>
//                           ) : (
//                             <p>{sub.content}</p>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </section>
//               )}

//               {/* Quick Links */}
//               <div className="quick-links">
//                 <h3>Quick Links</h3>
//                 <div className="links-grid">
//                   <a href="/" className="quick-link">
//                     <span className="link-icon">📖</span>
//                     <span className="link-text">API Reference</span>
//                   </a>
//                   <a href="/" className="quick-link">
//                     <span className="link-icon">🛠️</span>
//                     <span className="link-text">Postman Collection</span>
//                   </a>
//                   <a href="/" className="quick-link">
//                     <span className="link-icon">🐙</span>
//                     <span className="link-text">GitHub Examples</span>
//                   </a>
//                   <a href="/" className="quick-link">
//                     <span className="link-icon">💬</span>
//                     <span className="link-text">Community Forum</span>
//                   </a>
//                 </div>
//               </div>
//             </>
//           )}
//         </main>
//       </div>
//     </div>
//     </>
//   );
// }



import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, Rocket, Lock, Users, Target, 
  BarChart3, AlertCircle, FileCode, MessageCircle, BookOpen, Code, 
  Github, Database, Copy, Check, Home, Settings, Zap, Shield, 
  CreditCard, Globe, TrendingUp, Calendar, Filter, Download,
  Terminal, Server, Cpu, Wifi, WifiOff, RefreshCw, Eye, EyeOff
} from 'lucide-react';

function Documentation() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [activeSubsection, setActiveSubsection] = useState('creating-account');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const copyApiKey = () => {
    navigator.clipboard.writeText(process.env.REACT_APP_API_KEY);
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  const documentationContent = {
    'getting-started': {
      title: 'Getting Started',
      icon: <Rocket size={32} />,
      color: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      sections: {
        'creating-account': {
          title: 'Creating an Account',
          content: (
            <>
              <p className="doc-section-text">
                Sign up with your email or use Google OAuth for quick access. Verify your email to activate all features.
              </p>
              <div className="doc-tip">
                <strong>Tip:</strong> Use Google OAuth for faster setup and enhanced security.
              </div>
              <div className="doc-code-block">
                <div className="doc-code-header">
                  <span>Registration Endpoint</span>
                  <button className="doc-code-copy">Copy</button>
                </div>
                <pre className="doc-code">
{`POST /api/v1/auth/register
Content-Type: application/json
Accept: application/json

{
  "email": "user@example.com",
  "password": "securePassword123!",
  "name": "John Doe",
  "company": "Acme Inc.",
  "phone": "+1234567890"
}`}
                </pre>
              </div>
            </>
          )
        },
        'dashboard': {
          title: 'Dashboard Overview',
          content: (
            <>
              <p className="doc-section-text">
                Navigate through our intuitive dashboard to access all platform features.
              </p>
              <div className="doc-feature-grid">
                <div className="doc-feature">
                  <div className="doc-feature-icon">
                    <Target size={20} />
                  </div>
                  <div>
                    <h4>Campaign Management</h4>
                    <p>Create, launch, and track all your campaigns</p>
                  </div>
                </div>
                <div className="doc-feature">
                  <div className="doc-feature-icon">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4>Influencer Discovery</h4>
                    <p>Find perfect matches with AI-powered search</p>
                  </div>
                </div>
                <div className="doc-feature">
                  <div className="doc-feature-icon">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h4>Analytics Dashboard</h4>
                    <p>Real-time performance metrics and insights</p>
                  </div>
                </div>
                <div className="doc-feature">
                  <div className="doc-feature-icon">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h4>Billing & Payments</h4>
                    <p>Manage subscriptions and payments</p>
                  </div>
                </div>
              </div>
            </>
          )
        },
        'first-campaign': {
          title: 'First Campaign Setup',
          content: (
            <>
              <p className="doc-section-text">
                Launch your first influencer marketing campaign in under 10 minutes.
              </p>
              <div className="doc-steps">
                {[
                  {
                    number: 1,
                    title: 'Define Campaign Goals',
                    description: 'Set objectives, target audience, and KPIs',
                    icon: <Target size={24} />
                  },
                  {
                    number: 2,
                    title: 'Select Influencers',
                    description: 'Use AI-powered matching to find creators',
                    icon: <Users size={24} />
                  },
                  {
                    number: 3,
                    title: 'Set Budget & Timeline',
                    description: 'Define budget allocation and schedule',
                    icon: <CreditCard size={24} />
                  },
                  {
                    number: 4,
                    title: 'Launch & Monitor',
                    description: 'Activate and track performance in real-time',
                    icon: <TrendingUp size={24} />
                  }
                ].map((step) => (
                  <div key={step.number} className="doc-step">
                    <div className="doc-step-number">{step.number}</div>
                    <div className="doc-step-content">
                      <div className="doc-step-header">
                        <div className="doc-step-icon">{step.icon}</div>
                        <h4>{step.title}</h4>
                      </div>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        }
      }
    },
    'auth': {
      title: 'Authentication & API Keys',
      icon: <Lock size={32} />,
      color: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      content: (
        <>
          <div className="doc-code-block">
            <div className="doc-code-header">
              <span>Authentication Header</span>
            </div>
            <pre className="doc-code">
{`Authorization: Bearer pk_test_xxxxxxxxxxxx
Content-Type: application/json`}
</pre>
          </div>
          
          <div className="doc-warning">
            <AlertCircle size={20} />
            <div>
              <strong>Security Note:</strong> Never expose your API keys in client-side code. Use environment variables in production.
            </div>
          </div>
          
          <h4 className="doc-subsection-title">Key Permissions</h4>
          <div className="doc-permissions">
            <div className="doc-permission">
              <Check size={16} />
              <span>Read campaigns</span>
            </div>
            <div className="doc-permission">
              <Check size={16} />
              <span>Create influencers</span>
            </div>
            <div className="doc-permission">
              <Check size={16} />
              <span>Update analytics</span>
            </div>
            <div className="doc-permission">
              <Check size={16} />
              <span>Delete webhooks</span>
            </div>
          </div>
        </>
      )
    },
    'api-endpoints': {
      title: 'API Endpoints',
      icon: <Server size={32} />,
      color: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
      content: (
        <>
          <div className="doc-endpoints">
            <div className="doc-endpoint">
              <div className="doc-endpoint-method get">GET</div>
              <div className="doc-endpoint-path">/api/v1/influencers</div>
              <div className="doc-endpoint-desc">List all influencers</div>
            </div>
            <div className="doc-endpoint">
              <div className="doc-endpoint-method post">POST</div>
              <div className="doc-endpoint-path">/api/v1/campaigns</div>
              <div className="doc-endpoint-desc">Create new campaign</div>
            </div>
            <div className="doc-endpoint">
              <div className="doc-endpoint-method put">PUT</div>
              <div className="doc-endpoint-path">/api/v1/campaigns/{'{id}'}</div>
              <div className="doc-endpoint-desc">Update campaign</div>
            </div>
            <div className="doc-endpoint">
              <div className="doc-endpoint-method delete">DELETE</div>
              <div className="doc-endpoint-path">/api/v1/campaigns/{'{id}'}</div>
              <div className="doc-endpoint-desc">Delete campaign</div>
            </div>
          </div>
        </>
      )
    }
  };

  const currentSection = documentationContent[activeSection];

  return (
    <div className="doc-wrapper">
      {/* Hero Section */}
      <section className="doc-hero">
        <div className="doc-hero-content">
          <div className="doc-hero-header">
            <button 
              className="doc-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <ChevronRight size={24} />
            </button>
            <h1 className="doc-hero-title">Developer Documentation</h1>
          </div>
          <p className="doc-hero-subtitle">
            Comprehensive guides and API references to help you integrate and extend InfluenceAI's capabilities
          </p>
          <div className="doc-search-wrapper">
            <input 
              type="text" 
              placeholder="Search documentation, APIs, or guides..." 
              className="doc-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="doc-search-btn">
              <Search size={20} />
            </button>
          </div>
          <div className="doc-hero-stats">
            <div className="doc-stat">
              <div className="doc-stat-value">150+</div>
              <div className="doc-stat-label">API Endpoints</div>
            </div>
            <div className="doc-stat">
              <div className="doc-stat-value">24/7</div>
              <div className="doc-stat-label">Support</div>
            </div>
            <div className="doc-stat">
              <div className="doc-stat-value">99.9%</div>
              <div className="doc-stat-label">Uptime</div>
            </div>
            <div className="doc-stat">
              <div className="doc-stat-value">10ms</div>
              <div className="doc-stat-label">Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="doc-main">
        <div className="doc-container">
          <div className="doc-layout">
            {/* Sidebar */}
            <aside className={`doc-sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              <div className="doc-sidebar-header">
                <div className="doc-sidebar-header-top">
                  <h3>Documentation</h3>
                  {/* <button 
                    className="doc-sidebar-toggle"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                  </button> */}
                </div>
                <div className="doc-version">
                  <span className="doc-version-label">Version</span>
                  <span className="doc-version-number">v2.5.0</span>
                </div>
              </div>

              <nav className="doc-nav">
                <div className="doc-nav-section">
                  <button 
                    className={`doc-nav-item ${activeSection === 'getting-started' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveSection('getting-started');
                      setActiveSubsection('creating-account');
                      if (window.innerWidth < 1024) setMobileMenuOpen(false);
                    }}
                  >
                    <Rocket size={18} />
                    <span>Getting Started</span>
                    <ChevronRight size={16} className="doc-nav-chevron" />
                  </button>
                  {activeSection === 'getting-started' && (
                    <div className="doc-subnav">
                      {Object.keys(documentationContent['getting-started'].sections).map((key) => (
                        <button 
                          key={key}
                          className={activeSubsection === key ? 'active' : ''}
                          onClick={() => {
                            setActiveSubsection(key);
                            if (window.innerWidth < 1024) setMobileMenuOpen(false);
                          }}
                        >
                          {documentationContent['getting-started'].sections[key].title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {[
                  { id: 'auth', icon: <Lock size={18} />, label: 'Authentication' },
                  { id: 'api-endpoints', icon: <Server size={18} />, label: 'API Endpoints' },
                  { id: 'influencers', icon: <Users size={18} />, label: 'Fetching Influencers' },
                  { id: 'campaigns', icon: <Target size={18} />, label: 'Creating Campaigns' },
                  { id: 'analytics', icon: <BarChart3 size={18} />, label: 'Analytics' },
                  { id: 'webhooks', icon: <Zap size={18} />, label: 'Webhooks' },
                  { id: 'rate-limits', icon: <AlertCircle size={18} />, label: 'Rate Limits' },
                  { id: 'errors', icon: <AlertCircle size={18} />, label: 'Error Handling' },
                  { id: 'security', icon: <Shield size={18} />, label: 'Security' },
                  { id: 'support', icon: <MessageCircle size={18} />, label: 'Support' },
                ].map((item) => (
                  <button 
                    key={item.id}
                    className={`doc-nav-item ${activeSection === item.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveSection(item.id);
                      if (window.innerWidth < 1024) setMobileMenuOpen(false);
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    <ChevronRight size={16} className="doc-nav-chevron" />
                  </button>
                ))}
              </nav>

              {/* API Key Section */}
              <div className="doc-api-key-section">
                <h4 className="doc-api-key-title">
                  <Lock size={16} />
                  <span>API Key</span>
                </h4>
                <div className="doc-api-key-box">
                  <code>
  {showApiKey 
    ? process.env.REACT_APP_PUBLIC_KEY 
    : '••••••••••••••••••••••••••••'}
</code>
                  <button className="doc-api-key-toggle" onClick={toggleApiKeyVisibility}>
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button className="doc-copy-btn" onClick={copyApiKey}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'Copied!' : 'Copy Key'}</span>
                </button>
                <div className="doc-api-key-info">
                  <AlertCircle size={14} />
                  <span>Regenerates every 90 days</span>
                </div>
              </div>

              {/* Quick Links */}
              <div className="doc-quick-links-sidebar">
                <h4 className="doc-quick-links-title">
                  <Zap size={16} />
                  <span>Quick Links</span>
                </h4>
                <div className="doc-quick-links-grid">
                  <a href="#postman" className="doc-quick-link">
                    <FileCode size={16} />
                    <span>Postman</span>
                  </a>
                  <a href="#github" className="doc-quick-link">
                    <Github size={16} />
                    <span>GitHub</span>
                  </a>
                  <a href="#cli" className="doc-quick-link">
                    <Terminal size={16} />
                    <span>CLI Tool</span>
                  </a>
                  <a href="#sdk" className="doc-quick-link">
                    <Code size={16} />
                    <span>SDKs</span>
                  </a>
                </div>
              </div>
            </aside>

            {/* Content Area */}
            <main className="doc-content">
              <div className="doc-content-header">
                <div className="doc-header-icon" style={{ background: currentSection?.color }}>
                  {currentSection?.icon}
                </div>
                <div className="doc-header-content">
                  <div className="doc-breadcrumb">
                    <a href="#">Home</a>
                    <ChevronRight size={14} />
                    <span>Documentation</span>
                    <ChevronRight size={14} />
                    <span className="active">{currentSection?.title}</span>
                  </div>
                  <h2 className="doc-content-title">{currentSection?.title}</h2>
                  <div className="doc-header-actions">
                    <button className="doc-action-btn">
                      <Download size={16} />
                      <span>PDF</span>
                    </button>
                    <button className="doc-action-btn">
                      <Copy size={16} />
                      <span>Copy Section</span>
                    </button>
                    <button className="doc-action-btn">
                      <MessageCircle size={16} />
                      <span>Feedback</span>
                    </button>
                  </div>
                </div>
              </div>

              {activeSection === 'getting-started' && activeSubsection && (
                <>
                  <h3 className="doc-section-title">
                    {documentationContent['getting-started'].sections[activeSubsection]?.title}
                  </h3>
                  {documentationContent['getting-started'].sections[activeSubsection]?.content}
                </>
              )}

              {activeSection !== 'getting-started' && currentSection?.content}

              {/* Quick Links Grid */}
              <section className="doc-quick-links-main">
                <h3 className="doc-section-title">Explore More</h3>
                <div className="doc-quick-grid">
                  {[
                    { icon: <BookOpen size={32} />, title: 'API Reference', desc: 'Complete endpoint documentation' },
                    { icon: <Code size={32} />, title: 'SDKs', desc: 'Client libraries for popular languages' },
                    { icon: <Github size={32} />, title: 'Examples', desc: 'Real-world code samples' },
                    { icon: <Terminal size={32} />, title: 'CLI Tool', desc: 'Command-line interface' },
                    { icon: <Server size={32} />, title: 'Webhooks', desc: 'Real-time event notifications' },
                    { icon: <Shield size={32} />, title: 'Security', desc: 'Best practices and compliance' },
                  ].map((item, index) => (
                    <a key={index} href="#" className="doc-quick-card">
                      <div className="doc-quick-icon" style={{ background: currentSection?.color }}>
                        {item.icon}
                      </div>
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </a>
                  ))}
                </div>
              </section>

              {/* Feedback Section */}
              <div className="doc-feedback">
                <div className="doc-feedback-content">
                  <MessageCircle size={24} />
                  <div>
                    <h4>Was this helpful?</h4>
                    <p>Help us improve our documentation</p>
                  </div>
                </div>
                <div className="doc-feedback-actions">
                  <button className="doc-feedback-btn yes">Yes</button>
                  <button className="doc-feedback-btn no">No</button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="doc-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .doc-wrapper { width: 100%; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; }
        
        /* Hero Section */
        .doc-hero {background: #0f6eeaff; padding: 80px 20px 60px; position: relative; margin: 0 auto; overflow: hidden; }
        .doc-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%233b82f6' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E"); }
        .doc-hero-content { max-width: 1200px; margin: 0 auto; position: relative; z-index: 1; }
        .doc-hero-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .doc-mobile-menu-btn { display: none; background: transparent; border: none; color: white; padding: 8px; cursor: pointer; }
        .doc-hero-title { font-size: 48px; font-weight: 800; color: white; margin-bottom: 16px; }
        .doc-hero-subtitle { font-size: 18px; color: rgba(255,255,255,0.85); line-height: 1.7; margin-bottom: 40px; max-width: 800px; }
        .doc-search-wrapper { position: relative; max-width: 600px; margin-bottom: 40px; }
        .doc-search-input { width: 100%; padding: 18px 24px; border: none; border-radius: 12px; font-size: 16px; outline: none; box-shadow: 0 8px 32px rgba(0,0,0,0.15); background: white; }
        .doc-search-btn { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .doc-search-btn:hover { background: #2563eb; }
        .doc-hero-stats { display: flex; gap: 32px; flex-wrap: wrap; }
        .doc-stat { text-align: center; }
        .doc-stat-value { font-size: 32px; font-weight: 700; color: #60a5fa; margin-bottom: 4px; }
        .doc-stat-label { font-size: 14px; color: rgba(255,255,255,0.7); font-weight: 500; }

        /* Main Content */
        .doc-main { padding: 40px 0 80px; }
        .doc-container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }
        .doc-layout { display: grid; grid-template-columns: 280px 1fr; gap: 40px; position: relative; }

        /* Sidebar */
        .doc-sidebar { position: sticky; top: 20px; height: fit-content; max-height: calc(100vh - 40px); overflow-y: auto; background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); transition: 0.3s ease; }
        .doc-sidebar.open { transform: translateX(0); opacity: 1; }
        .doc-sidebar.closed { transform: translateX(-100%); opacity: 0; position: fixed; left: 0; top: 0; height: 100vh; z-index: 1000; }
        .doc-sidebar-header { margin-bottom: 24px; }
        .doc-sidebar-header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .doc-sidebar-header h3 { font-size: 18px; font-weight: 700; color: #1e293b; }
        .doc-sidebar-toggle { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; transition: 0.2s; }
        .doc-sidebar-toggle:hover { background: #e2e8f0; color: #1e293b; }
        .doc-version { display: flex; align-items: center; gap: 8px; }
        .doc-version-label { font-size: 12px; color: #94a3b8; }
        .doc-version-number { font-size: 12px; font-weight: 600; color: #3b82f6; background: #eff6ff; padding: 4px 8px; border-radius: 6px; }

        /* Navigation */
        .doc-nav { display: flex; flex-direction: column; gap: 4px; margin-bottom: 32px; }
        .doc-nav-section { display: flex; flex-direction: column; gap: 4px; }
        .doc-nav-item { width: 100%; padding: 12px 16px; background: transparent; border: none; border-radius: 8px; display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; text-align: left; transition: 0.2s; position: relative; }
        .doc-nav-item:hover { background: #f1f5f9; color: #1e293b; }
        .doc-nav-item.active { background: #eff6ff; color: #3b82f6; }
        .doc-nav-item svg { flex-shrink: 0; }
        .doc-nav-chevron { margin-left: auto; transition: transform 0.2s; }
        .doc-nav-item.active .doc-nav-chevron { transform: rotate(90deg); }
        .doc-subnav { margin-left: 32px; display: flex; flex-direction: column; gap: 4px; margin-top: 4px; margin-bottom: 8px; }
        .doc-subnav button { width: 100%; padding: 8px 12px; background: transparent; border: none; border-left: 2px solid #e2e8f0; font-size: 13px; color: #64748b; cursor: pointer; text-align: left; transition: 0.2s; }
        .doc-subnav button:hover { color: #1e293b; border-color: #3b82f6; }
        .doc-subnav button.active { color: #3b82f6; border-color: #3b82f6; font-weight: 600; background: #eff6ff; }

        /* API Key Section */
        .doc-api-key-section { margin-bottom: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
        .doc-api-key-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
        .doc-api-key-box { position: relative; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; }
        .doc-api-key-box code { font-size: 13px; color: #475569; font-family: 'Courier New', monospace; word-break: break-all; }
        .doc-api-key-toggle { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 4px; border-radius: 4px; }
        .doc-api-key-toggle:hover { color: #1e293b; background: #e2e8f0; }
        .doc-copy-btn { width: 100%; padding: 10px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; margin-bottom: 8px; }
        .doc-copy-btn:hover { background: #2563eb; }
        .doc-api-key-info { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #94a3b8; }

        /* Quick Links Sidebar */
        .doc-quick-links-sidebar { padding-top: 24px; border-top: 1px solid #e2e8f0; }
        .doc-quick-links-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
        .doc-quick-links-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .doc-quick-link { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; font-size: 13px; color: #475569; transition: 0.2s; }
        .doc-quick-link:hover { background: #f1f5f9; color: #3b82f6; border-color: #3b82f6; }

        /* Content Area */
        .doc-content { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
        .doc-content-header { display: flex; align-items: flex-start; gap: 24px; margin-bottom: 32px; }
        .doc-header-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
        .doc-header-content { flex: 1; }
        .doc-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #64748b; margin-bottom: 8px; flex-wrap: wrap; }
        .doc-breadcrumb a { color: #3b82f6; text-decoration: none; }
        .doc-breadcrumb a:hover { text-decoration: underline; }
        .doc-breadcrumb .active { color: #1e293b; font-weight: 500; }
        .doc-content-title { font-size: 32px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
        .doc-header-actions { display: flex; gap: 12px; }
        .doc-action-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; color: #475569; cursor: pointer; transition: 0.2s; }
        .doc-action-btn:hover { background: #f1f5f9; color: #3b82f6; border-color: #3b82f6; }

        /* Content Sections */
        .doc-intro-text { font-size: 16px; color: #64748b; line-height: 1.7; margin-bottom: 40px; }
        .doc-section { margin-bottom: 48px; }
        .doc-section-title { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
        .doc-section-text { font-size: 16px; color: #64748b; line-height: 1.7; margin-bottom: 24px; }
        .doc-subsection-title { font-size: 18px; font-weight: 600; color: #1e293b; margin: 24px 0 16px; }
        
        /* Tips & Warnings */
        .doc-tip { padding: 16px; background: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 8px; margin: 16px 0; font-size: 14px; color: #1e293b; }
        .doc-warning { display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; margin: 24px 0; font-size: 14px; color: #92400e; }
        .doc-warning svg { flex-shrink: 0; margin-top: 2px; }

        /* Code Blocks */
        .doc-code-block { margin: 24px 0; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
        .doc-code-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 600; color: #1e293b; }
        .doc-code-copy { padding: 4px 12px; background: #e2e8f0; border: none; border-radius: 6px; font-size: 12px; color: #475569; cursor: pointer; transition: 0.2s; }
        .doc-code-copy:hover { background: #cbd5e1; }
        .doc-code { padding: 20px; background: #1e293b; color: #e2e8f0; font-size: 14px; overflow-x: auto; font-family: 'Courier New', monospace; line-height: 1.6; margin: 0; }

        /* Feature Grid */
        .doc-feature-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 24px 0; }
        .doc-feature { display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: #f8fafc; border-radius: 8px; }
        .doc-feature-icon { width: 32px; height: 32px; background: #eff6ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #3b82f6; flex-shrink: 0; }
        .doc-feature h4 { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 4px; }
        .doc-feature p { font-size: 13px; color: #64748b; }

        /* Steps */
        .doc-steps { display: flex; flex-direction: column; gap: 24px; margin: 24px 0; }
        .doc-step { display: flex; gap: 20px; }
        .doc-step-number { width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; font-size: 18px; }
        .doc-step-content { flex: 1; }
        .doc-step-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .doc-step-icon { width: 40px; height: 40px; background: #eff6ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #3b82f6; }
        .doc-step-content h4 { font-size: 18px; font-weight: 600; color: #1e293b; }
        .doc-step-content p { font-size: 15px; color: #64748b; line-height: 1.6; }

        /* Permissions */
        .doc-permissions { display: flex; flex-wrap: wrap; gap: 12px; margin: 16px 0; }
        .doc-permission { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f0f9ff; border-radius: 6px; font-size: 14px; color: #0369a1; }
        .doc-permission svg { flex-shrink: 0; }

        /* Endpoints */
        .doc-endpoints { display: flex; flex-direction: column; gap: 8px; margin: 24px 0; }
        .doc-endpoint { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #f8fafc; border-radius: 8px; }
        .doc-endpoint-method { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; color: white; }
        .doc-endpoint-method.get { background: #10b981; }
        .doc-endpoint-method.post { background: #3b82f6; }
        .doc-endpoint-method.put { background: #f59e0b; }
        .doc-endpoint-method.delete { background: #ef4444; }
        .doc-endpoint-path { font-family: 'Courier New', monospace; font-size: 14px; color: #1e293b; }
        .doc-endpoint-desc { margin-left: auto; font-size: 14px; color: #64748b; }

        /* Quick Links Main */
        .doc-quick-links-main { margin-top: 60px; padding-top: 40px; border-top: 2px solid #e2e8f0; }
        .doc-quick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 24px; }
        .doc-quick-card { padding: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; text-decoration: none; transition: 0.3s; display: block; }
        .doc-quick-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); border-color: #3b82f6; }
        .doc-quick-icon { width: 56px; height: 56px; margin: 0 auto 16px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
        .doc-quick-card h4 { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .doc-quick-card p { font-size: 14px; color: #64748b; }

        /* Feedback */
        .doc-feedback { display: flex; align-items: center; justify-content: space-between; padding: 24px; background: #f8fafc; border-radius: 12px; margin-top: 48px; border: 1px solid #e2e8f0; }
        .doc-feedback-content { display: flex; align-items: center; gap: 16px; }
        .doc-feedback-content svg { color: #3b82f6; }
        .doc-feedback-content h4 { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 4px; }
        .doc-feedback-content p { font-size: 14px; color: #64748b; }
        .doc-feedback-actions { display: flex; gap: 12px; }
        .doc-feedback-btn { padding: 8px 24px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .doc-feedback-btn.yes { background: #10b981; color: white; }
        .doc-feedback-btn.no { background: #ef4444; color: white; }
        .doc-feedback-btn:hover { opacity: 0.9; }

        /* Mobile Overlay */
        .doc-mobile-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 999; }

        /* Responsive */
        @media (max-width: 1024px) {
          .doc-layout { grid-template-columns: 1fr; }
          .doc-sidebar { position: fixed; left: 0; top: 0; bottom: 0; width: 280px; z-index: 1000; transform: translateX(-100%); transition: transform 0.3s ease; }
          .doc-sidebar.mobile-open { transform: translateX(0); }
          .doc-sidebar.closed { transform: translateX(-100%); }
          .doc-sidebar-toggle { display: none; }
          .doc-mobile-menu-btn { display: block; }
          .doc-hero-title { font-size: 36px; }
          .doc-quick-grid { grid-template-columns: repeat(2, 1fr); }
          .doc-feature-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .doc-hero { padding: 60px 20px 40px; }
          .doc-hero-title { font-size: 28px; }
          .doc-hero-subtitle { font-size: 16px; }
          .doc-content { padding: 24px; }
          .doc-content-title { font-size: 24px; }
          .doc-quick-grid { grid-template-columns: 1fr; }
          .doc-feedback { flex-direction: column; gap: 16px; text-align: center; }
          .doc-feedback-content { flex-direction: column; text-align: center; }
          .doc-header-actions { flex-wrap: wrap; }
          .doc-hero-stats { justify-content: center; }
        }

        @media (max-width: 480px) {
          .doc-search-input { padding: 16px; font-size: 14px; }
          .doc-section-title { font-size: 20px; }
          .doc-step { flex-direction: column; align-items: flex-start; }
          .doc-step-number { width: 32px; height: 32px; font-size: 16px; }
          .doc-step-header { flex-direction: column; align-items: flex-start; gap: 8px; }
          .doc-endpoint { flex-direction: column; align-items: flex-start; gap: 8px; }
          .doc-endpoint-desc { margin-left: 0; }
        }
      `}</style>
    </div>
  );
}

export default Documentation;