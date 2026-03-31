// FreeAPIComponent.jsx
import React, { useState, useEffect } from 'react';

const FreeAPIFeeds = () => {
  const [redditPosts, setRedditPosts] = useState([]);
  const [devtoArticles, setDevtoArticles] = useState([]);

  useEffect(() => {
    // Reddit API (free, no auth needed for public data)
    fetch('https://www.reddit.com/r/javascript/hot/.json?limit=5')
      .then(res => res.json())
      .then(data => setRedditPosts(data.data.children));

    // Dev.to API (free)
    fetch('https://dev.to/api/articles?per_page=5')
      .then(res => res.json())
      .then(data => setDevtoArticles(data));
  }, []);

  return (
    <div className="api-feeds">
      <div className="reddit-feed">
        <h4>Reddit r/JavaScript</h4>
        {redditPosts.map(post => (
          <div key={post.data.id} className="post">
            <a href={post.data.url} target="_blank" rel="noopener noreferrer">
              {post.data.title}
            </a>
          </div>
        ))}
      </div>
      
      <div className="devto-feed">
        <h4>Dev.to Latest</h4>
        {devtoArticles.map(article => (
          <div key={article.id} className="article">
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              {article.title}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};