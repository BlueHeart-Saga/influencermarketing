// src/pages/profile/BrandRegisterPro.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import profileAPI from "../../services/profileAPI";
import API_BASE_URL from "../../config/api";
import "../../style/BrandRegister.css";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { isValidPhoneNumber } from "libphonenumber-js";









// Dialog Components
const SuccessDialog = ({ isOpen, onClose, title, message, buttonText, onButtonClick }) => {
  if (!isOpen) return null;

  return (
    <div className="brand-dialog-overlay">
      <div className="brand-dialog">
        <div className="brand-dialog-success-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="brand-dialog-title">{title}</h3>
        <p className="brand-dialog-message">{message}</p>
        <div className="brand-dialog-actions">
          <button 
            className="brand-dialog-btn brand-dialog-btn-primary"
            onClick={onButtonClick}
          >
            {buttonText}
          </button>
          <button 
            className="brand-dialog-btn brand-dialog-btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm, companyName }) => {
  if (!isOpen) return null;

  return (
    <div className="brand-dialog-overlay">
      <div className="brand-dialog brand-dialog-danger">
        <div className="brand-dialog-warning-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.3397 16C2.56994 17.3333 3.53216 19 5.07183 19Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="brand-dialog-title">Delete Brand Profile</h3>
        <div className="brand-dialog-danger-content">
          <p className="brand-dialog-message">
            Are you sure you want to delete <strong>"{companyName}"</strong> profile?
          </p>
          <div className="brand-dialog-risks">
            <h4>This action cannot be undone and will permanently:</h4>
            <ul>
              <li>Delete all your brand information</li>
              <li>Remove your profile from search results</li>
              <li>Cancel any ongoing collaborations</li>
              <li>Delete your brand assets and images</li>
              <li>Remove your social media connections</li>
            </ul>
          </div>
        </div>
        <div className="brand-dialog-actions">
          <button 
            className="brand-dialog-btn brand-dialog-btn-danger"
            onClick={onConfirm}
          >
            Yes, Delete Permanently
          </button>
          <button 
            className="brand-dialog-btn brand-dialog-btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const CATEGORY_OPTIONS = [
  "Fashion", "Tech", "Fitness", "Food", "Travel", "Lifestyle",
  "Beauty", "Automobile", "Education", "Finance", "Health", "Entertainment",
];

const SOCIAL_PLATFORMS = ["Instagram", "YouTube", "LinkedIn", "Facebook", "Twitter", "TikTok"];

const STEPS = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Business Details" },
  { id: 3, label: "Social Media" },
  { id: 4, label: "Brand Assets" },
  { id: 5, label: "Review" }
];

const BrandRegister = () => {
  const { token , user, refreshProfileStatus, refreshProfileImage } = useContext(AuthContext);
  const navigate = useNavigate();


  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    company_name: "",
    contact_person_name: "",
    // email: "",
    phone_number: "",
    website: "",
    location: "",
    categories: [],
    social_links: {},
    target_audience: "",
    bio: "",
    logo: null,
    bg_image: null,
  });

  const detectLocation = () => {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    const data = await res.json();
    setForm((prev) => ({
      ...prev,
      location: `${data.address.city || data.address.town}, ${data.address.country}`,
    }));
  });
};

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [bgPreview, setBgPreview] = useState(null);
  const [phoneError, setPhoneError] = useState("");
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

  if (typeof value === "string" && value.startsWith("/static/")) {
    return `${API_BASE_URL}${value}`;
  }

  return `${API_BASE_URL}/profiles/image/${value}`;
};


  // Fetch current brand profile
  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await profileAPI.getMyProfile(token);
        if (res.type === "brand" && res.profile) {
          const p = res.profile;
          setProfile(p);
          setIsEditing(true);
          setForm({
            company_name: p.company_name || "",
            contact_person_name: p.contact_person_name || "",
            // email: p.email || "",
            phone_number: p.phone_number || "",
            website: p.website || "",
            location: p.location || "",
            categories: p.categories || [],
            social_links: p.social_links || {},
            target_audience: p.target_audience || "",
            bio: p.bio || "",
            logo: null,
            bg_image: null,
          });
          if (p.logo) setLogoPreview(getImageUrl(p.logo));
          if (p.bg_image) setBgPreview(getImageUrl(p.bg_image));
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);


  const searchLocation = async (query) => {
  if (!query || query.length < 3) {
    setLocationSuggestions([]);
    return;
  }

  try {
    setLocationLoading(true);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`
    );

    const data = await res.json();
    setLocationSuggestions(data);
  } catch (err) {
    console.error("Location search failed", err);
  } finally {
    setLocationLoading(false);
  }
};


  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    if (files && files[0]) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
      if (name === "logo") setLogoPreview(URL.createObjectURL(files[0]));
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

  const canProceedStep1 = () => {
  return (
    form.company_name.trim() !== "" &&
    form.contact_person_name.trim() !== ""
  );
};

const canProceedStep2 = () => {
  return (
    form.location.trim() !== "" &&
    form.categories.length > 0
  );
};

const isTenDigitIndianNumber = (value) => {
  const digitsOnly = value.replace(/\D/g, "");
  return digitsOnly.length === 10;
};





 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!token) return setMessage("You must be logged in!");
  if (phoneError) {
    setMessage("Please fix the phone number before submitting");
    return;
  }
  if (!form.phone_number) {
    setMessage("Phone number is required");
    return;
  }

  setSubmitting(true);
  setMessage("");

  try {
    // Create FormData object
    const formData = new FormData();
    
    // Add basic fields
    if (form.company_name) formData.append('company_name', form.company_name);
    if (form.contact_person_name) formData.append('contact_person_name', form.contact_person_name);
    if (form.phone_number) formData.append('phone_number', form.phone_number);
    if (form.website) formData.append('website', form.website);
    if (form.location) formData.append('location', form.location);
    if (form.target_audience) formData.append('target_audience', form.target_audience);
    if (form.bio) formData.append('bio', form.bio);
    
    // Add categories as comma-separated string
    if (form.categories && form.categories.length > 0) {
      formData.append('categories', form.categories.join(','));
    }
    
    // Add social links
    Object.entries(form.social_links || {}).forEach(([platform, url]) => {
      if (url && url.trim() !== '') {
        formData.append(platform.toLowerCase(), url);
      }
    });
    
    // Add files
    if (form.logo && form.logo instanceof File) {
      formData.append('logo', form.logo);
    }
    
    if (form.bg_image && form.bg_image instanceof File) {
      formData.append('bg_image', form.bg_image);
    }

    let res;

    // ✅ SINGLE API CALL with proper FormData
    if (isEditing) {
      res = await profileAPI.updateProfile("brand", formData, token);
      setProfile(res.profile);
    } else {
      res = await profileAPI.createProfile("brand", formData, token);
      setProfile(res.profile);
      setIsEditing(true);
    }

    // 🔁 RE-CHECK PROFILE COMPLETION
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
    setMessage(err.message || "Error saving profile. Please try again.");
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
      await profileAPI.deleteProfile("brand", token);
      setProfile(null);
      setForm({
        company_name: "",
        contact_person_name: "",
        // email: "",
        phone_number: "",
        website: "",
        location: "",
        categories: [],
        social_links: {},
        target_audience: "",
        bio: "",
        logo: null,
        bg_image: null,
      });
      setLogoPreview(null);
      setBgPreview(null);
      setIsEditing(false);
      setCurrentStep(1);
      setShowDeleteDialog(false);
      
      // Show success dialog for deletion
      setSuccessDialogConfig({
        title: "Profile Deleted Successfully",
        message: "Your brand profile has been permanently deleted. All associated data has been removed from our system.",
        buttonText: "Create New Profile",
        onButtonClick: () => navigate("/brand/register")

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
      // <div className="brand-register-pro">
      //   <div className="brand-register-loading-full">
      //     <div className="brand-register-loading-spinner"></div>
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
    <div className="brand-register-pro">
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
        companyName={form.company_name}
      />

      <div className="brand-register-header">
        <h1 className="brand-register-title">
          {isEditing ? "Update Brand Profile" : "Create Brand Profile"}
        </h1>
        <p className="brand-register-subtitle">
          {isEditing 
            ? "Update your brand information and reach more influencers" 
            : "Complete your brand profile to start collaborating with influencers"
          }
        </p>
      </div>

      {message && (
        <div className={`brand-register-message ${message.includes("Error") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      {/* Progress Steps */}
      <div className="brand-register-progress">
        <div className="brand-register-progress-line"></div>
        <div 
          className="brand-register-progress-line-active"
          style={{ width: `${progressPercentage}%` }}
        ></div>
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={`brand-register-step ${
              currentStep > step.id ? "completed" : currentStep === step.id ? "active" : ""
            }`}
          >
            <div className="brand-register-step-circle">
              {currentStep > step.id ? "✓" : step.id}
            </div>
            <div className="brand-register-step-label">{step.label}</div>
          </div>
        ))}
      </div>

      {/* Form Container */}
      <div className="brand-register-form-container">
        <form onSubmit={handleSubmit} className="brand-register-form-content">
          
          {/* Step 1: Basic Information */}
          <div className={`brand-register-form-step ${currentStep === 1 ? "active" : ""}`}>
            <div className="brand-register-form-grid">
              <div className="brand-register-form-grid-2">
                <div className="brand-register-form-group">
                  <label className="brand-register-form-label">Company Name *</label>
                  <input
                    type="text"
                    className="brand-register-form-input"
                    placeholder="Enter company name"
                    value={form.company_name}
                    onChange={(e) => setForm(prev => ({...prev, company_name: e.target.value}))}
                    required
                  />
                </div>
                <div className="brand-register-form-group">
                  <label className="brand-register-form-label">Contact Person *</label>
                  <input
                    type="text"
                    className="brand-register-form-input"
                    placeholder="Contact person name"
                    value={form.contact_person_name}
                    onChange={(e) => setForm(prev => ({...prev, contact_person_name: e.target.value}))}
                    required
                  />
                </div>
              </div>

              <div className="brand-register-form-grid-2">
                <div className="brand-register-form-group">
  <label className="brand-register-form-label">Email *</label>
 <input
  type="email"
  className="brand-register-form-input"
  value={user?.email || ""}
  disabled
/>

  <small className="field-hint">
    Email is linked to your account and cannot be changed.
  </small>
</div>

              <div className="brand-register-form-group">
  <label className="brand-register-form-label">Phone Number *</label>

  <div className="brand-phone-wrapper">
    <PhoneInput
      country="in"
      required
      value={form.phone_number}
      onChange={(value, country, e, formattedValue) => {
        // Use formattedValue which includes country code
        setForm((prev) => ({ ...prev, phone_number: formattedValue || value }));
        
        // Validate
        const phoneStr = formattedValue || value;
        if (!phoneStr) {
          setPhoneError("Phone number is required");
        } else if (!isValidPhoneNumber(phoneStr)) {
          setPhoneError("Please enter a valid phone number");
        } else {
          setPhoneError("");
        }
      }}
      inputClass="brand-register-form-input brand-phone-input"
      containerClass="brand-phone-container"
      buttonClass="brand-phone-flag"
      specialLabel=""
    />
  </div>

  {phoneError && (
    <small className="brand-field-error">{phoneError}</small>
  )}
</div>

              </div>
            </div>
          </div>

          {/* Step 2: Business Details */}
          <div className={`brand-register-form-step ${currentStep === 2 ? "active" : ""}`}>
            <div className="brand-register-form-grid">
              <div className="brand-register-form-grid-2">
                <div className="brand-register-form-group">
                  <label className="brand-register-form-label">Website</label>
                  <input
                    type="url"
                    className="brand-register-form-input"
                    placeholder="https://example.com"
                    value={form.website}
                    onChange={(e) => setForm(prev => ({...prev, website: e.target.value}))}
                  />
                </div>
                <div className="brand-register-form-group">
  <label className="brand-register-form-label">Location</label>

  <div className="brand-input-with-action">
    <input
      type="text"
      className="brand-register-form-input"
      placeholder="City, Country"
      value={form.location}
      onChange={(e) => {
        const value = e.target.value;
        setForm((prev) => ({ ...prev, location: value }));
        searchLocation(value);
      }}
    />

    <button
      type="button"
      className="brand-input-action-btn"
      onClick={detectLocation}
      title="Detect my location"
    >
      Detect
    </button>
  </div>

  {locationLoading && (
    <small className="brand-field-hint">Detecting location…</small>
  )}

  {locationSuggestions.length > 0 && (
    <ul className="brand-location-suggestions">
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

              <div className="brand-register-form-group">
                <label className="brand-register-form-label">Categories</label>

<div className="brand-register-checkbox-grid">
  {CATEGORY_OPTIONS.map((category) => (
    <label key={category} className="brand-register-checkbox">
      <input
        type="checkbox"
        value={category}
        checked={form.categories.includes(category)}
        onChange={(e) => {
          const checked = e.target.checked;

          setForm((prev) => ({
            ...prev,
            categories: checked
              ? [...prev.categories, category]
              : prev.categories.filter((c) => c !== category),
          }));
        }}
      />
      <span>{category}</span>
    </label>
  ))}
</div>

                {/* <small className="brand-register-file-hint">
                  Hold Ctrl (Windows) or Cmd (Mac) to select multiple categories
                </small> */}
              </div>

              <div className="brand-register-form-group">
                <label className="brand-register-form-label">Target Audience Size</label>
                <input
                  type="number"
                  className="brand-register-form-input"
                  placeholder="e.g., 10000"
                  value={form.target_audience || ""}
                  onChange={handleChange}
                  name="target_audience"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Social Media */}
          <div className={`brand-register-form-step ${currentStep === 3 ? "active" : ""}`}>
            <div className="brand-register-form-grid">
              <div className="brand-register-social-grid">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <div key={platform} className="brand-register-form-group">
                    <label className="brand-register-form-label">{platform}</label>
                    <input
                      type="url"
                      className="brand-register-form-input brand-register-social-input"
                      placeholder={`https://${platform.toLowerCase()}.com/yourprofile`}
                      value={form.social_links[platform.toLowerCase()] || ""}
                      onChange={(e) => handleSocialChange(platform, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 4: Brand Assets */}
          <div className={`brand-register-form-step ${currentStep === 4 ? "active" : ""}`}>
            <div className="brand-register-form-grid">
              <div className="brand-register-form-grid-2">
                <div className="brand-register-form-group">
                  <label className="brand-register-form-label">Company Logo</label>
                  <div className="brand-register-file-upload">
                    <input
                      type="file"
                      className="brand-register-form-input"
                      accept="image/*"
                      onChange={handleChange}
                      name="logo"
                      style={{ display: 'none' }}
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload">
                      <div className="brand-register-file-text">
                        {form.logo ? "Change Logo" : "Upload Logo"}
                      </div>
                      <div className="brand-register-file-hint">
                        Recommended: 500x500px, PNG or JPG
                      </div>
                    </label>
                  </div>
                  {logoPreview && (
                    <div className="brand-register-image-previews">
                      <div className="brand-register-image-preview">
                        <img src={logoPreview} alt="Logo preview" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="brand-register-form-group">
                  <label className="brand-register-form-label">Background Image</label>
                  <div className="brand-register-file-upload">
                    <input
                      type="file"
                      className="brand-register-form-input"
                      accept="image/*"
                      onChange={handleChange}
                      name="bg_image"
                      style={{ display: 'none' }}
                      id="bg-upload"
                    />
                    <label htmlFor="bg-upload">
                      <div className="brand-register-file-text">
                        {form.bg_image ? "Change Background" : "Upload Background"}
                      </div>
                      <div className="brand-register-file-hint">
                        Recommended: 1200x600px, PNG or JPG
                      </div>
                    </label>
                  </div>
                  {bgPreview && (
                    <div className="brand-register-image-previews">
                      <div className="brand-register-image-preview">
                        <img src={bgPreview} alt="Background preview" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="brand-register-form-group">
                <label className="brand-register-form-label">About Your Company</label>
                <textarea
                  className="brand-register-form-textarea"
                  placeholder="Tell us about your company, mission, and what makes you unique..."
                  value={form.bio}
                  onChange={handleChange}
                  name="bio"
                  rows="4"
                />
              </div>
            </div>
          </div>

          {/* Step 5: Review */}
          <div className={`brand-register-form-step ${currentStep === 5 ? "active" : ""}`}>
            <div className="brand-register-form-grid">
              <div className="brand-register-form-group">
                <h3 className="brand-register-review-title">Review Your Information</h3>
                
                <div className="brand-register-form-grid-2">
                  <div className="brand-register-review-section">
                    <h4 className="brand-register-review-section-title">Basic Information</h4>
                    <p><strong>Company:</strong> {form.company_name}</p>
                    <p><strong>Contact:</strong> {form.contact_person_name}</p>
                    <p><strong>Email:</strong> {user.email}</p>

                    <p><strong>Phone:</strong> {form.phone_number || 'Not provided'}</p>
                  </div>
                  
                  <div className="brand-register-review-section">
                    <h4 className="brand-register-review-section-title">Business Details</h4>
                    <p><strong>Website:</strong> {form.website || 'Not provided'}</p>
                    <p><strong>Location:</strong> {form.location || 'Not provided'}</p>
                    <p><strong>Target Audience:</strong> {form.target_audience ? form.target_audience.toLocaleString() : 'Not specified'}</p>
                    <p><strong>Categories:</strong> {form.categories.join(', ') || 'None selected'}</p>
                  </div>
                </div>

                {form.bio && (
                  <div className="brand-register-review-section">
                    <h4 className="brand-register-review-section-title">About</h4>
                    <p>{form.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="brand-register-nav-buttons">
            {currentStep > 1 && (
              <button
                type="button"
                className="brand-register-btn brand-register-btn-prev"
                onClick={prevStep}
                disabled={submitting}
              >
                ← Previous
              </button>
            )}
            
            {currentStep < STEPS.length ? (
              <button
  type="button"
  className="brand-register-btn brand-register-btn-next"
  onClick={nextStep}
  disabled={
    (currentStep === 1 && (!canProceedStep1() || phoneError || form.phone_number === "")) ||
    (currentStep === 2 && !canProceedStep2())
  }
>
  Next →
</button>

            ) : (
              <button
                type="submit"
                className="brand-register-btn brand-register-btn-submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="brand-register-loading"></div>
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
            className="brand-register-delete-btn"
            type="button"
          >
            Delete Profile
          </button>
          
          <div className="brand-register-action-buttons">
            <button
              type="button"
              className="brand-register-action-btn"
              onClick={() => navigate('/brand/me')}
            >
              View My Profile
            </button>
            <button
              type="button"
              className="brand-register-action-btn"
              onClick={() => navigate('/brand/profiles/public')}
            >
              Public Profiles
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BrandRegister;