// components/DebugAuth.jsx
import React, { useEffect } from 'react';
import { debugAuth, validateToken } from '../services/api';

const DebugAuth = () => {
  useEffect(() => {
    const checkAuth = async () => {
      console.log('=== AUTH DEBUG INFO ===');
      console.log('LocalStorage contents:', {
        access_token: localStorage.getItem('access_token'),
        user: localStorage.getItem('user')
      });
      
      console.log('Debug auth info:', debugAuth());
      
      // Validate token with server
      const isValid = await validateToken();
      console.log('Token validation result:', isValid);
      
      console.log('Current URL:', window.location.href);
      console.log('========================');
    };

    checkAuth();
  }, []);

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', margin: '10px', borderRadius: '5px' }}>
      <h3>Authentication Debug</h3>
      <p>Check browser console for detailed authentication information.</p>
      <button onClick={() => window.location.reload()}>Refresh Page</button>
      <button onClick={() => {
        localStorage.clear();
        console.log('LocalStorage cleared');
      }}>Clear Storage</button>
    </div>
  );
};

export default DebugAuth;