import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [messageStatus, setMessageStatus] = useState(null);

  const handleCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      try {
        // Exchange code for access token
        const tokenResponse = await axios.post(
          'https://api.line.me/oauth2/v2.1/token',
          new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: 'https://f4d0-43-216-7-255.ngrok-free.app/callback',
            client_id: '2006745135',
            client_secret: 'da67e14483a37d49df638d32c7640613',
          }),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          }
        );

        const accessToken = tokenResponse.data.access_token;
        
        // Get user profile
        const profileResponse = await axios.get('https://api.line.me/v2/profile', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        setUserProfile(profileResponse.data);

        // Send welcome message
        try {
          const messageResponse = await axios.post('http://localhost:3100/send-message', {
            userId: profileResponse.data.userId,
            message: 'Welcome to our service! 🎉'
          });
          
          setMessageStatus({ type: 'success', message: 'Welcome message sent!' });
        } catch (messageError) {
          console.error('Failed to send welcome message:', messageError);
          setMessageStatus({ type: 'error', message: 'Failed to send welcome message' });
        }

      } catch (error) {
        console.error('Error during LINE login process:', error);
        setMessageStatus({ type: 'error', message: 'Login process failed' });
      }
    }
  };

  useEffect(() => {
    if (window.location.pathname === '/callback') {
      handleCallback();
    }
  }, []);

  return (
    <div>
      <h1>LINE Login Example</h1>
      {messageStatus && (
        <div style={{ 
          padding: '10px', 
          margin: '10px 0',
          backgroundColor: messageStatus.type === 'success' ? '#d4edda' : '#f8d7da',
          color: messageStatus.type === 'success' ? '#155724' : '#721c24',
          borderRadius: '4px'
        }}>
          {messageStatus.message}
        </div>
      )}
      {userProfile ? (
        <div>
          <h2>Welcome, {userProfile.displayName}!</h2>
          <img 
            src={userProfile.pictureUrl} 
            alt="Profile" 
            style={{ borderRadius: '50%' }} 
          />
        </div>
      ) : (
          <button onClick={() => window.location.href = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=2006745135&redirect_uri=${encodeURIComponent('https://f4d0-43-216-7-255.ngrok-free.app/callback')}&state=random_csrf_token&scope=profile`}>
          Connect with LINE
        </button>
      )}
    </div>
  );
};
export default App;
