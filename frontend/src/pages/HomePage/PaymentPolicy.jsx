import React, { useState, useEffect, useRef, useCallback } from 'react';
import { setPageTitle } from '../../components/utils/pageTitle';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Printer,
  Download,
  RefreshCw,
  Calendar,
  Percent,
  Globe,
  Building,
  User,
  FileText,
  ArrowUp,
  ShieldCheck,
  TrendingUp,
  Target,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  Users,
  Briefcase,
  Smartphone,
  Hash,
  Tag,
  BookOpen,
  Code,
  MessageCircle,
  Rocket,
  FileCode,
  Database,
  Lock,
  Eye
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";



const PaymentPolicy = () => {
  useEffect(() => {
    setPageTitle(
      "Payment Policy & Fee Structure | Brio AI Platform",
      "Review the Brio Payment Policy, including our 15% platform fee structure, secure payment processing terms, and payout schedules for creators."
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
    { id: 'fee-structure', title: 'Fee Structure', icon: <DollarSign size={18} /> },
    { id: 'payment-methods', title: 'Payment Methods', icon: <CreditCard size={18} /> },
    { id: 'payout-schedule', title: 'Payout Schedule', icon: <Clock size={18} /> },
    { id: 'tax-compliance', title: 'Tax Compliance', icon: <Percent size={18} /> },
    { id: 'disputes', title: 'Dispute Resolution', icon: <AlertCircle size={18} /> },
    { id: 'refunds', title: 'Refund Policy', icon: <RefreshCw size={18} /> },
    { id: 'currency', title: 'Currency & Conversion', icon: <Globe size={18} /> },
    { id: 'security', title: 'Payment Security', icon: <Shield size={18} /> },
    { id: 'compliance', title: 'Regulatory Compliance', icon: <ShieldCheck size={18} /> },
    { id: 'international', title: 'International Payments', icon: <Globe size={18} /> },
    { id: 'faq', title: 'Payment FAQ', icon: <MessageCircle size={18} /> },
    { id: 'contact', title: 'Payment Support', icon: <Mail size={18} /> }
  ];

  const feeStructure = [
    { service: 'Standard Campaigns', fee: '15%', min: '$50', notes: 'Applied to total campaign value', icon: <Target size={16} /> },
    { service: 'Enterprise Campaigns', fee: '12%', min: '$1000', notes: 'Volume discount, custom contract', icon: <Building size={16} /> },
    { service: 'Payment Processing', fee: '2.9% + $0.30', min: 'None', notes: 'Stripe/Razorpay fees', icon: <CreditCard size={16} /> },
    { service: 'Instant Payout', fee: '1.5%', min: '$2', notes: 'Optional, processed within 2 hours', icon: <Rocket size={16} /> },
    { service: 'Dispute Resolution', fee: '$50', min: 'Per case', notes: 'Refunded if influencer at fault', icon: <AlertCircle size={16} /> }
  ];

  const taxRates = [
    { country: 'India', rate: '18% GST', applicable: 'All transactions', flag: '🇮🇳' },
    { country: 'United States', rate: 'Varies by state', applicable: 'Sales tax where required', flag: '🇺🇸' },
    { country: 'European Union', rate: 'VAT 19-27%', applicable: 'Reverse charge mechanism', flag: '🇪🇺' },
    { country: 'UK', rate: '20% VAT', applicable: 'Business to Business', flag: '🇬🇧' },
    { country: 'Australia', rate: '10% GST', applicable: 'Digital services tax', flag: '🇦🇺' },
    { country: 'Canada', rate: '5-15% HST/GST', applicable: 'Provincial variations', flag: '🇨🇦' }
  ];

  const payoutSchedule = [
    { type: 'Standard Payout', time: '7 business days', fee: 'Free', min: '$50', icon: <Clock size={20} /> },
    { type: 'Express Payout', time: '2 hours', fee: '1.5%', min: '$2', icon: <Rocket size={20} /> },
    { type: 'Weekly Batch', time: 'Every Friday', fee: 'Free', min: '$10', icon: <Calendar size={20} /> },
    { type: 'Monthly Settlement', time: '1st of month', fee: 'Free', min: '$5', icon: <Calendar size={20} /> }
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
            <h1 className="doc-hero-title">Payment Policy</h1>
          </div>
          <p className="doc-hero-subtitle">
            Secure payment processing, fee structure, and payout terms for {brandName} AI Platform<br />
            Last updated: {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <div className="doc-search-wrapper">
            <input
              type="text"
              placeholder="Search payment policy..."
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

              {/* Payment Info */}
              <div className="doc-payment-info">
                <h4 className="doc-payment-title">Key Payment Details</h4>
                <div className="doc-payment-details">
                  <div className="doc-payment-detail">
                    <DollarSign size={14} />
                    <div>
                      <span>Platform Fee</span>
                      <strong>15%</strong>
                    </div>
                  </div>
                  <div className="doc-payment-detail">
                    <Clock size={14} />
                    <div>
                      <span>Standard Payout</span>
                      <strong>7 days</strong>
                    </div>
                  </div>
                  <div className="doc-payment-detail">
                    <CreditCard size={14} />
                    <div>
                      <span>Payment Fee</span>
                      <strong>2.9% + $0.30</strong>
                    </div>
                  </div>
                  <div className="doc-payment-detail">
                    <Shield size={14} />
                    <div>
                      <span>Minimum Withdrawal</span>
                      <strong>$50</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Badges */}
              <div className="doc-security-badges">
                <h4 className="doc-security-title">Payment Security</h4>
                <div className="doc-badges-grid">
                  <div className="doc-badge">
                    <ShieldCheck size={14} />
                    <span>PCI DSS Level 1</span>
                  </div>
                  <div className="doc-badge">
                    <Lock size={14} />
                    <span>256-bit SSL</span>
                  </div>
                  <div className="doc-badge">
                    <Database size={14} />
                    <span>Encrypted Data</span>
                  </div>
                  <div className="doc-badge">
                    <Eye size={14} />
                    <span>Fraud Detection</span>
                  </div>
                </div>
              </div>

              {/* Resources */}
              {/* <div className="doc-resources">
                <h4 className="doc-resources-title">Related Documents</h4>
                <ul className="doc-resources-list">
                  <li><a href="#terms">Terms & Conditions</a></li>
                  <li><a href="#privacy">Privacy Policy</a></li>
                  <li><a href="#refund">Refund Policy</a></li>
                  <li><a href="#tax">Tax Guide</a></li>
                </ul>
              </div> */}
            </aside>

            {/* Content Area */}
            <main className="doc-content">
              {/* Header */}
              <div className="doc-content-header">
                <div className="doc-header-icon" style={{ backgroundColor: '#3b82f6' }}>
                  <DollarSign size={32} />
                </div>
                <div>
                  <h2 className="doc-content-title">{brandName} Payment Policy</h2>
                  <div className="doc-tags">
                    <span className="doc-tag">Secure Payments</span>
                    <span className="doc-tag">Fee Structure</span>
                    <span className="doc-tag">Tax Compliance</span>
                    <span className="doc-tag">PCI DSS Certified</span>
                  </div>
                </div>
              </div>

              <div className="doc-alert info">
                <AlertCircle size={20} />
                <span>All payments on {brandName} platform are processed securely with PCI-DSS Level 1 compliance, 256-bit SSL encryption, and advanced fraud detection.</span>
              </div>

              {/* INTRODUCTION */}
              <section
                ref={(el) => sectionRefs.current.introduction = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">1. Introduction & Scope</h3>
                <p className="doc-section-text">
                  This Payment Policy ("Policy") outlines the fee structure, payment processing, payout schedules, and financial terms governing all transactions on the {brandName} AI Influencer Marketing Platform. This Policy applies to all Brands, Influencers, Creators, and users who engage in financial transactions through our platform.
                </p>
                <p className="doc-section-text">
                  By using {brandName} payment services, you agree to comply with this Policy, our Terms & Conditions, and all applicable financial regulations. We reserve the right to modify this Policy with 30 days notice to users.
                </p>
                <div className="doc-notice warning">
                  <Shield size={20} />
                  <div>
                    <strong>Financial Compliance</strong>
                    <p>{brandName} complies with PCI-DSS, RBI (India), FinCEN (US), FCA (UK), and other financial regulatory requirements in jurisdictions where we operate.</p>
                  </div>
                </div>
              </section>

              {/* FEE STRUCTURE */}
              <section
                ref={(el) => sectionRefs.current['fee-structure'] = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">2. Fee Structure</h3>

                <div className="doc-fee-table">
                  <div className="doc-table-header">
                    <div>Service</div>
                    <div>Platform Fee</div>
                    <div>Minimum</div>
                    <div>Notes</div>
                  </div>
                  {feeStructure.map((row, index) => (
                    <div key={index} className="doc-table-row">
                      <div className="doc-service-cell">
                        <div className="doc-service-icon" style={{ backgroundColor: '#3b82f6' }}>
                          {row.icon}
                        </div>
                        <span>{row.service}</span>
                      </div>
                      <div>
                        <span className="doc-fee-badge">{row.fee}</span>
                      </div>
                      <div>{row.min}</div>
                      <div>{row.notes}</div>
                    </div>
                  ))}
                </div>

                <div className="doc-fee-notes">
                  <h4>Fee Notes & Calculations</h4>
                  <ul className="doc-list">
                    <li>Platform fees are calculated on the total campaign value before payment processing fees</li>
                    <li>Enterprise rates apply to campaigns exceeding $10,000 monthly volume</li>
                    <li>Payment processing fees are charged by our payment partners (Stripe, Razorpay)</li>
                    <li>All fees are inclusive of applicable taxes unless specified otherwise</li>
                    <li>Fee changes will be communicated 30 days in advance</li>
                  </ul>
                </div>
              </section>

              {/* PAYMENT METHODS */}
              <section
                ref={(el) => sectionRefs.current['payment-methods'] = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">3. Payment Methods</h3>

                <div className="doc-payment-methods">
                  <div className="doc-method-category">
                    <h4>For Brands (Funding Campaigns)</h4>
                    <div className="doc-methods-grid">
                      <div className="doc-method-card">
                        <div className="doc-method-icon" style={{ backgroundColor: '#3b82f6' }}>
                          <CreditCard size={20} />
                        </div>
                        <h5>Credit/Debit Cards</h5>
                        <p>Visa, Mastercard, American Express, Discover</p>
                      </div>
                      <div className="doc-method-card">
                        <div className="doc-method-icon" style={{ backgroundColor: '#3b82f6' }}>
                          <Building size={20} />
                        </div>
                        <h5>Bank Transfer</h5>
                        <p>Direct bank transfer (ACH, SEPA, SWIFT)</p>
                      </div>
                      <div className="doc-method-card">
                        <div className="doc-method-icon" style={{ backgroundColor: '#3b82f6' }}>
                          <Globe size={20} />
                        </div>
                        <h5>Digital Wallets</h5>
                        <p>PayPal, Apple Pay, Google Pay</p>
                      </div>
                      <div className="doc-method-card">
                        <div className="doc-method-icon" style={{ backgroundColor: '#3b82f6' }}>
                          <DollarSign size={20} />
                        </div>
                        <h5>Platform Wallet</h5>
                        <p>Pre-load funds for faster campaign launches</p>
                      </div>
                    </div>
                  </div>

                  <div className="doc-method-category">
                    <h4>For Influencers (Receiving Payouts)</h4>
                    <div className="doc-methods-grid">
                      <div className="doc-method-card">
                        <div className="doc-method-icon" style={{ backgroundColor: '#3b82f6' }}>
                          <Building size={20} />
                        </div>
                        <h5>Bank Transfer</h5>
                        <p>Direct deposit to registered bank account</p>
                      </div>
                      <div className="doc-method-card">
                        <div className="doc-method-icon" style={{ backgroundColor: '#3b82f6' }}>
                          <CreditCard size={20} />
                        </div>
                        <h5>UPI (India)</h5>
                        <p>Instant transfers to UPI ID</p>
                      </div>
                      <div className="doc-method-card">
                        <div className="doc-method-icon" style={{ backgroundColor: '#3b82f6' }}>
                          <Globe size={20} />
                        </div>
                        <h5>PayPal</h5>
                        <p>International PayPal transfers</p>
                      </div>
                      <div className="doc-method-card">
                        <div className="doc-method-icon" style={{ backgroundColor: '#3b82f6' }}>
                          <DollarSign size={20} />
                        </div>
                        <h5>Platform Wallet</h5>
                        <p>Store earnings for future platform use</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* PAYOUT SCHEDULE */}
              <section
                ref={(el) => sectionRefs.current['payout-schedule'] = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">4. Payout Schedule</h3>

                <div className="doc-payout-options">
                  {payoutSchedule.map((option, index) => (
                    <div key={index} className="doc-payout-card">
                      <div className="doc-payout-icon" style={{ backgroundColor: '#3b82f6' }}>
                        {option.icon}
                      </div>
                      <div className="doc-payout-content">
                        <h4>{option.type}</h4>
                        <div className="doc-payout-details">
                          <div className="doc-payout-detail">
                            <span>Processing Time</span>
                            <strong>{option.time}</strong>
                          </div>
                          <div className="doc-payout-detail">
                            <span>Fee</span>
                            <strong>{option.fee}</strong>
                          </div>
                          <div className="doc-payout-detail">
                            <span>Minimum</span>
                            <strong>{option.min}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="doc-notice info">
                  <Clock size={20} />
                  <div>
                    <strong>Payout Processing Notes</strong>
                    <p>Payouts are processed after Brand approval of campaign deliverables. Weekends and banking holidays may affect processing times. All payouts are subject to KYC verification and anti-fraud checks.</p>
                  </div>
                </div>
              </section>

              {/* TAX COMPLIANCE */}
              <section
                ref={(el) => sectionRefs.current['tax-compliance'] = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">5. Tax Compliance</h3>

                <div className="doc-tax-table">
                  <div className="doc-table-header">
                    <div>Country/Region</div>
                    <div>Tax Rate</div>
                    <div>Applicable To</div>
                  </div>
                  {taxRates.map((row, index) => (
                    <div key={index} className="doc-table-row">
                      <div className="doc-country-cell">
                        <span className="doc-flag">{row.flag}</span>
                        <span>{row.country}</span>
                      </div>
                      <div>
                        <span className="doc-tax-badge">{row.rate}</span>
                      </div>
                      <div>{row.applicable}</div>
                    </div>
                  ))}
                </div>

                <div className="doc-tax-notes">
                  <div className="doc-tax-note">
                    <h4>India Tax Compliance</h4>
                    <p>TDS deducted as per Income Tax Act Section 194-O for influencer payments exceeding ₹50,000 annually. Form 16A will be issued by {brandName} for all applicable TDS deductions. GST is charged at 18% on platform fees for Indian users.</p>
                  </div>
                  <div className="doc-tax-note">
                    <h4>International Tax Handling</h4>
                    <p>For cross-border transactions, we comply with OECD guidelines and local tax regulations. VAT/GST is handled through reverse charge mechanism for B2B transactions where applicable. Users are responsible for their own tax reporting in their jurisdiction.</p>
                  </div>
                </div>
              </section>

              {/* DISPUTE RESOLUTION */}
              <section
                ref={(el) => sectionRefs.current.disputes = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">6. Dispute Resolution</h3>

                <div className="doc-dispute-process">
                  <div className="doc-process-step">
                    <div className="doc-step-number">1</div>
                    <div className="doc-step-content">
                      <h4>Dispute Initiation</h4>
                      <p>Brands must raise disputes within 48 hours of content delivery. Dispute fee of $50 is charged and refunded if influencer is at fault.</p>
                    </div>
                  </div>
                  <div className="doc-process-step">
                    <div className="doc-step-number">2</div>
                    <div className="doc-step-content">
                      <h4>Evidence Submission</h4>
                      <p>Both parties submit evidence through platform. Campaign brief, deliverables, and communications are reviewed.</p>
                    </div>
                  </div>
                  <div className="doc-process-step">
                    <div className="doc-step-number">3</div>
                    <div className="doc-step-content">
                      <h4>Platform Mediation</h4>
                      <p>{brandName} mediators review evidence and attempt resolution within 5 business days.</p>
                    </div>
                  </div>
                  <div className="doc-process-step">
                    <div className="doc-step-number">4</div>
                    <div className="doc-step-content">
                      <h4>Resolution & Settlement</h4>
                      <p>Based on findings, funds are released, partially refunded, or held for further action. All decisions are final.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* REFUND POLICY */}
              <section
                ref={(el) => sectionRefs.current.refunds = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">7. Refund Policy</h3>

                <div className="doc-refund-categories">
                  <div className="doc-refund-category">
                    <h4>Full Refund (100%)</h4>
                    <ul>
                      <li>Campaign cancelled before influencer acceptance</li>
                      <li>Platform technical failure preventing campaign launch</li>
                      <li>Duplicate payment processed in error</li>
                    </ul>
                  </div>
                  <div className="doc-refund-category">
                    <h4>Partial Refund (50-80%)</h4>
                    <ul>
                      <li>Campaign cancelled after acceptance but before work begins</li>
                      <li>Mutual agreement to terminate campaign</li>
                      <li>Platform-mediated dispute resolution</li>
                    </ul>
                  </div>
                  <div className="doc-refund-category">
                    <h4>No Refund</h4>
                    <ul>
                      <li>Work completed and delivered as per contract</li>
                      <li>Brand dissatisfaction without contract breach</li>
                      <li>Change of mind after campaign completion</li>
                    </ul>
                  </div>
                </div>

                <div className="doc-notice warning">
                  <AlertCircle size={20} />
                  <div>
                    <strong>Refund Processing Time</strong>
                    <p>Refunds are processed within 10 business days of approval. The refund method matches the original payment method. Platform fees are non-refundable once services are rendered.</p>
                  </div>
                </div>
              </section>

              {/* CURRENCY & CONVERSION */}
              <section
                ref={(el) => sectionRefs.current.currency = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">8. Currency & Conversion</h3>

                <div className="doc-currency-info">
                  <div className="doc-currency-card">
                    <h4>Supported Currencies</h4>
                    <div className="doc-currencies">
                      <span className="doc-currency">USD ($)</span>
                      <span className="doc-currency">EUR (€)</span>
                      <span className="doc-currency">GBP (£)</span>
                      <span className="doc-currency">INR (₹)</span>
                      <span className="doc-currency">CAD (C$)</span>
                      <span className="doc-currency">AUD (A$)</span>
                    </div>
                  </div>
                  <div className="doc-currency-card">
                    <h4>Exchange Rates</h4>
                    <p>We use real-time mid-market rates from our payment providers. Currency conversion fees of 1-3% may apply for cross-border transactions.</p>
                  </div>
                  <div className="doc-currency-card">
                    <h4>Local Currency Preference</h4>
                    <p>Users can set preferred currency in account settings. Campaign values are locked in the currency set at campaign creation.</p>
                  </div>
                </div>
              </section>

              {/* PAYMENT SECURITY */}
              <section
                ref={(el) => sectionRefs.current.security = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">9. Payment Security</h3>

                <div className="doc-security-measures">
                  <div className="doc-security-measure">
                    <div className="doc-security-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <Lock size={20} />
                    </div>
                    <div>
                      <h5>PCI DSS Level 1</h5>
                      <p>Highest level of payment security certification</p>
                    </div>
                  </div>
                  <div className="doc-security-measure">
                    <div className="doc-security-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <Database size={20} />
                    </div>
                    <div>
                      <h5>End-to-End Encryption</h5>
                      <p>256-bit SSL encryption for all transactions</p>
                    </div>
                  </div>
                  <div className="doc-security-measure">
                    <div className="doc-security-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h5>Fraud Detection</h5>
                      <p>AI-powered fraud monitoring and prevention</p>
                    </div>
                  </div>
                  <div className="doc-security-measure">
                    <div className="doc-security-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <Eye size={20} />
                    </div>
                    <div>
                      <h5>Secure Storage</h5>
                      <p>Tokenized payment data, no raw card storage</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* REGULATORY COMPLIANCE */}
              <section
                ref={(el) => sectionRefs.current.compliance = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">10. Regulatory Compliance</h3>

                <div className="doc-compliance-list">
                  <div className="doc-compliance-item">
                    <CheckCircle size={18} color="#10b981" />
                    <span>RBI Compliance (India) - Payment aggregator license</span>
                  </div>
                  <div className="doc-compliance-item">
                    <CheckCircle size={18} color="#10b981" />
                    <span>FinCEN Registration (USA) - Money Services Business</span>
                  </div>
                  <div className="doc-compliance-item">
                    <CheckCircle size={18} color="#10b981" />
                    <span>FCA Registration (UK) - Electronic Money Institution</span>
                  </div>
                  <div className="doc-compliance-item">
                    <CheckCircle size={18} color="#10b981" />
                    <span>AUSTRAC Registration (Australia)</span>
                  </div>
                  <div className="doc-compliance-item">
                    <CheckCircle size={18} color="#10b981" />
                    <span>FINTRAC Registration (Canada)</span>
                  </div>
                  <div className="doc-compliance-item">
                    <CheckCircle size={18} color="#10b981" />
                    <span>Anti-Money Laundering (AML) compliance</span>
                  </div>
                </div>
              </section>

              {/* INTERNATIONAL PAYMENTS */}
              <section
                ref={(el) => sectionRefs.current.international = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">11. International Payments</h3>

                <div className="doc-international-info">
                  <div className="doc-intl-card">
                    <h4>Cross-Border Fees</h4>
                    <p>International wire transfers: $15-25 per transaction</p>
                    <p>Currency conversion: 1-3% above mid-market rate</p>
                  </div>
                  <div className="doc-intl-card">
                    <h4>Processing Time</h4>
                    <p>SWIFT transfers: 3-5 business days</p>
                    <p>Local currency transfers: 1-2 business days</p>
                  </div>
                  <div className="doc-intl-card">
                    <h4>Documentation</h4>
                    <p>Purpose codes required for international transfers</p>
                    <p>Tax forms (W-8BEN, W-9) for US transactions</p>
                  </div>
                </div>
              </section>

              {/* PAYMENT FAQ */}
              <section
                ref={(el) => sectionRefs.current.faq = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">12. Payment FAQ</h3>

                <div className="doc-faq-list">
                  <div className="doc-faq-item">
                    <h4>When are platform fees charged?</h4>
                    <p>Platform fees are deducted when Brands fund campaigns. The fee is calculated on the total campaign value before payment processing fees.</p>
                  </div>
                  <div className="doc-faq-item">
                    <h4>How do I update my payment method?</h4>
                    <p>Go to Account Settings → Payment Methods. You can add, remove, or set default payment methods. Changes take effect immediately for future transactions.</p>
                  </div>
                  <div className="doc-faq-item">
                    <h4>What is the minimum withdrawal amount?</h4>
                    <p>$50 or equivalent in local currency. This helps optimize transaction costs and processing efficiency.</p>
                  </div>
                  <div className="doc-faq-item">
                    <h4>Are there any hidden fees?</h4>
                    <p>No hidden fees. All charges are transparently displayed before payment confirmation. Review the fee breakdown in your payment summary.</p>
                  </div>
                </div>
              </section>

              {/* CONTACT */}
              <section
                ref={(el) => sectionRefs.current.contact = el}
                className="doc-section"
              >
                <h3 className="doc-section-title">13. Payment Support</h3>

                <div className="doc-contact-box">
                  <div className="doc-contact-section">
                    <h4>Payment Support Team</h4>
                    <p><Mail size={16} /> payments@{brandName.toLowerCase()}.ai</p>
                    <p><Phone size={16} /> +91-80-PAYMENT</p>
                    <p>Response time: 24 hours</p>
                  </div>
                  <div className="doc-contact-section">
                    <h4>Business Hours</h4>
                    <p>Monday - Friday: 9 AM - 6 PM IST</p>
                    <p>Saturday: 10 AM - 2 PM IST</p>
                    <p>Emergency support: 24/7 for fraud alerts</p>
                  </div>
                  <div className="doc-contact-section">
                    <h4>Escalation Contact</h4>
                    <p><Mail size={16} /> payments-escalation@{brandName.toLowerCase()}.ai</p>
                    <p>For unresolved payment issues after 72 hours</p>
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
                  <Download size={18} />
                  <span>Download Fee Schedule</span>
                </button> */}
              </div>

              {/* Quick Links */}
              {/* <section className="doc-quick-links">
                <h3 className="doc-section-title">Payment Resources</h3>
                <div className="doc-quick-grid">
                  <a href="#tax-guide" className="doc-quick-card">
                    <div className="doc-quick-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <Percent size={32} />
                    </div>
                    <h4>Tax Guide</h4>
                  </a>
                  <a href="#fee-calculator" className="doc-quick-card">
                    <div className="doc-quick-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <Calculator size={32} />
                    </div>
                    <h4>Fee Calculator</h4>
                  </a>
                  <a href="#payout-tracking" className="doc-quick-card">
                    <div className="doc-quick-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <Clock size={32} />
                    </div>
                    <h4>Payout Tracker</h4>
                  </a>
                  <a href="#support" className="doc-quick-card">
                    <div className="doc-quick-icon" style={{ backgroundColor: '#3b82f6' }}>
                      <MessageCircle size={32} />
                    </div>
                    <h4>Payment Support</h4>
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
        
        .doc-payment-info { margin-bottom: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; }
        .doc-payment-title { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
        .doc-payment-details { display: flex; flex-direction: column; gap: 12px; }
        .doc-payment-detail { display: flex; align-items: center; gap: 12px; }
        .doc-payment-detail svg { color: #3b82f6; }
        .doc-payment-detail div { flex: 1; }
        .doc-payment-detail span { display: block; font-size: 12px; color: #64748b; }
        .doc-payment-detail strong { display: block; font-size: 14px; font-weight: 600; color: #1e293b; }
        
        .doc-security-badges { margin-bottom: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; }
        .doc-security-title { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
        .doc-badges-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
        .doc-badge { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: white; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; color: #475569; }
        
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
        .doc-notice.info { background: #eff6ff; border-left: 4px solid #3b82f6; }
        .doc-notice.warning { background: #fffbeb; border-left: 4px solid #f59e0b; }
        
        .doc-fee-table { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin: 24px 0; }
        .doc-table-header { display: grid; grid-template-columns: 2fr 1fr 1fr 2fr; background: #f8fafc; font-weight: 600; color: #1e293b; }
        .doc-table-header div { padding: 16px; border-right: 1px solid #e2e8f0; }
        .doc-table-header div:last-child { border-right: none; }
        .doc-table-row { display: grid; grid-template-columns: 2fr 1fr 1fr 2fr; border-bottom: 1px solid #e2e8f0; }
        .doc-table-row:last-child { border-bottom: none; }
        .doc-table-row div { padding: 16px; border-right: 1px solid #e2e8f0; font-size: 14px; color: #64748b; }
        .doc-table-row div:last-child { border-right: none; }
        .doc-service-cell { display: flex; align-items: center; gap: 12px; }
        .doc-service-icon { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; }
        .doc-fee-badge { padding: 4px 12px; background: #dbeafe; color: #1e40af; border-radius: 16px; font-weight: 600; font-size: 13px; }
        
        .doc-list { padding-left: 24px; margin: 16px 0; display: flex; flex-direction: column; gap: 8px; }
        .doc-list li { font-size: 15px; color: #64748b; line-height: 1.6; }
        
        .doc-payment-methods { display: flex; flex-direction: column; gap: 32px; margin: 24px 0; }
        .doc-method-category h4 { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 20px; }
        .doc-methods-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .doc-method-card { padding: 20px; background: #f8fafc; border-radius: 8px; text-align: center; }
        .doc-method-icon { width: 48px; height: 48px; margin: 0 auto 16px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; }
        .doc-method-card h5 { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .doc-method-card p { font-size: 14px; color: #64748b; line-height: 1.6; }
        
        .doc-payout-options { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin: 24px 0; }
        .doc-payout-card { display: flex; gap: 20px; padding: 24px; background: #f8fafc; border-radius: 12px; }
        .doc-payout-icon { width: 56px; height: 56px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
        .doc-payout-content h4 { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 16px; }
        .doc-payout-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .doc-payout-detail { display: flex; flex-direction: column; }
        .doc-payout-detail span { font-size: 12px; color: #64748b; margin-bottom: 4px; }
        .doc-payout-detail strong { font-size: 16px; font-weight: 600; color: #1e293b; }
        
        .doc-tax-table { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin: 24px 0; }
        .doc-country-cell { display: flex; align-items: center; gap: 12px; }
        .doc-flag { font-size: 20px; }
        .doc-tax-badge { padding: 4px 12px; background: #f3e8ff; color: #6b21a8; border-radius: 16px; font-weight: 600; font-size: 13px; }
        
        .doc-tax-notes { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin: 24px 0; }
        .doc-tax-note h4 { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .doc-tax-note p { font-size: 14px; color: #64748b; line-height: 1.6; }
        
        .doc-dispute-process { display: flex; flex-direction: column; gap: 20px; margin: 24px 0; }
        .doc-process-step { display: flex; gap: 20px; }
        .doc-step-number { width: 40px; height: 40px; background: #3b82f6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
        .doc-step-content h4 { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .doc-step-content p { font-size: 15px; color: #64748b; line-height: 1.6; }
        
        .doc-refund-categories { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin: 24px 0; }
        .doc-refund-category h4 { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
        .doc-refund-category ul { list-style: none; padding-left: 0; }
        .doc-refund-category li { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 8px; padding-left: 20px; position: relative; }
        .doc-refund-category li:before { content: "•"; color: #3b82f6; position: absolute; left: 0; }
        
        .doc-currency-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin: 24px 0; }
        .doc-currency-card { padding: 24px; background: #f8fafc; border-radius: 8px; }
        .doc-currency-card h4 { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 16px; }
        .doc-currencies { display: flex; flex-wrap: wrap; gap: 8px; }
        .doc-currency { padding: 6px 12px; background: white; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; color: #475569; }
        
        .doc-security-measures { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 24px 0; }
        .doc-security-measure { display: flex; gap: 16px; align-items: center; }
        .doc-security-icon { width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
        .doc-security-measure h5 { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 4px; }
        .doc-security-measure p { font-size: 14px; color: #64748b; line-height: 1.6; }
        
        .doc-compliance-list { display: flex; flex-direction: column; gap: 12px; margin: 24px 0; }
        .doc-compliance-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f0fdf4; border-radius: 6px; }
        .doc-compliance-item span { font-size: 14px; color: #64748b; }
        
        .doc-international-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 24px 0; }
        .doc-intl-card { padding: 20px; background: #f8fafc; border-radius: 8px; }
        .doc-intl-card h4 { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .doc-intl-card p { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 4px; }
        
        .doc-faq-list { display: flex; flex-direction: column; gap: 24px; margin: 24px 0; }
        .doc-faq-item h4 { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .doc-faq-item p { font-size: 15px; color: #64748b; line-height: 1.6; }
        
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
          .doc-table-header, .doc-table-row { grid-template-columns: 1fr; }
          .doc-table-header div, .doc-table-row div { border-right: none; border-bottom: 1px solid #e2e8f0; }
          .doc-payout-details { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .doc-hero-title { font-size: 32px; }
          .doc-content { padding: 24px; }
          .doc-content-title { font-size: 24px; }
          .doc-quick-grid { grid-template-columns: 1fr; }
          .doc-actions { flex-direction: column; gap: 16px; }
          .doc-primary-btn, .doc-secondary-btn { justify-content: center; }
          .doc-payout-card { flex-direction: column; }
          .doc-security-measure { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  );
};

// Add missing Calculator icon component
const Calculator = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 24}
    height={props.size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="16" y2="14" />
    <line x1="8" y1="18" x2="16" y2="18" />
  </svg>
);

export default PaymentPolicy;