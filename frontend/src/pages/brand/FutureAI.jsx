// import React, { useState } from "react";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { 
//   faBrain, 
//   faFlask, 
//   faRobot, 
//   faBook, 
//   faChartLine, 
//   faFileAlt, 
//   faUsers, 
//   faMicrochip,
//   faShieldAlt,
//   faLightbulb,
//   faBullseye,
//   faSync,
//   faGem,
//   faAtom,
//   faStar,
//   faBalanceScale,
//   faLink,
//   faDownload,
//   faEye,
//   faSpinner,
//   faGraduationCap,
//   faHandshake,
//   faCalendarAlt
// } from '@fortawesome/free-solid-svg-icons';

// export default function ProfessionalAILab() {
//   const [currentTab, setCurrentTab] = useState("innovations");
//   const [demoActive, setDemoActive] = useState(false);

//   const innovations = [
//     {
//       title: "Adaptive Neural Architecture",
//       description: "Self-optimizing deep learning frameworks that automatically configure network topology based on task complexity and data characteristics",
//       icon: faBrain,
//       shade: "rgb(161, 181, 241)",
//       phase: "Deployed"
//     },
//     {
//       title: "Interpretable Intelligence",
//       description: "Advanced explainability systems providing transparent insights into model decision pathways and feature attribution mechanisms",
//       icon: faLightbulb,
//       shade: "rgb(161, 181, 241)",
//       phase: "Validation"
//     },
//     {
//       title: "Distributed Privacy Learning",
//       description: "Enterprise-grade federated training infrastructure with cryptographic guarantees for sensitive data protection",
//       icon: faShieldAlt,
//       shade: "rgb(161, 181, 241)",
//       phase: "Deployed"
//     },
//     {
//       title: "Cognitive Architecture",
//       description: "Neural-symbolic hybrid systems integrating probabilistic reasoning with deterministic logic engines",
//       icon: faBullseye,
//       shade: "rgb(161, 181, 241)",
//       phase: "Experimental"
//     },
//     {
//       title: "Cross-Modal Intelligence",
//       description: "Unified representation learning across vision, language, and audio domains with zero-shot transfer capabilities",
//       icon: faSync,
//       shade: "rgb(161, 181, 241)",
//       phase: "Advanced Testing"
//     },
//     {
//       title: "Adaptive Meta-Learning",
//       description: "Few-shot learning systems capable of rapid task adaptation with minimal training examples",
//       icon: faChartLine,
//       shade: "rgb(161, 181, 241)",
//       phase: "Experimental"
//     }
//   ];

//   const initiatives = [
//     {
//       title: "Quantum-Enhanced ML",
//       description: "Investigating quantum computing paradigms for optimization, sampling, and cryptographic machine learning applications",
//       icon: faAtom,
//       completion: 58,
//       team: 15
//     },
//     {
//       title: "General Intelligence Research",
//       description: "Fundamental investigations into transfer learning, reasoning, and adaptable cognitive architectures",
//       icon: faStar,
//       completion: 35,
//       team: 22
//     },
//     {
//       title: "Responsible AI Systems",
//       description: "Developing frameworks for fairness, accountability, transparency, and ethical deployment standards",
//       icon: faBalanceScale,
//       completion: 82,
//       team: 11
//     },
//     {
//       title: "Symbolic-Neural Fusion",
//       description: "Integrating structured knowledge representation with statistical learning for robust reasoning",
//       icon: faLink,
//       completion: 48,
//       team: 13
//     },
//     {
//       title: "Self-Supervised Architectures",
//       description: "Advancing pre-training methodologies through contrastive, predictive, and generative frameworks",
//       icon: faSync,
//       completion: 73,
//       team: 17
//     },
//     {
//       title: "Neuromorphic Systems",
//       description: "Bio-inspired computing architectures optimized for energy efficiency and parallel processing",
//       icon: faGem,
//       completion: 42,
//       team: 10
//     }
//   ];

//   const papers = [
//     {
//       title: "Hierarchical Attention Mechanisms for Sequential Data",
//       team: "Martinez, Chen & Associates",
//       venue: "NeurIPS 2024",
//       impact: 156
//     },
//     {
//       title: "Privacy-Preserving Collaborative Learning at Scale",
//       team: "Johnson Research Group",
//       venue: "ICML 2024",
//       impact: 103
//     },
//     {
//       title: "Compositional Program Synthesis with Neural Guidance",
//       team: "Thompson et al.",
//       venue: "ICLR 2024",
//       impact: 78
//     }
//   ];

//   const activateDemo = () => {
//     setDemoActive(true);
//     setTimeout(() => setDemoActive(false), 3000);
//   };

//   return (
//     <div style={styles.wrapper}>
//       {/* Hero Section */}
//       <header style={styles.heroSection}>
//         <div style={styles.heroBackground}></div>
//         <div style={styles.heroInner}>
//           <div style={styles.branding}>
//             <div style={styles.brandContainer}>
//               <div style={styles.logoGraphic}>
//                 <FontAwesomeIcon icon={faBrain} style={styles.logoSymbol} />
//               </div>
//               <div style={styles.logoTypography}>
//                 <span style={styles.logoPrimary}>Cognition</span>
//                 <span style={styles.logoSecondary}>Institute</span>
//               </div>
//             </div>
//             <div style={styles.departmentTag}>Advanced AI Research</div>
//           </div>
          
//           <h1 style={styles.heroHeading}>
//             Transforming Intelligence
//             <span style={styles.accentText}> Through Innovation</span>
//           </h1>
//           <p style={styles.heroSubtext}>
//             Leading breakthrough research in artificial intelligence with emphasis on 
//             responsible development, scientific rigor, and transformative applications. 
//             Our multidisciplinary approach combines theoretical foundations with practical impact.
//           </p>
          
//           <div style={styles.achievementBar}>
//             <div style={styles.achievementItem}>
//               <div style={styles.achievementValue}>$32.8M</div>
//               <div style={styles.achievementLabel}>Annual Research Budget</div>
//             </div>
//             <div style={styles.achievementItem}>
//               <div style={styles.achievementValue}>26</div>
//               <div style={styles.achievementLabel}>Strategic Partnerships</div>
//             </div>
//             <div style={styles.achievementItem}>
//               <div style={styles.achievementValue}>9</div>
//               <div style={styles.achievementLabel}>Global Research Centers</div>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Metrics Dashboard */}
//       <section style={styles.metricsSection}>
//         <div style={styles.metricsLayout}>
//           <div style={styles.metricBox}>
//             <div style={styles.metricIcon}>
//               <FontAwesomeIcon icon={faChartLine} />
//             </div>
//             <div style={styles.metricDetails}>
//               <div style={styles.metricNumber}>31</div>
//               <div style={styles.metricTitle}>Research Programs</div>
//               <div style={styles.metricNote}>+5 this year</div>
//             </div>
//           </div>
//           <div style={styles.metricBox}>
//             <div style={styles.metricIcon}>
//               <FontAwesomeIcon icon={faFileAlt} />
//             </div>
//             <div style={styles.metricDetails}>
//               <div style={styles.metricNumber}>184</div>
//               <div style={styles.metricTitle}>Published Papers</div>
//               <div style={styles.metricNote}>18 tier-1 venues</div>
//             </div>
//           </div>
//           <div style={styles.metricBox}>
//             <div style={styles.metricIcon}>
//               <FontAwesomeIcon icon={faUsers} />
//             </div>
//             <div style={styles.metricDetails}>
//               <div style={styles.metricNumber}>63</div>
//               <div style={styles.metricTitle}>Research Scientists</div>
//               <div style={styles.metricNote}>12 new PhDs</div>
//             </div>
//           </div>
//           <div style={styles.metricBox}>
//             <div style={styles.metricIcon}>
//               <FontAwesomeIcon icon={faMicrochip} />
//             </div>
//             <div style={styles.metricDetails}>
//               <div style={styles.metricNumber}>92</div>
//               <div style={styles.metricTitle}>AI Systems</div>
//               <div style={styles.metricNote}>21 deployed</div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Navigation Tabs */}
//       <section style={styles.navigationSection}>
//         <div style={styles.navWrapper}>
//           <nav style={styles.tabBar}>
//             <button
//               style={{
//                 ...styles.tabControl,
//                 ...(currentTab === "initiatives" ? styles.tabActive : {})
//               }}
//               onClick={() => setCurrentTab("initiatives")}
//             >
//               <FontAwesomeIcon icon={faFlask} style={styles.tabIcon} />
//               Research Initiatives
//             </button>
//             <button
//               style={{
//                 ...styles.tabControl,
//                 ...(currentTab === "innovations" ? styles.tabActive : {})
//               }}
//               onClick={() => setCurrentTab("innovations")}
//             >
//               <FontAwesomeIcon icon={faLightbulb} style={styles.tabIcon} />
//               Core Technologies
//             </button>
//             <button
//               style={{
//                 ...styles.tabControl,
//                 ...(currentTab === "demonstrations" ? styles.tabActive : {})
//               }}
//               onClick={() => setCurrentTab("demonstrations")}
//             >
//               <FontAwesomeIcon icon={faRobot} style={styles.tabIcon} />
//               Interactive Demo
//             </button>
//             <button
//               style={{
//                 ...styles.tabControl,
//                 ...(currentTab === "papers" ? styles.tabActive : {})
//               }}
//               onClick={() => setCurrentTab("papers")}
//             >
//               <FontAwesomeIcon icon={faBook} style={styles.tabIcon} />
//               Publications
//             </button>
//           </nav>
//         </div>

//         {/* Content Panels */}
//         <div style={styles.contentArea}>
//           {currentTab === "initiatives" && (
//             <div style={styles.panel}>
//               <div style={styles.panelHeading}>
//                 <h2 style={styles.panelTitle}>Strategic Research Initiatives</h2>
//                 <p style={styles.panelDescription}>Advancing fundamental understanding across key domains in artificial intelligence</p>
//               </div>
//               <div style={styles.initiativesGrid}>
//                 {initiatives.map((item, idx) => (
//                   <div key={idx} style={styles.initiativeCard}>
//                     <div style={styles.initiativeTop}>
//                       <div style={styles.initiativeIcon}>
//                         <FontAwesomeIcon icon={item.icon} />
//                       </div>
//                       <div style={styles.initiativeMeta}>
//                         <span style={styles.teamSize}>{item.team} researchers</span>
//                         <div style={styles.progressTrack}>
//                           <div 
//                             style={{
//                               ...styles.progressBar,
//                               width: `${item.completion}%`
//                             }}
//                           ></div>
//                         </div>
//                       </div>
//                     </div>
//                     <div style={styles.initiativeBody}>
//                       <h3 style={styles.initiativeTitle}>{item.title}</h3>
//                       <p style={styles.initiativeText}>{item.description}</p>
//                     </div>
//                     <div style={styles.initiativeBottom}>
//                       <span style={styles.completionLabel}>{item.completion}% progress</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {currentTab === "innovations" && (
//             <div style={styles.panel}>
//               <div style={styles.panelHeading}>
//                 <h2 style={styles.panelTitle}>Core Technology Portfolio</h2>
//                 <p style={styles.panelDescription}>Production-ready and experimental systems driving next-generation AI capabilities</p>
//               </div>
//               <div style={styles.innovationsGrid}>
//                 {innovations.map((item, idx) => (
//                   <div key={idx} style={styles.innovationCard}>
//                     <div style={{
//                       ...styles.innovationIconBox,
//                       backgroundColor: `${item.shade}15`,
//                       borderColor: item.shade
//                     }}>
//                       <FontAwesomeIcon icon={item.icon} style={styles.innovationIcon} />
//                     </div>
//                     <div style={styles.innovationBody}>
//                       <div style={styles.innovationHeader}>
//                         <h3 style={styles.innovationTitle}>{item.title}</h3>
//                         <span style={{
//                           ...styles.phaseLabel,
//                           backgroundColor: item.shade
//                         }}>
//                           {item.phase}
//                         </span>
//                       </div>
//                       <p style={styles.innovationText}>{item.description}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {currentTab === "demonstrations" && (
//             <div style={styles.panel}>
//               <div style={styles.panelHeading}>
//                 <h2 style={styles.panelTitle}>Interactive System Demonstrations</h2>
//                 <p style={styles.panelDescription}>Live visualization of advanced neural network architectures and processing</p>
//               </div>
//               <div style={styles.demoWrapper}>
//                 <div style={styles.demoCard}>
//                   <div style={styles.demoHeader}>
//                     <h3 style={styles.demoTitle}>Deep Neural Network Visualization</h3>
//                     <div style={styles.liveBadge}>
//                       <FontAwesomeIcon icon={faEye} style={{marginRight: '6px'}} />
//                       Real-time
//                     </div>
//                   </div>
//                   <div style={styles.demoBody}>
//                     <div style={{
//                       ...styles.visualArea,
//                       ...(demoActive ? styles.visualActive : {})
//                     }}>
//                       <div style={styles.networkDisplay}>
//                         {[...Array(3)].map((_, layerIdx) => (
//                           <div key={layerIdx} style={styles.layerColumn}>
//                             {[...Array(5)].map((_, nodeIdx) => (
//                               <div key={nodeIdx} style={styles.networkNode}></div>
//                             ))}
//                           </div>
//                         ))}
//                         {demoActive && (
//                           <>
//                             <div style={{...styles.signalPulse, ...styles.pulse1}}></div>
//                             <div style={{...styles.signalPulse, ...styles.pulse2}}></div>
//                             <div style={{...styles.signalPulse, ...styles.pulse3}}></div>
//                           </>
//                         )}
//                       </div>
//                     </div>
//                     <div style={styles.demoInfo}>
//                       <p style={styles.demoDescription}>
//                         {demoActive
//                           ? "Processing multi-layer forward propagation with real-time activation visualization across neural pathways..."
//                           : "Observe our sophisticated neural architecture featuring multi-layer processing with dynamic activation patterns. The visualization demonstrates information flow through the network."}
//                       </p>
//                       <div style={styles.statsRow}>
//                         <div style={styles.statItem}>
//                           <span style={styles.statValue}>2.4M</span>
//                           <span style={styles.statLabel}>Parameters</span>
//                         </div>
//                         <div style={styles.statItem}>
//                           <span style={styles.statValue}>784-512-256-10</span>
//                           <span style={styles.statLabel}>Topology</span>
//                         </div>
//                         <div style={styles.statItem}>
//                           <span style={styles.statValue}>99.1%</span>
//                           <span style={styles.statLabel}>Validation Accuracy</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div style={styles.demoControls}>
//                     <button
//                       onClick={activateDemo}
//                       disabled={demoActive}
//                       style={{
//                         ...styles.demoButton,
//                         ...(demoActive ? styles.demoButtonActive : {})
//                       }}
//                     >
//                       {demoActive ? (
//                         <>
//                           <FontAwesomeIcon icon={faSpinner} spin style={{marginRight: '8px'}} />
//                           Processing Simulation...
//                         </>
//                       ) : (
//                         "Initialize Network Simulation"
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {currentTab === "papers" && (
//             <div style={styles.panel}>
//               <div style={styles.panelHeading}>
//                 <h2 style={styles.panelTitle}>Recent Academic Contributions</h2>
//                 <p style={styles.panelDescription}>Latest peer-reviewed publications from our research teams at premier conferences</p>
//               </div>
//               <div style={styles.papersList}>
//                 {papers.map((paper, idx) => (
//                   <div key={idx} style={styles.paperCard}>
//                     <div style={styles.paperContent}>
//                       <h3 style={styles.paperTitle}>{paper.title}</h3>
//                       <p style={styles.paperAuthors}>{paper.team}</p>
//                       <div style={styles.paperMeta}>
//                         <span style={styles.venueTag}>{paper.venue}</span>
//                         <span style={styles.citationCount}>{paper.impact} citations</span>
//                       </div>
//                     </div>
//                     <button style={styles.paperAction}>
//                       <FontAwesomeIcon icon={faDownload} style={{marginRight: '6px'}} />
//                       Access Paper
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Call to Action */}
//       <section style={styles.ctaSection}>
//         <div style={styles.ctaBackground}></div>
//         <div style={styles.ctaContainer}>
//           <div style={styles.ctaContent}>
//             <h2 style={styles.ctaHeading}>Join Our Research Ecosystem</h2>
//             <p style={styles.ctaText}>
//               Partner with leading experts in artificial intelligence, access state-of-the-art 
//               infrastructure, and contribute to pioneering research that shapes the future. 
//               We welcome exceptional talent across research, engineering, and innovation domains.
//             </p>
//             <div style={styles.opportunitiesBar}>
//               <div style={styles.opportunity}>
//                 <FontAwesomeIcon icon={faGraduationCap} style={{marginRight: '8px'}} />
//                 <strong>7</strong> Research Positions
//               </div>
//               <div style={styles.opportunity}>
//                 <FontAwesomeIcon icon={faUsers} style={{marginRight: '8px'}} />
//                 <strong>4</strong> Doctoral Fellowships
//               </div>
//               <div style={styles.opportunity}>
//                 <FontAwesomeIcon icon={faCalendarAlt} style={{marginRight: '8px'}} />
//                 <strong>Year-round</strong> Internship Programs
//               </div>
//             </div>
//             <div style={styles.actionButtons}>
//               <button style={{...styles.actionBtn, ...styles.primaryBtn}}>
//                 <FontAwesomeIcon icon={faGraduationCap} style={{marginRight: '8px'}} />
//                 Explore Career Opportunities
//               </button>
//               <button style={{...styles.actionBtn, ...styles.secondaryBtn}}>
//                 <FontAwesomeIcon icon={faHandshake} style={{marginRight: '8px'}} />
//                 Research Collaboration
//               </button>
//               <button style={{...styles.actionBtn, ...styles.outlineBtn}}>
//                 <FontAwesomeIcon icon={faDownload} style={{marginRight: '8px'}} />
//                 Download Prospectus
//               </button>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// const styles = {
//   wrapper: {
//     minHeight: "100vh",
//     backgroundColor: "rgb(230, 236, 253)",
//     fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
//   },
//   heroSection: {
//     position: "relative",
//     padding: "80px 20px",
//     overflow: "hidden"
//   },
//   heroBackground: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     background: "linear-gradient(135deg, rgb(161, 181, 241) 0%, rgb(230, 236, 253) 100%)",
//     zIndex: 1
//   },
//   heroInner: {
//     maxWidth: "1200px",
//     margin: "0 auto",
//     position: "relative",
//     zIndex: 2
//   },
//   branding: {
//     marginBottom: "48px"
//   },
//   brandContainer: {
//     display: "flex",
//     alignItems: "center",
//     gap: "16px",
//     marginBottom: "12px"
//   },
//   logoGraphic: {
//     width: "64px",
//     height: "64px",
//     background: "rgba(255, 255, 255, 0.95)",
//     borderRadius: "16px",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     boxShadow: "0 4px 12px rgba(161, 181, 241, 0.3)"
//   },
//   logoSymbol: {
//     fontSize: "32px",
//     color: "rgb(161, 181, 241)"
//   },
//   logoTypography: {
//     display: "flex",
//     flexDirection: "column"
//   },
//   logoPrimary: {
//     fontSize: "32px",
//     fontWeight: "700",
//     color: "#1e293b",
//     lineHeight: "1"
//   },
//   logoSecondary: {
//     fontSize: "18px",
//     fontWeight: "300",
//     color: "#475569",
//     marginTop: "4px"
//   },
//   departmentTag: {
//     display: "inline-block",
//     background: "rgba(255, 255, 255, 0.9)",
//     padding: "8px 20px",
//     borderRadius: "20px",
//     fontSize: "13px",
//     fontWeight: "600",
//     color: "rgb(161, 181, 241)",
//     letterSpacing: "0.5px"
//   },
//   heroHeading: {
//     fontSize: "56px",
//     fontWeight: "700",
//     color: "#1e293b",
//     marginBottom: "24px",
//     lineHeight: "1.1"
//   },
//   accentText: {
//     background: "linear-gradient(90deg, rgb(161, 181, 241), #6366f1)",
//     WebkitBackgroundClip: "text",
//     WebkitTextFillColor: "transparent",
//     backgroundClip: "text"
//   },
//   heroSubtext: {
//     fontSize: "18px",
//     color: "#475569",
//     maxWidth: "800px",
//     lineHeight: "1.7",
//     marginBottom: "48px"
//   },
//   achievementBar: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
//     gap: "32px",
//     marginTop: "48px"
//   },
//   achievementItem: {
//     textAlign: "center"
//   },
//   achievementValue: {
//     fontSize: "36px",
//     fontWeight: "700",
//     color: "#1e293b",
//     marginBottom: "8px"
//   },
//   achievementLabel: {
//     fontSize: "14px",
//     color: "#64748b",
//     fontWeight: "500"
//   },
//   metricsSection: {
//     padding: "60px 20px",
//     maxWidth: "1200px",
//     margin: "0 auto"
//   },
//   metricsLayout: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
//     gap: "24px"
//   },
//   metricBox: {
//     background: "#ffffff",
//     padding: "32px",
//     borderRadius: "16px",
//     display: "flex",
//     gap: "20px",
//     alignItems: "center",
//     boxShadow: "0 2px 8px rgba(161, 181, 241, 0.1)",
//     border: "1px solid rgba(161, 181, 241, 0.2)",
//     transition: "all 0.3s ease"
//   },
//   metricIcon: {
//     fontSize: "28px",
//     color: "rgb(161, 181, 241)",
//     width: "48px",
//     height: "48px",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     background: "rgba(161, 181, 241, 0.1)",
//     borderRadius: "12px"
//   },
//   metricDetails: {
//     flex: 1
//   },
//   metricNumber: {
//     fontSize: "32px",
//     fontWeight: "700",
//     color: "#1e293b",
//     marginBottom: "4px"
//   },
//   metricTitle: {
//     fontSize: "14px",
//     color: "#64748b",
//     fontWeight: "600",
//     marginBottom: "6px"
//   },
//   metricNote: {
//     fontSize: "12px",
//     color: "rgb(161, 181, 241)",
//     fontWeight: "500"
//   },
//   navigationSection: {
//     padding: "60px 20px",
//     maxWidth: "1200px",
//     margin: "0 auto"
//   },
//   navWrapper: {
//     marginBottom: "40px"
//   },
//   tabBar: {
//     display: "flex",
//     gap: "8px",
//     background: "#ffffff",
//     padding: "8px",
//     borderRadius: "12px",
//     boxShadow: "0 2px 8px rgba(161, 181, 241, 0.1)",
//     border: "1px solid rgba(161, 181, 241, 0.2)",
//     overflowX: "auto"
//   },
//   tabControl: {
//     flex: 1,
//     minWidth: "140px",
//     padding: "16px 24px",
//     background: "transparent",
//     border: "none",
//     borderRadius: "8px",
//     fontSize: "15px",
//     fontWeight: "600",
//     color: "#64748b",
//     cursor: "pointer",
//     transition: "all 0.3s ease",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: "8px"
//   },
//   tabActive: {
//     background: "rgb(161, 181, 241)",
//     color: "#ffffff"
//   },
//   tabIcon: {
//     fontSize: "16px"
//   },
//   contentArea: {
//     minHeight: "600px"
//   },
//   panel: {
//     animation: "fadeIn 0.4s ease"
//   },
//   panelHeading: {
//     textAlign: "center",
//     marginBottom: "48px"
//   },
//   panelTitle: {
//     fontSize: "32px",
//     fontWeight: "700",
//     color: "#1e293b",
//     marginBottom: "12px"
//   },
//   panelDescription: {
//     fontSize: "16px",
//     color: "#64748b",
//     maxWidth: "700px",
//     margin: "0 auto"
//   },
//   initiativesGrid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
//     gap: "24px"
//   },
//   initiativeCard: {
//     background: "#ffffff",
//     borderRadius: "16px",
//     padding: "28px",
//     boxShadow: "0 2px 8px rgba(161, 181, 241, 0.1)",
//     border: "1px solid rgba(161, 181, 241, 0.2)",
//     transition: "all 0.3s ease"
//   },
//   initiativeTop: {
//     display: "flex",
//     alignItems: "flex-start",
//     gap: "16px",
//     marginBottom: "20px"
//   },
//   initiativeIcon: {
//     fontSize: "20px",
//     color: "rgb(161, 181, 241)",
//     background: "rgba(161, 181, 241, 0.1)",
//     width: "56px",
//     height: "56px",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: "12px"
//   },
//   initiativeMeta: {
//     flex: 1
//   },
//   teamSize: {
//     fontSize: "13px",
//     color: "#64748b",
//     fontWeight: "600",
//     display: "block",
//     marginBottom: "10px"
//   },
//   progressTrack: {
//     height: "6px",
//     background: "rgba(161, 181, 241, 0.15)",
//     borderRadius: "3px",
//     overflow: "hidden"
//   },
//   progressBar: {
//     height: "100%",
//     background: "rgb(161, 181, 241)",
//     transition: "width 0.3s ease"
//   },
//   initiativeBody: {
//     marginBottom: "20px"
//   },
//   initiativeTitle: {
//     fontSize: "18px",
//     fontWeight: "700",
//     color: "#1e293b",
//     marginBottom: "12px"
//   },
//   initiativeText: {
//     fontSize: "14px",
//     color: "#64748b",
//     lineHeight: "1.6"
//   },
//   initiativeBottom: {
//     paddingTop: "16px",
//     borderTop: "1px solid rgba(161, 181, 241, 0.15)"
//   },
//   completionLabel: {
//     fontSize: "13px",
//     color: "rgb(161, 181, 241)",
//     fontWeight: "600"
//   },
//   innovationsGrid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
//     gap: "24px"
//   },
//   innovationCard: {
//     background: "#ffffff",
//     borderRadius: "16px",
//     padding: "28px",
//     boxShadow: "0 2px 8px rgba(161, 181, 241, 0.1)",
//     border: "1px solid rgba(161, 181, 241, 0.2)",
//     display: "flex",
//     gap: "20px",
//     transition: "all 0.3s ease"
//   },
//   innovationIconBox: {
//     width: "56px",
//     height: "56px",
//     borderRadius: "12px",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     border: "2px solid",
//     flexShrink: 0
//   },
//   innovationIcon: {
//     fontSize: "24px",
//     color: "rgb(161, 181, 241)"
//   },
//   innovationBody: {
//     flex: 1
//   },
//   innovationHeader: {
//     display: "flex",
//     alignItems: "flex-start",
//     justifyContent: "space-between",
//     gap: "12px",
//     marginBottom: "12px"
//   },
//   innovationTitle: {
//     fontSize: "17px",
//     fontWeight: "700",
//     color: "#1e293b",
//     flex: 1
//   },
//   phaseLabel: {
//     padding: "4px 12px",
//     borderRadius: "12px",
//     fontSize: "11px",
//     fontWeight: "700",
//     color: "#ffffff",
//     whiteSpace: "nowrap"
//   },
//   innovationText: {
//     fontSize: "14px",
//     color: "#64748b",
//     lineHeight: "1.6"
//   },
//   demoWrapper: {
//     maxWidth: "900px",
//     margin: "0 auto"
//   },
//   demoCard: {
//     background: "#ffffff",
//     borderRadius: "20px",
//     padding: "36px",
//     boxShadow: "0 4px 16px rgba(161, 181, 241, 0.15)",
//     border: "1px solid rgba(161, 181, 241, 0.2)"
//   },
//   demoHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "32px"
//   },
//   demoTitle: {
//     fontSize: "22px",
//     fontWeight: "700",
//     color: "#1e293b"
//   },
//   liveBadge: {
//     background: "rgb(161, 181, 241)",
//     color: "#ffffff",
//     padding: "6px 16px",
//     borderRadius: "20px",
//     fontSize: "12px",
//     fontWeight: "700",
//     display: "flex",
//     alignItems: "center"
//   },
//   demoBody: {
//     marginBottom: "32px"
//   },
//   visualArea: {
//     background: "rgba(161, 181, 241, 0.05)",
//     borderRadius: "16px",
//     padding: "40px",
//     marginBottom: "32px",
//     minHeight: "300px",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     position: "relative",
//     border: "2px solid rgba(161, 181, 241, 0.2)"
//   },
//   visualActive: {
//     background: "rgba(161, 181, 241, 0.08)"
//   },
//   networkDisplay: {
//     display: "flex",
//     gap: "60px",
//     alignItems: "center",
//     position: "relative"
//   },
//   layerColumn: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "16px"
//   },
//   networkNode: {
//     width: "20px",
//     height: "20px",
//     borderRadius: "50%",
//     background: "rgb(161, 181, 241)",
//     boxShadow: "0 2px 8px rgba(161, 181, 241, 0.3)"
//   },
//   signalPulse: {
//     position: "absolute",
//     width: "10px",
//     height: "10px",
//     borderRadius: "50%",
//     background: "#6366f1",
//     animation: "pulse 2s ease-in-out infinite"
//   },
//   pulse1: {
//     left: "10%",
//     top: "50%",
//     animationDelay: "0s"
//   },
//   pulse2: {
//     left: "40%",
//     top: "30%",
//     animationDelay: "0.4s"
//   },
//   pulse3: {
//     left: "70%",
//     top: "60%",
//     animationDelay: "0.8s"
//   },
//   demoInfo: {
//     marginBottom: "24px"
//   },
//   demoDescription: {
//     fontSize: "15px",
//     color: "#64748b",
//     lineHeight: "1.7",
//     marginBottom: "24px"
//   },
//   statsRow: {
//     display: "flex",
//     gap: "32px",
//     flexWrap: "wrap"
//   },
//   statItem: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "6px"
//   },
//   statValue: {
//     fontSize: "18px",
//     fontWeight: "700",
//     color: "#1e293b"
//   },
//   statLabel: {
//     fontSize: "12px",
//     color: "#64748b",
//     fontWeight: "600"
//   },
//   demoControls: {
//     display: "flex",
//     justifyContent: "center"
//   },
//   demoButton: {
//     padding: "16px 48px",
//     background: "rgb(161, 181, 241)",
//     color: "#ffffff",
//     border: "none",
//     borderRadius: "12px",
//     fontSize: "15px",
//     fontWeight: "600",
//     cursor: "pointer",
//     transition: "all 0.3s ease",
//     display: "flex",
//     alignItems: "center",
//     gap: "12px"
//   },
//   demoButtonActive: {
//     opacity: 0.7,
//     cursor: "not-allowed"
//   },
//   papersList: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "20px",
//     maxWidth: "900px",
//     margin: "0 auto"
//   },
//   paperCard: {
//     background: "#ffffff",
//     borderRadius: "16px",
//     padding: "28px",
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     gap: "24px",
//     boxShadow: "0 2px 8px rgba(161, 181, 241, 0.1)",
//     border: "1px solid rgba(161, 181, 241, 0.2)",
//     transition: "all 0.3s ease"
//   },
//   paperContent: {
//     flex: 1
//   },
//   paperTitle: {
//     fontSize: "18px",
//     fontWeight: "700",
//     color: "#1e293b",
//     marginBottom: "8px"
//   },
//   paperAuthors: {
//     fontSize: "14px",
//     color: "#64748b",
//     marginBottom: "12px"
//   },
//   paperMeta: {
//     display: "flex",
//     gap: "16px",
//     alignItems: "center"
//   },
//   venueTag: {
//     fontSize: "13px",
//     fontWeight: "600",
//     color: "rgb(161, 181, 241)",
//     background: "rgba(161, 181, 241, 0.1)",
//     padding: "4px 12px",
//     borderRadius: "6px"
//   },
//   citationCount: {
//     fontSize: "13px",
//     color: "#64748b",
//     fontWeight: "500"
//   },
//   paperAction: {
//     padding: "12px 28px",
//     background: "transparent",
//     color: "rgb(161, 181, 241)",
//     border: "2px solid rgb(161, 181, 241)",
//     borderRadius: "10px",
//     fontSize: "14px",
//     fontWeight: "600",
//     cursor: "pointer",
//     transition: "all 0.3s ease",
//     whiteSpace: "nowrap",
//     display: "flex",
//     alignItems: "center"
//   },
//   ctaSection: {
//     position: "relative",
//     padding: "80px 20px",
//     marginTop: "60px",
//     overflow: "hidden"
//   },
//   ctaBackground: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     background: "linear-gradient(135deg, rgb(161, 181, 241) 0%, rgb(230, 236, 253) 100%)",
//     zIndex: 1
//   },
//   ctaContainer: {
//     maxWidth: "1000px",
//     margin: "0 auto",
//     position: "relative",
//     zIndex: 2
//   },
//   ctaContent: {
//     textAlign: "center"
//   },
//   ctaHeading: {
//     fontSize: "42px",
//     fontWeight: "700",
//     color: "#1e293b",
//     marginBottom: "20px"
//   },
//   ctaText: {
//     fontSize: "17px",
//     color: "#475569",
//     lineHeight: "1.7",
//     maxWidth: "800px",
//     margin: "0 auto 40px"
//   },
//   opportunitiesBar: {
//     display: "flex",
//     justifyContent: "center",
//     gap: "40px",
//     marginBottom: "40px",
//     flexWrap: "wrap"
//   },
//   opportunity: {
//     fontSize: "15px",
//     color: "#1e293b",
//     fontWeight: "500",
//     display: "flex",
//     alignItems: "center"
//   },
//   actionButtons: {
//     display: "flex",
//     gap: "16px",
//     justifyContent: "center",
//     flexWrap: "wrap"
//   },
//   actionBtn: {
//     padding: "16px 32px",
//     border: "none",
//     borderRadius: "12px",
//     fontSize: "15px",
//     fontWeight: "600",
//     cursor: "pointer",
//     transition: "all 0.3s ease",
//     display: "flex",
//     alignItems: "center"
//   },
//   primaryBtn: {
//     background: "#1e293b",
//     color: "#ffffff"
//   },
//   secondaryBtn: {
//     background: "#ffffff",
//     color: "#1e293b"
//   },
//   outlineBtn: {
//     background: "transparent",
//     color: "#1e293b",
//     border: "2px solid #1e293b"
//   }
// };




import React, { useState } from 'react';
import { 
  Brain, 
  FlaskConical, 
  Bot, 
  BookOpen, 
  TrendingUp, 
  FileText, 
  Users, 
  Cpu,
  Shield,
  Lightbulb,
  Target,
  RefreshCw,
  Gem,
  Atom,
  Star,
  Scale,
  Link,
  Download,
  Eye,
  Loader2,
  GraduationCap,
  Handshake,
  Calendar,
  ChevronRight,
  Sparkles,
  Zap,
  BarChart3
} from 'lucide-react';

import { useNavigate } from "react-router-dom";

export default function ProfessionalAILab() {
  const [currentTab, setCurrentTab] = useState("innovations");
  const [demoActive, setDemoActive] = useState(false);

  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };


  const innovations = [
    {
      title: "Adaptive Neural Architecture",
      description: "Self-optimizing deep learning frameworks that automatically configure network topology based on task complexity and data characteristics",
      icon: Brain,
      phase: "Deployed",
      color: "#3B82F6"
    },
    {
      title: "Interpretable Intelligence",
      description: "Advanced explainability systems providing transparent insights into model decision pathways and feature attribution mechanisms",
      icon: Lightbulb,
      phase: "Validation",
      color: "#10B981"
    },
    {
      title: "Distributed Privacy Learning",
      description: "Enterprise-grade federated training infrastructure with cryptographic guarantees for sensitive data protection",
      icon: Shield,
      phase: "Deployed",
      color: "#EF4444"
    },
    {
      title: "Cognitive Architecture",
      description: "Neural-symbolic hybrid systems integrating probabilistic reasoning with deterministic logic engines",
      icon: Target,
      phase: "Experimental",
      color: "#8B5CF6"
    },
    {
      title: "Cross-Modal Intelligence",
      description: "Unified representation learning across vision, language, and audio domains with zero-shot transfer capabilities",
      icon: RefreshCw,
      phase: "Advanced Testing",
      color: "#F59E0B"
    },
    {
      title: "Adaptive Meta-Learning",
      description: "Few-shot learning systems capable of rapid task adaptation with minimal training examples",
      icon: TrendingUp,
      phase: "Experimental",
      color: "#EC4899"
    }
  ];

  const initiatives = [
    {
      title: "Quantum-Enhanced ML",
      description: "Investigating quantum computing paradigms for optimization, sampling, and cryptographic machine learning applications",
      icon: Atom,
      completion: 58,
      team: 15
    },
    {
      title: "General Intelligence Research",
      description: "Fundamental investigations into transfer learning, reasoning, and adaptable cognitive architectures",
      icon: Star,
      completion: 35,
      team: 22
    },
    {
      title: "Responsible AI Systems",
      description: "Developing frameworks for fairness, accountability, transparency, and ethical deployment standards",
      icon: Scale,
      completion: 82,
      team: 11
    },
    {
      title: "Symbolic-Neural Fusion",
      description: "Integrating structured knowledge representation with statistical learning for robust reasoning",
      icon: Link,
      completion: 48,
      team: 13
    },
    {
      title: "Self-Supervised Architectures",
      description: "Advancing pre-training methodologies through contrastive, predictive, and generative frameworks",
      icon: RefreshCw,
      completion: 73,
      team: 17
    },
    {
      title: "Neuromorphic Systems",
      description: "Bio-inspired computing architectures optimized for energy efficiency and parallel processing",
      icon: Gem,
      completion: 42,
      team: 10
    }
  ];

  const papers = [
    {
      title: "Hierarchical Attention Mechanisms for Sequential Data",
      team: "Martinez, Chen & Associates",
      venue: "NeurIPS 2024",
      impact: 156
    },
    {
      title: "Privacy-Preserving Collaborative Learning at Scale",
      team: "Johnson Research Group",
      venue: "ICML 2024",
      impact: 103
    },
    {
      title: "Compositional Program Synthesis with Neural Guidance",
      team: "Thompson et al.",
      venue: "ICLR 2024",
      impact: 78
    }
  ];

  const activateDemo = () => {
    setDemoActive(true);
    setTimeout(() => setDemoActive(false), 3000);
  };

  return (
    <div className="ai-wrapper">
      {/* Hero Section */}
      <section className="ai-hero">
        <div className="ai-hero-content">
          {/* <div className="ai-branding">
            <div className="ai-logo">
              <Brain size={48} />
              <div className="ai-logo-text">
                <h1 className="ai-logo-primary">Cognition</h1>
                <span className="ai-logo-secondary">Institute</span>
              </div>
            </div>
            <div className="ai-department">
              Advanced AI Research
            </div>
          </div> */}
          
          <div className="ai-hero-main">
            <h1 className="ai-hero-title">
              Transforming Intelligence
              <span className="ai-hero-accent"> Through Innovation</span>
            </h1>
            <p className="ai-hero-subtitle">
              Leading breakthrough research in artificial intelligence with emphasis on 
              responsible development, scientific rigor, and transformative applications.
            </p>
          </div>
          
          <div className="ai-hero-stats">
            <div className="ai-stat-item">
              <div className="ai-stat-value">$32.8M</div>
              <div className="ai-stat-label">Annual Research Budget</div>
            </div>
            <div className="ai-stat-item">
              <div className="ai-stat-value">26</div>
              <div className="ai-stat-label">Strategic Partnerships</div>
            </div>
            <div className="ai-stat-item">
              <div className="ai-stat-value">9</div>
              <div className="ai-stat-label">Global Research Centers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Dashboard */}
      <section className="ai-metrics">
        <div className="ai-metrics-grid">
          <div className="ai-metric-card">
            <div className="ai-metric-icon">
              <BarChart3 size={24} />
            </div>
            <div className="ai-metric-content">
              <div className="ai-metric-value">31</div>
              <div className="ai-metric-title">Research Programs</div>
              <div className="ai-metric-change">+5 this year</div>
            </div>
          </div>
          <div className="ai-metric-card">
            <div className="ai-metric-icon">
              <FileText size={24} />
            </div>
            <div className="ai-metric-content">
              <div className="ai-metric-value">184</div>
              <div className="ai-metric-title">Published Papers</div>
              <div className="ai-metric-change">18 tier-1 venues</div>
            </div>
          </div>
          <div className="ai-metric-card">
            <div className="ai-metric-icon">
              <Users size={24} />
            </div>
            <div className="ai-metric-content">
              <div className="ai-metric-value">63</div>
              <div className="ai-metric-title">Research Scientists</div>
              <div className="ai-metric-change">12 new PhDs</div>
            </div>
          </div>
          <div className="ai-metric-card">
            <div className="ai-metric-icon">
              <Cpu size={24} />
            </div>
            <div className="ai-metric-content">
              <div className="ai-metric-value">92</div>
              <div className="ai-metric-title">AI Systems</div>
              <div className="ai-metric-change">21 deployed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="ai-main">
        <div className="ai-container">
          <div className="ai-layout">
            {/* Main Content Area */}
            <main className="ai-content">
              {/* Navigation Tabs */}
              <div className="ai-tabs">
                <button 
                  className={`ai-tab-btn ${currentTab === "initiatives" ? 'active' : ''}`}
                  onClick={() => setCurrentTab("initiatives")}
                >
                  <FlaskConical size={18} />
                  <span>Research Initiatives</span>
                </button>
                <button 
                  className={`ai-tab-btn ${currentTab === "innovations" ? 'active' : ''}`}
                  onClick={() => setCurrentTab("innovations")}
                >
                  <Lightbulb size={18} />
                  <span>Core Technologies</span>
                </button>
                <button 
                  className={`ai-tab-btn ${currentTab === "demonstrations" ? 'active' : ''}`}
                  onClick={() => setCurrentTab("demonstrations")}
                >
                  <Bot size={18} />
                  <span>Interactive Demo</span>
                </button>
                <button 
                  className={`ai-tab-btn ${currentTab === "papers" ? 'active' : ''}`}
                  onClick={() => setCurrentTab("papers")}
                >
                  <BookOpen size={18} />
                  <span>Publications</span>
                </button>
              </div>

              {/* Content Panels */}
              <div className="ai-tab-content">
                {currentTab === "initiatives" && (
                  <div className="ai-panel">
                    <div className="ai-panel-header">
                      <h2 className="ai-panel-title">Strategic Research Initiatives</h2>
                      <p className="ai-panel-subtitle">Advancing fundamental understanding across key domains in artificial intelligence</p>
                    </div>
                    
                    <div className="ai-initiatives-grid">
                      {initiatives.map((item, idx) => (
                        <div key={idx} className="ai-initiative-card">
                          <div className="ai-initiative-header">
                            <div className="ai-initiative-icon">
                              <item.icon size={20} />
                            </div>
                            <div className="ai-initiative-meta">
                              <span className="ai-initiative-team">{item.team} researchers</span>
                              <div className="ai-initiative-progress">
                                <div 
                                  className="ai-initiative-progress-bar"
                                  style={{ width: `${item.completion}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="ai-initiative-body">
                            <h3 className="ai-initiative-title">{item.title}</h3>
                            <p className="ai-initiative-description">{item.description}</p>
                          </div>
                          
                          <div className="ai-initiative-footer">
                            <span className="ai-initiative-completion">{item.completion}% progress</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentTab === "innovations" && (
                  <div className="ai-panel">
                    <div className="ai-panel-header">
                      <h2 className="ai-panel-title">Core Technology Portfolio</h2>
                      <p className="ai-panel-subtitle">Production-ready and experimental systems driving next-generation AI capabilities</p>
                    </div>
                    
                    <div className="ai-innovations-grid">
                      {innovations.map((item, idx) => (
                        <div key={idx} className="ai-innovation-card">
                          <div 
                            className="ai-innovation-icon"
                            style={{ 
                              backgroundColor: `${item.color}15`,
                              borderColor: item.color
                            }}
                          >
                            <item.icon size={24} style={{ color: item.color }} />
                          </div>
                          
                          <div className="ai-innovation-content">
                            <div className="ai-innovation-header">
                              <h3 className="ai-innovation-title">{item.title}</h3>
                              <span 
                                className="ai-innovation-phase"
                                style={{ backgroundColor: item.color }}
                              >
                                {item.phase}
                              </span>
                            </div>
                            <p className="ai-innovation-description">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentTab === "demonstrations" && (
                  <div className="ai-panel">
                    <div className="ai-panel-header">
                      <h2 className="ai-panel-title">Interactive System Demonstrations</h2>
                      <p className="ai-panel-subtitle">Live visualization of advanced neural network architectures and processing</p>
                    </div>
                    
                    <div className="ai-demo-card">
                      <div className="ai-demo-header">
                        <h3 className="ai-demo-title">Deep Neural Network Visualization</h3>
                        <div className="ai-demo-live">
                          <Eye size={14} />
                          <span>Real-time</span>
                        </div>
                      </div>
                      
                      <div className="ai-demo-body">
                        <div className={`ai-demo-visual ${demoActive ? 'active' : ''}`}>
                          <div className="ai-network">
                            {[...Array(3)].map((_, layerIdx) => (
                              <div key={layerIdx} className="ai-layer">
                                {[...Array(5)].map((_, nodeIdx) => (
                                  <div key={nodeIdx} className="ai-node"></div>
                                ))}
                              </div>
                            ))}
                            
                            {demoActive && (
                              <>
                                <div className="ai-pulse ai-pulse-1"></div>
                                <div className="ai-pulse ai-pulse-2"></div>
                                <div className="ai-pulse ai-pulse-3"></div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="ai-demo-info">
                          <p className="ai-demo-description">
                            {demoActive
                              ? "Processing multi-layer forward propagation with real-time activation visualization across neural pathways..."
                              : "Observe our sophisticated neural architecture featuring multi-layer processing with dynamic activation patterns."}
                          </p>
                          
                          <div className="ai-demo-stats">
                            <div className="ai-demo-stat">
                              <div className="ai-demo-stat-value">2.4M</div>
                              <div className="ai-demo-stat-label">Parameters</div>
                            </div>
                            <div className="ai-demo-stat">
                              <div className="ai-demo-stat-value">784-512-256-10</div>
                              <div className="ai-demo-stat-label">Topology</div>
                            </div>
                            <div className="ai-demo-stat">
                              <div className="ai-demo-stat-value">99.1%</div>
                              <div className="ai-demo-stat-label">Validation Accuracy</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ai-demo-controls">
                        <button
                          onClick={activateDemo}
                          disabled={demoActive}
                          className={`ai-demo-btn ${demoActive ? 'active' : ''}`}
                        >
                          {demoActive ? (
                            <>
                              <Loader2 size={16} className="ai-spinner" />
                              Processing Simulation...
                            </>
                          ) : (
                            "Initialize Network Simulation"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {currentTab === "papers" && (
                  <div className="ai-panel">
                    <div className="ai-panel-header">
                      <h2 className="ai-panel-title">Recent Academic Contributions</h2>
                      <p className="ai-panel-subtitle">Latest peer-reviewed publications from our research teams at premier conferences</p>
                    </div>
                    
                    <div className="ai-papers-list">
                      {papers.map((paper, idx) => (
                        <div key={idx} className="ai-paper-card">
                          <div className="ai-paper-content">
                            <h3 className="ai-paper-title">{paper.title}</h3>
                            <p className="ai-paper-authors">{paper.team}</p>
                            <div className="ai-paper-meta">
                              <span className="ai-paper-venue">{paper.venue}</span>
                              <span className="ai-paper-citations">{paper.impact} citations</span>
                            </div>
                          </div>
                          <button className="ai-paper-btn" onClick={goToLogin}>
                            <Download size={16} />
                            <span>Access Paper</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </main>

            {/* Sidebar */}
            <aside className="ai-sidebar">
              {/* Call to Action */}
              <div className="ai-sidebar-section">
                <div className="ai-cta-card">
                  <h3 className="ai-cta-title">Join Our Research Ecosystem</h3>
                  <p className="ai-cta-description">
                    Partner with leading experts in artificial intelligence, access state-of-the-art 
                    infrastructure, and contribute to pioneering research.
                  </p>
                  
                  <div className="ai-opportunities">
                    <div className="ai-opportunity">
                      <GraduationCap size={16} />
                      <span><strong>7</strong> Research Positions</span>
                    </div>
                    <div className="ai-opportunity">
                      <Users size={16} />
                      <span><strong>4</strong> Doctoral Fellowships</span>
                    </div>
                    <div className="ai-opportunity">
                      <Calendar size={16} />
                      <span><strong>Year-round</strong> Internship Programs</span>
                    </div>
                  </div>
                  
                  <div className="ai-cta-buttons">
                    <button className="ai-cta-btn ai-cta-primary" onClick={goToLogin}>
                      <GraduationCap size={16} />
                      <span>Explore Career Opportunities</span>
                    </button>
                    <button className="ai-cta-btn ai-cta-secondary" onClick={goToLogin}>
                      <Handshake size={16} />
                      <span>Research Collaboration</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="ai-sidebar-section">
                <h3 className="ai-sidebar-title">Quick Links</h3>
                <div className="ai-quick-links">
                  <a href="/" className="ai-quick-link">
                    <Zap size={16} />
                    <span>Research Opportunities</span>
                    <ChevronRight size={16} />
                  </a>
                  <a href="/" className="ai-quick-link">
                    <Sparkles size={16} />
                    <span>Innovation Showcase</span>
                    <ChevronRight size={16} />
                  </a>
                  <a href="/" className="ai-quick-link">
                    <Download size={16} />
                    <span>Download Prospectus</span>
                    <ChevronRight size={16} />
                  </a>
                  <a href="/" className="ai-quick-link">
                    <Handshake size={16} />
                    <span>Partnership Inquiry</span>
                    <ChevronRight size={16} />
                  </a>
                </div>
              </div>

              {/* Research Stats */}
              <div className="ai-sidebar-section">
                <h3 className="ai-sidebar-title">Research Overview</h3>
                <div className="ai-research-stats">
                  <div className="ai-research-stat">
                    <span className="ai-research-stat-label">Active Projects</span>
                    <span className="ai-research-stat-value">31</span>
                  </div>
                  <div className="ai-research-stat">
                    <span className="ai-research-stat-label">Patents Filed</span>
                    <span className="ai-research-stat-value">18</span>
                  </div>
                  <div className="ai-research-stat">
                    <span className="ai-research-stat-label">Industry Partners</span>
                    <span className="ai-research-stat-value">42</span>
                  </div>
                  <div className="ai-research-stat">
                    <span className="ai-research-stat-label">Awards Received</span>
                    <span className="ai-research-stat-value">27</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .ai-wrapper { width: 100%; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; }
        
        /* Hero Section */
        .ai-hero { background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 80px 20px 60px; text-align: center; }
        .ai-hero-content { max-width: 1200px; margin: 0 auto; }
        
        .ai-branding { margin-bottom: 48px; }
        .ai-logo { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 12px; }
        .ai-logo svg { color: white; }
        .ai-logo-text { display: flex; flex-direction: column; align-items: flex-start; }
        .ai-logo-primary { font-size: 32px; font-weight: 700; color: white; line-height: 1; }
        .ai-logo-secondary { font-size: 18px; font-weight: 300; color: rgba(255,255,255,0.8); margin-top: 4px; }
        .ai-department { display: inline-block; background: rgba(255,255,255,0.2); padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 600; color: white; letter-spacing: 0.5px; }
        
        .ai-hero-main { margin-bottom: 48px; }
        .ai-hero-title { font-size: 48px; font-weight: 700; color: white; margin-bottom: 20px; line-height: 1.2; }
        .ai-hero-accent { color: rgba(255,255,255,0.9); }
        .ai-hero-subtitle { font-size: 18px; color: rgba(255,255,255,0.9); max-width: 800px; margin: 0 auto; line-height: 1.6; }
        
        .ai-hero-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; max-width: 800px; margin: 0 auto; }
        .ai-stat-item { text-align: center; }
        .ai-stat-value { font-size: 36px; font-weight: 700; color: white; margin-bottom: 8px; }
        .ai-stat-label { font-size: 14px; color: rgba(255,255,255,0.8); font-weight: 500; }
        
        /* Metrics Dashboard */
        .ai-metrics { padding: 40px 20px; max-width: 1200px; margin: 40px auto 0; position: relative; z-index: 10; }
        .ai-metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .ai-metric-card { background: white; border-radius: 12px; padding: 24px; display: flex; gap: 16px; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .ai-metric-icon { width: 48px; height: 48px; background: rgba(59, 130, 246, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #3B82F6; }
        .ai-metric-content { flex: 1; }
        .ai-metric-value { font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
        .ai-metric-title { font-size: 14px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
        .ai-metric-change { font-size: 12px; color: #3B82F6; font-weight: 500; }
        
        /* Main Content */
        .ai-main { padding: 40px 0; }
        .ai-container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }
        .ai-layout { display: grid; grid-template-columns: 1fr 350px; gap: 32px; }
        
        /* Content Area */
        .ai-content { display: flex; flex-direction: column; gap: 24px; }
        
        /* Tabs */
        .ai-tabs { display: flex; gap: 8px; background: white; padding: 8px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .ai-tab-btn { flex: 1; padding: 12px 16px; background: transparent; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .ai-tab-btn:hover { background: #f1f5f9; color: #3B82F6; }
        .ai-tab-btn.active { background: #3B82F6; color: white; }
        
        /* Panel */
        .ai-panel { animation: fadeIn 0.4s ease; }
        .ai-panel-header { text-align: center; margin-bottom: 40px; }
        .ai-panel-title { font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
        .ai-panel-subtitle { font-size: 16px; color: #64748b; max-width: 700px; margin: 0 auto; }
        
        /* Initiatives Grid */
        .ai-initiatives-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .ai-initiative-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .ai-initiative-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px; }
        .ai-initiative-icon { width: 48px; height: 48px; background: rgba(59, 130, 246, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #3B82F6; }
        .ai-initiative-meta { flex: 1; }
        .ai-initiative-team { font-size: 13px; color: #64748b; font-weight: 600; display: block; margin-bottom: 10px; }
        .ai-initiative-progress { height: 6px; background: rgba(59, 130, 246, 0.15); border-radius: 3px; overflow: hidden; }
        .ai-initiative-progress-bar { height: 100%; background: #3B82F6; transition: width 0.3s ease; }
        
        .ai-initiative-body { margin-bottom: 20px; }
        .ai-initiative-title { font-size: 17px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
        .ai-initiative-description { font-size: 14px; color: #64748b; line-height: 1.6; }
        
        .ai-initiative-footer { padding-top: 16px; border-top: 1px solid #e2e8f0; }
        .ai-initiative-completion { font-size: 13px; color: #3B82F6; font-weight: 600; }
        
        /* Innovations Grid */
        .ai-innovations-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .ai-innovation-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; display: flex; gap: 16px; }
        .ai-innovation-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 2px solid; flex-shrink: 0; }
        
        .ai-innovation-content { flex: 1; }
        .ai-innovation-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
        .ai-innovation-title { font-size: 17px; font-weight: 600; color: #1e293b; flex: 1; }
        .ai-innovation-phase { padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; color: white; white-space: nowrap; }
        .ai-innovation-description { font-size: 14px; color: #64748b; line-height: 1.6; }
        
        /* Demo Card */
        .ai-demo-card { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
        .ai-demo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .ai-demo-title { font-size: 20px; font-weight: 600; color: #1e293b; }
        .ai-demo-live { background: #3B82F6; color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
        
        .ai-demo-body { margin-bottom: 32px; }
        .ai-demo-visual { background: rgba(59, 130, 246, 0.05); border-radius: 16px; padding: 40px; margin-bottom: 24px; min-height: 280px; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(59, 130, 246, 0.1); }
        .ai-demo-visual.active { background: rgba(59, 130, 246, 0.08); }
        
        .ai-network { display: flex; gap: 60px; align-items: center; position: relative; }
        .ai-layer { display: flex; flex-direction: column; gap: 16px; }
        .ai-node { width: 20px; height: 20px; border-radius: 50%; background: #3B82F6; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3); }
        
        .ai-pulse { position: absolute; width: 10px; height: 10px; border-radius: 50%; background: #6366f1; animation: pulse 2s ease-in-out infinite; }
        .ai-pulse-1 { left: 10%; top: 50%; animation-delay: 0s; }
        .ai-pulse-2 { left: 40%; top: 30%; animation-delay: 0.4s; }
        .ai-pulse-3 { left: 70%; top: 60%; animation-delay: 0.8s; }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }
        
        .ai-demo-info { margin-bottom: 24px; }
        .ai-demo-description { font-size: 15px; color: #64748b; line-height: 1.6; margin-bottom: 24px; }
        
        .ai-demo-stats { display: flex; gap: 32px; }
        .ai-demo-stat { display: flex; flex-direction: column; gap: 6px; }
        .ai-demo-stat-value { font-size: 18px; font-weight: 700; color: #1e293b; }
        .ai-demo-stat-label { font-size: 12px; color: #64748b; font-weight: 600; }
        
        .ai-demo-controls { display: flex; justify-content: center; }
        .ai-demo-btn { padding: 16px 48px; background: #3B82F6; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 12px; }
        .ai-demo-btn:hover:not(:disabled) { background: #2563eb; }
        .ai-demo-btn.active { opacity: 0.7; cursor: not-allowed; }
        .ai-spinner { animation: spin 1s linear infinite; }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Papers List */
        .ai-papers-list { display: flex; flex-direction: column; gap: 16px; max-width: 900px; margin: 0 auto; }
        .ai-paper-card { background: white; border-radius: 12px; padding: 24px; display: flex; justify-content: space-between; align-items: center; gap: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .ai-paper-content { flex: 1; }
        .ai-paper-title { font-size: 17px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .ai-paper-authors { font-size: 14px; color: #64748b; margin-bottom: 12px; }
        .ai-paper-meta { display: flex; gap: 16px; align-items: center; }
        .ai-paper-venue { font-size: 13px; font-weight: 600; color: #3B82F6; background: rgba(59, 130, 246, 0.1); padding: 4px 12px; border-radius: 6px; }
        .ai-paper-citations { font-size: 13px; color: #64748b; font-weight: 500; }
        .ai-paper-btn { padding: 10px 20px; background: transparent; color: #3B82F6; border: 2px solid #3B82F6; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 8px; }
        .ai-paper-btn:hover { background: #3B82F6; color: white; }
        
        /* Sidebar */
        .ai-sidebar { position: sticky; top: 20px; height: fit-content; display: flex; flex-direction: column; gap: 20px; }
        
        /* CTA Card */
        .ai-cta-card { background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); border-radius: 12px; padding: 24px; color: white; }
        .ai-cta-title { font-size: 20px; font-weight: 700; color: white; margin-bottom: 12px; }
        .ai-cta-description { font-size: 14px; color: rgba(255,255,255,0.9); line-height: 1.6; margin-bottom: 24px; }
        
        .ai-opportunities { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
        .ai-opportunity { display: flex; align-items: center; gap: 8px; font-size: 14px; color: rgba(255,255,255,0.9); }
        .ai-opportunity strong { color: white; }
        
        .ai-cta-buttons { display: flex; flex-direction: column; gap: 12px; }
        .ai-cta-btn { padding: 12px 16px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .ai-cta-primary { background: white; color: #3B82F6; }
        .ai-cta-primary:hover { background: rgba(255,255,255,0.9); }
        .ai-cta-secondary { background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); }
        .ai-cta-secondary:hover { background: rgba(255,255,255,0.3); }
        
        /* Sidebar Sections */
        .ai-sidebar-section { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .ai-sidebar-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
        
        .ai-quick-links { display: flex; flex-direction: column; gap: 8px; }
        .ai-quick-link { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 8px; text-decoration: none; color: #4b5563; transition: 0.2s; }
        .ai-quick-link:hover { background: #e2e8f0; color: #3B82F6; }
        
        .ai-research-stats { display: flex; flex-direction: column; gap: 12px; }
        .ai-research-stat { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
        .ai-research-stat-label { font-size: 14px; color: #4b5563; }
        .ai-research-stat-value { font-size: 18px; font-weight: 700; color: #3B82F6; }
        
        /* Responsive Design */
        @media (max-width: 1200px) {
          .ai-layout { grid-template-columns: 1fr; }
          .ai-sidebar { position: relative; }
          .ai-metrics-grid { grid-template-columns: repeat(2, 1fr); }
          .ai-initiatives-grid { grid-template-columns: 1fr; }
          .ai-innovations-grid { grid-template-columns: 1fr; }
        }
        
        @media (max-width: 768px) {
          .ai-hero-title { font-size: 32px; }
          .ai-hero-subtitle { font-size: 16px; }
          .ai-hero-stats { grid-template-columns: 1fr; gap: 24px; }
          .ai-metrics-grid { grid-template-columns: 1fr; }
          .ai-tabs { flex-wrap: wrap; }
          .ai-tab-btn { flex: 1 0 calc(50% - 8px); }
          .ai-demo-stats { flex-direction: column; gap: 16px; }
          .ai-paper-card { flex-direction: column; align-items: flex-start; }
          .ai-paper-btn { width: 100%; }
        }
      `}</style>
    </div>
  );
}