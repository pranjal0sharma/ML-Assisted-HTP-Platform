import React from 'react';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const { user } = useAuth();
  return (
    <div>
      <h1>Welcome to the Design for Social Innovation Platform</h1>
      {user ? (
        <p>You are logged in. Navigate to your dashboard using the links or by re-logging in.</p>
      ) : (
        <p>Please log in to continue.</p>
      )}
    </div>
  );
}

export default HomePage;