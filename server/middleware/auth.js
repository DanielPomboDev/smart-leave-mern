const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found in header:', token);

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartleave_secret');
      console.log('Token decoded:', decoded);

      // Get user from token and populate department
      // The decoded.id corresponds to user_id in the token payload
      req.user = await User.findOne({ user_id: decoded.id })
        .populate('department_id', 'name')
        .select('-password');
      
      console.log('Authenticated user:', JSON.stringify(req.user, null, 2));

      if (!req.user) {
        console.log('User not found for decoded ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    console.log('No token found in request headers');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

module.exports = { protect };