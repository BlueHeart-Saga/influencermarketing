import React from 'react';

const ProfileCompletionIndicator = ({ progress, isComplete, details }) => {
  return (
    <div className="profile-completion-indicator">
      <div className="completion-header">
        <h4>Profile Completion</h4>
        <span className="completion-percentage">{progress}%</span>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {!isComplete && details && (
        <div className="missing-fields">
          <p className="missing-title">To complete your profile:</p>
          <ul className="missing-list">
            {!details.company_name && <li>Add company name</li>}
            {!details.contact_person_name && <li>Add contact person</li>}
            {!details.phone_number && <li>Add phone number</li>}
            {!details.location && <li>Add location</li>}
            {!details.categories && <li>Add at least one category</li>}
            {!details.logo && <li>Upload a logo</li>}
            {!details.bio && <li>Add a bio</li>}
            {/* Add similar for influencer */}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionIndicator;