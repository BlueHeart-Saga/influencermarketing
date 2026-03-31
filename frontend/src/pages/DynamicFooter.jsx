// Update your Footer.jsx to use dynamic data
import React, { useState, useEffect } from 'react';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaEnvelope, FaMapMarkerAlt , FaPhone } from 'react-icons/fa';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export default function DynamicFooter() {
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      const response = await axios.get(`${API_URL}/footer/active`);
      setFooterData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching footer:', error);
      setLoading(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (email) {
      // Here you would integrate with your newsletter API
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  if (loading) {
    return <div>Loading footer...</div>;
  }

  if (!footerData) {
    return <div>No footer configuration found</div>;
  }

  return (
    <footer className="enterprise-footer-wrapper" style={footerData.theme}>
      {/* Your existing footer structure with dynamic data */}
      <div className="footer-main-content">
        <div className="footer-content-container">
          <div className="footer-columns-grid">
            
            {/* Brand Column */}
            <div className="brand-info-column">
              {footerData.logo_url && (
                <img src={footerData.logo_url} alt={footerData.company_name} className="company-logo" />
              )}
              <h3>{footerData.company_name}</h3>
              {footerData.description && (
                <p className="company-description">{footerData.description}</p>
              )}
              
              {/* Social Links */}
              {footerData.social_links && footerData.social_links.length > 0 && (
                <div className="social-media-links">
                  {footerData.social_links.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.platform}
                    >
                      {/* You can map icons based on platform */}
                      {social.platform === 'facebook' && <FaFacebookF />}
                      {social.platform === 'twitter' && <FaTwitter />}
                      {social.platform === 'linkedin' && <FaLinkedinIn />}
                      {social.platform === 'instagram' && <FaInstagram />}
                    </a>
                  ))}
                </div>
              )}

              {/* Newsletter - if enabled */}
              {footerData.newsletter_enabled && (
                <div className="newsletter-subscription">
                  <h4>{footerData.newsletter_title}</h4>
                  {footerData.newsletter_description && (
                    <p className="newsletter-subtitle">{footerData.newsletter_description}</p>
                  )}
                  <form onSubmit={handleSubscribe} className="email-subscription-form">
                    <div className="email-input-container">
                      <FaEnvelope className="email-icon" />
                      <input 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <button type="submit">
                        {subscribed ? '✓' : '→'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Dynamic Columns */}
            {footerData.columns && footerData.columns
              .filter(column => column.is_active)
              .map((column, columnIndex) => (
                <div key={columnIndex} className="footer-links-column">
                  <h4>{column.title}</h4>
                  <ul>
                    {column.links && column.links
                      .filter(link => link.is_active)
                      .map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <a href={link.url} target={link.target}>
                            {link.text}
                          </a>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}

            {/* Contact Info Column */}
            {footerData.contact_info && footerData.contact_info.length > 0 && (
              <div className="footer-contact-column">
                <h4>Contact</h4>
                <div className="contact-details-section">
                  {footerData.contact_info
                    .filter(contact => contact.is_active)
                    .map((contact, index) => (
                      <div key={index} className="contact-info-item">
                        {/* You can map icons based on type */}
                        {contact.type === 'email' && <FaEnvelope />}
                        {contact.type === 'phone' && <FaPhone />}
                        {contact.type === 'address' && <FaMapMarkerAlt />}
                        <div>
                          {contact.label && <span className="info-label">{contact.label}</span>}
                          {contact.type === 'email' ? (
                            <a href={`mailto:${contact.value}`}>{contact.value}</a>
                          ) : contact.type === 'phone' ? (
                            <a href={`tel:${contact.value}`}>{contact.value}</a>
                          ) : (
                            <span>{contact.value}</span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom-bar">
        <div className="footer-content-container">
          <div className="bottom-bar-content">
            <div className="copyright-text">
              <p>{footerData.copyright_text}</p>
            </div>
            
            {/* Language Switcher */}
            {footerData.show_language_switcher && (
              <div className="language-switcher">
                {/* Your language switcher component */}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}