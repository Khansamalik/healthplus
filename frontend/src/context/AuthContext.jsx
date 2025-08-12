// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumPlan, setPremiumPlan] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Load auth state from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedPremiumStatus = localStorage.getItem('isPremium');
    const savedPremiumPlan = localStorage.getItem('premiumPlan');
    
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      console.log('Auth loaded from localStorage: Token exists');
    }
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
    
    if (savedPremiumStatus === 'true') {
      setIsPremium(true);
    }
    
    if (savedPremiumPlan) {
      setPremiumPlan(savedPremiumPlan);
    }
  }, []);

  // Keep auth state in sync across tabs/windows and after external changes
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'token') {
        const t = localStorage.getItem('token');
        if (t) {
          setToken(t);
          setIsAuthenticated(true);
        } else {
          // Token removed → fully logout in memory
          setIsAuthenticated(false);
          setIsPremium(false);
          setPremiumPlan(null);
          setUser(null);
          setToken(null);
        }
      }
      if (e.key === 'user') {
        const u = localStorage.getItem('user');
        setUser(u ? JSON.parse(u) : null);
      }
      if (e.key === 'isPremium' || e.key === 'premiumPlan') {
        const premium = localStorage.getItem('isPremium') === 'true';
        const plan = localStorage.getItem('premiumPlan') || null;
        setIsPremium(premium);
        setPremiumPlan(plan);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = (userData, authToken) => {
    setIsAuthenticated(true);
    setUser(userData);
    setToken(authToken);
    
    // Handle premium status from server response
    if (userData.premium) {
      setIsPremium(true);
      setPremiumPlan(userData.plan || 'pro');
      localStorage.setItem('isPremium', 'true');
      localStorage.setItem('premiumPlan', userData.plan || 'pro');
    } else {
      setIsPremium(false);
      setPremiumPlan(null);
      localStorage.removeItem('isPremium');
      localStorage.removeItem('premiumPlan');
    }
    
    // Save to localStorage
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    console.log('User logged in:', { userData, tokenExists: !!authToken, premium: userData.premium });
  };
  
  const logout = () => {
    setIsAuthenticated(false);
    setIsPremium(false);
    setPremiumPlan(null);
    setUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isPremium');
    localStorage.removeItem('premiumPlan');
    
    console.log('User logged out');
  };

  const upgradeToPremium = async (plan) => {
    try {
      // Call backend API to upgrade user in database
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch(`http://localhost:5000/api/profile/${userId}/premium`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upgrade to premium');
      }
      
      const result = await response.json();
      
      // Update local state
      setIsPremium(true);
      setPremiumPlan(plan);
      localStorage.setItem('isPremium', 'true');
      localStorage.setItem('premiumPlan', plan);
      
      // Update user data
      const updatedUser = { ...user, premium: true, plan };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Show success message
      alert(`Successfully upgraded to ${plan === 'pro' ? 'Pro Care' : 'Annual'} plan! You now have access to all premium features.`);
      
      return result;
    } catch (error) {
      console.error('Premium upgrade error:', error);
      alert('Failed to upgrade to premium. Please try again.');
      throw error;
    }
  };

  const downgradeToBasic = async () => {
    try {
      // Call backend API to downgrade user in database
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch(`http://localhost:5000/api/profile/${userId}/downgrade`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to downgrade from premium');
      }
      
      const result = await response.json();
      
      // Update local state
      setIsPremium(false);
      setPremiumPlan(null);
      localStorage.removeItem('isPremium');
      localStorage.removeItem('premiumPlan');
      
      // Update user data
      const updatedUser = { ...user, premium: false, plan: null };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Show success message
      alert('Successfully downgraded to basic plan. You can upgrade again anytime!');
      
      return result;
    } catch (error) {
      console.error('Premium downgrade error:', error);
      alert('Failed to downgrade from premium. Please try again.');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isPremium, 
      premiumPlan,
      user,
      token,
      login, 
      logout, 
      upgradeToPremium,
      downgradeToBasic
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
