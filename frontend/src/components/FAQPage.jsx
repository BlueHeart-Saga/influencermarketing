import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle, MessageCircle, Mail, FileText, BookOpen } from 'lucide-react';

const FAQPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaqs, setOpenFaqs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    { id: 'all', name: 'All Questions', count: 28 },
    { id: 'getting-started', name: 'Getting Started', count: 6 },
    { id: 'account', name: 'Account & Billing', count: 5 },
    { id: 'campaigns', name: 'Campaigns', count: 8 },
    { id: 'ai-features', name: 'AI Features', count: 4 },
    { id: 'technical', name: 'Technical', count: 5 },
  ];

  const allFaqs = [
    // Getting Started
    {
      id: 1,
      question: 'How do I get started with Brio?',
      answer: 'Getting started is easy! Simply sign up for a free account, complete your profile setup, and our AI will guide you through creating your first campaign. No technical skills required.',
      category: 'getting-started',
      tags: ['onboarding', 'setup']
    },
    {
      id: 2,
      question: 'Is there a free trial available?',
      answer: 'Yes! We offer a 15-day free trial with access to all basic features. No credit card required to start your trial.',
      category: 'getting-started',
      tags: ['trial', 'pricing']
    },
    {
      id: 3,
      question: 'What platforms do you support?',
      answer: 'We support all major social media platforms including Instagram, YouTube, TikTok, Twitter, LinkedIn, Pinterest, and Twitch.',
      category: 'getting-started',
      tags: ['platforms', 'integration']
    },
    {
      id: 4,
      question: 'How long does it take to set up my first campaign?',
      answer: 'Most users can set up and launch their first campaign in under 10 minutes using our AI-powered campaign builder.',
      category: 'getting-started',
      tags: ['campaign', 'time']
    },
    {
      id: 5,
      question: 'Do you offer training or onboarding support?',
      answer: 'Yes! We provide comprehensive onboarding support including video tutorials, live webinars, and 1:1 setup sessions for Pro and Enterprise plans.',
      category: 'getting-started',
      tags: ['support', 'training']
    },
    {
      id: 6,
      question: 'Can I try the platform before committing?',
      answer: 'Absolutely. Our 15-day free trial gives you full access to all platform features with no obligations.',
      category: 'getting-started',
      tags: ['trial', 'demo']
    },

    // Account & Billing
    {
      id: 7,
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and wire transfers for Enterprise plans.',
      category: 'account',
      tags: ['payment', 'billing']
    },
    {
      id: 8,
      question: 'Can I change plans anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any payments accordingly.',
      category: 'account',
      tags: ['plans', 'upgrade']
    },
    {
      id: 9,
      question: 'Do you offer discounts for non-profits or educational institutions?',
      answer: 'Yes, we offer a 30% discount for registered non-profit organizations and educational institutions. Contact our sales team for verification.',
      category: 'account',
      tags: ['discount', 'non-profit']
    },
    {
      id: 10,
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel your subscription at any time from your account settings. Cancellation takes effect at the end of your current billing cycle.',
      category: 'account',
      tags: ['cancel', 'subscription']
    },
    {
      id: 11,
      question: 'Are there any setup fees or hidden charges?',
      answer: 'No, we believe in transparent pricing. The price you see is what you pay, with no hidden fees or setup charges.',
      category: 'account',
      tags: ['pricing', 'transparency']
    },

    // Campaigns
    {
      id: 12,
      question: 'How does the AI match me with influencers?',
      answer: 'Our AI analyzes 200+ data points including audience demographics, engagement patterns, content quality, and brand alignment to find perfect influencer matches.',
      category: 'campaigns',
      tags: ['ai', 'matching']
    },
    {
      id: 13,
      question: 'Can I manage multiple campaigns simultaneously?',
      answer: 'Yes! Depending on your plan, you can manage from 1 to unlimited campaigns simultaneously with our intuitive dashboard.',
      category: 'campaigns',
      tags: ['management', 'multiple']
    },
    {
      id: 14,
      question: 'How do you track campaign performance?',
      answer: 'We provide real-time analytics tracking impressions, engagement, conversions, and ROI. Our AI also offers predictive insights and optimization recommendations.',
      category: 'campaigns',
      tags: ['analytics', 'tracking']
    },
    {
      id: 15,
      question: 'Can I set up automated workflows for influencer outreach?',
      answer: 'Yes! Our platform includes automated outreach sequences, follow-up reminders, and template management to streamline your workflow.',
      category: 'campaigns',
      tags: ['automation', 'workflow']
    },
    {
      id: 16,
      question: 'How do you ensure influencer authenticity?',
      answer: 'We use advanced fraud detection algorithms to verify influencer metrics, detect fake followers, and ensure authentic engagement.',
      category: 'campaigns',
      tags: ['verification', 'authenticity']
    },
    {
      id: 17,
      question: 'Can I collaborate with team members on campaigns?',
      answer: 'Yes! Our platform includes team collaboration features with role-based permissions, comments, and approval workflows.',
      category: 'campaigns',
      tags: ['collaboration', 'team']
    },
    {
      id: 18,
      question: 'Do you provide contract templates?',
      answer: 'Yes, we provide legally vetted contract templates that can be customized and signed electronically within the platform.',
      category: 'campaigns',
      tags: ['contracts', 'legal']
    },
    {
      id: 19,
      question: 'How do you handle payments to influencers?',
      answer: 'We offer secure payment processing with escrow options, automated payouts, and detailed payment tracking.',
      category: 'campaigns',
      tags: ['payments', 'escrow']
    },

    // AI Features
    {
      id: 20,
      question: 'How accurate is your AI matching algorithm?',
      answer: 'Our AI matching algorithm achieves 95% accuracy based on performance data from thousands of successful campaigns.',
      category: 'ai-features',
      tags: ['ai', 'accuracy']
    },
    {
      id: 21,
      question: 'Can the AI predict campaign ROI?',
      answer: 'Yes! Our predictive analytics engine can forecast campaign performance and ROI with 89% accuracy before launch.',
      category: 'ai-features',
      tags: ['predictive', 'roi']
    },
    {
      id: 22,
      question: 'Does the AI learn from my campaign results?',
      answer: 'Absolutely. Our machine learning models continuously improve based on your campaign data and performance patterns.',
      category: 'ai-features',
      tags: ['machine-learning', 'optimization']
    },
    {
      id: 23,
      question: 'What data does your AI analyze?',
      answer: 'We analyze audience demographics, engagement metrics, content performance, historical campaign data, and market trends.',
      category: 'ai-features',
      tags: ['data', 'analytics']
    },

    // Technical
    {
      id: 24,
      question: 'Do you offer API access?',
      answer: 'Yes! API access is available on Pro and Enterprise plans for custom integrations and automated workflows.',
      category: 'technical',
      tags: ['api', 'integration']
    },
    {
      id: 25,
      question: 'What security measures do you have in place?',
      answer: 'We use enterprise-grade security including end-to-end encryption, SOC 2 compliance, regular security audits, and GDPR compliance.',
      category: 'technical',
      tags: ['security', 'privacy']
    },
    {
      id: 26,
      question: 'Can I integrate with other marketing tools?',
      answer: 'Yes! We offer integrations with popular tools like Google Analytics, Salesforce, HubSpot, Shopify, and more.',
      category: 'technical',
      tags: ['integration', 'tools']
    },
    {
      id: 27,
      question: 'Is my data backed up regularly?',
      answer: 'Yes, we perform automated daily backups with 30-day retention and disaster recovery protocols.',
      category: 'technical',
      tags: ['backup', 'recovery']
    },
    {
      id: 28,
      question: 'What are your uptime and reliability guarantees?',
      answer: 'We guarantee 99.9% uptime with 24/7 monitoring and redundant infrastructure across multiple data centers.',
      category: 'technical',
      tags: ['uptime', 'reliability']
    },
  ];

  const filteredFaqs = allFaqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id) => {
    setOpenFaqs(prev => 
      prev.includes(id) ? prev.filter(faqId => faqId !== id) : [...prev, id]
    );
  };

  const popularFaqs = [1, 7, 12, 20, 24];

  return (
    <div className="faq-wrapper">
      {/* Hero Section */}
      <section className="faq-hero">
        <div className="faq-container">
          <div className="faq-hero-content">
            <h1 className="faq-title">Frequently Asked Questions</h1>
            <p className="faq-subtitle">
              Find answers to common questions about our platform, features, and services.<br />
              Can't find what you're looking for? Contact our support team.
            </p>
            
            {/* Search Bar */}
            <div className="faq-search-wrapper">
              <div className="faq-search-icon">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Search questions or keywords..."
                className="faq-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="faq-search-clear"
                  onClick={() => setSearchQuery('')}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="faq-stats">
              <div className="faq-stat-item">
                <span className="faq-stat-number">28</span>
                <span className="faq-stat-label">FAQs</span>
              </div>
              <div className="faq-stat-item">
                <span className="faq-stat-number">95%</span>
                <span className="faq-stat-label">Answered</span>
              </div>
              <div className="faq-stat-item">
                <span className="faq-stat-number">24h</span>
                <span className="faq-stat-label">Response Time</span>
              </div>
              <div className="faq-stat-item">
                <span className="faq-stat-number">10k+</span>
                <span className="faq-stat-label">Users Helped</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="faq-main">
        <div className="faq-container">
          <div className="faq-layout">
            {/* Sidebar - Categories */}
            <aside className="faq-sidebar">
              <div className="faq-sidebar-header">
                <h3 className="faq-sidebar-title">Categories</h3>
                <p className="faq-sidebar-subtitle">Browse by topic</p>
              </div>

              <nav className="faq-categories">
                {faqCategories.map(category => (
                  <button
                    key={category.id}
                    className={`faq-category-btn ${activeCategory === category.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <span className="faq-category-name">{category.name}</span>
                    <span className="faq-category-count">{category.count}</span>
                  </button>
                ))}
              </nav>

              {/* Popular Questions */}
              <div className="faq-popular-section">
                <h4 className="faq-popular-title">
                  <HelpCircle size={18} />
                  Popular Questions
                </h4>
                <div className="faq-popular-list">
                  {popularFaqs.map(faqId => {
                    const faq = allFaqs.find(f => f.id === faqId);
                    return (
                      <button
                        key={faqId}
                        className="faq-popular-item"
                        onClick={() => {
                          setActiveCategory('all');
                          toggleFaq(faqId);
                          setTimeout(() => {
                            document.getElementById(`faq-${faqId}`)?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'center'
                            });
                          }, 100);
                        }}
                      >
                        <span className="faq-popular-text">{faq.question}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Support Section */}
              <div className="faq-support-section">
                <h4 className="faq-support-title">Need More Help?</h4>
                <div className="faq-support-options">
                  <a href="/contactus" className="faq-support-option">
                    <MessageCircle size={16} />
                    <span>Live Chat</span>
                  </a>
                  <a href="mailto:support@brio.com" className="faq-support-option">
                    <Mail size={16} />
                    <span>Email Support</span>
                  </a>
                  <a href="/login" className="faq-support-option">
                    <BookOpen size={16} />
                    <span>Documentation</span>
                  </a>
                </div>
              </div>
            </aside>

            {/* Main FAQ Content */}
            <main className="faq-content">
              {/* Results Header */}
              <div className="faq-results-header">
                <h2 className="faq-results-title">
                  {searchQuery ? 'Search Results' : activeCategory === 'all' ? 'All Questions' : 
                    faqCategories.find(c => c.id === activeCategory)?.name}
                </h2>
                <p className="faq-results-count">
                  {filteredFaqs.length} {filteredFaqs.length === 1 ? 'question' : 'questions'} found
                  {searchQuery && ` for "${searchQuery}"`}
                </p>
              </div>

              {/* FAQ List */}
              <div className="faq-list">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map(faq => (
                    <div 
                      key={faq.id} 
                      id={`faq-${faq.id}`}
                      className={`faq-item ${openFaqs.includes(faq.id) ? 'open' : ''}`}
                    >
                      <button 
                        className="faq-question"
                        onClick={() => toggleFaq(faq.id)}
                      >
                        <span className="faq-q-text">{faq.question}</span>
                        <ChevronDown size={20} className={`faq-arrow ${openFaqs.includes(faq.id) ? 'open' : ''}`} />
                      </button>
                      
                      {openFaqs.includes(faq.id) && (
                        <div className="faq-answer">
                          <p className="faq-a-text">{faq.answer}</p>
                          
                          {/* Tags */}
                          <div className="faq-tags">
                            {faq.tags.map(tag => (
                              <span key={tag} className="faq-tag">{tag}</span>
                            ))}
                          </div>

                          {/* Helpful Actions */}
                          <div className="faq-actions">
                            <span className="faq-helpful-text">Was this helpful?</span>
                            <div className="faq-helpful-btns">
                              <button className="faq-helpful-btn">👍 Yes</button>
                              <button className="faq-helpful-btn">👎 No</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="faq-empty">
                    <HelpCircle size={48} />
                    <h3>No results found</h3>
                    <p>Try a different search term or browse by category</p>
                  </div>
                )}
              </div>

              {/* Still Have Questions */}
              <div className="faq-cta-section">
                <div className="faq-cta-content">
                  <h3 className="faq-cta-title">Still have questions?</h3>
                  <p className="faq-cta-text">
                    Can't find the answer you're looking for? Our support team is here to help.
                  </p>
                  <div className="faq-cta-buttons">
                    <a href="/contactus" className="faq-cta-btn primary">
                      Contact Support
                    </a>
                    <a href="/login" className="faq-cta-btn secondary">
                      View Documentation
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .faq-wrapper {
          width: 100%;
          background: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          min-height: 100vh;
        }

        .faq-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Hero Section */
        .faq-hero {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 80px 0 60px;
          border-bottom: 1px solid #e2e8f0;
        }

        .faq-hero-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .faq-title {
          font-size: 42px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 16px;
          background: linear-gradient(135deg, #3b82f6 0%, #0f6eea 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .faq-subtitle {
          font-size: 18px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 40px;
        }

        .faq-search-wrapper {
          position: relative;
          max-width: 600px;
          margin: 0 auto 40px;
        }

        .faq-search-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .faq-search-input {
          width: 100%;
          padding: 16px 60px 16px 52px;
          font-size: 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          outline: none;
          transition: all 0.3s;
          background: white;
        }

        .faq-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .faq-search-clear {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 12px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .faq-search-clear:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .faq-stats {
          display: flex;
          justify-content: center;
          gap: 40px;
          flex-wrap: wrap;
        }

        .faq-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .faq-stat-number {
          font-size: 32px;
          font-weight: 700;
          color: #3b82f6;
          line-height: 1;
          margin-bottom: 4px;
        }

        .faq-stat-label {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        /* Main Layout */
        .faq-main {
          padding: 60px 0;
        }

        .faq-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 40px;
        }

        /* Sidebar */
        .faq-sidebar {
          position: sticky;
          top: 20px;
          height: fit-content;
        }

        .faq-sidebar-header {
          margin-bottom: 32px;
        }

        .faq-sidebar-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .faq-sidebar-subtitle {
          font-size: 14px;
          color: #64748b;
        }

        .faq-categories {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 32px;
        }

        .faq-category-btn {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .faq-category-btn:hover {
          border-color: #3b82f6;
          color: #1e293b;
        }

        .faq-category-btn.active {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #3b82f6;
          font-weight: 600;
        }

        .faq-category-count {
          background: #f1f5f9;
          color: #64748b;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .faq-category-btn.active .faq-category-count {
          background: #3b82f6;
          color: white;
        }

        .faq-popular-section {
          margin-bottom: 32px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .faq-popular-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 16px;
        }

        .faq-popular-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-popular-item {
          background: none;
          border: none;
          text-align: left;
          padding: 10px 12px;
          font-size: 14px;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 8px;
          position: relative;
        }

        .faq-popular-item:hover {
          background: white;
          color: #3b82f6;
          transform: translateX(4px);
        }

        .faq-popular-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 4px;
          background: #3b82f6;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .faq-popular-item:hover::before {
          opacity: 1;
        }

        .faq-support-section {
          padding: 20px;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 12px;
        }

        .faq-support-title {
          font-size: 16px;
          font-weight: 600;
          color: #0c4a6e;
          margin-bottom: 16px;
        }

        .faq-support-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-support-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: white;
          border-radius: 8px;
          text-decoration: none;
          color: #0369a1;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .faq-support-option:hover {
          background: #e0f2fe;
          transform: translateX(4px);
        }

        /* Main Content */
        .faq-content {
          background: white;
        }

        .faq-results-header {
          margin-bottom: 32px;
        }

        .faq-results-title {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .faq-results-count {
          font-size: 15px;
          color: #64748b;
        }

        /* FAQ List */
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 60px;
        }

        .faq-item {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .faq-item.open {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }

        .faq-question {
          width: 100%;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }

        .faq-question:hover {
          background: #f8fafc;
        }

        .faq-q-text {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          flex: 1;
          padding-right: 16px;
        }

        .faq-arrow {
          color: #94a3b8;
          transition: transform 0.3s;
          flex-shrink: 0;
        }

        .faq-arrow.open {
          transform: rotate(180deg);
          color: #3b82f6;
        }

        .faq-answer {
          padding: 0 24px 20px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .faq-a-text {
          font-size: 15px;
          color: #475569;
          line-height: 1.7;
          margin-bottom: 16px;
        }

        .faq-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .faq-tag {
          padding: 4px 12px;
          background: #f1f5f9;
          color: #475569;
          font-size: 12px;
          border-radius: 16px;
          font-weight: 500;
        }

        .faq-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .faq-helpful-text {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        .faq-helpful-btns {
          display: flex;
          gap: 8px;
        }

        .faq-helpful-btn {
          padding: 6px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }

        .faq-helpful-btn:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        .faq-empty {
          text-align: center;
          padding: 60px 20px;
          color: #94a3b8;
        }

        .faq-empty h3 {
          font-size: 20px;
          font-weight: 600;
          margin: 16px 0 8px;
          color: #64748b;
        }

        .faq-empty p {
          font-size: 15px;
          color: #94a3b8;
        }

        /* CTA Section */
        .faq-cta-section {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 16px;
          padding: 48px;
          text-align: center;
        }

        .faq-cta-title {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 12px;
        }

        .faq-cta-text {
          font-size: 16px;
          color: #64748b;
          max-width: 500px;
          margin: 0 auto 32px;
          line-height: 1.6;
        }

        .faq-cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .faq-cta-btn {
          padding: 14px 32px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
          display: inline-block;
        }

        .faq-cta-btn.primary {
          background: linear-gradient(135deg, #3b82f6 0%, #0f6eea 100%);
          color: white;
          border: none;
        }

        .faq-cta-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
        }

        .faq-cta-btn.secondary {
          background: white;
          color: #3b82f6;
          border: 2px solid #3b82f6;
        }

        .faq-cta-btn.secondary:hover {
          background: #f8fafc;
          transform: translateY(-2px);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .faq-layout {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .faq-sidebar {
            position: relative;
            top: 0;
          }

          .faq-categories {
            flex-direction: row;
            flex-wrap: wrap;
          }

          .faq-category-btn {
            flex: 1;
            min-width: 200px;
          }
        }

        @media (max-width: 768px) {
          .faq-title {
            font-size: 32px;
          }

          .faq-subtitle {
            font-size: 16px;
          }

          .faq-stats {
            gap: 24px;
          }

          .faq-stat-number {
            font-size: 24px;
          }

          .faq-cta-section {
            padding: 32px 24px;
          }

          .faq-cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .faq-cta-btn {
            width: 100%;
            max-width: 300px;
          }
        }

        @media (max-width: 480px) {
          .faq-hero {
            padding: 60px 0 40px;
          }

          .faq-title {
            font-size: 28px;
          }

          .faq-question {
            padding: 16px 20px;
          }

          .faq-q-text {
            font-size: 15px;
          }

          .faq-actions {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default FAQPage;