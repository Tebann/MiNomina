/**
 * User Profile Routes
 * 
 * Routes for user profile operations:
 * - GET /api/profile - Get user profile
 * - PUT /api/profile - Update user profile
 * - PUT /api/profile/password - Change user password
 * - POST /api/profile/logout - Logout user
 */

const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  updateUserProfile, 
  changePassword,
  logoutUser 
} = require('../controllers/userProfileController');
const { protect } = require('../middlewares/authMiddleware');

// All routes are protected with auth middleware
router.use(protect);

// Get user profile
router.get('/', getUserProfile);

// Update user profile
router.put('/', updateUserProfile);

// Change password
router.put('/password', changePassword);

// Logout user
router.post('/logout', logoutUser);

module.exports = router;