import React from 'react';
import { 
  FaTrophy, 
  FaStar, 
  FaShieldAlt, 
  FaGlobe,
  FaAward,
  FaMedal,
  FaLock,
  FaUsers
} from 'react-icons/fa';

const PartnershipScroll = () => {
  const partners = [
  // Existing partners...
  { 
    name: 'Nike', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
    width: 60,
    height: 20
  },
  { 
    name: 'Amazon', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    width: 90,
    height: 30
  },
  { 
    name: 'Stripe', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
    width: 70,
    height: 30
  },
  { 
    name: 'Microsoft', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
    width: 120,
    height: 25
  },
  { 
    name: 'Google', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    width: 80,
    height: 30
  },
  { 
    name: 'Apple', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    width: 30,
    height: 35
  },
  { 
    name: 'Meta', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
    width: 90,
    height: 20
  },
  { 
    name: 'Netflix', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    width: 80,
    height: 25
  },
  { 
    name: 'Spotify', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
    width: 30,
    height: 30
  },
  { 
    name: 'Adobe', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Adobe_Corporate_logo.svg',
    width: 70,
    height: 25
  },
  { 
    name: 'Salesforce', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
    width: 100,
    height: 25
  },
  { 
    name: 'Slack', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
    width: 30,
    height: 30
  },
  { 
    name: 'Zoom', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom_Communications_Logo.svg',
    width: 90,
    height: 25
  },
  { 
    name: 'Uber', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Uber_logo_2018.svg',
    width: 60,
    height: 25
  },
  { 
    name: 'Airbnb', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg',
    width: 70,
    height: 25
  },
  { 
    name: 'Tesla', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg',
    width: 80,
    height: 25
  },
  { 
    name: 'Samsung', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
    width: 100,
    height: 20
  },
  { 
    name: 'Sony', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg',
    width: 70,
    height: 25
  },

  // Marketing & Advertising Platforms
  { 
    name: 'HubSpot', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/HubSpot_Logo.svg',
    width: 100,
    height: 25
  },
  { 
    name: 'Mailchimp', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Mailchimp_logo_2018.svg',
    width: 120,
    height: 25
  },
  { 
    name: 'Shopify', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg',
    width: 100,
    height: 25
  },
  { 
    name: 'Canva', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_Logo_2023.svg',
    width: 80,
    height: 25
  },
  { 
    name: 'Hootsuite', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Hootsuite_logo_2018.svg',
    width: 110,
    height: 25
  },
  { 
    name: 'Buffer', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Buffer_Logo.svg',
    width: 80,
    height: 25
  },
  { 
    name: 'Semrush', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Semrush_Logo_%282023%29.svg',
    width: 100,
    height: 25
  },
  { 
    name: 'Ahrefs', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Ahrefs_Logo.svg',
    width: 90,
    height: 25
  },
  { 
    name: 'Moz', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Moz_Logo_2019.svg',
    width: 70,
    height: 25
  },
  { 
    name: 'Sprout Social', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Sprout_Social_Logo.svg',
    width: 120,
    height: 25
  },

  // Social Media Platforms
  { 
    name: 'TikTok', 
    logo: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg',
    width: 70,
    height: 25
  },
  { 
    name: 'Pinterest', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png',
    width: 80,
    height: 25
  },
  { 
    name: 'LinkedIn', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
    width: 25,
    height: 25
  },
  { 
    name: 'Twitter', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg',
    width: 25,
    height: 25
  },
  { 
    name: 'Instagram', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg',
    width: 25,
    height: 25
  },
  { 
    name: 'YouTube', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg',
    width: 80,
    height: 25
  },

  // Analytics & Data Platforms
  { 
    name: 'Google Analytics', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Google_Analytics_Logo_2020.svg',
    width: 120,
    height: 25
  },
  { 
    name: 'Mixpanel', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Mixpanel_Logo.png',
    width: 100,
    height: 25
  },
  { 
    name: 'Amplitude', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Amplitude_Logo.png',
    width: 110,
    height: 25
  },
  { 
    name: 'Hotjar', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/68/Hotjar_Logo.svg',
    width: 80,
    height: 25
  },

  // CRM & Marketing Automation
  { 
    name: 'Marketo', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Marketo_Logo_2018.svg',
    width: 100,
    height: 25
  },
  { 
    name: 'Pardot', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Pardot_Logo.png',
    width: 90,
    height: 25
  },
  { 
    name: 'ActiveCampaign', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/ActiveCampaign_Logo.svg',
    width: 130,
    height: 25
  },
  { 
    name: 'ConvertKit', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/ConvertKit_Logo.png',
    width: 110,
    height: 25
  },

  // E-commerce & Retail
  { 
    name: 'WooCommerce', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/09/WooCommerce_logo.svg',
    width: 120,
    height: 25
  },
  { 
    name: 'BigCommerce', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/BigCommerce_Logo.svg',
    width: 120,
    height: 25
  },
  { 
    name: 'Wix', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Wix_website_logo.svg',
    width: 60,
    height: 25
  },
  { 
    name: 'Squarespace', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Squarespace_Logo.svg',
    width: 120,
    height: 25
  },

  // Content & SEO
  { 
    name: 'WordPress', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/98/WordPress_blue_logo.svg',
    width: 120,
    height: 25
  },
  { 
    name: 'Contentful', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Contentful_Logo.svg',
    width: 110,
    height: 25
  },
  { 
    name: 'Grammarly', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Grammarly_Logo.svg',
    width: 100,
    height: 25
  },
  { 
    name: 'BuzzSumo', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/BuzzSumo_Logo.png',
    width: 110,
    height: 25
  },

  // Video & Multimedia
  { 
    name: 'Vimeo', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Vimeo_Logo.svg',
    width: 80,
    height: 25
  },
  { 
    name: 'Wistia', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Wistia_Logo.svg',
    width: 80,
    height: 25
  },
  { 
    name: 'Loom', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Loom_Logo.png',
    width: 70,
    height: 25
  },

  // Influencer Marketing Specific
  { 
    name: 'AspireIQ', 
    logo: 'https://images.g2crowd.com/uploads/product/image/social_landscape/social_landscape_8f4562c6c3739d2b0a9e0e6b6c9c0e6b/aspireiq.png',
    width: 100,
    height: 25
  },
  { 
    name: 'Traackr', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Traackr_Logo.png',
    width: 90,
    height: 25
  },
  { 
    name: 'Upfluence', 
    logo: 'https://images.g2crowd.com/uploads/product/image/social_landscape/social_landscape_7a9c8c8f8f8f8f8f8f8f8f8f8f8f8f8f/upfluence.png',
    width: 100,
    height: 25
  },
  { 
    name: 'Klear', 
    logo: 'https://images.g2crowd.com/uploads/product/image/social_landscape/social_landscape_8f4562c6c3739d2b0a9e0e6b6c9c0e6b/klear.png',
    width: 80,
    height: 25
  }
];

  // Duplicate the array to create seamless loop
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="partnership-section">
      <div className="partnership-container">
        {/* Section Header */}
        <div className="partnership-header">
          <h2 className="partnership-title">
            Trusted by Industry Leaders
          </h2>
          <p className="partnership-subtitle">
            Join 10,000+ companies worldwide that trust our platform
          </p>
        </div>

        {/* Infinite Scroll Container */}
        <div className="scroll-container">
          <div className="scroll-track">
            {duplicatedPartners.map((partner, index) => (
              <div 
                key={`${partner.name}-${index}`}
                className="partner-logo"
                title={partner.name}
              >
                <div className="logo-image-container">
                  <img 
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="logo-image"
                    width={partner.width}
                    height={partner.height}
                    loading="lazy"
                  />
                </div>
                <span className="partner-name">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        {/* Alternative Trust Badges with different icons */}
{/* <div className="trust-badges">
  <div className="trust-badge">
    <div className="badge-icon">
      <FaAward />
    </div>
    <span>Industry Leader</span>
  </div>
  <div className="trust-badge">
    <div className="badge-icon">
      <FaMedal />
    </div>
    <span>Award Winning</span>
  </div>
  <div className="trust-badge">
    <div className="badge-icon">
      <FaLock />
    </div>
    <span>Enterprise Security</span>
  </div>
  <div className="trust-badge">
    <div className="badge-icon">
      <FaUsers />
    </div>
    <span>10K+ Customers</span>
  </div>
</div> */}
      </div>

      <style jsx>{`
        .partnership-section {
          
          padding: 80px 0;
          
          
        }

        .partnership-container {
          max-width: 1200px;
          margin: 0 auto;
          
        }

        .partnership-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .partnership-title {
          font-size: 36px;
          font-weight: 700;
          color: #000000;
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        }

        .partnership-subtitle {
          font-size: 18px;
          color: #000000;
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .scroll-container {
  width: 100vw;         /* FULL SCREEN WIDTH */
  margin: 60px 0 0 50%; 
  transform: translateX(-50%); 
  position: relative;
  overflow: hidden;
  padding: 20px 0;
  mask: linear-gradient(
    90deg,
    transparent,
    white 10%,
    white 90%,
    transparent
  );
  -webkit-mask: linear-gradient(
    90deg,
    transparent,
    white 10%,
    white 90%,
    transparent
  );
}


        .scroll-track {
          display: flex;
          animation: scroll 40s linear infinite;
          gap: 0;
          align-items: center;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .partner-logo {
          flex: 0 0 auto;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          align-items: center;
          padding: 24px 32px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin: 0 12px;
          transition: all 0.3s ease;
          min-width: 140px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .partner-logo:hover {
          transform: translateY(-4px);
          border-color: #6366f1;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
        }

        .logo-image-container {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          height: 40px;
          margin-bottom: 12px;
          transition: transform 0.3s ease;
        }

        .partner-logo:hover .logo-image-container {
          transform: scale(1.05);
        }

        .logo-image {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          opacity: 1;
          transition: all 0.3s ease;
        }

        .partner-logo:hover .logo-image {
          filter: grayscale(0%);
          opacity: 1;
        }

        .partner-name {
          font-size: 14px;
          font-weight: 600;
          color: #000000;
          text-align: center;
          transition: color 0.3s ease;
        }

        .partner-logo:hover .partner-name {
          color: #000000;
        }

        .trust-badges {
          display: flex;
          justify-content: center;
          gap: 32px;
          flex-wrap: wrap;
          margin-top: 60px;
        }

        .trust-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .trust-badge:hover {
          border-color: #0f6eeaff ;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.1);
        }

        .badge-icon {
          font-size: 20px;
          color: #0f6eeaff ;
          

        }

        .trust-badge span {
          font-size: 14px;
          font-weight: 600;
          color: #000000;
        }

        /* Pause animation on hover */
        .scroll-container:hover .scroll-track {
          animation-play-state: paused;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .partnership-section {
            padding: 60px 0;
          }

          .partnership-title {
            font-size: 28px;
          }

          .partnership-subtitle {
            font-size: 16px;
          }

          .partner-logo {
            padding: 20px 24px;
            min-width: 120px;
            margin: 0 8px;
          }

          .logo-image-container {
            height: 35px;
          }

          .partner-name {
            font-size: 13px;
          }

          .trust-badges {
            gap: 16px;
            margin-top: 40px;
          }

          .trust-badge {
            padding: 12px 16px;
          }

          .scroll-track {
            animation-duration: 30s;
          }
        }

        @media (max-width: 640px) {
          .partnership-container {
            padding: 0 20px;
          }

          .partnership-title {
            font-size: 24px;
          }

          .scroll-container {
            margin: 40px 0;
          }

          .partner-logo {
            padding: 16px 20px;
            min-width: 110px;
            margin: 0 6px;
          }

          .logo-image-container {
            height: 30px;
          }

          .trust-badges {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .trust-badge {
            justify-content: center;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .partnership-section {
            padding: 40px 0;
          }

          .partnership-header {
            margin-bottom: 40px;
          }

          .partner-logo {
            padding: 12px 16px;
            min-width: 100px;
          }

          .logo-image-container {
            height: 25px;
            margin-bottom: 8px;
          }

          .partner-name {
            font-size: 12px;
          }

          .scroll-track {
            animation-duration: 25s;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .scroll-track {
            animation: none;
            justify-content: center;
            flex-wrap: wrap;
            gap: 16px;
            transform: none !important;
          }

          .scroll-container {
            overflow: visible;
            mask: none;
            -webkit-mask: none;
          }

          .partner-logo {
            margin: 8px;
          }
        }
      `}</style>
    </section>
  );
};

export default PartnershipScroll;