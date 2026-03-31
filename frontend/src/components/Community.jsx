// import React, { useState } from "react";
// import "../style/Community.css";
// import HomeTopBar from "../pages/HomePage/HomeTopBar";

// const communityTopics = [
//   {
//     id: 1,
//     title: "AI Marketing Strategies",
//     icon: "🤖",
//     description: "Discuss AI-powered marketing approaches and share successful tactics",
//     posts: [
//       "How to leverage AI for influencer campaigns",
//       "Case studies of successful AI campaigns",
//       "Best tools for AI-driven marketing",
//       "AI content generation best practices",
//       "Predictive analytics for campaign planning"
//     ],
//     members: 1245,
//     discussions: 342
//   },
//   {
//     id: 2,
//     title: "Influencer Collaboration",
//     icon: "👥",
//     description: "Connect with influencers and share collaboration experiences",
//     posts: [
//       "Finding the right influencers",
//       "Managing influencer relationships",
//       "Negotiation tips and best practices",
//       "Contract templates and guidelines",
//       "Long-term partnership strategies"
//     ],
//     members: 987,
//     discussions: 278
//   },
//   {
//     id: 3,
//     title: "Platform Feedback & Suggestions",
//     icon: "💡",
//     description: "Share your ideas and help us improve InfluenceAI",
//     posts: [
//       "Feature requests",
//       "Bug reports and troubleshooting",
//       "General platform feedback",
//       "UI/UX improvement suggestions",
//       "Integration ideas"
//     ],
//     members: 2103,
//     discussions: 512
//   },
//   {
//     id: 4,
//     title: "Content Creation Ideas",
//     icon: "🎨",
//     description: "Exchange creative ideas and content strategies",
//     posts: [
//       "Trending content formats",
//       "AI-generated content tips",
//       "How to increase engagement",
//       "Video content best practices",
//       "Storytelling techniques"
//     ],
//     members: 1567,
//     discussions: 421
//   },
//   {
//     id: 5,
//     title: "Marketing Analytics",
//     icon: "📊",
//     description: "Deep dive into metrics, ROI, and performance optimization",
//     posts: [
//       "Understanding engagement metrics",
//       "Campaign ROI calculation",
//       "Optimizing influencer performance",
//       "A/B testing strategies",
//       "Conversion rate optimization"
//     ],
//     members: 876,
//     discussions: 195
//   },
//   {
//     id: 6,
//     title: "Industry Trends",
//     icon: "📈",
//     description: "Stay updated with the latest marketing trends and news",
//     posts: [
//       "Emerging social media platforms",
//       "Algorithm changes and updates",
//       "Industry reports and insights",
//       "Future of influencer marketing",
//       "Global market trends"
//     ],
//     members: 1342,
//     discussions: 387
//   }
// ];

// const recentDiscussions = [
//   {
//     id: 1,
//     title: "How do you measure influencer campaign success?",
//     author: "Sarah Johnson",
//     authorRole: "Marketing Director",
//     replies: 24,
//     views: 142,
//     time: "2 hours ago",
//     category: "Marketing Analytics"
//   },
//   {
//     id: 2,
//     title: "Best practices for AI-generated content?",
//     author: "Mike Chen",
//     authorRole: "Content Strategist",
//     replies: 18,
//     views: 98,
//     time: "5 hours ago",
//     category: "Content Creation Ideas"
//   },
//   {
//     id: 3,
//     title: "Feature Request: Advanced filtering options",
//     author: "Emma Williams",
//     authorRole: "Agency Owner",
//     replies: 32,
//     views: 210,
//     time: "1 day ago",
//     category: "Platform Feedback"
//   },
//   {
//     id: 4,
//     title: "Micro vs Macro influencers - 2025 trends",
//     author: "David Rodriguez",
//     authorRole: "Brand Manager",
//     replies: 41,
//     views: 287,
//     time: "2 days ago",
//     category: "Industry Trends"
//   }
// ];

// const communityEvents = [
//   {
//     id: 1,
//     title: "AI Marketing Webinar",
//     date: "Oct 15, 2025",
//     time: "2:00 PM EST",
//     speaker: "Jennifer Lee, AI Marketing Expert",
//     attendees: 124
//   },
//   {
//     id: 2,
//     title: "Influencer Connect Virtual Meetup",
//     date: "Oct 22, 2025",
//     time: "3:00 PM EST",
//     speaker: "Marcus Brown, InfluenceAI CEO",
//     attendees: 87
//   },
//   {
//     id: 3,
//     title: "Q3 Platform Updates Demo",
//     date: "Nov 5, 2025",
//     time: "1:00 PM EST",
//     speaker: "Product Team",
//     attendees: 203
//   }
// ];

// const topContributors = [
//   {
//     id: 1,
//     name: "Alex Morgan",
//     role: "Community Manager",
//     posts: 142,
//     likes: 587,
//     avatar: "👨‍💼"
//   },
//   {
//     id: 2,
//     name: "Priya Patel",
//     role: "Influencer Strategist",
//     posts: 98,
//     likes: 432,
//     avatar: "👩‍💻"
//   },
//   {
//     id: 3,
//     name: "James Wilson",
//     role: "Digital Marketer",
//     posts: 76,
//     likes: 321,
//     avatar: "👨‍🎓"
//   },
//   {
//     id: 4,
//     name: "Lisa Zhang",
//     role: "Content Creator",
//     posts: 65,
//     likes: 298,
//     avatar: "👩‍🎨"
//   }
// ];

// export default function Community() {
//   const [activeCategory, setActiveCategory] = useState("All");
//   const [searchQuery, setSearchQuery] = useState("");

//   const categories = ["All", "AI Marketing", "Influencer", "Platform", "Content", "Analytics", "Trends"];

//   const filteredTopics = communityTopics.filter(topic => 
//     (activeCategory === "All" || topic.title.toLowerCase().includes(activeCategory.toLowerCase())) &&
//     (searchQuery === "" || 
//      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//      topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
//      topic.posts.some(post => post.toLowerCase().includes(searchQuery.toLowerCase())))
//   );

//   return (
//     <><HomeTopBar />
//     <div className="community-container">
//       {/* Header Section */}
//       <header className="community-header">
//         <div className="header-content">
//           <h1>InfluenceAI Community</h1>
//           <p>Connect, collaborate, and grow with marketers, influencers, and AI enthusiasts worldwide</p>
          
//           <div className="community-stats">
//             <div className="stat-item">
//               <span className="stat-number">8,234</span>
//               <span className="stat-label">Members</span>
//             </div>
//             <div className="stat-item">
//               <span className="stat-number">2,156</span>
//               <span className="stat-label">Discussions</span>
//             </div>
//             <div className="stat-item">
//               <span className="stat-number">147</span>
//               <span className="stat-label">Experts Online</span>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="community-content">
//         {/* Main Content */}
//         <main className="community-main">
//           {/* Search and Filters */}
//           <div className="community-filters">
//             <div className="search-box">
//               <span className="search-icon">🔍</span>
//               <input
//                 type="text"
//                 placeholder="Search discussions, topics, or members..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="search-input"
//               />
//             </div>
            
//             <div className="category-filters">
//               {categories.map(category => (
//                 <button
//                   key={category}
//                   className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
//                   onClick={() => setActiveCategory(category)}
//                 >
//                   {category}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Welcome Card */}
//           <div className="welcome-card">
//             <div className="welcome-content">
//               <h2>Welcome to the Community! 👋</h2>
//               <p>Introduce yourself, ask questions, share your experiences, and connect with other marketing professionals.</p>
//               <div className="welcome-actions">
//                 <button className="btn-primary">Start a Discussion</button>
//                 <button className="btn-secondary">Community Guidelines</button>
//               </div>
//             </div>
//           </div>

//           {/* Recent Discussions */}
//           <section className="recent-discussions">
//             <div className="section-header">
//               <h2>Recent Discussions</h2>
//               <a href="/" className="view-all">View All →</a>
//             </div>
            
//             <div className="discussions-list">
//               {recentDiscussions.map(discussion => (
//                 <div key={discussion.id} className="discussion-card">
//                   <div className="discussion-content">
//                     <h3>{discussion.title}</h3>
//                     <div className="discussion-meta">
//                       <span className="author">{discussion.author}</span>
//                       <span className="role">{discussion.authorRole}</span>
//                       <span className="category">{discussion.category}</span>
//                     </div>
//                   </div>
//                   <div className="discussion-stats">
//                     <div className="stat">
//                       <span className="stat-number">{discussion.replies}</span>
//                       <span className="stat-label">Replies</span>
//                     </div>
//                     <div className="stat">
//                       <span className="stat-number">{discussion.views}</span>
//                       <span className="stat-label">Views</span>
//                     </div>
//                     <span className="time">{discussion.time}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>

//           {/* Community Topics */}
//           <section className="community-topics">
//             <div className="section-header">
//               <h2>Discussion Topics</h2>
//               <p>Explore different categories and join the conversation</p>
//             </div>

//             <div className="community-grid">
//               {filteredTopics.map(topic => (
//                 <div key={topic.id} className="community-card">
//                   <div className="card-header">
//                     <span className="topic-icon">{topic.icon}</span>
//                     <h3 className="community-topic-title">{topic.title}</h3>
//                   </div>
//                   <p className="topic-description">{topic.description}</p>
                  
//                   <ul className="community-posts">
//                     {topic.posts.slice(0, 3).map((post, pIdx) => (
//                       <li key={pIdx} className="post-item">
//                         <span className="post-bullet">•</span>
//                         {post}
//                       </li>
//                     ))}
//                     {topic.posts.length > 3 && (
//                       <li className="view-more">+{topic.posts.length - 3} more topics</li>
//                     )}
//                   </ul>

//                   <div className="topic-stats">
//                     <div className="stat">
//                       <span className="stat-number">{topic.members}</span>
//                       <span className="stat-label">Members</span>
//                     </div>
//                     <div className="stat">
//                       <span className="stat-number">{topic.discussions}</span>
//                       <span className="stat-label">Discussions</span>
//                     </div>
//                   </div>

//                   <button className="join-discussion-btn">Join Discussion</button>
//                 </div>
//               ))}
//             </div>

//             {filteredTopics.length === 0 && (
//               <div className="no-results">
//                 <h3>No topics found</h3>
//                 <p>Try adjusting your search or filters</p>
//               </div>
//             )}
//           </section>
//         </main>

//         {/* Sidebar */}
//         <aside className="community-sidebar">
//           {/* Upcoming Events */}
//           <div className="sidebar-widget">
//             <h3>Upcoming Events</h3>
//             <div className="events-list">
//               {communityEvents.map(event => (
//                 <div key={event.id} className="event-card">
//                   <div className="event-date">
//                     <span className="date">{event.date}</span>
//                     <span className="time">{event.time}</span>
//                   </div>
//                   <div className="event-details">
//                     <h4>{event.title}</h4>
//                     <p className="event-speaker">{event.speaker}</p>
//                     <div className="event-stats">
//                       <span className="attendees">{event.attendees} attending</span>
//                       <button className="rsvp-btn">RSVP</button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <a href="/" className="view-all-events">View All Events →</a>
//           </div>

//           {/* Top Contributors */}
//           <div className="sidebar-widget">
//             <h3>Top Contributors</h3>
//             <div className="contributors-list">
//               {topContributors.map(contributor => (
//                 <div key={contributor.id} className="contributor-card">
//                   <div className="contributor-avatar">
//                     {contributor.avatar}
//                   </div>
//                   <div className="contributor-info">
//                     <h4>{contributor.name}</h4>
//                     <p className="contributor-role">{contributor.role}</p>
//                     <div className="contributor-stats">
//                       <span>{contributor.posts} posts</span>
//                       <span>{contributor.likes} likes</span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Community Guidelines */}
//           <div className="sidebar-widget guidelines-widget">
//             <h3>Community Guidelines</h3>
//             <ul className="guidelines-list">
//               <li>Be respectful and inclusive</li>
//               <li>Share valuable insights</li>
//               <li>Keep discussions relevant</li>
//               <li>No self-promotion in discussions</li>
//               <li>Report any issues to moderators</li>
//             </ul>
//             <a href="/" className="guidelines-link">Read Full Guidelines →</a>
//           </div>

//           {/* Resources */}
//           <div className="sidebar-widget">
//             <h3>Community Resources</h3>
//             <div className="resources-list">
//               <a href="/" className="resource-link">Getting Started Guide</a>
//               <a href="/" className="resource-link">FAQ</a>
//               <a href="/" className="resource-link">Moderators</a>
//               <a href="/" className="resource-link">Report an Issue</a>
//             </div>
//           </div>
//         </aside>
//       </div>
//     </div>
//     </>
//   );
// }


import React, { useState } from 'react';
import { Search, MessageCircle, ThumbsUp, MessageSquare, Eye, TrendingUp, Clock, Users, Filter, Plus, CheckCircle, Award, Flame } from 'lucide-react';


import { useNavigate } from "react-router-dom";

function Community() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trending');

  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

  const categories = [
    { id: 'all', name: 'All Topics', count: 1243 },
    { id: 'general', name: 'General Discussion', count: 456 },
    { id: 'api', name: 'API & Integration', count: 287 },
    { id: 'campaigns', name: 'Campaign Strategy', count: 342 },
    { id: 'analytics', name: 'Analytics', count: 158 }
  ];

  const topics = [
    {
      id: 1,
      title: 'Best practices for influencer outreach in 2025',
      author: 'Sarah Mitchell',
      authorImg: '1',
      category: 'Campaign Strategy',
      replies: 23,
      views: 1247,
      likes: 45,
      timeAgo: '2 hours ago',
      tags: ['Strategy', 'Outreach', 'Best Practices'],
      solved: true,
      trending: true
    },
    {
      id: 2,
      title: 'How to integrate Brio API with custom CRM?',
      author: 'Michael Chen',
      authorImg: '13',
      category: 'API & Integration',
      replies: 15,
      views: 892,
      likes: 32,
      timeAgo: '5 hours ago',
      tags: ['API', 'Integration', 'CRM'],
      solved: false,
      trending: true
    },
    {
      id: 3,
      title: 'ROI tracking setup for multi-platform campaigns',
      author: 'Jessica Williams',
      authorImg: '5',
      category: 'Analytics',
      replies: 18,
      views: 1034,
      likes: 38,
      timeAgo: '1 day ago',
      tags: ['Analytics', 'ROI', 'Tracking'],
      solved: true,
      trending: false
    },
    {
      id: 4,
      title: 'Micro vs Macro influencers: What works better?',
      author: 'David Park',
      authorImg: '12',
      category: 'General Discussion',
      replies: 41,
      views: 2156,
      likes: 67,
      timeAgo: '2 days ago',
      tags: ['Influencers', 'Strategy', 'Discussion'],
      solved: false,
      trending: true
    },
    {
      id: 5,
      title: 'Error handling in webhook implementations',
      author: 'Emma Rodriguez',
      authorImg: '9',
      category: 'API & Integration',
      replies: 9,
      views: 543,
      likes: 21,
      timeAgo: '3 days ago',
      tags: ['API', 'Webhooks', 'Error Handling'],
      solved: true,
      trending: false
    },
    {
      id: 6,
      title: 'Tips for negotiating rates with influencers',
      author: 'James Anderson',
      authorImg: '8',
      category: 'Campaign Strategy',
      replies: 27,
      views: 1567,
      likes: 52,
      timeAgo: '4 days ago',
      tags: ['Negotiation', 'Budget', 'Strategy'],
      solved: false,
      trending: false
    }
  ];

  return (
    <div className="comm-wrapper">
      {/* Hero Section */}
      <section className="comm-hero">
        <div className="comm-hero-content">
          <h1 className="comm-hero-title">Community Forum</h1>
          <p className="comm-hero-subtitle">
            Connect with fellow marketers, share insights, and get expert advice<br />
            on influencer marketing strategies
          </p>
          <div className="comm-search-wrapper">
            <input 
              type="text" 
              placeholder="Search discussions, topics, or users..." 
              className="comm-search-input"
            />
            <button className="comm-search-btn">
              <Search size={20} />
            </button>
          </div>
          <div className="comm-hero-stats">
            <div className="comm-stat-item">
              <Users size={24} />
              <div>
                <h3>12,450</h3>
                <p>Members</p>
              </div>
            </div>
            <div className="comm-stat-item">
              <MessageCircle size={24} />
              <div>
                <h3>1,243</h3>
                <p>Discussions</p>
              </div>
            </div>
            <div className="comm-stat-item">
              <Award size={24} />
              <div>
                <h3>892</h3>
                <p>Solved Topics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="comm-main">
        <div className="comm-container">
          <div className="comm-layout">
            {/* Sidebar */}
            <aside className="comm-sidebar">
              <button className="comm-new-topic-btn" onClick={goToLogin}>
                <Plus size={20} />
                <span>New Discussion</span>
              </button>

              <div className="comm-sidebar-section">
                <h3 className="comm-sidebar-title">Categories</h3>
                <div className="comm-categories">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      className={`comm-category-item ${activeCategory === cat.id ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      <span className="comm-category-name">{cat.name}</span>
                      <span className="comm-category-count">{cat.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="comm-sidebar-section">
                <h3 className="comm-sidebar-title">Top Contributors</h3>
                <div className="comm-contributors">
                  {[
                    { name: 'Sarah Mitchell', posts: 234, img: '1' },
                    { name: 'Michael Chen', posts: 198, img: '13' },
                    { name: 'Jessica Williams', posts: 176, img: '5' }
                  ].map((user, i) => (
                    <div key={i} className="comm-contributor-item">
                      <img src={`https://i.pravatar.cc/150?img=${user.img}`} alt={user.name} />
                      <div className="comm-contributor-info">
                        <h4>{user.name}</h4>
                        <p>{user.posts} posts</p>
                      </div>
                      <Award size={16} className="comm-contributor-badge" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="comm-sidebar-section">
                <h3 className="comm-sidebar-title">Popular Tags</h3>
                <div className="comm-tags">
                  {['API', 'Strategy', 'Analytics', 'Campaigns', 'Integration', 'Best Practices', 'ROI'].map(tag => (
                    <button key={tag} className="comm-tag">{tag}</button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Content Area */}
            <main className="comm-content">
              {/* Filter Bar */}
              <div className="comm-filter-bar">
                <div className="comm-filter-left">
                  <button 
                    className={`comm-filter-btn ${sortBy === 'trending' ? 'active' : ''}`}
                    onClick={() => setSortBy('trending')}
                  >
                    <TrendingUp size={16} />
                    <span>Trending</span>
                  </button>
                  <button 
                    className={`comm-filter-btn ${sortBy === 'recent' ? 'active' : ''}`}
                    onClick={() => setSortBy('recent')}
                  >
                    <Clock size={16} />
                    <span>Recent</span>
                  </button>
                  <button 
                    className={`comm-filter-btn ${sortBy === 'popular' ? 'active' : ''}`}
                    onClick={() => setSortBy('popular')}
                  >
                    <Flame size={16} />
                    <span>Popular</span>
                  </button>
                </div>
                {/* <button className="comm-filter-more">
                  <Filter size={16} />
                  <span>More Filters</span>
                </button> */}
              </div>

              {/* Topics List */}
              <div className="comm-topics-list">
                {topics.map(topic => (
                  <div key={topic.id} className="comm-topic-card">
                    <div className="comm-topic-left">
                      <img 
                        src={`https://i.pravatar.cc/150?img=${topic.authorImg}`} 
                        alt={topic.author}
                        className="comm-topic-avatar"
                      />
                    </div>
                    <div className="comm-topic-main">
                      <div className="comm-topic-header">
                        <div className="comm-topic-title-row">
                          <h3 className="comm-topic-title">{topic.title}</h3>
                          {topic.solved && (
                            <span className="comm-solved-badge">
                              <CheckCircle size={14} />
                              Solved
                            </span>
                          )}
                          {topic.trending && (
                            <span className="comm-trending-badge">
                              <TrendingUp size={14} />
                              Trending
                            </span>
                          )}
                        </div>
                        <div className="comm-topic-meta">
                          <span className="comm-topic-author">{topic.author}</span>
                          <span className="comm-topic-separator">•</span>
                          <span className="comm-topic-category">{topic.category}</span>
                          <span className="comm-topic-separator">•</span>
                          <span className="comm-topic-time">{topic.timeAgo}</span>
                        </div>
                      </div>
                      <div className="comm-topic-tags">
                        {topic.tags.map(tag => (
                          <span key={tag} className="comm-topic-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="comm-topic-stats">
                      <div className="comm-stat">
                        <MessageSquare size={18} />
                        <span>{topic.replies}</span>
                      </div>
                      <div className="comm-stat">
                        <Eye size={18} />
                        <span>{topic.views}</span>
                      </div>
                      <div className="comm-stat">
                        <ThumbsUp size={18} />
                        <span>{topic.likes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              <div className="comm-load-more">
                <button className="comm-load-more-btn" onClick={goToLogin}>Load More Discussions</button>
              </div>
            </main>
          </div>
        </div>
      </div>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .comm-wrapper { width: 100%; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; }
        .comm-hero { background: linear-gradient(135deg, #5DADE2 0%, #3b82f6 100%); padding: 80px 20px 60px; text-align: center; }
        .comm-hero-content { max-width: 900px; margin: 0 auto; }
        .comm-hero-title { font-size: 48px; font-weight: 700; color: white; margin-bottom: 16px; }
        .comm-hero-subtitle { font-size: 18px; color: rgba(255,255,255,0.95); line-height: 1.7; margin-bottom: 40px; }
        .comm-search-wrapper { position: relative; max-width: 600px; margin: 0 auto 40px; }
        .comm-search-input { width: 100%; padding: 16px 60px 16px 20px; border: none; border-radius: 12px; font-size: 15px; outline: none; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .comm-search-btn { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .comm-hero-stats { display: flex; gap: 48px; justify-content: center; margin-top: 40px; }
        .comm-stat-item { display: flex; align-items: center; gap: 12px; color: white; }
        .comm-stat-item svg { opacity: 0.9; }
        .comm-stat-item h3 { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
        .comm-stat-item p { font-size: 14px; opacity: 0.9; }
        .comm-main { padding: 40px 0; }
        .comm-container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }
        .comm-layout { display: grid; grid-template-columns: 300px 1fr; gap: 32px; }
        .comm-sidebar { position: sticky; top: 20px; height: fit-content; }
        .comm-new-topic-btn { width: 100%; padding: 14px 20px; background: #3b82f6; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 24px; transition: 0.2s; }
        .comm-new-topic-btn:hover { background: #2563eb; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
        .comm-sidebar-section { background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .comm-sidebar-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
        .comm-categories { display: flex; flex-direction: column; gap: 8px; }
        .comm-category-item { width: 100%; padding: 12px 16px; background: transparent; border: none; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: 0.2s; }
        .comm-category-item:hover { background: #f1f5f9; }
        .comm-category-item.active { background: #eff6ff; }
        .comm-category-name { font-size: 14px; font-weight: 500; color: #475569; text-align: left; }
        .comm-category-item.active .comm-category-name { color: #3b82f6; font-weight: 600; }
        .comm-category-count { font-size: 13px; color: #94a3b8; background: #f1f5f9; padding: 2px 8px; border-radius: 6px; }
        .comm-category-item.active .comm-category-count { background: #dbeafe; color: #3b82f6; }
        .comm-contributors { display: flex; flex-direction: column; gap: 12px; }
        .comm-contributor-item { display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 8px; transition: 0.2s; cursor: pointer; }
        .comm-contributor-item:hover { background: #f8fafc; }
        .comm-contributor-item img { width: 40px; height: 40px; border-radius: 50%; }
        .comm-contributor-info { flex: 1; }
        .comm-contributor-info h4 { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 2px; }
        .comm-contributor-info p { font-size: 12px; color: #64748b; }
        .comm-contributor-badge { color: #f59e0b; flex-shrink: 0; }
        .comm-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .comm-tag { padding: 6px 12px; background: #f1f5f9; color: #475569; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: 0.2s; }
        .comm-tag:hover { background: #e2e8f0; color: #1e293b; }
        .comm-content { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .comm-filter-bar { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; margin-bottom: 24px; }
        .comm-filter-left { display: flex; gap: 12px; }
        .comm-filter-btn { padding: 8px 16px; background: transparent; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; transition: 0.2s; }
        .comm-filter-btn:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
        .comm-filter-btn.active { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
        .comm-filter-more { padding: 8px 16px; background: transparent; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; }
        .comm-topics-list { display: flex; flex-direction: column; gap: 16px; }
        .comm-topic-card { display: flex; gap: 16px; padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; transition: 0.2s; cursor: pointer; }
        .comm-topic-card:hover { border-color: #3b82f6; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .comm-topic-avatar { width: 48px; height: 48px; border-radius: 50%; }
        .comm-topic-main { flex: 1; }
        .comm-topic-title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .comm-topic-title { font-size: 18px; font-weight: 600; color: #1e293b; }
        .comm-solved-badge { padding: 4px 10px; background: #dcfce7; color: #16a34a; font-size: 12px; font-weight: 600; border-radius: 6px; display: flex; align-items: center; gap: 4px; }
        .comm-trending-badge { padding: 4px 10px; background: #fef3c7; color: #d97706; font-size: 12px; font-weight: 600; border-radius: 6px; display: flex; align-items: center; gap: 4px; }
        .comm-topic-meta { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #64748b; margin-bottom: 12px; }
        .comm-topic-author { font-weight: 500; }
        .comm-topic-separator { color: #cbd5e1; }
        .comm-topic-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .comm-topic-tag { padding: 4px 10px; background: white; color: #64748b; border: 1px solid #e2e8f0; font-size: 12px; border-radius: 6px; }
        .comm-topic-stats { display: flex; flex-direction: column; gap: 12px; align-items: flex-end; padding-top: 4px; }
        .comm-stat { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #64748b; }
        .comm-load-more { text-align: center; margin-top: 32px; }
        .comm-load-more-btn { padding: 12px 32px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .comm-load-more-btn:hover { background: #e2e8f0; }
        @media (max-width: 1024px) {
          .comm-layout { grid-template-columns: 1fr; }
          .comm-sidebar { position: relative; }
          .comm-hero-stats { flex-wrap: wrap; gap: 24px; }
        }
        @media (max-width: 640px) {
          .comm-hero-title { font-size: 32px; }
          .comm-content { padding: 16px; }
          .comm-topic-card { flex-direction: column; }
          .comm-topic-stats { flex-direction: row; justify-content: flex-start; }
          .comm-filter-bar { flex-direction: column; gap: 12px; align-items: stretch; }
        }
      `}</style>
    </div>
  );
}

export default Community;