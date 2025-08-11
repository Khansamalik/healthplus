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

  const login = (userData, authToken) => {
    setIsAuthenticated(true);
    setUser(userData);
    setToken(authToken);
    
    // Save to localStorage
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    console.log('User logged in:', { userData, tokenExists: !!authToken });
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

  const upgradeToPremium = (plan) => {
    setIsPremium(true);
    setPremiumPlan(plan);
    localStorage.setItem('isPremium', 'true');
    localStorage.setItem('premiumPlan', plan);
    
    // Show success message
    alert(`Successfully upgraded to ${plan === 'pro' ? 'Pro Care' : 'Annual'} plan! You now have access to all premium features.`);
  };

  const downgradeToBasic = () => {
    setIsPremium(false);
    setPremiumPlan(null);
    localStorage.removeItem('isPremium');
    localStorage.removeItem('premiumPlan');
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
