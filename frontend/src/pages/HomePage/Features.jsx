import React from 'react';
import { CheckCircle, TrendingUp, Users, Megaphone, Handshake, BarChart3, Rocket, MessageCircle, DollarSign, Target, Zap, Activity } from 'lucide-react';



const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director at TechCorp',
    content: 'Brio transformed how we approach influencer marketing. The AI recommendations are incredibly accurate.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    name: 'Michael Chen',
    role: 'Founder of GrowthLabs',
    content: 'We reduced our campaign setup time by 80%. The automation features are game-changing.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Social Media Manager',
    content: 'The analytics dashboard gives us insights we never had before. Absolutely essential tool.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    name: 'Jason Patel',
    role: 'Head of Digital at BrandWave',
    content: 'Our influencer discovery process is now 10x faster. Brio is a must-have for modern brands.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/14.jpg'
  },
  {
    name: 'Laura Simmons',
    role: 'Content Strategist at NovaMedia',
    content: 'The predictive content tools are incredible. They helped us publish at the most effective times.',
    rating: 4,
    avatar: 'https://randomuser.me/api/portraits/women/21.jpg'
  },
  {
    name: 'David Martinez',
    role: 'CEO at MarketLaunch',
    content: 'Brio enabled our small team to run large-scale influencer campaigns effortlessly.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
  },
  {
    name: 'Priya Kapoor',
    role: 'Brand Manager at StyleSphere',
    content: 'The creator matching accuracy is unreal. We found our top-performing influencers through Brio.',
    rating: 4,
    avatar: 'https://randomuser.me/api/portraits/women/55.jpg'
  },
  {
    name: 'James Walker',
    role: 'E-commerce Growth Lead',
    content: 'Affiliate tracking + influencer campaigns in one platform? Perfect combination for scaling revenue.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/29.jpg'
  },
  {
    name: 'Monica Lee',
    role: 'Creative Director at TrendLab',
    content: 'Our entire workflow became smoother. Collaboration tools eliminate endless email threads.',
    rating: 4,
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg'
  },
  {
    name: 'Carlos Mendes',
    role: 'Performance Marketing Specialist',
    content: 'The analytics accuracy and attribution insights genuinely exceeded our expectations.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/61.jpg'
  },
  {
    name: 'Anna Schultz',
    role: 'Influencer Relations at BoostCo',
    content: 'Managing hundreds of creators became painless. Brio centralizes everything beautifully.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/11.jpg'
  },
  {
    name: 'Ryan Brooks',
    role: 'Owner of Brooks Fitness',
    content: 'I grew my brand faster thanks to personalized influencer suggestions that actually work.',
    rating: 4,
    avatar: 'https://randomuser.me/api/portraits/men/78.jpg'
  },
  {
    name: 'Olivia Carter',
    role: 'Senior Content Manager',
    content: 'The ease of launching campaigns is unmatched. Even our interns use it confidently.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/72.jpg'
  },
  {
    name: 'Arjun Mehta',
    role: 'Founder of DynaTech',
    content: 'Brio has become an integral part of our marketing stack. Automation saves hours weekly.',
    rating: 4,
    avatar: 'https://randomuser.me/api/portraits/men/53.jpg'
  },
  {
    name: 'Sophia Kim',
    role: 'Brand Strategist',
    content: 'Beautiful UI, easy workflows, powerful AI. Everything we need in one place.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/25.jpg'
  },
  {
    name: 'Ethan Wright',
    role: 'Digital Campaign Manager',
    content: 'We increased engagement by 300% using optimized posting times from the content engine.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/28.jpg'
  },
  {
    name: 'Maria Lopes',
    role: 'CMO at BrightReach',
    content: 'The platform helps us measure ROI in real-time. No more guessing what works.',
    rating: 4,
    avatar: 'https://randomuser.me/api/portraits/women/63.jpg'
  },
  {
    name: 'Henry Adams',
    role: 'Influencer Outreach Lead',
    content: 'Messaging creators and tracking responses is so organized now. Huge improvement!',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/64.jpg'
  },
  {
    name: 'Zara Ahmed',
    role: 'E-commerce Founder',
    content: 'We started seeing results in the first week. The AI picks influencers better than agencies.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/60.jpg'
  },
  {
    name: 'Leo Turner',
    role: 'Social Growth Lead',
    content: 'Finally a platform that understands influencer marketing deeply. Every feature feels thoughtful.',
    rating: 4,
    avatar: 'https://randomuser.me/api/portraits/men/41.jpg'
  },
  {
    name: 'Hannah Cooper',
    role: 'Marketing Coordinator',
    content: 'Easy onboarding, clean dashboard, powerful insights. Love everything about Brio.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/41.jpg'
  },
  {
    name: 'Victor Silva',
    role: 'CEO at AdScale',
    content: 'Our team replaced three tools with this one platform. Saves money and time.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/74.jpg'
  },
  {
    name: 'Isabella Morris',
    role: 'PR & Communications Lead',
    content: 'Great for building long-term creator partnerships. Everything is neatly organized.',
    rating: 4,
    avatar: 'https://randomuser.me/api/portraits/women/39.jpg'
  },
  {
    name: 'Marcus Rivera',
    role: 'Ad Campaign Specialist',
    content: 'Automation + precision analytics = unbeatable performance. Highly recommended.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/26.jpg'
  },
  {
    name: 'Natalie Evans',
    role: 'Lifestyle Brand Owner',
    content: 'Brio helped increase our monthly sales through targeted influencer promotions.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/58.jpg'
  },
  {
    name: 'Tom Harrington',
    role: 'Senior Growth Analyst',
    content: 'The level of detail in the analytics is unmatched. Perfect for data-driven teams.',
    rating: 4,
    avatar: 'https://randomuser.me/api/portraits/men/23.jpg'
  },
  {
    name: 'Chloe Ramirez',
    role: 'Creative Producer',
    content: 'Smooth collaboration system. No more chaos handling revisions with influencers.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/66.jpg'
  },
  {
    name: 'Brian Foster',
    role: 'Marketing Consultant',
    content: 'Good platform overall, though the reporting features could use some improvements.',
    rating: 3,
    avatar: 'https://randomuser.me/api/portraits/men/19.jpg'
  },
  {
    name: 'Jessica Park',
    role: 'Digital Marketing Manager',
    content: 'Solid tool for the price. Helped us scale our influencer campaigns effectively.',
    rating: 4,
    avatar: 'https://randomuser.me/api/portraits/women/16.jpg'
  },
  {
    name: 'Alex Morgan',
    role: 'Startup Founder',
    content: 'Great concept, but I wish the mobile app was more polished. Desktop experience is excellent though.',
    rating: 4,
    avatar: 'https://randomuser.me/api/portraits/men/35.jpg'
  },
  {
    name: 'Maya Thompson',
    role: 'Content Creator Manager',
    content: 'The influencer database is extensive, but filtering options could be more granular.',
    rating: 3,
    avatar: 'https://randomuser.me/api/portraits/women/27.jpg'
  },
  {
    name: 'Kevin Zhao',
    role: 'E-commerce Operations',
    content: 'Saved us countless hours on campaign coordination. Definitely worth the investment.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/81.jpg'
  },
  {
    name: 'Rachel Green',
    role: 'Social Media Lead',
    content: 'Implementation was smooth and customer support was responsive when we had questions.',
    rating: 4,
    avatar: 'https://randomuser.me/api/portraits/women/49.jpg'
  },
  {
    name: 'Samuel Wright',
    role: 'Agency Director',
    content: 'We manage multiple clients on this platform. Works well for agency use cases.',
    rating: 4,
    avatar: 'https://randomuser.me/api/portraits/men/42.jpg'
  },
  {
    name: 'Lisa Wang',
    role: 'Product Marketing Lead',
    content: 'The ROI tracking feature alone justifies the cost. Very transparent performance metrics.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/30.jpg'
  },
  {
    name: 'Daniel Ross',
    role: 'Growth Hacker',
    content: 'Brio helped us identify micro-influencers that deliver exceptional engagement rates.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/66.jpg'
  },
  {
    name: 'Amanda Clark',
    role: 'Brand Partnerships Manager',
    content: 'Contract management feature needs work, but the core influencer discovery is top-notch.',
    rating: 3,
    avatar: 'https://randomuser.me/api/portraits/women/52.jpg'
  },
  {
    name: 'Robert Kim',
    role: 'Marketing Analyst',
    content: 'Data accuracy is impressive. Integrates well with our existing marketing stack.',
    rating: 4,
    avatar: 'https://randomuser.me/api/portraits/men/24.jpg'
  },
  {
    name: 'Jennifer Lee',
    role: 'Small Business Owner',
    content: 'Perfect for businesses just starting with influencer marketing. User-friendly and effective.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/19.jpg'
  }
];

function Features() {
  return (
    <div className="qb-features-wrapper">
      {/* Influencer Discovery Section */}
      <section className="qb-features-discovery-section">
        <div className="qb-features-container">
          <div className="qb-features-discovery-grid">
            <div className="qb-features-discovery-left">
              <img
                src="/images/influencers-list.png"
                alt="Brio AI Influencer Discovery Interface - Filter and Search Vetted Creators"
                className="qb-features-discovery-image"
              />
            </div>
            <div className="qb-features-discovery-right">
              <h2 className="qb-features-section-title">INFLUENCER DISCOVERY</h2>
              <div className="qb-features-discovery-list">
                <div className="qb-features-discovery-item">
                  <CheckCircle size={20} className="qb-features-check-icon" />
                  <span>Discover influencers who genuinely fit your brand</span>
                </div>
                <div className="qb-features-discovery-item">
                  <CheckCircle size={20} className="qb-features-check-icon" />
                  <span>Not just more creators. The right creators.</span>
                </div>
                <div className="qb-features-discovery-item">
                  <CheckCircle size={20} className="qb-features-check-icon" />
                  <span>Insight-powered decision-making</span>
                </div>
                <div className="qb-features-discovery-item">
                  <CheckCircle size={20} className="qb-features-check-icon" />
                  <span>Let creators find YOU</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Campaign Speed Section */}
      <section className="qb-features-campaign-section">
        <div className="qb-features-container">
          <div className="qb-features-campaign-grid">
            <div className="qb-features-campaign-content">
              <h2 className="qb-features-section-title">CAMPAIGNS THAT MOVE AT YOUR SPEED</h2>
              <p className="qb-features-campaign-text">
                Paste your product link and provide the key details.
                Our AI instantly analyzes your product and gets to work.
                Within moments, it generates a complete, ready-to-launch campaign.
              </p>
              <p className="qb-features-campaign-text-secondary">
                Just share the basics and receive your campaign in minutes.
              </p>
            </div>
            <div className="qb-features-campaign-image-wrapper">
              <img
                src="/images/campaign-creation.png"
                alt="High-Speed AI Campaign Creation Workflow in Brio Platform"
                className="qb-features-campaign-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="qb-features-main-section">
        <div className="qb-features-container">
          <div className="qb-features-grid">
            {/* AI-Powered Campaign Management */}
            <div className="qb-features-card qb-features-card-large">
              <h3 className="qb-features-card-title">
                AI-Powered Campaign Management
              </h3>

              <p className="qb-features-card-description">
                Manage influencer campaigns end-to-end with AI-driven precision.
              </p>

              {/* Bullet Points */}
              <ul className="qb-features-bullet-list">
                <li>
                  <CheckCircle size={16} />
                  One-click campaign creation & automation
                </li>
                <li>
                  <CheckCircle size={16} />
                  Centralized creator communication & approvals
                </li>
                <li>
                  <CheckCircle size={16} />
                  Smart timelines, briefs & deliverable tracking
                </li>
                <li>
                  <CheckCircle size={16} />
                  AI insights to optimize performance in real time
                </li>
              </ul>

              <div className="qb-features-card-image-wrapper">
                <img
                  src="/images/campaign-dashboard.png"
                  alt="Brio Centralized Campaign Management and Automation Dashboard"
                  className="qb-features-card-image"
                />
              </div>
            </div>


            {/* Smart Matching & Outreach */}
            <div className="qb-features-card qb-features-card-medium">
              <h3 className="qb-features-card-title">Smart Matching & Outreach</h3>
              <p className="qb-features-card-description">
                Connect with ideal creators using AI that identifies authentic, high-performing influencers tailored to your brand.
              </p>




              <div className="qb-features-card-image-wrapper">
                <img
                  src="/images/matching-interface.png"
                  alt="Smart Influencer Matching and Automated Outreach Interface"
                  className="qb-features-card-image"
                />
              </div>
            </div>

            {/* Automated Performance Tracking */}
            <div className="qb-features-card qb-features-card-medium">
              <h3 className="qb-features-card-title">Automated Performance Tracking</h3>
              <p className="qb-features-card-description">
                Real-time analytics and ROI measurement for all campaigns.
                Track engagement, conversions, and creator performance instantly.
                Make smarter decisions with data-driven insights at every step.
              </p>
              <div className="qb-features-card-image-wrapper">
                <img
                  src="/images/analytics-dashboard.png"
                  alt="Real-time Influencer Performance and ROI Tracking Analytics"
                  className="qb-features-card-image"
                />
              </div>
            </div>

            {/* Targeted Audience Reach */}
            {/* <div className="qb-features-card qb-features-card-icon">
              <div className="qb-features-icon-container">
                <Megaphone size={32} className="qb-features-icon" />
              </div>
              <h3 className="qb-features-card-title">Targeted Audience Reach</h3>
            </div> */}

            {/* Effortless Collaboration */}
            {/* <div className="qb-features-card qb-features-card-icon">
              <div className="qb-features-icon-container">
                <Handshake size={32} className="qb-features-icon" />
              </div>
              <h3 className="qb-features-card-title">Effortless Collaboration</h3>
            </div> */}

            {/* Predictive Content Strategy */}
            {/* <div className="qb-features-card qb-features-card-large">
              <h3 className="qb-features-card-title">Predictive Content Strategy</h3>
              <p className="qb-features-card-description">
                Generate high-impact content ideas and optimize timing.
              </p>
              <div className="qb-features-card-image-wrapper">
                <img 
                  src="/images/content-calendar.png" 
                  alt="Content Strategy Calendar" 
                  className="qb-features-card-image"
                />
              </div>
            </div> */}

            {/* Real-Time Analytics */}
            {/* <div className="qb-features-card qb-features-card-icon">
              <div className="qb-features-icon-container">
                <BarChart3 size={32} className="qb-features-icon" />
              </div>
              <h3 className="qb-features-card-title">Real-Time Analytics</h3>
            </div> */}

            {/* Scalable Growth */}
            {/* <div className="qb-features-card qb-features-card-icon">
              <div className="qb-features-icon-container">
                <Rocket size={32} className="qb-features-icon" />
              </div>
              <h3 className="qb-features-card-title">Scalable Growth</h3>
            </div> */}
          </div>
        </div>
      </section>



      {/* Affiliate Marketing Section */}
      <section className="qb-features-affiliate-section">
        <div className="qb-features-container">
          <div className="qb-features-affiliate-grid">
            <div className="qb-features-affiliate-image-wrapper">
              <img
                src="/images/ecommerce-stats.png"
                alt="E-commerce ROI and Conversion Statistics Driven by Brio AI"
                className="qb-features-affiliate-image"
              />
            </div>
            <div className="qb-features-affiliate-content">
              <h2 className="qb-features-section-title">AFFILIATE MARKETING MADE SMARTER</h2>
              <p className="qb-features-affiliate-text">
                Boost ROI with influencer-driven affiliate marketing.
                Manage campaigns, tracking, and payouts in one place.
                Drive more traffic to your product pages to increase sales.
                Reward influencers with performance-based instant payments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Collaboration Section */}
      {/* <section className="qb-features-collaboration-section">
        <div className="qb-features-container">
          <div className="qb-features-collaboration-grid">
            <div className="qb-features-collaboration-content">
              <h2 className="qb-features-section-title">STREAMLINED CREATOR COLLABORATIONS</h2>
              <p className="qb-features-collaboration-text">
                Simplify the entire creator relationship lifecycle: one hub 
                from discovery and briefing to content approval and payments. 
                Eliminate scattered email chains with centralized communication. 
                Launch campaigns faster and manage relationships efficiently.
              </p>
            </div>
            <div className="qb-features-collaboration-image-wrapper">
              <img 
                src="/images/creator-chat.png" 
                alt="Creator Communication Interface" 
                className="qb-features-collaboration-image"
              />
            </div>
          </div>
        </div>
      </section> */}

      {/* Why Choose Quickbox Section */}
      {/* <section className="qb-features-why-section">
        <div className="qb-features-container">
          <div className="qb-features-why-header">
            <h2 className="qb-features-why-title">Why Brands Choose Quickbox</h2>
            <p className="qb-features-why-subtitle">
              Our platform is designed to simplify influencer marketing while maximizing your ROI
            </p>
          </div>
          
          <div className="qb-features-why-grid">
            <div className="qb-features-why-card">
              <div className="qb-features-why-icon-wrapper">
                <div className="qb-features-why-icon-bg">
                  <Target size={32} className="qb-features-why-icon" />
                </div>
              </div>
              <h3 className="qb-features-why-card-title">AI-Powered Matching</h3>
              <p className="qb-features-why-card-text">
                Our algorithm finds the ideal influencers based on audience demographics, content style, engagement, and context fit.
              </p>
            </div>

            <div className="qb-features-why-card">
              <div className="qb-features-why-icon-wrapper">
                <div className="qb-features-why-icon-bg">
                  <Zap size={32} className="qb-features-why-icon" />
                </div>
              </div>
              <h3 className="qb-features-why-card-title">Campaign Management</h3>
              <p className="qb-features-why-card-text">
                Create, track, and optimize campaigns effortlessly with built-in collaboration, briefing, and approval tools. Multitask with one-click insights.
              </p>
            </div>

            <div className="qb-features-why-card">
              <div className="qb-features-why-icon-wrapper">
                <div className="qb-features-why-icon-bg">
                  <Users size={32} className="qb-features-why-icon" />
                </div>
              </div>
              <h3 className="qb-features-why-card-title">Influencer Network</h3>
              <p className="qb-features-why-card-text">
                Tap into a vetted network of creators spanning industries and regions. Discover micro, macro, and mega influencers across all major platforms.
              </p>
            </div>

            <div className="qb-features-why-card">
              <div className="qb-features-why-icon-wrapper">
                <div className="qb-features-why-icon-bg">
                  <Activity size={32} className="qb-features-why-icon" />
                </div>
              </div>
              <h3 className="qb-features-why-card-title">Performance Analytics</h3>
              <p className="qb-features-why-card-text">
                Track ROI, engagement, and conversions in real time. Dive deep into performance metrics, attribution models, and detailed reports.
              </p>
            </div>
          </div>
        </div>
      </section> */}


      {/* <section className="qb-testimonials-section">
        <div className="qb-testimonials-scroller">
          {[...testimonials, ...testimonials].map((t, i) => (
            <div key={i} className="qb-testimonial-card">
              <div className="qb-testimonial-rating">
                {'★'.repeat(t.rating)}
              </div>
              <p className="qb-testimonial-text">"{t.content}"</p>
              <div className="qb-testimonial-author">
                <div className="qb-author-avatar">
                  <img src={t.avatar} alt={t.name} />
                </div>
                <div className="qb-author-info">
                  <strong className="qb-author-name">{t.name}</strong>
                  <span className="qb-author-role">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .qb-features-wrapper {
          width: 100%;
          background: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .qb-features-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          flex-direction: column;
        }

        /* Influencer Discovery Section */
        .qb-features-discovery-section {
          padding: 60px 0;
          background: #ffffff;
        }

        .qb-features-discovery-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .qb-features-discovery-left {
          position: relative;
        }

        .qb-features-discovery-image {
          width: 100%;
          height: auto;
        }

        .qb-features-discovery-right {
          padding-left: 20px;
        }

        .qb-features-section-title {
          font-size: 24px;
          font-weight: 700;
          color: #0f6eea;
          margin-bottom: 30px;
          letter-spacing: 0.5px;
        }

        .qb-features-discovery-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .qb-features-discovery-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .qb-features-check-icon {
          color: #0f6eea;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .qb-features-discovery-item span {
          font-size: 16px;
          color: #1e293b;
          line-height: 1.6;
        }

        /* Main Features Grid */
        .qb-features-main-section {
          padding: 60px 0;
        }

        .qb-features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: auto;
          gap: 20px;
          
        }

        .qb-features-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e5e7eb; /* exact border from screenshot */
  box-shadow: none; /* remove shadow */
  transition: all 0.25s ease;
}

        .qb-features-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .qb-features-card-large {
          grid-column: span 2;
          grid-row: span 2 !important;
          border: 1px solid #6a6b6d52;
  border-radius: 12px;
  display: flex;
      flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
        }

        .qb-features-bullet-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.qb-features-bullet-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: #1e293b;
  line-height: 1.6;
}

.qb-features-bullet-list li svg {
  color: #0f6eea;
  flex-shrink: 0;
  margin-top: 2px;
}

.qb-features-card:hover .qb-features-bullet-list li {
  transform: translateX(2px);
  transition: transform 0.2s ease;
}


        .qb-features-card-medium {
          grid-column: span 1;
          grid-row: span 2 !important;
          border: 1px solid #6a6b6d52;
  border-radius: 12px;
  display: flex;
      flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
        }

        .qb-features-card-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          min-height: 140px; 
          padding: 20px 16px;
          grid-column: span 1;
          grid-row: span 1 !important;
          border: 1px solid #6a6b6d52;
        }

        .qb-features-card-title {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 12px;
        }

        .qb-features-card-description {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 20px;
          flex-grow: 1;
        }

        .qb-features-card-image-wrapper {
          width: 100%;
          overflow: hidden;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #6a6b6d52;
          
        }

        .qb-features-card-image {
          width: 100%;
          height: auto;
          display: block;
        }

        .qb-features-icon-container {
          width: 50px;
  height: 50px;
  border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .qb-features-icon {
          color: #524e4eff;
          transform: scale(0.8); 
        }

        /* Campaign Speed Section */
        .qb-features-campaign-section {
          padding: 60px 0;
        }

        .qb-features-campaign-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .qb-features-campaign-content {
          padding-right: 20px;
        }

        .qb-features-campaign-text {
          font-size: 16px;
          color: #1e293b;
          line-height: 1.7;
          margin-bottom: 16px;
        }

        .qb-features-campaign-text-secondary {
          font-size: 16px;
          color: #64748b;
          line-height: 1.7;
          font-style: italic;
        }

        .qb-features-campaign-image-wrapper {
          position: relative;
        }

        .qb-features-campaign-image {
          width: 100%;
          height: auto;
        }

        /* Affiliate Marketing Section */
        .qb-features-affiliate-section {
          padding: 60px 0;
        }

        .qb-features-affiliate-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .qb-features-affiliate-image-wrapper {
          position: relative;
        }

        .qb-features-affiliate-image {
          width: 100%;
          height: auto;
        }

        .qb-features-affiliate-content {
          padding-left: 20px;
        }

        .qb-features-affiliate-text {
          font-size: 16px;
          color: #1e293b;
          line-height: 1.7;
        }

        /* Creator Collaboration Section */
        .qb-features-collaboration-section {
          padding: 60px 0;
          background: #ffffff;
        }

        .qb-features-collaboration-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .qb-features-collaboration-content {
          padding-right: 20px;
        }

        .qb-features-collaboration-text {
          font-size: 16px;
          color: #1e293b;
          line-height: 1.7;
        }

        .qb-features-collaboration-image-wrapper {
          position: relative;
        }

        .qb-features-collaboration-image {
          width: 100%;
          height: auto;
        }

        /* Why Choose Quickbox Section */
.qb-features-why-section {
  padding: 80px 0;
}

.qb-features-why-header {
  text-align: center;
  margin-bottom: 60px;
}

.qb-features-why-title {
  font-size: 32px;
  font-weight: 700;
  color: #0f6eea;
  margin-bottom: 12px;
}

.qb-features-why-subtitle {
  font-size: 16px;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* EXACT GRID LIKE YOUR IMAGE */
.qb-features-why-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  justify-items: center;
}

.qb-features-why-card:nth-child(4) {
  grid-column: 2 / 3; /* Center bottom card */
}

/* Card container */
.qb-features-why-card {
  width: 100%;
  max-width: 340px;
  background: #ffffff;
  border-radius: 14px;
  padding: 32px 28px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  transition: all 0.25s ease;
  text-align: center;
}

.qb-features-why-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-3px);
}

/* Icon wrapper EXACT STYLE FROM SCREENSHOT */
.qb-features-why-icon-bg {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.qb-features-why-icon {
  color: #454343ff;
  width: 28px;
  height: 28px;
}

/* Title & Text */
.qb-features-why-card-title {
  font-size: 17px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.qb-features-why-card-text {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 900px) {
  .qb-features-why-grid {
    grid-template-columns: 1fr 1fr;
  }

  .qb-features-why-card:nth-child(4) {
    grid-column: unset;
  }
}

@media (max-width: 640px) {
  .qb-features-why-grid {
    grid-template-columns: 1fr;
  }
}

/* Testimonials */
        .qb-testimonials-section {
          padding: 6rem 0;
          overflow: hidden;
          
        }

        .qb-testimonials-scroller {
          display: flex;
          gap: 2rem;
          animation: qbTestimonialScroll 30s linear infinite;
          
        }

        .qb-testimonial-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  border: 2px solid #e2e8f0;
  flex: 0 0 350px;
  transition: all 0.3s ease;

  /* NEW */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 320px; 
}

.qb-testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

        .qb-testimonial-rating {
  color: #fbbf24;
  margin-bottom: 1rem;
  font-size: 1.125rem;
}

.qb-testimonial-text {
  font-size: 1rem;
  color: #334155;
  line-height: 1.6;
  font-style: italic;

  /* NEW */
  flex-grow: 1;
  margin-bottom: 1.5rem;
}

.qb-testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

        .qb-author-avatar {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          overflow: hidden;
        }

        .qb-author-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .qb-author-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .qb-author-name {
          font-size: 1rem;
          color: #0f172a;
          font-weight: 600;
        }

        .qb-author-role {
          font-size: 0.875rem;
          color: #64748b;
        }

        @keyframes qbTestimonialScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }



        /* Responsive Design */
        @media (max-width: 1024px) {
          .qb-features-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .qb-features-card-large {
            grid-column: span 2;
          }

          .qb-features-card-medium {
            grid-column: span 1;
          }

          .qb-features-card-icon {
            grid-column: span 1;
          }

          

          .qb-features-discovery-grid,
          .qb-features-campaign-grid,
          .qb-features-affiliate-grid,
          .qb-features-collaboration-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .qb-features-discovery-right,
          .qb-features-campaign-content,
          .qb-features-affiliate-content,
          .qb-features-collaboration-content {
            padding: 0;
          }
        }

        @media (max-width: 768px) {
          .qb-features-grid {
            grid-template-columns: 1fr;
          }

          .qb-features-card-large,
          .qb-features-card-medium,
          .qb-features-card-icon {
            grid-column: span 1;
          }
        }

        @media (max-width: 640px) {
          .qb-features-why-grid {
            grid-template-columns: 1fr;
          }

          .qb-features-section-title {
            font-size: 20px;
          }

          .qb-features-why-title {
            font-size: 28px;
          }

          .qb-features-discovery-section,
          .qb-features-main-section,
          .qb-features-campaign-section,
          .qb-features-affiliate-section,
          .qb-features-collaboration-section,
          .qb-features-why-section {
            padding: 40px 0;
          }
        }
      `}</style>
    </div>
  );
}

export default Features;