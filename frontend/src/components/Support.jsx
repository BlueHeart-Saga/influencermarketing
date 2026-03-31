// import React, { useState } from "react";
// import "../style/Support.css";
// import HomeTopBar from "../pages/HomePage/HomeTopBar";

// export default function Support() {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     subject: "",
//     priority: "normal",
//     message: "",
//     attachment: null
//   });

//   const [activeTab, setActiveTab] = useState("contact");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleFileChange = (e) => {
//     setFormData({ ...formData, attachment: e.target.files[0] });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
    
//     // Simulate API call
//     setTimeout(() => {
//       alert("Thank you for contacting us! We'll get back to you within 24 hours.");
//       setFormData({ 
//         name: "", 
//         email: "", 
//         subject: "", 
//         priority: "normal",
//         message: "",
//         attachment: null
//       });
//       setIsSubmitting(false);
//     }, 1500);
//   };

//   const supportChannels = [
//     {
//       icon: "📧",
//       title: "Email Support",
//       description: "Get detailed responses within 24 hours",
//       details: "support@influenceai.com",
//       action: "Send Email"
//     },
//     {
//       icon: "💬",
//       title: "Live Chat",
//       description: "Instant help from our support team",
//       details: "Available 24/7",
//       action: "Start Chat"
//     },
//     {
//       icon: "📞",
//       title: "Phone Support",
//       description: "Speak directly with our experts",
//       details: "+1 (555) 123-4567",
//       action: "Call Now"
//     },
//     {
//       icon: "🖥️",
//       title: "Screen Share",
//       description: "Get live assistance with screen sharing",
//       details: "By appointment",
//       action: "Schedule"
//     }
//   ];

//   const faqItems = [
//     {
//       question: "How do I reset my password?",
//       answer: "Go to the login page and click 'Forgot Password'. Enter your email address and we'll send you a password reset link that expires in 1 hour."
//     },
//     {
//       question: "What are your support hours?",
//       answer: "Our live chat and phone support are available 24/7. Email responses are typically provided within 24 hours, including weekends."
//     },
//     {
//       question: "How do I upgrade my plan?",
//       answer: "Navigate to Settings > Billing in your dashboard. From there, you can upgrade your plan, which takes effect immediately."
//     },
//     {
//       question: "Where can I find API documentation?",
//       answer: "Our comprehensive API documentation is available at docs.influenceai.com. You'll find guides, code samples, and API references."
//     },
//     {
//       question: "Do you offer custom enterprise solutions?",
//       answer: "Yes, we provide custom enterprise solutions with dedicated support, custom integrations, and tailored features. Contact our sales team for more information."
//     }
//   ];

//   const resources = [
//     {
//       title: "Help Center",
//       description: "Comprehensive guides and tutorials",
//       link: "/help"
//     },
//     {
//       title: "API Documentation",
//       description: "Developer guides and API references",
//       link: "/docs"
//     },
//     {
//       title: "Video Tutorials",
//       description: "Step-by-step video guides",
//       link: "/tutorials"
//     },
//     {
//       title: "Community Forum",
//       description: "Connect with other users",
//       link: "/community"
//     }
//   ];

//   return (
//     <><HomeTopBar />
//     <div className="support-page">
//       {/* Header Section */}
//       <header className="support-header">
//         <div className="header-content">
//           <h1>Support Center</h1>
//           <p>Get help from our expert support team 24/7 through multiple channels</p>
//           <div className="support-stats">
//             <div className="stat">
//               <span className="stat-number">98%</span>
//               <span className="stat-label">Satisfaction Rate</span>
//             </div>
//             <div className="stat">
//               <span className="stat-number">24/7</span>
//               <span className="stat-label">Support Availability</span>
//             </div>
//             <div className="stat">
//               <span className="stat-number">2h</span>
//               <span className="stat-label">Avg. Response Time</span>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="support-container">
//         {/* Navigation Tabs */}
//         <div className="support-tabs">
//           <button 
//             className={`tab-button ${activeTab === "contact" ? "active" : ""}`}
//             onClick={() => setActiveTab("contact")}
//           >
//             Contact Support
//           </button>
//           <button 
//             className={`tab-button ${activeTab === "faq" ? "active" : ""}`}
//             onClick={() => setActiveTab("faq")}
//           >
//             FAQ
//           </button>
//           <button 
//             className={`tab-button ${activeTab === "resources" ? "active" : ""}`}
//             onClick={() => setActiveTab("resources")}
//           >
//             Resources
//           </button>
//         </div>

//         {/* Main Content */}
//         <div className="support-content">
//           {activeTab === "contact" && (
//             <div className="contact-content">
//               <div className="contact-channels">
//                 <h2>Get Help Quickly</h2>
//                 <p>Choose your preferred support method</p>
                
//                 <div className="channels-grid">
//                   {supportChannels.map((channel, index) => (
//                     <div key={index} className="channel-card">
//                       <div className="channel-icon">{channel.icon}</div>
//                       <h3>{channel.title}</h3>
//                       <p>{channel.description}</p>
//                       <div className="channel-details">{channel.details}</div>
//                       <button className="channel-action">{channel.action}</button>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="contact-form-section">
//                 <h2>Send us a Message</h2>
//                 <p>Fill out the form below and we'll get back to you as soon as possible</p>
                
//                 <form className="support-form" onSubmit={handleSubmit}>
//                   <div className="form-row">
//                     <div className="form-group">
//                       <label htmlFor="name">Full Name *</label>
//                       <input
//                         type="text"
//                         id="name"
//                         name="name"
//                         placeholder="Enter your full name"
//                         value={formData.name}
//                         onChange={handleChange}
//                         required
//                       />
//                     </div>
                    
//                     <div className="form-group">
//                       <label htmlFor="email">Email Address *</label>
//                       <input
//                         type="email"
//                         id="email"
//                         name="email"
//                         placeholder="Enter your email address"
//                         value={formData.email}
//                         onChange={handleChange}
//                         required
//                       />
//                     </div>
//                   </div>

//                   <div className="form-row">
//                     <div className="form-group">
//                       <label htmlFor="subject">Subject *</label>
//                       <input
//                         type="text"
//                         id="subject"
//                         name="subject"
//                         placeholder="What is this regarding?"
//                         value={formData.subject}
//                         onChange={handleChange}
//                         required
//                       />
//                     </div>
                    
//                     <div className="form-group">
//                       <label htmlFor="priority">Priority</label>
//                       <select
//                         id="priority"
//                         name="priority"
//                         value={formData.priority}
//                         onChange={handleChange}
//                       >
//                         <option value="low">Low</option>
//                         <option value="normal">Normal</option>
//                         <option value="high">High</option>
//                         <option value="urgent">Urgent</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="message">Message *</label>
//                     <textarea
//                       id="message"
//                       name="message"
//                       placeholder="Please describe your issue in detail..."
//                       value={formData.message}
//                       onChange={handleChange}
//                       rows="6"
//                       required
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="attachment">Attachment (Optional)</label>
//                     <div className="file-upload">
//                       <input
//                         type="file"
//                         id="attachment"
//                         name="attachment"
//                         onChange={handleFileChange}
//                         className="file-input"
//                       />
//                       <label htmlFor="attachment" className="file-label">
//                         {formData.attachment ? formData.attachment.name : "Choose file"}
//                       </label>
//                     </div>
//                     <small>Upload screenshots or documents that might help us understand your issue (Max: 10MB)</small>
//                   </div>

//                   <button 
//                     type="submit" 
//                     className={`submit-button ${isSubmitting ? "submitting" : ""}`}
//                     disabled={isSubmitting}
//                   >
//                     {isSubmitting ? (
//                       <>
//                         <span className="spinner"></span>
//                         Sending Message...
//                       </>
//                     ) : (
//                       "Send Message"
//                     )}
//                   </button>
//                 </form>
//               </div>
//             </div>
//           )}

//           {activeTab === "faq" && (
//             <div className="faq-content">
//               <h2>Frequently Asked Questions</h2>
//               <p>Find quick answers to common questions about InfluenceAI</p>
              
//               <div className="faq-list">
//                 {faqItems.map((faq, index) => (
//                   <div key={index} className="faq-item">
//                     <h3>{faq.question}</h3>
//                     <p>{faq.answer}</p>
//                   </div>
//                 ))}
//               </div>
              
//               <div className="faq-cta">
//                 <h3>Still have questions?</h3>
//                 <p>Can't find what you're looking for? Contact our support team for personalized assistance.</p>
//                 <button 
//                   className="cta-button"
//                   onClick={() => setActiveTab("contact")}
//                 >
//                   Contact Support
//                 </button>
//               </div>
//             </div>
//           )}

//           {activeTab === "resources" && (
//             <div className="resources-content">
//               <h2>Helpful Resources</h2>
//               <p>Explore our knowledge base and learning materials</p>
              
//               <div className="resources-grid">
//                 {resources.map((resource, index) => (
//                   <a key={index} href={resource.link} className="resource-card">
//                     <h3>{resource.title}</h3>
//                     <p>{resource.description}</p>
//                     <span className="resource-link">Explore →</span>
//                   </a>
//                 ))}
//               </div>
              
//               <div className="additional-resources">
//                 <h3>Additional Support</h3>
//                 <div className="additional-links">
//                   <a href="/" className="additional-link">
//                     <span className="link-icon">📚</span>
//                     <span>Knowledge Base</span>
//                   </a>
//                   <a href="/" className="additional-link">
//                     <span className="link-icon">🎥</span>
//                     <span>Video Tutorials</span>
//                   </a>
//                   <a href="/" className="additional-link">
//                     <span className="link-icon">👥</span>
//                     <span>Community Forum</span>
//                   </a>
//                   <a href="/" className="additional-link">
//                     <span className="link-icon">📋</span>
//                     <span>System Status</span>
//                   </a>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Support Status */}
//         <div className="support-status">
//           <div className="status-header">
//             <h3>System Status</h3>
//             <span className="status-indicator operational">Operational</span>
//           </div>
//           <div className="status-details">
//             <div className="status-item">
//               <span className="service-name">API Services</span>
//               <span className="service-status operational">Operational</span>
//             </div>
//             <div className="status-item">
//               <span className="service-name">Dashboard</span>
//               <span className="service-status operational">Operational</span>
//             </div>
//             <div className="status-item">
//               <span className="service-name">Influencer Database</span>
//               <span className="service-status operational">Operational</span>
//             </div>
//             <div className="status-item">
//               <span className="service-name">Analytics</span>
//               <span className="service-status maintenance">Maintenance</span>
//             </div>
//           </div>
//           <a href="/" className="status-history">View Status History →</a>
//         </div>
//       </div>
//     </div>
//     </>
//   );
// }


import React, { useState } from "react";
import { Mail, MessageCircle, Phone, Monitor, Clock, Users, CheckCircle, FileText, Video, Users as UsersIcon, HelpCircle, ExternalLink, AlertCircle, ChevronRight } from 'lucide-react';
import HomeTopBar from "../pages/HomePage/HomeTopBar";

import { useNavigate } from "react-router-dom";

export default function Support() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    priority: "normal",
    message: "",
    attachment: null
  });

  const [activeTab, setActiveTab] = useState("contact");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachment: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      alert("Thank you for contacting us! We'll get back to you within 24 hours.");
      setFormData({ 
        name: "", 
        email: "", 
        subject: "", 
        priority: "normal",
        message: "",
        attachment: null
      });
      setIsSubmitting(false);
    }, 1500);
  };

  const supportChannels = [
    {
      icon: <Mail size={24} />,
      title: "Email Support",
      description: "Get detailed responses within 24 hours",
      details: "support@influenceai.com",
      action: "Send Email"
    },
    {
      icon: <MessageCircle size={24} />,
      title: "Live Chat",
      description: "Instant help from our support team",
      details: "Available 24/7",
      action: "Start Chat"
    },
    {
      icon: <Phone size={24} />,
      title: "Phone Support",
      description: "Speak directly with our experts",
      details: "+1 (555) 123-4567",
      action: "Call Now"
    },
    {
      icon: <Monitor size={24} />,
      title: "Screen Share",
      description: "Get live assistance with screen sharing",
      details: "By appointment",
      action: "Schedule"
    }
  ];

  const faqItems = [
    {
      question: "How do I reset my password?",
      answer: "Go to the login page and click 'Forgot Password'. Enter your email address and we'll send you a password reset link that expires in 1 hour."
    },
    {
      question: "What are your support hours?",
      answer: "Our live chat and phone support are available 24/7. Email responses are typically provided within 24 hours, including weekends."
    },
    {
      question: "How do I upgrade my plan?",
      answer: "Navigate to Settings > Billing in your dashboard. From there, you can upgrade your plan, which takes effect immediately."
    },
    {
      question: "Where can I find API documentation?",
      answer: "Our comprehensive API documentation is available at docs.influenceai.com. You'll find guides, code samples, and API references."
    },
    {
      question: "Do you offer custom enterprise solutions?",
      answer: "Yes, we provide custom enterprise solutions with dedicated support, custom integrations, and tailored features. Contact our sales team for more information."
    }
  ];

  const resources = [
    {
      icon: <FileText size={24} />,
      title: "Help Center",
      description: "Comprehensive guides and tutorials",
      link: "/help"
    },
    {
      icon: <HelpCircle size={24} />,
      title: "API Documentation",
      description: "Developer guides and API references",
      link: "/docs"
    },
    {
      icon: <Video size={24} />,
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      link: "/tutorials"
    },
    {
      icon: <UsersIcon size={24} />,
      title: "Community Forum",
      description: "Connect with other users",
      link: "/community"
    }
  ];

  return (
    <>
      {/* <HomeTopBar /> */}
      <div className="support-wrapper">
        {/* Hero Section */}
        <section className="support-hero">
          <div className="support-hero-content">
            <h1 className="support-hero-title">Support Center</h1>
            <p className="support-hero-subtitle">
              Get help from our expert support team 24/7 through multiple channels
            </p>
            
            <div className="support-hero-stats">
              <div className="support-stat-item">
                <CheckCircle size={24} />
                <div>
                  <h3>98%</h3>
                  <p>Satisfaction Rate</p>
                </div>
              </div>
              <div className="support-stat-item">
                <Clock size={24} />
                <div>
                  <h3>24/7</h3>
                  <p>Support Availability</p>
                </div>
              </div>
              <div className="support-stat-item">
                <Clock size={24} />
                <div>
                  <h3>2h</h3>
                  <p>Avg. Response Time</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="support-main">
          <div className="support-container">
            <div className="support-layout">
              {/* Main Content Area */}
              <main className="support-content">
                {/* Navigation Tabs */}
                <div className="support-tabs">
                  <button 
                    className={`support-tab-btn ${activeTab === "contact" ? 'active' : ''}`}
                    onClick={() => setActiveTab("contact")}
                  >
                    Contact Support
                  </button>
                  <button 
                    className={`support-tab-btn ${activeTab === "faq" ? 'active' : ''}`}
                    onClick={() => setActiveTab("faq")}
                  >
                    FAQ
                  </button>
                  <button 
                    className={`support-tab-btn ${activeTab === "resources" ? 'active' : ''}`}
                    onClick={() => setActiveTab("resources")}
                  >
                    Resources
                  </button>
                </div>

                {/* Tab Content */}
                <div className="support-tab-content">
                  {activeTab === "contact" && (
                    <div className="contact-tab">
                      {/* Support Channels */}
                      <div className="support-channels-section">
                        <h2 className="support-section-title">Get Help Quickly</h2>
                        <p className="support-section-subtitle">Choose your preferred support method</p>
                        
                        <div className="support-channels-grid">
                          {supportChannels.map((channel, index) => (
                            <div key={index} className="support-channel-card">
                              <div className="support-channel-icon">
                                {channel.icon}
                              </div>
                              <div className="support-channel-content">
                                <h3>{channel.title}</h3>
                                <p className="support-channel-desc">{channel.description}</p>
                                <div className="support-channel-details">{channel.details}</div>
                              </div>
                              <button onClick={goToLogin} className="support-channel-btn">
                                {channel.action}
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Contact Form */}
                      <div className="contact-form-section">
                        <h2 className="support-section-title">Send us a Message</h2>
                        <p className="support-section-subtitle">Fill out the form below and we'll get back to you as soon as possible</p>
                        
                        <form className="support-form" onSubmit={handleSubmit}>
                          <div className="support-form-row">
                            <div className="support-form-group">
                              <label htmlFor="name">Full Name *</label>
                              <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                              />
                            </div>
                            
                            <div className="support-form-group">
                              <label htmlFor="email">Email Address *</label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="support-form-row">
                            <div className="support-form-group">
                              <label htmlFor="subject">Subject *</label>
                              <input
                                type="text"
                                id="subject"
                                name="subject"
                                placeholder="What is this regarding?"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                              />
                            </div>
                            
                            <div className="support-form-group">
                              <label htmlFor="priority">Priority</label>
                              <select
                                id="priority"
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                              >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            </div>
                          </div>

                          <div className="support-form-group">
                            <label htmlFor="message">Message *</label>
                            <textarea
                              id="message"
                              name="message"
                              placeholder="Please describe your issue in detail..."
                              value={formData.message}
                              onChange={handleChange}
                              rows="6"
                              required
                            />
                          </div>

                          <div className="support-form-group">
                            <label htmlFor="attachment">Attachment (Optional)</label>
                            <div className="support-file-upload">
                              <input
                                type="file"
                                id="attachment"
                                name="attachment"
                                onChange={handleFileChange}
                                className="support-file-input"
                              />
                              <label htmlFor="attachment" className="support-file-label">
                                {formData.attachment ? formData.attachment.name : "Choose file"}
                              </label>
                            </div>
                            <small className="support-file-note">Upload screenshots or documents that might help us understand your issue (Max: 10MB)</small>
                          </div>

                          <button 
                            type="submit" 
                            className={`support-submit-btn ${isSubmitting ? 'submitting' : ''}`}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <span className="support-spinner"></span>
                                Sending Message...
                              </>
                            ) : (
                              "Send Message"
                            )}
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {activeTab === "faq" && (
                    <div className="faq-tab">
                      <h2 className="support-section-title">Frequently Asked Questions</h2>
                      <p className="support-section-subtitle">Find quick answers to common questions about InfluenceAI</p>
                      
                      <div className="faq-list">
                        {faqItems.map((faq, index) => (
                          <div key={index} className="faq-item">
                            <div className="faq-question">
                              <h3>{faq.question}</h3>
                            </div>
                            <div className="faq-answer">
                              <p>{faq.answer}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="faq-cta">
                        <div className="faq-cta-content">
                          <h3>Still have questions?</h3>
                          <p>Can't find what you're looking for? Contact our support team for personalized assistance.</p>
                        </div>
                        <button 
                          className="faq-cta-btn"
                          onClick={() => setActiveTab("contact")}
                        >
                          Contact Support
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "resources" && (
                    <div className="resources-tab">
                      <h2 className="support-section-title">Helpful Resources</h2>
                      <p className="support-section-subtitle">Explore our knowledge base and learning materials</p>
                      
                      <div className="resources-grid">
                        {resources.map((resource, index) => (
                          <a key={index} href={resource.link} className="resource-card">
                            <div className="resource-icon">
                              {resource.icon}
                            </div>
                            <div className="resource-content">
                              <h3>{resource.title}</h3>
                              <p>{resource.description}</p>
                              <span className="resource-link">
                                Explore <ExternalLink size={16} />
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                      
                      <div className="additional-resources">
                        <h3 className="support-section-title">Additional Support</h3>
                        <div className="additional-links">
                          {[
                            { icon: "📚", text: "Knowledge Base" },
                            { icon: "🎥", text: "Video Tutorials" },
                            { icon: "👥", text: "Community Forum" },
                            { icon: "📋", text: "System Status" }
                          ].map((item, index) => (
                            <a key={index} href="/" className="additional-link">
                              <span className="additional-link-icon">{item.icon}</span>
                              <span>{item.text}</span>
                              <ChevronRight size={16} />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </main>

              {/* Sidebar - System Status */}
              <aside className="support-sidebar">
                <div className="support-status-card">
                  <div className="support-status-header">
                    <h3>System Status</h3>
                    <span className="support-status-indicator operational">
                      <CheckCircle size={14} />
                      Operational
                    </span>
                  </div>
                  
                  <div className="support-status-details">
                    {[
                      { service: "API Services", status: "operational" },
                      { service: "Dashboard", status: "operational" },
                      { service: "Influencer Database", status: "operational" },
                      { service: "Analytics", status: "maintenance" }
                    ].map((item, index) => (
                      <div key={index} className="support-status-item">
                        <span className="support-service-name">{item.service}</span>
                        <span className={`support-service-status ${item.status}`}>
                          {item.status === "operational" ? "Operational" : "Maintenance"}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <a href="/login" className="support-status-history">
                    View Status History
                    <ChevronRight size={16} />
                  </a>
                </div>

                <div className="support-sidebar-section">
                  <h3 className="support-sidebar-title">Quick Links</h3>
                  <div className="support-quick-links">
                    {[
                      { label: "View Knowledge Base", icon: <FileText size={16} /> },
                      { label: "Report a Bug", icon: <AlertCircle size={16} /> },
                      { label: "Feature Request", icon: <HelpCircle size={16} /> },
                      { label: "Service Updates", icon: <Clock size={16} /> }
                    ].map((link, index) => (
                      <a key={index} href="/" className="support-quick-link">
                        {link.icon}
                        <span>{link.label}</span>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="support-sidebar-section">
                  <h3 className="support-sidebar-title">Support Hours</h3>
                  <div className="support-hours">
                    <div className="support-hours-item">
                      <span className="support-hours-label">Live Chat & Phone:</span>
                      <span className="support-hours-value">24/7</span>
                    </div>
                    <div className="support-hours-item">
                      <span className="support-hours-label">Email Support:</span>
                      <span className="support-hours-value">24/7</span>
                    </div>
                    <div className="support-hours-item">
                      <span className="support-hours-label">Screen Share:</span>
                      <span className="support-hours-value">9 AM - 6 PM EST</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>

        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          .support-wrapper { width: 100%; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; }
          
          /* Hero Section */
          .support-hero { background: linear-gradient(135deg, #5DADE2 0%, #3b82f6 100%); padding: 80px 20px 60px; text-align: center; }
          .support-hero-content { max-width: 900px; margin: 0 auto; }
          .support-hero-title { font-size: 48px; font-weight: 700; color: white; margin-bottom: 16px; }
          .support-hero-subtitle { font-size: 18px; color: rgba(255,255,255,0.95); line-height: 1.7; margin-bottom: 40px; }
          .support-hero-stats { display: flex; gap: 48px; justify-content: center; margin-top: 40px; }
          .support-stat-item { display: flex; align-items: center; gap: 12px; color: white; }
          .support-stat-item svg { opacity: 0.9; }
          .support-stat-item h3 { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
          .support-stat-item p { font-size: 14px; opacity: 0.9; }
          
          /* Main Content */
          .support-main { padding: 40px 0; }
          .support-container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }
          .support-layout { display: grid; grid-template-columns: 1fr 350px; gap: 32px; }
          
          /* Tabs */
          .support-tabs { display: flex; gap: 8px; padding: 0 4px 20px; border-bottom: 2px solid #e2e8f0; margin-bottom: 24px; }
          .support-tab-btn { padding: 12px 24px; background: transparent; border: none; border-radius: 8px; font-size: 15px; font-weight: 500; color: #64748b; cursor: pointer; transition: 0.2s; }
          .support-tab-btn:hover { background: #f1f5f9; color: #3b82f6; }
          .support-tab-btn.active { background: #f1f5f9; color: #3b82f6; font-weight: 600; }
          
          /* Content Area */
          .support-content { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          
          /* Section Titles */
          .support-section-title { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
          .support-section-subtitle { font-size: 15px; color: #64748b; margin-bottom: 24px; }
          
          /* Support Channels */
          .support-channels-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 40px; }
          .support-channel-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 16px; transition: 0.2s; }
          .support-channel-card:hover { border-color: #3b82f6; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
          .support-channel-icon { color: #3b82f6; }
          .support-channel-content h3 { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 4px; }
          .support-channel-desc { font-size: 14px; color: #3b82f6; margin-bottom: 8px; }
          .support-channel-details { font-size: 15px; font-weight: 500; color: #1e293b; }
          .support-channel-btn { padding: 10px 16px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
          .support-channel-btn:hover { background: #3b82f6; }
          
          /* Form Styles */
          .support-form { display: flex; flex-direction: column; gap: 24px; }
          .support-form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .support-form-group { display: flex; flex-direction: column; gap: 8px; }
          .support-form-group label { font-size: 14px; font-weight: 600; color: #374151; }
          .support-form-group input,
          .support-form-group select,
          .support-form-group textarea { padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 15px; transition: 0.2s; }
          .support-form-group input:focus,
          .support-form-group select:focus,
          .support-form-group textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1); }
          .support-form-group textarea { resize: vertical; min-height: 120px; }
          
          /* File Upload */
          .support-file-upload { position: relative; }
          .support-file-input { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0; }
          .support-file-label { display: block; padding: 12px 16px; background: white; border: 1px dashed #d1d5db; border-radius: 8px; font-size: 15px; color: #6b7280; cursor: pointer; transition: 0.2s; }
          .support-file-label:hover { border-color: #3b82f6; color: #3b82f6; }
          .support-file-note { display: block; margin-top: 4px; color: #6b7280; font-size: 13px; }
          
          /* Submit Button */
          .support-submit-btn { padding: 14px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .support-submit-btn:hover { background: #3b82f6; }
          .support-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
          .support-spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          /* FAQ Styles */
          .faq-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
          .faq-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; transition: 0.2s; cursor: pointer; }
          .faq-item:hover { border-color: #3b82f6; }
          .faq-question h3 { font-size: 17px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
          .faq-answer p { font-size: 15px; color: #4b5563; line-height: 1.6; }
          
          .faq-cta { background: linear-gradient(135deg, #f1f5f9 0%, #f1f5f9 100%); border: 1px solid #3b82f6; border-radius: 12px; padding: 24px; display: flex; justify-content: space-between; align-items: center; }
          .faq-cta-content h3 { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 4px; }
          .faq-cta-content p { font-size: 15px; color: #4b5563; }
          .faq-cta-btn { padding: 10px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: 0.2s; }
          .faq-cta-btn:hover { background: #3b82f6; }
          
          /* Resources */
          .resources-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 32px; }
          .resource-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; display: flex; gap: 16px; transition: 0.2s; cursor: pointer; text-decoration: none; }
          .resource-card:hover { border-color: #3b82f6; transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.08); }
          .resource-icon { color: #3b82f6; }
          .resource-content { flex: 1; }
          .resource-content h3 { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
          .resource-content p { font-size: 14px; color: #64748b; margin-bottom: 12px; }
          .resource-link { display: flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 600; color: #3b82f6; }
          
          /* Additional Resources */
          .additional-resources { margin-top: 32px; }
          .additional-links { display: flex; flex-direction: column; gap: 12px; }
          .additional-link { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #374151; transition: 0.2s; }
          .additional-link:hover { border-color: #3b82f6; color: #3b82f6; }
          .additional-link-icon { font-size: 18px; }
          
          /* Sidebar */
          .support-sidebar { position: sticky; top: 20px; height: fit-content; }
          
          /* Status Card */
          .support-status-card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          .support-status-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .support-status-header h3 { font-size: 16px; font-weight: 700; color: #1e293b; }
          .support-status-indicator { padding: 6px 12px; background: #f1f5f9; color: #3b82f6; font-size: 13px; font-weight: 600; border-radius: 6px; display: flex; align-items: center; gap: 4px; }
          .support-status-indicator.operational { background: #f1f5f9; color: #3b82f6; }
          
          .support-status-details { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
          .support-status-item { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; }
          .support-service-name { font-size: 14px; color: #4b5563; }
          .support-service-status { font-size: 13px; font-weight: 600; padding: 4px 10px; border-radius: 6px; }
          .support-service-status.operational { background: #f0fdf4; color: #3b82f6; }
          .support-service-status.maintenance { background: #fef3c7; color: #3b82f6; }
          
          .support-status-history { display: flex; align-items: center; gap: 4px; font-size: 14px; color: #3b82f6; text-decoration: none; font-weight: 600; }
          .support-status-history:hover { text-decoration: underline; }
          
          /* Sidebar Sections */
          .support-sidebar-section { background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          .support-sidebar-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
          
          .support-quick-links { display: flex; flex-direction: column; gap: 8px; }
          .support-quick-link { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 8px; text-decoration: none; color: #4b5563; transition: 0.2s; }
          .support-quick-link:hover { background: #e2e8f0; color: #3b82f6; }
          
          .support-hours { display: flex; flex-direction: column; gap: 12px; }
          .support-hours-item { display: flex; justify-content: space-between; align-items: center; }
          .support-hours-label { font-size: 14px; color: #4b5563; }
          .support-hours-value { font-size: 14px; font-weight: 600; color: #3b82f6; }
          
          /* Responsive Design */
          @media (max-width: 1200px) {
            .support-layout { grid-template-columns: 1fr; }
            .support-sidebar { position: relative; }
          }
          
          @media (max-width: 768px) {
            .support-hero-title { font-size: 32px; }
            .support-hero-subtitle { font-size: 16px; }
            .support-hero-stats { flex-wrap: wrap; gap: 24px; }
            .support-channels-grid { grid-template-columns: 1fr; }
            .resources-grid { grid-template-columns: 1fr; }
            .support-form-row { grid-template-columns: 1fr; }
            .support-tabs { flex-direction: column; }
            .support-content { padding: 16px; }
            .faq-cta { flex-direction: column; gap: 16px; text-align: center; }
          }
        `}</style>
      </div>
    </>
  );
}