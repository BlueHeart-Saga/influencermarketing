import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Rocket, 
  Lock, 
  Users, 
  Target, 
  BarChart3, 
  AlertCircle, 
  FileCode, 
  MessageCircle, 
  BookOpen, 
  Code, 
  Github, 
  Database, 
  Copy, 
  Check,
  Printer,
  FileText,
  Scale,
  Shield,
  UserCheck,
  DollarSign,
  Percent,
  Globe,
  Calendar,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  FileSignature
} from 'lucide-react';

const TermsAndConditions = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const sectionRefs = useRef({});

  const sections = [
    { id: 'introduction', title: 'Introduction & Acceptance', icon: <FileText size={18} /> },
    { id: 'definitions', title: 'Definitions & Platform Roles', icon: <Scale size={18} /> },
    { id: 'eligibility', title: 'Eligibility & Registration', icon: <UserCheck size={18} /> },
    { id: 'user-roles', title: 'User Responsibilities', icon: <Users size={18} /> },
    { id: 'ai-services', title: 'AI Services Disclaimer', icon: <AlertCircle size={18} /> },
    { id: 'campaigns', title: 'Campaign Creation', icon: <Target size={18} /> },
    { id: 'contracts', title: 'Digital Contracts', icon: <FileSignature size={18} /> },
    { id: 'payments', title: 'Payments & Fees', icon: <DollarSign size={18} /> },
    { id: 'taxes', title: 'Taxes & Compliance', icon: <Percent size={18} /> },
    { id: 'content-rights', title: 'Content Ownership', icon: <Shield size={18} /> },
    { id: 'prohibited', title: 'Prohibited Activities', icon: <AlertCircle size={18} /> },
    { id: 'termination', title: 'Termination', icon: <Lock size={18} /> },
    { id: 'confidentiality', title: 'Confidentiality', icon: <Shield size={18} /> },
    { id: 'privacy', title: 'Privacy & Data', icon: <Shield size={18} /> },
    { id: 'disclaimers', title: 'Disclaimers', icon: <AlertCircle size={18} /> },
    { id: 'indemnification', title: 'Indemnification', icon: <FileText size={18} /> },
    { id: 'governing-law', title: 'Governing Law', icon: <Globe size={18} /> },
    { id: 'modifications', title: 'Modifications', icon: <Calendar size={18} /> },
    { id: 'force-majeure', title: 'Force Majeure', icon: <AlertCircle size={18} /> },
    { id: 'contact', title: 'Contact', icon: <MessageCircle size={18} /> }
  ];

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

  const handleAcceptTerms = () => {
    localStorage.setItem('quickbox-terms-accepted', new Date().toISOString());
    setAccepted(true);
    setShowAcceptDialog(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="doc-wrapper">
      {/* Hero Section */}
      <section className="doc-hero">
        <div className="doc-hero-content">
          <h1 className="doc-hero-title">Terms & Conditions</h1>
          <p className="doc-hero-subtitle">
            Legal agreement governing your use of Brio AI Influencer Platform.<br />
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <div className="doc-search-wrapper">
            <input 
              type="text" 
              placeholder="Search terms..." 
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
              {/* <button 
                className="doc-sidebar-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button> */}

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

              {/* Important Notice */}
              <div className="doc-api-key-section">
                <h4 className="doc-api-key-title">Important Notice</h4>
                <div className="doc-api-key-box">
                  <code>By using Brio, you agree to these Terms & Conditions and all referenced policies.</code>
                </div>
                <button 
                  className="doc-copy-btn" 
                  onClick={() => setShowAcceptDialog(true)}
                >
                  <FileSignature size={16} />
                  <span>Review & Accept</span>
                </button>
              </div>

              {/* Resources */}
              {/* <div className="doc-resources">
                <h4 className="doc-resources-title">Related Documents</h4>
                <ul className="doc-resources-list">
                  <li><a href="#privacy-policy">Privacy Policy</a></li>
                  <li><a href="#payment-policy">Payment Policy</a></li>
                  <li><a href="#cookie-policy">Cookie Policy</a></li>
                  <li><a href="#api-terms">API Terms</a></li>
                </ul>
              </div> */}
            </aside>

            {/* Content Area */}
            <main className="doc-content">
              {/* Header */}
              <div className="doc-content-header">
                <div className="doc-header-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' }}>
                  <Scale size={32} />
                </div>
                <div>
                  <h2 className="doc-content-title">Terms & Conditions</h2>
                  <div className="doc-tags">
                    <span className="doc-tag">Legal Document</span>
                    <span className="doc-tag">Binding Agreement</span>
                    <span className="doc-tag">AI Platform Terms</span>
                  </div>
                </div>
              </div>

              {accepted && (
                <div className="doc-alert success">
                  <Check size={20} />
                  <span>You have accepted the Terms & Conditions on {new Date().toLocaleDateString()}</span>
                </div>
              )}

              <div className="doc-alert info">
                <AlertCircle size={20} />
                <span>By using Brio AI Influencer Platform, you agree to these Terms & Conditions.</span>
              </div>

              {/* INTRODUCTION */}
              <section 
                ref={(el) => sectionRefs.current.introduction = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">1. Introduction & Acceptance of Terms</h3>
                <p className="doc-section-text">
                  Welcome to <strong>Brio</strong> ("Platform," "we," "us," or "our"), an AI-driven influencer marketing platform connecting Brands, Influencers, and Creators. These Terms & Conditions ("Terms") govern your access to and use of our SaaS platform, including all AI tools, matching algorithms, contract management, payment systems, and related services.
                </p>
                <p className="doc-section-text">
                  By registering an account, clicking "I Accept," or accessing any Brio services, you ("User," "Brand," "Influencer," or "you") acknowledge that you have read, understood, and agree to be legally bound by these Terms, our Privacy Policy, and Payment Policy. If you are entering into these Terms on behalf of a company or legal entity, you represent that you have the authority to bind such entity.
                </p>
                <div className="doc-notice warning">
                  <strong>Binding Agreement:</strong> These Terms constitute a legally binding contract between you and Brio Technologies Pvt. Ltd. Please review carefully before acceptance.
                </div>
              </section>

              {/* DEFINITIONS */}
              <section 
                ref={(el) => sectionRefs.current.definitions = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">2. Definitions & Platform Roles</h3>
                
                <div className="doc-definition-box">
                  <h4>Key Definitions</h4>
                  <div className="doc-definition-grid">
                    <div className="doc-definition-item">
                      <h5>Platform</h5>
                      <p>Brio AI Influencer Marketing SaaS platform, including all software, algorithms, and services.</p>
                    </div>
                    <div className="doc-definition-item">
                      <h5>Brand</h5>
                      <p>Registered business entities creating and funding marketing campaigns.</p>
                    </div>
                    <div className="doc-definition-item">
                      <h5>Influencer/Creator</h5>
                      <p>Content creators registered to participate in campaigns.</p>
                    </div>
                    <div className="doc-definition-item">
                      <h5>AI Services</h5>
                      <p>Our proprietary algorithms for matching, analytics, content suggestions, and automation.</p>
                    </div>
                    <div className="doc-definition-item">
                      <h5>Campaign</h5>
                      <p>Brand-initiated marketing project with defined deliverables, timeline, and budget.</p>
                    </div>
                    <div className="doc-definition-item">
                      <h5>Digital Contract</h5>
                      <p>Legally binding agreement between Brand and Influencer, facilitated by Brio.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* ELIGIBILITY */}
              <section 
                ref={(el) => sectionRefs.current.eligibility = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">3. Eligibility & Account Registration</h3>
                <p className="doc-section-text">
                  To use Brio, you must be at least 18 years old and capable of forming legally binding contracts. Brands must provide valid business registration details. Influencers must provide authentic social media profiles with minimum engagement metrics as specified.
                </p>
                <p className="doc-section-text">
                  You agree to provide accurate, complete, and current information during registration and maintain updated profile details. Brio reserves the right to verify identity through third-party services and may reject applications at our discretion.
                </p>
              </section>

              {/* USER ROLES */}
              <section 
                ref={(el) => sectionRefs.current['user-roles'] = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">4. User Roles & Responsibilities</h3>
                
                <div className="doc-subsection">
                  <h4>4.1 Brands</h4>
                  <p className="doc-section-text">
                    Brands are responsible for: creating clear campaign briefs, timely review of submissions, prompt payment of approved invoices, compliance with advertising regulations, and respectful communication with influencers.
                  </p>
                </div>

                <div className="doc-subsection">
                  <h4>4.2 Influencers/Creators</h4>
                  <p className="doc-section-text">
                    Influencers must: provide authentic metrics, meet campaign deadlines, maintain content quality, disclose brand partnerships as required by law, and comply with platform and brand guidelines.
                  </p>
                </div>

                <div className="doc-subsection">
                  <h4>4.3 Platform (Brio)</h4>
                  <p className="doc-section-text">
                    Brio provides: AI matching technology, secure payment processing, contract facilitation, dispute resolution framework, platform maintenance, and customer support. We act as a facilitator, not a party to Brand-Influencer contracts.
                  </p>
                </div>
              </section>

              {/* AI SERVICES */}
              <section 
                ref={(el) => sectionRefs.current['ai-services'] = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">5. AI Services & Disclaimer</h3>
                
                <div className="doc-notice info">
                  <AlertCircle size={20} />
                  <div>
                    <strong>Important AI Limitations</strong>
                    <p>Our AI tools provide suggestions only. You retain full responsibility for campaign decisions, content creation, and compliance with laws. AI outputs may contain inaccuracies and should be verified independently.</p>
                  </div>
                </div>

                <p className="doc-section-text">
                  Brio utilizes artificial intelligence and machine learning algorithms for campaign matching, content suggestions, analytics insights, and automated workflows. You acknowledge that:
                </p>
                <ul className="doc-list">
                  <li>AI recommendations are suggestions only and do not constitute professional advice</li>
                  <li>Match scores and predictions are probabilistic, not guarantees</li>
                  <li>You must independently verify influencer metrics and campaign results</li>
                  <li>AI-generated content must comply with platform policies and applicable laws</li>
                </ul>
              </section>

              {/* CAMPAIGNS */}
              <section 
                ref={(el) => sectionRefs.current.campaigns = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">6. Campaign Creation & Influencer Applications</h3>
                <p className="doc-section-text">
                  Brands create campaigns with clear deliverables, timelines, compensation, and guidelines. Brio AI suggests suitable influencers based on multiple parameters. Influencers apply to campaigns, and Brands select applicants at their discretion.
                </p>
                <p className="doc-section-text">
                  Campaign terms cannot be modified after influencer acceptance without mutual agreement through platform tools.
                </p>
              </section>

              {/* CONTRACTS */}
              <section 
                ref={(el) => sectionRefs.current.contracts = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">7. Contracts, Approvals & Obligations</h3>
                <p className="doc-section-text">
                  Upon Brand selection, a Digital Contract is generated outlining deliverables, timelines, compensation, IP rights, and confidentiality terms. Both parties must electronically sign before work commences.
                </p>
                <p className="doc-section-text">
                  Brio facilitates contract management but is not a party to Brand-Influencer contracts. We provide standard templates but recommend independent legal review for complex campaigns.
                </p>
              </section>

              {/* PAYMENTS */}
              <section 
                ref={(el) => sectionRefs.current.payments = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">8. Payments, Platform Fees & Payouts</h3>
                
                <div className="doc-notice warning">
                  <DollarSign size={20} />
                  <div>
                    <strong>Payment Terms</strong>
                    <div className="doc-payment-grid">
                      <div className="doc-payment-item">
                        <span>Platform Fee</span>
                        <strong>15% of campaign value</strong>
                      </div>
                      <div className="doc-payment-item">
                        <span>Brand Payments</span>
                        <strong>Escrowed upon signing</strong>
                      </div>
                      <div className="doc-payment-item">
                        <span>Influencer Payouts</span>
                        <strong>Within 7 business days</strong>
                      </div>
                      <div className="doc-payment-item">
                        <span>Payment Disputes</span>
                        <strong>Raise within 48 hours</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="doc-section-text">
                  All payments are processed through our secure payment gateway. Brands must maintain sufficient funds in their Brio wallet for active campaigns. Influencer payouts are subject to KYC verification and platform review.
                </p>
              </section>

              {/* TAXES */}
              <section 
                ref={(el) => sectionRefs.current.taxes = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">9. Taxes, Compliance & KYC</h3>
                <p className="doc-section-text">
                  Users are solely responsible for all taxes, duties, and regulatory compliance related to their earnings and activities on Brio. We collect necessary KYC documents for payment processing and regulatory requirements.
                </p>
                <p className="doc-section-text">
                  Indian GST and international tax obligations are the responsibility of each user. Brio may issue Form 16A for Indian influencers as required by Income Tax Act.
                </p>
              </section>

              {/* CONTENT RIGHTS */}
              <section 
                ref={(el) => sectionRefs.current['content-rights'] = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">10. Content Ownership & License Rights</h3>
                <p className="doc-section-text">
                  Influencers retain ownership of their original content. By participating in campaigns, Influencers grant Brands a worldwide, royalty-free license to use submitted content for the purposes specified in the Digital Contract.
                </p>
                <p className="doc-section-text">
                  Brio receives a limited license to display campaign content for platform marketing and case studies.
                </p>
              </section>

              {/* PROHIBITED */}
              <section 
                ref={(el) => sectionRefs.current.prohibited = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">11. Prohibited Activities & Misuse</h3>
                <ul className="doc-list">
                  <li>Fake engagement, bot usage, or fraudulent metrics</li>
                  <li>Circumventing platform fees through direct payments</li>
                  <li>Intellectual property infringement</li>
                  <li>Harassment, hate speech, or illegal content</li>
                  <li>Misrepresentation of brand affiliation or identity</li>
                </ul>
              </section>

              {/* TERMINATION */}
              <section 
                ref={(el) => sectionRefs.current.termination = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">12. Suspension, Termination & Account Restriction</h3>
                
                <div className="doc-notice error">
                  <AlertCircle size={20} />
                  <div>
                    <strong>Immediate Termination Grounds</strong>
                    <p>We may suspend or terminate accounts immediately for: fraud, payment fraud, illegal activities, repeated policy violations, or security threats.</p>
                  </div>
                </div>

                <p className="doc-section-text">
                  Either party may terminate these Terms with 30 days written notice. Upon termination, all pending obligations must be fulfilled. Outstanding payments will be processed according to our Payment Policy.
                </p>
              </section>

              {/* CONFIDENTIALITY */}
              <section 
                ref={(el) => sectionRefs.current.confidentiality = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">13. Confidentiality & Data Usage</h3>
                <p className="doc-section-text">
                  Users agree to maintain confidentiality of proprietary information shared through the platform. Brio may use anonymized, aggregated data for AI model training and platform improvement.
                </p>
              </section>

              {/* PRIVACY */}
              <section 
                ref={(el) => sectionRefs.current.privacy = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">14. Privacy & Data Protection</h3>
                <p className="doc-section-text">
                  Our Privacy Policy governs data collection, processing, and protection. By using Brio, you consent to our data practices as described therein. We comply with applicable data protection laws including India's Digital Personal Data Protection Act, 2023.
                </p>
              </section>

              {/* DISCLAIMERS */}
              <section 
                ref={(el) => sectionRefs.current.disclaimers = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">15. Disclaimers & Limitation of Liability</h3>
                <p className="doc-section-text">
                  Brio IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE UNINTERRUPTED SERVICE, ACCURATE MATCHING, OR CAMPAIGN SUCCESS. OUR LIABILITY IS LIMITED TO THE PLATFORM FEES PAID IN THE LAST 6 MONTHS.
                </p>
                <p className="doc-section-text">
                  We are not liable for Brand-Influencer disputes, content quality, or third-party actions. AI tools may produce inaccurate or inappropriate outputs; users assume all related risks.
                </p>
              </section>

              {/* INDEMNIFICATION */}
              <section 
                ref={(el) => sectionRefs.current.indemnification = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">16. Indemnification</h3>
                <p className="doc-section-text">
                  You agree to indemnify and hold harmless Brio, its affiliates, and employees from any claims, damages, or losses arising from your breach of these Terms, violation of laws, or infringement of third-party rights.
                </p>
              </section>

              {/* GOVERNING LAW */}
              <section 
                ref={(el) => sectionRefs.current['governing-law'] = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">17. Governing Law & Jurisdiction</h3>
                <p className="doc-section-text">
                  These Terms are governed by the laws of India, without regard to conflict of law principles. Any disputes shall be subject to the exclusive jurisdiction of courts in Bangalore, Karnataka, India.
                </p>
                <p className="doc-section-text">
                  For international users, any legal proceedings may be conducted in English. We comply with applicable international regulations for cross-border data transfer and payments.
                </p>
              </section>

              {/* MODIFICATIONS */}
              <section 
                ref={(el) => sectionRefs.current.modifications = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">18. Modifications to Terms</h3>
                <p className="doc-section-text">
                  We may modify these Terms with 30 days notice via email or platform notification. Continued use after modifications constitutes acceptance. Material changes affecting payment terms or dispute resolution will require re-acceptance.
                </p>
              </section>

              {/* FORCE MAJEURE */}
              <section 
                ref={(el) => sectionRefs.current['force-majeure'] = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">19. Force Majeure</h3>
                <p className="doc-section-text">
                  We are not liable for delays or failures due to events beyond our reasonable control, including natural disasters, war, terrorism, government actions, internet failures, or third-party service outages.
                </p>
              </section>

              {/* CONTACT */}
              <section 
                ref={(el) => sectionRefs.current.contact = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">20. Contact Information</h3>
                
                <div className="doc-contact-box">
                  <div className="doc-contact-section">
                    <h4>Brio Technologies Pvt. Ltd.</h4>
                    <p><MapPin size={16} /> #123, Tech Park, Outer Ring Road</p>
                    <p>Bangalore, Karnataka 560001, India</p>
                  </div>
                  <div className="doc-contact-section">
                    <h4>Legal & Support</h4>
                    <p><Mail size={16} /> legal@Brio</p>
                    <p><Mail size={16} /> support@Brio</p>
                    <p><Phone size={16} /> +91-80-XXXX-XXXX</p>
                  </div>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="doc-actions">
                <button className="doc-secondary-btn" onClick={handlePrint}>
                  <Printer size={18} />
                  <span>Print Terms</span>
                </button>
                <button 
                  className="doc-primary-btn" 
                  onClick={() => setShowAcceptDialog(true)}
                >
                  <FileSignature size={18} />
                  <span>Accept Terms & Continue</span>
                </button>
              </div>

              {/* Quick Links */}
              {/* <section className="doc-quick-links">
                <h3 className="doc-section-title">Related Resources</h3>
                <div className="doc-quick-grid">
                  <a href="#privacy-policy" className="doc-quick-card">
                    <div className="doc-quick-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' }}>
                      <Shield size={32} />
                    </div>
                    <h4>Privacy Policy</h4>
                  </a>
                  <a href="#payment-policy" className="doc-quick-card">
                    <div className="doc-quick-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' }}>
                      <DollarSign size={32} />
                    </div>
                    <h4>Payment Policy</h4>
                  </a>
                  <a href="#api-terms" className="doc-quick-card">
                    <div className="doc-quick-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' }}>
                      <Code size={32} />
                    </div>
                    <h4>API Terms</h4>
                  </a>
                  <a href="#faq" className="doc-quick-card">
                    <div className="doc-quick-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' }}>
                      <MessageCircle size={32} />
                    </div>
                    <h4>FAQ & Help</h4>
                  </a>
                </div>
              </section> */}
            </main>
          </div>
        </div>
      </div>

      {/* Accept Terms Dialog */}
      {showAcceptDialog && (
        <div className="doc-modal-overlay">
          <div className="doc-modal">
            <div className="doc-modal-header">
              <h3>Accept Terms & Conditions</h3>
              <button onClick={() => setShowAcceptDialog(false)}>×</button>
            </div>
            <div className="doc-modal-content">
              <div className="doc-notice warning">
                <strong>Legal Acknowledgement Required</strong>
              </div>
              <p className="doc-section-text">
                By clicking "I Accept", you confirm that:
              </p>
              <ul className="doc-list">
                <li>You have read and understood all 20 sections</li>
                <li>You agree to be legally bound by these Terms</li>
                <li>You accept our Payment Policy and Privacy Policy</li>
                <li>You acknowledge the AI limitations and disclaimers</li>
              </ul>
              <div className="doc-signature-box">
                <p>Digital Signature: {new Date().toISOString()}</p>
              </div>
            </div>
            <div className="doc-modal-actions">
              <button 
                className="doc-secondary-btn"
                onClick={() => setShowAcceptDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="doc-primary-btn"
                onClick={handleAcceptTerms}
              >
                <Check size={18} />
                <span>I Accept & Agree</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
        .doc-hero { background: linear-gradient(135deg, #5DADE2 0%, #3b82f6 100%); padding: 80px 20px; text-align: center; }
        .doc-hero-content { max-width: 800px; margin: 0 auto; }
        .doc-hero-title { font-size: 48px; font-weight: 700; color: white; margin-bottom: 16px; }
        .doc-hero-subtitle { font-size: 18px; color: rgba(255,255,255,0.95); line-height: 1.7; margin-bottom: 40px; }
        .doc-search-wrapper { position: relative; max-width: 500px; margin: 0 auto; }
        .doc-search-input { width: 100%; padding: 16px 60px 16px 20px; border: none; border-radius: 12px; font-size: 15px; outline: none; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .doc-search-btn { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .doc-main { padding: 40px 0; }
        .doc-container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }
        .doc-layout { display: grid; grid-template-columns: 280px 1fr; gap: 40px; }
        .doc-sidebar { position: sticky; top: 20px; height: fit-content; background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: 0.3s; }
        .doc-sidebar-toggle { position: absolute; top: 20px; right: -12px; width: 24px; height: 24px; background: white; border: 1px solid #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 10; }
        .doc-sidebar.closed { transform: translateX(-100%); }
        .doc-sidebar-header h3 { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 24px; }
        .doc-nav { display: flex; flex-direction: column; gap: 8px; margin-bottom: 32px; }
        .doc-nav-item { width: 100%; padding: 12px 16px; background: transparent; border: none; border-radius: 8px; display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; text-align: left; transition: 0.2s; }
        .doc-nav-item:hover { background: #f1f5f9; color: #1e293b; }
        .doc-nav-item.active { background: #eff6ff; color: #3b82f6; }
        .doc-nav-item svg { flex-shrink: 0; }
        .doc-api-key-section { margin-bottom: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
        .doc-api-key-title { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
        .doc-api-key-box { padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 12px; }
        .doc-api-key-box code { font-size: 12px; color: #475569; font-family: 'Courier New', monospace; word-break: break-all; }
        .doc-copy-btn { width: 100%; padding: 10px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
        .doc-copy-btn:hover { background: #2563eb; }
        .doc-resources { padding-top: 24px; border-top: 1px solid #e2e8f0; }
        .doc-resources-title { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
        .doc-resources-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .doc-resources-list a { font-size: 14px; color: #3b82f6; text-decoration: none; transition: 0.2s; }
        .doc-resources-list a:hover { color: #2563eb; text-decoration: underline; }
        .doc-content { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .doc-content-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .doc-header-icon { width: 56px; height: 56px; background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
        .doc-content-title { font-size: 32px; font-weight: 700; color: #1e293b; }
        .doc-tags { display: flex; gap: 8px; margin-top: 8px; }
        .doc-tag { padding: 4px 12px; background: #f1f5f9; color: #475569; font-size: 12px; border-radius: 16px; font-weight: 500; }
        .doc-intro-text { font-size: 16px; color: #64748b; line-height: 1.7; margin-bottom: 40px; }
        .doc-section { margin-bottom: 48px; }
        .doc-section-title { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
        .doc-section-text { font-size: 16px; color: #64748b; line-height: 1.7; margin-bottom: 16px; }
        .doc-subsection { margin: 24px 0; }
        .doc-subsection h4 { font-size: 18px; font-weight: 600; color: #3b82f6; margin-bottom: 12px; }
        .doc-alert { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        .doc-alert.info { background: #eff6ff; border-left: 4px solid #3b82f6; }
        .doc-alert.success { background: #f0fdf4; border-left: 4px solid #10b981; }
        .doc-alert.warning { background: #fffbeb; border-left: 4px solid #f59e0b; }
        .doc-alert.error { background: #fef2f2; border-left: 4px solid #ef4444; }
        .doc-notice { padding: 16px; border-radius: 8px; margin: 16px 0; display: flex; gap: 12px; }
        .doc-notice.info { background: #eff6ff; border-left: 4px solid #3b82f6; }
        .doc-notice.warning { background: #fffbeb; border-left: 4px solid #f59e0b; }
        .doc-notice.error { background: #fef2f2; border-left: 4px solid #ef4444; }
        .doc-definition-box { background: #f8fafc; padding: 24px; border-radius: 12px; margin: 16px 0; }
        .doc-definition-box h4 { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 20px; }
        .doc-definition-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .doc-definition-item h5 { font-size: 14px; font-weight: 600; color: #3b82f6; margin-bottom: 8px; }
        .doc-definition-item p { font-size: 14px; color: #64748b; line-height: 1.6; }
        .doc-list { padding-left: 24px; margin: 16px 0; display: flex; flex-direction: column; gap: 8px; }
        .doc-list li { font-size: 15px; color: #64748b; line-height: 1.6; }
        .doc-payment-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 12px; }
        .doc-payment-item { display: flex; flex-direction: column; gap: 4px; }
        .doc-payment-item span { font-size: 14px; color: #64748b; }
        .doc-payment-item strong { font-size: 16px; color: #1e293b; }
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
        .doc-quick-icon { width: 56px; height: 56px; margin: 0 auto 16px; background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
        .doc-quick-card h4 { font-size: 16px; font-weight: 600; color: #1e293b; }
        .doc-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .doc-modal { background: white; border-radius: 16px; width: 90%; max-width: 500px; max-height: 90vh; overflow: auto; }
        .doc-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 24px; border-bottom: 1px solid #e2e8f0; }
        .doc-modal-header h3 { font-size: 20px; font-weight: 600; color: #1e293b; }
        .doc-modal-header button { background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b; }
        .doc-modal-content { padding: 24px; }
        .doc-modal-actions { display: flex; justify-content: flex-end; gap: 16px; padding: 24px; border-top: 1px solid #e2e8f0; }
        .doc-signature-box { padding: 12px; background: #f8fafc; border-radius: 8px; margin-top: 16px; }
        .doc-signature-box p { font-size: 12px; color: #64748b; font-family: 'Courier New', monospace; }
        .doc-back-to-top { position: fixed; bottom: 24px; right: 24px; width: 48px; height: 48px; background: #3b82f6; color: white; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: 0.2s; }
        .doc-back-to-top:hover { background: #2563eb; transform: translateY(-2px); }
        @media (max-width: 1024px) {
          .doc-layout { grid-template-columns: 1fr; }
          .doc-sidebar { position: relative; }
          .doc-quick-grid { grid-template-columns: repeat(2, 1fr); }
          .doc-payment-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .doc-hero-title { font-size: 32px; }
          .doc-content { padding: 24px; }
          .doc-content-title { font-size: 24px; }
          .doc-quick-grid { grid-template-columns: 1fr; }
          .doc-actions { flex-direction: column; gap: 16px; }
          .doc-primary-btn, .doc-secondary-btn { justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default TermsAndConditions;