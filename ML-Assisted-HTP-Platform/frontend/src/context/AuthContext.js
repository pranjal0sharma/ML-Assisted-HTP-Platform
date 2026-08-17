import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // The interceptor will add the token to the header automatically
          const { data } = await api.getMe();
          setUser(data); // Set user data from the backend response
        } catch (error) {
          // Token is invalid or expired, so clear it
          console.error("Session verification failed:", error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false); // Stop loading once the check is complete
    };

    verifyUser();
  }, []); // The empty dependency array ensures this runs only once on mount

  const login = async (formData) => {
    try {
      const { data } = await api.login(formData);
      // The user object from login doesn't have the ID with an underscore
      // Let's store the user object returned from the login response
      localStorage.setItem('user', JSON.stringify(data.user)); 
      localStorage.setItem('token', data.token);
      setUser(data.user);
      
      // Redirect based on role
      switch (data.user.role) {
        case 'Admin':
          navigate('/admin');
          break;
        case 'Assessor':
          navigate('/assessor');
          break;
        case 'Uploader':
          navigate('/uploader');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // Pass down the loading state so other components can use it
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}> 
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);