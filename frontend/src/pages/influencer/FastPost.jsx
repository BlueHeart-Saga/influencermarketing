import React, { useState, useRef } from 'react';
import '../../style/FastPost.css';
import API_BASE_URL from "../../config/api";

const FastPost = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    instagram: false,
    youtube: false,
    twitter: false,
    linkedin: false
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postStatus, setPostStatus] = useState('');
  const [postResults, setPostResults] = useState(null);
  const fileInputRef = useRef(null);

  // Social media platform configuration
  const platformConfig = {
    instagram: { name: 'Instagram', icon: '📸', color: '#E1306C' },
    youtube: { name: 'YouTube', icon: '📺', color: '#FF0000' },
    twitter: { name: 'Twitter', icon: '🐦', color: '#1DA1F2' },
    linkedin: { name: 'LinkedIn', icon: '💼', color: '#0077B5' }
  };

  // Sample AI-generated content suggestions
  const aiSuggestions = [
    "Just created something amazing! Check out this new content. #creativity #innovation",
    "Sharing a special moment with you all. This made my day! #happy #share",
    "Behind the scenes: Here's what I've been working on lately. #sneakpeek #update",
    "This is too good not to share! What do you think? #opinionswelcome #discussion",
    "Inspiration struck! Here's the result. #inspiration #create"
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlatformToggle = (platform) => {
    setSelectedPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const generateAIContent = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI content generation - you can replace this with actual AI API call
      setTimeout(() => {
        const randomSuggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
        setPostContent(randomSuggestion);
        setIsGenerating(false);
      }, 1500);
    } catch (error) {
      console.error('AI content generation failed:', error);
      setIsGenerating(false);
    }
  };

  const handlePost = async () => {
    if (!postContent.trim() && !selectedFile) {
      setPostStatus('error');
      return;
    }

    const selectedCount = Object.values(selectedPlatforms).filter(Boolean).length;
    if (selectedCount === 0) {
      setPostStatus('no-platforms');
      return;
    }

    setIsPosting(true);
    setPostStatus('posting');
    setPostResults(null);

    try {
      const formData = new FormData();
      formData.append('post_content', postContent);
      formData.append('platforms', JSON.stringify(
        Object.keys(selectedPlatforms).filter(platform => selectedPlatforms[platform])
      ));
      
      if (selectedFile) {
        formData.append('media', selectedFile);
      }

      const response = await fetch(`${API_BASE_URL}/fastpost/post/`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setPostStatus('success');
        setPostResults(result.details);
        
        // Reset form after success
        setTimeout(() => {
          setPostContent('');
          setSelectedFile(null);
          setPreviewUrl('');
          setSelectedPlatforms({
            instagram: false,
            youtube: false,
            twitter: false,
            linkedin: false
          });
          setPostStatus('');
          setPostResults(null);
        }, 5000);
      } else {
        throw new Error(result.details || 'Posting failed');
      }
    } catch (error) {
      console.error('Posting error:', error);
      setPostStatus('error');
      setPostResults({ error: error.message });
    } finally {
      setIsPosting(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect({ target: { files: [files[0]] } });
    }
  };

  const fetchPostHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/`);
      const data = await response.json();
      console.log('Post history:', data);
      // You can display this in a modal or separate component
    } catch (error) {
      console.error('Failed to fetch post history:', error);
    }
  };

  return (
    <div className="fastpost-container">
      <div className="fastpost-card">
        <div className="fastpost-header">
          <h1>FastPost AI</h1>
          <p>Share everywhere in seconds with real social media integration</p>
          <button className="history-btn" onClick={fetchPostHistory}>
            View Post History
          </button>
        </div>

        <div className="fastpost-content">
          {/* File Upload Area */}
          <div 
            className="upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*"
              style={{ display: 'none' }}
            />
            
            {previewUrl ? (
              <div className="preview-container">
                {selectedFile?.type?.startsWith('video/') ? (
                  <video src={previewUrl} controls className="media-preview" />
                ) : (
                  <img src={previewUrl} alt="Preview" className="media-preview" />
                )}
                <button 
                  className="remove-media-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setPreviewUrl('');
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">📁</div>
                <p>Drag & drop media or click to browse</p>
                <span>Supports images and videos</span>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="content-section">
            <div className="content-header">
              <label>Your Post Content</label>
              <button 
                className="ai-generate-btn"
                onClick={generateAIContent}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner"></span>
                    AI Thinking...
                  </>
                ) : (
                  <>
                    <span className="ai-icon">✨</span>
                    Generate with AI
                  </>
                )}
              </button>
            </div>
            
            <textarea
              className="post-textarea"
              placeholder="What would you like to share? (Supports YouTube descriptions, Instagram captions, etc.)"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows="4"
            />
          </div>

          {/* Platform Selection */}
          <div className="platforms-section">
            <label>Select Platforms to Share</label>
            <div className="platforms-grid">
              {Object.entries(platformConfig).map(([platform, config]) => (
                <div
                  key={platform}
                  className={`platform-item ${selectedPlatforms[platform] ? 'selected' : ''}`}
                  onClick={() => handlePlatformToggle(platform)}
                  style={{ 
                    borderColor: selectedPlatforms[platform] ? config.color : '#ddd',
                    backgroundColor: selectedPlatforms[platform] ? `${config.color}10` : 'white'
                  }}
                >
                  <div className="platform-icon" style={{ color: config.color }}>
                    {config.icon}
                  </div>
                  <span className="platform-name">{config.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Post Button */}
          <button
            className={`post-button ${isPosting ? 'posting' : ''}`}
            onClick={handlePost}
            disabled={isPosting}
          >
            {isPosting ? (
              <>
                <span className="button-spinner"></span>
                Posting to {Object.values(selectedPlatforms).filter(Boolean).length} platforms...
              </>
            ) : (
              `Post to Selected Platforms`
            )}
          </button>

          {/* Status Messages */}
          {postStatus === 'error' && (
            <div className="status-message error">
              ❌ Posting failed. Please try again.
              {postResults?.error && <div className="error-detail">{postResults.error}</div>}
            </div>
          )}
          
          {postStatus === 'no-platforms' && (
            <div className="status-message error">
              Please select at least one platform to share to.
            </div>
          )}
          
          {postStatus === 'success' && (
            <div className="status-message success">
              <div>✅ Successfully posted to all selected platforms!</div>
              {postResults && (
                <div className="post-results">
                  <h4>Posting Results:</h4>
                  {Object.entries(postResults).map(([platform, result]) => (
                    <div key={platform} className="platform-result">
                      <strong>{platformConfig[platform]?.name || platform}:</strong> 
                      {result.mock ? ' ✅ Mock post successful' : 
                       result.error ? ` ❌ ${result.error}` : ' ✅ Posted successfully'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FastPost;