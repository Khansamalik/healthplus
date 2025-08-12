import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { 
  FaUser, 
  FaChevronDown, 
  FaBell, 
  FaUserCircle,
  FaSignOutAlt,
  FaNotesMedical,
  FaExclamationTriangle,
  FaCog,
  FaCrown,
  FaQrcode,
  FaMapMarkerAlt,
  FaFileUpload,
  FaHome,
  FaInfoCircle,
  FaPhone
} from "react-icons/fa";
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // const [profileDropdown, setProfileDropdown] = useState(false);
  const { isAuthenticated, isPremium, premiumPlan, logout } = useAuth(); // Get auth state and premium status
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth immediately and move to login
    logout();
    setIsOpen(false);
    setDropdownOpen(false);
    navigate('/login', { replace: true });
  };

  // Close any open menus when auth state changes (prevents stale UI)
  useEffect(() => {
    if (!isAuthenticated) {
      setIsOpen(false);
      setDropdownOpen(false);
    }
  }, [isAuthenticated]);

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          
          {/* Logo links to home or dashboard based on auth */}
          <Link to={isAuthenticated ? (isPremium ? "/pro" : "/") : "/"} className="flex-shrink-0 flex items-center">
            <img
              src="/logo.png"
              alt="SehatPlus Logo"
              className="h-20 w-20 object-contain" 
            />
            <span className="ml-4 text-3xl font-bold text-[#6C0B14]">SehatPlus</span> 
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            {isAuthenticated ? (
              // Premium User Navigation
              isPremium ? (
                <>
                  <Link 
                    to="/pro" 
                    className="flex items-center text-lg text-gray-800 hover:text-[#A0153E] px-3 py-2 font-medium"
                  >
                    <FaHome className="mr-2" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/upload-report" 
                    className="flex items-center text-lg text-gray-800 hover:text-[#A0153E] px-3 py-2 font-medium"
                  >
                    <FaFileUpload className="mr-2" />
                    Medical Records
                  </Link>
                  <Link 
                    to="/emergency-patient" 
                    className="flex items-center text-lg text-gray-800 hover:text-[#A0153E] px-3 py-2 font-medium"
                  >
                    <FaExclamationTriangle className="mr-2" />
                    Emergency Setup
                  </Link>
              
                
                </>
              ) : (
                // Free User Navigation
                <>
                  <Link 
                    to="/pro" 
                    className="flex items-center text-lg text-gray-800 hover:text-[#A0153E] px-3 py-2 font-medium"
                  >
                    <FaHome className="mr-2" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/map" 
                    className="flex items-center text-lg text-gray-800 hover:text-[#A0153E] px-3 py-2 font-medium"
                  >
                    <FaInfoCircle className="mr-2" />
                    Find Hospitals
                  </Link>
                  <div className="relative">
                    <button 
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center text-lg text-gray-800 hover:text-[#A0153E] px-3 py-2 font-medium"
                    >
                      <FaCrown className="mr-2" />
                      Premium <FaChevronDown className="ml-1 text-sm" />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        <Link
                          to="/premium"
                          className="block px-4 py-2 text-gray-800 hover:bg-[#F8F4EC]"
                        >
                          Features
                        </Link>
                        <Link
                          to="/premium"
                          className="block px-4 py-2 text-gray-800 hover:bg-[#F8F4EC]"
                        >
                          Pricing
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )
            ) : (
              // Non-authenticated User Navigation
              <>
                <Link 
                  to="/" 
                  className="text-lg text-gray-800 hover:text-[#A0153E] px-3 py-2 font-medium"
                >
                  Home
                </Link>
                <Link 
                  to="/about" 
                  className="text-lg text-gray-800 hover:text-[#A0153E] px-3 py-2 font-medium"
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  className="text-lg text-gray-800 hover:text-[#A0153E] px-3 py-2 font-medium"
                >
                  Contact
                </Link>
              </>
            )}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              // Premium User Right Side
              isPremium ? (
                <>
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1 rounded-full">
                    <FaCrown className="text-yellow-800" />
                    <span className="text-yellow-800 font-semibold text-sm">
                      {premiumPlan === 'pro' ? 'Pro Care' : 'Annual'} Plan
                    </span>
                  </div>
                  
                  <Link 
                    to="/notifications"
                    className="p-2 text-gray-800 hover:text-[#A0153E] relative"
                  >
                    <FaBell className="text-xl" />
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                  </Link>
                  
                  <div className="relative">
                    <button 
                      onClick={() => navigate('/profile')}
                      className="flex items-center space-x-2 text-lg text-gray-800 hover:text-[#A0153E] px-3 py-2 font-medium"
                    >
                      <FaUserCircle className="text-2xl" />
                      <span>Profile</span>
                      
                    </button>
                    
                    
                    {/* {profileDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        <div className="px-4 py-2 text-sm text-gray-500 border-b">
                          Premium User
                        </div>
                        <Link
                          to="/pro"
                          className="flex items-center px-4 py-2 text-gray-800 hover:bg-[#F8F4EC]"
                        >
                          <FaHome className="mr-2" />
                          Dashboard
                        </Link>
                        <button
                          className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-[#F8F4EC]"
                          onClick={() => {
                            logout();
                            navigate('/login');
                          }}
                        >
                          <FaSignOutAlt className="mr-2" />
                          Logout
                        </button>
                      </div>
                    )} */}
                  </div>
                </>
              ) : (
                // Free User Right Side
                <>
                  <Link 
                    to="/premium"
                    className="flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-800 font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all"
                  >
                    <FaCrown className="mr-2" />
                    Upgrade to Premium
                  </Link>
                  
                  <div className="relative">
                    <button 
                      onClick={() => navigate('/profile')}
                      className="flex items-center space-x-2 text-lg text-gray-800 hover:text-[#A0153E] px-3 py-2 font-medium"
                    >
                      <FaUserCircle className="text-2xl" />
                      <span>Profile</span>
                    </button>
                    
                    
                    {/* {profileDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        <div className="px-4 py-2 text-sm text-gray-500 border-b">
                          Free User
                        </div>
                        <Link
                          to="/premium"
                          className="flex items-center px-4 py-2 text-gray-800 hover:bg-[#F8F4EC]"
                        >
                          <FaCrown className="mr-2" />
                          Upgrade to Premium
                        </Link>
                        <button
                          className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-[#F8F4EC]"
                          onClick={logout}
                        >
                          <FaSignOutAlt className="mr-2" />
                          Logout
                        </button>
                      </div>
                    )} */}
                  </div>
                </>
              )
            ) : (
              // Non-authenticated User Right Side
              <>
                <Link 
                  to="/register"
                  className="px-8 py-3 rounded-full text-lg font-medium border-2 border-[#6C0B14] text-[#6C0B14] hover:bg-[#6C0B14] hover:text-white transition-all"
                >
                  Get Started
                </Link>
                <Link 
                  to="/login"
                  className="flex items-center px-8 py-3 rounded-full bg-[#6C0B14] text-white text-lg font-medium hover:bg-[#8a0f1a] transition-all"
                >
                  <FaUser className="mr-2" />
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#6C0B14] hover:text-[#8a0f1a] focus:outline-none"
              aria-label="Menu"
            >
              <svg
                className="h-8 w-8"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-white shadow-xl`}>
        <div className="px-4 pt-4 pb-6 space-y-4">
          {isAuthenticated ? (
            // Premium User Mobile Menu
            isPremium ? (
              <>
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1 rounded-full">
                    <FaCrown className="text-yellow-800" />
                    <span className="text-yellow-800 font-semibold text-sm">
                      {premiumPlan === 'pro' ? 'Pro Care' : 'Annual'} Plan
                    </span>
                  </div>
                </div>
                
                <Link
                  to="/pro"
                  className="flex items-center px-4 py-3 rounded-lg text-lg font-medium text-gray-800 hover:text-[#A0153E] hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaHome className="mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/upload-report"
                  className="flex items-center px-4 py-3 rounded-lg text-lg font-medium text-gray-800 hover:text-[#A0153E] hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaFileUpload className="mr-2" />
                  Medical Records
                </Link>
                <Link
                  to="/emergency-patient"
                  className="flex items-center px-4 py-3 rounded-lg text-lg font-medium text-gray-800 hover:text-[#A0153E] hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaExclamationTriangle className="mr-2" />
                  Emergency Setup
                </Link>
                <Link
                  to="/ice-card"
                  className="flex items-center px-4 py-3 rounded-lg text-lg font-medium text-gray-800 hover:text-[#A0153E] hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaQrcode className="mr-2" />
                  ICE QR Card
                </Link>
                <Link
                  to="/map"
                  className="flex items-center px-4 py-3 rounded-lg text-lg font-medium text-gray-800 hover:text-[#A0153E] hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaMapMarkerAlt className="mr-2" />
                  Find Hospitals
                </Link>
                <Link
                  to="/alert"
                  className="flex items-center px-4 py-3 rounded-lg text-lg font-medium text-gray-800 hover:text-[#A0153E] hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaBell className="mr-2" />
                  Emergency Alert
                </Link>
                
                <div className="pt-4 pb-2 border-t border-gray-200 space-y-3">
                 <button 
                      onClick={() => navigate('/profile')}
                      className="flex items-center space-x-2 text-lg text-gray-800 hover:text-[#A0153E] px-3 py-2 font-medium"
                    >
                      <FaUserCircle className="text-2xl" />
                      <span>Profile</span>
                      
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-lg text-gray-800 hover:text-[#A0153E] px-3 py-2 font-medium"
                    >
                      <FaSignOutAlt className="text-2xl" />
                      <span>Logout</span>
                    </button>
                </div>
              </>
            ) : (
              // Free User Mobile Menu
              <>
                <Link
                  to="pro"
                  className="flex items-center px-4 py-3 rounded-lg text-lg font-medium text-gray-800 hover:text-[#A0153E] hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaHome className="mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/map"
                  className="flex items-center px-4 py-3 rounded-lg text-lg font-medium text-gray-800 hover:text-[#A0153E] hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaInfoCircle className="mr-2" />
                  Find Hospitals
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center px-4 py-3 rounded-lg text-lg font-medium text-gray-800 hover:text-[#A0153E] hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaPhone className="mr-2" />
                  Contact
                </Link>
                <Link
                  to="/premium"
                  className="flex items-center px-4 py-3 rounded-lg text-lg font-medium text-gray-800 hover:text-[#A0153E] hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaCrown className="mr-2" />
                  Upgrade to Premium
                </Link>
                
                <div className="pt-4 pb-2 border-t border-gray-200 space-y-3">
                  <button 
                      onClick={() => navigate('/profile')}
                      className="flex items-center space-x-2 text-lg text-gray-800 hover:text-[#A0153E] px-3 py-2 font-medium"
                    >
                      <FaUserCircle className="text-2xl" />
                      <span>Profile</span>
                      
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-lg text-gray-800 hover:text-[#A0153E] px-3 py-2 font-medium"
                    >
                      <FaSignOutAlt className="text-2xl" />
                      <span>Logout</span>
                    </button>
                </div>
              </>
            )
          ) : (
            // Non-authenticated User Mobile Menu
            <>
              <Link
                to="/"
                className="block px-4 py-3 rounded-lg text-lg font-medium text-gray-800 hover:text-[#A0153E] hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="block px-4 py-3 rounded-lg text-lg font-medium text-gray-800 hover:text-[#A0153E] hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block px-4 py-3 rounded-lg text-lg font-medium text-gray-800 hover:text-[#A0153E] hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>

              <div className="pt-4 pb-2 border-t border-gray-200 space-y-3">
                <Link
                  to="/register"
                  className="block w-full px-6 py-3 text-center rounded-full bg-[#6C0B14] text-white text-lg font-medium hover:bg-[#8a0f1a]"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center w-full px-6 py-3 text-center rounded-full border-2 border-[#6C0B14] text-[#6C0B14] text-lg font-medium hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUser className="mr-2" />
                  Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;