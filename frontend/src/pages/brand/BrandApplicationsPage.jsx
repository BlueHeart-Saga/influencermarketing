import React, { useState, useEffect } from 'react';
import BrandApplications from './BrandApplications';
import { campaignAPI } from '../../services/api';

const BrandApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch applications on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await campaignAPI.getBrandApplications();
      
      // ✅ Ensure we always have an array, even if API returns undefined
      const appsData = response.data || [];
      setApplications(Array.isArray(appsData) ? appsData : []);
      
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationUpdate = () => {
    // Refresh the applications list after an update
    fetchApplications();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading applications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button 
          onClick={fetchApplications}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ✅ Pass the applications array (never undefined) */}
      <BrandApplications 
        applications={applications} 
        onApplicationUpdate={handleApplicationUpdate}
      />
    </div>
  );
};

export default BrandApplicationsPage;