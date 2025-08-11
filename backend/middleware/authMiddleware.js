// backend/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);
    
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Authentication failed: No token provided' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    
    // Add the user info to the request
    // Support multiple possible payload shapes: { id }, { userId }, { _id }
    const extractedId = decoded?.id || decoded?.userId || decoded?._id;
    if (!extractedId) {
      console.error('Auth middleware error: Could not extract user id from token payload');
      return res.status(401).json({ message: 'Authentication failed: Invalid token payload' });
    }
    req.user = { id: extractedId };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Authentication failed: Invalid token' });
  }
};
