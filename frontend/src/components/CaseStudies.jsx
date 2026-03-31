// import React, { useState } from "react";
// import { 
//   FaSearch, 
//   FaFilter, 
//   FaChartLine, 
//   FaUsers, 
//   FaRocket,
//   FaCalendarAlt,
//   FaPlay,
//   FaStar,
//   FaArrowRight,
//   FaTag,
//   FaGlobe,
//   FaClock,
//   FaTrophy,
//   FaRegCheckCircle
// } from "react-icons/fa";
// // import HomeTopBar from "../pages/HomePage/HomeTopBar";

// const caseStudies = [
//   { 
//     id: 1,
//     title: "Boosting Fashion Brand Awareness", 
//     description: "How a fashion brand increased engagement by 150% using AI-driven influencer campaigns.",
//     category: "Fashion",
//     results: "150% engagement increase",
//     duration: "3 months",
//     platform: "Instagram",
//     image: "https://images.unsplash.com/photo-1566206091558-7f218b696731?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
//     featured: true
//   },
//   { 
//     id: 2,
//     title: "Travel Campaign Success", 
//     description: "Leveraging travel influencers to drive bookings and social media engagement.",
//     category: "Travel",
//     results: "40% booking increase",
//     duration: "2 months",
//     platform: "Multiple",
//     image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
//   },
//   { 
//     id: 3,
//     title: "Fitness Brand Growth", 
//     description: "Increasing fitness product sales with targeted influencer collaborations.",
//     category: "Fitness",
//     results: "75% sales uplift",
//     duration: "4 months",
//     platform: "YouTube",
//     image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
//   },
//   { 
//     id: 4,
//     title: "Tech Product Launch", 
//     description: "Successful launch of a new gadget using micro-influencers on YouTube.",
//     category: "Technology",
//     results: "200K+ views",
//     duration: "1 month",
//     platform: "YouTube",
//     image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
//     featured: true
//   },
//   { 
//     id: 5,
//     title: "Food Delivery Campaign", 
//     description: "Promoting a local food delivery service with Instagram influencers.",
//     category: "Food",
//     results: "300% ROI",
//     duration: "6 weeks",
//     platform: "Instagram",
//     image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
//   },
//   { 
//     id: 6,
//     title: "Music Festival Engagement", 
//     description: "Driving ticket sales and engagement with music influencers.",
//     category: "Entertainment",
//     results: "92% ticket sales",
//     duration: "2 months",
//     platform: "TikTok",
//     image: "https://images.unsplash.com/photo-1501281667305-0d4eb539d4a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
//   },
//   { 
//     id: 7,
//     title: "Education Platform Reach", 
//     description: "Growing an online learning platform with niche education influencers.",
//     category: "Education",
//     results: "60% user growth",
//     duration: "5 months",
//     platform: "LinkedIn",
//     image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
//   },
//   { 
//     id: 8,
//     title: "Gaming Launch Campaign", 
//     description: "Using Twitch influencers to boost a new game release.",
//     category: "Gaming",
//     results: "1M+ downloads",
//     duration: "1 month",
//     platform: "Twitch",
//     image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
//     featured: true
//   }
// ];

// const categories = ["All", "Fashion", "Travel", "Fitness", "Technology", "Food", "Entertainment", "Education", "Gaming", "Lifestyle", "Beauty", "Health", "Pets"];
// const platforms = ["All", "Instagram", "YouTube", "TikTok", "Twitch", "LinkedIn", "Pinterest", "Multiple"];

// export default function CaseStudies() {
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [selectedPlatform, setSelectedPlatform] = useState("All");
//   const [searchQuery, setSearchQuery] = useState("");

//   const filteredCaseStudies = caseStudies.filter(study => {
//     const matchesCategory = selectedCategory === "All" || study.category === selectedCategory;
//     const matchesPlatform = selectedPlatform === "All" || study.platform === selectedPlatform;
//     const matchesSearch = study.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
//                          study.description.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesCategory && matchesPlatform && matchesSearch;
//   });

//   const featuredStudies = caseStudies.filter(study => study.featured);

//   return (
//     <>
//     {/*  <><HomeTopBar /> */}
//     <div className="cs-container">
//       {/* Header Section */}
//       <header className="cs-hero-section">
//         <div className="cs-hero-content">
//           <div className="cs-hero-badge">
//             <FaTrophy className="cs-badge-icon" />
//             <span>Proven Success Stories</span>
//           </div>
//           <h1 className="cs-hero-title">Real Results, Real Impact</h1>
//           <p className="cs-hero-description">
//             Discover how brands across industries are achieving remarkable results with our AI-powered influencer marketing platform.
//           </p>
          
//           <div className="cs-stats-overview">
//             <div className="cs-stat-item">
//               <FaChartLine className="cs-stat-icon" />
//               <div className="cs-stat-content">
//                 <span className="cs-stat-number">200+</span>
//                 <span className="cs-stat-label">Successful Campaigns</span>
//               </div>
//             </div>
//             <div className="cs-stat-item">
//               <FaRocket className="cs-stat-icon" />
//               <div className="cs-stat-content">
//                 <span className="cs-stat-number">85%</span>
//                 <span className="cs-stat-label">Average ROI</span>
//               </div>
//             </div>
//             <div className="cs-stat-item">
//               <FaUsers className="cs-stat-icon" />
//               <div className="cs-stat-content">
//                 <span className="cs-stat-number">1.2M</span>
//                 <span className="cs-stat-label">Influencer Reach</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="cs-content-wrapper">
//         {/* Featured Case Studies */}
//         <section className="cs-featured-section">
//           <div className="cs-section-header">
//             <h2 className="cs-section-title">
//               <FaStar className="cs-title-icon" />
//               Featured Success Stories
//             </h2>
//             <p className="cs-section-description">
//               Handpicked case studies showcasing exceptional results and innovative strategies
//             </p>
//           </div>
//           <div className="cs-featured-grid">
//             {featuredStudies.map(study => (
//               <div key={study.id} className="cs-featured-card">
//                 <div className="cs-featured-image">
//                   <img src={study.image} alt={study.title} />
//                   <span className="cs-category-tag">
//                     <FaTag className="cs-tag-icon" />
//                     {study.category}
//                   </span>
//                 </div>
//                 <div className="cs-featured-content">
//                   <h3 className="cs-featured-title">{study.title}</h3>
//                   <p className="cs-featured-description">{study.description}</p>
//                   <div className="cs-results-info">
//                     <div className="cs-result-badge">
//                       <FaChartLine className="cs-result-icon" />
//                       <span>{study.results}</span>
//                     </div>
//                     <div className="cs-platform-badge">
//                       <FaGlobe className="cs-platform-icon" />
//                       <span>{study.platform}</span>
//                     </div>
//                   </div>
//                   <button className="cs-read-more-btn">
//                     <span>Read Full Case Study</span>
//                     <FaArrowRight className="cs-arrow-icon" />
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Filters and Search */}
//         <section className="cs-filters-section">
//           <div className="cs-section-header">
//             <h2 className="cs-section-title">
//               <FaFilter className="cs-title-icon" />
//               Explore Case Studies
//             </h2>
//             <p className="cs-section-description">
//               Filter by category, platform, or search for specific success stories
//             </p>
//           </div>
          
//           <div className="cs-filters-container">
//             <div className="cs-search-box">
//               <FaSearch className="cs-search-icon" />
//               <input
//                 type="text"
//                 placeholder="Search case studies..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="cs-search-input"
//               />
//             </div>
            
//             <div className="cs-filter-group">
//               <label className="cs-filter-label">
//                 <FaTag className="cs-filter-icon" />
//                 Category
//               </label>
//               <select 
//                 value={selectedCategory} 
//                 onChange={(e) => setSelectedCategory(e.target.value)}
//                 className="cs-filter-select"
//               >
//                 {categories.map(category => (
//                   <option key={category} value={category}>{category}</option>
//                 ))}
//               </select>
//             </div>
            
//             <div className="cs-filter-group">
//               <label className="cs-filter-label">
//                 <FaGlobe className="cs-filter-icon" />
//                 Platform
//               </label>
//               <select 
//                 value={selectedPlatform} 
//                 onChange={(e) => setSelectedPlatform(e.target.value)}
//                 className="cs-filter-select"
//               >
//                 {platforms.map(platform => (
//                   <option key={platform} value={platform}>{platform}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </section>

//         {/* Results Count */}
//         <div className="cs-results-count">
//           <p>
//             Showing <strong>{filteredCaseStudies.length}</strong> of {caseStudies.length} case studies
//           </p>
//         </div>

//         {/* Case Studies Grid */}
//         <div className="cs-studies-grid">
//           {filteredCaseStudies.map(study => (
//             <div key={study.id} className="cs-study-card">
//               <div className="cs-card-image">
//                 <img src={study.image} alt={study.title} />
//                 <span className="cs-card-category">
//                   <FaTag className="cs-card-tag-icon" />
//                   {study.category}
//                 </span>
//               </div>
//               <div className="cs-card-content">
//                 <h3 className="cs-study-title">{study.title}</h3>
//                 <p className="cs-study-description">{study.description}</p>
                
//                 <div className="cs-study-meta">
//                   <div className="cs-meta-item">
//                     <FaChartLine className="cs-meta-icon" />
//                     <div className="cs-meta-content">
//                       <span className="cs-meta-label">Results</span>
//                       <span className="cs-meta-value">{study.results}</span>
//                     </div>
//                   </div>
//                   <div className="cs-meta-item">
//                     <FaGlobe className="cs-meta-icon" />
//                     <div className="cs-meta-content">
//                       <span className="cs-meta-label">Platform</span>
//                       <span className="cs-meta-value">{study.platform}</span>
//                     </div>
//                   </div>
//                   <div className="cs-meta-item">
//                     <FaClock className="cs-meta-icon" />
//                     <div className="cs-meta-content">
//                       <span className="cs-meta-label">Duration</span>
//                       <span className="cs-meta-value">{study.duration}</span>
//                     </div>
//                   </div>
//                 </div>
                
//                 <button className="cs-study-btn">
//                   <span>View Case Study</span>
//                   <FaArrowRight className="cs-btn-arrow" />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {filteredCaseStudies.length === 0 && (
//           <div className="cs-no-results">
//             <FaSearch className="cs-no-results-icon" />
//             <h3>No case studies found</h3>
//             <p>Try adjusting your filters or search terms</p>
//           </div>
//         )}

//         {/* CTA Section */}
//         <section className="cs-cta-section">
//           <div className="cs-cta-content">
//             <div className="cs-cta-badge">
//               <FaRocket className="cs-cta-icon" />
//               <span>Start Your Success Story</span>
//             </div>
//             <h2 className="cs-cta-title">Ready to Achieve Similar Results?</h2>
//             <p className="cs-cta-description">
//               Join thousands of brands that have transformed their marketing with our AI-powered platform
//             </p>
//             <div className="cs-cta-actions">
//               <button className="cs-cta-btn cs-cta-primary">
//                 <FaRocket className="cs-btn-icon" />
//                 <span>Start Free Trial</span>
//               </button>
//               <button className="cs-cta-btn cs-cta-secondary">
//                 <FaPlay className="cs-btn-icon" />
//                 <span>Watch Demo</span>
//               </button>
//             </div>
//             <div className="cs-cta-features">
//               <div className="cs-cta-feature">
//                 <FaRegCheckCircle className="cs-feature-check" />
//                 <span>No credit card required</span>
//               </div>
//               <div className="cs-cta-feature">
//                 <FaRegCheckCircle className="cs-feature-check" />
//                 <span>14-day free trial</span>
//               </div>
//               <div className="cs-cta-feature">
//                 <FaRegCheckCircle className="cs-feature-check" />
//                 <span>Cancel anytime</span>
//               </div>
//             </div>
//           </div>
//         </section>
//       </div>

//       <style jsx>{`
//         .cs-container {
//           width: 100%;
//   margin: 0;
//           padding:  1rem;
//           font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
//           color: #2d3748;
//           background: rgb(230, 236, 253);
//         }

//         /* Hero Section */
//         .cs-hero-section {
//           background: linear-gradient(135deg, rgb(74, 0, 224) 0%, rgb(142, 45, 226) 100%);
//           color: white;
//           margin: 0;
//           padding: 5rem 2rem;
//           border-radius: 0 0 24px 24px;
//           margin-bottom: 4rem;
//           text-align: center;
//         }

//         .cs-hero-content {
//           max-width: 800px;
//           margin: 0 auto;
//         }

//         .cs-hero-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.75rem;
//           padding: 0.75rem 1.5rem;
//           background: rgba(255, 255, 255, 0.15);
//           border: 1px solid rgba(255, 255, 255, 0.3);
//           border-radius: 50px;
//           font-size: 0.875rem;
//           font-weight: 600;
//           margin-bottom: 2rem;
//           backdrop-filter: blur(10px);
//         }

//         .cs-badge-icon {
//           width: 1rem;
//           height: 1rem;
//         }

//         .cs-hero-title {
//           font-size: 3.5rem;
//           font-weight: 800;
//           margin-bottom: 1.5rem;
//           line-height: 1.1;
//         }

//         .cs-hero-description {
//           font-size: 1.25rem;
//           opacity: 0.9;
//           margin-bottom: 3rem;
//           line-height: 1.6;
//         }

//         .cs-stats-overview {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//           gap: 2rem;
//           max-width: 600px;
//           margin: 0 auto;
//         }

//         .cs-stat-item {
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//           padding: 1.5rem;
//           background: rgba(255, 255, 255, 0.1);
//           border-radius: 16px;
//           backdrop-filter: blur(10px);
//         }

//         .cs-stat-icon {
//           width: 2.5rem;
//           height: 2.5rem;
//           color: rgba(255, 255, 255, 0.9);
//         }

//         .cs-stat-content {
//           display: flex;
//           flex-direction: column;
//           text-align: left;
//         }

//         .cs-stat-number {
//           font-size: 2rem;
//           font-weight: 700;
//           margin-bottom: 0.25rem;
//         }

//         .cs-stat-label {
//           font-size: 0.875rem;
//           opacity: 0.9;
//         }

//         /* Content Wrapper */
//         .cs-content-wrapper {
//           padding: 0 1rem;
//         }

//         /* Section Header */
//         .cs-section-header {
//           text-align: center;
//           margin-bottom: 3rem;
//         }

//         .cs-section-title {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 0.75rem;
//           font-size: 2.25rem;
//           font-weight: 700;
//           color: #2d3748;
//           margin-bottom: 1rem;
//         }

//         .cs-title-icon {
//           width: 1.5rem;
//           height: 1.5rem;
//           color: rgb(74, 0, 224);
//         }

//         .cs-section-description {
//           font-size: 1.125rem;
//           color: #718096;
//           max-width: 600px;
//           margin: 0 auto;
//           line-height: 1.6;
//         }

//         /* Featured Section */
//         .cs-featured-section {
//           margin-bottom: 5rem;
//         }

//         .cs-featured-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
//           gap: 2.5rem;
//         }

//         .cs-featured-card {
//           background: white;
//           border-radius: 20px;
//           overflow: hidden;
//           box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
//           transition: all 0.3s ease;
//         }

//         .cs-featured-card:hover {
//           transform: translateY(-8px);
//           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
//         }

//         .cs-featured-image {
//           position: relative;
//           height: 280px;
//           overflow: hidden;
//         }

//         .cs-featured-image img {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//           transition: transform 0.5s ease;
//         }

//         .cs-featured-card:hover .cs-featured-image img {
//           transform: scale(1.05);
//         }

//         .cs-category-tag {
//           position: absolute;
//           top: 1.25rem;
//           left: 1.25rem;
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           background: rgba(74, 0, 224, 0.9);
//           color: white;
//           padding: 0.5rem 1rem;
//           border-radius: 20px;
//           font-size: 0.8rem;
//           font-weight: 600;
//           backdrop-filter: blur(10px);
//         }

//         .cs-tag-icon {
//           width: 0.75rem;
//           height: 0.75rem;
//         }

//         .cs-featured-content {
//           padding: 2.5rem;
//         }

//         .cs-featured-title {
//           font-size: 1.5rem;
//           font-weight: 700;
//           color: #2d3748;
//           margin-bottom: 1rem;
//           line-height: 1.3;
//         }

//         .cs-featured-description {
//           color: #718096;
//           line-height: 1.6;
//           margin-bottom: 1.5rem;
//         }

//         .cs-results-info {
//           display: flex;
//           gap: 1rem;
//           margin-bottom: 2rem;
//         }

//         .cs-result-badge,
//         .cs-platform-badge {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.75rem 1rem;
//           border-radius: 12px;
//           font-size: 0.8rem;
//           font-weight: 600;
//         }

//         .cs-result-badge {
//           background: #e7f6e9;
//           color: #2e7d32;
//         }

//         .cs-platform-badge {
//           background: #e3f2fd;
//           color: #1565c0;
//         }

//         .cs-result-icon,
//         .cs-platform-icon {
//           width: 0.875rem;
//           height: 0.875rem;
//         }

//         .cs-read-more-btn {
//           display: flex;
//           align-items: center;
//           gap: 0.75rem;
//           background: transparent;
//           color: rgb(74, 0, 224);
//           border: 1px solid rgb(74, 0, 224);
//           padding: 0.875rem 1.5rem;
//           border-radius: 8px;
//           font-weight: 600;
//           cursor: pointer;
//           transition: all 0.3s ease;
//         }

//         .cs-read-more-btn:hover {
//           background: rgb(74, 0, 224);
//           color: white;
//         }

//         .cs-arrow-icon {
//           width: 1rem;
//           height: 1rem;
//           transition: transform 0.3s ease;
//         }

//         .cs-read-more-btn:hover .cs-arrow-icon {
//           transform: translateX(4px);
//         }

//         /* Filters Section */
//         .cs-filters-section {
//           margin-bottom: 3rem;
//         }

//         .cs-filters-container {
//           display: flex;
//           gap: 1.5rem;
//           align-items: end;
//           flex-wrap: wrap;
//           background: #f8fafc;
//           padding: 2rem;
//           border-radius: 16px;
//           border: 1px solid #e2e8f0;
//         }

//         .cs-search-box {
//           position: relative;
//           flex: 1;
//           min-width: 280px;
//         }

//         .cs-search-icon {
//           position: absolute;
//           left: 1rem;
//           top: 50%;
//           transform: translateY(-50%);
//           color: #a0aec0;
//           width: 1.25rem;
//           height: 1.25rem;
//         }

//         .cs-search-input {
//           width: 100%;
//           padding: 0.875rem 1rem 0.875rem 3rem;
//           border: 1px solid #e2e8f0;
//           border-radius: 10px;
//           font-size: 1rem;
//           background: white;
//           transition: border-color 0.3s ease;
//         }

//         .cs-search-input:focus {
//           outline: none;
//           border-color: rgb(74, 0, 224);
//         }

//         .cs-filter-group {
//           display: flex;
//           flex-direction: column;
//           min-width: 200px;
//         }

//         .cs-filter-label {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           font-size: 0.875rem;
//           margin-bottom: 0.5rem;
//           color: #4a5568;
//           font-weight: 600;
//         }

//         .cs-filter-icon {
//           width: 0.875rem;
//           height: 0.875rem;
//           color: #718096;
//         }

//         .cs-filter-select {
//           padding: 0.875rem;
//           border: 1px solid #e2e8f0;
//           border-radius: 10px;
//           font-size: 0.9rem;
//           background: white;
//           cursor: pointer;
//         }

//         /* Results Count */
//         .cs-results-count {
//           margin-bottom: 2rem;
//           text-align: center;
//         }

//         .cs-results-count p {
//           color: #718096;
//           font-size: 1rem;
//         }

//         /* Studies Grid */
//         .cs-studies-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
//           gap: 2rem;
//           margin-bottom: 5rem;
//         }

//         .cs-study-card {
//           background: white;
//           border-radius: 16px;
//           overflow: hidden;
//           box-shadow: 0 5px 20px rgba(0, 0, 0, 0.06);
//           transition: all 0.3s ease;
//           border: 1px solid #f1f5f9;
//         }

//         .cs-study-card:hover {
//           transform: translateY(-5px);
//           box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
//           border-color: #e2e8f0;
//         }

//         .cs-card-image {
//           position: relative;
//           height: 220px;
//           overflow: hidden;
//         }

//         .cs-card-image img {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//           transition: transform 0.5s ease;
//         }

//         .cs-study-card:hover .cs-card-image img {
//           transform: scale(1.05);
//         }

//         .cs-card-category {
//           position: absolute;
//           top: 1rem;
//           left: 1rem;
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           background: rgba(74, 0, 224, 0.9);
//           color: white;
//           padding: 0.4rem 0.8rem;
//           border-radius: 15px;
//           font-size: 0.75rem;
//           font-weight: 600;
//         }

//         .cs-card-tag-icon {
//           width: 0.7rem;
//           height: 0.7rem;
//         }

//         .cs-card-content {
//           padding: 2rem;
//         }

//         .cs-study-title {
//           font-size: 1.25rem;
//           font-weight: 700;
//           color: #2d3748;
//           margin-bottom: 1rem;
//           line-height: 1.4;
//         }

//         .cs-study-description {
//           color: #718096;
//           line-height: 1.5;
//           margin-bottom: 1.5rem;
//           font-size: 0.95rem;
//         }

//         .cs-study-meta {
//           display: flex;
//           flex-direction: column;
//           gap: 1rem;
//           margin-bottom: 2rem;
//         }

//         .cs-meta-item {
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//         }

//         .cs-meta-icon {
//           width: 1.25rem;
//           height: 1.25rem;
//           color: rgb(74, 0, 224);
//           flex-shrink: 0;
//         }

//         .cs-meta-content {
//           display: flex;
//           flex-direction: column;
//         }

//         .cs-meta-label {
//           color: #a0aec0;
//           font-size: 0.8rem;
//           font-weight: 500;
//           text-transform: uppercase;
//           letter-spacing: 0.05em;
//         }

//         .cs-meta-value {
//           color: #4a5568;
//           font-size: 0.9rem;
//           font-weight: 600;
//         }

//         .cs-study-btn {
//           width: 100%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 0.75rem;
//           background: rgb(74, 0, 224);
//           color: white;
//           border: none;
//           padding: 0.875rem;
//           border-radius: 8px;
//           font-weight: 600;
//           cursor: pointer;
//           transition: background 0.3s ease;
//         }

//         .cs-study-btn:hover {
//           background: rgb(58, 0, 176);
//         }

//         .cs-btn-arrow {
//           width: 1rem;
//           height: 1rem;
//           transition: transform 0.3s ease;
//         }

//         .cs-study-btn:hover .cs-btn-arrow {
//           transform: translateX(4px);
//         }

//         /* No Results */
//         .cs-no-results {
//           text-align: center;
//           padding: 4rem 2rem;
//           background: #f8fafc;
//           border-radius: 16px;
//           margin-bottom: 3rem;
//         }

//         .cs-no-results-icon {
//           width: 3rem;
//           height: 3rem;
//           color: #cbd5e0;
//           margin-bottom: 1.5rem;
//         }

//         .cs-no-results h3 {
//           margin-bottom: 1rem;
//           color: #4a5568;
//         }

//         .cs-no-results p {
//           color: #718096;
//         }

//         /* CTA Section */
//         .cs-cta-section {
//           background: linear-gradient(135deg, rgb(74, 0, 224) 0%, rgb(142, 45, 226) 100%);
//           padding: 5rem 3rem;
//           border-radius: 24px;
//           color: white;
//           text-align: center;
//           margin-bottom: 3rem;
//         }

//         .cs-cta-content {
//           max-width: 600px;
//           margin: 0 auto;
//         }

//         .cs-cta-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.75rem;
//           padding: 0.75rem 1.5rem;
//           background: rgba(255, 255, 255, 0.15);
//           border: 1px solid rgba(255, 255, 255, 0.3);
//           border-radius: 50px;
//           font-size: 0.875rem;
//           font-weight: 600;
//           margin-bottom: 2rem;
//           backdrop-filter: blur(10px);
//         }

//         .cs-cta-icon {
//           width: 1rem;
//           height: 1rem;
//         }

//         .cs-cta-title {
//           font-size: 2.5rem;
//           font-weight: 700;
//           margin-bottom: 1.5rem;
//           line-height: 1.2;
//         }

//         .cs-cta-description {
//           font-size: 1.125rem;
//           opacity: 0.9;
//           margin-bottom: 2.5rem;
//           line-height: 1.6;
//         }

//         .cs-cta-actions {
//           display: flex;
//           gap: 1rem;
//           justify-content: center;
//           flex-wrap: wrap;
//           margin-bottom: 2.5rem;
//         }

//         .cs-cta-btn {
//           display: flex;
//           align-items: center;
//           gap: 0.75rem;
//           padding: 1rem 2rem;
//           border-radius: 12px;
//           font-weight: 600;
//           cursor: pointer;
//           transition: all 0.3s ease;
//           border: none;
//           font-size: 1rem;
//         }

//         .cs-cta-primary {
//           background: white;
//           color: rgb(74, 0, 224);
//         }

//         .cs-cta-primary:hover {
//           background: #f7fafc;
//           transform: translateY(-2px);
//         }

//         .cs-cta-secondary {
//           background: transparent;
//           color: white;
//           border: 2px solid rgba(255, 255, 255, 0.5);
//         }

//         .cs-cta-secondary:hover {
//           background: rgba(255, 255, 255, 0.1);
//           transform: translateY(-2px);
//         }

//         .cs-btn-icon {
//           width: 1rem;
//           height: 1rem;
//         }

//         .cs-cta-features {
//           display: flex;
//           gap: 2rem;
//           justify-content: center;
//           flex-wrap: wrap;
//         }

//         .cs-cta-feature {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           font-size: 0.875rem;
//           opacity: 0.9;
//         }

//         .cs-feature-check {
//           width: 1rem;
//           height: 1rem;
//           color: #48bb78;
//         }

//         /* Responsive Design */
//         @media (max-width: 1024px) {
//           .cs-featured-grid {
//             grid-template-columns: 1fr;
//           }
          
//           .cs-studies-grid {
//             grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
//           }
//         }

//         @media (max-width: 768px) {
//           .cs-hero-section {
//             padding: 3rem 1rem;
//           }
          
//           .cs-hero-title {
//             font-size: 2.5rem;
//           }
          
//           .cs-hero-description {
//             font-size: 1.125rem;
//           }
          
//           .cs-stats-overview {
//             grid-template-columns: 1fr;
//             gap: 1rem;
//           }
          
//           .cs-stat-item {
//             padding: 1.25rem;
//           }
          
//           .cs-filters-container {
//             flex-direction: column;
//             align-items: stretch;
//           }
          
//           .cs-search-box {
//             min-width: auto;
//           }
          
//           .cs-studies-grid {
//             grid-template-columns: 1fr;
//           }
          
//           .cs-cta-actions {
//             flex-direction: column;
//             align-items: center;
//           }
          
//           .cs-cta-btn {
//             width: 100%;
//             max-width: 280px;
//             justify-content: center;
//           }
          
//           .cs-cta-features {
//             flex-direction: column;
//             gap: 1rem;
//           }
//         }

//         @media (max-width: 640px) {
//           .cs-hero-title {
//             font-size: 2rem;
//           }
          
//           .cs-section-title {
//             font-size: 1.75rem;
//           }
          
//           .cs-featured-grid {
//             grid-template-columns: 1fr;
//           }
          
//           .cs-featured-content {
//             padding: 2rem;
//           }
          
//           .cs-cta-section {
//             padding: 3rem 1.5rem;
//           }
          
//           .cs-cta-title {
//             font-size: 2rem;
//           }
//         }

//         @media (max-width: 480px) {
//           .cs-hero-title {
//             font-size: 1.75rem;
//           }
          
//           .cs-stat-number {
//             font-size: 1.5rem;
//           }
          
//           .cs-section-title {
//             font-size: 1.5rem;
//           }
          
//           .cs-featured-card {
//             margin: 0 -0.5rem;
//           }
          
//           .cs-cta-title {
//             font-size: 1.75rem;
//           }
//         }
//       `}</style>
//     </div>
//     </>
//   );
// }


import React, { useState, useEffect } from "react";
import { 
  FaSearch, 
  FaFilter, 
  FaRocket,
  FaStar,
  FaArrowRight,
  FaTag,
  FaGlobe,
  FaClock,
  FaTrophy,
  FaRegCheckCircle,
  FaCheck,
  FaLightbulb
} from "react-icons/fa";
import { FiTrendingUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const caseStudies = [
  { 
    id: 1,
    title: "Boosting Fashion Brand Awareness", 
    description: "How a fashion brand increased engagement by 150% using AI-driven influencer campaigns.",
    category: "Fashion",
    results: "150% engagement increase",
    duration: "3 months",
    platform: "Instagram",
    image: "https://images.unsplash.com/photo-1566206091558-7f218b696731?w=800&h=500&fit=crop",
    featured: true
  },
  { 
    id: 2,
    title: "Travel Campaign Success", 
    description: "Leveraging travel influencers to drive bookings and social media engagement.",
    category: "Travel",
    results: "40% booking increase",
    duration: "2 months",
    platform: "Multiple",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=500&fit=crop"
  },
  { 
    id: 3,
    title: "Fitness Brand Growth", 
    description: "Increasing fitness product sales with targeted influencer collaborations.",
    category: "Fitness",
    results: "75% sales uplift",
    duration: "4 months",
    platform: "YouTube",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=500&fit=crop"
  },
  { 
    id: 4,
    title: "Tech Product Launch", 
    description: "Successful launch of a new gadget using micro-influencers on YouTube.",
    category: "Technology",
    results: "200K+ views",
    duration: "1 month",
    platform: "YouTube",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=500&fit=crop",
    featured: true
  },
  { 
    id: 5,
    title: "Food Delivery Campaign", 
    description: "Promoting a local food delivery service with Instagram influencers.",
    category: "Food",
    results: "300% ROI",
    duration: "6 weeks",
    platform: "Instagram",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop"
  },
  { 
    id: 6,
    title: "Music Festival Engagement", 
    description: "Driving ticket sales and engagement with music influencers.",
    category: "Entertainment",
    results: "92% ticket sales",
    duration: "2 months",
    platform: "TikTok",
    image: "https://images.unsplash.com/photo-1501281667305-0d4eb539d4a6?w=800&h=500&fit=crop"
  },
  { 
    id: 7,
    title: "Education Platform Reach", 
    description: "Growing an online learning platform with niche education influencers.",
    category: "Education",
    results: "60% user growth",
    duration: "5 months",
    platform: "LinkedIn",
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=500&fit=crop"
  },
  { 
    id: 8,
    title: "Gaming Launch Campaign", 
    description: "Using Twitch influencers to boost a new game release.",
    category: "Gaming",
    results: "1M+ downloads",
    duration: "1 month",
    platform: "Twitch",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=500&fit=crop",
    featured: true
  },
  { 
    id: 9,
    title: "Beauty Product Success", 
    description: "Viral campaign for skincare line using TikTok creators.",
    category: "Beauty",
    results: "500% sales boost",
    duration: "2 months",
    platform: "TikTok",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=500&fit=crop"
  },
  { 
    id: 10,
    title: "SaaS Platform Growth", 
    description: "B2B SaaS company scaling with LinkedIn influencer partnerships.",
    category: "Technology",
    results: "300% lead increase",
    duration: "4 months",
    platform: "LinkedIn",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop"
  },
  { 
    id: 11,
    title: "Sustainable Brand Launch", 
    description: "Eco-friendly brand gaining traction with conscious creators.",
    category: "Lifestyle",
    results: "80% brand awareness",
    duration: "3 months",
    platform: "Instagram",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=500&fit=crop"
  },
  { 
    id: 12,
    title: "Pet Products Campaign", 
    description: "Pet brand achieving viral success with pet influencer collabs.",
    category: "Pets",
    results: "400K+ engagement",
    duration: "2 months",
    platform: "Instagram",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=500&fit=crop"
  },
  { 
    id: 13,
    title: "Luxury Watch Launch", 
    description: "High-end watch brand collaboration with lifestyle influencers.",
    category: "Fashion",
    results: "$2M+ in sales",
    duration: "2 months",
    platform: "Instagram",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=500&fit=crop",
    featured: true
  },
  { 
    id: 14,
    title: "Hotel Chain Promotion", 
    description: "Global hotel chain boosting bookings through travel influencers.",
    category: "Travel",
    results: "65% booking increase",
    duration: "3 months",
    platform: "YouTube",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop"
  },
  { 
    id: 15,
    title: "Supplement Brand Growth", 
    description: "Health supplements gaining credibility with fitness experts.",
    category: "Fitness",
    results: "120% revenue growth",
    duration: "5 months",
    platform: "YouTube",
    image: "https://images.unsplash.com/photo-1594736797933-d0d64d1fe48e?w=800&h=500&fit=crop"
  },
  { 
    id: 16,
    title: "Smart Home Device Launch", 
    description: "Tech startup gaining market share with tech reviewers.",
    category: "Technology",
    results: "50K units sold",
    duration: "2 months",
    platform: "YouTube",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop"
  },
  { 
    id: 17,
    title: "Restaurant Chain Promotion", 
    description: "National restaurant chain increasing foot traffic.",
    category: "Food",
    results: "85% more customers",
    duration: "3 months",
    platform: "TikTok",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop"
  },
  { 
    id: 18,
    title: "Music Streaming Service", 
    description: "Streaming platform gaining users through artist partnerships.",
    category: "Entertainment",
    results: "2M+ new users",
    duration: "4 months",
    platform: "Instagram",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop"
  },
  { 
    id: 19,
    title: "Online Course Platform", 
    description: "Educational platform scaling with teacher influencers.",
    category: "Education",
    results: "300% course enrollments",
    duration: "6 months",
    platform: "YouTube",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop"
  },
  { 
    id: 20,
    title: "Mobile Game Launch", 
    description: "New mobile game going viral through gaming creators.",
    category: "Gaming",
    results: "5M+ downloads",
    duration: "1 month",
    platform: "Twitch",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=500&fit=crop"
  },
  { 
    id: 21,
    title: "Skincare Line Expansion", 
    description: "Beauty brand expanding reach with dermatologist influencers.",
    category: "Beauty",
    results: "400% sales increase",
    duration: "3 months",
    platform: "Instagram",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=500&fit=crop"
  },
  { 
    id: 22,
    title: "Home Decor Brand", 
    description: "Interior design brand growing through home decor influencers.",
    category: "Lifestyle",
    results: "250% website traffic",
    duration: "4 months",
    platform: "Pinterest",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=500&fit=crop"
  },
  { 
    id: 23,
    title: "Pet Food Launch", 
    description: "Premium pet food brand gaining pet parent advocates.",
    category: "Pets",
    results: "180% sales growth",
    duration: "3 months",
    platform: "Instagram",
    image: "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=800&h=500&fit=crop"
  },
  { 
    id: 24,
    title: "Athletic Apparel Campaign", 
    description: "Sportswear brand boosting sales with athlete influencers.",
    category: "Fitness",
    results: "$5M in revenue",
    duration: "3 months",
    platform: "Instagram",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop"
  },
  { 
    id: 25,
    title: "Travel App Promotion", 
    description: "Travel planning app gaining users through travel bloggers.",
    category: "Travel",
    results: "1M+ app downloads",
    duration: "4 months",
    platform: "Multiple",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop"
  },
  { 
    id: 26,
    title: "Finance App Awareness", 
    description: "Financial tech app building trust with finance experts.",
    category: "Technology",
    results: "500K+ signups",
    duration: "5 months",
    platform: "LinkedIn",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=500&fit=crop"
  },
  { 
    id: 27,
    title: "Wine Brand Launch", 
    description: "Premium wine brand creating buzz with food & wine influencers.",
    category: "Food",
    results: "300% distribution growth",
    duration: "3 months",
    platform: "Instagram",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=500&fit=crop"
  }
];

const categories = ["All Trends", "Fashion", "Travel", "Fitness", "Technology", "Food", "Entertainment", "Education", "Gaming", "Beauty", "Lifestyle", "Pets"];
const platforms = ["All Platforms", "Instagram", "YouTube", "TikTok", "Twitch", "LinkedIn", "Pinterest", "Multiple"];

export default function CaseStudies() {
  const [selectedCategory, setSelectedCategory] = useState("All Trends");
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSticky, setIsSticky] = useState(true);

  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

  // Handle scroll for sticky sidebar
  useEffect(() => {
    const handleScroll = () => {
      // Keep sidebar sticky at all times
      setIsSticky(true);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredCaseStudies = caseStudies.filter(study => {
    const matchesCategory = selectedCategory === "All Trends" || study.category === selectedCategory;
    const matchesPlatform = selectedPlatform === "All Platforms" || study.platform === selectedPlatform;
    const matchesSearch = study.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         study.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         study.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPlatform && matchesSearch;
  });

  const featuredStudies = caseStudies.filter(study => study.featured);

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflowX: 'hidden'
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}></div>
        
        <h1 style={{
          fontSize: '42px',
          fontWeight: '700',
          color: '#ffffff',
          margin: '0 0 16px',
          letterSpacing: '-0.5px',
          position: 'relative'
        }}>
          Success Stories & Case Studies
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.95)',
          margin: '0 0 40px',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: '1.6',
          position: 'relative'
        }}>
          Real-world examples of brands achieving remarkable results with AI-powered influencer marketing
        </p>

        {/* Search Bar */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          <input
            type="text"
            placeholder="Search case studies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 60px 16px 24px',
              fontSize: '15px',
              border: 'none',
              borderRadius: '50px',
              outline: 'none',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
              boxSizing: 'border-box',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = '0 6px 40px rgba(0, 0, 0, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.15)';
            }}
          />
          <button style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '44px',
            height: '44px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-50%) scale(1.05)';
            e.target.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(-50%) scale(1)';
            e.target.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.3)';
          }}
          >
            <FaSearch size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '60px 20px',
        boxSizing: 'border-box',
        width: '100%',
        position: 'relative'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: '40px',
          alignItems: 'flex-start'
        }}>
          {/* Left Column - Main Content */}
          <div style={{ 
            width: '100%',
            position: 'relative'
          }}>
            {/* Featured Case Studies */}
            <div style={{ marginBottom: '80px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '32px'
              }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaStar size={20} color="#ffffff" />
                  </div>
                  Featured Success Stories
                </h2>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiTrendingUp size={16} />
                  <span>Most impactful campaigns</span>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '30px'
              }}>
                {featuredStudies.map((study) => (
                  <div
                    key={study.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      width: '100%',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.12)';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={study.image}
                        alt={study.title}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          transition: 'transform 0.6s ease'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0))',
                        pointerEvents: 'none'
                      }}></div>
                      <span style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        background: 'rgba(59, 130, 246, 0.95)',
                        color: '#ffffff',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        <FaTag size={12} />
                        {study.category}
                      </span>
                    </div>

                    <div style={{ padding: '28px' }}>
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#111827',
                        margin: '0 0 16px',
                        lineHeight: '1.4'
                      }}>
                        {study.title}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        lineHeight: '1.6',
                        margin: '0 0 24px'
                      }}>
                        {study.description}
                      </p>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '20px',
                        borderTop: '1px solid #f3f4f6'
                      }}>
                        <div>
                          <div style={{
                            fontSize: '13px',
                            color: '#6b7280',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <div style={{
                              background: '#DCFCE7',
                              width: '28px',
                              height: '28px',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <FiTrendingUp size={14} color="#16A34A" />
                            </div>
                            <span style={{ fontWeight: '600' }}>{study.results}</span>
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#9ca3af',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FaGlobe size={12} />
                              {study.platform}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FaClock size={12} />
                              {study.duration}
                            </span>
                          </div>
                        </div>
                        <button onClick={goToLogin} style={{
                          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '10px 24px',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 15px rgba(37, 99, 235, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateX(4px)';
                          e.target.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateX(0)';
                          e.target.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.2)';
                        }}
                        >
                          View Study
                          <FaArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter Tabs */}
            <div style={{
              background: '#f8fafc',
              padding: '24px',
              borderRadius: '16px',
              marginBottom: '32px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  background: '#3B82F6',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaFilter size={18} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 4px'
                  }}>
                    Filter Case Studies
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    Narrow down by category or platform
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '20px'
              }}>
                {categories.slice(0, 6).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '10px 20px',
                      background: selectedCategory === cat ? '#3B82F6' : '#ffffff',
                      color: selectedCategory === cat ? '#ffffff' : '#4b5563',
                      border: `1px solid ${selectedCategory === cat ? '#3B82F6' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: selectedCategory === cat ? '0 4px 12px rgba(59, 130, 246, 0.2)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCategory !== cat) {
                        e.target.style.background = '#f9fafb';
                        e.target.style.borderColor = '#d1d5db';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategory !== cat) {
                        e.target.style.background = '#ffffff';
                        e.target.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    <FaTag size={14} />
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                {platforms.slice(0, 5).map((platform) => (
                  <button
                    key={platform}
                    onClick={() => setSelectedPlatform(platform)}
                    style={{
                      padding: '10px 20px',
                      background: selectedPlatform === platform ? '#10B981' : '#ffffff',
                      color: selectedPlatform === platform ? '#ffffff' : '#4b5563',
                      border: `1px solid ${selectedPlatform === platform ? '#10B981' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: selectedPlatform === platform ? '0 4px 12px rgba(16, 185, 129, 0.2)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedPlatform !== platform) {
                        e.target.style.background = '#f9fafb';
                        e.target.style.borderColor = '#d1d5db';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedPlatform !== platform) {
                        e.target.style.background = '#ffffff';
                        e.target.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    <FaGlobe size={14} />
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div style={{
              background: '#EFF6FF',
              padding: '16px 24px',
              borderRadius: '12px',
              marginBottom: '32px',
              borderLeft: '4px solid #3B82F6'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  fontSize: '15px',
                  color: '#1f2937',
                  fontWeight: '500'
                }}>
                  Showing <strong style={{ color: '#3B82F6' }}>{filteredCaseStudies.length}</strong> of {caseStudies.length} case studies
                  {selectedCategory !== 'All Trends' && ` in ${selectedCategory}`}
                  {selectedPlatform !== 'All Platforms' && ` on ${selectedPlatform}`}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaCheck size={14} />
                  <span>Updated daily</span>
                </div>
              </div>
            </div>

            {/* All Case Studies Grid */}
            <h2 style={{
              fontSize: '28px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 32px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaLightbulb size={20} color="#ffffff" />
              </div>
              All Case Studies
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '28px',
              width: '100%'
            }}>
              {filteredCaseStudies.map((study) => (
                <div
                  key={study.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    width: '100%',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={study.image}
                      alt={study.title}
                      style={{
                        width: '100%',
                        height: '180px',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(59, 130, 246, 0.95)',
                      color: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backdropFilter: 'blur(4px)'
                    }}>
                      <FaTag size={10} />
                      {study.category}
                    </span>
                  </div>

                  <div style={{ padding: '20px' }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 12px',
                      lineHeight: '1.4'
                    }}>
                      {study.title}
                    </h3>
                    <p style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      lineHeight: '1.5',
                      margin: '0 0 20px'
                    }}>
                      {study.description}
                    </p>

                    <div style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        background: '#DCFCE7',
                        padding: '6px',
                        borderRadius: '6px'
                      }}>
                        <FiTrendingUp size={14} color="#16A34A" />
                      </div>
                      <span>{study.results}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '16px',
                      borderTop: '1px solid #f3f4f6'
                    }}>
                      <div style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaGlobe size={10} />
                          {study.platform}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaClock size={10} />
                          {study.duration}
                        </span>
                      </div>
                      <button onClick={goToLogin} style={{
                        background: 'transparent',
                        color: '#3B82F6',
                        border: '1px solid #DBEAFE',
                        padding: '6px 16px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#3B82F6';
                        e.target.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#3B82F6';
                      }}
                      >
                        Read
                        <FaArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results State */}
            {filteredCaseStudies.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '80px 40px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '20px',
                marginTop: '40px',
                border: '1px dashed #cbd5e0'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <FaSearch size={32} color="#ffffff" />
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '12px'
                }}>
                  No case studies found
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  maxWidth: '400px',
                  margin: '0 auto 32px',
                  lineHeight: '1.6'
                }}>
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All Trends');
                    setSelectedPlatform('All Platforms');
                    setSearchQuery('');
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 32px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.2)';
                  }}
                >
                  <FaFilter size={16} />
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar - STICKY */}
          <div style={{
            width: '320px',
            maxWidth: '100%',
            position: 'sticky',
            top: '20px',
            alignSelf: 'flex-start',
            height: 'fit-content',
            zIndex: 10,
            transition: 'all 0.3s ease-out'
          }}>
            {/* About Card */}
            <div style={{
              background: '#ffffff',
              padding: '28px',
              borderRadius: '20px',
              marginBottom: '24px',
              width: '100%',
              boxSizing: 'border-box',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.08)';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.04)';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaTrophy size={20} color="#ffffff" />
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  Success Insights
                </h3>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.6',
                margin: '0 0 20px'
              }}>
                Discover how leading brands leverage AI-powered influencer marketing to achieve exceptional results and measurable ROI.
              </p>
            </div>

            {/* Stats Card */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              padding: '28px',
              borderRadius: '20px',
              marginBottom: '24px',
              width: '100%',
              boxSizing: 'border-box',
              border: '1px solid #e2e8f0',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(96, 165, 250, 0.05) 100%)',
                borderRadius: '50%'
              }}></div>
              
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 24px',
                position: 'relative'
              }}>
                Campaign Performance
              </h3>
              
              <div style={{ marginBottom: '20px', position: 'relative' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontSize: '14px',
                    color: '#4b5563'
                  }}>
                    Average ROI
                  </span>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#10B981'
                  }}>
                    85%
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  background: '#E5E7EB',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '85%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
                    borderRadius: '4px',
                    transition: 'width 1s ease'
                  }}></div>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontSize: '14px',
                    color: '#4b5563'
                  }}>
                    Success Rate
                  </span>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#3B82F6'
                  }}>
                    92%
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  background: '#E5E7EB',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '92%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
              
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontSize: '14px',
                    color: '#4b5563'
                  }}>
                    Client Satisfaction
                  </span>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#F59E0B'
                  }}>
                    96%
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  background: '#E5E7EB',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '96%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
            </div>

            {/* Top Industries Card */}
            <div style={{
              background: '#ffffff',
              padding: '28px',
              borderRadius: '20px',
              marginBottom: '24px',
              width: '100%',
              boxSizing: 'border-box',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  Top Industries
                </h3>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  background: '#f3f4f6',
                  padding: '4px 10px',
                  borderRadius: '12px'
                }}>
                  Active
                </div>
              </div>
              
              {['Fashion', 'Technology', 'Fitness', 'Beauty', 'Travel'].map((industry, index) => (
                <div
                  key={industry}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 0',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.paddingLeft = '8px';
                    e.currentTarget.style.background = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.paddingLeft = '0';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: `linear-gradient(135deg, ${['#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B'][index]} 0%, ${['#60A5FA', '#34D399', '#A78BFA', '#F472B6', '#FBBF24'][index]} 100%)`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaTag size={14} color="#ffffff" />
                    </div>
                    <span style={{
                      fontSize: '14px',
                      color: '#4b5563',
                      fontWeight: '500'
                    }}>
                      {industry}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#3B82F6',
                    background: '#EFF6FF',
                    padding: '4px 12px',
                    borderRadius: '12px'
                  }}>
                    {caseStudies.filter(s => s.category === industry).length}
                  </span>
                </div>
              ))}
            </div>

            {/* Newsletter CTA Card */}
            <div style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #3B82F6 100%)',
              padding: '32px',
              borderRadius: '20px',
              textAlign: 'center',
              width: '100%',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(37, 99, 235, 0.3)'
            }}>
              <div style={{
                position: 'absolute',
                top: '-30px',
                right: '-30px',
                width: '80px',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%'
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '-40px',
                left: '-40px',
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '50%'
              }}></div>
              
              <div style={{
                width: '60px',
                height: '60px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                backdropFilter: 'blur(4px)'
              }}>
                <FaRocket size={24} color="#ffffff" />
              </div>
              
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#ffffff',
                margin: '0 0 12px'
              }}>
                Get Success Insights
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.9)',
                margin: '0 0 24px',
                lineHeight: '1.5'
              }}>
                Receive weekly case studies and expert marketing insights directly to your inbox.
              </p>
              <button style={{
                width: '100%',
                padding: '14px',
                background: '#ffffff',
                color: '#1e40af',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 4px 20px rgba(255, 255, 255, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 8px 30px rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.2)';
              }}
              >
                <FaRegCheckCircle size={16} />
                Subscribe Now
              </button>
              
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
                marginTop: '16px'
              }}>
                No spam. Unsubscribe anytime.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}