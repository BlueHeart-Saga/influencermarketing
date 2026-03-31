// // src/components/Footer.jsx
// import React from "react";
// import { Link } from "react-router-dom";
// import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
// import "../style/Footer.css";

// export default function Footer() {
//   return (
//     <footer className="qf-footer">
//       <div className="qf-footer-container">

//         {/* Column 1: Brand Info */}
//         <div className="qf-footer-column">
//           <h3 className="qf-footer-logo">QuickBox.io</h3>
//           <p>
//             AI-powered influencer marketing platform connecting brands with creators worldwide.
//           </p>
//           <div className="qf-footer-social">
//             <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
//             <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
//             <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
//             <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
//           </div>
//         </div>

//         {/* Column 2: Quick Links */}
//         <div className="qf-footer-column">
//           <h4>Quick Links</h4>
//           <ul>
//             <li><Link to="/">Home</Link></li>
//             <li><Link to="/pricingsection">Pricing</Link></li>
//             <li><Link to="/campaign">Create Campaign</Link></li>
//             <li><Link to="/contactUs">Contact Us</Link></li>
//             <li><Link to="/dashboard">Dashboard</Link></li>
//           </ul>
//         </div>

//         {/* Column 3: Resources */}
//         <div className="qf-footer-column">
//           <h4>Resources</h4>
//           <ul>
//             <li><Link to="/resources/blog">Blog</Link></li>
//             <li><Link to="/resources/help-center">Help Center</Link></li>
//             <li><Link to="/resources/case-studies">Case Studies</Link></li>
//             <li><Link to="/resources/documentation">Documentation</Link></li>
//             <li><Link to="/resources/community">Community</Link></li>
//             <li><Link to="/resources/support">Support</Link></li>
//           </ul>
//         </div>

//         {/* Column 4: Contact */}
//         <div className="qf-footer-column">
//           <h4>Contact Us</h4>
//           <ul>
//             <li><FaEnvelope /> support@quickbox.com</li>
//             <li><FaPhone /> +91 987654321</li>
//             <li><FaMapMarkerAlt /> India</li>
//           </ul>
//         </div>

//       </div>

//       {/* Bottom Bar */}
//       <div className="qf-footer-bottom">
//         <p>© {new Date().getFullYear()} QuickBox.io. All rights reserved.</p>
//         <div className="qf-footer-legal">
//           <Link to="/privacy">Privacy Policy</Link>
//           <Link to="/terms">Terms of Service</Link>
//           <Link to="/cookies">Cookie Policy</Link>
//         </div>
//       </div>
//     </footer>
//   );
// }
