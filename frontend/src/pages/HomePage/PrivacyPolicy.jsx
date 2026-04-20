import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  Lock,
  Database,
  Cookie,
  Eye,
  EyeOff,
  Download,
  Trash2,
  RefreshCw,
  Globe,
  FileText,
  Mail,
  Phone,
  MapPin,
  Users,
  BarChart3,
  CreditCard,
  Building,
  User,
  CheckCircle,
  AlertCircle,
  Printer,
  FileSignature,
  ArrowUp,
  ShieldCheck,
  Server,
  Key,
  Clock,
  Network,
  Bell,
  Settings,
  ShieldAlert,
  Users as UsersIcon,
  Briefcase,
  Smartphone,
  Hash,
  Tag,
  BookOpen,
  Code,
  MessageCircle,
  Target,
  Rocket,
  FileCode
} from 'lucide-react';

import { setPageTitle } from '../../components/utils/pageTitle';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const PrivacyPolicy = () => {
  useEffect(() => {
    setPageTitle(
      "Privacy Policy | Brio AI Influencer Platform",
      "Read Brio's Privacy Policy to understand how we protect your data and ensure privacy within our AI-powered influencer marketing platform."
    );
  }, []);
  const [activeSection, setActiveSection] = useState('introduction');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logoUrl, setLogoUrl] = useState("");
  const [brandName, setBrandName] = useState("Brio");
  const [loading, setLoading] = useState({ logo: true, name: true });
  const sectionRefs = useRef({});

  const sections = [
    { id: 'introduction', title: 'Introduction & Scope', icon: <FileText size={18} /> },
    { id: 'data-collection', title: 'Data We Collect', icon: <Database size={18} /> },
    { id: 'ai-processing', title: 'AI Data Processing', icon: <Server size={18} /> },
    { id: 'data-usage', title: 'How We Use Data', icon: <Settings size={18} /> },
    { id: 'data-rights', title: 'Your Data Rights', icon: <ShieldCheck size={18} /> },
    { id: 'dpdp-rights', title: 'DPDP Act 2023 Rights', icon: <Shield size={18} /> },
    { id: 'international', title: 'International Compliance', icon: <Globe size={18} /> },
    { id: 'data-security', title: 'Data Security', icon: <Lock size={18} /> },
    { id: 'cookies', title: 'Cookies & Tracking', icon: <Cookie size={18} /> },
    { id: 'data-retention', title: 'Data Retention', icon: <Clock size={18} /> },
    { id: 'data-sharing', title: 'Data Sharing', icon: <Network size={18} /> },
    { id: 'children', title: "Children's Privacy", icon: <UsersIcon size={18} /> },
    { id: 'updates', title: 'Policy Updates', icon: <RefreshCw size={18} /> },
    { id: 'contact', title: 'Contact DPO', icon: <Mail size={18} /> }
  ];

  // Fetch logo dynamically
  const fetchLogo = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, logo: true }));
      const res = await fetch(`${API_BASE_URL}/api/logo/current`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setLogoUrl(url);
      } else {
        setLogoUrl("");
      }
    } catch (err) {
      console.error("Failed to fetch logo:", err);
      setLogoUrl("");
    } finally {
      setLoading(prev => ({ ...prev, logo: false }));
    }
  }, [API_BASE_URL]);

  // Fetch brand name dynamically
  const fetchBrandName = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, name: true }));
      const res = await fetch(`${API_BASE_URL}/api/platform/name`);
      if (res.ok) {
        const data = await res.json();
        setBrandName(data.platform_name || "Brio");
      } else {
        setBrandName("Brio");
      }
    } catch (err) {
      console.error("Failed to fetch brand name:", err);
      setBrandName("Brio");
    } finally {
      setLoading(prev => ({ ...prev, name: false }));
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchLogo();
    fetchBrandName();
  }, [fetchLogo, fetchBrandName]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="doc-wrapper">
      {/* Hero Section */}
      <section className="doc-hero">
        <div className="doc-hero-content">
          <div className="doc-brand-header">
            {/* {!loading.logo && logoUrl && (
              <img 
                src={logoUrl} 
                alt={`${brandName} Logo`} 
                className="doc-brand-logo"
                onError={() => setLogoUrl("")}
              />
            )} */}
            <h1 className="doc-hero-title">Privacy Policy</h1>
          </div>
          <p className="doc-hero-subtitle">
            How {brandName} AI Platform collects, uses, and protects your data<br />
            Last updated: {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <div className="doc-search-wrapper">
            <input
              type="text"
              placeholder="Search privacy policy..."
              className="doc-search-input"
            />
            <button className="doc-search-btn">
              <Search size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="doc-main">
        <div className="doc-container">
          <div className="doc-layout">
            {/* Sidebar */}
            <aside className={`doc-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
              <button
                className="doc-sidebar-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>

              <div className="doc-sidebar-header">
                <h3>Quick Navigation</h3>
              </div>

              <nav className="doc-nav">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    className={`doc-nav-item ${activeSection === section.id ? 'active' : ''}`}
                    onClick={() => scrollToSection(section.id)}
                  >
                    {section.icon}
                    <span>{section.title}</span>
                  </button>
                ))}
              </nav>

              {/* Compliance Badges */}
              <div className="doc-compliance-badges">
                <h4 className="doc-compliance-title">Compliant With</h4>
                <div className="doc-badges-grid">
                  <div className="doc-badge">
                    <Shield size={14} />
                    <span>India DPDP Act 2023</span>
                  </div>
                  <div className="doc-badge">
                    <Globe size={14} />
                    <span>EU GDPR</span>
                  </div>
                  <div className="doc-badge">
                    <ShieldCheck size={14} />
                    <span>US CCPA</span>
                  </div>
                  <div className="doc-badge">
                    <Lock size={14} />
                    <span>ISO 27001</span>
                  </div>
                </div>
              </div>

              {/* Data Rights Quick Actions */}
              <div className="doc-quick-actions">
                <h4 className="doc-quick-title">Your Rights</h4>
                <div className="doc-action-buttons">
                  <button className="doc-action-btn">
                    <Eye size={14} />
                    <span>Access Data</span>
                  </button>
                  <button className="doc-action-btn">
                    <Download size={14} />
                    <span>Export Data</span>
                  </button>
                  <button className="doc-action-btn">
                    <Trash2 size={14} />
                    <span>Delete Data</span>
                  </button>
                </div>
              </div>

              {/* Resources */}
              {/* <div className="doc-resources">
                <h4 className="doc-resources-title">Related Documents</h4>
                <ul className="doc-resources-list">
                  <li><a href="#terms">Terms & Conditions</a></li>
                  <li><a href="#cookie-policy">Cookie Policy</a></li>
                  <li><a href="#ai-ethics">AI Ethics Policy</a></li>
                  <li><a href="#data-processing">Data Processing Addendum</a></li>
                </ul>
              </div> */}
            </aside>

            {/* Content Area */}
            <main className="doc-content">
              {/* Header */}
              <div className="doc-content-header">
                <div className="doc-header-icon" style={{ backgroundColor: '#3b82f6' }}>
                  <Shield size={32} />
                </div>
                <div>
                  <h2 className="doc-content-title">{brandName} Privacy Policy</h2>
                  <div className="doc-tags">
                    <span className="doc-tag">Data Protection</span>
                    <span className="doc-tag">AI Privacy</span>
                    <span className="doc-tag">DPDP Act 2023</span>
                    <span className="doc-tag">GDPR Compliant</span>
                  </div>
                </div>
              </div>

              <div className="doc-alert info">
                <AlertCircle size={20} />
                <span>This Privacy Policy explains how {brandName} AI Platform collects, uses, and protects your personal data in compliance with global privacy regulations.</span>
              </div>

              {/* INTRODUCTION */}
              <section
                ref={(el) => sectionRefs.current.introduction = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">1. Introduction & Scope</h3>
                <p className="doc-section-text">
                  This Privacy Policy ("Policy") describes how {brandName} Technologies Pvt. Ltd. ("we," "us," or "our") collects, uses, processes, stores, and protects your personal data when you use our AI-driven influencer marketing platform. This Policy applies to all users including Brands, Influencers, Creators, and visitors to our platform.
                </p>
                <p className="doc-section-text">
                  We are committed to protecting your privacy and complying with all applicable data protection laws including India's Digital Personal Data Protection Act, 2023 (DPDP), European Union's General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and other global privacy standards.
                </p>
                <div className="doc-notice warning">
                  <ShieldAlert size={20} />
                  <div>
                    <strong>Consent & Acceptance</strong>
                    <p>By using {brandName} platform, you consent to the data practices described in this Policy. If you do not agree, please do not use our services.</p>
                  </div>
                </div>
              </section>

              {/* DATA COLLECTION */}
              <section
                ref={(el) => sectionRefs.current['data-collection'] = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">2. Data We Collect</h3>

                <div className="doc-data-collection">
                  <div className="doc-data-category">
                    <div className="doc-category-header">
                      <Briefcase size={24} />
                      <h4>From Brands & Businesses</h4>
                    </div>
                    <div className="doc-data-list">
                      <div className="doc-data-item">
                        <div className="doc-data-icon" style={{ backgroundColor: '#3b82f6' }}>
                          <Building size={16} />
                        </div>
                        <div className="doc-data-content">
                          <h5>Business Information</h5>
                          <p>Company name, registration details, GSTIN, PAN, tax information, business address</p>
                        </div>
                      </div>
                      <div className="doc-data-item">
                        <div className="doc-data-icon" style={{ backgroundColor: '#3b82f6' }}>
                          <User size={16} />
                        </div>
                        <div className="doc-data-content">
                          <h5>Contact Information</h5>
                          <p>Name, email, phone number, job title, professional details</p>
                        </div>
                      </div>
                      <div className="doc-data-item">
                        <div className="doc-data-icon" style={{ backgroundColor: '#3b82f6' }}>
                          <CreditCard size={16} />
                        </div>
                        <div className="doc-data-content">
                          <h5>Payment Information</h5>
                          <p>Billing details, payment methods, transaction history, invoice records</p>
                        </div>
                      </div>
                      <div className="doc-data-item">
                        <div className="doc-data-icon" style={{ backgroundColor: '#3b82f6' }}>
                          <BarChart3 size={16} />
                        </div>
                        <div className="doc-data-content">
                          <h5>Campaign Data</h5>
                          <p>Campaign briefs, performance metrics, influencer interactions, ROI analytics</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="doc-data-category">
                    <div className="doc-category-header">
                      <Smartphone size={24} />
                      <h4>From Influencers & Creators</h4>
                    </div>
                    <div className="doc-data-list">
                      <div className="doc-data-item">
                        <div className="doc-data-icon" style={{ backgroundColor: '#3b82f6' }}>
                          <Users size={16} />
                        </div>
                        <div className="doc-data-content">
                          <h5>Profile Information</h5>
                          <p>Name, bio, profile pictures, contact details, demographic information</p>
                        </div>
                      </div>
                      <div className="doc-data-item">
                        <div className="doc-data-icon" style={{ backgroundColor: '#3b82f6' }}>
                          <BarChart3 size={16} />
                        </div>
                        <div className="doc-data-content">
                          <h5>Performance Metrics</h5>
                          <p>Follower counts, engagement rates, content analytics, audience demographics</p>
                        </div>
                      </div>
                      <div className="doc-data-item">
                        <div className="doc-data-icon" style={{ backgroundColor: '#3b82f6' }}>
                          <Shield size={16} />
                        </div>
                        <div className="doc-data-content">
                          <h5>KYC Documents</h5>
                          <p>Identity verification, address proof, tax documents for payment processing</p>
                        </div>
                      </div>
                      <div className="doc-data-item">
                        <div className="doc-data-icon" style={{ backgroundColor: '#3b82f6' }}>
                          <CreditCard size={16} />
                        </div>
                        <div className="doc-data-content">
                          <h5>Payment Details</h5>
                          <p>Bank account information, UPI IDs, payment preferences, tax information</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="doc-data-category">
                  <div className="doc-category-header">
                    <Database size={24} />
                    <h4>Automatically Collected Data</h4>
                  </div>
                  <div className="doc-data-grid">
                    <div className="doc-auto-data">
                      <h5>Technical Data</h5>
                      <p>IP addresses, device information, browser type, operating system, usage patterns</p>
                    </div>
                    <div className="doc-auto-data">
                      <h5>Platform Usage</h5>
                      <p>Pages visited, features used, time spent, interaction patterns, search queries</p>
                    </div>
                    <div className="doc-auto-data">
                      <h5>Location Data</h5>
                      <p>Approximate location (city/country level) based on IP address for compliance</p>
                    </div>
                    <div className="doc-auto-data">
                      <h5>Cookies & Tracking</h5>
                      <p>Session cookies, authentication tokens, analytics cookies, preference settings</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* AI PROCESSING */}
              <section
                ref={(el) => sectionRefs.current['ai-processing'] = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">3. AI Data Processing</h3>

                <div className="doc-notice info">
                  <Server size={20} />
                  <div>
                    <strong>AI Processing Transparency</strong>
                    <p>Our AI models process anonymized data for matching algorithms. Personal identifiers are removed before AI training and processing.</p>
                  </div>
                </div>

                <div className="doc-ai-processing">
                  <div className="doc-ai-process">
                    <h4>Data Anonymization</h4>
                    <p>All personal data is pseudonymized before being used for AI training. We use hashing techniques to remove direct identifiers.</p>
                  </div>
                  <div className="doc-ai-process">
                    <h4>Purpose Limitation</h4>
                    <p>AI only processes data for specific purposes: influencer matching, campaign optimization, fraud detection, and performance prediction.</p>
                  </div>
                  <div className="doc-ai-process">
                    <h4>Data Minimization</h4>
                    <p>We collect only necessary data for AI operations. Unnecessary data points are excluded from training datasets.</p>
                  </div>
                  <div className="doc-ai-process">
                    <h4>Bias Mitigation</h4>
                    <p>Regular audits of AI algorithms to identify and mitigate potential biases in data processing.</p>
                  </div>
                </div>
              </section>

              {/* DATA USAGE */}
              <section
                ref={(el) => sectionRefs.current['data-usage'] = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">4. How We Use Your Data</h3>

                <div className="doc-usage-grid">
                  <div className="doc-usage-card">
                    <div className="doc-usage-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <Target size={20} />
                    </div>
                    <h5>Service Delivery</h5>
                    <p>Provide platform features, process transactions, manage campaigns, facilitate collaborations</p>
                  </div>
                  <div className="doc-usage-card">
                    <div className="doc-usage-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <Rocket size={20} />
                    </div>
                    <h5>AI Optimization</h5>
                    <p>Improve matching algorithms, predict campaign success, optimize content recommendations</p>
                  </div>
                  <div className="doc-usage-card">
                    <div className="doc-usage-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <ShieldCheck size={20} />
                    </div>
                    <h5>Security & Compliance</h5>
                    <p>Fraud detection, identity verification, regulatory compliance, data protection</p>
                  </div>
                  <div className="doc-usage-card">
                    <div className="doc-usage-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <MessageCircle size={20} />
                    </div>
                    <h5>Communication</h5>
                    <p>Platform updates, campaign notifications, support responses, policy changes</p>
                  </div>
                  <div className="doc-usage-card">
                    <div className="doc-usage-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <BarChart3 size={20} />
                    </div>
                    <h5>Analytics & Improvement</h5>
                    <p>Platform performance analysis, feature enhancement, user experience optimization</p>
                  </div>
                  <div className="doc-usage-card">
                    <div className="doc-usage-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <Bell size={20} />
                    </div>
                    <h5>Personalization</h5>
                    <p>Customized recommendations, personalized content, targeted suggestions</p>
                  </div>
                </div>
              </section>

              {/* DATA RIGHTS */}
              <section
                ref={(el) => sectionRefs.current['data-rights'] = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">5. Your Data Rights</h3>

                <div className="doc-rights-grid">
                  <div className="doc-right-card">
                    <div className="doc-right-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <Eye size={20} />
                    </div>
                    <h5>Right to Access</h5>
                    <p>Request access to your personal data and information about how we use it</p>
                  </div>
                  <div className="doc-right-card">
                    <div className="doc-right-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <RefreshCw size={20} />
                    </div>
                    <h5>Right to Correction</h5>
                    <p>Request correction of inaccurate or incomplete personal data</p>
                  </div>
                  <div className="doc-right-card">
                    <div className="doc-right-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <Trash2 size={20} />
                    </div>
                    <h5>Right to Erasure</h5>
                    <p>Request deletion of your personal data under certain conditions</p>
                  </div>
                  <div className="doc-right-card">
                    <div className="doc-right-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <Download size={20} />
                    </div>
                    <h5>Right to Portability</h5>
                    <p>Receive your data in structured, commonly used, machine-readable format</p>
                  </div>
                  <div className="doc-right-card">
                    <div className="doc-right-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <EyeOff size={20} />
                    </div>
                    <h5>Right to Object</h5>
                    <p>Object to processing of your personal data for specific purposes</p>
                  </div>
                  <div className="doc-right-card">
                    <div className="doc-right-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <Settings size={20} />
                    </div>
                    <h5>Right to Restrict</h5>
                    <p>Request restriction of processing your personal data</p>
                  </div>
                </div>
              </section>

              {/* DPDP RIGHTS */}
              <section
                ref={(el) => sectionRefs.current['dpdp-rights'] = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">6. India DPDP Act 2023 Rights</h3>

                <div className="doc-dpdp-compliance">
                  <div className="doc-dpdp-feature">
                    <CheckCircle size={20} color="#10b981" />
                    <div>
                      <h5>Consent Manager Integration</h5>
                      <p>Integrated with India's consent manager framework for granular consent management</p>
                    </div>
                  </div>
                  <div className="doc-dpdp-feature">
                    <CheckCircle size={20} color="#10b981" />
                    <div>
                      <h5>Data Principal Rights</h5>
                      <p>Full implementation of rights for Indian data principals as per DPDP Act</p>
                    </div>
                  </div>
                  <div className="doc-dpdp-feature">
                    <CheckCircle size={20} color="#10b981" />
                    <div>
                      <h5>Data Fiduciary Obligations</h5>
                      <p>Compliance with all data fiduciary responsibilities including breach notification</p>
                    </div>
                  </div>
                  <div className="doc-dpdp-feature">
                    <CheckCircle size={20} color="#10b981" />
                    <div>
                      <h5>Significant Data Fiduciary</h5>
                      <p>Appointment of Data Protection Officer and independent data auditor</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* INTERNATIONAL COMPLIANCE */}
              <section
                ref={(el) => sectionRefs.current.international = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">7. International Compliance</h3>

                <div className="doc-compliance-grid">
                  <div className="doc-compliance-card">
                    <div className="doc-compliance-header">
                      <Globe size={24} />
                      <h4>EU GDPR Compliance</h4>
                    </div>
                    <ul>
                      <li>Standard Contractual Clauses for data transfer</li>
                      <li>Data Protection Impact Assessments</li>
                      <li>Right to be Forgotten implementation</li>
                      <li>72-hour breach notification</li>
                    </ul>
                  </div>
                  <div className="doc-compliance-card">
                    <div className="doc-compliance-header">
                      <ShieldCheck size={24} />
                      <h4>US CCPA Compliance</h4>
                    </div>
                    <ul>
                      <li>"Do Not Sell My Personal Information" option</li>
                      <li>Opt-out of data sharing for advertising</li>
                      <li>Non-discrimination for exercising rights</li>
                      <li>Household data protection</li>
                    </ul>
                  </div>
                  <div className="doc-compliance-card">
                    <div className="doc-compliance-header">
                      <Shield size={24} />
                      <h4>India DPDP Compliance</h4>
                    </div>
                    <ul>
                      <li>Data localization for Indian users</li>
                      <li>Consent manager integration</li>
                      <li>Grievance redressal mechanism</li>
                      <li>Age verification for children</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* DATA SECURITY */}
              <section
                ref={(el) => sectionRefs.current['data-security'] = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">8. Data Security Measures</h3>

                <div className="doc-security-features">
                  <div className="doc-security-feature">
                    <h5>Encryption</h5>
                    <p>AES-256 encryption for data at rest and TLS 1.3 for data in transit</p>
                  </div>
                  <div className="doc-security-feature">
                    <h5>Access Controls</h5>
                    <p>Role-based access controls, multi-factor authentication, IP whitelisting</p>
                  </div>
                  <div className="doc-security-feature">
                    <h5>Regular Audits</h5>
                    <p>Security audits, vulnerability assessments, penetration testing</p>
                  </div>
                  <div className="doc-security-feature">
                    <h5>Incident Response</h5>
                    <p>24/7 security monitoring, incident response team, breach notification procedures</p>
                  </div>
                </div>
              </section>

              {/* COOKIES */}
              <section
                ref={(el) => sectionRefs.current.cookies = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">9. Cookies & Tracking Technologies</h3>

                <div className="doc-cookies-table">
                  <div className="doc-cookie-row header">
                    <div>Cookie Type</div>
                    <div>Purpose</div>
                    <div>Duration</div>
                  </div>
                  <div className="doc-cookie-row">
                    <div><strong>Essential</strong></div>
                    <div>Authentication, security, session management</div>
                    <div>Session</div>
                  </div>
                  <div className="doc-cookie-row">
                    <div><strong>Functional</strong></div>
                    <div>Preferences, settings, language selection</div>
                    <div>1 year</div>
                  </div>
                  <div className="doc-cookie-row">
                    <div><strong>Analytics</strong></div>
                    <div>Usage statistics, performance monitoring</div>
                    <div>2 years</div>
                  </div>
                  <div className="doc-cookie-row">
                    <div><strong>Advertising</strong></div>
                    <div>Campaign performance, targeting (opt-in)</div>
                    <div>1 year</div>
                  </div>
                </div>
              </section>

              {/* DATA RETENTION */}
              <section
                ref={(el) => sectionRefs.current['data-retention'] = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">10. Data Retention Periods</h3>

                <div className="doc-retention-grid">
                  <div className="doc-retention-item">
                    <h5>Account Data</h5>
                    <p>Retained for 5 years after account closure for compliance</p>
                  </div>
                  <div className="doc-retention-item">
                    <h5>Financial Records</h5>
                    <p>Retained for 7 years as per tax and accounting regulations</p>
                  </div>
                  <div className="doc-retention-item">
                    <h5>Campaign Data</h5>
                    <p>Retained for 3 years for analytics and dispute resolution</p>
                  </div>
                  <div className="doc-retention-item">
                    <h5>Inactive Accounts</h5>
                    <p>Data anonymized after 2 years of inactivity</p>
                  </div>
                </div>
              </section>

              {/* DATA SHARING */}
              <section
                ref={(el) => sectionRefs.current['data-sharing'] = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">11. Data Sharing & Third Parties</h3>

                <div className="doc-sharing-info">
                  <div className="doc-sharing-category">
                    <h5>Service Providers</h5>
                    <p>Payment processors, cloud hosting, analytics providers (under strict DPAs)</p>
                  </div>
                  <div className="doc-sharing-category">
                    <h5>Legal Requirements</h5>
                    <p>Government authorities, law enforcement (when legally required)</p>
                  </div>
                  <div className="doc-sharing-category">
                    <h5>Business Transfers</h5>
                    <p>In case of merger, acquisition, or asset sale (with user notification)</p>
                  </div>
                  <div className="doc-sharing-category">
                    <h5>With Consent</h5>
                    <p>For specific purposes with explicit user consent</p>
                  </div>
                </div>
              </section>

              {/* CHILDREN'S PRIVACY */}
              <section
                ref={(el) => sectionRefs.current.children = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">12. Children's Privacy</h3>
                <p className="doc-section-text">
                  {brandName} platform is not intended for children under 18 years of age. We do not knowingly collect personal data from children. If we become aware that we have collected personal data from a child without parental consent, we will take steps to delete that information.
                </p>
                <p className="doc-section-text">
                  For users in India under 18, we implement age verification and require parental consent as per DPDP Act requirements.
                </p>
              </section>

              {/* UPDATES */}
              <section
                ref={(el) => sectionRefs.current.updates = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">13. Policy Updates</h3>
                <p className="doc-section-text">
                  We may update this Privacy Policy periodically to reflect changes in our practices, services, or legal requirements. We will notify you of significant changes through email notifications or platform announcements.
                </p>
                <p className="doc-section-text">
                  The "Last updated" date at the top of this page indicates when this Policy was last revised. We encourage you to review this Policy periodically.
                </p>
              </section>

              {/* CONTACT */}
              <section
                ref={(el) => sectionRefs.current.contact = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">14. Contact Data Protection Officer</h3>

                <div className="doc-contact-box">
                  <div className="doc-contact-section">
                    <h4>Data Protection Officer</h4>
                    <p><Mail size={16} /> dpo@{brandName.toLowerCase()}.ai</p>
                    <p><Phone size={16} /> +91-80-XXXX-XXXX</p>
                  </div>
                  <div className="doc-contact-section">
                    <h4>Registered Office</h4>
                    <p><MapPin size={16} /> {brandName} Technologies Pvt. Ltd.</p>
                    <p>#123, Tech Park, Bangalore, Karnataka 560001, India</p>
                  </div>
                  <div className="doc-contact-section">
                    <h4>Grievance Officer (India)</h4>
                    <p><Mail size={16} /> grievance@{brandName.toLowerCase()}.ai</p>
                    <p>Response within 30 days as per DPDP Act requirements</p>
                  </div>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="doc-actions">
                <button className="doc-secondary-btn" onClick={handlePrint}>
                  <Printer size={18} />
                  <span>Print Policy</span>
                </button>
                {/* <button className="doc-primary-btn">
                  <FileSignature size={18} />
                  <span>Download Policy PDF</span>
                </button> */}
              </div>

              {/* Quick Links */}
              {/* <section className="doc-quick-links">
                <h3 className="doc-section-title">Privacy Resources</h3>
                <div className="doc-quick-grid">
                  <a href="#cookie-policy" className="doc-quick-card">
                    <div className="doc-quick-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <Cookie size={32} />
                    </div>
                    <h4>Cookie Policy</h4>
                  </a>
                  <a href="#data-request" className="doc-quick-card">
                    <div className="doc-quick-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <FileText size={32} />
                    </div>
                    <h4>Data Request Form</h4>
                  </a>
                  <a href="#security" className="doc-quick-card">
                    <div className="doc-quick-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <ShieldCheck size={32} />
                    </div>
                    <h4>Security Overview</h4>
                  </a>
                  <a href="#faq" className="doc-quick-card">
                    <div className="doc-quick-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <MessageCircle size={32} />
                    </div>
                    <h4>Privacy FAQ</h4>
                  </a>
                </div>
              </section> */}
            </main>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        className="doc-back-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowUp size={20} />
      </button>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .doc-wrapper { width: 100%; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; }
        .doc-hero { background: #3b82f6; padding: 80px 20px; text-align: center; }
        .doc-hero-content { max-width: 800px; margin: 0 auto; }
        .doc-brand-header { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 20px; }
        .doc-brand-logo { height: 60px; width: auto; object-fit: contain; }
        .doc-hero-title { font-size: 48px; font-weight: 700; color: white; margin-bottom: 16px; }
        .doc-hero-subtitle { font-size: 18px; color: rgba(255,255,255,0.95); line-height: 1.7; margin-bottom: 40px; }
        .doc-search-wrapper { position: relative; max-width: 500px; margin: 0 auto; }
        .doc-search-input { width: 100%; padding: 16px 60px 16px 20px; border: none; border-radius: 12px; font-size: 15px; outline: none; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .doc-search-btn { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .doc-main { padding: 40px 0; }
        .doc-container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }
        .doc-layout { display: grid; grid-template-columns: 280px 1fr; gap: 40px; }
        .doc-sidebar { position: sticky; top: 20px; height: fit-content; background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: 0.3s; }
        .doc-sidebar-toggle { position: absolute; top: 20px; right: -12px; width: 24px; height: 24px; background: white; border: 1px solid #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 10; }
        .doc-sidebar.closed { transform: translateX(-100%); }
        .doc-sidebar-header h3 { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 24px; }
        .doc-nav { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
        .doc-nav-item { width: 100%; padding: 12px 16px; background: transparent; border: none; border-radius: 8px; display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; text-align: left; transition: 0.2s; }
        .doc-nav-item:hover { background: #f1f5f9; color: #1e293b; }
        .doc-nav-item.active { background: #eff6ff; color: #3b82f6; }
        .doc-nav-item svg { flex-shrink: 0; }
        
        .doc-compliance-badges { margin-bottom: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; }
        .doc-compliance-title { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
        .doc-badges-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
        .doc-badge { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: white; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; color: #475569; }
        
        .doc-quick-actions { margin-bottom: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; }
        .doc-quick-title { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
        .doc-action-buttons { display: flex; flex-direction: column; gap: 8px; }
        .doc-action-btn { width: 100%; padding: 8px 12px; background: white; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; gap: 8px; font-size: 12px; color: #475569; cursor: pointer; transition: 0.2s; }
        .doc-action-btn:hover { background: #f1f5f9; border-color: #3b82f6; }
        
        .doc-resources { padding-top: 24px; border-top: 1px solid #e2e8f0; }
        .doc-resources-title { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
        .doc-resources-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .doc-resources-list a { font-size: 14px; color: #3b82f6; text-decoration: none; transition: 0.2s; }
        .doc-resources-list a:hover { color: #2563eb; text-decoration: underline; }
        
        .doc-content { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .doc-content-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .doc-header-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
        .doc-content-title { font-size: 32px; font-weight: 700; color: #1e293b; }
        .doc-tags { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
        .doc-tag { padding: 4px 12px; background: #f1f5f9; color: #475569; font-size: 12px; border-radius: 16px; font-weight: 500; }
        
        .doc-section { margin-bottom: 48px; }
        .doc-section-title { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
        .doc-section-text { font-size: 16px; color: #64748b; line-height: 1.7; margin-bottom: 16px; }
        
        .doc-alert { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        .doc-alert.info { background: #eff6ff; border-left: 4px solid #3b82f6; }
        
        .doc-notice { padding: 16px; border-radius: 8px; margin: 16px 0; display: flex; gap: 12px; align-items: flex-start; }
        .doc-notice.warning { background: #fffbeb; border-left: 4px solid #f59e0b; }
        
        .doc-data-collection { display: flex; flex-direction: column; gap: 32px; margin: 24px 0; }
        .doc-data-category { background: #f8fafc; border-radius: 12px; padding: 24px; }
        .doc-category-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .doc-category-header h4 { font-size: 18px; font-weight: 600; color: #1e293b; }
        .doc-data-list { display: flex; flex-direction: column; gap: 16px; }
        .doc-data-item { display: flex; gap: 16px; }
        .doc-data-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
        .doc-data-content h5 { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 4px; }
        .doc-data-content p { font-size: 14px; color: #64748b; line-height: 1.6; }
        
        .doc-data-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 16px; }
        .doc-auto-data { padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0; }
        .doc-auto-data h5 { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .doc-auto-data p { font-size: 13px; color: #64748b; line-height: 1.5; }
        
        .doc-ai-processing { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 24px 0; }
        .doc-ai-process { padding: 20px; background: #f8fafc; border-radius: 8px; }
        .doc-ai-process h4 { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .doc-ai-process p { font-size: 14px; color: #64748b; line-height: 1.6; }
        
        .doc-usage-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin: 24px 0; }
        .doc-usage-card { padding: 24px; background: #f8fafc; border-radius: 12px; text-align: center; }
        .doc-usage-icon { width: 48px; height: 48px; margin: 0 auto 16px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; }
        .doc-usage-card h5 { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .doc-usage-card p { font-size: 14px; color: #64748b; line-height: 1.6; }
        
        .doc-rights-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 24px 0; }
        .doc-right-card { padding: 24px; background: #f8fafc; border-radius: 12px; text-align: center; }
        .doc-right-icon { width: 48px; height: 48px; margin: 0 auto 16px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; }
        .doc-right-card h5 { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .doc-right-card p { font-size: 14px; color: #64748b; line-height: 1.6; }
        
        .doc-dpdp-compliance { display: flex; flex-direction: column; gap: 16px; margin: 24px 0; }
        .doc-dpdp-feature { display: flex; gap: 16px; padding: 16px; background: #f0fdf4; border-radius: 8px; }
        .doc-dpdp-feature h5 { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 4px; }
        .doc-dpdp-feature p { font-size: 14px; color: #64748b; line-height: 1.6; }
        
        .doc-compliance-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin: 24px 0; }
        .doc-compliance-card { padding: 24px; background: #f8fafc; border-radius: 12px; }
        .doc-compliance-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .doc-compliance-header h4 { font-size: 18px; font-weight: 600; color: #1e293b; }
        .doc-compliance-card ul { list-style: none; padding-left: 0; }
        .doc-compliance-card li { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 8px; padding-left: 20px; position: relative; }
        .doc-compliance-card li:before { content: "•"; color: #3b82f6; position: absolute; left: 0; }
        
        .doc-security-features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 24px 0; }
        .doc-security-feature { padding: 20px; background: #f8fafc; border-radius: 8px; }
        .doc-security-feature h5 { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .doc-security-feature p { font-size: 14px; color: #64748b; line-height: 1.6; }
        
        .doc-cookies-table { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin: 24px 0; }
        .doc-cookie-row { display: grid; grid-template-columns: 1fr 2fr 1fr; border-bottom: 1px solid #e2e8f0; }
        .doc-cookie-row.header { background: #f8fafc; font-weight: 600; color: #1e293b; }
        .doc-cookie-row.header div { padding: 12px 16px; }
        .doc-cookie-row div { padding: 16px; font-size: 14px; color: #64748b; }
        .doc-cookie-row:last-child { border-bottom: none; }
        
        .doc-retention-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 24px 0; }
        .doc-retention-item { padding: 20px; background: #f8fafc; border-radius: 8px; }
        .doc-retention-item h5 { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .doc-retention-item p { font-size: 14px; color: #64748b; line-height: 1.6; }
        
        .doc-sharing-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 24px 0; }
        .doc-sharing-category { padding: 20px; background: #f8fafc; border-radius: 8px; }
        .doc-sharing-category h5 { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .doc-sharing-category p { font-size: 14px; color: #64748b; line-height: 1.6; }
        
        .doc-contact-box { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 32px; background: #f8fafc; padding: 24px; border-radius: 12px; margin: 16px 0; }
        .doc-contact-section h4 { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
        .doc-contact-section p { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #64748b; margin-bottom: 8px; }
        
        .doc-actions { display: flex; justify-content: space-between; margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
        .doc-primary-btn { padding: 12px 32px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.2s; }
        .doc-primary-btn:hover { background: #2563eb; }
        .doc-secondary-btn { padding: 12px 32px; background: transparent; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.2s; }
        .doc-secondary-btn:hover { background: #f1f5f9; }
        
        .doc-quick-links { margin-top: 60px; padding-top: 40px; border-top: 2px solid #e2e8f0; }
        .doc-quick-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 24px; }
        .doc-quick-card { padding: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; text-decoration: none; transition: 0.3s; }
        .doc-quick-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); border-color: #3b82f6; }
        .doc-quick-icon { width: 56px; height: 56px; margin: 0 auto 16px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
        .doc-quick-card h4 { font-size: 16px; font-weight: 600; color: #1e293b; }
        
        .doc-back-to-top { position: fixed; bottom: 24px; right: 24px; width: 48px; height: 48px; background: #3b82f6; color: white; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: 0.2s; }
        .doc-back-to-top:hover { background: #2563eb; transform: translateY(-2px); }
        
        @media (max-width: 1024px) {
          .doc-layout { grid-template-columns: 1fr; }
          .doc-sidebar { position: relative; }
          .doc-quick-grid { grid-template-columns: repeat(2, 1fr); }
          .doc-usage-grid, .doc-rights-grid { grid-template-columns: repeat(2, 1fr); }
          .doc-compliance-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .doc-hero-title { font-size: 32px; }
          .doc-content { padding: 24px; }
          .doc-content-title { font-size: 24px; }
          .doc-quick-grid { grid-template-columns: 1fr; }
          .doc-actions { flex-direction: column; gap: 16px; }
          .doc-primary-btn, .doc-secondary-btn { justify-content: center; }
          .doc-usage-grid, .doc-rights-grid { grid-template-columns: 1fr; }
          .doc-cookie-row { grid-template-columns: 1fr; }
          .doc-data-item { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;