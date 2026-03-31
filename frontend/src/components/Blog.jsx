// import React, { useState } from "react";
// import "../style/Blog.css";
// import HomeTopBar from "../pages/HomePage/HomeTopBar";

// // Generate more realistic blog posts
// const generatePosts = () => {
//   const categories = ["AI Trends", "Marketing Strategies", "Case Studies", "Industry News", "How-To Guides"];
//   const authors = [
//     { name: "Sarah Johnson", role: "AI Marketing Specialist" },
//     { name: "Michael Chen", role: "Data Scientist" },
//     { name: "Emma Williams", role: "Influencer Strategist" },
//     { name: "David Rodriguez", role: "Content Director" },
//     { name: "Priya Patel", role: "Growth Marketer" }
//   ];
  
//   return Array.from({ length: 12 }, (_, i) => {
//     const category = categories[i % categories.length];
//     const author = authors[i % authors.length];
//     const readTime = Math.floor(Math.random() * 8) + 3; // 3-10 min read
    
//     return {
//       id: i + 1,
//       title: [
//         "How AI is Revolutionizing Influencer Marketing in 2025",
//         "The Complete Guide to AI-Powered Influencer Discovery",
//         "5 Case Studies: Brands That Nailed AI-Driven Campaigns",
//         "Predictive Analytics: Forecasting Campaign Success Before Launch",
//         "Ethical Considerations in AI-Based Influencer Marketing",
//         "Beyond Metrics: How AI Measures Authentic Engagement",
//         "The Future of Micro-Influencers in an AI-Dominated Landscape",
//         "ROI Calculation: Measuring What Really Matters with AI",
//         "Integrating AI Insights with Traditional Marketing Strategies",
//         "ChatGPT for Influencer Outreach: Best Practices and Pitfalls",
//         "Global Trends: How Different Markets Adopt AI Influencer Tech",
//         "Building Long-Term Influencer Relationships with AI Assistance"
//       ][i],
//       description: [
//         "Discover how machine learning algorithms are transforming how brands identify and collaborate with content creators.",
//         "Learn how to leverage AI tools to find perfect influencer matches based on audience demographics and engagement patterns.",
//         "Real-world examples of companies that achieved remarkable results by implementing AI in their influencer strategies.",
//         "Explore how predictive models can forecast campaign performance with surprising accuracy before any content goes live.",
//         "Important ethical questions to consider when using artificial intelligence to select and manage influencer partnerships.",
//         "Why traditional metrics don't tell the whole story and how AI provides deeper insights into genuine audience connection.",
//         "Why micro-influencers might have the advantage in the age of AI-driven marketing campaigns.",
//         "A framework for calculating return on investment that goes beyond simple engagement rates and includes brand sentiment.",
//         "How to combine AI-generated insights with human creativity for marketing campaigns that truly resonate.",
//         "Practical tips for using AI writing tools in influencer communications without losing authentic voice.",
//         "Comparative analysis of how North American, European, and Asian markets approach AI in influencer marketing.",
//         "Strategies for using AI to maintain and nurture long-term partnerships with influencers beyond one-off campaigns."
//       ][i],
//       excerpt: "Discover how AI is transforming influencer campaigns. Learn tips, strategies, and trends for smarter marketing decisions.",
//       category,
//       author: author.name,
//       authorRole: author.role,
//       date: `2025-${Math.floor(i/4) + 1}-${(i % 4) + 10}`,
//       readTime,
//       image: `https://images.unsplash.com/photo-${155670 + i}-1913-4150b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80`,
//       featured: i < 3, // First 3 posts are featured
//       popular: i % 4 === 0 // Every 4th post is popular
//     };
//   });
// };

// const dummyPosts = generatePosts();

// export default function Blog() {
//   const [activeCategory, setActiveCategory] = useState("All");
//   const [searchQuery, setSearchQuery] = useState("");
  
//   const categories = ["All", "AI Trends", "Marketing Strategies", "Case Studies", "Industry News", "How-To Guides"];
//   const featuredPosts = dummyPosts.filter(post => post.featured);
//   const popularPosts = dummyPosts.filter(post => post.popular && !post.featured).slice(0, 3);
  
//   const filteredPosts = dummyPosts.filter(post => {
//     const matchesCategory = activeCategory === "All" || post.category === activeCategory;
//     const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
//                          post.description.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   return (
//     <>
//       <HomeTopBar />
//       <div className="blog-container">
//         {/* Hero Section */}
//         <header className="blog-header">
//           <div className="blog-hero-content">
//             <h1>InfluenceAI Blog</h1>
//             <p>Expert insights on AI-driven influencer marketing strategies, trends, and best practices</p>
//             <div className="blog-search">
//               <input
//                 type="text"
//                 placeholder="Search articles..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="search-input"
//               />
//               <button className="search-button">Search</button>
//             </div>
//           </div>
//         </header>

//         <div className="blog-content">
//           {/* Main Content */}
//           <main className="blog-main">
//             {/* Featured Posts */}
//             {searchQuery === "" && activeCategory === "All" && (
//               <section className="featured-posts">
//                 <h2>Featured Articles</h2>
//                 <div className="featured-grid">
//                   {featuredPosts.map(post => (
//                     <div key={post.id} className="featured-card">
//                       <div className="featured-image">
//                         <img src={post.image} alt={post.title} />
//                         <span className="category-badge">{post.category}</span>
//                       </div>
//                       <div className="featured-content">
//                         <h3>{post.title}</h3>
//                         <p>{post.description}</p>
//                         <div className="post-meta">
//                           <div className="author-info">
//                             <span className="author-name">{post.author}</span>
//                             <span className="post-date">{post.date} • {post.readTime} min read</span>
//                           </div>
//                           <button className="read-more">Read Article</button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </section>
//             )}

//             {/* Category Filters */}
//             <div className="category-filters">
//               {categories.map(category => (
//                 <button
//                   key={category}
//                   className={`filter-button ${activeCategory === category ? 'active' : ''}`}
//                   onClick={() => setActiveCategory(category)}
//                 >
//                   {category}
//                 </button>
//               ))}
//             </div>

//             {/* Blog Posts Grid */}
//             <section className="blog-posts">
//               <h2>{activeCategory === "All" ? "Latest Articles" : activeCategory}</h2>
//               <div className="blog-grid">
//                 {filteredPosts.map(post => (
//                   <article key={post.id} className="blog-card">
//                     <div className="card-image">
//                       <img src={post.image} alt={post.title} />
//                       <span className="category-tag">{post.category}</span>
//                     </div>
//                     <div className="card-content">
//                       <h3>{post.title}</h3>
//                       <p className="card-excerpt">{post.excerpt}</p>
//                       <div className="card-footer">
//                         <div className="author-details">
//                           <span className="author">{post.author}</span>
//                           <span className="author-role">{post.authorRole}</span>
//                         </div>
//                         <div className="post-details">
//                           <span className="date">{post.date}</span>
//                           <span className="read-time">{post.readTime} min read</span>
//                         </div>
//                       </div>
//                     </div>
//                   </article>
//                 ))}
//               </div>
//             </section>

//             {/* Pagination */}
//             {filteredPosts.length > 0 && (
//               <div className="pagination">
//                 <button className="pagination-button active">1</button>
//                 <button className="pagination-button">2</button>
//                 <button className="pagination-button">3</button>
//                 <span className="pagination-ellipsis">...</span>
//                 <button className="pagination-button">Next</button>
//               </div>
//             )}

//             {filteredPosts.length === 0 && (
//               <div className="no-results">
//                 <h3>No articles found</h3>
//                 <p>Try adjusting your search or filter criteria</p>
//               </div>
//             )}
//           </main>

//           {/* Sidebar */}
//           <aside className="blog-sidebar">
//             {/* About Section */}
//             <div className="sidebar-widget">
//               <h3>About Our Blog</h3>
//               <p>InfluenceAI Blog provides cutting-edge insights on leveraging artificial intelligence for influencer marketing success. Stay ahead with data-driven strategies.</p>
//             </div>

//             {/* Popular Posts */}
//             <div className="sidebar-widget">
//               <h3>Popular Articles</h3>
//               <div className="popular-posts">
//                 {popularPosts.map(post => (
//                   <div key={post.id} className="popular-post">
//                     <img src={post.image} alt={post.title} />
//                     <div className="popular-content">
//                       <h4>{post.title}</h4>
//                       <span className="popular-date">{post.date}</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Categories */}
//             <div className="sidebar-widget">
//               <h3>Categories</h3>
//               <ul className="category-list">
//                 {categories.filter(cat => cat !== "All").map(category => (
//                   <li key={category}>
//                     <button 
//                       className={activeCategory === category ? 'active' : ''}
//                       onClick={() => setActiveCategory(category)}
//                     >
//                       {category}
//                       <span className="post-count">({dummyPosts.filter(post => post.category === category).length})</span>
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* Newsletter */}
//             <div className="sidebar-widget newsletter-widget">
//               <h3>Stay Updated</h3>
//               <p>Get the latest articles delivered to your inbox</p>
//               <form className="newsletter-form">
//                 <input type="email" placeholder="Your email address" />
//                 <button type="submit">Subscribe</button>
//               </form>
//             </div>
//           </aside>
//         </div>
//       </div>
//     </>
//   );
// }


import React, { useState } from 'react';
import { Search, Calendar, Clock, User, ChevronRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Trends');

   const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

  const categories = [
    { name: 'All Trends', count: 21 },
    { name: 'Marketing Strategies', count: 8 },
    { name: 'Case Studies', count: 5 },
    { name: 'Industry News', count: 4 },
    { name: 'How-To Guides', count: 4 }
  ];

  const featuredArticles = [
    {
      id: 1,
      category: 'AI Trends',
      categoryColor: '#3B82F6',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop',
      title: 'How AI is Revolutionizing Influencer Marketing in 2025',
      excerpt: 'Discover how AI-powered influencer campaigns are transforming how brands identify and collaborate with content creators.',
      author: 'Sarah Johnson',
      date: '2025-1-10',
      readTime: '8 min read'
    },
    {
      id: 2,
      category: 'Marketing Strategies',
      categoryColor: '#3B82F6',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop',
      title: 'The Complete Guide to AI-Powered Influencer Discovery',
      excerpt: 'Learn how to leverage AI tools to find perfect influencer matches based on audience demographics and engagement patterns.',
      author: 'Michael Chen',
      date: '2025-1-11',
      readTime: '10 min read'
    },
    {
      id: 3,
      category: 'Case Studies',
      categoryColor: '#3B82F6',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
      title: '5 Case Studies: Brands That Nailed AI-Driven Campaigns',
      excerpt: 'Real-world examples of companies that achieved remarkable results by implementing AI-powered influencer strategies.',
      author: 'Emma Williams',
      date: '2025-1-12',
      readTime: '12 min read'
    },
    {
      id: 4,
      category: 'Case Studies',
      categoryColor: '#3B82F6',
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=500&fit=crop',
      title: '5 Case Studies: Brands That Nailed AI-Driven Campaigns',
      excerpt: 'Real-world examples of companies that achieved remarkable results by implementing AI-powered influencer strategies.',
      author: 'Emma Williams',
      date: '2025-1-12',
      readTime: '12 min read'
    }
  ];

  const latestArticles = [
    {
      id: 5,
      category: 'AI Trends',
      categoryColor: '#3B82F6',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop',
      title: 'How AI is Revolutionizing Influencer Marketing in 2025',
      excerpt: 'Discover how AI is transforming influencer campaigns. Learn tips, strategies, and trends for smarter marketing decisions.',
      author: 'Sarah Johnson',
      date: '2025-1-10',
      readTime: '8 min read',
      specialistTag: 'AI Marketing Specialist'
    },
    {
      id: 6,
      category: 'Marketing Strategies',
      categoryColor: '#3B82F6',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
      title: 'The Complete Guide to AI-Powered Influencer Discovery',
      excerpt: 'Discover how AI is transforming influencer campaigns. Learn tips, strategies, and trends for smarter marketing decisions.',
      author: 'Michael Chen',
      date: '2025-1-11',
      readTime: '10 min read',
      specialistTag: 'Data Scientist'
    },
    {
      id: 7,
      category: 'Marketing Strategies',
      categoryColor: '#3B82F6',
      image: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=600&h=400&fit=crop',
      title: 'Building Long-Term Influencer Relationships with AI Assistance',
      excerpt: 'Discover how AI is transforming influencer campaigns. Learn tips, strategies, and trends for smarter marketing decisions.',
      author: 'David Lee',
      date: '2025-1-12',
      readTime: '9 min read',
      specialistTag: 'Marketing Director'
    },
    {
      id: 8,
      category: 'AI Trends',
      categoryColor: '#3B82F6',
      image: 'https://images.unsplash.com/photo-1485217988980-11786ced9454?w=600&h=400&fit=crop',
      title: 'How AI is Revolutionizing Influencer Marketing in 2025',
      excerpt: 'Discover how AI is transforming influencer campaigns. Learn tips, strategies, and trends for smarter marketing decisions.',
      author: 'Sarah Johnson',
      date: '2025-1-10',
      readTime: '8 min read',
      specialistTag: 'AI Marketing Specialist'
    },
    {
      id: 9,
      category: 'Marketing Strategies',
      categoryColor: '#3B82F6',
      image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600&h=400&fit=crop',
      title: 'The Complete Guide to AI-Powered Influencer Discovery',
      excerpt: 'Discover how AI is transforming influencer campaigns. Learn tips, strategies, and trends for smarter marketing decisions.',
      author: 'Michael Chen',
      date: '2025-1-11',
      readTime: '10 min read',
      specialistTag: 'Data Scientist'
    },
    {
      id: 10,
      category: 'Marketing Strategies',
      categoryColor: '#3B82F6',
      image: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=600&h=400&fit=crop',
      title: 'Building Long-Term Influencer Relationships with AI Assistance',
      excerpt: 'Discover how AI is transforming influencer campaigns. Learn tips, strategies, and trends for smarter marketing decisions.',
      author: 'David Lee',
      date: '2025-1-12',
      readTime: '9 min read',
      specialistTag: 'Marketing Director'
    },
    {
      id: 11,
      category: 'AI Trends',
      categoryColor: '#3B82F6',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop',
      title: 'How AI is Revolutionizing Influencer Marketing in 2025',
      excerpt: 'Discover how AI is transforming influencer campaigns. Learn tips, strategies, and trends for smarter marketing decisions.',
      author: 'Sarah Johnson',
      date: '2025-1-10',
      readTime: '8 min read',
      specialistTag: 'AI Marketing Specialist'
    },
    {
      id: 12,
      category: 'Marketing Strategies',
      categoryColor: '#3B82F6',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
      title: 'The Complete Guide to AI-Powered Influencer Discovery',
      excerpt: 'Discover how AI is transforming influencer campaigns. Learn tips, strategies, and trends for smarter marketing decisions.',
      author: 'Michael Chen',
      date: '2025-1-11',
      readTime: '10 min read',
      specialistTag: 'Data Scientist'
    },
    {
      id: 13,
      category: 'Marketing Strategies',
      categoryColor: '#3B82F6',
      image: 'https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?w=600&h=400&fit=crop',
      title: 'Building Long-Term Influencer Relationships with AI Assistance',
      excerpt: 'Discover how AI is transforming influencer campaigns. Learn tips, strategies, and trends for smarter marketing decisions.',
      author: 'David Lee',
      date: '2025-1-12',
      readTime: '9 min read',
      specialistTag: 'Marketing Director'
    }
  ];

  const popularArticles = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=120&fit=crop',
      title: 'Ethical Considerations in AI-Driven Influencer Marketing',
      date: '2025-1-09'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=200&h=120&fit=crop',
      title: 'Integrating AI Insights with Traditional Marketing',
      date: '2025-1-07'
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '42px',
          fontWeight: '700',
          color: '#ffffff',
          margin: '0 0 16px',
          letterSpacing: '-0.5px'
        }}>
          InfluenceAI Blog
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.95)',
          margin: '0 0 40px',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: '1.6'
        }}>
          Expert insights on AI-driven influencer marketing strategies, trends, and best practices
        </p>

        {/* Search Bar */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 60px 16px 24px',
              fontSize: '15px',
              border: 'none',
              borderRadius: '50px',
              outline: 'none',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              boxSizing: 'border-box'
            }}
          />
          <button style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '44px',
            height: '44px',
            background: '#3B82F6',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '60px 20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 350px',
          gap: '60px',
          alignItems: 'start'
        }}>
          {/* Left Column - Articles */}
          <div>
            {/* Featured Articles Section */}
            <div style={{ marginBottom: '80px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 32px'
              }}>
                Featured Articles
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '24px'
              }}>
                {featuredArticles.map((article) => (
                  <div
                    key={article.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.3s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={article.image}
                        alt={article.title}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover'
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        background: article.categoryColor,
                        color: '#ffffff',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {article.category}
                      </span>
                    </div>

                    <div style={{ padding: '24px' }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0 0 12px',
                        lineHeight: '1.4'
                      }}>
                        {article.title}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        lineHeight: '1.6',
                        margin: '0 0 20px'
                      }}>
                        {article.excerpt}
                      </p>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '16px',
                        borderTop: '1px solid #f3f4f6'
                      }}>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1f2937',
                            marginBottom: '4px'
                          }}>
                            {article.author}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#9ca3af'
                          }}>
                            {article.date} • {article.readTime}
                          </div>
                        </div>
                        <button onClick={goToLogin}  style={{
                          background: '#EFF6FF',
                          color: '#3B82F6',
                          border: '1px solid #DBEAFE',
                          padding: '8px 20px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#3B82F6';
                          e.target.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#EFF6FF';
                          e.target.style.color = '#3B82F6';
                        }}
                        >
                          Read Article
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Tabs */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '32px',
              overflowX: 'auto',
              paddingBottom: '8px'
            }}>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  style={{
                    padding: '10px 20px',
                    background: activeCategory === cat.name ? '#3B82F6' : '#f3f4f6',
                    color: activeCategory === cat.name ? '#ffffff' : '#6b7280',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (activeCategory !== cat.name) {
                      e.target.style.background = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeCategory !== cat.name) {
                      e.target.style.background = '#f3f4f6';
                    }
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Latest Articles Section */}
            <h2 style={{
              fontSize: '28px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 32px'
            }}>
              Latest Articles
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px'
            }}>
              {latestArticles.map((article) => (
                <div
                  key={article.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={article.image}
                      alt={article.title}
                      style={{
                        width: '100%',
                        height: '180px',
                        objectFit: 'cover'
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: article.categoryColor,
                      color: '#ffffff',
                      padding: '5px 12px',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {article.category}
                    </span>
                  </div>

                  <div style={{ padding: '20px' }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 10px',
                      lineHeight: '1.4'
                    }}>
                      {article.title}
                    </h3>
                    <p style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      lineHeight: '1.5',
                      margin: '0 0 16px'
                    }}>
                      {article.excerpt}
                    </p>

                    <div style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '4px'
                    }}>
                      {article.author}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      marginBottom: '8px'
                    }}>
                      {article.specialistTag}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#9ca3af'
                    }}>
                      {article.date} • {article.readTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {/* <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '48px'
            }}>
              <button style={{
                width: '40px',
                height: '40px',
                background: '#3B82F6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                1
              </button>
              <button style={{
                width: '40px',
                height: '40px',
                background: '#f3f4f6',
                color: '#6b7280',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                2
              </button>
              <button style={{
                width: '40px',
                height: '40px',
                background: '#f3f4f6',
                color: '#6b7280',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                3
              </button>
              <button style={{
                padding: '0 16px',
                height: '40px',
                background: '#f3f4f6',
                color: '#6b7280',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                Next <ChevronRight size={16} />
              </button>
            </div> */}
          </div>

          {/* Right Sidebar */}
          <div style={{ position: 'sticky', top: '26px' }}>
            {/* About Section */}
            <div style={{
              background: '#f9fafb',
              padding: '24px',
              borderRadius: '16px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 12px'
              }}>
                About Our Blog
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.6',
                margin: 0
              }}>
                InfluenceAI Blog provides cutting-edge insights on leveraging artificial intelligence for influencer marketing campaign optimization strategies.
              </p>
            </div>

            {/* Popular Articles */}
            <div style={{
              background: '#f9fafb',
              padding: '24px',
              borderRadius: '16px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 20px'
              }}>
                Popular Articles
              </h3>
              {popularArticles.map((article) => (
                <div
                  key={article.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '16px',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 8px',
                      lineHeight: '1.4'
                    }}>
                      {article.title}
                    </h4>
                    <div style={{
                      fontSize: '11px',
                      color: '#9ca3af'
                    }}>
                      {article.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Categories */}
            <div style={{
              background: '#f9fafb',
              padding: '24px',
              borderRadius: '16px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 16px'
              }}>
                Categories
              </h3>
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{
                    fontSize: '14px',
                    color: '#4b5563'
                  }}>
                    {cat.name}
                  </span>
                  <span style={{
                    fontSize: '13px',
                    color: '#9ca3af',
                    background: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Newsletter */}
            {/* <div style={{
              background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
              padding: '28px',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#ffffff',
                margin: '0 0 12px'
              }}>
                Stay Updated
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.9)',
                margin: '0 0 20px',
                lineHeight: '1.5'
              }}>
                Get the latest articles delivered to your inbox
              </p>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: 'none',
                  borderRadius: '8px',
                  outline: 'none',
                  marginBottom: '12px',
                  boxSizing: 'border-box'
                }}
              />
              <button style={{
                width: '100%',
                padding: '12px',
                background: '#ffffff',
                color: '#3B82F6',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
              >
                Subscribe
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;