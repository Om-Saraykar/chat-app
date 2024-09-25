import React, { useState } from 'react';
import { FiHome, FiSettings, FiFileText, FiMenu, FiX } from 'react-icons/fi';

const Sidebar = ({ user, toggleDropdown, showProfileDropdown, profileRef, handleViewProfile, handleLogout }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const iconSize = 30;

  return (
    <div
      className={`bg-blue-100 text-blue-900 h-screen flex flex-col shadow-md transition-all duration-[500ms] ease-linear ${isExpanded ? 'w-60' : 'w-16'}`}
    >
      <div className="flex items-center justify-between p-4 bg-blue-200">
        {isExpanded && <span className="font-bold text-xl whitespace-nowrap">Chat App</span>}
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-900">
          {isExpanded ? <FiX size={iconSize} /> : <FiMenu size={iconSize} />}
        </button>
      </div>

      <ul className="flex-grow flex flex-col mt-7 gap-7">
        <li className="relative group px-4 py-4 flex items-center cursor-pointer transition-all duration-300 hover:scale-105">
          <div className="flex items-center" style={{ width: '40px' }}>
            <FiHome size={iconSize} />
          </div>
          <span className={`transition-transform duration-300 ${isExpanded ? 'translate-x-0 opacity-100' : 'translate-x-[-10px] opacity-0 pointer-events-none'} whitespace-nowrap`}>
            Home
          </span>
          {/* Tooltip for collapsed state */}
          {!isExpanded && (
            <span className="absolute left-14 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Home
            </span>
          )}
        </li>

        <li className="relative group px-4 py-4 flex items-center cursor-pointer transition-all duration-500 hover:scale-105">
          <div className="flex items-center" style={{ width: '40px' }}>
            <FiSettings size={iconSize} />
          </div>
          <span className={`transition-transform duration-300 ${isExpanded ? 'translate-x-0 opacity-100' : 'translate-x-[-10px] opacity-0 pointer-events-none'} whitespace-nowrap`}>
            Settings
          </span>
          {!isExpanded && (
            <span className="absolute left-14 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Settings
            </span>
          )}
        </li>

        <li className="relative group px-4 py-4 flex items-center cursor-pointer transition-all duration-500 hover:scale-105">
          <div className="flex items-center" style={{ width: '40px' }}>
            <FiFileText size={iconSize} />
          </div>
          <span className={`transition-transform duration-500 ${isExpanded ? 'translate-x-0 opacity-100' : 'translate-x-[-10px] opacity-0 pointer-events-none'} whitespace-nowrap`}>
            Reports
          </span>
          {!isExpanded && (
            <span className="absolute left-14 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Reports
            </span>
          )}
        </li>
      </ul>

      <div className="relative px-4 py-5 border-t border-blue-200" ref={profileRef}>
        <div className="flex items-center gap-2 cursor-pointer justify-start" onClick={toggleDropdown}>
          <img
            className={`w-8 h-8 rounded-full border-2 border-blue-400 transition-all duration-500 ${isExpanded ? 'ml-0' : ''}`}
            src="profile-picture.jpg"
            alt="Profile"
            onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
          />
          {isExpanded && <span className="whitespace-nowrap">{user.name}</span>}
        </div>

        {showProfileDropdown && (
          <div className="absolute bottom-14 left-4 bg-white text-blue-900 shadow-lg rounded p-2 w-48 z-10">
            <button
              className="block w-full text-left px-4 py-2 hover:bg-blue-50"
              onClick={handleViewProfile}
            >
              View Profile
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-50 hover:text-red-500"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
