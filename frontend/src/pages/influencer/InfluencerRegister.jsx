// src/pages/profile/InfluencerRegisterPro.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import profileAPI from "../../services/profileAPI";
import API_BASE_URL from "../../config/api";
import "../../style/InfluencerRegister.css";

// Dialog Components
const SuccessDialog = ({ isOpen, onClose, title, message, buttonText, onButtonClick }) => {
  if (!isOpen) return null;

  return (
    <div className="influencer-dialog-overlay">
      <div className="influencer-dialog">
        <div className="influencer-dialog-success-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="influencer-dialog-title">{title}</h3>
        <p className="influencer-dialog-message">{message}</p>
        <div className="influencer-dialog-actions">
          <button 
            className="influencer-dialog-btn influencer-dialog-btn-primary"
            onClick={onButtonClick}
          >
            {buttonText}
          </button>
          <button 
            className="influencer-dialog-btn influencer-dialog-btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm, influencerName }) => {
  if (!isOpen) return null;

  return (
    <div className="influencer-dialog-overlay">
      <div className="influencer-dialog influencer-dialog-danger">
        <div className="influencer-dialog-warning-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.3397 16C2.56994 17.3333 3.53216 19 5.07183 19Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="influencer-dialog-title">Delete Influencer Profile</h3>
        <div className="influencer-dialog-danger-content">
          <p className="influencer-dialog-message">
            Are you sure you want to delete <strong>"{influencerName}"</strong> profile?
          </p>
          <div className="influencer-dialog-risks">
            <h4>This action cannot be undone and will permanently:</h4>
            <ul>
              <li>Delete all your influencer information</li>
              <li>Remove your profile from search results</li>
              <li>Cancel any ongoing collaborations</li>
              <li>Delete your profile assets and images</li>
              <li>Remove your social media connections</li>
            </ul>
          </div>
        </div>
        <div className="influencer-dialog-actions">
          <button 
            className="influencer-dialog-btn influencer-dialog-btn-danger"
            onClick={onConfirm}
          >
            Yes, Delete Permanently
          </button>
          <button 
            className="influencer-dialog-btn influencer-dialog-btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const NICHE_OPTIONS = ["Fashion", "Tech", "Fitness", "Food", "Travel", "Lifestyle", "Beauty", "Automobile", "Education", "Finance", "Health", "Entertainment"];
const SOCIAL_PLATFORMS = ["Instagram", "YouTube", "TikTok", "LinkedIn", "Facebook", "Twitter"];

const STEPS = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Profile Details" },
  { id: 3, label: "Social Media" },
  { id: 4, label: "Profile Assets" },
  { id: 5, label: "Review" }
];

const InfluencerRegister = () => {
  const { token, user, refreshProfileStatus , refreshProfileImage} = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    full_name: "",
    nickname: "",
    // email: "",
    bio: "",
    // followers: "",
    location: "",
    niches: [],
    social_links: {},
    profile_picture: null,
    bg_image: null,
  });

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [profilePreview, setProfilePreview] = useState(null);
  const [bgPreview, setBgPreview] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
const [locationLoading, setLocationLoading] = useState(false);


  // Dialog states
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [successDialogConfig, setSuccessDialogConfig] = useState({
    title: "",
    message: "",
    buttonText: "",
    onButtonClick: () => {}
  });

  const getImageUrl = (value) => {
  if (!value) return null;

  // ✅ Default static image
  if (typeof value === "string" && value.startsWith("/static/")) {
    return `${API_BASE_URL}${value}`;
  }

  // ✅ Uploaded image (GridFS ID)
  return `${API_BASE_URL}/profiles/image/${value}`;
};


  // Fetch current influencer profile
  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await profileAPI.getMyProfile(token);
        if (res?.type === "influencer" && res.profile) {
          const p = res.profile;
          setProfile(p);
          setIsEditing(true);
          setForm({
            full_name: p.full_name || "",
            nickname: p.nickname || "",
            // email: p.email || "",
            bio: p.bio || "",
            // followers: p.followers || "",
            location: p.location || "",
            niches: p.categories || [],
            social_links: p.social_links || {},
            profile_picture: null,
            bg_image: null,
          });
          if (p.profile_picture) setProfilePreview(getImageUrl(p.profile_picture));

          if (p.bg_image)
  setBgPreview(`${getImageUrl(p.bg_image)}?t=${Date.now()}`);
if (p.profile_picture)
  setProfilePreview(`${getImageUrl(p.profile_picture)}?t=${Date.now()}`);


        }
      } catch (err) {
        console.error("Fetch profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);


  const detectLocation = () => {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    const data = await res.json();

    setForm((prev) => ({
      ...prev,
      location: `${data.address.city || data.address.town || ""}, ${data.address.country || ""}`,
    }));
  });
};

const searchLocation = async (query) => {
  if (!query || query.length < 3) {
    setLocationSuggestions([]);
    return;
  }

  try {
    setLocationLoading(true);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
    );
    const data = await res.json();
    setLocationSuggestions(data);
  } catch (err) {
    console.error(err);
  } finally {
    setLocationLoading(false);
  }
};


  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    if (files && files[0]) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
      if (name === "profile_picture") setProfilePreview(URL.createObjectURL(files[0]));
      if (name === "bg_image") setBgPreview(URL.createObjectURL(files[0]));
    } else if (type === "select-multiple") {
      const options = Array.from(e.target.selectedOptions).map((opt) => opt.value);
      setForm((prev) => ({ ...prev, [name]: options }));
    } else if (type === "number") {
      setForm((prev) => ({ ...prev, [name]: value ? parseInt(value, 10) : "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSocialChange = (platform, url) => {
    setForm((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [platform.toLowerCase()]: url },
    }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Basic info is required
const isBasicInfoValid = () => {
  return (
    form.full_name.trim() !== "" &&
    user?.email && // already locked
    form.location.trim() !== ""
  );
};

const isProfileDetailsValid = () => {
  return form.niches.length > 0;
};


  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!token) return setMessage("You must be logged in!");

  setSubmitting(true);
  setMessage("");

  try {
    // Create FormData object
    const formData = new FormData();
    
    // Add basic fields
    if (form.full_name) formData.append('full_name', form.full_name);
    if (form.nickname) formData.append('nickname', form.nickname);
    if (form.phone_number) formData.append('phone_number', form.phone_number);
    if (form.location) formData.append('location', form.location);
    if (form.bio) formData.append('bio', form.bio);
    
    // Add categories/niches as comma-separated string
    if (form.niches && form.niches.length > 0) {
      formData.append('categories', form.niches.join(','));
    }
    
    // Add social links
    Object.entries(form.social_links || {}).forEach(([platform, url]) => {
      if (url && url.trim() !== '') {
        formData.append(platform.toLowerCase(), url);
      }
    });
    
    // Add files
    if (form.profile_picture && form.profile_picture instanceof File) {
      formData.append('profile_picture', form.profile_picture);
    }
    
    if (form.bg_image && form.bg_image instanceof File) {
      formData.append('bg_image', form.bg_image);
    }

    let res;

    // Use the simplified approach
    if (isEditing) {
      res = await profileAPI.updateProfile("influencer", formData);
      setProfile(res.profile);
    } else {
      res = await profileAPI.createProfile("influencer", formData);
      setProfile(res.profile);
      setIsEditing(true);
    }

    // 🔁 IMPORTANT: Refresh profile completion state
    const completionResult = await refreshProfileStatus();
    refreshProfileImage();

    if (completionResult?.isComplete) {
      setSuccessDialogConfig({
        title: isEditing ? "Profile Updated Successfully!" : "Profile Created Successfully!",
        message: `Your profile is 100% complete! You can now access all features.`,
        buttonText: "Go to Dashboard",
        onButtonClick: () => navigate(`/${completionResult.profile_type}/dashboard`),
      });
    } else {
      setSuccessDialogConfig({
        title: "Profile Saved",
        message: `Your profile is ${completionResult?.progress || 0}% complete. Complete all required fields to unlock all features.`,
        buttonText: "Continue Editing",
        onButtonClick: () => {
          setShowSuccessDialog(false);
          // Optionally show what's missing
          if (completionResult?.completionDetails) {
            const missing = Object.entries(completionResult.completionDetails)
              .filter(([key, value]) => !value && !key.startsWith('has_'))
              .map(([key]) => key);
            
            if (missing.length > 0) {
              setMessage(`Please complete: ${missing.join(', ')}`);
            }
          }
        },
      });
    }

    setShowSuccessDialog(true);
  } catch (err) {
    console.error("Save profile error:", err);
    setMessage(
      err.response?.data?.error ||
        "Error saving profile. Please try again."
    );
  } finally {
    setSubmitting(false);
  }
};


  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!token) return;

    try {
      await profileAPI.deleteProfile("influencer", token);
      setProfile(null);
      setForm({
        full_name: "",
        nickname: "",
        // email: "",
        bio: "",
        followers: "",
        location: "",
        niches: [],
        social_links: {},
        profile_picture: null,
        bg_image: null,
      });
      setProfilePreview(null);
      setBgPreview(null);
      setIsEditing(false);
      setCurrentStep(1);
      setShowDeleteDialog(false);
      
      setSuccessDialogConfig({
        title: "Profile Deleted Successfully",
        message: "Your influencer profile has been permanently deleted. All associated data has been removed from our system.",
        buttonText: "Create New Profile",
        onButtonClick: () => navigate("/influencer/register")

      });
      setShowSuccessDialog(true);
    } catch (err) {
      console.error("Delete profile error:", err);
      setMessage("Error deleting profile. Please try again.");
      setShowDeleteDialog(false);
    }
  };

  const progressPercentage = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  if (loading) {
    return (
      // <div className="influencer-register-pro">
      //   <div className="influencer-register-loading-full">
      //     <div className="influencer-register-loading-spinner"></div>
      //     <p>Loading your profile...</p>
      //   </div>
      // </div>
      <div className="brand-dashboard-loader">
        <div className="brand-loader-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="influencer-register-pro">
      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title={successDialogConfig.title}
        message={successDialogConfig.message}
        buttonText={successDialogConfig.buttonText}
        onButtonClick={successDialogConfig.onButtonClick}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        influencerName={form.full_name || form.nickname}
      />

      <div className="influencer-register-header">
        <h1 className="influencer-register-title">
          {isEditing ? "Update Influencer Profile" : "Create Influencer Profile"}
        </h1>
        <p className="influencer-register-subtitle">
          {isEditing 
            ? "Update your influencer information and attract more brand collaborations" 
            : "Complete your influencer profile to start collaborating with brands"
          }
        </p>
      </div>

      {message && (
        <div className={`influencer-register-message ${message.includes("Error") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      {/* Progress Steps */}
      <div className="influencer-register-progress">
        <div className="influencer-register-progress-line"></div>
        <div 
          className="influencer-register-progress-line-active"
          style={{ width: `${progressPercentage}%` }}
        ></div>
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={`influencer-register-step ${
              currentStep > step.id ? "completed" : currentStep === step.id ? "active" : ""
            }`}
          >
            <div className="influencer-register-step-circle">
              {currentStep > step.id ? "✓" : step.id}
            </div>
            <div className="influencer-register-step-label">{step.label}</div>
          </div>
        ))}
      </div>

      {/* Form Container */}
      <div className="influencer-register-form-container">
        <form onSubmit={handleSubmit} className="influencer-register-form-content">
          
          {/* Step 1: Basic Information */}
          <div className={`influencer-register-form-step ${currentStep === 1 ? "active" : ""}`}>
            <div className="influencer-register-form-grid">
              <div className="influencer-register-form-grid-2">
                <div className="influencer-register-form-group">
                  <label className="influencer-register-form-label">Full Name *</label>
                  <input
                    type="text"
                    className="influencer-register-form-input"
                    placeholder="Enter your full name"
                    value={form.full_name}
                    onChange={(e) => setForm(prev => ({...prev, full_name: e.target.value}))}
                    required
                  />
                </div>
                <div className="influencer-register-form-group">
                  <label className="influencer-register-form-label">Nickname / Handle</label>
                  <input
                    type="text"
                    
                    className="influencer-register-form-input"
                    placeholder="Your social media handle"
                    value={form.nickname}
                    onChange={(e) => setForm(prev => ({...prev, nickname: e.target.value}))}
                  />
                </div>
              </div>

              <div className="influencer-register-form-grid-2">
                <div className="influencer-register-form-group">
                  <label className="influencer-register-form-label">Email *</label>
                 <input
  type="email"
  className="influencer-register-form-input"
  value={user?.email || ""}
  disabled
/>
<small className="field-hint">
  Email is linked to your account and cannot be changed.
</small>

                </div>
      <div className="influencer-register-form-group">
  <label className="influencer-register-form-label">Location</label>

  <div className="input-with-action">
    <input
      type="text"
      className="influencer-register-form-input"
      placeholder="City, Country"
      value={form.location}
      required 
      onChange={(e) => {
        const value = e.target.value;
        setForm((prev) => ({ ...prev, location: value }));
        searchLocation(value);
      }}
    />

    <button
      type="button"
      className="input-action-btn"
      onClick={detectLocation}
      title="Detect current location"
    >
      Detect
    </button>
  </div>

  {locationLoading && (
    <small className="field-hint">Detecting location…</small>
  )}

  {locationSuggestions.length > 0 && (
    <ul className="influencer-location-suggestions">
      {locationSuggestions.map((item) => (
        <li
          key={item.place_id}
          onClick={() => {
            setForm((prev) => ({ ...prev, location: item.display_name }));
            setLocationSuggestions([]);
          }}
        >
          {item.display_name}
        </li>
      ))}
    </ul>
  )}
</div>


              </div>
            </div>
          </div>

          {/* Step 2: Profile Details */}
          <div className={`influencer-register-form-step ${currentStep === 2 ? "active" : ""}`}>
            <div className="influencer-register-form-grid">
              {/* <div className="influencer-register-form-group">
                <label className="influencer-register-form-label">Followers Count</label>
                <input
                  type="number"
                  className="influencer-register-form-input"
                  placeholder="e.g., 50000"
                  value={form.followers}
                  onChange={handleChange}
                  name="followers"
                  min="0"
                />
              </div> */}

              <div className="influencer-register-form-group">
                <label className="influencer-register-form-label">Niches</label>

<div className="influencer-checkbox-grid">
  {NICHE_OPTIONS.map((niche) => (
    <label key={niche} className="influencer-checkbox">
      <input
        type="checkbox"
        checked={form.niches.includes(niche)}
        onChange={(e) => {
          const checked = e.target.checked;
          setForm((prev) => ({
            ...prev,
            niches: checked
              ? [...prev.niches, niche]
              : prev.niches.filter((n) => n !== niche),
          }));
        }}
      />
      <span>{niche}</span>
    </label>
  ))}
</div>

              </div>

              <div className="influencer-register-form-group">
                <label className="influencer-register-form-label">Bio</label>
                <textarea
                  className="influencer-register-form-textarea"
                  placeholder="Tell us about yourself, your content style, and what makes you unique..."
                  value={form.bio}
                  onChange={handleChange}
                  name="bio"
                  rows="4"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Social Media */}
          <div className={`influencer-register-form-step ${currentStep === 3 ? "active" : ""}`}>
            <div className="influencer-register-form-grid">
              <div className="influencer-register-social-grid">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <div key={platform} className="influencer-register-form-group">
                    <label className="influencer-register-form-label">{platform}</label>
                    <input
                      type="url"
                      className="influencer-register-form-input influencer-register-social-input"
                      placeholder={`https://${platform.toLowerCase()}.com/yourprofile`}
                      value={form.social_links[platform.toLowerCase()] || ""}
                      onChange={(e) => handleSocialChange(platform, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 4: Profile Assets */}
          <div className={`influencer-register-form-step ${currentStep === 4 ? "active" : ""}`}>
            <div className="influencer-register-form-grid">
              <div className="influencer-register-form-grid-2">
                <div className="influencer-register-form-group">
                  <label className="influencer-register-form-label">Profile Picture</label>
                  <div className="influencer-register-file-upload">
                    <input
                      type="file"
                      className="influencer-register-form-input"
                      accept="image/*"
                      onChange={handleChange}
                      name="profile_picture"
                      style={{ display: 'none' }}
                      id="profile-upload"
                    />
                    <label htmlFor="profile-upload">
                      <div className="influencer-register-file-text">
                        {form.profile_picture ? "Change Photo" : "Upload Photo"}
                      </div>
                      <div className="influencer-register-file-hint">
                        Recommended: 500x500px, PNG or JPG
                      </div>
                    </label>
                  </div>
                  {profilePreview && (
                    <div className="influencer-register-image-previews">
                      <div className="influencer-register-image-preview">
                        <img src={profilePreview} alt="Profile preview" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="influencer-register-form-group">
                  <label className="influencer-register-form-label">Background Image</label>
                  <div className="influencer-register-file-upload">
                    <input
                      type="file"
                      className="influencer-register-form-input"
                      accept="image/*"
                      onChange={handleChange}
                      name="bg_image"
                      style={{ display: 'none' }}
                      id="bg-upload"
                    />
                    <label htmlFor="bg-upload">
                      <div className="influencer-register-file-text">
                        {form.bg_image ? "Change Background" : "Upload Background"}
                      </div>
                      <div className="influencer-register-file-hint">
                        Recommended: 1200x600px, PNG or JPG
                      </div>
                    </label>
                  </div>
                  {bgPreview && (
                    <div className="influencer-register-image-previews">
                      <div className="influencer-register-image-preview">
                        <img src={bgPreview} alt="Background preview" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Step 5: Review */}
          <div className={`influencer-register-form-step ${currentStep === 5 ? "active" : ""}`}>
            <div className="influencer-register-form-grid">
              <div className="influencer-register-form-group">
                <h3 className="influencer-register-review-title">Review Your Information</h3>
                
                <div className="influencer-register-form-grid-2">
                  <div className="influencer-register-review-section">
                    <h4 className="influencer-register-review-section-title">Basic Information</h4>
                    <p><strong>Full Name:</strong> {form.full_name}</p>
                    <p><strong>Nickname:</strong> {form.nickname || 'Not provided'}</p>
                    <p><strong>Email:</strong> {user?.email}</p>

                    <p><strong>Location:</strong> {form.location || 'Not provided'}</p>
                  </div>
                  
                  <div className="influencer-register-review-section">
                    <h4 className="influencer-register-review-section-title">Profile Details</h4>
                    {/* <p><strong>Followers:</strong> {form.followers ? form.followers.toLocaleString() : 'Not specified'}</p> */}
                    <p><strong>Niches:</strong> {form.niches.join(', ') || 'None selected'}</p>
                  </div>
                </div>

                {form.bio && (
                  <div className="influencer-register-review-section">
                    <h4 className="influencer-register-review-section-title">Bio</h4>
                    <p>{form.bio}</p>
                  </div>
                )}

                <div className="influencer-register-review-section">
                  <h4 className="influencer-register-review-section-title">Social Media</h4>
                  {SOCIAL_PLATFORMS.map(platform => {
                    const url = form.social_links[platform.toLowerCase()];
                    return url ? (
                      <p key={platform}><strong>{platform}:</strong> {url}</p>
                    ) : null;
                  }).filter(Boolean)}
                  {!Object.values(form.social_links).some(url => url) && (
                    <p>No social media links provided</p>
                  )}
                </div>
              </div>
            </div>
            {currentStep === 2 && form.niches.length === 0 && (
  <small className="field-error">
    Please select at least one niche to continue
  </small>
)}

          </div>

          {/* Navigation Buttons */}
          <div className="influencer-register-nav-buttons">
            {currentStep > 1 && (
              <button
                type="button"
                className="influencer-register-btn influencer-register-btn-prev"
                onClick={prevStep}
                disabled={submitting}
              >
                ← Previous
              </button>
            )}
            
            {currentStep < STEPS.length ? (
 <button
  type="button"
  className="influencer-register-btn influencer-register-btn-next"
  onClick={nextStep}
  disabled={
    (currentStep === 1 && !isBasicInfoValid()) ||
    (currentStep === 2 && !isProfileDetailsValid())
  }
>
  Next →
</button>



) : (
              <button
                type="submit"
                className="influencer-register-btn influencer-register-btn-submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="influencer-register-loading"></div>
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditing ? "Update Profile" : "Create Profile"
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <>
          <button
            onClick={handleDeleteClick}
            className="influencer-register-delete-btn"
            type="button"
          >
            Delete Profile
          </button>
          
          <div className="influencer-register-action-buttons">
            <button
              type="button"
              className="influencer-register-action-btn"
              onClick={() => navigate('/influencer/me')}
            >
              View My Profile
            </button>
            <button
              type="button"
              className="influencer-register-action-btn"
              onClick={() => navigate('/influencer/profiles/public')}
            >
              Public Profiles
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default InfluencerRegister;