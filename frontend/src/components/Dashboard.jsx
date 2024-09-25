import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import HomePage from './HomePage.jsx';
import Sidebar from './Sidebar.jsx'; // Import the Sidebar component

const Dashboard = () => {
  const [user, setUser] = useState({ name: '' });
  const [showProfileDropdown, setShowProfileDropdown] = useState(false); // State for the profile dropdown
  const navigate = useNavigate();
  const dropdownRef = useRef(null); // Ref for the dropdown

  // Fetch the user's profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the token from localStorage
        if (!token) {
          navigate('/login'); // If no token, redirect to login
          return; // Ensure function exits after navigation
        }

        const response = await axios.get('http://localhost:5000/profile', {
          headers: {
            Authorization: `Bearer ${token}` // Attach the JWT token
          }
        });

        setUser(response.data); // Assuming response contains { name: 'User Name' }
      } catch (error) {
        console.error(error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token'); // If unauthorized, remove token
          navigate('/login'); // Redirect to login
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the JWT from localStorage
    navigate('/login'); // Redirect to login page
  };

  // Handle view profile navigation
  const handleViewProfile = () => {
    navigate('/profile'); // Assuming you have a profile route
  };

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setShowProfileDropdown((prev) => !prev);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        showProfileDropdown={showProfileDropdown} // Pass the dropdown state
        toggleDropdown={toggleProfileDropdown} // Pass the toggle function
        handleLogout={handleLogout} 
        handleViewProfile={handleViewProfile} 
        profileRef={dropdownRef} // Pass the ref to Sidebar
      />

      {/* Main content */}
      <div className="flex-grow bg-blue-50">
        <HomePage />
      </div>
    </div>
  );
};

export default Dashboard;
